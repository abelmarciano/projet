// « Growthity est en ligne » — film de lancement 16:9 (1920×1080, ~58 s) pour YouTube et la landing.
// Même promesse que la vidéo de la landing (créer, lancer, piloter), avec une nouvelle mise en scène :
// Growthity est en ligne / Créez. Lancez. Pilotez. (mode clair) → mur 3D de pubs UGC « Aucune de ces pubs n'a été tournée »
// → site → marque comprise → galerie d'inspiration recréée → acteurs IA + 24 créas → Meta Ads (ventes ou leads,
// dès 1 €/jour, 0 commission) → leads dans Growthity + l'IA dit quoi booster / couper → tous les réseaux + planning
// → WhatsApp : « Pause » → c'est fait → « Votre prochaine campagne est à une phrase. »
// Exemple : bijoux (marque fictive Maison Trèfle). Aucun chiffre de résultat.
import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, continueRender, delayRender, interpolate, random, spring, staticFile, useCurrentFrame} from 'remotion';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/inter/800.css';
import '@fontsource/inter/900.css';
import {LogoMark, Wordmark} from '../components/UI';
import {EXPO, INOUT, prog} from '../components/anim';
import {BRAND_PATHS} from '../components/brands';
import ACTORS from '../organic/actors_real.json';
import WORDS from './words.json';
import TLJ from './timeline.json';

type Word = {w: string; s: number; e: number};
const WD = WORDS as unknown as Record<string, Word[]>;
const TL = TLJ as unknown as {VO: Record<string, number>; S: Record<string, number>};
export const FS = TL.S;
const VO = TL.VO;
const PAGE = '#F4F4F7', SURF = '#FFFFFF', LINE = '#E7E7EE', FG = '#141418', MUTED = '#44444F', DIM = '#737381';
const ACC = '#5B3FE4', ACC_SOFT = '#F0ECFF', OK = '#137A45', OK_SOFT = '#E6F5EC', RED = '#DC2626', RED_SOFT = '#FDECEC';
const GRAD = 'linear-gradient(120deg, #2563EB 0%, #5B3FE4 52%, #9333EA 100%)';
const FONT = 'Inter, system-ui, sans-serif';
const SH = '0 1px 2px rgba(20,20,40,.04), 0 10px 30px rgba(20,20,40,.08)';
const SH_LG = '0 40px 90px -30px rgba(20,20,60,.45)';
const sp = (f: number, d = 14, m = 0.8) => spring({frame: f, fps: 30, config: {damping: d, mass: m, stiffness: 170}});
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const G: React.FC<{children: React.ReactNode}> = ({children}) => <span style={{backgroundImage: GRAD, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent'}}>{children}</span>;
const cue = (k: number, start: string, d = 0) => {
  const w = WD[`lf-${k}`].find((x) => x.w.toLowerCase().startsWith(start));
  return VO[k] + Math.round((w ? w.s : d) * 30);
};
const ORDER = ['intro', 'hook', 'brand', 'gallery', 'actors', 'meta', 'leads', 'social', 'wa', 'end'];
const nextOf = (k: string) => FS[ORDER[ORDER.indexOf(k) + 1]] ?? FS.total;
const M = (p: string) => staticFile(`media/${p}`);
const CLIP = (n: string) => M(`fal/social/out/${n}.mp4`);
const PACK = M('ig/trefle-packshot.jpg'), WRIST = M('ig/lou-poignet.jpg'), CERCLE = M('img-bracelet-cercle.jpg');
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
      <AbsoluteFill style={{background: `radial-gradient(1100px 800px at ${70 + Math.sin(f / 50) * 8}% ${40 + Math.cos(f / 60) * 8}%, rgba(91,63,228,0.15), transparent 70%)`}} />
      <AbsoluteFill style={{background: `radial-gradient(800px 700px at ${10 - Math.sin(f / 40) * 5}% 90%, rgba(37,99,235,0.10), transparent 70%)`}} />
      <AbsoluteFill style={{backgroundImage: 'radial-gradient(rgba(20,20,40,0.07) 1.4px, transparent 1.6px)', backgroundSize: '38px 38px', maskImage: 'radial-gradient(ellipse at 65% 50%, black 20%, transparent 70%)', WebkitMaskImage: 'radial-gradient(ellipse at 65% 50%, black 20%, transparent 70%)'}} />
    </AbsoluteFill>
  );
};

