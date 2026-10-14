import { toUserMessage } from "@/lib/rate-limit";
import { type PointerEvent as ReactPointerEvent, useCallback, useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Pause, Play, Scissors, StepForward } from "@/components/icons";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { trimVideoCreatomate } from "@/lib/video-creatomate.functions";

const FRAME_STEP = 1 / 30;
const MIN_SELECTION = 0.2;

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  adId: string;
  adTitle?: string;
  videoUrl: string;
  conversationId?: string | null;
  folderId?: string | null;
  onCreated?: (arg: { adId: string; title: string }) => void;
};

function fmt(t: number) {
  if (!isFinite(t) || t < 0) t = 0;
  const s = Math.floor(t);
  const cs = Math.floor((t - s) * 100);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}.${cs.toString().padStart(2, "0")}`;
}

export function TrimVideoDialog({
  open, onOpenChange, adId, adTitle, videoUrl, conversationId, folderId, onCreated,
}: Props) {
  const qc = useQueryClient();
  const videoRef = useRef<HTMLVideoElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const activeHandleRef = useRef<"start" | "end" | null>(null);
  const [duration, setDuration] = useState(0);
  const [startSec, setStartSec] = useState(0);
  const [endSec, setEndSec] = useState(0);
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const previewingRef = useRef(false);
  const trim = useServerFn(trimVideoCreatomate);

  useEffect(() => { if (!open) { setSubmitting(false); previewingRef.current = false; } }, [open]);

  const onLoaded = () => {
    const d = videoRef.current?.duration ?? 0;
    setDuration(d); setStartSec(0); setEndSec(d); setCurrent(0);
  };

  const seek = useCallback((t: number) => {
    const v = videoRef.current; if (!v) return;
    const next = Math.max(0, Math.min(duration, t));
    setCurrent(next);
    v.currentTime = next;
  }, [duration]);

  const timeFromPointer = useCallback((clientX: number) => {
    const el = timelineRef.current;
    if (!el || !duration) return 0;
    const rect = el.getBoundingClientRect();
    const ratio = rect.width > 0 ? (clientX - rect.left) / rect.width : 0;
    return Math.max(0, Math.min(duration, ratio * duration));
  }, [duration]);

  const updateTrimHandle = useCallback((handle: "start" | "end", time: number) => {
    if (!duration) return;
    const v = videoRef.current;
    if (v && !v.paused) v.pause();

    if (handle === "start") {
      const nextStart = Math.max(0, Math.min(time, endSec - MIN_SELECTION));
      setStartSec(nextStart);
      return;
    }

    const nextEnd = Math.min(duration, Math.max(time, startSec + MIN_SELECTION));
    setEndSec(nextEnd);
  }, [duration, endSec, startSec]);

  // Auto-pause when playhead exits the selection during preview.
  const onTimeUpdate = () => {
    const v = videoRef.current; if (!v) return;
    setCurrent(v.currentTime);
    if (previewingRef.current && v.currentTime >= endSec - 0.02) {
      v.pause();
      previewingRef.current = false;
    }
  };

  const onTimelinePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (submitting || !duration || (event.pointerType === "mouse" && event.button !== 0)) return;
    const target = event.target as HTMLElement;
    const handleAttr = target.closest<HTMLElement>("[data-trim-handle]")?.dataset.trimHandle;
    const time = timeFromPointer(event.clientX);
    const handle = handleAttr === "start" || handleAttr === "end"
      ? handleAttr
      : Math.abs(time - startSec) <= Math.abs(time - endSec) ? "start" : "end";

    activeHandleRef.current = handle;
    event.currentTarget.setPointerCapture(event.pointerId);
    updateTrimHandle(handle, time);
    event.preventDefault();
  };

  const onTimelinePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const handle = activeHandleRef.current;
    if (!handle || submitting || !duration) return;
    updateTrimHandle(handle, timeFromPointer(event.clientX));
    event.preventDefault();
  };

  const onTimelinePointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    activeHandleRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const nudgeHandle = (handle: "start" | "end", delta: number) => {
    updateTrimHandle(handle, (handle === "start" ? startSec : endSec) + delta);
  };

  const getLiveCurrentTime = () => {
    const t = videoRef.current?.currentTime;
    return Number.isFinite(t) ? Math.max(0, Math.min(duration, t ?? current)) : current;
  };

  const previewSelection = () => {
    const v = videoRef.current; if (!v) return;
    v.currentTime = startSec;
    previewingRef.current = true;
    void v.play();
  };

  const togglePlay = () => {
    const v = videoRef.current; if (!v) return;
    if (v.paused) { previewingRef.current = false; void v.play(); } else { v.pause(); }
  };

  const handleTrim = async () => {
    if (!duration || endSec <= startSec + MIN_SELECTION) return;
    if (startSec < 0.05 && Math.abs(endSec - duration) < 0.1) {
      toast.info("Aucune coupe : la durée est inchangée.");
      return;
    }
    setSubmitting(true);
    try {
      const v = videoRef.current;
      const outputWidth = v?.videoWidth || undefined;
      const outputHeight = v?.videoHeight || undefined;
      const exactStart = Math.max(0, Math.min(startSec, duration));
      const exactEnd = Math.max(exactStart + MIN_SELECTION, Math.min(endSec, duration));
      const res = await trim({ data: {
        adId,
        startSec: Number(exactStart.toFixed(3)),
        endSec: Number(exactEnd.toFixed(3)),
        sourceDurationSec: Number(duration.toFixed(3)),
        sourceUrl: videoUrl,
        outputWidth,
        outputHeight,
        conversationId: conversationId ?? undefined,
        folderId: folderId ?? undefined,
      } });
      const newAdId = (res as { adId?: string })?.adId;
      const title = `${adTitle ?? "Vidéo"} - Rognée`;
      if (newAdId && onCreated) onCreated({ adId: newAdId, title });
      await qc.invalidateQueries({ queryKey: ["ads"] });
      toast.success("Rognage lancé : la nouvelle vidéo apparaîtra dans le chat.");
      onOpenChange(false);

    } catch (err) {
      toast.error(toUserMessage(err, "Échec du lancement"));
    } finally { setSubmitting(false); }
  };

  const selDur = Math.max(0, endSec - startSec);
  const startPct = duration > 0 ? (startSec / duration) * 100 : 0;
  const endPct = duration > 0 ? (endSec / duration) * 100 : 100;
  const currentPct = duration > 0 ? (current / duration) * 100 : 0;

  return (
    <Dialog open={open} onOpenChange={(v) => !submitting && onOpenChange(v)}>
      <DialogContent className="console-app-portal gx-adlg gx-mt-dlg gx-mt-md">
        <DialogTitle className="gx-mt-dt">
          <Scissors className="gx-i" />Rogner ou couper la vidéo
        </DialogTitle>

        <div className="gx-mt-body">
          <div className="gx-mt-vid gx-mt-916">
            <video
              ref={videoRef}
              src={videoUrl}
              onLoadedMetadata={onLoaded}
              onTimeUpdate={onTimeUpdate}
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              playsInline
              disablePictureInPicture
              style={{ maxHeight: "55vh" }}
            />
            <span className="gx-mt-tc">
              {fmt(current)} / {fmt(duration)}
            </span>
          </div>

          {duration > 0 && (
            <div className="gx-mt-body">
              {/* Rail à deux poignées */}
              <div className="gx-mt-f">
                <div className="gx-mt-between">
                  <span>Sélection</span>
                  <span className="gx-num">
                    {fmt(startSec)} → {fmt(endSec)} · <span className="gx-mt-acc">{selDur.toFixed(1)} s</span>
                  </span>
                </div>
                <div className="gx-mt-trim">
                  <div
                    ref={timelineRef}
                    className="gx-mt-rail"
                    onPointerDown={onTimelinePointerDown}
                    onPointerMove={onTimelinePointerMove}
                    onPointerUp={onTimelinePointerUp}
                    onPointerCancel={onTimelinePointerUp}
                  >
                    <div
                      className="gx-mt-band"
                      style={{ left: `${startPct}%`, right: `${100 - endPct}%` }}
                    />

                    <button
                      type="button"
                      data-trim-handle="start"
                      role="slider"
                      aria-label="Début de la coupe"
                      aria-valuemin={0}
                      aria-valuemax={Number(Math.max(0, endSec - MIN_SELECTION).toFixed(2))}
                      aria-valuenow={Number(startSec.toFixed(2))}
                      disabled={submitting}
                      onKeyDown={(e) => {
                        if (e.key === "ArrowLeft") { e.preventDefault(); nudgeHandle("start", -FRAME_STEP); }
                        if (e.key === "ArrowRight") { e.preventDefault(); nudgeHandle("start", FRAME_STEP); }
                      }}
                      className="gx-mt-hdl"
                      style={{ left: `${startPct}%` }}
                    />
                    <button
                      type="button"
                      data-trim-handle="end"
                      role="slider"
                      aria-label="Fin de la coupe"
                      aria-valuemin={Number(Math.min(duration, startSec + MIN_SELECTION).toFixed(2))}
                      aria-valuemax={Number(duration.toFixed(2))}
                      aria-valuenow={Number(endSec.toFixed(2))}
                      disabled={submitting}
                      onKeyDown={(e) => {
                        if (e.key === "ArrowLeft") { e.preventDefault(); nudgeHandle("end", -FRAME_STEP); }
                        if (e.key === "ArrowRight") { e.preventDefault(); nudgeHandle("end", FRAME_STEP); }
                      }}
                      className="gx-mt-hdl"
                      style={{ left: `${endPct}%` }}
                    />
                  </div>

                  {/* Tête de lecture : calque séparé au-dessus du rail, jamais masquée par une poignée. */}
                  <div className="gx-mt-ph" aria-hidden="true">
                    <span style={{ left: `${currentPct}%` }}>
                      <i />
                      <b />
                    </span>
                  </div>
                </div>
              </div>

              {/* Lecture */}
              <div className="gx-mt-acts">
                <button type="button" className="gx-btn gx-sm" onClick={togglePlay} disabled={submitting}>
                  {playing ? <Pause className="gx-i" /> : <Play className="gx-i" />}
                  {playing ? "Pause" : "Lire"}
                </button>
                <button type="button" className="gx-btn gx-sm" onClick={() => { const t = Math.min(getLiveCurrentTime(), endSec - MIN_SELECTION); setCurrent(t); setStartSec(t); seek(t); }} disabled={submitting}>
                  Début ici
                </button>
                <button type="button" className="gx-btn gx-sm" onClick={() => { const t = Math.max(getLiveCurrentTime(), startSec + MIN_SELECTION); setCurrent(t); setEndSec(t); seek(t); }} disabled={submitting}>
                  Fin ici
                </button>
                <button type="button" className="gx-btn gx-sm" onClick={() => seek(startSec)} disabled={submitting}>
                  <StepForward className="gx-i" style={{ transform: "rotate(180deg)" }} /> Aller au début
                </button>
                <button type="button" className="gx-btn gx-sm" onClick={() => seek(endSec)} disabled={submitting}>
                  <StepForward className="gx-i" /> Aller à la fin
                </button>
                <button type="button" className="gx-btn gx-sm gx-mt-push" onClick={previewSelection} disabled={submitting}>
                  <Play className="gx-i" /> Prévisualiser la sélection
                </button>
              </div>

              <p className="gx-hint">
                Fais glisser les poignées, ou mets la vidéo en pause au bon moment puis clique sur « Début ici » ou « Fin ici ». La version rognée garde la résolution d'origine, sans perte de qualité, et l'originale est conservée.
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
          <button type="button" className="gx-btn gx-pri" onClick={handleTrim} disabled={submitting || !duration}>
            {submitting ? <Loader2 className="gx-i gx-mt-spin" /> : <Scissors className="gx-i" />}
            Rogner ou couper
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
