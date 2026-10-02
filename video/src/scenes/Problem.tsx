import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {StudioBg} from '../components/Backgrounds';
import {WordsReveal, words} from '../components/Text';
import {prog, pop} from '../components/anim';
import {DISPLAY, FONT, GRAD} from '../theme';

const PAINS = [
  {k: 'Agence', v: '3 000 €'},
  {k: 'Délais', v: '2 semaines'},
  {k: 'Montage', v: 'Des heures'},
];

// Second to last: the old way, struck through, right before the outro
export const Problem: React.FC = () => {
  // animation authored for 110 frames, stretched to the voice-over length
  const f = useCurrentFrame() * (110 / 158);
  const leave = prog(f, 94, 14);
  return (
    <StudioBg intensity={0.7}>
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', opacity: 1 - leave}}>
        <WordsReveal
          words={words('Une pub Meta qui convertit, aujourd’hui :')}
          start={2}
          stagger={2.5}
          style={{fontFamily: DISPLAY, fontWeight: 600, fontSize: 64, color: 'rgba(255,255,255,0.75)', maxWidth: 1500}}
        />
        <div style={{display: 'flex', gap: 40, marginTop: 70}}>
          {PAINS.map((p, i) => {
            const s = pop(f, 14 + i * 8, 13);
            const strike = prog(f, 46 + i * 7, 14);
            return (
              <div
                key={p.k}
                style={{
                  width: 430,
                  padding: '34px 36px',
                  borderRadius: 26,
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  transform: `scale(${0.8 + s * 0.2}) translateY(${(1 - s) * 40}px)`,
                  opacity: Math.min(1, s * 1.4) * (1 - strike * 0.55),
                  position: 'relative',
                }}
              >
                <div style={{fontFamily: FONT, fontSize: 22, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)', fontWeight: 600}}>
                  {p.k}
                </div>
                <div style={{fontFamily: DISPLAY, fontSize: 60, fontWeight: 700, color: '#fff', marginTop: 10}}>{p.v}</div>
                <div
                  style={{
                    position: 'absolute',
                    left: 26,
                    right: 26,
                    top: '50%',
                    height: 6,
                    borderRadius: 3,
                    backgroundImage: GRAD,
                    transform: `scaleX(${strike}) rotate(-4deg)`,
                    transformOrigin: 'left center',
                    boxShadow: '0 0 24px rgba(146,120,255,0.8)',
                  }}
                />
              </div>
            );
          })}
        </div>
        <div style={{height: 90}} />
        <WordsReveal
          words={[...words('Et si une'), {t: 'phrase', grad: 'pink'}, {t: 'suffisait ?'}]}
          start={70}
          stagger={3}
          style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 84, color: '#fff'}}
        />
      </AbsoluteFill>
    </StudioBg>
  );
};
