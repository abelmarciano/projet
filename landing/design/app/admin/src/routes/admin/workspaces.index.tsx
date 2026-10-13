import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { listAdminWorkspaces, exportAdminWorkspaces } from "@/lib/admin/functions";
import { toast } from "sonner";
import { AlertTriangle, Check, Download, Loader2, Search } from "lucide-react";
import { AdminTopBar } from "@/components/admin/AdminTopBar";
import { ProviderPill } from "@/components/admin/ProviderPill";
import { SEGMENT, avatarColor, daysSince, fmtEur, initials, planLabel } from "@/components/admin/adminFormat";

type Segment = "active" | "at_risk" | "inactive" | "";
type SortBy = "created_at" | "last_activity" | "ads_month" | "name";
type SignupRange = "7d" | "30d" | "90d" | "all";

type ClientsSearch = { q?: string; segment?: Exclude<Segment, "">; plan?: string };

export const Route = createFileRoute("/admin/workspaces/")({
  head: () => ({ meta: [{ title: "Clients - Admin" }] }),
  // Recherche de la barre du haut (?q=) et lien « Voir les clients à risque » du Dashboard (?segment=).
  validateSearch: (s: Record<string, unknown>): ClientsSearch => ({
    q: typeof s.q === "string" && s.q.trim() ? s.q : undefined,
    segment: s.segment === "active" || s.segment === "at_risk" || s.segment === "inactive" ? s.segment : undefined,
    plan: typeof s.plan === "string" && s.plan ? s.plan : undefined,
  }),
  component: ClientsList,
});

const PAGE = 50;
const SIGNUP_LABEL: Record<SignupRange, string> = { all: "", "7d": "inscrits 7 j", "30d": "inscrits 30 j", "90d": "inscrits 90 j" };
/** Risques dont la conséquence est immédiate : en rouge. Les autres en orange. */
const RED_RISK = /expir|retard|échec/i;

