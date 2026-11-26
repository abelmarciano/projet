// Pub Growthity 9:16 au style « jeu en monde ouvert » (création originale : police, interface et logo maison).
// Intro aérienne + titre GROWTHITY tapé lettre à lettre → mission « faire ta première pub » → CASTING, STUDIO MONTAGE,
// AGENCE PUB (l'argent fond) → budget épuisé → « nouveau lieu débloqué : GROWTHITY » → + $ en vert → MISSION RÉUSSIE → fin.
import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Audio, OffthreadVideo, Sequence, continueRender, delayRender, interpolate, spring, staticFile, useCurrentFrame} from 'remotion';
import '@fontsource/inter/700.css';
import '@fontsource/inter/800.css';
import '@fontsource/inter/900.css';
import '@fontsource/inter/900-italic.css';
import {LogoMark} from '../components/UI';

export const G3 = {intro: 0, s1: 90, s2: 195, s3: 300, s4: 450, end: 600, total: 690};
const FONT = 'Inter, system-ui, sans-serif';
const GOLD = '#FFC83D', RED = '#FF3B3B', GREEN = '#3DDC84', ACC = '#7C5CFF';
const sp = (f: number, d = 12, m = 0.7) => spring({frame: f, fps: 30, config: {damping: d, mass: m, stiffness: 190}});
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const V = (n: number) => staticFile(`media/game3/v${n}.mp4`);
const useFonts = () => {
  const [h] = useState(() => delayRender('fonts'));
  useEffect(() => { Promise.all(['700 20px Inter', '800 20px Inter', '900 20px Inter', 'italic 900 20px Inter'].map((s) => document.fonts.load(s))).then(() => continueRender(h)); }, [h]);
};
// texte « jeu » : blanc, contour noir épais, ombre portée
const stroke = (w = 5, c = '#000') => ({WebkitTextStroke: `${w}px ${c}`, paintOrder: 'stroke fill', textShadow: `0 ${w + 2}px 0 rgba(0,0,0,.55)`}) as React.CSSProperties;

// argent : 5 000 $ → −1 500 → −800 → −2 000 → 700 $ → remontée chez Growthity
const SHOPS = [
  {at: G3.s1, name: 'CASTING', what: 'Un acteur', cost: 1500, line: '« Il me faut un acteur… »'},
  {at: G3.s2, name: 'STUDIO MONTAGE', what: 'Un monteur', cost: 800, line: '« …et quelqu’un pour monter. »'},
  {at: G3.s3, name: 'AGENCE PUB', what: 'Lancer la pub', cost: 2000, line: '« …et une agence pour la lancer. »'},
];
const GAINS = [24, 36, 46, 56, 64, 72, 80, 88, 96, 104];
const money = (g: number) => {
  let m = 5000;
  SHOPS.forEach((s) => { m -= s.cost * interpolate(g, [s.at + 40, s.at + 58], [0, 1], clamp); });
  GAINS.forEach((t, i) => { m += (i < 4 ? 400 : 900) * interpolate(g, [G3.s4 + t, G3.s4 + t + 8], [0, 1], clamp); });
  return Math.round(m);
};
const fmt = (n: number) => n.toLocaleString('fr-FR').replace(/ | /g, ' ');

const Hud: React.FC = () => {
  const g = useCurrentFrame();
  if (g < G3.s1 - 10 || g >= G3.end) return null;
  const m = money(g); const inP = sp(g - G3.s1 + 10, 14);
  const down = SHOPS.some((s) => g >= s.at + 40 && g < s.at + 62), up = g >= G3.s4 + 20 && g < G3.s4 + 120;
  const col = down ? RED : up ? GREEN : '#fff';
  const obj = g < G3.s4 + 100 ? 'Faire ta première pub vidéo' : 'Mission accomplie';
  return (
    <>
      <div style={{position: 'absolute', right: 56, top: 290, textAlign: 'right', fontFamily: FONT, transform: `translateX(${(1 - inP) * 300}px)`}}>
        <div style={{fontWeight: 900, fontSize: 74, color: col, letterSpacing: '0.02em', ...stroke(6), transform: `scale(${down || up ? 1.08 : 1})`}}>$ {fmt(m)}</div>
      </div>
      <div style={{position: 'absolute', left: 50, top: 300, fontFamily: FONT, background: 'rgba(0,0,0,.62)', borderLeft: `8px solid ${GOLD}`, padding: '14px 22px', borderRadius: 8, opacity: inP, transform: `translateX(${(1 - inP) * -300}px)`, maxWidth: 560}}>
        <div style={{fontWeight: 800, fontSize: 20, letterSpacing: '0.18em', color: GOLD}}>OBJECTIF</div>
        <div style={{fontWeight: 800, fontSize: 32, color: '#fff', marginTop: 2}}>{obj}</div>
      </div>
    </>
  );
};

