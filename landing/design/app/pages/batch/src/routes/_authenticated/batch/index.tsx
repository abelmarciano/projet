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
  const thumbs: string[] = Array.isArray(f.thumbnails) ? f.thumbnails : [];
  const first = thumbs[0] ?? f.logo_url ?? null;
  const second = thumbs[1] ?? null;
  const domain = domainOf(f.website);
  const lots = Number(f.batches_count ?? 0);
  const ads = Number(f.ads_count ?? 0);
  return (
    <>
      <div className="gx-fold-i">
        {first ? <img src={first} alt="" loading="lazy" /> : <i aria-hidden />}
        {second ? <img src={second} alt="" loading="lazy" /> : <i aria-hidden />}
      </div>
      <b>{f.name}</b>
      <small>
        {[domain, `${lots} lot${lots > 1 ? "s" : ""}`, `${ads} pub${ads > 1 ? "s" : ""}`].filter(Boolean).join(" · ")}
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
    enabled: view === "folders",
  });

  const rows = (folders.data ?? []) as any[];
  const empty = view === "folders" && !folders.isLoading && rows.length === 0;

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

      {empty ? (
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
          <div className="gx-tabs">
            <div className="gx-seg" role="tablist" aria-label="Affichage des lots">
              <button type="button" role="tab" aria-selected={view === "folders"} onClick={() => setView("folders")}>
                Dossiers
              </button>
              <button type="button" role="tab" aria-selected={view === "all"} onClick={() => setView("all")}>
                Tous les lots
              </button>
            </div>
          </div>

          {view === "folders" ? (
            folders.isLoading ? (
              <p className="gx-hint">Chargement des dossiers…</p>
            ) : (
              <div className="gx-fold-g">
                {rows.map((f) => {
                  const when = f.last_activity
                    ? `Dernière activité ${formatDistanceToNow(new Date(f.last_activity), { addSuffix: true, locale: fr })}`
                    : undefined;
                  return f.brand_id ? (
                    <Link
                      key={f.brand_id}
                      to="/batch/brand/$brandId"
                      params={{ brandId: f.brand_id }}
                      className="gx-fold"
                      title={when}
                    >
                      <FolderBody f={f} />
                    </Link>
                  ) : (
                    // Lots sans marque : pas de page dossier, on bascule sur la liste complète.
                    <button key="none" type="button" className="gx-fold" title={when} onClick={() => setView("all")}>
                      <FolderBody f={f} />
                    </button>
                  );
                })}
              </div>
            )
          ) : null}

          <BatchList />
        </>
      )}
    </div>
  );
}
