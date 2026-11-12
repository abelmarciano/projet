// Avant / après #4 (modèle réutilisable par config) : AVANT (galère filmée, voix off, compteur de prises) → « Et avec Growthity ? »
// → mini-chat (une phrase, Prête) → APRÈS (pub UGC Kling avec sa voix) → écran final avant / après.
import React from 'react';
import {AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame} from 'remotion';
import {FONT, DISPLAY, GRAD, INK, Check, Spinner, clamp, prog, useFonts} from './SplitChat';

const Logo: React.FC<{s: number}> = ({s}) => <Img src={staticFile('media/chat/banner/logo.svg')} style={{width: s, height: s}} />;

type Word = {w: string; s: number; e: number};
export type Av4Cfg = {
  before: {video: string; dur: number; vo: string; voWords: Word[]; takes: number; takeAt: number};
  tr: {vo: string; dur: number};
  chat: {vo: string; voWords: Word[]; prompt: string; dur: number};
  after: {video: string; dur: number; words: Word[]; sticker: {text: string; at: number; to: number}};
  end: {vo: string; dur: number; left: string; right: string; beforeStill: string; afterStill: string};
  bed: string; brand: string;
};

const Subs: React.FC<{words: Word[]; offset?: number; top?: number}> = ({words, offset = 0, top = 1260}) => {
  const f = useCurrentFrame(); const t = f / 30 - offset;
  const W = words.filter((w) => !/^\[.*\]$/.test(w.w));
  const groups: Word[][] = []; let g: Word[] = [];
  W.forEach((w) => { g.push(w); if (g.length === 3 || /[.,:;!?…]$/.test(w.w)) { groups.push(g); g = []; } });
  if (g.length) groups.push(g);
  const cur = groups.find((gr, i) => t >= gr[0].s - 0.05 && t < Math.min(groups[i + 1]?.[0].s ?? 99, gr[gr.length - 1].e + 0.35) - 0.05);
  if (!cur) return null;
  const st = Math.round((cur[0].s + offset) * 30);
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top, display: 'flex', justifyContent: 'center', zIndex: 20}}>
      <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 16, maxWidth: 960, transform: `scale(${0.9 + prog(f, st - 2, 5) * 0.1})`}}>
        {cur.map((w, i) => {
          const on = t >= w.s - 0.03; const c = w.w.replace(/[.,:;!?…«»"]/g, '');
          return <span key={i} style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 80, lineHeight: 1, textTransform: 'uppercase', color: on ? '#fff' : 'rgba(255,255,255,0.5)', WebkitTextStroke: '3px rgba(0,0,0,0.85)', paintOrder: 'stroke fill', textShadow: '0 8px 30px rgba(0,0,0,0.6)'}}>{c}</span>;
        })}
      </div>
    </div>
  );
};

const Pill: React.FC<{text: string; color: string; at: number}> = ({text, color, at}) => {
  const f = useCurrentFrame();
  const p = spring({frame: f - at, fps: 30, config: {damping: 12}});
  return <div style={{position: 'absolute', left: 60, top: 230, padding: '14px 30px', borderRadius: 99, background: color, color: '#fff', fontFamily: DISPLAY, fontWeight: 700, fontSize: 56, letterSpacing: '0.06em', transform: `translateX(${(1 - p) * -200}px)`, boxShadow: '0 16px 40px -12px rgba(0,0,0,0.6)', zIndex: 15}}>{text}</div>;
};

export const avap4Total = (c: Av4Cfg) => Math.round((c.before.dur + c.tr.dur + c.chat.dur + c.after.dur + c.end.dur) * 30);

