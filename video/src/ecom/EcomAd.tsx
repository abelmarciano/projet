// Pub Meta e-commerce 9:16 « Ton produit. Un acteur. Ta pub. » — exemple BRUME (jogging, marque fictive).
// 0–8 s : la pub UGC de Yanis en plein écran (sa voix, sous-titres) → « Cette pub n'a jamais été tournée » →
// les 3 ingrédients (photo produit, acteur IA, une phrase) → le chat Growthity génère → Publier sur Meta → fin « Commencer ».
// Mode clair, zones sûres Reels (rien d'important dans le quart bas ni sous 250 px en haut). Aucun chiffre de résultat.
import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Audio, Img, Loop, OffthreadVideo, Sequence, continueRender, delayRender, interpolate, spring, staticFile, useCurrentFrame} from 'remotion';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/inter/800.css';
import '@fontsource/inter/900.css';
import {LogoMark, Wordmark} from '../components/UI';
import {INOUT, prog} from '../components/anim';
import {BRAND_PATHS} from '../components/brands';
import BWJ from '../film/brume_words.json';
import WJ from './words.json';

type Word = {w: string; s: number; e: number};
const BW = (BWJ as Word[]).filter((w) => /[\p{L}]/u.test(w.w));
const HW = (WJ as unknown as Record<string, Word[]>)['ecom-1'];
const H0 = 243; // début de la voix off Hugo
const hc = (start: string, d = 0) => { const w = HW.find((x) => x.w.toLowerCase().startsWith(start)); return H0 + Math.round((w ? w.s : d) * 30); };
const last = HW[HW.length - 1];
const at = (sec: number) => H0 + Math.round(sec * 30);
const wAt = (sec: number) => at(HW.reduce((b, w) => (Math.abs(w.s - sec) < Math.abs(b - sec) ? w.s : b), 0));
export const T = {reveal: H0, chat: wAt(5.48) - 4, meta: wAt(8.68) - 4, end: wAt(10.46) - 4, total: at(last.e) + 75};
const PAGE = '#F4F1EA', SURF = '#FFFFFF', LINE = '#E2DDD2', INK = '#16141A', MUTED = '#6E6A73', ACC = '#5B3FE4', OK = '#15803D', OK_SOFT = '#E8F7EE';
const GRAD = 'linear-gradient(120deg, #2563EB 0%, #5B3FE4 52%, #9333EA 100%)';
const FONT = 'Inter, system-ui, sans-serif';
const SH = '0 50px 100px -50px rgba(40,30,20,0.5), 0 2px 6px rgba(40,30,20,0.06)';
const sp = (f: number, d = 14, m = 0.8) => spring({frame: f, fps: 30, config: {damping: d, mass: m, stiffness: 170}});
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const M = (p: string) => staticFile(`media/${p}`);
const G: React.FC<{children: React.ReactNode}> = ({children}) => <span style={{backgroundImage: GRAD, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent'}}>{children}</span>;
const Check: React.FC<{s?: number; c?: string}> = ({s = 30, c = '#16A34A'}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>;
const useFonts = () => {
  const [h] = useState(() => delayRender('fonts'));
  useEffect(() => { Promise.all(['600 20px Inter', '700 20px Inter', '800 20px Inter', '900 20px Inter'].map((s) => document.fonts.load(s))).then(() => continueRender(h)); }, [h]);
};

// sous-titres mot par mot (UGC ou voix off)
const Caps: React.FC<{words: Word[]; t: number; top: number; size?: number; dark?: boolean}> = ({words, t, top, size = 66, dark}) => {
  const i = words.findIndex((w) => t < w.e + 0.1);
  if (i < 0 || t < words[0].s - 0.05) return null;
  const n = 3; const grp = words.slice(Math.floor(i / n) * n, Math.floor(i / n) * n + n);
  return (
    <div style={{position: 'absolute', left: 60, right: 60, top, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 12, fontFamily: FONT}}>
      {grp.map((w, j) => { const on = t >= w.s - 0.02; const hot = on && t <= w.e + 0.06; const p = sp(Math.round((t - w.s) * 30), 9); return (
        <span key={j} style={{fontWeight: 900, fontSize: size, textTransform: 'uppercase', letterSpacing: '-0.01em', color: hot ? '#fff' : dark ? INK : '#fff', background: hot ? ACC : dark ? 'rgba(255,255,255,.92)' : 'transparent', padding: '2px 14px', borderRadius: 14, textShadow: hot || dark ? 'none' : '0 4px 14px rgba(0,0,0,.8), 0 0 4px rgba(0,0,0,.9)', opacity: on ? 1 : 0, transform: `scale(${on ? 0.7 + 0.3 * p : 0.7})`}}>{w.w.replace(/[.,:?!…]$/, '')}</span>); })}
    </div>
  );
};

const Bg: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: PAGE}}>
      <AbsoluteFill style={{background: `radial-gradient(900px 900px at ${60 + Math.sin(f / 50) * 10}% ${40 + Math.cos(f / 60) * 8}%, rgba(91,63,228,0.16), transparent 70%)`}} />
      <AbsoluteFill style={{background: `radial-gradient(700px 700px at 10% 95%, rgba(37,99,235,0.10), transparent 70%)`}} />
    </AbsoluteFill>
  );
};

