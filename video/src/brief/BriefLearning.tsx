// « Le brief Meta » — épisode 2 : la phase d'apprentissage.
import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame} from 'remotion';
import {DISPLAY, GRAD, INK, MUTED, Check, Spinner, clamp, prog} from '../chatpub/SplitChat';
import {BriefShell, Grad, Headline, Label, Logo, Scene, ease} from './BriefAndromeda';

type Word = {w: string; s: number; e: number};
export type LearnCfg = {episode: number; scenes: Scene[]; bed: string};
const at = (words: Word[], k: string, d = 1) => { const w = words.find((x) => x.w.toLowerCase().includes(k)); return Math.round(((w?.s ?? d) - 0.1) * 30); };

// courbe de coût : bruitée puis stable selon "calm" (0 → 1)
const curve = (n: number, calm: number[], seed = 1) => Array.from({length: n}).map((_, i) => {
  const c = calm[i] ?? 1; const noise = Math.sin(i * 1.7 + seed) * 0.5 + Math.sin(i * 3.1 + seed * 2) * 0.35;
  return 0.45 + noise * 0.42 * (1 - c);
});
const Chart: React.FC<{vals: number[]; draw: number; color?: string; top?: number; badge?: React.ReactNode}> = ({vals, draw, color = '#8B6DFF', top = 720, badge}) => {
  const W = 880, H = 420, x0 = 100;
  const pts = vals.map((v, i) => [x0 + (i / (vals.length - 1)) * W, top + H - v * H] as const);
  const shown = Math.max(2, Math.round(draw * pts.length));
  const d = pts.slice(0, shown).map((p, i) => `${i ? 'L' : 'M'} ${p[0]} ${p[1]}`).join(' ');
  return (
    <>
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        <rect x={x0 - 20} y={top - 20} width={W + 40} height={H + 60} rx={30} fill="#fff" stroke="#E5E7EB" strokeWidth={3} />
        {[0.25, 0.5, 0.75].map((g) => <line key={g} x1={x0} x2={x0 + W} y1={top + H * g} y2={top + H * g} stroke="#F1F5F9" strokeWidth={2} />)}
        <path d={d} fill="none" stroke={color} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={pts[shown - 1][0]} cy={pts[shown - 1][1]} r={14} fill={color} />
        <text x={x0} y={top + H + 30} fontSize={24} fontWeight={700} fill={MUTED} fontFamily="Inter">Coût par résultat</text>
      </svg>
      {badge}
    </>
  );
};
const Badge: React.FC<{children: React.ReactNode; color: string; bg: string; top?: number}> = ({children, color, bg, top = 690}) => (
  <div style={{position: 'absolute', right: 110, top, display: 'flex', alignItems: 'center', gap: 12, padding: '12px 22px', borderRadius: 99, background: bg, color, fontSize: 30, fontWeight: 800, boxShadow: '0 12px 24px -14px rgba(15,23,42,0.4)'}}>{children}</div>
);

const S1: React.FC = () => {
  const f = useCurrentFrame();
  const vals = curve(40, Array.from({length: 40}).map((_, i) => i / 39));
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 0, right: 0, top: 520, textAlign: 'center', transform: `scale(${0.85 + spring({frame: f - 2, fps: 30, config: {damping: 14}}) * 0.15})`}}>
        <div style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 110, letterSpacing: '-0.035em', lineHeight: 1, color: INK}}>La phase<br /><Grad>d'apprentissage</Grad></div>
        <div style={{fontSize: 38, fontWeight: 600, color: MUTED, marginTop: 24, opacity: prog(f, 12, 10)}}>Pourquoi il ne faut pas toucher<br />ta campagne tous les jours</div>
      </div>
      <Chart vals={vals} draw={interpolate(f, [6, 60], [0, 1], ease)} top={1000} />
    </AbsoluteFill>
  );
};

const S2: React.FC<{words: Word[]}> = ({words}) => {
  const f = useCurrentFrame();
  const vals = curve(40, Array.from({length: 40}).map((_, i) => Math.max(0, (i - 18) / 21)));
  const steps = [{t: 'Teste', k: 'teste'}, {t: 'Observe', k: 'observe'}, {t: 'Ajuste', k: 'ajuste'}];
  return (
    <AbsoluteFill>
      <Label text="LE PRINCIPE" />
      <Headline>Meta apprend<br /><Grad>avant de performer.</Grad></Headline>
      <Chart vals={vals} draw={interpolate(f, [8, 140], [0, 1], ease)} badge={<Badge color="#B45309" bg="#FEF3C7"><Spinner f={f} s={26} /> En apprentissage</Badge>} />
      <div style={{position: 'absolute', left: 100, right: 100, top: 1230, display: 'flex', gap: 18}}>
        {steps.map((s) => { const p = spring({frame: f - at(words, s.k), fps: 30, config: {damping: 12}}); return <div key={s.t} style={{flex: 1, padding: '18px 0', textAlign: 'center', borderRadius: 18, background: '#fff', border: '2px solid #DDD6FE', fontSize: 34, fontWeight: 800, color: '#5B3FE4', transform: `scale(${p})`}}>{s.t}</div>; })}
      </div>
    </AbsoluteFill>
  );
};

