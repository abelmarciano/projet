import { toUserMessage } from "@/lib/rate-limit";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Split } from "@/components/icons";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { splitVideoCreatomate } from "@/lib/video-creatomate.functions";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  adId: string;
  adTitle: string;
  videoUrl: string;
  folderId: string | null;
};

export function SplitVideoDialog({ open, onOpenChange, adId, videoUrl, folderId }: Props) {
  const qc = useQueryClient();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [duration, setDuration] = useState(0);
  const [splitAt, setSplitAt] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const split = useServerFn(splitVideoCreatomate);

  useEffect(() => { if (!open) setSubmitting(false); }, [open]);

  const onLoaded = () => {
    const d = videoRef.current?.duration ?? 0;
    setDuration(d); setSplitAt(Math.max(0.5, d / 2));
  };

  const onSlider = (v: number[]) => {
    const n = v[0];
    setSplitAt(n);
    if (videoRef.current) { videoRef.current.currentTime = n; videoRef.current.pause(); }
  };

  const handleSplit = async () => {
    if (!duration || splitAt <= 0.3 || splitAt >= duration - 0.3) {
      toast.info("Choisis un point de coupure valide.");
      return;
    }
    setSubmitting(true);
    try {
      await split({ data: { adId, splitAtSec: splitAt, folderId, totalDurationSec: duration } });
      await qc.invalidateQueries({ queryKey: ["ads"] });
      toast.success("Scission lancée : les 2 clips arrivent dans quelques instants.");
      onOpenChange(false);
    } catch (err) {
      toast.error(toUserMessage(err, "Échec du lancement"));
    } finally { setSubmitting(false); }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !submitting && onOpenChange(v)}>
      <DialogContent className="console-app-portal gx-adlg gx-mt-dlg gx-mt-sm">
        <DialogTitle className="gx-mt-dt">
          <Split className="gx-i" />Scinder la vidéo en 2 clips
        </DialogTitle>

        <div className="gx-mt-body">
          <div className="gx-mt-vid gx-mt-916">
            <video ref={videoRef} src={videoUrl} controls disablePictureInPicture
              onLoadedMetadata={onLoaded}
              style={{ maxHeight: "50vh" }} />
          </div>

          {duration > 0 && (
            <div className="gx-mt-f">
              <div className="gx-mt-between">
                <span>Point de coupure (précis à l'image)</span>
                <span className="gx-num">{splitAt.toFixed(1)} s / {duration.toFixed(1)} s</span>
              </div>
              <Slider value={[splitAt]} min={0.5} max={Math.max(1, duration - 0.5)} step={0.1} aria-label="Point de coupure"
                onValueChange={onSlider} disabled={submitting} />
              <p className="gx-hint">
                Partie 1 : 0 → {splitAt.toFixed(1)} s · Partie 2 : {splitAt.toFixed(1)} s → {duration.toFixed(1)} s. L'originale est conservée.
              </p>
            </div>
          )}

          {submitting && (
            <div className="gx-mt-busy" role="status">
              <Loader2 className="gx-i gx-mt-spin" />
              <span>Lancement du rendu sur nos serveurs…</span>
            </div>
          )}
        </div>

        <div className="gx-mt-foot">
          <button type="button" className="gx-btn" onClick={() => onOpenChange(false)} disabled={submitting}>Annuler</button>
          <button type="button" className="gx-btn gx-pri" onClick={handleSplit} disabled={submitting || !duration}>
            {submitting ? <Loader2 className="gx-i gx-mt-spin" /> : <Split className="gx-i" />}
            Scinder en 2
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
