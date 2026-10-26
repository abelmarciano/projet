import { Plus } from "lucide-react";
import { faqs } from "@/data";

export default function Faq() {
  return (
    <section className="section" id="faq" style={{ paddingTop: 0 }}>
      <div className="wrap faq">
        <div style={{ display: "grid", gap: 20, alignContent: "start" }}>
          <span className="eyebrow">Questions fréquentes</span>
          <h2 className="h2">Ce qu'on nous demande avant de signer.</h2>
        </div>
        <div className="faq-list">
          {faqs.map((f, i) => (
            <details key={f.q} open={i === 0}>
              <summary>
                {f.q}
                <i aria-hidden="true"><Plus /></i>
              </summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
