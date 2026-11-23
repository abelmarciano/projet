// « Growthity est en ligne » — vidéo d'annonce LinkedIn, 4:5 (1080×1350), ~51 s.
// Version animée du carrousel de lancement (post-08) : même direction artistique (papier chaud, encre sombre,
// Space Grotesk), voix off Hugo au vouvoiement, sous-titres incrustés (LinkedIn lit sans le son).
// Rien de faux : pas d'« optimisation jour et nuit » ; le media buyer analyse et dit quoi améliorer.
import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, continueRender, delayRender, interpolate, spring, staticFile, useCurrentFrame} from 'remotion';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/inter/800.css';
import '@fontsource/space-grotesk/600.css';
import '@fontsource/space-grotesk/700.css';
import {LogoMark, Wordmark} from '../components/UI';
import {INOUT, prog} from '../components/anim';
import {C, DISPLAY, FONT, GRAD} from '../theme';
import {BRAND_PATHS} from '../components/brands';
import ACTORS from '../organic/actors_real.json';
import WORDS from './words.json';
import TLJ from './timeline.json';

type Word = {w: string; s: number; e: number};
const WD = WORDS as unknown as Record<string, Word[]>;
const TL = TLJ as unknown as {VO: Record<string, number>; S: Record<string, number>};
export const GS = TL.S;
const VO = TL.VO;
const W = 1080, H = 1350, M = 80;
const PAPER = '#F4F1EA', INK = '#16141A', MUTED = '#6E6A73', LINE = '#E2DDD2', ACCENT = C.indigo, OK = '#16A34A';
const SH = '0 40px 80px -50px rgba(0,0,0,0.45)';
const sp = (f: number, d = 14, m = 0.8) => spring({frame: f, fps: 30, config: {damping: d, mass: m, stiffness: 170}});
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const bf = (f: string) => staticFile(`media/bf/${f}`);
const cue = (k: number, start: string, d = 0) => {
  const w = WD[`gl-${k}`].find((x) => x.w.toLowerCase().startsWith(start));
  return VO[k] + Math.round((w ? w.s : d) * 30);
};
const ORDER = ['intro', 'prompt', 'brand', 'product', 'actor', 'video', 'meta', 'perf', 'social', 'wa', 'end'];
const nextOf = (k: string) => GS[ORDER[ORDER.indexOf(k) + 1]] ?? GS.total;

