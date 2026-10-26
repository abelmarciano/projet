import { ArrowRight } from "lucide-react";
import logo from "@/assets/logo.png";
import { EMAIL, PHONE_DISPLAY, WHATSAPP_URL } from "@/data";

export default function Final() {
  return (
    <section className="final">
      <div className="final-orb" aria-hidden="true" />
      <div className="wrap final-inner reveal">
        <img src={logo} alt="" />
        <h2 className="display">Allumez<br /><span className="flame-text">la machine.</span></h2>
        <p className="lede center">Votre secteur, votre zone, votre volume. On revient vers vous sous 24 h avec une proposition chiffrée.</p>
        <div className="hero-ctas" style={{ animation: "none" }}>
          <a className="btn btn-flame" href={WHATSAPP_URL} target="_blank" rel="noreferrer">Démarrer sur WhatsApp <ArrowRight /></a>
          <a className="btn btn-glass ring" href={`mailto:${EMAIL}`}>Envoyer un email</a>
        </div>
        <div className="contacts"><span>{PHONE_DISPLAY}</span><span>{EMAIL}</span></div>
      </div>
    </section>
  );
}
