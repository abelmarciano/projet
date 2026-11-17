// « Le mode facile » — pub Growthity façon jeu vidéo, mode clair néo-brutaliste (9:16, ~19,7 s).
// Écran titre (difficile / facile) → mode difficile : quêtes ratées, cœurs qui se vident → GAME OVER
// → mode facile : une phrase → NIVEAU TERMINÉ → récompense : la vraie pub (Priya, fleuriste) + succès « Publiée sur Meta »
// → « Growthity. Le mode facile. » + « Commencer ». Aucun chiffre de résultat.
import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Audio, OffthreadVideo, Sequence, continueRender, delayRender, interpolate, random, spring, staticFile, useCurrentFrame} from 'remotion';
import '@fontsource/inter/700.css';
import '@fontsource/inter/800.css';
import '@fontsource/inter/900.css';
import {LogoMark, Wordmark} from '../components/UI';
import {prog} from '../components/anim';
import WORDS from './words.json';
import CFG from './game.json';

type Word = {w: string; s: number; e: number};
const WD = WORDS as Record<string, Word[]>;
const C = CFG as {clip: string; ad: {from: number; to: number}; caps: Word[]; prompt: string};
const INK = '#14121F';
const PAPER = '#FBFAF6';
const Y = '#FFD43B', PINK = '#FF6B9A', GREEN = '#2BD47D', BLUE = '#4D7CFE', RED = '#FF5A5F', PURPLE = '#6D4CF0';
const FONT = 'Inter, system-ui, sans-serif';
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const sp = (f: number, d = 10, m = 0.6) => spring({frame: f, fps: 30, config: {damping: d, mass: m, stiffness: 200}});
const box = (bg: string, sh = 10): React.CSSProperties => ({background: bg, border: `6px solid ${INK}`, borderRadius: 26, boxShadow: `${sh}px ${sh}px 0 ${INK}`});

export const VO = {1: 4, 2: 94, 3: 304, 4: 484} as Record<number, number>;
const cue = (k: number, start: string, d = 0) => {
  const w = WD[`game-${k}`].find((x) => x.w.toLowerCase().startsWith(start));
  return VO[k] + Math.round((w ? w.s : d) * 30);
};
const AD = Math.round((C.ad.to - C.ad.from) * 30);
export const T = {title: 0, pickHard: cue(1, 'difficile', 2.12) + 2, hard: 92, over: 252, pickEasy: 292, easy: 300, done: 372, reward: 410, end: 410 + AD, total: 410 + AD + 96};

const useFonts = () => {
  const [h] = useState(() => delayRender('fonts'));
  useEffect(() => {
    Promise.all(['700 20px Inter', '800 20px Inter', '900 20px Inter'].map((s) => document.fonts.load(s))).then(() => continueRender(h));
  }, [h]);
};

// ---------- décor ----------
const Paper: React.FC<{tint?: string}> = ({tint}) => (
  <AbsoluteFill style={{background: PAPER}}>
    <AbsoluteFill style={{backgroundImage: 'linear-gradient(rgba(20,18,31,0.06) 2px, transparent 2px), linear-gradient(90deg, rgba(20,18,31,0.06) 2px, transparent 2px)', backgroundSize: '60px 60px'}} />
    {tint && <AbsoluteFill style={{background: tint}} />}
  </AbsoluteFill>
);

const Heart: React.FC<{on: boolean; s?: number}> = ({on, s = 56}) => (
  <svg width={s} height={s} viewBox="0 0 24 24"><path d="M12 21s-7.5-4.6-9.6-9.2C1 8.6 3 5 6.6 5c2.1 0 3.6 1.2 5.4 3 1.8-1.8 3.3-3 5.4-3C21 5 23 8.6 21.6 11.8 19.5 16.4 12 21 12 21z" fill={on ? PINK : '#E4E1EA'} stroke={INK} strokeWidth={2} strokeLinejoin="round" /></svg>
);
const Star: React.FC<{s?: number; fill?: string}> = ({s = 120, fill = Y}) => (
  <svg width={s} height={s} viewBox="0 0 24 24"><path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.5L12 17.3l-5.9 3.2 1.3-6.5L2.5 9.4l6.6-.8z" fill={fill} stroke={INK} strokeWidth={1.6} strokeLinejoin="round" /></svg>
);
const Pointer: React.FC<{x: number; y: number; press: boolean}> = ({x, y, press}) => (
  <div style={{position: 'absolute', left: x, top: y, transform: `scale(${press ? 0.85 : 1})`, zIndex: 20}}>
    <svg width="76" height="76" viewBox="0 0 24 24"><path d="M5 3l14 8-6 1.6L10 19z" fill="#fff" stroke={INK} strokeWidth={1.8} strokeLinejoin="round" /></svg>
  </div>
);

