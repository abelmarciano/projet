import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { frNumber } from "@/lib/format";
import { ACTION_COSTS } from "@/lib/billing/pricing";
import { listStockActors, type StockActor } from "@/lib/stock-actors.functions";
import { listAvatars, deleteAvatar } from "@/lib/catalog.functions";
import { createAdConversation } from "@/lib/ad-conversations.functions";
import { CreateActorDialog } from "@/components/CreateActorDialog";

/*
 * Galerie d'acteurs : copie de la maquette validée (landing/design/app/views/acteurs.html),
 * classes gx- de src/styles/gx-console.css, branchée sur les vrais acteurs (Growthity + les tiens).
 */

export const Route = createFileRoute("/_authenticated/galerie")({
  head: () => ({
    meta: [
      { title: "Galerie d'acteurs UGC - Growthity" },
      {
        name: "description",
        content:
          "Filtre parmi des centaines d'acteurs UGC, crée les tiens et génère une pub vidéo en quelques secondes.",
      },
      { property: "og:title", content: "Galerie d'acteurs UGC - Growthity" },
      {
        property: "og:description",
        content:
          "Filtre par genre, âge, teint et univers, ou crée ton propre acteur à partir d'une description ou d'une photo.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: GaleriePage,
});

/* ---------------------------------- data --------------------------------- */

type UnifiedActor = {
  id: string;
  key: string;
  origin: "growthity" | "mine";
  name: string;
  description: string | null;
  image: string;
  video: string | null;
  gender: "female" | "male" | "other";
  ageBucket: string | null;
  skinTone: string | null;
  style: string | null;
  ageLabel: string | null;
  tags: string[];
  haystack: string;
};

type Option = { id: string; label: string };

const norm = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

function normalizeGender(g?: string | null): "female" | "male" | "other" {
  const v = (g ?? "").toLowerCase().trim();
  if (["f", "female", "femme", "woman", "women"].includes(v)) return "female";
  if (["m", "male", "homme", "man", "men"].includes(v)) return "male";
  return "other";
}

const AGE_BUCKETS: Array<{ id: string; label: string; min: number; max: number }> = [
  { id: "18-24", label: "18-24 ans", min: 18, max: 24 },
  { id: "25-34", label: "25-34 ans", min: 25, max: 34 },
  { id: "35-44", label: "35-44 ans", min: 35, max: 44 },
  { id: "45+", label: "45 ans et +", min: 45, max: 200 },
];

function ageBucketOf(range?: string | null): string | null {
  if (!range) return null;
  const m = range.match(/\d+/);
  if (!m) return null;
  const n = Number(m[0]);
  return AGE_BUCKETS.find((b) => n >= b.min && n <= b.max)?.id ?? null;
}

const SKIN_TONES: Option[] = [
  { id: "claire", label: "Claire" },
  { id: "moyenne", label: "Moyenne" },
  { id: "mate", label: "Mate" },
  { id: "foncee", label: "Foncée" },
];

const UNIVERSES: Array<{ id: string; label: string; match: string[] }> = [
  { id: "beaute", label: "Beauté", match: ["beauté", "beauty", "glam", "skincare", "parfum", "cheveux"] },
  { id: "mode", label: "Mode", match: ["mode", "fashion", "chic", "streetwear", "élégante", "luxe"] },
  { id: "fitness", label: "Fitness", match: ["fitness", "sport", "musculation", "nutrition", "coach"] },
  { id: "wellness", label: "Bien-être", match: ["wellness", "bien-être", "yoga", "naturel", "santé", "méditation"] },
  { id: "tech", label: "Tech & SaaS", match: ["tech", "saas", "apps", "gadget", "startup"] },
  { id: "business", label: "Business B2B", match: ["b2b", "pro", "corporate", "executive", "finance", "immobilier", "formation", "rh"] },
  { id: "food", label: "Food & Cuisine", match: ["food", "cuisine", "chef", "café", "pâtiss", "delivery"] },
  { id: "maison", label: "Maison & Déco", match: ["maison", "déco", "jardin", "électroménager"] },
  { id: "ecommerce", label: "E-commerce", match: ["ecommerce", "e-commerce", "unboxing", "commerçante"] },
  { id: "famille", label: "Famille", match: ["famille", "maman", "bébé", "parent"] },
  { id: "gaming", label: "Gaming", match: ["gaming", "streamer", "gamer"] },
  { id: "auto", label: "Automobile", match: ["auto", "voiture", "car selfie", "automobile"] },
  { id: "voyage", label: "Voyage & Outdoor", match: ["voyage", "outdoor", "extérieur", "travel"] },
  { id: "genz", label: "Gen Z", match: ["genz", "gen z", "étudiant", "étudiante", "tiktok", "hook"] },
  { id: "creatif", label: "Créatif & Artisan", match: ["créatif", "artisan", "photo", "danse", "musique"] },
];

const SHOOTING: Array<{ id: string; label: string; match: string[] }> = [
  { id: "selfie", label: "Selfie / main levée", match: ["selfie", "car selfie", "face caméra", "natif"] },
  { id: "studio", label: "Studio / bureau", match: ["studio", "bureau", "home office", "corporate", "présentateur"] },
  { id: "maison", label: "À la maison", match: ["chez elle", "chez lui", "chambre", "cuisine", "appartement", "salon", "cocon"] },
  { id: "exterieur", label: "Extérieur", match: ["extérieur", "street", "urbain", "jardin", "plage", "outdoor"] },
];

const matchAny = (hay: string, words: string[]) => words.some((w) => hay.includes(norm(w)));

/** « Univers · Prise de vue » affiché sous le nom, déduit des mêmes règles que les filtres. */
function actorCaption(a: UnifiedActor): string {
  if (a.origin === "mine") return "Mon acteur";
  const uni = UNIVERSES.find((u) => matchAny(a.haystack, u.match))?.label;
  const shot = SHOOTING.find((s) => matchAny(a.haystack, s.match))?.label;
  const parts = [uni, shot].filter(Boolean) as string[];
  return parts.length ? parts.join(" · ") : a.style ?? "";
}

const ACTOR_COST = ACTION_COSTS.find((a) => a.code === "actor_from_photo")?.credits ?? 100;

const FAV_KEY = "growthity:favorite-actors:v1";
function loadFavs(): Set<string> {
  try {
    const raw = window.localStorage.getItem(FAV_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}
function saveFavs(s: Set<string>) {
  try {
    window.localStorage.setItem(FAV_KEY, JSON.stringify(Array.from(s)));
  } catch {}
}

/* --------------------------------- icônes -------------------------------- */

function Icon({ d, children }: { d?: string; children?: ReactNode }) {
  return (
    <svg className="gx-i" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {d ? <path d={d} /> : children}
    </svg>
  );
}
const PLUS = "M12 5v14M5 12h14";
const CHEVRON = "m6 9 6 6 6-6";
const STAR = "m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9Z";

/* ---------------------------------- page --------------------------------- */

const PAGE_SIZE = 30;

function GaleriePage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const listStock = useServerFn(listStockActors);
  const listMine = useServerFn(listAvatars);
  const delAvatar = useServerFn(deleteAvatar);
  const createConvFn = useServerFn(createAdConversation);

  // Les URL signées sont valides 7 jours : inutile de re-signer 200 médias
  // à chaque retour sur la page.
  const stockQuery = useQuery({
    queryKey: ["stock-actors"],
    queryFn: () => listStock(),
    staleTime: 10 * 60_000,
    gcTime: 30 * 60_000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
  const mineQuery = useQuery({
    queryKey: ["avatars"],
    queryFn: () => listMine(),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  const [origin, setOrigin] = useState<"all" | "growthity" | "mine">("all");
  const [query, setQuery] = useState("");
  const [genders, setGenders] = useState<Set<string>>(new Set());
  const [ages, setAges] = useState<Set<string>>(new Set());
  const [tones, setTones] = useState<Set<string>>(new Set());
  const [universes, setUniverses] = useState<Set<string>>(new Set());
  const [shoots, setShoots] = useState<Set<string>>(new Set());
  const [onlyFavs, setOnlyFavs] = useState(false);
  const [creatingActorId, setCreatingActorId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [favs, setFavs] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (typeof window !== "undefined") setFavs(loadFavs());
  }, []);

  const toggleIn = (setter: (fn: (s: Set<string>) => Set<string>) => void, id: string) =>
    setter((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const toggleFav = (id: string) =>
    setFavs((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      saveFavs(next);
      return next;
    });

  const actors: UnifiedActor[] = useMemo(() => {
    const stock = (stockQuery.data ?? []).map((a: StockActor) => ({
      id: a.id,
      key: `s:${a.id}`,
      origin: "growthity" as const,
      name: a.name,
      description: a.description,
      image: a.reference_image_url,
      video: a.preview_video_url,
      gender: normalizeGender(a.gender),
      ageBucket: ageBucketOf(a.age_range),
      ageLabel: a.age_range,
      skinTone: a.skin_tone,
      style: a.style,
      tags: a.tags ?? [],
      haystack: norm(
        [a.name, a.description, a.style, (a.tags ?? []).join(" "), a.age_range].filter(Boolean).join(" "),
      ),
    }));
    const mine = ((mineQuery.data ?? []) as any[])
      .filter((a) => a.image_url || (a.images ?? []).length)
      .map((a) => ({
        id: a.id,
        key: `m:${a.id}`,
        origin: "mine" as const,
        name: a.name,
        description: a.description ?? null,
        image: a.image_url || a.images?.[0]?.url || "",
        video: null,
        gender: normalizeGender(
          /femme|female|elle\b/i.test(a.description ?? "")
            ? "female"
            : /homme|male|il\b/i.test(a.description ?? "")
              ? "male"
              : null,
        ),
        ageBucket: ageBucketOf((a.description ?? "").match(/\d{2}\s*ans/)?.[0] ?? null),
        ageLabel: null,
        skinTone: null,
        style: "Mon acteur",
        tags: [] as string[],
        haystack: norm([a.name, a.description].filter(Boolean).join(" ")),
      }));
    return [...mine, ...stock] as UnifiedActor[];
  }, [stockQuery.data, mineQuery.data]);

  const filtered = useMemo(() => {
    const q = norm(query.trim());
    return actors.filter((a) => {
      if (origin !== "all" && a.origin !== origin) return false;
      if (onlyFavs && !favs.has(a.id)) return false;
      if (genders.size && !genders.has(a.gender)) return false;
      if (ages.size && (!a.ageBucket || !ages.has(a.ageBucket))) return false;
      if (tones.size && (!a.skinTone || !tones.has(a.skinTone))) return false;
      if (universes.size) {
        const ok = Array.from(universes).some((u) => {
          const def = UNIVERSES.find((x) => x.id === u);
          return def ? matchAny(a.haystack, def.match) : false;
        });
        if (!ok) return false;
      }
      if (shoots.size) {
        const ok = Array.from(shoots).some((s) => {
          const def = SHOOTING.find((x) => x.id === s);
          return def ? matchAny(a.haystack, def.match) : false;
        });
        if (!ok) return false;
      }
      if (q && !a.haystack.includes(q)) return false;
      return true;
    });
  }, [actors, origin, onlyFavs, favs, genders, ages, tones, universes, shoots, query]);

  const activeCount =
    genders.size +
    ages.size +
    tones.size +
    universes.size +
    shoots.size +
    (origin !== "all" ? 1 : 0) +
    (onlyFavs ? 1 : 0) +
    (query.trim() ? 1 : 0);

  const resetFilters = () => {
    setGenders(new Set());
    setAges(new Set());
    setTones(new Set());
    setUniverses(new Set());
    setShoots(new Set());
    setOrigin("all");
    setOnlyFavs(false);
    setQuery("");
  };

  // Affichage progressif (30 par 30) pendant le défilement.
  const [visible, setVisible] = useState(PAGE_SIZE);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    setVisible(PAGE_SIZE);
  }, [filtered]);
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || visible >= filtered.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible((v) => Math.min(v + PAGE_SIZE, filtered.length));
        }
      },
      { rootMargin: "600px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [visible, filtered.length]);

  const openActor = async (actor: UnifiedActor) => {
    if (creatingActorId) return;
    const raw = actor.image;
    if (!raw) {
      toast.error("Cet acteur n'a pas encore d'image.");
      return;
    }
    const absolute = raw.startsWith("http") ? raw : `${window.location.origin}${raw}`;
    window.localStorage.setItem(
      "growthity:pending-stock-actors:v1",
      JSON.stringify([{ url: absolute, name: actor.name, id: actor.id }]),
    );
    setCreatingActorId(actor.id);
    try {
      const row = await createConvFn();
      qc.invalidateQueries({ queryKey: ["ad-conversations"] });
      await navigate({
        to: "/create",
        search: { c: (row as { id: string }).id, actor: absolute, actorName: actor.name, actorId: actor.id },
      });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Impossible d'ouvrir le chat.");
      setCreatingActorId(null);
    }
  };

  const removeMine = async (a: UnifiedActor) => {
    if (!confirm(`Supprimer l'acteur « ${a.name} » ?`)) return;
    try {
      await delAvatar({ data: { id: a.id } });
      await qc.invalidateQueries({ queryKey: ["avatars"] });
      toast.success("Acteur supprimé");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erreur");
    }
  };

  const loading = stockQuery.isLoading || mineQuery.isLoading;
  const gender = genders.size === 1 ? Array.from(genders)[0] : null;
  const pickGender = (g: "female" | "male") => setGenders(gender === g ? new Set() : new Set([g]));

  return (
    <div className="gx-page">
      <div className="gx-ph">
        <div>
          <h1>Galerie d'acteurs</h1>
          <p>
            {loading ? "Acteurs Growthity" : `${frNumber(actors.length)} acteurs · acteurs Growthity`} + les tiens. Choisis un visage, il parle de ton produit.
          </p>
        </div>
        <div className="gx-pa">
          <button type="button" className="gx-btn gx-pri" onClick={() => setCreateOpen(true)}>
            <Icon d={PLUS} />Créer un acteur
          </button>
        </div>
      </div>

      <div className="gx-bar-f">
        <div className="gx-tabs">
          <div className="gx-seg" role="tablist" aria-label="Origine des acteurs">
            {(["all", "growthity", "mine"] as const).map((value) => (
              <button key={value} type="button" role="tab" aria-selected={origin === value} onClick={() => setOrigin(value)}>
                {value === "all" ? "Tous" : value === "growthity" ? "Growthity" : "Les miens"}
              </button>
            ))}
          </div>
        </div>
        <label className="gx-srch">
          <Icon><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></Icon>
          <span className="gx-sr">Rechercher un acteur…</span>
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Rechercher un acteur…" autoComplete="off" />
        </label>
        <FilterMenu label="Âge" allLabel="Tous les âges" options={AGE_BUCKETS} selected={ages}
          onToggle={(id) => toggleIn(setAges, id)} onClear={() => setAges(new Set())} />
        <FilterMenu label="Couleur de peau" allLabel="Toutes" options={SKIN_TONES} selected={tones}
          onToggle={(id) => toggleIn(setTones, id)} onClear={() => setTones(new Set())} />
        <FilterMenu label="Univers" allLabel="Tous les univers" options={UNIVERSES} selected={universes}
          onToggle={(id) => toggleIn(setUniverses, id)} onClear={() => setUniverses(new Set())} />
        <FilterMenu label="Prise de vue" allLabel="Toutes" options={SHOOTING} selected={shoots}
          onToggle={(id) => toggleIn(setShoots, id)} onClear={() => setShoots(new Set())} />
      </div>

      <div className="gx-fchips">
        <button type="button" className={genders.size === 0 && !onlyFavs ? "gx-chip gx-on" : "gx-chip"}
          onClick={() => { setGenders(new Set()); setOnlyFavs(false); }}>Tous</button>
        <button type="button" className={gender === "female" ? "gx-chip gx-on" : "gx-chip"} onClick={() => pickGender("female")}>Femme</button>
        <button type="button" className={gender === "male" ? "gx-chip gx-on" : "gx-chip"} onClick={() => pickGender("male")}>Homme</button>
        <button type="button" className={onlyFavs ? "gx-chip gx-on" : "gx-chip"} aria-pressed={onlyFavs} onClick={() => setOnlyFavs((v) => !v)}>★ Mes favoris</button>
        <span className="gx-cnt">
          {loading ? "Chargement…" : `${frNumber(filtered.length)} acteur${filtered.length > 1 ? "s" : ""}`}
          {!loading && activeCount > 0 && (
            <> · <button type="button" onClick={resetFilters}>Effacer les filtres</button></>
          )}
        </span>
      </div>

      <div className="gx-agrid">
        <button type="button" className="gx-atile gx-new" onClick={() => setCreateOpen(true)}>
          <span><Icon d={PLUS} /></span>
          <b>Créer un acteur</b>
          <small>Depuis une photo ou une description · ⚡{frNumber(ACTOR_COST)}</small>
        </button>
        {loading
          ? Array.from({ length: 7 }).map((_, i) => <div key={i} className="gx-atile" aria-hidden />)
          : filtered.slice(0, visible).map((actor, index) => (
            <ActorTile
              key={actor.key}
              actor={actor}
              caption={actorCaption(actor)}
              loading={creatingActorId === actor.id}
              isFavorite={favs.has(actor.id)}
              onToggleFavorite={() => toggleFav(actor.id)}
              onUse={() => void openActor(actor)}
              onRemove={() => void removeMine(actor)}
              priority={index < 10}
            />
          ))}
      </div>
      {!loading && visible < filtered.length && <div ref={sentinelRef} className="h-12 w-full" aria-hidden />}

      {!loading && filtered.length === 0 && (
        <div className="gx-empty">
          <b>Aucun acteur ne correspond</b>
          <p>Retire un filtre ou crée ton propre acteur.</p>
          <button type="button" className="gx-btn gx-sm" onClick={resetFilters}>Réinitialiser les filtres</button>
        </div>
      )}

      <CreateActorDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}

/* ------------------------------- menus filtres ------------------------------ */

function FilterMenu({
  label,
  allLabel,
  options,
  selected,
  onToggle,
  onClear,
}: {
  label: string;
  allLabel: string;
  options: Option[];
  selected: Set<string>;
  onToggle: (id: string) => void;
  onClear: () => void;
}) {
  const picked = options.filter((o) => selected.has(o.id));
  const text = picked.length === 0 ? label : picked.length === 1 ? picked[0].label : `${label} · ${picked.length}`;
  return (
    <DropdownMenuPrimitive.Root modal={false}>
      <DropdownMenuPrimitive.Trigger asChild>
        <button type="button" className={picked.length ? "gx-sel gx-set" : "gx-sel"} aria-label={`Filtrer par ${label.toLowerCase()}`}>
          <span>{text}</span><Icon d={CHEVRON} />
        </button>
      </DropdownMenuPrimitive.Trigger>
      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content className="gx-menu" align="start" sideOffset={6} collisionPadding={8}>
          <div className="gx-mh">{label}</div>
          <DropdownMenuPrimitive.Item asChild onSelect={() => onClear()}>
            <button type="button" role="menuitemradio" aria-checked={picked.length === 0}>{allLabel}</button>
          </DropdownMenuPrimitive.Item>
          {options.map((o) => (
            <DropdownMenuPrimitive.Item
              key={o.id}
              asChild
              onSelect={(e) => {
                // Plusieurs choix possibles : le menu reste ouvert.
                e.preventDefault();
                onToggle(o.id);
              }}
            >
              <button type="button" role="menuitemcheckbox" aria-checked={selected.has(o.id)}>{o.label}</button>
            </DropdownMenuPrimitive.Item>
          ))}
        </DropdownMenuPrimitive.Content>
      </DropdownMenuPrimitive.Portal>
    </DropdownMenuPrimitive.Root>
  );
}

/* ---------------------------------- tuile --------------------------------- */

function ActorTile({
  actor,
  caption,
  onUse,
  onRemove,
  loading,
  isFavorite,
  onToggleFavorite,
  priority = false,
}: {
  actor: UnifiedActor;
  caption: string;
  onUse: () => void;
  onRemove: () => void;
  loading?: boolean;
  isFavorite?: boolean;
  onToggleFavorite: () => void;
  priority?: boolean;
}) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hoveredRef = useRef(false);
  const pointerRef = useRef<string>("mouse");
  const [playing, setPlaying] = useState(false);
  // La balise <video> est montée dès que la tuile entre dans le viewport
  // (preload metadata uniquement) : le survol démarre alors instantanément.
  const [videoMounted, setVideoMounted] = useState(false);

  useEffect(() => {
    if (!actor.video || videoMounted) return;
    const el = cardRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVideoMounted(true);
          io.disconnect();
        }
      },
      { rootMargin: "300px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [actor.video, videoMounted]);

  const tryPlay = () => {
    const v = videoRef.current;
    if (!v || !hoveredRef.current) return;
    v.muted = true;
    const p = v.play();
    if (p && typeof p.then === "function") {
      p.then(() => hoveredRef.current && setPlaying(true)).catch(() => setPlaying(false));
    }
  };

  const enter = () => {
    if (!actor.video) return;
    hoveredRef.current = true;
    if (!videoMounted) {
      setVideoMounted(true);
      return;
    }
    const v = videoRef.current;
    if (v) {
      v.preload = "auto";
      if (v.readyState < 2) {
        try {
          v.load();
        } catch {}
      }
    }
    tryPlay();
  };
  const leave = () => {
    hoveredRef.current = false;
    setPlaying(false);
    videoRef.current?.pause();
  };

  // Souris : un clic sur la tuile utilise l'acteur (comme la maquette).
  // Tactile : un premier appui lance / coupe l'aperçu vidéo, « Utiliser cet acteur » apparaît.
  const onTileClick = () => {
    if (pointerRef.current === "touch" && actor.video) {
      if (hoveredRef.current) leave();
      else enter();
      return;
    }
    onUse();
  };

  return (
    <div
      ref={cardRef}
      className="gx-atile"
      onPointerDown={(e) => { pointerRef.current = e.pointerType; }}
      onMouseEnter={enter}
      onMouseLeave={leave}
      onClick={onTileClick}
    >
      <img
        src={actor.image}
        alt={`Acteur ${actor.name}`}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        decoding="async"
        width={720}
        height={960}
      />
      {actor.video && videoMounted && (
        <video
          ref={videoRef}
          src={actor.video}
          muted
          playsInline
          loop
          preload="metadata"
          onLoadedMetadata={tryPlay}
          onLoadedData={tryPlay}
          onCanPlay={tryPlay}
          onPlaying={() => hoveredRef.current && setPlaying(true)}
          onPause={() => setPlaying(false)}
          className={playing ? "gx-on" : undefined}
        />
      )}
      <button
        type="button"
        className="gx-fav"
        aria-pressed={!!isFavorite}
        aria-label={isFavorite ? `Retirer ${actor.name} des favoris` : `Ajouter ${actor.name} aux favoris`}
        onClick={(e) => {
          e.stopPropagation();
          onToggleFavorite();
        }}
      >
        <Icon d={STAR} />
      </button>
      {actor.origin === "mine" && (
        <DropdownMenuPrimitive.Root modal={false}>
          <DropdownMenuPrimitive.Trigger asChild>
            <button type="button" className="gx-fav gx-amenu" aria-label={`Options de ${actor.name}`} onClick={(e) => e.stopPropagation()}>
              <Icon><circle cx="5" cy="12" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /></Icon>
            </button>
          </DropdownMenuPrimitive.Trigger>
          <DropdownMenuPrimitive.Portal>
            <DropdownMenuPrimitive.Content className="gx-menu" align="start" sideOffset={6} collisionPadding={8}
              onClick={(e) => e.stopPropagation()}>
              <DropdownMenuPrimitive.Item asChild onSelect={() => onRemove()}>
                <button type="button">Supprimer l'acteur</button>
              </DropdownMenuPrimitive.Item>
            </DropdownMenuPrimitive.Content>
          </DropdownMenuPrimitive.Portal>
        </DropdownMenuPrimitive.Root>
      )}
      <div>
        <b>{actor.name}</b>
        {caption && <small>{caption}</small>}
      </div>
      <button
        type="button"
        className="gx-use"
        disabled={loading}
        onClick={(e) => {
          e.stopPropagation();
          onUse();
        }}
      >
        {loading ? "Ouverture…" : "Utiliser cet acteur"}
      </button>
    </div>
  );
}
