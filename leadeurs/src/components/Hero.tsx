import { ArrowRight, Check, ShieldCheck, Star, TrendingUp } from "lucide-react";
import LeadFeed from "./LeadFeed";
import { WHATSAPP_URL } from "@/data";

const points = [
  "Leads exclusifs, jamais revendus",
  "Vérifiés un par un avant livraison",
  "Livrés en temps réel dans votre CRM",
];

export default function Hero() {
  return (
    <section className="hero" id="top">
      <div className="wrap hero-grid">
        <div>
          <span className="pill"><b>B2C</b> Spécialiste des leads en rénovation énergétique</span>
          <h1>
            Des leads qualifiés pour faire <span className="hl">grandir</span> votre chiffre d'affaires.
          </h1>
          <p className="sub">
            Leadeurs génère, vérifie et vous livre des prospects prêts à être appelés :
            photovoltaïque, isolation, pompe à chaleur, LED et plus encore.
          </p>
          <ul className="checks">
            {points.map((p) => (
              <li key={p}><Check strokeWidth={3} /> {p}</li>
            ))}
          </ul>
          <div className="hero-ctas">
            <a className="btn btn-primary" href={WHATSAPP_URL} target="_blank" rel="noreferrer">
              Demander un devis gratuit <ArrowRight />
            </a>
            <a className="btn btn-outline" href="#secteurs">Voir nos secteurs</a>
          </div>
          <div className="proof">
            <div className="faces" aria-hidden="true">
              <span>TR</span><span>NK</span><span>MD</span><span>+</span>
            </div>
            <div className="proof-text">
              <strong>
                <span className="stars" aria-hidden="true">
                  {Array.from({ length: 5 }).map((_, i) => <Star key={i} />)}
                </span>
                98 % de clients satisfaits
              </strong>
              Installateurs et entreprises de rénovation partout en France
            </div>
          </div>
        </div>

        <div className="visual">
          <LeadFeed />
          <div className="float float-a">
            <span className="float-ico"><ShieldCheck /></span>
            <div><strong>100 % exclusifs</strong><span>Un lead, un seul client</span></div>
          </div>
          <div className="float float-b">
            <span className="float-ico"><TrendingUp /></span>
            <div><strong>250 000+</strong><span>leads déjà livrés</span></div>
          </div>
          <p className="note">Aperçu animé, données d'exemple.</p>
        </div>
      </div>
    </section>
  );
}
