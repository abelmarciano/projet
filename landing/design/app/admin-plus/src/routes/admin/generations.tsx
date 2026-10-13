import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AlertTriangle, Clock, Loader2, RotateCcw, Search } from "lucide-react";
import { AdminTopBar } from "@/components/admin/AdminTopBar";
import { fmtDateTime, fmtInt, timeAgo } from "@/components/admin/adminFormat";
import { SOURCE_LABEL } from "@/components/admin/insightsLabels";
import { useAdminConfirm } from "@/components/admin/useAdminConfirm";
import { listAdminGenerations, adminRetryGeneration } from "@/lib/admin/insights.functions";
import type { AdminGenerationRow, AdminGenerationsInput, GenSource, GenStatus } from "@/lib/admin/insights.types";

type GenSearch = { status?: GenStatus };

export const Route = createFileRoute("/admin/generations")({
  head: () => ({ meta: [{ title: "Générations - Admin" }] }),
  validateSearch: (s: Record<string, unknown>): GenSearch => ({
    status: s.status === "failed" || s.status === "pending" || s.status === "completed" ? s.status : undefined,
  }),
  component: GenerationsPage,
});

const PAGE = 50;
const STATUS_PILL: Record<GenStatus, { label: string; tone: string }> = {
  failed: { label: "Échouée", tone: "bad" },
  pending: { label: "En attente", tone: "warn" },
  completed: { label: "Réussie", tone: "ok" },
};

