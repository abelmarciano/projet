import React from 'react';
import {AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {LightBg} from '../components/Backgrounds';
import {WordsReveal} from '../components/Text';
import {BrowserFrame, GradButton} from '../components/UI';
import {prog, pop, INOUT} from '../components/anim';
import {C, DISPLAY, FONT} from '../theme';

// 9.5–17s: the promise, then the real landing page
export const Hero: React.FC = () => {
  const f = useCurrentFrame();
  const sub = prog(f, 40, 24);
  const btn = pop(f, 54, 14);
  const lift = prog(f, 112, 40, INOUT);
  const shot = prog(f, 112, 50);
  const scroll = interpolate(f, [150, 225], [0, -260], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: INOUT});
  return (
    <LightBg>
      <AbsoluteFill
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          transform: `translateY(${-lift * 420}px) scale(${1 - lift * 0.35})`,
          opacity: Math.max(0, 1 - lift * 1.8),
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
          start={4}
          stagger={3.5}
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
          Décrivez votre produit en une phrase : visuels, vidéos UGC et carrousels
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
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', perspective: 2200}}>
        <div
          style={{
            transform: `translateY(${(1 - shot) * 900}px) rotateX(${interpolate(shot, [0, 1], [32, 6])}deg) scale(${interpolate(f, [112, 230], [0.92, 1.0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})})`,
            opacity: Math.min(1, shot * 2),
          }}
        >
          <BrowserFrame title="growthity.ai" width={1560} height={880}>
            <Img src={staticFile('landing.png')} style={{width: 1560, transform: `translateY(${scroll}px)`}} />
          </BrowserFrame>
        </div>
      </AbsoluteFill>
    </LightBg>
  );
};
