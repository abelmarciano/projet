import { toUserMessage } from "@/lib/rate-limit";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Combine, ArrowUpDown } from "@/components/icons";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { concatVideosRemote } from "@/lib/video-edit.functions";

type Clip = { id: string; title: string; url: string };
type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  clips: Clip[]; // exactly 2, in order [A, B]
  folderId: string | null;
  onDone?: () => void;
};

async function probeDurationMs(url: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const v = document.createElement("video");
    v.preload = "metadata";
    v.muted = true;
    v.crossOrigin = "anonymous";
    v.onloadedmetadata = () => {
      const d = v.duration;
      if (!isFinite(d) || d <= 0) reject(new Error("Durée vidéo invalide"));
      else resolve(Math.round(d * 1000));
    };
    v.onerror = () => reject(new Error("Impossible de lire la vidéo"));
    v.src = url;
  });
}

export function ConcatVideosDialog({ open, onOpenChange, clips, folderId, onDone }: Props) {
  const qc = useQueryClient();
  const [order, setOrder] = useState<Clip[]>(clips);
  const [working, setWorking] = useState(false);
  const [stage, setStage] = useState("");
  const doConcat = useServerFn(concatVideosRemote);
  const durationsRef = useRef<Record<string, number>>({});

  useEffect(() => { setOrder(clips); }, [clips]);
  useEffect(() => { if (!open) { setWorking(false); setStage(""); } }, [open]);

  const swap = () => setOrder(([a, b]) => [b, a]);

  const handleConcat = async () => {
    if (order.length !== 2) return;
    setWorking(true);
    try {
      setStage("Analyse des vidéos…");
      const durations = await Promise.all(order.map(async (c) => {
        if (durationsRef.current[c.id]) return durationsRef.current[c.id];
        const d = await probeDurationMs(c.url);
        durationsRef.current[c.id] = d;
        return d;
      }));

      setStage("Assemblage sur le cloud (10-30 s)…");
      await doConcat({ data: {
        clips: [
          { url: order[0].url, durationMs: durations[0] },
          { url: order[1].url, durationMs: durations[1] },
        ],
        title: `${order[0].title} + ${order[1].title}`,
        folderId,
      }});

      await qc.invalidateQueries({ queryKey: ["ads"] });
      toast.success("Vidéos assemblées.");
      onDone?.();
      onOpenChange(false);
    } catch (err) {
      console.error(err);
      toast.error(toUserMessage(err, "Échec de l'assemblage"));
    } finally {
      setWorking(false); setStage("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !working && onOpenChange(v)}>
      <DialogContent className="console-app-portal gx-adlg gx-mt-dlg gx-mt-sm">
        <DialogTitle className="gx-mt-dt">
          <Combine className="gx-i" />Assembler 2 vidéos bout à bout
        </DialogTitle>

        <div className="gx-mt-body">
          <p className="gx-hint">
            Traitement sur nos serveurs : rapide et fiable, quels que soient les formats d'origine.
          </p>
          <div className="gx-mt-clips">
            {order.map((c, i) => (
              <div key={c.id} className="gx-mt-clip">
                <span>
                  <video src={c.url} muted playsInline />
                </span>
                <span>
                  <small>Position {i + 1}</small>
                  <b title={c.title}>{c.title}</b>
                </span>
              </div>
            ))}
          </div>
          <button type="button" className="gx-btn gx-sm gx-mt-full" onClick={swap} disabled={working}>
            <ArrowUpDown className="gx-i" />Inverser l'ordre
          </button>

          {working && (
            <div className="gx-mt-busy" role="status">
              <Loader2 className="gx-i gx-mt-spin" />
              <span>{stage || "Traitement…"}</span>
            </div>
          )}
        </div>

        <div className="gx-mt-foot">
          <button type="button" className="gx-btn" onClick={() => onOpenChange(false)} disabled={working}>Annuler</button>
          <button type="button" className="gx-btn gx-pri" onClick={handleConcat} disabled={working}>
            {working ? <Loader2 className="gx-i gx-mt-spin" /> : <Combine className="gx-i" />}
            Assembler
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
