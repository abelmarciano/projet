import { steps } from "@/data";

export default function Method() {
  return (
    <section className="section bg-mist" id="methode" style={{ paddingTop: 0 }}>
      <div className="wrap">
        <div className="head center">
          <span className="kicker">Notre méthode</span>
          <h2 className="h2">Du clic au rendez-vous, en trois étapes.</h2>
        </div>
        <ol className="steps" style={{ listStyle: "none", padding: 0 }}>
          {steps.map((s, i) => (
            <li key={s.title} className="step">
              <span className="step-num">{i + 1}</span>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
