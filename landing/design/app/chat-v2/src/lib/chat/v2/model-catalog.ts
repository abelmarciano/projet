/**
 * Chat v2 : catalogue des IA de génération présenté au modèle, et contrôle
 * des seules impossibilités techniques. Le choix appartient à Claude ; le
 * serveur refuse uniquement ce qui ne peut pas marcher.
 * Les clés sont celles de src/lib/generation-routing.ts (VIDEO_MODELS,
 * IMAGE_MODELS) : submitVideoAd et generateAdImage les acceptent déjà dans
 * modelOverride.
 */
import { IMAGE_MODELS, VIDEO_MODELS, type ImageModelKey, type VideoModelKey } from "@/lib/generation-routing";

export const VIDEO_KEYS = ["veo-3.1", "happyhorse-1", "seedance-2", "kling-3"] as const satisfies readonly VideoModelKey[];
export const IMAGE_KEYS = ["nano-banana-2", "seedream-4.5", "gemini-3-pro-image"] as const satisfies readonly ImageModelKey[];
export const GENERATION_MODEL_KEYS = [...VIDEO_KEYS, ...IMAGE_KEYS] as [string, ...string[]];

export function isVideoModelKey(v: unknown): v is VideoModelKey {
  return typeof v === "string" && (VIDEO_KEYS as readonly string[]).includes(v);
}
export function isImageModelKey(v: unknown): v is ImageModelKey {
  return typeof v === "string" && (IMAGE_KEYS as readonly string[]).includes(v);
}

export const GENERATION_CATALOG_TEXT = `## IA DE GÉNÉRATION (c'est toi qui choisis)
Dans ready_to_generate, renseigne generationModel avec la meilleure IA pour ce besoin et modelReason (une phrase simple pour le client, sans jargon : « IA choisie pour… »). Choisis selon le résultat attendu, la langue parlée, la durée, la présence du produit et le budget du client. Tu peux mentionner ton choix en une phrase.

VIDÉO
- veo-3.1 : la meilleure qualité d'image et de son. Voix et lèvres synchronisées, parle très bien français. 8 s par plan. Idéale pour un acteur UGC face caméra, une voix off soignée, un rendu premium. La plus chère (environ 3 fois happyhorse-1).
- happyhorse-1 : voix et lèvres synchronisées, français explicitement pris en charge, de 3 à 15 s en un seul plan. Très bon rapport qualité-prix. Idéale pour un UGC parlé plus long que 8 s ou un budget serré.
- seedance-2 : vidéo produit SANS son (musique ajoutée ensuite possible), de 4 à 12 s. La plus fidèle au produit réel grâce aux photos de référence. Exige au moins une photo (produit ou acteur). Idéale pour un packshot, une mise en scène produit, une animation de photo.
- kling-3 : vidéo SANS son, 5 ou 10 s, très bon mouvement de caméra et de corps, prix bas. Idéale pour une ambiance ou une scène cinématique sans parole.
Cas particuliers gérés automatiquement : vidéo de 16 ou 24 s avec parole = plusieurs plans de 8 s enchaînés (videoDurationSec 16 ou 24) ; vidéo multi-scènes de 10 à 30 s en un seul rendu = proMultiScene (le modèle est alors imposé).

IMAGE ET CARROUSEL
- nano-banana-2 : choix par défaut. Très fidèle au produit photographié, rendu photoréaliste, prix bas.
- seedream-4.5 : la meilleure pour du texte lisible dans l'image (prix, offre, accroche longue) et la haute définition.
- gemini-3-pro-image : rendu photo le plus haut de gamme, pour une image premium sans beaucoup de texte.

IMPOSSIBLE (le serveur refusera) : une IA sans son pour une vidéo avec parole ou voix off ; une durée que l'IA ne fait pas ; seedance-2 sans aucune photo ; une IA vidéo pour une image, ou l'inverse.`;

export interface GenerationChoiceInput {
  mediaType: "video" | "image" | "carousel";
  generationModel?: string | null;
  /** Parole dans la vidéo : acteur qui parle, voix off, style UGC. */
  hasVoice: boolean;
  /** Durée demandée, si connue. */
  durationSec?: number | null;
  proMultiScene?: boolean;
  /** Au moins une photo disponible (produit ou acteur). */
  hasSourceImage: boolean;
}

export type GenerationChoiceResult = { ok: true } | { ok: false; message: string };

/** Refuse uniquement l'impossible ; tout le reste est le choix de Claude. */
export function checkGenerationChoice(i: GenerationChoiceInput): GenerationChoiceResult {
  const key = i.generationModel ?? null;
  if (!key || i.proMultiScene) return { ok: true };
  if (i.mediaType === "video") {
    if (!isVideoModelKey(key)) {
      return { ok: false, message: `« ${key} » n'est pas une IA vidéo. Choisis parmi : ${VIDEO_KEYS.join(", ")}.` };
    }
    const m = VIDEO_MODELS[key];
    if (i.hasVoice && !m.supportsNativeAudio) {
      return { ok: false, message: `${key} ne produit pas de son : impossible pour une vidéo avec parole ou voix off. Choisis veo-3.1 ou happyhorse-1.` };
    }
    if (!i.hasSourceImage && !m.fal.t2v) {
      return { ok: false, message: `${key} a besoin d'au moins une photo (produit ou acteur), et il n'y en a pas. Choisis une autre IA ou demande une photo.` };
    }
    const d = typeof i.durationSec === "number" && i.durationSec > 0 ? i.durationSec : null;
    const chained = d === 16 || d === 24;
    if (d && !chained && !m.durationsSec.includes(d)) {
      return { ok: false, message: `${key} ne fait pas de vidéo de ${d} s (durées possibles : ${m.durationsSec.join(", ")} s). Change d'IA ou propose une durée possible au client.` };
    }
    return { ok: true };
  }
  if (!isImageModelKey(key)) {
    return { ok: false, message: `« ${key} » n'est pas une IA d'image. Choisis parmi : ${IMAGE_KEYS.join(", ")}.` };
  }
  if (!IMAGE_MODELS[key]) return { ok: false, message: `IA d'image inconnue : ${key}.` };
  return { ok: true };
}
