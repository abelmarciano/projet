#!/usr/bin/env python3
"""v38 : nouvelle fenêtre « Aperçu Meta » (design de la maquette validée).
Remplace 2 fichiers en entier, rien d'autre. Exports et props inchangés : create.tsx n'est pas touché.
Usage : python3 apply-v38.py [--check]"""
import sys, pathlib, hashlib, subprocess
CHECK = "--check" in sys.argv
FILES = [
    ('src/components/placement/MetaPlacementPreview.tsx', 'e8baf87796953b4b', r'''import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
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
'''),
    ('src/styles/gx-meta-preview.css', 'fbbe5034451443ef', r'''/* Fenêtre « Aperçu Meta » (v38) : emplacements à gauche, téléphone 9:16 au centre, contrôle à droite.
   Couleurs de la fenêtre : jetons --app-* (clair et sombre via .dark). L'écran du téléphone reproduit Meta et garde ses propres couleurs. */
.mp-overlay{position:fixed;inset:0;z-index:79;background:var(--app-overlay,rgba(0,0,0,.5))}
.mp-dlg{position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);z-index:80;width:min(1080px,calc(100vw - 24px));max-height:calc(100dvh - 24px);display:flex;flex-direction:column;overflow:hidden;background:var(--app-surface);color:var(--app-fg);border:1px solid var(--app-line);border-radius:20px;box-shadow:var(--app-sh-lg);font:14px/1.5 var(--font-sans,"Inter",ui-sans-serif,system-ui,sans-serif);-webkit-font-smoothing:antialiased}
.mp-dlg *,.mp-dlg *::before,.mp-dlg *::after{box-sizing:border-box}
.mp-dlg button{font:inherit;color:inherit}

/* En-tête */
.mp-h{display:flex;align-items:flex-start;gap:12px;padding:20px 24px 14px;border-bottom:1px solid var(--app-line);flex:none}
.mp-h>div{flex:1;min-width:0}
.mp-title{display:block;margin:0;font-size:17px;font-weight:600;line-height:1.4;color:var(--app-fg)}
.mp-h small{display:block;color:var(--app-dim);font-size:13.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.mp-ib{width:34px;height:34px;border:0;border-radius:9px;background:none;color:var(--app-dim);display:grid;place-items:center;cursor:pointer;flex:none;padding:0}
.mp-ib:hover{background:var(--app-sunk);color:var(--app-fg)}
.mp-ib svg{width:18px;height:18px}

/* Corps : trois colonnes */
.mp-body{display:grid;grid-template-columns:220px minmax(0,1fr) 280px;min-height:0;flex:1;overflow-y:auto}
@media (max-width:980px){.mp-body{grid-template-columns:200px minmax(0,1fr)}.mp-side{grid-column:1/-1;border-left:0!important;border-top:1px solid var(--app-line)}}
@media (max-width:640px){.mp-body{grid-template-columns:minmax(0,1fr)}.mp-nav{border-right:0!important;border-bottom:1px solid var(--app-line)}}

/* Emplacements */
.mp-nav{padding:16px 12px;border-right:1px solid var(--app-line);display:flex;flex-direction:column;gap:14px;min-width:0}
.mp-grp{display:flex;flex-direction:column;gap:2px}
.mp-grp-h{display:flex;align-items:center;gap:8px;padding:0 8px 4px;font-size:11.5px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:var(--app-dim)}
.mp-logo{width:16px;height:16px;border-radius:5px;display:grid;place-items:center;color:#fff;font:800 11px/1 var(--font-sans,system-ui);text-transform:none;flex:none}
.mp-logo.mp-fb{background:var(--app-meta,#0866FF)}
.mp-logo.mp-ig{background:linear-gradient(45deg,#F58529,#DD2A7B,#8134AF)}
.mp-logo svg{width:11px;height:11px}
.mp-pl{display:flex;align-items:center;gap:10px;height:38px;padding:0 10px;border:0;border-radius:9px;background:none;text-align:left;font-size:14px;font-weight:500;color:var(--app-muted);cursor:pointer;width:100%}
.mp-pl:hover{background:var(--app-sunk);color:var(--app-fg)}
.mp-pl[aria-pressed="true"]{background:var(--app-accent-soft);color:var(--app-accent-ink);font-weight:600}
.mp-fmt{margin-left:auto;font-size:11.5px;font-weight:600;color:var(--app-faint);font-variant-numeric:tabular-nums}
.mp-pl[aria-pressed="true"] .mp-fmt{color:var(--app-accent-ink);opacity:.75}
@media (max-width:640px){
  .mp-nav{flex-direction:row;overflow-x:auto;gap:10px;padding:12px;scrollbar-width:none}
  .mp-nav::-webkit-scrollbar{display:none}
  .mp-grp{flex-direction:row;align-items:center;gap:4px;flex:none}
  .mp-grp-h{padding:0 4px 0 0}
  .mp-grp-h>span:not(.mp-logo){display:none}
  .mp-pl{flex:none;width:auto;height:34px}
  .mp-fmt{display:none}
}

/* Scène */
.mp-stage{padding:18px 16px 16px;display:flex;flex-direction:column;align-items:center;gap:12px;background:var(--app-raised);min-width:0}
.mp-tools{display:flex;flex-wrap:wrap;justify-content:center;gap:8px}
.mp-tg{display:inline-flex;align-items:center;gap:8px;height:32px;padding:0 12px;border:1px solid var(--app-line);border-radius:999px;background:var(--app-surface);font-size:13px;font-weight:500;cursor:pointer;color:var(--app-muted)}
.mp-tg[aria-pressed="true"]{border-color:var(--app-accent);background:var(--app-accent-soft);color:var(--app-accent-ink);font-weight:600}
.mp-sw{width:26px;height:16px;border-radius:999px;background:var(--app-line2);position:relative;transition:background .15s;flex:none}
.mp-sw::after{content:"";position:absolute;top:2px;left:2px;width:12px;height:12px;border-radius:50%;background:#fff;transition:transform .15s}
.mp-tg[aria-pressed="true"] .mp-sw{background:var(--app-accent)}
.mp-tg[aria-pressed="true"] .mp-sw::after{transform:translateX(10px)}

/* Téléphone : écran 9:16, comme la vidéo, pour que les zones tombent juste */
.mp-phone{position:relative;width:min(300px,100%,calc((100dvh - 330px) * 9 / 16 + 20px));min-width:200px;border-radius:38px;background:#0B0B0F;padding:10px;box-shadow:0 30px 60px rgba(0,0,0,.25),inset 0 0 0 2px #2A2A32}
.mp-screen{position:relative;width:100%;aspect-ratio:9/16;border-radius:29px;overflow:hidden;background:#000;color:#fff;font:13px/1.35 -apple-system,"SF Pro Text","Segoe UI",Roboto,"Inter",sans-serif}
.mp-notch{position:absolute;top:8px;left:50%;transform:translateX(-50%);width:84px;height:24px;border-radius:999px;background:#000;z-index:30}
.mp-status{position:absolute;top:0;left:0;right:0;height:40px;display:flex;align-items:center;justify-content:space-between;padding:0 22px 0 26px;font-size:12px;font-weight:600;z-index:25;color:#fff}
.mp-status.mp-dark{color:#111}

/* Vidéo plein écran (Reels, Stories) */
.mp-full{position:absolute;inset:0}
.mp-vbox{position:absolute;left:50%;top:50%;height:100%;aspect-ratio:9/16;transform:translate(-50%,-50%);overflow:hidden;background:#000}
.mp-vbox video{width:100%;height:100%;object-fit:cover;display:block}
.mp-subs{position:absolute;inset:0;z-index:5;pointer-events:none}
.mp-shade-b{position:absolute;left:0;right:0;bottom:0;height:42%;background:linear-gradient(transparent,rgba(0,0,0,.55));pointer-events:none;z-index:6}
.mp-shade-t{position:absolute;left:0;right:0;top:0;height:18%;background:linear-gradient(rgba(0,0,0,.35),transparent);pointer-events:none;z-index:6}

/* Zones masquées */
.mp-zones{position:absolute;inset:0;pointer-events:none;z-index:8}
.mp-z{position:absolute;background:repeating-linear-gradient(135deg,rgba(255,59,48,.30) 0 6px,rgba(255,59,48,.16) 6px 12px);border:1px dashed rgba(255,90,80,.95)}
.mp-z em{position:absolute;right:6px;bottom:4px;font:600 9.5px/1.2 "Inter",system-ui,sans-serif;font-style:normal;color:#fff;background:rgba(192,43,43,.92);padding:2px 5px;border-radius:4px;white-space:nowrap}
.mp-z.mp-zb em{right:auto;bottom:auto;left:6px;top:4px}
.mp-z.mp-zs em{display:none}
.mp-safe{position:absolute;border:1.5px solid rgba(52,199,89,.95);border-radius:4px}
.mp-safe em{position:absolute;right:4px;top:4px;font:600 9.5px/1.2 "Inter",system-ui,sans-serif;font-style:normal;color:#fff;background:rgba(19,122,69,.95);padding:2px 5px;border-radius:4px}

/* Interfaces Meta (proportions réelles) */
.mp-ui{position:absolute;inset:0;z-index:10;pointer-events:none}
.mp-av{width:30px;height:30px;border-radius:50%;background:linear-gradient(135deg,#7AA2FF,#A898FF,#FF7AC2);display:grid;place-items:center;font:700 11px "Inter",system-ui,sans-serif;color:#fff;flex:none;overflow:hidden}
.mp-av img{width:100%;height:100%;object-fit:cover}
.mp-av svg{width:16px;height:16px}
.mp-who{display:flex;align-items:center;gap:8px;min-width:0}
.mp-who b{font-weight:600;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.mp-who small{display:block;font-size:11.5px;opacity:.85}
.mp-follow{flex:none;height:24px;padding:0 10px;border:1px solid rgba(255,255,255,.7);border-radius:6px;display:grid;place-items:center;font-size:12px;font-weight:600}
.mp-r-top{position:absolute;top:38px;left:14px;right:14px;display:flex;align-items:center;justify-content:space-between;font-weight:700;font-size:17px}
.mp-r-top svg{width:22px;height:22px}
.mp-rail{position:absolute;right:8px;bottom:13%;display:flex;flex-direction:column;align-items:center;gap:12px}
.mp-rail>span{display:flex;flex-direction:column;align-items:center;gap:2px;font-size:10.5px;font-weight:600}
.mp-rail svg{width:24px;height:24px;filter:drop-shadow(0 1px 2px rgba(0,0,0,.4))}
.mp-rail small:empty{display:none}
.mp-audio{width:24px;height:24px;border-radius:6px;border:2px solid #fff;background:linear-gradient(135deg,#7AA2FF,#FF7AC2)}
.mp-r-bottom{position:absolute;left:12px;right:52px;bottom:58px;display:flex;flex-direction:column;gap:7px}
.mp-line{font-size:12.5px;opacity:.95;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.mp-music{display:flex;align-items:center;gap:6px}
.mp-music svg{width:12px;height:12px;flex:none}
.mp-cta-bar{display:flex;align-items:center;justify-content:space-between;height:36px;padding:0 12px;border-radius:8px;background:rgba(255,255,255,.22);backdrop-filter:blur(8px);font-weight:600;font-size:13px}
.mp-cta-bar.mp-cta-fb{background:#fff;color:#111}
.mp-cta-bar svg{width:16px;height:16px}
.mp-tabbar{position:absolute;left:0;right:0;bottom:0;height:50px;display:flex;justify-content:space-around;align-items:center;background:rgba(0,0,0,.92);border-top:1px solid rgba(255,255,255,.08)}
.mp-tabbar svg{width:22px;height:22px;opacity:.9}
.mp-tab-av .mp-av{width:24px;height:24px;font-size:9px}
.mp-st-top{position:absolute;top:36px;left:10px;right:10px;display:flex;flex-direction:column;gap:8px}
.mp-bars{display:flex;gap:3px}
.mp-bars i{flex:1;height:2.5px;border-radius:2px;background:rgba(255,255,255,.4);overflow:hidden}
.mp-bars b{display:block;height:100%;background:#fff}
.mp-st-x{margin-left:auto;display:flex;gap:12px;flex:none}
.mp-st-x svg{width:20px;height:20px}
.mp-st-cta{position:absolute;left:50%;bottom:34px;transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;gap:4px;font-weight:600;font-size:13px}
.mp-st-cta>span{display:flex;align-items:center;height:36px;padding:0 18px;border-radius:999px;background:#fff;color:#111;white-space:nowrap}
.mp-st-cta svg{width:16px;height:16px}

/* Fil d'actualité (4:5) */
.mp-feed{position:absolute;inset:0;background:#fff;color:#111;overflow:hidden;padding-top:40px}
.mp-feed.mp-feed-dark{background:#000;color:#fff}
.mp-f-app{height:40px;display:flex;align-items:center;justify-content:space-between;padding:0 12px;font-weight:800;font-size:20px;letter-spacing:-.02em;color:#0866FF}
.mp-f-app.mp-f-ig{color:inherit}
.mp-ig-word{font-family:"Billabong","Brush Script MT","Segoe Script",cursive;font-weight:400;font-size:24px;letter-spacing:0}
.mp-f-ic{display:flex;gap:14px;color:inherit}
.mp-feed:not(.mp-feed-dark) .mp-f-app:not(.mp-f-ig) .mp-f-ic{color:#111}
.mp-f-ic svg{width:22px;height:22px}
.mp-post{border-top:6px solid #EEF0F3}
.mp-feed-dark .mp-post{border-top-color:#111}
.mp-p-h{display:flex;align-items:center;gap:8px;padding:10px 12px}
.mp-p-h>div{min-width:0;flex:1;line-height:1.2}
.mp-p-h b{display:block;font-weight:600;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.mp-p-h small{display:flex;align-items:center;gap:3px;font-size:11.5px;opacity:.65}
.mp-p-h small svg{width:11px;height:11px}
.mp-p-h>svg{width:18px;height:18px;flex:none}
.mp-p-txt{padding:0 12px 8px;font-size:13px;line-height:1.35}
.mp-p-txt span{opacity:.6}
.mp-p-media{position:relative;width:100%;aspect-ratio:4/5;overflow:hidden;background:#000}
.mp-p-media .mp-vbox{height:auto;width:100%;left:0;transform:translateY(-50%)}
.mp-p-cta{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:9px 12px;background:#F0F2F5}
.mp-feed-dark .mp-p-cta{background:#18191A}
.mp-p-cta>div{min-width:0}
.mp-p-cta small{display:block;font-size:11px;opacity:.6;text-transform:uppercase}
.mp-p-cta b{font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;display:block}
.mp-p-cta>span{height:32px;padding:0 12px;border-radius:6px;background:#E4E6EB;font-weight:600;font-size:13px;display:grid;place-items:center;white-space:nowrap;flex:none}
.mp-feed-dark .mp-p-cta>span{background:#3A3B3C}
.mp-p-act{display:flex;justify-content:space-around;padding:8px 6px;font-size:12.5px;font-weight:600;opacity:.75}
.mp-ig-cta{display:flex;align-items:center;justify-content:space-between;height:40px;padding:0 12px;border-bottom:1px solid rgba(0,0,0,.08);font-weight:600;font-size:13px}
.mp-ig-cta svg{width:16px;height:16px}
.mp-feed-dark .mp-ig-cta{border-bottom-color:rgba(255,255,255,.12)}
.mp-ig-act{display:flex;gap:14px;padding:9px 12px 4px}
.mp-ig-act svg{width:24px;height:24px}
.mp-ig-act .mp-sv{margin-left:auto}
.mp-ig-txt{padding:2px 12px;font-size:12.5px}
.mp-ig-txt span{opacity:.6}

/* Lecture */
.mp-ctrl{display:flex;align-items:center;gap:10px;width:min(300px,100%)}
.mp-ib.mp-ib-b{width:32px;height:32px;background:var(--app-surface);border:1px solid var(--app-line);color:var(--app-fg)}
.mp-ib.mp-ib-b svg{width:15px;height:15px}
.mp-scrub{flex:1;min-width:0;height:16px;margin:0;background:none;-webkit-appearance:none;appearance:none;cursor:pointer;--p:0%}
.mp-scrub:disabled{cursor:default;opacity:.5}
.mp-scrub::-webkit-slider-runnable-track{height:4px;border-radius:999px;background:linear-gradient(var(--app-accent),var(--app-accent)) 0/var(--p) 100% no-repeat,var(--app-line2)}
.mp-scrub::-moz-range-track{height:4px;border-radius:999px;background:linear-gradient(var(--app-accent),var(--app-accent)) 0/var(--p) 100% no-repeat,var(--app-line2)}
.mp-scrub::-webkit-slider-thumb{-webkit-appearance:none;width:12px;height:12px;margin-top:-4px;border-radius:50%;background:var(--app-accent);border:0}
.mp-scrub::-moz-range-thumb{width:12px;height:12px;border-radius:50%;background:var(--app-accent);border:0}
.mp-time{font-size:12px;color:var(--app-dim);font-variant-numeric:tabular-nums;min-width:74px;text-align:right}
.mp-err{display:flex;align-items:center;gap:10px;font-size:13px;color:var(--app-err);background:var(--app-err-soft);padding:8px 12px;border-radius:10px}
.mp-err button{border:0;background:none;font-weight:600;text-decoration:underline;cursor:pointer;color:inherit;padding:0}

/* Colonne droite */
.mp-side{border-left:1px solid var(--app-line);padding:18px 18px 20px;display:flex;flex-direction:column;gap:16px;min-width:0}
.mp-sec{font-size:11.5px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:var(--app-dim);margin:0 0 8px}
.mp-checks{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:8px}
.mp-checks li{display:flex;gap:10px;align-items:flex-start;font-size:13.5px;line-height:1.4;color:var(--app-fg)}
.mp-checks .mp-ok,.mp-checks .mp-wn{flex:none;width:18px;height:18px;border-radius:50%;display:grid;place-items:center;margin-top:1px}
.mp-checks .mp-ok{background:var(--app-ok-soft);color:var(--app-ok)}
.mp-checks .mp-wn{background:var(--app-warn-soft);color:var(--app-warn)}
.mp-checks svg{width:11px;height:11px}
.mp-checks small{display:block;color:var(--app-dim);font-size:12.5px}
.mp-spec{display:grid;grid-template-columns:auto 1fr;gap:6px 12px;font-size:13px;margin:0}
.mp-spec>div{display:contents}
.mp-spec dt{color:var(--app-dim)}
.mp-spec dd{margin:0;font-variant-numeric:tabular-nums;text-align:right;color:var(--app-fg)}
.mp-legend{display:flex;flex-direction:column;gap:6px;font-size:12.5px;color:var(--app-muted)}
.mp-legend span{display:flex;align-items:center;gap:8px}
.mp-legend i{width:16px;height:10px;border-radius:2px;flex:none}
.mp-legend .mp-lr{background:repeating-linear-gradient(135deg,rgba(255,59,48,.5) 0 3px,rgba(255,59,48,.2) 3px 6px);border:1px dashed #E5484D}
.mp-legend .mp-lg{border:1.5px solid #34C759}

/* Pied */
.mp-f{display:flex;flex-wrap:wrap;align-items:center;gap:8px;padding:12px 24px;border-top:1px solid var(--app-line);background:var(--app-raised);flex:none}
.mp-f p{margin:0 auto 0 0;font-size:12.5px;color:var(--app-dim);max-width:520px}
.mp-btn{display:inline-flex;align-items:center;gap:8px;height:38px;padding:0 14px;border:1px solid var(--app-line2);border-radius:10px;background:var(--app-surface);color:var(--app-fg);font-size:14px;font-weight:500;cursor:pointer}
.mp-btn:hover{background:var(--app-raised)}
@media (max-width:640px){.mp-h{padding:16px 16px 12px}.mp-f{padding:12px 16px}.mp-phone{min-width:0;width:min(280px,100%)}}
@media (prefers-reduced-motion:reduce){.mp-dlg *{transition:none!important}}
'''),
]
ok = True
for path, sha, content in FILES:
    got = hashlib.sha256(content.encode()).hexdigest()[:16]
    if got != sha:
        print(f"ÉCHEC empreinte {path}: {got} au lieu de {sha} (contenu recopié modifié)"); ok = False
    if not pathlib.Path(path).exists():
        print(f"ÉCHEC fichier absent : {path}"); ok = False
# Les anciennes classes gx-meta-* ne doivent être utilisées nulle part ailleurs.
others = subprocess.run(["grep", "-rlE", r"gx-meta-(preview|mock|tab|viewport|source|ui|zone|controls|scrub|feed)", "src",
                         "--exclude=MetaPlacementPreview.tsx", "--exclude=gx-meta-preview.css"], capture_output=True, text=True).stdout.split()
if others:
    print("ÉCHEC anciennes classes utilisées ailleurs :", others); ok = False
if ok and not CHECK:
    for path, sha, content in FILES:
        pathlib.Path(path).write_text(content)
        print("écrit", path, sha)
print("OK" if ok else "ÉCHEC", "(vérification seule)" if CHECK else "")
sys.exit(0 if ok else 1)
