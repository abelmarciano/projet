import {
  Check,
  Plus,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  ExternalLink,
  Eye,
  Info,
  Layers3,
  Play,
  Radar,
  TrendingUp,
  X,
  Users2,
  SlidersHorizontal,
} from "@/components/icons";
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useEffect, useState, type ReactNode } from "react";
import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures";
import { ConsoleEmpty } from "@/components/console/ConsoleEmpty";
import { StatTile } from "@/components/console/StatTile";
import { pickProbableWinners, toCompetitorRef, useCompetitorRefs } from "@/lib/chat/competitor-refs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";

type Ad = {
  id?: string;
  pageName?: string;
  pageId?: string | null;
  pageLogoUrl?: string | null;
  body?: string;
  title?: string;
  description?: string;
  destination?: string;
  startedAt?: string | null;
  endedAt?: string | null;
  runningDays?: number;
  stillActive?: boolean;
  platforms?: string[];
  euReach?: number | null;
  signal?: "fort" | "prometteur" | "à surveiller";
  signalReasons?: string[];
  libraryUrl?: string;
  mediaUrl?: string | null;
  mediaType?: "image" | "video" | null;
};

type Output = {
  ok?: boolean;
  message?: string;
  query?: string;
  queries?: string[];
  country?: string;
  adsFound?: number;
  matchesScanned?: number;
  medianRuntimeDays?: number;
  longestRunningDays?: number;
  activeCount?: number;
  advertisers?: string[];
  ads?: Ad[];
  coverageNote?: string;
};

const platformLabels: Record<string, string> = {
  facebook: "Facebook",
  instagram: "Instagram",
  messenger: "Messenger",
  audience_network: "Audience Network",
};

function formatDate(value?: string | null) {
  if (!value) return "Aujourd’hui";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", year: "numeric" }).format(date);
}

/** Pastille console (gx-st) du signal : vert fort, violet prometteur, gris à surveiller. */
function signalClasses(signal?: Ad["signal"]) {
  if (signal === "fort") return "gx-st gx-on";
  if (signal === "prometteur") return "gx-st gx-q";
  return "gx-st gx-off";
}

