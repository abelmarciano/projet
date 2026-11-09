import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Audio, continueRender, delayRender, Sequence, staticFile, useCurrentFrame} from 'remotion';
import '@fontsource/inter/500.css';
import '@fontsource/inter/700.css';
import '@fontsource/inter/800.css';
import '@fontsource/space-grotesk/600.css';
import '@fontsource/space-grotesk/700.css';
import {Clip} from '../components/Media';
import {LightBg, StudioBg} from '../components/Backgrounds';
import {prog, pop} from '../components/anim';
import {DISPLAY, FONT, GRAD, GRAD_PINK} from '../theme';
import {EndCard, Punch, PromptBox, R, SAFE_CX, gradText} from '../shorts/kit';
import REELS from './reels.json';

// 7 organic Reels (9:16) built from the account's own footage. No voice: on-screen text + music bed.
// Every actor used here appears in no other short.

type Reel = {id: string; kind: string; title: string; hook: string[]; tagline: string[]; bpm: number; [k: string]: any};
export const FPS = 30;

// scene plan (frames) per kind — also read by scripts/reels_audio.py through reels_timing.json
export const plan = (r: Reel): {name: string; dur: number}[] => {
  switch (r.kind) {
    case 'launch':
      return [{name: 'hook', dur: 66}, {name: 'c0', dur: 42}, {name: 'c1', dur: 42}, {name: 'c2', dur: 42}, {name: 'say', dur: 66}, {name: 'end', dur: 96}];
    case 'coulisses':
      return [{name: 'hook', dur: 54}, {name: 'prompt', dur: 120}, {name: 'clip', dur: r.clip === 'ugc-solaire.mp4' ? 150 : 222}, {name: 'end', dur: 90}];
    case 'casting':
      return [{name: 'hook', dur: 54}, {name: 'grid', dur: 66}, {name: 'p0', dur: 36}, {name: 'p1', dur: 36}, {name: 'p2', dur: 36}, {name: 'p3', dur: 36}, {name: 'end', dur: 90}];
    case 'hooks':
      return [{name: 'hook', dur: 54}, {name: 'h0', dur: 54}, {name: 'h1', dur: 54}, {name: 'h2', dur: 54}, {name: 'say', dur: 60}, {name: 'end', dur: 90}];
  }
  return [];
};
export const total = (r: Reel) => plan(r).reduce((a, s) => a + s.dur, 0);

const useFonts = () => {
  const [h] = useState(() => delayRender('fonts'));
  useEffect(() => {
    Promise.all(['500 20px Inter', '700 20px Inter', '800 20px Inter', '600 20px "Space Grotesk"', '700 20px "Space Grotesk"'].map((s) => document.fonts.load(s))).then(() => continueRender(h));
  }, [h]);
};

// big two-line statement, words rise in one by one
const Statement: React.FC<{lines: string[]; dark?: boolean; size?: number; accent?: number; y?: number}> = ({lines, dark = true, size = 118, accent = 1, y = 0}) => {
  const f = useCurrentFrame();
  return (
    <div style={{position: 'absolute', left: R.x - 20, width: R.w + 40, top: 0, bottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', transform: `translateY(${y}px)`}}>
      {lines.map((l, i) => {
        const p = prog(f, 3 + i * 9, 16);
        return (
          <div key={i} style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: size, lineHeight: 1.02, letterSpacing: '-0.04em', textAlign: 'center', color: dark ? '#fff' : '#0F172A', opacity: p, transform: `translateY(${(1 - p) * 40}px)`, ...(i === accent ? gradText(dark ? GRAD_PINK : GRAD) : {})}}>
            {l}
          </div>
        );
      })}
    </div>
  );
};

// caption block over footage
const Over: React.FC<{text: string; at?: number; y?: number; size?: number}> = ({text, at = 2, y = 1180, size = 68}) => {
  const f = useCurrentFrame();
  const p = pop(f, at, 13);
  return (
    <div style={{position: 'absolute', left: R.x - 30, width: R.w + 60, top: y, display: 'flex', justifyContent: 'center', transform: `scale(${p})`}}>
      <span style={{fontFamily: FONT, fontWeight: 800, fontSize: size, lineHeight: 1.12, color: '#0B0B10', background: '#fff', padding: '14px 28px', borderRadius: 22, textAlign: 'center', boxShadow: '0 20px 50px -20px rgba(0,0,0,0.6)'}}>{text}</span>
    </div>
  );
};

const Tag: React.FC<{children: React.ReactNode; at?: number; y?: number}> = ({children, at = 6, y = 300}) => {
  const f = useCurrentFrame();
  const p = prog(f, at, 14);
  return (
    <div style={{position: 'absolute', top: y, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: p, transform: `translateY(${(1 - p) * -20}px)`}}>
      <span style={{display: 'flex', alignItems: 'center', gap: 12, fontFamily: FONT, fontWeight: 700, fontSize: 30, color: '#fff', background: 'rgba(11,11,16,0.62)', backdropFilter: 'blur(10px)', padding: '12px 24px', borderRadius: 999}}>
        <span style={{width: 14, height: 14, borderRadius: 7, background: '#22C17A', boxShadow: '0 0 0 5px rgba(34,193,122,0.25)'}} />
        {children}
      </span>
    </div>
  );
};

const Full: React.FC<{src: string; from?: number; dim?: number; zoom?: boolean}> = ({src, from = 0, dim = 0, zoom = true}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{transform: zoom ? `scale(${1.04 + f * 0.0007})` : undefined}}>
      <Clip src={src} width="100%" height="100%" startFrom={from} />
      <AbsoluteFill style={{background: `linear-gradient(180deg, rgba(0,0,0,${0.25 + dim}) 0%, rgba(0,0,0,${dim}) 30%, rgba(0,0,0,${dim}) 55%, rgba(0,0,0,${0.55 + dim}) 100%)`}} />
    </AbsoluteFill>
  );
};

