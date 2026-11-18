// « Arrête d'acheter tes leads » — motion 16:9 pour les entreprises qui achètent leurs leads (exemple : pompe à chaleur).
// Problème (leads revendus, déjà appelés, injoignables) → bascule (tes propres leads, exclusifs) → pub (Alice) → formulaire
// qualifiant → campagne Prospects dans ta zone → leads en direct dans Growthity → « Montre-moi mes leads » → résultats + media buyer IA → fin.
// Aucun chiffre ni prix ; contacts et entreprise fictifs.
import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, continueRender, delayRender, interpolate, spring, staticFile, useCurrentFrame} from 'remotion';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/inter/800.css';
import '@fontsource/inter/900.css';
import {LogoMark, Wordmark} from '../components/UI';
import {EXPO, INOUT, prog} from '../components/anim';
import WORDS from './words_lb.json';

type Word = {w: string; s: number; e: number};
const WD = WORDS as unknown as Record<string, Word[]>;
const PAGE = '#F4F4F7', SURF = '#FFFFFF', RAISED = '#F7F7FA', SUNK = '#F1F1F5', LINE = '#E7E7EE', LINE2 = '#D7D7E1';
const FG = '#141418', MUTED = '#44444F', DIM = '#737381';
const ACC = '#5B3FE4', ACC_SOFT = '#F0ECFF', ACC_INK = '#4A2FCF', OK = '#137A45', OK_SOFT = '#E6F5EC', WARN = '#9A5205', WARN_SOFT = '#FFF4E2', META = '#0866FF';
const RED = '#D92D20', RED_SOFT = '#FDECEC';
const GRAD = 'linear-gradient(120deg, #2563EB 0%, #5B3FE4 52%, #9333EA 100%)';
const FONT = 'Inter, system-ui, sans-serif';
const SH = '0 1px 2px rgba(20,20,40,.04), 0 6px 20px rgba(20,20,40,.06)';
const SH_LG = '0 30px 80px -30px rgba(20,20,60,.35)';
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const sp = (f: number, d = 15, m = 0.8) => spring({frame: f, fps: 30, config: {damping: d, mass: m, stiffness: 160}});
const G: React.FC<{children: React.ReactNode}> = ({children}) => (
  <span style={{backgroundImage: GRAD, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent'}}>{children}</span>
);

export const VO = {1: 8, 2: 48, 3: 256, 4: 390, 5: 520, 6: 705, 7: 790, 8: 946, 9: 1145, 10: 1370} as Record<number, number>;
export const S = {hook: 0, prob: 44, turn: 250, pub: 385, form: 515, camp: 700, wa: 785, leads: 940, res: 1140, end: 1365, total: 1490};
const cue = (k: number, start: string, d = 0) => {
  const w = WD[`lb-${k}`].find((x) => x.w.toLowerCase().startsWith(start));
  return VO[k] + Math.round((w ? w.s : d) * 30);
};
export const BUYER = cue(9, 'et', 3.6);

const useFonts = () => {
  const [h] = useState(() => delayRender('fonts'));
  useEffect(() => {
    Promise.all(['500 20px Inter', '600 20px Inter', '700 20px Inter', '800 20px Inter', '900 20px Inter'].map((s) => document.fonts.load(s))).then(() => continueRender(h));
  }, [h]);
};

const Bg: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: PAGE}}>
      <AbsoluteFill style={{background: `radial-gradient(900px 700px at ${70 + Math.sin(f / 90) * 4}% 30%, rgba(91,63,228,0.10), transparent 70%)`}} />
      <AbsoluteFill style={{background: `radial-gradient(800px 700px at ${15 - Math.sin(f / 80) * 4}% 85%, rgba(37,99,235,0.07), transparent 70%)`}} />
      <AbsoluteFill style={{backgroundImage: 'radial-gradient(rgba(20,20,40,0.07) 1.3px, transparent 1.5px)', backgroundSize: '34px 34px', maskImage: 'radial-gradient(ellipse at 70% 50%, black 20%, transparent 75%)', WebkitMaskImage: 'radial-gradient(ellipse at 70% 50%, black 20%, transparent 75%)'}} />
    </AbsoluteFill>
  );
};

// ---------- colonne de texte à gauche ----------
const STEPS = ['La pub', 'Le formulaire', 'La campagne', 'En direct', 'Les leads', 'Les résultats'];
const Side: React.FC<{idx: number; label?: string; color?: string; start: number; end: number; a: React.ReactNode; b: React.ReactNode; sub: string; a2?: React.ReactNode; b2?: React.ReactNode; sub2?: string; swapAt?: number; red?: boolean}> = ({idx, label, color = ACC, start, end, a, b, sub, a2, b2, sub2, swapAt, red}) => {
  const f = useCurrentFrame();
  if (f < start - 2 || f > end + 2) return null;
  const i = prog(f, start, 18, EXPO), o = prog(f, end - 12, 12, INOUT);
  const sw = swapAt ? prog(f, swapAt, 14, INOUT) : 0;
  const p1 = sp(f - start - 4), p2 = sp(f - start - 10);
  const line = (txt: React.ReactNode, p: number, alt?: React.ReactNode) => (
    <div style={{overflow: 'hidden', paddingBottom: 8, position: 'relative'}}>
      <div style={{transform: `translateY(${(1 - p) * 110 - sw * 110}%)`, opacity: alt ? 1 - sw : 1}}>{txt}</div>
      {alt && <div style={{position: 'absolute', left: 0, top: 0, transform: `translateY(${(1 - sw) * 110}%)`}}>{alt}</div>}
    </div>
  );
  const em = (x: React.ReactNode) => (red ? <span style={{color: RED}}>{x}</span> : <G>{x}</G>);
  return (
    <div style={{position: 'absolute', left: 120, top: 0, width: 660, height: 1080, display: 'flex', flexDirection: 'column', justifyContent: 'center', opacity: i * (1 - o), transform: `translateY(${(1 - i) * 30 - o * 40}px)`}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 16, marginBottom: 30}}>
        <span style={{fontFamily: FONT, fontWeight: 800, fontSize: 22, letterSpacing: '0.16em', color}}>{label ?? `0${idx + 1} — ${STEPS[idx].toUpperCase()}`}</span>
        {idx >= 0 && <span style={{display: 'flex', gap: 6}}>{STEPS.map((_, k) => <span key={k} style={{width: k === idx ? 34 : 10, height: 10, borderRadius: 5, background: k <= idx ? ACC : LINE2}} />)}</span>}
      </div>
      <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 84, lineHeight: 1.02, letterSpacing: '-0.045em', color: FG}}>
        {line(a, p1, a2)}
        {line(em(b), p2, b2 ? em(b2) : undefined)}
      </div>
      <div style={{position: 'relative', marginTop: 26, fontFamily: FONT, fontWeight: 500, fontSize: 28, lineHeight: 1.45, color: MUTED, maxWidth: 600, minHeight: 82}}>
        <div style={{opacity: prog(f, start + 18, 14) * (1 - (sub2 ? sw : 0))}}>{sub}</div>
        {sub2 && <div style={{position: 'absolute', left: 0, top: 0, opacity: sw}}>{sub2}</div>}
      </div>
    </div>
  );
};

