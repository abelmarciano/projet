import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {StudioBg} from '../components/Backgrounds';
import {Clip} from '../components/Media';
import {GradButton, LogoMark, Wordmark} from '../components/UI';
import {WordsReveal, words} from '../components/Text';
import {prog, pop, INOUT} from '../components/anim';
import {DISPLAY, FONT} from '../theme';
import {SAFE, SAFE_CX} from './safe';

// decorative clips sit in the margins (dead zones are fine for blurred b-roll)
const FLOAT: {src: string; x: number; y: number; w: number; h: number; r: number; z: number}[] = [
  {src: 'ugc-femme.mp4', x: -40, y: 70, w: 260, h: 462, r: -8, z: 0.6},
  {src: 'img-bougie.webp', x: 790, y: 120, w: 280, h: 280, r: 7, z: 0.5},
  {src: 'ugc-homme.mp4', x: 820, y: 1380, w: 260, h: 462, r: -5, z: 0.8},
  {src: 'img-sneakers.webp', x: -30, y: 1480, w: 300, h: 300, r: 6, z: 0.7},
];

export const OutroV: React.FC = () => {
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
              opacity: p * (0.5 - phase2 * 0.25),
              filter: `blur(${(1 - c.z) * 8 + phase2 * 4}px)`,
              borderRadius: 24,
              overflow: 'hidden',
              boxShadow: '0 40px 100px -30px rgba(0,0,0,0.9)',
            }}
          >
            <Clip src={c.src} width={c.w} height={c.h} />
          </div>
        );
      })}
      <div
        style={{
          position: 'absolute',
          left: SAFE.x,
          top: SAFE.y,
          width: SAFE.w,
          height: SAFE.h,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: `translateY(${-phase2 * 360}px) scale(${1 - phase2 * 0.28})`,
        }}
      >
        <WordsReveal
          words={[...words('Votre prochaine'), {t: 'campagne', br: true}, {t: 'Meta'}, {t: 'est'}, {t: 'à', br: true}, {t: 'une', grad: 'pink'}, {t: 'phrase.', grad: 'pink'}]}
          start={6}
          stagger={3}
          style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 100, lineHeight: 1.05, color: '#fff', width: SAFE.w}}
        />
      </div>
      <div
        style={{
          position: 'absolute',
          left: SAFE_CX - 450,
          top: 720,
          width: 900,
          height: 600,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(146,120,255,0.5) 0%, transparent 60%)',
          opacity: interpolate(f, [92, 108, 150], [0, 1, 0.35], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
          filter: 'blur(30px)',
        }}
      />
      <div style={{position: 'absolute', left: SAFE.x, width: SAFE.w, top: 800, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 16, transform: `scale(${mark})`, opacity: Math.min(1, mark * 1.4)}}>
          <LogoMark size={96} draw={prog(f, 90, 28)} />
          <Wordmark size={96} dark reveal={prog(f, 98, 22)} />
        </div>
        <div style={{marginTop: 56, transform: `scale(${btn})`}}>
          <GradButton style={{height: 96, fontSize: 36, padding: '0 54px'}}>
            Commencer
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path d="M5 12h14M13 6l6 6-6 6" stroke="#fff" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </GradButton>
        </div>
        <div style={{marginTop: 44, fontFamily: FONT, fontSize: 28, lineHeight: 1.6, color: 'rgba(255,255,255,0.7)', opacity: meta, textAlign: 'center'}}>
          <b style={{color: '#fff'}}>500 crédits offerts</b> sur votre premier abonnement
          <br />
          Conçu &amp; hébergé en France
        </div>
      </div>
      <AbsoluteFill style={{background: '#000', opacity: interpolate(f, [206, 220], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}} />
    </StudioBg>
  );
};
