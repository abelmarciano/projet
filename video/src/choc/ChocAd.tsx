// Short 9:16 « Je n'existe pas » — accroche choc dès la 1ʳᵉ image.
// 0–9,6 s : Manon (actrice IA du catalogue) parle face caméra dans sa voiture ; texte choc + glitch dès la frame 0,
// scan « généré par IA » sur « rien n'est réel », puis les ingrédients (produit, 1 phrase, acteur) → fin « Elle n'existe pas. Ta pub, si. »
// Zones sûres Reels/TikTok : rien d'important sous 1536 px ni au-dessus de 250 px. Aucun chiffre de résultat.
import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, continueRender, delayRender, interpolate, spring, staticFile, useCurrentFrame} from 'remotion';
import '@fontsource/inter/700.css';
import '@fontsource/inter/800.css';
import '@fontsource/inter/900.css';
import {LogoMark, Wordmark} from '../components/UI';
import {prog} from '../components/anim';
import WJ from './words.json';

type Word = {w: string; s: number; e: number};
const W = WJ as Word[];
const ws = (start: string) => Math.round((W.find((x) => x.w.toLowerCase().startsWith(start))?.s ?? 0) * 30);
const END = Math.round((W[W.length - 1].e + 0.3) * 30);
export const T = {end: END, total: END + 84};
const PAGE = '#F4F1EA', INK = '#16141A', MUTED = '#6E6A73', ACC = '#5B3FE4';
const GRAD = 'linear-gradient(120deg, #2563EB 0%, #5B3FE4 52%, #9333EA 100%)';
const FONT = 'Inter, system-ui, sans-serif';
const sp = (f: number, d = 12, m = 0.7) => spring({frame: f, fps: 30, config: {damping: d, mass: m, stiffness: 180}});
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const useFonts = () => {
  const [h] = useState(() => delayRender('fonts'));
  useEffect(() => { Promise.all(['700 20px Inter', '800 20px Inter', '900 20px Inter'].map((s) => document.fonts.load(s))).then(() => continueRender(h)); }, [h]);
};
// pseudo-aléatoire déterministe
const rnd = (a: number) => { const x = Math.sin(a * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

// intensité du glitch (0..1) selon la frame
const SCAN = ws('rien');
const glitchAt = (f: number) => {
  const bursts: [number, number, number][] = [[0, 8, 1], [ws('visage') - 1, 5, 0.55], [SCAN - 2, 6, 0.8], [ws('réel') + 2, 9, 1], [END - 6, 6, 1]];
  let g = 0;
  for (const [s, d, k] of bursts) if (f >= s && f < s + d) g = Math.max(g, k * (1 - (f - s) / d) * (0.6 + 0.4 * rnd(f)));
  return g;
};

const Talk: React.FC = () => {
  const f = useCurrentFrame();
  const g = glitchAt(f);
  const zoom = interpolate(f, [0, 10, END], [1.16, 1.06, 1.12], clamp);
  const v = <OffthreadVideo src={staticFile('media/choc/talk.mp4')} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />;
  const slices = g > 0.05 ? Array.from({length: 7}, (_, i) => {
    const y = rnd(f * 3 + i) * 1800, h = 30 + rnd(f * 5 + i) * 140, dx = (rnd(f * 7 + i) - 0.5) * 160 * g;
    return {y, h, dx};
  }) : [];
  return (
    <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
      <AbsoluteFill style={{transform: `scale(${zoom}) translateX(${g * (rnd(f) - 0.5) * 30}px)`}}>
        {v}
        {g > 0.05 && <>
          <AbsoluteFill style={{mixBlendMode: 'screen', opacity: 0.7 * g, transform: `translateX(${-18 * g}px)`, filter: 'sepia(1) saturate(8) hue-rotate(-50deg)'}}>{v}</AbsoluteFill>
          <AbsoluteFill style={{mixBlendMode: 'screen', opacity: 0.7 * g, transform: `translateX(${18 * g}px)`, filter: 'sepia(1) saturate(8) hue-rotate(150deg)'}}>{v}</AbsoluteFill>
          {slices.map((s, i) => <AbsoluteFill key={i} style={{clipPath: `inset(${s.y}px 0 ${Math.max(0, 1920 - s.y - s.h)}px 0)`, transform: `translateX(${s.dx}px)`}}>{v}</AbsoluteFill>)}
        </>}
      </AbsoluteFill>
      {/* lignes de balayage + vignette */}
      <AbsoluteFill style={{background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.10) 0 2px, transparent 2px 5px)', opacity: 0.25 + g * 0.6}} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 40%, transparent 55%, rgba(0,0,0,0.45))'}} />
    </AbsoluteFill>
  );
};

