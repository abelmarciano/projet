// « Le brief Meta » — épisode 1 : Andromeda. Motion design éducatif (style cabinet de conseil), voix off par scène.
import React from 'react';
import {AbsoluteFill, Audio, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame, Easing} from 'remotion';
import {FONT, DISPLAY, GRAD, INK, MUTED, Check, clamp, prog, useFonts} from '../chatpub/SplitChat';

type Word = {w: string; s: number; e: number};
type Scene = {vo: string; dur: number; words: Word[]};
export type BriefCfg = {episode: number; title: string; scenes: Scene[]; bed: string; ads: {img: string; label: string}[]; personas: string[]; finalAds: string[]};

const PURPLE = '#5B3FE4';
const Logo: React.FC<{s: number}> = ({s}) => <Img src={staticFile('media/chat/banner/logo.svg')} style={{width: s, height: s}} />;
const ease = {...clamp, easing: Easing.bezier(0.22, 1, 0.36, 1)};

// sous-titres intégrés (foncés, mot par mot)
const Subs: React.FC<{words: Word[]}> = ({words}) => {
  const f = useCurrentFrame(); const t = f / 30;
  const groups: Word[][] = []; let g: Word[] = [];
  words.forEach((w) => { g.push(w); if (g.length === 4 || /[.,:;!?…]$/.test(w.w)) { groups.push(g); g = []; } });
  if (g.length) groups.push(g);
  const cur = groups.find((gr, i) => t >= gr[0].s - 0.05 && t < Math.min(groups[i + 1]?.[0].s ?? 99, gr[gr.length - 1].e + 0.35) - 0.05);
  if (!cur) return null;
  return (
    <div style={{position: 'absolute', left: 60, right: 60, top: 1590, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 14, zIndex: 30}}>
      {cur.map((w, i) => {
        const on = t >= w.s - 0.03;
        return <span key={i} style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 58, lineHeight: 1.1, color: on ? INK : 'rgba(15,23,42,0.25)'}}>{w.w.replace(/[«»"]/g, '')}</span>;
      })}
    </div>
  );
};

const Label: React.FC<{text: string; color?: string; at?: number}> = ({text, color = PURPLE, at = 0}) => {
  const f = useCurrentFrame(); const p = prog(f, at, 10);
  return <div style={{position: 'absolute', left: 80, top: 330, display: 'flex', alignItems: 'center', gap: 12, fontSize: 30, fontWeight: 800, letterSpacing: '0.16em', color, opacity: p, transform: `translateX(${(1 - p) * -30}px)`}}><div style={{width: 14, height: 14, borderRadius: 99, background: color}} />{text}</div>;
};
const Headline: React.FC<{children: React.ReactNode; at?: number; top?: number}> = ({children, at = 4, top = 390}) => {
  const f = useCurrentFrame(); const p = prog(f, at, 12);
  return <div style={{position: 'absolute', left: 80, right: 80, top, fontFamily: DISPLAY, fontWeight: 700, fontSize: 76, lineHeight: 1.05, letterSpacing: '-0.025em', color: INK, opacity: p, transform: `translateY(${(1 - p) * 26}px)`}}>{children}</div>;
};
const Grad: React.FC<{children: React.ReactNode}> = ({children}) => <span style={{backgroundImage: GRAD, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>{children}</span>;

// --- S1 : titre + orbites
const S1: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        {[0, 1, 2, 3].map((i) => (
          <ellipse key={i} cx={540} cy={860} rx={180 + i * 110} ry={70 + i * 42} fill="none" stroke="#C4B5FD" strokeWidth={2} strokeDasharray="4 12" opacity={prog(f, i * 3, 14) * (0.8 - i * 0.15)} transform={`rotate(${-18 + f * (0.25 + i * 0.08)} 540 860)`} />
        ))}
        {Array.from({length: 26}).map((_, i) => {
          const a = (i / 26) * Math.PI * 2 + f * 0.012 * (1 + (i % 3));
          const r = 160 + (i % 4) * 110;
          return <circle key={i} cx={540 + Math.cos(a) * r} cy={860 + Math.sin(a) * r * 0.4} r={i % 5 === 0 ? 7 : 4} fill={i % 2 ? '#8B6DFF' : '#2563EB'} opacity={prog(f, 6 + i, 10) * 0.8} />;
        })}
      </svg>
      <div style={{position: 'absolute', left: 0, right: 0, top: 790, textAlign: 'center', transform: `scale(${0.85 + spring({frame: f - 2, fps: 30, config: {damping: 14}}) * 0.15})`}}>
        <div style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 170, letterSpacing: '-0.04em', lineHeight: 1}}><Grad>Andromeda</Grad></div>
        <div style={{fontSize: 40, fontWeight: 600, color: MUTED, marginTop: 22, opacity: prog(f, 14, 10)}}>Le moteur qui choisit tes pubs sur Meta</div>
        <div style={{display: 'inline-block', marginTop: 26, padding: '10px 22px', borderRadius: 99, border: '2px solid #DDD6FE', background: '#fff', fontSize: 26, fontWeight: 700, color: PURPLE, opacity: prog(f, 22, 10)}}>Annoncé par Meta · déc. 2024</div>
      </div>
    </AbsoluteFill>
  );
};

