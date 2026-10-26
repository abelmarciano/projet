import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import logo from "@/assets/logo.png";

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { label: "Services", href: "/services" },
    { label: "Processus", href: "/process" },
    { label: "Réalisations", href: "/portfolio" },
    { label: "Blog", href: "/blog" },
    { label: "FAQ", href: "/#faq" },
    { label: "Contact", href: "/contact" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 pt-6">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Logo - à gauche */}
        <Link to="/" className="group flex items-center gap-2">
          <motion.div
            className="flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <img src={logo} alt="Leadeurs Logo" className="h-10 w-auto" />
            <span
              className="font-bold text-xl tracking-wide"
              style={{
                background: "linear-gradient(180deg, #FDBC00 0%, #FF8B00 50%, #EC2700 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text"
              }}
            >
              LEADEURS
            </span>
          </motion.div>
        </Link>

        {/* Navigation centrale flottante - style pill with dark glass effect */}
        <motion.nav
          className="hidden md:flex items-center gap-1 px-2 py-2 rounded-full bg-[hsl(220_14%_18%/0.9)] backdrop-blur-xl border border-[hsl(220_12%_25%/0.5)] shadow-2xl"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          {navItems.map((item, index) => (
            <Link
              key={`${item.href}-${item.label}-${index}`}
              to={item.href}
              className="nav-link-gradient relative px-5 py-2.5 text-sm font-medium text-[hsl(220_10%_65%)] hover:text-[hsl(40_15%_95%)] transition-all duration-300 rounded-full hover:bg-[hsl(0_0%_100%/0.05)]"
            >
              {item.label}
            </Link>
          ))}
        </motion.nav>

        {/* CTA - à droite */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Link
            to="/contact"
            className="hidden md:flex items-center gap-2 px-6 py-2.5 rounded-full font-medium text-sm transition-all duration-300 bg-gradient-to-r from-[#FDBC00] via-[#FF8B00] to-[#EC2700] text-white hover:shadow-[0_0_25px_rgba(253,188,0,0.4)] hover:scale-105"
          >
            <span>Parler à un expert</span>
          </Link>
        </motion.div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-2 text-[hsl(40_15%_95%)] hover:text-primary transition-colors rounded-full bg-[hsl(220_14%_18%/0.9)] border border-[hsl(220_12%_25%/0.5)]"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="md:hidden mt-4 mx-auto max-w-sm"
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <div className="rounded-2xl bg-[hsl(220_14%_18%/0.95)] border border-[hsl(220_12%_25%/0.5)] p-4 shadow-2xl">
              <div className="space-y-1">
                {navItems.map((item, index) => (
                  <Link
                    key={`${item.href}-${item.label}-${index}`}
                    to={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-4 py-3 text-base font-medium text-[hsl(220_10%_65%)] hover:text-[hsl(40_15%_95%)] hover:bg-[hsl(0_0%_100%/0.05)] rounded-xl transition-all"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-[hsl(220_12%_25%/0.5)]">
                <Link
                  to="/contact"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block w-full text-center px-6 py-3 rounded-full bg-primary text-primary-foreground font-medium text-sm"
                >
                  Parler à un expert
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
