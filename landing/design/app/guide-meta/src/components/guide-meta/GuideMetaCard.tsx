import { Link } from "@tanstack/react-router";

/*
 * Carte de la page Connexion : affichée quand Meta n'est pas connecté, ou connecté sans aucun compte publicitaire.
 * Ouvre le guide pas à pas (/guide-meta).
 */
export function GuideMetaCard({ reason }: { reason: "not-connected" | "no-ad-account" }) {
  return (
    <div className="gx-box gx-gmcard">
      <span className="gx-gmcard-i" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z" />
          <path d="M4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5" />
          <path d="M9 8h7M9 11.5h5" />
        </svg>
      </span>
      <div className="gx-gmcard-t">
        <b>
          {reason === "no-ad-account"
            ? "Aucun compte publicitaire sur ton profil Facebook"
            : "Pas encore de compte publicitaire Meta ?"}
        </b>
        <span>
          Notre guide te montre écran par écran comment créer ton portefeuille business, ta Page, ton compte
          publicitaire et ajouter un moyen de paiement. 9 étapes, environ 25 minutes.
        </span>
      </div>
      <Link to="/guide-meta" className="gx-btn gx-pri">Ouvrir le guide</Link>
    </div>
  );
}
