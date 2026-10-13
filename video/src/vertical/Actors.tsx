import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {StudioBg} from '../components/Backgrounds';
import {Clip} from '../components/Media';
import {prog} from '../components/anim';
import {C, DISPLAY, FONT, GRAD} from '../theme';
import {SAFE} from './safe';

type Actor = {src: string; name: string; tag: string; start?: number; loop?: number};

// same 21 actors as the 16:9 cut, each shown exactly once
const L = 150;
const ROW_A: Actor[] = [
  {src: 'actor-antoine.mp4', name: 'Antoine', tag: 'Auto', loop: L},
  {src: 'actor-emiko.mp4', name: 'Emiko', tag: 'Beauté', loop: L},
  {src: 'ugc-homme.mp4', name: 'Marc', tag: 'Témoignage'},
  {src: 'actor-freja.mp4', name: 'Freja', tag: 'Maison', loop: L},
  {src: 'actor-thomas.mp4', name: 'Thomas', tag: 'B2B', loop: L},
  {src: 'ugc-charlotte.mp4', name: 'Charlotte', tag: 'Face caméra'},
  {src: 'ugc-pac-awa.mp4', name: 'Awa', tag: 'Énergie', loop: 75},
  {src: 'actor-camille.mp4', name: 'Camille', tag: 'Lifestyle', loop: L},
  {src: 'actor-hiro.mp4', name: 'Hiro', tag: 'Tech', loop: L},
  {src: 'actor-claire.mp4', name: 'Claire', tag: 'Finance', loop: L},
  {src: 'ugc-solaire.mp4', name: 'Sophie', tag: 'Maison', loop: L},
];
const ROW_B: Actor[] = [
  {src: 'actor-lucas.mp4', name: 'Lucas', tag: 'Casual', loop: L},
  {src: 'ugc-femme.mp4', name: 'Inès', tag: 'Beauté'},
  {src: 'actor-anya.mp4', name: 'Anya', tag: 'Wellness', loop: L},
  {src: 'actor-david.mp4', name: 'David', tag: 'Corporate', loop: L},
  {src: 'actor-zoe.mp4', name: 'Zoé', tag: 'Mode', loop: L},
  {src: 'ugc-pac-hugo.mp4', name: 'Hugo', tag: 'Énergie'},
  {src: 'actor-model-01.mp4', name: 'Alice', tag: 'Lifestyle', loop: L},
  {src: 'ugc-scierie.mp4', name: 'Léa', tag: 'Industrie', loop: 220},
  {src: 'actor-marta.mp4', name: 'Marta', tag: 'Famille', loop: L},
  {src: 'actor-emma.mp4', name: 'Emma', tag: 'Beauté', loop: L},
];
const SELECTED = 5;

const W = 220;
const H = 391;
const GAP = 24;
const STEP = W + GAP;
const ROW_Y = 520;
// Charlotte's tile stays centred in the safe area while she is selected
const X0_A = 385 + 165 - SELECTED * STEP;

const Tile: React.FC<{a: Actor; highlight?: number}> = ({a, highlight = 0}) => (
  <div
    style={{
      width: W,
      height: H,
      flexShrink: 0,
      borderRadius: 24,
      position: 'relative',
      transform: `scale(${1 + highlight * 0.07})`,
      boxShadow:
        highlight > 0
          ? `0 0 0 ${5 * highlight}px ${C.primary}, 0 40px 80px -30px rgba(101,82,232,0.9)`
          : '0 30px 60px -30px rgba(0,0,0,0.9)',
      border: '1px solid rgba(255,255,255,0.12)',
      zIndex: highlight > 0 ? 5 : 1,
    }}
  >
    <Clip src={a.src} width={W} height={H} radius={24} startFrom={a.start ?? 0} loopFrames={a.loop} />
    <div
      style={{
        position: 'absolute',
        left: 10,
        right: 10,
        bottom: 10,
        padding: '8px 12px',
        borderRadius: 14,
        background: 'rgba(11,10,12,0.55)',
        backdropFilter: 'blur(8px)',
        fontFamily: FONT,
        color: '#fff',
      }}
    >
      <div style={{fontWeight: 700, fontSize: 19}}>{a.name}</div>
      <div style={{fontSize: 14, color: 'rgba(255,255,255,0.75)'}}>{a.tag}</div>
    </div>
  </div>
);

const Row: React.FC<{actors: Actor[]; y: number; x0: number; dir: 1 | -1; highlightIdx?: number; highlight?: number}> = ({actors, y, x0, dir, highlightIdx, highlight = 0}) => {
  const f = useCurrentFrame();
  return (
    <div style={{position: 'absolute', top: y, left: 0, display: 'flex', gap: GAP, transform: `translateX(${x0 + dir * f}px)`}}>
      {actors.map((a, i) => (
        <Tile key={a.name} a={a} highlight={i === highlightIdx ? highlight : 0} />
      ))}
    </div>
  );
};

export const ActorsV: React.FC = () => {
  const f = useCurrentFrame();
  const title = prog(f, 4, 24);
  const wall = prog(f, 0, 26);
  const count = Math.round(interpolate(f, [6, 50], [0, 500], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: (t) => 1 - Math.pow(1 - t, 3)}));
  const sel = prog(f, 110, 20);
  return (
    <StudioBg>
      <div
        style={{
          position: 'absolute',
          top: SAFE.y + 10,
          left: SAFE.x,
          width: SAFE.w,
          textAlign: 'center',
          fontFamily: DISPLAY,
          fontWeight: 700,
          color: '#fff',
          opacity: title,
          transform: `translateY(${(1 - title) * 30}px)`,
        }}
      >
        <div style={{fontSize: 150, lineHeight: 1, fontVariantNumeric: 'tabular-nums'}}>
          <span style={{backgroundImage: 'linear-gradient(100deg, #9DB4FF, #C9A8FF 55%, #FF9ED2)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent'}}>{count}+</span>
        </div>
        <div style={{fontSize: 60, lineHeight: 1.1, marginTop: 10}}>acteurs IA, prêts à tourner.</div>
      </div>
      <div style={{position: 'absolute', inset: 0, opacity: wall, transform: `translateY(${(1 - wall) * 60}px) rotate(-3deg) scale(1.04)`}}>
        <Row actors={ROW_A} y={ROW_Y} x0={X0_A} dir={-1} highlightIdx={SELECTED} highlight={sel} />
        <Row actors={ROW_B} y={ROW_Y + H + GAP} x0={-1200} dir={1} />
      </div>
      <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(90deg, #0B0A0C 0%, transparent 9%, transparent 91%, #0B0A0C 100%)', pointerEvents: 'none'}} />
      <div
        style={{
          position: 'absolute',
          left: SAFE.x,
          width: SAFE.w,
          top: 1336,
          opacity: sel,
          transform: `translateY(${(1 - sel) * 20}px)`,
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            fontFamily: FONT,
            fontSize: 26,
            color: '#fff',
            padding: '14px 26px',
            borderRadius: 999,
            background: 'rgba(11,10,12,0.78)',
            border: '1px solid rgba(255,255,255,0.14)',
          }}
        >
          <span style={{display: 'flex', alignItems: 'center', gap: 4, height: 28}}>
            {Array.from({length: 10}).map((_, i) => (
              <span key={i} style={{width: 4, borderRadius: 2, backgroundImage: GRAD, height: 6 + Math.abs(Math.sin(f / 3 + i)) * 22}} />
            ))}
          </span>
          Actrice choisie : <b>Charlotte</b>
          <span style={{color: '#B9A8FF', fontWeight: 600}}>Changer</span>
        </div>
      </div>
    </StudioBg>
  );
};
