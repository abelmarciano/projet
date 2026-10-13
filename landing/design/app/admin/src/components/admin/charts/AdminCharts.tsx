import { useEffect, useId, useRef, useState, type ReactNode } from "react";

/*
 * Graphiques de l'espace admin (SVG maison, sans dépendance).
 * - Le SVG prend la largeur réelle de son conteneur : le texte garde sa taille sur mobile.
 * - Traits fins, une seule échelle, info-bulle au survol (et au doigt), couleurs de statut réservées.
 * - Couleurs : variables --ad-c-* de gx-admin.css (palette vérifiée daltonisme, clair et sombre).
 */

export const SERIES_COLORS = { ok: "var(--ad-c-ok)", pending: "var(--ad-c-warn)", failed: "var(--ad-c-bad)", neutral: "var(--ad-c-neutral)", pri: "var(--ad-c-pri)" };

function useWidth<T extends HTMLElement>(fallback = 600) {
  const ref = useRef<T>(null);
  const [w, setW] = useState(fallback);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(Math.max(260, Math.round(e.contentRect.width))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, w] as const;
}

/** Pas de graduation « rond » (1, 2, 2,5, 5 × 10ⁿ) pour environ 4 intervalles. */
function niceStep(v: number) {
  const raw = Math.max(v, 1) / 4;
  const p = Math.pow(10, Math.floor(Math.log10(raw)));
  for (const m of [1, 2, 2.5, 5, 10]) if (m * p >= raw) return m * p;
  return 10 * p;
}
function scale(v: number) {
  const step = niceStep(v);
  const max = Math.max(step, Math.ceil(v / step) * step);
  const ticks: number[] = [];
  for (let t = 0; t <= max + step / 2; t += step) ticks.push(t);
  return { max, ticks };
}

function Tip({ x, y, width, children }: { x: number; y: number; width: number; children: ReactNode }) {
  const left = Math.min(Math.max(x, 90), width - 90);
  return <div className="ad-tip" style={{ left, top: y }} role="status">{children}</div>;
}