// intro : vidéo aérienne + GROWTHITY tapé lettre à lettre
const Intro: React.FC = () => {
  const f = useCurrentFrame();
  const word = 'GROWTHITY'; const n = Math.min(word.length, Math.floor((f - 8) / 3));
  const sub = sp(f - 40, 12); const out = interpolate(f, [80, 90], [1, 0], clamp);
  return (
    <AbsoluteFill style={{opacity: out}}>
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,.35), rgba(0,0,0,0) 40%, rgba(0,0,0,0) 60%, rgba(0,0,0,.5))'}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 640, textAlign: 'center', fontFamily: FONT}}>
        <div style={{display: 'inline-flex'}}>
          {word.split('').map((c, i) => { const p = sp(f - 8 - i * 3, 9, 0.5); return (
            <span key={i} style={{fontWeight: 900, fontStyle: 'italic', fontSize: 150, letterSpacing: '-0.02em', color: '#fff', ...stroke(9), opacity: i < n ? 1 : 0, transform: `translateY(${(1 - p) * -60}px) scale(${0.6 + 0.4 * p}) rotate(-4deg)`, display: 'inline-block'}}>{c}</span>); })}
        </div>
        <div style={{marginTop: 10, height: 12, width: `${Math.min(1, n / word.length) * 820}px`, background: `linear-gradient(90deg, ${GOLD}, #FF8A3D)`, marginLeft: 'auto', marginRight: 'auto', borderRadius: 6, boxShadow: '0 4px 0 rgba(0,0,0,.5)'}} />
        <div style={{marginTop: 34, opacity: sub, transform: `scale(${0.8 + 0.2 * sub})`}}>
          <span style={{background: '#000', color: GOLD, fontWeight: 900, fontSize: 40, letterSpacing: '0.12em', padding: '12px 26px', borderRadius: 6}}>MISSION : FAIRE TA PREMIÈRE PUB</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// une boutique : enseigne + prix + perte d'argent + réplique
const Shop: React.FC<{i: number}> = ({i}) => {
  const f = useCurrentFrame(); const s = SHOPS[i];
  const card = sp(f - 10, 12); const minus = sp(f - 40, 9); const mOut = interpolate(f, [40, 75], [0, -160], clamp);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 50, right: 50, top: 450, fontFamily: FONT, transform: `translateX(${(1 - card) * -700}px)`}}>
        <div style={{display: 'inline-block', background: 'rgba(0,0,0,.72)', borderRadius: 10, padding: '16px 24px', borderBottom: `6px solid ${RED}`}}>
          <div style={{fontWeight: 900, fontSize: 52, color: '#fff', letterSpacing: '0.04em'}}>{s.name}</div>
          <div style={{fontWeight: 800, fontSize: 32, color: '#ddd', marginTop: 4}}>{s.what} : <span style={{color: RED}}>{fmt(s.cost)} $</span></div>
        </div>
      </div>
      {f >= 38 && <div style={{position: 'absolute', right: 70, top: 600, fontFamily: FONT, fontWeight: 900, fontSize: 84, color: RED, ...stroke(6), opacity: interpolate(f, [40, 50, 70, 85], [0, 1, 1, 0], clamp), transform: `scale(${0.6 + 0.4 * minus}) translateY(${mOut * 0.4}px)`}}>− {fmt(s.cost)} $</div>}
      <div style={{position: 'absolute', left: 60, right: 60, top: 1180, textAlign: 'center', fontFamily: FONT, opacity: interpolate(f, [12, 20, 95, 104], [0, 1, 1, 0], clamp)}}>
        <span style={{fontWeight: 800, fontSize: 46, color: '#fff', ...stroke(5)}}>{s.line}</span>
      </div>
    </AbsoluteFill>
  );
};

