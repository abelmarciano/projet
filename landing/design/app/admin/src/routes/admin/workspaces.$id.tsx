import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  getAdminWorkspaceDetail, getAdminWorkspaceStats, searchAdminConversations,
  addWorkspaceNote, deleteWorkspaceNote, addWorkspaceTag, removeWorkspaceTag,
  startImpersonation, listAdminAds, getAdminAccessStatus,
} from "@/lib/admin/functions";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertTriangle, ArrowLeft, Check, ChevronRight, Clock, Eye, Globe, Loader2, Mail, MessageSquare, Plus,
  ScrollText, Search, ShieldCheck, Trash2, User, X,
} from "lucide-react";
import { toast } from "sonner";
import { AdminTopBar } from "@/components/admin/AdminTopBar";
import { ClientQuickActions } from "@/components/admin/ClientQuickActions";
import { ClientTimeline } from "@/components/admin/ClientTimeline";
import { ProviderPill } from "@/components/admin/ProviderPill";
import { AdminLineChart, AdminStatusBars, StatusLegend } from "@/components/admin/charts/AdminCharts";
import { AUDIT_LABEL, avatarColor, fmtDate, fmtDateTime, fmtEur, initials, planLabel } from "@/components/admin/adminFormat";

export const Route = createFileRoute("/admin/workspaces/$id")({
  head: () => ({ meta: [{ title: "Fiche client - Admin" }] }),
  component: WorkspaceDetail,
});

type TabKey = "overview" | "stats" | "creations" | "conversations" | "billing" | "timeline" | "support" | "audit";
const TABS: { key: TabKey; label: string }[] = [
  { key: "overview", label: "Vue d'ensemble" },
  { key: "stats", label: "Statistiques" },
  { key: "creations", label: "Créations" },
  { key: "conversations", label: "Conversations" },
  { key: "billing", label: "Facturation" },
  { key: "timeline", label: "Timeline" },
  { key: "support", label: "Support" },
  { key: "audit", label: "Audit" },
];

const META_STATUS: Record<string, { title: string; sub: string; tone: "ok" | "warn" | "bad" | ""; pill: string }> = {
  connected: { title: "Connecté", sub: "Compte publicitaire relié", tone: "ok", pill: "OK" },
  expiring_soon: { title: "Jeton bientôt expiré", sub: "Le client devra se reconnecter", tone: "warn", pill: "À suivre" },
  expired: { title: "Jeton expiré", sub: "Le client doit se reconnecter", tone: "bad", pill: "Expiré" },
  none: { title: "Non connecté", sub: "Aucun compte publicitaire relié", tone: "", pill: "-" },
};

function adStatus(s: string | null | undefined): { label: string; tone: "ok" | "warn" | "bad" } {
  const v = (s ?? "").toLowerCase();
  if (v === "completed" || v === "done" || v === "ready") return { label: "Réussie", tone: "ok" };
  if (v === "failed" || v === "error") return { label: "Échouée", tone: "bad" };
  return { label: "En attente", tone: "warn" };
}

function paymentLabel(s: string | null | undefined): { label: string; tone: "ok" | "bad" | "" } {
  if (s === "paid") return { label: "À jour", tone: "ok" };
  if (s === "past_due") return { label: "En retard", tone: "bad" };
  if (!s) return { label: "Gratuit", tone: "" };
  return { label: s, tone: "" };
}

