import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {LightBg, StudioBg} from '../components/Backgrounds';
import {Clip} from '../components/Media';
import {prog, pop, INOUT, mix} from '../components/anim';
import {C, DISPLAY, FONT, GRAD} from '../theme';
import {SceneProps, wordAt} from './timeline';
import {EndCard, Phone, Pill, R, SAFE_CX, gradText} from './kit';
import {Tick, Title} from './parts';

// Short 3 — e-commerce produits (gadgets, maison): Lou, porte-savon, bougie, sneakers

// « Trois secondes. C'est tout ce que vous avez pour arrêter le scroll. »
const FEED = [
  {c: 'linear-gradient(160deg,#FF9A8B,#FF6A88)', t: 'Story'},
  {c: 'linear-gradient(160deg,#5B8CFF,#6552E8)', t: 'Reel'},
  {c: 'linear-gradient(160deg,#2BD2A0,#1C8D73)', t: 'Post'},
  {c: 'linear-gradient(160deg,#FFC860,#FF8A3D)', t: 'Reel'},
];
export const S3Hook: React.FC<SceneProps> = ({lines, dur}) => {
  const f = useCurrentFrame();
  const l = lines[0];
  const stop = wordAt(l, 'arrêter', 60);
  // countdown ring 3 → 0 over the whole hook
  const t = interpolate(f, [0, dur - 6], [3, 0], {extrapolateRight: 'clamp'});
  const n = Math.max(1, Math.ceil(t));
  // feed scrolls fast, then snaps to a halt on "arrêter"
  const speed = interpolate(f, [stop - 8, stop + 6], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: INOUT});
  let y = 0;
  for (let k = 0; k < f; k++) y += 34 * interpolate(k, [stop - 8, stop + 6], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const T = 560;
  let yEnd = 0;
  for (let k = 0; k < stop + 8; k++) yEnd += 34 * interpolate(k, [stop - 8, stop + 6], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const kStop = Math.max(2, Math.round(yEnd / T));
  y = (y * kStop * T) / yEnd; // land exactly on a post
  const off = y % T;
  const halt = prog(f, stop + 4, 14);
  return (
    <StudioBg>
      <div style={{position: 'absolute', left: SAFE_CX - 230, top: 470, width: 460, height: 700, borderRadius: 40, overflow: 'hidden', border: '10px solid #0B0A0C', boxShadow: `0 0 0 ${halt * 8}px rgba(146,120,255,0.5), 0 60px 120px -40px rgba(0,0,0,0.9)`, background: '#16131C'}}>
        {[0, 1, 2].map((i) => {
          const k = Math.floor(y / T) + i;
          const it = FEED[k % FEED.length];
          // the post the feed stops on is a real product video
          const real = k === kStop;
          return (
            <div key={i} style={{position: 'absolute', left: 10, top: i * T - off + 10, width: 420, height: T - 20, borderRadius: 22, overflow: 'hidden', background: it.c, filter: `blur(${speed * 6}px)`}}>
              {real ? (
                <Clip src="vid-sneakers.mp4" width={420} height={T - 20} />
              ) : (
                <>
                  <div style={{position: 'absolute', left: 24, top: 24, width: 54, height: 54, borderRadius: 27, background: 'rgba(255,255,255,0.5)'}} />
                  <div style={{position: 'absolute', left: 92, top: 34, width: 180, height: 16, borderRadius: 8, background: 'rgba(255,255,255,0.6)'}} />
                  <div style={{position: 'absolute', left: 24, bottom: 30, fontFamily: FONT, fontWeight: 800, fontSize: 40, color: 'rgba(255,255,255,0.85)'}}>{it.t}</div>
                </>
              )}
            </div>
          );
        })}
      </div>
      <div style={{position: 'absolute', left: R.x, width: R.w, top: R.y + 6, display: 'flex', alignItems: 'center', gap: 28}}>
        <svg width="150" height="150" viewBox="0 0 100 100" style={{flexShrink: 0}}>
          <circle cx="50" cy="50" r="44" stroke="rgba(255,255,255,0.15)" strokeWidth="8" fill="none" />
          <circle cx="50" cy="50" r="44" stroke="url(#g3)" strokeWidth="8" fill="none" strokeLinecap="round" strokeDasharray={276} strokeDashoffset={276 * (1 - t / 3)} transform="rotate(-90 50 50)" />
          <defs>
            <linearGradient id="g3" x1="0" x2="1">
              <stop offset="0" stopColor={C.blue} />
              <stop offset="1" stopColor={C.pink} />
            </linearGradient>
          </defs>
          <text x="50" y="58" textAnchor="middle" fontFamily={DISPLAY} fontWeight={700} fontSize="40" fill="#fff">
            {n}
          </text>
          <text x="50" y="76" textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize="13" fill="rgba(255,255,255,0.7)" letterSpacing="2">
            SEC
          </text>
        </svg>
        <Title text="pour *arrêter* le scroll." start={4} step={3} size={72} align="left" />
      </div>
    </StudioBg>
  );
};

// « Un smartphone qui se déplie face caméra… » / « un porte-savon qui règle un vrai problème… une bougie qui crée l'ambiance. »
const DEMOS = [
  {src: 'ugc-lou-pliant-1.mp4', tag: 'Démo produit', k: 'smartphone'},
  {src: 'ugc-porte-savon.mp4', tag: 'Problème → solution', k: 'porte'},
  {src: 'ugc-bougie.mp4', tag: 'Ambiance', k: 'bougie'},
];
export const S3Demos: React.FC<SceneProps> = ({lines}) => {
  const f = useCurrentFrame();
  const at = [0, wordAt(lines[1], 'porte', 10), wordAt(lines[1], 'bougie', 80)];
  // carousel: the newest demo is big in the centre, earlier ones slide left, shrink and dim
  const W = 440;
  return (
    <LightBg>
      {DEMOS.map((d, i) => {
        if (f < at[i] - 2) return null;
        const p = prog(f, at[i], 18, INOUT);
        const k = DEMOS.reduce((acc, _, j) => acc + (j > i ? prog(f, at[j] - 4, 18, INOUT) : 0), 0);
        const cx = SAFE_CX + (1 - p) * 520 - Math.min(k, 1) * 230 - Math.max(0, k - 1) * 140;
        const sc = 1 - Math.min(k, 1) * 0.28;
        return (
          <div key={d.src} style={{position: 'absolute', left: cx - W / 2, top: R.y + 20, transform: `scale(${sc}) rotate(${-7 * Math.min(k, 1) + (1 - p) * 10}deg)`, transformOrigin: 'center center', opacity: p * (1 - Math.max(0, k - 1)) * (1 - Math.min(k, 1) * 0.25), zIndex: 10 + i}}>
            <Phone src={d.src} w={W} from={at[i]}>
              <div style={{position: 'absolute', left: 14, bottom: 14}}>
                <Pill size={22}>{d.tag}</Pill>
              </div>
            </Phone>
          </div>
        );
      })}
    </LightBg>
  );
};

// « Chaque produit a sa démo, son actrice, son accroche. »
export const S3Grid: React.FC<SceneProps> = ({lines}) => {
  const f = useCurrentFrame();
  const l = lines[0];
  const keys = [wordAt(l, 'démo', 20), wordAt(l, 'actrice', 40), wordAt(l, 'accroche', 60)];
  const p = pop(f, 0, 14);
  const pan = interpolate(f, [0, 150], [1.12, 1], {extrapolateRight: 'clamp'});
  return (
    <StudioBg>
      <div style={{position: 'absolute', left: SAFE_CX - 300, top: R.y + 10, width: 600, height: 540, borderRadius: 30, overflow: 'hidden', transform: `scale(${0.8 + 0.2 * p})`, opacity: Math.min(1, p * 2), boxShadow: '0 50px 100px -40px rgba(0,0,0,0.9)'}}>
        <div style={{transform: `scale(${pan})`, width: 600, height: 540}}>
          <Clip src="vid-sneakers.mp4" width={600} height={540} startFrom={90} />
        </div>
        <div style={{position: 'absolute', left: 16, top: 16}}>
          <Pill tone="dark" size={18}>Film produit · sneakers</Pill>
        </div>
      </div>
      <div style={{position: 'absolute', left: R.x, width: R.w, top: 850, display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 16}}>
        {['Sa démo', 'Son actrice', 'Son accroche'].map((t, i) => (
          <Tick key={t} at={keys[i]} size={32}>
            {t}
          </Tick>
        ))}
      </div>
      <div style={{position: 'absolute', left: R.x, width: R.w, top: 990, textAlign: 'center', fontFamily: FONT, fontWeight: 700, fontSize: 30, color: 'rgba(255,255,255,0.75)', opacity: prog(f, keys[2] + 8, 12)}}>
        Générées par <span style={{backgroundImage: GRAD, WebkitBackgroundClip: 'text', color: 'transparent'}}>Growthity</span>
      </div>
    </StudioBg>
  );
};

export const S3End: React.FC<SceneProps> = ({dur}) => (
  <EndCard
    dur={dur}
    tagline={
      <>
        Vos produits,
        <br />
        <span style={gradText()}>en action.</span>
      </>
    }
  />
);
