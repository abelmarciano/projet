import React from 'react';
import {useCurrentFrame} from 'remotion';
import {StudioBg} from '../components/Backgrounds';
import {WordsReveal, words} from '../components/Text';
import {prog, pop} from '../components/anim';
import {DISPLAY, FONT, GRAD} from '../theme';
import {SAFE} from './safe';

const PAINS = [
  {k: 'Agence', v: '3 000 €'},
  {k: 'Délais', v: '2 semaines'},
  {k: 'Montage', v: 'Des heures'},
];

export const ProblemV: React.FC = () => {
  const f = useCurrentFrame() * (110 / 158);
  const leave = prog(f, 94, 14);
  return (
    <StudioBg intensity={0.7}>
      <div
        style={{
          position: 'absolute',
          left: SAFE.x,
          top: SAFE.y,
          width: SAFE.w,
          height: SAFE.h,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: 1 - leave,
        }}
      >
        <WordsReveal
          words={[...words('Une pub Meta'), {t: 'qui', br: true}, ...words('convertit, aujourd’hui :')]}
          start={2}
          stagger={2.5}
          style={{fontFamily: DISPLAY, fontWeight: 600, fontSize: 60, lineHeight: 1.1, color: 'rgba(255,255,255,0.75)', width: SAFE.w}}
        />
        <div style={{display: 'flex', flexDirection: 'column', gap: 26, marginTop: 60}}>
          {PAINS.map((p, i) => {
            const s = pop(f, 14 + i * 8, 13);
            const strike = prog(f, 46 + i * 7, 14);
            return (
              <div
                key={p.k}
                style={{
                  width: 680,
                  padding: '28px 40px',
                  borderRadius: 28,
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  transform: `scale(${0.8 + s * 0.2}) translateY(${(1 - s) * 40}px)`,
                  opacity: Math.min(1, s * 1.4) * (1 - strike * 0.55),
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{fontFamily: FONT, fontSize: 26, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)', fontWeight: 600}}>
                  {p.k}
                </div>
                <div style={{fontFamily: DISPLAY, fontSize: 64, fontWeight: 700, color: '#fff'}}>{p.v}</div>
                <div
                  style={{
                    position: 'absolute',
                    left: 26,
                    right: 26,
                    top: '50%',
                    height: 7,
                    borderRadius: 4,
                    backgroundImage: GRAD,
                    transform: `scaleX(${strike}) rotate(-3deg)`,
                    transformOrigin: 'left center',
                    boxShadow: '0 0 24px rgba(146,120,255,0.8)',
                  }}
                />
              </div>
            );
          })}
        </div>
        <div style={{height: 80}} />
        <WordsReveal
          words={[...words('Et si une'), {t: 'phrase', grad: 'pink', br: true}, {t: 'suffisait ?'}]}
          start={70}
          stagger={3}
          style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 96, lineHeight: 1.05, color: '#fff', width: SAFE.w}}
        />
      </div>
    </StudioBg>
  );
};