const useFonts = () => {
  const [h] = useState(() => delayRender('fonts'));
  useEffect(() => { Promise.all(['600 20px Inter', '700 20px Inter', '800 20px Inter', '700 20px "Space Grotesk"', '600 20px "Space Grotesk"'].map((s) => document.fonts.load(s))).then(() => continueRender(h)); }, [h]);
};
const Brand: React.FC<{k: string; s: number; c?: string}> = ({k, s, c}) => {
  if (k === 'meta' && !c) return <svg width={s} height={s} viewBox="0 0 24 24"><defs><linearGradient id="mgl" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#0064E0" /><stop offset="0.6" stopColor="#0082FB" /><stop offset="1" stopColor="#0099FF" /></linearGradient></defs><path d={BRAND_PATHS.meta} fill="url(#mgl)" /></svg>;
  const col = c ?? ({instagram: '#FF0069', facebook: '#0866FF', tiktok: '#000000', youtube: '#FF0000', whatsapp: '#25D366', linkedin: '#0A66C2'} as Record<string, string>)[k];
  return <svg width={s} height={s} viewBox="0 0 24 24"><path d={BRAND_PATHS[k]} fill={col} /></svg>;
};
const Check: React.FC<{s?: number; c?: string}> = ({s = 34, c = OK}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>;
const Card: React.FC<{style?: React.CSSProperties; children: React.ReactNode}> = ({style, children}) => (
  <div style={{position: 'absolute', background: '#fff', borderRadius: 34, padding: '32px 34px', boxShadow: SH, border: `1px solid ${LINE}`, ...style}}>{children}</div>
);

// scène : entrée (glisse depuis le bas) et sortie (glisse vers le haut) + en-tête étape
const Scene: React.FC<{k: string; kicker?: string; title?: React.ReactNode; children: (f: number) => React.ReactNode}> = ({k, kicker, title, children}) => {
  const g = useCurrentFrame();
  const a = GS[k], b = nextOf(k);
  if (g < a - 2 || g > b + 2) return null;
  const f = g - a;
  const inP = sp(f, 15), out = prog(g, b - 10, 12, INOUT);
  return (
    <AbsoluteFill style={{opacity: Math.min(1, inP * 1.4) * (1 - out), transform: `translateY(${(1 - inP) * 70 - out * 70}px)`}}>
      {kicker && <div style={{position: 'absolute', left: M, right: M, top: 120, fontFamily: DISPLAY, fontWeight: 700, fontSize: 26, letterSpacing: '0.14em', textTransform: 'uppercase', color: ACCENT, opacity: prog(f, 2, 8)}}>{kicker}</div>}
      {title && <div style={{position: 'absolute', left: M, right: M, top: 165, fontFamily: DISPLAY, fontWeight: 700, fontSize: 70, lineHeight: 1.05, letterSpacing: '-0.025em', color: INK}}>
        <div style={{overflow: 'hidden', paddingBottom: 6}}><div style={{transform: `translateY(${(1 - sp(f - 3, 13)) * 110}%)`}}>{title}</div></div>
      </div>}
      {children(f)}
    </AbsoluteFill>
  );
};

// sous-titres (3 mots), en bas
const Caps: React.FC = () => {
  const g = useCurrentFrame();
  let k = 0;
  for (let i = 1; i <= 11; i++) if (g >= VO[i] - 2) k = i;
  if (!k) return null;
  const words = WD[`gl-${k}`]; const t = (g - VO[k]) / 30;
  const i = words.findIndex((w) => t < w.e + 0.12);
  if (i < 0 || t < words[0].s - 0.1) return null;
  const grp = words.slice(Math.floor(i / 3) * 3, Math.floor(i / 3) * 3 + 3);
  return (
    <div style={{position: 'absolute', left: 60, right: 60, top: 1178, display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap'}}>
      {grp.map((w, j) => {
        const on = t >= w.s - 0.02, hot = on && t <= w.e + 0.08;
        return <span key={j} style={{fontFamily: FONT, fontWeight: 800, fontSize: 44, padding: '4px 12px', borderRadius: 12, color: hot ? '#fff' : INK, background: hot ? ACCENT : 'rgba(255,255,255,0.85)', opacity: on ? 1 : 0.5, boxShadow: '0 8px 20px -14px rgba(0,0,0,.4)'}}>{w.w.replace(/[.,:]$/, '')}</span>;
      })}
    </div>
  );
};

// ---------- 1. intro ----------
const Intro: React.FC = () => (
  <Scene k="intro">{(f) => {
    const t1 = sp(f - 6, 13), t2 = sp(f - (cue(1, 'en', 0.6) - GS.intro), 12);
    const sub = sp(f - (cue(1, 'vos', 1.4) - GS.intro), 12);
    const logos = ['meta', 'instagram', 'facebook', 'tiktok', 'youtube', 'linkedin', 'whatsapp'];
    return (
      <>
        <div style={{position: 'absolute', left: M, top: 150, display: 'flex', alignItems: 'center', gap: 16, opacity: prog(f, 0, 10)}}><LogoMark size={52} draw={prog(f, 0, 20)} /><span style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 28, letterSpacing: '0.14em', color: ACCENT}}>LANCEMENT</span></div>
        <div style={{position: 'absolute', left: M, right: M, top: 250, fontFamily: DISPLAY, fontWeight: 700, fontSize: 150, lineHeight: 0.95, letterSpacing: '-0.035em', color: INK}}>
          <div style={{overflow: 'hidden'}}><div style={{transform: `translateY(${(1 - t1) * 110}%)`}}>Growthity</div></div>
          <div style={{overflow: 'hidden', paddingBottom: 14}}><div style={{transform: `translateY(${(1 - t2) * 110}%)`, color: ACCENT}}>est en ligne.</div></div>
        </div>
        <div style={{position: 'absolute', left: M, right: M, top: 620, fontFamily: FONT, fontWeight: 500, fontSize: 44, lineHeight: 1.3, color: MUTED, opacity: sub, transform: `translateY(${(1 - sub) * 20}px)`}}>Vos pubs et vos posts générés et publiés <b style={{color: INK}}>en&nbsp;2&nbsp;minutes.</b></div>
        <div style={{position: 'absolute', left: M, top: 820, display: 'flex', gap: 20}}>
          {logos.map((k, i) => { const p = sp(f - 40 - i * 4, 10); return <div key={k} style={{width: 110, height: 110, borderRadius: 30, background: '#fff', border: `1px solid ${LINE}`, boxShadow: '0 18px 40px -24px rgba(0,0,0,.45)', display: 'grid', placeItems: 'center', transform: `scale(${p}) translateY(${(1 - p) * 30}px)`}}><Brand k={k} s={62} /></div>; })}
        </div>
      </>
    );
  }}</Scene>
);

// ---------- 2. une phrase ----------
const PROMPT = 'Je veux une pub pour le Black Friday pour ma marque.';
const Prompt: React.FC = () => (
  <Scene k="prompt" kicker="Étape 1 · Décrivez" title="Une phrase, c’est tout.">{(f) => {
    const ts = cue(2, 'je', 2.0) - GS.prompt;
    const typed = PROMPT.slice(0, Math.max(0, Math.floor((f - ts) * 1.6)));
    const done = typed.length === PROMPT.length;
    return (
      <Card style={{left: M, right: M, top: 420}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 12, fontFamily: FONT, fontSize: 26, color: MUTED, fontWeight: 600}}><LogoMark size={30} /> Décrivez votre pub</div>
        <div style={{marginTop: 18, fontFamily: FONT, fontWeight: 600, fontSize: 50, lineHeight: 1.28, color: INK, minHeight: 200}}>{typed}<span style={{color: ACCENT, opacity: Math.floor(f / 8) % 2 ? 0 : 1}}>|</span></div>
        <div style={{display: 'flex', justifyContent: 'flex-end', marginTop: 10}}>
          <span style={{padding: '18px 34px', borderRadius: 999, background: done ? GRAD : '#D7D7E1', color: '#fff', fontFamily: FONT, fontWeight: 800, fontSize: 32, transform: `scale(${done ? 1 + 0.06 * Math.sin(f / 4) : 1})`}}>✦ Générer</span>
        </div>
      </Card>
    );
  }}</Scene>
);

