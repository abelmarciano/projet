import { isBillingSuspendedError } from "@/lib/billing/billing-guard";
import { hideIntermediateText } from "@/lib/chat/history-hygiene";
import { LEAD_ISSUE_LABEL } from "@/lib/lead-fields";
import { CreditCost, creditCost } from "@/components/billing/CreditCost";
import { estimateVideoCredits, IMAGE_CREDITS } from "@/lib/billing/estimate";
import { StrategyCard } from "@/components/chat/StrategyCard";
import { CompetitorAdsCard } from "@/components/chat/CompetitorAdsCard";
import { resolveVideoAspectRatio } from "@/lib/chat/aspect-ratio";
import { CompetitorRefsContext, buildCompetitorRefsMarker, parseCompetitorRefs, pickProbableWinners, stripCompetitorRefs, toCompetitorRef, type CompetitorRef, type CompetitorRefsApi } from "@/lib/chat/competitor-refs";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { ChatPerformanceTable, getActiveCampaignSelection, type ChatCampaignRow } from "@/components/insights/ChatPerformanceTable";
import { SelectionPicker, type PickerItem, type PickerSelection } from "@/components/chat/SelectionPicker";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect, useRef, useMemo, useCallback, memo, forwardRef, useImperativeHandle } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { AiModeSwitch } from "@/components/chat/AiModeSwitch";
import { getClientAiMode } from "@/lib/ai-mode";
import { getAiModeAccess } from "@/lib/ai-mode.functions";
import { useQuery, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { getAdVersions } from "@/lib/ad-versions.functions";
import { useServerFn } from "@tanstack/react-start";
import { z } from "zod";
import ReactMarkdown from "react-markdown";
import { supabase } from "@/integrations/supabase/client";
import { getMediaAsset, promoteMediaAssetToAd, refreshPendingMediaAssets, submitMediaGeneration } from "@/lib/media-gen.functions";
import { toast } from "sonner";
import { buildAdTitle, buildBriefTitle } from "@/lib/ad-naming";
import { extractAnnouncedImageText, userWantsOnImageText } from "@/lib/chat/on-image-text";
import { stripTechnicalMarkers } from "@/lib/chat/visible-text";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Send, Trash2, Sparkles, MessageSquare, Loader2, Wand2, ArrowRight,
  Image as ImageIcon, Video, Layers, Captions, Paperclip, X, Pencil,
  Copy, ThumbsUp, ThumbsDown, Check, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Search, Star,
  MoreHorizontal, FolderPlus, Folder, FolderOpen, Reply, Download, Scissors,
  SplitSquareHorizontal, Crop, RefreshCw, Plus, CornerUpLeft, Megaphone, Film,
  Link2, Upload, TrendingUp, Target, ShoppingCart, ShoppingBag, Users, Globe, Zap, Crown, Gift, Calendar, Phone, Square, PanelRightOpen, PanelRightClose, PanelLeftOpen, PanelLeftClose, User as UserIcon, Clock, Maximize2, Palette, Languages, Box,
  RectangleVertical, RectangleHorizontal, Camera, MapPin, Grid3x3, History, Lock, Info, Clapperboard, Package, UserCircle, AudioWaveform, Mic,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { MetaIcon } from "@/components/BrandIcons";
import { MetaCampaignPickerDialog } from "@/components/MetaCampaignPickerDialog";
import { PendingCampaignCard, type PendingCampaign } from "@/components/PendingCampaignCard";
import { PickCreationVideoDialog } from "@/components/PickCreationVideoDialog";
import { PickCreationDialog, type PickedCreation } from "@/components/PickCreationDialog";

import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator,
  DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { MetaAdPreview, type AdPreviewItem } from "@/components/MetaAdPreview";
import { AVATAR_VOICE_CATALOG, resolveAvatarVoiceId } from "@/lib/avatar-voices.constants";



import { SubtitlesDialog } from "@/components/SubtitlesDialog";
import { TrimVideoDialog } from "@/components/TrimVideoDialog";
import { SplitVideoDialog } from "@/components/SplitVideoDialog";
import { CropVideoDialog } from "@/components/CropVideoDialog";
import { ContinueVideoDialog, MergeSequenceButton } from "@/components/ContinueVideoDialog";
import { continueAd } from "@/lib/ad-sequences.functions";
import {
  listAdConversations, createAdConversation, deleteAdConversation, getAdConversation,
  appendGeneratedAdToConversation, appendGenerationAnchorToConversation,
  appendProductImagesToConversation, removeProductImageFromConversation, truncateConversationAfterMessage,
} from "@/lib/ad-conversations.functions";
import {
  listAdFolders, createAdFolder, deleteAdFolder, renameAdFolder,
  setConversationFolder, setConversationFavorite, renameAdConversation,
} from "@/lib/ad-folders.functions";
import { listAvatars, listProductFolders } from "@/lib/catalog.functions";
import { listStockActors } from "@/lib/stock-actors.functions";
import { listShopifyProducts } from "@/lib/shopify.functions";
import { generateCreativePrompt } from "@/lib/ai-prompt.functions";
import { getPromptDraft, savePromptDraft } from "@/lib/ad-conversations.functions";
import { startVideoChain } from "@/lib/video-chain.functions";
import { segmentsForDuration } from "@/lib/video-chain";
import { countSpokenWords, extractSegmentScripts, spokenWordRange } from "@/lib/video-script-quality";
import { STOCK_ACTOR_IMAGE_RE, injectExactSpokenScripts, userExactSpokenScripts, userWantsVideoOnScreenText } from "@/lib/video-chain-guard";
import { bestActorsForProfile, inferActorProfile, rankActorsForProfile } from "@/lib/chat/actor-fit";
import { oneQuestionAtATime } from "@/lib/chat/suggestion-order";
import { VideoChainProgress } from "@/components/chat/VideoChainProgress";
import { generateAdImage, saveAd, listFolders, createFolder, moveAdsToFolder } from "@/lib/tram.functions";
import { toUserMessage, parseRateLimitError, formatRateLimitMessage } from "@/lib/rate-limit";
import { isAuthError, SESSION_EXPIRED_MESSAGE } from "@/lib/user-error";
import { handleInsufficientCredits, promptCreditTopUp } from "@/lib/credit-gate";
import { submitVideoAd, refreshPendingAds, VIDEO_CATALOG, listFrenchVoices, regenerateAdVoice, previewFrenchVoice, type VideoStyle, type Tier, cancelAdGeneration } from "@/lib/fal.functions";
import { UGC_FR_SPEED_FACTOR } from "@/lib/fal.constants";
const UGC_FR_SPEED_LABEL = UGC_FR_SPEED_FACTOR.toFixed(2);

import { seedanceTagsBySourceOrder } from "@/lib/seedance-refs";
import { getWorkspaceBilling } from "@/lib/billing/billing.functions";
import { useAppLanguage } from "@/lib/app-language";
import { Logo } from "@/components/Logo";


const searchSchema = z.object({
  c: z.string().uuid().optional(),
  actor: z.string().url().or(z.string().startsWith("/")).optional(),
  actorName: z.string().optional(),
  actorId: z.string().uuid().optional(),
  start: z.enum(["meta"]).optional(),
  focus: z.string().uuid().optional(),
});

export const Route = createFileRoute("/_authenticated/create")({
  head: () => ({ meta: [{ title: "Nouvelle pub - growthity" }] }),
  validateSearch: (s: Record<string, unknown>) => searchSchema.parse(s),
  component: ChatCreatePage,
});


const PENDING_STOCK_ACTORS_KEY = "growthity:pending-stock-actors:v1";
const PENDING_PRODUCT_TEMPLATE_KEY = "growthity:pending-product-template:v1";
import { PENDING_META_AD_EDIT_KEY } from "@/lib/meta-chat-handoff";
import { takePendingChatPrompt } from "@/lib/chat-prompt-handoff";
import { extractVideoFrameDataUrl, wantsVideoContinuity } from "@/lib/video-frame";
import { getSupportedVideoDurations } from "@/lib/generation-routing";
import { competitorInsightToPrompt, type CompetitorCopyInsight } from "@/lib/chat/competitor-insights";
import { isStrategyState, strategyToText } from "@/lib/chat/strategy";


type GeneratedAd = {
  id: string;
  kind: "video" | "image" | "carousel";
  title: string;
  url?: string | null;
  urls?: string[] | null;
  status: "pending" | "ready" | "failed";
  error?: string | null;
  afterMessageId?: string | null;
  displayAfterAdId?: string | null;
  createdAt?: number | string | null;
  prompt?: string | null;
  processingStatus?: string | null;
  processingOp?: string | null;
  pipelineStage?: string | null;
};

// Traduit un identifiant technique fal.ai en nom lisible côté UI.
/**
 * Rassemble tout ce que le client a réellement donné pendant le brief
 * (argumentaire produit scrapé, analyses des vidéos de référence jointes,
 * textes de pubs concurrentes, précisions écrites) pour que le modèle de
 * rédaction du prompt raisonne dessus au lieu de partir du seul résumé.
 */
export function buildCreativeContext(
  state: Record<string, unknown>,
  messages: Array<{ role: string; parts?: Array<Record<string, unknown>> }>,
): string | undefined {
  const blocks: string[] = [];

  const pm = state.productMemory as
    | { sourceUrl?: unknown; title?: unknown; description?: unknown; salesArguments?: unknown }
    | undefined;
  if (pm) {
    const lines = [
      pm.title ? `Produit : ${String(pm.title)}` : "",
      pm.sourceUrl ? `Source : ${String(pm.sourceUrl)}` : "",
      pm.description ? `Description officielle : ${String(pm.description).slice(0, 800)}` : "",
      pm.salesArguments
        ? `Argumentaire réel (promesse, bénéfices, preuves, objections, prix, cible) :\n${JSON.stringify(pm.salesArguments).slice(0, 3500)}`
        : "",
    ].filter(Boolean);
    if (lines.length) blocks.push(`## Informations produit vérifiées\n${lines.join("\n")}`);
  }

  if (isStrategyState(state.strategy)) {
    blocks.push(
      `## Stratégie ${state.strategy.status === "validated" ? "validée" : "en cours"}\n${strategyToText(state.strategy.doc)}`,
    );
  }

  const competitorInsight = state.competitorCopyInsight as CompetitorCopyInsight | undefined;
  if (competitorInsight?.ads?.length) {
    blocks.push(
      `## Veille concurrentielle destinée à la RÉDACTION du script\n${competitorInsightToPrompt(competitorInsight)}`,
    );
  }

  for (const key of ["targetAudience", "objective", "tone", "offer", "brandGuidelines"]) {
    const v = state[key];
    if (typeof v === "string" && v.trim()) blocks.push(`## ${key}\n${v.trim().slice(0, 600)}`);
  }

  // Derniers messages du client : analyses des vidéos jointes, pubs de
  // référence collées, précisions de style.
  const userTexts: string[] = [];
  for (const m of messages.slice(-24)) {
    if (m.role !== "user") continue;
    const text = (m.parts ?? [])
      .filter((p) => p.type === "text" && typeof p.text === "string")
      .map((p) => String(p.text))
      .join("\n")
      .replace(/<!--[\s\S]*?-->/g, "")
      .trim();
    if (text.length > 40) userTexts.push(text.slice(0, 2500));
  }
  const refTexts = userTexts.filter((t) =>
    /Vidéo jointe|Analyse automatique|ads\/library|publicité de référence|référence|inspir/i.test(t),
  );
  if (refTexts.length) {
    blocks.push(
      `## Références fournies par le client (vidéos analysées, pubs d'inspiration)\n` +
        refTexts.slice(-3).join("\n---\n") +
        `\nUtilise le PATTERN de ces références (accroche, rythme, ton, cadrage, structure du script, style de CTA) appliqué au produit du client. Ne recopie ni les phrases ni la marque d'origine.`,
    );
  } else if (userTexts.length) {
    blocks.push(`## Précisions écrites par le client\n${userTexts.slice(-2).join("\n---\n")}`);
  }

  // Annonces de référence choisies dans la bibliothèque Meta (marqueur) et
  // analyses image + son des vidéos de référence (outil analyze_video) :
  // sans ce bloc, « je veux une pub comme ça » n'apportait rien au prompt.
  let refs: CompetitorRef[] | null = null;
  const analyses: string[] = [];
  for (const m of messages) {
    for (const p of m.parts ?? []) {
      if (m.role === "user" && p.type === "text" && typeof p.text === "string") {
        const found = parseCompetitorRefs(String(p.text));
        if (found?.length) refs = found;
      }
      if (p.type === "tool-analyze_video") {
        const o = p.output as { analysis?: unknown } | undefined;
        if (typeof o?.analysis === "string" && o.analysis.trim()) analyses.push(o.analysis.trim());
      }
    }
  }
  if (refs?.length || analyses.length) {
    const refLines = (refs ?? []).slice(0, 5).map((r, i) =>
      `Annonce ${i + 1} — ${r.pageName ?? "annonceur"} (${r.mediaType ?? "média"}, ${r.runningDays ?? "?"} j, signal ${r.signal ?? "?"})\nTexte : ${(r.body ?? "").slice(0, 700)}${r.title ? `\nTitre : ${r.title}` : ""}`,
    );
    blocks.unshift(
      `## ANNONCE(S) DE RÉFÉRENCE CHOISIE(S) PAR LE CLIENT — à exploiter réellement\n` +
        (refLines.length ? `${refLines.join("\n---\n")}\n` : "") +
        (analyses.length ? `### Analyse image + son de la vidéo de référence\n${analyses.slice(-2).join("\n---\n").slice(0, 4000)}\n` : "") +
        `Reprends le PATTERN : type d'accroche, structure du script, rythme et nombre de plans, ton de la voix, type de plan/cadrage, style du CTA. Ne recopie ni les phrases ni la marque. Le format d'image de la référence ne compte pas (vertical 9:16 par défaut). Dans "analysis", liste précisément ce qui est repris de la référence.`,
    );
  }

  const out = blocks.join("\n\n").trim();
  return out.length > 60 ? out.slice(0, 12000) : undefined;
}

function friendlyModelName(modelId: string): string {
  const id = modelId.toLowerCase();
  if (id.includes("happy-horse")) return "HappyHorse 1.0 (Alibaba)";
  if (id.includes("kling-video")) return "Kling 3.0 (Kuaishou)";
  if (id.includes("veo3")) return "Veo 3.1 (Google)";
  if (id.includes("seedance")) return "Seedance 2.0 (ByteDance)";
  if (id.includes("pixverse")) return "PixVerse Lipsync";
  if (id.includes("minimax") && id.includes("speech")) return "MiniMax Speech-02 HD";
  if (id.includes("gemini") && id.includes("image")) return "Gemini 2.5 Flash Image (Google)";
  if (id.includes("flux") && id.includes("kontext")) return "FLUX Kontext (Black Forest Labs)";
  if (id.includes("seedream")) return "Seedream 4.5 (ByteDance)";
  if (id.includes("omnihuman")) return "OmniHuman 1.5 (ByteDance)";
  if (id.includes("clarity")) return "Clarity Upscaler";
  if (id.includes("topaz")) return "Topaz Video Upscale";
  if (id.includes("meshy")) return "Meshy (3D)";
  if (id.includes("cassette")) return "Cassette AI (audio)";
  if (id.includes("elevenlabs")) return "ElevenLabs TTS";
  return modelId.split("/").slice(-2).join(" · ");
}


function parseGeneratedAds(value: unknown): GeneratedAd[] {
  if (!Array.isArray(value)) return [];
  return value.filter((ad): ad is GeneratedAd => {
    if (!ad || typeof ad !== "object") return false;
    const a = ad as Partial<GeneratedAd>;
    return (
      typeof a.id === "string" &&
      (a.kind === "video" || a.kind === "image" || a.kind === "carousel") &&
      typeof a.title === "string" &&
      (a.status === "pending" || a.status === "ready" || a.status === "failed")
    );
  });
}

function hasGeneratedMedia(ad: GeneratedAd) {
  if (ad.status !== "ready") return false;
  if (ad.kind === "carousel") return Array.isArray(ad.urls) && ad.urls.some((url) => typeof url === "string" && url.trim().length > 0);
  return typeof ad.url === "string" && ad.url.trim().length > 0;
}

function sanitizeStateForChat(state: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(state)) {
    if (k === "productImages" && Array.isArray(v)) {
      out.productImages = v.length; // just the count, avoid base64 blowup
      continue;
    }
    if (k === "generatedAds" && Array.isArray(v)) {
      out.generatedAds = v.length;
      continue;
    }
    if (typeof v === "string" && v.length > 500) {
      out[k] = v.slice(0, 500);
      continue;
    }
    out[k] = v;
  }
  return out;
}

const HEAVY_DATA_IMAGE_RE = /!\[[^\]]*\]\(data:image\/[^)]{100,}\)|data:image\/[a-z0-9.+-]+;base64,[a-z0-9+/=\r\n]{100,}/gi;
const LOCAL_BLOB_IMAGE_RE = /!\[[^\]]*\]\(blob:[^)]+\)/gi;

function safePersistableImageUrls(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  const urls: string[] = [];
  for (const item of value) {
    if (typeof item !== "string") continue;
    const url = item.trim();
    if (!/^https?:\/\//i.test(url)) continue;
    if (url.length > 2500 || /^data:/i.test(url) || /^blob:/i.test(url)) continue;
    if (seen.has(url)) continue;
    seen.add(url);
    urls.push(url);
  }
  return urls.slice(0, 12);
}

function sanitizeMessageTextForChat(text: string) {
  let next = text
    .replace(HEAVY_DATA_IMAGE_RE, "📎 Image produit jointe")
    .replace(LOCAL_BLOB_IMAGE_RE, "📎 Image produit jointe");
  const refMarkers = next.match(/<!--competitor-refs:[\s\S]*?-->/g) ?? [];
  next = next.replace(/<!--competitor-refs:[\s\S]*?-->/g, "");
  if (next.length > 12000) next = `${next.slice(0, 12000)}…`;
  return refMarkers.length ? `${next}\n${refMarkers.join("\n")}` : next;
}

function chatMessageText(m: UIMessage): string {
  return (m.parts ?? []).map((p) => (p.type === "text" ? (p as { text?: string }).text ?? "" : "")).join("").trim();
}

function dedupeChatMessages(messages: UIMessage[]): UIMessage[] {
  const seen = new Set<string>();
  const out: UIMessage[] = [];
  for (const m of messages) {
    if (m.id && seen.has(m.id)) continue;
    if (m.id) seen.add(m.id);
    const prev = out[out.length - 1];
    if (prev && prev.role === "assistant" && m.role === "assistant") {
      const t = chatMessageText(m);
      if (t && t === chatMessageText(prev) && (m.parts ?? []).every((p) => p.type === "text" || p.type === "step-start")) continue;
    }
    out.push(m);
  }
  return out.length === messages.length ? messages : out;
}

function sanitizeMessagesForChat(messages: UIMessage[]): UIMessage[] {
  return messages.map((message) => ({
    ...message,
    parts: (message.parts ?? []).map((part) => {
      if (part.type !== "text") return part;
      const text = sanitizeMessageTextForChat((part as { text?: string }).text ?? "");
      return { ...part, text };
    }) as UIMessage["parts"],
  }));
}


function upsertGeneratedAdList(ads: GeneratedAd[], ad: GeneratedAd) {
  const existingIndex = ads.findIndex((item) => item.id === ad.id);
  const existing = existingIndex >= 0 ? ads[existingIndex] : undefined;
  const merged: GeneratedAd = existing
    ? {
        ...existing,
        ...ad,
        url: ad.url !== undefined ? ad.url : existing.url,
        urls: ad.urls !== undefined ? ad.urls : existing.urls,
        error: ad.error !== undefined ? ad.error : existing.error,
        afterMessageId: ad.afterMessageId ?? existing.afterMessageId ?? null,
        displayAfterAdId: ad.displayAfterAdId ?? existing.displayAfterAdId ?? null,
        prompt: ad.prompt ?? existing.prompt ?? null,
      }
    : ad;
  if (existingIndex < 0) return [...ads, merged];
  return ads.map((item, index) => (index === existingIndex ? merged : item));
}

// Fusion d'une version persistée (serveur) dans la liste locale, SANS jamais
// faire régresser une carte déjà prête : si la copie serveur est en retard
// (statut pending, URL nulle à cause d'une écriture concurrente), on garde la
// version locale. C'est ce qui évite les cartes qui disparaissent/réapparaissent
// dans une conversation qui contient beaucoup de générations.
function mergePersistedGeneratedAd(ads: GeneratedAd[], persisted: GeneratedAd) {
  const index = ads.findIndex((item) => item.id === persisted.id);
  if (index < 0) return [...ads, persisted];
  const local = ads[index];
  const localHasMedia = hasGeneratedMedia(local);
  const persistedHasMedia = hasGeneratedMedia(persisted);
  if (localHasMedia && !persistedHasMedia) {
    // On récupère seulement les métadonnées manquantes côté local.
    const enriched: GeneratedAd = {
      ...local,
      afterMessageId: local.afterMessageId ?? persisted.afterMessageId ?? null,
      displayAfterAdId: local.displayAfterAdId ?? persisted.displayAfterAdId ?? null,
      prompt: local.prompt ?? persisted.prompt ?? null,
      title: local.title || persisted.title,
    };
    return ads.map((item, i) => (i === index ? enriched : item));
  }
  const merged: GeneratedAd = {
    ...local,
    ...persisted,
    url: persisted.url ?? local.url ?? null,
    urls: persisted.urls ?? local.urls ?? null,
    prompt: persisted.prompt ?? local.prompt ?? null,
    afterMessageId: persisted.afterMessageId ?? local.afterMessageId ?? null,
    displayAfterAdId: persisted.displayAfterAdId ?? local.displayAfterAdId ?? null,
  };
  return ads.map((item, i) => (i === index ? merged : item));
}

function orderGeneratedAdsForThread(ads: GeneratedAd[]) {
  const indexed = ads.map((ad, index) => ({ ad, index }));
  const byId = new Map(indexed.map((item) => [item.ad.id, item]));
  const children = new Map<string, typeof indexed>();
  const roots: typeof indexed = [];

  for (const item of indexed) {
    const parentId = item.ad.displayAfterAdId;
    if (parentId && parentId !== item.ad.id && byId.has(parentId)) {
      const list = children.get(parentId) ?? [];
      list.push(item);
      children.set(parentId, list);
    } else {
      roots.push(item);
    }
  }

  const ordered: GeneratedAd[] = [];
  const seen = new Set<string>();
  const append = (item: { ad: GeneratedAd; index: number }) => {
    if (seen.has(item.ad.id)) return;
    seen.add(item.ad.id);
    ordered.push(item.ad);
    for (const child of (children.get(item.ad.id) ?? []).sort((a, b) => a.index - b.index)) append(child);
  };

  for (const root of roots.sort((a, b) => a.index - b.index)) append(root);
  for (const item of indexed) append(item);
  return ordered;
}

function stateRecordsEqual(a: Record<string, unknown>, b: Record<string, unknown>) {
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  if (aKeys.length !== bKeys.length) return false;
  return aKeys.every((key) => {
    if (!Object.prototype.hasOwnProperty.call(b, key)) return false;
    const av = a[key];
    const bv = b[key];
    if (Object.is(av, bv)) return true;
    if (typeof av === "object" || typeof bv === "object") {
      try {
        return JSON.stringify(av) === JSON.stringify(bv);
      } catch {
        return false;
      }
    }
    return false;
  });
}

function generatedAdListsEqual(a: GeneratedAd[], b: GeneratedAd[]) {
  if (a.length !== b.length) return false;
  return a.every((ad, index) => JSON.stringify(ad) === JSON.stringify(b[index]));
}

function messageHasReadyToGenerate(message: UIMessage) {
  return (message.parts ?? []).some((part) => part.type === "tool-ready_to_generate" && (part as any).output?.blocked !== true);
}

function messageText(message: UIMessage) {
  return (message.parts ?? [])
    .filter((part) => part.type === "text")
    .map((part) => (part as { text: string }).text)
    .join(" ");
}

function messageRawText(message: UIMessage) {
  return (message.parts ?? [])
    .filter((part) => part.type === "text")
    .map((part) => (part as { text: string }).text)
    .join("");
}

function messageRenderSignature(message: UIMessage) {
  const toolSignature = (message.parts ?? [])
    .filter((part) => part.type !== "text")
    .map((part) => {
      const p = part as { type?: string; input?: unknown; output?: unknown; state?: unknown };
      return `${p.type ?? ""}:${JSON.stringify(p.input ?? p.output ?? p.state ?? null)}`;
    })
    .join("|");
  return `${message.id}:${message.role}:${messageRawText(message)}:${toolSignature}`;
}

function textNeedsMarkdown(text: string) {
  return /(!?\[[^\]]+\]\(|\*\*|__|^\s{0,3}[-*]\s|^\s{0,3}\d+\.\s|^>\s|`|#{1,6}\s)/m.test(text);
}

function PlainMessageText({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <>
      {lines.map((line, index) => (
        <span key={index}>
          {line}
          {index < lines.length - 1 ? <br /> : null}
        </span>
      ))}
    </>
  );
}

// Smooth token/character reveal for streaming assistant messages.
// Keeps a displayed prefix that catches up to the incoming target text
// at a steady rate, so text appears fluid instead of chunky.
function useSmoothStreamText(target: string, enabled: boolean) {
  const [display, setDisplay] = useState<string>(enabled ? "" : target);
  const targetRef = useRef(target);
  targetRef.current = target;

  useEffect(() => {
    if (!enabled) {
      setDisplay(target);
      return;
    }
    // Reset if target text diverges (new message or edited history)
    setDisplay((cur) => (target.startsWith(cur) ? cur : ""));

    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = now - last;
      last = now;
      setDisplay((cur) => {
        const t = targetRef.current;
        if (cur.length >= t.length) return cur;
        const behind = t.length - cur.length;
        // Base ~140 chars/sec, accelerate when far behind so we never lag.
        const speed = Math.max(140, behind * 6);
        const add = Math.max(1, Math.round((dt / 1000) * speed));
        return t.slice(0, Math.min(t.length, cur.length + add));
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [enabled, target]);

  // When streaming ends, snap to the full text.
  useEffect(() => {
    if (!enabled) setDisplay(target);
  }, [enabled, target]);

  return enabled ? display : target;
}


// Les modèles d'image n'acceptent que JPEG / PNG / WebP. Un SVG (logo vectoriel),
// un HEIC (photo iPhone) ou un GIF renommé fait échouer la génération avec
// « Provided image is not valid ». On rasterise donc tout en PNG côté navigateur.
const MODEL_SAFE_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

async function rasterizeToPng(file: File): Promise<File | null> {
  try {
    const url = URL.createObjectURL(file);
    const img = await new Promise<HTMLImageElement | null>((resolve) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => resolve(null);
      el.src = url;
    });
    if (!img) {
      URL.revokeObjectURL(url);
      return null;
    }
    const maxSide = 1600;
    const w = img.naturalWidth || img.width || 1024;
    const h = img.naturalHeight || img.height || 1024;
    const scale = Math.min(1, maxSide / Math.max(w, h));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(w * scale));
    canvas.height = Math.max(1, Math.round(h * scale));
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      URL.revokeObjectURL(url);
      return null;
    }
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    URL.revokeObjectURL(url);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
    if (!blob) return null;
    return new File([blob], file.name.replace(/\.[^.]+$/, ".png"), { type: "image/png" });
  } catch {
    return null;
  }
}

async function resizeImageForChatUpload(file: File): Promise<File | null> {
  if (!MODEL_SAFE_IMAGE_TYPES.includes(file.type)) return rasterizeToPng(file);
  if (file.size < 1_200_000 || typeof createImageBitmap === "undefined") return file;
  try {

    const bitmap = await createImageBitmap(file);
    const maxSide = 1600;
    const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
    if (scale >= 1 && file.size < 2_500_000) {
      bitmap.close?.();
      return file;
    }
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      bitmap.close?.();
      return file;
    }
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close?.();
    const outputType = file.type.includes("png") || file.type.includes("webp") ? "image/webp" : "image/jpeg";
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, outputType, 0.88));
    if (!blob || blob.size >= file.size) return file;
    const ext = outputType.includes("webp") ? "webp" : "jpg";
    const name = file.name.replace(/\.[^.]+$/, `.${ext}`);
    return new File([blob], name, { type: outputType });
  } catch {
    return file;
  }
}

function messageLooksLikeGenerationAnchor(message: UIMessage) {
  if (messageHasReadyToGenerate(message)) return true;
  if (message.role !== "assistant") return false;
  const text = messageText(message).toLowerCase();
  return (
    text.includes("lance la génération") ||
    text.includes("lancer la génération") ||
    text.includes("génération lancée") ||
    text.includes("prompt final")
  );
}

function messageLooksLikeActualGenerationLaunch(message: UIMessage) {
  if (message.role !== "assistant") return false;
  const text = messageText(message).toLowerCase();
  return text.includes("je lance la génération") || text.includes("génération lancée");
}

function inferGeneratedKindFromMessage(message: UIMessage): GeneratedAd["kind"] | null {
  const text = messageText(message).toLowerCase();
  if (text.includes("carrousel") || text.includes("slides")) return "carousel";
  if (text.includes("vidéo") || text.includes("video") || text.includes("ugc")) return "video";
  if (text.includes("image") || text.includes("visuel")) return "image";
  return null;
}

function messageToolBriefSignature(messages: UIMessage[]) {
  return JSON.stringify(
    messages.map((message) => ({
      id: message.id,
      parts: (message.parts ?? [])
        .filter(
          (part) =>
            part.type === "tool-update_brief" ||
            part.type === "tool-ready_to_generate" ||
            part.type === "tool-fetch_url",
        )
        .map((part) => {
          const toolPart = part as {
            type: string;
            input?: Record<string, unknown>;
            output?: Record<string, unknown>;
          };
          return { type: toolPart.type, input: toolPart.input ?? null, output: toolPart.output ?? null };
        }),
    })),
  );
}


function ChatCreatePage() {
  const { c: convId, actor: pendingActor, actorName: pendingActorName, actorId: pendingActorId } = Route.useSearch();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const listFn = useServerFn(listAdConversations);
  const createFn = useServerFn(createAdConversation);
  const deleteFn = useServerFn(deleteAdConversation);
  const getFn = useServerFn(getAdConversation);
  const creatingRef = useRef(false);
  const leftSidebarFrameRef = useRef<HTMLDivElement>(null);
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [leftSidebarWidth, setLeftSidebarWidth] = useState<number>(() => {
    if (typeof window === "undefined") return 288;
    const saved = Number(window.localStorage.getItem("growthity:create-sidebar-width"));
    return Number.isFinite(saved) ? Math.min(520, Math.max(240, saved)) : 288;
  });
  const [isResizingLeft, setIsResizingLeft] = useState(false);
  useEffect(() => {
    try { window.localStorage.setItem("growthity:create-sidebar-width", String(leftSidebarWidth)); } catch {}
  }, [leftSidebarWidth]);
  useEffect(() => {
    if (!isResizingLeft) return;
    const previousCursor = document.body.style.cursor;
    const previousSelect = document.body.style.userSelect;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    const onMove = (event: MouseEvent) => {
      const left = leftSidebarFrameRef.current?.getBoundingClientRect().left ?? 0;
      const nextWidth = Math.min(520, Math.max(240, event.clientX - left));
      setLeftSidebarWidth(nextWidth);
    };
    const onUp = () => setIsResizingLeft(false);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp, { once: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      document.body.style.cursor = previousCursor;
      document.body.style.userSelect = previousSelect;
    };
  }, [isResizingLeft]);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  // Mobile : la colonne des conversations est repliée, un bouton l'ouvre.
  const [convsOpen, setConvsOpen] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);
  // Liste paginée par curseur ; la recherche est faite en base, sur toutes
  // les discussions affichables (pas seulement celles déjà chargées).
  const conversationsQuery = useInfiniteQuery({
    queryKey: ["ad-conversations", convId ?? null, debouncedSearch],
    initialPageParam: null as null | { u: string; c: string; id: string },
    queryFn: ({ pageParam }) =>
      listFn({ data: { activeId: convId ?? null, cursor: pageParam, search: debouncedSearch || null } }),
    getNextPageParam: (last) => last.nextCursor ?? undefined,
    placeholderData: (prev) => prev,
  });
  const convRows = useMemo(() => {
    const seen = new Set<string>();
    const out: Array<Record<string, any>> = [];
    for (const p of conversationsQuery.data?.pages ?? []) for (const r of p.items as Array<Record<string, any>>) {
      if (seen.has(r.id)) continue;
      seen.add(r.id);
      out.push(r);
    }
    return out;
  }, [conversationsQuery.data]);
  const conversations = {
    data: convRows,
    isLoading: conversationsQuery.isLoading,
    isSuccess: conversationsQuery.isSuccess,
  };
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const { hasNextPage, isFetchingNextPage, fetchNextPage } = conversationsQuery;
  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el || !hasNextPage) return;
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting) && !isFetchingNextPage) void fetchNextPage();
    });
    io.observe(el);
    return () => io.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const current = useQuery({
    queryKey: ["ad-conversation", convId],
    queryFn: () => (convId ? getFn({ data: { id: convId } }) : Promise.resolve(null)),
    enabled: !!convId,
  });

  // Sans conversation dans l'URL : on ouvre la plus récente existante, on
  // n'en crée JAMAIS automatiquement. La création n'a lieu que sur un clic
  // explicite (bouton ci-dessous ou « Nouvelle publicité » dans la barre).
  // Why: l'ancienne auto-création se relançait à chaque remontage/redirection
  // et a produit des milliers de conversations vides en rafale.
  const hasPendingActor = !!(pendingActor || pendingActorName || pendingActorId);
  useEffect(() => {
    if (convId || hasPendingActor || debouncedSearch || !conversations.isSuccess) return;
    const list = (conversations.data as unknown as Array<{ id: string }> | undefined) ?? [];
    if (list[0]?.id) navigate({ to: "/create", search: { c: list[0].id }, replace: true });
  }, [convId, hasPendingActor, conversations.isSuccess, conversations.data, navigate]);

  const [creatingNew, setCreatingNew] = useState(false);
  const startConversation = async () => {
    if (creatingRef.current) return;
    creatingRef.current = true;
    setCreatingNew(true);
    try {
      const row = await createFn();
      qc.invalidateQueries({ queryKey: ["ad-conversations"] });
      navigate({
        to: "/create",
        search: {
          c: (row as { id: string }).id,
          ...(pendingActor ? { actor: pendingActor } : {}),
          ...(pendingActorName ? { actorName: pendingActorName } : {}),
          ...(pendingActorId ? { actorId: pendingActorId } : {}),
        },
        replace: true,
      });
    } catch (e) {
      toast.error(String((e as Error)?.message ?? e));
    } finally {
      creatingRef.current = false;
      setCreatingNew(false);
    }
  };
  const showStartScreen =
    !convId &&
    conversations.isSuccess &&
    !debouncedSearch &&
    (hasPendingActor || ((conversations.data as unknown as unknown[] | undefined)?.length ?? 0) === 0);


  const listFoldersFn = useServerFn(listAdFolders);
  const createFolderFn = useServerFn(createAdFolder);
  const renameFolderFn = useServerFn(renameAdFolder);
  const deleteFolderFn = useServerFn(deleteAdFolder);
  const setFolderFn = useServerFn(setConversationFolder);
  const setFavFn = useServerFn(setConversationFavorite);
  const renameConvFn = useServerFn(renameAdConversation);

  const folders = useQuery({ queryKey: ["ad-folders"], queryFn: () => listFoldersFn() });

  const [showFav, setShowFav] = useState(true);
  const [openFolderIds, setOpenFolderIds] = useState<Record<string, boolean>>({});
  const [showOthers, setShowOthers] = useState(true);
  const [folderDialog, setFolderDialog] = useState<{ mode: "create" } | { mode: "rename"; id: string; name: string } | null>(null);
  const [folderName, setFolderName] = useState("");
  const [folderBusy, setFolderBusy] = useState(false);
  const [renameConv, setRenameConv] = useState<{ id: string; name: string } | null>(null);
  const [renameBusy, setRenameBusy] = useState(false);


  const invalidateConvs = () => qc.invalidateQueries({ queryKey: ["ad-conversations"] });
  const invalidateFolders = () => qc.invalidateQueries({ queryKey: ["ad-folders"] });

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cette conversation ?")) return;
    try {
      await deleteFn({ data: { id } });
      invalidateConvs();
      if (id === convId) navigate({ to: "/create", search: {} });
    } catch (e) {
      toast.error(String((e as Error)?.message ?? e));
    }
  };
  const handleToggleFav = async (id: string, next: boolean) => {
    try { await setFavFn({ data: { conversationId: id, isFavorite: next } }); invalidateConvs(); }
    catch (e) { toast.error(String((e as Error)?.message ?? e)); }
  };
  const handleRename = (id: string, current: string) => {
    setRenameConv({ id, name: current || "Nouvelle pub" });
  };
  const submitRenameConv = async () => {
    if (!renameConv) return;
    const name = renameConv.name.trim();
    if (!name) return;
    setRenameBusy(true);
    try {
      await renameConvFn({ data: { id: renameConv.id, title: name } });
      invalidateConvs();
      setRenameConv(null);
    } catch (e) {
      toast.error(String((e as Error)?.message ?? e));
    } finally {
      setRenameBusy(false);
    }
  };
  const handleMoveToFolder = async (id: string, folderId: string | null) => {
    try { await setFolderFn({ data: { conversationId: id, folderId } }); invalidateConvs(); }
    catch (e) { toast.error(String((e as Error)?.message ?? e)); }
  };
  const handleCreateFolder = () => {
    setFolderName("");
    setFolderDialog({ mode: "create" });
  };
  const handleRenameFolder = (id: string, current: string) => {
    setFolderName(current);
    setFolderDialog({ mode: "rename", id, name: current });
  };
  const submitFolderDialog = async () => {
    if (!folderDialog) return;
    const name = folderName.trim();
    if (!name) return;
    setFolderBusy(true);
    try {
      if (folderDialog.mode === "create") {
        await createFolderFn({ data: { name } });
      } else {
        await renameFolderFn({ data: { id: folderDialog.id, name } });
      }
      invalidateFolders();
      setFolderDialog(null);
    } catch (e) {
      toast.error(String((e as Error)?.message ?? e));
    } finally {
      setFolderBusy(false);
    }
  };
  const handleDeleteFolder = async (id: string) => {
    if (!confirm("Supprimer ce dossier ? Les conversations qu'il contient seront conservées.")) return;
    try { await deleteFolderFn({ data: { id } }); invalidateFolders(); invalidateConvs(); }
    catch (e) { toast.error(String((e as Error)?.message ?? e)); }
  };

  type ConvRow = { id: string; title: string; status: string; created_at?: string; updated_at?: string; state?: Record<string, unknown>; is_favorite?: boolean; folder_id?: string | null; has_user_message?: boolean };
  const allConvs = [ ...((conversations.data as ConvRow[] | undefined) ?? []) ]
    .sort((a, b) => {
      const au = new Date(a.updated_at ?? 0).getTime();
      const bu = new Date(b.updated_at ?? 0).getTime();
      if (bu !== au) return bu - au;
      return new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime();
    });
  // Filtrage de recherche fait en base (listAdConversations).
  const filtered = allConvs;
  const favConvs = filtered.filter((c) => c.is_favorite);
  const folderList = (folders.data as Array<{ id: string; name: string; color?: string }> | undefined) ?? [];
  const convsByFolder = new Map<string, ConvRow[]>();
  const unfiled: ConvRow[] = [];
  for (const c of filtered) {
    if (c.folder_id) {
      const arr = convsByFolder.get(c.folder_id) ?? [];
      arr.push(c);
      convsByFolder.set(c.folder_id, arr);
    } else if (!c.is_favorite) {
      unfiled.push(c);
    }
  }

  const openConv = (id: string) => {
    setConvsOpen(false);
    navigate({ to: "/create", search: { c: id } });
  };
  const toggleOnKey = (e: React.KeyboardEvent<HTMLDivElement>, toggle: () => void) => {
    if (e.target !== e.currentTarget) return;
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); }
  };
  const renderConvRow = (c: ConvRow) => (
    <ConversationRow
      key={c.id}
      conv={c}
      active={c.id === convId}
      folders={folderList}
      onOpen={() => openConv(c.id)}
      onDelete={() => handleDelete(c.id)}
      onRename={() => handleRename(c.id, c.title)}
      onFav={() => handleToggleFav(c.id, !c.is_favorite)}
      onMove={(fid) => handleMoveToFolder(c.id, fid)}
    />
  );

  return (
    <div className="gx-page">
    <div className={`gx-chatv relative${convsOpen ? " gx-cv-open" : ""}`}>
      <aside className="gx-convs" aria-label="Conversations">
        <div className="gx-cv-h">
          <b>Conversations</b>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              className="gx-ib gx-sm"
              onClick={() => { setConvsOpen(false); void startConversation(); }}
              disabled={creatingNew}
              aria-label="Nouvelle discussion"
              title="Nouvelle discussion"
            >
              {creatingNew ? <Loader2 className="gx-i animate-spin" /> : <Plus className="gx-i" />}
            </button>
            <button
              type="button"
              className="gx-ib gx-sm gx-cv-x"
              onClick={() => setConvsOpen(false)}
              aria-label="Fermer la liste des conversations"
              title="Fermer"
            >
              <X className="gx-i" />
            </button>
          </div>
        </div>
        <label className="gx-srch">
          <Search className="gx-i" aria-hidden />
          <span className="gx-sr">Rechercher dans le chat…</span>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher dans le chat…"
            autoComplete="off"
          />
        </label>

        {conversations.isLoading && <div className="gx-cv-e">Chargement…</div>}
        {allConvs.length === 0 && !conversations.isLoading && (
          <div className="gx-cv-e">Aucune conversation.</div>
        )}

        {/* Favoris */}
        <button
          type="button"
          className="gx-cv-g"
          onClick={() => setShowFav((v) => !v)}
          aria-expanded={showFav}
          title={showFav ? "Masquer les favoris" : "Afficher les favoris"}
        >
          Favoris
        </button>
        {showFav && (
          favConvs.length > 0
            ? favConvs.map(renderConvRow)
            : !conversations.isLoading && <div className="gx-cv-e">Aucun favori pour l'instant (menu ⋯ d'une conversation).</div>
        )}

        {/* Dossiers (dont « Autres » : conversations sans dossier) */}
        <div className="gx-cv-g gx-cv-gr">
          <span>Dossiers</span>
          <button type="button" className="gx-cv-add" onClick={handleCreateFolder} aria-label="Nouveau dossier" title="Nouveau dossier">
            <FolderPlus className="gx-i" />
          </button>
        </div>
        {folderList.map((f) => {
          const list = convsByFolder.get(f.id) ?? [];
          const open = openFolderIds[f.id] ?? false;
          const toggle = () => setOpenFolderIds((s) => ({ ...s, [f.id]: !open }));
          return (
            <div key={f.id} className="gx-cv-f">
              <div
                className={`gx-cv gx-cv-row${open ? " gx-open" : ""}`}
                role="button"
                tabIndex={0}
                aria-expanded={open}
                onClick={toggle}
                onKeyDown={(e) => toggleOnKey(e, toggle)}
              >
                {open ? <FolderOpen className="gx-i" /> : <Folder className="gx-i" />}
                <span>{f.name}</span>
                <small>{list.length}</small>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      onClick={(e) => e.stopPropagation()}
                      className="gx-cv-more"
                      aria-label="Options du dossier"
                    >
                      <MoreHorizontal className="gx-i" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenuItem onClick={() => handleRenameFolder(f.id, f.name)}>
                      <Pencil className="mr-2 h-3.5 w-3.5" /> Renommer
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDeleteFolder(f.id)} className="text-destructive focus:text-destructive">
                      <Trash2 className="mr-2 h-3.5 w-3.5" /> Supprimer
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              {open && (
                <div className="gx-cv-in">
                  {list.length === 0 ? <div className="gx-cv-e">Vide</div> : list.map(renderConvRow)}
                </div>
              )}
            </div>
          );
        })}

        {/* Autres */}
        {unfiled.length > 0 && (
          <div className="gx-cv-f">
            <div
              className={`gx-cv gx-cv-row${showOthers ? " gx-open" : ""}`}
              role="button"
              tabIndex={0}
              aria-expanded={showOthers}
              onClick={() => setShowOthers((v) => !v)}
              onKeyDown={(e) => toggleOnKey(e, () => setShowOthers((v) => !v))}
            >
              {showOthers ? <FolderOpen className="gx-i" /> : <Folder className="gx-i" />}
              <span>{folderList.length > 0 || favConvs.length > 0 ? "Autres" : "Toutes"}</span>
              <small>{unfiled.length}</small>
            </div>
            {showOthers && <div className="gx-cv-in">{unfiled.map(renderConvRow)}</div>}
          </div>
        )}
        <div ref={loadMoreRef} className="h-6 shrink-0">
          {isFetchingNextPage && <div className="gx-cv-e">Chargement…</div>}
        </div>
      </aside>

      {/* Mobile : bouton d'ouverture de la colonne des conversations */}
      <button
        type="button"
        className="gx-ib gx-sm gx-cv-tg"
        onClick={() => setConvsOpen(true)}
        aria-label="Afficher les conversations"
        title="Conversations"
      >
        <PanelLeftOpen className="gx-i" />
      </button>
      {convsOpen && <div className="gx-cv-scrim" onClick={() => setConvsOpen(false)} aria-hidden />}

      {/* Fil de discussion */}
      <section className="gx-thread">
        {convId && current.data ? (
          <ChatArea        {convId && current.data ? (
          <ChatArea
            key={convId}
            conversationId={convId}
            initialMessages={((current.data as unknown as { messages?: UIMessage[] }).messages ?? []) as UIMessage[]}
            initialState={(current.data as unknown as { state?: Record<string, unknown> }).state ?? {}}
            title={
              ((conversations.data as unknown as Array<{ id: string; title?: string }> | undefined)?.find((c) => c.id === convId)?.title) ||
              (current.data as unknown as { title?: string }).title ||
              "Nouvelle pub"
            }
            conversationCreatedAt={(current.data as unknown as { created_at?: string }).created_at}
            conversationUpdatedAt={(current.data as unknown as { updated_at?: string }).updated_at}
          />
        ) : showStartScreen ? (
          <div className="gx-th-in gx-th-start">
            <p>
              {pendingActorName ? `Lance une nouvelle discussion avec ${pendingActorName}.` : "Démarre une nouvelle discussion pour créer ta pub."}
            </p>
            <button type="button" className="gx-btn gx-pri" onClick={startConversation} disabled={creatingNew}>
              <Plus className="gx-i" />{creatingNew ? "Ouverture…" : "Nouvelle discussion"}
            </button>
          </div>
        ) : (
          <div className="gx-th-in" aria-busy="true" aria-label="Chargement de la discussion">
            <Skeleton className="ml-auto h-10 w-2/3 max-w-sm rounded-2xl" />
            <div className="flex items-start gap-3">
              <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
              <Skeleton className="h-16 w-3/4 max-w-md rounded-2xl" />
            </div>
            <Skeleton className="ml-auto h-8 w-1/2 max-w-xs rounded-2xl" />
          </div>
        )}
      </section>
    </div>

      <Dialog open={!!folderDialog} onOpenChange={(o) => { if (!o) setFolderDialog(null); }}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>{folderDialog?.mode === "rename" ? "Renommer le dossier" : "Nouveau dossier"}</DialogTitle>
            <DialogDescription>
              {folderDialog?.mode === "rename"
                ? "Choisis un nouveau nom pour ce dossier."
                : "Regroupe tes conversations dans un dossier pour t'y retrouver plus facilement."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="folder-name" className="text-xs">Nom du dossier</Label>
            <Input
              id="folder-name"
              autoFocus
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              placeholder="Ex. Campagne été"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submitFolderDialog(); }
              }}
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setFolderDialog(null)} disabled={folderBusy}>Annuler</Button>
            <Button onClick={submitFolderDialog} disabled={folderBusy || !folderName.trim()}>
              {folderBusy ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : null}
              {folderDialog?.mode === "rename" ? "Renommer" : "Créer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!renameConv} onOpenChange={(o) => { if (!o) setRenameConv(null); }}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Renommer la conversation</DialogTitle>
            <DialogDescription>Choisis un nouveau nom pour cette conversation.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="conv-name" className="text-xs">Nom</Label>
            <Input
              id="conv-name"
              autoFocus
              value={renameConv?.name ?? ""}
              onChange={(e) => setRenameConv((s) => (s ? { ...s, name: e.target.value } : s))}
              placeholder="Nouvelle pub"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submitRenameConv(); }
              }}
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setRenameConv(null)} disabled={renameBusy}>Annuler</Button>
            <Button onClick={submitRenameConv} disabled={renameBusy || !renameConv?.name.trim()}>
              {renameBusy ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : null}
              Renommer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ChatArea({
  conversationId,
  initialMessages,
  initialState,
  title,
  conversationCreatedAt,
  conversationUpdatedAt,
}: {
  conversationId: string;
  initialMessages: UIMessage[];
  initialState: Record<string, unknown>;
  title: string;
  conversationCreatedAt?: string;
  conversationUpdatedAt?: string;
}) {

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<ChatComposerHandle>(null);
  const safeInitialMessages = useMemo(() => sanitizeMessagesForChat(initialMessages), [initialMessages]);
  const safeInitialState = useMemo(
    () => ({ ...initialState, productImages: safePersistableImageUrls(initialState.productImages) }),
    [initialState],
  );
  const [state, setState] = useState<Record<string, unknown>>(safeInitialState);
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);
  const navigate = useNavigate();
  const qc = useQueryClient();

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat/create-ad",
        headers: async () => {
          const { data } = await supabase.auth.getSession();
          return { Authorization: `Bearer ${data.session?.access_token ?? ""}` };
        },
        prepareSendMessagesRequest: ({ messages }) => ({
          body: {
            messages: sanitizeMessagesForChat(messages),
            conversationId,
            currentState: sanitizeStateForChat(stateRef.current),
            aiMode: getClientAiMode(),
            uiLanguage:
              typeof window !== "undefined" && window.localStorage.getItem("growthity.language") === "en"
                ? "en"
                : "fr",
          },
        }),


      }),
    [conversationId],
  );

  const { messages: rawMessages, setMessages, sendMessage, status, error, stop } = useChat({
    id: conversationId,
    messages: safeInitialMessages,
    experimental_throttle: 400,
    transport,
    onFinish: () => {
      qc.invalidateQueries({ queryKey: ["ad-conversations"] });
      // Le renommage serveur peut arriver juste après la fin du flux.
      window.setTimeout(() => qc.invalidateQueries({ queryKey: ["ad-conversations"] }), 2500);
      qc.invalidateQueries({ queryKey: ["credit-summary"] });
      requestAnimationFrame(() => inputRef.current?.focus());
    },
    onError: (err) => {
      if (isBillingSuspendedError(err)) {
        navigate({ to: "/paiement-refuse" });
        return;
      }
      // Same shape for HTTP 429 (chat endpoint) and thrown Error from generation
      // server functions - parsed by the shared rate-limit helper.
      const rl = parseRateLimitError(err);
      if (rl) {
        toast.error(formatRateLimitMessage(rl));
        return;
      }
      if (isAuthError(err)) {
        toast.error(SESSION_EXPIRED_MESSAGE, {
          action: { label: "Se reconnecter", onClick: () => navigate({ to: "/auth" }) },
        });
        return;
      }
      if (handleInsufficientCredits(err)) return;
      toast.error(toUserMessage(err));
    },
  });
  // Garde-fou d'affichage : ordre et unicité. Supprime les doublons d'id et
  // une question de l'assistant répétée mot pour mot juste après la même.
  // Affichage : notes intermédiaires entre outils masquées dès qu'une réponse finale existe.
  const messages = useMemo(
    () => dedupeChatMessages(rawMessages).map((m) => (m.role === "assistant" ? { ...m, parts: hideIntermediateText(m.parts as any) as UIMessage["parts"] } : m)),
    [rawMessages],
  );


  const toolBriefSignature = useMemo(() => messageToolBriefSignature(messages), [messages]);
  const initialStateSignature = useMemo(() => JSON.stringify(sanitizeStateForChat(safeInitialState)), [safeInitialState]);

  // Merge tool-update_brief inputs into local state only when brief data actually changes.
  useEffect(() => {
    let merged: Record<string, unknown> = { ...safeInitialState };
    const currentGeneratedAds = parseGeneratedAds(stateRef.current.generatedAds);
    if (currentGeneratedAds.length > 0) {
      merged.generatedAds = currentGeneratedAds;
    }
    const existingActorImgs = safePersistableImageUrls(
      Array.isArray(stateRef.current.stockActorImageUrls) ? stateRef.current.stockActorImageUrls : [],
    );
    const mergedActorImgs = [...existingActorImgs];
    if (typeof stateRef.current.stockActorId === "string") merged.stockActorId = stateRef.current.stockActorId;
    if (typeof stateRef.current.stockActorName === "string") merged.stockActorName = stateRef.current.stockActorName;
    // Start productImages from what's already in state (uploads via 📎 or previously scraped URLs).
    const existingImgs = safePersistableImageUrls(stateRef.current.productImages);
    const mergedImgs = [...existingImgs];
    // Une nouvelle photo produit ajoutée APRÈS un « je n'ai pas d'image » doit
    // relever le verrou, sinon les photos importées ensuite restaient ignorées.
    const noteProductImage = () => {
      if (merged.hasProductImage === "no") merged.hasProductImage = "yes";
    };
    const collectImageMarkdownUrls = (text: string) => {
      const isActorSelection = /J['’]?ai choisi\s+(?:l['’]?acteur|un acteur|les acteurs)\s+UGC|C['’]?est mon acteur face cam[ée]ra/i.test(text);
      for (const match of text.matchAll(/!\[[^\]]*\]\((https?:\/\/[^\s)]+)\)/g)) {
        const url = match[1];
        if (!url) continue;
        if (isActorSelection && !mergedActorImgs.includes(url)) mergedActorImgs.push(url);
        if (!mergedImgs.includes(url)) {
          mergedImgs.push(url);
          if (!isActorSelection) noteProductImage();
        }
      }
    };
    for (const m of messages) {
      for (const p of (m.parts ?? []) as Array<{
        type: string;
        text?: string;
        input?: Record<string, unknown>;
        output?: Record<string, unknown>;
      }>) {
        if (p.type === "text" && typeof p.text === "string") {
          collectImageMarkdownUrls(p.text);
        }
        if (p.type === "tool-update_brief" && p.input) {
          merged = { ...merged, ...p.input };
          if (p.input.hasProductImage === "no") {
            const actorSet = new Set(mergedActorImgs);
            for (let i = mergedImgs.length - 1; i >= 0; i -= 1) {
              if (!actorSet.has(mergedImgs[i])) mergedImgs.splice(i, 1);
            }
            delete merged.productMemory;
          }
        }
        if (p.type === "tool-ready_to_generate" && p.input && (p as any).output?.blocked !== true) {
          merged = { ...merged, ...p.input };
        }
        if (p.type === "tool-fetch_url" && p.output) {
          const out = p.output as { productImageUrls?: unknown; description?: unknown; title?: unknown };
          if (Array.isArray(out.productImageUrls)) {
            for (const u of out.productImageUrls) {
              if (typeof u === "string" && !mergedImgs.includes(u)) {
                mergedImgs.push(u);
                noteProductImage();
              }
            }
          }
          if (typeof out.description === "string" && !merged.description) {
            const t = typeof out.title === "string" ? out.title : "";
            merged.description = (t ? `${t} - ` : "") + out.description;
          }
        }
      }
    }
    if (mergedImgs.length > 0) {
      merged.productImages = mergedImgs;
      if (merged.hasProductImage !== "no") merged.hasProductImage = "yes";
    } else if (merged.hasProductImage === "no") {
      merged.productImages = [];
    }
    if (mergedActorImgs.length > 0) {
      merged.stockActorImageUrls = mergedActorImgs;
    }
    if (stateRecordsEqual(stateRef.current, merged)) return;
    setState(merged);
    // Sync the local productImages hook when new scraped images arrive.
    setProductImages((prev) => {
      if (prev.length === mergedImgs.length && prev.every((v, i) => v === mergedImgs[i])) return prev;
      return mergedImgs;
    });
  }, [toolBriefSignature, initialStateSignature, safeInitialState]);


  const isAtBottomRef = useRef(true);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const showScrollToBottomRef = useRef(false);
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      const threshold = 80;
      const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
      const atBottom = distanceFromBottom < threshold;
      isAtBottomRef.current = atBottom;
      const next = !atBottom && el.scrollHeight > el.clientHeight + 200;
      if (next !== showScrollToBottomRef.current) {
        showScrollToBottomRef.current = next;
        setShowScrollToBottom(next);
      }
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  const latestMessageSignature = useMemo(
    () => (messages.length > 0 ? messageRenderSignature(messages[messages.length - 1]) : ""),
    [messages],
  );
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => {
      if (!isAtBottomRef.current) return;
      el.scrollTop = el.scrollHeight;
      showScrollToBottomRef.current = false;
      setShowScrollToBottom(false);
    });
    observer.observe(el);
    for (const child of Array.from(el.children)) observer.observe(child);
    return () => observer.disconnect();
  }, [messages.length, status, latestMessageSignature]);
  // Quand le client envoie un message, on revient toujours en bas pour suivre la réponse.
  const lastMsgCountRef = useRef(messages.length);
  useEffect(() => {
    const grew = messages.length > lastMsgCountRef.current;
    lastMsgCountRef.current = messages.length;
    if (!grew || messages[messages.length - 1]?.role !== "user") return;
    isAtBottomRef.current = true;
    const el = scrollRef.current;
    if (el) requestAnimationFrame(() => { el.scrollTop = el.scrollHeight; });
  }, [messages]);
  const lastAutoScrollSignatureRef = useRef("");
  useEffect(() => {
    if (!isAtBottomRef.current) return;
    const el = scrollRef.current;
    if (!el) return;
    const signature = `${messages.length}:${status}:${latestMessageSignature}`;
    if (signature === lastAutoScrollSignatureRef.current) return;
    lastAutoScrollSignatureRef.current = signature;
    const scrollToBottom = () => {
      const current = scrollRef.current;
      if (!current || !isAtBottomRef.current) return;
      current.scrollTop = current.scrollHeight;
      showScrollToBottomRef.current = false;
      setShowScrollToBottom(false);
    };
    scrollToBottom();
    requestAnimationFrame(scrollToBottom);
  }, [messages.length, status, latestMessageSignature]);


  useEffect(() => {
    inputRef.current?.focus();
    // Force scroll to bottom when opening a conversation (normal chat order)
    const el = scrollRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
      isAtBottomRef.current = true;
      requestAnimationFrame(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      });
    }
  }, [conversationId]);


  const [replyingTo, setReplyingTo] = useState<{
    id: string;
    snippet: string;
    kind: "text" | "video" | "image" | "carousel";
    adUrl?: string;
    adTitle?: string;
  } | null>(null);

  // Images uploadées mais pas encore envoyées à l'IA (attachées au prochain message).
  const [pendingImages, setPendingImages] = useState<string[]>([]);
  // Vidéos importées depuis l'ordinateur : simplement jointes au message.
  // L'assistant les regarde lui-même (outil analyze_video) après l'envoi.
  const [pendingVideos, setPendingVideos] = useState<
    Array<{ url: string; name: string }>
  >([]);
  const pendingVideosRef = useRef(pendingVideos);
  useEffect(() => {
    pendingVideosRef.current = pendingVideos;
  }, [pendingVideos]);
  // Audios importés depuis l'ordinateur (brief vocal, voix-off de référence).
  // L'assistant les écoute lui-même (outil analyze_audio) après l'envoi.
  const [pendingAudios, setPendingAudios] = useState<
    Array<{ url: string; name: string }>
  >([]);
  const pendingAudiosRef = useRef(pendingAudios);
  useEffect(() => {
    pendingAudiosRef.current = pendingAudios;
  }, [pendingAudios]);
  // Campagne Meta jointe au prochain message : sélectionner une campagne
  // n'envoie plus rien toute seule — l'utilisateur écrit ensuite ce qu'il veut
  // (modifier, voir les stats, dupliquer…).
  const [pendingCampaign, setPendingCampaign] = useState<{
    id: string;
    name: string;
    first_ad_id: string | null;
    is_online?: boolean;
    ads_count?: number;
    objective?: string | null;
    account_name?: string | null;
  } | null>(null);
  const pendingCampaignRef = useRef(pendingCampaign);
  useEffect(() => {
    pendingCampaignRef.current = pendingCampaign;
  }, [pendingCampaign]);
  const pendingImagesRef = useRef(pendingImages);
  const replyingToRef = useRef(replyingTo);
  // Annonces concurrentes choisies comme références : elles restent attachées
  // (pastilles) à la conversation jusqu'à ce que le client les retire.
  const competitorRefsKey = `growthity.competitorRefs.${conversationId ?? "new"}`;
  const [competitorRefs, setCompetitorRefs] = useState<CompetitorRef[]>([]);
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(competitorRefsKey);
      setCompetitorRefs(raw ? (JSON.parse(raw) as CompetitorRef[]) : []);
    } catch {
      setCompetitorRefs([]);
    }
  }, [competitorRefsKey]);
  const competitorRefsRef = useRef(competitorRefs);
  useEffect(() => {
    competitorRefsRef.current = competitorRefs;
    try {
      if (competitorRefs.length) window.localStorage.setItem(competitorRefsKey, JSON.stringify(competitorRefs));
      else window.localStorage.removeItem(competitorRefsKey);
    } catch {
      // stockage indisponible
    }
  }, [competitorRefs, competitorRefsKey]);
  const statusRef = useRef(status);
  const editImageFromChatRef = useRef<((userText: string, previousImage: string, previousTitle: string) => void) | null>(null);

  // Acteur(s) UGC choisis mais pas encore envoyés - l'utilisateur peut d'abord écrire son texte.
  type PendingActor = { url: string; name: string | null; id: string | null };
  const [pendingActors, setPendingActors] = useState<PendingActor[]>([]);
  const pendingActorsRef = useRef(pendingActors);
  useEffect(() => { pendingActorsRef.current = pendingActors; }, [pendingActors]);
  // Validation des acteurs (état + images de référence) : uniquement à l'envoi du message.
  const commitPendingActorsRef = useRef<((actors: PendingActor[]) => Promise<void>) | null>(null);

  // Créations existantes jointes au prochain message (via « Importer depuis mes créations »)
  const [pendingCreatives, setPendingCreatives] = useState<PickedCreation[]>([]);
  const pendingCreativesRef = useRef(pendingCreatives);
  useEffect(() => { pendingCreativesRef.current = pendingCreatives; }, [pendingCreatives]);

  useEffect(() => {
    pendingImagesRef.current = pendingImages;
  }, [pendingImages]);

  useEffect(() => {
    replyingToRef.current = replyingTo;
  }, [replyingTo]);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);


  const handleReplyToMessage = useCallback((m: UIMessage) => {
    const t = (m.parts ?? [])
      .filter((p) => p.type === "text")
      .map((p) => (p as { text: string }).text)
      .join("")
      .replace(SUGGESTIONS_RE, "")
      .trim();
    const snippet = t.length > 140 ? `${t.slice(0, 140)}…` : t || "(message)";
    setReplyingTo({ id: m.id, snippet, kind: "text" });
    inputRef.current?.focus();
  }, []);
  const handleReplyToAd = useCallback((ad: GeneratedAd) => {
    setReplyingTo({
      id: ad.id,
      snippet: `${ad.kind === "video" ? "Vidéo" : ad.kind === "image" ? "Image" : "Carrousel"} - ${ad.title}`,
      kind: ad.kind,
      adUrl: ad.kind === "image" ? ad.url ?? undefined : undefined,
      adTitle: ad.title,
    });
    inputRef.current?.focus();
  }, []);

  // Trigger le mode "édition d'image" depuis le menu d'actions : place la création
  // dans replyingTo pour que le prochain message texte lance editImageFromChat.
  const handleEditCreation = useCallback((adId: string, url: string, title: string, kind: "image" | "video" | "carousel") => {
    setReplyingTo({
      id: adId,
      snippet: `${kind === "video" ? "Vidéo" : kind === "image" ? "Image" : "Carrousel"} - ${title}`,
      kind,
      adUrl: kind === "image" ? url : undefined,
      adTitle: title,
    });
    inputRef.current?.focus();
  }, []);



  const handleOpenStockActorsRef = useRef<() => void>(() => {});
  const autoPickActorRef = useRef<((label: string) => Promise<void>) | null>(null);
  const actorProfileTextRef = useRef("");
  const handleOpenCatalogTabRef = useRef<(tab: "avatars" | "products" | "actors") => void>(() => {});
  const handleSuggestion = useCallback((text: string) => {
    if (/^\s*📁\s*Choisir un acteur/i.test(text)) {
      handleOpenStockActorsRef.current();
      return;
    }
    if (/^\s*📁\s*(Importer|Choisir).*(produit)/i.test(text)) {
      handleOpenCatalogTabRef.current("products");
      return;
    }
    if (/^\s*📁\s*(Importer|Choisir).*(avatar)/i.test(text)) {
      handleOpenCatalogTabRef.current("actors");
      return;
    }
    if (/^\s*📷\s*Importer des photos/i.test(text)) {
      fileInputRef.current?.click();
      return;
    }
    // « Tu choisis pour moi » (acteur) : on choisit vraiment un acteur de la
    // galerie, on l'affiche (miniature + prénom, bouton Changer) et on le
    // transmet au chat — jamais un personnage générique non annoncé.
    if (/tu choisis(?: pour moi| l['’]acteur)/i.test(text) && autoPickActorRef.current) {
      setPromptPreview(null);
      setEditablePrompt("");
      void autoPickActorRef.current(text);
      return;
    }
    if (/^\s*(?:➡️\s*)?Continuer sans photo/i.test(text)) {
      setPromptPreview(null);
      setEditablePrompt("");
      sendMessage({ text: "Je n'ai pas de photo du produit, continue sans photo.<!--brief:{\"hasProductImage\":\"no\"}-->" });
      return;
    }
    // « Décrire ou uploader le produit moi-même » : ouvre le sélecteur de
    // photo ET place le curseur dans le champ pour décrire le produit.
    if (/d[ée]crire\s+ou\s+uploader\s+le\s+produit/i.test(text)) {
      inputRef.current?.focus();
      fileInputRef.current?.click();
      toast.info("Choisis une photo du produit, ou décris-le dans le champ de message.");
      return;
    }
    // Un nouveau message rend caduc tout aperçu de brief en cours.
    setPromptPreview(null);
    setEditablePrompt("");
    sendMessage({ text });
  }, [sendMessage]);


  // Édition d'image via le bouton "Modifier" : appelle directement genImageFn
  // en mode previousImage (l'image existante devient la base à retoucher).
  // La nouvelle image est ajoutée à côté de l'ancienne, jamais en remplacement.
  const editImageFromChat = async (
    userText: string,
    previousImage: string,
    previousTitle: string,
  ) => {
    if (!conversationId) {
      toast.error("Conversation introuvable.");
      return;
    }
    const loadingToast = toast.loading("Modification de l'image en cours…");
    setGenerating(true);
    let anchorMessageId = messages[messages.length - 1]?.id ?? null;
    try {
      // 1) Poste le message utilisateur (visible dans le chat, persisté en DB)
      //    en lui donnant un contexte clair pour que l'IA ne relance PAS le brief.
      const trimmed = userText.trim().slice(0, 800);
      const chatText = `> **↳ Modification de l'image :** ${previousTitle}\n\n${trimmed}\n\n_(édition appliquée directement - pas besoin de relancer le brief.)_`;
      sendMessage({ text: chatText });

      // 2) Ancre visuelle pour rattacher la nouvelle image au bon endroit.
      try {
        const anchor = await appendGenerationAnchorFn({
          data: { conversationId, kind: "image", title: previousTitle },
        });
        const anchorMessage = (anchor as { message?: UIMessage; messageId?: string }).message;
        if (anchorMessage) {
          anchorMessageId = anchorMessage.id;
          setMessages((cur) =>
            cur.some((m) => m.id === anchorMessage.id) ? cur : [...cur, anchorMessage],
          );
        } else if ((anchor as { messageId?: string }).messageId) {
          anchorMessageId = (anchor as { messageId: string }).messageId;
        }
      } catch {
        // pas bloquant
      }

      // 3) Génération en mode ÉDITION (previousImage = l'image d'origine).
      const { imageUrl } = await genImageFn({
        data: {
          prompt: trimmed,
          previousImage,
          sourceImages: productImages,
        },
      });
      const row = await saveAdFn({
        data: {
          campaign_id: null,
          title: previousTitle,
          prompt: trimmed.slice(0, 4000),
          originalBrief: trimmed.slice(0, 2000),
          content_type: "image",
          generated_url: imageUrl,
          sourceImages: [],
        },
      });
      const ad: GeneratedAd = {
        id: (row as { id: string }).id,
        kind: "image",
        title: previousTitle,
        url: imageUrl,
        status: "ready",
        afterMessageId: anchorMessageId,
        createdAt: Date.now(),
      };
      upsertGeneratedAdLocal(ad);
      await appendGeneratedAdFn({ data: { conversationId, ad } });
      qc.invalidateQueries({ queryKey: ["ads"] });
      qc.invalidateQueries({ queryKey: ["ad-conversation", conversationId] });
      toast.success("Nouvelle version prête ✨ (l'originale est conservée)", { id: loadingToast });
    } catch (err) {
      toast.dismiss(loadingToast);
      // Manque de crédits = cas métier attendu : pas de log d'erreur, on redirige.
      if (handleInsufficientCredits(err)) return;
      console.error("[chat] editImageFromChat error", err);
      toast.error(toUserMessage(err, "Échec de la modification"), { id: loadingToast });
    } finally {
      setGenerating(false);
    }
  };
  editImageFromChatRef.current = editImageFromChat;

  const onSubmit = useCallback((rawText: string) => {
    const text = rawText.trim();
    const currentPendingImages = pendingImagesRef.current;
    const currentPendingActors = pendingActorsRef.current;
    const currentPendingCreatives = pendingCreativesRef.current;
    const currentReplyingTo = replyingToRef.current;
    const hasPendingImages = currentPendingImages.length > 0;
    const hasPendingActors = currentPendingActors.length > 0;
    const hasPendingCreatives = currentPendingCreatives.length > 0;
    const currentPendingVideos = pendingVideosRef.current;
    const hasPendingVideos = currentPendingVideos.length > 0;
    const currentPendingAudios = pendingAudiosRef.current;
    const hasPendingAudios = currentPendingAudios.length > 0;
    const currentPendingCampaign = pendingCampaignRef.current;
    const currentCompetitorRefs = competitorRefsRef.current;
    if (!text && !hasPendingImages && !hasPendingActors && !hasPendingCreatives && !hasPendingVideos && !hasPendingAudios && !currentPendingCampaign) return;
    if (statusRef.current === "streaming" || statusRef.current === "submitted") return;

    // Édition directe d'image : on garde l'originale et on génère une variante
    // à côté sans passer par le brief IA (qui repartait à zéro).
    if (text && currentReplyingTo && currentReplyingTo.kind === "image" && currentReplyingTo.adUrl) {
      const editRef = { url: currentReplyingTo.adUrl, title: currentReplyingTo.adTitle ?? currentReplyingTo.snippet };
      setReplyingTo(null);
      void editImageFromChatRef.current?.(text, editRef.url, editRef.title);
      return;
    }

    // Ne jamais injecter les images dans le texte du chat : l'historique reste léger,
    // les URLs produit sont sauvegardées séparément dans state.productImages.
    const imageNote = hasPendingImages
      ? currentPendingImages
          .map((_, i) => `📎 Image produit ${i + 1} jointe`)
          .join("\n")
      : "";

    let actorBlock = "";
    if (hasPendingActors) {
      // C'est ici — et seulement ici — que les acteurs affichés dans le composer
      // deviennent réels pour la conversation (un acteur retiré avant l'envoi
      // n'a laissé aucune trace).
      void commitPendingActorsRef.current?.(currentPendingActors);
      const names = currentPendingActors.map((a) => a.name).filter((n): n is string => !!n);
      const label = names.length === 0
        ? "un acteur UGC de la galerie"
        : names.length === 1
          ? `l'acteur UGC "${names[0]}" (galerie)`
          : `les acteurs UGC ${names.map((n) => `"${n}"`).join(", ")} (galerie)`;
      const imagesMd = currentPendingActors
        .map((a) => `![${a.name ?? "Acteur"}](${a.url})`)
        .join(" ");
      // Visible : « Acteur : Caroline » + miniature. La consigne pour l'assistant
      // voyage en métadonnée cachée (jamais affichée dans la bulle).
      const visible = names.length ? `Acteur : ${names.join(", ")}` : "Acteur choisi dans la galerie";
      actorBlock = `${imagesMd}\n\n${visible}\n<!--actor-choice:J'ai choisi ${label}. C'est mon acteur face caméra pour la vidéo, ne me redemande pas l'acteur.-->`;
    }


    let creativeBlock = "";
    if (hasPendingCreatives) {
      const titles = currentPendingCreatives.map((c) => `« ${c.title} »`).join(", ");
      const idsJson = JSON.stringify(currentPendingCreatives.map((c) => c.id));
      const mediaJson = JSON.stringify(
        currentPendingCreatives.map((c) => ({ t: c.title, u: c.thumbUrl, k: c.contentType })),
      );
      creativeBlock = `📎 Création(s) jointe(s) depuis ma bibliothèque : ${titles}\n<!--selected-creatives:${idsJson}-->\n<!--selected-media:${mediaJson}-->`;
    }

    // Vidéo importée : message volontairement minimal (nom du fichier seulement).
    // L'URL voyage dans un marqueur invisible ; l'assistant regarde la vidéo
    // lui-même après l'envoi, via son outil d'analyse.
    let videoBlock = "";
    if (hasPendingVideos) {
      videoBlock = currentPendingVideos
        .map((v) => `🎬 Vidéo jointe : « ${v.name} »`)
        .join("\n");
      videoBlock += `\n<!--attached-videos:${JSON.stringify(
        currentPendingVideos.map((v) => ({ u: v.url, n: v.name })),
      )}-->`;
    }

    // Audio importé : même principe que la vidéo — nom du fichier seulement,
    // l'URL voyage dans un marqueur invisible et l'assistant l'écoute lui-même.
    let audioBlock = "";
    if (hasPendingAudios) {
      audioBlock = currentPendingAudios
        .map((a) => `🎧 Audio joint : « ${a.name} »`)
        .join("\n");
      audioBlock += `\n<!--attached-audios:${JSON.stringify(
        currentPendingAudios.map((a) => ({ u: a.url, n: a.name })),
      )}-->`;
    }

    // Campagne Meta jointe : le message reste celui de l'utilisateur, la
    // campagne voyage dans un marqueur invisible (aucune intention imposée).
    let campaignBlock = "";
    if (currentPendingCampaign) {
      const c = currentPendingCampaign;
      campaignBlock = `<!--attached-campaign:${JSON.stringify({
        id: c.id,
        name: c.name,
        first_ad_id: c.first_ad_id,
        is_online: c.is_online,
        ads_count: c.ads_count,
        objective: c.objective,
        account_name: c.account_name,
      })}-->\n<!--selected-campaign:"${c.id}"-->${
        c.first_ad_id ? `\n<!--selected-meta-ad:"${c.first_ad_id}"-->` : ""
      }`;
      if (!text) {
        campaignBlock += `\nDemande-moi en UNE phrase ce que je veux faire avec cette campagne (modifier, statistiques, dupliquer…).`;
      }
    }

    const competitorBlock = currentCompetitorRefs.length ? buildCompetitorRefsMarker(currentCompetitorRefs) : "";
    const parts = [actorBlock, text, imageNote, creativeBlock, videoBlock, audioBlock, campaignBlock, competitorBlock].filter(Boolean);
    const body = parts.join("\n\n");

    const finalText = currentReplyingTo
      ? `> **↳ En réponse à${currentReplyingTo.kind !== "text" ? ` (${currentReplyingTo.kind})` : ""} :** ${currentReplyingTo.snippet}\n\n${body}`
      : body;
    setReplyingTo(null);
    setPendingImages([]);
    setPendingActors([]);
    setPendingCreatives([]);
    setPendingVideos([]);
    setPendingAudios([]);
    setPendingCampaign(null);
    // Les références concurrentes partent avec ce message (le serveur les relit
    // dans tout l'historique) : on vide la barre du chat après l'envoi.
    if (currentCompetitorRefs.length) {
      competitorRefsRef.current = [];
      setCompetitorRefs([]);
    }
    // Envoyer un message ferme l'aperçu de brief/prompt en cours.
    setPromptPreview(null);
    setEditablePrompt("");
    sendMessage({ text: finalText });
  }, [sendMessage]);
  const competitorRefsApi = useMemo<CompetitorRefsApi>(() => ({
    selectedIds: new Set(competitorRefs.map((r) => r.id)),
    toggle: (ref) =>
      setCompetitorRefs((prev) => (prev.some((r) => r.id === ref.id) ? prev.filter((r) => r.id !== ref.id) : [...prev, ref].slice(-10))),
    sendWithRefs: (text, refs) => {
      const merged = [...competitorRefsRef.current.filter((r) => !refs.some((x) => x.id === r.id)), ...refs].slice(-10);
      competitorRefsRef.current = merged;
      setCompetitorRefs(merged);
      onSubmit(text);
    },
  }), [competitorRefs, onSubmit]);

  // Profil d'acteur attendu : stratégie + pubs de référence choisies.
  const actorProfileText = useMemo(() => {
    const parts: string[] = [];
    if (isStrategyState(state.strategy)) parts.push(strategyToText(state.strategy.doc));
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i]?.role !== "user") continue;
      const refs = parseCompetitorRefs(messageRawText(messages[i]!));
      if (refs?.length) { parts.push(refs.map((r) => `${r.body ?? ""} ${r.title ?? ""}`).join(" ")); break; }
    }
    return parts.join("\n");
  }, [state.strategy, messages]);
  actorProfileTextRef.current = actorProfileText;
  const readyBriefInfo = useMemo(() => {
    for (let messageIndex = messages.length - 1; messageIndex >= 0; messageIndex--) {
      const m = messages[messageIndex];
      for (const p of (m.parts ?? []) as Array<{
        type: string;
        state?: string;
        input?: Record<string, unknown>;
      }>) {
        // On attend la réponse de l'outil : pendant le streaming, output est
        // vide et un brief « bloqué » (question photos/acteur) passait pour prêt.
        if (
          p.type === "tool-ready_to_generate" &&
          p.input &&
          p.state === "output-available" &&
          (p as any).output?.blocked !== true
        ) {
          // Une question en attente (photos, acteur…) : rien n'est prêt tant
          // que le client n'a pas répondu.
          const last = messages[messages.length - 1];
          const pending = last?.role === "assistant" ? messageRawText(last).match(SUGGESTIONS_RE)?.[1] ?? "" : "";
          if (/photo|catalogue|acteur|avatar|dur[ée]e/i.test(pending)) return null;
          return { input: p.input, messageId: m.id, messageIndex };
        }
      }
    }
    return null;
  }, [messages, toolBriefSignature]);
  const readyBrief = readyBriefInfo?.input ?? null;

  const canGenerate = Boolean(
    String(state.description ?? readyBrief?.description ?? "").trim().length >= 3,
  );

  const suggestFn = useServerFn(generateCreativePrompt);
  const genImageFn = useServerFn(generateAdImage);
  const saveAdFn = useServerFn(saveAd);
  const submitVideoFn = useServerFn(submitVideoAd);
  const startChainFn = useServerFn(startVideoChain);
  const [chainVersion, setChainVersion] = useState(0);
  useEffect(() => {
    const onStarted = () => setChainVersion((v) => v + 1);
    window.addEventListener("video-chain-started", onStarted);
    return () => window.removeEventListener("video-chain-started", onStarted);
  }, []);
  const [chainActive, setChainActive] = useState(false);
  const refreshPendingAdsFn = useServerFn(refreshPendingAds);
  const appendGeneratedAdFn = useServerFn(appendGeneratedAdToConversation);
  const appendGenerationAnchorFn = useServerFn(appendGenerationAnchorToConversation);
  const appendProductImagesFn = useServerFn(appendProductImagesToConversation);
  const removeProductImageFn = useServerFn(removeProductImageFromConversation);
  const truncateConversationFn = useServerFn(truncateConversationAfterMessage);

  // Rewind / checkpoint : reprend la conversation à partir
  // d'un message utilisateur donné. On supprime le message cible + tout ce qui
  // suit (bulles, tool calls, créations générées) et on pré-remplit le composer
  // avec le texte original pour que l'utilisateur le corrige et renvoie.
  const handleEditFromUserMessage = useCallback(async (m: UIMessage) => {
    if (m.role !== "user") return;
    if (!conversationId) {
      toast.error("Conversation introuvable.");
      return;
    }
    const rawText = (m.parts ?? [])
      .filter((p) => p.type === "text")
      .map((p) => (p as { text: string }).text)
      .join("")
      .replace(SUGGESTIONS_RE, "")
      .trim();
    const idx = messages.findIndex((x) => x.id === m.id);
    if (idx === -1) return;

    try {
      await truncateConversationFn({ data: { conversationId, messageId: m.id, includeTarget: true } });
    } catch (err) {
      toast.error(toUserMessage(err));
      return;
    }

    // Coupe côté client dans le même tick que la mise à jour serveur.
    setMessages((cur) => cur.slice(0, idx));
    const keptIds = new Set(messages.slice(0, idx).map((x) => x.id));
    setGeneratedAds((prev) => {
      const survivors = prev.filter((ad) => !ad.afterMessageId || keptIds.has(ad.afterMessageId));
      // coupe les chaînes displayAfterAdId
      let out = survivors;
      let changed = true;
      while (changed) {
        changed = false;
        const ids = new Set(out.map((a) => a.id));
        const next = out.filter((ad) => !ad.displayAfterAdId || ids.has(ad.displayAfterAdId));
        if (next.length !== out.length) { out = next; changed = true; }
      }
      return out;
    });

    // Pré-remplit l'input avec le message original pour édition.
    setReplyingTo(null);
    requestAnimationFrame(() => {
      inputRef.current?.setValue(rawText);
    });
    qc.invalidateQueries({ queryKey: ["ad-conversation", conversationId] });
    qc.invalidateQueries({ queryKey: ["ad-conversations"] });
    toast.success("Conversation reprise à ce point - modifie ton message et renvoie.");
  }, [conversationId, messages, truncateConversationFn, setMessages, qc]);

  const [generating, setGenerating] = useState(false);
  const [preparingPrompt, setPreparingPrompt] = useState(false);
  const preparingPromptRef = useRef(false);
  // Rédaction > 60 s : message d'attente. Pas de « Réessayer » pendant qu'une
  // rédaction tourne : relancer payait une seconde chaîne et jetait la première.
  const [promptSlow, setPromptSlow] = useState(false);
  const promptRunIdRef = useRef(0);

  // ── Credit gate: read balance and open upgrade dialog if insufficient ──
  const billingFn = useServerFn(getWorkspaceBilling);
  const { data: billingData } = useQuery({
    queryKey: ["workspace-billing"],
    queryFn: () => billingFn(),
    staleTime: 30_000,
  });
  const availableCredits = Math.max(
    0,
    (billingData?.workspace?.credit_balance ?? 0) - (billingData?.workspace?.credit_held ?? 0),
  );
  const hasActivePlan = !!billingData?.workspace?.plan_code;

  /** Returns true if credits are sufficient, else opens upgrade dialog and returns false. */
  const ensureCredits = (estimatedCost: number, kind: "image" | "video" = "video") => {
    if (!hasActivePlan) return true; // no plan yet: don't gate (Stripe not wired)
    if (availableCredits >= estimatedCost) return true;
    promptCreditTopUp(
      `Cette ${kind === "video" ? "vidéo" : "image"} coûte ~${estimatedCost} crédits, il t'en reste ${availableCredits}. Direction la Facturation pour recharger ou passer à un forfait supérieur.`,
    );
    return false;
  };

  // Images produit uploadées via le bouton 📎 du chat.
  // Format : URLs cloud légères, jamais base64 dans l'historique React.
  const [productImages, setProductImages] = useState<string[]>(() => {
    return safePersistableImageUrls(safeInitialState.productImages);
  });
  const productImagesRef = useRef(productImages);
  useEffect(() => { productImagesRef.current = productImages; }, [productImages]);

  const stockActorImageUrls = useMemo(
    () => safePersistableImageUrls(Array.isArray(state.stockActorImageUrls) ? state.stockActorImageUrls : []),
    [state.stockActorImageUrls],
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handlePickFile = useCallback(() => {
    fileInputRef.current?.click();
  }, []);
  const [catalogPickerOpen, setCatalogPickerOpen] = useState(false);
  const [campaignPickerOpen, setCampaignPickerOpen] = useState(false);
  const [continuePickerOpen, setContinuePickerOpen] = useState(false);
  const [creationPickerOpen, setCreationPickerOpen] = useState(false);
  const [catalogPickerTab, setCatalogPickerTab] = useState<"avatars" | "products" | "actors">("actors");

  const handleOpenCatalog = useCallback(() => {
    setCatalogPickerTab("actors");
    setCatalogPickerOpen(true);
  }, []);
  void handleOpenCatalog;

  const handleOpenStockActors = useCallback(() => {
    setCatalogPickerTab("actors");
    setCatalogPickerOpen(true);
  }, []);
  useEffect(() => {
    handleOpenStockActorsRef.current = handleOpenStockActors;
    handleOpenCatalogTabRef.current = (tab) => {
      setCatalogPickerTab(tab);
      setCatalogPickerOpen(true);
    };
  }, [handleOpenStockActors]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  // Aperçu du prompt IA avant validation finale.
  type PromptPreview = {
    mediaType: "video" | "image" | "carousel";
    userLanguagePrompt: string;   // ce que voit l'utilisateur (traduit)
    finalPrompt: string;          // le prompt technique envoyé au modèle
    negativePrompt?: string;      // exclusions (logo, URL, texte à l'écran…)
    prompts: string[];            // pour carrousel
    recommendedStyle?: string;
    recommendedDuration?: number;
    aspectRatio?: string;
    language: "fr" | "en" | "es" | "de" | "it" | "pt" | "ja" | "zh";
    adTitle: string;
    description: string;
    proMultiScene?: boolean;
    proDurationSec?: number;
    videoQuality?: "standard" | "premium";
  };
  // Le prompt rédigé est persisté localement par conversation : si l'utilisateur
  // quitte la page puis revient, on réaffiche exactement le même prompt au lieu
  // d'en régénérer un nouveau.
  const promptCacheKey = `growthity:prompt-preview:${conversationId}`;
  const readCachedPrompt = (): { preview: PromptPreview; editable: string; messageId?: string } | null => {
    if (typeof window === "undefined" || !conversationId) return null;
    try {
      const raw = window.localStorage.getItem(promptCacheKey);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed?.preview) return null;
      return parsed;
    } catch { return null; }
  };
  const [promptPreview, setPromptPreview] = useState<PromptPreview | null>(
    () => readCachedPrompt()?.preview ?? null,
  );
  const [editablePrompt, setEditablePrompt] = useState(() => readCachedPrompt()?.editable ?? "");
  // true = aperçu rédigé pendant cette visite ; false = aperçu restauré (brouillon).
  const previewFreshRef = useRef(false);
  const [doneChains, setDoneChains] = useState<{ title: string; finalAdId: string; prompt: string | null }[]>([]);


  const [generatedAds, setGeneratedAds] = useState<GeneratedAd[]>(() =>
    parseGeneratedAds(initialState.generatedAds),
  );
  useEffect(() => {
    const persistedAds = parseGeneratedAds(initialState.generatedAds);
    if (persistedAds.length === 0) return;
    setGeneratedAds((prev) => {
      const next = persistedAds.reduce((ads, ad) => mergePersistedGeneratedAd(ads, ad), prev);
      return generatedAdListsEqual(prev, next) ? prev : next;
    });
  }, [initialState.generatedAds]);
  useEffect(() => {
    if (!isAtBottomRef.current) return;
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [generatedAds.length]);

  // File d'attente d'écriture : les sauvegardes de cartes générées font un
  // read-modify-write complet de state.generatedAds côté serveur. En parallèle,
  // deux écritures se écrasent l'une l'autre et une carte peut disparaître.
  // On sérialise donc les appels, une seule écriture à la fois.
  const persistQueueRef = useRef<Promise<unknown>>(Promise.resolve());
  const queuePersistAd = useCallback(
    (ad: GeneratedAd) => {
      if (!conversationId) return;
      persistQueueRef.current = persistQueueRef.current
        .catch(() => undefined)
        .then(() => appendGeneratedAdFn({ data: { conversationId, ad } }))
        .then(() => qc.invalidateQueries({ queryKey: ["ad-conversation", conversationId] }))
        .catch(() => undefined);
    },
    [appendGeneratedAdFn, conversationId, qc],
  );

  const upsertGeneratedAdLocal = (ad: GeneratedAd) => {
    let isNew = false;
    setGeneratedAds((prev) => {
      isNew = !prev.some((a) => a.id === ad.id);
      const next = upsertGeneratedAdList(prev, ad);
      return generatedAdListsEqual(prev, next) ? prev : next;
    });
    setState((currentState) => {
      const currentAds = parseGeneratedAds(currentState.generatedAds);
      const nextAds = upsertGeneratedAdList(currentAds, ad);
      if (generatedAdListsEqual(currentAds, nextAds)) return currentState;
      return { ...currentState, generatedAds: nextAds };
    });
    // Persist immediately to the conversation so the new card survives reloads
    // and appears reliably (e.g. after trim/split/crop creates a placeholder ad).
    if (isNew) queuePersistAd(ad);
  };

  // Suite de vidéo lancée par l'IA (outil continue_video) : on insère
  // immédiatement une carte « en cours » dans le fil, avec la barre de
  // progression, comme pour les autres générations.
  useEffect(() => {
    for (const m of messages) {
      for (const p of ((m.parts ?? []) as Array<{ type?: string; output?: Record<string, unknown> }>)) {
        if (p.type !== "tool-continue_video") continue;
        const out = p.output as { ok?: boolean; adId?: string; title?: string } | undefined;
        if (!out?.ok || !out.adId) continue;
        upsertGeneratedAdLocal({
          id: out.adId,
          kind: "video",
          title: out.title || "Suite de la vidéo",
          status: "pending",
          afterMessageId: m.id,
          createdAt: Date.now(),
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);



  // Polling léger pour les vidéos en cours : on met à jour l'aperçu dès que
  // fal.ai renvoie l'URL finale (via la table ads).
  const pendingVideoIds = useMemo(
    () => generatedAds.filter((a) => a.kind === "video" && a.status === "pending").map((a) => a.id),
    [generatedAds],
  );
  const pendingVideoResults = useQuery({
    queryKey: ["chat-pending-video-ads", pendingVideoIds.join(",")],
    enabled: pendingVideoIds.length > 0,
    refetchInterval: 4000,
    // En arrière-plan l'utilisateur ne voit rien : inutile de solliciter le
    // serveur toutes les 2 s (et de re-rendre tout l'écran de chat).
    refetchIntervalInBackground: false,

    queryFn: async () => {
      // Poll fal.ai côté serveur pour que generated_url soit mis à jour dès
      // que la vidéo est prête (sinon la ligne ads reste "pending" tant qu'on
      // n'a pas ouvert /creations).
      try { await refreshPendingAdsFn({}); } catch { /* non bloquant */ }
      const { data, error } = await supabase
        .from("ads")
        .select("id, generated_url, status, processing_status, processing_op, pipeline_stage, error_message, created_at")
        .in("id", pendingVideoIds);
      if (error) throw error;
      // Un ad est "prêt" uniquement si aucun rendu Creatomate n'est en cours
      // ET qu'il possède bien un fichier généré (utile pour les re-rendus type sous-titres).
      const rows = (data ?? []) as Array<{
        id: string;
        generated_url?: string | null;
        status?: string | null;
        processing_status?: string | null;
        processing_op?: string | null;
        pipeline_stage?: string | null;
        error_message?: string | null;
        created_at?: string | null;
      }>;
      const readyRows = rows.filter(
        (r) => !!r.generated_url && r.processing_status !== "processing",
      ) as Array<{ id: string; generated_url: string; created_at?: string | null }>;
      const failedRows = rows.filter((r) => r.status === "failed");
      // Résoudre les paths bucket en URLs signées lisibles dans le chat.
      const bucketPaths = readyRows
        .map((r) => r.generated_url)
        .filter((u) => !/^https?:\/\//i.test(u) && !/^data:/i.test(u));
      const signedByPath = new Map<string, string>();
      if (bucketPaths.length > 0) {
        const { data: signed } = await supabase.storage
          .from("tram-assets")
          .createSignedUrls(bucketPaths, 60 * 60 * 24);
        (signed ?? []).forEach((s, i) => {
          if (s?.signedUrl) signedByPath.set(bucketPaths[i], s.signedUrl);
        });
      }
      const resolveUrl = (u: string) => signedByPath.get(u) ?? u;
      return {
        ready: readyRows.map((row) => ({ id: row.id, url: resolveUrl(row.generated_url), createdAt: row.created_at ?? null })),
        failed: failedRows.map((row) => ({ id: row.id, error: row.error_message ?? null, createdAt: row.created_at ?? null })),
        pending: rows
          .filter((row) => row.status !== "failed" && !readyRows.some((ready) => ready.id === row.id))
          .map((row) => ({
            id: row.id,
            createdAt: row.created_at ?? null,
            processingStatus: row.processing_status ?? null,
            processingOp: row.processing_op ?? null,
            pipelineStage: row.pipeline_stage ?? null,
          })),
      };
    },
  });

  useEffect(() => {
    const result = pendingVideoResults.data;
    if (!result) return;
    setGeneratedAds((prev) => {
      const changedAds: GeneratedAd[] = [];
      const next = prev.map((a) => {
        if (a.kind !== "video" || a.status === "ready" || a.status === "failed") return a;
        const ready = result.ready.find((r) => r.id === a.id);
        if (ready) {
          const readyAd: GeneratedAd = { ...a, url: ready.url, status: "ready", createdAt: a.createdAt ?? ready.createdAt ?? Date.now() };
          changedAds.push(readyAd);
          return readyAd;
        }
        const failed = result.failed.find((r) => r.id === a.id);
        if (failed) {
          const failedAd: GeneratedAd = {
            ...a,
            status: "failed",
            error: failed.error ?? "La génération a échoué.",
            createdAt: a.createdAt ?? failed.createdAt ?? Date.now(),
          };
          changedAds.push(failedAd);
          return failedAd;
        }
        const pending = result.pending.find((r) => r.id === a.id);
        if (pending) {
          return {
            ...a,
            createdAt: a.createdAt ?? pending.createdAt ?? Date.now(),
            processingStatus: pending.processingStatus,
            processingOp: pending.processingOp,
            pipelineStage: pending.pipelineStage,
          };
        }
        return a;
      });
      if (changedAds.length === 0 || generatedAdListsEqual(prev, next)) return prev;
      changedAds.forEach((ad) => queuePersistAd(ad));
      return next;
    });
  }, [queuePersistAd, pendingVideoResults.data]);

  useEffect(() => {
    setState((currentState) => {
      const currentAds = parseGeneratedAds(currentState.generatedAds);
      return generatedAdListsEqual(currentAds, generatedAds) ? currentState : { ...currentState, generatedAds };
    });
  }, [generatedAds]);

  // Quand l'utilisateur lance une incrustation de sous-titres (ou une autre
  // retouche) depuis le chat, on remet l'ad en "pending" pour que le polling
  // ci-dessus détecte le nouveau rendu et rafraîchisse la vidéo dans le chat.
  const markAdReburnStart = useCallback((adId: string, _prevUrl: string) => {
    const now = Date.now();
    let persistAd: GeneratedAd | null = null;
    setGeneratedAds((prev) => {
      const next = prev.map((a) => {
        if (a.id !== adId) return a;
        const updated: GeneratedAd = { ...a, status: "pending" as const, createdAt: now };
        persistAd = updated;
        return updated;
      });
      return generatedAdListsEqual(prev, next) ? prev : next;
    });
    setState((currentState) => {
      const currentAds = parseGeneratedAds(currentState.generatedAds);
      const nextAds = currentAds.map((a) =>
        a.id === adId ? { ...a, status: "pending" as const, createdAt: now } : a,
      );
      if (generatedAdListsEqual(currentAds, nextAds)) return currentState;
      return { ...currentState, generatedAds: nextAds };
    });
    // Persist the pending flip immediately so re-syncs from the conversation
    // query don't override the local pending state with the stale "ready" row.
    if (persistAd) {
      const p: GeneratedAd = persistAd;
      queuePersistAd({
        id: p.id,
        kind: p.kind,
        title: p.title,
        url: p.url ?? null,
        urls: p.urls ?? null,
        status: "pending",
        afterMessageId: p.afterMessageId ?? null,
        displayAfterAdId: p.displayAfterAdId ?? null,
        prompt: p.prompt ?? null,
        createdAt: p.createdAt ?? now,
        processingStatus: p.processingStatus ?? null,
        processingOp: p.processingOp ?? null,
        pipelineStage: p.pipelineStage ?? null,
      });
    }
  }, [queuePersistAd]);




  // ── Phase 1 : préparation du prompt (l'IA rédige un prompt créatif à
  // partir du brief). L'utilisateur pourra ensuite le relire / l'éditer
  // dans une carte d'aperçu avant de lancer réellement la génération.
  const handlePreparePrompt = async () => {
    // (garde anti double-clic : voir preparingPromptRef)
    const description = String(state.description ?? readyBrief?.description ?? "").trim();
    const rawMediaType = String(state.mediaType ?? readyBrief?.mediaType ?? "video").toLowerCase();
    const mediaType: "video" | "image" | "carousel" =
      rawMediaType === "image" || rawMediaType === "carousel" ? rawMediaType : "video";
    const rawLang = String(state.language ?? readyBrief?.language ?? "fr").toLowerCase();
    const langMap: Record<string, "fr" | "en" | "es" | "de" | "it" | "pt" | "ja" | "zh"> = {
      fr: "fr", français: "fr", francais: "fr", french: "fr",
      en: "en", anglais: "en", english: "en",
      es: "es", espagnol: "es", spanish: "es",
      de: "de", allemand: "de", german: "de",
      it: "it", italien: "it", italian: "it",
      pt: "pt", portugais: "pt", portuguese: "pt",
      ja: "ja", japonais: "ja", japanese: "ja",
      zh: "zh", chinois: "zh", chinese: "zh",
    };
    const language = langMap[rawLang] ?? "fr";
    const preferredImageType = String(state.preferredImageType ?? "auto");
    const preferredSlideCount = Number(state.preferredSlideCount ?? 4);
    // Jamais « Nouvelle pub » : titre explicite tiré du brief + format.
    const isGenericTitle = (t: string) => !t || /^(nouvelle pub(licité)?|new ad)$/i.test(t.trim());
    const explicitTitle = [state.adTitle, title].map((t) => String(t ?? "").trim()).find((t) => !isGenericTitle(t)) ?? "";
    const formatSuffix = [
      mediaType === "video" ? (String(state.styleOverride ?? "") === "ugc" ? "UGC" : "Vidéo") : mediaType === "carousel" ? "Carrousel" : "Image",
      String(state.aspectRatio ?? readyBrief?.aspectRatio ?? (mediaType === "video" ? "9:16" : "1:1")),
    ].join(" ");
    const baseTitle = explicitTitle || buildAdTitle(description, mediaType).replace(/^(Vidéo|Visuel|Carrousel|Publicité)\s+[—–-]\s+/, "");
    let adTitle = /\d+:\d+/.test(baseTitle) ? baseTitle : `${baseTitle} – ${formatSuffix}`;
    // Mode "Vidéo Pro multi-scènes" (Seedance 2.5, 10-30 s en un seul rendu).
    const proMultiScene =
      mediaType === "video" &&
      (state.proMultiScene === true || readyBrief?.proMultiScene === true);
    const rawProDuration = Number(state.proDurationSec ?? readyBrief?.proDurationSec ?? NaN);
    const proDurationSec = proMultiScene
      ? Math.min(30, Math.max(10, Number.isFinite(rawProDuration) ? Math.round(rawProDuration) : 30))
      : undefined;
    // Template « Vidéos Produit » : durée et ratio sont imposés par le template.
    const productTemplateSlug =
      typeof state.productTemplateSlug === "string" && state.productTemplateSlug
        ? state.productTemplateSlug
        : undefined;
    const templateDuration = Number(state.productTemplateDurationSec ?? NaN);
    const templateRatio = String(state.productTemplateRatio ?? "");
    // Les durées acceptées ici DOIVENT être celles réellement supportées par
    // les moteurs (source unique : generation-routing). Une liste figée faisait
    // tomber une durée choisie (ex : 15 s) et laissait l'IA en réinventer une.
    // 16 et 24 s = vidéos longues par segments enchaînés (moteur standard).
    const ALLOWED_DURATIONS = [...getSupportedVideoDurations(), 16, 24];
    const rawDuration = Number(
      (productTemplateSlug && Number.isFinite(templateDuration) ? templateDuration : undefined) ??
        state.videoDurationSec ??
        readyBrief?.videoDurationSec ??
        NaN,
    );
    const preferredDurationSec =
      Number.isFinite(rawDuration) && ALLOWED_DURATIONS.includes(Math.round(rawDuration))
        ? Math.round(rawDuration)
        : undefined;
    const ALLOWED_RATIOS = ["9:16", "1:1", "16:9", "4:5"] as const;
    const rawRatio = String(
      (productTemplateSlug && templateRatio ? templateRatio : "") ||
        (state.aspectRatio ?? readyBrief?.aspectRatio ?? ""),
    );
    const ratioCandidate = (ALLOWED_RATIOS as readonly string[]).includes(rawRatio) ? rawRatio : undefined;
    const preferredAspectRatio = productTemplateSlug && templateRatio
      ? ratioCandidate
      : resolveVideoAspectRatio(
          ratioCandidate,
          mediaType,
          (messages as unknown as Array<{ role: string; parts?: Array<{ type?: string; text?: string }> }>)
            .filter((m) => m.role === "user")
            .map((m) => (m.parts ?? []).map((p) => (p.type === "text" ? p.text ?? "" : "")).join("\n")),
        );
    // Titre toujours tiré du brief COURANT (sujet + format + durée + ratio) :
    // l'ancien titre de conversation (« Image Instagram… ») ne doit jamais
    // nommer une vidéo. Seul un titre donné explicitement par le brief est gardé.
    {
      const briefTitle = buildBriefTitle({
        description,
        productName: typeof state.productName === "string" ? state.productName : null,
        mediaType,
        style: String(state.styleOverride ?? readyBrief?.styleOverride ?? ""),
        durationSec: mediaType === "video" ? (proDurationSec ?? preferredDurationSec ?? 8) : null,
        aspectRatio: preferredAspectRatio ?? (mediaType === "video" ? "9:16" : "1:1"),
      });
      const stateTitle = String(state.adTitle ?? "").trim();
      const kindMismatch = (t: string) =>
        mediaType === "video" ? /^(image|visuel|carrousel)\b/i.test(t) : /^(vid[ée]o|ugc)\b/i.test(t);
      adTitle = stateTitle && !isGenericTitle(stateTitle) && !kindMismatch(stateTitle)
        ? (/\d+:\d+/.test(stateTitle) ? stateTitle : `${stateTitle} – ${formatSuffix}`)
        : briefTitle;
      if (conversationId && title && title !== briefTitle && kindMismatch(title)) {
        void renameConvTitleFn({ data: { id: conversationId, title: briefTitle } }).catch(() => {});
      }
    }


    if (description.length < 3) {
      toast.error("Décris d'abord la publicité (au moins 3 caractères).");
      return;
    }

    // Si l'utilisateur a fourni un prompt exact via le chat (verbatimPrompt),
    // on l'utilise tel quel et on saute la reformulation IA.
    const verbatim = String(readyBrief?.verbatimPrompt ?? "").trim();
    if (verbatim.length > 0) {
      const preview: PromptPreview = {
        mediaType,
        userLanguagePrompt: verbatim,
        finalPrompt: verbatim,
        prompts: [verbatim],
        recommendedStyle: undefined,
        recommendedDuration: proDurationSec ?? preferredDurationSec ?? 8,
        aspectRatio: preferredAspectRatio ?? "9:16",
        language,
        adTitle,
        description,
        proMultiScene,
        proDurationSec,
        videoQuality: "standard",
      };
      previewFreshRef.current = true;
      setPromptPreview(preview);
      setEditablePrompt(verbatim);
      toast.success("Ton prompt est prêt tel quel - clique sur *Valider* pour générer ✨");
      return;
    }


    if (preparingPromptRef.current) return;
    preparingPromptRef.current = true;
    setPreparingPrompt(true);
    setPromptSlow(false);
    const runId = ++promptRunIdRef.current;
    const slowTimer = setTimeout(() => {
      if (promptRunIdRef.current === runId) setPromptSlow(true);
    }, 60_000);
    const loadingToast = toast.loading("Rédaction du prompt créatif…");
    const actorImageSet = new Set(stockActorImageUrls);
    // Si l'URL de l'acteur a disparu de productImages entre-temps (re-scrape,
    // retrait manuel…), on retombe sur stockActorImageUrls pour ne jamais
    // perdre la photo de référence de l'acteur choisi.
    const promptActorImages = (proMultiScene ? [] : (
      stockActorImageUrls.filter((url) => productImages.includes(url)).length > 0
        ? stockActorImageUrls.filter((url) => productImages.includes(url))
        : stockActorImageUrls
    )).slice(0, 2);
    const promptProductImages = productImages.filter((url) => !actorImageSet.has(url)).slice(0, 6 - promptActorImages.length);
    const promptSourceImages = [...promptProductImages, ...promptActorImages];
    // Mémoire acteur : si un acteur UGC a été choisi, on le rappelle
    // explicitement à l'IA à CHAQUE (re)génération de prompt — sinon, dès que
    // l'utilisateur demande une modification, le nouveau prompt décrit un
    // personnage différent et l'acteur sélectionné est « oublié ».
    const chosenActorName = typeof state.stockActorName === "string" ? state.stockActorName : "";
    const hasChosenActor = promptActorImages.length > 0 || typeof state.stockActorId === "string";
    const descriptionForPrompt =
      mediaType === "video" && hasChosenActor
        ? `${description}\n\nACTEUR FACE CAMÉRA IMPOSÉ : ${chosenActorName ? `"${chosenActorName}" ` : ""}(acteur UGC choisi par l'utilisateur, photo de référence jointe). Le personnage principal de la vidéo DOIT être cet acteur, avec le même visage que la photo jointe. Ne le remplace jamais par un autre personnage, même si l'utilisateur demande des modifications du prompt : celles-ci portent sur le décor, le script ou le style, pas sur l'acteur.\nRÔLE ADAPTÉ À L'ACTEUR : garde le mécanisme de la stratégie/référence (face caméra, explication, preuve), mais donne à cet acteur un rôle naturel pour son profil (genre, âge, style), par exemple un(e) propriétaire satisfait(e) ou un(e) conseiller(ère) chez lui/elle. Jamais de déguisement ni de métier qui ne lui ressemble pas (pas de « tenue de technicienne dans un atelier »).`
        : description;
    const promptRefTags = mediaType === "video" && promptSourceImages.length > 0
      ? seedanceTagsBySourceOrder({
          totalImages: promptSourceImages.length,
          productCount: promptProductImages.length,
          avatarCount: promptActorImages.length,
        })
      : [];
    // Textes annoncés dans le résumé du chat (« texte "…" », prix "29€", CTA "…").
    const announcedImageText: string[] = (() => {
      if (mediaType === "video") return [];
      const readyMsg = readyBriefInfo ? messages[readyBriefInfo.messageIndex] : undefined;
      // Tous les messages assistant récents : l'annonce peut précéder le message « prêt ».
      const recentAssistant = messages.slice(-6).filter((m) => m.role === "assistant").map((m) => messageRawText(m));
      const src = [description, ...recentAssistant, readyMsg ? messageRawText(readyMsg) : ""].join("\n");
      return extractAnnouncedImageText(src);
    })();
    const userAskedOnImageText = mediaType !== "video" && userWantsOnImageText(
      [description, ...messages.slice(-12).filter((m) => m.role === "user").map((m) => messageRawText(m))].join("\n"),
    );
    // Références Meta : celles choisies par le client, sinon les 3 meilleures
    // pubs pertinentes de la dernière veille (actives, diffusées le plus longtemps).
    // Références CHOISIES : barre en cours, sinon le dernier marqueur envoyé dans
    // un message du client (la barre est vidée à l'envoi). Elles priment toujours :
    // les gagnants automatiques ne servent que si le client n'a rien choisi.
    const selectedRefs: CompetitorRef[] = (() => {
      if (competitorRefsRef.current.length) return competitorRefsRef.current.slice(0, 3);
      for (let i = messages.length - 1; i >= 0; i--) {
        if (messages[i]?.role !== "user") continue;
        const found = parseCompetitorRefs(messageRawText(messages[i]!));
        if (found?.length) return found.slice(-3);
      }
      return [];
    })();
    const refsForPrompt: CompetitorRef[] = (() => {
      if (selectedRefs.length) return selectedRefs;
      for (let i = messages.length - 1; i >= 0; i--) {
        for (const part of (messages[i]?.parts ?? []) as Array<Record<string, unknown>>) {
          if (part.type !== "tool-research_competitor_ads") continue;
          const o = (part.output ?? {}) as { ads?: Array<Record<string, unknown>>; query?: string; queries?: string[] };
          if (!Array.isArray(o.ads) || !o.ads.length) continue;
          return pickProbableWinners(
            o.ads.map((ad, j) => ({ ...toCompetitorRef(ad, `auto-${j}`), signal: typeof ad.signal === "string" ? ad.signal : undefined })),
            3,
            o.queries?.length ? o.queries.join(" ") : o.query ?? "",
          );
        }
      }
      return [];
    })();
    const userAskedVideoText = mediaType === "video" && userWantsVideoOnScreenText(
      messages.slice(-12).filter((m) => m.role === "user").map((m) => messageRawText(m)),
    );
    // Texte parlé imposé par le client depuis la dernière génération : mot pour mot.
    const exactSpokenScripts = (() => {
      if (mediaType !== "video" || proMultiScene) return undefined;
      let start = 0;
      messages.forEach((m, i) => { if (String(m.id).startsWith("generation-")) start = i + 1; });
      const texts = messages.slice(start).filter((m) => m.role === "user").map((m) => messageRawText(m));
      return userExactSpokenScripts(texts, segmentsForDuration(preferredDurationSec ?? null)) ?? undefined;
    })();
    const suggestPayload = {
      exactSpokenScripts,
      competitorRefs: refsForPrompt.length && !productTemplateSlug ? (refsForPrompt as unknown as Record<string, unknown>[]) : undefined,
      refsSelected: selectedRefs.length > 0 || undefined,
      description: descriptionForPrompt,
      mediaType,
      imageUrls: promptSourceImages,
      language,
      preferredImageType: preferredImageType !== "auto" ? preferredImageType.slice(0, 200) : undefined,
      preferredSlideCount: mediaType === "carousel" ? preferredSlideCount : undefined,
      preferredDurationSec: mediaType === "video" && !proMultiScene ? preferredDurationSec : undefined,
      proMultiScene: proMultiScene || undefined,
      proDurationSec,
      inspiration: null,
      creativeContext: buildCreativeContext(
        state as Record<string, unknown>,
        messages as unknown as Array<{ role: string; parts?: Array<Record<string, unknown>> }>,
      ),
      refTags: promptRefTags,
      // Le prompt doit décrire EXACTEMENT ce que le chat a annoncé : texte,
      // prix et CTA annoncés pour une image → on les impose ; ratio verrouillé.
      // Vidéo : aucun texte à l'écran par défaut, même inspiré de pubs gagnantes ;
      // seulement si le client le demande explicitement.
      noOnScreenText: mediaType === "video" ? !userAskedVideoText : announcedImageText.length === 0 && !userAskedOnImageText,
      announcedOnImageText: mediaType === "video" ? undefined : announcedImageText.length ? announcedImageText : undefined,
      requireOnImageText: mediaType !== "video" && (userAskedOnImageText || announcedImageText.length > 0),
      preferredAspectRatio: preferredAspectRatio ?? undefined,
      productTemplateSlug,

    };

    // Garde-fou : si la requête ne répond jamais (réseau coupé, worker bloqué),
    // on abandonne au bout de 4 min (rédaction + contrôle qualité ≈ 100 s) au lieu de laisser un chargement éternel.
    const withTimeout = async <T,>(p: Promise<T>): Promise<T> => {
      let timer: ReturnType<typeof setTimeout> | undefined;
      try {
        return await Promise.race([
          p,
          new Promise<never>((_, reject) => {
            timer = setTimeout(
              () => reject(new Error("La rédaction du prompt a pris trop de temps. Réessaie.")),
              360_000,
            );
          }),
        ]);
      } finally {
        if (timer) clearTimeout(timer);
      }
    };

    try {
      let res: Awaited<ReturnType<typeof suggestFn>>;
      try {
        res = await withTimeout(suggestFn({ data: suggestPayload }));
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (/failed to fetch|networkerror|load failed/i.test(msg)) {
          toast.loading("Reprise de la connexion…", { id: loadingToast });
          await new Promise((r) => setTimeout(r, 800));
          res = await withTimeout(suggestFn({ data: suggestPayload }));
        } else {
          throw e;
        }
      }
      if (!res) throw new Error("Réponse IA vide.");

      const userText =
        (res as { userLanguagePrompt?: string }).userLanguagePrompt?.trim() ||
        res.finalPrompt ||
        res.prompts?.[0] ||
        description;

      const preview: PromptPreview = {
        mediaType,
        userLanguagePrompt: userText,
        finalPrompt: res.finalPrompt || res.prompts?.[0] || description,
        negativePrompt: (res as { negativePrompt?: string }).negativePrompt ?? "",
        prompts: res.prompts ?? [],
        recommendedStyle: res.recommendedStyle,
        recommendedDuration: proDurationSec ?? preferredDurationSec ?? res.recommendedDuration ?? 8,
        aspectRatio: preferredAspectRatio ?? res.aspectRatio ?? "9:16",
        language,
        adTitle,
        description,
        proMultiScene,
        proDurationSec,
        videoQuality: "standard",
      };
      // Une tentative plus récente (« Réessayer ») a pris le relais : on ignore.
      if (promptRunIdRef.current !== runId) { toast.dismiss(loadingToast); return; }
      previewFreshRef.current = true;
      setPromptPreview(preview);
      setEditablePrompt(userText);
      toast.success("Prompt prêt - relis-le puis valide pour lancer la génération ✨", { id: loadingToast });
      const bpWarn = (res as { blueprintWarning?: string | null }).blueprintWarning;
      if (bpWarn) toast.warning(bpWarn, { duration: 10_000 });
    } catch (err) {
      toast.dismiss(loadingToast);
      if (promptRunIdRef.current !== runId) return;
      // Manque de crédits = cas métier attendu : pas de log d'erreur, on redirige.
      if (handleInsufficientCredits(err)) return;
      console.error("[chat] handlePreparePrompt error", err);
      toast.error(toUserMessage(err, "Échec de préparation du prompt"), { id: loadingToast });
    } finally {
      clearTimeout(slowTimer);
      if (promptRunIdRef.current === runId) {
        preparingPromptRef.current = false;
        setPreparingPrompt(false);
        setPromptSlow(false);
      }
    }
  };

  // ── Phase 2 : l'utilisateur a validé le prompt (éventuellement modifié).
  // On lance la vraie génération du média.
  // Le serveur n'accepte qu'un UUID d'acteur (table stock_actors). Un id non-UUID
  // (acteur de la galerie statique, ancien état persisté) faisait échouer la
  // validation côté serveur et cassait "Générer tel quel".
  const safeStockActorId = (v: unknown): string | undefined =>
    typeof v === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v)
      ? v
      : undefined;

  const runGenerationFromPreview = async (edited: string, previewOverride?: PromptPreview) => {
    const p = previewOverride ?? promptPreview;
    if (!p) return;
    const editedPrompt = edited.trim();
    const userPreview = (p.userLanguagePrompt ?? "").trim();
    const hasUserEdits = editedPrompt.length > 0 && editedPrompt !== userPreview;
    // Important: when the user did NOT edit the preview, submit the technical
    // finalPrompt produced by the AI. The preview text is a French-readable
    // recap and lacks the engine/audio guardrails required by Veo/Kling.
    const promptToSubmit = hasUserEdits ? editedPrompt : (p.finalPrompt || p.description).trim();
    const finalPrompt = (promptToSubmit || p.description).slice(0, p.proMultiScene ? 7800 : 2000);
    const displayPrompt = (hasUserEdits ? editedPrompt : (p.userLanguagePrompt || p.finalPrompt || p.description)).slice(0, 4000);

    // Credit gate - opens upgrade dialog if balance too low
    const kind: "image" | "video" = p.mediaType === "image" ? "image" : "video";
    const estimated = kind === "image" ? 15 : (estimateVideoCredits({
      style: String(state.styleOverride || p.recommendedStyle || "ugc"),
      hasActor: typeof state.stockActorId === "string",
      durationSec: p.recommendedDuration ?? 8,
      proSeconds: p.proMultiScene ? p.proDurationSec : undefined,
      quality: p.videoQuality ?? "standard",
    }) ?? 300);
    if (!ensureCredits(estimated, kind)) return;

    setGenerating(true);
    const loadingToast = toast.loading("Génération du média en cours…");
    let anchorMessageId = messages[messages.length - 1]?.id ?? null;

    try {
      const actorImageSet = new Set(stockActorImageUrls);
      // Acteur choisi = SEULE référence de visage : une seule photo, la sienne.
      const actorSourceImagesForGeneration = p.proMultiScene ? [] : stockActorImageUrls.slice(-1);
      const productSourceImagesForGeneration = productImages
        .filter((url) => !actorImageSet.has(url))
        // Jamais la photo d'un autre acteur de la galerie (génération précédente).
        .filter((url) => !STOCK_ACTOR_IMAGE_RE.test(url))
        .filter(() => state.hasProductImage !== "no")
        .slice(0, 6 - actorSourceImagesForGeneration.length);
      const sourceImagesForGeneration = [...productSourceImagesForGeneration, ...actorSourceImagesForGeneration];
      const identityLock = sourceImagesForGeneration.length > 0
        ? {
            ...(productSourceImagesForGeneration.length > 0
              ? {
                  product: {
                    name: p.adTitle || "Produit",
                    description: p.description,
                    imageCount: productSourceImagesForGeneration.length,
                  },
                }
              : {}),
            ...(actorSourceImagesForGeneration.length > 0
              ? {
                  avatar: {
                    name: String(state.stockActorName ?? "Acteur UGC"),
                    description: p.language === "fr"
                      ? "Acteur UGC face caméra. Locuteur natif de France métropolitaine, accent français standard de Paris/Île-de-France, absolument pas canadien/québécois."
                      : "UGC actor speaking naturally on camera.",
                    imageCount: actorSourceImagesForGeneration.length,
                  },
                }
              : {}),
          }
        : undefined;
      const productImageRoles = sourceImagesForGeneration.map((_, index) =>
        index < productSourceImagesForGeneration.length ? "product" as const : "avatar" as const,
      );

      // ── Reference-to-image : si une image a déjà été générée dans cette
      // conversation et que la demande est une retouche/ajout ("ajoute ce logo",
      // "mets cette image sur la canette", "change le fond"…), on repart de
      // cette image comme base (previousImage) au lieu de générer de zéro.
      // Les images uploadées restent transmises comme références visuelles.
      const lastImageAd = [...generatedAds]
        .reverse()
        .find((a) => a.kind === "image" && a.status === "ready" && typeof a.url === "string" && a.url);
      const editIntentRe =
        /(ajoute|rajoute|ajouter|mets|met[s]?\b|met[tr]|place|colle|incruste|int[ée]gre|superpose|change|remplace|retouche|modifie|enl[èe]ve|supprime|corrige|garde)|cette image|ce visuel|l['’]image (pr[ée]c[ée]dente|d['’]avant|ci-dessus|g[ée]n[ée]r[ée]e)|dessus/i;
      const intentSource = `${displayPrompt} ${p.userLanguagePrompt ?? ""} ${p.description ?? ""}`;
      const referenceBaseImage =
        p.mediaType === "image" && lastImageAd?.url && editIntentRe.test(intentSource)
          ? lastImageAd.url
          : undefined;


      // ── Continuité vidéo : quand l'utilisateur demande la même actrice /
      // le même décor que la vidéo précédente, une phrase de rappel n'a aucun
      // effet sur le moteur. On extrait une image de la dernière vidéo et on
      // la joint comme référence visuelle : c'est ça qui verrouille le visage,
      // la tenue et le décor.
      if (p.mediaType === "video" && !p.proMultiScene && sourceImagesForGeneration.length < 6 && typeof state.stockActorId !== "string") {
        const lastVideoAd = [...generatedAds]
          .reverse()
          .find((a) => a.kind === "video" && a.status === "ready" && typeof a.url === "string" && a.url);
        if (lastVideoAd?.url && wantsVideoContinuity(intentSource)) {
          const frame = await extractVideoFrameDataUrl(lastVideoAd.url).catch(() => undefined);
          if (frame) {
            sourceImagesForGeneration.push(frame);
            productImageRoles.push("avatar");
          }
        }
      }


      // Texte exact trop long : on demande AVANT d'annoncer « Génération lancée ».
      if (p.mediaType === "video" && !p.proMultiScene) {
        const preSec = Number(p.recommendedDuration ?? state.videoDurationSec ?? readyBrief?.videoDurationSec ?? NaN);
        const preCount = segmentsForDuration(Number.isFinite(preSec) ? preSec : null);
        if (preCount >= 2) {
          let start = 0;
          messages.forEach((m, i) => { if (String(m.id).startsWith("generation-")) start = i + 1; });
          const preScripts = userExactSpokenScripts(
            messages.slice(start).filter((m) => m.role === "user").map((m) => messageRawText(m)),
            preCount,
          );
          if (preScripts) {
            const maxPerSegment = spokenWordRange(8).max;
            const tooLong = preScripts.map((s, i) => ({ i, w: countSpokenWords(s) })).filter((x) => x.w > maxPerSegment);
            if (tooLong.length && !window.confirm(
              `Ton texte est utilisé mot pour mot, mais ${tooLong.map((x) => `le segment ${x.i + 1} fait ${x.w} mots`).join(" et ")} : en 8 secondes, on peut dire environ ${maxPerSegment} mots. La fin risque d'être coupée ou dite trop vite.\n\nLancer quand même avec ton texte exact ?`,
            )) {
              toast.dismiss(loadingToast);
              return;
            }
          }
        }
      }

      try {
        const anchor = await appendGenerationAnchorFn({
          data: { conversationId, kind: p.mediaType, title: p.adTitle },
        });
        const anchorMessage = (anchor as { message?: UIMessage; messageId?: string }).message;
        if (anchorMessage) {
          anchorMessageId = anchorMessage.id;
          setMessages((currentMessages) =>
            currentMessages.some((message) => message.id === anchorMessage.id)
              ? currentMessages
              : [...currentMessages, anchorMessage],
          );
        } else if ((anchor as { messageId?: string }).messageId) {
          anchorMessageId = (anchor as { messageId: string }).messageId;
        }
      } catch {
        // Si l'ancre visuelle ne peut pas être ajoutée, on garde le dernier message
        // connu pour ne jamais bloquer la génération.
      }

      if (p.mediaType === "video") {
        const VALID_STYLES: VideoStyle[] = ["motion_design", "ugc", "cinematic", "image_animation"];
        const styleOverride = String(state.styleOverride ?? "");
        const rawStyle = (styleOverride || p.recommendedStyle || "ugc") as string;
        const normalizedStyle: VideoStyle = (VALID_STYLES as string[]).includes(rawStyle) ? (rawStyle as VideoStyle) : "ugc";
        const styleDef = VIDEO_CATALOG[normalizedStyle] ?? VIDEO_CATALOG.ugc;
        // Dès qu'une image produit est fournie, on force image_animation
        // pour que la vidéo utilise réellement le visuel (comportement du wizard d'origine).
        const hasImage = sourceImagesForGeneration.length > 0;
        const hasStockActor = actorSourceImagesForGeneration.length > 0 || typeof state.stockActorId === "string";
        const safeStyle: VideoStyle = hasStockActor
          ? "ugc"
          : hasImage
            ? "image_animation"
            : (styleDef.requiresImage ? "ugc" : normalizedStyle);
        const tierMap: Record<number, Tier> = { 4: "eco", 8: "balanced", 12: "premium", 16: "pro", 20: "max" };
        const tier: Tier = p.proMultiScene ? "max" : (tierMap[p.recommendedDuration ?? 8] ?? "balanced");
        const finalAspect = (p.aspectRatio || "9:16") as "9:16" | "1:1" | "16:9";
        // Extract the spoken script so the server can trigger the FR dubbed
        // pipeline (ElevenLabs TTS → OmniHuman lipsync).
        const extractScript = (src: string): string => {
          const s = src ?? "";
          // 1) "🎙️ TEXTE PARLÉ" section (userLanguagePrompt shape)
          const m = s.match(/TEXTE\s*PARL[ÉE][^\n]*\n([\s\S]*?)(?:\n\s*(?:🎬|📱|DÉCOR|TEXTE À L)|$)/i);
          const block = m ? m[1] : "";
          const quoted = Array.from(block.matchAll(/[«"“]([^»"”]{2,})[»"”]/g)).map((x) => x[1].trim());
          if (quoted.length) return quoted.join(" ").slice(0, 1000);
          // 2) Fallback: "Dialogue:" block in finalPrompt
          const d = s.match(/Dialogue\s*:\s*([\s\S]*)$/i);
          if (d) {
            const lines = d[1].split(/\n+/).map((l) => l.replace(/^[^:]+:\s*/, "").trim()).filter(Boolean);
            if (lines.length) return lines.join(" ").slice(0, 1000);
          }
          // 3) Fallback: inline "speaks in <lang>: \"...\"" (Seedance-style prompts)
          const inline = Array.from(
            s.matchAll(/speak(?:s|ing)?\s+in\s+[A-Za-zÀ-ÿ-]+[^:"«]{0,80}:\s*[«"“]([^»"”]{2,})[»"”]/gi),
          ).map((x) => x[1].trim());
          if (inline.length) return inline.join(" ").slice(0, 1000);
          // 4) Last-resort: any quoted segment >= 12 chars anywhere in the prompt
          const anyQuoted = Array.from(s.matchAll(/[«"“]([^»"”]{12,})[»"”]/g)).map((x) => x[1].trim());
          if (anyQuoted.length) return anyQuoted.slice(0, 6).join(" ").slice(0, 1000);
          return "";
        };
        const spokenScript = extractScript(displayPrompt) || extractScript(finalPrompt);

        const chosenLongSec = !p.proMultiScene
          ? Number(p.recommendedDuration ?? state.videoDurationSec ?? readyBrief?.videoDurationSec ?? NaN)
          : NaN;
        const chainCount = segmentsForDuration(Number.isFinite(chosenLongSec) ? chosenLongSec : null);
        if (chainCount >= 2) {
          // Vidéo longue : segments de 8 s enchaînés (moteur standard, une voix).
          // Texte parlé fourni par le client (après la dernière génération) : MOT POUR MOT.
          const userTextsSinceLastGeneration = (() => {
            let start = 0;
            messages.forEach((m, i) => { if (String(m.id).startsWith("generation-")) start = i + 1; });
            return messages.slice(start).filter((m) => m.role === "user").map((m) => messageRawText(m));
          })();
          const exactScripts = userExactSpokenScripts(userTextsSinceLastGeneration, chainCount);
          const chainDisplayPrompt = exactScripts ? injectExactSpokenScripts(displayPrompt, exactScripts) : displayPrompt;
          const autoSegmentScripts = extractSegmentScripts(displayPrompt);
          setChainActive(true);
          const { total } = await startChainFn({
            data: {
              conversationId,
              title: p.adTitle,
              segments: chainCount,
              messageId: anchorMessageId,
              script: exactScripts ? exactScripts.join(" ") : spokenScript,
              segmentScripts: exactScripts ?? (autoSegmentScripts.length === chainCount ? autoSegmentScripts : undefined),
              basePayload: {
                style: safeStyle,
                tier,
                prompt: finalPrompt,
                negativePrompt: (p.negativePrompt ?? "").slice(0, 1000) || undefined,
                aspectRatio: finalAspect,
                language: p.language,
                imageUrl: sourceImagesForGeneration[0],
                extraSourceImages: sourceImagesForGeneration.slice(1),
                campaignId: null,
                subtitles: false,
                originalBrief: p.description.slice(0, 6000),
                identityLock,
                stockActorId: safeStockActorId(state.stockActorId),
                // Aucun texte à l'écran sauf demande explicite du client (répliques citées exclues).
                allowText: userWantsVideoOnScreenText(messages.filter((m) => m.role === "user").map((m) => messageRawText(m))),
                displayPrompt: chainDisplayPrompt.slice(0, 8000),
              },
            },
          });
          // Le prompt passe dans le bloc de suivi (verrouillé), puis dans la carte vidéo finale.
          setPromptPreview(null);
          setEditablePrompt("");
          setChainVersion((v) => v + 1);
          toast.success(`Vidéo de ${chainCount * 8} s lancée en ${chainCount} segments (⚡${total} max, seuls les segments réussis sont débités).`, { id: loadingToast });
          return;
        }
        const submitResult = await submitVideoFn({
          data: {
            style: safeStyle,
            quality: p.videoQuality ?? "standard",
            tier,
            modelOverride: undefined,
            prompt: finalPrompt,
            negativePrompt: (p.negativePrompt ?? "").slice(0, 1000) || undefined,
            aspectRatio: finalAspect,
            language: p.language,
            imageUrl: sourceImagesForGeneration[0],
            extraSourceImages: sourceImagesForGeneration.slice(1),
            title: p.adTitle,
            campaignId: null,
            subtitles: false,
            script: spokenScript || undefined,
            originalBrief: p.description.slice(0, 6000),
            identityLock,
            stockActorId: safeStockActorId(state.stockActorId),
            proMultiScene: p.proMultiScene || undefined,
            proDurationSec: p.proMultiScene ? (p.proDurationSec ?? 30) : undefined,
            lockedDurationSec: (() => {
              if (p.proMultiScene) return undefined;
              // La durée affichée dans le brief/prompt validé est la source de
              // vérité au clic sur Générer. `state` peut avoir un rendu React de
              // retard après ready_to_generate ; dans ce cas l'ancien code
              // omettait le verrou et le moteur retombait sur 8 secondes.
              const chosen = Number(
                p.recommendedDuration ??
                  state.videoDurationSec ??
                  readyBrief?.videoDurationSec ??
                  NaN,
              );
              return Number.isFinite(chosen) && chosen >= 3 && chosen <= 30
                ? Math.round(chosen)
                : undefined;
            })(),
          },
        });
        const videoAdId = (submitResult as { adId?: string })?.adId;
        if (videoAdId) {
          const ad: GeneratedAd = {
            id: videoAdId,
            kind: "video",
            title: p.adTitle,
            status: "pending",
            afterMessageId: anchorMessageId,
            createdAt: Date.now(),
            prompt: displayPrompt,
          };
          upsertGeneratedAdLocal(ad);
          await appendGeneratedAdFn({ data: { conversationId, ad } });
        }
        toast.success("Vidéo en cours - elle apparaîtra ici. Tu pourras ensuite ajouter les sous-titres.", { id: loadingToast });

      } else if (p.mediaType === "image") {
        const { imageUrl } = await genImageFn({
          data: {
            prompt: finalPrompt,
            ...(referenceBaseImage ? { previousImage: referenceBaseImage } : {}),
            sourceImages: sourceImagesForGeneration,
            identityLock,
            imageRoles: productImageRoles,
          },
        });
        const row = await saveAdFn({
          data: {
            campaign_id: null,
            title: p.adTitle,
            prompt: finalPrompt.slice(0, 4000),
            originalBrief: p.description.slice(0, 6000),
            content_type: "image",
            generated_url: imageUrl,
            sourceImages: sourceImagesForGeneration,
            stockActorId: safeStockActorId(state.stockActorId),
          },
        });
        const ad: GeneratedAd = {
          id: (row as { id: string }).id,
          kind: "image",
          title: p.adTitle,
          url: imageUrl,
          status: "ready",
          afterMessageId: anchorMessageId,
          createdAt: Date.now(),
          prompt: displayPrompt,
        };

        upsertGeneratedAdLocal(ad);
        await appendGeneratedAdFn({ data: { conversationId, ad } });
        toast.success("Image créée ✨", { id: loadingToast });
      } else {
        // Carrousel - on garde les prompts par slide de l'IA, en remplaçant
        // le premier par la version éditée par l'utilisateur si présente.
        const prompts = (p.prompts.length ? p.prompts : [finalPrompt]).map((pp) => pp.slice(0, 2000));
        if (edited.trim() && prompts[0]) prompts[0] = edited.trim().slice(0, 2000);
        if (prompts.length < 2) throw new Error("Le carrousel doit avoir au moins 2 slides.");
        const urls: string[] = [];
        for (let i = 0; i < prompts.length; i++) {
          toast.loading(`Slide ${i + 1}/${prompts.length} en cours…`, { id: loadingToast });
          const { imageUrl } = await genImageFn({
            data: {
              prompt: prompts[i],
              sourceImages: sourceImagesForGeneration,
              identityLock,
              imageRoles: productImageRoles,
            },
          });
          urls.push(imageUrl);
        }
        const row = await saveAdFn({
          data: {
            campaign_id: null,
            title: p.adTitle,
            prompt: prompts.join("\n---\n").slice(0, 4000),
            originalBrief: p.description.slice(0, 6000),
            content_type: "carousel",
            generated_urls: urls,
            sourceImages: sourceImagesForGeneration,
            stockActorId: safeStockActorId(state.stockActorId),
          },
        });
        const ad: GeneratedAd = {
          id: (row as { id: string }).id,
          kind: "carousel",
          title: p.adTitle,
          urls,
          status: "ready",
          afterMessageId: anchorMessageId,
          createdAt: Date.now(),
          prompt: displayPrompt,
        };

        upsertGeneratedAdLocal(ad);
        await appendGeneratedAdFn({ data: { conversationId, ad } });
        toast.success("Carrousel créé ✨", { id: loadingToast });
      }

      qc.invalidateQueries({ queryKey: ["ads"] });
      qc.invalidateQueries({ queryKey: ["campaigns"] });
      qc.invalidateQueries({ queryKey: ["ad-conversation", conversationId] });
      setPromptPreview(null);
      setEditablePrompt("");
    } catch (err) {
      toast.dismiss(loadingToast);
      // Manque de crédits = cas métier attendu : pas de log d'erreur, on redirige.
      if (handleInsufficientCredits(err)) return;
      console.error("[chat] runGenerationFromPreview error", err);
      toast.error(toUserMessage(err, "Échec de génération"), { id: loadingToast });
    } finally {
      setGenerating(false);
    }
  };

  // ── "Refais avec exactement le même prompt" : aucune validation, aucune
  // reformulation. On relit le prompt technique réellement envoyé au moteur
  // lors de la dernière génération et on relance directement.
  const autoRegenHandledRef = useRef<string | null>(null);
  useEffect(() => {
    if (!readyBrief || readyBrief.sameAsLastPrompt !== true) return;
    const key = readyBriefInfo?.messageId ?? null;
    if (!key || autoRegenHandledRef.current === key) return;
    if (generating || preparingPrompt) return;
    autoRegenHandledRef.current = key;

    void (async () => {
      const lastAd = [...generatedAds]
        .reverse()
        .find((a) => (a.kind === "video" || a.kind === "image") && (a.status === "ready" || a.status === "pending"));
      if (!lastAd) {
        toast.error("Aucune génération précédente à relancer.");
        return;
      }
      let enginePrompt = "";
      try {
        const { data: row } = await supabase
          .from("ads")
          .select("prompt, content_type, title")
          .eq("id", lastAd.id)
          .maybeSingle();
        enginePrompt = String((row as { prompt?: string } | null)?.prompt ?? "").trim();
      } catch {
        // fallback ci-dessous
      }
      const displayed = String(lastAd.prompt ?? "").trim();
      const finalPrompt = enginePrompt || displayed;
      if (!finalPrompt) {
        toast.error("Impossible de retrouver le prompt de la génération précédente.");
        return;
      }
      const mediaType: "video" | "image" | "carousel" = lastAd.kind === "image" ? "image" : "video";
      const preview: PromptPreview = {
        mediaType,
        userLanguagePrompt: displayed || finalPrompt,
        finalPrompt,
        prompts: [finalPrompt],
        recommendedStyle: undefined,
        recommendedDuration: Number(state.videoDurationSec ?? readyBrief?.videoDurationSec ?? 8),
        aspectRatio: String(state.aspectRatio ?? readyBrief?.aspectRatio ?? "9:16"),
        language: "fr",
        adTitle: lastAd.title || buildAdTitle(finalPrompt, mediaType),
        description: String(state.description ?? readyBrief?.description ?? lastAd.title ?? "").slice(0, 2000),
      };
      setPromptPreview(null);
      setEditablePrompt("");
      await runGenerationFromPreview("", preview);
    })();
  }, [readyBrief, readyBriefInfo?.messageId, generatedAds, generating, preparingPrompt]);


  // ── Upload d'une image produit depuis le chat (bouton 📎 ou drag & drop).
  // On évite readAsDataURL (base64 = plusieurs Mo dans le state React →
  // re-rendu très lourd de toute la conversation). Upload direct au storage,
  // fallback ObjectURL pour l'aperçu si le storage échoue.
  const addProductImage = async (file: File): Promise<string | null> => {
    if (!file.type.startsWith("image/")) {
      toast.error(`"${file.name}" n'est pas une image (JPG, PNG ou WebP).`);
      return null;
    }
    if (file.size > 12 * 1024 * 1024) {
      toast.error(`"${file.name}" est trop lourde (max 12 Mo).`);
      return null;
    }
    let imageRef: string | null = null;
    const uploadFile = await resizeImageForChatUpload(file);
    if (!uploadFile) {
      toast.error(`"${file.name}" n'est pas un format utilisable (envoie un JPG, PNG ou WebP).`);
      return null;
    }
    try {

      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user.id;
      if (userId) {
        const ext = uploadFile.type.includes("png") ? "png" : uploadFile.type.includes("webp") ? "webp" : "jpg";
        const path = `${userId}/chat-uploads/${crypto.randomUUID()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("tram-assets")
          .upload(path, uploadFile, { contentType: uploadFile.type || "image/jpeg", upsert: false });
        if (!uploadError) {
          const { data: signed } = await supabase.storage
            .from("tram-assets")
            .createSignedUrl(path, 60 * 60 * 24 * 7);
          if (signed?.signedUrl) imageRef = signed.signedUrl;
        }
      }
    } catch {
      // ignore : on retombera sur un ObjectURL local
    }
    if (!imageRef) {
      toast.error("Upload impossible pour l'instant. Réessaie dans quelques secondes.");
      return null;
    }
    const next = safePersistableImageUrls([...productImages, imageRef]);
    setProductImages(next);
    setState((s) => ({ ...s, productImages: next, hasProductImage: "yes" }));
    try {
      await appendProductImagesFn({ data: { conversationId, imageUrls: [imageRef] } });
      qc.invalidateQueries({ queryKey: ["ad-conversation", conversationId] });
    } catch {
      // L'image reste utilisable dans la session ; on évite de bloquer le chat.
    }
    return imageRef;
  };


  const handleImageUpload = async (file: File) => {
    setUploadingImage(true);
    try {
      const url = await addProductImage(file);
      if (url) {
        setPendingImages((prev) => [...prev, url]);
        inputRef.current?.focus();
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Impossible de lire l'image.");
    } finally {
      setUploadingImage(false);
    }
  };

  // ── Import d'une vidéo dans le chat : simple envoi dans le stockage privé.
  // Aucune analyse ici : l'assistant regarde la vidéo lui-même après l'envoi
  // du message, pour ne pas faire attendre avant d'écrire.
  const handleVideoUpload = async (file: File) => {
    if (file.size > 80 * 1024 * 1024) {
      toast.error(`"${file.name}" est trop lourde (max 80 Mo).`);
      return;
    }
    setUploadingImage(true);
    const toastId = toast.loading("Import de la vidéo…");
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user.id;
      if (!userId) throw new Error("Session expirée, reconnecte-toi.");
      const ext = (file.name.split(".").pop() || "mp4").toLowerCase().slice(0, 5);
      const path = `${userId}/chat-uploads/${crypto.randomUUID()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("tram-assets")
        .upload(path, file, { contentType: file.type || "video/mp4", upsert: false });
      if (uploadError) throw new Error("Upload de la vidéo impossible.");
      const { data: signed } = await supabase.storage
        .from("tram-assets")
        .createSignedUrl(path, 60 * 60 * 24 * 7);
      const url = signed?.signedUrl;
      if (!url) throw new Error("Lien de la vidéo indisponible.");

      setPendingVideos((prev) => [...prev, { url, name: file.name }]);
      toast.success("Vidéo jointe : écris ton message.", { id: toastId });
      inputRef.current?.focus();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Impossible d'importer la vidéo.", { id: toastId });
    } finally {
      setUploadingImage(false);
    }
  };

  // ── Import d'un audio dans le chat (brief vocal, voix de référence).
  // Aucune écoute ici : l'assistant l'écoute lui-même après l'envoi du message.
  const handleAudioUpload = async (file: File) => {
    if (file.size > 30 * 1024 * 1024) {
      toast.error(`"${file.name}" est trop lourd (max 30 Mo).`);
      return;
    }
    setUploadingImage(true);
    const toastId = toast.loading("Import de l'audio…");
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user.id;
      if (!userId) throw new Error("Session expirée, reconnecte-toi.");
      const ext = (file.name.split(".").pop() || "mp3").toLowerCase().slice(0, 5);
      const path = `${userId}/chat-uploads/${crypto.randomUUID()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("tram-assets")
        .upload(path, file, { contentType: file.type || "audio/mpeg", upsert: false });
      if (uploadError) throw new Error("Upload de l'audio impossible.");
      const { data: signed } = await supabase.storage
        .from("tram-assets")
        .createSignedUrl(path, 60 * 60 * 24 * 7);
      const url = signed?.signedUrl;
      if (!url) throw new Error("Lien de l'audio indisponible.");
      setPendingAudios((prev) => [...prev, { url, name: file.name }]);
      toast.success("Audio joint : écris ton message.", { id: toastId });
      inputRef.current?.focus();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Impossible d'importer l'audio.", { id: toastId });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDropFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const all = Array.from(files);
    const videos = all.filter((f) => f.type.startsWith("video/"));
    const audios = all.filter((f) => f.type.startsWith("audio/"));
    const images = all.filter((f) => f.type.startsWith("image/"));
    for (const video of videos) await handleVideoUpload(video);
    for (const audio of audios) await handleAudioUpload(audio);
    if (images.length === 0) {
      if (videos.length === 0 && audios.length === 0) toast.error("Merci de déposer une image, une vidéo ou un audio.");
      setIsDraggingOver(false);
      return;
    }
    setUploadingImage(true);
    try {
      const added: string[] = [];
      for (const file of images) {
        const url = await addProductImage(file);
        if (url) added.push(url);
      }
      if (added.length > 0) {
        setPendingImages((prev) => [...prev, ...added]);
        inputRef.current?.focus();
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Impossible de lire les images.");
    } finally {
      setUploadingImage(false);
      setIsDraggingOver(false);
    }
  };

  const removeProductImage = (idx: number) => {
    const removed = productImages[idx];
    const next = productImages.filter((_, i) => i !== idx);
    setProductImages(next);
    setState((s) => {
      const actorUrls = safePersistableImageUrls(Array.isArray(s.stockActorImageUrls) ? s.stockActorImageUrls : [])
        .filter((url) => url !== removed);
      return { ...s, productImages: next, stockActorImageUrls: actorUrls };
    });
    if (removed) setPendingImages((prev) => prev.filter((u) => u !== removed));
    if (removed) {
      void removeProductImageFn({ data: { conversationId, imageUrl: removed } })
        .then(() => qc.invalidateQueries({ queryKey: ["ad-conversation", conversationId] }))
        .catch(() => undefined);
    }
  };


  const addCatalogImages = useCallback(async (urls: string[]) => {
    const clean = urls.filter((u) => typeof u === "string" && u.length > 0);
    if (clean.length === 0) return;
    const next = safePersistableImageUrls([...productImages, ...clean]);
    setProductImages(next);
    setState((s) => ({ ...s, productImages: next, hasProductImage: "yes" }));
    setPendingImages((prev) => [...prev, ...clean]);
    try {
      await appendProductImagesFn({ data: { conversationId, imageUrls: clean } });
      qc.invalidateQueries({ queryKey: ["ad-conversation", conversationId] });
    } catch {
      /* non-bloquant */
    }
    inputRef.current?.focus();
  }, [productImages, setState, appendProductImagesFn, conversationId, qc]);

  // Sélection d'un acteur UGC pré-défini depuis la galerie/picker :
  // - affiche l'acteur en attente au-dessus du composer
  // - ne déclenche AUCUNE écriture d'état ni persistance : tant que le message
  //   n'est pas envoyé, un acteur retiré du composer ne doit laisser aucune trace.
  //   La validation se fait dans onSubmit (commitPendingActors).
  const selectStockActors = useCallback(async (urls: string[], labels: string[], ids: string[] = []) => {
    const clean = urls
      .map((u, i) => ({ url: u, name: labels[i] ?? null, id: ids[i] ?? null }))
      .filter((a) => typeof a.url === "string" && a.url.length > 0);
    if (clean.length === 0) return;
    setPendingActors((prev) => {
      const seen = new Set(prev.map((a) => a.url));
      const merged = [...prev];
      for (const a of clean) if (!seen.has(a.url)) merged.push(a);
      return merged;
    });
    // Focus l'input pour que l'utilisateur puisse taper immédiatement son prompt.
    setTimeout(() => inputRef.current?.focus(), 50);
  }, []);

  const listStockActorsFn = useServerFn(listStockActors);
  const renameConvTitleFn = useServerFn(renameAdConversation);
  useEffect(() => {
    autoPickActorRef.current = async (label: string) => {
      try {
        const actors = (await listStockActorsFn()) as Array<{ id: string; name: string; reference_image_url: string; gender: string | null; style: string | null; tags: string[] | null; description: string | null }>;
        // Priorité aux acteurs qui collent au profil de la stratégie (technicien → homme pro…).
        const pool = bestActorsForProfile(actors.filter((a) => a.reference_image_url), inferActorProfile(actorProfileTextRef.current));
        if (pool.length === 0) throw new Error("no actors");
        const pick = pool[Math.floor(Math.random() * pool.length)];
        await commitPendingActorsRef.current?.([{ url: pick.reference_image_url, name: pick.name, id: pick.id }]);
        const duration = label.match(/\b(\d{1,2})\s?s\b/)?.[1];
        sendMessage({
          text: `Choisis l'acteur pour moi${duration ? `, ${duration} s` : ""} — acteur retenu : ${pick.name}.<!--actor-autopicked:${JSON.stringify({ id: pick.id, name: pick.name })}-->`,
        });
      } catch {
        sendMessage({ text: label });
      }
    };
  }, [listStockActorsFn, sendMessage]);

  // Validation des acteurs au moment de l'envoi : c'est seulement ici que
  // l'acteur entre dans l'état de la conversation et dans les images de référence.
  const commitPendingActors = useCallback(async (actors: PendingActor[]) => {
    if (actors.length === 0) return;
    const firstWithId = actors.find((a) => !!a.id);
    if (firstWithId) {
      setState((s) => ({ ...s, stockActorId: firstWithId.id, stockActorName: firstWithId.name ?? null }));
    }
    const actorUrls = actors.map((a) => a.url);
    const existing = productImagesRef.current;
    const toAdd = actorUrls.filter((u) => !existing.includes(u));
    if (toAdd.length > 0) {
      const nextImgs = safePersistableImageUrls([...existing, ...toAdd]);
      setProductImages(nextImgs);
      setState((s) => ({ ...s, productImages: nextImgs, hasProductImage: "yes", stockActorImageUrls: actorUrls }));
      try {
        await appendProductImagesFn({ data: { conversationId, imageUrls: toAdd } });
        qc.invalidateQueries({ queryKey: ["ad-conversation", conversationId] });
      } catch {
        /* non-bloquant */
      }
    } else {
      setState((s) => ({ ...s, stockActorImageUrls: actorUrls }));
    }
  }, [setState, appendProductImagesFn, conversationId, qc]);
  commitPendingActorsRef.current = commitPendingActors;


  // Pré-remplit un acteur pré-défini choisi dans la galerie (URL + sauvegarde locale de secours).
  const { actor: actorUrl, actorName, actorId, start: startMode } = Route.useSearch();
  const { focus: focusAdId } = Route.useSearch();
  // « Ouvrir la discussion » : on se positionne sur la carte de la création.
  useEffect(() => {
    if (!focusAdId) return;
    let tries = 0;
    const t = setInterval(() => {
      const el = document.getElementById(`ad-${focusAdId}`) ?? document.querySelector(`[data-ad-version="${focusAdId}"]`);
      if (el) {
        clearInterval(t);
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.classList.add("ring-2", "ring-primary", "rounded-2xl");
        setTimeout(() => el.classList.remove("ring-2", "ring-primary", "rounded-2xl"), 2500);
      } else if (++tries > 40) clearInterval(t);
    }, 250);
    return () => clearInterval(t);
  }, [focusAdId]);

  // Publication Meta depuis « Créations » : le chat démarre tout seul sur le
  // flow de publication, avec la (les) création(s) déjà en contexte.
  const metaAutoStartRef = useRef<string | null>(null);
  useEffect(() => {
    if (startMode !== "meta" || !conversationId) return;
    if (metaAutoStartRef.current === conversationId) return;
    if (status !== "ready") return;
    if (messages.some((m) => m.role === "user")) return;
    const auto = typeof state.metaPublishAutoMessage === "string" ? state.metaPublishAutoMessage : null;
    if (!auto) return;
    metaAutoStartRef.current = conversationId;
    sendMessage({ text: auto });
    void navigate({
      to: "/create",
      search: (prev: Record<string, unknown>) => ({ ...prev, start: undefined }),
      replace: true,
    });
  }, [startMode, conversationId, status, messages, state, sendMessage, navigate]);

  const actorAppliedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!conversationId) return;

    let actorsToApply: PendingActor[] = [];
    if (actorUrl) {
      actorsToApply = [{ url: actorUrl, name: actorName ?? null, id: actorId ?? null }];
    } else if (typeof window !== "undefined") {
      try {
        const raw = window.localStorage.getItem(PENDING_STOCK_ACTORS_KEY);
        const parsed = raw ? JSON.parse(raw) : null;
        const list = Array.isArray(parsed) ? parsed : parsed ? [parsed] : [];
        actorsToApply = list
          .map((item) => ({
            url: typeof item?.url === "string" ? item.url : "",
            name: typeof item?.name === "string" ? item.name : null,
            id: typeof item?.id === "string" ? item.id : null,
          }))
          .filter((item) => item.url.length > 0);
      } catch {
        actorsToApply = [];
      }
    }

    if (actorsToApply.length === 0) return;
    const signature = JSON.stringify(actorsToApply.map((a) => [a.url, a.name, a.id]));
    if (actorAppliedRef.current === signature) return;
    actorAppliedRef.current = signature;

    void selectStockActors(
      actorsToApply.map((a) => a.url),
      actorsToApply.map((a) => a.name ?? ""),
      actorsToApply.map((a) => a.id ?? ""),
    );

    if (typeof window !== "undefined") {
      window.localStorage.removeItem(PENDING_STOCK_ACTORS_KEY);
    }

    if (actorUrl) {
      // Nettoie l'URL pour éviter de rejouer à chaque refresh.
      void navigate({
        to: "/create",
        search: (prev: Record<string, unknown>) => ({ ...prev, actor: undefined, actorName: undefined, actorId: undefined }),
        replace: true,
      });
    }
  }, [actorUrl, actorName, actorId, conversationId, selectStockActors, navigate]);

  // Template « Vidéos Produit » sélectionné dans la galerie : on le rattache à la
  // conversation et on pré-remplit l'input pour décrire le produit de remplacement.
  const templateAppliedRef = useRef<string | null>(null);
  useEffect(() => {
    if (!conversationId || typeof window === "undefined") return;
    let tpl:
      | {
          slug?: string;
          name?: string;
          description?: string;
          exampleProduct?: string;
          durationSec?: number;
          ratio?: string;
          category?: string;
        }
      | null = null;
    try {
      const raw = window.localStorage.getItem(PENDING_PRODUCT_TEMPLATE_KEY);
      tpl = raw ? JSON.parse(raw) : null;
    } catch {
      tpl = null;
    }
    if (!tpl?.slug || !tpl?.name) return;
    if (templateAppliedRef.current === tpl.slug) return;
    templateAppliedRef.current = tpl.slug;
    try {
      window.localStorage.removeItem(PENDING_PRODUCT_TEMPLATE_KEY);
    } catch {
      /* ignore */
    }

    const t = tpl;
    setState((s) => ({
      ...s,
      productTemplateSlug: t.slug,
      productTemplateName: t.name,
      productTemplateCategory: t.category ?? null,
      productTemplateDurationSec: t.durationSec ?? null,
      productTemplateRatio: t.ratio ?? "9:16",
      contentType: "video",
    }));

    toast.success(`Template « ${t.name} » rattaché à ce chat`, {
      description: "Décris ton produit (ou joins une photo) pour le remplacer dans la vidéo.",
    });

    const suffix = t.exampleProduct ? ` à la place de « ${t.exampleProduct} »` : "";
    inputRef.current?.setValue(
      `Je veux reproduire exactement le template vidéo « ${t.name} » avec MON produit${suffix}. Mon produit : `,
    );
    setTimeout(() => inputRef.current?.focus(), 60);
  }, [conversationId, setState]);

  // ---- Modification d'une pub Meta en ligne, ouverte depuis « Campagnes » ----
  const metaEditAppliedRef = useRef<string | null>(null);
  useEffect(() => {
    if (!conversationId || typeof window === "undefined") return;
    let payload: { adId?: string; campaignId?: string; adName?: string; campaignName?: string } | null = null;
    try {
      const raw = window.localStorage.getItem(PENDING_META_AD_EDIT_KEY);
      payload = raw ? JSON.parse(raw) : null;
    } catch {
      payload = null;
    }
    if (!payload?.adId && !payload?.campaignId) return;
    const handoffId = payload.adId ?? payload.campaignId;
    if (!handoffId || metaEditAppliedRef.current === handoffId) return;
    metaEditAppliedRef.current = handoffId;
    try {
      window.localStorage.removeItem(PENDING_META_AD_EDIT_KEY);
    } catch {
      /* ignore */
    }
    const label = payload.campaignName || payload.adName || "ma campagne";
    const ids = [
      payload.campaignId ? `campaign Meta id: ${payload.campaignId}` : null,
      payload.adId ? `ad Meta id: ${payload.adId}` : null,
    ].filter(Boolean).join(", ");
    inputRef.current?.setValue(`Je veux modifier ma campagne Meta déjà en ligne « ${label} » (${ids}). Montre-moi son contenu actuel et son audience, puis demande-moi directement ce que je veux changer. `);
    setTimeout(() => inputRef.current?.focus(), 60);
  }, [conversationId]);

  // ---- Demande écrite sur l'Accueil : envoyée telle quelle dans le nouveau chat ----
  const homePromptRef = useRef<string | null>(null);
  useEffect(() => {
    if (!conversationId || typeof window === "undefined") return;
    if (homePromptRef.current === conversationId) return;
    if (status !== "ready") return;
    if (messages.some((m) => m.role === "user")) return;
    const text = takePendingChatPrompt();
    if (!text) return;
    homePromptRef.current = conversationId;
    sendMessage({ text });
  }, [conversationId, status, messages, sendMessage]);






  const isLoading = status === "streaming" || status === "submitted";
  const isEmptyChat = !messages.some((m) => m.role === "user") && !isLoading && generatedAds.length === 0;

  // Pré-remplissage du champ de saisie demandé par l'agent
  // (ex: nom de campagne Meta pré-rempli avec « Growthity »).
  const prefilledMsgIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (isLoading) return;
    const last = [...messages].reverse().find((m) => m.role === "assistant");
    if (!last) return;
    if (prefilledMsgIdRef.current === last.id) return;
    const raw = messageRawText(last);
    const lockedMatch = raw.match(PREFILL_LOCKED_RE);
    const match = lockedMatch ?? raw.match(PREFILL_RE);
    if (!match) return;
    prefilledMsgIdRef.current = last.id;
    inputRef.current?.setValue(match[1].trim(), { lockedPrefix: lockedMatch ? match[1].trim() : undefined });
  }, [messages, isLoading]);

  // Logos des Pages Facebook renvoyés par meta_list_pages, indexés par nom
  // pour illustrer les suggestions de choix de Page.
  const metaPageLogos = useMemo(() => {
    const map = new Map<string, string>();
    for (const m of messages) {
      for (const p of (m.parts ?? []) as Array<{ type?: string; output?: unknown }>) {
        if (p?.type !== "tool-meta_list_pages") continue;
        const out = p.output as { items?: Array<{ name?: unknown; pictureUrl?: unknown }> } | undefined;
        for (const it of out?.items ?? []) {
          if (typeof it?.name === "string" && typeof it?.pictureUrl === "string" && it.pictureUrl) {
            map.set(it.name.trim().toLowerCase(), it.pictureUrl);
          }
        }
      }
    }
    return map;
  }, [messages]);

  const readyMessageIds = useMemo(
    () => messages.filter(messageHasReadyToGenerate).map((message) => message.id),
    [messages, toolBriefSignature],
  );
  const legacyGenerationAnchors = useMemo(
    () => messages
      .filter(messageLooksLikeGenerationAnchor)
      .map((message) => ({
        id: message.id,
        kind: inferGeneratedKindFromMessage(message),
        isLaunch: messageLooksLikeActualGenerationLaunch(message),
      })),
    [messages, toolBriefSignature],
  );
  const unanchoredGeneratedAdsCount = useMemo(
    () => generatedAds.filter((ad) => !ad.afterMessageId).length,
    [generatedAds],
  );
  const readyBriefOrdinal = readyBriefInfo ? readyMessageIds.indexOf(readyBriefInfo.messageId) : -1;
  const messageIndexById = useMemo(
    () => new Map(messages.map((message, index) => [message.id, index])),
    [messages],
  );
  const generatedForCurrentReadyBrief = Boolean(
    readyBriefInfo &&
      generatedAds.some((ad, adIndex) => {
        if (ad.afterMessageId === readyBriefInfo.messageId) return true;
        if (ad.afterMessageId) {
          const anchorIndex = messageIndexById.get(ad.afterMessageId);
          if (anchorIndex !== undefined && anchorIndex >= readyBriefInfo.messageIndex) return true;
        }
        return !ad.afterMessageId && readyBriefOrdinal >= 0 && readyBriefOrdinal < unanchoredGeneratedAdsCount;
      }),
  );
  const canPreparePrompt = canGenerate && !generatedForCurrentReadyBrief;

  // ── Affichage direct du prompt : dès que le brief est complet, on rédige
  // le prompt automatiquement et on l'affiche inline dans le chat. Plus
  // besoin de cliquer sur un bouton "Voir le prompt" pour le révéler.
  const preparePromptRef = useRef(handlePreparePrompt);
  preparePromptRef.current = handlePreparePrompt;
  const autoPreparedRef = useRef<string | null>(readCachedPrompt()?.messageId ?? null);
  const [autoPrepareFailed, setAutoPrepareFailed] = useState(false);
  // Brief pour lequel une rédaction automatique a réellement été lancée.
  // Sans ça, un brief déjà "marqué" (cache local, aperçu annulé) affichait un
  // squelette de chargement éternel alors qu'aucune rédaction ne tournait.
  const [attemptedBriefKey, setAttemptedBriefKey] = useState<string | null>(null);
  // On n'affiche le squelette « je rédige… » que si une rédaction tourne
  // vraiment pour CE brief ; sinon on propose tout de suite le bouton manuel.
  // Le squelette « je rédige… » ne s'affiche QUE pendant l'appel réel.
  // Toute autre situation propose immédiatement le bouton manuel.
  const briefPreparing = preparingPrompt;
  void autoPrepareFailed;
  void attemptedBriefKey;

  // Persistance EN BASE du prompt affiché (lié au message du brief) : on le
  // retrouve sur un autre appareil ou après avoir vidé le cache.
  const savePromptDraftFn = useServerFn(savePromptDraft);
  const getPromptDraftFn = useServerFn(getPromptDraft);
  const draftLoadedRef = useRef(false);
  useEffect(() => {
    if (!conversationId) return;
    draftLoadedRef.current = false;
    let cancelled = false;
    void getPromptDraftFn({ data: { conversationId } })
      .then(({ draftJson }) => {
        const draft = draftJson ? (JSON.parse(draftJson) as { messageId: string | null; preview: unknown; editable: string }) : null;
        if (cancelled || !draft?.preview) return;
        if (!readCachedPrompt()?.preview) {
          setPromptPreview(draft.preview as unknown as PromptPreview);
          setEditablePrompt(draft.editable ?? "");
        }
        if (draft.messageId) autoPreparedRef.current = draft.messageId;
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) draftLoadedRef.current = true; });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);
  useEffect(() => {
    if (!conversationId || !draftLoadedRef.current) return;
    const t = setTimeout(() => {
      void savePromptDraftFn({
        data: {
          conversationId,
          draft: promptPreview
            ? {
                messageId: readyBriefInfo?.messageId ?? autoPreparedRef.current ?? null,
                preview: promptPreview as unknown as Record<string, unknown>,
                editable: editablePrompt,
              }
            : null,
        },
      }).catch(() => {});
    }, 800);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [promptPreview, editablePrompt, conversationId]);

  // Persistance locale du prompt affiché (survit à un changement de page).
  useEffect(() => {
    if (typeof window === "undefined" || !conversationId) return;
    try {
      if (promptPreview) {
        window.localStorage.setItem(
          promptCacheKey,
          JSON.stringify({
            preview: promptPreview,
            editable: editablePrompt,
            messageId: readyBriefInfo?.messageId ?? autoPreparedRef.current ?? null,
          }),
        );
      } else {
        window.localStorage.removeItem(promptCacheKey);
      }
    } catch { /* quota / mode privé : on ignore */ }
  }, [promptPreview, editablePrompt, promptCacheKey, conversationId, readyBriefInfo?.messageId]);
  // Ancien brouillon d'une vidéo longue déjà terminée : le prompt ne doit plus
  // rester en bas du chat. On le range dans la carte vidéo (« Prompt utilisé »).
  useEffect(() => {
    if (!promptPreview || previewFreshRef.current || !conversationId) return;
    const match = doneChains.find((c) => c.title === promptPreview.adTitle);
    if (!match) return;
    const promptText = (match.prompt || editablePrompt || promptPreview.userLanguagePrompt || "").slice(0, 8000);
    const existingAd = generatedAds.find((a) => a.id === match.finalAdId);
    if (!existingAd) return; // on attend la carte vidéo pour y ranger le prompt
    if (promptText && !existingAd.prompt) {
      const ad: GeneratedAd = { ...existingAd, prompt: promptText };
      upsertGeneratedAdLocal(ad);
      void appendGeneratedAdFn({ data: { conversationId, ad: { id: ad.id, kind: ad.kind, title: ad.title, status: ad.status, prompt: promptText } } }).catch(() => {});
    }
    setPromptPreview(null);
    setEditablePrompt("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doneChains, promptPreview, conversationId, generatedAds]);
  // Messages déjà présents à l'ouverture de la conversation : leur brief a été
  // traité lors d'une visite précédente. On ne relance JAMAIS de rédaction
  // automatique pour eux (retour dans le chat, refresh, reconnexion) — seul un
  // clic explicite ou un nouveau message peut en déclencher une.
  const mountedMessageIdsRef = useRef<Set<string>>(new Set(safeInitialMessages.map((m) => m.id)));
  useEffect(() => {
    if (!readyBriefInfo || !canPreparePrompt) return;
    if (readyBrief?.sameAsLastPrompt === true) return;
    if (preparingPrompt || generating) return;
    const key = readyBriefInfo.messageId;
    if (mountedMessageIdsRef.current.has(key)) return;
    if (autoPreparedRef.current === key) return;
    autoPreparedRef.current = key;
    setAttemptedBriefKey(key);
    setAutoPrepareFailed(false);
    // Nouveau brief alors qu'une carte de prompt est déjà ouverte (l'utilisateur
    // a demandé des modifications dans le chat) : on remplace l'aperçu existant
    // directement, sans obliger à cliquer sur "Annuler" d'abord.
    if (promptPreview) {
      setPromptPreview(null);
      setEditablePrompt("");
    }
    void (async () => {
      try {
        await preparePromptRef.current();
      } finally {
        // Si aucun aperçu n'a été produit (erreur, crédits…), on laisse une
        // porte de sortie manuelle plutôt qu'un écran vide.
        setAutoPrepareFailed(true);
      }
    })();
  }, [
    readyBriefInfo?.messageId,
    canPreparePrompt,
    readyBrief?.sameAsLastPrompt,
    promptPreview,
    preparingPrompt,
    generating,
  ]);





  const [historyOpen, setHistoryOpen] = useState(false);
  // Sélecteur « Mode IA (interne) » : retiré du fil. Le composant reste monté
  // (il synchronise le mode et force « Actuel » pour les clients) ; l'équipe
  // interne peut encore l'afficher via un petit bouton discret.
  const aiModeAccessFn = useServerFn(getAiModeAccess);
  const aiModeAccess = useQuery({ queryKey: ["ai-mode-access"], queryFn: () => aiModeAccessFn(), staleTime: 300_000 });
  const aiModeInternal = (aiModeAccess.data as { internal?: boolean } | undefined)?.internal === true;
  const [aiModeOpen, setAiModeOpen] = useState(false);
  // Ancrage de repli : une pub sans ancre valide (génération échouée, ancre
  // supprimée…) est épinglée au dernier message présent la première fois
  // qu'on l'affiche, afin que les messages suivants passent EN DESSOUS d'elle.
  const orphanAnchorRef = useRef<Map<string, string>>(new Map());
  const latestMetaPreview = useMemo(() => findLatestMetaPreview(messages), [messages]);



  return (
    <CompetitorRefsContext.Provider value={competitorRefsApi}>
    <div className="flex min-h-0 w-full flex-1">
      <div
        className="gx-thread relative min-w-0 flex-1"
        onDragOver={(e) => {
          if (!e.dataTransfer.types.includes("Files")) return;
          e.preventDefault();
          setIsDraggingOver(true);
        }}
        onDragLeave={(e) => {
          if (e.currentTarget.contains(e.relatedTarget as Node | null)) return;
          setIsDraggingOver(false);
        }}
        onDrop={(e) => {
          if (!e.dataTransfer.types.includes("Files")) return;
          e.preventDefault();
          setIsDraggingOver(false);
          void handleDropFiles(e.dataTransfer.files);
        }}
      >
      {/* Outils discrets du fil (hors maquette) : historique du chat, mode IA interne */}
      <div className="gx-th-tools">
        {aiModeInternal && (
          <button
            type="button"
            className={`gx-ib gx-sm${aiModeOpen ? " gx-on" : ""}`}
            onClick={() => setAiModeOpen((v) => !v)}
            aria-pressed={aiModeOpen}
            aria-label="Mode IA (interne)"
            title="Mode IA (interne, réservé à l'équipe)"
          >
            <Box className="gx-i" />
          </button>
        )}
        {!historyOpen && (
          <button
            type="button"
            onClick={() => setHistoryOpen((v) => !v)}
            className="gx-ib gx-sm gx-th-hist"
            title="Afficher l'historique du chat (messages & créations)"
            aria-label="Afficher l'historique du chat"
          >
            <History className="gx-i" />
          </button>
        )}
      </div>

      {/* Infos brief et médias générés sont désormais dans le panneau Historique à droite */}


      {/* Messages */}
      <div
        ref={scrollRef}
        className="gx-th-in relative"
        id="thread"
      >
        {isEmptyChat ? (
          <EmptyChatHero onSuggestion={(t) => inputRef.current?.setValue(t)} />
        ) : null}
        <div className={isEmptyChat ? "hidden" : "contents"}>
          {(() => {
            const messageIds = new Set(messages.map((m) => m.id));
            const adsByAnchor = new Map<string, GeneratedAd[]>();
            const orphanAds: GeneratedAd[] = [];
            const anchorByAdId = new Map<string, string | undefined>();
            let legacyAdIndex = 0;
            const orphanAnchors = orphanAnchorRef.current;
            const lastMessageId = messages[messages.length - 1]?.id;
            for (const ad of orderGeneratedAdsForThread(generatedAds)) {
              let anchor = ad.afterMessageId && messageIds.has(ad.afterMessageId) ? ad.afterMessageId : undefined;
              if (!anchor && ad.displayAfterAdId) {
                anchor = anchorByAdId.get(ad.displayAfterAdId);
              }
              if (!anchor && legacyGenerationAnchors.length > 0) {
                const legacyAnchor = legacyGenerationAnchors[legacyAdIndex];
                anchor = legacyAnchor?.id;
                legacyAdIndex += 1;
              }
              // Une pub encore en cours de génération suit le bas du fil ;
              // dès qu'elle est prête (ou échouée) sa position est figée, donc
              // les messages envoyés ensuite s'affichent EN DESSOUS d'elle.
              const inProgress = ad.status !== "ready" && ad.status !== "failed";
              if (inProgress && lastMessageId) {
                orphanAnchors.set(ad.id, lastMessageId);
                anchor = lastMessageId;
              } else if (!anchor || !messageIds.has(anchor)) {
                const sticky = orphanAnchors.get(ad.id);
                if (sticky && messageIds.has(sticky)) {
                  anchor = sticky;
                } else if (lastMessageId) {
                  orphanAnchors.set(ad.id, lastMessageId);
                  anchor = lastMessageId;
                }
              }

              anchorByAdId.set(ad.id, anchor);
              if (anchor && messageIds.has(anchor)) {
                const list = adsByAnchor.get(anchor) ?? [];
                list.push(ad);
                adsByAnchor.set(anchor, list);
              } else {
                orphanAds.push(ad);
              }
            }
            // Priority 0: only the latest assistant message with suggestions is
            // interactive. Older suggestion sets get visually locked so an
            // accidental click cannot derail the in-progress brief.
            let lastSuggestionIdx = -1;
            for (let i = messages.length - 1; i >= 0; i--) {
              const m = messages[i];
              if (m.role !== "assistant") continue;
              if (SUGGESTIONS_RE.test(messageRawText(m))) {
                lastSuggestionIdx = i;
                break;
              }
            }
            // Index du dernier message utilisateur : tout brief (carte de suite)
            // situé AVANT ce message est considéré comme caduc et n'est plus affiché.
            let lastUserIdx = -1;
            for (let i = messages.length - 1; i >= 0; i--) {
              if (messages[i]?.role === "user") {
                lastUserIdx = i;
                break;
              }
            }
            return (
              <>
                {messages.map((m, messageIndex) => {
                  const isLastMessage = messageIndex === messages.length - 1;
                  const isStreamingMessage = isLoading && isLastMessage && m.role === "assistant";
                  const suggestionsLocked =
                    m.role === "assistant" &&
                    lastSuggestionIdx !== -1 &&
                    messageIndex < lastSuggestionIdx;
                  return (
                  <div key={`${m.id}-${messageIndex}`} id={`msg-${m.id}`} className="gx-m-w scroll-mt-24">

                    <MessageBubble
                      message={m}
                      onSuggestion={handleSuggestion}
                      onReply={handleReplyToMessage}
                      onEdit={handleEditFromUserMessage}
                      isStreaming={isStreamingMessage}
                      suggestionsLocked={suggestionsLocked}
                      pageLogos={metaPageLogos}
                    />

                    <div className="gx-m-x">
                      <AgentToolBlocks message={m} onSuggestion={handleSuggestion} onEditCreation={handleEditCreation} onAdCreated={upsertGeneratedAdLocal} briefSuperseded={messageIndex < lastUserIdx} conversationId={conversationId} />
                    </div>

                    {(adsByAnchor.get(m.id) ?? []).length > 0 && (
                      <div className="gx-m-x">
                        {(adsByAnchor.get(m.id) ?? []).map((ad, adIndex) => (
                          <GeneratedAdCard key={`${m.id}-ad-${ad.id}-${adIndex}`} ad={ad} onSubtitleBurnStart={markAdReburnStart} onReply={() => handleReplyToAd(ad)} onSuggest={handleSuggestion} conversationId={conversationId} onAdCreated={upsertGeneratedAdLocal} />
                        ))}
                      </div>
                    )}
                  </div>
                  );
                })}

                {orphanAds.length > 0 && (
                  <div className="gx-m-x">
                    {orphanAds.map((ad, adIndex) => (
                      <GeneratedAdCard key={`orphan-ad-${ad.id}-${adIndex}`} ad={ad} onSubtitleBurnStart={markAdReburnStart} onReply={() => handleReplyToAd(ad)} onSuggest={handleSuggestion} conversationId={conversationId} onAdCreated={upsertGeneratedAdLocal} />
                    ))}
                  </div>
                )}
              </>
            );
          })()}

          {isLoading && messages[messages.length - 1]?.role === "user" && (
            <div className="gx-m gx-ai animate-fade-in">
              <span className="gx-av gx-ai animate-pulse" aria-hidden>G</span>
              <div className="gx-mb">
                <p className="gx-typing">
                  <span className="gx-dots" aria-hidden><i /><i /><i /></span>
                  l'assistant écrit…
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="gx-m-x">
              <div className="gx-kard gx-err" role="alert">
                <p>{toUserMessage(error, "Une erreur est survenue. Réessaie dans quelques instants.")}</p>
                {isAuthError(error) && (
                  <div className="gx-kf">
                    <button type="button" className="gx-btn gx-sm" onClick={() => navigate({ to: "/auth" })}>
                      Se reconnecter
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
          {(promptPreview?.mediaType === "video" || (readyBrief && canPreparePrompt && String(state.mediaType ?? readyBrief?.mediaType ?? "") === "video")) &&
            typeof state.stockActorName === "string" && state.stockActorName && stockActorImageUrls[0] && (
            <div className="gx-m-x">
              <div className="gx-kard gx-actor animate-fade-in">
                <img src={stockActorImageUrls[0]} alt={state.stockActorName} />
                <div className="min-w-0 flex-1">
                  <small>Acteur retenu</small>
                  <b>{state.stockActorName}</b>
                </div>
                <button type="button" className="gx-btn gx-sm" onClick={() => handleOpenStockActorsRef.current()}>
                  Changer
                </button>
              </div>
            </div>
          )}
          {readyBrief && readyBrief.sameAsLastPrompt !== true && canPreparePrompt && !promptPreview && !chainActive && !generating && (
            <div className="gx-m-x">
            <div className="gx-kard gx-prompt animate-fade-in">
              <div className="gx-kh">
                <b>Brief prêt</b>
                <small>
                  {briefPreparing
                    ? "Je rédige le prompt final, il s'affiche ici dans un instant…"
                    : "Clique pour rédiger le prompt final à partir de ce brief."}
                </small>
              </div>
              {briefPreparing ? (
                <div className="gx-pp gx-pp-load" aria-busy="true">
                  <i /><i /><i />
                </div>
              ) : null}
              {briefPreparing && promptSlow ? (
                <p className="gx-note">
                  La rédaction continue, elle peut prendre jusqu'à 3 minutes. Rien n'est facturé tant que le prompt n'est pas livré.
                </p>
              ) : null}
              <div className="gx-kf">
                {!briefPreparing && (
                  <button
                    type="button"
                    className="gx-btn gx-sm gx-pri"
                    onClick={() => {
                      const key = readyBriefInfo?.messageId ?? null;
                      autoPreparedRef.current = key;
                      setAttemptedBriefKey(key);
                      setAutoPrepareFailed(false);
                      void handlePreparePrompt().finally(() => setAutoPrepareFailed(true));
                    }}
                    disabled={generating}
                  >
                    Rédiger le prompt
                    <ArrowRight className="gx-i" />
                  </button>
                )}
              </div>

            </div>
            </div>
          )}

          {promptPreview && (
            <div className="gx-m-x">
            <PromptPreviewCard
              preview={promptPreview}
              editable={editablePrompt}
              onChangeEditable={setEditablePrompt}
              onConfirm={() => void runGenerationFromPreview(editablePrompt)}
                onQualityChange={(quality) => setPromptPreview((current) => current ? { ...current, videoQuality: quality } : current)}
              onCancel={() => {
                setPromptPreview(null);
                setEditablePrompt("");
              }}
              onRegenerate={() => void handlePreparePrompt()}
              regenerating={preparingPrompt}
              generating={generating || chainActive}
              costCredits={
                promptPreview.mediaType === "video"
                  ? estimateVideoCredits({
                      style: String((state as any)?.styleOverride || promptPreview.recommendedStyle || "ugc"),
                      sourceImageCount: Array.isArray((state as any)?.productImages) ? (state as any).productImages.length : 0,
                      hasActor: typeof (state as any)?.stockActorId === "string",
                      spokenScript: (promptPreview.userLanguagePrompt.match(/TEXTE\s*PARL[ÉE][^\n]*\n([\s\S]*?)(?:\n\s*(?:🎬|📱|DÉCOR|TEXTE À L)|$)/i)?.[1] ?? "").trim(),
                      durationSec: promptPreview.recommendedDuration ?? 8,
                      proSeconds: promptPreview.proMultiScene ? promptPreview.proDurationSec : undefined,
                      quality: promptPreview.videoQuality ?? "standard",
                    })
                  : IMAGE_CREDITS * Math.max(1, promptPreview.mediaType === "carousel" ? promptPreview.prompts.length : 1)
              }
            />
            </div>
          )}
          <div className="gx-m-x">
          <VideoChainProgress
            conversationId={conversationId}
            version={chainVersion}
            onActivityChange={setChainActive}
            onChains={(list) => {
              const done = list
                .filter((c) => c.status === "done" && c.final_ad_id)
                .map((c) => ({ title: c.title, finalAdId: c.final_ad_id!, prompt: c.display_prompt ?? null }));
              setDoneChains((prev) => (prev.length === done.length ? prev : done));
            }}
            onFinal={(c) => {
              // Le fichier final est créé côté serveur juste avant ce signal.
              // On le laisse en attente quelques secondes afin que le suivi
              // récupère son URL signée, au lieu d'afficher une carte « prête » vide.
              if (c.continuationOf) {
                // Suite d'une vidéo : nouvelle version de la même carte, pas de nouvelle carte.
                window.dispatchEvent(new CustomEvent("ad-versions-changed", { detail: { adId: c.continuationOf } }));
                return;
              }
              const existing = generatedAds.find((a) => a.id === c.finalAdId);
              if (existing) {
                // Carte déjà là : on ne la remet JAMAIS en attente (sinon l'URL est
                // re-signée en pleine lecture). On répare seulement son ancrage.
                if (!existing.afterMessageId && c.messageId) {
                  const fixed: GeneratedAd = { ...existing, afterMessageId: c.messageId };
                  upsertGeneratedAdLocal(fixed);
                  if (conversationId) void appendGeneratedAdFn({ data: { conversationId, ad: fixed } }).catch(() => {});
                }
                return;
              }
              const ad: GeneratedAd = { id: c.finalAdId, kind: "video", title: `${c.title} (${c.seconds} s)`, status: "pending", afterMessageId: c.messageId, createdAt: Date.now(), prompt: c.prompt ?? undefined };
              upsertGeneratedAdLocal(ad);
              if (conversationId) void appendGeneratedAdFn({ data: { conversationId, ad } }).catch(() => {});
            }}
          />
          </div>
        </div>

      </div>

      {/* Saisie : raccourcis, pièces jointes en attente, composeur */}
      <div className="gx-cmp-w">
        {/* Scroll to bottom */}
        {showScrollToBottom && (
          <button
            type="button"
            onClick={() => {
              isAtBottomRef.current = true;
              setShowScrollToBottom(false);
              scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
            }}
            className="gx-ib gx-th-down"
            aria-label="Descendre en bas du chat"
            title="Descendre en bas"
          >
            <ChevronDown className="gx-i" />
          </button>
        )}
        <div className="gx-sugg" aria-label="Raccourcis">
          {QUICK_ACTIONS.map((a) => (
            <button
              key={a.id}
              type="button"
              className="gx-chip"
              title={a.hint}
              onClick={() => inputRef.current?.setValue(a.prompt)}
            >
              {a.label}
            </button>
          ))}
        </div>
        <div className="gx-att-w">
          {/* Miniatures des images en attente d'envoi (disparaissent une fois le message envoyé) */}
          {pendingImages.length > 0 && (
            <div className="gx-att">
              {pendingImages.map((src, i) => (
                <div
                  key={`pending-${i}-${src.slice(0, 20)}`}
                  className="gx-att-img group"
                >
                  <img src={src} alt={`produit ${i + 1}`} />
                  <button
                    type="button"
                    onClick={() => {
                      const idx = productImages.indexOf(src);
                      if (idx >= 0) removeProductImage(idx);
                      else setPendingImages((prev) => prev.filter((u) => u !== src));
                    }}
                    className="gx-att-x"
                    aria-label="Retirer l'image"
                  >
                    <X className="gx-i" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {pendingVideos.length > 0 && (
            <div className="gx-att">
              {pendingVideos.map((v) => (
                <div
                  key={`pending-video-${v.url}`}
                  className="gx-att-i"
                >
                  <div className="gx-att-th">
                    <video src={v.url} muted playsInline preload="metadata" />
                  </div>
                  <div className="gx-att-n">{v.name}</div>
                  <button
                    type="button"
                    onClick={() => setPendingVideos((prev) => prev.filter((x) => x.url !== v.url))}
                    className="gx-att-rm"
                    aria-label="Retirer la vidéo"
                  >
                    <X className="gx-i" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {pendingAudios.length > 0 && (
            <div className="gx-att">
              {pendingAudios.map((a) => (
                <div
                  key={`pending-audio-${a.url}`}
                  className="gx-att-i"
                >
                  <div className="gx-att-th gx-att-ic">
                    <AudioWaveform className="gx-i" />
                  </div>
                  <div className="min-w-0">
                    <div className="gx-att-k">Audio</div>
                    <div className="gx-att-n">{a.name}</div>
                    <audio src={a.url} controls preload="metadata" className="gx-att-au" />
                  </div>
                  <button
                    type="button"
                    onClick={() => setPendingAudios((prev) => prev.filter((x) => x.url !== a.url))}
                    className="gx-att-rm"
                    aria-label="Retirer l'audio"
                  >
                    <X className="gx-i" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {competitorRefs.length > 0 && (
            <div className="gx-att" aria-label="Annonces de référence">
              <span className="gx-att-k">
                {competitorRefs.length} référence{competitorRefs.length > 1 ? "s" : ""}
              </span>
              {competitorRefs.map((r) => (
                <CompetitorRefChip
                  key={r.id}
                  ref_={r}
                  onRemove={() => setCompetitorRefs((prev) => prev.filter((x) => x.id !== r.id))}
                />
              ))}
            </div>
          )}

          {pendingCampaign && (
            <PendingCampaignCard
              campaign={pendingCampaign}
              onRemove={() => setPendingCampaign(null)}
            />
          )}


          {pendingActors.length > 0 && (
            <div className="gx-att">
              {pendingActors.map((a) => (
                <div
                  key={`pending-actor-${a.url}`}
                  className="gx-att-i"
                >
                  <div className="gx-att-th">
                    {/\.(mp4|webm|mov)(\?|$)/i.test(a.url) ? (
                      <video src={a.url} muted playsInline />
                    ) : (
                      <img src={a.url} alt={a.name ?? "Acteur"} />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="gx-att-k">Acteur UGC</div>
                    <div className="gx-att-n">{a.name ?? "Acteur"}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPendingActors((prev) => prev.filter((x) => x.url !== a.url))}
                    className="gx-att-rm"
                    aria-label="Retirer l'acteur"
                  >
                    <X className="gx-i" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {pendingCreatives.length > 0 && (
            <div className="gx-att">
              {pendingCreatives.map((c) => (
                <div
                  key={`pending-creative-${c.id}`}
                  className="gx-att-i"
                >
                  <div className="gx-att-th">
                    {c.contentType === "video" ? (
                      <video src={c.thumbUrl ?? c.url} muted playsInline />
                    ) : (
                      <img src={c.thumbUrl ?? c.url} alt={c.title} />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="gx-att-k">
                      {c.contentType === "video" ? "Vidéo" : "Création"}
                    </div>
                    <div className="gx-att-n">{c.title}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPendingCreatives((prev) => prev.filter((x) => x.id !== c.id))}
                    className="gx-att-rm"
                    aria-label="Retirer la création"
                  >
                    <X className="gx-i" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {replyingTo && (
            <div className="gx-att-i gx-reply">
              <CornerUpLeft className="gx-i" />
              <div className="min-w-0 flex-1">
                <div className="gx-att-k">
                  Réponse à{replyingTo.kind !== "text" ? ` ${replyingTo.kind === "video" ? "la vidéo" : replyingTo.kind === "image" ? "l'image" : "au carrousel"}` : ""}
                </div>
                <div className="gx-att-n">{replyingTo.snippet}</div>
              </div>
              <button
                type="button"
                onClick={() => setReplyingTo(null)}
                className="gx-att-rm"
                aria-label="Annuler la réponse"
              >
                <X className="gx-i" />
              </button>
            </div>
          )}
        </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime,video/webm,audio/mpeg,audio/mp3,audio/wav,audio/x-wav,audio/mp4,audio/m4a,audio/x-m4a,audio/aac,audio/ogg,audio/webm"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) {
                const isAudio = f.type.startsWith("audio/") || /\.(mp3|wav|m4a|aac|ogg|flac)$/i.test(f.name);
                void (isAudio
                  ? handleAudioUpload(f)
                  : f.type.startsWith("video/")
                    ? handleVideoUpload(f)
                    : handleImageUpload(f));
              }
              e.target.value = "";
            }}
          />
          {/* Mode IA (interne) : monté pour ses effets, affiché seulement à la demande de l'équipe interne */}
          <div className="gx-aim" hidden={!(aiModeInternal && aiModeOpen)}>
            <AiModeSwitch conversationId={conversationId} />
          </div>
          <ChatComposer
            ref={inputRef}          <ChatComposer
            ref={inputRef}
            disabled={isLoading}
            isStreaming={isLoading}
            onStop={stop}
            uploadingImage={uploadingImage}
            hasPendingImages={pendingImages.length > 0 || pendingActors.length > 0 || pendingCreatives.length > 0 || pendingVideos.length > 0 || pendingAudios.length > 0}
            onPickFile={handlePickFile}
            onOpenCatalogTab={(tab) => { setCatalogPickerTab(tab); setCatalogPickerOpen(true); }}
            onOpenCampaigns={() => setCampaignPickerOpen(true)}
            onOpenContinueVideo={() => setContinuePickerOpen(true)}
            onOpenCreations={() => setCreationPickerOpen(true)}
            onSend={onSubmit}
          />
          <PickCreationDialog
            open={creationPickerOpen}
            onOpenChange={setCreationPickerOpen}
            onPick={(creation) => {
              setCreationPickerOpen(false);
              if (creation.contentType === "video") {
                // Une vidéo ne peut pas servir d'image de référence : on la joint
                // comme création référencée (visible dans le fil + marker pour l'IA).
                upsertGeneratedAdLocal({
                  id: creation.id,
                  kind: "video",
                  title: creation.title,
                  url: creation.url,
                  status: "ready",
                  afterMessageId: messages[messages.length - 1]?.id,
                  createdAt: creation.createdAt,
                });
                setPendingCreatives((prev) => prev.some((p) => p.id === creation.id) ? prev : [...prev, creation]);
              } else {
                // Une image de création devient une image de référence classique.
                void addCatalogImages([creation.url]);
              }
              inputRef.current?.focus();
            }}
          />
          <PickCreationVideoDialog
            open={continuePickerOpen}
            onOpenChange={setContinuePickerOpen}
            onPick={(video) => {
              setContinuePickerOpen(false);
              // La vidéo choisie apparaît dans le fil, puis l'IA prépare le brief de la suite.
              upsertGeneratedAdLocal({
                id: video.id,
                kind: "video",
                title: video.title,
                url: video.url,
                status: "ready",
                afterMessageId: messages[messages.length - 1]?.id,
                createdAt: video.createdAt,
              });
              onSubmit(
                `Je veux prolonger ma vidéo « ${video.title} ». Prépare-moi le brief de la suite en gardant exactement le même acteur et les mêmes produits.\n<!--continue-ad:"${video.id}"-->`,
              );
            }}
          />
          <CatalogPickerDialog
            open={catalogPickerOpen}
            onOpenChange={setCatalogPickerOpen}
            actorProfileText={actorProfileText}
            defaultTab={catalogPickerTab}
            onConfirm={(urls, kind, labels, ids) => {
              setCatalogPickerOpen(false);
              if (kind === "actors") {
                void selectStockActors(urls, labels, ids);
              } else {
                void addCatalogImages(urls);
              }
            }}
          />
          <MetaCampaignPickerDialog
            open={campaignPickerOpen}
            onOpenChange={setCampaignPickerOpen}
            onPick={(c) => {
              // On n'envoie rien : la campagne est jointe au composeur et
              // l'utilisateur écrit lui-même sa demande.
              setPendingCampaign(c);
            }}
          />

      </div>

      {/* Overlay drag & drop : couvre tout le chat, composer inclus */}
      {isDraggingOver && (
        <div className="gx-drop">
          <ImageIcon className="gx-i" />
          <b>Dépose tes fichiers ici</b>
          <small>JPG, PNG, WebP - max 12 Mo par fichier</small>
        </div>
      )}
      </div>
      {latestMetaPreview ? <MetaLivePreviewPanel data={latestMetaPreview} /> : null}
      <div

        className={`hidden shrink-0 overflow-hidden transition-[width] duration-300 ease-in-out md:block ${
          historyOpen ? "w-80" : "w-0"
        }`}
      >
        <ChatHistoryPanel
          messages={messages}
          generatedAds={generatedAds}
          conversationCreatedAt={conversationCreatedAt}
          conversationUpdatedAt={conversationUpdatedAt}
          onClose={() => setHistoryOpen(false)}
        />


      </div>
    </div>
    </CompetitorRefsContext.Provider>
  );
}

type HistoryFilter = "all" | "user" | "assistant" | "creations";

type HistoryEntry =
  | {
      kind: "message";
      id: string;
      role: "user" | "assistant";
      label: string;
      snippet: string;
      anchorId: string;
      hasAttachment: boolean;
      createdAt: number;
    }
  | {
      kind: "creation";
      id: string;
      role: "assistant";
      label: string;
      snippet: string;
      anchorId: string;
      ad: GeneratedAd;
      createdAt: number;
    };

const historyTimeFormatter = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});
function formatHistoryTime(ts: number): string {
  try {
    return historyTimeFormatter.format(new Date(ts));
  } catch {
    return "";
  }
}


function scrollToAnchor(anchorId: string) {
  const el = document.getElementById(anchorId);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "center" });
  el.classList.add("ring-2", "ring-primary/60", "rounded-2xl");
  window.setTimeout(() => {
    el.classList.remove("ring-2", "ring-primary/60", "rounded-2xl");
  }, 1400);
}

function summarizeMessageForHistory(message: UIMessage): { text: string; hasAttachment: boolean } {
  const raw = messageRawText(message)
    .replace(SUGGESTIONS_RE, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/\s*\(\s*[A-Za-z_]\w*\s*=\s*[\w"'-]+\s*\)/g, "")
    .replace(/!\[[^\]]*\]\([^)]+\)/g, "🖼️")
    .replace(/```[\s\S]*?```/g, "")
    // Markdown → texte lisible (pas d'astérisques ni de dièses dans la frise).
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/(\*\*|__)(.+?)\1/g, "$2")
    .replace(/(^|\s)[*_](\S[^*_]*?)[*_](?=\s|$|[.,!?])/g, "$1$2")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^\s*[-*]\s+/gm, "• ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\|/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const parts = (message.parts ?? []) as Array<{ type: string }>;
  const hasAttachment = parts.some((p) => p.type === "file" || p.type?.startsWith("tool-"));
  return { text: raw, hasAttachment };
}

const ChatHistoryPanel = memo(function ChatHistoryPanel({
  messages,
  generatedAds,
  conversationCreatedAt,
  conversationUpdatedAt,
  onClose,
}: {
  messages: UIMessage[];
  generatedAds: GeneratedAd[];
  conversationCreatedAt?: string;
  conversationUpdatedAt?: string;
  onClose: () => void;
}) {
  const [filter, setFilter] = useState<HistoryFilter>("all");
  const [query, setQuery] = useState("");
  const timestampsRef = useRef<Map<string, number>>(new Map());
  const listRef = useRef<HTMLDivElement>(null);


  const entries = useMemo<HistoryEntry[]>(() => {
    const tsMap = timestampsRef.current;
    // Bounds for interpolation when messages have no per-message timestamp
    // (older conversations were saved without metadata.createdAt).
    const convStart = conversationCreatedAt ? Date.parse(conversationCreatedAt) : NaN;
    const convEnd = conversationUpdatedAt ? Date.parse(conversationUpdatedAt) : NaN;
    const hasBounds = Number.isFinite(convStart) && Number.isFinite(convEnd) && convEnd > convStart;
    const total = Math.max(1, messages.length - 1);
    const interpolate = (index: number): number => {
      if (!hasBounds) return Date.now();
      return convStart + Math.round(((convEnd - convStart) * index) / total);
    };
    const getTs = (key: string, fallback: unknown, index: number): number => {
      const existing = tsMap.get(key);
      if (existing) return existing;
      let ts: number | null = null;
      if (fallback instanceof Date) ts = fallback.getTime();
      else if (typeof fallback === "number" && Number.isFinite(fallback)) ts = fallback;
      else if (typeof fallback === "string") {
        const parsed = Date.parse(fallback);
        if (!Number.isNaN(parsed)) ts = parsed;
      }
      if (ts === null) ts = interpolate(index);
      tsMap.set(key, ts);
      return ts;
    };


    const items: HistoryEntry[] = [];
    const messageIds = new Set(messages.map((m) => m.id));
    const realGeneratedAds = orderGeneratedAdsForThread(generatedAds.filter(hasGeneratedMedia));
    const adsByAnchor = new Map<string, GeneratedAd[]>();
    const orphanAds: GeneratedAd[] = [];
    for (const ad of realGeneratedAds) {
      if (ad.afterMessageId && messageIds.has(ad.afterMessageId)) {
        const arr = adsByAnchor.get(ad.afterMessageId) ?? [];
        arr.push(ad);
        adsByAnchor.set(ad.afterMessageId, arr);
      } else {
        orphanAds.push(ad);
      }
    }
    let userCount = 0;
    let assistantCount = 0;
    for (let mi = 0; mi < messages.length; mi += 1) {
      const m = messages[mi];
      const { text, hasAttachment } = summarizeMessageForHistory(m);
      const role: "user" | "assistant" = m.role === "user" ? "user" : "assistant";
      const msgCreatedAt =
        (m as unknown as { createdAt?: unknown }).createdAt ??
        (m as unknown as { metadata?: { createdAt?: unknown } }).metadata?.createdAt;
      if (text) {
        if (role === "user") userCount += 1;
        else assistantCount += 1;
        items.push({
          kind: "message",
          id: m.id,
          role,
          label: role === "user" ? `Vous · #${userCount}` : `Assistant · #${assistantCount}`,
          snippet: text.length > 140 ? `${text.slice(0, 140)}…` : text,
          anchorId: `msg-${m.id}`,
          hasAttachment,
          createdAt: getTs(`msg-${m.id}`, msgCreatedAt, mi),
        });
      }
      for (const ad of adsByAnchor.get(m.id) ?? []) {
        items.push({
          kind: "creation",
          id: ad.id,
          role: "assistant",
          label: ad.kind === "video" ? "Vidéo générée" : ad.kind === "carousel" ? "Carrousel généré" : "Image générée",
          snippet: ad.title || "Création IA",
          anchorId: `ad-${ad.id}`,
          ad,
          createdAt: getTs(`ad-${ad.id}`, ad.createdAt, mi),
        });
      }
    }
    for (const ad of orphanAds) {
      items.push({
        kind: "creation",
        id: ad.id,
        role: "assistant",
        label: ad.kind === "video" ? "Vidéo générée" : ad.kind === "carousel" ? "Carrousel généré" : "Image générée",
        snippet: ad.title || "Création IA",
        anchorId: `ad-${ad.id}`,
        ad,
        createdAt: getTs(`ad-${ad.id}`, ad.createdAt, messages.length - 1),
      });
    }
    // Trier par timestamp décroissant (les plus récents en haut) pour éviter
    // que l'ordre d'insertion n'écrase la vraie chronologie.
    items.sort((a, b) => b.createdAt - a.createdAt);
    return items;
  }, [messages, generatedAds, conversationCreatedAt, conversationUpdatedAt]);



  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return entries.filter((e) => {
      // Filtre par type - strict et exclusif
      switch (filter) {
        case "user":
          if (!(e.kind === "message" && e.role === "user")) return false;
          break;
        case "assistant":
          if (!(e.kind === "message" && e.role === "assistant")) return false;
          break;
        case "creations":
          if (e.kind !== "creation") return false;
          break;
        case "all":
        default:
          break;
      }
      if (!q) return true;
      return `${e.label} ${e.snippet}`.toLowerCase().includes(q);
    });
  }, [entries, filter, query]);


  const counts = useMemo(() => {
    let user = 0;
    let assistant = 0;
    let creations = 0;
    for (const e of entries) {
      if (e.kind === "creation") creations += 1;
      else if (e.role === "user") user += 1;
      else assistant += 1;
    }
    return { all: entries.length, user, assistant, creations };
  }, [entries]);

  const tabs: Array<{ id: HistoryFilter; label: string; count: number }> = [
    { id: "all", label: "Tout", count: counts.all },
    { id: "user", label: "Vous", count: counts.user },
    { id: "assistant", label: "IA", count: counts.assistant },
    { id: "creations", label: "Créas", count: counts.creations },
  ];

  useEffect(() => {
    listRef.current?.scrollTo({ top: 0 });
  }, [filter, query]);

  const switchFilter = (next: HistoryFilter) => {
    setFilter(next);
  };

  const emptyLabel =
    entries.length === 0
      ? "L'historique apparaît ici au fil du chat."
      : filter === "creations"
        ? "Aucune créa générée."
        : "Aucun résultat.";

  return (
    <aside className="hidden h-full w-80 shrink-0 flex-col border-l border-border/60 bg-muted/20 md:flex">
      <div className="flex items-center gap-1 border-b border-border/60 px-3 pt-2 pb-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => switchFilter(t.id)}
            aria-pressed={filter === t.id}
            className={`inline-flex flex-1 items-center justify-center gap-1 rounded-full px-2 py-1 text-[11px] font-medium transition ${
              filter === t.id
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-background hover:text-foreground"
            }`}
          >
            <span>{t.label}</span>
            <span className={`rounded-full px-1.5 text-[10px] ${filter === t.id ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"}`}>
              {t.count}
            </span>
          </button>
        ))}
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border/60 bg-background text-muted-foreground transition hover:bg-accent hover:text-foreground"
          aria-label="Fermer l'historique"
          title="Fermer l'historique"
        >
          <PanelRightClose className="h-4 w-4" />
        </button>
      </div>

      <div className="px-3 pb-2">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher dans le chat…"
            className="h-8 rounded-lg border-border/60 bg-background pl-8 text-xs dark:bg-muted/40"
          />
        </div>
      </div>


      <div ref={listRef} className="flex-1 overflow-y-auto px-2 pb-4">
        {filtered.length === 0 ? (
          <div className="px-2 py-6 text-center text-xs text-muted-foreground">
            {emptyLabel}
          </div>
        ) : (
          <ol key={filter} className="relative space-y-1.5 pl-4">
            <span className="pointer-events-none absolute left-1.5 top-1 bottom-1 w-px bg-border/60" />
            {filtered.map((e, entryIndex) => {
              const isCreation = e.kind === "creation";
              const isUser = !isCreation && e.role === "user";
              const KindIcon = isCreation
                ? e.ad.kind === "video"
                  ? Video
                  : e.ad.kind === "carousel"
                    ? Layers
                    : ImageIcon
                : isUser
                  ? UserIcon
                  : Sparkles;
              const dotClass = isCreation
                ? "bg-fuchsia-500"
                : isUser
                  ? "bg-primary"
                  : "bg-emerald-500";
              const thumb = isCreation
                ? (e.ad.kind !== "video" ? (e.ad.url ?? e.ad.urls?.[0] ?? null) : null)
                : null;
              return (
                <li key={`${filter}-${e.kind}-${e.id}-${entryIndex}`} className="relative">
                  <span className={`absolute -left-[9px] top-3 h-2 w-2 rounded-full ring-2 ring-background ${dotClass}`} />
                  <button
                    type="button"
                    onClick={() => scrollToAnchor(e.anchorId)}
                    className="group flex w-full items-start gap-2 rounded-lg border border-transparent px-2 py-1.5 text-left transition hover:border-border/70 hover:bg-background"
                  >
                    {thumb ? (
                      <img
                        src={thumb}
                        alt=""
                        className="mt-0.5 h-9 w-9 shrink-0 rounded-md object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${
                        isCreation
                          ? "bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-300"
                          : isUser
                            ? "bg-primary/10 text-primary"
                            : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300"
                      }`}>
                        <KindIcon className="h-3.5 w-3.5" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        <span className="truncate">{e.label}</span>
                        {e.kind === "message" && e.hasAttachment && (
                          <Paperclip className="h-2.5 w-2.5 text-muted-foreground/70" />
                        )}
                        <span className="ml-auto shrink-0 font-normal normal-case tracking-normal text-[10px] text-muted-foreground/80 tabular-nums">
                          {formatHistoryTime(e.createdAt)}
                        </span>
                      </div>
                      <div className="mt-0.5 line-clamp-2 text-xs text-foreground/90 group-hover:text-foreground">
                        {e.snippet}
                      </div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </aside>
  );
});





function PromptPreviewCard({
  preview,
  editable,
  onChangeEditable,
  onConfirm,
  onQualityChange,
  onCancel,
  onRegenerate,
  regenerating,
  generating,
  costCredits,
}: {
  preview: {
    mediaType: "video" | "image" | "carousel";
    userLanguagePrompt: string;
    aspectRatio?: string;
    recommendedStyle?: string;
    recommendedDuration?: number;
    videoQuality?: "standard" | "premium";
    prompts: string[];
  };
  editable: string;
  onChangeEditable: (s: string) => void;
  onConfirm: () => void;
  onQualityChange: (quality: "standard" | "premium") => void;
  onCancel: () => void;
  onRegenerate: () => void;
  regenerating: boolean;
  generating: boolean;
  costCredits?: number | null;
}) {
  const kindLabel =
    preview.mediaType === "video" ? "Vidéo" : preview.mediaType === "carousel" ? "Carrousel" : "Image";
  const STYLE_LABELS: Record<string, string> = { ugc: "UGC face caméra", cinematic: "Cinématique", motion_design: "Motion design", image_animation: "Animation d'image" };
  const quality = preview.videoQuality ?? "standard";
  const fmtCredits = (n: number) => n.toLocaleString("fr-FR");
  const meta = [
    preview.aspectRatio ? `Format ${preview.aspectRatio}` : null,
    preview.mediaType === "video" && preview.recommendedDuration ? `${preview.recommendedDuration} s` : null,
  ].filter(Boolean).join(" · ");
  return (
    <div className="gx-kard gx-prompt">
      <div className="gx-kh">
        <b>Aperçu du prompt · {kindLabel}</b>
        {meta ? <span className="gx-kh-m">{meta}</span> : null}
        <small>Tu vois exactement ce qui sera généré avant de dépenser des crédits.</small>
      </div>
      {preview.mediaType === "video" ? (
        <div className="gx-pills" aria-label="Type de vidéo choisi à partir du brief">
          {Object.entries(STYLE_LABELS).map(([key, label]) => (
            <span
              key={key}
              className={preview.recommendedStyle === key ? "gx-on" : undefined}
              aria-current={preview.recommendedStyle === key ? "true" : undefined}
              title={preview.recommendedStyle === key ? "Type retenu à partir du brief" : "Pour changer de type, demande-le dans le chat"}
            >
              {label}
            </span>
          ))}
        </div>
      ) : preview.recommendedStyle ? (
        <div className="gx-pills">
          <span className="gx-on">{STYLE_LABELS[preview.recommendedStyle] ?? preview.recommendedStyle}</span>
        </div>
      ) : null}
      {generating && (
        <p className="gx-note gx-note-on">
          <Loader2 className="gx-i animate-spin" />
          Génération en cours — ce prompt est verrouillé jusqu'à la fin.
        </p>
      )}
      <textarea
        value={editable}
        onChange={(e) => onChangeEditable(e.target.value)}
        disabled={generating}
        className="gx-pp"
        aria-label="Prompt modifiable"
        spellCheck={false}
        placeholder="Le prompt IA apparaît ici…"
      />
      {preview.mediaType === "video" && (
        <div className="gx-eng" role="radiogroup" aria-label="Qualité et prix de la vidéo">
          <button type="button" disabled={generating} onClick={() => onQualityChange("standard")} role="radio" aria-checked={quality === "standard"} aria-pressed={quality === "standard"}>
            <b>Standard</b>
            <small>⚡{fmtCredits(300)}{preview.recommendedDuration ? ` · ${preview.recommendedDuration} s` : ""}</small>
          </button>
          <button type="button" disabled={generating} onClick={() => onQualityChange("premium")} role="radio" aria-checked={quality === "premium"} aria-pressed={quality === "premium"}>
            <b>Cinématique premium</b>
            <small>⚡{fmtCredits(1334)}</small>
          </button>
        </div>
      )}
      {(() => {
        const hasEdits = editable.trim() !== (preview.userLanguagePrompt ?? "").trim();
        return (
          <>
            {hasEdits && (
              <p className="gx-note gx-note-on">
                ✎ Tu as modifié le prompt - clique sur « Valider mes corrections » pour l'utiliser tel quel.
              </p>
            )}
            {preview.mediaType === "carousel" && preview.prompts.length > 1 && (
              <details className="gx-pp-more">
                <summary>
                  Voir les {preview.prompts.length} prompts de slides
                </summary>
                <ol>
                  {preview.prompts.map((p, i) => (
                    <li key={i}>
                      <b>Slide {i + 1} :</b> {p}
                    </li>
                  ))}
                </ol>
              </details>
            )}
            <div className="gx-kf">
              <button
                type="button"
                className="gx-btn gx-sm gx-pri"
                onClick={onConfirm}
                disabled={generating || regenerating || !editable.trim()}
                title="Utilise ton texte mot pour mot, sans passer par l'IA"
              >
                {generating ? <Loader2 className="gx-i animate-spin" /> : null}
                {generating ? "Génération…" : hasEdits ? "Valider mes corrections & générer" : "Générer tel quel"}
                {!generating && typeof costCredits === "number" && costCredits > 0 ? (
                  <span aria-label={`${costCredits} crédit${costCredits > 1 ? "s" : ""}`}>· ⚡{fmtCredits(costCredits)}</span>
                ) : null}
              </button>
              <button
                type="button"
                className="gx-btn gx-sm"
                onClick={() => {
                  if (hasEdits && !window.confirm("Reformuler écrasera tes modifications. Continuer ?")) return;
                  onRegenerate();
                }}
                disabled={generating || regenerating}
                title={hasEdits ? "⚠️ Écrasera tes modifications" : "Laisse l'IA réécrire le prompt à partir du brief"}
              >
                {regenerating ? <Loader2 className="gx-i animate-spin" /> : null}
                Reformuler avec l'IA · ⚡1
              </button>
              <button
                type="button"
                className="gx-btn gx-sm gx-ghost"
                onClick={onCancel}
                disabled={generating}
              >
                Annuler
              </button>
            </div>
          </>
        );
      })()}
    </div>
  );
}


function BriefChips({ state }: { state: Record<string, unknown> }) {

  const chips: Array<{ label: string; value: string }> = [];
  if (state.mediaType) chips.push({ label: "Format", value: String(state.mediaType) });
  if (state.styleOverride) chips.push({ label: "Style", value: String(state.styleOverride) });
  if (state.language) chips.push({ label: "Langue", value: String(state.language) });
  if (state.preferredSlideCount)
    chips.push({ label: "Slides", value: String(state.preferredSlideCount) });
  const productImages = Array.isArray(state.productImages)
    ? (state.productImages as unknown[]).filter((s): s is string => typeof s === "string")
    : [];
  if (productImages.length > 0) {
    chips.push({ label: "Image produit", value: `${productImages.length} 📎` });
  }
  if (chips.length === 0) return null;

  return (
    <div className="border-b border-border/40 bg-muted/30 px-4 py-2">
      <div className="mx-auto flex max-w-3xl flex-wrap gap-1.5">
        {chips.map((c) => (
          <span
            key={c.label}
            className="inline-flex items-center gap-1 rounded-full bg-background px-2.5 py-1 text-[11px] shadow-sm"
          >
            <span className="text-muted-foreground">{c.label} :</span>
            <span className="font-medium">{c.value}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
type QuickAction = {
  id: string;
  label: string;
  hint: string;
  icon: React.ComponentType<{ className?: string }>;
  prompt: string;
};

const QUICK_ACTIONS: Array<QuickAction & { iconClass: string }> = [
  { id: "create", label: "Créer une pub", hint: "Décris ton idée, je trouve le format et l'angle", icon: Sparkles, iconClass: "bg-primary/10 text-primary group-hover:bg-primary/15", prompt: "Je veux créer une publicité pour mon produit." },
  { id: "url", label: "Depuis une URL", hint: "Colle un lien produit, je génère tout le créatif", icon: Link2, iconClass: "bg-primary/10 text-primary group-hover:bg-primary/15", prompt: "Voici l'URL de mon produit, crée une pub complète à partir de cette page : " },
  { id: "analyze", label: "Analyser mes pubs", hint: "Voir ce qui performe et ce qui mérite d'être testé", icon: TrendingUp, iconClass: "bg-amber-500/10 text-amber-600 group-hover:bg-amber-500/15 dark:bg-amber-400/15 dark:text-amber-300", prompt: "Analyse mes pubs et dis-moi ce qui performe le mieux, ce qui fatigue et quoi tester ensuite." },
  { id: "launch-retargeting", label: "Retargeting visiteurs", hint: "Relancer ceux qui ont visité sans acheter", icon: Target, iconClass: "bg-fuchsia-500/10 text-fuchsia-600 group-hover:bg-fuchsia-500/15 dark:bg-fuchsia-400/15 dark:text-fuchsia-300", prompt: "Je veux lancer une campagne de retargeting pour les visiteurs qui n'ont pas acheté." },
];


function EmptyChatHero({ onSuggestion }: { onSuggestion: (text: string) => void }) {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center px-4 pb-10 pt-8 text-center">
      <div className="bg-grad mb-5 flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-elegant">
        <Sparkles className="h-7 w-7" />
      </div>
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
        Que veux-tu créer aujourd'hui&nbsp;?
      </h1>

      <div className="mt-10 w-full text-left">
        <div className="grid grid-cols-1 items-stretch gap-2 sm:grid-cols-2">
          {QUICK_ACTIONS.map((a) => {
            const Icon = a.icon;
            return (
              <button
                key={a.id}
                type="button"
                onClick={() => onSuggestion(a.prompt)}
                className="group flex h-full min-h-[84px] items-start gap-3 rounded-2xl border border-border/70 bg-background/60 p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-primary/60 hover:bg-primary/[0.06] hover:shadow-md"
              >
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition ${a.iconClass}`}>
                  <Icon className="h-4 w-4" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium leading-snug text-foreground">
                    {a.label}
                  </div>
                  <div className="mt-0.5 text-xs leading-snug text-muted-foreground">
                    {a.hint}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}


const SUGGESTIONS_RE = /<!--suggestions:(\[[^\]]*\])-->/;
const PREFILL_RE = /<!--prefill:([^>]*?)-->/;
const PREFILL_LOCKED_RE = /<!--prefill-locked:([^>]*?)-->/;


// Style visual thumbnails (SVG mockups) - helps non-technical users understand
// what a "packshot", "flat lay" or "studio produit" actually looks like.
function StyleThumb({ variant }: { variant: "studio" | "lifestyle" | "before-after" | "packshot" | "flatlay" | "ugc" | "motion" | "cinematic" | "generic" }) {
  const base = "h-10 w-10 shrink-0 rounded-lg overflow-hidden ring-1 ring-black/5 dark:ring-white/10";
  switch (variant) {
    case "studio":
      return (
        <div className={`${base} bg-gradient-to-b from-neutral-100 to-neutral-300 dark:from-neutral-700 dark:to-neutral-900 relative`}>
          <div className="absolute inset-x-2 bottom-1.5 h-4 rounded-sm bg-neutral-800/80 dark:bg-neutral-200/80" />
        </div>
      );
    case "lifestyle":
      return (
        <div className={`${base} relative bg-gradient-to-br from-warning/50 via-destructive/30 to-primary/60`}>
          <div className="absolute inset-x-1 bottom-1 h-3 rounded-sm bg-black/25" />
          <div className="absolute left-2 top-1.5 h-2 w-2 rounded-full bg-yellow-200/90" />
        </div>
      );
    case "before-after":
      return (
        <div className={`${base} relative flex`}>
          <div className="w-1/2 bg-neutral-400 dark:bg-neutral-600" />
          <div className="w-1/2 bg-gradient-to-br from-primary to-fuchsia-500" />
          <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-white/70" />
        </div>
      );
    case "packshot":
      return (
        <div className={`${base} relative bg-white dark:bg-neutral-100 flex items-center justify-center`}>
          <div className="h-6 w-4 rounded-sm bg-gradient-to-b from-primary to-fuchsia-500 shadow" />
        </div>
      );
    case "flatlay":
      return (
        <div className={`${base} relative bg-amber-50 dark:bg-amber-100/90 grid grid-cols-3 grid-rows-3 gap-0.5 p-1`}>
          <div className="rounded-sm bg-rose-400/80" />
          <div className="rounded-sm bg-emerald-400/80" />
          <div className="rounded-sm bg-primary/80" />
          <div className="rounded-sm bg-amber-400/80" />
          <div className="rounded-sm bg-neutral-800/70" />
          <div className="rounded-sm bg-fuchsia-400/80" />
          <div className="rounded-sm bg-sky-400/80" />
          <div className="rounded-sm bg-orange-400/80" />
          <div className="rounded-sm bg-teal-400/80" />
        </div>
      );
    case "ugc":
      // Mini "selfie face caméra" : buste + tête + petit micro / point rouge REC
      return (
        <div className={`${base} relative bg-gradient-to-br from-rose-200 via-orange-200 to-amber-200 dark:from-rose-500/30 dark:via-orange-500/25 dark:to-amber-500/25`}>
          <div className="absolute left-1/2 top-1.5 h-3 w-3 -translate-x-1/2 rounded-full bg-neutral-800/85 dark:bg-neutral-100/90" />
          <div className="absolute inset-x-1.5 bottom-1 h-3 rounded-t-full bg-neutral-800/85 dark:bg-neutral-100/90" />
          <div className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-red-500 shadow-[0_0_4px_rgba(239,68,68,0.7)]" />
        </div>
      );
    case "motion":
      // Formes géométriques animées façon motion design
      return (
        <div className={`${base} relative bg-neutral-900 dark:bg-neutral-950`}>
          <div className="absolute left-1 top-1 h-3 w-3 rounded-sm bg-fuchsia-500 rotate-12" />
          <div className="absolute right-1 top-2 h-2.5 w-2.5 rounded-full bg-cyan-400" />
          <div className="absolute bottom-1 left-1/2 h-0 w-0 -translate-x-1/2 border-b-[8px] border-l-[6px] border-r-[6px] border-b-yellow-400 border-l-transparent border-r-transparent" />
          <div className="absolute bottom-1.5 right-1 h-2 w-4 rounded-full bg-primary/80" />
        </div>
      );
    case "cinematic":
      // Bandes noires cinéma + halo lumineux "grade" cinéma
      return (
        <div className={`${base} relative bg-gradient-to-br from-primary/80 via-studio-panel to-studio`}>
          <div className="absolute inset-x-0 top-0 h-1.5 bg-black" />
          <div className="absolute inset-x-0 bottom-0 h-1.5 bg-black" />
          <div className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-300/50 blur-[3px]" />
          <div className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-100" />
        </div>
      );
    default:
      return (
        <div className={`${base} flex items-center justify-center bg-gradient-to-br from-primary/20 to-fuchsia-500/20`}>
          <Sparkles className="h-4 w-4 text-primary/70" />
        </div>
      );
  }
}

// Retire l'emoji de tête d'un libellé quand une icône est déjà affichée.
function stripLeadingEmoji(label: string): string {
  const out = label.replace(/^[\s\p{Extended_Pictographic}\p{Emoji_Presentation}\uFE0F\u200D\u20E3]+/u, "").trim();
  return out || label;
}

type SuggestionVisual = {
  node: React.ReactNode;
  wrapperClass?: string; // when null we render node as-is (thumbnail)
  isThumbnail?: boolean;
};

function getSuggestionVisual(text: string): SuggestionVisual | null {
  const t = text.toLowerCase();

  // Style visuel - priorité aux thumbnails
  if (/packshot/.test(t)) return { node: <StyleThumb variant="packshot" />, isThumbnail: true };
  if (/flat.?lay/.test(t)) return { node: <StyleThumb variant="flatlay" />, isThumbnail: true };
  if (/avant.*apr[eè]s|before.*after|avant\/apr[eè]s/.test(t)) return { node: <StyleThumb variant="before-after" />, isThumbnail: true };
  if (/studio|fond neutre|fond blanc/.test(t)) return { node: <StyleThumb variant="studio" />, isThumbnail: true };
  if (/ugc|authentique|selfie|face cam[eé]ra|t[eé]moignage/.test(t)) return { node: <StyleThumb variant="ugc" />, isThumbnail: true };
  if (/motion.?design|animation|animé|anime\b|graphique/.test(t)) return { node: <StyleThumb variant="motion" />, isThumbnail: true };
  if (/cin[eé]matique|cinematic|premium|film[iq]|hollywood/.test(t)) return { node: <StyleThumb variant="cinematic" />, isThumbnail: true };
  if (/lifestyle|urbain|en situation|extérieur|exterieur/.test(t)) return { node: <StyleThumb variant="lifestyle" />, isThumbnail: true };

  const iconWrap = (tint: string, node: React.ReactNode): SuggestionVisual => ({
    node,
    wrapperClass: `flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${tint}`,
  });

  // Ratios
  if (/\b9\s*[:x]\s*16\b|vertical|reels|tiktok|stories?/.test(t))
    return iconWrap("bg-primary/10 text-primary", <RectangleVertical className="h-4 w-4" />);
  if (/\b1\s*[:x]\s*1\b|\bcarr[eé]\b|square|feed/.test(t))
    return iconWrap("bg-primary/10 text-primary", <Square className="h-4 w-4" />);
  if (/\b16\s*[:x]\s*9\b|horizontal|paysage|youtube/.test(t))
    return iconWrap("bg-primary/10 text-primary", <RectangleHorizontal className="h-4 w-4" />);
  if (/\b4\s*[:x]\s*5\b/.test(t))
    return iconWrap("bg-primary/10 text-primary", <RectangleVertical className="h-4 w-4" />);

  // Langues - drapeaux emoji
  const flag = (emoji: string): SuggestionVisual => ({
    node: <span className="text-2xl leading-none">{emoji}</span>,
    wrapperClass: "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted/60",
  });
  if (/fran[cç]ais|french/.test(t)) return flag("🇫🇷");
  if (/anglais|english/.test(t)) return flag("🇬🇧");
  if (/espagnol|spanish/.test(t)) return flag("🇪🇸");
  if (/allemand|german/.test(t)) return flag("🇩🇪");
  if (/italien|italian/.test(t)) return flag("🇮🇹");
  if (/portugais|portuguese|br[eé]silien/.test(t)) return flag("🇵🇹");
  if (/n[eé]erlandais|dutch/.test(t)) return flag("🇳🇱");
  if (/chinois|chinese|mandarin/.test(t)) return flag("🇨🇳");
  if (/japonais|japanese/.test(t)) return flag("🇯🇵");
  if (/cor[eé]en|korean/.test(t)) return flag("🇰🇷");

  // Types de contenu
  if (/carrousel|carousel|slides?/.test(t))
    return iconWrap("bg-fuchsia-500/10 text-fuchsia-600 dark:bg-fuchsia-400/15 dark:text-fuchsia-300", <Layers className="h-4 w-4" />);
  if (/\bvid[eé]o\b|clip/.test(t))
    return iconWrap("bg-rose-500/10 text-rose-600 dark:bg-rose-400/15 dark:text-rose-300", <Video className="h-4 w-4" />);
  if (/\bimage\b|visuel|photo/.test(t))
    return iconWrap("bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/15 dark:text-emerald-300", <ImageIcon className="h-4 w-4" />);

  // Durée
  if (/^\s*\d{1,3}\s*(s|sec|secondes?)\b|dur[eé]e/.test(t))
    return iconWrap("bg-teal-500/10 text-teal-600 dark:bg-teal-400/15 dark:text-teal-300", <Clock className="h-4 w-4" />);

  // Voix / audio
  if (/voix|voice.?over|sous.?titre/.test(t))
    return iconWrap("bg-primary/10 text-primary", <Captions className="h-4 w-4" />);

  // Vente en ligne : panier (avant la règle « audience », où « pro » capturait « produit »).
  // Options « comment fournir le produit » : une icône distincte par option.
  if (/continuer sans photo|sans photo/.test(t))
    return iconWrap("bg-muted text-muted-foreground", <ArrowRight className="h-4 w-4" />);
  if (/d[ée]crire ou uploader|importer des photos/.test(t))
    return iconWrap("bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/15 dark:text-emerald-300", <Upload className="h-4 w-4" />);
  if (/lien de la fiche|coller le lien/.test(t))
    return iconWrap("bg-sky-500/10 text-sky-600 dark:bg-sky-400/15 dark:text-sky-300", <Link2 className="h-4 w-4" />);
  if (/catalogue/.test(t))
    return iconWrap("bg-primary/10 text-primary", <FolderOpen className="h-4 w-4" />);
  if (/e[- ]?commerce|boutique en ligne|vente en ligne|\bproduits?\b/.test(t))
    return iconWrap("bg-orange-500/10 text-orange-600 dark:bg-orange-400/15 dark:text-orange-300", <ShoppingCart className="h-4 w-4" />);
  // Cible / audience
  if (/\b(jeune|senior|adulte|ado|teen|18\s*[--]|25\s*[--]|35\s*[--]|hommes?|femmes?|parents?|[eé]tudiants?|pro(fessionnel)?s?|entrepreneurs?|sportif|d[eé]butants?|expert)/.test(t))
    return iconWrap("bg-sky-500/10 text-sky-600 dark:bg-sky-400/15 dark:text-sky-300", <Users className="h-4 w-4" />);
  if (/\b(produit|service|marque|app(li(cation)?)?|site|boutique|e[- ]?commerce|saas|abonnement|formation|coaching|[eé]v[eé]nement|promotion|offre|soldes?)\b/.test(t))
    return iconWrap("bg-orange-500/10 text-orange-600 dark:bg-orange-400/15 dark:text-orange-300", <Megaphone className="h-4 w-4" />);

  // Promesse / bénéfices
  if (/\b(gagn|[eé]conomis|rapide|facile|simple|meilleur|garanti|r[eé]sultats?|transform|boost|augment|r[eé]duire|prot[eé]g|efficac|puissant)/.test(t))
    return iconWrap("bg-yellow-500/10 text-yellow-600 dark:bg-yellow-400/15 dark:text-yellow-300", <Zap className="h-4 w-4" />);
  if (/\b(prix|pas\s*cher|abordable|remise|discount|-?\d+\s*%|solde)/.test(t))
    return iconWrap("bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/15 dark:text-emerald-300", <Gift className="h-4 w-4" />);
  if (/\b(luxe|exclusif|haut de gamme|prestige|elite)/.test(t))
    return iconWrap("bg-amber-500/10 text-amber-600 dark:bg-amber-400/15 dark:text-amber-300", <Crown className="h-4 w-4" />);

  // Fallback : garantit qu'une liste de choix soit toujours homogène (100 %
  // icônes / vignettes), jamais un mélange partiel - règle projet.
  return iconWrap(
    "bg-muted/60 text-muted-foreground",
    <Sparkles className="h-4 w-4" />,
  );
}

/**
 * Harmonise une liste de choix : soit toutes les options ont une vignette
 * image, soit toutes ont une icône - jamais un mélange.
 * Pour la question « style visuel », on force la vignette partout.
 */
function getSuggestionVisuals(list: string[]): SuggestionVisual[] {
  const visuals = list.map((s) => getSuggestionVisual(s) ?? { node: null });
  const anyThumb = visuals.some((v) => v.isThumbnail);
  if (!anyThumb) return visuals;
  return visuals.map((v) =>
    v.isThumbnail ? v : { node: <StyleThumb variant="generic" />, isThumbnail: true },
  );
}



type ChatComposerHandle = { focus: () => void; setValue: (v: string, opts?: { lockedPrefix?: string }) => void };

const ChatComposer = memo(
  forwardRef<
    ChatComposerHandle,
    {
      disabled: boolean;
      isStreaming?: boolean;
      onStop?: () => void;
      uploadingImage: boolean;
      hasPendingImages: boolean;
      onPickFile: () => void;
      onOpenCatalog?: () => void;
      onOpenCatalogTab?: (tab: "avatars" | "products" | "actors") => void;
      onOpenCampaigns?: () => void;
      onOpenContinueVideo?: () => void;
      onOpenCreations?: () => void;
      onSend: (text: string) => void;
    }
  >(function ChatComposer({ disabled, isStreaming, onStop, uploadingImage, hasPendingImages, onPickFile, onOpenCreations, onOpenCatalogTab, onOpenCampaigns, onOpenContinueVideo, onSend }, ref) {
    const { language } = useAppLanguage();
    const [input, setInput] = useState("");
    const [lockedPrefix, setLockedPrefix] = useState("");
    const areaRef = useRef<HTMLTextAreaElement>(null);
    const recognitionRef = useRef<any>(null);
    const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [speechSupported, setSpeechSupported] = useState(false);
    const [listening, setListening] = useState(false);
    const dictatedBaseRef = useRef("");
    useEffect(() => {
      const SpeechRecognition = (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition;
      setSpeechSupported(Boolean(SpeechRecognition));
      return () => {
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        recognitionRef.current?.stop?.();
      };
    }, []);

    const stopDictation = useCallback(() => {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
      recognitionRef.current?.stop?.();
      recognitionRef.current = null;
      setListening(false);
    }, []);

    const toggleDictation = useCallback(() => {
      if (listening) return stopDictation();
      const Recognition = (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition;
      if (!Recognition) return;
      const recognition = new Recognition();
      recognition.lang = language === "en" ? "en-US" : "fr-FR";
      recognition.interimResults = true;
      recognition.continuous = true;
      dictatedBaseRef.current = input.trimEnd();
      recognition.onresult = (event: any) => {
        let transcript = "";
        for (let i = 0; i < event.results.length; i += 1) transcript += event.results[i]?.[0]?.transcript ?? "";
        const base = dictatedBaseRef.current;
        setInput(`${base}${base && transcript ? " " : ""}${transcript}`);
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = setTimeout(stopDictation, 3000);
      };
      recognition.onerror = (event: any) => {
        stopDictation();
        toast.error(event?.error === "not-allowed" ? "L’accès au micro a été refusé. Autorise le micro dans ton navigateur." : "La dictée vocale n’est pas disponible pour le moment.");
      };
      recognition.onend = () => setListening(false);
      recognitionRef.current = recognition;
      setListening(true);
      try { recognition.start(); } catch { stopDictation(); }
    }, [input, language, listening, stopDictation]);
    useImperativeHandle(ref, () => ({
      focus: () => areaRef.current?.focus(),
      setValue: (v: string, opts?: { lockedPrefix?: string }) => {
        const prefix = opts?.lockedPrefix ?? "";
        setLockedPrefix(prefix);
        setInput(prefix ? "" : v);
        requestAnimationFrame(() => {
          const el = areaRef.current;
          if (!el) return;
          el.focus();
          el.setSelectionRange(el.value.length, el.value.length);
        });
      },
    }), []);

    const submit = () => {
      let text = (lockedPrefix || "") + input;
      if (!text.trim() && !hasPendingImages) return;
      if (lockedPrefix && !input.trim()) return;
      const campSel = getActiveCampaignSelection();
      if (campSel.length > 0 && text.trim()) {
        const names = campSel.map((c) => `« ${c.name} »`).join(", ");
        text = `${text}\n<!--selected-campaigns:${JSON.stringify(campSel)}-->\n<!--Campagne(s) actuellement cochée(s) par le client dans le tableau : ${names}. « celle-là / cette campagne » désigne ces campagnes, prioritaires sur tout autre contexte.-->`;
      }
      setInput("");
      setLockedPrefix("");
      if (areaRef.current) areaRef.current.style.height = "auto";
      onSend(text);
    };

    const canSubmit = lockedPrefix ? !!input.trim() : (!!input.trim() || hasPendingImages);

    return (
      <div
        className={`gx-composer group/composer relative flex flex-col gap-1.5 px-3 pt-2 pb-1.5 ${
          disabled && !isStreaming
            ? "border-border/60 opacity-90"
            : "border-border/70 focus-within:border-primary/60 focus-within:shadow-xl focus-within:ring-2 focus-within:ring-primary/20 dark:border-white/10 dark:focus-within:border-primary/50 dark:focus-within:ring-primary/25"
        }`}
      >
        <div className="flex items-start px-3 py-1.5">
          {lockedPrefix ? (
            <span className="flex shrink-0 select-none items-center gap-1 text-[15px] font-semibold leading-6 text-primary">
              <Lock className="h-3 w-3 shrink-0 opacity-70" />
              {lockedPrefix}
            </span>
          ) : null}
          <Textarea
            ref={areaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (!isStreaming) submit();
              }
            }}
            placeholder={lockedPrefix ? "Complète le nom de la campagne…" : isStreaming ? "L'IA répond…" : "Écris ton message…"}
            rows={1}
            style={{ fieldSizing: "content" } as React.CSSProperties}
            className={lockedPrefix
              ? "max-h-56 min-h-0 min-w-[12ch] flex-1 resize-none overflow-y-auto border-0 bg-transparent p-0 text-[15px] leading-6 placeholder:text-muted-foreground/70 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
              : "max-h-56 min-h-0 w-full resize-none overflow-y-auto border-0 bg-transparent p-0 text-[15px] leading-6 placeholder:text-muted-foreground/70 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"}
          />
        </div>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
                  disabled={disabled || uploadingImage}
                  aria-label="Ajouter du contenu"
                  title="Ajouter du contenu"
                >
                  {uploadingImage ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-60">
                <DropdownMenuItem onClick={onPickFile}>
                  <Paperclip className="mr-2 h-4 w-4" /> Importer une image ou une vidéo
                </DropdownMenuItem>
                {onOpenCreations && (
                  <DropdownMenuItem onClick={onOpenCreations}>
                    <ImageIcon className="mr-2 h-4 w-4" /> Importer depuis mes créations
                  </DropdownMenuItem>
                )}
                {onOpenCatalogTab && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onOpenCatalogTab("products")}>
                      <Package className="mr-2 h-4 w-4" /> Mes produits
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onOpenCatalogTab("actors")}>
                      <Users className="mr-2 h-4 w-4" /> Acteurs UGC
                    </DropdownMenuItem>
                  </>
                )}
                {onOpenContinueVideo && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={onOpenContinueVideo}>
                      <Film className="mr-2 h-4 w-4" /> Prolonger une de mes vidéos
                    </DropdownMenuItem>
                  </>
                )}
                {onOpenCampaigns && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={onOpenCampaigns}>
                      <Megaphone className="mr-2 h-4 w-4" /> Mes campagnes Meta
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="ml-auto flex items-center gap-1">
          {speechSupported && !isStreaming && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={toggleDictation}
              className={`h-8 w-8 shrink-0 rounded-full ${listening ? "animate-pulse bg-destructive text-destructive-foreground hover:bg-destructive/90" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
              aria-label={listening ? "Arrêter la dictée" : "Dicter un message"}
              title={listening ? "Écoute en cours… clique pour arrêter" : "Dicter un message"}
            >
              <Mic className="h-4 w-4" />
            </Button>
          )}
          {isStreaming ? (
            <Button
              type="button"
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full p-0 bg-foreground text-background hover:bg-foreground/90 shadow-elegant"
              onClick={() => onStop?.()}
              aria-label="Arrêter la génération"
              title="Arrêter"
            >
              <Square className="h-3.5 w-3.5 fill-current" />
            </Button>
          ) : (
            <Button
              className="bg-grad inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full p-0 text-white shadow-elegant hover:opacity-90 disabled:opacity-40"
              onClick={submit}
              disabled={disabled || !canSubmit}
              aria-label="Envoyer"
              title="Envoyer"
            >
              <Send className="h-3.5 w-3.5" />
            </Button>
          )}
          </div>
        </div>
      </div>
    );
  }),
);

function SuggestionList({
  messageId,
  suggestions,
  visuals,
  locked,
  logos,
  onSuggestion,
}: {
  messageId: string;
  suggestions: string[];
  visuals: ReturnType<typeof getSuggestionVisuals>;
  locked: boolean;
  logos?: Map<string, string>;
  onSuggestion: (text: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [scheduling, setScheduling] = useState(false);
  const [when, setWhen] = useState("");
  const [freeText, setFreeText] = useState<string | null>(null);
  const [freeTextValue, setFreeTextValue] = useState("");

  const searchable = suggestions.length >= 4;
  const q = query.trim().toLowerCase();
  const allItems = suggestions
    .map((s, i) => ({ s, i }))
    .filter(({ s }) => !q || s.toLowerCase().includes(q));

  // Les boutons de création de formulaire sont épinglés SOUS la liste
  // défilante : ils doivent rester visibles en permanence, sans scroll.
  const isFormCreateLabel = (s: string) => /cr[ée]er\s+(?:un\s+nouveau\s+)?formulaire/i.test(s);
  const items = allItems.filter(({ s }) => !isFormCreateLabel(s));
  const pinnedItems = allItems.filter(({ s }) => isFormCreateLabel(s));

  const isScheduleLabel = (s: string) => /planifi/i.test(s) && /(date|heure)/i.test(s);
  // « Autre — je précise », « Autre (préciser) »… : on ouvre un champ libre
  // au lieu d'envoyer le libellé du bouton tel quel.
  const isFreeTextLabel = (s: string) =>
    /^\s*(?:✏️|✍️|➕)?\s*autre\b/i.test(s) || /je\s+pr[ée]cise|pr[ée]ciser|autre\s*chose/i.test(s);

  const confirmFreeText = () => {
    const v = freeTextValue.trim();
    if (!v) return;
    setFreeText(null);
    setFreeTextValue("");
    onSuggestion(v);
  };


  const confirmSchedule = () => {
    if (!when) return;
    const d = new Date(when);
    if (Number.isNaN(d.getTime())) return;
    const label = d.toLocaleString("fr-FR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    onSuggestion(`Planifie le lancement le ${label} (heure du compte publicitaire) — startDate ISO: ${when}:00`);
    setScheduling(false);
  };

  const renderSuggestion = ({ s, i }: { s: string; i: number }) => {
    const visual = visuals[i];
    const logoUrl = logos?.get(s.trim().toLowerCase());
    const isMetaConfirm = /^confirmer et publier(?: sur meta)?$/i.test(s.trim());
    return (
      <button
        key={`${messageId}-sug-${i}`}
        type="button"
        disabled={locked}
        aria-disabled={locked || undefined}
        title={locked ? "Réponse déjà donnée - répondez à la nouvelle question ci-dessous." : undefined}
        onClick={(e) => {
          if (locked) return;
          if (isScheduleLabel(s)) {
            setScheduling(true);
            return;
          }
          if (isFreeTextLabel(s)) {
            setFreeText(s);
            setFreeTextValue("");
            return;
          }

          const el = e.currentTarget;
          el.classList.add("ring-2", "ring-primary/50", "bg-primary/10");
          window.setTimeout(() => onSuggestion(s), 120);
        }}
        className={
          locked
            ? "group flex w-full items-center justify-between gap-3 rounded-xl border border-dashed border-border/60 bg-muted/40 px-3.5 py-3 text-left opacity-55 cursor-not-allowed pointer-events-none select-none"
            : isMetaConfirm
              ? "group flex w-full items-center justify-between gap-3 rounded-xl border border-meta bg-meta px-3.5 py-3 text-left text-primary-foreground shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-meta/90 hover:shadow-md active:scale-[0.99]"
              : "group flex w-full items-center justify-between gap-3 rounded-xl border border-border bg-background px-3.5 py-3 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/60 hover:bg-primary/[0.06] hover:shadow-md active:scale-[0.99]"
        }
        style={
          locked
            ? undefined
            : {
                animation: "chat-suggestion-in 0.42s cubic-bezier(0.22, 1, 0.36, 1) both",
                animationDelay: `${Math.min(i, 8) * 60}ms`,
              }
        }
      >
        {isMetaConfirm ? (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-foreground/15">
            <MetaIcon className="h-5 w-5" />
          </div>
        ) : logoUrl ? (
          <img
            src={logoUrl}
            alt=""
            loading="lazy"
            className="h-9 w-9 shrink-0 rounded-full border border-border/60 object-cover"
          />
        ) : visual ? (
          visual.isThumbnail ? (
            visual.node
          ) : (
            <div className={visual.wrapperClass}>{visual.node}</div>
          )
        ) : null}
        <div className="min-w-0 flex-1">
          <div className={`break-words text-sm font-medium leading-snug ${locked ? "text-muted-foreground line-through decoration-muted-foreground/40" : isMetaConfirm ? "text-primary-foreground" : "text-foreground"}`}>
            {visual || logoUrl || isMetaConfirm ? stripLeadingEmoji(s) : s}
          </div>
        </div>
        {locked ? (
          <Lock className="h-4 w-4 shrink-0 text-muted-foreground/60" />
        ) : (
          <ArrowRight className={`h-4 w-4 shrink-0 transition group-hover:translate-x-0.5 ${isMetaConfirm ? "text-primary-foreground/80" : "text-primary/50 group-hover:text-primary"}`} />
        )}
      </button>
    );
  };

  return (
    <div
      className={`mt-3 min-w-0 max-w-full flex flex-col gap-2 ${
        suggestions.length >= 4
          ? "rounded-xl border border-border/60 bg-muted/20 p-2"
          : ""
      }`}
      aria-disabled={locked || undefined}
    >
      {searchable && !locked && (
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher…"
            className="h-9 bg-background pl-8 text-sm"
          />
        </div>
      )}

      {scheduling && !locked && (
        <div className="rounded-xl border border-primary/40 bg-primary/[0.04] p-3">
          <div className="mb-2 text-sm font-medium">Date et heure de lancement (fuseau du compte Meta)</div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              type="datetime-local"
              value={when}
              onChange={(e) => setWhen(e.target.value)}
              className="h-10 bg-background text-sm"
            />
            <div className="flex gap-2">
              <Button size="sm" className="h-10" disabled={!when} onClick={confirmSchedule}>
                Confirmer
              </Button>
              <Button size="sm" variant="ghost" className="h-10" onClick={() => setScheduling(false)}>
                Annuler
              </Button>
            </div>
          </div>
        </div>
      )}

      {freeText !== null && !locked && (
        <div className="rounded-xl border border-primary/40 bg-primary/[0.04] p-3">
          <div className="mb-2 text-sm font-medium">Précisez votre réponse</div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              autoFocus
              value={freeTextValue}
              onChange={(e) => setFreeTextValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") { e.preventDefault(); confirmFreeText(); }
                if (e.key === "Escape") { setFreeText(null); setFreeTextValue(""); }
              }}
              placeholder="Écrivez votre précision…"
              className="h-10 bg-background text-sm"
            />
            <div className="flex gap-2">
              <Button size="sm" className="h-10" disabled={!freeTextValue.trim()} onClick={confirmFreeText}>
                Envoyer
              </Button>
              <Button size="sm" variant="ghost" className="h-10" onClick={() => { setFreeText(null); setFreeTextValue(""); }}>
                Annuler
              </Button>
            </div>
          </div>
        </div>
      )}



      <div className={suggestions.length >= 4 ? "flex min-w-0 flex-col gap-2 overflow-x-hidden px-1.5 py-1.5" : "flex min-w-0 flex-col gap-2 px-0.5 py-0.5"}>
        {items.length === 0 && (
          <div className="px-2 py-3 text-center text-xs text-muted-foreground">Aucun résultat</div>
        )}
        {items.map(renderSuggestion)}
      </div>
      {pinnedItems.length > 0 && (
        <div className="flex min-w-0 flex-col gap-2 px-0.5 py-0.5">
          {pinnedItems.map(renderSuggestion)}
        </div>
      )}
    </div>
  );
}

const MessageBubble = memo(function MessageBubble({

  message,
  onSuggestion,
  onReply,
  onEdit,
  isStreaming = false,
  suggestionsLocked = false,
  pageLogos,
}: {
  message: UIMessage;
  onSuggestion: (text: string) => void;
  onReply?: (m: UIMessage) => void;
  onEdit?: (m: UIMessage) => void;
  isStreaming?: boolean;
  suggestionsLocked?: boolean;
  pageLogos?: Map<string, string>;
}) {

  const isUser = message.role === "user";
  const text = messageRawText(message);
  const handleReply = onReply ? () => onReply(message) : undefined;
  const handleEdit = onEdit && isUser ? () => onEdit(message) : undefined;


  let cleanText = text;
  let suggestions: string[] = [];
  const match = text.match(SUGGESTIONS_RE);
  if (match) {
    try {
      suggestions = oneQuestionAtATime(JSON.parse(match[1]));
      cleanText = text.replace(match[0], "").trim();
    } catch {
      /* ignore */
    }
  }
  const suggestionVisuals = getSuggestionVisuals(suggestions);
  // Aperçus visuels des créations choisies (marqueur interne)
  let pickedMedia: Array<{ t: string; u: string | null; k: string }> = [];
  const mediaMatch = cleanText.match(/<!--selected-media:(\[[^>]*?\])-->/);
  if (mediaMatch) {
    try { pickedMedia = JSON.parse(mediaMatch[1]); } catch { /* ignore */ }
  }
  // Vidéos importées : on n'affiche jamais l'URL, seulement un aperçu visuel.
  const videoMatch = cleanText.match(/<!--attached-videos:(\[[\s\S]*?\])-->/);
  if (videoMatch) {
    try {
      const parsed = JSON.parse(videoMatch[1]) as Array<{ u?: string; n?: string }>;
      for (const v of parsed) {
        if (v?.u) pickedMedia.push({ t: v.n ?? "Vidéo", u: v.u, k: "video" });
      }
    } catch { /* ignore */ }
  }
  // Audios importés : mini-lecteur dans la bulle, jamais l'URL.
  const attachedAudios: Array<{ url: string; name: string }> = [];
  const audioMatch = cleanText.match(/<!--attached-audios:(\[[\s\S]*?\])-->/);
  if (audioMatch) {
    try {
      const parsed = JSON.parse(audioMatch[1]) as Array<{ u?: string; n?: string }>;
      for (const a of parsed) {
        if (a?.u) attachedAudios.push({ url: a.u, name: a.n ?? "Audio" });
      }
    } catch { /* ignore */ }
  }
  // Campagne Meta jointe : on réaffiche la même carte dans le message envoyé.
  let attachedCampaign: PendingCampaign | null = null;
  const campaignMatch = cleanText.match(/<!--attached-campaign:(\{[\s\S]*?\})-->/);
  if (campaignMatch) {
    try { attachedCampaign = JSON.parse(campaignMatch[1]) as PendingCampaign; } catch { /* ignore */ }
  }
  const attachedCompetitorRefs = parseCompetitorRefs(cleanText) ?? [];
  cleanText = stripCompetitorRefs(cleanText);
  // Strip internal selection markers exchanged between UI and agent
  cleanText = cleanText
    .replace(/<!--selected-(?:creatives|campaign|media|meta-ad):[^>]*-->/g, "")
    .replace(/<!--attached-campaign:[\s\S]*?-->/g, "")
    .replace(/<!--attached-videos:[\s\S]*?-->/g, "")
    .replace(/<!--attached-audios:[\s\S]*?-->/g, "")
    .replace(/^\s*🎬\s*Vidéo jointe\s*:.*$/gim, "")
    .replace(/^\s*📣\s*Campagne Meta jointe\s*:.*$/gim, "")
    .replace(/^\s*🎧\s*Audio joint\s*:.*$/gim, "")
    .replace(PREFILL_LOCKED_RE, "")
    .replace(PREFILL_RE, "")
    .trim();
  cleanText = stripTechnicalMarkers(cleanText);
  // Options déjà affichées en boutons : on retire leurs répétitions dans le texte.
  if (!isUser && suggestions.length) {
    const key = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/gi, " ").trim().toLowerCase();
    const labels = suggestions.map(key).filter((l) => l.length > 3);
    cleanText = cleanText
      .split("\n")
      .filter((line) => {
        const k = key(line.replace(/^\s*(?:[-*•]|\d+[.)])\s*/, ""));
        return !k || !labels.some((l) => k === l || (k.length > 8 && (l.startsWith(k) || k.startsWith(l))));
      })
      .join("\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }





  const smoothText = useSmoothStreamText(cleanText, isStreaming && !isUser);
  const isRevealing = isStreaming && !isUser && smoothText.length < cleanText.length;


  return (
    <div className={`gx-m ${isUser ? "gx-you flex-row-reverse" : "gx-ai"} group/msg flex gap-3`}>
      {!isUser && (
        <div className="gx-av gx-ai flex h-8 w-8 shrink-0 items-center justify-center" aria-label="Growthity">
          <Logo variant="icon" className={`h-5 w-5 ${isStreaming ? "animate-pulse" : ""}`} />
        </div>
      )}
      <div className={`min-w-0 ${!isUser && (message.parts ?? []).some((part) => part.type === "tool-research_competitor_ads") ? "max-w-full" : "max-w-[85%]"} flex-1 ${isUser ? "flex flex-col items-end" : ""}`}>
          {attachedCompetitorRefs.length > 0 && (
            <div className="mb-1 flex flex-wrap justify-end gap-1.5">
              {attachedCompetitorRefs.map((r) => (
                <CompetitorRefChip key={r.id} ref_={r} />
              ))}
            </div>
          )}
          {attachedCampaign && (
            <div className="w-full max-w-sm">
              <PendingCampaignCard campaign={attachedCampaign} footer={null} />
            </div>
          )}
          {smoothText && (
            <div
              className={`inline-block max-w-full break-words rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                isUser
                  ? "rounded-br-md"
                  : "rounded-bl-md"
              }`}
              style={
                isRevealing
                  ? { maskImage: "linear-gradient(180deg, #000 calc(100% - 1.6em), rgba(0,0,0,0.55) 100%)", WebkitMaskImage: "linear-gradient(180deg, #000 calc(100% - 1.6em), rgba(0,0,0,0.55) 100%)" }
                  : undefined
              }
            >
              <div className="prose prose-sm dark:prose-invert max-w-none break-words [&_p]:my-1 [&_ol]:my-1 [&_ul]:my-1">
                {textNeedsMarkdown(smoothText) ? (
                  <ReactMarkdown
                    components={{
                      img: ({ node: _n, src, ...props }) => {
                        if (!src || (typeof src === "string" && src.trim() === "")) return null;
                        return (
                          <img
                            {...props}
                            src={src}
                            className="my-1 max-h-48 rounded-lg border border-border/40 object-cover"
                            loading="lazy"
                          />
                        );
                      },
                    }}
                  >
                    {smoothText}
                  </ReactMarkdown>
                ) : (
                  <PlainMessageText text={smoothText} />
                )}
                {isRevealing && (
                  <span
                    aria-hidden
                    className="ml-0.5 inline-block h-3.5 w-[2px] translate-y-0.5 rounded-sm bg-primary/70 align-middle"
                    style={{ animation: "chat-caret-blink 1s steps(2) infinite" }}
                  />
                )}
              </div>
            </div>
          )}
        {pickedMedia.length > 0 && (
          <div className={`mt-2 flex flex-wrap gap-2 ${isUser ? "justify-end" : ""}`}>
            {pickedMedia.map((m, i) => (
              <div key={i} className="w-24 overflow-hidden rounded-lg border border-border/60 bg-muted shadow-sm">
                <div className="relative aspect-square w-full">
                  {m.u ? (
                    m.k === "video" ? (
                      <video src={m.u} className="h-full w-full object-cover" muted playsInline preload="metadata" />
                    ) : (
                      <img src={m.u} alt={m.t} className="h-full w-full object-cover" loading="lazy" />
                    )
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                      <ImageIcon className="h-5 w-5" />
                    </div>
                  )}
                </div>
                <div className="truncate px-1.5 py-1 text-[10px] font-medium text-muted-foreground">{m.t}</div>
              </div>
            ))}
          </div>
        )}
        {attachedAudios.length > 0 && (
          <div className={`mt-2 flex flex-col gap-2 ${isUser ? "items-end" : ""}`}>
            {attachedAudios.map((a, i) => (
              <div
                key={`msg-audio-${i}`}
                className="flex max-w-full items-center gap-2 rounded-xl border border-border/60 bg-muted/60 px-2.5 py-2 shadow-sm"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <AudioWaveform className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <div className="max-w-52 truncate text-[11px] font-medium text-muted-foreground">{a.name}</div>
                  <audio src={a.url} controls preload="metadata" className="mt-1 h-8 w-56 max-w-full" />
                </div>
              </div>
            ))}
          </div>
        )}


        {cleanText && !isRevealing && (
          <MessageActions messageId={message.id} text={cleanText} isUser={isUser} onReply={handleReply} onEdit={handleEdit} />
        )}
        {!isUser && !isRevealing && suggestions.length > 0 && (
          <SuggestionList
            messageId={message.id}
            suggestions={suggestions}
            visuals={suggestionVisuals}
            locked={suggestionsLocked}
            logos={pageLogos}
            onSuggestion={onSuggestion}
          />
        )}

      </div>
    </div>
  );
}, (prev, next) =>
  prev.message === next.message &&
  prev.onSuggestion === next.onSuggestion &&
  prev.onReply === next.onReply &&
  prev.onEdit === next.onEdit &&
  prev.isStreaming === next.isStreaming &&
  prev.pageLogos === next.pageLogos &&
  prev.suggestionsLocked === next.suggestionsLocked,
);



function MessageActions({ messageId, text, isUser, onReply, onEdit }: { messageId: string; text: string; isUser: boolean; onReply?: () => void; onEdit?: () => void }) {
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<"up" | "down" | null>(() => {
    if (typeof window === "undefined") return null;
    const v = window.localStorage.getItem(`msg-fb:${messageId}`);
    return v === "up" || v === "down" ? v : null;
  });

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Impossible de copier");
    }
  };

  const setFb = (v: "up" | "down") => {
    const next = feedback === v ? null : v;
    setFeedback(next);
    if (next) {
      window.localStorage.setItem(`msg-fb:${messageId}`, next);
      toast.success(next === "up" ? "Merci, ton retour améliore l'assistant 👍" : "Noté, on va faire mieux 🙏");
    } else {
      window.localStorage.removeItem(`msg-fb:${messageId}`);
    }
  };

  return (
    <div className={`mt-1 flex items-center gap-0.5 text-muted-foreground opacity-0 transition group-hover/msg:opacity-100 ${isUser ? "justify-end" : ""}`}>
      {onReply && (
        <button
          onClick={onReply}
          className="rounded-md p-1.5 transition hover:bg-muted hover:text-foreground"
          title="Répondre"
          aria-label="Répondre"
        >
          <Reply className="h-3.5 w-3.5" />
        </button>
      )}
      {onEdit && (
        <button
          onClick={onEdit}
          className="rounded-md p-1.5 transition hover:bg-muted hover:text-foreground"
          title="Modifier ce message et reprendre la conversation ici"
          aria-label="Modifier ce message et reprendre la conversation ici"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
      )}
      <button
        onClick={handleCopy}
        className="rounded-md p-1.5 transition hover:bg-muted hover:text-foreground"
        title="Copier"
        aria-label="Copier"
      >
        {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
      </button>
      {!isUser && (
        <>
          <button
            onClick={() => setFb("up")}
            className={`rounded-md p-1.5 transition hover:bg-muted hover:text-foreground ${feedback === "up" ? "text-emerald-500" : ""}`}
            title="Bonne réponse"
            aria-label="Bonne réponse"
          >
            <ThumbsUp className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setFb("down")}
            className={`rounded-md p-1.5 transition hover:bg-muted hover:text-foreground ${feedback === "down" ? "text-red-500" : ""}`}
            title="Mauvaise réponse"
            aria-label="Mauvaise réponse"
          >
            <ThumbsDown className="h-3.5 w-3.5" />
          </button>
        </>
      )}
    </div>
  );
}

function parseGenerationStart(value: number | string | null | undefined) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Date.parse(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return Date.now();
}

function formatGenerationDuration(ms: number) {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  if (totalSec < 60) return `${totalSec}s`;
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  if (min < 10 && sec > 0) return `${min}m ${sec}s`;
  return `${min} min`;
}

function getGenerationProgress(kind: "video" | "image" | "carousel", ageMs: number) {
  const expectedMs = kind === "video" ? 3 * 60 * 1000 : kind === "carousel" ? 2 * 60 * 1000 : 60 * 1000;
  const stallMs = kind === "video" ? 10 * 60 * 1000 : kind === "carousel" ? 5 * 60 * 1000 : 3 * 60 * 1000;
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

function generationStageLabel(kind: "video" | "image" | "carousel", pipelineStage?: string | null, processingOp?: string | null) {
  if (processingOp === "speedup" || pipelineStage?.startsWith("speedup")) return "Finalisation accélérée…";
  if (pipelineStage?.startsWith("tts")) return "Création de la voix…";
  if (pipelineStage?.startsWith("lipsync")) return "Synchronisation vidéo…";
  if (processingOp === "subtitles") return "Sous-titres en cours…";
  if (processingOp === "trim") return "Rognage en cours…";
  if (processingOp === "crop") return "Recadrage en cours…";
  if (processingOp === "split") return "Découpage en cours…";
  return kind === "video" ? "Génération vidéo…" : kind === "carousel" ? "Génération carrousel…" : "Génération image…";
}

function PendingAdPreview({
  kind,
  createdAt,
  pipelineStage,
  processingOp,
  adId,
  onCancelled,
}: {
  kind: "video" | "image" | "carousel";
  createdAt: number | string | null;
  pipelineStage?: string | null;
  processingOp?: string | null;
  adId?: string;
  onCancelled?: () => void;
}) {
  const cancelGeneration = useServerFn(cancelAdGeneration);
  const [cancelling, setCancelling] = useState(false);
  const handleCancel = async () => {
    if (!adId) return;
    setCancelling(true);
    try {
      await cancelGeneration({ data: { id: adId } });
      toast.success("Génération arrêtée");
      onCancelled?.();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Impossible d'arrêter cette génération");
    } finally {
      setCancelling(false);
    }
  };
  const startedAt = useMemo(() => {
    return parseGenerationStart(createdAt);
  }, [createdAt]);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const ageMs = Math.max(0, now - startedAt);
  const { progress, remainingMs, overdue, stalled } = getGenerationProgress(kind, ageMs);
  const label = generationStageLabel(kind, pipelineStage, processingOp);
  const timeLabel = overdue
    ? `${formatGenerationDuration(ageMs)} écoulées`
    : `~${formatGenerationDuration(remainingMs)} restantes`;
  const detailLabel = stalled
    ? "Toujours en vérification automatique"
    : overdue
      ? "Plus long que prévu, on continue de vérifier"
      : "Temps réel";
  return (
    <div className="relative flex aspect-[9/16] max-h-64 w-full flex-col items-center justify-center gap-4 overflow-hidden rounded-xl bg-muted/40 px-6">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
      <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-background shadow-sm ring-1 ring-border">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="absolute h-12 w-12 animate-ping rounded-full border border-primary/20" />
      </div>
      <div className="w-full max-w-[260px] space-y-2">
        <div className="h-2 w-full overflow-hidden rounded-full bg-background ring-1 ring-border/60">
          <div className="relative h-full overflow-hidden rounded-full bg-primary transition-all duration-1000 ease-out" style={{ width: `${progress}%` }}>
            <div className="absolute inset-0 -translate-x-full animate-[slide-in-right_1.4s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-primary-foreground/40 to-transparent" />
          </div>
        </div>
        <div className="flex items-center justify-between gap-3 text-[11px] text-muted-foreground">
          <span className="truncate font-medium text-foreground/80">{label}</span>
          <span className="inline-flex shrink-0 items-center gap-1"><Clock className="h-3 w-3" />{timeLabel}</span>
        </div>
        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
          <span>{detailLabel}</span>
          <span>{progress}%</span>
        </div>
        {adId && (
          <Button
            size="sm"
            variant="outline"
            disabled={cancelling}
            onClick={() => void handleCancel()}
            className="h-7 w-full gap-1.5 text-[11px]"
          >
            {cancelling ? <Loader2 className="h-3 w-3 animate-spin" /> : <Square className="h-3 w-3" />}
            Arrêter
          </Button>
        )}
      </div>
    </div>
  );
}


type GeneratedAdCardProps = Parameters<typeof GeneratedAdCardInner>[0];

/**
 * Carte d'une création dans le chat. Toutes les versions (originale, +8 s,
 * sous-titrée…) partagent la même carte : la dernière est affichée par défaut
 * et on peut revenir à une version précédente.
 */
function GeneratedAdCard(props: Omit<GeneratedAdCardProps, "anchorId" | "versionBar">) {
  const { ad } = props;
  const enabled = ad.kind === "video" && ad.status === "ready";
  const getVersions = useServerFn(getAdVersions);
  const [pendingUntil, setPendingUntil] = useState(0);
  const q = useQuery({
    queryKey: ["ad-versions", ad.id],
    queryFn: () => getVersions({ data: { adId: ad.id } }),
    enabled,
    staleTime: 30_000,
    refetchInterval: pendingUntil > Date.now() ? 8000 : false,
  });
  const { refetch } = q;
  useEffect(() => {
    const onChanged = () => {
      setPendingUntil(Date.now() + 4 * 60_000);
      void refetch();
    };
    window.addEventListener("ad-versions-changed", onChanged);
    return () => window.removeEventListener("ad-versions-changed", onChanged);
  }, [refetch]);
  const versions = (q.data?.versions ?? []).filter((v) => v.status === "completed" && v.url);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const latest = versions[versions.length - 1];
  const sel = versions.find((v) => v.id === selectedId) ?? latest;
  const viewAd = versions.length > 1 && sel ? { ...ad, id: sel.id, url: sel.url } : ad;
  const history = q.data?.history ?? [];
  const versionBar = versions.length > 1 || history.length > 0 ? (
    <div className="border-b border-border/60 bg-muted/10 px-4 py-2 text-[11px]">
      {versions.length > 1 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="font-medium text-muted-foreground">Versions :</span>
          {versions.map((v, i) => (
            <button
              key={v.id}
              type="button"
              onClick={() => setSelectedId(v.id)}
              className={`rounded-full border px-2 py-0.5 transition ${sel?.id === v.id ? "border-primary bg-primary/10 font-semibold text-primary" : "border-border text-muted-foreground hover:text-foreground"}`}
              title={new Date(v.createdAt).toLocaleString("fr-FR")}
            >
              {v.label}{i === versions.length - 1 ? " · dernière" : ""}
            </button>
          ))}
        </div>
      )}
      {history.length > 0 && (
        <ul className="mt-1 space-y-0.5 text-muted-foreground">
          {history.slice(-3).map((h, i) => <li key={i}>• {h.label}</li>)}
        </ul>
      )}
    </div>
  ) : null;
  return <GeneratedAdCardInner {...props} ad={viewAd} anchorId={ad.id} versionBar={versionBar} />;
}

function GeneratedAdCardInner({
  ad,
  onSubtitleBurnStart,
  onReply,
  onSuggest,
  conversationId,
  onAdCreated,
  anchorId,
  versionBar,
}: {
  anchorId?: string;
  versionBar?: React.ReactNode;
  ad: {
    id: string;
    kind: "video" | "image" | "carousel";
    title: string;
    url?: string | null;
    urls?: string[] | null;
    status: "pending" | "ready" | "failed";
    error?: string | null;
    prompt?: string | null;
    afterMessageId?: string | null;
    displayAfterAdId?: string | null;
    createdAt?: number | string | null;
    processingStatus?: string | null;
    processingOp?: string | null;
    pipelineStage?: string | null;
  };
  onSubtitleBurnStart?: (adId: string, prevUrl: string) => void;
  onReply?: () => void;
  onSuggest?: (text: string) => void;
  conversationId?: string | null;
  onAdCreated?: (ad: GeneratedAd) => void;
}) {
  const KindIcon = ad.kind === "video" ? Video : ad.kind === "carousel" ? Layers : ImageIcon;
  const kindLabel = ad.kind === "video" ? "Vidéo" : ad.kind === "carousel" ? "Carrousel" : "Image";
  const [promptOpen, setPromptOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [modelId, setModelId] = useState<string | null>(null);
  const [detailMeta, setDetailMeta] = useState<{ seconds: number | null; segments: number | null; actor: string | null } | null>(null);
  useEffect(() => { setDetailMeta(null); setModelId(null); setDetailOpen(false); }, [ad.id]);
  const [supportsVoiceRegen, setSupportsVoiceRegen] = useState(false);
  const [voices, setVoices] = useState<{ female: Array<{ id: string; name: string; notes?: string }>; male: Array<{ id: string; name: string; notes?: string }> } | null>(null);
  const [selectedVoice, setSelectedVoice] = useState<string>("");
  const [regenLoading, setRegenLoading] = useState(false);
  const [previewCache, setPreviewCache] = useState<Record<string, string>>({});
  const [previewLoading, setPreviewLoading] = useState<string | null>(null);
  const [playingVoice, setPlayingVoice] = useState<string | null>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);
  const runRegenVoice = useServerFn(regenerateAdVoice);
  const runListVoices = useServerFn(listFrenchVoices);
  const runPreviewVoice = useServerFn(previewFrenchVoice);
  const promptText = typeof ad.prompt === "string" ? ad.prompt.trim() : "";

  const voiceSectionRef = useRef<HTMLDivElement | null>(null);
  const toggleDetail = async () => {
    const next = !detailOpen;
    setDetailOpen(next);
    if (next && !detailMeta && ad.status === "ready") {
      setDetailLoading(true);
      try {
        const [{ data: row }, vs] = await Promise.all([
          supabase.from("ads").select("fal_model_id, pipeline_spoken_text, pipeline_video_url, duration, stock_actor_id, is_sequence_merge, sequence_id").eq("id", ad.id).maybeSingle(),
          voices ? Promise.resolve(voices) : runListVoices().catch((e) => { console.error("[voice] listFrenchVoices failed", e); return null; }),
        ]);
        const rawModel = (row?.fal_model_id as string | null) ?? null;
        setModelId(rawModel && !/compose|ffmpeg/i.test(rawModel) ? rawModel : null);
        const seconds = typeof row?.duration === "number" && row.duration > 0 ? Math.round(row.duration) : null;
        let segments: number | null = null;
        if (row?.is_sequence_merge && row.sequence_id) {
          const { count } = await supabase.from("ads").select("id", { count: "exact", head: true }).eq("sequence_id", row.sequence_id).eq("is_sequence_merge", false);
          segments = count && count > 1 ? count : seconds ? Math.max(2, Math.round(seconds / 8)) : null;
        }
        let actor: string | null = null;
        if (row?.stock_actor_id) {
          const { data: a } = await supabase.from("stock_actors").select("name").eq("id", row.stock_actor_id as string).maybeSingle();
          actor = (a?.name as string | null) ?? null;
        }
        setDetailMeta({ seconds, segments, actor });
        const canRegen = !!(row?.pipeline_spoken_text && row?.pipeline_video_url);
        setSupportsVoiceRegen(canRegen);
        if (vs && !voices) setVoices(vs as unknown as typeof voices);
        if (canRegen && !vs && !voices) {
          toast.error("Impossible de charger le catalogue de voix. Réessaie dans quelques secondes.");
        }
      } catch (e) {
        console.error("[voice] toggleDetail failed", e);
        setModelId(null);
        toast.error("Impossible de charger les détails de cette vidéo.");
      } finally {
        setDetailLoading(false);
      }
    }
    if (next) {
      // Guide the user's eye directly to the voice picker & the "Régénérer" CTA.
      setTimeout(() => voiceSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 120);
    }
  };


  const handlePlayPreview = async (voiceId: string) => {
    // Toggle stop if already playing this voice
    if (playingVoice === voiceId && previewAudioRef.current) {
      previewAudioRef.current.pause();
      previewAudioRef.current.currentTime = 0;
      setPlayingVoice(null);
      return;
    }
    // Stop any current playback
    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
      previewAudioRef.current = null;
    }
    setPlayingVoice(null);
    try {
      let url = previewCache[voiceId];
      if (!url) {
        setPreviewLoading(voiceId);
        const r = await runPreviewVoice({ data: { voiceId } });
        url = r.url;
        setPreviewCache((c) => ({ ...c, [voiceId]: url }));
      }
      const a = new Audio(url);
      previewAudioRef.current = a;
      a.onended = () => { setPlayingVoice(null); previewAudioRef.current = null; };
      a.onerror = () => { setPlayingVoice(null); previewAudioRef.current = null; toast.error("Lecture impossible"); };
      setPlayingVoice(voiceId);
      await a.play();
    } catch (e) {
      setPlayingVoice(null);
      toast.error((e as Error).message || "Aperçu indisponible");
    } finally {
      setPreviewLoading(null);
    }
  };

  const handleRegenVoice = async () => {
    if (!selectedVoice) {
      toast.info("Sélectionne d'abord une voix dans la liste.");
      return;
    }
    setRegenLoading(true);
    try {
      if (ad.url) onSubtitleBurnStart?.(ad.id, ad.url);
      await runRegenVoice({ data: { adId: ad.id, voiceId: selectedVoice, fastMode: true } });
      toast.success("Nouvelle voix en cours de génération…");
    } catch (e) {
      toast.error((e as Error).message || "Régénération impossible");
    } finally {
      setRegenLoading(false);
    }
  };


  return (
    <div id={`ad-${anchorId ?? ad.id}`} data-ad-version={ad.id} className="flex gap-3 scroll-mt-24">
      <div className="bg-grad flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white shadow-elegant">
        <Sparkles className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="overflow-hidden rounded-2xl border border-border/70 bg-background shadow-sm">
          <div className="flex items-center justify-between gap-2 border-b border-border/60 bg-muted/30 px-4 py-2.5">
            <div className="flex min-w-0 items-center gap-2">
              <KindIcon className="h-3.5 w-3.5 text-primary" />
              <span className="truncate text-xs font-semibold">{kindLabel} - {ad.title}</span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                  ad.status === "ready"
                    ? "bg-emerald-500/10 text-emerald-600"
                    : ad.status === "failed"
                      ? "bg-red-500/10 text-red-600"
                      : "bg-amber-500/10 text-amber-600"
                }`}
              >
                {ad.status === "ready" ? "Prêt" : ad.status === "failed" ? "Échec" : "En cours…"}
              </span>
              {onReply && (
                <button
                  onClick={onReply}
                  className="rounded-md p-1 text-muted-foreground transition hover:bg-background hover:text-foreground"
                  title="Répondre à ce média"
                  aria-label="Répondre"
                >
                  <Reply className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          {versionBar}

          {promptText && (
            <div className="border-b border-border/60 bg-muted/20 px-4 py-2">
              <button
                type="button"
                onClick={() => setPromptOpen((v) => !v)}
                className="flex w-full items-center justify-between gap-2 text-[11px] font-medium text-muted-foreground transition hover:text-foreground"
                aria-expanded={promptOpen}
              >
                <span className="flex items-center gap-1.5">
                  <Sparkles className="h-3 w-3" />
                  Prompt utilisé
                </span>
                <span className="text-[10px] opacity-70">{promptOpen ? "Masquer" : "Afficher"}</span>
              </button>
              {promptOpen && (
                <div className="mt-2 space-y-2">
                  <p className="max-h-56 overflow-y-auto whitespace-pre-wrap rounded-md bg-background/80 p-2 text-[11px] leading-relaxed text-foreground/80">
                    {promptText}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      void navigator.clipboard.writeText(promptText).then(
                        () => toast.success("Prompt copié"),
                        () => toast.error("Copie impossible"),
                      );
                    }}
                    className="text-[10px] font-medium text-primary hover:underline"
                  >
                    Copier le prompt
                  </button>
                </div>
              )}
            </div>
          )}
          <div className="bg-muted/10 p-3">
            {ad.status === "pending" && (
              <PendingAdPreview
                kind={ad.kind}
                createdAt={ad.createdAt ?? null}
                pipelineStage={ad.pipelineStage ?? null}
                processingOp={ad.processingOp ?? null}
                adId={ad.id}
                onCancelled={() => onAdCreated?.({ ...ad, status: "failed" })}
              />
            )}
            {ad.status === "failed" && (
              <div className="flex flex-col items-center justify-center gap-2 rounded-xl bg-red-500/5 p-6 text-center">
                <span className="text-sm font-medium text-red-600">La génération a échoué</span>
                <span className="text-xs text-muted-foreground">
                  {ad.error ?? "Réessaie avec un autre format ou relance depuis le chat."}
                </span>
              </div>
            )}
            {ad.status === "ready" && ad.kind === "video" && ad.url && (
              <video
                src={ad.url}
                controls
                className="max-h-[420px] w-full rounded-xl bg-black object-contain"
              />
            )}
            {ad.status === "ready" && ad.kind === "image" && ad.url && (
              <img
                src={ad.url}
                alt={ad.title}
                className="max-h-[420px] w-full rounded-xl object-contain"
              />
            )}
            {ad.status === "ready" && ad.kind === "carousel" && ad.urls && (
              <div className="flex gap-2 overflow-x-auto">
                {ad.urls.map((u, i) => (
                  <img
                    key={i}
                    src={u}
                    alt={`slide ${i + 1}`}
                    className="h-40 w-40 shrink-0 rounded-lg object-cover"
                  />
                ))}
              </div>
            )}
          </div>
          {ad.status === "ready" && (
            <div className="border-t border-border/60 bg-muted/10 px-4 py-2">
              <button
                type="button"
                onClick={() => { void toggleDetail(); }}
                className="flex w-full items-center justify-between gap-2 text-[11px] font-medium text-muted-foreground transition hover:text-foreground"
                aria-expanded={detailOpen}
              >
                <span className="flex items-center gap-1.5">
                  <Languages className="h-3 w-3" />
                  Détails & voix
                </span>
                <span className="text-[10px] opacity-70">{detailOpen ? "Masquer" : "Afficher"}</span>
              </button>
              {detailOpen && (
                <div className="mt-2 space-y-1 rounded-md bg-background/80 p-2 text-[11px] leading-relaxed">
                  {detailLoading && <div className="text-muted-foreground">Chargement…</div>}
                  {!detailLoading && modelId && (
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-muted-foreground">IA utilisée</span>
                      <span className="font-mono text-[10px] text-foreground/90">{friendlyModelName(modelId)}</span>
                    </div>
                  )}
                  {!detailLoading && detailMeta?.seconds && (
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-muted-foreground">Durée</span>
                      <span className="text-foreground/80">{detailMeta.seconds} s</span>
                    </div>
                  )}
                  {!detailLoading && detailMeta?.segments && (
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-muted-foreground">Segments</span>
                      <span className="text-foreground/80">{detailMeta.segments}</span>
                    </div>
                  )}
                  {!detailLoading && detailMeta?.actor && (
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-muted-foreground">Acteur</span>
                      <span className="text-foreground/80">{detailMeta.actor}</span>
                    </div>
                  )}
                  {modelId && (
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-muted-foreground">Modèle</span>
                      <span className="font-mono text-[10px] text-muted-foreground/80 truncate">{modelId}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-muted-foreground">Type</span>
                    <span className="text-foreground/80">{kindLabel}</span>
                  </div>
                  {supportsVoiceRegen && voices && (<div ref={voiceSectionRef}>
                    <div className="mt-2 space-y-2 rounded-md border border-border/60 bg-background/70 p-2">
                      <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                        <Sparkles className="h-3 w-3" />
                        Changer la voix (aperçu ×{UGC_FR_SPEED_LABEL})
                      </div>
                      <p className="text-[10px] leading-snug text-muted-foreground">
                        Clique ▶ pour écouter chaque voix au tempo exact de la vidéo finale.
                      </p>
                      <div className="max-h-64 space-y-2.5 overflow-y-auto pr-1">
                        {(["female", "male"] as const).map((g) => (
                          <div key={g}>
                            <div className="mb-1 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                              {g === "female" ? "Voix féminines" : "Voix masculines"}
                            </div>
                            <div className="space-y-1">
                              {voices[g].map((v) => {
                                const isSel = selectedVoice === v.id;
                                const isPlaying = playingVoice === v.id;
                                const isLoadingPrev = previewLoading === v.id;
                                return (
                                  <div
                                    key={v.id}
                                    className={`flex items-center gap-1.5 rounded-md border px-2 py-1.5 transition ${
                                      isSel ? "border-primary/60 bg-primary/5" : "border-border/40 bg-background/60"
                                    }`}
                                  >
                                    <button
                                      type="button"
                                      onClick={() => { void handlePlayPreview(v.id); }}
                                      disabled={isLoadingPrev}
                                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary transition hover:bg-primary/20 disabled:opacity-50"
                                      title={isPlaying ? "Pause" : "Écouter"}
                                      aria-label={isPlaying ? "Pause" : "Écouter"}
                                    >
                                      {isLoadingPrev ? (
                                        <Loader2 className="h-3 w-3 animate-spin" />
                                      ) : isPlaying ? (
                                        <span className="text-[9px]">■</span>
                                      ) : (
                                        <span className="ml-0.5 text-[9px]">▶</span>
                                      )}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setSelectedVoice(v.id)}
                                      className="flex min-w-0 flex-1 flex-col items-start text-left"
                                    >
                                      <span className="truncate text-[11px] font-medium">{v.name}</span>
                                      {v.notes && (
                                        <span className="truncate text-[9px] text-muted-foreground">{v.notes}</span>
                                      )}
                                    </button>
                                    {isSel && (
                                      <span className="shrink-0 rounded-full bg-primary/20 px-1.5 py-0.5 text-[8px] font-semibold uppercase text-primary">
                                        Sélectionnée
                                      </span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => { void handleRegenVoice(); }}
                        disabled={!selectedVoice || regenLoading}
                        className="w-full rounded-md bg-primary px-2 py-1.5 text-[11px] font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
                      >
                        {regenLoading ? "Lancement…" : "Régénérer avec cette voix"}
                      </button>
                      <p className="text-[10px] leading-snug text-muted-foreground">
                        Refait uniquement TTS + lipsync sur l'acteur existant. ~2× plus rapide qu'une génération complète.
                      </p>
                    </div>
                  </div>)}

                </div>
              )}
            </div>
          )}
          <GeneratedAdActions ad={ad} onSubtitleBurnStart={onSubtitleBurnStart} onReply={onReply} conversationId={conversationId} onAdCreated={onAdCreated} />
        </div>
        {onSuggest && <GeneratedAdSuggestions ad={ad} onSuggest={onSuggest} />}
      </div>
    </div>
  );
}

async function downloadUrl(url: string, filename: string) {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = objectUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
  } catch {
    toast.error("Téléchargement impossible");
  }
}

/** Ranger une création du chat dans un dossier de « Mes créations » (création à la volée possible). */
function MoveAdToFolderButton({ adId }: { adId: string }) {
  const fetchFolders = useServerFn(listFolders);
  const createFolderFn = useServerFn(createFolder);
  const moveFn = useServerFn(moveAdsToFolder);
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [newOpen, setNewOpen] = useState(false);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [movedTo, setMovedTo] = useState<string | null>(null);

  const folders = useQuery({
    queryKey: ["ad-folders", "chat"],
    queryFn: () => fetchFolders(),
    enabled: open,
    staleTime: 60_000,
  });

  const move = async (folderId: string | null, label: string) => {
    setBusy(true);
    try {
      await moveFn({ data: { adIds: [adId], folderId } });
      setMovedTo(folderId ? label : null);
      await qc.invalidateQueries({ queryKey: ["ads"] });
      toast.success(folderId ? `Rangé dans « ${label} »` : "Retiré du dossier");
      setOpen(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Impossible de ranger cette création");
    } finally {
      setBusy(false);
    }
  };

  const createAndMove = async () => {
    const n = name.trim();
    if (!n) return;
    setBusy(true);
    try {
      const folder: any = await createFolderFn({ data: { name: n } });
      await moveFn({ data: { adIds: [adId], folderId: folder.id as string } });
      setMovedTo(n);
      setName("");
      setNewOpen(false);
      setOpen(false);
      await Promise.all([
        qc.invalidateQueries({ queryKey: ["folders"] }),
        qc.invalidateQueries({ queryKey: ["ad-folders", "chat"] }),
        qc.invalidateQueries({ queryKey: ["ads"] }),
      ]);
      toast.success(`Dossier « ${n} » créé — création rangée`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Création du dossier impossible");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button size="sm" variant="outline" className="h-7 gap-1.5 rounded-full text-xs" title="Ranger dans un dossier">
            <FolderPlus className="h-3.5 w-3.5" />
            {movedTo ? movedTo : "Ranger"}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setNewOpen(true); }}>
            <FolderPlus className="mr-2 h-3.5 w-3.5" /> Nouveau dossier…
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {folders.isLoading && <div className="px-2 py-1.5 text-xs text-muted-foreground">Chargement…</div>}
          {!folders.isLoading && (folders.data ?? []).length === 0 && (
            <div className="px-2 py-1.5 text-xs text-muted-foreground">Aucun dossier</div>
          )}
          {((folders.data ?? []) as any[]).map((f) => (
            <DropdownMenuItem key={f.id} disabled={busy} onSelect={(e) => { e.preventDefault(); void move(f.id as string, f.name as string); }}>
              <Folder className="mr-2 h-3.5 w-3.5 text-primary/70" /> {f.name}
            </DropdownMenuItem>
          ))}
          {movedTo && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem disabled={busy} onSelect={(e) => { e.preventDefault(); void move(null, ""); }}>
                Retirer du dossier
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={newOpen} onOpenChange={setNewOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Nouveau dossier</DialogTitle>
            <DialogDescription>La création sera rangée dedans immédiatement.</DialogDescription>
          </DialogHeader>
          <Input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex. Campagne été"
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); void createAndMove(); } }}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewOpen(false)}>Annuler</Button>
            <Button onClick={() => void createAndMove()} disabled={busy || !name.trim()}>Créer et ranger</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function GeneratedAdActions({
  ad,
  onSubtitleBurnStart,
  onReply,
  conversationId,
  onAdCreated,
}: {
  ad: {
    id: string;
    kind: "video" | "image" | "carousel";
    title: string;
    url?: string | null;
    urls?: string[] | null;
    status: "pending" | "ready" | "failed";
    error?: string | null;
    afterMessageId?: string | null;
    displayAfterAdId?: string | null;
  };
  onSubtitleBurnStart?: (adId: string, prevUrl: string) => void;
  onReply?: () => void;
  conversationId?: string | null;
  onAdCreated?: (ad: GeneratedAd) => void;
}) {
  const [subsOpen, setSubsOpen] = useState(false);
  const [trimOpen, setTrimOpen] = useState(false);
  const [splitOpen, setSplitOpen] = useState(false);
  const [cropOpen, setCropOpen] = useState(false);
  const [continueOpen, setContinueOpen] = useState(false);
  const [dubOpen, setDubOpen] = useState(false);
  const [retouchOpen, setRetouchOpen] = useState(false);
  const [spawnedMedia, setSpawnedMedia] = useState<Array<{ id: string; kind: string; title: string }>>([]);
  const submitMedia = useServerFn(submitMediaGeneration);

  const spawnMedia = useCallback(
    async (useCase: "voiceover_only" | "background_music" | "sfx" | "talking_avatar" | "lipsync_dub" | "image_retouch" | "image_bg_edit" | "image_heavy_text" | "image_upscale" | "video_upscale" | "product_3d_render", params: {
      prompt: string;
      title: string;
      sourceImageUrl?: string;
      sourceVideoUrl?: string;
      language?: string;
      voice?: string;
    }) => {
      try {
        const res = await submitMedia({
          data: {
            useCase,
            prompt: params.prompt,
            title: params.title,
            conversationId: conversationId ?? undefined,
            sourceAdId: ad.id,
            sourceImageUrl: params.sourceImageUrl,
            sourceVideoUrl: params.sourceVideoUrl,
            language: params.language,
            voice: params.voice,
          },
        });
        setSpawnedMedia((prev) => [...prev, { id: res.mediaAssetId, kind: res.kind, title: params.title }]);
        toast.success("Génération lancée");
      } catch (e) {
        toast.error((e as Error).message || "Échec du lancement");
      }
    },
    [submitMedia, conversationId, ad.id],
  );


  if (ad.status !== "ready") {
    return (
      <div className="flex items-center justify-end gap-2 border-t border-border/60 px-3 py-2">
        <Link to="/creations" className="text-xs font-medium text-primary hover:underline">
          Ouvrir dans Mes créations →
        </Link>
      </div>
    );
  }

  const safeTitle = (ad.title || ad.kind).replace(/[^\w\-]+/g, "_").slice(0, 40);
  const ext = ad.kind === "video" ? "mp4" : "jpg";
  const doDownload = () => {
    if (ad.kind === "carousel" && ad.urls) {
      ad.urls.forEach((u, i) => downloadUrl(u, `${safeTitle}-slide-${i + 1}.jpg`));
    } else if (ad.url) {
      downloadUrl(ad.url, `${safeTitle}.${ext}`);
    }
  };
  const isVideo = ad.kind === "video";

  return (
    <div className="border-t border-border/60 px-3 py-2.5">
      <div className="flex flex-col gap-2">
        {/* Ligne 1 : actions principales */}
        <div className="flex flex-wrap items-center gap-1.5">
          {onReply && (
            <Button
              size="sm"
              variant="outline"
              className="h-7 gap-1.5 rounded-full text-xs"
              onClick={onReply}
              title="Modifier via un message"
            >
              <Wand2 className="h-3.5 w-3.5" />
              Modifier
            </Button>
          )}

          {isVideo && ad.url && (
            <>
              <Button
                size="sm"
                variant="outline"
                className="h-7 gap-1.5 rounded-full text-xs"
                onClick={() => setContinueOpen(true)}
                title="Générer la suite avec le même acteur et le même cadre"
              >
                <Wand2 className="h-3.5 w-3.5" />
                Continuer la vidéo
              </Button>
              <Button
                asChild
                size="sm"
                className="h-7 gap-1.5 rounded-full bg-primary px-3 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
                title="Ouvrir cette vidéo dans l'éditeur"
              >
                <Link
                  to="/editeur"
                  search={{ p: "new", v: ad.url, n: ad.title || "Vidéo", panel: "media", src: ad.id }}
                >
                  <Clapperboard className="h-3.5 w-3.5" />
                  Ouvrir dans l'éditeur
                </Link>
              </Button>
            </>
          )}
        </div>

        {/* Ligne 2 : outils et actions secondaires */}
        <div className="flex flex-wrap items-center gap-1.5">
          {isVideo && ad.url && (
            <>
              <Button
                asChild
                size="sm"
                variant="outline"
                className="h-7 gap-1.5 rounded-full text-xs"
                title="Ouvrir la vidéo dans l'éditeur, onglet Sous-titres"
              >
                <Link
                  to="/editeur"
                  search={{ p: "new", v: ad.url, n: ad.title || "Vidéo", panel: "captions", src: ad.id }}
                >
                  <Captions className="h-3.5 w-3.5" />
                  Sous-titres
                </Link>
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-7 gap-1.5 rounded-full text-xs"
                onClick={() => setTrimOpen(true)}
                title="Rogner / Couper la vidéo"
              >
                <Scissors className="h-3.5 w-3.5" />
                Rogner / Couper
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-7 gap-1.5 rounded-full text-xs"
                onClick={() => setSplitOpen(true)}
                title="Scinder en 2 clips"
              >
                <SplitSquareHorizontal className="h-3.5 w-3.5" />
                Scinder
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-7 gap-1.5 rounded-full text-xs"
                onClick={() => setCropOpen(true)}
                title="Recadrer (format / ratio)"
              >
                <Crop className="h-3.5 w-3.5" />
                Recadrer
              </Button>
              <MergeSequenceButton
                adId={ad.id}
                onCreated={({ adId: newId, title }) =>
                  onAdCreated?.({ id: newId, kind: "video", title, status: "pending", createdAt: Date.now() })
                }
              />
            </>
          )}

          {ad.kind === "image" && ad.url && (
            <>
              <Button
                size="sm"
                variant="outline"
                className="h-7 gap-1.5 rounded-full text-xs"
                onClick={() => setRetouchOpen(true)}
                title="Retoucher l'image (fond, détail, style)"
              >
                <Palette className="h-3.5 w-3.5" />
                Retoucher
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-7 gap-1.5 rounded-full text-xs"
                onClick={() => spawnMedia("image_upscale", { prompt: "upscale HD", title: `${ad.title} - HD`, sourceImageUrl: ad.url! })}
                title="Upscaler l'image en haute résolution"
              >
                <Maximize2 className="h-3.5 w-3.5" />
                Upscale HD
              </Button>
            </>
          )}

          <MoveAdToFolderButton adId={ad.id} />

          <button
            type="button"
            onClick={doDownload}
            className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-border/60 bg-background text-muted-foreground transition hover:bg-muted hover:text-foreground"
            title="Télécharger"
            aria-label="Télécharger"
          >
            <Download className="h-3.5 w-3.5" />
          </button>

          <div className="ml-auto flex items-center">
            <Link to="/creations" className="text-xs font-medium text-primary hover:underline">
              Mes créations →
            </Link>
          </div>
        </div>
      </div>

      {isVideo && ad.url && (
        <SubtitlesDialog
          open={subsOpen}
          onOpenChange={setSubsOpen}
          adId={ad.id}
          videoUrl={ad.url}
          onBurnStart={onSubtitleBurnStart}
        />
      )}
      {isVideo && ad.url && trimOpen && (
        <TrimVideoDialog
          open={trimOpen}
          onOpenChange={setTrimOpen}
          adId={ad.id}
          adTitle={ad.title}
          videoUrl={ad.url}
          conversationId={conversationId ?? null}
          onCreated={({ adId: newId, title }) => {
            onAdCreated?.({
              id: newId,
              kind: "video",
              title,
              status: "pending",
              afterMessageId: ad.afterMessageId ?? null,
              displayAfterAdId: ad.id,
              createdAt: Date.now(),
            });
          }}
        />
      )}
      {isVideo && ad.url && splitOpen && (
        <SplitVideoDialog open={splitOpen} onOpenChange={setSplitOpen} adId={ad.id} adTitle={ad.title} videoUrl={ad.url} folderId={null} />
      )}
      {isVideo && ad.url && cropOpen && (
        <CropVideoDialog open={cropOpen} onOpenChange={setCropOpen} adId={ad.id} videoUrl={ad.url} />
      )}
      {isVideo && ad.url && continueOpen && (
        <ContinueVideoDialog
          open={continueOpen}
          onOpenChange={setContinueOpen}
          adId={ad.id}
          videoUrl={ad.url}
          conversationId={conversationId ?? null}
          onCreated={({ adId: newId, title }) =>
            onAdCreated?.({
              id: newId,
              kind: "video",
              title,
              status: "pending",
              afterMessageId: null,
              displayAfterAdId: null,
              createdAt: Date.now(),
            })
          }
        />
      )}
      {dubOpen && ad.url && isVideo && (
        <DubVideoDialog
          open={dubOpen}
          onOpenChange={setDubOpen}
          videoUrl={ad.url}
          onSubmit={(prompt, language, voice) =>
            spawnMedia("lipsync_dub", {
              prompt,
              title: `${ad.title} - ${language ?? "doublé"}`,
              sourceVideoUrl: ad.url!,
              language,
              voice,
            })
          }
        />
      )}
      {retouchOpen && ad.url && ad.kind === "image" && (
        <RetouchImageDialog
          open={retouchOpen}
          onOpenChange={setRetouchOpen}
          imageUrl={ad.url}
          onSubmit={(prompt) =>
            spawnMedia("image_retouch", { prompt, title: `${ad.title} - retouche`, sourceImageUrl: ad.url! })
          }
        />
      )}
      {spawnedMedia.length > 0 && (
        <div className="mt-3 space-y-3 border-t border-border/60 pt-3">
          {spawnedMedia.map((m) => (
            <MediaAssetBlock key={m.id} output={{ ok: true, mediaAssetId: m.id, kind: m.kind, title: m.title }} />
          ))}
        </div>
      )}
    </div>
  );
}

function DubVideoDialog({
  open, onOpenChange, videoUrl, onSubmit,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  videoUrl: string;
  onSubmit: (prompt: string, language: string, voice: string) => Promise<void> | void;
}) {
  const [text, setText] = useState("");
  const [language, setLanguage] = useState("fr");
  const [voice, setVoice] = useState("Emily");
  const [busy, setBusy] = useState(false);
  const resolvedVoice = resolveAvatarVoiceId(voice, language);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Doubler la vidéo</DialogTitle>
          <DialogDescription>Nouveau texte parlé, re-synchronisé sur les lèvres.</DialogDescription>
        </DialogHeader>
        <video src={videoUrl} controls className="w-full rounded-lg bg-black max-h-64" />
        <div className="space-y-3">
          <div>
            <Label className="text-xs">Nouveau texte à dire</Label>
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Le texte que l'acteur doit prononcer…"
              rows={3}
              maxLength={200}
            />
            <p className={`mt-1 text-right text-[11px] ${text.length > 195 ? "text-destructive" : "text-muted-foreground"}`}>
              {text.length}/200 caractères (limite du modèle de doublage)
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Langue</Label>
              <Input value={language} onChange={(e) => setLanguage(e.target.value)} placeholder="fr / en / es…" />
            </div>
            <div>
              <Label className="text-xs">Voix</Label>
              <Select value={resolvedVoice} onValueChange={setVoice}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choisir une voix" />
                </SelectTrigger>
                <SelectContent>
                  {AVATAR_VOICE_CATALOG.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.label} <span className="text-xs text-muted-foreground">— {v.mood}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
          <Button
            disabled={!text.trim() || busy}
            onClick={async () => {
              setBusy(true);
              try { await onSubmit(text.trim(), language.trim() || "fr", voice.trim() || "Emily"); onOpenChange(false); }
              finally { setBusy(false); }
            }}
          >
            {busy ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : <Languages className="mr-2 h-3.5 w-3.5" />}
            Doubler
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function RetouchImageDialog({
  open, onOpenChange, imageUrl, onSubmit,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  imageUrl: string;
  onSubmit: (prompt: string) => Promise<void> | void;
}) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Retoucher l'image</DialogTitle>
          <DialogDescription>Décris la modification (fond, couleur, style, détail…).</DialogDescription>
        </DialogHeader>
        <img src={imageUrl} alt="source" className="max-h-64 w-full rounded-lg object-contain" />
        <Textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} placeholder="Ex : remplace le fond par une plage au coucher du soleil" />
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
          <Button
            disabled={!text.trim() || busy}
            onClick={async () => {
              setBusy(true);
              try { await onSubmit(text.trim()); onOpenChange(false); }
              finally { setBusy(false); }
            }}
          >
            {busy ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : <Palette className="mr-2 h-3.5 w-3.5" />}
            Retoucher
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


function GeneratedAdSuggestions({
  ad,
  onSuggest,
}: {
  ad: {
    id: string;
    kind: "video" | "image" | "carousel";
    title: string;
    url?: string | null;
    urls?: string[] | null;
    status: "pending" | "ready" | "failed";
    error?: string | null;
  };
  onSuggest: (text: string) => void;
}) {
  if (ad.status !== "ready") return null;

  const isVideo = ad.kind === "video";
  const kindWord = isVideo ? "vidéo" : ad.kind === "carousel" ? "carrousel" : "image";

  const suggestions: { label: string; text: string; icon: typeof Wand2 }[] = [
    { label: "Générer une variation", text: `Génère une nouvelle variation de cette ${kindWord} ("${ad.title}") en gardant le même concept mais avec un angle différent.`, icon: RefreshCw },
    ...(isVideo
      ? [
          { label: "Décliner en 1:1", text: `Refais cette vidéo ("${ad.title}") au format carré 1:1 pour Instagram Feed.`, icon: Crop },
          { label: "Créer une image", text: `À partir de cette vidéo ("${ad.title}"), génère une image statique dans le même style pour un usage feed.`, icon: ImageIcon },
        ]
      : ad.kind === "image"
        ? [
            { label: "Créer une vidéo", text: `Transforme cette image ("${ad.title}") en une courte vidéo publicitaire animée.`, icon: Video },
            { label: "Décliner en carrousel", text: `Décline cette image ("${ad.title}") en un carrousel de 3 slides cohérentes.`, icon: Layers },
          ]
        : [
            { label: "Créer une vidéo", text: `Transforme ce carrousel ("${ad.title}") en une vidéo publicitaire animée.`, icon: Video },
          ]),
  ];

  return (
    <div className="pt-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Et ensuite&nbsp;?</span>
        {suggestions.map((s) => (
          <button
            key={s.label}
            type="button"
            onClick={() => onSuggest(s.text)}
            className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-2 text-[13px] font-medium text-primary transition hover:bg-primary/10"
          >
            <s.icon className="h-4 w-4" />
            {s.label}
          </button>
        ))}
        <button
          type="button"
          onClick={() =>
            onSuggest(
              `Je veux publier cette ${kindWord} ("${ad.title}", création id ${ad.id} — utilise EXACTEMENT cette version, c'est celle affichée dans la carte) sur Meta (Facebook/Instagram). Le visuel/vidéo est DÉJÀ créé - NE POSE AUCUNE question sur l'image produit, le format média, le style visuel, la durée, le ratio ou la langue. N'appelle PAS l'outil update_brief ni ready_to_generate. On configure UNIQUEMENT la campagne Meta. Guide-moi étape par étape en posant UNE SEULE question à la fois, dans cet ordre exact (mêmes questions que l'assistant de création de campagne) :\n\n` +
              `1. **Objectif de campagne** - propose uniquement ces 3 choix avec leur explication :\n` +
              `   • **Leads** - Récoltez des contacts qualifiés (email, téléphone) via un formulaire instantané\n` +
              `   • **Trafic** - Amenez des visiteurs sur votre site ou page de destination\n` +
              `   • **Ventes** - Convertissez votre audience en achats directs sur votre boutique\n\n` +
              `2. **Nom de la campagne** (propose un nom par défaut)\n` +
              `3. **Pays ciblés** (ex : France, Belgique, Suisse…)\n` +
              `4. **Tranche d'âge** (min et max, entre 18 et 65)\n` +
              `5. **Genre** (Tous / Hommes / Femmes)\n` +
              `6. **Centres d'intérêt** (mots-clés, optionnel)\n` +
              `7. **Budget** - montant en € et type (quotidien ou total sur la durée)\n` +
              `8. **Durée de diffusion** (dates de début et fin, ou "en continu")\n` +
              `9. **Placements** (automatiques recommandés, ou choisir Feed / Stories / Reels)\n` +
              `10. **Titre de l'annonce** (headline courte)\n` +
              `11. **Texte principal / description** de l'annonce\n` +
              `12. **Call-to-action** (En savoir plus, S'inscrire, Acheter, Réserver…) - si objectif = Leads, force "En savoir plus"\n` +
              `13. **URL de destination** - sauf si objectif = Leads, dans ce cas demande plutôt les champs du formulaire instantané (email, nom, téléphone, ville, entreprise, poste) et un texte d'intro + URL de politique de confidentialité\n\n` +
              `Après chaque réponse, confirme brièvement et passe à la question suivante.\n\n` +
              `À la toute fin (après la question de l'URL/formulaire), recommande-moi explicitement d'ajouter plusieurs visuels pour une bonne campagne : **l'idéal pour une campagne Meta performante = 2 vidéos + 1 image** (ça permet à l'algo de tester et d'optimiser). Propose-moi de sélectionner ces visuels supplémentaires soit parmi les créations déjà générées dans ce chat, soit depuis ma bibliothèque "Créations". Demande-moi si je veux en ajouter (oui/non) et si oui, je pourrai les choisir. Ensuite seulement, résume toute la configuration et propose de publier.`,
            )
          }

          className="inline-flex items-center gap-2 rounded-full bg-meta px-4 py-2 text-[13px] font-semibold text-white shadow-sm transition hover:opacity-90"
        >
          <MetaIcon className="h-4 w-4 text-white" />
          Publier sur Meta
        </button>

      </div>
    </div>
  );
}

function SidebarSection({
  label, icon, open, onToggle, count, menu, children,
}: {
  label: string;
  icon?: React.ReactNode;
  open: boolean;
  onToggle: () => void;
  count?: number;
  menu?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="group/section mt-3 first:mt-0 border-t border-border/40 pt-2 first:border-t-0 first:pt-0">
      <div
        onClick={onToggle}
        className="flex cursor-pointer items-center gap-1.5 rounded-md px-1.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80 transition hover:bg-background/60 hover:text-foreground"
      >
        {open ? <ChevronDown className="h-3 w-3 shrink-0" /> : <ChevronRight className="h-3 w-3 shrink-0" />}
        <span className="flex items-center gap-1.5">{icon}{label}</span>
        {typeof count === "number" && (
          <span className="ml-1 rounded-full bg-muted px-1.5 py-0 text-[9px] font-medium text-muted-foreground">{count}</span>
        )}
        <div className="ml-auto">{menu}</div>
      </div>
      {open && <div className="mt-1 space-y-0.5 border-l border-border/40 pl-2 ml-2">{children}</div>}
    </div>
  );
}


function ConversationRow({
  conv, active, folders, onOpen, onDelete, onRename, onFav, onMove,
}: {
  conv: { id: string; title: string; state?: Record<string, unknown>; is_favorite?: boolean; folder_id?: string | null };
  active: boolean;
  folders: Array<{ id: string; name: string }>;
  onOpen: () => void;
  onDelete: () => void;
  onRename: () => void;
  onFav: () => void;
  onMove: (folderId: string | null) => void;
}) {
  const ads = Array.isArray(conv.state?.generatedAds) ? (conv.state!.generatedAds as Array<{ kind?: string }>) : [];
  const vidCount = ads.filter((a) => a.kind === "video").length;
  const imgCount = ads.filter((a) => a.kind === "image").length;
  const carCount = ads.filter((a) => a.kind === "carousel").length;
  const total = vidCount + imgCount + carCount;
  return (
    <div
      className={`group relative min-w-0 cursor-pointer overflow-hidden rounded-lg px-2.5 py-1.5 transition ${
        active ? "bg-background shadow-sm ring-1 ring-primary/30" : "hover:bg-background/70"
      }`}
      onClick={onOpen}
    >
      <div className="flex items-center gap-1.5">
        {conv.is_favorite && <Star className="h-3 w-3 shrink-0 fill-amber-400 text-amber-400" />}
        <div className={`min-w-0 flex-1 truncate text-[12.5px] ${active ? "font-medium text-foreground" : "text-foreground/85"}`}>
          {conv.title || "Nouvelle pub"}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              onClick={(e) => e.stopPropagation()}
              className="shrink-0 rounded p-0.5 text-muted-foreground opacity-0 transition hover:bg-muted hover:text-foreground group-hover:opacity-100 data-[state=open]:opacity-100"
              aria-label="Options"
            >
              <MoreHorizontal className="h-3.5 w-3.5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48" onClick={(e) => e.stopPropagation()}>
            <DropdownMenuItem onClick={onFav}>
              <Star className={`mr-2 h-3.5 w-3.5 ${conv.is_favorite ? "fill-amber-400 text-amber-400" : ""}`} />
              {conv.is_favorite ? "Retirer des favoris" : "Ajouter aux favoris"}
            </DropdownMenuItem>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Folder className="mr-2 h-3.5 w-3.5" /> Déplacer vers…
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="w-44">
                <DropdownMenuItem onClick={() => onMove(null)}>
                  <X className="mr-2 h-3.5 w-3.5" /> Aucun dossier
                </DropdownMenuItem>
                {folders.length > 0 && <DropdownMenuSeparator />}
                {folders.map((f) => (
                  <DropdownMenuItem key={f.id} onClick={() => onMove(f.id)} disabled={f.id === conv.folder_id}>
                    <Folder className="mr-2 h-3.5 w-3.5" /> {f.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuItem onClick={onRename}>
              <Pencil className="mr-2 h-3.5 w-3.5" /> Renommer
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive">
              <Trash2 className="mr-2 h-3.5 w-3.5" /> Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {total > 0 && (
        <div className="mt-1 flex items-center gap-1">
          {vidCount > 0 && (
            <span className="inline-flex items-center gap-0.5 rounded-full bg-primary/10 px-1.5 py-0 text-[9px] font-medium text-primary">
              <Video className="h-2 w-2" />{vidCount}
            </span>
          )}
          {imgCount > 0 && (
            <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-500/10 px-1.5 py-0 text-[9px] font-medium text-emerald-600">
              <ImageIcon className="h-2 w-2" />{imgCount}
            </span>
          )}
          {carCount > 0 && (
            <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-500/10 px-1.5 py-0 text-[9px] font-medium text-amber-600">
              <Layers className="h-2 w-2" />{carCount}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Agent tool blocks - rendus interactifs pour les outils backend
// (list_creations, list_campaigns, duplicate_campaign, search_content)
// ============================================================================

type ToolPart = {
  type?: string;
  toolCallId?: string;
  state?: string;
  input?: Record<string, unknown>;
  output?: Record<string, unknown>;
};

function AgentToolBlocks({
  message,
  onSuggestion,
  onEditCreation,
  onAdCreated,
  briefSuperseded = false,
  conversationId = null,
}: {
  message: UIMessage;
  onSuggestion: (text: string) => void;
  onEditCreation?: (adId: string, url: string, title: string, kind: "image" | "video" | "carousel") => void;
  onAdCreated?: (ad: GeneratedAd) => void;
  /** True quand un message utilisateur plus récent existe : les cartes de brief ne s'affichent plus. */
  briefSuperseded?: boolean;
  conversationId?: string | null;
}) {
  const parts = (message.parts ?? []) as ToolPart[];
  const toolParts = parts.filter(
    (p) =>
      p.type === "tool-list_creations" ||
      p.type === "tool-list_campaigns" ||
      p.type === "tool-meta_list_campaigns" ||
      p.type === "tool-duplicate_campaign" ||
      p.type === "tool-search_content" ||
      p.type === "tool-creation_action_menu" ||
      p.type === "tool-duplicate_creation" ||
      p.type === "tool-download_creation" ||
      p.type === "tool-generate_media" ||
      p.type === "tool-meta_performance" ||
      p.type === "tool-meta_preview_ad" ||
      p.type === "tool-continuation_brief" ||
      p.type === "tool-propose_strategy" ||
      p.type === "tool-research_competitor_ads" ||
      p.type === "tool-continue_video" ||
      p.type === "tool-meta_list_leads" ||
      p.type === "tool-meta_list_ad_accounts" ||
      p.type === "tool-meta_list_pages" ||
      p.type === "tool-meta_list_lead_forms" ||
      p.type === "tool-meta_list_saved_audiences",

  );

  // Statut visible pendant les étapes longues sans rendu dédié (jamais de bulle vide).
  const PENDING_LABELS: Record<string, string> = {
    "tool-fetch_url": "J'analyse ta page produit… (jusqu'à 1 minute)",
    "tool-analyze_video": "Je regarde ta vidéo…",
    "tool-analyze_audio": "J'écoute ton audio…",
    "tool-validate_strategy": "Je prépare la suite…",
  };
  const pending = parts.filter(
    (p) => PENDING_LABELS[p.type ?? ""] && p.output === undefined && p.state !== "output-error",
  );
  if (toolParts.length === 0 && pending.length === 0) return null;
  return (
    <div className="pl-11 space-y-3">
      {pending.map((p, i) => (
        <div key={`${message.id}-pending-${p.toolCallId ?? i}`} className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1.5 text-xs text-muted-foreground">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          {PENDING_LABELS[p.type ?? ""]}
        </div>
      ))}
      {toolParts.map((p, i) => {
        const key = `${message.id}-tool-${p.toolCallId ?? i}`;
        if (p.type === "tool-list_creations") {
          return <CreationsPickerBlock key={key} output={p.output} onSubmit={onSuggestion} />;
        }
        if (p.type === "tool-list_campaigns") {
          return <CampaignsPickerBlock key={key} output={p.output} onSubmit={onSuggestion} />;
        }
        if (p.type === "tool-meta_list_campaigns") {
          return <CampaignsPickerBlock key={key} output={p.output} onSubmit={onSuggestion} />;
        }
        if (p.type === "tool-meta_list_leads") {
          const o = p.output as Record<string, unknown> | undefined;
          if (o?.needsSelection) return <CampaignsPickerBlock key={key} output={o} onSubmit={onSuggestion} />;
          return <LeadsResultBlock key={key} state={p.state} output={o} />;
        }
        if (
          p.type === "tool-meta_list_ad_accounts" ||
          p.type === "tool-meta_list_pages" ||
          p.type === "tool-meta_list_lead_forms" ||
          p.type === "tool-meta_list_saved_audiences"
        ) {
          return <GenericMultiListBlock key={key} type={p.type} output={p.output} onSubmit={onSuggestion} />;
        }
        if (p.type === "tool-duplicate_campaign") {
          return <DuplicateCampaignResultBlock key={key} output={p.output} />;
        }
        if (p.type === "tool-search_content") {
          return <SearchContentResultBlock key={key} output={p.output} onSubmit={onSuggestion} />;
        }
        if (p.type === "tool-creation_action_menu") {
          return <CreationActionMenuBlock key={key} output={p.output} onSubmit={onSuggestion} onEditCreation={onEditCreation} />;
        }
        if (p.type === "tool-duplicate_creation") {
          return <SimpleToolResultBlock key={key} icon="copy" output={p.output} labelKey="newTitle" />;
        }
        if (p.type === "tool-download_creation") {
          return <DownloadCreationResultBlock key={key} output={p.output} />;
        }
        if (p.type === "tool-generate_media") {
          return <MediaAssetBlock key={key} output={p.output} state={p.state} conversationId={conversationId ?? null} />;
        }
        if (p.type === "tool-meta_performance") {
          return <MetaPerformanceBlock key={key} state={p.state} output={p.output} onAsk={onSuggestion} />;
        }

        if (p.type === "tool-meta_preview_ad") {
          return <MetaAdPreviewBlock key={key} output={p.output} />;
        }
        if (p.type === "tool-research_competitor_ads") {
          return <CompetitorAdsCard key={key} output={p.output as Record<string, unknown> | undefined} onSubmit={onSuggestion} />;
        }
        if (p.type === "tool-propose_strategy") {
          if ((p.output as { blocked?: boolean } | undefined)?.blocked) return null;
          const validated = (parts ?? []).some((x) => x.type === "tool-validate_strategy");
          return (
            <StrategyCard
              key={key}
              output={(p.input ?? p.output) as Record<string, unknown> | undefined}
              validated={validated}
              onSubmit={onSuggestion}
            />
          );
        }
        if (p.type === "tool-continuation_brief") {

          if (briefSuperseded) return null;
          return (
            <ContinuationBriefBlock
              key={key}
              output={p.output}
              messageId={message.id}
              onAdCreated={onAdCreated}
            />
          );
        }
        return null;

      })}
    </div>
  );
}


/** Brief de prolongation éditable : l'utilisateur corrige le texte et génère tel quel. */
function ContinuationBriefBlock({
  output,
  messageId,
  onAdCreated,
}: {
  output?: Record<string, unknown>;
  messageId: string;
  onAdCreated?: (ad: GeneratedAd) => void;
}) {
  const ok = output?.ok === true;
  const initialBrief = typeof output?.brief === "string" ? (output.brief as string) : "";
  const parentAdId = typeof output?.parentAdId === "string" ? (output.parentAdId as string) : "";
  const [text, setText] = useState(initialBrief);
  const [busy, setBusy] = useState(false);
  const [launched, setLaunched] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const runContinue = useServerFn(continueAd);

  if (dismissed) return null;

  if (!ok || !parentAdId) {
    const err = typeof output?.error === "string" ? (output.error as string) : null;
    return err ? (
      <div className="rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-2 text-xs text-destructive">{err}</div>
    ) : null;
  }

  const edited = text.trim() !== initialBrief.trim();

  const generate = async () => {
    if (text.trim().length < 10) {
      toast.error("Le brief est trop court.");
      return;
    }
    setBusy(true);
    try {
      const res = await runContinue({
        data: { parentAdId, prompt: text.trim(), duration: "7", aspectRatio: "auto" },
      });
      setLaunched(true);
      onAdCreated?.({
        id: res.adId,
        kind: "video",
        title: res.title || "Suite de la vidéo",
        status: "pending",
        afterMessageId: messageId,
        createdAt: Date.now(),
      });
      toast.success("Suite en cours de génération…");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "La suite n'a pas pu être lancée.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-2xl border border-primary/40 bg-gradient-to-br from-primary/5 via-background to-background p-4 shadow-elegant">
      <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
        <Wand2 className="h-4 w-4 text-primary" />
        Brief de la suite {typeof output?.parentTitle === "string" && output.parentTitle ? `— ${output.parentTitle}` : ""}
      </div>
      <p className="mb-2 text-xs text-muted-foreground">
        Modifie directement le texte si besoin, puis génère : le brief est utilisé <em>mot pour mot</em>. Durée fixe : 7 secondes.
      </p>
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={busy || launched}
        className="min-h-[170px] resize-y rounded-xl border-border/70 bg-background text-sm leading-relaxed"
      />
      {launched ? (
        <p className="mt-3 text-xs text-primary">✅ Suite lancée — elle apparaît juste en dessous.</p>
      ) : (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Button
            className="bg-grad rounded-full text-white shadow-elegant hover:opacity-90"
            onClick={generate}
            disabled={busy || text.trim().length < 10}
          >
            {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
            {busy ? "Génération…" : edited ? "Valider mes corrections & générer" : "Générer tel quel"}
            {!busy ? <CreditCost credits={creditCost("fal-ai/veo3.1/extend-video", { seconds: 7 })} /> : null}
          </Button>
          {edited && (
            <Button variant="ghost" size="sm" className="rounded-full" onClick={() => setText(initialBrief)} disabled={busy}>
              Rétablir le brief IA
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full text-muted-foreground hover:text-foreground"
            onClick={() => setDismissed(true)}
            disabled={busy}
          >
            <X className="mr-1 h-4 w-4" />
            Annuler
          </Button>
        </div>
      )}
    </div>
  );
}


/** Chiffres Meta dans le fil : indicateur de chargement puis mini-tableau par campagne. */
function MetaPerformanceBlock({ state, output, onAsk }: { state?: string; output?: Record<string, unknown>; onAsk?: (message: string) => void }) {
  const done = state === "output-available" && !!output;
  if (!done) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-xs text-muted-foreground">
        <span className="h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        Je regarde tes chiffres…
      </div>
    );
  }
  return <MetaPerformanceTableWithToggle output={output!} onAsk={onAsk} />;
}

function MetaPerformanceTableWithToggle({ output, onAsk }: { output: Record<string, unknown>; onAsk?: (message: string) => void }) {
  const [showHidden, setShowHidden] = useState(false);
  const data = output as { ok?: boolean; campaigns?: ChatCampaignRow[]; hiddenCampaigns?: ChatCampaignRow[]; campaignFilterApplied?: boolean };
  const campaigns = Array.isArray(data?.campaigns) ? data.campaigns : [];
  const hidden = Array.isArray(data?.hiddenCampaigns) ? data.hiddenCampaigns : [];
  if (!data?.ok || (campaigns.length === 0 && hidden.length === 0)) return null;
  return (
    <div className="space-y-2">
      {hidden.length > 0 && (
        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          <Switch checked={showHidden} onCheckedChange={setShowHidden} />
          Inclure les campagnes non actives ({hidden.length})
        </label>
      )}
      <ChatPerformanceTable campaigns={showHidden ? [...campaigns, ...hidden] : campaigns} showTotal={data.campaignFilterApplied === true} alreadyDetailed={data.campaignFilterApplied === true} onAsk={onAsk} />
    </div>
  );
}

type MetaPreviewOutput = {
  ok?: boolean;
  error?: string;
  pageName?: string;
  headline?: string;
  primaryText?: string;
  description?: string;
  cta?: string;
  focusField?: "headline" | "primaryText" | "description" | "cta" | null;
  destinationLabel?: string;
  pagePictureUrl?: string | null;
  items?: Array<{ id: string; title: string; mediaUrl: string | null; isVideo: boolean }>;
};

/** Dernier aperçu Meta émis dans la conversation (pour le panneau latéral). */
function findLatestMetaPreview(messages: UIMessage[]): MetaPreviewOutput | null {
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    const parts = (messages[i]?.parts ?? []) as ToolPart[];
    for (let j = parts.length - 1; j >= 0; j -= 1) {
      const p = parts[j];
      if (p?.type === "tool-meta_preview_ad" && p.output) {
        const data = p.output as MetaPreviewOutput;
        if (data.ok && data.items?.length) return data;
      }
    }
  }
  return null;
}

function metaPreviewItems(data: MetaPreviewOutput): AdPreviewItem[] {
  return (data.items ?? []).map((it) => ({
    id: it.id,
    headline: data.headline ?? it.title,
    description: data.primaryText ?? "",
    linkDescription: data.description || undefined,
    cta: data.cta ?? "En savoir plus",
    mediaUrl: it.mediaUrl,
    isVideo: it.isVideo,
  }));
}

/** Panneau collant à droite : l'aperçu suit chaque question du parcours Meta. */
function MetaLivePreviewPanel({ data }: { data: MetaPreviewOutput }) {
  return (
    <div className="hidden h-full w-[360px] shrink-0 border-l border-border/60 bg-background/60 xl:block">
      <div className="sticky top-0 space-y-3 p-4">
        <div>
          <div className="text-sm font-semibold">Aperçu en direct</div>
          <div className="text-[11px] text-muted-foreground">
            Le mockup se met à jour à chaque réponse.
          </div>
        </div>
        <MetaAdPreview
          items={metaPreviewItems(data)}
          pageName={data.pageName ?? "Votre Page"}
          pagePictureUrl={data.pagePictureUrl ?? undefined}
          destinationLabel={data.destinationLabel}
          focus={data.focusField ?? null}
        />
      </div>
    </div>
  );
}

function MetaAdPreviewBlock({ output }: { output: Record<string, unknown> | undefined }) {
  const data = (output ?? {}) as MetaPreviewOutput;
  if (!data.ok || !data.items?.length) {
    return data.error ? (
      <div className="rounded-xl border border-border bg-card p-3 text-xs text-muted-foreground">
        Aperçu indisponible - {data.error}
      </div>
    ) : null;
  }
  return (
    <div className="rounded-2xl border border-border bg-card p-4 space-y-3 xl:hidden">
      <div className="text-sm font-semibold">Aperçu de votre publicité</div>
      <MetaAdPreview
        items={metaPreviewItems(data)}
        pageName={data.pageName ?? "Votre Page"}
        pagePictureUrl={data.pagePictureUrl ?? undefined}
        destinationLabel={data.destinationLabel}
        focus={data.focusField ?? null}
      />
      <p className="text-[11px] text-muted-foreground">
        Rendu approximatif des placements Meta (Fil, Story, Reels).
      </p>
    </div>
  );
}


function MediaAssetBlock({
  output,
  state,
  conversationId,
}: {
  output: Record<string, unknown> | undefined;
  /** État de l'appel d'outil : tant que la sortie n'est pas là, on n'affiche PAS d'échec. */
  state?: string;
  conversationId?: string | null;
}) {
  const mediaAssetId = output && typeof output === "object" ? (output as { mediaAssetId?: string }).mediaAssetId : undefined;
  const ok = output && typeof output === "object" ? (output as { ok?: boolean }).ok : undefined;
  const errorMsg = output && typeof output === "object" ? (output as { error?: string }).error : undefined;
  const userMessage = output && typeof output === "object" ? (output as { userMessage?: string }).userMessage : undefined;
  const kindHint = output && typeof output === "object" ? (output as { kind?: string }).kind : undefined;
  const titleHint = output && typeof output === "object" ? (output as { title?: string | null }).title : undefined;
  const awaitingOutput = !output || ok === undefined;

  const [status, setStatus] = useState<"pending" | "completed" | "failed">("pending");
  const [url, setUrl] = useState<string | null>(null);
  const [kind, setKind] = useState<string | null>(kindHint ?? null);
  const [title, setTitle] = useState<string | null>(titleHint ?? null);
  const [err, setErr] = useState<string | null>(null);
  const [startedAt, setStartedAt] = useState<number>(() => Date.now());
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (status !== "pending") return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [status]);

  const getAsset = useServerFn(getMediaAsset);
  const refresh = useServerFn(refreshPendingMediaAssets);
  // Une fois le média prêt, on le promeut en « création » pour retrouver les
  // actions habituelles (rogner, scinder, recadrer, continuer, ranger…).
  const promote = useServerFn(promoteMediaAssetToAd);
  const [adId, setAdId] = useState<string | null>(null);
  useEffect(() => {
    if (status !== "completed" || !mediaAssetId || adId) return;
    if (kind !== "video" && kind !== "image") return;
    let cancelled = false;
    promote({ data: { id: mediaAssetId } })
      .then((res) => { if (!cancelled && res?.adId) setAdId(res.adId); })
      .catch((e) => console.error("[MediaAssetBlock] promote", (e as Error).message));
    return () => { cancelled = true; };
  }, [status, mediaAssetId, kind, adId, promote]);

  useEffect(() => {
    if (!mediaAssetId || !ok) return;
    let cancelled = false;
    let attempts = 0;
    async function poll() {
      if (cancelled) return;
      attempts++;
      try {
        if (attempts % 2 === 1) await refresh({});
        const res = await getAsset({ data: { id: mediaAssetId } });
        if (cancelled) return;
        const a = res.asset;
        if (a) {
          setKind(a.kind);
          setTitle(a.title);
          if (a.created_at) setStartedAt(parseGenerationStart(a.created_at));
          if (a.status === "completed" && a.url) {
            setUrl(a.url);
            setStatus("completed");
            return;
          }
          if (a.status === "failed") {
            setErr(a.error_message ?? "Génération échouée");
            setStatus("failed");
            return;
          }
        }
      } catch (e) {
        console.error("[MediaAssetBlock] poll", (e as Error).message);
      }
      if (attempts < 60 && !cancelled) setTimeout(poll, 4000);
    }
    poll();
    return () => { cancelled = true; };
  }, [mediaAssetId, ok, getAsset, refresh]);

  // L'appel d'outil est encore en cours de streaming : aucune sortie n'est
  // disponible, ce n'est PAS un échec. On affiche l'amorçage.
  if (awaitingOutput) {
    if (state === "output-error") {
      return (
        <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
          Échec : la génération n'a pas pu démarrer. Réessaie dans un instant.
        </div>
      );
    }
    return (
      <div className="flex items-center gap-2 rounded-xl border bg-card p-4 text-sm text-muted-foreground">
        <div className="h-3 w-3 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        Lancement de la génération…
      </div>
    );
  }

  if (!ok) {
    return (
      <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
        Échec : {userMessage ?? errorMsg ?? "impossible de lancer la génération."}
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card p-4 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm font-medium truncate">{title ?? "Média en cours"}</div>
        <div className="text-xs text-muted-foreground uppercase tracking-wide">{kind ?? "media"}</div>
      </div>
      {status === "pending" && (() => {
        const estimateKind: "video" | "image" = kind === "image" ? "image" : "video";
        const ageMs = Math.max(0, now - startedAt);
        const { progress, remainingMs, overdue, stalled } = getGenerationProgress(estimateKind, ageMs);
        return (
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2 text-sm">
              <span className="flex items-center gap-2 text-muted-foreground">
                <div className="h-3 w-3 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                {stalled
                  ? "Toujours en vérification automatique"
                  : overdue
                    ? "Plus long que prévu, on continue…"
                    : "Génération en cours…"}
              </span>
              <span className="text-xs font-medium tabular-nums text-muted-foreground">
                {overdue
                  ? `${formatGenerationDuration(ageMs)} écoulées`
                  : `~${formatGenerationDuration(remainingMs)} restantes`}
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted ring-1 ring-border/60">
              <div
                className="relative h-full overflow-hidden rounded-full bg-primary transition-all duration-1000 ease-out"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute inset-0 -translate-x-full animate-[slide-in-right_1.4s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-primary-foreground/40 to-transparent" />
              </div>
            </div>
            <div className="text-[11px] text-muted-foreground/80">
              Temps estimé — la vidéo apparaîtra ici automatiquement.
            </div>
          </div>
        );
      })()}
      {status === "failed" && (
        <div className="text-sm text-destructive">Échec : {err ?? "erreur inconnue"}</div>
      )}
      {status === "completed" && url && kind === "audio" && (
        <audio controls src={url} className="w-full" />
      )}
      {status === "completed" && url && kind === "video" && (
        <video controls src={url} className="w-full rounded-lg max-h-[500px]" />
      )}
      {status === "completed" && url && kind === "image" && (
        <img src={url} alt={title ?? "média"} className="w-full rounded-lg max-h-[500px] object-contain" />
      )}
      {status === "completed" && url && kind === "model_3d" && (
        <Model3DViewer url={url} />
      )}
      {status === "completed" && url && kind !== "audio" && kind !== "video" && kind !== "image" && kind !== "model_3d" && (
        <a href={url} target="_blank" rel="noreferrer" className="text-sm text-primary underline">Télécharger le média</a>
      )}
      {status === "completed" && url && adId && (kind === "video" || kind === "image") && (
        <div className="-mx-4 -mb-4">
          <GeneratedAdActions
            ad={{
              id: adId,
              kind: kind === "video" ? "video" : "image",
              title: title ?? "Média généré",
              url,
              status: "ready",
            }}
            conversationId={conversationId ?? null}
          />
        </div>
      )}
    </div>
  );
}

function Model3DViewer({ url }: { url: string }) {
  useEffect(() => {
    if (document.querySelector('script[data-model-viewer]')) return;
    const s = document.createElement("script");
    s.type = "module";
    s.src = "https://unpkg.com/@google/model-viewer@3/dist/model-viewer.min.js";
    s.setAttribute("data-model-viewer", "1");
    document.head.appendChild(s);
  }, []);
  return (
    <div className="space-y-2">
      {/* @ts-expect-error web component */}
      <model-viewer
        src={url}
        camera-controls
        auto-rotate
        ar
        style={{ width: "100%", height: "400px", background: "#0a0a0a", borderRadius: "0.5rem" }}
      />
      <a href={url} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline">Télécharger le modèle .glb</a>
    </div>
  );
}


function CreationsPickerBlock({
  output,
  onSubmit,
}: {
  output: Record<string, unknown> | undefined;
  onSubmit: (text: string) => void;
}) {
  type PickerItem = { id: string; title: string; contentType: "image" | "video" | "carousel"; thumbUrl: string | null };
  type PickerBatch = { batchId: string; title: string; count: number; thumbnails: string[]; adIds: string[]; items: PickerItem[] };
  const items = Array.isArray(output?.items) ? (output!.items as PickerItem[]) : [];
  const batches = Array.isArray(output?.batches) ? (output!.batches as PickerBatch[]) : [];
  const allItems = useMemo(() => [...items, ...batches.flatMap((b) => b.items ?? [])], [items, batches]);
  const purpose = (output?.purpose as string) ?? "select_for_campaign";
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [submitted, setSubmitted] = useState(false);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const multi = purpose !== "select_for_edit";
  const q = search.trim().toLowerCase();
  const visible = q ? items.filter((it) => (it.title ?? "").toLowerCase().includes(q)) : items;

  if (items.length === 0 && batches.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border/70 bg-muted/30 p-4 text-sm text-muted-foreground">
        Aucune création prête pour l'instant. <Link to="/create" search={{}} className="text-primary underline">Créer ma première pub</Link>.
      </div>
    );
  }


  const toggle = (id: string) => {
    if (submitted) return;
    setSelected((prev) => {
      if (!multi) return new Set([id]);
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleBatch = (batch: PickerBatch) => {
    if (submitted) return;
    const ids = batch.adIds ?? [];
    setSelected((prev) => {
      if (!multi) return new Set(ids.slice(0, 1));
      const next = new Set(prev);
      const allIn = ids.every((id) => next.has(id));
      ids.forEach((id) => { if (allIn) next.delete(id); else next.add(id); });
      return next;
    });
  };

  const confirm = () => {
    if (selected.size === 0 || submitted) return;
    const chosen = allItems.filter((it) => selected.has(it.id));

    const titles = chosen.map((c) => `« ${c.title} »`).join(", ");
    const idsJson = JSON.stringify(chosen.map((c) => c.id));
    const action =
      purpose === "select_for_edit"
        ? "Je veux modifier cette création"
        : purpose === "select_for_campaign"
          ? `Je sélectionne ${chosen.length} création(s) pour la campagne : ${titles}`
          : `Voici ma sélection : ${titles}`;
    setSubmitted(true);
    const mediaJson = JSON.stringify(
      chosen.map((c) => ({ t: c.title, u: c.thumbUrl ?? null, k: c.contentType })),
    );
    onSubmit(`${action}\n<!--selected-creatives:${idsJson}-->\n<!--selected-media:${mediaJson}-->`);

  };

  return (
    <div className="rounded-2xl border border-border/70 bg-background/50 p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {multi ? `Sélectionne tes créations (${selected.size}/${allItems.length})` : "Choisis une création"}
        </div>

        {!submitted && (
          <Button size="sm" onClick={confirm} disabled={selected.size === 0}>
            {multi ? "Utiliser la sélection" : "Utiliser"} <ArrowRight className="ml-1 h-3.5 w-3.5" />
          </Button>
        )}
      </div>
      {items.length > 4 && !submitted && (
        <div className="relative mb-3">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher une création…"
            className="h-8 pl-8 text-xs"
          />
        </div>
      )}
      {visible.length === 0 && batches.length === 0 && (
        <div className="py-4 text-center text-xs text-muted-foreground">Aucune création ne correspond à « {search} ».</div>
      )}
      {batches.length > 0 && (
        <div className="mb-3 space-y-2">
          {batches.map((b) => {
            const ids = b.adIds ?? [];
            const allIn = ids.length > 0 && ids.every((id) => selected.has(id));
            const open = expanded.has(b.batchId);
            return (
              <div key={b.batchId} className={`rounded-xl border p-2 ${allIn ? "border-primary ring-2 ring-primary/30" : "border-border"}`}>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    disabled={submitted}
                    onClick={() => toggleBatch(b)}
                    className="grid h-14 w-14 shrink-0 grid-cols-2 grid-rows-2 gap-px overflow-hidden rounded-lg bg-muted"
                    aria-label={`Sélectionner le lot ${b.title}`}
                  >
                    {(b.thumbnails ?? []).slice(0, 4).map((src, i) => (
                      <img key={i} src={src} alt="" className="h-full w-full object-cover" loading="lazy" />
                    ))}
                  </button>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold">{b.title}</p>
                    <p className="text-[11px] text-muted-foreground">Lot · {b.count} pub{b.count > 1 ? "s" : ""}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2 text-[11px]"
                    onClick={() => setExpanded((prev) => {
                      const next = new Set(prev);
                      if (next.has(b.batchId)) next.delete(b.batchId); else next.add(b.batchId);
                      return next;
                    })}
                  >
                    {open ? "Replier" : "Déplier"}
                  </Button>
                </div>
                {open && (
                  <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-5">
                    {(b.items ?? []).map((it) => {
                      const isSel = selected.has(it.id);
                      return (
                        <button
                          key={it.id}
                          type="button"
                          disabled={submitted}
                          onClick={() => toggle(it.id)}
                          className={`relative overflow-hidden rounded-md border ${isSel ? "border-primary ring-2 ring-primary/40" : "border-border"}`}
                        >
                          <div className="aspect-square w-full bg-muted">
                            {it.thumbUrl && <img src={it.thumbUrl} alt={it.title} className="h-full w-full object-cover" loading="lazy" />}
                          </div>
                          {isSel && (
                            <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground">
                              <Check className="h-2.5 w-2.5" />
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
        {visible.map((it) => {
          const isSel = selected.has(it.id);
          const Icon = it.contentType === "video" ? Video : it.contentType === "carousel" ? Layers : ImageIcon;
          return (
            <button
              key={it.id}
              type="button"
              onClick={() => toggle(it.id)}
              disabled={submitted}
              className={`group relative overflow-hidden rounded-lg border text-left transition ${
                isSel ? "border-primary ring-2 ring-primary/40" : "border-border hover:border-primary/50"
              } ${submitted ? "opacity-70" : ""}`}
            >
              <div className="relative aspect-square w-full bg-muted">
                {it.thumbUrl ? (
                  it.contentType === "video" ? (
                    <video src={it.thumbUrl} className="h-full w-full object-cover" muted playsInline preload="metadata" />
                  ) : (
                    <img src={it.thumbUrl} alt={it.title} className="h-full w-full object-cover" loading="lazy" />
                  )
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                    <Icon className="h-6 w-6" />
                  </div>
                )}
                {isSel && (
                  <div className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground shadow">
                    <Check className="h-3 w-3" />
                  </div>
                )}
                <div className="absolute left-1 top-1 rounded-full bg-background/80 p-1 backdrop-blur">
                  <Icon className="h-3 w-3 text-primary" />
                </div>
              </div>
              <div className="truncate p-1.5 text-[11px] font-medium">{it.title}</div>
            </button>
          );
        })}
      </div>
      {submitted && (
        <div className="mt-3 text-xs text-muted-foreground">Sélection envoyée ✅</div>
      )}
    </div>
  );
}

const CAMPAIGN_INTENT_TEXT: Record<string, (names: string) => string> = {
  leads: (n) => `Donne-moi les leads de : ${n}`,
  performance: (n) => `Montre-moi les performances de : ${n}`,
  pause: (n) => `Mets en pause : ${n}`,
  resume: (n) => `Réactive : ${n}`,
  select_for_duplicate: (n) => `Je veux dupliquer : ${n}`,
  edit: (n) => `Je veux modifier : ${n}`,
};

function CampaignsPickerBlock({
  output,
  onSubmit,
}: {
  output: Record<string, unknown> | undefined;
  onSubmit: (text: string) => void;
}) {
  type Row = { id: string; name: string; status: string; objective?: string | null; adCount?: number; ads_count?: number; first_ad_id?: string | null; budget?: number | null; budgetType?: string | null; accountName?: string | null; leads?: number };
  const rows = (Array.isArray(output?.items) ? output!.items : []) as Row[];
  const hidden = (Array.isArray(output?.hiddenByDefault) ? output!.hiddenByDefault : []) as Row[];
  const purpose = (output?.purpose as string) ?? "select_for_view";
  const intent = (output?.intent as string) ?? (purpose === "select_for_duplicate" ? "select_for_duplicate" : purpose === "select_for_live_edit" ? "edit" : "browse");
  const selection = output?.selection as PickerSelection | undefined;
  const toItem = (c: Row): PickerItem => {
    const ads = c.adCount ?? c.ads_count ?? 0;
    const bits = [c.objective, `${ads} pub${ads > 1 ? "s" : ""}`, typeof c.leads === "number" && c.leads > 0 ? `${c.leads} lead${c.leads > 1 ? "s" : ""}` : null, c.budget != null ? `${c.budget}€ ${c.budgetType === "daily" ? "/jour" : "total"}` : null, c.accountName].filter(Boolean);
    return { id: c.id, name: c.name, status: c.status, subtitle: bits.join(" · ") };
  };
  const byId = new Map([...rows, ...hidden].map((c) => [c.id, c]));
  const title =
    intent === "leads" ? "Campagnes pour les leads" : intent === "performance" ? "Campagnes à analyser" : intent === "select_for_duplicate" ? "Quelle campagne dupliquer ?" : "Tes campagnes";
  return (
    <SelectionPicker
      title={title}
      noun="campagnes"
      items={rows.map(toItem)}
      hiddenItems={hidden.map(toItem)}
      selection={selection}
      onConfirm={(picked) => {
        const names = picked.map((p) => `« ${p.name} »`).join(", ");
        if (picked.length === 1 && (intent === "edit" || intent === "browse")) {
          const c = byId.get(picked[0].id);
          const text = intent === "edit"
            ? `Je veux modifier la campagne Meta « ${picked[0].name} »${c?.first_ad_id ? ` (ad Meta id: ${c.first_ad_id})` : ""}`
            : `Je choisis la campagne « ${picked[0].name} »`;
          onSubmit(`${text}\n<!--selected-campaign:"${picked[0].id}"-->${c?.first_ad_id ? `\n<!--selected-meta-ad:"${c.first_ad_id}"-->` : ""}`);
          return;
        }
        const text = (CAMPAIGN_INTENT_TEXT[intent] ?? ((n: string) => `J'ai sélectionné : ${n}`))(names);
        onSubmit(`${text}\n<!--selected-campaigns:${JSON.stringify(picked.map((p) => p.id))}-->`);
      }}
    />
  );
}

const LIST_BLOCK_CONFIG: Record<string, { title: string; noun: string; verb: string; tag: string }> = {
  "tool-meta_list_ad_accounts": { title: "Comptes publicitaires", noun: "comptes", verb: "Je choisis les comptes", tag: "selected-ad-accounts" },
  "tool-meta_list_pages": { title: "Pages Facebook", noun: "pages", verb: "Je choisis les Pages", tag: "selected-pages" },
  "tool-meta_list_lead_forms": { title: "Formulaires de leads", noun: "formulaires", verb: "Je choisis les formulaires", tag: "selected-lead-forms" },
  "tool-meta_list_saved_audiences": { title: "Audiences", noun: "audiences", verb: "Je choisis les audiences", tag: "selected-audiences" },
};

/** Listes Meta : en choix unique, les suggestions du message suffisent ; en multiple, sélecteur à cases. */
function GenericMultiListBlock({ type, output, onSubmit }: { type?: string; output?: Record<string, unknown>; onSubmit: (text: string) => void }) {
  const cfg = LIST_BLOCK_CONFIG[type ?? ""];
  const selection = output?.selection as PickerSelection | undefined;
  if (!cfg || !output?.ok || selection?.mode !== "multiple") return null;
  type Row = { id: string; name: string; status?: string; pageName?: string; currency?: string | null; type?: string };
  const rows: Row[] = type === "tool-meta_list_saved_audiences"
    ? [...((output.savedAudiences as Row[]) ?? []), ...((output.customAudiences as Row[]) ?? [])]
    : ((output.items as Row[]) ?? []);
  return (
    <SelectionPicker
      title={cfg.title}
      noun={cfg.noun}
      selection={selection}
      items={rows.map((r) => ({ id: r.id, name: r.name, status: r.status, subtitle: r.pageName ?? r.currency ?? (r.type === "custom" ? "Audience personnalisée" : r.type === "saved" ? "Audience enregistrée" : undefined) }))}
      onConfirm={(picked) =>
        onSubmit(`${cfg.verb} : ${picked.map((p) => `« ${p.name} »`).join(", ")}\n<!--${cfg.tag}:${JSON.stringify(picked.map((p) => p.id))}-->`)
      }
    />
  );
}

/** Leads de plusieurs campagnes : répartition + tableau. */
type LeadsRow = { id: string; name: string | null; email: string | null; phone: string | null; status: string; date: string; campaignName: string; form?: string | null; ad?: string | null; fields?: Record<string, string>; fieldIssues?: string[] };

function LeadsResultBlock({ state, output }: { state?: string; output?: Record<string, unknown> }) {
  const [formFilter, setFormFilter] = useState<string>("all");
  if (state !== "output-available" || !output) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-xs text-muted-foreground">
        <Loader2 className="h-3 w-3 animate-spin" /> Je récupère tes leads…
      </div>
    );
  }
  if (output.ok === false) {
    return <div className="rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-2 text-xs text-destructive">{String(output.error ?? "Leads indisponibles.")}</div>;
  }
  const allLeads = (output?.leads as LeadsRow[]) ?? [];
  const formOptions = [...new Set(allLeads.map((l) => l.form ?? "Formulaire inconnu"))];
  const rawLeads = formFilter === "all" ? allLeads : allLeads.filter((l) => (l.form ?? "Formulaire inconnu") === formFilter);
  const norm = (v?: string | null) => (v ?? "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9@+]/g, "");
  // Remove duplicated leads (same person sent twice / same lead stored twice)
  const seenLead = new Set<string>();
  const leads = rawLeads.filter((l) => {
    const key = l.id && !(l.email || l.phone) ? l.id : `${norm(l.email ?? l.fields?.email)}|${norm(l.phone ?? l.fields?.phone_number)}|${norm(l.name ?? l.fields?.full_name)}`;
    if (seenLead.has(key)) return false;
    seenLead.add(key);
    return true;
  });
  const per = (output.perCampaign as Array<{ campaignId: string; campaignName: string; count: number }>) ?? [];
  const total = formFilter !== "all" ? leads.length : typeof output.count === "number" ? Math.min(output.count, leads.length || output.count) : leads.length;
  const consistency = output.consistency as { ok: boolean; message?: string } | undefined;
  const BASE = new Set(["fullname", "name", "nom", "nomcomplet", "email", "mail", "adresseemail", "phonenumber", "phone", "telephone", "numerodetelephone"]);
  const fieldKeys: string[] = [];
  const seenKeys = new Set<string>();
  for (const l of leads) for (const k of Object.keys(l.fields ?? {})) {
    const nk = norm(k.replace(/_/g, ""));
    if (BASE.has(nk) || seenKeys.has(nk)) continue;
    seenKeys.add(nk);
    fieldKeys.push(k);
  }
  // Hide columns that only repeat the name, e-mail or phone already shown
  for (let i = fieldKeys.length - 1; i >= 0; i--) {
    const k = fieldKeys[i];
    const dup = leads.every((l) => {
      const v = norm(l.fields?.[k]);
      return !v || v === norm(l.name ?? l.fields?.full_name) || v === norm(l.email ?? l.fields?.email) || v === norm(l.phone ?? l.fields?.phone_number);
    });
    if (dup) fieldKeys.splice(i, 1);
  }
  const label = (k: string) => {
    const t = k.replace(/_/g, " ").replace(/\s+([?:])/g, "$1").trim();
    return ({ "post code": "Code postal", city: "Ville", "first name": "Prénom", "last name": "Nom de famille" } as Record<string, string>)[t] ?? t.charAt(0).toUpperCase() + t.slice(1);
  };
  const pretty = (v?: string) => (v ?? "").replace(/_/g, " ");
  const downloadCsv = () => {
    const head = ["Date et heure", "Nom", "E-mail", "Téléphone", ...fieldKeys.map(label), "Statut", "Campagne", "Formulaire", "Publicité", "Champs non identifiés"];
    const rows = leads.map((l) => [
      l.date ? new Date(l.date).toLocaleString("fr-FR") : "",
      l.name ?? "",
      l.email ?? "",
      l.phone ?? "",
      ...fieldKeys.map((k) => pretty(l.fields?.[k])),
      l.status ?? "",
      l.campaignName ?? "",
      l.form ?? "",
      l.ad ?? "",
      (l.fieldIssues ?? []).map((k) => LEAD_ISSUE_LABEL[k] ?? k).join(", "),
    ]);
    const esc = (v: string) => `"${String(v).replace(/"/g, '""')}"`;
    const csv = "\uFEFF" + [head, ...rows].map((r) => r.map(esc).join(";")).join("\r\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    const slug = (per.length === 1 ? per[0].campaignName : "campagnes").replace(/[^\w-]+/g, "_").slice(0, 60);
    a.download = `leads_${slug}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <LeadsTableCard
      leads={leads}
      per={per}
      total={total}
      fieldKeys={fieldKeys}
      label={label}
      pretty={pretty}
      downloadCsv={downloadCsv}
      consistency={consistency}
      formOptions={formOptions}
      formFilter={formFilter}
      setFormFilter={setFormFilter}
    />
  );
}

function LeadCell({ value, issue }: { value: string | null; issue?: boolean }) {
  if (value) return <>{value}</>;
  if (issue) return <span className="rounded bg-destructive/10 px-1.5 py-0.5 text-[10px] font-medium text-destructive" title="La réponse reçue n'a pas la forme attendue : voir les réponses du formulaire.">Champ non identifié</span>;
  return <>—</>;
}

function LeadsTableCard({ leads, per, total, fieldKeys, label, pretty, downloadCsv, consistency, formOptions, formFilter, setFormFilter }: {
  leads: LeadsRow[];
  formOptions: string[];
  formFilter: string;
  setFormFilter: (v: string) => void;
  per: Array<{ campaignId: string; campaignName: string; count: number }>;
  total: number;
  fieldKeys: string[];
  label: (k: string) => string;
  pretty: (v?: string) => string;
  downloadCsv: () => void;
  consistency?: { ok: boolean; message?: string };
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const updateArrows = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    updateArrows();
    const el = scrollRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(updateArrows);
    ro.observe(el);
    return () => ro.disconnect();
  }, [updateArrows, leads.length, fieldKeys.length]);

  const scrollBy = (dir: 1 | -1) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.max(240, el.clientWidth * 0.7), behavior: "smooth" });
  };

  return (
    <div className="rounded-xl border border-border bg-card p-3 shadow-sm">
      {consistency && !consistency.ok && (
        <div className="mb-2 rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-2 text-xs text-destructive">{consistency.message}</div>
      )}
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <div className="text-sm font-semibold">
          {total} lead{total > 1 ? "s" : ""} · {per.length} campagne{per.length > 1 ? "s" : ""}
          {total > leads.length && <span className="ml-2 text-xs font-normal text-muted-foreground">({leads.length} plus récents listés)</span>}
        </div>
        <div className="flex items-center gap-3">
          {leads.length > 0 && (
            <Button size="sm" variant="outline" className="h-7 gap-1.5 text-xs" onClick={downloadCsv}>
              <Download className="h-3.5 w-3.5" /> Télécharger (CSV)
            </Button>
          )}
          <Link to="/leads" className="text-xs font-medium text-primary hover:underline">Voir tous les leads →</Link>
        </div>
      </div>
      <div className="mb-2 flex flex-wrap gap-1.5">
        {per.map((c) => (
          <Badge key={c.campaignId} variant="neutral">{c.campaignName} · {c.count}</Badge>
        ))}
      </div>
      {formOptions.length > 1 && (
        <div className="mb-2 flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-muted-foreground">Formulaire :</span>
          {["all", ...formOptions].map((f) => (
            <button key={f} type="button" onClick={() => setFormFilter(f)}
              className={`rounded-full border px-2.5 py-0.5 transition ${formFilter === f ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:bg-muted"}`}>
              {f === "all" ? "Tous" : f}
            </button>
          ))}
        </div>
      )}
      {leads.length === 0 ? (
        <div className="py-3 text-center text-xs text-muted-foreground">Aucun lead sur cette période.</div>
      ) : (
        <div className="relative">
          {canLeft && (
            <button
              type="button"
              aria-label="Faire défiler vers la gauche"
              onClick={() => scrollBy(-1)}
              className="absolute left-0 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card/95 text-foreground shadow-md hover:bg-accent"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}
          {canRight && (
            <button
              type="button"
              aria-label="Faire défiler vers la droite"
              onClick={() => scrollBy(1)}
              className="absolute right-0 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card/95 text-foreground shadow-md hover:bg-accent"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
          <div
            ref={scrollRef}
            onScroll={updateArrows}
            className="leads-scroll max-h-[420px] overflow-auto"
          >
            <table className="w-max min-w-full text-left text-xs">
              <thead className="sticky top-0 z-[1] bg-card text-muted-foreground">
                <tr>
                  <th className="whitespace-nowrap py-1.5 pr-3 font-medium">Date et heure</th>
                  <th className="whitespace-nowrap pr-3 font-medium">Nom</th>
                  <th className="whitespace-nowrap pr-3 font-medium">E-mail</th>
                  <th className="whitespace-nowrap pr-3 font-medium">Téléphone</th>
                  {fieldKeys.map((k) => <th key={k} className="min-w-[140px] max-w-[220px] pr-3 font-medium">{label(k)}</th>)}
                  {per.length > 1 && <th className="pr-3 font-medium">Campagne</th>}
                  <th className="whitespace-nowrap pr-3 font-medium">Formulaire</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((l) => (
                  <tr key={l.id} className="border-t border-border align-top">
                    <td className="whitespace-nowrap py-1.5 pr-3">{l.date ? new Date(l.date).toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—"}</td>
                    <td className="whitespace-nowrap pr-3"><LeadCell value={l.name} issue={l.fieldIssues?.includes("full_name")} /></td>
                    <td className="whitespace-nowrap pr-3"><LeadCell value={l.email} issue={l.fieldIssues?.includes("email")} /></td>
                    <td className="whitespace-nowrap pr-3"><LeadCell value={l.phone} issue={l.fieldIssues?.includes("phone")} /></td>
                    {fieldKeys.map((k) => <td key={k} className="min-w-[140px] max-w-[220px] break-words pr-3">{pretty(l.fields?.[k]) || "—"}</td>)}
                    {per.length > 1 && <td className="max-w-[160px] truncate whitespace-nowrap pr-3">{l.campaignName}</td>}
                    <td className="max-w-[200px] truncate whitespace-nowrap pr-3" title={l.form ?? undefined}>{l.form ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function DuplicateCampaignResultBlock({ output }: { output: Record<string, unknown> | undefined }) {
  if (!output || output.ok === false) {
    return (
      <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
        Duplication échouée : {String(output?.error ?? "erreur inconnue")}
      </div>
    );
  }
  const newId = output.newCampaignId as string;
  const newName = output.newName as string;
  const adSets = (output.adSetsCloned as number) ?? 0;
  const ads = (output.adsCloned as number) ?? 0;
  return (
    <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/[0.06] p-4 shadow-sm">
      <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700 dark:text-emerald-400">
        <Check className="h-4 w-4" /> Campagne dupliquée
      </div>
      <div className="mt-1 text-sm">
        <span className="font-medium">« {newName} »</span> créée avec {adSets} ad set{adSets > 1 ? "s" : ""} et {ads} annonce{ads > 1 ? "s" : ""}.
      </div>
      <div className="mt-3">
        <Link
          to="/campaigns/$id"
          params={{ id: newId } as never}
          className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white shadow hover:bg-emerald-700"
        >
          Ouvrir la nouvelle campagne <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}

function SearchContentResultBlock({
  output,
  onSubmit,
}: {
  output: Record<string, unknown> | undefined;
  onSubmit: (text: string) => void;
}) {
  const creations = Array.isArray(output?.creations) ? (output!.creations as Array<{ id: string; title: string; contentType: string; status: string }>) : [];
  const campaigns = Array.isArray(output?.campaigns) ? (output!.campaigns as Array<{ id: string; name: string; objective: string; status: string }>) : [];
  if (creations.length === 0 && campaigns.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border/70 bg-muted/30 p-3 text-xs text-muted-foreground">
        Aucun résultat pour « {String(output?.query ?? "")} ».
      </div>
    );
  }
  return (
    <div className="rounded-2xl border border-border/70 bg-background/50 p-3 shadow-sm space-y-3">
      {creations.length > 0 && (
        <div>
          <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Créations ({creations.length})</div>
          <div className="space-y-1">
            {creations.map((c) => {
              const Icon = c.contentType === "video" ? Video : c.contentType === "carousel" ? Layers : ImageIcon;
              return (
                <button
                  key={c.id}
                  onClick={() => onSubmit(`Je veux modifier « ${c.title} »\n<!--selected-creatives:${JSON.stringify([c.id])}-->`)}
                  className="flex w-full items-center gap-2 rounded-lg border border-border/60 px-3 py-2 text-left text-xs hover:border-primary/60 hover:bg-primary/[0.04]"
                >
                  <Icon className="h-3.5 w-3.5 text-primary" />
                  <span className="flex-1 truncate">{c.title}</span>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              );
            })}
          </div>
        </div>
      )}
      {campaigns.length > 0 && (
        <div>
          <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Campagnes ({campaigns.length})</div>
          <div className="space-y-1">
            {campaigns.map((c) => (
              <Link
                key={c.id}
                to="/campaigns/$id"
                params={{ id: c.id } as never}
                className="flex items-center gap-2 rounded-lg border border-border/60 px-3 py-2 text-xs hover:border-primary/60 hover:bg-primary/[0.04]"
              >
                <Megaphone className="h-3.5 w-3.5 text-primary" />
                <span className="flex-1 truncate">{c.name}</span>
                <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">{c.status}</span>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ================= Creation Action Menu =================
function CreationActionMenuBlock({
  output,
  onSubmit,
  onEditCreation,
}: {
  output: Record<string, unknown> | undefined;
  onSubmit: (text: string) => void;
  onEditCreation?: (adId: string, url: string, title: string, kind: "image" | "video" | "carousel") => void;
}) {
  const ad = output?.ad as
    | {
        id: string;
        title: string;
        contentType: "image" | "video" | "carousel";
        thumbUrl: string | null;
        downloadUrl: string | null;
        actor?: { id: string; name: string; style: string | null } | null;
        brief?: string | null;
      }
    | undefined;
  if (!ad) {
    return (
      <div className="rounded-xl border border-dashed border-border/70 bg-muted/30 p-3 text-xs text-muted-foreground">
        Création introuvable.
      </div>
    );
  }
  const idJson = JSON.stringify([ad.id]);
  const send = (text: string) => onSubmit(`${text}\n<!--selected-creatives:${idJson}-->`);
  const Icon = ad.contentType === "video" ? Video : ad.contentType === "carousel" ? Layers : ImageIcon;
  const actor = ad.actor ?? null;

  const actions: Array<{ label: string; icon: typeof Wand2; onClick: () => void; danger?: boolean; hidden?: boolean }> = [
    {
      label: "Modifier le visuel",
      icon: Wand2,
      onClick: () => {
        if (ad.contentType === "image" && ad.downloadUrl && onEditCreation) {
          onEditCreation(ad.id, ad.downloadUrl, ad.title, "image");
          toast.info("Décris ce que tu veux changer sur l'image, puis envoie.");
        } else {
          send("Je veux modifier cette création. Voici ce que je veux changer :");
        }
      },
    },
    { label: "Décliner en 9:16", icon: Crop, onClick: () => send("Décline cette création au format 9:16 (Reels/Stories)."), hidden: ad.contentType === "carousel" },
    { label: "Décliner en 1:1", icon: Crop, onClick: () => send("Décline cette création au format 1:1 (feed)."), hidden: ad.contentType === "carousel" },
    { label: "Décliner en 16:9", icon: Crop, onClick: () => send("Décline cette création au format 16:9 (YouTube/Display)."), hidden: ad.contentType === "carousel" },
    { label: "Ajouter des sous-titres", icon: Captions, onClick: () => send("Ajoute des sous-titres à cette vidéo."), hidden: ad.contentType !== "video" },
    { label: "Dupliquer", icon: Copy, onClick: () => send("Duplique cette création.") },
    { label: "Publier sur Meta", icon: Megaphone, onClick: () => send(`Je veux publier cette création sur Meta.`) },
    { label: "Ajouter à une campagne", icon: Plus, onClick: () => send("Ajoute cette création à une campagne existante - montre-moi mes campagnes.") },
    {
      label: "Télécharger",
      icon: Download,
      onClick: () => {
        if (ad.downloadUrl) window.open(ad.downloadUrl, "_blank", "noopener");
        else send("Donne-moi le lien de téléchargement de cette création.");
      },
    },
    { label: "Renommer", icon: Pencil, onClick: () => send("Renomme cette création - je vais te donner le nouveau titre.") },
    { label: "Supprimer", icon: Trash2, onClick: () => send("Supprime définitivement cette création."), danger: true },
  ].filter((a) => !a.hidden);

  return (
    <div className="rounded-2xl border border-border/70 bg-background/50 p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
          {ad.thumbUrl ? (
            ad.contentType === "video" ? (
              <video src={ad.thumbUrl} className="h-full w-full object-cover" muted playsInline preload="metadata" />
            ) : (
              <img src={ad.thumbUrl} alt={ad.title} className="h-full w-full object-cover" />
            )
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
              <Icon className="h-6 w-6" />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Que veux-tu faire avec cette création ?</div>
          <div className="mt-0.5 truncate text-sm font-semibold">{ad.title}</div>
          <div className="mt-0.5 text-xs text-muted-foreground capitalize">
            {ad.contentType}
            {actor && <span> · Acteur : <span className="font-medium text-foreground">{actor.name}</span>{actor.style ? ` (${actor.style})` : ""}</span>}
          </div>
        </div>
      </div>

      {actor && (
        <div className="mt-3 rounded-xl border border-primary/40 bg-primary/[0.06] p-3">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-primary">Acteur identifié</div>
          <div className="mt-1 text-sm">
            Cette création utilise <span className="font-semibold">{actor.name}</span>. Tu peux relancer une nouvelle pub avec cet acteur.
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => send(`Je veux créer une NOUVELLE pub UGC avec l'acteur "${actor.name}" (le même que sur cette création). Garde cet acteur pour la suite du chat et demande-moi le nouveau brief (produit, angle, texte parlé).`)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90"
            >
              <Wand2 className="h-3.5 w-3.5" /> Nouvelle pub avec {actor.name}
            </button>
            <button
              type="button"
              onClick={() => send(`Refais une variation de cette pub avec le même acteur "${actor.name}" mais un angle / texte différent - propose-moi 3 idées.`)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-primary/40 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/10"
            >
              <Copy className="h-3.5 w-3.5" /> Variation même acteur
            </button>
          </div>
        </div>
      )}

      <div className="mt-4 grid grid-cols-2 gap-1.5 sm:grid-cols-3">
        {actions.map((a) => (
          <button
            key={a.label}
            type="button"
            onClick={a.onClick}
            className={`flex items-center gap-2 rounded-lg border px-2.5 py-2 text-left text-xs transition ${
              a.danger
                ? "border-destructive/40 text-destructive hover:bg-destructive/10"
                : "border-border/60 hover:border-primary/60 hover:bg-primary/[0.04]"
            }`}
          >
            <a.icon className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{a.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}


function SimpleToolResultBlock({
  output,
  icon,
  labelKey,
}: {
  output: Record<string, unknown> | undefined;
  icon: "copy";
  labelKey: string;
}) {
  const ok = output?.ok === true;
  const label = output?.[labelKey];
  const Icon = icon === "copy" ? Copy : Check;
  if (!ok) {
    return (
      <div className="rounded-xl border border-destructive/40 bg-destructive/5 px-3 py-2 text-xs text-destructive">
        {String(output?.error ?? "L'action a échoué.")}
      </div>
    );
  }
  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
      <Icon className="h-3.5 w-3.5" />
      {typeof label === "string" && label.length > 0 ? `Créée : « ${label} »` : "Action effectuée."}
    </div>
  );
}

function DownloadCreationResultBlock({
  output,
}: {
  output: Record<string, unknown> | undefined;
}) {
  const ok = output?.ok === true;
  if (!ok) {
    return (
      <div className="rounded-xl border border-destructive/40 bg-destructive/5 px-3 py-2 text-xs text-destructive">
        {String(output?.error ?? "Téléchargement indisponible.")}
      </div>
    );
  }
  const url = String(output?.url ?? "");
  const title = String(output?.title ?? "création");
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      download
      className="inline-flex items-center gap-2 rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground shadow hover:opacity-90"
    >
      <Download className="h-3.5 w-3.5" /> Télécharger « {title} »
    </a>
  );
}

type CatalogItem = { url: string; label: string; sub?: string; id?: string };

function CatalogPickerDialog({
  open,
  onOpenChange,
  onConfirm,
  defaultTab = "actors",
  actorProfileText = "",
}: {
  actorProfileText?: string;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onConfirm: (urls: string[], kind: "avatars" | "products" | "actors" | "shopify", labels: string[], ids: string[]) => void;
  defaultTab?: "avatars" | "products" | "actors" | "shopify";
}) {
  const listAvatarsFn = useServerFn(listAvatars);
  const listFoldersFn = useServerFn(listProductFolders);
  const listActorsFn = useServerFn(listStockActors);
  const listShopifyFn = useServerFn(listShopifyProducts);
  const [tab, setTab] = useState<"avatars" | "products" | "actors" | "shopify">(defaultTab);
  const [selected, setSelected] = useState<Record<string, CatalogItem>>({});
  const [actorQuery, setActorQuery] = useState("");

  useEffect(() => {
    if (open) setTab(defaultTab);
  }, [open, defaultTab]);

  const avatarsQ = useQuery({
    queryKey: ["catalog-picker", "avatars"],
    queryFn: () => listAvatarsFn(),
    enabled: open,
    staleTime: 60_000,
  });
  const foldersQ = useQuery({
    queryKey: ["catalog-picker", "product-folders"],
    queryFn: () => listFoldersFn(),
    enabled: open,
    staleTime: 60_000,
  });
  const actorsQ = useQuery({
    queryKey: ["catalog-picker", "stock-actors"],
    queryFn: () => listActorsFn(),
    enabled: open,
    staleTime: 60_000,
  });
  const shopifyQ = useQuery({
    queryKey: ["catalog-picker", "shopify-products"],
    queryFn: () => listShopifyFn({ data: {} }),
    enabled: open,
    staleTime: 60_000,
  });

  useEffect(() => {
    if (!open) {
      setSelected({});
      setActorQuery("");
    }
  }, [open]);

  const toggle = (item: CatalogItem) => {
    setSelected((prev) => {
      const next = { ...prev };
      if (next[item.url]) delete next[item.url];
      else next[item.url] = item;
      return next;
    });
  };

  const selectedList = Object.values(selected);

  const avatars = (avatarsQ.data as any[] | undefined) ?? [];
  const folders = (foldersQ.data as any[] | undefined) ?? [];
  const actors = (actorsQ.data as any[] | undefined) ?? [];
  const shopifyConnected = (shopifyQ.data as any)?.connected === true;
  const shopifyProducts = ((shopifyQ.data as any)?.products ?? []) as any[];
  const actorProfile = inferActorProfile(actorProfileText);
  const filteredActors = rankActorsForProfile(actors, actorProfile).filter((a) => {
    const q = actorQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      a.name?.toLowerCase().includes(q) ||
      (a.description ?? "").toLowerCase().includes(q) ||
      (a.style ?? "").toLowerCase().includes(q) ||
      (a.tags ?? []).some((t: string) => t.toLowerCase().includes(q))
    );
  });

  const toAbsolute = (u: string) => (u.startsWith("http") ? u : `${window.location.origin}${u}`);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Choisir un visuel ou un acteur</DialogTitle>
          <DialogDescription>
            Joins un avatar, un visuel produit ou un acteur UGC pré-défini à ton message.
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-1 rounded-lg bg-muted p-1 w-fit">
          <button
            type="button"
            onClick={() => setTab("products")}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${tab === "products" ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
          >
            <ShoppingCart className="inline h-3.5 w-3.5 mr-1.5 -mt-0.5" />
            Mes produits ({folders.reduce((n, f) => n + (f.images?.length ?? 0), 0)})
          </button>
          <button
            type="button"
            onClick={() => setTab("actors")}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${tab === "actors" ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
          >
            <Users className="inline h-3.5 w-3.5 mr-1.5 -mt-0.5" />
            Mes acteurs ({actors.length + avatars.length})
          </button>
          <button
            type="button"
            onClick={() => setTab("shopify")}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${tab === "shopify" ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
          >
            <ShoppingBag className="inline h-3.5 w-3.5 mr-1.5 -mt-0.5" />
            Shopify ({shopifyProducts.length})
          </button>
        </div>

        {tab === "actors" && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={actorQuery}
              onChange={(e) => setActorQuery(e.target.value)}
              placeholder="Rechercher par nom, style ou tag…"
              className="pl-9"
            />
          </div>
        )}

        <ScrollArea className="max-h-[55vh] pr-2">
          {tab === "actors" && avatars.length > 0 && (
            <div className="space-y-4">
              <div className="text-sm font-semibold">Mes acteurs</div>
              {avatarsQ.isLoading ? (
                <div className="flex items-center justify-center py-10 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" /> Chargement…
                </div>
              ) : avatars.length === 0 ? (
                <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                  Aucun avatar dans ton catalogue.{" "}
                  <Link to="/galerie" className="text-primary underline">Créer un acteur</Link>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                  {avatars.flatMap((av: any) => {
                    const imgs: Array<{ url: string; label: string }> = [];
                    if (av.image_url) imgs.push({ url: av.image_url, label: "Face" });
                    for (const i of av.images ?? []) {
                      if (i?.url && i.url !== av.image_url) imgs.push({ url: i.url, label: i.view_label || "" });
                    }
                    return imgs.map((img) => {
                      const item: CatalogItem = { url: img.url, label: av.name, sub: img.label };
                      const isSel = !!selected[img.url];
                      return (
                        <button
                          key={img.url}
                          type="button"
                          onClick={() => toggle(item)}
                          className={`group relative aspect-[3/4] overflow-hidden rounded-lg border transition ${isSel ? "border-primary ring-2 ring-primary" : "border-border hover:border-primary/50"}`}
                        >
                          <img src={img.url} alt={av.name} className="h-full w-full object-cover" />
                          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-1.5 text-left">
                            <div className="text-[10px] font-semibold text-white truncate">{av.name}</div>
                            {img.label && <div className="text-[9px] text-white/70">{img.label}</div>}
                          </div>
                          {isSel && (
                            <div className="absolute top-1.5 right-1.5 h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                              <Check className="h-3 w-3" />
                            </div>
                          )}
                        </button>
                      );
                    });
                  })}
                </div>
              )}
            </div>
          )}

          {tab === "products" && (
            <div className="space-y-6">
              {foldersQ.isLoading ? (
                <div className="flex items-center justify-center py-10 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" /> Chargement…
                </div>
              ) : folders.length === 0 ? (
                <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                  Aucun produit dans ton catalogue.{" "}
                  <Link to="/catalogue/produits" className="text-primary underline">Ajouter un produit</Link>
                </div>
              ) : (
                folders.map((f: any) => (
                  <div key={f.id}>
                    <div className="mb-2 text-sm font-semibold">{f.name}</div>
                    {(f.images?.length ?? 0) === 0 ? (
                      <div className="text-xs text-muted-foreground italic">Aucune image dans ce dossier.</div>
                    ) : (
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                        {f.images.map((img: any) => {
                          if (!img?.url) return null;
                          const item: CatalogItem = { url: img.url, label: f.name };
                          const isSel = !!selected[img.url];
                          return (
                            <button
                              key={img.id}
                              type="button"
                              onClick={() => toggle(item)}
                              className={`group relative aspect-square overflow-hidden rounded-lg border transition ${isSel ? "border-primary ring-2 ring-primary" : "border-border hover:border-primary/50"}`}
                            >
                              <img src={img.url} alt={f.name} className="h-full w-full object-cover" />
                              {isSel && (
                                <div className="absolute top-1.5 right-1.5 h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                                  <Check className="h-3 w-3" />
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {tab === "actors" && (
            <div className="space-y-4">
              {avatars.length > 0 && <div className="text-sm font-semibold">Galerie d'acteurs UGC</div>}
              {actorsQ.isLoading ? (
                <div className="flex items-center justify-center py-10 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" /> Chargement…
                </div>
              ) : filteredActors.length === 0 ? (
                <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                  Aucun acteur ne correspond à cette recherche.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {filteredActors.map((actor: any) => {
                    const url = toAbsolute(actor.reference_image_url as string);
                    const item: CatalogItem = { url, label: actor.name, sub: actor.style ?? undefined, id: actor.id as string };
                    const isSel = !!selected[url];
                    return (
                      <ActorPickCard
                        key={actor.id}
                        actor={actor}
                        selected={isSel}
                        onClick={() => toggle(item)}
                      />
                    );
                  })}

                </div>
              )}
            </div>
          )}
          {tab === "shopify" && (
            <div className="space-y-4">
              {shopifyQ.isLoading ? (
                <div className="flex items-center justify-center py-10 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" /> Chargement…
                </div>
              ) : !shopifyConnected ? (
                <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                  Aucune boutique Shopify connectée.{" "}
                  <Link to="/connexions" className="text-primary underline">Connecter ma boutique</Link>
                </div>
              ) : shopifyProducts.length === 0 ? (
                <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                  Aucun produit trouvé dans la boutique connectée.
                </div>
              ) : (
                shopifyProducts.map((p: any) => (
                  <div key={p.id}>
                    <div className="mb-2 flex items-baseline gap-2">
                      <span className="text-sm font-semibold">{p.title}</span>
                      {p.price && (
                        <span className="text-xs text-muted-foreground">
                          {p.price} {p.currency ?? ""}
                        </span>
                      )}
                    </div>
                    {(p.images?.length ?? 0) === 0 ? (
                      <div className="text-xs text-muted-foreground italic">Aucune image pour ce produit.</div>
                    ) : (
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                        {p.images.map((url: string) => {
                          const item: CatalogItem = { url, label: p.title };
                          const isSel = !!selected[url];
                          return (
                            <button
                              key={url}
                              type="button"
                              onClick={() => toggle(item)}
                              className={`group relative aspect-square overflow-hidden rounded-lg border transition ${isSel ? "border-primary ring-2 ring-primary" : "border-border hover:border-primary/50"}`}
                            >
                              <img src={url} alt={p.title} className="h-full w-full object-cover" />
                              {isSel && (
                                <div className="absolute top-1.5 right-1.5 h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                                  <Check className="h-3 w-3" />
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </ScrollArea>


        <DialogFooter className="items-center justify-between sm:justify-between">
          <div className="text-xs text-muted-foreground">
            {selectedList.length} sélectionné{selectedList.length > 1 ? "s" : ""}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
            <Button
              disabled={selectedList.length === 0}
              onClick={() => onConfirm(selectedList.map((i) => i.url), tab, selectedList.map((i) => i.label), selectedList.map((i) => i.id ?? ""))}
            >
              {tab === "actors" ? "Utiliser cet acteur" : "Joindre"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ActorPickCard({ actor, selected, onClick }: { actor: any; selected: boolean; onClick: () => void }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const enter = () => {
    if (!actor.preview_video_url || !videoRef.current) return;
    videoRef.current.currentTime = 0;
    void videoRef.current.play().catch(() => undefined);
    setPlaying(true);
  };
  const leave = () => {
    if (!videoRef.current) return;
    videoRef.current.pause();
    setPlaying(false);
  };
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={enter}
      onMouseLeave={leave}
      onTouchStart={enter}
      className={`group relative aspect-[3/4] overflow-hidden rounded-lg border transition ${selected ? "border-primary ring-2 ring-primary" : "border-border hover:border-primary/50"}`}
    >
      <img
        src={actor.reference_image_url}
        alt={actor.name}
        className={`h-full w-full object-cover transition-opacity duration-300 ${playing ? "opacity-0" : "opacity-100"}`}
      />
      {actor.preview_video_url && (
        <video
          ref={videoRef}
          src={actor.preview_video_url}
          muted
          playsInline
          loop
          preload="none"
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${playing ? "opacity-100" : "opacity-0"}`}
        />
      )}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-2 text-left">
        <div className="text-[11px] font-semibold text-white truncate">{actor.name}</div>
        {actor.style && <div className="text-[10px] text-white/80 truncate">{actor.style}</div>}
      </div>
      {selected && (
        <div className="absolute top-1.5 right-1.5 h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
          <Check className="h-3 w-3" />
        </div>
      )}
    </button>
  );
}



function CompetitorRefChip({ ref_, onRemove }: { ref_: CompetitorRef; onRemove?: () => void }) {
  return (
    <div className="flex max-w-[14rem] items-center gap-2 rounded-lg border border-border bg-muted/60 py-1 pl-1 pr-1.5 text-xs">
      <div className="h-8 w-8 shrink-0 overflow-hidden rounded-md bg-background">
        {ref_.mediaUrl && ref_.mediaType === "image" ? (
          <img src={ref_.mediaUrl} alt="" className="h-full w-full object-cover" />
        ) : ref_.mediaUrl && ref_.mediaType === "video" ? (
          <video src={ref_.mediaUrl} className="h-full w-full object-cover" muted preload="metadata" />
        ) : null}
      </div>
      <span className="min-w-0 truncate font-medium">{ref_.pageName ?? "Annonce"}</span>
      {onRemove ? (
        <button
          type="button"
          onClick={onRemove}
          className="shrink-0 rounded-md p-0.5 text-muted-foreground hover:bg-background hover:text-foreground"
          aria-label={`Retirer la référence ${ref_.pageName ?? ""}`.trim()}
        >
          <X className="h-3.5 w-3.5" />
        </button>
      ) : null}
    </div>
  );
}
