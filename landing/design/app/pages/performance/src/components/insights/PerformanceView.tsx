import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { getMetaPerformance } from "@/lib/meta-insights.functions";
import { listLeads } from "@/lib/leads.functions";
import { frSetName } from "@/lib/meta-labels";
import { frDecimal, frEuro, frMoney, frNumber, frPercent } from "@/lib/format";
import { GLOSSARY, type RangeKey } from "@/components/insights/shared";
import { CampaignGroupPicker } from "@/components/insights/CampaignGroupPicker";
import { DailyBarChart, chartGranularity, metricMeta, type MetricKey } from "@/components/insights/MetricChart";
import { MetaConnectButton } from "@/components/MetaConnectDialog";
import { GxSelectTrigger as SelectTrigger } from "@/components/ui/gx-controls";
import { Select, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/*
 * Onglet « Évolution » de Performance : copie de la maquette validée
 * (landing/design/app/views/performance.html), branchée sur les vrais chiffres Meta.
 */

type SortKey = "name" | "spend" | "impressions" | "clicks" | "ctr" | "cpc" | "results";

type Totals = {
  spend: number; impressions: number; clicks: number; reach: number; results: number; revenue: number;
  ctr: number; cpc: number; cost_per_result: number; roas: number;
};

type Point = { date: string } & Omit<Totals, "cost_per_result" | "roas">;

const EMPTY: Totals = { spend: 0, impressions: 0, clicks: 0, reach: 0, results: 0, revenue: 0, ctr: 0, cpc: 0, cost_per_result: 0, roas: 0 };

/** Additionne les totaux d'un sous-ensemble de campagnes (ratios recalculés). */
function sumTotals(list: Array<{ spend: number; impressions: number; clicks: number; reach: number; results: number; revenue?: number }>): Totals {
  const t = list.reduce<{ spend: number; impressions: number; clicks: number; reach: number; results: number; revenue: number }>(
    (acc, p) => ({
      spend: acc.spend + (p.spend || 0),
      impressions: acc.impressions + (p.impressions || 0),
      clicks: acc.clicks + (p.clicks || 0),
      reach: acc.reach + (p.reach || 0),
      results: acc.results + (p.results || 0),
      revenue: acc.revenue + (p.revenue || 0),
    }),
    { spend: 0, impressions: 0, clicks: 0, reach: 0, results: 0, revenue: 0 },
  );
  return {
    ...t,
    ctr: t.impressions > 0 ? (t.clicks / t.impressions) * 100 : 0,
    cpc: t.clicks > 0 ? t.spend / t.clicks : 0,
    cost_per_result: t.results > 0 ? t.spend / t.results : 0,
    roas: t.spend > 0 ? t.revenue / t.spend : 0,
  };
}

/** Fusionne les séries journalières de plusieurs campagnes. */
function mergeSeries(series: Point[][]): Point[] {
  const byDate = new Map<string, Point>();
  for (const list of series) {
    for (const p of list) {
      const cur = byDate.get(p.date);
      if (!cur) { byDate.set(p.date, { ...p }); continue; }
      cur.spend += p.spend; cur.impressions += p.impressions; cur.clicks += p.clicks;
      cur.reach += p.reach; cur.results += p.results; cur.revenue += p.revenue;
      cur.ctr = cur.impressions > 0 ? (cur.clicks / cur.impressions) * 100 : 0;
      cur.cpc = cur.clicks > 0 ? cur.spend / cur.clicks : 0;
    }
  }
  return [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date));
}

/** Montant comme dans la maquette : « 424 € » au-delà de 100 €, sinon avec centimes. */
const money = (v: number) => (Math.abs(v) >= 100 ? frEuro(v) : frMoney(v));

