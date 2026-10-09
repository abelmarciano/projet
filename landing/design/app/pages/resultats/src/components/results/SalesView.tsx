import { Link } from "@tanstack/react-router";
import { forwardRef, useMemo, useState, type ButtonHTMLAttributes, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import * as DropdownPrimitive from "@radix-ui/react-dropdown-menu";
import { Search, Download, RefreshCw, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { listMetaSales } from "@/lib/meta.functions";
import { frMetaStatus } from "@/lib/meta-labels";
import { frDecimal, frEuro, frNumber, frPercent } from "@/lib/format";

/*
 * Résultats › Ventes : copie de la maquette validée (landing/design/app/views/resultats.html,
 * second onglet) : cartes gx-kp4 puis tableau gx-tbl.
 */

/** Pastille de statut d'une campagne Meta (mêmes couleurs que la maquette). */
function statusClass(status?: string | null) {
  const s = String(status ?? "").toUpperCase();
  if (s === "ACTIVE") return "gx-st gx-on";
  if (s === "PENDING_REVIEW" || s === "IN_PROCESS" || s === "PREAPPROVED") return "gx-st gx-rev";
  if (s === "DISAPPROVED" || s === "WITH_ISSUES" || s === "PENDING_BILLING_INFO") return "gx-st gx-bad";
  return "gx-st gx-off";
}

const SelButton = forwardRef<HTMLButtonElement, { label: string; set?: boolean } & ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ label, set, ...props }, ref) => (
    <button ref={ref} type="button" className={cn("gx-sel", set && "gx-set")} aria-haspopup="menu" {...props}>
      <span>{label}</span><ChevronDown className="gx-i" />
    </button>
  ),
);
SelButton.displayName = "SelButton";

