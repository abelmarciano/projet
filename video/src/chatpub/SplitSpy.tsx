// Split-screen #3 : le chat Growthity montre les pubs des concurrents (durée de diffusion, accroche, angle) puis en refait une pour ta marque.
import React from 'react';
import {Easing, Img, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Cursor, FONT, DISPLAY, GRAD, INK, LINE, Logo, MetaMark, MUTED, SplitCfg, SplitChat, Spinner, clamp, prog} from './SplitChat';

type Comp = {brand: string; img: string; days: number; hook: string; angle: string; caption: string; color: string};
export type SpyCfg = SplitCfg & {ask1: string; ask2: string; comps: Comp[]; result: {video: string; brand: string}};

const SpyWindow: React.FC<{cfg: SplitCfg}> = ({cfg: base}) => {
  const cfg = base as SpyCfg;
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const C = (k: string) => Math.round((cfg.cues[k] ?? 99) * fps);
  const ask1 = C('ask1'), send1 = C('send1'), list = C('list'), hook = C('hook'), angle = C('angle'), pick = C('pick'), ask2 = C('ask2'), send2 = C('send2'), ready = C('ready');

  const typing = (txt: string, a: number, b: number) => txt.slice(0, Math.round(interpolate(f, [a, b], [0, txt.length], clamp)));
  let composer = '';
  if (f >= ask1 && f < send1) composer = typing(cfg.ask1, ask1, send1 - 8);
  if (f >= ask2 && f < send2) composer = typing(cfg.ask2, ask2, send2 - 6);
  const typingNow = (f >= ask1 && f < send1) || (f >= ask2 && f < send2);
  const home = 1 - prog(f, send1, 12);
  const scroll = prog(f, send2, 18) * 455;
  const picked = f >= pick;

  const pts: [number, number, number][] = [[0, 640, 600], [ask1 - 4, 560, 690], [send1 - 12, 900, 715], [send1, 900, 715], [list + 20, 620, 560], [pick - 6, 190, 420], [pick + 8, 190, 420], [ask2 - 2, 600, 690], [send2 - 10, 900, 715], [send2, 900, 715], [ready + 20, 820, 560]];
  const ease = {...clamp, easing: Easing.inOut(Easing.cubic)};
  const cx = interpolate(f, pts.map((p) => p[0]), pts.map((p) => p[1]), ease);
  const cy = interpolate(f, pts.map((p) => p[0]), pts.map((p) => p[2]), ease);
  const tap = (a: number) => (f >= a - 2 ? interpolate(f, [a - 2, a + 10], [1, 0], clamp) : 0);
  const down = Math.max(tap(send1), tap(pick), tap(send2));
  const best = cfg.comps[0];

  return (
    <div style={{position: 'absolute', left: 40, top: 140, width: 1000, height: 820, borderRadius: 30, background: '#fff', boxShadow: '0 40px 90px -30px rgba(15,23,42,0.45), 0 0 0 1.5px rgba(15,23,42,0.08)', overflow: 'hidden', fontFamily: FONT}}>
      <div style={{height: 64, display: 'flex', alignItems: 'center', padding: '0 24px', gap: 10, borderBottom: `1.5px solid ${LINE}`, background: '#FAFAFC', position: 'relative', zIndex: 3}}>
        {['#FF5F57', '#FEBC2E', '#28C840'].map((c) => <div key={c} style={{width: 16, height: 16, borderRadius: 99, background: c}} />)}
        <div style={{flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10, fontWeight: 700, fontSize: 24, color: INK, marginRight: 70}}><Logo s={30} /> {cfg.brand}</div>
      </div>

      <div style={{position: 'absolute', left: 0, right: 0, top: 200, textAlign: 'center', fontFamily: DISPLAY, fontWeight: 700, fontSize: 50, color: INK, letterSpacing: '-0.02em', opacity: home, transform: `translateY(${(1 - home) * -40}px)`}}>
        Que veux-tu savoir <span style={{backgroundImage: GRAD, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>aujourd'hui</span> ?
        <div style={{display: 'flex', justifyContent: 'center', gap: 12, marginTop: 34, fontFamily: FONT}}>
          {['🔎 Mes concurrents', '📊 Mes campagnes', '✨ Créer une pub'].map((t) => <div key={t} style={{padding: '12px 20px', borderRadius: 99, background: '#F1F3F9', border: `1.5px solid ${LINE}`, fontSize: 22, fontWeight: 600, color: '#334155', letterSpacing: 0}}>{t}</div>)}
        </div>
      </div>

      {f >= send1 && (
        <div style={{position: 'absolute', left: 30, right: 30, top: 64, height: 640, overflow: 'hidden'}}>
          <div style={{transform: `translateY(${-scroll}px)`, paddingTop: 22}}>
            <Bubble text={cfg.ask1} p={prog(f, send1, 10)} />
            <div style={{display: 'flex', alignItems: 'center', gap: 12, margin: '16px 0 12px', opacity: prog(f, send1 + 6, 8)}}>
              <Logo s={36} />
              <div style={{fontWeight: 700, fontSize: 22, color: INK}}>{f < list ? 'Je fouille la bibliothèque publicitaire…' : 'Leurs pubs qui tournent depuis le plus longtemps'}</div>
              {f < list ? <Spinner f={f} /> : <div style={{marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8, fontSize: 18, color: MUTED, fontWeight: 600}}><MetaMark s={18} /> Ad Library</div>}
            </div>
            <div style={{display: 'flex', gap: 16}}>
              {cfg.comps.map((c, i) => {
                const p = prog(f, list + i * 4, 12);
                const isBest = i === 0;
                const dim = picked && !isBest ? 0.45 : 1;
                const days = Math.round(interpolate(f, [list + i * 4, list + i * 4 + 18], [0, c.days], clamp));
                return (
                  <div key={i} style={{flex: 1, opacity: p * dim, transform: `translateY(${(1 - p) * 30}px) scale(${isBest && picked ? 1.02 : 1})`}}>
                    <div style={{position: 'relative', height: 300, borderRadius: 20, overflow: 'hidden', boxShadow: isBest && picked ? '0 0 0 5px #8B6DFF, 0 24px 40px -18px rgba(91,63,228,0.8)' : '0 14px 30px -18px rgba(15,23,42,0.5)'}}>
                      <Img src={staticFile(`media/${c.img}`)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                      <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, padding: '50px 14px 14px', background: 'linear-gradient(transparent, rgba(0,0,0,0.75))', color: '#fff', fontWeight: 700, fontSize: 19, lineHeight: 1.2}}>{c.caption}</div>
                      <div style={{position: 'absolute', top: 10, left: 10, padding: '6px 11px', borderRadius: 99, background: '#FFF7ED', color: '#C2410C', fontWeight: 800, fontSize: 17, boxShadow: '0 6px 14px -6px rgba(0,0,0,0.4)'}}>🔥 {days} j</div>
                    </div>
                    <div style={{display: 'flex', alignItems: 'center', gap: 8, marginTop: 10}}>
                      <div style={{width: 26, height: 26, borderRadius: 8, background: c.color, color: '#fff', fontWeight: 800, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{c.brand[0]}</div>
                      <div style={{fontWeight: 700, fontSize: 19, color: INK, whiteSpace: 'nowrap'}}>{c.brand}</div>
                    </div>
                    <div style={{display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8}}>
                      <Tag label="Accroche" v={c.hook} p={prog(f, hook + i * 3, 8)} c="#2563EB" />
                      <Tag label="Angle" v={c.angle} p={prog(f, angle + i * 3, 8)} c="#9333EA" />
                    </div>
                  </div>
                );
              })}
            </div>

            {f >= send2 && (
              <>
                <div style={{marginTop: 24}}><Bubble text={cfg.ask2} p={prog(f, send2, 10)} /></div>
                <div style={{display: 'flex', alignItems: 'center', gap: 12, margin: '16px 0 12px', opacity: prog(f, send2 + 6, 8)}}>
                  <Logo s={36} />
                  <div style={{fontWeight: 700, fontSize: 22, color: INK}}>{f < ready ? `Je l'adapte à ${cfg.result.brand}…` : `Ta version ${cfg.result.brand} est prête ✨`}</div>
                  {f < ready && <Spinner f={f} />}
                </div>
                <div style={{display: 'flex', alignItems: 'center', gap: 22}}>
                  <div style={{width: 200, height: 356, borderRadius: 20, overflow: 'hidden', position: 'relative', opacity: 0.9}}>
                    <Img src={staticFile(`media/${best.img}`)} style={{width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(0.4)'}} />
                    <div style={{position: 'absolute', left: 10, top: 10, padding: '5px 10px', borderRadius: 99, background: 'rgba(15,23,42,0.75)', color: '#fff', fontSize: 16, fontWeight: 700}}>{best.brand}</div>
                  </div>
                  <div style={{display: 'grid', gap: 10, fontSize: 18, fontWeight: 700, color: MUTED, textAlign: 'center'}}>
                    <div style={{fontSize: 44, color: '#8B6DFF'}}>→</div>
                    <div>Même accroche</div><div>Même angle</div><div style={{color: '#5B3FE4'}}>Ton produit</div>
                  </div>
                  <div style={{position: 'relative', width: 200, height: 356, borderRadius: 20, overflow: 'hidden', background: '#0B0A0C', boxShadow: f >= ready ? '0 0 0 4px #8B6DFF, 0 24px 50px -20px rgba(91,63,228,0.8)' : 'none', transform: `scale(${f >= ready ? 0.95 + spring({frame: f - ready, fps, config: {damping: 12}}) * 0.05 : 0.95})`}}>
                    {f >= ready ? (
                      <Sequence from={ready} layout="none"><OffthreadVideo src={staticFile(`media/${cfg.result.video}`)} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} /></Sequence>
                    ) : (
                      <div style={{position: 'absolute', inset: 0, background: `linear-gradient(${110 + f * 3}deg, #1E1B4B, #4C1D95 40%, #2563EB 70%, #1E1B4B)`}}>
                        <div style={{position: 'absolute', left: 0, right: 0, bottom: 18, textAlign: 'center', color: '#fff', fontFamily: '"Geist Mono", ui-monospace, monospace', fontSize: 18}}>Génération · {Math.min(99, Math.round(interpolate(f, [send2, ready], [4, 99], clamp)))}%</div>
                      </div>
                    )}
                    {f >= ready && <div style={{position: 'absolute', top: 10, left: 10, display: 'flex', alignItems: 'center', gap: 6, padding: '5px 11px', borderRadius: 99, background: '#fff', fontWeight: 700, fontSize: 16, color: '#15803D'}}><div style={{width: 10, height: 10, borderRadius: 99, background: '#22C55E'}} /> Prête</div>}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <div style={{position: 'absolute', left: 30, right: 30, bottom: 24, height: 92, borderRadius: 26, border: `2px solid ${typingNow ? '#C4B5FD' : LINE}`, boxShadow: typingNow ? '0 0 0 6px rgba(124,108,240,0.12)' : '0 10px 30px -18px rgba(15,23,42,0.3)', background: '#fff', display: 'flex', alignItems: 'center', padding: '0 14px 0 26px', gap: 14, zIndex: 4}}>
        <div style={{flex: 1, fontSize: 28, fontWeight: 500, color: composer ? INK : '#94A3B8', whiteSpace: 'nowrap', overflow: 'hidden'}}>
          {composer || 'Demande-moi n’importe quoi sur tes pubs…'}{typingNow && <span style={{opacity: Math.floor(f / 8) % 2 ? 1 : 0, color: '#6552E8'}}>|</span>}
        </div>
        <div style={{width: 64, height: 64, borderRadius: 20, background: composer ? GRAD : '#F1F3F9', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke={composer ? '#fff' : '#94A3B8'} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M6 11l6-6 6 6" /></svg>
        </div>
      </div>
      <Cursor x={cx} y={cy} down={down} />
    </div>
  );
};

const Tag: React.FC<{label: string; v: string; p: number; c: string}> = ({label, v, p, c}) => (
  <div style={{opacity: p, transform: `scale(${0.8 + p * 0.2})`, transformOrigin: 'left center', padding: '5px 9px', borderRadius: 9, background: `color-mix(in srgb, ${c} 10%, white)`, border: `1.5px solid color-mix(in srgb, ${c} 30%, white)`, fontSize: 15, fontWeight: 700, color: c, whiteSpace: 'nowrap'}}>
    <span style={{opacity: 0.7, fontWeight: 600}}>{label} · </span>{v}
  </div>
);

const Bubble: React.FC<{text: string; p: number}> = ({text, p}) => (
  <div style={{display: 'flex', justifyContent: 'flex-end', opacity: p, transform: `translateY(${(1 - p) * 20}px)`}}>
    <div style={{maxWidth: 640, padding: '14px 22px', borderRadius: '24px 24px 6px 24px', background: '#EEF2FF', border: '1.5px solid #DDE3FF', fontSize: 24, lineHeight: 1.35, color: INK, fontWeight: 500}}>{text}</div>
  </div>
);

export const SplitSpy: React.FC<{cfg: SpyCfg}> = ({cfg}) => <SplitChat cfg={cfg} Window={SpyWindow} />;