/** Variation en couleur, comme la maquette (vert = bonne nouvelle, rouge = mauvaise). */
function Delta({ current, previous, invert, points }: { current: number; previous: number; invert?: boolean; points?: boolean }) {
  if (!previous) return <em>Pas de comparaison</em>;
  if (points) {
    const d = current - previous;
    if (Math.abs(d) < 0.05) return <em title="Par rapport à la période précédente">stable</em>;
    const good = invert ? d < 0 : d > 0;
    return <em className={good ? "gx-up" : "gx-dn"} title="Par rapport à la période précédente">{d > 0 ? "+" : "−"}{frDecimal(Math.abs(d), 1)}{" "}pt</em>;
  }
  const pct = ((current - previous) / Math.abs(previous)) * 100;
  if (Math.abs(pct) < 0.5) return <em title="Par rapport à la période précédente">stable</em>;
  const good = invert ? pct < 0 : pct > 0;
  return <em className={good ? "gx-up" : "gx-dn"} title="Par rapport à la période précédente">{pct > 0 ? "+" : "−"}{Math.abs(Math.round(pct))}{" "}%</em>;
}

/** Libellé avec infobulle « ? » (même mécanique que la maquette : data-tip). */
function Tip({ label, text }: { label: string; text?: string }) {
  if (!text) return <>{label}</>;
  return <span className="gx-tipw" tabIndex={0} data-tip={text}>{label}<i>?</i></span>;
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

const CHART_METRICS: MetricKey[] = ["results", "spend", "clicks", "ctr"];
const OTHER_METRICS: { key: MetricKey; label: string }[] = [
  { key: "impressions", label: "Affichages" },
  { key: "cpc", label: "Coût par clic" },
];

const PERIOD_LABELS: Record<string, { cur: string; prev?: string }> = {
  today: { cur: "aujourd'hui", prev: "hier" },
  "7d": { cur: "7 derniers jours", prev: "semaine précédente" },
  "30d": { cur: "30 derniers jours", prev: "30 jours précédents" },
  all: { cur: "depuis le début" },
  custom: { cur: "période choisie", prev: "période précédente" },
};

const SLOW_MS = 15_000;

export function PerformanceView({ range, rangeKey }: { range: { since: string; until: string }; rangeKey?: RangeKey }) {
  const fetchPerf = useServerFn(getMetaPerformance);
  const [metric, setMetric] = useState<MetricKey>("results");
  const [compare, setCompare] = useState<MetricKey | "none">("none");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<SortKey>("spend");
  const [asc, setAsc] = useState(false);
  const [pageSize, setPageSize] = useState(25);
  const [page, setPage] = useState(1);
  /** "all" = agrégation de tous les comptes actifs (défaut). */
  const [accountId, setAccountId] = useState<string>("all");
  /** Groupe de campagnes actif ("all" = aucun filtre de groupe). */
  const [groupId, setGroupId] = useState<string>("all");
  const [groupCampaignIds, setGroupCampaignIds] = useState<string[] | null>(null);
  /** null = toutes les campagnes cochées (défaut). */
  const [selectedIds, setSelectedIds] = useState<Set<string> | null>(null);
  /** true = n'afficher que les campagnes actives (défaut). */
  const [activeOnly, setActiveOnly] = useState(true);

  const q1 = useQuery({
    queryKey: ["meta-performance", range.since, range.until, accountId],
    queryFn: () => fetchPerf({ data: { ...range, accountId: accountId === "all" ? null : accountId } }),
    staleTime: 0,
    gcTime: 30 * 60_000,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });

  // Jamais de chargement infini : au-delà de 15 s, on propose de réessayer.
  const [slow, setSlow] = useState(false);
  useEffect(() => {
    if (!q1.isLoading) { setSlow(false); return; }
    setSlow(false);
    const t = setTimeout(() => setSlow(true), SLOW_MS);
    return () => clearTimeout(t);
  }, [q1.isLoading, range.since, range.until, accountId]);

  const fetchLeads = useServerFn(listLeads);
  const leadsQuery = useQuery({
    queryKey: ["leads"],
    queryFn: () => fetchLeads(),
    staleTime: 5 * 60_000,
    refetchOnWindowFocus: false,
  });

  // Leads Growthity réellement reçus sur la période (source : page Leads).
  const leadsInRange = useMemo(() => {
    const from = new Date(`${range.since}T00:00:00`).getTime();
    const to = new Date(`${range.until}T23:59:59`).getTime();
    return ((leadsQuery.data as any[]) ?? []).filter((l: any) => {
      const t = new Date(l.submitted_at ?? l.created_at).getTime();
      return !isNaN(t) && t >= from && t <= to;
    }).length;
  }, [leadsQuery.data, range.since, range.until]);

  // Nouveaux leads reçus aujourd'hui (repère « ça bouge encore »).
  const leadsToday = useMemo(() => {
    const start = new Date(); start.setHours(0, 0, 0, 0);
    return ((leadsQuery.data as any[]) ?? []).filter((l: any) => {
      const t = new Date(l.submitted_at ?? l.created_at).getTime();
      return !isNaN(t) && t >= start.getTime();
    }).length;
  }, [leadsQuery.data]);

  // Objectif dominant (pondéré par la dépense) : détermine si « Résultats » = « Leads ».
  const leadsObjective = useMemo(() => {
    const list = q1.data?.campaigns ?? [];
    const spendBy = new Map<string, number>();
    for (const c of list) {
      const key = String((c as any).objective ?? "").toUpperCase();
      spendBy.set(key, (spendBy.get(key) ?? 0) + c.totals.spend);
    }
    const top = [...spendBy.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "";
    return top.includes("LEAD");
  }, [q1.data]);

  /** Campagnes visibles : filtre groupe, actives, recherche, puis tri. */
  const campaigns = useMemo(() => {
    let list = q1.data?.campaigns ?? [];
    if (groupCampaignIds) {
      const set = new Set(groupCampaignIds);
      list = list.filter((c) => set.has(c.id));
    }
    if (activeOnly) {
      list = list.filter((c) => ((c as any).effectiveStatus || (c as any).status || "").toUpperCase() === "ACTIVE");
    }
    list = list.filter((c) => c.name.toLowerCase().includes(q.trim().toLowerCase()));
    const dir = asc ? 1 : -1;
    return [...list].sort((a, b) =>
      sort === "name"
        ? a.name.localeCompare(b.name, "fr") * dir
        : ((a.totals as any)[sort] - (b.totals as any)[sort]) * dir,
    );
  }, [q1.data, q, sort, asc, groupCampaignIds, activeOnly]);

  const selectedCampaigns = useMemo(
    () => (selectedIds ? campaigns.filter((c) => selectedIds.has(c.id)) : campaigns),
    [campaigns, selectedIds],
  );
  const isSelected = (id: string) => (selectedIds ? selectedIds.has(id) : true);
  const allChecked = selectedCampaigns.length > 0 && selectedCampaigns.length === campaigns.length;

  const toggleOne = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev ?? campaigns.map((c) => c.id));
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };
  const toggleAll = () => setSelectedIds(allChecked ? new Set<string>() : null);

  // Vue globale (aucun filtre) : on garde les totaux du compte, sinon on agrège.
  const isFullView = groupCampaignIds === null && !selectedIds && !q.trim();
  const totals: Totals = isFullView
    ? ((q1.data?.totals as Totals | undefined) ?? EMPTY)
    : selectedCampaigns.length
      ? sumTotals(selectedCampaigns.map((c) => c.totals as any))
      : EMPTY;
  const previous: Totals = isFullView
    ? ((q1.data?.previous as Totals | undefined) ?? EMPTY)
    : sumTotals(selectedCampaigns.map((c) => (c as any).previous ?? EMPTY));
  const daily = (isFullView
    ? (q1.data?.daily ?? [])
    : mergeSeries(selectedCampaigns.map((c) => c.series as any))) as Point[];
  // Période précédente jour par jour (barres violet clair).
  const prevDaily = (isFullView
    ? (((q1.data as any)?.previousDaily as Point[] | undefined) ?? [])
    : mergeSeries(selectedCampaigns.map((c) => (((c as any).previousSeries as Point[] | undefined) ?? [])))) as Point[];
  const activeDays = daily.filter((d) => d.impressions > 0 || d.spend > 0).length;
  const hasAnyData = (q1.data?.totals?.impressions ?? 0) > 0 || (q1.data?.totals?.spend ?? 0) > 0;
  const notConnected = (q1.data as any)?.notConnected === true;
  const accounts: Array<{ id: string; name: string }> = ((q1.data as any)?.accounts as Array<{ id: string; name: string }>) ?? [];
  const allCampaignRows = q1.data?.campaigns ?? [];

  type State = "loading" | "slow" | "error" | "off" | "empty" | "ok";
  const state: State = q1.isLoading
    ? (slow ? "slow" : "loading")
    : q1.isError ? "error"
    : notConnected ? "off"
    : !hasAnyData ? "empty"
    : "ok";
  const hasNumbers = state === "ok" || state === "empty";

  const selectionItems = useMemo(
    () => selectedCampaigns.map((c) => ({ campaignId: c.id, accountId: c.accountId, name: c.name })),
    [selectedCampaigns],
  );

  const pages = Math.max(1, Math.ceil(campaigns.length / pageSize));
  const current = campaigns.slice((Math.min(page, pages) - 1) * pageSize, Math.min(page, pages) * pageSize);

  const toggleSort = (k: SortKey) => {
    if (sort === k) setAsc(!asc);
    else { setSort(k); setAsc(k === "name"); }
    setPage(1);
  };

  /* ---------- cartes KPI ---------- */

  const resWord = leadsObjective ? "Leads" : "Résultats";
  const leadsTip = `${leadsObjective ? GLOSSARY.Leads : GLOSSARY.Résultats} Growthity a reçu ${frNumber(leadsInRange)} formulaire${leadsInRange > 1 ? "s" : ""} sur la période, dont ${frNumber(leadsToday)} aujourd'hui (léger décalage possible avec Meta).`;
  const kpis: { key: string; label: string; tip?: string; value: string; cur: number; prev: number; invert?: boolean; points?: boolean }[] = [
    { key: "spend", label: "Dépense", tip: GLOSSARY.Dépense, value: money(totals.spend), cur: totals.spend, prev: previous.spend },
    { key: "impressions", label: "Affichages", tip: GLOSSARY["Nombre d'affichages"], value: frNumber(totals.impressions), cur: totals.impressions, prev: previous.impressions },
    { key: "clicks", label: "Clics", tip: GLOSSARY.Clics, value: frNumber(totals.clicks), cur: totals.clicks, prev: previous.clicks },
    { key: "reach", label: "Personnes touchées", tip: GLOSSARY["Personnes touchées"], value: frNumber(totals.reach), cur: totals.reach, prev: previous.reach },
    { key: "ctr", label: "Taux de clic", tip: GLOSSARY["Taux de clic"], value: frPercent(totals.ctr), cur: totals.ctr, prev: previous.ctr, points: true },
    { key: "cpc", label: "Coût par clic", tip: GLOSSARY["Coût par clic"], value: frMoney(totals.cpc), cur: totals.cpc, prev: previous.cpc, invert: true },
    {
      key: "results", label: resWord, tip: leadsTip,
      value: totals.results > 0 ? `${frNumber(totals.results)} · ${frMoney(totals.cost_per_result || totals.spend / totals.results)}` : "0",
      cur: totals.results, prev: previous.results,
    },
  ];

  /* ---------- graphique ---------- */

  const days = daily.length;
  const gran = chartGranularity(days);
  const period = PERIOD_LABELS[rangeKey ?? "custom"] ?? PERIOD_LABELS.custom;
  const chartTitle = gran === "day" ? "Évolution jour par jour" : gran === "week" ? "Évolution semaine par semaine" : "Évolution mois par mois";
  const labelOf = (k: MetricKey) => (k === "results" ? resWord : k === "impressions" ? "Affichages" : metricMeta(k).label);
  const showPrev = gran === "day" && rangeKey !== "all" && prevDaily.length > 0;

  const chartBody = (k: MetricKey): ReactNode => (
    <DailyBarChart
      current={daily as any}
      previous={showPrev ? (prevDaily as any) : null}
      metric={k}
      metricLabel={labelOf(k)}
      currentLabel={period.cur}
      previousLabel={period.prev}
      granularity={gran}
      trimLeading={rangeKey === "all"}
    />
  );

  /* ---------- tableau ---------- */

  const emptyBlock = q.trim() ? (
    <div className="gx-empty">
      <b>Aucune campagne ne correspond à ta recherche</b>
      <button type="button" className="gx-btn gx-sm" onClick={() => setQ("")}>Effacer la recherche</button>
    </div>
  ) : activeOnly ? (
    <div className="gx-empty">
      <b>Aucune campagne active sur la période</b>
      <button type="button" className="gx-btn gx-sm" onClick={() => setActiveOnly(false)}>Voir toutes les campagnes</button>
    </div>
  ) : (
    <div className="gx-empty"><b>Aucune campagne sur la période</b></div>
  );

  const sortLabel = (k: SortKey) => (sort === k ? (asc ? " ↑" : " ↓") : "");
  const Th = ({ k, children, tip }: { k: SortKey; children: ReactNode; tip?: string }) => (
    <th aria-sort={sort === k ? (asc ? "ascending" : "descending") : undefined}>
      <button type="button" className="gx-thb" onClick={() => toggleSort(k)} title={tip}>{children}{sortLabel(k)}</button>
    </th>
  );

  return (
    <div className="gx-pane gx-on">
      <div className="gx-k7">
        {kpis.map((k) => (
          <div key={k.key}>
            <small><Tip label={k.label} text={k.tip} /></small>
            <b className="gx-num">{state === "loading" ? "…" : hasNumbers ? k.value : "—"}</b>
            {state === "loading" ? <em>Chargement</em> : hasNumbers ? <Delta current={k.cur} previous={k.prev} invert={k.invert} points={k.points} /> : <em>&nbsp;</em>}
          </div>
        ))}
      </div>

      <div className="gx-box gx-chartb">
        <div className="gx-ch-h">
          <b>{chartTitle}</b>
          <div className="gx-row">
            <div className="gx-seg" role="tablist" aria-label="Mesure affichée">
              {CHART_METRICS.map((k) => (
                <button key={k} type="button" role="tab" aria-selected={metric === k} onClick={() => setMetric(k)}>{labelOf(k)}</button>
              ))}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button type="button" className={metric === "impressions" || metric === "cpc" || compare !== "none" ? "gx-ib gx-sm gx-set" : "gx-ib gx-sm"} aria-label="Autres mesures et comparaison" title="Autres mesures et comparaison">
                  <svg className="gx-i" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="5" cy="12" r="1.8" /><circle cx="12" cy="12" r="1.8" /><circle cx="19" cy="12" r="1.8" /></svg>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="console-app-portal">
                <DropdownMenuLabel>Autres mesures</DropdownMenuLabel>
                {OTHER_METRICS.map((m) => (
                  <DropdownMenuItem key={m.key} onSelect={() => setMetric(m.key)}>{m.label}{metric === m.key ? " ✓" : ""}</DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Comparer avec un second graphique</DropdownMenuLabel>
                <DropdownMenuItem onSelect={() => setCompare("none")}>Aucun{compare === "none" ? " ✓" : ""}</DropdownMenuItem>
                {[...CHART_METRICS, ...OTHER_METRICS.map((m) => m.key)].filter((k) => k !== metric).map((k) => (
                  <DropdownMenuItem key={k} onSelect={() => setCompare(k)}>{labelOf(k)}{compare === k ? " ✓" : ""}</DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {state === "loading" ? (
          <div className="gx-chart gx-chart-wait"><span className="gx-hint">Chargement des chiffres…</span></div>
        ) : state === "slow" ? (
          <div className="gx-empty">
            <b>Meta met plus de temps que prévu à répondre</b>
            <span>Tes chiffres arrivent dans un instant. Tu peux aussi relancer la demande.</span>
            <button type="button" className="gx-btn gx-sm" onClick={() => void q1.refetch()}>Réessayer</button>
          </div>
        ) : state === "error" ? (
          <div className="gx-empty">
            <b>Impossible de récupérer tes performances</b>
            <span>Vérifie que ton compte Meta est bien connecté, puis réessaie.</span>
            <button type="button" className="gx-btn gx-sm" onClick={() => void q1.refetch()}>Réessayer</button>
          </div>
        ) : state === "off" ? (
          <div className="gx-empty">
            <b>Connecte ton compte Meta</b>
            <span>Tes dépenses, tes clics et tes leads s'afficheront ici jour par jour.</span>
            <MetaConnectButton />
          </div>
        ) : state === "empty" ? (
          <div className="gx-empty">
            <b>Aucune donnée sur cette période</b>
            <span>Change la période en haut à droite, ou publie une campagne pour commencer à collecter des chiffres.</span>
            <Link to="/campaigns" className="gx-btn gx-sm">Voir mes campagnes</Link>
          </div>
        ) : (
          <>
            {chartBody(metric)}
            {compare !== "none" && (
              <>
                <div className="gx-ch-h gx-ch-2"><b>{labelOf(compare)}</b><button type="button" className="gx-btn gx-sm" onClick={() => setCompare("none")}>Retirer</button></div>
                {chartBody(compare)}
              </>
            )}
            {activeDays <= 1 && (
              <p className="gx-hint">Encore peu de données, reviens dans quelques jours pour voir la tendance.</p>
            )}
          </>
        )}
      </div>

      {hasNumbers && (allCampaignRows.length > 0 || accounts.length > 1) && (
        <>
          <div className="gx-bar-f">
            <label className="gx-srch gx-grow">
              <svg className="gx-i" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
              <input type="search" placeholder="Rechercher une campagne" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} aria-label="Rechercher une campagne" />
            </label>
            {accounts.length > 1 && (
              <Select value={accountId} onValueChange={(v) => { setAccountId(v); setPage(1); setSelectedIds(null); }}>
                <SelectTrigger className={accountId !== "all" ? "gx-set" : undefined} aria-label="Compte publicitaire"><SelectValue /></SelectTrigger>
                <SelectContent className="console-app-portal">
                  <SelectItem value="all">Tous les comptes publicitaires</SelectItem>
                  {accounts.map((a) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
                </SelectContent>
              </Select>
            )}
            <button
              type="button"
              className={activeOnly ? "gx-sel gx-set" : "gx-sel"}
              aria-pressed={activeOnly}
              onClick={() => { setActiveOnly((v) => !v); setPage(1); }}
            >
              {activeOnly ? "Actives uniquement" : "Toutes les campagnes"}
            </button>
            <CampaignGroupPicker
              value={groupId}
              selection={selectionItems}
              allCampaigns={allCampaignRows.map((c) => ({ campaignId: c.id, accountId: c.accountId, name: c.name }))}
              onChange={(gid, ids) => {
                setGroupId(gid);
                setGroupCampaignIds(ids);
                setSelectedIds(null);
                setPage(1);
              }}
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button type="button" className="gx-ib" aria-label="Plus d'options" title="Plus d'options">
                  <svg className="gx-i" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="5" cy="12" r="1.8" /><circle cx="12" cy="12" r="1.8" /><circle cx="19" cy="12" r="1.8" /></svg>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="console-app-portal">
                <DropdownMenuLabel>Lignes par page</DropdownMenuLabel>
                {[25, 50].map((n) => (
                  <DropdownMenuItem key={n} onSelect={() => { setPageSize(n); setPage(1); }}>{n} lignes{pageSize === n ? " ✓" : ""}</DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/resultats" search={{ tab: "leads" as const } as never}>Voir tous les leads ({frNumber(leadsInRange)} sur la période)</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {(selectedIds || campaigns.length !== allCampaignRows.length) && (
            <p className="gx-hint">
              <span className="gx-tipw" tabIndex={0} data-tip="Ce nombre peut différer de celui affiché dans Meta Ads Manager : il inclut aussi les campagnes terminées ou archivées sur la période, pas seulement les campagnes actives.">
                {frNumber(selectedCampaigns.length)} campagne{selectedCampaigns.length > 1 ? "s" : ""} sélectionnée{selectedCampaigns.length > 1 ? "s" : ""} sur {frNumber(campaigns.length)}<i>?</i>
              </span>
              {" · "}
              <button type="button" className="gx-tlink" onClick={toggleAll}>{allChecked ? "Tout désélectionner" : "Tout sélectionner"}</button>
              {" · Les chiffres et le graphique suivent ta sélection."}
            </p>
          )}

          {campaigns.length === 0 ? emptyBlock : (
            <div className="gx-tbl">
              <table>
                <thead>
                  <tr>
                    <th aria-sort={sort === "name" ? (asc ? "ascending" : "descending") : undefined}>
                      <span className="gx-cmp">
                        <input type="checkbox" checked={allChecked} onChange={toggleAll} aria-label="Tout sélectionner" />
                        <button type="button" className="gx-thb" onClick={() => toggleSort("name")}>Campagne{sortLabel("name")}</button>
                      </span>
                    </th>
                    <th>Tendance</th>
                    <Th k="spend" tip={GLOSSARY.Dépense}>Dépense</Th>
                    <Th k="impressions" tip={GLOSSARY["Nombre d'affichages"]}>Affichages</Th>
                    <Th k="clicks" tip={GLOSSARY.Clics}>Clics</Th>
                    <Th k="ctr" tip={GLOSSARY["Taux de clic"]}>Taux de clic</Th>
                    <Th k="results" tip={GLOSSARY.Résultats}>Résultats</Th>
                  </tr>
                </thead>
                <tbody>
                  {current.map((c) => {
                    const t = c.totals as Totals;
                    const seen = (t.impressions || 0) > 0;
                    const series: number[] = ((c.series as any[]) ?? []).map((d: any) => Number((t.results ?? 0) > 0 ? d?.results : d?.spend) || 0);
                    return (
                      <tr key={c.id} className={isSelected(c.id) ? undefined : "gx-unsel"}>
                        <td>
                          <label className="gx-cmp">
                            <input type="checkbox" checked={isSelected(c.id)} onChange={() => toggleOne(c.id)} aria-label={`Sélectionner ${frSetName(c.name)}`} />
                            <span>
                              <b title={frSetName(c.name)}>{frSetName(c.name)}</b>
                              {accounts.length > 1 && <small>{(c as any).accountName ?? ""}</small>}
                            </span>
                          </label>
                        </td>
                        <td><Spark values={series} /></td>
                        <td className="gx-num">{money(t.spend || 0)}</td>
                        <td className="gx-num">{seen ? frNumber(t.impressions) : "—"}</td>
                        <td className="gx-num" title={t.clicks ? `Coût par clic : ${frMoney(t.cpc)}` : undefined}>{seen ? frNumber(t.clicks) : "—"}</td>
                        <td className="gx-num">{seen ? frPercent(t.ctr, 1) : "—"}</td>
                        <td className="gx-num" title={t.results ? `Coût par résultat : ${frMoney(t.cost_per_result || t.spend / t.results)}` : undefined}>{seen ? frNumber(t.results) : "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {pages > 1 && (
            <div className="gx-row">
              <span className="gx-hint">Page {Math.min(page, pages)} sur {pages}</span>
              <span className="gx-sp" />
              <button type="button" className="gx-btn gx-sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Précédent</button>
              <button type="button" className="gx-btn gx-sm" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>Suivant</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
