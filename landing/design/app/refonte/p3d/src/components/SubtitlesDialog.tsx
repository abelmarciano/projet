import { toUserMessage } from "@/lib/rate-limit";
import { useEffect, useMemo, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import { Captions, Download, Loader2, Play, Plus, Sparkles, Trash2, Wand2 } from "@/components/icons";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { GxSelectTrigger } from "@/components/ui/gx-controls";
import { ConfirmDialog } from "@/components/console/ConfirmDialog";
import { ConsoleEmpty } from "@/components/console/ConsoleEmpty";
import { transcribeAdVideo } from "@/lib/subtitles.functions";
import { extractAudioChunks } from "@/lib/media-audio";

import { burnSubtitlesCreatomate, getSubtitlesConfig, deleteSubtitlesConfig } from "@/lib/video-creatomate.functions";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  adId: string;
  videoUrl: string;
  onBurnStart?: (adId: string, prevUrl: string) => void;
};

type Segment = { start: number; end: number; text: string };
type StyleId = "bold-white" | "yellow-pop" | "soft-shadow";
type Position = "bottom" | "middle" | "top";

// Preset styles - must match server-side STYLE_MAP in video-creatomate.functions.ts
const STYLES: Record<StyleId, { label: string; preview: React.CSSProperties }> = {
  "bold-white": {
    label: "Blanc gras + contour",
    preview: {
      color: "#FFFFFF",
      WebkitTextStroke: "1.5px #000",
      fontWeight: 800,
      textShadow: "0 2px 4px rgba(0,0,0,0.4)",
    },
  },
  "yellow-pop": {
    label: "Cyan pop",
    preview: {
      color: "#00F5FF",
      WebkitTextStroke: "1.5px #000",
      fontWeight: 800,
      textShadow: "0 2px 4px rgba(0,0,0,0.4)",
    },
  },
  "soft-shadow": {
    label: "Blanc + fond noir",
    preview: {
      color: "#FFFFFF",
      backgroundColor: "rgba(0,0,0,0.55)",
      padding: "0.25em 0.6em",
      borderRadius: "0.4em",
      fontWeight: 700,
    },
  },
};

function fmtSrt(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  const ms = Math.round((sec - Math.floor(sec)) * 1000);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")},${String(ms).padStart(3, "0")}`;
}
function buildSrt(segments: Segment[]): string {
  return segments
    .filter((s) => s.text.trim() && s.end > s.start)
    .map((s, i) => `${i + 1}\n${fmtSrt(s.start)} --> ${fmtSrt(s.end)}\n${s.text}\n`)
    .join("\n");
}

