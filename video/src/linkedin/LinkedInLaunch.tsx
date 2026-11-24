// « Growthity est en ligne » — annonce LinkedIn v2, 4:5 (1080×1350), ~40 s.
// Esprit de la vidéo motion « Tout. Au même endroit » (studio sombre → clair), mais centrée produit + génération de leads.
// Hook : une vraie pub UGC (carport solaire) joue avec son son, rembobinage, « Cette pub n'a jamais été tournée. »
// → une phrase → script / actrice / voix / sous-titres s'assemblent → en ligne sur Facebook + Instagram dans la zone
// → carte de la zone qui s'allume, formulaire de devis qui se remplit, leads dans Growthity + alerte WhatsApp
// → le media buyer analyse et conseille (vrai) → posts sur tous les réseaux → « Growthity est en ligne. »
// Aucun chiffre de résultat ; exemple différent du carrousel (carports solaires, autour de Lyon).
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
import {StudioBg, Dust} from '../chatpub/MotionChatPub';
import FRANCE from '../leads/france_deps.json';
import WORDS from './words.json';
import TLJ from './timeline.json';

type Word = {w: string; s: number; e: number};
const WD = WORDS as unknown as Record<string, Word[]>;
const TL = TLJ as unknown as {VO: Record<string, number>; S: Record<string, number>};
export const LS = TL.S;
const VO = TL.VO;
const PAGE = '#F4F4F7', SURF = '#FFFFFF', LINE = '#E7E7EE', FG = '#141418', MUTED = '#44444F', DIM = '#737381';
const ACC = '#5B3FE4', ACC_SOFT = '#F0ECFF', OK = '#137A45', OK_SOFT = '#E6F5EC';
const GRAD = 'linear-gradient(120deg, #2563EB 0%, #5B3FE4 52%, #9333EA 100%)';
const FONT = 'Inter, system-ui, sans-serif';
const SH = '0 1px 2px rgba(20,20,40,.04), 0 10px 30px rgba(20,20,40,.08)';
const SH_LG = '0 40px 90px -30px rgba(20,20,60,.45)';
const sp = (f: number, d = 14, m = 0.8) => spring({frame: f, fps: 30, config: {damping: d, mass: m, stiffness: 170}});
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const G: React.FC<{children: React.ReactNode}> = ({children}) => <span style={{backgroundImage: GRAD, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent'}}>{children}</span>;
const cue = (k: number, start: string, d = 0) => {
  const w = WD[`li-${k}`].find((x) => x.w.toLowerCase().startsWith(start));
  return VO[k] + Math.round((w ? w.s : d) * 30);
};
const AD = staticFile('media/linkedin/carport.mp4');
const ORDER = ['hook', 'make', 'pub', 'leads', 'buyer', 'social', 'end'];
const nextOf = (k: string) => LS[ORDER[ORDER.indexOf(k) + 1]] ?? LS.total;
const Brand: React.FC<{k: string; s: number; c?: string}> = ({k, s, c}) => {
  const col = c ?? ({instagram: '#FF0069', facebook: '#0866FF', tiktok: '#000000', youtube: '#FF0000', whatsapp: '#25D366', linkedin: '#0A66C2', meta: '#0866FF'} as Record<string, string>)[k];
  return <svg width={s} height={s} viewBox="0 0 24 24"><path d={BRAND_PATHS[k]} fill={col} /></svg>;
};
const Check: React.FC<{s?: number; c?: string}> = ({s = 30, c = OK}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>;

const useFonts = () => {
  const [h] = useState(() => delayRender('fonts'));
  useEffect(() => { Promise.all(['600 20px Inter', '700 20px Inter', '800 20px Inter', '900 20px Inter'].map((s) => document.fonts.load(s))).then(() => continueRender(h)); }, [h]);
};

const LightBg: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: PAGE}}>
      <AbsoluteFill style={{background: `radial-gradient(800px 700px at ${50 + Math.sin(f / 40) * 10}% ${35 + Math.cos(f / 50) * 8}%, rgba(91,63,228,0.16), transparent 70%)`}} />
      <AbsoluteFill style={{background: `radial-gradient(600px 600px at ${15 - Math.sin(f / 35) * 6}% 90%, rgba(37,99,235,0.12), transparent 70%)`}} />
      <AbsoluteFill style={{backgroundImage: 'radial-gradient(rgba(20,20,40,0.07) 1.4px, transparent 1.6px)', backgroundSize: '36px 36px', maskImage: 'radial-gradient(ellipse at 50% 45%, black 25%, transparent 75%)', WebkitMaskImage: 'radial-gradient(ellipse at 50% 45%, black 25%, transparent 75%)'}} />
    </AbsoluteFill>
  );
};

