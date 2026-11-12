// « Le brief Meta » — épisode 5 : augmenter le budget.
import React from 'react';
import {AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame} from 'remotion';
import {DISPLAY, GRAD, INK, MUTED, Check, Spinner, clamp, prog} from '../chatpub/SplitChat';
import {BriefShell, Grad, Headline, Label, Logo, Scene, ease} from './BriefAndromeda';

type Word = {w: string; s: number; e: number};
export type ScaleCfg = {episode: number; scenes: Scene[]; bed: string; ads: string[]};
const at = (words: Word[], k: string, d = 1) => { const w = words.find((x) => x.w.toLowerCase().includes(k)); return Math.round(((w?.s ?? d) - 0.1) * 30); };
const sp = (f: number, d = 12) => spring({frame: f, fps: 30, config: {damping: d}});
const RED = '#DC2626';
const GREEN = '#16A34A';
const PURPLE = '#5B3FE4';

const Ad: React.FC<{src: string; w: number | string; h: number; style?: React.CSSProperties}> = ({src, w, h, style}) => (
  <div style={{width: w, height: h, borderRadius: 14, overflow: 'hidden', boxShadow: '0 16px 30px -18px rgba(15,23,42,0.55)', background: '#fff', ...style}}>
    <Img src={staticFile(`media/${src}`)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
  </div>
);
const Card: React.FC<{style?: React.CSSProperties; children: React.ReactNode}> = ({style, children}) => (
  <div style={{position: 'absolute', borderRadius: 30, background: '#fff', border: '2px solid #E5E7EB', boxShadow: '0 30px 60px -32px rgba(15,23,42,0.5)', ...style}}>{children}</div>
);
const path = (pts: [number, number][]) => pts.map((q, i) => `${i ? 'L' : 'M'}${q[0].toFixed(1)},${q[1].toFixed(1)}`).join(' ');

const S1: React.FC<{words: Word[]}> = ({words}) => {
  const f = useCurrentFrame();
  const dbl = at(words, 'doubler'), bad = at(words, 'mauvaise');
  const fill = interpolate(f, [dbl, dbl + 6], [0.42, 0.95], ease);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 0, right: 0, top: 420, textAlign: 'center', transform: `scale(${0.85 + sp(f - 2, 14) * 0.15})`}}>
        <div style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 112, letterSpacing: '-0.035em', lineHeight: 1, color: INK}}>Augmenter<br /><Grad>le budget</Grad></div>
        <div style={{fontSize: 38, fontWeight: 600, color: MUTED, marginTop: 24, opacity: prog(f, 12, 10)}}>Comment monter sans tout casser</div>
      </div>
      <Card style={{left: 140, right: 140, top: 830, padding: '30px 36px', opacity: prog(f, 14, 10), transform: `translateY(${(1 - prog(f, 14, 10)) * 40}px)`}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <div style={{fontSize: 30, fontWeight: 800, color: INK}}>💶 Budget par jour</div>
          {f >= dbl && <div style={{padding: '6px 18px', borderRadius: 99, background: '#FEE2E2', color: '#B91C1C', fontFamily: DISPLAY, fontSize: 36, fontWeight: 700, transform: `scale(${sp(f - dbl, 9)})`}}>×2</div>}
        </div>
        <div style={{marginTop: 24, height: 26, borderRadius: 99, background: '#F1F5F9', position: 'relative'}}>
          <div style={{width: `${fill * 100}%`, height: '100%', borderRadius: 99, background: f >= dbl ? RED : GRAD}} />
          <div style={{position: 'absolute', left: `calc(${fill * 100}% - 22px)`, top: -9, width: 44, height: 44, borderRadius: 99, background: '#fff', border: `4px solid ${f >= dbl ? RED : PURPLE}`}} />
        </div>
        <div style={{marginTop: 22, fontSize: 26, fontWeight: 700, color: MUTED}}>Du jour au lendemain</div>
      </Card>
      {f >= bad && <div style={{position: 'absolute', left: 0, right: 0, top: 1150, display: 'flex', justifyContent: 'center'}}><div style={{padding: '14px 30px', borderRadius: 99, background: RED, color: '#fff', fontSize: 36, fontWeight: 800, transform: `scale(${sp(f - bad, 9)})`}}>✕ Mauvaise idée</div></div>}
    </AbsoluteFill>
  );
};