export function SubtitlesDialog({ open, onOpenChange, adId, videoUrl, onBurnStart }: Props) {
  const qc = useQueryClient();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [language, setLanguage] = useState<string>("fr");
  const [style, setStyle] = useState<StyleId>("bold-white");
  const [fontSize, setFontSize] = useState(64);
  const [position, setPosition] = useState<Position>("bottom");
  const [transcribing, setTranscribing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loadingConfig, setLoadingConfig] = useState(false);
  const [hasExisting, setHasExisting] = useState(false);

  const transcribe = useServerFn(transcribeAdVideo);
  const burnIn = useServerFn(burnSubtitlesCreatomate);
  const loadConfig = useServerFn(getSubtitlesConfig);
  const deleteConfig = useServerFn(deleteSubtitlesConfig);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Load persisted config on open
  useEffect(() => {
    if (!open) {
      setSegments([]); setSubmitting(false); setTranscribing(false); setHasExisting(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoadingConfig(true);
      try {
        const { config } = await loadConfig({ data: { adId } });
        if (cancelled || !config) return;
        setSegments(config.segments ?? []);
        setStyle(config.style ?? "bold-white");
        setFontSize(config.fontSize ?? 64);
        setPosition(config.position ?? "bottom");
        setHasExisting(true);
      } catch {
        // Silent: dialog just opens empty
      } finally {
        if (!cancelled) setLoadingConfig(false);
      }
    })();
    return () => { cancelled = true; };
  }, [open, adId, loadConfig]);

  const onLoaded = () => setDuration(videoRef.current?.duration ?? 0);
  const onTimeUpdate = () => setCurrentTime(videoRef.current?.currentTime ?? 0);

  const handleAutoTranscribe = async () => {
    setTranscribing(true);
    try {
      // Extraction audio dans le navigateur : plus de limite de poids vidéo,
      // et découpage automatique en tranches pour les vidéos longues.
      const chunks = await extractAudioChunks(videoUrl);
      let segs: Segment[] = [];
      if (chunks?.length) {
        for (let i = 0; i < chunks.length; i++) {
          const res = await transcribe({
            data: {
              adId,
              language,
              totalDurationSec: duration || undefined,
              audioBase64: chunks[i].base64,
              offsetSeconds: chunks[i].offsetSeconds,
              previousSegments: segs,
              persist: i === chunks.length - 1,
            },
          });
          segs = res.segments;
        }
      } else {
        const res = await transcribe({ data: { adId, language, totalDurationSec: duration || undefined } });
        segs = res.segments;
      }
      setSegments(segs);
      toast.success(`${segs.length} sous-titre${segs.length > 1 ? "s" : ""} générés : relis-les avant de les incruster.`);
    } catch (err) {
      toast.error(toUserMessage(err, "Échec de la transcription"));
    } finally {
      setTranscribing(false);
    }
  };


  const updateSeg = (i: number, patch: Partial<Segment>) => {
    setSegments((prev) => prev.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
  };
  const removeSeg = (i: number) => setSegments((prev) => prev.filter((_, idx) => idx !== i));
  const addSeg = () => {
    const last = segments[segments.length - 1];
    const start = last ? Math.min(duration, last.end + 0.1) : 0;
    const end = Math.min(duration, start + 1.5);
    setSegments((prev) => [...prev, { start, end, text: "Nouveau sous-titre" }]);
  };

  const srtContent = useMemo(() => buildSrt(segments), [segments]);

  const handleDownloadSrt = () => {
    if (!srtContent.trim()) return toast.info("Ajoute au moins un sous-titre");
    const blob = new Blob([srtContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "subtitles.srt"; a.click();
    URL.revokeObjectURL(url);
  };

  const handleBurnIn = async () => {
    if (!segments.length) return toast.info("Ajoute au moins un sous-titre");
    setSubmitting(true);
    try {
      await burnIn({
        data: {
          adId,
          segments: segments.filter((s) => s.text.trim() && s.end > s.start),
          style, fontSize, position,
          totalDurationSec: duration || 15,
        },
      });
      await qc.invalidateQueries({ queryKey: ["ads"] });
      onBurnStart?.(adId, videoUrl);
      toast.success("Incrustation lancée : la vidéo se met à jour dans quelques instants.");
      onOpenChange(false);
    } catch (err) {
      toast.error(toUserMessage(err, "Échec du lancement"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfig = async () => {
    if (!hasExisting) return;
    setDeleting(true);
    try {
      await deleteConfig({ data: { adId } });
      await qc.invalidateQueries({ queryKey: ["ads"] });
      toast.success("Sous-titres supprimés");
      onOpenChange(false);
    } catch (err) {
      toast.error(toUserMessage(err, "Échec de la suppression"));
    } finally {
      setDeleting(false);
    }
  };

  const busy = transcribing || submitting || loadingConfig || deleting;

  // Live preview: currently active segment, or fallback to first segment / placeholder
  // so the user always sees how the style/position/size will render - including on the
  // very first frame before playback starts.
  const activeSeg = useMemo(
    () => segments.find((s) => currentTime >= s.start && currentTime <= s.end) ?? null,
    [segments, currentTime],
  );
  const previewSeg = activeSeg ?? segments[0] ?? { start: 0, end: 0, text: "Aperçu du sous-titre" };

  // Preview font sizing - video preview is ~55vh tall, output is 1920px tall.
  // Scale fontSize proportionally so what you see matches what gets rendered.
  const previewFontSize = `calc(${(fontSize / 1920) * 100} * (var(--preview-h, 55vh) / 100))`;
  const posClass =
    position === "top" ? "gx-mt-top" : position === "middle" ? "gx-mt-mid" : "gx-mt-bot";

  return (
    <Dialog open={open} onOpenChange={(v) => !busy && onOpenChange(v)}>
      <DialogContent className="console-app-portal gx-adlg gx-mt-dlg gx-mt-lg">
        <DialogTitle className="gx-mt-dt">
          <Captions className="gx-i" />
          {hasExisting ? "Modifier les sous-titres" : "Ajouter des sous-titres"}
        </DialogTitle>

        <div className="gx-mt-subg">
          <div className="gx-mt-col">
            {/* Vidéo + aperçu du sous-titre en direct */}
            <div className="gx-mt-vid gx-mt-916">
              <video
                ref={videoRef}
                src={videoUrl}
                controls
                disablePictureInPicture
                onLoadedMetadata={onLoaded}
                onTimeUpdate={onTimeUpdate}
                style={{ maxHeight: "55vh" }}
              />
              <div className={`gx-mt-cap-ov ${posClass}`}>
                <span
                  style={{
                    ...STYLES[style].preview,
                    fontSize: previewFontSize,
                    fontFamily: "Inter, system-ui, sans-serif",
                    opacity: activeSeg ? 1 : 0.7,
                  }}
                >
                  {previewSeg.text}
                </span>
              </div>
              {loadingConfig && (
                <div className="gx-mt-ov" role="status">
                  <Loader2 className="gx-i gx-mt-spin" />
                  <span>Chargement…</span>
                </div>
              )}
            </div>

            <div className="gx-mt-pan">
              <div className="gx-mt-g2">
                <div className="gx-mt-f">
                  <span className="gx-mt-l">Langue</span>
                  <Select value={language} onValueChange={setLanguage}>
                    <GxSelectTrigger aria-label="Langue"><SelectValue /></GxSelectTrigger>
                    <SelectContent>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="en">Anglais</SelectItem>
                      <SelectItem value="es">Espagnol</SelectItem>
                      <SelectItem value="it">Italien</SelectItem>
                      <SelectItem value="de">Allemand</SelectItem>
                      <SelectItem value="pt">Portugais</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="gx-mt-f">
                  <span className="gx-mt-l">Style</span>
                  <Select value={style} onValueChange={(v) => setStyle(v as StyleId)}>
                    <GxSelectTrigger aria-label="Style"><SelectValue /></GxSelectTrigger>
                    <SelectContent>
                      {Object.entries(STYLES).map(([id, s]) => (
                        <SelectItem key={id} value={id}>{s.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="gx-mt-f">
                  <span className="gx-mt-l">Position</span>
                  <Select value={position} onValueChange={(v) => setPosition(v as Position)}>
                    <GxSelectTrigger aria-label="Position"><SelectValue /></GxSelectTrigger>
                    <SelectContent>
                      <SelectItem value="bottom">Bas</SelectItem>
                      <SelectItem value="middle">Milieu</SelectItem>
                      <SelectItem value="top">Haut</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="gx-mt-f">
                  <span className="gx-mt-l">Taille ({fontSize})</span>
                  <div style={{ paddingTop: 10 }}>
                    <Slider min={32} max={110} step={2} value={[fontSize]} aria-label="Taille du texte" onValueChange={(v) => setFontSize(v[0])} />
                  </div>
                </div>
              </div>

              {/* Aperçus des styles, cliquables */}
              <div className="gx-mt-pre">
                {(Object.keys(STYLES) as StyleId[]).map((id) => (
                  <button
                    key={id}
                    type="button"
                    aria-pressed={style === id}
                    onClick={() => setStyle(id)}
                    title={STYLES[id].label}
                    aria-label={STYLES[id].label}
                  >
                    <span style={{ ...STYLES[id].preview, fontSize: 14, fontFamily: "Inter" }}>Aa</span>
                  </button>
                ))}
              </div>

              <button type="button" className="gx-btn gx-mt-full" onClick={handleAutoTranscribe} disabled={busy || !duration}>
                {transcribing ? <Loader2 className="gx-i gx-mt-spin" /> : <Sparkles className="gx-i" />}
                {segments.length ? "Retranscrire (remplace tout)" : "Transcrire automatiquement avec l'IA"}
              </button>
            </div>
          </div>

          <div className="gx-mt-col">
            <div className="gx-mt-between">
              <b>Sous-titres ({segments.length})</b>
              <div className="gx-mt-acts">
                <button type="button" className="gx-btn gx-sm gx-ghost" onClick={handleDownloadSrt} disabled={!segments.length}>
                  <Download className="gx-i" />.srt
                </button>
                <button type="button" className="gx-btn gx-sm" onClick={addSeg} disabled={!duration}>
                  <Plus className="gx-i" />Ajouter
                </button>
              </div>
            </div>

            <div className="gx-mt-segs">
              {segments.length === 0 && !loadingConfig && (
                <ConsoleEmpty
                  compact
                  icon={Captions}
                  title="Aucun sous-titre"
                  text="Lance la transcription automatique ou ajoute-les à la main."
                />
              )}
              {segments.map((seg, i) => {
                const isActive = currentTime >= seg.start && currentTime <= seg.end;
                return (
                  <div key={i} className={`gx-mt-sg${isActive ? " gx-on" : ""}`}>
                    <div>
                      <input type="number" step={0.1} min={0} max={duration}
                        className="gx-in"
                        aria-label="Début (s)"
                        value={seg.start.toFixed(1)}
                        onChange={(e) => updateSeg(i, { start: Math.max(0, parseFloat(e.target.value) || 0) })} />
                      <span className="gx-mt-to">→</span>
                      <input type="number" step={0.1} min={0} max={duration}
                        className="gx-in"
                        aria-label="Fin (s)"
                        value={seg.end.toFixed(1)}
                        onChange={(e) => updateSeg(i, { end: Math.max(0, parseFloat(e.target.value) || 0) })} />
                      <button
                        type="button"
                        className="gx-btn gx-sm gx-ghost"
                        onClick={() => { if (videoRef.current) videoRef.current.currentTime = seg.start; }}
                        aria-label="Aller à ce sous-titre"
                      >
                        <Play className="gx-i" />Voir
                      </button>
                      <button type="button" className="gx-ib gx-sm" onClick={() => removeSeg(i)}
                        aria-label="Supprimer ce sous-titre" title="Supprimer ce sous-titre">
                        <Trash2 className="gx-i" />
                      </button>
                    </div>
                    <input value={seg.text}
                      className="gx-in"
                      aria-label="Texte du sous-titre"
                      onChange={(e) => updateSeg(i, { text: e.target.value })} />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {submitting && (
          <div className="gx-mt-busy" role="status">
            <Loader2 className="gx-i gx-mt-spin" />
            <span>Lancement du rendu sur nos serveurs…</span>
          </div>
        )}

        <div className="gx-mt-foot">
          {hasExisting && (
            <button
              type="button"
              className="gx-btn gx-ghost gx-mt-grow"
              onClick={() => setConfirmDelete(true)}
              disabled={busy}
            >
              {deleting ? <Loader2 className="gx-i gx-mt-spin" /> : <Trash2 className="gx-i" />}
              Supprimer les sous-titres
            </button>
          )}
          <div className="gx-mt-acts">
            <button type="button" className="gx-btn" onClick={() => onOpenChange(false)} disabled={busy}>Annuler</button>
            <button type="button" className="gx-btn gx-pri" onClick={handleBurnIn} disabled={busy || !segments.length}>
              {submitting ? <Loader2 className="gx-i gx-mt-spin" /> : <Wand2 className="gx-i" />}
              {hasExisting ? "Enregistrer et réincruster" : "Incruster et remplacer la vidéo"}
            </button>
          </div>
        </div>

        <ConfirmDialog
          open={confirmDelete}
          onOpenChange={setConfirmDelete}
          title="Supprimer la configuration des sous-titres ?"
          description="La vidéo actuellement affichée ne sera pas modifiée."
          confirmLabel="Supprimer"
          danger
          busy={deleting}
          onConfirm={() => {
            setConfirmDelete(false);
            void handleDeleteConfig();
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
