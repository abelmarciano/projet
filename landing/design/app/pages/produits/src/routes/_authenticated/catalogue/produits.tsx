import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState, type ReactNode } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { toast } from "sonner";
import { GxSheetContent, GxSheetClose } from "@/components/ui/gx-controls";
import { frNumber } from "@/lib/format";
import { openPromptInChat } from "@/lib/chat-prompt-handoff";
import { useNewAdConversation } from "@/hooks/useNewAdConversation";
import { getShopifyCredentials, listShopifyProducts } from "@/lib/shopify.functions";
import {
  listProductFolders, createProductFolder, deleteProductFolder,
  uploadProductImages, deleteProductImage, renameProductFolder,
} from "@/lib/catalog.functions";

/*
 * Produits : copie de la maquette validée (landing/design/app/views/produits.html),
 * classes gx- de src/styles/gx-console.css, branchée sur les vrais dossiers produits et Shopify.
 */

export const Route = createFileRoute("/_authenticated/catalogue/produits")({
  head: () => ({ meta: [{ title: "Catalogue produit - growthity.ai" }] }),
  component: ProduitsPage,
});

/* ---------- petites aides ---------- */

type LocalImage = { id: string; dataUrl: string };
const MAX_IMAGES = 10;

function Icon({ d, children }: { d?: string; children?: ReactNode }) {
  return (
    <svg className="gx-i" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {d ? <path d={d} /> : children}
    </svg>
  );
}
const PLUS = "M12 5v14M5 12h14";
const UPLOAD = "M12 21V9m0 0-4 4m4-4 4 4M4 3h16";
const CLOSE = "M6 6l12 12M18 6 6 18";

function domainOf(url?: string | null) {
  if (!url) return "";
  try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return ""; }
}
function imagesLabel(n: number) {
  return `${frNumber(n)} image${n > 1 ? "s" : ""}`;
}

/** Même compression que le sélecteur d'images existant (1280 px max, JPEG 0,82). */
function compressImage(file: File): Promise<LocalImage | null> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const MAX = 1280;
        let { width, height } = img;
        if (width > MAX || height > MAX) {
          const ratio = Math.min(MAX / width, MAX / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return resolve(null);
        ctx.drawImage(img, 0, 0, width, height);
        resolve({ id: crypto.randomUUID(), dataUrl: canvas.toDataURL("image/jpeg", 0.82) });
      };
      img.onerror = () => resolve(null);
      img.src = e.target?.result as string;
    };
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
}

async function readImages(files: FileList | File[], room: number): Promise<LocalImage[]> {
  if (room <= 0) {
    toast.error(`Maximum ${MAX_IMAGES} images à la fois.`);
    return [];
  }
  const list = Array.from(files).slice(0, room);
  const results = await Promise.all(list.map((file) => {
    if (!file.type.match(/^image\/(jpeg|png|webp)$/)) {
      toast.error(`${file.name} : format non supporté`);
      return null;
    }
    if (file.size > 20 * 1024 * 1024) {
      toast.error(`${file.name} : trop volumineux (max 20 Mo)`);
      return null;
    }
    return compressImage(file);
  }));
  return results.filter((r): r is LocalImage => !!r);
}

/* ---------- page ---------- */

