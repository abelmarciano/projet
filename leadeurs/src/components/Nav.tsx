import { useEffect, useState } from "react";
import { BadgeCheck, Clock, Phone } from "lucide-react";
import logo from "@/assets/logo.png";
import { EMAIL, PHONE_DISPLAY, WHATSAPP_URL } from "@/data";

const links = [
  { href: "#offres", label: "Nos offres" },
  { href: "#secteurs", label: "Secteurs" },
  { href: "#methode", label: "Méthode" },
  { href: "#crm", label: "CRM" },
  { href: "#avis", label: "Avis clients" },
  { href: "#faq", label: "FAQ" },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <div className="topbar">
        <div className="wrap topbar-inner">
          <div className="topbar-items">
            <span><BadgeCheck /> Leads 100 % exclusifs et vérifiés</span>
            <span><Clock /> Réponse sous 24 h</span>
          </div>
          <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
        </div>
      </div>
      <header className={`nav${scrolled ? " is-scrolled" : ""}`}>
        <div className="wrap nav-inner">
          <a href="#top" className="brand" aria-label="Leadeurs, accueil">
            <img src={logo} alt="" />
            <span>LEADEURS</span>
          </a>
          <nav className="nav-links" aria-label="Navigation principale">
            {links.map((l) => (
              <a key={l.href} href={l.href}>{l.label}</a>
            ))}
          </nav>
          <div className="nav-actions">
            <span className="nav-phone"><Phone /> {PHONE_DISPLAY}</span>
            <a className="btn btn-primary" href={WHATSAPP_URL} target="_blank" rel="noreferrer">
              Devis gratuit
            </a>
          </div>
        </div>
      </header>
    </>
  );
}
