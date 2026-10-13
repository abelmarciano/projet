import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, Bell, Building2, Megaphone, Lightbulb, BookText, Route as RouteIcon, FlaskConical, Mic2,
  CreditCard, Mail, KanbanSquare, ScrollText, Users2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

/* Menu de l'espace admin : une seule source pour le menu latéral et le fil d'Ariane de la barre du haut. */

export type AdminNavItem = { to: string; label: string; icon: LucideIcon; exact?: boolean; superOnly?: boolean; badge?: "alerts" };
export type AdminNavGroup = { label: string; items: AdminNavItem[] };

export const ADMIN_NAV: AdminNavGroup[] = [
  { label: "Pilotage", items: [
    { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
    { to: "/admin/notifications", label: "Alertes internes", icon: Bell, badge: "alerts" },
  ] },
  { label: "Clients", items: [
    { to: "/admin/workspaces", label: "Clients", icon: Building2 },
    { to: "/admin/broadcasts", label: "Diffusions", icon: Megaphone },
  ] },
  { label: "Produit et IA", items: [
    { to: "/admin/references", label: "Références et marques", icon: Lightbulb },
    { to: "/admin/ai-rules", label: "Règles des IA", icon: BookText },
    { to: "/admin/model-routing", label: "Routage des modèles", icon: RouteIcon },
    { to: "/admin/model-lab", label: "Model Lab", icon: FlaskConical },
    { to: "/admin/voice-lab", label: "Voice Lab", icon: Mic2 },
  ] },
  { label: "Business", items: [
    { to: "/admin/pricing", label: "Grille tarifaire", icon: CreditCard },
    { to: "/admin/emails", label: "E-mails", icon: Mail },
  ] },
  { label: "Équipe et suivi", items: [
    { to: "/admin/roadmap", label: "Améliorations", icon: KanbanSquare },
    { to: "/admin/audit", label: "Journal d'audit", icon: ScrollText },
    { to: "/admin/team", label: "Équipe admin", icon: Users2, superOnly: true },
  ] },
];

export function isNavActive(pathname: string, item: AdminNavItem) {
  return item.exact ? pathname === item.to || pathname === item.to + "/" : pathname === item.to || pathname.startsWith(item.to + "/");
}

/** Rubrique et groupe de la page courante, pour le fil d'Ariane. */
export function findAdminSection(pathname: string): { group: AdminNavGroup; item: AdminNavItem } | null {
  for (const group of ADMIN_NAV) {
    for (const item of group.items) if (isNavActive(pathname, item)) return { group, item };
  }
  return null;
}

type NavState = { open: boolean; setOpen: (v: boolean) => void };
const NavCtx = createContext<NavState>({ open: false, setOpen: () => {} });

/** État du tiroir de navigation sur mobile (fermé à chaque changement de page). */
export function AdminNavProvider({ children }: { children: (open: boolean) => ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  useEffect(() => { setOpen(false); }, [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);
  return <NavCtx.Provider value={{ open, setOpen }}>{children(open)}</NavCtx.Provider>;
}

export const useAdminNav = () => useContext(NavCtx);
