import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { getAdminDashboard } from "@/lib/admin/functions";
import { composeHealthcheck } from "@/lib/batch.functions";
import { Activity, AlertTriangle, ArrowDown, ArrowUp, Building2, Check, ChevronRight, Clock, Eye, Loader2, Zap } from "lucide-react";
import { AdminTopBar } from "@/components/admin/AdminTopBar";
import { AdminLineChart, AdminStatusBars, SERIES_COLORS, StatusLegend, StatusTable } from "@/components/admin/charts/AdminCharts";
import { fmtEur, fmtInt, fmtPct, planLabel } from "@/components/admin/adminFormat";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Admin - Growthity" }] }),
  component: AdminDashboard,
});

function Delta({ pct, label }: { pct: number | null | undefined; label?: string }) {
  if (pct == null || !Number.isFinite(pct)) return null;
  const r = Math.round(pct * 10) / 10;
  const cls = r === 0 ? "flat" : r > 0 ? "up" : "down";
  return (
    <>
      <span className={`ad-delta ${cls}`}>
        {r >= 0 ? <ArrowUp aria-hidden /> : <ArrowDown aria-hidden />}
        {r > 0 ? "+" : ""}{String(r).replace(".", ",")} %
      </span>
      {label ? <span>{label}</span> : null}
    </>
  );
}

