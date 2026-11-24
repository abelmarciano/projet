// « Growthity est en ligne » — film de lancement 16:9 (1920×1080, ~58 s), version « carrousel animé ».
// Reprend la structure et le style clair du carrousel de lancement (post-08 : couverture, étapes 1 → 7, réseaux,
// alertes WhatsApp, fin) en motion design, avec un autre exemple : bijoux (marque fictive Maison Trèfle), pub de Noël.
// Aucun chiffre de résultat. Voix off Hugo (lm-1 … lm-11).
import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, continueRender, delayRender, interpolate, spring, staticFile, useCurrentFrame} from 'remotion';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/inter/800.css';
import '@fontsource/inter/900.css';
import {LogoMark, Wordmark} from '../components/UI';
import {INOUT, prog} from '../components/anim';
import {BRAND_PATHS} from '../components/brands';
import ACTORS from '../organic/actors_real.json';
import WORDS from './words_mix.json';
import TLJ from './timeline_mix.json';

type Word = {w: string; s: number; e: number};
const WD = WORDS as unknown as Record<string, Word[]>;
const TL = TLJ as unknown as {VO: Record<string, number>; S: Record<string, number>};
export const FM = TL.S;
const VO = TL.VO;
const PAPER = '#F4F1EA', SURF = '#FFFFFF', LINE = '#E2DDD2', INK = '#16141A', MUTED = '#6E6A73';
const ACC = '#5B3FE4', OK = '#15803D', OK_SOFT = '#E8F7EE';
const GRAD = 'linear-gradient(120deg, #2563EB 0%, #5B3FE4 52%, #9333EA 100%)';
const FONT = 'Inter, system-ui, sans-serif';
const CARD_SH = '0 50px 100px -50px rgba(40,30,20,0.45), 0 2px 6px rgba(40,30,20,0.05)';
const sp = (f: number, d = 14, m = 0.8) => spring({frame: f, fps: 30, config: {damping: d, mass: m, stiffness: 170}});
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const G: React.FC<{children: React.ReactNode}> = ({children}) => <span style={{backgroundImage: GRAD, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent'}}>{children}</span>;
const cue = (k: number, start: string, d = 0) => {
  const w = WD[`lm-${k}`].find((x) => x.w.toLowerCase().startsWith(start));
  return VO[k] + Math.round((w ? w.s : d) * 30);
};
const ORDER = ['intro', 's1', 's2', 's3', 's4', 's5', 's6', 's7', 's8', 's9', 'end'];
const nextOf = (k: string) => FM[ORDER[ORDER.indexOf(k) + 1]] ?? FM.total;
const M = (p: string) => staticFile(`media/${p}`);
const CLIP = (n: string) => M(`fal/social/out/${n}.mp4`);
const NOOR = ACTORS.find((a) => a.name === 'Noor')!;
const Brand: React.FC<{k: string; s: number; c?: string}> = ({k, s, c}) => {
  const col = c ?? ({instagram: '#FF0069', facebook: '#0866FF', tiktok: '#000000', youtube: '#FF0000', whatsapp: '#25D366', linkedin: '#0A66C2', meta: '#0866FF'} as Record<string, string>)[k];
  return <svg width={s} height={s} viewBox="0 0 24 24"><path d={BRAND_PATHS[k]} fill={col} /></svg>;
};
const Check: React.FC<{s?: number; c?: string}> = ({s = 30, c = '#16A34A'}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>;
const useFonts = () => {
  const [h] = useState(() => delayRender('fonts'));
  useEffect(() => { Promise.all(['500 20px Inter', '600 20px Inter', '700 20px Inter', '800 20px Inter', '900 20px Inter'].map((s) => document.fonts.load(s))).then(() => continueRender(h)); }, [h]);
};
// curseur animé : arrive sur (x, y) à `at`, clique à `click`
const Cursor: React.FC<{f: number; from: [number, number]; to: [number, number]; at: number; click: number}> = ({f, from, to, at, click}) => {
  const p = interpolate(f, [at - 22, at], [0, 1], {...clamp, easing: INOUT});
  if (f < at - 26) return null;
  const x = from[0] + (to[0] - from[0]) * p, y = from[1] + (to[1] - from[1]) * p;
  const c = interpolate(f, [click, click + 3, click + 8], [1, 0.82, 1], clamp);
  const ring = interpolate(f, [click, click + 14], [0, 1], clamp);
  return (
    <div style={{position: 'absolute', left: x, top: y, pointerEvents: 'none', zIndex: 50}}>
      {f >= click && ring < 1 && <div style={{position: 'absolute', left: -30 * (0.4 + ring), top: -30 * (0.4 + ring), width: 60 * (0.4 + ring), height: 60 * (0.4 + ring), borderRadius: 99, border: `4px solid ${ACC}`, opacity: 1 - ring}} />}
      <svg width="46" height="46" viewBox="0 0 24 24" style={{transform: `scale(${c})`, transformOrigin: '0 0', filter: 'drop-shadow(0 6px 10px rgba(0,0,0,.3))'}}><path d="M4 2l15 11-6.5 1.2L16 21l-3 1.4-3.4-6.8L4 20z" fill="#111" stroke="#fff" strokeWidth="1.4" strokeLinejoin="round" /></svg>
    </div>
  );
};

const Bg: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: PAPER}}>
      <AbsoluteFill style={{background: `radial-gradient(1000px 760px at ${74 + Math.sin(f / 55) * 6}% ${46 + Math.cos(f / 65) * 8}%, rgba(91,63,228,0.13), transparent 70%)`}} />
      <AbsoluteFill style={{background: `radial-gradient(760px 640px at ${8 - Math.sin(f / 45) * 4}% 96%, rgba(37,99,235,0.08), transparent 70%)`}} />
    </AbsoluteFill>
  );
};

