import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {CalendarX, Copy, Euro, FileSpreadsheet, HelpCircle, PhoneMissed, StickyNote, UserX, Users} from 'lucide-react';
import {C, FONT, RADIUS, SHADOW_SOFT, UI_FONT} from '../theme';
import {Caption, Logo, Shot} from '../components/UI';
import {countUp, fadeUp, pop, prog} from '../components/anim';

/* 1 — Ouverture : logo sur le dégradé, ondes douces */
export const S01Opening: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = pop(f, fps, 4, 16);
  const rise = prog(f, 34, 20);
  const dots = Array.from({length: 26}, (_, i) => {
    const x = (i * 739) % 1920;
    const y0 = (i * 397) % 1080;
    return {x, y: (y0 - f * (0.6 + (i % 5) * 0.15) + 1080) % 1080, r: 3 + (i % 4) * 2, o: 0.18 + (i % 3) * 0.08};
  });
  return (
    <AbsoluteFill>
      {dots.map((d, i) => (
        <div key={i} style={{position: 'absolute', left: d.x, top: d.y, width: d.r * 2, height: d.r * 2, borderRadius: '50%', background: C.ocean, opacity: d.o}} />
      ))}
      {[0, 1, 2, 3].map((i) => {
        const t = ((f + i * 22) % 88) / 88;
        const r = 130 + t * 620;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: 960 - r,
              top: 450 - r,
              width: r * 2,
              height: r * 2,
              borderRadius: '50%',
              border: `2px solid ${C.ocean}`,
              opacity: 0.22 * (1 - t) * prog(f, 0, 20),
            }}
          />
        );
      })}
      <div style={{position: 'absolute', left: 0, right: 0, top: 400 - rise * 30, display: 'flex', justifyContent: 'center', opacity: s, transform: `scale(${0.85 + 0.15 * s})`}}>
        <Logo size={120} />
      </div>
      <Caption lines={['Tu ouvres ta **régie** ?']} start={38} size={84} style={{position: 'absolute', left: 0, right: 0, top: 610}} />
    </AbsoluteFill>
  );
};

/* 2 — Problème : cartes désorganisées qui s'entrechoquent */
const MESS = [
  {icon: PhoneMissed, t: 'Rappel oublié', x: 230, y: 150, r: -7},
  {icon: FileSpreadsheet, t: 'leads_final_v3.xlsx', x: 760, y: 95, r: 4},
  {icon: Copy, t: 'Doublon ?', x: 1390, y: 165, r: 8},
  {icon: CalendarX, t: 'RDV en double', x: 330, y: 400, r: 5},
  {icon: HelpCircle, t: 'Qui rappelle M. Martin ?', x: 820, y: 330, r: -4},
  {icon: StickyNote, t: 'Post-it perdu', x: 1450, y: 420, r: -9},
  {icon: Euro, t: 'Commission ?', x: 160, y: 640, r: 9},
  {icon: UserX, t: 'Lead sans suite', x: 1530, y: 660, r: 6},
  {icon: Users, t: '412 leads non traités', x: 760, y: 560, r: -6},
];
export const S02Problem: React.FC<{dur: number}> = ({dur}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 40%, #24315A 0%, #17203A 55%, #0E1630 100%)'}} />
      {MESS.map((m, i) => {
        const e = pop(f, fps, i * 3, 14);
        const from = {x: (i % 2 ? 1 : -1) * 900, y: (i % 3 - 1) * 500};
        // petits chocs : deux cartes voisines se rapprochent puis rebondissent
        const bump = Math.max(0, Math.sin((f - 30 - i * 7) / 9)) ** 6;
        const dir = i % 2 ? -1 : 1;
        const x = m.x + from.x * (1 - e) + Math.sin(f * 0.07 + i) * 14 + dir * bump * 26;
        const y = m.y + from.y * (1 - e) + Math.cos(f * 0.06 + i * 2) * 10;
        const rot = m.r + Math.sin(f * 0.05 + i) * 2.5 + dir * bump * 3;
        const Icon = m.icon;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              transform: `rotate(${rot}deg)`,
              background: '#fff',
              borderRadius: RADIUS,
              padding: '22px 30px',
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              boxShadow: '0 18px 40px rgba(0,0,0,0.35)',
              fontFamily: FONT,
              fontWeight: 600,
              fontSize: 32,
              color: C.ink,
              opacity: e,
              whiteSpace: 'nowrap',
            }}
          >
            <Icon size={34} color={i % 3 === 0 ? C.status.negatif : C.ocean} strokeWidth={2.2} />
            {m.t}
          </div>
        );
      })}
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(14,22,48,0) 55%, rgba(14,22,48,0.92) 85%)'}} />
      <Caption lines={['Trop de leads,', '**zéro organisation.**']} start={26} size={84} color="#fff" accent="#7DD3FC" style={{position: 'absolute', left: 0, right: 0, top: 820}} />
    </AbsoluteFill>
  );
};

/* 3 — Solution : les 4 cartes métriques (vraies captures) avec compteur */
const CARDS = [
  {x: 34, label: 'Leads totaux', value: 186, fmt: (v: number) => String(Math.round(v))},
  {x: 502, label: 'Leads signés', value: 50, fmt: (v: number) => String(Math.round(v))},
  {x: 970, label: 'Taux de conversion', value: 27, fmt: (v: number) => `${Math.round(v)}%`},
  {
    x: 1438,
    label: 'Valeur moyenne',
    value: 17496,
    fmt: (v: number) => new Intl.NumberFormat('fr-FR', {style: 'currency', currency: 'EUR', maximumFractionDigits: 0}).format(Math.round(v)),
  },
];
export const S03Solution: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const S = 2.02; // échelle d'affichage des cartes
  const cw = 448, ch = 62;
  return (
    <AbsoluteFill>
      <Caption lines={['Le meilleur **CRM**', 'pour ta **régie.**']} start={4} size={80} style={{position: 'absolute', left: 0, right: 0, top: 110}} />
      {CARDS.map((c, i) => {
        const d = 22 + i * 12;
        const e = pop(f, fps, d, 16);
        const col = i % 2, row = Math.floor(i / 2);
        const left = 960 - cw * S - 18 + col * (cw * S + 36);
        const top = 420 + row * (ch * S + 40);
        const v = countUp(f, d + 6, 34, c.value);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left,
              top: top + (1 - e) * 24,
              opacity: Math.min(1, e * 1.4),
              borderRadius: RADIUS * 1.2,
              overflow: 'hidden',
              boxShadow: SHADOW_SOFT,
            }}
          >
            <Shot src="dashboard.png" crop={{x: c.x, y: 301, w: cw, h: ch}} width={cw * S} />
            {/* compteur : on remplace la valeur figée par la même valeur animée, même police/couleur que l'app */}
            <div style={{position: 'absolute', left: 9 * S, top: 31 * S, width: 220 * S, height: 24 * S, background: '#fff'}} />
            <div style={{position: 'absolute', left: 11 * S, top: 34.3 * S, fontFamily: UI_FONT, fontWeight: 700, fontSize: 16 * S, lineHeight: 1, color: '#0f1729', fontVariantNumeric: 'tabular-nums'}}>
              {c.fmt(v)}
            </div>
          </div>
        );
      })}
      <div style={{position: 'absolute', left: 0, right: 0, top: 760, textAlign: 'center', fontFamily: FONT, fontWeight: 600, fontSize: 34, color: C.ink, opacity: 0.75, ...fadeUp(f, 80)}}>
        Tableau de bord Classicall
      </div>
    </AbsoluteFill>
  );
};
