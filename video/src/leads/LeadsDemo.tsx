// « Des leads, pas des likes » — démo motion Growthity centrée sur la génération de leads (16:9, ~43 s, mode clair).
// Pub en une phrase → formulaire Meta qualifiant → campagne Prospects → alerte WhatsApp → « Montre-moi mes leads »
// (tableau, filtre par formulaire, numéro douteux signalé, export CSV) → « Montre-moi les résultats » → media buyer IA → fin.
// Aucun chiffre de résultat ; les contacts affichés sont fictifs.
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
import WORDS from './words.json';

type Word = {w: string; s: number; e: number};
const WD = WORDS as Record<string, Word[]>;
// jetons de la console Growthity (gx-app-theme.css)
const PAGE = '#F4F4F7', SURF = '#FFFFFF', RAISED = '#F7F7FA', SUNK = '#F1F1F5', LINE = '#E7E7EE', LINE2 = '#D7D7E1';
const FG = '#141418', MUTED = '#44444F', DIM = '#737381';
const ACC = '#5B3FE4', ACC_SOFT = '#F0ECFF', ACC_INK = '#4A2FCF', OK = '#137A45', OK_SOFT = '#E6F5EC', WARN = '#9A5205', WARN_SOFT = '#FFF4E2', META = '#0866FF';
const GRAD = 'linear-gradient(120deg, #2563EB 0%, #5B3FE4 52%, #9333EA 100%)';
const FONT = 'Inter, system-ui, sans-serif';
const SH = '0 1px 2px rgba(20,20,40,.04), 0 6px 20px rgba(20,20,40,.06)';
const SH_LG = '0 30px 80px -30px rgba(20,20,60,.35)';
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const sp = (f: number, d = 15, m = 0.8) => spring({frame: f, fps: 30, config: {damping: d, mass: m, stiffness: 160}});
const G: React.FC<{children: React.ReactNode}> = ({children}) => (
  <span style={{backgroundImage: GRAD, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent'}}>{children}</span>
);

export const VO = {1: 8, 2: 156, 3: 290, 4: 435, 5: 540, 6: 646, 7: 748, 8: 930, 9: 1075, 10: 1192} as Record<number, number>;
export const S = {hook: 0, pub: 150, form: 285, camp: 430, wa: 535, leads: 640, res: 925, buyer: 1070, end: 1185, total: 1300};
const cue = (k: number, start: string, d = 0) => {
  const w = WD[`ld-${k}`].find((x) => x.w.toLowerCase().startsWith(start));
  return VO[k] + Math.round((w ? w.s : d) * 30);
};

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

// ---------- habillage : colonne de texte à gauche ----------
const STEPS = ['La pub', 'Le formulaire', 'La campagne', 'Les alertes', 'Les leads', 'Les résultats', 'L’optimisation'];
const Side: React.FC<{idx: number; start: number; end: number; a: React.ReactNode; b: React.ReactNode; sub: string; a2?: React.ReactNode; b2?: React.ReactNode; swapAt?: number}> = ({idx, start, end, a, b, sub, a2, b2, swapAt}) => {
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
  return (
    <div style={{position: 'absolute', left: 120, top: 0, width: 640, height: 1080, display: 'flex', flexDirection: 'column', justifyContent: 'center', opacity: i * (1 - o), transform: `translateY(${(1 - i) * 30 - o * 40}px)`}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 16, marginBottom: 30}}>
        <span style={{fontFamily: FONT, fontWeight: 800, fontSize: 22, letterSpacing: '0.16em', color: ACC}}>0{idx + 1} — {STEPS[idx].toUpperCase()}</span>
        <span style={{display: 'flex', gap: 6}}>{STEPS.map((_, k) => <span key={k} style={{width: k === idx ? 34 : 10, height: 10, borderRadius: 5, background: k <= idx ? ACC : LINE2}} />)}</span>
      </div>
      <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 84, lineHeight: 1.02, letterSpacing: '-0.045em', color: FG}}>
        {line(a, p1, a2)}
        {line(<G>{b}</G>, p2, b2 ? <G>{b2}</G> : undefined)}
      </div>
      <div style={{marginTop: 26, fontFamily: FONT, fontWeight: 500, fontSize: 28, lineHeight: 1.45, color: MUTED, maxWidth: 600, opacity: prog(f, start + 18, 14)}}>{sub}</div>
    </div>
  );
};

