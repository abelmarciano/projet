import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight, Loader2 } from "lucide-react";
import { AdminTopBar } from "@/components/admin/AdminTopBar";
import { fmtInt, timeAgo } from "@/components/admin/adminFormat";
import { getAdminFunnel } from "@/lib/admin/insights.functions";
import type { AdminFunnel, FunnelStepKey } from "@/lib/admin/insights.types";

export const Route = createFileRoute("/admin/funnel")({
  head: () => ({ meta: [{ title: "Acquisition et activation - Admin" }] }),
  component: FunnelPage,
});

/** Prochaine étape à franchir pour un client arrêté : ce qu'on peut l'aider à faire. */
const NEXT_STEP: Record<FunnelStepKey, string> = {
  signup: "Finir son profil",
  onboarded: "Créer sa première pub",
  first_creation: "Connecter Meta",
  meta_connected: "Publier sa première campagne",
  first_publish: "Passer à un plan payant",
  paying: "-",
};

const fmtHours = (h: number | null) => {
  if (h == null) return "-";
  if (h < 1) return `${Math.max(1, Math.round(h * 60))} min`;
  if (h < 48) return `${Math.round(h)} h`;
  return `${Math.round(h / 24)} j`;
};

function FunnelPage() {
  const [days, setDays] = useState<AdminFunnel["days"]>(90);
  const [stepFilter, setStepFilter] = useState<FunnelStepKey | "all">("all");
  const fetchFunnel = useServerFn(getAdminFunnel);
  const { data, isLoading } = useQuery({
    queryKey: ["admin-funnel", days],
    queryFn: () => fetchFunnel({ data: { days } }),
    staleTime: 60_000,
  });

  const period = (
    <div className="ad-seg" role="group" aria-label="Période d'inscription">
      {([[30, "30 j"], [90, "90 j"], [365, "1 an"], [0, "Tout"]] as const).map(([d, l]) => (
        <button key={d} type="button" aria-pressed={days === d} onClick={() => setDays(d)}>{l}</button>
      ))}
    </div>
  );
  const subtitle = "De l'inscription au premier paiement : où les clients décrochent";

  if (isLoading || !data) {
    return (
      <>
        <AdminTopBar title="Acquisition et activation" subtitle={subtitle} actions={period} />
        <div className="ad-loading"><Loader2 className="ad-i ad-spin" aria-label="Chargement" /></div>
      </>
    );
  }

  const top = data.steps[0]?.count || 0;
  const weekMax = Math.max(1, ...data.weekly.map((w) => w.signups));
  const stalled = data.stalled.filter((s) => stepFilter === "all" || s.lastStep === stepFilter);
  const labelOf = (k: FunnelStepKey) => data.steps.find((s) => s.key === k)?.label ?? k;
  // La plus grosse perte entre deux étapes : c'est là qu'il faut agir en premier.
  let worst: { from: string; to: string; lost: number } | null = null;
  for (let i = 1; i < data.steps.length; i++) {
    const lost = data.steps[i - 1].count - data.steps[i].count;
    if (lost > 0 && (!worst || lost > worst.lost)) worst = { from: data.steps[i - 1].label, to: data.steps[i].label, lost };
  }

  return (
    <>
      <AdminTopBar title="Acquisition et activation" subtitle={subtitle} actions={period} />
      <div className="ad-page">
        <section className="ad-card">
          <div className="ad-ch">
            <div><h2>Parcours des clients</h2><small>Clients inscrits {days ? `ces ${days === 365 ? "12 derniers mois" : `${days} derniers jours`}` : "depuis le début"}, et l'étape la plus loin qu'ils ont atteinte</small></div>
          </div>
          <div className="ad-cb">
            {top === 0 ? <div className="ad-empty"><b>Aucune inscription</b>Pas de nouveau client sur cette période.</div> : (
              <div className="ad-funnel">
                {data.steps.map((s, i) => {
                  const prev = i > 0 ? data.steps[i - 1].count : null;
                  const conv = prev ? s.count / prev : null;
                  const mh = i > 0 ? data.medianHours.find((m) => m.to === s.key)?.hours ?? null : null;
                  return (
                    <div key={s.key} className="ad-fstep">
                      <div className="ad-fhead">
                        <b>{s.label}</b>
                        <span className="ad-num"><strong>{fmtInt(s.count)}</strong> · {Math.round((s.count / top) * 100)} %</span>
                      </div>
                      <div className="ad-fbar"><i style={{ width: `${Math.max(s.count ? 2 : 0, (s.count / top) * 100)}%` }} /></div>
                      {i > 0 && (
                        <small className="ad-muted">
                          {conv != null ? `${Math.round(conv * 100)} % de l'étape précédente` : ""}
                          {mh != null ? ` · délai médian ${fmtHours(mh)}` : ""}
                        </small>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            {worst && top >= 5 && (
              <p className="ad-muted" style={{ margin: "14px 0 0", fontSize: 13 }}>
                La plus grosse perte : <b style={{ color: "var(--gx-fg)" }}>{fmtInt(worst.lost)} clients</b> entre « {worst.from} » et « {worst.to} ».
              </p>
            )}
            {top > 0 && top < 20 && (
              <p className="ad-muted" style={{ margin: "8px 0 0", fontSize: 12.5 }}>Peu d'inscriptions sur la période : regarde les nombres plutôt que les pourcentages.</p>
            )}
          </div>
        </section>

        <div className="ad-g2">
          <section className="ad-card">
            <div className="ad-ch"><div><h2>Inscriptions par semaine</h2><small>Dont clients devenus payants</small></div></div>
            <div className="ad-cb">
              {data.weekly.length === 0 ? <div className="ad-empty">Aucune inscription.</div> : (
                <div className="ad-weeks" role="img" aria-label="Inscriptions par semaine">
                  {data.weekly.map((w) => (
                    <div key={w.weekStart} className="ad-wk" title={`Semaine du ${new Date(w.weekStart).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })} : ${w.signups} inscription${w.signups > 1 ? "s" : ""}, ${w.paying} payant${w.paying > 1 ? "s" : ""}`}>
                      <span className="ad-wkv ad-num">{w.signups || ""}</span>
                      <span className="ad-wkb" style={{ height: `${(w.signups / weekMax) * 100}%` }}>
                        {w.paying > 0 && <i style={{ height: `${(w.paying / Math.max(1, w.signups)) * 100}%` }} />}
                      </span>
                      <small>{new Date(w.weekStart).toLocaleDateString("fr-FR", { day: "numeric", month: "numeric" })}</small>
                    </div>
                  ))}
                </div>
              )}
              <div className="ad-legend" style={{ marginTop: 10 }}>
                <span><i className="ad-sw" style={{ background: "color-mix(in srgb, var(--gx-accent) 30%, var(--gx-surface))" }} />Inscriptions</span>
                <span><i className="ad-sw" style={{ background: "var(--gx-accent)" }} />Devenus payants</span>
              </div>
            </div>
          </section>

          <section className="ad-card">
            <div className="ad-ch"><div><h2>Par source</h2><small>Déclarée à l'inscription</small></div></div>
            <div className="ad-tw">
              <table className="ad-table">
                <thead><tr><th>Source</th><th className="ad-num">Inscrits</th><th className="ad-num">Ont créé</th><th className="ad-num">Payants</th></tr></thead>
                <tbody>
                  {data.bySource.map((s) => (
                    <tr key={s.source}>
                      <td>{s.source || "Non renseignée"}</td>
                      <td className="ad-num">{fmtInt(s.signups)}</td>
                      <td className="ad-num">{fmtInt(s.activated)}</td>
                      <td className="ad-num">{fmtInt(s.paying)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <section className="ad-card">
          <div className="ad-ch">
            <div><h2>Clients à relancer</h2><small>Arrêtés à une étape : la colonne « Prochaine étape » dit quoi leur proposer</small></div>
            <div className="ad-r">
              <select className="ad-sel" aria-label="Étape atteinte" value={stepFilter} onChange={(e) => setStepFilter(e.target.value as FunnelStepKey | "all")}>
                <option value="all">Toutes les étapes</option>
                {data.steps.filter((s) => s.key !== "paying").map((s) => <option key={s.key} value={s.key}>Arrêtés à : {s.label}</option>)}
              </select>
            </div>
          </div>
          {stalled.length === 0 ? <div className="ad-empty">Personne à relancer.</div> : (
            <div className="ad-tw" style={{ marginTop: 12 }}>
              <table className="ad-table">
                <thead><tr><th>Client</th><th>Dernière étape</th><th>Depuis</th><th>Prochaine étape</th><th /></tr></thead>
                <tbody>
                  {stalled.slice(0, 100).map((s) => (
                    <tr key={s.workspaceId}>
                      <td><div style={{ display: "flex", flexDirection: "column" }}><b>{s.name}</b><small className="ad-muted">{s.ownerEmail ?? "-"}</small></div></td>
                      <td><span className="ad-pill out">{labelOf(s.lastStep)}</span></td>
                      <td>{timeAgo(s.since)}</td>
                      <td>{NEXT_STEP[s.lastStep]}</td>
                      <td><Link to="/admin/workspaces/$id" params={{ id: s.workspaceId }} className="ad-btn sm ghost">Fiche <ChevronRight className="ad-i" aria-hidden /></Link></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
