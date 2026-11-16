// « Du chat à la pub » — version claire « éditoriale » (cp6+).
// Accroche typographique barrée → barre de saisie → fenêtre Growthity (prompt + choix d'actrice)
// → atelier (script / tournage / montage) → pub plein écran sous-titrée → formats + publication Meta → carte de fin.
// Zones mortes respectées : rien d'essentiel sous y = 1440 ni dans la colonne de droite (x > 960).
import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, continueRender, delayRender, interpolate, spring, staticFile, useCurrentFrame} from 'remotion';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/inter/800.css';
import '@fontsource/space-grotesk/500.css';
import '@fontsource/space-grotesk/600.css';
import '@fontsource/space-grotesk/700.css';
import {LogoMark, Wordmark} from '../components/UI';
import {EXPO, INOUT, prog} from '../components/anim';

const BG = '#F6F5FA';
const INK = '#0B0A1F';
const MUTED = '#8A87A0';
const LINE = '#E6E4F0';
const GRAD = 'linear-gradient(120deg, #2563EB 0%, #5B3FE4 52%, #9333EA 100%)';
const META = '#0866FF';
const DISPLAY = '"Space Grotesk", Inter, sans-serif';
const FONT = 'Inter, system-ui, sans-serif';
const SHADOW = '0 1px 0 rgba(11,10,31,0.04), 0 2px 6px rgba(11,10,31,0.04), 0 50px 100px -40px rgba(46,32,140,0.35)';
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

type Word = {w: string; s: number; e: number};
type Seg = {from: number; to: number; zoom?: number};
export type LightCfg = {
  id: string;
  video: string; // clip brut (public/media/…)
  segments: Seg[]; // coupes, en secondes du clip source
  adWords: Word[]; // sous-titres, en secondes de la pub montée
  prompt: string;
  brand: {name: string; initials: string; handle: string; site: string; bg?: string; fg?: string};
  productIcon?: string;
  formatFrom?: number;
  formatSub: string;
  formatText: string;
  actor: {name: string; img: string};
  product: string;
  gallery: string[];
  script: string[];
  tags: string[];
  voice: Record<string, string>;
  words: Record<string, Word[]>;
  bed: string;
};