// ---------- 3. analyse de la marque ----------
const Brandkit: React.FC = () => (
  <Scene k="brand" kicker="Étape 2 · Growthity analyse votre marque" title="Votre univers, compris.">{(f) => {
    const scan = interpolate(f, [8, 40], [0, 1], clamp);
    const rows: [string, string, string][] = [['ton', 'Ton de la marque', 'Chaleureux · cocooning · premium'], ['couleurs', 'Couleurs', 'Reprises dans chaque pub'], ['logo', 'Logo', 'Ajouté automatiquement'], ['', 'Clientèle', 'Amatrices de déco, idées cadeaux']];
    return (
      <Card style={{left: M, right: M, top: 410}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 26}}>
          <div style={{position: 'relative', width: 150, height: 150, borderRadius: 30, background: '#2A1D12', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#E8B26A', fontFamily: 'Georgia, serif', fontSize: 30, textAlign: 'center', lineHeight: 1.05, letterSpacing: '0.04em', overflow: 'hidden'}}>MAISON<br />AMBRE
            <div style={{position: 'absolute', left: 0, right: 0, top: `${scan * 100}%`, height: 6, background: 'rgba(91,63,228,.9)', boxShadow: '0 0 20px rgba(91,63,228,.9)', opacity: scan < 1 ? 1 : 0}} />
          </div>
          <div style={{flex: 1}}>
            <div style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 46}}>Maison Ambre</div>
            <div style={{fontFamily: FONT, fontSize: 28, color: MUTED, marginTop: 4}}>Bougies parfumées · fait main</div>
            <div style={{display: 'flex', gap: 12, marginTop: 16}}>{['#C9862E', '#F3E6D2', '#5A3A1E', '#2A1D12'].map((c, i) => <div key={c} style={{width: 54, height: 54, borderRadius: 14, background: c, border: `1px solid ${LINE}`, transform: `scale(${sp(f - (cue(3, 'couleurs', 2.6) - GS.brand) - i * 3, 10)})`}} />)}</div>
          </div>
        </div>
        <div style={{height: 1, background: LINE, margin: '28px 0 12px'}} />
        {rows.map(([w, k, v], i) => {
          const at = (w ? cue(3, w, 1.8 + i * 0.8) : cue(3, 'logo', 3.6) + 10) - GS.brand;
          const p = sp(f - at, 12);
          return <div key={k} style={{display: 'flex', alignItems: 'center', gap: 16, padding: '12px 0', fontFamily: FONT, fontSize: 31, opacity: Math.min(1, p * 1.5), transform: `translateX(${(1 - p) * 40}px)`}}><Check /><b style={{minWidth: 300}}>{k}</b><span style={{color: MUTED}}>{v}</span></div>;
        })}
      </Card>
    );
  }}</Scene>
);