// conteneur de la maquette à droite
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
  const n = Math.max(0, Math.floor((f - at) * 1.6));
  return (
    <div style={{display: 'flex', justifyContent: 'flex-end', opacity: Math.min(1, p * 1.5), transform: `translateY(${(1 - p) * 20}px)`}}>
      <div style={{maxWidth: 620, padding: '16px 22px', borderRadius: '20px 20px 6px 20px', background: SUNK, fontFamily: FONT, fontWeight: 500, fontSize: 26, color: FG}}>{text.slice(0, n)}</div>
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
const Typing: React.FC<{from: number; to: number}> = ({from, to}) => {
  const f = useCurrentFrame();
  if (f < from || f >= to) return null;
  return (
    <div style={{display: 'flex', gap: 14, alignItems: 'center'}}>
      <span style={{width: 44, height: 44, borderRadius: 13, background: ACC_SOFT, display: 'grid', placeItems: 'center'}}><LogoMark size={26} /></span>
      <span style={{display: 'flex', gap: 8}}>{[0, 1, 2].map((i) => <span key={i} style={{width: 12, height: 12, borderRadius: 6, background: '#A2A2AF', opacity: 0.5 + 0.5 * Math.sin(f / 3 + i)}} />)}</span>
      <span style={{fontFamily: FONT, fontSize: 22, color: DIM}}>Je récupère tes leads…</span>
    </div>
  );
};

// ---------- 1. accroche ----------
const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const a = sp(f - cue(1, 'des', 0.12) + 2, 12), b = sp(f - cue(1, 'pas', 0.98) + 2, 12);
  const strike = prog(f, cue(1, 'likes', 1.24) + 6, 10);
  const sub = prog(f, cue(1, 'voici', 1.98), 14);
  const out = prog(f, S.pub - 12, 12, INOUT);
  return (
    <AbsoluteFill style={{opacity: 1 - out, transform: `scale(${1 + out * 0.05})`}}>
      {/* cœurs (likes) qui flottent puis tombent, cartes de contact qui arrivent */}
      {Array.from({length: 10}, (_, i) => {
        const x = 200 + (i * 173) % 1550, y0 = 140 + ((i * 97) % 760);
        const fall = strike * (300 + i * 40);
        return <div key={i} style={{position: 'absolute', left: x, top: y0 + Math.sin(f / 15 + i) * 10 + fall, opacity: 0.5 * (1 - strike), fontSize: 46, color: '#F43F5E', transform: `rotate(${strike * (i % 2 ? 40 : -40)}deg)`}}>♥</div>;
      })}
      <div style={{position: 'absolute', left: 0, right: 0, top: 300, textAlign: 'center', fontFamily: FONT, fontWeight: 900, letterSpacing: '-0.055em', lineHeight: 1, color: FG}}>
        <div style={{fontSize: 170, transform: `translateY(${(1 - a) * 60}px)`, opacity: a}}>Des <G>leads.</G></div>
        <div style={{position: 'relative', display: 'inline-block', fontSize: 120, marginTop: 16, color: '#B9B7C6', transform: `translateY(${(1 - b) * 60}px)`, opacity: b}}>
          Pas des likes.
          <div style={{position: 'absolute', left: -10, right: -10, top: '55%', height: 12, borderRadius: 6, background: '#F43F5E', transform: `scaleX(${strike})`, transformOrigin: 'left center'}} />
        </div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 690, textAlign: 'center', fontFamily: FONT, fontWeight: 600, fontSize: 40, color: MUTED, opacity: sub, transform: `translateY(${(1 - sub) * 20}px)`}}>
        Tout ce que <b style={{color: FG}}>Growthity</b> fait pour remplir ton agenda.
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 790, display: 'flex', justifyContent: 'center', gap: 18}}>
        {['Pub vidéo', 'Formulaire', 'Campagne', 'Alertes WhatsApp', 'Tableau des leads', 'Résultats'].map((t, i) => {
          const p = sp(f - cue(1, 'voici', 1.98) - 6 - i * 4, 13);
          return <span key={t} style={{padding: '14px 24px', borderRadius: 999, background: SURF, border: `1px solid ${LINE}`, boxShadow: SH, fontFamily: FONT, fontWeight: 700, fontSize: 24, color: FG, opacity: p, transform: `translateY(${(1 - p) * 30}px)`}}>{t}</span>;
        })}
      </div>
    </AbsoluteFill>
  );
};

