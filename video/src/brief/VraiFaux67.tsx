// « Vrai ou faux ? » #6 (couper une pub après 24 h → FAUX) et #7 (vertical pour Reels/Stories → VRAI).
import React from 'react';
import {AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame} from 'remotion';
import {DISPLAY, INK, MUTED, Spinner, prog} from '../chatpub/SplitChat';
import {BriefShell, Grad, ease} from './BriefAndromeda';
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

/* ---------- #6 : la courbe des premiers jours ---------- */
const V6S4: React.FC<{words: Word[]}> = ({words}) => {
  const f = useCurrentFrame();
  const bouge = at(words, 'bougent', 60);
  const X0 = 140, X1 = 940, Y = 1120;
  const pts = Array.from({length: 70}, (_, i) => { const x = i / 69; const noise = Math.sin(i * 1.7) * 140 * Math.max(0, 1 - x * 1.6) + Math.sin(i * 0.9) * 60 * Math.max(0, 1 - x * 2); return [X0 + x * (X1 - X0), Y - 200 - noise] as [number, number]; });
  const p = interpolate(f, [6, 100], [0, 1], ease);
  const n = Math.max(2, Math.ceil(pts.length * p));
  const d = pts.slice(0, n).map((q, i) => `${i ? 'L' : 'M'}${q[0]},${q[1]}`).join(' ');
  return (
    <AbsoluteFill>
      <Title tag="POURQUOI" color={PURPLE}>Les premiers jours,<br /><Grad>Meta apprend.</Grad></Title>
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        <line x1={X0} y1={Y} x2={X1} y2={Y} stroke="#E2E8F0" strokeWidth={3} />
        <rect x={X0} y={680} width={(X1 - X0) * 0.45} height={Y - 680} fill="#FEF3C7" opacity={0.6 * prog(f, 10, 10)} rx={16} />
        <path d={d} fill="none" stroke={PURPLE} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {['J1', 'J2', 'J3', 'J4', 'J5', 'J6', 'J7'].map((j, i) => <div key={j} style={{position: 'absolute', left: X0 + (i / 6) * (X1 - X0) - 20, top: Y + 14, fontSize: 24, fontWeight: 800, color: MUTED, opacity: prog(f, 4 + i * 3, 8)}}>{j}</div>)}
      <div style={{position: 'absolute', left: X0 + 16, top: 700, display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 99, background: '#FEF3C7', color: '#B45309', fontSize: 24, fontWeight: 800, opacity: prog(f, 12, 8)}}><Spinner f={f} s={22} /> En apprentissage</div>
      {f >= bouge && <div style={{position: 'absolute', right: 140, top: 760, padding: '8px 16px', borderRadius: 99, background: '#DCFCE7', color: '#15803D', fontSize: 26, fontWeight: 800, transform: `scale(${sp(f - bouge, 10)})`}}>Ça se stabilise ✓</div>}
    </AbsoluteFill>
  );
};

