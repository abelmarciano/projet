import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState, type CSSProperties } from "react";
import { Download, FolderKanban, ImageIcon, Loader2, Sparkles, Trash2, Upload } from "@/components/icons";
import { forceDownload } from "@/lib/utils";
import { toast } from "sonner";
import { getCampaign, uploadProductImage, removeProductImage } from "@/lib/tram.functions";
import { PageHeader } from "@/components/console/PageHeader";
import { ConsoleEmpty } from "@/components/console/ConsoleEmpty";
import { ConsoleSkeleton } from "@/components/console/ConsoleLoading";

/*
 * Détail d'une campagne (dossier de créations) : gabarit console.
 * gx-page + PageHeader (retour), sections .gx-sh, grille .gx-cgrid / .gx-ccard,
 * vignettes produit sur jetons --gx-*. Logique inchangée.
 */

export const Route = createFileRoute("/_authenticated/campaigns/$id")({
  head: () => ({ meta: [{ title: "Campagne - growthity.ai" }] }),
  component: CampaignPage,
});

const thumbGrid: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(104px, 1fr))",
  gap: 10,
};

const thumbCell: CSSProperties = {
  position: "relative",
  aspectRatio: "1 / 1",
  overflow: "hidden",
  borderRadius: 10,
  border: "1px solid var(--gx-line)",
  background: "var(--gx-sunk)",
};

const thumbImg: CSSProperties = { width: "100%", height: "100%", objectFit: "cover", display: "block" };

function CampaignPage() {
  const { id } = Route.useParams();
  const qc = useQueryClient();
  const fetchCampaign = useServerFn(getCampaign);
  const upload = useServerFn(uploadProductImage);
  const remove = useServerFn(removeProductImage);
  const [uploading, setUploading] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["campaign", id],
    queryFn: () => fetchCampaign({ data: { id } }),
  });

  const onPick = async (files: FileList | null) => {
    if (!files || !files.length) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        if (!file.type.match(/^image\/(jpeg|png|webp)$/)) {
          toast.error(`${file.name} : format non pris en charge`);
          continue;
        }
        if (file.size > 10 * 1024 * 1024) {
          toast.error(`${file.name} : trop lourd (10 Mo maximum)`);
          continue;
        }
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const r = new FileReader();
          r.onload = (e) => resolve(e.target?.result as string);
          r.onerror = reject;
          r.readAsDataURL(file);
        });
        await upload({
          data: {
            campaignId: id,
            fileBase64: dataUrl,
            mimeType: file.type as "image/jpeg" | "image/png" | "image/webp",
          },
        });
      }
      await qc.invalidateQueries({ queryKey: ["campaign", id] });
      toast.success("Images ajoutées");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Échec de l'envoi");
    } finally {
      setUploading(false);
    }
  };

  const onRemove = async (path: string) => {
    setRemoving(path);
    try {
      await remove({ data: { campaignId: id, path } });
      await qc.invalidateQueries({ queryKey: ["campaign", id] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur");
    } finally {
      setRemoving(null);
    }
  };

  const importButton = (
    <label className={uploading ? "gx-btn gx-pri gx-spin-i" : "gx-btn gx-pri"} style={{ cursor: uploading ? "progress" : "pointer" }} aria-disabled={uploading || undefined}>
      {uploading ? <Loader2 className="gx-i" /> : <Upload className="gx-i" />}
      {uploading ? "Import…" : "Importer des images"}
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        hidden
        disabled={uploading}
        onChange={(e) => {
          onPick(e.target.files);
          e.target.value = "";
        }}
      />
    </label>
  );

  const images = data?.productImages ?? [];
  const ads = data?.ads ?? [];

  return (
    <div className="gx-page">
      <PageHeader
        back={{ to: "/dashboard", label: "Retour" }}
        eyebrow="Campagne"
        title={isLoading ? "Chargement…" : data ? data.campaign.name : "Campagne introuvable"}
        subtitle={data?.campaign.description || undefined}
        actions={data ? importButton : undefined}
      />

      {isLoading ? (
        <ConsoleSkeleton variant="cards" rows={1} />
      ) : !data ? (
        <ConsoleEmpty
          icon={FolderKanban}
          title="Campagne introuvable"
          text="Elle a peut-être été supprimée, ou le lien n'est plus valide."
        />
      ) : (
        <>
          <section className="gx-sec" aria-labelledby="cmp-images-title">
            <div className="gx-sh">
              <h2 id="cmp-images-title">Images produit</h2>
              <small>{images.length} image{images.length > 1 ? "s" : ""}</small>
            </div>
            <p className="gx-hint" style={{ marginTop: -6 }}>
              Photos de référence de ton produit : l'IA s'en sert pour générer des créations fidèles.
            </p>

            {images.length === 0 ? (
              <ConsoleEmpty
                compact
                icon={ImageIcon}
                title="Aucune image produit pour l'instant"
                text="Ajoute des photos JPG, PNG ou WebP (10 Mo maximum chacune)."
              />
            ) : (
              <div className="gx-box" style={{ padding: 12 }}>
                <div style={thumbGrid}>
                  {images.map((img) => (
                    <div key={img.path} style={thumbCell}>
                      <img src={img.url} alt="" style={thumbImg} loading="lazy" />
                      <button
                        type="button"
                        onClick={() => onRemove(img.path)}
                        disabled={removing === img.path}
                        className={removing === img.path ? "gx-ib gx-sm gx-spin-i" : "gx-ib gx-sm"}
                        aria-label="Retirer cette image"
                        title="Retirer cette image"
                        style={{ position: "absolute", top: 6, right: 6, color: "var(--gx-bad)" }}
                      >
                        {removing === img.path ? <Loader2 className="gx-i" /> : <Trash2 className="gx-i" />}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          <section className="gx-sec" aria-labelledby="cmp-ads-title">
            <div className="gx-sh">
              <h2 id="cmp-ads-title">Créations</h2>
              <small>{ads.length} création{ads.length > 1 ? "s" : ""}</small>
            </div>

            {ads.length === 0 ? (
              <ConsoleEmpty
                compact
                icon={Sparkles}
                title="Aucune création dans cette campagne"
                text="Les publicités rattachées à cette campagne apparaîtront ici."
              />
            ) : (
              <div className="gx-cgrid">
                {ads.map((ad) => {
                  const isVideo = ad.content_type === "video";
                  return (
                    <div key={ad.id} className="gx-ccard" style={{ cursor: "default" }}>
                      <span className="gx-cm">
                        {ad.generated_url && (isVideo ? (
                          <video src={ad.generated_url} muted playsInline preload="metadata" controls disablePictureInPicture />
                        ) : (
                          <img src={ad.generated_url} alt={ad.title} loading="lazy" />
                        ))}
                      </span>
                      <span className="gx-ty">{isVideo ? "Vidéo" : "Image"}</span>
                      <div>
                        <b title={ad.title}>{ad.title}</b>
                        {ad.prompt ? (
                          <small
                            title={ad.prompt}
                            style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}
                          >
                            {ad.prompt}
                          </small>
                        ) : null}
                        <button
                          type="button"
                          className="gx-btn gx-sm"
                          style={{ width: "100%" }}
                          onClick={() => forceDownload(ad.generated_url!, `${ad.title}.${isVideo ? "mp4" : "png"}`)}
                        >
                          <Download className="gx-i" />Télécharger
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
