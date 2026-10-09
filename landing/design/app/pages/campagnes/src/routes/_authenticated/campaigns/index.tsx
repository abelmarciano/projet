import { cn } from "@/lib/utils";
import { frSetName } from "@/lib/meta-labels";
import { frEuro, frMoney, frNumber, frPercent, formatEuroPerDay } from "@/lib/format";
import { rangeFor } from "@/components/insights/shared";
import { createFileRoute, Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState, useMemo, useEffect, useRef, type ReactNode } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import {
  Plus, RefreshCw, Search, ChevronDown, MoreHorizontal, Check, X, Film, Image as ImageIcon,
} from "lucide-react";
import { CampaignDetailDrawer } from "@/components/campaigns/CampaignDetailDrawer";
import { MetaCampaignDetailDrawer } from "@/components/campaigns/MetaCampaignDetailDrawer";
import { toast } from "sonner";
import { listMarketingCampaigns, deleteMarketingCampaign, deleteCampaignAd } from "@/lib/campaigns.functions";
import {
  listMetaCampaigns, listAllMetaAdSets, listAllMetaAds,
  setMetaCampaignStatus, setMetaAdSetStatus, setMetaAdStatus,
  deleteMetaCampaign, deleteMetaAdSet, deleteMetaAd,
  renameMetaItem, updateMetaAdSetBudget,
  cleanupEmptyMetaCampaigns, getMetaCredentials,
} from "@/lib/meta.functions";
import { getMetaPerformance } from "@/lib/meta-insights.functions";
import { MetaConnectButton } from "@/components/MetaConnectDialog";
import { MetaPublishDialog } from "@/components/MetaPublishDialog";
import { EditMetaAdDialog } from "@/components/EditMetaAdDialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuCheckboxItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { openMetaAdInChat } from "@/lib/meta-chat-handoff";
import { VideoPoster } from "@/components/VideoPoster";

/*
 * Campagnes (« Mes publicités ») : copie de la maquette validée
 * (landing/design/app/views/campagnes.html), classes gx- de src/styles/gx-console.css,
 * branchée sur les brouillons Growthity et les campagnes Meta réelles.
 */

