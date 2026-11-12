// « Le brief Meta » — épisode 6 : Advantage+.
import React from 'react';
import {AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame} from 'remotion';
import {DISPLAY, GRAD, INK, MUTED, Check, clamp, prog} from '../chatpub/SplitChat';
import {BriefShell, Grad, Headline, Label, Logo, Scene, ease} from './BriefAndromeda';

type Word = {w: string; s: number; e: number};
export type AdvCfg = {episode: number; scenes: Scene[]; bed: string; ads: string[]};
const at = (words: Word[], k: string, d = 1, n = 0) => { const w = words.filter((x) => x.w.toLowerCase().includes(k))[n]; return Math.round(((w?.s ?? d) - 0.1) * 30); };
const sp = (f: number, d = 12) => spring({frame: f, fps: 30, config: {damping: d}});
const GREEN = '#16A34A';
const ORANGE = '#D97706';
const PURPLE = '#5B3FE4';

const Ad: React.FC<{src: string; w: number | string; h: number; style?: React.CSSProperties}> = ({src, w, h, style}) => (
  <div style={{width: w, height: h, borderRadius: 14, overflow: 'hidden', boxShadow: '0 16px 30px -18px rgba(15,23,42,0.55)', background: '#fff', ...style}}>
    <Img src={staticFile(`media/${src}`)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
  </div>
);
const Card: React.FC<{style?: React.CSSProperties; children: React.ReactNode}> = ({style, children}) => (
  <div style={{position: 'absolute', borderRadius: 30, background: '#fff', border: '2px solid #E5E7EB', boxShadow: '0 30px 60px -32px rgba(15,23,42,0.5)', ...style}}>{children}</div>
);
const Toggle: React.FC<{on: number; color?: string; s?: number}> = ({on, color = GREEN, s = 1}) => (
  <div style={{width: 92 * s, height: 52 * s, borderRadius: 99, background: on > 0.5 ? color : '#CBD5E1', position: 'relative', flexShrink: 0}}>
    <div style={{position: 'absolute', top: 6 * s, left: (6 + on * 40) * s, width: 40 * s, height: 40 * s, borderRadius: 99, background: '#fff', boxShadow: '0 2px 6px rgba(0,0,0,0.25)'}} />
  </div>
);
const LEVERS = [{k: 'audience', l: 'Audience', i: '🎯'}, {k: 'placements', l: 'Placements', i: '📱'}, {k: 'budget', l: 'Budget', i: '💶'}, {k: 'créa', l: 'Créa', i: '🎨'}];

const S1: React.FC<{words: Word[]}> = ({words}) => {
  const f = useCurrentFrame();
  const q = at(words, 'mais');
  const on = prog(f, 22, 10);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 0, right: 0, top: 420, textAlign: 'center', transform: `scale(${0.85 + sp(f - 2, 14) * 0.15})`}}>
        <div style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 132, letterSpacing: '-0.04em', lineHeight: 1, color: INK}}>Advantage<Grad>+</Grad></div>
        <div style={{fontSize: 40, fontWeight: 600, color: MUTED, marginTop: 26, opacity: prog(f, 12, 10)}}>Le pilote automatique de Meta</div>
      </div>
      <Card style={{left: 190, right: 190, top: 800, padding: '30px 36px', display: 'flex', alignItems: 'center', gap: 22, opacity: prog(f, 14, 10), transform: `translateY(${(1 - prog(f, 14, 10)) * 40}px)`}}>
        <div style={{fontSize: 56}}>✈️</div>
        <div style={{flex: 1}}>
          <div style={{fontSize: 32, fontWeight: 800, color: INK}}>Pilote automatique</div>
          <div style={{fontSize: 24, fontWeight: 700, color: on > 0.5 ? GREEN : MUTED}}>{on > 0.5 ? 'Activé' : 'Désactivé'}</div>
        </div>
        <Toggle on={on} color={PURPLE} />
      </Card>
      {f >= q && <div style={{position: 'absolute', left: 0, right: 0, top: 1060, textAlign: 'center', fontFamily: DISPLAY, fontWeight: 700, fontSize: 58, color: INK, transform: `scale(${sp(f - q, 10)})`}}>Tout lui confier <span style={{color: ORANGE}}>?</span></div>}
    </AbsoluteFill>
  );
};