export function CompetitorAdsCard({
  output,
  onSubmit,
}: {
  output?: Record<string, unknown>;
  onSubmit?: (text: string) => void;
}) {
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [showFilters, setShowFilters] = useState(false);
  const refsApi = useCompetitorRefs();
  const o = (output ?? {}) as Output;
  if (!output) {
    return (
      <div className="gx-tool-wait" role="status">
        <Radar className="gx-i animate-pulse" aria-hidden />
        Je parcours la bibliothèque publicitaire et récupère les visuels… (jusqu’à 2 minutes)
      </div>
    );
  }
  if (o.ok === false) {
    return (
      <ConsoleEmpty compact icon={Radar} title={o?.message ?? "Aucun résultat dans la bibliothèque publicitaire."} />
    );
  }
  const allAds = Array.isArray(o.ads) ? o.ads : [];
  if (!allAds.length) return null;
  const ads = applyFilters(allAds, filters);
  const refFor = (ad: Ad, i: number) => toCompetitorRef(ad as Record<string, unknown>, `${ad.pageName ?? "ad"}-${i}`);
  const selectedCount = refsApi ? ads.filter((ad, i) => refsApi.selectedIds.has(refFor(ad, i).id)).length : 0;
  const winners = pickProbableWinners(
    ads.map((ad, i) => ({ ...refFor(ad, i), signal: ad.signal })),
    3,
    o.queries?.length ? o.queries.join(" ") : o.query ?? "",
  );
  const inspire = () => {
    if (!winners.length) return;
    const text = "Inspire-toi de ces gagnants probables pour me proposer une stratégie créative pour mon produit.";
    if (refsApi) refsApi.sendWithRefs(text, winners);
    else onSubmit?.(text);
  };

  return (
    <div className="gx-kard gx-cads">
      <div className="gx-cads-h">
        <div className="gx-cads-t">
          <Radar className="gx-i" aria-hidden />
          <h3>Ce que fait la concurrence</h3>
          <span className="gx-chip gx-meta gx-cads-chip">
            <MetaLogo className="gx-i" />
            Meta Ads Library
          </span>
          {o.query ? (
            <span className="gx-chip gx-cads-chip gx-cads-q">
              {o.query}{o.country ? ` · ${o.country}` : ""}
            </span>
          ) : null}
        </div>

        <div className="gx-cads-k">
          <Stat label="Pubs retenues" value={String(o.adsFound ?? ads.length)} />
          <Stat label="Annonceurs" value={String(o.advertisers?.length ?? 0)} />
          <Stat label="Encore actives" value={String(o.activeCount ?? 0)} />
          <Stat label="Durée médiane" value={`${o.medianRuntimeDays ?? 0} j`} />
        </div>

        {typeof o.matchesScanned === "number" && o.matchesScanned > ads.length ? (
          <p className="gx-hint">
            {o.matchesScanned.toLocaleString("fr-FR")} résultats parcourus, puis triés pour varier les annonceurs.
          </p>
        ) : null}
      </div>

      <div className="gx-cads-b">
        <div className="gx-cads-bar">
          <div className="gx-cads-bt">
            <b>Créations repérées</b>
            <small>Fais glisser pour comparer les publicités.</small>
          </div>
          <button type="button" className="gx-btn gx-sm" aria-pressed={showFilters} aria-expanded={showFilters} onClick={() => setShowFilters((v) => !v)}>
            <SlidersHorizontal className="gx-i" />
            Filtres{activeFilterCount(filters) ? ` (${activeFilterCount(filters)})` : ""}
          </button>
          <span className="gx-pill gx-num">
            {selectedCount > 0
              ? `${selectedCount} sélectionnée${selectedCount > 1 ? "s" : ""} / ${ads.length}`
              : `${ads.length} création${ads.length > 1 ? "s" : ""}`}
          </span>
        </div>

        {showFilters ? (
          <FilterBar
            country={(o.country ?? "FR").toUpperCase()}
            onCountry={(c) => {
              const q = o.queries?.length ? o.queries.join(", ") : o.query ?? "";
              onSubmit?.(`Refais la même veille Meta Ads Library (${q}) en ${countryName(c)} (${c}).`);
            }}
            ads={allAds}
            filters={filters}
            onChange={(next) => { setFilters(next); setLightboxIndex(null); carouselApi?.scrollTo(0); }}
          />
        ) : null}

        {!ads.length ? (
          <ConsoleEmpty
            compact
            icon={SlidersHorizontal}
            title="Aucune publicité ne correspond à ces filtres."
            action={
              <button type="button" className="gx-btn gx-sm" onClick={() => setFilters(defaultFilters)}>
                Réinitialiser
              </button>
            }
          />
        ) : (
        <Carousel
          key={JSON.stringify(filters)}
          setApi={setCarouselApi}
          opts={{ align: "start", containScroll: "trimSnaps", dragFree: true }}
          plugins={[WheelGesturesPlugin({ forceWheelAxis: "x" })]}
        >
          <CarouselContent className="-ml-3 cursor-grab touch-pan-y active:cursor-grabbing">
            {ads.map((ad, i) => (
              <CarouselItem
                key={ad.id ?? `${ad.pageName}-${i}`}
                className="basis-[85%] pl-3 sm:basis-[46%] lg:basis-[33%]"
              >
                <AdDetail
                  ad={ad}
                  selected={refsApi ? refsApi.selectedIds.has(refFor(ad, i).id) : false}
                  onToggle={refsApi ? () => refsApi.toggle(refFor(ad, i)) : undefined}
                  onOpen={() => setLightboxIndex(i)}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="gx-cads-nav">
            <div className="gx-cads-dots" aria-hidden="true">
              {ads.map((ad, index) => (
                <button
                  key={ad.id ?? index}
                  type="button"
                  className="gx-cads-dot"
                  onClick={() => carouselApi?.scrollTo(index)}
                  tabIndex={-1}
                />
              ))}
            </div>
            <div className="gx-cads-arr">
              <CarouselPrevious className="gx-ib gx-sm static translate-y-0" />
              <CarouselNext className="gx-ib gx-sm static translate-y-0" />
            </div>
          </div>
        </Carousel>
        )}
      </div>

      <div className="gx-cads-f">
        {o.coverageNote ? (
          <p className="gx-cads-note">
            <Info className="gx-i" aria-hidden />
            {o.coverageNote}
          </p>
        ) : null}

        {onSubmit ? (
          <div className="gx-kf">
            <button type="button" className="gx-btn gx-sm gx-pri" onClick={inspire} disabled={!winners.length}>
              {winners.length
                ? `Me proposer une stratégie (${winners.length} pub${winners.length > 1 ? "s" : ""} en référence)`
                : "Aucun gagnant probable (diffusion trop courte)"}
            </button>
            <button
              type="button"
              className="gx-btn gx-sm"
              onClick={() => onSubmit("Propose-moi un angle qui se différencie volontairement de cette concurrence.")}
            >
              Se différencier
            </button>
          </div>
        ) : null}
      </div>

      {lightboxIndex !== null && ads[lightboxIndex] ? (
        <AdLightbox
          ads={ads}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={(next) => setLightboxIndex(Math.min(ads.length - 1, Math.max(0, next)))}
          selected={refsApi ? refsApi.selectedIds.has(refFor(ads[lightboxIndex], lightboxIndex).id) : false}
          onToggle={refsApi ? () => refsApi.toggle(refFor(ads[lightboxIndex], lightboxIndex)) : undefined}
        />
      ) : null}
    </div>
  );
}

function MetaLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M16.7 6.5c-1.8 0-3.1 1.1-4.7 3.4C10.4 7.6 9.1 6.5 7.3 6.5 4.6 6.5 3 9 3 11.9c0 2.8 1.5 5.6 4 5.6 1.9 0 3.2-1.2 5-4.1 1.8 2.9 3.1 4.1 5 4.1 2.5 0 4-2.8 4-5.6 0-2.9-1.6-5.4-4.3-5.4zM7 15.3c-1.2 0-1.9-1.7-1.9-3.4S5.8 8.7 7 8.7c1.4 0 2.5 1.3 4 3.9-1.5 1.7-2.7 2.7-4 2.7zm10 0c-1.3 0-2.5-1-4-2.7 1.5-2.6 2.6-3.9 4-3.9 1.2 0 1.9 1.5 1.9 3.2s-.7 3.4-1.9 3.4z" />
    </svg>
  );
}

function AdDetail({ ad, selected, onToggle, onOpen }: { ad: Ad; selected?: boolean; onToggle?: () => void; onOpen?: () => void }) {
  const platforms = (ad.platforms ?? []).map((platform) => platformLabels[platform.toLowerCase()] ?? platform);
  const [mediaFailed, setMediaFailed] = useState(false);
  useEffect(() => setMediaFailed(false), [ad.mediaUrl]);
  const mediaUrl = mediaFailed ? undefined : (ad.mediaUrl ?? undefined);
  const hasMedia = Boolean(mediaUrl);
  return (
    <article className="gx-cads-ad">
      <div className="gx-cads-adh">
        <PageIdentity ad={ad} />
        <span className={signalClasses(ad.signal)}>
          {ad.signal ?? "à surveiller"}
        </span>
      </div>
      <LibraryMeta ad={ad} />
      <div className="gx-cads-m">
        {hasMedia && ad.mediaType === "video" ? (
          <video
            src={mediaUrl}
            controls
            playsInline
            preload="metadata"
            onError={() => setMediaFailed(true)}
            aria-label={`Vidéo publicitaire de ${ad.pageName ?? "cet annonceur"}`}
          />
        ) : hasMedia ? (
          <img
            src={mediaUrl}
            alt={`Publicité de ${ad.pageName ?? "cet annonceur"}`}
            draggable={false}
            loading="lazy"
            onError={() => setMediaFailed(true)}
          />
        ) : (
          <div className="gx-cads-na">
            <div>
              <b>Aperçu indisponible</b>
              <p className="gx-hint">
                La création n’a pas pu être récupérée depuis la bibliothèque officielle.
              </p>
            </div>
            <div className="gx-cads-nat">
              <b>{ad.pageName ?? "Annonceur inconnu"}</b>
              {ad.body ? (
                <p>{ad.body}</p>
              ) : ad.title ? (
                <p>{ad.title}</p>
              ) : (
                <p><em>Aucun texte publié.</em></p>
              )}
            </div>
            {ad.libraryUrl ? (
              <a className="gx-btn gx-sm" href={ad.libraryUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="gx-i" /> Voir dans la bibliothèque
              </a>
            ) : null}
          </div>
        )}

        {hasMedia ? (
          <button
            type="button"
            onClick={() => onOpen?.()}
            aria-label="Agrandir la création"
            title="Agrandir"
            className="gx-ib gx-sm gx-cads-eye"
          >
            <Eye className="gx-i" />
          </button>
        ) : null}
      </div>
      <div className="gx-cads-run">
        <b>
          <Clock className="gx-i" aria-hidden />
          {ad.stillActive ? `Active depuis ${ad.runningDays ?? 0} j` : `Diffusée ${ad.runningDays ?? 0} j · arrêtée`}
        </b>
        {hasMedia && ad.mediaType === "video" ? (
          <span><Play className="gx-i" aria-hidden /> Vidéo</span>
        ) : null}
      </div>

      {onToggle ? (
        <div className="gx-cads-sel">
          <button
            type="button"
            className="gx-btn gx-sm gx-cads-ref"
            aria-pressed={selected}
            onClick={onToggle}
          >
            {selected ? <Check className="gx-i" /> : <Plus className="gx-i" />}
            <span>{selected ? "Référence ajoutée" : "Ajouter en référence"}</span>
          </button>
        </div>
      ) : null}
      <Accordion type="single" collapsible>
        <AccordionItem value={`details-${ad.id ?? ad.pageName ?? "ad"}`} className="border-b-0">
          <AccordionTrigger className="gx-cads-acc hover:no-underline">
            <span className="gx-cads-acct">
              <b>Voir l’analyse</b>
              <small>Diffusion, portée, plateformes et accroche</small>
            </span>
          </AccordionTrigger>
          <AccordionContent className="gx-cads-accb">
            <div className="gx-cads-facts">
              <MiniFact icon={<Clock />} label="Diffusion" value={`${ad.runningDays ?? 0} jours${ad.stillActive ? " · active" : ""}`} />
              <MiniFact icon={<CalendarDays />} label="Période" value={`${formatDate(ad.startedAt)} → ${formatDate(ad.endedAt)}`} />
              <MiniFact icon={<Users2 />} label="Portée UE" value={typeof ad.euReach === "number" ? ad.euReach.toLocaleString("fr-FR") : "Non publiée"} />
              <MiniFact icon={<Layers3 />} label="Plateformes" value={platforms.length ? platforms.join(", ") : "Non précisées"} />
            </div>

            <div className="gx-cads-dl">
              <Detail label="Annonceur" value={ad.pageName ?? "Annonceur inconnu"} />
              <Detail label="Signal" value={`Signal ${ad.signal ?? "à surveiller"}`} />
              {ad.body ? <Detail label="Texte de l’accroche" value={ad.body} /> : null}
              {ad.title ? <Detail label="Titre" value={ad.title} /> : null}
              {ad.description ? <Detail label="Description" value={ad.description} /> : null}
              {ad.destination ? <Detail label="Destination affichée" value={ad.destination} /> : null}
            </div>

            {(ad.signalReasons ?? []).length ? (
            <div className="gx-cads-why">
                <b>Pourquoi ce signal</b>
                <ul>
                  {(ad.signalReasons ?? []).map((reason) => (
                    <li key={reason}>
                      <TrendingUp className="gx-i" aria-hidden />
                      {reason}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {ad.libraryUrl ? (
              <a className="gx-btn gx-sm gx-cads-full" href={ad.libraryUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="gx-i" /> Voir dans la bibliothèque officielle
              </a>
            ) : null}
          </AccordionContent>
        </AccordionItem>
      </Accordion>

    </article>
  );
}

function AdLightbox({
  ads,
  index,
  onClose,
  onNavigate,
  selected,
  onToggle,
}: {
  ads: Ad[];
  index: number;
  onClose: () => void;
  onNavigate: (next: number) => void;
  selected?: boolean;
  onToggle?: () => void;
}) {
  const ad = ads[index];
  const platforms = (ad.platforms ?? []).map((platform) => platformLabels[platform.toLowerCase()] ?? platform);
  const [mediaFailed, setMediaFailed] = useState(false);
  const mediaUrl = mediaFailed ? undefined : (ad.mediaUrl ?? undefined);
  useEffect(() => setMediaFailed(false), [ad.mediaUrl]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") onNavigate(index - 1);
      if (event.key === "ArrowRight") onNavigate(index + 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, onNavigate]);

  const arrowClasses = "gx-ib gx-cads-lbarr";

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent aria-describedby={undefined} className="gx-ad-lightbox [&>button:last-child]:hidden">
        <div className="gx-ad-lightbox-layout">
          {index > 0 ? (
            <button
              type="button"
              aria-label="Création précédente"
              className={arrowClasses}
              onClick={() => onNavigate(index - 1)}
            >
              <ChevronLeft className="gx-i" />
            </button>
          ) : null}
          <div className="gx-ad-lightbox-panel">
          <DialogHeader className="gx-ad-lightbox-header gx-cads-lbh">
            <DialogTitle className="gx-cads-lbt">
              <PageIdentity ad={ad} large />
              <span className={signalClasses(ad.signal)}>
                {ad.signal ?? "à surveiller"}
              </span>
              <span className="gx-pill gx-num gx-cads-lbn">
                {index + 1} / {ads.length}
              </span>
              <DialogClose
                aria-label="Fermer"
                className="gx-ib gx-sm"
              >
                <X className="gx-i" />
              </DialogClose>
            </DialogTitle>
          </DialogHeader>
          <div className="gx-ad-lightbox-scroll">
          <div className="gx-ad-lightbox-grid">
          <div className="gx-ad-lightbox-media">

            {mediaUrl && ad.mediaType === "video" ? (
              <video
                key={mediaUrl}
                src={mediaUrl}
                className="gx-ad-lightbox-asset"
                controls
                autoPlay
                playsInline
                onError={() => setMediaFailed(true)}
              />
            ) : mediaUrl ? (
              <img
                key={mediaUrl}
                src={mediaUrl}
                alt={`Publicité de ${ad.pageName ?? "cet annonceur"}`}
                className="gx-ad-lightbox-asset"
                onError={() => setMediaFailed(true)}
              />
            ) : (
              <div className="gx-cads-na gx-cads-na-lb">
                <b>Aperçu indisponible</b>
                <p className="gx-hint">La création n’a pas pu être récupérée depuis la bibliothèque officielle.</p>
                {ad.libraryUrl ? (
                  <a className="gx-btn gx-sm" href={ad.libraryUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="gx-i" /> Voir la création réelle
                  </a>
                ) : null}
              </div>
            )}
          </div>
          <div className="gx-ad-lightbox-details gx-cads-lbd">
            <div className="gx-cads-facts">
              <MiniFact icon={<Clock />} label="Diffusion" value={`${ad.runningDays ?? 0} jours${ad.stillActive ? " · active" : ""}`} />
              <MiniFact icon={<CalendarDays />} label="Période" value={`${formatDate(ad.startedAt)} → ${formatDate(ad.endedAt)}`} />
              <MiniFact icon={<Users2 />} label="Portée UE" value={typeof ad.euReach === "number" ? ad.euReach.toLocaleString("fr-FR") : "Non publiée"} />
              <MiniFact icon={<Layers3 />} label="Plateformes" value={platforms.length ? platforms.join(", ") : "Non précisées"} />
            </div>
            {ad.body ? <Detail label="Texte de l’accroche" value={ad.body} /> : null}
            {ad.title ? <Detail label="Titre" value={ad.title} /> : null}
            {ad.description ? <Detail label="Description" value={ad.description} /> : null}
            {ad.destination ? <Detail label="Destination affichée" value={ad.destination} /> : null}
            {(ad.signalReasons ?? []).length ? (
              <div className="gx-cads-why">
                <b>Pourquoi ce signal</b>
                <ul>
                  {(ad.signalReasons ?? []).map((reason) => (
                    <li key={reason}>
                      <TrendingUp className="gx-i" aria-hidden />
                      {reason}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            <div className="gx-cads-lbact">
              {onToggle ? (
                <button type="button" className="gx-btn gx-sm gx-cads-ref gx-cads-full" aria-pressed={selected} onClick={onToggle}>
                  {selected ? <Check className="gx-i" /> : <Plus className="gx-i" />}
                  {selected ? "Référence ajoutée" : "Ajouter en référence"}
                </button>
              ) : null}
              {ad.libraryUrl ? (
                <a className="gx-btn gx-sm gx-cads-full" href={ad.libraryUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="gx-i" /> Voir dans la bibliothèque officielle
                </a>
              ) : null}
            </div>
          </div>
          </div>
          </div>
          </div>
          {index < ads.length - 1 ? (
            <button
              type="button"
              aria-label="Création suivante"
              className={arrowClasses}
              onClick={() => onNavigate(index + 1)}
            >
              <ChevronRight className="gx-i" />
            </button>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="gx-cads-det">
      <b>{label}</b>
      <p>{value}</p>
    </div>
  );
}

function MiniFact({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="gx-cads-fact">
      <span>{icon}{label}</span>
      <b>{value}</b>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return <StatTile label={label} value={value} />;
}
type Filters = {
  status: "all" | "active" | "inactive";
  platform: string;
  media: "all" | "image" | "video";
  advertiser: string;
  sort: "longest" | "recent" | "reach";
};
const defaultFilters: Filters = { status: "all", platform: "all", media: "all", advertiser: "all", sort: "longest" };

function activeFilterCount(f: Filters) {
  return (["status", "platform", "media", "advertiser"] as const).filter((k) => f[k] !== "all").length + (f.sort !== "longest" ? 1 : 0);
}

function applyFilters(ads: Ad[], f: Filters) {
  const out = ads.filter((ad) => {
    if (f.status === "active" && !ad.stillActive) return false;
    if (f.status === "inactive" && ad.stillActive) return false;
    if (f.platform !== "all" && !(ad.platforms ?? []).some((p) => p.toLowerCase() === f.platform)) return false;
    if (f.media !== "all" && ad.mediaType !== f.media) return false;
    if (f.advertiser !== "all" && ad.pageName !== f.advertiser) return false;
    return true;
  });
  const time = (v?: string | null) => (v ? new Date(v).getTime() || 0 : 0);
  if (f.sort === "recent") out.sort((a, b) => time(b.startedAt) - time(a.startedAt));
  else if (f.sort === "reach") out.sort((a, b) => (b.euReach ?? 0) - (a.euReach ?? 0));
  else out.sort((a, b) => (b.runningDays ?? 0) - (a.runningDays ?? 0));
  return out;
}

function FilterSelect({ label, value, options, onChange }: { label: string; value: string; options: { value: string; label: string }[]; onChange: (v: string) => void }) {
  return (
    <label className="gx-cads-fs">
      <span className="gx-lbl">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="gx-in"
      >
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </label>
  );
}

const COUNTRIES = ["FR","BE","CH","LU","DE","ES","IT","NL","PT","AT","IE","GB","PL","SE","DK","FI","NO","CZ","RO","GR","HU"];
function countryName(code: string) {
  try { return new Intl.DisplayNames(["fr"], { type: "region" }).of(code) ?? code; } catch { return code; }
}

function FilterBar({ ads, filters, onChange, country, onCountry }: { ads: Ad[]; filters: Filters; onChange: (f: Filters) => void; country: string; onCountry: (c: string) => void }) {
  const countries = COUNTRIES.includes(country) ? COUNTRIES : [country, ...COUNTRIES];
  const platforms = Array.from(new Set(ads.flatMap((a) => (a.platforms ?? []).map((p) => p.toLowerCase()))));
  const advertisers = Array.from(new Set(ads.map((a) => a.pageName).filter(Boolean) as string[])).sort((a, b) => a.localeCompare(b, "fr"));
  const set = <K extends keyof Filters>(k: K) => (v: string) => onChange({ ...filters, [k]: v as Filters[K] });
  return (
    <div className="gx-cads-fb">
      <FilterSelect label="Pays" value={country} onChange={(c) => { if (c !== country) onCountry(c); }} options={countries.map((c) => ({ value: c, label: countryName(c) }))} />
      <FilterSelect label="Statut" value={filters.status} onChange={set("status")} options={[{ value: "all", label: "Toutes" }, { value: "active", label: "Actives" }, { value: "inactive", label: "Inactives" }]} />
      <FilterSelect label="Plateforme" value={filters.platform} onChange={set("platform")} options={[{ value: "all", label: "Toutes" }, ...platforms.map((p) => ({ value: p, label: platformLabels[p] ?? p }))]} />
      <FilterSelect label="Type de média" value={filters.media} onChange={set("media")} options={[{ value: "all", label: "Tous" }, { value: "image", label: "Images" }, { value: "video", label: "Vidéos" }]} />
      <FilterSelect label="Annonceur" value={filters.advertiser} onChange={set("advertiser")} options={[{ value: "all", label: "Tous" }, ...advertisers.map((a) => ({ value: a, label: a }))]} />
      <FilterSelect label="Trier par" value={filters.sort} onChange={set("sort")} options={[{ value: "longest", label: "Diffusion la plus longue" }, { value: "recent", label: "Plus récentes" }, { value: "reach", label: "Portée UE" }]} />
      <div className="gx-cads-fsr">
        <button type="button" className="gx-btn gx-sm gx-ghost gx-cads-full" disabled={!activeFilterCount(filters)} onClick={() => onChange(defaultFilters)}>
          Réinitialiser
        </button>
      </div>
    </div>
  );
}

function PageIdentity({ ad, large }: { ad: Ad; large?: boolean }) {
  const sources = [ad.pageLogoUrl, ad.pageId ? `https://graph.facebook.com/${ad.pageId}/picture?type=large` : null].filter(Boolean) as string[];
  const [srcIndex, setSrcIndex] = useState(0);
  const failed = srcIndex >= sources.length;
  const name = ad.pageName ?? "Annonceur";
  const size = large ? "gx-cads-av gx-cads-big" : "gx-cads-av";
  const pageUrl = ad.pageId ? `https://www.facebook.com/${ad.pageId}` : undefined;
  return (
    <div className="gx-cads-pid">
      {!failed ? (
        <img
          src={sources[srcIndex]}
          referrerPolicy="no-referrer"
          alt=""
          className={size}
          loading="lazy"
          onError={() => setSrcIndex((i) => i + 1)}
        />
      ) : (
        <span className={`${size} gx-cads-ini`}>
          {name.slice(0, 1).toUpperCase()}
        </span>
      )}
      <div className={`gx-cads-pn${large ? " gx-cads-big" : ""}`}>
        {pageUrl ? (
          <a href={pageUrl} target="_blank" rel="noreferrer">{name}</a>
        ) : (
          <b>{name}</b>
        )}
        <small>Sponsorisé</small>
      </div>
    </div>
  );
}

function LibraryMeta({ ad }: { ad: Ad }) {
  return (
    <div className="gx-cads-lib">
      <p>
        <span className={`gx-st ${ad.stillActive ? "gx-on" : "gx-off"}`}>{ad.stillActive ? "Active" : "Inactive"}</span>
      </p>
      {ad.id ? <p>ID dans la bibliothèque : {ad.id}</p> : null}
      <p>
        {ad.stillActive ? `Diffusion commencée le ${formatDate(ad.startedAt)}` : `${formatDate(ad.startedAt)} – ${formatDate(ad.endedAt)}`}
      </p>
    </div>
  );
}
