import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { CalendarDays, ChevronLeft, ChevronRight, Facebook, Instagram, Linkedin, Music2, Pin, Plus, Youtube, Link2, Trash2, Send, Clock, RefreshCw, X } from "lucide-react";
import {
  deleteSocialPost, disconnectSocialAccount, getSocialConnectUrl, getSocialOverview, listSocialLibrary,
  listSocialPosts, publishSocialPost, refreshSocialPost, saveSocialPost, syncSocialAccounts,
} from "@/lib/social.functions";

/* ---------- Types & constantes ---------- */

type Account = { id: string; zernio_account_id: string; platform: string; username: string | null; display_name: string | null; avatar_url: string | null };
type Post = {
  id: string; ad_id: string | null; media_url: string | null; media_kind: "video" | "image" | null; caption: string;
  account_ids: string[]; scheduled_at: string | null; timezone: string; status: Status; results: { platform: string; status: string; url: string | null; error: string | null }[]; error: string | null;
};
type Status = "idea" | "draft" | "scheduled" | "publishing" | "published" | "partial" | "failed";
type LibItem = { id: string; title: string; url: string; kind: "video" | "image"; ratio: string };
type Tab = "calendrier" | "publications" | "comptes";

const PLATFORMS: { key: string; label: string; Icon: typeof Instagram; hint: string }[] = [
  { key: "instagram", label: "Instagram", Icon: Instagram, hint: "Compte professionnel ou créateur" },
  { key: "facebook", label: "Facebook", Icon: Facebook, hint: "Page Facebook" },
  { key: "tiktok", label: "TikTok", Icon: Music2, hint: "Compte TikTok" },
  { key: "linkedin", label: "LinkedIn", Icon: Linkedin, hint: "Profil ou page entreprise" },
  { key: "youtube", label: "YouTube", Icon: Youtube, hint: "Chaîne YouTube (Shorts)" },
  { key: "pinterest", label: "Pinterest", Icon: Pin, hint: "Compte Pinterest" },
];
const pIcon = (k: string) => PLATFORMS.find((p) => p.key === k)?.Icon ?? Link2;
const pLabel = (k: string) => PLATFORMS.find((p) => p.key === k)?.label ?? k;

const STATUS: Record<Status, { label: string; cls: string }> = {
  idea: { label: "Idée", cls: "gx-off" },
  draft: { label: "Brouillon", cls: "gx-q" },
  scheduled: { label: "Programmée", cls: "gx-new" },
  publishing: { label: "En cours", cls: "gx-rev" },
  published: { label: "Publiée", cls: "gx-on" },
  partial: { label: "Partielle", cls: "gx-rev" },
  failed: { label: "Échec", cls: "gx-bad" },
};
const COLUMNS: { title: string; statuses: Status[] }[] = [
  { title: "Idées", statuses: ["idea"] },
  { title: "Brouillons", statuses: ["draft"] },
  { title: "Programmées", statuses: ["scheduled", "publishing"] },
  { title: "Publiées", statuses: ["published", "partial"] },
  { title: "Échecs", statuses: ["failed"] },
];
const EDITABLE: Status[] = ["idea", "draft", "failed"];
const TZ = Intl.DateTimeFormat().resolvedOptions().timeZone || "Europe/Paris";