// ---------- 1. écran titre ----------
const Title: React.FC = () => {
  const f = useCurrentFrame();
  const t1 = sp(f - 2), b1 = sp(f - 14), b2 = sp(f - 20);
  const cx = interpolate(f, [30, T.pickHard - 4], [820, 650], {...clamp, easing: (x) => 1 - (1 - x) ** 3});
  const cy = interpolate(f, [30, T.pickHard - 4], [1500, 1040], {...clamp, easing: (x) => 1 - (1 - x) ** 3});
  const press = f >= T.pickHard && f < T.pickHard + 6;
  const blink = f % 20 < 12;
  return (
    <AbsoluteFill>
      <Paper />
      <div style={{position: 'absolute', left: 70, right: 70, top: 300, padding: '46px 30px 40px', textAlign: 'center', ...box(Y, 14), transform: `rotate(-2deg) scale(${t1})`}}>
        <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 132, lineHeight: 0.92, letterSpacing: '-0.04em', color: INK}}>FAIRE<br />UNE PUB</div>
        <div style={{marginTop: 18, fontFamily: FONT, fontWeight: 800, fontSize: 36, letterSpacing: '0.12em', color: INK, opacity: blink ? 1 : 0.35}}>CHOISIS TON MODE</div>
      </div>
      <div style={{position: 'absolute', left: 160, right: 160, top: 960, padding: '28px 0', textAlign: 'center', ...box(press ? '#E54850' : RED), transform: `scale(${b1 * (press ? 0.95 : 1)}) translate(${press ? 4 : 0}px, ${press ? 4 : 0}px)`, fontFamily: FONT, fontWeight: 900, fontSize: 64, color: '#fff', letterSpacing: '0.02em'}}>DIFFICILE</div>
      <div style={{position: 'absolute', left: 160, right: 160, top: 1150, padding: '28px 0', textAlign: 'center', ...box(GREEN), transform: `scale(${b2})`, fontFamily: FONT, fontWeight: 900, fontSize: 64, color: INK}}>FACILE</div>
      {f >= 30 && <Pointer x={cx} y={cy} press={press} />}
    </AbsoluteFill>
  );
};

// ---------- 2. mode difficile ----------
const QUESTS = [
  {q: 'Trouver un acteur', fail: 'INDISPONIBLE', k: 'acteur'},
  {q: 'Tourner la vidéo', fail: 'BATTERIE VIDE', k: 'tourner'},
  {q: 'Monter la vidéo', fail: 'LOGICIEL PLANTÉ', k: 'monter'},
  {q: 'Lancer la pub', fail: 'CIBLAGE RATÉ', k: 'lancer'},
];
const Hud: React.FC<{lives: number; day: number | string; color: string; label: string}> = ({lives, day, color, label}) => (
  <div style={{position: 'absolute', left: 50, right: 50, top: 110, display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
    <div style={{display: 'flex', gap: 6}}>{[0, 1, 2, 3].map((i) => <Heart key={i} on={i < lives} />)}</div>
    <div style={{padding: '10px 22px', ...box(color, 6), borderRadius: 18, fontFamily: FONT, fontWeight: 900, fontSize: 34, color: INK}}>{label}</div>
    <div style={{padding: '10px 22px', ...box('#fff', 6), borderRadius: 18, fontFamily: FONT, fontWeight: 900, fontSize: 34, color: INK}}>{day}</div>
  </div>
);

const Hard: React.FC = () => {
  const f = useCurrentFrame();
  const fails = QUESTS.map((q) => cue(2, q.k, 0.5) + 6);
  const lost = fails.filter((a) => f >= a).length;
  const lastFail = fails.filter((a) => f >= a).pop() ?? -100;
  const shake = f - lastFail < 10 ? Math.sin(f * 3.1) * 16 * (1 - (f - lastFail) / 10) : 0;
  const day = 1 + Math.floor(interpolate(f, [T.hard, T.over], [0, 8.99], clamp));
  const out = prog(f, T.over - 4, 6);
  return (
    <AbsoluteFill style={{transform: `translate(${shake}px, ${shake * 0.5}px)`}}>
      <Paper tint={`rgba(255,90,95,${0.05 + lost * 0.025})`} />
      <Hud lives={4 - lost} day={`JOUR ${day}`} color={RED} label="DIFFICILE" />
      <div style={{position: 'absolute', left: 70, right: 70, top: 300, fontFamily: FONT, fontWeight: 900, fontSize: 60, color: INK, letterSpacing: '-0.02em'}}>QUÊTES</div>
      <div style={{position: 'absolute', left: 70, right: 70, top: 400, display: 'flex', flexDirection: 'column', gap: 34}}>
        {QUESTS.map((q, i) => {
          const a = fails[i] - 26;
          const p = sp(f - a);
          const failed = f >= fails[i];
          const st = sp(f - fails[i], 8, 0.5);
          return (
            <div key={q.q} style={{position: 'relative', padding: '30px 34px', display: 'flex', alignItems: 'center', gap: 22, ...box(failed ? '#FFE3E4' : '#fff'), opacity: Math.min(1, p * 1.5), transform: `translateX(${(1 - p) * -200}px)`}}>
              <div style={{width: 64, height: 64, borderRadius: 16, border: `5px solid ${INK}`, background: failed ? RED : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: FONT, fontWeight: 900, fontSize: 40}}>{failed ? '✕' : ''}</div>
              <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 52, color: INK, textDecoration: failed ? 'line-through' : 'none', textDecorationThickness: 6}}>{q.q}</div>
              {failed && <div style={{position: 'absolute', right: 26, top: -30, padding: '8px 18px', border: `5px solid ${RED}`, borderRadius: 12, background: '#fff', color: RED, fontFamily: FONT, fontWeight: 900, fontSize: 32, transform: `rotate(8deg) scale(${2 - st})`, opacity: Math.min(1, st * 2)}}>{q.fail}</div>}
            </div>
          );
        })}
      </div>
      {f >= cue(2, 'recommencer', 4.58) - 4 && (
        <div style={{position: 'absolute', left: 0, right: 0, top: 1290, display: 'flex', justifyContent: 'center'}}>
          <div style={{padding: '18px 34px', ...box(Y, 8), fontFamily: FONT, fontWeight: 900, fontSize: 42, color: INK, transform: `rotate(-3deg) scale(${sp(f - cue(2, 'recommencer', 4.58) + 4)})`}}>↻ ET ON RECOMMENCE…</div>
        </div>
      )}
      <AbsoluteFill style={{background: INK, opacity: out}} />
    </AbsoluteFill>
  );
};