function ClientsList() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const [q, setQ] = useState(search.q ?? "");
  const [debouncedQ, setDebouncedQ] = useState(search.q ?? "");
  const [plan, setPlan] = useState<string>(search.plan ?? "");
  const [segment, setSegment] = useState<Segment>(search.segment ?? "");
  const [signupRange, setSignupRange] = useState<SignupRange>("all");
  const [sortBy, setSortBy] = useState<SortBy>("last_activity");
  const [riskOnly, setRiskOnly] = useState(false);
  const [offset, setOffset] = useState(0);

  // La recherche de la barre du haut peut changer l'URL alors que la page est déjà ouverte.
  useEffect(() => { setQ(search.q ?? ""); setDebouncedQ(search.q ?? ""); setOffset(0); }, [search.q]);
  useEffect(() => { if (search.segment) { setSegment(search.segment); setOffset(0); } }, [search.segment]);
  useEffect(() => {
    const t = setTimeout(() => { setDebouncedQ(q); setOffset(0); }, 250);
    return () => clearTimeout(t);
  }, [q]);

  const fetchList = useServerFn(listAdminWorkspaces);
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["admin-workspaces", debouncedQ, plan, segment, signupRange, sortBy, offset],
    queryFn: () => fetchList({
      data: {
        q: debouncedQ.trim() || null, plan: plan || null,
        segment: (segment || null) as "active" | "at_risk" | "inactive" | null,
        signupRange, sortBy, sortDir: "desc",
        limit: PAGE, offset,
      },
    }),
    staleTime: 30_000,
  });

  const exportCsv = useServerFn(exportAdminWorkspaces);
  const [exporting, setExporting] = useState(false);
  const handleExport = async () => {
    setExporting(true);
    try {
      const { csv, count } = await exportCsv();
      const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = `clients-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`${count} clients exportés`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Export impossible");
    } finally {
      setExporting(false);
    }
  };

  // « Avec un risque » filtre la page affichée (les risques sont calculés côté serveur, ligne par ligne).
  const rows = (data?.rows ?? []).filter((r) => !riskOnly || r.risks.length > 0);
  const active = [
    debouncedQ.trim() && "recherche",
    plan && `plan ${planLabel(plan)}`,
    segment && SEGMENT[segment]?.label.toLowerCase(),
    SIGNUP_LABEL[signupRange],
    riskOnly && "avec un risque",
  ].filter(Boolean);
  const go = (id: string) => void navigate({ to: "/admin/workspaces/$id", params: { id } });

  return (
    <>
      <AdminTopBar
        title="Clients"
        subtitle={`${data?.total ?? 0} au total · ${active.length ? "filtres : " + active.join(", ") : "aucun filtre"}`}
        actions={
          <button type="button" className="ad-btn" onClick={handleExport} disabled={exporting}>
            {exporting ? <Loader2 className="ad-i ad-spin" aria-hidden /> : <Download className="ad-i" aria-hidden />}
            Export CSV
          </button>
        }
      />

      <div className="ad-page">
        <div className="ad-filters">
          <label className="ad-inp">
            <Search className="ad-i" aria-hidden />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Nom, e-mail, workspace…" aria-label="Rechercher un client" />
            {isFetching && <Loader2 className="ad-i ad-spin" aria-hidden />}
          </label>
          <select className="ad-sel" aria-label="Plan" value={plan} onChange={(e) => { setPlan(e.target.value); setOffset(0); }}>
            <option value="">Tous les plans</option>
            <option value="free">Free</option><option value="starter">Starter</option>
            <option value="pro">Pro</option><option value="business">Business</option>
          </select>
          <select className="ad-sel" aria-label="Segment" value={segment} onChange={(e) => { setSegment(e.target.value as Segment); setOffset(0); }}>
            <option value="">Tous segments</option>
            <option value="active">Actifs</option><option value="at_risk">À risque</option><option value="inactive">Inactifs</option>
          </select>
          <select className="ad-sel" aria-label="Date d'inscription" value={signupRange} onChange={(e) => { setSignupRange(e.target.value as SignupRange); setOffset(0); }}>
            <option value="all">Depuis toujours</option>
            <option value="7d">Inscrits 7 j</option><option value="30d">Inscrits 30 j</option><option value="90d">Inscrits 90 j</option>
          </select>
          <select className="ad-sel" aria-label="Trier par" value={sortBy} onChange={(e) => { setSortBy(e.target.value as SortBy); setOffset(0); }}>
            <option value="last_activity">Tri : dernière activité</option>
            <option value="created_at">Tri : inscription</option>
            <option value="ads_month">Tri : créations 30 j</option>
            <option value="name">Tri : nom</option>
          </select>
          <button type="button" className="ad-chipf" aria-pressed={riskOnly} onClick={() => setRiskOnly((v) => !v)}>
            <AlertTriangle className="ad-i" aria-hidden />Avec un risque
          </button>
        </div>

        <section className="ad-card">
          {isLoading || !data ? (
            <div className="ad-loading"><Loader2 className="ad-i ad-spin" aria-label="Chargement" /></div>
          ) : rows.length === 0 ? (
            <div className="ad-empty"><b>Aucun client</b>Ajuste tes filtres pour élargir la recherche.</div>
          ) : (
            <div className="ad-tw">
              <table className="ad-table">
                <thead>
                  <tr>
                    <th>Client</th><th>Segment</th><th>Plan</th><th>Créations 30 j</th><th>MRR</th>
                    <th>Dernière activité</th><th>Risques</th><th>Connexion</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => {
                    const seg = SEGMENT[r.segment];
                    const d = daysSince(r.lastActivity);
                    const ageCls = d == null ? "" : d <= 7 ? "ad-age-ok" : d <= 30 ? "ad-age-warn" : "ad-age-bad";
                    const total = r.ads.ok + r.ads.failed + r.ads.pending;
                    return (
                      <tr
                        key={r.id}
                        className="ad-click"
                        tabIndex={0}
                        onClick={() => go(r.id)}
                        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(r.id); } }}
                        aria-label={`Ouvrir la fiche de ${r.name}`}
                      >
                        <td>
                          <div className="ad-whom">
                            <span className="ad-av" style={{ background: avatarColor(r.id) }}>
                              {r.logoUrl ? <img src={r.logoUrl} alt="" /> : initials(r.name)}
                            </span>
                            <span style={{ minWidth: 0 }}>
                              <b>{r.name}</b>
                              <small>{[r.ownerDisplayName, r.ownerEmail].filter(Boolean).join(" · ") || "-"}</small>
                            </span>
                          </div>
                        </td>
                        <td>{seg ? <span className={`ad-pill ${seg.tone === "neutral" ? "" : seg.tone}`}>{seg.label}</span> : <span className="ad-muted">-</span>}</td>
                        <td><span className="ad-pill out">{planLabel(r.plan)}</span></td>
                        <td>
                          <span className="ad-cr">
                            {total === 0 ? <span className="z">0</span> : (
                              <>
                                <span className="o" title="Réussies"><Check aria-hidden />{r.ads.ok}</span>
                                {r.ads.failed > 0 && <span className="f" title="Échouées">{r.ads.failed}</span>}
                                {r.ads.pending > 0 && <span className="p" title="En attente">{r.ads.pending}</span>}
                              </>
                            )}
                          </span>
                        </td>
                        <td className="ad-num">
                          {r.mrrCents > 0 ? fmtEur(r.mrrCents) : <span className="ad-muted">-</span>}
                          {r.paymentStatus === "past_due" && <> <span className="ad-pill bad">retard</span></>}
                        </td>
                        <td className={ageCls}>{d == null ? "jamais" : d === 0 ? "aujourd'hui" : `il y a ${d} j`}</td>
                        <td>
                          <div className="ad-risks">
                            {r.risks.length === 0 ? <span className="ad-muted">-</span> : r.risks.map((rk) => (
                              <span key={rk} className={`ad-pill ${RED_RISK.test(rk) ? "bad" : "warn"}`}>{rk}</span>
                            ))}
                          </div>
                        </td>
                        <td><ProviderPill provider={r.ownerProvider} /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          {data && data.total > 0 && (
            <div className="ad-pager">
              <span>{data.total} résultat{data.total > 1 ? "s" : ""}{data.total > PAGE ? ` · ${offset + 1} à ${Math.min(offset + PAGE, data.total)}` : ""}</span>
              <div className="ad-r">
                <button type="button" className="ad-btn sm" disabled={offset === 0} onClick={() => setOffset(Math.max(0, offset - PAGE))}>Précédent</button>
                <button type="button" className="ad-btn sm" disabled={offset + PAGE >= data.total} onClick={() => setOffset(offset + PAGE)}>Suivant</button>
              </div>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