const pad = (n: number) => String(n).padStart(2, "0");
const dayKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const toLocalInput = (iso: string | null) => { if (!iso) return ""; const d = new Date(iso); return `${dayKey(d)}T${pad(d.getHours())}:${pad(d.getMinutes())}`; };
const fmtTime = (iso: string) => new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
const fmtFull = (iso: string) => new Date(iso).toLocaleString("fr-FR", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

/* ---------- Page ---------- */

export function SocialHub({ search }: { search: { tab?: Tab; connected?: string; post?: string } }) {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const tab: Tab = search.tab ?? "calendrier";
  const [sheet, setSheet] = useState<Partial<Post> | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const say = (m: string) => { setToast(m); window.setTimeout(() => setToast(null), 3200); };

  const fOverview = useServerFn(getSocialOverview);
  const fPosts = useServerFn(listSocialPosts);
  const fSync = useServerFn(syncSocialAccounts);
  const fSave = useServerFn(saveSocialPost);

  const overview = useQuery({ queryKey: ["social-overview"], queryFn: () => fOverview(), staleTime: 60_000 });
  const posts = useQuery({ queryKey: ["social-posts"], queryFn: () => fPosts() as Promise<Post[]>, staleTime: 30_000 });
  const accounts = (overview.data?.accounts ?? []) as Account[];

  // Retour de la fenêtre de connexion Zernio : on relit les comptes.
  useEffect(() => {
    if (!search.connected) return;
    fSync().then((r) => {
      qc.invalidateQueries({ queryKey: ["social-overview"] });
      say(r.count ? `${pLabel(search.connected!)} connecté ✓` : "Connexion annulée");
      navigate({ to: "/reseaux", search: { tab: "comptes" }, replace: true });
    }).catch(() => say("Impossible de vérifier la connexion, réessaie."));
  }, [search.connected]); // eslint-disable-line react-hooks/exhaustive-deps

  const setTab = (t: Tab) => navigate({ to: "/reseaux", search: { tab: t } });
  const openNew = (date?: Date) => {
    const d = date ? new Date(date) : null;
    if (d) d.setHours(18, 30, 0, 0); // heure de départ raisonnable, modifiable
    setSheet({ caption: "", account_ids: accounts.map((a) => a.zernio_account_id), scheduled_at: d ? d.toISOString() : null, status: "draft", timezone: TZ });
  };
  const moveTo = async (p: Post, day: Date) => {
    if (!EDITABLE.includes(p.status)) return say("Déjà envoyée : annule-la pour la déplacer.");
    const base = p.scheduled_at ? new Date(p.scheduled_at) : new Date(day.getFullYear(), day.getMonth(), day.getDate(), 18, 30);
    const next = new Date(day.getFullYear(), day.getMonth(), day.getDate(), base.getHours(), base.getMinutes());
    await fSave({ data: { ...p, scheduled_at: next.toISOString(), status: p.status === "failed" ? "draft" : (p.status as "idea" | "draft") } });
    qc.invalidateQueries({ queryKey: ["social-posts"] });
  };

  const list = posts.data ?? [];
  const counts = { all: list.length, sched: list.filter((p) => p.status === "scheduled").length };

  return (
    <div className="gx-page">
      <div className="gx-ph">
        <div>
          <h1>Réseaux sociaux</h1>
          <p>Planifie et publie tes créations sur tes réseaux, sans quitter Growthity.</p>
        </div>
        <div className="gx-pa">
          <div className="gx-seg" role="tablist" aria-label="Réseaux sociaux">
            <TabBtn on={tab === "calendrier"} onClick={() => setTab("calendrier")}>Calendrier</TabBtn>
            <TabBtn on={tab === "publications"} onClick={() => setTab("publications")}>Publications <span className="gx-num">{counts.all}</span></TabBtn>
            <TabBtn on={tab === "comptes"} onClick={() => setTab("comptes")}>Comptes <span className="gx-num">{accounts.length}</span></TabBtn>
          </div>
          <button type="button" className="gx-btn gx-pri" onClick={() => openNew()}><Plus className="gx-i" /> Nouvelle publication</button>
        </div>
      </div>

      {!overview.isLoading && accounts.length === 0 && tab !== "comptes" && (
        <div className="gx-note"><Link2 className="gx-i" /> Connecte au moins un réseau pour programmer tes publications.
          <button type="button" className="gx-btn gx-sm" style={{ marginLeft: "auto" }} onClick={() => setTab("comptes")}>Connecter</button>
        </div>
      )}

      {tab === "calendrier" && <Calendar posts={list} onOpen={(p) => setSheet(p)} onNew={openNew} onMove={moveTo} />}
      {tab === "publications" && <Board posts={list} accounts={accounts} onOpen={(p) => setSheet(p)} />}
      {tab === "comptes" && <Accounts accounts={accounts} loading={overview.isLoading} onToast={say} />}

      {sheet && (
        <PostSheet
          initial={sheet}
          accounts={accounts}
          onClose={() => setSheet(null)}
          onDone={(m) => { setSheet(null); say(m); qc.invalidateQueries({ queryKey: ["social-posts"] }); }}
          onToast={say}
        />
      )}
      <div className={`gx-toast gx-soc-toast${toast ? " gx-on" : ""}`} role="status">{toast}</div>
    </div>
  );
}

function TabBtn({ on, onClick, children }: { on: boolean; onClick: () => void; children: ReactNode }) {
  return <button type="button" role="tab" aria-selected={on} onClick={onClick}>{children}</button>;
}

/* ---------- Calendrier (mois) ---------- */

function Calendar({ posts, onOpen, onNew, onMove }: { posts: Post[]; onOpen: (p: Post) => void; onNew: (d: Date) => void; onMove: (p: Post, d: Date) => void }) {
  const [cursor, setCursor] = useState(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1); });
  const [drag, setDrag] = useState<Post | null>(null);
  const days = useMemo(() => {
    const first = new Date(cursor); const offset = (first.getDay() + 6) % 7; // semaine du lundi
    const start = new Date(first); start.setDate(1 - offset);
    return Array.from({ length: 42 }, (_, i) => { const d = new Date(start); d.setDate(start.getDate() + i); return d; });
  }, [cursor]);
  const byDay = useMemo(() => {
    const m = new Map<string, Post[]>();
    for (const p of posts) if (p.scheduled_at) { const k = dayKey(new Date(p.scheduled_at)); m.set(k, [...(m.get(k) ?? []), p]); }
    return m;
  }, [posts]);
  const today = dayKey(new Date());
  const unscheduled = posts.filter((p) => !p.scheduled_at && EDITABLE.includes(p.status));

  return (
    <div className="gx-soc-cal-wrap">
      <div className="gx-soc-cal">
        <div className="gx-soc-cal-h">
          <b>{cursor.toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}</b>
          <div className="gx-pa">
            <button type="button" className="gx-btn gx-sm" onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))} aria-label="Mois précédent"><ChevronLeft className="gx-i" /></button>
            <button type="button" className="gx-btn gx-sm" onClick={() => { const d = new Date(); setCursor(new Date(d.getFullYear(), d.getMonth(), 1)); }}>Aujourd’hui</button>
            <button type="button" className="gx-btn gx-sm" onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))} aria-label="Mois suivant"><ChevronRight className="gx-i" /></button>
          </div>
        </div>
        <div className="gx-soc-grid">
          {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((d) => <div key={d} className="gx-soc-dow">{d}</div>)}
          {days.map((d) => {
            const k = dayKey(d); const items = byDay.get(k) ?? [];
            const out = d.getMonth() !== cursor.getMonth();
            return (
              <div key={k} className={`gx-soc-day${out ? " gx-out" : ""}${k === today ? " gx-today" : ""}`}
                onDragOver={(e) => drag && e.preventDefault()}
                onDrop={() => { if (drag) onMove(drag, d); setDrag(null); }}
                onDoubleClick={() => onNew(d)}>
                <div className="gx-soc-day-h"><span>{d.getDate()}</span>
                  <button type="button" className="gx-soc-add" onClick={() => onNew(d)} aria-label={`Nouvelle publication le ${d.toLocaleDateString("fr-FR")}`}><Plus /></button>
                </div>
                {items.slice(0, 3).map((p) => <PostChip key={p.id} p={p} onOpen={onOpen} onDrag={setDrag} />)}
                {items.length > 3 && <small className="gx-hint">+{items.length - 3} autres</small>}
              </div>
            );
          })}
        </div>
      </div>
      <aside className="gx-soc-side">
        <div className="gx-lbl">À planifier</div>
        {unscheduled.length === 0 ? <p className="gx-hint">Glisse ici tes idées et brouillons sans date : ils apparaîtront pour être déposés sur un jour.</p>
          : unscheduled.map((p) => <PostChip key={p.id} p={p} onOpen={onOpen} onDrag={setDrag} wide />)}
      </aside>
    </div>
  );
}

