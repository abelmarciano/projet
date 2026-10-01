import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {StudioBg} from '../components/Backgrounds';
import {LogoMark, Wordmark} from '../components/UI';
import {prog, pop, EXPO} from '../components/anim';
import {FONT} from '../theme';

// 0–4.5s: mark draws, wordmark types in, origin badge
export const Intro: React.FC = () => {
  const f = useCurrentFrame();
  const draw = prog(f, 6, 34);
  const markScale = pop(f, 4, 12);
  const reveal = prog(f, 28, 26);
  const shift = interpolate(f, [24, 50], [150, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EXPO});
  const badge = prog(f, 58, 24);
  const zoom = interpolate(f, [0, 135], [1.06, 1], {extrapolateRight: 'clamp'});
  const flare = interpolate(f, [30, 46, 80], [0, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <StudioBg>
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', transform: `scale(${zoom})`}}>
        <div
          style={{
            position: 'absolute',
            width: 900,
            height: 900,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(146,120,255,0.55) 0%, transparent 60%)',
            opacity: flare,
            filter: 'blur(30px)',
          }}
        />
        <div style={{display: 'flex', alignItems: 'center', gap: 28, transform: `translateX(${shift}px)`}}>
          <div style={{transform: `scale(${markScale})`}}>
            <LogoMark size={150} draw={draw} />
          </div>
          <Wordmark size={150} dark reveal={reveal} />
        </div>
        <div
          style={{
            marginTop: 50,
            opacity: badge,
            transform: `translateY(${(1 - badge) * 20}px)`,
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            padding: '14px 26px',
            borderRadius: 999,
            border: '1px solid rgba(255,255,255,0.14)',
            background: 'rgba(255,255,255,0.06)',
            fontFamily: FONT,
            fontSize: 24,
            color: 'rgba(255,255,255,0.85)',
          }}
        >
          <span style={{display: 'flex', borderRadius: 3, overflow: 'hidden'}}>
            <span style={{width: 10, height: 20, background: '#2E4BC6'}} />
            <span style={{width: 10, height: 20, background: '#fff'}} />
            <span style={{width: 10, height: 20, background: '#E1343E'}} />
          </span>
          Conçu &amp; hébergé en France
          <span style={{width: 1, height: 22, background: 'rgba(255,255,255,0.25)'}} />
          <span style={{color: '#B9A8FF', fontWeight: 600}}>IA générative</span>
        </div>
      </AbsoluteFill>
    </StudioBg>
  );
};
