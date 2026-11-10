import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, continueRender, delayRender, interpolate, random, staticFile, useCurrentFrame} from 'remotion';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/inter/800.css';
import '@fontsource/space-grotesk/600.css';
import '@fontsource/space-grotesk/700.css';
import {LogoMark, Wordmark} from '../components/UI';
import {prog, pop, EXPO, INOUT} from '../components/anim';
import TL from './motion_timeline.json';
import type {ChatPubCfg} from './ChatToAd';

// « Du chat à la pub » — motion-design version (agency look).
// Dark « studio » art direction from the Growthity codebase (src/styles.css: --studio, --gradient-hero,
// .premium-editorial-band, .premium-phone). The product UI is used as hero objects, not as screenshots.

const STUDIO = '#0B0A0C';
const GRAD = 'linear-gradient(120deg, #2563EB 0%, #5B3FE4 52%, #9333EA 100%)';
const GRAD_TXT = 'linear-gradient(100deg, #8FA6FF 0%, #A78BFF 45%, #E39BFF 100%)';
const PRIMARY = '#6552E8';
const META = '#0866FF';
const DISPLAY = '"Space Grotesk", Inter, sans-serif';
const FONT = 'Inter, system-ui, sans-serif';

type Word = {w: string; s: number; e: number};
type Cfg = ChatPubCfg & {promptShort?: string; caption?: string};

export const motionTimeline = (c: Cfg) => {
  const T: Record<string, number> = {...(TL as unknown as Record<string, number>)};
  T.videoEnd = T.videoStart + c.videoFrames;
  T.pub = T.videoEnd;
  T.leads = T.pub + T.pubEnd;
  T.end = T.leads + (T.leadsDur ?? 0);
  T.total = T.end + T.endDur;
  return T;
};

const useFonts = () => {
  const [h] = useState(() => delayRender('fonts'));
  useEffect(() => {
    Promise.all(['500 20px Inter', '600 20px Inter', '700 20px Inter', '800 20px Inter', '700 20px "Space Grotesk"', '600 20px "Space Grotesk"'].map((s) => document.fonts.load(s))).then(() => continueRender(h));
  }, [h]);
};

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// ---------- background: studio band with drifting glows + grain ----------
export const StudioBg: React.FC<{intensity?: number}> = ({intensity = 1}) => {
  const f = useCurrentFrame();
  const a = Math.sin(f / 70) * 60;
  const b = Math.cos(f / 90) * 80;
  return (
    <AbsoluteFill style={{background: STUDIO}}>
      <AbsoluteFill style={{background: `radial-gradient(900px 900px at ${18 + a / 30}% ${12 + b / 40}%, rgba(101,82,232,${0.42 * intensity}), transparent 62%)`}} />
      <AbsoluteFill style={{background: `radial-gradient(800px 800px at ${86 - a / 40}% ${88 - b / 50}%, rgba(214,72,200,${0.22 * intensity}), transparent 60%)`}} />
      <AbsoluteFill style={{background: `radial-gradient(700px 500px at 50% 50%, rgba(37,99,235,${0.12 * intensity}), transparent 70%)`}} />
      <Grain />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.55) 100%)'}} />
    </AbsoluteFill>
  );
};

export const Grain: React.FC = () => {
  const f = useCurrentFrame();
  const seed = Math.floor(f / 2) % 6;
  return (
    <svg width="1080" height="1920" style={{position: 'absolute', inset: 0, opacity: 0.07, mixBlendMode: 'overlay'}}>
      <filter id={`gr${seed}`}>
        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={seed} />
      </filter>
      <rect width="100%" height="100%" filter={`url(#gr${seed})`} />
    </svg>
  );
};

// floating light particles
export const Dust: React.FC<{n?: number; o?: number}> = ({n = 26, o = 1}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{opacity: o}}>
      {new Array(n).fill(0).map((_, i) => {
        const x = random(`x${i}`) * 1080;
        const y = (random(`y${i}`) * 1920 - f * (0.6 + random(`s${i}`) * 1.4)) % 1920;
        const s = 3 + random(`r${i}`) * 6;
        return <div key={i} style={{position: 'absolute', left: x, top: y < 0 ? y + 1920 : y, width: s, height: s, borderRadius: 99, background: i % 3 ? 'rgba(167,139,255,0.55)' : 'rgba(255,255,255,0.6)', filter: 'blur(1px)', boxShadow: '0 0 12px rgba(167,139,255,0.8)'}} />;
      })}
    </AbsoluteFill>
  );
};

// ---------- premium phone ----------
export const Phone: React.FC<{w: number; children: React.ReactNode; glow?: number; style?: React.CSSProperties}> = ({w, children, glow = 1, style}) => {
  const f = useCurrentFrame();
  const h = w * 2.05;
  const sweep = ((f * 9) % 2400) - 600;
  return (
    <div style={{position: 'relative', width: w, height: h, borderRadius: w * 0.14, padding: w * 0.028, background: 'linear-gradient(145deg, #2B2540 0%, #0B0A0C 45%, #141217 100%)', boxShadow: `0 0 0 2px rgba(255,255,255,0.12) inset, 0 60px 140px -40px rgba(0,0,0,0.9), 0 30px 90px -30px rgba(101,82,232,${0.75 * glow})`, ...style}}>
      <div style={{position: 'relative', width: '100%', height: '100%', borderRadius: w * 0.115, overflow: 'hidden', background: '#000'}}>
        {children}
        <div style={{position: 'absolute', left: '50%', top: w * 0.03, width: w * 0.3, height: w * 0.075, marginLeft: -w * 0.15, borderRadius: 99, background: '#000'}} />
        <div style={{position: 'absolute', inset: 0, background: `linear-gradient(115deg, transparent ${sweep / 24}%, rgba(255,255,255,0.10) ${sweep / 24 + 6}%, transparent ${sweep / 24 + 14}%)`, pointerEvents: 'none'}} />
      </div>
    </div>
  );
};

