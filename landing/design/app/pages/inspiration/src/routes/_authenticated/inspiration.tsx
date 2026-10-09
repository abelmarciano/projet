import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useInfiniteQuery, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { z } from "zod";
import { frNumber } from "@/lib/format";
import { frInt } from "@/lib/reference-reach";
import {
  listReferenceAds, listMyReferenceFavorites, toggleReferenceFavorite, type ReferenceAd,
} from "@/lib/reference-ads.functions";
import {
  CONCEPTS, STYLES, SEGMENTS, OBJECTIVES, RATIOS, WINNER_THRESHOLD,
  conceptsFor, stylesFor, sectorsFor,
  sectorLabel, conceptLabel, styleLabel, objectiveLabel, segmentLabel,
  type RefMediaType, type RefSegment,
} from "@/lib/reference-taxonomy";
import { VideoPoster } from "@/components/VideoPoster";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem,
  DropdownMenuSeparator, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/*
 * Galerie d'inspiration : copie de la maquette validée (landing/design/app/views/inspiration.html),
 * classes gx- de src/styles/gx-console.css, branchée sur reference_ads (pubs approuvées).
 */

const searchSchema = z.object({ type: z.enum(["image", "video", "feed"]).catch("image").default("image") });

export const Route = createFileRoute("/_authenticated/inspiration")({
  validateSearch: (s) => searchSchema.parse(s),
  head: () => ({
    meta: [
      { title: "Galerie d'inspiration - Growthity" },
      { name: "description", content: "Des pubs Meta qui performent, classées par secteur, concept et style, à recréer pour ton produit." },
      { property: "og:title", content: "Galerie d'inspiration - Growthity" },
      { property: "og:description", content: "Pubs image et vidéo de référence à recréer pour ton produit." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: InspirationPage,
});

const PENDING_KEY = "growthity:pending-reference-ad:v1";
type Sort = "newest" | "winner" | "featured";
const SORT_LABEL: Record<Sort, string> = {
  winner: "Les plus performantes",
  newest: "Les plus récentes",
  featured: "Sélection",
};

const daysSince = (d: string | null) => (d ? Math.max(1, Math.round((Date.now() - new Date(d).getTime()) / 86_400_000)) : null);
const frDate = (d: string | null) => (d ? new Date(d).toLocaleDateString("fr-FR") : "…");
const plural = (n: number, w: string) => `${frNumber(n)} ${w}${n > 1 ? "s" : ""}`;

/** Répartition par âge (3 tranches principales) et par genre, depuis reach_breakdown. */
function reachStats(rows: ReferenceAd["reach_breakdown"]) {
  if (!rows?.length) return null;
  let male = 0, female = 0, total = 0;
  const byAge = new Map<string, number>();
  for (const r of rows) {
    const t = (r.male ?? 0) + (r.female ?? 0) + (r.unknown ?? 0);
    male += r.male ?? 0; female += r.female ?? 0; total += t;
    const k = r.age_range ?? "?";
    byAge.set(k, (byAge.get(k) ?? 0) + t);
  }
  if (!total) return null;
  const pct = (n: number) => Math.round((n / total) * 100);
  const ages = [...byAge.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([age, t]) => ({ age, pct: pct(t) }));
  const gender = female >= male
    ? `Femmes ${pct(female)} % · Hommes ${pct(male)} %`
    : `Hommes ${pct(male)} % · Femmes ${pct(female)} %`;
  return { ages, gender };
}

/* ---------- icônes (dessin de la maquette) ---------- */

const IcoChevron = () => (
  <svg className="gx-i" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
);
const IcoStar = ({ filled }: { filled?: boolean }) => (
  <svg className="gx-i" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9Z" /></svg>
);
const IcoSpark = () => (
  <svg className="gx-i" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6" /></svg>
);

/* ---------- média d'une pub ---------- */

/**
 * Image fixe d'une pub, avec replis successifs :
 * image → media_url puis thumbnail_url ; vidéo → thumbnail_url puis 1re image de la vidéo (VideoPoster).
 * Une URL vide (signature impossible) ou en erreur (lien Meta expiré, fichier absent) passe au repli suivant,
 * et en dernier recours on affiche « Aperçu indisponible » au lieu d'une carte grise.
 */
function RefStill({ ad, eager }: { ad: ReferenceAd; eager?: boolean }) {
  const isVideo = ad.media_type === "video";
  const candidates = useMemo(() => {
    const list = isVideo ? [ad.thumbnail_url] : [ad.media_url, ad.thumbnail_url];
    return [...new Set(list.filter((u): u is string => !!u))];
  }, [isVideo, ad.media_url, ad.thumbnail_url]);
  const [idx, setIdx] = useState(0);
  const candKey = candidates.join("|");
  useEffect(() => { setIdx(0); }, [ad.id, candKey]);

  const src = candidates[idx];
  if (src) {
    return (
      <img key={src} src={src} alt={ad.headline ?? ad.brand_name ?? "Publicité"}
        loading={eager ? "eager" : "lazy"} decoding="async" onError={() => setIdx((i) => i + 1)} />
    );
  }
  if (isVideo && ad.media_url) return <VideoPoster src={ad.media_url} className="gx-vp" />;
  return <span className="gx-noimg">Aperçu indisponible</span>;
}

/* ---------- page ---------- */

function InspirationPage() {
  const { type } = Route.useSearch();
  const navigate = useNavigate({ from: "/inspiration" });
  const isFeed = type === "feed";
  const media: RefMediaType = isFeed ? "image" : (type as RefMediaType);

  const [concepts, setConcepts] = useState<string[]>([]);
  const [segment, setSegment] = useState<RefSegment | null>(null);
  const [sector, setSector] = useState("");
  const [style, setStyle] = useState("");
  const [objective, setObjective] = useState("");
  const [ratio, setRatio] = useState("");
  const [sort, setSort] = useState<Sort>("winner");
  const [favOnly, setFavOnly] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const asideRef = useRef<HTMLElement>(null);

  const list = useServerFn(listReferenceAds);
  const favFn = useServerFn(listMyReferenceFavorites);
  const toggleFn = useServerFn(toggleReferenceFavorite);
  const qc = useQueryClient();

  const switchType = (t: "image" | "video" | "feed") => {
    setConcepts([]); setStyle(""); setSelectedId(null);
    navigate({ search: { type: t } });
  };

  // Le flux reste trié du plus récent au plus ancien, comme avant.
  const filters = {
    mediaType: (isFeed ? "feed" : media) as "image" | "video" | "feed",
    segment,
    sector: sector || null,
    concepts,
    style: style || null,
    objective: (objective || null) as any,
    ratio: (ratio || null) as any,
    sort: isFeed ? ("newest" as Sort) : sort,
    favoritesOnly: favOnly,
  };
  const query = useInfiniteQuery({
    queryKey: ["reference-ads", filters],
    queryFn: ({ pageParam }) => list({ data: { ...filters, cursor: pageParam, limit: 24 } }),
    initialPageParam: 0 as number,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
    staleTime: 60_000,
  });
  const favs = useQuery({ queryKey: ["reference-favs"], queryFn: () => favFn(), staleTime: 60_000 });
  const favSet = useMemo(() => new Set(favs.data ?? []), [favs.data]);

  const items: ReferenceAd[] = query.data?.pages.flatMap((p) => p.items) ?? [];
  const total = query.data?.pages[0]?.total ?? 0;
  const selected = items.find((a) => a.id === selectedId) ?? items[0] ?? null;

  const conceptList = isFeed ? CONCEPTS : conceptsFor(media);
  const styleList = isFeed ? STYLES : stylesFor(media);
  const sectorList = sectorsFor(segment);
  const moreCount = [segment, style, objective, ratio].filter(Boolean).length;

  const toggleFav = async (id: string) => {
    const on = !favSet.has(id);
    try {
      await toggleFn({ data: { id, on } });
      qc.setQueryData<string[]>(["reference-favs"], (o) => (on ? [...(o ?? []), id] : (o ?? []).filter((x) => x !== id)));
      if (favOnly) qc.invalidateQueries({ queryKey: ["reference-ads"] });
      toast.success(on ? "Ajoutée à tes favoris" : "Retirée de tes favoris");
    } catch (e) { toast.error((e as Error).message); }
  };

  const recreate = (ad: ReferenceAd) => {
    try {
      window.localStorage.setItem(PENDING_KEY, JSON.stringify({ id: ad.id, mediaType: ad.media_type, concepts: ad.concepts, style: ad.style, headline: ad.headline, at: Date.now() }));
    } catch { /* stockage indisponible */ }
    toast.success("Référence sélectionnée — décris ton produit dans le chat");
    navigate({ to: "/create" });
  };

  const pick = (id: string) => {
    setSelectedId(id);
    // Sur une colonne (≤ 1060 px), le détail est sous la grille : on y descend.
    if (typeof window !== "undefined" && window.innerWidth <= 1060) {
      setTimeout(() => asideRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
    }
  };

  const pickSegment = (v: RefSegment | null) => {
    setSegment(v);
    if (v && sector && !sectorsFor(v).some((s) => s.slug === sector)) setSector("");
  };
  const resetMore = () => { setSegment(null); setStyle(""); setObjective(""); setRatio(""); };

  /* ---------- détail ---------- */

  const days = selected ? daysSince(selected.first_seen_at) : null;
  const reach = selected ? reachStats(selected.reach_breakdown) : null;
  const why = selected?.public_analysis?.why_it_works ?? [];
  const tagLine = selected
    ? [
      sectorLabel(selected.sector),
      ...selected.concepts.map((c) => conceptLabel(c)),
      styleLabel(selected.style),
      objectiveLabel(selected.objective),
      selected.ratio,
    ].filter(Boolean).join(" · ")
    : "";

  return (
    <div className="gx-page">
      <header className="gx-ph">
        <div>
          <h1>Galerie d'inspiration</h1>
          <p>Des pubs qui performent. Choisis-en une, on la recrée pour ton produit.</p>
        </div>
        <div className="gx-pa">
          <button type="button" className={favOnly ? "gx-btn gx-pri" : "gx-btn"} aria-pressed={favOnly}
            onClick={() => { setFavOnly((v) => !v); setSelectedId(null); }}>★ Mes favoris</button>
        </div>
      </header>

      <div className="gx-bar-f">
        <div className="gx-seg" role="tablist" aria-label="Type de pub">
          {([["image", "Images"], ["video", "Vidéos"], ["feed", "Flux"]] as const).map(([v, l]) => (
            <button key={v} type="button" role="tab" aria-selected={type === v} onClick={() => switchType(v)}>{l}</button>
          ))}
        </div>

        {isFeed ? (
          <button type="button" className="gx-sel" disabled title="Le flux montre les pubs repérées des plus récentes aux plus anciennes.">
            <span>{SORT_LABEL.newest}</span><IcoChevron />
          </button>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button type="button" className="gx-sel" aria-label="Trier"><span>{SORT_LABEL[sort]}</span><IcoChevron /></button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="console-app-portal">
              <DropdownMenuRadioGroup value={sort} onValueChange={(v) => setSort(v as Sort)}>
                {(["winner", "newest", "featured"] as Sort[]).map((s) => (
                  <DropdownMenuRadioItem key={s} value={s}>{SORT_LABEL[s]}</DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Filtres sans équivalent en puces (segment, style, objectif, format) : menu discret. */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button type="button" className={moreCount ? "gx-sel gx-set" : "gx-sel"}>
              <span>{moreCount ? `Plus de filtres · ${moreCount}` : "Plus de filtres"}</span><IcoChevron />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="console-app-portal max-h-[70vh] w-64 overflow-y-auto">
            <DropdownMenuLabel>Segment</DropdownMenuLabel>
            <DropdownMenuRadioGroup value={segment ?? ""} onValueChange={(v) => pickSegment((v || null) as RefSegment | null)}>
              <DropdownMenuRadioItem value="">Tous</DropdownMenuRadioItem>
              {SEGMENTS.map((s) => <DropdownMenuRadioItem key={s.slug} value={s.slug}>{s.label}</DropdownMenuRadioItem>)}
            </DropdownMenuRadioGroup>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Style</DropdownMenuLabel>
            <DropdownMenuRadioGroup value={style} onValueChange={setStyle}>
              <DropdownMenuRadioItem value="">Tous les styles</DropdownMenuRadioItem>
              {styleList.map((s) => <DropdownMenuRadioItem key={s.slug} value={s.slug}>{s.label}</DropdownMenuRadioItem>)}
            </DropdownMenuRadioGroup>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Objectif</DropdownMenuLabel>
            <DropdownMenuRadioGroup value={objective} onValueChange={setObjective}>
              <DropdownMenuRadioItem value="">Tous les objectifs</DropdownMenuRadioItem>
              {OBJECTIVES.map((s) => <DropdownMenuRadioItem key={s.slug} value={s.slug}>{s.label}</DropdownMenuRadioItem>)}
            </DropdownMenuRadioGroup>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Format</DropdownMenuLabel>
            <DropdownMenuRadioGroup value={ratio} onValueChange={setRatio}>
              <DropdownMenuRadioItem value="">Tous les formats</DropdownMenuRadioItem>
              {RATIOS.map((r) => <DropdownMenuRadioItem key={r} value={r}>{r}</DropdownMenuRadioItem>)}
            </DropdownMenuRadioGroup>
            {moreCount > 0 && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={resetMore}>Réinitialiser ces filtres</DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="gx-fblock">
        <span className="gx-lbl">Concepts</span>
        <div className="gx-chips">
          <button type="button" className={concepts.length === 0 ? "gx-chip gx-on" : "gx-chip"} aria-pressed={concepts.length === 0}
            onClick={() => setConcepts([])}>Tous</button>
          {conceptList.map((c) => {
            const active = concepts.includes(c.slug);
            return (
              <button key={c.slug} type="button" className={active ? "gx-chip gx-on" : "gx-chip"} aria-pressed={active}
                onClick={() => setConcepts((o) => (active ? o.filter((x) => x !== c.slug) : [...o, c.slug]))}>
                {c.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="gx-fblock">
        <span className="gx-lbl">Secteurs</span>
        <div className="gx-chips">
          <button type="button" className={!sector ? "gx-chip gx-on" : "gx-chip"} aria-pressed={!sector} onClick={() => setSector("")}>
            {segment ? `Tous · ${segmentLabel(segment)}` : "Tous"}
          </button>
          {sectorList.map((s) => (
            <button key={s.slug} type="button" className={sector === s.slug ? "gx-chip gx-on" : "gx-chip"} aria-pressed={sector === s.slug}
              onClick={() => setSector(sector === s.slug ? "" : s.slug)}>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="gx-ins-l">
        <div>
          {query.isLoading ? (
            <div className="gx-empty"><b>Chargement des pubs…</b></div>
          ) : query.isError ? (
            <div className="gx-empty">
              <b>Impossible de charger la galerie</b>
              <p>{(query.error as Error).message}</p>
              <button type="button" className="gx-btn gx-sm" onClick={() => void query.refetch()}>Réessayer</button>
            </div>
          ) : items.length === 0 ? (
            <div className="gx-empty">
              <b>{favOnly ? "Aucun favori pour l'instant" : "Aucune pub pour ce filtre"}</b>
              <p>{favOnly ? "Clique « Sauvegarder » sur une pub pour la retrouver ici." : "Essaie un autre concept ou secteur."}</p>
            </div>
          ) : (
            <>
              <div className="gx-igrid">
                {items.map((ad, i) => (
                  <RefCard key={ad.id} ad={ad} eager={i < 8} feed={isFeed}
                    active={selected?.id === ad.id} onPick={() => pick(ad.id)} />
                ))}
              </div>
              <div className="gx-ins-more">
                <span>{frNumber(items.length)} sur {plural(total, "publicité")}</span>
                {query.hasNextPage && (
                  <button type="button" className="gx-btn gx-sm" onClick={() => void query.fetchNextPage()} disabled={query.isFetchingNextPage}>
                    {query.isFetchingNextPage ? "Chargement…" : "Charger plus"}
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        <aside className="gx-ins-d" ref={asideRef} aria-label="Détail de la pub">
          {!selected ? (
            <div className="gx-empty">
              <b>{query.isLoading ? "Chargement…" : "Aucune pub sélectionnée"}</b>
              <p>Choisis une pub dans la galerie pour voir son détail.</p>
            </div>
          ) : (
            <>
              {selected.media_type === "video" && selected.media_url ? (
                <video key={selected.id}
                  src={selected.thumbnail_url ? selected.media_url : `${selected.media_url}#t=0.1`}
                  poster={selected.thumbnail_url ?? undefined}
                  controls muted loop playsInline preload="metadata" />
              ) : (
                <span className="gx-dmed"><RefStill key={selected.id} ad={selected} eager /></span>
              )}
              <div className="gx-lbl">{tagLine}</div>
              <h3>{selected.headline ? `« ${selected.headline} »` : selected.brand_name ?? "Publicité"}</h3>
              <dl>
                <dt>Diffusée</dt>
                <dd title={selected.first_seen_at ? `Du ${frDate(selected.first_seen_at)} au ${frDate(selected.last_seen_at)}` : undefined}>
                  {days ? `depuis ${plural(days, "jour")}` : "—"}
                </dd>
                <dt>Copies actives</dt>
                <dd className="gx-num">{frNumber(selected.active_copies_count ?? 0)}</dd>
                <dt>Portée UE</dt>
                <dd className="gx-num" title={reach?.gender}>{selected.eu_total_reach ? frInt(selected.eu_total_reach) : "—"}</dd>
              </dl>
              {reach ? (
                <div className="gx-bars" title={reach.gender}>
                  {reach.ages.map((a) => (
                    <div key={a.age}>
                      <span>{a.age} ans</span>
                      <i style={{ "--gx-w": `${a.pct}%` } as any} />
                      <b>{a.pct} %</b>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="gx-none">Répartition par âge non publiée par Meta pour cette pub.</p>
              )}
              <p className="gx-why">
                <b>Pourquoi ça marche</b>
                {why.length ? why.join(" ") : "Bientôt : l'analyse de cette pub n'est pas encore prête."}
              </p>
              {selected.source_url && (
                <a className="gx-src" href={selected.source_url} target="_blank" rel="noopener noreferrer">Voir sur la Meta Ads Library ↗</a>
              )}
              <div className="gx-row">
                <button type="button" className="gx-btn" aria-pressed={favSet.has(selected.id)} onClick={() => void toggleFav(selected.id)}>
                  <IcoStar filled={favSet.has(selected.id)} />{favSet.has(selected.id) ? "Sauvegardée" : "Sauvegarder"}
                </button>
                <button type="button" className="gx-btn gx-pri" onClick={() => recreate(selected)}>
                  <IcoSpark />Recréer pour mon produit
                </button>
              </div>
            </>
          )}
        </aside>
      </div>
    </div>
  );
}

/* ---------- carte ---------- */

function RefCard({ ad, eager, feed, active, onPick }: { ad: ReferenceAd; eager?: boolean; feed?: boolean; active: boolean; onPick: () => void }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const isVideo = ad.media_type === "video" && !!ad.media_url;
  const days = daysSince(ad.first_seen_at);
  const enter = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = true;
    v.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
  };
  const leave = () => { setPlaying(false); videoRef.current?.pause(); };
  const name = ad.brand_name || ad.headline || "Publicité";
  const meta = [
    sectorLabel(ad.sector),
    days ? plural(days, "jour") : null,
    feed && days !== null && days < 7 ? "nouveau" : null,
  ].filter(Boolean).join(" · ");

  return (
    <a className={active ? "gx-icard gx-on" : "gx-icard"} role="button" tabIndex={0} aria-pressed={active}
      title={ad.headline ?? undefined}
      onClick={onPick}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onPick(); } }}
      onMouseEnter={isVideo ? enter : undefined} onMouseLeave={isVideo ? leave : undefined}>
      <span className="gx-imed">
        <RefStill ad={ad} eager={eager} />
        {isVideo && (
          <video ref={videoRef} src={ad.media_url} muted playsInline loop preload="none"
            className={playing ? "gx-hov gx-play" : "gx-hov"} aria-hidden="true" />
        )}
        {isVideo && !playing && <span className="gx-vbadge" aria-label="Vidéo">▶</span>}
      </span>
      {ad.winner_score >= WINNER_THRESHOLD && <span className="gx-win">Gagnante</span>}
      <div><b>{name}</b><small>{meta}</small></div>
    </a>
  );
}