const V6S5: React.FC<{words: Word[]}> = ({words}) => {
  const f = useCurrentFrame();
  const dec = at(words, 'décider', 90);
  return (
    <AbsoluteFill>
      <Title tag="LE BON RÉFLEXE" color={GREEN}>Juge sur plusieurs jours,<br /><Grad>pas sur une matinée.</Grad></Title>
      <div style={{position: 'absolute', left: 110, right: 110, top: 700, display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 12}}>
        {Array.from({length: 7}).map((_, i) => {
          const last = i === 6;
          const p = sp(f - 4 - i * 4);
          return (
            <div key={i} style={{height: 180, borderRadius: 20, background: last ? '#F0FDF4' : '#fff', border: `3px solid ${last && f >= dec ? GREEN : '#E5E7EB'}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, transform: `scale(${p})`}}>
              <div style={{fontSize: 24, fontWeight: 800, color: MUTED}}>J{i + 1}</div>
              <div style={{fontSize: 40}}>{i === 0 ? '✂️' : last && f >= dec ? '✅' : '👀'}</div>
            </div>
          );
        })}
      </div>
      <div style={{position: 'absolute', left: 110, top: 900, width: 120, height: 8, borderRadius: 4, background: RED, transform: `rotate(-20deg) scaleX(${prog(f, 14, 8)})`, transformOrigin: 'left'}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 960, display: 'flex', justifyContent: 'center', gap: 22}}>
        <span style={{padding: '12px 22px', borderRadius: 16, background: '#FEF2F2', color: '#B91C1C', fontSize: 28, fontWeight: 800, opacity: prog(f, 14, 8)}}>✕ Couper après 24 h</span>
        {f >= dec && <span style={{padding: '12px 22px', borderRadius: 16, background: '#DCFCE7', color: '#15803D', fontSize: 28, fontWeight: 800, transform: `scale(${sp(f - dec, 10)})`}}>✓ Décider avec assez de résultats</span>}
      </div>
    </AbsoluteFill>
  );
};

export const VraiFaux6: React.FC<{cfg: VFCfg}> = ({cfg}) => (
  <BriefShell cfg={cfg} comps={[<VFS1 key={0} cfg={cfg} />, <VFS2 key={1} cfg={cfg} />, <VFS3 key={2} cfg={cfg} />, <V6S4 key={3} words={cfg.scenes[3].words} />, <V6S5 key={4} words={cfg.scenes[4].words} />, <VFS6 key={5} ads={cfg.ads} />]} />
);

/* ---------- #7 : carré vs vertical, zone sûre ---------- */
const Phone: React.FC<{x: number; y: number; w: number; children: React.ReactNode; p?: number; ring?: string}> = ({x, y, w, children, p = 1, ring}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, height: w * 1.9, borderRadius: w * 0.11, background: '#0B0A0C', padding: w * 0.035, transform: `scale(${p})`, boxShadow: ring ? `0 0 0 5px ${ring}, 0 30px 60px -30px rgba(15,23,42,0.6)` : '0 30px 60px -30px rgba(15,23,42,0.6)'}}>
    <div style={{position: 'relative', width: '100%', height: '100%', borderRadius: w * 0.08, overflow: 'hidden', background: '#111'}}>{children}</div>
  </div>
);

const V7S4: React.FC<{words: Word[]; ads: string[]}> = ({words, ads}) => {
  const f = useCurrentFrame();
  const vert = at(words, 'vertical', 80);
  const W = 330;
  return (
    <AbsoluteFill>
      <Title tag="POURQUOI" color={PURPLE}>Le carré laisse des trous.<br /><Grad>Le vertical remplit tout.</Grad></Title>
      <Phone x={130} y={680} w={W} p={sp(f - 4)}>
        <div style={{position: 'absolute', left: 0, right: 0, top: '50%', transform: 'translateY(-50%)', aspectRatio: '1 / 1'}}><Img src={staticFile(`media/${ads[1]}`)} style={{width: '100%', height: '100%', objectFit: 'cover'}} /></div>
        <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: '23%', background: 'repeating-linear-gradient(45deg, #1F2937, #1F2937 10px, #111827 10px, #111827 20px)', opacity: prog(f, 20, 8)}} />
        <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: '23%', background: 'repeating-linear-gradient(45deg, #1F2937, #1F2937 10px, #111827 10px, #111827 20px)', opacity: prog(f, 20, 8)}} />
      </Phone>
      <Phone x={620} y={680} w={W} p={sp(f - vert)} ring={f >= vert ? GREEN : undefined}>
        <Img src={staticFile(`media/${ads[1]}`)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      </Phone>
      <div style={{position: 'absolute', left: 130, width: W + 24, top: 1330, textAlign: 'center', fontSize: 28, fontWeight: 800, color: RED, opacity: prog(f, 20, 8)}}>Carré · bandes vides</div>
      <div style={{position: 'absolute', left: 620, width: W + 24, top: 1330, textAlign: 'center', fontSize: 28, fontWeight: 800, color: GREEN, opacity: prog(f, vert + 6, 8)}}>9:16 · plein écran ✓</div>
    </AbsoluteFill>
  );
};

const V7S5: React.FC<{words: Word[]; ads: string[]}> = ({words, ads}) => {
  const f = useCurrentFrame();
  const zone = at(words, 'zone', 40), bout = at(words, 'boutons', 90);
  const W = 420;
  return (
    <AbsoluteFill>
      <Title tag="ATTENTION" color="#D97706">Garde tes textes<br /><Grad>dans la zone sûre.</Grad></Title>
      <Phone x={(1080 - W - 30) / 2} y={660} w={W} p={sp(f - 2)}>
        <Img src={staticFile(`media/${ads[2]}`)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
        <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: '25%', background: 'rgba(220,38,38,0.45)', opacity: prog(f, bout, 8)}} />
        <div style={{position: 'absolute', right: 0, top: '35%', bottom: '25%', width: '16%', background: 'rgba(220,38,38,0.45)', opacity: prog(f, bout + 4, 8)}} />
        <div style={{position: 'absolute', right: '4%', bottom: '28%', display: 'flex', flexDirection: 'column', gap: 16, color: '#fff', fontSize: 30, opacity: prog(f, bout, 8)}}>{['♡', '💬', '➤'].map((t) => <span key={t}>{t}</span>)}</div>
        <div style={{position: 'absolute', left: '6%', right: '20%', top: '14%', bottom: '27%', border: '4px dashed #22C55E', borderRadius: 18, opacity: prog(f, zone, 8)}}>
          <div style={{position: 'absolute', left: 10, top: 10, padding: '6px 12px', borderRadius: 10, background: '#16A34A', color: '#fff', fontSize: 20, fontWeight: 800}}>✓ Zone sûre</div>
        </div>
      </Phone>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1300, display: 'flex', justifyContent: 'center', gap: 16, opacity: prog(f, bout + 8, 8)}}>
        <span style={{padding: '10px 20px', borderRadius: 14, background: '#FEF2F2', color: '#B91C1C', fontSize: 26, fontWeight: 800}}>✕ Bas et droite : boutons</span>
      </div>
    </AbsoluteFill>
  );
};

export const VraiFaux7: React.FC<{cfg: VFCfg}> = ({cfg}) => (
  <BriefShell cfg={cfg} comps={[<VFS1 key={0} cfg={cfg} />, <VFS2 key={1} cfg={cfg} />, <VFS3 key={2} cfg={cfg} />, <V7S4 key={3} words={cfg.scenes[3].words} ads={cfg.ads} />, <V7S5 key={4} words={cfg.scenes[4].words} ads={cfg.ads} />, <VFS6 key={5} ads={cfg.ads} />]} />
);
