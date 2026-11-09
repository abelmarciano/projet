import React, {useEffect, useState} from 'react';
import {AbsoluteFill, continueRender, delayRender, useCurrentFrame} from 'remotion';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/inter/800.css';
import '@fontsource/space-grotesk/700.css';
import {LightBg} from '../components/Backgrounds';
import {prog, pop} from '../components/anim';
import {DISPLAY, FONT, GRAD_PINK} from '../theme';
import {EndCard, PromptBox, R, gradText} from '../shorts/kit';

// « Tapé dans Growthity » intro (3 s) placed before a real Growthity ad, and a shared end card.
// The prompt is the beginning of what was really typed (file name of the export).

const useFonts = () => {
  const [h] = useState(() => delayRender('fonts'));
  useEffect(() => {
    Promise.all(['600 20px Inter', '700 20px Inter', '800 20px Inter', '700 20px "Space Grotesk"'].map((s) => document.fonts.load(s))).then(() => continueRender(h));
  }, [h]);
};

export const SHOW_INTRO = 96;
export const SHOW_END = 75;

export const ShowIntro: React.FC<{prompt: string; label: string; n?: string; heading?: string}> = ({prompt, label, n, heading}) => {
  useFonts();
  const f = useCurrentFrame();
  const send = 70;
  const cps = Math.max(45, (prompt.length * 30) / 62);
  const out = prog(f, 84, 12);
  return (
    <AbsoluteFill style={{background: '#fff'}}>
      <LightBg>
        <div style={{position: 'absolute', top: 330, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: prog(f, 0, 10)}}>
          <span style={{fontFamily: FONT, fontWeight: 800, fontSize: 34, color: '#fff', backgroundImage: GRAD_PINK, padding: '12px 28px', borderRadius: 999}}>{n ? `Pub n°${n} · ` : ''}{label}</span>
        </div>
        <div style={{position: 'absolute', top: 430, left: 0, right: 0, textAlign: 'center', fontFamily: DISPLAY, fontWeight: 700, fontSize: 64, letterSpacing: '-0.03em', color: '#0F172A', opacity: prog(f, 4, 12)}}>
          {heading ? heading : <>Tapé dans <span style={gradText()}>Growthity</span> :</>}
        </div>
        <div style={{position: 'absolute', left: R.x, top: 560, width: R.w, transform: `scale(${1 - out * 0.06})`, opacity: 1 - out * 0.9}}>
          <PromptBox text={prompt} start={6} cps={cps} send={send} size={40} />
        </div>
        <div style={{position: 'absolute', top: 1030, left: 0, right: 0, textAlign: 'center', fontFamily: FONT, fontWeight: 800, fontSize: 46, color: '#0F172A', transform: `scale(${pop(f, send + 2, 12)})`}}>
          La pub obtenue ↓
        </div>
      </LightBg>
    </AbsoluteFill>
  );
};

export const ShowEnd: React.FC = () => {
  useFonts();
  return <EndCard dur={SHOW_END} tagline={<>Votre pub,<br /><span style={gradText(GRAD_PINK)}>en une phrase.</span></>} />;
};
