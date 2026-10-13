import { AlertCircle, AlertTriangle, Clock, Info, TrendingUp, UserPlus } from "lucide-react";
import type { LucideIcon } from "lucide-react";

/* Formats et libellés partagés par les pages admin. */

export type Tone = "ok" | "warn" | "bad" | "pri" | "info" | "neutral";

/** Types d'alertes internes renvoyés par getAdminNotifications (champ kind). */
export const ADMIN_KIND: Record<string, { icon: LucideIcon; label: string; tone: Tone }> = {
  pending_stuck: { icon: Clock, label: "Génération coincée", tone: "warn" },
  failure_spike: { icon: AlertTriangle, label: "Pic d'échecs", tone: "bad" },
  at_risk: { icon: AlertCircle, label: "Risque churn", tone: "warn" },
  new_signup: { icon: UserPlus, label: "Nouveau client", tone: "pri" },
  plan_change: { icon: TrendingUp, label: "Changement de plan", tone: "info" },
  default: { icon: Info, label: "Alerte", tone: "neutral" },
};

export function timeAgo(iso: string) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "à l'instant";
  if (s < 3600) return `il y a ${Math.floor(s / 60)} min`;
  if (s < 86400) return `il y a ${Math.floor(s / 3600)} h`;
  return `il y a ${Math.floor(s / 86400)} j`;
}

export function daysSince(iso: string | null | undefined) {
  if (!iso) return null;
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
}

export const fmtInt = (n: number) => n.toLocaleString("fr-FR");
export const fmtEur = (cents: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format((cents ?? 0) / 100);
export const fmtPct = (ratio: number, digits = 1) => `${(ratio * 100).toFixed(digits).replace(".", ",")} %`;
export const fmtDate = (iso: string | null | undefined, opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" }) =>
  iso ? new Date(iso).toLocaleDateString("fr-FR", opts) : "-";
export const fmtDateTime = (iso: string | null | undefined) =>
  iso ? new Date(iso).toLocaleString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "-";

/** Libellé d'un plan à partir de son code (free, starter…). */
export const planLabel = (code: string | null | undefined) => {
  const c = (code ?? "free").toString();
  return c.charAt(0).toUpperCase() + c.slice(1);
};

export const SEGMENT: Record<string, { label: string; tone: Tone }> = {
  active: { label: "Actif", tone: "ok" },
  at_risk: { label: "À risque", tone: "warn" },
  inactive: { label: "Inactif", tone: "neutral" },
};

/** Couleur stable d'avatar à partir d'un identifiant. */
const AV = ["#B5734A", "#3E7C6B", "#6C5BD4", "#C2577A", "#2F6FB0", "#8A7A2E", "#4C5566", "#A0522D", "#2E8B8B", "#7D4FA0", "#5E7C2E", "#B04A4A"];
export function avatarColor(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return AV[h % AV.length];
}
export function initials(s: string | null | undefined) {
  const parts = (s ?? "?").replace(/[^\p{L}\p{N} ]/gu, " ").split(" ").filter(Boolean);
  return ((parts[0]?.[0] ?? "?") + (parts[1]?.[0] ?? "")).toUpperCase();
}

/** Libellés français des actions du journal d'audit (clés brutes de admin_audit_log.action). */
export const AUDIT_LABEL: Record<string, string> = {
  view_dashboard: "Consultation du dashboard",
  view_workspace: "Consultation fiche client",
  view_conversation: "Consultation conversation",
  add_note: "Note ajoutée",
  delete_note: "Note supprimée",
  add_tag: "Tag ajouté",
  remove_tag: "Tag retiré",
  start_impersonation: "Début d'impersonation",
  end_impersonation: "Fin d'impersonation",
  grant_admin_role: "Rôle admin accordé",
  revoke_admin_role: "Rôle admin révoqué",
  send_broadcast: "Diffusion envoyée",
  delete_broadcast: "Diffusion supprimée",
  set_plan: "Plan modifié",
  adjust_credits: "Crédits ajustés",
  notify_workspace: "Notification envoyée",
  export_audit: "Export CSV de l'audit",
};
