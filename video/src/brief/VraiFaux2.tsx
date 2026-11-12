// « Vrai ou faux ? » #2 — « Une pub qui fait plein de likes, c'est une pub qui vend. » → FAUX.
import React from 'react';
import {AbsoluteFill, spring, useCurrentFrame} from 'remotion';
import {DISPLAY, INK, MUTED, Check, prog} from '../chatpub/SplitChat';
import {BriefShell, Grad} from './BriefAndromeda';
import {VFCfg, VFS1, VFS2, VFS3, VFS6} from './VraiFaux';

type Word = {w: string; s: number; e: number};
const sp = (f: number, d = 12) => spring({frame: f, fps: 30, config: {damping: d}});
const at = (words: Word[], k: string, d = 1) => { const w = words.find((x) => x.w.toLowerCase().includes(k)); return Math.round(((w?.s ?? d) - 0.1) * 30); };
const GREEN = '#16A34A';
const PINK = '#E11D48';

const Title: React.FC<{tag: string; color: string; children: React.ReactNode}> = ({tag, color, children}) => (
  <div style={{position: 'absolute', left: 80, right: 80, top: 360}}>
    <div style={{fontSize: 26, fontWeight: 800, letterSpacing: '0.14em', color}}>● {tag}</div>
    <div style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 70, lineHeight: 1.05, letterSpacing: '-0.03em', color: INK, marginTop: 14}}>{children}</div>
  </div>
);

// deux colonnes : objectif Interactions → des gens qui likent ; objectif Ventes → des gens qui achètent
const S4: React.FC<{words: Word[]}> = ({words}) => {
  const f = useCurrentFrame();
  const like = at(words, 'likent'), buy = at(words, 'achètent');
  const people = ['👩', '🧔', '👱‍♀️', '👨‍🦱', '👩‍🦰', '🧑'];
  const Col: React.FC<{x: number; head: string; color: string; icon: string; start: number; label: string}> = ({x, head, color, icon, start, label}) => (
    <div style={{position: 'absolute', left: x, top: 660, width: 420}}>
      <div style={{padding: '16px 20px', borderRadius: 20, background: '#fff', border: `3px solid ${color}`, fontSize: 28, fontWeight: 800, color: INK, textAlign: 'center', transform: `scale(${sp(f - (start - 24))})`}}>{head}</div>
      <div style={{marginTop: 26, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18}}>
        {people.map((p, i) => {
          const s = start - 10 + i * 3;
          return (
            <div key={i} style={{position: 'relative', height: 120, borderRadius: 24, background: '#fff', border: '2px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 64, transform: `scale(${sp(f - s)})`}}>
              {p}
              <div style={{position: 'absolute', right: -10, top: -12, width: 50, height: 50, borderRadius: 99, background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, transform: `scale(${sp(f - s - 8, 9)})`}}>{icon}</div>
            </div>
          );
        })}
      </div>
      <div style={{marginTop: 20, textAlign: 'center', fontSize: 30, fontWeight: 800, color, opacity: prog(f, start + 10, 8)}}>{label}</div>
    </div>
  );
  return (
    <AbsoluteFill>
      <Title tag="POURQUOI" color="#5B3FE4">Meta te donne<br /><Grad>ce que tu demandes.</Grad></Title>
      <Col x={90} head="Objectif : Interactions" color={PINK} icon="❤️" start={Math.max(like, 30)} label="Des gens qui likent" />
      <Col x={570} head="Objectif : Ventes" color={GREEN} icon="🛒" start={Math.max(buy, 60)} label="Des gens qui achètent" />
    </AbsoluteFill>
  );
};

// sélecteur d'objectifs du gestionnaire de publicités + la bonne métrique
const S5: React.FC<{words: Word[]}> = ({words}) => {
  const f = useCurrentFrame();
  const sel = at(words, 'ventes'), metric = at(words, 'coût');
  const objs = ['Notoriété', 'Trafic', 'Interactions', 'Prospects', 'Promotion de l’app', 'Ventes'];
  return (
    <AbsoluteFill>
      <Title tag="LE BON RÉFLEXE" color={GREEN}>Vise les ventes,<br /><Grad>juge sur les ventes.</Grad></Title>
      <div style={{position: 'absolute', left: 110, right: 110, top: 660, borderRadius: 30, background: '#fff', border: '2px solid #E5E7EB', padding: '26px 30px', boxShadow: '0 30px 60px -32px rgba(15,23,42,0.5)', transform: `scale(${sp(f - 2)})`}}>
        <div style={{fontSize: 24, fontWeight: 800, letterSpacing: '0.12em', color: MUTED, marginBottom: 14}}>OBJECTIF DE LA CAMPAGNE</div>
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12}}>
          {objs.map((o) => {
            const on = o === 'Ventes' && f >= sel;
            return <div key={o} style={{display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderRadius: 16, border: `3px solid ${on ? GREEN : '#E5E7EB'}`, background: on ? '#F0FDF4' : '#fff', fontSize: 28, fontWeight: 800, color: INK, transform: `scale(${on ? 1 + sp(f - sel, 9) * 0.04 : 1})`}}>
              <div style={{width: 30, height: 30, borderRadius: 99, border: `3px solid ${on ? GREEN : '#CBD5E1'}`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{on && <div style={{width: 14, height: 14, borderRadius: 99, background: GREEN}} />}</div>{o}
            </div>;
          })}
        </div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1080, display: 'flex', justifyContent: 'center', gap: 22, opacity: prog(f, metric, 8)}}>
        <div style={{padding: '14px 24px', borderRadius: 18, background: '#fff', border: '2px solid #E5E7EB', fontSize: 30, fontWeight: 800, color: MUTED, textDecoration: 'line-through'}}>❤️ J’aime</div>
        <div style={{display: 'flex', alignItems: 'center', gap: 10, padding: '14px 24px', borderRadius: 18, background: '#F0FDF4', border: `3px solid ${GREEN}`, fontSize: 30, fontWeight: 800, color: INK, transform: `scale(${sp(f - metric - 6, 9)})`}}><Check s={30} /> Coût par achat</div>
      </div>
    </AbsoluteFill>
  );
};

export const VraiFaux2: React.FC<{cfg: VFCfg}> = ({cfg}) => (
  <BriefShell cfg={cfg} comps={[<VFS1 key={0} cfg={cfg} />, <VFS2 key={1} cfg={cfg} />, <VFS3 key={2} cfg={cfg} />, <S4 key={3} words={cfg.scenes[3].words} />, <S5 key={4} words={cfg.scenes[4].words} />, <VFS6 key={5} ads={cfg.ads} />]} />
);
