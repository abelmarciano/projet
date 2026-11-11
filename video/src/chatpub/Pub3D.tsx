import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Audio, OffthreadVideo, Sequence, continueRender, delayRender, interpolate, staticFile, useCurrentFrame} from 'remotion';
import '@fontsource/inter/700.css';
import '@fontsource/inter/800.css';
import '@fontsource/inter/900.css';
import '@fontsource/space-grotesk/700.css';
import {LogoMark, Wordmark} from '../components/UI';
import {prog, pop, EXPO} from '../components/anim';
import {StudioBg, Dust, Kinetic} from './MotionChatPub';
import P0 from './p3d.json';

// Growthity ad « le boulanger » : 3D animated short (Kling 4 multi-shot) + storyteller VO + end card.
type Word = {w: string; s: number; e: number};
export type P3DCfg = {vo: Record<string, {at: number; words: Word[]}>; videoFrames: number; total: number; video: string; voPrefix: string; bed: string;
  stickers: {text: string; from: number; to: number; y: number; rot?: number; big?: boolean}[]; blur: {from: number; top: number; height: number} | null};
export const P3D_DEFAULT = P0 as unknown as P3DCfg;
const GRAD = 'linear-gradient(120deg, #2563EB 0%, #5B3FE4 52%, #9333EA 100%)';
const GRAD_TXT = 'linear-gradient(100deg, #8FA6FF 0%, #A78BFF 45%, #E39BFF 100%)';
const FONT = 'Inter, system-ui, sans-serif';
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

const useFonts = () => {
  const [h] = useState(() => delayRender('fonts'));
  useEffect(() => {
    Promise.all(['700 20px Inter', '800 20px Inter', '900 20px Inter', '700 20px "Space Grotesk"'].map((s) => document.fonts.load(s))).then(() => continueRender(h));
  }, [h]);
};

const Sticker: React.FC<{text: string; from: number; to: number; y: number; rot?: number; big?: boolean}> = ({text, from, to, y, rot = -3, big}) => {
  const f = useCurrentFrame();
  if (f < from || f > to) return null;
  const p = pop(f, from, 10);
  const o = interpolate(f, [to - 6, to], [1, 0], clamp);
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: y, display: 'flex', justifyContent: 'center', opacity: o}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 14, padding: big ? '34px 48px' : '18px 32px', borderRadius: 999, backgroundImage: GRAD, color: '#fff', fontFamily: FONT, fontWeight: 900, fontSize: big ? 60 : 50, transform: `scale(${p}) rotate(${rot * (2 - p)}deg)`, boxShadow: '0 20px 50px -14px rgba(91,63,228,0.9)'}}>
        {text}
      </div>
    </div>
  );
};

const Film: React.FC<{cfg: P3DCfg}> = ({cfg}) => {
  const f = useCurrentFrame();
  const z = 1.04 + f * 0.00012;
  return (
    <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
      <AbsoluteFill style={{transform: `scale(${z})`}}>
        <OffthreadVideo src={staticFile(cfg.video)} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      </AbsoluteFill>
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0.35) 0%, transparent 20%, transparent 60%, rgba(0,0,0,0.55) 100%)'}} />
      {cfg.blur && f >= cfg.blur.from && <div style={{position: 'absolute', left: 0, right: 0, top: cfg.blur.top, height: cfg.blur.height, backdropFilter: 'blur(22px)', WebkitBackdropFilter: 'blur(22px)', background: 'rgba(60,35,20,0.25)', maskImage: 'linear-gradient(180deg, transparent, #000 25%, #000 75%, transparent)', WebkitMaskImage: 'linear-gradient(180deg, transparent, #000 25%, #000 75%, transparent)', opacity: interpolate(f, [cfg.blur.from, cfg.blur.from + 12], [0, 1], clamp)}} />}
      {cfg.stickers.map((st, i) => <Sticker key={i} {...st} />)}
    </AbsoluteFill>
  );
};

const EndCard: React.FC<{d: number}> = ({d}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <StudioBg intensity={1.3} />
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', fontFamily: FONT}}>
        <div style={{width: 180, height: 180, borderRadius: 50, background: 'rgba(255,255,255,0.06)', border: '2px solid rgba(255,255,255,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${pop(f, 2, 12)})`, boxShadow: '0 40px 120px -30px rgba(101,82,232,0.9)'}}>
          <LogoMark size={100} draw={prog(f, 2, 18)} />
        </div>
        <div style={{marginTop: 44}}><Wordmark size={92} dark reveal={prog(f, 8, 16)} /></div>
        <div style={{marginTop: 50, fontFamily: '"Space Grotesk", Inter, sans-serif', fontWeight: 700, fontSize: 84, lineHeight: 1.05, color: '#fff', textAlign: 'center', letterSpacing: '-0.02em', opacity: prog(f, 30, 12), transform: `translateY(${(1 - prog(f, 30, 16)) * 30}px)`}}>
          Vos pubs vidéo,<br />
          <span style={{backgroundImage: GRAD_TXT, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>sans tournage.</span>
        </div>
        <div style={{marginTop: 60, display: 'flex', alignItems: 'center', gap: 16, padding: '26px 50px', borderRadius: 999, backgroundImage: GRAD, color: '#fff', fontSize: 42, fontWeight: 700, transform: `scale(${pop(f, 56, 12)})`, boxShadow: '0 24px 60px -16px rgba(91,63,228,0.9)'}}>
          Commencer · lien en bio
        </div>
      </AbsoluteFill>
      <Dust />
      <AbsoluteFill style={{background: '#000', opacity: interpolate(f, [d - 10, d], [0, 1], clamp)}} />
    </AbsoluteFill>
  );
};

export const Pub3D: React.FC<{cfg: P3DCfg}> = ({cfg}) => {
  useFonts();
  const f = useCurrentFrame();
  const VF = cfg.videoFrames;
  const VO = cfg.vo;
  const flash = Math.max(0, 1 - Math.abs(f - VF) / 4);
  return (
    <AbsoluteFill style={{background: '#0B0A0C'}}>
      <Sequence durationInFrames={VF}><Film cfg={cfg} /></Sequence>
      <Sequence from={VF}><EndCard d={cfg.total - VF} /></Sequence>
      {['1', '2', '3', '4'].map((k) => (
        <Kinetic key={k} words={VO[k].words} at={VO[k].at} y={1180} size={70} />
      ))}
      <AbsoluteFill style={{background: '#fff', opacity: flash * 0.5, pointerEvents: 'none'}} />
      {Object.values(VO).map((v, i) => (
        <Sequence key={i} from={v.at}><Audio src={staticFile(`voice/${cfg.voPrefix}-${i + 1}-n.mp3`)} /></Sequence>
      ))}
      <Audio src={staticFile(cfg.bed)} volume={0.9} />
    </AbsoluteFill>
  );
};
