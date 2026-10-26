import { useState } from "react";
import { ArrowRight, Building2, Hammer, Heater, Home, LampWallUp, Lightbulb, ShowerHead, Sun } from "lucide-react";
import { sectors } from "@/data";

const icons = [Sun, Home, Heater, Hammer, Building2, ShowerHead, Lightbulb, LampWallUp];

export default function Sectors() {
  const [active, setActive] = useState(0);
  const s = sectors[active];
  const Icon = icons[active];

  return (
    <section className="section" id="secteurs" style={{ paddingTop: 0 }}>
      <div className="wrap">
        <div className="reveal" style={{ display: "grid", gap: 24 }}>
          <span className="label"><i />Secteurs</span>
          <h2 className="display h2">Huit marchés.<br /><span className="flame-text">Zéro compromis.</span></h2>
        </div>
        <div className="sectors">
          <div className="sector-list reveal" role="tablist" aria-label="Secteurs couverts">
            {sectors.map((it, i) => (
              <button
                key={it.code}
                role="tab"
                aria-selected={i === active}
                className={`sector-item${i === active ? " is-active" : ""}`}
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                onClick={() => setActive(i)}
              >
                <span className="num">{String(i + 1).padStart(2, "0")}</span>
                <span className="name">{it.name}</span>
                <ArrowRight />
                <span className="detail">{it.detail}</span>
              </button>
            ))}
          </div>
          <div className="sector-show reveal" aria-live="polite">
            <div className="show-card" key={active}>
              <div className="show-icon show-anim"><Icon /></div>
              <div className="show-anim">
                <span className="chip">● Leads exclusifs disponibles</span>
                <h3 style={{ marginTop: 18 }}>{s.name}</h3>
                <p>{s.detail}. Critères de qualification définis avec vous avant la première campagne.</p>
              </div>
              <span className="show-code" aria-hidden="true">{s.code}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
