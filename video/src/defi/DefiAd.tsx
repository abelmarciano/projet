// Short 9:16 « Défi : ta pub en 2 minutes » — format réponse à un commentaire.
// Marcus (Kling v4 + voix Hugo en speech-to-speech) relève le défi de Léa → il tape dans Growthity (UI recréée par-dessus) →
// la pub générée de Salomé (bougie) en plein écran → retour Marcus : « Le prochain, c'est toi : mets ton produit en commentaire. »
// Zones sûres : rien d'important au-dessus de 250 px ni sous 1536 px, marge droite pour les boutons TikTok/Reels. Aucun chiffre de résultat.
import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Img, OffthreadVideo, Sequence, continueRender, delayRender, interpolate, spring, staticFile, useCurrentFrame, Audio} from 'remotion';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/inter/800.css';
import '@fontsource/inter/900.css';
import {LogoMark, Wordmark} from '../components/UI';
import CFG from './defi.json';

type Word = {w: string; s: number; e: number};
type Seg = {src: string; from: number; to: number; words: string; label?: string};
const C = CFG as unknown as {segs: Seg[]; words: Record<string, Word[]>; typeFrom: number; typeTo: number; chronoAt: number; readyAt: number};
const FPS = 30;
const SEGS = (() => { let at = 0; return C.segs.map((s) => { const d = Math.round((s.to - s.from) * FPS); const r = {...s, at, d}; at += d; return r; }); })();
const END = SEGS[SEGS.length - 1].at + SEGS[SEGS.length - 1].d;
export const T = {total: END + 45};
const INK = '#16141A', MUTED = '#6E6A73', ACC = '#5B3FE4', LINE = '#E7E3EE';
const GRAD = 'linear-gradient(120deg, #2563EB 0%, #5B3FE4 52%, #9333EA 100%)';
const FONT = 'Inter, system-ui, sans-serif';
const sp = (f: number, d = 12, m = 0.7) => spring({frame: f, fps: FPS, config: {damping: d, mass: m, stiffness: 180}});
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const M = (p: string) => staticFile(`media/${p}`);
const useFonts = () => {
  const [h] = useState(() => delayRender('fonts'));
  useEffect(() => { Promise.all(['600 20px Inter', '700 20px Inter', '800 20px Inter', '900 20px Inter'].map((s) => document.fonts.load(s))).then(() => continueRender(h)); }, [h]);
};
// temps source (s) du segment i à la frame globale g
const segAt = (g: number) => SEGS.find((s) => g >= s.at && g < s.at + s.d) ?? SEGS[SEGS.length - 1];
const srcT = (g: number) => { const s = segAt(g); return s.from + (g - s.at) / FPS; };

