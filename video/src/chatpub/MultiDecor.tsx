// « Une actrice, toutes tes pubs » : un seul acteur Kling dans plusieurs décors (multi_prompt), monté plein écran.
// Accroche, étiquette de lieu par plan, flash + zoom aux changements, sous-titres mot par mot, écran final en grille.
import React from 'react';
import {AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame} from 'remotion';
import {FONT, DISPLAY, GRAD, INK, Logo, clamp, prog, useFonts} from './SplitChat';

type Word = {w: string; s: number; e: number};
type Shot = {from: number; to: number; label: string; still: string};
export type MultiCfg = {video: string; videoDur: number; endDur: number; words: Word[]; audio: string; bed: string; hook: string[]; shots: Shot[]; endTitle: string; endSub: string; brand: string; hot?: string[]; smoothEnd?: boolean; jumps?: number[]};

const Subs: React.FC<{words: Word[]; hot: string[]}> = ({words, hot}) => {
  const f = useCurrentFrame(); const t = f / 30;
  const groups: Word[][] = []; let g: Word[] = [];
  words.forEach((w) => { g.push(w); if (g.length === 3 || /[.,:;!?…]$/.test(w.w)) { groups.push(g); g = []; } });
  if (g.length) groups.push(g);
  const cur = groups.find((gr, i) => t >= gr[0].s - 0.05 && t < Math.min(groups[i + 1]?.[0].s ?? 99, gr[gr.length - 1].e + 0.3) - 0.05);
  if (!cur) return null;
  const st = Math.round(cur[0].s * 30);
  const H = new Set(hot.map((h) => h.toLowerCase()));
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 1240, display: 'flex', justifyContent: 'center'}}>
      <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 18, maxWidth: 940, transform: `scale(${0.9 + prog(f, st - 2, 5) * 0.1})`}}>
        {cur.map((w, i) => {
          const on = t >= w.s - 0.03; const c = w.w.replace(/[.,:;!?…«»"]/g, '');
          return <span key={i} style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 84, lineHeight: 1, textTransform: 'uppercase', color: on ? (H.has(c.toLowerCase()) ? '#FACC15' : '#fff') : 'rgba(255,255,255,0.5)', WebkitTextStroke: '3px rgba(0,0,0,0.85)', paintOrder: 'stroke fill', textShadow: '0 8px 30px rgba(0,0,0,0.6)'}}>{c}</span>;
        })}
      </div>
    </div>
  );
};

