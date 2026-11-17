// « Arrête le scroll » — pub Growthity rapide, mode clair (9:16, ~15,7 s).
// Fil fade qui défile vite → arrêt sec sur une vraie pub (Romane : « Stop ! ») → rafale « Une pub pour mon… » (chien, bijou, vélo…)
// → formats qui claquent + tampon « En ligne » → « Arrête le scroll. » + Growthity + « Commencer ». Aucun chiffre.
import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Audio, OffthreadVideo, Sequence, continueRender, delayRender, interpolate, random, spring, staticFile, useCurrentFrame} from 'remotion';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/inter/800.css';
import '@fontsource/inter/900.css';
import '@fontsource/space-grotesk/700.css';
import {LogoMark, Wordmark} from '../components/UI';
import {EXPO, INOUT, prog} from '../components/anim';
import WORDS from './words.json';

type Word = {w: string; s: number; e: number};
const WD = WORDS as Record<string, Word[]>;
const INK = '#0B0A1F';
const GRAD = 'linear-gradient(120deg, #2563EB 0%, #5B3FE4 52%, #9333EA 100%)';
const DISPLAY = '"Space Grotesk", Inter, sans-serif';
const FONT = 'Inter, system-ui, sans-serif';
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const sp = (f: number, d = 12, m = 0.7) => spring({frame: f, fps: 30, config: {damping: d, mass: m, stiffness: 180}});
const G: React.FC<{children: React.ReactNode}> = ({children}) => (
  <span style={{backgroundImage: GRAD, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent'}}>{children}</span>
);

export const VO = {1: 4, 2: 146, 3: 284, 4: 372} as Record<number, number>;
export const T = {stop: 44, full: 50, hero: 140, burst: 140, formats: 278, publish: 330, end: 366, total: 472};
const HERO = {src: 'media/chat/cafe-romane-raw.mp4', from: 0.45};
const BURST = [
  {w: 'chien', src: 'media/chat/friandises-sana-raw.mp4', from: 0.6, at: 152},
  {w: 'bijou', src: 'media/chat/trefle-noor-raw.mp4', from: 3.0, at: 184},
  {w: 'vélo', src: 'media/fal/velo/velo-raw.mp4', from: 0.5, at: 216},
];
const FLIPS = ['resto', 'salon', 'garage', 'appart', 'coach', 'café', 'tout'];
const FLIP_AT = 246;

const useFonts = () => {
  const [h] = useState(() => delayRender('fonts'));
  useEffect(() => {
    Promise.all(['700 20px Inter', '800 20px Inter', '900 20px Inter', '700 20px "Space Grotesk"'].map((s) => document.fonts.load(s))).then(() => continueRender(h));
  }, [h]);
};

// ---------- A. le fil fade ----------
const BORING = ['PROMO', 'NOUVEAU', 'SOLDES', 'OFFRE', 'PROMO', 'NOUVEAU', 'SOLDES', 'OFFRE', 'NOUVEAU', 'PROMO'];
const POST_H = 1180;
const Post: React.FC<{i: number; hero?: boolean}> = ({i, hero}) => (
  <div style={{height: POST_H, padding: '0 0 40px', boxSizing: 'border-box'}}>
    <div style={{display: 'flex', alignItems: 'center', gap: 16, padding: '0 50px', height: 90}}>
      <div style={{width: 58, height: 58, borderRadius: 29, background: hero ? GRAD : '#E4E3EA'}} />
      <div>
        <div style={{width: hero ? 0 : 200, height: 16, borderRadius: 8, background: '#E4E3EA'}} />
        {hero && <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 28, color: INK}}>brulerieardente <span style={{fontWeight: 600, color: '#8A87A0', fontSize: 24}}>· Sponsorisé</span></div>}
        <div style={{width: 120, height: 12, borderRadius: 6, background: '#EEEDF2', marginTop: 8, display: hero ? 'none' : 'block'}} />
      </div>
    </div>
    <div style={{height: 960, background: hero ? '#000' : ['#ECEBF1', '#E8E6EE', '#EFEEF3'][i % 3], display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden'}}>
      {!hero && (
        <div style={{textAlign: 'center'}}>
          <div style={{width: 260, height: 260, borderRadius: 30, background: '#DAD8E2', margin: '0 auto'}} />
          <div style={{marginTop: 40, fontFamily: FONT, fontWeight: 900, fontSize: 64, letterSpacing: '0.04em', color: '#B9B6C6'}}>{BORING[i % BORING.length]}</div>
        </div>
      )}
    </div>
    <div style={{display: 'flex', gap: 26, padding: '22px 50px'}}>
      {[0, 1, 2].map((k) => <div key={k} style={{width: 40, height: 40, borderRadius: 12, border: '4px solid #D3D1DC'}} />)}
    </div>
  </div>
);

const Feed: React.FC = () => {
  const f = useCurrentFrame();
  // défilement rapide qui freine d'un coup sur la 8e publication (la pub de Romane)
  const target = 7 * POST_H - 330;
  const y = interpolate(f, [0, T.stop - 6, T.stop], [0, target * 0.93, target], {...clamp, easing: (t) => t});
  const v = f < T.stop ? 1 : 0;
  return (
    <AbsoluteFill style={{background: '#FFFFFF', overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 0, transform: `translateY(${-y}px)`, filter: `blur(${v * 5}px)`}}>
        {Array.from({length: 9}, (_, i) => <Post key={i} i={i} hero={i === 7} />)}
      </div>
    </AbsoluteFill>
  );
};

// ---------- la pub qui arrête le scroll ----------
const HeroAd: React.FC = () => {
  const f = useCurrentFrame(); // local depuis T.stop
  const full = prog(f, T.full - T.stop, 10, EXPO);
  // le cadre média du post (y 420 → 1380) devient plein écran
  const top = interpolate(full, [0, 1], [330 + 90, 0]);
  const h = interpolate(full, [0, 1], [960, 1920]);
  const words = (WD['hero'] ?? []) as Word[];
  const at = (s: number) => Math.round((s - HERO.from) * 30);
  const stopAt = at(0.64);
  const stop = sp(f - stopAt, 8);
  const shake = f >= stopAt && f < stopAt + 10 ? Math.sin(f * 3) * 14 * (1 - (f - stopAt) / 10) : 0;
  const l1 = sp(f - at(1.64), 12), l2 = sp(f - at(2.52), 12);
  const out = prog(f, T.hero - T.stop - 6, 8, INOUT);
  void words;
  return (
    <AbsoluteFill style={{transform: `translate(${shake}px, ${shake * 0.4}px)`}}>
      <div style={{position: 'absolute', left: 0, right: 0, top, height: h, overflow: 'hidden', background: '#000'}}>
        <OffthreadVideo src={staticFile(HERO.src)} startFrom={Math.round(HERO.from * 30)} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${1 + 0.06 * prog(f, stopAt, 4) - 0.04 * prog(f, stopAt + 4, 20)})`}} />
      </div>
      {/* « Faite avec Growthity » */}
      <div style={{position: 'absolute', left: 50, top: 120, display: 'flex', alignItems: 'center', gap: 12, padding: '14px 24px 14px 16px', borderRadius: 99, background: '#FFFFFF', boxShadow: '0 20px 40px -20px rgba(0,0,0,0.6)', transform: `scale(${sp(f - 8, 11)})`, transformOrigin: 'left center'}}>
        <LogoMark size={36} />
        <span style={{fontFamily: FONT, fontWeight: 800, fontSize: 28, color: INK}}>Faite avec Growthity</span>
      </div>
      {/* STOP ! */}
      {f >= stopAt && f < at(1.6) && (
        <div style={{position: 'absolute', left: 0, right: 0, top: 820, textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 250, letterSpacing: '-0.04em', color: '#FFFFFF', textShadow: '0 12px 50px rgba(0,0,0,0.6)', transform: `scale(${2.2 - 1.2 * stop})`}}>STOP !</div>
      )}
      {f >= at(1.6) && (
        <div style={{position: 'absolute', left: 60, right: 60, top: 1080, textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 84, lineHeight: 1.05, letterSpacing: '-0.02em', color: '#FFFFFF', textTransform: 'uppercase', textShadow: '0 8px 30px rgba(0,0,0,0.7)'}}>
          <div style={{transform: `scale(${0.8 + 0.2 * l1})`, opacity: l1}}>Tu bois encore</div>
          <div style={{transform: `scale(${0.8 + 0.2 * l2})`, opacity: l2}}>du café en <span style={{padding: '0 14px', borderRadius: 14, background: GRAD, whiteSpace: 'nowrap'}}>capsule ?</span></div>
        </div>
      )}
      <AbsoluteFill style={{background: '#FFFFFF', opacity: out}} />
    </AbsoluteFill>
  );
};

// accroche du début, posée sur le fil
const HookText: React.FC = () => {
  const f = useCurrentFrame();
  const w = WD['scroll-1'];
  const a1 = VO[1] + Math.round(w[0].s * 30), a2 = VO[1] + Math.round(w[3].s * 30);
  const p1 = sp(f - a1, 11), p2 = sp(f - a2, 11);
  const out = prog(f, T.stop - 2, 4);
  return (
    <div style={{position: 'absolute', left: 50, right: 50, top: 170, padding: '34px 40px', borderRadius: 40, background: 'rgba(255,255,255,0.92)', boxShadow: '0 40px 80px -30px rgba(11,10,31,0.35)', fontFamily: FONT, fontWeight: 900, fontSize: 96, lineHeight: 1.0, letterSpacing: '-0.04em', color: INK, opacity: 1 - out, transform: `scale(${0.9 + 0.1 * p1})`}}>
      <div style={{opacity: p1}}>Dans le fil,</div>
      <div style={{opacity: p2, transform: `translateY(${(1 - p2) * 30}px)`}}>tu as <G>une seconde.</G></div>
    </div>
  );
};

// ---------- B. rafale ----------
const CARD = {w: 560, h: 996, top: 450};
const Burst: React.FC = () => {
  const f = useCurrentFrame();
  const inP = sp(f - T.burst, 12);
  const idx = BURST.reduce((a, b, i) => (f >= b.at ? i : a), 0);
  const flipI = f >= FLIP_AT ? Math.min(FLIPS.length - 1, Math.floor((f - FLIP_AT) / 4)) : -1;
  const word = flipI >= 0 ? FLIPS[flipI] : BURST[idx].w;
  const wordKey = flipI >= 0 ? 100 + flipI : idx;
  const wAt = flipI >= 0 ? FLIP_AT + flipI * 4 : BURST[idx].at;
  const wp = sp(f - wAt, 10, 0.5);
  const toFmt = prog(f, T.formats, 1);
  return (
    <AbsoluteFill style={{background: '#FFFFFF'}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 130, textAlign: 'center', fontFamily: FONT, fontWeight: 900, letterSpacing: '-0.04em', color: INK, opacity: (1 - toFmt) * Math.min(1, inP * 1.4), transform: `translateY(${(1 - inP) * 40}px)`}}>
        <div style={{fontSize: 84, lineHeight: 1}}>Une pub pour mon</div>
        <div style={{marginTop: 16, height: 150, position: 'relative'}}>
          <span key={wordKey} style={{display: 'inline-block', padding: '6px 36px 14px', borderRadius: 30, background: GRAD, color: '#fff', fontSize: 130, lineHeight: 1.05, transform: `translateY(${(1 - wp) * 60}px) scale(${0.85 + 0.15 * wp}) rotate(${(1 - wp) * -4}deg)`}}>{word}{flipI === FLIPS.length - 1 ? '.' : ''}</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// la carte vidéo : rafale puis formats puis tampon
const ClipCard: React.FC = () => {
  const f = useCurrentFrame();
  const inP = sp(f - T.burst - 2, 12);
  const idx = BURST.reduce((a, b, i) => (f >= b.at ? i : a), 0);
  // formats : 9:16 → 4:5 → 1:1
  const fm = [T.formats + 6, T.formats + 22, T.formats + 38];
  const step = fm.reduce((a, t, i) => (f >= t ? i + 1 : a), 0);
  const sizes = [{w: CARD.w, h: CARD.h}, {w: 560, h: 996}, {w: 760, h: 950}, {w: 820, h: 820}];
  const prev = sizes[Math.max(0, step - 1)], cur = sizes[step];
  const tp = step ? sp(f - fm[step - 1], 11, 0.6) : 1;
  const w = interpolate(tp, [0, 1], [prev.w, cur.w]);
  const h = interpolate(tp, [0, 1], [prev.h, cur.h]);
  const top = f >= T.formats ? 560 + (996 - h) / 2 - 40 : CARD.top;
  const labels = ['Reels · Story  9:16', 'Fil d’actualité  4:5', 'Carré  1:1'];
  const stampAt = T.publish + 10;
  const stamp = sp(f - stampAt, 9, 0.6);
  const btn = sp(f - T.publish, 12);
  const pressed = f >= T.publish + 6;
  const out = prog(f, T.end - 6, 8, INOUT);
  // whip entre les clips
  const whip = BURST.map((b) => interpolate(f, [b.at - 3, b.at, b.at + 4], [0, 1, 0], clamp)).reduce((a, x) => Math.max(a, x), 0);
  return (
    <AbsoluteFill style={{opacity: 1 - out, transform: `scale(${1 - out * 0.1})`}}>
      <div style={{position: 'absolute', left: 540 - w / 2, top, width: w, height: h, borderRadius: 44, overflow: 'hidden', background: '#000', boxShadow: '0 60px 120px -40px rgba(46,32,140,0.55)', transform: `translateY(${(1 - inP) * 300}px) rotate(${(1 - inP) * 6}deg)`, filter: `blur(${whip * 14}px)`}}>
        {BURST.map((b, i) => (
          <Sequence key={b.w} from={b.at - (i === 0 ? 14 : 0)} durationInFrames={i === BURST.length - 1 ? 9999 : BURST[i + 1].at - b.at + (i === 0 ? 14 : 0)} layout="none">
            <div style={{position: 'absolute', inset: 0, transform: `translateX(${interpolate(f, [b.at - 3, b.at + 3], [i === 0 ? 0 : 120, 0], clamp)}px)`}}>
              <OffthreadVideo muted src={staticFile(b.src)} startFrom={Math.round(b.from * 30)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 35%'}} />
            </div>
          </Sequence>
        ))}
        {idx >= 0 && f < T.formats && <div style={{position: 'absolute', left: 24, top: 24, padding: '10px 18px', borderRadius: 99, background: 'rgba(255,255,255,0.92)', fontFamily: FONT, fontWeight: 800, fontSize: 24, color: INK, display: 'flex', alignItems: 'center', gap: 8}}><LogoMark size={26} />Générée en une phrase</div>}
      </div>
      {/* étiquettes de format */}
      {f >= T.formats && f < T.publish && step > 0 && (
        <div key={step} style={{position: 'absolute', left: 0, right: 0, top: 300, textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 92, letterSpacing: '-0.04em', color: INK, transform: `scale(${0.8 + 0.2 * sp(f - fm[step - 1], 9)})`}}>{labels[step - 1]}</div>
      )}
      {/* publier → tampon */}
      {f >= T.publish && (
        <div style={{position: 'absolute', left: 0, right: 0, top: 300, display: 'flex', justifyContent: 'center', transform: `scale(${btn})`}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 16, padding: '28px 50px', borderRadius: 99, background: pressed ? INK : '#0866FF', color: '#fff', fontFamily: FONT, fontWeight: 900, fontSize: 48, transform: `scale(${f >= T.publish + 3 && f < T.publish + 7 ? 0.92 : 1})`}}>
            <svg width="62" height="38" viewBox="0 0 48 30" fill="none"><path d="M6 22 C6 12 10 5 15 5 C20 5 24 13 27 18 C30 23 32 25 35 25 C39 25 42 21 42 15 C42 9 39 5 35 5 C30 5 26 13 23 18 C20 23 18 25 14 25 C9 25 6 22 6 22 Z" stroke="#fff" strokeWidth={4} strokeLinecap="round" /></svg>
            {pressed ? 'Publiée sur Meta' : 'Publier sur Meta'}
          </div>
        </div>
      )}
      {f >= stampAt && (
        <div style={{position: 'absolute', left: 0, right: 0, top: 860, display: 'flex', justifyContent: 'center', transform: `rotate(-10deg) scale(${2.4 - 1.4 * stamp})`, opacity: Math.min(1, stamp * 2)}}>
          <div style={{padding: '18px 54px', border: '12px solid #16A34A', borderRadius: 28, color: '#16A34A', background: 'rgba(255,255,255,0.88)', fontFamily: FONT, fontWeight: 900, fontSize: 130, letterSpacing: '0.04em'}}>EN LIGNE</div>
        </div>
      )}
    </AbsoluteFill>
  );
};

// ---------- D. fin ----------
const End: React.FC = () => {
  const f = useCurrentFrame(); // local
  const w4 = WD['scroll-4'];
  const arr = VO[4] - T.end + Math.round((w4.find((w) => w.w.startsWith('arrête'))?.s ?? 1.74) * 30);
  const logo = sp(f - 2, 11);
  const a = sp(f - arr + 2, 9, 0.6), b = sp(f - arr - 6, 9, 0.6);
  const cta = sp(f - arr - 18, 11);
  return (
    <AbsoluteFill style={{background: '#FFFFFF'}}>
      <div style={{position: 'absolute', left: 540, top: 420, transform: `translate(-50%,-50%) scale(${logo})`, display: 'flex', alignItems: 'center', gap: 22}}>
        <div style={{width: 120, height: 120, borderRadius: 36, background: '#F1EFFB', display: 'flex', alignItems: 'center', justifyContent: 'center'}}><LogoMark size={80} draw={prog(f, 2, 16)} /></div>
        <Wordmark size={78} />
      </div>
      <div style={{position: 'absolute', left: 40, right: 40, top: 620, textAlign: 'center', fontFamily: FONT, fontWeight: 900, letterSpacing: '-0.055em', lineHeight: 0.92, color: INK}}>
        <div style={{fontSize: 236, transform: `scale(${1.8 - 0.8 * a})`, opacity: Math.min(1, a * 2)}}>Arrête</div>
        <div style={{fontSize: 172, transform: `scale(${1.8 - 0.8 * b})`, opacity: Math.min(1, b * 2)}}><G>le scroll.</G></div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1150, display: 'flex', justifyContent: 'center', opacity: Math.min(1, cta * 1.4), transform: `translateY(${(1 - cta) * 40}px)`}}>
        <div style={{padding: '32px 70px', borderRadius: 99, background: INK, color: '#fff', fontFamily: FONT, fontWeight: 900, fontSize: 44, transform: `scale(${1 + 0.03 * Math.sin(f / 4) * prog(f, arr + 30, 8)})`}}>Commencer →</div>
      </div>
    </AbsoluteFill>
  );
};

export const ScrollStop: React.FC = () => {
  useFonts();
  const f = useCurrentFrame();
  const flash = (at: number) => interpolate(f, [at - 1, at, at + 5], [0, 1, 0], clamp);
  return (
    <AbsoluteFill style={{background: '#FFFFFF', fontFamily: FONT}}>
      {f < T.full + 2 && <Feed />}
      {f < T.stop + 2 && <HookText />}
      <Sequence from={T.stop} durationInFrames={T.hero - T.stop + 2}><HeroAd /></Sequence>
      {f >= T.burst && f < T.end && <Burst />}
      {f >= T.burst && f < T.end && <ClipCard />}
      <Sequence from={T.end}><End /></Sequence>
      {/* flashs blancs aux coupes fortes */}
      <AbsoluteFill style={{background: '#FFFFFF', opacity: Math.max(flash(T.stop) * 0.9, flash(T.end) * 0.6), pointerEvents: 'none'}} />
      <Audio src={staticFile('scroll/bed.wav')} />
      {[1, 2, 3, 4].map((k) => (
        <Sequence key={k} from={VO[k]}><Audio src={staticFile(`voice/scroll-${k}-n.mp3`)} /></Sequence>
      ))}
    </AbsoluteFill>
  );
};