// en-tête de chapitre à gauche (numéro, titre 2 temps, sous-texte)
const Side: React.FC<{k: string; n: string; a: string; b: string; sub: string; bAt?: number}> = ({k, n, a, b, sub, bAt}) => {
  const g = useCurrentFrame();
  const s0 = FS[k], s1 = nextOf(k);
  if (g < s0 - 1 || g > s1 + 1) return null;
  const f = g - s0;
  const p1 = sp(f - 2, 12), p2 = sp(g - (bAt ?? s0 + 8), 12), p3 = sp(f - 14, 12), o = prog(g, s1 - 10, 10, INOUT);
  return (
    <div style={{position: 'absolute', left: 130, top: 330, width: 640, fontFamily: FONT, opacity: 1 - o, transform: `translateX(${-o * 60}px)`}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 14, fontWeight: 800, fontSize: 24, letterSpacing: '0.16em', color: ACC, opacity: p1}}>{n}<span style={{width: 70 * p1, height: 4, borderRadius: 2, background: GRAD}} /></div>
      <div style={{marginTop: 18, fontWeight: 900, fontSize: 82, lineHeight: 1.0, letterSpacing: '-0.05em', color: FG}}>
        <div style={{overflow: 'hidden', paddingBottom: 6}}><div style={{transform: `translateY(${(1 - p1) * 110}%)`}}>{a}</div></div>
        <div style={{overflow: 'hidden', paddingBottom: 10}}><div style={{transform: `translateY(${(1 - p2) * 110}%)`}}><G>{b}</G></div></div>
      </div>
      <div style={{marginTop: 22, fontWeight: 500, fontSize: 30, lineHeight: 1.4, color: MUTED, opacity: p3, transform: `translateY(${(1 - p3) * 16}px)`}}>{sub}</div>
    </div>
  );
};
// zone de démo à droite, avec entrée/sortie
const Stage: React.FC<{k: string; children: (f: number) => React.ReactNode}> = ({k, children}) => {
  const g = useCurrentFrame();
  const s0 = FS[k], s1 = nextOf(k);
  if (g < s0 - 2 || g > s1 + 2) return null;
  const f = g - s0;
  const inP = sp(f, 15), o = prog(g, s1 - 10, 12, INOUT);
  return <AbsoluteFill style={{opacity: Math.min(1, inP * 1.4) * (1 - o), transform: `translateX(${(1 - inP) * 140 + o * 80}px)`}}>{children(f)}</AbsoluteFill>;
};

// ---------- 0. intro (mode clair) : Growthity est en ligne / Créez. Lancez. Pilotez. ----------
const Intro: React.FC = () => {
  const g = useCurrentFrame();
  if (g > FS.hook + 14) return null;
  const f = g;
  const out = prog(g, FS.hook - 8, 14, INOUT);
  const logo = sp(f - 2, 12);
  const words: [string, string][] = [['Créez.', 'créer'], ['Lancez.', 'lancer'], ['Pilotez.', 'piloter']];
  const nots = ['agence', 'tournage', 'monteur'];
  const t1 = sp(f - 8, 12), t2 = sp(g - cue(2, 'en', 0.6), 12);
  return (
    <AbsoluteFill style={{opacity: 1 - out, transform: `scale(${1 + out * 0.06})`}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 150, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 22, transform: `scale(${logo})`}}>
        <div style={{width: 110, height: 110, borderRadius: 32, background: SURF, border: `1px solid ${LINE}`, boxShadow: SH, display: 'grid', placeItems: 'center'}}><LogoMark size={70} draw={prog(f, 2, 20)} /></div>
        <Wordmark size={76} />
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 300, textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 150, lineHeight: 1.0, letterSpacing: '-0.055em', color: FG}}>
        <div style={{overflow: 'hidden', paddingBottom: 10}}><div style={{transform: `translateY(${(1 - t1) * 110}%)`}}>Growthity <G>est en ligne.</G></div></div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 520, display: 'flex', justifyContent: 'center', gap: 44, opacity: t2 > 0 ? 1 : 0}}>
        {words.map(([t, w]) => { const p = sp(g - cue(2, w, 2.4), 10); return <span key={t} style={{fontFamily: FONT, fontWeight: 900, fontSize: 92, letterSpacing: '-0.045em', color: FG, transform: `scale(${0.6 + 0.4 * p}) translateY(${(1 - p) * 40}px)`, opacity: p}}>{t}</span>; })}
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 700, display: 'flex', justifyContent: 'center', gap: 22}}>
        {nots.map((t) => { const at = cue(2, t, 4); const p = sp(g - at, 11); const cross = interpolate(g, [at + 6, at + 14], [0, 1], clamp); return (
          <span key={t} style={{position: 'relative', padding: '16px 32px', borderRadius: 999, background: SURF, border: `1px solid ${LINE}`, boxShadow: SH, fontFamily: FONT, fontWeight: 800, fontSize: 38, color: MUTED, transform: `scale(${p})`, opacity: p}}>
            sans {t}<span style={{position: 'absolute', left: 20, right: 20, top: '50%', height: 5, borderRadius: 3, background: '#EF4444', transform: `scaleX(${cross})`, transformOrigin: 'left'}} />
          </span>); })}
      </div>
    </AbsoluteFill>
  );
};

// ---------- 0 bis. le mur de pubs (fond clair) : « Aucune de ces pubs n'a été tournée » ----------
const WALL = ['lr_isabella', 'game-priya', 'lr_theo', 'cp7-sana', 'sms-anais', 'lr_rania', 'rewind-yanis', 'cp5_noor', 'lr_sofiane', 'multi_amelie', 'sms-malik', 'p3d_patis', 'lr_darius', 'cp6-romane-v2', 'lr_aurelie'];
const Hook: React.FC = () => {
  const g = useCurrentFrame();
  if (g < FS.hook - 4 || g > FS.brand + 4) return null;
  const f = g - FS.hook;
  const inP = sp(f, 16);
  const out = prog(g, FS.brand - 12, 14, INOUT);
  const drift = g * 1.4;
  const t1 = sp(g - VO[1], 12);
  return (
    <AbsoluteFill style={{opacity: Math.min(1, inP * 1.4) * (1 - out)}}>
      <AbsoluteFill style={{perspective: 2000, alignItems: 'center', justifyContent: 'center'}}>
        <div style={{position: 'relative', width: 2600, height: 1500, transform: `rotateX(${22 + (1 - inP) * 10}deg) rotateZ(-8deg) translateY(-60px) scale(${0.95 + inP * 0.1})`, transformStyle: 'preserve-3d'}}>
          {WALL.map((n, i) => {
            const col = i % 5, row = Math.floor(i / 5);
            const x = col * 520 - ((drift + row * 160) % 520), y = row * 520;
            const p = sp(f - 2 - i * 1.2, 12);
            return <div key={n} style={{position: 'absolute', left: x, top: y, width: 290, height: 500, borderRadius: 30, overflow: 'hidden', border: '6px solid #fff', boxShadow: '0 40px 80px -30px rgba(20,20,60,.45)', transform: `scale(${p})`}}>
              <OffthreadVideo muted src={CLIP(n)} startFrom={20 + (i * 7) % 40} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
            </div>;
          })}
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, rgba(244,244,247,0.92) 0%, rgba(244,244,247,0.55) 35%, rgba(244,244,247,0) 70%)'}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 400, textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 118, lineHeight: 1.0, letterSpacing: '-0.055em', color: FG, opacity: t1, transform: `scale(${0.9 + 0.1 * t1})`}}>
        Aucune de ces pubs<br /><G>n’a été tournée.</G>
      </div>
    </AbsoluteFill>
  );
};

