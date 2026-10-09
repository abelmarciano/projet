import { forwardRef, Fragment, useEffect, useMemo, useRef, useState, type ButtonHTMLAttributes, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import * as DropdownPrimitive from "@radix-ui/react-dropdown-menu";
import {
  Search, Download, RefreshCw, ChevronDown, SlidersHorizontal, Trash2,
  Mail, Phone, Copy, ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { GxSheetContent, GxSheetClose } from "@/components/ui/gx-controls";
import {
  leadFieldEntries, leadInitials, timeBucket, TIME_BUCKET_LABELS, TIME_BUCKET_ORDER, type TimeBucket,
} from "@/lib/lead-format";
import { LEAD_ISSUE_LABEL } from "@/lib/lead-fields";
import { cn } from "@/lib/utils";
import {
  listLeads, listLeadStatuses, createLeadStatus, deleteLeadStatus, updateLead, syncMetaLeads, syncRecentMetaLeads,
} from "@/lib/leads.functions";
import { getMetaCredentials } from "@/lib/meta.functions";

/*
 * Résultats › Leads : copie de la maquette validée (landing/design/app/views/resultats.html
 * + fiche lead de views/sheets.html), classes gx- de src/styles/gx-console.css.
 */

type LeadRow = Awaited<ReturnType<typeof listLeads>>[number];

const fmt = (iso: string | null | undefined) =>
  iso ? new Date(iso).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" }) : "—";

/** « Aujourd'hui, 10:42 », « Hier, 18:20 », sinon « 03/10/2026, 14:05 ». */
function fmtReceived(iso: string | null | undefined) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const time = d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  const b = timeBucket(iso);
  if (b === "today") return `Aujourd'hui, ${time}`;
  if (b === "yesterday") return `Hier, ${time}`;
  return `${d.toLocaleDateString("fr-FR")}, ${time}`;
}

function fieldEntries(lead: any): Array<{ name: string; value: string }> {
  return leadFieldEntries(lead).map((f) => ({ name: f.name, value: f.value }));
}

const pad = (n: number) => String(n).padStart(2, "0");
/** Jour local (AAAA-MM-JJ), `daysBack` jours avant aujourd'hui. */
function localDay(daysBack: number) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - daysBack);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

type DatePreset = "all" | "today" | "yesterday" | "7d" | "30d" | "custom";
const DATE_PRESETS: Array<{ key: Exclude<DatePreset, "custom">; label: string }> = [
  { key: "all", label: "Toutes les dates" },
  { key: "today", label: "Aujourd'hui" },
  { key: "yesterday", label: "Hier" },
  { key: "7d", label: "7 derniers jours" },
  { key: "30d", label: "30 derniers jours" },
];

const STATUS_HELP: Record<string, string> = {
  new: "Vient d'arriver, pas encore traité",
  contacted: "Tu l'as appelé ou lui as écrit",
  qualified: "Intéressé et dans ta cible",
  converted: "Devenu client",
  lost: "Pas intéressé",
  bad: "Attribué automatiquement (réponses hors cible)",
  unqualified: "Attribué automatiquement (réponses hors cible)",
  disqualified: "Attribué automatiquement (réponses hors cible)",
  "non qualifié": "Attribué automatiquement (réponses hors cible)",
};

/* ---------- menus déroulants au style de la maquette (.gx-sel + .gx-menu) ---------- */

function GxMenu({ trigger, children, align = "start" }: { trigger: ReactNode; children: ReactNode; align?: "start" | "end" | "center" }) {
  return (
    <DropdownPrimitive.Root modal={false}>
      <DropdownPrimitive.Trigger asChild>{trigger}</DropdownPrimitive.Trigger>
      <DropdownPrimitive.Portal>
        <DropdownPrimitive.Content className="gx-menu" align={align} sideOffset={6} collisionPadding={8}>
          {children}
        </DropdownPrimitive.Content>
      </DropdownPrimitive.Portal>
    </DropdownPrimitive.Root>
  );
}

function GxMenuItem({ checked, onSelect, children }: { checked?: boolean; onSelect: () => void; children: ReactNode }) {
  return (
    <DropdownPrimitive.Item asChild onSelect={() => onSelect()}>
      <button type="button" role="menuitemradio" aria-checked={!!checked}>{children}</button>
    </DropdownPrimitive.Item>
  );
}

/** Bouton « .gx-sel » : forwardRef obligatoire, Radix s'en sert pour placer le menu. */
const SelButton = forwardRef<HTMLButtonElement, { label: string; set?: boolean } & ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ label, set, ...props }, ref) => (
    <button ref={ref} type="button" className={cn("gx-sel", set && "gx-set")} aria-haspopup="menu" {...props}>
      <span>{label}</span><ChevronDown className="gx-i" />
    </button>
  ),
);
SelButton.displayName = "SelButton";

