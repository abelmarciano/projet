import { createFileRoute, Link, useNavigate, useHydrated } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { listAds } from "@/lib/tram.functions";
import { listMarketingCampaigns } from "@/lib/campaigns.functions";
import { getMetaPerformance, getMetaTopAds } from "@/lib/meta-insights.functions";
import { getMetaCredentials } from "@/lib/meta.functions";
import { getMediaBuyerSummary, type MediaBuyerSuggestion } from "@/lib/media-buyer.functions";
import { listBatches } from "@/lib/batch.functions";
import { listLeads, listLeadStatuses } from "@/lib/leads.functions";
import { listProductFolders } from "@/lib/catalog.functions";
import { listWorkspaceMembers } from "@/lib/workspaces.functions";
import { getOnboardingStatus } from "@/lib/onboarding.functions";
import { createMetaPublishConversation } from "@/lib/ad-conversations.functions";
import { openMetaAdInChat } from "@/lib/meta-chat-handoff";
import { openPromptInChat } from "@/lib/chat-prompt-handoff";
import { leadInitials } from "@/lib/lead-format";
import { useAppLanguage } from "@/lib/app-language";
import { frMoney, frNumber, frPercent } from "@/lib/format";
import { rangeFor } from "@/components/insights/shared";
import { useCurrentWorkspace } from "@/hooks/useWorkspaces";
import { useNewAdConversation } from "@/hooks/useNewAdConversation";
import { useAuth } from "@/hooks/useAuth";
import { startProductTour } from "@/components/ProductTour";
import { MetaConnectButton } from "@/components/MetaConnectDialog";
import { BudgetIncreaseDialog } from "@/components/results/BudgetIncreaseDialog";
import { CropVideoDialog } from "@/components/CropVideoDialog";
import { VideoPoster } from "@/components/VideoPoster";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/*
 * Accueil : copie de la maquette validée (landing/design/app/views/accueil.html),
 * classes gx- de src/styles/gx-console.css, branchée sur les vraies données du compte.
 */

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Accueil - growthity.ai" },
      { name: "description", content: "Accueil Growthity : ce qui tourne, ce qu'il faut faire maintenant, vos créations et vos derniers leads." },
      { property: "og:title", content: "Accueil - growthity.ai" },
      { property: "og:description", content: "Vos pubs Meta, vos créations et vos leads au même endroit." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Home,
});

/* ---------- petites aides ---------- */

const RUNNING_BATCH = ["extracting", "planning", "previewing", "declining"];
const IDEA_BATCH = ["draft", "planned"];
const OP_LABEL: Record<string, string> = {
  trim: "découpe", split: "découpe", subtitles: "sous-titres", crop: "recadrage", speedup: "vitesse",
};
const LEAD_KIND: Record<string, string> = {
  new: "gx-new", contacted: "gx-warn", qualified: "gx-q", converted: "gx-on",
  lost: "gx-bad", bad: "gx-bad", unqualified: "gx-bad", disqualified: "gx-bad",
};
const LEAD_LABEL: Record<string, string> = {
  new: "Nouveau", contacted: "Contacté", qualified: "Qualifié", converted: "Converti", lost: "Perdu",
};
const PLATFORM: Record<string, string> = {
  fb: "Facebook", facebook: "Facebook", ig: "Instagram", instagram: "Instagram",
  msg: "Messenger", messenger: "Messenger", an: "Audience Network", audience_network: "Audience Network",
};
const ONB_HIDDEN_KEY = "growthity:home-onboarding-hidden:v1";

type AdStatus = "pending" | "failed" | "ready" | "published";
function adStatus(ad: any): AdStatus {
  if (ad?.status === "pending") return "pending";
  if (ad?.status === "failed") return "failed";
  if (ad?.status === "published") return "published";
  return "ready";
}
const AD_STATUS_LABEL: Record<AdStatus, string> = { pending: "En cours", failed: "Échec", ready: "Prête", published: "Publiée" };

