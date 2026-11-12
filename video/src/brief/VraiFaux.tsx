// « Vrai ou faux ? » — série courte : affirmation, compte à rebours (réponds en commentaire), verdict, explication, Growthity.
import React from 'react';
import {AbsoluteFill, Img, spring, staticFile, useCurrentFrame} from 'remotion';
import {DISPLAY, GRAD, INK, MUTED, Check, prog} from '../chatpub/SplitChat';
import {BriefShell, Grad, Logo, Scene} from './BriefAndromeda';

type Word = {w: string; s: number; e: number};
export type VFCfg = {episode: number; series: string; epLabel: string; scenes: Scene[]; bed: string; ads: string[]; statement: string; verdict: boolean};
const sp = (f: number, d = 12) => spring({frame: f, fps: 30, config: {damping: d}});
const at = (words: Word[], k: string, d = 1) => { const w = words.find((x) => x.w.toLowerCase().includes(k)); return Math.round(((w?.s ?? d) - 0.1) * 30); };
const RED = '#DC2626';
const GREEN = '#16A34A';

const Btn: React.FC<{label: string; color: string; scale?: number; dim?: number}> = ({label, color, scale = 1, dim = 0}) => (
  <div style={{width: 360, height: 150, borderRadius: 36, background: color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: DISPLAY, fontWeight: 700, fontSize: 72, letterSpacing: '0.02em', transform: `scale(${scale})`, opacity: 1 - dim * 0.75, boxShadow: `0 24px 40px -18px ${color}`}}>{label}</div>
);
const Statement: React.FC<{text: string; f: number; start?: number; small?: boolean}> = ({text, f, start = 0, small}) => (
  <div style={{position: 'absolute', left: 90, right: 90, top: small ? 360 : 520, padding: small ? '26px 34px' : '46px 50px', borderRadius: 40, background: '#fff', border: '3px solid #E5E7EB', boxShadow: '0 40px 70px -40px rgba(15,23,42,0.55)', transform: `scale(${small ? 1 : 0.8 + sp(f - start, 13) * 0.2})`, opacity: small ? 1 : sp(f - start, 13)}}>
    <div style={{fontSize: small ? 22 : 28, fontWeight: 800, letterSpacing: '0.14em', color: MUTED, marginBottom: small ? 8 : 16}}>L’AFFIRMATION</div>
    <div style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: small ? 40 : 64, lineHeight: 1.12, letterSpacing: '-0.02em', color: INK}}>« {text} »</div>
  </div>
);

const S1: React.FC<{cfg: VFCfg}> = ({cfg}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 0, right: 0, top: 330, textAlign: 'center', fontFamily: DISPLAY, fontWeight: 700, fontSize: 104, letterSpacing: '-0.035em', color: INK, transform: `scale(${0.7 + sp(f, 10) * 0.3})`}}>
        <span style={{color: GREEN}}>Vrai</span> ou <span style={{color: RED}}>faux</span> ?
      </div>
      <Statement text={cfg.statement} f={f} start={14} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 1000, display: 'flex', justifyContent: 'center', gap: 40}}>
        <div style={{transform: `scale(${sp(f - 40)})`}}><Btn label="VRAI" color={GREEN} scale={0.8} /></div>
        <div style={{transform: `scale(${sp(f - 46)})`}}><Btn label="FAUX" color={RED} scale={0.8} /></div>
      </div>
    </AbsoluteFill>
  );
};

const S2: React.FC<{cfg: VFCfg}> = ({cfg}) => {
  const f = useCurrentFrame();
  const n = 3 - Math.floor(f / 30);
  const local = f % 30;
  return (
    <AbsoluteFill>
      <Statement text={cfg.statement} f={f} small />
      <div style={{position: 'absolute', left: 0, right: 0, top: 640, display: 'flex', justifyContent: 'center'}}>
        <div style={{width: 300, height: 300, borderRadius: 999, backgroundImage: GRAD, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: DISPLAY, fontWeight: 700, fontSize: 190, color: '#fff', transform: `scale(${n > 0 ? 1.25 - sp(local, 9) * 0.25 : 1})`, boxShadow: '0 30px 60px -24px rgba(91,63,228,0.7)'}}>{Math.max(1, n)}</div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1000, textAlign: 'center', fontSize: 46, fontWeight: 800, color: INK}}>Réponds en commentaire 👇</div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1090, display: 'flex', justifyContent: 'center', gap: 40}}>
        <Btn label="VRAI" color={GREEN} scale={0.7 + Math.sin(f * 0.35) * 0.03} />
        <Btn label="FAUX" color={RED} scale={0.7 - Math.sin(f * 0.35) * 0.03} />
      </div>
    </AbsoluteFill>
  );
};