// ---------- 3. game over ----------
const GameOver: React.FC = () => {
  const f = useCurrentFrame(); // local
  const letters = 'GAME OVER'.split('');
  const ask = sp(f - 22);
  const press = f >= T.pickEasy - T.over && f < T.pickEasy - T.over + 6;
  const cx = interpolate(f, [26, T.pickEasy - T.over - 4], [900, 640], clamp);
  const cy = interpolate(f, [26, T.pickEasy - T.over - 4], [1600, 1180], clamp);
  return (
    <AbsoluteFill style={{background: INK}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 620, display: 'flex', justifyContent: 'center', gap: 6}}>
        {letters.map((l, i) => {
          const p = sp(f - i * 2, 8, 0.5);
          return <span key={i} style={{fontFamily: FONT, fontWeight: 900, fontSize: 128, color: i < 4 ? RED : '#fff', transform: `translateY(${(1 - p) * -500}px)`, display: 'inline-block', width: l === ' ' ? 50 : undefined}}>{l}</span>;
        })}
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 870, textAlign: 'center', fontFamily: FONT, fontWeight: 800, fontSize: 40, color: 'rgba(255,255,255,0.7)', opacity: prog(f, 12, 8)}}>Ta pub n’est jamais sortie.</div>
      <div style={{position: 'absolute', left: 120, right: 120, top: 1090, padding: '30px 0', textAlign: 'center', ...box(GREEN), boxShadow: `10px 10px 0 #000`, border: '6px solid #fff', transform: `scale(${ask * (press ? 0.95 : 1)})`, fontFamily: FONT, fontWeight: 900, fontSize: 52, color: INK}}>REJOUER EN MODE FACILE</div>
      {f >= 26 && <Pointer x={cx} y={cy} press={press} />}
    </AbsoluteFill>
  );
};

