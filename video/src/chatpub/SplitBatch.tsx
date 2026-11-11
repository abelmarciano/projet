// Split-screen #6 : génération de pubs en série (creative batch) — une grille de visuels, un angle et une mise en page par pub,
// puis lancement de toutes les variantes en test sur Meta.
import React from 'react';
import {Easing, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Check, Cursor, FONT, DISPLAY, GRAD, INK, LINE, Logo, MetaMark, MUTED, SplitCfg, SplitChat, Spinner, clamp, prog} from './SplitChat';

type Card = {img: string; angle: string; layout: 'hook' | 'benefits' | 'beforeafter' | 'moment' | 'demo' | 'new'; title: string; lines?: string[]; cue?: string};
export type BatchCfg = SplitCfg & {ask1: string; product: {name: string; img: string; brand: string}; cards: Card[]};

const Layout: React.FC<{c: Card; brand: string}> = ({c, brand}) => {
  const tag = <div style={{position: 'absolute', top: 10, right: 12, fontSize: 12, fontWeight: 700, letterSpacing: '0.28em', color: '#1F1F1F', opacity: 0.8}}>{brand.toUpperCase()}</div>;
  if (c.layout === 'hook') return (<>{tag}<div style={{position: 'absolute', left: 12, right: 12, top: 34, fontFamily: DISPLAY, fontWeight: 700, fontSize: 25, lineHeight: 1.05, color: '#111', background: 'rgba(255,255,255,0.85)', padding: '8px 10px', borderRadius: 10}}>{c.title}</div></>);
  if (c.layout === 'benefits') return (<>{tag}<div style={{position: 'absolute', left: 10, bottom: 10, right: 10, padding: '10px 12px', borderRadius: 12, background: 'rgba(255,255,255,0.9)'}}>
    <div style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 18, color: '#111', marginBottom: 4}}>{c.title}</div>
    {(c.lines ?? []).map((l) => <div key={l} style={{fontSize: 14, fontWeight: 600, color: '#333'}}>✓ {l}</div>)}</div></>);
  if (c.layout === 'beforeafter') return (<>{tag}<div style={{position: 'absolute', left: 0, right: 0, bottom: 0, display: 'flex'}}>
    {(c.lines ?? []).map((l, i) => <div key={l} style={{flex: 1, padding: '10px 8px', textAlign: 'center', background: i ? '#6552E8' : 'rgba(17,17,17,0.75)', color: '#fff', fontSize: 14, fontWeight: 700}}><div style={{fontSize: 11, opacity: 0.75, letterSpacing: '0.12em'}}>{i ? 'APRÈS' : 'AVANT'}</div>{l}</div>)}</div>
    <div style={{position: 'absolute', left: 12, top: 30, fontFamily: DISPLAY, fontWeight: 700, fontSize: 20, color: '#111', background: 'rgba(255,255,255,0.85)', padding: '5px 9px', borderRadius: 8}}>{c.title}</div></>);
  if (c.layout === 'moment') return (<>{tag}<div style={{position: 'absolute', left: 0, right: 0, bottom: 0, padding: '40px 12px 12px', background: 'linear-gradient(transparent, rgba(0,0,0,0.6))', color: '#fff', fontFamily: DISPLAY, fontWeight: 700, fontSize: 22, lineHeight: 1.1}}>{c.title}</div></>);
  if (c.layout === 'demo') return (<>{tag}<div style={{position: 'absolute', left: 12, top: 30, padding: '6px 10px', borderRadius: 99, background: '#111', color: '#fff', fontSize: 15, fontWeight: 700}}>{c.title}</div></>);
  return (<>{tag}<div style={{position: 'absolute', left: 12, right: 12, bottom: 12, textAlign: 'center'}}>
    <div style={{display: 'inline-block', padding: '4px 10px', borderRadius: 99, background: '#6552E8', color: '#fff', fontSize: 12, fontWeight: 800, letterSpacing: '0.1em'}}>NOUVEAU</div>
    <div style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 20, color: '#111', marginTop: 6}}>{c.title}</div>
    <div style={{display: 'inline-block', marginTop: 6, padding: '5px 14px', borderRadius: 99, background: '#111', color: '#fff', fontSize: 13, fontWeight: 700}}>Découvrir</div></div></>);
};