function GxMenu({ trigger, children }: { trigger: ReactNode; children: ReactNode }) {
  return (
    <DropdownPrimitive.Root modal={false}>
      <DropdownPrimitive.Trigger asChild>{trigger}</DropdownPrimitive.Trigger>
      <DropdownPrimitive.Portal>
        <DropdownPrimitive.Content className="gx-menu" align="start" sideOffset={6} collisionPadding={8}>{children}</DropdownPrimitive.Content>
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

export function SalesView({ title = "Résultats", subtitle, tabs }: { title?: string; subtitle?: string; tabs?: ReactNode } = {}) {
  const qc = useQueryClient();
  const fetchSales = useServerFn(listMetaSales);
  const salesQ = useQuery({
    queryKey: ["meta-sales"],
    queryFn: () => fetchSales(),
    staleTime: 5 * 60_000,
    gcTime: 30 * 60_000,
    refetchOnWindowFocus: false,
    retry: false,
  });

  const [q, setQ] = useState("");
  const [campaignFilter, setCampaignFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const rows = salesQ.data ?? [];

  const statuses = useMemo(
    () => [...new Set(rows.map((r) => r.effective_status).filter(Boolean))],
    [rows],
  );

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return rows.filter((r) => {
      if (campaignFilter !== "all" && r.id !== campaignFilter) return false;
      if (statusFilter !== "all" && r.effective_status !== statusFilter) return false;
      if (!needle) return true;
      return r.name.toLowerCase().includes(needle);
    });
  }, [rows, q, campaignFilter, statusFilter]);

  const totals = useMemo(() => {
    const revenue = filtered.reduce((s, r) => s + r.revenue, 0);
    const spend = filtered.reduce((s, r) => s + r.spend, 0);
    const orders = filtered.reduce((s, r) => s + r.orders, 0);
    const clicks = filtered.reduce((s, r) => s + r.clicks, 0);
    return {
      revenue, spend, orders,
      roas: spend > 0 ? revenue / spend : 0,
      cvr: clicks > 0 ? (orders / clicks) * 100 : 0,
    };
  }, [filtered]);

  function exportCsv() {
    if (!filtered.length) { toast.error("Aucune vente à exporter."); return; }
    const header = ["Campagne", "Statut", "Dépense", "Ventes", "Revenu", "Retour sur pub (€ pour 1 € dépensé)", "Taux de conversion (%)"];
    const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const lines = filtered.map((r) =>
      [r.name, r.effective_status, r.spend.toFixed(2), r.orders, r.revenue.toFixed(2), r.roas.toFixed(2), r.conversion_rate.toFixed(2)]
        .map(esc).join(","));
    const csv = "﻿" + [header.map(esc).join(","), ...lines].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `ventes-growthity-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const campaignLabel = campaignFilter === "all" ? "Toutes les campagnes" : rows.find((r) => r.id === campaignFilter)?.name ?? "Campagne";

  return (
    <>
      <header className="gx-ph">
        <div>
          <h1>{title}</h1>
          {subtitle && <p>{subtitle}</p>}
        </div>
        <div className="gx-pa">
          <button
            type="button" className={cn("gx-btn", salesQ.isFetching && "gx-spin-i")}
            onClick={() => { void qc.invalidateQueries({ queryKey: ["meta-sales"] }); }}
            disabled={salesQ.isFetching}
          >
            <RefreshCw className="gx-i" />{salesQ.isFetching ? "Synchronisation…" : "Synchroniser"}
          </button>
          <button type="button" className="gx-btn gx-pri" onClick={exportCsv}>
            <Download className="gx-i" />Exporter CSV
          </button>
        </div>
      </header>

      {tabs}

      <div className="gx-pane gx-on" role="tabpanel">
        <div className="gx-kp4">
          <div><small>Ventes</small><b className="gx-num">{salesQ.isLoading ? "…" : frNumber(totals.orders)}</b></div>
          <div><small>Revenu généré</small><b className="gx-num">{salesQ.isLoading ? "…" : frEuro(totals.revenue)}</b></div>
          <div>
            <small><span className="gx-tipw" tabIndex={0} data-tip="Ce que te rapporte chaque euro dépensé en publicité.">Retour sur pub<i>?</i></span></small>
            <b className="gx-num">{salesQ.isLoading ? "…" : totals.roas ? `${frDecimal(totals.roas)} €` : "—"}</b>
            <em>pour 1 € dépensé</em>
          </div>
          <div>
            <small>Taux de conversion</small>
            <b className="gx-num">{salesQ.isLoading ? "…" : totals.cvr ? frPercent(totals.cvr, 1) : "—"}</b>
            <em>sur 100 clics</em>
          </div>
        </div>

        {rows.length > 0 && (
          <div className="gx-bar-f">
            <label className="gx-srch gx-grow">
              <Search className="gx-i" />
              <span className="gx-sr">Rechercher une campagne…</span>
              <input type="search" placeholder="Rechercher une campagne…" autoComplete="off" value={q} onChange={(e) => setQ(e.target.value)} />
            </label>
            <GxMenu trigger={<SelButton label={campaignLabel} set={campaignFilter !== "all"} />}>
              <GxMenuItem checked={campaignFilter === "all"} onSelect={() => setCampaignFilter("all")}>Toutes les campagnes</GxMenuItem>
              {rows.map((r) => <GxMenuItem key={r.id} checked={campaignFilter === r.id} onSelect={() => setCampaignFilter(r.id)}>{r.name}</GxMenuItem>)}
            </GxMenu>
            <GxMenu trigger={<SelButton label={statusFilter === "all" ? "Tous les statuts" : frMetaStatus(statusFilter)} set={statusFilter !== "all"} />}>
              <GxMenuItem checked={statusFilter === "all"} onSelect={() => setStatusFilter("all")}>Tous les statuts</GxMenuItem>
              {statuses.map((s) => <GxMenuItem key={String(s)} checked={statusFilter === s} onSelect={() => setStatusFilter(String(s))}>{frMetaStatus(s)}</GxMenuItem>)}
            </GxMenu>
          </div>
        )}

        {salesQ.isLoading ? (
          <p className="gx-hint" role="status">Chargement des ventes…</p>
        ) : salesQ.isError ? (
          <div className="gx-empty">
            <b>Aucune donnée de vente synchronisée</b>
            <p>Connecte ton compte Meta Ads pour remonter automatiquement les commandes et le revenu de tes campagnes à objectif conversion.</p>
            <Link to="/connexions" className="gx-btn gx-sm">Connecter Meta</Link>
          </div>
        ) : filtered.length === 0 ? (
          <div className="gx-empty">
            <b>{rows.length ? "Aucune campagne pour ces filtres" : "Aucune vente pour le moment"}</b>
            <p>
              {rows.length
                ? "Modifie la recherche ou les filtres."
                : "Les commandes remontent ici dès qu'une campagne Meta à objectif « ventes / conversions » enregistre des achats (via ton pixel). Une intégration e-commerce (Shopify) viendra compléter ces données."}
            </p>
            {rows.length
              ? <button type="button" className="gx-btn gx-sm" onClick={() => { setQ(""); setCampaignFilter("all"); setStatusFilter("all"); }}>Tout afficher</button>
              : <Link to="/campaigns" className="gx-btn gx-sm">Voir mes campagnes</Link>}
          </div>
        ) : (
          <div className="gx-tbl">
            <table>
              <thead>
                <tr><th>Campagne</th><th>Statut</th><th>Dépense</th><th>Ventes</th><th>Revenu</th><th>Retour sur pub</th><th>Conversion</th></tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id}>
                    <td><b>{r.name}</b></td>
                    <td><span className={statusClass(r.effective_status)}>{frMetaStatus(r.effective_status)}</span></td>
                    <td className="gx-num">{frEuro(r.spend)}</td>
                    <td className="gx-num">{frNumber(r.orders)}</td>
                    <td className="gx-num">{frEuro(r.revenue)}</td>
                    <td className="gx-num">{r.roas ? `${frDecimal(r.roas)} €` : "—"}</td>
                    <td className="gx-num">{r.conversion_rate ? frPercent(r.conversion_rate, 1) : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
