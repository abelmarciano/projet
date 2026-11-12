// « Le brief Meta » — épisode 7 : Pixel et API Conversions.
import React from 'react';
import {AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame} from 'remotion';
import {DISPLAY, GRAD, INK, MUTED, Check, MetaMark, prog} from '../chatpub/SplitChat';
import {BriefShell, Grad, Headline, Label, Logo, Scene, ease} from './BriefAndromeda';

type Word = {w: string; s: number; e: number};
export type CapiCfg = {episode: number; scenes: Scene[]; bed: string; ads: string[]};
const at = (words: Word[], k: string, d = 1, n = 0) => { const w = words.filter((x) => x.w.toLowerCase().includes(k))[n]; return Math.round(((w?.s ?? d) - 0.1) * 30); };
const sp = (f: number, d = 12) => spring({frame: f, fps: 30, config: {damping: d}});
const RED = '#DC2626';
const GREEN = '#16A34A';
const BLUE = '#0866FF';
const Y = 900; // axe des flux
const XS = 250, XM = 840; // source → Meta

const Node: React.FC<{x: number; y?: number; f: number; start: number; icon: React.ReactNode; label: string; color?: string}> = ({x, y = Y, f, start, icon, label, color = '#E5E7EB'}) => (
  <div style={{position: 'absolute', left: x - 115, top: y - 115, width: 230, height: 230, borderRadius: 40, background: '#fff', border: `3px solid ${color}`, boxShadow: '0 30px 50px -30px rgba(15,23,42,0.55)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, transform: `scale(${sp(f - start)})`}}>
    <div style={{fontSize: 80, lineHeight: 1, display: 'flex'}}>{icon}</div>
    <div style={{fontSize: 28, fontWeight: 800, color: INK}}>{label}</div>
  </div>
);
const MetaNode: React.FC<{f: number; start: number; y?: number; glow?: number}> = ({f, start, y = Y, glow = 0}) => (
  <Node x={XM} y={y} f={f} start={start} icon={<MetaMark s={64} />} label="Meta" color={glow > 0.5 ? '#93C5FD' : '#E5E7EB'} />
);
const Wire: React.FC<{y?: number; y2?: number; p: number; dashed?: boolean; color?: string}> = ({y = Y, y2 = Y, p, dashed, color = '#CBD5E1'}) => (
  <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
    <line x1={XS + 120} y1={y} x2={XS + 120 + (XM - XS - 240) * p} y2={y + (y2 - y) * p} stroke={color} strokeWidth={6} strokeDasharray={dashed ? '14 12' : undefined} strokeLinecap="round" />
  </svg>
);
// pastille d'événement qui voyage de la source vers Meta
const Chip: React.FC<{f: number; s: number; label: string; y?: number; y2?: number; lost?: boolean; color?: string; dy?: number}> = ({f, s, label, y = Y, y2 = Y, lost, color = BLUE, dy = 0}) => {
  if (f < s) return null;
  const t = interpolate(f, [s, s + 26], [0, lost ? 0.5 : 1], ease);
  const x = XS + 120 + (XM - XS - 240) * t;
  const yy = y + (y2 - y) * t + dy;
  const fade = lost ? 1 - prog(f, s + 30, 10) : 1 - prog(f, s + 26, 6);
  return (
    <div style={{position: 'absolute', left: x - 90, top: yy - 30, width: 180, height: 60, borderRadius: 99, background: lost && f > s + 22 ? '#FEE2E2' : '#fff', border: `3px solid ${lost && f > s + 22 ? RED : color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 800, color: lost && f > s + 22 ? RED : INK, opacity: fade, boxShadow: '0 10px 20px -12px rgba(15,23,42,0.5)'}}>{lost && f > s + 22 ? '✕ perdu' : label}</div>
  );
};

const S1: React.FC<{words: Word[]}> = ({words}) => {
  const f = useCurrentFrame();
  const sale = at(words, 'ventes');
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 0, right: 0, top: 410, textAlign: 'center', transform: `scale(${0.85 + sp(f - 2, 14) * 0.15})`}}>
        <div style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 104, letterSpacing: '-0.035em', lineHeight: 1.02, color: INK}}>Pixel &amp;<br /><Grad>API Conversions</Grad></div>
        <div style={{fontSize: 38, fontWeight: 600, color: MUTED, marginTop: 24, opacity: prog(f, 12, 10)}}>Les yeux de Meta sur tes ventes</div>
      </div>
      <div style={{position: 'absolute', inset: 0, transform: 'translateY(120px)'}}>
        <Node x={XS} f={f} start={14} icon="🛍️" label="Ton site" />
        <MetaNode f={f} start={18} glow={prog(f, sale + 26, 4)} />
        <Wire p={prog(f, 22, 14)} dashed />
        <Chip f={f} s={sale} label="🛒 Achat" />
      </div>
    </AbsoluteFill>
  );
};

const S2: React.FC<{words: Word[]}> = ({words}) => {
  const f = useCurrentFrame();
  const ev = [{k: 'page', l: '👀 Page vue'}, {k: 'panier', l: '🛒 Panier'}, {k: 'acheté', l: '💳 Achat'}];
  return (
    <AbsoluteFill>
      <Label text="LE PIXEL" color={BLUE} />
      <Headline>Un code sur ton site<br /><span style={{color: BLUE}}>qui prévient Meta.</span></Headline>
      <Node x={XS} f={f} start={2} icon="🛍️" label="Ton site" />
      <div style={{position: 'absolute', left: XS - 70, top: Y + 130, padding: '8px 16px', borderRadius: 12, background: INK, color: '#A5B4FC', fontFamily: 'monospace', fontSize: 22, fontWeight: 700, opacity: prog(f, at(words, 'code'), 8)}}>&lt;pixel /&gt;</div>
      <MetaNode f={f} start={6} />
      <Wire p={prog(f, 8, 14)} dashed />
      {ev.map((e) => <Chip key={e.k} f={f} s={at(words, e.k)} label={e.l} />)}
      {ev.map((e, i) => { const s = at(words, e.k) + 26; return f >= s && <div key={e.k} style={{position: 'absolute', left: XM - 110, top: Y + 140 + i * 62, width: 220, display: 'flex', alignItems: 'center', gap: 8, fontSize: 24, fontWeight: 800, color: '#15803D', transform: `translateY(${(1 - sp(f - s)) * 20}px)`, opacity: sp(f - s)}}><Check s={24} /> {e.l.slice(3)}</div>; })}
    </AbsoluteFill>
  );
};

const S3: React.FC<{words: Word[]}> = ({words}) => {
  const f = useCurrentFrame();
  const obs = [{k: 'bloqueurs', l: '🛡️ Bloqueur de pub'}, {k: 'navigateurs', l: '🌐 Navigateur'}, {k: 'iphone', l: '📱 iPhone'}];
  const lostAt = at(words, 'partie');
  return (
    <AbsoluteFill>
      <Label text="LE PROBLÈME" color={RED} />
      <Headline>Des signaux<br /><span style={{color: RED}}>perdus en route.</span></Headline>
      <Node x={XS} f={f} start={-20} icon="🛍️" label="Ton site" />
      <MetaNode f={f} start={-20} />
      <Wire p={1} dashed />
      {obs.map((o, i) => { const s = at(words, o.k); return f >= s && <div key={o.k} style={{position: 'absolute', left: 340 + i * 3, top: 1080 + i * 70, padding: '10px 18px', borderRadius: 14, background: '#FEF2F2', border: '2px solid #FECACA', color: '#B91C1C', fontSize: 26, fontWeight: 800, transform: `scale(${sp(f - s, 10)})`, transformOrigin: 'left center'}}>{o.l}</div>; })}
      <Chip f={f} s={4} label="👀 Page vue" />
      <Chip f={f} s={lostAt - 10} label="🛒 Panier" lost />
      <Chip f={f} s={lostAt + 4} label="💳 Achat" lost />
    </AbsoluteFill>
  );
};

const S4: React.FC<{words: Word[]}> = ({words}) => {
  const f = useCurrentFrame();
  const srv = at(words, 'serveur'), fi = at(words, 'fiable');
  const Y1 = 760, Y2 = 1060;
  return (
    <AbsoluteFill>
      <Label text="LA SOLUTION" color={GREEN} />
      <Headline>L’API Conversions,<br /><Grad>depuis ton serveur.</Grad></Headline>
      <div style={{position: 'absolute', inset: 0, transform: `translateY(${Y1 - Y}px)`, opacity: 0.4}}>
        <Node x={XS} f={f} start={-20} icon="🛍️" label="Pixel" />
        <Wire p={1} dashed />
      </div>
      <div style={{position: 'absolute', inset: 0, transform: `translateY(${Y2 - Y}px)`}}>
        <Node x={XS} f={f} start={Math.min(srv, 30)} icon="🖥️" label="Ton serveur" color="#86EFAC" />
        <Wire p={prog(f, Math.min(srv, 30) + 6, 14)} color={GREEN} />
        {[0, 1, 2].map((i) => <Chip key={i} f={f} s={Math.min(srv, 30) + 18 + i * 12} label={['👀 Page vue', '🛒 Panier', '💳 Achat'][i]} color={GREEN} />)}
      </div>
      <MetaNode f={f} start={-20} y={(Y1 + Y2) / 2} glow={1} />
      {f >= fi && <div style={{position: 'absolute', left: 0, right: 0, top: 1240, display: 'flex', justifyContent: 'center'}}><div style={{padding: '12px 26px', borderRadius: 99, background: '#DCFCE7', color: '#15803D', fontSize: 32, fontWeight: 800, transform: `scale(${sp(f - fi, 10)})`}}>✓ Plus fiable</div></div>}
    </AbsoluteFill>
  );
};

const S5: React.FC<{words: Word[]}> = ({words}) => {
  const f = useCurrentFrame();
  const both = at(words, 'deux'), dd = at(words, 'déduplication'), once = at(words, 'comptée');
  const Y1 = 760, Y2 = 1070;
  const merge = prog(f, dd + 8, 16);
  const chipX = interpolate(f, [both + 6, dd + 6], [XS + 130, 600], ease);
  return (
    <AbsoluteFill>
      <Label text="LE BON RÉGLAGE" color={GREEN} />
      <Headline>Les deux ensemble,<br /><Grad>dédupliqués.</Grad></Headline>
      <Node x={XS} y={Y1} f={f} start={0} icon="🛍️" label="Pixel" color="#93C5FD" />
      <Node x={XS} y={Y2} f={f} start={4} icon="🖥️" label="Serveur" color="#86EFAC" />
      <MetaNode f={f} start={8} y={(Y1 + Y2) / 2} glow={merge} />
      {[Y1, Y2].map((y, i) => f >= both && (
        <div key={i} style={{position: 'absolute', left: chipX - 90, top: y + ((Y1 + Y2) / 2 - y) * merge - 30, width: 180, height: 60, borderRadius: 99, background: '#fff', border: `3px solid ${i ? GREEN : BLUE}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 800, color: INK, opacity: i ? 1 - merge : 1, boxShadow: '0 10px 20px -12px rgba(15,23,42,0.5)'}}>💳 Achat</div>
      ))}
      {f >= dd && <div style={{position: 'absolute', left: 400, top: (Y1 + Y2) / 2 + 60, padding: '8px 16px', borderRadius: 99, backgroundImage: GRAD, color: '#fff', fontSize: 22, fontWeight: 800, transform: `scale(${sp(f - dd, 10)})`}}>ID d’événement identique</div>}
      {f >= once && <div style={{position: 'absolute', left: 0, right: 0, top: 1250, display: 'flex', justifyContent: 'center'}}><div style={{padding: '12px 26px', borderRadius: 99, background: '#DCFCE7', color: '#15803D', fontSize: 32, fontWeight: 800, transform: `scale(${sp(f - once, 10)})`}}>✓ 1 vente = comptée 1 fois</div></div>}
    </AbsoluteFill>
  );
};

