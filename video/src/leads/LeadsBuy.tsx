// « Arrête d'acheter tes leads » — motion 16:9 pour les entreprises qui achètent leurs leads (exemple : pompe à chaleur).
// Accroche : l'outil Growthity à l'écran, une phrase tapée, les leads tombent (pas d'agence, pas de leads achetés) → pub (Alice) → formulaire
// qualifiant → campagne Prospects dans ta zone → leads en direct dans Growthity → « Montre-moi mes leads » → résultats + media buyer → fin.
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
import FRANCE from './france_deps.json';

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

export const VO = {4: 431, 5: 1015, 6: 1200, 7: 1313, 8: 1470, 9: 1673, 10: 1880} as Record<number, number>;
export const S = {hook: 0, spy: 266, pub: 426, big: 560, meta: 826, form: 1010, camp: 1195, wa: 1308, leads: 1465, res: 1668, end: 1875, total: 2004};
const BIG_AUDIO = S.big + 6, BIG_LEN = 245;
const VM = 831;
const VC = 271;
const cueC = (start: string, d = 0) => {
  const w = WD['lc-1'].find((x) => x.w.toLowerCase().startsWith(start));
  return VC + Math.round((w ? w.s : d) * 30);
};
// format vertical 9:16
export const VertCtx = React.createContext(false);
const cueM = (start: string, d = 0) => {
  const w = WD['lm-1'].find((x) => x.w.toLowerCase().startsWith(start));
  return VM + Math.round((w ? w.s : d) * 30);
};
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
const STEPS = ['Inspiration', 'La pub', 'Meta Ads', 'Le formulaire', 'La campagne', 'En direct', 'Les leads', 'Les résultats'];
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
  const v = React.useContext(VertCtx);
  return (
    <div style={{position: 'absolute', left: v ? 90 : 120, top: v ? 150 : 0, width: v ? 900 : 660, height: v ? 420 : 1080, display: 'flex', flexDirection: 'column', justifyContent: v ? 'flex-start' : 'center', opacity: i * (1 - o), transform: `translateY(${(1 - i) * 30 - o * 40}px)`}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 16, marginBottom: 30}}>
        <span style={{fontFamily: FONT, fontWeight: 800, fontSize: 22, letterSpacing: '0.16em', color}}>{label ?? `0${idx + 1} — ${STEPS[idx].toUpperCase()}`}</span>
        {idx >= 0 && <span style={{display: 'flex', gap: 6}}>{STEPS.map((_, k) => <span key={k} style={{width: k === idx ? 34 : 10, height: 10, borderRadius: 5, background: k <= idx ? ACC : LINE2}} />)}</span>}
      </div>
      <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 84, lineHeight: 1.02, letterSpacing: '-0.045em', color: FG}}>
        {line(a, p1, a2)}
        {line(em(b), p2, b2 ? em(b2) : undefined)}
      </div>
      <div style={{position: 'relative', marginTop: 26, fontFamily: FONT, fontWeight: 500, fontSize: v ? 32 : 28, lineHeight: 1.45, color: MUTED, maxWidth: v ? 860 : 600, minHeight: 82}}>
        <div style={{opacity: prog(f, start + 18, 14) * (1 - (sub2 ? sw : 0))}}>{sub}</div>
        {sub2 && <div style={{position: 'absolute', left: 0, top: 0, opacity: sw}}>{sub2}</div>}
      </div>
    </div>
  );
};