// ---------- 4. produit ----------
const PRODS = [{f: 'p1.jpg', n: 'Bougie Bois & Vanille'}, {f: 'p2.jpg', n: 'Bougie Ambre'}, {f: 'p3.jpg', n: 'Diffuseur'}, {f: 'p4.jpg', n: 'Coffret trio'}, {f: 'p5.jpg', n: 'Bougie 3 mèches'}];
const Product: React.FC = () => (
  <Scene k="product" kicker="Étape 3 · Choisissez le produit" title="Votre catalogue, déjà prêt.">{(f) => {
    const pick = 26;
    return (
      <div style={{position: 'absolute', left: M, right: M, top: 410, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 22}}>
        {PRODS.map((p, i) => {
          const q = sp(f - 4 - i * 3, 12), on = i === 0 && f >= pick;
          return <div key={p.n} style={{position: 'relative', background: '#fff', borderRadius: 28, padding: 14, border: on ? `5px solid ${ACCENT}` : `1px solid ${LINE}`, boxShadow: on ? '0 30px 60px -30px rgba(91,63,228,0.7)' : '0 20px 40px -34px rgba(0,0,0,0.4)', transform: `scale(${q * (on ? 1.04 : 1)})`, opacity: q}}>
            <Img src={bf(p.f)} style={{width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: 18, display: 'block'}} />
            <div style={{fontFamily: FONT, fontSize: 26, fontWeight: 700, marginTop: 12}}>{p.n}</div>
            {on && <div style={{position: 'absolute', right: 22, top: 22, width: 52, height: 52, borderRadius: 99, background: ACCENT, display: 'grid', placeItems: 'center', transform: `scale(${sp(f - pick, 9)})`}}><Check s={30} c="#fff" /></div>}
            {i === 0 && <div style={{position: 'absolute', left: 22, top: 22, background: '#111', color: '#fff', fontFamily: FONT, fontWeight: 800, fontSize: 20, padding: '8px 14px', borderRadius: 999}}>BLACK FRIDAY</div>}
          </div>;
        })}
      </div>
    );
  }}</Scene>
);

