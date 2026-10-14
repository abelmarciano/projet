import { Link } from "@tanstack/react-router";
import { ChevronLeft } from "@/components/icons";

/**
 * Lien « ← Retour » unique de la console : bouton discret, en haut à gauche,
 * au-dessus du titre de la page (ou seul en tête d'un bloc).
 */
export function BackLink({
  to,
  label,
  params,
  search,
}: {
  to: string;
  label: string;
  params?: Record<string, string>;
  search?: Record<string, unknown>;
}) {
  return (
    <Link
      to={to as never}
      params={params as never}
      search={search as never}
      className="gx-btn gx-ghost gx-sm gx-back"
    >
      <ChevronLeft className="gx-i" aria-hidden />
      <span>{label}</span>
    </Link>
  );
}
