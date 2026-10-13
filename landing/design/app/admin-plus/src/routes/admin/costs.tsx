import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AlertTriangle, Info, Loader2 } from "lucide-react";
import { AdminTopBar } from "@/components/admin/AdminTopBar";
import { AdminLineChart } from "@/components/admin/charts/AdminCharts";
import { fmtEur, fmtInt } from "@/components/admin/adminFormat";
import { actionLabel, providerLabel } from "@/components/admin/insightsLabels";
import { getAdminCosts, adminUpsertProviderPrice } from "@/lib/admin/insights.functions";
import { getAdminAccessStatus } from "@/lib/admin/functions";
import type { CostPeriod } from "@/lib/admin/insights.types";

export const Route = createFileRoute("/admin/costs")({
  head: () => ({ meta: [{ title: "Coûts et marge - Admin" }] }),
  component: CostsPage,
});

/** Centimes avec deux décimales (les coûts unitaires sont petits). */
const eurFine = (cents: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", minimumFractionDigits: 2, maximumFractionDigits: 4 }).format(cents / 100);

function CostsPage() {
  const [days, setDays] = useState<CostPeriod>(30);
  const fetchCosts = useServerFn(getAdminCosts);
  const { data, isLoading } = useQuery({
    queryKey: ["admin-costs", days],
    queryFn: () => fetchCosts({ data: { days } }),
    staleTime: 60_000,
  });

  const period = (
    <div className="ad-seg" role="group" aria-label="Période">
      {([7, 30, 90] as const).map((d) => (
        <button key={d} type="button" aria-pressed={days === d} onClick={() => setDays(d)}>{d} jours</button>
      ))}
    </div>
  );

  if (isLoading || !data) {
    return (
      <>
        <AdminTopBar title="Coûts et marge" subtitle="Ce que coûtent les générations, comparé à ce que tu encaisses" actions={period} />
        <div className="ad-loading"><Loader2 className="ad-i ad-spin" aria-label="Chargement" /></div>
      </>
    );
  }

  const t = data.totals;
  const margin = t.revenueCents - t.costCents;
  const marginRate = t.revenueCents > 0 ? margin / t.revenueCents : null;
  const totalCalls = data.coverage.pricedCalls + data.coverage.unpricedCalls;
  const coverage = totalCalls > 0 ? data.coverage.pricedCalls / totalCalls : 1;
  const partial = data.dataSince && new Date(data.dataSince) > new Date(data.since);
  const provMax = Math.max(1, ...data.byProvider.map((p) => p.costCents));
  const realVsTheo = t.realCostPerCreditCents != null && t.theoreticalCostPerCreditCents > 0
    ? t.realCostPerCreditCents / t.theoreticalCostPerCreditCents : null;

  return (
    <>
      <AdminTopBar title="Coûts et marge" subtitle="Ce que coûtent les générations, comparé à ce que tu encaisses" actions={period} />
      <div className="ad-page">
        {(coverage < 0.95 || partial) && (
          <div className="ad-al warn" role="note">
            <span className="ad-aic"><Info className="ad-i" aria-hidden /></span>
            <div>
              <b>Chiffres incomplets</b>
              <p>
                {coverage < 0.95 && <>{fmtInt(data.coverage.unpricedCalls)} appels sur {fmtInt(totalCalls)} n'ont pas de tarif fournisseur : leur coût n'est pas compté. Renseigne les tarifs manquants plus bas. </>}
                {partial && <>Les coûts ne sont enregistrés que depuis le {new Date(data.dataSince!).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}.</>}
              </p>
            </div>
          </div>
        )}

        <div className="ad-g4">
          <div className="ad-card ad-kpi">
            <span className="ad-lb">Encaissé HT · {days} j</span>
            <span className="ad-v ad-num">{fmtEur(t.revenueCents)}</span>
            <span className="ad-s">Factures Stripe payées, hors TVA</span>
          </div>
          <div className="ad-card ad-kpi">
            <span className="ad-lb">Coût des générations · {days} j</span>
            <span className="ad-v ad-num">{fmtEur(t.costCents)}</span>
            <span className="ad-s">{fmtInt(t.creditsConsumed)} crédits consommés</span>
          </div>
          <div className={`ad-card ad-kpi${margin < 0 ? " bad" : ""}`}>
            <span className="ad-lb">Marge brute · {days} j</span>
            <span className="ad-v ad-num">{fmtEur(margin)}</span>
            <span className="ad-s">{marginRate != null ? `${Math.round(marginRate * 100)} % de l'encaissé` : "Rien d'encaissé sur la période"}</span>
          </div>
          <div className={`ad-card ad-kpi${realVsTheo != null && realVsTheo > 1.25 ? " warn" : ""}`}>
            <span className="ad-lb">Coût réel d'un crédit</span>
            <span className="ad-v ad-num">{t.realCostPerCreditCents != null ? eurFine(t.realCostPerCreditCents) : "-"}</span>
            <span className="ad-s">
              Prévu : {eurFine(t.theoreticalCostPerCreditCents)}
              {realVsTheo != null && <span className={`ad-pill ${realVsTheo > 1.25 ? "warn" : "ok"}`}>{realVsTheo > 1 ? "+" : ""}{Math.round((realVsTheo - 1) * 100)} %</span>}
            </span>
          </div>
        </div>

        <div className="ad-g2">
          <section className="ad-card">
            <div className="ad-ch"><div><h2>Coût par jour</h2><small>Coût fournisseurs connu, en euros</small></div></div>
            <div className="ad-cb">
              <AdminLineChart
                data={data.series.map((s) => {
                  const d = new Date(s.date);
                  return { label: d.toLocaleDateString("fr-FR", { day: "numeric", month: "numeric" }), title: d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" }), value: s.costCents };
                })}
                format={eurFine}
                axisFormat={fmtEur}
                tipTitle="Coût"
                label={`Coût des générations par jour sur ${days} jours`}
              />
            </div>
          </section>
          <section className="ad-card">
            <div className="ad-ch"><div><h2>Par fournisseur</h2><small>Coût sur {days} jours</small></div></div>
            <div className="ad-cb ad-rank">
              {data.byProvider.length === 0 && <div className="ad-empty">Aucun coût enregistré.</div>}
              {data.byProvider.map((p, i) => (
                <div key={p.provider} className="ad-rk">
                  <span className="ad-n">{String(i + 1).padStart(2, "0")}</span>
                  <span className="ad-nm wrap">{providerLabel(p.provider)} <small className="ad-muted">· {fmtInt(p.calls)} appels</small></span>
                  <span className="ad-bar"><i style={{ width: `${(p.costCents / provMax) * 100}%` }} /></span>
                  <strong className="ad-num">{fmtEur(p.costCents)}</strong>
                </div>
              ))}
            </div>
          </section>
        </div>

        <section className="ad-card">
          <div className="ad-ch"><div><h2>Clients qui coûtent le plus</h2><small>Coût des générations comparé à ce qu'ils ont payé (HT) sur {days} jours</small></div></div>
          {data.topWorkspaces.length === 0 ? <div className="ad-empty">Aucun coût rattaché à un client sur la période.</div> : (
            <div className="ad-tw">
              <table className="ad-table">
                <thead><tr><th>Client</th><th>Plan</th><th className="ad-num">Crédits consommés</th><th className="ad-num">Coût</th><th className="ad-num">Encaissé HT</th><th className="ad-num">Marge</th></tr></thead>
                <tbody>
                  {data.topWorkspaces.map((w) => {
                    const m = w.revenueCents - w.costCents;
                    return (
                      <tr key={w.workspaceId}>
                        <td><Link to="/admin/workspaces/$id" params={{ id: w.workspaceId }} style={{ color: "inherit", fontWeight: 600, textDecoration: "none" }}>{w.name}</Link></td>
                        <td><span className="ad-pill out">{w.plan ?? "free"}</span></td>
                        <td className="ad-num">{fmtInt(w.creditsConsumed)}</td>
                        <td className="ad-num">{fmtEur(w.costCents)}</td>
                        <td className="ad-num">{w.revenueCents ? fmtEur(w.revenueCents) : <span className="ad-muted">-</span>}</td>
                        <td className="ad-num">
                          <span className={`ad-pill ${m < 0 ? "bad" : "ok"}`}>{m < 0 && <AlertTriangle aria-hidden />}{fmtEur(m)}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="ad-card">
          <div className="ad-ch"><div><h2>Par action</h2><small>Ce que coûte chaque type de génération</small></div></div>
          {data.byAction.length === 0 ? <div className="ad-empty">Aucune action sur la période.</div> : (
            <div className="ad-tw">
              <table className="ad-table">
                <thead><tr><th>Action</th><th className="ad-num">Appels</th><th className="ad-num">Crédits consommés</th><th className="ad-num">Coût</th><th className="ad-num">Coût moyen</th><th className="ad-num">Coût par crédit</th></tr></thead>
                <tbody>
                  {data.byAction.map((a) => (
                    <tr key={a.actionCode}>
                      <td>{actionLabel(a.actionCode)}</td>
                      <td className="ad-num">{fmtInt(a.calls)}</td>
                      <td className="ad-num">{fmtInt(a.creditsConsumed)}</td>
                      <td className="ad-num">{fmtEur(a.costCents)}</td>
                      <td className="ad-num">{a.calls ? eurFine(a.costCents / a.calls) : "-"}</td>
                      <td className="ad-num">{a.creditsConsumed ? eurFine(a.costCents / a.creditsConsumed) : "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <MissingPrices models={data.coverage.unpricedModels} days={days} />
      </div>
    </>
  );
}

/** Modèles appelés sans tarif fournisseur : l'admin saisit le prix, il n'est jamais deviné. */
function MissingPrices({ models, days }: { models: { modelId: string; provider: string | null; unit: string | null; calls: number }[]; days: CostPeriod }) {
  const qc = useQueryClient();
  const fetchAccess = useServerFn(getAdminAccessStatus);
  const { data: session } = useQuery({ queryKey: ["admin-session"], queryFn: () => fetchAccess(), staleTime: 30_000, retry: false });
  const upsert = useServerFn(adminUpsertProviderPrice);
  const [values, setValues] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const isSuper = !!session?.isSuper;

  if (models.length === 0) return null;

  const save = async (m: (typeof models)[number]) => {
    const v = Number((values[m.modelId] ?? "").replace(",", "."));
    if (!Number.isFinite(v) || v < 0) { toast.error("Indique un prix valide, en dollars."); return; }
    setBusy(m.modelId);
    try {
      await upsert({ data: { modelId: m.modelId, provider: m.provider, unit: m.unit, usdPerUnit: v } });
      toast.success("Tarif enregistré. Il s'applique aux prochaines générations.");
      await qc.invalidateQueries({ queryKey: ["admin-costs", days] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Enregistrement impossible");
    } finally {
      setBusy(null);
    }
  };

  return (
    <section className="ad-card">
      <div className="ad-ch">
        <div>
          <h2>Tarifs fournisseurs manquants</h2>
          <small>Ces modèles ont été appelés mais leur prix n'est pas connu. Saisis le prix public du fournisseur, en dollars.</small>
        </div>
      </div>
      <div className="ad-tw">
        <table className="ad-table">
          <thead><tr><th>Modèle</th><th>Fournisseur</th><th>Unité</th><th className="ad-num">Appels</th><th>Prix ($ / unité)</th><th /></tr></thead>
          <tbody>
            {models.map((m) => (
              <tr key={m.modelId}>
                <td className="ad-mono">{m.modelId}</td>
                <td>{providerLabel(m.provider)}</td>
                <td>{m.unit ?? <span className="ad-muted">-</span>}</td>
                <td className="ad-num">{fmtInt(m.calls)}</td>
                <td style={{ minWidth: 140 }}>
                  <label className="ad-inp" style={{ height: 32 }}>
                    <input inputMode="decimal" placeholder="0,0035" value={values[m.modelId] ?? ""} disabled={!isSuper}
                      onChange={(e) => setValues((s) => ({ ...s, [m.modelId]: e.target.value }))} aria-label={`Prix de ${m.modelId}`} />
                  </label>
                </td>
                <td>
                  <button type="button" className="ad-btn sm" disabled={!isSuper || busy === m.modelId || !(values[m.modelId] ?? "").trim()} onClick={() => save(m)}>
                    {busy === m.modelId && <Loader2 className="ad-i ad-spin" aria-hidden />}Enregistrer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!isSuper && <div className="ad-cb ad-muted" style={{ fontSize: 12.5 }}>Seul un super-admin peut saisir un tarif.</div>}
    </section>
  );
}
