import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {BellRing, Bot, Check, Globe, Megaphone, Phone, Search, Sparkles, Webhook} from 'lucide-react';
import {C, FONT, RADIUS, SHADOW, SHADOW_SOFT} from '../theme';
import {Caption, Logo, ScreenCard, Shot} from '../components/UI';
import {countUp, easeInOut, fadeUp, pop, prog, slowZoom} from '../components/anim';

/* 11 — Comptabilité : factures de ventes, chiffres qui défilent, lignes qui se remplissent */
export const S11Compta: React.FC<{dur: number}> = ({dur}) => {
  const f = useCurrentFrame();
  const crop = {x: 318, y: 140, w: 1562, h: 486};
  const width = 1640;
  const s = width / crop.w;
  const kpis = [337, 721, 1105, 1488];
  const rowsTop = 462, rowH = 32;
  const rows = prog(f, 44, 40) * 5;
  const visible = rowsTop + rows * rowH - crop.y;
  return (
    <AbsoluteFill>
      <Caption lines={['Comptabilité. **Commissions.** Rentabilité.']} start={4} size={66} style={{position: 'absolute', left: 0, right: 0, top: 90}} />
      <ScreenCard zoom={slowZoom(f, dur)} style={{left: (1920 - width) / 2 - 10, top: 250, ...fadeUp(f, 0, 16, 20)}}>
        <div style={{position: 'relative'}}>
          <div style={{clipPath: `inset(0 0 ${(crop.h - Math.min(crop.h, visible)) * s}px 0)`}}>
            <Shot src="parametres-ventes.png" crop={crop} width={width} />
          </div>
          {/* chiffres qui défilent : chaque montant remonte dans sa carte */}
          {kpis.map((x, i) => {
            const t = prog(f, 14 + i * 7, 18);
            const r = {x: x + 6, y: 383, w: 230, h: 30};
            return (
              <div key={i} style={{position: 'absolute', left: (r.x - crop.x) * s, top: (r.y - crop.y) * s, width: r.w * s, height: r.h * s, overflow: 'hidden', background: '#fff'}}>
                <div style={{transform: `translateY(${(1 - t) * r.h * s}px)`, opacity: t}}>
                  <Shot src="parametres-ventes.png" crop={r} width={r.w * s} />
                </div>
              </div>
            );
          })}
        </div>
      </ScreenCard>
    </AbsoluteFill>
  );
};

