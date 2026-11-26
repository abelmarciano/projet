// Pub Growthity 9:16, v5 : ouverture en flash-forward chez Growthity → retour en arrière → mission dans la rue → … → bilan « jeu en monde ouvert » photoréaliste (création originale : titre, interface, typo et personnage maison).
// Écran-titre en vignettes au coucher du soleil → survol de la ville « Mission : faire ta première pub » → le perso court au
// CASTING, au STUDIO MONTAGE, à l'AGENCE PUB (l'argent fond) → budget à sec → nouveau lieu débloqué GROWTHITY → + $ → mission réussie.
// Voix off de briefing (Anthony), sous-titres de jeu.
import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, continueRender, delayRender, interpolate, spring, staticFile, useCurrentFrame} from 'remotion';
import '@fontsource/inter/700.css';
import '@fontsource/inter/800.css';
import '@fontsource/inter/900.css';
import '@fontsource/inter/900-italic.css';
import {LogoMark} from '../components/UI';
import {BRAND_PATHS} from '../components/brands';
import WJ from './words5.json';

type Word = {w: string; s: number; e: number};
const W = WJ as unknown as Record<string, Word[]>;
export const G7 = {intro: 0, rewind: 72, aerial: 96, s1: 96, s1i: 246, s2: 375, s3: 525, s3i: 600, s4: 750, s5: 855, s5i: 945, end: 1170, total: 1400};
const G6 = G7; const G5 = G7;
const G4 = G5;
const VOAT: [string, number][] = [['g7-h', 6], ['g7-r', 72], ['g5-0', 100], ['g5-1', 178], ['g5-2', 380], ['g5-3', 530], ['g5-4', 755], ['g6-5', 860], ['g6-6', 1176]];
const FONT = 'Inter, system-ui, sans-serif';
const GOLD = '#FFC83D', RED = '#FF3B3B', GREEN = '#3DDC84', ACC = '#7C5CFF';
const SUNSET = 'linear-gradient(180deg, #FFB547 0%, #FF6A88 48%, #A646FF 100%)';
const sp = (f: number, d = 12, m = 0.7) => spring({frame: f, fps: 30, config: {damping: d, mass: m, stiffness: 190}});
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const M = (p: string) => staticFile(`media/game4/${p}`);
const useFonts = () => {
  const [h] = useState(() => delayRender('fonts'));
  useEffect(() => { Promise.all(['700 20px Inter', '800 20px Inter', '900 20px Inter', 'italic 900 20px Inter'].map((s) => document.fonts.load(s))).then(() => continueRender(h)); }, [h]);
};
const stroke = (w = 5, c = '#000') => ({WebkitTextStroke: `${w}px ${c}`, paintOrder: 'stroke fill', textShadow: `0 ${w + 2}px 0 rgba(0,0,0,.6)`}) as React.CSSProperties;
const fmt = (n: number) => n.toLocaleString('fr-FR').replace(/ | /g, ' ');
const vcue = (k: string, start: string, d = 0) => { const at = VOAT.find((v) => v[0] === k)![1]; const w = W[k].find((x) => x.w.toLowerCase().startsWith(start)); return at + Math.round((w ? w.s : d) * 30); };

const SHOPS = [
  {at: G5.s1, dur: G5.s2 - G5.s1, name: 'CASTING', what: 'Un acteur', cost: 1500, k: 'g5-1', w: '500', meta: false},
  {at: G5.s2, dur: G5.s3 - G5.s2, name: 'STUDIO MONTAGE', what: 'Un monteur', cost: 800, k: 'g5-2', w: '800', meta: false},
  {at: G5.s3, dur: G5.s4 - G5.s3, name: 'META ADS', what: 'Pub ratée', cost: 500, k: 'g5-3', w: '500', meta: true},
  {at: G5.s4, dur: G5.s5 - G5.s4, name: 'AGENCE PUB', what: 'Par mois', cost: 2000, k: 'g5-4', w: '2', meta: false},
];
const GAINS = [30, 44, 56, 68, 80, 92, 104, 116, 128, 140];
const money = (g: number) => {
  let m = 5000;
  SHOPS.forEach((s) => { const t = vcue(s.k, s.w, 2); m -= s.cost * interpolate(g, [t, t + 16], [0, 1], clamp); });
  GAINS.forEach((t, i) => { m += (i < 4 ? 400 : 900) * interpolate(g, [vcue('g6-5', 'performances', 7.4) + t, vcue('g6-5', 'performances', 7.4) + t + 8], [0, 1], clamp); });
  return Math.round(m);
};

