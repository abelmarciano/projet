import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, Loader2 } from "lucide-react";

import { Select, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { GxSelectTrigger } from "@/components/ui/gx-controls";
import { listProductFolders } from "@/lib/catalog.functions";
import { CreditCost, creditCost } from "@/components/billing/CreditCost";
import { createBatch, deleteBatch, listWorkspaceBrands } from "@/lib/batch.functions";
import { CREATIVE_MODES, CREATIVE_MODE_LABELS } from "@/lib/batch-brand";
import { LoadingSteps } from "@/components/batch/batch-shared";

/*
 * Nouveau lot : formulaire de la maquette (feuille « Nouveau lot » de landing/design/app),
 * en page pleine largeur avec les classes gx- (gx-page, gx-box, gx-in, gx-btn).
 */

export const Route = createFileRoute("/_authenticated/batch/new")({
  head: () => ({
    meta: [
      { title: "Nouveau lot - Batch Studio" },
      { name: "description", content: "Analyse un lien, un produit du catalogue ou une description." },
      { property: "og:title", content: "Nouveau lot - Batch Studio" },
      {
        property: "og:description",
        content: "Analyse un lien, un produit du catalogue ou une description.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  validateSearch: (search: Record<string, unknown>) => ({
    brandId: typeof search["brandId"] === "string" ? (search["brandId"] as string) : undefined,
  }),
  component: NewBatchPage,
});

const EXTRACT_STEPS = ["Lecture du site", "Extraction des arguments", "Détection de l'activité"];
const EXTRACT_ETA = 45;
const HARD_TIMEOUT_MS = 180_000;

const SOURCE_TABS: { value: "url" | "catalog" | "text"; label: string }[] = [
  { value: "url", label: "Lien" },
  { value: "catalog", label: "Catalogue" },
  { value: "text", label: "Description" },
];

function withTimeout<T>(p: Promise<T>, ms = HARD_TIMEOUT_MS): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const t = setTimeout(() => reject(new Error("Le serveur ne répond pas. Réessaie ou change de lien.")), ms);
    p.then(
      (v) => {
        clearTimeout(t);
        resolve(v);
      },
      (e) => {
        clearTimeout(t);
        reject(e);
      },
    );
  });
}

