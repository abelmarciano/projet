// « Un bouton. » — pub motion 9:16 pour Meta Ads (≈22 s), mode clair, zones sûres Reels respectées dès la mise en page
// (texte entre x 110–970 et y 230–1440 : rien sous l'en-tête, dans la colonne d'icônes ni dans la légende).
// Accroche : un énorme bouton pressé → mur de pubs UGC réalistes prêtes → une phrase → idée, acteur, montage →
// publiée sur Facebook et Instagram autour de toi → pilotée jour et nuit → les clients arrivent → « Ta pub, en un clic. »
// Aucun chiffre de résultat ; chaque acteur n'apparaît qu'une fois.
import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Audio, OffthreadVideo, Sequence, continueRender, delayRender, interpolate, random, spring, staticFile, useCurrentFrame} from 'remotion';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/inter/800.css';
import '@fontsource/inter/900.css';
import {LogoMark, Wordmark} from '../components/UI';
import {EXPO, INOUT, prog} from '../components/anim';
import WORDS from '../leads/words_bt.json';

type Word = {w: string; s: number; e: number};
const WD = WORDS as unknown as Record<string, Word[]>;
const PAGE = '#F4F4F7', SURF = '#FFFFFF', LINE = '#E7E7EE', FG = '#141418', MUTED = '#44444F', DIM = '#737381';
const ACC = '#5B3FE4', ACC_SOFT = '#F0ECFF', ACC_INK = '#4A2FCF', OK = '#137A45', OK_SOFT = '#E6F5EC', META = '#0866FF';
const GRAD = 'linear-gradient(120deg, #2563EB 0%, #5B3FE4 52%, #9333EA 100%)';
const FONT = 'Inter, system-ui, sans-serif';
const SH = '0 1px 2px rgba(20,20,40,.04), 0 10px 30px rgba(20,20,40,.08)';
const SH_LG = '0 40px 90px -30px rgba(20,20,60,.4)';
const sp = (f: number, d = 14, m = 0.8) => spring({frame: f, fps: 30, config: {damping: d, mass: m, stiffness: 170}});
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const G: React.FC<{children: React.ReactNode}> = ({children}) => <span style={{backgroundImage: GRAD, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent'}}>{children}</span>;

export const VO = {1: 6, 2: 42, 3: 112, 4: 272, 5: 367, 6: 457, 7: 547} as Record<number, number>;
export const S = {hook: 0, wall: 40, chat: 110, pub: 270, buyer: 365, leads: 455, end: 545, total: 660};
const cue = (k: number, start: string, d = 0) => {
  const w = WD[`bt-${k}`].find((x) => x.w.toLowerCase().startsWith(start));
  return VO[k] + Math.round((w ? w.s : d) * 30);
};
const CLIP = (n: string) => staticFile(`media/fal/social/out/${n}.mp4`);
const PRESS = cue(1, 'bouton', 0.24) + 6;

const useFonts = () => {
  const [h] = useState(() => delayRender('fonts'));
  useEffect(() => { Promise.all(['600 20px Inter', '700 20px Inter', '800 20px Inter', '900 20px Inter'].map((s) => document.fonts.load(s))).then(() => continueRender(h)); }, [h]);
};

const Bg: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: PAGE}}>
      <AbsoluteFill style={{background: `radial-gradient(900px 900px at ${50 + Math.sin(f / 40) * 8}% ${40 + Math.cos(f / 50) * 6}%, rgba(91,63,228,0.14), transparent 70%)`}} />
      <AbsoluteFill style={{background: `radial-gradient(700px 700px at ${20 - Math.sin(f / 35) * 6}% 85%, rgba(37,99,235,0.10), transparent 70%)`}} />
      <AbsoluteFill style={{backgroundImage: 'radial-gradient(rgba(20,20,40,0.07) 1.4px, transparent 1.6px)', backgroundSize: '36px 36px', maskImage: 'radial-gradient(ellipse at 50% 45%, black 25%, transparent 75%)', WebkitMaskImage: 'radial-gradient(ellipse at 50% 45%, black 25%, transparent 75%)'}} />
    </AbsoluteFill>
  );
};

