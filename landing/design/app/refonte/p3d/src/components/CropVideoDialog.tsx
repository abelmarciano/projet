import { toUserMessage } from "@/lib/rate-limit";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import { Crop, Loader2 } from "@/components/icons";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { GxSelectTrigger } from "@/components/ui/gx-controls";
import { cropVideoCreatomate } from "@/lib/video-creatomate.functions";

type Ratio = "9:16" | "16:9" | "1:1" | "4:5";
const RATIO_LABEL: Record<Ratio, string> = {
  "9:16": "Vertical 9:16 (Reels, Stories)",
  "16:9": "Horizontal 16:9 (YouTube, écrans)",
  "1:1":  "Carré 1:1 (feed Instagram)",
  "4:5":  "Portrait 4:5 (feed Instagram optimisé)",
};

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  adId: string;
  videoUrl: string;
};

export function CropVideoDialog({ open, onOpenChange, adId, videoUrl }: Props) {
  const qc = useQueryClient();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [duration, setDuration] = useState(0);
  const [targetRatio, setTargetRatio] = useState<Ratio>("9:16");
  const [xAlign, setXAlign] = useState(50);
  const [yAlign, setYAlign] = useState(50);
  const [submitting, setSubmitting] = useState(false);
  const crop = useServerFn(cropVideoCreatomate);

  useEffect(() => { if (!open) { setSubmitting(false); setXAlign(50); setYAlign(50); } }, [open]);
  const onLoaded = () => setDuration(videoRef.current?.duration ?? 0);

  const handleCrop = async () => {
    if (!duration) return;
    setSubmitting(true);
    try {
      await crop({ data: {
        adId, targetRatio,
        xAlignmentPct: xAlign, yAlignmentPct: yAlign,
        totalDurationSec: duration,
      }});
      await qc.invalidateQueries({ queryKey: ["ads"] });
      toast.success("Recadrage lancé : la vidéo sera mise à jour dans quelques instants.");
      onOpenChange(false);
    } catch (err) {
      toast.error(toUserMessage(err, "Échec du lancement"));
    } finally { setSubmitting(false); }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !submitting && onOpenChange(v)}>
      <DialogContent className="console-app-portal gx-adlg gx-mt-dlg gx-mt-sm">
        <DialogTitle className="gx-mt-dt">
          <Crop className="gx-i" />Recadrer la vidéo
        </DialogTitle>

        <div className="gx-mt-body">
          <div className="gx-mt-vid">
            <video ref={videoRef} src={videoUrl} controls disablePictureInPicture
              onLoadedMetadata={onLoaded}
              style={{ maxHeight: "45vh" }} />
          </div>

          <div className="gx-mt-pan">
            <div className="gx-mt-f">
              <span className="gx-mt-l">Format de sortie</span>
              <Select value={targetRatio} onValueChange={(v) => setTargetRatio(v as Ratio)}>
                <GxSelectTrigger aria-label="Format de sortie"><SelectValue /></GxSelectTrigger>
                <SelectContent>
                  {Object.entries(RATIO_LABEL).map(([k, l]) => (
                    <SelectItem key={k} value={k}>{l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="gx-mt-f">
              <div className="gx-mt-between">
                <span className="gx-mt-l">Cadrage horizontal</span>
                <span className="gx-num">{xAlign === 50 ? "centré" : xAlign < 50 ? `gauche (${xAlign} %)` : `droite (${xAlign} %)`}</span>
              </div>
              <Slider value={[xAlign]} min={0} max={100} step={5} aria-label="Cadrage horizontal"
                onValueChange={(v) => setXAlign(v[0])} disabled={submitting} />
            </div>

            <div className="gx-mt-f">
              <div className="gx-mt-between">
                <span className="gx-mt-l">Cadrage vertical</span>
                <span className="gx-num">{yAlign === 50 ? "centré" : yAlign < 50 ? `haut (${yAlign} %)` : `bas (${yAlign} %)`}</span>
              </div>
              <Slider value={[yAlign]} min={0} max={100} step={5} aria-label="Cadrage vertical"
                onValueChange={(v) => setYAlign(v[0])} disabled={submitting} />
            </div>
            <p className="gx-hint">
              La vidéo sera adaptée au format {targetRatio} en conservant les proportions et
              en coupant les bords selon le cadrage choisi. L'originale est remplacée.
            </p>
          </div>

          {submitting && (
            <div className="gx-mt-busy" role="status">
              <Loader2 className="gx-i gx-mt-spin" />
              <span>Lancement du rendu sur nos serveurs…</span>
            </div>
          )}
        </div>

        <div className="gx-mt-foot">
          <button type="button" className="gx-btn" onClick={() => onOpenChange(false)} disabled={submitting}>Annuler</button>
          <button type="button" className="gx-btn gx-pri" onClick={handleCrop} disabled={submitting || !duration}>
            {submitting ? <Loader2 className="gx-i gx-mt-spin" /> : <Crop className="gx-i" />}
            Recadrer et remplacer
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