// écran-titre : affiche de jeu originale (vignettes illustrées) + GROWTHITY au centre + chargement
const TitleCard: React.FC = () => {
  const f = useCurrentFrame();
  const word = 'GROWTHITY'; const n = Math.min(word.length, Math.floor(f - 3));
  const out = interpolate(f, [67, 75], [1, 0], clamp); const load = interpolate(f, [8, 66], [0, 1], clamp);
  const z = 1.08 - 0.08 * sp(f, 20, 1);
  return (
    <AbsoluteFill style={{background: '#120720', opacity: out}}>
      <Img src={M('poster.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${z})`}} />
      <AbsoluteFill style={{background: 'radial-gradient(520px 420px at 50% 50%, rgba(18,7,32,.75), rgba(18,7,32,0) 80%)'}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 820, textAlign: 'center', fontFamily: FONT}}>
        <div style={{display: 'inline-flex'}}>
          {word.split('').map((c, i) => { const p = sp(f - 3 - i, 9, 0.5); return (
            <span key={i} style={{fontWeight: 900, fontStyle: 'italic', fontSize: 134, letterSpacing: '-0.03em', backgroundImage: SUNSET, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', WebkitTextStroke: '7px #120720', paintOrder: 'stroke fill', filter: 'drop-shadow(0 9px 0 #120720)', opacity: i < n ? 1 : 0, transform: `translateY(${(1 - p) * -70}px) scale(${0.6 + 0.4 * p}) rotate(-5deg)`, display: 'inline-block'}}>{c}</span>); })}
        </div>
      </div>
      <div style={{position: 'absolute', left: 140, right: 140, top: 1040, fontFamily: FONT}}>
        <div style={{height: 10, background: 'rgba(0,0,0,.5)', borderRadius: 5, overflow: 'hidden', border: '2px solid #120720'}}><div style={{width: `${load * 100}%`, height: '100%', backgroundImage: SUNSET}} /></div>
        <div style={{marginTop: 14, textAlign: 'center', fontWeight: 800, fontSize: 28, color: '#fff', ...stroke(4, '#120720'), opacity: sp(f - 18, 12)}}>ASTUCE : une phrase suffit pour créer ta pub vidéo.</div>
      </div>
    </AbsoluteFill>
  );
};

// ouverture : flash-forward chez Growthity
const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const b = sp(f - 4, 11);
  const panels: [string, number, number][] = [['ACTEUR', 60, 700], ['PRODUIT', 600, 720], ['META ADS', 80, 1000], ['PERFORMANCES', 620, 1020]];
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 60, right: 60, top: 330, fontFamily: FONT, display: 'flex', alignItems: 'center', gap: 18, background: 'rgba(15,12,30,.92)', border: `3px solid ${ACC}`, borderRadius: 18, padding: '20px 24px', transform: `translateY(${(1 - b) * -200}px) scale(${0.9 + 0.1 * b})`, opacity: b, boxShadow: `0 0 50px ${ACC}`}}>
        <div style={{width: 76, height: 76, borderRadius: 18, background: '#fff', display: 'grid', placeItems: 'center', flex: 'none'}}><LogoMark size={50} /></div>
        <div><div style={{fontWeight: 800, fontSize: 22, letterSpacing: '0.16em', color: GOLD}}>NOUVEAU LIEU DÉBLOQUÉ</div><div style={{fontWeight: 900, fontSize: 48, color: '#fff'}}>GROWTHITY</div></div>
      </div>
      {panels.map(([t, x, y], i) => { const p = sp(f - 18 - i * 6, 10); return (
        <div key={t} style={{position: 'absolute', left: x, top: y, width: 400, fontFamily: FONT, opacity: p, transform: `perspective(900px) rotateY(${i % 2 ? 8 : -8}deg) scale(${0.6 + 0.4 * p})`, background: 'rgba(20,60,90,.35)', border: '2px solid #5CF2FF', borderRadius: 16, padding: '14px 18px', boxShadow: '0 0 30px #5CF2FF88', fontWeight: 900, fontSize: 32, color: '#fff', textShadow: '0 0 10px #5CF2FF'}}>{t} <span style={{color: GREEN}}>✓</span></div>); })}
      {[0, 1, 2, 3, 4].map((i) => { const t = 30 + i * 7; const p = sp(f - t, 9); const o = interpolate(f, [t, t + 4, t + 20, t + 30], [0, 1, 1, 0], clamp); return <div key={i} style={{position: 'absolute', left: [180, 700, 420, 820, 260][i], top: [900, 840, 1150, 1180, 1250][i] - (f - t) * 3, fontFamily: FONT, fontWeight: 900, fontSize: 84, color: GREEN, ...stroke(6), opacity: o, transform: `scale(${0.5 + 0.5 * p})`}}>+ $</div>; })}
    </AbsoluteFill>
  );
};
// retour en arrière (effet rembobinage)
const Rewind: React.FC = () => {
  const f = useCurrentFrame(); const p = sp(f, 10);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{background: 'rgba(10,6,20,.55)', backdropFilter: 'grayscale(1) contrast(1.3)'}} />
      <AbsoluteFill style={{backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,.08) 0 2px, transparent 2px 5px)', transform: `translateY(${(f * 37) % 40}px)`}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 820, textAlign: 'center', fontFamily: FONT, opacity: p, transform: `scale(${0.8 + 0.2 * p})`}}>
        <div style={{fontWeight: 900, fontSize: 120, color: '#fff', ...stroke(7)}}>⏪</div>
        <div style={{fontWeight: 900, fontStyle: 'italic', fontSize: 76, color: '#fff', ...stroke(6)}}>3 HEURES PLUS TÔT</div>
      </div>
    </AbsoluteFill>
  );
};

const Hud: React.FC = () => {
  const g = useCurrentFrame();
  if (g < G7.s1 + 4 || g >= G7.end) return null;
  const m = money(g); const inP = sp(g - G4.aerial - 10, 14);
  const down = SHOPS.some((s) => { const t = vcue(s.k, s.w, 2); return g >= t && g < t + 22; });
  const up = g >= vcue('g6-5', 'performances', 7.4) + 28 && g < vcue('g6-5', 'performances', 7.4) + 150;
  const col = down ? RED : up ? GREEN : '#fff';
  const obj = g < vcue('g6-5', 'mission', 8.8) ? 'Faire ta première pub vidéo' : 'Mission accomplie';
  const hp = Math.max(0.06, m / 5000);
  return (
    <>
      <div style={{position: 'absolute', right: 56, top: 290, textAlign: 'right', fontFamily: FONT, transform: `translateX(${(1 - inP) * 300}px)`}}>
        <div style={{fontWeight: 900, fontSize: 76, color: col, ...stroke(6), transform: `scale(${down || up ? 1.08 : 1})`, transformOrigin: 'right'}}>$ {fmt(m)}</div>
        <div style={{marginTop: 8, marginLeft: 'auto', width: 300, height: 16, background: 'rgba(0,0,0,.55)', border: '3px solid #000', borderRadius: 4}}><div style={{width: `${Math.min(1, hp) * 100}%`, height: '100%', background: hp < 0.3 ? RED : GREEN}} /></div>
      </div>
      <div style={{position: 'absolute', left: 50, top: 300, fontFamily: FONT, background: 'rgba(0,0,0,.62)', borderLeft: `8px solid ${GOLD}`, padding: '14px 22px', borderRadius: 8, opacity: inP, transform: `translateX(${(1 - inP) * -300}px)`, maxWidth: 520}}>
        <div style={{fontWeight: 800, fontSize: 20, letterSpacing: '0.18em', color: GOLD}}>OBJECTIF</div>
        <div style={{fontWeight: 800, fontSize: 32, color: '#fff', marginTop: 2}}>{obj}</div>
      </div>
    </>
  );
};

// sous-titres de jeu (voix off)
const Subs: React.FC = () => {
  const g = useCurrentFrame();
  let cur: [string, number] | null = null;
  for (const v of VOAT) if (g >= v[1] - 2) cur = v;
  if (!cur || g >= G4.end) return null;
  const words = W[cur[0]]; const t = (g - cur[1]) / 30;
  if (t > words[words.length - 1].e + 0.4) return null;
  const i = Math.max(0, words.findIndex((w) => t < w.e + 0.15));
  const grp = words.slice(Math.floor(i / 5) * 5, Math.floor(i / 5) * 5 + 5);
  return (
    <div style={{position: 'absolute', left: 70, right: 70, top: 1190, textAlign: 'center', fontFamily: FONT, fontWeight: 800, fontSize: 44, lineHeight: 1.25, color: '#fff', ...stroke(5)}}>
      {grp.map((w, j) => <span key={j} style={{color: t >= w.s - 0.02 && t <= w.e + 0.08 ? GOLD : '#fff'}}>{w.w} </span>)}
    </div>
  );
};

const Mission: React.FC = () => {
  const f = useCurrentFrame(); const p = sp(f - 4, 12); const out = interpolate(f, [70, 82], [1, 0], clamp);
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 760, textAlign: 'center', fontFamily: FONT, opacity: out, transform: `scale(${0.8 + 0.2 * p})`}}>
      <div style={{display: 'inline-block', background: '#000', color: GOLD, fontWeight: 900, fontSize: 30, letterSpacing: '0.2em', padding: '8px 20px', borderRadius: 4}}>NOUVELLE MISSION</div>
      <div style={{marginTop: 14, fontWeight: 900, fontStyle: 'italic', fontSize: 86, lineHeight: 1, color: '#fff', ...stroke(7)}}>Ta première<br />pub vidéo</div>
    </div>
  );
};