const Stage: React.FC<{start: number; end: number; children: React.ReactNode; top?: number; w?: number}> = ({start, end, children, top = 150, w = 920}) => {
  const f = useCurrentFrame();
  if (f < start - 2 || f > end + 2) return null;
  const i = sp(f - start - 2, 16), o = prog(f, end - 12, 12, INOUT);
  return (
    <div style={{position: 'absolute', left: 860, top, width: w, opacity: Math.min(1, i * 1.4) * (1 - o), transform: `translateX(${(1 - i) * 120 + o * -60}px) scale(${0.96 + 0.04 * i})`, filter: `blur(${o * 8}px)`}}>{children}</div>
  );
};
const Card: React.FC<{children: React.ReactNode; style?: React.CSSProperties}> = ({children, style}) => (
  <div style={{background: SURF, border: `1px solid ${LINE}`, borderRadius: 20, boxShadow: SH_LG, ...style}}>{children}</div>
);
const UserBubble: React.FC<{at: number; text: string}> = ({at, text}) => {
  const f = useCurrentFrame();
  const p = sp(f - at, 13);
  const n = Math.max(0, Math.floor((f - at) * 2));
  return (
    <div style={{display: 'flex', justifyContent: 'flex-end', opacity: Math.min(1, p * 1.5), transform: `translateY(${(1 - p) * 20}px)`}}>
      <div style={{maxWidth: 640, padding: '16px 22px', borderRadius: '20px 20px 6px 20px', background: SUNK, fontFamily: FONT, fontWeight: 500, fontSize: 25, lineHeight: 1.35, color: FG}}>{text.slice(0, n)}</div>
    </div>
  );
};
const Ai: React.FC<{children: React.ReactNode; at: number}> = ({children, at}) => {
  const f = useCurrentFrame();
  const p = sp(f - at, 14);
  if (f < at) return null;
  return (
    <div style={{display: 'flex', gap: 14, opacity: Math.min(1, p * 1.5), transform: `translateY(${(1 - p) * 24}px)`}}>
      <span style={{width: 44, height: 44, borderRadius: 13, background: ACC_SOFT, display: 'grid', placeItems: 'center', flex: 'none'}}><LogoMark size={26} /></span>
      <div style={{flex: 1, minWidth: 0}}>{children}</div>
    </div>
  );
};
const Typing: React.FC<{from: number; to: number; text: string}> = ({from, to, text}) => {
  const f = useCurrentFrame();
  if (f < from || f >= to) return null;
  return (
    <div style={{display: 'flex', gap: 14, alignItems: 'center'}}>
      <span style={{width: 44, height: 44, borderRadius: 13, background: ACC_SOFT, display: 'grid', placeItems: 'center'}}><LogoMark size={26} /></span>
      <span style={{display: 'flex', gap: 8}}>{[0, 1, 2].map((i) => <span key={i} style={{width: 12, height: 12, borderRadius: 6, background: '#A2A2AF', opacity: 0.5 + 0.5 * Math.sin(f / 3 + i)}} />)}</span>
      <span style={{fontFamily: FONT, fontSize: 22, color: DIM}}>{text}</span>
    </div>
  );
};

// ---------- 1. accroche + problème ----------
const BOUGHT = [
  {n: 'Lead pompe à chaleur', d: 'Maison · Gaz · Propriétaire'},
  {n: 'Lead pompe à chaleur', d: 'Maison · Fioul · Propriétaire'},
  {n: 'Lead pompe à chaleur', d: 'Appartement · Électrique'},
];
const STAMPS = [
  {t: 'Revendu à plusieurs installateurs', k: 'revendus', c: WARN, bg: WARN_SOFT},
  {t: 'Déjà appelé', k: 'déjà', c: WARN, bg: WARN_SOFT},
  {t: 'Numéro injoignable', k: 'numéros', c: RED, bg: RED_SOFT},
];
const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const a = sp(f - 4, 12), q = sp(f - cue(1, 'leads', 0.6) + 2, 9);
  const out = prog(f, S.prob, 14, INOUT);
  return (
    <AbsoluteFill style={{opacity: 1 - out, transform: `scale(${1 - out * 0.06})`, filter: `blur(${out * 10}px)`}}>
      {/* fond : catalogue de leads à vendre qui défile */}
      <div style={{position: 'absolute', inset: 0, opacity: 0.55}}>
        {Array.from({length: 14}, (_, i) => {
          const x = (i % 7) * 290 - 40 + (Math.floor(i / 7) % 2) * 140, y = 120 + Math.floor(i / 7) * 640 - f * 1.4;
          return (
            <div key={i} style={{position: 'absolute', left: x, top: y + (i % 3) * 60, width: 250, padding: 18, borderRadius: 16, background: SURF, border: `1px solid ${LINE}`, boxShadow: SH, fontFamily: FONT, filter: 'blur(1.5px)'}}>
              <div style={{fontWeight: 700, fontSize: 17, color: FG}}>Lead pompe à chaleur</div>
              <div style={{fontSize: 15, color: DIM, marginTop: 4}}>Maison · Propriétaire</div>
              <div style={{marginTop: 12, padding: '8px 0', borderRadius: 10, background: '#E8E8EE', textAlign: 'center', fontWeight: 700, fontSize: 15, color: MUTED}}>Acheter ce lead</div>
            </div>
          );
        })}
      </div>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 900px 420px at 50% 50%, rgba(244,244,247,0.97) 40%, rgba(244,244,247,0.6) 100%)'}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 330, textAlign: 'center', fontFamily: FONT, fontWeight: 900, letterSpacing: '-0.055em', lineHeight: 1.02, color: FG}}>
        <div style={{fontSize: 150, transform: `translateY(${(1 - a) * 60}px)`, opacity: a}}>Tu achètes encore</div>
        <div style={{fontSize: 150, transform: `translateY(${(1 - a) * 80}px) scale(${0.85 + 0.15 * q})`, opacity: a}}>tes <span style={{color: RED}}>leads</span><span style={{display: 'inline-block', transform: `rotate(${(1 - q) * 30}deg) scale(${q})`}}>&nbsp;?</span></div>
      </div>
    </AbsoluteFill>
  );
};

