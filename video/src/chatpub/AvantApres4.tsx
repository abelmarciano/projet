// Avant / après #4 (modèle réutilisable par config) : AVANT (galère filmée, voix off, compteur de prises) → « Et avec Growthity ? »
// → mini-chat (une phrase, Prête) → APRÈS (pub UGC Kling avec sa voix) → écran final avant / après.
import React from 'react';
import {AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame} from 'remotion';
import {FONT, DISPLAY, GRAD, INK, Check, Spinner, clamp, prog, useFonts} from './SplitChat';

const Logo: React.FC<{s: number}> = ({s}) => <Img src={staticFile('media/chat/banner/logo.svg')} style={{width: s, height: s}} />;

type Word = {w: string; s: number; e: number};
export type Av4Cfg = {
  before: {video: string; start?: number; dur: number; vo: string; voWords: Word[]; takes: number; takeAt: number};
  tr: {vo: string; dur: number};
  chat: {vo: string; voWords: Word[]; prompt: string; dur: number; voAt?: number; actors?: {img: string; name: string}[]; pick?: number; pickLabel?: string; lockAt?: number; readyAt?: number; products?: {img: string; name: string}[]; productPick?: number; productLabel?: string; productStart?: number; productLockAt?: number};
  after: {video: string; dur: number; words: Word[]; sticker: {text: string; at: number; to: number}};
  end: {vo: string; dur: number; left: string; right: string; beforeStill: string; afterStill: string};
  bed: string; brand: string;
};

const Subs: React.FC<{words: Word[]; offset?: number; top?: number; dark?: boolean}> = ({words, offset = 0, top = 1260, dark}) => {
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
          return <span key={i} style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 80, lineHeight: 1, textTransform: 'uppercase', ...(dark ? {color: on ? INK : 'rgba(15,23,42,0.3)'} : {color: on ? '#fff' : 'rgba(255,255,255,0.5)', WebkitTextStroke: '3px rgba(0,0,0,0.85)', paintOrder: 'stroke fill', textShadow: '0 8px 30px rgba(0,0,0,0.6)'})}}>{c}</span>;
        })}
      </div>
    </div>
  );
};

const Pill: React.FC<{text: string; color: string; at: number}> = ({text, color, at}) => {
  const f = useCurrentFrame();
  const p = spring({frame: f - at, fps: 30, config: {damping: 12}});
  return <div style={{position: 'absolute', left: 60, top: 240, display: 'flex', alignItems: 'center', gap: 14, padding: '14px 26px', borderRadius: 16, background: 'rgba(12,12,16,0.62)', border: '1.5px solid rgba(255,255,255,0.18)', color: '#fff', fontFamily: DISPLAY, fontWeight: 700, fontSize: 44, letterSpacing: '0.14em', transform: `translateX(${(1 - p) * -200}px)`, zIndex: 15}}><div style={{width: 16, height: 16, borderRadius: 99, background: color, boxShadow: `0 0 16px ${color}`}} />{text}</div>;
};

