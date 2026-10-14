import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { NewProductsBanner } from "@/components/batch/NewProductsBanner";
import { DeleteBrandButton } from "@/components/batch/DeleteBrandButton";
import { useQuery } from "@tanstack/react-query";
import { useEffect, type CSSProperties } from "react";
import { setScreenBrandId, subscribeScreenBrand } from "@/lib/screen-brand";
import { useServerFn } from "@tanstack/react-start";
import { Plus } from "@/components/icons";

import { getBrandMemorySummary } from "@/lib/batch.functions";
import { BatchList, domainOf } from "@/components/batch/BatchList";
import { PageHeader } from "@/components/console/PageHeader";
import { ConsoleSkeleton } from "@/components/console/ConsoleLoading";

/*
 * Dossier de marque Batch Studio : même gabarit que /batch et /batch/new
 * (gx-page, PageHeader avec retour, sections .gx-sh, .gx-box, .gx-chip). Logique inchangée.
 */

export const Route = createFileRoute("/_authenticated/batch/brand/$brandId")({
  head: () => ({
    meta: [
      { title: "Dossier de marque - Batch Studio" },
      { name: "description", content: "Tous les lots de publicités d'une marque et ce qui a déjà été couvert." },
      { property: "og:title", content: "Dossier de marque - Batch Studio" },
      {
        property: "og:description",
        content: "Tous les lots de publicités d'une marque et ce qui a déjà été couvert.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BrandFolderPage,
});

const thumbGrid: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(88px, 1fr))",
  gap: 8,
};

const thumbCell: CSSProperties = {
  aspectRatio: "1 / 1",
  overflow: "hidden",
  borderRadius: 10,
  border: "1px solid var(--gx-line)",
  background: "var(--gx-sunk)",
};

const thumbImg: CSSProperties = { width: "100%", height: "100%", objectFit: "cover", display: "block" };

function BrandFolderPage() {
  const { brandId } = Route.useParams();
  const navigate = useNavigate();
  const memoryFn = useServerFn(getBrandMemorySummary);

  const summary = useQuery({
    queryKey: ["batches", "brand-memory", brandId],
    queryFn: () => memoryFn({ data: { brandId } }) as Promise<any>,
    staleTime: 10_000,
  });

  const brand = summary.data?.brand;

  // Ouvrir le dossier épingle sa marque sur l'onglet ; choisir une autre marque
  // dans le sélecteur ouvre le dossier de cette marque.
  const accessibleBrandId = brand ? brandId : null;
  useEffect(() => {
    if (accessibleBrandId) setScreenBrandId(accessibleBrandId, "context");
  }, [accessibleBrandId]);
  useEffect(() => subscribeScreenBrand((id, source) => {
    if (source === "user" && id && id !== brandId) {
      void navigate({ to: "/batch/brand/$brandId", params: { brandId: id } });
    }
  }), [brandId, navigate]);
  const memory = summary.data?.memory;
  const sourceImages = Array.isArray(summary.data?.source_images) ? summary.data.source_images : [];

  return (
    <div className="gx-page">
      <PageHeader
        back={{ to: "/batch", label: "Tous les dossiers" }}
        eyebrow="Dossier de marque"
        title={brand?.name ?? "Dossier"}
        subtitle={domainOf(brand?.website) ?? "—"}
        actions={
          <>
            {brand ? (
              <DeleteBrandButton brandId={brandId} brandName={brand.name} onDeleted={() => navigate({ to: "/batch" })} />
            ) : null}
            <Link to="/batch/new" search={{ brandId }} className="gx-btn gx-pri">
              <Plus className="gx-i" />
              Nouveau lot pour cette marque
            </Link>
          </>
        }
      />

      {brand ? <NewProductsBanner brandId={brandId} /> : null}
      {summary.isLoading ? (
        <ConsoleSkeleton variant="cards" rows={1} />
      ) : (
        <>
          {sourceImages.length ? (
            <section className="gx-sec" aria-labelledby="brand-images-title">
              <div className="gx-sh">
                <h2 id="brand-images-title">Images de la marque</h2>
                <small>{sourceImages.length} image{sourceImages.length > 1 ? "s" : ""}</small>
              </div>
              <div className="gx-box" style={{ padding: 12 }}>
                <div style={thumbGrid}>
                  {sourceImages.map((image: string) => (
                    <div key={image} style={thumbCell}>
                      <img src={image} alt="" style={thumbImg} loading="lazy" />
                    </div>
                  ))}
                </div>
              </div>
            </section>
          ) : null}

          {memory?.batches_count ? (
            <section className="gx-sec" aria-labelledby="brand-covered-title">
              <div className="gx-sh">
                <h2 id="brand-covered-title">Déjà couvert</h2>
                <small>
                  {memory.batches_count} lot{memory.batches_count > 1 ? "s" : ""} · {memory.used_products.length} produit
                  {memory.used_products.length > 1 ? "s" : ""} · {memory.used_angles.length} angle
                  {memory.used_angles.length > 1 ? "s" : ""} · {memory.used_scenes.length} scène
                  {memory.used_scenes.length > 1 ? "s" : ""} déjà utilisés
                </small>
              </div>
              <div className="gx-box" style={{ padding: 14, display: "flex", flexDirection: "column", gap: 12 }}>
                {memory.used_products.length ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <span className="gx-lbl">Produits</span>
                    <div className="gx-chips">
                      {memory.used_products.slice(0, 8).map((p: any) => (
                        <span key={p.image_url} className="gx-chip" style={{ paddingLeft: 4, maxWidth: "100%" }} title={p.name}>
                          <img
                            src={p.image_url}
                            alt=""
                            loading="lazy"
                            style={{ width: 22, height: 22, borderRadius: 999, objectFit: "cover", flex: "none", background: "var(--gx-sunk)" }}
                          />
                          <span style={{ maxWidth: "10rem", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}
                {memory.used_angles.length ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <span className="gx-lbl">Angles</span>
                    <div className="gx-chips">
                      {memory.used_angles.map((a: any) => (
                        <span key={a.key} className="gx-chip">
                          {a.key} <b className="gx-num" style={{ color: "var(--gx-fg)", fontWeight: 600 }}>{a.count}×</b>
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </section>
          ) : null}
        </>
      )}

      <section className="gx-sec" aria-labelledby="brand-lots-title">
        <div className="gx-sh">
          <h2 id="brand-lots-title">Lots de la marque</h2>
        </div>
        <BatchList brandId={brandId} />
      </section>
    </div>
  );
}
