import { useEffect, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import {
  Home01Icon, AiChat02Icon, Tag01Icon, DashboardSquare02Icon, Video01Icon, UserSquareIcon, BulbIcon,
  Album02Icon, Megaphone01Icon, AnalyticsUpIcon, ContactBookIcon, MetaIcon, Settings02Icon, HelpCircleIcon,
  SidebarLeftIcon,
} from "@hugeicons/core-free-icons";
import { useSidebar } from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Logo } from "@/components/Logo";
import { WorkspaceBrandCard } from "@/components/WorkspaceBrandCard";
import { UsageBadge } from "@/components/UsageBadge";
import { getMetaCredentials } from "@/lib/meta.functions";
import { listBatches } from "@/lib/batch.functions";
import { countNewLeadsSince } from "@/lib/leads.functions";
import { useNewAdConversation } from "@/hooks/useNewAdConversation";

/*
 * Menu latéral, rangé dans l'ordre du travail (maquette validée : landing/design/menu/menu.html) :
 * Accueil · Chat · Ma marque, puis « Créer » (outils et idées), puis « Mes pubs » (Créations → Campagnes →
 * Performance → Leads, et Connexion Meta). Logo, carte workspace/marque et bloc de crédits inchangés.
 * Icônes Hugeicons, trait arrondi 1,5 (maquette validée : landing/design/icones-menu/icones-menu.html) :
 * grises au repos, violettes sur fond violet clair pour la page ouverte. Le menu tient dans la hauteur de l'écran sans défiler
 * (src/styles/gx-sidebar-fit.css).
 */

type NavItem = { title: string; url: string; to?: string; icon: IconSvgElement; tour?: string };

/** Outils et idées pour créer. */
const createItems: NavItem[] = [
  { title: "Batch Studio", url: "/batch", icon: DashboardSquare02Icon },
  { title: "Éditeur vidéo", url: "/editeur", icon: Video01Icon },
  { title: "Galerie d'acteurs", url: "/galerie", icon: UserSquareIcon, tour: "galerie" },
  // Vidéos Produit (/templates-produit) masquée pour le moment — remettre ici le moment venu :
  // { title: "Vidéos Produit", url: "/templates-produit", icon: Video01Icon },
  { title: "Inspiration", url: "/inspiration", icon: BulbIcon },
];
/** Tout le cycle d'une pub, puis la connexion Meta qui permet de publier. */
const adsItems: NavItem[] = [
  { title: "Créations", url: "/creations", icon: Album02Icon, tour: "creations" },
  { title: "Campagnes", url: "/campaigns", icon: Megaphone01Icon, tour: "meta" },
  { title: "Performance", url: "/performance", icon: AnalyticsUpIcon },
  { title: "Leads", url: "/resultats", icon: ContactBookIcon, tour: "leads" },
  { title: "Connexion Meta", url: "/connexions", icon: MetaIcon },
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
  const { open, isMobile, setOpenMobile, toggleSidebar } = useSidebar();
  // Sur ordinateur, le menu se replie en barre d'icônes (bouton à côté du logo, ou Ctrl/Cmd+B).
  const collapsed = !isMobile && !open;
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

  // Compteurs violets de la maquette : lots en cours de fabrication, nouveaux leads du jour.
  const fetchBatches = useServerFn(listBatches);
  const batches = useQuery({
    queryKey: ["batches", "list", "all"],
    queryFn: () => fetchBatches({ data: { brandId: null } }),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
  const runningBatches = ((batches.data as any[]) ?? []).filter((b: any) =>
    ["extracting", "planning", "previewing", "declining"].includes(String(b?.status))).length;
  const fetchNewLeads = useServerFn(countNewLeadsSince);
  const dayStart = new Date(); dayStart.setHours(0, 0, 0, 0);
  const since = dayStart.toISOString();
  const leads = useQuery({
    queryKey: ["leads-new-count", since],
    queryFn: () => fetchNewLeads({ data: { since } }),
    staleTime: 5 * 60_000,
    refetchOnWindowFocus: false,
  });
  const newLeads = Number(leads.data ?? 0);
  const counts: Record<string, number> = { "/batch": runningBatches, "/resultats": newLeads };

  const nav = (item: NavItem) => {
    const active = isActive(item.url);
    return (
      <Tip key={item.url} show={collapsed} label={item.title}>
        <Link to={item.to ?? item.url} className="gx-nv" data-tour={item.tour} aria-current={active ? "page" : undefined}>
          <HugeiconsIcon icon={item.icon} className="gx-i" size={18} strokeWidth={1.5} aria-hidden />
          <span>{item.title}</span>
          {counts[item.url] > 0 ? (
            <em title={item.url === "/batch" ? "Lots en cours" : "Nouveaux leads reçus aujourd'hui"}>
              {counts[item.url] > 99 ? "99+" : counts[item.url]}
            </em>
          ) : null}
          {item.url === "/connexions" && showMetaTodo ? (
            <>
              <em className="gx-warnb" title="Compte Meta Ads non connecté">0/1</em>
              <i className="gx-ndot" aria-label="Compte Meta Ads non connecté" />
            </>
          ) : null}
        </Link>
      </Tip>
    );
  };
  const chatActive = currentPath.startsWith("/create");

  return (
    <aside className="gx-side" aria-label="Navigation">
      <div className="gx-brandrow">
        <Link to="/dashboard" className="gx-brand" aria-label="Growthity">
          {collapsed ? <Logo variant="icon" className="h-7 w-7" /> : <Logo variant="full" className="h-6 w-auto" />}
        </Link>
        {!isMobile && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button type="button" className="gx-colbtn" onClick={toggleSidebar} aria-label={collapsed ? "Déplier le menu" : "Replier le menu"} aria-expanded={!collapsed}>
                <HugeiconsIcon icon={SidebarLeftIcon} className="gx-i" size={18} strokeWidth={1.5} style={collapsed ? { transform: "scaleX(-1)" } : undefined} aria-hidden />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">{collapsed ? "Déplier le menu" : "Replier le menu"} · Ctrl+B</TooltipContent>
          </Tooltip>
        )}
      </div>

      <WorkspaceBrandCard collapsed={collapsed} />

      <nav>
        {nav({ title: "Accueil", url: "/dashboard", icon: Home01Icon })}
        <Tip show={collapsed} label="Chat">
          <button type="button" className="gx-nv" data-tour="chat" onClick={() => void startNewChat()} aria-current={chatActive ? "page" : undefined}>
            <HugeiconsIcon icon={AiChat02Icon} className="gx-i" size={18} strokeWidth={1.5} aria-hidden /><span>Chat</span>
          </button>
        </Tip>
        {nav({ title: "Ma marque", url: "/ma-marque", icon: Tag01Icon })}

        <div className="gx-ng">Créer</div>
        {createItems.map(nav)}

        <div className="gx-ng">Mes pubs</div>
        {adsItems.map(nav)}
      </nav>

      <div className="gx-grow" />

      <UsageBadge collapsed={collapsed} />
      {nav({ title: "Paramètres", url: "/parametres", to: "/parametres/profil", icon: Settings02Icon })}
      {nav({ title: "Aide", url: "/aide", icon: HelpCircleIcon })}
    </aside>
  );
}
