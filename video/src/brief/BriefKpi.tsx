// « Le brief Meta » — épisode 8 : lire ses chiffres.
import React from 'react';
import {AbsoluteFill, spring, useCurrentFrame} from 'remotion';
import {DISPLAY, GRAD, INK, MUTED, Check, prog} from '../chatpub/SplitChat';
import {BriefShell, Grad, Headline, Label, Logo, Scene} from './BriefAndromeda';

type Word = {w: string; s: number; e: number};
export type KpiCfg = {episode: number; scenes: Scene[]; bed: string};
const at = (words: Word[], k: string, d = 1, n = 0) => { const w = words.filter((x) => x.w.toLowerCase().includes(k))[n]; return Math.round(((w?.s ?? d) - 0.1) * 30); };
const sp = (f: number, d = 12) => spring({frame: f, fps: 30, config: {damping: d}});
const PURPLE = '#5B3FE4';
const ORANGE = '#D97706';

const STEPS = [
  {k: 'CPM', i: '👀', stage: 'Affichages'},
  {k: 'Taux de clic', i: '👆', stage: 'Clics'},
  {k: 'Taux de conversion', i: '🛒', stage: 'Ventes'},
  {k: 'Coût / résultat', i: '💰', stage: 'Rentabilité'},
];

// entonnoir : 4 étages, l'étage actif ressort
const Funnel: React.FC<{f: number; active: number; enter?: number}> = ({f, active, enter = -30}) => (
  <>
    {STEPS.map((s, i) => {
      const w = 880 - i * 90;
      const on = i === active;
      const p = sp(f - enter - i * 4);
      return (
        <div key={s.k} style={{position: 'absolute', left: 540 - w / 2, top: 660 + i * 112, width: w, height: 96, borderRadius: 24, display: 'flex', alignItems: 'center', gap: 18, padding: '0 28px', background: on ? '#fff' : i < active ? '#F5F3FF' : '#F8FAFC', border: `3px solid ${on ? PURPLE : '#E5E7EB'}`, boxShadow: on ? '0 20px 40px -20px rgba(91,63,228,0.55)' : 'none', transform: `scale(${p * (on ? 1.04 : 1)})`, opacity: on ? 1 : 0.6}}>
          <div style={{fontSize: 42}}>{s.i}</div>
          <div style={{flex: 1, fontSize: on ? 34 : 30, fontWeight: 800, color: INK, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{s.k}</div>
          <div style={{fontSize: 22, fontWeight: 800, color: MUTED, letterSpacing: '0.06em'}}>{s.stage.toUpperCase()}</div>
        </div>
      );
    })}
  </>
);
const Diag: React.FC<{f: number; start: number; icon: string; text: React.ReactNode; color?: string; bg?: string}> = ({f, start, icon, text, color = ORANGE, bg = '#FFFBEB'}) => f < start ? null : (
  <div style={{position: 'absolute', left: 120, right: 120, top: 1140, display: 'flex', alignItems: 'center', gap: 18, padding: '22px 28px', borderRadius: 26, background: bg, border: `3px solid ${color}`, fontSize: 32, fontWeight: 800, color: INK, transform: `translateY(${(1 - sp(f - start)) * 30}px)`, opacity: sp(f - start)}}>
    <div style={{fontSize: 44}}>{icon}</div><div>{text}</div>
  </div>
);

const S1: React.FC<{words: Word[]}> = ({words}) => {
  const f = useCurrentFrame();
  const four = at(words, 'quatre');
  const cols = ['Portée', 'Impressions', 'Fréquence', 'CPM', 'Clics (tous)', 'CPC', 'Taux de clic', 'Clics sur lien', 'Vues de page', 'Ajouts panier', 'Taux de conversion', 'Achats', 'Coût par résultat', 'ROAS', 'Interactions', 'J’aime', 'Vues 3 s', 'ThruPlays'];
  const keep = ['CPM', 'Taux de clic', 'Taux de conversion', 'Coût par résultat', 'ROAS'];
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 0, right: 0, top: 410, textAlign: 'center', transform: `scale(${0.85 + sp(f - 2, 14) * 0.15})`}}>
        <div style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 116, letterSpacing: '-0.035em', lineHeight: 1, color: INK}}>Lire<br /><Grad>ses chiffres</Grad></div>
        <div style={{fontSize: 38, fontWeight: 600, color: MUTED, marginTop: 24, opacity: prog(f, 12, 10)}}>Les 4 indicateurs qui comptent vraiment</div>
      </div>
      <div style={{position: 'absolute', left: 90, right: 90, top: 840, display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center'}}>
        {cols.map((c, i) => {
          const k = keep.includes(c);
          const fade = k ? 0 : prog(f, four, 10);
          return <div key={c} style={{padding: '10px 18px', borderRadius: 12, background: k && f >= four ? PURPLE : '#fff', color: k && f >= four ? '#fff' : INK, border: `2px solid ${k && f >= four ? PURPLE : '#E5E7EB'}`, fontSize: 24, fontWeight: 700, opacity: prog(f, 14 + i * 1.5, 6) * (1 - fade * 0.8), transform: `scale(${k && f >= four ? 1 + sp(f - four, 9) * 0.08 : 1})`}}>{c}</div>;
        })}
      </div>
    </AbsoluteFill>
  );
};

const S2: React.FC<{words: Word[]}> = ({words}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Label text="1 · LE CPM" />
      <Headline>Le prix<br /><Grad>de ton audience.</Grad></Headline>
      <Funnel f={f} active={0} enter={0} />
      <Diag f={f} start={at(words, 'mille')} icon="🧾" text={<>Ce que tu paies pour <span style={{color: PURPLE}}>1 000 affichages</span></>} color="#C4B5FD" bg="#F5F3FF" />
    </AbsoluteFill>
  );
};