// titre de chapitre (chiffre + titre en 2 temps)
const Head: React.FC<{n: string; a: string; b?: string; at: number; bAt?: number; end: number; dark?: boolean}> = ({n, a, b, at, bAt, end, dark}) => {
  const f = useCurrentFrame();
  if (f < at - 1 || f > end + 1) return null;
  const p1 = sp(f - at, 12), p2 = sp(f - (bAt ?? at + 6), 12), o = prog(f, end - 8, 8, INOUT);
  return (
    <div style={{position: 'absolute', left: 80, right: 80, top: 90, fontFamily: FONT, opacity: 1 - o, transform: `translateY(${-o * 24}px)`}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 14, fontWeight: 800, fontSize: 24, letterSpacing: '0.16em', color: dark ? '#A78BFA' : ACC, opacity: p1}}>{n}<span style={{width: 60 * p1, height: 4, borderRadius: 2, background: GRAD}} /></div>
      <div style={{marginTop: 14, fontWeight: 900, fontSize: 82, lineHeight: 1.0, letterSpacing: '-0.05em', color: dark ? '#fff' : FG}}>
        <div style={{overflow: 'hidden', paddingBottom: 6}}><div style={{transform: `translateY(${(1 - p1) * 110}%)`}}>{a}</div></div>
        {b && <div style={{overflow: 'hidden', paddingBottom: 8}}><div style={{transform: `translateY(${(1 - p2) * 110}%)`}}><G>{b}</G></div></div>}
      </div>
    </div>
  );
};

