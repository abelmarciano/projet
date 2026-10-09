import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";

/*
 * Paramètres : cadre de la maquette validée (landing/design/app/views/parametres.html).
 * Les onglets restent de vraies sous-routes (/parametres/profil, /workspace, …).
 */

export const Route = createFileRoute("/_authenticated/parametres")({
  head: () => ({ meta: [{ title: "Paramètres - growthity.ai" }] }),
  component: SettingsLayout,
});

const nav = [
  { to: "/parametres/profil", label: "Profil" },
  { to: "/parametres/workspace", label: "Workspace" },
  { to: "/parametres/marques", label: "Marques" },
  { to: "/parametres/membres", label: "Membres" },
  { to: "/parametres/securite", label: "Sécurité" },
  { to: "/parametres/facturation", label: "Facturation" },
] as const;

function SettingsLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div className="gx-page">
      <header className="gx-ph">
        <div>
          <h1>Paramètres</h1>
          <p>Profil, espace de travail, marques, équipe et sécurité.</p>
        </div>
        <div className="gx-pa" />
      </header>

      <div className="gx-tabs">
        <nav className="gx-seg" role="tablist" aria-label="Sections des paramètres">
          {nav.map((item) => {
            const active = pathname.startsWith(item.to);
            return (
              <Link key={item.to} to={item.to} role="tab" aria-selected={active}>
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="gx-pane gx-on">
        <Outlet />
      </div>
    </div>
  );
}
