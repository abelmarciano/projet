// « Le brief Meta » — épisode 4 : la fatigue créative.
import React from 'react';
import {AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame} from 'remotion';
import {DISPLAY, GRAD, INK, MUTED, Check, clamp, prog} from '../chatpub/SplitChat';
import {BriefShell, Grad, Headline, Label, Logo, Scene, ease} from './BriefAndromeda';

type Word = {w: string; s: number; e: number};
export type FatigueCfg = {episode: number; scenes: Scene[]; bed: string; ads: string[]};
const at = (words: Word[], k: string, d = 1) => { const w = words.find((x) => x.w.toLowerCase().includes(k)); return Math.round(((w?.s ?? d) - 0.1) * 30); };
const sp = (f: number, d = 12) => spring({frame: f, fps: 30, config: {damping: d}});
const RED = '#DC2626';
const GREEN = '#16A34A';

const Ad: React.FC<{src: string; w: number; h: number; style?: React.CSSProperties; filter?: string}> = ({src, w, h, style, filter}) => (
  <div style={{width: w, height: h, borderRadius: 18, overflow: 'hidden', boxShadow: '0 20px 40px -20px rgba(15,23,42,0.55)', background: '#fff', ...style}}>
    <Img src={staticFile(`media/${src}`)} style={{width: '100%', height: '100%', objectFit: 'cover', filter}} />
  </div>
);

// courbe tracée progressivement
const Curve: React.FC<{pts: [number, number][]; p: number; color: string; w?: number; fill?: string}> = ({pts, p, color, w = 8, fill}) => {
  const n = Math.max(2, Math.ceil(pts.length * p));
  const sub = pts.slice(0, n);
  const d = sub.map((q, i) => `${i ? 'L' : 'M'}${q[0]},${q[1]}`).join(' ');
  return (
    <>
      {fill && <path d={`${d} L${sub[sub.length - 1][0]},${pts[0][1] + 400} L${sub[0][0]},${pts[0][1] + 400} Z`} fill={fill} />}
      <path d={d} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={sub[sub.length - 1][0]} cy={sub[sub.length - 1][1]} r={w * 1.4} fill={color} />
    </>
  );
};

const S1: React.FC = () => {
  const f = useCurrentFrame();
  const pts: [number, number][] = Array.from({length: 60}).map((_, i) => { const x = i / 59; const y = x < 0.45 ? Math.sin((x / 0.45) * Math.PI / 2) : 1 - Math.pow((x - 0.45) / 0.55, 1.3) * 0.85; return [140 + x * 800, 1180 - y * 320]; });
  const p = interpolate(f, [16, 80], [0, 1], ease);
  const red = p > 0.5;
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 0, right: 0, top: 420, textAlign: 'center', transform: `scale(${0.85 + sp(f - 2, 14) * 0.15})`}}>
        <div style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 116, letterSpacing: '-0.035em', lineHeight: 1, color: INK}}>La fatigue<br /><Grad>créative</Grad></div>
        <div style={{fontSize: 38, fontWeight: 600, color: MUTED, marginTop: 24, opacity: prog(f, 12, 10)}}>Pourquoi ta meilleure pub finit par s’éteindre</div>
      </div>
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        <line x1={140} y1={1190} x2={940} y2={1190} stroke="#E2E8F0" strokeWidth={3} />
        {red && <Curve pts={pts} p={p} color={RED} />}
        <Curve pts={pts.slice(0, 28)} p={Math.min(1, p / 0.47)} color="#5B3FE4" />
      </svg>
      <div style={{position: 'absolute', left: 140, top: 1210, fontSize: 26, fontWeight: 700, color: MUTED, opacity: prog(f, 16, 8)}}>Performance de ta pub</div>
      <div style={{position: 'absolute', right: 140, top: 1080, padding: '8px 18px', borderRadius: 99, background: '#FEE2E2', color: '#B91C1C', fontSize: 26, fontWeight: 800, opacity: prog(f, 70, 8)}}>📉 plus rien</div>
    </AbsoluteFill>
  );
};

