import { createContext, memo, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  Check,
  Download,
  FolderOpen,
  Image as ImageIcon,
  Loader2,
  Music,
  Play,
  Redo2,
  RotateCcw,

  Scissors,
  Search,
  Sparkles,
  Subtitles,
  Trash2,
  Type,
  Undo2,
  Upload,
  Wand2,
  Pause,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Film,
  Mic,
  Square,
  Keyboard,
  Maximize,
  PanelRightClose,
  PanelRightOpen,
  Copy,
  Combine,
  MessageSquare as MessageSquareIcon,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { getAdConversationLink } from "@/lib/ad-versions.functions";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { friendlyApiError, isTransientError } from "@/lib/api-error";
import { applyResolvedUrls, collectSignedUrls } from "@/lib/editor/media-refs";
import { signEditorMediaUrls } from "@/lib/editor-media.functions";
import type { MediaStatus } from "@/lib/editor/renderer.client";

/** Clé d'état média : le `src` du clip sans fragment de découpage. */
function mediaStatusKey(src: string): string {
  return src.replace(/#t=[^#]*$/, "");
}

/** GRW-4 : états `loading|ready|error` des médias, partagés timeline/inspecteur. */
const MediaStatusContext = createContext<Record<string, MediaStatus>>({});

/** État du média d'un clip (null si le clip n'a pas de source). */
function useClipMediaStatus(src: string | null | undefined): MediaStatus | null {
  const statuses = useContext(MediaStatusContext);
  if (!src) return null;
  return statuses[mediaStatusKey(src)] ?? null;
}

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";



import { useEditorStore } from "@/lib/editor/store";
import {
  aspectSize,
  DEFAULT_TEXT_STYLE,
  compositionDuration,
  emptyComposition,
  makeClip,
  newId,
  normalizeComposition,

  type AspectRatio,
  type Clip,
  type Composition,
} from "@/lib/editor/types";
import { FILTER_PRESETS, filterToCss, FILTER_BY_KEY } from "@/lib/editor/filters";
import { EFFECT_PRESETS, defaultEffectParams, EFFECT_BY_KEY } from "@/lib/editor/effects";
import { animationsOf } from "@/lib/editor/animations";
import { TRANSITION_PRESETS } from "@/lib/editor/transitions";
import { TEXT_TEMPLATES, styleForTemplate } from "@/lib/editor/text-templates";
import type { EditorRenderer } from "@/lib/editor/renderer.client";

import { useServerFn } from "@tanstack/react-start";
import { mergeEditorClips } from "@/lib/video-edit.functions";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CreditCost, creditCost } from "@/components/billing/CreditCost";
import {
  createEditorProject,
  duplicateEditorProject,
  discardEmptyEditorProject,
  uploadEditorThumbnail,
  getEditorProject,
  listEditorAssets,
  listEditorProjects,
  renameEditorProject,
  saveEditorProject,
} from "@/lib/editor-projects.functions";

import { saveEditorExportToAds } from "@/lib/editor-export.functions";
import {
  closeGaps,
  ensureSubtitleTrack,
  SUBTITLE_TRACK_NAME,

  findGaps,
  findOverlaps,
  normalizeTiming,
  snapDuration,
  snapToFrame,
  tightenTimeline,
} from "@/lib/editor/timeline-rules";
import { searchStockMedia } from "@/lib/editor-stock.functions";
import { useClipFrame } from "./useClipFrame";
import {
  EDITOR_VOICES,
  generateEditorVoiceover,
  transcribeEditorClip,
} from "@/lib/editor-ai.functions";
import { extractAudioChunks } from "@/lib/media-audio";
import { EDITOR_SHORTCUTS, useEditorShortcuts } from "@/lib/editor/useEditorShortcuts";

/** Largeurs de bascule de la mise en page (GRW-13). */
const NARROW_PX = 1280;
const MIN_PX = 768;

/** Préférence de repli des panneaux, mémorisée entre deux sessions. */
const PANEL_OPEN_KEY = "growthity:editor:panel-open";
const INSPECTOR_OPEN_KEY = "growthity:editor:inspector-open";

function readStoredFlag(key: string, fallback: boolean): boolean {
  if (typeof window === "undefined") return fallback;
  const raw = window.localStorage.getItem(key);
  return raw === null ? fallback : raw === "1";
}

/**
 * Indique si la session Supabase est déjà hydratée côté client. Sans elle, le
 * middleware d'auth des server functions renvoie un 500 (aucun jeton attaché),
 * ce qui faisait échouer le préchargement des assets au montage de l'éditeur.
 */
function useHasSession(): boolean {
  const [hasSession, setHasSession] = useState(false);
  useEffect(() => {
    let alive = true;
    void supabase.auth.getSession().then(({ data }) => {
      if (alive) setHasSession(Boolean(data.session?.access_token));
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setHasSession(Boolean(s?.access_token));
    });
    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, []);
  return hasSession;
}


/** Largeur de la fenêtre, suivie pour la mise en page adaptative de l'éditeur. */
function useViewportWidth(): number {
  const [width, setWidth] = useState(() =>
    typeof window === "undefined" ? 1920 : window.innerWidth,
  );
  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    onResize();
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return width;
}

/** Bouton icône avec libellé accessible + infobulle (GRW-14). */
function IconAction({
  label,
  hint,
  onClick,
  disabled,
  children,
  className,
  side = "top",
}: {
  label: string;
  hint?: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
  side?: "top" | "bottom" | "left" | "right";
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          aria-label={label}
          title={label}
          disabled={disabled}
          onClick={onClick}
          className={cn("h-8 w-8", className)}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent side={side}>{hint ? `${label} · ${hint}` : label}</TooltipContent>
    </Tooltip>
  );
}



type PanelKey =
  | "media"
  | "assets"
  | "text"
  | "stock"
  | "transitions"
  | "captions"
  | "audio";

const PANELS: { key: PanelKey; label: string; icon: typeof ImageIcon }[] = [
  { key: "media", label: "Médias", icon: Upload },
  { key: "assets", label: "Mes assets", icon: FolderOpen },
  { key: "text", label: "Texte", icon: Type },
  { key: "stock", label: "Stock", icon: Search },
  { key: "transitions", label: "Transitions", icon: Wand2 },
  { key: "captions", label: "Sous-titres", icon: Subtitles },
  { key: "audio", label: "Audio IA", icon: Music },
];

const fmt = (t: number) => {
  const s = Math.max(0, t);
  const m = Math.floor(s / 60);
  const rest = s - m * 60;
  return `${String(m).padStart(2, "0")}:${rest.toFixed(1).padStart(4, "0")}`;
};

const isVideoUrl = (url: string) => /\.(mp4|webm|mov|m4v)([?#]|$)/i.test(url);

/** Nom par défaut lisible : « Projet du 12/06 à 14:30 ». */
const defaultProjectName = () =>
  `Projet du ${new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" })} à ${new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`;

/** Dernier projet ouvert (réouverture automatique au retour sur l'éditeur). */
const LAST_PROJECT_KEY = "growthity:editor:last-project";
const DRAFT_PREFIX = "growthity:editor:draft:";

/** Payload de drag partagé : fiable même quand dataTransfer est filtré par le navigateur. */
let activeDragPayload: DropPayload | null = null;

/**
 * Préférence partagée « Appliquer à tous les sous-titres » : l'inspecteur la
 * pilote, l'aperçu (déplacement / zoom / recadrage) la respecte aussi.
 */
const textApplyAll = { current: true };

/**
 * Famille d'un clip texte : « subtitles » s'il vit sur la piste Sous-titres,
 * « titles » sinon. Sert à ne jamais propager une modification d'un titre aux
 * sous-titres (et inversement).
 */
function textScopeOf(composition: Composition, clipId: string): "subtitles" | "titles" {
  for (const track of composition.tracks) {
    if (!track.clips.some((c) => c.id === clipId)) continue;
    return track.name === SUBTITLE_TRACK_NAME ? "subtitles" : "titles";
  }
  return "titles";
}

export function VideoEditor({
  initialProjectId,
  initialVideoUrl,
  initialVideoName,
  initialPanel,
  onBack,
  sourceAdId: sourceAdIdProp,
}: {
  initialProjectId?: string;
  initialVideoUrl?: string;
  initialVideoName?: string;
  initialPanel?: string;
  onBack?: () => void;
  sourceAdId?: string;
} = {}) {
  // Création d'origine (ouverte depuis le chat) : l'export devient une version
  // de cette création et « Retour à la discussion » ramène au chat.
  const [sourceAdId, setSourceAdId] = useState<string | undefined>(sourceAdIdProp);
  const getConvLink = useServerFn(getAdConversationLink);
  const { data: convLink } = useQuery({
    queryKey: ["ad-conversation-link", sourceAdId],
    queryFn: () => getConvLink({ data: { adId: sourceAdId! } }),
    enabled: !!sourceAdId,
    staleTime: 60_000,
  });
  const store = useEditorStore();
  const queryClient = useQueryClient();

  const [panel, setPanel] = useState<PanelKey>(
    PANELS.some((p) => p.key === initialPanel) ? (initialPanel as PanelKey) : "media",
  );
  const [panelOpen, setPanelOpen] = useState(() => readStoredFlag(PANEL_OPEN_KEY, true));
  const [inspectorOpen, setInspectorOpen] = useState(() => readStoredFlag(INSPECTOR_OPEN_KEY, true));
  useEffect(() => {
    window.localStorage.setItem(PANEL_OPEN_KEY, panelOpen ? "1" : "0");
  }, [panelOpen]);
  useEffect(() => {
    window.localStorage.setItem(INSPECTOR_OPEN_KEY, inspectorOpen ? "1" : "0");
  }, [inspectorOpen]);

  const viewportWidth = useViewportWidth();
  const narrow = viewportWidth < NARROW_PX;
  const tooSmall = viewportWidth < MIN_PX;
  /** Fiche « Raccourcis clavier » (touche ?). */
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  /** Incrémenté pour demander à la timeline de s'ajuster au projet (GRW-17). */
  const [fitSignal, setFitSignal] = useState(0);
  const requestFit = useCallback(() => setFitSignal((n) => n + 1), []);

  /** Clip dont le média doit être remplacé au prochain choix dans « Mes assets ». */
  const replaceTargetRef = useRef<string | null>(null);

  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [zoom, setZoom] = useState(60); // px par seconde
  const [projectId, setProjectId] = useState<string | null>(null);
  const [projectName, setProjectName] = useState(defaultProjectName);
  const [projectPickerOpen, setProjectPickerOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportRatio, setExportRatio] = useState(0);


  const stageRef = useRef<HTMLDivElement | null>(null);
  const rendererRef = useRef<EditorRenderer | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastTsRef = useRef<number>(0);
  // L'initialisation WebGL est asynchrone. Ces refs garantissent que le moteur
  // reçoit l'état le plus récent si le projet charge pendant que l'utilisateur
  // appuie déjà sur Lecture.
  const compositionRef = useRef(store.composition);
  const timeRef = useRef(time);
  const playingRef = useRef(playing);
  compositionRef.current = store.composition;
  timeRef.current = time;
  playingRef.current = playing;

  const duration = store.duration;

  // ---------- moteur ----------
  // Le moteur est recréé à chaque changement de format : garantit un cadrage
  // net et recentré (aucun état de rendu hérité de l'ancien ratio).
  // GRW-4 : états de chargement des médias, alimentés par le moteur.
  const [mediaStatuses, setMediaStatuses] = useState<Record<string, MediaStatus>>({});
  useEffect(() => {
    let cancelled = false;
    let local: EditorRenderer | null = null;
    (async () => {
      const container = stageRef.current;
      if (!container) return;
      const mod = await import("@/lib/editor/renderer.client");
      if (cancelled || !stageRef.current) return;
      stageRef.current.replaceChildren();
      local = await mod.EditorRenderer.create(stageRef.current, store.composition);
      if (cancelled) {
        local.destroy();
        return;
      }
      rendererRef.current = local;
      local.onMediaStatus = (statuses) => setMediaStatuses(statuses);
      setMediaStatuses(local.mediaStatusSnapshot());
      local.setComposition(compositionRef.current);
      local.setTime(timeRef.current);
      local.setPlaying(playingRef.current);
      // GRW-5 : l'aperçu affiche la première image sans attendre « Lecture ».
      if (!playingRef.current) void local.primeFirstFrame();
    })();
    return () => {
      cancelled = true;
      rendererRef.current?.destroy();
      rendererRef.current = null;
      local = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.composition.aspectRatio]);


  useEffect(() => {
    rendererRef.current?.setComposition(store.composition);
  }, [store.composition]);

  /**
   * GRW-5 : à chaque changement de composition (chargement d'un projet, ajout
   * ou déplacement d'un média), on force le rendu de l'image courante lorsque
   * la lecture est à l'arrêt — sinon le canvas restait noir jusqu'au 1er clic.
   */
  useEffect(() => {
    if (playing) return;
    const id = window.setTimeout(() => {
      void rendererRef.current?.primeFirstFrame();
    }, 80);
    return () => window.clearTimeout(id);
  }, [store.composition, playing]);


  useEffect(() => {
    rendererRef.current?.setTime(time);
  }, [time]);

  // Pendant la lecture, l'inspecteur suit le clip vidéo réellement sous la
  // tête de lecture (notamment la seconde moitié créée par un split).
  useEffect(() => {
    if (!playing) return;
    const active = store.composition.tracks
      .find((track) => track.kind === "video" && !track.hidden)
      ?.clips.find((clip) => time >= clip.start && time < clip.start + clip.duration);
    if (active && active.id !== store.selectedClipId) store.setSelectedClipId(active.id);
  }, [playing, time, store.composition, store.selectedClipId, store.setSelectedClipId]);

  useEffect(() => {
    rendererRef.current?.setPlaying(playing);
    if (!playing) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      return;
    }
    lastTsRef.current = performance.now();
    const tick = (ts: number) => {
      const dt = (ts - lastTsRef.current) / 1000;
      lastTsRef.current = ts;
      setTime((t) => {
        const next = t + dt;
        // Comme CapCut : arrivé à la fin, le curseur revient au début et
        // la lecture s'arrête (prêt à relire depuis 0).
        if (next >= duration) {
          setPlaying(false);
          return 0;
        }
        return next;
      });

      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [playing, duration]);

  // ---------- projet ----------
  const create = useServerFn(createEditorProject);
  const saveExportToAds = useServerFn(saveEditorExportToAds);
  const save = useServerFn(saveEditorProject);
  const rename = useServerFn(renameEditorProject);
  const listProjects = useServerFn(listEditorProjects);
  const getProject = useServerFn(getEditorProject);

  const duplicate = useServerFn(duplicateEditorProject);
  const discardEmpty = useServerFn(discardEmptyEditorProject);
  const uploadThumb = useServerFn(uploadEditorThumbnail);

  /** Dernier nom valide : un titre vidé au clavier ne doit jamais être enregistré. */
  const lastValidNameRef = useRef(defaultProjectName());
  /** Vignette : au plus une capture toutes les 2 minutes, en arrière-plan. */
  const lastThumbAtRef = useRef(0);

  const projects = useQuery({
    queryKey: ["editor-projects"],
    queryFn: () => listProjects(),
    staleTime: 5 * 60_000,
  });


  // Préchargement des médias du workspace : le panneau « Mes assets » doit
  // s'afficher instantanément au clic, pas déclencher la requête à ce moment-là.
  const listAssetsFn = useServerFn(listEditorAssets);
  const hasSession = useHasSession();
  const prefetchAssets = useCallback(() => {
    void queryClient.prefetchQuery({
      queryKey: ["editor-assets"],
      queryFn: () => listAssetsFn(),
      staleTime: 5 * 60_000,
    });
  }, [queryClient, listAssetsFn]);

  useEffect(() => {
    if (!hasSession) return;
    const id = window.setTimeout(prefetchAssets, 400);
    return () => window.clearTimeout(id);
  }, [prefetchAssets, hasSession]);

  // ---------- URLs signées (GRW-4) ----------
  // La composition ne persiste que des références `storage:bucket/path` ; le
  // serveur les résout en URLs signées 24 h au chargement. En session longue,
  // on re-signe avant expiration et dès qu'un média tombe en erreur.
  const signMedia = useServerFn(signEditorMediaUrls);
  const resigningRef = useRef(false);
  const refreshSignedMedia = useCallback(async () => {
    if (resigningRef.current) return;
    const comp = compositionRef.current;
    const byRef = collectSignedUrls(comp);
    if (byRef.size === 0) return;
    resigningRef.current = true;
    try {
      const res = (await signMedia({ data: { refs: [...byRef.keys()] } })) as {
        urls: Record<string, string>;
      };
      const map: Record<string, string> = {};
      for (const [ref, urls] of byRef) {
        const fresh = res?.urls?.[ref];
        if (!fresh) continue;
        for (const url of urls) if (url !== fresh) map[url] = fresh;
      }
      if (Object.keys(map).length === 0) return;
      const next = structuredClone(comp) as Composition;
      if (!applyResolvedUrls(next, map)) return;
      // Re-signature transparente : ne doit pas marquer le projet comme modifié.
      justLoadedRef.current = true;
      store.replaceComposition(next);
    } catch {
      /* la re-signature réessaiera au prochain cycle */
    } finally {
      resigningRef.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signMedia]);

  /** Re-signature périodique (bien avant les 24 h du jeton). */
  useEffect(() => {
    const id = window.setInterval(() => void refreshSignedMedia(), 20 * 60_000);
    return () => window.clearInterval(id);
  }, [refreshSignedMedia]);

  /** Un média en erreur = jeton probablement expiré : on re-signe aussitôt. */
  const lastErrorFixRef = useRef(0);
  useEffect(() => {
    if (!Object.values(mediaStatuses).includes("error")) return;
    if (Date.now() - lastErrorFixRef.current < 30_000) return;
    lastErrorFixRef.current = Date.now();
    void refreshSignedMedia();
  }, [mediaStatuses, refreshSignedMedia]);




  const [dirty, setDirty] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);
  const [saveFailed, setSaveFailed] = useState(false);
  /** Projet d'un collègue sans permission d'écriture : aucune sauvegarde possible. */
  const [readOnly, setReadOnly] = useState(false);
  const [ownerName, setOwnerName] = useState<string | null>(null);
  /** Échec DÉFINITIF (permission, validation) : modale bloquante, pas une puce. */
  const [blockingError, setBlockingError] = useState<string | null>(null);
  /** Brouillon local restauré alors que le serveur n'a jamais reçu ces modifications. */
  const [draftUnsynced, setDraftUnsynced] = useState(false);


  const [loadingProject, setLoadingProject] = useState(false);
  const projectIdRef = useRef<string | null>(null);
  projectIdRef.current = projectId;
  const readOnlyRef = useRef(false);
  readOnlyRef.current = readOnly;
  const nameRef = useRef(projectName);
  nameRef.current = projectName;
  const savedTickRef = useRef(store.historyTick);
  const historyTickRef = useRef(store.historyTick);
  historyTickRef.current = store.historyTick;
  /** Vrai juste après un chargement de projet : la 1re variation de tick n'est pas une modification. */
  const justLoadedRef = useRef(false);
  const restoredDraftRef = useRef(false);

  useEffect(() => {
    if (justLoadedRef.current) {
      justLoadedRef.current = false;
      savedTickRef.current = store.historyTick;
      setDirty(restoredDraftRef.current);
      restoredDraftRef.current = false;
      return;
    }
    if (store.historyTick !== savedTickRef.current) setDirty(true);
  }, [store.historyTick]);

  type SaveRequest = { silent: boolean; composition: Composition; tick: number; name: string };
  const saveMutation = useMutation({
    mutationFn: async (request: SaveRequest) => {
      const snapshotComposition = request.composition;
      let id = projectId;
      if (!id) {
        const row = await create({
          data: { name: request.name, aspectRatio: snapshotComposition.aspectRatio, ...(sourceAdId ? { sourceAdId } : {}) },
        });
        id = (row as { id: string }).id;
        setProjectId(id);
      }
      if (!id) throw new Error("Le projet n'a pas pu être créé.");
      const res = (await save({
        data: {
          id,
          name: request.name,
          composition: snapshotComposition,
        },
      })) as { clipCount: number };
      return { tick: request.tick, clipCount: res?.clipCount ?? 0, silent: request.silent, id };
    },
    // Zéro retry sur permission/validation : rejouer donnerait la même erreur.
    retry: (failureCount, error) => isTransientError(error) && failureCount < 2,
    retryDelay: (attempt) => Math.min(800 * 2 ** attempt, 4_000),
    onSuccess: (res) => {
      savedTickRef.current = res.tick;
      const fullySaved = historyTickRef.current === res.tick;
      setDirty(!fullySaved);
      setSaveFailed(false);
      setBlockingError(null);
      setDraftUnsynced(false);
      setLastSavedAt(Date.now());
      try {
        window.localStorage.setItem(LAST_PROJECT_KEY, res.id);
        if (fullySaved) {
          window.localStorage.removeItem(`${DRAFT_PREFIX}${res.id}`);
          window.localStorage.removeItem(`${DRAFT_PREFIX}new`);
        }
      } catch {
        /* stockage indisponible : sans conséquence */
      }
      // Vignette en arrière-plan : n'attend pas et ne bloque pas la sauvegarde.
      refreshThumbnail(res.id, store.composition);
      if (!res.silent) {
        toast.success(
          res.clipCount > 0 ? `Projet enregistré (${res.clipCount} clips)` : "Projet enregistré",
        );
      }
    },
    onError: (e: unknown, vars) => {
      setSaveFailed(true);
      setDraftUnsynced(true);
      if (!isTransientError(e)) {
        // Erreur définitive : on bloque au lieu d'afficher une puce « Réessayer »
        // qui échouera indéfiniment.
        setBlockingError(
          /row-level security|permission|forbidden|unauthorized/i.test(String((e as Error)?.message ?? ""))
            ? "Tu n'as pas la permission de modifier ce projet. Le propriétaire de l'espace peut te l'accorder, ou tu peux le dupliquer dans tes projets."
            : friendlyApiError(e, "Enregistrement refusé par le serveur."),
        );
        return;
      }
      if (!vars.silent) toast.error(friendlyApiError(e, "Enregistrement impossible, réessaie."));
    },
  });

  /** Capture la 1re image d'un média du projet (t≈0) — jamais bloquant. */
  const captureThumbnail = useCallback(async (comp: Composition): Promise<string | null> => {
    let src: string | undefined;
    let isVideo = false;
    for (const track of comp.tracks) {
      for (const clip of track.clips) {
        if (clip.kind !== "video" || !clip.src) continue;
        src = clip.src;
        isVideo = (clip.sourceDuration ?? 0) > 0 || /\.(mp4|webm|mov)(\?|#|$)/i.test(clip.src);
        break;
      }
      if (src) break;
    }
    if (!src) return null;
    const draw = (el: HTMLVideoElement | HTMLImageElement, w: number, h: number) => {
      const canvas = document.createElement("canvas");
      const scale = Math.min(1, 480 / Math.max(w, h));
      canvas.width = Math.max(2, Math.round(w * scale));
      canvas.height = Math.max(2, Math.round(h * scale));
      const ctx = canvas.getContext("2d");
      if (!ctx) return null;
      ctx.drawImage(el, 0, 0, canvas.width, canvas.height);
      return canvas.toDataURL("image/jpeg", 0.72);
    };
    try {
      if (!isVideo) {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = src;
        await img.decode();
        return draw(img, img.naturalWidth, img.naturalHeight);
      }
      const video = document.createElement("video");
      video.crossOrigin = "anonymous";
      video.muted = true;
      video.playsInline = true;
      video.preload = "metadata";
      video.src = src;
      await new Promise<void>((resolve, reject) => {
        const done = () => resolve();
        video.onseeked = done;
        video.onerror = () => reject(new Error("video"));
        video.onloadeddata = () => {
          try {
            video.currentTime = 0.1;
          } catch {
            done();
          }
        };
        window.setTimeout(() => reject(new Error("timeout")), 8000);
      });
      return draw(video, video.videoWidth || 720, video.videoHeight || 1280);
    } catch {
      return null;
    }
  }, []);

  const refreshThumbnail = useCallback(
    (id: string, comp: Composition) => {
      const now = Date.now();
      if (now - lastThumbAtRef.current < 120_000) return;
      lastThumbAtRef.current = now;
      void (async () => {
        const dataUrl = await captureThumbnail(comp);
        if (!dataUrl) return;
        try {
          await uploadThumb({ data: { id, dataUrl } });
          void queryClient.invalidateQueries({ queryKey: ["editor-projects"] });
        } catch {
          /* vignette non critique */
        }
      })();
    },
    [captureThumbnail, uploadThumb, queryClient],
  );

  const queueSave = (silent = true) => {
    if (readOnly || loadingProject || saveMutation.isPending) return;
    saveMutation.mutate({
      silent,
      composition: structuredClone(store.composition),
      tick: store.historyTick,
      name: projectName,
    });
  };

  const duplicateToMine = async () => {
    if (!projectId) return;
    try {
      const copy = (await duplicate({ data: { id: projectId } })) as { id: string };
      setBlockingError(null);
      void queryClient.invalidateQueries({ queryKey: ["editor-projects"] });
      toast.success("Copie créée dans tes projets");
      await openProject(copy.id);
    } catch (e) {
      toast.error(friendlyApiError(e, "Duplication impossible."));
    }
  };

  /**
   * Projet resté totalement vide et jamais renommé : on le supprime en partant
   * (hard delete, il n'y a rien à récupérer) pour ne pas polluer la galerie.
   */
  const discardIfEmpty = useCallback(async () => {
    const id = projectIdRef.current;
    if (!id || readOnlyRef.current) return;
    const comp = compositionRef.current;
    const clips = comp.tracks.reduce((n, t) => n + t.clips.length, 0);
    if (clips > 0) return;
    if (!/^Projet du \d{2}\/\d{2} à \d{2}:\d{2}$/.test(nameRef.current.trim())) return;
    try {
      await discardEmpty({ data: { id } });
      void queryClient.invalidateQueries({ queryKey: ["editor-projects"] });
    } catch {
      /* nettoyage silencieux */
    }
  }, [discardEmpty, queryClient]);

  const saveAndLeave = async () => {
    if (!onBack) return;
    if (readOnly || !dirty || saveMutation.isPending) {
      await discardIfEmpty();
      onBack();
      return;
    }
    try {
      await saveMutation.mutateAsync({
        silent: true,
        composition: structuredClone(store.composition),
        tick: store.historyTick,
        name: projectName,
      });
      await discardIfEmpty();
      void queryClient.invalidateQueries({ queryKey: ["editor-projects"] });
      onBack();
    } catch {
      toast.error("Le projet n’a pas pu être enregistré. Réessaie avant de quitter.");
    }
  };

  // Brouillon léger : protège le montage même si le réseau ou le serveur se déconnecte.
  useEffect(() => {
    if (!dirty || loadingProject || readOnly) return;
    const key = `${DRAFT_PREFIX}${projectId ?? "new"}`;
    try {
      window.localStorage.setItem(
        key,
        JSON.stringify({ composition: store.composition, name: projectName, savedAt: Date.now() }),
      );
    } catch {
      /* quota privé/local indisponible : l'autosave réseau continue */
    }
  }, [dirty, loadingProject, readOnly, projectId, projectName, store.composition, store.historyTick]);

  // Une seule requête à la fois. Si le montage a changé durant la requête,
  // dirty reste vrai et ce même effet envoie immédiatement la dernière version.
  useEffect(() => {
    if (readOnly || !dirty || loadingProject || saveMutation.isPending || saveFailed) return;
    const t = window.setTimeout(() => queueSave(true), 1200);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [readOnly, dirty, loadingProject, saveMutation.isPending, saveFailed, store.historyTick]);

  // Garde armée dès qu'une modification n'est pas confirmée par le serveur
  // (en attente, en cours ou en échec). Jamais en lecture seule.
  useEffect(() => {
    if (readOnly || !dirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [readOnly, dirty]);



  // Démontage / changement de projet : purge du projet vide abandonné.
  useEffect(() => () => { void discardIfEmpty(); }, [discardIfEmpty]);

  const openProject = async (id: string) => {
    setLoadingProject(true);
    setPlaying(false);
    try {
      const row = (await getProject({ data: { id } })) as
        | {
            id: string;
            name: string;
            composition: Composition | null;
            can_edit?: boolean;
            owner_name?: string | null;
          }
        | null;
      if (!row) {
        toast.error("Projet introuvable.");
        return;
      }
      const editable = row.can_edit !== false;
      setReadOnly(!editable);
      setOwnerName(row.owner_name ?? null);
      const serverComposition = normalizeTiming(normalizeComposition(row.composition));
      let comp = serverComposition;
      let restoredDraft = false;
      try {
        const local = editable ? window.localStorage.getItem(`${DRAFT_PREFIX}${row.id}`) : null;
        if (local) {
          const draft = JSON.parse(local) as { composition?: unknown; name?: string };
          comp = normalizeTiming(normalizeComposition(draft.composition));
          if (draft.name) setProjectName(draft.name);
          restoredDraft = true;
          toast.info("Brouillon local restauré");
        }
      } catch {
        comp = serverComposition;
      }
      restoredDraftRef.current = restoredDraft;
      justLoadedRef.current = true;
      autoFitDoneRef.current = false;
      store.replaceComposition(comp);

      setProjectId(row.id);
      const src = (row as { source_ad_id?: string | null }).source_ad_id;
      if (src) setSourceAdId(src);
      if (comp === serverComposition) setProjectName(row.name);
      lastValidNameRef.current = (row.name ?? "").trim() || defaultProjectName();
      setTime(0);
      setDirty(restoredDraft);
      setSaveFailed(false);
      setBlockingError(null);
      // Un brouillon restauré n'a jamais été confirmé par le serveur.
      setDraftUnsynced(restoredDraft);

      savedTickRef.current = store.historyTick;
      try {
        window.localStorage.setItem(LAST_PROJECT_KEY, row.id);
      } catch {
        /* stockage indisponible */
      }
    } catch (e) {
      toast.error(friendlyApiError(e, "Chargement du projet impossible."));
    } finally {
      setLoadingProject(false);
    }
  };

  /**
   * GRW-17 : zoom ajusté à la durée du projet à l'ouverture et au premier clip
   * d'un projet vide. Une fois fait, le zoom manuel de l'utilisateur est
   * respecté (on ne réajuste plus tant qu'un autre projet n'est pas chargé).
   */
  const autoFitDoneRef = useRef(false);
  useEffect(() => {
    if (autoFitDoneRef.current) return;
    if (store.duration <= 0.2) return;
    autoFitDoneRef.current = true;
    requestFit();
  }, [store.duration, requestFit]);



  /** Ouverture du projet demandé (galerie) ou du dernier projet travaillé. */
  const autoOpenedRef = useRef(false);
  useEffect(() => {
    if (autoOpenedRef.current || projectId) return;
    if (initialProjectId) {
      autoOpenedRef.current = true;
      void openProject(initialProjectId);
      return;
    }
    // En mode galerie, un nouveau projet part toujours d'une timeline vierge.
    if (onBack) return;
    let last: string | null = null;
    try {
      last = window.localStorage.getItem(LAST_PROJECT_KEY);
    } catch {
      last = null;
    }
    if (!last) return;
    autoOpenedRef.current = true;
    void openProject(last);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialProjectId]);

  const renameProject = async () => {
    const name = projectName.trim();
    if (!projectId || !name) return;
    try {
      await rename({ data: { id: projectId, name } });
      void queryClient.invalidateQueries({ queryKey: ["editor-projects"] });
    } catch {
      /* le renommage sera repris au prochain enregistrement */
    }
  };



  // ---------- ajout de médias ----------
  const addMedia = (
    url: string,
    name: string,
    kind: "video" | "image",
    durationHint?: number,
    at?: number,
    overlay = false,
  ) => {
    // GRW-4 : « Remplacer le média » — on remplace la source du clip visé en
    // conservant start / duration / trim / transformations.
    const replacing = replaceTargetRef.current;
    if (replacing) {
      replaceTargetRef.current = null;
      store.updateClip(replacing, { src: url, name });
      toast.success("Média remplacé");
      return;
    }
    // GRW-9 : le média va à la suite sur la piste principale. Un nouveau
    // calque n'est créé que si l'appelant le demande explicitement.
    const targetTime = at ?? time;

    const opts = overlay
      ? { at: Math.max(0, targetTime), newTrack: true }
      : { at: Math.max(0, targetTime) };


    if (kind === "video") {
      const el = document.createElement("video");
      el.preload = "metadata";
      el.src = url;
      el.onloadedmetadata = () => {
        const d = Number.isFinite(el.duration) && el.duration > 0 ? el.duration : (durationHint ?? 5);
        store.addClip({ kind: "video", name, src: url, duration: d, sourceDuration: d }, opts);
      };
      el.onerror = () =>
        store.addClip({ kind: "video", name, src: url, duration: durationHint ?? 5 }, opts);
    } else {
      store.addClip({ kind: "video", name, src: url, duration: 4 }, opts);
    }
  };

  /** Vidéo envoyée depuis le chat / les créations : import automatique une seule fois. */
  const importedRef = useRef(false);
  useEffect(() => {
    if (importedRef.current || !initialVideoUrl || initialProjectId) return;
    importedRef.current = true;
    addMedia(initialVideoUrl, initialVideoName || "Vidéo", "video");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialVideoUrl, initialProjectId]);




  const addAudio = (url: string, name: string, durationHint?: number) => {
    const el = new Audio(url);
    el.preload = "metadata";
    el.onloadedmetadata = () => {
      const d = Number.isFinite(el.duration) && el.duration > 0 ? el.duration : (durationHint ?? 8);
      store.addClip({ kind: "audio", name, src: url, duration: d, sourceDuration: d });
    };
    el.onerror = () => store.addClip({ kind: "audio", name, src: url, duration: durationHint ?? 8 });
  };

  /**
   * Vérifie que le navigateur sait décoder le fichier avant de l'importer :
   * un .mov/HEVC (iPhone, Mac) s'uploade sans erreur mais reste illisible et
   * la timeline affichait « Média introuvable ».
   */
  const canBrowserPlay = (file: File) =>
    new Promise<boolean>((resolve) => {
      if (!file.type.startsWith("video/")) return resolve(true);
      const url = URL.createObjectURL(file);
      const probe = document.createElement("video");
      probe.preload = "metadata";
      probe.muted = true;
      const done = (ok: boolean) => {
        probe.onloadedmetadata = null;
        probe.onerror = null;
        URL.revokeObjectURL(url);
        resolve(ok);
      };
      probe.onloadedmetadata = () => done(probe.videoWidth > 0);
      probe.onerror = () => done(false);
      window.setTimeout(() => done(true), 8000);
      probe.src = url;
    });

  const uploadFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    const { data: auth } = await supabase.auth.getUser();
    const uid = auth.user?.id;
    if (!uid) return;
    let imported = 0;
    for (const file of Array.from(files)) {
      if (!(await canBrowserPlay(file))) {
        toast.error(
          `${file.name} : ce format vidéo n'est pas lisible dans le navigateur. Convertis-le en MP4 (H.264) puis réessaie.`,
        );
        continue;
      }
      const nameExt = file.name.includes(".") ? file.name.split(".").pop()!.toLowerCase() : "";
      const isVideo = file.type.startsWith("video/");
      const isAudio = file.type.startsWith("audio/");
      // Sans extension exploitable, le lecteur traitait la vidéo comme une
      // image : on impose une extension cohérente avec le type MIME.
      const ext = /^[a-z0-9]{2,5}$/.test(nameExt)
        ? nameExt
        : isVideo
          ? "mp4"
          : isAudio
            ? "mp3"
            : "jpg";
      const path = `${uid}/editor/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage
        .from("tram-assets")
        .upload(path, file, { contentType: file.type || undefined, upsert: false });
      if (error) {
        toast.error(`Import impossible : ${file.name} (${error.message})`);
        continue;
      }
      const { data: signed } = await supabase.storage
        .from("tram-assets")
        .createSignedUrl(path, 60 * 60 * 12);
      const url = signed?.signedUrl;
      if (!url) {
        toast.error(`Lien du média indisponible : ${file.name}`);
        continue;
      }
      imported++;
      if (isAudio) addAudio(url, file.name);
      else addMedia(url, file.name, isVideo ? "video" : "image");
    }
    if (imported > 0) toast.success(imported > 1 ? `${imported} médias importés` : "Média importé");
  };


  /**
   * Certains médias sont ajoutés avant que le navigateur connaisse leur durée :
   * le clip retombe alors sur la valeur par défaut (5 s) et le montage semble
   * s'arrêter trop tôt. On sonde la métadonnée et on rétablit la vraie durée.
   */
  const probedRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    for (const track of store.composition.tracks) {
      for (const clip of track.clips) {
        if (!clip.src || clip.sourceDuration || probedRef.current.has(clip.id)) continue;
        if (!isVideoUrl(clip.src)) continue;
        if (Math.abs(clip.duration - 5) > 0.001) continue; // durée déjà choisie
        probedRef.current.add(clip.id);
        const probe = document.createElement("video");
        probe.preload = "metadata";
        probe.muted = true;
        probe.onloadedmetadata = () => {
          const real = probe.duration;
          if (!Number.isFinite(real) || real <= 0) return;
          const usable = Math.max(0.2, real - (clip.trimStart || 0));
          store.updateClip(
            clip.id,
            { sourceDuration: real, duration: usable },
            { silent: true },
          );
        };
        probe.src = clip.src;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.composition.tracks]);

  // ---------- export ----------
  const runExport = async (target: "download" | "creations" = "download") => {
    const renderer = rendererRef.current;
    if (!renderer || duration <= 0) {
      toast.error("Ajoute au moins un clip avant d'exporter.");
      return;
    }
    // GRW-4 : un projet ouvert depuis longtemps peut avoir des jetons expirés —
    // on re-signe les médias juste avant le rendu.
    await refreshSignedMedia();

    // GRW-3 : un trou vidéo > 3 s exporterait de l'écran noir.
    const exportGaps = findGaps(store.composition);
    if (exportGaps.length > 0) {
      const msg =
        exportGaps.length === 1
          ? `1 trou de ${Math.round(exportGaps[0]!.duration)} s sans vidéo — la vidéo sera noire à cet endroit.`
          : `${exportGaps.length} trous sans vidéo — la vidéo sera noire à ces endroits.`;
      const tighten = window.confirm(`${msg}\n\nOK : resserrer la timeline. Annuler : exporter quand même.`);
      if (tighten) {
        store.commit((d) => tightenTimeline(d));
        toast.success("Timeline resserrée, relance l'export.");
        return;
      }
    }
    setExporting(true);
    setExportRatio(0);
    setPlaying(false);
    // L'export doit TOUJOURS partir du début de la timeline, quelle que soit
    // la position du curseur : on remet la tête de lecture à 0 (état React +
    // renderer) et on laisse les médias se recaler avant de capturer.
    setTime(0);
    renderer.setTime(0);
    await new Promise((r) => setTimeout(r, 250));
    try {
      const mod = await import("@/lib/editor/export.client");
      const { blob, fileName } = await mod.exportComposition(renderer, duration, {
        fileName: projectName.replace(/[^\w-]+/g, "-").toLowerCase() || "growthity-export",
        onProgress: setExportRatio,
      });

      if (target === "download") {
        mod.downloadBlob(blob, fileName);
        toast.success("Export terminé");
      } else {
        const { data: auth } = await supabase.auth.getUser();
        const uid = auth.user?.id;
        if (!uid) throw new Error("Session expirée, reconnecte-toi.");
        const ext = fileName.split(".").pop() || "webm";
        const path = `${uid}/editor-exports/${crypto.randomUUID()}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("tram-assets")
          .upload(path, blob, { contentType: blob.type || "video/webm", upsert: false });
        if (upErr) throw new Error(upErr.message);
        const hasSubtitles = store.composition.tracks.some((t) => t.kind === "text" && (t.clips?.length ?? 0) > 0);
        const saved = await saveExportToAds({
          data: { path, title: projectName, sourceAdId: sourceAdId ?? null, projectId: projectIdRef.current ?? null, sourceUrls: store.composition.tracks.flatMap((t) => (t.clips ?? []).map((c) => String((c as { src?: string }).src ?? ""))).filter(Boolean).slice(0, 30), versionLabel: hasSubtitles ? "Sous-titrée" : "Montage éditeur" },
        });
        void queryClient.invalidateQueries({ queryKey: ["ads"] });
        toast.success(saved?.conversationId ? "Nouvelle version enregistrée dans la discussion d'origine" : "Vidéo ajoutée à tes créations");
      }
    } catch (e) {
      toast.error(friendlyApiError(e, "Export impossible, réessaie."));
    } finally {
      setExporting(false);
      setTime(0);
    }
  };

  // ---------- raccourcis clavier (GRW-15) ----------
  /** Duplique le clip sélectionné juste après lui, sur la même piste. */
  const duplicateSelectedClip = useCallback(() => {
    const found = store.selected;
    if (!found) return;
    const { clip, track } = found;
    const copy = structuredClone(clip) as Partial<Clip>;
    delete copy.id;
    store.addClip({ ...copy, kind: clip.kind, name: `${clip.name} (copie)` }, {
      at: clip.start + clip.duration,
      trackId: track.id,
    });
  }, [store]);


  const shortcutActions = useMemo(
    () => ({
      togglePlay: () => setPlaying((p) => !p),
      nudge: (seconds: number) =>
        setTime((t) => Math.max(0, Math.min(store.duration, t + seconds))),
      gotoStart: () => setTime(0),
      gotoEnd: () => setTime(store.duration),
      undo: store.undo,
      redo: store.redo,
      split: () => store.selectedClipId && store.splitClip(store.selectedClipId, timeRef.current),
      deleteSelected: () => store.selectedClipId && store.removeClip(store.selectedClipId),
      duplicateSelected: duplicateSelectedClip,
      deselect: () => store.setSelectedClipId(null),
      zoomIn: () => setZoom((z) => Math.min(400, Math.round(z * 1.3))),
      zoomOut: () => setZoom((z) => Math.max(10, Math.round(z / 1.3))),
      fitTimeline: requestFit,
      openHelp: () => setShortcutsOpen(true),
    }),
    [store, duplicateSelectedClip, requestFit],
  );

  useEditorShortcuts({ readOnly, actions: shortcutActions });


  const aspect = store.composition.aspectRatio;
  const stageSize = aspectSize(aspect);

  // ---------- recadrage manuel ----------
  const reframeTarget = useMemo(() => {
    const sel = store.selected?.clip;
    if (sel && sel.kind !== "audio") return sel;
    for (const track of store.composition.tracks) {
      if (track.kind !== "video") continue;
      const c = track.clips.find((cl) => time >= cl.start && time < cl.start + cl.duration);
      if (c) return c;
    }
    return null;
  }, [store.selected, store.composition, time]);

  /** Boîte réelle du clip sélectionné à l'écran (fractions de la scène). */
  const [selBox, setSelBox] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  /** Repères d'alignement affichés pendant un déplacement (centrage). */
  const [guides, setGuides] = useState({ v: false, h: false });
  /** Édition du texte directement sur l'aperçu (double-clic), façon CapCut. */
  const [editingTextId, setEditingTextId] = useState<string | null>(null);

  const reframeDrag = useRef<{ px: number; py: number; x: number; y: number; w: number; h: number } | null>(null);
  /** Dernier cadrage appliqué pendant un glissement (commit à la fin). */
  const lastFrameRef = useRef<{ x: number; y: number; scale: number } | null>(null);


  /**
   * Recadrage libre façon CapCut : le glissement déplace le média n'importe où
   * dans le cadre (y compris hors-cadre), le zoom reste un contrôle séparé.
   */
  const MIN_SCALE = 0.1;
  const MIN_MEDIA_SCALE = 0.1;
  const MAX_SCALE = 6;
  const effectiveScale = (clip: Clip) =>
    Math.max(clip.kind === "text" ? MIN_SCALE : MIN_MEDIA_SCALE, clip.scale || 1);
  const clampFrame = (clip: Clip, x: number, y: number, scale: number) => {
    const minScale = clip.kind === "text" ? MIN_SCALE : MIN_MEDIA_SCALE;
    const nextScale = Number(Math.max(minScale, Math.min(MAX_SCALE, scale)).toFixed(3));
    if (clip.kind === "text") {
      return {
        x: Math.max(-1.5, Math.min(2.5, x)),
        y: Math.max(-1.5, Math.min(2.5, y)),
        scale: nextScale,
      };
    }

    return {
      x: Math.max(-1.5, Math.min(2.5, x)),
      y: Math.max(-1.5, Math.min(2.5, y)),
      scale: nextScale,
    };
  };


  /** Applique un cadrage : à tous les sous-titres si l'option est active. */
  const applyFrame = (
    clip: Clip,
    changes: Partial<Clip>,
    options?: { silent?: boolean },
  ) => {
    if (clip.kind === "text" && textApplyAll.current) {
      store.updateAllTextClips(changes, undefined, { ...options, scope: textScopeOf(store.composition, clip.id) });
    } else {
      store.updateClip(clip.id, changes, options);
    }
  };

  const onReframeDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!reframeTarget) return;
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const scale = effectiveScale(reframeTarget);
    // Le glissement ne touche jamais au zoom : celui-ci est exclusivement
    // contrôlé par la molette et le curseur dédié.
    reframeDrag.current = {
      px: e.clientX,
      py: e.clientY,
      x: reframeTarget.x,
      y: reframeTarget.y,
      w: rect.width || 1,
      h: rect.height || 1,
    };
    lastFrameRef.current = { x: reframeTarget.x, y: reframeTarget.y, scale };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onReframeMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = reframeDrag.current;
    if (!d || !reframeTarget) return;
    e.preventDefault();
    const scale = lastFrameRef.current?.scale ?? (reframeTarget.scale || 1);
    const next = clampFrame(
      reframeTarget,
      d.x + (e.clientX - d.px) / d.w,
      d.y + (e.clientY - d.py) / d.h,
      scale,
    );
    // Aimantation au centre + repères visuels (comme CapCut).
    const gv = Math.abs(next.x - 0.5) < 0.014;
    const gh = Math.abs(next.y - 0.5) < 0.014;
    if (gv) next.x = 0.5;
    if (gh) next.y = 0.5;
    setGuides((g) => (g.v === gv && g.h === gh ? g : { v: gv, h: gh }));
    lastFrameRef.current = next;
    applyFrame(reframeTarget, { x: next.x, y: next.y, scale: next.scale }, { silent: true });
  };


  const onReframeUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!reframeDrag.current) return;
    const d = reframeDrag.current;
    reframeDrag.current = null;
    setGuides({ v: false, h: false });
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
    // point d'historique une fois le glissement terminé
    const last = lastFrameRef.current;
    lastFrameRef.current = null;
    if (reframeTarget && last && (d.x !== last.x || d.y !== last.y)) {
      applyFrame(reframeTarget, { x: last.x, y: last.y, scale: last.scale });
    }
  };


  // ---------- poignées de redimensionnement ----------
  const stageBoxRef = useRef<HTMLDivElement | null>(null);
  const stageWrapRef = useRef<HTMLDivElement | null>(null);

  /** Taille de l'aperçu calculée pour tenir dans la zone quel que soit le format. */
  const [stageBox, setStageBox] = useState({ w: 0, h: 0 });
  useEffect(() => {
    const el = stageWrapRef.current;
    if (!el) return;
    const compute = () => {
      const pad = 12;
      // GRW-13 : jamais moins de 320 px de canvas tant que la fenêtre est large.
      const floor = typeof window !== "undefined" && window.innerWidth >= 1024 ? 320 : 80;
      const availW = Math.max(floor, el.clientWidth - pad);
      const availH = Math.max(80, el.clientHeight - pad);
      const ratio = stageSize.w / stageSize.h;
      let w = availW;
      let h = w / ratio;
      if (h > availH) {
        h = availH;
        w = h * ratio;
      }
      setStageBox({ w: Math.round(w), h: Math.round(h) });
    };
    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(el);
    return () => ro.disconnect();
  }, [stageSize.w, stageSize.h]);



  /** Suit en continu la boîte réelle du clip sélectionné (rendu PixiJS). */
  useEffect(() => {
    const id = reframeTarget?.id ?? null;
    if (!id) {
      setSelBox(null);
      return;
    }
    let raf = 0;
    const loop = () => {
      const b = rendererRef.current?.clipBounds(id) ?? null;
      setSelBox((prev) => {
        if (!b) return prev === null ? prev : null;
        if (
          prev &&
          Math.abs(prev.x - b.x) < 0.0008 &&
          Math.abs(prev.y - b.y) < 0.0008 &&
          Math.abs(prev.w - b.w) < 0.0008 &&
          Math.abs(prev.h - b.h) < 0.0008
        )
          return prev;
        return b;
      });
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [reframeTarget?.id]);

  /** Zoom molette / pinch trackpad + pan, ancrés sur le curseur, toujours clampés. */
  const wheelStateRef = useRef<{
    clip: Clip | null;
    clampFrame: (clip: Clip, x: number, y: number, scale: number) => { x: number; y: number; scale: number };
  }>({ clip: null, clampFrame: (c, x, y, scale) => ({ x, y, scale }) });
  const applyFrameRef = useRef(applyFrame);
  applyFrameRef.current = applyFrame;
  wheelStateRef.current.clip = reframeTarget;
  wheelStateRef.current.clampFrame = clampFrame;
  useEffect(() => {
    const el = stageBoxRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      const clip = wheelStateRef.current.clip;
      if (!clip) return;
      // Un simple défilement au-dessus de l'aperçu ne doit jamais modifier le
      // cadrage : le zoom demande un pinch trackpad (ctrl/⌘) ou la touche Alt.
      const zoomGesture = e.ctrlKey || e.metaKey || e.altKey;
      if (!zoomGesture) return;
      e.preventDefault();
      const clampIt = wheelStateRef.current.clampFrame;
      const dy = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 100 : 1);
      const rect = el.getBoundingClientRect();
      const minScale = clip.kind === "text" ? MIN_SCALE : MIN_MEDIA_SCALE;
      const base = effectiveScale(clip);
      const target = Math.max(minScale, Math.min(MAX_SCALE, base * Math.exp(-dy * 0.0015)));
      // ancrage sur le curseur : le point survolé reste au même endroit
      const u = (e.clientX - rect.left) / Math.max(1, rect.width);
      const v = (e.clientY - rect.top) / Math.max(1, rect.height);
      const k = target / base;
      const next = clampIt(clip, u - (u - clip.x) * k, v - (v - clip.y) * k, target);
      applyFrameRef.current(clip, next, { silent: true });
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [store]);


  const transformDrag = useRef<
    | {
        clipId: string;
        corner: "nw" | "ne" | "sw" | "se";
        baseScale: number;
        centerX: number;
        centerY: number;
        startDistance: number;
        baseX: number;
        baseY: number;
        lastScale: number;
        lastX: number;
        lastY: number;
      }
    | null
  >(null);

  /** Poignées d'angle : zoom centré, sans déplacer le média dans le cadre. */
  const onHandleDown = (e: React.PointerEvent<HTMLDivElement>, corner: "nw" | "ne" | "sw" | "se") => {
    if (!reframeTarget) return;
    e.preventDefault();
    e.stopPropagation();
    const rect = stageBoxRef.current?.getBoundingClientRect();
    if (!rect) return;
    const box = selBox ?? { x: 0, y: 0, w: 1, h: 1 };
    const left = rect.left + box.x * rect.width;
    const top = rect.top + box.y * rect.height;
    const right = left + box.w * rect.width;
    const bottom = top + box.h * rect.height;
    const centerX = (left + right) / 2;
    const centerY = (top + bottom) / 2;
    const baseScale = effectiveScale(reframeTarget);
    transformDrag.current = {
      clipId: reframeTarget.id,
      corner,
      baseScale,
      centerX,
      centerY,
      startDistance: Math.max(12, Math.hypot(e.clientX - centerX, e.clientY - centerY)),
      baseX: reframeTarget.x,
      baseY: reframeTarget.y,
      lastScale: baseScale,
      lastX: reframeTarget.x,
      lastY: reframeTarget.y,
    };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onHandleMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = transformDrag.current;
    if (!d || !reframeTarget) return;
    e.preventDefault();
    e.stopPropagation();
    // La distance au centre pilote directement le zoom. Cette formule est la
    // même pour les quatre coins et continue de fonctionner hors de l'aperçu.
    const distance = Math.hypot(e.clientX - d.centerX, e.clientY - d.centerY);
    const scaleRatio = Math.max(0.05, distance / d.startDistance);
    const next = clampFrame(
      reframeTarget,
      d.baseX,
      d.baseY,
      d.baseScale * scaleRatio,
    );
    d.lastScale = next.scale;
    d.lastX = next.x;
    d.lastY = next.y;
    applyFrame(reframeTarget, next, { silent: true });
  };

  const onHandleUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = transformDrag.current;
    if (!d) return;
    transformDrag.current = null;
    e.stopPropagation();
    if ((e.currentTarget as HTMLElement).hasPointerCapture(e.pointerId)) {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    }
    if (
      reframeTarget &&
      (d.lastScale !== d.baseScale || d.lastX !== d.baseX || d.lastY !== d.baseY)
    ) {
      applyFrame(reframeTarget, { x: d.lastX, y: d.lastY, scale: d.lastScale });
    }
  };




  // Plancher de sécurité. La route affiche normalement son écran mobile avant
  // de monter l'éditeur, ce garde protège aussi les intégrations directes.
  if (tooSmall) {
    return (
      <div className="gx-page">
        <header className="gx-ph">
          <div>
            <h1>Éditeur vidéo</h1>
          </div>
        </header>
        <div className="gx-empty">
          <Maximize className="gx-i" />
          <b>Passe sur ordinateur</b>
          <span>
            L'éditeur vidéo nécessite un grand écran pour déplacer les séquences et régler la timeline avec précision.
          </span>
          {onBack ? (
            <button type="button" className="gx-btn" onClick={onBack}>
              <ChevronLeft className="gx-i" /> Retour
            </button>
          ) : null}
        </div>
      </div>
    );
  }

  /** Sous-titre de l'en-tête : « Pub … · enregistré automatiquement à 10:42 ». */
  const saveLabel = readOnly
    ? `projet de ${ownerName ?? "un membre de l'équipe"} — lecture seule`
    : saveMutation.isPending
      ? "enregistrement…"
      : saveFailed
        ? "sauvegarde interrompue"
        : dirty
          ? "modifications non enregistrées"
          : lastSavedAt
            ? `enregistré automatiquement à ${new Date(lastSavedAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`
            : "enregistrement automatique activé";
  const exportPct = `${Math.round(exportRatio * 100)} %`;

  return (
    <div className="gx-page gx-edp" data-narrow={narrow ? "1" : undefined}>
      <header className="gx-ph">
        <div>
          <h1>Éditeur vidéo</h1>
          <p className="gx-ed-sub">
            <input
              className="gx-ed-name"
              aria-label="Nom du projet"
              value={projectName}
              size={Math.max(8, Math.min(48, projectName.length + 1))}
              onChange={(e) => setProjectName(e.target.value)}
              onBlur={() => {
                const trimmed = projectName.trim();
                if (!trimmed) {
                  setProjectName(lastValidNameRef.current);
                  return;
                }
                if (trimmed !== projectName) setProjectName(trimmed);
                lastValidNameRef.current = trimmed;
                void renameProject();
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") (e.currentTarget as HTMLInputElement).blur();
              }}
            />
            <span aria-hidden>·</span>
            <span>{saveLabel}</span>
            {!readOnly && saveFailed && !blockingError ? (
              <button type="button" className="gx-btn gx-sm" onClick={() => queueSave(false)}>
                Réessayer
              </button>
            ) : null}
            {!readOnly && draftUnsynced ? (
              <span className="gx-st gx-bad">Modifications locales non enregistrées sur le serveur</span>
            ) : null}
          </p>
        </div>
        <div className="gx-pa">
          {onBack ? (
            <button
              type="button"
              className="gx-ib"
              aria-label="Retour aux projets"
              title="Retour aux projets"
              onClick={() => void saveAndLeave()}
              disabled={saveMutation.isPending}
            >
              <ChevronLeft className="gx-i" />
            </button>
          ) : null}
          {/* GRW-21 : un seul champ de nom ; ici un simple chevron pour changer de projet */}
          <Select
            open={projectPickerOpen}
            onOpenChange={setProjectPickerOpen}
            value={projectId ?? "new"}
            onValueChange={(v) => {
              if (v === "new") {
                setProjectId(null);
                setProjectName(defaultProjectName());
                store.replaceComposition(emptyComposition("9:16"));
                setTime(0);
                setDirty(false);
                return;
              }
              void openProject(v);
            }}
          >
            <SelectTrigger
              aria-label="Changer de projet"
              title="Changer de projet"
              className="gx-ib [&>svg:last-child]:hidden"
            >
              {loadingProject ? <Loader2 className="gx-i animate-spin" /> : <FolderOpen className="gx-i" />}
            </SelectTrigger>
            <SelectContent className="console-app-portal max-h-80">
              <SelectItem value="new">Nouveau projet</SelectItem>
              {(projects.data ?? []).map(
                (p: { id: string; name: string; thumbnail_url?: string | null; updated_at?: string }) => (
                  <SelectItem key={p.id} value={p.id}>
                    <span className="gx-ed-pick">
                      {p.thumbnail_url ? (
                        <img src={p.thumbnail_url} alt="" loading="lazy" />
                      ) : (
                        <span aria-hidden>
                          <ImageIcon className="gx-i" />
                        </span>
                      )}
                      <span>
                        <b>{p.name}</b>
                        {p.updated_at ? (
                          <small>
                            {new Date(p.updated_at).toLocaleString("fr-FR", {
                              day: "2-digit",
                              month: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </small>
                        ) : null}
                      </span>
                    </span>
                  </SelectItem>
                ),
              )}
            </SelectContent>
          </Select>
          {convLink?.conversationId ? (
            <Link
              className="gx-btn"
              to="/create"
              search={{ c: convLink.conversationId, focus: convLink.anchorAdId ?? undefined } as never}
            >
              <MessageSquareIcon className="gx-i" />
              Retour à la discussion
            </Link>
          ) : null}
          <button
            type="button"
            className="gx-ib"
            aria-label="Raccourcis clavier"
            title="Raccourcis clavier · ?"
            onClick={() => setShortcutsOpen(true)}
          >
            <Keyboard className="gx-i" />
          </button>
          <button
            type="button"
            className="gx-btn"
            onClick={() => void runExport("creations")}
            disabled={exporting}
          >
            {exporting ? <Loader2 className="gx-i animate-spin" /> : null}
            {exporting ? exportPct : "Exporter dans mes créations"}
          </button>
          <button
            type="button"
            className="gx-btn gx-pri"
            onClick={() => void runExport("download")}
            disabled={exporting}
          >
            {exporting ? <Loader2 className="gx-i animate-spin" /> : <Download className="gx-i" />}
            {exporting ? exportPct : "Télécharger la vidéo"}
          </button>
        </div>
      </header>

      {readOnly ? (
        <div className="gx-note">
          <span>
            Projet de <b>{ownerName ?? "un membre de l'équipe"}</b> — lecture seule. Tes modifications ne seront pas
            enregistrées.
          </span>
          <button type="button" className="gx-btn gx-sm" onClick={() => void duplicateToMine()}>
            Dupliquer dans mes projets
          </button>
        </div>
      ) : null}

      <Dialog open={Boolean(blockingError)} onOpenChange={(o) => { if (!o) setBlockingError(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tes modifications ne peuvent pas être enregistrées</DialogTitle>
            <DialogDescription>{blockingError}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setBlockingError(null); queueSave(false); }}>
              Réessayer
            </Button>
            <Button onClick={() => void duplicateToMine()} disabled={!projectId}>
              Dupliquer dans mes projets
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="gx-box gx-ed">
        {/* Colonne outils : onglets + panneau actif (re-cliquer l'onglet actif replie le panneau). */}
        <div className="gx-ed-l">
          <div className="gx-vt" role="tablist" aria-label="Outils">
            {PANELS.map((p) => {
              const on = panel === p.key && panelOpen;
              return (
                <button
                  key={p.key}
                  type="button"
                  role="tab"
                  aria-selected={on}
                  className={on ? "gx-on" : undefined}
                  onMouseEnter={() => {
                    if (p.key === "assets") prefetchAssets();
                  }}
                  onClick={() => {
                    if (panel === p.key) setPanelOpen((o) => !o);
                    else {
                      setPanel(p.key);
                      setPanelOpen(true);
                    }
                  }}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
          {panelOpen ? (
            <div className="gx-ed-panel">
              <LeftPanel
                panel={panel}
                store={store}
                currentTime={time}
                onAddMedia={addMedia}
                onAddAudio={addAudio}
                onUpload={uploadFiles}
              />
            </div>
          ) : (
            <small className="gx-hint">Choisis un outil pour l'afficher.</small>
          )}
        </div>

        {/* Aperçu */}
        <div className="gx-ed-c">
          <div className="gx-ed-bar">
            <div className="gx-seg" role="tablist" aria-label="Format de la vidéo">
              {(["9:16", "16:9", "1:1"] as AspectRatio[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  role="tab"
                  aria-selected={aspect === r}
                  onClick={() => {
                    if (r === aspect) return;
                    setPlaying(false);
                    setTime(0);
                    store.setAspectRatio(r);
                    // La sélection doit rester cohérente avec la tête de lecture.
                    const first = store.composition.tracks
                      .find((t) => t.kind === "video")
                      ?.clips.find((c) => c.start <= 0.001);
                    store.setSelectedClipId(first?.id ?? null);
                  }}
                >
                  {r}
                </button>
              ))}
            </div>
            {reframeTarget ? (
              <div className="gx-ed-zoom">
                <span className="gx-num">{Math.round(effectiveScale(reframeTarget) * 100)} %</span>
                <Slider
                  aria-label="Zoom du média"
                  className="w-24"
                  value={[effectiveScale(reframeTarget)]}
                  min={reframeTarget.kind === "text" ? MIN_SCALE : MIN_MEDIA_SCALE}
                  max={6}
                  step={0.01}
                  onValueChange={([value]) =>
                    applyFrame(
                      reframeTarget,
                      clampFrame(reframeTarget, reframeTarget.x, reframeTarget.y, value),
                      { silent: true },
                    )
                  }
                  onValueCommit={([value]) =>
                    applyFrame(reframeTarget, clampFrame(reframeTarget, reframeTarget.x, reframeTarget.y, value))
                  }
                />
                <button
                  type="button"
                  className="gx-ib gx-sm"
                  aria-label="Réinitialiser le cadrage"
                  title="Réinitialiser le cadrage"
                  onClick={() => applyFrame(reframeTarget, { x: 0.5, y: 0.5, scale: 1, rotation: 0 })}
                >
                  <RotateCcw className="gx-i" />
                </button>
              </div>
            ) : null}
          </div>

          <div ref={stageWrapRef} className="gx-ed-stage">
            <div
              ref={stageBoxRef}
              className="relative touch-none"
              style={{ width: stageBox.w || undefined, height: stageBox.h || undefined }}
            >
              <div ref={stageRef} className="gx-ed-canvas" />
              {(() => {
                const activeVisual = store.composition.tracks
                  .filter((track) => track.kind !== "audio" && !track.hidden)
                  .flatMap((track) => track.clips)
                  .find((clip) => clip.src && time >= clip.start && time < clip.start + clip.duration);
                const activeStatus = activeVisual?.src ? mediaStatuses[mediaStatusKey(activeVisual.src)] : null;
                // L'absence d'état peut survenir pendant l'attachement du moteur :
                // ne pas masquer une frame déjà peinte avec un loader indéfini.
                if (!activeVisual?.src || !activeStatus || activeStatus === "ready") return null;
                return (
                  <div className="gx-ed-ov">
                    {activeStatus === "error" ? (
                      <span>
                        <ImageIcon className="gx-i" />
                        Aperçu indisponible
                      </span>
                    ) : (
                      <Loader2 className="gx-i animate-spin" />
                    )}
                  </div>
                );
              })()}
              {/* Recadrage manuel : glisser pour repositionner, double-clic pour éditer un texte. */}
              <div
                className={cn(
                  "absolute inset-0 rounded-[14px]",
                  reframeTarget && !editingTextId ? "cursor-move" : "pointer-events-none",
                )}
                onPointerDown={onReframeDown}
                onPointerMove={onReframeMove}
                onPointerUp={onReframeUp}
                onPointerCancel={onReframeUp}
                onDoubleClick={() => {
                  if (reframeTarget?.kind === "text") setEditingTextId(reframeTarget.id);
                }}
              />

              {/* Repères d'alignement (centrage horizontal / vertical). */}
              {guides.v ? <div className="gx-ed-guide gx-v" /> : null}
              {guides.h ? <div className="gx-ed-guide gx-h" /> : null}

              {/* Cadre de transformation : collé au média / texte réellement affiché. */}
              {reframeTarget && !editingTextId ? (
                <div
                  className="gx-ed-sel"
                  style={
                    selBox
                      ? {
                          // Bornes 0..1 : une mesure obsolète du rendu ne doit
                          // jamais dessiner le cadre hors de l'aperçu.
                          left: `${Math.min(1, Math.max(0, selBox.x)) * 100}%`,
                          top: `${Math.min(1, Math.max(0, selBox.y)) * 100}%`,
                          width: `${Math.min(1, Math.max(0.02, selBox.w)) * 100}%`,
                          height: `${Math.min(1, Math.max(0.02, selBox.h)) * 100}%`,
                        }
                      : { inset: 0 }
                  }
                >
                  {(
                    [
                      { k: "nw", style: { left: -6, top: -6 }, cursor: "nwse-resize" },
                      { k: "ne", style: { right: -6, top: -6 }, cursor: "nesw-resize" },
                      { k: "sw", style: { left: -6, bottom: -6 }, cursor: "nesw-resize" },
                      { k: "se", style: { right: -6, bottom: -6 }, cursor: "nwse-resize" },
                    ] as const
                  ).map((h) => (
                    <div
                      key={h.k}
                      role="presentation"
                      className="gx-ed-hdl"
                      style={{ ...h.style, cursor: h.cursor }}
                      onPointerDown={(e) => onHandleDown(e, h.k)}
                      onPointerMove={onHandleMove}
                      onPointerUp={onHandleUp}
                      onPointerCancel={onHandleUp}
                    />
                  ))}
                  {reframeTarget.kind === "text" ? <span className="gx-ed-tag">Double-clic pour éditer</span> : null}
                </div>
              ) : null}

              {/* Saisie du texte directement sur l'aperçu. */}
              {editingTextId && reframeTarget?.kind === "text" ? (
                <div
                  className="absolute z-40"
                  style={
                    selBox
                      ? {
                          left: `${Math.max(0.02, selBox.x) * 100}%`,
                          top: `${Math.max(0.02, selBox.y) * 100}%`,
                          width: `${Math.min(0.96, Math.max(0.3, selBox.w)) * 100}%`,
                        }
                      : { left: "8%", top: "45%", width: "84%" }
                  }
                >
                  <textarea
                    autoFocus
                    rows={2}
                    className="gx-in gx-ed-txt"
                    value={reframeTarget.text ?? ""}
                    onChange={(e) =>
                      store.updateClip(reframeTarget.id, { text: e.target.value }, { silent: true })
                    }
                    onBlur={() => {
                      store.updateClip(reframeTarget.id, { text: reframeTarget.text ?? "" });
                      setEditingTextId(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Escape") setEditingTextId(null);
                    }}
                  />
                </div>
              ) : null}
            </div>
          </div>
          <small className="gx-hint">Double-clique sur le texte de la vidéo pour le modifier.</small>
        </div>

        {/* Réglages du calque sélectionné (repliables). */}
        <div className="gx-ed-r">
          {store.selected && inspectorOpen ? (
            <MediaStatusContext.Provider value={mediaStatuses}>
              <Inspector
                store={store}
                clip={store.selected.clip}
                onCollapse={() => setInspectorOpen(false)}
                onReplaceMedia={() => {
                  replaceTargetRef.current = store.selectedClipId;
                  setPanel("assets");
                  setPanelOpen(true);
                  toast.info("Choisis le média de remplacement dans « Mes assets ».");
                }}
              />
            </MediaStatusContext.Provider>
          ) : store.selected ? (
            <button type="button" className="gx-btn gx-sm" onClick={() => setInspectorOpen(true)}>
              <PanelRightOpen className="gx-i" />
              Afficher les réglages
            </button>
          ) : (
            <div className="gx-ed-none">
              <b>Aucun calque sélectionné</b>
              <span>Clique sur un clip de la timeline pour régler son texte, son style, sa position et son animation.</span>
            </div>
          )}
        </div>

        {/* GRW-13 : timeline pleine largeur, sous l'aperçu ET les réglages */}
        <MediaStatusContext.Provider value={mediaStatuses}>
          <Timeline
            store={store}
            time={time}
            setTime={setTime}
            playing={playing}
            setPlaying={setPlaying}
            zoom={zoom}
            setZoom={setZoom}
            fitSignal={fitSignal}
            onShowShortcuts={() => setShortcutsOpen(true)}
            onDuplicate={duplicateSelectedClip}
            onOpenPanel={(key) => {
              setPanel(key);
              setPanelOpen(true);
              if (key === "assets") prefetchAssets();
            }}
            onDropAsset={(payload, at) =>
              payload.kind === "audio"
                ? addAudio(payload.url, payload.name)
                : addMedia(payload.url, payload.name, payload.kind, undefined, at, true)
            }
          />
        </MediaStatusContext.Provider>
      </div>

      {/* Fiche des raccourcis clavier (touche ?) */}
      <Dialog open={shortcutsOpen} onOpenChange={setShortcutsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Raccourcis clavier</DialogTitle>
            <DialogDescription>
              Les raccourcis sont inactifs quand tu écris dans un champ de saisie.
            </DialogDescription>
          </DialogHeader>
          <ul className="space-y-1.5 text-sm">
            {EDITOR_SHORTCUTS.map((s) => (
              <li key={s.keys} className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">{s.label}</span>
                <kbd className="shrink-0 rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[11px]">
                  {s.keys}
                </kbd>
              </li>
            ))}
          </ul>
        </DialogContent>
      </Dialog>
    </div>
  );

}

/* ------------------------------------------------------------------ */
/* Panneaux de gauche                                                  */
/* ------------------------------------------------------------------ */

type StoreType = ReturnType<typeof useEditorStore>;

function LeftPanel({
  panel,
  store,
  currentTime,
  onAddMedia,
  onAddAudio,
  onUpload,
}: {
  panel: PanelKey;
  store: StoreType;
  currentTime: number;
  onAddMedia: (url: string, name: string, kind: "video" | "image", duration?: number) => void;
  onAddAudio: (url: string, name: string, duration?: number) => void;
  onUpload: (files: FileList | null) => void;
}) {
  if (panel === "media") return <MediaPanel onUpload={onUpload} />;
  if (panel === "assets") return <AssetsPanel onAddMedia={onAddMedia} />;
  if (panel === "text") return <TextPanel store={store} currentTime={currentTime} />;

  if (panel === "stock") return <StockPanel onAddMedia={onAddMedia} />;
  if (panel === "transitions") return <TransitionsPanel store={store} />;
  if (panel === "captions") return <CaptionsPanel store={store} />;
  return <AudioAiPanel onAddAudio={onAddAudio} />;
}

function PanelTitle({ children }: { children: React.ReactNode }) {
  return <div className="gx-lbl gx-ed-pt">{children}</div>;
}

function MediaPanel({ onUpload }: { onUpload: (files: FileList | null) => void }) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  return (
    <div>
      <PanelTitle>Importer un média</PanelTitle>
      <input
        ref={inputRef}
        type="file"
        accept="video/*,image/*,audio/*"
        multiple
        className="hidden"
        onChange={(e) => onUpload(e.target.files)}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="gx-ed-drop"
      >
        <Upload className="gx-i" />
        Glisse tes vidéos, images ou audios
      </button>
      <p className="gx-hint gx-ed-pn">
        Les fichiers sont stockés dans ton espace Growthity et réutilisables sur tous tes projets.
      </p>
    </div>
  );
}

/**
 * Vignette chargée seulement quand elle entre dans le viewport : évite de
 * télécharger des dizaines de vidéos d'un coup (panneau « Mes assets » lent).
 */
function LazyThumb({
  url,
  thumbUrl,
  name,
  kind,
}: {
  url: string;
  thumbUrl?: string;
  name: string;
  kind: "image" | "video";
}) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || visible) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((en) => en.isIntersecting)) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin: "40px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [visible]);

  const [thumbFailed, setThumbFailed] = useState(false);
  const [mediaFailed, setMediaFailed] = useState(false);
  const effectiveThumb = thumbFailed ? undefined : thumbUrl;

  return (
    <span ref={ref} className="pointer-events-none absolute inset-0 block bg-muted">
      {!visible ? (
        <span className="block h-full w-full animate-pulse bg-muted" />
      ) : mediaFailed ? (
        // Repli lisible : jamais un carré gris muet.
        <span className="flex h-full w-full flex-col items-center justify-center gap-1 px-1 text-center">
          {kind === "video" ? (
            <Film className="h-5 w-5 text-muted-foreground" />
          ) : (
            <ImageIcon className="h-5 w-5 text-muted-foreground" />
          )}
          <span className="line-clamp-2 text-[10px] leading-tight text-muted-foreground">{name}</span>
        </span>
      ) : effectiveThumb ? (
        <img
          src={effectiveThumb}
          alt={name}
          decoding="async"
          onError={() => setThumbFailed(true)}
          className="h-full w-full object-cover"
        />
      ) : kind === "video" ? (
        <video
          // fragment #t : le navigateur ne télécharge que la première image
          src={`${url}${url.includes("#") ? "" : "#t=0.5"}`}
          muted
          playsInline
          preload="metadata"
          onError={() => setMediaFailed(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <img
          src={url}
          alt={name}
          loading="lazy"
          decoding="async"
          onError={() => setMediaFailed(true)}
          className="h-full w-full object-cover"
        />
      )}
    </span>
  );
}


type EditorAsset = {
  id: string;
  name: string;
  url: string;
  thumbUrl?: string;
  kind: "image" | "video";
  createdAt?: string;
  durationSec?: number;
};

/** Durée en mm:ss. */
function fmtDuration(sec: number) {
  const s = Math.max(0, Math.round(sec));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

/** Date relative courte en français (« il y a 3 j »). */
function relativeDate(iso?: string) {
  if (!iso) return null;
  const ms = Date.now() - new Date(iso).getTime();
  if (!Number.isFinite(ms)) return null;
  const min = Math.round(ms / 60_000);
  if (min < 1) return "à l'instant";
  if (min < 60) return `il y a ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `il y a ${h} h`;
  const d = Math.round(h / 24);
  if (d < 31) return `il y a ${d} j`;
  const mo = Math.round(d / 30);
  if (mo < 12) return `il y a ${mo} mois`;
  return `il y a ${Math.round(mo / 12)} an(s)`;
}

const ASSET_FILTERS = [
  { key: "all", label: "Tous" },
  { key: "creations", label: "Créations" },
  { key: "products", label: "Produits" },
  { key: "avatars", label: "Avatars" },
  { key: "exports", label: "Exports" },
] as const;
type AssetFilter = (typeof ASSET_FILTERS)[number]["key"];

function AssetTile({
  item,
  onAddMedia,
}: {
  item: EditorAsset;
  onAddMedia: (url: string, name: string, kind: "video" | "image") => void;
}) {
  const date = relativeDate(item.createdAt);
  return (
    <div className="min-w-0">
      <button
        type="button"
        draggable
        aria-label={`Ajouter ${item.name} à la timeline`}
        title={item.name}
        onDragStart={(e) => {
          const payload: DropPayload = { url: item.url, name: item.name, kind: item.kind };
          activeDragPayload = payload;
          e.dataTransfer.effectAllowed = "copy";
          e.dataTransfer.setData("application/x-growthity-asset", JSON.stringify(payload));
          e.dataTransfer.setData("text/plain", JSON.stringify(payload));
        }}
        onDragEnd={() => {
          activeDragPayload = null;
        }}
        onClick={() => onAddMedia(item.url, item.name, item.kind)}
        className="group relative block aspect-square w-full cursor-grab overflow-hidden rounded-lg border border-border bg-muted active:cursor-grabbing"
      >
        <LazyThumb url={item.url} thumbUrl={item.thumbUrl} name={item.name} kind={item.kind} />
        {item.durationSec ? (
          <span className="absolute bottom-1 right-1 rounded bg-background/85 px-1 text-[10px] text-foreground">
            {fmtDuration(item.durationSec)}
          </span>
        ) : null}
      </button>
      <p className="mt-1 line-clamp-2 text-[11px] leading-tight text-foreground">{item.name}</p>
      <p className="text-[10px] text-muted-foreground">
        {[item.durationSec ? fmtDuration(item.durationSec) : null, date].filter(Boolean).join(" · ")}
      </p>
    </div>
  );
}

function AssetsPanel({
  onAddMedia,
}: {
  onAddMedia: (url: string, name: string, kind: "video" | "image") => void;
}) {
  const list = useServerFn(listEditorAssets);
  const hasSession = useHasSession();
  const { data, isLoading, isError, isFetching, refetch } = useQuery({
    queryKey: ["editor-assets"],
    // Un 500 transitoire (rechargement à chaud, instance serveur recyclée) ne
    // doit ni vider le panneau ni remonter jusqu'à la frontière d'erreur.
    queryFn: () => list(),
    enabled: hasSession,
    staleTime: 5 * 60_000,
    gcTime: 30 * 60_000,
    retry: 3,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 5000),
    throwOnError: false,
  });
  const [filter, setFilter] = useState<AssetFilter>("all");
  const [query, setQuery] = useState("");

  const groups: { key: AssetFilter; title: string; items: EditorAsset[] }[] = [
    { key: "creations", title: "Créations", items: (data?.creations ?? []) as EditorAsset[] },
    { key: "products", title: "Produits", items: (data?.products ?? []) as EditorAsset[] },
    { key: "avatars", title: "Avatars", items: (data?.avatars ?? []) as EditorAsset[] },
    { key: "exports", title: "Exports", items: (data?.exports ?? []) as EditorAsset[] },
  ];
  const q = query.trim().toLowerCase();
  const visible = groups
    .filter((g) => filter === "all" || g.key === filter)
    .map((g) => ({ ...g, items: q ? g.items.filter((i) => i.name.toLowerCase().includes(q)) : g.items }))
    .filter((g) => g.items.length || filter === g.key);

  return (
    <div>
      <PanelTitle>Mes assets</PanelTitle>
      <p className="mb-2 text-xs text-muted-foreground">
        Glisse un élément sur la timeline ou clique pour l'ajouter au curseur.
      </p>
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Rechercher un média…"
        aria-label="Rechercher un média par nom"
        className="mb-2 h-8 bg-card text-xs"
      />
      <div className="mb-3 flex flex-wrap gap-1">
        {ASSET_FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            aria-pressed={filter === f.key}
            onClick={() => setFilter(f.key)}
            className={cn(
              "rounded-full border px-2 py-0.5 text-[11px] transition-colors",
              filter === f.key
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:text-foreground",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-square animate-pulse rounded-lg border border-border bg-muted" />
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-lg border border-border bg-card p-3 text-xs text-muted-foreground">
          <p className="mb-2">Le chargement de tes médias a échoué.</p>
          <Button size="sm" variant="outline" onClick={() => void refetch()} disabled={isFetching}>
            {isFetching ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
            Réessayer
          </Button>
        </div>
      ) : (
        visible.map((g) => (
          <div key={g.key} className="mb-5">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">{g.title}</p>
            <div className="grid grid-cols-2 gap-2">
              {g.items.map((item) => (
                <AssetTile key={item.id} item={item} onAddMedia={onAddMedia} />
              ))}
              {!g.items.length ? (
                <p className="col-span-2 text-xs text-muted-foreground">
                  {q ? "Aucun résultat." : "Aucun élément."}
                </p>
              ) : null}
            </div>
          </div>
        ))
      )}
    </div>
  );
}



function TextPanel({ store, currentTime }: { store: StoreType; currentTime: number }) {
  const [value, setValue] = useState("Ton accroche ici");
  const add = (templateKey: string) => {
    // Le texte se pose au curseur, en calque au-dessus de la vidéo.
    store.addClip(
      {
        kind: "text",
        name: value.slice(0, 24) || "Texte",
        text: value,
        duration: 3,
        textTemplate: templateKey,
        textStyle: templateKey === "plain" ? { ...DEFAULT_TEXT_STYLE } : styleForTemplate(templateKey),
      },
      { at: Math.max(0, currentTime), overlay: true },
    );
  };

  const templates = TEXT_TEMPLATES.filter((t) => t.key !== "plain");
  return (
    <div className="gx-ed-txtp">
      <div className="gx-lbl">Titres animés · {templates.length}</div>
      <div className="gx-ttr">
        {templates.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => add(t.key)}
            title={`Ajouter le titre « ${t.label} » à la tête de lecture`}
            aria-label={`Ajouter le titre ${t.label}`}
          >
            <TextTemplatePreview template={t} text={t.label} />
          </button>
        ))}
      </div>
      <label className="gx-lbl" htmlFor="gx-ed-newtext">Texte à ajouter</label>
      <textarea
        id="gx-ed-newtext"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={3}
        className="gx-in gx-ed-ta"
        placeholder="Ton texte"
      />
      <button type="button" className="gx-btn gx-sm" onClick={() => add("plain")}>
        Ajouter un texte simple
      </button>
    </div>
  );
}

/**
 * Grille compacte des styles animés (GRW-16) : 3 colonnes, 9 visibles puis
 * « Voir plus » pour ne pas faire exploser la hauteur de l'inspecteur.
 */
function TextTemplatePicker({
  clip,
  setLayoutSmart,
}: {
  clip: Clip;
  setLayoutSmart: (patch: Partial<Clip>) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? TEXT_TEMPLATES : TEXT_TEMPLATES.slice(0, 9);
  return (
    <div>
      <p className="mb-1.5 text-xs text-muted-foreground">Style animé</p>
      <div className="grid grid-cols-3 gap-1.5">
        {visible.map((t) => (
          <button
            key={t.key}
            type="button"
            aria-pressed={clip.textTemplate === t.key}
            onClick={() =>
              setLayoutSmart({
                textTemplate: t.key,
                textStyle: t.key === "plain" ? { ...DEFAULT_TEXT_STYLE } : styleForTemplate(t.key),
              })
            }
            className={cn(
              "overflow-hidden rounded-md border bg-card text-[9px] transition-colors",
              clip.textTemplate === t.key ? "border-primary" : "border-border hover:border-primary/60",
            )}
          >
            <span className="flex h-8 items-center justify-center bg-[linear-gradient(135deg,#1c1c22,#33333d)] px-1">
              <TextTemplatePreview template={t} text={clip.text ?? undefined} />
            </span>
            <span className="block truncate px-1 py-0.5 text-foreground">{t.label}</span>
          </button>
        ))}
      </div>
      {TEXT_TEMPLATES.length > 9 ? (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-1.5 text-[11px] text-primary hover:underline"
        >
          {expanded ? "Voir moins" : `Voir plus (${TEXT_TEMPLATES.length - 9})`}
        </button>
      ) : null}
    </div>
  );
}


/** Rendu miniature fidèle d'un titre animé (police, couleur, fond, contour). */
function TextTemplatePreview({
  template,
  text,
}: {
  template: (typeof TEXT_TEMPLATES)[number];
  text?: string;
}) {
  const st = { ...DEFAULT_TEXT_STYLE, ...template.style };
  const raw = (text?.trim() || template.sample).replace(/\n/g, " ");
  const content = st.uppercase ? raw.toUpperCase() : raw;
  const words = content.split(" ").slice(0, 6);
  return (
    <span
      className="anim-prev anim-prev-pop line-clamp-2 text-center leading-tight"
      style={{
        fontFamily: st.fontFamily,
        fontWeight: st.fontWeight,
        fontSize: Math.max(9, Math.min(15, st.fontSize / 7)),
        color: st.color,
        background: st.background ?? undefined,
        padding: st.background ? "2px 5px" : undefined,
        borderRadius: st.background ? 4 : undefined,
        WebkitTextStroke: st.strokeWidth ? `${Math.min(1.2, st.strokeWidth / 6)}px ${st.strokeColor}` : undefined,
        textShadow: st.shadow ? "0 1px 3px rgba(0,0,0,.65)" : undefined,
      }}
    >
      {words.map((w, i) => {
        const accent = template.accentEvery > 0 && (i + 1) % template.accentEvery === 0;
        const deco =
          template.highlight === "underline" && accent
            ? { textDecoration: "underline", textDecorationThickness: 2 }
            : template.highlight === "box" && accent
              ? { background: st.accentColor, borderRadius: 3, padding: "0 3px" }
              : template.highlight === "circle" && accent
                ? { border: `1px solid ${st.accentColor}`, borderRadius: 9999, padding: "0 4px" }
                : undefined;
        return (
          <span key={i} style={{ color: accent ? st.accentColor : undefined, ...deco }}>
            {w}
            {i < words.length - 1 ? " " : ""}
          </span>
        );
      })}
    </span>
  );
}

function StockPanel({
  onAddMedia,
}: {
  onAddMedia: (url: string, name: string, kind: "video" | "image", duration?: number) => void;
}) {
  const search = useServerFn(searchStockMedia);
  const [query, setQuery] = useState("");
  const [submitted, setSubmitted] = useState("");
  const [category, setCategory] = useState<"images" | "videos" | "gifs" | "stickers">("images");
  // Aperçu vidéo au survol : lecture immédiate dans un panneau à côté de la vignette.
  const [hover, setHover] = useState<{ url: string; top: number; left: number } | null>(null);

  // Recherche automatique (debounce) : la requête s'applique à TOUTES les catégories,
  // y compris Stickers, sans avoir à revalider le formulaire.
  useEffect(() => {
    const id = window.setTimeout(() => setSubmitted(query.trim()), 400);
    return () => window.clearTimeout(id);
  }, [query]);

  const { data, isFetching } = useQuery({
    queryKey: ["editor-stock", category, submitted],
    queryFn: () => search({ data: { query: submitted, category, page: 1, perPage: 24 } }),
  });

  return (
    <div>
      <PanelTitle>Banque de médias</PanelTitle>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setSubmitted(query.trim());
        }}
        className="mb-3 flex gap-2"
      >
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher"
          className="h-9 bg-card"
        />
        <Button type="submit" size="sm" variant="outline">
          <Search className="h-4 w-4" />
        </Button>
      </form>

      <Tabs value={category} onValueChange={(v) => setCategory(v as typeof category)}>
        <TabsList className="mb-3 grid w-full grid-cols-4">
          <TabsTrigger value="images" className="text-[11px]">Images</TabsTrigger>
          <TabsTrigger value="videos" className="text-[11px]">Vidéos</TabsTrigger>
          <TabsTrigger value="gifs" className="text-[11px]">GIFs</TabsTrigger>
          <TabsTrigger value="stickers" className="text-[11px]">Stickers</TabsTrigger>
        </TabsList>
      </Tabs>
      {data?.missingKey ? (
        <p className="rounded-lg border border-border bg-card p-3 text-xs text-muted-foreground">
          La banque de médias n'est pas encore activée sur ton espace. Contacte-nous pour l'ouvrir.
        </p>
      ) : null}
      <div className="grid grid-cols-2 gap-2">
        {isFetching
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-square animate-pulse rounded-lg border border-border bg-muted" />
            ))
          : (data?.items ?? []).map((item) => (
              <button
                key={item.id}
                type="button"
                draggable
                onDragStart={(e) => {
                  const payload: DropPayload = {
                    url: item.url,
                    name: "Stock",
                    kind: item.kind === "video" ? "video" : "image",
                  };
                  activeDragPayload = payload;
                  e.dataTransfer.effectAllowed = "copy";
                  e.dataTransfer.setData("application/x-growthity-asset", JSON.stringify(payload));
                  e.dataTransfer.setData("text/plain", JSON.stringify(payload));
                }}
                onDragEnd={() => {
                  activeDragPayload = null;
                }}
                onMouseEnter={(e) => {
                  if (item.kind !== "video") return;
                  const r = e.currentTarget.getBoundingClientRect();
                  setHover({ url: item.url, top: r.top, left: r.right + 12 });
                }}
                onMouseLeave={() => setHover(null)}
                onClick={() =>
                  onAddMedia(
                    item.url,
                    "Stock",
                    item.kind === "video" ? "video" : "image",
                    item.duration,
                  )
                }
                className="relative aspect-square cursor-grab overflow-hidden rounded-lg border border-border bg-muted active:cursor-grabbing"
              >
                <img
                  src={item.thumbUrl}
                  alt=""
                  className="pointer-events-none h-full w-full object-cover"
                  loading="lazy"
                />
                {item.kind === "video" ? (
                  <span className="pointer-events-none absolute bottom-1 right-1 rounded bg-black/60 p-1">
                    <Play className="h-3 w-3 text-white" />
                  </span>
                ) : null}
              </button>
            ))}
        {!isFetching && !(data?.items ?? []).length ? (
          <p className="col-span-2 text-xs text-muted-foreground">Aucun résultat pour cette recherche.</p>
        ) : null}
      </div>

      {hover ? (
        <div
          className="pointer-events-none fixed z-[70] w-[320px] overflow-hidden rounded-xl border border-border bg-card shadow-2xl"
          style={{
            top: Math.min(hover.top, (typeof window !== "undefined" ? window.innerHeight : 900) - 240),
            left: hover.left,
          }}
        >
          <video
            src={hover.url}
            className="h-[180px] w-full bg-black object-contain"
            autoPlay
            muted
            loop
            playsInline
          />
          <p className="px-3 py-2 text-[11px] text-muted-foreground">Aperçu — clique pour ajouter</p>
        </div>
      ) : null}
    </div>
  );
}

function TransitionsPanel({ store }: { store: StoreType }) {
  const selected = store.selected?.clip;
  const track = store.selected?.track;
  const next = track && selected ? track.clips[track.clips.findIndex((c) => c.id === selected.id) + 1] : undefined;
  const fromFrame = useClipFrame(selected);
  const toFrame = useClipFrame(next ?? null);

  return (
    <div>
      <PanelTitle>Transitions</PanelTitle>
      <p className="mb-3 text-xs text-muted-foreground">
        {selected
          ? "La transition s'applique à la jonction avec le clip suivant. Survole une vignette pour l'aperçu."
          : "Sélectionne un clip dans la timeline."}
      </p>
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          disabled={!selected}
          onClick={() => selected && store.setTransition(selected.id, null)}
          className="rounded-lg border border-border bg-card px-2 py-3 text-xs text-foreground disabled:opacity-50"
        >
          Aucune
        </button>
        {TRANSITION_PRESETS.map((t) => (
          <button
            key={t.key}
            type="button"
            disabled={!selected}
            onClick={() => selected && store.setTransition(selected.id, t.key, 0.8)}
            className={cn(
              "tr-card overflow-hidden rounded-lg border bg-card text-[11px] text-foreground transition-colors disabled:opacity-50",
              selected?.transition?.key === t.key ? "border-primary" : "border-border hover:border-primary/60",
            )}
          >
            <div className="relative aspect-video w-full overflow-hidden bg-muted">
              {fromFrame ? (
                <img src={fromFrame} alt="" className="absolute inset-0 h-full w-full object-cover" />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-primary/40 to-accent/40" />
              )}
              <div className={cn("tr-to overflow-hidden", t.previewClass)}>
                {toFrame ?? fromFrame ? (
                  <img
                    src={(toFrame ?? fromFrame) as string}
                    alt=""
                    className="h-full w-full object-cover"
                    style={toFrame ? undefined : { filter: "hue-rotate(140deg) saturate(1.4)" }}
                  />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-accent/60 to-primary/60" />
                )}
              </div>
            </div>
            <span className="block truncate px-1.5 py-1">{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}


type CaptionStyle = {
  key: string;
  label: string;
  style: Partial<typeof DEFAULT_TEXT_STYLE>;
  /** Style animé (typographie cinétique) appliqué avec le thème. */
  template: string;
};

/** Styles de sous-titres classiques que l'on retrouve dans les pubs courtes. */
const CAPTION_STYLES: CaptionStyle[] = [
  { key: "punch", label: "Percutant", template: "punch", style: { color: "#ffffff", accentColor: "#7c5cff", uppercase: true, fontSize: 76, fontWeight: 900, shadow: true } },
  { key: "clean", label: "Épuré", template: "plain", style: { color: "#ffffff", accentColor: "#ffffff", uppercase: false, fontSize: 64, fontWeight: 700, shadow: true } },
  { key: "yellow", label: "Viral", template: "highlight-box", style: { color: "#ffe600", accentColor: "#ffe600", uppercase: true, fontSize: 80, fontWeight: 900, strokeColor: "#000000", strokeWidth: 8 } },
  { key: "boxed", label: "Encadré", template: "plain", style: { color: "#ffffff", accentColor: "#7c5cff", uppercase: false, fontSize: 62, fontWeight: 700, background: "#111111" } },
  { key: "karaoke", label: "Karaoké", template: "circle-accent", style: { color: "#ffffff", accentColor: "#22c55e", uppercase: true, fontSize: 72, fontWeight: 900, strokeColor: "#000000", strokeWidth: 6 } },
  { key: "outline", label: "Contour", template: "outline", style: { color: "#ffffff", accentColor: "#ffffff", uppercase: true, fontSize: 74, fontWeight: 900, strokeColor: "#000000", strokeWidth: 12, shadow: false } },
  { key: "bar", label: "Bandeau", template: "plain", style: { color: "#111111", accentColor: "#111111", uppercase: false, fontSize: 58, fontWeight: 700, background: "#ffffff", shadow: false } },
  { key: "neon", label: "Néon", template: "neon", style: { color: "#ffffff", accentColor: "#22d3ee", uppercase: true, fontSize: 70, fontWeight: 900, shadow: true } },
  { key: "pink", label: "Pop", template: "flip", style: { color: "#ffffff", accentColor: "#ff2d94", uppercase: true, fontSize: 78, fontWeight: 900, strokeColor: "#ff2d94", strokeWidth: 6 } },
  { key: "mono", label: "Mono", template: "typewriter", style: { color: "#ffffff", accentColor: "#a3e635", uppercase: false, fontSize: 56, fontWeight: 600, fontFamily: "ui-monospace, monospace", background: "#000000" } },
  { key: "serif", label: "Éditorial", template: "plain", style: { color: "#ffffff", accentColor: "#d4af37", uppercase: false, fontSize: 60, fontWeight: 500, fontFamily: "Georgia, serif", shadow: true } },
  { key: "shadowbox", label: "Ombré", template: "blur-in", style: { color: "#ffffff", accentColor: "#7c5cff", uppercase: true, fontSize: 68, fontWeight: 800, background: "#00000099" } },
  { key: "minimal", label: "Discret", template: "plain", style: { color: "#f5f5f5", accentColor: "#f5f5f5", uppercase: false, fontSize: 50, fontWeight: 500, shadow: true } },
  { key: "impact", label: "Impact", template: "impact", style: { color: "#ffffff", accentColor: "#ff4d4d", uppercase: true, fontSize: 92, fontWeight: 900, strokeColor: "#000000", strokeWidth: 10 } },
];


/** Vignette d'aperçu d'un style de sous-titre (rendu fidèle en CSS). */
function CaptionPreview({ style }: { style: Partial<typeof DEFAULT_TEXT_STYLE> }) {
  const st = { ...DEFAULT_TEXT_STYLE, ...style };
  const words = ["Ce", "produit", "change", "tout"];
  return (
    <span className="flex h-12 w-full items-center justify-center overflow-hidden rounded-t-lg bg-[linear-gradient(135deg,#20202a,#3a3a48)] px-1">
      <span
        className="text-center leading-tight"
        style={{
          fontFamily: st.fontFamily,
          fontWeight: st.fontWeight,
          fontSize: Math.max(9, Math.min(14, st.fontSize / 6)),
          color: st.color,
          background: st.background ?? undefined,
          padding: st.background ? "1px 4px" : undefined,
          borderRadius: st.background ? 3 : undefined,
          textTransform: st.uppercase ? "uppercase" : "none",
          WebkitTextStroke: st.strokeWidth ? `${Math.min(1.1, st.strokeWidth / 8)}px ${st.strokeColor}` : undefined,
          textShadow: st.shadow ? "0 1px 3px rgba(0,0,0,.7)" : undefined,
        }}
      >
        {words.map((w, i) => (
          <span key={w} style={{ color: i === 2 ? st.accentColor : undefined }}>
            {w}
            {i < words.length - 1 ? " " : ""}
          </span>
        ))}
      </span>
    </span>
  );
}

function CaptionsPanel({ store }: { store: StoreType }) {
  const transcribe = useServerFn(transcribeEditorClip);
  const [styleKey, setStyleKey] = useState("punch");
  const [loading, setLoading] = useState(false);
  const clip = store.selected?.clip;

  /**
   * GRW-8 : une génération = UNE seule piste « Sous-titres », réutilisée si
   * elle existe. Les cues sont snappées puis recollées (closeGaps).
   */
  const applyCues = (cues: { start: number; end: number; text: string }[], offset: number) => {
    const theme = CAPTION_STYLES.find((s) => s.key === styleKey);
    const preset = theme?.style ?? {};
    store.commit((d) => {
      const track = ensureSubtitleTrack(d, () => newId("t"));
      if (track.clips.length > 0 && !window.confirm("Remplacer les sous-titres existants ?")) return d;
      // Les animations réglées manuellement sur les sous-titres précédents
      // sont conservées et réappliquées aux nouveaux cues.
      const previous = track.clips.find((c) => c.kind === "text" && c.animation);
      const keptAnimation = previous?.animation ?? null;
      track.clips = [];
      for (const cue of cues) {
        track.clips.push(
          makeClip({
            kind: "text",
            name: cue.text.slice(0, 20),
            text: cue.text,
            start: snapToFrame(Math.max(0, offset + cue.start)),
            duration: Math.max(0.6, snapToFrame(cue.end - cue.start)),
            textTemplate: theme?.template ?? "plain",
            animation: keptAnimation ? { ...keptAnimation } : undefined,
            textStyle: {
              ...DEFAULT_TEXT_STYLE,
              ...preset,
              background: (preset as { background?: string }).background ?? null,
            },
            y: 0.78,
          }),
        );
      }
      closeGaps(track);
      return d;
    });
  };

  /**
   * Choix d'un thème : il s'applique IMMÉDIATEMENT aux sous-titres déjà
   * présents (style + style animé), sans toucher aux autres pistes texte
   * (titres, accroches) ni aux animations réglées manuellement.
   */
  const chooseStyle = (key: string) => {
    setStyleKey(key);
    const theme = CAPTION_STYLES.find((s) => s.key === key);
    if (!theme) return;
    let touched = 0;
    store.commit((d) => {
      for (const track of d.tracks) {
        if (track.kind !== "text" || track.name !== SUBTITLE_TRACK_NAME) continue;
        track.clips = track.clips.map((c) => {
          if (c.kind !== "text") return c;
          touched += 1;
          return {
            ...c,
            textTemplate: theme.template,
            // l'animation in/out/loop du clip est préservée
            textStyle: {
              ...DEFAULT_TEXT_STYLE,
              ...theme.style,
              background: (theme.style as { background?: string }).background ?? null,
            },
          };
        });
      }
      return d;
    });
    if (touched > 0) toast.success(`Thème « ${theme.label} » appliqué à ${touched} sous-titre${touched > 1 ? "s" : ""}`);
    else toast.info("Génère d'abord des sous-titres : le thème leur sera appliqué.");
  };



  const run = async () => {
    if (!clip?.src) {
      toast.error("Sélectionne d'abord un clip vidéo ou audio.");
      return;
    }
    setLoading(true);
    try {
      // On extrait l'audio dans le navigateur (mono 16 kHz) : n'importe quelle
      // durée passe, découpée en tranches si besoin.
      const chunks = await extractAudioChunks(clip.src);
      const cues: { start: number; end: number; text: string }[] = [];
      if (chunks?.length) {
        for (const chunk of chunks) {
          const res = await transcribe({
            data: {
              audioBase64: chunk.base64,
              offsetSeconds: chunk.offsetSeconds,
              language: "fr",
              durationSeconds: clip.duration,
            },
          });
          cues.push(...res.cues);
        }
      } else {
        const res = await transcribe({
          data: { mediaUrl: clip.src, language: "fr", durationSeconds: clip.duration },
        });
        cues.push(...res.cues);
      }
      if (!cues.length) {
        toast.error("Aucune parole détectée dans ce clip.");
        return;
      }
      applyCues(cues, clip.start);
      toast.success(`${cues.length} sous-titres ajoutés`);

    } catch (e) {
      toast.error(friendlyApiError(e, "Transcription impossible pour le moment."));
    } finally {
      setLoading(false);
    }
  };

  /** Pas de transcription possible sans piste sonore (image, texte, ou aucun clip). */
  const canTranscribe =
    Boolean(clip?.src) &&
    clip?.kind !== "text" &&
    !clip?.muted &&
    (clip?.kind === "audio" || isVideoUrl(clip?.src ?? ""));


  const importSrt = (file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? "");
      const toSec = (s: string) => {
        const m = /(\d+):(\d+):(\d+)[,.](\d+)/.exec(s);
        if (!m) return 0;
        return Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3]) + Number(m[4]) / 1000;
      };
      const cues: { start: number; end: number; text: string }[] = [];
      for (const block of text.split(/\r?\n\r?\n/)) {
        const lines = block.split(/\r?\n/).filter(Boolean);
        const timing = lines.find((l) => l.includes("-->"));
        if (!timing) continue;
        const [a, b] = timing.split("-->");
        cues.push({
          start: toSec(a),
          end: toSec(b),
          text: lines.slice(lines.indexOf(timing) + 1).join(" "),
        });
      }
      if (!cues.length) {
        toast.error("Fichier SRT illisible.");
        return;
      }
      applyCues(cues, 0);
      toast.success(`${cues.length} sous-titres importés`);
    };
    reader.readAsText(file);
  };

  return (
    <div>
      <PanelTitle>Sous-titres</PanelTitle>
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Style</p>
      <div className="mb-4 grid grid-cols-2 gap-2">
        {CAPTION_STYLES.map((s) => (
          <button
            key={s.key}
            type="button"
            onClick={() => chooseStyle(s.key)}
            className={cn(
              "overflow-hidden rounded-lg border bg-card text-[11px] font-semibold transition-colors",
              styleKey === s.key ? "border-primary text-primary" : "border-border text-foreground hover:border-primary/60",
            )}
          >
            <CaptionPreview style={s.style} />
            <span className="block truncate px-1 py-1">{s.label}</span>
          </button>
        ))}
      </div>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="mb-1 block w-full">
            <Button className="w-full" size="sm" onClick={run} disabled={loading || !canTranscribe}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              Générer avec l'IA
              <CreditCost credits={creditCost("internal/transcription")} />
            </Button>
          </span>
        </TooltipTrigger>
        {!canTranscribe ? (
          <TooltipContent side="top">
            Sélectionne un clip vidéo ou audio contenant du son : une image fixe n'a pas de piste
            sonore à transcrire.
          </TooltipContent>
        ) : null}
      </Tooltip>
      {!canTranscribe ? (
        <p className="mb-2 text-[11px] text-muted-foreground">
          Sélectionne un clip vidéo ou audio contenant du son pour générer les sous-titres.
        </p>
      ) : null}


      <label className="mb-2 flex w-full cursor-pointer items-center justify-center rounded-md border border-border bg-card px-3 py-2 text-xs text-foreground">
        Importer un fichier SRT
        <input
          type="file"
          accept=".srt"
          className="hidden"
          onChange={(e) => importSrt(e.target.files?.[0] ?? null)}
        />
      </label>
      <Button
        variant="outline"
        size="sm"
        className="w-full"
        onClick={() =>
          store.addClip({
            kind: "text",
            name: "Sous-titre",
            text: "Nouveau sous-titre",
            duration: 2,
            textTemplate: "plain",
            textStyle: { ...DEFAULT_TEXT_STYLE, fontSize: 64 },
            y: 0.78,
          })
        }
      >
        Ajouter manuellement
      </Button>
    </div>
  );
}

function AudioAiPanel({
  onAddAudio,
}: {
  onAddAudio: (url: string, name: string, duration?: number) => void;
}) {
  const generate = useServerFn(generateEditorVoiceover);
  const [text, setText] = useState("");
  const [voice, setVoice] = useState<string>(EDITOR_VOICES[0].id);
  const [stability, setStability] = useState(0.5);
  const [speed, setSpeed] = useState(1);
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Enregistrement micro
  const [recording, setRecording] = useState(false);
  const [uploadingRec, setUploadingRec] = useState(false);
  const [recUrl, setRecUrl] = useState<string | null>(null);
  const [seconds, setSeconds] = useState(0);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const voiceGroups = useMemo(() => {
    const map = new Map<string, { id: string; label: string }[]>();
    for (const v of EDITOR_VOICES) {
      const list = map.get(v.group) ?? [];
      list.push({ id: v.id, label: v.label });
      map.set(v.group, list);
    }
    return Array.from(map.entries());
  }, []);

  useEffect(
    () => () => {
      if (timerRef.current) clearInterval(timerRef.current);
      recorderRef.current?.stream.getTracks().forEach((t) => t.stop());
    },
    [],
  );

  const run = async () => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const res = await generate({ data: { text: text.trim(), voice, stability, speed } });
      setUrl(res.url);
      toast.success(`Voix off générée (${res.credits} crédits)`);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const uploadRecording = async (blob: Blob, ext: string) => {
    setUploadingRec(true);
    try {
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth.user?.id;
      if (!uid) throw new Error("Session expirée, reconnecte-toi.");
      const path = `${uid}/editor/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage
        .from("tram-assets")
        .upload(path, blob, { contentType: blob.type || "audio/webm", upsert: false });
      if (error) throw new Error("L'enregistrement n'a pas pu être sauvegardé.");
      const { data: signed } = await supabase.storage
        .from("tram-assets")
        .createSignedUrl(path, 60 * 60 * 12);
      if (!signed?.signedUrl) throw new Error("L'enregistrement n'a pas pu être sauvegardé.");
      setRecUrl(signed.signedUrl);
      toast.success("Enregistrement prêt");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setUploadingRec(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
      const mime = MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : MediaRecorder.isTypeSupported("audio/mp4")
          ? "audio/mp4"
          : "";
      const rec = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
      chunksRef.current = [];
      rec.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      rec.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const type = rec.mimeType || "audio/webm";
        const blob = new Blob(chunksRef.current, { type });
        if (blob.size < 1024) {
          toast.error("Enregistrement trop court, réessaie.");
          return;
        }
        void uploadRecording(blob, type.includes("mp4") ? "m4a" : "webm");
      };
      recorderRef.current = rec;
      setRecUrl(null);
      setSeconds(0);
      rec.start();
      setRecording(true);
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } catch {
      toast.error("Impossible d'accéder au micro. Autorise l'accès dans ton navigateur.");
    }
  };

  const stopRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    recorderRef.current?.stop();
    setRecording(false);
  };

  return (
    <div>
      <PanelTitle>Voix off IA</PanelTitle>
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value.slice(0, 5000))}
        rows={6}
        placeholder="Écris le texte à faire dire…"
        className="mb-1 bg-card"
      />
      <p className="mb-3 text-right text-[10px] text-muted-foreground">{text.length} / 5000</p>
      <Select value={voice} onValueChange={setVoice}>
        <SelectTrigger className="mb-3 bg-card">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="max-h-72">
          {voiceGroups.map(([group, voices]) => (
            <SelectGroup key={group}>
              <SelectLabel>{group}</SelectLabel>
              {voices.map((v) => (
                <SelectItem key={v.id} value={v.id}>
                  {v.label}
                </SelectItem>
              ))}
            </SelectGroup>
          ))}
        </SelectContent>
      </Select>

      <div className="mb-3 space-y-3 rounded-lg border border-border bg-card/50 p-3">
        <div>
          <p className="mb-1 flex justify-between text-[11px] text-muted-foreground">
            <span>Naturel / expressif</span>
            <span>{Math.round(stability * 100)}%</span>
          </p>
          <Slider
            value={[stability]}
            min={0}
            max={1}
            step={0.05}
            onValueChange={([v]) => setStability(v ?? 0.5)}
          />
        </div>
        <div>
          <p className="mb-1 flex justify-between text-[11px] text-muted-foreground">
            <span>Vitesse</span>
            <span>{speed.toFixed(2)}×</span>
          </p>
          <Slider
            value={[speed]}
            min={0.7}
            max={1.2}
            step={0.05}
            onValueChange={([v]) => setSpeed(v ?? 1)}
          />
        </div>
      </div>

      <Button className="mb-3 w-full" size="sm" onClick={run} disabled={loading || !text.trim()}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
        Générer la voix
        <CreditCost credits={creditCost("fal-ai/elevenlabs/tts/multilingual-v2", { chars: text.length })} />
      </Button>
      {url ? (
        <div className="space-y-2">
          <audio src={url} controls className="w-full" />
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => onAddAudio(url, "Voix off")}
          >
            Ajouter à la timeline
          </Button>
        </div>
      ) : null}

      <div className="mt-6 border-t border-border pt-4">
        <PanelTitle>Ma propre voix</PanelTitle>
        <p className="mb-2 text-[11px] text-muted-foreground">
          Enregistre ta voix au micro et ajoute-la directement à la timeline.
        </p>
        <Button
          size="sm"
          variant={recording ? "destructive" : "outline"}
          className="w-full"
          onClick={recording ? stopRecording : startRecording}
          disabled={uploadingRec}
        >
          {uploadingRec ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : recording ? (
            <Square className="h-4 w-4" />
          ) : (
            <Mic className="h-4 w-4" />
          )}
          {uploadingRec
            ? "Traitement…"
            : recording
              ? `Arrêter (${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")})`
              : "Enregistrer ma voix"}
        </Button>
        {recUrl ? (
          <div className="mt-2 space-y-2">
            <audio src={recUrl} controls className="w-full" />
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => onAddAudio(recUrl, "Ma voix")}
            >
              Ajouter à la timeline
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}


/* ------------------------------------------------------------------ */
/* Timeline                                                            */
/* ------------------------------------------------------------------ */

export type DropPayload = { url: string; name: string; kind: "video" | "image" | "audio" };

/** Largeur de la colonne de contrôle des calques (à gauche de la timeline). */
const GUTTER = 90;

function Timeline({
  store,
  time,
  setTime,
  playing,
  setPlaying,
  zoom,
  setZoom,
  fitSignal,
  onShowShortcuts,
  onDuplicate,
  onOpenPanel,
  onDropAsset,
}: {
  store: StoreType;
  time: number;
  setTime: (t: number) => void;
  playing: boolean;
  setPlaying: (p: boolean) => void;
  zoom: number;
  setZoom: (z: number) => void;
  /** Incrémenté par l'éditeur pour demander un « ajuster au projet » (GRW-17). */
  fitSignal: number;
  onShowShortcuts: () => void;
  /** Duplique le clip sélectionné (bouton « Dupliquer » de la maquette). */
  onDuplicate: () => void;
  /** Ouvre un onglet d'outils (« + Média », « + Texte », « + Audio »). */
  onOpenPanel: (key: PanelKey) => void;
  onDropAsset: (payload: DropPayload, at: number) => void;
}) {
  /** Fin réelle du montage : borne la lecture et le scrub. */
  const duration = Math.max(store.duration, 0.1);
  /** Étendue visible : toujours de la marge après le dernier clip (comme CapCut). */
  const timelineEnd = Math.max(store.duration * 1.1 + 1, 4);
  const width = timelineEnd * zoom;
  const [dragOver, setDragOver] = useState(false);
  /** Sélection multiple (⌘/Ctrl/Maj + clic) pour assembler deux séquences. */
  const [mergeIds, setMergeIds] = useState<string[]>([]);
  const [merging, setMerging] = useState(false);
  const mergeClips = useServerFn(mergeEditorClips);

  const toggleMergeSelection = useCallback((clipId: string) => {
    setMergeIds((ids) =>
      ids.includes(clipId) ? ids.filter((id) => id !== clipId) : [...ids, clipId].slice(-2),
    );
  }, []);

  /** Les deux séquences sélectionnées, si elles sont assemblables (même calque, média vidéo). */
  const mergePair = useMemo(() => {
    if (mergeIds.length !== 2) return null;
    const track = store.composition.tracks.find(
      (t) => t.kind === "video" && mergeIds.every((id) => t.clips.some((c) => c.id === id)),
    );
    if (!track) return null;
    const clips = mergeIds
      .map((id) => track.clips.find((c) => c.id === id)!)
      .sort((a, b) => a.start - b.start);
    if (clips.some((c) => !c.src)) return null;
    return { track, clips };
  }, [mergeIds, store.composition]);

  const handleMerge = async () => {
    if (!mergePair || merging) return;
    const [first, second] = mergePair.clips;
    setMerging(true);
    const toastId = toast.loading("Assemblage des deux séquences…");
    try {
      const res = await mergeClips({
        data: {
          clips: [
            { url: first.src!, durationMs: Math.round(first.duration * 1000) },
            { url: second.src!, durationMs: Math.round(second.duration * 1000) },
          ],
        },
      });
      const total = first.duration + second.duration;
      store.commit((d) => {
        const t = d.tracks.find((x) => x.id === mergePair.track.id);
        if (!t) return d;
        const target = t.clips.find((c) => c.id === first.id);
        if (!target) return d;
        target.src = res.url;
        target.trimStart = 0;
        target.duration = total;
        target.sourceDuration = total;
        target.poster = undefined;
        target.name = `${first.name} + ${second.name}`;
        target.transition = null;
        t.clips = t.clips.filter((c) => c.id !== second.id);
        closeGaps(t);
        return d;
      });
      store.setSelectedClipId(first.id);
      setMergeIds([]);
      toast.success("Séquences assemblées", { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error(friendlyApiError(err, "Échec de l'assemblage"), { id: toastId });
    } finally {
      setMerging(false);
    }
  };

  /** Calque compatible survolé pendant le glissement vertical d'un clip. */
  const [dropTrackId, setDropTrackId] = useState<string | null>(null);
  /** Hauteur des pistes : ajustée automatiquement pour toutes les voir d'un coup. */
  const ROW_H = 34;
  const RULER_H = 24;
  const visibleCount = store.composition.tracks.length;
  const fitHeight = Math.min(360, RULER_H + visibleCount * ROW_H + 44);
  const [trackAreaHeight, setTrackAreaHeight] = useState(fitHeight);
  const [manualHeight, setManualHeight] = useState(false);
  useEffect(() => {
    if (!manualHeight) setTrackAreaHeight(fitHeight);
  }, [fitHeight, manualHeight]);

  /** Zoom molette sur la zone des calques (ctrl/⌘ ou molette verticale). */
  const tracksRef = useRef<HTMLDivElement | null>(null);
  const zoomRef = useRef(zoom);
  zoomRef.current = zoom;
  const setZoomRef = useRef(setZoom);
  setZoomRef.current = setZoom;
  useEffect(() => {
    const el = tracksRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      // Défilement horizontal (trackpad) : on laisse le navigateur faire.
      if (!e.ctrlKey && !e.metaKey && Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      e.preventDefault();
      const dy = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 100 : 1);
      const next = zoomRef.current * Math.exp(-dy * 0.0018);
      setZoomRef.current(Math.round(Math.max(10, Math.min(400, next))));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  /**
   * GRW-17 : ajuste le zoom pour que la durée du projet + 10 % de marge tienne
   * dans la largeur réelle disponible. Déclenché par le bouton « Ajuster »,
   * le raccourci Maj+Z et le signal d'ouverture de projet — jamais après un
   * zoom manuel de l'utilisateur.
   */
  const toolbarRef = useRef<HTMLDivElement | null>(null);
  const availableWidthRef = useRef(0);
  useEffect(() => {
    const el = toolbarRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      availableWidthRef.current = el.clientWidth;
    });
    ro.observe(el);
    availableWidthRef.current = el.clientWidth;
    return () => ro.disconnect();
  }, []);

  const durationRef = useRef(store.duration);
  durationRef.current = store.duration;
  const fitZoom = useCallback(() => {
    const avail = Math.max(320, availableWidthRef.current - GUTTER - 24);
    const span = Math.max(1, durationRef.current * 1.1);
    setZoomRef.current(Math.round(Math.max(10, Math.min(400, avail / span))));
  }, []);
  useEffect(() => {
    if (fitSignal > 0) fitZoom();
  }, [fitSignal, fitZoom]);


  /**
   * Ordre d'affichage : le calque le plus haut dans la pile de rendu est
   * affiché en haut de la timeline (comme CapCut), l'audio reste en bas.
   */
  const gaps = useMemo(() => findGaps(store.composition), [store.composition]);
  const overlapsByTrack = useMemo(() => {
    const map = new Map<string, ReturnType<typeof findOverlaps>>();
    for (const t of store.composition.tracks) {
      const found = findOverlaps(t);
      if (found.length > 0) map.set(t.id, found);
    }
    return map;
  }, [store.composition]);

  const displayTracks = useMemo(() => {
    const visual = store.composition.tracks.filter((t) => t.kind !== "audio").slice().reverse();
    const audio = store.composition.tracks.filter((t) => t.kind === "audio");
    return [...visual, ...audio];
  }, [store.composition.tracks]);

  /**
   * Bords de clips : la tête de lecture s'y aimante pour tomber pile entre
   * deux créations (comportement CapCut).
   */
  const clipEdges = () => {
    const pts = [0];
    for (const track of store.composition.tracks) {
      for (const c of track.clips) pts.push(c.start, c.start + c.duration);
    }
    return pts;
  };

  /** Aimante un instant sur le bord de clip le plus proche (~8 px). */
  const snapTime = (value: number) => {
    const tol = 8 / zoom;
    let best = value;
    let bestDist = tol;
    for (const p of clipEdges()) {
      const d = Math.abs(p - value);
      if (d < bestDist) {
        bestDist = d;
        best = p;
      }
    }
    return Math.max(0, Math.min(duration, best));
  };

  const scrubTo = (clientX: number, rect: DOMRect) => {
    setTime(snapTime(Math.max(0, Math.min(duration, (clientX - rect.left - GUTTER) / zoom))));
  };


  /** Scrub au clic ET au glisser (la tête suit la souris jusqu'au relâchement). */
  const onScrub = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    scrubTo(e.clientX, rect);
    const onMove = (ev: MouseEvent) => scrubTo(ev.clientX, rect);
    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  const onPlayheadDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startTime = time;
    // Écouteurs sur la fenêtre : le glissement continue même si le curseur
    // sort de la poignée ou passe au-dessus d'un clip.
    const onMove = (event: PointerEvent) => {
      event.preventDefault();
      setTime(snapTime(Math.max(0, Math.min(duration, startTime + (event.clientX - startX) / zoom))));
    };
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
    window.addEventListener("pointermove", onMove, { passive: false });
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
  };



  /** Points d'accroche magnétiques : 0, tête de lecture, bords des autres clips. */
  const snapPoints = (excludeId?: string) => {
    const pts = [0, time];
    for (const track of store.composition.tracks) {
      for (const c of track.clips) {
        if (c.id === excludeId) continue;
        pts.push(c.start, c.start + c.duration);
      }
    }
    return pts;
  };

  /** Colle la valeur au point d'accroche le plus proche (tolérance ~10px). */
  const snap = (value: number, excludeId?: string, clipDuration = 0) => {
    const tol = 10 / zoom;
    let best = value;
    let bestDist = tol;
    for (const p of snapPoints(excludeId)) {
      for (const candidate of [p, p - clipDuration]) {
        if (candidate < 0) continue;
        const d = Math.abs(candidate - value);
        if (d < bestDist) {
          bestDist = d;
          best = candidate;
        }
      }
    }
    return Math.max(0, best);
  };

  /** Dépôt d'un média : on lit dataTransfer, avec repli sur le payload partagé. */
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    let payload: DropPayload | null = activeDragPayload;
    const raw =
      e.dataTransfer.getData("application/x-growthity-asset") || e.dataTransfer.getData("text/plain");
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as DropPayload;
        if (parsed?.url) payload = parsed;
      } catch {
        /* on garde le repli */
      }
    }
    activeDragPayload = null;
    if (!payload?.url) return;
    // Position temporelle exacte : une piste superposée est indépendante et ne
    // doit ni s'aimanter à la piste principale, ni en déplacer les clips.
    const rect = e.currentTarget.getBoundingClientRect();
    const at = Math.max(0, (e.clientX - rect.left - GUTTER) / zoom);
    onDropAsset(payload, at);
  };

  /**
   * Déplacement d'un clip existant sur la timeline (glisser horizontal).
   * Pendant le geste on ne touche PAS au projet : seul le bloc bouge à l'écran
   * (transform, une fois par frame). Le montage n'est mis à jour qu'au
   * relâchement — déplacement instantané et un seul point d'annulation.
   */
  const startClipDrag = (e: React.PointerEvent, clip: Clip) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    e.preventDefault();
    // ⌘/Ctrl/Maj + clic : ajoute la séquence à la sélection d'assemblage.
    if (e.metaKey || e.ctrlKey || e.shiftKey) {
      toggleMergeSelection(clip.id);
      return;
    }
    setMergeIds([]);
    store.setSelectedClipId(clip.id);
    const el = e.currentTarget as HTMLElement;
    const pointerId = e.pointerId;
    el.setPointerCapture?.(pointerId);
    const startX = e.clientX;
    const startY = e.clientY;
    const baseStart = clip.start;
    let moved = false;
    let lastStart = baseStart;
    let raf = 0;
    const originTrackId =
      store.composition.tracks.find((t) => t.clips.some((c) => c.id === clip.id))?.id ?? null;

    // Points d'accroche figés au début du geste : plus aucun recalcul par pixel.
    const points: number[] = [0, time];
    for (const track of store.composition.tracks) {
      for (const c of track.clips) {
        if (c.id === clip.id) continue;
        points.push(c.start, c.start + c.duration);
      }
    }
    const snapStart = (value: number) => {
      const tol = 10 / zoom;
      let best = value;
      let bestDist = tol;
      for (const p of points) {
        for (const candidate of [p, p - clip.duration]) {
          if (candidate < 0) continue;
          const d = Math.abs(candidate - value);
          if (d < bestDist) {
            bestDist = d;
            best = candidate;
          }
        }
      }
      return Math.max(0, best);
    };
    const target = (clientX: number) => snapStart(Math.max(0, baseStart + (clientX - startX) / zoom));

    /**
     * Calque survolé (glissement vertical façon CapCut).
     * Les rectangles sont mesurés une seule fois au début du geste : mesurer à
     * chaque mouvement provoquait de gros à-coups.
     */
    const rows = Array.from(document.querySelectorAll<HTMLElement>("[data-track-id]")).map((row) => ({
      id: row.dataset["trackId"] ?? "",
      rect: row.getBoundingClientRect(),
    }));
    const trackUnder = (clientY: number): string | null => {
      for (const row of rows) {
        if (clientY < row.rect.top || clientY > row.rect.bottom) continue;
        if (!row.id) continue;
        const dest = store.composition.tracks.find((t) => t.id === row.id);
        if (!dest || dest.kind !== clip.kind) return null;
        return row.id;
      }
      return null;
    };

    const onMove = (ev: PointerEvent) => {
      if (!moved && Math.abs(ev.clientX - startX) < 3 && Math.abs(ev.clientY - startY) < 3) return;
      if (!moved) {
        moved = true;
        el.style.zIndex = "60";
        el.style.opacity = "0.85";
        el.style.willChange = "transform";
      }
      const clientX = ev.clientX;
      const clientY = ev.clientY;
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        lastStart = target(clientX);
        el.style.transform = `translateX(${(lastStart - baseStart) * zoom}px)`;
        const over = trackUnder(clientY);
        setDropTrackId(over && over !== originTrackId ? over : null);
      });
    };
    const onUp = (ev: PointerEvent) => {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      el.releasePointerCapture?.(pointerId);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
      setDropTrackId(null);
      el.style.transform = "";
      el.style.zIndex = "";
      el.style.opacity = "";
      el.style.willChange = "";
      if (!moved) return;
      const finalStart = target(ev.clientX);
      const trackId = trackUnder(ev.clientY);
      if (trackId && trackId !== originTrackId) store.moveClipToTrack(clip.id, trackId, finalStart);
      else store.moveClip(clip.id, finalStart);
    };
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onUp);
  };

  /**
   * Étirement d'un clip par ses bords (comme CapCut) : allonge ou raccourcit
   * le temps d'affichage. Fonctionne aussi pour les sous-titres (clips texte).
   * Comme le déplacement, le geste est purement visuel puis validé au relâchement.
   */
  const startClipResize = (e: React.PointerEvent, clip: Clip, edge: "start" | "end") => {
    if (e.button !== 0) return;
    e.stopPropagation();
    e.preventDefault();
    store.setSelectedClipId(clip.id);
    const el = (e.currentTarget as HTMLElement).parentElement as HTMLElement | null;
    const startX = e.clientX;
    const baseStart = clip.start;
    const baseDuration = clip.duration;
    const baseTrim = clip.trimStart ?? 0;
    const baseEnd = baseStart + baseDuration;
    const MIN = 0.2;
    const rate = Math.max(0.25, Math.min(4, clip.speed ?? 1));
    // Bornes réelles de l'étirement : les voisins de la même piste (sinon les
    // séquences se chevauchent et les poignées deviennent imprévisibles) et la
    // durée disponible dans le fichier source (sinon l'image se fige).
    const siblings = (store.composition.tracks.find((t) => t.clips.some((c) => c.id === clip.id))?.clips ?? [])
      .filter((c) => c.id !== clip.id)
      .sort((a, b) => a.start - b.start);
    const prevEnd = siblings
      .filter((c) => c.start + c.duration <= baseStart + 0.001)
      .reduce((max, c) => Math.max(max, c.start + c.duration), 0);
    const nextStart = siblings
      .filter((c) => c.start >= baseEnd - 0.001)
      .reduce((min, c) => Math.min(min, c.start), Number.POSITIVE_INFINITY);
    const source = clip.kind === "text" ? undefined : clip.sourceDuration;
    const maxEnd = Math.min(
      nextStart,
      source ? baseStart + Math.max(MIN, (source - baseTrim) / rate) : Number.POSITIVE_INFINITY,
    );
    const minStart = Math.max(prevEnd, baseStart - baseTrim / rate);
    const compute = (clientX: number) => {
      const dx = (clientX - startX) / zoom;
      if (edge === "end") {
        const wanted = Math.min(maxEnd, snap(baseEnd + dx, clip.id));
        const end = Math.max(baseStart + MIN, wanted);
        return { start: baseStart, duration: end - baseStart, trimStart: baseTrim };
      }
      const start = Math.max(
        clip.kind === "text" ? 0 : minStart,
        Math.min(baseEnd - MIN, snap(baseStart + dx, clip.id)),
      );
      // Sur un média, reculer le bord gauche décale aussi le point d'entrée.
      const trimStart = clip.kind === "text" ? baseTrim : Math.max(0, baseTrim + (start - baseStart) * rate);
      return { start, duration: baseEnd - start, trimStart };
    };
    let raf = 0;
    const onMove = (ev: PointerEvent) => {
      const clientX = ev.clientX;
      if (raf || !el) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const next = compute(clientX);
        el.style.left = `${GUTTER + next.start * zoom}px`;
        el.style.width = `${Math.max(24, next.duration * zoom - 2)}px`;
      });
    };
    const onUp = (ev: PointerEvent) => {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      const next = compute(ev.clientX);
      // Ne JAMAIS vider ces styles : React les a posés lui-même via la prop
      // `style`. Les remettre à "" supprimait la position du clip (qui sautait
      // en début de piste avec une largeur arbitraire) tant qu'aucun autre
      // rendu ne repassait dessus. On aligne donc l'aperçu sur la valeur
      // définitive, exactement comme le prochain rendu la calculera.
      if (el) {
        const start = snapToFrame(next.start);
        const dur = snapDuration(next.duration);
        el.style.left = `${GUTTER + start * zoom}px`;
        el.style.width = `${Math.max(24, dur * zoom - 2)}px`;
      }
      store.updateClip(clip.id, next);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
  };






  /** Libellé de piste façon maquette : Vidéo / Texte / Sous-titres / Audio (numérotés si plusieurs). */
  const trackLabels = useMemo(() => {
    const seen: Record<string, number> = {};
    const map = new Map<string, string>();
    for (const t of displayTracks) {
      const base =
        t.kind === "audio"
          ? "Audio"
          : t.kind === "text"
            ? t.name === SUBTITLE_TRACK_NAME
              ? "Sous-titres"
              : "Texte"
            : "Vidéo";
      seen[base] = (seen[base] ?? 0) + 1;
      map.set(t.id, seen[base] > 1 ? `${base} ${seen[base]}` : base);
    }
    return map;
  }, [displayTracks]);

  return (
    <div className="gx-ed-t">
      {/* GRW-3 : avertissement trous vidéo > 3 s (écran noir à l'export). */}
      {gaps.length > 0 ? (
        <div className="gx-note gx-ed-gap">
          <span>
            {gaps.length === 1
              ? `1 trou de ${Math.round(gaps[0]!.duration)} s sans vidéo — la vidéo sera noire à cet endroit`
              : `${gaps.length} trous sans vidéo — la vidéo sera noire à ces endroits`}
          </span>
          <button type="button" className="gx-btn gx-sm" onClick={() => store.commit((d) => tightenTimeline(d))}>
            Resserrer la timeline
          </button>
        </div>
      ) : null}
      {/* Poignée de redimensionnement de la zone des calques (comme CapCut). */}
      <div
        role="separator"
        aria-label="Redimensionner la timeline"
        title="Glisser pour redimensionner · double-clic pour ajuster"
        className="gx-tl-grip"
        onPointerDown={(e) => {
          e.preventDefault();
          const startY = e.clientY;
          const startH = trackAreaHeight;
          setManualHeight(true);
          const onMove = (ev: PointerEvent) =>
            setTrackAreaHeight(Math.max(96, Math.min(620, startH + (startY - ev.clientY))));
          const onUp = () => {
            window.removeEventListener("pointermove", onMove);
            window.removeEventListener("pointerup", onUp);
          };
          window.addEventListener("pointermove", onMove);
          window.addEventListener("pointerup", onUp);
        }}
        onDoubleClick={() => setManualHeight(false)}
      />
      <div ref={toolbarRef} className="gx-tl-tools">
        <button
          type="button"
          className="gx-play"
          aria-label={playing ? "Pause" : "Lecture"}
          title={playing ? "Pause · Espace" : "Lecture · Espace"}
          onClick={() => setPlaying(!playing)}
        >
          {playing ? <Pause className="gx-i" /> : <Play className="gx-i" />}
        </button>
        <button
          type="button"
          aria-label="Annuler la dernière action"
          title="Annuler · ⌘/Ctrl + Z"
          onClick={store.undo}
          disabled={!store.canUndo}
        >
          ↶
        </button>
        <button
          type="button"
          aria-label="Rétablir"
          title="Rétablir · ⌘/Ctrl + Maj + Z"
          onClick={store.redo}
          disabled={!store.canRedo}
        >
          ↷
        </button>
        <button
          type="button"
          title="Découper à la tête de lecture · S"
          disabled={!store.selectedClipId}
          onClick={() => store.selectedClipId && store.splitClip(store.selectedClipId, time)}
        >
          Découper
        </button>
        <button type="button" title="Dupliquer le clip sélectionné" disabled={!store.selectedClipId} onClick={onDuplicate}>
          Dupliquer
        </button>
        <button type="button" title="Ajouter un média depuis tes assets" onClick={() => onOpenPanel("assets")}>
          + Média
        </button>
        <button type="button" title="Ajouter un titre ou un texte" onClick={() => onOpenPanel("text")}>
          + Texte
        </button>
        <button type="button" title="Ajouter une voix off ou une musique" onClick={() => onOpenPanel("audio")}>
          + Audio
        </button>
        <button
          type="button"
          className="gx-tl-ib"
          aria-label="Supprimer le clip sélectionné"
          title="Supprimer le clip sélectionné · Suppr"
          disabled={!store.selectedClipId}
          onClick={() => store.selectedClipId && store.removeClip(store.selectedClipId)}
        >
          <Trash2 className="gx-i" />
        </button>
        <button
          type="button"
          className="gx-tl-ib"
          aria-label={
            mergePair
              ? "Assembler les 2 séquences sélectionnées"
              : "Sélectionne 2 séquences vidéo du même calque (Maj + clic) pour les assembler"
          }
          title={
            mergePair
              ? "Assembler les 2 séquences sélectionnées"
              : "Maj + clic sur 2 séquences vidéo du même calque pour les assembler"
          }
          disabled={!mergePair || merging}
          onClick={handleMerge}
        >
          {merging ? <Loader2 className="gx-i animate-spin" /> : <Combine className="gx-i" />}
        </button>
        {mergeIds.length > 0 ? (
          <small className="gx-hint">
            {`${mergeIds.length}/2 séquence${mergeIds.length > 1 ? "s" : ""} à assembler`}
          </small>
        ) : null}
        <span className="gx-sp" />
        <button
          type="button"
          className="gx-tl-ib"
          aria-label="Zoom arrière"
          title="Zoom arrière · −"
          onClick={() => setZoom(Math.max(10, Math.round(zoom / 1.3)))}
        >
          <ZoomOut className="gx-i" />
        </button>
        <button
          type="button"
          className="gx-tl-ib"
          aria-label="Zoom avant"
          title="Zoom avant · +"
          onClick={() => setZoom(Math.min(400, Math.round(zoom * 1.3)))}
        >
          <ZoomIn className="gx-i" />
        </button>
        <button
          type="button"
          className="gx-tl-ib"
          aria-label="Ajuster la timeline au projet"
          title="Ajuster la timeline au projet · Maj + Z"
          onClick={fitZoom}
        >
          <Maximize className="gx-i" />
        </button>
        <button
          type="button"
          className="gx-tl-ib"
          aria-label="Raccourcis clavier"
          title="Raccourcis clavier · ?"
          onClick={onShowShortcuts}
        >
          <Keyboard className="gx-i" />
        </button>
        <button
          type="button"
          className="gx-tl-ib"
          aria-label={trackAreaHeight > 260 ? "Réduire les calques" : "Agrandir les calques"}
          title={trackAreaHeight > 260 ? "Réduire la zone des calques" : "Agrandir la zone des calques"}
          onClick={() => {
            setManualHeight(true);
            setTrackAreaHeight((h) => (h > 260 ? 140 : 420));
          }}
        >
          {trackAreaHeight > 260 ? <ChevronDown className="gx-i" /> : <ChevronUp className="gx-i" />}
        </button>
        <span className="gx-num">
          {fmt(time)} / {fmt(store.duration)}
        </span>
      </div>

      <div ref={tracksRef} className="min-w-0">
      <ScrollArea style={{ height: trackAreaHeight }}>
        <div
          className={cn("gx-tl-area", dragOver && "gx-drop")}
          style={{ width: Math.max(width + GUTTER, 600) }}
          onDragEnter={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragOver={(e) => {
            // On accepte tout glissement : certains navigateurs masquent les types
            // personnalisés pendant le survol, on s'appuie alors sur le payload partagé.
            e.preventDefault();
            e.dataTransfer.dropEffect = "copy";
            if (!dragOver) setDragOver(true);
          }}
          onDragLeave={(e) => {
            if (e.currentTarget.contains(e.relatedTarget as Node)) return;
            setDragOver(false);
          }}
          onDrop={handleDrop}
        >

          {/* règle */}
          <div className="gx-tl-ru" onMouseDown={onScrub}>
            {Array.from({ length: Math.ceil(timelineEnd) + 1 }).map((_, i) => (
              <span key={i} style={{ left: GUTTER + i * zoom }}>
                {i}s
              </span>
            ))}
          </div>

          {/* Pistes affichées de haut en bas = du calque le plus haut au fond. */}
          {displayTracks.map((track) => (
            <div
              key={track.id}
              data-track-id={track.id}
              className={cn("gx-tl-row", dropTrackId === track.id && "gx-drop")}
              style={{ height: ROW_H }}
              onMouseDown={(e) => {
                if (e.target === e.currentTarget) onScrub(e);
              }}
            >
              {(overlapsByTrack.get(track.id) ?? []).map((ov, i) => (
                <button
                  key={`ov-${track.id}-${i}`}
                  type="button"
                  title="Deux clips se chevauchent — clique pour résoudre"
                  aria-label="Deux clips se chevauchent — clique pour résoudre"
                  className="gx-tl-ov"
                  style={{
                    left: GUTTER + ov.from * zoom,
                    width: Math.max(4, (ov.to - ov.from) * zoom),
                  }}
                  onClick={() =>
                    store.commit((d) => {
                      const t = d.tracks.find((x) => x.id === track.id);
                      if (!t) return d;
                      let cursor = t.clips[0]?.start ?? 0;
                      t.clips.sort((a, b) => a.start - b.start);
                      for (const c of t.clips) {
                        if (c.start < cursor) c.start = snapToFrame(cursor);
                        cursor = c.start + c.duration;
                      }
                      closeGaps(t);
                      return d;
                    })
                  }
                />
              ))}
              {track.clips.map((clip) => (
                <TimelineClip
                  key={clip.id}
                  clip={clip}
                  zoom={zoom}
                  offset={GUTTER}
                  variant={
                    track.kind === "audio"
                      ? "gx-a"
                      : track.kind === "text"
                        ? track.name === SUBTITLE_TRACK_NAME
                          ? "gx-s"
                          : "gx-t"
                        : "gx-v"
                  }
                  selected={store.selectedClipId === clip.id}
                  mergeSelected={mergeIds.includes(clip.id)}
                  onPointerDown={(e) => startClipDrag(e, clip)}
                  onResizeDown={(e, edge) => startClipResize(e, clip, edge)}

                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") store.setSelectedClipId(clip.id);
                    if (e.key === "ArrowLeft") store.moveClip(clip.id, Math.max(0, clip.start - 0.1));
                    if (e.key === "ArrowRight") store.moveClip(clip.id, clip.start + 0.1);
                  }}
                />
              ))}
              {/* Colonne du calque : nom (maquette) + ordre dans la pile et suppression au survol. */}
              <div className="gx-tl-lab" style={{ width: GUTTER }}>
                <small>{trackLabels.get(track.id) ?? ""}</small>
                <span className="gx-tl-lact">
                  <button
                    type="button"
                    aria-label="Monter le calque"
                    title="Monter le calque"
                    disabled={track.kind === "audio"}
                    onClick={() => store.moveTrack(track.id, "up")}
                  >
                    <ChevronUp className="gx-i" />
                  </button>
                  <button
                    type="button"
                    aria-label="Supprimer le calque"
                    title="Supprimer le calque"
                    onClick={() => store.removeTrack(track.id)}
                  >
                    <Trash2 className="gx-i" />
                  </button>
                  <button
                    type="button"
                    aria-label="Descendre le calque"
                    title="Descendre le calque"
                    disabled={track.kind === "audio"}
                    onClick={() => store.moveTrack(track.id, "down")}
                  >
                    <ChevronDown className="gx-i" />
                  </button>
                </span>
              </div>
            </div>
          ))}


          {/* Ajout rapide d'un calque vide (texte ou média superposé). */}
          <div className="gx-tl-add">
            <button type="button" className="gx-btn gx-sm" onClick={() => store.addTrack("video")}>
              + Calque média
            </button>
            <button type="button" className="gx-btn gx-sm" onClick={() => store.addTrack("text")}>
              + Calque texte
            </button>
            <button type="button" className="gx-btn gx-sm" onClick={() => store.addTrack("audio")}>
              + Calque audio
            </button>
          </div>



          {/* Tête de lecture rouge (maquette) : grande zone de saisie + poignée visible. */}
          <div
            role="slider"
            aria-label="Curseur de lecture"
            aria-valuemin={0}
            aria-valuemax={duration}
            aria-valuenow={time}
            tabIndex={0}
            className="gx-tl-head"
            style={{ left: GUTTER + time * zoom }}
            onPointerDown={onPlayheadDown}
            onKeyDown={(e) => {
              if (e.key === "ArrowLeft") setTime(Math.max(0, time - 0.1));
              if (e.key === "ArrowRight") setTime(Math.min(duration, time + 0.1));
            }}
          >
            <b className="gx-ph-l" />
          </div>
        </div>
      </ScrollArea>
      </div>
    </div>
  );
}

/** Bloc de clip dans la timeline : pastille colorée par piste (maquette) + vignette du média. */
function TimelineClipBase({

  clip,
  zoom,
  offset = 0,
  variant = "gx-v",
  selected,
  mergeSelected = false,
  onPointerDown,
  onResizeDown,
  onKeyDown,
}: {
  clip: Clip;
  zoom: number;
  offset?: number;
  /** Couleur de piste : gx-v vidéo, gx-t texte, gx-s sous-titres, gx-a audio. */
  variant?: "gx-v" | "gx-t" | "gx-s" | "gx-a";
  selected: boolean;
  /** Retenue pour l'assemblage (Maj + clic) : mise en évidence en vert. */
  mergeSelected?: boolean;
  onPointerDown: (e: React.PointerEvent) => void;
  onResizeDown: (e: React.PointerEvent, edge: "start" | "end") => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
}) {

  const frame = useClipFrame(clip);
  const width = Math.max(24, clip.duration * zoom - 2);
  const hasMedia = clip.kind !== "audio" && clip.kind !== "text" && Boolean(clip.src);
  const thumb = hasMedia ? frame ?? clip.poster ?? (clip.kind === "video" ? "" : clip.src ?? "") : "";
  // GRW-4 : un média injoignable/expiré doit se voir immédiatement.
  const mediaBroken = useClipMediaStatus(clip.src) === "error";
  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      onPointerDown={onPointerDown}
      onKeyDown={onKeyDown}
      title={mediaBroken ? "Média introuvable ou expiré" : clip.name}
      className={cn(
        "gx-c gx-tlc",
        mediaBroken ? "gx-err" : variant,
        mergeSelected ? "gx-mrg" : selected ? "gx-sel" : null,
      )}
      style={{ left: offset + clip.start * zoom, width }}
    >
      {thumb && width > 60 ? <img className="gx-tlc-th" src={thumb} alt="" decoding="async" /> : null}
      <b>
        {mediaBroken ? "⚠ " : null}
        {clip.kind === "text" && clip.text ? clip.text.replace(/\n/g, " ") : clip.name}
      </b>

      {clip.transition ? <span className="gx-tlc-tr" aria-label="Transition">↹</span> : null}
      {/* Poignées d'étirement : allonger / raccourcir le temps d'affichage. */}
      {(["start", "end"] as const).map((edge) => (
        <span
          key={edge}
          role="presentation"
          title={edge === "start" ? "Ajuster le début" : "Ajuster la fin"}
          onPointerDown={(e) => onResizeDown(e, edge)}
          className={cn("gx-tlc-h", edge === "start" ? "gx-s0" : "gx-e0")}
        />
      ))}

    </div>
  );
}

/**
 * Mémoïsé : un déplacement ne doit re-rendre que la séquence concernée,
 * pas toutes les autres de la timeline.
 */
const TimelineClip = memo(TimelineClipBase);





/* ------------------------------------------------------------------ */
/* Inspecteur                                                          */
/* ------------------------------------------------------------------ */

const FONT_CHOICES = [
  { label: "Inter (sans)", value: "Inter, sans-serif" },
  { label: "Helvetica", value: "Helvetica, Arial, sans-serif" },
  { label: "Impact", value: "Impact, Haettenschweiler, sans-serif" },
  { label: "Georgia (serif)", value: "Georgia, serif" },
  { label: "Times", value: "'Times New Roman', serif" },
  { label: "Courier (mono)", value: "ui-monospace, 'Courier New', monospace" },
  { label: "Trebuchet", value: "'Trebuchet MS', sans-serif" },
  { label: "Verdana", value: "Verdana, sans-serif" },
  { label: "Manuscrit", value: "'Brush Script MT', cursive" },
];

function Inspector({
  store,
  clip,
  onReplaceMedia,
}: {
  store: StoreType;
  clip: Clip;
  onReplaceMedia?: () => void;
}) {
  const update = (changes: Partial<Clip>) => store.updateClip(clip.id, changes);
  const frame = useClipFrame(clip);
  const mediaBroken = useClipMediaStatus(clip.src) === "error";
  /** Les clips anciens/importés peuvent ne pas avoir ces blocs : valeurs sûres. */
  const clipAnimation = clip.animation ?? { in: null, out: null, loop: null, inDuration: 0.6, outDuration: 0.6 };
  const clipEffects = clip.effects ?? [];


  /** Une image fixe n'a pas de piste sonore : pas d'onglet Audio. */
  const hasSound = clip.kind === "audio" || (clip.kind === "video" && isVideoUrl(clip.src ?? ""));

  /**
   * L'édition groupée reste dans la famille du clip : un sous-titre ne modifie
   * que les sous-titres, un texte libre que les autres textes.
   */
  const textScope = textScopeOf(store.composition, clip.id);
  const textClipCount = store.composition.tracks.reduce(
    (n, t) =>
      (t.name === SUBTITLE_TRACK_NAME) === (textScope === "subtitles")
        ? n + t.clips.filter((c) => c.kind === "text").length
        : n,
    0,
  );
  const [applyAllPref, setApplyAllPref] = useState(textApplyAll.current);
  const applyAll = applyAllPref && textClipCount > 1;
  /** Style : sur tous les sous-titres si la case est cochée, sinon sur le clip seul. */
  const setStyleSmart = (changes: Partial<typeof DEFAULT_TEXT_STYLE>) => {
    if (applyAll) store.updateAllTextClips({}, changes, { scope: textScope });
    else update({ textStyle: { ...DEFAULT_TEXT_STYLE, ...(clip.textStyle ?? {}), ...changes } });
  };
  /** Mise en page (position, échelle, style animé) avec la même logique. */
  const setLayoutSmart = (changes: Partial<Clip>) => {
    if (applyAll) store.updateAllTextClips(changes, undefined, { scope: textScope });
    else update(changes);
  };


  const ts = { ...DEFAULT_TEXT_STYLE, ...(clip.textStyle ?? {}) };
  const setText = (changes: Partial<typeof DEFAULT_TEXT_STYLE>) =>
    update({ textStyle: { ...ts, ...changes } });

  const setEffectParam = (key: string, param: string, value: number) =>
    store.updateClip(
      clip.id,
      {
        effects: clipEffects.map((e) =>
          e.key === key ? { ...e, params: { ...e.params, [param]: value } } : e,
        ),
      },
      { silent: true },
    );

  return (
    <div className="p-3">
      {mediaBroken ? (
        <div className="mb-3 rounded-md border border-destructive bg-destructive/10 p-2">
          <p className="text-xs font-semibold text-destructive">Ce média est introuvable</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            Le fichier a été supprimé ou son lien a expiré.
          </p>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="mt-2 h-7 w-full text-xs"
            onClick={() => onReplaceMedia?.()}
          >
            Remplacer le média
          </Button>
        </div>
      ) : null}
      <div className="mb-3">

        <p className="truncate text-sm font-semibold text-foreground">{clip.name}</p>
        <p className="text-xs text-muted-foreground">
          {fmt(clip.start)} → {fmt(clip.start + clip.duration)}
        </p>
        {/* Réglage précis du temps d'affichage (utile pour les sous-titres). */}
        <div className="mt-2 grid grid-cols-2 gap-2">
          <label className="block text-[11px] text-muted-foreground">
            Début (s)
            <Input
              type="number"
              step={0.05}
              min={0}
              value={Number(clip.start.toFixed(2))}
              onChange={(e) => {
                const v = Math.max(0, Number(e.target.value) || 0);
                update({ start: v });
              }}
              className="mt-1 h-8 text-xs"
            />
          </label>
          <label className="block text-[11px] text-muted-foreground">
            Durée (s)
            <Input
              type="number"
              step={0.05}
              min={0.2}
              value={Number(clip.duration.toFixed(2))}
              onChange={(e) => {
                const v = Math.max(0.2, Number(e.target.value) || 0.2);
                update({ duration: v });
              }}
              className="mt-1 h-8 text-xs"
            />
          </label>
        </div>
      </div>


      {/* Les onglets dépendent du type réel du clip :
          audio = son uniquement, image = visuel sans son, vidéo = tout. */}
      <Tabs
        defaultValue={
          clip.kind === "text" ? "texte" : clip.kind === "audio" ? "audio" : hasSound ? "audio" : "filtres"
        }
        key={`${clip.id}-${clip.kind}-${hasSound}`}
      >
        <TabsList
          className={cn(
            "sticky top-0 z-10 mb-3 grid w-full bg-background",
            clip.kind === "audio"
              ? "grid-cols-1"
              : clip.kind === "text"
                ? "grid-cols-4"
                : hasSound
                  ? "grid-cols-4"
                  : "grid-cols-3",
          )}
        >
          {/* GRW-16 : un seul niveau d'onglets pour le texte. */}
          {clip.kind === "text" ? (
            <>
              <TabsTrigger value="texte" className="text-[11px]">Texte</TabsTrigger>
              <TabsTrigger value="style" className="text-[11px]">Style</TabsTrigger>
              <TabsTrigger value="position" className="text-[11px]">Position</TabsTrigger>
            </>
          ) : null}

          {clip.kind === "audio" || hasSound ? (
            <TabsTrigger value="audio" className="text-[11px]">Audio</TabsTrigger>
          ) : null}
          {clip.kind !== "audio" ? (
            <>
              {clip.kind !== "text" ? (
                <>
                  <TabsTrigger value="filtres" className="text-[11px]">Filtres</TabsTrigger>
                  <TabsTrigger value="effets" className="text-[11px]">Effets</TabsTrigger>
                </>
              ) : null}
              <TabsTrigger value="anim" className="text-[11px]">Animation</TabsTrigger>
            </>
          ) : null}
        </TabsList>



        <TabsContent value="audio" className="space-y-4">
          <Field label={`Volume — ${Math.round(clip.volume * 100)} %`}>
            <Slider
              value={[clip.volume]}
              min={0}
              max={1}
              step={0.01}
              onValueChange={([v]) => update({ volume: v })}
            />
          </Field>
          {clip.kind === "audio" || hasSound ? (
            <Field label={`${clip.kind === "video" ? "Rythme vidéo" : "Vitesse"} — ${(clip.speed ?? 1).toFixed(2)}×`}>
              <Slider
                value={[clip.speed ?? 1]}
                min={0.5}
                max={2}
                step={0.05}
                onValueChange={([v]) => {
                  const next = Math.max(0.5, Math.min(2, v));
                  const prev = clip.speed ?? 1;
                  // La durée sur la timeline suit la vitesse : 2× = deux fois plus court.
                  const nextDuration = Math.max(0.2, (clip.duration * prev) / next);
                  update({ speed: next, duration: nextDuration });
                }}
              />
              <p className="mt-1 text-[10px] text-muted-foreground">
                {clip.kind === "video"
                  ? "Accélère ou ralentit l’image et le son ensemble. La durée du calque s’adapte automatiquement."
                  : "Accélère ou ralentit ce calque audio sans déformer la voix."}
              </p>
            </Field>
          ) : null}
          <Field label={`Fondu d'entrée — ${clip.fadeIn.toFixed(1)} s`}>
            <Slider value={[clip.fadeIn]} min={0} max={3} step={0.1} onValueChange={([v]) => update({ fadeIn: v })} />
          </Field>
          <Field label={`Fondu de sortie — ${clip.fadeOut.toFixed(1)} s`}>
            <Slider value={[clip.fadeOut]} min={0} max={3} step={0.1} onValueChange={([v]) => update({ fadeOut: v })} />
          </Field>
          <Button variant="outline" size="sm" className="w-full" onClick={() => store.detachAudio(clip.id)}>
            Détacher l'audio
          </Button>
        </TabsContent>

        <TabsContent value="texte" className="space-y-3">
          {textClipCount > 1 ? (
            <label className="flex cursor-pointer items-start gap-2 rounded-md border border-border bg-card p-2">
              <Checkbox
                checked={applyAllPref}
                onCheckedChange={(v) => {
                  textApplyAll.current = v === true;
                  setApplyAllPref(v === true);
                }}
                className="mt-0.5"
              />
              <span className="text-[11px] leading-snug text-foreground">
                {textScope === "subtitles" ? "Appliquer à tous les sous-titres" : "Appliquer à tous les textes"}
                <span className="block text-[10px] text-muted-foreground">
                  Style, position et animation s'appliquent aux {textClipCount}{" "}
                  {textScope === "subtitles" ? "sous-titres" : "textes"} — l'autre famille n'est jamais
                  modifiée.
                </span>
              </span>
            </label>
          ) : null}

          <Textarea
            value={clip.text ?? ""}
            onChange={(e) => update({ text: e.target.value })}
            rows={4}
            className="bg-card"
          />
          <p className="text-[10px] text-muted-foreground">
            Le texte reste propre à ce sous-titre, même si la case ci-dessus est cochée.
          </p>
        </TabsContent>

        <TabsContent value="style" className="space-y-3">
          <TextTemplatePicker clip={clip} setLayoutSmart={setLayoutSmart} />

              <Field label="Police">
                <select
                  value={ts.fontFamily}
                  onChange={(e) => setStyleSmart({ fontFamily: e.target.value })}
                  className="h-9 w-full rounded-md border border-border bg-card px-2 text-xs text-foreground"
                >
                  {FONT_CHOICES.map((f) => (
                    <option key={f.value} value={f.value} style={{ fontFamily: f.value }}>
                      {f.label}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label={`Taille — ${ts.fontSize}`}>
                <Slider
                  value={[ts.fontSize]}
                  min={18}
                  max={220}
                  step={2}
                  onValueChange={([v]) => setStyleSmart({ fontSize: v })}
                />
              </Field>

              <Field label={`Épaisseur — ${ts.fontWeight}`}>
                <Slider
                  value={[ts.fontWeight]}
                  min={300}
                  max={900}
                  step={100}
                  onValueChange={([v]) => setStyleSmart({ fontWeight: v })}
                />
              </Field>

              <div className="grid grid-cols-2 gap-2">
                <Field label="Couleur">
                  <input
                    type="color"
                    value={ts.color}
                    onChange={(e) => setStyleSmart({ color: e.target.value })}
                    className="h-9 w-full rounded-md border border-border bg-card"
                  />
                </Field>
                <Field label="Accent">
                  <input
                    type="color"
                    value={ts.accentColor}
                    onChange={(e) => setStyleSmart({ accentColor: e.target.value })}
                    className="h-9 w-full rounded-md border border-border bg-card"
                  />
                </Field>
              </div>

              <Field label="Fond du texte">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setStyleSmart({ background: ts.background ? null : "#000000" })}
                    className={cn(
                      "h-9 flex-1 rounded-md border text-xs transition-colors",
                      ts.background
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-card text-muted-foreground",
                    )}
                  >
                    {ts.background ? "Activé" : "Aucun"}
                  </button>
                  <input
                    type="color"
                    value={ts.background ?? "#000000"}
                    disabled={!ts.background}
                    onChange={(e) => setStyleSmart({ background: e.target.value })}
                    className="h-9 w-14 rounded-md border border-border bg-card disabled:opacity-40"
                  />
                </div>
              </Field>

              <Field label={`Contour — ${ts.strokeWidth} px`}>
                <div className="flex items-center gap-2">
                  <Slider
                    className="flex-1"
                    value={[ts.strokeWidth]}
                    min={0}
                    max={24}
                    step={1}
                    onValueChange={([v]) => setStyleSmart({ strokeWidth: v })}
                  />
                  <input
                    type="color"
                    value={ts.strokeColor}
                    onChange={(e) => setStyleSmart({ strokeColor: e.target.value })}
                    className="h-9 w-12 rounded-md border border-border bg-card"
                  />
                </div>
              </Field>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setStyleSmart({ uppercase: !ts.uppercase })}
                  className={cn(
                    "h-8 rounded-md border text-[11px] transition-colors",
                    ts.uppercase ? "border-primary text-primary" : "border-border text-muted-foreground",
                  )}
                >
                  MAJUSCULES
                </button>
                <button
                  type="button"
                  onClick={() => setStyleSmart({ shadow: !ts.shadow })}
                  className={cn(
                    "h-8 rounded-md border text-[11px] transition-colors",
                    ts.shadow ? "border-primary text-primary" : "border-border text-muted-foreground",
                  )}
                >
                  Ombre portée
                </button>
              </div>
            </TabsContent>

            <TabsContent value="position" className="space-y-3">
              <div className="grid grid-cols-3 gap-1">
                {(["left", "center", "right"] as const).map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => setStyleSmart({ align: a })}
                    className={cn(
                      "h-8 rounded-md border text-[11px] transition-colors",
                      ts.align === a ? "border-primary text-primary" : "border-border text-muted-foreground",
                    )}
                  >
                    {a === "left" ? "Gauche" : a === "center" ? "Centre" : "Droite"}
                  </button>
                ))}
              </div>

              <Field label={`Position horizontale — ${Math.round(clip.x * 100)} %`}>
                <Slider
                  value={[clip.x]}
                  min={0}
                  max={1}
                  step={0.01}
                  onValueChange={([v]) => setLayoutSmart({ x: v })}
                />
              </Field>
              <Field label={`Position verticale — ${Math.round(clip.y * 100)} %`}>
                <Slider
                  value={[clip.y]}
                  min={0}
                  max={1}
                  step={0.01}
                  onValueChange={([v]) => setLayoutSmart({ y: v })}
                />
              </Field>
              <Field label={`Échelle — ${Math.round((clip.scale || 1) * 100)} %`}>
                <Slider
                  value={[clip.scale || 1]}
                  min={0.2}
                  max={4}
                  step={0.01}
                  onValueChange={([v]) => setLayoutSmart({ scale: v })}
                />
              </Field>
        </TabsContent>


        <TabsContent value="filtres">
          <div className="grid grid-cols-3 gap-2">
            {FILTER_PRESETS.map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => update({ filter: f.key })}
                className={cn(
                  "group overflow-hidden rounded-md border text-[10px]",
                  clip.filter === f.key ? "border-primary" : "border-border",
                )}
              >
                <div className="h-12 w-full overflow-hidden bg-muted">
                  {frame ? (
                    <img
                      src={frame}
                      alt=""
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      style={{ filter: filterToCss(FILTER_BY_KEY[f.key]) }}
                    />
                  ) : (
                    <div
                      className="h-full w-full bg-gradient-to-br from-primary/60 via-foreground/30 to-accent/60"
                      style={{ filter: filterToCss(FILTER_BY_KEY[f.key]) }}
                    />
                  )}
                </div>
                <span className="block truncate px-1 py-0.5 text-foreground">{f.label}</span>
              </button>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="effets" className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            {EFFECT_PRESETS.map((eff) => {
              const active = clipEffects.some((e) => e.key === eff.key);
              return (
                <button
                  key={eff.key}
                  type="button"
                  onClick={() =>
                    update({
                      effects: active
                        ? clipEffects.filter((e) => e.key !== eff.key)
                        : [...clipEffects, { key: eff.key, params: defaultEffectParams(eff.key) }],
                    })
                  }
                  className={cn(
                    "group overflow-hidden rounded-md border bg-card text-[10px] transition-colors",
                    active ? "border-primary text-primary" : "border-border hover:border-primary/60",
                  )}
                >
                  <div className="h-12 w-full overflow-hidden bg-muted">
                    {frame ? (
                      <img
                        src={frame}
                        alt=""
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        style={{ filter: eff.css ?? "none" }}
                      />
                    ) : (
                      <div
                        className="h-full w-full bg-gradient-to-br from-primary/60 via-foreground/30 to-accent/60"
                        style={{ filter: eff.css ?? "none" }}
                      />
                    )}
                  </div>
                  <span className="block truncate px-1 py-0.5">{eff.label}</span>
                </button>
              );
            })}
          </div>

          {clipEffects.length ? (
            <div className="space-y-3 rounded-lg border border-border bg-card p-3">
              <p className="text-xs font-medium text-foreground">Réglages des effets actifs</p>
              {clipEffects.map((inst) => {
                const meta = EFFECT_BY_KEY[inst.key];
                if (!meta) return null;
                return (
                  <div key={inst.key} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-medium text-foreground">{meta.label}</span>
                      <button
                        type="button"
                        className="text-[10px] text-muted-foreground hover:text-destructive"
                        onClick={() => update({ effects: clipEffects.filter((e) => e.key !== inst.key) })}
                      >
                        Retirer
                      </button>
                    </div>
                    {meta.params.map((param) => {
                      const value = inst.params?.[param.key] ?? param.default;
                      return (
                        <Field key={param.key} label={`${param.label} — ${value}`}>
                          <Slider
                            value={[value]}
                            min={param.min}
                            max={param.max}
                            step={param.step}
                            onValueChange={([v]) => setEffectParam(inst.key, param.key, v ?? param.default)}
                          />
                        </Field>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          ) : null}
        </TabsContent>

        <TabsContent value="anim">
          <Tabs defaultValue="in">
            <TabsList className="mb-3 grid w-full grid-cols-3">
              <TabsTrigger value="in" className="text-[11px]">Entrée</TabsTrigger>
              <TabsTrigger value="out" className="text-[11px]">Sortie</TabsTrigger>
              <TabsTrigger value="loop" className="text-[11px]">Boucle</TabsTrigger>
            </TabsList>
            {(["in", "out", "loop"] as const).map((kind) => (
              <TabsContent key={kind} value={kind}>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => update({ animation: { ...clipAnimation, [kind]: null } })}
                    className={cn(
                      "flex h-[74px] items-center justify-center rounded-md border bg-card px-2 text-[11px]",
                      clipAnimation[kind] ? "border-border text-muted-foreground" : "border-primary text-primary",
                    )}
                  >
                    Aucune
                  </button>
                  {animationsOf(kind).map((a) => (
                    <button
                      key={a.key}
                      type="button"
                      onClick={() => update({ animation: { ...clipAnimation, [kind]: a.key } })}
                      className={cn(
                        "anim-card overflow-hidden rounded-md border bg-card text-[10px] transition-colors",
                        clipAnimation[kind] === a.key
                          ? "border-primary text-primary"
                          : "border-border text-foreground hover:border-primary/60",
                      )}
                    >
                      <span className="flex h-12 w-full items-center justify-center overflow-hidden bg-muted">
                        <span className={cn("anim-prev block h-7 w-7 rounded-sm", a.previewClass)}>
                          {frame ? (
                            <img src={frame} alt="" className="h-full w-full rounded-sm object-cover" />
                          ) : (
                            <span className="block h-full w-full rounded-sm bg-gradient-to-br from-primary to-accent" />
                          )}
                        </span>
                      </span>
                      <span className="block truncate px-1 py-0.5">{a.label}</span>
                    </button>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1.5 text-xs text-muted-foreground">{label}</p>
      {children}
    </div>
  );
}