const sp = (f: number, d = 14, m = 0.8) => spring({frame: f, fps: 30, config: {damping: d, mass: m, stiffness: 140}});
const GradText: React.FC<{children: React.ReactNode}> = ({children}) => (
  <span style={{backgroundImage: GRAD, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent'}}>{children}</span>
);

// ---------- timeline ----------
export const adFrames = (c: LightCfg) => Math.round(c.segments.reduce((a, s) => a + (s.to - s.from), 0) * 30);
export const lightTimeline = (c: LightCfg) => {
  const T = {h1: 4, h2: 92, chat: 120, b1: 126, typeA: 134, typeB: 172, pick: 150, lock: 184, send: 204, gen: 212, b2: 214, write: 240, shoot: 262, edit: 281, collapse: 300, ad: 318, adEnd: 0, fmt: 0, press: 0, end: 0, total: 0};
  T.adEnd = T.ad + adFrames(c);
  T.fmt = T.adEnd;
  T.press = T.fmt + 66;
  T.end = T.fmt + 104;
  T.total = T.end + 96;
  return T;
};

const useFonts = () => {
  const [h] = useState(() => delayRender('fonts'));
  useEffect(() => {
    Promise.all(['500 20px Inter', '600 20px Inter', '700 20px Inter', '800 20px Inter', '500 20px "Space Grotesk"', '600 20px "Space Grotesk"', '700 20px "Space Grotesk"'].map((s) => document.fonts.load(s))).then(() => continueRender(h));
  }, [h]);
};

// ---------- fond clair : halos doux + grille de points ----------
const LightBg: React.FC = () => {
  const f = useCurrentFrame();
  const a = Math.sin(f / 80) * 6;
  const b = Math.cos(f / 95) * 7;
  return (
    <AbsoluteFill style={{background: BG}}>
      <AbsoluteFill style={{background: `radial-gradient(700px 620px at ${20 + a}% ${16 + b}%, rgba(99,102,241,0.20), transparent 70%)`}} />
      <AbsoluteFill style={{background: `radial-gradient(760px 700px at ${84 - a}% ${74 - b}%, rgba(168,85,247,0.16), transparent 70%)`}} />
      <AbsoluteFill style={{background: `radial-gradient(600px 500px at ${70 + b}% ${20 + a}%, rgba(56,189,248,0.12), transparent 70%)`}} />
      <AbsoluteFill style={{backgroundImage: 'radial-gradient(rgba(11,10,31,0.10) 1.4px, transparent 1.6px)', backgroundSize: '36px 36px', maskImage: 'radial-gradient(ellipse at 50% 40%, black 30%, transparent 80%)', WebkitMaskImage: 'radial-gradient(ellipse at 50% 40%, black 30%, transparent 80%)'}} />
    </AbsoluteFill>
  );
};

const at = (words: Word[], k: string, base: number, dflt = 0) => {
  const w = words.find((x) => x.w.toLowerCase().replace(/[^a-zà-ü']/g, '').startsWith(k));
  return base + Math.round((w ? w.s : dflt) * 30);
};

// ---------- A. accroche barrée ----------
const Hook: React.FC<{c: LightCfg; T: ReturnType<typeof lightTimeline>}> = ({c, T}) => {
  const f = useCurrentFrame();
  const w1 = c.words['h1'];
  const fr = (i: number, k: 's' | 'e', d: number) => T.h1 + Math.round((w1[i]?.[k] ?? d) * 30);
  const lines = [
    {t: 'Pas de tournage.', a: fr(0, 's', 0), strike: fr(2, 'e', 0.6) + 2},
    {t: 'Pas d’agence.', a: fr(3, 's', 1.0), strike: fr(4, 'e', 1.6) + 2},
    {t: 'Pas de monteur.', a: fr(5, 's', 2.0), strike: fr(7, 'e', 2.6) + 2},
  ];
  const out = prog(f, T.h2 - 2, 16, INOUT);
  const out2 = prog(f, T.chat, 12, INOUT);
  const juste = T.h2 + Math.round((c.words['h2'][0]?.s ?? 0.1) * 30);
  const pill = prog(f, juste + 10, 18);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 80, top: 600, transform: `translateY(${-out * 160}px)`, opacity: 1 - out, filter: `blur(${out * 10}px)`}}>
        {lines.map((l, i) => {
          const p = sp(f - l.a, 16);
          const s = prog(f, l.strike, 9, EXPO);
          return (
            <div key={i} style={{position: 'relative', fontFamily: DISPLAY, fontWeight: 700, fontSize: 118, lineHeight: 1.14, letterSpacing: '-0.04em', color: s > 0.5 ? '#B9B6CB' : INK, opacity: Math.min(1, p * 1.4), transform: `translateY(${(1 - p) * 60}px)`, whiteSpace: 'nowrap'}}>
              {l.t}
              <div style={{position: 'absolute', left: -6, top: '52%', height: 12, width: `${s * 104}%`, borderRadius: 8, background: GRAD, boxShadow: '0 6px 18px -6px rgba(91,63,228,0.7)'}} />
            </div>
          );
        })}
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 600, textAlign: 'center', opacity: Math.min(1, sp(f - juste, 14) * 1.4) * (1 - out2), transform: `translateY(${(1 - sp(f - juste, 14)) * 70 - out2 * 120}px) scale(${0.9 + 0.1 * sp(f - juste, 14)})`}}>
        <div style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 124, letterSpacing: '-0.045em', color: INK, lineHeight: 1}}>Juste</div>
        <div style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 124, letterSpacing: '-0.045em', lineHeight: 1.05}}><GradText>une phrase.</GradText></div>
      </div>
      {f < T.chat + 2 && (
        <div style={{position: 'absolute', left: 120, width: 840, top: 920, height: 120, borderRadius: 60, background: '#fff', boxShadow: SHADOW, border: `1px solid ${LINE}`, display: 'flex', alignItems: 'center', padding: '0 18px 0 44px', opacity: pill, transform: `translateY(${(1 - pill) * 50}px)`}}>
          <div style={{flex: 1, fontFamily: FONT, fontSize: 34, color: MUTED}}>Décris ta pub…<span style={{display: 'inline-block', width: 3, height: 40, marginLeft: 4, verticalAlign: 'middle', background: f % 30 < 16 ? '#5B3FE4' : 'transparent'}} /></div>
          <SendBtn s={84} />
        </div>
      )}
    </AbsoluteFill>
  );
};