const S2: React.FC<{words: Word[]}> = ({words}) => {
  const f = useCurrentFrame();
  const rel = at(words, 'relancer'), cost = at(words, 'coûts');
  const X0 = 150, X1 = 930, Y = 1150, J = 520;
  const pts: [number, number][] = Array.from({length: 50}).map((_, i) => { const x = X0 + (i / 49) * (X1 - X0); const after = Math.max(0, (x - J) / (X1 - J)); return [x, Y - 120 - Math.sin(i * 0.9) * 6 - Math.pow(after, 0.7) * 230]; });
  const pBefore = interpolate(f, [4, 30], [0, 1], ease), pAfter = interpolate(f, [cost - 6, cost + 24], [0, 1], ease);
  const nB = pts.filter((q) => q[0] <= J).length;
  const before = pts.slice(0, Math.max(2, Math.ceil(nB * pBefore)));
  const after = pts.slice(nB - 1, nB - 1 + Math.max(1, Math.ceil((pts.length - nB + 1) * pAfter)));
  return (
    <AbsoluteFill>
      <Label text="LE RISQUE" color={RED} />
      <Headline>Une hausse brutale<br /><span style={{color: RED}}>casse tout.</span></Headline>
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        <line x1={X0} y1={Y} x2={X1} y2={Y} stroke="#E2E8F0" strokeWidth={3} />
        <line x1={J} y1={760} x2={J} y2={Y} stroke="#94A3B8" strokeWidth={3} strokeDasharray="10 10" opacity={prog(f, 20, 8)} />
        <path d={path(before)} fill="none" stroke={PURPLE} strokeWidth={8} strokeLinecap="round" />
        {after.length > 1 && <path d={path(after)} fill="none" stroke={RED} strokeWidth={8} strokeLinecap="round" />}
      </svg>
      <div style={{position: 'absolute', left: J - 90, top: 715, padding: '6px 16px', borderRadius: 99, background: INK, color: '#fff', fontSize: 24, fontWeight: 800, opacity: prog(f, 20, 8)}}>Budget ×2</div>
      <div style={{position: 'absolute', left: X0, top: 1170, fontSize: 26, fontWeight: 700, color: MUTED, opacity: prog(f, 4, 8)}}>Coût par résultat</div>
      {f >= rel && <div style={{position: 'absolute', left: 600, top: 1040, display: 'flex', alignItems: 'center', gap: 10, padding: '10px 20px', borderRadius: 99, background: '#FEF3C7', color: '#B45309', fontSize: 28, fontWeight: 800, transform: `scale(${sp(f - rel, 10)})`}}><Spinner f={f} s={24} /> En apprentissage</div>}
      {f >= cost && <div style={{position: 'absolute', right: 140, top: 790, padding: '8px 18px', borderRadius: 99, background: '#FEE2E2', color: '#B91C1C', fontSize: 28, fontWeight: 800, transform: `scale(${sp(f - cost - 14, 10)})`}}>📈 coûts qui s’envolent</div>}
    </AbsoluteFill>
  );
};