function WorkspaceDetail() {
  const { id } = Route.useParams();
  const router = useRouter();
  const qc = useQueryClient();
  const fetchAccess = useServerFn(getAdminAccessStatus);
  const { data: session } = useQuery({ queryKey: ["admin-session"], queryFn: () => fetchAccess(), staleTime: 30_000, retry: false });
  const fetchDetail = useServerFn(getAdminWorkspaceDetail);
  const fetchStats = useServerFn(getAdminWorkspaceStats);
  const fetchAds = useServerFn(listAdminAds);
  const searchConv = useServerFn(searchAdminConversations);
  const addNote = useServerFn(addWorkspaceNote);
  const delNote = useServerFn(deleteWorkspaceNote);
  const addTag = useServerFn(addWorkspaceTag);
  const rmTag = useServerFn(removeWorkspaceTag);
  const startImp = useServerFn(startImpersonation);

  const [tab, setTab] = useState<TabKey>("overview");
  const { data, isLoading } = useQuery({
    queryKey: ["admin-ws", id],
    queryFn: () => fetchDetail({ data: { workspaceId: id } }),
    staleTime: 30_000,
  });
  const { data: stats } = useQuery({
    queryKey: ["admin-ws-stats", id],
    queryFn: () => fetchStats({ data: { workspaceId: id } }),
    enabled: tab === "stats",
    staleTime: 30_000,
  });
  const { data: adsData, isLoading: adsLoading } = useQuery({
    queryKey: ["admin-ws-ads", id],
    queryFn: () => fetchAds({ data: { workspaceId: id, limit: 30 } }),
    enabled: tab === "creations",
    staleTime: 30_000,
  });

  const [noteBody, setNoteBody] = useState("");
  const [noteBusy, setNoteBusy] = useState(false);
  const [noteConfirm, setNoteConfirm] = useState<string | null>(null);
  const [tagLabel, setTagLabel] = useState("");
  const [tagConfirm, setTagConfirm] = useState<string | null>(null);
  const [impOpen, setImpOpen] = useState(false);
  const [impBusy, setImpBusy] = useState(false);
  const [convQ, setConvQ] = useState("");
  const { data: searchResults, isFetching: searching } = useQuery({
    enabled: convQ.trim().length >= 2,
    queryKey: ["admin-conv-search", id, convQ],
    queryFn: () => searchConv({ data: { workspaceId: id, q: convQ.trim() } }),
    staleTime: 15_000,
  });

  if (isLoading || !data) {
    return (
      <>
        <AdminTopBar title="Fiche client" hideHeading crumbs={[{ label: "Clients", to: "/admin/workspaces" }, { label: "Fiche client" }]} />
        <div className="ad-loading"><Loader2 className="ad-i ad-spin" aria-label="Chargement" /></div>
      </>
    );
  }

  const w = data.workspace as typeof data.workspace & { ownerProvider?: string | null; ownerDisplayName?: string | null };
  const isSuper = !!session?.isSuper;
  const refresh = () => qc.invalidateQueries({ queryKey: ["admin-ws", id] });
  const meta = META_STATUS[data.meta.status] ?? META_STATUS.none;
  const website = (w.companyWebsite as string | null) ?? null;
  const companyName = (w.companyName as string | null) ?? null;
  const plan = (w.plan as string | null) ?? null;

  async function handleImpersonate() {
    setImpBusy(true);
    try {
      const res = await startImp({ data: { workspaceId: id } });
      toast.success(`Impersonation démarrée sur « ${res.workspace?.name ?? w.name} »`);
      await qc.invalidateQueries({ queryKey: ["impersonation-status"] });
      router.navigate({ to: "/create" });
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setImpBusy(false);
    }
  }
  async function handleAddNote() {
    if (!noteBody.trim()) return;
    setNoteBusy(true);
    try {
      await addNote({ data: { workspaceId: id, body: noteBody.trim() } });
      setNoteBody("");
      await refresh();
      toast.success("Note ajoutée");
    } catch (e) { toast.error((e as Error).message); } finally { setNoteBusy(false); }
  }
  async function handleDeleteNote(noteId: string) {
    try {
      await delNote({ data: { noteId } });
      setNoteConfirm(null);
      await refresh();
      toast.success("Note supprimée");
    } catch (e) { toast.error((e as Error).message); }
  }
  async function handleAddTag() {
    if (!tagLabel.trim()) return;
    try {
      await addTag({ data: { workspaceId: id, label: tagLabel.trim() } });
      setTagLabel("");
      await refresh();
      toast.success("Tag ajouté");
    } catch (e) { toast.error((e as Error).message); }
  }
  async function handleRemoveTag(tagId: string) {
    try {
      await rmTag({ data: { tagId } });
      setTagConfirm(null);
      await refresh();
      toast.success("Tag retiré");
    } catch (e) { toast.error((e as Error).message); }
  }

  const convList = convQ.trim().length >= 2 && searchResults
    ? searchResults.results.map((r) => ({ id: r.id, title: r.title, updated_at: r.updatedAt, snippet: r.snippet as string | null }))
    : data.conversations.map((c) => ({ id: c.id, title: c.title, updated_at: c.updated_at as string, snippet: null as string | null }));

  const profile = (data as { ownerProfile?: Record<string, string | null> | null }).ownerProfile ?? null;
  const profileRows: Array<[string, string]> = profile ? ([
    ["Nous a connus via", profile.signupSource ? `${profile.signupSource}${profile.signupSourceDetail ? ` · ${profile.signupSourceDetail}` : ""}` : null],
    ["Activité", profile.companyType],
    ["Taille d'équipe", profile.teamSize],
    ["Budget pub / mois", profile.adBudgetRange],
    ["Objectif principal", profile.mainGoal],
    ["Téléphone", profile.phone],
  ].filter(([, v]) => !!v) as Array<[string, string]>) : [];

  const counts: Partial<Record<TabKey, number>> = {
    conversations: data.conversations.length,
    support: data.notes.length,
  };

  return (
    <>
      <AdminTopBar
        title={w.name}
        hideHeading
        crumbs={[{ label: "Clients", to: "/admin/workspaces" }, { label: w.name }]}
      />
      <div className="ad-page">
        <Link to="/admin/workspaces" className="ad-backl"><ArrowLeft className="ad-i" aria-hidden />Retour aux clients</Link>

        <section className="ad-card">
          <div className="ad-clhead">
            <span className="ad-cllogo" style={{ background: avatarColor(id) }}>
              {w.logoUrl ? <img src={w.logoUrl as string} alt="" /> : initials(w.name)}
            </span>
            <div className="ad-clid">
              <h2>{w.name} <span className="ad-pill pri">{planLabel(plan)}</span></h2>
              <div className="ad-meta">
                {w.ownerDisplayName && <span><User className="ad-i" aria-hidden />{w.ownerDisplayName}</span>}
                {w.ownerEmail && <a href={`mailto:${w.ownerEmail}`}><Mail className="ad-i" aria-hidden />{w.ownerEmail}</a>}
                {companyName && companyName !== w.name && <span>{companyName}</span>}
                <span><Clock className="ad-i" aria-hidden />Client depuis le {fmtDate(w.createdAt as string, { day: "numeric", month: "long", year: "numeric" })}</span>
                {website && (
                  <a href={website} target="_blank" rel="noreferrer"><Globe className="ad-i" aria-hidden />{website.replace(/^https?:\/\//, "").replace(/\/$/, "")}</a>
                )}
                <ProviderPill provider={w.ownerProvider} />
              </div>
              <div className="ad-tags">
                {data.tags.map((t) => tagConfirm === t.id ? (
                  <span key={t.id} className="ad-tag confirm" role="group" aria-label={`Retirer le tag ${t.label}`}>
                    Retirer « {t.label} » ?
                    <button type="button" className="yes" onClick={() => handleRemoveTag(t.id)}>Retirer</button>
                    <button type="button" onClick={() => setTagConfirm(null)}>Annuler</button>
                  </span>
                ) : (
                  <span key={t.id} className="ad-tag">
                    {t.label}
                    <button type="button" aria-label={`Retirer le tag ${t.label}`} onClick={() => setTagConfirm(t.id)}><X aria-hidden /></button>
                  </span>
                ))}
                <form className="ad-addtag" onSubmit={(e) => { e.preventDefault(); void handleAddTag(); }}>
                  <input value={tagLabel} onChange={(e) => setTagLabel(e.target.value)} placeholder="+ tag" aria-label="Ajouter un tag" maxLength={40} />
                  <button type="submit" aria-label="Ajouter le tag" disabled={!tagLabel.trim()}><Plus aria-hidden /></button>
                </form>
              </div>
            </div>
            <div className="ad-clacts">
              <button type="button" className="ad-btn" onClick={() => setImpOpen(true)}><Eye className="ad-i" aria-hidden />Voir comme le client</button>
              <ClientQuickActions workspaceId={id} workspaceName={w.name} isSuper={isSuper} currentPlan={plan} membersCount={data.members.length} />
            </div>
          </div>
          <div className="ad-qk">
            <div><small>Créations · 30 j</small><b className="ad-num">{data.stats.total}</b></div>
            <div><small>Réussies</small><b className="ad-num">{data.stats.ok}</b></div>
            <div><small>Membres</small><b className="ad-num">{data.members.length}</b></div>
            <div><small>Marques</small><b className="ad-num">{data.brands.length}</b></div>
          </div>
        </section>

        <div className="ad-clgrid">
          <section className="ad-card">
            <div className="ad-tabs" role="tablist" aria-label="Sections de la fiche">
              {TABS.map((t) => (
                <button key={t.key} type="button" role="tab" id={`tab-${t.key}`} aria-controls={`panel-${t.key}`} aria-selected={tab === t.key} onClick={() => setTab(t.key)}>
                  {t.label}{counts[t.key] ? <em>{counts[t.key]}</em> : null}
                </button>
              ))}
            </div>
            <div className="ad-cb" style={{ paddingTop: 18 }} role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>

              {tab === "overview" && (
                <div className="ad-g2e">
                  <div>
                    <h3 className="ad-h3">Marques ({data.brands.length})</h3>
                    <ul className="ad-list">
                      {data.brands.map((b) => (
                        <li key={b.id as string} className="ad-li">
                          <span className="ad-av" style={{ background: avatarColor(b.id as string) }}>
                            {b.logo_url ? <img src={b.logo_url as string} alt="" /> : initials(b.name as string)}
                          </span>
                          <span className="ad-grow"><b>{b.name as string}</b><small>{(b.website as string | null) ?? "pas de site"}</small></span>
                          {b.is_default ? <span className="ad-pill pri">par défaut</span> : null}
                        </li>
                      ))}
                      {data.brands.length === 0 && <li className="ad-li ad-muted">Aucune marque.</li>}
                    </ul>
                  </div>
                  <div>
                    <h3 className="ad-h3">Membres ({data.members.length})</h3>
                    <ul className="ad-list">
                      {data.members.map((m) => (
                        <li key={m.userId} className="ad-li">
                          <span className="ad-av round" style={{ background: "#4C5566" }}>{initials((m.email ?? m.userId).split("@")[0].replace(/[._-]+/g, " "))}</span>
                          <span className="ad-grow"><b>{m.email ?? m.userId.slice(0, 8)}</b></span>
                          <span className={`ad-pill ${m.role === "owner" ? "pri" : "out"}`}>{m.role === "owner" ? "Propriétaire" : m.role === "admin" ? "Admin" : m.role === "member" ? "Membre" : m.role}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {tab === "stats" && (!stats ? (
                <div className="ad-loading"><Loader2 className="ad-i ad-spin" aria-label="Chargement" /></div>
              ) : (
                <>
                  <div className="ad-gauto">
                    <div className="ad-card ad-kpi"><span className="ad-lb">Taux de complétion</span><span className="ad-v ad-num">{Math.round(stats.completion.rate * 100)} %</span><span className="ad-s">{stats.completion.completed} sur {stats.completion.started} briefs</span></div>
                    <div className="ad-card ad-kpi"><span className="ad-lb">Messages / brief</span><span className="ad-v ad-num">{stats.completion.avgMessages.toFixed(1).replace(".", ",")}</span><span className="ad-s">par pub finalisée</span></div>
                    <div className="ad-card ad-kpi"><span className="ad-lb">Temps moyen</span><span className="ad-v ad-num">{stats.completion.avgDurationMin} min</span><span className="ad-s">durée d'un brief</span></div>
                    <div className={`ad-card ad-kpi${stats.engagement.score < 30 ? " bad" : stats.engagement.score < 60 ? " warn" : ""}`}>
                      <span className="ad-lb">Score engagement</span><span className="ad-v ad-num">{stats.engagement.score}/100</span>
                      <span className="ad-s"><span className={`ad-pill ${stats.engagement.score >= 60 ? "ok" : stats.engagement.score >= 30 ? "warn" : "bad"}`}>{stats.engagement.score >= 60 ? "Bon" : stats.engagement.score >= 30 ? "Moyen" : "Faible"}</span></span>
                    </div>
                  </div>
                  <div style={{ marginTop: 20, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                    <h3 className="ad-h3" style={{ margin: 0 }}>Créations sur 30 jours</h3>
                    <div style={{ marginLeft: "auto" }}><StatusLegend /></div>
                  </div>
                  <div style={{ marginTop: 8 }}>
                    <AdminStatusBars height={190} label="Créations de ce client par jour sur 30 jours" data={stats.dailySeries.map((s) => ({ date: s.date, ok: s.ok, pending: s.pending, failed: s.failed }))} />
                  </div>
                  {stats.mrrSeries.length > 0 && (
                    <>
                      <h3 className="ad-h3" style={{ marginTop: 20 }}>MRR de ce client</h3>
                      <AdminLineChart
                        height={170}
                        label="MRR de ce client par mois"
                        tipTitle="MRR"
                        format={fmtEur}
                        data={stats.mrrSeries.map((s) => {
                          const d = new Date(s.month + "-01");
                          return { label: d.toLocaleDateString("fr-FR", { month: "short" }), title: d.toLocaleDateString("fr-FR", { month: "long", year: "numeric" }), value: s.amountCents };
                        })}
                      />
                    </>
                  )}
                  <div className="ad-g2e" style={{ marginTop: 20 }}>
                    <div>
                      <h3 className="ad-h3">Acteurs UGC les plus utilisés</h3>
                      {stats.topActors.length === 0 ? <p className="ad-muted" style={{ fontSize: 13 }}>Aucun acteur utilisé.</p> : (
                        <div className="ad-rank">
                          {stats.topActors.map((a, i) => (
                            <div key={a.id} className="ad-rk">
                              <span className="ad-n">{String(i + 1).padStart(2, "0")}</span>
                              <span className="ad-nm">{a.imageUrl ? <img src={a.imageUrl} alt="" /> : null}{a.name}</span>
                              <span className="ad-bar"><i style={{ width: `${(a.count / (stats.topActors[0]?.count || 1)) * 100}%` }} /></span>
                              <strong className="ad-num">{a.count}</strong>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="ad-h3">Fonctionnalités adoptées</h3>
                      <div className="ad-feat">
                        {([
                          ["Marques", stats.engagement.brandsCount],
                          ["Logo marque", stats.engagement.brandsWithLogo],
                          ["Site web", stats.engagement.brandsWithWebsite],
                          ["Dossiers", stats.engagement.foldersCount],
                          ["Profil entreprise", stats.engagement.hasCompanyProfile ? 1 : 0],
                        ] as const).map(([label, n]) => (
                          <span key={label} className={`ad-pill ${n > 0 ? "ok" : "out"}`}>
                            {n > 0 ? <Check aria-hidden /> : null}{label}{n > 1 ? ` · ${n}` : ""}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              ))}

              {tab === "creations" && (adsLoading ? (
                <div className="ad-loading"><Loader2 className="ad-i ad-spin" aria-label="Chargement" /></div>
              ) : (adsData?.ads ?? []).length === 0 ? (
                <div className="ad-empty"><b>Aucune création</b>Ce client n'a encore rien généré.</div>
              ) : (
                <div className="ad-thumbs">
                  {(adsData?.ads ?? []).map((a) => {
                    const st = adStatus(a.status as string);
                    return (
                      <div key={a.id} className="ad-th">
                        <div className="ad-im">
                          <span className={`ad-pill ${st.tone}`}>{st.label}</span>
                          {a.generated_url ? (
                            a.content_type === "video"
                              ? <video src={a.generated_url as string} muted loop playsInline preload="metadata" onMouseEnter={(e) => void e.currentTarget.play().catch(() => {})} onMouseLeave={(e) => e.currentTarget.pause()} />
                              : <img src={a.generated_url as string} alt="" loading="lazy" />
                          ) : st.tone === "warn" ? <Loader2 className="ad-i ad-spin" aria-hidden /> : null}
                        </div>
                        <p>{(a.title as string | null) ?? "Sans titre"}<small>{a.content_type === "video" ? "Vidéo" : "Image"} · {fmtDate(a.created_at as string, { day: "numeric", month: "short" })}</small></p>
                      </div>
                    );
                  })}
                </div>
              ))}

              {tab === "conversations" && (
                <>
                  <label className="ad-inp" style={{ marginBottom: 6 }}>
                    <Search className="ad-i" aria-hidden />
                    <input value={convQ} onChange={(e) => setConvQ(e.target.value)} placeholder="Rechercher dans le contenu des conversations…" aria-label="Rechercher dans les conversations" />
                    {searching && <Loader2 className="ad-i ad-spin" aria-hidden />}
                  </label>
                  {convList.length === 0 ? (
                    <div className="ad-empty"><b>Aucune conversation</b>{convQ.trim().length >= 2 ? "Aucun message ne contient ce texte." : "Ce client n'a pas encore discuté avec le Chat."}</div>
                  ) : (
                    <div className="ad-list">
                      {convList.slice(0, 100).map((c) => (
                        <Link key={c.id} to="/admin/workspaces/$id/conversations/$convId" params={{ id, convId: c.id }} className="ad-li">
                          <span className="ad-lic"><MessageSquare className="ad-i" aria-hidden /></span>
                          <span className="ad-grow">
                            <b>{c.title ?? "Sans titre"}</b>
                            {c.snippet ? <small className="ad-snip">…{c.snippet}…</small> : <small>Dernière activité le {fmtDate(c.updated_at)}</small>}
                          </span>
                          <ChevronRight className="ad-i ad-muted" aria-hidden />
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              )}

              {tab === "billing" && (() => {
                const cur = data.billing.current;
                const pay = paymentLabel(cur?.payment_status as string | null | undefined);
                return (
                  <>
                    <div className="ad-gauto">
                      <div className="ad-card ad-kpi"><span className="ad-lb">MRR actuel</span><span className="ad-v ad-num">{cur ? fmtEur((cur.mrr_amount_cents as number) ?? 0) : "-"}</span><span className="ad-s">{data.billing.isMock ? "données démo" : "réel"}</span></div>
                      <div className={`ad-card ad-kpi${pay.tone === "bad" ? " bad" : ""}`}><span className="ad-lb">Statut du paiement</span><span className="ad-v">{pay.label}</span></div>
                      <div className="ad-card ad-kpi"><span className="ad-lb">Dernier paiement</span><span className="ad-v ad-num">{cur?.last_payment_at ? fmtDate(cur.last_payment_at as string, { day: "numeric", month: "short" }) : "-"}</span></div>
                    </div>
                    <h3 className="ad-h3" style={{ marginTop: 20 }}>Changements de plan</h3>
                    {data.planHistory.length === 0 ? <p className="ad-muted" style={{ fontSize: 13 }}>Aucun changement.</p> : (
                      <ul className="ad-list">
                        {data.planHistory.map((h) => (
                          <li key={h.id as string} className="ad-li">
                            <span className="ad-grow"><b>{planLabel(h.plan_from as string | null)} → {planLabel(h.plan_to as string)}</b><small>{(h.reason as string | null) ?? "Changement de plan"}</small></span>
                            <small>{fmtDateTime(h.changed_at as string)}</small>
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                );
              })()}

              {tab === "timeline" && <ClientTimeline workspaceId={id} />}

              {tab === "support" && (
                <>
                  <div className="ad-fld">
                    <label htmlFor="ad-note">Notes internes</label>
                    <span className="ad-hint">Visibles uniquement par l'équipe interne.</span>
                    <textarea id="ad-note" className="ad-ta" value={noteBody} onChange={(e) => setNoteBody(e.target.value)} placeholder="Ajouter une note…" />
                    <div>
                      <button type="button" className="ad-btn pri sm" onClick={handleAddNote} disabled={!noteBody.trim() || noteBusy}>
                        {noteBusy ? <Loader2 className="ad-i ad-spin" aria-hidden /> : <Plus className="ad-i" aria-hidden />}Ajouter la note
                      </button>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 16 }}>
                    {data.notes.length === 0 && <div className="ad-empty"><b>Aucune note</b>Ajoute la première ci-dessus.</div>}
                    {data.notes.map((n) => (
                      <div key={n.id} className="ad-note">
                        <header>
                          <b>{n.authorEmail ?? "-"}</b><span>· {fmtDateTime(n.created_at as string)}</span>
                          <span className="ad-r">
                            <button type="button" className="ad-btn sm ghost" aria-label="Supprimer la note" onClick={() => setNoteConfirm(n.id)}><Trash2 className="ad-i" aria-hidden /></button>
                          </span>
                        </header>
                        <p>{n.body}</p>
                        {noteConfirm === n.id && (
                          <div className="ad-confirm" role="alert">
                            <AlertTriangle className="ad-i" aria-hidden />Supprimer cette note ? C'est définitif.
                            <span className="ad-r">
                              <button type="button" className="ad-btn sm" onClick={() => setNoteConfirm(null)}>Annuler</button>
                              <button type="button" className="ad-btn sm danger" onClick={() => handleDeleteNote(n.id)}>Supprimer</button>
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}

              {tab === "audit" && (data.recentAudit.length === 0 ? (
                <div className="ad-empty"><b>Aucun événement</b>Aucune action admin sur ce client.</div>
              ) : (
                <ul className="ad-list">
                  {data.recentAudit.map((a) => (
                    <li key={a.id} className="ad-li">
                      <span className="ad-lic"><ScrollText className="ad-i" aria-hidden /></span>
                      <span className="ad-grow"><b>{AUDIT_LABEL[a.action as string] ?? (a.action as string)}</b><small>par {a.adminEmail ?? "-"}</small></span>
                      <small>{fmtDateTime(a.created_at as string)}</small>
                    </li>
                  ))}
                </ul>
              ))}
            </div>
          </section>

          <aside className="ad-clside">
            {profileRows.length > 0 && (
              <section className="ad-card">
                <div className="ad-ch"><h2>Profil déclaré à l'inscription</h2></div>
                <div className="ad-cb">
                  <dl className="ad-dl">
                    {profileRows.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
                  </dl>
                </div>
              </section>
            )}
            <section className="ad-card">
              <div className="ad-ch"><h2>Meta Ads</h2></div>
              <div className="ad-cb">
                <div className="ad-metast">
                  <svg className="ad-m" viewBox="0 0 24 24" role="img" aria-label="Meta"><path fill="#0866FF" d="M6.915 4.03c-1.968 0-3.683 1.28-4.871 3.113C.704 9.208 0 11.883 0 14.449c0 .706.07 1.369.21 1.973a6.624 6.624 0 0 0 .265.86 5.297 5.297 0 0 0 .371.761c.696 1.159 1.818 1.927 3.593 1.927 1.497 0 2.633-.671 3.965-2.444.76-1.012 1.144-1.626 2.663-4.32l.756-1.339.186-.325c.061.1.121.196.183.3l2.152 3.595c.724 1.21 1.665 2.556 2.47 3.314 1.046.987 1.992 1.22 3.06 1.22 1.075 0 1.876-.355 2.455-.843a3.743 3.743 0 0 0 .81-.973c.542-.939.861-2.127.861-3.745 0-2.72-.681-5.357-2.084-7.45-1.282-1.912-2.957-2.93-4.716-2.93-1.047 0-2.088.467-3.053 1.308-.652.57-1.257 1.29-1.82 2.05-.69-.875-1.335-1.547-1.958-2.056-1.182-.966-2.315-1.303-3.454-1.303zm10.16 2.053c1.147 0 2.188.758 2.992 1.999 1.132 1.748 1.647 4.195 1.647 6.4 0 1.548-.368 2.9-1.839 2.9-.58 0-1.027-.23-1.664-1.004-.496-.601-1.343-1.878-2.832-4.358l-.617-1.028a44.908 44.908 0 0 0-1.255-1.98c.07-.109.141-.224.211-.327 1.12-1.667 2.118-2.602 3.358-2.602zm-10.201.553c1.265 0 2.058.791 2.675 1.446.307.327.737.871 1.234 1.579l-1.02 1.566c-.757 1.163-1.882 3.017-2.837 4.338-1.191 1.649-1.81 1.817-2.486 1.817-.524 0-1.038-.237-1.383-.794-.263-.426-.464-1.13-.464-2.046 0-2.221.63-4.535 1.66-6.088.454-.687.964-1.226 1.533-1.533a2.264 2.264 0 0 1 1.088-.285z" /></svg>
                  <span><b>{meta.title}</b><small>{meta.sub}</small></span>
                  <span className={`ad-pill ${meta.tone}`}>{meta.tone === "ok" ? <Check aria-hidden /> : meta.tone ? <AlertTriangle aria-hidden /> : null}{meta.pill}</span>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </div>

      <Dialog open={impOpen} onOpenChange={setImpOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Voir l'app comme {w.ownerDisplayName ?? w.name}</DialogTitle>
            <DialogDescription>Tu verras Growthity exactement comme ce client, pendant 30 minutes.</DialogDescription>
          </DialogHeader>
          <ul className="ad-dlg-list">
            <li><ShieldCheck aria-hidden />Lecture seule : toutes les modifications sont bloquées.</li>
            <li><ScrollText aria-hidden />Chaque action est enregistrée dans le journal d'audit.</li>
            <li><Clock aria-hidden />La session s'arrête d'elle-même au bout de 30 minutes.</li>
          </ul>
          <DialogFooter>
            <button type="button" className="inline-flex h-9 items-center rounded-lg border border-border px-4 text-sm font-medium hover:bg-muted" onClick={() => setImpOpen(false)}>Annuler</button>
            <button type="button" className="inline-flex h-9 items-center gap-2 rounded-lg px-4 text-sm font-medium text-white disabled:opacity-60" style={{ background: "#5B3FE4" }} onClick={handleImpersonate} disabled={impBusy}>
              {impBusy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}Démarrer
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