// ---------- 1. hook : la pub joue, rembobinage, « jamais tournée » ----------
const RW_AT = 74; // début du rembobinage
const Hook: React.FC = () => {
  const f = useCurrentFrame();
  if (f > LS.make + 12) return null;
  const inP = sp(f, 16);
  const rw = f >= RW_AT && f < RW_AT + 12;
  const after = f >= RW_AT + 12;
  const out = prog(f, LS.make - 4, 14, INOUT);
  const shrink = interpolate(f, [RW_AT + 10, RW_AT + 26], [1, 0.62], {...clamp, easing: EXPO});
  const stamp = sp(f - cue(1, 'tournée', 1.4), 9);
  const glitch = rw ? (random(`g${f}`) - 0.5) * 30 : 0;
  return (
    <AbsoluteFill style={{opacity: 1 - out}}>
      <StudioBg intensity={after ? 1 : 0.6} />
      <Dust o={0.5} />
      <div style={{position: 'absolute', left: 540 - 300 * shrink, top: (after ? 300 : 70) + (1 - inP) * 200 + (after ? (1 - shrink) * -280 : 0), width: 600 * shrink, height: 1067 * shrink, borderRadius: 44 * shrink, overflow: 'hidden', background: '#000', border: `${10 * shrink}px solid #fff`, boxShadow: '0 60px 140px -40px rgba(0,0,0,.9), 0 30px 90px -30px rgba(101,82,232,.7)', transform: `translateX(${glitch}px) rotate(${after ? -3 * (1 - shrink) * 2 : 0}deg)`, filter: rw ? `hue-rotate(${f * 40}deg) contrast(1.4)` : undefined}}>
        <OffthreadVideo src={AD} startFrom={0} muted={f >= RW_AT} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
        {rw && <AbsoluteFill style={{backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,.12) 0 2px, transparent 2px 6px)'}} />}
        {rw && <div style={{position: 'absolute', left: 20, top: 20, fontFamily: FONT, fontWeight: 900, fontSize: 40, color: '#fff', textShadow: '0 2px 10px #000'}}>◀◀</div>}
      </div>
      {after && (
        <div style={{position: 'absolute', left: 80, right: 80, top: 980, textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 86, lineHeight: 1.0, letterSpacing: '-0.05em', color: '#fff'}}>
          <div style={{transform: `translateY(${(1 - sp(f - VO[1], 12)) * 60}px)`, opacity: sp(f - VO[1], 12)}}>Cette pub n’a jamais</div>
          <div style={{transform: `translateY(${(1 - sp(f - VO[1] - 8, 12)) * 60}px)`, opacity: sp(f - VO[1] - 8, 12), color: '#C4B5FD'}}>été tournée.</div>
        </div>
      )}
      {stamp > 0 && <div style={{position: 'absolute', left: 540 + 120, top: 560, padding: '12px 22px', borderRadius: 16, border: '6px solid #A78BFA', color: '#fff', background: 'rgba(91,63,228,.85)', fontFamily: FONT, fontWeight: 900, fontSize: 34, transform: `scale(${2.2 - stamp * 1.2}) rotate(-10deg)`, opacity: Math.min(1, stamp * 2)}}>ZÉRO TOURNAGE</div>}
    </AbsoluteFill>
  );
};

// ---------- 2. une phrase → assemblage ----------
const PROMPT = 'Une pub pour mes carports solaires, autour de Lyon.';
const Make: React.FC = () => {
  const f = useCurrentFrame();
  if (f < LS.make - 2 || f > LS.pub + 12) return null;
  const inP = sp(f - LS.make, 14);
  const out = prog(f, LS.pub - 6, 14, INOUT);
  const typed = PROMPT.slice(0, Math.max(0, Math.floor((f - LS.make - 8) * 1.8)));
  const tiles: [string, string, string, number][] = [['📝', 'Script', 'script', 0], ['🎭', 'Actrice', "l'actrice", 1], ['🎙️', 'Voix', 'voix', 2], ['💬', 'Sous-titres', 'sous-titres', 3]];
  const merge = interpolate(f, [cue(3, 'sous-titres', 5.4) + 14, cue(3, 'sous-titres', 5.4) + 34], [0, 1], {...clamp, easing: EXPO});
  return (
    <AbsoluteFill style={{opacity: 1 - out}}>
      <div style={{position: 'absolute', left: 80, right: 80, top: 330, perspective: 1600}}>
        <div style={{padding: '24px 26px', borderRadius: 30, background: SURF, border: `2px solid ${ACC}`, boxShadow: SH_LG, display: 'flex', alignItems: 'center', gap: 14, transform: `rotateX(${(1 - inP) * 30}deg) translateY(${(1 - inP) * 60 - merge * 40}px) scale(${1 - merge * 0.1})`, opacity: Math.min(1, inP * 1.5) * (1 - merge * 0.6)}}>
          <LogoMark size={40} />
          <span style={{flex: 1, fontFamily: FONT, fontWeight: 600, fontSize: 36, lineHeight: 1.3, color: FG, minHeight: 92}}>{typed}<span style={{color: ACC, opacity: Math.floor(f / 8) % 2 ? 0 : 1}}>|</span></span>
          <span style={{width: 70, height: 70, borderRadius: 35, background: typed.length === PROMPT.length ? GRAD : '#D7D7E1', color: '#fff', display: 'grid', placeItems: 'center', fontSize: 32, fontWeight: 900, flex: 'none'}}>↑</span>
        </div>
      </div>
      {tiles.map(([ic, t, w, i]) => {
        const at = cue(3, w, 2 + i);
        const p = sp(f - at, 11);
        const x0 = 80 + (i % 2) * 470, y0 = 560 + Math.floor(i / 2) * 200;
        const x = x0 + (540 - 210 - x0) * merge, y = y0 + (720 - y0) * merge;
        return f >= at - 1 ? <div key={t} style={{position: 'absolute', left: x, top: y, width: 420, height: 170, borderRadius: 30, background: SURF, border: `1px solid ${LINE}`, boxShadow: SH_LG, display: 'flex', alignItems: 'center', gap: 18, padding: '0 28px', fontFamily: FONT, transform: `scale(${p * (1 - merge * 0.6)}) rotate(${(1 - p) * (i % 2 ? 8 : -8)}deg)`, opacity: Math.min(1, p * 1.5) * (1 - merge)}}>
          <span style={{width: 84, height: 84, borderRadius: 24, background: ACC_SOFT, display: 'grid', placeItems: 'center', fontSize: 44}}>{ic}</span>
          <span style={{flex: 1, fontWeight: 800, fontSize: 40, color: FG}}>{t}</span><Check s={44} />
        </div> : null;
      })}
      {merge > 0 && (
        <div style={{position: 'absolute', left: 540 - 190, top: 560, width: 380, height: 676, borderRadius: 42, overflow: 'hidden', border: '8px solid #fff', boxShadow: SH_LG, transform: `scale(${0.4 + 0.6 * merge})`, opacity: merge}}>
          <Sequence from={cue(3, 'sous-titres', 5.4) + 14} layout="none"><OffthreadVideo muted src={AD} startFrom={90} style={{width: '100%', height: '100%', objectFit: 'cover'}} /></Sequence>
          <div style={{position: 'absolute', left: 14, top: 14, display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 999, background: OK, color: '#fff', fontFamily: FONT, fontWeight: 800, fontSize: 20}}><Check s={20} c="#fff" /> Prête</div>
        </div>
      )}
    </AbsoluteFill>
  );
};

// ---------- 3. en ligne sur Facebook + Instagram, dans votre zone ----------
const FeedCard: React.FC<{k: 'facebook' | 'instagram'; x: number; at: number; tilt: number}> = ({k, x, at, tilt}) => {
  const f = useCurrentFrame();
  const p = sp(f - at, 12);
  return (
    <div style={{position: 'absolute', left: x, top: 330, width: 430, borderRadius: 30, background: SURF, boxShadow: SH_LG, overflow: 'hidden', fontFamily: FONT, transform: `translateY(${(1 - p) * 300}px) rotate(${tilt * p}deg)`, opacity: Math.min(1, p * 1.4)}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 12, padding: '16px 18px'}}>
        <div style={{width: 46, height: 46, borderRadius: 23, background: '#0F766E', color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 900, fontSize: 20}}>S</div>
        <div style={{flex: 1}}><div style={{fontWeight: 800, fontSize: 22, color: FG}}>Solaire Rhône</div><div style={{fontSize: 18, color: DIM}}>Sponsorisé</div></div>
        <Brand k={k} s={38} />
      </div>
      <div style={{height: k === 'instagram' ? 600 : 520, background: '#000', overflow: 'hidden'}}>
        <OffthreadVideo muted src={AD} startFrom={k === 'instagram' ? 150 : 210} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      </div>
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 18px', background: '#F7F7FA'}}>
        <span style={{fontWeight: 700, fontSize: 20, color: MUTED}}>Devis en ligne</span>
        <span style={{padding: '10px 18px', borderRadius: 10, background: k === 'facebook' ? '#0866FF' : FG, color: '#fff', fontWeight: 800, fontSize: 20}}>Demander un devis</span>
      </div>
    </div>
  );
};
const Pub: React.FC = () => {
  const f = useCurrentFrame();
  if (f < LS.pub - 2 || f > LS.leads + 12) return null;
  const out = prog(f, LS.leads - 6, 14, INOUT);
  const zone = cue(4, 'zone', 3.6);
  const z = sp(f - zone, 12);
  return (
    <AbsoluteFill style={{opacity: 1 - out, transform: `scale(${1 - out * 0.08})`}}>
      <FeedCard k="facebook" x={70} at={cue(4, 'facebook', 2.2)} tilt={-3} />
      <FeedCard k="instagram" x={580} at={cue(4, 'instagram', 2.8)} tilt={3} />
      {f >= zone - 1 && <div style={{position: 'absolute', left: 0, right: 0, top: 1130, display: 'flex', justifyContent: 'center'}}><span style={{display: 'inline-flex', alignItems: 'center', gap: 12, padding: '18px 30px', borderRadius: 999, background: SURF, border: `2px solid ${ACC}`, boxShadow: SH, fontFamily: FONT, fontWeight: 800, fontSize: 34, color: ACC, transform: `scale(${z})`}}>📍 Diffusée autour de Lyon</span></div>}
    </AbsoluteFill>
  );
};

