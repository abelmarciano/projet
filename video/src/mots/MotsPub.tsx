// « Tes mots deviennent des pubs. » — pub Growthity motion design (9:16, ~25 s).
// Accroche → la phrase s'écrit en grand → chaque mot clé se transforme (produit, ambiance, réseau)
// → tout s'assemble dans un téléphone qui lit la vraie vidéo produit (Kling) → 3 versions testées, la meilleure reste en ligne
// → « Tes mots deviennent des pubs. » + « Commencer ». Aucun chiffre. Rien d'essentiel sous y = 1440.
import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, continueRender, delayRender, interpolate, random, spring, staticFile, useCurrentFrame} from 'remotion';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/inter/800.css';
import '@fontsource/space-grotesk/500.css';
import '@fontsource/space-grotesk/600.css';
import '@fontsource/space-grotesk/700.css';
import {LogoMark, Wordmark} from '../components/UI';
import {EXPO, INOUT, prog} from '../components/anim';
import WORDS from './words.json';

type Word = {w: string; s: number; e: number};
const WD = WORDS as Record<string, Word[]>;
const BG = '#07061A';
const GRAD = 'linear-gradient(120deg, #3B82F6 0%, #7C5CFF 50%, #C084FC 100%)';
const WARM = 'linear-gradient(120deg, #F59E0B 0%, #F97316 50%, #FB7185 100%)';
const DISPLAY = '"Space Grotesk", Inter, sans-serif';
const FONT = 'Inter, system-ui, sans-serif';
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const CLIP = 'mots/bougie.mp4';
const PHOTO = 'media/fal/social/products/bougie.jpg';

export const VO = {1: 6, 2: 72, 3: 186, 4: 316, 5: 505, 6: 632} as Record<number, number>;
export const T = {hook: 0, prompt: 66, typeA: 84, typeB: 176, assemble: 300, ad: 332, variants: 492, end: 622, total: 744};
const cue = (k: number, start: string, d = 0) => {
  const w = WD[`mots-${k}`].find((x) => x.w.toLowerCase().startsWith(start));
  return VO[k] + Math.round((w ? w.s : d) * 30);
};
const sp = (f: number, d = 14, m = 0.8) => spring({frame: f, fps: 30, config: {damping: d, mass: m, stiffness: 140}});
const G: React.FC<{children: React.ReactNode; warm?: boolean}> = ({children, warm}) => (
  <span style={{backgroundImage: warm ? WARM : GRAD, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent'}}>{children}</span>
);

const useFonts = () => {
  const [h] = useState(() => delayRender('fonts'));
  useEffect(() => {
    Promise.all(['500 20px Inter', '600 20px Inter', '700 20px Inter', '800 20px Inter', '500 20px "Space Grotesk"', '700 20px "Space Grotesk"'].map((s) => document.fonts.load(s))).then(() => continueRender(h));
  }, [h]);
};

// ---------- fond : aurore lente + grain + poussière ----------
const Aurora: React.FC<{warm: number}> = ({warm}) => {
  const f = useCurrentFrame();
  const a = Math.sin(f / 60) * 8, b = Math.cos(f / 75) * 10;
  return (
    <AbsoluteFill style={{background: BG}}>
      <AbsoluteFill style={{background: `radial-gradient(900px 800px at ${25 + a}% ${20 + b / 2}%, rgba(91,63,228,0.45), transparent 65%)`}} />
      <AbsoluteFill style={{background: `radial-gradient(800px 800px at ${80 - a}% ${78 - b / 2}%, rgba(192,132,252,0.25), transparent 65%)`}} />
      <AbsoluteFill style={{background: `radial-gradient(900px 700px at 50% 62%, rgba(249,115,22,${0.32 * warm}), transparent 65%)`}} />
      {Array.from({length: 36}, (_, i) => {
        const x = random(`dx${i}`) * 1080, y0 = random(`dy${i}`) * 1920;
        const y = (y0 - f * (0.4 + random(`ds${i}`) * 0.8) + 1920) % 1920;
        return <div key={i} style={{position: 'absolute', left: x, top: y, width: 3, height: 3, borderRadius: 2, background: '#fff', opacity: 0.12 + random(`do${i}`) * 0.25}} />;
      })}
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.6) 100%)'}} />
    </AbsoluteFill>
  );
};