// Carrousel 3D (acteurs ou produits) qui défile puis se verrouille sur l'élément choisi (halo, coche, fiche).
const Picker: React.FC<{title: string; items: {img: string; name: string}[]; pick: number; start: number; lock: number; label?: string; w?: number; h?: number; height?: number; contain?: boolean}> = ({title, items, pick, start, lock, label, w = 230, h = 330, height = 470, contain}) => {
  const lf = useCurrentFrame(); // temps relatif à la séquence du chat
  const n = items.length;
  const pos = interpolate(lf, [start, lock], [0, 2 * n + pick], {...clamp, easing: (x: number) => 1 - Math.pow(1 - x, 3.2)});
  const locked = lf >= lock; const lp = spring({frame: lf - lock, fps: 30, config: {damping: 11}});
  const appear = prog(lf, start, 8);
  return (
    <div style={{position: 'relative', height, marginTop: 24, perspective: 1400, opacity: appear, transform: `translateY(${(1 - appear) * 20}px)`}}>
      <div style={{position: 'absolute', left: 0, top: 4, fontSize: 24, fontWeight: 800, letterSpacing: '0.16em', color: '#6B7280'}}>{title}</div>
      {items.map((a, i) => {
        let d = i - (pos % n); if (d > n / 2) d -= n; if (d < -n / 2) d += n;
        const ang = d * 34; const z = -Math.abs(d) * 120; const x = Math.sin((ang * Math.PI) / 180) * (w * 1.55);
        const isPick = i === pick && locked;
        const sc = isPick ? 1 + lp * 0.12 : 1;
        const op = Math.max(0, 1 - Math.abs(d) * 0.32) * (locked && i !== pick ? 1 - lp * 0.6 : 1);
        return (
          <div key={i} style={{position: 'absolute', left: '50%', top: 50, width: w, height: h, marginLeft: -w / 2, transform: `translateX(${x}px) translateZ(${z}px) rotateY(${-ang * 0.8}deg) scale(${sc})`, opacity: op, zIndex: 100 - Math.round(Math.abs(d) * 10), borderRadius: 24, overflow: 'hidden', background: '#fff', boxShadow: isPick ? `0 0 0 ${6 * lp}px #8B6DFF, 0 0 ${60 * lp}px rgba(139,109,255,0.9), 0 30px 60px -20px rgba(0,0,0,0.5)` : '0 20px 40px -18px rgba(0,0,0,0.45)', filter: locked && i !== pick ? `blur(${lp * 3}px)` : 'none'}}>
            <Img src={staticFile(`media/${a.img}`)} style={{width: '100%', height: '100%', objectFit: contain ? 'contain' : 'cover', background: '#F3F4F6'}} />
            <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, padding: '34px 12px 10px', background: 'linear-gradient(transparent, rgba(0,0,0,0.65))', color: '#fff', fontWeight: 800, fontSize: 20}}>{a.name}</div>
            {isPick && <div style={{position: 'absolute', top: 10, right: 10, width: 46, height: 46, borderRadius: 99, background: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${lp})`}}><Check s={30} c="#fff" /></div>}
          </div>
        );
      })}
      {locked && label && (
        <div style={{position: 'absolute', left: '50%', bottom: 0, transform: `translateX(-50%) translateY(${(1 - lp) * 20}px)`, opacity: lp, display: 'flex', alignItems: 'center', gap: 12, padding: '10px 22px', borderRadius: 99, background: '#F5F3FF', border: '2px solid #C4B5FD', fontSize: 26, fontWeight: 800, color: '#5B3FE4', whiteSpace: 'nowrap'}}>✨ {label}</div>
      )}
    </div>
  );
};

export const avap4Total = (c: Av4Cfg) => Math.round((c.before.dur + c.tr.dur + c.chat.dur + c.after.dur + c.end.dur) * 30);

export const AvantApres4: React.FC<{cfg: Av4Cfg}> = ({cfg}) => {
  useFonts();
  const f = useCurrentFrame();
  const A = 0, B = Math.round(cfg.before.dur * 30), T = B + Math.round(cfg.tr.dur * 30), C = T + Math.round(cfg.chat.dur * 30), D = C + Math.round(cfg.after.dur * 30), E = D + Math.round(cfg.end.dur * 30);
  // compteur de prises
  const takeStart = Math.round(cfg.before.takeAt * 30);
  const take = Math.max(1, Math.round(interpolate(f, [20, takeStart], [1, cfg.before.takes], {...clamp, easing: (x: number) => x * x})));
  const typed = cfg.chat.prompt.slice(0, Math.round(interpolate(f - T, [3, 26], [0, cfg.chat.prompt.length], clamp)));
  const ready = f - T >= Math.round((cfg.chat.readyAt ?? 1.4) * 30);

  return (
    <AbsoluteFill style={{background: '#000', fontFamily: FONT}}>
      {/* AVANT */}
      <Sequence from={A} durationInFrames={B}>
        <AbsoluteFill style={{filter: `saturate(0.55) contrast(1.05) blur(${interpolate(f, [B - 6, B], [0, 18], clamp)}px)`, transform: `scale(${1.02 + (f / B) * 0.05 + interpolate(f, [B - 6, B], [0, 0.25], clamp)})`}}><OffthreadVideo src={staticFile(`media/${cfg.before.video}`)} startFrom={Math.round((cfg.before.start ?? 0) * 30)} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} /></AbsoluteFill>
        <AbsoluteFill style={{background: 'radial-gradient(120% 70% at 50% 45%, transparent 50%, rgba(0,0,0,0.55))'}} />
        <Pill text="AVANT" color="#DC2626" at={4} />
        <div style={{position: 'absolute', right: 60, top: 228, display: 'flex', alignItems: 'baseline', gap: 12, padding: '12px 24px', borderRadius: 16, background: 'rgba(12,12,16,0.62)', border: '1.5px solid rgba(255,255,255,0.18)', color: '#fff', zIndex: 15}}><span style={{fontSize: 24, fontWeight: 700, letterSpacing: '0.18em', opacity: 0.75}}>PRISE</span><span style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 64, lineHeight: 1, color: take >= cfg.before.takes ? '#F87171' : '#fff'}}>{String(take).padStart(2, '0')}</span></div>
        <Subs words={cfg.before.voWords} offset={0.2} />
      </Sequence>

      {/* TRANSITION */}
      <Sequence from={B} durationInFrames={T - B}>
        <AbsoluteFill style={{background: 'radial-gradient(70% 45% at 50% 46%, #EEEBFF 0%, #F7F6F3 70%)', transform: `scale(${interpolate(f, [B, B + 8], [1.12, 1], {...clamp, easing: (x: number) => 1 - Math.pow(1 - x, 3)})})`, filter: `blur(${interpolate(f, [B, B + 7], [14, 0], clamp)}px)`}}>
          <div style={{position: 'absolute', left: 0, right: 0, top: 640, display: 'flex', justifyContent: 'center'}}>
            <div style={{transform: `scale(${0.7 + spring({frame: f - B, fps: 30, config: {damping: 12, stiffness: 180}}) * 0.3})`, filter: 'drop-shadow(0 30px 50px rgba(91,63,228,0.35))'}}><Logo s={190} /></div>
          </div>
          <div style={{position: 'absolute', left: 0, right: 0, top: 900, textAlign: 'center', fontFamily: DISPLAY, fontWeight: 700, fontSize: 96, lineHeight: 1.05, letterSpacing: '-0.02em', color: INK, opacity: prog(f, B + 3, 7), transform: `translateY(${(1 - prog(f, B + 3, 7)) * 24}px)`}}>
            Et avec<br /><span style={{backgroundImage: GRAD, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>{cfg.brand}</span> ?
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* CHAT */}
      <Sequence from={T} durationInFrames={C - T}>
        <AbsoluteFill style={{background: 'radial-gradient(70% 45% at 50% 46%, #EEEBFF 0%, #F7F6F3 70%)'}}>
          <div style={{position: 'absolute', left: 70, right: 70, top: cfg.chat.products ? 230 : cfg.chat.actors ? 360 : 560, borderRadius: 40, background: '#fff', padding: 44, boxShadow: '0 50px 120px -40px rgba(91,63,228,0.6)', transform: `scale(${0.9 + spring({frame: f - T, fps: 30, config: {damping: 13}}) * 0.1})`}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 16, fontWeight: 700, fontSize: 38, color: INK, marginBottom: 28}}><Logo s={56} /> {cfg.brand}</div>
            <div style={{minHeight: 200, padding: '26px 30px', borderRadius: 28, border: '3px solid #C4B5FD', fontSize: 46, lineHeight: 1.3, color: INK, fontWeight: 500}}>{typed}{!ready && <span style={{opacity: Math.floor(f / 8) % 2 ? 1 : 0, color: '#6552E8'}}>|</span>}</div>
            {cfg.chat.actors && f - T >= 24 && <Picker title="ACTRICE" items={cfg.chat.actors} pick={cfg.chat.pick ?? 0} start={24} lock={Math.round((cfg.chat.lockAt ?? 2) * 30)} label={cfg.chat.pickLabel} w={200} h={290} height={410} />}
            {cfg.chat.products && f - T >= Math.round((cfg.chat.productStart ?? 2.4) * 30) && <Picker title="PRODUIT" items={cfg.chat.products} pick={cfg.chat.productPick ?? 0} start={Math.round((cfg.chat.productStart ?? 2.4) * 30)} lock={Math.round((cfg.chat.productLockAt ?? 3.6) * 30)} label={cfg.chat.productLabel} w={200} h={220} height={340} />}
            <div style={{display: 'flex', alignItems: 'center', gap: 16, marginTop: 30, fontSize: 40, fontWeight: 800, color: ready ? '#15803D' : '#5B3FE4'}}>
              {ready ? <><Check s={46} /> Ta pub est prête</> : f - T > 27 ? <><Spinner f={f} s={40} /> {cfg.chat.actors && f - T < Math.round((cfg.chat.lockAt ?? 2) * 30) ? 'Je choisis ton actrice…' : cfg.chat.products && f - T < Math.round((cfg.chat.productLockAt ?? 3.6) * 30) ? 'Je prends ton produit…' : 'Je crée ta pub…'}</> : null}
            </div>
          </div>
        </AbsoluteFill>
        <Subs words={cfg.chat.voWords} offset={cfg.chat.voAt ?? 0.13} top={1640} dark />
      </Sequence>

      {/* APRÈS */}
      <Sequence from={C} durationInFrames={D - C}>
        <OffthreadVideo src={staticFile(`media/${cfg.after.video}`)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
        <Pill text="APRÈS" color="#16A34A" at={2} />
        {f - C >= cfg.after.sticker.at * 30 && f - C < cfg.after.sticker.to * 30 && (
          <div style={{position: 'absolute', left: 80, top: 700, padding: '16px 28px', borderRadius: 20, background: '#fff', color: INK, fontWeight: 800, fontSize: 42, transform: `rotate(-3deg) scale(${spring({frame: f - C - cfg.after.sticker.at * 30, fps: 30, config: {damping: 11}})})`, boxShadow: '0 20px 40px -14px rgba(0,0,0,0.6)', zIndex: 15}}>{cfg.after.sticker.text}</div>
        )}
        <Subs words={cfg.after.words} offset={0} />
      </Sequence>

      {/* FIN */}
      <Sequence from={D} durationInFrames={E - D}>
        <AbsoluteFill style={{background: 'radial-gradient(70% 45% at 50% 40%, #EEEBFF 0%, #F7F6F3 70%)'}}>
          <div style={{position: 'absolute', left: 70, right: 70, top: 200, display: 'flex', gap: 28}}>
            {[{img: cfg.end.beforeStill, label: cfg.end.left, c: '#DC2626', grey: true}, {img: cfg.end.afterStill, label: cfg.end.right, c: '#16A34A', grey: false}].map((x, i) => {
              const p = spring({frame: f - D - i * 4, fps: 30, config: {damping: 14}});
              return (
                <div key={i} style={{flex: 1, transform: `translateY(${(1 - p) * 60}px)`, opacity: Math.min(1, p * 1.5)}}>
                  <div style={{position: 'relative', height: 760, borderRadius: 32, overflow: 'hidden', boxShadow: '0 40px 80px -30px rgba(15,23,42,0.55)'}}>
                    <Img src={staticFile(`media/${x.img}`)} style={{width: '100%', height: '100%', objectFit: 'cover', filter: x.grey ? 'saturate(0.35) brightness(0.9)' : 'none'}} />
                    <div style={{position: 'absolute', left: 18, top: 18, display: 'flex', alignItems: 'center', gap: 10, padding: '10px 18px', borderRadius: 14, background: 'rgba(12,12,16,0.62)', color: '#fff', fontFamily: DISPLAY, fontWeight: 700, fontSize: 30, letterSpacing: '0.14em'}}><div style={{width: 12, height: 12, borderRadius: 99, background: x.c}} />{x.label.split('\n')[0]}</div>
                  </div>
                  <div style={{marginTop: 22, textAlign: 'center', color: INK, fontFamily: DISPLAY, fontWeight: 700, fontSize: 44, lineHeight: 1.1}}>{x.label.split('\n').slice(1).join(' ')}</div>
                </div>
              );
            })}
          </div>
          <div style={{position: 'absolute', left: 0, right: 0, top: 1210, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, opacity: prog(f, D + 10, 9), transform: `translateY(${(1 - prog(f, D + 10, 9)) * 20}px)`}}>
            <Logo s={92} /><span style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 80, color: INK, letterSpacing: '-0.02em'}}>{cfg.brand}</span>
          </div>
          <div style={{position: 'absolute', left: 0, right: 0, top: 1350, display: 'flex', justifyContent: 'center', opacity: prog(f, D + 16, 9)}}>
            <div style={{padding: '20px 44px', borderRadius: 99, backgroundImage: GRAD, color: '#fff', fontSize: 38, fontWeight: 800, boxShadow: '0 20px 40px -14px rgba(91,63,228,0.7)'}}>Lien en bio pour commencer</div>
          </div>
        </AbsoluteFill>
        <AbsoluteFill style={{background: '#000', opacity: interpolate(f, [E - 12, E - 1], [0, 1], clamp)}} />
      </Sequence>

      {/* audio */}
      <Sequence from={6}><Audio src={staticFile(cfg.before.vo)} /></Sequence>
      <Sequence from={B + 1}><Audio src={staticFile(cfg.tr.vo)} /></Sequence>
      <Sequence from={T + Math.round((cfg.chat.voAt ?? 0.13) * 30)}><Audio src={staticFile(cfg.chat.vo)} /></Sequence>
      <Sequence from={D + 4}><Audio src={staticFile(cfg.end.vo)} /></Sequence>
      <Audio src={staticFile(cfg.bed)} />
    </AbsoluteFill>
  );
};