// la pub UGC : plein écran, puis rétrécie dans un téléphone
const Ugc: React.FC = () => {
  const g = useCurrentFrame();
  if (g > T.chat + 6) return null;
  const k = interpolate(g, [T.reveal - 10, T.reveal + 14], [0, 1], {...clamp, easing: INOUT});
  const out = prog(g, T.chat - 10, 14, INOUT);
  const W0 = 1080, H0p = 1920, W1 = 500, H1 = 889;
  const w = W0 + (W1 - W0) * k, h = H0p + (H1 - H0p) * k, x = (1080 - w) / 2, y = (1920 - h) / 2 + 250 * k;
  const r = 70 * k;
  const punch = g < T.reveal - 10 ? [1, 1.04, 1.01, 1.05, 1.02][Math.floor(g / 36) % 5] : 1;
  return (
    <div style={{position: 'absolute', left: x, top: y + out * 300, width: w, height: h, borderRadius: r, overflow: 'hidden', border: k > 0.05 ? `${14 * k}px solid #16141A` : 'none', boxShadow: k > 0.05 ? SH : 'none', opacity: 1 - out}}>
      <div style={{position: 'absolute', inset: 0, transform: `scale(${punch})`, transformOrigin: '50% 60%'}}>
        <Loop durationInFrames={238} layout="none"><OffthreadVideo muted src={M('brume/ugc.mp4')} style={{width: '100%', height: '100%', objectFit: 'cover'}} /></Loop>
      </div>
      {g < T.reveal - 6 && <Caps words={BW} t={g / 30} top={700} size={78} />}
      {g < T.reveal - 6 && <div style={{position: 'absolute', left: 60, top: 270, fontFamily: FONT, display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,.92)', borderRadius: 999, padding: '10px 22px 10px 12px', opacity: sp(g - 20, 12), transform: `translateY(${(1 - sp(g - 20, 12)) * -20}px)`}}>
        <div style={{width: 46, height: 46, borderRadius: 99, background: '#2E3033', color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 900, fontSize: 18, letterSpacing: '0.08em'}}>B</div>
        <div><div style={{fontSize: 26, fontWeight: 800, color: INK}}>BRUME</div><div style={{fontSize: 18, color: MUTED, fontWeight: 600}}>Sponsorisé</div></div>
      </div>}
    </div>
  );
};

// 2. révélation + ingrédients
const Reveal: React.FC = () => {
  const g = useCurrentFrame();
  if (g < T.reveal - 4 || g > T.chat + 4) return null;
  const f = g - T.reveal; const out = prog(g, T.chat - 10, 12, INOUT);
  const t1 = sp(f - 2, 12), t2 = sp(f - 18, 12);
  const items: [string, string, string, string][] = [['photo', '📸 1 photo du produit', 'brume/p1.jpg', 'Jogging Nuage'], ['acteur', '👤 1 acteur IA', 'brume/face.jpg', 'Yanis'], ['phrase', '✍️ 1 phrase', '', '« Une pub pour mon nouveau jogging »']];
  return (
    <AbsoluteFill style={{opacity: 1 - out, fontFamily: FONT}}>
      <div style={{position: 'absolute', left: 70, right: 70, top: 270, textAlign: 'center', fontWeight: 900, fontSize: 92, lineHeight: 1.0, letterSpacing: '-0.05em', color: INK}}>
        <div style={{overflow: 'hidden', paddingBottom: 6}}><div style={{transform: `translateY(${(1 - t1) * 110}%)`}}>Cette pub n’a jamais</div></div>
        <div style={{overflow: 'hidden', paddingBottom: 12}}><div style={{transform: `translateY(${(1 - t2) * 110}%)`}}><G>été tournée.</G> 🤯</div></div>
      </div>
      {items.map(([w, t, img, sub], i) => { const p = sp(g - hc(w, 2 + i), 11); const left = i === 1; return (
        <div key={w} style={{position: 'absolute', [left ? 'left' : 'right']: 40, top: 620 + i * 260, width: 360, background: SURF, borderRadius: 28, padding: 20, border: `1px solid ${LINE}`, boxShadow: SH, opacity: p, transform: `translateX(${(1 - p) * (left ? -120 : 120)}px) rotate(${left ? -4 : 4}deg) scale(${0.85 + 0.15 * p})`, zIndex: 5}}>
          <div style={{fontSize: 30, fontWeight: 900, color: INK}}>{t}</div>
          <div style={{display: 'flex', alignItems: 'center', gap: 12, marginTop: 10}}>{img && <Img src={M(img)} style={{width: 80, height: 80, borderRadius: 16, objectFit: 'cover'}} />}<div style={{fontSize: 26, color: MUTED, fontWeight: 600, lineHeight: 1.25}}>{sub}</div></div>
        </div>); })}
    </AbsoluteFill>
  );
};

// 3. le chat Growthity génère
const PROMPT = 'Une pub pour mon nouveau jogging';
const Chat: React.FC = () => {
  const g = useCurrentFrame();
  if (g < T.chat - 4 || g > T.meta + 4) return null;
  const f = g - T.chat; const inP = sp(f, 14); const out = prog(g, T.meta - 10, 12, INOUT);
  const n = Math.max(0, Math.min(PROMPT.length, Math.floor((f - 4) * 2.2)));
  const steps: [string, string][] = [['Script', 'crée'], ['Voix', 'voix'], ['Sous-titres', 'sous'], ['Montage', 'montage']];
  const ready = sp(g - hc('montage', 8) - 8, 11);
  return (
    <AbsoluteFill style={{opacity: Math.min(1, inP * 1.4) * (1 - out), transform: `translateY(${(1 - inP) * 120}px)`, fontFamily: FONT}}>
      <div style={{position: 'absolute', left: 60, right: 60, top: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14}}><LogoMark size={52} /><Wordmark size={48} /></div>
      <div style={{position: 'absolute', left: 60, right: 60, top: 370, background: SURF, borderRadius: 34, padding: '30px 32px', border: `1px solid ${LINE}`, boxShadow: SH}}>
        <div style={{display: 'flex', gap: 12}}>
          {[['brume/face.jpg', 'ACTEUR', 'Yanis'], ['brume/p1.jpg', 'PRODUIT', 'Jogging Nuage']].map(([im, k, v]) => (
            <div key={k} style={{flex: 1, display: 'flex', alignItems: 'center', gap: 12, background: '#F7F5F0', borderRadius: 18, padding: 10}}><Img src={M(im)} style={{width: 62, height: 62, borderRadius: 12, objectFit: 'cover'}} /><div><div style={{fontSize: 16, fontWeight: 800, color: MUTED, letterSpacing: '0.08em'}}>{k}</div><div style={{fontSize: 25, fontWeight: 800, color: INK}}>{v}</div></div></div>
          ))}
        </div>
        <div style={{marginTop: 22, fontSize: 44, fontWeight: 700, color: INK, minHeight: 60}}>{PROMPT.slice(0, n)}<span style={{display: 'inline-block', width: 4, height: 46, background: ACC, marginLeft: 4, verticalAlign: -6, opacity: Math.floor(g / 12) % 2 ? 1 : 0.2}} /></div>
        <div style={{display: 'flex', justifyContent: 'flex-end', marginTop: 16}}><span style={{background: GRAD, color: '#fff', fontWeight: 800, fontSize: 28, padding: '14px 30px', borderRadius: 999}}>✦ Générer</span></div>
      </div>
      <div style={{position: 'absolute', left: 60, right: 60, top: 790, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14}}>
        {steps.map(([t, w]) => { const p = sp(g - hc(w, 6), 11); return <div key={t} style={{display: 'flex', alignItems: 'center', gap: 12, background: SURF, border: `1px solid ${LINE}`, borderRadius: 20, padding: '18px 20px', fontSize: 30, fontWeight: 800, color: INK, opacity: 0.35 + 0.65 * p, transform: `scale(${0.92 + 0.08 * p})`}}>{p > 0.5 ? <Check s={34} /> : <span style={{width: 34, height: 34, borderRadius: 99, border: `4px solid ${LINE}`}} />}{t}</div>; })}
      </div>
      <div style={{position: 'absolute', left: 60, right: 60, top: 1010, display: 'flex', alignItems: 'center', gap: 20, background: SURF, borderRadius: 28, padding: 16, border: `3px solid ${ready > 0.5 ? '#16A34A' : LINE}`, boxShadow: SH, opacity: ready, transform: `translateY(${(1 - ready) * 40}px)`}}>
        <div style={{width: 120, height: 213, borderRadius: 16, overflow: 'hidden', flex: 'none'}}><Loop durationInFrames={238} layout="none"><OffthreadVideo muted src={M('brume/ugc.mp4')} style={{width: '100%', height: '100%', objectFit: 'cover'}} /></Loop></div>
        <div><div style={{display: 'inline-block', background: OK_SOFT, color: OK, fontWeight: 900, fontSize: 26, padding: '8px 18px', borderRadius: 999}}>● Prête</div><div style={{fontSize: 32, fontWeight: 800, color: INK, marginTop: 10}}>Pub jogging Nuage</div><div style={{fontSize: 24, color: MUTED, marginTop: 4}}>9:16 · 4:5 · 1:1</div></div>
      </div>
    </AbsoluteFill>
  );
};

// 4. Publier sur Meta
const Meta: React.FC = () => {
  const g = useCurrentFrame();
  if (g < T.meta - 4 || g > T.end + 4) return null;
  const f = g - T.meta; const inP = sp(f, 14); const out = prog(g, T.end - 10, 12, INOUT);
  const click = hc('clic', 8.8) - T.meta + 2; const live = f >= click + 6; const lp = sp(f - click - 6, 10);
  return (
    <AbsoluteFill style={{opacity: Math.min(1, inP * 1.4) * (1 - out), transform: `scale(${0.94 + 0.06 * inP})`, fontFamily: FONT}}>
      <div style={{position: 'absolute', left: 70, right: 70, top: 300, background: SURF, borderRadius: 36, padding: '34px 36px', border: `1px solid ${LINE}`, boxShadow: SH}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 20}}><svg width="84" height="84" viewBox="0 0 24 24"><path d={BRAND_PATHS.meta} fill="#0866FF" /></svg><div style={{flex: 1}}><div style={{fontSize: 46, fontWeight: 800, color: INK}}>Meta Ads</div><div style={{fontSize: 24, color: MUTED}}>Facebook · Instagram</div></div><span style={{background: OK_SOFT, color: OK, fontWeight: 800, fontSize: 22, padding: '8px 16px', borderRadius: 999}}>Connecté</span></div>
        <div style={{display: 'flex', gap: 12, marginTop: 26}}>{['🛒 Ventes', '📍 France', '📱 Reels · Stories · Fil'].map((t) => <span key={t} style={{fontSize: 24, fontWeight: 700, padding: '10px 18px', borderRadius: 999, background: '#F4F1EA', color: INK}}>{t}</span>)}</div>
        <div style={{marginTop: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, background: live ? '#16A34A' : '#0866FF', color: '#fff', borderRadius: 24, padding: '28px 0', fontWeight: 900, fontSize: 40, transform: `scale(${interpolate(f, [click, click + 4, click + 10], [1, 0.94, 1], clamp)})`}}>
          {live ? <span style={{display: 'flex', alignItems: 'center', gap: 12, transform: `scale(${lp})`}}><Check s={44} c="#fff" />En ligne sur Meta</span> : <><svg width="46" height="46" viewBox="0 0 24 24"><path d={BRAND_PATHS.meta} fill="#fff" /></svg>Publier sur Meta</>}
        </div>
      </div>
      {f > click - 24 && (() => { const p = interpolate(f, [click - 24, click], [0, 1], {...clamp, easing: INOUT}); const c = interpolate(f, [click, click + 3, click + 8], [1, 0.82, 1], clamp); return (
        <div style={{position: 'absolute', left: 900 - 340 * p, top: 1300 - 470 * p}}><svg width="70" height="70" viewBox="0 0 24 24" style={{transform: `scale(${c})`, transformOrigin: '0 0', filter: 'drop-shadow(0 8px 12px rgba(0,0,0,.3))'}}><path d="M4 2l15 11-6.5 1.2L16 21l-3 1.4-3.4-6.8L4 20z" fill="#111" stroke="#fff" strokeWidth="1.4" strokeLinejoin="round" /></svg></div>); })()}
      <div style={{position: 'absolute', left: 540 - 165, top: 720, width: 330, height: 560, borderRadius: 46, padding: 10, background: '#16141A', boxShadow: SH, transform: `translateY(${(1 - inP) * 200}px)`}}>
        <div style={{position: 'relative', width: '100%', height: '100%', borderRadius: 37, overflow: 'hidden', background: '#000'}}>
          <Loop durationInFrames={238} layout="none"><OffthreadVideo muted src={M('brume/ugc.mp4')} style={{width: '100%', height: '100%', objectFit: 'cover'}} /></Loop>
          <div style={{position: 'absolute', left: 12, top: 14, display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,.92)', borderRadius: 999, padding: '5px 12px 5px 5px'}}><span style={{width: 28, height: 28, borderRadius: 99, background: '#2E3033', color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 900, fontSize: 12}}>B</span><span style={{fontSize: 15, fontWeight: 800, color: INK}}>BRUME · Sponsorisé</span></div>
          <div style={{position: 'absolute', left: 12, right: 12, bottom: 12, background: '#fff', borderRadius: 12, padding: '8px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 16, fontWeight: 800, color: INK, opacity: live ? 1 : 0.5}}>Jogging Nuage<span style={{background: '#0866FF', color: '#fff', borderRadius: 8, padding: '5px 10px', fontSize: 14}}>Acheter</span></div>
        </div>
      </div>
      {live && ['❤️', '👍', '😍', '🔥'].map((e, i) => { const q = sp(f - click - 10 - i * 5, 9); return <div key={e} style={{position: 'absolute', left: [150, 820, 120, 840][i], top: 800 - q * 90, fontSize: 70, opacity: q > 0.05 ? 1 - prog(f, click + 40 + i * 5, 20) : 0, transform: `scale(${q})`}}>{e}</div>; })}
    </AbsoluteFill>
  );
};

// 5. fin
const End: React.FC = () => {
  const f = useCurrentFrame();
  const a = sp(f - 2, 12), b = sp(f - 10, 12), c = sp(f - 18, 12), btn = sp(f - 30, 11);
  return (
    <AbsoluteFill style={{fontFamily: FONT}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 330, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, transform: `scale(${sp(f, 12)})`}}><LogoMark size={64} draw={prog(f, 2, 20)} /><Wordmark size={58} /></div>
      <div style={{position: 'absolute', left: 60, right: 60, top: 500, textAlign: 'center', fontWeight: 900, fontSize: 124, lineHeight: 1.0, letterSpacing: '-0.055em', color: INK}}>
        <div style={{opacity: a, transform: `translateY(${(1 - a) * 50}px)`}}>Ton produit.</div>
        <div style={{opacity: b, transform: `translateY(${(1 - b) * 50}px)`}}>Un acteur.</div>
        <div style={{opacity: c, transform: `translateY(${(1 - c) * 50}px)`}}><G>Ta pub.</G></div>
      </div>
      <div style={{position: 'absolute', left: 540 - 300, top: 1000, width: 600, height: 130, borderRadius: 65, background: INK, display: 'grid', placeItems: 'center', color: '#fff', fontWeight: 900, fontSize: 52, boxShadow: '0 30px 60px -24px rgba(0,0,0,.5)', transform: `scale(${btn})`}}>Commencer →</div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1160, textAlign: 'center', fontSize: 34, fontWeight: 700, color: MUTED, opacity: btn}}>growthity.ai</div>
    </AbsoluteFill>
  );
};

export const EcomAd: React.FC = () => {
  useFonts();
  const g = useCurrentFrame();
  const flash = interpolate(g, [T.end - 1, T.end, T.end + 5], [0, 0.5, 0], clamp);
  return (
    <AbsoluteFill style={{background: PAGE, fontFamily: FONT}}>
      <Bg />
      <Ugc />
      <Reveal />
      <Chat />
      <Meta />
      {g >= T.reveal && g < T.end && <Caps words={HW} t={(g - H0) / 30} top={1290} size={50} dark />}
      <Sequence from={T.end}><End /></Sequence>
      <AbsoluteFill style={{background: '#fff', opacity: flash, pointerEvents: 'none'}} />
      <Audio src={staticFile('ecom/bed.wav')} />
      <Audio src={staticFile('media/brume/vo.mp3')} />
      <Sequence from={H0}><Audio src={staticFile('voice/ecom-1-n.mp3')} /></Sequence>
    </AbsoluteFill>
  );
};