const BoughtCard: React.FC<{i: number}> = ({i}) => {
  const f = useCurrentFrame();
  const p = sp(f - S.prob - 6 - i * 5, 14);
  const pay = cue(2, 'paies', 5.3);
  return (
    <div style={{position: 'relative', padding: '22px 26px', borderRadius: 20, background: SURF, border: `1px solid ${LINE}`, boxShadow: SH_LG, fontFamily: FONT, opacity: Math.min(1, p * 1.4), transform: `translateX(${(1 - p) * 80}px) rotate(${(i - 1) * 0.6}deg)`}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 18}}>
        <div>
          <div style={{fontWeight: 800, fontSize: 26, color: FG}}>{BOUGHT[i].n}</div>
          <div style={{fontSize: 20, color: DIM, marginTop: 4}}>{BOUGHT[i].d}</div>
        </div>
        <div style={{display: 'flex'}}>
          {['#F59E0B', '#10B981', '#3B82F6', '#EC4899'].map((c, k) => <span key={c} style={{width: 40, height: 40, borderRadius: 20, background: c, border: '3px solid #fff', marginLeft: k ? -12 : 0, opacity: f >= cue(2, 'revendus', 0.7) ? 1 : 0, transform: `scale(${sp(f - cue(2, 'revendus', 0.7) - k * 3, 10)})`}} />)}
        </div>
      </div>
      <div style={{display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 14, maxWidth: 560}}>
        {STAMPS.map((s, k) => {
          const at = cue(2, s.k, 1 + k) + i * 3;
          if (f < at || (k === 2 && i === 1)) return null;
          const pp = sp(f - at, 9);
          return <span key={s.t} style={{padding: '8px 14px', borderRadius: 999, background: s.bg, color: s.c, fontWeight: 800, fontSize: 18, transform: `scale(${1.4 - 0.4 * pp})`, opacity: pp}}>{s.t}</span>;
        })}
      </div>
      {f >= pay + i * 3 && (
        <div style={{position: 'absolute', right: 26, top: '50%', marginTop: -30, padding: '10px 18px', border: `4px solid ${RED}`, borderRadius: 12, color: RED, fontWeight: 900, fontSize: 26, letterSpacing: '0.04em', background: 'rgba(255,255,255,.92)', transform: `rotate(-8deg) scale(${1.8 - 0.8 * sp(f - pay - i * 3, 10)})`}}>PAYÉ QUAND MÊME</div>
      )}
    </div>
  );
};
const Problem: React.FC = () => (
  <div style={{display: 'flex', flexDirection: 'column', gap: 22}}>{[0, 1, 2].map((i) => <BoughtCard key={i} i={i} />)}</div>
);

