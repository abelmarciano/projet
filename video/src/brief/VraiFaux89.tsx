// « Vrai ou faux ? » #8 (sous-titres inutiles → FAUX) et #9 (les 3 premières secondes → VRAI).
import React from 'react';
import {AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame} from 'remotion';
import {DISPLAY, INK, MUTED, prog} from '../chatpub/SplitChat';
import {BriefShell, Grad} from './BriefAndromeda';
import {VFCfg, VFS1, VFS2, VFS3, VFS6} from './VraiFaux';

type Word = {w: string; s: number; e: number};
const sp = (f: number, d = 12) => spring({frame: f, fps: 30, config: {damping: d}});
const at = (words: Word[], k: string, d = 1) => { const w = words.find((x) => x.w.toLowerCase().includes(k)); return Math.round(((w?.s ?? d) - 0.1) * 30); };
const GREEN = '#16A34A';
const RED = '#DC2626';
const PURPLE = '#5B3FE4';

const Title: React.FC<{tag: string; color: string; children: React.ReactNode}> = ({tag, color, children}) => (
  <div style={{position: 'absolute', left: 80, right: 80, top: 360}}>
    <div style={{fontSize: 26, fontWeight: 800, letterSpacing: '0.14em', color}}>● {tag}</div>
    <div style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 70, lineHeight: 1.05, letterSpacing: '-0.03em', color: INK, marginTop: 14}}>{children}</div>
  </div>
);
const Phone: React.FC<{x: number; y: number; w: number; children: React.ReactNode; p?: number}> = ({x, y, w, children, p = 1}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, height: w * 1.9, borderRadius: w * 0.11, background: '#0B0A0C', padding: w * 0.035, transform: `scale(${p})`, boxShadow: '0 30px 60px -30px rgba(15,23,42,0.6)'}}>
    <div style={{position: 'relative', width: '100%', height: '100%', borderRadius: w * 0.08, overflow: 'hidden', background: '#111'}}>{children}</div>
  </div>
);

/* ---------- #8 : le son est souvent coupé ---------- */
const V8S4: React.FC<{words: Word[]; ads: string[]}> = ({words, ads}) => {
  const f = useCurrentFrame();
  const spots = [{k: 'métro', l: '🚇 Dans le métro'}, {k: 'bureau', l: '💼 Au bureau'}, {k: 'lit', l: '🛏️ Au lit'}];
  const trappe = at(words, 'trappe', 120);
  return (
    <AbsoluteFill>
      <Title tag="POURQUOI" color={PURPLE}>Le son est<br /><Grad>souvent coupé.</Grad></Title>
      <Phone x={110} y={660} w={330} p={sp(f - 2)}>
        <Img src={staticFile(`media/${ads[1]}`)} style={{width: '100%', height: '100%', objectFit: 'cover', filter: f >= trappe ? 'grayscale(0.7)' : undefined}} />
        <div style={{position: 'absolute', right: 14, top: 14, width: 64, height: 64, borderRadius: 32, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 34}}>🔇</div>
        {f >= trappe && <div style={{position: 'absolute', left: 0, right: 0, top: '42%', textAlign: 'center', fontFamily: DISPLAY, fontWeight: 700, fontSize: 64, color: '#fff', transform: `scale(${sp(f - trappe, 9)})`}}>🤷 ???</div>}
      </Phone>
      <div style={{position: 'absolute', left: 520, top: 720, display: 'flex', flexDirection: 'column', gap: 26}}>
        {spots.map((s) => { const a = at(words, s.k, 20); return <div key={s.k} style={{padding: '18px 26px', borderRadius: 22, background: '#fff', border: '2px solid #E5E7EB', fontSize: 34, fontWeight: 800, color: INK, opacity: prog(f, a, 8), transform: `translateX(${(1 - sp(f - a)) * 80}px)`}}>{s.l} <span style={{marginLeft: 8}}>🔇</span></div>; })}
        {f >= trappe && <div style={{padding: '14px 22px', borderRadius: 18, background: '#FEF2F2', color: '#B91C1C', fontSize: 28, fontWeight: 800, transform: `scale(${sp(f - trappe, 10)})`}}>Sans sous-titres : message perdu</div>}
      </div>
    </AbsoluteFill>
  );
};

