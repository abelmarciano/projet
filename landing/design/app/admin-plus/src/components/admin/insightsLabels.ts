/* Libellés français des codes techniques (crédits, actions, sources de génération). */

export const CREDIT_KIND_LABEL: Record<string, string> = {
  hold: "Réservation",
  commit: "Débit",
  refund: "Remboursement",
  grant: "Ajout",
  adjustment: "Ajustement admin",
  expire: "Expiration",
  rollover: "Report",
};

export const ACTION_LABEL: Record<string, string> = {
  chat_message: "Message du Chat",
  ai_assist: "Assistance IA",
  video_generation: "Vidéo générée",
  voiceover: "Voix off",
  captions: "Sous-titres",
  video_continue: "Prolongation vidéo",
  media_image_retouch: "Retouche d'image",
  image_generation: "Image générée",
  refund_unrequested_premium: "Remboursement : premium non demandé",
  sequence_merge: "Assemblage de séquences",
  media_voiceover_only: "Voix off seule",
  video_concat: "Montage vidéo",
  media_image_heavy_text: "Image avec beaucoup de texte",
  refund_failed_generation: "Remboursement : génération échouée",
  stripe_plan_grant: "Crédits de l'abonnement",
  video_edit: "Édition vidéo",
  media_lipsync_dub: "Doublage synchronisé",
  media_talking_avatar: "Avatar parlant",
  avatar_generation: "Avatar généré",
  media_image_upscale: "Agrandissement d'image",
  media_video_product_swap: "Remplacement de produit (vidéo)",
  comp_access_grant: "Accès offert",
  media_video_upscale: "Agrandissement de vidéo",
  welcome_bonus: "Bonus de bienvenue",
  stripe_unpaid_renewal_reversal: "Annulation : renouvellement impayé",
  monthly_grant: "Crédits du mois",
  rollover_cap: "Plafond de report",
  chain_refund: "Remboursement : enchaînement vidéo",
  monthly_rollover: "Report du mois",
  refund_missing_product_reference: "Remboursement : produit manquant",
  admin_adjustment: "Ajustement admin",
  llm_chat_turn: "IA texte : réponses du Chat",
  llm_creative_prompt: "IA texte : prompts créatifs",
  llm_creative_prompt_rewrite: "IA texte : réécriture de prompts",
  llm_copy_review: "IA texte : relecture des textes",
};

export const actionLabel = (code: string | null | undefined) =>
  code ? ACTION_LABEL[code] ?? code.replace(/_/g, " ") : "-";

export const SOURCE_LABEL: Record<string, string> = {
  ad: "Pub",
  media: "Média",
  batch: "Batch Studio",
  brand_job: "Analyse de marque",
};

export const PROVIDER_LABEL: Record<string, string> = {
  fal: "fal.ai",
  "lovable-ai": "IA texte (passerelle)",
  creatomate: "Creatomate",
  unknown: "Inconnu",
};
export const providerLabel = (p: string | null | undefined) => (p ? PROVIDER_LABEL[p] ?? p : "Inconnu");