// ---------- 1. accroche ----------
const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const w = WD['mots-1'];
  const at = (i: number) => VO[1] + Math.round(w[i].s * 30) - 2;
  const lines = [
    {t: 'Et si tes mots', a: at(0)},
    {t: 'devenaient', a: at(4)},
    {t: 'une pub ?', a: at(5), g: true},
  ];
  const out = prog(f, T.prompt - 6, 12, INOUT);
  return (
    <div style={{position: 'absolute', left: 60, right: 60, top: 700, textAlign: 'center', fontFamily: DISPLAY, fontWeight: 700, letterSpacing: '-0.05em', lineHeight: 1.0, color: '#fff', transform: `translateY(${-out * 80}px) scale(${1 - out * 0.1})`, opacity: 1 - out, filter: `blur(${out * 10}px)`}}>
      {lines.map((l, i) => {
        const p = sp(f - l.a, 13);
        return (
          <div key={i} style={{overflow: 'hidden', paddingBottom: 14}}>
            <div style={{fontSize: i === 2 ? 168 : 118, transform: `translateY(${(1 - p) * 110}%)`}}>{l.g ? <G>{l.t}</G> : l.t}</div>
          </div>
        );
      })}
    </div>
  );
};

// ---------- 2-3. la phrase et ses mots clés ----------
const PROMPT: {t: string; k?: 'p' | 'a' | 'r'}[] = [
  {t: 'Une vidéo pour mes '}, {t: 'bougies', k: 'p'}, {t: ', ambiance '}, {t: 'cocooning', k: 'a'}, {t: ', pour '}, {t: 'Instagram', k: 'r'}, {t: '.'},
];
const FULL = PROMPT.map((p) => p.t).join('');

const Prompt: React.FC = () => {
  const f = useCurrentFrame();
  const inP = prog(f, T.prompt, 16);
  const out = prog(f, T.assemble, 16, INOUT);
  const n = Math.round(interpolate(f, [T.typeA, T.typeB], [0, FULL.length], clamp));
  const keyAt = {p: cue(3, 'produit', 1.2) - 4, a: cue(3, 'ambiance', 2.2) - 4, r: cue(3, 'réseau', 3.3) - 4};
  let used = 0;
  return (
    <div style={{position: 'absolute', left: 80, right: 80, top: 330, opacity: inP * (1 - out), transform: `translateY(${(1 - inP) * 40 - out * 120}px) scale(${1 - out * 0.08})`, filter: `blur(${out * 8}px)`}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 12, fontFamily: FONT, fontWeight: 800, fontSize: 24, letterSpacing: '0.18em', color: 'rgba(255,255,255,0.55)'}}>
        <LogoMark size={30} color="#A78BFA" /> TA PHRASE
      </div>
      <div style={{marginTop: 26, padding: '34px 38px', borderRadius: 34, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.14)', boxShadow: '0 40px 80px -40px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)', fontFamily: DISPLAY, fontWeight: 600, fontSize: 76, lineHeight: 1.18, letterSpacing: '-0.03em', color: '#fff', minHeight: 360}}>
        {PROMPT.map((p, i) => {
          const start = used;
          used += p.t.length;
          const vis = p.t.slice(0, Math.max(0, Math.min(p.t.length, n - start)));
          if (!vis) return null;
          if (!p.k) return <span key={i}>{vis}</span>;
          const a = keyAt[p.k];
          const h = sp(f - a, 11);
          const warm = p.k === 'a';
          return (
            <span key={i} style={{position: 'relative', display: 'inline-block'}}>
              <span style={{position: 'absolute', left: -8, right: -8, top: 6, bottom: 2, borderRadius: 16, background: warm ? WARM : GRAD, transform: `scaleX(${h})`, transformOrigin: 'left center', opacity: 0.95}} />
              <span style={{position: 'relative', color: '#fff'}}>{vis}</span>
            </span>
          );
        })}
        {f < T.assemble && <span style={{display: 'inline-block', width: 6, height: 78, marginLeft: 6, verticalAlign: 'middle', background: f % 30 < 16 ? '#A78BFA' : 'transparent', borderRadius: 3}} />}
      </div>
    </div>
  );
};

