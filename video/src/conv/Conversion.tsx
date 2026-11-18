// « Des pubs vidéo qui vendent » — pub Growthity de conversion, niveau agence, mode clair premium (9:16, 24 s).
// Accroche : mur 3D de vraies pubs → la caméra plonge vers une phrase → démonstration (téléphone + annotations)
// → publiée sur Meta + optimisée → preuve : 6 métiers → appel à l'action. Chaque acteur n'apparaît qu'une fois.
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
import CFG from './conv.json';

type Word = {w: string; s: number; e: number};
const WD = WORDS as Record<string, Word[]>;
type Proof = {l: string; src: string; from: number; hook: [string, string]; key: string};
const C = CFG as unknown as {wall: string[]; hero: {src: string; from: number; caps: Word[]}; proof: Proof[]; prompt: string};
const INK = '#0A0A12';
const SUB = '#55536A';
const LINE = '#E7E5EE';
const BG = '#F7F6F3';
const GRAD = 'linear-gradient(120deg, #2563EB 0%, #5B3FE4 52%, #9333EA 100%)';
const FONT = 'Inter, system-ui, sans-serif';
const SHADOW = '0 1px 0 rgba(10,10,18,0.04), 0 2px 8px rgba(10,10,18,0.05), 0 40px 80px -40px rgba(30,20,90,0.35)';
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const sp = (f: number, d = 15, m = 0.8) => spring({frame: f, fps: 30, config: {damping: d, mass: m, stiffness: 160}});
const G: React.FC<{children: React.ReactNode}> = ({children}) => (
  <span style={{backgroundImage: GRAD, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent'}}>{children}</span>
);

export const VO = {1: 6, 2: 150, 3: 214, 4: 364, 5: 474, 6: 626} as Record<number, number>;
export const T = {wall: 0, prompt: 138, send: 200, demo: 208, meta: 358, proof: 470, cta: 620, total: 740};
const cue = (k: number, start: string, d = 0) => {
  const w = WD[`conv-${k}`].find((x) => x.w.toLowerCase().startsWith(start));
  return VO[k] + Math.round((w ? w.s : d) * 30);
};

const useFonts = () => {
  const [h] = useState(() => delayRender('fonts'));
  useEffect(() => {
    Promise.all(['600 20px Inter', '700 20px Inter', '800 20px Inter', '900 20px Inter'].map((s) => document.fonts.load(s))).then(() => continueRender(h));
  }, [h]);
};

const Bg: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: BG}}>
      <AbsoluteFill style={{background: `radial-gradient(800px 700px at ${25 + Math.sin(f / 90) * 5}% 15%, rgba(91,63,228,0.10), transparent 70%)`}} />
      <AbsoluteFill style={{background: `radial-gradient(800px 800px at ${80 - Math.sin(f / 80) * 5}% 85%, rgba(37,99,235,0.08), transparent 70%)`}} />
    </AbsoluteFill>
  );
};

// titre en deux lignes, révélé ligne à ligne (masque)
const Title: React.FC<{a: React.ReactNode; b: React.ReactNode; at: number; at2?: number; top: number; size?: number; out?: number}> = ({a, b, at, at2, top, size = 104, out = 9999}) => {
  const f = useCurrentFrame();
  const p1 = sp(f - at), p2 = sp(f - (at2 ?? at + 6));
  const o = prog(f, out, 10, INOUT);
  return (
    <div style={{position: 'absolute', left: 60, right: 60, top, textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: size, letterSpacing: '-0.055em', lineHeight: 1.0, color: INK, opacity: 1 - o, transform: `translateY(${-o * 40}px)`}}>
      <div style={{overflow: 'hidden', paddingBottom: 8}}><div style={{transform: `translateY(${(1 - p1) * 110}%)`}}>{a}</div></div>
      <div style={{overflow: 'hidden', paddingBottom: 12}}><div style={{transform: `translateY(${(1 - p2) * 110}%)`}}>{b}</div></div>
    </div>
  );
};

