import { Plus } from "lucide-react";
import { faqs } from "@/data";

export default function Faq() {
  return (
    <section className="section" id="faq" style={{ paddingTop: 0 }}>
      <div className="wrap faq">
        <div className="reveal" style={{ display: "grid", gap: 24, alignContent: "start" }}>
          <span className="label"><i />FAQ</span>
          <h2 className="display h2" style={{ fontSize: "clamp(32px, 4.4vw, 60px)" }}>Vos questions, nos réponses.</h2>
        </div>
        <div className="faq-list reveal">
          {faqs.map((f, i) => (
            <details key={f.q} open={i === 0}>
              <summary>{f.q}<i aria-hidden="true"><Plus /></i></summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
