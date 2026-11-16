// Reel lancement / Avant-après « réseaux sociaux » : enchaînement de clips UGC (Kling, voix native) sous-titrés,
// d'une démo motion (calendrier ou alerte WhatsApp) avec voix off, puis d'une carte de fin.
import React from 'react';
import {AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame} from 'remotion';
import {DISPLAY, FONT, GRAD, INK, Check, clamp, prog, useFonts} from './SplitChat';
import {Logo} from '../brief/BriefAndromeda';
import {CalGrid, NetRows, WaBubble, WaButtons, WaPhone} from '../brief/socialKit';

type Word = {w: string; s: number; e: number};
export type Seg =
  | {type: 'clip'; src: string; from: number; to: number; words: Word[]; tag?: string; tagColor?: string; night?: boolean; name?: string}
  | {type: 'demo'; mode: 'cal' | 'wa' | 'reco'; dur: number; vo?: string; voWords?: Word[]; title: string}
  | {type: 'end'; dur: number; vo?: string; voWords?: Word[]; title: [string, string]; split?: {left: string; right: string; leftImg: string; rightImg: string}};
export type StoryCfg = {segs: Seg[]; bed: string; badge?: string};

export const segFrames = (s: Seg) => Math.round((s.type === 'clip' ? s.to - s.from : s.dur) * 30);
export const storyTotal = (c: StoryCfg) => c.segs.reduce((a, s) => a + segFrames(s), 0);

const Caps: React.FC<{words: Word[]; y?: number; offset?: number}> = ({words, y = 1220, offset = 0}) => {
  const f = useCurrentFrame();
  const t = f / 30 + offset;
  // groupe de 3 mots autour du mot courant
  const i = words.findIndex((w) => t < w.e + 0.15);
  if (i < 0 || t < words[0].s - 0.1) return null;
  const g = Math.floor(i / 3) * 3;
  const grp = words.slice(g, g + 3);
  return (
    <div style={{position: 'absolute', left: 80, right: 150, top: y, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 12}}>
      {grp.map((w, k) => {
        const on = t >= w.s;
        return <span key={g + k} style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 62, lineHeight: 1.1, color: '#fff', padding: '4px 14px', borderRadius: 14, background: on ? 'rgba(91,63,228,0.92)' : 'rgba(15,23,42,0.75)', transform: `scale(${on ? 1 : 0.94})`, textTransform: 'uppercase', letterSpacing: '0.01em'}}>{w.w.replace(/[«»]/g, '')}</span>;
      })}
    </div>
  );
};

const Clip: React.FC<{s: Extract<Seg, {type: 'clip'}>; badge?: string}> = ({s, badge}) => {
  const f = useCurrentFrame();
  const d = segFrames(s);
  const z = 1.02 + (f / d) * 0.05;
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <AbsoluteFill style={{transform: `scale(${z})`}}>
        <OffthreadVideo src={staticFile(`media/${s.src}`)} startFrom={Math.round(s.from * 30)} style={{width: '100%', height: '100%', objectFit: 'cover', filter: s.night ? 'saturate(0.8)' : undefined}} />
      </AbsoluteFill>
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0.35) 0%, transparent 22%, transparent 62%, rgba(0,0,0,0.45) 100%)'}} />
      {badge && <div style={{position: 'absolute', left: 80, top: 260, display: 'flex', alignItems: 'center', gap: 10, padding: '10px 20px', borderRadius: 99, background: 'rgba(255,255,255,0.95)', fontFamily: FONT, fontWeight: 800, fontSize: 28, color: INK, opacity: prog(f, 2, 8)}}><Logo s={30} /> {badge}</div>}
      {s.tag && <div style={{position: 'absolute', left: 80, top: badge ? 340 : 260, padding: '12px 26px', borderRadius: 16, background: s.tagColor ?? '#DC2626', color: '#fff', fontFamily: DISPLAY, fontWeight: 700, fontSize: 48, letterSpacing: '0.04em', transform: `scale(${spring({frame: f - 2, fps: 30, config: {damping: 10}})}) rotate(-3deg)`}}>{s.tag}</div>}
      {s.name && <div style={{position: 'absolute', left: 80, top: 1120, fontFamily: FONT, fontWeight: 700, fontSize: 26, color: 'rgba(255,255,255,0.85)', opacity: prog(f, 4, 8)}}>{s.name}</div>}
      <Caps words={s.words} offset={s.from} />
    </AbsoluteFill>
  );
};

