// « Tout. Au même endroit. » — pub Growthity 100 % motion design (9:16, ~33 s).
// Récit : chaos d'outils et de prestataires (sombre) → tout est aspiré dans le logo → monde clair en 4 chapitres
// (01 Créer : les IA réunies · 02 Remplacer : l'équipe · 03 Diffuser : toutes les plateformes · 04 Piloter : media buyer IA + WhatsApp)
// → final « Tout. Au même endroit. » + « Commencer ». Aucun chiffre de résultat. Zones mortes : rien d'essentiel sous y = 1440.
import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Audio, Img, Sequence, continueRender, delayRender, interpolate, random, spring, staticFile, useCurrentFrame} from 'remotion';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/inter/800.css';
import '@fontsource/space-grotesk/500.css';
import '@fontsource/space-grotesk/600.css';
import '@fontsource/space-grotesk/700.css';
import {LogoMark, Wordmark} from '../components/UI';
import {EXPO, INOUT, prog} from '../components/anim';
import WORDS from './words.json';

type Word = {w: string; s: number; e: number};
const WD = WORDS as Record<string, Word[]>;

const INK = '#0B0A1F';
const MUTED = '#8A87A0';
const LINE = '#E6E4F0';
const BG = '#F6F5FB';
const GRAD = 'linear-gradient(120deg, #2563EB 0%, #5B3FE4 52%, #9333EA 100%)';
const DISPLAY = '"Space Grotesk", Inter, sans-serif';
const FONT = 'Inter, system-ui, sans-serif';
const SHADOW = '0 1px 0 rgba(11,10,31,0.04), 0 2px 6px rgba(11,10,31,0.04), 0 50px 100px -40px rgba(46,32,140,0.35)';
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// départs des voix (frames)
export const VO = {1: 8, 2: 152, 3: 236, 4: 404, 5: 556, 6: 732, 7: 936} as Record<number, number>;
export const SC = {chaos: 0, collapse: 150, reveal: 206, ch1: 226, ch2: 398, ch3: 550, ch4: 726, fin: 926, total: 1084};
const cue = (k: number, start: string, dflt = 0) => {
  const w = WD[`aio-${k}`].find((x) => x.w.toLowerCase().startsWith(start));
  return VO[k] + Math.round((w ? w.s : dflt) * 30);
};

const sp = (f: number, d = 14, m = 0.8) => spring({frame: f, fps: 30, config: {damping: d, mass: m, stiffness: 140}});
const G: React.FC<{children: React.ReactNode}> = ({children}) => (
  <span style={{backgroundImage: GRAD, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent'}}>{children}</span>
);

const useFonts = () => {
  const [h] = useState(() => delayRender('fonts'));
  useEffect(() => {
    Promise.all(['500 20px Inter', '600 20px Inter', '700 20px Inter', '800 20px Inter', '500 20px "Space Grotesk"', '600 20px "Space Grotesk"', '700 20px "Space Grotesk"'].map((s) => document.fonts.load(s))).then(() => continueRender(h));
  }, [h]);
};

// ============ fonds ============
const DarkBg: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: '#07061A'}}>
      <AbsoluteFill style={{background: `radial-gradient(900px 900px at ${30 + Math.sin(f / 40) * 6}% 30%, rgba(91,63,228,0.35), transparent 65%)`}} />
      <AbsoluteFill style={{background: `radial-gradient(800px 800px at 75% ${75 + Math.cos(f / 50) * 5}%, rgba(147,51,234,0.22), transparent 65%)`}} />
      <AbsoluteFill style={{backgroundImage: 'linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)', backgroundSize: '60px 60px'}} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,0.7) 100%)'}} />
    </AbsoluteFill>
  );
};

const LightBg: React.FC = () => {
  const f = useCurrentFrame();
  const a = Math.sin(f / 80) * 6;
  const b = Math.cos(f / 95) * 7;
  return (
    <AbsoluteFill style={{background: BG}}>
      <AbsoluteFill style={{background: `radial-gradient(720px 640px at ${18 + a}% ${18 + b}%, rgba(99,102,241,0.20), transparent 70%)`}} />
      <AbsoluteFill style={{background: `radial-gradient(780px 720px at ${84 - a}% ${70 - b}%, rgba(168,85,247,0.16), transparent 70%)`}} />
      <AbsoluteFill style={{background: `radial-gradient(600px 520px at ${68 + b}% ${22 + a}%, rgba(56,189,248,0.12), transparent 70%)`}} />
      <AbsoluteFill style={{backgroundImage: 'radial-gradient(rgba(11,10,31,0.09) 1.4px, transparent 1.6px)', backgroundSize: '36px 36px', maskImage: 'radial-gradient(ellipse at 50% 42%, black 25%, transparent 78%)', WebkitMaskImage: 'radial-gradient(ellipse at 50% 42%, black 25%, transparent 78%)'}} />
    </AbsoluteFill>
  );
};

// ============ 0. le chaos ============
const TOOLS = [
  {l: 'Monteur vidéo', i: '✂', k: 'monteur'},
  {l: 'Agence', i: '◆', k: 'agence'},
  {l: 'Media buyer', i: '◎', k: 'buyer'},
  {l: 'Banque d’images', i: '▣'},
  {l: 'Tableur', i: '▦'},
  {l: 'Planning', i: '◷'},
  {l: 'Rédacteur', i: '✎'},
  {l: 'Studio photo', i: '◉'},
  {l: 'Casting', i: '☺'},
  {l: 'Sous-titres', i: '≡'},
  {l: 'Rapports', i: '▤'},
  {l: 'Freelance', i: '✦'},
  {l: 'Messagerie', i: '✉'},
  {l: 'Musique', i: '♪'},
];
const toolPos = (i: number) => {
  // positions réparties dans la zone utile (y 260 → 1400)
  const cols = [150, 420, 700, 930];
  const x = cols[i % 4] + (random(`x${i}`) - 0.5) * 120;
  const y = 300 + Math.floor(i / 4) * 300 + (random(`y${i}`) - 0.5) * 140 + (i % 2) * 60;
  return {x, y};
};

