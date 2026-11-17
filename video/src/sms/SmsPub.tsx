// « C'est ta boutique dans cette pub ??? » — pub Growthity en conversation SMS, mode clair (9:16).
// Notification sur l'écran verrouillé → conversation : Julie envoie la vraie pub (Malik, barbier) → échange rapide
// (agence ? monteur ? → « Une phrase dans Growthity. ») → aperçu du lien → « Ta prochaine pub tient en une phrase. » + Commencer.
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
const C = CFG as {clip: string; ad: {from: number; to: number}; caps: Word[]};
const INK = '#0B0A1F';
const GRAD = 'linear-gradient(135deg, #3B6CF6 0%, #5B3FE4 55%, #8B3FE8 100%)';
const FONT = 'Inter, system-ui, sans-serif';
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const sp = (f: number, d = 13, m = 0.6) => spring({frame: f, fps: 30, config: {damping: d, mass: m, stiffness: 200}});

type Msg = {me: boolean; at: number; t?: string; kind?: 'video' | 'growthity' | 'link'; h: number; typing?: number; punch?: boolean};
const RATE = 1.15; // pub légèrement accélérée
const VID_H = 900;
export const MSGS: Msg[] = [
  {me: false, at: 26, kind: 'video', h: VID_H + 20},
  {me: false, at: 104, t: 'Attends… c’est toi qui l’as faite\u00a0??', h: 120, typing: 6},
  {me: true, at: 116, t: 'Oui.', h: 110},
  {me: false, at: 128, t: 'T’as payé une agence ?', h: 110, typing: 4},
  {me: true, at: 138, t: 'Non.', h: 110},
  {me: false, at: 148, t: 'Un monteur ?', h: 110, typing: 4},
  {me: true, at: 158, t: 'Non plus.', h: 110},
  {me: false, at: 170, t: 'MAIS COMMENT', h: 110, typing: 4, punch: true},
  {me: true, at: 186, kind: 'growthity', t: 'Une phrase dans Growthity.', h: 130, typing: 10, punch: true},
  {me: false, at: 198, t: 'attends QUOI', h: 110, typing: 4, punch: true},
  {me: true, at: 212, t: 'Et elle tourne déjà sur Insta et Facebook.', h: 180},
  {me: false, at: 226, t: 'envoie le lien stp', h: 110, typing: 4},
  {me: true, at: 238, kind: 'link', h: 420},
];
export const T = {lock: 0, open: 22, zoom: 262, end: 274, total: 364};
export const VO = {1: T.end + 6} as Record<number, number>;
const TOP = 230, BOTTOM = 1400, GAP = 18;

const useFonts = () => {
  const [h] = useState(() => delayRender('fonts'));
  useEffect(() => {
    Promise.all(['600 20px Inter', '700 20px Inter', '800 20px Inter', '900 20px Inter'].map((s) => document.fonts.load(s))).then(() => continueRender(h));
  }, [h]);
};

