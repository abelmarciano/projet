// « On rembobine » — pub Growthity au hook rembobinage, mode clair (9:16).
// Une vraie pub (Yanis, chef) → arrêt sur image + ⏪ : tout se rembobine (sous-titres, montage, voix, acteur, script)
// jusqu'à une seule phrase → ⏩ ×16 : Growthity reconstruit la pub → la pub en temps réel, publiée → « Une phrase. C'est tout. »
import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, continueRender, delayRender, interpolate, spring, staticFile, useCurrentFrame} from 'remotion';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/inter/800.css';
import '@fontsource/inter/900.css';
import {LogoMark, Wordmark} from '../components/UI';
import {EXPO, INOUT, prog} from '../components/anim';
import WORDS from './words.json';
import CFG from './rewind.json';

type Word = {w: string; s: number; e: number};
const WD = WORDS as Record<string, Word[]>;
const C = CFG as {clip: string; rev: string; adA: {from: number; to: number}; adB: {from: number; to: number}; capsA: Word[]; capsB: Word[]; prompt: string};
const INK = '#0B0A1F';
const MUTED = '#8A87A0';
const LINE = '#E6E4F0';
const BG = '#F6F5FB';
const GRAD = 'linear-gradient(120deg, #2563EB 0%, #5B3FE4 52%, #9333EA 100%)';
const FONT = 'Inter, system-ui, sans-serif';
const MONO = 'Inter, ui-monospace, monospace';
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const SHADOW = '0 1px 0 rgba(11,10,31,0.04), 0 50px 100px -40px rgba(46,32,140,0.35)';
const sp = (f: number, d = 12, m = 0.7) => spring({frame: f, fps: 30, config: {damping: d, mass: m, stiffness: 170}});
const G: React.FC<{children: React.ReactNode}> = ({children}) => (
  <span style={{backgroundImage: GRAD, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent'}}>{children}</span>
);

// ---- timeline (frames) ----
const A = Math.round((C.adA.to - C.adA.from) * 30); // durée de la pub d'ouverture
export const T = (() => {
  const freeze = A;
  const rew = freeze + 14; // début du rembobinage
  const prompt = rew + 54;
  const ff = prompt + 52;
  const adB = ff + 128;
  const end = adB + Math.round((C.adB.to - C.adB.from) * 30);
  return {freeze, rew, prompt, ff, adB, end, total: end + 84};
})();
export const VO = {1: T.freeze + 4, 2: T.prompt + 4, 3: T.ff + 2, 4: T.end + 4} as Record<number, number>;
const cue = (k: number, start: string, d = 0) => {
  const w = WD[`rw-${k}`].find((x) => x.w.toLowerCase().startsWith(start));
  return VO[k] + Math.round((w ? w.s : d) * 30);
};

const useFonts = () => {
  const [h] = useState(() => delayRender('fonts'));
  useEffect(() => {
    Promise.all(['700 20px Inter', '800 20px Inter', '900 20px Inter'].map((s) => document.fonts.load(s))).then(() => continueRender(h));
  }, [h]);
};

// sous-titres mot à mot d'une pub
const Caps: React.FC<{words: Word[]; t: number; top?: number}> = ({words, t, top = 1120}) => {
  const groups: Word[][] = [];
  let g: Word[] = [];
  words.forEach((w, i) => {
    const prev = words[i - 1];
    if (g.length && (g.length >= 3 || /[.,!?…]$/.test(prev?.w ?? ''))) { groups.push(g); g = []; }
    g.push(w);
  });
  if (g.length) groups.push(g);
  const gi = groups.findIndex((gr, i) => t >= gr[0].s - 0.05 && t < (groups[i + 1]?.[0].s ?? gr[gr.length - 1].e + 0.5) - 0.05);
  if (gi < 0) return null;
  return (
    <div style={{position: 'absolute', left: 60, right: 140, top, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '4px 14px'}}>
      {groups[gi].map((w, i) => {
        const on = t >= w.s - 0.03;
        const next = groups[gi][i + 1];
        const act = on && (next ? t < next.s - 0.02 : t < w.e + 0.3);
        return <span key={i} style={{fontFamily: FONT, fontWeight: 900, fontSize: 82, letterSpacing: '-0.02em', textTransform: 'uppercase', color: '#fff', padding: '0 12px', borderRadius: 16, background: act ? GRAD : 'transparent', opacity: on ? 1 : 0, textShadow: act ? 'none' : '0 6px 24px rgba(0,0,0,0.6)'}}>{w.w.replace(/[.,!?…]+$/, '')}</span>;
      })}
    </div>
  );
};

// ---------- 1. la pub d'ouverture ----------
const AdOpen: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / 30;
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <OffthreadVideo src={staticFile(C.clip)} startFrom={Math.round(C.adA.from * 30)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      <Caps words={C.capsA} t={t} />
      <div style={{position: 'absolute', left: 50, top: 120, display: 'flex', alignItems: 'center', gap: 12, padding: '12px 22px 12px 12px', borderRadius: 99, background: 'rgba(0,0,0,0.35)', color: '#fff', fontFamily: FONT, fontWeight: 700, fontSize: 26}}>
        <span style={{width: 44, height: 44, borderRadius: 22, background: '#B91C1C', color: '#fff', fontWeight: 900, fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>PF</span>
        pastafresca.paris · Sponsorisé
      </div>
    </AbsoluteFill>
  );
};

// ---------- 2. arrêt sur image + rembobinage ----------
const Freeze: React.FC = () => {
  const f = useCurrentFrame(); // local depuis T.freeze
  const g = prog(f, 0, 6);
  const shrink = prog(f, T.rew - T.freeze + 6, 22, INOUT);
  const icon = sp(f - 2, 9, 0.5);
  const tc = Math.max(0, A / 30 - Math.max(0, f - (T.rew - T.freeze)) / 30 * 4);
  return (
    <AbsoluteFill style={{background: BG}}>
      {/* l'image figée, qui recule et rapetisse */}
      <div style={{position: 'absolute', left: interpolate(shrink, [0, 1], [0, 330]), top: interpolate(shrink, [0, 1], [0, 640]), width: interpolate(shrink, [0, 1], [1080, 420]), height: interpolate(shrink, [0, 1], [1920, 747]), borderRadius: interpolate(shrink, [0, 1], [0, 36]), overflow: 'hidden', filter: `grayscale(${g * 0.7}) contrast(1.05)`, boxShadow: SHADOW, opacity: 1 - prog(f, T.prompt - T.freeze - 10, 10)}}>
        <OffthreadVideo muted src={staticFile(C.rev)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
        {/* lignes de rembobinage */}
        {f >= T.rew - T.freeze && Array.from({length: 6}, (_, i) => {
          const y = ((f * 37 + i * 330) % 2100) - 100;
          return <div key={i} style={{position: 'absolute', left: 0, right: 0, top: `${(y / 1920) * 100}%`, height: 14 + (i % 3) * 8, background: 'rgba(255,255,255,0.35)', mixBlendMode: 'overlay'}} />;
        })}
      </div>
      {/* ⏪ + compteur */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 230, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18, transform: `scale(${icon})`}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 18, padding: '20px 38px', borderRadius: 30, background: INK, color: '#fff'}}>
          <svg width="88" height="60" viewBox="0 0 44 30"><path d="M22 3 L4 15 L22 27 Z M42 3 L24 15 L42 27 Z" fill="#fff" /></svg>
          <span style={{fontFamily: MONO, fontVariantNumeric: 'tabular-nums', fontWeight: 800, fontSize: 64}}>00:{String(Math.floor(tc)).padStart(2, '0')}:{String(Math.floor((tc % 1) * 30)).padStart(2, '0')}</span>
        </div>
        <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 76, letterSpacing: '-0.04em', color: '#fff', background: INK, padding: '10px 34px 16px', borderRadius: 26, opacity: prog(f, 6, 8)}}>On rembobine.</div>
      </div>
      {/* les couches qui s'envolent (dans l'ordre inverse de fabrication) */}
      {['Sous-titres', 'Montage', 'Voix', 'Acteur', 'Script'].map((l, i) => {
        const a = T.rew - T.freeze + 4 + i * 9;
        const p = prog(f, a, 14, EXPO);
        if (f < a) return null;
        const side = i % 2 ? 1 : -1;
        return (
          <div key={l} style={{position: 'absolute', left: 540, top: 1000 + (i - 2) * 70, transform: `translate(-50%,-50%) translateX(${side * p * 700}px) rotate(${side * p * 20}deg)`, opacity: 1 - p * 0.9, display: 'flex', alignItems: 'center', gap: 12, padding: '16px 28px', borderRadius: 99, background: '#fff', border: `1px solid ${LINE}`, boxShadow: SHADOW, fontFamily: FONT, fontWeight: 800, fontSize: 34, color: INK, whiteSpace: 'nowrap'}}>
            <span style={{fontSize: 26, color: '#DC2626'}}>✕</span>{l}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// ---------- 3. la phrase ----------
const PromptCard: React.FC<{building?: number}> = () => null;
const Prompt: React.FC = () => {
  const f = useCurrentFrame(); // local depuis T.prompt
  const p = sp(f, 12);
  const out = prog(f, T.ff - T.prompt - 2, 10, INOUT);
  const head = sp(f - (VO[2] - T.prompt), 12);
  return (
    <AbsoluteFill style={{background: BG}}>
      <div style={{position: 'absolute', left: 60, right: 60, top: 330, textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 92, letterSpacing: '-0.045em', lineHeight: 1.0, color: INK, opacity: head * (1 - out), transform: `translateY(${(1 - head) * 40}px)`}}>
        Tout part<br /><G>d’une seule phrase.</G>
      </div>
      <div style={{position: 'absolute', left: 80, right: 80, top: 720, padding: '40px 44px', borderRadius: 40, background: '#fff', border: `1px solid ${LINE}`, boxShadow: SHADOW, transform: `scale(${(0.85 + 0.15 * p) * (1 - out * 0.4)}) translateY(${-out * 300}px)`, opacity: p}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 12, fontFamily: FONT, fontWeight: 800, fontSize: 24, letterSpacing: '0.14em', color: '#5B3FE4'}}><LogoMark size={32} />GROWTHITY</div>
        <div style={{marginTop: 20, fontFamily: FONT, fontWeight: 700, fontSize: 56, lineHeight: 1.22, letterSpacing: '-0.02em', color: INK}}>
          {C.prompt}<span style={{display: 'inline-block', width: 5, height: 58, marginLeft: 6, verticalAlign: 'middle', background: f % 30 < 16 ? '#5B3FE4' : 'transparent'}} />
        </div>
        <div style={{display: 'flex', justifyContent: 'flex-end', marginTop: 20}}>
          <div style={{width: 84, height: 84, borderRadius: 42, background: GRAD, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${f >= T.ff - T.prompt - 8 ? 0.88 : 1})`}}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none"><path d="M12 19V5M5 12l7-7 7 7" stroke="#fff" strokeWidth={2.8} strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
void PromptCard;

// ---------- 4. avance rapide ×16 ----------
const STEPS = [
  {k: 'script', l: 'Script'},
  {k: 'acteur', l: 'Acteur'},
  {k: 'voix', l: 'Voix'},
  {k: 'montage', l: 'Montage'},
  {k: 'format', l: 'Formats'},
];
const FastForward: React.FC = () => {
  const f = useCurrentFrame() + T.ff; // monté dans une Sequence à T.ff
  const ats = STEPS.map((s, i) => cue(3, s.k, 0.06 + i * 0.6));
  const cur = ats.reduce((a, t, i) => (f >= t ? i : a), -1);
  const done = cue(3, 'grossiti', 3.14);
  const ffIn = sp(f - T.ff, 10, 0.5);
  const frameIn = sp(f - T.ff - 4, 12);
  const out = prog(f, T.adB - 8, 8, INOUT);
  // l'aperçu de la pub qui se construit
  const showVid = f >= ats[1];
  const showCaps = f >= ats[3];
  const fmt = f >= ats[4] ? Math.floor((f - ats[4]) / 6) % 3 : 0;
  const fw = [420, 520, 560][fmt], fh = [747, 650, 560][fmt];
  return (
    <AbsoluteFill style={{background: BG, opacity: 1 - out}}>
      {/* ⏩ ×16 */}
      <div style={{position: 'absolute', right: 60, top: 140, display: 'flex', alignItems: 'center', gap: 14, padding: '16px 28px', borderRadius: 26, background: INK, color: '#fff', transform: `scale(${ffIn})`, transformOrigin: 'right center'}}>
        <svg width="64" height="44" viewBox="0 0 44 30"><path d="M2 3 L20 15 L2 27 Z M22 3 L40 15 L22 27 Z" fill="#fff" /></svg>
        <span style={{fontFamily: MONO, fontVariantNumeric: 'tabular-nums', fontWeight: 800, fontSize: 52}}>×16</span>
      </div>
      {/* étapes */}
      <div style={{position: 'absolute', left: 60, top: 140, display: 'flex', flexDirection: 'column', gap: 12}}>
        {STEPS.map((s, i) => {
          const on = f >= ats[i];
          const p = sp(f - ats[i], 10, 0.5);
          return (
            <div key={s.k} style={{display: 'flex', alignItems: 'center', gap: 14, padding: '12px 22px 12px 12px', borderRadius: 99, background: on ? '#fff' : 'transparent', border: `1.5px solid ${on ? '#C9C0F7' : LINE}`, fontFamily: FONT, fontWeight: 800, fontSize: 30, color: on ? INK : '#B9B6CB', transform: `scale(${on ? 0.9 + 0.1 * p : 0.9})`, transformOrigin: 'left center', boxShadow: on && i === cur ? '0 20px 40px -20px rgba(91,63,228,0.6)' : 'none'}}>
              <span style={{width: 44, height: 44, borderRadius: 22, background: on ? GRAD : '#EEEDF3', color: '#fff', fontSize: 22, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{on ? '✓' : ''}</span>{s.l}
            </div>
          );
        })}
      </div>
      {/* l'aperçu */}
      <div style={{position: 'absolute', left: 540 - fw / 2, top: 1100 - fh / 2, width: fw, height: fh, borderRadius: 36, overflow: 'hidden', background: '#fff', border: `1px solid ${LINE}`, boxShadow: SHADOW, transform: `scale(${frameIn})`}}>
        {/* script qui s'écrit à toute vitesse */}
        {!showVid && (
          <div style={{padding: 34, fontFamily: FONT}}>
            {['« Ici, les pâtes sont faites à la main… »', 'Plan : la pâte, la poêle, la flamme', '« Tu goûtes une fois… tu reviens. »'].map((l, i) => (
              <div key={i} style={{marginTop: i ? 22 : 0, fontWeight: 700, fontSize: 28, lineHeight: 1.3, color: INK}}>{l.slice(0, Math.max(0, Math.floor((f - ats[0] - i * 4) * 6)))}</div>
            ))}
          </div>
        )}
        {showVid && <OffthreadVideo muted src={staticFile(C.clip)} startFrom={Math.round(C.adA.from * 30)} playbackRate={2} style={{width: '100%', height: '100%', objectFit: 'cover', filter: f < ats[2] ? 'grayscale(1)' : 'none'}} />}
        {/* voix */}
        {f >= ats[2] && f < ats[3] + 6 && (
          <div style={{position: 'absolute', left: 20, right: 20, bottom: 20, height: 70, borderRadius: 18, background: 'rgba(255,255,255,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4}}>
            {Array.from({length: 26}, (_, i) => <div key={i} style={{width: 6, borderRadius: 3, background: '#6D4CF0', height: 8 + Math.abs(Math.sin(f / 1.5 + i)) * 46}} />)}
          </div>
        )}
        {/* montage : coupes */}
        {f >= ats[3] && f < ats[4] && <div style={{position: 'absolute', inset: 0, background: '#fff', opacity: (f - ats[3]) % 5 === 0 ? 0.6 : 0}} />}
        {showCaps && <div style={{position: 'absolute', left: 0, right: 0, top: '62%', textAlign: 'center'}}><span style={{fontFamily: FONT, fontWeight: 900, fontSize: 40, color: '#fff', padding: '2px 12px', borderRadius: 10, background: GRAD}}>FAITES À LA MAIN</span></div>}
      </div>
      {f >= ats[4] && <div style={{position: 'absolute', left: 0, right: 0, top: 1500, textAlign: 'center', fontFamily: MONO, fontVariantNumeric: 'tabular-nums', fontWeight: 800, fontSize: 40, color: '#5B3FE4'}}>{['9:16', '4:5', '1:1'][fmt]}</div>}
      {f >= done && (
        <div style={{position: 'absolute', left: 0, right: 0, top: 600, textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 82, letterSpacing: '-0.045em', color: INK, whiteSpace: 'nowrap', transform: `scale(${1.6 - 0.6 * sp(f - done, 9, 0.5)})`, zIndex: 3}}>
          <span style={{padding: '0 24px 8px', borderRadius: 28, background: '#fff', boxShadow: SHADOW}}><G>Growthity fait tout.</G></span>
        </div>
      )}
    </AbsoluteFill>
  );
};

// ---------- 5. la pub, en temps réel ----------
const AdLive: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / 30;
  const chip = sp(f - 10, 11);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <OffthreadVideo src={staticFile(C.clip)} startFrom={Math.round(C.adB.from * 30)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      <Caps words={C.capsB} t={t} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 130, display: 'flex', justifyContent: 'center', transform: `scale(${chip})`}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 12, padding: '16px 30px', borderRadius: 99, background: '#fff', fontFamily: FONT, fontWeight: 900, fontSize: 32, color: INK, boxShadow: '0 20px 50px -20px rgba(0,0,0,0.7)'}}>
          <span style={{width: 40, height: 40, borderRadius: 20, background: '#16A34A', color: '#fff', fontSize: 22, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>✓</span>Publiée sur Meta
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- 6. fin ----------
const End: React.FC = () => {
  const f = useCurrentFrame();
  const w4 = WD['rw-4'];
  const une = VO[4] - T.end + Math.round((w4.find((w) => w.w.startsWith('Une'))?.s ?? 1.08) * 30);
  const cest = VO[4] - T.end + Math.round((w4.find((w) => w.w.startsWith("c'est"))?.s ?? 1.76) * 30);
  const logo = sp(f - 2, 11);
  const a = sp(f - une + 2, 9, 0.6), b = sp(f - cest + 2, 9, 0.6);
  const cta = sp(f - cest - 14, 11);
  return (
    <AbsoluteFill style={{background: '#fff'}}>
      <div style={{position: 'absolute', left: 540, top: 430, transform: `translate(-50%,-50%) scale(${logo})`, display: 'flex', alignItems: 'center', gap: 22}}>
        <div style={{width: 120, height: 120, borderRadius: 36, background: '#F1EFFB', display: 'flex', alignItems: 'center', justifyContent: 'center'}}><LogoMark size={80} draw={prog(f, 2, 16)} /></div>
        <Wordmark size={78} />
      </div>
      <div style={{position: 'absolute', left: 40, right: 40, top: 620, textAlign: 'center', fontFamily: FONT, fontWeight: 900, letterSpacing: '-0.055em', lineHeight: 0.95, color: INK}}>
        <div style={{fontSize: 150, whiteSpace: 'nowrap', transform: `scale(${1.7 - 0.7 * a})`, opacity: Math.min(1, a * 2)}}>Une phrase.</div>
        <div style={{fontSize: 150, whiteSpace: 'nowrap', transform: `scale(${1.7 - 0.7 * b})`, opacity: Math.min(1, b * 2)}}><G>C’est tout.</G></div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1150, display: 'flex', justifyContent: 'center', opacity: Math.min(1, cta * 1.4), transform: `translateY(${(1 - cta) * 40}px)`}}>
        <div style={{padding: '32px 70px', borderRadius: 99, background: INK, color: '#fff', fontFamily: FONT, fontWeight: 900, fontSize: 44}}>Commencer →</div>
      </div>
    </AbsoluteFill>
  );
};

export const Rewind: React.FC = () => {
  useFonts();
  const f = useCurrentFrame();
  const flash = (at: number, k = 1) => interpolate(f, [at - 1, at, at + 5], [0, k, 0], clamp);
  return (
    <AbsoluteFill style={{background: BG, fontFamily: FONT}}>
      <Sequence from={0} durationInFrames={T.freeze}><AdOpen /></Sequence>
      <Sequence from={T.freeze} durationInFrames={T.prompt - T.freeze + 2}><Freeze /></Sequence>
      <Sequence from={T.prompt} durationInFrames={T.ff - T.prompt + 2}><Prompt /></Sequence>
      <Sequence from={T.ff} durationInFrames={T.adB - T.ff}><FastForward /></Sequence>
      <Sequence from={T.adB} durationInFrames={T.end - T.adB}><AdLive /></Sequence>
      <Sequence from={T.end}><End /></Sequence>
      <AbsoluteFill style={{background: '#fff', opacity: Math.max(flash(T.freeze, 0.9), flash(T.ff, 0.5), flash(T.adB, 0.7), flash(T.end, 0.5)), pointerEvents: 'none'}} />
      <Audio src={staticFile('rewind/bed.wav')} />
      {[1, 2, 3, 4].map((k) => (
        <Sequence key={k} from={VO[k]}><Audio src={staticFile(`voice/rw-${k}-n.mp3`)} /></Sequence>
      ))}
    </AbsoluteFill>
  );
};