// ---------- 2. la pub ----------
const PubDemo: React.FC = () => {
  const f = useCurrentFrame();
  const ready = cue(2, 'crée', 1.78) - 4;
  const vid = prog(f, ready, 16);
  return (
    <Card style={{padding: 30}}>
      <UserBubble at={S.pub + 10} text={"Une pub pour remplir l’agenda de mon garage\u00A0: vidange, freins, pneus."} />
      <div style={{height: 22}} />
      <Ai at={ready - 10}>
        <div style={{display: 'flex', gap: 22, alignItems: 'flex-start'}}>
          <div style={{width: 300, height: 533, borderRadius: 18, overflow: 'hidden', background: '#000', flex: 'none', transform: `scale(${0.9 + 0.1 * vid})`, opacity: vid, position: 'relative'}}>
            <Sequence from={ready} layout="none"><OffthreadVideo muted src={staticFile('media/fal/social/out/pov_karim_apres.mp4')} startFrom={9} style={{width: '100%', height: '100%', objectFit: 'cover'}} /></Sequence>
            <div style={{position: 'absolute', left: 12, right: 12, bottom: 70, textAlign: 'center'}}><span style={{fontFamily: FONT, fontWeight: 900, fontSize: 28, color: '#fff', padding: '2px 10px', borderRadius: 8, background: GRAD}}>RDV EN 2 CLICS</span></div>
          </div>
          <div style={{display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 6}}>
            <span style={{alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderRadius: 999, background: OK_SOFT, color: OK, fontFamily: FONT, fontWeight: 700, fontSize: 20}}>● Prête</span>
            <div style={{fontFamily: FONT, fontWeight: 700, fontSize: 26, color: FG}}>Vidéo UGC verticale · 15 s</div>
            {[['Acteur', 'Karim · garagiste'], ['Voix', 'Française'], ['Sous-titres', 'Animés'], ['Formats', '9:16 · 4:5 · 1:1']].map(([k, v], i) => {
              const p = sp(f - ready - 8 - i * 5, 13);
              return <div key={k} style={{display: 'flex', gap: 12, fontFamily: FONT, fontSize: 22, opacity: p, transform: `translateX(${(1 - p) * 30}px)`}}><span style={{width: 130, color: DIM}}>{k}</span><b style={{fontWeight: 600, color: FG}}>{v}</b></div>;
            })}
          </div>
        </div>
      </Ai>
    </Card>
  );
};