// ---------- 4. mode facile ----------
const Easy: React.FC = () => {
  const f = useCurrentFrame() + T.easy; // monté à T.easy
  const typeA = cue(3, 'une', 1.06) - 4, typeB = typeA + 40;
  const n = Math.round(interpolate(f, [typeA, typeB], [0, C.prompt.length], clamp));
  const ok = f >= T.done - 8;
  const st = sp(f - (T.done - 8), 8, 0.5);
  const q = sp(f - T.easy - 4);
  const done = prog(f, T.done, 1);
  const stars = [0, 1, 2].map((i) => sp(f - T.done - 6 - i * 5, 8, 0.5));
  return (
    <AbsoluteFill>
      <Paper tint="rgba(43,212,125,0.07)" />
      <Hud lives={4} day="JOUR 1" color={GREEN} label="FACILE" />
      <div style={{position: 'absolute', left: 70, right: 70, top: 330, fontFamily: FONT, fontWeight: 900, fontSize: 60, color: INK, opacity: 1 - done}}>QUÊTE UNIQUE</div>
      <div style={{position: 'absolute', left: 70, right: 70, top: 430, padding: '34px 36px', ...box('#fff'), transform: `scale(${q * (1 - done * 0.08)})`, opacity: 1 - done * 0.85}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 20}}>
          <div style={{width: 64, height: 64, borderRadius: 16, border: `5px solid ${INK}`, background: ok ? GREEN : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 40, color: INK}}>{ok ? '✓' : ''}</div>
          <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 52, color: INK}}>Écrire une phrase</div>
        </div>
        <div style={{marginTop: 26, padding: '24px 26px', borderRadius: 18, border: `4px solid ${INK}`, background: '#F3F1FF', fontFamily: FONT, fontWeight: 800, fontSize: 42, lineHeight: 1.25, color: INK, minHeight: 160, display: 'flex', alignItems: 'flex-start', gap: 14}}>
          <LogoMark size={44} />
          <span>{C.prompt.slice(0, n)}<span style={{display: 'inline-block', width: 5, height: 44, marginLeft: 4, verticalAlign: 'middle', background: f % 20 < 12 ? PURPLE : 'transparent'}} /></span>
        </div>
        {ok && <div style={{position: 'absolute', right: 30, top: -34, padding: '8px 22px', border: `5px solid ${GREEN}`, borderRadius: 12, background: '#fff', color: '#159957', fontFamily: FONT, fontWeight: 900, fontSize: 38, transform: `rotate(-6deg) scale(${2 - st})`, opacity: Math.min(1, st * 2)}}>FAIT !</div>}
      </div>
      {/* NIVEAU TERMINÉ */}
      {f >= T.done && (
        <>
          <div style={{position: 'absolute', left: 60, right: 60, top: 980, padding: '30px 0', textAlign: 'center', ...box(Y, 14), transform: `rotate(-2deg) scale(${sp(f - T.done, 8, 0.5)})`, fontFamily: FONT, fontWeight: 900, fontSize: 92, letterSpacing: '-0.03em', color: INK}}>NIVEAU TERMINÉ !</div>
          <div style={{position: 'absolute', left: 0, right: 0, top: 1200, display: 'flex', justifyContent: 'center', gap: 20}}>
            {stars.map((p, i) => <div key={i} style={{transform: `scale(${p}) rotate(${(1 - p) * 90}deg) translateY(${i === 1 ? -30 : 0}px)`}}><Star s={i === 1 ? 170 : 140} /></div>)}
          </div>
          {Array.from({length: 40}, (_, i) => {
            const t = f - T.done;
            const x = 540 + (random(`cx${i}`) - 0.5) * 1100 * Math.min(1, t / 12);
            const y = 1100 - 500 * Math.min(1, t / 12) + t * t * 0.9 * random(`cy${i}`);
            return <div key={i} style={{position: 'absolute', left: x, top: y, width: 18, height: 28, background: [Y, PINK, GREEN, BLUE, PURPLE][i % 5], border: `3px solid ${INK}`, transform: `rotate(${t * 12 + i * 30}deg)`, opacity: t < 40 ? 1 : 0}} />;
          })}
        </>
      )}
    </AbsoluteFill>
  );
};