// ---------- 2. la bascule ----------
const Turn: React.FC = () => {
  const f = useCurrentFrame();
  const g = cue(3, 'génères', 0.9), ex = cue(3, 'exclusifs', 2.5), toi = cue(3, 'rien', 3.3);
  const a = sp(f - g + 4, 12), b = sp(f - ex + 2, 11), c = sp(f - toi + 2, 11);
  const l = sp(f - VO[3], 14);
  const out = prog(f, S.pub - 12, 12, INOUT);
  return (
    <AbsoluteFill style={{opacity: 1 - out, transform: `scale(${1 + out * 0.05})`}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 150, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 18, opacity: l, transform: `translateY(${(1 - l) * 20}px)`}}>
        <span style={{width: 70, height: 70, borderRadius: 20, background: SURF, border: `1px solid ${LINE}`, boxShadow: SH, display: 'grid', placeItems: 'center'}}><LogoMark size={44} /></span>
        <Wordmark size={52} />
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 290, textAlign: 'center', fontFamily: FONT, fontWeight: 900, letterSpacing: '-0.055em', lineHeight: 1.02, color: FG}}>
        <div style={{fontSize: 140, opacity: a, transform: `translateY(${(1 - a) * 50}px)`}}>Tes <G>propres</G> leads.</div>
        <div style={{fontSize: 96, marginTop: 14, display: 'flex', justifyContent: 'center', gap: 28}}>
          <span style={{opacity: b, transform: `translateY(${(1 - b) * 40}px)`}}>Exclusifs.</span>
          <span style={{opacity: c, transform: `translateY(${(1 - c) * 40}px)`, color: MUTED}}>Rien qu’à toi.</span>
        </div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 640, display: 'flex', justifyContent: 'center', gap: 26}}>
        {BOUGHT.map((l2, i) => {
          const p = sp(f - ex - 2 - i * 4, 13);
          return (
            <div key={i} style={{width: 420, padding: '22px 24px', borderRadius: 20, background: SURF, border: `2px solid ${f >= toi + i * 3 ? OK : LINE}`, boxShadow: SH_LG, fontFamily: FONT, opacity: Math.min(1, p * 1.4), transform: `translateY(${(1 - p) * 50}px)`}}>
              <div style={{fontWeight: 800, fontSize: 24, color: FG}}>{['Julien R.', 'Nadia K.', 'Philippe M.'][i]}</div>
              <div style={{fontSize: 19, color: DIM, marginTop: 4}}>{l2.d}</div>
              <div style={{display: 'flex', gap: 10, marginTop: 14}}>
                <span style={{padding: '7px 14px', borderRadius: 999, background: OK_SOFT, color: OK, fontWeight: 800, fontSize: 17}}>✓ Exclusif</span>
                {f >= toi + i * 3 && <span style={{padding: '7px 14px', borderRadius: 999, background: ACC_SOFT, color: ACC_INK, fontWeight: 800, fontSize: 17, transform: `scale(${sp(f - toi - i * 3, 10)})`}}>À toi seul</span>}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ---------- 3. la pub (Alice) ----------
const PubDemo: React.FC = () => {
  const f = useCurrentFrame();
  const ready = cue(4, 'crée', 1.6) - 4;
  const vid = prog(f, ready, 16);
  return (
    <Card style={{padding: 30}}>
      <UserBubble at={S.pub + 6} text={'J’installe des pompes à chaleur. Je veux mes propres leads, plus des leads achetés.'} />
      <div style={{height: 22}} />
      <Ai at={ready - 10}>
        <div style={{display: 'flex', gap: 22, alignItems: 'flex-start'}}>
          <div style={{width: 300, height: 533, borderRadius: 18, overflow: 'hidden', background: '#000', flex: 'none', transform: `scale(${0.9 + 0.1 * vid})`, opacity: vid}}>
            <Sequence from={ready} layout="none"><OffthreadVideo muted src={staticFile('media/chat/alice-edit.mp4')} style={{width: '100%', height: '100%', objectFit: 'cover'}} /></Sequence>
          </div>
          <div style={{display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 6}}>
            <span style={{alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderRadius: 999, background: OK_SOFT, color: OK, fontFamily: FONT, fontWeight: 700, fontSize: 20}}>● Prête</span>
            <div style={{fontFamily: FONT, fontWeight: 700, fontSize: 26, color: FG}}>Vidéo UGC verticale</div>
            {[['Actrice', 'Alice · réaliste'], ['Voix', 'Française'], ['Sous-titres', 'Animés'], ['Formats', '9:16 · 4:5 · 1:1']].map(([k, v], i) => {
              const p = sp(f - ready - 8 - i * 5, 13);
              return <div key={k} style={{display: 'flex', gap: 12, fontFamily: FONT, fontSize: 22, opacity: p, transform: `translateX(${(1 - p) * 30}px)`}}><span style={{width: 130, color: DIM}}>{k}</span><b style={{fontWeight: 600, color: FG}}>{v}</b></div>;
            })}
          </div>
        </div>
      </Ai>
    </Card>
  );
};

// ---------- 4. le formulaire qualifiant ----------
const FormDemo: React.FC = () => {
  const f = useCurrentFrame();
  const f0 = cue(5, 'formulaire', 0.9);
  const qs = [
    {l: 'Type de logement', o: ['Maison', 'Appartement'], at: cue(5, 'logement', 3.0) - 4, pick: 0},
    {l: 'Chauffage actuel', o: ['Gaz', 'Fioul', 'Électrique', 'Bois'], at: cue(5, 'chauffage', 3.9) - 4, pick: 1},
    {l: 'Propriétaire ?', o: ['Oui', 'Non'], at: cue(5, 'propriétaire', 4.9) - 4, pick: 0},
  ];
  return (
    <div style={{display: 'flex', gap: 28, alignItems: 'flex-start'}}>
      <Card style={{width: 480, padding: 0, overflow: 'hidden', borderRadius: 34}}>
        <div style={{height: 96, background: 'linear-gradient(135deg,#0F766E,#155E75)', position: 'relative'}}>
          <span style={{position: 'absolute', left: 24, bottom: -28, width: 64, height: 64, borderRadius: 32, background: '#F97316', border: '4px solid #fff', display: 'grid', placeItems: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 22, color: '#fff'}}>TH</span>
        </div>
        <div style={{padding: '36px 26px 24px'}}>
          <div style={{fontFamily: FONT, fontWeight: 700, fontSize: 19, color: DIM}}>Thermo Habitat</div>
          <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 28, color: FG, marginTop: 2}}>Ton étude pompe à chaleur</div>
          <div style={{marginTop: 14, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10}}>
            {['Nom complet', 'Téléphone', 'Code postal', 'E-mail'].map((l, i) => {
              const p = sp(f - f0 - 4 - i * 4, 13);
              return <div key={l} style={{opacity: p, transform: `translateY(${(1 - p) * 14}px)`}}><div style={{fontFamily: FONT, fontSize: 16, color: DIM, marginBottom: 4}}>{l}</div><div style={{height: 38, borderRadius: 10, border: `1px solid ${LINE2}`, background: RAISED}} /></div>;
            })}
          </div>
          <div style={{marginTop: 14, display: 'flex', flexDirection: 'column', gap: 12}}>
            {qs.map((qq) => {
              const p = sp(f - qq.at, 13);
              const on = f > qq.at + 12;
              return (
                <div key={qq.l} style={{opacity: p, transform: `translateY(${(1 - p) * 14}px)`}}>
                  <div style={{fontFamily: FONT, fontWeight: 700, fontSize: 19, color: FG, marginBottom: 7}}>{qq.l}</div>
                  <div style={{display: 'flex', flexWrap: 'wrap', gap: 8}}>
                    {qq.o.map((o, i) => <span key={o} style={{padding: '7px 14px', borderRadius: 999, border: `1.5px solid ${i === qq.pick && on ? META : LINE2}`, background: i === qq.pick && on ? '#E8F0FF' : SURF, fontFamily: FONT, fontWeight: 600, fontSize: 17, color: FG}}>{o}</span>)}
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{marginTop: 16, height: 48, borderRadius: 10, background: META, color: '#fff', display: 'grid', placeItems: 'center', fontFamily: FONT, fontWeight: 700, fontSize: 20}}>Envoyer</div>
        </div>
      </Card>
      <div style={{display: 'flex', flexDirection: 'column', gap: 14, paddingTop: 40}}>
        {[['Questions qui qualifient', qs[0].at], ['Code postal = ta zone', qs[1].at + 6], ['Seulement les propriétaires', qs[2].at + 8]].map(([t, a]) => {
          const p = sp(f - (a as number), 13);
          return <div key={t as string} style={{display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px', borderRadius: 16, background: SURF, border: `1px solid ${LINE}`, boxShadow: SH, opacity: p, transform: `translateX(${(1 - p) * 40}px)`, fontFamily: FONT, fontWeight: 700, fontSize: 22, color: FG, whiteSpace: 'nowrap'}}><span style={{width: 32, height: 32, borderRadius: 16, background: OK_SOFT, color: OK, display: 'grid', placeItems: 'center', fontSize: 18}}>✓</span>{t as string}</div>;
        })}
      </div>
    </div>
  );
};

// ---------- 5. la campagne dans ta zone ----------
const CampDemo: React.FC = () => {
  const f = useCurrentFrame();
  const zone = cue(6, 'zone', 2.2);
  const live = zone + 12;
  const z = sp(f - zone + 4, 12);
  return (
    <Card style={{padding: 32}}>
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
        <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 32, color: FG}}>Campagne de prospects</div>
        <span style={{padding: '8px 14px', borderRadius: 999, background: '#E8F0FF', color: META, fontFamily: FONT, fontWeight: 700, fontSize: 18}}>Meta Ads</span>
      </div>
      <div style={{marginTop: 20, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12}}>
        {[['Objectif', '✓ Prospects'], ['Formulaire', 'Étude PAC'], ['Créa', 'Vidéo Alice']].map(([k, v], i) => {
          const p = sp(f - S.camp - 6 - i * 4, 13);
          return <div key={k} style={{padding: '14px 16px', borderRadius: 14, background: i === 0 ? ACC_SOFT : RAISED, border: `1px solid ${i === 0 ? ACC : LINE}`, fontFamily: FONT, fontSize: 18, color: MUTED, opacity: p}}>{k}<br /><b style={{color: i === 0 ? ACC_INK : FG, fontSize: 22}}>{v}</b></div>;
        })}
      </div>
      <div style={{marginTop: 18, display: 'flex', gap: 18, alignItems: 'stretch'}}>
        <div style={{position: 'relative', width: 330, height: 200, borderRadius: 16, overflow: 'hidden', background: '#EAF1E6', border: `1px solid ${LINE}`}}>
          {/* mini carte */}
          <svg width="330" height="200" style={{position: 'absolute', inset: 0}}>
            <path d="M0 140 C 80 120, 140 170, 330 110" stroke="#C9D8F0" strokeWidth="14" fill="none" />
            <path d="M40 0 L 120 200 M 210 0 L 260 200 M 0 60 L 330 80" stroke="#FFFFFF" strokeWidth="6" fill="none" />
            <path d="M0 30 L 330 170" stroke="#FFFFFF" strokeWidth="4" fill="none" />
          </svg>
          <div style={{position: 'absolute', left: 165 - 80 * z, top: 100 - 80 * z, width: 160 * z, height: 160 * z, borderRadius: '50%', background: 'rgba(91,63,228,0.16)', border: `3px solid ${ACC}`}} />
          <div style={{position: 'absolute', left: 151, top: 72, fontSize: 30}}>📍</div>
        </div>
        <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: 12}}>
          <div style={{fontFamily: FONT, fontWeight: 700, fontSize: 18, letterSpacing: '0.08em', color: DIM}}>ZONE</div>
          <span style={{alignSelf: 'flex-start', padding: '12px 18px', borderRadius: 999, border: `1.5px solid ${f >= zone ? ACC : LINE}`, background: f >= zone ? ACC_SOFT : SURF, color: f >= zone ? ACC_INK : MUTED, fontFamily: FONT, fontWeight: 700, fontSize: 21}}>Ta zone d’intervention {f >= zone ? '✓' : ''}</span>
          <div style={{fontFamily: FONT, fontWeight: 700, fontSize: 18, letterSpacing: '0.08em', color: DIM, marginTop: 4}}>PLACEMENTS</div>
          <div style={{display: 'flex', gap: 10}}>
            {[['Facebook', '#1877F2'], ['Instagram', 'linear-gradient(45deg,#F59E0B,#EC4899,#8B5CF6)']].map(([n, c]) => <span key={n} style={{display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 999, border: `1.5px solid ${ACC}`, fontFamily: FONT, fontWeight: 700, fontSize: 19, color: FG}}><span style={{width: 16, height: 16, borderRadius: 8, background: c}} />{n} ✓</span>)}
          </div>
        </div>
      </div>
      <div style={{marginTop: 22, height: 64, borderRadius: 14, background: f >= live ? OK_SOFT : META, color: f >= live ? OK : '#fff', display: 'grid', placeItems: 'center', fontFamily: FONT, fontWeight: 800, fontSize: 26, transform: `scale(${f >= live - 4 && f < live ? 0.96 : 1})`}}>{f >= live ? '● Campagne active dans ta zone' : 'Publier sur Meta'}</div>
    </Card>
  );
};

// ---------- 6. les leads arrivent dans Growthity ----------
const InboxDemo: React.FC = () => {
  const f = useCurrentFrame();
  const call = cue(7, 'rappelles', 2.6);
  const excl = cue(7, 'personne', 3.6);
  const alerts = [
    {n: 'Julien R.', d: 'Maison · Fioul · Propriétaire', at: cue(7, 'lead', 0.5)},
    {n: 'Nadia K.', d: 'Maison · Gaz · Propriétaire', at: cue(7, 'direct', 1.4) + 6},
    {n: 'Philippe M.', d: 'Maison · Gaz · Propriétaire', at: cue(7, 'direct', 1.4) + 22},
  ];
  const nb = alerts.filter((a) => f >= a.at).length;
  const toast = alerts[0].at;
  const tp = sp(f - toast + 4, 12), tOut = prog(f, toast + 40, 12, INOUT);
  return (
    <div style={{position: 'relative'}}>
      <Card style={{padding: 0, overflow: 'hidden'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 14, padding: '20px 26px', borderBottom: `1px solid ${LINE}`, background: RAISED}}>
          <span style={{width: 46, height: 46, borderRadius: 13, background: ACC_SOFT, display: 'grid', placeItems: 'center'}}><LogoMark size={28} /></span>
          <div style={{fontFamily: FONT}}><div style={{fontWeight: 800, fontSize: 26, color: FG}}>Leads</div><div style={{fontSize: 17, color: DIM}}>Formulaire · Étude PAC</div></div>
          <span style={{marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderRadius: 999, background: OK_SOFT, color: OK, fontFamily: FONT, fontWeight: 700, fontSize: 17}}><span style={{width: 10, height: 10, borderRadius: 5, background: OK, opacity: 0.5 + 0.5 * Math.sin(f / 4)}} />En direct</span>
          <span style={{position: 'relative', width: 46, height: 46, borderRadius: 13, border: `1px solid ${LINE}`, background: SURF, display: 'grid', placeItems: 'center', fontSize: 22, transform: `rotate(${nb && f < toast + 14 ? Math.sin(f) * 12 : 0}deg)`}}>
            🔔{nb > 0 && <span style={{position: 'absolute', top: -8, right: -8, minWidth: 24, height: 24, borderRadius: 12, background: RED, color: '#fff', fontFamily: FONT, fontWeight: 800, fontSize: 14, display: 'grid', placeItems: 'center'}}>{nb}</span>}
          </span>
        </div>
        <div style={{padding: 22, display: 'flex', flexDirection: 'column', gap: 14, minHeight: 330}}>
          {alerts.map((al, i) => {
            const p = sp(f - al.at, 12);
            if (f < al.at) return null;
            const calling = i === 0 && f >= call;
            return (
              <div key={al.n} style={{display: 'flex', alignItems: 'center', gap: 16, padding: '16px 18px', borderRadius: 16, border: `1.5px solid ${calling ? ACC : LINE}`, background: i === nb - 1 && f < al.at + 20 ? ACC_SOFT : SURF, transform: `translateY(${(1 - p) * -30}px) scale(${0.94 + 0.06 * p})`, opacity: Math.min(1, p * 1.5), fontFamily: FONT}}>
                <span style={{width: 50, height: 50, borderRadius: 25, background: ['#F59E0B', '#10B981', '#3B82F6'][i], color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 20, flex: 'none'}}>{al.n[0]}</span>
                <div style={{flex: 1, minWidth: 0}}>
                  <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
                    <b style={{fontSize: 22, color: FG}}>{al.n}</b>
                    <span style={{padding: '3px 10px', borderRadius: 999, background: ACC_SOFT, color: ACC_INK, fontWeight: 800, fontSize: 14}}>Nouveau</span>
                    {i === 0 && f >= excl && <span style={{padding: '3px 10px', borderRadius: 999, background: OK_SOFT, color: OK, fontWeight: 800, fontSize: 14, transform: `scale(${sp(f - excl, 10)})`}}>✓ Exclusif</span>}
                  </div>
                  <div style={{fontSize: 19, color: DIM, marginTop: 4}}>{al.d}</div>
                </div>
                <span style={{padding: '10px 16px', borderRadius: 10, background: calling ? ACC : SURF, color: calling ? '#fff' : FG, border: `1px solid ${calling ? ACC : LINE2}`, fontWeight: 800, fontSize: 17, whiteSpace: 'nowrap', transform: `scale(${calling && f < call + 5 ? 0.92 : 1})`}}>{calling ? '📞 Appel en cours…' : 'Appeler'}</span>
              </div>
            );
          })}
        </div>
      </Card>
      {f >= toast - 4 && (
        <div style={{position: 'absolute', right: -10, top: -54, display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px', borderRadius: 16, background: FG, color: '#fff', fontFamily: FONT, fontWeight: 700, fontSize: 20, boxShadow: SH_LG, opacity: Math.min(1, tp * 1.4) * (1 - tOut), transform: `translateY(${(1 - tp) * -24}px)`}}>
          <LogoMark size={22} color="#fff" /> Nouveau lead · Julien R. vient de remplir ton formulaire
        </div>
      )}
    </div>
  );
};

// ---------- 7. « Montre-moi mes leads » ----------
const LEADS = [
  {n: 'Julien Roche', t: '06 12 48 •• ••', l: 'Maison', c: 'Fioul', bad: false},
  {n: 'Nadia Kaci', t: '06 77 21 •• ••', l: 'Maison', c: 'Gaz', bad: false},
  {n: 'Marc Lefèvre', t: '06 45 9', l: 'Maison', c: 'Électrique', bad: true},
  {n: 'Sophie Garnier', t: '07 81 30 •• ••', l: 'Maison', c: 'Fioul', bad: false},
  {n: 'Philippe Morel', t: '06 03 66 •• ••', l: 'Maison', c: 'Gaz', bad: false},
];
const LeadsTable: React.FC = () => {
  const f = useCurrentFrame();
  const ask = cue(8, 'montre', 2.1) - 10;
  const show = ask + 26;
  const filt = cue(8, 'filtr', 3.6);
  const flag = cue(8, 'numéros', 4.2);
  const exp = cue(8, 'export', 5.4);
  return (
    <Card style={{padding: 30}}>
      <UserBubble at={ask} text="Montre-moi mes leads" />
      <div style={{height: 20}} />
      <Typing from={ask + 12} to={show} text="Je récupère tes leads…" />
      <Ai at={show}>
        <div style={{border: `1px solid ${LINE}`, borderRadius: 16, overflow: 'hidden'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 10, padding: '14px 18px', background: RAISED, borderBottom: `1px solid ${LINE}`}}>
            <b style={{fontFamily: FONT, fontSize: 22, color: FG}}>Leads</b>
            <span style={{fontFamily: FONT, fontSize: 17, color: DIM}}>Formulaire :</span>
            {['Tous', 'Étude PAC', 'Entretien'].map((t, i) => {
              const on = f >= filt ? i === 1 : i === 0;
              return <span key={t} style={{padding: '6px 12px', borderRadius: 999, border: `1.5px solid ${on ? ACC : LINE}`, background: on ? ACC_SOFT : SURF, color: on ? ACC_INK : MUTED, fontFamily: FONT, fontWeight: 700, fontSize: 16, whiteSpace: 'nowrap'}}>{t}</span>;
            })}
            <span style={{marginLeft: 'auto', padding: '8px 14px', borderRadius: 10, background: f >= exp ? ACC : SURF, color: f >= exp ? '#fff' : FG, border: `1px solid ${f >= exp ? ACC : LINE2}`, fontFamily: FONT, fontWeight: 700, fontSize: 17, whiteSpace: 'nowrap', transform: `scale(${f >= exp && f < exp + 5 ? 0.94 : 1})`}}>↓ Exporter CSV</span>
          </div>
          <div style={{display: 'grid', gridTemplateColumns: '1.3fr 1.3fr 0.8fr 0.9fr', padding: '10px 18px', fontFamily: FONT, fontWeight: 700, fontSize: 16, letterSpacing: '0.04em', color: DIM, borderBottom: `1px solid ${LINE}`}}>
            <span>NOM</span><span>TÉLÉPHONE</span><span>LOGEMENT</span><span>CHAUFFAGE</span>
          </div>
          {LEADS.map((l, i) => {
            const p = sp(f - show - 6 - i * 4, 13);
            const bad = l.bad && f >= flag;
            return (
              <div key={l.n} style={{display: 'grid', gridTemplateColumns: '1.3fr 1.3fr 0.8fr 0.9fr', alignItems: 'center', padding: '12px 18px', fontFamily: FONT, fontSize: 19, color: FG, borderBottom: `1px solid ${LINE}`, background: bad ? WARN_SOFT : SURF, opacity: Math.min(1, p * 1.4), transform: `translateY(${(1 - p) * 12}px)`}}>
                <b style={{fontWeight: 600}}>{l.n}</b>
                <span style={{display: 'flex', alignItems: 'center', gap: 8, color: bad ? WARN : FG, fontWeight: bad ? 700 : 400}}>{l.t}{bad && <span style={{padding: '3px 8px', borderRadius: 999, background: '#FDE7C2', color: WARN, fontSize: 14, fontWeight: 800, transform: `scale(${sp(f - flag, 10)})`}}>⚠ douteux</span>}</span>
                <span style={{color: MUTED}}>{l.l}</span>
                <span style={{color: MUTED}}>{l.c}</span>
              </div>
            );
          })}
        </div>
        {f >= exp + 6 && <div style={{marginTop: 14, display: 'inline-flex', alignItems: 'center', gap: 10, padding: '10px 16px', borderRadius: 12, background: OK_SOFT, color: OK, fontFamily: FONT, fontWeight: 700, fontSize: 19, transform: `scale(${sp(f - exp - 6, 11)})`}}>✓ leads_etude-pac.csv téléchargé</div>}
      </Ai>
    </Card>
  );
};

// ---------- 8. résultats puis media buyer ----------
const ResDemo: React.FC = () => {
  const f = useCurrentFrame();
  const ask = VO[9] - 8;
  const show = cue(9, 'il', 1.4) - 4;
  const best = cue(9, 'meilleurs', 2.6);
  const ads = [
    {img: 'leads/pac-alice.jpg', n: 'Vidéo Alice · « J’avais froid »', q: 0.92, tag: 'Meilleurs leads', c: OK, bg: OK_SOFT},
    {img: 'leads/pac-awa.jpg', n: 'Vidéo Awa · Les aides', q: 0.56, tag: 'Correct', c: MUTED, bg: SUNK},
    {img: 'leads/pac-hugo.jpg', n: 'Vidéo Hugo · Le jardin', q: 0.24, tag: 'À couper', c: RED, bg: RED_SOFT},
  ];
  return (
    <Card style={{padding: 30}}>
      <UserBubble at={ask} text="Montre-moi les résultats" />
      <div style={{height: 20}} />
      <Ai at={show}>
        <div style={{fontFamily: FONT, fontWeight: 700, fontSize: 22, color: FG, marginBottom: 12}}>Qualité des leads par pub</div>
        <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
          {ads.map((a, i) => {
            const p = prog(f, show + 6 + i * 6, 22);
            return (
              <div key={a.n} style={{display: 'flex', alignItems: 'center', gap: 14, padding: 10, borderRadius: 14, border: `1.5px solid ${i === 0 && f >= best ? OK : LINE}`, background: SURF}}>
                <Img src={staticFile(a.img)} style={{width: 54, height: 72, borderRadius: 8, objectFit: 'cover'}} />
                <div style={{flex: 1}}>
                  <div style={{fontFamily: FONT, fontWeight: 700, fontSize: 20, color: FG}}>{a.n}</div>
                  <div style={{marginTop: 8, height: 10, borderRadius: 5, background: SUNK}}><div style={{width: `${a.q * 100 * p}%`, height: '100%', borderRadius: 5, background: i === 0 ? GRAD : i === 1 ? '#A2A2AF' : '#F87171'}} /></div>
                </div>
                <span style={{padding: '6px 12px', borderRadius: 999, background: a.bg, color: a.c, fontFamily: FONT, fontWeight: 800, fontSize: 16, opacity: prog(f, show + 20 + i * 6, 8)}}>{a.tag}</span>
              </div>
            );
          })}
        </div>
        {f >= best + 10 && (
          <div style={{marginTop: 16, padding: '16px 18px', borderRadius: 14, background: ACC_SOFT, fontFamily: FONT, fontSize: 21, lineHeight: 1.45, color: FG, opacity: prog(f, best + 10, 10)}}>
            La vidéo d’Alice t’apporte les leads les plus qualifiés. Je te propose de lui donner plus de budget et de couper la vidéo de Hugo.
            <div style={{display: 'flex', gap: 10, marginTop: 12}}>
              <span style={{padding: '10px 18px', borderRadius: 10, background: ACC, color: '#fff', fontWeight: 700, fontSize: 18}}>Appliquer</span>
              <span style={{padding: '10px 18px', borderRadius: 10, background: SURF, border: `1px solid ${LINE2}`, color: FG, fontWeight: 700, fontSize: 18}}>Voir le détail</span>
            </div>
          </div>
        )}
      </Ai>
    </Card>
  );
};
const BuyerDemo: React.FC = () => {
  const f = useCurrentFrame();
  const nuit = cue(9, 'nuit', 7.1);
  const night = prog(f, nuit - 4, 14, INOUT) > 0.5;
  const acts = ['Budget déplacé vers la vidéo d’Alice', 'Nouvelle version de la pub mise en test', 'Diffusion aux heures où tes prospects répondent'];
  return (
    <Card style={{padding: 32, background: night ? '#121025' : SURF, border: `1px solid ${night ? '#2A2560' : LINE}`}}>
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
          <span style={{width: 52, height: 52, borderRadius: 15, background: ACC_SOFT, display: 'grid', placeItems: 'center'}}><LogoMark size={30} /></span>
          <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 30, color: night ? '#fff' : FG}}>Media buyer IA</div>
        </div>
        <span style={{padding: '10px 18px', borderRadius: 999, background: night ? '#2A2560' : '#FEF3C7', color: night ? '#C7D2FE' : '#B45309', fontFamily: FONT, fontWeight: 800, fontSize: 20}}>{night ? '☾ Nuit' : '☀ Jour'}</span>
      </div>
      <div style={{marginTop: 22, display: 'flex', flexDirection: 'column', gap: 14}}>
        {acts.map((a, i) => {
          const p = sp(f - BUYER - 6 - i * 7, 13);
          return (
            <div key={a} style={{display: 'flex', alignItems: 'center', gap: 14, padding: '18px 20px', borderRadius: 16, background: night ? '#1A1740' : RAISED, opacity: Math.min(1, p * 1.4), transform: `translateX(${(1 - p) * 40}px)`}}>
              <span style={{width: 38, height: 38, borderRadius: 12, background: GRAD, color: '#fff', display: 'grid', placeItems: 'center', fontSize: 20, flex: 'none'}}>✓</span>
              <span style={{fontFamily: FONT, fontWeight: 600, fontSize: 23, color: night ? '#fff' : FG}}>{a}</span>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

// ---------- fin ----------
const End: React.FC = () => {
  const f = useCurrentFrame(); // local
  const L = (k: string, d: number) => cue(10, k, d) - S.end;
  const a = sp(f - L('arrête', 0) + 2, 12), b = sp(f - L('génère', 1.7) + 2, 12), logo = sp(f - L('avec', 2.6), 12), cta = sp(f - L('avec', 2.6) - 10, 13);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 0, right: 0, top: 250, textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 118, letterSpacing: '-0.055em', lineHeight: 1.04, color: FG}}>
        <div style={{opacity: a, transform: `translateY(${(1 - a) * 40}px)`}}>Arrête d’acheter tes leads.</div>
        <div style={{opacity: b, transform: `translateY(${(1 - b) * 40}px)`}}><G>Génère les tiens.</G></div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 580, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 18, opacity: logo, transform: `scale(${0.8 + 0.2 * logo})`}}>
        <div style={{width: 84, height: 84, borderRadius: 24, background: SURF, border: `1px solid ${LINE}`, boxShadow: SH, display: 'grid', placeItems: 'center'}}><LogoMark size={54} draw={prog(f, L('avec', 2.6), 18)} /></div>
        <Wordmark size={60} />
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 740, display: 'flex', justifyContent: 'center', opacity: Math.min(1, cta * 1.4), transform: `translateY(${(1 - cta) * 30}px)`}}>
        <div style={{position: 'relative'}}>
          <div style={{position: 'absolute', inset: -12, borderRadius: 99, background: GRAD, filter: 'blur(22px)', opacity: 0.5 + 0.2 * Math.sin(f / 6)}} />
          <div style={{position: 'relative', padding: '30px 72px', borderRadius: 99, background: FG, color: '#fff', fontFamily: FONT, fontWeight: 900, fontSize: 42}}>Commencer →</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const LeadsBuyVideo: React.FC = () => {
  useFonts();
  const f = useCurrentFrame();
  const flash = (at: number) => interpolate(f, [at - 2, at, at + 6], [0, 0.35, 0], clamp);
  return (
    <AbsoluteFill style={{background: PAGE, fontFamily: FONT}}>
      <Bg />
      {f < S.prob + 16 && <Hook />}
      <Side idx={-1} label="LES LEADS ACHETÉS" color={RED} red start={S.prob + 6} end={S.turn} a="Partagés." b="Et payés." sub="Revendus à d’autres installateurs, déjà appelés, injoignables… et facturés quand même." />
      <Stage start={S.prob + 6} end={S.turn} top={200}><Problem /></Stage>
      {f >= S.turn - 2 && f < S.pub + 2 && <Turn />}
      <Side idx={0} start={S.pub} end={S.form} a="Ta pub vidéo" b="en une phrase." sub="Growthity écrit le script, choisit une actrice réaliste et monte la vidéo." />
      <Stage start={S.pub} end={S.form} top={150}><PubDemo /></Stage>
      <Side idx={1} start={S.form} end={S.camp} a="Un formulaire" b="qui qualifie." sub="Logement, chauffage, propriétaire : tu ne reçois que des prospects sérieux." />
      <Stage start={S.form} end={S.camp} top={70}><FormDemo /></Stage>
      <Side idx={2} start={S.camp} end={S.wa} a="Ta campagne," b="dans ta zone." sub="Objectif Prospects, formulaire lié, sur Facebook et Instagram." />
      <Stage start={S.camp} end={S.wa} top={190}><CampDemo /></Stage>
      <Side idx={3} start={S.wa} end={S.leads} a="Tu rappelles" b="le premier." sub="Chaque lead arrive en direct dans Growthity. Personne d’autre ne l’a." />
      <Stage start={S.wa} end={S.leads} top={230}><InboxDemo /></Stage>
      <Side idx={4} start={S.leads} end={S.res} a="« Montre-moi" b="mes leads. »" a2="Filtrés, vérifiés," b2="exportables." swapAt={cue(8, 'filtr', 3.6) - 6} sub="Tous tes leads dans le chat, par formulaire." sub2="Numéros douteux signalés, export CSV en un clic." />
      <Stage start={S.leads} end={S.res} top={200}><LeadsTable /></Stage>
      <Side idx={5} start={S.res} end={S.end} a="« Montre-moi" b="les résultats. »" a2="Optimisé" b2="jour et nuit." swapAt={BUYER - 6} sub="Quelle pub t’apporte les meilleurs leads, et quoi faire ensuite." sub2="Le media buyer IA ajuste tes campagnes en continu." />
      <Stage start={S.res} end={BUYER} top={190}><ResDemo /></Stage>
      <Stage start={BUYER} end={S.end} top={300}><BuyerDemo /></Stage>
      <Sequence from={S.end}><End /></Sequence>
      <AbsoluteFill style={{background: '#fff', opacity: Math.max(flash(S.turn), flash(S.end)), pointerEvents: 'none'}} />
      <Audio src={staticFile('leads/bed-lb.wav')} />
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((k) => (
        <Sequence key={k} from={VO[k]}><Audio src={staticFile(`voice/lb-${k}-n.mp3`)} /></Sequence>
      ))}
    </AbsoluteFill>
  );
};
