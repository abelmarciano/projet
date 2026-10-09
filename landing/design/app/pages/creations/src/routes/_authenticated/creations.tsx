import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { forceDownload } from "@/lib/utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type ReactNode, type SyntheticEvent } from "react";
import {
  Download, Loader2, Trash2, Plus, AlertCircle, Megaphone, Wand2, Folder,
  Pencil, FolderInput, Clapperboard, Copy, Captions, Crop, Eye,
  User as UserIcon, Languages, Gauge, MessageSquare, RefreshCw, Combine,
} from "lucide-react";
import { TrimVideoDialog } from "@/components/TrimVideoDialog";
import { SubtitlesDialog } from "@/components/SubtitlesDialog";
import { SplitVideoDialog } from "@/components/SplitVideoDialog";
import { ConcatVideosDialog } from "@/components/ConcatVideosDialog";
import { CropVideoDialog } from "@/components/CropVideoDialog";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { GxButton } from "@/components/ui/gx-controls";
import { VideoPoster } from "@/components/VideoPoster";
import { toast } from "sonner";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { listAds, listFolders, createFolder, renameFolder, deleteFolder, renameAd, moveAdsToFolder, importAd, buildCarouselFromAds, duplicateAd } from "@/lib/tram.functions";
import { refreshPendingAds, deleteAd, retryFailedAd, listFrenchVoices, previewFrenchVoice, regenerateAdVoice, regenerateAdSpeed, cancelAdGeneration } from "@/lib/fal.functions";
import { refreshPendingMediaAssets } from "@/lib/media-gen.functions";
import { UGC_FR_SPEED_FACTOR } from "@/lib/fal.constants";
import { friendlyGenerationError } from "@/lib/user-error";
import { createRevisionConversation, createMetaPublishConversation } from "@/lib/ad-conversations.functions";
import { getAdConversationLink } from "@/lib/ad-versions.functions";
import { OpenConversationButton } from "@/components/OpenConversationButton";
import { listBatches, deleteBatch, listWorkspaceBrands } from "@/lib/batch.functions";
import { useAppLanguage } from "@/lib/app-language";

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

/*
 * Mes créations : copie de la maquette validée (landing/design/app/views/creations.html),
 * classes gx- de src/styles/gx-console.css, branchée sur les vraies données.
 */

export const Route = createFileRoute("/_authenticated/creations")({
  head: () => ({ meta: [{ title: "Mes créations - growthity.ai" }] }),
  component: CreationsPage,
});

type FolderFilter = "all" | "none" | string;
type TypeFilter = "all" | "image" | "video" | "carousel";
type SourceFilter = "all" | "chat" | "batch" | "editor" | "import";
type SortMode = "recent" | "oldest" | "name" | "status";
type FrenchVoiceCatalog = { female: Array<{ id: string; name: string; notes?: string }>; male: Array<{ id: string; name: string; notes?: string }> };

// -------- helpers --------
const STATUS_RANK: Record<string, number> = { pending: 0, failed: 1, completed: 2, published: 3 };

type DerivedStatus = "pending" | "failed" | "ready" | "published";
function getDerivedStatus(ad: any): DerivedStatus {
  if (ad.status === "pending") return "pending";
  if (ad.status === "failed") return "failed";
  if (ad.status === "published") return "published";
  return "ready";
}

const STATUS_PILL: Record<DerivedStatus, { label: string; cls: string }> = {
  ready: { label: "Prête", cls: "gx-q" },
  published: { label: "Publiée", cls: "gx-on" },
  pending: { label: "En cours", cls: "gx-gen" },
  failed: { label: "Échec", cls: "gx-bad" },
};

const TYPE_TABS: { val: TypeFilter; label: string }[] = [
  { val: "all", label: "Tous" },
  { val: "image", label: "Images" },
  { val: "video", label: "Vidéos" },
  { val: "carousel", label: "Carrousels" },
];

const SOURCE_LABEL: Record<SourceFilter, string> = {
  all: "Toutes sources",
  chat: "Chat",
  batch: "Batch Studio",
  editor: "Éditeur vidéo",
  import: "Import",
};

const SORT_LABEL: Record<SortMode, string> = {
  recent: "Plus récent",
  oldest: "Plus ancien",
  name: "Nom A → Z",
  status: "Statut",
};

function effectiveAdOrigin(ad: any): "generated" | "imported" {
  if (ad?.trim_source_ad_id || ad?.processing_op) return "generated";
  return ad?.origin === "imported" ? "imported" : "generated";
}

/** Provenance affichée dans le filtre « Toutes sources ». */
function adSource(ad: any): Exclude<SourceFilter, "all"> {
  if (ad?.batch_id) return "batch";
  if (effectiveAdOrigin(ad) === "imported") return "import";
  // Versions retouchées (rognage, recadrage, sous-titres, découpe, vitesse).
  if (ad?.trim_source_ad_id || ad?.processing_op) return "editor";
  return "chat";
}

function typeLabel(ad: any) {
  return ad?.content_type === "video" ? "Vidéo" : ad?.content_type === "carousel" ? "Carrousel" : "Image";
}

/** Image affichée sur la carte (hors vidéo) : visuel généré, 1re slide, sinon référence. */
function stillOf(ad: any): string | null {
  if (ad?.content_type === "carousel") {
    const list = Array.isArray(ad?.generated_urls) ? ad.generated_urls : [];
    return (list[0] as string) ?? ad?.generated_url ?? null;
  }
  if (ad?.content_type !== "video" && ad?.generated_url) return ad.generated_url;
  return null;
}
/** Image de secours d'une vidéo (acteur ou image source) si la 1re image n'est pas lisible. */
function fallbackOf(ad: any): string | null {
  return ad?.stock_actor?.reference_image_url ?? ad?.source_image_urls?.[0] ?? null;
}

function formatShortDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}

function formatGenerationDuration(ms: number) {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  if (totalSec < 60) return `${totalSec}s`;
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  if (min < 10 && sec > 0) return `${min}m ${sec}s`;
  return `${min} min`;
}

function getGenerationProgress(contentType: string, ageMs: number) {
  const expectedMs = contentType === "video" ? 12 * 60 * 1000 : contentType === "carousel" ? 2 * 60 * 1000 : 60 * 1000;
  const stallMs = contentType === "video" ? 18 * 60 * 1000 : contentType === "carousel" ? 5 * 60 * 1000 : 3 * 60 * 1000;
  const safeAge = Math.max(0, ageMs);
  const progress = safeAge <= expectedMs
    ? Math.round((safeAge / expectedMs) * 86)
    : Math.min(98, 86 + Math.round(((safeAge - expectedMs) / Math.max(1, stallMs - expectedMs)) * 12));
  return {
    progress: Math.max(4, progress),
    remainingMs: Math.max(0, expectedMs - safeAge),
    overdue: safeAge > expectedMs,
    stalled: safeAge > stallMs,
  };
}

function generationStageLabel(ad: any) {
  if (ad.processing_op === "speedup" || (typeof ad.pipeline_stage === "string" && ad.pipeline_stage.startsWith("speedup"))) return "Finalisation accélérée…";
  if (typeof ad.pipeline_stage === "string" && ad.pipeline_stage.startsWith("tts")) return "Création de la voix…";
  if (typeof ad.pipeline_stage === "string" && ad.pipeline_stage.startsWith("lipsync")) return "Synchronisation vidéo…";
  if (ad.processing_op === "subtitles") return "Sous-titres en cours…";
  if (ad.processing_op === "trim") return "Rognage en cours…";
  if (ad.processing_op === "crop") return "Recadrage en cours…";
  if (ad.processing_op === "split") return "Découpage en cours…";
  return ad.content_type === "video" ? "Génération vidéo…" : ad.content_type === "carousel" ? "Génération carrousel…" : "Génération image…";
}

/* ---------- icônes de la maquette ---------- */
function Svg({ d, children }: { d?: string; children?: ReactNode }) {
  return (
    <svg className="gx-i" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {d ? <path d={d} /> : children}
    </svg>
  );
}
const IcUpload = () => <Svg d="M12 21V9m0 0-4 4m4-4 4 4M4 3h16" />;
const IcPlus = () => <Svg d="M12 5v14M5 12h14" />;
const IcSearch = () => <Svg><circle cx="11" cy="11" r="7" /><path d="m21 21-4.6-4.6" /></Svg>;
const IcChevron = () => <Svg d="m6 9 6 6 6-6" />;
const IcFolder = () => <Svg d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />;
const IcX = () => <Svg d="M6 6l12 12M18 6 6 18" />;
const IcMore = () => <Svg><circle cx="5" cy="12" r="1.2" /><circle cx="12" cy="12" r="1.2" /><circle cx="19" cy="12" r="1.2" /></Svg>;