const Scene: React.FC<{r: Reel; name: string; dur: number}> = ({r, name, dur}) => {
  const f = useCurrentFrame();
  if (name === 'hook') return <StudioBg><Statement lines={r.hook} /></StudioBg>;
  if (name === 'end') return <EndCard dur={dur} tagline={<>{r.tagline[0]}<br /><span style={gradText(GRAD_PINK)}>{r.tagline[1]}</span></>} />;

  if (r.kind === 'launch') {
    if (name.startsWith('c')) {
      const i = Number(name.slice(1));
      return <AbsoluteFill><Full src={r.clips[i]} /><Over text={r.words[i]} at={1} y={1130} size={86} /></AbsoluteFill>;
    }
    if (name === 'say') return <LightBg><Statement lines={['Une phrase', 'suffit.']} dark={false} size={130} /></LightBg>;
  }

  if (r.kind === 'coulisses') {
    if (name === 'prompt') {
      const send = 92;
      const cps = Math.max(48, (r.prompt.length * 30) / 82);
      const up = prog(f, send, 16);
      return (
        <LightBg>
          <div style={{position: 'absolute', top: 360, left: 0, right: 0, textAlign: 'center', fontFamily: FONT, fontWeight: 700, fontSize: 36, color: '#64748B', opacity: prog(f, 0, 12)}}>Dans Growthity :</div>
          <div style={{position: 'absolute', left: R.x, top: 470, width: R.w, transform: `scale(${1 - up * 0.04})`}}>
            <PromptBox text={r.prompt} start={4} cps={cps} send={send} size={38} />
          </div>
          <div style={{position: 'absolute', top: 1060, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 14, opacity: up}}>
            {['Script', 'Acteur', 'Voix', 'Sous-titres'].map((t, i) => (
              <span key={t} style={{fontFamily: FONT, fontWeight: 700, fontSize: 28, color: '#0F172A', background: '#fff', border: '2px solid #E2E8F0', borderRadius: 999, padding: '10px 22px', transform: `scale(${pop(f, send + 4 + i * 4, 14)})`}}>{t}</span>
            ))}
          </div>
        </LightBg>
      );
    }
    if (name === 'clip') {
      return (
        <AbsoluteFill>
          <Full src={r.clip} />
          <Tag y={1330}>Vidéo générée · {r.niche}</Tag>
          <Over text="Aucun tournage." at={Math.round(dur * 0.55)} y={1200} size={64} />
        </AbsoluteFill>
      );
    }
  }

  if (r.kind === 'casting') {
    const W = 410, H = 560, gx = 20, gy = 20;
    const x0 = SAFE_CX - W - gx / 2, y0 = 360;
    const focus = name.startsWith('p') ? Number(name.slice(1)) : -1;
    if (focus >= 0) return <AbsoluteFill><Full src={r.clips[focus]} /><Tag at={0} y={1330}>{['Garagiste', 'Jouets & cadeaux', 'Mode & lifestyle', 'Immobilier · B2B'][focus]}</Tag></AbsoluteFill>;
    return (
      <StudioBg>
        {r.clips.map((c: string, i: number) => {
          const p = pop(f, 2 + i * 5, 14);
          return (
            <div key={c} style={{position: 'absolute', left: x0 + (i % 2) * (W + gx), top: y0 + Math.floor(i / 2) * (H + gy), transform: `scale(${p})`, borderRadius: 28, overflow: 'hidden', boxShadow: '0 30px 60px -30px rgba(0,0,0,0.8)'}}>
              <Clip src={c} width={W} height={H} />
            </div>
          );
        })}
        <div style={{position: 'absolute', top: 1540, left: 0, right: 0, textAlign: 'center', fontFamily: FONT, fontWeight: 700, fontSize: 40, color: '#fff', opacity: prog(f, 20, 14)}}>Le bon visage pour votre public.</div>
      </StudioBg>
    );
  }

  if (r.kind === 'hooks') {
    if (name.startsWith('h')) {
      const i = Number(name.slice(1));
      return (
        <AbsoluteFill>
          <Full src={r.clip} from={0} />
          <div style={{position: 'absolute', top: 300, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
            <span style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 44, color: '#fff', background: ['#5B3DF5', '#E0479E', '#0EA5E9'][i], borderRadius: 999, padding: '8px 26px'}}>Version {'ABC'[i]}</span>
          </div>
          <Over text={r.hooks[i]} at={2} y={1150} size={70} />
        </AbsoluteFill>
      );
    }
    if (name === 'say') return <LightBg><Statement lines={['Meta garde', 'celle qui retient.']} dark={false} size={104} /></LightBg>;
  }
  return null;
};

export const ReelComp: React.FC<{id: string; withAudio?: boolean}> = ({id, withAudio = true}) => {
  useFonts();
  const r = (REELS as Reel[]).find((x) => x.id === id) as Reel;
  let t = 0;
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {plan(r).map((s, i) => {
        const from = t;
        t += s.dur;
        return (
          <Sequence key={i} from={from} durationInFrames={s.dur}>
            <Punch strength={i === 0 ? 0 : 1}>
              <Scene r={r} name={s.name} dur={s.dur} />
            </Punch>
          </Sequence>
        );
      })}
      {withAudio && <Audio src={staticFile(`reels/${id}.wav`)} />}
    </AbsoluteFill>
  );
};

export const REEL_LIST = (REELS as Reel[]).map((r) => ({id: r.id, frames: total(r)}));
