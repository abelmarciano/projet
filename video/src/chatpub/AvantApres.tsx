import React from 'react';
import {AbsoluteFill, Audio, OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import '@fontsource/inter/800.css';
import '@fontsource/inter/900.css';
import {pop, prog, EXPO} from '../components/anim';
import {AdEdit, AdCfg} from './AdEdit';
import {EndCard} from './Pub3D';
import cfgJ from './avap.json';

// « Avant / Après » : the ad a founder films alone (raw, awkward) vs the same product ad made with Growthity (edited UGC).
type Cfg = {before: {src: string; from: number; to: number; stickers: {text: string; at: number; to: number; y: number; rot: number}[]}; after: AdCfg; tr: number; end: number};
const C = cfgJ as unknown as Cfg;
const GRAD = 'linear-gradient(120deg, #2563EB 0%, #5B3FE4 52%, #9333EA 100%)';
const FONT = 'Inter, system-ui, sans-serif';
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const BF = Math.round((C.before.to - C.before.from) * 30);
export const AV_TOTAL = BF + C.tr + C.after.frames + C.end;

const Label: React.FC<{text: string; bg: string; at?: number}> = ({text, bg, at = 0}) => {
  const f = useCurrentFrame();
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 230, display: 'flex', justifyContent: 'center'}}>
      <div style={{padding: '16px 30px', borderRadius: 999, background: bg, color: '#fff', fontFamily: FONT, fontWeight: 900, fontSize: 46, letterSpacing: '.02em', transform: `scale(${pop(f, at, 12)})`, boxShadow: '0 18px 44px -14px rgba(0,0,0,.55)'}}>{text}</div>
    </div>
  );
};

const Before: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <OffthreadVideo src={staticFile(C.before.src)} startFrom={Math.round(C.before.from * 30)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      <AbsoluteFill style={{boxShadow: 'inset 0 0 220px rgba(0,0,0,.55)'}} />
      <Label text="AVANT · la pub faite seul 😬" bg="#E5432F" />
      {C.before.stickers.map((s, i) => {
        if (f < s.at || f > s.to) return null;
        const o = interpolate(f, [s.to - 6, s.to], [1, 0], clamp);
        return (
          <div key={i} style={{position: 'absolute', left: 0, right: 0, top: s.y, display: 'flex', justifyContent: 'center', opacity: o}}>
            <div style={{padding: '14px 26px', borderRadius: 16, background: '#fff', color: '#17161D', fontFamily: FONT, fontWeight: 800, fontSize: 44, transform: `scale(${pop(f, s.at, 12)}) rotate(${s.rot}deg)`, boxShadow: '0 16px 40px -12px rgba(0,0,0,.6)'}}>{s.text}</div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

const Transition: React.FC<{d: number}> = ({d}) => {
  const f = useCurrentFrame();
  const p = prog(f, 0, 14);
  const out = interpolate(f, [d - 8, d], [1, 0], clamp);
  return (
    <AbsoluteFill style={{background: GRAD, alignItems: 'center', justifyContent: 'center', opacity: out}}>
      <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 92, lineHeight: 1.05, color: '#fff', textAlign: 'center', letterSpacing: '-.03em', transform: `scale(${0.8 + p * 0.2}) translateY(${(1 - p) * 40}px)`, opacity: p}}>
        Le même produit,<br />avec Growthity ✨
      </div>
    </AbsoluteFill>
  );
};

export const AvantApres: React.FC = () => {
  const f = useCurrentFrame();
  const aStart = BF + C.tr;
  const flash = Math.max(0, 1 - Math.abs(f - BF) / 4, 1 - Math.abs(f - aStart) / 4);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Sequence durationInFrames={BF}><Before /></Sequence>
      <Sequence from={BF} durationInFrames={C.tr}><Transition d={C.tr} /></Sequence>
      <Sequence from={aStart} durationInFrames={C.after.frames}>
        <AdEdit cfg={C.after} />
        <Label text="APRÈS · avec Growthity ✨" bg={GRAD} at={2} />
      </Sequence>
      <Sequence from={aStart + C.after.frames}><EndCard d={C.end} /></Sequence>
      <AbsoluteFill style={{background: '#fff', opacity: flash * 0.6, pointerEvents: 'none'}} />
      <Audio src={staticFile('chatpub/avap-sfx.wav')} />
    </AbsoluteFill>
  );
};
