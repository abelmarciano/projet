import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame} from 'remotion';
import '@fontsource/inter/900.css';
import {prog} from '../components/anim';
import {Before} from './AvantApres2';
import {MotionChatPub, motionTimeline, Kinetic} from './MotionChatPub';
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
export const AV3_TOTAL = BEFORE3 + TR + (MT.total - MT.hookEnd);

const Tr: React.FC = () => {
  const f = useCurrentFrame();
  const p = prog(f, 0, 12);
  return (
    <AbsoluteFill style={{background: GRAD, alignItems: 'center', justifyContent: 'center'}}>
      <div style={{fontFamily: 'Inter, sans-serif', fontWeight: 900, fontSize: 116, color: '#fff', letterSpacing: '-.04em', textAlign: 'center', lineHeight: 1, transform: `scale(${0.7 + p * 0.3})`, opacity: p}}>Et avec<br />Growthity ?</div>
    </AbsoluteFill>
  );
};

const VOS: [string, number][] = [['av3-a1', 6], ['av3-a2', 180], ['av3-a3', 272], ['av3-a4', 356]];
export const AvantApres3: React.FC = () => {
  const f = useCurrentFrame();
  const A = BEFORE3 + TR;
  const flash = Math.max(0, 1 - Math.abs(f - BEFORE3) / 4, 1 - Math.abs(f - A) / 4);
  return (
    <AbsoluteFill style={{background: '#0B0A0C'}}>
      <Sequence durationInFrames={BEFORE3}><Before len={BEFORE3} /></Sequence>
      {VOS.map(([k, at]) => <Kinetic key={k} words={VO[k]} at={at} y={1180} size={64} />)}
      <Sequence from={BEFORE3} durationInFrames={TR}><Tr /></Sequence>
      <Sequence from={A}><Sequence from={-MT.hookEnd}><MotionChatPub cfg={cp as never} /></Sequence></Sequence>
      <AbsoluteFill style={{background: '#fff', opacity: flash * 0.55, pointerEvents: 'none'}} />
      {VOS.map(([k, at]) => <Sequence key={k} from={at}><Audio src={staticFile(`voice/${k}-n.mp3`)} /></Sequence>)}
      <Sequence from={BEFORE3 + 2}><Audio src={staticFile('voice/av3-tr-n.mp3')} /></Sequence>
      <Sequence durationInFrames={BEFORE3 + TR}><Audio src={staticFile('chatpub/av3-before-bed.wav')} /></Sequence>
    </AbsoluteFill>
  );
};