const Demo: React.FC<{s: Extract<Seg, {type: 'demo'}>}> = ({s}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: '#F4F1EA', fontFamily: FONT}}>
      <AbsoluteFill style={{backgroundImage: 'linear-gradient(rgba(15,23,42,0.05) 1.5px, transparent 1.5px), linear-gradient(90deg, rgba(15,23,42,0.05) 1.5px, transparent 1.5px)', backgroundSize: '54px 54px'}} />
      <div style={{position: 'absolute', left: 80, right: 150, top: 270, display: 'flex', alignItems: 'center', gap: 16, fontFamily: DISPLAY, fontWeight: 700, fontSize: 60, lineHeight: 1.05, color: INK, opacity: prog(f, 0, 8)}}><Logo s={64} /> {s.title}</div>
      {s.mode === 'reco' ? (
        <div style={{position: 'absolute', left: 80, right: 150, top: 420, display: 'flex', flexDirection: 'column', gap: 18}}>
          {[{i: '🎯', t: 'Ciblage large', d: 'Laisse l’algorithme trouver tes clients'}, {i: '🎬', t: '3 créas variées prêtes', d: 'Visages, angles et formats différents'}, {i: '⏳', t: 'Ne touche à rien 7 jours', d: 'Ta pub est en apprentissage'}, {i: '📈', t: 'Puis augmente par paliers', d: 'Quand le coût est stable'}].map((r, k) => {
            const p = spring({frame: f - 6 - k * 8, fps: 30, config: {damping: 12}});
            return (
              <div key={r.t} style={{display: 'flex', alignItems: 'center', gap: 20, padding: '22px 26px', borderRadius: 26, background: '#fff', border: '2px solid #E5E7EB', boxShadow: '0 20px 40px -26px rgba(15,23,42,0.5)', transform: `translateX(${(1 - p) * 120}px)`, opacity: p}}>
                <div style={{fontSize: 52}}>{r.i}</div>
                <div style={{flex: 1}}><div style={{fontSize: 36, fontWeight: 800, color: INK}}>{r.t}</div><div style={{fontSize: 24, color: '#64748B', marginTop: 4}}>{r.d}</div></div>
                <Check s={36} />
              </div>
            );
          })}
        </div>
      ) : s.mode === 'cal' ? (
        <>
          <CalGrid f={f} start={4} x={80} y={420} w={850} step={2} />
          <NetRows f={f} start={30} x={80} y={1010} w={850} rows={[{n: 'Instagram', c: '#E1306C', h: 'Mar. 18:30'}, {n: 'TikTok', c: '#111', h: 'Mer. 12:15'}]} />
        </>
      ) : (
        <WaPhone x={170} y={420} w={700} h={760}>
          <WaBubble f={f} start={4} time="09:02">⚠️ Ta pub <b>« Soldes hiver »</b> s’essouffle : fréquence en hausse, clics en baisse.</WaBubble>
          <WaBubble f={f} start={18} time="09:02">✨ 3 nouvelles créas sont prêtes.</WaBubble>
          <WaButtons f={f} start={26} labels={['Voir', 'Remplacer']} />
          <WaBubble f={f} start={40} time="Lun. 08:30"><b>👋 Ton bilan de la semaine est prêt</b></WaBubble>
        </WaPhone>
      )}
      {s.voWords && <Caps words={s.voWords} y={1230} />}
    </AbsoluteFill>
  );
};

const End: React.FC<{s: Extract<Seg, {type: 'end'}>}> = ({s}) => {
  const f = useCurrentFrame();
  const d = segFrames(s);
  return (
    <AbsoluteFill style={{background: '#F4F1EA', fontFamily: FONT}}>
      {s.split && (
        <div style={{position: 'absolute', left: 80, right: 150, top: 260, display: 'flex', gap: 18}}>
          {[{t: s.split.left, img: s.split.leftImg, c: '#DC2626'}, {t: s.split.right, img: s.split.rightImg, c: '#16A34A'}].map((x, i) => (
            <div key={i} style={{flex: 1, borderRadius: 26, overflow: 'hidden', position: 'relative', height: 520, transform: `scale(${spring({frame: f - i * 5, fps: 30, config: {damping: 12}})})`, boxShadow: '0 30px 50px -30px rgba(15,23,42,0.6)'}}>
              <Img src={staticFile(`media/${x.img}`)} style={{width: '100%', height: '100%', objectFit: 'cover', filter: i ? undefined : 'grayscale(0.6)'}} />
              <div style={{position: 'absolute', left: 12, right: 12, bottom: 12, padding: '10px 12px', borderRadius: 14, background: x.c, color: '#fff', fontWeight: 800, fontSize: 26, lineHeight: 1.15, whiteSpace: 'pre-line'}}>{x.t}</div>
            </div>
          ))}
        </div>
      )}
      <div style={{position: 'absolute', left: 80, right: 150, top: s.split ? 820 : 520, textAlign: 'center'}}>
        <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, transform: `scale(${spring({frame: f - 4, fps: 30, config: {damping: 12}})})`}}><Logo s={90} /><span style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 76, color: INK}}>Growthity</span></div>
        <div style={{marginTop: 26, fontFamily: DISPLAY, fontWeight: 700, fontSize: 64, lineHeight: 1.05, color: INK, opacity: prog(f, 10, 10)}}>{s.title[0]}<br /><span style={{backgroundImage: GRAD, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>{s.title[1]}</span></div>
        <div style={{marginTop: 34, display: 'inline-flex', alignItems: 'center', gap: 12, padding: '18px 34px', borderRadius: 99, backgroundImage: GRAD, color: '#fff', fontSize: 34, fontWeight: 800, opacity: prog(f, 22, 10)}}><Check s={32} c="#fff" /> Lien en bio pour commencer</div>
      </div>
      <AbsoluteFill style={{background: '#000', opacity: interpolate(f, [d - 8, d], [0, 1], clamp)}} />
    </AbsoluteFill>
  );
};

export const SocialStory: React.FC<{cfg: StoryCfg}> = ({cfg}) => {
  useFonts();
  const f = useCurrentFrame();
  let t = 0;
  const starts = cfg.segs.map((s) => { const a = t; t += segFrames(s); return a; });
  const flash = Math.max(0, ...starts.slice(1).map((a) => 1 - Math.abs(f - a) / 4));
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {cfg.segs.map((s, i) => (
        <Sequence key={i} from={starts[i]} durationInFrames={segFrames(s)}>
          {s.type === 'clip' ? <Clip s={s} badge={i === 0 ? cfg.badge : undefined} /> : s.type === 'demo' ? <Demo s={s} /> : <End s={s} />}
          {(s.type === 'demo' || s.type === 'end') && s.vo ? <Sequence from={3}><Audio src={staticFile(s.vo)} /></Sequence> : null}
        </Sequence>
      ))}
      <AbsoluteFill style={{background: '#fff', opacity: flash * 0.5, pointerEvents: 'none'}} />
      <Audio src={staticFile(cfg.bed)} volume={0.6} />
    </AbsoluteFill>
  );
};