/* 12 — API & IA : réseau de connexions */
const SOURCES = [
  {l: 'Facebook Ads', i: Megaphone},
  {l: 'Google Ads', i: Search},
  {l: 'Site web', i: Globe},
  {l: 'API / Webhook', i: Webhook},
];
const AIS = [
  {l: 'Claude', i: Sparkles},
  {l: 'ChatGPT', i: Bot},
];
const Node: React.FC<{x: number; y: number; label: string; icon: React.FC<any>; o: number; strong?: boolean}> = ({x, y, label, icon: Icon, o, strong}) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      transform: `translate(-50%, -50%) scale(${0.8 + 0.2 * o})`,
      opacity: o,
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      background: '#fff',
      borderRadius: RADIUS,
      padding: '16px 26px 16px 16px',
      boxShadow: SHADOW_SOFT,
      border: strong ? `2px solid ${C.ocean}` : '2px solid transparent',
      fontFamily: FONT,
      fontWeight: 700,
      fontSize: 30,
      color: C.ink,
      whiteSpace: 'nowrap',
    }}
  >
    <div style={{width: 56, height: 56, borderRadius: RADIUS, background: strong ? C.ocean : C.oceanSoft, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <Icon size={30} color={strong ? '#fff' : C.ocean} strokeWidth={2.2} />
    </div>
    {label}
  </div>
);
export const S12Api: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const center = {x: 960, y: 640};
  const L = SOURCES.map((s, i) => ({...s, x: 330, y: 400 + i * 160}));
  const R = AIS.map((s, i) => ({...s, x: 1600, y: 540 + i * 200}));
  const line = (a: {x: number; y: number}, b: {x: number; y: number}) => {
    const mx = (a.x + b.x) / 2;
    return `M ${a.x} ${a.y} C ${mx} ${a.y}, ${mx} ${b.y}, ${b.x} ${b.y}`;
  };
  const cs = pop(f, fps, 6, 15);
  const notif = pop(f, fps, 96, 16);
  // point le long d'une courbe de Bézier cubique
  const bez = (a: {x: number; y: number}, b: {x: number; y: number}, t: number) => {
    const mx = (a.x + b.x) / 2;
    const P = [a, {x: mx, y: a.y}, {x: mx, y: b.y}, b];
    const u = 1 - t;
    return {
      x: u ** 3 * P[0].x + 3 * u * u * t * P[1].x + 3 * u * t * t * P[2].x + t ** 3 * P[3].x,
      y: u ** 3 * P[0].y + 3 * u * u * t * P[1].y + 3 * u * t * t * P[2].y + t ** 3 * P[3].y,
    };
  };
  return (
    <AbsoluteFill>
      <Caption lines={['Leads reçus en **instantané.**', 'Connecteurs **Claude & ChatGPT.**']} start={4} size={64} style={{position: 'absolute', left: 0, right: 0, top: 60}} />
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        {L.map((n, i) => {
          const t = prog(f, 14 + i * 5, 22, easeInOut);
          return <path key={i} d={line({x: n.x + 150, y: n.y}, {x: center.x - 170, y: center.y})} fill="none" stroke={C.ocean} strokeOpacity={0.45} strokeWidth={3} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - t} />;
        })}
        {R.map((n, i) => {
          const t = prog(f, 50 + i * 6, 22, easeInOut);
          return <path key={i} d={line({x: center.x + 170, y: center.y}, {x: n.x - 120, y: n.y})} fill="none" stroke={C.navy} strokeOpacity={0.4} strokeWidth={3} strokeDasharray="10 8" opacity={t} />;
        })}
        {/* leads qui circulent vers le CRM */}
        {L.map((n, i) =>
          [0, 1].map((k) => {
            const t = ((f - 36 - i * 9 - k * 22) % 44) / 44;
            if (f < 36 + i * 9 + k * 22) return null;
            const p = bez({x: n.x + 150, y: n.y}, {x: center.x - 170, y: center.y}, t);
            return <circle key={`${i}-${k}`} cx={p.x} cy={p.y} r={8} fill={C.ocean} opacity={Math.sin(t * Math.PI)} />;
          }),
        )}
        {R.map((n, i) => {
          if (f < 76) return null;
          const t = ((f - 76 - i * 15) % 50) / 50;
          const p = bez({x: center.x + 170, y: center.y}, {x: n.x - 120, y: n.y}, t);
          return <circle key={i} cx={p.x} cy={p.y} r={7} fill={C.navy} opacity={Math.sin(t * Math.PI)} />;
        })}
      </svg>
      {L.map((n, i) => (
        <Node key={n.l} x={n.x} y={n.y} label={n.l} icon={n.i} o={pop(f, fps, 8 + i * 4)} />
      ))}
      {R.map((n, i) => (
        <Node key={n.l} x={n.x} y={n.y} label={n.l} icon={n.i} o={pop(f, fps, 46 + i * 6)} strong />
      ))}
      <div style={{position: 'absolute', left: center.x, top: center.y, transform: `translate(-50%, -50%) scale(${0.7 + 0.3 * cs})`, opacity: cs, background: '#fff', borderRadius: RADIUS * 1.5, padding: '30px 38px', boxShadow: SHADOW}}>
        <Logo size={58} />
      </div>
      {/* notification d'arrivée de lead */}
      <div
        style={{
          position: 'absolute',
          left: center.x - 260,
          top: 820 + (1 - notif) * 30,
          width: 520,
          opacity: notif,
          display: 'flex',
          gap: 18,
          alignItems: 'center',
          background: '#fff',
          borderRadius: RADIUS,
          padding: '18px 22px',
          boxShadow: SHADOW,
          borderLeft: `6px solid ${C.ocean}`,
          fontFamily: FONT,
        }}
      >
        <BellRing size={36} color={C.ocean} />
        <div>
          <div style={{fontWeight: 700, fontSize: 28, color: C.navy}}>Nouveau lead reçu</div>
          <div style={{fontWeight: 600, fontSize: 23, color: C.ink, opacity: 0.75}}>Facebook Ads · Lyon (69) · à l&apos;instant</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* 13 — Prix */
export const S13Price: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const e = pop(f, fps, 4, 16);
  const v = Math.round(countUp(f, 14, 36, 250));
  const items = ['Sans engagement.', 'Sans frais de mise en service.'];
  return (
    <AbsoluteFill>
      <div
        style={{
          position: 'absolute',
          left: 960 - 520,
          top: 150 + (1 - e) * 40,
          width: 1040,
          opacity: e,
          background: '#fff',
          borderRadius: RADIUS * 2,
          border: `5px solid ${C.ocean}`,
          boxShadow: '0 40px 90px rgba(14,165,233,0.25), 0 10px 30px rgba(0,47,121,0.10)',
          padding: '56px 70px 60px',
          fontFamily: FONT,
          textAlign: 'center',
        }}
      >
        <div style={{display: 'inline-block', background: C.oceanSoft, color: C.ocean, fontWeight: 700, fontSize: 30, padding: '8px 22px', borderRadius: RADIUS}}>Abonnement Classicall</div>
        <div style={{marginTop: 20, color: C.navy, fontWeight: 800, lineHeight: 1, display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 10}}>
          <span style={{fontSize: 210, letterSpacing: -6, fontVariantNumeric: 'tabular-nums'}}>{v}&nbsp;€</span>
          <span style={{fontSize: 68, fontWeight: 700, color: C.ink}}>/mois</span>
        </div>
        <div style={{height: 2, background: 'rgba(14,165,233,0.2)', margin: '38px 0 30px'}} />
        {items.map((t, i) => (
          <div key={t} style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18, fontSize: 48, fontWeight: 700, color: C.ink, marginTop: i ? 18 : 0, ...fadeUp(f, 56 + i * 14)}}>
            <div style={{width: 52, height: 52, borderRadius: 26, background: C.ocean, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <Check size={32} color="#fff" strokeWidth={3.2} />
            </div>
            {t}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

/* 14 — Clôture */
export const S14Close: React.FC<{dur: number}> = ({dur}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const z = slowZoom(f, dur, 1, 1.05);
  const l = pop(f, fps, 2, 16);
  const b = pop(f, fps, 20, 14);
  return (
    <AbsoluteFill style={{transform: `scale(${z})`}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 330, display: 'flex', justifyContent: 'center', opacity: l, transform: `translateY(${(1 - l) * 20}px)`}}>
        <Logo size={130} />
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 590, display: 'flex', justifyContent: 'center', opacity: b, transform: `scale(${0.85 + 0.15 * b})`}}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 26,
            background: C.ocean,
            color: '#fff',
            borderRadius: RADIUS * 1.5,
            padding: '30px 60px',
            fontFamily: FONT,
            fontWeight: 800,
            fontSize: 84,
            letterSpacing: 1,
            boxShadow: '0 24px 60px rgba(14,165,233,0.40)',
          }}
        >
          <div style={{width: 92, height: 92, borderRadius: 46, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <Phone size={50} color={C.ocean} strokeWidth={2.4} />
          </div>
          07 82 17 07 81
        </div>
      </div>
    </AbsoluteFill>
  );
};