// ---------- 3. le formulaire Meta ----------
const FormDemo: React.FC = () => {
  const f = useCurrentFrame();
  const q = cue(3, 'questions', 2.74);
  const fields = [
    {l: 'Nom complet', at: cue(3, 'formulaire', 0.7) + 6},
    {l: 'Téléphone', at: cue(3, 'formulaire', 0.7) + 12},
    {l: 'E-mail', at: cue(3, 'formulaire', 0.7) + 18},
  ];
  const qs = [
    {l: 'Quelle intervention ?', o: ['Vidange', 'Freins', 'Pneus', 'Autre'], at: q - 4, pick: 1},
    {l: 'Quand es-tu disponible ?', o: ['Cette semaine', 'Plus tard'], at: q + 10, pick: 0},
  ];
  const done = cue(3, 'prospects', 3.86) + 4;
  return (
    <div style={{display: 'flex', gap: 30, alignItems: 'flex-start'}}>
      <Card style={{width: 470, padding: 0, overflow: 'hidden', borderRadius: 34}}>
        <div style={{height: 120, background: 'linear-gradient(135deg,#1F2937,#374151)', position: 'relative'}}>
          <span style={{position: 'absolute', left: 24, bottom: -30, width: 70, height: 70, borderRadius: 35, background: '#F59E0B', border: '4px solid #fff', display: 'grid', placeItems: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 24, color: '#fff'}}>GM</span>
        </div>
        <div style={{padding: '42px 26px 26px'}}>
          <div style={{fontFamily: FONT, fontWeight: 700, fontSize: 20, color: DIM}}>Garage Martin</div>
          <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 30, color: FG, marginTop: 4}}>Prends rendez-vous</div>
          <div style={{marginTop: 18, display: 'flex', flexDirection: 'column', gap: 12}}>
            {fields.map((fl) => {
              const p = sp(f - fl.at, 13);
              return <div key={fl.l} style={{opacity: p, transform: `translateY(${(1 - p) * 14}px)`}}><div style={{fontFamily: FONT, fontSize: 17, color: DIM, marginBottom: 4}}>{fl.l}</div><div style={{height: 44, borderRadius: 10, border: `1px solid ${LINE2}`, background: RAISED}} /></div>;
            })}
            {qs.map((qq) => {
              const p = sp(f - qq.at, 13);
              return (
                <div key={qq.l} style={{opacity: p, transform: `translateY(${(1 - p) * 14}px)`}}>
                  <div style={{fontFamily: FONT, fontWeight: 700, fontSize: 19, color: FG, marginBottom: 8}}>{qq.l}</div>
                  <div style={{display: 'flex', flexWrap: 'wrap', gap: 8}}>
                    {qq.o.map((o, i) => <span key={o} style={{padding: '8px 14px', borderRadius: 999, border: `1.5px solid ${i === qq.pick && f > qq.at + 14 ? META : LINE2}`, background: i === qq.pick && f > qq.at + 14 ? '#E8F0FF' : SURF, fontFamily: FONT, fontWeight: 600, fontSize: 17, color: FG}}>{o}</span>)}
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{marginTop: 18, height: 50, borderRadius: 10, background: META, color: '#fff', display: 'grid', placeItems: 'center', fontFamily: FONT, fontWeight: 700, fontSize: 20}}>Envoyer</div>
        </div>
      </Card>
      <div style={{display: 'flex', flexDirection: 'column', gap: 14, paddingTop: 30}}>
        {[['Questions de qualification', q - 2], ['Écran de remerciement', q + 22], ['Lié à la campagne', done]].map(([t, a], i) => {
          const p = sp(f - (a as number), 13);
          return <div key={t as string} style={{display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px', borderRadius: 16, background: SURF, border: `1px solid ${LINE}`, boxShadow: SH, opacity: p, transform: `translateX(${(1 - p) * 40}px)`, fontFamily: FONT, fontWeight: 700, fontSize: 22, color: FG, whiteSpace: 'nowrap'}}><span style={{width: 32, height: 32, borderRadius: 16, background: OK_SOFT, color: OK, display: 'grid', placeItems: 'center', fontSize: 18}}>✓</span>{t as string}</div>;
        })}
        {f > done && <div style={{marginTop: 6, padding: '12px 18px', borderRadius: 999, alignSelf: 'flex-start', background: ACC_SOFT, color: ACC_INK, fontFamily: FONT, fontWeight: 700, fontSize: 20, transform: `scale(${sp(f - done, 10)})`}}>Formulaire « RDV Garage » créé</div>}
      </div>
    </div>
  );
};

// ---------- 4. la campagne ----------
const CampDemo: React.FC = () => {
  const f = useCurrentFrame();
  const fb = cue(4, 'facebook', 1.92), ig = cue(4, 'instagram', 2.52);
  const live = ig + 14;
  const objs = [['Ventes', false], ['Prospects', true], ['Trafic', false]] as const;
  return (
    <Card style={{padding: 34}}>
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
        <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 32, color: FG}}>Nouvelle campagne</div>
        <span style={{display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderRadius: 999, background: '#E8F0FF', color: META, fontFamily: FONT, fontWeight: 700, fontSize: 18}}>Meta Ads</span>
      </div>
      <div style={{marginTop: 24, fontFamily: FONT, fontWeight: 700, fontSize: 18, letterSpacing: '0.08em', color: DIM}}>OBJECTIF</div>
      <div style={{marginTop: 10, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14}}>
        {objs.map(([o, on], i) => {
          const sel = on && f > S.camp + 20;
          return <div key={o} style={{padding: '20px 18px', borderRadius: 16, border: `2px solid ${sel ? ACC : LINE}`, background: sel ? ACC_SOFT : SURF, fontFamily: FONT, fontWeight: 700, fontSize: 24, color: sel ? ACC_INK : MUTED, transform: `scale(${sel ? 1 + 0.03 * (1 - prog(f, S.camp + 20, 10)) : 1})`}}>{sel ? '✓ ' : ''}{o}</div>;
        })}
      </div>
      <div style={{marginTop: 22, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14}}>
        <div style={{padding: '16px 18px', borderRadius: 14, background: RAISED, border: `1px solid ${LINE}`, fontFamily: FONT, fontSize: 20, color: MUTED}}>Formulaire<br /><b style={{color: FG, fontSize: 22}}>RDV Garage</b></div>
        <div style={{padding: '16px 18px', borderRadius: 14, background: RAISED, border: `1px solid ${LINE}`, fontFamily: FONT, fontSize: 20, color: MUTED}}>Créa<br /><b style={{color: FG, fontSize: 22}}>Vidéo Karim · 9:16</b></div>
      </div>
      <div style={{marginTop: 22, fontFamily: FONT, fontWeight: 700, fontSize: 18, letterSpacing: '0.08em', color: DIM}}>PLACEMENTS</div>
      <div style={{marginTop: 10, display: 'flex', gap: 12}}>
        {[['Facebook', '#1877F2', fb], ['Instagram', 'linear-gradient(45deg,#F59E0B,#EC4899,#8B5CF6)', ig]].map(([n, c, a]) => {
          const p = sp(f - (a as number), 11);
          return <span key={n as string} style={{display: 'inline-flex', alignItems: 'center', gap: 10, padding: '12px 18px', borderRadius: 999, border: `1.5px solid ${f > (a as number) ? ACC : LINE}`, background: SURF, fontFamily: FONT, fontWeight: 700, fontSize: 22, color: FG, transform: `scale(${0.9 + 0.1 * p})`}}><span style={{width: 18, height: 18, borderRadius: 9, background: c as string}} />{n as string} {f > (a as number) ? '✓' : ''}</span>;
        })}
      </div>
      <div style={{marginTop: 28, height: 66, borderRadius: 14, background: f >= live ? OK_SOFT : META, color: f >= live ? OK : '#fff', display: 'grid', placeItems: 'center', fontFamily: FONT, fontWeight: 800, fontSize: 26, transform: `scale(${f >= live - 4 && f < live ? 0.96 : 1})`}}>{f >= live ? '● Campagne de prospects active' : 'Publier sur Meta'}</div>
    </Card>
  );
};

// ---------- 5. alertes WhatsApp ----------
const WaDemo: React.FC = () => {
  const f = useCurrentFrame();
  const alerts = [
    {n: 'Thomas D.', i: 'Freins', d: 'Cette semaine', at: cue(5, 'contact', 0.76) - 4},
    {n: 'Inès B.', i: 'Vidange', d: 'Cette semaine', at: cue(5, 'whatsapp', 2.48) - 2},
    {n: 'Marc L.', i: 'Pneus', d: 'Plus tard', at: cue(5, 'whatsapp', 2.48) + 16},
  ];
  return (
    <div style={{display: 'flex', justifyContent: 'center'}}>
      <div style={{width: 470, height: 740, borderRadius: 60, background: '#0B0B10', padding: 14, boxSizing: 'border-box', boxShadow: SH_LG}}>
        <div style={{width: '100%', height: '100%', borderRadius: 48, overflow: 'hidden', background: '#EFE7DE', position: 'relative'}}>
          <div style={{height: 110, background: '#075E54', display: 'flex', alignItems: 'flex-end', gap: 12, padding: '0 20px 16px'}}>
            <span style={{width: 48, height: 48, borderRadius: 24, background: '#fff', display: 'grid', placeItems: 'center'}}><LogoMark size={28} /></span>
            <div style={{fontFamily: FONT, color: '#fff'}}><div style={{fontWeight: 700, fontSize: 22}}>Growthity</div><div style={{fontSize: 16, opacity: 0.8}}>Alertes leads</div></div>
          </div>
          <div style={{padding: 18, display: 'flex', flexDirection: 'column', gap: 14}}>
            {alerts.map((al) => {
              const p = sp(f - al.at, 12);
              if (f < al.at) return null;
              return (
                <div key={al.n} style={{background: '#fff', borderRadius: '6px 18px 18px 18px', padding: '14px 16px', boxShadow: '0 1px 1px rgba(0,0,0,.08)', transform: `translateY(${(1 - p) * 30}px) scale(${0.9 + 0.1 * p})`, opacity: Math.min(1, p * 1.5), fontFamily: FONT}}>
                  <div style={{fontWeight: 800, fontSize: 19, color: '#128C7E'}}>Nouveau lead · RDV Garage</div>
                  <div style={{fontSize: 20, color: FG, marginTop: 6, lineHeight: 1.4}}><b>{al.n}</b> · {al.i} · {al.d}</div>
                  <div style={{display: 'flex', gap: 8, marginTop: 10}}>
                    <span style={{padding: '8px 14px', borderRadius: 10, background: '#E7F8EF', color: '#128C7E', fontWeight: 800, fontSize: 17}}>Appeler</span>
                    <span style={{padding: '8px 14px', borderRadius: 10, background: '#F3F4F6', color: '#4B5563', fontWeight: 700, fontSize: 17}}>Voir le lead</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

// ---------- 6-7. « Montre-moi mes leads » ----------
const LEADS = [
  {n: 'Thomas Dubois', t: '06 12 48 •• ••', e: 'thomas.d@…', i: 'Freins', bad: false},
  {n: 'Inès Benali', t: '06 77 21 •• ••', e: 'ines.b@…', i: 'Vidange', bad: false},
  {n: 'Marc Lefèvre', t: '06 45 9', e: 'marc.l@…', i: 'Pneus', bad: true},
  {n: 'Sophie Martin', t: '07 81 30 •• ••', e: 'sophie.m@…', i: 'Freins', bad: false},
  {n: 'Karim Haddad', t: '06 03 66 •• ••', e: 'karim.h@…', i: 'Vidange', bad: false},
];
const LeadsDemo: React.FC = () => {
  const f = useCurrentFrame();
  const ask = cue(6, 'montre', 2.28) - 8;
  const show = ask + 34;
  const filt = cue(7, 'filtrés', 0.86);
  const flag = cue(7, 'numéros', 2.44);
  const exp = cue(7, "l'export", 4.4);
  return (
    <Card style={{padding: 30}}>
      <UserBubble at={ask} text="Montre-moi mes leads" />
      <div style={{height: 20}} />
      <Typing from={ask + 14} to={show} />
      <Ai at={show}>
        <div style={{border: `1px solid ${LINE}`, borderRadius: 16, overflow: 'hidden'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 10, padding: '14px 18px', background: RAISED, borderBottom: `1px solid ${LINE}`}}>
            <b style={{fontFamily: FONT, fontSize: 22, color: FG}}>Leads</b>
            <span style={{fontFamily: FONT, fontSize: 18, color: DIM}}>Filtrer par formulaire :</span>
            {['Tous', 'RDV Garage', 'Devis pneus'].map((t, i) => {
              const on = f >= filt ? i === 1 : i === 0;
              return <span key={t} style={{padding: '6px 12px', borderRadius: 999, border: `1.5px solid ${on ? ACC : LINE}`, background: on ? ACC_SOFT : SURF, color: on ? ACC_INK : MUTED, fontFamily: FONT, fontWeight: 700, fontSize: 16}}>{t}</span>;
            })}
            <span style={{marginLeft: 'auto', padding: '8px 14px', borderRadius: 10, background: f >= exp ? ACC : SURF, color: f >= exp ? '#fff' : FG, border: `1px solid ${f >= exp ? ACC : LINE2}`, fontFamily: FONT, fontWeight: 700, fontSize: 17, transform: `scale(${f >= exp && f < exp + 5 ? 0.94 : 1})`}}>↓ Exporter en CSV</span>
          </div>
          <div style={{display: 'grid', gridTemplateColumns: '1.3fr 1.2fr 1.1fr 0.8fr', padding: '10px 18px', fontFamily: FONT, fontWeight: 700, fontSize: 16, letterSpacing: '0.04em', color: DIM, borderBottom: `1px solid ${LINE}`}}>
            <span>NOM</span><span>TÉLÉPHONE</span><span>E-MAIL</span><span>INTERVENTION</span>
          </div>
          {LEADS.map((l, i) => {
            const p = sp(f - show - 6 - i * 4, 13);
            const bad = l.bad && f >= flag;
            return (
              <div key={l.n} style={{display: 'grid', gridTemplateColumns: '1.3fr 1.2fr 1.1fr 0.8fr', alignItems: 'center', padding: '12px 18px', fontFamily: FONT, fontSize: 19, color: FG, borderBottom: `1px solid ${LINE}`, background: bad ? WARN_SOFT : SURF, opacity: Math.min(1, p * 1.4), transform: `translateY(${(1 - p) * 12}px)`}}>
                <b style={{fontWeight: 600}}>{l.n}</b>
                <span style={{display: 'flex', alignItems: 'center', gap: 8, color: bad ? WARN : FG, fontWeight: bad ? 700 : 400}}>{l.t}{bad && <span style={{padding: '3px 8px', borderRadius: 999, background: '#FDE7C2', color: WARN, fontSize: 14, fontWeight: 800, transform: `scale(${sp(f - flag, 10)})`}}>⚠ incomplet</span>}</span>
                <span style={{color: MUTED}}>{l.e}</span>
                <span style={{color: MUTED}}>{l.i}</span>
              </div>
            );
          })}
        </div>
        {f >= exp + 6 && <div style={{marginTop: 14, display: 'inline-flex', alignItems: 'center', gap: 10, padding: '10px 16px', borderRadius: 12, background: OK_SOFT, color: OK, fontFamily: FONT, fontWeight: 700, fontSize: 19, transform: `scale(${sp(f - exp - 6, 11)})`}}>✓ leads_rdv-garage.csv téléchargé</div>}
      </Ai>
    </Card>
  );
};

// ---------- 8. « Montre-moi les résultats » ----------
const ResDemo: React.FC = () => {
  const f = useCurrentFrame();
  const ask = VO[8] - 6;
  const show = cue(8, 'il', 1.34) - 4;
  const best = cue(8, 'meilleurs', 2.7);
  const next = cue(8, 'quoi', 3.6);
  const ads = [
    {img: 'leads/ad-a.jpg', n: 'Vidéo Karim · UGC', q: 0.92, tag: 'Meilleurs leads', c: OK, bg: OK_SOFT},
    {img: 'leads/ad-b.jpg', n: 'Vidéo B · Témoignage', q: 0.58, tag: 'Correct', c: MUTED, bg: SUNK},
    {img: 'leads/ad-c.jpg', n: 'Vidéo C · Promo', q: 0.24, tag: 'À couper', c: '#C02B2B', bg: '#FDECEC'},
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
              <div key={a.n} style={{display: 'flex', alignItems: 'center', gap: 14, padding: 10, borderRadius: 14, border: `1px solid ${i === 0 && f >= best ? OK : LINE}`, background: SURF}}>
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
        {f >= next - 6 && (
          <div style={{marginTop: 16, padding: '16px 18px', borderRadius: 14, background: ACC_SOFT, fontFamily: FONT, fontSize: 21, lineHeight: 1.45, color: FG, opacity: prog(f, next - 6, 10)}}>
            La vidéo avec Karim t’apporte les leads les plus qualifiés. Je te propose de lui donner plus de budget et de couper la vidéo C.
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

// ---------- 9. media buyer IA ----------
const BuyerDemo: React.FC = () => {
  const f = useCurrentFrame();
  const nuit = cue(9, 'nuit', 3.06);
  const night = prog(f, nuit - 4, 14, INOUT) > 0.5;
  const acts = ['Budget déplacé vers la pub qui apporte les meilleurs leads', 'Nouvelle version de la pub mise en test', 'Diffusion aux heures où tes clients répondent'];
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
          const p = sp(f - S.buyer - 12 - i * 10, 13);
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
  const w = WD['ld-10'];
  const plus = VO[10] - S.end + Math.round((w.find((x) => x.w.toLowerCase().startsWith('plus'))?.s ?? 1.04) * 30);
  const moins = VO[10] - S.end + Math.round((w.find((x) => x.w.toLowerCase().startsWith('moins'))?.s ?? 1.84) * 30);
  const logo = sp(f - 2), a = sp(f - plus + 2, 12), b = sp(f - moins + 2, 12), cta = sp(f - moins - 14, 13);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 960, top: 250, transform: `translate(-50%,-50%) scale(${logo})`, display: 'flex', alignItems: 'center', gap: 20}}>
        <div style={{width: 100, height: 100, borderRadius: 30, background: SURF, border: `1px solid ${LINE}`, boxShadow: SH, display: 'grid', placeItems: 'center'}}><LogoMark size={64} draw={prog(f, 2, 18)} /></div>
        <Wordmark size={70} />
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 380, textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 130, letterSpacing: '-0.055em', lineHeight: 1.02, color: FG}}>
        <div style={{opacity: a, transform: `translateY(${(1 - a) * 40}px)`}}>Plus de <G>leads.</G></div>
        <div style={{opacity: b, transform: `translateY(${(1 - b) * 40}px)`}}>Moins d’efforts.</div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 740, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22, opacity: Math.min(1, cta * 1.4), transform: `translateY(${(1 - cta) * 30}px)`}}>
        <div style={{position: 'relative'}}>
          <div style={{position: 'absolute', inset: -12, borderRadius: 99, background: GRAD, filter: 'blur(22px)', opacity: 0.5 + 0.2 * Math.sin(f / 6)}} />
          <div style={{position: 'relative', padding: '30px 72px', borderRadius: 99, background: FG, color: '#fff', fontFamily: FONT, fontWeight: 900, fontSize: 42}}>Commencer →</div>
        </div>
        <div style={{fontFamily: FONT, fontWeight: 700, fontSize: 28, color: DIM}}>growthity.ai</div>
      </div>
    </AbsoluteFill>
  );
};

export const LeadsDemoVideo: React.FC = () => {
  useFonts();
  const f = useCurrentFrame();
  const flash = (at: number) => interpolate(f, [at - 2, at, at + 6], [0, 0.35, 0], clamp);
  return (
    <AbsoluteFill style={{background: PAGE, fontFamily: FONT}}>
      <Bg />
      {f < S.pub + 2 && <Hook />}
      <Side idx={0} start={S.pub} end={S.form} a="Une pub vidéo" b="en une phrase." sub="Growthity écrit le script, choisit un acteur réaliste et monte la vidéo." />
      <Stage start={S.pub} end={S.form} top={170}><PubDemo /></Stage>
      <Side idx={1} start={S.form} end={S.camp} a="Un formulaire" b="qui qualifie." sub="Le formulaire de contact Meta, avec les questions qui trient tes prospects." />
      <Stage start={S.form} end={S.camp} top={120}><FormDemo /></Stage>
      <Side idx={2} start={S.camp} end={S.wa} a="Ta campagne" b="de prospects." sub="Objectif Prospects, formulaire lié, publiée sur Facebook et Instagram." />
      <Stage start={S.camp} end={S.wa} top={190}><CampDemo /></Stage>
      <Side idx={3} start={S.wa} end={S.leads} a="Chaque lead," b="sur WhatsApp." sub="Une alerte à chaque nouveau contact, pour rappeler pendant que c’est chaud." />
      <Stage start={S.wa} end={S.leads} top={170}><WaDemo /></Stage>
      <Side idx={4} start={S.leads} end={S.res} a="« Montre-moi" b="mes leads. »" a2="Filtrés, vérifiés," b2="exportables." swapAt={VO[7] - 4} sub="Dans le chat : tes leads par formulaire, les numéros douteux signalés, l’export CSV." />
      <Stage start={S.leads} end={S.res} top={210}><LeadsDemo /></Stage>
      <Side idx={5} start={S.res} end={S.buyer} a="« Montre-moi" b="les résultats. »" sub="Quelle pub t’apporte les meilleurs leads, et quoi faire ensuite." />
      <Stage start={S.res} end={S.buyer} top={190}><ResDemo /></Stage>
      <Side idx={6} start={S.buyer} end={S.end} a="Optimisé" b="jour et nuit." sub="Le media buyer IA ajuste tes campagnes en continu." />
      <Stage start={S.buyer} end={S.end} top={300}><BuyerDemo /></Stage>
      <Sequence from={S.end}><End /></Sequence>
      <AbsoluteFill style={{background: '#fff', opacity: Math.max(flash(S.pub), flash(S.end)), pointerEvents: 'none'}} />
      <Audio src={staticFile('leads/bed.wav')} />
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((k) => (
        <Sequence key={k} from={VO[k]}><Audio src={staticFile(`voice/ld-${k}-n.mp3`)} /></Sequence>
      ))}
    </AbsoluteFill>
  );
};
