const items = [
  { value: "250K", suffix: "+", label: "leads vendus" },
  { value: "2 M€", suffix: "+", label: "investis en publicité" },
  { value: "98", suffix: " %", label: "de clients satisfaits" },
  { value: "24", suffix: " h", label: "délai de livraison max." },
];

export default function Stats() {
  return (
    <section className="stats" aria-label="Leadeurs en chiffres">
      <div className="wrap stats-grid">
        {items.map((s) => (
          <div key={s.label} className="stat">
            <strong>{s.value}<em>{s.suffix}</em></strong>
            <span>{s.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
