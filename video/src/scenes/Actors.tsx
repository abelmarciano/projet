import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {StudioBg} from '../components/Backgrounds';
import {Clip} from '../components/Media';
import {Kicker} from '../components/UI';
import {prog} from '../components/anim';
import {C, DISPLAY, FONT, GRAD} from '../theme';

type Actor = {src: string; name: string; tag: string; start?: number; loop?: number};

const CHARLOTTE: Actor = {src: 'ugc-charlotte.mp4', name: 'Charlotte', tag: 'Face caméra'};
const ROW_A: Actor[] = [
  CHARLOTTE,
  {src: 'ugc-femme.mp4', name: 'Inès', tag: 'Beauté'},
  {src: 'ugc-homme.mp4', name: 'Marc', tag: 'Témoignage'},
  {src: 'ugc-pac-awa.mp4', name: 'Awa', tag: 'Maison'},
  {src: 'ugc-scierie.mp4', name: 'Léa', tag: 'B2B', loop: 220},
  {src: 'ugc-pac-hugo.mp4', name: 'Hugo', tag: 'Énergie'},
  {src: 'ugc-solaire.mp4', name: 'Sophie', tag: 'Lifestyle', loop: 150},
];
const ROW_B: Actor[] = [
  {src: 'ugc-pac-hugo.mp4', name: 'Hugo', tag: 'Énergie', start: 150},
  {src: 'ugc-solaire.mp4', name: 'Sophie', tag: 'Lifestyle', loop: 150},
  {src: 'ugc-femme.mp4', name: 'Inès', tag: 'Beauté', start: 10},
  {src: 'ugc-scierie.mp4', name: 'Léa', tag: 'B2B', loop: 220},
  {src: 'ugc-homme.mp4', name: 'Marc', tag: 'Témoignage', start: 10},
  {src: 'ugc-pac-awa.mp4', name: 'Awa', tag: 'Maison', start: 20},
  {src: 'ugc-charlotte.mp4', name: 'Charlotte', tag: 'Face caméra', start: 200},
];

const W = 196;
const H = 348;
const GAP = 20;
const STEP = W + GAP;

const Tile: React.FC<{a: Actor; highlight?: number}> = ({a, highlight = 0}) => (
  <div
    style={{
      width: W,
      height: H,
      flexShrink: 0,
      borderRadius: 24,
      position: 'relative',
      transform: `scale(${1 + highlight * 0.06})`,
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
      <div style={{fontWeight: 700, fontSize: 17}}>{a.name}</div>
      <div style={{fontSize: 13, color: 'rgba(255,255,255,0.75)'}}>{a.tag}</div>
    </div>
  </div>
);

// Endless two-row wall of real UGC actors, scrolling in opposite directions
const Row: React.FC<{actors: Actor[]; y: number; dir: 1 | -1; speed: number; highlightIdx?: number; highlight?: number}> = ({
  actors,
  y,
  dir,
  speed,
  highlightIdx,
  highlight = 0,
}) => {
  const f = useCurrentFrame();
  const loopW = actors.length * STEP;
  const raw = f * speed;
  const off = dir === -1 ? -(raw % loopW) : (raw % loopW) - loopW;
  const tiles = [...actors, ...actors, ...actors];
  return (
    <div style={{position: 'absolute', top: y, left: 0, display: 'flex', gap: GAP, transform: `translateX(${off - 60}px)`}}>
      {tiles.map((a, i) => (
        <Tile key={i} a={a} highlight={highlightIdx !== undefined && i === actors.length + highlightIdx ? highlight : 0} />
      ))}
    </div>
  );
};

export const Actors: React.FC = () => {
  const f = useCurrentFrame();
  const kick = prog(f, 4, 22);
  const title = prog(f, 4, 24);
  const wall = prog(f, 0, 26);
  const count = Math.round(interpolate(f, [6, 50], [0, 500], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: (t) => 1 - Math.pow(1 - t, 3)}));
  const sel = prog(f, 110, 20);
  return (
    <StudioBg>
      <div style={{position: 'absolute', left: 140, top: 60}}>
        <Kicker n="02" label="Acteurs UGC" dark opacity={kick} y={(1 - kick) * 16} />
      </div>
      <div
        style={{
          position: 'absolute',
          top: 104,
          left: 0,
          right: 0,
          textAlign: 'center',
          fontFamily: DISPLAY,
          fontWeight: 700,
          fontSize: 88,
          color: '#fff',
          opacity: title,
          transform: `translateY(${(1 - title) * 30}px)`,
        }}
      >
        <span style={{fontVariantNumeric: 'tabular-nums', backgroundImage: 'linear-gradient(100deg, #9DB4FF, #C9A8FF 55%, #FF9ED2)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent'}}>
          {count}+
        </span>{' '}
        acteurs IA, prêts à tourner.
      </div>
      <div style={{position: 'absolute', inset: 0, opacity: wall, transform: `translateY(${(1 - wall) * 60}px) rotate(-3deg) scale(1.04)`}}>
        <Row actors={ROW_A} y={262} dir={-1} speed={2.4} highlightIdx={0} highlight={sel} />
        <Row actors={ROW_B} y={262 + H + 26} dir={1} speed={2.0} />
      </div>
      {/* soft edges so tiles slide in and out of the dark */}
      <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(90deg, #0B0A0C 0%, transparent 12%, transparent 88%, #0B0A0C 100%)', pointerEvents: 'none'}} />
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 22,
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
            fontSize: 22,
            color: '#fff',
            padding: '12px 22px',
            borderRadius: 999,
            background: 'rgba(11,10,12,0.7)',
            border: '1px solid rgba(255,255,255,0.14)',
          }}
        >
          <span style={{display: 'flex', alignItems: 'center', gap: 4, height: 26}}>
            {Array.from({length: 12}).map((_, i) => (
              <span key={i} style={{width: 4, borderRadius: 2, backgroundImage: GRAD, height: 6 + Math.abs(Math.sin(f / 3 + i)) * 20}} />
            ))}
          </span>
          Actrice choisie automatiquement · <b>Charlotte</b>
          <span style={{color: '#B9A8FF', fontWeight: 600}}>Changer</span>
        </div>
      </div>
    </StudioBg>
  );
};