export const MultiDecor: React.FC<{cfg: MultiCfg}> = ({cfg}) => {
  useFonts();
  const f = useCurrentFrame();
  const vEnd = Math.round(cfg.videoDur * 30);
  const cuts = cfg.shots.slice(1).map((s) => Math.round(s.from * 30));
  const flash = cuts.reduce((a, c) => Math.max(a, interpolate(f, [c - 1, c + 1, c + 7], [0, 0.85, 0], clamp)), 0);
  const punch = [...cuts, ...(cfg.jumps ?? []).map((j) => Math.round(j * 30))].reduce((a, c) => a + interpolate(f, [c, c + 3, c + 14], [0, 1, 0], clamp), 0);
  const shotI = cfg.shots.findIndex((s) => f / 30 >= s.from && f / 30 < s.to);
  const shot = cfg.shots[shotI];
  const hookP = 1 - prog(f, 52, 10);
  const endF = f - vEnd;
  // fin douce : le dernier plan se réduit jusqu'à sa case de la grille finale, le fond de fin apparaît derrière
  const TR = cfg.smoothEnd ? 22 : 0;
  const m = TR ? interpolate(f, [vEnd - TR, vEnd], [0, 1], {...clamp, easing: (x: number) => 1 - Math.pow(1 - x, 3)}) : 0;
  const last = cfg.shots.length - 1;
  const tileW = (1080 - 120 - 36) / 3; const tileX = 60 + (last % 3) * (tileW + 18); const tileY = 190 + Math.floor(last / 3) * 518;
  const box = {left: m * tileX, top: m * tileY, width: 1080 + m * (tileW - 1080), height: 1920 + m * (500 - 1920)};
  const total = Math.round((cfg.videoDur + cfg.endDur) * 30);
  const fadeOut = cfg.smoothEnd ? interpolate(f, [total - 14, total - 1], [0, 1], clamp) : 0;

  return (
    <AbsoluteFill style={{background: '#000', fontFamily: FONT}}>
      {TR > 0 && f >= vEnd - TR && <AbsoluteFill style={{background: 'linear-gradient(160deg, #0B0A1F 0%, #1E1B4B 55%, #4C1D95 100%)', opacity: m}} />}
      <Sequence durationInFrames={vEnd}>
        <div style={{position: 'absolute', ...box, overflow: 'hidden', borderRadius: m * 24, border: m > 0 ? `${3 * m}px solid rgba(255,255,255,${0.85 * m})` : 'none', boxShadow: m > 0 ? '0 20px 50px -14px rgba(0,0,0,0.7)' : 'none', zIndex: 2}}>
          <AbsoluteFill style={{transform: `scale(${1.04 + punch * 0.06})`}}>
            <OffthreadVideo src={staticFile(`media/${cfg.video}`)} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />
          </AbsoluteFill>
          <AbsoluteFill style={{background: 'radial-gradient(120% 70% at 50% 45%, transparent 55%, rgba(0,0,0,0.45))', opacity: 1 - m}} />
          <AbsoluteFill style={{background: '#fff', opacity: flash}} />
        </div>
        <AbsoluteFill style={{opacity: 1 - m * 1.6, zIndex: 3}}>

        {/* hook */}
        {hookP > 0 && (
          <div style={{position: 'absolute', left: 0, right: 0, top: 230, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, opacity: hookP}}>
            {cfg.hook.map((h, i) => {
              const p = spring({frame: f - 2 - i * 6, fps: 30, config: {damping: 12}});
              return <div key={h} style={{transform: `scale(${0.6 + p * 0.4}) rotate(${i % 2 ? 1.5 : -1.5}deg)`, opacity: Math.min(1, p * 1.5), padding: '14px 30px', borderRadius: 18, background: i === cfg.hook.length - 1 ? '#FACC15' : '#fff', color: INK, fontFamily: DISPLAY, fontWeight: 700, fontSize: 64, boxShadow: '0 18px 40px -12px rgba(0,0,0,0.6)'}}>{h}</div>;
            })}
          </div>
        )}

        {/* location pill */}
        {shot && f > 50 - (shotI > 0 ? 50 : 0) && (() => {
          const a = Math.round(shot.from * 30);
          const p = spring({frame: f - a - (shotI === 0 ? 52 : 2), fps: 30, config: {damping: 12}});
          return (
            <div style={{position: 'absolute', left: 60, top: 250, display: 'flex', alignItems: 'center', gap: 16, padding: '16px 28px', borderRadius: 99, background: 'rgba(255,255,255,0.95)', boxShadow: '0 16px 40px -12px rgba(0,0,0,0.6)', transform: `translateX(${(1 - p) * -120}px)`, opacity: Math.min(1, p * 1.4)}}>
              <span style={{fontSize: 44, fontWeight: 800, color: INK}}>{shot.label}</span>
              <span style={{fontSize: 30, fontWeight: 800, color: '#fff', background: GRAD, padding: '4px 14px', borderRadius: 99}}>{shotI + 1}/{cfg.shots.length}</span>
            </div>
          );
        })()}
        <Subs words={cfg.words} hot={cfg.hot ?? []} />
        </AbsoluteFill>
      </Sequence>

      {/* end card */}
      {(endF >= 0 || (TR > 0 && endF >= -TR + 4)) && (
        <AbsoluteFill style={{background: TR ? 'transparent' : 'linear-gradient(160deg, #0B0A1F 0%, #1E1B4B 55%, #4C1D95 100%)'}}>
          {TR > 0 && endF >= 0 && <AbsoluteFill style={{background: 'linear-gradient(160deg, #0B0A1F 0%, #1E1B4B 55%, #4C1D95 100%)', zIndex: -1}} />}
          <div style={{position: 'absolute', left: 60, right: 60, top: 190, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18}}>
            {cfg.shots.map((s, i) => {
              const p = TR && i === last ? (endF >= 0 ? 1 : 0) : spring({frame: endF + (TR ? TR - 6 : 0) - i * 3, fps: 30, config: {damping: 13}});
              return (
                <div key={i} style={{gridColumn: i === 4 ? 'span 1' : undefined, position: 'relative', height: 500, borderRadius: 24, overflow: 'hidden', transform: `scale(${0.5 + p * 0.5}) rotate(${(i - 2) * (1 - p) * 8}deg)`, opacity: Math.min(1, p * 1.5), boxShadow: '0 20px 50px -14px rgba(0,0,0,0.7)', border: '3px solid rgba(255,255,255,0.85)'}}>
                  <Img src={staticFile(`media/${s.still}`)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                  <div style={{position: 'absolute', left: 10, bottom: 10, padding: '6px 12px', borderRadius: 99, background: 'rgba(255,255,255,0.92)', fontSize: 24, fontWeight: 800, color: INK}}>{s.label}</div>
                </div>
              );
            })}
            <div style={{height: 500, borderRadius: 24, border: '3px dashed rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: DISPLAY, fontWeight: 700, fontSize: 56, opacity: prog(endF, 16, 10)}}>+ ∞</div>
          </div>
          <div style={{position: 'absolute', left: 0, right: 0, top: 1260, textAlign: 'center', color: '#fff', opacity: prog(endF, 10, 12), transform: `translateY(${(1 - prog(endF, 10, 12)) * 30}px)`}}>
            <div style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 92, lineHeight: 1.02, whiteSpace: 'pre-line'}}>{cfg.endTitle}</div>
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginTop: 34}}>
              <Logo s={70} /><span style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 60}}>{cfg.brand}</span>
            </div>
            <div style={{marginTop: 26, fontSize: 36, fontWeight: 600, opacity: 0.85}}>{cfg.endSub}</div>
          </div>
        </AbsoluteFill>
      )}
      {fadeOut > 0 && <AbsoluteFill style={{background: '#000', opacity: fadeOut, zIndex: 50}} />}
      <Audio src={staticFile(cfg.audio)} />
      <Audio src={staticFile(cfg.bed)} />
    </AbsoluteFill>
  );
};