// ---------- 4. génération de leads : carte, formulaire, leads, WhatsApp ----------
const FR = FRANCE as unknown as {w: number; h: number; deps: {c: string; n: string; d: string}[]};
const ZONE = ['69', '01', '38', '42', '71', '73', '74', '26', '07'];
const FORM: [string, string][] = [['Nom', 'Marc Dubois'], ['Ville', 'Villeurbanne'], ['Projet', 'Carport solaire 2 places'], ['Téléphone', '06 •• •• •• 42']];
const LEADS: [string, string, string][] = [['Marc D.', 'Villeurbanne', 'Carport 2 places'], ['Sophie L.', 'Annecy', 'Carport + borne'], ['Karim B.', 'Saint-Étienne', 'Carport 1 place'], ['Julie M.', 'Grenoble', 'Demande de devis']];
const Leads: React.FC = () => {
  const f = useCurrentFrame();
  if (f < LS.leads - 2 || f > LS.buyer + 12) return null;
  const out = prog(f, LS.buyer - 6, 14, INOUT);
  const lf = f - LS.leads;
  const mapP = sp(lf, 14);
  const formAt = cue(5, 'remplissent', 1.4);
  const fieldAt = (i: number) => formAt + 6 + i * 9;
  const sentAt = fieldAt(FORM.length) + 4;
  const tableAt = cue(6, 'demandes', 0.6);
  const waAt = cue(6, 'whatsapp', 3.2);
  const swap = prog(f, tableAt - 6, 14, INOUT);
  const MS = 1.45;
  return (
    <AbsoluteFill style={{opacity: 1 - out}}>
      {/* carte + formulaire */}
      <div style={{position: 'absolute', inset: 0, opacity: 1 - swap, transform: `translateX(${-swap * 120}px)`}}>
        <div style={{position: 'absolute', left: 70, top: 340, width: FR.w * MS, height: FR.h * MS, opacity: mapP, transform: `scale(${0.9 + 0.1 * mapP})`}}>
          <svg width={FR.w * MS} height={FR.h * MS} viewBox={`0 0 ${FR.w} ${FR.h}`}>
            {FR.deps.map((d) => { const i = ZONE.indexOf(d.c); const p = i >= 0 ? sp(lf - 6 - i * 3, 12) : 0; return <path key={d.c} d={d.d} fill={i >= 0 ? `rgba(91,63,228,${0.25 + 0.6 * p})` : '#E4E2EC'} stroke="#fff" strokeWidth={0.8} />; })}
          </svg>
          {[[0.62, 0.52], [0.66, 0.47], [0.6, 0.57], [0.68, 0.58]].map(([x, y], i) => { const p = sp(lf - 30 - i * 7, 9); return <div key={i} style={{position: 'absolute', left: FR.w * MS * x - 16, top: FR.h * MS * y - 40, fontSize: 40, transform: `scale(${p}) translateY(${(1 - p) * -30}px)`}}>📍</div>; })}
        </div>
        <div style={{position: 'absolute', right: 60, top: 560, width: 470, padding: '26px 26px', borderRadius: 30, background: SURF, boxShadow: SH_LG, fontFamily: FONT, transform: `translateX(${(1 - sp(f - formAt, 13)) * 400}px)`}}>
          <div style={{fontWeight: 900, fontSize: 32, color: FG}}>Demande de devis</div>
          <div style={{fontSize: 20, color: DIM, marginTop: 4}}>Solaire Rhône · Formulaire Meta</div>
          {FORM.map(([k, v], i) => { const at = fieldAt(i); const n = Math.max(0, Math.min(v.length, Math.floor((f - at) * 1.6))); return (
            <div key={k} style={{marginTop: 14}}>
              <div style={{fontSize: 18, fontWeight: 700, color: DIM}}>{k}</div>
              <div style={{marginTop: 4, padding: '12px 14px', borderRadius: 12, border: `2px solid ${f >= at && n < v.length ? ACC : LINE}`, fontSize: 24, fontWeight: 600, color: FG, minHeight: 52}}>{v.slice(0, n)}</div>
            </div>); })}
          <div style={{marginTop: 18, padding: '16px 0', borderRadius: 14, textAlign: 'center', background: f >= sentAt ? OK : '#0866FF', color: '#fff', fontWeight: 800, fontSize: 26}}>{f >= sentAt ? '✓ Envoyé' : 'Envoyer'}</div>
        </div>
      </div>
      {/* leads dans Growthity */}
      {f >= tableAt - 6 && (
        <div style={{position: 'absolute', left: 80, right: 80, top: 330, padding: '26px 28px', borderRadius: 32, background: SURF, boxShadow: SH_LG, fontFamily: FONT, opacity: swap, transform: `translateX(${(1 - swap) * 140}px)`}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 14}}><LogoMark size={40} /><span style={{fontWeight: 900, fontSize: 36, color: FG, flex: 1}}>Leads</span><span style={{padding: '8px 16px', borderRadius: 999, background: OK_SOFT, color: OK, fontWeight: 800, fontSize: 22}}>● En direct</span></div>
          <div style={{marginTop: 18, display: 'flex', flexDirection: 'column', gap: 12}}>
            {LEADS.map(([n, v, p], i) => { const at = tableAt + 4 + i * 9; const q = sp(f - at, 11); return f >= at ? (
              <div key={n} style={{display: 'flex', alignItems: 'center', gap: 16, padding: '16px 18px', borderRadius: 20, background: i === 0 ? ACC_SOFT : '#F7F7FA', transform: `translateY(${(1 - q) * -30}px)`, opacity: q}}>
                <span style={{width: 56, height: 56, borderRadius: 28, background: ['#F59E0B', '#10B981', '#3B82F6', '#EC4899'][i], color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 24}}>{n[0]}</span>
                <div style={{flex: 1}}><div style={{fontWeight: 800, fontSize: 28, color: FG}}>{n} · {v}</div><div style={{fontSize: 22, color: DIM}}>{p}</div></div>
                <span style={{padding: '10px 16px', borderRadius: 12, background: ACC, color: '#fff', fontWeight: 800, fontSize: 20}}>Appeler</span>
              </div>) : null; })}
          </div>
        </div>
      )}
      {f >= waAt - 2 && (
        <div style={{position: 'absolute', left: 120, right: 120, top: 1000, display: 'flex', alignItems: 'center', gap: 16, padding: '18px 22px', borderRadius: 24, background: '#fff', boxShadow: SH_LG, fontFamily: FONT, transform: `translateY(${(1 - sp(f - waAt, 11)) * 120}px)`, opacity: sp(f - waAt, 11)}}>
          <span style={{width: 60, height: 60, borderRadius: 16, background: '#25D366', display: 'grid', placeItems: 'center'}}><Brand k="whatsapp" s={36} c="#fff" /></span>
          <div style={{flex: 1}}><div style={{fontWeight: 800, fontSize: 24, color: FG}}>WhatsApp · Growthity</div><div style={{fontSize: 22, color: MUTED}}>🔔 Nouveau lead : Marc D., Villeurbanne</div></div>
          <span style={{fontSize: 18, color: DIM}}>maintenant</span>
        </div>
      )}
    </AbsoluteFill>
  );
};