// titre en haut de la zone sûre ; deux lignes max, mot à mot
const Title: React.FC<{start: number; end: number; a: React.ReactNode; b?: React.ReactNode; top?: number; size?: number}> = ({start, end, a, b, top = 250, size = 104}) => {
  const f = useCurrentFrame();
  if (f < start - 1 || f > end + 1) return null;
  const p1 = sp(f - start, 12), p2 = sp(f - start - 5, 12), o = prog(f, end - 8, 8, INOUT);
  return (
    <div style={{position: 'absolute', left: 110, right: 110, top, textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: size, lineHeight: 1.0, letterSpacing: '-0.055em', color: FG, opacity: 1 - o, transform: `translateY(${-o * 30}px)`}}>
      <div style={{overflow: 'hidden', paddingBottom: 8}}><div style={{transform: `translateY(${(1 - p1) * 110}%)`}}>{a}</div></div>
      {b && <div style={{overflow: 'hidden', paddingBottom: 10}}><div style={{transform: `translateY(${(1 - p2) * 110}%)`}}><G>{b}</G></div></div>}
    </div>
  );
};

const Cursor: React.FC<{x: number; y: number; press: number}> = ({x, y, press}) => (
  <svg width="110" height="110" viewBox="0 0 24 24" style={{position: 'absolute', left: x, top: y, transform: `scale(${1 - press * 0.12})`, filter: 'drop-shadow(0 10px 18px rgba(20,20,60,.35))', zIndex: 20}}>
    <path d="M5 3 L19 12 L12.5 13.4 L9.4 20 Z" fill="#fff" stroke={FG} strokeWidth="1.4" strokeLinejoin="round" />
  </svg>
);

// ---------- 1. le bouton ----------
const BigButton: React.FC<{label: string; at: number; y: number; w?: number; h?: number; size?: number}> = ({label, at, y, w = 700, h = 210, size = 68}) => {
  const f = useCurrentFrame();
  const inP = sp(f - (at - 30), 11, 0.9);
  const down = f >= at && f < at + 6 ? 1 : f >= at + 6 ? Math.max(0, 1 - (f - at - 6) / 6) : 0;
  const glow = 0.55 + 0.25 * Math.sin(f / 5);
  return (
    <div style={{position: 'absolute', left: 540 - w / 2, top: y - h / 2, width: w, height: h, transform: `scale(${(0.6 + 0.4 * inP)})`, opacity: Math.min(1, inP * 1.5)}}>
      <div style={{position: 'absolute', inset: -30, borderRadius: 999, background: GRAD, filter: 'blur(40px)', opacity: glow * (1 - down * 0.5)}} />
      <div style={{position: 'absolute', inset: 0, top: 18, borderRadius: 999, background: '#3B22B8'}} />
      <div style={{position: 'absolute', inset: 0, borderRadius: 999, background: GRAD, transform: `translateY(${down * 16}px)`, boxShadow: 'inset 0 6px 0 rgba(255,255,255,.35), inset 0 -10px 20px rgba(30,10,90,.35)', display: 'grid', placeItems: 'center'}}>
        <div style={{position: 'absolute', left: 40, right: 40, top: 14, height: h * 0.32, borderRadius: 999, background: 'linear-gradient(180deg, rgba(255,255,255,.45), rgba(255,255,255,0))'}} />
        <span style={{position: 'relative', fontFamily: FONT, fontWeight: 900, fontSize: size, color: '#fff', letterSpacing: '-0.03em', textShadow: '0 3px 10px rgba(30,10,90,.4)'}}>{label}</span>
      </div>
    </div>
  );
};
const Hook: React.FC = () => {
  const f = useCurrentFrame();
  if (f > S.wall + 10) return null;
  const cx = interpolate(f, [0, PRESS - 4], [900, 620], {...clamp, easing: EXPO}), cy = interpolate(f, [0, PRESS - 4], [1400, 980], {...clamp, easing: EXPO});
  const press = f >= PRESS && f < PRESS + 6 ? 1 : 0;
  const ring = prog(f, PRESS, 22);
  const out = prog(f, S.wall - 4, 12, INOUT);
  return (
    <AbsoluteFill style={{opacity: 1 - out, transform: `scale(${1 + out * 0.4})`}}>
      <BigButton label="Créer ma pub" at={PRESS} y={960} />
      {[0, 1].map((k) => {
        const r = prog(f, PRESS + k * 6, 24);
        return f >= PRESS + k * 6 ? <div key={k} style={{position: 'absolute', left: 540, top: 960, width: 760, height: 260, marginLeft: -380, marginTop: -130, borderRadius: 999, border: `6px solid ${ACC}`, transform: `scale(${1 + r * 0.9})`, opacity: (1 - r) * 0.8}} /> : null;
      })}
      {Array.from({length: 18}, (_, i) => {
        if (f < PRESS) return null;
        const a = (i / 18) * Math.PI * 2 + random(`a${i}`) * 0.3, d = ring * (300 + random(`d${i}`) * 260);
        return <div key={i} style={{position: 'absolute', left: 540 + Math.cos(a) * d * 1.3, top: 960 + Math.sin(a) * d, width: 18, height: 18, borderRadius: 9, background: i % 3 ? ACC : '#2563EB', opacity: 1 - ring, transform: 'translate(-50%,-50%)'}} />;
      })}
      <Cursor x={cx} y={cy} press={press} />
    </AbsoluteFill>
  );
};