// après l'agence : budget épuisé + nouveau lieu débloqué
const Broke: React.FC = () => {
  const f = useCurrentFrame(); // depuis s3 + 105
  const a = sp(f, 10); const b = sp(f - 18, 11);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{background: `rgba(0,0,0,${0.45 * a})`}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 700, textAlign: 'center', fontFamily: FONT, transform: `scale(${1.4 - 0.4 * a})`, opacity: a}}>
        <div style={{fontWeight: 900, fontStyle: 'italic', fontSize: 104, color: RED, ...stroke(8)}}>BUDGET ÉPUISÉ</div>
        <div style={{fontWeight: 800, fontSize: 40, color: '#fff', marginTop: 6, ...stroke(4)}}>…et toujours pas de pub.</div>
      </div>
      <div style={{position: 'absolute', left: 60, right: 60, top: 1040, fontFamily: FONT, display: 'flex', alignItems: 'center', gap: 18, background: 'rgba(15,12,30,.92)', border: `3px solid ${ACC}`, borderRadius: 18, padding: '20px 24px', transform: `translateY(${(1 - b) * 200}px)`, opacity: b, boxShadow: `0 0 40px ${ACC}`}}>
        <div style={{width: 76, height: 76, borderRadius: 18, background: '#fff', display: 'grid', placeItems: 'center', flex: 'none'}}><LogoMark size={50} /></div>
        <div><div style={{fontWeight: 800, fontSize: 22, letterSpacing: '0.16em', color: GOLD}}>NOUVEAU LIEU DÉBLOQUÉ</div><div style={{fontWeight: 900, fontSize: 44, color: '#fff'}}>GROWTHITY</div></div>
      </div>
    </AbsoluteFill>
  );
};

// chez Growthity : + $ partout puis MISSION RÉUSSIE
const Win: React.FC = () => {
  const f = useCurrentFrame();
  const pos: [number, number][] = [[160, 900], [700, 820], [380, 1040], [820, 1100], [220, 1260], [620, 700], [480, 880], [140, 1120], [760, 980], [400, 760]];
  const done = sp(f - 108, 10);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 50, right: 50, top: 450, fontFamily: FONT, opacity: interpolate(f, [4, 12, 100, 108], [0, 1, 1, 0], clamp)}}>
        <div style={{display: 'inline-block', background: 'rgba(15,12,30,.8)', borderRadius: 10, padding: '16px 24px', borderBottom: `6px solid ${GREEN}`}}>
          <div style={{fontWeight: 900, fontSize: 52, color: '#fff', letterSpacing: '0.04em'}}>GROWTHITY</div>
          <div style={{fontWeight: 800, fontSize: 32, color: '#ddd', marginTop: 4}}>Acteur + montage + Meta Ads : <span style={{color: GREEN}}>1 phrase</span></div>
        </div>
      </div>
      {GAINS.map((t, i) => { const p = sp(f - t, 9); const o = interpolate(f, [t, t + 4, t + 26, t + 36], [0, 1, 1, 0], clamp); const [x, y] = pos[i]; return (
        <div key={i} style={{position: 'absolute', left: x, top: y - (f - t) * 3, fontFamily: FONT, fontWeight: 900, fontSize: 76, color: GREEN, ...stroke(6), opacity: o, transform: `scale(${0.5 + 0.5 * p})`}}>+ $</div>); })}
      {f >= 100 && <AbsoluteFill style={{background: `rgba(0,0,0,${0.35 * done})`}} />}
      {f >= 100 && <div style={{position: 'absolute', left: 0, right: 0, top: 720, textAlign: 'center', fontFamily: FONT, transform: `scale(${1.5 - 0.5 * done})`, opacity: done}}>
        <div style={{fontWeight: 900, fontStyle: 'italic', fontSize: 110, color: GOLD, ...stroke(8)}}>MISSION RÉUSSIE</div>
        <div style={{fontWeight: 800, fontSize: 44, color: '#fff', marginTop: 8, ...stroke(5)}}>Ta pub vidéo, en une phrase.</div>
      </div>}
    </AbsoluteFill>
  );
};

