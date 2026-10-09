import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Film, Plus, Target, Menu } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
import { useNewAdConversation } from "@/hooks/useNewAdConversation";

/* Barre d'onglets mobile (< 900px), reprise exacte de la maquette. */
export function ConsoleBottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { setOpenMobile, openMobile } = useSidebar();
  const { start, busy } = useNewAdConversation();
  const cur = (p: string) => (pathname.startsWith(p) ? "page" : undefined);
  return (
    <nav className="gx-tabbar" aria-label="Navigation rapide">
      <Link to="/dashboard" className="gx-tab" aria-current={cur("/dashboard")}><Home className="gx-i" aria-hidden /><span>Accueil</span></Link>
      <Link to="/creations" className="gx-tab" aria-current={cur("/creations")}><Film className="gx-i" aria-hidden /><span>Créations</span></Link>
      <button type="button" className="gx-tab gx-mid" disabled={busy} onClick={() => void start()} aria-current={cur("/create")}>
        <span className="gx-ic"><Plus className="gx-i" aria-hidden /></span><span>Créer</span>
      </button>
      <Link to="/resultats" className="gx-tab" aria-current={cur("/resultats")}><Target className="gx-i" aria-hidden /><span>Résultats</span></Link>
      <button type="button" className="gx-tab" onClick={() => setOpenMobile(!openMobile)} aria-expanded={openMobile}><Menu className="gx-i" aria-hidden /><span>Menu</span></button>
    </nav>
  );
}
