import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { forwardRef, useState, type ButtonHTMLAttributes } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Select, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { GxSelectTrigger, GxSheetContent, GxSheetClose } from "@/components/ui/gx-controls";
import { toast } from "sonner";
import { useCurrentWorkspace } from "@/hooks/useWorkspaces";
import { listWorkspaceMembers, inviteMember, removeMember, cancelInvitation, resendInvitation, updateInvitationRole, setMemberProjectPermission } from "@/lib/workspaces.functions";

export const Route = createFileRoute("/_authenticated/parametres/membres")({
  component: Page,
});

const ROLE_LABEL: Record<string, string> = { owner: "Propriétaire", admin: "Admin", member: "Membre" };
const ROLE_ACCESS: Record<string, string> = {
  owner: "Tout, y compris la facturation",
  admin: "Inviter, publier, gérer les marques",
  member: "Créer et publier",
};

function initials(text?: string | null) {
  const t = String(text ?? "").trim();
  if (!t) return "?";
  const base = t.includes("@") && !t.includes(" ") ? t.split("@")[0] : t;
  const parts = base.split(/[\s._-]+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "?";
}

function expiresIn(iso?: string | null) {
  if (!iso) return "";
  const days = Math.ceil((+new Date(iso) - Date.now()) / 86_400_000);
  if (Number.isNaN(days)) return "";
  if (days <= 0) return "expirée";
  return `expire dans ${days} jour${days > 1 ? "s" : ""}`;
}

const IC_MORE = "M5 12h.01M12 12h.01M19 12h.01";

/** Bouton « ⋯ » : transmet ref et props pour servir de déclencheur Radix (asChild). */
const MoreButton = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement> & { label: string }>(
  ({ label, ...props }, ref) => (
    <button ref={ref} type="button" className="gx-ib gx-sm" aria-label={label} {...props}>
      <svg className="gx-i" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={IC_MORE} /></svg>
    </button>
  ),
);
MoreButton.displayName = "MoreButton";

function Page() {
  const { data: ws } = useCurrentWorkspace();
  const qc = useQueryClient();
  const listFn = useServerFn(listWorkspaceMembers);
  const inviteFn = useServerFn(inviteMember);
  const removeFn = useServerFn(removeMember);
  const cancelFn = useServerFn(cancelInvitation);
  const resendFn = useServerFn(resendInvitation);
  const roleFn = useServerFn(updateInvitationRole);
  const permissionFn = useServerFn(setMemberProjectPermission);
  const [busyPermission, setBusyPermission] = useState<string | null>(null);

  const key = ["workspace-members", ws?.id];
  const { data, isLoading } = useQuery({
    queryKey: key,
    queryFn: () => listFn({ data: { workspaceId: ws!.id } }),
    enabled: !!ws?.id,
  });

  const [inviteOpen, setInviteOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "member">("member");
  const [sending, setSending] = useState(false);
  const [inviteLink, setInviteLink] = useState<{ url: string; email: string; sent: boolean } | null>(null);
  const [busyInvite, setBusyInvite] = useState<string | null>(null);

  const buildInviteUrl = (token: string) =>
    typeof window !== "undefined" ? `${window.location.origin}/invite/${token}` : `/invite/${token}`;

  const openInvite = () => { setInviteLink(null); setEmail(""); setRole("member"); setInviteOpen(true); };

  const toggleProjectPermission = async (memberId: string, canEdit: boolean) => {
    setBusyPermission(memberId);
    try {
      await permissionFn({ data: { memberId, canEdit } });
      qc.invalidateQueries({ queryKey: ["workspace-members", ws?.id] });
      toast.success(canEdit ? "Le membre peut modifier les projets vidéo" : "Permission retirée");
    } catch (e) { toast.error(e instanceof Error ? e.message : "Erreur"); }
    finally { setBusyPermission(null); }
  };

  const invite = async () => {
    if (sending) return;
    if (!ws || !email.trim()) { toast.error("Indique l'adresse e-mail à inviter."); return; }
    setSending(true);
    try {
      const res = await inviteFn({ data: { workspaceId: ws.id, email: email.trim(), role } });
      qc.invalidateQueries({ queryKey: key });
      const url = buildInviteUrl(res.token);
      setInviteLink({ url, email: email.trim(), sent: !!res.emailSent });
      try { await navigator.clipboard.writeText(url); } catch { /* ignore */ }
      toast.success(
        res.emailSent ? "Invitation envoyée par email" : "Invitation créée",
        { description: res.emailSent
            ? "Le lien a aussi été copié dans ton presse-papiers."
            : "L'email n'a pas pu partir, partage le lien copié." },
      );
      setEmail("");
    } catch (e) { toast.error(e instanceof Error ? e.message : "Erreur"); }
    finally { setSending(false); }
  };

  const copyInvite = async (token: string) => {
    const url = buildInviteUrl(token);
    try { await navigator.clipboard.writeText(url); toast.success("Lien copié"); }
    catch { toast.error("Copie impossible"); }
  };

  const resend = async (invitationId: string) => {
    setBusyInvite(invitationId);
    try {
      await resendFn({ data: { invitationId } });
      qc.invalidateQueries({ queryKey: key });
      toast.success("Invitation renvoyée par email");
    } catch (e) { toast.error(e instanceof Error ? e.message : "Erreur"); }
    finally { setBusyInvite(null); }
  };

  const changeRole = async (invitationId: string, newRole: "admin" | "member") => {
    try {
      await roleFn({ data: { invitationId, role: newRole } });
      qc.invalidateQueries({ queryKey: key });
      toast.success("Rôle de l'invitation mis à jour");
    } catch (e) { toast.error(e instanceof Error ? e.message : "Erreur"); }
  };

  const remove = async (memberId: string) => {
    try {
      await removeFn({ data: { memberId } });
      qc.invalidateQueries({ queryKey: key });
      toast.success("Membre retiré");
    } catch (e) { toast.error(e instanceof Error ? e.message : "Erreur"); }
  };

  const cancel = async (invitationId: string) => {
    try {
      await cancelFn({ data: { invitationId } });
      qc.invalidateQueries({ queryKey: key });
    } catch (e) { toast.error(e instanceof Error ? e.message : "Erreur"); }
  };

  const members: any[] = ((data as any)?.members as any[]) ?? [];
  const invitations: any[] = ((data as any)?.invitations as any[]) ?? [];
  const isOwner = (data as any)?.isOwner === true;

  return (
    <>
      <div className="gx-tbl">
        <table>
          <thead><tr><th>Membre</th><th>Rôle</th><th>Accès</th></tr></thead>
          <tbody>
            {isLoading || !ws?.id ? (
              <tr><td colSpan={3}><small>Chargement de l'équipe…</small></td></tr>
            ) : members.length === 0 && invitations.length === 0 ? (
              <tr><td colSpan={3}><small>Personne dans ce workspace pour l'instant.</small></td></tr>
            ) : null}

            {members.map((m) => {
              const p = m.profile as { email?: string; display_name?: string } | null;
              const isOwnerRow = m.role === "owner";
              return (
                <tr key={m.id}>
                  <td>
                    <div className="gx-who">
                      <span className="gx-av">{initials(p?.display_name ?? p?.email)}</span>
                      <div><b>{p?.display_name ?? p?.email}</b><small>{p?.email}</small></div>
                    </div>
                  </td>
                  <td><b>{ROLE_LABEL[m.role] ?? m.role}</b></td>
                  <td>
                    <div className="gx-mb-acc">
                      <span>
                        {ROLE_ACCESS[m.role] ?? ""}
                        {m.can_edit_projects && !isOwnerRow ? " · modifie les projets vidéo" : ""}
                      </span>
                      {!isOwnerRow && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><MoreButton label={`Options pour ${p?.display_name ?? p?.email ?? "ce membre"}`} /></DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="console-app-portal">
                            {isOwner && (
                              <DropdownMenuCheckboxItem
                                checked={Boolean(m.can_edit_projects)}
                                disabled={busyPermission === m.id}
                                onCheckedChange={(v) => void toggleProjectPermission(m.id, v === true)}
                              >
                                Peut modifier les projets vidéo
                              </DropdownMenuCheckboxItem>
                            )}
                            <DropdownMenuItem onSelect={() => void remove(m.id)}>Retirer du workspace</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}

            {invitations.map((inv) => (
              <tr key={inv.id}>
                <td>
                  <div className="gx-who">
                    <span className="gx-av">?</span>
                    <div>
                      <b>{inv.email}</b>
                      <small title={inv.expires_at ? `Expire le ${new Date(inv.expires_at).toLocaleDateString("fr-FR")}` : undefined}>
                        Invitation envoyée{inv.expires_at ? ` · ${expiresIn(inv.expires_at)}` : ""}
                      </small>
                    </div>
                  </div>
                </td>
                <td>
                  <Select value={inv.role as "admin" | "member"} onValueChange={(v) => void changeRole(inv.id, v as "admin" | "member")}>
                    <GxSelectTrigger aria-label={`Rôle de ${inv.email}`}><SelectValue /></GxSelectTrigger>
                    <SelectContent className="console-app-portal">
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="member">Membre</SelectItem>
                    </SelectContent>
                  </Select>
                </td>
                <td>
                  <div className="gx-mb-acc">
                    <button type="button" className="gx-btn gx-sm" disabled={busyInvite === inv.id} onClick={() => void resend(inv.id)} title="Renvoyer l'email d'invitation">
                      {busyInvite === inv.id ? "Envoi…" : "Renvoyer"}
                    </button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><MoreButton label={`Options de l'invitation ${inv.email}`} /></DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="console-app-portal">
                        <DropdownMenuItem onSelect={() => void copyInvite(inv.token)}>Copier le lien d'invitation</DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => void cancel(inv.id)}>Annuler l'invitation</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="gx-row">
        <button type="button" className="gx-btn gx-pri" onClick={openInvite} disabled={!ws?.id}>
          <svg className="gx-i" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
          Inviter un membre
        </button>
      </div>

      <DialogPrimitive.Root open={inviteOpen} onOpenChange={setInviteOpen}>
        <GxSheetContent className="console-app-portal" aria-describedby={undefined}>
          <div className="gx-sheet-h">
            <div>
              <DialogPrimitive.Title asChild><b>{inviteLink ? "Invitation prête à partager" : "Inviter un membre"}</b></DialogPrimitive.Title>
              <small>L'invitation est valable 7 jours.</small>
            </div>
            <GxSheetClose />
          </div>
          {inviteLink ? (
            <>
              <div className="gx-ls-b">
                <p className="gx-hint">
                  {inviteLink.sent ? "Un email d'invitation a été envoyé à " : "L'email n'a pas pu partir : envoie ce lien à "}
                  <b>{inviteLink.email}</b>. Il rejoindra le workspace après connexion.
                </p>
                <label className="gx-lbl" htmlFor="invUrl">Lien d'invitation</label>
                <input className="gx-in" id="invUrl" readOnly value={inviteLink.url} onFocus={(e) => e.currentTarget.select()} />
              </div>
              <div className="gx-sheet-f">
                <button type="button" className="gx-btn" onClick={() => { setInviteLink(null); }}>Inviter quelqu'un d'autre</button>
                <div className="gx-sp" />
                <button type="button" className="gx-btn"
                  onClick={() => navigator.clipboard.writeText(inviteLink.url).then(() => toast.success("Copié"), () => toast.error("Copie impossible"))}>
                  Copier le lien
                </button>
                <DialogPrimitive.Close asChild><button type="button" className="gx-btn gx-pri">Fermer</button></DialogPrimitive.Close>
              </div>
            </>
          ) : (
            <>
              <form className="gx-ls-b" id="invForm" onSubmit={(e) => { e.preventDefault(); void invite(); }}>
                <label className="gx-lbl" htmlFor="invMail">Email</label>
                <input className="gx-in" id="invMail" type="email" required placeholder="prenom@entreprise.fr" value={email} onChange={(e) => setEmail(e.target.value)} autoFocus />
                <div className="gx-lbl">Rôle</div>
                <div className="gx-seg" role="tablist" aria-label="Rôle">
                  <button type="button" role="tab" aria-selected={role === "member"} onClick={() => setRole("member")}>Membre</button>
                  <button type="button" role="tab" aria-selected={role === "admin"} onClick={() => setRole("admin")}>Admin</button>
                </div>
                <p className="gx-hint">Membre : crée et publie. Admin : peut aussi inviter et gérer les marques. S'il a déjà un compte, il rejoint l'espace directement.</p>
              </form>
              <div className="gx-sheet-f">
                <div className="gx-sp" />
                <DialogPrimitive.Close asChild><button type="button" className="gx-btn">Annuler</button></DialogPrimitive.Close>
                <button type="submit" form="invForm" className="gx-btn gx-pri">{sending ? "Envoi…" : "Envoyer l'invitation"}</button>
              </div>
            </>
          )}
        </GxSheetContent>
      </DialogPrimitive.Root>
    </>
  );
}
