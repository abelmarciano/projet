const items = [
  { v: "250K+", l: "leads vendus" },
  { v: "2 M€+", l: "investis en publicité" },
  { v: "98 %", l: "de clients satisfaits" },
  { v: "24 h", l: "délai de livraison max." },
  { v: "100 %", l: "exclusifs" },
  { v: "8", l: "secteurs couverts" },
];

export default function Ticker() {
  const group = (hidden: boolean) => (
    <div aria-hidden={hidden || undefined}>
      {items.map((it) => (
        <div key={it.l} className="ticker-item">
          <span className="ticker-dot" />
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