// ---------- 5. récompense : la pub ----------
const Reward: React.FC = () => {
  const f = useCurrentFrame(); // local
  const p = sp(f, 10, 0.6);
  const toast = sp(f - 34, 9, 0.5);
  const t = f / 30;
  const caps = C.caps.filter((w) => t >= w.s - 0.03 && t < w.e + 0.35);
  return (
    <AbsoluteFill>
      <Paper tint="rgba(255,212,59,0.12)" />
      <div style={{position: 'absolute', left: 0, right: 0, top: 120, textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 52, color: INK, letterSpacing: '0.04em', opacity: p * (1 - toast)}}>RÉCOMPENSE : TA PUB</div>
      <div style={{position: 'absolute', left: 150, top: 220, width: 780, height: 1180, overflow: 'hidden', ...box('#000', 16), borderRadius: 40, transform: `scale(${p}) rotate(${(1 - p) * -6}deg)`}}>
        <OffthreadVideo src={staticFile(C.clip)} startFrom={Math.round(C.ad.from * 30)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
        <div style={{position: 'absolute', left: 30, right: 30, top: '64%', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 10}}>
          {caps.slice(-3).map((w, i) => <span key={`${w.s}`} style={{fontFamily: FONT, fontWeight: 900, fontSize: 64, textTransform: 'uppercase', color: INK, background: i === caps.slice(-3).length - 1 ? Y : '#fff', border: `5px solid ${INK}`, borderRadius: 14, padding: '0 14px'}}>{w.w.replace(/[.,!?…]+$/, '')}</span>)}
        </div>
      </div>
      {/* succès débloqué */}
      <div style={{position: 'absolute', left: 110, right: 110, top: 70, display: 'flex', alignItems: 'center', gap: 20, padding: '18px 26px', ...box('#fff', 10), transform: `translateY(${(1 - toast) * -300}px) rotate(-1.5deg)`, zIndex: 3}}>
        <div style={{width: 92, height: 92, borderRadius: 20, border: `5px solid ${INK}`, background: Y, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none"><path d="M7 4h10v4a5 5 0 0 1-10 0zM7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3M12 13v4M8 21h8M9 17h6v4H9z" stroke={INK} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" /></svg>
        </div>
        <div>
          <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 26, letterSpacing: '0.12em', color: PURPLE}}>SUCCÈS DÉBLOQUÉ</div>
          <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 46, color: INK}}>Publiée sur Meta</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- 6. fin ----------
const End: React.FC = () => {
  const f = useCurrentFrame(); // local
  const w4 = WD['game-4'];
  const passe = VO[4] - T.end + Math.round((w4.find((w) => w.w.startsWith('Passe'))?.s ?? 1.16) * 30);
  const logo = sp(f - 2);
  const a = sp(f - passe + 2, 8, 0.5);
  const cta = sp(f - passe - 16);
  return (
    <AbsoluteFill>
      <Paper />
      <div style={{position: 'absolute', left: 540, top: 470, transform: `translate(-50%,-50%) scale(${logo})`, display: 'flex', alignItems: 'center', gap: 22, padding: '24px 40px', ...box('#fff', 10)}}>
        <LogoMark size={86} />
        <Wordmark size={80} />
      </div>
      <div style={{position: 'absolute', left: 70, right: 70, top: 700, padding: '40px 20px 46px', textAlign: 'center', ...box(GREEN, 14), transform: `rotate(-2deg) scale(${a})`}}>
        <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 70, color: INK, letterSpacing: '0.02em'}}>PASSE EN</div>
        <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 124, lineHeight: 0.95, color: INK, letterSpacing: '-0.04em', whiteSpace: 'nowrap'}}>MODE FACILE</div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1110, display: 'flex', justifyContent: 'center', opacity: Math.min(1, cta * 1.4)}}>
        <div style={{padding: '30px 70px', ...box(INK, 10), boxShadow: `10px 10px 0 ${PURPLE}`, color: '#fff', fontFamily: FONT, fontWeight: 900, fontSize: 48, transform: `scale(${cta * (1 + 0.03 * Math.sin(f / 4) * prog(f, passe + 30, 8))})`}}>COMMENCER →</div>
      </div>
    </AbsoluteFill>
  );
};

export const ModeFacile: React.FC = () => {
  useFonts();
  const f = useCurrentFrame();
  const flash = (at: number, k = 1) => interpolate(f, [at - 1, at, at + 5], [0, k, 0], clamp);
  return (
    <AbsoluteFill style={{background: PAPER, fontFamily: FONT}}>
      <Sequence from={0} durationInFrames={T.hard}><Title /></Sequence>
      {f >= T.hard && f < T.over && <Hard />}
      <Sequence from={T.over} durationInFrames={T.easy - T.over}><GameOver /></Sequence>
      <Sequence from={T.easy} durationInFrames={T.reward - T.easy}><Easy /></Sequence>
      <Sequence from={T.reward} durationInFrames={T.end - T.reward}><Reward /></Sequence>
      <Sequence from={T.end}><End /></Sequence>
      <AbsoluteFill style={{background: '#fff', opacity: Math.max(flash(T.hard, 0.8), flash(T.easy, 0.9), flash(T.reward, 0.8), flash(T.end, 0.6)), pointerEvents: 'none'}} />
      <Audio src={staticFile('game/bed.wav')} />
      {[1, 2, 3, 4].map((k) => (
        <Sequence key={k} from={VO[k]}><Audio src={staticFile(`voice/game-${k}-n.mp3`)} /></Sequence>
      ))}
    </AbsoluteFill>
  );
};