const Clips: React.FC = () => (
  <>
    {SEGS.map((s, i) => (
      <Sequence key={i} from={s.at} durationInFrames={s.d}>
        <SegVid s={s} />
      </Sequence>
    ))}
  </>
);
const SegVid: React.FC<{s: Seg & {d: number}}> = ({s}) => {
  const f = useCurrentFrame();
  const punch = interpolate(f, [0, 6], [1.08, 1.0], clamp);
  const drift = 1 + f / s.d * 0.04;
  return (
    <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
      <OffthreadVideo src={M(`defi/${s.src}-voice.mp4`)} startFrom={Math.round(s.from * FPS)} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${punch * drift})`}} />
    </AbsoluteFill>
  );
};

// sous-titres mot par mot (3 mots, mot courant surligné)
const Caps: React.FC = () => {
  const g = useCurrentFrame();
  if (g >= END) return null;
  const s = segAt(g); const t = srcT(g);
  const words = C.words[s.words].filter((w) => w.s >= s.from - 0.05 && w.e <= s.to + 0.2);
  const i = words.findIndex((w) => t < w.e + 0.1);
  if (i < 0 || t < words[0].s - 0.05) return null;
  const grp = words.slice(Math.floor(i / 3) * 3, Math.floor(i / 3) * 3 + 3);
  return (
    <div style={{position: 'absolute', left: 60, right: 120, top: 1240, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 10, fontFamily: FONT}}>
      {grp.map((w, j) => { const on = t >= w.s - 0.02; const hot = on && t <= w.e + 0.06; const p = sp(Math.round((t - w.s) * FPS), 9); return (
        <span key={j} style={{fontWeight: 900, fontSize: 64, textTransform: 'uppercase', letterSpacing: '-0.02em', color: hot ? INK : '#fff', background: hot ? '#FDE047' : 'transparent', padding: '0 12px', borderRadius: 12, textShadow: hot ? 'none' : '0 4px 14px rgba(0,0,0,.85), 0 0 4px rgba(0,0,0,.9)', opacity: on ? 1 : 0, transform: `scale(${on ? 0.75 + 0.25 * p : 0.75}) rotate(${hot ? -2 : 0}deg)`}}>{w.w.replace(/[.,:?!…]+$/, '')}</span>); })}
    </div>
  );
};

// sticker « Réponse au commentaire » (format TikTok), visible dès la frame 0
const Reply: React.FC = () => {
  const g = useCurrentFrame();
  const out = interpolate(g, [C.typeFrom - 10, C.typeFrom - 2], [1, 0], clamp);
  if (out <= 0) return null;
  const a = g < 2 ? 1 : 1 - 0.0 * g;
  return (
    <div style={{position: 'absolute', left: 70, top: 280, opacity: out * a, transform: `rotate(-3deg) scale(${g < 3 ? 1.08 : 1})`, fontFamily: FONT}}>
      <div style={{background: '#fff', borderRadius: 26, padding: '18px 26px 22px', boxShadow: '0 20px 50px -18px rgba(0,0,0,.6)', maxWidth: 760}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 12, color: MUTED, fontWeight: 700, fontSize: 28}}>
          <div style={{width: 40, height: 40, borderRadius: 20, background: 'linear-gradient(135deg,#F9A8D4,#FDBA74)', display: 'grid', placeItems: 'center', color: '#fff', fontWeight: 900, fontSize: 22}}>L</div>
          Réponse à @lea.atelier
        </div>
        <div style={{color: INK, fontWeight: 800, fontSize: 44, lineHeight: 1.15, marginTop: 10}}>Chiche tu fais une pub pour mes bougies en 2 min ? 🕯️</div>
      </div>
    </div>
  );
};

// chrono du défi
const Chrono: React.FC = () => {
  const g = useCurrentFrame();
  const g0 = C.chronoAt, g1 = C.readyAt;
  if (g < g0 || g >= SEGS[0].d + SEGS[1].d) return null;
  const done = g >= g1;
  const a = sp(g - g0, 10);
  return (
    <div style={{position: 'absolute', right: 140, top: 300, fontFamily: FONT, transform: `scale(${(0.6 + 0.4 * a) * (done ? 1 + 0.08 * Math.max(0, 1 - (g - g1) / 8) : 1)})`, opacity: a}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 14, background: done ? '#16A34A' : INK, color: '#fff', borderRadius: 999, padding: '14px 28px', fontWeight: 900, fontSize: 44, fontVariantNumeric: 'tabular-nums', boxShadow: '0 16px 40px -14px rgba(0,0,0,.6)'}}>
        <span style={{fontSize: 36}}>{done ? '✓' : '⏱️'}</span>{done ? 'Prête' : 'Chrono lancé'}
      </div>
    </div>
  );
};

// UI Growthity par-dessus le plan où il tape
const ChatUI: React.FC = () => {
  const g = useCurrentFrame();
  const a0 = C.typeFrom, a1 = C.typeTo;
  if (g < a0 - 2 || g >= a1 + 6) return null;
  const f = g - a0;
  const inA = sp(f, 13), out = interpolate(g, [a1 - 2, a1 + 6], [1, 0], clamp);
  const prompt = 'Une pub UGC pour les bougies de Léa, ambiance cosy le soir';
  const typed = prompt.slice(0, Math.max(0, Math.floor((f - 26) * 2.6)));
  const sent = f > 26 + prompt.length / 2.6 + 4;
  const prog = interpolate(f, [26 + prompt.length / 2.6 + 6, a1 - a0 - 10], [0, 1], clamp);
  const chip = (k: number, img: string, label: string, round = false) => { const s = sp(f - k, 10); return (
    <div style={{display: 'flex', alignItems: 'center', gap: 12, background: '#F5F3FA', border: `2px solid ${LINE}`, borderRadius: 18, padding: '8px 18px 8px 8px', fontWeight: 800, fontSize: 30, color: INK, opacity: f >= k ? s : 0, transform: `scale(${0.7 + 0.3 * s})`}}>
      <Img src={M(img)} style={{width: 64, height: 64, borderRadius: round ? 32 : 12, objectFit: 'cover', objectPosition: '50% 30%'}} />{label}
    </div>); };
  return (
    <div style={{position: 'absolute', left: 50, right: 50, top: 760, opacity: out, transform: `translateY(${(1 - inA) * 80}px) scale(${0.92 + 0.08 * inA})`, fontFamily: FONT}}>
      <div style={{background: '#fff', borderRadius: 40, padding: 34, boxShadow: '0 40px 90px -30px rgba(0,0,0,.7)'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 12, marginBottom: 22}}><LogoMark size={40} /><Wordmark size={36} /></div>
        <div style={{display: 'flex', gap: 14, marginBottom: 20}}>
          {chip(4, 'img-bougie.webp', 'Produit')}
          {chip(12, 'kling/salome/frontal.jpg', 'Salomé', true)}
        </div>
        <div style={{border: `2px solid ${sent ? ACC : LINE}`, borderRadius: 22, padding: '20px 24px', fontSize: 34, fontWeight: 600, color: typed ? INK : MUTED, minHeight: 92, lineHeight: 1.3}}>
          {typed || 'Décris ta pub…'}{!sent && typed && <span style={{opacity: Math.floor(f / 8) % 2 ? 1 : 0}}>|</span>}
        </div>
        {sent && <div style={{marginTop: 22}}>
          <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 28, fontWeight: 800, color: prog >= 1 ? '#16A34A' : ACC, marginBottom: 10}}>
            <span>{prog >= 1 ? '✓ Ta pub est prête' : 'Génération : acteur, voix, montage…'}</span><span>{Math.round(prog * 100)} %</span>
          </div>
          <div style={{height: 14, borderRadius: 7, background: '#EEEAF6', overflow: 'hidden'}}><div style={{width: `${prog * 100}%`, height: '100%', background: GRAD}} /></div>
        </div>}
      </div>
    </div>
  );
};

// étiquette sur la pub générée
const AdLabel: React.FC = () => {
  const g = useCurrentFrame();
  const ls = SEGS.filter((x) => x.label);
  const s = ls.find((x) => g >= x.at && g < x.at + x.d);
  if (!s) return null;
  const a = sp(g - ls[0].at, 10);
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 290, display: 'flex', justifyContent: 'center', fontFamily: FONT, opacity: a, transform: `scale(${0.7 + 0.3 * a})`}}>
      <div style={{background: '#fff', color: INK, borderRadius: 999, padding: '14px 30px', fontWeight: 900, fontSize: 40, boxShadow: '0 16px 40px -14px rgba(0,0,0,.6)', display: 'flex', alignItems: 'center', gap: 12}}>
        <LogoMark size={36} />{s.label}
      </div>
    </div>
  );
};

// appel à commenter + fin
const Cta: React.FC = () => {
  const g = useCurrentFrame();
  const last = SEGS[SEGS.length - 1];
  const k = last.at + Math.round(last.d * 0.45);
  if (g < k) return null;
  const a = sp(g - k, 10);
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 300, display: 'flex', justifyContent: 'center', fontFamily: FONT, opacity: a, transform: `translateY(${(1 - a) * -40}px) rotate(${Math.sin(g / 6) * 1.5}deg)`}}>
      <div style={{background: GRAD, color: '#fff', borderRadius: 28, padding: '20px 34px', fontWeight: 900, fontSize: 46, boxShadow: '0 20px 50px -16px rgba(60,30,160,.7)'}}>💬 Ton produit en commentaire</div>
    </div>
  );
};
const End: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: '#F4F1EA', fontFamily: FONT, alignItems: 'center', justifyContent: 'center'}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 16, transform: `scale(${sp(f)})`, marginTop: -200}}><LogoMark size={70} /><Wordmark size={64} /></div>
      <div style={{fontWeight: 900, fontSize: 64, color: INK, marginTop: 40, opacity: sp(f - 8), letterSpacing: '-0.04em', textAlign: 'center'}}>Ta pub vidéo en 2 minutes.</div>
      <div style={{marginTop: 50, background: INK, color: '#fff', borderRadius: 60, padding: '26px 56px', fontWeight: 900, fontSize: 46, transform: `scale(${sp(f - 16, 11)})`}}>Lien en bio 👆</div>
    </AbsoluteFill>
  );
};

export const DefiAd: React.FC = () => {
  useFonts();
  const g = useCurrentFrame();
  const flash = SEGS.slice(1).reduce((m, s) => Math.max(m, interpolate(g, [s.at - 1, s.at, s.at + 4], [0, 0.6, 0], clamp)), 0) + interpolate(g, [END - 1, END, END + 5], [0, 0.6, 0], clamp);
  return (
    <AbsoluteFill style={{background: '#000', fontFamily: FONT}}>
      <Clips />
      <ChatUI />
      <Reply />
      <Chrono />
      <AdLabel />
      <Cta />
      <Caps />
      <Sequence from={END}><End /></Sequence>
      <AbsoluteFill style={{background: '#fff', opacity: flash, pointerEvents: 'none'}} />
      <Audio src={M('defi/bed.wav')} />
    </AbsoluteFill>
  );
};
