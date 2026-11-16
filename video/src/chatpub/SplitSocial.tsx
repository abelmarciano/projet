// Split-screen / réponse commentaire « réseaux sociaux » : en haut, le calendrier de publications Growthity
// (CalWindow) ou les alertes WhatsApp (WaWindow) ; en bas, l'acteur face caméra (SplitChat).
import React from 'react';
import {Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing} from 'remotion';
import {Cursor, DISPLAY, FONT, GRAD, INK, LINE, Logo, MUTED, SplitCfg, SplitChat, clamp, prog} from './SplitChat';

export type SocialCfg = SplitCfg & {mode: 'cal' | 'wa'; alertAd?: string; newAds?: string[]; bilan?: boolean};

const LIB = ['chat/batch/g3.png', 'chat/jwel/nb1.png', 'chat/roast6/burger.png', 'chat/batch/g5.png', 'chat/jwel/ad-cercle.jpg', 'chat/batch/g6.png'];
const NETS = [{n: 'Instagram', c: '#E1306C'}, {n: 'Facebook', c: '#0866FF'}, {n: 'TikTok', c: '#111'}];
const SLOTS = [2, 4, 7, 9, 11, 14, 16, 18, 21, 23, 25, 28];

const Chrome: React.FC<{title: string; children: React.ReactNode}> = ({title, children}) => (
  <div style={{position: 'absolute', left: 40, top: 140, width: 1000, height: 820, borderRadius: 30, background: '#fff', boxShadow: '0 40px 90px -30px rgba(15,23,42,0.45), 0 0 0 1.5px rgba(15,23,42,0.08)', overflow: 'hidden', fontFamily: FONT}}>
    <div style={{height: 64, display: 'flex', alignItems: 'center', padding: '0 24px', gap: 10, borderBottom: `1.5px solid ${LINE}`, background: '#FAFAFC'}}>
      {['#FF5F57', '#FEBC2E', '#28C840'].map((c) => <div key={c} style={{width: 16, height: 16, borderRadius: 99, background: c}} />)}
      <div style={{flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10, fontWeight: 700, fontSize: 24, color: INK, marginRight: 70}}><Logo s={30} /> Growthity · {title}</div>
    </div>
    {children}
  </div>
);