function typeLabel(ad: any) {
  return ad?.content_type === "video" ? "Vidéo" : ad?.content_type === "carousel" ? "Carrousel" : "Image";
}
function adThumb(ad: any): string | null {
  if (ad?.content_type === "carousel") {
    const list = Array.isArray(ad?.generated_urls) ? ad.generated_urls : [];
    return (list[0] as string) ?? ad?.generated_url ?? null;
  }
  if (ad?.content_type !== "video" && ad?.generated_url) return ad.generated_url;
  return ad?.stock_actor?.reference_image_url ?? ad?.source_image_urls?.[0] ?? null;
}
function batchTitle(b: any) {
  let domain = "";
  try { domain = b?.source_url ? new URL(b.source_url).hostname.replace(/^www\./, "") : ""; } catch { /* ignore */ }
  return b?.title || b?.pack_title || domain || `Lot du ${new Date(b?.created_at).toLocaleDateString("fr-FR")}`;
}
function batchProgress(b: any): { text: string; pct: number | null } {
  const s = String(b?.status);
  if (s === "declining" || s === "done") {
    const t = Number(b?.finals_total) || 0;
    return { text: `${frNumber(b?.finals_ready ?? 0)} / ${frNumber(t)} pubs prêtes`, pct: t ? Math.round(((b?.finals_ready ?? 0) / t) * 100) : null };
  }
  if (s === "previewing") {
    const t = Number(b?.items_total) || 0;
    return { text: `${frNumber(b?.items_ready ?? 0)} / ${frNumber(t)} aperçus prêts`, pct: t ? Math.round(((b?.items_ready ?? 0) / t) * 100) : null };
  }
  if (s === "planning") return { text: "Préparation des angles", pct: null };
  if (s === "extracting") return { text: "Lecture de la page produit", pct: null };
  if (s === "planned") return { text: "Plan prêt à valider", pct: null };
  return { text: "Brouillon", pct: null };
}
function ago(iso?: string | null) {
  if (!iso) return "";
  const s = Math.max(0, Math.round((Date.now() - +new Date(iso)) / 1000));
  if (s < 60) return `il y a ${s} s`;
  if (s < 3600) return `il y a ${Math.round(s / 60)} min`;
  if (s < 86400) return `il y a ${Math.round(s / 3600)} h`;
  return `il y a ${Math.round(s / 86400)} j`;
}
function campaignStatus(c: any): { cls: string; label: string } {
  const s = String(c?.effectiveStatus || c?.status || "").toUpperCase();
  if (s === "ACTIVE") return { cls: "gx-on", label: "En ligne" };
  if (s === "PENDING_REVIEW" || s === "IN_PROCESS") return { cls: "gx-rev", label: "En revue" };
  if (s === "DISAPPROVED" || s === "WITH_ISSUES") return { cls: "gx-bad", label: "Refusée" };
  return { cls: "gx-off", label: "En pause" };
}

/** Mini courbe, même dessin que la maquette (84 × 26). */
function Spark({ values }: { values: number[] }) {
  const v = values.length > 1 ? values : [0, ...(values.length ? values : [0])];
  const half = Math.floor(v.length / 2);
  const a = v.slice(0, half).reduce((x, y) => x + y, 0);
  const b = v.slice(half).reduce((x, y) => x + y, 0);
  const kind = b > a * 1.1 ? "ok" : b < a * 0.9 ? "bad" : "dim";
  const col = kind === "ok" ? "var(--gx-ok)" : kind === "bad" ? "var(--gx-bad)" : "var(--gx-dim)";
  const W = 84, H = 26, mx = Math.max(...v) || 1;
  const pts = v.map((x, i) => [(i / (v.length - 1)) * (W - 6) + 3, H - 4 - (x / mx) * (H - 8)]);
  const line = pts.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const last = pts[pts.length - 1];
  return (
    <svg className="gx-spark" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={kind === "bad" ? "Tendance en baisse" : kind === "ok" ? "Tendance en hausse" : "Tendance stable"}>
      <polygon points={`3,${H - 4} ${line} ${W - 3},${H - 4}`} fill={col} opacity=".12" />
      <polyline points={line} fill="none" stroke={col} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" strokeDasharray={kind === "bad" ? "3 2.5" : undefined} />
      {kind === "bad"
        ? <path d={`M${last[0] - 3.5},${last[1] - 2.5}h7l-3.5,5z`} fill={col} />
        : <circle cx={last[0]} cy={last[1]} r="2.6" fill={col} />}
    </svg>
  );
}

/** Vignette d'une création : image, ou première image de la vidéo. */
function Thumb({ ad, url }: { ad?: any; url?: string | null }) {
  const src = url ?? (ad ? adThumb(ad) : null);
  if (ad?.content_type === "video" && ad?.generated_url && !src) {
    return <span className="gx-ph"><VideoPoster src={ad.generated_url} className="h-full w-full object-cover" /></span>;
  }
  if (src) return <span className="gx-ph"><img src={src} alt="" loading="lazy" /></span>;
  return <span className="gx-ph" aria-hidden />;
}

/* ---------- page ---------- */