const SendBtn: React.FC<{s: number; press?: number}> = ({s, press = 0}) => (
  <div style={{width: s, height: s, borderRadius: s / 2, background: GRAD, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${1 - press * 0.12})`, boxShadow: '0 14px 30px -10px rgba(91,63,228,0.75)'}}>
    <svg width={s * 0.42} height={s * 0.42} viewBox="0 0 24 24" fill="none"><path d="M12 19V5M5 12l7-7 7 7" stroke="#fff" strokeWidth={2.8} strokeLinecap="round" strokeLinejoin="round" /></svg>
  </div>
);

const Pointer: React.FC<{x: number; y: number; press: number; o?: number}> = ({x, y, press, o = 1}) => (
  <div style={{position: 'absolute', left: x, top: y, opacity: o, transform: `scale(${1 - press * 0.15})`, filter: 'drop-shadow(0 8px 14px rgba(11,10,31,0.35))'}}>
    <svg width="54" height="54" viewBox="0 0 24 24"><path d="M5 3l14 8-6 1.6L10 19z" fill="#0B0A1F" stroke="#fff" strokeWidth={1.4} strokeLinejoin="round" /></svg>
  </div>
);

// ---------- B. fenêtre Growthity ----------
const Chat: React.FC<{c: LightCfg; T: ReturnType<typeof lightTimeline>}> = ({c, T}) => {
  const f = useCurrentFrame();
  const open = prog(f, T.chat, 20, EXPO);
  const leave = prog(f, T.gen, 16, INOUT);
  // la barre de saisie (y 920, h 120) devient la fenêtre (y 300, h 760)
  const top = interpolate(open, [0, 1], [920, 300]);
  const h = interpolate(open, [0, 1], [120, 760]);
  const left = interpolate(open, [0, 1], [120, 70]);
  const w = interpolate(open, [0, 1], [840, 940]);
  const rad = interpolate(open, [0, 1], [60, 44]);
  const inner = prog(f, T.chat + 10, 14);
  const n = Math.max(0, Math.floor(((f - T.typeA) / (T.typeB - T.typeA)) * c.prompt.length));
  const txt = c.prompt.slice(0, Math.min(c.prompt.length, n));
  const locked = f >= T.lock + 6;
  const chipIn = sp(f - (T.lock + 6), 12);
  const press = f >= T.send && f < T.send + 6 ? 1 : 0;
  const curP = prog(f, T.send - 18, 16, INOUT);
  const tilt = (1 - open) * 10 + leave * 0;
  return (
    <AbsoluteFill style={{perspective: 1800}}>
      <div style={{position: 'absolute', left, top, width: w, height: h, borderRadius: rad, background: '#fff', border: `1px solid ${LINE}`, boxShadow: SHADOW, overflow: 'hidden', transform: `rotateX(${tilt}deg) translateY(${-leave * 140}px) scale(${1 - leave * 0.12})`, opacity: 1 - leave, filter: `blur(${leave * 8}px)`}}>
        <div style={{opacity: inner, padding: '34px 44px', height: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
            <div style={{width: 58, height: 58, borderRadius: 16, background: '#F1EFFB', display: 'flex', alignItems: 'center', justifyContent: 'center'}}><LogoMark size={36} /></div>
            <div style={{fontFamily: DISPLAY, fontWeight: 600, fontSize: 30, color: INK}}>Growthity Studio</div>
            <div style={{marginLeft: 'auto', fontFamily: FONT, fontWeight: 600, fontSize: 22, color: '#5B3FE4', background: '#F1EFFB', padding: '10px 18px', borderRadius: 99}}>+ Nouvelle pub</div>
          </div>
          <div style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 62, letterSpacing: '-0.035em', color: INK, marginTop: 60, lineHeight: 1.04}}>Que veux-tu créer<br /><GradText>aujourd’hui ?</GradText></div>
          <div style={{display: 'flex', gap: 12, marginTop: 40, flexWrap: 'wrap'}}>
            <Chip><span style={{width: 40, height: 40, borderRadius: 20, background: c.brand.bg ?? '#3B2416', color: c.brand.fg ?? '#F4D8B0', fontWeight: 800, fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{c.brand.initials}</span>{c.brand.name}</Chip>
            <Chip><span style={{fontSize: 24}}>{c.productIcon ?? '☕'}</span>{c.product}</Chip>
            {locked && (
              <Chip style={{transform: `scale(${chipIn})`, borderColor: '#C9C0F7', background: '#F6F4FF'}}>
                <Img src={staticFile(`media/${c.actor.img}`)} style={{width: 40, height: 40, borderRadius: 20, objectFit: 'cover'}} />Actrice : {c.actor.name}
              </Chip>
            )}
          </div>
          <div style={{marginTop: 34, flex: 1, borderRadius: 28, background: '#F8F7FC', border: `1px solid ${LINE}`, padding: '30px 32px', position: 'relative'}}>
            <div style={{fontFamily: FONT, fontWeight: 500, fontSize: 37, lineHeight: 1.28, color: txt ? INK : MUTED}}>
              {txt || 'Décris ta pub…'}
              {f < T.send && <span style={{display: 'inline-block', width: 3, height: 44, marginLeft: 3, verticalAlign: 'middle', background: f % 30 < 16 ? '#5B3FE4' : 'transparent'}} />}
            </div>
            <div style={{position: 'absolute', right: 22, bottom: 22}}><SendBtn s={92} press={press} /></div>
            <div style={{position: 'absolute', left: 32, bottom: 30, fontFamily: FONT, fontSize: 22, fontWeight: 600, color: MUTED, display: 'flex', gap: 18}}><span>9:16 · 4:5 · 1:1</span><span>Voix FR</span><span>Sous-titres</span></div>
          </div>
        </div>
      </div>
      {/* sélecteur d'acteurs */}
      <ActorPicker c={c} T={T} leave={leave} />
      {f >= T.send - 20 && f < T.gen + 6 && (
        <Pointer x={interpolate(curP, [0, 1], [760, 908])} y={interpolate(curP, [0, 1], [1260, 966])} press={press} o={1 - leave} />
      )}
    </AbsoluteFill>
  );
};

const Chip: React.FC<{children: React.ReactNode; style?: React.CSSProperties}> = ({children, style}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: 12, padding: '8px 22px 8px 8px', borderRadius: 99, border: `1px solid ${LINE}`, background: '#fff', fontFamily: FONT, fontWeight: 600, fontSize: 26, color: INK, ...style}}>{children}</div>
);

const ActorPicker: React.FC<{c: LightCfg; T: ReturnType<typeof lightTimeline>; leave: number}> = ({c, T, leave}) => {
  const f = useCurrentFrame();
  const show = prog(f, T.pick, 14);
  const hide = prog(f, T.lock + 10, 14, INOUT);
  if (f < T.pick || hide >= 1) return null;
  const faces = [...c.gallery, c.actor.img, ...c.gallery.slice(0, 3)];
  const target = c.gallery.length; // index de l'actrice
  const W = 176, G = 18;
  const scroll = interpolate(f, [T.pick, T.lock], [0, 1], {...clamp, easing: EXPO});
  const x = 540 - W / 2 - interpolate(scroll, [0, 1], [0, target]) * (W + G);
  const lock = f >= T.lock;
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 1100, height: 330, opacity: show * (1 - hide) * (1 - leave), transform: `translateY(${(1 - show) * 60 + hide * 40}px)`}}>
      <div style={{textAlign: 'center', fontFamily: FONT, fontWeight: 700, fontSize: 24, letterSpacing: '0.16em', color: MUTED}}>CHOISIR UN ACTEUR · 200 VISAGES RÉALISTES</div>
      <div style={{position: 'absolute', top: 62, left: x, display: 'flex', gap: G}}>
        {faces.map((img, i) => {
          const d = Math.abs(i - interpolate(scroll, [0, 1], [0, target]));
          const isT = i === target && lock;
          return (
            <div key={i} style={{width: W, height: 236, borderRadius: 28, overflow: 'hidden', position: 'relative', transform: `scale(${1 - Math.min(d, 2) * 0.09 + (isT ? 0.06 * sp(f - T.lock, 10) : 0)})`, opacity: 1 - Math.min(d, 3) * 0.22, boxShadow: isT ? '0 0 0 6px #fff, 0 0 0 11px #6D4CF0, 0 30px 50px -20px rgba(91,63,228,0.6)' : '0 20px 40px -24px rgba(11,10,31,0.5)'}}>
              <Img src={staticFile(`media/${img}`)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
              {isT && <div style={{position: 'absolute', right: 10, top: 10, width: 40, height: 40, borderRadius: 20, background: GRAD, color: '#fff', fontSize: 24, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${sp(f - T.lock - 2, 9)})`}}>✓</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ---------- C. atelier : script / tournage / montage ----------