export const AvantApres4: React.FC<{cfg: Av4Cfg}> = ({cfg}) => {
  useFonts();
  const f = useCurrentFrame();
  const A = 0, B = Math.round(cfg.before.dur * 30), T = B + Math.round(cfg.tr.dur * 30), C = T + Math.round(cfg.chat.dur * 30), D = C + Math.round(cfg.after.dur * 30), E = D + Math.round(cfg.end.dur * 30);
  // compteur de prises
  const takeStart = Math.round(cfg.before.takeAt * 30);
  const take = Math.max(1, Math.round(interpolate(f, [20, takeStart], [1, cfg.before.takes], {...clamp, easing: (x: number) => x * x})));
  const typed = cfg.chat.prompt.slice(0, Math.round(interpolate(f - T, [8, 50], [0, cfg.chat.prompt.length], clamp)));
  const ready = f - T >= 62;

  return (
    <AbsoluteFill style={{background: '#000', fontFamily: FONT}}>
      {/* AVANT */}
      <Sequence from={A} durationInFrames={B}>
        <AbsoluteFill style={{filter: 'saturate(0.55) contrast(1.05)'}}><OffthreadVideo src={staticFile(`media/${cfg.before.video}`)} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} /></AbsoluteFill>
        <AbsoluteFill style={{background: 'radial-gradient(120% 70% at 50% 45%, transparent 50%, rgba(0,0,0,0.55))'}} />
        <Pill text="AVANT" color="#DC2626" at={4} />
        <div style={{position: 'absolute', right: 60, top: 236, padding: '12px 24px', borderRadius: 18, background: 'rgba(0,0,0,0.65)', color: '#fff', fontFamily: DISPLAY, fontWeight: 700, fontSize: 44, zIndex: 15}}>🎬 Prise n°{take}</div>
        <Subs words={cfg.before.voWords} offset={0.2} />
      </Sequence>

      {/* TRANSITION */}
      <Sequence from={B} durationInFrames={T - B}>
        <AbsoluteFill style={{background: GRAD, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 30}}>
          <div style={{transform: `scale(${spring({frame: f - B, fps: 30, config: {damping: 10}})})`}}><Logo s={150} /></div>
          <div style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 92, color: '#fff', textAlign: 'center', opacity: prog(f, B + 4, 8), transform: `translateY(${(1 - prog(f, B + 4, 8)) * 30}px)`}}>Et avec<br />{cfg.brand} ?</div>
        </AbsoluteFill>
        <AbsoluteFill style={{background: '#fff', opacity: interpolate(f, [B, B + 6], [0.9, 0], clamp)}} />
      </Sequence>

      {/* CHAT */}
      <Sequence from={T} durationInFrames={C - T}>
        <AbsoluteFill style={{background: 'linear-gradient(160deg, #F4F1EA, #EDE9FE)'}}>
          <div style={{position: 'absolute', left: 70, right: 70, top: 560, borderRadius: 40, background: '#fff', padding: 44, boxShadow: '0 50px 120px -40px rgba(91,63,228,0.6)', transform: `scale(${0.9 + spring({frame: f - T, fps: 30, config: {damping: 13}}) * 0.1})`}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 16, fontWeight: 700, fontSize: 38, color: INK, marginBottom: 28}}><Logo s={56} /> {cfg.brand}</div>
            <div style={{minHeight: 200, padding: '26px 30px', borderRadius: 28, border: '3px solid #C4B5FD', fontSize: 46, lineHeight: 1.3, color: INK, fontWeight: 500}}>{typed}{!ready && <span style={{opacity: Math.floor(f / 8) % 2 ? 1 : 0, color: '#6552E8'}}>|</span>}</div>
            <div style={{display: 'flex', alignItems: 'center', gap: 16, marginTop: 30, fontSize: 40, fontWeight: 800, color: ready ? '#15803D' : '#5B3FE4'}}>
              {ready ? <><Check s={46} /> Ta pub est prête</> : f - T > 50 ? <><Spinner f={f} s={40} /> Je crée ta pub…</> : null}
            </div>
          </div>
        </AbsoluteFill>
        <Subs words={cfg.chat.voWords} offset={T / 30 + 0.3} top={1380} />
      </Sequence>

      {/* APRÈS */}
      <Sequence from={C} durationInFrames={D - C}>
        <OffthreadVideo src={staticFile(`media/${cfg.after.video}`)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
        <Pill text="APRÈS" color="#16A34A" at={2} />
        {f - C >= cfg.after.sticker.at * 30 && f - C < cfg.after.sticker.to * 30 && (
          <div style={{position: 'absolute', left: 80, top: 700, padding: '16px 28px', borderRadius: 20, background: '#fff', color: INK, fontWeight: 800, fontSize: 42, transform: `rotate(-3deg) scale(${spring({frame: f - C - cfg.after.sticker.at * 30, fps: 30, config: {damping: 11}})})`, boxShadow: '0 20px 40px -14px rgba(0,0,0,0.6)', zIndex: 15}}>{cfg.after.sticker.text}</div>
        )}
        <Subs words={cfg.after.words} offset={C / 30} />
      </Sequence>

      {/* FIN */}
      <Sequence from={D} durationInFrames={E - D}>
        <AbsoluteFill style={{background: 'linear-gradient(160deg, #0B0A1F 0%, #1E1B4B 55%, #4C1D95 100%)'}}>
          <div style={{position: 'absolute', left: 60, right: 60, top: 220, display: 'flex', gap: 30}}>
            {[{img: cfg.end.beforeStill, label: cfg.end.left, c: '#DC2626', grey: true}, {img: cfg.end.afterStill, label: cfg.end.right, c: '#16A34A', grey: false}].map((x, i) => {
              const p = spring({frame: f - D - i * 5, fps: 30, config: {damping: 13}});
              return (
                <div key={i} style={{flex: 1, transform: `scale(${0.6 + p * 0.4}) rotate(${(i ? 3 : -3) * (1 - p)}deg)`, opacity: Math.min(1, p * 1.5)}}>
                  <div style={{height: 760, borderRadius: 30, overflow: 'hidden', border: `6px solid ${x.c}`, boxShadow: '0 30px 60px -20px rgba(0,0,0,0.7)'}}>
                    <Img src={staticFile(`media/${x.img}`)} style={{width: '100%', height: '100%', objectFit: 'cover', filter: x.grey ? 'saturate(0.4)' : 'none'}} />
                  </div>
                  <div style={{marginTop: 22, textAlign: 'center', color: '#fff', fontFamily: DISPLAY, fontWeight: 700, fontSize: 46, lineHeight: 1.1, whiteSpace: 'pre-line'}}>{x.label}</div>
                </div>
              );
            })}
          </div>
          <div style={{position: 'absolute', left: 0, right: 0, top: 1300, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18, color: '#fff', opacity: prog(f, D + 14, 10)}}>
            <Logo s={80} /><span style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 72}}>{cfg.brand}</span>
          </div>
          <div style={{position: 'absolute', left: 0, right: 0, top: 1420, textAlign: 'center', color: '#fff', fontSize: 40, fontWeight: 600, opacity: prog(f, D + 22, 10) * 0.9}}>Lien en bio pour commencer</div>
        </AbsoluteFill>
        <AbsoluteFill style={{background: '#000', opacity: interpolate(f, [E - 12, E - 1], [0, 1], clamp)}} />
      </Sequence>

      {/* audio */}
      <Sequence from={6}><Audio src={staticFile(cfg.before.vo)} /></Sequence>
      <Sequence from={B + 3}><Audio src={staticFile(cfg.tr.vo)} /></Sequence>
      <Sequence from={T + 9}><Audio src={staticFile(cfg.chat.vo)} /></Sequence>
      <Sequence from={D + 6}><Audio src={staticFile(cfg.end.vo)} /></Sequence>
      <Audio src={staticFile(cfg.bed)} />
    </AbsoluteFill>
  );
};