function PostChip({ p, onOpen, onDrag, wide }: { p: Post; onOpen: (p: Post) => void; onDrag: (p: Post | null) => void; wide?: boolean }) {
  const draggable = EDITABLE.includes(p.status);
  return (
    <button type="button" className={`gx-soc-chip gx-s-${p.status}${wide ? " gx-wide" : ""}`} draggable={draggable}
      onDragStart={() => onDrag(p)} onDragEnd={() => onDrag(null)} onClick={() => onOpen(p)} title={p.caption || "Sans légende"}>
      <Thumb url={p.media_url} kind={p.media_kind} />
      <span className="gx-soc-chip-t">{p.scheduled_at ? fmtTime(p.scheduled_at) : STATUS[p.status].label}<small>{p.caption || "Sans légende"}</small></span>
    </button>
  );
}

function Thumb({ url, kind, big }: { url: string | null; kind: "video" | "image" | null; big?: boolean }) {
  const cls = big ? "gx-soc-thumb gx-big" : "gx-soc-thumb";
  if (!url) return <span className={`${cls} gx-empty-t`} />;
  return kind === "video"
    ? <video className={cls} src={`${url}#t=0.8`} muted playsInline preload="metadata" />
    : <img className={cls} src={url} alt="" loading="lazy" />;
}

