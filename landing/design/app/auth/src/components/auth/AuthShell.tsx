import { useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Logo } from "@/components/Logo";
import { AuthShowcase } from "@/components/auth/AuthShowcase";

/*
 * Cadre commun des pages de connexion, inscription et nouveau mot de passe.
 * Copie exacte de la maquette validée (landing/design/auth/auth.html), styles dans src/styles/gx-auth.css.
 * À gauche le formulaire (charte de la console), à droite l'aperçu de Growthity (masqué sous 980 px).
 */
export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="console-app gx-auth">
      <section className="gxa-left">
        <header className="gxa-head">
          <Link to="/" aria-label="growthity.ai">
            <Logo variant="full" className="gxa-logo" />
          </Link>
          <Link to="/" className="gxa-back">← Retour au site</Link>
        </header>

        <div className="gxa-form-w">
          <div className="gxa-form">{children}</div>
        </div>

        <footer className="gxa-foot">
          <span>© growthity.ai</span>
          <Link to="/cgv">Conditions générales</Link>
          <Link to="/politique-de-confidentialite">Confidentialité</Link>
          <Link to="/faq">Aide</Link>
        </footer>
      </section>

      <AuthShowcase />
    </div>
  );
}

/** Logo Google officiel en couleurs. */
export function GoogleG() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.26 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18A11 11 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.83z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
    </svg>
  );
}

/** Champ mot de passe avec bouton Afficher / Masquer. */
export function PasswordInput(props: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete: string;
  placeholder?: string;
  invalid?: boolean;
  minLength?: number;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className={props.invalid ? "gxa-in gxa-err" : "gxa-in"}>
      <input
        id={props.id}
        className="gxa-pw"
        type={show ? "text" : "password"}
        required
        minLength={props.minLength}
        autoComplete={props.autoComplete}
        placeholder={props.placeholder}
        value={props.value}
        aria-invalid={props.invalid || undefined}
        onChange={(e) => props.onChange(e.target.value)}
      />
      <button type="button" className="gxa-eye" onClick={() => setShow((v) => !v)} aria-pressed={show}>
        {show ? "Masquer" : "Afficher"}
      </button>
    </div>
  );
}

/** Solidité du mot de passe : 0 vide, 1 trop court, 2 correct, 3 solide. */
export function passwordStrength(v: string): 0 | 1 | 2 | 3 {
  if (!v) return 0;
  if (v.length < 8) return 1;
  return /[\d\W_]/.test(v) && v.length >= 10 ? 3 : 2;
}
export const STRENGTH_HINT = [
  "8 caractères minimum, avec un chiffre ou un symbole.",
  "Trop court : 8 caractères minimum.",
  "Correct. Ajoute un chiffre ou un symbole pour le renforcer.",
  "Solide.",
] as const;