// ---------- 1. votre site → marque comprise ----------
const BrandScene: React.FC = () => (
  <Stage k="brand">{(f) => {
    const url = 'maison-trefle.fr';
    const g0 = FS.brand;
    const typed = url.slice(0, Math.max(0, Math.floor((f - 10) * 0.9)));
    const scan = interpolate(f, [34, 70], [0, 1], clamp);
    const at = cue(3, 'comprend', 3.0) - g0;
    const rows: [string, string][] = [['Logo', 'récupéré'], ['Couleurs', 'noir, or, crème'], ['Ton', 'élégant, chaleureux'], ['Produits', 'importés du site']];
    return (
      <div style={{position: 'absolute', left: 880, top: 170, width: 900}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 14, padding: '20px 24px', borderRadius: 24, background: SURF, border: `2px solid ${ACC}`, boxShadow: SH_LG, fontFamily: FONT}}>
          <span style={{fontSize: 30}}>🔗</span><span style={{flex: 1, fontWeight: 600, fontSize: 34, color: FG}}>{typed}<span style={{color: ACC, opacity: Math.floor(f / 8) % 2 ? 0 : 1}}>|</span></span>
          <span style={{padding: '12px 22px', borderRadius: 14, background: typed.length === url.length ? GRAD : '#D7D7E1', color: '#fff', fontWeight: 800, fontSize: 24}}>Analyser</span>
        </div>
        <div style={{position: 'relative', marginTop: 26, padding: '28px 30px', borderRadius: 30, background: SURF, boxShadow: SH_LG, fontFamily: FONT, overflow: 'hidden', opacity: sp(f - 30, 13)}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 24}}>
            <div style={{width: 150, height: 150, borderRadius: 26, background: '#111', color: '#D9B46A', display: 'grid', placeItems: 'center', fontFamily: 'Georgia, serif', fontSize: 26, textAlign: 'center', lineHeight: 1.1}}>MAISON<br />TRÈFLE</div>
            <div style={{flex: 1}}><div style={{fontWeight: 900, fontSize: 44, color: FG}}>Maison Trèfle</div><div style={{fontSize: 26, color: DIM, marginTop: 4}}>Bijoux · boutique en ligne</div>
              <div style={{display: 'flex', gap: 12, marginTop: 14}}>{['#111111', '#D9B46A', '#F4EDE1', '#7A5C2E'].map((c, i) => <div key={c} style={{width: 50, height: 50, borderRadius: 14, background: c, border: `1px solid ${LINE}`, transform: `scale(${sp(f - 60 - i * 3, 10)})`}} />)}</div>
            </div>
            <Img src={PACK} style={{width: 170, height: 150, objectFit: 'cover', borderRadius: 20, opacity: sp(f - 70, 12)}} />
          </div>
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 24}}>
            {rows.map(([k, v], i) => { const q = sp(f - at - i * 5, 12); return <div key={k} style={{display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderRadius: 16, background: '#F7F7FA', fontSize: 24, opacity: q, transform: `translateY(${(1 - q) * 20}px)`}}><Check s={26} /><b>{k}</b><span style={{color: DIM}}>{v}</span></div>; })}
          </div>
          {scan > 0 && scan < 1 && <div style={{position: 'absolute', left: 0, right: 0, top: `${scan * 100}%`, height: 6, background: 'rgba(91,63,228,.8)', boxShadow: '0 0 30px rgba(91,63,228,.9)'}} />}
        </div>
      </div>
    );
  }}</Stage>
);

