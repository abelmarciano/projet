import { ArrowUpRight } from "lucide-react";
import { WHATSAPP_URL, sectors } from "@/data";

export default function Sectors() {
  return (
    <section className="section" id="secteurs">
      <div className="wrap split">
        <div className="split-intro">
          <span className="eyebrow">Secteurs</span>
          <h2 className="h2">Huit marchés.<br />Un seul standard.</h2>
          <p className="lede">
            Chaque secteur a ses propres critères de qualification. On les définit avec vous avant la
            première campagne, puis on les applique à chaque lead.
          </p>
          <div>
            <a className="btn btn-ghost" href={WHATSAPP_URL} target="_blank" rel="noreferrer">
              Votre secteur n'est pas listé ?
            </a>
          </div>
        </div>
        <ul className="sector-list">
          {sectors.map((s) => (
            <li key={s.code} className="sector">
              <span className="sector-code">{s.code}</span>
              <div>
                <h3>{s.name}</h3>
                <p>{s.detail}</p>
              </div>
              <span className="sector-arrow" aria-hidden="true"><ArrowUpRight /></span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