// cartes nées des mots clés
const CARD_W = 290, CARD_H = 400, CARD_Y = 900;
const cardX = [80, 395, 710];
const KeyCards: React.FC = () => {
  const f = useCurrentFrame();
  const keyAt = [cue(3, 'produit', 1.2), cue(3, 'ambiance', 2.2), cue(3, 'réseau', 3.3)];
  const asm = prog(f, T.assemble, 26, INOUT);
  return (
    <>
      {[0, 1, 2].map((i) => {
        const p = sp(f - keyAt[i], 12);
        if (f < keyAt[i] - 1) return null;
        // assemblage : vers l'écran du téléphone
        const x = interpolate(asm, [0, 1], [cardX[i], 540 - CARD_W / 2]);
        const y = interpolate(asm, [0, 1], [CARD_Y, 860 - CARD_H / 2]);
        const s = interpolate(asm, [0, 1], [1, 0.5]);
        const rot = interpolate(asm, [0, 1], [[-4, 2, 5][i], 0]) * (1 - asm) + (1 - p) * [-12, 0, 12][i];
        return (
          <div key={i} style={{position: 'absolute', left: x, top: y, width: CARD_W, height: CARD_H, transform: `translateY(${(1 - p) * -260}px) scale(${s * (0.6 + 0.4 * p)}) rotate(${rot}deg)`, opacity: Math.min(1, p * 1.4) * (1 - prog(f, T.assemble + 20, 8)), borderRadius: 30, overflow: 'hidden', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.18)', boxShadow: '0 40px 80px -30px rgba(0,0,0,0.9)', backdropFilter: 'blur(10px)'}}>
            {i === 0 && <ProductCard t={f - keyAt[0]} />}
            {i === 1 && <MoodCard t={f - keyAt[1]} />}
            {i === 2 && <NetCard t={f - keyAt[2]} />}
          </div>
        );
      })}
    </>
  );
};

const CardLabel: React.FC<{k: string; v: string}> = ({k, v}) => (
  <div style={{position: 'absolute', left: 20, right: 20, bottom: 18}}>
    <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 17, letterSpacing: '0.16em', color: 'rgba(255,255,255,0.6)'}}>{k}</div>
    <div style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 30, color: '#fff', marginTop: 4, letterSpacing: '-0.02em'}}>{v}</div>
  </div>
);

const ProductCard: React.FC<{t: number}> = ({t}) => (
  <>
    <Img src={staticFile(PHOTO)} style={{position: 'absolute', left: 0, top: 0, width: '100%', height: 290, objectFit: 'cover', objectPosition: '45% 70%', transform: `scale(${1.15 - 0.1 * prog(t, 0, 40)})`}} />
    <div style={{position: 'absolute', left: 0, right: 0, top: 200, height: 90, background: 'linear-gradient(180deg, transparent, rgba(7,6,26,0.9))'}} />
    <CardLabel k="PRODUIT" v="Bougie Lueur" />
  </>
);

