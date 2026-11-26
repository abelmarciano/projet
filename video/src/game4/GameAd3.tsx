// Pub Growthity 9:16, v3 (version longue) « jeu en monde ouvert » photoréaliste (création originale : titre, interface, typo et personnage maison).
// Écran-titre en vignettes au coucher du soleil → survol de la ville « Mission : faire ta première pub » → le perso court au
// CASTING, au STUDIO MONTAGE, à l'AGENCE PUB (l'argent fond) → budget à sec → nouveau lieu débloqué GROWTHITY → + $ → mission réussie.
// Voix off de briefing (Anthony), sous-titres de jeu.
import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, continueRender, delayRender, interpolate, spring, staticFile, useCurrentFrame} from 'remotion';
import '@fontsource/inter/700.css';
import '@fontsource/inter/800.css';
import '@fontsource/inter/900.css';
import '@fontsource/inter/900-italic.css';
import {LogoMark} from '../components/UI';
import {BRAND_PATHS} from '../components/brands';
import WJ from './words5.json';

type Word = {w: string; s: number; e: number};
const W = WJ as unknown as Record<string, Word[]>;
export const G5 = {intro: 0, aerial: 75, s1: 165, s1i: 255, s2: 375, s3: 525, s3i: 600, s4: 750, s5: 855, s5i: 945, end: 1110, total: 1200};
const G4 = G5;
const VOAT: [string, number][] = [['g5-0', 82], ['g5-1', 170], ['g5-2', 380], ['g5-3', 530], ['g5-4', 755], ['g5-5', 860], ['g5-6', 1115]];
const FONT = 'Inter, system-ui, sans-serif';
const GOLD = '#FFC83D', RED = '#FF3B3B', GREEN = '#3DDC84', ACC = '#7C5CFF';
const SUNSET = 'linear-gradient(180deg, #FFB547 0%, #FF6A88 48%, #A646FF 100%)';
const sp = (f: number, d = 12, m = 0.7) => spring({frame: f, fps: 30, config: {damping: d, mass: m, stiffness: 190}});
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const M = (p: string) => staticFile(`media/game4/${p}`);
const useFonts = () => {
  const [h] = useState(() => delayRender('fonts'));
  useEffect(() => { Promise.all(['700 20px Inter', '800 20px Inter', '900 20px Inter', 'italic 900 20px Inter'].map((s) => document.fonts.load(s))).then(() => continueRender(h)); }, [h]);
};
const stroke = (w = 5, c = '#000') => ({WebkitTextStroke: `${w}px ${c}`, paintOrder: 'stroke fill', textShadow: `0 ${w + 2}px 0 rgba(0,0,0,.6)`}) as React.CSSProperties;
const fmt = (n: number) => n.toLocaleString('fr-FR').replace(/ | /g, ' ');
const vcue = (k: string, start: string, d = 0) => { const at = VOAT.find((v) => v[0] === k)![1]; const w = W[k].find((x) => x.w.toLowerCase().startsWith(start)); return at + Math.round((w ? w.s : d) * 30); };

const SHOPS = [
  {at: G5.s1, dur: G5.s2 - G5.s1, name: 'CASTING', what: 'Un acteur', cost: 1500, k: 'g5-1', w: '500', meta: false},
  {at: G5.s2, dur: G5.s3 - G5.s2, name: 'STUDIO MONTAGE', what: 'Un monteur', cost: 800, k: 'g5-2', w: '800', meta: false},
  {at: G5.s3, dur: G5.s4 - G5.s3, name: 'META ADS', what: 'Pub ratée', cost: 500, k: 'g5-3', w: '500', meta: true},
  {at: G5.s4, dur: G5.s5 - G5.s4, name: 'AGENCE PUB', what: 'Par mois', cost: 2000, k: 'g5-4', w: '2', meta: false},
];
const GAINS = [30, 44, 56, 68, 80, 92, 104, 116, 128, 140];
const money = (g: number) => {
  let m = 5000;
  SHOPS.forEach((s) => { const t = vcue(s.k, s.w, 2); m -= s.cost * interpolate(g, [t, t + 16], [0, 1], clamp); });
  GAINS.forEach((t, i) => { m += (i < 4 ? 400 : 900) * interpolate(g, [G5.s5i + t, G5.s5i + t + 8], [0, 1], clamp); });
  return Math.round(m);
};