const V8S5: React.FC<{words: Word[]; ads: string[]}> = ({words, ads}) => {
  const f = useCurrentFrame();
  const ticks = [{k: 'gros', l: 'Gros'}, {k: 'lisibles', l: 'Lisibles'}, {k: 'centre', l: 'Au centre'}];
  const subWords = ['TA', 'PUB,', 'MÊME', 'SANS', 'LE', 'SON'];
  return (
    <AbsoluteFill>
      <Title tag="LE BON RÉFLEXE" color={GREEN}>Des sous-titres<br /><Grad>qu’on lit en un coup d’œil.</Grad></Title>
      <Phone x={110} y={660} w={330} p={sp(f - 2)}>
        <Img src={staticFile(`media/${ads[1]}`)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
        <div style={{position: 'absolute', left: 14, right: 14, top: '46%', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 6}}>
          {subWords.map((w, i) => { const a = 10 + i * 8; return <span key={i} style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 30, color: '#fff', padding: '2px 8px', borderRadius: 8, background: f >= a && f < a + 16 ? PURPLE : 'rgba(0,0,0,0.65)', opacity: f >= a ? 1 : 0.25}}>{w}</span>; })}
        </div>
      </Phone>
      <div style={{position: 'absolute', left: 520, top: 740, display: 'flex', flexDirection: 'column', gap: 26}}>
        {ticks.map((t) => { const a = at(words, t.k, 30); return <div key={t.k} style={{display: 'flex', alignItems: 'center', gap: 14, fontSize: 40, fontWeight: 800, color: INK, opacity: prog(f, a, 8)}}><span style={{width: 50, height: 50, borderRadius: 25, background: '#DCFCE7', color: GREEN, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, transform: `scale(${sp(f - a, 9)})`}}>✓</span>{t.l}</div>; })}
      </div>
    </AbsoluteFill>
  );
};

export const VraiFaux8: React.FC<{cfg: VFCfg}> = ({cfg}) => (
  <BriefShell cfg={cfg} comps={[<VFS1 key={0} cfg={cfg} />, <VFS2 key={1} cfg={cfg} />, <VFS3 key={2} cfg={cfg} />, <V8S4 key={3} words={cfg.scenes[3].words} ads={cfg.ads} />, <V8S5 key={4} words={cfg.scenes[4].words} ads={cfg.ads} />, <VFS6 key={5} ads={cfg.ads} />]} />
);

