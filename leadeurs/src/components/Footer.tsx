import { Link } from "react-router-dom";
import { Mail, MapPin, Linkedin, Twitter, Github } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="section-dark border-t border-[hsl(220_12%_25%)] bg-[hsl(220_12%_14%)]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-12 py-12 sm:py-16 lg:py-20">
        {/* Rich Content Block */}
        <div className="max-w-4xl mx-auto mb-12 sm:mb-16 text-center">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-heading font-bold mb-4 sm:mb-6 text-foreground px-2">
            Votre Agence Web Premium
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-3 sm:mb-4 px-2">
            <strong className="text-foreground">Leadeurs</strong> est une agence web spécialisée dans la <strong className="text-foreground">création de sites internet sur-mesure</strong>, le <strong className="text-foreground">référencement expert</strong>, et le développement d'<strong className="text-foreground">applications web performantes</strong>. Nous accompagnons entreprises et startups dans leur transformation digitale avec des solutions 100% personnalisées : landing pages ultra-converties, sites e-commerce optimisés, CRM sur-mesure, et stratégies d'acquisition digitale multicanal.
          </p>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed px-2">
            Notre approche premium combine <strong className="text-foreground">design signature</strong>, <strong className="text-foreground">code from scratch</strong>, et <strong className="text-foreground">performance technique</strong> (scores Lighthouse 95+) pour garantir des résultats business mesurables : plus de trafic qualifié, meilleures conversions, positions Google top 3.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div>
            <Link to="/" className="inline-block mb-6 group">
              <span className="text-2xl font-heading font-bold text-foreground group-hover:text-primary transition-colors">Leadeurs</span>
            </Link>
            <p className="text-muted-foreground mb-6 leading-relaxed text-sm">
              Agence web premium — Sites sur-mesure, référencement expert, performance garantie.
            </p>
            <div className="flex gap-3">
              <a
                href="https://linkedin.com/company/leadeurs"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Suivez Leadeurs sur LinkedIn"
                className="w-10 h-10 rounded-full glass flex items-center justify-center hover-glow transition-all group"
              >
                <Linkedin className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </a>
              <a
                href="https://twitter.com/leadeurs"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Suivez Leadeurs sur Twitter"
                className="w-10 h-10 rounded-full glass flex items-center justify-center hover-glow transition-all group"
              >
                <Twitter className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </a>
              <a
                href="https://github.com/leadeurs"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Suivez Leadeurs sur Github"
                className="w-10 h-10 rounded-full glass flex items-center justify-center hover-glow transition-all group"
              >
                <Github className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-heading font-semibold text-foreground mb-6">Services</h3>
            <ul className="space-y-3">
              {["Sites sur-mesure", "CRM & Web Apps", "Acquisition & Ads", "Référencement"].map((item) => (
                <li key={item}>
                  <a href="#services" className="text-muted-foreground hover:text-foreground transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-heading font-semibold text-foreground mb-6">Agence</h3>
            <ul className="space-y-3">
              {[
                { label: "Réalisations", href: "#realisations" },
                { label: "Process", href: "#process" },
                { label: "À propos", href: "/about" },
                { label: "Contact", href: "/contact" }
              ].map((item) => (
                <li key={item.label}>
                  <a href={item.href} className="text-muted-foreground hover:text-foreground transition-colors">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-heading font-semibold text-foreground mb-6">Contact</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <a href="mailto:contact@leadeurs.fr" className="text-muted-foreground hover:text-foreground transition-colors">
                  contact@leadeurs.fr
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-muted-foreground">
                  Paris, France
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-border/50 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {currentYear} Leadeurs. Tous droits réservés.
          </p>
          <div className="flex flex-wrap justify-center gap-4 md:gap-6">
            <Link to="/legal" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Mentions légales
            </Link>
            <Link to="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Confidentialité
            </Link>
            <Link to="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              CGV
            </Link>
            <Link to="/cookies" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
