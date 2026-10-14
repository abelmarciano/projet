import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Check, ListFilter, BarChart3, X } from "@/components/icons";
import { StatTile } from "@/components/console/StatTile";
import { frMoney, frNumber, frPercent } from "@/lib/format";

type ObjectiveKind = "leads" | "sales" | "traffic" | "awareness" | "other";

export type ChatCampaignRow = {
  id: string;
  name: string;
  objective?: string;
  objectiveKind?: ObjectiveKind;
  objectiveLabel?: string;
  spend: number;
  impressions: number;
  clicks: number;
  reach: number;
  results: number;
  ctr: number;
  cpc: number;
  cost_per_result: number;
  revenue?: number;
  roas?: number;
  accountId?: string;
  accountName?: string;
};

const GROUP_LABEL: Record<ObjectiveKind, string> = {
  leads: "Génération de leads",
  sales: "Ventes",
  traffic: "Trafic",
  awareness: "Notoriété",
  other: "Autres campagnes",
};

/** Colonnes humaines adaptées à l'objectif de la campagne. */
function columnsFor(kind: ObjectiveKind): Array<{ label: string; value: (r: ChatCampaignRow) => string }> {
  switch (kind) {
    case "leads":
      return [
        { label: "Dépense", value: (r) => frMoney(r.spend) },
        { label: "Nombre de leads", value: (r) => frNumber(r.results) },
        { label: "Coût par lead", value: (r) => (r.results > 0 ? frMoney(r.cost_per_result) : "—") },
      ];
    case "sales":
      return [
        { label: "Dépense", value: (r) => frMoney(r.spend) },
        { label: "Nombre de ventes", value: (r) => frNumber(r.results) },
        { label: "Coût par vente", value: (r) => (r.results > 0 ? frMoney(r.cost_per_result) : "—") },
        { label: "CA généré", value: (r) => frMoney(r.revenue ?? 0) },
        {
          label: "Retour sur pub",
          value: (r) => ((r.roas ?? 0) > 0 ? `${new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 2 }).format(r.roas ?? 0)} ×` : "—"),
        },
      ];
    case "traffic":
      return [
        { label: "Dépense", value: (r) => frMoney(r.spend) },
        { label: "Nombre de clics", value: (r) => frNumber(r.clicks) },
        { label: "Coût par clic", value: (r) => (r.clicks > 0 ? frMoney(r.cpc) : "—") },
      ];
    case "awareness":
      return [
        { label: "Dépense", value: (r) => frMoney(r.spend) },
        { label: "Personnes touchées", value: (r) => frNumber(r.reach) },
        { label: "Nombre d'affichages", value: (r) => frNumber(r.impressions) },
      ];
    default:
      return [
        { label: "Dépense", value: (r) => frMoney(r.spend) },
        { label: "Nombre de clics", value: (r) => frNumber(r.clicks) },
        { label: "Taux de clic", value: (r) => frPercent(r.ctr) },
      ];
  }
}

function totalRow(rows: ChatCampaignRow[]): ChatCampaignRow {
  const total = rows.reduce(
    (acc, row) => ({
      spend: acc.spend + row.spend,
      impressions: acc.impressions + row.impressions,
      clicks: acc.clicks + row.clicks,
      reach: acc.reach + row.reach,
      results: acc.results + row.results,
      revenue: acc.revenue + (row.revenue ?? 0),
    }),
    { spend: 0, impressions: 0, clicks: 0, reach: 0, results: 0, revenue: 0 },
  );
  return {
    id: "campaigns-total",
    name: `TOTAL DES ${rows.length} CAMPAGNES`,
    ...total,
    ctr: total.impressions > 0 ? (total.clicks / total.impressions) * 100 : 0,
    cpc: total.clicks > 0 ? total.spend / total.clicks : 0,
    cost_per_result: total.results > 0 ? total.spend / total.results : 0,
    roas: total.spend > 0 ? total.revenue / total.spend : 0,
  };
}

