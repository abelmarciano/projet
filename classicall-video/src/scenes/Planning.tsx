import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {CheckCircle2, Clock, MapPin, Route} from 'lucide-react';
import {C, FONT, RADIUS, SHADOW} from '../theme';
import {Caption, Derived, ScreenCard, Shot} from '../components/UI';
import {easeInOut, fadeUp, prog, slowZoom} from '../components/anim';
import itin from '../data/itineraire.json';

/* 9 — Planning semaine : les RDV apparaissent jour par jour
   Vue recomposée : bandeau des jours (y 131-215) + créneaux 8h30 → 17h (y 455-1068) */
const SLICES = [
  {x: 33, y: 131, w: 1855, h: 84},
  {x: 33, y: 455, w: 1855, h: 600},
];
const PlanningSlices: React.FC<{src: string; derived?: boolean; width: number}> = ({src, derived, width}) => (
  <div>
    {SLICES.map((c, i) => (derived ? <Derived key={i} src={src} crop={c} width={width} /> : <Shot key={i} src={src} crop={c} width={width} />))}
  </div>
);
export const S09Planning: React.FC<{dur: number}> = ({dur}) => {
  const f = useCurrentFrame();
  const width = 1700;
  const s = width / 1855;
  const days = [113, 500, 887, 1275, 1663, 1888];
  const z = slowZoom(f, dur);
  return (
    <AbsoluteFill>
      <Caption lines={['Planning **commercial,**', 'tout est prêt.']} start={4} size={68} style={{position: 'absolute', left: 0, right: 0, top: 40}} />
      <ScreenCard zoom={z} origin="50% 30%" style={{left: (1920 - width) / 2 - 10, top: 235, ...fadeUp(f, 0, 16, 20)}}>
        <div style={{position: 'relative'}}>
          <PlanningSlices src="planning-vide.png" derived width={width} />
          {days.slice(0, -1).map((a, i) => {
            const t = prog(f, 22 + i * 17, 14);
            const b = days[i + 1];
            return (
              <div key={i} style={{position: 'absolute', inset: 0, clipPath: `inset(0 ${(33 + 1855 - b) * s}px 0 ${(a - 33) * s}px)`, opacity: t}}>
                <div style={{transform: `translateY(${(1 - t) * 14}px)`}}>
                  <PlanningSlices src="planning-semaine.png" width={width} />
                </div>
              </div>
            );
          })}
        </div>
      </ScreenCard>
    </AbsoluteFill>
  );
};

/* ---------- Carte de France stylisée ---------- */
const FR: [number, number][] = [
  [2.37, 51.05], [2.55, 51.09], [3.15, 50.78], [4.2, 49.95], [4.85, 50.15], [5.0, 49.8], [5.8, 49.55], [6.36, 49.46], [7.0, 49.15], [8.2, 48.97],
  [7.6, 47.6], [7.0, 47.45], [6.45, 47.0], [6.1, 46.6], [6.15, 46.15], [6.8, 46.4], [6.95, 45.85], [7.15, 45.3], [6.65, 45.05], [7.0, 44.6],
  [6.9, 44.2], [7.55, 43.78], [7.0, 43.55], [6.6, 43.15], [5.9, 43.1], [5.35, 43.3], [4.8, 43.4], [4.15, 43.55], [3.5, 43.28], [3.05, 42.9],
  [3.15, 42.43], [2.5, 42.35], [1.75, 42.5], [1.0, 42.75], [0.0, 42.7], [-0.7, 42.85], [-1.4, 43.05], [-1.78, 43.37], [-1.45, 44.0], [-1.25, 44.65],
  [-1.2, 45.6], [-1.1, 46.2], [-2.15, 46.85], [-2.25, 47.25], [-3.0, 47.55], [-4.35, 47.8], [-4.75, 48.1], [-4.75, 48.45], [-4.2, 48.7], [-3.0, 48.8],
  [-2.0, 48.65], [-1.55, 48.65], [-1.6, 49.2], [-1.9, 49.7], [-1.25, 49.7], [-1.1, 49.35], [0.1, 49.45], [0.6, 49.85], [1.55, 50.2], [1.6, 50.8],
];
const CORSE: [number, number][] = [[9.4, 43.0], [9.55, 42.6], [9.4, 41.4], [9.1, 41.38], [8.6, 41.9], [8.55, 42.4], [9.0, 42.75]];
const COORDS: Record<string, [number, number]> = {
  Villeurbanne: [45.7719, 4.8902], 'Saint-Priest': [45.6957, 4.9437], Vienne: [45.5255, 4.8749], 'Caluire-et-Cuire': [45.7953, 4.8466], Lyon: [45.764, 4.8357],
};
const cityOf = (w: string) => Object.keys(COORDS).find((c) => w.endsWith(c)) as string;

