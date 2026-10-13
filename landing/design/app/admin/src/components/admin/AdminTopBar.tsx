import { useState, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { ChevronRight, Menu, Search } from "lucide-react";
import { AdminNotificationBell } from "./AdminNotificationBell";
import { ThemeToggle } from "@/components/ThemeToggle";
import { findAdminSection, useAdminNav } from "./AdminNav";

type Crumb = { label: string; to?: string; params?: Record<string, string> };

/**
 * Barre du haut commune à toutes les pages admin (fil d'Ariane, recherche de client, alertes, thème)
 * suivie de l'en-tête de page (titre, sous-titre, actions). Même signature qu'avant : title, subtitle, actions.
 */
export function AdminTopBar({ title, subtitle, actions, crumbs, hideHeading }: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  /** Fil d'Ariane explicite (ex. fiche client). Sinon déduit du menu. */
  crumbs?: Crumb[];
  /** La page affiche son propre en-tête (ex. fiche client) : pas de grand titre. */
  hideHeading?: boolean;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const { open, setOpen } = useAdminNav();
  const [q, setQ] = useState("");
  const section = findAdminSection(pathname);
  const trail: Crumb[] = crumbs ?? (section
    ? (section.group.label === section.item.label ? [{ label: title }] : [{ label: section.group.label }, { label: title }])
    : [{ label: title }]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const v = q.trim();
    void navigate({ to: "/admin/workspaces", search: v ? { q: v } : {} });
  };

  return (
    <>
      <header className="ad-top">
        <button type="button" className="ad-ib ad-burger" aria-label="Ouvrir le menu" aria-expanded={open} aria-controls="ad-side" onClick={() => setOpen(!open)}>
          <Menu className="ad-i" aria-hidden />
        </button>
        <nav className="ad-crumb" aria-label="Fil d'Ariane">
          {trail.map((c, i) => {
            const last = i === trail.length - 1;
            const hide = !last && trail.length > 1 ? "ad-hide-m" : undefined;
            return (
              <span key={i} className={hide} style={{ display: "inline-flex", alignItems: "center", gap: 6, minWidth: 0 }}>
                {last ? <b>{c.label}</b> : c.to ? <Link to={c.to} params={c.params as never}>{c.label}</Link> : <span>{c.label}</span>}
                {!last && <ChevronRight className="ad-i" aria-hidden style={{ width: 14, height: 14 }} />}
              </span>
            );
          })}
        </nav>
        <form className="ad-search" role="search" onSubmit={submit}>
          <Search className="ad-i" aria-hidden />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Chercher un client, un e-mail…" aria-label="Chercher un client" />
        </form>
        <Link to="/admin/workspaces" className="ad-ib ad-search-m" aria-label="Chercher un client">
          <Search className="ad-i" aria-hidden />
        </Link>
        <div className="ad-tools">
          <AdminNotificationBell />
          <ThemeToggle />
        </div>
      </header>
      {!hideHeading && (
        <div className="ad-ph">
          <div style={{ minWidth: 0 }}>
            <h1>{title}</h1>
            {subtitle && <p>{subtitle}</p>}
          </div>
          {actions ? <div className="ad-acts">{actions}</div> : null}
        </div>
      )}
    </>
  );
}
