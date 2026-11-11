// Split-screen #7 : montage viral automatique. On envoie une vidéo brute au chat Growthity : il transcrit, coupe les blancs,
// ajoute sous-titres, zooms et musique, puis montre l'avant / après prêt à poster.
import React from 'react';
import {Easing, Img, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Check, Cursor, FONT, DISPLAY, GRAD, INK, LINE, Logo, MUTED, SplitCfg, SplitChat, Spinner, clamp, prog} from './SplitChat';

export type EditCfg = SplitCfg & {
  ask1: string; file: {name: string; dur: string; thumb: string}; raw: string; edited: string;
  rawDur: number; segments: {from: number; to: number}[]; saved: string; subsSample: string[];
};

const EditWindow: React.FC<{cfg: SplitCfg}> = ({cfg: base}) => {
  const cfg = base as EditCfg;
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const C = (k: string) => Math.round((cfg.cues[k] ?? 99) * fps);
  const ask1 = C('ask1'), send1 = C('send1'), drop = C('drop'), cut = C('cut'), subs = C('subs'), zoom = C('zoom'), music = C('music'), ready = C('ready');

  const composer = f >= ask1 && f < send1 ? cfg.ask1.slice(0, Math.round(interpolate(f, [ask1, send1 - 8], [0, cfg.ask1.length], clamp))) : '';
  const typingNow = f >= ask1 && f < send1;
  const attached = f >= drop;
  const home = 1 - prog(f, send1, 12);
  const scroll = prog(f, ready - 8, 16) * 470;

  const pts: [number, number, number][] = [[0, 640, 600], [drop - 14, 300, 420], [drop, 300, 690], [ask1 + 6, 560, 690], [send1 - 12, 900, 715], [send1, 900, 715], [cut + 10, 640, 330], [music + 10, 700, 520], [ready + 40, 820, 600]];
  const ease = {...clamp, easing: Easing.inOut(Easing.cubic)};
  const cx = interpolate(f, pts.map((p) => p[0]), pts.map((p) => p[1]), ease);
  const cy = interpolate(f, pts.map((p) => p[0]), pts.map((p) => p[2]), ease);
  const tap = (a: number) => (f >= a - 2 ? interpolate(f, [a - 2, a + 10], [1, 0], clamp) : 0);
  const down = Math.max(tap(drop), tap(send1));

  // timeline: segments kept vs gaps removed
  const cutP = prog(f, cut, 18);
  const gaps: {from: number; to: number}[] = [];
  let last = 0;
  cfg.segments.forEach((s) => { if (s.from > last) gaps.push({from: last, to: s.from}); last = s.to; });
  if (cfg.rawDur > last) gaps.push({from: last, to: cfg.rawDur});
  const pieces = [...cfg.segments.map((s) => ({...s, keep: true})), ...gaps.map((g) => ({...g, keep: false}))].sort((a, b) => a.from - b.from);
  const total = pieces.reduce((a, p) => a + (p.keep ? p.to - p.from : (p.to - p.from) * (1 - cutP)), 0);

  const row = (k: number, label: string, body: React.ReactNode) => {
    const on = f >= k; const p = prog(f, k - 4, 10);
    return (
      <div style={{display: 'flex', alignItems: 'center', gap: 14, padding: '11px 14px', borderRadius: 16, border: `1.5px solid ${on ? '#DCFCE7' : LINE}`, background: on ? '#F7FEF9' : '#fff', opacity: 0.4 + p * 0.6, marginTop: 8}}>
        <div style={{width: 26}}>{on ? <div style={{transform: `scale(${spring({frame: f - k, fps, config: {damping: 10}})})`}}><Check s={24} /></div> : <Spinner f={f} s={20} />}</div>
        <div style={{width: 150, fontSize: 18, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: MUTED}}>{label}</div>
        <div style={{flex: 1, opacity: p}}>{body}</div>
      </div>
    );
  };

  return (
    <div style={{position: 'absolute', left: 40, top: 140, width: 1000, height: 820, borderRadius: 30, background: '#fff', boxShadow: '0 40px 90px -30px rgba(15,23,42,0.45), 0 0 0 1.5px rgba(15,23,42,0.08)', overflow: 'hidden', fontFamily: FONT}}>
      <div style={{height: 64, display: 'flex', alignItems: 'center', padding: '0 24px', gap: 10, borderBottom: `1.5px solid ${LINE}`, background: '#FAFAFC', position: 'relative', zIndex: 3}}>
        {['#FF5F57', '#FEBC2E', '#28C840'].map((c) => <div key={c} style={{width: 16, height: 16, borderRadius: 99, background: c}} />)}
        <div style={{flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10, fontWeight: 700, fontSize: 24, color: INK, marginRight: 70}}><Logo s={30} /> {cfg.brand}</div>
      </div>

      <div style={{position: 'absolute', left: 0, right: 0, top: 170, textAlign: 'center', fontFamily: DISPLAY, fontWeight: 700, fontSize: 50, color: INK, letterSpacing: '-0.02em', opacity: home, transform: `translateY(${(1 - home) * -40}px)`}}>
        Que veux-tu créer <span style={{backgroundImage: GRAD, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>aujourd'hui</span> ?
        {/* drop zone */}
        <div style={{margin: '34px auto 0', width: 560, height: 150, borderRadius: 22, border: `2.5px dashed ${attached ? '#86EFAC' : '#C4B5FD'}`, background: attached ? '#F0FDF4' : '#FAF8FF', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, fontFamily: FONT, fontSize: 22, fontWeight: 600, color: attached ? '#15803D' : '#6552E8', letterSpacing: 0}}>
          {attached ? <><Img src={staticFile(`media/${cfg.file.thumb}`)} style={{width: 66, height: 100, borderRadius: 10, objectFit: 'cover'}} /><div style={{textAlign: 'left'}}><div style={{color: INK, fontWeight: 700}}>{cfg.file.name}</div><div style={{fontSize: 18, color: MUTED}}>Vidéo brute · {cfg.file.dur}</div></div><Check s={30} /></> : <>🎬 Glisse ta vidéo brute ici</>}
        </div>
      </div>
      {/* dragged file */}
      {f >= drop - 16 && f < drop && (
        <div style={{position: 'absolute', left: cx - 40, top: cy - 120, width: 80, height: 120, borderRadius: 10, overflow: 'hidden', transform: 'rotate(-6deg)', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.5)', zIndex: 20}}>
          <Img src={staticFile(`media/${cfg.file.thumb}`)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
        </div>
      )}

      {f >= send1 && (
        <div style={{position: 'absolute', left: 30, right: 30, top: 64, height: 640, overflow: 'hidden'}}>
          <div style={{transform: `translateY(${-scroll}px)`, paddingTop: 20}}>
            <div style={{display: 'flex', justifyContent: 'flex-end', opacity: prog(f, send1, 10)}}>
              <div style={{display: 'flex', alignItems: 'center', gap: 14, padding: '10px 18px 10px 10px', borderRadius: '24px 24px 6px 24px', background: '#EEF2FF', border: '1.5px solid #DDE3FF', fontSize: 24, color: INK, fontWeight: 500}}>
                <Img src={staticFile(`media/${cfg.file.thumb}`)} style={{width: 54, height: 80, borderRadius: 10, objectFit: 'cover'}} />
                <div><div style={{fontSize: 16, color: MUTED, fontWeight: 600}}>{cfg.file.name} · {cfg.file.dur}</div>{cfg.ask1}</div>
              </div>
            </div>
            <div style={{display: 'flex', alignItems: 'center', gap: 12, margin: '14px 0 6px', opacity: prog(f, send1 + 6, 8)}}>
              <Logo s={36} />
              <div style={{fontWeight: 700, fontSize: 22, color: INK}}>{f < ready ? 'Je monte ta vidéo…' : 'Ta vidéo est prête à poster ✨'}</div>
              {f < ready && <Spinner f={f} />}
            </div>
            {/* timeline */}
            <div style={{padding: '14px 16px', borderRadius: 18, border: `1.5px solid ${LINE}`, opacity: prog(f, send1 + 10, 10)}}>
              <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 700, color: MUTED, letterSpacing: '0.06em', marginBottom: 8}}>
                <span>TIMELINE</span><span style={{color: f >= cut ? '#15803D' : MUTED}}>{f >= cut ? `${cfg.saved} de blancs coupés` : 'Transcription…'}</span>
              </div>
              <div style={{display: 'flex', height: 54, borderRadius: 10, overflow: 'hidden', gap: 2}}>
                {pieces.map((p, i) => {
                  const w = p.keep ? p.to - p.from : (p.to - p.from) * (1 - cutP);
                  return <div key={i} style={{width: `${(w / total) * 100}%`, background: p.keep ? 'linear-gradient(180deg,#A78BFA,#6552E8)' : 'repeating-linear-gradient(45deg,#FCA5A5,#FCA5A5 6px,#FEE2E2 6px,#FEE2E2 12px)', position: 'relative', overflow: 'hidden'}}>
                    {p.keep && <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', gap: 2, padding: '0 4px'}}>{Array.from({length: 18}).map((_, j) => <div key={j} style={{flex: 1, height: 6 + Math.abs(Math.sin(i * 3 + j * 1.3)) * 30, background: 'rgba(255,255,255,0.55)', borderRadius: 2}} />)}</div>}
                    {p.keep && f >= zoom && <div style={{position: 'absolute', top: 2, left: '40%', fontSize: 14, opacity: prog(f, zoom + i * 3, 6)}}>🔍</div>}
                  </div>;
                })}
              </div>
              {f >= music && <div style={{display: 'flex', alignItems: 'center', gap: 3, height: 24, marginTop: 6}}>{Array.from({length: 70}).map((_, j) => <div key={j} style={{flex: 1, height: 4 + Math.abs(Math.sin(j * 0.7 + f * 0.25)) * 18 * prog(f, music, 10), background: '#F59E0B', borderRadius: 2, opacity: 0.7}} />)}</div>}
            </div>
            {row(cut, 'Blancs', <span style={{fontSize: 20, fontWeight: 600, color: '#334155'}}>{cfg.saved} coupées, rythme serré</span>)}
            {row(subs, 'Sous-titres', <div style={{display: 'flex', gap: 6}}>{cfg.subsSample.map((w, i) => <span key={w} style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 19, padding: '3px 9px', borderRadius: 6, background: i === 1 ? '#6552E8' : INK, color: '#fff', opacity: prog(f, subs + i * 4, 6)}}>{w}</span>)}</div>)}
            {row(zoom, 'Zooms', <span style={{fontSize: 20, fontWeight: 600, color: '#334155'}}>Zooms sur les moments forts + étiquettes</span>)}
            {row(music, 'Musique', <span style={{fontSize: 20, fontWeight: 600, color: '#334155'}}>Ambiance + bruitages calés sur la voix</span>)}

            {/* before / after */}
            <div style={{display: 'flex', gap: 22, justifyContent: 'center', marginTop: 18, opacity: prog(f, ready - 6, 10)}}>
              {[{l: 'Avant', src: cfg.raw, dim: true}, {l: 'Après', src: cfg.edited, dim: false}].map((v) => (
                <div key={v.l} style={{textAlign: 'center'}}>
                  <div style={{position: 'relative', width: 250, height: 444, borderRadius: 20, overflow: 'hidden', background: '#0B0A0C', boxShadow: v.dim ? 'none' : '0 0 0 4px #8B6DFF, 0 24px 50px -20px rgba(91,63,228,0.8)', transform: v.dim ? 'scale(0.94)' : `scale(${f >= ready ? 0.96 + spring({frame: f - ready, fps, config: {damping: 12}}) * 0.04 : 0.96})`}}>
                    {f >= ready - 6 && <Sequence from={ready - 6} layout="none"><OffthreadVideo src={staticFile(`media/${v.src}`)} startFrom={v.dim ? 21 : 0} muted style={{width: '100%', height: '100%', objectFit: 'cover', filter: v.dim ? 'saturate(0.6) brightness(0.85)' : 'none'}} /></Sequence>}
                    {!v.dim && f >= ready && <div style={{position: 'absolute', top: 10, left: 10, display: 'flex', alignItems: 'center', gap: 6, padding: '5px 11px', borderRadius: 99, background: '#fff', fontWeight: 700, fontSize: 16, color: '#15803D'}}><div style={{width: 10, height: 10, borderRadius: 99, background: '#22C55E'}} /> Prête à poster</div>}
                  </div>
                  <div style={{marginTop: 8, fontSize: 20, fontWeight: 800, color: v.dim ? MUTED : '#5B3FE4'}}>{v.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div style={{position: 'absolute', left: 30, right: 30, bottom: 24, height: 92, borderRadius: 26, border: `2px solid ${typingNow ? '#C4B5FD' : LINE}`, boxShadow: typingNow ? '0 0 0 6px rgba(124,108,240,0.12)' : '0 10px 30px -18px rgba(15,23,42,0.3)', background: '#fff', display: 'flex', alignItems: 'center', padding: '0 14px 0 18px', gap: 14, zIndex: 4}}>
        {attached && f < send1 && <Img src={staticFile(`media/${cfg.file.thumb}`)} style={{width: 44, height: 64, borderRadius: 8, objectFit: 'cover'}} />}
        <div style={{flex: 1, fontSize: 28, fontWeight: 500, color: composer ? INK : '#94A3B8', whiteSpace: 'nowrap', overflow: 'hidden'}}>
          {composer || 'Décris la pub que tu veux…'}{typingNow && <span style={{opacity: Math.floor(f / 8) % 2 ? 1 : 0, color: '#6552E8'}}>|</span>}
        </div>
        <div style={{width: 64, height: 64, borderRadius: 20, background: composer ? GRAD : '#F1F3F9', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke={composer ? '#fff' : '#94A3B8'} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M6 11l6-6 6 6" /></svg>
        </div>
      </div>
      <Cursor x={cx} y={cy} down={down} />
    </div>
  );
};

export const SplitEdit: React.FC<{cfg: EditCfg}> = ({cfg}) => <SplitChat cfg={cfg} Window={EditWindow} />;
