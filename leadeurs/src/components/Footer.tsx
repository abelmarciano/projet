import logo from "@/assets/logo.png";
import { EMAIL, WHATSAPP_URL } from "@/data";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer-row">
          <a href="#top" className="brand"><img src={logo} alt="" /><span>LEADEURS</span></a>
          <nav className="footer-links" aria-label="Liens de pied de page">
            <a href="#pourquoi">Pourquoi nous</a>
            <a href="#secteurs">Secteurs</a>
            <a href="#methode">Méthode</a>
            <a href="#avis">Avis</a>
            <a href={WHATSAPP_URL} target="_blank" rel="noreferrer">WhatsApp</a>
            <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
          </nav>
        </div>
        <div className="footer-giant" aria-hidden="true">LEADEURS</div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Leadeurs. Tous droits réservés.</span>
          <span><a href="https://leadeurs.fr/legal">Mentions légales</a> · <a href="https://leadeurs.fr/privacy">Confidentialité</a></span>
        </div>
      </div>
    </footer>
  );
}