// ---------- 5. acteur ----------
const Actor: React.FC = () => (
  <Scene k="actor" kicker="Étape 4 · Choisissez votre acteur" title="Des visages réalistes.">{(f) => {
    const cols = 8, rows = 6, gw = 104, gh = 116, gap = 12, pickI = 19;
    const all = ACTORS as {name: string; img: string}[]; const sol = all.find((x) => x.name === 'Solène')!;
    const list = all.filter((x) => x !== sol).slice(0, cols * rows - 1); list.splice(pickI, 0, sol);
    const pickAt = cue(5, 'visages', 2.0) - GS.actor;
    const on = f >= pickAt;
    const z = on ? interpolate(f, [pickAt, pickAt + 20], [1, 1.06], {...clamp}) : 1;
    return (
      <div style={{position: 'absolute', left: M, top: 400, display: 'grid', gridTemplateColumns: `repeat(${cols}, ${gw}px)`, gap, transform: `scale(${z})`, transformOrigin: '45% 45%'}}>
        {list.map((a, i) => {
          const q = sp(f - 2 - ((i % cols) + Math.floor(i / cols)) * 1.4, 12);
          const me = i === pickI && on;
          return <div key={a.img} style={{position: 'relative', width: gw, height: gh, borderRadius: 16, overflow: 'hidden', transform: `scale(${q * (me ? 1.18 : 1)})`, opacity: on && !me ? 0.55 : q, boxShadow: me ? `0 0 0 5px ${ACCENT}, 0 24px 50px -16px rgba(91,63,228,0.7)` : 'none', zIndex: me ? 2 : 1}}>
            <Img src={staticFile(`media/${a.img}`)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 30%'}} />
          </div>;
        })}
      </div>
    );
  }}</Scene>
);

// ---------- 6. vidéo prête ----------
const VideoReady: React.FC = () => (
  <Scene k="video" kicker="Étape 5 · Growthity crée" title="Acteur + produit : prête.">{(f) => {
    const ph = sp(f - 4, 13);
    const items: [string, string][] = [['script', 'Script écrit pour vous'], ['voix', 'Voix en français'], ['sous-titres', 'Sous-titres animés']];
    return (
      <>
        <div style={{position: 'absolute', left: M, top: 380, width: 400, height: 711, borderRadius: 50, padding: 12, background: '#16141A', boxShadow: '0 50px 90px -40px rgba(0,0,0,0.6)', transform: `scale(${0.7 + 0.3 * ph}) rotate(${(1 - ph) * -6}deg)`, opacity: ph}}>
          <div style={{position: 'relative', width: '100%', height: '100%', borderRadius: 40, overflow: 'hidden', background: '#000'}}>
            <Sequence from={GS.video} layout="none"><OffthreadVideo muted src={staticFile('media/chat/bougie-solene-raw.mp4')} startFrom={6} style={{width: '100%', height: '100%', objectFit: 'cover'}} /></Sequence>
            <div style={{position: 'absolute', left: 16, top: 18, background: '#111', color: '#fff', fontFamily: FONT, fontWeight: 800, fontSize: 18, padding: '7px 12px', borderRadius: 999}}>BLACK FRIDAY</div>
          </div>
        </div>
        <div style={{position: 'absolute', left: M + 440, right: M, top: 400, display: 'grid', gap: 16}}>
          {[{img: staticFile('media/actors-real/r079.jpg'), k: 'Actrice', v: 'Solène'}, {img: bf('p1.jpg'), k: 'Produit', v: 'Bougie Bois & Vanille'}].map((x, i) => { const q = sp(f - 10 - i * 5, 12); return (
            <div key={x.k} style={{display: 'flex', alignItems: 'center', gap: 16, background: '#fff', borderRadius: 24, padding: 14, border: `1px solid ${LINE}`, opacity: q, transform: `translateX(${(1 - q) * 40}px)`}}>
              <Img src={x.img} style={{width: 84, height: 84, borderRadius: 16, objectFit: 'cover'}} />
              <div><div style={{fontFamily: FONT, fontSize: 20, color: MUTED, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase'}}>{x.k}</div><div style={{fontFamily: FONT, fontSize: 27, fontWeight: 700}}>{x.v}</div></div>
            </div>); })}
          {items.map(([w, t]) => { const at = cue(6, w, 2) - GS.video; const q = sp(f - at, 11); return <div key={t} style={{display: 'flex', alignItems: 'center', gap: 12, fontFamily: FONT, fontSize: 29, fontWeight: 600, opacity: q, transform: `scale(${0.8 + 0.2 * q})`, transformOrigin: 'left center'}}><Check s={30} />{t}</div>; })}
          <div style={{marginTop: 6, textAlign: 'center', background: '#E8F7EE', color: '#15803D', fontFamily: FONT, fontWeight: 800, fontSize: 28, padding: '14px 0', borderRadius: 999, transform: `scale(${sp(f - (cue(6, 'sous-titres', 3) - GS.video) - 14, 10)})`}}>Vidéo prête</div>
        </div>
      </>
    );
  }}</Scene>
);

// ---------- 7. Meta Ads ----------
const MetaAds: React.FC = () => (
  <Scene k="meta" kicker="Étape 6 · Lancez" title="Directement sur Meta Ads.">{(f) => {
    const press = cue(7, 'instagram', 2.2) - GS.meta + 14;
    const down = f >= press && f < press + 6;
    const done = f >= press + 6;
    return (
      <>
        <Card style={{left: M, right: M, top: 410}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 22}}>
            <Brand k="meta" s={86} />
            <div style={{flex: 1}}><div style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 50}}>Meta Ads</div><div style={{fontFamily: FONT, fontSize: 28, color: MUTED, fontWeight: 500}}>Compte publicitaire connecté</div></div>
            <span style={{background: '#E8F7EE', color: '#15803D', fontFamily: FONT, fontWeight: 800, fontSize: 26, padding: '10px 20px', borderRadius: 999}}>Connecté</span>
          </div>
          <div style={{height: 1, background: LINE, margin: '26px 0'}} />
          {[['facebook', 'Facebook'], ['instagram', 'Instagram']].map(([k, n]) => { const at = cue(7, k, 1.5) - GS.meta; const q = sp(f - at, 11); return (
            <div key={k} style={{display: 'flex', alignItems: 'center', gap: 20, padding: '12px 0', opacity: 0.35 + 0.65 * q}}>
              <Brand k={k} s={58} /><div style={{flex: 1, fontFamily: FONT, fontSize: 36, fontWeight: 700}}>{n}<span style={{fontSize: 26, color: MUTED, fontWeight: 500, marginLeft: 14}}>Fil · Reels · Stories</span></div>
              <div style={{transform: `scale(${q})`}}><Check s={40} /></div>
            </div>); })}
          <div style={{marginTop: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, background: done ? OK : '#0866FF', color: '#fff', borderRadius: 22, padding: '26px 0', fontFamily: FONT, fontWeight: 800, fontSize: 38, transform: `scale(${down ? 0.95 : 1})`}}>
            {done ? <><Check s={42} c="#fff" />Publiée sur Meta</> : <><Brand k="meta" s={46} c="#fff" />Publier sur Meta</>}
          </div>
        </Card>
        <div style={{position: 'absolute', left: M, right: M, top: 1040, fontFamily: FONT, fontSize: 36, color: MUTED, opacity: sp(f - (cue(7, 'même', 3.0) - GS.meta), 12)}}>Pas de compte ? <b style={{color: INK}}>Vous êtes guidé de A à Z.</b></div>
      </>
    );
  }}</Scene>
);

