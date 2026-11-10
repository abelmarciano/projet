import React, {useEffect, useState} from 'react';
import {AbsoluteFill, OffthreadVideo, Sequence, continueRender, delayRender, interpolate, staticFile, useCurrentFrame} from 'remotion';
import '@fontsource/inter/800.css';
import '@fontsource/inter/900.css';
import {EXPO} from '../components/anim';

// Edit of a raw ad: silences cut (segments from scripts/ad_prepare.py), punch-in zooms on cuts and on
// long takes, quick transitions, word-by-word animated subtitles. Output is used as the ad in MotionChatPub.

type Word = {w: string; s: number; e: number};
export type AdCfg = {id: string; src: string; fps: number; segments: {from: number; to: number; zoom?: number; cy?: number}[]; words: Word[]; frames: number; subtitles?: boolean; subY?: number};

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const GRAD = 'linear-gradient(120deg, #2563EB 0%, #5B3FE4 52%, #9333EA 100%)';

const useFonts = () => {
  const [h] = useState(() => delayRender('fonts'));
  useEffect(() => {
    Promise.all(['800 20px Inter', '900 20px Inter'].map((s) => document.fonts.load(s))).then(() => continueRender(h));
  }, [h]);
};

// one segment with its own zoom rhythm
const Seg: React.FC<{src: string; startFrom: number; len: number; i: number; zoom?: number; cy?: number}> = ({src, startFrom, len, i, zoom, cy}) => {
  const f = useCurrentFrame();
  const base = zoom ?? (i % 2 ? 1.12 : 1.0); // jump-cut alternation (or forced crop)
  const punchIn = interpolate(f, [0, 7], [base + 0.08, base], {...clamp, easing: EXPO});
  // extra punch every ~2.6 s inside long takes
  const beat = 78;
  const k = Math.floor(f / beat);
  const local = f - k * beat;
  const inner = k > 0 && len - f > 20 ? interpolate(local, [0, 6], [k % 2 ? 0.07 : -0.05, 0], {...clamp, easing: EXPO}) + (k % 2 ? 0.07 : 0) : 0;
  const drift = f * 0.0006;
  const x = i % 3 === 1 ? -14 : i % 3 === 2 ? 14 : 0;
  return (
    <AbsoluteFill style={{overflow: 'hidden', background: '#000'}}>
      <AbsoluteFill style={{transform: `translateX(${zoom ? 0 : x}px) scale(${punchIn + inner + drift})`, transformOrigin: `50% ${(cy ?? 0.42) * 100}%`}}>
        <OffthreadVideo src={src} startFrom={startFrom} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Subs: React.FC<{words: Word[]; y: number}> = ({words, y}) => {
  const f = useCurrentFrame();
  const t = f / 30;
  const chunks: Word[][] = [];
  let cur: Word[] = [];
  words.forEach((w, i) => {
    cur.push(w);
    const next = words[i + 1];
    if (cur.length >= 3 || /[.,?!…:]$/.test(w.w) || (next && next.s - w.e > 0.25)) {
      chunks.push(cur);
      cur = [];
    }
  });
  if (cur.length) chunks.push(cur);
  const chunk = chunks.find((ch) => t >= ch[0].s - 0.05 && t <= ch[ch.length - 1].e + 0.15);
  if (!chunk) return null;
  const cin = interpolate(t, [chunk[0].s - 0.05, chunk[0].s + 0.08], [0, 1], clamp);
  return (
    <div style={{position: 'absolute', left: 50, right: 50, top: y, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '6px 16px', transform: `scale(${0.85 + cin * 0.15})`, opacity: cin}}>
      {chunk.map((w, i) => {
        const on = t >= w.s - 0.02;
        const hot = on && t <= w.e + 0.06;
        const p = interpolate(t, [w.s - 0.03, w.s + 0.07], [0, 1], clamp);
        return (
          <span key={i} style={{position: 'relative', display: 'inline-block', fontFamily: 'Inter, sans-serif', fontWeight: 900, fontSize: 78, lineHeight: 1.05, textTransform: 'uppercase', color: '#fff', WebkitTextStroke: '3px rgba(0,0,0,0.85)', paintOrder: 'stroke fill', textShadow: '0 6px 24px rgba(0,0,0,0.55)', opacity: on ? 1 : 0.55, transform: `translateY(${(1 - p) * 10}px) scale(${hot ? 1.08 : 1})`, padding: '2px 12px'}}>
            {hot && <span style={{position: 'absolute', inset: '4px -2px', borderRadius: 16, backgroundImage: GRAD, zIndex: -1, boxShadow: '0 10px 30px -8px rgba(91,63,228,0.9)'}} />}
            {w.w.replace(/[,.]$/, '')}
          </span>
        );
      })}
    </div>
  );
};

export const AdEdit: React.FC<{cfg: AdCfg}> = ({cfg}) => {
  useFonts();
  const f = useCurrentFrame();
  const src = cfg.src.startsWith('public/') ? staticFile(cfg.src.replace(/^public\//, '')) : staticFile(cfg.src);
  let acc = 0;
  const cuts: number[] = [];
  const seqs = cfg.segments.map((s, i) => {
    const len = Math.round((s.to - s.from) * cfg.fps);
    const from = acc;
    acc += len;
    if (i > 0) cuts.push(from);
    return (
      <Sequence key={i} from={from} durationInFrames={len}>
        <Seg src={src} startFrom={Math.round(s.from * cfg.fps)} len={len} i={i} zoom={s.zoom} cy={s.cy} />
      </Sequence>
    );
  });
  const flash = Math.max(0, ...cuts.map((c) => 1 - Math.abs(f - c) / 3));
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {seqs}
      <AbsoluteFill style={{background: '#fff', opacity: flash * 0.35, pointerEvents: 'none'}} />
      {cfg.subtitles !== false && <Subs words={cfg.words} y={cfg.subY ?? 1280} />}
    </AbsoluteFill>
  );
};