// ---------- 2. galerie d'inspiration → recréée pour votre produit ----------
const GAL: [string, string, string][] = [['#FDE68A', '⭐', 'Avis client'], ['#C7D2FE', '📦', 'Unboxing'], ['#FBCFE8', '🎁', 'Idée cadeau'], ['#BBF7D0', '🔁', 'Avant / après'], ['#FED7AA', '👀', 'POV'], ['#BAE6FD', '3️⃣', '3 raisons']];
const Gallery: React.FC = () => (
  <Stage k="gallery">{(f) => {
    const pick = cue(4, 'choisissez', 1.0) - FS.gallery + 20;
    const make = cue(4, 'recrée', 3.0) - FS.gallery;
    const mk = sp(f - make, 13);
    return (
      <div style={{position: 'absolute', left: 880, top: 150, width: 920}}>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18, opacity: 1 - mk * 0.75, transform: `scale(${1 - mk * 0.08})`}}>
          {GAL.map(([c, ic, t], i) => { const q = sp(f - 2 - i * 3, 12); const on = i === 2 && f >= pick; return (
            <div key={t} style={{position: 'relative', height: 300, borderRadius: 26, background: c, boxShadow: on ? `0 0 0 6px ${ACC}, ${SH_LG}` : SH, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: 20, fontFamily: FONT, transform: `scale(${q * (on ? 1.05 : 1)})`}}>
              <span style={{alignSelf: 'flex-start', padding: '6px 12px', borderRadius: 999, background: 'rgba(255,255,255,.75)', fontWeight: 800, fontSize: 18, color: FG}}>🔥 Fonctionne</span>
              <span style={{fontSize: 70, textAlign: 'center'}}>{ic}</span>
              <span style={{fontWeight: 900, fontSize: 28, color: FG}}>{t}</span>
              {on && <span style={{position: 'absolute', right: 14, top: 14, width: 48, height: 48, borderRadius: 24, background: ACC, display: 'grid', placeItems: 'center'}}><Check s={28} c="#fff" /></span>}
            </div>); })}
        </div>
        {f >= make - 2 && (
          <div style={{position: 'absolute', left: 250, top: 70, width: 420, height: 560, borderRadius: 30, overflow: 'hidden', boxShadow: SH_LG, border: '6px solid #fff', transform: `scale(${mk}) rotate(${(1 - mk) * -8}deg)`, background: '#FBCFE8'}}>
            <Img src={WRIST} style={{width: '100%', height: '68%', objectFit: 'cover'}} />
            <div style={{padding: '18px 20px', fontFamily: FONT}}><div style={{fontWeight: 900, fontSize: 34, color: FG, lineHeight: 1.05}}>L’idée cadeau qu’elle va adorer 🎁</div><div style={{marginTop: 10, display: 'inline-block', padding: '8px 16px', borderRadius: 999, background: FG, color: '#fff', fontWeight: 800, fontSize: 20}}>Bracelet Trèfle</div></div>
            <div style={{position: 'absolute', left: 14, top: 14, padding: '6px 12px', borderRadius: 999, background: ACC, color: '#fff', fontFamily: FONT, fontWeight: 800, fontSize: 18}}>Recréée pour vous</div>
          </div>
        )}
      </div>
    );
  }}</Stage>
);

// ---------- 3. acteurs IA + 24 créas ----------
const NOT_IN_WALL = /^(Isabella|Priya|Théo|Sana|Anaïs|Rania|Yanis|Noor|Sofiane|Amélie|Malik|Darius|Romane|Aurélie)/;
const TAG = ['Nouveau', 'Idée cadeau', 'Porté tous les jours', 'Livraison 48 h', 'Édition limitée', 'Coup de cœur'];
const BGS = ['#F4EDE1', '#111111', '#FBCFE8', '#E0E7FF', '#FDE68A', '#D1FAE5'];
const Actors: React.FC = () => (
  <Stage k="actors">{(f) => {
    const faces = (ACTORS as {name: string; img: string}[]).filter((a) => !NOT_IN_WALL.test(a.name)).slice(0, 18);
    const burst = cue(5, '24', 3.4) - FS.actors;
    const b = sp(f - burst, 14);
    const scroll = f * 2.2;
    return (
      <div style={{position: 'absolute', left: 860, top: 120, width: 960, height: 840, overflow: 'hidden', borderRadius: 30}}>
        {/* acteurs qui défilent */}
        <div style={{position: 'absolute', inset: 0, opacity: 1 - b}}>
          {[0, 1, 2].map((r) => (
            <div key={r} style={{position: 'absolute', left: 0, top: 30 + r * 270, display: 'flex', gap: 16, transform: `translateX(${-((scroll * (r % 2 ? 1.3 : 1) + r * 90) % 1200)}px)`}}>
              {[...faces.slice(r * 6, r * 6 + 6), ...faces.slice(r * 6, r * 6 + 6)].map((a, i) => <Img key={i} src={M(a.img)} style={{width: 190, height: 240, borderRadius: 22, objectFit: 'cover', objectPosition: '50% 30%', boxShadow: SH}} />)}
            </div>
          ))}
          <div style={{position: 'absolute', left: 300, top: 690, padding: '14px 26px', borderRadius: 999, background: SURF, boxShadow: SH_LG, fontFamily: FONT, fontWeight: 800, fontSize: 28, color: ACC}}>🎬 Montage automatique</div>
        </div>
        {/* 24 créas */}
        {f >= burst - 2 && (
          <div style={{position: 'absolute', left: 20, top: 20, display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12, width: 920}}>
            {Array.from({length: 24}, (_, i) => {
              const q = sp(f - burst - (i % 6) * 1.5 - Math.floor(i / 6) * 2.5, 11);
              const img = [PACK, WRIST, CERCLE][i % 3];
              return <div key={i} style={{position: 'relative', height: 190, borderRadius: 16, overflow: 'hidden', background: BGS[i % 6], boxShadow: SH, transform: `scale(${q}) rotate(${(1 - q) * (i % 2 ? 10 : -10)}deg)`, opacity: q}}>
                <Img src={img} style={{position: 'absolute', inset: i % 4 === 0 ? 0 : 18, width: i % 4 === 0 ? '100%' : 'calc(100% - 36px)', height: i % 4 === 0 ? '100%' : '62%', objectFit: 'cover', borderRadius: i % 4 === 0 ? 0 : 10}} />
                <div style={{position: 'absolute', left: 8, right: 8, bottom: 8, padding: '4px 8px', borderRadius: 8, background: 'rgba(255,255,255,.92)', fontFamily: FONT, fontWeight: 800, fontSize: 14, color: FG, textAlign: 'center'}}>{TAG[i % 6]}</div>
                {i % 5 === 1 && <div style={{position: 'absolute', right: 8, top: 8, padding: '3px 7px', borderRadius: 6, background: FG, color: '#fff', fontFamily: FONT, fontWeight: 800, fontSize: 12}}>▶ VIDÉO</div>}
              </div>;
            })}
            <div style={{gridColumn: '1 / -1', marginTop: 10, textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 44, color: FG, opacity: sp(f - burst - 24, 12)}}>24 créas, <G>d’un coup.</G></div>
          </div>
        )}
      </div>
    );
  }}</Stage>
);