const BatchWindow: React.FC<{cfg: SplitCfg}> = ({cfg: base}) => {
  const cfg = base as BatchCfg;
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const C = (k: string) => Math.round((cfg.cues[k] ?? 99) * fps);
  const ask1 = C('ask1'), send1 = C('send1'), list = C('list'), test = C('test');

  const composer = f >= ask1 && f < send1 ? cfg.ask1.slice(0, Math.round(interpolate(f, [ask1, send1 - 8], [0, cfg.ask1.length], clamp))) : '';
  const typingNow = f >= ask1 && f < send1;
  const home = 1 - prog(f, send1, 12);
  const scroll = prog(f, list + 40, 30) * 300 + prog(f, test - 4, 14) * 200;
  const nReady = cfg.cards.filter((_, i) => f >= list + 10 + i * 9).length;

  const pts: [number, number, number][] = [[0, 640, 600], [ask1 - 4, 560, 690], [send1 - 12, 900, 715], [send1, 900, 715], [list + 50, 760, 420], [test - 12, 620, 640], [test, 620, 640], [test + 40, 700, 600]];
  const ease = {...clamp, easing: Easing.inOut(Easing.cubic)};
  const cx = interpolate(f, pts.map((p) => p[0]), pts.map((p) => p[1]), ease);
  const cy = interpolate(f, pts.map((p) => p[0]), pts.map((p) => p[2]), ease);
  const tap = (a: number) => (f >= a - 2 ? interpolate(f, [a - 2, a + 10], [1, 0], clamp) : 0);
  const down = Math.max(tap(send1), tap(test));
  const launched = f >= test;

  return (
    <div style={{position: 'absolute', left: 40, top: 140, width: 1000, height: 820, borderRadius: 30, background: '#fff', boxShadow: '0 40px 90px -30px rgba(15,23,42,0.45), 0 0 0 1.5px rgba(15,23,42,0.08)', overflow: 'hidden', fontFamily: FONT}}>
      <div style={{height: 64, display: 'flex', alignItems: 'center', padding: '0 24px', gap: 10, borderBottom: `1.5px solid ${LINE}`, background: '#FAFAFC', position: 'relative', zIndex: 3}}>
        {['#FF5F57', '#FEBC2E', '#28C840'].map((c) => <div key={c} style={{width: 16, height: 16, borderRadius: 99, background: c}} />)}
        <div style={{flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10, fontWeight: 700, fontSize: 24, color: INK, marginRight: 70}}><Logo s={30} /> {cfg.brand}</div>
      </div>

      <div style={{position: 'absolute', left: 0, right: 0, top: 200, textAlign: 'center', fontFamily: DISPLAY, fontWeight: 700, fontSize: 50, color: INK, letterSpacing: '-0.02em', opacity: home, transform: `translateY(${(1 - home) * -40}px)`}}>
        Que veux-tu créer <span style={{backgroundImage: GRAD, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>aujourd'hui</span> ?
        <div style={{display: 'flex', justifyContent: 'center', gap: 12, marginTop: 34, fontFamily: FONT}}>
          {['🏷️ Ma marque', '📦 Catalogue', '🗂️ Série de pubs'].map((t) => <div key={t} style={{padding: '12px 20px', borderRadius: 99, background: '#F1F3F9', border: `1.5px solid ${LINE}`, fontSize: 22, fontWeight: 600, color: '#334155', letterSpacing: 0}}>{t}</div>)}
        </div>
      </div>

      {f >= send1 && (
        <div style={{position: 'absolute', left: 30, right: 30, top: 64, height: 640, overflow: 'hidden'}}>
          <div style={{transform: `translateY(${-scroll}px)`, paddingTop: 22}}>
            <div style={{display: 'flex', justifyContent: 'flex-end', opacity: prog(f, send1, 10)}}>
              <div style={{padding: '12px 18px', borderRadius: '24px 24px 6px 24px', background: '#EEF2FF', border: '1.5px solid #DDE3FF', fontSize: 24, color: INK, fontWeight: 500}}>
                {cfg.ask1}
                <div style={{display: 'flex', alignItems: 'center', gap: 10, marginTop: 8, padding: '6px 12px 6px 6px', borderRadius: 12, background: '#fff', border: `1.5px solid ${LINE}`, fontSize: 18, fontWeight: 700}}>
                  <Img src={staticFile(`media/${cfg.product.img}`)} style={{width: 40, height: 40, borderRadius: 8, objectFit: 'cover'}} /> {cfg.product.name}
                </div>
              </div>
            </div>
            <div style={{display: 'flex', alignItems: 'center', gap: 12, margin: '16px 0 12px', opacity: prog(f, send1 + 6, 8)}}>
              <Logo s={36} />
              <div style={{fontWeight: 700, fontSize: 22, color: INK}}>{nReady < cfg.cards.length ? `Je crée ta série… ${nReady}/${cfg.cards.length}` : `${cfg.cards.length} pubs, ${cfg.cards.length} angles différents ✨`}</div>
              {nReady < cfg.cards.length && <Spinner f={f} />}
            </div>
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14}}>
              {cfg.cards.map((c, i) => {
                const at = list + 10 + i * 9; const on = f >= at;
                const hl = c.cue && f >= C(c.cue) && f < C(c.cue) + 24;
                const sel = launched && f >= test + i * 2;
                return (
                  <div key={i} style={{opacity: prog(f, list + i * 3, 8)}}>
                    <div style={{position: 'relative', height: 355, borderRadius: 18, overflow: 'hidden', background: '#EEF0F6', boxShadow: hl ? '0 0 0 5px #8B6DFF, 0 20px 40px -14px rgba(91,63,228,0.8)' : sel ? '0 0 0 3px #16A34A' : '0 10px 24px -16px rgba(15,23,42,0.5)', transform: `scale(${hl ? 1.03 : on ? 0.96 + spring({frame: f - at, fps, config: {damping: 12}}) * 0.04 : 0.96})`}}>
                      {on ? <><Img src={staticFile(`media/${c.img}`)} style={{width: '100%', height: '100%', objectFit: 'cover'}} /><Layout c={c} brand={cfg.product.brand} /></>
                        : <div style={{position: 'absolute', inset: 0, background: `linear-gradient(${110 + f * 3 + i * 30}deg, #EEF0F6, #DDD6FE 45%, #EEF0F6)`}} />}
                      {sel && <div style={{position: 'absolute', top: 8, left: 8, width: 30, height: 30, borderRadius: 99, background: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Check s={20} c="#fff" /></div>}
                    </div>
                    <div style={{display: 'flex', gap: 6, marginTop: 8, opacity: on ? 1 : 0.3}}>
                      <span style={{padding: '4px 9px', borderRadius: 8, background: hl ? '#6552E8' : '#EEEBFF', color: hl ? '#fff' : '#5B3FE4', fontSize: 15, fontWeight: 700, whiteSpace: 'nowrap'}}>{c.angle}</span>
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{display: 'flex', justifyContent: 'center', marginTop: 18, opacity: prog(f, test - 30, 10)}}>
              <div style={{display: 'flex', alignItems: 'center', gap: 12, padding: '16px 28px', borderRadius: 18, background: launched ? '#16A34A' : '#0866FF', color: '#fff', fontWeight: 700, fontSize: 24, boxShadow: '0 16px 30px -14px rgba(8,102,255,0.8)', transform: `scale(${f >= test - 2 && f < test + 6 ? 0.95 : 1})`}}>
                {launched ? <><Check c="#fff" s={26} /> Test lancé : {cfg.cards.length} pubs en ligne</> : <><div style={{background: '#fff', borderRadius: 8, padding: '3px 5px', display: 'flex'}}><MetaMark s={18} /></div> Lancer le test sur Meta</>}
              </div>
            </div>
          </div>
        </div>
      )}

      <div style={{position: 'absolute', left: 30, right: 30, bottom: 24, height: 92, borderRadius: 26, border: `2px solid ${typingNow ? '#C4B5FD' : LINE}`, boxShadow: typingNow ? '0 0 0 6px rgba(124,108,240,0.12)' : '0 10px 30px -18px rgba(15,23,42,0.3)', background: '#fff', display: 'flex', alignItems: 'center', padding: '0 14px 0 26px', gap: 14, zIndex: 4}}>
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

export const SplitBatch: React.FC<{cfg: BatchCfg}> = ({cfg}) => <SplitChat cfg={cfg} Window={BatchWindow} />;