const Lever: React.FC<{f: number; i: number; start: number; on: number; dim?: boolean; tag?: React.ReactNode}> = ({f, i, start, on, dim, tag}) => {
  const L = LEVERS[i];
  const p = sp(f - start);
  return (
    <Card style={{left: 110, right: 110, top: 700 + i * 150, height: 124, display: 'flex', alignItems: 'center', gap: 22, padding: '0 30px', opacity: p * (dim ? 0.45 : 1), transform: `translateX(${(1 - p) * 120}px)`, borderColor: on > 0.5 ? '#86EFAC' : '#E5E7EB'}}>
      <div style={{fontSize: 50}}>{L.i}</div>
      <div style={{flex: 1, fontSize: 40, fontWeight: 800, color: INK}}>{L.l}</div>
      {tag}
      <Toggle on={on} />
    </Card>
  );
};

const S2: React.FC<{words: Word[]}> = ({words}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Label text="CE QU’IL AUTOMATISE" />
      <Headline>4 leviers<br /><Grad>en automatique.</Grad></Headline>
      {LEVERS.map((L, i) => { const s = at(words, L.k, 1 + i); return <Lever key={L.k} f={f} i={i} start={s} on={0} />; })}
    </AbsoluteFill>
  );
};

const S3: React.FC<{words: Word[]}> = ({words}) => {
  const f = useCurrentFrame();
  const go = at(words, 'laisse');
  return (
    <AbsoluteFill>
      <Label text="EN GÉNÉRAL" color={GREEN} />
      <Headline>Laisse Meta<br /><Grad>piloter ces trois-là.</Grad></Headline>
      {LEVERS.map((L, i) => {
        const s = i < 3 ? at(words, L.k) : 0;
        const on = i < 3 ? prog(f, Math.max(s, go - 18 + i * 4), 8) : 0;
        return <Lever key={L.k} f={f} i={i} start={-20} on={on} dim={i === 3} tag={i < 3 && on > 0.5 ? <div style={{padding: '6px 14px', borderRadius: 99, background: '#DCFCE7', color: '#15803D', fontSize: 22, fontWeight: 800}}>Meta</div> : undefined} />;
      })}
    </AbsoluteFill>
  );
};

const S4: React.FC<{words: Word[]; ads: string[]}> = ({words, ads}) => {
  const f = useCurrentFrame();
  const mus = at(words, 'musique'), txt = at(words, 'texte'), chk = at(words, 'vérifie');
  const chips = [{s: mus, l: '🎵 Musique ajoutée', y: 760}, {s: txt, l: '✏️ Texte modifié', y: 900}];
  return (
    <AbsoluteFill>
      <Label text="ATTENTION" color={ORANGE} />
      <Headline>Les « améliorations »<br /><span style={{color: ORANGE}}>de créa automatiques.</span></Headline>
      <div style={{position: 'absolute', left: 130, top: 690, transform: `scale(${sp(f - 2)})`}}>
        <Ad src={ads[0]} w={330} h={520} />
        <div style={{position: 'absolute', left: 16, right: 16, bottom: 18, padding: '10px 14px', borderRadius: 12, background: 'rgba(255,255,255,0.92)', fontSize: 22, fontWeight: 800, color: INK, textDecoration: f >= txt ? 'line-through' : 'none'}}>Ton texte d’origine</div>
        {f >= mus && <div style={{position: 'absolute', right: -20, top: -20, width: 70, height: 70, borderRadius: 99, background: ORANGE, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, transform: `scale(${sp(f - mus, 9)})`}}>🎵</div>}
      </div>
      {chips.map((c) => f >= c.s && <div key={c.l} style={{position: 'absolute', left: 520, top: c.y, padding: '16px 22px', borderRadius: 20, background: '#FFFBEB', border: '3px solid #FCD34D', color: '#92400E', fontSize: 30, fontWeight: 800, transform: `translateX(${(1 - sp(f - c.s)) * 80}px)`, opacity: sp(f - c.s)}}>{c.l}</div>)}
      {f >= chk && <div style={{position: 'absolute', left: 520, top: 1060, display: 'flex', alignItems: 'center', gap: 12, padding: '16px 22px', borderRadius: 20, background: INK, color: '#fff', fontSize: 30, fontWeight: 800, transform: `scale(${sp(f - chk, 10)})`}}>👀 Vérifie le résultat</div>}
    </AbsoluteFill>
  );
};

