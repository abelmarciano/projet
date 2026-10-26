import { ArrowRight } from "lucide-react";
import logo from "@/assets/logo.png";
import { WHATSAPP_URL } from "@/data";

const links = [
  { href: "#pourquoi", label: "Pourquoi nous" },
  { href: "#secteurs", label: "Secteurs" },
  { href: "#methode", label: "Méthode" },
  { href: "#avis", label: "Avis" },
  { href: "#faq", label: "FAQ" },
];

export default function Nav() {
  return (
    <header className="nav">
      <div className="nav-wrap">
        <div className="nav-bar">
          <a href="#top" className="brand" aria-label="Leadeurs, accueil">
            <img src={logo} alt="" />
            <span>LEADEURS</span>
          </a>
          <nav className="nav-links" aria-label="Navigation principale">
            {links.map((l) => <a key={l.href} href={l.href}>{l.label}</a>)}
          </nav>
          <a className="btn btn-flame" href={WHATSAPP_URL} target="_blank" rel="noreferrer">
            Devis gratuit <ArrowRight />
          </a>
        </div>
      </div>
    </header>
  );
}
