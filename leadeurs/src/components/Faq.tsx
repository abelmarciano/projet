import { Plus } from "lucide-react";
import { PHONE_DISPLAY, faqs } from "@/data";

export default function Faq() {
  return (
    <section className="section" id="faq">
      <div className="wrap faq">
        <div className="faq-aside">
          <span className="kicker">FAQ</span>
          <h2 className="h2">Les questions qu'on nous pose le plus.</h2>
          <div className="help">
            <strong>Une autre question ?</strong>
            <p>Notre équipe vous répond directement, sous 24 h maximum.</p>
            <p style={{ color: "var(--navy)", fontWeight: 700, userSelect: "all" }}>{PHONE_DISPLAY}</p>
          </div>
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