export function LeadsView({ title = "Résultats", subtitle, tabs }: { title?: string; subtitle?: string; tabs?: ReactNode } = {}) {
  const qc = useQueryClient();
  const fetchLeads = useServerFn(listLeads);
  const fetchStatuses = useServerFn(listLeadStatuses);
  const addStatus = useServerFn(createLeadStatus);
  const removeStatus = useServerFn(deleteLeadStatus);
  const patchLead = useServerFn(updateLead);
  const sync = useServerFn(syncMetaLeads);

  const syncRecent = useServerFn(syncRecentMetaLeads);
  const leadsQ = useQuery({ queryKey: ["leads"], queryFn: () => fetchLeads(), refetchInterval: 60_000 });
  // Synchronisation automatique en continu : à l'ouverture puis toutes les 60 s.
  useQuery({
    queryKey: ["leads-auto-sync"],
    queryFn: async () => {
      const r = await syncRecent().catch(() => ({ imported: 0 }));
      if ((r as { imported?: number }).imported) void leadsQ.refetch();
      return r;
    },
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
  });
  const statusesQ = useQuery({ queryKey: ["lead-statuses"], queryFn: () => fetchStatuses() });
  const getCreds = useServerFn(getMetaCredentials);
  const credsQ = useQuery({ queryKey: ["meta-credentials"], queryFn: () => getCreds() });
  /** Comptes publicitaires actifs (noms réels) pour le filtre. */
  const activeAccounts = ((credsQ.data as any)?.active_accounts ?? []) as Array<{ id: string; name: string }>;

  const [q, setQ] = useState("");
  const [campaignFilter, setCampaignFilter] = useState("all");
  const [adFilter, setAdFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [accountFilter, setAccountFilter] = useState("all");
  const [pageFilter, setPageFilter] = useState("all");
  const [platformFilter, setPlatformFilter] = useState("all");
  const [formFilter, setFormFilter] = useState("all");
  const [moreFilters, setMoreFilters] = useState(false);
  const [showTest, setShowTest] = useState(false);
  const [limit, setLimit] = useState(50);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [datePreset, setDatePreset] = useState<DatePreset>("all");

  const [selected, setSelected] = useState<LeadRow | null>(null);
  const [notes, setNotes] = useState("");
  const [syncing, setSyncing] = useState(false);
  const [statusDialog, setStatusDialog] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [newColor, setNewColor] = useState("#64748b");

  const leads = (leadsQ.data ?? []) as any[];
  const statuses = (statusesQ.data ?? []) as any[];
  const statusByKey = useMemo(
    () => Object.fromEntries(statuses.map((s) => [s.key, s])),
    [statuses],
  );

  // Provenance réelle = la campagne Meta d'où vient le lead (pas la campagne Growthity locale,
  // plusieurs campagnes Meta pouvant partager le même formulaire).
  const campaigns = useMemo(() => {
    const map = new Map<string, string>();
    for (const l of leads) {
      const key = l.meta_campaign_id ?? l.campaign_id;
      const name = l.meta_campaign_name ?? l.marketing_campaigns?.name;
      if (key && name) map.set(key, name);
    }
    return [...map.entries()].sort((a, b) => a[1].localeCompare(b[1]));
  }, [leads]);

  const ads = useMemo(() => {
    const map = new Map<string, string>();
    for (const l of leads) {
      const key = l.meta_ad_id;
      const name = l.meta_ad_name ?? l.ads?.title;
      if (key && name) map.set(key, name);
    }
    return [...map.entries()].sort((a, b) => a[1].localeCompare(b[1]));
  }, [leads]);

  const uniq = (key: string) =>
    [...new Set(leads.map((l: any) => l[key]).filter(Boolean).map(String))].sort();
  const accounts = useMemo(() => {
    const map = new Map<string, string>();
    for (const a of activeAccounts) map.set(a.id, a.name);
    for (const id of uniq("ad_account_id")) if (!map.has(id)) map.set(id, id);
    return Array.from(map, ([id, name]) => ({ id, name }));
  }, [leads, activeAccounts]);
  const pages = useMemo(() => uniq("meta_page_id"), [leads]);
  const platforms = useMemo(() => uniq("platform"), [leads]);
  const forms = useMemo(() => uniq("meta_form_name"), [leads]);

  const activeAdvanced = [campaignFilter, adFilter, accountFilter, pageFilter]
    .filter((v) => v !== "all").length;

  /** Tous les filtres sauf le statut : sert aux pastilles de comptage par statut. */
  const baseFiltered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    // Plage complète date + heure (heure locale) ; une date seule couvre la journée entière.
    const fromTs = from ? new Date(from.length === 10 ? `${from}T00:00` : from).getTime() : null;
    const toTs = to ? (to.length === 10 ? new Date(`${to}T00:00`).getTime() + 86_400_000 - 1 : new Date(to).getTime() + 59_999) : null;
    return leads.filter((l) => {
      if (!showTest && isTestLead(l)) return false;
      if (campaignFilter !== "all" && (l.meta_campaign_id ?? l.campaign_id) !== campaignFilter) return false;
      if (adFilter !== "all" && l.meta_ad_id !== adFilter) return false;
      if (accountFilter !== "all" && String(l.ad_account_id ?? "") !== accountFilter) return false;
      if (pageFilter !== "all" && String(l.meta_page_id ?? "") !== pageFilter) return false;
      if (platformFilter !== "all" && String(l.platform ?? "") !== platformFilter) return false;
      if (formFilter !== "all" && String(l.meta_form_name ?? "") !== formFilter) return false;
      const ts = new Date(l.submitted_at ?? l.created_at).getTime();
      if (fromTs && ts < fromTs) return false;
      if (toTs && ts > toTs) return false;
      if (!needle) return true;
      const haystack = [
        l.full_name, l.email, l.phone, l.notes, l.meta_ad_name, l.meta_campaign_name,
        l.meta_form_name, l.marketing_campaigns?.name,
        ...fieldEntries(l).flatMap((f) => [f.name, f.value]),
      ].filter(Boolean).join(" ").toLowerCase();
      return haystack.includes(needle);
    });
  }, [leads, q, campaignFilter, adFilter, accountFilter, pageFilter, platformFilter, formFilter, from, to, showTest]);

  const filtered = useMemo(
    () => (statusFilter === "all" ? baseFiltered : baseFiltered.filter((l) => l.status === statusFilter)),
    [baseFiltered, statusFilter],
  );

  /** Leads triés puis regroupés par période (Aujourd'hui, Hier…). */
  const grouped = useMemo(() => {
    const sorted = [...filtered].sort(
      (a, b) => new Date(b.submitted_at ?? b.created_at).getTime() - new Date(a.submitted_at ?? a.created_at).getTime(),
    );
    const buckets = new Map<TimeBucket, any[]>();
    for (const l of sorted.slice(0, limit)) {
      const k = timeBucket(l.submitted_at ?? l.created_at);
      buckets.set(k, [...(buckets.get(k) ?? []), l]);
    }
    return TIME_BUCKET_ORDER.filter((k) => buckets.get(k)?.length).map((k) => ({
      key: k, label: TIME_BUCKET_LABELS[k], rows: buckets.get(k) as any[],
    }));
  }, [filtered, limit]);

  useEffect(() => { setLimit(50); }, [filtered.length]);

  /** Liste à plat, dans l'ordre affiché : sert à la navigation précédent/suivant. */
  const flatOrder = useMemo(() => grouped.flatMap((g) => g.rows), [grouped]);

  const counters = useMemo(() => {
    const todayCount = filtered.filter((l) => timeBucket(l.submitted_at ?? l.created_at) === "today").length;
    const since7 = new Date(`${localDay(6)}T00:00`).getTime();
    const last7Count = filtered.filter((l) => new Date(l.submitted_at ?? l.created_at).getTime() >= since7).length;
    const byStatus = new Map<string, number>();
    for (const l of baseFiltered) byStatus.set(l.status, (byStatus.get(l.status) ?? 0) + 1);
    return { todayCount, last7Count, byStatus };
  }, [filtered, baseFiltered]);

  function openLead(l: any) { setSelected(l); setNotes(l.notes ?? ""); }

  function stepLead(dir: -1 | 1) {
    if (!selected) return;
    const i = flatOrder.findIndex((l) => l.id === (selected as any).id);
    const next = flatOrder[i + dir];
    if (next) openLead(next);
  }

  function applyPreset(p: Exclude<DatePreset, "custom">) {
    setDatePreset(p);
    if (p === "all") { setFrom(""); setTo(""); return; }
    if (p === "yesterday") { setFrom(`${localDay(1)}T00:00`); setTo(`${localDay(1)}T23:59`); return; }
    const back = p === "today" ? 0 : p === "7d" ? 6 : 29;
    setFrom(`${localDay(back)}T00:00`);
    setTo("");
  }

  function resetAll() {
    setQ(""); setStatusFilter("all"); setFormFilter("all"); setPlatformFilter("all");
    setCampaignFilter("all"); setAdFilter("all"); setAccountFilter("all"); setPageFilter("all");
    setFrom(""); setTo(""); setDatePreset("all");
  }

  function exportCsv() {
    if (!filtered.length) { toast.error("Aucun lead à exporter."); return; }
    const extraCols = [...new Set(filtered.flatMap((l) => fieldEntries(l).map((f) => f.name)))];
    const header = ["Date", "Nom", "Email", "Téléphone", "Statut", "Campagne Meta", "Publicité Meta", "Formulaire", "Compte publicitaire", "Créée avec Growthity", "Plateforme", ...extraCols];
    const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const rows = filtered.map((l) => {
      const fields = Object.fromEntries(fieldEntries(l).map((f) => [f.name, f.value]));
      return [
        fmt(l.submitted_at ?? l.created_at), l.full_name, l.email, l.phone,
        statusByKey[l.status]?.label ?? l.status,
        l.meta_campaign_name ?? l.marketing_campaigns?.name ?? "",
        l.meta_ad_name ?? "", l.meta_form_name ?? l.meta_form_id ?? "",
        l.ad_account_id ?? "", l.campaign_id ? "Oui" : "Non", platformLabel(l.platform),
        ...extraCols.map((c) => fields[c] ?? ""),
      ].map(esc).join(",");
    });
    const csv = "﻿" + [header.map(esc).join(","), ...rows].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads-growthity-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function onSync() {
    setSyncing(true);
    try {
      const res = await sync({ data: {} } as any);
      toast.success(`${res.imported} lead(s) synchronisé(s).`);
      if (res.errors?.length) toast.error(res.errors[0]);
      qc.invalidateQueries({ queryKey: ["leads"] });
    } catch (e: any) {
      toast.error(String(e?.message ?? e));
    } finally {
      setSyncing(false);
    }
  }

  // Auto-sync silencieux au premier chargement (récupère les leads Meta manquants)
  const autoSyncRef = useRef(false);
  useEffect(() => {
    if (autoSyncRef.current || leadsQ.isLoading) return;
    autoSyncRef.current = true;
    sync({ data: {} } as any)
      .then((res: any) => {
        if (res?.imported > 0) qc.invalidateQueries({ queryKey: ["leads"] });
      })
      .catch(() => { /* silencieux */ });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leadsQ.isLoading]);

  async function setStatus(lead: any, key: string) {
    try {
      await patchLead({ data: { id: lead.id, status: key } });
      qc.invalidateQueries({ queryKey: ["leads"] });
    } catch (e: any) { toast.error(String(e?.message ?? e)); }
  }

  async function saveNotes() {
    if (!selected) return;
    try {
      await patchLead({ data: { id: selected.id as string, notes } });
      toast.success("Note enregistrée.");
      qc.invalidateQueries({ queryKey: ["leads"] });
    } catch (e: any) { toast.error(String(e?.message ?? e)); }
  }

  const statusLabel = (key: string) => statusByKey[key]?.label ?? key;
  const shortDay = (v: string) => new Date(v.length === 10 ? `${v}T00:00` : v).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" });
  const dateLabel = datePreset === "custom"
    ? (from ? `Depuis le ${shortDay(from)}` : to ? `Jusqu'au ${shortDay(to)}` : "Depuis le")
    : datePreset === "all" ? "Depuis le" : DATE_PRESETS.find((p) => p.key === datePreset)?.label ?? "Depuis le";
  const selIndex = selected ? flatOrder.findIndex((l) => l.id === (selected as any).id) : -1;

  return (
    <>
      <header className="gx-ph">
        <div>
          <h1>{title}</h1>
          {subtitle && <p>{subtitle}</p>}
        </div>
        <div className="gx-pa">
          <button type="button" className={cn("gx-btn", syncing && "gx-spin-i")} onClick={onSync} disabled={syncing}>
            <RefreshCw className="gx-i" />{syncing ? "Synchronisation…" : "Synchroniser"}
          </button>
          <button type="button" className="gx-btn" onClick={() => setStatusDialog(true)}>Statuts</button>
          <button type="button" className="gx-btn gx-pri" onClick={exportCsv}>
            <Download className="gx-i" />Exporter CSV
          </button>
        </div>
      </header>

      {tabs}

      <div className="gx-pane gx-on" role="tabpanel">
        <div className="gx-bar-f">
          <label className="gx-srch gx-grow">
            <Search className="gx-i" />
            <span className="gx-sr">Rechercher (nom, email…)</span>
            <input type="search" placeholder="Rechercher (nom, email…)" autoComplete="off" value={q} onChange={(e) => setQ(e.target.value)} />
          </label>
          <GxMenu trigger={<SelButton label={statusFilter === "all" ? "Tous les statuts" : statusLabel(statusFilter)} set={statusFilter !== "all"} />}>
            <GxMenuItem checked={statusFilter === "all"} onSelect={() => setStatusFilter("all")}>Tous les statuts</GxMenuItem>
            {statuses.map((s) => (
              <GxMenuItem key={s.id} checked={statusFilter === s.key} onSelect={() => setStatusFilter(s.key)}>{s.label}</GxMenuItem>
            ))}
          </GxMenu>
          <GxMenu trigger={<SelButton label={formFilter === "all" ? "Tous les formulaires" : formFilter} set={formFilter !== "all"} />}>
            <GxMenuItem checked={formFilter === "all"} onSelect={() => setFormFilter("all")}>Tous les formulaires</GxMenuItem>
            {forms.map((f) => <GxMenuItem key={f} checked={formFilter === f} onSelect={() => setFormFilter(f)}>{f}</GxMenuItem>)}
          </GxMenu>
          <GxMenu trigger={<SelButton label={dateLabel} set={!!(from || to)} />}>
            {DATE_PRESETS.map((p) => (
              <GxMenuItem key={p.key} checked={datePreset === p.key} onSelect={() => applyPreset(p.key)}>{p.label}</GxMenuItem>
            ))}
            <GxMenuItem checked={datePreset === "custom"} onSelect={() => setMoreFilters(true)}>Choisir des dates…</GxMenuItem>
          </GxMenu>
          <GxMenu align="end" trigger={<SelButton label={platformFilter === "all" ? "Plateforme" : platformLabel(platformFilter)} set={platformFilter !== "all"} />}>
            <GxMenuItem checked={platformFilter === "all"} onSelect={() => setPlatformFilter("all")}>Toutes les plateformes</GxMenuItem>
            {platforms.map((p) => <GxMenuItem key={p} checked={platformFilter === p} onSelect={() => setPlatformFilter(p)}>{platformLabel(p)}</GxMenuItem>)}
          </GxMenu>
          <button
            type="button" className="gx-ib" aria-expanded={moreFilters} aria-label="Plus de filtres" title="Plus de filtres"
            onClick={() => setMoreFilters((v) => !v)}
          >
            <SlidersHorizontal className="gx-i" />
            {(activeAdvanced > 0 || showTest) && <span className="gx-dot" />}
          </button>
        </div>

        {moreFilters && (
          <div className="gx-bar-f gx-ld-more">
            <GxMenu trigger={<SelButton label={campaignFilter === "all" ? "Toutes les campagnes" : campaigns.find(([id]) => id === campaignFilter)?.[1] ?? "Campagne"} set={campaignFilter !== "all"} />}>
              <GxMenuItem checked={campaignFilter === "all"} onSelect={() => setCampaignFilter("all")}>Toutes les campagnes</GxMenuItem>
              {campaigns.map(([id, name]) => <GxMenuItem key={id} checked={campaignFilter === id} onSelect={() => setCampaignFilter(id)}>{name}</GxMenuItem>)}
            </GxMenu>
            <GxMenu trigger={<SelButton label={adFilter === "all" ? "Toutes les publicités" : ads.find(([id]) => id === adFilter)?.[1] ?? "Publicité"} set={adFilter !== "all"} />}>
              <GxMenuItem checked={adFilter === "all"} onSelect={() => setAdFilter("all")}>Toutes les publicités</GxMenuItem>
              {ads.map(([id, name]) => <GxMenuItem key={id} checked={adFilter === id} onSelect={() => setAdFilter(id)}>{name}</GxMenuItem>)}
            </GxMenu>
            <GxMenu trigger={<SelButton label={pageFilter === "all" ? "Toutes les pages" : `Page #${pageFilter}`} set={pageFilter !== "all"} />}>
              <GxMenuItem checked={pageFilter === "all"} onSelect={() => setPageFilter("all")}>Toutes les pages</GxMenuItem>
              {pages.map((id) => <GxMenuItem key={id} checked={pageFilter === id} onSelect={() => setPageFilter(id)}>Page #{id}</GxMenuItem>)}
            </GxMenu>
            <GxMenu trigger={<SelButton label={accountFilter === "all" ? "Tous les comptes pub" : accounts.find((a) => a.id === accountFilter)?.name ?? accountFilter} set={accountFilter !== "all"} />}>
              <GxMenuItem checked={accountFilter === "all"} onSelect={() => setAccountFilter("all")}>Tous les comptes pub</GxMenuItem>
              {accounts.map((a) => (
                <GxMenuItem key={a.id} checked={accountFilter === a.id} onSelect={() => setAccountFilter(a.id)}>
                  {a.name === a.id ? a.id : `${a.name} · ${a.id}`}
                </GxMenuItem>
              ))}
            </GxMenu>
            <label className="gx-sr" htmlFor="ldFrom">Depuis le (date et heure)</label>
            <input
              id="ldFrom" className="gx-in gx-ld-date" type="datetime-local" title="Depuis le (date et heure)" value={from}
              onChange={(e) => { setFrom(e.target.value); setDatePreset("custom"); }}
            />
            <label className="gx-sr" htmlFor="ldTo">Jusqu'au (date et heure)</label>
            <input
              id="ldTo" className="gx-in gx-ld-date" type="datetime-local" title="Jusqu'au (date et heure)" value={to}
              onChange={(e) => { setTo(e.target.value); setDatePreset("custom"); }}
            />
            <button type="button" className={cn("gx-chip", showTest && "gx-on")} aria-pressed={showTest} onClick={() => setShowTest((v) => !v)}>
              Afficher les leads de test
            </button>
            {activeAdvanced > 0 && (
              <button type="button" className="gx-btn gx-ghost gx-sm"
                onClick={() => { setCampaignFilter("all"); setAdFilter("all"); setAccountFilter("all"); setPageFilter("all"); }}>
                Réinitialiser
              </button>
            )}
          </div>
        )}

        <div className="gx-cnts">
          <b>{filtered.length} lead{filtered.length > 1 ? "s" : ""}{filtered.length !== leads.length ? ` sur ${leads.length}` : ""}</b>
          <span>· {counters.todayCount} aujourd'hui · {counters.last7Count} sur les 7 derniers jours</span>
          <div className="gx-sp" />
          {statuses.map((s) => {
            const n = counters.byStatus.get(s.key) ?? 0;
            if (!n && statusFilter !== s.key) return null;
            return (
              <button
                key={s.id} type="button" aria-pressed={statusFilter === s.key}
                className={cn(stClass(s.key), statusFilter === s.key && "gx-on2")} style={stStyle(s.key, s.color)}
                onClick={() => setStatusFilter(statusFilter === s.key ? "all" : s.key)}
              >
                {s.label} {n}
              </button>
            );
          })}
        </div>

        {leadsQ.isLoading ? (
          <p className="gx-hint" role="status">Chargement des leads…</p>
        ) : leadsQ.isError ? (
          <div className="gx-empty">
            <b>Impossible de charger les leads</b>
            <p>Vérifie ta connexion puis réessaie.</p>
            <button type="button" className="gx-btn gx-sm" onClick={() => void leadsQ.refetch()}>Réessayer</button>
          </div>
        ) : leads.length === 0 ? (
          <div className="gx-empty">
            <b>Aucun lead pour le moment</b>
            <p>Les leads de tes formulaires Meta apparaissent ici automatiquement, qu'ils viennent d'une campagne créée avec Growthity ou directement dans Meta.</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="gx-empty">
            <b>Aucun lead pour ces filtres</b>
            <p>Modifie la recherche ou les filtres.</p>
            <button type="button" className="gx-btn gx-sm" onClick={resetAll}>Tout afficher</button>
          </div>
        ) : (
          <>
            <div className="gx-tbl">
              <table className="gx-leadt">
                <thead><tr><th>Contact</th><th>Campagne Meta &amp; publicité</th><th>Plateforme</th><th>Statut</th><th>Reçu le</th></tr></thead>
                <tbody>
                  {grouped.map((g) => (
                    <Fragment key={g.key}>
                      {grouped.length > 1 && <tr className="gx-gr"><td colSpan={5}>{g.label} · {g.rows.length}</td></tr>}
                      {g.rows.map((l: any) => {
                        const campaign = l.meta_campaign_name ?? l.marketing_campaigns?.name ?? "Campagne inconnue";
                        const adName = l.meta_ad_name ?? l.ads?.title ?? "Publicité inconnue";
                        return (
                          <tr
                            key={l.id} className="gx-lr" tabIndex={0} onClick={() => openLead(l)}
                            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openLead(l); } }}
                          >
                            <td>
                              <div className="gx-who">
                                <span className="gx-av">{leadInitials(l.full_name, l.email)}</span>
                                <div>
                                  <b>{l.full_name ? titleCase(l.full_name) : "Sans nom"}{l.is_test && <> <span className="gx-gb gx-out">Test</span></>}</b>
                                  <small>{[l.email, l.phone].filter(Boolean).join(" · ") || "Pas de coordonnées"}</small>
                                  {Array.isArray(l.field_issues) && l.field_issues.length > 0 && (
                                    <span className="gx-st gx-bad" title="La réponse reçue n'a pas la forme attendue : ouvre le lead pour voir toutes les réponses.">
                                      {l.field_issues.map((k: string) => LEAD_ISSUE_LABEL[k] ?? k).join(" · ")}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td title={[campaign, adName, l.meta_form_name, l.ad_account_id].filter(Boolean).join(" · ")}>
                              {campaign} · {adName}{l.campaign_id && <> <span className="gx-gb">Growthity</span></>}
                              {l.meta_form_name && <small>Formulaire : {l.meta_form_name}</small>}
                            </td>
                            <td>{platformLabel(l.platform)}</td>
                            <td onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
                              <GxMenu trigger={
                                <button
                                  type="button" className={cn(stClass(l.status), "gx-stc")} style={stStyle(l.status, statusByKey[l.status]?.color)}
                                  aria-label={`Statut ${statusLabel(l.status)}, cliquer pour changer`}
                                >
                                  {statusLabel(l.status)}
                                </button>
                              }>
                                {statuses.map((s) => (
                                  <GxMenuItem key={s.id} checked={l.status === s.key} onSelect={() => void setStatus(l, s.key)}>{s.label}</GxMenuItem>
                                ))}
                              </GxMenu>
                            </td>
                            <td>{fmtReceived(l.submitted_at ?? l.created_at)}</td>
                          </tr>
                        );
                      })}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
            {filtered.length > limit && (
              <div className="gx-row gx-ld-more-rows">
                <button type="button" className="gx-btn gx-sm" onClick={() => setLimit((n) => n + 50)}>Afficher 50 leads de plus</button>
                <span className="gx-hint">{Math.min(limit, filtered.length)} sur {filtered.length}</span>
              </div>
            )}
          </>
        )}

        <p className="gx-hint">Astuce : clique sur un statut pour le faire avancer, sur une ligne pour ouvrir la fiche du contact.</p>
      </div>

      {/* ---------- Fiche lead (sheet à droite) ---------- */}
      <DialogPrimitive.Root open={!!selected} onOpenChange={(o) => { if (!o) setSelected(null); }}>
        <GxSheetContent aria-describedby={undefined} aria-label="Fiche lead">
          {selected && (() => {
            const s = selected as any;
            const entries = fieldEntries(s);
            const extras = entries.filter(
              (f) => ![s.full_name, s.email, s.phone].filter(Boolean).includes(f.value),
            );
            const provenance: Array<{ label: string; value: string; hint?: string | null }> = [
              { label: "Publicité Meta", value: s.meta_ad_name ?? s.ads?.title ?? "—", hint: s.meta_ad_id },
              { label: "Formulaire", value: s.meta_form_name ?? "Formulaire Meta", hint: s.meta_form_id },
              { label: "Plateforme", value: platformLabel(s.platform) },
              { label: "Reçu le", value: fmtReceived(s.submitted_at ?? s.created_at) },
              ...(s.meta_campaign_name ? [{ label: "Campagne Meta", value: s.meta_campaign_name as string, hint: s.meta_campaign_id }] : []),
              ...(s.meta_adset_id ? [{ label: "Ensemble de pubs", value: `#${s.meta_adset_id}` }] : []),
              ...(s.marketing_campaigns?.name ? [{ label: "Campagne Growthity", value: s.marketing_campaigns.name as string }] : []),
              ...(s.ad_account_id ? [{ label: "Compte publicitaire", value: String(s.ad_account_id) }] : []),
              ...(s.meta_lead_id ? [{ label: "ID Meta", value: String(s.meta_lead_id) }] : []),
            ];
            return (
              <>
                <div className="gx-sheet-h">
                  <div className="gx-who">
                    <span className="gx-av gx-big">{leadInitials(s.full_name, s.email)}</span>
                    <div>
                      <DialogPrimitive.Title asChild>
                        <b>{s.full_name ? titleCase(s.full_name) : "Lead sans nom"}{s.is_test && <> <span className="gx-gb gx-out">Test</span></>}</b>
                      </DialogPrimitive.Title>
                      <small>{[s.email, s.phone].filter(Boolean).join(" · ") || "Pas de coordonnées"}</small>
                    </div>
                  </div>
                  <GxSheetClose />
                </div>

                <div className="gx-ls-b">
                  <div className="gx-row">
                    {s.phone
                      ? <a className="gx-btn gx-sm" href={`tel:${s.phone}`}><Phone className="gx-i" />Appeler</a>
                      : <button type="button" className="gx-btn gx-sm" disabled title="Pas de téléphone"><Phone className="gx-i" />Appeler</button>}
                    {s.email
                      ? <a className="gx-btn gx-sm" href={`mailto:${s.email}`}><Mail className="gx-i" />Envoyer un email</a>
                      : <button type="button" className="gx-btn gx-sm" disabled title="Pas d'email"><Mail className="gx-i" />Envoyer un email</button>}
                    <button
                      type="button" className="gx-btn gx-sm"
                      onClick={() => {
                        const txt = [s.full_name, s.email, s.phone, ...entries.map((f) => `${f.name}: ${f.value}`)]
                          .filter(Boolean).join("\n");
                        void navigator.clipboard.writeText(txt);
                        toast.success("Fiche copiée.");
                      }}
                    >
                      <Copy className="gx-i" />Copier la fiche
                    </button>
                  </div>

                  <div className="gx-lbl">Statut</div>
                  <div className="gx-chips" id="lsSt">
                    {statuses.map((st) => (
                      <button
                        key={st.id} type="button" aria-pressed={s.status === st.key}
                        className={cn(stClass(st.key), s.status === st.key && "gx-cur")} style={stStyle(st.key, st.color)}
                        onClick={() => { void setStatus(s, st.key); setSelected({ ...s, status: st.key }); }}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>

                  <div className="gx-lbl">Provenance</div>
                  <dl className="gx-recap">
                    {provenance.map((p) => (
                      <Fragment key={p.label}>
                        <dt>{p.label}</dt>
                        <dd>{p.value}{p.hint && <small className="gx-hint">#{p.hint}</small>}</dd>
                      </Fragment>
                    ))}
                  </dl>
                  {s.campaign_ads?.headline && (
                    <div className="gx-ls-ad">
                      <b>{s.campaign_ads.headline}</b>
                      {s.campaign_ads.description && <small>{s.campaign_ads.description}</small>}
                      {s.campaign_ads.destination_url && (
                        <a href={s.campaign_ads.destination_url} target="_blank" rel="noreferrer">
                          {s.campaign_ads.cta_label ?? "Lien"} <ExternalLink className="gx-i" />
                        </a>
                      )}
                    </div>
                  )}
                  {s.ads?.generated_url && (
                    s.ads.content_type === "video"
                      ? <video src={s.ads.generated_url} controls className="gx-ls-media" />
                      : <img src={s.ads.generated_url} alt={s.ads.title ?? "Créa"} className="gx-ls-media" />
                  )}

                  <div className="gx-lbl">Réponses au formulaire ({entries.length})</div>
                  {entries.length === 0 ? (
                    <p className="gx-hint">Aucune réponse enregistrée.</p>
                  ) : (
                    <dl className="gx-recap">
                      {entries.map((f, i) => (
                        <Fragment key={i}>
                          <dt>{f.name}</dt>
                          <dd>{f.value || "—"}</dd>
                        </Fragment>
                      ))}
                    </dl>
                  )}
                  {extras.length === 0 && entries.length > 0 && (
                    <p className="gx-hint">Formulaire de contact standard (nom, email, téléphone).</p>
                  )}

                  <div className="gx-lbl">Notes internes</div>
                  <label className="gx-sr" htmlFor="lsNote">Notes internes</label>
                  <textarea
                    id="lsNote" placeholder="Ex. : rappeler jeudi, intéressée par le coffret…"
                    value={notes} onChange={(e) => setNotes(e.target.value)}
                  />
                </div>

                <div className="gx-sheet-f">
                  <button type="button" className="gx-btn" disabled={selIndex <= 0} onClick={() => stepLead(-1)}>‹ Précédent</button>
                  <button type="button" className="gx-btn" disabled={selIndex < 0 || selIndex >= flatOrder.length - 1} onClick={() => stepLead(1)}>Suivant ›</button>
                  <div className="gx-sp" />
                  <button type="button" className="gx-btn gx-pri" onClick={() => void saveNotes()}>Enregistrer</button>
                </div>
              </>
            );
          })()}
        </GxSheetContent>
      </DialogPrimitive.Root>

      {/* ---------- Statuts des leads (sheet) ---------- */}
      <DialogPrimitive.Root open={statusDialog} onOpenChange={setStatusDialog}>
        <GxSheetContent aria-describedby={undefined} aria-label="Statuts des leads">
          <div className="gx-sheet-h">
            <div>
              <DialogPrimitive.Title asChild><b>Statuts des leads</b></DialogPrimitive.Title>
              <small>Les étapes de suivi de tes contacts.</small>
            </div>
            <GxSheetClose />
          </div>
          <div className="gx-ls-b">
            <div className="gx-stl">
              {statuses.length === 0 && <p className="gx-hint">{statusesQ.isLoading ? "Chargement des statuts…" : "Aucun statut."}</p>}
              {statuses.map((s) => (
                <div key={s.id}>
                  <span className={stClass(s.key)} style={stStyle(s.key, s.color)}>{s.label}</span>
                  <small>{STATUS_HELP[String(s.key).toLowerCase()] ?? (s.workspace_id ? "Statut personnalisé" : "Par défaut")}</small>
                  {s.workspace_id && (
                    <>
                      <span className="gx-sp" />
                      <button
                        type="button" className="gx-ib gx-sm" aria-label={`Supprimer le statut ${s.label}`} title="Supprimer"
                        onClick={async () => {
                          try {
                            await removeStatus({ data: { id: s.id } });
                            qc.invalidateQueries({ queryKey: ["lead-statuses"] });
                          } catch (e: any) { toast.error(String(e?.message ?? e)); }
                        }}
                      >
                        <Trash2 className="gx-i" />
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>
            <label className="gx-lbl" htmlFor="newLeadStatus">Ajouter un statut</label>
            <form
              className="gx-row gx-ld-newst"
              onSubmit={async (e) => {
                e.preventDefault();
                if (!newStatus.trim()) return;
                try {
                  await addStatus({ data: { label: newStatus.trim(), color: newColor } });
                  setNewStatus("");
                  qc.invalidateQueries({ queryKey: ["lead-statuses"] });
                } catch (err: any) { toast.error(String(err?.message ?? err)); }
              }}
            >
              <input id="newLeadStatus" className="gx-in" placeholder="Nouveau statut" value={newStatus} onChange={(e) => setNewStatus(e.target.value)} />
              <input type="color" className="gx-ld-color" aria-label="Couleur du statut" value={newColor} onChange={(e) => setNewColor(e.target.value)} />
              <button type="submit" className="gx-btn" disabled={!newStatus.trim()}>Ajouter</button>
            </form>
          </div>
          <div className="gx-sheet-f">
            <div className="gx-sp" />
            <DialogPrimitive.Close asChild><button type="button" className="gx-btn gx-pri">Compris</button></DialogPrimitive.Close>
          </div>
        </GxSheetContent>
      </DialogPrimitive.Root>
    </>
  );
}

const PLATFORM_LABELS: Record<string, string> = {
  fb: "Facebook", facebook: "Facebook", ig: "Instagram", instagram: "Instagram",
  msg: "Messenger", messenger: "Messenger", an: "Audience Network", audience_network: "Audience Network",
};

function platformLabel(p?: string | null) {
  if (!p) return "Meta";
  return PLATFORM_LABELS[p.toLowerCase()] ?? p;
}

function isTestLead(l: any): boolean {
  return Boolean(l?.is_test) || /<test lead|dummy data/i.test(`${l?.full_name ?? ""} ${l?.email ?? ""}`);
}

function titleCase(v: string): string {
  return v.toLocaleLowerCase("fr-FR").replace(/(^|[\s-])(\p{L})/gu, (_m, a, b) => a + b.toLocaleUpperCase("fr-FR"));
}

function leadStatusKind(key: string) {
  return ({ new: "new", contacted: "warn", qualified: "q", converted: "on", lost: "bad", bad: "bad", "non qualifié": "bad", unqualified: "bad", disqualified: "bad" } as Record<string, string>)[String(key ?? "").toLowerCase()] ?? null;
}

/** Classe de pastille : couleur de la maquette pour les statuts connus, sinon pastille neutre. */
function stClass(key: string) {
  const kind = leadStatusKind(key);
  return kind ? `gx-st gx-${kind}` : "gx-st";
}

/** Statut personnalisé : couleur choisie par l'utilisateur. */
function stStyle(key: string, color?: string | null) {
  if (leadStatusKind(key) || !color) return undefined;
  return { color, background: `color-mix(in srgb, ${color} 14%, transparent)` };
}
