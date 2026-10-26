import logo from "@/assets/logo.png";
import { EMAIL, PHONE_DISPLAY, WHATSAPP_URL } from "@/data";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer-top">
          <div style={{ display: "grid", gap: 16, alignContent: "start", maxWidth: 340 }}>
            <a href="#top" className="brand">
              <img src={logo} alt="" />
              <span>LEADEURS</span>
            </a>
            <p style={{ fontSize: 15 }}>
              Leads B2C exclusifs et CRM sur-mesure pour les professionnels de la rénovation énergétique.
            </p>
          </div>
          <div>
            <b>Offres</b>
            <a href="#offres">Vente de leads</a>
            <a href="#crm">CRM sur-mesure</a>
            <a href="#methode">Notre méthode</a>
          </div>
          <div>
            <b>Secteurs</b>
            <a href="#secteurs">Photovoltaïque</a>
            <a href="#secteurs">Isolation</a>
            <a href="#secteurs">Pompe à chaleur</a>
          </div>
          <div>
            <b>Contact</b>
            <a href={WHATSAPP_URL} target="_blank" rel="noreferrer">WhatsApp</a>
            <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
            <span style={{ display: "block", fontSize: 15, paddingBlock: 4 }}>{PHONE_DISPLAY}</span>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Leadeurs. Tous droits réservés.</span>
          <span>
            <a href="https://leadeurs.fr/legal">Mentions légales</a> · <a href="https://leadeurs.fr/privacy">Confidentialité</a>
          </span>
        </div>
      </div>
    </footer>
  );
}