/* ---------- #9 : les 3 premières secondes ---------- */
const V9S4: React.FC<{words: Word[]; ads: string[]}> = ({words, ads}) => {
  const f = useCurrentFrame();
  const stop = at(words, 'accroche', 70);
  const scroll = interpolate(f, [0, stop], [0, 1400], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const cards = Array.from({length: 9}, (_, i) => i);
  const sec = Math.min(3, Math.max(0, (f - 6) / 30));
  return (
    <AbsoluteFill>
      <Title tag="POURQUOI" color={PURPLE}>Dans le fil,<br /><Grad>ça défile vite.</Grad></Title>
      <Phone x={110} y={660} w={330} p={sp(f - 2)}>
        <div style={{position: 'absolute', left: 0, right: 0, top: 0, transform: `translateY(${-scroll % 1400}px)`, background: '#fff'}}>
          {cards.map((i) => (
            <div key={i} style={{height: 200, margin: 10, borderRadius: 14, background: i === 4 ? 'transparent' : '#E5E7EB', overflow: 'hidden', position: 'relative'}}>
              {i === 4 ? <Img src={staticFile(`media/${ads[0]}`)} style={{width: '100%', height: '100%', objectFit: 'cover'}} /> : <div style={{margin: 14, height: 14, width: '60%', borderRadius: 7, background: '#CBD5E1'}} />}
            </div>
          ))}
        </div>
        <div style={{position: 'absolute', right: 16, top: '50%', fontSize: 50, opacity: f < stop ? 1 : 0}}>👆</div>
      </Phone>
      <div style={{position: 'absolute', left: 520, top: 720, width: 450}}>
        <div style={{fontSize: 30, fontWeight: 800, color: MUTED}}>Le temps pour convaincre</div>
        <div style={{marginTop: 14, height: 44, borderRadius: 22, background: '#E5E7EB', overflow: 'hidden'}}><div style={{width: `${(sec / 3) * 100}%`, height: '100%', background: RED}} /></div>
        <div style={{marginTop: 12, fontFamily: DISPLAY, fontWeight: 700, fontSize: 90, color: RED}}>{sec.toFixed(1)} s</div>
        {f >= stop && <div style={{marginTop: 10, padding: '14px 20px', borderRadius: 18, background: '#FEF2F2', color: '#B91C1C', fontSize: 28, fontWeight: 800, transform: `scale(${sp(f - stop, 10)})`}}>Pas accroché ? Il scrolle.</div>}
      </div>
    </AbsoluteFill>
  );
};

const V9S5: React.FC<{words: Word[]}> = ({words}) => {
  const f = useCurrentFrame();
  const hooks = [{k: 'question', l: '❓ Une question', d: '« Tu fais encore ça ? »'}, {k: 'visage', l: '🙂 Un visage', d: 'Quelqu’un qui te parle'}, {k: 'mouvement', l: '⚡ Un mouvement', d: 'Ça bouge dès la 1re image'}];
  const logo = at(words, 'logo', 110);
  return (
    <AbsoluteFill>
      <Title tag="LE BON RÉFLEXE" color={GREEN}>Commence fort,<br /><Grad>dès la première image.</Grad></Title>
      <div style={{position: 'absolute', left: 110, right: 110, top: 680, display: 'flex', flexDirection: 'column', gap: 20}}>
        {hooks.map((h) => { const a = at(words, h.k, 30); return (
          <div key={h.k} style={{display: 'flex', alignItems: 'center', gap: 20, padding: '22px 28px', borderRadius: 24, background: '#fff', border: `3px solid ${f >= a ? '#86EFAC' : '#E5E7EB'}`, opacity: prog(f, a, 8), transform: `translateX(${(1 - sp(f - a)) * 100}px)`}}>
            <div style={{flex: 1}}><div style={{fontSize: 38, fontWeight: 800, color: INK}}>{h.l}</div><div style={{fontSize: 26, color: MUTED, marginTop: 4}}>{h.d}</div></div>
            <span style={{fontSize: 40, color: GREEN}}>✓</span>
          </div>); })}
        {f >= logo && <div style={{display: 'flex', alignItems: 'center', gap: 20, padding: '20px 28px', borderRadius: 24, background: '#FEF2F2', border: '3px solid #FECACA', transform: `scale(${sp(f - logo, 10)})`}}><div style={{flex: 1, fontSize: 38, fontWeight: 800, color: '#991B1B', textDecoration: 'line-through'}}>🏷️ Ton logo en premier</div><span style={{fontSize: 40, color: RED}}>✕</span></div>}
      </div>
    </AbsoluteFill>
  );
};

export const VraiFaux9: React.FC<{cfg: VFCfg}> = ({cfg}) => (
  <BriefShell cfg={cfg} comps={[<VFS1 key={0} cfg={cfg} />, <VFS2 key={1} cfg={cfg} />, <VFS3 key={2} cfg={cfg} />, <V9S4 key={3} words={cfg.scenes[3].words} ads={cfg.ads} />, <V9S5 key={4} words={cfg.scenes[4].words} />, <VFS6 key={5} ads={cfg.ads} />]} />
);
