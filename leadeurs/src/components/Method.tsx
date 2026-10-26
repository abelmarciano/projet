import { steps } from "@/data";

export default function Method() {
  return (
    <section className="section" id="methode" style={{ paddingTop: 0 }}>
      <div className="wrap">
        <div className="method-head">
          <div style={{ display: "grid", gap: 20 }}>
            <span className="eyebrow">Méthode</span>
            <h2 className="h2">Du clic au rendez-vous,<br />en trois temps.</h2>
          </div>
          <p className="lede">Vous ne gérez ni les campagnes, ni les formulaires, ni la vérification. Vous recevez des prospects prêts à être appelés.</p>
        </div>
        <ol className="steps" style={{ listStyle: "none", padding: 0 }}>
          {steps.map((s, i) => (
            <li key={s.title} className="step">
              <span className="step-num">{i + 1}</span>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
              {i < steps.length - 1 && <span className="step-link" aria-hidden="true" />}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