const End: React.FC = () => {
  const f = useCurrentFrame(); const a = sp(f, 12), b = sp(f - 10, 12), c = sp(f - 22, 11);
  return (
    <AbsoluteFill style={{background: 'radial-gradient(900px 900px at 50% 45%, #2A1F5C, #0B0918 70%)', fontFamily: FONT}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 520, display: 'flex', justifyContent: 'center', transform: `scale(${a})`}}><div style={{width: 160, height: 160, borderRadius: 40, background: '#fff', display: 'grid', placeItems: 'center'}}><LogoMark size={108} /></div></div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 740, textAlign: 'center', fontWeight: 900, fontStyle: 'italic', fontSize: 120, color: '#fff', ...stroke(6), opacity: b, transform: `translateY(${(1 - b) * 40}px)`}}>GROWTHITY</div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 900, textAlign: 'center', fontWeight: 800, fontSize: 46, color: '#D9D2FF', opacity: b}}>Ta pub vidéo, en une phrase.</div>
      <div style={{position: 'absolute', left: 540 - 270, top: 1020, width: 540, height: 120, borderRadius: 60, background: GOLD, display: 'grid', placeItems: 'center', fontWeight: 900, fontSize: 50, color: '#111', transform: `scale(${c})`, boxShadow: '0 8px 0 #B8860B'}}>COMMENCER</div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1170, textAlign: 'center', fontWeight: 700, fontSize: 34, color: '#B9B0E8', opacity: c}}>growthity.ai</div>
    </AbsoluteFill>
  );
};

export const GameAd: React.FC = () => {
  useFonts();
  const g = useCurrentFrame();
  const flash = Math.max(...[G3.s1, G3.s2, G3.s3, G3.s4, G3.end].map((t) => interpolate(g, [t - 1, t, t + 5], [0, 0.55, 0], clamp)));
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Sequence from={G3.intro} durationInFrames={G3.s1}><OffthreadVideo muted src={V(0)} style={{width: '100%', height: '100%', objectFit: 'cover'}} /></Sequence>
      <Sequence from={G3.s1} durationInFrames={G3.s2 - G3.s1}><OffthreadVideo muted src={V(1)} style={{width: '100%', height: '100%', objectFit: 'cover'}} /></Sequence>
      <Sequence from={G3.s2} durationInFrames={G3.s3 - G3.s2}><OffthreadVideo muted src={V(2)} style={{width: '100%', height: '100%', objectFit: 'cover'}} /></Sequence>
      <Sequence from={G3.s3} durationInFrames={G3.s4 - G3.s3}><OffthreadVideo muted src={V(3)} style={{width: '100%', height: '100%', objectFit: 'cover'}} /></Sequence>
      <Sequence from={G3.s4} durationInFrames={G3.end - G3.s4}><OffthreadVideo muted src={V(4)} style={{width: '100%', height: '100%', objectFit: 'cover'}} /></Sequence>
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,.35) 0%, rgba(0,0,0,0) 25%, rgba(0,0,0,0) 70%, rgba(0,0,0,.35))'}} />
      <Sequence from={G3.intro} durationInFrames={G3.s1}><Intro /></Sequence>
      {SHOPS.map((s, i) => <Sequence key={i} from={s.at} durationInFrames={105}><Shop i={i} /></Sequence>)}
      <Sequence from={G3.s3 + 105} durationInFrames={G3.s4 - G3.s3 - 105}><Broke /></Sequence>
      <Sequence from={G3.s4} durationInFrames={G3.end - G3.s4}><Win /></Sequence>
      <Hud />
      <Sequence from={G3.end}><End /></Sequence>
      <AbsoluteFill style={{background: '#fff', opacity: flash, pointerEvents: 'none'}} />
      <Audio src={staticFile('game3/bed.wav')} />
    </AbsoluteFill>
  );
};