// barre d'étapes en haut (comme le fil du carrousel)
const STEPS = [['s1', 'Décrivez'], ['s2', 'Marque'], ['s3', 'Produit'], ['s4', 'Style'], ['s5', 'Vidéo'], ['s6', 'Meta Ads'], ['s7', 'Performances']];
const Rail: React.FC = () => {
  const g = useCurrentFrame();
  if (g < FM.s1 - 10 || g > FM.end) return null;
  const inP = sp(g - FM.s1 + 10, 16), out = prog(g, FM.end - 12, 12, INOUT);
  const cur = STEPS.findIndex(([k]) => g >= FM[k] && g < nextOf(k));
  const extra = g >= FM.s8;
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 54, display: 'flex', justifyContent: 'center', gap: 10, opacity: inP * (1 - out), transform: `translateY(${(1 - inP) * -40}px)`}}>
      {STEPS.map(([k, t], i) => {
        const done = extra || g >= nextOf(k), on = i === cur;
        const a = sp(g - FM[k], 12);
        return (
          <div key={k} style={{display: 'flex', alignItems: 'center', gap: 10, padding: '10px 20px 10px 12px', borderRadius: 999, background: on ? INK : SURF, border: `1px solid ${on ? INK : LINE}`, color: on ? '#fff' : done ? INK : MUTED, fontFamily: FONT, fontWeight: 700, fontSize: 21, transform: `scale(${on ? 1 + 0.06 * a : 1})`, boxShadow: on ? '0 14px 30px -14px rgba(0,0,0,.5)' : 'none'}}>
            <span style={{width: 30, height: 30, borderRadius: 99, display: 'grid', placeItems: 'center', background: done ? '#16A34A' : on ? ACC : '#EFEBE3', color: done || on ? '#fff' : MUTED, fontSize: 16, fontWeight: 800}}>{done ? <Check s={18} c="#fff" /> : i + 1}</span>
            {t}
          </div>
        );
      })}
    </div>
  );
};

// en-tête d'étape à gauche (kicker + titre du carrousel)
const Head: React.FC<{k: string; kick: string; a: string; b: string; bAt?: number}> = ({k, kick, a, b, bAt}) => {
  const g = useCurrentFrame();
  const s0 = FM[k], s1 = nextOf(k);
  if (g < s0 - 1 || g > s1 + 1) return null;
  const f = g - s0;
  const p1 = sp(f - 2, 12), p2 = sp(g - (bAt ?? s0 + 10), 12), o = prog(g, s1 - 10, 10, INOUT);
  return (
    <div style={{position: 'absolute', left: 120, top: 300, width: 730, fontFamily: FONT, opacity: 1 - o, transform: `translateX(${-o * 60}px)`}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 14, fontWeight: 800, fontSize: 24, letterSpacing: '0.14em', color: ACC, opacity: p1, textTransform: 'uppercase'}}>{kick}</div>
      <div style={{marginTop: 22, fontWeight: 800, fontSize: 70, lineHeight: 1.04, letterSpacing: '-0.045em', color: INK}}>
        <div style={{overflow: 'hidden', paddingBottom: 6}}><div style={{transform: `translateY(${(1 - p1) * 110}%)`}}>{a}</div></div>
        <div style={{overflow: 'hidden', paddingBottom: 10}}><div style={{transform: `translateY(${(1 - p2) * 110}%)`}}><G>{b}</G></div></div>
      </div>
    </div>
  );
};
// panneau de droite
const Stage: React.FC<{k: string; children: (f: number) => React.ReactNode}> = ({k, children}) => {
  const g = useCurrentFrame();
  const s0 = FM[k], s1 = nextOf(k);
  if (g < s0 - 2 || g > s1 + 2) return null;
  const f = g - s0;
  const inP = sp(f, 15), o = prog(g, s1 - 10, 12, INOUT);
  return <AbsoluteFill style={{opacity: Math.min(1, inP * 1.4) * (1 - o), transform: `translateX(${(1 - inP) * 160 + o * 90}px) scale(${1 + f * 0.0002})`}}>{children(f)}</AbsoluteFill>;
};
const Card: React.FC<{style?: React.CSSProperties; children: React.ReactNode}> = ({style, children}) => (
  <div style={{position: 'absolute', background: SURF, borderRadius: 34, padding: '34px 38px', boxShadow: CARD_SH, border: `1px solid ${LINE}`, fontFamily: FONT, color: INK, ...style}}>{children}</div>
);
const RX = 880, RW = 920; // zone droite