function CreationsPage() {
  const { language } = useAppLanguage();
  const qc = useQueryClient();
  const router = useRouter();
  const fetchAds = useServerFn(listAds);
  const fetchFolders = useServerFn(listFolders);
  const createFolderFn = useServerFn(createFolder);
  const renameFolderFn = useServerFn(renameFolder);
  const deleteFolderFn = useServerFn(deleteFolder);
  const renameAdFn = useServerFn(renameAd);
  const moveAdsFn = useServerFn(moveAdsToFolder);
  const refresh = useServerFn(refreshPendingAds);
  const refreshMedia = useServerFn(refreshPendingMediaAssets);
  const remove = useServerFn(deleteAd);
  const retryFn = useServerFn(retryFailedAd);
  const [errorDialogAd, setErrorDialogAd] = useState<any | null>(null);
  const [retryingId, setRetryingId] = useState<string | null>(null);

  const handleRetry = async (adId: string) => {
    setRetryingId(adId);
    try {
      await retryFn({ data: { id: adId } });
      await qc.invalidateQueries({ queryKey: ["ads"] });
      setErrorDialogAd(null);
      toast.success("Génération relancée");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Impossible de relancer");
    } finally {
      setRetryingId(null);
    }
  };

  // Keep the library fresh after server-side edits (trim/crop/subtitles). The
  // previous long cache could keep showing an older trimmed clip/source.
  const ads = useQuery({
    queryKey: ["ads"],
    queryFn: async () => (await fetchAds()) ?? [],
    staleTime: 0,
    refetchOnWindowFocus: false,
    retry: 2,
  });
  const folders = useQuery({ queryKey: ["folders"], queryFn: () => fetchFolders(), staleTime: 5 * 60 * 1000, refetchOnWindowFocus: false });
  const adRows: any[] = (ads.data as any[]) ?? [];
  const folderRows: any[] = (folders.data as any[]) ?? [];

  const refreshingRef = useRef(false);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [trimming, setTrimming] = useState<{ id: string; url: string } | null>(null);
  const [subtitling, setSubtitling] = useState<{ id: string; url: string } | null>(null);
  const [splitting, setSplitting] = useState<{ id: string; title: string; url: string; folderId: string | null } | null>(null);
  const [cropping, setCropping] = useState<{ id: string; url: string } | null>(null);
  const [concatOpen, setConcatOpen] = useState(false);
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);
  const duplicateFn = useServerFn(duplicateAd);
  const [activeFolder, setActiveFolder] = useState<FolderFilter>("all");
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editingFolderName, setEditingFolderName] = useState("");
  const [editingAdId, setEditingAdId] = useState<string | null>(null);
  const [editingAdTitle, setEditingAdTitle] = useState("");
  const currentTrimAd = useMemo(
    () => trimming ? adRows.find((a: any) => a.id === trimming.id) ?? null : null,
    [adRows, trimming],
  );

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>("all");
  const [sortMode, setSortMode] = useState<SortMode>("recent");
  const [importing, setImporting] = useState(false);
  const [buildingCarousel, setBuildingCarousel] = useState(false);
  const importFn = useServerFn(importAd);
  const buildCarouselFn = useServerFn(buildCarouselFromAds);

  // Lots Batch Studio : regroupés en une carte par défaut, dépliables via ce
  // réglage mémorisé d'une visite à l'autre (dans le menu « Toutes sources »).
  const [showBatchAds, setShowBatchAds] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    try { setShowBatchAds(window.localStorage.getItem("creations:showBatchAds") === "1"); } catch { /* stockage indisponible */ }
  }, []);
  const setBatchMode = (next: boolean) => {
    setShowBatchAds(next);
    try { window.localStorage.setItem("creations:showBatchAds", next ? "1" : "0"); } catch { /* stockage indisponible */ }
  };
  const fetchBatches = useServerFn(listBatches);
  const batchList = useQuery({
    queryKey: ["batches-for-creations"],
    queryFn: () => fetchBatches(),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  const toggleSelect = (id: string) =>
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });

  const clearSelection = () => setSelectedIds(new Set());

  // ---- derived lists ----
  const filteredAds = useMemo(() => {
    let list = adRows;
    if (activeFolder === "none") list = list.filter((a: any) => !a.folder_id);
    else if (activeFolder !== "all") list = list.filter((a: any) => a.folder_id === activeFolder);

    if (typeFilter !== "all") list = list.filter((a: any) => a.content_type === typeFilter);
    if (sourceFilter !== "all") list = list.filter((a: any) => adSource(a) === sourceFilter);

    const q = search.trim().toLowerCase();
    if (q) list = list.filter((a: any) =>
      (a.title ?? "").toLowerCase().includes(q) || (a.prompt ?? "").toLowerCase().includes(q),
    );

    const sorted = [...list];
    if (sortMode === "recent") {
      sorted.sort((a: any, b: any) => +new Date(b.created_at) - +new Date(a.created_at));
    } else if (sortMode === "oldest") {
      sorted.sort((a: any, b: any) => +new Date(a.created_at) - +new Date(b.created_at));
    } else if (sortMode === "name") {
      sorted.sort((a: any, b: any) => String(a.title ?? "").localeCompare(String(b.title ?? ""), "fr", { sensitivity: "base" }));
    } else {
      sorted.sort((a: any, b: any) => (STATUS_RANK[a.status] ?? 9) - (STATUS_RANK[b.status] ?? 9));
    }
    return sorted;
  }, [adRows, activeFolder, typeFilter, sourceFilter, search, sortMode]);

  // Une carte par lot (mosaïque des 4 premiers visuels) au lieu de 26 vignettes.
  const batchCards = useMemo(() => {
    if (showBatchAds) return [];
    const groups = new Map<string, any[]>();
    for (const ad of filteredAds as any[]) {
      if (!ad.batch_id) continue;
      const list = groups.get(ad.batch_id) ?? [];
      list.push(ad);
      groups.set(ad.batch_id, list);
    }
    const titleById = new Map(
      ((batchList.data ?? []) as any[]).map((b) => [b.id as string, (b.title as string | null) || (b.pack_title as string | null) || "Lot de pubs"]),
    );
    return Array.from(groups.entries()).map(([batchId, list]) => {
      const sorted = [...list].sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
      return {
        batchId,
        title: titleById.get(batchId) ?? "Lot de pubs",
        count: sorted.length,
        createdAt: sorted[0]?.created_at as string,
        thumbnails: sorted.slice(0, 4).map((a) => (stillOf(a) ?? a.generated_url) as string).filter(Boolean),
        videos: sorted.slice(0, 4).map((a) => (a.content_type === "video" ? a.generated_url as string : null)),
        adIds: sorted.map((a) => a.id as string),
      };
    }).sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  }, [filteredAds, showBatchAds, batchList.data]);

  // Hiérarchie marque -> lot -> pubs.
  const fetchBrands = useServerFn(listWorkspaceBrands);
  const brandsQuery = useQuery({
    queryKey: ["brands-for-creations"],
    queryFn: () => fetchBrands() as Promise<any[]>,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
  const [openBrandId, setOpenBrandId] = useState<string | null>(null);

  const brandOfBatch = useMemo(
    () => new Map(((batchList.data ?? []) as any[]).map((b) => [b.id as string, (b.brand_id as string | null) ?? "none"])),
    [batchList.data],
  );
  const brandNames = useMemo(
    () => new Map(((brandsQuery.data ?? []) as any[]).map((b) => [b.id as string, b.name as string])),
    [brandsQuery.data],
  );

  const brandCards = useMemo(() => {
    const groups = new Map<string, typeof batchCards>();
    for (const card of batchCards) {
      const key = brandOfBatch.get(card.batchId) ?? "none";
      const list = groups.get(key) ?? [];
      list.push(card);
      groups.set(key, list);
    }
    return Array.from(groups.entries())
      .map(([brandId, list]) => ({
        brandId,
        name: brandId === "none" ? "Sans dossier" : (brandNames.get(brandId) ?? "Dossier"),
        batches: list,
        count: list.reduce((n, b) => n + b.count, 0),
        createdAt: list[0]?.createdAt as string,
        thumbnails: list.flatMap((b) => b.thumbnails).slice(0, 4),
      }))
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  }, [batchCards, brandOfBatch, brandNames]);

  const openBrand = openBrandId ? brandCards.find((b) => b.brandId === openBrandId) ?? null : null;
  const shownBatchCards = openBrand ? openBrand.batches : [];

  const visibleAds = useMemo(
    () => (showBatchAds ? filteredAds : (filteredAds as any[]).filter((a) => !a.batch_id)),
    [filteredAds, showBatchAds],
  );

  const folderCounts = useMemo(() => {
    const map = new Map<string, number>();
    let none = 0;
    for (const a of adRows) {
      if (a.folder_id) map.set(a.folder_id, (map.get(a.folder_id) ?? 0) + 1);
      else none++;
    }
    return { map, none, total: adRows.length };
  }, [adRows]);

  const pendingCount = adRows.filter((a) => a.status === "pending").length;
  const processingCount = adRows.filter((a: any) => a.processing_status === "processing").length;

  // ---- navigation ----
  const createMetaPublishFn = useServerFn(createMetaPublishConversation);
  const [publishingId, setPublishingId] = useState<string | null>(null);

  // Ouvre le chat en mode publication Meta avec la (les) création(s) en contexte.
  const openMetaPublishChat = async (adIds: string[], key: string) => {
    if (publishingId) return;
    if (adIds.length === 0) { toast.error("Sélectionnez au moins une création"); return; }
    setPublishingId(key);
    try {
      const row = await createMetaPublishFn({ data: { adIds, uiLanguage: language } });
      await qc.invalidateQueries({ queryKey: ["ad-conversations"] });
      await router.navigate({
        to: "/create",
        search: { c: (row as { id: string }).id, start: "meta" } as never,
      });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Impossible d'ouvrir la publication Meta.");
    } finally {
      setPublishingId(null);
    }
  };

  // Une création qui a déjà sa discussion y retourne (jamais de nouvelle conversation).
  const getConvLink = useServerFn(getAdConversationLink);
  const openExistingConversation = async (adId: string): Promise<boolean> => {
    try {
      const link = await getConvLink({ data: { adId } });
      if (!link.conversationId) return false;
      await router.navigate({ to: "/create", search: { c: link.conversationId, focus: link.anchorAdId ?? adId } as never });
      return true;
    } catch {
      return false;
    }
  };
  // Si la création a déjà une discussion, on propose le choix : y retourner
  // ou ouvrir une nouvelle discussion dédiée à la publication Meta.
  const [publishChoice, setPublishChoice] = useState<{ adId: string; conversationId: string; anchorAdId: string } | null>(null);
  const publishOne = (adId: string) => {
    void (async () => {
      try {
        const link = await getConvLink({ data: { adId } });
        if (link.conversationId) {
          setPublishChoice({ adId, conversationId: link.conversationId, anchorAdId: link.anchorAdId ?? adId });
          return;
        }
      } catch { /* pas de discussion : on continue */ }
      await openMetaPublishChat([adId], adId);
    })();
  };
  const continueToCampaign = () => {
    const ids = Array.from(selectedIds);
    // Une seule création : même parcours que depuis la carte (choix de la discussion).
    if (ids.length === 1) { publishOne(ids[0]!); return; }
    void openMetaPublishChat(ids, "bulk");
  };

  // Suppression d'un lot entier (pubs incluses) depuis la carte de lot.
  const deleteBatchFn = useServerFn(deleteBatch);
  const handleDeleteBatch = async (batchId: string, title: string) => {
    if (!window.confirm(`Supprimer le lot « ${title} » et toutes ses pubs ?`)) return;
    try {
      await deleteBatchFn({ data: { id: batchId } });
      toast.success("Lot supprimé");
      await Promise.all([ads.refetch(), batchList.refetch()]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Suppression impossible");
    }
  };

  const createRevisionFn = useServerFn(createRevisionConversation);
  const [revisingAdId, setRevisingAdId] = useState<string | null>(null);

  const reviseAd = async (ad: { id: string; title: string }) => {
    if (revisingAdId) return;
    setRevisingAdId(ad.id);
    try {
      // Nettoie l'ancien prefill wizard : on ouvre désormais le chat
      // /create avec la création déjà chargée en carte.
      try { sessionStorage.removeItem("tram:create-prefill"); } catch { /* noop */ }
      if (await openExistingConversation(ad.id)) return;
      const row = await createRevisionFn({ data: { adId: ad.id, uiLanguage: language } });
      router.navigate({ to: "/create", search: { c: (row as { id: string }).id } as never });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Impossible d'ouvrir la conversation");
    } finally {
      setRevisingAdId(null);
    }
  };

  // ---- rafraîchissement automatique (le bouton « Actualiser » a été retiré) ----
  const doRefresh = async (silent = false) => {
    if (refreshingRef.current) return;
    refreshingRef.current = true;
    try {
      const res = await refresh({}).catch((err) => { if (silent) return null; throw err; });
      // Les médias générés par l'assistant (avatar parlant, doublage…) vivent
      // dans une autre table : on rafraîchit leur statut en même temps.
      const resMedia = await refreshMedia({}).catch(() => null);
      if (!res) return;
      const hasChanged = res.updated > 0 || res.failed > 0 || (resMedia?.updated ?? 0) > 0 || (resMedia?.failed ?? 0) > 0;
      if (hasChanged) await qc.invalidateQueries({ queryKey: ["ads"] });
      if (!silent && res.updated > 0) toast.success(`${res.updated} vidéo(s) récupérée(s) !`);
      else if (!silent) toast.info(`${res.stillPending} en cours, ${res.failed} échec(s)`);
    } catch (err) {
      if (!silent) toast.error(err instanceof Error ? err.message : "Erreur");
    } finally {
      refreshingRef.current = false;
    }
  };

  useEffect(() => {
    if (pendingCount === 0) return;
    // On ne sollicite le serveur que si l'onglet est réellement visible.
    const t = setInterval(() => { if (!document.hidden) doRefresh(true); }, 8000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingCount]);

  useEffect(() => {
    if (!ads.isSuccess || pendingCount === 0) return;
    doRefresh(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ads.isSuccess, pendingCount]);

  // Poll to pick up Creatomate webhook results while ads are being processed.
  useEffect(() => {
    if (processingCount === 0) return;
    const t = setInterval(() => {
      if (!document.hidden) void qc.invalidateQueries({ queryKey: ["ads"] });
    }, 5000);
    return () => clearInterval(t);
  }, [processingCount, qc]);

  // ---- mutations ----
  const onDelete = async (id: string) => {
    if (!confirm("Supprimer cette création ?")) return;
    try { await remove({ data: { id } }); await qc.invalidateQueries({ queryKey: ["ads"] }); toast.success("Supprimé"); }
    catch (err) { toast.error(err instanceof Error ? err.message : "Erreur"); }
  };

  const handleCreateFolder = async () => {
    const name = newFolderName.trim();
    if (!name) return;
    try {
      const f: any = await createFolderFn({ data: { name } });
      await qc.invalidateQueries({ queryKey: ["folders"] });
      setNewFolderName(""); setCreatingFolder(false);
      if (f?.id) setActiveFolder(f.id);
      toast.success("Dossier créé");
    } catch (err) { toast.error(err instanceof Error ? err.message : "Erreur"); }
  };

  const handleRenameFolder = async (id: string) => {
    const name = editingFolderName.trim();
    if (!name) { setEditingFolderId(null); return; }
    try { await renameFolderFn({ data: { id, name } }); await qc.invalidateQueries({ queryKey: ["folders"] }); setEditingFolderId(null); }
    catch (err) { toast.error(err instanceof Error ? err.message : "Erreur"); }
  };

  const handleDeleteFolder = async (id: string, name: string) => {
    if (!confirm(`Supprimer le dossier « ${name} » ? Les créations qu'il contient ne seront pas supprimées.`)) return;
    try {
      await deleteFolderFn({ data: { id } });
      await Promise.all([
        qc.invalidateQueries({ queryKey: ["folders"] }),
        qc.invalidateQueries({ queryKey: ["ads"] }),
      ]);
      if (activeFolder === id) setActiveFolder("all");
      toast.success("Dossier supprimé");
    } catch (err) { toast.error(err instanceof Error ? err.message : "Erreur"); }
  };

  const startRenameAd = (id: string, title: string) => { setEditingAdId(id); setEditingAdTitle(title); };

  const commitRenameAd = async () => {
    if (!editingAdId) return;
    const title = editingAdTitle.trim();
    const original = adRows.find((a) => a.id === editingAdId)?.title;
    setEditingAdId(null);
    if (!title || title === original) return;
    try { await renameAdFn({ data: { id: editingAdId, title } }); await qc.invalidateQueries({ queryKey: ["ads"] }); }
    catch (err) { toast.error(err instanceof Error ? err.message : "Erreur"); }
  };

  const handleMoveAd = async (adIds: string[], folderId: string | null) => {
    try { await moveAdsFn({ data: { adIds, folderId } }); await qc.invalidateQueries({ queryKey: ["ads"] }); toast.success(folderId ? "Déplacé" : "Retiré du dossier"); }
    catch (err) { toast.error(err instanceof Error ? err.message : "Erreur"); }
  };

  const handleBulkMove = async (folderId: string | null) => {
    if (selectedIds.size === 0) return;
    await handleMoveAd(Array.from(selectedIds), folderId);
    clearSelection();
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Supprimer ${selectedIds.size} création(s) ?`)) return;
    try {
      for (const id of selectedIds) await remove({ data: { id } });
      await qc.invalidateQueries({ queryKey: ["ads"] });
      toast.success("Supprimé"); clearSelection();
    } catch (err) { toast.error(err instanceof Error ? err.message : "Erreur"); }
  };

  const handleImportFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const files = Array.from(fileList).slice(0, 10);
    setImporting(true);
    try {
      const payload = await Promise.all(files.map(async (file) => {
        if (file.size > 45 * 1024 * 1024) throw new Error(`${file.name} dépasse 45 Mo`);
        const kind: "image" | "video" = file.type.startsWith("video/") ? "video" : "image";
        const dataUrl: string = await new Promise((resolve, reject) => {
          const r = new FileReader();
          r.onload = () => resolve(r.result as string);
          r.onerror = () => reject(new Error("Lecture du fichier impossible"));
          r.readAsDataURL(file);
        });
        const cleanTitle = file.name.replace(/\.[^.]+$/, "").slice(0, 80) || "Import";
        return { title: cleanTitle, mime: file.type || (kind === "video" ? "video/mp4" : "image/jpeg"), dataUrl, kind };
      }));
      const folderId = activeFolder !== "all" && activeFolder !== "none" ? activeFolder : null;
      const res: any = await importFn({ data: { files: payload, folderId } });
      await qc.invalidateQueries({ queryKey: ["ads"] });
      toast.success(`${res.count} fichier(s) importé(s)`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur d'import");
    } finally {
      setImporting(false);
    }
  };

  // ---- carousel assembly from selected images ----
  const selectedImageIds = useMemo(() => {
    const ready = new Set(adRows.filter((a: any) =>
      selectedIds.has(a.id) &&
      a.content_type === "image" &&
      (a.status === "completed" || a.status === "published"),
    ).map((a: any) => a.id as string));
    return Array.from(selectedIds).filter((id) => ready.has(id));
  }, [adRows, selectedIds]);

  const canBuildCarousel = selectedImageIds.length >= 2 && selectedImageIds.length <= 10;

  const handleBuildCarousel = async () => {
    if (!canBuildCarousel) {
      toast.error("Sélectionne entre 2 et 10 images prêtes");
      return;
    }
    setBuildingCarousel(true);
    try {
      const folderId = activeFolder !== "all" && activeFolder !== "none" ? activeFolder : null;
      await buildCarouselFn({ data: { adIds: selectedImageIds, folderId } });
      await qc.invalidateQueries({ queryKey: ["ads"] });
      clearSelection();
      setTypeFilter("carousel");
      toast.success("Carrousel créé - prêt pour Meta");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur");
    } finally {
      setBuildingCarousel(false);
    }
  };

  // ---- selected videos (for concat) ----
  const selectedVideos = useMemo(() => {
    return adRows.filter((a: any) =>
      selectedIds.has(a.id) &&
      a.content_type === "video" &&
      a.generated_url &&
      (a.status === "completed" || a.status === "published"),
    );
  }, [adRows, selectedIds]);
  const canConcat = selectedVideos.length === 2;

  const handleDuplicate = async (adId: string) => {
    setDuplicatingId(adId);
    try {
      await duplicateFn({ data: { adId } });
      await qc.invalidateQueries({ queryKey: ["ads"] });
      toast.success("Création dupliquée");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Échec de la duplication");
    } finally {
      setDuplicatingId(null);
    }
  };

  /* ---------- colonne Dossiers ---------- */
  const pickFolder = (id: FolderFilter) => { setActiveFolder(id); setOpenBrandId(null); };
  const folderKey = (id: FolderFilter) => (e: ReactKeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pickFolder(id); }
  };

  const folderRow = (id: FolderFilter, label: string, count: number, real: boolean) => {
    const active = activeFolder === id;
    if (real && editingFolderId === id) {
      return (
        <div key={id} className="gx-cr-fr">
          <input
            autoFocus
            className="gx-in"
            aria-label="Nouveau nom du dossier"
            value={editingFolderName}
            onChange={(e) => setEditingFolderName(e.target.value)}
            onBlur={() => handleRenameFolder(id)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleRenameFolder(id);
              if (e.key === "Escape") setEditingFolderId(null);
            }}
          />
        </div>
      );
    }
    return (
      <div key={id} className="gx-cr-fr">
        <a
          role="button"
          tabIndex={0}
          className={active ? "gx-on" : undefined}
          aria-current={active ? "true" : undefined}
          onClick={() => pickFolder(id)}
          onKeyDown={folderKey(id)}
        >
          {real && <IcFolder />}{label} <em>{count}</em>
        </a>
        {real && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button type="button" className="gx-cr-fm" aria-label={`Options du dossier ${label}`}><IcMore /></button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="console-app-portal w-40">
              <DropdownMenuItem onClick={() => { setEditingFolderId(id); setEditingFolderName(label); }}>
                <Pencil className="mr-2 h-3.5 w-3.5" />Renommer
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteFolder(id, label)}>
                <Trash2 className="mr-2 h-3.5 w-3.5" />Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    );
  };

  const newFolderInput = creatingFolder && (
    <div className="gx-cr-fr">
      <input
        autoFocus
        className="gx-in"
        placeholder="Nom du dossier"
        aria-label="Nom du nouveau dossier"
        value={newFolderName}
        onChange={(e) => setNewFolderName(e.target.value)}
        onBlur={() => { if (!newFolderName.trim()) setCreatingFolder(false); }}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleCreateFolder();
          if (e.key === "Escape") { setCreatingFolder(false); setNewFolderName(""); }
        }}
      />
    </div>
  );

  const picking = selectedIds.size > 0;
  const nSel = selectedIds.size;

  /* ---------- rendu ---------- */
  return (
    <div className="gx-page">
      <div className="gx-ph">
        <div>
          <h1>Mes créations</h1>
          <p>Retrouve, organise et publie tes publicités.</p>
        </div>
        <div className="gx-pa">
          <label className="gx-btn" aria-busy={importing || undefined} style={importing ? { opacity: 0.6, pointerEvents: "none" } : undefined}>
            {importing ? <Loader2 className="gx-i animate-spin" /> : <IcUpload />}{importing ? "Import…" : "Importer"}
            <input
              type="file"
              accept="image/*,video/*"
              multiple
              hidden
              onChange={(e) => { handleImportFiles(e.target.files); e.currentTarget.value = ""; }}
            />
          </label>
          <Link to="/create" className="gx-btn gx-pri"><IcPlus />Nouvelle publicité</Link>
        </div>
      </div>

      <div className="gx-bar-f">
        <label className="gx-srch gx-grow">
          <IcSearch />
          <span className="gx-sr">Rechercher par nom…</span>
          <input type="search" placeholder="Rechercher par nom…" autoComplete="off" value={search} onChange={(e) => setSearch(e.target.value)} />
        </label>
        <div className="gx-seg" role="tablist" aria-label="Type de création">
          {TYPE_TABS.map((t) => (
            <button key={t.val} type="button" role="tab" aria-selected={typeFilter === t.val} onClick={() => setTypeFilter(t.val)}>{t.label}</button>
          ))}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button type="button" className={sourceFilter !== "all" ? "gx-sel gx-set" : "gx-sel"} aria-haspopup="menu">
              <span>{SOURCE_LABEL[sourceFilter]}</span><IcChevron />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="console-app-portal w-60">
            {(Object.keys(SOURCE_LABEL) as SourceFilter[]).map((k) => (
              <DropdownMenuItem key={k} onClick={() => { setSourceFilter(k); setOpenBrandId(null); }}>
                {SOURCE_LABEL[k]}{sourceFilter === k && <span className="ml-auto" aria-hidden>✓</span>}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs">Lots Batch Studio</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => setBatchMode(false)}>
              Regroupés par lot{!showBatchAds && <span className="ml-auto" aria-hidden>✓</span>}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => { setBatchMode(true); setOpenBrandId(null); }}>
              Une carte par pub{showBatchAds && <span className="ml-auto" aria-hidden>✓</span>}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button type="button" className="gx-sel" aria-haspopup="menu">
              <span>{SORT_LABEL[sortMode]}</span><IcChevron />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="console-app-portal w-44">
            {(Object.keys(SORT_LABEL) as SortMode[]).map((k) => (
              <DropdownMenuItem key={k} onClick={() => setSortMode(k)}>
                {SORT_LABEL[k]}{sortMode === k && <span className="ml-auto" aria-hidden>✓</span>}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="gx-cr-l">
        <nav className="gx-cr-f" aria-label="Dossiers">
          <div className="gx-lbl gx-cr-fh">
            Dossiers
            <button type="button" className="gx-cr-fm" aria-label="Nouveau dossier" title="Nouveau dossier" onClick={() => setCreatingFolder((v) => !v)}><IcPlus /></button>
          </div>
          {folderRow("all", "Toutes", folderCounts.total, false)}
          {folderRow("none", "Sans dossier", folderCounts.none, false)}
          {folderRows.map((f: any) => folderRow(f.id, f.name, folderCounts.map.get(f.id) ?? 0, true))}
          {newFolderInput}
          {!creatingFolder && (
            <div className="gx-cr-fr gx-cr-add">
              <a role="button" tabIndex={0} onClick={() => setCreatingFolder(true)} onKeyDown={(e) => { if (e.key === "Enter") setCreatingFolder(true); }}>
                <IcPlus />Nouveau dossier
              </a>
            </div>
          )}
        </nav>

        <div>
          {ads.isLoading ? (
            <div className="gx-cgrid" aria-busy="true" aria-label="Chargement des créations">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="gx-ccard gx-cskel">
                  <span className="gx-cm" />
                  <div><b>Chargement…</b></div>
                </div>
              ))}
            </div>
          ) : ads.isError ? (
            <div className="gx-empty">
              <b>Impossible de charger tes créations</b>
              <p>Elles sont toujours là, la connexion a échoué. Réessaie dans un instant.</p>
              <button type="button" className="gx-btn gx-sm gx-pri" onClick={() => void ads.refetch()}>Réessayer</button>
            </div>
          ) : adRows.length === 0 ? (
            <div className="gx-empty">
              <b>Rien ici pour l'instant</b>
              <p>Crée ta première pub dans le chat, elle apparaîtra ici.</p>
              <Link to="/create" className="gx-btn gx-sm gx-pri">Créer une pub</Link>
            </div>
          ) : visibleAds.length === 0 && brandCards.length === 0 ? (
            <div className="gx-empty">
              <b>Aucune création ne correspond à ces filtres</b>
              <p>Change de dossier, de type ou de source pour retrouver tes pubs.</p>
            </div>
          ) : (
            <>
              {openBrand && (
                <div className="gx-cr-back">
                  <button type="button" className="gx-btn gx-sm" onClick={() => setOpenBrandId(null)}>← Tous les lots · {openBrand.name}</button>
                </div>
              )}
              <div className={picking ? "gx-cgrid gx-picking" : "gx-cgrid"}>
                {!openBrand && brandCards.map((brand) => (
                  <div
                    key={brand.brandId}
                    className="gx-ccard"
                    tabIndex={0}
                    role="button"
                    aria-label={`Ouvrir les lots · ${brand.name}`}
                    onClick={() => setOpenBrandId(brand.brandId)}
                    onKeyDown={(e) => { if (e.key === "Enter") setOpenBrandId(brand.brandId); }}
                  >
                    <span className="gx-cm gx-mos">
                      {brand.thumbnails.slice(0, 4).map((src, i) => <img key={i} src={src} alt="" loading="lazy" />)}
                    </span>
                    <span className="gx-ty">Lots</span>
                    <div>
                      <b title={brand.name}>{brand.name}</b>
                      <small>{brand.batches.length} lot{brand.batches.length > 1 ? "s" : ""} · {brand.count} pub{brand.count > 1 ? "s" : ""}</small>
                    </div>
                  </div>
                ))}
                {shownBatchCards.map((b) => (
                  <BatchGroupCard
                    key={b.batchId}
                    batch={b}
                    publishing={publishingId === `batch:${b.batchId}`}
                    onOpen={() => void router.navigate({ to: "/batch/$id", params: { id: b.batchId } as never, search: { step: "grid" } as never })}
                    onPublish={() => void openMetaPublishChat(b.adIds, `batch:${b.batchId}`)}
                    onDelete={() => void handleDeleteBatch(b.batchId, b.title)}
                  />
                ))}
                {(openBrand ? [] : visibleAds).map((ad: any) => (
                  <CreationCard
                    key={ad.id}
                    ad={ad}
                    batchBadge={Boolean(ad.batch_id)}
                    folderName={folderRows.find((f: any) => f.id === ad.folder_id)?.name}
                    folders={folderRows}
                    selected={selectedIds.has(ad.id)}
                    picking={picking}
                    onToggleSelect={() => toggleSelect(ad.id)}
                    editingTitle={editingAdId === ad.id}
                    editingTitleValue={editingAdTitle}
                    setEditingTitleValue={setEditingAdTitle}
                    startRenameAd={startRenameAd}
                    commitRenameAd={commitRenameAd}
                    cancelRename={() => setEditingAdId(null)}
                    onPublish={() => publishOne(ad.id)}
                    onRevise={() => reviseAd(ad)}
                    onTrim={(url) => setTrimming({ id: ad.id, url })}
                    onSubtitles={(url) => setSubtitling({ id: ad.id, url })}
                    onSplit={(url) => setSplitting({ id: ad.id, title: ad.title, url, folderId: ad.folder_id ?? null })}
                    onCrop={(url) => setCropping({ id: ad.id, url })}
                    onDuplicate={() => handleDuplicate(ad.id)}
                    duplicating={duplicatingId === ad.id}
                    onMove={handleMoveAd}
                    onDelete={onDelete}
                    onShowError={() => setErrorDialogAd(ad)}
                    onRetry={() => handleRetry(ad.id)}
                    retrying={retryingId === ad.id}
                    onVoiceStarted={() => { void qc.invalidateQueries({ queryKey: ["ads"] }); }}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Barre de sélection flottante */}
      {picking && (
        <div className="gx-selbar" role="toolbar" aria-label="Actions sur la sélection">
          <b>{nSel} {nSel > 1 ? "sélectionnées" : "sélectionnée"}</b>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button type="button" className="gx-btn gx-sm">Déplacer</button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" side="top" className="console-app-portal w-52">
              <DropdownMenuItem onClick={() => handleBulkMove(null)}>
                <FolderInput className="mr-2 h-3.5 w-3.5" />Sans dossier
              </DropdownMenuItem>
              {folderRows.map((f: any) => (
                <DropdownMenuItem key={f.id} onClick={() => handleBulkMove(f.id)}>
                  <Folder className="mr-2 h-3.5 w-3.5" />{f.name}
                </DropdownMenuItem>
              ))}
              {folderRows.length === 0 && (
                <DropdownMenuItem disabled>Crée d'abord un dossier</DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          <button
            type="button"
            className="gx-btn gx-sm"
            onClick={handleBuildCarousel}
            disabled={!canBuildCarousel || buildingCarousel}
            title={canBuildCarousel ? "Assembler un carrousel Meta" : "Sélectionne 2 à 10 images prêtes"}
          >
            {buildingCarousel && <Loader2 className="gx-i animate-spin" />}
            Créer un carrousel{selectedImageIds.length >= 2 ? ` (${selectedImageIds.length})` : ""}
          </button>
          {canConcat && (
            <button type="button" className="gx-btn gx-sm" onClick={() => setConcatOpen(true)} title="Assembler les 2 vidéos bout à bout">
              <Combine className="gx-i" />Assembler (2)
            </button>
          )}
          <button type="button" className="gx-btn gx-sm" onClick={handleBulkDelete}>Supprimer</button>
          <button type="button" className="gx-btn gx-sm gx-pri" onClick={continueToCampaign} disabled={!!publishingId}>
            {publishingId === "bulk" && <Loader2 className="gx-i animate-spin" />}
            {nSel > 1 ? "Publier en lot" : "Publier sur Meta"}
          </button>
          <button type="button" className="gx-ib gx-sm" aria-label="Annuler la sélection" onClick={clearSelection}><IcX /></button>
        </div>
      )}

      {trimming && (
        <TrimVideoDialog
          open={!!trimming}
          onOpenChange={(v) => !v && setTrimming(null)}
          adId={trimming.id}
          adTitle={currentTrimAd?.title}
          videoUrl={currentTrimAd?.generated_url ?? trimming.url}
          folderId={currentTrimAd?.folder_id ?? null}
          onCreated={() => {
            void qc.invalidateQueries({ queryKey: ["ads"] });
          }}
        />
      )}
      {subtitling && (
        <SubtitlesDialog
          open={!!subtitling}
          onOpenChange={(v) => !v && setSubtitling(null)}
          adId={subtitling.id}
          videoUrl={subtitling.url}
        />
      )}
      {splitting && (
        <SplitVideoDialog
          open={!!splitting}
          onOpenChange={(v) => !v && setSplitting(null)}
          adId={splitting.id}
          adTitle={splitting.title}
          videoUrl={splitting.url}
          folderId={splitting.folderId}
        />
      )}
      {concatOpen && canConcat && (
        <ConcatVideosDialog
          open={concatOpen}
          onOpenChange={setConcatOpen}
          clips={selectedVideos.slice(0, 2).map((a: any) => ({ id: a.id, title: a.title, url: a.generated_url }))}
          folderId={activeFolder !== "all" && activeFolder !== "none" ? activeFolder : null}
          onDone={clearSelection}
        />
      )}
      {cropping && (
        <CropVideoDialog
          open={!!cropping}
          onOpenChange={(v) => { if (!v) { setCropping(null); void qc.invalidateQueries({ queryKey: ["ads"] }); } }}
          adId={cropping.id}
          videoUrl={cropping.url}
        />
      )}

      {/* Explication d'un échec de génération */}
      <AlertDialog open={!!errorDialogAd} onOpenChange={(o) => !o && setErrorDialogAd(null)}>
        <AlertDialogContent className="console-app-portal">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 gx-cr-err">
              <AlertCircle className="h-5 w-5" />
              La génération a échoué
            </AlertDialogTitle>
            <AlertDialogDescription className="whitespace-pre-wrap text-left">
              {friendlyGenerationError(errorDialogAd?.error_message)}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="gx-cr-prompt">
            <p><strong>Prompt utilisé :</strong></p>
            <p className="mt-1 line-clamp-4 whitespace-pre-wrap">{errorDialogAd?.prompt ?? "-"}</p>
          </div>
          <AlertDialogFooter className="flex flex-col-reverse gap-2 sm:flex-row">
            <AlertDialogCancel>Fermer</AlertDialogCancel>
            <GxButton
              variant="outline"
              onClick={() => {
                const ad = errorDialogAd;
                if (ad) { setErrorDialogAd(null); reviseAd(ad); }
              }}
            >
              <Wand2 className="gx-i" />Modifier dans le chat
            </GxButton>
            <AlertDialogAction
              disabled={retryingId === errorDialogAd?.id}
              onClick={() => errorDialogAd && handleRetry(errorDialogAd.id)}
            >
              {retryingId === errorDialogAd?.id
                ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                : <RefreshCw className="mr-1.5 h-4 w-4" />}
              Réessayer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Choix de la discussion pour publier une création déjà liée à un chat */}
      <Dialog open={!!publishChoice} onOpenChange={(v) => { if (!v) setPublishChoice(null); }}>
        <DialogContent className="console-app-portal max-w-md">
          <DialogTitle className="sr-only">Publier sur Meta</DialogTitle>
          <div className="space-y-4">
            <div className="gx-cr-dh">
              <b>Publier sur Meta</b>
              <p>Cette création vient d'une discussion existante. Où veux-tu préparer la publication ?</p>
            </div>
            <div className="grid gap-2">
              <GxButton
                className="justify-start"
                disabled={!!publishingId}
                onClick={() => {
                  const choice = publishChoice;
                  setPublishChoice(null);
                  if (choice) void router.navigate({ to: "/create", search: { c: choice.conversationId, focus: choice.anchorAdId } as never });
                }}
              >
                <MessageSquare className="gx-i" />
                Reprendre la discussion existante
              </GxButton>
              <GxButton
                variant="outline"
                className="justify-start"
                disabled={!!publishingId}
                onClick={() => {
                  const choice = publishChoice;
                  setPublishChoice(null);
                  if (choice) void openMetaPublishChat([choice.adId], choice.adId);
                }}
              >
                {publishingId ? <Loader2 className="gx-i animate-spin" /> : <Plus className="gx-i" />}
                Nouvelle discussion de publication
              </GxButton>
            </div>
            <div className="flex justify-end">
              <button type="button" className="gx-btn gx-sm" onClick={() => setPublishChoice(null)}>Annuler</button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// =========== Carte de lot (Batch Studio) ===========
function BatchGroupCard({
  batch, publishing, onOpen, onPublish, onDelete,
}: {
  batch: { batchId: string; title: string; count: number; createdAt: string; thumbnails: string[]; videos?: (string | null)[] };
  publishing: boolean;
  onOpen: () => void;
  onPublish: () => void;
  onDelete: () => void;
}) {
  const tiles = (batch.videos ?? []).length ? (batch.videos ?? []) : batch.thumbnails.map(() => null);
  return (
    <div
      className="gx-ccard"
      tabIndex={0}
      role="button"
      aria-label={`Ouvrir le lot ${batch.title}`}
      onClick={(e) => { if ((e.currentTarget as Node).contains(e.target as Node)) onOpen(); }}
      onKeyDown={(e) => { if (e.key === "Enter" && e.target === e.currentTarget) onOpen(); }}
    >
      <span className="gx-cm gx-mos">
        {tiles.slice(0, 4).map((video, i) => (
          video
            ? <VideoPoster key={i} src={video} />
            : batch.thumbnails[i] ? <img key={i} src={batch.thumbnails[i]} alt="" loading="lazy" /> : <i key={i} />
        ))}
      </span>
      <span className="gx-ty">Lot</span>
      <div>
        <b title={batch.title}>{batch.title}</b>
        <small>Lot · {batch.count} pub{batch.count > 1 ? "s" : ""}</small>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button type="button" className="gx-ib gx-sm gx-cmore" aria-label="Plus d'actions" onClick={(e) => e.stopPropagation()}><IcMore /></button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="console-app-portal" onClick={(e) => e.stopPropagation()}>
          <DropdownMenuItem onClick={onOpen}>Ouvrir la grille</DropdownMenuItem>
          <DropdownMenuItem onClick={onPublish} disabled={publishing}>Publier sur Meta</DropdownMenuItem>
          <DropdownMenuItem onClick={onDelete} className="text-destructive">Supprimer le lot</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

// =========== Carte d'une création ===========
function CreationCard({
  ad, folderName, folders, selected, picking, onToggleSelect,
  editingTitle, editingTitleValue, setEditingTitleValue, startRenameAd,
  commitRenameAd, cancelRename, onPublish, onRevise, onTrim, onSubtitles,
  onSplit, onCrop, onDuplicate, duplicating, onMove, onDelete,
  onShowError, onRetry, retrying, onVoiceStarted, batchBadge,
}: {
  ad: any;
  batchBadge?: boolean;
  folderName?: string;
  folders: any[];
  selected: boolean;
  picking: boolean;
  onToggleSelect: () => void;
  editingTitle: boolean;
  editingTitleValue: string;
  setEditingTitleValue: (v: string) => void;
  startRenameAd: (id: string, title: string) => void;
  commitRenameAd: () => void;
  cancelRename: () => void;
  onPublish: () => void;
  onRevise: () => void;
  onTrim: (url: string) => void;
  onSubtitles: (url: string) => void;
  onSplit: (url: string) => void;
  onCrop: (url: string) => void;
  onDuplicate: () => void;
  duplicating: boolean;
  onMove: (ids: string[], folderId: string | null) => void;
  onDelete: (id: string) => void;
  onShowError: () => void;
  onRetry: () => void;
  retrying: boolean;
  onVoiceStarted: () => void;
}) {
  // Rognage, découpe et vitesse restent montés (dialogues existants) mais n'ont
  // pas d'entrée de menu, comme avant la refonte.
  void onTrim; void onSplit;
  const derived = getDerivedStatus(ad);
  const pill = STATUS_PILL[derived];
  const isVideo = ad.content_type === "video";
  const isPending = derived === "pending";
  const isFailed = derived === "failed";
  const isReady = derived === "ready" || derived === "published";
  const selectable = isReady;
  const isProcessing = ad.processing_status === "processing";
  const isAsset = !!ad.media_asset;
  const processingLabel: Record<string, string> = {
    trim: "Rognage en cours",
    split: "Scission en cours",
    subtitles: "Sous-titres en cours",
    crop: "Recadrage en cours",
    speedup: "Accélération en cours",
  };
  const processingText = isProcessing ? (processingLabel[ad.processing_op ?? ""] ?? "Traitement en cours") : "";
  const [previewOpen, setPreviewOpen] = useState(false);
  const previewVideoRef = useRef<HTMLVideoElement | null>(null);
  const closePreview = useCallback(() => {
    previewVideoRef.current?.pause();
    setPreviewOpen(false);
  }, []);
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [voices, setVoices] = useState<FrenchVoiceCatalog | null>(null);
  const [selectedVoice, setSelectedVoice] = useState("");
  const [voiceLoading, setVoiceLoading] = useState(false);
  const [previewLoading, setPreviewLoading] = useState<string | null>(null);
  const [playingVoice, setPlayingVoice] = useState<string | null>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);
  const fetchVoices = useServerFn(listFrenchVoices);
  const playVoicePreview = useServerFn(previewFrenchVoice);
  const regenVoice = useServerFn(regenerateAdVoice);
  const canChangeVoice = isVideo && isReady && !!ad.pipeline_spoken_text && !!ad.pipeline_video_url;
  const canEditVideo = isVideo && isReady && !!ad.generated_url && !isProcessing && !isAsset;

  useEffect(() => {
    if (!voiceOpen || voices) return;
    void fetchVoices().then((v) => setVoices(v as FrenchVoiceCatalog)).catch(() => toast.error("Voix indisponibles"));
  }, [fetchVoices, voiceOpen, voices]);

  const handlePreviewVoice = async (voiceId: string) => {
    if (playingVoice === voiceId && previewAudioRef.current) {
      previewAudioRef.current.pause();
      previewAudioRef.current.currentTime = 0;
      setPlayingVoice(null);
      return;
    }
    previewAudioRef.current?.pause();
    setPreviewLoading(voiceId);
    try {
      const r = await playVoicePreview({ data: { voiceId } });
      const audio = new Audio(r.url);
      previewAudioRef.current = audio;
      audio.onended = () => setPlayingVoice(null);
      setPlayingVoice(voiceId);
      await audio.play();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Aperçu indisponible");
    } finally {
      setPreviewLoading(null);
    }
  };

  const handleRegenerateVoice = async () => {
    if (!selectedVoice) return;
    setVoiceLoading(true);
    try {
      await regenVoice({ data: { adId: ad.id, voiceId: selectedVoice, fastMode: true } });
      toast.success("Nouvelle voix en cours de génération…");
      setVoiceOpen(false);
      onVoiceStarted();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Régénération impossible");
    } finally {
      setVoiceLoading(false);
    }
  };

  const [speedOpen, setSpeedOpen] = useState(false);
  const [speedValue, setSpeedValue] = useState<number>(() => {
    const s = Number(ad.speed_factor);
    return Number.isFinite(s) && s > 0 ? s : 1.08;
  });
  const [speedLoading, setSpeedLoading] = useState(false);
  const regenSpeed = useServerFn(regenerateAdSpeed);

  const handleRegenerateSpeed = async () => {
    setSpeedLoading(true);
    try {
      await regenSpeed({ data: { adId: ad.id, speedFactor: Number(speedValue.toFixed(2)) } });
      toast.success(`Réajustement à ×${speedValue.toFixed(2)} en cours…`);
      setSpeedOpen(false);
      onVoiceStarted();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Réajustement impossible");
    } finally {
      setSpeedLoading(false);
    }
  };

  // Arrêt d'une génération / d'un traitement bloqué ou trop long.
  const cancelGeneration = useServerFn(cancelAdGeneration);
  const [cancelling, setCancelling] = useState(false);
  const handleCancel = async () => {
    setCancelling(true);
    try {
      await cancelGeneration({ data: { id: ad.id } });
      toast.success("Génération arrêtée");
      onVoiceStarted();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Impossible d'arrêter cette génération");
    } finally {
      setCancelling(false);
    }
  };

  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!isPending && !isProcessing) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [isPending, isProcessing]);
  const startedAt = Number.isFinite(Date.parse(ad.created_at)) ? Date.parse(ad.created_at) : now;
  const ageMs = Math.max(0, now - startedAt);
  const { progress, remainingMs, overdue, stalled } = getGenerationProgress(ad.content_type, ageMs);
  const etaLabel = overdue ? `${formatGenerationDuration(ageMs)} écoulées` : `~${formatGenerationDuration(remainingMs)} restantes`;
  const progressDetail = stalled ? "Vérification automatique" : overdue ? "Plus long que prévu" : "Temps réel";
  const stageLabel = generationStageLabel(ad);

  const still = stillOf(ad);
  const fallback = fallbackOf(ad);
  const canPreview = !!ad.generated_url && !isPending && !isFailed;

  // Clic sur la carte : en mode sélection on coche, sinon aperçu plein écran.
  // (Les clics venus des dialogues/menus portés hors de la carte sont ignorés.)
  const activate = () => {
    if (editingTitle) return;
    if (picking && selectable) { onToggleSelect(); return; }
    if (canPreview) setPreviewOpen(true);
  };

  const meta = [folderName ?? "Sans dossier", formatShortDate(ad.created_at), batchBadge ? "Lot Batch Studio" : null]
    .filter(Boolean).join(" · ");

  const stop = (e: SyntheticEvent) => e.stopPropagation();

  return (
    <div
      className={selected ? "gx-ccard gx-sel" : "gx-ccard"}
      tabIndex={0}
      onClick={(e) => { if ((e.currentTarget as Node).contains(e.target as Node)) activate(); }}
      onKeyDown={(e) => {
        if (e.target !== e.currentTarget) return;
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); activate(); }
      }}
    >
      {selectable && (
        <label className="gx-ck" onClick={stop}>
          <input type="checkbox" checked={selected} onChange={onToggleSelect} aria-label={`Sélectionner ${ad.title ?? "cette création"}`} />
        </label>
      )}

      <span className="gx-cm">
        {isVideo && ad.generated_url ? (
          <>
            {fallback && <img src={fallback} alt="" loading="lazy" />}
            <VideoPoster src={ad.generated_url} fallbackSrc={fallback} />
          </>
        ) : still ? (
          <img src={still} alt="" loading="lazy" decoding="async" />
        ) : fallback ? (
          <img src={fallback} alt="" loading="lazy" decoding="async" />
        ) : null}

        {isPending && (
          <span className="gx-cm-ov">
            <b><span className="gx-spin" />{stageLabel}</b>
            <span className="gx-bar"><i style={{ width: `${progress}%` }} /></span>
            <small>{etaLabel} · {progressDetail} · {progress} %</small>
            <button type="button" className="gx-btn gx-sm" disabled={cancelling} onClick={(e) => { e.stopPropagation(); void handleCancel(); }}>
              {cancelling && <Loader2 className="gx-i animate-spin" />}Arrêter
            </button>
          </span>
        )}
        {isFailed && (
          <span className="gx-cm-ov gx-bad">
            <b>La génération a échoué</b>
            <small className="gx-clamp">{friendlyGenerationError(ad.error_message)}</small>
            <span className="gx-cm-acts">
              <button type="button" className="gx-btn gx-sm gx-pri" disabled={retrying} onClick={(e) => { e.stopPropagation(); onRetry(); }}>
                {retrying && <Loader2 className="gx-i animate-spin" />}Réessayer
              </button>
              <button type="button" className="gx-btn gx-sm" onClick={(e) => { e.stopPropagation(); onShowError(); }}>Voir le détail</button>
            </span>
          </span>
        )}
        {isProcessing && !isPending && (
          <span className="gx-cm-ov">
            <b><span className="gx-spin" />{processingText}…</b>
            <span className="gx-bar"><i style={{ width: `${progress}%` }} /></span>
            <small>{etaLabel} · {progress} %</small>
            <button type="button" className="gx-btn gx-sm" disabled={cancelling} onClick={(e) => { e.stopPropagation(); void handleCancel(); }}>
              {cancelling && <Loader2 className="gx-i animate-spin" />}Arrêter
            </button>
          </span>
        )}
      </span>

      <span className="gx-ty">{typeLabel(ad)}</span>

      <div>
        {editingTitle ? (
          <input
            autoFocus
            className="gx-in"
            aria-label="Nouveau nom de la création"
            value={editingTitleValue}
            onChange={(e) => setEditingTitleValue(e.target.value)}
            onBlur={commitRenameAd}
            onKeyDown={(e) => {
              e.stopPropagation();
              if (e.key === "Enter") commitRenameAd();
              if (e.key === "Escape") cancelRename();
            }}
            onClick={stop}
          />
        ) : (
          <b title={`${ad.title ?? ""} · ${meta}`}>{ad.title || "Sans titre"}</b>
        )}
        <span className={`gx-st ${pill.cls}`}>{isProcessing && !isPending ? "En cours" : pill.label}</span>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button type="button" className="gx-ib gx-sm gx-cmore" aria-label="Plus d'actions" onClick={stop}><IcMore /></button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="console-app-portal w-56" onClick={stop}>
          {canPreview && (
            <DropdownMenuItem onClick={() => setPreviewOpen(true)}>
              <Eye className="mr-2 h-3.5 w-3.5" />Aperçu plein écran
            </DropdownMenuItem>
          )}
          {isReady && derived !== "published" && (
            <DropdownMenuItem onClick={onPublish}>
              <Megaphone className="mr-2 h-3.5 w-3.5" />Publier sur Meta
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={() => startRenameAd(ad.id, ad.title)}>
            <Pencil className="mr-2 h-3.5 w-3.5" />Renommer
          </DropdownMenuItem>
          {isReady && isVideo && (
            <DropdownMenuItem asChild>
              <Link
                to="/editeur"
                search={{ p: "new", v: ad.generated_url ?? undefined, n: ad.title || "Vidéo", panel: "media", src: ad.id } as never}
              >
                <Clapperboard className="mr-2 h-3.5 w-3.5" />Ouvrir l'éditeur
              </Link>
            </DropdownMenuItem>
          )}
          {canEditVideo && (
            <DropdownMenuItem onClick={() => onSubtitles(ad.generated_url)}>
              <Captions className="mr-2 h-3.5 w-3.5" />Sous-titres
            </DropdownMenuItem>
          )}
          {canEditVideo && (
            <DropdownMenuItem onClick={() => onCrop(ad.generated_url)}>
              <Crop className="mr-2 h-3.5 w-3.5" />Recadrer
            </DropdownMenuItem>
          )}
          {canChangeVoice && (
            <DropdownMenuItem onClick={() => setVoiceOpen(true)}>
              <Languages className="mr-2 h-3.5 w-3.5" />Changer la voix
            </DropdownMenuItem>
          )}
          {isReady && (
            <DropdownMenuItem onClick={onRevise}>
              <Wand2 className="mr-2 h-3.5 w-3.5" />Refaire / modifier dans le chat
            </DropdownMenuItem>
          )}
          {ad.stock_actor && (
            <DropdownMenuItem asChild>
              <Link
                to="/create"
                search={{
                  actor: ad.stock_actor.reference_image_url,
                  actorName: ad.stock_actor.name,
                  actorId: ad.stock_actor.id,
                } as never}
              >
                <UserIcon className="mr-2 h-3.5 w-3.5" />Réutiliser cet acteur
              </Link>
            </DropdownMenuItem>
          )}
          {isReady && ad.generated_url && (
            <DropdownMenuItem onClick={onDuplicate} disabled={duplicating}>
              {duplicating
                ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                : <Copy className="mr-2 h-3.5 w-3.5" />}
              Dupliquer
            </DropdownMenuItem>
          )}
          {ad.generated_url && (
            <DropdownMenuItem onClick={() => forceDownload(ad.generated_url!, `${ad.title}.${isVideo ? "mp4" : "png"}`)}>
              <Download className="mr-2 h-3.5 w-3.5" />Télécharger
            </DropdownMenuItem>
          )}
          {isFailed && (
            <DropdownMenuItem onClick={onShowError}>
              <AlertCircle className="mr-2 h-3.5 w-3.5" />Voir le détail de l'échec
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />
          <DropdownMenuLabel className="text-xs">Déplacer vers</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => onMove([ad.id], null)} disabled={!ad.folder_id}>
            <FolderInput className="mr-2 h-3.5 w-3.5" />Sans dossier
          </DropdownMenuItem>
          {folders.map((f: any) => (
            <DropdownMenuItem key={f.id} onClick={() => onMove([ad.id], f.id)} disabled={ad.folder_id === f.id}>
              <Folder className="mr-2 h-3.5 w-3.5" />{f.name}
            </DropdownMenuItem>
          ))}
          {folders.length === 0 && <DropdownMenuItem disabled>Aucun dossier</DropdownMenuItem>}
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-destructive" onClick={() => onDelete(ad.id)}>
            <Trash2 className="mr-2 h-3.5 w-3.5" />Supprimer
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Aperçu plein écran */}
      <Dialog open={previewOpen} onOpenChange={(open) => { if (!open) closePreview(); else setPreviewOpen(true); }}>
        <DialogContent onPointerDownOutside={closePreview} onEscapeKeyDown={closePreview} className="console-app-portal gx-cr-pv max-h-[96vh] w-[min(94vw,980px)] max-w-none overflow-y-auto p-4 sm:p-5 [&>button]:hidden">
          <DialogTitle className="sr-only">Aperçu de la création</DialogTitle>
          <div className="relative flex flex-col items-center gap-3">
            <div className="gx-cr-dh flex w-full items-start justify-between gap-4 pr-10">
              <div className="min-w-0">
                <b className="truncate" title={ad.title}>{ad.title}</b>
                <p>{meta}</p>
              </div>
              <button type="button" onClick={closePreview} className="gx-ib gx-sm absolute right-0 top-0" aria-label="Fermer l’aperçu"><IcX /></button>
            </div>
            <div className="gx-cr-stage flex max-h-[72vh] max-w-full overflow-hidden">
              {ad.generated_url && (
                isVideo ? (
                  <video
                    ref={previewVideoRef}
                    src={ad.generated_url}
                    controls
                    autoPlay
                    playsInline
                    disablePictureInPicture
                    className="block max-h-[72vh] max-w-full object-contain"
                  />
                ) : (
                  <img src={still ?? ad.generated_url} alt={ad.title} className="block max-h-[72vh] max-w-full object-contain" />
                )
              )}
            </div>
            <div className="flex w-full flex-wrap items-center justify-center gap-2">
              {isReady && isVideo && (
                <Link
                  to="/editeur"
                  search={{ p: "new", v: ad.generated_url ?? undefined, n: ad.title || "Vidéo", panel: "media", src: ad.id } as never}
                  className="gx-btn gx-sm"
                >
                  <Clapperboard className="gx-i" />Ouvrir dans l'éditeur
                </Link>
              )}
              {isReady && ad.generated_url && (
                <button type="button" className="gx-btn gx-sm" onClick={() => { closePreview(); onDuplicate(); }}>
                  <Copy className="gx-i" />Dupliquer
                </button>
              )}
              <OpenConversationButton adId={ad.id} className="gx-btn gx-sm" />
              {isReady && derived !== "published" && (
                <button type="button" className="gx-btn gx-sm" onClick={() => { closePreview(); onPublish(); }}>
                  <Megaphone className="gx-i" />Publier sur Meta
                </button>
              )}
              {ad.generated_url && (
                <button
                  type="button"
                  className="gx-btn gx-sm gx-pri"
                  onClick={() => forceDownload(ad.generated_url!, `${ad.title}.${ad.content_type === "video" ? "mp4" : "png"}`)}
                >
                  <Download className="gx-i" />Télécharger
                </button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={voiceOpen} onOpenChange={setVoiceOpen}>
        <DialogContent className="console-app-portal max-w-2xl">
          <DialogTitle className="sr-only">Changer la voix</DialogTitle>
          <div className="space-y-4">
            <div className="gx-cr-dh">
              <b>Changer la voix</b>
              <p>Écoute une voix, sélectionne-la, puis régénère cette vidéo à ×{UGC_FR_SPEED_FACTOR.toFixed(2)}.</p>
            </div>
            <div className="max-h-[55vh] space-y-4 overflow-y-auto pr-1">
              {voices ? (["female", "male"] as const).map((group) => (
                <div key={group} className="space-y-2">
                  <div className="gx-lbl">{group === "female" ? "Voix féminines" : "Voix masculines"}</div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {voices[group].map((voice) => (
                      <div key={voice.id} className={selectedVoice === voice.id ? "gx-cr-voice gx-on" : "gx-cr-voice"}>
                        <button type="button" onClick={() => { void handlePreviewVoice(voice.id); }} className="gx-ib gx-sm" aria-label="Écouter">
                          {previewLoading === voice.id ? <Loader2 className="gx-i animate-spin" /> : playingVoice === voice.id ? "■" : "▶"}
                        </button>
                        <button type="button" onClick={() => setSelectedVoice(voice.id)} className="min-w-0 flex-1 text-left">
                          <b className="block truncate">{voice.name}</b>
                          {voice.notes && <small className="block truncate">{voice.notes}</small>}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )) : (
                <div className="gx-cr-dh flex items-center gap-2"><Loader2 className="gx-i animate-spin" /><p>Chargement des voix…</p></div>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <GxButton variant="outline" onClick={() => setVoiceOpen(false)}>Annuler</GxButton>
              <GxButton onClick={() => { void handleRegenerateVoice(); }} disabled={!selectedVoice || voiceLoading}>
                {voiceLoading ? <Loader2 className="gx-i animate-spin" /> : <Languages className="gx-i" />}
                Régénérer avec cette voix
              </GxButton>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={speedOpen} onOpenChange={setSpeedOpen}>
        <DialogContent className="console-app-portal max-w-md">
          <DialogTitle className="sr-only">Changer la vitesse</DialogTitle>
          <div className="space-y-4">
            <div className="gx-cr-dh">
              <b>Changer la vitesse</b>
              <p>Ajuste la vitesse de lecture (vidéo + audio). Le rendu est régénéré à partir de la vidéo actuelle, sans repasser par le pipeline complet.</p>
            </div>
            <div className="gx-cr-speed">
              <div className="mb-3 flex items-center justify-between">
                <small>Facteur de vitesse</small>
                <b className="gx-num">×{speedValue.toFixed(2)}</b>
              </div>
              <input
                type="range"
                min={0.75}
                max={1.5}
                step={0.01}
                value={speedValue}
                onChange={(e) => setSpeedValue(parseFloat(e.target.value))}
                className="w-full"
              />
              <div className="mt-1 flex justify-between"><small>×0.75 (plus lent)</small><small>×1.00</small><small>×1.50 (plus rapide)</small></div>
              <div className="gx-seg mt-3" role="group" aria-label="Vitesses rapides">
                {[1.0, 1.05, 1.08, 1.15, 1.25].map((v) => (
                  <button key={v} type="button" aria-selected={Math.abs(speedValue - v) < 0.005} onClick={() => setSpeedValue(v)}>×{v.toFixed(2)}</button>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <GxButton variant="outline" onClick={() => setSpeedOpen(false)}>Annuler</GxButton>
              <GxButton onClick={() => { void handleRegenerateSpeed(); }} disabled={speedLoading}>
                {speedLoading ? <Loader2 className="gx-i animate-spin" /> : <Gauge className="gx-i" />}
                Appliquer cette vitesse
              </GxButton>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