// ---------- 2. le mur de pubs prêtes ----------
const WALL = ['lr_isabella', 'lr_rania', 'lr_theo', 'game-priya', 'cp7-sana', 'rewind-yanis', 'sms-anais', 'lr_sofiane', 'cp5_noor'];
const Wall: React.FC = () => {
  const f = useCurrentFrame();
  if (f < S.wall - 2 || f > S.chat + 12) return null;
  const W = 180, H = 320, GAP = 16, X0 = 540 - (3 * W + 2 * GAP) / 2, Y0 = 440;
  const out = prog(f, S.chat - 6, 14, INOUT);
  const ready = cue(2, 'prête', 1.32);
  return (
    <AbsoluteFill style={{opacity: 1 - out, transform: `scale(${1 - out * 0.15})`}}>
      {WALL.map((n, i) => {
        const p = sp(f - S.wall - (i % 3) * 2 - Math.floor(i / 3) * 3, 13, 0.9);
        const x = X0 + (i % 3) * (W + GAP), y = Y0 + Math.floor(i / 3) * (H + GAP);
        const sx = 540 - W / 2, sy = 960 - H / 2;
        const ok = f >= ready + i * 2;
        return (
          <div key={n} style={{position: 'absolute', left: sx + (x - sx) * p, top: sy + (y - sy) * p, width: W, height: H, borderRadius: 24, overflow: 'hidden', background: '#000', border: '4px solid #fff', boxShadow: SH_LG, transform: `scale(${0.3 + 0.7 * p}) rotate(${(1 - p) * (i % 2 ? 12 : -12)}deg)`, opacity: Math.min(1, p * 2)}}>
            <Sequence from={S.wall} layout="none"><OffthreadVideo muted src={CLIP(n)} startFrom={30} style={{width: '100%', height: '100%', objectFit: 'cover'}} /></Sequence>
            {ok && <span style={{position: 'absolute', left: 10, bottom: 10, padding: '6px 12px', borderRadius: 999, background: '#fff', color: OK, fontFamily: FONT, fontWeight: 800, fontSize: 20, transform: `scale(${sp(f - ready - i * 2, 9)})`}}>✓ Prête</span>}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// ---------- 3. une phrase → idée, acteur, montage ----------
const PROMPT = 'Une pub pour mon salon de barbier à Lyon.';
const Chat: React.FC = () => {
  const f = useCurrentFrame();
  if (f < S.chat - 2 || f > S.pub + 14) return null;
  const inP = sp(f - S.chat - 2, 14);
  const typed = PROMPT.slice(0, Math.max(0, Math.floor((f - S.chat - 6) * 1.5)));
  const steps = [['💡', 'L’idée', cue(3, "l'idée", 2.18)], ['🎭', 'Acteur réaliste', cue(3, 'acteur', 3.2)], ['🎬', 'Montage', cue(3, 'monte', 4.34)]] as const;
  const vidAt = cue(3, 'vidéo', 4.64) - 4;
  const vp = sp(f - vidAt, 13);
  const out = prog(f, S.pub - 4, 14, INOUT);
  return (
    <AbsoluteFill style={{opacity: 1 - out * 0.0}}>
      <div style={{position: 'absolute', left: 120, right: 120, top: 470, padding: '22px 24px', borderRadius: 28, background: SURF, border: `2px solid ${ACC}`, boxShadow: SH_LG, display: 'flex', alignItems: 'center', gap: 14, opacity: Math.min(1, inP * 1.5) * (1 - out), transform: `translateY(${(1 - inP) * 40 - out * 40}px)`}}>
        <span style={{flex: 1, fontFamily: FONT, fontWeight: 600, fontSize: 32, lineHeight: 1.3, color: FG, minHeight: 84}}>{typed}<span style={{color: ACC, opacity: Math.floor(f / 8) % 2 ? 0 : 1}}>|</span></span>
        <span style={{width: 64, height: 64, borderRadius: 32, background: typed.length === PROMPT.length ? ACC : '#D7D7E1', color: '#fff', display: 'grid', placeItems: 'center', fontSize: 30, fontWeight: 900, flex: 'none'}}>↑</span>
      </div>
      <div style={{position: 'absolute', left: 110, right: 110, top: 640, display: 'flex', justifyContent: 'center', gap: 12, opacity: 1 - out}}>
        {steps.map(([ic, t, at]) => {
          const p = sp(f - at, 10);
          return f >= at ? <span key={t} style={{display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 18px', borderRadius: 999, background: OK_SOFT, color: OK, fontFamily: FONT, fontWeight: 800, fontSize: 25, whiteSpace: 'nowrap', transform: `scale(${0.5 + 0.5 * p})`, opacity: p}}>{ic} {t} ✓</span> : null;
        })}
      </div>
      {f >= vidAt - 2 && (
        <div style={{position: 'absolute', left: 540 - 165, top: 730, width: 330, height: 587, borderRadius: 34, overflow: 'hidden', background: '#000', border: '6px solid #fff', boxShadow: SH_LG, transform: `scale(${(0.5 + 0.5 * vp) * (1 - out * 0.35)}) translateY(${out * -80}px)`, opacity: Math.min(1, vp * 2)}}>
          <Sequence from={vidAt} layout="none"><OffthreadVideo muted src={CLIP('sms-malik')} startFrom={20} style={{width: '100%', height: '100%', objectFit: 'cover'}} /></Sequence>
          <div style={{position: 'absolute', left: 12, top: 12, display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px 5px 7px', borderRadius: 999, background: 'rgba(255,255,255,.85)'}}><LogoMark size={16} /><span style={{fontFamily: FONT, fontWeight: 800, fontSize: 14, color: FG}}>Growthity</span></div>
        </div>
      )}
    </AbsoluteFill>
  );
};

// ---------- 4. publiée sur Facebook et Instagram, autour de toi ----------
const Publish: React.FC = () => {
  const f = useCurrentFrame();
  if (f < S.pub - 2 || f > S.buyer + 10) return null;
  const fb = cue(4, 'facebook', 0.84), ig = cue(4, 'instagram', 1.46), zone = cue(4, 'autour', 2.26);
  const r = prog(f, zone - 2, 26);
  const out = prog(f, S.buyer - 4, 12, INOUT);
  const icon = (at: number, x: number, c: string, txt: string) => {
    const p = sp(f - at, 10);
    return f >= at - 1 ? <div key={txt} style={{position: 'absolute', left: x, top: 1010, width: 150, height: 150, borderRadius: 40, background: c, display: 'grid', placeItems: 'center', color: '#fff', fontFamily: FONT, fontWeight: 900, fontSize: 70, boxShadow: SH_LG, transform: `scale(${p}) rotate(${(1 - p) * -20}deg)`}}>{txt}<span style={{position: 'absolute', right: -10, top: -10, width: 52, height: 52, borderRadius: 26, background: OK, border: '5px solid #fff', fontSize: 26, display: 'grid', placeItems: 'center', opacity: prog(f, at + 8, 6)}}>✓</span></div> : null;
  };
  return (
    <AbsoluteFill style={{opacity: 1 - out}}>
      <div style={{position: 'absolute', left: 540, top: 820, width: 10, height: 10}}>
        {[0, 1, 2].map((k) => { const q = ((f - zone + k * 12) % 36) / 36; return f >= zone ? <div key={k} style={{position: 'absolute', left: -260, top: -260, width: 520, height: 520, borderRadius: '50%', border: `4px solid ${ACC}`, transform: `scale(${0.3 + q})`, opacity: (1 - q) * 0.7}} /> : null; })}
      </div>
      <div style={{position: 'absolute', left: 540 - 120, top: 600, width: 240, height: 427, borderRadius: 30, overflow: 'hidden', background: '#000', border: '6px solid #fff', boxShadow: SH_LG}}>
        <OffthreadVideo muted src={CLIP('sms-malik')} startFrom={140} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      </div>
      {icon(fb, 230, '#1877F2', 'f')}
      {icon(ig, 700, 'linear-gradient(45deg,#F59E0B,#EC4899,#8B5CF6)', '◎')}
      {f >= zone && <div style={{position: 'absolute', left: 0, right: 0, top: 1230, display: 'flex', justifyContent: 'center'}}><span style={{display: 'inline-flex', alignItems: 'center', gap: 10, padding: '16px 28px', borderRadius: 999, background: SURF, border: `2px solid ${ACC}`, boxShadow: SH, fontFamily: FONT, fontWeight: 800, fontSize: 32, color: ACC_INK, transform: `scale(${sp(f - zone, 10)})`}}>📍 Autour de toi</span></div>}
      <div style={{position: 'absolute', left: 0, right: 0, top: 1320, textAlign: 'center', fontFamily: FONT, fontWeight: 700, fontSize: 28, color: MUTED, opacity: r}}>Diffusée seulement là où sont tes clients</div>
    </AbsoluteFill>
  );
};

// ---------- 5. media buyer jour et nuit ----------
const Buyer: React.FC = () => {
  const f = useCurrentFrame();
  if (f < S.buyer - 2 || f > S.leads + 10) return null;
  const nuitAt = cue(5, 'nuit', 2.3);
  const n = prog(f, cue(5, 'jour', 1.98), 16, INOUT);
  const out = prog(f, S.leads - 4, 12, INOUT);
  const acts = ['Budget déplacé sur la meilleure pub', 'Nouvelle accroche mise en test', 'Pub fatiguée coupée'];
  const night = n > 0.5;
  return (
    <AbsoluteFill style={{opacity: 1 - out}}>
      <div style={{position: 'absolute', left: 120, right: 120, top: 560, height: 820, borderRadius: 40, overflow: 'hidden', boxShadow: SH_LG, background: `linear-gradient(180deg, ${night ? '#1B1745' : '#DCEBFF'} 0%, ${night ? '#0F0D2A' : '#FFFFFF'} 55%)`, border: `1px solid ${night ? '#2A2560' : LINE}`}}>
        <div style={{position: 'absolute', left: 420 - 70 + Math.cos(Math.PI * (1 - n)) * -240, top: 200 - Math.sin(Math.PI * n) * 120, width: 140, height: 140, borderRadius: 70, background: night ? '#E0E7FF' : '#FDB022', boxShadow: night ? 'inset -30px -10px 0 #B9C3F5' : '0 0 80px rgba(253,176,34,.7)'}} />
        {night && Array.from({length: 14}, (_, i) => <div key={i} style={{position: 'absolute', left: 30 + random(`sx${i}`) * 780, top: 20 + random(`sy${i}`) * 240, width: 5, height: 5, borderRadius: 3, background: '#fff', opacity: 0.4 + 0.6 * Math.abs(Math.sin(f / 7 + i))}} />)}
        <div style={{position: 'absolute', left: 36, top: 34, display: 'flex', alignItems: 'center', gap: 14}}>
          <span style={{width: 60, height: 60, borderRadius: 18, background: ACC_SOFT, display: 'grid', placeItems: 'center'}}><LogoMark size={36} /></span>
          <span style={{fontFamily: FONT, fontWeight: 800, fontSize: 36, color: night ? '#fff' : FG}}>Ton media buyer</span>
        </div>
        <div style={{position: 'absolute', left: 36, right: 36, top: 380, display: 'flex', flexDirection: 'column', gap: 18}}>
          {acts.map((a, i) => {
            const p = sp(f - S.buyer - 10 - i * 12, 12);
            return <div key={a} style={{display: 'flex', alignItems: 'center', gap: 16, padding: '22px 22px', borderRadius: 22, background: night ? '#1E1B4B' : '#F7F7FA', opacity: Math.min(1, p * 1.5), transform: `translateX(${(1 - p) * 60}px)`}}>
              <span style={{width: 48, height: 48, borderRadius: 15, background: GRAD, color: '#fff', display: 'grid', placeItems: 'center', fontSize: 26, flex: 'none'}}>✓</span>
              <span style={{fontFamily: FONT, fontWeight: 700, fontSize: 30, color: night ? '#fff' : FG}}>{a}</span>
            </div>;
          })}
        </div>
        <div style={{position: 'absolute', right: 36, top: 40, padding: '10px 20px', borderRadius: 999, background: night ? '#2A2560' : '#FEF3C7', color: night ? '#C7D2FE' : '#B45309', fontFamily: FONT, fontWeight: 800, fontSize: 26, opacity: f >= nuitAt - 30 ? 1 : 0}}>{night ? '☾ Nuit' : '☀ Jour'}</div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- 6. les clients arrivent ----------
const LEADS = [['Léa', 'veut un rendez-vous samedi'], ['Karim', 'demande un tarif'], ['Julie', 'veut réserver pour 2'], ['Hugo', 'demande une disponibilité']];
const Leads: React.FC = () => {
  const f = useCurrentFrame();
  if (f < S.leads - 2 || f > S.end + 10) return null;
  const toi = cue(6, 'toi', 1.2);
  const sw = prog(f, toi - 2, 14, INOUT);
  const out = prog(f, S.end - 4, 12, INOUT);
  return (
    <AbsoluteFill style={{opacity: 1 - out}}>
      <div style={{position: 'absolute', left: 120, right: 120, top: 560, display: 'flex', flexDirection: 'column', gap: 16, opacity: 1 - sw * 0.85, transform: `scale(${1 - sw * 0.12}) translateY(${-sw * 60}px)`}}>
        {LEADS.map(([n, t], i) => {
          const at = S.leads + 4 + i * 7, p = sp(f - at, 11);
          return f >= at ? <div key={n} style={{display: 'flex', alignItems: 'center', gap: 16, padding: '20px 22px', borderRadius: 24, background: SURF, border: `1px solid ${LINE}`, boxShadow: SH, transform: `translateY(${(1 - p) * -40}px) scale(${0.9 + 0.1 * p})`, opacity: Math.min(1, p * 1.6), fontFamily: FONT}}>
            <span style={{width: 58, height: 58, borderRadius: 29, background: ['#F59E0B', '#10B981', '#3B82F6', '#EC4899'][i], color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 26, flex: 'none'}}>{n[0]}</span>
            <div style={{flex: 1, minWidth: 0}}><div style={{fontWeight: 800, fontSize: 28, color: FG}}>Nouveau client · {n}</div><div style={{fontSize: 24, color: DIM, marginTop: 4}}>{t}</div></div>
            <span style={{padding: '10px 16px', borderRadius: 14, background: ACC, color: '#fff', fontWeight: 800, fontSize: 22}}>Appeler</span>
          </div> : null;
        })}
      </div>
      {f >= toi - 4 && (
        <div style={{position: 'absolute', left: 540 - 190, top: 700, width: 380, height: 675, borderRadius: 40, overflow: 'hidden', background: '#000', border: '6px solid #fff', boxShadow: SH_LG, transform: `scale(${0.6 + 0.4 * sp(f - toi + 2, 13)})`, opacity: Math.min(1, sw * 1.5)}}>
          <Sequence from={toi - 4} layout="none"><OffthreadVideo muted src={CLIP('lr_darius')} startFrom={20} style={{width: '100%', height: '100%', objectFit: 'cover'}} /></Sequence>
        </div>
      )}
    </AbsoluteFill>
  );
};

// ---------- 7. fin ----------
const End: React.FC = () => {
  const f = useCurrentFrame(); // local
  const L = (k: string, d: number) => cue(7, k, d) - S.end;
  const logo = sp(f - 2, 12), a = sp(f - L('ta', 1.06) + 2, 12), b = sp(f - L('clic', 2.06) + 2, 12);
  const pressAt = L('clic', 2.06) + 14;
  const cx = interpolate(f, [pressAt - 24, pressAt - 3], [900, 640], {...clamp, easing: EXPO}), cy = interpolate(f, [pressAt - 24, pressAt - 3], [1500, 1150], {...clamp, easing: EXPO});
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 0, right: 0, top: 300, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 18, transform: `scale(${logo})`}}>
        <div style={{width: 100, height: 100, borderRadius: 30, background: SURF, border: `1px solid ${LINE}`, boxShadow: SH, display: 'grid', placeItems: 'center'}}><LogoMark size={64} draw={prog(f, 2, 18)} /></div>
        <Wordmark size={66} />
      </div>
      <div style={{position: 'absolute', left: 90, right: 90, top: 520, textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 132, lineHeight: 1.0, letterSpacing: '-0.06em', color: FG}}>
        <div style={{opacity: a, transform: `translateY(${(1 - a) * 40}px)`}}>Ta pub,</div>
        <div style={{opacity: b, transform: `translateY(${(1 - b) * 40}px)`}}><G>en un clic.</G></div>
      </div>
      {f >= L('ta', 1.06) && <BigButton label="Commencer →" at={pressAt} y={1100} w={560} h={170} size={54} />}
      {f >= pressAt - 26 && f < pressAt + 30 && <Cursor x={cx} y={cy} press={f >= pressAt && f < pressAt + 6 ? 1 : 0} />}
      <div style={{position: 'absolute', left: 0, right: 0, top: 1260, textAlign: 'center', fontFamily: FONT, fontWeight: 700, fontSize: 34, color: DIM, opacity: prog(f, pressAt + 4, 10)}}>growthity.ai</div>
    </AbsoluteFill>
  );
};

export const BoutonVideo: React.FC = () => {
  useFonts();
  const f = useCurrentFrame();
  const flash = (at: number) => interpolate(f, [at - 1, at, at + 5], [0, 0.5, 0], clamp);
  return (
    <AbsoluteFill style={{background: PAGE, fontFamily: FONT}}>
      <Bg />
      <Title start={cue(1, 'un', 0.12) - 2} end={S.wall} a="Un bouton." top={420} size={120} />
      <Hook />
      <Title start={S.wall + 2} end={S.chat} a="Ta pub vidéo" b="est prête." size={84} top={236} />
      <Wall />
      <Title start={S.chat + 2} end={S.pub} a="Une phrase." b="Et c’est tout." size={92} />
      <Chat />
      <Title start={S.pub + 2} end={S.buyer} a="Publiée partout," b="autour de toi." size={92} />
      <Publish />
      <Title start={S.buyer + 2} end={S.leads} a="Pilotée" b="jour et nuit." size={96} />
      <Buyer />
      <Title start={S.leads + 2} end={cue(6, 'toi', 1.2) - 2} a="Les clients" b="arrivent." size={100} />
      <Title start={cue(6, 'toi', 1.2)} end={S.end} a="Toi, tu fais" b="ton métier." size={96} />
      <Leads />
      <Sequence from={S.end}><End /></Sequence>
      <AbsoluteFill style={{background: '#fff', opacity: Math.max(flash(PRESS), flash(S.end)), pointerEvents: 'none'}} />
      <Audio src={staticFile('bouton/bed.wav')} />
      {[1, 2, 3, 4, 5, 6, 7].map((k) => <Sequence key={k} from={VO[k]}><Audio src={staticFile(`voice/bt-${k}-n.mp3`)} /></Sequence>)}
    </AbsoluteFill>
  );
};
