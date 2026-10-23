import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
// Icônes de la fenêtre : celles de l'application. Icônes de l'écran du téléphone : tracé proche de Meta (lucide).
import { Eye, X, Play, Pause, Check, AlertTriangle } from "@/components/icons";
import {
  Heart, MessageCircle, Send, Share2, Bookmark, MoreHorizontal, Camera, Music2, Home, Search,
  SquarePlus, Clapperboard, ChevronRight, ChevronUp, Volume2, VolumeX, Globe, User, X as MetaClose,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdSubtitleOverlay, type SubtitleLayerConfig } from "@/components/AdSubtitleOverlay";
import "@/styles/gx-meta-preview.css";

export type MetaPreviewVideo = { id: string; title: string; url: string; aspectRatio?: string | null; subtitlesConfig?: SubtitleLayerConfig | null };

/* Emplacements et zones cachées, en % d'une vidéo 9:16 (1080 × 1920), d'après les recommandations Meta. */
type Kind = "feed" | "reels" | "stories";
type Net = "fb" | "ig";
type Zones = { top: number; bottom: number; side: number };
type Placement = { id: string; net: Net; kind: Kind; label: string; fmt: string; zones: Zones | null; spec: Array<[string, string]> };
const FEED_CROP = 14.8; // 9:16 recadré en 4:5 : 14,8 % coupés en haut et en bas
const PLACEMENTS: Placement[] = [
  { id: "fb-feed", net: "fb", kind: "feed", label: "Fil d'actualité", fmt: "4:5", zones: null,
    spec: [["Format affiché", "4:5 · 1080 × 1350"], ["Coupé en haut", "14,8 % · 285 px"], ["Coupé en bas", "14,8 % · 285 px"], ["Zone sûre texte", "toute la partie visible"]] },
  { id: "fb-reels", net: "fb", kind: "reels", label: "Reels", fmt: "9:16", zones: { top: 14, bottom: 35, side: 6 },
    spec: [["Haut caché", "14 % · 270 px"], ["Bas caché", "35 % · 670 px"], ["Côtés", "6 % · 65 px chacun"], ["Zone sûre texte", "950 × 980 px"]] },
  { id: "fb-stories", net: "fb", kind: "stories", label: "Stories", fmt: "9:16", zones: { top: 14, bottom: 20, side: 6 },
    spec: [["Haut caché", "14 % · 250 px"], ["Bas caché", "20 % · 340 px"], ["Côtés", "6 % · 65 px chacun"], ["Zone sûre texte", "950 × 1330 px"]] },
  { id: "ig-feed", net: "ig", kind: "feed", label: "Fil d'actualité", fmt: "4:5", zones: null,
    spec: [["Format affiché", "4:5 · 1080 × 1350"], ["Coupé en haut", "14,8 % · 285 px"], ["Coupé en bas", "14,8 % · 285 px"], ["Zone sûre texte", "toute la partie visible"]] },
  { id: "ig-reels", net: "ig", kind: "reels", label: "Reels", fmt: "9:16", zones: { top: 14, bottom: 35, side: 6 },
    spec: [["Haut caché", "14 % · 270 px"], ["Bas caché", "35 % · 670 px"], ["Côtés", "6 % · 65 px chacun"], ["Zone sûre texte", "950 × 980 px"]] },
  { id: "ig-stories", net: "ig", kind: "stories", label: "Stories", fmt: "9:16", zones: { top: 14, bottom: 20, side: 6 },
    spec: [["Haut caché", "14 % · 250 px"], ["Bas caché", "20 % · 340 px"], ["Côtés", "6 % · 65 px chacun"], ["Zone sûre texte", "950 × 1330 px"]] },
];
const timeLabel = (t: number) => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, "0")}`;

export function MetaPlacementPreviewButton({ video, className, brandName, brandLogo }: { video: MetaPreviewVideo; className?: string; brandName?: string | null; brandLogo?: string | null }) {
  const [open, setOpen] = useState(false);
  return <>
    <Button type="button" variant="secondary" size="sm" className={className} onClick={e => { e.stopPropagation(); setOpen(true); }}><Eye className="h-4 w-4" />Aperçu Meta</Button>
    {open && <MetaPlacementPreview video={video} brandName={brandName} brandLogo={brandLogo} onClose={() => setOpen(false)} />}
  </>;
}

/** Aperçu local uniquement : aucune requête, aucun export, aucune génération, aucune API Meta. */
export function MetaPlacementPreview({ video, onClose, brandName, brandLogo }: { video: MetaPreviewVideo; onClose: () => void; brandName?: string | null; brandLogo?: string | null }) {
  const ref = useRef<HTMLVideoElement | null>(null);
  const boxRef = useRef<HTMLDivElement | null>(null);
  const subsRef = useRef<HTMLDivElement | null>(null);
  const resumeAt = useRef(0);
  const [pid, setPid] = useState("ig-reels");
  const [zonesOn, setZonesOn] = useState(false);
  const [subsOn, setSubsOn] = useState(true);
  const [appDark, setAppDark] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState(false);
  // Boîte réelle des sous-titres affichés, en % de la vidéo (mesurée, pas supposée).
  const [subBox, setSubBox] = useState<{ top: number; bottom: number; left: number; right: number } | null>(null);
  const p = PLACEMENTS.find(x => x.id === pid) ?? PLACEMENTS[4];
  const name = brandName?.trim() || "Ta page";
  const initials = name.split(/\s+/).map(w => w[0]).join("").slice(0, 2).toUpperCase();
  const hasSubs = Boolean(video.subtitlesConfig?.segments?.length);

  const close = () => { ref.current?.pause(); onClose(); };
  const choose = (id: string) => { resumeAt.current = ref.current?.currentTime ?? 0; setPid(id); };
  const togglePlay = async () => {
    const v = ref.current; if (!v) return;
    if (!v.paused) { v.pause(); return; }
    try { await v.play(); setError(false); } catch { setError(true); }
  };
  const measure = useCallback(() => {
    const box = boxRef.current?.getBoundingClientRect(); const layer = subsRef.current;
    if (!box || !layer || !box.width) { setSubBox(null); return; }
    let r: DOMRect | null = null;
    layer.querySelectorAll("span").forEach(el => {
      if (!el.textContent?.trim()) return;
      const b = el.getBoundingClientRect(); if (!b.width) return;
      r = r ? new DOMRect(Math.min(r.left, b.left), Math.min(r.top, b.top), Math.max(r.right, b.right) - Math.min(r.left, b.left), Math.max(r.bottom, b.bottom) - Math.min(r.top, b.top)) : b;
    });
    const m = r as DOMRect | null;
    setSubBox(m ? { top: (m.top - box.top) / box.height * 100, bottom: (box.bottom - m.bottom) / box.height * 100, left: (m.left - box.left) / box.width * 100, right: (box.right - m.right) / box.width * 100 } : null);
  }, []);
  useEffect(() => { const id = window.setInterval(measure, 400); return () => window.clearInterval(id); }, [measure, pid]);

  const z = p.zones;
  const checks: Array<{ ok: boolean; title: string; text: string }> = [];
  if (!hasSubs) checks.push({ ok: true, title: "Pas de sous-titres sur cette vidéo", text: "Garde les textes importants dans la zone verte." });
  else if (!subBox) checks.push({ ok: true, title: "Sous-titres", text: "Lance la lecture pour vérifier leur position." });
  else if (z) {
    const inBottom = subBox.bottom < z.bottom, inTop = subBox.top < z.top, onSide = subBox.left < z.side || subBox.right < z.side;
    checks.push({ ok: !inBottom && !inTop, title: inBottom ? "Sous-titres cachés en bas" : inTop ? "Sous-titres cachés en haut" : "Sous-titres dans la zone sûre", text: inBottom ? "La légende et le bouton les recouvrent." : inTop ? "Le nom de la page les recouvre." : "Au-dessus de la légende et du bouton." });
    checks.push({ ok: !onSide, title: onSide ? "Sous-titres trop près du bord" : "Largeur des sous-titres correcte", text: `Ils occupent ${Math.round(100 - subBox.left - subBox.right)} % de la largeur, marges de ${z.side} % respectées${onSide ? " : non" : ""}.` });
  } else {
    const cut = subBox.bottom < FEED_CROP || subBox.top < FEED_CROP;
    checks.push({ ok: !cut, title: cut ? "Sous-titres coupés dans le fil" : "Sous-titres visibles dans le fil", text: cut ? "Ils sont dans la bande coupée par le format 4:5." : "Ils restent dans la partie 4:5 affichée." });
  }
  if (!z) checks.push({ ok: false, title: "Haut et bas coupés", text: "Dans le fil, 14,8 % en haut et en bas ne s'affichent pas : n'y mets rien d'important." });

  const media = (
    <div className="mp-vbox" ref={boxRef}>
      <video key={pid} ref={ref} src={video.url} playsInline preload="auto" loop muted={muted} aria-label="Vidéo de la création"
        onLoadedMetadata={e => { const el = e.currentTarget; setDuration(Number.isFinite(el.duration) ? el.duration : 0); if (resumeAt.current) el.currentTime = resumeAt.current; if (playing) void el.play().catch(() => undefined); }}
        onTimeUpdate={e => setTime(e.currentTarget.currentTime)} onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onError={() => setError(true)} />
      {subsOn && <div className="mp-subs" ref={subsRef}><AdSubtitleOverlay config={video.subtitlesConfig} videoRef={ref} aspectRatio={video.aspectRatio} /></div>}
      {zonesOn && <ZoneLayer zones={z} />}
    </div>
  );
  const avatar = <span className="mp-av">{brandLogo ? <img src={brandLogo} alt="" /> : initials || <User />}</span>;

  return <DialogPrimitive.Root open onOpenChange={o => { if (!o) close(); }}>
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="mp-overlay" />
      <DialogPrimitive.Content className="mp-dlg console-app-portal" aria-describedby={undefined} onClick={e => e.stopPropagation()}>
        <header className="mp-h">
          <div><DialogPrimitive.Title className="mp-title">Aperçu Meta</DialogPrimitive.Title><small title={video.title}>{video.title}</small></div>
          <DialogPrimitive.Close className="mp-ib" aria-label="Fermer"><X /></DialogPrimitive.Close>
        </header>
        <div className="mp-body" data-preview-ad={video.id}>
          <nav className="mp-nav" aria-label="Emplacements">
            {(["fb", "ig"] as const).map(net => <div className="mp-grp" key={net}>
              <div className="mp-grp-h"><span className={`mp-logo mp-${net}`}>{net === "fb" ? "f" : <Camera />}</span><span>{net === "fb" ? "Facebook" : "Instagram"}</span></div>
              {PLACEMENTS.filter(x => x.net === net).map(x => <button key={x.id} type="button" className="mp-pl" aria-pressed={x.id === pid} onClick={() => choose(x.id)}>{x.label}<span className="mp-fmt">{x.fmt}</span></button>)}
            </div>)}
          </nav>

          <section className="mp-stage" aria-label={`${p.net === "fb" ? "Facebook" : "Instagram"} · ${p.label}`}>
            <div className="mp-tools">
              <Toggle on={zonesOn} onClick={() => setZonesOn(v => !v)}>Zones masquées</Toggle>
              {hasSubs && <Toggle on={subsOn} onClick={() => setSubsOn(v => !v)}>Sous-titres</Toggle>}
              {p.kind === "feed" && <Toggle on={appDark} onClick={() => setAppDark(v => !v)}>Mode sombre de l'appli</Toggle>}
            </div>
            <div className="mp-phone"><div className="mp-screen">
              <div className="mp-notch" />
              <div className={`mp-status${p.kind === "feed" && !appDark ? " mp-dark" : ""}`}><span>9:41</span><span>●●● 100 %</span></div>
              {p.kind === "feed" ? <FeedUI net={p.net} dark={appDark} name={name} avatar={avatar} media={media} />
                : <><div className="mp-full">{media}<div className="mp-shade-t" /><div className="mp-shade-b" /></div>
                  {p.kind === "reels" ? <ReelsUI net={p.net} name={name} avatar={avatar} /> : <StoriesUI name={name} avatar={avatar} progress={duration ? time / duration : 0} />}</>}
            </div></div>
            <div className="mp-ctrl">
              <button type="button" className="mp-ib mp-ib-b" aria-label={playing ? "Pause" : "Lire"} onClick={() => { void togglePlay(); }}>{playing ? <Pause /> : <Play />}</button>
              <input className="mp-scrub" type="range" aria-label="Position de lecture" min={0} max={duration || 1} step={0.05} value={time} disabled={!duration}
                style={{ "--p": `${duration ? time / duration * 100 : 0}%` } as CSSProperties}
                onChange={e => { const t = Number(e.target.value); if (ref.current) ref.current.currentTime = t; setTime(t); }} />
              <span className="mp-time">{timeLabel(time)} / {timeLabel(duration)}</span>
              <button type="button" className="mp-ib mp-ib-b" aria-label={muted ? "Activer le son" : "Couper le son"} onClick={() => setMuted(v => !v)}>{muted ? <VolumeX /> : <Volume2 />}</button>
            </div>
            {error && <div className="mp-err" role="alert">La vidéo n'a pas pu être lue.<button type="button" onClick={() => { setError(false); ref.current?.load(); }}>Réessayer</button></div>}
          </section>

          <aside className="mp-side">
            <div>
              <h3 className="mp-sec">{p.net === "fb" ? "Facebook" : "Instagram"} · {p.label}</h3>
              <ul className="mp-checks">{checks.map((c, i) => <li key={i}><span className={c.ok ? "mp-ok" : "mp-wn"}>{c.ok ? <Check /> : <AlertTriangle />}</span><span>{c.title}<small>{c.text}</small></span></li>)}</ul>
            </div>
            <div>
              <h3 className="mp-sec">Zones de cet emplacement</h3>
              <dl className="mp-spec">{p.spec.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
            </div>
            <div className="mp-legend">
              <span><i className="mp-lr" />Caché par l'interface Meta</span>
              <span><i className="mp-lg" />Zone sûre pour le texte</span>
            </div>
          </aside>
        </div>
        <footer className="mp-f">
          <p>Simulation : l'interface exacte varie selon le téléphone et la version de l'appli. Les zones suivent les recommandations de Meta.</p>
          <DialogPrimitive.Close asChild><button type="button" className="mp-btn">Fermer</button></DialogPrimitive.Close>
        </footer>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  </DialogPrimitive.Root>;
}

function Toggle({ on, onClick, children }: { on: boolean; onClick: () => void; children: ReactNode }) {
  return <button type="button" className="mp-tg" aria-pressed={on} onClick={onClick}><span className="mp-sw" />{children}</button>;
}

function ZoneLayer({ zones }: { zones: Zones | null }) {
  if (!zones) return <div className="mp-zones" aria-hidden>
    <div className="mp-z" style={{ left: 0, right: 0, top: 0, height: `${FEED_CROP}%` }}><em>Coupé dans le fil</em></div>
    <div className="mp-z mp-zb" style={{ left: 0, right: 0, bottom: 0, height: `${FEED_CROP}%` }}><em>Coupé dans le fil</em></div>
    <div className="mp-safe" style={{ left: "2%", right: "2%", top: `${FEED_CROP + 0.8}%`, bottom: `${FEED_CROP + 0.8}%` }}><em>Visible</em></div>
  </div>;
  const { top, bottom, side } = zones;
  return <div className="mp-zones" aria-hidden>
    <div className="mp-z" style={{ left: 0, right: 0, top: 0, height: `${top}%` }}><em>Haut caché · {top} %</em></div>
    <div className="mp-z mp-zb" style={{ left: 0, right: 0, bottom: 0, height: `${bottom}%` }}><em>Bas caché · {bottom} %</em></div>
    <div className="mp-z mp-zs" style={{ left: 0, top: `${top}%`, bottom: `${bottom}%`, width: `${side}%` }} />
    <div className="mp-z mp-zs" style={{ right: 0, top: `${top}%`, bottom: `${bottom}%`, width: `${side}%` }} />
    <div className="mp-safe" style={{ left: `${side}%`, right: `${side}%`, top: `${top}%`, bottom: `${bottom}%` }}><em>Zone sûre</em></div>
  </div>;
}

function ReelsUI({ net, name, avatar }: { net: Net; name: string; avatar: ReactNode }) {
  const ig = net === "ig";
  return <div className="mp-ui">
    <div className="mp-r-top"><span>Reels</span><Camera /></div>
    <div className="mp-rail">
      <span><Heart /><small>1,2 k</small></span><span><MessageCircle /><small>48</small></span>
      <span>{ig ? <Send /> : <Share2 />}<small>{ig ? "" : "Partager"}</small></span><span><MoreHorizontal /></span>
      {ig && <span className="mp-audio" />}
    </div>
    <div className="mp-r-bottom">
      <div className="mp-who">{avatar}<b>{name}</b>{!ig && <span className="mp-follow">Suivre</span>}</div>
      <div className="mp-line">Sponsorisé · Légende de la publicité</div>
      {ig && <div className="mp-line mp-music"><Music2 />Audio original</div>}
      <div className={`mp-cta-bar${ig ? "" : " mp-cta-fb"}`}><span>En savoir plus</span><ChevronRight /></div>
    </div>
    <div className="mp-tabbar"><Home /><Search />{ig ? <SquarePlus /> : <Clapperboard />}{ig ? <Clapperboard /> : <User />}<span className="mp-tab-av">{avatar}</span></div>
  </div>;
}

function StoriesUI({ name, avatar, progress }: { name: string; avatar: ReactNode; progress: number }) {
  return <div className="mp-ui">
    <div className="mp-st-top">
      <div className="mp-bars"><i><b style={{ width: `${Math.min(100, progress * 100)}%` }} /></i></div>
      <div className="mp-who">{avatar}<span><b>{name}</b><small>Sponsorisé</small></span><span className="mp-st-x"><MoreHorizontal /><MetaClose /></span></div>
    </div>
    <div className="mp-st-cta"><ChevronUp /><span>En savoir plus</span></div>
  </div>;
}

function FeedUI({ net, dark, name, avatar, media }: { net: Net; dark: boolean; name: string; avatar: ReactNode; media: ReactNode }) {
  const ig = net === "ig";
  const head = <div className="mp-p-h">{avatar}<div><b>{name}</b><small>Sponsorisé{!ig && <> · <Globe /></>}</small></div><MoreHorizontal /></div>;
  return <div className={`mp-feed${dark ? " mp-feed-dark" : ""}`}>
    <div className={`mp-f-app${ig ? " mp-f-ig" : ""}`}>{ig ? <><span className="mp-ig-word">Instagram</span><span className="mp-f-ic"><Heart /><Send /></span></> : <><span>facebook</span><span className="mp-f-ic"><Search /><MessageCircle /></span></>}</div>
    <div className="mp-post">
      {head}
      {!ig && <div className="mp-p-txt">Légende de la publicité <span>Voir plus</span></div>}
      <div className="mp-p-media">{media}</div>
      {ig ? <>
        <div className="mp-ig-cta"><span>En savoir plus</span><ChevronRight /></div>
        <div className="mp-ig-act"><Heart /><MessageCircle /><Send /><Bookmark className="mp-sv" /></div>
        <div className="mp-ig-txt"><b>{name}</b> Légende de la publicité <span>… plus</span></div>
      </> : <>
        <div className="mp-p-cta"><div><small>ton-site.fr</small><b>Titre de la publicité</b></div><span>En savoir plus</span></div>
        <div className="mp-p-act"><span>J'aime</span><span>Commenter</span><span>Partager</span></div>
      </>}
    </div>
  </div>;
}
