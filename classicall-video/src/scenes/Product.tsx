import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {Check, ClipboardList, History, MessageSquare, Package, User, UserCheck} from 'lucide-react';
import {C, FONT, RADIUS, SHADOW, SHADOW_SOFT} from '../theme';
import {Caption, Chip, Derived, ScreenCard, Shot} from '../components/UI';
import {easeInOut, fadeUp, prog, slowZoom} from '../components/anim';

/* 4 — Statistiques : graphique réel, barres qui montent */
export const S04Stats: React.FC<{dur: number}> = ({dur}) => {
  const f = useCurrentFrame();
  const crop = {x: 33, y: 382, w: 919, h: 258};
  const width = 1640;
  const s = width / crop.w;
  // révélation des barres de bas en haut (zone de tracé y 425 → 594)
  const reveal = interpolate(prog(f, 14, 50, easeInOut), [0, 1], [594, 420]);
  const z = slowZoom(f, dur);
  return (
    <AbsoluteFill>
      <Caption lines={['Statistiques **RDV. Leads. Pose.**']} start={4} size={76} style={{position: 'absolute', left: 0, right: 0, top: 100}} />
      <ScreenCard zoom={z} style={{left: (1920 - width) / 2 - 10, top: 290, ...fadeUp(f, 0, 18, 20)}}>
        <div style={{position: 'relative'}}>
          <Derived src="dashboard-vide.png" crop={crop} width={width} />
          <div style={{position: 'absolute', inset: 0, clipPath: `inset(${(reveal - crop.y) * s}px 0 0 0)`}}>
            <Shot src="dashboard.png" crop={crop} width={width} />
          </div>
        </div>
      </ScreenCard>
    </AbsoluteFill>
  );
};

/* 5 — Tableau des leads : déroulé ligne par ligne, badges de statut qui s'allument */
export const S05Table: React.FC<{dur: number}> = ({dur}) => {
  const f = useCurrentFrame();
  const crop = {x: 17, y: 180, w: 1305, h: 482};
  const width = 1620;
  const s = width / crop.w;
  const header = 49, rowH = 32;
  const rows = Math.floor((crop.h - header) / rowH) + 1;
  const start = 18, per = 4.2;
  const shown = interpolate(f, [start, start + rows * per], [0, rows], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const visibleH = Math.min(crop.h, header + shown * rowH);
  const z = slowZoom(f, dur, 1, 1.05);
  return (
    <AbsoluteFill>
      <Caption lines={['Tous tes **leads,**', 'en un coup d’œil.']} start={4} size={70} style={{position: 'absolute', left: 0, right: 0, top: 50}} />
      <ScreenCard zoom={z} origin="50% 20%" style={{left: (1920 - width) / 2 - 10, top: 260, ...fadeUp(f, 0, 16, 20)}}>
        <div style={{position: 'relative', height: crop.h * s}}>
          <div style={{clipPath: `inset(0 0 ${(crop.h - visibleH) * s}px 0)`}}>
            <Shot src="leads-table.png" crop={crop} width={width} />
          </div>
          {/* ligne de balayage au bord de la révélation */}
          {shown < rows && shown > 0 && (
            <div style={{position: 'absolute', left: 0, right: 0, top: visibleH * s - 2, height: 3, background: C.ocean, boxShadow: `0 0 18px ${C.ocean}`}} />
          )}
          {/* badges qui s'allument un par un */}
          {Array.from({length: rows - 1}, (_, i) => {
            const t0 = start + (i + 1) * per + 2;
            const a = prog(f, t0, 8) * (1 - 0.75 * prog(f, t0 + 10, 14));
            const cy = 245 + i * rowH - crop.y;
            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: (1142 - crop.x) * s,
                  top: (cy - 11.5) * s,
                  width: 162 * s,
                  height: 23 * s,
                  borderRadius: 8,
                  boxShadow: `0 0 0 ${2.5}px rgba(14,165,233,${a}), 0 0 22px rgba(14,165,233,${a * 0.8})`,
                }}
              />
            );
          })}
        </div>
      </ScreenCard>
    </AbsoluteFill>
  );
};