// ---------- 4. Meta Ads : ventes ou leads, dès 1 €/jour, 0 commission ----------
const Meta: React.FC = () => (
  <Stage k="meta">{(f) => {
    const g0 = FS.meta;
    const leadsAt = cue(6, 'leads', 2.6) - g0;
    const euroAt = cue(6, 'dès', 3.4) - g0;
    const zeroAt = cue(6, 'zéro', 4.6) - g0;
    const press = 18;
    const done = f >= press + 8;
    const obj = f >= leadsAt ? 1 : 0;
    const slider = interpolate(f, [euroAt, euroAt + 20], [0.55, 0.06], {...clamp, easing: EXPO});
    return (
      <div style={{position: 'absolute', left: 880, top: 170, width: 900, padding: '32px 34px', borderRadius: 34, background: SURF, boxShadow: SH_LG, fontFamily: FONT}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 18}}>
          <Brand k="meta" s={70} /><div style={{flex: 1}}><div style={{fontWeight: 900, fontSize: 42, color: FG}}>Campagne Meta Ads</div><div style={{fontSize: 24, color: DIM}}>Facebook · Instagram · 24 créas</div></div>
          <span style={{padding: '14px 26px', borderRadius: 16, background: done ? OK : '#0866FF', color: '#fff', fontWeight: 800, fontSize: 26, transform: `scale(${f >= press && f < press + 6 ? 0.92 : 1})`}}>{done ? '✓ En ligne' : 'Publier'}</span>
        </div>
        <div style={{marginTop: 30, fontWeight: 800, fontSize: 24, color: DIM, letterSpacing: '0.08em'}}>OBJECTIF</div>
        <div style={{display: 'flex', gap: 14, marginTop: 12}}>
          {['Ventes', 'Leads'].map((o, i) => <div key={o} style={{flex: 1, padding: '22px 0', textAlign: 'center', borderRadius: 18, border: `3px solid ${obj === i ? ACC : LINE}`, background: obj === i ? ACC_SOFT : SURF, fontWeight: 900, fontSize: 32, color: obj === i ? ACC : DIM}}>{i ? '📥' : '🛒'} {o}</div>)}
        </div>
        <div style={{marginTop: 30, fontWeight: 800, fontSize: 24, color: DIM, letterSpacing: '0.08em'}}>BUDGET PAR JOUR</div>
        <div style={{position: 'relative', marginTop: 22, height: 14, borderRadius: 7, background: '#ECEBF3'}}>
          <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: `${slider * 100}%`, borderRadius: 7, background: GRAD}} />
          <div style={{position: 'absolute', left: `calc(${slider * 100}% - 20px)`, top: -13, width: 40, height: 40, borderRadius: 20, background: '#fff', border: `4px solid ${ACC}`, boxShadow: SH}} />
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: 16, marginTop: 30}}>
          <span style={{padding: '14px 24px', borderRadius: 999, background: ACC_SOFT, color: ACC, fontWeight: 900, fontSize: 32, transform: `scale(${sp(f - euroAt, 10)})`}}>Dès 1 € / jour</span>
          <span style={{padding: '14px 24px', borderRadius: 999, background: OK_SOFT, color: OK, fontWeight: 900, fontSize: 32, transform: `scale(${sp(f - zeroAt, 10)})`}}>0 % de commission</span>
        </div>
      </div>
    );
  }}</Stage>
);