function GenerationsPage() {
  const search = Route.useSearch();
  const qc = useQueryClient();
  const { confirm, confirmDialog } = useAdminConfirm();
  const [status, setStatus] = useState<AdminGenerationsInput["status"]>(search.status ?? "failed");
  const [source, setSource] = useState<AdminGenerationsInput["source"]>("all");
  const [days, setDays] = useState<AdminGenerationsInput["days"]>(7);
  const [q, setQ] = useState("");
  const [dq, setDq] = useState("");
  const [offset, setOffset] = useState(0);
  const [retrying, setRetrying] = useState<string | null>(null);

  useEffect(() => { if (search.status) { setStatus(search.status); setOffset(0); } }, [search.status]);
  useEffect(() => { const t = setTimeout(() => { setDq(q); setOffset(0); }, 250); return () => clearTimeout(t); }, [q]);

  const fetchGens = useServerFn(listAdminGenerations);
  const retry = useServerFn(adminRetryGeneration);
  const input: AdminGenerationsInput = { status, source, days, q: dq.trim() || null, limit: PAGE, offset };
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["admin-generations", input],
    queryFn: () => fetchGens({ data: input }),
    staleTime: 30_000,
    refetchInterval: 60_000,
  });

  const onRetry = async (r: AdminGenerationRow) => {
    const ok = await confirm({
      title: "Relancer cette génération ?",
      description: "Elle repart avec les mêmes paramètres. Le client n'est pas débité une deuxième fois (ses crédits ont été remboursés à l'échec). L'action est enregistrée dans le journal d'audit.",
      confirmLabel: "Relancer",
    });
    if (!ok) return;
    setRetrying(r.id);
    try {
      await retry({ data: { source: r.source, id: r.id } });
      toast.success("Génération relancée");
      await qc.invalidateQueries({ queryKey: ["admin-generations"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Relance impossible");
    } finally {
      setRetrying(null);
    }
  };

  const s = data?.summary;
  const errMax = Math.max(1, ...(s?.topErrors ?? []).map((e) => e.count));

  return (
    <>
      <AdminTopBar title="Générations" subtitle="Les générations échouées ou bloquées, avec leur erreur, pour aider un client ou repérer un fournisseur en panne" />
      <div className="ad-page">
        {s && (
          <div className="ad-strip">
            <div className={s.failed24h > 0 ? "warn" : "ok"}><span className="ad-si"><AlertTriangle className="ad-i" aria-hidden /></span><span><b className="ad-num">{fmtInt(s.failed24h)}</b><small>Échecs · 24 h</small></span></div>
            <div><span className="ad-si"><AlertTriangle className="ad-i" aria-hidden /></span><span><b className="ad-num">{fmtInt(s.failed7d)}</b><small>Échecs · 7 j</small></span></div>
            <div className="pri"><span className="ad-si"><Clock className="ad-i" aria-hidden /></span><span><b className="ad-num">{fmtInt(s.pendingNow)}</b><small>En cours maintenant</small></span></div>
            <div className={s.stuck > 0 ? "warn" : "ok"}><span className="ad-si"><Clock className="ad-i" aria-hidden /></span><span><b className="ad-num">{fmtInt(s.stuck)}</b><small>Bloquées depuis plus d'1 h</small></span></div>
          </div>
        )}

        {s && (s.topErrors.length > 0 || s.byModel.length > 0) && (
          <div className="ad-g2e">
            <section className="ad-card">
              <div className="ad-ch"><div><h2>Erreurs les plus fréquentes</h2><small>Sur la période choisie</small></div></div>
              <div className="ad-cb ad-rank">
                {s.topErrors.length === 0 && <div className="ad-empty">Aucune erreur.</div>}
                {s.topErrors.map((e, i) => (
                  <div key={i} className="ad-rk" style={{ gridTemplateColumns: "22px minmax(0,1fr) 90px 34px" }}>
                    <span className="ad-n">{String(i + 1).padStart(2, "0")}</span>
                    <span className="ad-nm" title={e.message} style={{ whiteSpace: "normal" }}>{e.message}</span>
                    <span className="ad-bar"><i style={{ width: `${(e.count / errMax) * 100}%`, background: "var(--ad-c-bad)" }} /></span>
                    <strong className="ad-num">{e.count}</strong>
                  </div>
                ))}
              </div>
            </section>
            <section className="ad-card">
              <div className="ad-ch"><div><h2>Taux d'échec par modèle</h2><small>Sur la période choisie</small></div></div>
              <div className="ad-tw">
                <table className="ad-table">
                  <thead><tr><th>Modèle</th><th className="ad-num">Générations</th><th className="ad-num">Échecs</th><th className="ad-num">Taux</th></tr></thead>
                  <tbody>
                    {s.byModel.map((m) => {
                      const rate = m.total ? m.failed / m.total : 0;
                      return (
                        <tr key={m.model}>
                          <td className="ad-mono">{m.model}</td>
                          <td className="ad-num">{fmtInt(m.total)}</td>
                          <td className="ad-num">{fmtInt(m.failed)}</td>
                          <td className="ad-num"><span className={`ad-pill ${rate > 0.2 ? "bad" : rate > 0.05 ? "warn" : "ok"}`}>{Math.round(rate * 100)} %</span></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}

        <div className="ad-filters">
          <label className="ad-inp">
            <Search className="ad-i" aria-hidden />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Client, titre, message d'erreur…" aria-label="Rechercher une génération" />
            {isFetching && <Loader2 className="ad-i ad-spin" aria-hidden />}
          </label>
          <select className="ad-sel" aria-label="Statut" value={status} onChange={(e) => { setStatus(e.target.value as AdminGenerationsInput["status"]); setOffset(0); }}>
            <option value="failed">Échouées</option><option value="pending">En attente</option><option value="completed">Réussies</option><option value="all">Tous les statuts</option>
          </select>
          <select className="ad-sel" aria-label="Type" value={source} onChange={(e) => { setSource(e.target.value as GenSource | "all"); setOffset(0); }}>
            <option value="all">Tous les types</option>
            {(Object.keys(SOURCE_LABEL) as GenSource[]).map((k) => <option key={k} value={k}>{SOURCE_LABEL[k]}</option>)}
          </select>
          <select className="ad-sel" aria-label="Période" value={days} onChange={(e) => { setDays(Number(e.target.value) as AdminGenerationsInput["days"]); setOffset(0); }}>
            <option value={1}>24 heures</option><option value={7}>7 jours</option><option value={30}>30 jours</option>
          </select>
        </div>

        <section className="ad-card">
          {isLoading || !data ? (
            <div className="ad-loading"><Loader2 className="ad-i ad-spin" aria-label="Chargement" /></div>
          ) : data.rows.length === 0 ? (
            <div className="ad-empty"><b>Rien à signaler</b>{status === "failed" ? "Aucune génération échouée sur cette période." : "Aucune génération ne correspond à ces filtres."}</div>
          ) : (
            <div className="ad-tw">
              <table className="ad-table">
                <thead><tr><th>Quand</th><th>Client</th><th>Génération</th><th>Statut</th><th>Erreur</th><th>Modèle</th><th /></tr></thead>
                <tbody>
                  {data.rows.map((r) => {
                    const st = STATUS_PILL[r.status];
                    return (
                      <tr key={`${r.source}-${r.id}`}>
                        <td title={fmtDateTime(r.createdAt)}>{timeAgo(r.createdAt)}</td>
                        <td>
                          {r.workspaceId ? (
                            <Link to="/admin/workspaces/$id" params={{ id: r.workspaceId }} style={{ color: "inherit", fontWeight: 600, textDecoration: "none" }}>{r.workspaceName ?? "Client"}</Link>
                          ) : <span className="ad-muted">-</span>}
                        </td>
                        <td>
                          <div style={{ display: "flex", flexDirection: "column" }}>
                            <span style={{ maxWidth: 240, overflow: "hidden", textOverflow: "ellipsis" }}>{r.title ?? "Sans titre"}</span>
                            <small className="ad-muted">{SOURCE_LABEL[r.source] ?? r.source} · {r.contentType === "video" ? "vidéo" : r.contentType === "image" ? "image" : r.contentType === "audio" ? "audio" : "autre"}</small>
                          </div>
                        </td>
                        <td><span className={`ad-pill ${st.tone}`}>{st.label}</span></td>
                        <td style={{ whiteSpace: "normal", minWidth: 220, maxWidth: 360, fontSize: 12.5 }}>{r.error ?? <span className="ad-muted">-</span>}</td>
                        <td className="ad-mono">{r.model ?? <span className="ad-muted">-</span>}</td>
                        <td>
                          {r.retryable && r.status === "failed" ? (
                            <button type="button" className="ad-btn sm" onClick={() => onRetry(r)} disabled={retrying === r.id}>
                              {retrying === r.id ? <Loader2 className="ad-i ad-spin" aria-hidden /> : <RotateCcw className="ad-i" aria-hidden />}Relancer
                            </button>
                          ) : null}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          {data && data.total > 0 && (
            <div className="ad-pager">
              <span>{fmtInt(data.total)} génération{data.total > 1 ? "s" : ""}</span>
              <div className="ad-r">
                <button type="button" className="ad-btn sm" disabled={offset === 0} onClick={() => setOffset(Math.max(0, offset - PAGE))}>Précédent</button>
                <button type="button" className="ad-btn sm" disabled={offset + PAGE >= data.total} onClick={() => setOffset(offset + PAGE)}>Suivant</button>
              </div>
            </div>
          )}
        </section>
      </div>
      {confirmDialog}
    </>
  );
}