const S2: React.FC<{words: Word[]; ads: string[]}> = ({words, ads}) => {
  const f = useCurrentFrame();
  const t = at(words, 'force');
  const views = Math.min(9, 1 + Math.floor(interpolate(f, [8, t], [0, 8], clamp)));
  const tired = prog(f, t, 14);
  return (
    <AbsoluteFill>
      <Label text="LE PRINCIPE" color={RED} />
      <Headline>Toujours la même pub,<br /><span style={{color: RED}}>aux mêmes personnes.</span></Headline>
      <div style={{position: 'absolute', left: 540 - 170, top: 680, transform: `scale(${sp(f - 2)}) translateY(${-tired * 30}px)`, opacity: 1 - tired * 0.55}}>
        <Ad src={ads[0]} w={340} h={560} filter={`grayscale(${tired}) blur(${tired * 3}px)`} />
        {tired > 0.05 && <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><div style={{padding: '12px 26px', borderRadius: 99, background: INK, color: '#fff', fontSize: 34, fontWeight: 800, transform: `scale(${sp(f - t, 10)})`}}>Ignorée</div></div>}
      </div>
      {[0, 1, 2].map((i) => (
        <div key={i} style={{position: 'absolute', left: i === 0 ? 150 : i === 1 ? 800 : 790, top: [760, 720, 1040][i], width: 120, height: 120, borderRadius: 99, background: '#fff', border: '3px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 66, transform: `scale(${sp(f - 6 - i * 4)})`, boxShadow: '0 10px 24px -14px rgba(15,23,42,0.5)'}}>{['👩', '🧔', '👱‍♀️'][i]}</div>
      ))}
      <div style={{position: 'absolute', left: 120, top: 1040, padding: '14px 26px', borderRadius: 20, background: '#fff', border: `3px solid ${views > 5 ? RED : '#E5E7EB'}`, fontFamily: DISPLAY, fontWeight: 700, fontSize: 46, color: views > 5 ? RED : INK, transform: `scale(${sp(f - 8)})`}}>👁 vue {views}×</div>
    </AbsoluteFill>
  );
};

const Metric: React.FC<{f: number; start: number; y: number; label: string; up: boolean}> = ({f, start, y, label, up}) => {
  const p = sp(f - start);
  const pts: [number, number][] = Array.from({length: 20}).map((_, i) => [0 + i * 11, up ? 70 - Math.pow(i / 19, 1.6) * 60 : 10 + Math.pow(i / 19, 1.6) * 60]);
  const d = pts.slice(0, Math.max(2, Math.ceil(20 * prog(f, start + 4, 18)))).map((q, i) => `${i ? 'L' : 'M'}${q[0]},${q[1]}`).join(' ');
  return (
    <div style={{position: 'absolute', left: 110, right: 110, top: y, height: 150, borderRadius: 28, background: '#fff', border: '2px solid #E5E7EB', display: 'flex', alignItems: 'center', padding: '0 34px', gap: 24, transform: `translateX(${(1 - p) * 120}px)`, opacity: p, boxShadow: '0 20px 40px -26px rgba(15,23,42,0.45)'}}>
      <div style={{width: 76, height: 76, borderRadius: 22, background: '#FEE2E2', color: RED, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 50, fontWeight: 900}}>{up ? '↑' : '↓'}</div>
      <div style={{flex: 1, fontSize: 40, fontWeight: 800, color: INK}}>{label}</div>
      <svg width={220} height={80}><path d={d} fill="none" stroke={RED} strokeWidth={6} strokeLinecap="round" /></svg>
    </div>
  );
};

const S3: React.FC<{words: Word[]}> = ({words}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Label text="LES SIGNES" color={RED} />
      <Headline>3 signaux<br /><span style={{color: RED}}>qui ne trompent pas.</span></Headline>
      <Metric f={f} start={at(words, 'fréquence')} y={720} label="Fréquence" up />
      <Metric f={f} start={at(words, 'clic')} y={900} label="Taux de clic" up={false} />
      <Metric f={f} start={at(words, 'coût')} y={1080} label="Coût par résultat" up />
    </AbsoluteFill>
  );
};

const S4: React.FC<{words: Word[]; ads: string[]}> = ({words, ads}) => {
  const f = useCurrentFrame();
  const cross = at(words, 'suffit');
  const news = [{k: 'angles', l: 'Nouvel angle', a: ads[1]}, {k: 'visages', l: 'Nouveau visage', a: ads[2]}, {k: 'formats', l: 'Nouveau format', a: ads[3]}];
  return (
    <AbsoluteFill>
      <Label text="LE PIÈGE" color={RED} />
      <Headline>Changer la couleur<br /><span style={{color: RED}}>ne suffit pas.</span></Headline>
      <div style={{position: 'absolute', left: 0, right: 0, top: 660, display: 'flex', justifyContent: 'center', gap: 24}}>
        {[0, 70, 200].map((h, i) => <div key={i} style={{transform: `scale(${sp(f - 2 - i * 3)})`}}><Ad src={ads[0]} w={190} h={300} filter={`hue-rotate(${h}deg) saturate(1.3)`} /></div>)}
      </div>
      <div style={{position: 'absolute', left: 140, right: 140, top: 800, height: 8, borderRadius: 9, background: RED, transform: `scaleX(${prog(f, cross, 8)}) rotate(-8deg)`, boxShadow: '0 0 0 4px #fff'}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 985, display: 'flex', justifyContent: 'center', gap: 24}}>
        {news.map((n, i) => {
          const s = at(words, n.k);
          return (
            <div key={n.k} style={{transform: `scale(${sp(f - s)})`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10}}>
              <Ad src={n.a} w={190} h={i === 2 ? 190 : 300} style={{border: `4px solid ${GREEN}`, marginTop: i === 2 ? 55 : 0, marginBottom: i === 2 ? 55 : 0}} />
              <div style={{display: 'flex', alignItems: 'center', gap: 6, fontSize: 24, fontWeight: 800, color: '#15803D'}}><Check s={24} /> {n.l}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const S5: React.FC<{ads: string[]}> = ({ads}) => {
  const f = useCurrentFrame();
  const segs = 4;
  const pts: [number, number][] = [];
  for (let s = 0; s < segs; s++) for (let i = 0; i < 15; i++) { const x = (s * 15 + i) / (segs * 15 - 1); const y = 0.95 - Math.pow(i / 14, 1.4) * 0.3; pts.push([140 + x * 800, 1180 - y * 330]); }
  const p = interpolate(f, [6, 110], [0, 1], ease);
  return (
    <AbsoluteFill>
      <Label text="LE BON RÉFLEXE" color={GREEN} />
      <Headline>Rafraîchis<br /><Grad>avant l’essoufflement.</Grad></Headline>
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        <line x1={140} y1={1190} x2={940} y2={1190} stroke="#E2E8F0" strokeWidth={3} />
        <Curve pts={pts} p={p} color={GREEN} />
      </svg>
      {Array.from({length: segs}).map((_, s) => {
        const x = 140 + (s * 15) / (segs * 15 - 1) * 800;
        const st = 6 + (s / segs) * 104;
        return <div key={s} style={{position: 'absolute', left: x - 38, top: 1215, transform: `scale(${sp(f - st)})`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6}}><Ad src={ads[4 + s] ?? ads[s]} w={76} h={120} style={{borderRadius: 12}} /><div style={{fontSize: 20, fontWeight: 800, color: '#15803D'}}>+ créa</div></div>;
      })}
    </AbsoluteFill>
  );
};

const S6: React.FC<{ads: string[]}> = ({ads}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 0, right: 0, top: 350, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 22, transform: `scale(${0.8 + sp(f, 13) * 0.2})`}}>
        <div style={{filter: 'drop-shadow(0 20px 40px rgba(91,63,228,0.35))'}}><Logo s={110} /></div>
        <div style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 90, color: INK, letterSpacing: '-0.03em'}}>Growthity</div>
      </div>
      <div style={{position: 'absolute', left: 90, right: 90, top: 530, borderRadius: 34, background: '#fff', border: '2px solid #E5E7EB', padding: 34, boxShadow: '0 30px 60px -30px rgba(15,23,42,0.5)', opacity: prog(f, 8, 10), transform: `translateY(${(1 - prog(f, 8, 10)) * 40}px)`}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <div style={{fontSize: 26, fontWeight: 800, letterSpacing: '0.12em', color: MUTED}}>NOUVEAU LOT DE CRÉAS</div>
          <div style={{padding: '6px 14px', borderRadius: 99, backgroundImage: GRAD, color: '#fff', fontSize: 22, fontWeight: 800}}>✨ variées</div>
        </div>
        <div style={{marginTop: 22, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14}}>
          {ads.slice(0, 8).map((a, i) => <div key={i} style={{transform: `scale(${sp(f - 16 - i * 2.5)})`}}><Ad src={a} w={200} h={250} style={{width: '100%', borderRadius: 14}} /></div>)}
        </div>
        <div style={{marginTop: 22, display: 'flex', alignItems: 'center', gap: 12, fontSize: 32, fontWeight: 800, color: '#15803D', opacity: prog(f, 44, 8)}}><Check s={34} /> Prêtes à lancer</div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1300, display: 'flex', justifyContent: 'center', opacity: prog(f, 56, 10)}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 14, padding: '18px 38px', borderRadius: 99, backgroundImage: GRAD, color: '#fff', fontSize: 36, fontWeight: 800, boxShadow: '0 20px 40px -14px rgba(91,63,228,0.7)'}}><Check s={34} c="#fff" /> Lien en bio pour commencer</div>
      </div>
    </AbsoluteFill>
  );
};

export const BriefFatigue: React.FC<{cfg: FatigueCfg}> = ({cfg}) => (
  <BriefShell cfg={cfg} comps={[<S1 key={0} />, <S2 key={1} words={cfg.scenes[1].words} ads={cfg.ads} />, <S3 key={2} words={cfg.scenes[2].words} />, <S4 key={3} words={cfg.scenes[3].words} ads={cfg.ads} />, <S5 key={4} ads={cfg.ads} />, <S6 key={5} ads={cfg.ads} />]} />
);
