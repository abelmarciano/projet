import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {StudioBg} from '../components/Backgrounds';
import {Clip} from '../components/Media';
import {Kicker} from '../components/UI';
import {prog} from '../components/anim';
import {C, DISPLAY, FONT, GRAD} from '../theme';

type Actor = {src: string; name: string; tag: string; start?: number; loop?: number};

// 21 different actors, each shown exactly once across the two rows
const L = 150; // the casting previews are 5 s long: loop them
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
const SELECTED = 5; // Charlotte, centred in row A while selected

const W = 196;
const H = 348;
const GAP = 26;
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

// One pass, no repetition: each row slides slowly in its own direction
const Row: React.FC<{actors: Actor[]; y: number; x0: number; dir: 1 | -1; speed: number; highlightIdx?: number; highlight?: number}> = ({
  actors,
  y,
  x0,
  dir,
  speed,
  highlightIdx,
  highlight = 0,
}) => {
  const f = useCurrentFrame();
  return (
    <div style={{position: 'absolute', top: y, left: 0, display: 'flex', gap: GAP, transform: `translateX(${x0 + dir * f * speed}px)`}}>
      {actors.map((a, i) => (
        <Tile key={a.name} a={a} highlight={i === highlightIdx ? highlight : 0} />
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
        <Row actors={ROW_A} y={262} x0={-60} dir={-1} speed={1} highlightIdx={SELECTED} highlight={sel} />
        <Row actors={ROW_B} y={262 + H + 26} x0={-280} dir={1} speed={1} />
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