const S3: React.FC<{cfg: VFCfg}> = ({cfg}) => {
  const f = useCurrentFrame();
  const stamp = sp(f - 2, 8);
  const win = cfg.verdict ? 'VRAI' : 'FAUX';
  const col = cfg.verdict ? GREEN : RED;
  return (
    <AbsoluteFill>
      <Statement text={cfg.statement} f={f} small />
      <div style={{position: 'absolute', left: 0, right: 0, top: 700, display: 'flex', justifyContent: 'center'}}>
        <div style={{padding: '30px 80px', borderRadius: 40, border: `14px solid ${col}`, color: col, fontFamily: DISPLAY, fontWeight: 700, fontSize: 200, letterSpacing: '0.04em', transform: `scale(${2.2 - stamp * 1.2}) rotate(-8deg)`, opacity: Math.min(1, stamp * 1.5), background: 'rgba(255,255,255,0.85)'}}>{win}</div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1110, textAlign: 'center', fontSize: 44, fontWeight: 800, color: INK, opacity: prog(f, 26, 8)}}>En général, c’est même <span style={{color: col}}>l’inverse.</span></div>
    </AbsoluteFill>
  );
};

// ciblage serré vs large : points = clients potentiels, l'IA de Meta les trouve dans le cercle large
const S4: React.FC<{words: Word[]}> = ({words}) => {
  const f = useCurrentFrame();
  const tight = at(words, 'serré');
  const dots = Array.from({length: 46}).map((_, i) => { const a = i * 2.39996; const r = 40 + ((i * 37) % 100) * 2.1; return {x: Math.cos(a) * r, y: Math.sin(a) * r * 0.82, buyer: i % 4 === 0}; });
  const Panel: React.FC<{cx: number; R: number; label: string; good: boolean; start: number}> = ({cx, R, label, good, start}) => {
    const p = sp(f - start);
    return (
      <>
        <div style={{position: 'absolute', left: cx - 220, top: 720, width: 440, height: 400, borderRadius: 30, background: '#fff', border: `3px solid ${good ? '#86EFAC' : '#FECACA'}`, opacity: p, transform: `scale(${0.9 + p * 0.1})`, overflow: 'hidden'}}>
          {dots.map((d, i) => { const inside = Math.hypot(d.x, d.y / 0.82) < R; const found = inside && d.buyer; return <div key={i} style={{position: 'absolute', left: 220 + d.x * 0.85 - 9, top: 200 + d.y * 0.85 - 9, width: 18, height: 18, borderRadius: 9, background: found ? GREEN : d.buyer ? '#FCA5A5' : '#CBD5E1', transform: `scale(${found ? 1 + prog(f, start + 12 + i * 0.4, 6) * 0.5 : 1})`}} />; })}
          <div style={{position: 'absolute', left: 220 - R * 0.85, top: 200 - R * 0.85 * 0.82, width: R * 1.7, height: R * 1.7 * 0.82, borderRadius: '50%', border: `4px dashed ${good ? GREEN : RED}`, transform: `scale(${prog(f, start + 6, 10)})`}} />
        </div>
        <div style={{position: 'absolute', left: cx - 220, width: 440, top: 1140, textAlign: 'center', fontSize: 30, fontWeight: 800, color: good ? '#15803D' : '#B91C1C', opacity: p}}>{label}</div>
      </>
    );
  };
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 80, right: 80, top: 360}}>
        <div style={{fontSize: 26, fontWeight: 800, letterSpacing: '0.14em', color: '#5B3FE4'}}>● POURQUOI</div>
        <div style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 70, lineHeight: 1.05, letterSpacing: '-0.03em', color: INK, marginTop: 14}}>L’algorithme cherche<br /><Grad>mieux que toi.</Grad></div>
      </div>
      <Panel cx={300} R={70} label="Ciblage serré" good={false} start={Math.min(tight, 40)} />
      <Panel cx={780} R={230} label="Ciblage large" good start={6} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 650, display: 'flex', justifyContent: 'center', gap: 26, fontSize: 24, fontWeight: 800, color: MUTED, opacity: prog(f, 10, 8)}}>
        <span><span style={{color: GREEN}}>●</span> client trouvé</span><span><span style={{color: '#FCA5A5'}}>●</span> client raté</span>
      </div>
    </AbsoluteFill>
  );
};