const CalWindow: React.FC<{cfg: SplitCfg}> = ({cfg}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const C = (k: string) => Math.round((cfg.cues[k] ?? 99) * fps);
  const lib = C('lib'), drag = C('drag'), hour = C('hour'), month = C('month'), ready = C('ready');
  const nets = [C('n1'), C('n2'), C('n3')];
  const cell = 86, gx = 360, gy = 150;
  // la créa n°1 glisse de la bibliothèque vers le mardi 18
  const t = interpolate(f, [drag, drag + 22], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
  const target = {x: gx + 1 * cell, y: gy + 40 + 2 * (cell + 6)};
  const from = {x: 44, y: 120};
  const dx = from.x + (target.x - from.x) * t, dy = from.y + (target.y - from.y) * t;
  const filled = (i: number) => f >= month + i * 2;
  return (
    <Chrome title="Réseaux sociaux">
      {/* bibliothèque */}
      <div style={{position: 'absolute', left: 24, top: 84, width: 300}}>
        <div style={{fontSize: 16, fontWeight: 800, letterSpacing: '0.1em', color: MUTED, marginBottom: 12}}>MES CRÉATIONS</div>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10}}>
          {LIB.map((a, i) => <div key={a} style={{height: 170, borderRadius: 14, overflow: 'hidden', opacity: i === 0 && f >= drag ? 0.25 : prog(f, lib + i * 3, 8), transform: `scale(${0.8 + prog(f, lib + i * 3, 8) * 0.2})`}}><Img src={staticFile(`media/${a}`)} style={{width: '100%', height: '100%', objectFit: 'cover'}} /></div>)}
        </div>
      </div>
      {/* calendrier */}
      <div style={{position: 'absolute', left: gx - 10, top: 84, width: 7 * cell + 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <div style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 30, color: INK}}>Décembre</div>
        <div style={{display: 'flex', gap: 6}}>{NETS.map((n, i) => <span key={n.n} style={{fontSize: 16, fontWeight: 800, color: '#fff', background: f >= nets[i] ? n.c : '#CBD5E1', borderRadius: 7, padding: '3px 8px', transform: `scale(${f >= nets[i] ? 1 + spring({frame: f - nets[i], fps, config: {damping: 8}}) * 0.15 - 0.15 + 0.15 : 1})`}}>{n.n}</span>)}</div>
      </div>
      <div style={{position: 'absolute', left: gx, top: gy, display: 'grid', gridTemplateColumns: `repeat(7, ${cell}px)`, columnGap: 0, rowGap: 6}}>
        {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => <div key={i} style={{textAlign: 'center', fontSize: 16, fontWeight: 700, color: MUTED, height: 34}}>{d}</div>)}
        {Array.from({length: 35}).map((_, i) => {
          const n = i + 1; const si = SLOTS.indexOf(n);
          const show = si > 0 && filled(si);
          return (
            <div key={i} style={{height: cell, borderTop: `1.5px solid ${LINE}`, padding: 4, position: 'relative'}}>
              <div style={{fontSize: 14, fontWeight: 700, color: n > 31 ? '#CBD5E1' : MUTED}}>{n > 31 ? n - 31 : n}</div>
              {show && <div style={{position: 'absolute', left: 5, right: 5, top: 22, bottom: 4, borderRadius: 8, overflow: 'hidden', borderLeft: '4px solid #5B3FE4', transform: `scale(${spring({frame: f - month - si * 2, fps, config: {damping: 11}})})`}}><Img src={staticFile(`media/${LIB[si % LIB.length]}`)} style={{width: '100%', height: '100%', objectFit: 'cover'}} /></div>}
            </div>
          );
        })}
      </div>
      {/* créa glissée */}
      {f >= drag && (
        <div style={{position: 'absolute', left: dx, top: dy, width: t < 1 ? 140 : cell - 10, height: t < 1 ? 170 : cell - 26, borderRadius: 10, overflow: 'hidden', borderLeft: t >= 1 ? '4px solid #5B3FE4' : undefined, boxShadow: t < 1 ? '0 30px 50px -20px rgba(15,23,42,0.6)' : 'none', transform: `rotate(${(1 - t) * 6 * (t > 0 ? 1 : 0)}deg)`, zIndex: 4}}>
          <Img src={staticFile(`media/${LIB[0]}`)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
        </div>
      )}
      {f >= drag && f < drag + 26 && <div style={{position: 'absolute', left: dx + 60, top: dy + 80, zIndex: 5}}><Cursor x={0} y={0} down={t > 0 && t < 1 ? 1 : 0} /></div>}
      {f >= hour && (
        <div style={{position: 'absolute', left: target.x - 40, top: target.y + cell + 4, padding: '8px 14px', borderRadius: 12, backgroundImage: GRAD, color: '#fff', fontWeight: 800, fontSize: 22, zIndex: 6, transform: `scale(${spring({frame: f - hour, fps, config: {damping: 9}})})`}}>Mar. 18 · 18:30</div>
      )}
      {f >= ready && (
        <div style={{position: 'absolute', left: 0, right: 0, bottom: 34, display: 'flex', justifyContent: 'center', zIndex: 7}}>
          <div style={{padding: '14px 28px', borderRadius: 99, background: '#DCFCE7', color: '#15803D', fontWeight: 800, fontSize: 28, transform: `scale(${spring({frame: f - ready, fps, config: {damping: 9}})})`}}>✓ Mois programmé · tout part tout seul</div>
        </div>
      )}
    </Chrome>
  );
};

const Bubble: React.FC<{f: number; at: number; time: string; children: React.ReactNode}> = ({f, at, time, children}) => {
  if (f < at) return null;
  const p = spring({frame: f - at, fps: 30, config: {damping: 13}});
  return (
    <div style={{alignSelf: 'flex-start', maxWidth: '94%', background: '#fff', borderRadius: '6px 22px 22px 22px', padding: '12px 16px 6px', boxShadow: '0 1px 1px rgba(0,0,0,0.12)', fontSize: 23, lineHeight: 1.35, color: '#111', transform: `translateY(${(1 - p) * 30}px)`, opacity: p}}>
      {children}
      <div style={{textAlign: 'right', fontSize: 15, color: '#8A8F94', marginTop: 2}}>{time} ✓✓</div>
    </div>
  );
};