const S3: React.FC<{words: Word[]}> = ({words}) => {
  const f = useCurrentFrame();
  const n = Math.round(interpolate(f, [10, 100], [0, 50], {...clamp, easing: (x: number) => 1 - Math.pow(1 - x, 2)}));
  const done = n >= 50;
  const dp = spring({frame: f - 102, fps: 30, config: {damping: 11}});
  return (
    <AbsoluteFill>
      <Label text="LA RÈGLE" />
      <Headline>Environ <Grad>50 résultats</Grad><br />en 7 jours.</Headline>
      <div style={{position: 'absolute', left: 100, right: 100, top: 690, display: 'flex', gap: 12}}>
        {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => {
          const filled = Math.min(1, Math.max(0, n / 50 * 7 - i));
          return (
            <div key={i} style={{flex: 1, height: 360, borderRadius: 20, background: '#fff', border: '2px solid #E5E7EB', position: 'relative', overflow: 'hidden'}}>
              <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: `${filled * 100}%`, backgroundImage: GRAD, opacity: 0.85}} />
              <div style={{position: 'absolute', left: 0, right: 0, top: 14, textAlign: 'center', fontSize: 28, fontWeight: 800, color: filled > 0.85 ? '#fff' : MUTED}}>{d}</div>
            </div>
          );
        })}
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1090, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 24}}>
        <div style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 120, color: INK}}>{n}<span style={{fontSize: 56, color: MUTED}}>/50</span></div>
        {done && <div style={{display: 'flex', alignItems: 'center', gap: 10, padding: '14px 26px', borderRadius: 99, background: '#DCFCE7', color: '#15803D', fontSize: 36, fontWeight: 800, transform: `scale(${dp})`}}><Check s={34} /> Actif</div>}
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1250, textAlign: 'center', fontSize: 28, fontWeight: 600, color: MUTED, opacity: prog(f, at(words, 'stabiliser'), 8)}}>Repère indiqué par Meta, par ensemble de pubs</div>
    </AbsoluteFill>
  );
};

const S4: React.FC<{words: Word[]}> = ({words}) => {
  const f = useCurrentFrame();
  const edits = [{t: '💰 Budget', k: 'budget'}, {t: '🎯 Ciblage', k: 'ciblage'}, {t: '🎨 Créa', k: 'créa'}];
  const hits = edits.map((e) => at(words, e.k));
  const last = hits.filter((h) => f >= h).length;
  // la courbe se calme puis repart en bruit à chaque modification
  const calm = Array.from({length: 40}).map((_, i) => {
    const sinceHit = last ? (f - hits[last - 1]) / 30 : 99;
    return last ? Math.max(0, Math.min(1, sinceHit / 3) * (i / 39)) * 0.2 : Math.max(0, (i - 10) / 29);
  });
  const shake = hits.some((h) => f >= h && f < h + 8) ? Math.sin(f * 2.5) * 8 : 0;
  return (
    <AbsoluteFill>
      <Label text="LE PIÈGE" color="#DC2626" />
      <Headline>Chaque grosse modif<br /><span style={{color: '#DC2626'}}>relance l'apprentissage.</span></Headline>
      <div style={{position: 'absolute', inset: 0, transform: `translateX(${shake}px)`}}>
        <Chart vals={curve(40, calm, last + 1)} draw={1} color={last ? '#DC2626' : '#8B6DFF'} badge={last ? <Badge color="#B91C1C" bg="#FEE2E2">↺ Retour en apprentissage</Badge> : <Badge color="#15803D" bg="#DCFCE7"><Check s={26} /> Actif</Badge>} />
      </div>
      <div style={{position: 'absolute', left: 100, right: 100, top: 1230, display: 'flex', gap: 18}}>
        {edits.map((e, i) => { const on = f >= hits[i]; const p = spring({frame: f - hits[i], fps: 30, config: {damping: 10}}); return <div key={e.t} style={{flex: 1, padding: '18px 0', textAlign: 'center', borderRadius: 18, background: on ? '#FEF2F2' : '#fff', border: `2px solid ${on ? '#FCA5A5' : '#E5E7EB'}`, fontSize: 32, fontWeight: 800, color: on ? '#B91C1C' : MUTED, transform: `scale(${on ? 0.9 + p * 0.1 : 0.94})`}}>{e.t}</div>; })}
      </div>
    </AbsoluteFill>
  );
};