const S3: React.FC<{words: Word[]}> = ({words}) => {
  const f = useCurrentFrame();
  const items = [{k: 'sorti', l: 'Sorti de l’apprentissage', icon: <div style={{padding: '6px 14px', borderRadius: 99, background: '#DCFCE7', color: '#15803D', fontSize: 24, fontWeight: 800}}>● Actif</div>}, {k: 'stable', l: 'Coût par résultat stable', icon: <svg width={120} height={40}><path d="M4,22 L30,18 L56,24 L82,19 L116,21" fill="none" stroke={GREEN} strokeWidth={6} strokeLinecap="round" /></svg>}];
  return (
    <AbsoluteFill>
      <Label text="AVANT D’AUGMENTER" color={GREEN} />
      <Headline>Vérifie<br /><Grad>deux choses.</Grad></Headline>
      {items.map((it, i) => {
        const s = at(words, it.k);
        const ok = prog(f, s, 8);
        return (
          <Card key={it.k} style={{left: 110, right: 110, top: 760 + i * 210, height: 160, display: 'flex', alignItems: 'center', gap: 26, padding: '0 34px', opacity: prog(f, 4 + i * 6, 10), transform: `translateX(${(1 - prog(f, 4 + i * 6, 10)) * 100}px)`, borderColor: ok > 0.5 ? '#86EFAC' : '#E5E7EB'}}>
            <div style={{width: 70, height: 70, borderRadius: 22, border: `4px solid ${ok > 0.5 ? GREEN : '#CBD5E1'}`, background: ok > 0.5 ? '#F0FDF4' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center'}}><div style={{transform: `scale(${sp(f - s, 9)})`}}><Check s={44} /></div></div>
            <div style={{flex: 1, fontSize: 38, fontWeight: 800, color: INK}}>{it.l}</div>
            <div style={{opacity: ok}}>{it.icon}</div>
          </Card>
        );
      })}
    </AbsoluteFill>
  );
};

const S4: React.FC<{words: Word[]}> = ({words}) => {
  const f = useCurrentFrame();
  const st = at(words, 'paliers'), days = at(words, 'jours');
  const steps = 5;
  return (
    <AbsoluteFill>
      <Label text="LA MÉTHODE" color={GREEN} />
      <Headline>Monte<br /><Grad>par paliers.</Grad></Headline>
      <div style={{position: 'absolute', left: 140, right: 140, top: 1180, height: 3, background: '#E2E8F0'}} />
      {Array.from({length: steps}).map((_, i) => {
        const p = sp(f - st - i * 7, 14);
        const h = 110 + i * 85;
        return (
          <div key={i} style={{position: 'absolute', left: 150 + i * 158, top: 1180 - h * p, width: 140, height: h * p, borderRadius: '18px 18px 0 0', background: GRAD, opacity: 0.55 + i * 0.1}}>
            <div style={{position: 'absolute', left: 0, right: 0, top: h * p + 14, textAlign: 'center', fontSize: 34, opacity: prog(f, days + i * 4, 8)}}>📅</div>
          </div>
        );
      })}
      <div style={{position: 'absolute', left: 0, right: 0, top: 1250, textAlign: 'center', fontSize: 30, fontWeight: 800, color: MUTED, opacity: prog(f, days + 10, 8)}}>Quelques jours entre chaque palier</div>
    </AbsoluteFill>
  );
};

const S5: React.FC<{words: Word[]; ads: string[]}> = ({words, ads}) => {
  const f = useCurrentFrame();
  const cr = at(words, 'créas'), bud = at(words, 'budget');
  const b = interpolate(f, [bud - 4, bud + 30], [0.35, 0.9], ease);
  const n = Math.round(interpolate(f, [cr, bud + 34], [2, 8], clamp));
  return (
    <AbsoluteFill>
      <Label text="POUR ALLER PLUS LOIN" color={GREEN} />
      <Headline>Plus de budget,<br /><Grad>plus de créas.</Grad></Headline>
      <Card style={{left: 110, right: 110, top: 730, padding: '26px 32px'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 30, fontWeight: 800, color: INK}}><span>💶 Budget</span><span style={{color: '#15803D'}}>↑</span></div>
        <div style={{marginTop: 16, height: 26, borderRadius: 99, background: '#F1F5F9'}}><div style={{width: `${b * 100}%`, height: '100%', borderRadius: 99, background: GRAD}} /></div>
        <div style={{marginTop: 26, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14}}>
          {ads.slice(0, 8).map((a, i) => <div key={i} style={{transform: `scale(${i < n ? sp(f - (i < 2 ? 4 : cr + (i - 2) * 5)) : 0})`}}><Ad src={a} w="100%" h={190} /></div>)}
        </div>
      </Card>
    </AbsoluteFill>
  );
};

const S6: React.FC<{ads: string[]}> = ({ads}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 0, right: 0, top: 350, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 22, transform: `scale(${0.8 + sp(f, 13) * 0.2})`}}>
        <div style={{filter: 'drop-shadow(0 20px 40px rgba(91,63,228,0.35))'}}><Logo s={110} /></div>
        <div style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 90, color: INK, letterSpacing: '-0.03em'}}>Growthity</div>
      </div>
      <Card style={{left: 90, right: 90, top: 530, padding: 34, opacity: prog(f, 8, 10), transform: `translateY(${(1 - prog(f, 8, 10)) * 40}px)`}}>
        <div style={{fontSize: 26, fontWeight: 800, letterSpacing: '0.12em', color: MUTED}}>RECOMMANDATION</div>
        <div style={{marginTop: 16, padding: '18px 22px', borderRadius: 18, background: '#F0FDF4', border: '2px solid #BBF7D0', fontSize: 34, fontWeight: 800, color: INK}}>📈 Bon moment pour augmenter le budget</div>
        <div style={{marginTop: 16, display: 'flex', gap: 22, fontSize: 26, fontWeight: 700, color: '#15803D'}}>
          <span style={{display: 'flex', alignItems: 'center', gap: 8, opacity: prog(f, 18, 8)}}><Check s={26} /> Sorti d’apprentissage</span>
          <span style={{display: 'flex', alignItems: 'center', gap: 8, opacity: prog(f, 24, 8)}}><Check s={26} /> Coût stable</span>
        </div>
        <div style={{marginTop: 22, fontSize: 24, fontWeight: 800, letterSpacing: '0.1em', color: MUTED, opacity: prog(f, 30, 8)}}>NOUVELLES CRÉAS PRÊTES</div>
        <div style={{marginTop: 12, display: 'flex', gap: 10}}>
          {ads.slice(2, 8).map((a, i) => <div key={i} style={{flex: 1, transform: `scale(${sp(f - 32 - i * 3)})`}}><Ad src={a} w="100%" h={150} /></div>)}
        </div>
      </Card>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1240, display: 'flex', justifyContent: 'center', opacity: prog(f, 56, 10)}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 14, padding: '18px 38px', borderRadius: 99, backgroundImage: GRAD, color: '#fff', fontSize: 36, fontWeight: 800, boxShadow: '0 20px 40px -14px rgba(91,63,228,0.7)'}}><Check s={34} c="#fff" /> Lien en bio pour commencer</div>
      </div>
    </AbsoluteFill>
  );
};

export const BriefScale: React.FC<{cfg: ScaleCfg}> = ({cfg}) => (
  <BriefShell cfg={cfg} comps={[<S1 key={0} words={cfg.scenes[0].words} />, <S2 key={1} words={cfg.scenes[1].words} />, <S3 key={2} words={cfg.scenes[2].words} />, <S4 key={3} words={cfg.scenes[3].words} />, <S5 key={4} words={cfg.scenes[4].words} ads={cfg.ads} />, <S6 key={5} ads={cfg.ads} />]} />
);