const Workshop: React.FC<{c: LightCfg; T: ReturnType<typeof lightTimeline>}> = ({c, T}) => {
  const f = useCurrentFrame();
  const inP = prog(f, T.gen + 4, 18);
  const coll = prog(f, T.collapse, 18, INOUT);
  const steps = [
    {k: 'Script', d: 'Accroche, bénéfice, appel', a: T.write},
    {k: 'Tournage', d: `${c.actor.name}, voix française`, a: T.shoot},
    {k: 'Montage', d: 'Coupes, zooms, sous-titres', a: T.edit},
  ];
  // cadre 9:16 qui devient plein écran
  const fx = interpolate(coll, [0, 1], [520, 0]);
  const fy = interpolate(coll, [0, 1], [300, 0]);
  const fw = interpolate(coll, [0, 1], [440, 1080]);
  const fh = interpolate(coll, [0, 1], [782, 1920]);
  const fr = interpolate(coll, [0, 1], [40, 0]);
  const shot = prog(f, T.shoot, 16);
  const seg0 = c.segments[0];
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 80, top: 330, width: 410, opacity: inP * (1 - coll), transform: `translateX(${(1 - inP) * -60 - coll * 80}px)`}}>
        <div style={{fontFamily: FONT, fontWeight: 700, fontSize: 22, letterSpacing: '0.16em', color: MUTED}}>GROWTHITY CRÉE…</div>
        {steps.map((s, i) => {
          const on = f >= s.a;
          const p = sp(f - s.a, 12);
          return (
            <div key={s.k} style={{marginTop: i ? 18 : 26, padding: '24px 24px', borderRadius: 28, background: '#fff', border: `1.5px solid ${on ? '#C9C0F7' : LINE}`, boxShadow: on ? '0 24px 50px -28px rgba(91,63,228,0.55)' : 'none', display: 'flex', alignItems: 'center', gap: 18, transform: `scale(${on ? 1 + 0.03 * (1 - p) : 0.97})`}}>
              <div style={{width: 54, height: 54, borderRadius: 27, flexShrink: 0, background: on ? GRAD : '#F1F0F6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 28, fontWeight: 800}}>
                {on ? <span style={{transform: `scale(${p})`}}>✓</span> : <span style={{color: MUTED, fontSize: 24}}>{i + 1}</span>}
              </div>
              <div>
                <div style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 38, color: on ? INK : '#B9B6CB', letterSpacing: '-0.02em'}}>{s.k}</div>
                <div style={{fontFamily: FONT, fontWeight: 500, fontSize: 21, color: MUTED, marginTop: 2}}>{s.d}</div>
              </div>
            </div>
          );
        })}
      </div>
      {/* timeline de montage */}
      <Timeline T={T} o={inP * (1 - coll)} tags={c.tags} />
      {/* cadre de la pub */}
      <div style={{position: 'absolute', left: fx, top: fy, width: fw, height: fh, borderRadius: fr, overflow: 'hidden', background: '#fff', border: coll < 1 ? `1px solid ${LINE}` : 'none', boxShadow: coll < 1 ? SHADOW : 'none', opacity: inP, transform: `translateY(${(1 - inP) * 80}px)`}}>
        {/* script tapé */}
        <div style={{position: 'absolute', inset: 0, padding: 34, opacity: 1 - shot}}>
          <div style={{fontFamily: FONT, fontWeight: 700, fontSize: 18, letterSpacing: '0.14em', color: '#6D4CF0'}}>SCRIPT · 15 S</div>
          {c.script.map((l, i) => {
            const a = T.write - 20 + i * 7;
            const n = Math.max(0, Math.floor((f - a) * 2.4));
            return <div key={i} style={{marginTop: 24, fontFamily: FONT, fontWeight: 600, fontSize: 27, lineHeight: 1.35, color: INK}}>{l.slice(0, n)}</div>;
          })}
        </div>
        {/* tournage : la vidéo apparaît */}
        {f >= T.shoot - 2 && (
          <div style={{position: 'absolute', inset: 0, opacity: shot, filter: `blur(${(1 - shot) * 14}px)`}}>
            <OffthreadVideo muted src={staticFile(`media/${c.video}`)} startFrom={Math.round(seg0.from * 30)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
            <div style={{position: 'absolute', left: 22, top: 22, display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', borderRadius: 99, background: 'rgba(11,10,31,0.55)', color: '#fff', fontFamily: FONT, fontWeight: 700, fontSize: 18, opacity: 1 - coll}}>
              <span style={{width: 12, height: 12, borderRadius: 6, background: f % 20 < 12 ? '#EF4444' : 'transparent'}} />REC
            </div>
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};

const Timeline: React.FC<{T: ReturnType<typeof lightTimeline>; o: number; tags: string[]}> = ({T, o, tags}) => {
  const f = useCurrentFrame();
  const blocks = [0.22, 0.18, 0.26, 0.16, 0.18];
  const ed = prog(f, T.edit - 4, 22);
  const play = interpolate(f, [T.edit, T.collapse], [0, 1], clamp);
  let acc = 0;
  return (
    <div style={{position: 'absolute', left: 80, top: 1140, width: 880, height: 220, borderRadius: 30, background: '#fff', border: `1px solid ${LINE}`, boxShadow: SHADOW, opacity: o, padding: '22px 26px', boxSizing: 'border-box'}}>
      <div style={{display: 'flex', justifyContent: 'space-between', fontFamily: FONT, fontWeight: 700, fontSize: 18, letterSpacing: '0.12em', color: MUTED}}><span>MONTAGE</span><span>00:{String(Math.floor(play * 15)).padStart(2, '0')} / 00:15</span></div>
      <div style={{position: 'relative', marginTop: 16, height: 56, display: 'flex', gap: 6}}>
        {blocks.map((b, i) => {
          const p = prog(f, T.edit - 6 + i * 4, 10);
          acc += b;
          return <div key={i} style={{width: `${b * 100}%`, height: '100%', borderRadius: 12, background: i % 2 ? 'linear-gradient(120deg,#C7D2FE,#DDD6FE)' : 'linear-gradient(120deg,#A5B4FC,#C4B5FD)', transform: `translateY(${(1 - p) * -40}px)`, opacity: p}} />;
        })}
        <div style={{position: 'absolute', top: -8, bottom: -78, left: `${play * 100}%`, width: 4, borderRadius: 2, background: '#6D4CF0', opacity: ed}} />
      </div>
      <div style={{marginTop: 10, height: 30, display: 'flex', alignItems: 'center', gap: 3}}>
        {Array.from({length: 92}, (_, i) => {
          const hgt = 4 + Math.abs(Math.sin(i * 1.7) * Math.cos(i * 0.37)) * 26;
          return <div key={i} style={{width: 5, height: hgt * ed, borderRadius: 3, background: i / 92 < play ? '#6D4CF0' : '#D9D6E8'}} />;
        })}
      </div>
      <div style={{marginTop: 10, display: 'flex', gap: 6}}>
        {tags.map((t, i) => (
          <div key={t} style={{padding: '4px 12px', borderRadius: 8, background: '#0B0A1F', color: '#fff', fontFamily: FONT, fontWeight: 800, fontSize: 15, opacity: prog(f, T.edit + 2 + i * 3, 8)}}>{t}</div>
        ))}
      </div>
    </div>
  );
};

// ---------- D. la pub montée ----------
const Ad: React.FC<{c: LightCfg}> = ({c}) => {
  const f = useCurrentFrame();
  let acc = 0;
  const t = f / 30;
  const cur = c.adWords.filter((w) => w.s <= t + 0.02);
  // groupe de 2-3 mots
  const groups: Word[][] = [];
  let g: Word[] = [];
  c.adWords.forEach((w, i) => {
    const prev = c.adWords[i - 1];
    if (g.length && (g.length >= 2 || (prev && w.s - prev.e > 0.35) || /[.,!?…]$/.test(prev?.w ?? ''))) { groups.push(g); g = []; }
    g.push(w);
  });
  if (g.length) groups.push(g);
  const gi = groups.findIndex((gr, i) => t >= gr[0].s - 0.05 && t < (groups[i + 1]?.[0].s ?? gr[gr.length - 1].e + 0.6) - 0.05);
  const group = gi >= 0 ? groups[gi] : null;
  const tag = prog(f, 8, 14) * (1 - prog(f, 80, 12));
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {c.segments.map((s, i) => {
        const from = acc;
        const dur = Math.round((s.to - s.from) * 30);
        acc += dur;
        return (
          <Sequence key={i} from={from} durationInFrames={dur}>
            <SegVideo src={c.video} start={s.from} zoom={s.zoom ?? 1} dur={dur} shake={i === 0} />
          </Sequence>
        );
      })}
      {/* flash blanc aux coupes */}
      {(() => {
        let a = 0;
        return c.segments.slice(0, -1).map((s, i) => {
          a += Math.round((s.to - s.from) * 30);
          const o = interpolate(f, [a - 1, a, a + 4], [0, 0.35, 0], clamp);
          return <AbsoluteFill key={i} style={{background: '#fff', opacity: o}} />;
        });
      })()}
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0.25) 0%, transparent 18%, transparent 52%, rgba(0,0,0,0.35) 75%, transparent 100%)'}} />
      <div style={{position: 'absolute', left: 60, top: 150, display: 'flex', alignItems: 'center', gap: 12, padding: '14px 24px 14px 16px', borderRadius: 99, background: 'rgba(255,255,255,0.92)', boxShadow: '0 20px 40px -20px rgba(0,0,0,0.6)', opacity: tag, transform: `translateY(${(1 - tag) * -20}px)`}}>
        <LogoMark size={34} />
        <span style={{fontFamily: FONT, fontWeight: 700, fontSize: 26, color: INK}}>Pub générée avec Growthity</span>
      </div>
      {group && (
        <div style={{position: 'absolute', left: 70, right: 130, top: 1130, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '6px 16px'}}>
          {group.map((w, i) => {
            const on = t >= w.s - 0.03;
            const nxt = group[i + 1];
            const active = on && (nxt ? t < nxt.s - 0.02 : t < w.e + 0.25);
            const p = sp(f - Math.round(w.s * 30), 11);
            return (
              <span key={i} style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 96, letterSpacing: '-0.02em', textTransform: 'uppercase', color: '#fff', padding: '0 14px', borderRadius: 18, background: active ? GRAD : 'transparent', opacity: on ? 1 : 0.0, transform: `scale(${on ? 0.85 + 0.15 * p : 0.85})`, textShadow: active ? 'none' : '0 4px 20px rgba(0,0,0,0.55), 0 2px 4px rgba(0,0,0,0.6)'}}>{w.w.replace(/[.,!?…]+$/, '')}</span>
            );
          })}
        </div>
      )}
      {/* barre de progression */}
      <div style={{position: 'absolute', left: 60, right: 60, top: 96, height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.3)'}}>
        <div style={{width: `${(f / Math.max(1, adFrames(c))) * 100}%`, height: '100%', borderRadius: 3, background: '#fff'}} />
      </div>
    </AbsoluteFill>
  );
};

