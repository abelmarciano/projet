import { ArrowRight } from "lucide-react";
import { icon3d } from "@/icons";
import { EMAIL, PHONE_DISPLAY, WHATSAPP_URL } from "@/data";

export default function Final() {
  return (
    <section className="wrap reveal" aria-label="Contact">
      <div className="final-band">
        <img className="rocket" src={icon3d("rocket")} alt="" />
        <h2>Prêt à recevoir<br />vos premiers leads ?</h2>
        <p className="lede">Votre secteur, votre zone, votre volume. On revient vers vous sous 24 h avec une proposition chiffrée.</p>
        <div className="ctas">
          <a className="btn btn-primary" href={WHATSAPP_URL} target="_blank" rel="noreferrer">Démarrer sur WhatsApp <ArrowRight /></a>
          <a className="btn btn-white" href={`mailto:${EMAIL}`}>Envoyer un email</a>
        </div>
        <div className="contacts"><span>{PHONE_DISPLAY}</span><span>{EMAIL}</span></div>
      </div>
    </section>
  );
}