/* 6 — Filtres avancés : les sélections se cochent en cascade */
const FILTER_SHOTS = [
  {src: 'leads-filters-a.png', at: 0},
  {src: 'leads-filters-b.png', at: 40},
  {src: 'leads-filters-c.png', at: 62},
  {src: 'leads-filters-campagnes.png', at: 92},
];
export const S06Filters: React.FC<{dur: number}> = ({dur}) => {
  const f = useCurrentFrame();
  const crop = {x: 711, y: 190, w: 498, h: 700};
  const width = 620;
  const chips = ['Statut', 'Département', 'Campagne', 'Télépro', 'Commercial'];
  return (
    <AbsoluteFill>
      <Caption lines={['Filtre par **statut,**', '**département, campagne…**']} start={4} size={70} align="left" style={{position: 'absolute', left: 130, top: 300}} />
      <div style={{position: 'absolute', left: 130, top: 520, display: 'flex', flexWrap: 'wrap', gap: 16, width: 900}}>
        {chips.map((c, i) => {
          const a = prog(f, 8 + i * 15, 8);
          return (
            <div key={c} style={fadeUp(f, 12 + i * 4)}>
              <Chip active={a} label={c} icon={a > 0.5 ? <Check size={26} strokeWidth={3} /> : undefined} />
            </div>
          );
        })}
      </div>
      <ScreenCard pad={0} zoom={slowZoom(f, dur, 1, 1.04)} style={{left: 1150, top: (1080 - crop.h * (width / crop.w)) / 2, ...fadeUp(f, 0, 16, 20)}}>
        <div style={{position: 'relative'}}>
          {FILTER_SHOTS.map((s, i) => (
            <div key={i} style={{position: i ? 'absolute' : 'relative', inset: 0, opacity: i ? prog(f, s.at, 6) : 1}}>
              <Shot src={s.src} crop={crop} width={width} />
            </div>
          ))}
        </div>
      </ScreenCard>
    </AbsoluteFill>
  );
};

