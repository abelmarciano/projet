import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { GxSheetContent, GxSheetClose } from "@/components/ui/gx-controls";
import { toast } from "sonner";
import { useBrands, useCurrentBrand, useSetActiveBrand } from "@/hooks/useBrands";
import { createBrand, updateBrand, deleteBrand, uploadBrandLogo } from "@/lib/brands.functions";

export const Route = createFileRoute("/_authenticated/parametres/marques")({
  head: () => ({ meta: [{ title: "Marques - growthity.ai" }] }),
  component: Page,
});

async function fileToBase64(file: File): Promise<string> {
  const buf = await file.arrayBuffer();
  let s = ""; const bytes = new Uint8Array(buf);
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s);
}

type Brand = {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  website: string | null;
  description: string | null;
  is_default: boolean;
};

function brandInitials(name?: string | null) {
  return name?.trim().slice(0, 2).toUpperCase() || "M";
}

function BrandMark({ brand }: { brand: Brand }) {
  return (
    <span className="gx-bm gx-bm-img" aria-hidden="true">
      {brand.logo_url ? <img src={brand.logo_url} alt="" /> : brandInitials(brand.name)}
    </span>
  );
}

function Page() {
  const qc = useQueryClient();
  const { data: brands, isLoading } = useBrands();
  const { data: current } = useCurrentBrand();
  const setActive = useSetActiveBrand();
  const createFn = useServerFn(createBrand);
  const delFn = useServerFn(deleteBrand);

  const [openId, setOpenId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newSite, setNewSite] = useState("");
  const [creating, setCreating] = useState(false);

  const list = ((brands as unknown as Brand[]) ?? []);
  const selected = list.find((b) => b.id === openId) ?? null;
  const currentId = (current as any)?.id as string | undefined;

  const doCreate = async () => {
    if (creating) return;
    if (!newName.trim()) { toast.error("Indique le nom de la marque."); return; }
    setCreating(true);
    try {
      const b = await createFn({ data: { name: newName.trim(), website: newSite.trim() || null } });
      await qc.invalidateQueries({ queryKey: ["brands"] });
      setNewName(""); setNewSite("");
      setCreateOpen(false);
      setOpenId((b as { id: string }).id);
      toast.success("Marque créée");
    } catch (e) { toast.error(e instanceof Error ? e.message : "Erreur"); }
    finally { setCreating(false); }
  };

  const onDelete = async (id: string) => {
    try {
      await delFn({ data: { id } });
      qc.clear();
      toast.success("Marque supprimée");
      setOpenId(null);
    } catch (e) { toast.error(e instanceof Error ? e.message : "Erreur"); }
  };

  return (
    <>
      <div className="gx-mgrid">
        {isLoading ? (
          <div className="gx-box gx-mc"><span className="gx-bm gx-bm-img" aria-hidden="true" /><b>Chargement…</b><small>Tes marques arrivent</small></div>
        ) : list.map((b) => (
          <button key={b.id} type="button" className="gx-box gx-mc" onClick={() => setOpenId(b.id)} aria-label={`Modifier ${b.name}`}>
            <BrandMark brand={b} />
            <b>{b.name}</b>
            <small>{b.website || "Pas de site renseigné"}</small>
            {(b.is_default || b.id === currentId) && (
              <span className="gx-row">
                {b.is_default && <span className="gx-gb">Par défaut</span>}
                {b.id === currentId && <span className="gx-gb gx-out">Active</span>}
              </span>
            )}
          </button>
        ))}
        <button type="button" className="gx-box gx-mc gx-new" onClick={() => setCreateOpen(true)}>
          <svg className="gx-i" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
          <b>Ajouter une marque</b>
          <small>Nom et site de ta marque, utilisés par le chat</small>
        </button>
      </div>

      {/* Nouvelle marque */}
      <DialogPrimitive.Root open={createOpen} onOpenChange={setCreateOpen}>
        <GxSheetContent className="console-app-portal" aria-describedby={undefined}>
          <div className="gx-sheet-h">
            <div>
              <DialogPrimitive.Title asChild><b>Ajouter une marque</b></DialogPrimitive.Title>
              <small>Une marque = une entreprise ou un client. Le chat utilise automatiquement la marque active.</small>
            </div>
            <GxSheetClose />
          </div>
          <form className="gx-ls-b" id="brandNew" onSubmit={(e) => { e.preventDefault(); void doCreate(); }}>
            <label className="gx-lbl" htmlFor="bnName">Nom</label>
            <input className="gx-in" id="bnName" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Nouvelle marque…" autoFocus />
            <label className="gx-lbl" htmlFor="bnSite">Site web</label>
            <input className="gx-in" id="bnSite" value={newSite} onChange={(e) => setNewSite(e.target.value)} placeholder="exemple.fr" />
            <p className="gx-hint">Pas besoin de https:// : écris juste le domaine.</p>
          </form>
          <div className="gx-sheet-f">
            <div className="gx-sp" />
            <DialogPrimitive.Close asChild><button type="button" className="gx-btn">Annuler</button></DialogPrimitive.Close>
            <button type="submit" form="brandNew" className="gx-btn gx-pri">{creating ? "Création…" : "Créer la marque"}</button>
          </div>
        </GxSheetContent>
      </DialogPrimitive.Root>

      {/* Fiche d'une marque */}
      <DialogPrimitive.Root open={!!selected} onOpenChange={(o) => { if (!o) setOpenId(null); }}>
        {selected && (
          <GxSheetContent className="console-app-portal" aria-describedby={undefined}>
            <BrandForm
              brand={selected}
              isActive={currentId === selected.id}
              onSetActive={() => void setActive(selected.id)}
              onDelete={() => void onDelete(selected.id)}
            />
          </GxSheetContent>
        )}
      </DialogPrimitive.Root>
    </>
  );
}

