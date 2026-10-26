import logo from "@/assets/logo.png";
import { EMAIL, WHATSAPP_URL } from "@/data";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer-top">
          <div style={{ display: "grid", gap: 14, maxWidth: 320 }}>
            <a href="#top" className="brand">
              <img src={logo} alt="" />
              <span>LEADEURS</span>
            </a>
            <p style={{ color: "var(--smoke)", fontSize: 15 }}>
              Leads B2C exclusifs et CRM sur-mesure pour les pros de la rénovation énergétique.
            </p>
          </div>
          <div className="footer-cols">
            <div>
              <b>Offre</b>
              <a href="#secteurs">Leads par secteur</a>
              <a href="#crm">CRM sur-mesure</a>
              <a href="#methode">Méthode</a>
            </div>
            <div>
              <b>Contact</b>
              <a href={WHATSAPP_URL} target="_blank" rel="noreferrer">WhatsApp</a>
              <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
            </div>
            <div>
              <b>Légal</b>
              <a href="https://leadeurs.fr/legal">Mentions légales</a>
              <a href="https://leadeurs.fr/privacy">Confidentialité</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Leadeurs. Tous droits réservés.</span>
          <span>Fait en France</span>
        </div>
      </div>
    </footer>
  );
}