// ---------- écran verrouillé ----------
const Lock: React.FC = () => {
  const f = useCurrentFrame();
  const n1 = sp(f - 3, 12), n2 = sp(f - 11, 12);
  const tap = f >= 17 && f < 21;
  const out = prog(f, T.open - 4, 6, INOUT);
  const Notif: React.FC<{p: number; top: number; title: string; text: string}> = ({p, top, title, text}) => (
    <div style={{position: 'absolute', left: 40, right: 40, top, padding: '26px 28px', borderRadius: 36, background: 'rgba(255,255,255,0.86)', backdropFilter: 'blur(20px)', boxShadow: '0 30px 60px -30px rgba(11,10,31,0.45)', display: 'flex', gap: 20, alignItems: 'flex-start', transform: `translateY(${(1 - p) * -260}px) scale(${tap && top < 600 ? 0.97 : 1})`, opacity: Math.min(1, p * 1.5)}}>
      <div style={{width: 84, height: 84, borderRadius: 22, background: 'linear-gradient(160deg,#5FE07A,#22B24C)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
        <svg width="50" height="50" viewBox="0 0 24 24"><path d="M12 4C7 4 3 7.2 3 11.2c0 2.3 1.3 4.3 3.4 5.6L5.6 20l3.6-2c.9.2 1.8.3 2.8.3 5 0 9-3.2 9-7.2S17 4 12 4z" fill="#fff" /></svg>
      </div>
      <div style={{flex: 1}}>
        <div style={{display: 'flex', justifyContent: 'space-between', fontFamily: FONT, fontSize: 30}}><span style={{fontWeight: 800, color: INK}}>{title}</span><span style={{fontWeight: 600, color: '#6B6880'}}>maintenant</span></div>
        <div style={{fontFamily: FONT, fontWeight: 700, fontSize: 40, color: INK, marginTop: 6, lineHeight: 1.2}}>{text}</div>
      </div>
    </div>
  );
  return (
    <AbsoluteFill style={{background: 'linear-gradient(170deg, #C9C3FF 0%, #F3D3F0 45%, #FFE2CC 100%)', opacity: 1 - out, transform: `scale(${1 + out * 0.15})`}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 170, textAlign: 'center', fontFamily: FONT, color: '#fff', textShadow: '0 4px 30px rgba(80,60,160,0.35)'}}>
        <div style={{fontWeight: 600, fontSize: 40}}>lundi 17 novembre</div>
        <div style={{fontWeight: 800, fontSize: 230, letterSpacing: '-0.04em', lineHeight: 1}}>21:47</div>
      </div>
      <Notif p={n1} top={560} title="Julie" text="C’EST TA BOUTIQUE DANS CETTE PUB ???" />
      <Notif p={n2} top={800} title="Julie" text="réponds !!" />
    </AbsoluteFill>
  );
};

// ---------- grain « filmé au téléphone » ----------
const Grain: React.FC<{f: number}> = ({f}) => (
  <svg width="100%" height="100%" style={{position: 'absolute', inset: 0, opacity: 0.16, mixBlendMode: 'overlay', pointerEvents: 'none'}}>
    <filter id={`g${f % 4}`}><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={f % 4} /></filter>
    <rect width="100%" height="100%" filter={`url(#g${f % 4})`} />
  </svg>
);

// ---------- conversation ----------
const Bubble: React.FC<{m: Msg; f: number}> = ({m, f}) => {
  const p = sp(f - m.at, 12, 0.5);
  const base: React.CSSProperties = {maxWidth: 800, padding: '24px 32px', borderRadius: 40, fontFamily: FONT, fontWeight: 600, fontSize: 46, lineHeight: 1.25, transform: `scale(${0.6 + 0.4 * p})`, transformOrigin: m.me ? 'right bottom' : 'left bottom', opacity: Math.min(1, p * 2)};
  if (m.kind === 'video') {
    const t = (Math.max(0, f - m.at) / 30) * RATE;
    const caps = C.caps.filter((w) => t >= w.s - 0.03 && t < w.e + 0.4).slice(-3);
    return (
      <div style={{...base, padding: 0, width: 506, height: VID_H, borderRadius: 40, overflow: 'hidden', position: 'relative', background: '#000'}}>
        <Sequence from={m.at} layout="none">
          <OffthreadVideo src={staticFile(C.clip)} startFrom={Math.round(C.ad.from * 30)} playbackRate={RATE} volume={(fr) => { const n = Math.round(((C.ad.to - C.ad.from) * 30) / RATE); return fr < n ? 1 : Math.max(0, 1 - (fr - n) / 5); }} style={{width: '100%', height: '100%', objectFit: 'cover', filter: 'saturate(0.88) contrast(1.06) brightness(1.02)', transform: `scale(1.06) translate(${Math.sin(f / 7) * 4}px, ${Math.cos(f / 9) * 5}px) rotate(${Math.sin(f / 11) * 0.4}deg)`}} />
        </Sequence>
        <Grain f={f} />
        <div style={{position: 'absolute', left: 20, top: 20, padding: '8px 16px', borderRadius: 99, background: 'rgba(0,0,0,0.45)', color: '#fff', fontSize: 22, fontWeight: 700}}>lafriperie.paris · Sponsorisé</div>
        <div style={{position: 'absolute', left: 20, right: 20, top: '66%', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 8}}>
          {caps.map((w, i) => <span key={`${w.s}`} style={{fontWeight: 900, fontSize: 44, textTransform: 'uppercase', color: '#fff', padding: '0 10px', borderRadius: 10, background: i === caps.length - 1 ? GRAD : 'transparent', textShadow: '0 4px 16px rgba(0,0,0,0.6)'}}>{w.w.replace(/[.,!?…]+$/, '')}</span>)}
        </div>
      </div>
    );
  }
  if (m.kind === 'link') {
    return (
      <div style={{...base, padding: 0, width: 660, borderRadius: 36, overflow: 'hidden', background: '#fff', border: '2px solid #E6E4F0', boxShadow: '0 30px 60px -30px rgba(46,32,140,0.4)'}}>
        <div style={{height: 260, background: GRAD, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18}}>
          <div style={{width: 110, height: 110, borderRadius: 30, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center'}}><LogoMark size={74} /></div>
        </div>
        <div style={{padding: '22px 28px'}}>
          <div style={{fontWeight: 800, fontSize: 38, color: INK}}>Growthity — Une phrase. Ta pub en ligne.</div>
          <div style={{fontWeight: 600, fontSize: 28, color: '#6B6880', marginTop: 6}}>growthity.ai</div>
        </div>
      </div>
    );
  }
  if (m.kind === 'growthity') {
    return (
      <div style={{...base, background: GRAD, color: '#fff', display: 'flex', alignItems: 'center', gap: 16}}>
        <span style={{width: 58, height: 58, borderRadius: 16, background: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}><LogoMark size={40} /></span>
        <span style={{fontWeight: 800}}>{m.t}</span>
      </div>
    );
  }
  return <div style={{...base, background: m.me ? GRAD : '#EEEDF3', color: m.me ? '#fff' : INK, fontWeight: m.t === 'MAIS COMMENT' ? 900 : 600}}>{m.t}</div>;
};

const Typing: React.FC<{me: boolean; f: number}> = ({me, f}) => (
  <div style={{display: 'flex', justifyContent: me ? 'flex-end' : 'flex-start', padding: '0 40px'}}>
    <div style={{display: 'flex', gap: 10, padding: '26px 30px', borderRadius: 40, background: me ? '#DCD5FB' : '#EEEDF3'}}>
      {[0, 1, 2].map((i) => <div key={i} style={{width: 18, height: 18, borderRadius: 9, background: '#8A87A0', transform: `translateY(${Math.sin(f / 3 + i) * 5}px)`, opacity: 0.6 + 0.4 * Math.sin(f / 3 + i)}} />)}
    </div>
  </div>
);

const Chat: React.FC = () => {
  const f = useCurrentFrame();
  const inP = prog(f, T.open, 8, EXPO);
  const shown = MSGS.filter((m) => f >= m.at);
  const typingMsg = MSGS.find((m) => m.typing && f >= m.at - m.typing && f < m.at);
  // positions et défilement automatique (le bas du contenu reste au-dessus de BOTTOM)
  const contentH = (k: number) => MSGS.slice(0, k).reduce((a, m) => a + m.h + GAP, 0);
  const target = (fr: number) => {
    const k = MSGS.filter((m) => fr >= m.at).length;
    const typ = MSGS.find((m) => m.typing && fr >= m.at - m.typing && fr < m.at) ? 120 : 0;
    return Math.max(0, TOP + contentH(k) + typ - BOTTOM);
  };
  // lissage : moyenne du défilement visé sur les 5 dernières images
  const off = [0, 1, 2].reduce((a, d) => a + target(f - d), 0) / 3;
  const lastPunch = MSGS.filter((m) => m.punch && f >= m.at).pop();
  const pk = lastPunch ? f - lastPunch.at : 99;
  const shake = pk < 8 ? Math.sin(pk * 3.3) * 14 * (1 - pk / 8) : 0;
  const punchS = pk < 8 ? 1 + 0.04 * (1 - pk / 8) : 1;
  const zoom = prog(f, T.zoom, 14, INOUT);
  return (
    <AbsoluteFill style={{background: '#fff', opacity: inP, transform: `scale(${(1.08 - 0.08 * inP) * punchS}) translate(${shake}px, ${shake * 0.4}px)`}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: TOP - off, opacity: 1 - zoom}}>
        {shown.map((m, i) => (
          <div key={i} style={{position: 'absolute', left: 0, right: 0, top: contentH(MSGS.indexOf(m)), display: 'flex', justifyContent: m.me ? 'flex-end' : 'flex-start', padding: '0 40px'}}>
            <Bubble m={m} f={f} />
          </div>
        ))}
        {typingMsg && <div style={{position: 'absolute', left: 0, right: 0, top: contentH(MSGS.indexOf(typingMsg))}}><Typing me={typingMsg.me} f={f} /></div>}
      </div>
      {/* en-tête */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 210, background: '#FFFFFF', borderBottom: '2px solid #F0EFF4', display: 'flex', alignItems: 'flex-end', padding: '0 40px 26px', gap: 22, boxSizing: 'border-box'}}>
        <svg width="36" height="56" viewBox="0 0 12 20"><path d="M10 2L2 10l8 8" stroke="#5B3FE4" strokeWidth={2.4} fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
        <div style={{width: 90, height: 90, borderRadius: 45, background: 'linear-gradient(135deg,#FF9AB8,#FF6B9A)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, fontWeight: 800, fontSize: 42, color: '#fff'}}>J</div>
        <div>
          <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 44, color: INK}}>Julie</div>
          <div style={{fontFamily: FONT, fontWeight: 600, fontSize: 26, color: '#22A35A'}}>en ligne</div>
        </div>
      </div>
      {/* barre de saisie */}
      <div style={{position: 'absolute', left: 30, right: 30, top: 1440, height: 100, borderRadius: 50, border: '2px solid #E6E4F0', background: '#FAFAFC', display: 'flex', alignItems: 'center', padding: '0 36px', fontFamily: FONT, fontWeight: 600, fontSize: 36, color: '#A9A6B8'}}>Message</div>
    </AbsoluteFill>
  );
};

// ---------- le lien qui s'ouvre → fin ----------
const End: React.FC = () => {
  const f = useCurrentFrame(); // local depuis T.zoom
  const big = prog(f, 0, 16, INOUT);
  const w1 = WD['sms-1'];
  const ta = VO[1] - T.zoom + Math.round((w1.find((w) => w.w.toLowerCase().startsWith('ta'))?.s ?? 1) * 30);
  const a = sp(f - ta + 2, 12), b = sp(f - ta - 8, 12);
  const cta = sp(f - ta - 22, 12);
  return (
    <AbsoluteFill style={{background: '#fff'}}>
      <div style={{position: 'absolute', left: interpolate(big, [0, 1], [380, 0]), right: interpolate(big, [0, 1], [40, 0]), top: interpolate(big, [0, 1], [980, 0]), height: interpolate(big, [0, 1], [260, 760]), background: GRAD, borderRadius: interpolate(big, [0, 1], [36, 0]), display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 24, padding: '26px 44px', borderRadius: 40, background: '#fff', transform: `scale(${0.6 + 0.4 * big})`}}>
          <LogoMark size={90} /><Wordmark size={84} />
        </div>
      </div>
      <div style={{position: 'absolute', left: 60, right: 60, top: 870, textAlign: 'center', fontFamily: FONT, fontWeight: 900, letterSpacing: '-0.045em', lineHeight: 1.02, color: INK}}>
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