const S5: React.FC<{words: Word[]; ads: string[]}> = ({words, ads}) => {
  const f = useCurrentFrame();
  const cr = at(words, 'créa'), att = at(words, 'attire');
  const people = ['🧑‍🍳', '👩‍💼', '🧔', '👱‍♀️'];
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 80, right: 80, top: 360}}>
        <div style={{fontSize: 26, fontWeight: 800, letterSpacing: '0.14em', color: GREEN}}>● LE VRAI LEVIER</div>
        <div style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 70, lineHeight: 1.05, letterSpacing: '-0.03em', color: INK, marginTop: 14}}>Ton ciblage,<br /><Grad>c’est ta créa.</Grad></div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 700, display: 'flex', justifyContent: 'center', gap: 22}}>
        {ads.slice(0, 4).map((a, i) => (
          <div key={i} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18, transform: `scale(${sp(f - cr - i * 4)})`}}>
            <div style={{width: 190, height: 300, borderRadius: 20, overflow: 'hidden', boxShadow: '0 20px 40px -20px rgba(15,23,42,0.6)'}}><Img src={staticFile(`media/${a}`)} style={{width: '100%', height: '100%', objectFit: 'cover'}} /></div>
            <div style={{fontSize: 30, transform: `translateY(${(1 - prog(f, att + i * 4, 10)) * 40}px)`, opacity: prog(f, att + i * 4, 10)}}>↑</div>
            <div style={{width: 96, height: 96, borderRadius: 99, background: '#fff', border: `3px solid ${GREEN}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 52, opacity: prog(f, att + i * 4, 10), transform: `scale(${sp(f - att - i * 4)})`}}>{people[i]}</div>
          </div>
        ))}
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1240, textAlign: 'center', fontSize: 30, fontWeight: 800, color: MUTED, opacity: prog(f, att + 20, 8)}}>Chaque créa attire son public</div>
    </AbsoluteFill>
  );
};

const S6: React.FC<{ads: string[]}> = ({ads}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 0, right: 0, top: 380, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 22, transform: `scale(${0.8 + sp(f, 13) * 0.2})`}}>
        <div style={{filter: 'drop-shadow(0 20px 40px rgba(91,63,228,0.35))'}}><Logo s={120} /></div>
        <div style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 96, color: INK, letterSpacing: '-0.03em'}}>Growthity</div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 580, display: 'flex', justifyContent: 'center', gap: 16}}>
        {ads.slice(0, 4).map((a, i) => <div key={i} style={{width: 180, height: 290, borderRadius: 18, overflow: 'hidden', transform: `scale(${sp(f - 6 - i * 3)}) rotate(${(i - 1.5) * 3}deg)`, boxShadow: '0 20px 40px -20px rgba(15,23,42,0.6)'}}><Img src={staticFile(`media/${a}`)} style={{width: '100%', height: '100%', objectFit: 'cover'}} /></div>)}
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 960, display: 'flex', justifyContent: 'center', opacity: prog(f, 36, 10)}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 12, padding: '14px 30px', borderRadius: 99, background: '#fff', border: '2px solid #E5E7EB', fontSize: 32, fontWeight: 800, color: INK}}>🔔 Prochain « Vrai ou faux » bientôt</div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1090, display: 'flex', justifyContent: 'center', opacity: prog(f, 48, 10)}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 14, padding: '18px 38px', borderRadius: 99, backgroundImage: GRAD, color: '#fff', fontSize: 36, fontWeight: 800, boxShadow: '0 20px 40px -14px rgba(91,63,228,0.7)'}}><Check s={34} c="#fff" /> Lien en bio pour commencer</div>
      </div>
    </AbsoluteFill>
  );
};

export const VraiFaux: React.FC<{cfg: VFCfg}> = ({cfg}) => (
  <BriefShell cfg={cfg} comps={[<S1 key={0} cfg={cfg} />, <S2 key={1} cfg={cfg} />, <S3 key={2} cfg={cfg} />, <S4 key={3} words={cfg.scenes[3].words} />, <S5 key={4} words={cfg.scenes[4].words} ads={cfg.ads} />, <S6 key={5} ads={cfg.ads} />]} />
);