const Shop: React.FC<{i: number}> = ({i}) => {
  const f = useCurrentFrame(); const s = SHOPS[i];
  const card = sp(f - (i === 0 ? 84 : 8), 12); const t = vcue(s.k, s.w, 2) - s.at; const minus = sp(f - t, 9);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 50, top: 450, fontFamily: FONT, transform: `translateX(${(1 - card) * -700}px)`}}>
        <div style={{display: 'inline-block', background: 'rgba(0,0,0,.72)', borderRadius: 10, padding: '16px 24px', borderBottom: `6px solid ${RED}`}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 14, fontWeight: 900, fontSize: 52, color: '#fff', letterSpacing: '0.04em'}}>{s.meta && <svg width="64" height="64" viewBox="0 0 24 24"><path d={BRAND_PATHS.meta} fill="#0866FF" /></svg>}{s.name}</div>
          <div style={{fontWeight: 800, fontSize: 32, color: '#ddd', marginTop: 4}}>{s.what} : <span style={{color: RED}}>{fmt(s.cost)} $</span></div>
        </div>
      </div>
      {s.meta && f > 70 && f < 150 && ['Ciblage ?', 'Pixel ?!', 'Budget ?', 'Erreur'].map((q, j) => { const p = sp(f - 70 - j * 10, 9); return <div key={q} style={{position: 'absolute', left: [80, 640, 120, 600][j], top: [760, 820, 1000, 1060][j], fontFamily: FONT, fontWeight: 900, fontSize: 52, color: j === 3 ? RED : '#fff', ...stroke(5), transform: `scale(${p}) rotate(${(j % 2 ? 6 : -6)}deg)`}}>{q}</div>; })}
      {f >= t - 2 && <div style={{position: 'absolute', right: 70, top: 600, fontFamily: FONT, fontWeight: 900, fontSize: 88, color: RED, ...stroke(6), opacity: interpolate(f, [t, t + 8, t + 34, t + 46], [0, 1, 1, 0], clamp), transform: `scale(${0.6 + 0.4 * minus}) translateY(${-(f - t) * 1.5}px)`}}>− {fmt(s.cost)} $</div>}
    </AbsoluteFill>
  );
};