/* ---------- Tableau par statut ---------- */

function Board({ posts, accounts, onOpen }: { posts: Post[]; accounts: Account[]; onOpen: (p: Post) => void }) {
  const accById = new Map(accounts.map((a) => [a.zernio_account_id, a]));
  return (
    <div className="gx-soc-board">
      {COLUMNS.map((c) => {
        const items = posts.filter((p) => c.statuses.includes(p.status));
        return (
          <section key={c.title} className="gx-soc-col">
            <header><b>{c.title}</b><span className="gx-num">{items.length}</span></header>
            {items.length === 0 && <div className="gx-hint gx-soc-colempty">Rien ici</div>}
            {items.map((p) => (
              <button type="button" key={p.id} className="gx-kard gx-soc-card" onClick={() => onOpen(p)}>
                <Thumb url={p.media_url} kind={p.media_kind} big />
                <div className="gx-soc-card-b">
                  <span className={`gx-st ${STATUS[p.status].cls}`}>{STATUS[p.status].label}</span>
                  <p>{p.caption || <i>Sans légende</i>}</p>
                  <div className="gx-soc-card-f">
                    <span className="gx-soc-nets">{p.account_ids.map((id) => { const a = accById.get(id); const I = pIcon(a?.platform ?? ""); return <I key={id} aria-label={pLabel(a?.platform ?? "")} />; })}</span>
                    {p.scheduled_at && <small><Clock /> {fmtFull(p.scheduled_at)}</small>}
                  </div>
                </div>
              </button>
            ))}
          </section>
        );
      })}
    </div>
  );
}

/* ---------- Comptes ---------- */

function Accounts({ accounts, loading, onToast }: { accounts: Account[]; loading: boolean; onToast: (m: string) => void }) {
  const qc = useQueryClient();
  const fConnect = useServerFn(getSocialConnectUrl);
  const fDisconnect = useServerFn(disconnectSocialAccount);
  const [busy, setBusy] = useState<string | null>(null);

  const connect = async (platform: string) => {
    setBusy(platform);
    try {
      const { authUrl } = await fConnect({ data: { platform: platform as any, origin: window.location.origin } });
      window.location.href = authUrl; // page officielle du réseau, puis retour sur /reseaux
    } catch (e: any) { onToast(e?.message ?? "Connexion impossible"); setBusy(null); }
  };
  const disconnect = async (a: Account) => {
    if (!window.confirm(`Déconnecter ${a.username ?? pLabel(a.platform)} ? Les publications programmées sur ce compte seront annulées.`)) return;
    setBusy(a.zernio_account_id);
    try { await fDisconnect({ data: { zernioAccountId: a.zernio_account_id } }); qc.invalidateQueries({ queryKey: ["social-overview"] }); onToast("Compte déconnecté"); }
    catch (e: any) { onToast(e?.message ?? "Déconnexion impossible"); }
    finally { setBusy(null); }
  };

  return (
    <div className="gx-soc-accs">
      {PLATFORMS.map(({ key, label, Icon, hint }) => {
        const mine = accounts.filter((a) => a.platform === key);
        return (
          <div key={key} className="gx-kard gx-soc-acc">
            <div className="gx-soc-acc-h">
              <span className={`gx-soc-logo gx-p-${key}`}><Icon /></span>
              <div><b>{label}</b><small className="gx-hint">{hint}</small></div>
              {mine.length > 0 && <span className="gx-st gx-on">Connecté</span>}
            </div>
            {mine.map((a) => (
              <div key={a.id} className="gx-soc-acc-row">
                {a.avatar_url ? <img src={a.avatar_url} alt="" /> : <span className="gx-av">{(a.username ?? "?").slice(0, 1).toUpperCase()}</span>}
                <span>{a.display_name ?? a.username}<small className="gx-hint">@{a.username}</small></span>
                <button type="button" className="gx-btn gx-sm gx-ghost" disabled={busy === a.zernio_account_id} onClick={() => disconnect(a)}>Déconnecter</button>
              </div>
            ))}
            <button type="button" className={`gx-btn gx-sm${mine.length ? "" : " gx-pri"}`} disabled={loading || busy === key} onClick={() => connect(key)}>
              {busy === key ? "Ouverture…" : mine.length ? "Ajouter un autre compte" : `Connecter ${label}`}
            </button>
          </div>
        );
      })}
      <p className="gx-hint gx-soc-legal">La connexion se fait sur la page officielle de chaque réseau : Growthity ne voit jamais ton mot de passe. Tu peux déconnecter un compte à tout moment.</p>
    </div>
  );
}