export const S10Optimizer: React.FC<{dur: number}> = ({dur}) => {
  const f = useCurrentFrame();
  // vue France : projection équirectangulaire
  const MW = 1080, MH = 760;
  const fr = (lon: number, lat: number, k: number, lon0: number, lat0: number) => [MW / 2 + (lon - lon0) * Math.cos((46 * Math.PI) / 180) * k, MH / 2 + (lat0 - lat) * k];
  const z = prog(f, 44, 34, easeInOut); // zoom vers la région lyonnaise
  const k = interpolate(z, [0, 1], [72, 1900], {easing: (t) => t * t});
  const lon0 = interpolate(z, [0, 1], [2.5, 4.84]);
  const lat0 = interpolate(z, [0, 1], [46.6, 45.66]);
  const P = (lat: number, lon: number) => fr(lon, lat, k, lon0, lat0);
  const path = (pts: [number, number][]) => pts.map(([lon, lat], i) => `${i ? 'L' : 'M'}${P(lat, lon).join(' ')}`).join(' ') + ' Z';
  const draw = prog(f, 0, 40, easeInOut);
  const pts = itin.waypoints.map((w) => {
    const c = cityOf(w);
    const [x, y] = P(...COORDS[c]);
    return {c, x, y};
  });
  const rhone: [number, number][] = [[45.95, 4.75], [45.85, 4.82], [45.8, 4.83], [45.76, 4.83], [45.7, 4.82], [45.64, 4.83], [45.58, 4.85], [45.525, 4.868], [45.46, 4.81]];
  const legStart = (i: number) => 86 + i * 24;
  const lyon = P(45.764, 4.8357);
  const panel = {x: 1485, y: 96, w: 420, h: 900};
  const pw = 432;
  const totalT = prog(f, 160, 14);
  return (
    <AbsoluteFill>
      <Caption lines={['Optimiseur **intelligent.**', 'Max **2h** de route.']} start={4} size={64} align="left" style={{position: 'absolute', left: 110, top: 60}} />
      <div style={{position: 'absolute', left: 100, top: 250, width: MW, height: MH, background: '#fff', borderRadius: RADIUS, boxShadow: SHADOW, overflow: 'hidden', ...fadeUp(f, 0, 16, 20)}}>
        <svg width={MW} height={MH}>
          <defs>
            <pattern id="dots" width="26" height="26" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.6" fill="rgba(14,165,233,0.16)" />
            </pattern>
          </defs>
          <rect width={MW} height={MH} fill="url(#dots)" />
          <path d={path(FR)} fill={C.oceanSoft} fillOpacity={0.55 * draw} stroke={C.ocean} strokeWidth={3} strokeLinejoin="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - draw} />
          <path d={path(CORSE)} fill={C.oceanSoft} fillOpacity={0.55 * draw} stroke={C.ocean} strokeWidth={3} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - draw} />
          {/* Rhône (visible une fois zoomé) */}
          <path
            d={rhone.map(([la, lo], i) => `${i ? 'L' : 'M'}${P(la, lo).join(' ')}`).join(' ')}
            fill="none"
            stroke="#7DD3FC"
            strokeWidth={10}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={z * 0.8}
          />
          {z < 0.98 && (
            <g opacity={1 - z}>
              {[0, 1].map((i) => {
                const t = ((f + i * 20) % 40) / 40;
                return <circle key={i} cx={lyon[0]} cy={lyon[1]} r={8 + t * 30} fill="none" stroke={C.ocean} strokeWidth={2} opacity={(1 - t) * draw} />;
              })}
              <circle cx={lyon[0]} cy={lyon[1]} r={8} fill={C.navy} opacity={draw} />
            </g>
          )}
          {/* trajets */}
          {pts.slice(0, -1).map((p, i) => {
            const q = pts[i + 1];
            const t = prog(f, legStart(i), 20, easeInOut);
            const mx = (p.x + q.x) / 2 + (q.y - p.y) * 0.12, my = (p.y + q.y) / 2 - (q.x - p.x) * 0.12;
            return (
              <path
                key={i}
                d={`M ${p.x} ${p.y} Q ${mx} ${my} ${q.x} ${q.y}`}
                fill="none"
                stroke={C.ocean}
                strokeWidth={6}
                strokeLinecap="round"
                pathLength={1}
                strokeDasharray="1 1"
                strokeDashoffset={1 - t}
              />
            );
          })}
        </svg>
        {/* points numérotés + étiquettes */}
        {pts.map((p, i) => {
          const a = prog(f, 72 + i * 5, 10);
          const leftSide = p.c === 'Caluire-et-Cuire';
          return (
            <div key={i} style={{position: 'absolute', left: p.x - 24, top: p.y - 24, opacity: a, transform: `scale(${0.6 + 0.4 * a})`}}>
              <div style={{width: 48, height: 48, borderRadius: 24, background: i === pts.length - 1 ? C.navy : C.ocean, color: '#fff', fontFamily: FONT, fontWeight: 700, fontSize: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '4px solid #fff', boxShadow: '0 6px 16px rgba(0,47,121,0.25)'}}>
                {i + 1}
              </div>
              <div style={{position: 'absolute', ...(leftSide ? {right: 58} : {left: 58}), top: 4, fontFamily: FONT, fontWeight: 700, fontSize: 26, color: C.ink, whiteSpace: 'nowrap', background: 'rgba(255,255,255,0.85)', padding: '2px 10px', borderRadius: 8}}>
                {p.c}
              </div>
            </div>
          );
        })}
        {/* distances des tronçons (résultat réel calculé par l'app) */}
        {itin.legs.map((l, i) => {
          const p = pts[i], q = pts[i + 1];
          const a = prog(f, legStart(i) + 14, 10);
          const off = [[50, -30], [50, -10], [-330, -20]][i];
          const x = (p.x + q.x) / 2 + off[0], y = (p.y + q.y) / 2 + off[1];
          return (
            <div key={i} style={{position: 'absolute', left: x, top: y + (1 - a) * 8, opacity: a, display: 'flex', alignItems: 'center', gap: 8, background: '#fff', borderRadius: RADIUS, padding: '8px 14px', boxShadow: '0 6px 18px rgba(0,47,121,0.14)', fontFamily: FONT, fontWeight: 700, fontSize: 24, color: C.navy, whiteSpace: 'nowrap'}}>
              <MapPin size={22} color={C.ocean} /> {l.distance} · {l.duration}
            </div>
          );
        })}
        {/* total */}
        <div style={{position: 'absolute', left: 24, bottom: 24, opacity: totalT, transform: `translateY(${(1 - totalT) * 12}px)`, display: 'flex', alignItems: 'center', gap: 18, background: C.navy, color: '#fff', borderRadius: RADIUS, padding: '16px 24px', fontFamily: FONT, fontWeight: 700, fontSize: 28}}>
          <Route size={30} color="#7DD3FC" /> {itin.distance}
          <Clock size={28} color="#7DD3FC" /> {formatDuration(itin.duration)}
          <CheckCircle2 size={30} color="#86EFAC" /> <span style={{fontWeight: 600}}>moins de 2h</span>
        </div>
      </div>
      {/* le vrai panneau « Itinéraire des rendez-vous » de l'app */}
      <ScreenCard pad={0} style={{left: 1330, top: 125, ...fadeUp(f, 24, 18, 24)}}>
        <Shot src="planning-optimizer.png" crop={panel} width={pw} />
      </ScreenCard>
    </AbsoluteFill>
  );
};

function formatDuration(s: string) {
  const m = parseInt(s, 10);
  return `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, '0')}`;
}
