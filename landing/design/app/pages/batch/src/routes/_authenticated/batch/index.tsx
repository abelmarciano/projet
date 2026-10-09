import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { Plus } from "lucide-react";

import { listBrandFolders } from "@/lib/batch.functions";
import { BatchList, domainOf } from "@/components/batch/BatchList";

/*
 * Batch Studio : copie de la maquette validée (landing/design/app/views/batch.html),
 * classes gx- de src/styles/gx-console.css, branchée sur les vrais dossiers de marque et les vrais lots.
 */

export const Route = createFileRoute("/_authenticated/batch/")({
  head: () => ({
    meta: [
      { title: "Batch Studio - growthity.ai" },
      { name: "description", content: "Retrouve tes lots de publicités par marque et reprends-les à tout moment." },
      { property: "og:title", content: "Batch Studio - growthity.ai" },
      {
        property: "og:description",
        content: "Retrouve tes lots de publicités par marque et reprends-les à tout moment.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BatchHistoryPage,
});

function FolderBody({ f }: { f: any }) {
  const thumbs: string[] = Array.isArray(f.thumbnails) ? f.thumbnails.filter(Boolean) : [];
  const imgs = [thumbs[0] ?? f.logo_url ?? null, thumbs[1] ?? null].filter(Boolean) as string[];
  const domain = domainOf(f.website);
  const lots = Number(f.batches_count ?? 0);
  const ads = Number(f.ads_count ?? 0);
  const initial = String(f.name ?? "?").trim().charAt(0).toUpperCase() || "?";
  return (
    <>
      {imgs.length === 0 ? (
        // Pas encore de visuel : l'initiale de la marque plutôt que deux cases grises.
        <div className="gx-fold-i gx-fold-0" aria-hidden><span>{initial}</span></div>
      ) : (
        <div className={imgs.length === 1 ? "gx-fold-i gx-fold-1" : "gx-fold-i"}>
          {imgs.map((src) => <img key={src} src={src} alt="" loading="lazy" />)}
        </div>
      )}
      <b>{f.name}</b>
      <small>
        {[domain, `${lots} lot${lots > 1 ? "s" : ""}`, ads > 0 ? `${ads} pub${ads > 1 ? "s" : ""}` : "aucune pub prête"].filter(Boolean).join(" · ")}
      </small>
    </>
  );
}

function BatchHistoryPage() {
  const [view, setView] = useState<"folders" | "all">("folders");
  const foldersFn = useServerFn(listBrandFolders);

  const folders = useQuery({
    queryKey: ["batches", "folders"],
    queryFn: () => foldersFn() as Promise<any[]>,
    staleTime: 10_000,
  });

  const rows = (folders.data ?? []) as any[];
  // Seuls les vrais dossiers (une marque) sont des cartes ; les lots sans marque restent dans la liste.
  const realFolders = rows.filter((f) => f.brand_id);
  const totalLots = rows.reduce((n, f) => n + Number(f.batches_count ?? 0), 0);
  const totalAds = rows.reduce((n, f) => n + Number(f.ads_count ?? 0), 0);
  const empty = !folders.isLoading && totalLots === 0;
  const showFolders = realFolders.length > 0;
  const currentView = showFolders ? view : "all";

  return (
    <div className="gx-page">
      <header className="gx-ph">
        <div>
          <h1>Batch Studio</h1>
          <p>Colle un lien, je te prépare jusqu'à 40 pubs testables.</p>
        </div>
        <div className="gx-pa">
          <Link to="/batch/new" search={{ brandId: undefined }} className="gx-btn gx-pri gx-grad">
            <Plus className="gx-i" />
            Nouveau lot
          </Link>
        </div>
      </header>

      <div className="gx-howto">
        <span><b>1</b>Colle le lien de ton site ou de ton produit</span>
        <span><b>2</b>Valide les angles proposés</span>
        <span><b>3</b>Récupère tes pubs en 3 formats et publie</span>
      </div>

      {folders.isLoading ? (
        <p className="gx-hint">Chargement des lots…</p>
      ) : empty ? (
        <div className="gx-empty">
          <b>Aucun lot pour l'instant</b>
          <span>Colle le lien d'une page produit ou d'un site : je prépare une série de publicités testables.</span>
          <Link to="/batch/new" search={{ brandId: undefined }} className="gx-btn gx-pri gx-grad">
            <Plus className="gx-i" />
            Nouveau lot
          </Link>
        </div>
      ) : (
        <>
          {!folders.isLoading && totalAds === 0 && (
            // Des lots existent mais aucun n'a encore donné de pub : on guide vers la suite.
            <div className="gx-box gx-start-b">
              <div>
                <b>Pas encore de pub prête</b>
                <span>Lance un nouveau lot avec le lien d'une page produit : tes pubs prêtes apparaîtront ici.</span>
              </div>
              <Link to="/batch/new" search={{ brandId: undefined }} className="gx-btn gx-pri">
                <Plus className="gx-i" />
                Commencer un lot
              </Link>
            </div>
          )}

          {showFolders && (
            <div className="gx-tabs">
              <div className="gx-seg" role="tablist" aria-label="Affichage des lots">
                <button type="button" role="tab" aria-selected={currentView === "folders"} onClick={() => setView("folders")}>
                  Dossiers
                </button>
                <button type="button" role="tab" aria-selected={currentView === "all"} onClick={() => setView("all")}>
                  Tous les lots
                </button>
              </div>
            </div>
          )}

          {currentView === "folders" ? (
            <div className="gx-fold-g">
              {realFolders.map((f) => {
                const when = f.last_activity
                  ? `Dernière activité ${formatDistanceToNow(new Date(f.last_activity), { addSuffix: true, locale: fr })}`
                  : undefined;
                return (
                  <Link
                    key={f.brand_id}
                    to="/batch/brand/$brandId"
                    params={{ brandId: f.brand_id }}
                    className="gx-fold"
                    title={when}
                  >
                    <FolderBody f={f} />
                  </Link>
                );
              })}
            </div>
          ) : null}

          <BatchList />
        </>
      )}
    </div>
  );
}