// scan IA : grille violette qui descend sur le visage pendant « rien n'est réel »
const Scan: React.FC = () => {
  const f = useCurrentFrame();
  const p = interpolate(f, [SCAN - 2, SCAN + 22], [0, 1], clamp);
  const out = interpolate(f, [SCAN + 30, SCAN + 42], [1, 0], clamp);
  if (p <= 0 || out <= 0) return null;
  const y = 150 + p * 1050;
  return (
    <AbsoluteFill style={{opacity: out}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: y, background: 'linear-gradient(rgba(91,63,228,0.0), rgba(91,63,228,0.18))', backgroundImage: 'linear-gradient(rgba(167,139,250,0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(167,139,250,0.35) 1px, transparent 1px)', backgroundSize: '46px 46px', mixBlendMode: 'screen'}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: y - 3, height: 6, background: '#C4B5FD', boxShadow: '0 0 30px 10px rgba(139,92,246,0.9)'}} />
    </AbsoluteFill>
  );
};

// bandeau « généré par IA » (sous la zone haute réservée)
const Badge: React.FC = () => {
  const f = useCurrentFrame();
  const a = sp(f - (SCAN + 10), 11);
  if (f < SCAN + 10) return null;
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 270, display: 'flex', justifyContent: 'center', fontFamily: FONT, transform: `scale(${0.6 + 0.4 * a})`, opacity: a}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 14, background: 'rgba(22,20,26,0.82)', border: '2px solid rgba(196,181,253,0.7)', color: '#fff', fontWeight: 800, fontSize: 38, padding: '14px 30px', borderRadius: 999, letterSpacing: '0.04em'}}>
        <span style={{width: 16, height: 16, borderRadius: 8, background: '#EF4444', boxShadow: '0 0 14px #EF4444', opacity: Math.floor(f / 8) % 2 ? 1 : 0.35}} />
        100 % GÉNÉRÉE PAR IA
      </div>
    </div>
  );
};

// accroche : visible dès la frame 0
const Hook: React.FC = () => {
  const f = useCurrentFrame();
  if (f >= ws('ce')) return null;
  const g = glitchAt(f);
  const pop = f < 3 ? 1.12 : 1 + 0.02 * Math.sin(f / 3);
  const line = (txt: string, c: string) => (
    <div style={{position: 'relative'}}>
      {g > 0.05 && <div style={{position: 'absolute', inset: 0, color: '#22D3EE', transform: `translate(${-10 * g}px, ${3 * g}px)`, opacity: 0.8}}>{txt}</div>}
      {g > 0.05 && <div style={{position: 'absolute', inset: 0, color: '#F43F5E', transform: `translate(${10 * g}px, ${-3 * g}px)`, opacity: 0.8}}>{txt}</div>}
      <div style={{position: 'relative', color: c}}>{txt}</div>
    </div>
  );
  return (
    <div style={{position: 'absolute', left: 40, right: 40, top: 1080, textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 142, lineHeight: 0.95, letterSpacing: '-0.05em', textShadow: '0 8px 30px rgba(0,0,0,.75), 0 0 6px rgba(0,0,0,.8)', transform: `scale(${pop})`}}>
      {line("JE N'EXISTE", '#fff')}
      {line('PAS.', '#fff')}
    </div>
  );
};

// sous-titres mot par mot
const Caps: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / 30;
  if (f < ws('ce') || f >= END) return null;
  const words = W.slice(3);
  const i = words.findIndex((w) => t < w.e + 0.12);
  if (i < 0) return null;
  const n = 3; const grp = words.slice(Math.floor(i / n) * n, Math.floor(i / n) * n + n);
  return (
    <div style={{position: 'absolute', left: 50, right: 50, top: 1110, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 12, fontFamily: FONT}}>
      {grp.map((w, j) => { const on = t >= w.s - 0.02; const hot = on && t <= w.e + 0.08; const p = sp(Math.round((t - w.s) * 30), 9); return (
        <span key={j} style={{fontWeight: 900, fontSize: 74, textTransform: 'uppercase', letterSpacing: '-0.02em', color: '#fff', background: hot ? ACC : 'transparent', padding: '2px 16px', borderRadius: 16, textShadow: hot ? 'none' : '0 4px 16px rgba(0,0,0,.85), 0 0 4px rgba(0,0,0,.9)', opacity: on ? 1 : 0, transform: `scale(${on ? 0.7 + 0.3 * p : 0.7})`}}>{w.w.replace(/[.,:?!…]+$/, '')}</span>); })}
    </div>
  );
};

