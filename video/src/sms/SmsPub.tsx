// « C'est ta boutique dans cette pub ??? » — pub Growthity en conversation SMS, mode clair (9:16).
// Notification → conversation en écran partagé : en haut, la pub d'Anaïs (montage viral : coupes, zooms, sous-titres)
// qui continue de jouer pendant que les messages défilent en bas → « Une phrase dans Growthity. » → lien → fin.
import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Audio, OffthreadVideo, Sequence, continueRender, delayRender, interpolate, spring, staticFile, useCurrentFrame} from 'remotion';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/inter/800.css';
import '@fontsource/inter/900.css';
import {LogoMark, Wordmark} from '../components/UI';
import {EXPO, INOUT, prog} from '../components/anim';
import WORDS from './words.json';
import CFG from './sms.json';

type Word = {w: string; s: number; e: number};
const WD = WORDS as Record<string, Word[]>;
const C = CFG as unknown as {clip: string; dur: number; cuts: number[]; caps: Word[]};
const INK = '#0B0A1F';
const GRAD = 'linear-gradient(135deg, #3B6CF6 0%, #5B3FE4 55%, #8B3FE8 100%)';
const FONT = 'Inter, system-ui, sans-serif';
const sp = (f: number, d = 13, m = 0.6) => spring({frame: f, fps: 30, config: {damping: d, mass: m, stiffness: 200}});

type Msg = {me: boolean; at: number; t?: string; kind?: 'growthity' | 'link'; h: number; typing?: number};
export const VID_AT = 44; // la vidéo arrive
const VID_F = Math.round(C.dur * 30);
export const MSGS: Msg[] = [
  {me: false, at: 104, t: 'Attends… c’est toi qui l’as faite ??', h: 150, typing: 8},
  {me: true, at: 124, t: 'Oui.', h: 116},
  {me: false, at: 140, t: 'T’as payé une agence ?', h: 116, typing: 6},
  {me: true, at: 154, t: 'Non.', h: 116},
  {me: false, at: 168, t: 'Un monteur ?', h: 116, typing: 6},
  {me: true, at: 182, t: 'Non plus.', h: 116},
  {me: false, at: 198, t: 'MAIS COMMENT', h: 116, typing: 6},
  {me: true, at: 224, kind: 'growthity', t: 'Une phrase dans Growthity.', h: 130, typing: 14},
  {me: false, at: 248, t: 'attends QUOI', h: 116, typing: 6},
  {me: true, at: 266, t: 'Et elle tourne déjà sur Insta et Facebook.', h: 190},
  {me: false, at: 292, t: 'envoie le lien stp', h: 116, typing: 8},
  {me: true, at: 312, kind: 'link', h: 330},
];
export const T = {lock: 0, open: 36, zoom: 352, end: 366, total: 456};
export const VO = {1: T.end + 6} as Record<number, number>;
const HEAD = 190;
const PANEL = {top: HEAD, h: 760};
const TOP = PANEL.top + PANEL.h + 30, BOTTOM = 1410, GAP = 16;

const useFonts = () => {
  const [h] = useState(() => delayRender('fonts'));
  useEffect(() => {
    Promise.all(['600 20px Inter', '700 20px Inter', '800 20px Inter', '900 20px Inter'].map((s) => document.fonts.load(s))).then(() => continueRender(h));
  }, [h]);
};