// ---------- 5. leads + l'IA dit quoi booster / couper ----------
const LEADS: [string, string, string][] = [['Camille R.', 'Lyon', 'Bracelet Trèfle · question taille'], ['Inès M.', 'Lille', 'Demande pour une commande cadeau'], ['Hugo P.', 'Nantes', 'Commande en gros pour sa boutique']];
const Leads: React.FC = () => (
  <Stage k="leads">{(f) => {
    const g0 = FS.leads;
    const formAt = 6, fill = (i: number) => formAt + 8 + i * 8;
    const tableAt = cue(7, 'arrivent', 2.2) - g0;
    const aiAt = cue(7, "l'ia", 3.4) - g0;
    const fields: [string, string][] = [['Prénom', 'Camille'], ['Ville', 'Lyon'], ['Message', 'Quelle taille choisir ?']];
    const swap = prog(f, tableAt - 4, 12, INOUT);
    return (
      <div style={{position: 'absolute', left: 880, top: 140, width: 920}}>
        <div style={{position: 'absolute', left: 0, top: 30, width: 420, padding: '24px 24px', borderRadius: 28, background: SURF, boxShadow: SH_LG, fontFamily: FONT, transform: `translateX(${-swap * 30}px) scale(${1 - swap * 0.1})`, opacity: 1 - swap * 0.5}}>
          <div style={{fontWeight: 900, fontSize: 28, color: FG}}>Formulaire Meta</div>
          {fields.map(([k, v], i) => { const n = Math.max(0, Math.min(v.length, Math.floor((f - fill(i)) * 1.8))); return <div key={k} style={{marginTop: 14}}><div style={{fontSize: 18, fontWeight: 700, color: DIM}}>{k}</div><div style={{marginTop: 4, padding: '12px 14px', borderRadius: 12, border: `2px solid ${f >= fill(i) && n < v.length ? ACC : LINE}`, fontSize: 24, fontWeight: 600, minHeight: 52}}>{v.slice(0, n)}</div></div>; })}
          <div style={{marginTop: 16, padding: '14px 0', borderRadius: 14, textAlign: 'center', background: f >= fill(3) ? OK : '#0866FF', color: '#fff', fontWeight: 800, fontSize: 24}}>{f >= fill(3) ? '✓ Envoyé' : 'Envoyer'}</div>
        </div>
        {f >= tableAt - 4 && (
          <div style={{position: 'absolute', left: 340, top: 0, width: 580, padding: '22px 24px', borderRadius: 28, background: SURF, boxShadow: SH_LG, fontFamily: FONT, opacity: swap, transform: `translateX(${(1 - swap) * 80}px)`}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 12}}><LogoMark size={34} /><span style={{flex: 1, fontWeight: 900, fontSize: 30}}>Leads</span><span style={{padding: '6px 14px', borderRadius: 999, background: OK_SOFT, color: OK, fontWeight: 800, fontSize: 18}}>● En direct</span></div>
            {LEADS.map(([n, v, d], i) => { const at = tableAt + 2 + i * 8; const q = sp(f - at, 11); return f >= at ? <div key={n} style={{display: 'flex', alignItems: 'center', gap: 14, marginTop: 12, padding: '14px 16px', borderRadius: 18, background: i === 0 ? ACC_SOFT : '#F7F7FA', transform: `translateY(${(1 - q) * -24}px)`, opacity: q}}>
              <span style={{width: 50, height: 50, borderRadius: 25, background: ['#F59E0B', '#10B981', '#3B82F6'][i], color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 22}}>{n[0]}</span>
              <div style={{flex: 1}}><div style={{fontWeight: 800, fontSize: 24}}>{n} · {v}</div><div style={{fontSize: 19, color: DIM}}>{d}</div></div>
            </div> : null; })}
          </div>
        )}
        {f >= aiAt - 2 && (
          <div style={{position: 'absolute', left: 340, top: 470, width: 580, display: 'grid', gap: 12}}>
            {[['🚀', 'À booster', 'Créa « Idée cadeau »', OK, OK_SOFT], ['✂️', 'À couper', 'Créa « 3 raisons »', RED, RED_SOFT]].map(([ic, t, d, c, bg], i) => { const q = sp(f - aiAt - i * 8, 11); return (
              <div key={t as string} style={{display: 'flex', alignItems: 'center', gap: 14, padding: '18px 20px', borderRadius: 20, background: bg as string, fontFamily: FONT, transform: `scale(${0.8 + 0.2 * q})`, opacity: q, transformOrigin: 'left center'}}>
                <span style={{fontSize: 34}}>{ic}</span><b style={{fontSize: 26, color: c as string}}>{t}</b><span style={{fontSize: 24, color: MUTED}}>{d}</span><span style={{marginLeft: 'auto', fontSize: 18, fontWeight: 800, color: ACC}}>Conseil de l’IA</span>
              </div>); })}
          </div>
        )}
      </div>
    );
  }}</Stage>
);