// ---------- 5. media buyer (vrai : analyse + conseils) ----------
const Buyer: React.FC = () => {
  const f = useCurrentFrame();
  if (f < LS.buyer - 2 || f > LS.social + 12) return null;
  const out = prog(f, LS.social - 6, 14, INOUT);
  const inP = sp(f - LS.buyer, 13);
  const bars = [0.3, 0.42, 0.38, 0.55, 0.5, 0.66, 0.72, 0.84];
  const tips: [string, string, string][] = [['🏆', 'Meilleure pub', 'Version « carport + voiture »'], ['💡', 'Conseil', 'Tester une accroche sur les aides'], ['👉', 'À faire', 'Plus de budget sur la meilleure version']];
  return (
    <AbsoluteFill style={{opacity: 1 - out}}>
      <div style={{position: 'absolute', left: 80, right: 80, top: 330, padding: '28px 30px', borderRadius: 34, background: '#14122B', boxShadow: SH_LG, fontFamily: FONT, transform: `translateY(${(1 - inP) * 80}px)`, opacity: inP}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 14}}><span style={{width: 56, height: 56, borderRadius: 17, background: '#fff', display: 'grid', placeItems: 'center'}}><LogoMark size={34} /></span><span style={{fontWeight: 800, fontSize: 34, color: '#fff', flex: 1}}>Votre media buyer</span><span style={{padding: '8px 16px', borderRadius: 999, background: '#2A2560', color: '#C7D2FE', fontWeight: 800, fontSize: 20}}>Analyse</span></div>
        <div style={{display: 'flex', alignItems: 'flex-end', gap: 12, height: 200, marginTop: 24, borderBottom: '2px solid #2A2560'}}>
          {bars.map((h, i) => <div key={i} style={{flex: 1, height: `${h * 100 * sp(f - LS.buyer - 6 - i * 2, 14)}%`, borderRadius: '10px 10px 3px 3px', background: i === bars.length - 1 ? GRAD : '#2E2A5C'}} />)}
        </div>
        <div style={{marginTop: 18, display: 'flex', flexDirection: 'column', gap: 10}}>
          {tips.map(([ic, t, d], i) => { const at = (i === 0 ? cue(7, 'analyse', 1.2) : cue(7, 'améliorer', 3.2)) + i * 6; const q = sp(f - at, 12); return <div key={t} style={{display: 'flex', alignItems: 'center', gap: 14, padding: '16px 18px', borderRadius: 18, background: '#1E1B4B', fontSize: 26, color: '#fff', opacity: q, transform: `translateX(${(1 - q) * 50}px)`}}><span style={{fontSize: 30}}>{ic}</span><b>{t}</b><span style={{color: '#C7D2FE'}}>{d}</span></div>; })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- 6. tous les réseaux ----------
const Social: React.FC = () => {
  const f = useCurrentFrame();
  if (f < LS.social - 2 || f > LS.end + 12) return null;
  const out = prog(f, LS.end - 6, 14, INOUT);
  const nets = ['instagram', 'facebook', 'tiktok', 'youtube', 'linkedin'];
  return (
    <AbsoluteFill style={{opacity: 1 - out}}>
      <div style={{position: 'absolute', left: 540 - 90, top: 640, width: 180, height: 180, borderRadius: 50, background: SURF, boxShadow: SH_LG, display: 'grid', placeItems: 'center', transform: `scale(${sp(f - LS.social, 12)})`}}><LogoMark size={100} /></div>
      {nets.map((k, i) => {
        const a = (i / nets.length) * Math.PI * 2 - Math.PI / 2 + f / 60;
        const p = sp(f - cue(8, 'réseaux', 1.6) + 10 - i * 3, 11);
        const r = 330 * p;
        return <div key={k} style={{position: 'absolute', left: 540 + Math.cos(a) * r - 70, top: 730 + Math.sin(a) * r - 70, width: 140, height: 140, borderRadius: 40, background: SURF, border: `1px solid ${LINE}`, boxShadow: SH_LG, display: 'grid', placeItems: 'center', opacity: p}}><Brand k={k} s={80} /><span style={{position: 'absolute', right: -8, top: -8, width: 44, height: 44, borderRadius: 22, background: OK, border: '4px solid #fff', display: 'grid', placeItems: 'center'}}><Check s={22} c="#fff" /></span></div>;
      })}
    </AbsoluteFill>
  );
};

// ---------- 7. fin ----------
const End: React.FC = () => {
  const f = useCurrentFrame(); // local (dans la Sequence de fin)
  const a = sp(f - 6, 12), b = sp(f - (cue(9, 'vos', 1.4) - LS.end), 12), btn = sp(f - (cue(9, 'endroit', 3.0) - LS.end) - 8, 11);
  return (
    <AbsoluteFill>
      <StudioBg />
      <Dust o={0.7} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 230, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 18, transform: `scale(${sp(f, 12)})`}}>
        <div style={{width: 110, height: 110, borderRadius: 32, background: '#fff', display: 'grid', placeItems: 'center'}}><LogoMark size={70} draw={prog(f, 2, 20)} /></div>
        <Wordmark size={70} dark />
      </div>
      <div style={{position: 'absolute', left: 70, right: 70, top: 440, textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 124, lineHeight: 1.0, letterSpacing: '-0.055em', color: '#fff'}}>
        <div style={{opacity: a, transform: `translateY(${(1 - a) * 50}px)`}}>Growthity</div>
        <div style={{opacity: a, transform: `translateY(${(1 - a) * 50}px)`, color: '#C4B5FD'}}>est en ligne.</div>
      </div>
      <div style={{position: 'absolute', left: 90, right: 90, top: 740, textAlign: 'center', fontFamily: FONT, fontWeight: 700, fontSize: 46, lineHeight: 1.25, color: 'rgba(255,255,255,.85)', opacity: b, transform: `translateY(${(1 - b) * 30}px)`}}>Vos pubs et vos clients,<br />au même endroit.</div>
      <div style={{position: 'absolute', left: 540 - 260, top: 960, width: 520, height: 130, borderRadius: 65, background: GRAD, display: 'grid', placeItems: 'center', color: '#fff', fontFamily: FONT, fontWeight: 900, fontSize: 48, boxShadow: '0 30px 60px -20px rgba(91,63,228,.8)', transform: `scale(${btn})`, opacity: Math.min(1, btn * 1.5)}}>growthity.ai →</div>
    </AbsoluteFill>
  );
};