// écran-titre : vignettes de la ville au coucher du soleil + GROWTHITY tapé
const TitleCard: React.FC = () => {
  const f = useCurrentFrame();
  const tiles: [string, number, number, number, number][] = [['s0.jpg', -40, 120, 520, -6], ['s1.jpg', 560, 60, 500, 5], ['s4.jpg', 40, 1180, 470, 4], ['s2.jpg', 590, 1120, 480, -5], ['hero.jpg', 330, 300, 430, 2]];
  const word = 'GROWTHITY'; const n = Math.min(word.length, Math.floor((f - 14) / 3));
  const out = interpolate(f, [67, 75], [1, 0], clamp); const load = interpolate(f, [10, 66], [0, 1], clamp);
  return (
    <AbsoluteFill style={{background: '#1A0B2E', opacity: out}}>
      {tiles.map(([src, x, y, w, r], i) => { const p = sp(f - i * 3, 13); return (
        <div key={src} style={{position: 'absolute', left: x, top: y, width: w, height: w * 1.25, border: '10px solid #120720', borderRadius: 6, overflow: 'hidden', transform: `rotate(${r}deg) scale(${0.7 + 0.3 * p}) translateY(${(1 - p) * 80}px)`, opacity: p, boxShadow: '0 30px 60px rgba(0,0,0,.6)'}}>
          <Img src={M(src)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
          <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(255,140,60,.25), rgba(170,60,255,.35))', mixBlendMode: 'soft-light'}} />
        </div>); })}
      <AbsoluteFill style={{background: 'radial-gradient(600px 420px at 50% 55%, rgba(26,11,46,.85), rgba(26,11,46,0) 75%)'}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 860, textAlign: 'center', fontFamily: FONT}}>
        <div style={{display: 'inline-flex'}}>
          {word.split('').map((c, i) => { const p = sp(f - 14 - i * 3, 9, 0.5); return (
            <span key={i} style={{fontWeight: 900, fontStyle: 'italic', fontSize: 132, letterSpacing: '-0.03em', backgroundImage: SUNSET, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', WebkitTextStroke: '6px #120720', paintOrder: 'stroke fill', filter: 'drop-shadow(0 8px 0 #120720)', opacity: i < n ? 1 : 0, transform: `translateY(${(1 - p) * -70}px) scale(${0.6 + 0.4 * p}) rotate(-5deg)`, display: 'inline-block'}}>{c}</span>); })}
        </div>
      </div>
      <div style={{position: 'absolute', left: 120, right: 120, top: 1080, fontFamily: FONT}}>
        <div style={{height: 10, background: 'rgba(255,255,255,.15)', borderRadius: 5, overflow: 'hidden'}}><div style={{width: `${load * 100}%`, height: '100%', backgroundImage: SUNSET}} /></div>
        <div style={{marginTop: 18, textAlign: 'center', fontWeight: 700, fontSize: 28, color: '#E9DCFF', opacity: sp(f - 20, 12)}}>ASTUCE : une phrase suffit pour créer ta pub vidéo.</div>
      </div>
    </AbsoluteFill>
  );
};

const Hud: React.FC = () => {
  const g = useCurrentFrame();
  if (g < G4.aerial + 10 || g >= G4.end) return null;
  const m = money(g); const inP = sp(g - G4.aerial - 10, 14);
  const down = SHOPS.some((s) => { const t = vcue(s.k, s.w, 2); return g >= t && g < t + 22; });
  const up = g >= G5.s5i + 28 && g < G5.s5i + 150;
  const col = down ? RED : up ? GREEN : '#fff';
  const obj = g < G5.s5i + 150 ? 'Faire ta première pub vidéo' : 'Mission accomplie';
  const hp = Math.max(0.06, m / 5000);
  return (
    <>
      <div style={{position: 'absolute', right: 56, top: 290, textAlign: 'right', fontFamily: FONT, transform: `translateX(${(1 - inP) * 300}px)`}}>
        <div style={{fontWeight: 900, fontSize: 76, color: col, ...stroke(6), transform: `scale(${down || up ? 1.08 : 1})`, transformOrigin: 'right'}}>$ {fmt(m)}</div>
        <div style={{marginTop: 8, marginLeft: 'auto', width: 300, height: 16, background: 'rgba(0,0,0,.55)', border: '3px solid #000', borderRadius: 4}}><div style={{width: `${Math.min(1, hp) * 100}%`, height: '100%', background: hp < 0.3 ? RED : GREEN}} /></div>
      </div>
      <div style={{position: 'absolute', left: 50, top: 300, fontFamily: FONT, background: 'rgba(0,0,0,.62)', borderLeft: `8px solid ${GOLD}`, padding: '14px 22px', borderRadius: 8, opacity: inP, transform: `translateX(${(1 - inP) * -300}px)`, maxWidth: 520}}>
        <div style={{fontWeight: 800, fontSize: 20, letterSpacing: '0.18em', color: GOLD}}>OBJECTIF</div>
        <div style={{fontWeight: 800, fontSize: 32, color: '#fff', marginTop: 2}}>{obj}</div>
      </div>
    </>
  );
};

// sous-titres de jeu (voix off)
const Subs: React.FC = () => {
  const g = useCurrentFrame();
  let cur: [string, number] | null = null;
  for (const v of VOAT) if (g >= v[1] - 2) cur = v;
  if (!cur || g >= G4.end) return null;
  const words = W[cur[0]]; const t = (g - cur[1]) / 30;
  if (t > words[words.length - 1].e + 0.4) return null;
  const i = Math.max(0, words.findIndex((w) => t < w.e + 0.15));
  const grp = words.slice(Math.floor(i / 5) * 5, Math.floor(i / 5) * 5 + 5);
  return (
    <div style={{position: 'absolute', left: 70, right: 70, top: 1190, textAlign: 'center', fontFamily: FONT, fontWeight: 800, fontSize: 44, lineHeight: 1.25, color: '#fff', ...stroke(5)}}>
      {grp.map((w, j) => <span key={j} style={{color: t >= w.s - 0.02 && t <= w.e + 0.08 ? GOLD : '#fff'}}>{w.w} </span>)}
    </div>
  );
};

const Mission: React.FC = () => {
  const f = useCurrentFrame(); const p = sp(f - 4, 12); const out = interpolate(f, [62, 75], [1, 0], clamp);
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 760, textAlign: 'center', fontFamily: FONT, opacity: out, transform: `scale(${0.8 + 0.2 * p})`}}>
      <div style={{display: 'inline-block', background: '#000', color: GOLD, fontWeight: 900, fontSize: 30, letterSpacing: '0.2em', padding: '8px 20px', borderRadius: 4}}>NOUVELLE MISSION</div>
      <div style={{marginTop: 14, fontWeight: 900, fontStyle: 'italic', fontSize: 86, lineHeight: 1, color: '#fff', ...stroke(7)}}>Ta première<br />pub vidéo</div>
    </div>
  );
};

const Shop: React.FC<{i: number}> = ({i}) => {
  const f = useCurrentFrame(); const s = SHOPS[i];
  const card = sp(f - 8, 12); const t = vcue(s.k, s.w, 2) - s.at; const minus = sp(f - t, 9);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 50, top: 450, fontFamily: FONT, transform: `translateX(${(1 - card) * -700}px)`}}>
        <div style={{display: 'inline-block', background: 'rgba(0,0,0,.72)', borderRadius: 10, padding: '16px 24px', borderBottom: `6px solid ${RED}`}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 14, fontWeight: 900, fontSize: 52, color: '#fff', letterSpacing: '0.04em'}}>{s.meta && <svg width="64" height="64" viewBox="0 0 24 24"><path d={BRAND_PATHS.meta} fill="#0866FF" /></svg>}{s.name}</div>
          <div style={{fontWeight: 800, fontSize: 32, color: '#ddd', marginTop: 4}}>{s.what} : <span style={{color: RED}}>{fmt(s.cost)} $</span></div>
        </div>
      </div>
      {s.meta && f > 70 && f < 150 && ['Ciblage ?', 'Pixel ?!', 'Budget ?', 'Erreur'].map((q, j) => { const p = sp(f - 70 - j * 10, 9); return <div key={q} style={{position: 'absolute', left: [80, 640, 120, 600][j], top: [760, 820, 1000, 1060][j], fontFamily: FONT, fontWeight: 900, fontSize: 52, color: j === 3 ? RED : '#fff', ...stroke(5), transform: `scale(${p}) rotate(${(j % 2 ? 6 : -6)}deg)`}}>{q}</div>; })}
      {f >= t - 2 && <div style={{position: 'absolute', right: 70, top: 600, fontFamily: FONT, fontWeight: 900, fontSize: 88, color: RED, ...stroke(6), opacity: interpolate(f, [t, t + 8, t + 34, t + 46], [0, 1, 1, 0], clamp), transform: `scale(${0.6 + 0.4 * minus}) translateY(${-(f - t) * 1.5}px)`}}>− {fmt(s.cost)} $</div>}
    </AbsoluteFill>
  );
};