function GroupTable({
  kind,
  rows,
  showTitle,
  showAccount,
  showTotal,
  selectedIds,
  onToggleSelect,
}: {
  kind: ObjectiveKind;
  rows: ChatCampaignRow[];
  showTitle: boolean;
  showAccount: boolean;
  showTotal: boolean;
  selectedIds?: Set<string>;
  onToggleSelect?: (row: ChatCampaignRow) => void;
}) {
  const cols = columnsFor(kind);
  const total = showTotal ? totalRow(rows) : null;
  const selectable = !!onToggleSelect;
  return (
    <div className="gx-cpt-g">
      {showTitle && <span className="gx-lbl">{GROUP_LABEL[kind]}</span>}
      <div className="gx-tbl gx-cpt-tbl">
        <table>
          <thead>
            <tr>
              {selectable && <th className="gx-cpt-ck" aria-label="Sélection" />}
              <th>Campagne</th>
              {cols.map((c) => (
                <th key={c.label}>
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const selected = selectedIds?.has(r.id) ?? false;
              return (
              <tr
                key={r.id}
                className={`${selected ? "gx-cpt-on" : ""}${selectable ? " gx-cpt-click" : ""}`}
                aria-selected={selectable ? selected : undefined}
                onClick={selectable ? () => onToggleSelect!(r) : undefined}
              >
                {selectable && (
                  <td className="gx-cpt-ck">
                    <span className={`gx-cpt-box${selected ? " gx-on" : ""}`} aria-hidden>
                      {selected && <Check className="gx-i" />}
                    </span>
                  </td>
                )}
                <td className="gx-cpt-n">
                  <Link
                    to="/campaigns"
                    search={{ metaId: r.id } as never}
                    className="gx-cpt-lk"
                    title={r.name}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {r.name}
                  </Link>
                  {showAccount && r.accountName && (
                    <small>
                      {r.accountName}
                    </small>
                  )}
                </td>
                {cols.map((c) => (
                  <td key={c.label} className="gx-num">
                    {c.value(r)}
                  </td>
                ))}
              </tr>
              );
            })}
            {total && (
              <tr className="gx-cpt-tot">
                {selectable && <td />}
                <td><b>{total.name}</b></td>
                {cols.map((c) => (
                  <td key={c.label} className="gx-num">
                    <b>{c.value(total)}</b>
                  </td>
                ))}
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/**
 * Mini-tableau des campagnes affiché sous la réponse du chat.
 * Regroupé par objectif quand plusieurs objectifs se mélangent.
 */
/** Dernière sélection de campagnes cochées dans un tableau du chat (lue par la zone de saisie). */
let activeCampaignSelection: { id: string; name: string }[] = [];
export function getActiveCampaignSelection() {
  return activeCampaignSelection;
}
export function clearActiveCampaignSelection() {
  activeCampaignSelection = [];
}

export function ChatPerformanceTable({
  campaigns,
  showTotal = false,
  alreadyDetailed = false,
  onAsk,
}: {
  campaigns: ChatCampaignRow[];
  showTotal?: boolean;
  /** Le tableau est déjà le récap détaillé de ces campagnes (filtre appliqué côté serveur). */
  alreadyDetailed?: boolean;
  /** Envoie une question au chat à propos des campagnes sélectionnées. */
  onAsk?: (message: string) => void;
}) {
  const [selected, setSelected] = useState<Map<string, ChatCampaignRow>>(new Map());
  const rows = [...campaigns].sort((a, b) => b.spend - a.spend);
  if (rows.length === 0) return null;

  const selectable = !!onAsk;
  const toggle = (row: ChatCampaignRow) => {
    setSelected((prev) => {
      const next = new Map(prev);
      if (next.has(row.id)) next.delete(row.id);
      else next.set(row.id, row);
      activeCampaignSelection = [...next.values()].map((r) => ({ id: r.id, name: r.name }));
      return next;
    });
  };
  const selectedRows = [...selected.values()];
  const namesLabel =
    selectedRows.length === 1
      ? `la campagne « ${selectedRows[0].name} »`
      : `les campagnes ${selectedRows.map((r) => `« ${r.name} »`).join(", ")}`;

  const groups = new Map<ObjectiveKind, ChatCampaignRow[]>();
  for (const r of rows) {
    const kind = (r.objectiveKind ?? "other") as ObjectiveKind;
    if (!groups.has(kind)) groups.set(kind, []);
    groups.get(kind)!.push(r);
  }
  const multi = groups.size > 1;
  // Badge du compte d'origine seulement quand plusieurs comptes sont mélangés.
  const showAccount = new Set(rows.map((r) => r.accountId).filter(Boolean)).size > 1;

  // Mini tableau de bord : toutes les stats globales citées dans le message, au-dessus du tableau.
  const t = totalRow(rows);
  const stats: Array<{ label: string; value: string }> = [
    { label: "Dépense totale", value: frMoney(t.spend) },
    { label: "Leads", value: frNumber(t.results) },
    { label: "Coût par lead", value: t.results > 0 ? frMoney(t.cost_per_result) : "—" },
    { label: "Affichages", value: frNumber(t.impressions) },
    { label: "Personnes touchées", value: frNumber(t.reach) },
    { label: "Clics", value: frNumber(t.clicks) },
    { label: "Taux de clic", value: frPercent(t.ctr) },
    { label: "Coût par clic", value: t.clicks > 0 ? frMoney(t.cpc) : "—" },
  ];

  return (
    <div className="gx-cpt">
      <div className="gx-cpt-k">
        {stats.map((s) => (
          <StatTile key={s.label} label={s.label} value={s.value} />
        ))}
      </div>
      {[...groups.entries()].map(([kind, groupRows]) => (
        <GroupTable
          key={kind}
          kind={kind}
          rows={groupRows}
          showTitle={multi}
          showAccount={showAccount}
          showTotal={showTotal}
          selectedIds={selectable ? new Set(selected.keys()) : undefined}
          onToggleSelect={selectable ? toggle : undefined}
        />
      ))}
      {selectable && selectedRows.length > 0 && (
        <div className="gx-cpt-bar" role="toolbar" aria-label="Actions sur la sélection">
          <b>
            {selectedRows.length === 1 ? "1 campagne sélectionnée" : `${selectedRows.length} campagnes sélectionnées`}
          </b>
          <button
            type="button"
            onClick={() => onAsk!(`Montre-moi les leads de ${namesLabel}\n<!--selected-campaigns:${JSON.stringify(selectedRows.map((r) => ({ id: r.id, name: r.name })))}-->`)}
            className="gx-btn gx-sm gx-pri"
          >
            <ListFilter className="gx-i" />
            Voir les leads
          </button>
          {!(alreadyDetailed && selectedRows.length === rows.length) && (
            <button
              type="button"
              onClick={() => onAsk!(`Fais-moi un récap détaillé de ${namesLabel}`)}
              className="gx-btn gx-sm"
            >
              <BarChart3 className="gx-i" />
              Récap détaillé
            </button>
          )}
          <button
            type="button"
            onClick={() => setSelected(new Map())}
            className="gx-btn gx-sm gx-ghost gx-cpt-x"
          >
            <X className="gx-i" />
            Désélectionner
          </button>
        </div>
      )}
    </div>
  );
}