function BrandForm({ brand, isActive, onSetActive, onDelete }: {
  brand: Brand; isActive: boolean; onSetActive: () => void; onDelete: () => void;
}) {
  const qc = useQueryClient();
  const saveFn = useServerFn(updateBrand);
  const uploadFn = useServerFn(uploadBrandLogo);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const [name, setName] = useState(brand.name);
  const [website, setWebsite] = useState(brand.website ?? "");
  const [description, setDescription] = useState(brand.description ?? "");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Remet les champs à jour quand on change de marque.
  useEffect(() => {
    setName(brand.name); setWebsite(brand.website ?? ""); setDescription(brand.description ?? "");
  }, [brand.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const save = async () => {
    if (saving) return;
    if (!name.trim()) { toast.error("Le nom est obligatoire."); return; }
    setSaving(true);
    try {
      await saveFn({ data: {
        id: brand.id,
        name: name.trim(),
        website: website.trim() || null,
        description: description.trim() || null,
      } });
      await qc.invalidateQueries({ queryKey: ["brands"] });
      toast.success("Marque enregistrée");
    } catch (e) { toast.error(e instanceof Error ? e.message : "Erreur"); }
    finally { setSaving(false); }
  };

  const uploadLogo = async (file: File) => {
    if (!file.type.startsWith("image/")) { toast.error("Fichier image requis"); return; }
    if (file.size > 2 * 1024 * 1024) { toast.error("Max 2 Mo"); return; }
    setUploading(true);
    try {
      const base64 = await fileToBase64(file);
      await uploadFn({ data: { brandId: brand.id, fileName: file.name, contentType: file.type, base64 } });
      await qc.invalidateQueries({ queryKey: ["brands"] });
      toast.success("Logo mis à jour");
    } catch (e) { toast.error(e instanceof Error ? e.message : "Erreur"); }
    finally { setUploading(false); }
  };

  return (
    <>
      <div className="gx-sheet-h">
        <div className="gx-who">
          <BrandMark brand={brand} />
          <div>
            <DialogPrimitive.Title asChild><b>{brand.name}</b></DialogPrimitive.Title>
            <small>{[brand.is_default ? "Marque par défaut" : null, isActive ? "Active" : null].filter(Boolean).join(" · ") || "Marque"}</small>
          </div>
        </div>
        <GxSheetClose />
      </div>
      <form className="gx-ls-b" id="brandEdit" onSubmit={(e) => { e.preventDefault(); void save(); }}>
        <div className="gx-row">
          <input ref={fileRef} type="file" accept="image/*" hidden
            onChange={(e) => { const f = e.target.files?.[0]; if (f) void uploadLogo(f); e.target.value = ""; }} />
          <button type="button" className="gx-btn gx-sm" onClick={() => fileRef.current?.click()} disabled={uploading}>
            {uploading ? "Envoi du logo…" : "Changer le logo"}
          </button>
          {!isActive && <button type="button" className="gx-btn gx-sm" onClick={onSetActive}>Activer</button>}
        </div>
        <label className="gx-lbl" htmlFor="bName">Nom</label>
        <input className="gx-in" id="bName" value={name} onChange={(e) => setName(e.target.value)} />
        <label className="gx-lbl" htmlFor="bSite">Site web</label>
        <input className="gx-in" id="bSite" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="exemple.fr" />
        <p className="gx-hint">Pas besoin de https:// : écris juste le domaine (ex : Leadeurs.fr).</p>
        <label className="gx-lbl" htmlFor="bDesc">Description courte</label>
        <textarea id="bDesc" rows={3} value={description} onChange={(e) => setDescription(e.target.value)}
          placeholder="Ex : Marque française de cosmétiques naturels pour femmes 25-45 ans." />
      </form>
      <div className="gx-sheet-f">
        {!brand.is_default && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button type="button" className="gx-btn gx-sm gx-ghost">Supprimer…</button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Supprimer « {brand.name} » ?</AlertDialogTitle>
                <AlertDialogDescription>Les créations et campagnes liées ne seront pas supprimées mais perdront leur rattachement à cette marque.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction onClick={onDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Supprimer</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
        <div className="gx-sp" />
        <DialogPrimitive.Close asChild><button type="button" className="gx-btn">Fermer</button></DialogPrimitive.Close>
        <button type="submit" form="brandEdit" className="gx-btn gx-pri">{saving ? "Enregistrement…" : "Enregistrer"}</button>
      </div>
    </>
  );
}
