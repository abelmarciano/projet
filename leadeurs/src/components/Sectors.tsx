import { Building2, Hammer, Heater, Home, LampWallUp, Lightbulb, ShowerHead, Sun } from "lucide-react";
import { sectors } from "@/data";

const icons = [Sun, Home, Heater, Hammer, Building2, ShowerHead, Lightbulb, LampWallUp];

export default function Sectors() {
  return (
    <section className="section bg-mist" id="secteurs">
      <div className="wrap">
        <div className="head center">
          <span className="kicker">Secteurs couverts</span>
          <h2 className="h2">Des leads dans les marchés qui comptent.</h2>
          <p className="sub">Chaque secteur a ses propres critères de qualification, appliqués à chaque prospect avant livraison.</p>
        </div>
        <div className="sectors">
          {sectors.map((s, i) => {
            const Icon = icons[i];
            return (
              <article key={s.code} className="sector">
                <span className="sector-ico"><Icon /></span>
                <h3>{s.name}</h3>
                <p>{s.detail}</p>
                <span className="badge">Exclusif</span>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