// les 3 ingrédients qui apparaissent pendant la 2ᵉ moitié
const Chips: React.FC = () => {
  const f = useCurrentFrame();
  if (f < ws('photo') - 2 || f >= END) return null;
  const items: [number, React.ReactNode][] = [
    [ws('photo'), <><Img src={staticFile('media/brume/p1.jpg')} style={{width: 58, height: 58, borderRadius: 12, objectFit: 'cover'}} />Ton produit</>],
    [ws('phrase'), <><span style={{fontSize: 40}}>✍️</span>1 phrase</>],
    [ws('présente'), <><Img src={staticFile('media/choc/manon.png')} style={{width: 58, height: 58, borderRadius: 29, objectFit: 'cover', objectPosition: '50% 25%'}} />Actrice IA</>],
  ];
  return (
    <div style={{position: 'absolute', left: 30, right: 30, top: 1330, display: 'flex', justifyContent: 'center', gap: 16, fontFamily: FONT}}>
      {items.map(([s, c], i) => { const a = sp(f - s, 10); return (
        <div key={i} style={{display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,0.95)', color: INK, fontWeight: 800, fontSize: 34, padding: '10px 22px 10px 12px', borderRadius: 22, boxShadow: '0 18px 40px -14px rgba(0,0,0,.6)', opacity: f >= s ? a : 0, transform: `translateY(${(1 - a) * 40}px) scale(${0.8 + 0.2 * a})`}}>{c}</div>); })}
    </div>
  );
};

const End: React.FC = () => {
  const f = useCurrentFrame();
  const a = sp(f - 2), b = sp(f - 14), btn = sp(f - 28, 11);
  return (
    <AbsoluteFill style={{background: PAGE, fontFamily: FONT}}>
      <AbsoluteFill style={{background: `radial-gradient(900px 900px at ${60 + Math.sin(f / 40) * 10}% 40%, rgba(91,63,228,0.16), transparent 70%)`}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 360, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, transform: `scale(${sp(f)})`}}><LogoMark size={64} draw={prog(f, 2, 20)} /><Wordmark size={58} /></div>
      <div style={{position: 'absolute', left: 50, right: 50, top: 560, textAlign: 'center', fontWeight: 900, fontSize: 118, lineHeight: 1.02, letterSpacing: '-0.055em', color: INK}}>
        <div style={{opacity: a, transform: `translateY(${(1 - a) * 50}px)`}}>Elle n'existe pas.</div>
        <div style={{opacity: b, transform: `translateY(${(1 - b) * 50}px)`, marginTop: 14}}><span style={{backgroundImage: GRAD, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent'}}>Ta pub, si.</span></div>
      </div>
      <div style={{position: 'absolute', left: 540 - 290, top: 1010, width: 580, height: 124, borderRadius: 62, background: INK, display: 'grid', placeItems: 'center', color: '#fff', fontWeight: 900, fontSize: 50, boxShadow: '0 30px 60px -24px rgba(0,0,0,.5)', transform: `scale(${btn})`}}>Lien en bio 👆</div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1170, textAlign: 'center', fontSize: 34, fontWeight: 700, color: MUTED, opacity: btn}}>growthity.ai</div>
    </AbsoluteFill>
  );
};

export const ChocAd: React.FC = () => {
  useFonts();
  const f = useCurrentFrame();
  const flash = interpolate(f, [0, 3], [0.55, 0], clamp) + interpolate(f, [END - 1, END, END + 6], [0, 0.7, 0], clamp);
  return (
    <AbsoluteFill style={{background: '#000', fontFamily: FONT}}>
      <Talk />
      <Scan />
      <Badge />
      <Hook />
      <Caps />
      <Chips />
      <Sequence from={END}><End /></Sequence>
      <AbsoluteFill style={{background: '#fff', opacity: flash, pointerEvents: 'none'}} />
      <Audio src={staticFile('media/choc/vo.mp3')} />
      <Audio src={staticFile('media/choc/bed.wav')} />
    </AbsoluteFill>
  );
};