const Broke: React.FC = () => {
  const f = useCurrentFrame(); const a = sp(f, 10);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{background: `rgba(0,0,0,${0.4 * a})`}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 760, textAlign: 'center', fontFamily: FONT, transform: `scale(${1.4 - 0.4 * a})`, opacity: a}}>
        <div style={{fontWeight: 900, fontStyle: 'italic', fontSize: 108, color: RED, ...stroke(8)}}>BUDGET À SEC</div>
      </div>
    </AbsoluteFill>
  );
};

const Win: React.FC = () => {
  const f = useCurrentFrame();
  const unlock = sp(f - 2, 11); const uOut = interpolate(f, [80, 90], [1, 0], clamp); const O = G5.s5i - G5.s5;
  const pos: [number, number][] = [[160, 900], [700, 820], [380, 1040], [820, 1000], [220, 1120], [620, 700], [480, 880], [140, 760], [760, 920], [400, 760]];
  const done = sp(f - O - 135, 10);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 60, right: 60, top: 470, fontFamily: FONT, display: 'flex', alignItems: 'center', gap: 18, background: 'rgba(15,12,30,.92)', border: `3px solid ${ACC}`, borderRadius: 18, padding: '20px 24px', transform: `translateY(${(1 - unlock) * -200}px)`, opacity: unlock * uOut, boxShadow: `0 0 40px ${ACC}`}}>
        <div style={{width: 76, height: 76, borderRadius: 18, background: '#fff', display: 'grid', placeItems: 'center', flex: 'none'}}><LogoMark size={50} /></div>
        <div><div style={{fontWeight: 800, fontSize: 22, letterSpacing: '0.16em', color: GOLD}}>NOUVEAU LIEU DÉBLOQUÉ</div><div style={{fontWeight: 900, fontSize: 44, color: '#fff'}}>GROWTHITY</div></div>
      </div>
      {GAINS.map((t0, i) => { const t = t0 + O; const p = sp(f - t, 9); const o = interpolate(f, [t, t + 4, t + 26, t + 36], [0, 1, 1, 0], clamp); const [x, y] = pos[i]; return (
        <div key={i} style={{position: 'absolute', left: x, top: y - (f - t) * 3, fontFamily: FONT, fontWeight: 900, fontSize: 80, color: GREEN, ...stroke(6), opacity: o, transform: `scale(${0.5 + 0.5 * p})`}}>+ $</div>); })}
      {f >= O + 129 && <AbsoluteFill style={{background: `rgba(0,0,0,${0.35 * done})`}} />}
      {f >= O + 129 && <div style={{position: 'absolute', left: 0, right: 0, top: 760, textAlign: 'center', fontFamily: FONT, transform: `scale(${1.5 - 0.5 * done})`, opacity: done}}>
        <div style={{fontWeight: 900, fontStyle: 'italic', fontSize: 112, backgroundImage: SUNSET, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', WebkitTextStroke: '6px #120720', paintOrder: 'stroke fill', filter: 'drop-shadow(0 8px 0 #120720)'}}>MISSION RÉUSSIE</div>
      </div>}
    </AbsoluteFill>
  );
};

