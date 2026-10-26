import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import logo from "@/assets/logo.png";
import { WHATSAPP_URL } from "@/data";

const links = [
  { href: "#secteurs", label: "Secteurs" },
  { href: "#methode", label: "Méthode" },
  { href: "#crm", label: "CRM" },
  { href: "#avis", label: "Avis" },
  { href: "#faq", label: "FAQ" },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
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
        <a className="btn btn-fire" href={WHATSAPP_URL} target="_blank" rel="noreferrer" aria-label="Recevoir des leads">
          <span>Recevoir des leads</span>
          <ArrowRight />
        </a>
      </div>
    </header>
  );
}
