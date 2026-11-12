// « Le brief Meta » — épisode 3 : la structure de compte simplifiée.
import React from 'react';
import {AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame} from 'remotion';
import {DISPLAY, GRAD, INK, MUTED, Check, Spinner, clamp, prog} from '../chatpub/SplitChat';
import {BriefShell, Grad, Headline, Label, Logo, Scene, ease} from './BriefAndromeda';

type Word = {w: string; s: number; e: number};
export type StructCfg = {episode: number; scenes: Scene[]; bed: string; ads: string[]};
const at = (words: Word[], k: string, d = 1) => { const w = words.find((x) => x.w.toLowerCase().includes(k)); return Math.round(((w?.s ?? d) - 0.1) * 30); };

const Box: React.FC<{x: number; y: number; w: number; h: number; text?: string; bg?: string; border?: string; color?: string; size?: number; p?: number}> = ({x, y, w, h, text, bg = '#fff', border = '#E5E7EB', color = INK, size = 22, p = 1}) => (
  <div style={{position: 'absolute', left: x - w / 2, top: y, width: w, height: h, borderRadius: Math.min(16, h / 3), background: bg, border: `2px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size, fontWeight: 800, color, transform: `scale(${p})`, boxShadow: '0 8px 16px -10px rgba(15,23,42,0.35)', textAlign: 'center', lineHeight: 1.1}}>{text}</div>
);

// arbre en désordre : 1 compte → 10 campagnes → 30 ensembles
const MessyTree: React.FC<{f: number; start: number; learning?: boolean}> = ({f, start, learning}) => {
  const camps = Array.from({length: 10}).map((_, i) => ({x: 120 + i * 93, y: 870}));
  const sets = Array.from({length: 30}).map((_, i) => ({x: 105 + i * 29.5, y: 1060 + (i % 2) * 34}));
  return (
    <>
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        {camps.map((c, i) => <line key={i} x1={540} y1={790} x2={c.x} y2={c.y} stroke="#CBD5E1" strokeWidth={2} opacity={prog(f, start + 4 + i, 6)} />)}
        {sets.map((s, i) => <line key={i} x1={camps[Math.floor(i / 3)].x} y1={camps[0].y + 56} x2={s.x} y2={s.y} stroke="#E2E8F0" strokeWidth={2} opacity={prog(f, start + 14 + i * 0.6, 6)} />)}
      </svg>
      <Box x={540} y={720} w={220} h={70} text="Ton compte" size={28} p={spring({frame: f - start, fps: 30, config: {damping: 12}})} />
      {camps.map((c, i) => <Box key={i} x={c.x} y={c.y} w={80} h={56} text={`C${i + 1}`} size={20} bg="#F8FAFC" p={spring({frame: f - start - 4 - i, fps: 30, config: {damping: 12}})} />)}
      {sets.map((s, i) => <div key={i} style={{position: 'absolute', left: s.x - 12, top: s.y, width: 24, height: 24, borderRadius: 6, background: learning && f > start + 40 ? '#FDE68A' : '#E2E8F0', border: `2px solid ${learning && f > start + 40 ? '#F59E0B' : '#CBD5E1'}`, transform: `scale(${spring({frame: f - start - 14 - i * 0.6, fps: 30, config: {damping: 12}})})`}} />)}
    </>
  );
};

const S1: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 0, right: 0, top: 430, textAlign: 'center', transform: `scale(${0.85 + spring({frame: f - 2, fps: 30, config: {damping: 14}}) * 0.15})`}}>
        <div style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 110, letterSpacing: '-0.035em', lineHeight: 1, color: INK}}>La structure<br /><Grad>de compte</Grad></div>
        <div style={{fontSize: 38, fontWeight: 600, color: MUTED, marginTop: 24, opacity: prog(f, 12, 10)}}>Pourquoi un compte simple performe mieux</div>
      </div>
      <div style={{position: 'absolute', inset: 0, transform: 'translateY(150px)'}}><MessyTree f={f} start={14} /></div>
    </AbsoluteFill>
  );
};

const S2: React.FC<{words: Word[]}> = ({words}) => {
  const f = useCurrentFrame();
  const split = at(words, 'divise');
  const coins = interpolate(f, [split, split + 30], [1, 30], clamp);
  return (
    <AbsoluteFill>
      <Label text="LE PROBLÈME" color="#DC2626" />
      <Headline>Trop de cases,<br /><span style={{color: '#DC2626'}}>pas assez de données.</span></Headline>
      <MessyTree f={f} start={0} learning />
      <div style={{position: 'absolute', left: 0, right: 0, top: 1150, textAlign: 'center', opacity: prog(f, split, 8)}}>
        <div style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 64, color: INK}}>💶 Budget ÷ {Math.round(coins)}</div>
        <div style={{display: 'inline-flex', alignItems: 'center', gap: 10, marginTop: 14, padding: '10px 22px', borderRadius: 99, background: '#FEF3C7', color: '#B45309', fontSize: 30, fontWeight: 800}}><Spinner f={f} s={24} /> Tous coincés en apprentissage</div>
      </div>
    </AbsoluteFill>
  );
};

const S3: React.FC = () => {
  const f = useCurrentFrame();
  const circles = [{x: 420, y: 950, c: '#60A5FA', l: 'Ensemble A'}, {x: 660, y: 950, c: '#A78BFA', l: 'Ensemble B'}, {x: 540, y: 1150, c: '#F472B6', l: 'Ensemble C'}];
  const pulse = 1 + Math.sin(f * 0.4) * 0.04;
  return (
    <AbsoluteFill>
      <Label text="PIRE" color="#DC2626" />
      <Headline>Tes ensembles se font<br /><span style={{color: '#DC2626'}}>concurrence.</span></Headline>
      {circles.map((c, i) => {
        const p = spring({frame: f - 4 - i * 5, fps: 30, config: {damping: 12}});
        return <div key={i} style={{position: 'absolute', left: c.x - 210, top: c.y - 210, width: 420, height: 420, borderRadius: 999, background: `${c.c}33`, border: `4px solid ${c.c}`, transform: `scale(${p})`}}><div style={{position: 'absolute', left: 0, right: 0, top: i === 2 ? 300 : 70, textAlign: 'center', fontSize: 30, fontWeight: 800, color: INK}}>{c.l}</div></div>;
      })}
      <div style={{position: 'absolute', left: 540 - 80, top: 1010, width: 160, height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 100, transform: `scale(${prog(f, 30, 8) * pulse})`}}>⚔️</div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1330, textAlign: 'center', opacity: prog(f, 34, 8)}}>
        <div style={{display: 'inline-block', padding: '12px 26px', borderRadius: 99, background: '#FEE2E2', color: '#B91C1C', fontSize: 32, fontWeight: 800}}>Mêmes personnes visées</div>
      </div>
    </AbsoluteFill>
  );
};

const S4: React.FC<{words: Word[]; ads: string[]}> = ({words, ads}) => {
  const f = useCurrentFrame();
  const a1 = at(words, 'campagne'), a2 = at(words, 'ensemble'), a3 = at(words, 'budget'), a4 = at(words, 'plein');
  const sets = [{x: 330, y: 960}, {x: 750, y: 960}];
  return (
    <AbsoluteFill>
      <Label text="LA SOLUTION" color="#16A34A" />
      <Headline>Simple.<br /><Grad>Et rempli de créas.</Grad></Headline>
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        {sets.map((s, i) => <line key={i} x1={540} y1={850} x2={s.x} y2={s.y} stroke="#86EFAC" strokeWidth={4} opacity={prog(f, a2, 8)} />)}
        {ads.slice(0, 8).map((_, i) => { const s = sets[i < 4 ? 0 : 1]; const x = (i < 4 ? 150 : 570) + (i % 4) * 120; return <line key={i} x1={s.x} y1={s.y + 80} x2={x + 50} y2={1120} stroke="#DDD6FE" strokeWidth={3} opacity={prog(f, a4 + i, 6)} />; })}
      </svg>
      <Box x={540} y={760} w={420} h={90} text="1 campagne" size={38} border="#86EFAC" bg="#F0FDF4" p={spring({frame: f - a1, fps: 30, config: {damping: 12}})} />
      {f >= a3 && <div style={{position: 'absolute', left: 760, top: 745, padding: '8px 16px', borderRadius: 99, backgroundImage: GRAD, color: '#fff', fontSize: 22, fontWeight: 800, transform: `scale(${spring({frame: f - a3, fps: 30, config: {damping: 10}})})`}}>💶 budget géré par Meta</div>}
      {sets.map((s, i) => <Box key={i} x={s.x} y={s.y} w={300} h={80} text={`Ensemble large ${i + 1}`} size={28} border="#86EFAC" bg="#F0FDF4" p={spring({frame: f - a2 - i * 4, fps: 30, config: {damping: 12}})} />)}
      {ads.slice(0, 8).map((a, i) => { const x = (i < 4 ? 150 : 570) + (i % 4) * 120; const p = spring({frame: f - a4 - i * 2, fps: 30, config: {damping: 12}}); return <div key={i} style={{position: 'absolute', left: x, top: 1120, width: 100, height: 170, borderRadius: 12, overflow: 'hidden', transform: `scale(${p})`, boxShadow: '0 10px 20px -12px rgba(15,23,42,0.5)'}}><Img src={staticFile(`media/${a}`)} style={{width: '100%', height: '100%', objectFit: 'cover'}} /></div>; })}
    </AbsoluteFill>
  );
};

const S5: React.FC = () => {
  const f = useCurrentFrame();
  const rows = [{l: 'Compte complexe', v: 0.28, c: '#F59E0B', t: 'apprend lentement'}, {l: 'Compte simple', v: 0.92, c: '#16A34A', t: 'apprend plus vite'}];
  return (
    <AbsoluteFill>
      <Label text="LE RÉSULTAT" color="#16A34A" />
      <Headline>Moins de cases,<br /><Grad>plus de données.</Grad></Headline>
      {rows.map((r, i) => {
        const w = interpolate(f, [8 + i * 6, 50 + i * 6], [0, r.v], ease);
        return (
          <div key={r.l} style={{position: 'absolute', left: 100, right: 100, top: 760 + i * 230}}>
            <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 34, fontWeight: 800, color: INK, marginBottom: 14}}><span>{r.l}</span><span style={{color: r.c}}>{r.t}</span></div>
            <div style={{height: 70, borderRadius: 20, background: '#fff', border: '2px solid #E5E7EB', overflow: 'hidden'}}><div style={{width: `${w * 100}%`, height: '100%', background: i ? GRAD : r.c, borderRadius: 18}} /></div>
          </div>
        );
      })}
      <div style={{position: 'absolute', left: 0, right: 0, top: 1240, textAlign: 'center', fontSize: 28, fontWeight: 600, color: MUTED, opacity: prog(f, 50, 8)}}>Plus de résultats par ensemble = sortie d’apprentissage plus rapide</div>
    </AbsoluteFill>
  );
};

const S6: React.FC<{ads: string[]}> = ({ads}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 0, right: 0, top: 350, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 22, transform: `scale(${0.8 + spring({frame: f, fps: 30, config: {damping: 13}}) * 0.2})`}}>
        <div style={{filter: 'drop-shadow(0 20px 40px rgba(91,63,228,0.35))'}}><Logo s={110} /></div>
        <div style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 90, color: INK, letterSpacing: '-0.03em'}}>Growthity</div>
      </div>
      <div style={{position: 'absolute', left: 90, right: 90, top: 530, borderRadius: 34, background: '#fff', border: '2px solid #E5E7EB', padding: 34, boxShadow: '0 30px 60px -30px rgba(15,23,42,0.5)', opacity: prog(f, 8, 10), transform: `translateY(${(1 - prog(f, 8, 10)) * 40}px)`}}>
        <div style={{fontSize: 26, fontWeight: 800, letterSpacing: '0.12em', color: MUTED}}>STRUCTURE PROPOSÉE</div>
        <div style={{marginTop: 18, padding: '18px 22px', borderRadius: 18, background: '#F0FDF4', border: '2px solid #BBF7D0', fontSize: 34, fontWeight: 800, color: INK}}>📣 Campagne · Ventes <span style={{fontSize: 24, color: '#15803D'}}>· budget géré par Meta</span></div>
        <div style={{marginTop: 12, marginLeft: 40, padding: '14px 22px', borderRadius: 18, background: '#F8FAFC', border: '2px solid #E5E7EB', fontSize: 30, fontWeight: 800, color: INK}}>🎯 Ensemble · ciblage large</div>
        <div style={{marginTop: 14, marginLeft: 80, display: 'flex', gap: 10}}>
          {ads.slice(0, 6).map((a, i) => <div key={i} style={{width: 92, height: 150, borderRadius: 12, overflow: 'hidden', transform: `scale(${spring({frame: f - 20 - i * 3, fps: 30, config: {damping: 12}})})`}}><Img src={staticFile(`media/${a}`)} style={{width: '100%', height: '100%', objectFit: 'cover'}} /></div>)}
        </div>
        <div style={{marginTop: 22, display: 'flex', alignItems: 'center', gap: 12, fontSize: 32, fontWeight: 800, color: '#15803D', opacity: prog(f, 44, 8)}}><Check s={34} /> Prête à lancer</div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1240, display: 'flex', justifyContent: 'center', opacity: prog(f, 56, 10)}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 14, padding: '18px 38px', borderRadius: 99, backgroundImage: GRAD, color: '#fff', fontSize: 36, fontWeight: 800, boxShadow: '0 20px 40px -14px rgba(91,63,228,0.7)'}}><Check s={34} c="#fff" /> Lien en bio pour commencer</div>
      </div>
    </AbsoluteFill>
  );
};

export const BriefStructure: React.FC<{cfg: StructCfg}> = ({cfg}) => (
  <BriefShell cfg={cfg} comps={[<S1 key={0} />, <S2 key={1} words={cfg.scenes[1].words} />, <S3 key={2} />, <S4 key={3} words={cfg.scenes[3].words} ads={cfg.ads} />, <S5 key={4} />, <S6 key={5} ads={cfg.ads} />]} />
);