const SegVideo: React.FC<{src: string; start: number; zoom: number; dur: number; shake?: boolean}> = ({src, start, zoom, dur, shake}) => {
  const f = useCurrentFrame();
  // « punch » à chaque coupe : léger dézoom rapide puis dérive lente
  const z = zoom + 0.07 * (1 - prog(f, 0, 7)) + interpolate(f, [0, dur], [0, 0.035], clamp);
  const sx = shake && f < 14 ? Math.sin(f * 2.3) * 9 * (1 - f / 14) : 0;
  const sy = shake && f < 14 ? Math.cos(f * 1.9) * 7 * (1 - f / 14) : 0;
  return <OffthreadVideo src={staticFile(`media/${src}`)} startFrom={Math.round(start * 30)} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `translate(${sx}px, ${sy}px) scale(${z})`, transformOrigin: '50% 38%'}} />;
};

// ---------- E. formats + publication ----------
const Formats: React.FC<{c: LightCfg; T: ReturnType<typeof lightTimeline>}> = ({c, T}) => {
  const f = useCurrentFrame(); // local (0 = fin de la pub)
  const d1 = c.words['d1'];
  const into = prog(f, 0, 22, EXPO);
  const meta = 6 + Math.round((d1.find((w) => w.w.toLowerCase().startsWith('meta'))?.s ?? 1.6) * 30);
  const press = T.press - T.fmt;
  const done = f >= press + 6;
  const pr = f >= press && f < press + 6 ? 1 : 0;
  const frames = [
    {l: 'Reels · Story', r: '9:16', x: 72},
    {l: 'Post Instagram', r: '4:5', x: 390},
    {l: 'Post Facebook', r: '1:1', x: 708},
  ];
  const btn = sp(f - (meta - 10), 13);
  const curP = prog(f, press - 18, 16, INOUT);
  const out = prog(f, T.end - T.fmt - 10, 12, INOUT);
  return (
    <AbsoluteFill style={{opacity: 1 - out}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 300, textAlign: 'center', fontFamily: DISPLAY, fontWeight: 700, fontSize: 96, letterSpacing: '-0.04em', color: INK, lineHeight: 1, opacity: prog(f, 4, 12), transform: `translateY(${(1 - prog(f, 4, 14)) * 40}px)`}}>
        Tous les <GradText>formats.</GradText>
      </div>
      {frames.map((fr, i) => {
        const p = sp(f - 4 - i * 5, 14);
        // le Reels arrive depuis le plein écran
        const big = i === 0 ? 1 - into : 0;
        const x = interpolate(big, [0, 1], [fr.x, 0]);
        const y = interpolate(big, [0, 1], [440, 0]);
        const w = interpolate(big, [0, 1], [300, 1080]);
        const sc = w / 300;
        return (
          <React.Fragment key={i}>
            <div style={{position: 'absolute', left: x, top: y, width: 300, transformOrigin: '0 0', transform: `scale(${sc}) translateY(${i === 0 ? 0 : (1 - p) * 80}px)`, opacity: i === 0 ? 1 : p, filter: big < 0.05 ? 'drop-shadow(0 30px 40px rgba(46,32,140,0.28))' : undefined}}>
              {i === 0 && <ReelMock c={c} chrome={1 - big} />}
              {i === 1 && <FeedMock c={c} ratio={1.25} ig />}
              {i === 2 && <FeedMock c={c} ratio={1} />}
            </div>
            <div style={{position: 'absolute', left: fr.x, width: 300, top: 1010, textAlign: 'center', opacity: prog(f, 10 + i * 5, 10)}}>
              <div style={{display: 'inline-block', padding: '6px 14px', borderRadius: 99, background: '#EEEBFD', color: '#5B3FE4', fontFamily: FONT, fontWeight: 800, fontSize: 22}}>{fr.r}</div>
              <div style={{fontFamily: FONT, fontWeight: 600, fontSize: 24, color: INK, marginTop: 8}}>{fr.l}</div>
            </div>
          </React.Fragment>
        );
      })}
      {/* publication */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 1180, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22, opacity: Math.min(1, btn * 1.3), transform: `translateY(${(1 - btn) * 50}px)`}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 16, padding: '26px 46px', borderRadius: 99, background: done ? '#fff' : META, border: done ? `1.5px solid ${LINE}` : 'none', color: done ? INK : '#fff', fontFamily: FONT, fontWeight: 800, fontSize: 36, boxShadow: done ? SHADOW : '0 24px 50px -20px rgba(8,102,255,0.8)', transform: `scale(${1 - pr * 0.06 + (done ? 0.04 * (1 - sp(f - press - 6, 10)) : 0)})`}}>
          {done ? (<><span style={{width: 44, height: 44, borderRadius: 22, background: '#16A34A', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26}}>✓</span>En ligne sur Meta</>) : (<><MetaMark c="#fff" />Publier sur Meta</>)}
        </div>
        {done && (
          <div style={{display: 'flex', gap: 14}}>
            {[{n: 'Facebook', c: '#1877F2'}, {n: 'Instagram', c: '#E1306C'}].map((p, i) => (
              <div key={p.n} style={{display: 'flex', alignItems: 'center', gap: 10, padding: '10px 20px', borderRadius: 99, background: '#fff', border: `1px solid ${LINE}`, fontFamily: FONT, fontWeight: 700, fontSize: 24, color: INK, transform: `scale(${sp(f - press - 10 - i * 4, 11)})`}}>
                <span style={{width: 14, height: 14, borderRadius: 7, background: p.c}} />{p.n}
              </div>
            ))}
          </div>
        )}
      </div>
      {f >= press - 20 && f < press + 16 && <Pointer x={interpolate(curP, [0, 1], [760, 610])} y={interpolate(curP, [0, 1], [1440, 1230])} press={pr} o={1 - prog(f, press + 8, 8)} />}
    </AbsoluteFill>
  );
};


