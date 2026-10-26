import { ArrowRight } from "lucide-react";
import LeadFeed from "./LeadFeed";
import { WHATSAPP_URL, stats } from "@/data";

export default function Hero() {
  return (
    <section className="hero" id="top">
      <div className="hero-glow" aria-hidden="true" />
      <div className="wrap">
        <div className="hero-grid">
          <div>
            <span className="eyebrow rise">Leads B2C exclusifs · rénovation énergétique</span>
            <h1 className="rise rise-2">
              Vos prochains clients, <span className="fire-text">livrés</span> <em>en temps réel.</em>
            </h1>
            <p className="lede rise rise-3">
              Des prospects vérifiés et exclusifs, envoyés dans votre CRM à la seconde où ils s'inscrivent.
              Vous ne payez que les leads conformes.
            </p>
            <div className="hero-ctas rise rise-4">
              <a className="btn btn-fire" href={WHATSAPP_URL} target="_blank" rel="noreferrer">
                Démarrer sur WhatsApp <ArrowRight />
              </a>
              <a className="btn btn-ghost" href="#secteurs">Voir les secteurs</a>
            </div>
          </div>
          <div className="rise rise-3">
            <LeadFeed />
          </div>
        </div>
        <div className="hero-stats">
          {stats.map((s) => (
            <div key={s.label}>
              <strong>{s.value}</strong>
              <span>{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