// ---------- kinetic captions ----------
export const Kinetic: React.FC<{words: Word[]; at: number; y?: number; size?: number}> = ({words, at, y = 1560, size = 72}) => {
  const f = useCurrentFrame();
  const t = (f - at) / 30;
  if (!words.length || t < -0.05 || t > words[words.length - 1].e + 0.3) return null;
  const chunks: Word[][] = [];
  let cur: Word[] = [];
  words.forEach((w) => {
    cur.push(w);
    if (cur.length >= 3 || /[.,?!…:]$/.test(w.w)) {
      chunks.push(cur);
      cur = [];
    }
  });
  if (cur.length) chunks.push(cur);
  const chunk = chunks.find((ch) => t <= ch[ch.length - 1].e + 0.04) ?? chunks[chunks.length - 1];
  return (
    <div style={{position: 'absolute', left: 60, right: 60, top: y, display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '0 18px'}}>
      {chunk.map((w, i) => {
        const p = interpolate(t, [w.s - 0.06, w.s + 0.1], [0, 1], clamp);
        const hot = t >= w.s && t <= w.e + 0.12;
        return (
          <span key={i} style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: size, lineHeight: 1.08, color: '#fff', opacity: 0.25 + p * 0.75, transform: `translateY(${(1 - p) * 26}px) scale(${0.92 + p * 0.08})`, display: 'inline-block', textShadow: '0 8px 40px rgba(0,0,0,0.6)', ...(hot ? {backgroundImage: GRAD_TXT, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'} : {})}}>
            {w.w}
          </span>
        );
      })}
    </div>
  );
};

// ---------- 1. hook ----------
const Hook: React.FC<{c: Cfg; words: Word[]}> = ({c, words}) => {
  const f = useCurrentFrame();
  const inP = prog(f, 0, 22);
  const rotY = interpolate(f, [0, 66], [-24, -10], clamp);
  const rotX = interpolate(f, [0, 66], [10, 4], clamp);
  return (
    <AbsoluteFill>
      <StudioBg />
      <div style={{position: 'absolute', left: 0, right: 0, top: 210, textAlign: 'center', fontFamily: DISPLAY, fontWeight: 700, fontSize: 210, lineHeight: 0.9, color: 'rgba(255,255,255,0.07)', letterSpacing: '-0.03em', transform: `translateX(${-f * 2}px)`}}>
        ZÉRO<br />TOURNAGE
      </div>
      <AbsoluteFill style={{perspective: 2000, alignItems: 'center', justifyContent: 'center'}}>
        <div style={{transform: `translate(70px, ${(1 - inP) * 300 - 120}px) rotateY(${rotY}deg) rotateX(${rotX}deg) scale(${0.85 + inP * 0.15})`, opacity: inP}}>
          <Phone w={520}>
            <OffthreadVideo src={staticFile(`media/${c.video}`)} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />
          </Phone>
        </div>
      </AbsoluteFill>
      <Dust />
      <Kinetic words={words} at={TL.vo.a} y={1520} size={86} />
    </AbsoluteFill>
  );
};

// ---------- 2. actor carousel ----------
const Carousel: React.FC<{c: Cfg; words: Word[]}> = ({c, words}) => {
  const f = useCurrentFrame(); // local, starts at hookEnd
  const g = c.gallery;
  const n = g.length;
  const k = Math.max(0, g.findIndex((x) => x.name === c.actor?.name));
  const step = 360 / n;
  const lock = TL.carouselLock - TL.hookEnd;
  const base = interpolate(f, [0, lock], [-k * step - 300, -k * step], {...clamp, easing: EXPO});
  const R = 620;
  const chosen = prog(f, lock - 2, 12);
  const out = prog(f, TL.actorEnd - TL.hookEnd - 4, 14, INOUT);
  return (
    <AbsoluteFill>
      <StudioBg />
      <div style={{position: 'absolute', left: 0, right: 0, top: 230, textAlign: 'center', fontFamily: FONT, fontWeight: 600, fontSize: 30, letterSpacing: '0.22em', color: 'rgba(255,255,255,0.55)', opacity: prog(f, 4, 12) * (1 - out)}}>
          GALERIE D’ACTEURS · 200 VISAGES RÉALISTES
      </div>
      <AbsoluteFill style={{perspective: 1700, alignItems: 'center', justifyContent: 'center'}}>
        <div style={{position: 'relative', width: 380, height: 520, transformStyle: 'preserve-3d', transform: `translateY(-60px) translateZ(${-R + out * 260}px) rotateX(-6deg) rotateY(${base}deg)`}}>
          {g.map((a, i) => {
            const ang = i * step;
            const isK = i === k;
            const face = Math.cos(((ang + base) * Math.PI) / 180);
            const sc = isK ? 1 + chosen * 0.18 : 1;
            return (
              <div key={i} style={{position: 'absolute', inset: 0, borderRadius: 34, overflow: 'hidden', transform: `rotateY(${ang}deg) translateZ(${R}px) scale(${sc})`, backfaceVisibility: 'hidden', opacity: isK ? 1 : (0.25 + Math.max(0, face) * 0.75) * (1 - chosen * 0.6) * (1 - out), filter: isK ? 'none' : `blur(${chosen * 6}px)`, boxShadow: isK && chosen > 0 ? `0 0 0 ${6 * chosen}px #8B6DFF, 0 40px 120px -20px rgba(139,109,255,${0.9 * chosen})` : '0 30px 80px -30px rgba(0,0,0,0.8)'}}>
                <Img src={staticFile(`media/${a.img}`)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, padding: '90px 26px 24px', background: 'linear-gradient(transparent, rgba(0,0,0,0.75))', color: '#fff', fontFamily: FONT}}>
                  <div style={{fontSize: 34, fontWeight: 700}}>{a.name}</div>
                  <div style={{fontSize: 24, opacity: 0.8}}>{a.style}</div>
                </div>
                {isK && chosen > 0 && (
                  <div style={{position: 'absolute', right: 20, top: 20, width: 66, height: 66, borderRadius: 99, backgroundImage: GRAD, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${pop(f, lock, 10)})`, boxShadow: '0 10px 30px rgba(91,63,228,0.7)'}}>
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
      <Dust o={0.6} />
      <Kinetic words={words} at={TL.vo.b1 - TL.hookEnd} y={1500} size={80} />
    </AbsoluteFill>
  );
};

// ---------- 3. prompt bar (Growthity composer as a hero object) ----------
const PromptScene: React.FC<{c: Cfg; words: Word[]}> = ({c, words}) => {
  const f = useCurrentFrame(); // local from actorEnd
  const L = (k: keyof typeof TL) => (TL[k] as number) - TL.actorEnd;
  const inP = prog(f, 0, 16);
  const text = c.promptShort ?? c.prompt;
  const n = Math.floor(interpolate(f, [L('typeStart'), L('typeEnd')], [0, text.length], clamp));
  const shown = text.slice(0, n);
  const sendP = f >= L('send') - 3 && f < L('send') + 3;
  const out = prog(f, L('send') + 2, 12, INOUT);
  const chipP = prog(f, 2, 14);
  const rotX = interpolate(f, [0, 30], [18, 8], {...clamp, easing: EXPO});
  const rotY = interpolate(f, [0, 60], [-14, -4], {...clamp, easing: EXPO});
  return (
    <AbsoluteFill>
      <StudioBg />
      <AbsoluteFill style={{perspective: 1800, alignItems: 'center', justifyContent: 'center'}}>
        <div style={{width: 960, transform: `translateY(${-80 + (1 - inP) * 200}px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(${(0.9 + inP * 0.1) * (1 - out * 0.25)})`, opacity: inP * (1 - out), filter: `blur(${out * 10}px)`}}>
          <div style={{borderRadius: 44, background: '#fff', padding: '30px 30px 26px', boxShadow: '0 0 0 2px rgba(255,255,255,0.6) inset, 0 50px 140px -30px rgba(101,82,232,0.85), 0 20px 60px -20px rgba(0,0,0,0.6)', fontFamily: FONT}}>
            <div style={{display: 'flex', gap: 12, alignItems: 'center'}}>
              {c.brand && (
                <div style={{display: 'flex', alignItems: 'center', gap: 10, height: 76, padding: '0 22px', borderRadius: 999, background: '#F1F3F9', border: '2px solid #E7E9EF', fontSize: 28, fontWeight: 500, color: '#0F172A', whiteSpace: 'nowrap'}}>
                  <svg width="30" height="30" viewBox="0 0 24 24"><path d="M3 11.5L12 4l9 7.5" fill="none" stroke="#EA580C" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /><path d="M5.5 10v9.5h13V10" fill="#FFEDD5" stroke="#EA580C" strokeWidth="2" strokeLinejoin="round" /></svg>
                  {c.brand.name}
                </div>
              )}
              {c.actor && (
                <div style={{display: 'flex', alignItems: 'center', gap: 10, height: 76, padding: '0 22px 0 8px', borderRadius: 999, background: '#EEEBFF', border: '2px solid #D6CFFB', fontSize: 28, fontWeight: 600, color: '#0F172A', whiteSpace: 'nowrap', transform: `scale(${0.6 + chipP * 0.4})`, opacity: chipP}}>
                  <Img src={staticFile(`media/${c.actor.img}`)} style={{width: 60, height: 60, borderRadius: 99, objectFit: 'cover'}} />
                  {c.actor.name}
                </div>
              )}
              {c.product ? (
                <div style={{display: 'flex', alignItems: 'center', gap: 10, height: 76, padding: '0 22px 0 8px', borderRadius: 999, background: '#EEEBFF', border: '2px solid #D6CFFB', fontSize: 28, fontWeight: 600, color: '#0F172A', whiteSpace: 'nowrap'}}>
                  <Img src={staticFile(`media/${c.product.img}`)} style={{width: 60, height: 60, borderRadius: 14, objectFit: 'cover'}} />
                  {c.product.name}
                </div>
              ) : null}
            </div>
            <div style={{display: 'flex', alignItems: 'flex-end', gap: 18, marginTop: 24}}>
              <div style={{flex: 1, minHeight: 150, fontSize: 40, lineHeight: 1.32, color: shown ? '#0F172A' : '#94A3B8', fontWeight: 500}}>
                {shown || 'Décris la pub que tu veux créer…'}
                <span style={{display: 'inline-block', width: 4, height: 44, marginLeft: 4, verticalAlign: '-6px', backgroundImage: GRAD, opacity: Math.floor(f / 7) % 2 ? 1 : 0.15}} />
              </div>
              <div style={{width: 104, height: 104, borderRadius: 30, background: n > 0 ? GRAD : '#F1F3F9', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${sendP ? 0.86 : 1})`, boxShadow: n > 0 ? '0 18px 40px -12px rgba(91,63,228,0.9)' : 'none', flexShrink: 0}}>
                <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke={n > 0 ? '#fff' : '#94A3B8'} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M6 11l6-6 6 6" /></svg>
              </div>
            </div>
          </div>
        </div>
      </AbsoluteFill>
      {/* the chosen actor card flies into the chip */}
      {c.actor && f < 18 && (
        <div style={{position: 'absolute', left: 540 - 225 + (1 - prog(f, 0, 16)) * 0 , top: 640, width: 450, height: 615, borderRadius: 34, overflow: 'hidden', opacity: 1 - prog(f, 4, 12), transform: `translate(${-prog(f, 0, 16) * 40}px, ${-prog(f, 0, 16) * 380}px) scale(${1 - prog(f, 0, 16) * 0.85})`, boxShadow: '0 0 0 6px #8B6DFF'}}>
          <Img src={staticFile(`media/${c.actor.img}`)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
        </div>
      )}
      <Dust o={0.5} />
      <Kinetic words={words} at={TL.vo.b2 - TL.actorEnd} y={1500} size={80} />
    </AbsoluteFill>
  );
};

// ---------- 4. generation: scan reveal, then full screen ----------
const GenScene: React.FC<{c: Cfg; words: Word[]}> = ({c, words}) => {
  const f = useCurrentFrame(); // local from send
  const L = (k: keyof typeof TL) => (TL[k] as number) - TL.send;
  const burst = prog(f, L('burst') - 2, 16);
  const appear = prog(f, L('burst'), 16);
  const scan = interpolate(f, [L('scanStart'), L('scanEnd')], [0, 1], {...clamp, easing: INOUT});
  const ready = f >= L('ready');
  const ex = prog(f, L('expand'), L('videoStart') - L('expand'), INOUT);
  const W = interpolate(ex, [0, 1], [600, 1080]);
  const H = interpolate(ex, [0, 1], [1066, 1920]);
  const rad = interpolate(ex, [0, 1], [44, 0]);
  const spin = f * 6;
  return (
    <AbsoluteFill>
      <StudioBg intensity={1.2} />
      {/* burst rings */}
      {[0, 1, 2].map((i) => {
        const p = prog(f, L('burst') - 4 + i * 4, 26);
        return <div key={i} style={{position: 'absolute', left: 540 - 400, top: 900 - 400, width: 800, height: 800, borderRadius: 999, border: '3px solid rgba(167,139,255,0.7)', transform: `scale(${0.2 + p * 1.6})`, opacity: (1 - p) * (p > 0 ? 1 : 0)}} />;
      })}
      <AbsoluteFill style={{background: `radial-gradient(circle at 50% 47%, rgba(255,255,255,${0.5 * burst * (1 - prog(f, L('burst') + 8, 10))}), transparent 40%)`}} />
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
        <div style={{position: 'relative', width: W, height: H, borderRadius: rad, padding: 5 * (1 - ex), background: `conic-gradient(from ${spin}deg, #2563EB, #5B3FE4, #9333EA, #E39BFF, #2563EB)`, transform: `scale(${0.85 + appear * 0.15})`, opacity: appear, boxShadow: `0 0 ${120 * (1 - ex)}px rgba(139,109,255,0.7)`}}>
          <div style={{position: 'relative', width: '100%', height: '100%', borderRadius: Math.max(0, rad - 5), overflow: 'hidden', background: '#000'}}>
            {/* blurred base */}
            {c.actor && <Img src={staticFile(`media/${c.actor.img}`)} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(26px) saturate(0.6) brightness(0.6)', transform: 'scale(1.15)'}} />}
            {/* sharp video revealed by the scan line */}
            <div style={{position: 'absolute', inset: 0, clipPath: `inset(0 0 ${(1 - scan) * 100}% 0)`}}>
              <OffthreadVideo src={staticFile(`media/${c.video}`)} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />
            </div>
            {scan > 0 && scan < 1 && (
              <div style={{position: 'absolute', left: 0, right: 0, top: `${scan * 100}%`, height: 6, marginTop: -3, background: 'linear-gradient(90deg, transparent, #fff, transparent)', boxShadow: '0 0 40px 14px rgba(167,139,255,0.9)'}} />
            )}
            {!ready && (
              <div style={{position: 'absolute', left: 30, bottom: 30, fontFamily: '"Geist Mono", ui-monospace, monospace', fontSize: 30, color: '#fff', opacity: 0.9}}>
                GÉNÉRATION {String(Math.round(scan * 100)).padStart(2, '0')} %
              </div>
            )}
          </div>
          {ready && (
            <div style={{position: 'absolute', left: '50%', top: -36, transform: `translateX(-50%) scale(${pop(f, L('ready'), 10) * (1 - ex)})`, display: 'flex', alignItems: 'center', gap: 12, padding: '16px 30px', borderRadius: 999, background: '#fff', fontFamily: FONT, fontWeight: 700, fontSize: 32, color: '#15803D', boxShadow: '0 20px 50px -20px rgba(0,0,0,0.6)'}}>
              <div style={{width: 18, height: 18, borderRadius: 99, background: '#22C55E', boxShadow: '0 0 12px #22C55E'}} />
              Prête
            </div>
          )}
        </div>
      </AbsoluteFill>
      <Dust o={1 - ex} />
      <div style={{opacity: 1 - ex}}>
        <Kinetic words={words} at={TL.vo.b3 - TL.send} y={1640} size={76} />
      </div>
    </AbsoluteFill>
  );
};

// ---------- 6. publish: sponsored post in a phone + « Publier sur Meta » ----------
const META_PATH = 'M6.915 4.03c-1.968 0-3.683 1.28-4.871 3.113C.704 9.208 0 11.883 0 14.449c0 .706.07 1.369.21 1.973a6.624 6.624 0 0 0 .265.86 5.297 5.297 0 0 0 .371.761c.696 1.159 1.818 1.927 3.593 1.927 1.497 0 2.633-.671 3.965-2.444.76-1.012 1.144-1.626 2.663-4.32l.756-1.339.186-.325c.061.1.121.196.183.3l2.152 3.595c.724 1.21 1.665 2.556 2.47 3.314 1.046.987 1.992 1.22 3.06 1.22 1.075 0 1.876-.355 2.455-.843a3.743 3.743 0 0 0 .81-.973c.542-.939.861-2.127.861-3.745 0-2.72-.681-5.357-2.084-7.45-1.282-1.912-2.957-2.93-4.716-2.93-1.047 0-2.088.467-3.053 1.308-.652.57-1.257 1.29-1.82 2.05-.69-.875-1.335-1.547-1.958-2.056-1.182-.966-2.315-1.303-3.454-1.303zm10.16 2.053c1.147 0 2.188.758 2.992 1.999 1.132 1.748 1.647 4.195 1.647 6.4 0 1.548-.368 2.9-1.839 2.9-.58 0-1.027-.23-1.664-1.004-.496-.601-1.343-1.878-2.832-4.358l-.617-1.028a44.908 44.908 0 0 0-1.255-1.98c.07-.109.141-.224.211-.327 1.12-1.667 2.118-2.602 3.358-2.602zm-10.201.553c1.265 0 2.058.791 2.675 1.446.307.327.737.871 1.234 1.579l-1.02 1.566c-.757 1.163-1.882 3.017-2.837 4.338-1.191 1.649-1.81 1.817-2.486 1.817-.524 0-1.038-.237-1.383-.794-.263-.426-.464-1.13-.464-2.046 0-2.221.63-4.535 1.66-6.088.454-.687.964-1.226 1.533-1.533a2.264 2.264 0 0 1 1.088-.285z';
// official Meta symbol (infinity); `mono` = single colour, otherwise the blue gradient
export const MetaMark: React.FC<{s: number; mono?: string}> = ({s, mono}) => {
  const id = React.useId().replace(/:/g, '');
  return (
    <svg width={s} height={s} viewBox="0 0 24 24">
      <defs>
        <linearGradient id={id} x1="0" y1="0.6" x2="1" y2="0.4">
          <stop offset="0" stopColor="#0064E1" />
          <stop offset="0.5" stopColor="#0073EE" />
          <stop offset="1" stopColor="#0082FB" />
        </linearGradient>
      </defs>
      <path d={META_PATH} fill={mono ?? `url(#${id})`} />
    </svg>
  );
};
export const IgGlyph: React.FC<{s: number}> = ({s}) => (
  <div style={{width: s, height: s, borderRadius: s * 0.28, background: 'radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative'}}>
    <div style={{width: s * 0.62, height: s * 0.62, borderRadius: s * 0.19, border: `${s * 0.075}px solid #fff`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <div style={{width: s * 0.26, height: s * 0.26, borderRadius: 99, border: `${s * 0.075}px solid #fff`}} />
    </div>
    <div style={{position: 'absolute', right: s * 0.26, top: s * 0.26, width: s * 0.08, height: s * 0.08, borderRadius: 99, background: '#fff'}} />
  </div>
);
export const FbGlyph: React.FC<{s: number}> = ({s}) => (
  <svg width={s} height={s} viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#0866FF" /><path d="M13.4 24v-8.4h2.8l.4-3.3h-3.2v-2.1c0-.9.3-1.6 1.6-1.6h1.7V5.7c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2.4H7.2v3.3H10V24z" fill="#fff" /></svg>
);
const Ico: React.FC<{d: string; s?: number; fill?: string}> = ({d, s = 46, fill = 'none'}) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill={fill} stroke="#0F0F0F" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>
);
const IC = {
  heart: 'M12 20.5s-7.5-4.6-9.3-9.2C1.4 7.9 3.6 4.5 7 4.5c2 0 3.3 1.1 5 3 1.7-1.9 3-3 5-3 3.4 0 5.6 3.4 4.3 6.8-1.8 4.6-9.3 9.2-9.3 9.2z',
  comment: 'M20.7 16.9A9 9 0 1 0 17 20.6L21.5 22z',
  share: 'M22 3L9.2 10.1M22 3l-7 18-3.8-8.9L2 8.5z',
  save: 'M19 21l-7-5.5L5 21V3h14z',
  home: 'M3 10.5L12 3l9 7.5V21h-6v-6H9v6H3z',
  search: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM21 21l-5-5',
  reels: 'M3 6a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3zM3 8h18M8 3l3 5M13 3l3 5M10 12v6l5-3z',
  shop: 'M4 8h16l-1 13H5zM9 8V6a3 3 0 0 1 6 0v2',
  plus: 'M4 4h16v16H4zM12 8v8M8 12h8',
};

// real-looking Instagram feed with the sponsored post
export const IgFeed: React.FC<{c: Cfg; ctaHot: number}> = ({c, ctaHot}) => (
  <div style={{position: 'absolute', inset: 0, background: '#fff', fontFamily: '-apple-system, "SF Pro Text", Inter, sans-serif', color: '#0F0F0F'}}>
    <div style={{height: 70, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '0 34px 6px', fontSize: 22, fontWeight: 600}}>
      <span>9:41</span>
      <span style={{display: 'flex', gap: 8, alignItems: 'center'}}>
        <svg width="26" height="18" viewBox="0 0 26 18"><rect x="0" y="12" width="4" height="6" rx="1" fill="#000" /><rect x="7" y="8" width="4" height="10" rx="1" fill="#000" /><rect x="14" y="4" width="4" height="14" rx="1" fill="#000" /><rect x="21" y="0" width="4" height="18" rx="1" fill="#000" /></svg>
        <svg width="36" height="18" viewBox="0 0 36 18"><rect x="1" y="1" width="30" height="16" rx="4" fill="none" stroke="#000" strokeWidth="2" /><rect x="4" y="4" width="22" height="10" rx="2" fill="#000" /><rect x="32.5" y="6" width="2.5" height="6" rx="1" fill="#000" /></svg>
      </span>
    </div>
    <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 22px 12px'}}>
      <div style={{fontFamily: '"Billabong", "Grand Hotel", cursive', fontSize: 44, fontWeight: 600, letterSpacing: '-0.01em'}}><IgGlyph s={40} /></div>
      <div style={{display: 'flex', gap: 22}}>
        <Ico d={IC.plus} s={40} />
        <Ico d={IC.heart} s={40} />
        <Ico d={IC.share} s={40} />
      </div>
    </div>
    <div style={{display: 'flex', alignItems: 'center', gap: 14, padding: '8px 18px 12px'}}>
      <div style={{width: 58, height: 58, borderRadius: 99, padding: 3, background: 'linear-gradient(45deg, #FEDA75, #FA7E1E, #D62976, #962FBF, #4F5BD5)'}}>
        <div style={{width: '100%', height: '100%', borderRadius: 99, background: '#FFF7ED', border: '3px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <svg width="26" height="26" viewBox="0 0 24 24"><path d="M3 11.5L12 4l9 7.5" fill="none" stroke="#EA580C" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /><path d="M5.5 10v9.5h13V10" fill="#FFEDD5" stroke="#EA580C" strokeWidth="2" strokeLinejoin="round" /></svg>
        </div>
      </div>
      <div style={{flex: 1, lineHeight: 1.2}}>
        <div style={{fontSize: 23, fontWeight: 600}}>{(c.brand?.name ?? 'votremarque').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, '')}</div>
        <div style={{fontSize: 19, color: '#262626'}}>Sponsorisé</div>
      </div>
      <div style={{fontSize: 30, fontWeight: 700, letterSpacing: 2}}>···</div>
    </div>
    <div style={{position: 'relative', height: 590, overflow: 'hidden', background: '#000'}}>
      <OffthreadVideo src={staticFile(`media/${c.video}`)} startFrom={60} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />
    </div>
    <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', background: ctaHot ? '#0095F6' : '#EFEFEF', color: ctaHot ? '#fff' : '#0F0F0F', fontSize: 23, fontWeight: 600}}>
      En savoir plus
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={ctaHot ? '#fff' : '#0F0F0F'} strokeWidth="2.4" strokeLinecap="round"><path d="M9 6l6 6-6 6" /></svg>
    </div>
    <div style={{display: 'flex', alignItems: 'center', padding: '14px 16px 6px', gap: 18}}>
      <Ico d={IC.heart} />
      <Ico d={IC.comment} />
      <Ico d={IC.share} />
      <div style={{flex: 1}} />
      <Ico d={IC.save} />
    </div>
    <div style={{padding: '4px 20px', fontSize: 21, lineHeight: 1.35}}>
      <b>{(c.brand?.name ?? 'votremarque').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, '')}</b> {c.caption ?? 'Votre pub, en ligne.'}
    </div>
    <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 92, borderTop: '1px solid #DBDBDB', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-around', paddingBottom: 14}}>
      <Ico d={IC.home} s={42} fill="#0F0F0F" />
      <Ico d={IC.search} s={42} />
      <Ico d={IC.reels} s={42} />
      <Ico d={IC.shop} s={42} />
      <div style={{width: 40, height: 40, borderRadius: 99, background: 'linear-gradient(135deg,#C4B5FD,#5B3FE4)'}} />
    </div>
  </div>
);

const PublishScene: React.FC<{c: Cfg; words: Word[]}> = ({c, words}) => {
  const f = useCurrentFrame();
  const inP = prog(f, 0, 18);
  const press = TL.press;
  const done = f >= press + 4;
  const btnIn = pop(f, 12, 13);
  const pressing = f >= press - 3 && f < press + 3;
  const rotY = interpolate(f, [0, 90], [14, 6], clamp);
  const fb = pop(f, press + 8, 11);
  const ig = pop(f, press + 14, 11);
  const ctaHot = done && Math.floor((f - press) / 10) % 2 === 1 ? 1 : 0;
  return (
    <AbsoluteFill>
      <StudioBg />
      <AbsoluteFill style={{perspective: 2000, alignItems: 'center'}}>
        <div style={{marginTop: 110, transform: `translateY(${(1 - inP) * -200}px) rotateY(${rotY}deg) rotateX(3deg) scale(${1.2 - inP * 0.2})`, opacity: inP}}>
          <Phone w={560} glow={0.8}>
            <IgFeed c={c} ctaHot={ctaHot} />
          </Phone>
        </div>
      </AbsoluteFill>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1360, display: 'flex', justifyContent: 'center'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 22, padding: '30px 54px', borderRadius: 999, background: done ? '#fff' : '#0866FF', color: done ? '#0F172A' : '#fff', fontFamily: FONT, fontWeight: 700, fontSize: 46, transform: `scale(${btnIn * (pressing ? 0.92 : 1)})`, boxShadow: `0 30px 70px -20px ${done ? 'rgba(255,255,255,0.35)' : 'rgba(8,102,255,0.9)'}`}}>
          {done ? (
            <>
              <div style={{width: 58, height: 58, borderRadius: 99, background: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
              </div>
              Publiée sur
              <MetaMark s={60} />
              Meta
            </>
          ) : (
            <>
              <MetaMark s={64} mono="#fff" />
              Publier sur Meta
            </>
          )}
        </div>
      </div>
      {f >= press - 2 && f < press + 20 && <div style={{position: 'absolute', left: 540 - 220, top: 1420 - 220, width: 440, height: 440, borderRadius: 999, border: '4px solid rgba(255,255,255,0.7)', transform: `scale(${0.3 + prog(f, press - 2, 20) * 1.2})`, opacity: 1 - prog(f, press - 2, 20)}} />}
      <div style={{position: 'absolute', left: 0, right: 0, top: 1545, display: 'flex', justifyContent: 'center', gap: 34}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 14, padding: '16px 28px', borderRadius: 999, background: 'rgba(255,255,255,0.08)', border: '2px solid rgba(255,255,255,0.14)', color: '#fff', fontFamily: FONT, fontWeight: 600, fontSize: 32, transform: `scale(${fb})`}}>
          <FbGlyph s={48} /> Facebook
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: 14, padding: '16px 28px', borderRadius: 999, background: 'rgba(255,255,255,0.08)', border: '2px solid rgba(255,255,255,0.14)', color: '#fff', fontFamily: FONT, fontWeight: 600, fontSize: 32, transform: `scale(${ig})`}}>
          <IgGlyph s={48} /> Instagram
        </div>
      </div>
      <Kinetic words={words} at={TL.vo.d1} y={1690} size={74} />
    </AbsoluteFill>
  );
};

// ---------- 6b. leads coming in ----------
type Lead = {name: string; city: string; ini: string; col: string};
const DEFAULT_LEADS: Lead[] = [
  {name: 'Sophie M.', city: 'Lyon', ini: 'SM', col: '#F59E0B'},
  {name: 'Karim B.', city: 'Toulouse', ini: 'KB', col: '#10B981'},
  {name: 'Julie R.', city: 'Nantes', ini: 'JR', col: '#EC4899'},
  {name: 'Marc D.', city: 'Lille', ini: 'MD', col: '#3B82F6'},
  {name: 'Nadia L.', city: 'Bordeaux', ini: 'NL', col: '#8B5CF6'},
];
const LeadsScene: React.FC<{c: Cfg & {leadTopic?: string}; words: Word[]}> = ({c, words}) => {
  const f = useCurrentFrame();
  const leads = DEFAULT_LEADS;
  const topic = c.leadTopic ?? 'Demande de devis';
  const panelIn = prog(f, 4, 18);
  const rotX = interpolate(f, [0, 90], [16, 8], clamp);
  const rotY = interpolate(f, [0, 90], [-10, -4], clamp);
  return (
    <AbsoluteFill>
      <StudioBg intensity={1.15} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 150, textAlign: 'center', fontFamily: DISPLAY, fontWeight: 700, fontSize: 96, lineHeight: 1.0, color: '#fff', letterSpacing: '-0.02em', opacity: prog(f, 0, 12), transform: `translateY(${(1 - prog(f, 0, 14)) * 30}px)`}}>
        Recevez
        <br />
        <span style={{backgroundImage: GRAD_TXT, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>vos leads.</span>
      </div>
      {/* notifications dropping in */}
      {leads.slice(0, 3).map((l, i) => {
        const at = 10 + i * 14;
        const p = prog(f, at, 14);
        const out = 0;
        const shift = [0, 1, 2].filter((j) => j > i).reduce((acc, j) => acc + prog(f, 10 + j * 14, 14) * 148, 0);
        if (f < at) return null;
        return (
          <div key={i} style={{position: 'absolute', left: 70, right: 70, top: 370 + shift, display: 'flex', alignItems: 'center', gap: 22, padding: '22px 26px', borderRadius: 36, background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(20px)', boxShadow: '0 30px 60px -20px rgba(0,0,0,0.6)', fontFamily: FONT, transform: `translateY(${(1 - p) * -160 - out * 40}px) scale(${1 - out * 0.06})`, opacity: p * (1 - out), zIndex: 10 + i}}>
            <div style={{width: 72, height: 72, borderRadius: 18, background: '#fff', border: '2px solid #E7E9EF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
              <LogoMark size={44} />
            </div>
            <div style={{flex: 1}}>
              <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 24, color: '#64748B', fontWeight: 600}}>
                <span>GROWTHITY</span>
                <span>à l’instant</span>
              </div>
              <div style={{fontSize: 31, fontWeight: 700, color: '#0F172A', marginTop: 4}}>Nouveau lead · {l.name}</div>
              <div style={{fontSize: 26, color: '#334155', marginTop: 2}}>{topic} · {l.city}</div>
            </div>
          </div>
        );
      })}
      {/* leads table */}
      <AbsoluteFill style={{perspective: 1800, alignItems: 'center'}}>
        <div style={{marginTop: 860, width: 940, borderRadius: 40, background: '#fff', boxShadow: '0 0 0 2px rgba(255,255,255,0.5) inset, 0 50px 140px -30px rgba(101,82,232,0.85)', fontFamily: FONT, overflow: 'hidden', transform: `translateY(${(1 - panelIn) * 260}px) rotateX(${rotX}deg) rotateY(${rotY}deg)`, opacity: panelIn}}>
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '30px 34px 22px', borderBottom: '2px solid #F1F3F9'}}>
            <div>
              <div style={{fontSize: 22, fontWeight: 600, color: '#64748B', letterSpacing: '0.12em'}}>RÉSULTATS</div>
              <div style={{fontSize: 40, fontWeight: 700, color: '#0F172A'}}>Leads</div>
            </div>
            <div style={{display: 'flex', alignItems: 'center', gap: 10, padding: '12px 20px', borderRadius: 999, background: '#ECFDF3', color: '#15803D', fontSize: 24, fontWeight: 700}}>
              <div style={{width: 14, height: 14, borderRadius: 99, background: '#22C55E', boxShadow: `0 0 ${8 + Math.sin(f / 4) * 6}px #22C55E`}} />
              En direct
            </div>
          </div>
          {leads.map((l, i) => {
            const at = 22 + i * 10;
            const p = prog(f, at, 14);
            const fresh = f < at + 22;
            return (
              <div key={i} style={{display: 'flex', alignItems: 'center', gap: 22, padding: '20px 34px', borderBottom: i < leads.length - 1 ? '2px solid #F1F3F9' : 'none', background: fresh && f >= at ? `rgba(101,82,232,${0.08 * (1 - prog(f, at + 6, 16))})` : 'transparent', opacity: p, transform: `translateX(${(1 - p) * 60}px)`}}>
                <div style={{width: 64, height: 64, borderRadius: 99, background: l.col, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 24}}>{l.ini}</div>
                <div style={{flex: 1}}>
                  <div style={{fontSize: 30, fontWeight: 700, color: '#0F172A'}}>{l.name}</div>
                  <div style={{fontSize: 24, color: '#64748B'}}>{topic} · {l.city}</div>
                </div>
                <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
                  <MetaMark s={34} />
                  <div style={{padding: '8px 16px', borderRadius: 10, background: '#EEEBFF', color: '#5B3FE4', fontSize: 22, fontWeight: 700}}>Nouveau</div>
                </div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
      <Dust o={0.6} />
      <Kinetic words={words} at={4} y={1740} size={60} />
    </AbsoluteFill>
  );
};

// ---------- 7. end ----------
const EndScene: React.FC<{words: Word[]}> = ({words}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <StudioBg intensity={1.3} />
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', fontFamily: FONT}}>
        <div style={{width: 180, height: 180, borderRadius: 50, background: 'rgba(255,255,255,0.06)', border: '2px solid rgba(255,255,255,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${pop(f, 2, 12)})`, boxShadow: '0 40px 120px -30px rgba(101,82,232,0.9)'}}>
          <LogoMark size={100} draw={prog(f, 2, 18)} />
        </div>
        <div style={{marginTop: 44}}><Wordmark size={92} dark reveal={prog(f, 8, 16)} /></div>
        <div style={{marginTop: 60, fontFamily: DISPLAY, fontWeight: 700, fontSize: 92, lineHeight: 1.0, color: '#fff', textAlign: 'center', letterSpacing: '-0.02em', opacity: prog(f, 14, 12), transform: `translateY(${(1 - prog(f, 14, 16)) * 30}px)`}}>
          Une phrase.
          <br />
          <span style={{backgroundImage: GRAD_TXT, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>Votre pub en ligne.</span>
        </div>
        
      </AbsoluteFill>
      <Dust />
      <AbsoluteFill style={{background: '#000', opacity: interpolate(f, [TL.endDur - 10, TL.endDur], [0, 1], clamp)}} />
    </AbsoluteFill>
  );
};

// ---------- composition ----------
export const MotionChatPub: React.FC<{cfg: Cfg}> = ({cfg: c}) => {
  useFonts();
  const f = useCurrentFrame();
  const T = motionTimeline(c);
  const W = (k: string) => (c.words ?? {})[c.voice[k as 'a']] ?? [];
  const flash = (at: number, d = 8) => Math.max(0, 1 - Math.abs(f - at) / d);
  return (
    <AbsoluteFill style={{background: STUDIO}}>
      <Sequence durationInFrames={T.hookEnd}>
        <Hook c={c} words={W('a')} />
      </Sequence>
      <Sequence from={T.hookEnd} durationInFrames={T.actorEnd - T.hookEnd}>
        <Carousel c={c} words={W('b1')} />
      </Sequence>
      <Sequence from={T.actorEnd} durationInFrames={T.send + 14 - T.actorEnd}>
        <PromptScene c={c} words={W('b2')} />
      </Sequence>
      <Sequence from={T.send} durationInFrames={T.videoStart - T.send}>
        <GenScene c={c} words={W('b3')} />
      </Sequence>
      <Sequence from={T.videoStart} durationInFrames={c.videoFrames}>
        <OffthreadVideo src={staticFile(`media/${c.video}`)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      </Sequence>
      <Sequence from={T.pub} durationInFrames={T.pubEnd}>
        <PublishScene c={c} words={W('d1')} />
      </Sequence>
      {T.leadsDur ? (
        <Sequence from={T.leads} durationInFrames={T.leadsDur}>
          <LeadsScene c={c} words={(c.words ?? {})['cp-leads-n'] ?? []} />
        </Sequence>
      ) : null}
      <Sequence from={T.end} durationInFrames={T.endDur}>
        <EndScene words={W('d2')} />
      </Sequence>
      {/* cut flashes */}
      <AbsoluteFill style={{background: '#fff', opacity: 0.55 * Math.max(flash(T.hookEnd, 5), flash(T.actorEnd, 4), flash(T.pub, 6), flash(T.end, 5), T.leadsDur ? flash(T.leads, 5) : 0), pointerEvents: 'none'}} />
      {/* audio */}
      <Sequence from={TL.vo.a}><Audio src={staticFile(`voice/${c.voice.a}.mp3`)} /></Sequence>
      <Sequence from={TL.vo.b1}><Audio src={staticFile(`voice/${c.voice.b1}.mp3`)} /></Sequence>
      <Sequence from={TL.vo.b2}><Audio src={staticFile(`voice/${c.voice.b2}.mp3`)} /></Sequence>
      <Sequence from={TL.vo.b3}><Audio src={staticFile(`voice/${c.voice.b3}.mp3`)} /></Sequence>
      <Sequence from={T.pub + TL.vo.d1}><Audio src={staticFile(`voice/${c.voice.d1}.mp3`)} /></Sequence>
      <Sequence from={T.leadsDur ? T.end + 4 : T.pub + TL.vo.d2}><Audio src={staticFile(`voice/${c.voice.d2}.mp3`)} /></Sequence>
      {T.leadsDur ? <Sequence from={T.leads + 4}><Audio src={staticFile('voice/cp-leads-n.mp3')} /></Sequence> : null}
      <Audio src={staticFile(`chatpub/${c.id}-motion-bed.wav`)} />
    </AbsoluteFill>
  );
};