const Stage: React.FC<{start: number; end: number; children: React.ReactNode; top?: number; w?: number; left?: number; vtop?: number}> = ({start, end, children, top = 150, w = 920, left = 860, vtop = 600}) => {
  const f = useCurrentFrame();
  const v = React.useContext(VertCtx);
  if (f < start - 2 || f > end + 2) return null;
  const i = sp(f - start - 2, 16), o = prog(f, end - 12, 12, INOUT);
  const sc = v ? Math.min(1.02, 910 / w) : 1;
  return (
    <div style={{position: 'absolute', left: v ? 75 + (910 - w * sc) / 2 : left, top: v ? vtop : top, width: w, transformOrigin: 'top left', opacity: Math.min(1, i * 1.4) * (1 - o), transform: `translate${v ? 'Y' : 'X'}(${(1 - i) * 120 + o * -60}px) scale(${sc * (0.96 + 0.04 * i)})`, filter: `blur(${o * 8}px)`}}>{children}</div>
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

// ---------- 1. accroche : les leads tombent en direct, dès la première image ----------
const VOH = {1: 4, 2: 154} as Record<number, number>;
const cueH = (k: number, start: string, d = 0) => {
  const w = WD[`lh-${k}`].find((x) => x.w.toLowerCase().startsWith(start));
  return VOH[k] + Math.round((w ? w.s : d) * 30);
};
const FEED = [
  ['Julien R.', 'Maison · Fioul · Propriétaire', '#F59E0B'], ['Nadia K.', 'Maison · Gaz · Propriétaire', '#10B981'],
  ['Philippe M.', 'Maison · Gaz · Propriétaire', '#3B82F6'], ['Claire D.', 'Maison · Électrique · Propriétaire', '#EC4899'],
  ['Yannick B.', 'Maison · Fioul · Propriétaire', '#8B5CF6'], ['Samia T.', 'Maison · Gaz · Propriétaire', '#14B8A6'],
  ['Gérard L.', 'Maison · Fioul · Propriétaire', '#F97316'], ['Émilie P.', 'Maison · Bois · Propriétaire', '#6366F1'],
  ['Karim A.', 'Maison · Gaz · Propriétaire', '#0EA5E9'], ['Lucie V.', 'Maison · Électrique · Propriétaire', '#E11D48'],
];
const ARR = [64, 74, 84, 96, 108, 122, 138, 154, 172, 192];
const PROMPT = 'Je veux des leads pompe à chaleur dans ma zone.';
const SEND = 40;
// l'outil Growthity à l'écran dès la 1re image : on tape une phrase, la campagne part, les leads tombent
const Feed: React.FC = () => {
  const f = useCurrentFrame();
  const mine = cueH(2, 'outil', 3.1);
  const n = ARR.filter((a) => f >= a).length;
  const ROW = 96;
  const last = ARR[n - 1] ?? 0;
  const pn = sp(f - last, 16);
  const typed = PROMPT.slice(0, Math.max(0, Math.floor((f - 2) * 1.35)));
  const sent = f >= SEND;
  const bub = sp(f - SEND, 13), ai = sp(f - SEND - 10, 13);
  const nav = [['💬', 'Chat'], ['🎬', 'Pubs'], ['📣', 'Campagnes'], ['👥', 'Leads']];
  const leadsOn = f >= ARR[0];
  return (
    <div style={{position: 'relative'}}>
      <Card style={{padding: 0, overflow: 'hidden', borderRadius: 22}}>
        <div style={{height: 44, display: 'flex', alignItems: 'center', gap: 8, padding: '0 18px', background: '#EDEDF2', borderBottom: `1px solid ${LINE}`}}>
          {['#FF5F57', '#FEBC2E', '#28C840'].map((c) => <span key={c} style={{width: 13, height: 13, borderRadius: 7, background: c}} />)}
          <span style={{marginLeft: 18, flex: 1, maxWidth: 420, height: 28, borderRadius: 8, background: SURF, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, fontSize: 15, color: DIM}}>🔒 growthity.ai</span>
        </div>
        <div style={{display: 'flex', height: 640}}>
          <div style={{width: 190, borderRight: `1px solid ${LINE}`, background: RAISED, padding: '18px 12px', display: 'flex', flexDirection: 'column', gap: 6}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 8, padding: '0 8px 14px'}}><LogoMark size={24} /><span style={{fontFamily: FONT, fontWeight: 800, fontSize: 19, color: FG}}>Growthity</span></div>
            {nav.map(([ic, t], i) => {
              const on = i === 0 ? !leadsOn : i === 3 && leadsOn;
              return (
                <div key={t} style={{display: 'flex', alignItems: 'center', gap: 10, padding: '10px 10px', borderRadius: 10, background: on ? ACC_SOFT : 'transparent', color: on ? ACC_INK : MUTED, fontFamily: FONT, fontWeight: on ? 700 : 600, fontSize: 18}}>
                  <span style={{fontSize: 16}}>{ic}</span>{t}
                  {i === 3 && leadsOn && <span style={{marginLeft: 'auto', width: 10, height: 10, borderRadius: 5, background: RED}} />}
                </div>
              );
            })}
          </div>
          <div style={{flex: 1, position: 'relative', padding: 22, display: 'flex', flexDirection: 'column', gap: 14}}>
            {!sent && (
              <div style={{position: 'absolute', inset: 22, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 24}}>
                <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 34, color: FG, letterSpacing: '-0.02em'}}>Que veux-tu créer aujourd’hui ?</div>
                <div style={{width: '100%', padding: '18px 20px', borderRadius: 18, border: `1.5px solid ${ACC}`, background: SURF, boxShadow: SH, display: 'flex', alignItems: 'center', gap: 12}}>
                  <span style={{flex: 1, fontFamily: FONT, fontSize: 23, color: FG, minHeight: 30}}>{typed}<span style={{opacity: Math.floor(f / 8) % 2 ? 0 : 1, color: ACC}}>|</span></span>
                  <span style={{width: 44, height: 44, borderRadius: 22, background: typed.length === PROMPT.length ? ACC : LINE2, color: '#fff', display: 'grid', placeItems: 'center', fontSize: 22, fontWeight: 800}}>↑</span>
                </div>
              </div>
            )}
            {sent && (
              <>
                <div style={{display: 'flex', justifyContent: 'flex-end', opacity: bub, transform: `translateY(${(1 - bub) * 20}px)`}}>
                  <div style={{padding: '12px 18px', borderRadius: '18px 18px 6px 18px', background: SUNK, fontFamily: FONT, fontWeight: 500, fontSize: 21, color: FG}}>{PROMPT}</div>
                </div>
                <div style={{display: 'flex', alignItems: 'center', gap: 10, opacity: ai, transform: `translateY(${(1 - ai) * 16}px)`, flexWrap: 'nowrap'}}>
                  <span style={{width: 38, height: 38, borderRadius: 11, background: ACC_SOFT, display: 'grid', placeItems: 'center'}}><LogoMark size={22} /></span>
                  {['Pub vidéo', 'Formulaire', 'Campagne'].map((t, i) => <span key={t} style={{padding: '7px 12px', borderRadius: 999, background: OK_SOFT, color: OK, fontFamily: FONT, fontWeight: 800, fontSize: 16, opacity: prog(f, SEND + 12 + i * 4, 6)}}>✓ {t}</span>)}
                  <span style={{marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: FONT, fontWeight: 700, fontSize: 16, color: OK, opacity: prog(f, SEND + 24, 6)}}><span style={{width: 9, height: 9, borderRadius: 5, background: OK, opacity: 0.5 + 0.5 * Math.sin(f / 3)}} />En ligne</span>
                </div>
                <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 15, letterSpacing: '0.1em', color: DIM, marginTop: 4, opacity: leadsOn ? 1 : 0}}>TES LEADS · EN DIRECT</div>
                <div style={{position: 'relative', flex: 1, overflow: 'hidden'}}>
                  {FEED.slice(0, n).map(([nm, d, c], i) => {
                    const p = sp(f - ARR[i], 12);
                    const idx = n - 1 - i;
                    const y = (idx - 1 + pn) * ROW;
                    const ex = f >= mine + Math.min(idx, 5) * 2;
                    return (
                      <div key={nm} style={{position: 'absolute', left: 0, right: 0, top: y, height: ROW - 12, display: 'flex', alignItems: 'center', gap: 14, padding: '0 16px', borderRadius: 14, border: `1.5px solid ${ex ? OK : LINE}`, background: idx === 0 && f - ARR[i] < 14 ? ACC_SOFT : SURF, opacity: Math.min(1, p * 1.6) * (idx >= 4 ? 1 - pn : 1), transform: `scale(${0.94 + 0.06 * p})`, fontFamily: FONT}}>
                        <span style={{width: 46, height: 46, borderRadius: 23, background: c, color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 19, flex: 'none'}}>{nm[0]}</span>
                        <div style={{flex: 1, minWidth: 0}}>
                          <div style={{display: 'flex', alignItems: 'center', gap: 10}}><b style={{fontSize: 21, color: FG}}>{nm}</b><span style={{padding: '3px 10px', borderRadius: 999, background: ACC_SOFT, color: ACC_INK, fontWeight: 800, fontSize: 13}}>Nouveau</span></div>
                          <div style={{fontSize: 18, color: DIM, marginTop: 3}}>{d}</div>
                        </div>
                        {ex ? <span style={{padding: '8px 14px', borderRadius: 999, background: OK_SOFT, color: OK, fontWeight: 800, fontSize: 16, whiteSpace: 'nowrap', transform: `scale(${sp(f - mine - Math.min(idx, 5) * 2, 10)})`}}>✓ À toi</span>
                          : <span style={{padding: '9px 14px', borderRadius: 10, border: `1px solid ${LINE2}`, color: FG, fontWeight: 800, fontSize: 16}}>Appeler</span>}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </Card>
      {ARR.slice(0, 5).map((a, i) => {
        if (f < a || f > a + 14) return null;
        const tp = sp(f - a, 11), o = prog(f, a + 8, 6, INOUT);
        return (
          <div key={a} style={{position: 'absolute', right: -20, top: -64, display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px', borderRadius: 16, background: FG, color: '#fff', fontFamily: FONT, fontWeight: 700, fontSize: 21, boxShadow: SH_LG, opacity: Math.min(1, tp * 1.5) * (1 - o), transform: `translateY(${(1 - tp) * -30 - o * 20}px)`, whiteSpace: 'nowrap'}}>
            <LogoMark size={22} color="#fff" /> Nouveau lead · {FEED[i][0]} veut une étude
          </div>
        );
      })}
    </div>
  );
};
const HookSide: React.FC = () => {
  const f = useCurrentFrame();
  const a = sp(f, 13), b = sp(f - 5, 13);
  const o = prog(f, S.spy - 12, 12, INOUT);
  const v = React.useContext(VertCtx);
  const chips = [
    {t: 'Agence', at: cueH(2, "d'agence", 0.3), bad: true},
    {t: 'Leads achetés', at: cueH(2, 'achetés', 1.3), bad: true},
    {t: 'Ton outil', at: cueH(2, 'outil', 3.1), bad: false},
  ];
  return (
    <div style={{position: 'absolute', left: v ? 90 : 110, top: v ? 130 : 0, width: v ? 900 : 640, height: v ? 520 : 1080, display: 'flex', flexDirection: 'column', justifyContent: v ? 'flex-start' : 'center', opacity: 1 - o, transform: `translateY(${-o * 40}px)`}}>
      <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 22, letterSpacing: '0.16em', color: ACC, marginBottom: 26, opacity: a}}>ÇA Y EST</div>
      <div style={{fontFamily: FONT, fontWeight: 900, fontSize: v ? 96 : 104, lineHeight: 1, letterSpacing: '-0.05em', color: FG}}>
        <div style={{transform: `translateY(${(1 - a) * 60}px)`, opacity: a}}>Tes leads,</div>
        <div style={{transform: `translateY(${(1 - b) * 60}px)`, opacity: b}}><G>toi-même.</G></div>
      </div>
      <div style={{marginTop: v ? 16 : 22, fontFamily: FONT, fontWeight: 600, fontSize: 30, color: MUTED, opacity: prog(f, cueH(1, 'sans', 3.3), 10)}}>Sans compétences. En 2 minutes.</div>
      <div style={{marginTop: v ? 20 : 30, display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'flex-start', alignContent: 'flex-start', minHeight: v ? 60 : 140}}>
        {chips.map((c) => {
          if (f < c.at) return null;
          const p = sp(f - c.at, 12);
          const strike = prog(f, c.at + 5, 9);
          const col = c.bad ? RED : OK;
          return (
            <span key={c.t} style={{display: 'inline-flex', alignItems: 'center', gap: 12, height: 60, padding: '0 24px 0 12px', borderRadius: 30, background: c.bad ? RED_SOFT : OK_SOFT, border: `1.5px solid ${c.bad ? 'rgba(217,45,32,.18)' : 'rgba(19,122,69,.2)'}`, fontFamily: FONT, fontWeight: 800, fontSize: 28, lineHeight: 1, color: col, transform: `scale(${1.25 - 0.25 * p})`, opacity: Math.min(1, p * 1.5), whiteSpace: 'nowrap'}}>
              <span style={{width: 36, height: 36, borderRadius: 18, background: col, color: '#fff', display: 'grid', placeItems: 'center', fontSize: 20, fontWeight: 900}}>{c.bad ? '✕' : '✓'}</span>
              <span style={{position: 'relative', opacity: c.bad ? 1 - 0.35 * strike : 1}}>
                {c.t}
                {c.bad && <span style={{position: 'absolute', left: -4, right: -4, top: '52%', height: 4, marginTop: -2, borderRadius: 2, background: col, transform: `scaleX(${strike})`, transformOrigin: 'left'}} />}
              </span>
            </span>
          );
        })}
      </div>
    </div>
  );
};
// ---------- 2. s'inspirer des pubs des concurrents ----------
const SPY: {b: string; c: string; vid?: string; img?: string; head?: string}[] = [
  {b: 'ThermiConfort', img: 'leads/spy-sunset.jpg', head: 'Chauffe-toi autrement cet hiver', c: '#0EA5E9'},
  {b: 'Éco Chaleur', img: 'leads/spy-rge.jpg', c: '#10B981'},
  {b: 'Clim & Habitat', vid: 'media/ugc-pac-hugo.mp4', c: '#F97316'},
  {b: 'Rénov’Énergie', img: 'leads/spy-fioul.jpg', c: '#8B5CF6'},
];
const SpyDemo: React.FC = () => {
  const f = useCurrentFrame();
  const scan0 = S.spy + 6;
  const show = cueC('chercher', 1.9) + 4;
  const pick = cueC('concurrents', 3.6) + 10;
  const found = f >= show;
  return (
    <Card style={{padding: 26}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
        <span style={{width: 48, height: 48, borderRadius: 14, background: ACC_SOFT, display: 'grid', placeItems: 'center'}}><LogoMark size={28} /></span>
        <div style={{fontFamily: FONT}}><div style={{fontWeight: 800, fontSize: 28, color: FG}}>Pubs de tes concurrents</div><div style={{fontSize: 17, color: DIM}}>Growthity les trouve et les analyse pour toi</div></div>
        <span style={{marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderRadius: 999, background: '#E8F0FF', color: META, fontFamily: FONT, fontWeight: 700, fontSize: 16}}>Meta · Pompe à chaleur</span>
      </div>
      <div style={{marginTop: 16, position: 'relative', height: 54, borderRadius: 14, background: found ? OK_SOFT : ACC_SOFT, overflow: 'hidden', display: 'flex', alignItems: 'center', gap: 12, padding: '0 18px', fontFamily: FONT, fontSize: 21, fontWeight: 700, color: found ? OK : ACC_INK}}>
        {!found && <div style={{position: 'absolute', top: 0, bottom: 0, width: 220, left: `${((f - scan0) * 22) % 1100 - 220}px`, background: 'linear-gradient(90deg, transparent, rgba(91,63,228,.22), transparent)'}} />}
        <span style={{position: 'relative'}}>{found ? '✓ Pubs en diffusion trouvées dans ton domaine' : 'Growthity cherche les pubs de tes concurrents' + '.'.repeat(1 + (Math.floor(f / 6) % 3))}</span>
      </div>
      <div style={{marginTop: 16, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14}}>
        {SPY.map((a, i) => {
          const p = sp(f - show - i * 4, 13);
          const on = i === 0 && f >= pick;
          return (
            <div key={a.b} style={{position: 'relative', borderRadius: 16, border: `${on ? 2.5 : 1}px solid ${on ? ACC : LINE}`, background: SURF, overflow: 'hidden', opacity: Math.min(1, p * 1.5), transform: `translateY(${(1 - p) * 40}px) scale(${on ? 1 + 0.03 * sp(f - pick, 10) : 1})`, boxShadow: on ? '0 16px 40px -16px rgba(91,63,228,.5)' : SH, fontFamily: FONT}}>
              <div style={{display: 'flex', alignItems: 'center', gap: 8, padding: '10px 10px'}}>
                <span style={{width: 28, height: 28, borderRadius: 14, background: a.c, color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 13}}>{a.b[0]}</span>
                <div style={{minWidth: 0}}><div style={{fontWeight: 700, fontSize: 14, color: FG, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{a.b}</div><div style={{fontSize: 12, color: DIM}}>Sponsorisé</div></div>
              </div>
              <div style={{height: 300, background: '#000', overflow: 'hidden', position: 'relative'}}>
                {a.vid ? <Sequence from={show + i * 4} layout="none"><OffthreadVideo muted src={staticFile(a.vid)} style={{width: '100%', height: '100%', objectFit: 'cover'}} /></Sequence> : <div style={{position: 'relative', width: '100%', height: '100%'}}><Img src={staticFile(a.img!)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />{a.head && <div style={{position: 'absolute', left: 10, right: 10, top: 16, textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 24, lineHeight: 1.08, letterSpacing: '-0.02em', color: '#fff', textShadow: '0 2px 12px rgba(0,0,0,.45)'}}>{a.head}</div>}</div>}
                {f >= show + 10 + i * 4 && f < pick + 4 && <div style={{position: 'absolute', left: 0, right: 0, height: 3, top: `${((f - show - i * 4) * 9) % 300}px`, background: 'rgba(91,63,228,.85)', boxShadow: '0 0 14px rgba(91,63,228,.9)'}} />}
              </div>
              <div style={{padding: 10, display: 'flex', flexDirection: 'column', gap: 8}}>
                <span style={{display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: OK}}><span style={{width: 8, height: 8, borderRadius: 4, background: OK}} />En diffusion</span>
                <span style={{height: 36, borderRadius: 10, background: on ? ACC : SUNK, color: on ? '#fff' : DIM, display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 14, transform: `scale(${on && f < pick + 5 ? 0.94 : 1})`}}>{on ? '✓ Choisie par Growthity' : f >= pick ? 'Analysée' : 'Analyse…'}</span>
              </div>
            </div>
          );
        })}
      </div>
      {f >= pick + 8 && <div style={{marginTop: 16, display: 'inline-flex', alignItems: 'center', gap: 10, padding: '12px 18px', borderRadius: 12, background: ACC_SOFT, color: ACC_INK, fontFamily: FONT, fontWeight: 700, fontSize: 19, transform: `scale(${sp(f - pick - 8, 11)})`, transformOrigin: 'left center'}}><LogoMark size={20} /> Growthity s’en inspire pour ta pub : l’accroche, l’angle et le format</div>}
    </Card>
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
          <div style={{width: 300, height: 533, borderRadius: 18, overflow: 'hidden', background: '#000', flex: 'none', transform: `scale(${0.9 + 0.1 * vid})`, opacity: vid, position: 'relative'}}>
            <Sequence from={ready} layout="none"><OffthreadVideo muted src={staticFile('media/chat/alice-edit.mp4')} style={{width: '100%', height: '100%', objectFit: 'cover'}} /></Sequence>
            <div style={{position: 'absolute', left: 12, top: 12, display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px 5px 7px', borderRadius: 999, background: 'rgba(255,255,255,.82)', boxShadow: '0 2px 8px rgba(0,0,0,.18)'}}><LogoMark size={16} /><span style={{fontFamily: FONT, fontWeight: 800, fontSize: 13, color: FG}}>Growthity</span></div>
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

// ---------- la vidéo créée, en grand et avec le son ----------
const BigVideo: React.FC = () => {
  const f = useCurrentFrame();
  const v = React.useContext(VertCtx);
  if (f < S.big - 2 || f > S.meta + 2) return null;
  const inn = sp(f - S.big, 15, 0.9), out = prog(f, S.meta - 14, 14, INOUT);
  const bg = prog(f, S.big, 12) * (1 - out);
  const H = v ? 1280 : 960, W = H * 9 / 16;
  const top = v ? 140 : 60;
  const tag = sp(f - S.big - 14, 13);
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <AbsoluteFill style={{background: `rgba(244,244,247,${0.9 * bg})`, backdropFilter: `blur(${bg * 18}px)`}} />
      <AbsoluteFill style={{background: `radial-gradient(${W * 1.6}px ${H}px at 50% ${top + H / 2}px, rgba(91,63,228,${0.18 * bg}), transparent 70%)`}} />
      <div style={{position: 'absolute', left: '50%', top, width: W, height: H, marginLeft: -W / 2, borderRadius: 34, overflow: 'hidden', background: '#000', boxShadow: '0 50px 120px -40px rgba(20,20,60,.6), 0 0 0 8px rgba(255,255,255,.9)', opacity: Math.min(1, inn * 1.5) * (1 - out), transform: `translateY(${(1 - inn) * 80 + out * -40}px) scale(${(0.55 + 0.45 * inn) * (1 - out * 0.08)}) rotate(${(1 - inn) * -4}deg)`}}>
        <Sequence from={BIG_AUDIO} durationInFrames={BIG_LEN + 10} layout="none">
          <OffthreadVideo src={staticFile('media/chat/alice-edit.mp4')} volume={(fr) => interpolate(fr, [0, 4, BIG_LEN - 6, BIG_LEN], [0, 1, 1, 0], clamp)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
        </Sequence>
        <div style={{position: 'absolute', left: 22, top: 22, display: 'flex', alignItems: 'center', gap: 10, padding: '9px 16px 9px 11px', borderRadius: 999, background: 'rgba(255,255,255,.85)', boxShadow: '0 4px 16px rgba(0,0,0,.2)'}}>
          <LogoMark size={26} /><span style={{fontFamily: FONT, fontWeight: 800, fontSize: 21, color: FG}}>Growthity</span>
        </div>
      </div>
      <div style={{position: 'absolute', left: '50%', top: v ? top + H + 28 : top + 40, marginLeft: v ? -200 : W / 2 + 40, width: 400, display: 'flex', flexDirection: 'column', gap: 12, alignItems: v ? 'center' : 'flex-start', opacity: tag * (1 - out), transform: `translateX(${(1 - tag) * 30}px)`}}>
        {!v && (
          <>
            <span style={{padding: '10px 18px', borderRadius: 999, background: OK_SOFT, color: OK, fontFamily: FONT, fontWeight: 800, fontSize: 22}}>● Ta pub est prête</span>
            {['Actrice réaliste', 'Voix française', 'Sous-titres animés'].map((t, i) => <span key={t} style={{padding: '10px 18px', borderRadius: 999, background: SURF, border: `1px solid ${LINE}`, boxShadow: SH, fontFamily: FONT, fontWeight: 700, fontSize: 21, color: FG, opacity: prog(f, S.big + 22 + i * 6, 10)}}>✓ {t}</span>)}
          </>
        )}
      </div>
    </AbsoluteFill>
  );
};

// ---------- 3 bis. connexion Meta Ads, guidée de A à Z ----------
const MetaDemo: React.FC = () => {
  const f = useCurrentFrame();
  const click = cueM('connectes', 0.3) + 16;
  const noAcc = cueM('pas', 2.0) + 4;
  const guide = cueM('guidé', 4.1) - 6;
  const steps = ['Créer ton Business Manager', 'Créer ton compte publicitaire', 'Relier ta page Facebook et Instagram', 'Ajouter un moyen de paiement', 'C’est prêt : compte connecté'];
  const stepAt = (i: number) => guide + 6 + i * 9;
  const done = f >= stepAt(4) + 6;
  const g = sp(f - guide, 14);
  return (
    <Card style={{padding: 32}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
        <span style={{width: 56, height: 56, borderRadius: 16, background: '#E8F0FF', display: 'grid', placeItems: 'center'}}>
          <svg width="38" height="25" viewBox="0 0 34 22"><defs><linearGradient id="mg" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#0064E0" /><stop offset="1" stopColor="#0082FB" /></linearGradient></defs><path d="M31.50 11.00 L31.44 12.17 L31.26 13.31 L30.98 14.39 L30.60 15.38 L30.13 16.27 L29.59 17.03 L29.00 17.66 L28.37 18.17 L27.71 18.54 L27.05 18.79 L26.38 18.92 L25.72 18.94 L25.07 18.87 L24.44 18.72 L23.84 18.49 L23.25 18.20 L22.69 17.85 L22.15 17.46 L21.64 17.03 L21.14 16.56 L20.67 16.07 L20.21 15.55 L19.78 15.02 L19.35 14.47 L18.94 13.91 L18.54 13.34 L18.15 12.76 L17.76 12.17 L17.38 11.59 L17.00 11.00 L16.62 10.41 L16.24 9.83 L15.85 9.24 L15.46 8.66 L15.06 8.09 L14.65 7.53 L14.22 6.98 L13.79 6.45 L13.33 5.93 L12.86 5.44 L12.36 4.97 L11.85 4.54 L11.31 4.15 L10.75 3.80 L10.16 3.51 L9.56 3.28 L8.93 3.13 L8.28 3.06 L7.62 3.08 L6.95 3.21 L6.29 3.46 L5.63 3.83 L5.00 4.34 L4.41 4.97 L3.87 5.73 L3.40 6.62 L3.02 7.61 L2.74 8.69 L2.56 9.83 L2.50 11.00 L2.56 12.17 L2.74 13.31 L3.02 14.39 L3.40 15.38 L3.87 16.27 L4.41 17.03 L5.00 17.66 L5.63 18.17 L6.29 18.54 L6.95 18.79 L7.62 18.92 L8.28 18.94 L8.93 18.87 L9.56 18.72 L10.16 18.49 L10.75 18.20 L11.31 17.85 L11.85 17.46 L12.36 17.03 L12.86 16.56 L13.33 16.07 L13.79 15.55 L14.22 15.02 L14.65 14.47 L15.06 13.91 L15.46 13.34 L15.85 12.76 L16.24 12.17 L16.62 11.59 L17.00 11.00 L17.38 10.41 L17.76 9.83 L18.15 9.24 L18.54 8.66 L18.94 8.09 L19.35 7.53 L19.78 6.98 L20.21 6.45 L20.67 5.93 L21.14 5.44 L21.64 4.97 L22.15 4.54 L22.69 4.15 L23.25 3.80 L23.84 3.51 L24.44 3.28 L25.07 3.13 L25.72 3.06 L26.38 3.08 L27.05 3.21 L27.71 3.46 L28.37 3.83 L29.00 4.34 L29.59 4.97 L30.13 5.73 L30.60 6.62 L30.98 7.61 L31.26 8.69 L31.44 9.83 L31.50 11.00 Z" fill="none" stroke="url(#mg)" strokeWidth="3.2" strokeLinejoin="round" /></svg>
        </span>
        <div style={{fontFamily: FONT}}>
          <div style={{fontWeight: 800, fontSize: 30, color: FG}}>Connecte ton compte Meta Ads</div>
          <div style={{fontSize: 19, color: DIM, marginTop: 2}}>Pour publier tes pubs sur Facebook et Instagram</div>
        </div>
        {done && <span style={{marginLeft: 'auto', padding: '10px 16px', borderRadius: 999, background: OK_SOFT, color: OK, fontFamily: FONT, fontWeight: 800, fontSize: 19, transform: `scale(${sp(f - stepAt(4) - 6, 10)})`}}>● Connecté</span>}
      </div>
      <div style={{marginTop: 24, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14}}>
        <div style={{height: 64, borderRadius: 14, background: META, color: '#fff', display: 'grid', placeItems: 'center', fontFamily: FONT, fontWeight: 800, fontSize: 22, transform: `scale(${f >= click && f < click + 5 ? 0.95 : 1})`, boxShadow: f >= click && f < noAcc ? `0 0 0 5px rgba(8,102,255,.18)` : 'none'}}>Continuer avec Facebook</div>
        <div style={{height: 64, borderRadius: 14, border: `1.5px solid ${f >= noAcc ? ACC : LINE2}`, background: f >= noAcc ? ACC_SOFT : SURF, color: f >= noAcc ? ACC_INK : FG, display: 'grid', placeItems: 'center', fontFamily: FONT, fontWeight: 700, fontSize: 20, transform: `scale(${f >= noAcc && f < noAcc + 5 ? 0.95 : 1})`}}>Je n’ai pas de compte publicitaire</div>
      </div>
      <div style={{marginTop: 22, overflow: 'hidden', maxHeight: 470 * g, opacity: g}}>
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: FONT, marginBottom: 12}}>
          <b style={{fontSize: 22, color: FG}}>Guide pas à pas</b>
          <span style={{fontSize: 18, color: DIM, fontWeight: 600}}>de A à Z</span>
        </div>
        <div style={{height: 8, borderRadius: 4, background: SUNK, marginBottom: 16}}><div style={{height: '100%', borderRadius: 4, background: GRAD, width: `${Math.min(1, Math.max(0, (f - guide - 6) / (stepAt(4) - guide)) ) * 100}%`}} /></div>
        <div style={{display: 'flex', flexDirection: 'column', gap: 10}}>
          {steps.map((t, i) => {
            const ok = f >= stepAt(i) + 4;
            const cur = f >= stepAt(i) - 4 && !ok;
            return (
              <div key={t} style={{display: 'flex', alignItems: 'center', gap: 14, padding: '13px 16px', borderRadius: 14, border: `1px solid ${cur ? ACC : LINE}`, background: i === 4 && ok ? OK_SOFT : cur ? ACC_SOFT : SURF, fontFamily: FONT}}>
                <span style={{width: 32, height: 32, borderRadius: 16, display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 16, background: ok ? (i === 4 ? OK : ACC) : SUNK, color: ok ? '#fff' : DIM, transform: `scale(${ok ? sp(f - stepAt(i) - 4, 10) * 0.2 + 0.8 : 1})`}}>{ok ? '✓' : String.fromCharCode(65 + i)}</span>
                <span style={{fontWeight: 600, fontSize: 21, color: i === 4 && ok ? OK : FG}}>{t}</span>
                {!ok && i < 4 && <span style={{marginLeft: 'auto', fontSize: 16, color: DIM}}>Je te montre comment</span>}
              </div>
            );
          })}
        </div>
      </div>
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
const FR = FRANCE as unknown as {w: number; h: number; deps: {c: string; n: string; d: string; x: number; y: number}[]};
const ZONE_DEPS = ['69', '01', '38', '42', '71', '73', '74', '26', '07', '43', '63', '03'];
const CampDemo: React.FC = () => {
  const f = useCurrentFrame();
  const zone = cue(6, 'zone', 2.2);
  const fill0 = S.camp + 16;
  const fillAt = (i: number) => fill0 + i * 4;
  const live = Math.max(zone + 14, fillAt(ZONE_DEPS.length - 1) + 14);
  const MS = 1.0;
  const zm = prog(f, fillAt(ZONE_DEPS.length - 1) + 6, 28, INOUT);
  const lyon = FR.deps.find((d) => d.c === '69')!;
  const ring = prog(f, fill0 - 4, 30);
  return (
    <Card style={{padding: 30}}>
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
        <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 30, color: FG}}>Campagne de prospects</div>
        <div style={{display: 'flex', gap: 8}}>
          {[['✓ Prospects', true], ['Étude PAC', false], ['Vidéo Alice', false]].map(([t, on]) => <span key={t as string} style={{padding: '8px 14px', borderRadius: 999, background: on ? ACC_SOFT : RAISED, border: `1px solid ${on ? ACC : LINE}`, color: on ? ACC_INK : MUTED, fontFamily: FONT, fontWeight: 700, fontSize: 16}}>{t as string}</span>)}
        </div>
      </div>
      <div style={{marginTop: 18, display: 'flex', gap: 22}}>
        <div style={{position: 'relative', width: FR.w * MS + 20, height: FR.h * MS + 20, borderRadius: 18, background: RAISED, border: `1px solid ${LINE}`, padding: 10, boxSizing: 'border-box', flex: 'none', overflow: 'hidden'}}>
          <svg width={FR.w * MS} height={FR.h * MS} viewBox={`${lyon.x * 0.42 * zm} ${(lyon.y - 20) * 0.42 * zm} ${FR.w * (1 - 0.42 * zm)} ${FR.h * (1 - 0.42 * zm)}`} style={{borderRadius: 12}}>
            <defs>
              <linearGradient id="zg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#2563EB" /><stop offset="1" stopColor="#9333EA" /></linearGradient>
            </defs>
            {FR.deps.map((d) => {
              const i = ZONE_DEPS.indexOf(d.c);
              const p = i < 0 ? 0 : sp(f - fillAt(i), 12);
              return <path key={d.c} d={d.d} fill={i < 0 ? '#E3E3EC' : p > 0.02 ? 'url(#zg)' : '#E3E3EC'} fillOpacity={i < 0 ? 1 : 0.25 + 0.75 * p} stroke="#FFFFFF" strokeWidth={1.2} strokeLinejoin="round" />;
            })}
            {FR.deps.filter((d) => ZONE_DEPS.includes(d.c)).map((d) => {
              const p = sp(f - fillAt(ZONE_DEPS.indexOf(d.c)), 12);
              return <path key={'o' + d.c} d={d.d} fill="none" stroke="#FFFFFF" strokeWidth={2} opacity={p} />;
            })}
            <circle cx={lyon.x} cy={lyon.y} r={20 + ring * 110} fill="none" stroke={ACC} strokeWidth={3} opacity={(1 - ring) * 0.8} />
            <circle cx={lyon.x} cy={lyon.y} r={7} fill="#fff" stroke={ACC} strokeWidth={4} opacity={prog(f, fill0, 8)} />
          </svg>
          <span style={{position: 'absolute', left: 18, top: 16, padding: '6px 12px', borderRadius: 999, background: SURF, border: `1px solid ${LINE}`, fontFamily: FONT, fontWeight: 700, fontSize: 15, color: MUTED}}>France · départements</span>
        </div>
        <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: 12, minWidth: 0}}>
          <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 17, letterSpacing: '0.08em', color: DIM}}>TES DÉPARTEMENTS</div>
          <div style={{display: 'flex', flexWrap: 'wrap', gap: 8}}>
            {ZONE_DEPS.map((c, i) => {
              if (f < fillAt(i)) return null;
              const d = FR.deps.find((x) => x.c === c)!;
              const p = sp(f - fillAt(i), 11);
              return <span key={c} style={{padding: '7px 12px', borderRadius: 999, background: ACC_SOFT, color: ACC_INK, fontFamily: FONT, fontWeight: 700, fontSize: 16, transform: `scale(${0.6 + 0.4 * p})`, opacity: p}}><b>{c}</b> {d.n}</span>;
            })}
          </div>
          <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 17, letterSpacing: '0.08em', color: DIM, marginTop: 6}}>PLACEMENTS</div>
          <div style={{display: 'flex', gap: 8}}>
            {[['Facebook', '#1877F2'], ['Instagram', 'linear-gradient(45deg,#F59E0B,#EC4899,#8B5CF6)']].map(([n, c]) => <span key={n} style={{display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderRadius: 999, border: `1.5px solid ${ACC}`, fontFamily: FONT, fontWeight: 700, fontSize: 17, color: FG}}><span style={{width: 14, height: 14, borderRadius: 7, background: c}} />{n} ✓</span>)}
          </div>
          <div style={{marginTop: 'auto', height: 62, borderRadius: 14, background: f >= live ? OK_SOFT : META, color: f >= live ? OK : '#fff', display: 'grid', placeItems: 'center', fontFamily: FONT, fontWeight: 800, fontSize: 22, transform: `scale(${f >= live - 4 && f < live ? 0.96 : 1})`}}>{f >= live ? '● Active dans tes départements' : 'Publier sur Meta'}</div>
        </div>
      </div>
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
          <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 30, color: night ? '#fff' : FG}}>Ton media buyer</div>
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
  const v = React.useContext(VertCtx);
  return (
    <AbsoluteFill style={{transform: v ? 'translateY(170px)' : undefined}}>
      <div style={{position: 'absolute', left: v ? 60 : 0, right: v ? 60 : 0, top: v ? 200 : 250, textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: v ? 104 : 118, letterSpacing: '-0.055em', lineHeight: 1.04, color: FG}}>
        <div style={{opacity: a, transform: `translateY(${(1 - a) * 40}px)`}}>{v ? <>Arrête d’acheter<br />tes leads.</> : 'Arrête d’acheter tes leads.'}</div>
        <div style={{opacity: b, transform: `translateY(${(1 - b) * 40}px)`}}><G>Génère les tiens.</G></div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: v ? 690 : 580, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 18, opacity: logo, transform: `scale(${0.8 + 0.2 * logo})`}}>
        <div style={{width: 84, height: 84, borderRadius: 24, background: SURF, border: `1px solid ${LINE}`, boxShadow: SH, display: 'grid', placeItems: 'center'}}><LogoMark size={54} draw={prog(f, L('avec', 2.6), 18)} /></div>
        <Wordmark size={60} />
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: v ? 850 : 740, display: 'flex', justifyContent: 'center', opacity: Math.min(1, cta * 1.4), transform: `translateY(${(1 - cta) * 30}px)`}}>
        <div style={{position: 'relative'}}>
          <div style={{position: 'absolute', inset: -12, borderRadius: 99, background: GRAD, filter: 'blur(22px)', opacity: 0.5 + 0.2 * Math.sin(f / 6)}} />
          <div style={{position: 'relative', padding: '30px 72px', borderRadius: 99, background: FG, color: '#fff', fontFamily: FONT, fontWeight: 900, fontSize: 42}}>Commencer →</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const LeadsBuyVertical: React.FC = () => (
  <VertCtx.Provider value>
    <LeadsBuyVideo />
  </VertCtx.Provider>
);

export const LeadsBuyVideo: React.FC = () => {
  useFonts();
  const f = useCurrentFrame();
  const flash = (at: number) => interpolate(f, [at - 2, at, at + 6], [0, 0.35, 0], clamp);
  return (
    <AbsoluteFill style={{background: PAGE, fontFamily: FONT}}>
      <Bg />
      {f < S.spy + 2 && <HookSide />}
      <Stage start={0} end={S.spy} top={150} vtop={690}><Feed /></Stage>
      <Side idx={0} start={S.spy} end={S.pub} a="Growthity analyse" b="tes concurrents." sub="Growthity va chercher les pubs Meta qui tournent dans ton domaine, et s’en inspire." />
      <Stage start={S.spy} end={S.pub} top={170}><SpyDemo /></Stage>
      <Side idx={1} start={S.pub} end={S.meta} a="Ta pub vidéo" b="en une phrase." sub="Growthity écrit le script, choisit une actrice réaliste et monte la vidéo." />
      <Stage start={S.pub} end={S.meta} top={150}><PubDemo /></Stage>
      <BigVideo />
      <Side idx={2} start={S.meta} end={S.form} a="Meta Ads," b="guidé de A à Z." sub="Tu le connectes en un clic. Pas de compte ? Growthity t’accompagne étape par étape." />
      <Stage start={S.meta} end={S.form} top={150}><MetaDemo /></Stage>
      <Side idx={3} start={S.form} end={S.camp} a="Un formulaire" b="qui qualifie." sub="Logement, chauffage, propriétaire : tu ne reçois que des prospects sérieux." />
      <Stage start={S.form} end={S.camp} top={190} left={990}><FormDemo /></Stage>
      <Side idx={4} start={S.camp} end={S.wa} a="Ta campagne," b="dans ta zone." sub="Tu choisis tes départements : ta pub ne tourne que là où tu interviens." />
      <Stage start={S.camp} end={S.wa} top={190} w={960} left={840}><CampDemo /></Stage>
      <Side idx={5} start={S.wa} end={S.leads} a="Tu rappelles" b="le premier." sub="Chaque lead arrive en direct dans Growthity. Personne d’autre ne l’a." />
      <Stage start={S.wa} end={S.leads} top={230}><InboxDemo /></Stage>
      <Side idx={6} start={S.leads} end={S.res} a="« Montre-moi" b="mes leads. »" a2="Filtrés, vérifiés," b2="exportables." swapAt={cue(8, 'filtr', 3.6) - 6} sub="Tous tes leads dans le chat, par formulaire." sub2="Numéros douteux signalés, export CSV en un clic." />
      <Stage start={S.leads} end={S.res} top={200}><LeadsTable /></Stage>
      <Side idx={7} start={S.res} end={S.end} a="« Montre-moi" b="les résultats. »" a2="Optimisé" b2="jour et nuit." swapAt={BUYER - 6} sub="Quelle pub t’apporte les meilleurs leads, et quoi faire ensuite." sub2="Ton media buyer ajuste tes campagnes en continu." />
      <Stage start={S.res} end={BUYER} top={190}><ResDemo /></Stage>
      <Stage start={BUYER} end={S.end} top={300}><BuyerDemo /></Stage>
      <Sequence from={S.end}><End /></Sequence>
      <AbsoluteFill style={{background: '#fff', opacity: Math.max(flash(S.spy), flash(S.end)), pointerEvents: 'none'}} />
      <Audio src={staticFile('leads/bed-lb.wav')} />
      {[1, 2].map((k) => <Sequence key={`h${k}`} from={VOH[k]}><Audio src={staticFile(`voice/lh-${k}-n.mp3`)} /></Sequence>)}
      <Sequence from={VC}><Audio src={staticFile('voice/lc-1-n.mp3')} /></Sequence>
      <Sequence from={VM}><Audio src={staticFile('voice/lm-1-n.mp3')} /></Sequence>
      {[4, 5, 6, 7, 8, 9, 10].map((k) => (
        <Sequence key={k} from={VO[k]}><Audio src={staticFile(`voice/lb-${k}-n.mp3`)} /></Sequence>
      ))}
    </AbsoluteFill>
  );
};