function Home() {
  const hydrated = useHydrated();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { user } = useAuth();
  const { language } = useAppLanguage();
  const { start: startChat, busy: chatBusy } = useNewAdConversation();
  const week = useMemo(() => rangeFor("7d"), []);

  const fetchAds = useServerFn(listAds);
  const fetchCampaigns = useServerFn(listMarketingCampaigns);
  const fetchPerf = useServerFn(getMetaPerformance);
  const fetchTopAds = useServerFn(getMetaTopAds);
  const fetchCreds = useServerFn(getMetaCredentials);
  const fetchMb = useServerFn(getMediaBuyerSummary);
  const fetchBatches = useServerFn(listBatches);
  const fetchLeads = useServerFn(listLeads);
  const fetchStatuses = useServerFn(listLeadStatuses);
  const fetchProducts = useServerFn(listProductFolders);
  const fetchMembers = useServerFn(listWorkspaceMembers);
  const fetchOnb = useServerFn(getOnboardingStatus);
  const createPublish = useServerFn(createMetaPublishConversation);
  const { data: ws } = useCurrentWorkspace();

  const metaQ = { staleTime: 5 * 60_000, gcTime: 30 * 60_000, refetchOnWindowFocus: false, retry: false } as const;
  const creds = useQuery({ queryKey: ["meta-credentials"], queryFn: () => fetchCreds(), staleTime: 60_000, retry: false });
  const metaConnected = (creds.data as any)?.connected === true;
  const ads = useQuery({ queryKey: ["ads"], queryFn: async () => (await fetchAds()) ?? [], retry: 2 });
  const campaigns = useQuery({ queryKey: ["marketing-campaigns"], queryFn: () => fetchCampaigns() });
  const perf = useQuery({
    queryKey: ["meta-performance", week.since, week.until, "all"],
    queryFn: () => fetchPerf({ data: { ...week, accountId: null } }),
    ...metaQ,
  });
  const topAds = useQuery({
    queryKey: ["meta-top-ads", week.since, week.until, "all"],
    queryFn: () => fetchTopAds({ data: { ...week, accountId: null } }),
    ...metaQ,
  });
  const mb = useQuery({
    queryKey: ["media-buyer-summary", week.since, week.until],
    queryFn: () => fetchMb({ data: { since: week.since, until: week.until } }),
    ...metaQ,
  });
  const batches = useQuery({
    queryKey: ["batches", "list", "all"],
    queryFn: () => fetchBatches({ data: { brandId: null } }),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
  const leads = useQuery({ queryKey: ["leads"], queryFn: () => fetchLeads(), staleTime: 5 * 60_000, refetchOnWindowFocus: false });
  const statuses = useQuery({ queryKey: ["lead-statuses"], queryFn: () => fetchStatuses(), staleTime: 10 * 60_000 });
  const products = useQuery({ queryKey: ["product-folders"], queryFn: () => fetchProducts(), staleTime: 5 * 60_000 });
  const members = useQuery({
    queryKey: ["workspace-members", ws?.id],
    queryFn: () => fetchMembers({ data: { workspaceId: ws!.id } }),
    enabled: !!ws?.id,
    staleTime: 5 * 60_000,
  });
  const onb = useQuery({ queryKey: ["onboarding-status"], queryFn: () => fetchOnb(), staleTime: 60_000 });

  // Rafraîchit la liste tant qu'une création est en cours de fabrication.
  const adRows: any[] = (ads.data as any[]) ?? [];
  const anyPending = adRows.some((a) => adStatus(a) === "pending" || a?.processing_status === "processing");
  useEffect(() => {
    if (!anyPending) return;
    const t = setInterval(() => void qc.invalidateQueries({ queryKey: ["ads"] }), 15_000);
    return () => clearInterval(t);
  }, [anyPending, qc]);

  /* ---------- données dérivées ---------- */

  const realAds = adRows.filter((a) => !a?.media_asset);
  const pendingAds = realAds.filter((a) => adStatus(a) === "pending" || a?.processing_status === "processing");
  const readyAds = realAds.filter((a) => adStatus(a) === "ready" && a?.processing_status !== "processing");
  const batchRows: any[] = (batches.data as any[]) ?? [];
  const runningBatches = batchRows.filter((b) => RUNNING_BATCH.includes(String(b?.status)));
  const ideaBatches = batchRows.filter((b) => IDEA_BATCH.includes(String(b?.status)));
  const onlineAds = [...(((topAds.data as any)?.ads as any[]) ?? [])]
    .filter((a) => (a?.impressions || 0) > 0)
    .sort((a, b) => (b?.spend || 0) - (a?.spend || 0));

  const leadRows = [...(((leads.data as any[]) ?? []))]
    .filter((l) => !(l?.is_test || /<test lead|dummy data/i.test(`${l?.full_name ?? ""} ${l?.email ?? ""}`)))
    .sort((a, b) => +new Date(b?.submitted_at ?? b?.created_at) - +new Date(a?.submitted_at ?? a?.created_at));
  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
  const leadsToday = leadRows.filter((l) => +new Date(l?.submitted_at ?? l?.created_at) >= +todayStart).length;
  const statusMap = new Map<string, any>(((statuses.data as any[]) ?? []).map((s: any) => [s.key, s]));

  const perfData: any = perf.data;
  const totals = perfData?.totals;
  const previous = perfData?.previous;
  const word = (mb.data as any)?.resultWord ?? "lead";
  const wordPlural = (mb.data as any)?.resultWordPlural ?? "leads";
  const cpl = totals?.cost_per_result ?? (totals?.results ? totals.spend / totals.results : null);
  const prevCpl = previous?.cost_per_result ?? (previous?.results ? previous.spend / previous.results : null);
  const cplDelta = cpl && prevCpl ? Math.round(((cpl - prevCpl) / prevCpl) * 100) : null;
  const suggestions: MediaBuyerSuggestion[] = ((mb.data as any)?.suggestions as MediaBuyerSuggestion[]) ?? [];
  const weekReady = readyAds.filter((a) => +new Date(a?.created_at) >= Date.now() - 7 * 86_400_000).length;

  const campaignRows: any[] = ((perfData?.campaigns as any[]) ?? [])
    .filter((c) => campaignStatus(c).cls === "gx-on" || (c?.totals?.spend || 0) > 0)
    .slice(0, 5);

  const firstName = (user?.user_metadata?.full_name ?? (onb.data as any)?.displayName ?? "").split(" ")[0];
  const today = hydrated
    ? new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })
    : "";
  const mood = cplDelta == null ? "" : cplDelta <= 0 ? " Bonne semaine pour tes pubs." : " Quelques réglages à faire cette semaine.";

  /* ---------- bien démarrer ---------- */

  const memberCount = ((members.data as any)?.members?.length ?? 0) + ((members.data as any)?.invitations?.length ?? 0);
  const hasCampaign = ((campaigns.data as any[]) ?? []).some((c: any) => c?.meta_campaign_id || c?.status === "published")
    || ((perfData?.campaigns as any[]) ?? []).length > 0;
  const steps = [
    { done: metaConnected, title: "Connecter ton compte Meta", to: "/connexions" },
    { done: ((products.data as any[]) ?? []).length > 0, title: "Ajouter ton premier produit", to: "/catalogue/produits" },
    { done: realAds.length > 0, title: "Créer ta première pub", to: "/creations" },
    { done: hasCampaign, title: "Publier une campagne sur Meta", to: "/campaigns" },
    { done: memberCount > 1, title: "Inviter ton équipe", hint: "Associé, freelance, agence", to: "/parametres/membres", action: "Inviter" },
    { done: (onb.data as any)?.tourSeen === true, title: "Faire la visite guidée", hint: "1 minute pour tout comprendre", action: "Démarrer", tour: true },
  ];
  const doneCount = steps.filter((s) => s.done).length;
  const [onbHidden, setOnbHidden] = useState(true);
  useEffect(() => {
    try { setOnbHidden(window.localStorage.getItem(ONB_HIDDEN_KEY) === "1"); } catch { setOnbHidden(false); }
  }, []);
  const onbLoading = creds.isLoading || ads.isLoading || products.isLoading || onb.isLoading;
  const showOnb = hydrated && !onbHidden && !onbLoading && doneCount < steps.length;

  /* ---------- zone de saisie ---------- */

  const [ask, setAsk] = useState("");
  const askRef = useRef<HTMLTextAreaElement>(null);
  const [listening, setListening] = useState(false);
  const recRef = useRef<any>(null);

  const launch = async () => {
    const text = ask.trim();
    if (!text) { askRef.current?.focus(); return; }
    openPromptInChat(text);
    await startChat();
  };
  const toggleDictation = () => {
    if (listening) { recRef.current?.stop(); return; }
    const Recognition = (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition;
    if (!Recognition) { toast.error("La dictée vocale n'est pas disponible dans ce navigateur."); return; }
    const recognition = new Recognition();
    recognition.lang = language === "en" ? "en-US" : "fr-FR";
    recognition.interimResults = true;
    recognition.continuous = true;
    const base = ask.trim();
    let silence: ReturnType<typeof setTimeout> | null = null;
    recognition.onresult = (e: any) => {
      let t = "";
      for (let i = 0; i < e.results.length; i++) t += e.results[i]?.[0]?.transcript ?? "";
      setAsk(`${base}${base && t ? " " : ""}${t}`);
      if (silence) clearTimeout(silence);
      silence = setTimeout(() => recognition.stop(), 3000);
    };
    recognition.onerror = (e: any) => toast.error(e?.error === "not-allowed"
      ? "L'accès au micro a été refusé. Autorise le micro dans ton navigateur."
      : "La dictée vocale n'est pas disponible pour le moment.");
    recognition.onend = () => { setListening(false); if (silence) clearTimeout(silence); };
    recRef.current = recognition;
    recognition.start();
    setListening(true);
  };
  const prefill = (t: string) => { setAsk(t); setTimeout(() => { askRef.current?.focus(); askRef.current?.setSelectionRange(t.length, t.length); }, 0); };

  /* ---------- création sélectionnée ---------- */

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = realAds.find((a) => a.id === selectedId) ?? readyAds[0] ?? realAds[0] ?? null;
  const versions = selected
    ? realAds
      .filter((a) => (a.root_ad_id ?? a.id) === (selected.root_ad_id ?? selected.id))
      .sort((a, b) => +new Date(a.created_at) - +new Date(b.created_at))
    : [];
  const selStatus = selected ? adStatus(selected) : null;
  const selIsVideo = selected?.content_type === "video";
  const selReady = selStatus === "ready" || selStatus === "published";
  const [publishing, setPublishing] = useState(false);
  const [cropping, setCropping] = useState<{ id: string; url: string } | null>(null);
  const [budgetTarget, setBudgetTarget] = useState<{ id: string; name: string } | null>(null);

  const publish = async () => {
    if (!selected) return;
    setPublishing(true);
    try {
      const row: any = await createPublish({ data: { adIds: [selected.id], uiLanguage: language } });
      await qc.invalidateQueries({ queryKey: ["ad-conversations"] });
      await navigate({ to: "/create", search: { c: row.id, start: "meta" } as never });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Impossible de préparer la publication.");
    } finally {
      setPublishing(false);
    }
  };
  const extend = async () => {
    if (!selected) return;
    openPromptInChat(`Je veux prolonger ma vidéo « ${selected.title || "Sans titre"} ». Prépare-moi le brief de la suite en gardant exactement le même acteur et les mêmes produits.\n<!--continue-ad:"${selected.id}"-->`);
    await startChat();
  };

  /* ---------- rendu ---------- */

  const runs: { key: string; to?: string; params?: any; thumb: ReactNode; title: string; sub: string; pct: number | null; done?: boolean; spin?: boolean }[] = [
    ...pendingAds.slice(0, 3).map((a) => ({
      key: `ad-${a.id}`,
      thumb: <Thumb ad={a} />,
      title: `${typeLabel(a)} · ${a.title || "Sans titre"}`,
      sub: a.processing_status === "processing" ? `Retouche en cours · ${OP_LABEL[a.processing_op] ?? "montage"}` : "Génération en cours",
      pct: null,
      spin: true,
    })),
    ...runningBatches.slice(0, 3).map((b) => {
      const p = batchProgress(b);
      return {
        key: `batch-${b.id}`, to: "/batch/$id", params: { id: b.id },
        thumb: <Thumb url={b.thumbnail} />,
        title: `Batch Studio · ${batchTitle(b)}`, sub: p.text, pct: p.pct, spin: true,
      };
    }),
    ...(metaConnected && leadRows.length > 0 ? [{
      key: "leads", to: "/resultats",
      thumb: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-3-6.7L21 8M21 3v5h-5" /></svg>,
      title: "Leads Meta synchronisés",
      sub: `${leadsToday} nouveau${leadsToday > 1 ? "x" : ""} aujourd'hui · dernier ${ago(leadRows[0]?.submitted_at ?? leadRows[0]?.created_at)}`,
      pct: 100, done: true,
    }] : []),
  ];

  const pipeCols: { key: string; label: string; color: string; count: number; cards: ReactNode[] }[] = [
    {
      key: "idea", label: "Idées", color: "var(--gx-dim)", count: ideaBatches.length,
      cards: ideaBatches.slice(0, 2).map((b) => (
        <Link key={b.id} to="/batch/$id" params={{ id: b.id }} className="gx-card">
          <Thumb url={b.thumbnail} /><div><b>{batchTitle(b)}</b><small>{batchProgress(b).text}</small></div>
        </Link>
      )),
    },
    {
      key: "gen", label: "En génération", color: "var(--gx-accent)", count: pendingAds.length + runningBatches.length,
      cards: [
        ...pendingAds.slice(0, 2).map((a) => (
          <button key={a.id} type="button" className="gx-card" aria-pressed={selected?.id === a.id} onClick={() => setSelectedId(a.id)}>
            <Thumb ad={a} /><div><b>{a.title || "Sans titre"}</b><small>{typeLabel(a)} · en cours</small><div className="gx-bar gx-mini gx-ind"><i /></div></div>
          </button>
        )),
        ...runningBatches.slice(0, Math.max(0, 2 - pendingAds.length)).map((b) => {
          const p = batchProgress(b);
          return (
            <Link key={b.id} to="/batch/$id" params={{ id: b.id }} className="gx-card">
              <Thumb url={b.thumbnail} /><div><b>{batchTitle(b)}</b><small>{p.text}</small>
                <div className={p.pct == null ? "gx-bar gx-mini gx-ind" : "gx-bar gx-mini"}><i style={p.pct == null ? undefined : { width: `${p.pct}%` }} /></div></div>
            </Link>
          );
        }),
      ],
    },
    {
      key: "ready", label: "Prêtes", color: "var(--gx-warn)", count: readyAds.length,
      cards: readyAds.slice(0, 2).map((a) => (
        <button key={a.id} type="button" className="gx-card" aria-pressed={selected?.id === a.id} onClick={() => setSelectedId(a.id)}>
          <Thumb ad={a} /><div><b>{a.title || "Sans titre"}</b><small>{[a.aspect_ratio, typeLabel(a)].filter(Boolean).join(" · ")}</small></div>
        </button>
      )),
    },
    {
      key: "online", label: "En ligne", color: "var(--gx-ok)", count: onlineAds.length,
      cards: onlineAds.slice(0, 2).map((a) => (
        <Link key={a.id} to="/performance" className="gx-card">
          <Thumb url={a.thumbnail_url} />
          <div><b>{a.name}</b><small>CTR {frPercent(a.ctr)}{a.results > 0 ? ` · ${frMoney(a.spend / a.results)}/${word}` : ""}</small></div>
        </Link>
      )),
    },
  ];

  return (
    <div className="gx-view gx-home">
      <div className="gx-wrap">
        <section className="gx-hello">
          <span className="gx-d">{today || " "}</span>
          <h1>Bonjour{firstName ? ` ${firstName}` : ""}.{mood}</h1>
          <p>
            {metaConnected && totals?.results > 0 ? (
              <>
                <b>{frNumber(totals.results)} {totals.results > 1 ? wordPlural : word}</b> à <b>{frMoney(cpl ?? 0)}</b> pièce
                {cplDelta != null && <>, coût par {word} <span className={cplDelta <= 0 ? "gx-up" : "gx-dn"}>{cplDelta > 0 ? "+" : "−"}{Math.abs(cplDelta)} %</span></>} sur 7 jours.{" "}
              </>
            ) : metaConnected ? (
              <>Pas encore de {word} sur les 7 derniers jours. </>
            ) : (
              <>Connecte ton compte Meta pour suivre tes {wordPlural} et tes dépenses ici. </>
            )}
            {weekReady > 0 && <>{weekReady === 1 ? "Une création est prête" : `${frNumber(weekReady)} créations sont prêtes`} à publier</>}
            {weekReady > 0 && suggestions.length > 0 ? " et " : weekReady > 0 ? "." : ""}
            {suggestions.length > 0 && <>{suggestions.length === 1 ? "une action t'attend" : `${suggestions.length} actions t'attendent`}.</>}
          </p>
        </section>

        {showOnb && (
          <section className="gx-onb" aria-label="Bien démarrer">
            <div className="gx-onb-h">
              <div><b>Bien démarrer avec Growthity</b><small>{doneCount} étape{doneCount > 1 ? "s" : ""} sur {steps.length} terminée{doneCount > 1 ? "s" : ""}</small></div>
              <span className="gx-meter"><i style={{ width: `${Math.round((doneCount / steps.length) * 100)}%` }} /></span>
              <button type="button" onClick={() => { setOnbHidden(true); try { window.localStorage.setItem(ONB_HIDDEN_KEY, "1"); } catch { /* ignore */ } }}>Masquer</button>
            </div>
            <ol className="gx-onb-l">
              {steps.map((s, i) => (
                <li key={s.title} className={s.done ? "gx-done" : undefined}>
                  <i>{s.done ? "✓" : i + 1}</i>
                  <span>{s.title}{!s.done && s.hint && <small>{s.hint}</small>}</span>
                  {s.done || !s.action ? (
                    s.to ? <Link to={s.to as never}>Voir</Link> : null
                  ) : s.tour ? (
                    <button type="button" className="gx-btn gx-sm" onClick={startProductTour}>{s.action}</button>
                  ) : s.title.startsWith("Connecter") ? (
                    <MetaConnectButton />
                  ) : (
                    <Link to={s.to as never} className="gx-btn gx-sm">{s.action}</Link>
                  )}
                </li>
              ))}
            </ol>
          </section>
        )}

        <section>
          <div className="gx-ask">
            <label htmlFor="home-ask" style={{ position: "absolute", left: -9999 }}>Décrire la pub</label>
            <textarea
              id="home-ask" ref={askRef} value={ask} onChange={(e) => setAsk(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void launch(); } }}
              placeholder="Décris la pub que tu veux lancer, colle un lien produit ou demande ce que fait la concurrence…"
            />
            <div className="gx-ask-bar">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button type="button" className="gx-att">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>Produit, acteur, campagne
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="console-app-portal">
                  <DropdownMenuItem asChild><Link to="/catalogue/produits">Choisir un produit</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link to="/galerie">Choisir un acteur</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link to="/campaigns">Choisir une campagne</Link></DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <button type="button" className="gx-att" onClick={toggleDictation} aria-pressed={listening} aria-label={listening ? "Arrêter la dictée" : "Dicter un message"}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" /></svg>{listening ? "J'écoute…" : "Dicter"}
              </button>
              <div className="gx-sp" />
              <span className="gx-cost gx-num" title="Une vidéo de 8 s coûte à partir de 300 crédits">≈ ⚡300</span>
              <button type="button" className="gx-go" onClick={() => void launch()} disabled={chatBusy}>
                Lancer<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
              </button>
            </div>
          </div>
          <div className="gx-starts">
            <button type="button" className="gx-start" onClick={() => prefill("Crée une pub depuis cette page produit : ")}>Depuis une URL</button>
            <button type="button" className="gx-start" onClick={() => prefill("Que font mes concurrents sur Meta en ce moment ? Mon secteur : ")}>Espionner la concurrence</button>
            <button type="button" className="gx-start" onClick={() => prefill("Relance les visiteurs de mon site qui n'ont pas acheté, avec un budget de 15 € par jour.")}>Relancer mes visiteurs</button>
            <button type="button" className="gx-start" onClick={() => prefill("Analyse mes pubs des 7 derniers jours et dis-moi quoi tester.")}>Analyser mes pubs</button>
          </div>
        </section>

        <section className="gx-sec" aria-labelledby="h-runs">
          <div className="gx-sh"><h2 id="h-runs">En cours</h2><small>L'IA travaille pendant que tu fais autre chose</small></div>
          <div className="gx-runs">
            {runs.length === 0 ? (
              <div className="gx-run gx-done">
                <div className="gx-th"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg></div>
                <div><b>Rien en cours</b><small>Décris une pub ci-dessus pour lancer une création.</small></div>
                <div className="gx-bar"><i style={{ width: "100%" }} /></div><div className="gx-pct">À jour</div>
              </div>
            ) : runs.map((r) => {
              const body = (
                <>
                  <div className="gx-th">{r.thumb}</div>
                  <div><b>{r.spin && <span className="gx-spin" />}{r.title}</b><small>{r.sub}</small></div>
                  <div className={r.pct == null ? "gx-bar gx-ind" : "gx-bar"}><i style={r.pct == null ? undefined : { width: `${r.pct}%` }} /></div>
                  <div className={r.done ? "gx-pct" : "gx-pct gx-num"}>{r.done ? "À jour" : r.pct == null ? "En cours" : `${r.pct} %`}</div>
                </>
              );
              return r.to
                ? <Link key={r.key} to={r.to as never} params={r.params as never} className={r.done ? "gx-run gx-done" : "gx-run"}>{body}</Link>
                : <div key={r.key} className="gx-run">{body}</div>;
            })}
          </div>
        </section>

        <section className="gx-sec" aria-labelledby="h-reco">
          <div className="gx-sh"><h2 id="h-reco">Ce que je ferais maintenant</h2><small>Calculé sur tes chiffres Meta des 7 derniers jours</small></div>
          {!creds.isLoading && !metaConnected ? (
            <div className="gx-empty">
              <b>Connecte ton compte Meta</b>
              <span>Je regarde tes pubs chaque jour et je te dis lesquelles booster, tester ou couper.</span>
              <MetaConnectButton />
            </div>
          ) : mb.isLoading ? (
            <div className="gx-recos">
              {[0, 1, 2].map((i) => <article key={i} className="gx-reco"><p>Analyse de tes chiffres…</p></article>)}
            </div>
          ) : suggestions.length === 0 ? (
            <div className="gx-empty">
              <b>Rien d'urgent pour l'instant</b>
              <span>{(mb.data as any)?.lowData
                ? "Il faut encore quelques jours de diffusion pour que mes conseils soient fiables."
                : "Tes campagnes tournent sans problème sur les 7 derniers jours."}</span>
            </div>
          ) : (
            <div className="gx-recos">
              {suggestions.map((s, i) => (
                <article key={i} className={`gx-reco gx-${s.kind}`}>
                  <span className="gx-k">{s.kind === "boost" ? "↗ À booster" : s.kind === "test" ? "✦ À tester" : "⏸ À couper"}</span>
                  <p>{s.campaignName && <b>{s.campaignName} · </b>}{s.text.replace(/ (\d+(?:[,.]\d+)?) %/g, " $1 %")}</p>
                  <div className="gx-row">
                    {s.campaignId && s.kind === "boost" && (
                      <button type="button" className="gx-act gx-pri" onClick={() => setBudgetTarget({ id: s.campaignId ?? "", name: s.campaignName ?? "" })}>Augmenter de 20 %</button>
                    )}
                    {s.campaignId && s.kind === "test" && (
                      <button type="button" className="gx-act" onClick={() => {
                        openMetaAdInChat({ campaignId: s.campaignId ?? "", campaignName: s.campaignName ?? undefined });
                        void navigate({ to: "/create", search: {} as never });
                      }}>Créer une variante</button>
                    )}
                    {s.campaignId && s.kind === "cut" && (
                      <Link to="/campaigns" search={{ metaId: s.campaignId } as never} className="gx-act">Mettre en pause</Link>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="gx-sec" aria-labelledby="h-pipe">
          <div className="gx-sh"><h2 id="h-pipe">Pipeline créatif</h2><small>Du brouillon à la pub en ligne</small><Link className="gx-link" to="/creations">Tout voir →</Link></div>
          <div className="gx-pipe">
            {pipeCols.map((c) => (
              <div key={c.key} className="gx-col">
                <h3><i style={{ background: c.color }} />{c.label}<span className="gx-num">{frNumber(c.count)}</span></h3>
                {c.cards.length > 0 ? c.cards : <div className="gx-cnone">Aucune</div>}
              </div>
            ))}
          </div>
        </section>

        <section className="gx-sec" aria-labelledby="h-camp">
          <div className="gx-sh"><h2 id="h-camp">Campagnes en ligne</h2><small>7 derniers jours</small><Link className="gx-link" to="/performance">Performance →</Link></div>
          {!metaConnected || campaignRows.length === 0 ? (
            <div className="gx-empty">
              <b>{metaConnected ? "Aucune campagne active sur les 7 derniers jours" : "Aucune campagne Meta connectée"}</b>
              <span>{metaConnected ? "Lance une campagne pour suivre ici sa dépense, ses leads et son coût par lead." : "Connecte Meta pour voir tes campagnes ici."}</span>
              {metaConnected && <Link to="/campaigns/new" className="gx-btn gx-sm">Nouvelle campagne</Link>}
            </div>
          ) : (
            <div className="gx-tbl">
              <table>
                <thead><tr><th>Campagne</th><th>Statut</th><th>Tendance</th><th>Dépense</th><th>{wordPlural.charAt(0).toUpperCase() + wordPlural.slice(1)}</th><th>Coût / {word}</th><th>CTR</th></tr></thead>
                <tbody>
                  {campaignRows.map((c) => {
                    const st = campaignStatus(c);
                    const t = c.totals ?? {};
                    const series: number[] = ((c.series as any[]) ?? []).map((d: any) => Number((t.results ?? 0) > 0 ? d?.results : d?.spend) || 0);
                    return (
                      <tr key={c.id}>
                        <td><b>{c.name}</b><small>{c.accountName ?? ""}</small></td>
                        <td><span className={`gx-st ${st.cls}`}>{st.label}</span></td>
                        <td><Spark values={series} /></td>
                        <td className="gx-num">{frMoney(t.spend ?? 0)}</td>
                        <td className="gx-num">{t.results ? frNumber(t.results) : "—"}</td>
                        <td className="gx-num">{t.results ? frMoney(t.cost_per_result ?? t.spend / t.results) : "—"}</td>
                        <td className="gx-num">{t.impressions ? frPercent(t.ctr ?? 0) : "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      <aside className="gx-insp" aria-label="Détail de la création">
        <div className="gx-insp-h"><small>Création sélectionnée</small><div className="gx-sp" />{selected && <small className="gx-num">#{String(selected.id).slice(0, 6).toUpperCase()}</small>}</div>
        {!selected ? (
          <div className="gx-insp-b">
            <div className="gx-empty">
              <b>Aucune création pour le moment</b>
              <span>Décris ta pub dans la zone de saisie : la création apparaîtra ici.</span>
              <button type="button" className="gx-btn gx-pri gx-sm" onClick={() => void startChat()} disabled={chatBusy}>Créer ma première pub</button>
            </div>
          </div>
        ) : (
          <>
            <div className="gx-prev">
              {selIsVideo && selected.generated_url ? (
                <video key={selected.id} src={selected.generated_url} muted loop playsInline autoPlay preload="metadata" />
              ) : adThumb(selected) ? (
                <img src={adThumb(selected)!} alt="Aperçu de la création" />
              ) : null}
              <span className="gx-fmt">{selected.aspect_ratio || typeLabel(selected)}</span>
            </div>
            <div className="gx-insp-b">
              <div>
                <h4>{selected.title || "Sans titre"}</h4>
                <div className="gx-meta">
                  {[
                    selIsVideo && selected.duration ? `Vidéo ${Math.round(selected.duration)} s` : typeLabel(selected),
                    selected.stock_actor?.name ? `acteur ${selected.stock_actor.name}` : null,
                    new Date(selected.created_at).toLocaleDateString("fr-FR"),
                  ].filter(Boolean).join(" · ")}
                </div>
              </div>
              <div className="gx-vers" role="group" aria-label="Versions">
                {versions.map((v, i) => (
                  <button key={v.id} type="button" aria-pressed={v.id === selected.id} onClick={() => setSelectedId(v.id)}>
                    {v.version_label || (i === 0 ? "Originale" : `Version ${i + 1}`)}
                  </button>
                ))}
              </div>
              <div className="gx-kpis">
                <div><small>Statut</small><b>{AD_STATUS_LABEL[selStatus!]}</b></div>
                <div title="Bientôt disponible"><small>Coût</small><b className="gx-soon">Bientôt</b></div>
                <div title="Bientôt disponible"><small>Score hook</small><b className="gx-soon">Bientôt</b></div>
              </div>
              <div className="gx-acts">
                <button type="button" className="gx-act gx-pri" onClick={() => void publish()} disabled={!selReady || publishing}>
                  {publishing ? "Préparation…" : "Publier sur Meta"}
                </button>
                <button type="button" className="gx-act" disabled={!selIsVideo || !selReady}
                  title={selIsVideo ? undefined : "Disponible pour les vidéos"}
                  onClick={() => selected.generated_url && setCropping({ id: selected.id, url: selected.generated_url })}>Décliner en 1:1</button>
                <button type="button" className="gx-act" disabled={!selIsVideo || !selReady || chatBusy}
                  title={selIsVideo ? undefined : "Disponible pour les vidéos"}
                  onClick={() => void extend()}>Continuer +8 s</button>
              </div>
              <div>
                <div className="gx-lh">Derniers leads <Link to="/resultats"><small>Tout le mini CRM →</small></Link></div>
                <div className="gx-leads">
                  {leadRows.length === 0 ? (
                    <div className="gx-lead"><span className="gx-av">—</span><div><b>Pas encore de lead</b><small>Ils arrivent ici dès qu'une pub en reçoit.</small></div><span /></div>
                  ) : leadRows.slice(0, 3).map((l) => {
                    const st = statusMap.get(l.status);
                    const kind = LEAD_KIND[l.status];
                    const label = st?.label ?? LEAD_LABEL[l.status] ?? l.status;
                    const platform = l.platform ? PLATFORM[String(l.platform).toLowerCase()] ?? l.platform : "Meta";
                    const ad = l.meta_ad_name ?? l.ads?.title ?? l.meta_campaign_name ?? l.marketing_campaigns?.name;
                    return (
                      <Link key={l.id} to="/resultats" className="gx-lead">
                        <span className="gx-av">{leadInitials(l.full_name, l.email)}</span>
                        <div><b>{l.full_name || l.email || "Lead sans nom"}</b><small>{[ad, platform].filter(Boolean).join(" · ")}</small></div>
                        <span className={`gx-st ${kind ?? ""}`} style={kind ? undefined : { color: st?.color, background: `color-mix(in srgb, ${st?.color ?? "#888"} 14%, transparent)` }}>{label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </>
        )}
      </aside>

      <BudgetIncreaseDialog
        campaignId={budgetTarget?.id ?? null}
        campaignName={budgetTarget?.name ?? null}
        open={!!budgetTarget}
        onOpenChange={(o) => { if (!o) setBudgetTarget(null); }}
      />
      {cropping && (
        <CropVideoDialog
          open={!!cropping}
          onOpenChange={(o) => { if (!o) { setCropping(null); void qc.invalidateQueries({ queryKey: ["ads"] }); } }}
          adId={cropping.id}
          videoUrl={cropping.url}
        />
      )}
    </div>
  );
}
