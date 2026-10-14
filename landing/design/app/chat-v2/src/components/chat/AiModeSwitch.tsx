import { useEffect, useSyncExternalStore } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { getAiModeAccess, getConversationAiMode, setConversationAiMode } from "@/lib/ai-mode.functions";
import {
  AI_MODE_EXCEPTIONS,
  getClientAiMode,
  getClientChatV2,
  setClientAiMode,
  setClientChatV2,
  subscribeAiMode,
  subscribeChatV2,
  type AiMode,
} from "@/lib/ai-mode";

/** Sélecteur Actuel / Claude (+ Chat v2) — visible uniquement pour les comptes internes. */
export function AiModeSwitch({ conversationId }: { conversationId: string | null | undefined }) {
  const access = useServerFn(getAiModeAccess);
  const getMode = useServerFn(getConversationAiMode);
  const setMode = useServerFn(setConversationAiMode);
  const { data } = useQuery({ queryKey: ["ai-mode-access"], queryFn: () => access(), staleTime: 300_000 });
  const mode = useSyncExternalStore(subscribeAiMode, getClientAiMode, () => "current" as AiMode);
  const v2 = useSyncExternalStore(subscribeChatV2, getClientChatV2, () => false);
  const internal = data?.internal === true;

  // Le mode mémorisé de la conversation fait foi à l'ouverture.
  useEffect(() => {
    if (!internal || !conversationId) return;
    void getMode({ data: { conversationId } }).then((r) => setClientAiMode(r.mode)).catch(() => {});
  }, [internal, conversationId, getMode]);
  // Un client ne doit jamais envoyer le mode Claude ni le Chat v2.
  useEffect(() => {
    if (data && !internal && mode !== "current") setClientAiMode("current");
    if (data && !internal && v2) setClientChatV2(false);
  }, [data, internal, mode, v2]);

  if (!internal) return null;

  const choose = async (next: AiMode) => {
    if (next === mode) return;
    setClientAiMode(next);
    if (conversationId) {
      try { await setMode({ data: { conversationId, mode: next } }); }
      catch (e) { toast.error(e instanceof Error ? e.message : "Mode non enregistré."); }
    }
  };

  return (
    <div className="mb-2 flex flex-wrap items-center gap-2 rounded-lg border border-dashed border-border bg-muted/40 px-3 py-1.5 text-xs">
      <span className="font-medium text-muted-foreground">Mode IA (interne) :</span>
      <div className="inline-flex overflow-hidden rounded-md border border-border">
        {(["current", "claude"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => void choose(m)}
            className={`px-2.5 py-1 font-medium transition ${mode === m ? "bg-primary text-primary-foreground" : "bg-card text-foreground hover:bg-muted"}`}
          >
            {m === "current" ? "Actuel" : "Claude"}
          </button>
        ))}
      </div>
      {mode === "claude" ? (
        <label className="inline-flex cursor-pointer items-center gap-1.5 font-medium">
          <input type="checkbox" checked={v2} onChange={(e) => setClientChatV2(e.target.checked)} />
          Chat v2 (prompt court, Claude choisit l'IA de génération)
        </label>
      ) : null}
      <span className="text-muted-foreground">
        {mode === "claude" ? "Tout le texte et le raisonnement passent sur Claude Opus 5.5. " : "Moteurs actuels. "}
        {mode === "claude" ? AI_MODE_EXCEPTIONS : ""}
      </span>
    </div>
  );
}
