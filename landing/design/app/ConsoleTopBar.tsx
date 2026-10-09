import { useEffect, useState } from "react";
import { Link, useNavigate, useRouterState, useHydrated } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Search, Plus, Settings, HelpCircle, CreditCard, LogOut, LayoutDashboard, Film, Megaphone, Users, Layers, Package, Lightbulb, Plug, BarChart3, PanelLeft, MessageSquare, Images, Clapperboard } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { CommandDialog, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/ThemeToggle";
import { NotificationBell } from "@/components/NotificationBell";
import { useNewAdConversation } from "@/hooks/useNewAdConversation";
import { useAuth } from "@/hooks/useAuth";
import { getMetaCredentials } from "@/lib/meta.functions";
import { supabase } from "@/integrations/supabase/client";

/* Barre du haut : reprise exacte de la maquette (fil d'Ariane, recherche ⌘K, état Meta, thème, cloche, compte). */

const destinations = [
  { title: "Dashboard", group: "", to: "/dashboard", icon: LayoutDashboard },
  { title: "Chat", group: "Créer", to: "/create", icon: MessageSquare },
  { title: "Batch Studio", group: "Créer", to: "/batch", icon: Layers },
  { title: "Galerie d'acteurs", group: "Créer", to: "/galerie", icon: Images },
  { title: "Créations", group: "Créer", to: "/creations", icon: Film },
  { title: "Inspiration", group: "Créer", to: "/inspiration", icon: Lightbulb },
  { title: "Éditeur vidéo", group: "Créer", to: "/editeur", icon: Clapperboard },
  { title: "Produits", group: "Catalogue", to: "/catalogue/produits", icon: Package },
  { title: "Campagnes", group: "Publicités Meta", to: "/campaigns", icon: Megaphone },
  { title: "Résultats", group: "Publicités Meta", to: "/resultats", icon: Users },
  { title: "Performance", group: "Publicités Meta", to: "/performance", icon: BarChart3 },
  { title: "Connexion", group: "Publicités Meta", to: "/connexions", icon: Plug },
  { title: "Paramètres", group: "", to: "/parametres/profil", icon: Settings },
  { title: "Aide", group: "", to: "/aide", icon: HelpCircle },
] as const;

export function ConsoleTopBar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const hydrated = useHydrated();
  const { user } = useAuth();
  const { open: sidebarOpen, toggleSidebar } = useSidebar();
  const { start, busy } = useNewAdConversation();
  const [open, setOpen] = useState(false);
  const fetchMeta = useServerFn(getMetaCredentials);
  const { data: metaData } = useQuery({ queryKey: ["meta-credentials"], queryFn: () => fetchMeta(), staleTime: 5 * 60_000, retry: false });
  const meta = hydrated ? metaData : undefined;

  const here = destinations.find((d) => pathname === d.to || pathname.startsWith(d.to + "/"))
    ?? (pathname.startsWith("/parametres") ? destinations[12] : pathname.startsWith("/campaigns") ? destinations[8] : undefined);
  const metaStatus = !meta?.connected ? "none" : meta.expiry_status;
  const metaLabel = metaStatus === "expired" ? "Meta expiré" : metaStatus === "expiring_soon" ? "Meta à renouveler" : metaStatus === "connected" ? "Meta connecté" : "Meta non connecté";
  const dot = metaStatus === "connected" ? undefined : metaStatus === "expired"
    ? { background: "var(--gx-bad)", boxShadow: "0 0 0 3px var(--gx-bad-soft)" }
    : { background: "var(--gx-warn)", boxShadow: "0 0 0 3px var(--gx-warn-soft)" };

  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((value) => !value);
      }
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, []);
  const initials = (user?.user_metadata?.full_name ?? user?.email ?? "G").split(/[\s@.]+/).filter(Boolean).slice(0, 2).map((part: string) => part[0]).join("").toUpperCase();

  return <>
    <header className="gx-top">
      <Tooltip>
        <TooltipTrigger asChild>
          <button type="button" className="gx-ib gx-collapse" onClick={toggleSidebar} aria-label={sidebarOpen ? "Replier le menu" : "Ouvrir le menu"}>
            <PanelLeft className="gx-i" aria-hidden />
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom">{sidebarOpen ? "Replier le menu" : "Ouvrir le menu"} · Ctrl+B</TooltipContent>
      </Tooltip>
      <div className="gx-crumb">{here?.group ? <small>{here.group} /</small> : null}<span>{here?.title ?? "Growthity"}</span></div>
      <button type="button" className="gx-cmd" onClick={() => setOpen(true)} aria-label="Rechercher une page ou une action">
        <Search className="gx-i" aria-hidden /><span>Rechercher ou demander à Growthity…</span><kbd>⌘K</kbd>
      </button>
      <div className="gx-sp" />
      <Link to="/connexions" className="gx-pill" title={metaLabel}><i style={dot} />{metaLabel}</Link>
      <ThemeToggle className="gx-ib" />
      <NotificationBell className="gx-ib" />
      <DropdownMenu>
        <DropdownMenuTrigger asChild><button type="button" className="gx-me" aria-label="Mon compte">{initials}</button></DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-60">
          <DropdownMenuLabel className="truncate">{user?.email ?? "Mon compte"}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild><Link to="/parametres/profil"><Settings />Paramètres</Link></DropdownMenuItem>
          <DropdownMenuItem asChild><Link to="/parametres/facturation"><CreditCard />Facturation</Link></DropdownMenuItem>
          <DropdownMenuItem asChild><Link to="/aide"><HelpCircle />Centre d'aide</Link></DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-destructive" onClick={async () => { await supabase.auth.signOut(); await navigate({ to: "/auth" }); }}><LogOut />Déconnexion</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Aller à une page ou lancer une action…" />
      <CommandList><CommandEmpty>Aucun résultat</CommandEmpty>
        <CommandGroup heading="Créer">
          <CommandItem disabled={busy} onSelect={() => { setOpen(false); void start(); }}><Plus />Nouvelle publicité</CommandItem>
          <CommandItem onSelect={() => { setOpen(false); void navigate({ to: "/batch/new", search: { brandId: undefined } }); }}><Layers />Nouveau lot</CommandItem>
          <CommandItem onSelect={() => { setOpen(false); void navigate({ to: "/campaigns/new" }); }}><Megaphone />Nouvelle campagne</CommandItem>
        </CommandGroup>
        <CommandGroup heading="Aller à">{destinations.map((d) => <CommandItem key={d.to} onSelect={() => { setOpen(false); void navigate({ to: d.to }); }}><d.icon />{d.title}</CommandItem>)}</CommandGroup>
      </CommandList>
    </CommandDialog>
  </>;
}
