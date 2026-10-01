import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {LightBg} from '../components/Backgrounds';
import {WordsReveal} from '../components/Text';
import {GradButton} from '../components/UI';
import {prog, pop, INOUT} from '../components/anim';
import {C, DISPLAY, FONT} from '../theme';

// The promise, on its own — straight into the product afterwards
export const Hero: React.FC = () => {
  const f = useCurrentFrame();
  const sub = prog(f, 30, 22);
  const btn = pop(f, 42, 14);
  const out = prog(f, 139, 18, INOUT);
  return (
    <LightBg>
      <AbsoluteFill
        style={{
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
            {t: 'Meta,'},
            {t: 'générées'},
            {t: 'et', br: true},
            {t: 'publiées', grad: 'pink'},
            {t: 'en'},
            {t: '2'},
            {t: 'minutes.'},
          ]}
          start={2}
          stagger={2.6}
          style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 124, lineHeight: 1.02, color: C.ink, maxWidth: 1500}}
        />
        <div
          style={{
            marginTop: 36,
            fontFamily: FONT,
            fontSize: 34,
            color: C.slate,
            textAlign: 'center',
            lineHeight: 1.45,
            opacity: sub,
            transform: `translateY(${(1 - sub) * 20}px)`,
          }}
        >
          Décrivez votre produit en une phrase : vidéos UGC, visuels et carrousels
          <br />
          sont créés, puis publiés sur Meta en un clic.
        </div>
        <div style={{marginTop: 46, transform: `scale(${btn})`}}>
          <GradButton>
            Commencer
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
              <path d="M5 12h14M13 6l6 6-6 6" stroke="#fff" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </GradButton>
        </div>
      </AbsoluteFill>
    </LightBg>
  );
};