// ---------- 6. tous les réseaux + formats + planning ----------
const Social: React.FC = () => (
  <Stage k="social">{(f) => {
    const g0 = FS.social;
    const nets = ['instagram', 'tiktok', 'facebook', 'youtube', 'linkedin'];
    const fmtAt = cue(8, 'format', 2.2) - g0, planAt = cue(8, 'planning', 5.8) - g0 - 30;
    const plan = prog(f, planAt, 16, INOUT);
    return (
      <div style={{position: 'absolute', left: 880, top: 140, width: 920}}>
        <div style={{display: 'flex', gap: 16, opacity: 1 - plan * 0.3}}>
          {nets.map((k, i) => { const q = sp(f - 4 - i * 4, 11); const on = f >= 18 + i * 4; return <div key={k} style={{flex: 1, padding: '18px 0 14px', borderRadius: 22, background: SURF, boxShadow: SH, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, transform: `scale(${q})`}}><Brand k={k} s={54} /><span style={{padding: '4px 12px', borderRadius: 999, background: on ? OK_SOFT : '#F1F1F5', color: on ? OK : DIM, fontFamily: FONT, fontWeight: 800, fontSize: 16}}>{on ? 'Connecté' : '…'}</span></div>; })}
        </div>
        {f >= fmtAt - 2 && plan < 1 && (
          <div style={{display: 'flex', alignItems: 'flex-end', gap: 22, marginTop: 30, opacity: 1 - plan}}>
            {[[9 / 16, 'Reel · TikTok · Short'], [4 / 5, 'Fil Instagram'], [1, 'Facebook · LinkedIn']].map(([ar, t], i) => { const q = sp(f - fmtAt - i * 5, 12); const h = 440; const w = h * (ar as number); return (
              <div key={t as string} style={{opacity: q, transform: `translateY(${(1 - q) * 40}px)`}}>
                <div style={{position: 'relative', width: w, height: h, borderRadius: 20, overflow: 'hidden', boxShadow: SH_LG, background: '#FBCFE8'}}><Img src={WRIST} style={{width: '100%', height: '100%', objectFit: 'cover'}} /><div style={{position: 'absolute', left: 10, right: 10, bottom: 10, padding: '6px 10px', borderRadius: 10, background: 'rgba(255,255,255,.92)', fontFamily: FONT, fontWeight: 800, fontSize: 18, color: FG}}>L’idée cadeau 🎁</div></div>
                <div style={{marginTop: 10, fontFamily: FONT, fontWeight: 700, fontSize: 20, color: DIM}}>{t}</div>
              </div>); })}
            <div style={{flex: 1, alignSelf: 'stretch', padding: 18, borderRadius: 20, background: SURF, boxShadow: SH, fontFamily: FONT, fontSize: 19, color: MUTED, lineHeight: 1.4, opacity: sp(f - fmtAt - 16, 12)}}><b style={{color: FG}}>Légende</b><br />L’idée cadeau qu’elle va adorer 🎁 Bracelet Trèfle, livré en 48 h. #bijoux #cadeau</div>
          </div>
        )}
        {plan > 0 && (
          <div style={{marginTop: 30, padding: '22px 22px', borderRadius: 26, background: SURF, boxShadow: SH_LG, fontFamily: FONT, opacity: plan, transform: `translateY(${(1 - plan) * 40}px)`}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 12, fontWeight: 900, fontSize: 28}}>📅 Planning<span style={{marginLeft: 'auto', padding: '6px 14px', borderRadius: 999, background: ACC_SOFT, color: ACC, fontWeight: 800, fontSize: 18}}>✨ Rempli par l’IA</span></div>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 10, marginTop: 16}}>
              {Array.from({length: 21}, (_, i) => { const has = random(`p${i}`) > 0.35; const q = sp(f - planAt - 6 - i, 11); return <div key={i} style={{height: 78, borderRadius: 12, background: '#F7F7FA', padding: 8, display: 'flex', flexDirection: 'column', justifyContent: 'space-between'}}><span style={{fontSize: 14, color: DIM, fontWeight: 700}}>{i + 1}</span>{has && <span style={{alignSelf: 'flex-start', transform: `scale(${q})`}}><Brand k={nets[i % 5]} s={26} /></span>}</div>; })}
            </div>
          </div>
        )}
      </div>
    );
  }}</Stage>
);

// ---------- 7. WhatsApp : « pause » → c'est fait ----------
const Wa: React.FC = () => (
  <Stage k="wa">{(f) => {
    const g0 = FS.wa;
    const m1 = cue(9, 'whatsapp', 1.6) - g0, m2 = cue(9, 'une', 2.2) - g0, me = cue(9, 'pause', 3.8) - g0, ok = cue(9, "c'est", 4.4) - g0;
    const Bub: React.FC<{at: number; mine?: boolean; children: React.ReactNode}> = ({at, mine, children}) => { const q = sp(f - at, 11); return f >= at - 1 ? <div style={{alignSelf: mine ? 'flex-end' : 'flex-start', maxWidth: 520, padding: '16px 20px 10px', borderRadius: mine ? '22px 6px 22px 22px' : '6px 22px 22px 22px', background: mine ? '#D9FDD3' : '#fff', boxShadow: '0 2px 2px rgba(0,0,0,.08)', fontFamily: FONT, fontSize: 25, lineHeight: 1.35, color: FG, transform: `scale(${0.85 + 0.15 * q})`, transformOrigin: mine ? 'right top' : 'left top', opacity: q}}>{children}</div> : null; };
    return (
      <div style={{position: 'absolute', left: 1040, top: 70, width: 600, height: 940, borderRadius: 60, padding: 14, background: '#111', boxShadow: SH_LG}}>
        <div style={{width: '100%', height: '100%', borderRadius: 48, overflow: 'hidden', background: '#ECE5DD', display: 'flex', flexDirection: 'column'}}>
          <div style={{background: '#075E54', color: '#fff', display: 'flex', alignItems: 'center', gap: 14, padding: '44px 22px 18px', fontFamily: FONT}}>
            <div style={{width: 54, height: 54, borderRadius: 27, background: '#fff', display: 'grid', placeItems: 'center'}}><LogoMark size={32} /></div>
            <div style={{flex: 1}}><div style={{fontSize: 26, fontWeight: 700}}>Growthity</div><div style={{fontSize: 18, opacity: 0.8}}>en ligne</div></div><Brand k="whatsapp" s={40} c="#fff" />
          </div>
          <div style={{flex: 1, padding: '20px 18px', display: 'flex', flexDirection: 'column', gap: 14}}>
            <Bub at={m1}>☀️ Bonjour ! Nouveaux leads cette nuit : <b>Camille, Inès et Hugo</b>. Ils sont dans Growthity.</Bub>
            <Bub at={m2}>⚠️ La créa <b>« 3 raisons »</b> dépense sans ramener de leads. Je la mets en pause ?</Bub>
            <Bub at={me} mine>Pause</Bub>
            <Bub at={ok}>✅ C’est fait : la créa <b>« 3 raisons »</b> est en pause.</Bub>
          </div>
        </div>
      </div>
    );
  }}</Stage>
);