/* ---------- Courbe (une série) ---------- */
export function AdminLineChart({ data, format, axisFormat, height = 220, label, color = SERIES_COLORS.pri, tipTitle }: {
  data: { label: string; value: number; title?: string }[];
  format: (v: number) => string;
  axisFormat?: (v: number) => string;
  height?: number;
  label: string;
  color?: string;
  tipTitle?: string;
}) {
  const [ref, W] = useWidth<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  if (data.length === 0) return <div className="ad-empty">Pas encore de données.</div>;
  const L = 52, R = 14, T = 16, B = 28, iw = W - L - R, ih = height - T - B;
  const { max, ticks } = scale(Math.max(...data.map((d) => d.value)));
  const n = data.length;
  const x = (i: number) => (n === 1 ? L + iw / 2 : L + (i * iw) / (n - 1));
  const y = (v: number) => T + ih - (v / max) * ih;
  const pts = data.map((d, i) => [x(i), y(d.value)] as const);
  const line = "M" + pts.map((p) => p.join(",")).join("L");
  const area = `${line}L${pts[pts.length - 1][0]},${T + ih}L${pts[0][0]},${T + ih}Z`;
  const last = pts[pts.length - 1];
  const step = n > 1 ? iw / (n - 1) : iw;
  const h = hover != null ? data[hover] : null;
  const prev = hover != null && hover > 0 ? data[hover - 1].value : null;
  const af = axisFormat ?? format;
  return (
    <div className="ad-chart" ref={ref}>
      <svg viewBox={`0 0 ${W} ${height}`} width={W} height={height} role="img" aria-label={label} onMouseLeave={() => setHover(null)}>
        <defs>
          <linearGradient id={`ad-area-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={color} stopOpacity=".14" />
            <stop offset="1" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {ticks.map((t) => (
          <g key={t}>
            <line className={t ? "ad-gl" : "ad-base"} x1={L} x2={W - R} y1={y(t)} y2={y(t)} />
            <text className="ad-ax" x={L - 8} y={y(t) + 4} textAnchor="end">{t ? af(t) : "0"}</text>
          </g>
        ))}
        {data.map((d, i) => <text key={i} className="ad-ax" x={x(i)} y={height - 8} textAnchor="middle">{d.label}</text>)}
        <path d={area} fill={`url(#ad-area-${uid})`} />
        <path d={line} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
        {hover != null && <line x1={pts[hover][0]} x2={pts[hover][0]} y1={T} y2={T + ih} stroke="var(--gx-line-2)" strokeDasharray="3 3" />}
        {pts.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r={i === n - 1 || i === hover ? 5 : 4} fill={color} stroke="var(--gx-surface)" strokeWidth={2} />)}
        <text x={last[0] - 8} y={last[1] - 12} textAnchor="end" style={{ font: "600 12px var(--gx-ui)", fill: "var(--gx-fg)" }}>{format(data[n - 1].value)}</text>
        {pts.map((p, i) => (
          <rect key={i} x={p[0] - step / 2} y={T} width={step} height={ih} fill="transparent"
            onMouseEnter={() => setHover(i)} onTouchStart={() => setHover(i)} />
        ))}
      </svg>
      {h && hover != null && (
        <Tip x={pts[hover][0]} y={pts[hover][1]} width={W}>
          <b>{h.title ?? h.label}</b>
          <div className="ad-row"><span><i className="ad-sw" style={{ background: color }} />{tipTitle ?? "Valeur"}</span><strong>{format(h.value)}</strong></div>
          {prev != null && prev > 0 && (
            <div className="ad-row"><span>vs période précédente</span><strong>{((h.value - prev) / prev * 100 > 0 ? "+" : "") + ((h.value - prev) / prev * 100).toFixed(1).replace(".", ",")} %</strong></div>
          )}
        </Tip>
      )}
    </div>
  );
}

/* ---------- Barres empilées par statut (réussies, en attente, échouées) ---------- */
export type StatusDay = { date: string; ok: number; pending: number; failed: number };
const SEGS = [
  { key: "ok" as const, label: "Réussies", color: SERIES_COLORS.ok },
  { key: "pending" as const, label: "En attente", color: SERIES_COLORS.pending },
  { key: "failed" as const, label: "Échouées", color: SERIES_COLORS.failed },
];

export function StatusLegend() {
  return (
    <div className="ad-legend">
      {SEGS.map((s) => <span key={s.key}><i className="ad-sw" style={{ background: s.color }} />{s.label}</span>)}
    </div>
  );
}

export function AdminStatusBars({ data, height = 220, label }: { data: StatusDay[]; height?: number; label: string }) {
  const [ref, W] = useWidth<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  if (data.length === 0) return <div className="ad-empty">Pas encore de données.</div>;
  const L = 34, R = 6, T = 10, B = 26, iw = W - L - R, ih = height - T - B;
  const totals = data.map((d) => d.ok + d.pending + d.failed);
  const { max, ticks } = scale(Math.max(...totals, 1));
  const bw = iw / data.length;
  const gap = Math.min(4, bw * 0.25);
  const w = Math.max(1, bw - gap);
  const sy = (v: number) => (v / max) * ih;
  const every = Math.max(1, Math.ceil(data.length / Math.max(2, Math.floor(iw / 56))));
  const d = hover != null ? data[hover] : null;
  return (
    <div className="ad-chart" ref={ref}>
      <svg viewBox={`0 0 ${W} ${height}`} width={W} height={height} role="img" aria-label={label} onMouseLeave={() => setHover(null)}>
        {ticks.map((t) => (
          <g key={t}>
            <line className={t ? "ad-gl" : "ad-base"} x1={L} x2={W - R} y1={T + ih - sy(t)} y2={T + ih - sy(t)} />
            <text className="ad-ax" x={L - 6} y={T + ih - sy(t) + 4} textAnchor="end">{Math.round(t)}</text>
          </g>
        ))}
        {hover != null && <rect x={L + hover * bw} y={T} width={bw} height={ih} fill="var(--gx-sunk)" />}
        {data.map((day, i) => {
          const x0 = L + i * bw + gap / 2;
          const total = sy(totals[i]);
          let yb = T + ih;
          const segs = SEGS.filter((s) => day[s.key] > 0);
          return (
            <g key={day.date}>
              <clipPath id={`ad-cp-${uid}-${i}`}><rect x={x0} y={T + ih - total} width={w} height={total + 6} rx={Math.min(3, w / 2)} /></clipPath>
              <g clipPath={`url(#ad-cp-${uid}-${i})`}>
                {segs.map((s, j) => {
                  const hh = sy(day[s.key]);
                  yb -= hh;
                  return (
                    <g key={s.key}>
                      <rect x={x0} y={yb} width={w} height={hh} fill={s.color} />
                      {j < segs.length - 1 && <rect x={x0} y={yb - 1} width={w} height={2} fill="var(--gx-surface)" />}
                    </g>
                  );
                })}
              </g>
            </g>
          );
        })}
        {data.map((day, i) => (i % every === every - 1 || i === data.length - 1) && (i === data.length - 1 || data.length - 1 - i >= every / 2) ? (
          <text key={day.date} className="ad-ax" x={L + i * bw + bw / 2} y={height - 8} textAnchor="middle">
            {new Date(day.date).toLocaleDateString("fr-FR", { day: "numeric", month: "numeric" })}
          </text>
        ) : null)}
        {data.map((day, i) => (
          <rect key={day.date} x={L + i * bw} y={T} width={bw} height={ih} fill="transparent"
            onMouseEnter={() => setHover(i)} onTouchStart={() => setHover(i)} />
        ))}
      </svg>
      {d && hover != null && (
        <Tip x={L + hover * bw + bw / 2} y={20} width={W}>
          <b>{new Date(d.date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}</b>
          {SEGS.map((s) => (
            <div key={s.key} className="ad-row"><span><i className="ad-sw" style={{ background: s.color }} />{s.label}</span><strong>{d[s.key]}</strong></div>
          ))}
          <div className="ad-row ad-tot"><span>Total</span><strong>{d.ok + d.pending + d.failed}</strong></div>
        </Tip>
      )}
    </div>
  );
}

/** Même données en tableau (accessibilité, lecture précise). */
export function StatusTable({ data }: { data: StatusDay[] }) {
  return (
    <div className="ad-tw" style={{ maxHeight: 240, overflowY: "auto" }}>
      <table className="ad-table">
        <thead><tr><th>Jour</th><th>Réussies</th><th>En attente</th><th>Échouées</th><th>Total</th></tr></thead>
        <tbody>
          {[...data].reverse().map((d) => (
            <tr key={d.date}>
              <td>{new Date(d.date).toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" })}</td>
              <td className="ad-num">{d.ok}</td><td className="ad-num">{d.pending}</td><td className="ad-num">{d.failed}</td>
              <td className="ad-num"><b>{d.ok + d.pending + d.failed}</b></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
