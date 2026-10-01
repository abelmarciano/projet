import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {StudioBg} from '../components/Backgrounds';
import {Creative, CreativeKind} from '../components/Creatives';
import {GradButton, LogoMark, Wordmark} from '../components/UI';
import {WordsReveal, words} from '../components/Text';
import {prog, pop, INOUT} from '../components/anim';
import {DISPLAY, FONT} from '../theme';

const FLOAT: {kind: CreativeKind; x: number; y: number; w: number; h: number; r: number; z: number}[] = [
  {kind: 'serum', x: 120, y: 120, w: 240, h: 420, r: -8, z: 0.6},
  {kind: 'perfume', x: 1560, y: 90, w: 260, h: 320, r: 7, z: 0.5},
  {kind: 'can', x: 1500, y: 620, w: 280, h: 350, r: -5, z: 0.8},
  {kind: 'candle', x: 160, y: 640, w: 300, h: 300, r: 6, z: 0.7},
];

export const Outro: React.FC = () => {
  const f = useCurrentFrame();
  const phase2 = prog(f, 84, 30, INOUT);
  const mark = pop(f, 92, 12);
  const btn = pop(f, 116, 13);
  const meta = prog(f, 130, 20);
  return (
    <StudioBg>
      {FLOAT.map((c, i) => {
        const p = prog(f, i * 5, 40);
        const drift = Math.sin(f / 40 + i) * 14;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: c.x,
              top: c.y + drift,
              transform: `rotate(${c.r}deg) scale(${0.85 + p * 0.15})`,
              opacity: p * (0.55 - phase2 * 0.25),
              filter: `blur(${(1 - c.z) * 8 + phase2 * 4}px)`,
              borderRadius: 24,
              overflow: 'hidden',
              boxShadow: '0 40px 100px -30px rgba(0,0,0,0.9)',
            }}
          >
            <Creative kind={c.kind} width={c.w} height={c.h} radius={0} />
          </div>
        );
      })}
      <AbsoluteFill
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          transform: `translateY(${-phase2 * 210}px) scale(${1 - phase2 * 0.3})`,
        }}
      >
        <WordsReveal
          words={[...words('Votre prochaine campagne Meta'), {t: 'est', br: false}, {t: 'à'}, {t: 'une', grad: 'pink'}, {t: 'phrase.', grad: 'pink'}]}
          start={6}
          stagger={3}
          style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 104, lineHeight: 1.05, color: '#fff', maxWidth: 1300}}
        />
      </AbsoluteFill>
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', paddingTop: 290}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 18, transform: `scale(${mark})`, opacity: Math.min(1, mark * 1.4)}}>
          <LogoMark size={84} draw={prog(f, 92, 26)} />
          <Wordmark size={84} dark />
        </div>
        <div style={{marginTop: 44, transform: `scale(${btn})`}}>
          <GradButton style={{height: 84, fontSize: 30, padding: '0 44px'}}>
            Commencer gratuitement
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M5 12h14M13 6l6 6-6 6" stroke="#fff" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </GradButton>
        </div>
        <div style={{marginTop: 32, fontFamily: FONT, fontSize: 24, color: 'rgba(255,255,255,0.7)', opacity: meta, display: 'flex', gap: 18, alignItems: 'center'}}>
          <span>
            <b style={{color: '#fff'}}>500 crédits offerts</b> sur votre premier abonnement
          </span>
          <span style={{width: 5, height: 5, borderRadius: 3, background: 'rgba(255,255,255,0.4)'}} />
          <span>Conçu &amp; hébergé en France</span>
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{background: '#000', opacity: interpolate(f, [196, 210], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}} />
    </StudioBg>
  );
};
