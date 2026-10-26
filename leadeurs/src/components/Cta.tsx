import { ArrowRight, MessageCircle } from "lucide-react";
import { EMAIL, PHONE_DISPLAY, WHATSAPP_URL } from "@/data";

export default function Cta() {
  return (
    <section className="wrap" aria-label="Contact">
      <div className="cta-band">
        <div style={{ position: "relative", zIndex: 1 }}>
          <span className="kicker">Passez à l'action</span>
          <h2 style={{ marginTop: 14 }}>Prêt à recevoir vos premiers leads ?</h2>
          <p className="sub">
            Indiquez-nous votre secteur, votre zone et votre volume. On revient vers vous sous 24 h avec une proposition chiffrée.
          </p>
        </div>
        <div className="cta-actions">
          <a className="btn btn-primary" href={WHATSAPP_URL} target="_blank" rel="noreferrer">
            Demander un devis gratuit <ArrowRight />
          </a>
          <a className="btn btn-wa" href={WHATSAPP_URL} target="_blank" rel="noreferrer">
            <MessageCircle /> Discuter sur WhatsApp
          </a>
          <div className="cta-contact">
            <span>{PHONE_DISPLAY}</span>
            <span>{EMAIL}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
