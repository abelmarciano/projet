import { ArrowRight } from "lucide-react";
import { icon3d } from "@/icons";
import { steps } from "@/data";

const art = [
  { icon: "bullseye", tint: "bg-peach" },
  { icon: "check_mark_button", tint: "bg-mint" },
  { icon: "rocket", tint: "bg-lilac" },
];

export default function Method() {
  return (
    <section className="section" id="methode" style={{ paddingTop: 0 }}>
      <div className="wrap">
        <div className="head center reveal">
          <span className="label"><img src={icon3d("gear")} alt="" />Méthode</span>
          <h2 className="h2">Du clic au rendez-vous,<br />en trois étapes.</h2>
        </div>
        <ol className="steps">
          {steps.map((s, i) => (
            <li key={s.title} className="step reveal">
              <div className={`step-art ${art[i].tint}`}><img src={icon3d(art[i].icon)} alt="" /></div>
              <span className="step-num">ÉTAPE {i + 1}</span>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
              {i < steps.length - 1 && <span className="step-arrow" aria-hidden="true"><ArrowRight /></span>}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