// ---------- A. le mur de pubs ----------
const TILE_W = 300, TILE_H = 533, TGAP = 28;
const Wall: React.FC = () => {
  const f = useCurrentFrame();
  const dive = prog(f, T.prompt - 26, 30, INOUT);
  const items = [...C.wall.slice(0, 5), 'brand', ...C.wall.slice(5)];
  const cols = 4;
  const drift = f * 1.3;
  const sans = [cue(1, 'sans', 1.88), cue(1, 'sans', 1.88) + 26, cue(1, 'sans', 1.88) + 55];
  const sansT = ['Sans tournage', 'Sans acteur', 'Sans monteur'];
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <Bg />
      <div style={{position: 'absolute', left: 540, top: 1000, perspective: 1800, transform: `scale(${1 + dive * 2.6})`, opacity: 1 - prog(f, T.prompt - 6, 10)}}>
        <div style={{position: 'absolute', left: -(cols * (TILE_W + TGAP)) / 2, top: -900 - drift, width: cols * (TILE_W + TGAP), display: 'grid', gridTemplateColumns: `repeat(${cols}, ${TILE_W}px)`, gap: TGAP, transform: `rotateX(${32 - dive * 32}deg) rotateZ(${-14 + dive * 14}deg)`, transformOrigin: '50% 60%'}}>
          {items.map((src, i) => {
            const p = sp(f - 2 - (i % 4) * 3 - Math.floor(i / 4) * 2, 16);
            return (
              <div key={i} style={{width: TILE_W, height: TILE_H, borderRadius: 30, overflow: 'hidden', background: src === 'brand' ? GRAD : '#000', boxShadow: '0 40px 60px -30px rgba(10,10,18,0.5)', transform: `translateY(${(1 - p) * 120 + (i % 2) * 90}px)`, opacity: p, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                {src === 'brand' ? (
                  <div style={{width: 130, height: 130, borderRadius: 36, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center'}}><LogoMark size={86} /></div>
                ) : (
                  <OffthreadVideo muted src={staticFile(src)} startFrom={30 + i * 7} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                )}
              </div>
            );
          })}
        </div>
      </div>
      {/* voile clair pour lire le titre */}
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 900px 620px at 50% 46%, rgba(247,246,243,0.96) 0%, rgba(247,246,243,0.88) 45%, rgba(247,246,243,0) 80%)', opacity: 1 - dive}} />
      <Title a="Des pubs vidéo" b={<G>qui vendent.</G>} at={cue(1, 'des', 0.08) - 2} at2={cue(1, 'vendent', 1.2) - 4} top={640} size={136} out={T.prompt - 26} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 1010, display: 'flex', justifyContent: 'center', gap: 14, opacity: 1 - dive}}>
        {sansT.map((s, i) => {
          const p = sp(f - sans[i], 13);
          return <div key={s} style={{padding: '18px 26px', borderRadius: 99, background: '#fff', border: `1px solid ${LINE}`, boxShadow: SHADOW, fontFamily: FONT, fontWeight: 800, fontSize: 32, color: INK, transform: `translateY(${(1 - p) * 40}px) scale(${0.9 + 0.1 * p})`, opacity: p, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 10}}><span style={{color: '#DC2626', fontSize: 28}}>✕</span>{s}</div>;
        })}
      </div>
    </AbsoluteFill>
  );
};