const Chaos: React.FC = () => {
  const f = useCurrentFrame();
  const coll = prog(f, SC.collapse + 10, 46, (t) => t * t * t); // aspiration accélérée
  const cx = 540, cy = 860;
  const outils = cue(1, 'outils', 3.6);
  const heads = [
    {t: 'Un monteur.', a: cue(1, 'monteur', 0.1) - 4},
    {t: 'Une agence.', a: cue(1, 'agence', 1.1) - 4},
    {t: 'Un media buyer…', a: cue(1, 'média', 2.1) - 4},
    {t: 'Et des outils partout.', a: outils - 8},
  ];
  const hi = heads.reduce((acc, h, i) => (f >= h.a ? i : acc), -1);
  const pts = TOOLS.map((t, i) => {
    const p = toolPos(i);
    const keyed = t.k ? cue(1, t.k === 'buyer' ? 'média' : t.k, 1) - 4 : 2 + i * 5;
    const appear = keyed;
    const dx = Math.sin(f / (30 + i * 3) + i) * 14;
    const dy = Math.cos(f / (36 + i * 2) + i) * 12;
    // spirale vers le centre
    const ang0 = Math.atan2(p.y - cy, p.x - cx);
    const r0 = Math.hypot(p.x - cx, p.y - cy);
    const ang = ang0 + coll * 2.4;
    const r = r0 * (1 - coll);
    const x = cx + Math.cos(ang) * r + dx * (1 - coll);
    const y = cy + Math.sin(ang) * r + dy * (1 - coll);
    return {x, y, appear, t, i};
  });
  const q2 = prog(f, VO[2] - 2, 14);
  const shake = f > outils - 2 && f < outils + 16 ? Math.sin(f * 2.1) * 6 * (1 - (f - outils + 2) / 18) : 0;
  return (
    <AbsoluteFill style={{transform: `translate(${shake}px, ${shake * 0.6}px) scale(${1 + 0.05 * prog(f, 0, 150, (t) => t)})`}}>
      <DarkBg />
      {/* fils emmêlés */}
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, opacity: 1 - coll}}>
        <defs>
          <linearGradient id="wire" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#6366F1" /><stop offset="1" stopColor="#C084FC" /></linearGradient>
        </defs>
        {pts.map((a, i) =>
          pts.slice(i + 1).filter((_, j) => (i + j) % 3 === 0).map((b, j) => {
            const o = Math.min(prog(f, a.appear + 4, 10), prog(f, b.appear + 4, 10));
            const mx = (a.x + b.x) / 2 + Math.sin(i * 7 + j) * 120;
            const my = (a.y + b.y) / 2 + Math.cos(i * 3 + j) * 120;
            return <path key={`${i}-${j}`} d={`M${a.x} ${a.y} Q${mx} ${my} ${b.x} ${b.y}`} stroke="url(#wire)" strokeWidth={2} fill="none" opacity={o * 0.35} strokeDasharray="6 8" strokeDashoffset={-f * 1.5} />;
          })
        )}
      </svg>
      {pts.map(({x, y, appear, t, i}) => {
        const p = sp(f - appear, 12);
        const isHi = t.k && heads.findIndex((h) => h.t.toLowerCase().includes(t.k === 'buyer' ? 'buyer' : t.k)) === hi;
        const ping = ((f - appear) % 50 < 18 && f > appear + 10) || (f > outils && f < outils + 30);
        return (
          <div key={i} style={{position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) scale(${p * (1 - coll * 0.85)}) rotate(${(random(`r${i}`) - 0.5) * 8 + coll * 90}deg)`, opacity: p * (1 - prog(f, SC.collapse + 50, 8))}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 12, padding: '16px 22px 16px 16px', borderRadius: 22, background: isHi ? 'rgba(255,255,255,0.96)' : 'rgba(255,255,255,0.07)', border: `1px solid ${isHi ? '#fff' : 'rgba(255,255,255,0.16)'}`, backdropFilter: 'blur(8px)', boxShadow: isHi ? '0 0 60px rgba(139,92,246,0.7)' : '0 20px 40px -20px rgba(0,0,0,0.8)', whiteSpace: 'nowrap'}}>
              <span style={{width: 44, height: 44, borderRadius: 13, background: isHi ? GRAD : 'rgba(255,255,255,0.1)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24}}>{t.i}</span>
              <span style={{fontFamily: FONT, fontWeight: 700, fontSize: 27, color: isHi ? INK : 'rgba(255,255,255,0.86)'}}>{t.l}</span>
              {ping && !isHi && <span style={{position: 'absolute', right: -8, top: -8, width: 26, height: 26, borderRadius: 13, background: '#F43F5E', boxShadow: '0 0 0 4px #07061A', transform: `scale(${sp(f - appear - 10 - Math.floor((f - appear - 10) / 50) * 50, 9)})`}} />}
            </div>
          </div>
        );
      })}
      {/* titres du chaos */}
      {heads.map((h, i) => {
        const on = i === hi && f < VO[2] - 2;
        const p = sp(f - h.a, 15);
        return on ? (
          <div key={i} style={{position: 'absolute', left: 0, right: 0, top: 120, textAlign: 'center', fontFamily: DISPLAY, fontWeight: 700, fontSize: 84, letterSpacing: '-0.04em', color: '#fff', opacity: Math.min(1, p * 1.5), transform: `translateY(${(1 - p) * 30}px)`, textShadow: '0 10px 40px rgba(0,0,0,0.6)'}}>{h.t}</div>
        ) : null;
      })}
      <div style={{position: 'absolute', left: 60, right: 60, top: 120, textAlign: 'center', fontFamily: DISPLAY, fontWeight: 700, fontSize: 84, lineHeight: 1.04, letterSpacing: '-0.04em', color: '#fff', opacity: q2 * (1 - prog(f, SC.reveal - 6, 8)), transform: `translateY(${(1 - q2) * 30}px)`}}>
        Et si tout tenait<br /><span style={{backgroundImage: 'linear-gradient(100deg,#8FA6FF,#A78BFF 45%,#E39BFF)', WebkitBackgroundClip: 'text', color: 'transparent'}}>au même endroit ?</span>
      </div>
      {/* singularité */}
      <Singularity />
    </AbsoluteFill>
  );
};

const Singularity: React.FC = () => {
  const f = useCurrentFrame();
  const g = prog(f, SC.collapse + 30, 30, EXPO);
  const logo = sp(f - (SC.collapse + 46), 12);
  return (
    <>
      <div style={{position: 'absolute', left: 540, top: 860, width: 10, height: 10, transform: `translate(-50%,-50%) scale(${g * 60})`, borderRadius: '50%', background: 'radial-gradient(circle, rgba(167,139,250,0.9), rgba(91,63,228,0.4) 40%, transparent 70%)', opacity: g * (1 - prog(f, SC.reveal, 10))}} />
      {f > SC.collapse + 44 && (
        <div style={{position: 'absolute', left: 540, top: 860, transform: `translate(-50%,-50%) scale(${logo})`}}>
          <div style={{width: 210, height: 210, borderRadius: 60, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 120px rgba(139,92,246,0.9)'}}><LogoMark size={140} draw={prog(f, SC.collapse + 46, 14)} /></div>
        </div>
      )}
    </>
  );
};

// ============ révélation (cercle blanc) ============
const Reveal: React.FC = () => {
  const f = useCurrentFrame(); // local depuis SC.reveal
  const r = interpolate(f, [0, 18], [0, 2300], {...clamp, easing: INOUT});
  return (
    <AbsoluteFill style={{clipPath: `circle(${r}px at 540px 860px)`}}>
      <LightBg />
    </AbsoluteFill>
  );
};

// ============ habillage des chapitres ============
const CHAPTERS = ['Créer', 'Remplacer', 'Diffuser', 'Piloter'];
const ChapterRail: React.FC = () => {
  const f = useCurrentFrame();
  const starts = [SC.ch1, SC.ch2, SC.ch3, SC.ch4];
  const idx = starts.reduce((a, s, i) => (f >= s ? i : a), 0);
  const o = prog(f, SC.ch1, 14) * (1 - prog(f, SC.fin, 12));
  const local = f - starts[idx];
  return (
    <div style={{position: 'absolute', left: 80, right: 80, top: 150, display: 'flex', alignItems: 'center', justifyContent: 'space-between', opacity: o}}>
      <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 24, letterSpacing: '0.18em', color: '#5B3FE4', overflow: 'hidden', height: 32}}>
        <div style={{transform: `translateY(${(1 - sp(local, 14)) * 32}px)`}}>0{idx + 1} — {CHAPTERS[idx].toUpperCase()}</div>
      </div>
      <div style={{display: 'flex', gap: 10}}>
        {CHAPTERS.map((_, i) => (
          <div key={i} style={{width: i === idx ? 54 : 14, height: 14, borderRadius: 7, background: i <= idx ? GRAD : '#DCD9EA', transition: 'none'}} />
        ))}
      </div>
    </div>
  );
};

// balayage diagonal entre chapitres
const Sweep: React.FC<{at: number}> = ({at}) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [at - 8, at + 8], [-1, 1], clamp);
  if (p <= -1 || p >= 1) return null;
  return <div style={{position: 'absolute', left: -600, top: -400, width: 2300, height: 2800, transform: `rotate(-24deg) translateX(${p * 1700}px)`, background: 'linear-gradient(90deg, transparent 0%, rgba(99,102,241,0.0) 30%, rgba(139,92,246,0.55) 48%, rgba(255,255,255,0.9) 50%, rgba(139,92,246,0.55) 52%, transparent 70%)', mixBlendMode: 'screen', pointerEvents: 'none'}} />;
};

// enveloppe d'entrée/sortie d'une scène
const useScene = (start: number, end: number) => {
  const f = useCurrentFrame();
  const i = prog(f, start, 18, EXPO);
  const o = prog(f, end - 12, 12, INOUT);
  const push = 1 + 0.035 * interpolate(f, [start, end], [0, 1], clamp);
  return {f, style: {opacity: i * (1 - o), transform: `translateY(${(1 - i) * 90 - o * 110}px) scale(${push})`, filter: `blur(${(1 - i) * 10 + o * 10}px)`} as React.CSSProperties};
};

const Headline: React.FC<{a: string; b: string; at: number; size?: number; top?: number}> = ({a, b, at, size = 104, top = 230}) => {
  const f = useCurrentFrame();
  const p1 = sp(f - at, 15);
  const p2 = sp(f - at - 6, 15);
  return (
    <div style={{position: 'absolute', left: 70, right: 70, top, fontFamily: DISPLAY, fontWeight: 700, fontSize: size, letterSpacing: '-0.045em', lineHeight: 1.02, color: INK}}>
      <div style={{overflow: 'hidden', paddingBottom: 6}}><div style={{transform: `translateY(${(1 - p1) * 110}%)`}}>{a}</div></div>
      <div style={{overflow: 'hidden', paddingBottom: 10}}><div style={{transform: `translateY(${(1 - p2) * 110}%)`}}><G>{b}</G></div></div>
    </div>
  );
};

// ============ 01 Créer : les IA réunies ============
const AIS = ['IA vidéo', 'IA voix', 'IA image', 'IA texte', 'IA montage', 'IA analyse'];
const AI_ICONS = ['▶', '◖', '▣', '¶', '✂', '◔'];
const Ch1: React.FC = () => {
  const {f, style} = useScene(SC.ch1, SC.ch2);
  const cx = 540, cy = 830;
  const ia = cue(3, 'ia', 1.66);
  const outs = [
    {k: 'script', l: 'Script'},
    {k: 'voix', l: 'Voix'},
    {k: 'acteurs', l: 'Acteurs'},
    {k: 'montage', l: 'Montage'},
  ];
  const hub = sp(f - SC.ch1 + 4, 12);
  return (
    <AbsoluteFill style={style}>
      <Headline a="Les meilleures IA." b="Réunies." at={SC.ch1 + 6} />
      {/* orbites */}
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        {[1, 0.68].map((k, i) => (
          <ellipse key={i} cx={cx} cy={cy} rx={400 * k} ry={170 * k} fill="none" stroke="#CFC8F3" strokeWidth={2} strokeDasharray="4 10" strokeDashoffset={f * (i ? -1 : 1)} opacity={prog(f, SC.ch1 + 6 + i * 4, 16)} />
        ))}
      </svg>
      {AIS.map((n, i) => {
        const ring = i % 2 ? 0.68 : 1;
        const base = (i / AIS.length) * Math.PI * 2;
        const lockP = prog(f, ia, 22, INOUT);
        const ang = base + (f - SC.ch1) / 46;
        const x = cx + Math.cos(ang) * 400 * ring;
        const y = cy + Math.sin(ang) * 170 * ring;
        const depth = (Math.sin(ang) + 1) / 2; // 0 derrière, 1 devant
        const p = sp(f - SC.ch1 - 10 - i * 3, 12);
        // à « IA » : flash de connexion vers le centre
        const beam = prog(f, ia + i * 2, 10) * (1 - prog(f, ia + 18 + i * 2, 12));
        return (
          <React.Fragment key={n}>
            <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, opacity: beam}}>
              <line x1={x} y1={y} x2={cx} y2={cy} stroke="url(#beam)" strokeWidth={4} strokeLinecap="round" />
              <defs><linearGradient id="beam" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#60A5FA" /><stop offset="1" stopColor="#A855F7" /></linearGradient></defs>
            </svg>
            <div style={{position: 'absolute', left: x, top: y, zIndex: Math.round(depth * 10), transform: `translate(-50%,-50%) scale(${p * (0.82 + depth * 0.22) * (1 + 0.08 * beam)})`, opacity: 0.55 + depth * 0.45 + lockP * 0}}>
              <div style={{display: 'flex', alignItems: 'center', gap: 10, padding: '12px 22px 12px 12px', borderRadius: 99, background: '#fff', border: `1px solid ${LINE}`, boxShadow: beam > 0.2 ? '0 0 0 3px #A78BFA, 0 20px 40px -18px rgba(91,63,228,0.6)' : '0 20px 40px -24px rgba(46,32,140,0.45)', whiteSpace: 'nowrap'}}>
                <span style={{width: 42, height: 42, borderRadius: 21, background: GRAD, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20}}>{AI_ICONS[i]}</span>
                <span style={{fontFamily: FONT, fontWeight: 700, fontSize: 26, color: INK}}>{n}</span>
              </div>
            </div>
          </React.Fragment>
        );
      })}
      {/* noyau */}
      <div style={{position: 'absolute', left: cx, top: cy, zIndex: 5, transform: `translate(-50%,-50%) scale(${hub * (1 + 0.06 * prog(f, ia, 6) * (1 - prog(f, ia + 6, 10)))})`}}>
        <div style={{width: 168, height: 168, borderRadius: 48, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 ${60 + 60 * prog(f, ia, 10)}px rgba(139,92,246,0.55), ${SHADOW}`, border: `1px solid ${LINE}`}}><LogoMark size={104} /></div>
      </div>
      {/* ce qui en sort */}
      <div style={{position: 'absolute', left: 70, right: 70, top: 1130, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16}}>
        {outs.map((o, i) => {
          const a = cue(3, o.k, 2.3 + i * 0.6) - 2;
          const p = sp(f - a, 12);
          return (
            <div key={o.k} style={{height: 250, borderRadius: 28, background: '#fff', border: `1px solid ${LINE}`, boxShadow: SHADOW, padding: 18, boxSizing: 'border-box', opacity: Math.min(1, p * 1.4), transform: `translateY(${(1 - p) * -120}px) scale(${0.7 + 0.3 * p})`, display: 'flex', flexDirection: 'column'}}>
              <div style={{flex: 1, borderRadius: 16, background: '#F4F2FC', position: 'relative', overflow: 'hidden'}}><OutViz k={o.k} t={f - a} /></div>
              <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12}}>
                <span style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 28, color: INK}}>{o.l}</span>
                <span style={{width: 30, height: 30, borderRadius: 15, background: '#16A34A', color: '#fff', fontSize: 17, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${sp(f - a - 8, 9)})`}}>✓</span>
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const OutViz: React.FC<{k: string; t: number}> = ({k, t}) => {
  if (k === 'script') return (
    <div style={{padding: 14}}>{[0.9, 0.7, 0.85, 0.5].map((w, i) => <div key={i} style={{height: 9, borderRadius: 5, marginTop: i ? 10 : 4, width: `${w * 100 * prog(t, 4 + i * 4, 10)}%`, background: i === 0 ? '#6D4CF0' : '#CFC8F3'}} />)}</div>
  );
  if (k === 'voix') return (
    <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4}}>
      {Array.from({length: 13}, (_, i) => <div key={i} style={{width: 5, borderRadius: 3, background: '#6D4CF0', height: 8 + Math.abs(Math.sin(t / 3 + i * 0.9)) * 46 * prog(t, 2, 10)}} />)}
    </div>
  );
  if (k === 'acteurs') return (
    <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      {[0, 1, 2].map((i) => (
        <div key={i} style={{width: 54, height: 54, borderRadius: 27, marginLeft: i ? -14 : 0, border: '3px solid #fff', background: ['linear-gradient(135deg,#FBCFE8,#C084FC)', 'linear-gradient(135deg,#BAE6FD,#818CF8)', 'linear-gradient(135deg,#FDE68A,#F472B6)'][i], transform: `scale(${sp(t - 3 - i * 4, 10)})`, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', overflow: 'hidden'}}>
          <div style={{width: 26, height: 26, borderRadius: 13, background: 'rgba(255,255,255,0.85)', marginBottom: -8}} />
        </div>
      ))}
    </div>
  );
  return (
    <div style={{position: 'absolute', left: 12, right: 12, top: '50%', transform: 'translateY(-50%)', display: 'flex', gap: 4}}>
      {[0.3, 0.2, 0.28, 0.22].map((w, i) => <div key={i} style={{flex: w, height: 34, borderRadius: 8, background: i % 2 ? '#C4B5FD' : '#818CF8', transform: `translateY(${(1 - prog(t, 2 + i * 3, 8)) * -30}px)`, opacity: prog(t, 2 + i * 3, 8)}} />)}
    </div>
  );
};

// ============ 02 Remplacer : l'équipe ============
const ROLES = [
  {r: 'Monteur vidéo', i: 'monteur', g: 'monte tes vidéos', k: 'monteur'},
  {r: 'Graphiste', i: 'graphiste', g: 'crée tes visuels', k: 'graphiste'},
  {r: 'Media buyer', i: 'buyer', g: 'pilote tes campagnes', k: 'media'},
  {r: 'Community manager', i: 'cm', g: 'gère tes réseaux', k: 'community'},
];
const Ch2: React.FC = () => {
  const {f, style} = useScene(SC.ch2, SC.ch3);
  return (
    <AbsoluteFill style={style}>
      <Headline a="Toute une équipe." b="Dans un seul onglet." at={SC.ch2 + 6} size={96} />
      <div style={{position: 'absolute', left: 70, right: 70, top: 560, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, perspective: 1600}}>
        {ROLES.map((ro, i) => {
          const flipAt = cue(4, ro.k, 0.6 + i * 1.1);
          const p = sp(f - SC.ch2 - 8 - i * 4, 13);
          const fl = interpolate(f, [flipAt, flipAt + 14], [0, 180], {...clamp, easing: INOUT});
          const back = fl > 90;
          return (
            <div key={ro.r} style={{height: 400, position: 'relative', transform: `translateY(${(1 - p) * 80}px) rotateY(${back ? fl - 180 : fl}deg) scale(${1 + 0.06 * Math.sin((fl / 180) * Math.PI)})`, opacity: p}}>
              {/* recto : le prestataire */}
              <div style={{position: 'absolute', inset: 0, borderRadius: 34, background: '#fff', border: `1px solid ${LINE}`, boxShadow: SHADOW, padding: 16, boxSizing: 'border-box', display: back ? 'none' : 'flex', flexDirection: 'column', overflow: 'hidden'}}>
                <div style={{height: 250, borderRadius: 24, overflow: 'hidden', background: '#ECE8FB', position: 'relative'}}>
                  <Img src={staticFile(`allinone/roles/${ro.i}.jpg`)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 30%', transform: `scale(${1.04 + 0.04 * Math.sin((f - SC.ch2) / 20 + i)}) translateY(${Math.sin((f - SC.ch2) / 14 + i * 2) * 4}px)`}} />
                </div>
                <div style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 34, color: INK, marginTop: 14, letterSpacing: '-0.02em', lineHeight: 1.05, paddingLeft: 8}}>{ro.r}</div>
                <div style={{display: 'flex', gap: 8, marginTop: 10, paddingLeft: 8}}>
                  {['Devis', 'Délais', 'Relances'].map((t) => <span key={t} style={{padding: '6px 12px', borderRadius: 99, background: '#F4F2F8', color: MUTED, fontFamily: FONT, fontWeight: 700, fontSize: 18}}>{t}</span>)}
                </div>
              </div>
              {/* verso : Growthity */}
              <div style={{position: 'absolute', inset: 0, borderRadius: 34, background: GRAD, boxShadow: '0 40px 80px -30px rgba(91,63,228,0.7)', padding: 30, boxSizing: 'border-box', display: back ? 'flex' : 'none', flexDirection: 'column', overflow: 'hidden'}}>
                <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(circle at 80% 0%, rgba(255,255,255,0.35), transparent 50%)'}} />
                <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
                  <div style={{width: 76, height: 76, borderRadius: 22, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center'}}><LogoMark size={50} /></div>
                  <div style={{width: 76, height: 76, borderRadius: 38, overflow: 'hidden', border: '3px solid rgba(255,255,255,0.8)', filter: 'grayscale(1)', opacity: 0.7}}><Img src={staticFile(`allinone/roles/${ro.i}.jpg`)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 25%'}} /></div>
                </div>
                <div style={{fontFamily: FONT, fontWeight: 700, fontSize: 24, color: 'rgba(255,255,255,0.8)', marginTop: 'auto', textDecoration: 'line-through'}}>{ro.r}</div>
                <div style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 38, color: '#fff', marginTop: 6, letterSpacing: '-0.02em', lineHeight: 1.08}}>Growthity {ro.g}</div>
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ============ 03 Diffuser : toutes les plateformes ============
const PLATS: {n: string; k: string; c: string; g: React.ReactNode}[] = [
  {n: 'Instagram', k: 'instagram', c: 'linear-gradient(45deg,#F59E0B,#EC4899 50%,#8B5CF6)', g: <svg width="58" height="58" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="5" stroke="#fff" strokeWidth="2" /><circle cx="12" cy="12" r="4.2" stroke="#fff" strokeWidth="2" /><circle cx="17.3" cy="6.7" r="1.2" fill="#fff" /></svg>},
  {n: 'Facebook', k: 'facebook', c: '#1877F2', g: <span style={{fontFamily: 'Inter', fontWeight: 800, fontSize: 64, color: '#fff', marginTop: 14}}>f</span>},
  {n: 'TikTok', k: 'tiktok', c: '#0B0A0C', g: <svg width="54" height="54" viewBox="0 0 24 24" fill="none"><path d="M14 3v11.5a3.5 3.5 0 1 1-3-3.46" stroke="#25F4EE" strokeWidth="2.4" strokeLinecap="round" transform="translate(-0.8,0.6)" /><path d="M14 3v11.5a3.5 3.5 0 1 1-3-3.46" stroke="#FE2C55" strokeWidth="2.4" strokeLinecap="round" transform="translate(0.8,-0.6)" /><path d="M14 3v11.5a3.5 3.5 0 1 1-3-3.46M14 3c.4 2.6 2.2 4.4 5 4.6" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" /></svg>},
  {n: 'YouTube', k: 'youtube', c: '#FF0033', g: <svg width="58" height="58" viewBox="0 0 24 24"><path d="M9.5 8.2v7.6l6.4-3.8z" fill="#fff" /></svg>},
  {n: 'LinkedIn', k: 'linkedin', c: '#0A66C2', g: <span style={{fontFamily: 'Inter', fontWeight: 800, fontSize: 46, color: '#fff'}}>in</span>},
];
const Ch3: React.FC = () => {
  const {f, style} = useScene(SC.ch3, SC.ch4);
  const cx = 540, cy = 930;
  const card = sp(f - SC.ch3 - 6, 13);
  return (
    <AbsoluteFill style={style}>
      <Headline a="Partout." b="En un seul clic." at={SC.ch3 + 6} />
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        <defs><linearGradient id="link" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#818CF8" /><stop offset="1" stopColor="#C084FC" /></linearGradient></defs>
        {PLATS.map((pl, i) => {
          const a = cue(5, pl.k, 1.3 + i * 0.7) - 3;
          const ang = -Math.PI / 2 + ((i + 0.5) / PLATS.length) * Math.PI * 2;
          const x = cx + Math.cos(ang) * 380, y = cy + Math.sin(ang) * 400;
          const d = prog(f, a, 12);
          const pkt = ((f - a) % 24) / 24;
          return (
            <g key={pl.n} opacity={d}>
              <line x1={cx} y1={cy} x2={cx + (x - cx) * d} y2={cy + (y - cy) * d} stroke="url(#link)" strokeWidth={3} strokeDasharray="2 10" strokeLinecap="round" />
              {f > a + 12 && <circle cx={cx + (x - cx) * pkt} cy={cy + (y - cy) * pkt} r={7} fill="#7C3AED" />}
            </g>
          );
        })}
      </svg>
      {/* la pub au centre */}
      <div style={{position: 'absolute', left: cx, top: cy, transform: `translate(-50%,-50%) scale(${card})`, zIndex: 3}}>
        <div style={{width: 250, height: 444, borderRadius: 34, background: GRAD, boxShadow: '0 50px 90px -30px rgba(91,63,228,0.7)', position: 'relative', overflow: 'hidden', border: '6px solid #fff'}}>
          <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.45), transparent 55%)'}} />
          <div style={{position: 'absolute', left: 20, right: 20, top: 26, display: 'flex', alignItems: 'center', gap: 8}}>
            <div style={{width: 34, height: 34, borderRadius: 17, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center'}}><LogoMark size={22} /></div>
            <div style={{height: 10, width: 90, borderRadius: 5, background: 'rgba(255,255,255,0.7)'}} />
          </div>
          <div style={{position: 'absolute', left: 0, right: 0, top: 190, display: 'flex', justifyContent: 'center'}}>
            <div style={{width: 76, height: 76, borderRadius: 38, background: 'rgba(255,255,255,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}><svg width="34" height="34" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" fill="#5B3FE4" /></svg></div>
          </div>
          <div style={{position: 'absolute', left: 20, right: 20, bottom: 24, padding: '12px 0', borderRadius: 14, background: '#fff', textAlign: 'center', fontFamily: FONT, fontWeight: 800, fontSize: 20, color: INK}}>Ta pub</div>
        </div>
      </div>
      {PLATS.map((pl, i) => {
        const a = cue(5, pl.k, 1.3 + i * 0.7) - 3;
        const ang = -Math.PI / 2 + ((i + 0.5) / PLATS.length) * Math.PI * 2;
        const x = cx + Math.cos(ang) * 380, y = cy + Math.sin(ang) * 400;
        const p = sp(f - a - 6, 10);
        const ok = f > a + 22;
        return (
          <div key={pl.n} style={{position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) scale(${p})`, display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 4}}>
            <div style={{position: 'relative', width: 128, height: 128, borderRadius: 36, background: pl.c, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 26px 50px -22px rgba(11,10,31,0.6)', border: '5px solid #fff'}}>
              {pl.g}
              {ok && <div style={{position: 'absolute', right: -12, top: -12, width: 44, height: 44, borderRadius: 22, background: '#16A34A', border: '4px solid #fff', color: '#fff', fontWeight: 800, fontSize: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${sp(f - a - 22, 9)})`}}>✓</div>}
            </div>
            <div style={{marginTop: 12, fontFamily: FONT, fontWeight: 700, fontSize: 26, color: INK}}>{pl.n}</div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// ============ 04 Piloter : analyse, conseils, pilotage + WhatsApp ============
const Ch4: React.FC = () => {
  const {f, style} = useScene(SC.ch4, SC.fin);
  const anal = cue(6, 'analyse', 0.14);
  const cons = cue(6, 'conseille', 1.56);
  const pil = cue(6, 'pilote', 2.44);
  const meta = cue(6, 'meta', 3.1);
  const jour = cue(6, 'jour', 3.6);
  const nuit = cue(6, 'nuit', 3.92);
  const wa = cue(6, 'whatsapp', 5.3) - 10;
  const toB = prog(f, pil - 4, 14, INOUT); // analyse → pilotage
  const panel = sp(f - SC.ch4 - 6, 13);
  const draw = prog(f, pil, 40, INOUT);
  const night = prog(f, nuit - 2, 14, INOUT);
  const dark = night > 0.5;
  const metrics = [
    {l: 'Accroche', v: 0.86, t: 'Forte', c: '#16A34A', bg: '#DCFCE7'},
    {l: 'Rétention', v: 0.42, t: 'À améliorer', c: '#D97706', bg: '#FEF3C7'},
    {l: 'Ciblage', v: 0.74, t: 'Bon', c: '#16A34A', bg: '#DCFCE7'},
    {l: 'Coût par résultat', v: 0.58, t: 'En hausse', c: '#DC2626', bg: '#FEE2E2'},
  ];
  const recos = [
    {t: 'Couper la créa B', i: '✂', c: '#F43F5E'},
    {t: 'Monter le budget sur A', i: '↗', c: '#16A34A'},
    {t: 'Nouvelle créa prête', i: '✦', c: '#6D4CF0'},
  ];
  const path = 'M0 190 C 70 180, 110 150, 170 158 S 280 120, 340 110 S 450 96, 520 70 S 640 40, 720 30';
  const advice = sp(f - cons + 2, 12) * (1 - prog(f, wa - 8, 10, INOUT));
  const scan = interpolate(f, [anal, anal + 40], [0, 1], clamp);
  return (
    <AbsoluteFill style={style}>
      <div style={{position: 'absolute', left: 70, right: 70, top: 230, fontFamily: DISPLAY, fontWeight: 700, fontSize: 96, letterSpacing: '-0.045em', lineHeight: 1.02, color: INK}}>
        <div style={{overflow: 'hidden', paddingBottom: 6}}><div style={{transform: `translateY(${(1 - sp(f - SC.ch4 - 6, 15)) * 110}%)`}}>Ton media buyer IA.</div></div>
        <div style={{overflow: 'hidden', paddingBottom: 10, height: 112, position: 'relative'}}>
          <div style={{position: 'absolute', transform: `translateY(${(1 - sp(f - SC.ch4 - 12, 15)) * 110 - toB * 110}%)`}}><G>Analyse et conseille.</G></div>
          <div style={{position: 'absolute', transform: `translateY(${(1 - toB) * 110}%)`}}><G>Pilote jour et nuit.</G></div>
        </div>
      </div>
      <div style={{position: 'absolute', left: 70, right: 70, top: 520, height: 590, borderRadius: 36, background: dark ? '#0F0D2A' : '#fff', border: `1px solid ${dark ? '#2A2560' : LINE}`, boxShadow: SHADOW, padding: 34, boxSizing: 'border-box', opacity: panel, transform: `translateY(${(1 - panel) * 80}px)`, overflow: 'hidden'}}>
        {/* A. analyse de performance */}
        <div style={{position: 'absolute', inset: 34, opacity: 1 - toB, transform: `translateX(${-toB * 120}px)`}}>
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
            <div style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 34, color: INK}}>Analyse de performance</div>
            <div style={{padding: '8px 16px', borderRadius: 99, background: '#EEEBFD', color: '#5B3FE4', fontFamily: FONT, fontWeight: 800, fontSize: 20}}>IA</div>
          </div>
          <div style={{position: 'relative', marginTop: 26, display: 'flex', flexDirection: 'column', gap: 22}}>
            {metrics.map((m, i) => {
              const p = prog(f, anal + 4 + i * 6, 22);
              const tag = sp(f - anal - 16 - i * 6, 11);
              return (
                <div key={m.l}>
                  <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: FONT, fontWeight: 700, fontSize: 27, color: INK}}>
                    {m.l}
                    <span style={{padding: '6px 14px', borderRadius: 99, background: m.bg, color: m.c, fontSize: 20, fontWeight: 800, transform: `scale(${tag})`}}>{m.t}</span>
                  </div>
                  <div style={{marginTop: 10, height: 16, borderRadius: 8, background: '#F1EFF8', overflow: 'hidden'}}><div style={{width: `${m.v * p * 100}%`, height: '100%', borderRadius: 8, background: m.c === '#16A34A' ? GRAD : m.c}} /></div>
                </div>
              );
            })}
            {/* faisceau de scan */}
            <div style={{position: 'absolute', left: -34, right: -34, top: `${scan * 100}%`, height: 4, background: 'linear-gradient(90deg, transparent, #A78BFA, transparent)', boxShadow: '0 0 30px #A78BFA', opacity: scan > 0 && scan < 1 ? 1 : 0}} />
          </div>
        </div>
        {/* B. pilotage */}
        <div style={{position: 'absolute', inset: 34, opacity: toB, transform: `translateX(${(1 - toB) * 120}px)`}}>
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
            <div style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 34, color: dark ? '#fff' : INK}}>Campagnes Meta</div>
            <div style={{display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 99, background: '#DCFCE7', color: '#15803D', fontFamily: FONT, fontWeight: 800, fontSize: 20}}><span style={{width: 10, height: 10, borderRadius: 5, background: '#16A34A', opacity: f % 30 < 18 ? 1 : 0.3}} />En direct</div>
          </div>
          <svg width={800} height={200} viewBox="0 0 720 210" style={{marginTop: 16}}>
            <defs>
              <linearGradient id="area" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#8B5CF6" stopOpacity="0.35" /><stop offset="1" stopColor="#8B5CF6" stopOpacity="0" /></linearGradient>
              <linearGradient id="ln" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#3B82F6" /><stop offset="1" stopColor="#A855F7" /></linearGradient>
              <clipPath id="rev"><rect x="0" y="0" width={720 * draw} height="210" /></clipPath>
            </defs>
            {[50, 100, 150].map((y) => <line key={y} x1="0" x2="720" y1={y} y2={y} stroke={dark ? '#2A2560' : '#EEECF6'} strokeWidth="2" />)}
            <g clipPath="url(#rev)">
              <path d={`${path} L720 210 L0 210 Z`} fill="url(#area)" />
              <path d={path} stroke="url(#ln)" strokeWidth="6" fill="none" strokeLinecap="round" />
            </g>
          </svg>
          <div style={{display: 'flex', flexDirection: 'column', gap: 12, marginTop: 14}}>
            {recos.map((r, i) => {
              const a2 = meta + i * 7;
              const p = sp(f - a2, 12);
              return (
                <div key={r.t} style={{display: 'flex', alignItems: 'center', gap: 14, padding: '13px 18px', borderRadius: 20, background: dark ? '#1A1740' : '#F7F6FC', opacity: Math.min(1, p * 1.4), transform: `translateX(${(1 - p) * 120}px)`}}>
                  <span style={{width: 42, height: 42, borderRadius: 13, background: r.c, color: '#fff', fontSize: 22, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{r.i}</span>
                  <span style={{fontFamily: FONT, fontWeight: 700, fontSize: 27, color: dark ? '#fff' : INK}}>{r.t}</span>
                  <span style={{marginLeft: 'auto', fontFamily: FONT, fontWeight: 800, fontSize: 18, color: '#16A34A'}}>✓ Fait</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div style={{position: 'absolute', left: 716, top: 548, zIndex: 3, width: 64, height: 64, borderRadius: 32, background: dark ? '#1E1B4B' : '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, color: dark ? '#E0E7FF' : '#D97706', opacity: prog(f, jour - 4, 8) * toB, transform: `rotate(${night * 360}deg) scale(${sp(f - jour + 4, 10)})`}}>{dark ? '☾' : '☀'}</div>
      {/* conseil de l'IA */}
      <div style={{position: 'absolute', left: 70, right: 70, top: 1150, display: 'flex', gap: 16, alignItems: 'flex-start', opacity: Math.min(1, advice * 1.4), transform: `translateY(${(1 - advice) * 60}px)`}}>
        <div style={{width: 76, height: 76, borderRadius: 24, background: '#fff', border: `1px solid ${LINE}`, boxShadow: SHADOW, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}><LogoMark size={46} /></div>
        <div style={{flex: 1, padding: '20px 24px', borderRadius: '8px 28px 28px 28px', background: GRAD, color: '#fff', fontFamily: FONT, fontSize: 28, lineHeight: 1.32, fontWeight: 600, boxShadow: '0 30px 60px -24px rgba(91,63,228,0.7)'}}>
          <div style={{fontSize: 19, fontWeight: 800, letterSpacing: '0.12em', opacity: 0.8, marginBottom: 6}}>CONSEIL DE L’IA</div>
          {'Ta vidéo perd l’attention trop tôt. Teste une accroche en question dès la première image.'.slice(0, Math.max(0, Math.floor((f - cons) * 3.2)))}
        </div>
      </div>
      {/* alerte WhatsApp */}
      {(() => {
        const p = sp(f - wa, 12);
        return (
          <div style={{position: 'absolute', left: 110, right: 110, top: 1150, borderRadius: 30, background: '#fff', boxShadow: '0 40px 80px -30px rgba(11,10,31,0.5)', overflow: 'hidden', opacity: Math.min(1, p * 1.4), transform: `translateY(${(1 - p) * 120}px) scale(${0.9 + 0.1 * p})`, zIndex: 5}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px', background: '#075E54', color: '#fff', fontFamily: FONT, fontWeight: 700, fontSize: 22}}>
              <span style={{width: 34, height: 34, borderRadius: 17, background: '#25D366', display: 'flex', alignItems: 'center', justifyContent: 'center'}}><svg width="20" height="20" viewBox="0 0 24 24"><path d="M12 3a9 9 0 0 0-7.8 13.5L3 21l4.6-1.2A9 9 0 1 0 12 3z" fill="#fff" /></svg></span>
              WhatsApp · Growthity<span style={{marginLeft: 'auto', opacity: 0.7, fontSize: 18}}>maintenant</span>
            </div>
            <div style={{padding: '18px 22px', fontFamily: FONT, fontSize: 26, lineHeight: 1.35, color: INK}}>
              Ta pub « Été » s’essouffle. Deux nouvelles créas sont prêtes.
              <div style={{display: 'flex', gap: 10, marginTop: 14}}>
                <span style={{padding: '10px 18px', borderRadius: 14, background: '#E7F8EF', color: '#128C7E', fontWeight: 800, fontSize: 22}}>Lancer</span>
                <span style={{padding: '10px 18px', borderRadius: 14, background: '#F3F4F6', color: '#4B5563', fontWeight: 700, fontSize: 22}}>Voir</span>
              </div>
            </div>
          </div>
        );
      })()}
    </AbsoluteFill>
  );
};

// ============ final ============
const Final: React.FC = () => {
  const f = useCurrentFrame(); // local
  const tiles = ['Créer', 'Remplacer', 'Diffuser', 'Piloter'];
  const icons = ['✦', '◆', '➤', '◎'];
  const merge = prog(f, 26, 18, INOUT);
  const logo = sp(f - 40, 12);
  const tout = VO[7] - SC.fin + Math.round((WD['aio-7'].find((w) => w.w.startsWith('Tout'))?.s ?? 1) * 30);
  const t1 = sp(f - tout + 2, 15);
  const t2 = sp(f - tout - 10, 15);
  const cta = sp(f - tout - 24, 13);
  return (
    <AbsoluteFill>
      {tiles.map((t, i) => {
        const p = sp(f - i * 3, 13);
        const gx = (i % 2) * 2 - 1, gy = Math.floor(i / 2) * 2 - 1;
        const x = 540 + gx * 150 * (1 - merge);
        const y = 640 + gy * 150 * (1 - merge);
        return (
          <div key={t} style={{position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) scale(${p * (1 - merge * 0.6)}) rotate(${merge * 45}deg)`, opacity: 1 - prog(f, 38, 6)}}>
            <div style={{width: 260, height: 260, borderRadius: 50, background: '#fff', border: `1px solid ${LINE}`, boxShadow: SHADOW, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12}}>
              <span style={{width: 76, height: 76, borderRadius: 24, background: GRAD, color: '#fff', fontSize: 36, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{icons[i]}</span>
              <span style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 34, color: INK}}>{t}</span>
            </div>
          </div>
        );
      })}
      {f > 38 && (
        <div style={{position: 'absolute', left: 540, top: 600, transform: `translate(-50%,-50%) scale(${logo})`, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
          <div style={{width: 170, height: 170, borderRadius: 50, background: '#fff', border: `1px solid ${LINE}`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 90px rgba(139,92,246,0.45), ${SHADOW}`}}><LogoMark size={110} draw={prog(f, 40, 18)} /></div>
          <div style={{marginTop: 30}}><Wordmark size={74} /></div>
        </div>
      )}
      {/* onde de choc */}
      <div style={{position: 'absolute', left: 540, top: 600, width: 20, height: 20, borderRadius: '50%', border: '3px solid #A78BFA', transform: `translate(-50%,-50%) scale(${prog(f, 40, 26) * 70})`, opacity: (1 - prog(f, 40, 26)) * (f > 40 ? 0.8 : 0)}} />
      <div style={{position: 'absolute', left: 60, right: 60, top: 880, textAlign: 'center', fontFamily: DISPLAY, fontWeight: 700, letterSpacing: '-0.05em', lineHeight: 1, color: INK}}>
        <div style={{fontSize: 170, opacity: Math.min(1, t1 * 1.5), transform: `translateY(${(1 - t1) * 60}px)`}}>Tout.</div>
        <div style={{fontSize: 104, marginTop: 10, opacity: Math.min(1, t2 * 1.5), transform: `translateY(${(1 - t2) * 60}px)`}}><G>Au même endroit.</G></div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1250, display: 'flex', justifyContent: 'center', opacity: Math.min(1, cta * 1.4), transform: `translateY(${(1 - cta) * 40}px)`}}>
        <div style={{padding: '30px 64px', borderRadius: 99, background: GRAD, color: '#fff', fontFamily: FONT, fontWeight: 800, fontSize: 40, boxShadow: '0 30px 60px -20px rgba(91,63,228,0.8)', transform: `scale(${1 + 0.025 * Math.sin(f / 5) * prog(f, tout + 40, 10)})`}}>Commencer →</div>
      </div>
    </AbsoluteFill>
  );
};

export const AllInOne: React.FC = () => {
  useFonts();
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: BG, fontFamily: FONT}}>
      {f >= SC.reveal && <LightBg />}
      {f < SC.reveal + 20 && <Chaos />}
      <Sequence from={SC.reveal} durationInFrames={20}><Reveal /></Sequence>
      {f >= SC.reveal && f < SC.ch1 + 10 && (
        <div style={{position: 'absolute', left: 540, top: 860, transform: `translate(-50%,-50%) scale(${1 - prog(f, SC.ch1 - 6, 14, INOUT) * 0.2})`, opacity: 1 - prog(f, SC.ch1, 10)}}>
          <div style={{width: 210, height: 210, borderRadius: 60, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: SHADOW, border: `1px solid ${LINE}`}}><LogoMark size={140} /></div>
        </div>
      )}
      {f >= SC.ch1 && f < SC.ch2 + 2 && <Ch1 />}
      {f >= SC.ch2 - 2 && f < SC.ch3 + 2 && <Ch2 />}
      {f >= SC.ch3 - 2 && f < SC.ch4 + 2 && <Ch3 />}
      {f >= SC.ch4 - 2 && f < SC.fin + 2 && <Ch4 />}
      <ChapterRail />
      <Sequence from={SC.fin}><Final /></Sequence>
      {[SC.ch2, SC.ch3, SC.ch4, SC.fin].map((a) => <Sweep key={a} at={a} />)}
      {/* flash blanc à la révélation */}
      <AbsoluteFill style={{background: '#fff', opacity: interpolate(f, [SC.reveal - 2, SC.reveal + 2, SC.reveal + 14], [0, 0.85, 0], clamp), pointerEvents: 'none'}} />
      <Audio src={staticFile('allinone/bed.wav')} />
      {[1, 2, 3, 4, 5, 6, 7].map((k) => (
        <Sequence key={k} from={VO[k]}><Audio src={staticFile(`voice/aio-${k}-n.mp3`)} /></Sequence>
      ))}
    </AbsoluteFill>
  );
};