// ---------- écran verrouillé ----------
const Notif: React.FC<{p: number; top: number; title: string; text: string; tap: boolean}> = ({p, top, title, text, tap}) => (
  <div style={{position: 'absolute', left: 40, right: 40, top, padding: '26px 28px', borderRadius: 36, background: 'rgba(255,255,255,0.88)', boxShadow: '0 30px 60px -30px rgba(11,10,31,0.45)', display: 'flex', gap: 20, alignItems: 'flex-start', transform: `translateY(${(1 - p) * -260}px) scale(${tap ? 0.97 : 1})`, opacity: Math.min(1, p * 1.5)}}>
    <div style={{width: 84, height: 84, borderRadius: 22, background: 'linear-gradient(160deg,#5FE07A,#22B24C)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
      <svg width="50" height="50" viewBox="0 0 24 24"><path d="M12 4C7 4 3 7.2 3 11.2c0 2.3 1.3 4.3 3.4 5.6L5.6 20l3.6-2c.9.2 1.8.3 2.8.3 5 0 9-3.2 9-7.2S17 4 12 4z" fill="#fff" /></svg>
    </div>
    <div style={{flex: 1}}>
      <div style={{display: 'flex', justifyContent: 'space-between', fontFamily: FONT, fontSize: 30}}><span style={{fontWeight: 800, color: INK}}>{title}</span><span style={{fontWeight: 600, color: '#6B6880'}}>maintenant</span></div>
      <div style={{fontFamily: FONT, fontWeight: 700, fontSize: 40, color: INK, marginTop: 6, lineHeight: 1.2}}>{text}</div>
    </div>
  </div>
);
const Lock: React.FC = () => {
  const f = useCurrentFrame();
  const n1 = sp(f - 6, 12), n2 = sp(f - 18, 12);
  const tap = f >= 28 && f < 32;
  const out = prog(f, T.open - 4, 8, INOUT);
  return (
    <AbsoluteFill style={{background: 'linear-gradient(170deg, #C9C3FF 0%, #F3D3F0 45%, #FFE2CC 100%)', opacity: 1 - out, transform: `scale(${1 + out * 0.15})`}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 170, textAlign: 'center', fontFamily: FONT, color: '#fff', textShadow: '0 4px 30px rgba(80,60,160,0.35)'}}>
        <div style={{fontWeight: 600, fontSize: 40}}>lundi 17 novembre</div>
        <div style={{fontWeight: 800, fontSize: 230, letterSpacing: '-0.04em', lineHeight: 1}}>21:47</div>
      </div>
      <Notif p={n1} top={560} title="Julie" text="C’EST TA BOUTIQUE DANS CETTE PUB ???" tap={tap} />
      <Notif p={n2} top={800} title="Julie" text="réponds !!" tap={false} />
    </AbsoluteFill>
  );
};

// ---------- la pub d'Anaïs, épinglée en haut ----------
const Grain: React.FC<{f: number}> = ({f}) => (
  <svg width="100%" height="100%" style={{position: 'absolute', inset: 0, opacity: 0.14, mixBlendMode: 'overlay', pointerEvents: 'none'}}>
    <filter id={`g${f % 4}`}><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={f % 4} /></filter>
    <rect width="100%" height="100%" filter={`url(#g${f % 4})`} />
  </svg>
);
const VideoPanel: React.FC = () => {
  const f = useCurrentFrame(); // absolu
  const lf = f - VID_AT;
  const t = lf / 30;
  const grow = prog(f, VID_AT + 4, 14, EXPO);
  const pin = {x: interpolate(grow, [0, 1], [40, 24]), y: interpolate(grow, [0, 1], [TOP, PANEL.top + 14]), w: interpolate(grow, [0, 1], [420, 1032]), h: interpolate(grow, [0, 1], [520, PANEL.h - 28])};
  const p = sp(lf, 12, 0.5);
  const lastCut = C.cuts.filter((c) => t >= c).pop() ?? -9;
  const sinceCut = (t - lastCut) * 30;
  const punch = sinceCut < 6 ? 1.08 - 0.08 * (sinceCut / 6) : 1;
  const flash = sinceCut < 4 ? 0.5 * (1 - sinceCut / 4) : 0;
  const groups: Word[][] = [];
  let g: Word[] = [];
  C.caps.forEach((w, i) => {
    const prev = C.caps[i - 1];
    if (g.length && (g.length >= 3 || /[.,!?…]$/.test(prev?.w ?? ''))) { groups.push(g); g = []; }
    g.push(w);
  });
  if (g.length) groups.push(g);
  const gi = groups.findIndex((gr, i) => t >= gr[0].s - 0.05 && t < (groups[i + 1]?.[0].s ?? gr[gr.length - 1].e + 0.4) - 0.05);
  const playing = lf < VID_F;
  if (lf < 0) return null;
  return (
    <div style={{position: 'absolute', left: pin.x, top: pin.y, width: pin.w, height: pin.h, borderRadius: 40, overflow: 'hidden', background: '#000', boxShadow: '0 30px 60px -30px rgba(11,10,31,0.5)', transform: `scale(${0.7 + 0.3 * p})`, transformOrigin: 'left top', opacity: Math.min(1, p * 2)}}>
      {playing ? (
        <Sequence from={VID_AT} layout="none">
          <OffthreadVideo src={staticFile(C.clip)} volume={(fr) => (fr < VID_F - 4 ? 1 : Math.max(0, (VID_F - fr) / 4))} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 30%', filter: 'saturate(0.9) contrast(1.06)', transform: `scale(${punch * 1.04}) translate(${Math.sin(f / 7) * 3}px, ${Math.cos(f / 9) * 4}px)`}} />
        </Sequence>
      ) : (
        <Sequence from={VID_AT + VID_F} layout="none">
          <OffthreadVideo muted src={staticFile(C.clip)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 30%', filter: 'saturate(0.9) contrast(1.06)', transform: `scale(1.04) translate(${Math.sin(f / 7) * 3}px, ${Math.cos(f / 9) * 4}px)`}} />
        </Sequence>
      )}
      <Grain f={f} />
      <AbsoluteFill style={{background: '#fff', opacity: playing ? flash : 0}} />
      <div style={{position: 'absolute', left: 24, top: 24, display: 'flex', alignItems: 'center', gap: 10, padding: '10px 18px 10px 10px', borderRadius: 99, background: 'rgba(0,0,0,0.45)', color: '#fff', fontFamily: FONT, fontWeight: 700, fontSize: 24}}>
        <span style={{width: 40, height: 40, borderRadius: 20, background: '#F4C95D', color: INK, fontWeight: 900, fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>LF</span>lafriperie.paris · Sponsorisé
      </div>
      {gi >= 0 && playing && (
        <div style={{position: 'absolute', left: 30, right: 30, bottom: 70, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0 18px'}}>
          {groups[gi].map((w, i) => {
            const on = t >= w.s - 0.03;
            const nx = groups[gi][i + 1];
            const act = on && (nx ? t < nx.s - 0.02 : t < w.e + 0.3);
            const pw = sp(Math.round((t - w.s) * 30), 9, 0.4);
            return <span key={i} style={{fontFamily: FONT, fontWeight: 900, fontSize: 88, letterSpacing: '-0.01em', textTransform: 'uppercase', color: act ? '#FFE14D' : '#fff', WebkitTextStroke: '3px #000', paintOrder: 'stroke fill', textShadow: '0 6px 0 #000', opacity: on ? 1 : 0, transform: `scale(${on ? 0.8 + 0.2 * pw : 0.8})`, display: 'inline-block'}}>{w.w.replace(/[.,!?…]+$/, '')}</span>;
          })}
        </div>
      )}
      <div style={{position: 'absolute', left: 24, right: 24, bottom: 24, height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.35)'}}>
        <div style={{width: `${Math.min(1, lf / VID_F) * 100}%`, height: '100%', borderRadius: 4, background: '#fff'}} />
      </div>
    </div>
  );
};

// ---------- conversation ----------
const Bubble: React.FC<{m: Msg; f: number}> = ({m, f}) => {
  const p = sp(f - m.at, 12, 0.5);
  const base: React.CSSProperties = {maxWidth: 820, padding: '24px 34px', borderRadius: 42, fontFamily: FONT, fontWeight: 700, fontSize: 50, lineHeight: 1.22, transform: `scale(${0.6 + 0.4 * p}) translateY(${(1 - p) * 20}px)`, transformOrigin: m.me ? 'right bottom' : 'left bottom', opacity: Math.min(1, p * 2)};
  if (m.kind === 'link') {
    return (
      <div style={{...base, padding: 0, width: 700, borderRadius: 36, overflow: 'hidden', background: '#fff', border: '2px solid #E6E4F0', boxShadow: '0 30px 60px -30px rgba(46,32,140,0.4)', display: 'flex'}}>
        <div style={{width: 200, background: GRAD, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <div style={{width: 110, height: 110, borderRadius: 30, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center'}}><LogoMark size={74} /></div>
        </div>
        <div style={{padding: '26px 28px', flex: 1}}>
          <div style={{fontWeight: 800, fontSize: 38, color: INK, lineHeight: 1.2}}>Growthity — Une phrase. Ta pub en ligne.</div>
          <div style={{fontWeight: 600, fontSize: 28, color: '#6B6880', marginTop: 8}}>growthity.ai</div>
        </div>
      </div>
    );
  }
  if (m.kind === 'growthity') {
    return (
      <div style={{...base, background: GRAD, color: '#fff', display: 'flex', alignItems: 'center', gap: 16, boxShadow: '0 20px 40px -16px rgba(91,63,228,0.8)'}}>
        <span style={{width: 60, height: 60, borderRadius: 16, background: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}><LogoMark size={42} /></span>
        <span style={{fontWeight: 900, fontSize: 44, whiteSpace: 'nowrap'}}>{m.t}</span>
      </div>
    );
  }
  return <div style={{...base, background: m.me ? GRAD : '#EEEDF3', color: m.me ? '#fff' : INK, fontWeight: m.t === 'MAIS COMMENT' || m.t === 'attends QUOI' ? 900 : 700}}>{m.t}</div>;
};

const Typing: React.FC<{me: boolean; f: number}> = ({me, f}) => (
  <div style={{display: 'flex', justifyContent: me ? 'flex-end' : 'flex-start', padding: '0 36px'}}>
    <div style={{display: 'flex', gap: 10, padding: '28px 32px', borderRadius: 42, background: me ? '#DCD5FB' : '#EEEDF3'}}>
      {[0, 1, 2].map((i) => <div key={i} style={{width: 18, height: 18, borderRadius: 9, background: '#8A87A0', transform: `translateY(${Math.sin(f / 2.5 + i) * 6}px)`}} />)}
    </div>
  </div>
);

const Chat: React.FC = () => {
  const f = useCurrentFrame();
  const inP = prog(f, T.open, 12, EXPO);
  const shown = MSGS.filter((m) => f >= m.at);
  const typingMsg = MSGS.find((m) => m.typing && f >= m.at - m.typing && f < m.at);
  const contentH = (k: number) => MSGS.slice(0, k).reduce((a, m) => a + m.h + GAP, 0);
  const target = (fr: number) => {
    const k = MSGS.filter((m) => fr >= m.at).length;
    const typ = MSGS.find((m) => m.typing && fr >= m.at - m.typing && fr < m.at) ? 130 : 0;
    return Math.max(0, TOP + contentH(k) + typ - BOTTOM);
  };
  const off = [0, 1, 2, 3].reduce((a, d) => a + target(f - d), 0) / 4;
  const zoom = prog(f, T.zoom, 14, INOUT);
  const juliaTyping = MSGS.some((m) => m.typing && !m.me && f >= m.at - m.typing && f < m.at);
  return (
    <AbsoluteFill style={{background: '#fff', opacity: inP, transform: `scale(${1.08 - 0.08 * inP})`}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: TOP - off, opacity: 1 - zoom}}>
        {shown.map((m, i) => (
          <div key={i} style={{position: 'absolute', left: 0, right: 0, top: contentH(MSGS.indexOf(m)), display: 'flex', justifyContent: m.me ? 'flex-end' : 'flex-start', padding: '0 36px'}}>
            <Bubble m={m} f={f} />
          </div>
        ))}
        {typingMsg && <div style={{position: 'absolute', left: 0, right: 0, top: contentH(MSGS.indexOf(typingMsg))}}><Typing me={typingMsg.me} f={f} /></div>}
      </div>
      {/* fond blanc derrière la vidéo pour masquer les messages qui remontent */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: TOP - 14, background: '#fff', opacity: f >= VID_AT + 10 ? 1 : 0}} />
      <div style={{opacity: 1 - zoom}}><VideoPanel /></div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: HEAD, background: '#fff', borderBottom: '2px solid #F0EFF4', display: 'flex', alignItems: 'flex-end', padding: '0 36px 22px', gap: 20, boxSizing: 'border-box'}}>
        <svg width="34" height="54" viewBox="0 0 12 20"><path d="M10 2L2 10l8 8" stroke="#5B3FE4" strokeWidth={2.4} fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
        <div style={{width: 86, height: 86, borderRadius: 43, background: 'linear-gradient(135deg,#FF9AB8,#FF6B9A)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, fontWeight: 800, fontSize: 40, color: '#fff'}}>J</div>
        <div style={{flex: 1}}>
          <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 42, color: INK}}>Julie</div>
          <div style={{fontFamily: FONT, fontWeight: 600, fontSize: 26, color: '#22A35A'}}>{juliaTyping ? 'écrit…' : 'en ligne'}</div>
        </div>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none"><path d="M4 7h11v10H4zM15 10l5-3v10l-5-3" stroke="#5B3FE4" strokeWidth={1.8} strokeLinejoin="round" /></svg>
        <svg width="44" height="44" viewBox="0 0 24 24" fill="none" style={{marginLeft: 14}}><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" stroke="#5B3FE4" strokeWidth={1.8} strokeLinejoin="round" /></svg>
      </div>
    </AbsoluteFill>
  );
};

// ---------- le lien qui s'ouvre → fin ----------
const End: React.FC = () => {
  const f = useCurrentFrame();
  const big = prog(f, 0, 16, INOUT);
  const w1 = WD['sms-1'];
  const ta = VO[1] - T.zoom + Math.round((w1.find((w) => w.w.toLowerCase().startsWith('ta'))?.s ?? 1) * 30);
  const a = sp(f - ta + 2, 12), b = sp(f - ta - 8, 12);
  const cta = sp(f - ta - 22, 12);
  return (
    <AbsoluteFill style={{background: '#fff'}}>
      <div style={{position: 'absolute', left: interpolate(big, [0, 1], [330, 0]), right: interpolate(big, [0, 1], [36, 0]), top: interpolate(big, [0, 1], [1080, 0]), height: interpolate(big, [0, 1], [330, 760]), background: GRAD, borderRadius: interpolate(big, [0, 1], [36, 0]), display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 24, padding: '26px 44px', borderRadius: 40, background: '#fff', transform: `scale(${0.6 + 0.4 * big})`}}>
          <LogoMark size={90} /><Wordmark size={84} />
        </div>
      </div>
      <div style={{position: 'absolute', left: 40, right: 40, top: 870, textAlign: 'center', fontFamily: FONT, fontWeight: 900, letterSpacing: '-0.045em', lineHeight: 1.02, color: INK}}>
        <div style={{fontSize: 90, whiteSpace: 'nowrap', opacity: a, transform: `translateY(${(1 - a) * 40}px)`}}>Ta prochaine pub</div>
        <div style={{fontSize: 90, whiteSpace: 'nowrap', opacity: b, transform: `translateY(${(1 - b) * 40}px)`}}><span style={{backgroundImage: GRAD, WebkitBackgroundClip: 'text', color: 'transparent'}}>tient en une phrase.</span></div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1200, display: 'flex', justifyContent: 'center', opacity: Math.min(1, cta * 1.4), transform: `translateY(${(1 - cta) * 40}px)`}}>
        <div style={{padding: '32px 70px', borderRadius: 99, background: INK, color: '#fff', fontFamily: FONT, fontWeight: 900, fontSize: 44}}>Commencer →</div>
      </div>
    </AbsoluteFill>
  );
};

export const SmsPub: React.FC = () => {
  useFonts();
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: '#fff', fontFamily: FONT}}>
      {f < T.open + 10 && <Lock />}
      {f >= T.open - 4 && f < T.zoom + 16 && <Chat />}
      <Sequence from={T.zoom}><End /></Sequence>
      <Audio src={staticFile('sms/bed.wav')} />
      <Sequence from={VO[1]}><Audio src={staticFile('voice/sms-1-n.mp3')} /></Sequence>
    </AbsoluteFill>
  );
};
