import { icon3d } from "@/icons";

const items = [
  { i: "chart_increasing", v: "250K+", l: "leads vendus" },
  { i: "rocket", v: "2 M€+", l: "investis en publicité" },
  { i: "star", v: "98 %", l: "de clients satisfaits" },
  { i: "stopwatch", v: "24 h", l: "délai de livraison max." },
  { i: "locked", v: "100 %", l: "exclusifs" },
  { i: "bullseye", v: "8", l: "secteurs couverts" },
];

export default function Ticker() {
  const group = (hidden: boolean) => (
    <div aria-hidden={hidden || undefined}>
      {items.map((it) => (
        <div key={it.l} className="ticker-item">
          <img src={icon3d(it.i)} alt="" />
          <strong>{it.v}</strong>
          <span>{it.l}</span>
        </div>
      ))}
    </div>
  );
  return (
    <section className="ticker" aria-label="Leadeurs en chiffres">
      <div className="ticker-track">{group(false)}{group(true)}</div>
    </section>
  );
}
