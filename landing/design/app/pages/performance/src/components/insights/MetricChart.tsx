import { useEffect, useRef, useState } from "react";
import { Area, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { frMoney, frNumber, frPercent } from "@/lib/format";
import { frLongDate, frShortDate } from "@/components/insights/shared";

export type MetricKey = "spend" | "impressions" | "clicks" | "ctr" | "cpc" | "results";

export const METRICS: { key: MetricKey; label: string; format: (v: number) => string }[] = [
  { key: "spend", label: "Dépense", format: frMoney },
  { key: "impressions", label: "Nombre d'affichages", format: frNumber },
  { key: "clicks", label: "Clics", format: frNumber },
  { key: "ctr", label: "Taux de clic", format: (v) => frPercent(v) },
  { key: "cpc", label: "Coût par clic", format: frMoney },

  { key: "results", label: "Résultats", format: frNumber },
];

export const metricMeta = (k: MetricKey) => METRICS.find((m) => m.key === k)!;

type Point = { date: string } & Record<MetricKey, number>;

const yUnit = (k: MetricKey) => (k === "ctr" ? "%" : k === "spend" || k === "cpc" ? "€" : "");

/** Courbe historique (conservée pour les autres écrans qui l'utilisent). */
export function MetricChart({
  data, metric, secondary,
}: {
  data: Point[];
  metric: MetricKey;
  secondary?: MetricKey | null;
}) {
  const m = metricMeta(metric);
  const s = secondary ? metricMeta(secondary) : null;
  const unit = yUnit(metric);

  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 10, right: s ? 8 : 4, left: -8, bottom: 0 }}>
          <defs>
            <linearGradient id="metricFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.28} />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis
            dataKey="date"
            tickFormatter={frShortDate}
            tickLine={false}
            axisLine={false}
            minTickGap={24}
            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
          />
          <YAxis
            yAxisId="left"
            tickFormatter={(v) => `${metric === "ctr" ? v : frNumber(v)}${unit ? ` ${unit}` : ""}`}
            tickLine={false}
            axisLine={false}
            width={56}
            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
          />
          {s && (
            <YAxis
              yAxisId="right"
              orientation="right"
              tickLine={false}
              axisLine={false}
              width={46}
              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
            />
          )}
          <Tooltip
            cursor={{ stroke: "var(--border)" }}
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null;
              const idx = data.findIndex((d) => d.date === label);
              const cur = data[idx];
              const prev = idx > 0 ? data[idx - 1] : null;
              if (!cur) return null;
              const diff = prev && prev[metric] ? ((cur[metric] - prev[metric]) / Math.abs(prev[metric])) * 100 : null;
              return (
                <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-md">
                  <div className="font-medium capitalize">{frLongDate(String(label))}</div>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-primary" />
                    {m.label} : <strong>{m.format(cur[metric])}</strong>
                  </div>
                  {s && (
                    <div className="mt-0.5 flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-foreground/60" />
                      {s.label} : <strong>{s.format(cur[secondary as MetricKey])}</strong>
                    </div>
                  )}
                  {diff !== null && (
                    <div className="mt-1 text-muted-foreground">
                      {diff > 0 ? "+" : ""}{diff.toFixed(0)} % vs la veille
                    </div>
                  )}
                </div>
              );
            }}
          />
          <Area
            yAxisId="left"
            type="linear"
            dataKey={metric}
            stroke="none"
            fill="url(#metricFill)"
            isAnimationActive={false}
          />
          <Line
            yAxisId="left"
            type="linear"
            dataKey={metric}
            stroke="var(--primary)"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 5, fill: "var(--primary)", stroke: "var(--background)", strokeWidth: 2 }}
            isAnimationActive={false}
            name={m.label}
          />
          {s && (
            <Line
              yAxisId="right"
              type="linear"
              dataKey={secondary as string}
              stroke="var(--foreground)"
              strokeOpacity={0.6}
              strokeWidth={1.5}
              dot={false}
              isAnimationActive={false}
              name={s.label}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ====================================================================
 * Graphique en barres « Évolution jour par jour » (maquette Performance) :
 * période précédente en violet clair, période choisie en violet.
 * ==================================================================== */

export type Granularity = "day" | "week" | "month";

/** Au-delà d'un mois, on regroupe par semaine puis par mois pour garder des barres lisibles. */
export function chartGranularity(days: number): Granularity {
  return days <= 31 ? "day" : days <= 120 ? "week" : "month";
}

type DayPoint = { date: string; spend: number; impressions: number; clicks: number; results: number };

type Bucket = {
  key: string; label: string; title: string;
  spend: number; impressions: number; clicks: number; results: number; ctr: number; cpc: number;
};

const pad = (n: number) => String(n).padStart(2, "0");
const localIso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const monthShort = new Intl.DateTimeFormat("fr-FR", { month: "short" });
const monthLong = new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric" });

function bucketize(points: DayPoint[], g: Granularity): Bucket[] {
  const map = new Map<string, Bucket>();
  for (const p of points) {
    const d = new Date(`${p.date}T00:00:00`);
    if (isNaN(d.getTime())) continue;
    let key = p.date;
    let label = `${d.getDate()}/${d.getMonth() + 1}`;
    let title = frLongDate(p.date);
    if (g === "week") {
      const m = new Date(d);
      m.setDate(d.getDate() - ((d.getDay() + 6) % 7));
      key = localIso(m);
      label = `${m.getDate()}/${m.getMonth() + 1}`;
      title = `Semaine du ${frShortDate(key)}`;
    } else if (g === "month") {
      key = `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
      label = `${monthShort.format(d)} ${String(d.getFullYear()).slice(2)}`;
      title = monthLong.format(d);
    }
    let b = map.get(key);
    if (!b) {
      b = { key, label, title, spend: 0, impressions: 0, clicks: 0, results: 0, ctr: 0, cpc: 0 };
      map.set(key, b);
    }
    b.spend += Number(p.spend) || 0;
    b.impressions += Number(p.impressions) || 0;
    b.clicks += Number(p.clicks) || 0;
    b.results += Number(p.results) || 0;
  }
  const out = [...map.values()].sort((a, b) => a.key.localeCompare(b.key));
  for (const b of out) {
    b.ctr = b.impressions > 0 ? (b.clicks / b.impressions) * 100 : 0;
    b.cpc = b.clicks > 0 ? b.spend / b.clicks : 0;
  }
  return out;
}

function nice(m: number) {
  if (!(m > 0)) return 1;
  const p = Math.pow(10, Math.floor(Math.log10(m)));
  const f = m / p;
  return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * p;
}

function tickText(v: number, metric: MetricKey) {
  const r = Math.round(v * 10) / 10;
  const n = Math.abs(r) >= 1000 ? frNumber(r) : String(r).replace(".", ",");
  const unit = yUnit(metric);
  return unit ? `${n} ${unit}` : n;
}

export function DailyBarChart({
  current, previous, metric, metricLabel, currentLabel, previousLabel, granularity = "day", trimLeading = false,
}: {
  current: DayPoint[];
  /** Période précédente (même durée). Absente : seules les barres de la période s'affichent. */
  previous?: DayPoint[] | null;
  metric: MetricKey;
  /** Libellé affiché dans l'infobulle (ex. « Leads »). */
  metricLabel?: string;
  currentLabel: string;
  previousLabel?: string;
  granularity?: Granularity;
  /** Ignore les jours vides au début (utile pour « Depuis le début »). */
  trimLeading?: boolean;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [W, setW] = useState(700);
  const [hi, setHi] = useState<number | null>(null);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const update = () => setW(Math.max(280, Math.round(el.clientWidth || 700)));
    update();
    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", update);
      return () => window.removeEventListener("resize", update);
    }
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  let cur = bucketize(current, granularity);
  if (trimLeading) {
    const first = cur.findIndex((b) => b.spend > 0 || b.impressions > 0 || b.results > 0);
    cur = first > 0 ? cur.slice(first) : cur;
  }
  const prev = previous && previous.length && granularity === "day" ? bucketize(previous, granularity).slice(-cur.length) : [];
  const all = [...prev, ...cur];
  const split = prev.length;
  const meta = metricMeta(metric);
  const label = metricLabel ?? meta.label;
  const val = (b: Bucket) => Number((b as any)[metric]) || 0;

  const H = 250;
  const L = metric === "spend" || metric === "cpc" ? 56 : 44;
  const R = 12, T = 12, B = 26;
  const n = Math.max(1, all.length);
  const top = nice(Math.max(0, ...all.map(val)) * 1.1);
  const cw = (W - L - R) / n;
  const bw = Math.max(2, cw * 0.6);
  const step = Math.max(1, Math.ceil((n * 40) / Math.max(1, W - L - R)));
  const sx = L + split * cw;

  const hb = hi != null ? all[hi] : null;
  const hPrev = hi != null && hi >= split && split > 0 ? prev[hi - split] : null;

  return (
    <div ref={wrapRef} className="gx-chartw">
      <svg className="gx-chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${label} par ${granularity === "day" ? "jour" : granularity === "week" ? "semaine" : "mois"} : ${currentLabel}`} onMouseLeave={() => setHi(null)}>
        {[0, 1, 2, 3, 4].map((g) => {
          const y = T + (H - T - B) * (1 - g / 4);
          return (
            <g key={g}>
              <line x1={L} x2={W - R} y1={y} y2={y} stroke="var(--gx-line)" strokeDasharray={g ? "3 4" : undefined} />
              <text x={L - 8} y={y + 4} textAnchor="end">{tickText((top * g) / 4, metric)}</text>
            </g>
          );
        })}
        {all.map((b, i) => {
          const v = val(b);
          const bh = ((H - T - B) * v) / top;
          const x = L + i * cw + (cw - bw) / 2;
          return (
            <g key={`${i < split ? "p" : "c"}-${b.key}`}>
              {bh > 0 && (
                <rect
                  x={x.toFixed(1)} y={(H - B - bh).toFixed(1)} width={bw.toFixed(1)} height={bh.toFixed(1)}
                  rx={Math.min(4, bw / 2)} fill="var(--gx-accent)" opacity={i < split ? (hi === i ? 0.5 : 0.35) : hi === i ? 0.85 : 1}
                />
              )}
              {(n - 1 - i) % step === 0 && (
                <text x={(L + i * cw + cw / 2).toFixed(1)} y={H - 8} textAnchor="middle">{b.label}</text>
              )}
              <rect
                x={(L + i * cw).toFixed(1)} y={T} width={cw.toFixed(1)} height={H - T - B}
                fill="transparent" onMouseEnter={() => setHi(i)} onFocus={() => setHi(i)} onBlur={() => setHi(null)}
                tabIndex={-1} aria-label={`${b.title} · ${meta.format(v)}`}
              />
            </g>
          );
        })}
        {split > 0 && (
          <>
            <line x1={sx} x2={sx} y1={T} y2={H - B} stroke="var(--gx-line-2)" />
            <text x={sx + 6} y={T + 10} textAnchor="start">{currentLabel}</text>
            {W > 520 && previousLabel && <text x={sx - 6} y={T + 10} textAnchor="end">{previousLabel}</text>}
          </>
        )}
      </svg>
      {hb && hi != null && (
        <div
          className="gx-ctip"
          style={{ left: `${Math.min(88, Math.max(12, ((L + hi * cw + cw / 2) / W) * 100))}%` }}
          role="status"
        >
          <b>{hb.title}</b>
          <span>{label} : {meta.format(val(hb))}</span>
          {hPrev && <small>{hPrev.title} : {meta.format(val(hPrev))}</small>}
        </div>
      )}
    </div>
  );
}