// ---------- 8. performances (vrai : analyse + conseils) ----------
const Perf: React.FC = () => (
  <Scene k="perf" kicker="Étape 7 · Vos performances" title="Votre media buyer vous conseille.">{(f) => {
    const bars = [0.35, 0.42, 0.4, 0.55, 0.62, 0.6, 0.74, 0.82, 0.9];
    const tips: [string, string, string][] = [['🏆', 'Meilleure pub repérée', 'Solène · Bougie Bois & Vanille'], ['💡', 'Conseil', 'Tester une nouvelle accroche'], ['👉', 'À faire', 'Mettre plus de budget sur la meilleure pub']];
    return (
      <Card style={{left: M, right: M, top: 410}}>
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}><div style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 40}}>Campagne Black Friday</div><span style={{background: '#E8F7EE', color: '#15803D', fontFamily: FONT, fontWeight: 800, fontSize: 24, padding: '8px 16px', borderRadius: 999}}>● En diffusion</span></div>
        <div style={{display: 'flex', alignItems: 'flex-end', gap: 14, height: 210, marginTop: 26, padding: '0 6px', borderBottom: `2px solid ${LINE}`}}>
          {bars.map((h, i) => <div key={i} style={{flex: 1, height: `${h * 100 * sp(f - 4 - i * 2, 14)}%`, borderRadius: '12px 12px 4px 4px', background: i === bars.length - 1 ? GRAD : '#E7E2F8'}} />)}
        </div>
        <div style={{display: 'grid', gap: 2, marginTop: 18}}>
          {tips.map(([ic, t, d], i) => { const at = (i === 0 ? cue(8, 'analyse', 1.0) : cue(8, 'améliorer', 2.8)) - GS.perf + i * 8; const q = sp(f - at, 12); return <div key={t} style={{display: 'flex', alignItems: 'center', gap: 16, padding: '12px 0', fontFamily: FONT, fontSize: 29, opacity: q, transform: `translateX(${(1 - q) * 40}px)`}}><span style={{fontSize: 34}}>{ic}</span><b>{t}</b><span style={{color: MUTED}}>{d}</span></div>; })}
        </div>
      </Card>
    );
  }}</Scene>
);

