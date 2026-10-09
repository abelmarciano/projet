import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { GxSheetContent, GxSheetClose } from "@/components/ui/gx-controls";
import { toast } from "sonner";
import { useMyWorkspaces, useCurrentWorkspace, useSwitchWorkspace } from "@/hooks/useWorkspaces";
import { updateWorkspace, deleteWorkspace, uploadWorkspaceLogo, createWorkspace } from "@/lib/workspaces.functions";
import { getMetaCredentials } from "@/lib/meta.functions";

export const Route = createFileRoute("/_authenticated/parametres/workspace")({
  component: Page,
});

async function fileToBase64(file: File): Promise<string> {
  const buf = await file.arrayBuffer();
  let s = ""; const bytes = new Uint8Array(buf);
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s);
}

function initials(name: string) {
  return name.split(/\s+/).map((w) => w[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();
}

const ROLE_LABEL: Record<string, string> = { owner: "Propriétaire", admin: "Admin", member: "Membre" };

function Page() {
  const router = useRouter();
  const qc = useQueryClient();
  const { data: workspaces, isLoading } = useMyWorkspaces();
  const { data: current } = useCurrentWorkspace();
  const switchWs = useSwitchWorkspace();
  const saveFn = useServerFn(updateWorkspace);
  const delFn = useServerFn(deleteWorkspace);
  const uploadFn = useServerFn(uploadWorkspaceLogo);
  const createFn = useServerFn(createWorkspace);
  const getCreds = useServerFn(getMetaCredentials);
  const creds = useQuery({ queryKey: ["meta-credentials"], queryFn: () => getCreds() });

  const list: any[] = (workspaces as any[]) ?? [];
  const w: any = list.find((x) => x.id === (current as any)?.id) ?? list[0] ?? null;
  const others = list.filter((x) => x.id !== w?.id);
  const canManage = w?.role === "owner" || w?.role === "admin";
  const canDelete = w?.role === "owner" && list.length > 1;

  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => { if (w?.name != null) setName(w.name); }, [w?.id, w?.name]);
  const dirty = !!w && name.trim() !== String(w.name ?? "").trim();

  const saveName = async () => {
    if (!w || !name.trim()) return;
    setSaving(true);
    try {
      await saveFn({ data: { id: w.id, name: name.trim() } });
      await qc.invalidateQueries({ queryKey: ["workspaces"] });
      toast.success("Nom mis à jour");
    } catch (e) { toast.error(e instanceof Error ? e.message : "Erreur"); }
    finally { setSaving(false); }
  };

  const uploadLogo = async (file: File) => {
    if (!w) return;
    if (!file.type.startsWith("image/")) { toast.error("Fichier image requis"); return; }
    if (file.size > 2 * 1024 * 1024) { toast.error("Max 2 Mo"); return; }
    setUploading(true);
    try {
      const base64 = await fileToBase64(file);
      await uploadFn({ data: { workspaceId: w.id, fileName: file.name, contentType: file.type, base64 } });
      await qc.invalidateQueries({ queryKey: ["workspaces"] });
      toast.success("Icône mise à jour");
    } catch (e) { toast.error(e instanceof Error ? e.message : "Erreur"); }
    finally { setUploading(false); }
  };

  const removeLogo = async () => {
    if (!w) return;
    setUploading(true);
    try {
      await saveFn({ data: { id: w.id, logo_url: null } });
      await qc.invalidateQueries({ queryKey: ["workspaces"] });
    } catch (e) { toast.error(e instanceof Error ? e.message : "Erreur"); }
    finally { setUploading(false); }
  };

  const onDelete = async () => {
    if (!w) return;
    setDeleting(true);
    try {
      await delFn({ data: { id: w.id } });
      qc.clear();
      toast.success("Workspace supprimé");
      await router.invalidate();
    } catch (e) { toast.error(e instanceof Error ? e.message : "Erreur"); setDeleting(false); }
  };

  const doCreate = async () => {
    if (creating) return;
    if (!newName.trim()) { toast.error("Indique un nom de workspace."); return; }
    setCreating(true);
    try {
      await createFn({ data: { name: newName.trim() } });
      qc.clear();
      await router.invalidate();
      toast.success("Workspace créé");
      setCreateOpen(false);
      setNewName("");
    } catch (e) { toast.error(e instanceof Error ? e.message : "Erreur"); }
    finally { setCreating(false); }
  };

  const metaConnected = (creds.data as any)?.connected === true;

  return (
    <>
      <div className="gx-box gx-form">
        <div className="gx-fr">
          <label htmlFor="wName">Nom du workspace</label>
          <input
            className="gx-in" id="wName" value={isLoading ? "" : name} disabled={isLoading || !canManage}
            placeholder={isLoading ? "Chargement…" : "Nom du workspace"}
            title={w ? `${w.slug ?? ""}${w.plan ? ` · Plan ${w.plan}` : ""} · Rôle : ${ROLE_LABEL[w.role] ?? w.role}` : undefined}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && dirty) void saveName(); }}
          />
          {dirty && canManage && (
            <button type="button" className="gx-btn gx-sm gx-pri" onClick={() => void saveName()} disabled={saving || !name.trim()}>
              {saving ? "Enregistrement…" : "Enregistrer"}
            </button>
          )}
        </div>

        <div className="gx-fr">
          <label>Icône</label>
          <span className="gx-wsi gx-wsi-img" aria-label={w ? `Icône de ${w.name}` : undefined}>
            {w?.logo_url ? <img src={w.logo_url} alt="" /> : (w ? initials(w.name) : "")}
          </span>
          {canManage && (
            <>
              <input
                ref={fileRef} type="file" accept="image/*" hidden
                onChange={(e) => { const f = e.target.files?.[0]; if (f) void uploadLogo(f); e.target.value = ""; }}
              />
              <button type="button" className="gx-btn gx-sm" onClick={() => fileRef.current?.click()} disabled={uploading}>
                {uploading ? "Envoi…" : "Changer"}
              </button>
              {w?.logo_url && (
                <button type="button" className="gx-btn gx-sm gx-ghost" onClick={() => void removeLogo()} disabled={uploading}>Retirer</button>
              )}
            </>
          )}
        </div>

        <div className="gx-fr">
          <label>Connexion Meta</label>
          {creds.isLoading ? (
            <span className="gx-hint">Vérification…</span>
          ) : metaConnected ? (
            <span>Rattachée à ce workspace</span>
          ) : (
            <>
              <span>Aucune connexion Meta</span>
              <Link to="/connexions" className="gx-btn gx-sm">Connecter</Link>
            </>
          )}
        </div>

        <div className="gx-fr">
          <label>Autres workspaces</label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button type="button" className="gx-sel" aria-haspopup="menu" disabled={isLoading}>
                <span>{others.length ? `Basculer (${others.length})` : "Aucun autre"}</span>
                <svg className="gx-i" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="console-app-portal">
              {others.map((o) => (
                <DropdownMenuItem key={o.id} onSelect={() => void switchWs(o.id)}>
                  {o.name} · {ROLE_LABEL[o.role] ?? o.role}
                </DropdownMenuItem>
              ))}
              {others.length > 0 && <DropdownMenuSeparator />}
              <DropdownMenuItem onSelect={() => setCreateOpen(true)}>Créer un workspace</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {canDelete && (
          <div className="gx-fr gx-danger">
            <label>Supprimer ce workspace</label>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button type="button" className="gx-btn gx-sm gx-ghost">
                  <svg className="gx-i" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" /></svg>
                  Supprimer…
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Supprimer « {w?.name} » ?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Toutes les campagnes, publicités, produits et avatars seront <strong>définitivement</strong> effacés.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction disabled={deleting} onClick={(e) => { e.preventDefault(); void onDelete(); }}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    {deleting ? "Suppression…" : "Supprimer"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </div>

      <DialogPrimitive.Root open={createOpen} onOpenChange={setCreateOpen}>
        <GxSheetContent className="console-app-portal" aria-describedby={undefined}>
          <div className="gx-sheet-h">
            <div>
              <DialogPrimitive.Title asChild><b>Créer un workspace</b></DialogPrimitive.Title>
              <small>Un espace pour tes campagnes, produits et équipe.</small>
            </div>
            <GxSheetClose />
          </div>
          <form className="gx-ls-b" id="wsForm" onSubmit={(e) => { e.preventDefault(); void doCreate(); }}>
            <label className="gx-lbl" htmlFor="newWs">Nom du workspace</label>
            <input className="gx-in" id="newWs" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Mon entreprise" autoFocus />
          </form>
          <div className="gx-sheet-f">
            <div className="gx-sp" />
            <DialogPrimitive.Close asChild><button type="button" className="gx-btn">Annuler</button></DialogPrimitive.Close>
            <button type="submit" form="wsForm" className="gx-btn gx-pri">
              {creating ? "Création…" : "Créer"}
            </button>
          </div>
        </GxSheetContent>
      </DialogPrimitive.Root>
    </>
  );
}