const MoodCard: React.FC<{t: number}> = ({t}) => (
  <>
    <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 290, background: 'radial-gradient(circle at 50% 40%, rgba(251,146,60,0.55), rgba(124,45,18,0.35) 55%, transparent 80%)'}} />
    <div style={{position: 'absolute', left: 0, right: 0, top: 46, display: 'flex', justifyContent: 'center', gap: 12}}>
      {['#FDE7C8', '#F4B26B', '#D9773A', '#7C2D12'].map((c, i) => <div key={c} style={{width: 46, height: 46, borderRadius: 23, background: c, border: '2px solid rgba(255,255,255,0.6)', transform: `scale(${sp(t - 2 - i * 3, 10)})`}} />)}
    </div>
    <div style={{position: 'absolute', left: 30, right: 30, top: 130, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, height: 70}}>
      {Array.from({length: 22}, (_, i) => <div key={i} style={{width: 5, borderRadius: 3, background: '#FDBA74', height: 8 + Math.abs(Math.sin(t / 5 + i * 0.7)) * 52 * prog(t, 4, 12)}} />)}
    </div>
    <div style={{position: 'absolute', left: 0, right: 0, top: 222, textAlign: 'center', fontFamily: FONT, fontWeight: 700, fontSize: 19, color: 'rgba(255,255,255,0.8)'}}>Lumière chaude · musique douce</div>
    <CardLabel k="AMBIANCE" v="Cocooning" />
  </>
);

const NetCard: React.FC<{t: number}> = ({t}) => (
  <>
    <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 290, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <div style={{width: 120, height: 213, borderRadius: 18, border: '3px dashed rgba(255,255,255,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${sp(t - 2, 11)})`}}>
        <div style={{width: 64, height: 64, borderRadius: 18, background: 'linear-gradient(45deg,#F59E0B,#EC4899 50%,#8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="5" stroke="#fff" strokeWidth="2" /><circle cx="12" cy="12" r="4.2" stroke="#fff" strokeWidth="2" /><circle cx="17.3" cy="6.7" r="1.2" fill="#fff" /></svg>
        </div>
      </div>
    </div>
    <CardLabel k="RÉSEAU" v="Reels · 9:16" />
  </>
);

// fil lumineux du mot à la carte
const Beams: React.FC = () => {
  const f = useCurrentFrame();
  const keyAt = [cue(3, 'produit', 1.2), cue(3, 'ambiance', 2.2), cue(3, 'réseau', 3.3)];
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, opacity: 1 - prog(f, T.assemble, 10)}}>
      <defs>
        <linearGradient id="bm" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#C4B5FD" /><stop offset="1" stopColor="#F59E0B" /></linearGradient>
      </defs>
      {[0, 1, 2].map((i) => {
        const p = prog(f, keyAt[i] - 2, 12);
        const o = 1 - prog(f, keyAt[i] + 18, 14);
        const x2 = cardX[i] + CARD_W / 2, y2 = CARD_Y;
        const y1 = 790;
        return <path key={i} d={`M${x2} ${y1} L ${x2} ${y2}`} stroke="url(#bm)" strokeWidth={4} fill="none" strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} opacity={o} />;
      })}
    </svg>
  );
};