const Broke: React.FC = () => {
  const f = useCurrentFrame(); const a = sp(f, 10);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{background: `rgba(0,0,0,${0.4 * a})`}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 760, textAlign: 'center', fontFamily: FONT, transform: `scale(${1.4 - 0.4 * a})`, opacity: a}}>
        <div style={{fontWeight: 900, fontStyle: 'italic', fontSize: 108, color: RED, ...stroke(8)}}>BUDGET À SEC</div>
      </div>
    </AbsoluteFill>
  );
};

const CYAN = '#5CF2FF';
const Holo: React.FC<{p: number; x: number; y: number; w: number; children: React.ReactNode; title: string}> = ({p, x, y, w, children, title}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, fontFamily: FONT, opacity: p * 0.97, transform: `perspective(900px) rotateY(-8deg) scale(${0.7 + 0.3 * p})`, transformOrigin: 'left center', background: 'rgba(20,60,90,.35)', border: `2px solid ${CYAN}`, borderRadius: 18, padding: '14px 16px', boxShadow: `0 0 30px ${CYAN}88, inset 0 0 30px ${CYAN}33`, backdropFilter: 'blur(2px)'}}>
    <div style={{fontWeight: 800, fontSize: 20, letterSpacing: '0.18em', color: CYAN, textShadow: `0 0 8px ${CYAN}`}}>{title}</div>
    <div style={{marginTop: 10}}>{children}</div>
    <AbsoluteFill style={{borderRadius: 18, backgroundImage: 'repeating-linear-gradient(0deg, rgba(92,242,255,.08) 0 2px, transparent 2px 6px)', pointerEvents: 'none'}} />
  </div>
);
const FACES = ['actors-real/r027.jpg', 'actors-real/r031.jpg', 'actors-real/r046.jpg', 'actors-real/r101.jpg', 'actors-real/r057.jpg', 'actors-real/r021.jpg'];
const Win: React.FC = () => {
  const f = useCurrentFrame(); const g = f + G6.s5;
  const unlock = sp(f - 2, 11); const uOut = interpolate(f, [80, 90], [1, 0], clamp);
  const c = (w: string, d: number) => Math.max(vcue('g6-5', w, d), G6.s5i + 4) - G6.s5;
  const tA = c('acteur', 2.8), tP = c('produit', 3.6), tC = c('chat', 4.8), tM = c('meta', 6.1), tF = c('performances', 7.4), tW = vcue('g6-5', 'mission', 8.8) - G6.s5;
  const hide = interpolate(f, [tW - 6, tW + 4], [1, 0], clamp);
  const pA = sp(f - tA, 11) * hide, pP = sp(f - tP, 11) * hide, pC = sp(f - tC, 11) * hide, pF = sp(f - tF, 11) * hide;
  const sel = f >= tA + 14; const live = f >= tM + 8;
  const O = tF;
  const pos: [number, number][] = [[160, 1000], [700, 920], [380, 1100], [820, 1060], [220, 1160], [620, 860], [480, 980], [140, 900], [760, 1000], [400, 880]];
  const done = sp(f - tW, 10);
  const msg = 'Une pub pour mon jogging'; const nm = Math.max(0, Math.min(msg.length, Math.floor((f - tC - 4) * 1.6)));
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 60, right: 60, top: 470, fontFamily: FONT, display: 'flex', alignItems: 'center', gap: 18, background: 'rgba(15,12,30,.92)', border: `3px solid ${ACC}`, borderRadius: 18, padding: '20px 24px', transform: `translateY(${(1 - unlock) * -200}px)`, opacity: unlock * uOut, boxShadow: `0 0 40px ${ACC}`}}>
        <div style={{width: 76, height: 76, borderRadius: 18, background: '#fff', display: 'grid', placeItems: 'center', flex: 'none'}}><LogoMark size={50} /></div>
        <div><div style={{fontWeight: 800, fontSize: 22, letterSpacing: '0.16em', color: GOLD}}>NOUVEAU LIEU DÉBLOQUÉ</div><div style={{fontWeight: 900, fontSize: 44, color: '#fff'}}>GROWTHITY</div></div>
      </div>
      <Holo p={pA} x={50} y={460} w={470} title="CHOISIS TON ACTEUR">
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8}}>
          {FACES.map((im, i) => <div key={im} style={{position: 'relative', height: 120, borderRadius: 10, overflow: 'hidden', border: sel && i === 1 ? `4px solid ${CYAN}` : '2px solid rgba(92,242,255,.35)', opacity: sel && i !== 1 ? 0.45 : 0.95, transform: `scale(${sel && i === 1 ? 1.08 : 1})`}}><Img src={staticFile(`media/${im}`)} style={{width: '100%', height: '100%', objectFit: 'cover', filter: 'saturate(.7) hue-rotate(-10deg)'}} /></div>)}
        </div>
      </Holo>
      <Holo p={pP} x={560} y={460} w={470} title="TON PRODUIT">
        <div style={{display: 'flex', alignItems: 'center', gap: 12}}><Img src={staticFile('media/brume/p1.jpg')} style={{width: 140, height: 140, borderRadius: 12, objectFit: 'cover', border: `3px solid ${CYAN}`}} /><div style={{fontWeight: 800, fontSize: 28, color: '#fff'}}>Jogging<br />Nuage</div></div>
      </Holo>
      <Holo p={pC} x={50} y={760} w={560} title="CHAT GROWTHITY">
        <div style={{background: 'rgba(255,255,255,.12)', borderRadius: 12, padding: '10px 14px', fontWeight: 700, fontSize: 30, color: '#fff', minHeight: 46}}>{msg.slice(0, nm)}<span style={{opacity: Math.floor(f / 10) % 2 ? 1 : 0.2}}>|</span></div>
        <div style={{marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, borderRadius: 12, padding: '12px 0', fontWeight: 900, fontSize: 28, color: '#fff', background: live ? '#16A34A' : '#0866FF', transform: `scale(${interpolate(f, [tM, tM + 4, tM + 10], [1, 0.92, 1], clamp)})`}}>
          <svg width="34" height="34" viewBox="0 0 24 24"><path d={BRAND_PATHS.meta} fill="#fff" /></svg>{live ? 'En ligne sur Meta Ads ✓' : 'Publier sur Meta Ads'}
        </div>
      </Holo>
      <Holo p={pF} x={590} y={760} w={440} title="PERFORMANCES">
        <div style={{display: 'flex', alignItems: 'flex-end', gap: 8, height: 120}}>{[0.3, 0.38, 0.5, 0.56, 0.7, 0.82, 0.95].map((h, i) => <div key={i} style={{flex: 1, height: `${h * 100 * sp(f - tF - 4 - i * 3, 12)}%`, background: i === 6 ? GREEN : CYAN, borderRadius: 4, boxShadow: `0 0 10px ${CYAN}`}} />)}</div>
        <div style={{display: 'flex', justifyContent: 'space-between', marginTop: 10, fontWeight: 800, fontSize: 22, color: '#fff'}}><span>Clics <span style={{color: GREEN}}>▲</span></span><span>Leads <span style={{color: GREEN}}>▲</span></span><span>Ventes <span style={{color: GREEN}}>▲</span></span></div>
      </Holo>
      {GAINS.map((t0, i) => { const t = t0 + O; const p = sp(f - t, 9); const o = interpolate(f, [t, t + 4, t + 26, t + 36], [0, 1, 1, 0], clamp); const [x, y] = pos[i]; return (
        <div key={i} style={{position: 'absolute', left: x, top: y - (f - t) * 3, fontFamily: FONT, fontWeight: 900, fontSize: 80, color: GREEN, ...stroke(6), opacity: o, transform: `scale(${0.5 + 0.5 * p})`}}>+ $</div>); })}
      {f >= tW - 6 && <AbsoluteFill style={{background: `rgba(0,0,0,${0.35 * done})`}} />}
      {f >= tW - 6 && <div style={{position: 'absolute', left: 0, right: 0, top: 760, textAlign: 'center', fontFamily: FONT, transform: `scale(${1.5 - 0.5 * done})`, opacity: done}}>
        <div style={{fontWeight: 900, fontStyle: 'italic', fontSize: 112, backgroundImage: SUNSET, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', WebkitTextStroke: '6px #120720', paintOrder: 'stroke fill', filter: 'drop-shadow(0 8px 0 #120720)'}}>MISSION RÉUSSIE</div>
      </div>}
    </AbsoluteFill>
  );
};

