import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { fmtDate, fmtDateTime, fmtInt } from "@/components/admin/adminFormat";
import { CREDIT_KIND_LABEL, actionLabel } from "@/components/admin/insightsLabels";
import { getAdminWorkspaceCredits } from "@/lib/admin/insights.functions";

const PAGE = 50;

/** Onglet « Crédits » de la fiche client : solde, période en cours et historique des mouvements. */
export function ClientCreditsTab({ workspaceId }: { workspaceId: string }) {
  const [includeHolds, setIncludeHolds] = useState(false);
  const [offset, setOffset] = useState(0);
  const fetchCredits = useServerFn(getAdminWorkspaceCredits);
  const { data, isLoading } = useQuery({
    queryKey: ["admin-ws-credits", workspaceId, includeHolds, offset],
    queryFn: () => fetchCredits({ data: { workspaceId, includeHolds, limit: PAGE, offset } }),
    staleTime: 30_000,
  });

  if (isLoading || !data) return <div className="ad-loading"><Loader2 className="ad-i ad-spin" aria-label="Chargement" /></div>;

  return (
    <>
      <div className="ad-gauto">
        <div className="ad-card ad-kpi">
          <span className="ad-lb">Solde disponible</span>
          <span className="ad-v ad-num">{fmtInt(data.balance)}</span>
          <span className="ad-s">{data.held > 0 ? `${fmtInt(data.held)} réservés pour des générations en cours` : "crédits"}</span>
        </div>
        <div className="ad-card ad-kpi">
          <span className="ad-lb">Consommés cette période</span>
          <span className="ad-v ad-num">{fmtInt(data.usedThisPeriod)}</span>
          <span className="ad-s">{data.periodStart ? `depuis le ${fmtDate(data.periodStart, { day: "numeric", month: "long" })}` : "période non définie"}</span>
        </div>
        <div className="ad-card ad-kpi">
          <span className="ad-lb">Ajoutés cette période</span>
          <span className="ad-v ad-num">{fmtInt(data.grantedThisPeriod)}</span>
          <span className="ad-s">{data.periodEnd ? `renouvellement le ${fmtDate(data.periodEnd, { day: "numeric", month: "long" })}` : "abonnement, bonus, ajustements"}</span>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", margin: "20px 0 6px" }}>
        <h3 className="ad-h3" style={{ margin: 0 }}>Mouvements</h3>
        <label style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "var(--gx-muted)", cursor: "pointer" }}>
          <input type="checkbox" checked={includeHolds} onChange={(e) => { setIncludeHolds(e.target.checked); setOffset(0); }} />
          Afficher les réservations
        </label>
      </div>
      <p className="ad-muted" style={{ margin: "0 0 8px", fontSize: 12.5 }}>
        Chaque génération réserve d'abord ses crédits puis les débite : les réservations sont masquées pour ne pas compter deux fois.
      </p>

      {data.rows.length === 0 ? <div className="ad-empty"><b>Aucun mouvement</b>Ce client n'a encore rien consommé ni reçu.</div> : (
        <div className="ad-tw">
          <table className="ad-table">
            <thead><tr><th>Date</th><th>Mouvement</th><th>Détail</th><th className="ad-num">Crédits</th><th className="ad-num">Solde après</th></tr></thead>
            <tbody>
              {data.rows.map((r) => {
                const plus = r.amount > 0;
                return (
                  <tr key={r.id}>
                    <td>{fmtDateTime(r.createdAt)}</td>
                    <td><span className={`ad-pill ${r.kind === "refund" || (plus && r.kind !== "hold") ? "ok" : r.kind === "hold" ? "out" : ""}`}>{CREDIT_KIND_LABEL[r.kind] ?? r.kind}</span></td>
                    <td style={{ whiteSpace: "normal", minWidth: 200 }}>
                      {actionLabel(r.actionCode)}
                      {r.reason && <small className="ad-muted" style={{ display: "block" }}>Motif : {r.reason}</small>}
                      {r.createdByEmail && <small className="ad-muted" style={{ display: "block" }}>par {r.createdByEmail}</small>}
                    </td>
                    <td className="ad-num" style={{ textAlign: "right", fontWeight: 600, color: plus ? "var(--gx-ok-ink)" : "var(--gx-fg)" }}>{plus ? "+" : ""}{fmtInt(r.amount)}</td>
                    <td className="ad-num" style={{ textAlign: "right" }}>{r.balanceAfter != null ? fmtInt(r.balanceAfter) : <span className="ad-muted">-</span>}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      {data.total > PAGE && (
        <div className="ad-pager" style={{ padding: "12px 0 0" }}>
          <span>{fmtInt(data.total)} mouvements</span>
          <div className="ad-r">
            <button type="button" className="ad-btn sm" disabled={offset === 0} onClick={() => setOffset(Math.max(0, offset - PAGE))}>Précédent</button>
            <button type="button" className="ad-btn sm" disabled={offset + PAGE >= data.total} onClick={() => setOffset(offset + PAGE)}>Suivant</button>
          </div>
        </div>
      )}
    </>
  );
}
