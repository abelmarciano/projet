import { useEffect, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import {
  Home, LayoutDashboard, Film, Megaphone, Package, Images, MessageSquare, BarChart3,
  Settings, HelpCircle, Plug, Clapperboard, Users, Layers, Lightbulb,
} from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Logo } from "@/components/Logo";
import { WorkspaceBrandCard } from "@/components/WorkspaceBrandCard";
import { UsageBadge } from "@/components/UsageBadge";
import { getMetaCredentials } from "@/lib/meta.functions";
import { useNewAdConversation } from "@/hooks/useNewAdConversation";

/* Menu latéral : reprise exacte de la maquette (classes gx-, src/styles/gx-console.css). */

type NavItem = { title: string; url: string; to?: string; icon: typeof LayoutDashboard; tour?: string };

const createItems: NavItem[] = [
  { title: "Batch Studio", url: "/batch", icon: Layers },
  { title: "Galerie d'acteurs", url: "/galerie", icon: Images, tour: "galerie" },
  // Vidéos Produit (/templates-produit) masquée pour le moment — remettre ici le moment venu :
  // { title: "Vidéos Produit", url: "/templates-produit", icon: Clapperboard },
  { title: "Créations", url: "/creations", icon: Film, tour: "creations" },
  { title: "Inspiration", url: "/inspiration", icon: Lightbulb },
  { title: "Éditeur vidéo", url: "/editeur", icon: Clapperboard },
];
const catalogItems: NavItem[] = [{ title: "Produits", url: "/catalogue/produits", icon: Package }];
const metaItems: NavItem[] = [
  { title: "Campagnes", url: "/campaigns", icon: Megaphone, tour: "meta" },
  { title: "Résultats", url: "/resultats", icon: Users, tour: "leads" },
  { title: "Performance", url: "/performance", icon: BarChart3 },
  { title: "Connexion", url: "/connexions", icon: Plug },
];

/** Infobulle à droite, seulement quand le menu est replié. */
function Tip({ show, label, children }: { show: boolean; label: string; children: ReactNode }) {
  if (!show) return <>{children}</>;
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side="right" align="center">{label}</TooltipContent>
    </Tooltip>
  );
}

export function AppSidebar() {
  const { isMobile, setOpenMobile } = useSidebar();
  // La maquette n'a pas de menu replié : le menu reste toujours déplié sur ordinateur.
  const collapsed = false;
  const currentPath = useRouterState({ select: (r) => r.location.pathname });
  const isActive = (path: string) => (path === "/dashboard" ? currentPath === path : currentPath.startsWith(path));
  const { start: startNewChat } = useNewAdConversation();

  // Ferme le tiroir mobile à chaque changement de page.
  useEffect(() => {
    if (isMobile) setOpenMobile(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPath]);

  // Indicateur discret : compte Meta Ads pas encore connecté.
  const fetchMetaCreds = useServerFn(getMetaCredentials);
  const metaCreds = useQuery({
    queryKey: ["meta-credentials"],
    queryFn: () => fetchMetaCreds(),
    staleTime: 5 * 60_000,
    gcTime: 30 * 60_000,
    refetchOnWindowFocus: false,
    retry: false,
  });
  const showMetaTodo = metaCreds.isSuccess && !metaCreds.data?.connected;

  const nav = (item: NavItem) => (
    <Tip key={item.url} show={collapsed} label={item.title}>
      <Link to={item.to ?? item.url} className="gx-nv" data-tour={item.tour} aria-current={isActive(item.url) ? "page" : undefined}>
        <item.icon className="gx-i" aria-hidden />
        <span>{item.title}</span>
        {item.url === "/connexions" && showMetaTodo ? (
          <>
            <em className="gx-warnb" title="Compte Meta Ads non connecté">0/1</em>
            <i className="gx-ndot" aria-label="Compte Meta Ads non connecté" />
          </>
        ) : null}
      </Link>
    </Tip>
  );

  return (
    <aside className="gx-side" aria-label="Navigation">
      <Link to="/dashboard" className="gx-brand" aria-label="Growthity">
        {collapsed ? <Logo variant="icon" className="h-7 w-7" /> : <Logo variant="full" className="h-6 w-auto" />}
      </Link>

      <WorkspaceBrandCard collapsed={collapsed} />

      <nav>
        {nav({ title: "Accueil", url: "/dashboard", icon: Home })}

        <div className="gx-ng">Créer</div>
        <Tip show={collapsed} label="Chat">
          <button type="button" className="gx-nv" data-tour="chat" onClick={() => void startNewChat()} aria-current={currentPath.startsWith("/create") ? "page" : undefined}>
            <MessageSquare className="gx-i" aria-hidden /><span>Chat</span>
          </button>
        </Tip>
        {createItems.map(nav)}

        <div className="gx-ng">Catalogue</div>
        {catalogItems.map(nav)}

        <div className="gx-ng">Publicités Meta</div>
        {metaItems.map(nav)}
      </nav>

      <div className="gx-grow" />

      <UsageBadge collapsed={collapsed} />
      {nav({ title: "Paramètres", url: "/parametres", to: "/parametres/profil", icon: Settings })}
      {nav({ title: "Aide", url: "/aide", icon: HelpCircle })}
    </aside>
  );
}