function AdminDashboard() {
  const fetchDash = useServerFn(getAdminDashboard);
  const [view, setView] = useState<"chart" | "table">("chart");
  const { data, isLoading } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: () => fetchDash(),
    staleTime: 30_000,
  });

  const subtitle = `Vue globale de Growthity · ${new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}`;

  if (isLoading || !data) {
    return (
      <>
        <AdminTopBar title="Dashboard" subtitle={subtitle} />
        <div className="ad-loading"><Loader2 className="ad-i ad-spin" aria-label="Chargement" /></div>
      </>
    );
  }

  const demo = data.billing.isMock;
  const mrrPoints = data.billing.series.map((s) => {
    const d = new Date(s.month + "-01");
    return {
      label: d.toLocaleDateString("fr-FR", { month: "short" }),
      title: d.toLocaleDateString("fr-FR", { month: "long", year: "numeric" }),
      value: s.amountCents,
    };
  });
  const days = data.series.map((s) => ({ date: s.date, ok: s.ok, pending: s.pending, failed: s.failed }));

  const seg = data.segments;
  const totalSeg = seg.active + seg.atRisk + seg.inactive;
  const pct = (v: number) => (totalSeg ? Math.round((v / totalSeg) * 100) : 0);
  const failRate = data.ads.month > 0 ? data.ads.failedMonth / data.ads.month : 0;
  const churn = data.billing.churnRate;
  const spike = data.ads.failedDay >= 5 && data.ads.failedDay > data.ads.failedPrevDay * 2;
  const adsDelta = data.ads.prevMonth > 0 ? ((data.ads.month - data.ads.prevMonth) / data.ads.prevMonth) * 100 : null;
  const top = data.topWorkspaces.slice(0, 8);
  const topMax = top[0]?.count || 1;
  const plans = Object.entries(data.workspaces.byPlan).sort((a, b) => b[1] - a[1]);
  const planMax = Math.max(1, ...plans.map(([, c]) => c));

  return (
    <>
      <AdminTopBar title="Dashboard" subtitle={subtitle} />
      <div className="ad-page">
        {(data.pendingLong.count > 0 || spike) && (
          <div className="ad-alerts">
            {data.pendingLong.count > 0 && (
              <div className="ad-al warn" role="alert">
                <span className="ad-aic"><Clock className="ad-i" aria-hidden /></span>
                <div style={{ minWidth: 0 }}>
                  <b>{data.pendingLong.count} génération{data.pendingLong.count > 1 ? "s" : ""} coincée{data.pendingLong.count > 1 ? "s" : ""} en attente</b>
                  <p>Plus d'1 h sans passer en réussie ou échouée.</p>
                  <div className="ad-links">
                    {data.pendingLong.sample.slice(0, 3).map((a) => (
                      <Link key={a.id} to="/admin/workspaces/$id" params={{ id: a.workspace_id as string }}>
                        {a.title ?? a.id.slice(0, 8)} · {new Date(a.created_at as string).toLocaleString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {spike && (
              <div className="ad-al bad" role="alert">
                <span className="ad-aic"><AlertTriangle className="ad-i" aria-hidden /></span>
                <div>
                  <b>Pic anormal d'échecs : {data.ads.failedDay} sur 24 h</b>
                  <p>Contre {data.ads.failedPrevDay} la veille. Vérifie les logs des générateurs (fal, creatomate, LLM).</p>
                </div>
                <Link to="/admin/notifications" className="ad-btn sm ad-go">Voir</Link>
              </div>
            )}
          </div>
        )}

        <div className="ad-g4">
          <div className="ad-card ad-kpi">
            <span className="ad-lb">MRR mensuel{demo ? " · démo" : ""}</span>
            <span className="ad-v ad-num">{fmtEur(data.billing.mrrCurrentCents)}</span>
            <span className="ad-s"><Delta pct={data.billing.mrrDeltaPct} label="vs mois précédent" /></span>
            <span className="ad-s">{data.billing.payingCount} client{data.billing.payingCount > 1 ? "s" : ""} payant{data.billing.payingCount > 1 ? "s" : ""}</span>
          </div>
          <div className={`ad-card ad-kpi${churn > 0.1 ? " bad" : churn > 0.05 ? " warn" : ""}`}>
            <span className="ad-lb">Churn</span>
            <span className="ad-v ad-num">{fmtPct(churn)}</span>
            <span className="ad-s">{data.billing.churnedCount} client{data.billing.churnedCount > 1 ? "s" : ""} perdu{data.billing.churnedCount > 1 ? "s" : ""} ce mois</span>
          </div>
          <div className="ad-card ad-kpi">
            <span className="ad-lb">Créations · 30 j</span>
            <span className="ad-v ad-num">{fmtInt(data.ads.month)}</span>
            <span className="ad-s"><Delta pct={adsDelta} label="vs 30 j précédents" /></span>
            <span className="ad-s">{fmtInt(data.ads.week)} cette semaine · {fmtInt(data.ads.day)} aujourd'hui</span>
          </div>
          <div className={`ad-card ad-kpi${failRate > 0.1 ? " bad" : failRate > 0.05 ? " warn" : ""}`}>
            <span className="ad-lb">Taux d'échec · 30 j</span>
            <span className="ad-v ad-num">{fmtPct(failRate)}</span>
            <span className="ad-s">{fmtInt(data.ads.failedMonth)} échecs sur {fmtInt(data.ads.month)}</span>
          </div>
        </div>

        <div className="ad-strip">
          <div><span className="ad-si"><Building2 className="ad-i" aria-hidden /></span><span><b className="ad-num">{fmtInt(data.workspaces.total)}</b><small>Workspaces</small></span></div>
          <div className="ok"><span className="ad-si"><Activity className="ad-i" aria-hidden /></span><span><b className="ad-num">{fmtInt(seg.active)}</b><small>Actifs · 7 j</small></span></div>
          <div className="warn"><span className="ad-si"><AlertTriangle className="ad-i" aria-hidden /></span><span><b className="ad-num">{fmtInt(seg.atRisk)}</b><small>À risque · 8 à 30 j</small></span></div>
          <div className={data.activeImpersonations > 0 ? "warn" : "pri"}><span className="ad-si"><Eye className="ad-i" aria-hidden /></span><span><b className="ad-num">{data.activeImpersonations}</b><small>Impersonations en cours</small></span></div>
        </div>

        <div className="ad-g2">
          <section className="ad-card">
            <div className="ad-ch">
              <div><h2>Évolution du MRR</h2><small>6 derniers mois{demo ? " · données démo" : ""}</small></div>
              <div className="ad-r"><span className="ad-pill pri">{fmtEur(data.billing.mrrCurrentCents)} ce mois</span></div>
            </div>
            <div className="ad-cb">
              <AdminLineChart
                data={mrrPoints}
                format={fmtEur}
                axisFormat={(v) => (v >= 100_000 ? `${(v / 100_000).toLocaleString("fr-FR", { maximumFractionDigits: 1 })} k€` : fmtEur(v))}
                label={`Évolution du MRR sur ${mrrPoints.length} mois`}
                tipTitle="MRR"
              />
            </div>
          </section>

          <section className="ad-card">
            <div className="ad-ch"><div><h2>Segmentation des clients</h2><small>Selon la dernière activité</small></div></div>
            <div className="ad-cb">
              <div className="ad-hero"><b className="ad-num">{pct(seg.active)} %</b><span>des clients sont actifs</span></div>
              <div className="ad-segbar" role="img" aria-label={`Actifs ${seg.active}, à risque ${seg.atRisk}, inactifs ${seg.inactive}`}>
                {seg.active > 0 && <i style={{ flex: seg.active, background: SERIES_COLORS.ok }} />}
                {seg.atRisk > 0 && <i style={{ flex: seg.atRisk, background: SERIES_COLORS.pending }} />}
                {seg.inactive > 0 && <i style={{ flex: seg.inactive, background: SERIES_COLORS.neutral }} />}
              </div>
              <div className="ad-segrows">
                {([["Actifs", "7 derniers jours", seg.active, SERIES_COLORS.ok], ["À risque", "8 à 30 jours", seg.atRisk, SERIES_COLORS.pending], ["Inactifs", "plus de 30 jours", seg.inactive, SERIES_COLORS.neutral]] as const).map(([l, s, v, c]) => (
                  <div className="ad-segrow" key={l}>
                    <i className="ad-sw" style={{ background: c }} />
                    <span>{l} <small>· {s}</small></span>
                    <strong className="ad-num">{fmtInt(v)}</strong>
                    <em className="ad-num">{pct(v)} %</em>
                  </div>
                ))}
              </div>
              {seg.atRisk > 0 && (
                <Link to="/admin/workspaces" search={{ segment: "at_risk" }} className="ad-btn sm" style={{ marginTop: 16 }}>
                  Voir les clients à risque <ChevronRight className="ad-i" aria-hidden />
                </Link>
              )}
            </div>
          </section>
        </div>

        <div className="ad-g2">
          <section className="ad-card">
            <div className="ad-ch">
              <div><h2>Volume de créations</h2><small>30 derniers jours, par statut</small></div>
              <div className="ad-r">
                <div className="ad-seg" role="group" aria-label="Affichage">
                  <button type="button" aria-pressed={view === "chart"} onClick={() => setView("chart")}>Graphique</button>
                  <button type="button" aria-pressed={view === "table"} onClick={() => setView("table")}>Tableau</button>
                </div>
              </div>
            </div>
            <div className="ad-cb">
              {view === "chart" ? (
                <>
                  <StatusLegend />
                  <div style={{ height: 8 }} />
                  <AdminStatusBars data={days} label="Créations par jour sur 30 jours, par statut" />
                </>
              ) : <StatusTable data={days} />}
            </div>
          </section>

          <section className="ad-card">
            <div className="ad-ch">
              <div><h2>Top workspaces</h2><small>Créations sur 30 jours</small></div>
              <div className="ad-r"><Link to="/admin/workspaces" className="ad-btn sm ghost">Tous <ChevronRight className="ad-i" aria-hidden /></Link></div>
            </div>
            <div className="ad-cb ad-rank">
              {top.length === 0 && <div className="ad-empty">Aucune activité.</div>}
              {top.map((w, i) => (
                <Link key={w.id} to="/admin/workspaces/$id" params={{ id: w.id }} className="ad-rk">
                  <span className="ad-n">{String(i + 1).padStart(2, "0")}</span>
                  <span className="ad-nm">{w.name}</span>
                  <span className="ad-bar"><i style={{ width: `${(w.count / topMax) * 100}%` }} /></span>
                  <strong className="ad-num">{fmtInt(w.count)}</strong>
                </Link>
              ))}
            </div>
          </section>
        </div>

        <div className="ad-g2">
          <section className="ad-card">
            <div className="ad-ch"><div><h2>Répartition par plan</h2><small>{fmtInt(data.workspaces.total)} workspaces</small></div></div>
            <div className="ad-cb ad-plans">
              {plans.map(([plan, count]) => (
                <div className="ad-plan" key={plan}>
                  <span>{planLabel(plan)}</span>
                  <span className="ad-bar"><i style={{ width: `${(count / planMax) * 100}%` }} /></span>
                  <span className="ad-num"><b>{fmtInt(count)}</b> · {data.workspaces.total ? Math.round((count / data.workspaces.total) * 100) : 0} %</span>
                </div>
              ))}
            </div>
          </section>
          <ComposeHealthcheckCard />
        </div>
      </div>
    </>
  );
}

/** Vérifie en un clic que le moteur de composition d'images fonctionne. */
function ComposeHealthcheckCard() {
  const run = useServerFn(composeHealthcheck);
  const [state, setState] = useState<{ loading: boolean; ok: boolean | null; text: string }>({ loading: false, ok: null, text: "" });
  return (
    <section className="ad-card">
      <div className="ad-ch"><div><h2>Santé du moteur d'images</h2><small>Génère une image de test, sans crédit client</small></div></div>
      <div className="ad-cb ad-engine">
        <button
          type="button"
          className="ad-btn"
          disabled={state.loading}
          onClick={async () => {
            setState({ loading: true, ok: null, text: "" });
            try {
              const result: any = await run();
              setState(result.ok
                ? { loading: false, ok: true, text: `image de ${fmtInt(result.bytes)} octets en ${fmtInt(result.ms)} ms` }
                : { loading: false, ok: false, text: String(result.error ?? "erreur inconnue") });
            } catch (error) {
              setState({ loading: false, ok: false, text: (error as Error)?.message ?? "erreur inconnue" });
            }
          }}
        >
          {state.loading ? <Loader2 className="ad-i ad-spin" aria-hidden /> : <Zap className="ad-i" aria-hidden />}
          {state.loading ? "Test en cours…" : "Tester le moteur d'images"}
        </button>
        {state.ok === true && <span className="ad-pill ok"><Check aria-hidden />Moteur OK</span>}
        {state.ok === false && <span className="ad-pill bad"><AlertTriangle aria-hidden />Échec</span>}
        {state.text && <span className="ad-muted" role="status">{state.text}</span>}
      </div>
    </section>
  );
}