function ProduitsPage() {
  const qc = useQueryClient();
  const fetchFolders = useServerFn(listProductFolders);
  const createF = useServerFn(createProductFolder);
  const deleteF = useServerFn(deleteProductFolder);
  const renameF = useServerFn(renameProductFolder);
  const uploadImgs = useServerFn(uploadProductImages);
  const deleteImg = useServerFn(deleteProductImage);
  const getShopify = useServerFn(getShopifyCredentials);
  const fetchShopifyProducts = useServerFn(listShopifyProducts);
  const { start: startChat, busy: chatBusy } = useNewAdConversation();

  const folders = useQuery({ queryKey: ["product-folders"], queryFn: () => fetchFolders() });
  const shop = useQuery({ queryKey: ["shopify-credentials"], queryFn: () => getShopify() });
  const shopInfo: any = (shop.data as any)?.connected ? shop.data : null;
  const shopProducts = useQuery({
    // Préfixe invalidé par la connexion / déconnexion Shopify.
    queryKey: ["catalog-picker", "shopify-products", "count"],
    queryFn: () => fetchShopifyProducts({ data: { limit: 100 } }),
    enabled: !!shopInfo,
    staleTime: 10 * 60_000,
    refetchOnWindowFocus: false,
    retry: false,
  });

  const rows: any[] = (folders.data as any[]) ?? [];

  /* ----- création ----- */
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [newImgs, setNewImgs] = useState<LocalImage[]>([]);
  const [busy, setBusy] = useState(false);

  const openCreate = () => { setNewName(""); setNewDesc(""); setNewUrl(""); setNewImgs([]); setCreating(true); };

  const submitCreate = async () => {
    if (busy) return;
    if (!newName.trim()) { toast.error("Nom du produit requis"); return; }
    setBusy(true);
    try {
      const row: any = await createF({ data: { name: newName.trim(), description: newDesc.trim() || undefined, productUrl: newUrl.trim() || undefined } });
      if (newImgs.length && row?.id) {
        await uploadImgs({ data: { folderId: row.id, images: newImgs.map((i) => i.dataUrl) } });
      }
      await qc.invalidateQueries({ queryKey: ["product-folders"] });
      setCreating(false); setNewName(""); setNewDesc(""); setNewUrl(""); setNewImgs([]);
      toast.success("Produit créé");
    } catch (e) { toast.error(e instanceof Error ? e.message : "Erreur"); }
    finally { setBusy(false); }
  };

  /* ----- détail / édition ----- */
  const [editing, setEditing] = useState<{ id: string; name: string; description: string; productUrl: string } | null>(null);
  const editFolder = editing ? rows.find((f) => f.id === editing.id) ?? null : null;
  const [uploading, setUploading] = useState(false);

  const openEdit = (f: any) => setEditing({ id: f.id, name: f.name, description: f.description ?? "", productUrl: f.product_url ?? "" });

  const submitRename = async () => {
    if (!editing || busy) return;
    if (!editing.name.trim()) { toast.error("Nom du produit requis"); return; }
    setBusy(true);
    try {
      await renameF({ data: { id: editing.id, name: editing.name.trim(), description: editing.description.trim() || undefined, productUrl: editing.productUrl.trim() || undefined } });
      await qc.invalidateQueries({ queryKey: ["product-folders"] });
      setEditing(null);
      toast.success("Mis à jour");
    } catch (e) { toast.error(e instanceof Error ? e.message : "Erreur"); }
    finally { setBusy(false); }
  };

  const uploadTo = async (folderId: string, images: LocalImage[]) => {
    if (!images.length) return;
    setUploading(true);
    try {
      await uploadImgs({ data: { folderId, images: images.map((i) => i.dataUrl) } });
      await qc.invalidateQueries({ queryKey: ["product-folders"] });
      toast.success(images.length > 1 ? `${images.length} images ajoutées` : "Image ajoutée");
    } catch (e) { toast.error(e instanceof Error ? e.message : "Erreur"); }
    finally { setUploading(false); }
  };

  const removeFolder = async (id: string, name: string) => {
    if (!confirm(`Supprimer « ${name} » et toutes ses images ?`)) return;
    try {
      await deleteF({ data: { id } });
      await qc.invalidateQueries({ queryKey: ["product-folders"] });
      setEditing(null);
      toast.success("Supprimé");
    } catch (e) { toast.error(e instanceof Error ? e.message : "Erreur"); }
  };

  const removeImage = async (id: string) => {
    try {
      await deleteImg({ data: { id } });
      await qc.invalidateQueries({ queryKey: ["product-folders"] });
    } catch (e) { toast.error(e instanceof Error ? e.message : "Erreur"); }
  };

  /* ----- glisser-déposer sur une carte ----- */
  const [dragOver, setDragOver] = useState<string | null>(null);
  const [droppingId, setDroppingId] = useState<string | null>(null);
  const [brokenImages, setBrokenImages] = useState<Set<string>>(new Set());

  const handleDropFiles = async (folderId: string, fileList: FileList | File[]) => {
    const files = Array.from(fileList).filter((f) => f.type.startsWith("image/"));
    if (files.length === 0) return;
    setDroppingId(folderId);
    try {
      const imgs = await readImages(files, MAX_IMAGES);
      if (!imgs.length) return;
      await uploadImgs({ data: { folderId, images: imgs.map((i) => i.dataUrl) } });
      await qc.invalidateQueries({ queryKey: ["product-folders"] });
      toast.success(`${imgs.length} image(s) ajoutée(s)`);
    } catch (e) { toast.error(e instanceof Error ? e.message : "Erreur"); }
    finally { setDroppingId(null); setDragOver(null); }
  };

  /* ----- créer une pub ----- */
  const createAd = async (name: string) => {
    openPromptInChat(`Crée une pub pour le produit « ${name} »`);
    await startChat();
  };

  /* ----- Shopify ----- */
  const shopCount: number | null = shopProducts.data && !(shopProducts.data as any).error
    ? (((shopProducts.data as any).products as any[]) ?? []).length
    : null;
  const shopLine = shopInfo
    ? [
      shopInfo.shop_domain,
      shopInfo.currency,
      shopCount == null ? null : `${shopCount >= 100 ? "100+" : frNumber(shopCount)} produit${shopCount > 1 ? "s" : ""} disponible${shopCount > 1 ? "s" : ""} dans le chat`,
    ].filter(Boolean).join(" · ")
    : "";

  return (
    <div className="gx-page">
      <div className="gx-ph">
        <div>
          <h1>Produits</h1>
          <p>Organise tes produits en dossiers d'images, réutilisables dans tes pubs.</p>
        </div>
        <div className="gx-pa">
          <button type="button" className="gx-btn gx-pri" onClick={openCreate}><Icon d={PLUS} />Nouveau produit</button>
        </div>
      </div>

      <div className="gx-shop">
        <span className="gx-sh-l">S</span>
        {shop.isLoading ? (
          <div><b>Boutique Shopify</b><small>Vérification de la connexion…</small></div>
        ) : shopInfo ? (
          <div><b>Boutique Shopify connectée</b><small>{shopLine}</small></div>
        ) : (
          <div><b>Boutique Shopify non connectée</b><small>Connecte ta boutique pour utiliser tes produits directement dans le chat.</small></div>
        )}
        <Link to="/connexions" className="gx-btn gx-sm">{shop.isLoading || shopInfo ? "Gérer la connexion" : "Connecter Shopify"}</Link>
      </div>

      {folders.isLoading ? (
        <p className="gx-hint">Chargement des produits…</p>
      ) : (
        <div className="gx-pgrid">
          {rows.map((f: any) => {
            const imgs: any[] = f.images ?? [];
            const domain = domainOf(f.product_url);
            const shown = imgs.slice(0, 2);
            return (
              <div
                key={f.id}
                role="button"
                tabIndex={0}
                aria-label={`Ouvrir ${f.name}`}
                className={dragOver === f.id ? "gx-pcard gx-drag" : "gx-pcard"}
                onClick={() => openEdit(f)}
                onKeyDown={(e) => {
                  if (e.target !== e.currentTarget) return;
                  if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openEdit(f); }
                }}
                onDragOver={(e) => { e.preventDefault(); setDragOver(f.id); }}
                onDragLeave={(e) => { e.preventDefault(); if (e.currentTarget === e.target) setDragOver((p) => p === f.id ? null : p); }}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(null);
                  if (e.dataTransfer.files?.length) void handleDropFiles(f.id, e.dataTransfer.files);
                }}
              >
                <div className="gx-pi">
                  {[0, 1].map((i) => {
                    const img = shown[i];
                    return img?.url && !brokenImages.has(img.id)
                      ? <img key={img.id} src={img.url} alt="" loading="lazy" onError={() => setBrokenImages((prev) => new Set(prev).add(img.id))} />
                      : <span key={`e-${i}`} className="gx-pi0" aria-hidden />;
                  })}
                </div>
                <b>{f.name}</b>
                <small>{[imagesLabel(imgs.length), domain].filter(Boolean).join(" · ")}</small>
                <button
                  type="button"
                  className="gx-pgo"
                  disabled={chatBusy}
                  onClick={(e) => { e.stopPropagation(); void createAd(f.name); }}
                >
                  Créer une pub →
                </button>
                {(dragOver === f.id || droppingId === f.id) && (
                  <span className="gx-pdrop">{droppingId === f.id ? "Envoi des images…" : "Déposer les images"}</span>
                )}
              </div>
            );
          })}
          <button type="button" className="gx-pcard gx-new" onClick={openCreate}>
            <span><Icon d={PLUS} /></span>
            <b>Nouveau produit</b>
            <small>Jusqu'à 10 images à la fois · JPG, PNG, WebP</small>
          </button>
        </div>
      )}

      {/* Nouveau produit */}
      <DialogPrimitive.Root open={creating} onOpenChange={(o) => { if (!o && !busy) setCreating(false); }}>
        <GxSheetContent aria-describedby={undefined}>
          <div className="gx-sheet-h">
            <div>
              <DialogPrimitive.Title asChild><b>Nouveau produit</b></DialogPrimitive.Title>
              <small>Ajoute ses photos : elles seront réutilisables dans tes pubs.</small>
            </div>
            <GxSheetClose />
          </div>
          <form className="gx-ls-b" id="prodForm" onSubmit={(e) => { e.preventDefault(); void submitCreate(); }}>
            <label className="gx-lbl" htmlFor="prodName">Nom du produit</label>
            <input className="gx-in" id="prodName" required value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Ex. : Crème de nuit 50 ml" />
            <ImageDrop
              id="prodFile"
              count={newImgs.length}
              onFiles={async (files) => {
                const added = await readImages(files, MAX_IMAGES - newImgs.length);
                if (added.length) setNewImgs((prev) => [...prev, ...added].slice(0, MAX_IMAGES));
              }}
            />
            {newImgs.length > 0 && (
              <div className="gx-thumbs">
                {newImgs.map((img) => (
                  <span key={img.id} className="gx-pthumb">
                    <img src={img.dataUrl} alt="" />
                    <button type="button" aria-label="Retirer l'image" onClick={() => setNewImgs((prev) => prev.filter((i) => i.id !== img.id))}><Icon d={CLOSE} /></button>
                  </span>
                ))}
              </div>
            )}
            <label className="gx-lbl" htmlFor="prodDesc">Description (optionnel)</label>
            <textarea id="prodDesc" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} rows={3} placeholder="Couleur, matière, public cible…" />
            <label className="gx-lbl" htmlFor="prodUrl">URL produit (optionnel)</label>
            <input className="gx-in" id="prodUrl" type="url" value={newUrl} onChange={(e) => setNewUrl(e.target.value)} placeholder="https://ton-site.fr/produit" />
          </form>
          <div className="gx-sheet-f">
            <div className="gx-sp" />
            <DialogPrimitive.Close asChild><button type="button" className="gx-btn">Annuler</button></DialogPrimitive.Close>
            <button type="submit" form="prodForm" className="gx-btn gx-pri" aria-busy={busy}>{busy ? "Création…" : "Créer le produit"}</button>
          </div>
        </GxSheetContent>
      </DialogPrimitive.Root>

      {/* Détail / édition d'un produit */}
      <DialogPrimitive.Root open={!!editing} onOpenChange={(o) => { if (!o && !busy) setEditing(null); }}>
        <GxSheetContent aria-describedby={undefined}>
          {editing && (
            <>
              <div className="gx-sheet-h">
                <div>
                  <DialogPrimitive.Title asChild><b>{editFolder?.name ?? editing.name}</b></DialogPrimitive.Title>
                  <small>{[imagesLabel((editFolder?.images ?? []).length), domainOf(editFolder?.product_url)].filter(Boolean).join(" · ")}</small>
                </div>
                <GxSheetClose />
              </div>
              <form className="gx-ls-b" id="prodEdit" onSubmit={(e) => { e.preventDefault(); void submitRename(); }}>
                <label className="gx-lbl" htmlFor="editName">Nom</label>
                <input className="gx-in" id="editName" required value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
                <div className="gx-lbl">Images</div>
                {(editFolder?.images ?? []).length > 0 && (
                  <div className="gx-thumbs">
                    {(editFolder?.images ?? []).map((img: any) => (
                      <span key={img.id} className="gx-pthumb">
                        {img.url && !brokenImages.has(img.id)
                          ? <img src={img.url} alt="" onError={() => setBrokenImages((prev) => new Set(prev).add(img.id))} />
                          : <i title="Image indisponible" />}
                        <button type="button" aria-label="Retirer l'image" onClick={() => void removeImage(img.id)}><Icon d={CLOSE} /></button>
                      </span>
                    ))}
                  </div>
                )}
                <ImageDrop
                  id="editFile"
                  count={0}
                  busy={uploading}
                  onFiles={async (files) => {
                    const added = await readImages(files, MAX_IMAGES);
                    await uploadTo(editing.id, added);
                  }}
                />
                <label className="gx-lbl" htmlFor="editDesc">Description</label>
                <textarea id="editDesc" value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} rows={3} />
                <label className="gx-lbl" htmlFor="editUrl">URL produit</label>
                <input className="gx-in" id="editUrl" type="url" value={editing.productUrl} onChange={(e) => setEditing({ ...editing, productUrl: e.target.value })} placeholder="https://ton-site.fr/produit" />
              </form>
              <div className="gx-sheet-f">
                <button type="button" className="gx-btn gx-ghost" onClick={() => void removeFolder(editing.id, editFolder?.name ?? editing.name)}>Supprimer</button>
                <div className="gx-sp" />
                <DialogPrimitive.Close asChild><button type="button" className="gx-btn">Annuler</button></DialogPrimitive.Close>
                <button type="submit" form="prodEdit" className="gx-btn gx-pri" aria-busy={busy}>{busy ? "Enregistrement…" : "Enregistrer"}</button>
              </div>
            </>
          )}
        </GxSheetContent>
      </DialogPrimitive.Root>
    </div>
  );
}

/** Zone « Ajoute jusqu'à 10 images » de la maquette (clic ou glisser-déposer). */
function ImageDrop({ id, count, busy = false, onFiles }: { id: string; count: number; busy?: boolean; onFiles: (files: File[]) => void | Promise<void> }) {
  const [over, setOver] = useState(false);
  return (
    <label
      className={over ? "gx-drop gx-over" : "gx-drop"}
      htmlFor={id}
      onDragOver={(e) => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        if (e.dataTransfer.files?.length) void onFiles(Array.from(e.dataTransfer.files));
      }}
    >
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        id={id}
        multiple
        hidden
        disabled={busy}
        onChange={(e) => {
          const files = e.target.files ? Array.from(e.target.files) : [];
          e.target.value = "";
          if (files.length) void onFiles(files);
        }}
      />
      <Icon d={UPLOAD} />
      <b>{busy ? "Envoi des images…" : "Ajoute jusqu'à 10 images"}</b>
      <small>JPG, PNG, WebP · glisse-les ou clique ici{count > 0 ? ` · ${count}/${MAX_IMAGES}` : ""}</small>
    </label>
  );
}