// ---------- 4. le téléphone et la pub ----------
const Phone: React.FC<{w: number; start: number; hook: [string, string]; glow?: number; dim?: number; rate?: number; textIn?: number}> = ({w, start, hook, glow = 0, dim = 0, rate = 1, textIn = 1}) => {
  const h = w * (16 / 9);
  const ta = textIn;
  return (
    <div style={{width: w, height: h, borderRadius: w * 0.12, padding: w * 0.03, background: '#0B0A0C', boxShadow: `0 60px 120px -40px rgba(0,0,0,0.9), 0 0 ${80 * glow}px rgba(167,139,250,${0.7 * glow})`, boxSizing: 'border-box', position: 'relative'}}>
      <div style={{position: 'relative', width: '100%', height: '100%', borderRadius: w * 0.095, overflow: 'hidden', background: '#000'}}>
        <OffthreadVideo muted src={staticFile(CLIP)} startFrom={Math.round(start * 30)} playbackRate={rate} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
        <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.35) 0%, transparent 25%, transparent 55%, rgba(0,0,0,0.6) 100%)'}} />
        <div style={{position: 'absolute', left: w * 0.06, top: w * 0.07, display: 'flex', alignItems: 'center', gap: w * 0.025}}>
          <span style={{width: w * 0.075, height: w * 0.075, borderRadius: '50%', background: '#F4E3C8', color: '#7C2D12', fontFamily: FONT, fontWeight: 800, fontSize: w * 0.03, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>ML</span>
          <span style={{fontFamily: FONT, fontWeight: 700, fontSize: w * 0.034, color: '#fff'}}>maisonlueur · <span style={{opacity: 0.7, fontWeight: 600}}>Sponsorisé</span></span>
        </div>
        <div style={{position: 'absolute', left: w * 0.07, right: w * 0.07, top: '17%', fontFamily: DISPLAY, fontWeight: 700, fontSize: w * 0.105, lineHeight: 1.02, letterSpacing: '-0.03em', color: '#fff', textShadow: '0 6px 30px rgba(0,0,0,0.6)', opacity: ta}}>
          {hook[0]}<br /><G warm>{hook[1]}</G>
        </div>
        <div style={{position: 'absolute', left: w * 0.06, right: w * 0.06, bottom: w * 0.06, padding: `${w * 0.032}px 0`, borderRadius: w * 0.04, background: '#fff', textAlign: 'center', fontFamily: FONT, fontWeight: 800, fontSize: w * 0.04, color: '#0B0A1F'}}>Découvrir</div>
        <AbsoluteFill style={{background: '#07061A', opacity: dim}} />
      </div>
    </div>
  );
};