function NewBatchPage() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const createFn = useServerFn(createBatch);
  const deleteFn = useServerFn(deleteBatch);
  const listFoldersFn = useServerFn(listProductFolders);
  const listBrandsFn = useServerFn(listWorkspaceBrands);

  const [tab, setTab] = useState<"url" | "catalog" | "text">("url");
  const [url, setUrl] = useState("");
  const [text, setText] = useState("");
  const [productId, setProductId] = useState("");
  const [loading, setLoading] = useState(false);
  const [brandId, setBrandId] = useState<string>(search.brandId ?? "");
  const [mode, setMode] = useState<string>("auto");
  const [urlTouched, setUrlTouched] = useState(false);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);

  const brands = useQuery({
    queryKey: ["batch", "brands"],
    queryFn: () => listBrandsFn() as Promise<any[]>,
    staleTime: 60_000,
  });

  const brandList = (brands.data ?? []) as any[];
  const selectedBrand = brandList.find((b) => b.id === brandId);

  // Pré-remplissage du lien avec le site de la marque du dossier.
  useEffect(() => {
    if (!urlTouched && selectedBrand?.website && !url) setUrl(selectedBrand.website);
  }, [selectedBrand?.website, urlTouched, url]);

  const folders = useQuery({
    queryKey: ["batch", "product-folders"],
    queryFn: () => listFoldersFn(),
    staleTime: 60_000,
  });

  const urlValid = /^https?:\/\/[a-z0-9-]+(\.[a-z0-9-]+)+(:\d+)?(\/\S*)?$/i.test(url.trim());
  const urlError = tab === "url" && url.trim().length > 0 && !urlValid
    ? "Adresse invalide : elle doit commencer par http:// ou https:// suivie d'un domaine (ex. https://monsite.com)."
    : null;
  const analyzeCost = creditCost("internal/llm-utility");
  const canAnalyze =
    !loading &&
    ((tab === "url" && urlValid) ||
      (tab === "catalog" && !!productId) ||
      (tab === "text" && text.trim().length > 20));

  const analyze = async () => {
    if (tab === "url" && !urlValid) return;
    setAnalyzeError(null);
    setLoading(true);
    try {
      const payload =
        tab === "url"
          ? { sourceType: "url" as const, sourceUrl: url.trim() }
          : tab === "catalog"
            ? { sourceType: "catalog" as const, catalogProductId: productId }
            : { sourceType: "text" as const, text: text.trim() };
      Object.assign(payload, {
        brandId: brandId || null,
        creativeMode: mode === "auto" ? null : (mode as any),
      });
      const row: any = await withTimeout(createFn({ data: payload }));
      if (row?.status === "failed") {
        setAnalyzeError(row.error || "L'analyse a échoué. Vérifie l'adresse et réessaie.");
        if (row?.id) await deleteFn({ data: { id: row.id } }).catch(() => {});
        setLoading(false);
        return;
      }
      if (row?.id) await navigate({ to: "/batch/$id", params: { id: row.id } });
    } catch (e) {
      setAnalyzeError(String((e as Error)?.message ?? e));
      setLoading(false);
    }
  };

  return (
    <div className="gx-page">
      <header className="gx-ph">
        <div>
          <h1>Nouveau lot</h1>
          <p>Colle un lien : je lis la page et je prépare tes pubs.</p>
        </div>
        <div className="gx-pa">
          <Link to="/batch" className="gx-btn">
            <ArrowLeft className="gx-i" />
            Mes lots
          </Link>
        </div>
      </header>

      <form
        className="gx-box gx-lot gx-newlot"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          if (canAnalyze) void analyze();
        }}
      >
        <div className="gx-ls-b">
          <div className="gx-2c">
            <div className="gx-fld">
              <label className="gx-lbl" htmlFor="lotBrand">Dossier / marque</label>
              <Select value={brandId} onValueChange={setBrandId}>
                <GxSelectTrigger id="lotBrand" className="gx-w">
                  <SelectValue placeholder="Détecté automatiquement" />
                </GxSelectTrigger>
                <SelectContent className="console-app-portal">
                  {brandList.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="gx-fld">
              <label className="gx-lbl" htmlFor="lotMode">Ton du lot</label>
              <Select value={mode} onValueChange={setMode}>
                <GxSelectTrigger id="lotMode" className="gx-w">
                  <SelectValue />
                </GxSelectTrigger>
                <SelectContent className="console-app-portal">
                  <SelectItem value="auto">Auto</SelectItem>
                  {CREATIVE_MODES.map((m) => (
                    <SelectItem key={m} value={m}>
                      {CREATIVE_MODE_LABELS[m]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="gx-lbl">Source</div>
          <div className="gx-seg" role="tablist" aria-label="Source du lot">
            {SOURCE_TABS.map((t) => (
              <button key={t.value} type="button" role="tab" aria-selected={tab === t.value} onClick={() => setTab(t.value)}>
                {t.label}
              </button>
            ))}
          </div>

          {tab === "url" ? (
            <div className="gx-fld">
              <label className="gx-lbl" htmlFor="lotUrl">Lien de ton site ou de ton produit</label>
              <input
                id="lotUrl"
                className="gx-in"
                type="url"
                value={url}
                onChange={(e) => {
                  setUrlTouched(true);
                  setUrl(e.target.value);
                }}
                placeholder="https://ta-boutique.fr/produit"
                inputMode="url"
                aria-invalid={!!urlError}
              />
              {urlError && <p className="gx-err">{urlError}</p>}
            </div>
          ) : tab === "catalog" ? (
            <div className="gx-fld">
              <label className="gx-lbl" htmlFor="lotProduct">Produit du catalogue</label>
              <Select value={productId} onValueChange={setProductId}>
                <GxSelectTrigger id="lotProduct" className="gx-w">
                  <SelectValue placeholder="Choisis un produit de ton catalogue" />
                </GxSelectTrigger>
                <SelectContent className="console-app-portal">
                  {((folders.data as any[]) ?? []).map((f: any) => (
                    <SelectItem key={f.id} value={f.id}>
                      {f.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="gx-fld">
              <label className="gx-lbl" htmlFor="lotText">Description</label>
              <textarea
                id="lotText"
                className="gx-in"
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={5}
                placeholder="Décris ton activité, ton offre, ta cible…"
              />
            </div>
          )}

          <p className="gx-hint">Tu valides les angles avant toute génération.</p>
          {analyzeError && <p className="gx-err">{analyzeError}</p>}
        </div>

        <div className="gx-lot-f">
          <div className="gx-sp" />
          <Link to="/batch" className="gx-btn">Annuler</Link>
          <button type="submit" className={loading ? "gx-btn gx-pri gx-spin-i" : "gx-btn gx-pri"} disabled={!canAnalyze}>
            {loading ? <Loader2 className="gx-i" /> : null}
            {tab === "url" ? "Analyser le lien" : "Analyser"}
            <CreditCost credits={analyzeCost} />
          </button>
        </div>
      </form>

      {loading ? (
        <div className="gx-box gx-lot-s gx-newlot">
          <LoadingSteps steps={EXTRACT_STEPS} eta={EXTRACT_ETA} />
        </div>
      ) : null}
    </div>
  );
}
