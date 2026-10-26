import { ArrowRight, Check } from "lucide-react";
import { icon3d } from "@/icons";
import { WHATSAPP_URL } from "@/data";

const floaters = ["sun", "house", "light_bulb", "thermometer", "high_voltage", "shower"];

export default function Hero() {
  return (
    <section className="hero" id="top">
      <div className="mesh" aria-hidden="true"><i /><i /><i /></div>
      <div className="wrap hero-inner">
        <div className="floaters" aria-hidden="true">
          {floaters.map((n) => (
            <div key={n} className="fl"><img src={icon3d(n)} alt="" /></div>
          ))}
        </div>
        <span className="pill"><b>EN DIRECT</b> Leads B2C exclusifs, livrés à la seconde</span>
        <h1>
          <span className="line"><span>Vos clients</span></span>
          <span className="line"><span className="grad-text">arrivent tout seuls.</span></span>
        </h1>
        <p className="lede">
          Leadeurs génère, vérifie et livre des prospects prêts à signer, directement dans votre CRM.
          Photovoltaïque, isolation, pompe à chaleur, LED : vous ne payez que les leads conformes.
        </p>
        <div className="ctas">
          <a className="btn btn-primary" href={WHATSAPP_URL} target="_blank" rel="noreferrer">
            Recevoir mes premiers leads <ArrowRight />
          </a>
          <a className="btn btn-white" href="#secteurs">Voir les secteurs</a>
        </div>
        <div className="trust-row">
          <span><Check strokeWidth={3} /> 100 % exclusifs</span>
          <span><Check strokeWidth={3} /> Vérifiés un par un</span>
          <span><Check strokeWidth={3} /> Réponse sous 24 h</span>
        </div>
      </div>
    </section>
  );
}