const S5: React.FC<{words: Word[]; ads: string[]}> = ({words, ads}) => {
  const f = useCurrentFrame();
  const cr = at(words, 'créas'), sv = at(words, 'suivi');
  const lvl = interpolate(f, [cr, cr + 20, sv, sv + 24], [0.1, 0.55, 0.55, 0.95], ease);
  const R = 250, cx = 540, cy = 1000;
  const ang = -180 + lvl * 180;
  const arc = (a0: number, a1: number) => { const r = (a: number) => (a * Math.PI) / 180; return `M${cx + R * Math.cos(r(a0))},${cy + R * Math.sin(r(a0))} A${R},${R} 0 0 1 ${cx + R * Math.cos(r(a1))},${cy + R * Math.sin(r(a1))}`; };
  return (
    <AbsoluteFill>
      <Label text="LE PLUS IMPORTANT" color={GREEN} />
      <Headline>Le pilote a besoin<br /><Grad>de carburant.</Grad></Headline>
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        <defs><linearGradient id="g6" x1="0" x2="1"><stop offset="0" stopColor="#2563EB" /><stop offset="1" stopColor="#9333EA" /></linearGradient></defs>
        <path d={arc(-180, 0)} fill="none" stroke="#E2E8F0" strokeWidth={40} strokeLinecap="round" />
        <path d={arc(-180, Math.max(-179, ang))} fill="none" stroke="url(#g6)" strokeWidth={40} strokeLinecap="round" />
        <line x1={cx} y1={cy} x2={cx + (R - 60) * Math.cos((ang * Math.PI) / 180)} y2={cy + (R - 60) * Math.sin((ang * Math.PI) / 180)} stroke={INK} strokeWidth={10} strokeLinecap="round" />
        <circle cx={cx} cy={cy} r={22} fill={INK} />
      </svg>
      <div style={{position: 'absolute', left: 0, right: 0, top: 640, textAlign: 'center', fontSize: 50, opacity: prog(f, 4, 8)}}>⛽</div>
      <div style={{position: 'absolute', left: 100, top: 1090, width: 400, opacity: prog(f, cr, 8)}}>
        <div style={{display: 'flex', gap: 8, marginBottom: 10}}>{ads.slice(1, 5).map((a, i) => <div key={i} style={{transform: `scale(${sp(f - cr - i * 3)})`}}><Ad src={a} w={82} h={120} style={{borderRadius: 10}} /></div>)}</div>
        <div style={{display: 'flex', alignItems: 'center', gap: 8, fontSize: 28, fontWeight: 800, color: '#15803D'}}><Check s={28} /> Créas variées</div>
      </div>
      <div style={{position: 'absolute', right: 100, top: 1090, width: 420, textAlign: 'right', opacity: prog(f, sv, 8)}}>
        <div style={{display: 'inline-flex', alignItems: 'center', gap: 10, padding: '18px 22px', borderRadius: 20, background: '#fff', border: '2px solid #E5E7EB', fontSize: 26, fontWeight: 800, color: INK, marginBottom: 14, whiteSpace: 'nowrap'}}>📡 Pixel · API Conversions</div>
        <div style={{display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 8, fontSize: 28, fontWeight: 800, color: '#15803D'}}><Check s={28} /> Suivi des conversions</div>
      </div>
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
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <div style={{fontSize: 26, fontWeight: 800, letterSpacing: '0.12em', color: MUTED}}>CRÉAS PRÊTES POUR</div>
          <div style={{padding: '6px 16px', borderRadius: 99, backgroundImage: GRAD, color: '#fff', fontSize: 24, fontWeight: 800}}>Advantage+</div>
        </div>
        <div style={{marginTop: 22, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14}}>
          {ads.slice(0, 8).map((a, i) => <div key={i} style={{transform: `scale(${sp(f - 14 - i * 2.5)})`}}><Ad src={a} w="100%" h={230} /></div>)}
        </div>
        <div style={{marginTop: 22, display: 'flex', alignItems: 'center', gap: 12, fontSize: 32, fontWeight: 800, color: '#15803D', opacity: prog(f, 40, 8)}}><Check s={34} /> Variées · formats 9:16, 4:5, 1:1</div>
      </Card>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1300, display: 'flex', justifyContent: 'center', opacity: prog(f, 52, 10)}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 14, padding: '18px 38px', borderRadius: 99, backgroundImage: GRAD, color: '#fff', fontSize: 36, fontWeight: 800, boxShadow: '0 20px 40px -14px rgba(91,63,228,0.7)'}}><Check s={34} c="#fff" /> Lien en bio pour commencer</div>
      </div>
    </AbsoluteFill>
  );
};

export const BriefAdvantage: React.FC<{cfg: AdvCfg}> = ({cfg}) => (
  <BriefShell cfg={cfg} comps={[<S1 key={0} words={cfg.scenes[0].words} />, <S2 key={1} words={cfg.scenes[1].words} />, <S3 key={2} words={cfg.scenes[2].words} />, <S4 key={3} words={cfg.scenes[3].words} ads={cfg.ads} />, <S5 key={4} words={cfg.scenes[4].words} ads={cfg.ads} />, <S6 key={5} ads={cfg.ads} />]} />
);