const End: React.FC = () => {
  const f = useCurrentFrame(); const t0 = G6.end;
  const rows: [string, number][] = [['Acteur', 1500], ['Monteur', 800], ['Meta Ads raté', 500], ['Agence', 2000]];
  const tot = sp(f - (vcue('g6-6', '4', 0.7) - t0), 10); const price = sp(f - (vcue('g6-6', 'growthity', 2.4) - t0), 11); const btn = sp(f - (vcue('g6-6', 'ta', 5.2) - t0), 11);
  const saved = Math.round(4800 * interpolate(f, [vcue('g6-6', '4', 0.7) - t0, vcue('g6-6', '4', 0.7) - t0 + 24], [0, 1], clamp));
  return (
    <AbsoluteFill style={{background: 'radial-gradient(900px 900px at 50% 40%, #3A1760, #120720 72%)', fontFamily: FONT}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 300, textAlign: 'center'}}><span style={{background: '#000', color: GOLD, fontWeight: 900, fontSize: 32, letterSpacing: '0.2em', padding: '10px 24px', borderRadius: 6}}>BILAN DE MISSION</span></div>
      <div style={{position: 'absolute', left: 120, right: 120, top: 400}}>
        {rows.map(([k, v], i) => { const p = sp(f - 4 - i * 6, 11); return (
          <div key={k} style={{display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '2px dashed rgba(255,255,255,.2)', fontWeight: 800, fontSize: 40, color: '#fff', opacity: p, transform: `translateX(${(1 - p) * -80}px)`}}><span>{k}</span><span style={{color: RED, textDecoration: f > 30 ? 'line-through' : 'none'}}>{fmt(v)} $</span></div>); })}
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 690, textAlign: 'center', opacity: tot, transform: `scale(${0.7 + 0.3 * tot})`}}>
        <div style={{fontWeight: 800, fontSize: 36, color: '#E9DCFF'}}>Économisé</div>
        <div style={{fontWeight: 900, fontStyle: 'italic', fontSize: 130, color: GREEN, ...stroke(7)}}>{fmt(saved)} $</div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 930, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 18, opacity: price, transform: `scale(${0.8 + 0.2 * price})`}}>
        <div style={{width: 84, height: 84, borderRadius: 22, background: '#fff', display: 'grid', placeItems: 'center'}}><LogoMark size={56} /></div>
        <div style={{textAlign: 'left'}}><div style={{fontWeight: 900, fontStyle: 'italic', fontSize: 64, backgroundImage: SUNSET, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', WebkitTextStroke: '4px #120720', paintOrder: 'stroke fill'}}>GROWTHITY</div><div style={{fontWeight: 800, fontSize: 38, color: '#fff'}}>à partir de <span style={{color: GOLD}}>19,99 €</span></div></div>
      </div>
      <div style={{position: 'absolute', left: 540 - 270, top: 1090, width: 540, height: 116, borderRadius: 58, background: GOLD, display: 'grid', placeItems: 'center', fontWeight: 900, fontSize: 48, color: '#111', transform: `scale(${btn})`, boxShadow: '0 8px 0 #B8860B'}}>COMMENCER</div>
    </AbsoluteFill>
  );
};

