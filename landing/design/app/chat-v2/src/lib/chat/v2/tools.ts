/**
 * Chat v2 : jeu d'outils réduit. Les outils gardent leur nom et leur code
 * actuels (l'interface et l'enregistrement de la conversation en dépendent) ;
 * le v2 en expose seulement une partie, plus read_brand.
 */

/** Les 10 outils du déroulé principal (read_brand est ajouté par la route). */
export const V2_CORE_TOOLS = [
  "read_brand",
  "find_catalog_product",
  "fetch_url",
  "research_competitor_ads",
  "propose_strategy",
  "validate_strategy",
  "ask_blocking_question",
  "answer_pending_question",
  "update_brief",
  "ready_to_generate",
] as const;

/** Outils de situation : pièces jointes, médias isolés, suites, historique, chiffres. */
export const V2_SITUATIONAL_TOOLS = [
  "analyze_video",
  "analyze_audio",
  "generate_media",
  "continuation_brief",
  "continue_video",
  "list_creations",
  "meta_performance",
] as const;

export const V2_TOOL_NAMES: readonly string[] = [...V2_CORE_TOOLS, ...V2_SITUATIONAL_TOOLS];

/** Mode actuel : tous les outils, inchangés. Chat v2 : la sélection ci-dessus + les outils propres au v2. */
export function selectChatTools<T extends Record<string, unknown>>(
  chatV2: boolean,
  extra: Record<string, unknown>,
  all: T,
): T {
  if (!chatV2) return all;
  const picked: Record<string, unknown> = { ...extra };
  for (const name of V2_TOOL_NAMES) if (name in all) picked[name] = all[name as keyof T];
  return picked as T;
}
