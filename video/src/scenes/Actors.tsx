import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {StudioBg} from '../components/Backgrounds';
import {Clip} from '../components/Media';
import {Kicker} from '../components/UI';
import {prog, pop, mix} from '../components/anim';
import {C, DISPLAY, FONT, GRAD} from '../theme';

const CARDS = [
  {src: 'ugc-scierie.mp4', name: 'Léa', tag: 'B2B · Industrie', slot: -2, start: 30},
  {src: 'ugc-homme.mp4', name: 'Marc', tag: 'Témoignage', slot: -1, start: 0},
  {src: 'ugc-femme.mp4', name: 'Inès', tag: 'Beauté · Lifestyle', slot: 0, start: 0},
  {src: 'ugc-solaire.mp4', name: 'Sophie', tag: 'Maison · Énergie', slot: 1, start: 0, loop: 150},
  {src: 'ugc-charlotte.mp4', name: 'Charlotte', tag: 'Face caméra', slot: 2, start: 300},
];

const SIZE = [
  {w: 360, h: 640},
  {w: 300, h: 534},
  {w: 250, h: 444},
];

export const Actors: React.FC = () => {
  const f = useCurrentFrame();
  const kick = prog(f, 4, 22);
  const fan = pop(f, 8, 16);
  const count = Math.round(interpolate(f, [6, 50], [0, 500], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: (t) => 1 - Math.pow(1 - t, 3)}));
  const title = prog(f, 4, 24);
  const sel = prog(f, 96, 20);
  const drift = interpolate(f, [0, 180], [10, -10]);
  return (
    <StudioBg>
      <div style={{position: 'absolute', left: 140, top: 70}}>
        <Kicker n="02" label="Acteurs UGC" dark opacity={kick} y={(1 - kick) * 16} />
      </div>
      <div
        style={{
          position: 'absolute',
          top: 120,
          left: 0,
          right: 0,
          textAlign: 'center',
          fontFamily: DISPLAY,
          fontWeight: 700,
          fontSize: 92,
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
      <AbsoluteFill style={{perspective: 2000}}>
        {[...CARDS]
          .sort((a, b) => Math.abs(b.slot) - Math.abs(a.slot))
          .map((c) => {
            const d = Math.abs(c.slot);
            const s = SIZE[d];
            const x = 960 + c.slot * mix(0, 330, fan) - s.w / 2 + drift * c.slot;
            const y = 640 - s.h / 2 + d * mix(0, 40, fan);
            const isSel = c.slot === 0;
            const dim = isSel ? 1 : 1 - sel * 0.35;
            const appear = pop(f, 4 + d * 5, 15);
            return (
              <div
                key={c.name}
                style={{
                  position: 'absolute',
                  left: x,
                  top: y,
                  width: s.w,
                  height: s.h,
                  transform: `rotate(${c.slot * mix(0, 7, fan)}deg) scale(${(0.8 + appear * 0.2) * (isSel ? 1 + sel * 0.04 : 1)})`,
                  opacity: Math.min(1, appear * 1.4) * dim,
                  borderRadius: 30,
                  boxShadow: isSel && sel > 0 ? `0 0 0 ${6 * sel}px ${C.primary}, 0 50px 100px -30px rgba(101,82,232,0.8)` : '0 40px 90px -30px rgba(0,0,0,0.9)',
                  border: '1px solid rgba(255,255,255,0.14)',
                }}
              >
                <Clip src={c.src} width={s.w} height={s.h} radius={30} startFrom={c.start} loopFrames={'loop' in c ? (c.loop as number) : undefined} />
                <div
                  style={{
                    position: 'absolute',
                    left: 14,
                    bottom: 14,
                    right: 14,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '10px 14px',
                    borderRadius: 16,
                    background: 'rgba(11,10,12,0.55)',
                    backdropFilter: 'blur(8px)',
                    fontFamily: FONT,
                    color: '#fff',
                  }}
                >
                  <div>
                    <div style={{fontWeight: 700, fontSize: d === 0 ? 22 : 18}}>{c.name}</div>
                    <div style={{fontSize: d === 0 ? 16 : 14, color: 'rgba(255,255,255,0.75)'}}>{c.tag}</div>
                  </div>
                </div>
              </div>
            );
          })}
      </AbsoluteFill>
      {/* auto-selection chip */}
      <div
        style={{
          position: 'absolute',
          left: 960 - 450,
          top: 976,
          width: 900,
          opacity: sel,
          transform: `translateY(${(1 - sel) * 20}px)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 14,
          fontFamily: FONT,
          fontSize: 22,
          color: '#fff',
        }}
      >
        <span style={{display: 'flex', alignItems: 'center', gap: 4, height: 28}}>
          {Array.from({length: 12}).map((_, i) => (
            <span key={i} style={{width: 4, borderRadius: 2, backgroundImage: GRAD, height: 6 + Math.abs(Math.sin(f / 3 + i)) * 22}} />
          ))}
        </span>
        Actrice choisie automatiquement · <b>Inès</b>
        <span style={{color: '#B9A8FF', fontWeight: 600}}>Changer</span>
      </div>
    </StudioBg>
  );
};