const Clip: React.FC<{n: number | string; rate?: number}> = ({n, rate = 1}) => <OffthreadVideo muted playbackRate={rate} src={M(`v${n}.mp4`)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />;

export const GameAd5: React.FC = () => {
  useFonts();
  const g = useCurrentFrame();
  const flash = Math.max(...[G7.rewind, G7.s1, G6.s2, G6.s3, G6.s4, G6.s5, G6.end].map((t) => interpolate(g, [t - 1, t, t + 5], [0, 0.55, 0], clamp)));
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Sequence from={0} durationInFrames={G7.s1}><OffthreadVideo muted startFrom={60} playbackRate={1.1} src={M('vi5.mp4')} style={{width: '100%', height: '100%', objectFit: 'cover'}} /></Sequence>
      <Sequence from={G5.s1} durationInFrames={G5.s1i - G5.s1}><Clip n={1} /></Sequence>
      <Sequence from={G5.s1i} durationInFrames={G5.s2 - G5.s1i}><Clip n="i1" /></Sequence>
      <Sequence from={G5.s2} durationInFrames={G5.s3 - G5.s2}><Clip n={2} /></Sequence>
      <Sequence from={G5.s3} durationInFrames={G5.s3i - G5.s3}><Clip n="s3m" /></Sequence>
      <Sequence from={G5.s3i} durationInFrames={G5.s4 - G5.s3i}><Clip n="i3" /></Sequence>
      <Sequence from={G5.s4} durationInFrames={G5.s5 - G5.s4}><Clip n={3} /></Sequence>
      <Sequence from={G5.s5} durationInFrames={G5.s5i - G5.s5}><Clip n={4} /></Sequence>
      <Sequence from={G6.s5i} durationInFrames={198}><Clip n="i5" rate={0.75} /></Sequence>
      <Sequence from={G6.s5i + 198} durationInFrames={G6.end - G6.s5i - 198}><AbsoluteFill><Img src={M('i5.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover', transform: 'scale(1.05)'}} /></AbsoluteFill></Sequence>
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,.35) 0%, rgba(0,0,0,0) 25%, rgba(0,0,0,0) 62%, rgba(0,0,0,.45))'}} />
      <Sequence from={0} durationInFrames={G7.rewind}><Hook /></Sequence>
      <Sequence from={G7.rewind} durationInFrames={G7.s1 - G7.rewind}><Rewind /></Sequence>
      <Sequence from={G7.s1} durationInFrames={84}><Mission /></Sequence>
      {SHOPS.map((s, i) => <Sequence key={i} from={s.at} durationInFrames={s.dur}><Shop i={i} /></Sequence>)}
      <Sequence from={vcue('g5-4', 'budget', 2)} durationInFrames={G5.s5 - vcue('g5-4', 'budget', 2)}><Broke /></Sequence>
      <Sequence from={G5.s5} durationInFrames={G5.end - G5.s5}><Win /></Sequence>
      <Hud />
      <Sequence from={G4.end}><End /></Sequence>
      <Subs />
      <AbsoluteFill style={{background: '#fff', opacity: flash, pointerEvents: 'none'}} />
      <Audio src={staticFile('game4/bed7.wav')} />
      {VOAT.map(([k, at]) => <Sequence key={k} from={at}><Audio src={staticFile(`voice/${k}-n.mp3`)} /></Sequence>)}
    </AbsoluteFill>
  );
};
