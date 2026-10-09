import { useEffect, type ReactNode } from "react";
import { useSidebar } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ConsoleTopBar } from "@/components/ConsoleTopBar";
import { ConsoleBottomNav } from "@/components/ConsoleBottomNav";
import { cn } from "@/lib/utils";

/**
 * Cadre de l'app connectée, structure identique à la maquette :
 * .gx-app (grille) > aside.gx-side + .gx-main (barre du haut, bandeaux, page) ; barre d'onglets mobile.
 * L'état ouvert / replié / tiroir mobile vient toujours de SidebarProvider (Ctrl/Cmd+B inchangé).
 */
export function ConsoleFrame({ banners, children, sidebar = true }: { banners?: ReactNode; children: ReactNode; sidebar?: boolean }) {
  const { open, isMobile, openMobile, setOpenMobile } = useSidebar();

  useEffect(() => {
    if (!openMobile) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpenMobile(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openMobile, setOpenMobile]);

  return (
    <>
      <div className={cn("gx-app", !isMobile && !open && "gx-collapsed", isMobile && openMobile && "gx-nav-open")}>
        {sidebar ? <AppSidebar /> : <aside className="gx-side" aria-hidden />}
        <div className="gx-scrim" onClick={() => setOpenMobile(false)} aria-hidden />
        <div className="gx-main">
          <ConsoleTopBar />
          {banners ? <div className="gx-banners">{banners}</div> : null}
          <main className="gx-content console-main">{children}</main>
        </div>
      </div>
      <ConsoleBottomNav />
    </>
  );
}
