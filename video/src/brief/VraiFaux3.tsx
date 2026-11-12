// « Vrai ou faux ? » #3 — « Sur Meta, ta créa compte plus que ton ciblage. » → VRAI.
import React from 'react';
import {AbsoluteFill, Img, spring, staticFile, useCurrentFrame} from 'remotion';
import {DISPLAY, INK, MUTED, prog} from '../chatpub/SplitChat';
import {BriefShell, Grad} from './BriefAndromeda';
import {VFCfg, VFS1, VFS2, VFS3, VFS6} from './VraiFaux';

type Word = {w: string; s: number; e: number};
const sp = (f: number, d = 12) => spring({frame: f, fps: 30, config: {damping: d}});
const at = (words: Word[], k: string, d = 1) => { const w = words.find((x) => x.w.toLowerCase().includes(k)); return Math.round(((w?.s ?? d) - 0.1) * 30); };
const GREEN = '#16A34A';
const PURPLE = '#5B3FE4';

const Title: React.FC<{tag: string; color: string; children: React.ReactNode}> = ({tag, color, children}) => (
  <div style={{position: 'absolute', left: 80, right: 80, top: 360}}>
    <div style={{fontSize: 26, fontWeight: 800, letterSpacing: '0.14em', color}}>● {tag}</div>
    <div style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 70, lineHeight: 1.05, letterSpacing: '-0.03em', color: INK, marginTop: 14}}>{children}</div>
  </div>
);
const Thumb: React.FC<{src: string; w: number; h: number; style?: React.CSSProperties; filter?: string}> = ({src, w, h, style, filter}) => (
  <div style={{width: w, height: h, borderRadius: 14, overflow: 'hidden', boxShadow: '0 14px 26px -16px rgba(15,23,42,0.55)', background: '#fff', ...style}}>
    <Img src={staticFile(`media/${src}`)} style={{width: '100%', height: '100%', objectFit: 'cover', filter}} />
  </div>
);

// même audience pour toi et ton concurrent ; seule la créa change
const S4: React.FC<{words: Word[]; ads: string[]}> = ({words, ads}) => {
  const f = useCurrentFrame();
  const same = at(words, 'mêmes'), show = at(words, 'change');
  const crowd = ['👩', '🧔', '👱‍♀️', '👨‍🦱', '👩‍🦰', '🧑', '👵', '👨'];
  const Card: React.FC<{x: number; who: string; ad: string; good: boolean; start: number}> = ({x, who, ad, good, start}) => (
    <div style={{position: 'absolute', left: x, top: 640, width: 400, borderRadius: 28, background: '#fff', border: `3px solid ${good && f >= show ? GREEN : '#E5E7EB'}`, padding: 22, transform: `scale(${sp(f - start)})`, boxShadow: '0 24px 44px -28px rgba(15,23,42,0.55)'}}>
      <div style={{fontSize: 30, fontWeight: 800, color: INK}}>{who}</div>
      <div style={{marginTop: 10, display: 'inline-block', padding: '6px 14px', borderRadius: 99, background: '#F1F5F9', fontSize: 22, fontWeight: 800, color: MUTED}}>🎯 Ciblage large</div>
      <div style={{marginTop: 16, height: 250, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
        {f >= show ? <div style={{transform: `scale(${sp(f - show - (good ? 6 : 0))})`}}><Thumb src={ad} w={156} h={240} filter={good ? undefined : 'grayscale(1) contrast(0.8) brightness(1.1)'} /></div> : <div style={{width: 156, height: 240, borderRadius: 14, border: '3px dashed #CBD5E1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 50, color: '#CBD5E1'}}>?</div>}
      </div>
    </div>
  );
  return (
    <AbsoluteFill>
      <Title tag="POURQUOI" color={PURPLE}>Même audience.<br /><Grad>Créa différente.</Grad></Title>
      <Card x={90} who="Ton concurrent" ad={ads[0]} good={false} start={4} />
      <Card x={590} who="Toi" ad={ads[1]} good start={8} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 1070, textAlign: 'center', fontSize: 26, fontWeight: 800, color: MUTED, opacity: prog(f, same, 8)}}>Les mêmes personnes</div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1120, display: 'flex', justifyContent: 'center', gap: 14}}>
        {crowd.map((c, i) => {
          const turned = prog(f, show + 10 + i * 3, 8);
          return <div key={i} style={{width: 90, height: 90, borderRadius: 99, background: '#fff', border: `3px solid ${turned > 0.5 ? GREEN : '#E5E7EB'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 50, transform: `scale(${sp(f - same - i * 2)}) translateX(${turned * 10}px)`}}>{c}</div>;
        })}
      </div>
    </AbsoluteFill>
  );
};

// tester angles / visages / formats, garder ce qui marche
const S5: React.FC<{words: Word[]}> = ({words}) => {
  const f = useCurrentFrame();
  const keep = at(words, 'garde');
  const rows = [
    {k: 'angles', l: 'Angles', items: ['chat/batch/g3.png', 'chat/batch/g6.png', 'chat/batch/g5.png'], win: 1, shapes: [[150, 230], [150, 230], [150, 230]]},
    {k: 'visages', l: 'Visages', items: ['chat/multi/sport.jpg', 'chat/multi3/parc.jpg', 'chat/jwel/nb2.png'], win: 0, shapes: [[150, 230], [150, 230], [150, 230]]},
    {k: 'formats', l: 'Formats', items: ['chat/roast6/burger.png', 'chat/roast6/burger.png', 'chat/roast6/burger.png'], win: 2, shapes: [[130, 230], [190, 190], [176, 220]]},
  ];
  return (
    <AbsoluteFill>
      <Title tag="LE BON RÉFLEXE" color={GREEN}>Teste plein de créas,<br /><Grad>garde ce qui marche.</Grad></Title>
      {rows.map((r, ri) => {
        const s = at(words, r.k);
        return (
          <div key={r.k} style={{position: 'absolute', left: 90, right: 90, top: 640 + ri * 230, height: 230, display: 'flex', alignItems: 'center', gap: 22}}>
            <div style={{width: 170, fontSize: 32, fontWeight: 800, color: INK, opacity: prog(f, s - 6, 8)}}>{r.l}</div>
            {r.items.map((a, i) => {
              const win = i === r.win;
              const dim = f >= keep && !win ? 0.35 : 1;
              return (
                <div key={i} style={{position: 'relative', transform: `scale(${sp(f - s - i * 3) * 0.86 * (f >= keep && win ? 1 + sp(f - keep - ri * 4, 9) * 0.08 : 1)})`, opacity: dim}}>
                  <Thumb src={a} w={r.shapes[i][0]} h={r.shapes[i][1]} style={{border: f >= keep && win ? `5px solid ${GREEN}` : undefined}} />
                  {f >= keep && win && <div style={{position: 'absolute', right: -16, top: -16, width: 56, height: 56, borderRadius: 99, background: GREEN, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, transform: `scale(${sp(f - keep - ri * 4, 9)})`}}>🏆</div>}
                </div>
              );
            })}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

export const VraiFaux3: React.FC<{cfg: VFCfg}> = ({cfg}) => (
  <BriefShell cfg={cfg} comps={[<VFS1 key={0} cfg={cfg} />, <VFS2 key={1} cfg={cfg} />, <VFS3 key={2} cfg={cfg} />, <S4 key={3} words={cfg.scenes[3].words} ads={cfg.ads} />, <S5 key={4} words={cfg.scenes[4].words} />, <VFS6 key={5} ads={cfg.ads} />]} />
);