const S5: React.FC<{words: Word[]}> = ({words}) => {
  const f = useCurrentFrame();
  const items = [{i: '⏳', t: 'Laisse tourner', d: 'Pas de grosses modifs pendant l’apprentissage', k: 'tourner'}, {i: '🧺', t: 'Regroupe tes budgets', d: 'Moins d’ensembles, plus de résultats chacun', k: 'regroupe'}, {i: '📅', t: 'Juge sur 7 jours', d: 'Pas sur une seule journée', k: 'sept'}];
  return (
    <AbsoluteFill>
      <Label text="CE QU'IL FAUT FAIRE" color="#16A34A" />
      <Headline>La bonne<br /><Grad>discipline.</Grad></Headline>
      {items.map((it, i) => {
        const a = at(words, it.k); const p = spring({frame: f - a + 4, fps: 30, config: {damping: 13}}); const on = f >= a;
        return (
          <div key={it.t} style={{position: 'absolute', left: 80, right: 80, top: 690 + i * 255, height: 220, borderRadius: 32, background: '#fff', border: `3px solid ${on ? '#BBF7D0' : '#E5E7EB'}`, boxShadow: '0 24px 50px -30px rgba(15,23,42,0.5)', display: 'flex', alignItems: 'center', gap: 34, padding: '0 40px', transform: `translateX(${(1 - p) * 80}px)`, opacity: Math.min(1, p * 1.4)}}>
            <div style={{fontSize: 84}}>{it.i}</div>
            <div style={{flex: 1}}><div style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 50, color: INK}}>{it.t}</div><div style={{fontSize: 30, color: MUTED, fontWeight: 600, marginTop: 6}}>{it.d}</div></div>
            <div style={{width: 72, height: 72, borderRadius: 99, background: on ? '#16A34A' : '#E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Check s={44} c="#fff" /></div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

const S6: React.FC<{words: Word[]}> = ({words}) => {
  const f = useCurrentFrame();
  const cards = [
    {name: 'UGC Vidéo – Julie', state: 'En apprentissage · 32/50', reco: 'Ne touche à rien pour l’instant', icon: '⏳', c: '#B45309', bg: '#FFFBEB', k: 'rien'},
    {name: 'Visuel – Offre de novembre', state: 'Stable depuis 9 jours', reco: 'Tu peux augmenter le budget', icon: '▲', c: '#15803D', bg: '#F0FDF4', k: 'agir'},
  ];
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 0, right: 0, top: 350, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 22, transform: `scale(${0.8 + spring({frame: f, fps: 30, config: {damping: 13}}) * 0.2})`}}>
        <div style={{filter: 'drop-shadow(0 20px 40px rgba(91,63,228,0.35))'}}><Logo s={110} /></div>
        <div style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 90, color: INK, letterSpacing: '-0.03em'}}>Growthity</div>
      </div>
      <div style={{position: 'absolute', left: 80, right: 80, top: 520, textAlign: 'center', fontFamily: DISPLAY, fontWeight: 700, fontSize: 56, lineHeight: 1.1, color: INK, opacity: prog(f, 6, 10)}}>Ton media buyer te dit<br /><Grad>quand agir… et quand attendre.</Grad></div>
      {cards.map((c, i) => {
        const a = Math.min(at(words, c.k, 2), 30 + i * 18); const p = spring({frame: f - 14 - i * 14, fps: 30, config: {damping: 13}});
        return (
          <div key={c.name} style={{position: 'absolute', left: 90, right: 90, top: 730 + i * 250, borderRadius: 30, background: '#fff', border: `3px solid ${c.bg === '#FFFBEB' ? '#FDE68A' : '#BBF7D0'}`, padding: '26px 32px', boxShadow: '0 24px 50px -30px rgba(15,23,42,0.5)', transform: `translateY(${(1 - p) * 60}px)`, opacity: Math.min(1, p * 1.5)}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <div style={{fontSize: 34, fontWeight: 800, color: INK}}>{c.name}</div>
              <div style={{fontSize: 24, fontWeight: 700, color: MUTED}}>{c.state}</div>
            </div>
            <div style={{marginTop: 16, display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', borderRadius: 16, background: c.bg, color: c.c, fontSize: 34, fontWeight: 800, opacity: prog(f, a, 8)}}>{c.icon} {c.reco}</div>
          </div>
        );
      })}
      <div style={{position: 'absolute', left: 0, right: 0, top: 1240, display: 'flex', justifyContent: 'center', opacity: prog(f, 60, 10)}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 14, padding: '18px 38px', borderRadius: 99, backgroundImage: GRAD, color: '#fff', fontSize: 36, fontWeight: 800, boxShadow: '0 20px 40px -14px rgba(91,63,228,0.7)'}}><Check s={34} c="#fff" /> Lien en bio pour commencer</div>
      </div>
    </AbsoluteFill>
  );
};

export const BriefLearning: React.FC<{cfg: LearnCfg}> = ({cfg}) => (
  <BriefShell cfg={cfg} comps={[<S1 key={0} />, <S2 key={1} words={cfg.scenes[1].words} />, <S3 key={2} words={cfg.scenes[2].words} />, <S4 key={3} words={cfg.scenes[3].words} />, <S5 key={4} words={cfg.scenes[4].words} />, <S6 key={5} words={cfg.scenes[5].words} />]} />
);
