import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Affiche la 1re image d'une vidéo comme miniature, sans lecture.
 * On capture l'image dans un canvas dès qu'elle est décodée ; si le serveur
 * interdit la capture, la vidéo arrêtée sur sa 1re image reste affichée.
 *
 * Robustesse (jamais de carré vide) :
 * - à la lecture des métadonnées on force un léger seek, ce qui déclenche
 *   `seeked` même sur les navigateurs qui ne chargent pas de données
 *   (Safari iOS avec preload="metadata") ;
 * - si rien n'est arrivé au bout de quelques secondes, la vidéo est rendue
 *   visible telle quelle au lieu de rester transparente ;
 * - si la vidéo est illisible, `fallbackSrc` (image de secours) est affichée.
 */
const posterCache = new Map<string, string>();
const LS_PREFIX = "vp:";
const READY_TIMEOUT_MS = 6000;

/** Clé stable : l'URL signée change, pas le chemin du fichier. */
function keyOf(src: string) {
  return src.split("#")[0]!.split("?")[0]!;
}
function readCache(src: string): string | null {
  const k = keyOf(src);
  const mem = posterCache.get(k);
  if (mem) return mem;
  if (typeof window === "undefined") return null;
  try {
    const v = window.localStorage.getItem(LS_PREFIX + k);
    if (v) posterCache.set(k, v);
    return v;
  } catch { return null; }
}
function writeCache(src: string, url: string) {
  const k = keyOf(src);
  posterCache.set(k, url);
  try { window.localStorage.setItem(LS_PREFIX + k, url); } catch {
    // Quota plein : on purge les anciennes vignettes puis on réessaie.
    try {
      Object.keys(window.localStorage).filter((x) => x.startsWith(LS_PREFIX)).slice(0, 40)
        .forEach((x) => window.localStorage.removeItem(x));
      window.localStorage.setItem(LS_PREFIX + k, url);
    } catch { /* ignore */ }
  }
}

export function VideoPoster({
  src, className, onReady, fallbackSrc,
}: { src: string; className?: string; onReady?: () => void; fallbackSrc?: string | null }) {
  const [poster, setPoster] = useState<string | null>(() => posterCache.get(keyOf(src)) ?? null);
  const [ready, setReady] = useState(!!poster);
  const [cors, setCors] = useState(true);
  const [failed, setFailed] = useState(false);
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLVideoElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  // Vignette déjà extraite lors d'une visite précédente : affichage immédiat.
  useEffect(() => {
    const c = readCache(src);
    if (c) { setPoster(c); setReady(true); }
  }, [src]);

  // La vidéo n'est chargée que lorsque la carte approche de l'écran.
  useEffect(() => {
    if (poster || visible) return;
    const el = boxRef.current;
    if (!el || typeof IntersectionObserver === "undefined") { setVisible(true); return; }
    const io = new IntersectionObserver((es) => {
      if (es.some((e) => e.isIntersecting)) { setVisible(true); io.disconnect(); }
    }, { rootMargin: "300px" });
    io.observe(el);
    return () => io.disconnect();
  }, [poster, visible]);

  useEffect(() => { if (poster) onReady?.(); }, [poster, onReady]);

  // Filet de sécurité : la vidéo ne reste jamais invisible.
  useEffect(() => {
    if (!visible || poster || ready) return;
    const t = setTimeout(() => { setReady(true); onReady?.(); }, READY_TIMEOUT_MS);
    return () => clearTimeout(t);
  }, [visible, poster, ready, onReady]);

  const capture = () => {
    const v = ref.current;
    setReady(true);
    onReady?.();
    if (!v || !v.videoWidth || v.readyState < 2) return;
    try {
      const c = document.createElement("canvas");
      const w = Math.min(360, v.videoWidth);
      c.width = w;
      c.height = Math.round((v.videoHeight / v.videoWidth) * w);
      c.getContext("2d")?.drawImage(v, 0, 0, c.width, c.height);
      const url = c.toDataURL("image/webp", 0.7);
      writeCache(src, url);
      setPoster(url);
    } catch {
      /* capture interdite : la vidéo figée sert de miniature */
    }
  };

  const nudge = () => {
    const v = ref.current;
    if (!v) return;
    try { if (v.currentTime < 0.05) v.currentTime = 0.1; } catch { /* ignore */ }
  };

  if (poster) return <img src={poster} alt="" loading="lazy" decoding="async" className={className} />;
  if (failed) {
    return fallbackSrc
      ? <img src={fallbackSrc} alt="" loading="lazy" decoding="async" className={className} />
      : <div className={cn(className, "bg-muted")} />;
  }
  if (!visible) return <div ref={boxRef} className={cn(className, "bg-muted")} />;
  const url = src.includes("#") ? src : `${src}#t=0.1`;
  return (
    <video
      ref={ref}
      src={url}
      key={cors ? "cors" : "plain"}
      crossOrigin={cors ? "anonymous" : undefined}
      muted
      playsInline
      preload="metadata"
      disablePictureInPicture
      onLoadedMetadata={nudge}
      onLoadedData={capture}
      onSeeked={capture}
      onError={() => {
        if (cors) setCors(false);
        else { setFailed(true); setReady(true); onReady?.(); }
      }}
      className={cn(className, "transition-opacity duration-300", ready ? "opacity-100" : "opacity-0")}
    />
  );
}