// ---------- B. une phrase ----------
const Prompt: React.FC = () => {
  const f = useCurrentFrame(); // absolu
  const inP = sp(f - T.prompt, 16);
  const n = Math.round(interpolate(f, [T.prompt + 14, T.send - 6], [0, C.prompt.length], clamp));
  const pressed = f >= T.send && f < T.send + 5;
  const out = prog(f, T.demo, 12, INOUT);
  const ripple = prog(f, T.send, 16);
  return (
    <AbsoluteFill>
      <Bg />
      <Title a="Tout part" b={<G>d’une phrase.</G>} at={VO[2] - 2} top={420} size={104} out={T.demo - 4} />
      <div style={{position: 'absolute', left: 70, right: 70, top: 760, padding: '38px 40px 30px', borderRadius: 44, background: '#fff', border: `1px solid ${LINE}`, boxShadow: SHADOW, transform: `translateY(${(1 - inP) * 120 - out * 200}px) scale(${(0.92 + 0.08 * inP) * (1 - out * 0.3)})`, opacity: inP * (1 - out)}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 12, fontFamily: FONT, fontWeight: 800, fontSize: 22, letterSpacing: '0.16em', color: '#5B3FE4'}}><LogoMark size={30} />GROWTHITY</div>
        <div style={{marginTop: 18, minHeight: 200, fontFamily: FONT, fontWeight: 700, fontSize: 52, lineHeight: 1.25, letterSpacing: '-0.02em', color: INK}}>
          {C.prompt.slice(0, n)}<span style={{display: 'inline-block', width: 5, height: 56, marginLeft: 6, verticalAlign: 'middle', background: f % 30 < 16 ? '#5B3FE4' : 'transparent'}} />
        </div>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <div style={{display: 'flex', gap: 10}}>
            {['9:16', 'Voix FR', 'Sous-titres'].map((c) => <span key={c} style={{padding: '10px 18px', borderRadius: 99, background: '#F3F2F7', fontFamily: FONT, fontWeight: 700, fontSize: 22, color: SUB}}>{c}</span>)}
          </div>
          <div style={{position: 'relative', width: 90, height: 90}}>
            <div style={{position: 'absolute', inset: 0, borderRadius: 45, border: '3px solid #8B5CF6', transform: `scale(${1 + ripple * 1.6})`, opacity: f >= T.send ? 1 - ripple : 0}} />
            <div style={{width: 90, height: 90, borderRadius: 45, background: GRAD, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${pressed ? 0.88 : 1})`, boxShadow: '0 16px 30px -10px rgba(91,63,228,0.7)'}}>
              <svg width="38" height="38" viewBox="0 0 24 24" fill="none"><path d="M12 19V5M5 12l7-7 7 7" stroke="#fff" strokeWidth={2.8} strokeLinecap="round" strokeLinejoin="round" /></svg>
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- téléphone ----------
const Phone: React.FC<{w: number; children: React.ReactNode}> = ({w, children}) => (
  <div style={{width: w, height: w * (16 / 9), borderRadius: w * 0.12, padding: w * 0.028, background: '#0B0B10', boxShadow: '0 60px 120px -40px rgba(10,10,18,0.6), 0 0 0 1px rgba(255,255,255,0.1) inset', boxSizing: 'border-box'}}>
    <div style={{position: 'relative', width: '100%', height: '100%', borderRadius: w * 0.095, overflow: 'hidden', background: '#000'}}>{children}</div>
  </div>
);
const HeroAd: React.FC<{w: number}> = ({w}) => {
  const f = useCurrentFrame(); // local (dans une Sequence)
  const t = f / 30;
  const caps = C.hero.caps.filter((x) => t >= x.s - 0.03 && t < x.e + 0.35).slice(-3);
  return (
    <>
      <OffthreadVideo muted src={staticFile(C.hero.src)} startFrom={Math.round(C.hero.from * 30)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      <div style={{position: 'absolute', left: w * 0.05, top: w * 0.06, display: 'flex', alignItems: 'center', gap: 8, padding: `${w * 0.015}px ${w * 0.03}px`, borderRadius: 99, background: 'rgba(0,0,0,0.4)', color: '#fff', fontFamily: FONT, fontWeight: 700, fontSize: w * 0.035}}>brulerieardente · Sponsorisé</div>
      <div style={{position: 'absolute', left: 10, right: 10, top: '60%', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 6}}>
        {caps.map((x, i) => <span key={`${x.s}`} style={{fontFamily: FONT, fontWeight: 900, fontSize: w * 0.085, textTransform: 'uppercase', color: '#fff', padding: '0 8px', borderRadius: 10, background: i === caps.length - 1 ? GRAD : 'transparent', textShadow: '0 4px 14px rgba(0,0,0,0.6)'}}>{x.w.replace(/[.,!?…]+$/, '')}</span>)}
      </div>
    </>
  );
};

// ---------- C. démonstration : annotations ----------
const Callout: React.FC<{at: number; x: number; y: number; side: 'l' | 'r'; title: string; children?: React.ReactNode; to: {x: number; y: number}}> = ({at, x, y, side, title, children, to}) => {
  const f = useCurrentFrame();
  const p = sp(f - at, 14);
  const line = prog(f, at, 12);
  const W = 290;
  const ax = side === 'l' ? x + W : x;
  const ay = y + 50;
  return (
    <>
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, pointerEvents: 'none'}}>
        <path d={`M${ax} ${ay} L ${ax + (to.x - ax) * line} ${ay + (to.y - ay) * line}`} stroke="#8B5CF6" strokeWidth={3} strokeDasharray="2 8" strokeLinecap="round" opacity={p} />
        <circle cx={to.x} cy={to.y} r={10 * line} fill="#fff" stroke="#8B5CF6" strokeWidth={4} opacity={line} />
      </svg>
      <div style={{position: 'absolute', left: x, top: y, width: W, padding: '20px 22px', borderRadius: 26, background: '#fff', border: `1px solid ${LINE}`, boxShadow: SHADOW, opacity: p, transform: `translateX(${(1 - p) * (side === 'l' ? -60 : 60)}px) scale(${0.9 + 0.1 * p})`}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 10, fontFamily: FONT, fontWeight: 800, fontSize: 28, color: INK}}>
          <span style={{width: 34, height: 34, borderRadius: 17, background: GRAD, color: '#fff', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>✓</span>{title}
        </div>
        {children && <div style={{marginTop: 14}}>{children}</div>}
      </div>
    </>
  );
};

const Demo: React.FC = () => {
  const f = useCurrentFrame(); // absolu
  const inP = sp(f - T.demo, 16);
  const toMeta = prog(f, T.meta, 22, INOUT);
  const out = prog(f, T.proof - 10, 10, INOUT);
  const PW = 440;
  const px = interpolate(toMeta, [0, 1], [540 - PW / 2, 70]);
  const py = interpolate(toMeta, [0, 1], [500, 470]);
  const ps = interpolate(toMeta, [0, 1], [1, 0.92]);
  const pc = {x: 540, y: 500 + (PW * 16 / 9) / 2};
  const sc = cue(3, 'script', 0.98), ac = cue(3, 'acteur', 2.02), vc = cue(3, 'voix', 3.56), st = cue(3, 'sous', 4.14);
  const callO = 1 - toMeta;
  const pub = cue(4, 'publie', 0.5), opt = cue(4, "l'optimise", 1.86), nuit = cue(4, 'jour', 2.64);
  return (
    <AbsoluteFill style={{opacity: 1 - out}}>
      <Bg />
      <Title a="Growthity" b={<G>crée tout.</G>} at={VO[3] - 2} top={150} size={96} out={T.meta - 6} />
      <Title a="Publiée." b={<G>Optimisée.</G>} at={pub - 4} at2={opt - 4} top={150} size={96} />
      <div style={{position: 'absolute', left: px, top: py, transform: `scale(${inP * ps})`, transformOrigin: 'left top'}}>
        <Phone w={PW}><Sequence from={T.demo} layout="none"><HeroAd w={PW} /></Sequence></Phone>
      </div>
      <div style={{opacity: callO}}>
        <Callout at={sc} x={30} y={560} side="l" title="Script" to={{x: pc.x - PW / 2 + 40, y: 620}}>
          {[0.95, 0.75, 0.85].map((w, i) => <div key={i} style={{height: 10, borderRadius: 5, marginTop: i ? 10 : 0, width: `${w * 100 * prog(f, sc + 4 + i * 4, 10)}%`, background: i === 0 ? '#7C5CFF' : '#DCD7F5'}} />)}
        </Callout>
        <Callout at={ac} x={760} y={700} side="r" title="Acteur réaliste" to={{x: pc.x + 60, y: 820}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
            <Img src={staticFile('media/chat/actors/romane.jpg')} style={{width: 64, height: 64, borderRadius: 32, objectFit: 'cover', objectPosition: '50% 25%'}} />
            <span style={{fontFamily: FONT, fontWeight: 700, fontSize: 24, color: SUB}}>Romane · lifestyle</span>
          </div>
        </Callout>
        <Callout at={vc} x={30} y={1000} side="l" title="Voix française" to={{x: pc.x - PW / 2 + 30, y: 1060}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 4, height: 40}}>
            {Array.from({length: 20}, (_, i) => <div key={i} style={{width: 6, borderRadius: 3, background: '#7C5CFF', height: 6 + Math.abs(Math.sin(f / 3 + i * 0.8)) * 32 * prog(f, vc, 8)}} />)}
          </div>
        </Callout>
        <Callout at={st} x={760} y={1140} side="r" title="Sous-titres animés" to={{x: pc.x + 120, y: 1060}} />
      </div>
      {/* D. publiée + optimisée */}
      <MetaPanel pub={pub} opt={opt} nuit={nuit} />
    </AbsoluteFill>
  );
};

const MetaPanel: React.FC<{pub: number; opt: number; nuit: number}> = ({pub, opt, nuit}) => {
  const f = useCurrentFrame();
  const p1 = sp(f - pub + 2, 14), p2 = sp(f - opt + 2, 14);
  const recos = ['Budget augmenté sur la meilleure pub', 'Nouvelle version prête à tester', 'Diffusion ajustée au bon moment'];
  const night = prog(f, nuit, 14, INOUT) > 0.5;
  if (f < pub - 4) return null;
  return (
    <div style={{position: 'absolute', left: 520, right: 50, top: 520}}>
      <div style={{padding: '24px 26px', borderRadius: 30, background: '#fff', border: `1px solid ${LINE}`, boxShadow: SHADOW, transform: `translateX(${(1 - p1) * 120}px)`, opacity: p1}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
          <span style={{width: 50, height: 50, borderRadius: 25, background: '#16A34A', color: '#fff', fontSize: 28, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>✓</span>
          <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 36, color: INK}}>Publiée sur Meta</div>
        </div>
        <div style={{display: 'flex', gap: 10, marginTop: 16}}>
          {[{n: 'Instagram', c: 'linear-gradient(45deg,#F59E0B,#EC4899,#8B5CF6)'}, {n: 'Facebook', c: '#1877F2'}].map((x) => (
            <span key={x.n} style={{display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 99, background: '#F3F2F7', fontFamily: FONT, fontWeight: 700, fontSize: 24, color: INK}}><span style={{width: 16, height: 16, borderRadius: 8, background: x.c}} />{x.n}</span>
          ))}
        </div>
      </div>
      {f >= opt - 4 && (
        <div style={{marginTop: 22, padding: '24px 26px', borderRadius: 30, background: night ? '#0F0D2A' : '#fff', border: `1px solid ${night ? '#2A2560' : LINE}`, boxShadow: SHADOW, transform: `translateX(${(1 - p2) * 120}px)`, opacity: p2}}>
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
            <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 30, color: night ? '#fff' : INK}}>Media buyer IA</div>
            <span style={{padding: '6px 14px', borderRadius: 99, background: night ? '#2A2560' : '#FEF3C7', color: night ? '#C7D2FE' : '#B45309', fontFamily: FONT, fontWeight: 800, fontSize: 20}}>{night ? '☾ Nuit' : '☀ Jour'}</span>
          </div>
          {recos.map((r, i) => {
            const p = sp(f - opt - 4 - i * 6, 13);
            return (
              <div key={r} style={{display: 'flex', alignItems: 'center', gap: 12, marginTop: 14, padding: '14px 16px', borderRadius: 18, background: night ? '#1A1740' : '#F7F6FC', opacity: p, transform: `translateY(${(1 - p) * 20}px)`}}>
                <span style={{width: 34, height: 34, borderRadius: 10, background: GRAD, color: '#fff', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>✓</span>
                <span style={{fontFamily: FONT, fontWeight: 700, fontSize: 24, color: night ? '#fff' : INK, lineHeight: 1.25}}>{r}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ---------- E. preuve : 6 pubs montrées en version virale, puis la grille ----------
const Proof: React.FC = () => {
  const f = useCurrentFrame(); // absolu
  const q = cue(5, 'quel', 2.78);
  const ats = [cue(5, 'café', 0), cue(5, 'garage', 0.66), cue(5, 'resto', 1.3), cue(5, 'friperie', 1.92), q - 8, q + 6];
  const GRID = q + 22;
  const out = prog(f, T.cta - 8, 10, INOUT);
  const cur = ats.reduce((acc, t, i) => (f >= t ? i : acc), -1);
  const W = 620, H = 1102;
  const w = 300, h = 437, gx = 28, gy = 92;
  return (
    <AbsoluteFill style={{opacity: 1 - out}}>
      <Bg />
      {/* une pub à la fois, en grand */}
      {f < GRID + 6 && cur >= 0 && (() => {
        const pr = C.proof[cur];
        const lf = f - ats[cur];
        const pin = sp(lf, 12, 0.6);
        const punch = 1.14 - 0.14 * prog(lf, 0, 8);
        const flash = interpolate(lf, [0, 1, 5], [0, 0.7, 0], clamp);
        const toGrid = prog(f, GRID - 2, 8, INOUT);
        return (
          <div style={{position: 'absolute', left: 540 - W / 2, top: 340, width: W, height: H, borderRadius: 40, overflow: 'hidden', background: '#000', boxShadow: SHADOW, transform: `translateY(${(1 - pin) * 260}px) rotate(${(1 - pin) * (cur % 2 ? 4 : -4)}deg) scale(${1 - toGrid * 0.4})`, opacity: 1 - toGrid}}>
            <Sequence from={ats[cur]} layout="none">
              <OffthreadVideo muted src={staticFile(pr.src)} startFrom={Math.round(pr.from * 30)} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${punch})`}} />
            </Sequence>
            <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0.35) 0%, transparent 30%)'}} />
            <div style={{position: 'absolute', left: 30, right: 30, top: 120, textAlign: 'center'}}>
              {pr.hook.map((line, li) => {
                const pl = sp(lf - 2 - li * 3, 10, 0.5);
                return (
                  <div key={li} style={{fontFamily: FONT, fontWeight: 900, fontSize: 64, lineHeight: 1.05, letterSpacing: '-0.01em', color: '#fff', WebkitTextStroke: '3px #000', paintOrder: 'stroke fill', textShadow: '0 6px 0 #000', transform: `scale(${0.7 + 0.3 * pl})`, opacity: Math.min(1, pl * 2)}}>
                    {line.split(' ').map((wd, wi) => <span key={wi} style={{color: wd.replace(/[^A-ZÀ-Ü’]/g, '') === pr.key ? '#FFE14D' : '#fff'}}>{wd}{' '}</span>)}
                  </div>
                );
              })}
            </div>
            <div style={{position: 'absolute', left: 26, bottom: 30, display: 'flex', alignItems: 'center', gap: 10, padding: '10px 20px 10px 12px', borderRadius: 99, background: 'rgba(255,255,255,0.94)', fontFamily: FONT, fontWeight: 800, fontSize: 26, color: INK}}><LogoMark size={28} />Faite avec Growthity</div>
            <div style={{position: 'absolute', right: 26, bottom: 30, padding: '10px 22px', borderRadius: 99, background: INK, color: '#fff', fontFamily: FONT, fontWeight: 800, fontSize: 28}}>{pr.l}</div>
            <AbsoluteFill style={{background: '#fff', opacity: flash}} />
          </div>
        );
      })()}
      {/* la grille finale */}
      {f >= GRID - 2 && (
        <>
          <Title a="Quel que soit" b={<G>ton business.</G>} at={GRID - 2} top={150} size={96} />
          <div style={{position: 'absolute', left: (1080 - (3 * w + 2 * gx)) / 2, top: 420, display: 'grid', gridTemplateColumns: `repeat(3, ${w}px)`, columnGap: gx, rowGap: gy}}>
            {C.proof.map((pr, i) => {
              const p = sp(f - GRID - i * 2, 13);
              return (
                <div key={pr.l} style={{position: 'relative', width: w, height: h, opacity: Math.min(1, p * 1.5), transform: `scale(${0.6 + 0.4 * p})`}}>
                  <div style={{width: '100%', height: '100%', borderRadius: 28, overflow: 'hidden', background: '#000', boxShadow: SHADOW}}>
                    <Sequence from={GRID} layout="none"><OffthreadVideo muted src={staticFile(pr.src)} startFrom={Math.round((pr.from + 1) * 30)} style={{width: '100%', height: '100%', objectFit: 'cover'}} /></Sequence>
                  </div>
                  <div style={{position: 'absolute', left: 0, right: 0, bottom: -60, display: 'flex', justifyContent: 'center'}}>
                    <span style={{padding: '10px 22px', borderRadius: 99, background: '#fff', border: `1px solid ${LINE}`, boxShadow: SHADOW, fontFamily: FONT, fontWeight: 800, fontSize: 28, color: INK}}>{pr.l}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </AbsoluteFill>
  );
};

// ---------- F. appel à l'action ----------
const Cta: React.FC = () => {
  const f = useCurrentFrame(); // local
  const w6 = WD['conv-6'];
  const cr = VO[6] - T.cta + Math.round((w6.find((w) => w.w.toLowerCase().startsWith('crée'))?.s ?? 1.08) * 30);
  const logo = sp(f - 2);
  const btn = sp(f - cr - 18, 13);
  return (
    <AbsoluteFill>
      <Bg />
      <div style={{position: 'absolute', left: 540, top: 430, transform: `translate(-50%,-50%) scale(${logo})`, display: 'flex', alignItems: 'center', gap: 20}}>
        <div style={{width: 112, height: 112, borderRadius: 32, background: '#fff', border: `1px solid ${LINE}`, boxShadow: SHADOW, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><LogoMark size={74} draw={prog(f, 2, 18)} /></div>
        <Wordmark size={76} />
      </div>
      <Title a="Crée ta première" b={<G>pub vidéo aujourd’hui.</G>} at={cr - 2} top={640} size={92} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 1000, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 26, opacity: Math.min(1, btn * 1.4), transform: `translateY(${(1 - btn) * 40}px)`}}>
        <div style={{position: 'relative'}}>
          <div style={{position: 'absolute', inset: -14, borderRadius: 99, background: GRAD, filter: 'blur(24px)', opacity: 0.55 + 0.2 * Math.sin(f / 6)}} />
          <div style={{position: 'relative', padding: '34px 78px', borderRadius: 99, background: INK, color: '#fff', fontFamily: FONT, fontWeight: 900, fontSize: 48}}>Commencer →</div>
        </div>
        <div style={{fontFamily: FONT, fontWeight: 700, fontSize: 30, color: SUB}}>growthity.ai</div>
      </div>
    </AbsoluteFill>
  );
};

export const Conversion: React.FC = () => {
  useFonts();
  const f = useCurrentFrame();
  const flash = (at: number, k: number) => interpolate(f, [at - 2, at, at + 6], [0, k, 0], clamp);
  return (
    <AbsoluteFill style={{background: BG, fontFamily: FONT}}>
      {f < T.prompt + 4 && <Wall />}
      {f >= T.prompt - 2 && f < T.demo + 14 && <Prompt />}
      {f >= T.demo && f < T.proof + 2 && <Demo />}
      {f >= T.proof - 2 && f < T.cta + 2 && <Proof />}
      <Sequence from={T.cta}><Cta /></Sequence>
      <AbsoluteFill style={{background: '#fff', opacity: Math.max(flash(T.prompt, 0.6), flash(T.demo, 0.5), flash(T.proof, 0.5)), pointerEvents: 'none'}} />
      <Audio src={staticFile('conv/bed.wav')} />
      {[1, 2, 3, 4, 5, 6].map((k) => (
        <Sequence key={k} from={VO[k]}><Audio src={staticFile(`voice/conv-${k}-n.mp3`)} /></Sequence>
      ))}
    </AbsoluteFill>
  );
};
