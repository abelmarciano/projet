// Réponse commentaire #2 : « Les acteurs IA, ça fait trop fake ? » — catalogue d'acteurs réalistes Growthity (aperçus vidéo),
// filtres, choix d'un acteur, puis révélation « Aucun de ces acteurs n'existe ».
import React from 'react';
import {Easing, Loop, OffthreadVideo, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Check, Cursor, FONT, DISPLAY, GRAD, INK, LINE, Logo, MUTED, SplitCfg, SplitChat, clamp, prog} from './SplitChat';

type Actor = {name: string; video: string; gender: 'f' | 'm'; age: string; style: string};
export type CatalogCfg = SplitCfg & {actors: Actor[]; pickIndex: number; reveal: string};

const CatalogWindow: React.FC<{cfg: SplitCfg}> = ({cfg: base}) => {
  const cfg = base as CatalogCfg;
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const C = (k: string) => Math.round((cfg.cues[k] ?? 99) * fps);
  const open = C('open'), fem = C('femme'), hom = C('homme'), sty = C('style'), age = C('age'), pick = C('pick'), reveal = C('reveal');

  const cols = 4; const tileW = 222; const tileH = 280; const gap = 12; const gridX = 22; const gridY = 214;
  const pi = cfg.pickIndex; const pc = pi % cols; const pr = Math.floor(pi / cols);
  const tileX = gridX + pc * (tileW + gap); const tileY = gridY + pr * (tileH + gap);

  const pts: [number, number, number][] = [[0, 640, 520], [fem - 6, 120, 175], [hom - 6, 220, 175], [sty - 6, 520, 175], [age - 6, 700, 175], [pick - 10, tileX + tileW / 2, tileY + tileH / 2], [pick + 4, tileX + tileW / 2, tileY + tileH / 2], [reveal, 860, 700]];
  const ease = {...clamp, easing: Easing.inOut(Easing.cubic)};
  const cx = interpolate(f, pts.map((p) => p[0]), pts.map((p) => p[1]), ease);
  const cy = interpolate(f, pts.map((p) => p[0]), pts.map((p) => p[2]), ease);
  const tap = (a: number) => (f >= a - 2 ? interpolate(f, [a - 2, a + 10], [1, 0], clamp) : 0);
  const down = Math.max(tap(fem), tap(hom), tap(pick));

  // which filter is "active" right now
  const mode = f >= reveal ? 'all' : f >= pick ? 'pick' : f >= age ? 'age' : f >= sty ? 'style' : f >= hom ? 'm' : f >= fem ? 'f' : 'all';
  const chips: {label: string; on: boolean}[] = [
    {label: 'Femme', on: mode === 'f'}, {label: 'Homme', on: mode === 'm'},
    {label: 'Lifestyle', on: mode === 'style'}, {label: 'Casual', on: mode === 'style'}, {label: 'Tech', on: false},
    {label: '18-25', on: mode === 'age'}, {label: '25-35', on: mode === 'age'}, {label: '✓ Réalistes', on: true},
  ];

  const expand = prog(f, pick + 2, 14) * (1 - prog(f, reveal - 8, 10));
  const revealP = prog(f, reveal, 12);
  const winIn = prog(f, open, 14);

  return (
    <div style={{position: 'absolute', left: 40, top: 140, width: 1000, height: 820, borderRadius: 30, background: '#fff', boxShadow: '0 40px 90px -30px rgba(15,23,42,0.45), 0 0 0 1.5px rgba(15,23,42,0.08)', overflow: 'hidden', fontFamily: FONT}}>
      <div style={{height: 64, display: 'flex', alignItems: 'center', padding: '0 24px', gap: 10, borderBottom: `1.5px solid ${LINE}`, background: '#FAFAFC', position: 'relative', zIndex: 3}}>
        {['#FF5F57', '#FEBC2E', '#28C840'].map((c) => <div key={c} style={{width: 16, height: 16, borderRadius: 99, background: c}} />)}
        <div style={{flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10, fontWeight: 700, fontSize: 24, color: INK, marginRight: 70}}><Logo s={30} /> {cfg.brand}</div>
      </div>

      <div style={{position: 'absolute', inset: '64px 0 0 0', opacity: 0.25 + winIn * 0.75}}>
        <div style={{display: 'flex', alignItems: 'center', padding: '20px 24px 10px', gap: 14}}>
          <div style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 34, color: INK}}>Choisir un acteur</div>
          <div style={{marginLeft: 'auto', padding: '8px 16px', borderRadius: 99, background: '#EEEBFF', color: '#5B3FE4', fontWeight: 700, fontSize: 19}}>+ de 200 acteurs</div>
        </div>
        <div style={{display: 'flex', flexWrap: 'wrap', gap: 8, padding: '4px 24px 0'}}>
          {chips.map((c) => (
            <div key={c.label} style={{padding: '9px 16px', borderRadius: 99, fontSize: 19, fontWeight: 700, background: c.on ? INK : '#F1F3F9', color: c.on ? '#fff' : '#334155', border: `1.5px solid ${c.on ? INK : LINE}`, transform: `scale(${c.on ? 1.04 : 1})`}}>{c.label}</div>
          ))}
        </div>
      </div>

      {/* grid */}
      {cfg.actors.map((a, i) => {
        const x = gridX + (i % cols) * (tileW + gap); const y = gridY + Math.floor(i / cols) * (tileH + gap);
        const match = mode === 'f' ? a.gender === 'f' : mode === 'm' ? a.gender === 'm' : true;
        const dim = (mode === 'f' || mode === 'm') && !match ? 0.28 : 1;
        const appear = prog(f, open + i * 2, 10);
        const pulseStyle = mode === 'style' || mode === 'age';
        return (
          <div key={a.name} style={{position: 'absolute', left: x, top: y, width: tileW, height: tileH, borderRadius: 18, overflow: 'hidden', background: '#E5E7EB', opacity: appear * dim, transform: `scale(${(0.9 + appear * 0.1) * (match && (mode === 'f' || mode === 'm') ? 1.02 : 1)})`, boxShadow: match && (mode === 'f' || mode === 'm') ? '0 0 0 4px #8B6DFF' : '0 10px 24px -16px rgba(15,23,42,0.6)'}}>
            <Loop durationInFrames={150}><OffthreadVideo src={staticFile(`media/${a.video}`)} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} /></Loop>
            <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, padding: '34px 12px 10px', background: 'linear-gradient(transparent, rgba(0,0,0,0.7))', color: '#fff'}}>
              <div style={{fontWeight: 800, fontSize: 21}}>{a.name}</div>
              <div style={{display: 'flex', gap: 6, marginTop: 4}}>
                <span style={{fontSize: 14, fontWeight: 700, padding: '2px 8px', borderRadius: 6, background: mode === 'age' ? '#FACC15' : 'rgba(255,255,255,0.22)', color: mode === 'age' ? INK : '#fff'}}>{a.age}</span>
                <span style={{fontSize: 14, fontWeight: 700, padding: '2px 8px', borderRadius: 6, background: mode === 'style' ? '#FACC15' : 'rgba(255,255,255,0.22)', color: mode === 'style' ? INK : '#fff', transform: pulseStyle ? 'scale(1.05)' : 'none'}}>{a.style}</span>
              </div>
            </div>
            <div style={{position: 'absolute', top: 8, left: 8, padding: '3px 9px', borderRadius: 99, background: 'rgba(255,255,255,0.92)', fontSize: 13, fontWeight: 800, color: '#15803D'}}>● Réaliste</div>
          </div>
        );
      })}

      {/* expanded pick */}
      {expand > 0.01 && (() => {
        const a = cfg.actors[pi];
        const W = interpolate(expand, [0, 1], [tileW, 330]); const H = interpolate(expand, [0, 1], [tileH, 586]);
        const X = interpolate(expand, [0, 1], [tileX, 335]); const Y = interpolate(expand, [0, 1], [tileY, 120]);
        return (
          <>
            <div style={{position: 'absolute', inset: '64px 0 0 0', background: `rgba(15,23,42,${0.45 * expand})`}} />
            <div style={{position: 'absolute', left: X, top: Y, width: W, height: H, borderRadius: 22, overflow: 'hidden', boxShadow: '0 0 0 5px #8B6DFF, 0 30px 70px -20px rgba(0,0,0,0.7)', zIndex: 10}}>
              <Loop durationInFrames={150}><OffthreadVideo src={staticFile(`media/${a.video}`)} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} /></Loop>
              <div style={{position: 'absolute', left: 12, right: 12, bottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between', opacity: expand}}>
                <div style={{color: '#fff', fontWeight: 800, fontSize: 24, textShadow: '0 2px 10px rgba(0,0,0,0.6)'}}>{a.name}<div style={{fontSize: 16, fontWeight: 600}}>{a.age} · {a.style}</div></div>
                <div style={{display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px', borderRadius: 99, background: '#16A34A', color: '#fff', fontWeight: 800, fontSize: 16, transform: `scale(${spring({frame: f - pick - 10, fps, config: {damping: 11}})})`}}><Check s={18} c="#fff" /> Dans ta pub</div>
              </div>
            </div>
          </>
        );
      })()}

      {/* reveal */}
      {revealP > 0 && (
        <div style={{position: 'absolute', inset: '64px 0 0 0', background: `rgba(15,23,42,${0.55 * revealP})`, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 12}}>
          <div style={{transform: `scale(${0.7 + spring({frame: f - reveal, fps, config: {damping: 10}}) * 0.3})`, opacity: revealP, padding: '26px 38px', borderRadius: 28, background: '#fff', textAlign: 'center', boxShadow: '0 30px 80px -20px rgba(0,0,0,0.7)'}}>
            <div style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 48, lineHeight: 1.1, color: INK}}>{cfg.reveal}</div>
            <div style={{marginTop: 10, fontSize: 22, fontWeight: 700, backgroundImage: GRAD, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>Tous créés avec {cfg.brand}</div>
          </div>
        </div>
      )}
      <Cursor x={cx} y={cy} down={down} />
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 0, color: MUTED}} />
    </div>
  );
};

export const SplitCatalog: React.FC<{cfg: CatalogCfg}> = ({cfg}) => <SplitChat cfg={cfg} Window={CatalogWindow} />;