// --- S2 : avant, ciblage manuel
const S2: React.FC<{words: Word[]}> = ({words}) => {
  const f = useCurrentFrame();
  const at = (k: string) => { const w = words.find((x) => x.w.toLowerCase().includes(k)); return Math.round(((w?.s ?? 1) - 0.1) * 30); };
  const chips = [{t: '🎂 25–34 ans', k: 'âge'}, {t: '💡 Intérêts : mode', k: 'intérêts'}, {t: '📍 Lyon', k: 'ville'}];
  const narrow = chips.filter((c) => f >= at(c.k)).length;
  return (
    <AbsoluteFill>
      <Label text="AVANT" color="#94A3B8" />
      <Headline>Tu choisissais<br />ton audience à la main.</Headline>
      {/* funnel */}
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        <path d="M 200 760 L 880 760 L 640 1240 L 440 1240 Z" fill="#EEF2FF" stroke="#C7D2FE" strokeWidth={3} opacity={prog(f, 6, 12)} />
      </svg>
      {chips.map((c, i) => {
        const p = spring({frame: f - at(c.k), fps: 30, config: {damping: 12}});
        return <div key={c.t} style={{position: 'absolute', left: 540, top: 800 + i * 130, transform: `translateX(-50%) scale(${p})`, padding: '16px 30px', borderRadius: 99, background: '#fff', border: '2px solid #CBD5E1', boxShadow: '0 12px 24px -14px rgba(15,23,42,0.4)', fontSize: 36, fontWeight: 700, color: INK, whiteSpace: 'nowrap'}}>{c.t}</div>;
      })}
      <div style={{position: 'absolute', left: 540, top: 1300, transform: `translateX(-50%) scale(${1 - narrow * 0.1})`, width: 300, height: 140, borderRadius: 99, background: '#E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 34, fontWeight: 800, color: '#475569', opacity: prog(f, 8, 10)}}>1 audience</div>
    </AbsoluteFill>
  );
};

// --- S3 : maintenant, le moteur
const S3: React.FC<{ads: string[]}> = ({ads}) => {
  const f = useCurrentFrame();
  const core = {x: 540, y: 990};
  const persons = [{x: 220, y: 1380, e: '👩'}, {x: 540, y: 1420, e: '🧔'}, {x: 860, y: 1380, e: '👵'}];
  return (
    <AbsoluteFill>
      <Label text="MAINTENANT" />
      <Headline>L'IA de Meta choisit<br /><Grad>pour chaque personne.</Grad></Headline>
      {/* nuée de pubs aspirées */}
      {Array.from({length: 24}).map((_, i) => {
        const sx = 120 + (i % 8) * 120, sy = 640 + Math.floor(i / 8) * 70;
        const p = interpolate(f, [8 + i * 1.5, 40 + i * 1.5], [0, 1], ease);
        const x = sx + (core.x - sx) * p, y = sy + (core.y - sy) * p;
        return <div key={i} style={{position: 'absolute', left: x - 34, top: y - 22, width: 68, height: 44, borderRadius: 8, overflow: 'hidden', opacity: (1 - p * 0.9) * prog(f, i * 0.6, 6), boxShadow: '0 6px 12px -6px rgba(0,0,0,0.4)'}}><Img src={staticFile(`media/${ads[i % ads.length]}`)} style={{width: '100%', height: '100%', objectFit: 'cover'}} /></div>;
      })}
      {/* moteur */}
      <div style={{position: 'absolute', left: core.x - 130, top: core.y - 130, width: 260, height: 260, borderRadius: 999, backgroundImage: GRAD, boxShadow: `0 0 ${60 + Math.sin(f * 0.2) * 20}px rgba(91,63,228,0.7)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: DISPLAY, fontWeight: 700, fontSize: 34, transform: `scale(${spring({frame: f - 4, fps: 30, config: {damping: 12}})})`}}>Andromeda</div>
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        <circle cx={core.x} cy={core.y} r={170} fill="none" stroke="#A78BFA" strokeWidth={3} strokeDasharray="10 14" transform={`rotate(${f * 3} ${core.x} ${core.y})`} opacity={prog(f, 6, 10)} />
        {persons.map((p, i) => {
          const lp = interpolate(f, [60 + i * 8, 80 + i * 8], [0, 1], ease);
          const x2 = core.x + (p.x - core.x) * lp, y2 = core.y + 130 + (p.y - 60 - core.y - 130) * lp;
          return <line key={i} x1={core.x} y1={core.y + 130} x2={x2} y2={y2} stroke="#8B6DFF" strokeWidth={4} strokeLinecap="round" opacity={lp > 0 ? 1 : 0} />;
        })}
      </svg>
      {persons.map((p, i) => {
        const s = spring({frame: f - 76 - i * 8, fps: 30, config: {damping: 12}});
        return (
          <div key={i} style={{position: 'absolute', left: p.x - 100, top: p.y - 60, width: 200, textAlign: 'center', transform: `scale(${s})`}}>
            <div style={{display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 8}}>
              {[0, 1].map((k) => <div key={k} style={{width: 54, height: 72, borderRadius: 8, overflow: 'hidden', border: '3px solid #8B6DFF'}}><Img src={staticFile(`media/${ads[(i * 3 + k * 2) % ads.length]}`)} style={{width: '100%', height: '100%', objectFit: 'cover'}} /></div>)}
            </div>
            <div style={{fontSize: 64}}>{p.e}</div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// --- S4 : créa = ciblage
const S4: React.FC<{ads: {img: string; label: string}[]; personas: string[]}> = ({ads, personas}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Label text="LA CONSÉQUENCE" />
      <Headline>Ta créa est devenue<br /><Grad>ton ciblage.</Grad></Headline>
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        {ads.map((_, i) => {
          const x = 115 + i * 170; const lp = interpolate(f, [30 + i * 6, 46 + i * 6], [0, 1], ease);
          return <line key={i} x1={x} y1={1010} x2={x} y2={1010 + 230 * lp} stroke="#C4B5FD" strokeWidth={4} strokeDasharray="6 8" />;
        })}
      </svg>
      {ads.map((a, i) => {
        const x = 115 + i * 170; const p = spring({frame: f - 10 - i * 4, fps: 30, config: {damping: 12}}); const q = spring({frame: f - 44 - i * 6, fps: 30, config: {damping: 11}});
        return (
          <React.Fragment key={i}>
            <div style={{position: 'absolute', left: x - 75, top: 720, width: 150, height: 270, borderRadius: 18, overflow: 'hidden', transform: `scale(${p})`, boxShadow: '0 16px 30px -16px rgba(15,23,42,0.6)'}}>
              <Img src={staticFile(`media/${a.img}`)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
              <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, padding: '22px 6px 6px', background: 'linear-gradient(transparent, rgba(0,0,0,0.75))', color: '#fff', fontSize: 17, fontWeight: 800, textAlign: 'center'}}>{a.label}</div>
            </div>
            <div style={{position: 'absolute', left: x - 60, top: 1250, width: 120, height: 120, borderRadius: 99, background: '#fff', border: '3px solid #DDD6FE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 60, transform: `scale(${q})`, boxShadow: '0 12px 24px -14px rgba(91,63,228,0.6)'}}>{personas[i]}</div>
          </React.Fragment>
        );
      })}
      <div style={{position: 'absolute', left: 0, right: 0, top: 1405, textAlign: 'center', fontSize: 32, fontWeight: 700, color: MUTED, opacity: prog(f, 80, 10)}}>6 créas différentes → 6 profils touchés</div>
    </AbsoluteFill>
  );
};

// --- S5 : ce qu'il faut faire
const S5: React.FC<{words: Word[]}> = ({words}) => {
  const f = useCurrentFrame();
  const at = (k: string) => { const w = words.find((x) => x.w.toLowerCase().includes(k)); return Math.round(((w?.s ?? 1) - 0.1) * 30); };
  const items = [{i: '🎯', t: 'Ciblage large', d: 'Laisse Meta trouver les bons profils', k: 'large'}, {i: '🧱', t: 'Structure simple', d: '1 campagne · peu d’ensembles de pubs', k: 'structure'}, {i: '🎨', t: 'Créas vraiment variées', d: 'Angles, formats, acteurs différents', k: 'variées'}];
  return (
    <AbsoluteFill>
      <Label text="CE QU'IL FAUT FAIRE" color="#16A34A" />
      <Headline>La méthode<br /><Grad>« Andromeda-ready ».</Grad></Headline>
      {items.map((it, i) => {
        const a = at(it.k); const p = spring({frame: f - a + 4, fps: 30, config: {damping: 13}}); const on = f >= a;
        return (
          <div key={it.t} style={{position: 'absolute', left: 80, right: 80, top: 690 + i * 255, height: 220, borderRadius: 32, background: '#fff', border: `3px solid ${on ? '#BBF7D0' : '#E5E7EB'}`, boxShadow: '0 24px 50px -30px rgba(15,23,42,0.5)', display: 'flex', alignItems: 'center', gap: 34, padding: '0 40px', transform: `translateX(${(1 - p) * 80}px)`, opacity: Math.min(1, p * 1.4)}}>
            <div style={{fontSize: 84}}>{it.i}</div>
            <div style={{flex: 1}}>
              <div style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 50, color: INK}}>{it.t}</div>
              <div style={{fontSize: 30, color: MUTED, fontWeight: 600, marginTop: 6}}>{it.d}</div>
            </div>
            <div style={{width: 72, height: 72, borderRadius: 99, background: on ? '#16A34A' : '#E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${on ? spring({frame: f - a, fps: 30, config: {damping: 9}}) : 0.8})`}}><Check s={44} c="#fff" /></div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// --- S6 : Growthity
const S6: React.FC<{ads: string[]; brand: string}> = ({ads, brand}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 0, right: 0, top: 350, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 22, transform: `scale(${0.8 + spring({frame: f, fps: 30, config: {damping: 13}}) * 0.2})`}}>
        <div style={{filter: 'drop-shadow(0 20px 40px rgba(91,63,228,0.35))'}}><Logo s={120} /></div>
        <div style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 96, color: INK, letterSpacing: '-0.03em'}}>{brand}</div>
      </div>
      <div style={{position: 'absolute', left: 80, right: 80, top: 540, textAlign: 'center', fontFamily: DISPLAY, fontWeight: 700, fontSize: 58, lineHeight: 1.1, color: INK, opacity: prog(f, 8, 10)}}>Des séries de pubs variées,<br /><Grad>prêtes pour Andromeda.</Grad></div>
      <div style={{position: 'absolute', left: 90, right: 90, top: 760, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18}}>
        {ads.map((a, i) => {
          const p = spring({frame: f - 14 - i * 3, fps: 30, config: {damping: 12}});
          return <div key={i} style={{height: 300, borderRadius: 22, overflow: 'hidden', transform: `scale(${p}) rotate(${(i % 2 ? 2 : -2) * (1 - p)}deg)`, boxShadow: '0 20px 40px -20px rgba(15,23,42,0.6)'}}><Img src={staticFile(`media/${a}`)} style={{width: '100%', height: '100%', objectFit: 'cover'}} /></div>;
        })}
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1420, display: 'flex', justifyContent: 'center', opacity: prog(f, 40, 10)}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 14, padding: '20px 40px', borderRadius: 99, backgroundImage: GRAD, color: '#fff', fontSize: 38, fontWeight: 800, boxShadow: '0 20px 40px -14px rgba(91,63,228,0.7)'}}><Check s={36} c="#fff" /> Lien en bio pour commencer</div>
      </div>
    </AbsoluteFill>
  );
};