/* 7 — Doublons : zoom sur le badge DOUBLON + infobulle */
export const S07Doublon: React.FC<{dur: number}> = ({dur}) => {
  const f = useCurrentFrame();
  // leads-doublon.png = découpe 1100×330 (px CSS) de l'écran des leads
  const imgW = 1100, imgH = 330;
  const width = 1500;
  const s = width / imgW;
  const zt = prog(f, 30, 45, easeInOut);
  const Z = 1 + 0.32 * zt;
  const origin = {x: 330, y: 130}; // px image, entre le badge et le 2e numéro
  const ring = (t0: number) => prog(f, t0, 10);
  const boxes = [
    {x: 535, y: 52, w: 112, h: 25, t: 46},
    {x: 535, y: 180, w: 112, h: 25, t: 54},
  ];
  // position écran d'un point image après zoom
  const cardL = (1920 - width) / 2, cardT = 330;
  const toScreen = (px: number, py: number) => ({
    x: cardL + 10 + (origin.x + (px - origin.x) * Z) * s,
    y: cardT + 10 + (origin.y + (py - origin.y) * Z) * s,
  });
  const anchor = toScreen(700, 128);
  const tip = prog(f, 70, 14);
  return (
    <AbsoluteFill>
      <Caption lines={['Détection de **doublons**', 'automatique.']} start={4} size={72} style={{position: 'absolute', left: 0, right: 0, top: 70}} />
      <ScreenCard style={{left: cardL, top: cardT, ...fadeUp(f, 0, 16, 20)}}>
        <div style={{width, height: imgH * s, overflow: 'hidden'}}>
          <div style={{transform: `scale(${Z})`, transformOrigin: `${origin.x * s}px ${origin.y * s}px`, position: 'relative'}}>
            <Shot src="leads-doublon.png" crop={{x: 0, y: 0, w: imgW, h: imgH}} width={width} imgStyle={{width: imgW * s * 1.0, height: imgH * s}} />
            {/* anneau sur le badge DOUBLON */}
            <div
              style={{
                position: 'absolute',
                left: 297 * s,
                top: 53 * s,
                width: 62 * s,
                height: 22 * s,
                borderRadius: 6,
                boxShadow: `0 0 0 3px rgba(234,56,76,${ring(36)}), 0 0 24px rgba(234,56,76,${ring(36) * (0.5 + 0.3 * Math.sin(f / 5))})`,
              }}
            />
            {boxes.map((b, i) => (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: b.x * s,
                  top: b.y * s,
                  width: b.w * s,
                  height: b.h * s,
                  borderRadius: 8,
                  border: `3px solid ${C.ocean}`,
                  background: 'rgba(14,165,233,0.08)',
                  opacity: ring(b.t),
                }}
              />
            ))}
            {/* liaison entre les deux numéros identiques */}
            <svg style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}} width={width} height={imgH * s}>
              <path
                d={`M ${652 * s} ${64 * s} C ${700 * s} ${64 * s}, ${700 * s} ${192 * s}, ${652 * s} ${192 * s}`}
                fill="none"
                stroke={C.ocean}
                strokeWidth={3}
                strokeDasharray="8 7"
                opacity={ring(60)}
              />
            </svg>
          </div>
        </div>
      </ScreenCard>
      {/* infobulle colorée */}
      <div
        style={{
          position: 'absolute',
          left: anchor.x + 40 + (1 - tip) * 14,
          top: anchor.y - 80,
          opacity: tip,
          background: '#fff',
          borderRadius: RADIUS,
          boxShadow: SHADOW,
          border: `3px solid ${C.status.negatif}`,
          padding: '20px 28px',
          fontFamily: FONT,
          width: 470,
        }}
      >
        <div style={{fontWeight: 700, fontSize: 32, color: C.status.negatif}}>Doublon détecté</div>
        <div style={{fontWeight: 600, fontSize: 28, color: C.ink, marginTop: 6}}>Même numéro&nbsp;: <span style={{color: C.ocean}}>06 30 54 65 41</span></div>
        <div style={{fontWeight: 500, fontSize: 24, color: C.ink, opacity: 0.7, marginTop: 4}}>Lead déjà créé le 05/10/2026</div>
        <div
          style={{
            position: 'absolute',
            left: -14,
            top: 66,
            width: 28,
            height: 28,
            background: '#fff',
            transform: 'rotate(45deg)',
            boxShadow: '-6px 6px 12px rgba(0,47,121,0.06)',
            borderLeft: `6px solid ${C.status.negatif}`,
            borderBottom: `6px solid ${C.status.negatif}`,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

/* 8 — Fiche lead : sections qui s'ouvrent en accordéon */
const FICHE = [
  {src: 'lead-fiche-1.png', at: 0, chip: 0},
  {src: 'lead-fiche-2.png', at: 40, chip: 1},
  {src: 'lead-fiche-3.png', at: 76, chip: 2},
  {src: 'lead-fiche-4.png', at: 112, chip: 3},
  {src: 'lead-fiche-5.png', at: 148, chip: 4},
];
export const S08Fiche: React.FC<{dur: number}> = ({dur}) => {
  const f = useCurrentFrame();
  const crop = {x: 1151, y: 182, w: 752, h: 898};
  const width = 790;
  const chips = [
    {l: 'Client', i: User},
    {l: 'Assignation', i: UserCheck},
    {l: 'Produits', i: Package},
    {l: 'Commentaires', i: MessageSquare},
    {l: 'Historique', i: History},
  ];
  const current = FICHE.filter((x) => f >= x.at).length - 1;
  return (
    <AbsoluteFill>
      <Caption lines={['Fiche **complète.**', 'Historique **conservé.**']} start={4} size={72} align="left" style={{position: 'absolute', left: 130, top: 290}} />
      <div style={{position: 'absolute', left: 130, top: 510, display: 'flex', flexDirection: 'column', gap: 16}}>
        {chips.map((c, i) => {
          const Icon = c.i;
          const active = i === current ? prog(f, FICHE[i].at, 8) : i < current ? 0 : 0;
          return (
            <div key={c.l} style={{...fadeUp(f, 10 + i * 4), opacity: (i <= current ? 1 : 0.55) * (fadeUp(f, 10 + i * 4).opacity as number)}}>
              <Chip active={active} label={c.l} icon={<Icon size={26} strokeWidth={2.2} />} />
            </div>
          );
        })}
      </div>
      <ScreenCard pad={0} style={{left: 1000, top: (1080 - crop.h * (width / crop.w)) / 2, ...fadeUp(f, 0, 16, 20)}}>
        <div style={{position: 'relative'}}>
          {FICHE.map((s, i) => {
            const t = i ? prog(f, s.at, 9) : 1;
            return (
              <div key={i} style={{position: i ? 'absolute' : 'relative', inset: 0, opacity: t, transform: `translateY(${(1 - t) * 10}px)`}}>
                <Shot src={s.src} crop={crop} width={width} />
              </div>
            );
          })}
        </div>
      </ScreenCard>
      <div style={{position: 'absolute', left: 130, top: 940, display: 'flex', alignItems: 'center', gap: 12, fontFamily: FONT, fontWeight: 600, fontSize: 26, color: C.ink, opacity: 0.7, ...fadeUp(f, 30)}}>
        <ClipboardList size={26} color={C.ocean} /> Chaque action est tracée
      </div>
    </AbsoluteFill>
  );
};

export {SHADOW_SOFT};
