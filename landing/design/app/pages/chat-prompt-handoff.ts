/**
 * Demande écrite sur l'Accueil (zone « Décris la pub… », « Continuer +8 s ») :
 * gardée le temps d'ouvrir un nouveau chat, puis envoyée telle quelle par create.tsx.
 */
export const PENDING_CHAT_PROMPT_KEY = "growthity:pending-chat-prompt:v1";

export function openPromptInChat(text: string) {
  try {
    window.localStorage.setItem(PENDING_CHAT_PROMPT_KEY, JSON.stringify({ text, at: Date.now() }));
  } catch {
    /* ignore */
  }
}

/** Lit puis efface la demande en attente (ignorée au-delà de 2 minutes). */
export function takePendingChatPrompt(): string | null {
  try {
    const raw = window.localStorage.getItem(PENDING_CHAT_PROMPT_KEY);
    if (!raw) return null;
    window.localStorage.removeItem(PENDING_CHAT_PROMPT_KEY);
    const p = JSON.parse(raw) as { text?: string; at?: number };
    if (!p?.text || !p.at || Date.now() - p.at > 120_000) return null;
    return p.text;
  } catch {
    return null;
  }
}