export const briefTotal = (c: BriefCfg) => Math.round(c.scenes.reduce((a, s) => a + s.dur, 0) * 30);

export const BriefAndromeda: React.FC<{cfg: BriefCfg}> = ({cfg}) => {
  useFonts();
  const f = useCurrentFrame();
  const starts: number[] = []; let acc = 0;
  cfg.scenes.forEach((s) => { starts.push(acc); acc += Math.round(s.dur * 30); });
  const total = acc;
  const cur = starts.filter((s) => f >= s).length - 1;
  const comps = [<S1 key={0} />, <S2 key={1} words={cfg.scenes[1].words} />, <S3 key={2} ads={cfg.ads.map((a) => a.img)} />, <S4 key={3} ads={cfg.ads} personas={cfg.personas} />, <S5 key={4} words={cfg.scenes[4].words} />, <S6 key={5} ads={cfg.finalAds} brand="Growthity" />];
  return (
    <AbsoluteFill style={{background: '#F7F6F3', fontFamily: FONT, overflow: 'hidden'}}>
      <AbsoluteFill style={{backgroundImage: 'linear-gradient(rgba(15,23,42,0.045) 1.5px, transparent 1.5px), linear-gradient(90deg, rgba(15,23,42,0.045) 1.5px, transparent 1.5px)', backgroundSize: '60px 60px'}} />
      <AbsoluteFill style={{background: 'radial-gradient(60% 40% at 50% 45%, rgba(139,109,255,0.14), transparent 70%)'}} />
      {/* en-tête de série */}
      <div style={{position: 'absolute', left: 80, right: 80, top: 150, display: 'flex', alignItems: 'center', gap: 16, zIndex: 20}}>
        <div style={{padding: '10px 20px', borderRadius: 12, background: INK, color: '#fff', fontFamily: DISPLAY, fontWeight: 700, fontSize: 26, letterSpacing: '0.12em'}}>LE BRIEF META</div>
        <div style={{fontSize: 26, fontWeight: 700, color: MUTED}}>Épisode {cfg.episode}</div>
        <div style={{marginLeft: 'auto'}}><Logo s={56} /></div>
      </div>
      <div style={{position: 'absolute', left: 80, right: 80, top: 236, display: 'flex', gap: 10, zIndex: 20}}>
        {cfg.scenes.map((_, i) => <div key={i} style={{flex: 1, height: 6, borderRadius: 3, background: '#E5E7EB', overflow: 'hidden'}}><div style={{height: '100%', width: `${i < cur ? 100 : i === cur ? interpolate(f, [starts[i], starts[i] + Math.round(cfg.scenes[i].dur * 30)], [0, 100], clamp) : 0}%`, backgroundImage: GRAD}} /></div>)}
      </div>
      {cfg.scenes.map((s, i) => {
        const d = Math.round(s.dur * 30);
        return (
          <Sequence key={i} from={starts[i]} durationInFrames={d}>
            <AbsoluteFill style={{opacity: interpolate(f - starts[i], [0, 8, d - 6, d], [0, 1, 1, i === cfg.scenes.length - 1 ? 1 : 0], clamp), transform: `translateY(${interpolate(f - starts[i], [0, 10], [30, 0], ease)}px)`}}>{comps[i]}</AbsoluteFill>
            <Subs words={s.words} />
            <Sequence from={4}><Audio src={staticFile(s.vo)} /></Sequence>
          </Sequence>
        );
      })}
      <AbsoluteFill style={{background: '#000', opacity: interpolate(f, [total - 10, total - 1], [0, 1], clamp), zIndex: 50}} />
      <Audio src={staticFile(cfg.bed)} />
    </AbsoluteFill>
  );
};