const End: React.FC = () => {
  const f = useCurrentFrame(); const a = sp(f, 12), b = sp(f - 10, 12), c = sp(f - 22, 11);
  return (
    <AbsoluteFill style={{background: 'radial-gradient(900px 900px at 50% 45%, #3A1760, #120720 70%)', fontFamily: FONT}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 520, display: 'flex', justifyContent: 'center', transform: `scale(${a})`}}><div style={{width: 160, height: 160, borderRadius: 40, background: '#fff', display: 'grid', placeItems: 'center'}}><LogoMark size={108} /></div></div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 730, textAlign: 'center', fontWeight: 900, fontStyle: 'italic', fontSize: 130, backgroundImage: SUNSET, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', WebkitTextStroke: '6px #120720', paintOrder: 'stroke fill', filter: 'drop-shadow(0 8px 0 #000)', opacity: b, transform: `translateY(${(1 - b) * 40}px)`}}>GROWTHITY</div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 900, textAlign: 'center', fontWeight: 800, fontSize: 46, color: '#F2E6FF', opacity: b}}>Ta pub vidéo, en une phrase.</div>
      <div style={{position: 'absolute', left: 540 - 270, top: 1020, width: 540, height: 120, borderRadius: 60, background: GOLD, display: 'grid', placeItems: 'center', fontWeight: 900, fontSize: 50, color: '#111', transform: `scale(${c})`, boxShadow: '0 8px 0 #B8860B'}}>COMMENCER</div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1170, textAlign: 'center', fontWeight: 700, fontSize: 34, color: '#CDB8F0', opacity: c}}>growthity.ai</div>
    </AbsoluteFill>
  );
};