const S6: React.FC<{ads: string[]}> = ({ads}) => {
  const f = useCurrentFrame();
  const rows = ['Pixel installé', 'API Conversions', 'Déduplication'];
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 0, right: 0, top: 350, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 22, transform: `scale(${0.8 + sp(f, 13) * 0.2})`}}>
        <div style={{filter: 'drop-shadow(0 20px 40px rgba(91,63,228,0.35))'}}><Logo s={110} /></div>
        <div style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 90, color: INK, letterSpacing: '-0.03em'}}>Growthity</div>
      </div>
      <div style={{position: 'absolute', left: 90, right: 90, top: 530, borderRadius: 34, background: '#fff', border: '2px solid #E5E7EB', padding: 34, boxShadow: '0 30px 60px -30px rgba(15,23,42,0.5)', opacity: prog(f, 6, 10), transform: `translateY(${(1 - prog(f, 6, 10)) * 40}px)`}}>
        <div style={{fontSize: 26, fontWeight: 800, letterSpacing: '0.12em', color: MUTED}}>SUIVI DES CONVERSIONS</div>
        {rows.map((r, i) => (
          <div key={r} style={{marginTop: 16, display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px', borderRadius: 18, background: '#F0FDF4', border: '2px solid #BBF7D0', fontSize: 32, fontWeight: 800, color: INK, opacity: prog(f, 12 + i * 6, 8)}}>
            <div style={{transform: `scale(${sp(f - 14 - i * 6, 9)})`, display: 'flex'}}><Check s={34} /></div>{r}
          </div>
        ))}
        <div style={{marginTop: 22, display: 'flex', alignItems: 'center', gap: 14}}>
          {ads.slice(0, 4).map((a, i) => <div key={i} style={{width: 92, height: 140, borderRadius: 12, overflow: 'hidden', transform: `scale(${sp(f - 34 - i * 3)})`}}><Img src={staticFile(`media/${a}`)} style={{width: '100%', height: '100%', objectFit: 'cover'}} /></div>)}
          <div style={{flex: 1, fontSize: 30, fontWeight: 800, color: '#15803D', opacity: prog(f, 46, 8)}}>Campagnes qui apprennent ✓</div>
        </div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1260, display: 'flex', justifyContent: 'center', opacity: prog(f, 54, 10)}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 14, padding: '18px 38px', borderRadius: 99, backgroundImage: GRAD, color: '#fff', fontSize: 36, fontWeight: 800, boxShadow: '0 20px 40px -14px rgba(91,63,228,0.7)'}}><Check s={34} c="#fff" /> Lien en bio pour commencer</div>
      </div>
    </AbsoluteFill>
  );
};

export const BriefCapi: React.FC<{cfg: CapiCfg}> = ({cfg}) => (
  <BriefShell cfg={cfg} comps={[<S1 key={0} words={cfg.scenes[0].words} />, <S2 key={1} words={cfg.scenes[1].words} />, <S3 key={2} words={cfg.scenes[2].words} />, <S4 key={3} words={cfg.scenes[3].words} />, <S5 key={4} words={cfg.scenes[4].words} />, <S6 key={5} ads={cfg.ads} />]} />
);
