import { ArrowRight } from "lucide-react";
import logo from "@/assets/logo.png";
import { EMAIL, PHONE_DISPLAY, WHATSAPP_URL } from "@/data";

export default function FinalCta() {
  return (
    <section className="section final">
      <div className="final-glow" aria-hidden="true" />
      <div className="wrap final-inner">
        <img src={logo} alt="" />
        <h2>Parlons <span className="fire-text">volume.</span></h2>
        <p className="lede">
          Dites-nous votre secteur, votre zone et votre capacité de traitement. On revient vers vous
          sous 24 h avec une proposition chiffrée.
        </p>
        <div className="hero-ctas">
          <a className="btn btn-fire" href={WHATSAPP_URL} target="_blank" rel="noreferrer">
            Écrire sur WhatsApp <ArrowRight />
          </a>
          <a className="btn btn-ghost" href={`mailto:${EMAIL}`}>Envoyer un email</a>
        </div>
        <div className="contact-line">
          <span>{PHONE_DISPLAY}</span>
          <span>{EMAIL}</span>
        </div>
      </div>
    </section>
  );
}
