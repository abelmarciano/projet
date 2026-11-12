// « Je note vos pubs » : une experte démolit une pub ratée (annotations, 2/10), la refait avec Growthity, avant / après (9/10).
import React from 'react';
import {Img, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Check, FONT, DISPLAY, GRAD, INK, LINE, Logo, MUTED, SplitCfg, SplitChat, Spinner, clamp, prog} from './SplitChat';

export type RoastCfg = SplitCfg & {
  episode: number; account: string; badImg: string; badText: string; flaws: {label: string; cue: string}[];
  ask: string; badMode?: 'wall' | 'landscape' | 'logo'; badLogo?: {name: string; since: string; time: string}; badCaption?: string; flawBoxes?: {l: number; t: number; w: number; h: number; round?: boolean; labelLeft?: number; labelTop?: number}[]; goodVideo: string; goodTitle: string; goodCta: string; scoreBad: number; scoreGood: number;
};

const Stamp: React.FC<{score: number; at: number; good?: boolean; size?: number}> = ({score, at, good, size = 1}) => {
  const f = useCurrentFrame();
  if (f < at) return null;
  const p = spring({frame: f - at, fps: 30, config: {damping: 9, stiffness: 160}});
  const c = good ? '#16A34A' : '#DC2626';
  return (
    <div style={{transform: `scale(${(2.2 - p * 1.2) * size}) rotate(${good ? -8 : 10}deg)`, opacity: Math.min(1, p * 2), padding: '10px 26px', borderRadius: 18, border: `7px solid ${c}`, color: c, background: 'rgba(255,255,255,0.92)', fontFamily: DISPLAY, fontWeight: 700, fontSize: 84, lineHeight: 1, boxShadow: '0 20px 40px -14px rgba(0,0,0,0.5)'}}>
      {score}/10
    </div>
  );
};

const Phone: React.FC<{children: React.ReactNode; w: number; dim?: number; ring?: string}> = ({children, w, dim = 0, ring}) => (
  <div style={{position: 'relative', width: w, height: w * 1.86, borderRadius: w * 0.12, padding: w * 0.03, background: '#111', boxShadow: ring ? `0 0 0 5px ${ring}, 0 30px 60px -20px rgba(0,0,0,0.6)` : '0 30px 60px -20px rgba(0,0,0,0.6)'}}>
    <div style={{position: 'relative', width: '100%', height: '100%', borderRadius: w * 0.1, overflow: 'hidden', background: '#fff', filter: dim ? `saturate(${1 - dim * 0.6}) brightness(${1 - dim * 0.15})` : 'none'}}>{children}</div>
  </div>
);