const AdScene: React.FC = () => {
  const f = useCurrentFrame() + T.assemble; // monté dans une Sequence à T.assemble
  const inP = sp(f - T.assemble - 14, 13);
  const toVar = prog(f, T.variants, 22, INOUT);
  const w = interpolate(toVar, [0, 1], [520, 300]);
  const top = interpolate(toVar, [0, 1], [430, 640]);
  const p4 = sp(f - VO[4] - 2, 15), p4b = sp(f - cue(4, 'prête', 1.1) + 2, 15);
  const hookIn = sp(f - T.ad - 22, 12);
  const winAt = cue(5, 'meilleure', 2.1);
  const win = prog(f, winAt - 4, 14);
  const pvIn = [sp(f - T.variants - 10, 13), 1, sp(f - T.variants - 14, 13)];
  const xs = [80, 540 - 150, 700];
  const out = prog(f, T.end - 8, 14, INOUT);
  const vTitle = sp(f - VO[5] + 2, 15), vTitle2 = sp(f - cue(5, 'testées', 0.96) + 2, 15);
  const hooks: [string, string][] = [['Le soir,', 'on ralentit.'], ['Ton cocon,', 'en une flamme.'], ['L’odeur', 'd’un dimanche.']];
  const starts = [3.6, 0, 5.4];
  const scan = interpolate(f, [cue(5, 'testées', 0.96), winAt - 2], [0, 1], clamp);
  return (
    <AbsoluteFill style={{opacity: 1 - out, transform: `scale(${1 - out * 0.06})`, filter: `blur(${out * 8}px)`}}>
      {/* titre de la scène pub */}
      <div style={{position: 'absolute', left: 60, right: 60, top: 150, textAlign: 'center', fontFamily: DISPLAY, fontWeight: 700, fontSize: 92, letterSpacing: '-0.045em', lineHeight: 1.02, color: '#fff', opacity: 1 - toVar}}>
        <div style={{overflow: 'hidden', paddingBottom: 6}}><div style={{transform: `translateY(${(1 - p4) * 110}%)`}}>Une vidéo</div></div>
        <div style={{overflow: 'hidden', paddingBottom: 10}}><div style={{transform: `translateY(${(1 - p4b) * 110}%)`}}><G>prête à vendre.</G></div></div>
      </div>
      {/* titre de la scène variantes */}
      <div style={{position: 'absolute', left: 60, right: 60, top: 190, textAlign: 'center', fontFamily: DISPLAY, fontWeight: 700, fontSize: 88, letterSpacing: '-0.045em', lineHeight: 1.02, color: '#fff', opacity: toVar}}>
        <div style={{overflow: 'hidden', paddingBottom: 6}}><div style={{transform: `translateY(${(1 - vTitle) * 110}%)`}}>Plusieurs versions.</div></div>
        <div style={{overflow: 'hidden', paddingBottom: 10}}><div style={{transform: `translateY(${(1 - vTitle2) * 110}%)`}}><G>Testées pour toi.</G></div></div>
      </div>
      {/* variantes latérales */}
      <Sequence from={T.variants - T.assemble} layout="none">
      {[0, 2].map((i) => (
        <div key={i} style={{position: 'absolute', left: xs[i], top: 640, transform: `translateX(${(1 - pvIn[i]) * (i ? -320 : 320)}px) scale(${0.85 + 0.15 * pvIn[i] - win * 0.05})`, opacity: pvIn[i] * (f >= T.variants ? 1 : 0)}}>
          <Phone w={300} start={starts[i]} hook={hooks[i]} dim={win * 0.55} />
          <div style={{position: 'absolute', left: 0, right: 0, bottom: -64, display: 'flex', justifyContent: 'center', opacity: win}}>
            <span style={{padding: '8px 16px', borderRadius: 99, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.75)', fontFamily: FONT, fontWeight: 700, fontSize: 22}}>En pause</span>
          </div>
        </div>
      ))}
      </Sequence>
      {/* téléphone principal */}
      <div style={{position: 'absolute', left: 540 - w / 2, top, transform: `scale(${inP * (1 + win * 0.08)})`, transformOrigin: '50% 50%', zIndex: 3}}>
        <div style={{opacity: hookIn > 0.01 || f < T.ad ? 1 : 1}}>
          <Phone w={w} start={starts[1]} hook={hooks[1]} glow={0.6 + win * 0.6} rate={0.9} textIn={hookIn} />
        </div>
        <div style={{position: 'absolute', left: -40, right: -40, bottom: -76, display: 'flex', justifyContent: 'center', opacity: win, transform: `scale(${sp(f - winAt, 10)})`}}>
          <span style={{display: 'inline-flex', alignItems: 'center', gap: 10, padding: '10px 20px', borderRadius: 99, background: GRAD, color: '#fff', fontFamily: FONT, fontWeight: 800, fontSize: 24, whiteSpace: 'nowrap', boxShadow: '0 20px 40px -14px rgba(124,92,255,0.8)'}}>✓ La meilleure reste en ligne</span>
        </div>
      </div>
      {/* faisceau qui compare les versions */}
      {scan > 0 && scan < 1 && <div style={{position: 'absolute', left: 60 + scan * 940, top: 600, width: 6, height: 640, borderRadius: 3, background: 'linear-gradient(180deg, transparent, #C4B5FD, transparent)', boxShadow: '0 0 40px #A78BFA', zIndex: 4}} />}
      {/* étiquette « généré » */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 1420, display: 'flex', justifyContent: 'center', opacity: prog(f, T.ad + 10, 12) * (1 - toVar)}}>
        <span style={{display: 'inline-flex', alignItems: 'center', gap: 10, padding: '10px 20px 10px 14px', borderRadius: 99, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.18)', fontFamily: FONT, fontWeight: 700, fontSize: 24, color: 'rgba(255,255,255,0.85)'}}><LogoMark size={28} color="#A78BFA" />Générée par Growthity</span>
      </div>
    </AbsoluteFill>
  );
};

// ---------- 6. fin ----------
const End: React.FC = () => {
  const f = useCurrentFrame(); // local
  const logo = sp(f - 2, 12);
  const mots = VO[6] - T.end + Math.round((WD['mots-6'].find((w) => w.w.startsWith('tes'))?.s ?? 1.1) * 30);
  const t1 = sp(f - mots + 2, 15), t2 = sp(f - mots - 8, 15), cta = sp(f - mots - 22, 13);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 540, top: 520, transform: `translate(-50%,-50%) scale(${logo})`, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <div style={{width: 150, height: 150, borderRadius: 44, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 100px rgba(167,139,250,0.7)'}}><LogoMark size={96} draw={prog(f, 2, 20)} /></div>
        <div style={{marginTop: 26}}><Wordmark size={66} dark /></div>
      </div>
      <div style={{position: 'absolute', left: 540, top: 520, width: 20, height: 20, borderRadius: '50%', border: '3px solid #A78BFA', transform: `translate(-50%,-50%) scale(${prog(f, 2, 26) * 80})`, opacity: (1 - prog(f, 2, 26)) * 0.8}} />
      <div style={{position: 'absolute', left: 60, right: 60, top: 760, textAlign: 'center', fontFamily: DISPLAY, fontWeight: 700, letterSpacing: '-0.05em', lineHeight: 1.0, color: '#fff'}}>
        <div style={{overflow: 'hidden', paddingBottom: 8}}><div style={{fontSize: 140, transform: `translateY(${(1 - t1) * 110}%)`}}>Tes mots</div></div>
        <div style={{overflow: 'hidden', paddingBottom: 14}}><div style={{fontSize: 88, transform: `translateY(${(1 - t2) * 110}%)`}}><G>deviennent des pubs.</G></div></div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1150, display: 'flex', justifyContent: 'center', opacity: Math.min(1, cta * 1.4), transform: `translateY(${(1 - cta) * 40}px)`}}>
        <div style={{padding: '30px 66px', borderRadius: 99, background: '#fff', color: '#0B0A1F', fontFamily: FONT, fontWeight: 800, fontSize: 40, boxShadow: '0 30px 70px -20px rgba(167,139,250,0.8)', transform: `scale(${1 + 0.025 * Math.sin(f / 5) * prog(f, mots + 40, 10)})`}}>Commencer →</div>
      </div>
    </AbsoluteFill>
  );
};

