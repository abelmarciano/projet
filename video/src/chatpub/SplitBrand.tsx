// Split-screen #4 : le chat Growthity analyse la marque depuis le site (couleurs, police, ton, produits + prix), puis génère les premières pubs.
import React from 'react';
import {Easing, Img, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Check, Cursor, FONT, DISPLAY, GRAD, INK, LINE, Logo, MUTED, SplitCfg, SplitChat, Spinner, clamp, prog} from './SplitChat';

type Prod = {name: string; price: string; img: string};
type Ad = {kind: 'video' | 'image'; src: string; label: string};
export type BrandCfg = SplitCfg & {
  ask1: string; ask2: string; site: string;
  b: {name: string; colors: string[]; font: string; tone: string[]; promise: string; products: Prod[]};
  ads: Ad[];
};

const BrandWindow: React.FC<{cfg: SplitCfg}> = ({cfg: base}) => {
  const cfg = base as BrandCfg;
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const C = (k: string) => Math.round((cfg.cues[k] ?? 99) * fps);
  const ask1 = C('ask1'), send1 = C('send1'), scan = C('scan'), colors = C('colors'), font = C('font'), tone = C('tone'), products = C('products'), ask2 = C('ask2'), send2 = C('send2'), ads = C('ads');

  const typing = (txt: string, a: number, b: number) => txt.slice(0, Math.round(interpolate(f, [a, b], [0, txt.length], clamp)));
  let composer = '';
  if (f >= ask1 && f < send1) composer = typing(cfg.ask1, ask1, send1 - 8);
  if (f >= ask2 && f < send2) composer = typing(cfg.ask2, ask2, send2 - 6);
  const typingNow = (f >= ask1 && f < send1) || (f >= ask2 && f < send2);
  const home = 1 - prog(f, send1, 12);
  const scroll = prog(f, send2, 18) * 520;

  const pts: [number, number, number][] = [[0, 640, 600], [ask1 - 4, 560, 690], [send1 - 12, 900, 715], [send1, 900, 715], [products + 20, 760, 560], [ask2 - 2, 600, 690], [send2 - 10, 900, 715], [send2, 900, 715], [ads + 30, 820, 600]];
  const ease = {...clamp, easing: Easing.inOut(Easing.cubic)};
  const cx = interpolate(f, pts.map((p) => p[0]), pts.map((p) => p[1]), ease);
  const cy = interpolate(f, pts.map((p) => p[0]), pts.map((p) => p[2]), ease);
  const tap = (a: number) => (f >= a - 2 ? interpolate(f, [a - 2, a + 10], [1, 0], clamp) : 0);
  const down = Math.max(tap(send1), tap(send2));

  const scanP = interpolate(f, [scan, products + 10], [0, 1], clamp);
  const tile = (k: number) => ({p: prog(f, k - 4, 12), on: f >= k - 4});
  const T = (k: number, title: string, body: React.ReactNode, span = 1) => {
    const {p, on} = tile(k);
    return (
      <div style={{gridColumn: `span ${span}`, padding: '14px 16px', borderRadius: 18, border: `2px solid ${on ? '#C4B5FD' : LINE}`, background: on ? '#FAF8FF' : '#fff', opacity: 0.35 + p * 0.65, transform: `scale(${0.96 + p * 0.04})`}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 8, fontSize: 16, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: MUTED, marginBottom: 10}}>
          {on ? <div style={{transform: `scale(${spring({frame: f - k + 4, fps, config: {damping: 10}})})`}}><Check s={20} /></div> : <Spinner f={f} s={18} />} {title}
        </div>
        <div style={{opacity: p}}>{body}</div>
      </div>
    );
  };

  return (
    <div style={{position: 'absolute', left: 40, top: 140, width: 1000, height: 820, borderRadius: 30, background: '#fff', boxShadow: '0 40px 90px -30px rgba(15,23,42,0.45), 0 0 0 1.5px rgba(15,23,42,0.08)', overflow: 'hidden', fontFamily: FONT}}>
      <div style={{height: 64, display: 'flex', alignItems: 'center', padding: '0 24px', gap: 10, borderBottom: `1.5px solid ${LINE}`, background: '#FAFAFC', position: 'relative', zIndex: 3}}>
        {['#FF5F57', '#FEBC2E', '#28C840'].map((c) => <div key={c} style={{width: 16, height: 16, borderRadius: 99, background: c}} />)}
        <div style={{flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10, fontWeight: 700, fontSize: 24, color: INK, marginRight: 70}}><Logo s={30} /> {cfg.brand}</div>
      </div>

      <div style={{position: 'absolute', left: 0, right: 0, top: 200, textAlign: 'center', fontFamily: DISPLAY, fontWeight: 700, fontSize: 50, color: INK, letterSpacing: '-0.02em', opacity: home, transform: `translateY(${(1 - home) * -40}px)`}}>
        Que veux-tu créer <span style={{backgroundImage: GRAD, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>aujourd'hui</span> ?
        <div style={{display: 'flex', justifyContent: 'center', gap: 12, marginTop: 34, fontFamily: FONT}}>
          {['🏷️ Ma marque', '👤 Ajouter un acteur', '📦 Catalogue'].map((t) => <div key={t} style={{padding: '12px 20px', borderRadius: 99, background: '#F1F3F9', border: `1.5px solid ${LINE}`, fontSize: 22, fontWeight: 600, color: '#334155', letterSpacing: 0}}>{t}</div>)}
        </div>
      </div>

      {f >= send1 && (
        <div style={{position: 'absolute', left: 30, right: 30, top: 64, height: 640, overflow: 'hidden'}}>
          <div style={{transform: `translateY(${-scroll}px)`, paddingTop: 22}}>
            <Bubble p={prog(f, send1, 10)}>
              <div>{cfg.ask1}</div>
              <div style={{display: 'flex', alignItems: 'center', gap: 10, marginTop: 8, padding: '8px 12px', borderRadius: 12, background: '#fff', border: `1.5px solid ${LINE}`, fontSize: 19, color: '#334155'}}>
                <span style={{fontSize: 20}}>🔗</span><b style={{color: INK}}>{cfg.site}</b><span style={{color: MUTED}}>· Shopify</span>
              </div>
            </Bubble>
            <div style={{display: 'flex', alignItems: 'center', gap: 12, margin: '16px 0 10px', opacity: prog(f, send1 + 6, 8)}}>
              <Logo s={36} />
              <div style={{fontWeight: 700, fontSize: 22, color: INK}}>{scanP < 1 ? 'J’analyse ton site…' : `Identité de marque : ${cfg.b.name}`}</div>
              <div style={{marginLeft: 'auto', width: 170, height: 10, borderRadius: 99, background: '#EEF0F6', overflow: 'hidden'}}><div style={{width: `${scanP * 100}%`, height: '100%', background: GRAD}} /></div>
              <div style={{fontSize: 18, fontWeight: 700, color: MUTED, width: 52, textAlign: 'right'}}>{Math.round(scanP * 100)}%</div>
            </div>
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12}}>
              {T(colors, 'Couleurs', (
                <div style={{display: 'flex', gap: 10}}>
                  {cfg.b.colors.map((c, i) => <div key={c} style={{textAlign: 'center', opacity: prog(f, colors + i * 4, 8)}}><div style={{width: 58, height: 58, borderRadius: 14, background: c, border: '1.5px solid rgba(15,23,42,0.12)'}} /><div style={{fontSize: 13, fontWeight: 600, color: MUTED, marginTop: 5, fontFamily: '"Geist Mono", ui-monospace, monospace'}}>{c.toUpperCase()}</div></div>)}
                </div>))}
              {T(font, 'Police', (
                <div style={{display: 'flex', alignItems: 'baseline', gap: 12}}><span style={{fontFamily: `${cfg.b.font}, ${FONT}`, fontWeight: 600, fontSize: 56, color: cfg.b.colors[0], lineHeight: 1}}>Aa</span><span style={{fontSize: 24, fontWeight: 700, color: INK}}>{cfg.b.font}</span></div>))}
              {T(tone, 'Ton', (
                <div>
                  <div style={{display: 'flex', flexWrap: 'wrap', gap: 6}}>{cfg.b.tone.map((t, i) => <span key={t} style={{padding: '5px 10px', borderRadius: 99, background: '#F1F3F9', fontSize: 17, fontWeight: 700, color: '#334155', opacity: prog(f, tone + i * 4, 8)}}>{t}</span>)}</div>
                  <div style={{marginTop: 8, fontSize: 17, fontStyle: 'italic', color: '#475569'}}>« {cfg.b.promise} »</div>
                </div>))}
              {T(products, 'Produits et prix', (
                <div style={{display: 'flex', gap: 14, alignItems: 'center'}}>
                  {cfg.b.products.map((p, i) => (
                    <div key={p.name} style={{display: 'flex', alignItems: 'center', gap: 12, padding: 8, paddingRight: 16, borderRadius: 14, border: `1.5px solid ${LINE}`, background: '#fff', opacity: prog(f, products + i * 5, 8), transform: `translateY(${(1 - prog(f, products + i * 5, 8)) * 14}px)`}}>
                      <Img src={staticFile(`media/${p.img}`)} style={{width: 66, height: 66, borderRadius: 10, objectFit: 'cover'}} />
                      <div><div style={{fontWeight: 700, fontSize: 19, color: INK}}>{p.name}</div><div style={{fontSize: 19, fontWeight: 700, color: '#5B3FE4'}}>{p.price}</div></div>
                    </div>))}
                  <div style={{marginLeft: 'auto', fontSize: 17, fontWeight: 700, color: '#16A34A', opacity: prog(f, products + 14, 8)}}>✓ Catalogue synchronisé</div>
                </div>), 3)}
            </div>

            {f >= send2 && (
              <>
                <div style={{marginTop: 22}}><Bubble p={prog(f, send2, 10)}>{cfg.ask2}</Bubble></div>
                <div style={{display: 'flex', alignItems: 'center', gap: 12, margin: '14px 0 12px', opacity: prog(f, send2 + 6, 8)}}>
                  <Logo s={36} />
                  <div style={{fontWeight: 700, fontSize: 22, color: INK}}>{f < ads ? 'Je crée tes pubs à ton image…' : `${cfg.ads.length} pubs prêtes, à tes couleurs ✨`}</div>
                  {f < ads && <Spinner f={f} />}
                </div>
                <div style={{display: 'flex', gap: 16}}>
                  {cfg.ads.map((a, i) => {
                    const at = ads + i * 6; const on = f >= at;
                    return (
                      <div key={i} style={{flex: 1}}>
                        <div style={{position: 'relative', height: 330, borderRadius: 20, overflow: 'hidden', background: '#0B0A0C', boxShadow: on ? '0 0 0 3px #8B6DFF, 0 20px 40px -18px rgba(91,63,228,0.7)' : 'none', transform: `scale(${on ? 0.95 + spring({frame: f - at, fps, config: {damping: 12}}) * 0.05 : 0.95})`}}>
                          {on ? (a.kind === 'video'
                            ? <Sequence from={at} layout="none"><OffthreadVideo src={staticFile(`media/${a.src}`)} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} /></Sequence>
                            : <Img src={staticFile(`media/${a.src}`)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />)
                            : <div style={{position: 'absolute', inset: 0, background: `linear-gradient(${110 + f * 3 + i * 40}deg, #1E1B4B, #4C1D95 40%, #2563EB 70%, #1E1B4B)`}} />}
                          {on && <div style={{position: 'absolute', top: 10, left: 10, display: 'flex', alignItems: 'center', gap: 6, padding: '5px 11px', borderRadius: 99, background: '#fff', fontWeight: 700, fontSize: 16, color: '#15803D'}}><div style={{width: 10, height: 10, borderRadius: 99, background: '#22C55E'}} /> Prête</div>}
                        </div>
                        <div style={{marginTop: 8, textAlign: 'center', fontSize: 18, fontWeight: 700, color: '#334155', opacity: on ? 1 : 0.4}}>{a.label}</div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
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

const Bubble: React.FC<{p: number; children: React.ReactNode}> = ({p, children}) => (
  <div style={{display: 'flex', justifyContent: 'flex-end', opacity: p, transform: `translateY(${(1 - p) * 20}px)`}}>
    <div style={{maxWidth: 640, padding: '14px 22px', borderRadius: '24px 24px 6px 24px', background: '#EEF2FF', border: '1.5px solid #DDE3FF', fontSize: 24, lineHeight: 1.35, color: INK, fontWeight: 500}}>{children}</div>
  </div>
);

export const SplitBrand: React.FC<{cfg: BrandCfg}> = ({cfg}) => <SplitChat cfg={cfg} Window={BrandWindow} />;