const RoastWindow: React.FC<{cfg: SplitCfg}> = ({cfg: base}) => {
  const cfg = base as RoastCfg;
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const C = (k: string) => Math.round((cfg.cues[k] ?? 99) * fps);
  const aie = C('aie'), score1 = C('score1'), redo = C('redo'), voila = C('voila'), score2 = C('score2'), end = C('end');

  const shake = f >= aie && f < aie + 12 ? Math.sin((f - aie) * 2.2) * 10 * (1 - (f - aie) / 12) : 0;
  const scrollFlaw = cfg.badMode && cfg.badMode !== 'wall' ? undefined : cfg.flaws.find((x) => x.cue === 'flaw3');
  const sc = scrollFlaw ? C('flaw3') : 9999;
  const swipe = f >= sc && f < sc + 24 ? Math.sin(((f - sc) / 24) * Math.PI) * -160 : 0;
  const phaseB = prog(f, redo - 4, 12);
  const typed = cfg.ask.slice(0, Math.round(interpolate(f, [redo + 4, voila - 10], [0, cfg.ask.length], clamp)));
  const showGood = f >= voila;
  const leftDim = prog(f, voila, 12);

  return (
    <div style={{position: 'absolute', left: 40, top: 140, width: 1000, height: 820, borderRadius: 30, background: '#fff', boxShadow: '0 40px 90px -30px rgba(15,23,42,0.45), 0 0 0 1.5px rgba(15,23,42,0.08)', overflow: 'hidden', fontFamily: FONT}}>
      {/* header */}
      <div style={{height: 70, display: 'flex', alignItems: 'center', padding: '0 26px', gap: 14, borderBottom: `1.5px solid ${LINE}`, background: '#FAFAFC'}}>
        <div style={{padding: '6px 14px', borderRadius: 10, background: '#DC2626', color: '#fff', fontFamily: DISPLAY, fontWeight: 700, fontSize: 24, letterSpacing: '0.04em'}}>JE NOTE VOS PUBS</div>
        <div style={{fontSize: 22, fontWeight: 700, color: MUTED}}>Épisode {cfg.episode}</div>
        <div style={{marginLeft: 'auto', fontSize: 20, fontWeight: 600, color: MUTED}}>Pub reçue de <b style={{color: INK}}>{cfg.account}</b></div>
      </div>

      {/* left: the bad ad */}
      <div style={{position: 'absolute', left: 50, top: 100, transform: `translate(${shake}px, ${swipe}px) scale(${1 - leftDim * 0.12})`, transformOrigin: 'top left'}}>
        <Phone w={370} dim={leftDim}>
          {cfg.badMode === 'logo' && cfg.badLogo ? (
            <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 40%, #5A3826, #2A170E)', color: '#F5E6D3'}}>
              <div style={{position: 'absolute', top: 16, left: 14, display: 'flex', alignItems: 'center', gap: 8}}>
                <div style={{width: 30, height: 30, borderRadius: 99, background: '#7A5038'}} />
                <div style={{fontSize: 15, fontWeight: 700}}>{cfg.account.replace('@', '')}<div style={{fontSize: 11, fontWeight: 500, opacity: 0.7}}>Sponsorisé</div></div>
              </div>
              <div style={{position: 'absolute', left: 0, right: 0, top: 220, textAlign: 'center', fontFamily: 'Georgia, serif'}}>
                <div style={{fontSize: 44}}>☕</div>
                <div style={{fontSize: 34, fontWeight: 700, letterSpacing: '0.08em', lineHeight: 1.1, whiteSpace: 'pre-line', marginTop: 8}}>{cfg.badLogo.name}</div>
                <div style={{fontSize: 16, fontStyle: 'italic', marginTop: 10, opacity: 0.8}}>{cfg.badLogo.since}</div>
              </div>
              <div style={{position: 'absolute', right: 14, top: 70, fontSize: 22}}>🔇</div>
              <div style={{position: 'absolute', left: 16, right: 16, bottom: 46}}>
                <div style={{height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.25)'}}><div style={{width: '7%', height: '100%', background: '#fff'}} /></div>
                <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 12, marginTop: 5, opacity: 0.8}}><span>▶ {cfg.badLogo.time}</span><span>🔇</span></div>
              </div>
              <div style={{position: 'absolute', left: 14, right: 14, bottom: 14, fontSize: 12, opacity: 0.75}}>{cfg.badCaption}</div>
            </div>
          ) : cfg.badMode === 'landscape' ? (
            <div style={{position: 'absolute', inset: 0, background: '#000', display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
              <div style={{position: 'absolute', top: 16, left: 14, display: 'flex', alignItems: 'center', gap: 8, color: '#fff'}}>
                <div style={{width: 30, height: 30, borderRadius: 99, background: '#444'}} />
                <div style={{fontSize: 15, fontWeight: 700}}>{cfg.account.replace('@', '')}<div style={{fontSize: 11, fontWeight: 500, opacity: 0.7}}>Sponsorisé</div></div>
              </div>
              <Img src={staticFile(`media/${cfg.badImg}`)} style={{width: '100%', aspectRatio: '16 / 9', objectFit: 'cover'}} />
              <div style={{position: 'absolute', left: 14, right: 14, bottom: 22, color: '#fff', fontSize: 13, opacity: 0.85}}>{cfg.badCaption}</div>
            </div>
          ) : (<>
          <div style={{display: 'flex', alignItems: 'center', gap: 10, padding: '14px 14px 10px'}}>
            <div style={{width: 34, height: 34, borderRadius: 99, background: '#E5E7EB'}} />
            <div style={{fontSize: 16, fontWeight: 700, color: '#111'}}>{cfg.account.replace('@', '')}<div style={{fontSize: 12, fontWeight: 500, color: '#888'}}>Sponsorisé</div></div>
          </div>
          <div style={{position: 'relative', width: '100%', aspectRatio: '1 / 1', overflow: 'hidden'}}>
            <Img src={staticFile(`media/${cfg.badImg}`)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
            <div style={{position: 'absolute', inset: 10, fontFamily: 'Arial, sans-serif', fontWeight: 900, fontSize: 19, lineHeight: 1.15, color: '#FF1E1E', textShadow: '2px 2px 0 #FFEB3B, -1px -1px 0 #FFEB3B', textAlign: 'center'}}>{cfg.badText}</div>
          </div>
          <div style={{margin: '10px 12px', padding: '10px', borderRadius: 8, background: '#EFEFEF', fontSize: 15, fontWeight: 600, color: '#111'}}>En savoir plus ›</div>
          <div style={{padding: '0 12px', fontSize: 13, color: '#333', lineHeight: 1.3}}>{cfg.account.replace('@', '')} Bonjour à tous nous sommes une boutique… <span style={{color: '#999'}}>plus</span></div>
          </>)}
        </Phone>
        {/* annotations */}
        {cfg.flaws.map((fl, i) => {
          const at = C(fl.cue); if (f < at) return null;
          const p = spring({frame: f - at, fps, config: {damping: 11}});
          const pos = (cfg.flawBoxes ?? [{l: 20, t: 120, w: 340, h: 300}, {l: 30, t: 40, w: 300, h: 60}, {l: 300, t: 520, w: 120, h: 120, round: true, labelLeft: -150, labelTop: 30}])[i] ?? {l: 0, t: 0, w: 0, h: 0};
          return (
            <div key={fl.label} style={{position: 'absolute', left: pos.l, top: pos.t, width: pos.w, height: pos.h, border: '5px solid #DC2626', borderRadius: pos.round ? 99 : 22, transform: `scale(${0.7 + p * 0.3})`, opacity: Math.min(1, p * 1.6) * (1 - phaseB)}}>
              <div style={{position: 'absolute', left: pos.labelLeft ?? pos.w - 40, top: pos.labelTop ?? -26, whiteSpace: 'nowrap', padding: '5px 12px', borderRadius: 10, background: '#DC2626', color: '#fff', fontWeight: 800, fontSize: 19}}>✗ {fl.label}</div>
            </div>
          );
        })}
        <div style={{position: 'absolute', left: 200, top: 300}}><Stamp score={cfg.scoreBad} at={score1} /></div>
      </div>

      {/* right: verdict, then Growthity remake */}
      <div style={{position: 'absolute', left: 520, top: 100, width: 440, height: 690}}>
        {/* verdict list */}
        <div style={{position: 'absolute', inset: 0, opacity: 1 - phaseB, transform: `translateY(${-phaseB * 40}px)`}}>
          <div style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 34, color: INK, marginBottom: 18}}>Le verdict</div>
          {cfg.flaws.map((fl) => {
            const on = f >= C(fl.cue); const p = prog(f, C(fl.cue), 8);
            return (
              <div key={fl.label} style={{display: 'flex', alignItems: 'center', gap: 14, padding: '16px 18px', marginBottom: 12, borderRadius: 18, border: `2px solid ${on ? '#FECACA' : LINE}`, background: on ? '#FEF2F2' : '#fff', opacity: 0.35 + p * 0.65, transform: `translateX(${(1 - p) * 20}px)`}}>
                <div style={{width: 34, height: 34, borderRadius: 99, background: on ? '#DC2626' : '#E5E7EB', color: '#fff', fontWeight: 900, fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>✗</div>
                <div style={{fontSize: 26, fontWeight: 700, color: on ? '#991B1B' : MUTED}}>{fl.label}</div>
              </div>
            );
          })}
          <div style={{marginTop: 22, display: 'flex', alignItems: 'center', gap: 16, opacity: prog(f, score1, 8)}}>
            <div style={{fontSize: 24, fontWeight: 700, color: MUTED}}>Note :</div>
            <div style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 64, color: '#DC2626'}}>{cfg.scoreBad}/10</div>
          </div>
        </div>
        {/* remake */}
        {phaseB > 0 && (
          <div style={{position: 'absolute', inset: 0, opacity: phaseB, transform: `translateY(${(1 - phaseB) * 40}px)`}}>
            {!showGood ? (
              <div style={{borderRadius: 26, border: `1.5px solid ${LINE}`, padding: 20, boxShadow: '0 20px 50px -24px rgba(15,23,42,0.4)'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: 10, fontWeight: 700, fontSize: 22, color: INK, marginBottom: 14}}><Logo s={32} /> {cfg.brand}</div>
                <div style={{minHeight: 120, padding: '14px 16px', borderRadius: 16, border: '2px solid #C4B5FD', fontSize: 25, lineHeight: 1.35, color: INK, fontWeight: 500}}>{typed}<span style={{opacity: Math.floor(f / 8) % 2 ? 1 : 0, color: '#6552E8'}}>|</span></div>
                <div style={{display: 'flex', alignItems: 'center', gap: 10, marginTop: 16, fontSize: 21, fontWeight: 700, color: '#5B3FE4', opacity: prog(f, voila - 14, 6)}}><Spinner f={f} /> Je refais ta pub…</div>
              </div>
            ) : (
              <div style={{position: 'absolute', left: 30, top: -8, transform: `scale(${0.9 + spring({frame: f - voila, fps, config: {damping: 12}}) * 0.1})`, transformOrigin: 'top center'}}>
                <Phone w={370} ring="#8B6DFF">
                  <Sequence from={voila} layout="none"><OffthreadVideo src={staticFile(`media/${cfg.goodVideo}`)} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} /></Sequence>
                  <div style={{position: 'absolute', left: 16, right: 16, top: 40, fontFamily: DISPLAY, fontWeight: 700, fontSize: 38, lineHeight: 1.05, color: '#fff', whiteSpace: 'pre-line', textShadow: '0 4px 20px rgba(0,0,0,0.5)', opacity: prog(f, voila + 6, 10)}}>{cfg.goodTitle}</div>
                  <div style={{position: 'absolute', left: 16, right: 16, bottom: 26, display: 'flex', justifyContent: 'center', opacity: prog(f, voila + 12, 10)}}><div style={{padding: '12px 30px', borderRadius: 99, background: '#fff', color: INK, fontWeight: 800, fontSize: 20}}>{cfg.goodCta}</div></div>
                  <div style={{position: 'absolute', top: 12, left: 12, display: 'flex', alignItems: 'center', gap: 6, padding: '5px 11px', borderRadius: 99, background: '#fff', fontWeight: 700, fontSize: 15, color: '#15803D'}}><Check s={16} /> Refaite avec {cfg.brand}</div>
                </Phone>
                <div style={{position: 'absolute', left: 150, top: 330}}><Stamp score={cfg.scoreGood} at={score2} good /></div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* labels avant / après */}
      {showGood && (
        <>
          <div style={{position: 'absolute', left: 150, top: 770, fontSize: 24, fontWeight: 800, color: MUTED, opacity: leftDim}}>AVANT</div>
          <div style={{position: 'absolute', left: 690, top: 770, fontSize: 24, fontWeight: 800, color: '#5B3FE4', opacity: leftDim}}>APRÈS</div>
        </>
      )}

      {/* CTA end */}
      {f >= end && (
        <div style={{position: 'absolute', left: 0, right: 0, bottom: 26, display: 'flex', justifyContent: 'center', zIndex: 10}}>
          <div style={{transform: `scale(${spring({frame: f - end, fps, config: {damping: 11}})})`, padding: '16px 30px', borderRadius: 99, backgroundImage: GRAD, color: '#fff', fontWeight: 800, fontSize: 28, boxShadow: '0 20px 40px -14px rgba(91,63,228,0.9)'}}>📩 Envoie ta pub en commentaire</div>
        </div>
      )}
    </div>
  );
};

export const SplitRoast: React.FC<{cfg: RoastCfg}> = ({cfg}) => <SplitChat cfg={cfg} Window={RoastWindow} />;
