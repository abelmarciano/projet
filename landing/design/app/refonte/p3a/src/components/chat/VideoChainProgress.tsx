import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, Loader2, RotateCcw, XCircle, Film, Lock } from "@/components/icons";
import { toast } from "sonner";
import { advanceVideoChains, retryChainSegment } from "@/lib/video-chain.functions";
import { supabase } from "@/integrations/supabase/client";

type Seg = { index: number; role: string; status: "waiting" | "pending" | "completed" | "failed"; error?: string | null };
type Chain = { id: string; title: string; total_segments: number; segments: Seg[]; status: string; final_ad_id: string | null; error_message: string | null; display_prompt?: string | null; continuation_of?: string | null; conversation_message_id?: string | null };
export type VideoChainSummary = Chain;

export function VideoChainProgress({
  conversationId,
  version,
  onFinal,
  onActivityChange,
  onChains,
}: {
  conversationId: string | null;
  version: number;
  onFinal: (chain: { id: string; title: string; finalAdId: string; seconds: number; prompt: string | null; continuationOf: string | null; messageId: string | null; alreadyDone: boolean }) => void;
  onActivityChange?: (active: boolean) => void;
  onChains?: (chains: Chain[]) => void;
}) {
  const advance = useServerFn(advanceVideoChains);
  const retry = useServerFn(retryChainSegment);
  const [chains, setChains] = useState<Chain[]>([]);
  const [retrying, setRetrying] = useState<string | null>(null);
  const [bump, setBump] = useState(0);
  const reported = useRef(new Set<string>());
  const firstLoad = useRef(true);

  useEffect(() => {
    if (!conversationId) return;
    let stop = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    // Affichage immédiat depuis la base (avant le suivi serveur, plus lent) :
    // la carte « en cours » survit à la navigation et au rafraîchissement.
    void supabase
      .from("video_chains")
      .select("id, title, total_segments, segments, status, final_ad_id, error_message, conversation_message_id, base_payload")
      .eq("conversation_id", conversationId)
      .neq("status", "done")
      .order("created_at", { ascending: true })
      .then(({ data }) => {
        if (stop || !data?.length) return;
        const list = (data as any[]).map((c) => ({ ...c, display_prompt: c.base_payload?.displayPrompt ?? null, continuation_of: c.base_payload?.continuationOf ?? null, base_payload: undefined })) as Chain[];
        setChains((prev) => (prev.length ? prev : list));
        onActivityChange?.(list.some((c) => c.status === "running" || c.status === "merging"));
      });
    const tick = async () => {
      try {
        const { chainsJson } = await advance({ data: { conversationId } });
        if (stop) return;
        const list = JSON.parse(chainsJson) as Chain[];
        setChains(list);
        onChains?.(list);
        onActivityChange?.(list.some((c) => c.status === "running" || c.status === "merging"));
        // Chaînes déjà terminées à l'ouverture : signalées « alreadyDone » (la carte
        // existante n'est jamais remise en attente ni déplacée → pas de relecture coupée).
        const initial = firstLoad.current;
        firstLoad.current = false;
        for (const c of list) {
          if (c.status === "done" && c.final_ad_id && !reported.current.has(c.id)) {
            reported.current.add(c.id);
            onFinal({ id: c.id, title: c.title, finalAdId: c.final_ad_id, seconds: c.total_segments * 8, prompt: c.display_prompt ?? null, continuationOf: c.continuation_of ?? null, messageId: c.conversation_message_id ?? null, alreadyDone: initial });
          }
        }
        if (list.some((c) => c.status === "running" || c.status === "merging")) timer = setTimeout(tick, 10_000);
      } catch {
        if (!stop) timer = setTimeout(tick, 20_000);
      }
    };
    void tick();
    return () => { stop = true; if (timer) clearTimeout(timer); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId, version, bump]);

  const visible = chains.filter((c) => c.status !== "done");
  if (!visible.length) return null;

  return (
    <div className="gx-vcp">
      {visible.map((c) => {
        const current = c.segments.find((s) => s.status === "pending") ?? c.segments.find((s) => s.status === "failed");
        const label =
          c.status === "merging" ? "Assemblage des segments…"
          : c.status === "segment_failed" ? `Le segment ${(current?.index ?? 0) + 1}/${c.total_segments} a échoué — il n'a pas été facturé.`
          : c.status === "merge_failed" ? "L'assemblage a échoué."
          : `Segment ${(current?.index ?? 0) + 1}/${c.total_segments} en cours…`;
        const failed = c.status.endsWith("failed");
        return (
          <div key={c.id} className="gx-kard gx-vcp-c" role="status">
            <b className="gx-vcp-t">
              <Film className="gx-i" aria-hidden />
              <span>{c.title} · {c.total_segments * 8} s</span>
            </b>
            {c.display_prompt ? (
              <div className="gx-vcp-p" aria-disabled="true">
                <span className="gx-vcp-pl">
                  <Lock className="gx-i" aria-hidden /> Prompt verrouillé pendant la génération
                </span>
                <p>
                  {c.display_prompt}
                </p>
              </div>
            ) : null}
            <div className="gx-vcp-segs">
              {c.segments.map((s) => (
                <div key={s.index} className={`gx-vcp-s gx-${s.status}`}>
                  <i aria-hidden />
                  <span>{s.index + 1}. {s.role}</span>
                </div>
              ))}
            </div>
            <div className="gx-vcp-f">
              <span className={`gx-vcp-st${failed ? " gx-bad" : ""}`}>
                {c.status === "running" || c.status === "merging" ? <Loader2 className="gx-i animate-spin" />
                  : failed ? <XCircle className="gx-i" />
                  : <CheckCircle2 className="gx-i" />}
                {label}
              </span>
              {failed && (
                <button type="button" className="gx-btn gx-sm" disabled={retrying === c.id} onClick={async () => {
                  setRetrying(c.id);
                  try {
                    await retry({ data: { chainId: c.id } });
                    toast.success(c.status === "merge_failed" ? "Assemblage relancé." : "Segment relancé.");
                  } catch (e) {
                    toast.error(e instanceof Error ? e.message : "Relance impossible.");
                  } finally {
                    setRetrying(null);
                    setBump((b) => b + 1);
                  }
                }}>
                  {retrying === c.id ? <Loader2 className="gx-i animate-spin" /> : <RotateCcw className="gx-i" />} {c.status === "merge_failed" ? "Relancer l'assemblage" : "Relancer le segment"}
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
