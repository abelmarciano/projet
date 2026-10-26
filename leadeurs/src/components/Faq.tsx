import { Plus } from "lucide-react";
import { icon3d } from "@/icons";
import { PHONE_DISPLAY, faqs } from "@/data";

export default function Faq() {
  return (
    <section className="section" id="faq" style={{ paddingTop: 0 }}>
      <div className="wrap faq">
        <div className="head reveal" style={{ alignContent: "start" }}>
          <span className="label" style={{ justifySelf: "start" }}><img src={icon3d("envelope")} alt="" />FAQ</span>
          <h2 className="h2" style={{ fontSize: "clamp(32px, 4.2vw, 54px)" }}>Vos questions, nos réponses.</h2>
          <div className="help">
            <img src={icon3d("telephone_receiver")} alt="" />
            <div>
              <strong>Une autre question ?</strong>
              <span>{PHONE_DISPLAY}</span>
            </div>
          </div>
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