/* ---------- Fenêtre d'édition ---------- */

function PostSheet({ initial, accounts, onClose, onDone, onToast }: {
  initial: Partial<Post>; accounts: Account[]; onClose: () => void; onDone: (m: string) => void; onToast: (m: string) => void;
}) {
  const fLib = useServerFn(listSocialLibrary);
  const fSave = useServerFn(saveSocialPost);
  const fPublish = useServerFn(publishSocialPost);
  const fDelete = useServerFn(deleteSocialPost);
  const fRefresh = useServerFn(refreshSocialPost);
  const lib = useQuery({ queryKey: ["social-library"], queryFn: () => fLib() as Promise<LibItem[]>, staleTime: 5 * 60_000 });

  const [p, setP] = useState<Partial<Post>>(initial);
  const [picking, setPicking] = useState(!initial.media_url);
  const status = (p.status ?? "draft") as Status;
  const locked = !EDITABLE.includes(status);
  const set = (patch: Partial<Post>) => setP((cur) => ({ ...cur, ...patch }));
  const toggleAcc = (id: string) => set({ account_ids: (p.account_ids ?? []).includes(id) ? (p.account_ids ?? []).filter((x) => x !== id) : [...(p.account_ids ?? []), id] });

  const payload = (st: "idea" | "draft") => ({
    id: p.id, ad_id: p.ad_id ?? null, media_url: p.media_url ?? null, media_kind: p.media_kind ?? null,
    caption: p.caption ?? "", account_ids: p.account_ids ?? [], scheduled_at: p.scheduled_at ?? null, timezone: p.timezone ?? TZ, status: st,
  });
  const save = useMutation({ mutationFn: (st: "idea" | "draft") => fSave({ data: payload(st) }) as Promise<Post> });
  const run = async (mode: "save" | "idea" | "schedule" | "now") => {
    try {
      const saved = await save.mutateAsync(mode === "idea" ? "idea" : "draft");
      if (mode === "save" || mode === "idea") return onDone(mode === "idea" ? "Idée enregistrée" : "Brouillon enregistré");
      if (mode === "now" && !window.confirm("Publier maintenant sur les réseaux sélectionnés ?")) return setP(saved);
      const res = (await fPublish({ data: { id: saved.id, mode } })) as Post;
      onDone(mode === "now" ? (res.status === "published" ? "Publiée ✓" : `Publication : ${STATUS[res.status].label}`) : `Programmée le ${fmtFull(res.scheduled_at!)}`);
    } catch (e: any) { onToast(e?.message ?? "Une erreur est survenue"); }
  };
  const remove = async () => {
    if (!p.id) return onClose();
    if (!window.confirm(status === "scheduled" ? "Annuler cette publication programmée ?" : "Supprimer cette publication ?")) return;
    try { await fDelete({ data: { id: p.id } }); onDone(status === "scheduled" ? "Publication annulée" : "Supprimée"); } catch (e: any) { onToast(e?.message ?? "Suppression impossible"); }
  };
  const refresh = async () => { if (!p.id) return; const r = (await fRefresh({ data: { id: p.id } })) as Post | null; if (r) setP(r); };
  const busy = save.isPending;
  const limit = (p.account_ids ?? []).some((id) => accounts.find((a) => a.zernio_account_id === id)?.platform === "instagram") ? 2200 : 5000;

  return (
    <div className="gx-sheet" onMouseDown={(e) => e.target === e.currentTarget && onClose()} onKeyDown={(e) => e.key === "Escape" && onClose()}>
      <div className="gx-sheet-b gx-soc-sheet" role="dialog" aria-modal="true" aria-label="Publication">
        <div className="gx-sheet-h">
          <div><b>{p.id ? (locked ? "Publication" : "Modifier la publication") : "Nouvelle publication"}</b>
            <small><span className={`gx-st ${STATUS[status].cls}`}>{STATUS[status].label}</span></small></div>
          <button type="button" className="gx-btn gx-sm gx-ghost" onClick={onClose} aria-label="Fermer"><X className="gx-i" /></button>
        </div>

        <div className="gx-soc-sheet-body">
          <div className="gx-lbl">Média</div>
          {p.media_url && !picking ? (
            <div className="gx-soc-media">
              <Thumb url={p.media_url} kind={p.media_kind ?? null} big />
              {!locked && <button type="button" className="gx-btn gx-sm" onClick={() => setPicking(true)}>Changer</button>}
            </div>
          ) : (
            <div className="gx-soc-lib">
              {lib.isLoading && <p className="gx-hint">Chargement de tes créations…</p>}
              {lib.data?.length === 0 && <div className="gx-empty">Aucune création prête pour cette marque.</div>}
              {lib.data?.map((it) => (
                <button type="button" key={it.id} className={`gx-soc-lib-it${p.media_url === it.url ? " gx-sel" : ""}`} title={it.title}
                  onClick={() => { set({ media_url: it.url, media_kind: it.kind, ad_id: it.id }); setPicking(false); }}>
                  <Thumb url={it.url} kind={it.kind} big />{it.ratio && <em>{it.ratio}</em>}
                </button>
              ))}
            </div>
          )}

          <label className="gx-lbl" htmlFor="soc-cap">Légende</label>
          <textarea id="soc-cap" className="gx-in gx-soc-cap" rows={6} value={p.caption ?? ""} disabled={locked} maxLength={limit}
            placeholder="Écris ta légende, avec un appel à l’action (ex. « Lien en bio »)…" onChange={(e) => set({ caption: e.target.value })} />
          <small className="gx-hint gx-soc-count">{(p.caption ?? "").length} / {limit}</small>

          <div className="gx-lbl">Publier sur</div>
          {accounts.length === 0 ? <p className="gx-hint">Aucun réseau connecté. Va dans l’onglet Comptes.</p> : (
            <div className="gx-soc-nets-pick">
              {accounts.map((a) => { const I = pIcon(a.platform); const on = (p.account_ids ?? []).includes(a.zernio_account_id); return (
                <button type="button" key={a.id} className={`gx-chip${on ? " gx-on" : ""}`} aria-pressed={on} disabled={locked} onClick={() => toggleAcc(a.zernio_account_id)}>
                  <I className="gx-i" /> {a.username ?? pLabel(a.platform)}
                </button>); })}
            </div>
          )}

          <label className="gx-lbl" htmlFor="soc-date">Date et heure</label>
          <input id="soc-date" type="datetime-local" className="gx-in" disabled={locked} value={toLocalInput(p.scheduled_at ?? null)}
            onChange={(e) => set({ scheduled_at: e.target.value ? new Date(e.target.value).toISOString() : null })} />
          <small className="gx-hint"><CalendarDays className="gx-soc-ico" /> Fuseau : {p.timezone ?? TZ}</small>

          {p.error && <div className="gx-note gx-soc-err">{p.error}</div>}
          {(p.results ?? []).length > 0 && (
            <div className="gx-soc-results">
              <div className="gx-lbl">Résultat</div>
              {p.results!.map((r, i) => { const I = pIcon(r.platform); return (
                <div key={i} className="gx-soc-res"><I className="gx-i" /> {pLabel(r.platform)}
                  <span className={`gx-st ${r.status === "published" ? "gx-on" : r.status === "failed" ? "gx-bad" : "gx-rev"}`}>{r.status}</span>
                  {r.url && <a href={r.url} target="_blank" rel="noreferrer">Voir</a>}
                  {r.error && <small className="gx-hint">{r.error}</small>}
                </div>); })}
            </div>
          )}
        </div>

        <div className="gx-sheet-f">
          {p.id && <button type="button" className="gx-btn gx-sm gx-ghost" onClick={remove}><Trash2 className="gx-i" /> {status === "scheduled" ? "Annuler" : "Supprimer"}</button>}
          {locked ? (
            <button type="button" className="gx-btn gx-sm" style={{ marginLeft: "auto" }} onClick={refresh}><RefreshCw className="gx-i" /> Actualiser</button>
          ) : (
            <div className="gx-pa" style={{ marginLeft: "auto" }}>
              {!p.id && <button type="button" className="gx-btn gx-sm" disabled={busy} onClick={() => run("idea")}>Idée</button>}
              <button type="button" className="gx-btn gx-sm" disabled={busy} onClick={() => run("save")}>Enregistrer</button>
              <button type="button" className="gx-btn gx-sm" disabled={busy || !p.scheduled_at} onClick={() => run("schedule")}><Clock className="gx-i" /> Programmer</button>
              <button type="button" className="gx-btn gx-sm gx-pri" disabled={busy} onClick={() => run("now")}><Send className="gx-i" /> Publier</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
