import { createFileRoute, Link } from "@tanstack/react-router";
import { GuideMeta } from "@/components/guide-meta/GuideMeta";

/* Guide pas à pas : créer son portefeuille business, sa Page, son compte publicitaire et ajouter un paiement. */

export const Route = createFileRoute("/_authenticated/guide-meta")({
  head: () => ({
    meta: [
      { title: "Guide : créer ton compte publicitaire Meta - growthity.ai" },
      { name: "description", content: "Crée ton portefeuille business, ta Page et ton compte publicitaire Meta en 9 étapes, écran par écran." },
      { property: "og:title", content: "Guide : créer ton compte publicitaire Meta - growthity.ai" },
      { property: "og:description", content: "Crée ton compte publicitaire Meta en 9 étapes, écran par écran." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: GuideMetaPage,
});

function GuideMetaPage() {
  return (
    <div className="gx-page gx-gm-page">
      <header className="gx-ph">
        <div>
          <h1>Créer ton compte publicitaire Meta</h1>
          <p>9 étapes, environ 25 minutes. Sur chaque écran, les pastilles violettes montrent où cliquer.</p>
        </div>
        <div className="gx-pa">
          <Link to="/connexions" className="gx-btn">← Retour à Connexion</Link>
        </div>
      </header>
      <GuideMeta />
    </div>
  );
}