// sous-titres (LinkedIn lit sans le son)
const Caps: React.FC = () => {
  const g = useCurrentFrame();
  let k = 0;
  for (let i = 1; i <= 9; i++) if (g >= VO[i] - 2) k = i;
  if (!k || g >= LS.end) return null;
  const words = WD[`li-${k}`]; const t = (g - VO[k]) / 30;
  const i = words.findIndex((w) => t < w.e + 0.12);
  if (i < 0 || t < words[0].s - 0.1) return null;
  const grp = words.slice(Math.floor(i / 3) * 3, Math.floor(i / 3) * 3 + 3);
  const dark = g < LS.make;
  return (
    <div style={{position: 'absolute', left: 60, right: 60, top: 1200, display: 'flex', justifyContent: 'center', gap: 12}}>
      {grp.map((w, j) => { const on = t >= w.s - 0.02, hot = on && t <= w.e + 0.08; return <span key={j} style={{fontFamily: FONT, fontWeight: 900, fontSize: 46, padding: '4px 12px', borderRadius: 12, textTransform: 'uppercase', color: hot ? '#fff' : dark ? '#fff' : FG, background: hot ? ACC : dark ? 'rgba(0,0,0,.35)' : 'rgba(255,255,255,.9)', opacity: on ? 1 : 0.5}}>{w.w.replace(/[.,:]$/, '')}</span>; })}
    </div>
  );
};