const Clip: React.FC<{n: number | string; rate?: number}> = ({n, rate = 1}) => <OffthreadVideo muted playbackRate={rate} src={M(`v${n}.mp4`)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />;

export const GameAd3: React.FC = () => {
  useFonts();
  const g = useCurrentFrame();
  const flash = Math.max(...[G5.aerial, G5.s1, G5.s2, G5.s3, G5.s4, G5.s5, G5.end].map((t) => interpolate(g, [t - 1, t, t + 5], [0, 0.55, 0], clamp)));
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Sequence from={G5.aerial} durationInFrames={G5.s1 - G5.aerial}><Clip n={0} /></Sequence>
      <Sequence from={G5.s1} durationInFrames={G5.s1i - G5.s1}><Clip n={1} /></Sequence>
      <Sequence from={G5.s1i} durationInFrames={G5.s2 - G5.s1i}><Clip n="i1" /></Sequence>
      <Sequence from={G5.s2} durationInFrames={G5.s3 - G5.s2}><Clip n={2} /></Sequence>
      <Sequence from={G5.s3} durationInFrames={G5.s3i - G5.s3}><Clip n="s3m" /></Sequence>
      <Sequence from={G5.s3i} durationInFrames={G5.s4 - G5.s3i}><Clip n="i3" /></Sequence>
      <Sequence from={G5.s4} durationInFrames={G5.s5 - G5.s4}><Clip n={3} /></Sequence>
      <Sequence from={G5.s5} durationInFrames={G5.s5i - G5.s5}><Clip n={4} /></Sequence>
      <Sequence from={G5.s5i} durationInFrames={G5.end - G5.s5i}><Clip n="i5" rate={0.9} /></Sequence>
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,.35) 0%, rgba(0,0,0,0) 25%, rgba(0,0,0,0) 62%, rgba(0,0,0,.45))'}} />
      <Sequence from={0} durationInFrames={G4.aerial}><TitleCard /></Sequence>
      <Sequence from={G4.aerial} durationInFrames={G4.s1 - G4.aerial}><Mission /></Sequence>
      {SHOPS.map((s, i) => <Sequence key={i} from={s.at} durationInFrames={s.dur}><Shop i={i} /></Sequence>)}
      <Sequence from={vcue('g5-4', 'budget', 2)} durationInFrames={G5.s5 - vcue('g5-4', 'budget', 2)}><Broke /></Sequence>
      <Sequence from={G5.s5} durationInFrames={G5.end - G5.s5}><Win /></Sequence>
      <Hud />
      <Sequence from={G4.end}><End /></Sequence>
      <Subs />
      <AbsoluteFill style={{background: '#fff', opacity: flash, pointerEvents: 'none'}} />
      <Audio src={staticFile('game4/bed5.wav')} />
      {VOAT.map(([k, at]) => <Sequence key={k} from={at}><Audio src={staticFile(`voice/${k}-n.mp3`)} /></Sequence>)}
    </AbsoluteFill>
  );
};