// ---------- couverture ----------
const Intro: React.FC = () => {
  const g = useCurrentFrame();
  if (g > FM.s1 + 2) return null;
  const out = prog(g, FM.s1 - 12, 14, INOUT);
  const t1 = sp(g - 6, 12), t2 = sp(g - cue(1, 'en', 0.6), 12), body = sp(g - cue(1, 'vos', 1.6), 12);
  const nets = ['meta', 'instagram', 'facebook', 'tiktok', 'youtube', 'linkedin', 'whatsapp'];
  const phones: [string, number, number, number][] = [['lr_isabella', 1080, 150, -6], ['cp7-sana', 1370, 230, 3], ['lr_theo', 1640, 120, 8]];
  return (
    <AbsoluteFill style={{opacity: 1 - out, transform: `translateX(${-out * 80}px)`}}>
      <div style={{position: 'absolute', left: 120, top: 210, width: 900, fontFamily: FONT}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 16, opacity: sp(g, 12)}}>
          <div style={{width: 64, height: 64, borderRadius: 18, background: SURF, border: `1px solid ${LINE}`, display: 'grid', placeItems: 'center'}}><LogoMark size={40} draw={prog(g, 0, 20)} /></div>
          <span style={{fontWeight: 800, fontSize: 24, letterSpacing: '0.16em', color: ACC}}>LANCEMENT</span>
        </div>
        <div style={{marginTop: 30, fontWeight: 900, fontSize: 156, lineHeight: 0.98, letterSpacing: '-0.055em', color: INK}}>
          <div style={{overflow: 'hidden', paddingBottom: 8}}><div style={{transform: `translateY(${(1 - t1) * 110}%)`}}>Growthity</div></div>
          <div style={{overflow: 'hidden', paddingBottom: 14}}><div style={{transform: `translateY(${(1 - t2) * 110}%)`}}><G>est en ligne.</G></div></div>
        </div>
        <div style={{marginTop: 34, fontWeight: 500, fontSize: 42, lineHeight: 1.3, color: MUTED, opacity: body, transform: `translateY(${(1 - body) * 20}px)`}}>Vos pubs et vos posts générés et publiés <b style={{color: INK}}>en 2&nbsp;minutes.</b></div>
        <div style={{display: 'flex', gap: 16, marginTop: 50}}>
          {nets.map((k, i) => { const p = sp(g - cue(1, 'générés', 2.4) - i * 3, 11); return <div key={k} style={{width: 86, height: 86, borderRadius: 24, background: SURF, border: `1px solid ${LINE}`, display: 'grid', placeItems: 'center', transform: `scale(${p}) translateY(${(1 - p) * 30}px)`, boxShadow: '0 16px 30px -22px rgba(0,0,0,.4)'}}><Brand k={k} s={48} /></div>; })}
        </div>
      </div>
      {phones.map(([n, x, y, r], i) => {
        const p = sp(g - 4 - i * 5, 15);
        const fl = Math.sin((g + i * 30) / 28) * 10;
        return (
          <div key={n} style={{position: 'absolute', left: x, top: y + fl + (1 - p) * 500, width: 270, height: 480, borderRadius: 40, padding: 9, background: '#16141A', transform: `rotate(${r}deg)`, boxShadow: '0 50px 90px -40px rgba(0,0,0,.6)', opacity: p}}>
            <div style={{width: '100%', height: '100%', borderRadius: 32, overflow: 'hidden'}}><OffthreadVideo muted src={CLIP(n)} startFrom={20 + i * 12} style={{width: '100%', height: '100%', objectFit: 'cover'}} /></div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// ---------- 1. décrivez ----------
const PROMPT = 'Je veux une pub pour Noël pour mes bijoux.';
const S1: React.FC = () => (
  <Stage k="s1">{(f) => {
    const g = f + FM.s1;
    const t0 = cue(2, 'une', 0.9) - FM.s1 + 4, n = Math.max(0, Math.min(PROMPT.length, Math.floor((f - t0) * 1.7)));
    const click = t0 + PROMPT.length / 1.7 + 8;
    const pressed = f >= click;
    const load = interpolate(f, [click, click + 30], [0, 1], clamp);
    return (<>
      <Card style={{left: RX, top: 330, width: RW}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 12, fontSize: 24, color: MUTED, fontWeight: 600}}><LogoMark size={28} /> Décrivez votre pub</div>
        <div style={{marginTop: 22, minHeight: 150, fontSize: 52, fontWeight: 600, lineHeight: 1.25, letterSpacing: '-0.02em'}}>{PROMPT.slice(0, n)}<span style={{display: 'inline-block', width: 4, height: 54, background: ACC, marginLeft: 4, verticalAlign: -8, opacity: Math.floor(g / 15) % 2 ? 1 : 0.2}} /></div>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 26}}>
          <div style={{display: 'flex', gap: 10}}>{['Maison Trèfle', 'Noël'].map((t) => <span key={t} style={{fontSize: 22, fontWeight: 700, padding: '8px 16px', borderRadius: 999, background: '#F4F1EA', color: MUTED}}>{t}</span>)}</div>
          <div style={{position: 'relative', overflow: 'hidden', background: GRAD, color: '#fff', fontWeight: 800, fontSize: 28, padding: '16px 34px', borderRadius: 999, transform: `scale(${pressed ? interpolate(f, [click, click + 4, click + 10], [1, 0.92, 1], clamp) : 1})`}}>
            {load > 0 && load < 1 ? 'Génération…' : load >= 1 ? '✓ C’est parti' : '+ Générer'}
            {load > 0 && <div style={{position: 'absolute', left: 0, bottom: 0, height: 5, width: `${load * 100}%`, background: 'rgba(255,255,255,.8)'}} />}
          </div>
        </div>
      </Card>
      <div style={{position: 'absolute', left: RX + 6, top: 700, fontFamily: FONT, fontSize: 32, color: MUTED, opacity: sp(f - click - 10, 12)}}>Pas de brief, pas de réunion. <b style={{color: INK}}>Growthity s’occupe du reste.</b></div>
      <Cursor f={f} from={[RX + 1000, 900]} to={[RX + RW - 120, 560]} at={click - 2} click={click} />
    </>);
  }}</Stage>
);

// ---------- 2. marque ----------
const S2: React.FC = () => (
  <Stage k="s2">{(f) => {
    const scan = interpolate(f, [8, 60], [0, 1], clamp);
    const rows: [string, string, string][] = [['Ton de la marque', 'Délicat · élégant · féminin', 'ton'], ['Clientèle', 'Idées cadeaux, femmes 25-45 ans', 'clients'], ['Produits', 'Catalogue importé', 'vos'], ['Logo et couleurs', 'Repris dans chaque pub', 'couleurs']];
    return (
      <Card style={{left: RX, top: 230, width: RW}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 14, fontSize: 24, color: MUTED, fontWeight: 600}}>
          <LogoMark size={28} /> Analyse de <b style={{color: INK, margin: '0 6px'}}>maison-trefle.fr</b> et de <Brand k="instagram" s={26} /> @maisontrefle
        </div>
        <div style={{height: 6, borderRadius: 3, background: '#F1EDE6', marginTop: 18, overflow: 'hidden'}}><div style={{width: `${scan * 100}%`, height: '100%', background: GRAD}} /></div>
        <div style={{display: 'flex', alignItems: 'center', gap: 28, marginTop: 30, opacity: sp(f - 20, 12)}}>
          <div style={{width: 150, height: 150, borderRadius: 30, overflow: 'hidden', border: `1px solid ${LINE}`}}><Img src={M('ig/trefle-packshot.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover'}} /></div>
          <div style={{flex: 1}}>
            <div style={{fontWeight: 800, fontSize: 48, letterSpacing: '-0.02em'}}>Maison Trèfle</div>
            <div style={{fontSize: 28, color: MUTED, marginTop: 4}}>Bijoux · faits à la main</div>
            <div style={{display: 'flex', gap: 12, marginTop: 18}}>{['#1A1A1A', '#C9A227', '#F3EDE2', '#8C6A3F'].map((c, i) => <div key={c} style={{width: 54, height: 54, borderRadius: 14, background: c, border: `1px solid ${LINE}`, transform: `scale(${sp(f - cue(3, 'couleurs', 3) + FM.s2 - i * 3, 11)})`}} />)}</div>
          </div>
        </div>
        <div style={{height: 1, background: LINE, margin: '28px 0 14px'}} />
        {rows.map(([k, v, w], i) => { const p = sp(f - Math.min(cue(3, w, 2 + i) - FM.s2, 30 + i * 18), 12); return (
          <div key={k} style={{display: 'flex', alignItems: 'center', gap: 16, padding: '11px 0', fontSize: 30, opacity: p, transform: `translateX(${(1 - p) * 30}px)`}}><Check /><b style={{minWidth: 300}}>{k}</b><span style={{color: MUTED}}>{v}</span></div>); })}
      </Card>
    );
  }}</Stage>
);

// ---------- 3. produit ----------
const PRODS = [{img: 'ig/trefle-packshot.jpg', n: 'Bracelet Trèfle', pos: '50% 50%'}, {img: 'img-bracelet-cercle.jpg', n: 'Bracelet Soleil', pos: '50% 75%'}, {img: 'ig/lou-poignet.jpg', n: 'Bracelet Trèfle nacre', pos: '50% 50%'}];
const S3: React.FC = () => (
  <Stage k="s3">{(f) => {
    const pick = cue(4, 'choisissez', 1.6) - FM.s3 + 8;
    const on = f >= pick;
    return (<>
      <div style={{position: 'absolute', left: RX, top: 190, width: RW, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 22, fontFamily: FONT, padding: '0 120px'}}>
        {PRODS.map((p, i) => { const a = sp(f - 2 - i * 3, 12); const sel = on && i === 0; return (
          <div key={p.n} style={{position: 'relative', background: SURF, borderRadius: 26, padding: 12, border: sel ? `5px solid ${ACC}` : `1px solid ${LINE}`, boxShadow: sel ? '0 30px 60px -30px rgba(91,63,228,.7)' : '0 20px 40px -34px rgba(0,0,0,.4)', transform: `scale(${a * (sel ? 1 + 0.05 * sp(f - pick, 10) : 1)})`}}>
            <Img src={M(p.img)} style={{width: '100%', aspectRatio: '1.25', objectFit: 'cover', objectPosition: p.pos, borderRadius: 16, display: 'block'}} />
            <div style={{fontSize: 26, fontWeight: 700, marginTop: 10, color: INK}}>{p.n}</div>
            {sel && <div style={{position: 'absolute', right: 22, top: 22, width: 50, height: 50, borderRadius: 99, background: ACC, display: 'grid', placeItems: 'center'}}><Check s={28} c="#fff" /></div>}
            {sel && <div style={{position: 'absolute', left: 22, top: 22, background: '#B91C1C', color: '#fff', fontWeight: 800, fontSize: 20, padding: '8px 14px', borderRadius: 999, letterSpacing: '0.06em'}}>NOËL</div>}
          </div>); })}
        <div style={{borderRadius: 26, border: `2px dashed ${LINE}`, display: 'grid', placeItems: 'center', fontSize: 28, color: MUTED, fontWeight: 600, textAlign: 'center', opacity: sp(f - 18, 12)}}>+ Ajouter<br />un produit</div>
      </div>
      <Cursor f={f} from={[RX + 900, 980]} to={[RX + 330, 380]} at={pick - 2} click={pick} />
    </>);
  }}</Stage>
);

// ---------- 4. style (les 5 styles vidéo de Growthity + visuels/carrousels) ----------
const STYLES: {k: string; t: string; h: string; w: string; v?: string}[] = [
  {k: 'ugc', t: 'Acteur UGC', h: '500+ acteurs, ou vous', w: 'un', v: 'gw/gw-28.mp4'},
  {k: 'vo', t: 'Produit + voix off', h: 'Votre produit, une voix', w: 'une', v: 'vid-oeufs-cuisine.mp4'},
  {k: 'motion', t: 'Motion design', h: 'Offre, lancement, promo', w: 'motion'},
  {k: 'cine', t: 'Cinématique', h: 'Plans soignés, lumière', w: 'cinématique', v: 'gw/gw-48.mp4'},
  {k: 'anim', t: 'Photo animée', h: 'Votre photo prend vie', w: 'photo', v: 'vid-sneakers.mp4'},
  {k: 'img', t: 'Visuels & carrousels', h: '1 à 10 images', w: 'visuels'},
];
const MotionPrev: React.FC<{f: number}> = ({f}) => (
  <AbsoluteFill style={{background: GRAD, overflow: 'hidden', fontFamily: FONT, color: '#fff'}}>
    {[0, 1, 2].map((i) => <div key={i} style={{position: 'absolute', left: 30 + i * 80, top: 40 + i * 70, width: 90, height: 90, borderRadius: i === 1 ? 99 : 20, border: '6px solid rgba(255,255,255,.35)', transform: `rotate(${f * (2 + i)}deg) translateY(${Math.sin((f + i * 20) / 10) * 14}px)`}} />)}
    <div style={{position: 'absolute', left: 0, right: 0, top: 120, textAlign: 'center', fontWeight: 900, fontSize: 46, lineHeight: 1, letterSpacing: '-0.03em', transform: `scale(${1 + 0.06 * Math.sin(f / 6)})`}}>OFFRE<br />DE NOËL</div>
    <div style={{position: 'absolute', left: 40, right: 40, bottom: 40, height: 46, borderRadius: 99, background: '#fff', color: INK, display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 20, transform: `translateY(${(1 - sp(f % 45, 10)) * 60}px)`}}>Commander</div>
  </AbsoluteFill>
);
const ImgPrev: React.FC<{f: number}> = ({f}) => {
  const imgs = ['ig/trefle-packshot.jpg', 'img-bracelet-cercle.jpg', 'ig/lou-poignet.jpg'];
  const cur = Math.floor(f / 20) % 3;
  return (
    <AbsoluteFill style={{background: '#EFEBE3'}}>
      {imgs.map((im, i) => { const d = (i - cur + 3) % 3; return <div key={im} style={{position: 'absolute', left: 40 + d * 22, top: 40 + d * 16, width: 190, height: 240, borderRadius: 16, overflow: 'hidden', boxShadow: '0 16px 30px -16px rgba(0,0,0,.5)', zIndex: 3 - d, transform: `rotate(${(d - 1) * 4}deg)`}}><Img src={M(im)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 70%'}} /></div>; })}
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 14, display: 'flex', justifyContent: 'center', gap: 6}}>{[0, 1, 2].map((i) => <span key={i} style={{width: 9, height: 9, borderRadius: 9, background: i === cur ? ACC : '#C9C2B6'}} />)}</div>
    </AbsoluteFill>
  );
};
const S4: React.FC = () => (
  <Stage k="s4">{(f) => {
    const g = f + FM.s4;
    const at = STYLES.map((x) => cue(5, x.w, 1));
    let act = -1; at.forEach((t, i) => { if (g >= t - 2) act = i; });
    const faces = (ACTORS as {name: string; img: string}[]).filter((a) => a !== NOOR);
    const flipFrom = cue(5, 'cinq', 3), meAt = cue(5, 'vous', 4);
    const fi = Math.floor((g - flipFrom) / 3);
    return (
      <div style={{position: 'absolute', left: RX - 10, top: 150, width: RW + 20, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, fontFamily: FONT, color: INK}}>
        {STYLES.map((x, i) => {
          const p = sp(f - 2 - i * 2, 12), on = i === act, seen = i <= act, pop = sp(g - at[i], 10);
          return (
            <div key={x.k} style={{position: 'relative', background: SURF, borderRadius: 26, padding: 10, border: on ? `4px solid ${ACC}` : `1px solid ${LINE}`, boxShadow: on ? '0 30px 60px -26px rgba(91,63,228,.7)' : '0 20px 40px -34px rgba(0,0,0,.4)', transform: `scale(${p * (on ? 1 + 0.05 * pop : 1)})`, opacity: act >= 0 && !on ? 0.6 : 1, zIndex: on ? 2 : 1}}>
              <div style={{position: 'relative', height: 300, borderRadius: 18, overflow: 'hidden', background: '#EFEBE3'}}>
                {x.v && <OffthreadVideo muted src={M(x.v)} startFrom={x.k === 'cine' ? 50 : 30} style={{width: '100%', height: '100%', objectFit: 'cover'}} />}
                {x.k === 'motion' && <MotionPrev f={f} />}
                {x.k === 'img' && <ImgPrev f={f} />}
                {x.k === 'ugc' && g >= flipFrom && g < meAt && <Img src={M(faces[(fi * 7) % faces.length].img)} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 30%'}} />}
                {x.k === 'ugc' && g >= flipFrom && <div style={{position: 'absolute', left: 10, top: 10, background: ACC, color: '#fff', fontWeight: 800, fontSize: 18, padding: '6px 12px', borderRadius: 999, transform: `scale(${sp(g - flipFrom, 10)})`}}>{g >= meAt ? 'Ou le vôtre, depuis une photo' : '500+ acteurs'}</div>}
              </div>
              <div style={{display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, fontSize: 26, fontWeight: 800}}>{seen && <Check s={24} />}{x.t}</div>
              <div style={{fontSize: 19, color: MUTED, marginTop: 2}}>{x.h}</div>
            </div>
          );
        })}
      </div>
    );
  }}</Stage>
);

// ---------- 5. vidéo prête ----------
const S5: React.FC = () => (
  <Stage k="s5">{(f) => {
    const items: [string, string][] = [['Script', 'script'], ['Voix en français', 'voix'], ['Sous-titres animés', 'sous'], ['Montage', 'montage'], ['9:16 · 4:5 · 1:1 · 16:9', 'formats']];
    const ready = sp(f - (cue(6, 'prêt', 2.6) - FM.s5), 11);
    const ph = sp(f, 14);
    return (<>
      <div style={{position: 'absolute', left: RX, top: 150, width: 440, height: 782, borderRadius: 54, padding: 12, background: '#16141A', boxShadow: '0 60px 100px -40px rgba(0,0,0,.6)', transform: `translateY(${(1 - ph) * 200}px) rotate(${(1 - ph) * 6}deg)`}}>
        <div style={{width: '100%', height: '100%', borderRadius: 44, overflow: 'hidden', position: 'relative'}}>
          <OffthreadVideo muted src={M('chat/trefle-noor-edit.mp4')} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
          <div style={{position: 'absolute', left: 18, top: 22, background: '#B91C1C', color: '#fff', fontWeight: 800, fontSize: 18, padding: '7px 12px', borderRadius: 999, fontFamily: FONT}}>NOËL</div>
        </div>
      </div>
      <div style={{position: 'absolute', left: RX + 490, top: 200, width: 430, display: 'grid', gap: 16, fontFamily: FONT, color: INK}}>
        {[{img: M(NOOR.img), k: 'Acteur UGC', v: 'Noor'}, {img: M('ig/trefle-packshot.jpg'), k: 'Produit', v: 'Bracelet Trèfle'}].map((x, i) => { const p = sp(f - 6 - i * 5, 12); return (
          <div key={x.k} style={{display: 'flex', alignItems: 'center', gap: 16, background: SURF, borderRadius: 24, padding: 14, border: `1px solid ${LINE}`, opacity: p, transform: `translateX(${(1 - p) * 40}px)`}}>
            <Img src={x.img} style={{width: 80, height: 80, borderRadius: 16, objectFit: 'cover'}} />
            <div><div style={{fontSize: 18, color: MUTED, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase'}}>{x.k}</div><div style={{fontSize: 28, fontWeight: 700}}>{x.v}</div></div>
          </div>); })}
        <div style={{height: 8}} />
        {items.map(([t, w]) => { const p = sp(f - (cue(6, w, 1) - FM.s5), 12); return <div key={t} style={{display: 'flex', alignItems: 'center', gap: 12, fontSize: 30, fontWeight: 600, opacity: p, transform: `translateX(${(1 - p) * 30}px)`}}><Check s={32} />{t}</div>; })}
        <div style={{marginTop: 14, display: 'flex', justifyContent: 'center', background: OK_SOFT, color: OK, fontWeight: 800, fontSize: 30, padding: '16px 0', borderRadius: 999, transform: `scale(${ready})`}}>● Vidéo prête</div>
      </div>
    </>);
  }}</Stage>
);

// ---------- 6. Meta Ads ----------
const S6: React.FC = () => (
  <Stage k="s6">{(f) => {
    const click = cue(7, 'clic', 0.6) - FM.s6 + 4;
    const live = f >= click + 14, lp = sp(f - click - 14, 11);
    const chips = sp(f - (cue(7, 'dès', 2.4) - FM.s6), 12);
    return (<>
      <Card style={{left: RX, top: 220, width: RW}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 22}}>
          <Brand k="meta" s={84} />
          <div style={{flex: 1}}><div style={{fontWeight: 800, fontSize: 48, letterSpacing: '-0.02em'}}>Meta Ads</div><div style={{fontSize: 26, color: MUTED, fontWeight: 500}}>Compte publicitaire connecté</div></div>
          <span style={{background: OK_SOFT, color: OK, fontWeight: 800, fontSize: 24, padding: '10px 20px', borderRadius: 999}}>Connecté</span>
        </div>
        <div style={{height: 1, background: LINE, margin: '26px 0 10px'}} />
        {[{k: 'facebook', n: 'Facebook', d: 'Fil · Reels · Stories'}, {k: 'instagram', n: 'Instagram', d: 'Fil · Reels · Stories'}].map((x) => (
          <div key={x.k} style={{display: 'flex', alignItems: 'center', gap: 20, padding: '12px 0'}}><Brand k={x.k} s={54} /><div style={{flex: 1, fontSize: 34, fontWeight: 700}}>{x.n}<span style={{fontSize: 24, color: MUTED, fontWeight: 500, marginLeft: 14}}>{x.d}</span></div><Check s={38} /></div>
        ))}
        <div style={{display: 'flex', gap: 14, margin: '18px 0 4px', opacity: chips, transform: `translateY(${(1 - chips) * 16}px)`}}>
          {['Dès 1 € / jour', '0 % de commission'].map((t) => <span key={t} style={{fontSize: 26, fontWeight: 800, padding: '10px 20px', borderRadius: 999, background: '#F0ECFF', color: ACC}}>{t}</span>)}
        </div>
        <div style={{marginTop: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, background: live ? '#16A34A' : '#0866FF', color: '#fff', borderRadius: 22, padding: '24px 0', fontWeight: 800, fontSize: 36, transform: `scale(${interpolate(f, [click, click + 4, click + 10], [1, 0.95, 1], clamp)})`}}>
          {live ? <span style={{transform: `scale(${lp})`, display: 'flex', alignItems: 'center', gap: 14}}><Check s={40} c="#fff" />En diffusion sur Meta</span> : <><svg width="44" height="44" viewBox="0 0 24 24"><path d={BRAND_PATHS.meta} fill="#fff" /></svg>Publier sur Meta</>}
        </div>
      </Card>
      <Cursor f={f} from={[RX + 1000, 1000]} to={[RX + RW / 2, 800]} at={click - 2} click={click} />
    </>);
  }}</Stage>
);

// ---------- 7. performances ----------
const S7: React.FC = () => (
  <Stage k="s7">{(f) => {
    const bars = [0.35, 0.42, 0.4, 0.55, 0.62, 0.6, 0.74, 0.82, 0.9];
    const ins: [string, string, string, string][] = [['🏆', 'Meilleure pub repérée', 'Noor · Bracelet Trèfle', 'analyse'], ['💡', 'À améliorer', 'l’accroche des 3 premières secondes', 'quoi'], ['✨', 'Nouvelle version prête', 'à valider en un clic', 'améliorer']];
    return (
      <Card style={{left: RX, top: 210, width: RW}}>
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}><div style={{fontWeight: 800, fontSize: 40, letterSpacing: '-0.02em'}}>Campagne Noël</div><span style={{background: OK_SOFT, color: OK, fontWeight: 800, fontSize: 22, padding: '8px 16px', borderRadius: 999}}>● En diffusion</span></div>
        <div style={{display: 'flex', alignItems: 'flex-end', gap: 14, height: 230, marginTop: 28, padding: '0 6px', borderBottom: `2px solid ${LINE}`}}>
          {bars.map((h, i) => <div key={i} style={{flex: 1, height: `${h * 100 * sp(f - 4 - i * 2, 14)}%`, borderRadius: '12px 12px 4px 4px', background: i === bars.length - 1 ? GRAD : '#E7E2F8'}} />)}
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: 12, marginTop: 24, fontSize: 22, fontWeight: 800, letterSpacing: '0.1em', color: ACC}}><LogoMark size={26} /> VOTRE MEDIA BUYER IA</div>
        <div style={{display: 'grid', gap: 2, marginTop: 8}}>
          {ins.map(([i, t, d, w], j) => { const p = sp(f - Math.min(cue(8, w, 1.5 + j) - FM.s7, 40 + j * 20), 12); return (
            <div key={t} style={{display: 'flex', alignItems: 'center', gap: 16, padding: '12px 0', fontSize: 29, opacity: p, transform: `translateX(${(1 - p) * 30}px)`}}><span style={{fontSize: 34}}>{i}</span><b>{t}</b><span style={{color: MUTED}}>{d}</span></div>); })}
        </div>
      </Card>
    );
  }}</Stage>
);

// ---------- 8. réseaux ----------
const S8: React.FC = () => (
  <Stage k="s8">{(f) => {
    const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven'];
    const posts: [string, string][] = [['instagram', 'Reel'], ['tiktok', 'Vidéo'], ['linkedin', 'Post'], ['facebook', 'Carrousel'], ['youtube', 'Short']];
    return (<>
      <div style={{position: 'absolute', left: RX, top: 260, width: RW, display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14, fontFamily: FONT, color: INK}}>
        {days.map((d, i) => { const p = sp(f - 10 - i * 6, 11); const [k, t] = posts[i]; return (
          <div key={d} style={{background: SURF, borderRadius: 24, border: `1px solid ${LINE}`, padding: '18px 12px 22px', height: 360, boxShadow: '0 24px 50px -40px rgba(0,0,0,.4)'}}>
            <div style={{fontSize: 26, fontWeight: 700, color: MUTED}}>{d}</div>
            <div style={{marginTop: 18, borderRadius: 18, background: PAPER, padding: '22px 10px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, transform: `scale(${p}) translateY(${(1 - p) * -60}px)`, opacity: p}}>
              <Brand k={k} s={60} /><div style={{fontSize: 26, fontWeight: 700}}>{t}</div><div style={{fontSize: 20, fontWeight: 800, color: OK}}>Programmé</div>
            </div>
          </div>); })}
      </div>
      <div style={{position: 'absolute', left: RX + 4, top: 670, fontFamily: FONT, fontSize: 32, color: MUTED, opacity: sp(f - (cue(9, 'vous', 2.6) - FM.s8), 12)}}>Instagram, Facebook, TikTok, YouTube, LinkedIn : <b style={{color: INK}}>vous planifiez, Growthity publie.</b></div>
    </>);
  }}</Stage>
);

// ---------- 9. alertes WhatsApp ----------
const WaMsg: React.FC<{p: number; icon: string; t: string; d: string; time: string}> = ({p, icon, t, d, time}) => (
  <div style={{alignSelf: 'flex-start', maxWidth: 760, background: '#fff', borderRadius: '6px 26px 26px 26px', padding: '18px 24px 12px', boxShadow: '0 2px 2px rgba(0,0,0,.08)', opacity: p, transform: `translateY(${(1 - p) * 30}px) scale(${0.9 + 0.1 * p})`, transformOrigin: 'left top'}}>
    <div style={{fontSize: 30, fontWeight: 700, color: INK}}>{icon} {t}</div>
    <div style={{fontSize: 26, color: '#3B3A40', marginTop: 6, lineHeight: 1.35}}>{d}</div>
    <div style={{fontSize: 19, color: '#8A8F98', textAlign: 'right', marginTop: 4}}>{time}</div>
  </div>
);
const S9: React.FC = () => (
  <Stage k="s9">{(f) => {
    const a = cue(10, 'lead', 0.6) - FM.s9, b = cue(10, 'pub', 1.4) - FM.s9, c = cue(10, 'whatsapp', 2.8) - FM.s9 + 6;
    return (
      <div style={{position: 'absolute', left: RX, top: 190, width: RW, borderRadius: 34, overflow: 'hidden', boxShadow: CARD_SH, border: `1px solid ${LINE}`, fontFamily: FONT}}>
        <div style={{background: '#075E54', color: '#fff', display: 'flex', alignItems: 'center', gap: 18, padding: '20px 28px'}}>
          <div style={{width: 62, height: 62, borderRadius: 99, background: '#fff', display: 'grid', placeItems: 'center'}}><LogoMark size={38} /></div>
          <div style={{flex: 1}}><div style={{fontSize: 32, fontWeight: 700}}>Growthity</div><div style={{fontSize: 22, opacity: 0.8}}>Alertes de vos pubs</div></div>
          <Brand k="whatsapp" s={50} c="#fff" />
        </div>
        <div style={{background: '#ECE5DD', padding: '24px 24px 28px', display: 'flex', flexDirection: 'column', gap: 16, minHeight: 520}}>
          <WaMsg p={sp(f - a, 12)} icon="🔔" t="Nouveau lead" d="Julie R. a laissé ses coordonnées. Rappelez-la depuis Growthity." time="09:12" />
          <WaMsg p={sp(f - b, 12)} icon="⚠️" t="Votre pub s’essouffle" d="Les clics baissent depuis hier. Une nouvelle version est prête à valider." time="11:40" />
          <WaMsg p={sp(f - c, 12)} icon="✅" t="Pub validée par Meta" d="Votre nouvelle pub est en diffusion." time="14:05" />
        </div>
      </div>
    );
  }}</Stage>
);

// ---------- fin ----------
const End: React.FC = () => {
  const f = useCurrentFrame();
  const a = sp(f - 6, 12), b = sp(f - (cue(11, 'à', 1.6) - FM.end), 12), url = sp(f - (cue(11, 'growthity', 2.6) - FM.end), 11);
  return (
    <AbsoluteFill style={{fontFamily: FONT}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 200, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 20, transform: `scale(${sp(f, 12)})`}}>
        <div style={{width: 100, height: 100, borderRadius: 30, background: SURF, border: `1px solid ${LINE}`, display: 'grid', placeItems: 'center'}}><LogoMark size={64} draw={prog(f, 2, 20)} /></div>
        <Wordmark size={66} />
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 380, textAlign: 'center', fontWeight: 900, fontSize: 124, lineHeight: 1.0, letterSpacing: '-0.055em', color: INK}}>
        <div style={{opacity: a, transform: `translateY(${(1 - a) * 50}px)`}}>Votre prochaine pub</div>
        <div style={{opacity: b, transform: `translateY(${(1 - b) * 50}px)`}}><G>est à une phrase.</G></div>
      </div>
      <div style={{position: 'absolute', left: 960 - 280, top: 720, width: 560, height: 128, borderRadius: 64, background: INK, display: 'grid', placeItems: 'center', color: '#fff', fontWeight: 800, fontSize: 48, boxShadow: '0 30px 60px -24px rgba(0,0,0,.5)', transform: `scale(${url})`, opacity: Math.min(1, url * 1.5)}}>growthity.ai →</div>
    </AbsoluteFill>
  );
};

// sous-titres discrets sous le titre
const Caps: React.FC = () => {
  const g = useCurrentFrame();
  if (g < FM.s1 || g >= FM.end) return null;
  let k = 0;
  for (let i = 2; i <= 10; i++) if (g >= VO[i] - 2) k = i;
  if (!k) return null;
  const words = WD[`lm-${k}`]; const t = (g - VO[k]) / 30;
  const i = words.findIndex((w) => t < w.e + 0.12);
  if (i < 0 || t < words[0].s - 0.1) return null;
  const grp = words.slice(Math.floor(i / 4) * 4, Math.floor(i / 4) * 4 + 4);
  return (
    <div style={{position: 'absolute', left: 120, width: 680, top: 880, display: 'flex', flexWrap: 'wrap', gap: 10}}>
      {grp.map((w, j) => { const on = t >= w.s - 0.02, hot = on && t <= w.e + 0.08; return <span key={j} style={{fontFamily: FONT, fontWeight: 800, fontSize: 34, padding: '4px 12px', borderRadius: 10, color: hot ? '#fff' : INK, background: hot ? ACC : 'rgba(255,255,255,.9)', opacity: on ? 1 : 0.45}}>{w.w.replace(/[.,:?…«»]$/, '')}</span>; })}
    </div>
  );
};

export const FilmMix: React.FC = () => {
  useFonts();
  const g = useCurrentFrame();
  const flash = (at: number) => interpolate(g, [at - 1, at, at + 5], [0, 0.45, 0], clamp);
  return (
    <AbsoluteFill style={{background: PAPER, fontFamily: FONT}}>
      <Bg />
      <Rail />
      <Head k="s1" kick="Étape 1 · Décrivez" a="Une phrase" b="sur votre produit." />
      <S1 />
      <Head k="s2" kick="Étape 2 · Growthity analyse votre marque" a="Votre univers," b="compris en secondes." />
      <S2 />
      <Head k="s3" kick="Étape 3 · Choisissez le produit" a="Votre catalogue," b="déjà prêt." />
      <S3 />
      <Head k="s4" kick="Étape 4 · Choisissez le style" a="Le style" b="qui vous va." />
      <S4 />
      <Head k="s5" kick="Étape 5 · Growthity crée" a="Script, voix, montage :" b="c’est prêt." />
      <S5 />
      <Head k="s6" kick="Étape 6 · Lancez" a="Directement" b="sur Meta Ads." />
      <S6 />
      <Head k="s7" kick="Étape 7 · Suivez vos performances" a="Votre media buyer" b="vous dit quoi améliorer." />
      <S7 />
      <Head k="s8" kick="Et en plus" a="Postez aussi" b="sur vos réseaux sociaux." />
      <S8 />
      <Head k="s9" kick="Alertes WhatsApp" a="Prévenu dès" b="qu’il faut agir." />
      <S9 />
      <Caps />
      <Intro />
      <Sequence from={FM.end}><End /></Sequence>
      <AbsoluteFill style={{background: '#fff', opacity: flash(FM.end), pointerEvents: 'none'}} />
      <Audio src={staticFile('film/bed-mix.wav')} />
      {Array.from({length: 11}, (_, i) => i + 1).map((k) => <Sequence key={k} from={VO[k]}><Audio src={staticFile(`voice/lm-${k}-n.mp3`)} /></Sequence>)}
    </AbsoluteFill>
  );
};