// ---------- 8. fin (mode clair) ----------
const End: React.FC = () => {
  const f = useCurrentFrame(); // local
  const a = sp(f - 6, 12), b = sp(f - (cue(10, 'à', 1.6) - FS.end), 12), url = sp(f - (cue(10, 'growthity', 2.6) - FS.end), 11);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{background: `radial-gradient(1000px 600px at 50% 60%, rgba(91,63,228,0.18), transparent 70%)`}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 190, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 20, transform: `scale(${sp(f, 12)})`}}>
        <div style={{width: 100, height: 100, borderRadius: 30, background: SURF, border: `1px solid ${LINE}`, boxShadow: SH, display: 'grid', placeItems: 'center'}}><LogoMark size={64} draw={prog(f, 2, 20)} /></div>
        <Wordmark size={66} />
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 370, textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 120, lineHeight: 1.0, letterSpacing: '-0.055em', color: FG}}>
        <div style={{opacity: a, transform: `translateY(${(1 - a) * 50}px)`}}>Votre prochaine campagne</div>
        <div style={{opacity: b, transform: `translateY(${(1 - b) * 50}px)`}}><G>est à une phrase.</G></div>
      </div>
      <div style={{position: 'absolute', left: 960 - 280, top: 710, width: 560, height: 130, borderRadius: 65, background: GRAD, display: 'grid', placeItems: 'center', color: '#fff', fontFamily: FONT, fontWeight: 900, fontSize: 50, boxShadow: '0 30px 60px -20px rgba(91,63,228,.6)', transform: `scale(${url})`, opacity: Math.min(1, url * 1.5)}}>growthity.ai →</div>
    </AbsoluteFill>
  );
};


// sous-titres discrets (la landing lit sans le son)
const Caps: React.FC = () => {
  const g = useCurrentFrame();
  if (g < FS.brand || g >= FS.end) return null;
  let k = 0;
  for (let i = 1; i <= 10; i++) if (g >= VO[i] - 2) k = i;
  if (!k) return null;
  const words = WD[`lf-${k}`]; const t = (g - VO[k]) / 30;
  const i = words.findIndex((w) => t < w.e + 0.12);
  if (i < 0 || t < words[0].s - 0.1) return null;
  const grp = words.slice(Math.floor(i / 4) * 4, Math.floor(i / 4) * 4 + 4);
  return (
    <div style={{position: 'absolute', left: 130, width: 640, top: 880, display: 'flex', flexWrap: 'wrap', gap: 10}}>
      {grp.map((w, j) => { const on = t >= w.s - 0.02, hot = on && t <= w.e + 0.08; return <span key={j} style={{fontFamily: FONT, fontWeight: 800, fontSize: 34, padding: '4px 12px', borderRadius: 10, color: hot ? '#fff' : FG, background: hot ? ACC : 'rgba(255,255,255,.9)', opacity: on ? 1 : 0.45}}>{w.w.replace(/[.,:?]$/, '')}</span>; })}
    </div>
  );
};

export const Film: React.FC = () => {
  useFonts();
  const g = useCurrentFrame();
  const flash = (at: number) => interpolate(g, [at - 1, at, at + 5], [0, 0.5, 0], clamp);
  return (
    <AbsoluteFill style={{background: PAGE, fontFamily: FONT}}>
      <LightBg />
      <Side k="brand" n="01 — CRÉER" a="Votre site." b="Votre marque, comprise." sub="Une phrase ou le lien de votre site : logo, couleurs, ton et produits sont repris." bAt={cue(3, 'comprend', 3.0)} />
      <BrandScene />
      <Side k="gallery" n="01 — CRÉER" a="Des pubs qui marchent," b="refaites pour vous." sub="Choisissez dans la galerie de pubs et de posts : Growthity la recrée pour votre produit." bAt={cue(4, 'recrée', 3.0)} />
      <Gallery />
      <Side k="actors" n="01 — CRÉER" a="Des acteurs IA." b="24 créas d’un coup." sub="Des centaines de visages réalistes, des vidéos montées automatiquement, des visuels et des carrousels." bAt={cue(5, '24', 3.4)} />
      <Actors />
      <Side k="meta" n="02 — LANCER" a="Sur Meta Ads," b="en un clic." sub="Objectif ventes ou leads. Dès 1 € par jour, sans commission." />
      <Meta />
      <Side k="leads" n="03 — PILOTER" a="Vos leads arrivent." b="L’IA vous guide." sub="Les prospects remplissent le formulaire et arrivent dans Growthity. L’IA vous dit quoi booster et quoi couper." bAt={cue(7, "l'ia", 3.4)} />
      <Leads />
      <Side k="social" n="04 — PUBLIER" a="Tous vos réseaux," b="au bon format." sub="Instagram, TikTok, Facebook, YouTube, LinkedIn : chaque post avec sa légende. Programmez, ou laissez l’IA remplir le planning." />
      <Social />
      <Side k="wa" n="05 — WHATSAPP" a="Votre IA vous écrit." b="Vous répondez." sub="Une alerte, une décision : « pause », et c’est fait." />
      <Wa />
      <Caps />
      <Intro />
      <Hook />
      <Sequence from={FS.end}><End /></Sequence>
      <AbsoluteFill style={{background: '#fff', opacity: Math.max(flash(FS.hook), flash(FS.brand)), pointerEvents: 'none'}} />
      <Audio src={staticFile('film/bed.wav')} />
      {Array.from({length: 10}, (_, i) => i + 1).map((k) => <Sequence key={k} from={VO[k]}><Audio src={staticFile(`voice/lf-${k}-n.mp3`)} /></Sequence>)}
    </AbsoluteFill>
  );
};
