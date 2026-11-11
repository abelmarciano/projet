import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame} from 'remotion';
import '@fontsource/inter/900.css';
import {prog} from '../components/anim';
import {Before} from './AvantApres2';
import {MotionChatPub, motionTimeline, Kinetic, StudioBg, Dust} from './MotionChatPub';
import {Img, interpolate} from 'remotion';
import {pop, EXPO} from '../components/anim';
import type {ChatPubCfg} from './ChatToAd';
import CP from './cp3.json';
import J from './avap2.json';

// Avant / après v3 : « faire sa pub seule » (Kling 4, sans le son de la vidéo) + voix off énergique (Audrey v4),
// puis l'après en motion design « Du chat à la pub » (choix de l'actrice → une phrase → génération → pub → publiée sur Meta).
type Word = {w: string; s: number; e: number};
const GRAD = 'linear-gradient(120deg, #2563EB 0%, #5B3FE4 52%, #9333EA 100%)';
const cp = CP as unknown as ChatPubCfg;
const MT = motionTimeline(cp as never);
const W = (J as unknown as {vo: Record<string, Word[]>}).vo;
void W;
import V from './avap3.json';
const VO = V as unknown as Record<string, Word[]>;
export const BEFORE3 = 486;
const TR = 44;
const PS = 58; // product scene
export const AV3_TOTAL = BEFORE3 + TR + (MT.total - MT.hookEnd) + PS;

const Tr: React.FC = () => {
  const f = useCurrentFrame();
  const p = prog(f, 0, 12);
  return (
    <AbsoluteFill style={{background: GRAD, alignItems: 'center', justifyContent: 'center'}}>
      <div style={{fontFamily: 'Inter, sans-serif', fontWeight: 900, fontSize: 116, color: '#fff', letterSpacing: '-.04em', textAlign: 'center', lineHeight: 1, transform: `scale(${0.7 + p * 0.3})`, opacity: p}}>Et avec<br />Growthity ?</div>
    </AbsoluteFill>
  );
};

const PWORDS = (V as unknown as Record<string, Word[]>)['av3-b1p'] ?? [];
const ProductScene: React.FC = () => {
  const f = useCurrentFrame();
  const inP = interpolate(f, [0, 18], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EXPO});
  const sel = f >= 26;
  const ring = pop(f, 26, 12);
  const card = (dx: number, sc: number, blur: number, op: number, main = false) => (
    <div style={{position: 'absolute', left: '50%', top: 420, width: 560 * sc, height: 700 * sc, marginLeft: -280 * sc + dx, borderRadius: 40 * sc, overflow: 'hidden', background: '#CFCFD4', filter: blur ? `blur(${blur}px)` : undefined, opacity: op,
      transform: main ? `perspective(1600px) rotateY(${(1 - inP) * 28}deg) scale(${0.86 + inP * 0.14})` : undefined,
      boxShadow: main ? `0 50px 120px -30px rgba(0,0,0,.8)${sel ? `, 0 0 0 ${6 * ring}px #8B7BFF, 0 0 80px rgba(139,123,255,${0.6 * ring})` : ''}` : undefined}}>
      <Img src={staticFile('media/chat/products/gel-lilimargo-gris.png')} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
    </div>
  );
  return (
    <AbsoluteFill>
      <StudioBg intensity={1.1} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 250, textAlign: 'center', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: 26, letterSpacing: '.22em', color: 'rgba(255,255,255,.55)'}}>CATALOGUE · VOS PRODUITS</div>
      {card(-470, 0.72, 10, 0.35 * inP)}{card(470, 0.72, 10, 0.35 * inP)}
      {card(0, 1, 0, inP, true)}
      {sel && <div style={{position: 'absolute', left: 0, right: 0, top: 1150, display: 'flex', justifyContent: 'center'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 14, padding: '16px 28px', borderRadius: 999, background: '#fff', fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: 38, color: '#0F172A', transform: `scale(${ring})`}}>
          <span style={{width: 40, height: 40, borderRadius: 99, background: 'linear-gradient(120deg,#2563EB,#5B3FE4 52%,#9333EA)', display: 'grid', placeItems: 'center'}}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg></span>
          Gel Corps Lili Margo
        </div></div>}
      <Dust o={0.6} />
      <Kinetic words={PWORDS} at={4} y={1500} size={80} />
    </AbsoluteFill>
  );
};

const VOS: [string, number][] = [['av3-a1', 6], ['av3-a2', 180], ['av3-a3', 272], ['av3-a4', 356]];
export const AvantApres3: React.FC = () => {
  const f = useCurrentFrame();
  const A = BEFORE3 + TR;
  const PA = A + MT.actorEnd - MT.hookEnd;
  const flash = Math.max(0, 1 - Math.abs(f - BEFORE3) / 4, 1 - Math.abs(f - A) / 4, 1 - Math.abs(f - PA) / 4, 1 - Math.abs(f - PA - PS) / 4);
  return (
    <AbsoluteFill style={{background: '#0B0A0C'}}>
      <Sequence durationInFrames={BEFORE3}><Before len={BEFORE3} /></Sequence>
      {VOS.map(([k, at]) => <Kinetic key={k} words={VO[k]} at={at} y={1180} size={64} />)}
      <Sequence from={BEFORE3} durationInFrames={TR}><Tr /></Sequence>
      <Sequence from={A} durationInFrames={MT.actorEnd - MT.hookEnd}><Sequence from={-MT.hookEnd}><MotionChatPub cfg={cp as never} /></Sequence></Sequence>
      <Sequence from={A + MT.actorEnd - MT.hookEnd} durationInFrames={PS}>
        <ProductScene />
        <Sequence from={4}><Audio src={staticFile('voice/av3-b1p-n.mp3')} /></Sequence>
        <Audio src={staticFile('chatpub/cp3-motion-bed.wav')} startFrom={MT.actorEnd} volume={0.9} />
      </Sequence>
      <Sequence from={A + MT.actorEnd - MT.hookEnd + PS}><Sequence from={-MT.actorEnd}><MotionChatPub cfg={cp as never} /></Sequence></Sequence>
      <AbsoluteFill style={{background: '#fff', opacity: flash * 0.55, pointerEvents: 'none'}} />
      {VOS.map(([k, at]) => <Sequence key={k} from={at}><Audio src={staticFile(`voice/${k}-n.mp3`)} /></Sequence>)}
      <Sequence from={BEFORE3 + 2}><Audio src={staticFile('voice/av3-tr-n.mp3')} /></Sequence>
      <Sequence durationInFrames={BEFORE3 + TR}><Audio src={staticFile('chatpub/av3-before-bed.wav')} /></Sequence>
    </AbsoluteFill>
  );
};
