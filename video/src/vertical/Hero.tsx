import React from 'react';
import {useCurrentFrame} from 'remotion';
import {LightBg} from '../components/Backgrounds';
import {WordsReveal} from '../components/Text';
import {GradButton} from '../components/UI';
import {prog, pop, INOUT} from '../components/anim';
import {C, DISPLAY, FONT} from '../theme';
import {SAFE} from './safe';

export const HeroV: React.FC = () => {
  const f = useCurrentFrame();
  const sub = prog(f, 30, 22);
  const btn = pop(f, 42, 14);
  const out = prog(f, 159, 18, INOUT);
  return (
    <LightBg>
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
          transform: `scale(${1 + out * 0.06})`,
          opacity: 1 - out,
          filter: `blur(${out * 10}px)`,
        }}
      >
        <WordsReveal
          words={[
            {t: 'Vos'},
            {t: 'publicités', br: true},
            {t: 'Meta,', br: true},
            {t: 'générées', br: true},
            {t: 'et'},
            {t: 'publiées', grad: 'pink', br: true},
            {t: 'en'},
            {t: '2'},
            {t: 'minutes.'},
          ]}
          start={2}
          stagger={2.6}
          style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 112, lineHeight: 1.02, color: C.ink, width: SAFE.w}}
        />
        <div
          style={{
            marginTop: 44,
            fontFamily: FONT,
            fontSize: 36,
            color: C.slate,
            textAlign: 'center',
            lineHeight: 1.45,
            opacity: sub,
            transform: `translateY(${(1 - sub) * 20}px)`,
          }}
        >
          Décrivez votre produit en une phrase :
          <br />
          vidéos UGC, visuels et carrousels
          <br />
          sont créés, puis publiés sur Meta.
        </div>
        <div style={{marginTop: 56, transform: `scale(${btn})`}}>
          <GradButton style={{height: 88, fontSize: 32, padding: '0 46px'}}>
            Commencer
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
              <path d="M5 12h14M13 6l6 6-6 6" stroke="#fff" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </GradButton>
        </div>
      </div>
    </LightBg>
  );
};