const WaWindow: React.FC<{cfg: SplitCfg}> = ({cfg: base}) => {
  const cfg = base as SocialCfg;
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const C = (k: string) => Math.round((cfg.cues[k] ?? 99) * fps);
  const notif = C('notif'), freq = C('freq'), clic = C('clic'), creas = C('creas'), tap = C('tap'), ready = C('ready'), bilan = C('bilan');
  const hl = (at: number) => (f >= at ? {background: '#FEF3C7', borderRadius: 6, padding: '0 4px'} : {});
  const ads = cfg.newAds ?? ['chat/batch/g2.png', 'chat/jwel/nb2.png', 'chat/batch/g4.png'];
  const press = f >= tap && f < tap + 8;
  // scroll quand la conversation s'allonge
  const scroll = interpolate(f, [ready - 6, ready + 10, bilan - 6, bilan + 10], [0, 110, 110, cfg.bilan ? 260 : 110], clamp);
  return (
    <div style={{position: 'absolute', left: 270, top: 100, width: 540, height: 860, borderRadius: 64, background: '#0B0A0C', padding: 12, boxShadow: '0 40px 90px -30px rgba(15,23,42,0.6)', fontFamily: FONT}}>
      <div style={{width: '100%', height: '100%', borderRadius: 52, overflow: 'hidden', background: '#ECE5DD', display: 'flex', flexDirection: 'column'}}>
        <div style={{background: '#075E54', color: '#fff', padding: '34px 22px 16px', display: 'flex', alignItems: 'center', gap: 12, zIndex: 2}}>
          <div style={{width: 50, height: 50, borderRadius: 25, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Logo s={30} /></div>
          <div><div style={{fontWeight: 800, fontSize: 25}}>Growthity</div><div style={{fontSize: 17, opacity: 0.8}}>Compte professionnel</div></div>
        </div>
        <div style={{flex: 1, overflow: 'hidden', position: 'relative'}}>
          <div style={{position: 'absolute', left: 0, right: 0, top: 0, padding: 16, display: 'flex', flexDirection: 'column', gap: 12, transform: `translateY(${-scroll}px)`}}>
            <div style={{alignSelf: 'center', padding: '4px 12px', borderRadius: 8, background: '#E1F2FB', fontSize: 16, fontWeight: 600, color: '#4B5563'}}>Aujourd’hui</div>
            <Bubble f={f} at={notif} time="09:02">⚠️ Ta pub <b>« {cfg.alertAd ?? 'Bracelet trèfle'} »</b> s’essouffle : <span style={hl(freq)}>fréquence en hausse</span>, <span style={hl(clic)}>clics en baisse</span>.</Bubble>
            {f >= creas && (
              <Bubble f={f} at={creas} time="09:02">
                <div style={{display: 'flex', gap: 6, marginBottom: 6}}>{ads.map((a, i) => <div key={a} style={{width: 130, height: 170, borderRadius: 10, overflow: 'hidden', transform: `scale(${spring({frame: f - creas - i * 4, fps, config: {damping: 11}})})`}}><Img src={staticFile(`media/${a}`)} style={{width: '100%', height: '100%', objectFit: 'cover'}} /></div>)}</div>
                ✨ 3 nouvelles créas sont prêtes.
              </Bubble>
            )}
            {f >= creas + 10 && (
              <div style={{display: 'flex', gap: 8, opacity: prog(f, creas + 10, 8)}}>
                {['Voir', 'Remplacer'].map((b) => <span key={b} style={{flex: 1, textAlign: 'center', background: b === 'Remplacer' && press ? '#D1FAE5' : '#fff', borderRadius: 12, padding: '12px 0', fontWeight: 800, fontSize: 21, color: '#128C4B', transform: `scale(${b === 'Remplacer' && press ? 0.94 : 1})`}}>{b}</span>)}
              </div>
            )}
            <Bubble f={f} at={ready} time="09:03">✅ C’est fait : les nouvelles créas sont en ligne.</Bubble>
            {cfg.bilan && <Bubble f={f} at={bilan} time="Lun. 08:30"><b>👋 Ton bilan de la semaine</b><div style={{fontSize: 21, marginTop: 4}}>💶 Dépenses · 🎯 Résultats · 🏆 Meilleure pub · 💡 Conseil</div></Bubble>}
          </div>
          {f >= tap - 14 && f < tap + 14 && <div style={{position: 'absolute', left: 360, top: 470 - scroll}}><Cursor x={0} y={0} down={press ? 1 : 0} /></div>}
        </div>
      </div>
    </div>
  );
};

export const SplitSocial: React.FC<{cfg: SocialCfg}> = ({cfg}) => <SplitChat cfg={cfg} Window={cfg.mode === 'cal' ? CalWindow : WaWindow} />;