export const Route = createFileRoute("/_authenticated/campaigns/")({
  head: () => ({ meta: [{ title: "Campagnes - growthity.ai" }, { name: "description", content: "Gère tes campagnes Meta, ensembles de publicités et brouillons Growthity." }, { property: "og:title", content: "Campagnes - growthity.ai" }, { property: "og:description", content: "Gère tes campagnes Meta, ensembles de publicités et brouillons Growthity." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: CampaignsPage,
});

type Source = "drafts" | "meta";
/** Onglet visible : brouillons Growthity, pubs Meta en ligne, pubs Meta hors ligne. */
type Tab = "drafts" | "meta_online" | "meta_offline";
type Level = "campaigns" | "adsets" | "ads";
type CampaignFilters = { status: string[]; platform: string[]; objective: string[]; campaign: string[]; account: string[] };
type Opt = { value: string; label: string };

/** Une ligne Meta diffuse-t-elle réellement ? (campagne, ensemble ou publicité) */
function isRowOnline(r: any) {
  if (typeof r?.is_online === "boolean") return r.is_online;
  return String(r?.effective_status ?? "") === "ACTIVE";
}

const OBJECTIVE_LABELS: Record<string, string> = {
  leads: "Obtenir des prospects", traffic: "Amener du trafic", sales: "Générer des ventes",
  awareness: "Faire connaître", engagement: "Engagement",
  OUTCOME_LEADS: "Obtenir des prospects", OUTCOME_TRAFFIC: "Amener du trafic",
  OUTCOME_SALES: "Générer des ventes", OUTCOME_AWARENESS: "Faire connaître",
  OUTCOME_ENGAGEMENT: "Engagement",
};

const TABS: { value: Tab; label: string; hint: string }[] = [
  { value: "drafts", label: "Brouillons", hint: "Créées dans Growthity, pas encore publiées sur Meta" },
  { value: "meta_online", label: "En ligne sur Meta", hint: "Diffusent réellement aujourd'hui" },
  { value: "meta_offline", label: "Hors ligne sur Meta", hint: "Publiées sur Meta mais en pause ou sans diffusion" },
];

const LEVELS: { value: Level; label: string; hint: string }[] = [
  { value: "campaigns", label: "Campagnes", hint: "L'objectif global (ex. avoir des prospects)" },
  { value: "adsets", label: "Ensembles de pubs", hint: "Qui voit la pub, où, avec quel budget" },
  { value: "ads", label: "Publicités", hint: "Le visuel et le texte qui s'affichent" },
];

const DASH = "—";
const num = (v: unknown) => Number(v) || 0;
const nOrDash = (v: unknown) => (num(v) > 0 ? frNumber(num(v)) : DASH);
const fmtDate = (d: string | Date) => new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });

function CampaignsPage() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const metaId = useRouterState({
    select: (r) => (r.location.search as { metaId?: string })?.metaId,
  });
  const [tab, setTab] = useState<Tab>(metaId ? "meta_online" : "drafts");
  const source: Source = tab === "drafts" ? "drafts" : "meta";
  const metaOnlineOnly = tab === "meta_online";
  const [level, setLevel] = useState<Level>("campaigns");
  const [query, setQuery] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "cards">("list");
  const [filters, setFilters] = useState<CampaignFilters>({ status: [], platform: [], objective: [], campaign: [], account: [] });
  const [detailId, setDetailId] = useState<string | null>(null);
  const [metaDetail, setMetaDetail] = useState<any | null>(null);
  const [editMetaAdId, setEditMetaAdId] = useState<string | null>(null);
  const week = useMemo(() => rangeFor("7d"), []);

  const fetchCampaigns = useServerFn(listMarketingCampaigns);
  const fetchMeta = useServerFn(listMetaCampaigns);
  const fetchMetaSets = useServerFn(listAllMetaAdSets);
  const fetchMetaAds = useServerFn(listAllMetaAds);
  const fetchCreds = useServerFn(getMetaCredentials);
  const fetchPerf = useServerFn(getMetaPerformance);

  const creds = useQuery({ queryKey: ["meta-creds"], queryFn: () => fetchCreds() });
  const tokenExpired = (creds.data as any)?.connected === true && (creds.data as any)?.expired === true;
  const connected = creds.data?.connected === true && !tokenExpired;

  const drafts = useQuery({ queryKey: ["marketing-campaigns"], queryFn: () => fetchCampaigns() });
  // Meta limite fortement le nombre d'appels : les ensembles et publicités ne se chargent
  // qu'à l'affichage de leur niveau, et tout reste en cache pour ne pas re-taper l'API.
  const metaBase = { staleTime: 5 * 60_000, gcTime: 30 * 60_000, refetchOnWindowFocus: false, retry: false } as const;
  const metaOn = source === "meta" && connected;
  // La rangée de chiffres (« Campagnes actives ») est visible dans tous les onglets.
  const metaCampaigns = useQuery({
    queryKey: ["meta-campaigns"], queryFn: () => fetchMeta(),
    enabled: connected, ...metaBase,
  });
  // 7 derniers jours : affichages, clics, dépense et mini courbe par campagne (même cache que l'Accueil).
  const perf = useQuery({
    queryKey: ["meta-performance", week.since, week.until, "all"],
    queryFn: () => fetchPerf({ data: { ...week, accountId: null } }),
    enabled: connected, ...metaBase,
  });

  // Lien profond « ?metaId=… » : ouvre directement le détail de la campagne visée.
  const deepLinked = useRef(false);
  useEffect(() => {
    if (deepLinked.current || !metaId) return;
    const found = (metaCampaigns.data ?? []).find((c: any) => String(c.id) === metaId);
    if (found) { deepLinked.current = true; setMetaDetail(found); }
  }, [metaId, metaCampaigns.data]);
  const metaSets = useQuery({
    queryKey: ["meta-adsets"], queryFn: async () => JSON.parse(await fetchMetaSets()) as any[],
    enabled: (metaOn && level === "adsets") || (connected && !!metaDetail), ...metaBase,
  });
  const metaAds = useQuery({
    queryKey: ["meta-ads"], queryFn: () => fetchMetaAds(),
    enabled: (metaOn && level === "ads") || (connected && !!metaDetail), ...metaBase,
  });

  // Onglet « Brouillons » : uniquement ce qui n'existe pas encore sur Meta.
  const draftCampaigns = useMemo(
    () => (drafts.data ?? []).filter((c: any) => !c.meta_campaign_id && c.status !== "published"),
    [drafts.data],
  );

  const draftFlat = useMemo(() => {
    const c = draftCampaigns;
    const allSets = c.flatMap((cp: any) => (cp.ad_sets ?? []).map((s: any) => ({
      ...s, campaign_id: cp.id, campaign_name: cp.name, objective: cp.objective,
      _adCount: (s.campaign_ads ?? []).length,
    })));
    const allAds = c.flatMap((cp: any) => (cp.ad_sets ?? []).flatMap((s: any) =>
      (s.campaign_ads ?? []).map((ca: any) => ({
        ...ca, campaign_id: cp.id, campaign_name: cp.name,
        adset_id: s.id, adset_name: s.name,
      })),
    ));
    return { sets: allSets, ads: allAds };
  }, [draftCampaigns]);

  // Erreur de synchronisation Meta : on ne montre JAMAIS de données de repli.
  const metaError =
    (level === "campaigns" ? metaCampaigns.error : level === "adsets" ? metaSets.error : metaAds.error) ?? null;

  const refreshAll = () => {
    qc.invalidateQueries({ queryKey: ["meta-campaigns"] });
    qc.invalidateQueries({ queryKey: ["meta-adsets"] });
    qc.invalidateQueries({ queryKey: ["meta-ads"] });
  };
  const refreshPage = () => {
    refreshAll();
    qc.invalidateQueries({ queryKey: ["meta-performance"] });
    qc.invalidateQueries({ queryKey: ["marketing-campaigns"] });
  };
  const refreshing = metaCampaigns.isFetching || metaSets.isFetching || metaAds.isFetching || perf.isFetching || drafts.isFetching;

  // Onglets Meta : « en ligne » = diffuse vraiment, « hors ligne » = tout le reste.
  const byTab = (rows: any[] | null | undefined) =>
    rows ? rows.filter((r) => isRowOnline(r) === metaOnlineOnly) : null;

  // Lignes brutes par niveau (null = pas encore chargé depuis Meta).
  const rawRows: Record<Level, any[] | null> =
    source === "drafts"
      ? { campaigns: draftCampaigns, adsets: draftFlat.sets, ads: draftFlat.ads }
      : {
          campaigns: byTab(metaCampaigns.data),
          adsets: byTab(metaSets.data),
          ads: byTab(metaAds.data),
        };

  // Les filtres et la recherche s'appliquent au niveau affiché.
  const visibleRows = useMemo(
    () => (rawRows[level] ? applyRowFilters(rawRows[level]!, query, filters, source) : null),
    [rawRows[level], query, filters, source, level],
  );

  const objectiveOptions = useMemo(() => objectiveOptionsFrom(rawRows[level] ?? []), [rawRows[level]]);
  const campaignOptions = useMemo(() => campaignOptionsFrom(rawRows[level] ?? []), [rawRows[level]]);
  const accountOptions = useMemo(() => {
    const map = new Map<string, string>();
    for (const r of [...(rawRows[level] ?? []), ...((metaCampaigns.data as any[]) ?? [])]) {
      const id = String((r as any).account_id ?? "");
      if (id) map.set(id, String((r as any).account_name ?? id));
    }
    return Array.from(map, ([value, label]) => ({ value, label }));
  }, [rawRows[level], metaCampaigns.data]);

  // `null` = pas encore chargé depuis Meta → « … » plutôt qu'un faux « 0 ».
  const countFor = (l: Level) =>
    l === level ? (visibleRows ? visibleRows.length : null) : (rawRows[l] ? rawRows[l]?.length ?? null : null);

  const extraFilterCount = filters.status.length + filters.platform.length;
  const activeFilterCount =
    filters.status.length + filters.platform.length + filters.objective.length + filters.campaign.length + filters.account.length;
  const resetFilters = () => setFilters({ status: [], platform: [], objective: [], campaign: [], account: [] });

  /* ---------- rangée de chiffres (maquette : 4 cartes) ---------- */

  const accountSet = filters.account.length ? new Set(filters.account) : null;
  const inAccount = (id: unknown) => !accountSet || accountSet.has(String(id ?? ""));
  const activeCount = ((metaCampaigns.data as any[]) ?? []).filter((c) => c.is_online && inAccount(c.account_id)).length;
  const perfData: any = perf.data;
  const perfTotals = accountSet
    ? (((perfData?.campaigns as any[]) ?? []).filter((c) => inAccount(c.accountId)).reduce(
        (a: any, c: any) => ({
          impressions: a.impressions + num(c.totals?.impressions),
          clicks: a.clicks + num(c.totals?.clicks),
          spend: a.spend + num(c.totals?.spend),
        }),
        { impressions: 0, clicks: 0, spend: 0 },
      ))
    : perfData?.totals;
  const trend = useMemo(() => {
    const m = new Map<string, number[]>();
    for (const c of ((perfData?.campaigns as any[]) ?? [])) {
      const t = c.totals ?? {};
      m.set(String(c.id), ((c.series as any[]) ?? []).map((d: any) => num(num(t.results) > 0 ? d?.results : d?.spend)));
    }
    return m;
  }, [perfData]);
  const kpiValue = (loading: boolean, v: ReactNode) => (!connected ? DASH : loading ? "…" : v);

  /* ---------- nettoyage des campagnes vides (Meta) ---------- */
  const cleanup = useCleanup(refreshAll);

  const tabLabel = LEVELS.find((l) => l.value === level)!;

  return (
    <div className="gx-page">
      <div className="gx-ph">
        <div><h1>Mes publicités</h1><p>Pilote tes brouillons et tes pubs en ligne sur Meta, sans jargon.</p></div>
        <div className="gx-pa">
          <button type="button" className={cn("gx-btn", refreshing && "gx-spin-i")} onClick={refreshPage} disabled={refreshing}
            title="Actualiser les données depuis Meta (campagnes, ensembles, publicités et statistiques)">
            <RefreshCw className="gx-i" />Actualiser
          </button>
          <Link to="/campaigns/new" className="gx-btn gx-pri gx-grad"><Plus className="gx-i" />Nouvelle campagne</Link>
        </div>
      </div>

      <div className="gx-kp4">
        <div><small>Campagnes actives</small><b className="gx-num">{kpiValue(metaCampaigns.isPending, frNumber(activeCount))}</b></div>
        <div>
          <small><span className="gx-tipw" tabIndex={0} data-tip="Nombre de fois où tes pubs ont été vues.">Affichages<i>?</i></span></small>
          <b className="gx-num">{kpiValue(perf.isPending, frNumber(perfTotals?.impressions ?? 0))}</b>
        </div>
        <div>
          <small><span className="gx-tipw" tabIndex={0} data-tip="Personnes qui ont cliqué sur ta pub.">Clics<i>?</i></span></small>
          <b className="gx-num">{kpiValue(perf.isPending, frNumber(perfTotals?.clicks ?? 0))}</b>
        </div>
        <div>
          <small>Total dépensé</small>
          <b className="gx-num" title={connected && perfTotals ? frMoney(perfTotals.spend ?? 0) : undefined}>{kpiValue(perf.isPending, frEuro(perfTotals?.spend ?? 0))}</b>
          <em>{connected ? "7 derniers jours" : tokenExpired ? "Connexion Meta expirée" : "Connecte Meta pour voir tes chiffres"}</em>
        </div>
      </div>

      <div className="gx-bar-f">
        <div className="gx-seg" role="tablist" aria-label="Source des campagnes">
          {TABS.map((t) => (
            <button key={t.value} type="button" role="tab" aria-selected={tab === t.value} title={t.hint} onClick={() => setTab(t.value)}>{t.label}</button>
          ))}
        </div>
        <SelMenu label="Objectif" allLabel="Tous les objectifs" options={objectiveOptions} values={filters.objective}
          onChange={(v) => setFilters({ ...filters, objective: v })} />
        <SelMenu label="Compte publicitaire" allLabel="Tous les comptes" options={accountOptions} values={filters.account}
          onChange={(v) => setFilters({ ...filters, account: v })}
          disabled={source === "drafts"} disabledHint="Les brouillons ne sont pas encore rattachés à un compte publicitaire" />
        {/* Sous-onglets existants (Campagnes / Ensembles / Publicités), présentés comme les menus de la maquette. */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button type="button" className={cn("gx-sel", level !== "campaigns" && "gx-set")} aria-label="Niveau affiché">
              <span>{tabLabel.label}{" "}<span className="gx-num">({countFor(level) ?? "…"})</span></span><ChevronDown className="gx-i" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="console-app-portal gx-dmenu">
            <div className="gx-mh">Une campagne contient des ensembles, qui contiennent des publicités</div>
            {LEVELS.map((l) => (
              <DropdownMenuCheckboxItem key={l.value} checked={level === l.value} onCheckedChange={() => setLevel(l.value)}>
                <span>{l.label} <span className="gx-num">({countFor(l.value) ?? "…"})</span><small>{l.hint}</small></span>
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        {level !== "campaigns" && (
          <SelMenu label="Campagne" allLabel="Toutes les campagnes" options={campaignOptions} values={filters.campaign}
            onChange={(v) => setFilters({ ...filters, campaign: v })} />
        )}
        <label className="gx-srch gx-cp-srch">
          <Search className="gx-i" />
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Rechercher par nom…" aria-label="Rechercher par nom" />
        </label>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button type="button" className="gx-ib" aria-label="Plus d'options" title="Plus de filtres et d'options">
              <MoreHorizontal className="gx-i" />{extraFilterCount > 0 && <span className="gx-dot" />}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="console-app-portal gx-dmenu">
            {level === "campaigns" && (
              <>
                <div className="gx-mh">Affichage</div>
                <DropdownMenuCheckboxItem checked={viewMode === "list"} onCheckedChange={() => setViewMode("list")}>Liste</DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem checked={viewMode === "cards"} onCheckedChange={() => setViewMode("cards")}>Grille</DropdownMenuCheckboxItem>
              </>
            )}
            <div className="gx-mh">Statut</div>
            {statusOptionsFor(source, metaOnlineOnly).map((o) => (
              <DropdownMenuCheckboxItem key={o.value} checked={filters.status.includes(o.value)}
                onSelect={(e) => e.preventDefault()}
                onCheckedChange={() => setFilters({ ...filters, status: toggleIn(filters.status, o.value) })}>
                {o.label}
              </DropdownMenuCheckboxItem>
            ))}
            {level === "campaigns" && source === "drafts" && (
              <>
                <div className="gx-mh">Plateforme</div>
                {PLATFORM_OPTIONS.map((o) => (
                  <DropdownMenuCheckboxItem key={o.value} checked={filters.platform.includes(o.value)}
                    onSelect={(e) => e.preventDefault()}
                    onCheckedChange={() => setFilters({ ...filters, platform: toggleIn(filters.platform, o.value) })}>
                    {o.label}
                  </DropdownMenuCheckboxItem>
                ))}
              </>
            )}
            <hr />
            {activeFilterCount > 0 && (
              <DropdownMenuItem onSelect={resetFilters}>Réinitialiser les filtres ({activeFilterCount})</DropdownMenuItem>
            )}
            {source === "meta" && connected && (
              <DropdownMenuItem onSelect={() => void cleanup.start()} disabled={cleanup.busy}
                title="Supprime les campagnes brouillon sur Meta qui ne contiennent aucune publicité configurée">
                {cleanup.busy ? "Recherche des campagnes vides…" : "Nettoyer les campagnes vides"}
              </DropdownMenuItem>
            )}
            <DropdownMenuItem asChild><Link to="/connexions">Gérer la connexion Meta</Link></DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {source === "drafts" && level === "campaigns" && (
        <DraftCampaignsView items={visibleRows ?? []} total={draftCampaigns.length} loading={drafts.isLoading}
          hasMetaCreds={connected} viewMode={viewMode} onResetFilters={resetFilters}
          onOpenDetail={setDetailId}
          onChanged={() => qc.invalidateQueries({ queryKey: ["marketing-campaigns"] })} />
      )}
      {source === "drafts" && level === "adsets" && (
        <DraftAdSetsView items={visibleRows ?? []} total={draftFlat.sets.length} loading={drafts.isLoading}
          onOpenDetail={setDetailId} onResetFilters={resetFilters} />
      )}
      {source === "drafts" && level === "ads" && (
        <DraftAdsView items={visibleRows ?? []} total={draftFlat.ads.length} loading={drafts.isLoading}
          onOpenDetail={setDetailId} onResetFilters={resetFilters}
          onChanged={() => qc.invalidateQueries({ queryKey: ["marketing-campaigns"] })} />
      )}

      {source === "meta" && !connected && (
        creds.isLoading
          ? <div className="gx-empty"><span>Vérification de ta connexion Meta…</span></div>
          : <MetaConnectPrompt expired={tokenExpired} />
      )}
      {source === "meta" && connected && (
        metaError ? (
          <MetaSyncError error={metaError} onRetry={refreshAll} />
        ) : (
          <>
            {level === "campaigns" && (
              <MetaCampaignsView items={visibleRows ?? []} total={rawRows.campaigns?.length ?? 0} loading={metaCampaigns.isPending}
                viewMode={viewMode} trend={perf.data ? trend : null}
                onOpenDetail={setMetaDetail} onChanged={refreshAll} onResetFilters={resetFilters}
                paginate={!metaOnlineOnly} />
            )}
            {level === "adsets" && (
              <MetaAdSetsView items={visibleRows ?? []} total={rawRows.adsets?.length ?? 0} loading={metaSets.isPending}
                onChanged={refreshAll} onResetFilters={resetFilters} paginate={!metaOnlineOnly} />
            )}
            {level === "ads" && (
              <MetaAdsView items={visibleRows ?? []} total={rawRows.ads?.length ?? 0} loading={metaAds.isPending}
                onChanged={refreshAll} onResetFilters={resetFilters} paginate={!metaOnlineOnly} />
            )}
          </>
        )
      )}

      <CampaignDetailDrawer
        campaignId={detailId}
        metaConnected={connected}
        onOpenChange={(o) => { if (!o) setDetailId(null); }}
      />
      <MetaCampaignDetailDrawer
        campaign={metaDetail}
        adSets={metaSets.data ?? []}
        ads={metaAds.data ?? []}
        loading={metaSets.isPending || metaAds.isPending}
        onOpenChange={(o) => { if (!o) setMetaDetail(null); }}
        onEdit={(c) => { setMetaDetail(null); setEditMetaAdId(c.first_ad_id ?? null); }}
        onRetry={refreshAll}
      />
      <EditMetaAdDialog
        adId={editMetaAdId}
        open={!!editMetaAdId}
        onOpenChange={(o) => { if (!o) setEditMetaAdId(null); }}
        onUpdated={refreshAll}
      />
      {cleanup.dialog}
    </div>
  );
}

// =============== Filtres ===============

const STATUS_OPTIONS: Record<Source, Opt[]> = {
  drafts: [
    { value: "draft", label: "Brouillon" },
    { value: "ready", label: "Prête" },
    { value: "published", label: "Publiée" },
  ],
  meta: [
    { value: "ACTIVE", label: "En ligne" },
    { value: "OFFLINE", label: "Hors ligne" },
    { value: "PAUSED", label: "En pause" },
    { value: "ARCHIVED", label: "Archivée" },
  ],
};

/** Options de statut cohérentes avec l'onglet actif. */
function statusOptionsFor(source: Source, metaOnlineOnly: boolean) {
  if (source === "drafts") return STATUS_OPTIONS.drafts;
  return metaOnlineOnly
    ? STATUS_OPTIONS.meta.filter((o) => o.value === "ACTIVE")
    : STATUS_OPTIONS.meta.filter((o) => o.value !== "ACTIVE");
}

const PLATFORM_OPTIONS: Opt[] = [
  { value: "meta", label: "Meta (Facebook / Instagram)" },
  { value: "tiktok", label: "TikTok" },
];

const OBJECTIVE_OPTIONS: Opt[] = [
  { value: "leads", label: "Obtenir des prospects" },
  { value: "traffic", label: "Amener du trafic" },
  { value: "sales", label: "Générer des ventes" },
  { value: "awareness", label: "Faire connaître" },
  { value: "engagement", label: "Engagement" },
];

/** Normalise un objectif Meta (OUTCOME_LEADS) vers nos clés simples (leads). */
function normalizeObjective(o?: string) {
  return String(o ?? "").replace(/^OUTCOME_/, "").toLowerCase();
}

const objectiveLabel = (key: string) =>
  OBJECTIVE_OPTIONS.find((o) => o.value === key)?.label ?? OBJECTIVE_LABELS[key] ?? key;

const objectiveText = (o?: string) => (o ? objectiveLabel(normalizeObjective(o)) : DASH);

/** Options d'objectif réellement présentes dans les données du compte. */
function objectiveOptionsFrom(items: any[]) {
  const keys = Array.from(new Set(items.map((i) => normalizeObjective(i.objective)).filter((k) => k && k !== "—")));
  return keys.map((k) => ({ value: k, label: objectiveLabel(k) }));
}

/** Options de campagne parente (pour les niveaux Ensembles / Publicités). */
function campaignOptionsFrom(items: any[]) {
  const map = new Map<string, string>();
  for (const i of items) {
    const id = String(i.campaign_id ?? "");
    if (id) map.set(id, String(i.campaign_name ?? id));
  }
  return Array.from(map, ([value, label]) => ({ value, label })).sort((a, b) => a.label.localeCompare(b.label));
}

/** Applique les filtres multi-sélection à une ligne (campagne, ensemble ou publicité). */
function matchFilters(c: any, filters: CampaignFilters, source: Source) {
  // Une campagne « ACTIVE » chez Meta ne diffuse pas forcément : le serveur
  // calcule is_online (pubs actives + diffusion constatée aujourd'hui).
  const status =
    source === "meta"
      ? typeof c.is_online === "boolean"
        ? c.is_online
          ? "ACTIVE"
          : String(c.effective_status ?? "") === "ACTIVE"
            ? "OFFLINE"
            : String(c.effective_status ?? "")
        : String(c.effective_status ?? "")
      : String(c.status ?? "");
  if (filters.status.length && !filters.status.includes(status)) return false;

  if (filters.platform.length) {
    const platform = source === "meta" ? "meta" : String(c.platform ?? "");
    if (!filters.platform.includes(platform)) return false;
  }
  if (filters.objective.length && !filters.objective.includes(normalizeObjective(c.objective))) return false;
  if (filters.campaign.length && !filters.campaign.includes(String(c.campaign_id ?? ""))) return false;
  if (filters.account.length && source === "meta" && !filters.account.includes(String(c.account_id ?? ""))) return false;
  return true;
}

/** Recherche par nom + filtres actifs, appliqués de façon identique partout. */
function applyRowFilters(items: any[], q: string, filters: CampaignFilters, source: Source) {
  const needle = q.trim().toLowerCase();
  return items.filter((i) => {
    if (needle) {
      const hay = `${i.name ?? ""} ${i.campaign_name ?? ""} ${i.adset_name ?? ""} ${i.headline ?? ""}`.toLowerCase();
      if (!hay.includes(needle)) return false;
    }
    return matchFilters(i, filters, source);
  });
}

const toggleIn = (list: string[], v: string) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

/** Menu « gx-sel » de la maquette (Objectif, Compte publicitaire…), multi-sélection. */
function SelMenu({ label, allLabel, options, values, onChange, disabled, disabledHint }: {
  label: string; allLabel: string; options: Opt[]; values: string[]; onChange: (v: string[]) => void;
  disabled?: boolean; disabledHint?: string;
}) {
  const shown = values.length === 0
    ? label
    : values.length === 1
      ? options.find((o) => o.value === values[0])?.label ?? label
      : `${label} (${values.length})`;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={disabled}>
        <button type="button" className={cn("gx-sel", values.length > 0 && "gx-set")} aria-label={label}
          title={disabled ? disabledHint : undefined} disabled={disabled}>
          <span>{shown}</span><ChevronDown className="gx-i" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="console-app-portal gx-dmenu">
        <DropdownMenuCheckboxItem checked={values.length === 0} onCheckedChange={() => onChange([])}>{allLabel}</DropdownMenuCheckboxItem>
        {options.length === 0 && <div className="gx-mh">Aucune option dans cet onglet</div>}
        {options.map((o) => (
          <DropdownMenuCheckboxItem key={o.value} checked={values.includes(o.value)}
            onSelect={(e) => e.preventDefault()}
            onCheckedChange={() => onChange(toggleIn(values, o.value))}>
            {o.label}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// =============== Petits composants communs ===============

type MenuEntry =
  | { label: string; onSelect: () => void; danger?: boolean; disabled?: boolean; title?: string }
  | { label: string; to: string; search?: Record<string, unknown> };

/** Menu ⋯ d'une ligne : actions secondaires (renommer, modifier, supprimer…). */
function RowMenu({ name, items }: { name: string; items: MenuEntry[] }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" className="gx-ib gx-sm" aria-label={`Actions pour ${name}`} title="Plus d'actions">
          <MoreHorizontal className="gx-i" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="console-app-portal gx-dmenu">
        {items.map((it) => "to" in it ? (
          <DropdownMenuItem key={it.label} asChild>
            <Link to={it.to as never} search={it.search as never}>{it.label}</Link>
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem key={it.label} onSelect={it.onSelect} disabled={it.disabled} title={it.title}
            className={it.danger ? "gx-bad" : undefined}>
            {it.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** Cellule « ⋯ » : bloque le clic de ligne (qui ouvre le détail). */
function MenuCell({ children }: { children: ReactNode }) {
  return <td className="gx-cp-mc" onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>{children}</td>;
}

/** Mini courbe, même dessin que la maquette (84 × 26). */
function Spark({ values }: { values: number[] }) {
  const v = values.length > 1 ? values : [0, ...(values.length ? values : [0])];
  const half = Math.floor(v.length / 2);
  const a = v.slice(0, half).reduce((x, y) => x + y, 0);
  const b = v.slice(half).reduce((x, y) => x + y, 0);
  const kind = b > a * 1.1 ? "ok" : b < a * 0.9 ? "bad" : "dim";
  const col = kind === "ok" ? "var(--gx-ok)" : kind === "bad" ? "var(--gx-bad)" : "var(--gx-dim)";
  const W = 84, H = 26, mx = Math.max(...v) || 1;
  const pts = v.map((x, i) => [(i / (v.length - 1)) * (W - 6) + 3, H - 4 - (x / mx) * (H - 8)]);
  const line = pts.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const last = pts[pts.length - 1];
  return (
    <svg className="gx-spark" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={kind === "bad" ? "Tendance en baisse" : kind === "ok" ? "Tendance en hausse" : "Tendance stable"}>
      <polygon points={`3,${H - 4} ${line} ${W - 3},${H - 4}`} fill={col} opacity=".12" />
      <polyline points={line} fill="none" stroke={col} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" strokeDasharray={kind === "bad" ? "3 2.5" : undefined} />
      {kind === "bad"
        ? <path d={`M${last[0] - 3.5},${last[1] - 2.5}h7l-3.5,5z`} fill={col} />
        : <circle cx={last[0]} cy={last[1]} r="2.6" fill={col} />}
    </svg>
  );
}

/** Vignette d'une création (36 × 48, classe .gx-ph des vignettes). */
function Thumb({ url, video }: { url?: string | null; video?: boolean }) {
  if (url && video) return <span className="gx-ph"><VideoPoster src={url} className="h-full w-full object-cover" /></span>;
  if (url) return <span className="gx-ph"><img src={url} alt="" loading="lazy" /></span>;
  return <span className="gx-ph" aria-hidden />;
}

/** Interrupteur de diffusion (vert = diffuse). */
function DiffToggle({ on, name, busy, disabled, title, onToggle }: {
  on: boolean; name: string; busy?: boolean; disabled?: boolean; title?: string; onToggle: () => void;
}) {
  return (
    <button type="button" className={cn("gx-tg", on && "gx-on")} aria-pressed={on} aria-busy={busy || undefined}
      aria-label={`Diffuser ${name}`} title={title} disabled={busy || disabled}
      onClick={(e) => { e.stopPropagation(); onToggle(); }} />
  );
}

/** Champ de renommage affiché à la place du nom. */
function RenameInput({ value, onSave, onCancel }: { value: string; onSave: (v: string) => void; onCancel: () => void }) {
  const [v, setV] = useState(value);
  const save = () => { const t = v.trim(); if (t && t !== value) onSave(t); else onCancel(); };
  return (
    <span className="gx-cp-ren" onClick={(e) => e.stopPropagation()}>
      <input autoFocus className="gx-in" value={v} aria-label="Nouveau nom" onChange={(e) => setV(e.target.value)}
        onKeyDown={(e) => { e.stopPropagation(); if (e.key === "Enter") save(); if (e.key === "Escape") onCancel(); }} />
      <button type="button" className="gx-ib gx-sm" onClick={save} aria-label="Enregistrer"><Check className="gx-i" /></button>
      <button type="button" className="gx-ib gx-sm" onClick={onCancel} aria-label="Annuler"><X className="gx-i" /></button>
    </span>
  );
}

/** Champ de budget (ensembles Meta). */
function BudgetInput({ value, suffix, onSave, onCancel }: { value: number; suffix: string; onSave: (v: number) => void; onCancel: () => void }) {
  const [v, setV] = useState(String(value));
  const save = () => {
    const n = parseFloat(v);
    if (Number.isFinite(n) && n > 0 && n !== value) onSave(n); else onCancel();
  };
  return (
    <span className="gx-cp-ren gx-cp-bud">
      <input autoFocus type="number" min={1} className="gx-in gx-num" value={v} aria-label="Nouveau budget"
        onChange={(e) => setV(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") save(); if (e.key === "Escape") onCancel(); }} />
      <span className="gx-hint">{suffix}</span>
      <button type="button" className="gx-ib gx-sm" onClick={save} aria-label="Enregistrer"><Check className="gx-i" /></button>
      <button type="button" className="gx-ib gx-sm" onClick={onCancel} aria-label="Annuler"><X className="gx-i" /></button>
    </span>
  );
}

/** Tableau de la maquette (#ctab) : nom à gauche, chiffres à droite en mono. */
function CTable({ head, children }: { head: ReactNode; children: ReactNode }) {
  return (
    <div className="gx-tbl">
      <table id="ctab">
        <thead><tr>{head}<th><span className="sr-only">Actions</span></th></tr></thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

function LoadingRow({ cols, text }: { cols: number; text: string }) {
  return <tr><td colSpan={cols} className="gx-hint">{text}</td></tr>;
}

function EmptyCampaigns() {
  return (
    <div className="gx-empty">
      <b>Aucune campagne ici</b>
      <p>Lance ta première campagne en 5 étapes, je t'accompagne.</p>
      <Link to="/campaigns/new" className="gx-btn gx-sm gx-pri"><Plus className="gx-i" />Nouvelle campagne</Link>
    </div>
  );
}

function EmptyFiltered({ onReset }: { onReset: () => void }) {
  return (
    <div className="gx-empty">
      <b>Aucun résultat</b>
      <p>Rien ne correspond à ta recherche ou à ces filtres.</p>
      <button type="button" className="gx-btn gx-sm" onClick={onReset}>Effacer les filtres</button>
    </div>
  );
}

function EmptyText({ title, text, onRefresh }: { title: string; text: string; onRefresh?: () => void }) {
  return (
    <div className="gx-empty">
      <b>{title}</b>
      <p>{text}</p>
      {onRefresh && <button type="button" className="gx-btn gx-sm" onClick={onRefresh}><RefreshCw className="gx-i" />Actualiser</button>}
    </div>
  );
}

const META_LOADING = "Récupération de tes données depuis Meta… cela peut prendre jusqu'à une minute sur les gros comptes.";

type ConfirmState = { title: string; description: string; confirmLabel?: string; destructive?: boolean; onConfirm: () => void } | null;

/** Panneau de confirmation de la maquette (#confirm). */
function ConfirmDialog({ state, onOpenChange }: { state: ConfirmState; onOpenChange: (open: boolean) => void }) {
  return (
    <DialogPrimitive.Root open={!!state} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="gx-sheet console-app-portal">
          <DialogPrimitive.Content className="gx-sheet-b gx-narrow">
            <div className="gx-sheet-h">
              <div><DialogPrimitive.Title asChild><b>{state?.title ?? "Confirmer"}</b></DialogPrimitive.Title></div>
              <DialogPrimitive.Close className="gx-ib gx-sm" aria-label="Fermer"><X className="gx-i" /></DialogPrimitive.Close>
            </div>
            <div className="gx-ls-b"><DialogPrimitive.Description>{state?.description}</DialogPrimitive.Description></div>
            <div className="gx-sheet-f">
              <div className="gx-sp" />
              <DialogPrimitive.Close className="gx-btn">Annuler</DialogPrimitive.Close>
              <button type="button" className={cn("gx-btn", state?.destructive ? "gx-danger" : "gx-pri")} onClick={() => state?.onConfirm()}>
                {state?.confirmLabel ?? "Confirmer"}
              </button>
            </div>
          </DialogPrimitive.Content>
        </DialogPrimitive.Overlay>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

/** Récapitulatif (nom, budget, objectif) avant de publier un brouillon sur Meta. */
function PublishConfirmDialog({ target, onOpenChange, onConfirm }:
  { target: { id: string; name: string; objective: string; budget: number } | null; onOpenChange: (open: boolean) => void; onConfirm: () => void }) {
  return (
    <DialogPrimitive.Root open={!!target} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="gx-sheet console-app-portal">
          <DialogPrimitive.Content className="gx-sheet-b gx-narrow">
            <div className="gx-sheet-h">
              <div>
                <DialogPrimitive.Title asChild><b>Publier « {target?.name} » sur Meta ?</b></DialogPrimitive.Title>
                <DialogPrimitive.Description asChild><small>Vérifie les informations avant de lancer la diffusion.</small></DialogPrimitive.Description>
              </div>
              <DialogPrimitive.Close className="gx-ib gx-sm" aria-label="Fermer"><X className="gx-i" /></DialogPrimitive.Close>
            </div>
            <div className="gx-ls-b">
              <dl className="gx-recap">
                <dt>Nom</dt><dd>{target?.name}</dd>
                <dt>Objectif</dt><dd>{target ? objectiveText(target.objective) : ""}</dd>
                <dt>Budget par jour</dt><dd className="gx-num">{target?.budget ? frEuro(target.budget) : DASH}</dd>
              </dl>
            </div>
            <div className="gx-sheet-f">
              <div className="gx-sp" />
              <DialogPrimitive.Close className="gx-btn">Annuler</DialogPrimitive.Close>
              <button type="button" className="gx-btn gx-pri" onClick={onConfirm}>Publier</button>
            </div>
          </DialogPrimitive.Content>
        </DialogPrimitive.Overlay>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

/** « Afficher 50 de plus » pour les longues listes (onglet Hors ligne). */
function useLoadMore<T>(rows: T[], step = 50) {
  const [count, setCount] = useState(step);
  useEffect(() => { setCount(step); }, [rows.length]);
  return { visible: rows.slice(0, count), hasMore: count < rows.length, showMore: () => setCount((c) => c + step), total: rows.length };
}

function LoadMoreBar({ hasMore, onClick, shown, total }: { hasMore: boolean; onClick: () => void; shown: number; total: number }) {
  if (total <= shown && !hasMore) return null;
  return (
    <div className="gx-row justify-center">
      <span className="gx-hint gx-num">{frNumber(shown)} sur {frNumber(total)}</span>
      {hasMore && <button type="button" className="gx-btn gx-sm" onClick={onClick}>Afficher 50 de plus</button>}
    </div>
  );
}

/** Nettoyage des campagnes Meta sans publicité : aperçu puis confirmation. */
function useCleanup(onDone: () => void) {
  const cleanup = useServerFn(cleanupEmptyMetaCampaigns);
  const [busy, setBusy] = useState(false);
  const [names, setNames] = useState<string[] | null>(null);

  const start = async () => {
    setBusy(true);
    try {
      const r = await cleanup({ data: { dryRun: true } });
      if ((r.names?.length ?? 0) === 0) {
        toast.success("Aucune campagne vide sur Meta.");
        return;
      }
      setNames(r.names ?? []);
    } catch (e) { toast.error(e instanceof Error ? e.message : "Erreur"); }
    finally { setBusy(false); }
  };

  const confirmDelete = async () => {
    setBusy(true);
    try {
      const r = await cleanup({ data: { dryRun: false } });
      toast.success(`${r.deleted} campagne(s) vide(s) supprimée(s)`);
      onDone();
    } catch (e) { toast.error(e instanceof Error ? e.message : "Erreur"); }
    finally { setBusy(false); setNames(null); }
  };

  const dialog = (
    <DialogPrimitive.Root open={!!names} onOpenChange={(o) => { if (!o && !busy) setNames(null); }}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="gx-sheet console-app-portal">
          <DialogPrimitive.Content className="gx-sheet-b gx-narrow">
            <div className="gx-sheet-h">
              <div>
                <DialogPrimitive.Title asChild><b>Supprimer {names?.length ?? 0} campagne(s) vide(s) sur Meta ?</b></DialogPrimitive.Title>
                <DialogPrimitive.Description asChild><small>Ces campagnes ne contiennent aucune publicité et seront supprimées définitivement sur Meta.</small></DialogPrimitive.Description>
              </div>
              <DialogPrimitive.Close className="gx-ib gx-sm" aria-label="Fermer" disabled={busy}><X className="gx-i" /></DialogPrimitive.Close>
            </div>
            <div className="gx-ls-b">
              <ul className="gx-cp-list">{(names ?? []).map((n, i) => <li key={i}>{n}</li>)}</ul>
            </div>
            <div className="gx-sheet-f">
              <div className="gx-sp" />
              <DialogPrimitive.Close className="gx-btn" disabled={busy}>Annuler</DialogPrimitive.Close>
              <button type="button" className="gx-btn gx-danger" disabled={busy} onClick={() => void confirmDelete()}>
                {busy ? "Suppression…" : "Nettoyer les vides"}
              </button>
            </div>
          </DialogPrimitive.Content>
        </DialogPrimitive.Overlay>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );

  return { start, busy, dialog };
}

/** Erreur de synchronisation avec l'API Meta - aucune donnée factice affichée. */
function MetaSyncError({ error, onRetry }: { error: unknown; onRetry: () => void }) {
  const raw = error instanceof Error ? error.message : String(error ?? "");
  const expired = raw.includes("META_TOKEN_EXPIRED");
  return (
    <div className="gx-empty">
      <b>{expired ? "Connexion Meta expirée" : "Impossible de récupérer tes données Meta"}</b>
      <p>
        {expired
          ? "Ton accès Meta n'est plus valide. Reconnecte ton compte pour retrouver tes campagnes réelles."
          : "La synchronisation avec ton compte publicitaire Meta a échoué. Aucune donnée n'est affichée pour éviter d'afficher des informations inexactes."}
      </p>
      {!expired && raw && <p className="gx-hint">{raw}</p>}
      {expired ? <MetaConnectButton /> : (
        <button type="button" className="gx-btn gx-sm" onClick={onRetry}><RefreshCw className="gx-i" />Réessayer</button>
      )}
    </div>
  );
}

function MetaConnectPrompt({ expired }: { expired: boolean }) {
  return (
    <div className="gx-empty">
      <b>{expired ? "Connexion Meta expirée" : "Connecte ton compte Meta"}</b>
      <p>{expired
        ? "Ton jeton d'accès a expiré, reconnecte ton compte Meta pour récupérer tes campagnes."
        : "Connecte ton compte Meta pour voir tes campagnes en ligne."}</p>
      <MetaConnectButton />
    </div>
  );
}

// =============== Badges ===============

const DRAFT_STATUS_HINTS: Record<string, string> = {
  draft: "Configuration en cours : il manque encore des éléments avant l'envoi sur Meta.",
  ready: "Tout est configuré et validé : la campagne peut être envoyée sur Meta.",
  published: "Déjà envoyée sur Meta : elle existe sur ton compte publicitaire.",
};
const DRAFT_STATUS_TIP = `Brouillon : ${DRAFT_STATUS_HINTS.draft} Prête : ${DRAFT_STATUS_HINTS.ready} Publiée : ${DRAFT_STATUS_HINTS.published}`;

function DraftStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    draft: { label: "Brouillon", cls: "gx-off" },
    ready: { label: "Prête", cls: "gx-warn" },
    published: { label: "Publiée", cls: "gx-on" },
  };
  const s = map[status] ?? map.draft;
  return <span title={DRAFT_STATUS_HINTS[status] ?? DRAFT_STATUS_HINTS.draft} className={`gx-st ${s.cls}`}>{s.label}</span>;
}

const META_STATUS: Record<string, { label: string; cls: string }> = {
  ACTIVE: { label: "En ligne", cls: "gx-on" }, PAUSED: { label: "En pause", cls: "gx-off" },
  DELETED: { label: "Supprimée", cls: "gx-bad" }, ARCHIVED: { label: "Archivée", cls: "gx-off" },
  CAMPAIGN_PAUSED: { label: "Campagne en pause", cls: "gx-off" }, ADSET_PAUSED: { label: "Ensemble en pause", cls: "gx-warn" },
  PENDING_REVIEW: { label: "En revue", cls: "gx-rev" }, IN_PROCESS: { label: "En revue", cls: "gx-rev" },
  DISAPPROVED: { label: "Refusée", cls: "gx-bad" }, WITH_ISSUES: { label: "À corriger", cls: "gx-bad" },
};

function MetaStatusBadge({ status }: { status: string }) {
  const s = META_STATUS[status] ?? { label: status || DASH, cls: "gx-off" };
  return <span className={`gx-st ${s.cls}`}>{s.label}</span>;
}

/**
 * Statut réel d'une campagne Meta : « En ligne » exige une diffusion constatée
 * (au moins une publicité active + des impressions aujourd'hui), pas seulement
 * l'interrupteur Meta positionné sur ACTIVE.
 */
function MetaLiveBadge({ campaign }: { campaign: any }) {
  const eff = String(campaign?.effective_status ?? "");
  if (typeof campaign?.is_online !== "boolean" || eff === "PENDING_REVIEW" || eff === "IN_PROCESS" || eff === "DISAPPROVED" || eff === "WITH_ISSUES") {
    return <MetaStatusBadge status={eff} />;
  }
  if (campaign.is_online) {
    return <span className="gx-st gx-on" title="Cette campagne diffuse réellement aujourd'hui.">En ligne</span>;
  }
  const reason = campaign.offline_reason ?? "Aucune diffusion constatée aujourd'hui";
  const switchedOn = eff === "ACTIVE";
  if (!switchedOn && eff === "ARCHIVED") return <span className="gx-st gx-off" title={reason}>Archivée</span>;
  return <span className={`gx-st ${switchedOn ? "gx-warn" : "gx-off"}`} title={reason}>{switchedOn ? "Hors ligne" : "En pause"}</span>;
}

/** Badge d'origine de la maquette : « Growthity » ou « Hors Growthity ». */
function OriginBadge({ via }: { via: boolean }) {
  return via
    ? <span className="gx-gb" title="Campagne créée et publiée depuis Growthity">Growthity</span>
    : <span className="gx-gb gx-out" title="Campagne créée directement sur Meta Ads Manager, hors Growthity">Hors Growthity</span>;
}

function AudienceSummary({ targeting }: { targeting: any }) {
  if (!targeting) return <span>Auto</span>;
  const parts: string[] = [];
  const geo = targeting.geo_locations;
  if (geo?.countries?.length) parts.push(geo.countries.join(", "));
  if (geo?.zips?.length) parts.push(`${geo.zips.length} zones`);
  const ageMin = targeting.age_min || 18;
  const ageMax = targeting.age_max || 65;
  parts.push(ageMin !== 18 || ageMax !== 65 ? `${ageMin}-${ageMax} ans` : "18-65+ ans");
  const genders = targeting.genders;
  if (genders?.length === 1) parts.push(genders[0] === 1 ? "Hommes" : "Femmes");
  return <span className="gx-cp-aud" title={parts.join(" · ")}>{parts.join(" · ")}</span>;
}

// =============== BROUILLONS - Campagnes ===============

function DraftCampaignsView({ items, total, loading, hasMetaCreds, viewMode, onChanged, onOpenDetail, onResetFilters }: {
  items: any[]; total: number; loading: boolean; hasMetaCreds: boolean; viewMode: "list" | "cards";
  onChanged: () => void; onOpenDetail: (id: string) => void; onResetFilters: () => void;
}) {
  const remove = useServerFn(deleteMarketingCampaign);
  const [publishTarget, setPublishTarget] = useState<{ id: string; objective: string } | null>(null);
  const [publishConfirm, setPublishConfirm] = useState<{ id: string; name: string; objective: string; budget: number } | null>(null);
  const [confirmState, setConfirmState] = useState<ConfirmState>(null);

  const cards = useMemo(() => items.map((c) => {
    const sets = c.ad_sets ?? [];
    const allAds = sets.flatMap((s: any) => (s.campaign_ads ?? []).map((ca: any) => ca));
    const thumbs = allAds
      .map((ca: any) => ({ url: ca.ads?.generated_url as string | undefined, video: ca.ads?.content_type === "video" }))
      .filter((t: any) => !!t.url)
      .slice(0, 3);
    return { ...c, _sets: sets.length, _ads: allAds.length, _budget: Number(sets[0]?.budget_amount ?? 0), _thumbs: thumbs };
  }).sort((a: any, b: any) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()), [items]);

  const onDelete = (id: string, name: string) => {
    setConfirmState({
      title: `Supprimer « ${name} » ?`,
      description: "Ce brouillon et ses publicités seront supprimés de Growthity. Cette action est irréversible.",
      confirmLabel: "Supprimer",
      destructive: true,
      onConfirm: async () => {
        setConfirmState(null);
        try { await remove({ data: { id } }); onChanged(); toast.success("Supprimée"); }
        catch (e) { toast.error(e instanceof Error ? e.message : "Erreur"); }
      },
    });
  };

  const canPublishOf = (c: any) => hasMetaCreds && c._ads > 0 && c.status !== "published" && c.platform === "meta";
  const askPublish = (c: any) => setPublishConfirm({ id: c.id, name: c.name, objective: c.objective, budget: c._budget });
  const menuFor = (c: any): MenuEntry[] => [
    { label: "Voir le détail", onSelect: () => onOpenDetail(c.id) },
    { label: c._ads === 0 ? "Compléter" : "Modifier", to: "/campaigns/new", search: { id: c.id } },
    ...(canPublishOf(c) ? [{ label: "Publier sur Meta", onSelect: () => askPublish(c) }] : []),
    { label: "Supprimer", onSelect: () => onDelete(c.id, c.name), danger: true },
  ];
  const mainAction = (c: any) => canPublishOf(c) ? (
    <button type="button" className="gx-btn gx-sm gx-pri" onClick={(e) => { e.stopPropagation(); askPublish(c); }}>Publier</button>
  ) : (
    <Link to="/campaigns/new" search={{ id: c.id } as never} className="gx-btn gx-sm" onClick={(e) => e.stopPropagation()}>
      {c._ads === 0 ? "Compléter" : "Reprendre"}
    </Link>
  );

  const dialogs = (
    <>
      {publishTarget && (
        <MetaPublishDialog campaignId={publishTarget.id} objective={publishTarget.objective}
          open={!!publishTarget} onOpenChange={(o) => { if (!o) setPublishTarget(null); }}
          onPublished={() => { setPublishTarget(null); onChanged(); }} />
      )}
      <PublishConfirmDialog target={publishConfirm} onOpenChange={(o) => { if (!o) setPublishConfirm(null); }}
        onConfirm={() => { if (publishConfirm) setPublishTarget({ id: publishConfirm.id, objective: publishConfirm.objective }); setPublishConfirm(null); }} />
      <ConfirmDialog state={confirmState} onOpenChange={(o) => { if (!o) setConfirmState(null); }} />
    </>
  );

  if (!loading && total === 0) return <EmptyCampaigns />;
  if (!loading && cards.length === 0) return <EmptyFiltered onReset={onResetFilters} />;

  if (viewMode === "cards" && !loading) {
    return (
      <>
        <div className="gx-cgrid gx-cp-grid">
          {cards.map((c: any) => (
            <div key={c.id} className="gx-ccard gx-cp-card" role="button" tabIndex={0} title="Voir le détail de la campagne"
              onClick={() => onOpenDetail(c.id)} onKeyDown={(e) => { if (e.key === "Enter" && e.target === e.currentTarget) onOpenDetail(c.id); }}>
              {c._thumbs[0]?.video
                ? <span className="gx-cp-img"><VideoPoster src={c._thumbs[0].url} className="h-full w-full object-cover" /></span>
                : c._thumbs[0]?.url
                  ? <img src={c._thumbs[0].url} alt="" loading="lazy" />
                  : <span className="gx-cp-img gx-cp-noimg">Pas encore de publicité</span>}
              {c._ads > 1 && <span className="gx-ty gx-num">{c._ads} pubs</span>}
              <div>
                <b title={c.name}>{c.name}</b>
                <span className="gx-row"><DraftStatusBadge status={c.status} /><span className="gx-gb gx-out">{c.platform === "tiktok" ? "Autre" : "Meta"}</span></span>
                <small className="gx-hint">Objectif : {objectiveText(c.objective)}</small>
                <small className="gx-hint gx-num">{c._sets} ens. · {c._ads} pub{c._ads > 1 ? "s" : ""} · {c._budget ? `${frEuro(c._budget)}/j` : DASH}</small>
                <span className="gx-row" onClick={(e) => e.stopPropagation()}>{mainAction(c)}<RowMenu name={c.name} items={menuFor(c)} /></span>
              </div>
            </div>
          ))}
        </div>
        {dialogs}
      </>
    );
  }

  return (
    <>
      <CTable head={<>
        <th>Diffusion</th><th>Campagne</th>
        <th><span className="gx-tipw" tabIndex={0} data-tip={DRAFT_STATUS_TIP}>Statut<i>?</i></span></th>
        <th>Plateforme</th><th>Budget</th><th>Ensembles</th><th>Pubs</th><th>Modifiée le</th>
      </>}>
        {loading ? <LoadingRow cols={9} text="Chargement de tes brouillons…" /> : cards.map((c: any) => (
          <tr key={c.id} className="gx-lr" tabIndex={0} title="Voir le détail de la campagne"
            onClick={() => onOpenDetail(c.id)} onKeyDown={(e) => { if (e.key === "Enter" && e.target === e.currentTarget) onOpenDetail(c.id); }}>
            <td>{mainAction(c)}</td>
            <td>
              <div className="gx-cp-cn">
                <Thumb url={c._thumbs[0]?.url} video={c._thumbs[0]?.video} />
                <div><b title={c.name}>{c.name}</b> <span className="gx-gb">Growthity</span><small>Objectif : {objectiveText(c.objective)}</small></div>
              </div>
            </td>
            <td><DraftStatusBadge status={c.status} /></td>
            <td><span className="gx-gb gx-out">{c.platform === "tiktok" ? "Autre" : "Meta"}</span></td>
            <td className="gx-num">{c._budget ? formatEuroPerDay(c._budget) : DASH}</td>
            <td className="gx-num">{c._sets}</td>
            <td className="gx-num">{c._ads}</td>
            <td className="gx-num">{c.updated_at ? fmtDate(c.updated_at) : DASH}</td>
            <MenuCell><RowMenu name={c.name} items={menuFor(c)} /></MenuCell>
          </tr>
        ))}
      </CTable>
      {dialogs}
    </>
  );
}

// =============== BROUILLONS - Ensembles de publicités ===============

function DraftAdSetsView({ items, total, loading, onOpenDetail, onResetFilters }: {
  items: any[]; total: number; loading: boolean; onOpenDetail: (id: string) => void; onResetFilters: () => void;
}) {
  const rows = useMemo(() => [...items].sort((a, b) => String(a.campaign_name).localeCompare(String(b.campaign_name))), [items]);
  if (!loading && total === 0) return <EmptyText title="Aucun ensemble de pubs" text="Crée-en depuis une campagne : c'est là que tu choisis qui voit ta pub, où, et avec quel budget." />;
  if (!loading && rows.length === 0) return <EmptyFiltered onReset={onResetFilters} />;
  return (
    <CTable head={<><th>Action</th><th>Ensemble</th><th>Objectif</th><th>Pubs</th><th>Budget</th></>}>
      {loading ? <LoadingRow cols={6} text="Chargement de tes brouillons…" /> : rows.map((s: any) => (
        <tr key={s.id} className="gx-lr" tabIndex={0} title="Voir le détail de la campagne"
          onClick={() => onOpenDetail(s.campaign_id)} onKeyDown={(e) => { if (e.key === "Enter" && e.target === e.currentTarget) onOpenDetail(s.campaign_id); }}>
          <td><Link to="/campaigns/new" search={{ id: s.campaign_id } as never} className="gx-btn gx-sm" onClick={(e) => e.stopPropagation()}>Reprendre</Link></td>
          <td><b title={frSetName(s.name)}>{frSetName(s.name)}</b><small>Campagne : {s.campaign_name}</small></td>
          <td>{objectiveText(s.objective)}</td>
          <td className="gx-num">{s._adCount}</td>
          <td className="gx-num">{s.budget_amount ? `${frEuro(Number(s.budget_amount))}${s.budget_type === "lifetime" ? " total" : "/j"}` : DASH}</td>
          <MenuCell>
            <RowMenu name={frSetName(s.name)} items={[
              { label: "Voir le détail de la campagne", onSelect: () => onOpenDetail(s.campaign_id) },
              { label: "Modifier", to: "/campaigns/new", search: { id: s.campaign_id } },
            ]} />
          </MenuCell>
        </tr>
      ))}
    </CTable>
  );
}

// =============== BROUILLONS - Publicités ===============

function DraftAdsView({ items, total, loading, onChanged, onOpenDetail, onResetFilters }: {
  items: any[]; total: number; loading: boolean; onChanged: () => void; onOpenDetail: (id: string) => void; onResetFilters: () => void;
}) {
  const rows = useMemo(() => [...items].sort((a, b) => String(a.campaign_name).localeCompare(String(b.campaign_name))), [items]);
  const del = useServerFn(deleteCampaignAd);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirmState, setConfirmState] = useState<ConfirmState>(null);

  const onDelete = (ca: any) => {
    const label = ca.headline || ca.ads?.title || "cette créa";
    setConfirmState({
      title: `Retirer « ${label} » de la campagne ?`,
      description: "La créa est retirée de ce brouillon. Elle reste disponible dans tes créations.",
      confirmLabel: "Retirer",
      destructive: true,
      onConfirm: async () => {
        setConfirmState(null);
        setBusyId(ca.id);
        try { await del({ data: { id: ca.id } }); onChanged(); toast.success("Créa supprimée"); }
        catch (e) { toast.error(e instanceof Error ? e.message : "Erreur"); }
        finally { setBusyId(null); }
      },
    });
  };

  if (!loading && total === 0) return <EmptyText title="Aucune publicité créée" text="Ajoute des créations à une campagne pour les retrouver ici." />;
  if (!loading && rows.length === 0) return <EmptyFiltered onReset={onResetFilters} />;
  return (
    <>
      <CTable head={<><th>Action</th><th>Publicité</th><th>Ensemble</th><th>Campagne</th><th>Bouton</th></>}>
        {loading ? <LoadingRow cols={6} text="Chargement de tes brouillons…" /> : rows.map((ca: any) => {
          const ad = ca.ads;
          const title = ca.headline || ad?.title || "Publicité sans titre";
          return (
            <tr key={ca.id} className="gx-lr" tabIndex={0} title="Voir le détail de la campagne" aria-busy={busyId === ca.id || undefined}
              onClick={() => onOpenDetail(ca.campaign_id)} onKeyDown={(e) => { if (e.key === "Enter" && e.target === e.currentTarget) onOpenDetail(ca.campaign_id); }}>
              <td><Link to="/campaigns/new" search={{ id: ca.campaign_id } as never} className="gx-btn gx-sm" onClick={(e) => e.stopPropagation()}>Reprendre</Link></td>
              <td>
                <div className="gx-cp-cn">
                  <Thumb url={ad?.generated_url} video={ad?.content_type === "video"} />
                  <div><b title={title}>{title}</b><small>{ca.description || "Pas de description"}</small></div>
                </div>
              </td>
              <td>{frSetName(ca.adset_name)}</td>
              <td>{ca.campaign_name}</td>
              <td>{ca.cta_label || DASH}</td>
              <MenuCell>
                <RowMenu name={title} items={[
                  { label: "Voir le détail de la campagne", onSelect: () => onOpenDetail(ca.campaign_id) },
                  { label: "Modifier", to: "/campaigns/new", search: { id: ca.campaign_id } },
                  { label: busyId === ca.id ? "Suppression…" : "Retirer de la campagne", onSelect: () => onDelete(ca), danger: true, disabled: busyId === ca.id },
                ]} />
              </MenuCell>
            </tr>
          );
        })}
      </CTable>
      <ConfirmDialog state={confirmState} onOpenChange={(o) => { if (!o) setConfirmState(null); }} />
    </>
  );
}

// =============== META - Campagnes ===============

function MetaCampaignsView({ items, total, loading, viewMode, trend, onChanged, onOpenDetail, onResetFilters, paginate = false }: {
  items: any[]; total: number; loading: boolean; viewMode: "list" | "cards"; trend: Map<string, number[]> | null;
  onChanged: () => void; onOpenDetail: (c: any) => void; onResetFilters: () => void; paginate?: boolean;
}) {
  const setStatus = useServerFn(setMetaCampaignStatus);
  const del = useServerFn(deleteMetaCampaign);
  const rename = useServerFn(renameMetaItem);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [editAd, setEditAd] = useState<string | null>(null);
  const [renaming, setRenaming] = useState<string | null>(null);
  const [confirmState, setConfirmState] = useState<ConfirmState>(null);
  const navigate = useNavigate();

  const openInChat = (campaign: any) => {
    openMetaAdInChat({
      campaignId: campaign.id,
      campaignName: campaign.name,
      adId: campaign.first_ad_id ?? undefined,
      adName: campaign.first_ad_name ?? undefined,
    });
    navigate({ to: "/create", search: {} });
  };

  const cards = useMemo(() => items.map((c) => ({
    ...c,
    _budgetEur: (c.daily_budget ? Number(c.daily_budget) : c.lifetime_budget ? Number(c.lifetime_budget) : 0) / 100,
  })).sort((a: any, b: any) => {
    // en ligne d'abord, puis par dépense
    const aa = a.is_online ? 1 : 0;
    const bb = b.is_online ? 1 : 0;
    if (aa !== bb) return bb - aa;
    return (b.spend ?? 0) - (a.spend ?? 0);
  }), [items]);

  const loadMore = useLoadMore(cards, 50);
  const shownCards = paginate ? loadMore.visible : cards;

  const doToggle = async (c: any, next: "ACTIVE" | "PAUSED") => {
    setBusyId(c.id);
    try {
      await setStatus({ data: { campaign_id: c.id, status: next } });
      toast.success(next === "ACTIVE" ? `${c.name} relancée sur Meta` : `${c.name} mise en pause sur Meta`); onChanged();
    }
    catch (e) { toast.error(e instanceof Error ? e.message : "Erreur"); }
    finally { setBusyId(null); }
  };
  const toggle = (c: any) => {
    const next = c.effective_status === "ACTIVE" ? "PAUSED" : "ACTIVE";
    if (next === "PAUSED") {
      setConfirmState({
        title: `Mettre « ${c.name} » en pause ?`,
        description: "La diffusion de cette campagne s'arrêtera immédiatement sur Meta. Tu pourras la relancer à tout moment.",
        confirmLabel: "Mettre en pause",
        onConfirm: () => { setConfirmState(null); void doToggle(c, next); },
      });
    } else {
      void doToggle(c, next);
    }
  };
  const doRemove = async (c: any) => {
    setBusyId(c.id);
    try { await del({ data: { campaign_id: c.id } }); toast.success("Supprimée"); onChanged(); }
    catch (e) { toast.error(e instanceof Error ? e.message : "Erreur"); }
    finally { setBusyId(null); }
  };
  const remove = (c: any) => {
    setConfirmState({
      title: `Supprimer « ${c.name} » ?`,
      description: "Cette campagne et sa configuration seront supprimées définitivement sur Meta. Cette action est irréversible.",
      confirmLabel: "Supprimer",
      destructive: true,
      onConfirm: () => { setConfirmState(null); void doRemove(c); },
    });
  };
  const onRename = async (id: string, name: string) => {
    setRenaming(null);
    try { await rename({ data: { item_id: id, name } }); toast.success("Renommée"); onChanged(); }
    catch (e) { toast.error(e instanceof Error ? e.message : "Erreur"); }
  };

  const menuFor = (c: any): MenuEntry[] => [
    { label: "Voir le détail", onSelect: () => onOpenDetail(c) },
    { label: "Renommer", onSelect: () => setRenaming(c.id) },
    { label: "Modifier manuellement", onSelect: () => setEditAd(c.first_ad_id), disabled: !c.first_ad_id, title: c.first_ad_id ? undefined : "Aucune publicité à modifier" },
    { label: "Modifier via le chat IA", onSelect: () => openInChat(c), disabled: !c.first_ad_id, title: c.first_ad_id ? undefined : "Aucune publicité à modifier" },
    { label: "Supprimer", onSelect: () => remove(c), danger: true, disabled: busyId === c.id },
  ];
  const toggleOf = (c: any) => {
    const empty = (c.ads_count ?? 0) === 0;
    const isActive = c.effective_status === "ACTIVE";
    return (
      <DiffToggle on={isActive} name={c.name} busy={busyId === c.id} disabled={empty}
        title={empty ? "Aucune publicité dans cette campagne" : isActive ? "Mettre la campagne en pause" : "Activer / relancer la diffusion"}
        onToggle={() => toggle(c)} />
    );
  };
  const budgetOf = (c: any) => c.daily_budget ? formatEuroPerDay(c._budgetEur) : c.lifetime_budget ? `${frEuro(c._budgetEur)} total` : "Par ensemble";
  const nameOf = (c: any) => renaming === c.id
    ? <RenameInput value={c.name} onSave={(v) => void onRename(c.id, v)} onCancel={() => setRenaming(null)} />
    : <b title={c.name}>{c.name}</b>;

  const dialogs = (
    <>
      <EditMetaAdDialog adId={editAd} open={!!editAd} onOpenChange={(o) => !o && setEditAd(null)} onUpdated={onChanged} />
      <ConfirmDialog state={confirmState} onOpenChange={(o) => { if (!o) setConfirmState(null); }} />
    </>
  );

  if (!loading && total === 0) return <EmptyCampaigns />;
  if (!loading && cards.length === 0) return <EmptyFiltered onReset={onResetFilters} />;

  if (viewMode === "cards" && !loading) {
    return (
      <>
        <div className="gx-cp-kgrid">
          {shownCards.map((c: any) => (
            <div key={c.id} className="gx-kard gx-cp-card" role="button" tabIndex={0} title="Voir le détail de la campagne"
              onClick={() => onOpenDetail(c)} onKeyDown={(e) => { if (e.key === "Enter" && e.target === e.currentTarget) onOpenDetail(c); }}>
              <div className="gx-row">
                {toggleOf(c)}<MetaLiveBadge campaign={c} /><OriginBadge via={!!c.via_growthity} />
                <span className="gx-sp" />
                <span onClick={(e) => e.stopPropagation()}><RowMenu name={c.name} items={menuFor(c)} /></span>
              </div>
              <div className="gx-cp-kn">{nameOf(c)}<small>Objectif : {objectiveText(c.objective)}</small></div>
              <div className="gx-kpis">
                <div><small>Vues</small><b className="gx-num">{nOrDash(c.impressions)}</b></div>
                <div><small>Clics</small><b className="gx-num">{nOrDash(c.clicks)}</b></div>
                <div><small>Dépensé</small><b className="gx-num" title={frMoney(c.spend ?? 0)}>{num(c.spend) > 0 ? frEuro(c.spend) : DASH}</b></div>
              </div>
              <small className="gx-hint gx-num">
                {c.ads_count ?? 0} pub{(c.ads_count ?? 0) > 1 ? "s" : ""} · {budgetOf(c)} · coût par clic {num(c.cpc) > 0 ? frMoney(c.cpc) : DASH}
              </small>
            </div>
          ))}
        </div>
        {paginate && <LoadMoreBar hasMore={loadMore.hasMore} onClick={loadMore.showMore} shown={shownCards.length} total={loadMore.total} />}
        {dialogs}
      </>
    );
  }

  return (
    <>
      <CTable head={<>
        <th>Diffusion</th><th>Campagne</th><th>Statut</th><th>Tendance</th><th>Budget</th><th>Pubs</th><th>Vues</th><th>Clics</th>
        <th><span className="gx-tipw" tabIndex={0} data-tip="Sur 100 personnes qui voient ta pub, combien cliquent.">Taux de clic<i>?</i></span></th>
        <th><span className="gx-tipw" tabIndex={0} data-tip="Ce que te coûte chaque clic, en moyenne.">Coût par clic<i>?</i></span></th>
        <th>Dépensé</th>
      </>}>
        {loading ? <LoadingRow cols={12} text={META_LOADING} /> : shownCards.map((c: any) => {
          const series = trend?.get(String(c.id));
          return (
            <tr key={c.id} className="gx-lr" tabIndex={0} title="Voir le détail de la campagne"
              onClick={() => onOpenDetail(c)} onKeyDown={(e) => { if (e.key === "Enter" && e.target === e.currentTarget) onOpenDetail(c); }}>
              <td>{toggleOf(c)}</td>
              <td>{nameOf(c)} <OriginBadge via={!!c.via_growthity} /><small>Objectif : {objectiveText(c.objective)}</small></td>
              <td><MetaLiveBadge campaign={c} /></td>
              <td>{series ? <Spark values={series} /> : <span className="gx-hint">{trend ? DASH : "…"}</span>}</td>
              <td className="gx-num">{budgetOf(c)}</td>
              <td className="gx-num">{c.ads_count ?? 0}</td>
              <td className="gx-num">{nOrDash(c.impressions)}</td>
              <td className="gx-num">{nOrDash(c.clicks)}</td>
              <td className="gx-num" title={num(c.ctr) > 0 ? `Taux de clic exact : ${num(c.ctr).toFixed(4)} %` : undefined}>{num(c.ctr) > 0 ? frPercent(c.ctr, 1) : DASH}</td>
              <td className="gx-num" title={num(c.cpc) > 0 ? `Coût par clic exact : ${num(c.cpc).toFixed(4)} €` : undefined}>{num(c.cpc) > 0 ? frMoney(c.cpc) : DASH}</td>
              <td className="gx-num" title={num(c.spend) > 0 ? frMoney(c.spend) : undefined}>{num(c.spend) > 0 ? frEuro(c.spend) : DASH}</td>
              <MenuCell><RowMenu name={c.name} items={menuFor(c)} /></MenuCell>
            </tr>
          );
        })}
      </CTable>
      {paginate && !loading && <LoadMoreBar hasMore={loadMore.hasMore} onClick={loadMore.showMore} shown={shownCards.length} total={loadMore.total} />}
      {dialogs}
    </>
  );
}

// =============== META - Ensembles de publicités ===============

function MetaAdSetsView({ items, total, loading, onChanged, onResetFilters, paginate = false }: {
  items: any[]; total: number; loading: boolean; onChanged: () => void; onResetFilters: () => void; paginate?: boolean;
}) {
  const setStatus = useServerFn(setMetaAdSetStatus);
  const del = useServerFn(deleteMetaAdSet);
  const rename = useServerFn(renameMetaItem);
  const updBudget = useServerFn(updateMetaAdSetBudget);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [renaming, setRenaming] = useState<string | null>(null);
  const [budgetId, setBudgetId] = useState<string | null>(null);
  const [confirmState, setConfirmState] = useState<ConfirmState>(null);

  const loadMore = useLoadMore(items, 50);
  const shownRows = paginate ? loadMore.visible : items;

  const toggle = async (s: any) => {
    const next = s.effective_status === "ACTIVE" ? "PAUSED" : "ACTIVE";
    setBusyId(s.id);
    try { await setStatus({ data: { adset_id: s.id, status: next } }); toast.success("Mis à jour"); onChanged(); }
    catch (e) { toast.error(e instanceof Error ? e.message : "Erreur"); }
    finally { setBusyId(null); }
  };
  const remove = (s: any) => {
    setConfirmState({
      title: `Supprimer « ${frSetName(s.name)} » ?`,
      description: "Cet ensemble de pubs sera supprimé définitivement sur Meta. Cette action est irréversible.",
      confirmLabel: "Supprimer",
      destructive: true,
      onConfirm: async () => {
        setConfirmState(null);
        setBusyId(s.id);
        try { await del({ data: { adset_id: s.id } }); toast.success("Supprimé"); onChanged(); }
        catch (e) { toast.error(e instanceof Error ? e.message : "Erreur"); }
        finally { setBusyId(null); }
      },
    });
  };
  const onRename = async (id: string, name: string) => {
    setRenaming(null);
    try { await rename({ data: { item_id: id, name } }); toast.success("Renommé"); onChanged(); }
    catch (e) { toast.error(e instanceof Error ? e.message : "Erreur"); }
  };
  const onBudget = async (s: any, eur: number) => {
    setBudgetId(null);
    try {
      await updBudget({ data: { adset_id: s.id, budget_eur: eur, budget_type: (s.budget_type ?? "daily") as "daily" | "lifetime" } });
      toast.success("Budget mis à jour"); onChanged();
    }
    catch (e) { toast.error(e instanceof Error ? e.message : "Erreur"); }
  };

  if (!loading && total === 0) return (
    <EmptyText title="Aucun ensemble de pubs trouvé sur Meta"
      text="Les ensembles définissent qui voit tes pubs, où et avec quel budget. S'ils existent sur ton compte, actualise pour les récupérer."
      onRefresh={onChanged} />
  );
  if (!loading && items.length === 0) return <EmptyFiltered onReset={onResetFilters} />;

  return (
    <>
      <CTable head={<>
        <th>Diffusion</th><th>Ensemble</th><th>Statut</th><th>Audience</th><th>Budget</th><th>Vues</th><th>Clics</th>
        <th><span className="gx-tipw" tabIndex={0} data-tip="Sur 100 personnes qui voient ta pub, combien cliquent.">Taux de clic<i>?</i></span></th>
        <th><span className="gx-tipw" tabIndex={0} data-tip="Ce que te coûte chaque clic, en moyenne.">Coût par clic<i>?</i></span></th>
        <th>Dépensé</th>
      </>}>
        {loading ? <LoadingRow cols={11} text={META_LOADING} /> : shownRows.map((s: any) => {
          const isActive = s.effective_status === "ACTIVE";
          const suffix = s.budget_type === "daily" ? "€/j" : "€ total";
          return (
            <tr key={s.id}>
              <td><DiffToggle on={isActive} name={frSetName(s.name)} busy={busyId === s.id}
                title={isActive ? "Mettre l'ensemble en pause" : "Activer l'ensemble"} onToggle={() => void toggle(s)} /></td>
              <td>
                {renaming === s.id
                  ? <RenameInput value={s.name} onSave={(v) => void onRename(s.id, v)} onCancel={() => setRenaming(null)} />
                  : <b title={frSetName(s.name)}>{frSetName(s.name)}</b>}
                <small>Campagne : {s.campaign_name}</small>
              </td>
              <td><MetaStatusBadge status={s.effective_status} /></td>
              <td><AudienceSummary targeting={s.targeting} /></td>
              <td className="gx-num">
                {budgetId === s.id
                  ? <BudgetInput value={num(s.budget_eur)} suffix={suffix} onSave={(v) => void onBudget(s, v)} onCancel={() => setBudgetId(null)} />
                  : s.budget_type ? (s.budget_type === "daily" ? formatEuroPerDay(s.budget_eur) : `${frEuro(s.budget_eur)} total`) : DASH}
              </td>
              <td className="gx-num">{nOrDash(s.impressions)}</td>
              <td className="gx-num">{nOrDash(s.clicks)}</td>
              <td className="gx-num">{num(s.ctr) > 0 ? frPercent(s.ctr, 1) : DASH}</td>
              <td className="gx-num">{num(s.cpc) > 0 ? frMoney(s.cpc) : DASH}</td>
              <td className="gx-num" title={num(s.spend) > 0 ? frMoney(s.spend) : undefined}>{num(s.spend) > 0 ? frEuro(s.spend) : DASH}</td>
              <MenuCell>
                <RowMenu name={frSetName(s.name)} items={[
                  { label: "Renommer", onSelect: () => setRenaming(s.id) },
                  { label: "Modifier le budget", onSelect: () => setBudgetId(s.id), disabled: !s.budget_type, title: s.budget_type ? undefined : "Le budget est géré au niveau de la campagne" },
                  { label: "Supprimer", onSelect: () => remove(s), danger: true, disabled: busyId === s.id },
                ]} />
              </MenuCell>
            </tr>
          );
        })}
      </CTable>
      {paginate && !loading && <LoadMoreBar hasMore={loadMore.hasMore} onClick={loadMore.showMore} shown={shownRows.length} total={loadMore.total} />}
      <ConfirmDialog state={confirmState} onOpenChange={(o) => { if (!o) setConfirmState(null); }} />
    </>
  );
}

// =============== META - Publicités ===============

function MetaAdsView({ items, total, loading, onChanged, onResetFilters, paginate = false }: {
  items: any[]; total: number; loading: boolean; onChanged: () => void; onResetFilters: () => void; paginate?: boolean;
}) {
  const setStatus = useServerFn(setMetaAdStatus);
  const del = useServerFn(deleteMetaAd);
  const rename = useServerFn(renameMetaItem);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [editAd, setEditAd] = useState<string | null>(null);
  const [renaming, setRenaming] = useState<string | null>(null);
  const [confirmState, setConfirmState] = useState<ConfirmState>(null);
  const navigate = useNavigate();

  const openInChat = (a: any) => {
    openMetaAdInChat({ adId: a.id, adName: a.name, campaignName: a.campaign_name });
    navigate({ to: "/create" });
  };

  const loadMore = useLoadMore(items, 50);
  const shownRows = paginate ? loadMore.visible : items;

  const toggle = async (a: any) => {
    const next = a.effective_status === "ACTIVE" ? "PAUSED" : "ACTIVE";
    setBusyId(a.id);
    try { await setStatus({ data: { ad_id: a.id, status: next } }); toast.success("Mis à jour"); onChanged(); }
    catch (e) { toast.error(e instanceof Error ? e.message : "Erreur"); }
    finally { setBusyId(null); }
  };
  const remove = (a: any) => {
    setConfirmState({
      title: `Supprimer « ${a.name} » ?`,
      description: "Cette publicité sera supprimée définitivement sur Meta. Cette action est irréversible.",
      confirmLabel: "Supprimer",
      destructive: true,
      onConfirm: async () => {
        setConfirmState(null);
        setBusyId(a.id);
        try { await del({ data: { ad_id: a.id } }); toast.success("Supprimée"); onChanged(); }
        catch (e) { toast.error(e instanceof Error ? e.message : "Erreur"); }
        finally { setBusyId(null); }
      },
    });
  };
  const onRename = async (id: string, name: string) => {
    setRenaming(null);
    try { await rename({ data: { item_id: id, name } }); toast.success("Renommée"); onChanged(); }
    catch (e) { toast.error(e instanceof Error ? e.message : "Erreur"); }
  };

  if (!loading && total === 0) return (
    <EmptyText title="Aucune publicité trouvée sur Meta"
      text="Ce sont les visuels et textes réellement diffusés. Si tes campagnes en contiennent, actualise pour les récupérer depuis Meta."
      onRefresh={onChanged} />
  );
  if (!loading && items.length === 0) return <EmptyFiltered onReset={onResetFilters} />;

  return (
    <>
      <CTable head={<>
        <th>Diffusion</th><th>Publicité</th><th>Statut</th><th>Ensemble</th><th>Campagne</th><th>Vues</th><th>Clics</th>
        <th><span className="gx-tipw" tabIndex={0} data-tip="Sur 100 personnes qui voient ta pub, combien cliquent.">Taux de clic<i>?</i></span></th>
        <th><span className="gx-tipw" tabIndex={0} data-tip="Ce que te coûte chaque clic, en moyenne.">Coût par clic<i>?</i></span></th>
        <th>Dépensé</th>
      </>}>
        {loading ? <LoadingRow cols={11} text={META_LOADING} /> : shownRows.map((a: any) => {
          const isActive = a.effective_status === "ACTIVE";
          return (
            <tr key={a.id}>
              <td><DiffToggle on={isActive} name={a.name} busy={busyId === a.id}
                title={isActive ? "Mettre la publicité en pause" : "Activer la publicité"} onToggle={() => void toggle(a)} /></td>
              <td>
                <div className="gx-cp-cn">
                  {a.thumbnail_url
                    ? <span className="gx-ph gx-cp-th"><img src={a.thumbnail_url} alt="" loading="lazy" />{a.is_video && <Film className="gx-i" aria-label="Vidéo" />}</span>
                    : <span className="gx-ph gx-cp-th" title="Aperçu indisponible : Meta n'a pas encore généré de miniature pour cette création."><ImageIcon className="gx-i" aria-hidden /></span>}
                  <div>
                    {renaming === a.id
                      ? <RenameInput value={a.name} onSave={(v) => void onRename(a.id, v)} onCancel={() => setRenaming(null)} />
                      : <b title={a.name}>{a.name}</b>}
                    <small title={a.text || undefined}>{a.text || DASH}</small>
                  </div>
                </div>
              </td>
              <td><MetaStatusBadge status={a.effective_status} /></td>
              <td>{frSetName(a.adset_name)}</td>
              <td>{a.campaign_name}</td>
              <td className="gx-num">{nOrDash(a.impressions)}</td>
              <td className="gx-num">{nOrDash(a.clicks)}</td>
              <td className="gx-num">{num(a.ctr) > 0 ? frPercent(a.ctr, 1) : DASH}</td>
              <td className="gx-num">{num(a.cpc) > 0 ? frMoney(a.cpc) : DASH}</td>
              <td className="gx-num" title={num(a.spend) > 0 ? frMoney(a.spend) : undefined}>{num(a.spend) > 0 ? frEuro(a.spend) : DASH}</td>
              <MenuCell>
                <RowMenu name={a.name} items={[
                  { label: "Renommer", onSelect: () => setRenaming(a.id) },
                  { label: "Modifier manuellement", onSelect: () => setEditAd(a.id) },
                  { label: "Modifier via le chat IA", onSelect: () => openInChat(a) },
                  { label: "Supprimer", onSelect: () => remove(a), danger: true, disabled: busyId === a.id },
                ]} />
              </MenuCell>
            </tr>
          );
        })}
      </CTable>
      {paginate && !loading && <LoadMoreBar hasMore={loadMore.hasMore} onClick={loadMore.showMore} shown={shownRows.length} total={loadMore.total} />}
      <EditMetaAdDialog adId={editAd} open={!!editAd} onOpenChange={(o) => !o && setEditAd(null)} onUpdated={onChanged} />
      <ConfirmDialog state={confirmState} onOpenChange={(o) => { if (!o) setConfirmState(null); }} />
    </>
  );
}