export const LinkedInLaunch: React.FC = () => {
  useFonts();
  const f = useCurrentFrame();
  const flash = (at: number) => interpolate(f, [at - 1, at, at + 5], [0, 0.55, 0], clamp);
  return (
    <AbsoluteFill style={{background: PAGE, fontFamily: FONT}}>
      <LightBg />
      <Hook />
      <Head n="01 — UNE PHRASE" a="Vous décrivez." b="Growthity crée." bAt={cue(3, 'growthity', 1.6)} at={LS.make + 4} end={LS.pub} />
      <Make />
      <Head n="02 — DIFFUSION" a="En ligne sur Meta," b="dans votre zone." bAt={cue(4, 'zone', 3.6)} at={LS.pub + 4} end={LS.leads} />
      <Pub />
      <Head n="03 — VOS LEADS" a="Les demandes" b="arrivent toutes seules." bAt={cue(6, 'demandes', 0.6)} at={LS.leads + 4} end={LS.buyer} />
      <Leads />
      <Head n="04 — ANALYSE" a="Votre media buyer" b="vous conseille." at={LS.buyer + 4} end={LS.social} />
      <Buyer />
      <Head n="05 — RÉSEAUX" a="Vos posts aussi," b="partout." at={LS.social + 4} end={LS.end} />
      <Social />
      <Sequence from={LS.end}><End /></Sequence>
      <Caps />
      <AbsoluteFill style={{background: '#fff', opacity: Math.max(flash(LS.make), flash(LS.end)), pointerEvents: 'none'}} />
      <Audio src={staticFile('linkedin/bed.wav')} />
      {Array.from({length: 9}, (_, i) => i + 1).map((k) => <Sequence key={k} from={VO[k]}><Audio src={staticFile(`voice/li-${k}-n.mp3`)} /></Sequence>)}
    </AbsoluteFill>
  );
};