export const MotsPub: React.FC = () => {
  useFonts();
  const f = useCurrentFrame();
  const warm = prog(f, cue(3, 'ambiance', 2.2), 20) * (1 - prog(f, T.end, 30));
  return (
    <AbsoluteFill style={{background: BG, fontFamily: FONT}}>
      <Aurora warm={warm} />
      {f < T.prompt + 10 && <Hook />}
      {f >= T.prompt && f < T.assemble + 20 && <Prompt />}
      {f >= T.prompt && f < T.assemble + 30 && <Beams />}
      {f >= T.prompt && f < T.assemble + 30 && <KeyCards />}
      {f >= T.assemble && f < T.end + 10 && <Sequence from={T.assemble}><AdScene /></Sequence>}
      <Sequence from={T.end}><End /></Sequence>
      {/* éclair à l'assemblage */}
      <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 45%, rgba(255,255,255,0.9), rgba(196,181,253,0.4) 40%, transparent 70%)', opacity: interpolate(f, [T.assemble + 22, T.assemble + 28, T.assemble + 44], [0, 0.9, 0], clamp), pointerEvents: 'none'}} />
      <Audio src={staticFile('mots/bed.wav')} />
      {[1, 2, 3, 4, 5, 6].map((k) => (
        <Sequence key={k} from={VO[k]}><Audio src={staticFile(`voice/mots-${k}-n.mp3`)} /></Sequence>
      ))}
    </AbsoluteFill>
  );
};
