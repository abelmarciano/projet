// Split-screen #5 : Growthity média buyer. Le chat analyse les performances, dit quoi couper, où monter le budget,
// et à quelle heure lancer la prochaine pub.
import React from 'react';
import {Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Cursor, FONT, DISPLAY, GRAD, INK, LINE, Logo, MetaMark, MUTED, SplitCfg, SplitChat, Spinner, clamp, prog} from './SplitChat';

type Row = {name: string; spend: string; cpl: string; trend: 'up' | 'down' | 'flat'; verdict: 'up' | 'cut' | 'keep' | 'fix'; action: string; cue: string};
export type BuyerCfg = SplitCfg & {ask1: string; rows: Row[]; hours: number[]; best: [number, number]; slot: string; tip: string; launch?: number};

const V = {
  up: {bg: '#DCFCE7', fg: '#15803D', icon: '▲'},
  cut: {bg: '#FEE2E2', fg: '#B91C1C', icon: '✕'},
  keep: {bg: '#F1F5F9', fg: '#475569', icon: '='},
  fix: {bg: '#FFEDD5', fg: '#C2410C', icon: '✎'},
};

const BuyerWindow: React.FC<{cfg: SplitCfg}> = ({cfg: base}) => {
  const cfg = base as BuyerCfg;
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const C = (k: string) => Math.round((cfg.cues[k] ?? 99) * fps);
  const ask1 = C('ask1'), send1 = C('send1'), perf = C('perf'), time = C('time'), end = C('end');

  const composer = f >= ask1 && f < send1 ? cfg.ask1.slice(0, Math.round(interpolate(f, [ask1, send1 - 8], [0, cfg.ask1.length], clamp))) : '';
  const typingNow = f >= ask1 && f < send1;
  const home = 1 - prog(f, send1, 12);
  const scroll = prog(f, time - 6, 16) * 190;

  const pts: [number, number, number][] = [[0, 640, 600], [ask1 - 4, 560, 690], [send1 - 12, 900, 715], [send1, 900, 715], [C('cut') + 4, 640, 345], [C('up') + 4, 640, 265], [time + 20, 700, 520], [end + 20, 760, 600]];
  const ease = {...clamp, easing: Easing.inOut(Easing.cubic)};
  const cx = interpolate(f, pts.map((p) => p[0]), pts.map((p) => p[1]), ease);
  const cy = interpolate(f, pts.map((p) => p[0]), pts.map((p) => p[2]), ease);
  const down = f >= send1 - 2 ? interpolate(f, [send1 - 2, send1 + 10], [1, 0], clamp) : 0;
  const maxH = Math.max(...cfg.hours);

  return (
    <div style={{position: 'absolute', left: 40, top: 140, width: 1000, height: 820, borderRadius: 30, background: '#fff', boxShadow: '0 40px 90px -30px rgba(15,23,42,0.45), 0 0 0 1.5px rgba(15,23,42,0.08)', overflow: 'hidden', fontFamily: FONT}}>
      <div style={{height: 64, display: 'flex', alignItems: 'center', padding: '0 24px', gap: 10, borderBottom: `1.5px solid ${LINE}`, background: '#FAFAFC', position: 'relative', zIndex: 3}}>
        {['#FF5F57', '#FEBC2E', '#28C840'].map((c) => <div key={c} style={{width: 16, height: 16, borderRadius: 99, background: c}} />)}
        <div style={{flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10, fontWeight: 700, fontSize: 24, color: INK, marginRight: 70}}><Logo s={30} /> {cfg.brand}</div>
      </div>

      <div style={{position: 'absolute', left: 0, right: 0, top: 200, textAlign: 'center', fontFamily: DISPLAY, fontWeight: 700, fontSize: 50, color: INK, letterSpacing: '-0.02em', opacity: home, transform: `translateY(${(1 - home) * -40}px)`}}>
        Que veux-tu savoir <span style={{backgroundImage: GRAD, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>aujourd'hui</span> ?
        <div style={{display: 'flex', justifyContent: 'center', gap: 12, marginTop: 34, fontFamily: FONT}}>
          {['📊 Mes campagnes', '💡 Mes optimisations', '⏰ Quand lancer'].map((t) => <div key={t} style={{padding: '12px 20px', borderRadius: 99, background: '#F1F3F9', border: `1.5px solid ${LINE}`, fontSize: 22, fontWeight: 600, color: '#334155', letterSpacing: 0}}>{t}</div>)}
        </div>
      </div>

      {f >= send1 && (
        <div style={{position: 'absolute', left: 30, right: 30, top: 64, height: 640, overflow: 'hidden'}}>
          <div style={{transform: `translateY(${-scroll}px)`, paddingTop: 22}}>
            <div style={{display: 'flex', justifyContent: 'flex-end', opacity: prog(f, send1, 10)}}>
              <div style={{padding: '14px 22px', borderRadius: '24px 24px 6px 24px', background: '#EEF2FF', border: '1.5px solid #DDE3FF', fontSize: 24, color: INK, fontWeight: 500}}>{cfg.ask1}</div>
            </div>
            <div style={{display: 'flex', alignItems: 'center', gap: 12, margin: '16px 0 10px', opacity: prog(f, send1 + 6, 8)}}>
              <Logo s={36} />
              <div style={{fontWeight: 700, fontSize: 22, color: INK}}>{f < perf ? 'J’analyse tes performances…' : 'Mes recommandations · 7 derniers jours'}</div>
              {f < perf ? <Spinner f={f} /> : <div style={{marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8, fontSize: 18, color: MUTED, fontWeight: 600}}><MetaMark s={18} /> 4 campagnes</div>}
            </div>
            <div style={{borderRadius: 20, border: `1.5px solid ${LINE}`, overflow: 'hidden', opacity: prog(f, perf - 4, 10)}}>
              <div style={{display: 'flex', padding: '10px 18px', background: '#F8FAFC', fontSize: 15, fontWeight: 700, letterSpacing: '0.06em', color: MUTED, textTransform: 'uppercase'}}>
                <div style={{flex: 1.6}}>Campagne</div><div style={{width: 110, textAlign: 'right'}}>Dépensé</div><div style={{width: 150, textAlign: 'right'}}>Coût / lead</div><div style={{width: 260, textAlign: 'right'}}>Conseil</div>
              </div>
              {cfg.rows.map((r, i) => {
                const p = prog(f, perf + i * 4, 10);
                const vAt = C(r.cue); const on = f >= vAt;
                const v = V[r.verdict];
                const hot = on && (r.verdict === 'up' || r.verdict === 'cut') && f < vAt + 30;
                return (
                  <div key={i} style={{display: 'flex', alignItems: 'center', padding: '13px 18px', borderTop: `1.5px solid ${LINE}`, opacity: p * (on && r.verdict === 'cut' ? 0.75 : 1), background: hot ? (r.verdict === 'up' ? '#F0FDF4' : '#FEF2F2') : '#fff', transform: `translateX(${(1 - p) * 30}px)`}}>
                    <div style={{flex: 1.6, fontWeight: 700, fontSize: 21, color: INK, textDecoration: on && r.verdict === 'cut' ? 'line-through' : 'none', textDecorationColor: '#DC2626', textDecorationThickness: 3}}>{r.name}</div>
                    <div style={{width: 110, textAlign: 'right', fontSize: 20, color: '#334155', fontWeight: 600}}>{r.spend}</div>
                    <div style={{width: 150, textAlign: 'right', fontSize: 20, fontWeight: 700, color: r.trend === 'down' ? '#15803D' : r.trend === 'up' ? '#B91C1C' : '#334155'}}>{r.cpl} {r.trend === 'down' ? '↓' : r.trend === 'up' ? '↑' : '→'}</div>
                    <div style={{width: 260, display: 'flex', justifyContent: 'flex-end'}}>
                      <div style={{display: 'flex', alignItems: 'center', gap: 7, padding: '7px 13px', borderRadius: 11, background: on ? v.bg : '#F1F5F9', color: on ? v.fg : '#94A3B8', fontWeight: 800, fontSize: 17, whiteSpace: 'nowrap', transform: `scale(${on ? 0.9 + spring({frame: f - vAt, fps, config: {damping: 9}}) * 0.1 : 0.9})`}}>
                        {on ? <>{v.icon} {r.action}</> : '…'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* best time */}
            <div style={{marginTop: 14, padding: '16px 20px', borderRadius: 20, border: `2px solid ${f >= time ? '#C4B5FD' : LINE}`, background: f >= time ? '#FAF8FF' : '#fff', opacity: prog(f, time - 4, 10)}}>
              <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12}}>
                <div style={{fontSize: 16, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: MUTED}}>⏰ Quand lancer ta prochaine pub</div>
                <div style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 26, color: '#16A34A', opacity: prog(f, time + 14, 8)}}>{cfg.slot}</div>
              </div>
              <div style={{display: 'flex', alignItems: 'flex-end', gap: 5, height: 110, paddingTop: 20}}>
                {cfg.hours.map((h, i) => {
                  const g = prog(f, time + i * 0.7, 10);
                  const isBest = i >= cfg.best[0] && i <= cfg.best[1];
                  const isLaunch = cfg.launch === i && f >= time + 14;
                  return (
                    <div key={i} style={{flex: 1, height: '100%', position: 'relative', display: 'flex', alignItems: 'flex-end'}}>
                      <div style={{width: '100%', height: `${(h / maxH) * 100 * g}%`, borderRadius: 5, background: isLaunch ? '#16A34A' : isBest && f >= time + 14 ? GRAD : '#DDD6FE'}} />
                      {isLaunch && <div style={{position: 'absolute', left: '50%', bottom: `${(h / maxH) * 100 + 8}%`, transform: `translateX(-50%) scale(${spring({frame: f - time - 14, fps, config: {damping: 10}})})`, padding: '4px 9px', borderRadius: 8, background: '#16A34A', color: '#fff', fontSize: 14, fontWeight: 800, whiteSpace: 'nowrap'}}>🚀 6 h</div>}
                      {isBest && i === cfg.best[0] && f >= time + 14 && <div style={{position: 'absolute', left: 0, bottom: '104%', padding: '3px 8px', borderRadius: 8, background: '#EEEBFF', color: '#5B3FE4', fontSize: 13, fontWeight: 800, whiteSpace: 'nowrap', opacity: prog(f, time + 18, 8)}}>Pic d'audience</div>}
                    </div>
                  );
                })}
              </div>
              <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 14, color: MUTED, fontWeight: 600, marginTop: 6}}>{['0 h', '6 h', '12 h', '18 h', '23 h'].map((t) => <span key={t}>{t}</span>)}</div>
              <div style={{marginTop: 10, fontSize: 19, color: '#334155', fontWeight: 600, opacity: prog(f, time + 20, 10)}}>💡 {cfg.tip}</div>
            </div>

            <div style={{display: 'flex', justifyContent: 'center', marginTop: 14, opacity: prog(f, end, 10), transform: `scale(${0.9 + prog(f, end, 10) * 0.1})`}}>
              <div style={{display: 'flex', alignItems: 'center', gap: 10, padding: '12px 22px', borderRadius: 99, background: INK, color: '#fff', fontWeight: 700, fontSize: 21}}><div style={{width: 12, height: 12, borderRadius: 99, background: '#22C55E', boxShadow: '0 0 10px #22C55E'}} /> Ton média buyer, dispo 24h/24</div>
            </div>
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

export const SplitBuyer: React.FC<{cfg: BuyerCfg}> = ({cfg}) => <SplitChat cfg={cfg} Window={BuyerWindow} />;
