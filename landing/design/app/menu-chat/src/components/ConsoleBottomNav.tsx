import { Link, useRouterState } from "@tanstack/react-router";
import { HugeiconsIcon } from "@hugeicons/react";
import { Home01Icon, Album02Icon, PlusSignIcon, ContactBookIcon, Menu01Icon } from "@hugeicons/core-free-icons";
import { useSidebar } from "@/components/ui/sidebar";
import { useNewAdConversation } from "@/hooks/useNewAdConversation";

/* Barre d'onglets mobile (< 900px), reprise exacte de la maquette. Icônes Hugeicons comme le menu latéral. */
export function ConsoleBottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { setOpenMobile, openMobile } = useSidebar();
  const { start, busy } = useNewAdConversation();
  // Onglet actif selon la route : Accueil seulement sur /dashboard, Créer sur /create,
  // aucun actif sur les pages sans onglet dédié (ex. /campaigns).
  const cur = (p: string) => (pathname === p || pathname.startsWith(p + "/") ? "page" : undefined);
  return (
    <nav className="gx-tabbar" aria-label="Navigation rapide">
      <Link to="/dashboard" className="gx-tab" aria-current={pathname === "/dashboard" ? "page" : undefined}><HugeiconsIcon icon={Home01Icon} className="gx-i" size={20} strokeWidth={1.5} aria-hidden /><span>Accueil</span></Link>
      <Link to="/creations" className="gx-tab" aria-current={cur("/creations")}><HugeiconsIcon icon={Album02Icon} className="gx-i" size={20} strokeWidth={1.5} aria-hidden /><span>Créations</span></Link>
      <button type="button" className="gx-tab gx-mid" disabled={busy} onClick={() => void start()} aria-current={pathname.startsWith("/create") ? "page" : undefined}>
        <span className="gx-ic"><HugeiconsIcon icon={PlusSignIcon} className="gx-i" size={20} strokeWidth={2} aria-hidden /></span><span>Créer</span>
      </button>
      <Link to="/resultats" className="gx-tab" aria-current={cur("/resultats")}><HugeiconsIcon icon={ContactBookIcon} className="gx-i" size={20} strokeWidth={1.5} aria-hidden /><span>Leads</span></Link>
      <button type="button" className="gx-tab" onClick={() => setOpenMobile(!openMobile)} aria-expanded={openMobile}><HugeiconsIcon icon={Menu01Icon} className="gx-i" size={20} strokeWidth={1.5} aria-hidden /><span>Menu</span></button>
    </nav>
  );
}
