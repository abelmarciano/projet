// Split-screen #2 : le chat Growthity résume les campagnes Meta (dépensé, CPC, CPL…) puis affiche les leads.
// Réutilise la coquille de SplitChat (acteur en bas, sous-titres à la jointure, étapes) avec une fenêtre dédiée.
import React from 'react';
import {Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Check, Cursor, FONT, DISPLAY, GRAD, INK, LINE, Logo, MetaMark, MUTED, SplitCfg, SplitChat, Spinner, clamp, prog} from './SplitChat';

type Kpi = {label: string; value: number; dec: number; unit: string; cue: string; hint: string};
type Lead = {name: string; phone: string; campaign: string; when: string; color: string};
export type StatsCfg = SplitCfg & {ask1: string; ask2: string; period: string; kpis: Kpi[]; leads: Lead[]; leadTotal: number; series: number[]};

const fmt = (v: number, dec: number) => v.toLocaleString('fr-FR', {minimumFractionDigits: dec, maximumFractionDigits: dec}).replace(/ | /g, ' ');

const StatsWindow: React.FC<{cfg: SplitCfg}> = ({cfg: base}) => {
  const cfg = base as StatsCfg;
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const C = (k: string) => Math.round((cfg.cues[k] ?? 99) * fps);
  const ask1 = C('ask1'), send1 = C('send1'), sum = C('sum'), ask2 = C('ask2'), send2 = C('send2'), leads = C('leads');

  // composer text
  const typing = (txt: string, a: number, b: number) => txt.slice(0, Math.round(interpolate(f, [a, b], [0, txt.length], clamp)));
  let composer = '';
  if (f >= ask1 && f < send1) composer = typing(cfg.ask1, ask1, send1 - 8);
  if (f >= ask2 && f < send2) composer = typing(cfg.ask2, ask2, send2 - 6);
  const typingNow = (f >= ask1 && f < send1) || (f >= ask2 && f < send2);

  const home = 1 - prog(f, send1, 12);
  const scroll = prog(f, send2, 18) * 470;

  // cursor
  const pts: [number, number, number][] = [[0, 640, 600], [ask1 - 4, 560, 690], [send1 - 12, 900, 715], [send1, 900, 715], [sum + 30, 700, 420], [ask2 - 4, 560, 690], [send2 - 10, 900, 715], [send2, 900, 715], [leads + 40, 760, 520]];
  const fr = pts.map((p) => p[0]);
  const ease = {...clamp, easing: Easing.inOut(Easing.cubic)};
  const cx = interpolate(f, fr, pts.map((p) => p[1]), ease);
  const cy = interpolate(f, fr, pts.map((p) => p[2]), ease);
  const tap = (a: number) => (f >= a - 2 ? interpolate(f, [a - 2, a + 10], [1, 0], clamp) : 0);
  const down = Math.max(tap(send1), tap(send2));

  const sumIn = prog(f, sum - 6, 12);
  const maxS = Math.max(...cfg.series);

  return (
    <div style={{position: 'absolute', left: 40, top: 140, width: 1000, height: 820, borderRadius: 30, background: '#fff', boxShadow: '0 40px 90px -30px rgba(15,23,42,0.45), 0 0 0 1.5px rgba(15,23,42,0.08)', overflow: 'hidden', fontFamily: FONT}}>
      <div style={{height: 64, display: 'flex', alignItems: 'center', padding: '0 24px', gap: 10, borderBottom: `1.5px solid ${LINE}`, background: '#FAFAFC', position: 'relative', zIndex: 3}}>
        {['#FF5F57', '#FEBC2E', '#28C840'].map((c) => <div key={c} style={{width: 16, height: 16, borderRadius: 99, background: c}} />)}
        <div style={{flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10, fontWeight: 700, fontSize: 24, color: INK, marginRight: 70}}><Logo s={30} /> {cfg.brand}</div>
      </div>

      {/* home title */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 200, textAlign: 'center', fontFamily: DISPLAY, fontWeight: 700, fontSize: 50, color: INK, letterSpacing: '-0.02em', opacity: home, transform: `translateY(${(1 - home) * -40}px)`}}>
        Que veux-tu savoir <span style={{backgroundImage: GRAD, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>aujourd'hui</span> ?
        <div style={{display: 'flex', justifyContent: 'center', gap: 12, marginTop: 34, fontFamily: FONT}}>
          {['📊 Mes campagnes', '👥 Mes leads', '✨ Créer une pub'].map((t) => <div key={t} style={{padding: '12px 20px', borderRadius: 99, background: '#F1F3F9', border: `1.5px solid ${LINE}`, fontSize: 22, fontWeight: 600, color: '#334155', letterSpacing: 0}}>{t}</div>)}
        </div>
      </div>

      {/* thread */}
      {f >= send1 && (
        <div style={{position: 'absolute', left: 30, right: 30, top: 64, height: 640, overflow: 'hidden'}}>
          <div style={{transform: `translateY(${-scroll}px)`, paddingTop: 22}}>
            <Bubble text={cfg.ask1} p={prog(f, send1, 10)} />
            <div style={{display: 'flex', alignItems: 'center', gap: 12, margin: '18px 0 12px', opacity: prog(f, send1 + 6, 8)}}>
              <Logo s={36} />
              <div style={{fontWeight: 700, fontSize: 22, color: INK}}>{f < sum ? 'J’analyse tes campagnes Meta…' : `Résumé de tes campagnes · ${cfg.period}`}</div>
              {f < sum && <Spinner f={f} />}
              {f >= sum && <div style={{marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8, fontSize: 19, color: MUTED, fontWeight: 600}}><MetaMark s={18} /> Meta Ads</div>}
            </div>
            {/* KPI tiles */}
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12, opacity: sumIn, transform: `translateY(${(1 - sumIn) * 20}px)`}}>
              {cfg.kpis.map((k, i) => {
                const a = C(k.cue);
                const cnt = interpolate(f, [a - 4, a + 16], [0, k.value], {...clamp, easing: Easing.out(Easing.cubic)});
                const on = f >= a - 4;
                const pop = spring({frame: f - (a - 4), fps, config: {damping: 12}});
                return (
                  <div key={i} style={{padding: '16px 16px 14px', borderRadius: 20, border: `2px solid ${on ? '#C4B5FD' : LINE}`, background: on ? '#FAF8FF' : '#fff', boxShadow: on ? '0 16px 30px -18px rgba(91,63,228,0.6)' : 'none', transform: `scale(${on ? 0.94 + pop * 0.06 : 0.94})`}}>
                    <div style={{fontSize: 16, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: MUTED, whiteSpace: 'nowrap'}}>{k.label}</div>
                    <div style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 40, color: INK, marginTop: 6, whiteSpace: 'nowrap'}}>{on ? fmt(cnt, k.dec) : '—'}<span style={{fontSize: 26, marginLeft: 3}}>{k.unit}</span></div>
                    <div style={{fontSize: 16, color: '#16A34A', fontWeight: 600, marginTop: 4, opacity: prog(f, a + 10, 8)}}>{k.hint}</div>
                  </div>
                );
              })}
            </div>
            {/* chart */}
            <div style={{marginTop: 14, padding: '16px 20px', borderRadius: 20, border: `1.5px solid ${LINE}`, opacity: prog(f, sum + 4, 12)}}>
              <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 18, fontWeight: 700, color: MUTED, marginBottom: 10}}><span>DÉPENSES PAR JOUR</span><span style={{color: '#6552E8'}}>● Leads</span></div>
              <div style={{display: 'flex', alignItems: 'flex-end', gap: 6, height: 110}}>
                {cfg.series.map((v, i) => {
                  const g = prog(f, sum + 4 + i * 1.2, 10);
                  return <div key={i} style={{flex: 1, height: `${(v / maxS) * 100 * g}%`, borderRadius: 6, background: i >= cfg.series.length - 7 ? GRAD : '#DDD6FE'}} />;
                })}
              </div>
            </div>

            {/* second ask + leads */}
            {f >= send2 && (
              <>
                <div style={{marginTop: 22}}><Bubble text={cfg.ask2} p={prog(f, send2, 10)} /></div>
                <div style={{display: 'flex', alignItems: 'center', gap: 12, margin: '16px 0 10px', opacity: prog(f, send2 + 6, 8)}}>
                  <Logo s={36} />
                  <div style={{fontWeight: 700, fontSize: 22, color: INK}}>{f < leads ? 'Je récupère tes leads…' : `${cfg.leadTotal} leads · les plus récents`}</div>
                  {f < leads ? <Spinner f={f} /> : <div style={{marginLeft: 'auto', padding: '8px 16px', borderRadius: 12, background: '#F1F3F9', fontSize: 18, fontWeight: 700, color: '#334155'}}>⬇ Exporter</div>}
                </div>
                <div style={{borderRadius: 20, border: `1.5px solid ${LINE}`, overflow: 'hidden'}}>
                  {cfg.leads.map((l, i) => {
                    const p = prog(f, leads + i * 5, 10);
                    return (
                      <div key={i} style={{display: 'flex', alignItems: 'center', gap: 14, padding: '12px 18px', borderTop: i ? `1.5px solid ${LINE}` : 'none', opacity: p, transform: `translateX(${(1 - p) * 40}px)`, background: i === 0 && f > leads + 8 ? '#F7FEF9' : '#fff'}}>
                        <div style={{width: 44, height: 44, borderRadius: 99, background: l.color, color: '#fff', fontWeight: 700, fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{l.name.split(' ').map((x) => x[0]).join('')}</div>
                        <div style={{flex: 1.3}}><div style={{fontWeight: 700, fontSize: 21, color: INK}}>{l.name}</div><div style={{fontSize: 17, color: MUTED}}>{l.phone}</div></div>
                        <div style={{flex: 1, fontSize: 17, fontWeight: 600, color: '#5B3FE4', background: '#EEEBFF', padding: '6px 12px', borderRadius: 10, textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{l.campaign}</div>
                        <div style={{width: 110, textAlign: 'right', fontSize: 17, color: MUTED}}>{l.when}</div>
                        <div style={{width: 30}}>{i === 0 ? <div style={{width: 12, height: 12, margin: 'auto', borderRadius: 99, background: '#22C55E', boxShadow: '0 0 10px #22C55E'}} /> : <Check s={22} />}</div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* composer */}
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

const Bubble: React.FC<{text: string; p: number}> = ({text, p}) => (
  <div style={{display: 'flex', justifyContent: 'flex-end', opacity: p, transform: `translateY(${(1 - p) * 20}px)`}}>
    <div style={{maxWidth: 640, padding: '14px 22px', borderRadius: '24px 24px 6px 24px', background: '#EEF2FF', border: '1.5px solid #DDE3FF', fontSize: 24, lineHeight: 1.35, color: INK, fontWeight: 500}}>{text}</div>
  </div>
);

export const SplitStats: React.FC<{cfg: StatsCfg}> = ({cfg}) => <SplitChat cfg={cfg} Window={StatsWindow} />;
