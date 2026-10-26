import { ArrowRight, Check, Database, Target } from "lucide-react";
import { WHATSAPP_URL } from "@/data";

const offers = [
  {
    icon: Target,
    dark: false,
    title: "Vente de leads qualifiés",
    text: "Des prospects B2C exclusifs, générés par nos campagnes Google et Meta, vérifiés puis livrés en temps réel.",
    points: ["Critères de qualification définis avec vous", "Volume calé sur votre capacité", "Vous ne payez que les leads conformes"],
    cta: "Recevoir des leads",
  },
  {
    icon: Database,
    dark: true,
    title: "CRM sur-mesure",
    text: "Un outil développé autour de votre process de vente, où vos leads arrivent automatiquement.",
    points: ["Pipeline, relances et automatisations", "Tableaux de bord par commercial", "Livré en 4 à 8 semaines, support inclus"],
    cta: "Parler de mon CRM",
  },
];

export default function Offers() {
  return (
    <section className="section" id="offres">
      <div className="wrap">
        <div className="head center">
          <span className="kicker">Nos offres</span>
          <h2 className="h2">Tout ce qu'il faut pour transformer un clic en client.</h2>
          <p className="sub">Deux expertises complémentaires, à prendre séparément ou ensemble.</p>
        </div>
        <div className="offers">
          {offers.map(({ icon: Icon, ...o }) => (
            <article key={o.title} className={`offer${o.dark ? " dark" : ""}`}>
              <span className="offer-ico"><Icon /></span>
              <h3>{o.title}</h3>
              <p>{o.text}</p>
              <ul>
                {o.points.map((p) => <li key={p}><Check strokeWidth={2.5} /> {p}</li>)}
              </ul>
              <a className="link" href={WHATSAPP_URL} target="_blank" rel="noreferrer">
                {o.cta} <ArrowRight />
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