const S3: React.FC<{words: Word[]}> = ({words}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Label text="2 · LE TAUX DE CLIC" />
      <Headline>Est-ce que<br /><Grad>ta créa accroche ?</Grad></Headline>
      <Funnel f={f} active={1} />
      <Diag f={f} start={at(words, 'bas')} icon="🎨" text={<>Bas ? → <span style={{color: ORANGE}}>change ta créa</span>, surtout le début</>} />
    </AbsoluteFill>
  );
};

const S4: React.FC<{words: Word[]}> = ({words}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Label text="3 · LE TAUX DE CONVERSION" />
      <Headline>Des clics,<br /><Grad>mais des ventes ?</Grad></Headline>
      <Funnel f={f} active={2} />
      <Diag f={f} start={at(words, 'problème')} icon="🧭" text={<>Clics sans ventes ? → <span style={{color: ORANGE}}>ta page ou ton offre</span></>} />
    </AbsoluteFill>
  );
};

const S5: React.FC<{words: Word[]}> = ({words}) => {
  const f = useCurrentFrame();
  const money = at(words, 'argent');
  return (
    <AbsoluteFill>
      <Label text="4 · LA RENTABILITÉ" color="#16A34A" />
      <Headline>Est-ce que<br /><Grad>tu gagnes de l’argent ?</Grad></Headline>
      <Funnel f={f} active={3} />
      <Diag f={f} start={Math.min(at(words, 'retour'), 60)} icon="💰" text={<>Coût par résultat · ROAS<div style={{color: MUTED, fontSize: 24, marginTop: 4}}>ROAS = retour sur dépense publicitaire</div></>} color="#86EFAC" bg="#F0FDF4" />
      {f >= money && <div style={{position: 'absolute', left: 0, right: 0, top: 1290, display: 'flex', justifyContent: 'center'}}><div style={{padding: '10px 24px', borderRadius: 99, background: INK, color: '#fff', fontSize: 28, fontWeight: 800, transform: `scale(${sp(f - money, 10)})`}}>Le juge final. Pas les « J’aime ».</div></div>}
    </AbsoluteFill>
  );
};

const S6: React.FC = () => {
  const f = useCurrentFrame();
  const rows = [{l: 'CPM', s: 'OK', ok: true}, {l: 'Taux de clic', s: 'Nouvelles accroches proposées', ok: false}, {l: 'Taux de conversion', s: 'OK', ok: true}, {l: 'Coût par résultat', s: 'À surveiller', ok: false}];
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 0, right: 0, top: 350, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 22, transform: `scale(${0.8 + sp(f, 13) * 0.2})`}}>
        <div style={{filter: 'drop-shadow(0 20px 40px rgba(91,63,228,0.35))'}}><Logo s={110} /></div>
        <div style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 90, color: INK, letterSpacing: '-0.03em'}}>Growthity</div>
      </div>
      <div style={{position: 'absolute', left: 90, right: 90, top: 530, borderRadius: 34, background: '#fff', border: '2px solid #E5E7EB', padding: 34, boxShadow: '0 30px 60px -30px rgba(15,23,42,0.5)', opacity: prog(f, 6, 10), transform: `translateY(${(1 - prog(f, 6, 10)) * 40}px)`}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <div style={{fontSize: 26, fontWeight: 800, letterSpacing: '0.12em', color: MUTED}}>DIAGNOSTIC DE TA CAMPAGNE</div>
          <div style={{padding: '6px 14px', borderRadius: 99, backgroundImage: GRAD, color: '#fff', fontSize: 20, fontWeight: 800}}>Exemple</div>
        </div>
        {rows.map((r, i) => (
          <div key={r.l} style={{marginTop: 16, display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px', borderRadius: 18, background: r.ok ? '#F0FDF4' : '#FFFBEB', border: `2px solid ${r.ok ? '#BBF7D0' : '#FCD34D'}`, opacity: prog(f, 12 + i * 6, 8), transform: `translateX(${(1 - prog(f, 12 + i * 6, 8)) * 60}px)`}}>
            <div style={{display: 'flex', width: 36}}>{r.ok ? <Check s={34} /> : <span style={{fontSize: 30}}>⚠️</span>}</div>
            <div style={{flex: 1, fontSize: 30, fontWeight: 800, color: INK}}>{r.l}</div>
            <div style={{fontSize: 24, fontWeight: 800, color: r.ok ? '#15803D' : '#B45309'}}>{r.s}</div>
          </div>
        ))}
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1260, display: 'flex', justifyContent: 'center', opacity: prog(f, 50, 10)}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 14, padding: '18px 38px', borderRadius: 99, backgroundImage: GRAD, color: '#fff', fontSize: 36, fontWeight: 800, boxShadow: '0 20px 40px -14px rgba(91,63,228,0.7)'}}><Check s={34} c="#fff" /> Lien en bio pour commencer</div>
      </div>
    </AbsoluteFill>
  );
};

export const BriefKpi: React.FC<{cfg: KpiCfg}> = ({cfg}) => (
  <BriefShell cfg={cfg} comps={[<S1 key={0} words={cfg.scenes[0].words} />, <S2 key={1} words={cfg.scenes[1].words} />, <S3 key={2} words={cfg.scenes[2].words} />, <S4 key={3} words={cfg.scenes[3].words} />, <S5 key={4} words={cfg.scenes[4].words} />, <S6 key={5} />]} />
);
