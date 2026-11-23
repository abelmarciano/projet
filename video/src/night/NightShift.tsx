// « Pendant que tu dormais… » — pub motion 9:16 (Meta Ads + organique), mode clair, zones sûres Reels respectées
// (texte entre x 110–970 et y 230–1440).
// Accroche : un téléphone verrouillé à 07:12 qui vibre, les notifications de commandes tombent en cascade.
// Retour à la veille 23:47 : une phrase → idée, actrice, montage → lancée sur Facebook et Instagram autour de chez toi →
// diffusée toute seule toute la nuit → au réveil les commandes attendent → « Toi, tu dors. Growthity bosse. »
// Aucun chiffre de résultat ; une seule actrice (Solène), marque de bougies fictive.
import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Audio, OffthreadVideo, Sequence, continueRender, delayRender, interpolate, random, spring, staticFile, useCurrentFrame} from 'remotion';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/inter/800.css';
import '@fontsource/inter/900.css';
import {LogoMark, Wordmark} from '../components/UI';
import {EXPO, INOUT, prog} from '../components/anim';
import {BRAND_PATHS} from '../components/brands';
import WORDS from './words.json';
import TLJ from './timeline.json';

type Word = {w: string; s: number; e: number};
const WD = WORDS as unknown as Record<string, Word[]>;
const TL = TLJ as unknown as {VO: Record<string, number>; S: Record<string, number>};
export const NS = TL.S;
const VO = TL.VO;
const PAGE = '#F4F4F7', SURF = '#FFFFFF', LINE = '#E7E7EE', FG = '#141418', MUTED = '#44444F', DIM = '#737381';
const ACC = '#5B3FE4', ACC_SOFT = '#F0ECFF', OK = '#137A45', OK_SOFT = '#E6F5EC';
const GRAD = 'linear-gradient(120deg, #2563EB 0%, #5B3FE4 52%, #9333EA 100%)';
const FONT = 'Inter, system-ui, sans-serif';
const SH = '0 1px 2px rgba(20,20,40,.04), 0 10px 30px rgba(20,20,40,.08)';
const SH_LG = '0 40px 90px -30px rgba(20,20,60,.4)';
const sp = (f: number, d = 14, m = 0.8) => spring({frame: f, fps: 30, config: {damping: d, mass: m, stiffness: 170}});
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const G: React.FC<{children: React.ReactNode}> = ({children}) => <span style={{backgroundImage: GRAD, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent'}}>{children}</span>;
const cue = (k: number, start: string, d = 0) => {
  const w = WD[`ns-${k}`].find((x) => x.w.toLowerCase().startsWith(start));
  return VO[k] + Math.round((w ? w.s : d) * 30);
};
const CLIP = staticFile('media/fal/social/out/cp4_solene.mp4');
const Brand: React.FC<{k: string; s: number; c?: string}> = ({k, s, c}) => <svg width={s} height={s} viewBox="0 0 24 24"><path d={BRAND_PATHS[k]} fill={c ?? ({facebook: '#0866FF', instagram: '#FF0069', meta: '#0866FF'} as Record<string, string>)[k]} /></svg>;

const useFonts = () => {
  const [h] = useState(() => delayRender('fonts'));
  useEffect(() => { Promise.all(['600 20px Inter', '700 20px Inter', '800 20px Inter', '900 20px Inter'].map((s) => document.fonts.load(s))).then(() => continueRender(h)); }, [h]);
};

// fond clair qui passe à la nuit pendant la scène nocturne
const Bg: React.FC = () => {
  const f = useCurrentFrame();
  const n = prog(f, NS.night - 10, 16, INOUT) * (1 - prog(f, NS.wake - 4, 18, INOUT));
  return (
    <AbsoluteFill style={{background: PAGE}}>
      <AbsoluteFill style={{background: `radial-gradient(900px 900px at ${50 + Math.sin(f / 40) * 8}% ${40 + Math.cos(f / 50) * 6}%, rgba(91,63,228,0.14), transparent 70%)`}} />
      <AbsoluteFill style={{background: `radial-gradient(700px 700px at ${20 - Math.sin(f / 35) * 6}% 85%, rgba(37,99,235,0.10), transparent 70%)`}} />
      <AbsoluteFill style={{backgroundImage: 'radial-gradient(rgba(20,20,40,0.07) 1.4px, transparent 1.6px)', backgroundSize: '36px 36px', maskImage: 'radial-gradient(ellipse at 50% 45%, black 25%, transparent 75%)', WebkitMaskImage: 'radial-gradient(ellipse at 50% 45%, black 25%, transparent 75%)'}} />
      <AbsoluteFill style={{background: 'linear-gradient(180deg, #0E0C24 0%, #1B1745 100%)', opacity: n}} />
      {n > 0.05 && Array.from({length: 40}, (_, i) => <div key={i} style={{position: 'absolute', left: random(`x${i}`) * 1080, top: random(`y${i}`) * 1500, width: 4, height: 4, borderRadius: 2, background: '#fff', opacity: n * (0.3 + 0.7 * Math.abs(Math.sin(f / 9 + i)))}} />)}
    </AbsoluteFill>
  );
};
const isNight = (f: number) => f >= NS.night && f < NS.wake;

const Title: React.FC<{start: number; end: number; a: React.ReactNode; b?: React.ReactNode; bAt?: number; top?: number; size?: number; dark?: boolean}> = ({start, end, a, b, bAt, top = 250, size = 96, dark}) => {
  const f = useCurrentFrame();
  if (f < start - 1 || f > end + 1) return null;
  const p1 = sp(f - start, 12), p2 = sp(f - (bAt ?? start + 5), 12), o = prog(f, end - 8, 8, INOUT);
  return (
    <div style={{position: 'absolute', left: 110, right: 110, top, textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: size, lineHeight: 1.0, letterSpacing: '-0.055em', color: dark ? '#fff' : FG, opacity: 1 - o, transform: `translateY(${-o * 30}px)`}}>
      <div style={{overflow: 'hidden', paddingBottom: 8}}><div style={{transform: `translateY(${(1 - p1) * 110}%)`}}>{a}</div></div>
      {b && <div style={{overflow: 'hidden', paddingBottom: 10}}><div style={{transform: `translateY(${(1 - p2) * 110}%)`}}>{dark ? <span style={{color: '#C4B5FD'}}>{b}</span> : <G>{b}</G>}</div></div>}
    </div>
  );
};

// ---------- 1. accroche : téléphone verrouillé qui vibre ----------
const ORDERS = [['Léa', 'Bougie Bois & Vanille'], ['Karim', 'Coffret trio'], ['Julie', 'Bougie Bois & Vanille'], ['Inès', 'Bougie 3 mèches'], ['Hugo', 'Coffret trio']];
export const NOTIF_AT = [10, 24, 36, 47, 57];
const Notif: React.FC<{n: string; p: string; small?: boolean}> = ({n, p, small}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: 14, padding: small ? '14px 16px' : '16px 18px', borderRadius: 26, background: 'rgba(255,255,255,0.86)', backdropFilter: 'blur(10px)', fontFamily: FONT, boxShadow: '0 10px 24px -14px rgba(0,0,0,.4)'}}>
    <span style={{width: 50, height: 50, borderRadius: 13, background: SURF, display: 'grid', placeItems: 'center', flex: 'none', border: `1px solid ${LINE}`}}><LogoMark size={30} /></span>
    <div style={{flex: 1, minWidth: 0}}>
      <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 19, color: DIM, fontWeight: 600}}><span>GROWTHITY</span><span>maintenant</span></div>
      <div style={{fontSize: 23, fontWeight: 800, color: FG, marginTop: 2}}>🛍️ Nouvelle commande · {n}</div>
      <div style={{fontSize: 20, color: MUTED, marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{p}</div>
    </div>
  </div>
);
const Hook: React.FC = () => {
  const f = useCurrentFrame();
  if (f > NS.chat + 10) return null;
  const inP = sp(f, 13);
  const out = prog(f, NS.chat - 6, 14, INOUT);
  const buzz = NOTIF_AT.some((a) => f >= a && f < a + 8) ? Math.sin(f * 2.6) * 9 : 0;
  return (
    <AbsoluteFill style={{opacity: 1 - out}}>
      <div style={{position: 'absolute', left: 540 - 280, top: 470, width: 560, height: 960, borderRadius: 70, padding: 14, background: '#111', boxShadow: SH_LG, transform: `translateY(${(1 - inP) * 200 + out * -60}px) rotate(${buzz * 0.25}deg) translateX(${buzz}px) scale(${1 - out * 0.1})`}}>
        <div style={{position: 'relative', width: '100%', height: '100%', borderRadius: 58, overflow: 'hidden', background: 'linear-gradient(160deg, #F7C7A1 0%, #C9B6F2 45%, #8FA8F0 100%)'}}>
          <div style={{position: 'absolute', left: '50%', top: 16, width: 140, height: 36, marginLeft: -70, borderRadius: 20, background: '#111'}} />
          <div style={{position: 'absolute', left: 0, right: 0, top: 90, textAlign: 'center', fontFamily: FONT, color: '#fff', textShadow: '0 2px 20px rgba(0,0,0,.2)'}}>
            <div style={{fontSize: 26, fontWeight: 700, opacity: 0.9}}>mardi 24 novembre</div>
            <div style={{fontSize: 150, fontWeight: 800, lineHeight: 1, letterSpacing: '-0.04em', marginTop: 4}}>07:12</div>
          </div>
          <div style={{position: 'absolute', left: 18, right: 18, top: 330, display: 'flex', flexDirection: 'column', gap: 10}}>
            {ORDERS.map(([n, p], i) => {
              const a = NOTIF_AT[i];
              if (f < a) return null;
              const q = sp(f - a, 11);
              return <div key={n + i} style={{transform: `translateY(${(1 - q) * -60}px) scale(${0.92 + 0.08 * q})`, opacity: Math.min(1, q * 1.6)}}><Notif n={n} p={p} small /></div>;
            }).reverse()}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- 2. la veille, 23:47 : une phrase ----------
const PROMPT = 'Une pub pour ma boutique de bougies artisanales.';
const Chat: React.FC = () => {
  const f = useCurrentFrame();
  if (f < NS.chat - 2 || f > NS.pub + 14) return null;
  const inP = sp(f - NS.chat - 2, 14);
  const typeStart = cue(2, 'une', 1.6);
  const typed = PROMPT.slice(0, Math.max(0, Math.floor((f - typeStart) * 1.7)));
  const steps = [['💡', 'L’idée', cue(3, "l'idée", 0.5)], ['🎭', 'L’actrice', cue(3, "l'actrice", 1.3)], ['🎬', 'Le montage', cue(3, 'monte', 1.9)]] as const;
  const vidAt = cue(3, 'vidéo', 2.4) - 4;
  const vp = sp(f - vidAt, 13);
  const out = prog(f, NS.pub - 4, 14, INOUT);
  const ck = sp(f - NS.chat - 4, 12);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 0, right: 0, top: 455, display: 'flex', justifyContent: 'center', opacity: (1 - out)}}>
        <span style={{display: 'inline-flex', alignItems: 'center', gap: 12, padding: '12px 24px', borderRadius: 999, background: '#1B1745', color: '#E0E7FF', fontFamily: FONT, fontWeight: 800, fontSize: 30, transform: `scale(${ck})`}}>🌙 Hier soir · 23:47</span>
      </div>
      <div style={{position: 'absolute', left: 120, right: 120, top: 545, padding: '22px 24px', borderRadius: 28, background: SURF, border: `2px solid ${ACC}`, boxShadow: SH_LG, display: 'flex', alignItems: 'center', gap: 14, opacity: Math.min(1, inP * 1.5) * (1 - out), transform: `translateY(${(1 - inP) * 40 - out * 40}px)`}}>
        <span style={{flex: 1, fontFamily: FONT, fontWeight: 600, fontSize: 32, lineHeight: 1.3, color: FG, minHeight: 84}}>{typed}<span style={{color: ACC, opacity: Math.floor(f / 8) % 2 ? 0 : 1}}>|</span></span>
        <span style={{width: 64, height: 64, borderRadius: 32, background: typed.length === PROMPT.length ? ACC : '#D7D7E1', color: '#fff', display: 'grid', placeItems: 'center', fontSize: 30, fontWeight: 900, flex: 'none'}}>↑</span>
      </div>
      <div style={{position: 'absolute', left: 110, right: 110, top: 715, display: 'flex', justifyContent: 'center', gap: 12, opacity: 1 - out}}>
        {steps.map(([ic, t, at]) => {
          const p = sp(f - at, 10);
          return f >= at ? <span key={t} style={{display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 18px', borderRadius: 999, background: OK_SOFT, color: OK, fontFamily: FONT, fontWeight: 800, fontSize: 25, whiteSpace: 'nowrap', transform: `scale(${0.5 + 0.5 * p})`, opacity: p}}>{ic} {t} ✓</span> : null;
        })}
      </div>
      {f >= vidAt - 2 && (
        <div style={{position: 'absolute', left: 540 - 160, top: 805, width: 320, height: 569, borderRadius: 34, overflow: 'hidden', background: '#000', border: '6px solid #fff', boxShadow: SH_LG, transform: `scale(${(0.5 + 0.5 * vp) * (1 - out * 0.35)}) translateY(${out * -80}px)`, opacity: Math.min(1, vp * 2) * (1 - out)}}>
          <Sequence from={vidAt} layout="none"><OffthreadVideo muted src={CLIP} startFrom={10} style={{width: '100%', height: '100%', objectFit: 'cover'}} /></Sequence>
          <div style={{position: 'absolute', left: 12, top: 12, display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px 5px 7px', borderRadius: 999, background: 'rgba(255,255,255,.85)'}}><LogoMark size={16} /><span style={{fontFamily: FONT, fontWeight: 800, fontSize: 14, color: FG}}>Prête</span></div>
        </div>
      )}
    </AbsoluteFill>
  );
};

// ---------- 3. lancée sur Facebook et Instagram, autour de chez toi ----------
const Publish: React.FC = () => {
  const f = useCurrentFrame();
  if (f < NS.pub - 2 || f > NS.night + 10) return null;
  const fb = cue(4, 'facebook', 0.8), ig = cue(4, 'instagram', 1.4), zone = cue(4, 'autour', 2.0);
  const out = prog(f, NS.night - 4, 12, INOUT);
  const icon = (at: number, x: number, k: string) => {
    const p = sp(f - at, 10);
    return f >= at - 1 ? <div key={k} style={{position: 'absolute', left: x, top: 1000, width: 160, height: 160, borderRadius: 44, background: SURF, border: `1px solid ${LINE}`, display: 'grid', placeItems: 'center', boxShadow: SH_LG, transform: `scale(${p}) rotate(${(1 - p) * -20}deg)`}}><Brand k={k} s={96} /><span style={{position: 'absolute', right: -10, top: -10, width: 52, height: 52, borderRadius: 26, background: OK, border: '5px solid #fff', color: '#fff', fontFamily: FONT, fontWeight: 900, fontSize: 26, display: 'grid', placeItems: 'center', opacity: prog(f, at + 8, 6)}}>✓</span></div> : null;
  };
  return (
    <AbsoluteFill style={{opacity: 1 - out}}>
      <div style={{position: 'absolute', left: 540, top: 800, width: 10, height: 10}}>
        {[0, 1, 2].map((k) => { const q = ((f - zone + k * 12) % 36) / 36; return f >= zone ? <div key={k} style={{position: 'absolute', left: -260, top: -260, width: 520, height: 520, borderRadius: '50%', border: `4px solid ${ACC}`, transform: `scale(${0.3 + q})`, opacity: (1 - q) * 0.7}} /> : null; })}
      </div>
      <div style={{position: 'absolute', left: 540 - 120, top: 560, width: 240, height: 427, borderRadius: 30, overflow: 'hidden', background: '#000', border: '6px solid #fff', boxShadow: SH_LG}}>
        <OffthreadVideo muted src={CLIP} startFrom={110} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      </div>
      {icon(fb, 220, 'facebook')}
      {icon(ig, 700, 'instagram')}
      {f >= zone && <div style={{position: 'absolute', left: 0, right: 0, top: 1240, display: 'flex', justifyContent: 'center'}}><span style={{display: 'inline-flex', alignItems: 'center', gap: 10, padding: '16px 28px', borderRadius: 999, background: SURF, border: `2px solid ${ACC}`, boxShadow: SH, fontFamily: FONT, fontWeight: 800, fontSize: 32, color: ACC, transform: `scale(${sp(f - zone, 10)})`}}>📍 Autour de chez toi</span></div>}
    </AbsoluteFill>
  );
};

// ---------- 4. toute la nuit, ta pub tourne ----------
const LOG = [['00:41', 'Vue par quelqu’un près de chez toi'], ['02:18', 'Un clic sur ta pub'], ['04:05', 'Visite de ta boutique'], ['06:30', 'Toujours en diffusion']];
const Night: React.FC = () => {
  const f = useCurrentFrame();
  if (f < NS.night - 2 || f > NS.wake + 10) return null;
  const inP = sp(f - NS.night, 13);
  const out = prog(f, NS.wake - 4, 12, INOUT);
  const dur = NS.wake - NS.night;
  const mins = Math.floor(interpolate(f, [NS.night, NS.wake - 6], [23 * 60 + 52, 6 * 60 + 59 + 24 * 60], clamp)) % (24 * 60);
  const clock = `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`;
  return (
    <AbsoluteFill style={{opacity: 1 - out}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 470, textAlign: 'center', fontFamily: FONT, fontWeight: 800, fontSize: 130, letterSpacing: '-0.04em', color: '#fff', opacity: inP}}>{clock}</div>
      <div style={{position: 'absolute', left: 120, right: 120, top: 660, padding: '30px 30px 20px', borderRadius: 36, background: 'rgba(30,27,75,0.92)', border: '1px solid #2A2560', boxShadow: SH_LG, transform: `translateY(${(1 - inP) * 60}px)`, opacity: inP}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 14, fontFamily: FONT, fontWeight: 800, fontSize: 32, color: '#fff'}}><span style={{width: 56, height: 56, borderRadius: 17, background: '#fff', display: 'grid', placeItems: 'center'}}><Brand k="meta" s={36} /></span>Ta pub sur Meta<span style={{marginLeft: 'auto', padding: '8px 16px', borderRadius: 999, background: '#14532D', color: '#86EFAC', fontSize: 22}}>● En diffusion</span></div>
        <div style={{marginTop: 26, display: 'flex', flexDirection: 'column', gap: 14}}>
          {LOG.map(([t, a], i) => {
            const at = NS.night + 14 + Math.round((i * (dur - 30)) / LOG.length);
            const p = sp(f - at, 12);
            return f >= at ? <div key={t} style={{display: 'flex', alignItems: 'center', gap: 16, padding: '18px 18px', borderRadius: 20, background: '#1E1B4B', fontFamily: FONT, opacity: Math.min(1, p * 1.5), transform: `translateX(${(1 - p) * 60}px)`}}>
              <span style={{fontWeight: 800, fontSize: 24, color: '#A5B4FC', width: 78}}>{t}</span>
              <span style={{width: 40, height: 40, borderRadius: 12, background: '#2A2560', display: 'grid', placeItems: 'center', flex: 'none'}}><Brand k={i % 2 ? 'instagram' : 'facebook'} s={24} c="#fff" /></span>
              <span style={{fontWeight: 700, fontSize: 27, color: '#fff'}}>{a}</span>
            </div> : null;
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- 5. au réveil, les commandes t'attendent ----------
const Wake: React.FC = () => {
  const f = useCurrentFrame();
  if (f < NS.wake - 2 || f > NS.end + 10) return null;
  const out = prog(f, NS.end - 4, 12, INOUT);
  const sun = sp(f - NS.wake, 16);
  return (
    <AbsoluteFill style={{opacity: 1 - out}}>
      <AbsoluteFill style={{background: 'radial-gradient(700px 500px at 50% 30%, rgba(253,176,34,0.28), transparent 70%)', opacity: sun}} />
      <div style={{position: 'absolute', left: 120, right: 120, top: 620, display: 'flex', flexDirection: 'column', gap: 16}}>
        {ORDERS.slice(0, 4).map(([n, p], i) => {
          const at = NS.wake + 8 + i * 8, q = sp(f - at, 11);
          return f >= at ? <div key={n + i} style={{display: 'flex', alignItems: 'center', gap: 16, padding: '20px 22px', borderRadius: 24, background: SURF, border: `1px solid ${LINE}`, boxShadow: SH, transform: `translateY(${(1 - q) * -40}px) scale(${0.9 + 0.1 * q})`, opacity: Math.min(1, q * 1.6), fontFamily: FONT}}>
            <span style={{width: 58, height: 58, borderRadius: 29, background: ['#F59E0B', '#10B981', '#3B82F6', '#EC4899'][i], color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 26, flex: 'none'}}>{n[0]}</span>
            <div style={{flex: 1, minWidth: 0}}><div style={{fontWeight: 800, fontSize: 28, color: FG}}>Nouvelle commande · {n}</div><div style={{fontSize: 24, color: DIM, marginTop: 4}}>{p}</div></div>
            <span style={{padding: '10px 16px', borderRadius: 14, background: OK_SOFT, color: OK, fontWeight: 800, fontSize: 22}}>Payée</span>
          </div> : null;
        })}
      </div>
    </AbsoluteFill>
  );
};

// ---------- 6. fin ----------
const End: React.FC = () => {
  const f = useCurrentFrame(); // local
  const L = (k: string, d: number) => cue(7, k, d) - NS.end;
  const logo = sp(f - 2, 12), a = sp(f - L('toi', 0.1) + 2, 12), b = sp(f - L('growthity', 1.2) + 2, 12);
  const btnAt = L('bosse', 1.8) + 10;
  const bp = sp(f - btnAt, 11);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 0, right: 0, top: 300, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 18, transform: `scale(${logo})`}}>
        <div style={{width: 100, height: 100, borderRadius: 30, background: SURF, border: `1px solid ${LINE}`, boxShadow: SH, display: 'grid', placeItems: 'center'}}><LogoMark size={64} draw={prog(f, 2, 18)} /></div>
        <Wordmark size={66} />
      </div>
      <div style={{position: 'absolute', left: 90, right: 90, top: 520, textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 124, lineHeight: 1.02, letterSpacing: '-0.06em', color: FG}}>
        <div style={{opacity: a, transform: `translateY(${(1 - a) * 40}px)`}}>Toi, tu dors.</div>
        <div style={{opacity: b, transform: `translateY(${(1 - b) * 40}px)`}}><G>Growthity bosse.</G></div>
      </div>
      <div style={{position: 'absolute', left: 540 - 270, top: 1010, width: 540, height: 150, borderRadius: 75, background: GRAD, display: 'grid', placeItems: 'center', color: '#fff', fontFamily: FONT, fontWeight: 900, fontSize: 52, boxShadow: '0 30px 60px -20px rgba(91,63,228,.7)', transform: `scale(${bp})`, opacity: Math.min(1, bp * 1.5)}}>Commencer →</div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1200, textAlign: 'center', fontFamily: FONT, fontWeight: 700, fontSize: 34, color: DIM, opacity: prog(f, btnAt + 6, 10)}}>growthity.ai</div>
    </AbsoluteFill>
  );
};

export const NightShift: React.FC = () => {
  useFonts();
  const f = useCurrentFrame();
  const flash = (at: number) => interpolate(f, [at - 1, at, at + 5], [0, 0.45, 0], clamp);
  return (
    <AbsoluteFill style={{background: PAGE, fontFamily: FONT}}>
      <Bg />
      <Title start={cue(1, 'pendant', 0) - 2} end={NS.chat} a="Pendant que tu dormais…" b="ta pub a bossé." bAt={cue(1, 'ta', 1.3)} top={240} size={72} />
      <Hook />
      <Title start={NS.chat + 2} end={NS.pub} a="Hier soir," b="une seule phrase." bAt={cue(2, 'une', 1.6)} size={92} />
      <Chat />
      <Title start={NS.pub + 2} end={NS.night} a="Lancée sur Meta," b="autour de chez toi." size={86} />
      <Publish />
      <Title start={NS.night + 2} end={NS.wake} a="Toute la nuit," b="ta pub tourne." size={96} dark={isNight(f)} />
      <Night />
      <Title start={NS.wake + 2} end={NS.end} a="Au réveil, les commandes" b="t’attendent." size={70} />
      <Wake />
      <Sequence from={NS.end}><End /></Sequence>
      <AbsoluteFill style={{background: '#fff', opacity: Math.max(flash(NS.chat), flash(NS.end)), pointerEvents: 'none'}} />
      <Audio src={staticFile('night/bed.wav')} />
      {[1, 2, 3, 4, 5, 6, 7].map((k) => <Sequence key={k} from={VO[k]}><Audio src={staticFile(`voice/ns-${k}-n.mp3`)} /></Sequence>)}
    </AbsoluteFill>
  );
};