// ---------- 9. réseaux sociaux ----------
const Social: React.FC = () => (
  <Scene k="social" kicker="Et en plus" title="Tous vos réseaux, au même endroit.">{(f) => {
    const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven'];
    const posts: [string, string, string][] = [['instagram', 'Reel', 'instagram'], ['facebook', 'Carrousel', 'instagram'], ['tiktok', 'Vidéo', 'tiktok'], ['youtube', 'Short', 'youtube'], ['linkedin', 'Post', 'linkedin']];
    return (
      <div style={{position: 'absolute', left: M, right: M, top: 420, display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14}}>
        {days.map((d, i) => { const [k, t, w] = posts[i]; const at = cue(9, w, 1.5 + i * 0.5) - GS.social; const q = sp(f - at, 11); return (
          <div key={d} style={{background: '#fff', borderRadius: 24, border: `1px solid ${LINE}`, padding: '18px 14px 22px', height: 330, boxShadow: '0 24px 50px -40px rgba(0,0,0,0.4)', opacity: sp(f - 2 - i * 2, 12)}}>
            <div style={{fontFamily: FONT, fontSize: 26, fontWeight: 700, color: MUTED}}>{d}</div>
            <div style={{marginTop: 18, borderRadius: 18, background: PAPER, padding: '20px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, transform: `scale(${q})`, opacity: q}}>
              <Brand k={k} s={58} /><div style={{fontFamily: FONT, fontSize: 24, fontWeight: 700}}>{t}</div><div style={{fontFamily: FONT, fontSize: 20, fontWeight: 800, color: '#15803D'}}>Programmé</div>
            </div>
          </div>); })}
      </div>
    );
  }}</Scene>
);

// ---------- 10. alertes WhatsApp ----------
const Wa: React.FC = () => (
  <Scene k="wa" kicker="Alertes WhatsApp" title="Prévenu dès qu’il faut agir.">{(f) => {
    const msgs: [string, string, string, string, string][] = [['lead', '🔔', 'Nouveau lead', 'Julie R. vient de demander un devis.', '09:12'], ['pub', '⚠️', 'Votre pub s’essouffle', 'Les clics baissent depuis hier : une nouvelle version est prête à valider.', '11:40']];
    return (
      <div style={{position: 'absolute', left: M, right: M, top: 400, borderRadius: 34, overflow: 'hidden', boxShadow: SH, border: `1px solid ${LINE}`}}>
        <div style={{background: '#075E54', color: '#fff', display: 'flex', alignItems: 'center', gap: 18, padding: '22px 28px', fontFamily: FONT}}>
          <div style={{width: 64, height: 64, borderRadius: 99, background: '#fff', display: 'grid', placeItems: 'center'}}><LogoMark size={40} /></div>
          <div style={{flex: 1}}><div style={{fontSize: 32, fontWeight: 700}}>Growthity</div><div style={{fontSize: 22, opacity: 0.8}}>Alertes de vos pubs</div></div>
          <Brand k="whatsapp" s={52} c="#fff" />
        </div>
        <div style={{background: '#ECE5DD', padding: '26px 24px 30px', display: 'flex', flexDirection: 'column', gap: 18, minHeight: 420}}>
          {msgs.map(([w, ic, t, d, tm], i) => { const at = cue(10, w, 2 + i) - GS.wa; const q = sp(f - at, 11); return f >= at - 1 ? (
            <div key={t} style={{alignSelf: 'flex-start', maxWidth: 820, background: '#fff', borderRadius: '6px 26px 26px 26px', padding: '20px 26px 14px', boxShadow: '0 2px 2px rgba(0,0,0,0.08)', fontFamily: FONT, transform: `scale(${0.8 + 0.2 * q})`, transformOrigin: 'left top', opacity: q}}>
              <div style={{fontSize: 32, fontWeight: 700, color: INK}}>{ic} {t}</div>
              <div style={{fontSize: 28, color: '#3B3A40', marginTop: 6, lineHeight: 1.35}}>{d}</div>
              <div style={{fontSize: 20, color: '#8A8F98', textAlign: 'right', marginTop: 4}}>{tm}</div>
            </div>) : null; })}
        </div>
      </div>
    );
  }}</Scene>
);

// ---------- 11. fin ----------
const End: React.FC = () => {
  const g = useCurrentFrame();
  if (g < GS.end - 2) return null;
  const f = g - GS.end;
  const a = sp(f - 4, 13), b = sp(f - (cue(11, 'à', 1.4) - GS.end), 13), url = sp(f - (cue(11, 'rendez', 2.4) - GS.end), 12);
  return (
    <AbsoluteFill style={{background: '#16141A'}}>
      <div style={{position: 'absolute', left: M, top: 150, display: 'flex', alignItems: 'center', gap: 16, opacity: a}}><div style={{width: 72, height: 72, borderRadius: 22, background: '#fff', display: 'grid', placeItems: 'center'}}><LogoMark size={46} draw={prog(f, 0, 20)} /></div><Wordmark size={48} dark /></div>
      <div style={{position: 'absolute', left: M, right: M, top: 330, fontFamily: DISPLAY, fontWeight: 700, fontSize: 118, lineHeight: 1.0, letterSpacing: '-0.03em', color: '#fff'}}>
        <div style={{opacity: a, transform: `translateY(${(1 - a) * 40}px)`}}>Votre prochaine pub est</div>
        <div style={{opacity: b, transform: `translateY(${(1 - b) * 40}px)`, color: '#B9A8FF'}}>à une phrase.</div>
      </div>
      <div style={{position: 'absolute', left: M, top: 800, display: 'inline-flex', alignItems: 'center', gap: 14, background: '#fff', color: INK, fontFamily: FONT, fontWeight: 800, fontSize: 46, padding: '24px 44px', borderRadius: 999, transform: `scale(${url})`, transformOrigin: 'left center', opacity: url}}>growthity.ai →</div>
    </AbsoluteFill>
  );
};

export const GoLive: React.FC = () => {
  useFonts();
  const g = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: PAPER, fontFamily: FONT, color: INK}}>
      <AbsoluteFill style={{background: `radial-gradient(900px 700px at ${50 + Math.sin(g / 60) * 10}% 30%, rgba(91,63,228,0.08), transparent 70%)`}} />
      <Intro /><Prompt /><Brandkit /><Product /><Actor /><VideoReady /><MetaAds /><Perf /><Social /><Wa /><End />
      {g < GS.end && <div style={{position: 'absolute', left: M, bottom: 50, display: 'flex', alignItems: 'center', gap: 10, fontFamily: FONT, fontWeight: 700, fontSize: 26, color: MUTED}}><LogoMark size={28} /> growthity.ai</div>}
      {g < GS.end && <div style={{position: 'absolute', right: M, bottom: 54, display: 'flex', gap: 6}}>{ORDER.slice(1, -1).map((k) => <div key={k} style={{width: 26, height: 6, borderRadius: 3, background: g >= GS[k] ? ACCENT : LINE}} />)}</div>}
      {g < GS.end && <Caps />}
      <Audio src={staticFile('golive/bed.wav')} />
      {Array.from({length: 11}, (_, i) => i + 1).map((k) => <Sequence key={k} from={VO[k]}><Audio src={staticFile(`voice/gl-${k}-n.mp3`)} /></Sequence>)}
    </AbsoluteFill>
  );
};