// ---------- maquettes de placement (largeur 300) ----------
const Clip: React.FC<{c: LightCfg; pos: string}> = ({c, pos}) => (
  <OffthreadVideo muted src={staticFile(`media/${c.video}`)} startFrom={Math.round((c.formatFrom ?? c.segments[0].from) * 30)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: pos}} />
);
const Handle: React.FC<{c: LightCfg; dark?: boolean}> = ({c, dark}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: 7}}>
    <span style={{width: 24, height: 24, borderRadius: 12, background: c.brand.bg ?? '#3B2416', color: c.brand.fg ?? '#F4D8B0', fontSize: 9, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', border: dark ? '1.5px solid #fff' : 'none'}}>{c.brand.initials}</span>
    <div style={{lineHeight: 1.1}}>
      <div style={{fontSize: 12, fontWeight: 700, color: dark ? '#fff' : INK}}>{c.brand.handle}</div>
      <div style={{fontSize: 10, color: dark ? 'rgba(255,255,255,0.8)' : MUTED}}>Sponsorisé</div>
    </div>
  </div>
);
const Sub: React.FC<{t: string; size: number}> = ({t, size}) => (
  <div style={{position: 'absolute', left: 0, right: 0, top: '58%', textAlign: 'center'}}>
    <span style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: size, color: '#fff', padding: '1px 7px', borderRadius: 6, background: GRAD, textTransform: 'uppercase'}}>{t}</span>
  </div>
);
const ReelMock: React.FC<{c: LightCfg; chrome: number}> = ({c, chrome}) => (
  <div style={{position: 'relative', width: 300, height: 533, borderRadius: 26 * chrome, overflow: 'hidden', background: '#000', fontFamily: FONT, border: chrome > 0.05 ? '4px solid #fff' : 'none', boxSizing: 'border-box'}}>
    <Clip c={c} pos="50% 50%" />
    <div style={{position: 'absolute', inset: 0, opacity: chrome}}>
      <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 60%, rgba(0,0,0,0.55))'}} />
      <Sub t={c.formatSub} size={22} />
      <div style={{position: 'absolute', right: 10, bottom: 92, display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center', color: '#fff', fontSize: 20}}>♡<span>💬</span><span>➤</span></div>
      <div style={{position: 'absolute', left: 12, bottom: 46}}><Handle c={c} dark /></div>
      <div style={{position: 'absolute', left: 12, right: 50, bottom: 12, padding: '6px 0', borderRadius: 6, background: 'rgba(255,255,255,0.92)', textAlign: 'center', fontSize: 12, fontWeight: 700, color: INK}}>En savoir plus</div>
    </div>
  </div>
);
const FeedMock: React.FC<{c: LightCfg; ratio: number; ig?: boolean}> = ({c, ratio, ig}) => (
  <div style={{width: 300, borderRadius: 18, overflow: 'hidden', background: '#fff', border: `1px solid ${LINE}`, fontFamily: FONT}}>
    <div style={{padding: '9px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}><Handle c={c} /><span style={{color: MUTED, fontSize: 14}}>•••</span></div>
    {!ig && <div style={{padding: '0 10px 7px', fontSize: 11, color: INK, lineHeight: 1.3}}>{c.formatText}</div>}
    <div style={{position: 'relative', width: 300, height: 300 * ratio, background: '#000'}}>
      <Clip c={c} pos={ratio > 1 ? '50% 46%' : '50% 52%'} />
      <Sub t={c.formatSub} size={ratio > 1 ? 18 : 16} />
    </div>
    <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', background: ig ? META : '#F0F2F5', color: ig ? '#fff' : INK, fontSize: 12, fontWeight: 700}}>
      <span>{ig ? 'En savoir plus' : c.brand.site}</span>
      {ig ? <span>›</span> : <span style={{padding: '4px 10px', borderRadius: 6, background: '#E4E6EB'}}>En savoir plus</span>}
    </div>
    {ig && <div style={{padding: '7px 10px', display: 'flex', gap: 12, fontSize: 16, color: INK}}>♡ <span>💬</span> <span>➤</span></div>}
  </div>
);

const MetaMark: React.FC<{c?: string}> = ({c = META}) => (
  <svg width={52} height={32} viewBox="0 0 48 30" fill="none"><path d="M6 22 C6 12 10 5 15 5 C20 5 24 13 27 18 C30 23 32 25 35 25 C39 25 42 21 42 15 C42 9 39 5 35 5 C30 5 26 13 23 18 C20 23 18 25 14 25 C9 25 6 22 6 22 Z" stroke={c} strokeWidth={4} strokeLinecap="round" /></svg>
);

// ---------- F. carte de fin ----------
const End: React.FC = () => {
  const f = useCurrentFrame();
  const a = sp(f - 4, 14);
  const b = sp(f - 12, 14);
  const pill = sp(f - 22, 14);
  const txt = 'Une pub pour mon commerce…';
  const n = Math.max(0, Math.floor((f - 30) * 1.1));
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 0, right: 0, top: 470, display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: a, transform: `translateY(${(1 - a) * 40}px)`}}>
        <div style={{width: 128, height: 128, borderRadius: 36, background: '#fff', boxShadow: SHADOW, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${LINE}`}}><LogoMark size={82} draw={prog(f, 4, 26)} /></div>
        <div style={{marginTop: 30}}><Wordmark size={70} /></div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 790, textAlign: 'center', fontFamily: DISPLAY, fontWeight: 700, fontSize: 116, letterSpacing: '-0.045em', lineHeight: 1.02, color: INK, opacity: b, transform: `translateY(${(1 - b) * 50}px)`}}>
        Ta pub,<br /><GradText>en une phrase.</GradText>
      </div>
      <div style={{position: 'absolute', left: 100, width: 880, top: 1120, height: 124, borderRadius: 62, background: '#fff', border: `1px solid ${LINE}`, boxShadow: SHADOW, display: 'flex', alignItems: 'center', padding: '0 14px 0 42px', opacity: pill, transform: `translateY(${(1 - pill) * 40}px)`}}>
        <div style={{flex: 1, fontFamily: FONT, fontWeight: 500, fontSize: 32, color: n ? INK : MUTED, whiteSpace: 'nowrap', overflow: 'hidden'}}>{n ? txt.slice(0, n) : 'Décris ta pub…'}</div>
        <div style={{padding: '26px 38px', borderRadius: 50, background: GRAD, color: '#fff', fontFamily: FONT, fontWeight: 800, fontSize: 32, boxShadow: '0 18px 36px -14px rgba(91,63,228,0.8)', transform: `scale(${1 + 0.03 * Math.sin(f / 6) * prog(f, 50, 10)})`}}>Commencer →</div>
      </div>
    </AbsoluteFill>
  );
};

export const LightChatPub: React.FC<{cfg: LightCfg}> = ({cfg: c}) => {
  useFonts();
  const T = lightTimeline(c);
  const f = useCurrentFrame();
  const vo = (k: string, from: number) => (c.voice[k] ? <Sequence from={from}><Audio src={staticFile(`voice/${c.voice[k]}.mp3`)} /></Sequence> : null);
  return (
    <AbsoluteFill style={{background: BG, fontFamily: FONT}}>
      {(f < T.ad || f >= T.adEnd) && <LightBg />}
      {f < T.gen + 20 && <Hook c={c} T={T} />}
      {f >= T.chat && f < T.gen + 20 && <Chat c={c} T={T} />}
      {f >= T.gen && f < T.ad && <Workshop c={c} T={T} />}
      <Sequence from={T.ad} durationInFrames={T.adEnd - T.ad}><Ad c={c} /></Sequence>
      <Sequence from={T.fmt} durationInFrames={T.end - T.fmt}><Formats c={c} T={T} /></Sequence>
      <Sequence from={T.end}><End /></Sequence>
      <Audio src={staticFile(c.bed)} />
      {vo('h1', T.h1)}
      {vo('h2', T.h2)}
      {vo('b1', T.b1)}
      {vo('b2', T.b2)}
      {vo('d1', T.fmt + 6)}
      {vo('d2', T.end + 6)}
    </AbsoluteFill>
  );
};
