import { CreditCost } from "@/components/billing/CreditCost";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { ArrowLeft, Download, Loader2, Maximize2, Pencil, Plus, RefreshCw, Send, Trash2 } from "lucide-react";
import { zipSync } from "fflate";

import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { GxSelectTrigger } from "@/components/ui/gx-controls";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  getBatch,
  setBatchCategory,
  reanalyzeSource,
  getBrandMemorySummary,
  updateBatchSettings,
  generatePlan,
  regenerateAngleVariants,
  updatePlan,
  useAltPlan,
  startPreviews,
  listBatchItems,
  retryPreviewItem,
  discardPreviewItem,
  previewCostEstimate,
  startDeclines,
  updateItemCopy,
  recomposeItem,
  deleteFinalItem,
} from "@/lib/batch.functions";
import { createMetaPublishConversation } from "@/lib/ad-conversations.functions";
import { supabase } from "@/integrations/supabase/client";
import { handleInsufficientCredits } from "@/lib/credit-gate";
import { SourceWorkspace } from "@/components/batch/SourceWorkspace";
import { territoriesFromBrief } from "@/lib/batch-territories";
import { LoadingSteps, stepFromStatus } from "@/components/batch/batch-shared";
import {
  BATCH_DECLINE_RATIOS,
  declineSummary,
  selectedReadyPreviewIds,
  selectedVariantsForPreviews,
  type BatchDeclineRatio,
} from "@/lib/batch-decline-selection";

/*
 * Détail d'un lot : mise en page de la maquette (landing/design/app/views/batch.html, bloc « gx-lot ») :
 * barre d'étapes, liste d'angles à cocher à gauche, grille de visuels à droite, pied d'actions.
 * La logique (requêtes, sauvegardes, génération, déclinaisons, publication) est inchangée.
 */

export const Route = createFileRoute("/_authenticated/batch/$id")({
  head: () => ({
    meta: [
      { title: "Lot - Batch Studio" },
      { name: "description", content: "Source, plan stratégique et aperçus de ton lot de publicités." },
      { property: "og:title", content: "Lot - Batch Studio" },
      {
        property: "og:description",
        content: "Source, plan stratégique et aperçus de ton lot de publicités.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BatchDetailPage,
});

const PLAN_STEPS = ["Analyse de ta cible", "Construction des angles", "Sélection des preuves"];
const PLAN_ETA = 60;
const HARD_TIMEOUT_MS = 180_000;
const toggleListValue = (value: string, list: string[]) => list.includes(value) ? list.filter((item) => item !== value) : [...list, value];

function withTimeout<T>(p: Promise<T>, ms = HARD_TIMEOUT_MS): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const t = setTimeout(() => reject(new Error("Le serveur ne répond pas. Réessaie dans un instant.")), ms);
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

const STEPPER = [
  { key: "source", label: "Source" },
  { key: "plan", label: "Plan" },
  { key: "previews", label: "Aperçus" },
  { key: "grid", label: "Grille" },
];

const LAYOUTS: [string, string][] = [
  ["hook_big", "Accroche géante"],
  ["benefit_list", "3 bénéfices"],
  ["price_offer", "Prix / offre"],
  ["social_proof", "Avis client"],
  ["question_hook", "Question + CTA"],
];
const LAYOUT_LABEL: Record<string, string> = Object.fromEntries(LAYOUTS);

/** Classe de format de la maquette (.gx-r45 / .gx-r11 / .gx-r916). */
function ratioClass(ratio?: string | null) {
  return ratio === "1:1" ? "gx-r11" : ratio === "9:16" ? "gx-r916" : "gx-r45";
}

/** Barre d'étapes de la maquette (.gx-stepper) : étapes atteintes cliquables. */
function Stepper({
  current,
  reached,
  onSelect,
}: {
  current: number;
  reached: number;
  onSelect: (i: number) => void;
}) {
  return (
    <div className="gx-stepper" role="tablist" aria-label="Étapes du lot">
      {STEPPER.map((s, i) => {
        const clickable = i <= reached;
        return (
          <span key={s.key} className={i === current ? "gx-on" : clickable ? "gx-done" : undefined}>
            <button
              type="button"
              role="tab"
              aria-selected={i === current}
              disabled={!clickable}
              onClick={() => clickable && onSelect(i)}
            >
              {i + 1} · {s.label}
            </button>
          </span>
        );
      })}
    </div>
  );
}

function BatchDetailPage() {
  const { id } = Route.useParams();
  const getBatchFn = useServerFn(getBatch);
  const setCategoryFn = useServerFn(setBatchCategory);
  const reanalyzeFn = useServerFn(reanalyzeSource);
  const memoryFn = useServerFn(getBrandMemorySummary);
  const settingsFn = useServerFn(updateBatchSettings);
  const generatePlanFn = useServerFn(generatePlan);
  const regenerateVariantsFn = useServerFn(regenerateAngleVariants);
  const updatePlanFn = useServerFn(updatePlan);
  const useAltPlanFn = useServerFn(useAltPlan);
  const [planTab, setPlanTab] = useState<"a" | "b">("a");
  const startPreviewsFn = useServerFn(startPreviews);
  const listItemsFn = useServerFn(listBatchItems);
  const retryItemFn = useServerFn(retryPreviewItem);
  const discardItemFn = useServerFn(discardPreviewItem);
  const costFn = useServerFn(previewCostEstimate);
  const startDeclinesFn = useServerFn(startDeclines);
  const updateCopyFn = useServerFn(updateItemCopy);
  const recomposeFn = useServerFn(recomposeItem);
  const deleteFinalFn = useServerFn(deleteFinalItem);
  const publishFn = useServerFn(createMetaPublishConversation);

  const [batch, setBatch] = useState<any>(null);
  const [planning, setPlanning] = useState(false);
  const [saved, setSaved] = useState(false);
  const [confirmCost, setConfirmCost] = useState<{ count: number; total: number } | null>(null);
  const [items, setItems] = useState<any[]>([]);
  const [kept, setKept] = useState<Record<string, boolean>>({});
  const [stepOverride, setStepOverride] = useState<number | null>(null);
  const [declineOpen, setDeclineOpen] = useState(false);
  const [ratios, setRatios] = useState<BatchDeclineRatio[]>(["4:5", "1:1"]);
  const [chosenVariants, setChosenVariants] = useState<Record<string, string[]>>({});
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [editing, setEditing] = useState<any | null>(null);
  const [filters, setFilters] = useState({ angle: "all", variant: "all", ratio: "all", layout: "all" });
  // Angles décochés dans la colonne de gauche de la grille (remplace l'ancien filtre « angle »).
  const [hiddenAngles, setHiddenAngles] = useState<Record<string, boolean>>({});
  const [busyFinal, setBusyFinal] = useState(false);
  const [reanalyzing, setReanalyzing] = useState(false);
  const [regeneratingAngle, setRegeneratingAngle] = useState<string | null>(null);
  const [imageUnitCost, setImageUnitCost] = useState(0);
  const [fullscreen, setFullscreen] = useState<{ url: string; label?: string } | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const query = useQuery({
    queryKey: ["batch", id],
    queryFn: () => getBatchFn({ data: { id } }) as Promise<any>,
    staleTime: 5_000,
  });

  useEffect(() => {
    if (query.data) setBatch(query.data);
  }, [query.data]);

  const pack = (batch?.source_pack_resolved ?? null) as any;
  const plan = (batch?.plan ?? null) as any;
  const territories = territoriesFromBrief(batch?.brief);
  const territoryIndex = (name: string) => {
    const n = String(name).toLowerCase();
    const i = territories.findIndex((t) => n.includes(t.name.toLowerCase()) || t.name.toLowerCase().includes(n));
    return i >= 0 ? i : 0;
  };
  const category = (batch?.category as string | undefined) ?? pack?.detected_category ?? "generic";
  const inPreviews = ["previewing", "declining", "done"].includes(batch?.status);
  const naturalStep = ["declining", "done"].includes(batch?.status) ? 3 : inPreviews ? 2 : plan && batch?.status === "planned" ? 1 : 0;
  const reached = Math.max(naturalStep, stepFromStatus(batch?.status) - 1);
  const step = stepOverride !== null && stepOverride <= reached ? stepOverride : naturalStep;
  const planEditable = !!plan && batch?.status !== "done";
  const variantsRegenerable = !!plan && !["extracting", "planning"].includes(String(batch?.status ?? ""));

  useEffect(() => {
    if (!batch?.id || !inPreviews) return;
    let alive = true;
    let lastFetch = 0;
    let busyNow = true;
    // Lien signé déjà affiché par fichier : on le réutilise tant que le fichier
    // ne change pas, sinon chaque rafraîchissement rechargerait toutes les images.
    const urlByPath = new Map<string, { url: string; at: number }>();
    const URL_REUSE_MS = 30 * 60_000;
    const refresh = async () => {
      try {
        lastFetch = Date.now();
        const rows: any[] = (await listItemsFn({ data: { batchId: batch.id } })) ?? [];
        if (!alive) return;
        const now = Date.now();
        const stable = rows.map((r) => {
          const path = String(r.image_path ?? "");
          if (!path || !r.image_url) return r;
          const known = urlByPath.get(path);
          if (known && now - known.at < URL_REUSE_MS) return { ...r, image_url: known.url };
          urlByPath.set(path, { url: r.image_url, at: now });
          return r;
        });
        busyNow = stable.some((r) => r.status === "queued" || r.status === "running");
        setItems(stable);
        // Le suivi « gardé » ne porte que sur les aperçus réellement visibles :
        // tout élément disparu ou écarté sort de la sélection.
        setKept((prev) => {
          const next: Record<string, boolean> = {};
          for (const r of stable) {
            if (r.stage !== "preview" || r.status !== "ready") continue;
            next[r.id] = prev[r.id] === undefined ? true : prev[r.id];
          }
          return next;
        });
      } catch {
        // silencieux : le prochain rafraîchissement retentera
      }
    };
    void refresh();
    // Toutes les 4 s pendant une génération, sinon une fois par minute.
    const timer = setInterval(() => {
      if (busyNow || Date.now() - lastFetch > 60_000) void refresh();
    }, 4000);
    const channel = supabase
      .channel(`batch-items-${batch.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "batch_items", filter: `batch_id=eq.${batch.id}` },
        () => void refresh(),
      )
      .subscribe();
    return () => {
      alive = false;
      clearInterval(timer);
      void supabase.removeChannel(channel);
    };
  }, [batch?.id, inPreviews, listItemsFn]);

  const ctaOptions: string[] = useMemo(() => {
    const all = (plan?.angles ?? []).map((a: any) => String(a.cta ?? "")).filter(Boolean);
    return Array.from(new Set(all));
  }, [plan]);

  const changeCategory = async (value: string) => {
    setBatch((b: any) => (b ? { ...b, category: value } : b));
    try {
      await setCategoryFn({ data: { id, category: value } });
    } catch (e) {
      toast.error(String((e as Error)?.message ?? e));
    }
  };

  const runReanalyze = async () => {
    if (!window.confirm("Ré-analyser la source ? Le plan et les visuels de ce lot seront supprimés.")) return;
    setReanalyzing(true);
    try {
      const next: any = await reanalyzeFn({ data: { id } });
      setBatch(next);
      setItems([]);
      setKept({});
      setStepOverride(0);
      if (next?.status === "failed") toast.error(String(next?.error ?? "La ré-analyse a échoué."));
      else toast.success("Source ré-analysée.");
      void query.refetch();
    } catch (e) {
      toast.error(String((e as Error)?.message ?? e));
    } finally {
      setReanalyzing(false);
    }
  };


  const runPlan = async () => {
    const previewCount = items.filter((item) => item.stage === "preview" && item.status !== "discarded").length;
    const finalCount = items.filter((item) => item.stage === "final" && item.status !== "discarded").length;
    if (previewCount || finalCount) {
      const message = `Régénérer le plan supprimera les ${previewCount} aperçu${previewCount > 1 ? "s" : ""} et ${finalCount} pub${finalCount > 1 ? "s" : ""} de ce lot. Continuer ?`;
      if (!window.confirm(message)) return;
    }
    setPlanning(true);
    // Bascule immédiate sur l'étape Plan (avec le chargement) au lieu de rester sur les aperçus.
    setStepOverride(1);
    try {
      const row: any = await withTimeout(generatePlanFn({ data: { id } }));
      if (row?.status !== "planned") toast.error(row?.error || "La construction du plan a échoué.");
      setBatch(row);
      setItems([]);
      setKept({});
      setChosenVariants({});
      setStepOverride(null);
    } catch (e) {
      toast.error(String((e as Error)?.message ?? e));
    } finally {
      setPlanning(false);
    }
  };


  const scheduleSave = (nextPlan: any) => {
    setSaved(false);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try {
        await updatePlanFn({
          data: {
            id,
            angles: (nextPlan?.angles ?? []).map((a: any) => ({
              key: a.key,
              enabled: a.enabled,
              hook: a.hook ?? "",
              hook_alt: a.hook_alt ?? "",
              subline: a.subline ?? "",
              cta: a.cta ?? "",
              visual_variants: (a.visual_variants ?? []).map((variant: any) => ({ key: variant.key, scene: variant.scene ?? "" })),
            })),
          },
        });
        setSaved(true);
      } catch (e) {
        toast.error(String((e as Error)?.message ?? e));
      }
    }, 800);
  };

  const patchAngle = (key: string, patch: Record<string, unknown>) => {
    setBatch((b: any) => {
      if (!b?.plan) return b;
      const nextPlan = {
        ...b.plan,
        angles: b.plan.angles.map((a: any) => (a.key === key ? { ...a, ...patch } : a)),
      };
      scheduleSave(nextPlan);
      return { ...b, plan: nextPlan };
    });
  };

  const patchVariantScene = (angleKey: string, variantKey: string, scene: string) => {
    const angle = plan?.angles?.find((a: any) => a.key === angleKey);
    if (!angle) return;
    patchAngle(angleKey, { visual_variants: (angle.visual_variants ?? []).map((variant: any) => variant.key === variantKey ? { ...variant, scene } : variant) });
  };

  const regenerateVariants = async (angle: any) => {
    // Une sauvegarde différée d'un champ édité ne doit jamais réécrire l'ancien
    // angle juste après la réponse de régénération.
    if (saveTimer.current) {
      clearTimeout(saveTimer.current);
      saveTimer.current = null;
    }
    setRegeneratingAngle(angle.key);
    try {
      // On n'envoie PAS les scènes actuelles : sinon le modèle les conserve à
      // l'identique et le bouton semble sans effet.
      const next: any = await regenerateVariantsFn({ data: { id, angleKey: angle.key } });
      setBatch((current: any) => ({ ...current, plan: { ...current.plan, angles: current.plan.angles.map((item: any) => item.key === angle.key ? next : item) } }));
      const changed = (next?.visual_variants ?? []).some((v: any, i: number) => String(v?.scene ?? "") !== String(angle?.visual_variants?.[i]?.scene ?? ""));
      toast[changed ? "success" : "message"](changed ? "Nouvelles scènes proposées." : "Le modèle a reproposé les mêmes scènes, réessaie.");
      if (changed) void query.refetch();
    } catch (error) { toast.error(String((error as Error)?.message ?? error)); }
    finally { setRegeneratingAngle(null); }
  };

  const askPreviews = async () => {
    try {
      const c: any = await costFn({ data: { id } });
      setImageUnitCost(c?.unit ?? 0);
      setConfirmCost({ count: c?.count ?? 0, total: c?.total ?? 0 });
    } catch (e) {
      toast.error(String((e as Error)?.message ?? e));
    }
  };

  const confirmPreviews = async () => {
    setConfirmCost(null);
    // Passage immédiat à l'étape Aperçus (barre de progression), sans attendre le serveur.
    const previousStatus = batch?.status;
    const previousItems = items;
    setItems([]);
    setKept({});
    setStepOverride(null);
    setBatch((b: any) => ({ ...b, status: "previewing" }));
    try {
      await startPreviewsFn({ data: { id } });
    } catch (e) {
      setBatch((b: any) => ({ ...b, status: previousStatus }));
      setItems(previousItems);
      if (handleInsufficientCredits(e)) return;
      toast.error(String((e as Error)?.message ?? e));
    }
  };

  const retryItem = async (itemId: string) => {
    try {
      const res = await retryItemFn({ data: { itemId } });
      if (!res.ok) { toast.error(res.error); return; }
      setItems((prev) => prev.map((i) => (i.id === itemId ? { ...i, status: "queued", error: null } : i)));
    } catch (e) {
      toast.error(String((e as Error)?.message ?? e));
    }
  };

  const discardItem = async (itemId: string) => {
    try {
      await discardItemFn({ data: { itemId } });
      setItems((prev) => prev.map((i) => (i.id === itemId ? { ...i, status: "discarded" } : i)));
      setKept((prev) => ({ ...prev, [itemId]: false }));
      setChosenVariants((prev) => {
        const next = { ...prev };
        delete next[itemId];
        return next;
      });
    } catch (e) {
      toast.error(String((e as Error)?.message ?? e));
    }
  };

  const previewItems = items.filter((item) => item.stage === "preview");
  const visiblePreviewItems = previewItems.filter((item) => item.status !== "discarded");
  const finalItems = items.filter((item) => item.stage === "final");
  const variantItems = items.filter((item) => item.stage === "variant");
  const keptIds = selectedReadyPreviewIds(visiblePreviewItems, kept);
  const selectedVariants = selectedVariantsForPreviews(keptIds, chosenVariants);
  const summary = declineSummary({ previewIds: keptIds, variants: selectedVariants, ratios, variantItems, imageUnitCost });
  const toggleRatio = (value: BatchDeclineRatio) => setRatios((current) => current.includes(value) ? current.filter((ratio) => ratio !== value) : [...current, value]);
  const launchDeclines = async () => {
    setBusyFinal(true);
    try {
      await startDeclinesFn({ data: { id, keptItemIds: keptIds, variants: selectedVariants, ratios } });
      setDeclineOpen(false); setStepOverride(3); setBatch((b: any) => ({ ...b, status: "declining" }));
    } catch (error) { toast.error(String((error as Error)?.message ?? error)); } finally { setBusyFinal(false); }
  };
  const saveCopy = async () => {
    if (!editing) return; setBusyFinal(true);
    try { await updateCopyFn({ data: { itemId: editing.id, copy: editing.copy, layoutKey: editing.layout_key } }); setEditing(null); toast.success("Publicité recomposée"); }
    catch (error) { toast.error(String((error as Error)?.message ?? error)); } finally { setBusyFinal(false); }
  };
  const deleteFinal = async (itemId: string) => { try { await deleteFinalFn({ data: { itemId } }); setItems((v) => v.filter((i) => i.id !== itemId)); } catch (error) { toast.error(String((error as Error)?.message ?? error)); } };
  const downloadSelected = async () => {
    const chosen = finalItems.filter((i) => selected[i.id] && i.image_url);
    if (!chosen.length) return;
    const files: Record<string, Uint8Array> = {};
    await Promise.all(chosen.map(async (item, index) => { const response = await fetch(item.image_url); files[`${String(index + 1).padStart(2, "0")}-${item.angle_key}-${item.layout_key}-${item.aspect_ratio.replace(":", "x")}.png`] = new Uint8Array(await response.arrayBuffer()); }));
    const blob = new Blob([zipSync(files)], { type: "application/zip" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = `${title}-batch.zip`; a.click(); URL.revokeObjectURL(url);
  };
  const publishSelected = async () => {
    const chosen = finalItems.filter((i) => selected[i.id] && i.ad_id);
    if (!chosen.length) return;
    const groups = Array.from(new Set(chosen.map((i) => i.angle_key))).map((angle) => ({ angle_key: angle, label: plan?.angles?.find((a: any) => a.key === angle)?.label ?? angle, adIds: chosen.filter((i) => i.angle_key === angle).map((i) => i.ad_id).slice(0, 6) }));
    try { const conversation: any = await publishFn({ data: { adIds: chosen.map((i) => i.ad_id), batchGrouping: groups } }); window.location.assign(`/create?conversation=${conversation.id}`); } catch (error) { toast.error(String((error as Error)?.message ?? error)); }
  };

  const enabledCount = (plan?.angles ?? []).filter((a: any) => a.enabled).length;
  const images: string[] = Array.isArray(pack?.images) ? pack.images : [];

  // --- Dossier de marque : mémoire inter-lots, produits autorisés, ton du lot.
  const brandId: string | null = batch?.brand_id ?? null;
  const brandMemory = useQuery({
    queryKey: ["batch", "brand-memory", brandId, id],
    queryFn: () => memoryFn({ data: { brandId: brandId!, excludeBatchId: id } }) as Promise<any>,
    enabled: !!brandId,
    staleTime: 30_000,
  });
  const memory = brandMemory.data?.memory ?? null;
  const saveSettings = async (patch: any) => {
    try {
      await settingsFn({ data: { id, ...patch } });
      await query.refetch();
    } catch (error) {
      toast.error(String((error as Error)?.message ?? error));
    }
  };

  const title = batch?.title || pack?.title || "Lot";

  /* ---------- dérivés d'affichage (maquette) ---------- */

  const angleOf = (key: string) => (plan?.angles ?? []).find((a: any) => a.key === key);
  const angleLabel = (key: string) => angleOf(key)?.label ?? key;
  const territoryKey = (angle: any) =>
    angle?.territory && territories.length ? String(territories[territoryIndex(angle.territory)]?.key ?? "") : "";
  const formatsCount = new Set(finalItems.map((i) => i.aspect_ratio).filter(Boolean)).size;
  const heading = batch?.batch_number ? `Lot n°${batch.batch_number} · ${title}` : title;
  const headingStats = [
    plan ? `${enabledCount} angle${enabledCount > 1 ? "s" : ""}${territories.length ? ` sur ${territories.length} territoire${territories.length > 1 ? "s" : ""}` : ""}` : null,
    formatsCount ? `${formatsCount} format${formatsCount > 1 ? "s" : ""}` : null,
  ].filter(Boolean).join(" · ");
  const finalAngles = Array.from(new Set(finalItems.map((i) => String(i.angle_key))));
  const visibleFinals = finalItems.filter(
    (i) =>
      !hiddenAngles[String(i.angle_key)] &&
      (filters.variant === "all" || i.variant_key === filters.variant) &&
      (filters.ratio === "all" || i.aspect_ratio === filters.ratio) &&
      (filters.layout === "all" || i.layout_key === filters.layout),
  );
  const selectedCount = finalItems.filter((i) => selected[i.id]).length;
  const anySelected = Object.values(selected).some(Boolean);

  const pageHeader = (
    <header className="gx-ph">
      <div>
        <h1>Batch Studio</h1>
        <p>Colle un lien, je te prépare jusqu'à 40 pubs testables.</p>
      </div>
      <div className="gx-pa">
        <Link to="/batch" className="gx-btn">
          <ArrowLeft className="gx-i" />
          Mes lots
        </Link>
        <Link to="/batch/new" search={{ brandId: batch?.brand_id ?? undefined }} className="gx-btn gx-pri gx-grad">
          <Plus className="gx-i" />
          Nouveau lot
        </Link>
      </div>
    </header>
  );

  if (query.isLoading && !batch) {
    return (
      <div className="gx-page">
        {pageHeader}
        <div className="gx-sh"><h2>Chargement du lot…</h2></div>
        <div className="gx-box gx-lot">
          <Stepper current={0} reached={-1} onSelect={() => {}} />
          <div className="gx-lot-s"><p className="gx-hint">Un instant, je récupère ton lot.</p></div>
        </div>
      </div>
    );
  }

  if (query.isError) {
    return (
      <div className="gx-page">
        {pageHeader}
        <div className="gx-empty">
          <b>Ce lot est introuvable.</b>
          <span>Il a peut-être été supprimé ou appartient à un autre espace.</span>
          <Link to="/batch" className="gx-btn">Retour à mes lots</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="gx-page">
      {pageHeader}

      <div className="gx-sh">
        <h2>{heading}</h2>
        {headingStats ? <small>{headingStats}</small> : null}
      </div>

      <div className="gx-box gx-lot">
        <Stepper current={step} reached={reached} onSelect={setStepOverride} />

        {planning ? (
          <div className="gx-lot-s">
            <LoadingSteps steps={PLAN_STEPS} eta={PLAN_ETA} />
          </div>
        ) : null}

        {!planning && batch?.status === "failed" ? (
          <div className="gx-lot-s">
            <p className="gx-err">{batch.error || "L'analyse a échoué."}</p>
          </div>
        ) : null}

        {/* ---------------------------------------------------------- Source -- */}
        {step === 0 && !planning && pack && Array.isArray(pack.arguments) ? (
          <div className="gx-lot-s">
            <SourceWorkspace
              batchId={id}
              pack={pack}
              category={category}
              creativeMode={batch?.creative_mode}
              brand={batch?.brand}
              memory={memory}
              batchNumber={batch?.batch_number ?? ((memory?.batches_count ?? 0) + 1)}
              planning={planning || reanalyzing}
              hasPlan={!!plan}
              onPack={(next) => setBatch((current: any) => ({ ...current, source_pack_resolved: next }))}
              onCategory={(value) => void changeCategory(value)}
              onCreativeMode={(value) => void saveSettings({ creativeMode: value })}
              market={batch?.market_pack ?? null}
              onMarket={(m) => setBatch((current: any) => ({ ...current, market_pack: m }))}
              brief={batch?.brief ?? null}
              briefStatus={batch?.brief_status ?? null}
              briefError={batch?.brief_error ?? null}
              onBatch={(patch) => setBatch((current: any) => ({ ...current, ...patch }))}
              onBuildPlan={() => void runPlan()}
            />
          </div>
        ) : step === 0 && !planning && batch?.status !== "failed" ? (
          <div className="gx-lot-s">
            <p className="gx-hint">
              <span className="gx-spin" />
              Lecture de la source en cours… recharge la page dans un instant si rien n'apparaît.
            </p>
          </div>
        ) : null}

        {/* ------------------------------------------------------------ Plan -- */}
        {step === 1 && !planning && !plan && batch?.status !== "failed" ? (
          <div className="gx-lot-s">
            <p className="gx-hint"><span className="gx-spin" />Construction du plan en cours…</p>
          </div>
        ) : null}

        {step === 1 && !planning && plan ? (
          <>
            <div className="gx-lot-b">
              <div className="gx-angles" role="group" aria-label="Angles du plan">
                {(plan.angles ?? []).map((a: any) => (
                  <label key={a.key} className="gx-ang" title={!a.enabled && a.disabled_reason ? a.disabled_reason : undefined}>
                    <input
                      type="checkbox"
                      checked={!!a.enabled}
                      disabled={!planEditable}
                      onChange={(e) => patchAngle(a.key, { enabled: e.target.checked })}
                    />
                    <span>{a.label}</span>
                    <em>{territoryKey(a)}</em>
                  </label>
                ))}
              </div>

              <div className="gx-lot-r">
                {territories.length ? (
                  <div className="gx-terr">
                    {territories.map((t) => (
                      <div key={t.key}>
                        <small>Territoire {t.key}{t.contrarian ? " · contrarian" : ""}</small>
                        <b>{t.name}</b>
                        <p>{t.idea}</p>
                      </div>
                    ))}
                  </div>
                ) : null}

                {batch?.plan_alt ? (
                  <div className="gx-fld">
                    <div className="gx-tabs">
                      <div className="gx-seg" role="tablist" aria-label="Version du plan">
                        <button type="button" role="tab" aria-selected={planTab === "a"} onClick={() => setPlanTab("a")}>Plan utilisé</button>
                        <button type="button" role="tab" aria-selected={planTab === "b"} onClick={() => setPlanTab("b")}>Autre proposition</button>
                      </div>
                    </div>
                    <p className="gx-hint">
                      Deux versions du plan ont été écrites pour ce lot. « Plan utilisé » sert pour les aperçus ; « Autre proposition » est une seconde version à comparer, que tu peux choisir à la place.
                    </p>
                  </div>
                ) : null}

                {batch?.plan_alt && planTab === "b" ? (
                  <section className="gx-box gx-pblk">
                    <div className="gx-row">
                      <h3>Autre proposition</h3>
                      <span className="gx-gb gx-out">Lecture seule</span>
                      <div className="gx-sp" />
                      <button
                        type="button"
                        className="gx-btn gx-pri gx-sm"
                        onClick={async () => {
                          try {
                            const next: any = await useAltPlanFn({ data: { id: batch.id } });
                            setBatch((cur: any) => ({ ...cur, ...next }));
                            setPlanTab("a");
                            toast.success("Cette proposition est maintenant le plan utilisé.");
                          } catch (e) {
                            toast.error(String((e as Error)?.message ?? e));
                          }
                        }}
                      >
                        Utiliser ce plan
                      </button>
                    </div>
                    <p>{batch.plan_alt.positioning}</p>
                    <ol>
                      {(batch.plan_alt.angles ?? []).map((a: any) => (
                        <li key={a.key}>
                          <b>{a.label}{a.territory ? ` · ${a.territory}` : ""}</b>
                          <div>{a.hook}</div>
                          {a.subline ? <div className="gx-hint">{a.subline}</div> : null}
                        </li>
                      ))}
                    </ol>
                  </section>
                ) : null}

                {planTab === "b" && batch?.plan_alt ? null : (
                  <>
                    <section className="gx-box gx-pblk">
                      <h3>Ta cible</h3>
                      <dl className="gx-recap">
                        <dt>Qui</dt><dd>{plan.audience?.who}</dd>
                        <dt>Moment</dt><dd>{plan.audience?.moment}</dd>
                        <dt>Frein principal</dt><dd>{plan.audience?.main_pain}</dd>
                        <dt>Positionnement</dt><dd>{plan.positioning}</dd>
                      </dl>
                    </section>

                    {(plan.proofs ?? []).length ? (
                      <section className="gx-box gx-pblk">
                        <h3>Preuves trouvées</h3>
                        <ul>
                          {plan.proofs.map((p: string, i: number) => (
                            <li key={i}>{p}</li>
                          ))}
                        </ul>
                      </section>
                    ) : null}

                    {batch?.market_pack?.error && !batch?.market_pack?.competitors?.ads_analyzed ? (
                      <p className="gx-hint">Veille marché indisponible pour ce lot</p>
                    ) : null}
                    {(plan.competitor_patterns ?? []).length ? (
                      <section className="gx-box gx-pblk">
                        <h3>Ce qui marche chez tes concurrents</h3>
                        <ul>
                          {plan.competitor_patterns.map((p: string, i: number) => (
                            <li key={i}>{p}</li>
                          ))}
                        </ul>
                      </section>
                    ) : null}

                    {(plan.angles ?? []).map((a: any) => {
                      const ref = typeof a.reference_image_index === "number" ? images[a.reference_image_index] : null;
                      const ctas = Array.from(new Set([a.cta, ...ctaOptions].filter(Boolean))) as string[];
                      return (
                        <section key={a.key} className={a.enabled ? "gx-box gx-angd" : "gx-box gx-angd gx-off"}>
                          <div className="gx-angd-h">
                            {ref ? <img src={ref} alt="" loading="lazy" /> : null}
                            <b>{a.label}</b>
                            {a.needs_fact ? (
                              <span className="gx-st gx-bad" title="Aucun fait du site ne prouve cet angle : ajoute un argument ou corrige-le.">à prouver</span>
                            ) : null}
                            {a.territory ? <span className="gx-gb gx-out">{territoryKey(a) ? `${territoryKey(a)} · ` : ""}{a.territory}</span> : null}
                            {a.market_fit === "aligned" ? (
                              <span className="gx-gb">Pattern marché</span>
                            ) : a.market_fit === "contrarian" ? (
                              <span className="gx-gb">Différenciant</span>
                            ) : null}
                            {a.proof_used ? <span className="gx-st gx-on">{a.proof_used}</span> : null}
                          </div>
                          {a.brief_excerpt ? <p className="gx-hint">{a.brief_excerpt}</p> : null}
                          {!a.enabled && a.disabled_reason ? <p className="gx-hint">{a.disabled_reason}</p> : null}

                          <div className="gx-fld">
                            <label className="gx-lbl" htmlFor={`hook-${a.key}`}>Accroche</label>
                            <input
                              id={`hook-${a.key}`}
                              className="gx-in"
                              value={a.hook ?? ""}
                              disabled={!planEditable}
                              onChange={(e) => patchAngle(a.key, { hook: e.target.value })}
                            />
                          </div>
                          {a.hook_alt ? (
                            <div className="gx-row gx-hint">
                              <span>Variante : « {a.hook_alt} »</span>
                              <button
                                type="button"
                                className="gx-btn gx-ghost gx-sm"
                                disabled={!planEditable}
                                onClick={() => patchAngle(a.key, { hook: a.hook_alt, hook_alt: a.hook })}
                              >
                                Utiliser cette variante
                              </button>
                            </div>
                          ) : null}
                          <div className="gx-fld">
                            <label className="gx-lbl" htmlFor={`sub-${a.key}`}>Sous-titre</label>
                            <input
                              id={`sub-${a.key}`}
                              className="gx-in"
                              value={a.subline ?? ""}
                              disabled={!planEditable}
                              onChange={(e) => patchAngle(a.key, { subline: e.target.value })}
                            />
                          </div>
                          <div className="gx-fld">
                            <span className="gx-lbl">Bouton</span>
                            <Select value={a.cta ?? ""} disabled={!planEditable} onValueChange={(v) => patchAngle(a.key, { cta: v })}>
                              <GxSelectTrigger className="gx-w" aria-label="Bouton">
                                <SelectValue />
                              </GxSelectTrigger>
                              <SelectContent className="console-app-portal">
                                {ctas.map((c: string) => (
                                  <SelectItem key={c} value={c}>
                                    {c}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="gx-fld">
                            <div className="gx-row">
                              <span className="gx-lbl">Scènes visuelles</span>
                              <div className="gx-sp" />
                              <button
                                type="button"
                                className={regeneratingAngle === a.key ? "gx-btn gx-sm gx-spin-i" : "gx-btn gx-sm"}
                                disabled={!variantsRegenerable || regeneratingAngle === a.key}
                                onClick={() => regenerateVariants(a)}
                              >
                                {regeneratingAngle === a.key ? <Loader2 className="gx-i" /> : <RefreshCw className="gx-i" />}
                                Régénérer les variantes
                              </button>
                            </div>
                            {(a.visual_variants ?? []).map((variant: any) => (
                              <div key={variant.key} className="gx-scn">
                                <em>{variant.key}</em>
                                <input
                                  className="gx-in"
                                  aria-label={`Scène ${variant.key}`}
                                  value={variant.scene ?? ""}
                                  disabled={!planEditable}
                                  onChange={(event) => patchVariantScene(a.key, variant.key, event.target.value)}
                                />
                              </div>
                            ))}
                          </div>
                        </section>
                      );
                    })}
                  </>
                )}
              </div>
            </div>

            {planTab === "b" && batch?.plan_alt ? null : confirmCost ? (
              <div className="gx-lot-f">
                <span>
                  <b>{confirmCost.count} aperçu{confirmCost.count > 1 ? "s" : ""} · {confirmCost.total} crédit{confirmCost.total > 1 ? "s" : ""}</b>
                  {" "}· une image par angle sélectionné, sans texte incrusté.
                </span>
                <div className="gx-sp" />
                <button type="button" className="gx-btn" onClick={() => setConfirmCost(null)}>
                  Annuler
                </button>
                <button type="button" className="gx-btn gx-pri" onClick={confirmPreviews}>
                  Lancer la génération
                </button>
              </div>
            ) : (
              <div className="gx-lot-f">
                <span>
                  {enabledCount} angle{enabledCount > 1 ? "s" : ""} sélectionné{enabledCount > 1 ? "s" : ""}
                  {saved ? " · enregistré" : ""}
                </span>
                <div className="gx-sp" />
                <button type="button" className="gx-btn" onClick={runPlan} disabled={planning}>
                  <RefreshCw className="gx-i" />
                  Régénérer le plan
                </button>
                <button type="button" className="gx-btn gx-pri" onClick={askPreviews} disabled={enabledCount === 0}>
                  Générer les aperçus
                </button>
              </div>
            )}
          </>
        ) : null}

        {/* -------------------------------------------------------- Aperçus -- */}
        {step === 2 && !planning ? (() => {
          const total = visiblePreviewItems.length || (batch?.status === "previewing" ? enabledCount : 0);
          const done = visiblePreviewItems.filter((i) => i.status === "ready").length;
          const failed = visiblePreviewItems.filter((i) => i.status === "failed").length;
          const pendingCount = Math.max(total - done - failed, 0);
          const inProgress = !!total && pendingCount > 0;
          return (
            <>
              <div className="gx-lot-b">
                <div className="gx-angles" role="group" aria-label="Aperçus à garder">
                  {visiblePreviewItems.length === 0 ? (
                    <p className="gx-hint">Les angles apparaissent ici avec leur aperçu.</p>
                  ) : visiblePreviewItems.map((i) => {
                    const angle = angleOf(i.angle_key);
                    return (
                      <label key={i.id} className="gx-ang" title={i.status === "ready" ? "Garder cet aperçu pour les déclinaisons" : "Aperçu pas encore prêt"}>
                        <input
                          type="checkbox"
                          checked={!!kept[i.id]}
                          disabled={i.status !== "ready"}
                          onChange={(e) => setKept((p) => ({ ...p, [i.id]: e.target.checked }))}
                        />
                        <span>{angle?.label ?? (i.copy as any)?.label ?? i.angle_key}</span>
                        <em>{territoryKey(angle)}</em>
                      </label>
                    );
                  })}
                </div>

                <div className="gx-bgrid">
                  {visiblePreviewItems.length === 0 ? (
                    inProgress || batch?.status === "previewing" ? (
                      Array.from({ length: Math.max(1, Math.min(total || 4, 8)) }).map((_, k) => (
                        <figure key={k} className="gx-r45"><div className="gx-bph gx-wait" aria-label="Aperçu en cours" /></figure>
                      ))
                    ) : (
                      <p className="gx-hint">Aucun aperçu pour l'instant.</p>
                    )
                  ) : visiblePreviewItems.map((i) => {
                    const copy = (i.copy ?? {}) as any;
                    const pending = i.status === "queued" || i.status === "running";
                    const label = copy.label ?? i.angle_key;
                    return (
                      <figure
                        key={i.id}
                        className="gx-r45"
                        title={[label, copy.headline, copy.subline].filter(Boolean).join(" · ") || undefined}
                      >
                        {pending ? (
                          <div className="gx-bph gx-wait" aria-label="Aperçu en cours" />
                        ) : i.status === "ready" && i.image_url ? (
                          <button type="button" aria-label="Agrandir l'aperçu" onClick={() => setFullscreen({ url: i.image_url, label })}>
                            <img src={i.image_url} alt={label} />
                          </button>
                        ) : i.status === "ready" ? (
                          <div className="gx-bph">
                            <p>Image indisponible, recharge la page.</p>
                            <button type="button" className="gx-btn gx-sm" onClick={() => window.location.reload()}>
                              Recharger
                            </button>
                          </div>
                        ) : (
                          <div className="gx-bph">
                            <p>{i.error ?? "Génération échouée."}</p>
                            <button type="button" className="gx-btn gx-sm" onClick={() => retryItem(i.id)}>
                              Relancer
                            </button>
                          </div>
                        )}
                        <span>4:5</span>
                        <div className="gx-bfa">
                          <button type="button" className="gx-ib gx-sm" aria-label="Relancer cet aperçu" title="Relancer" onClick={() => retryItem(i.id)} disabled={pending}>
                            <RefreshCw className="gx-i" />
                          </button>
                          <button type="button" className="gx-ib gx-sm gx-bad" aria-label="Jeter cet aperçu" title="Jeter" onClick={() => discardItem(i.id)}>
                            <Trash2 className="gx-i" />
                          </button>
                        </div>
                      </figure>
                    );
                  })}
                </div>
              </div>

              <div className="gx-lot-f">
                <span>
                  {inProgress ? (
                    <><span className="gx-spin" />Création des aperçus en cours… {done}/{total} prêt{done > 1 ? "s" : ""} · environ 30 s à 1 min par image</>
                  ) : (
                    <>{keptIds.length} aperçu{keptIds.length > 1 ? "s" : ""} gardé{keptIds.length > 1 ? "s" : ""} sur {visiblePreviewItems.length}</>
                  )}
                </span>
                <div className="gx-sp" />
                <button
                  type="button"
                  className="gx-btn gx-pri"
                  disabled={keptIds.length === 0}
                  onClick={() => {
                    const next = { ...chosenVariants };
                    for (const preview of visiblePreviewItems.filter((item) => kept[item.id] && item.status === "ready")) {
                      if (!next[preview.id]?.length) {
                        const angle = plan?.angles?.find((candidate: any) => candidate.key === preview.angle_key);
                        next[preview.id] = (angle?.visual_variants ?? [{ key: "v1" }]).map((variant: any) => variant.key);
                      }
                    }
                    setChosenVariants(next);
                    void costFn({ data: { id } }).then((cost: any) => setImageUnitCost(cost?.unit ?? 0));
                    setDeclineOpen(true);
                  }}
                >
                  Décliner en formats
                </button>
              </div>
            </>
          );
        })() : null}

        {/* --------------------------------------------------------- Grille -- */}
        {step === 3 && !planning ? (() => {
          const liveVariants = variantItems.filter((i) => i.status !== "discarded");
          const vDone = liveVariants.filter((i) => i.status === "ready" || i.status === "failed").length;
          const fDone = finalItems.filter((i) => i.status === "ready" || i.status === "failed").length;
          const fReady = finalItems.filter((i) => i.status === "ready").length;
          const imagesPending = vDone < liveVariants.length;
          const finalsPending = fDone < finalItems.length;
          const filterGroups: { key: "variant" | "ratio" | "layout"; all: string; values: string[]; label: (v: string) => string }[] = [
            { key: "variant", all: "Toutes les variantes", values: Array.from(new Set(finalItems.map((i) => i.variant_key).filter(Boolean))) as string[], label: (v) => v },
            { key: "ratio", all: "Tous les formats", values: ["4:5", "1:1", "9:16"], label: (v) => v },
            { key: "layout", all: "Tous les gabarits", values: LAYOUTS.map(([k]) => k), label: (v) => LAYOUT_LABEL[v] ?? v },
          ];
          return (
            <>
              <div className="gx-lot-b">
                <div className="gx-angles" role="group" aria-label="Angles affichés">
                  {finalAngles.length === 0 ? (
                    <p className="gx-hint">Les angles déclinés apparaissent ici.</p>
                  ) : finalAngles.map((key) => {
                    const angle = angleOf(key);
                    const count = finalItems.filter((i) => String(i.angle_key) === key).length;
                    return (
                      <label key={key} className="gx-ang" title={`${count} pub${count > 1 ? "s" : ""}`}>
                        <input
                          type="checkbox"
                          checked={!hiddenAngles[key]}
                          onChange={(e) => setHiddenAngles((h) => ({ ...h, [key]: !e.target.checked }))}
                        />
                        <span>{angle?.label ?? key}</span>
                        <em>{territoryKey(angle)}</em>
                      </label>
                    );
                  })}
                </div>

                <div className="gx-lot-r">
                  {finalItems.length ? (
                    <div className="gx-bflt">
                      {filterGroups.map((group) => (
                        <Select key={group.key} value={(filters as any)[group.key]} onValueChange={(v) => setFilters((f) => ({ ...f, [group.key]: v }))}>
                          <GxSelectTrigger aria-label={group.all}>
                            <SelectValue />
                          </GxSelectTrigger>
                          <SelectContent className="console-app-portal">
                            <SelectItem value="all">{group.all}</SelectItem>
                            {group.values.map((v) => <SelectItem key={v} value={v}>{group.label(v)}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      ))}
                    </div>
                  ) : null}

                  <div className="gx-bgrid">
                    {finalItems.length === 0 ? (
                      imagesPending || batch?.status === "declining" ? (
                        Array.from({ length: 8 }).map((_, k) => (
                          <figure key={k} className={ratioClass(["4:5", "1:1", "9:16"][k % 3])}><div className="gx-bph gx-wait" aria-label="Pub en cours" /></figure>
                        ))
                      ) : (
                        <p className="gx-hint">Aucune pub pour l'instant.</p>
                      )
                    ) : visibleFinals.map((i) => (
                      <figure key={i.id} className={ratioClass(i.aspect_ratio)} title={i.copy?.scene ? `${i.variant_key} · ${i.copy.scene}` : angleLabel(i.angle_key)}>
                        {i.image_url ? (
                          <button type="button" aria-label="Agrandir la pub" onClick={() => setFullscreen({ url: i.image_url, label: i.copy?.scene ?? i.angle_key })}>
                            <img src={i.image_url} alt="" />
                          </button>
                        ) : i.status === "failed" ? (
                          <div className="gx-bph">
                            <p className="gx-err">{i.error || "Composition échouée."}</p>
                            <button type="button" className="gx-btn gx-sm" onClick={() => recomposeFn({ data: { itemId: i.id } })}>
                              <RefreshCw className="gx-i" />
                              Relancer
                            </button>
                          </div>
                        ) : (
                          <div className="gx-bph gx-wait" aria-label="Composition en cours" />
                        )}
                        <span>{i.aspect_ratio}</span>
                        <input
                          type="checkbox"
                          className="gx-bsel"
                          aria-label="Sélectionner cette pub"
                          checked={!!selected[i.id]}
                          disabled={i.status !== "ready"}
                          onChange={(e) => setSelected((s) => ({ ...s, [i.id]: e.target.checked }))}
                        />
                        <div className="gx-bfa">
                          <button type="button" className="gx-ib gx-sm" aria-label="Modifier le texte" title="Modifier" onClick={() => setEditing(i)}>
                            <Pencil className="gx-i" />
                          </button>
                          <button type="button" className="gx-ib gx-sm" aria-label="Recomposer" title="Recomposer" onClick={() => recomposeFn({ data: { itemId: i.id } })}>
                            <RefreshCw className="gx-i" />
                          </button>
                          <button type="button" className="gx-ib gx-sm gx-bad" aria-label="Supprimer cette pub" title="Supprimer" onClick={() => deleteFinal(i.id)}>
                            <Trash2 className="gx-i" />
                          </button>
                        </div>
                      </figure>
                    ))}
                  </div>
                </div>
              </div>

              <div className="gx-lot-f">
                <span>
                  {imagesPending ? (
                    <><span className="gx-spin" />Étape 1/2 · Création des images… {vDone}/{liveVariants.length}</>
                  ) : (
                    <>
                      {finalsPending ? <span className="gx-spin" /> : null}
                      {fReady} pub{fReady > 1 ? "s" : ""} prête{fReady > 1 ? "s" : ""} sur {finalItems.length}
                      {" · "}{new Set(finalItems.map((i) => i.angle_key)).size} angles · {formatsCount} formats
                      {finalsPending ? " · composition en cours" : ""}
                      {selectedCount ? ` · ${selectedCount} sélectionnée${selectedCount > 1 ? "s" : ""}` : ""}
                    </>
                  )}
                </span>
                <div className="gx-sp" />
                <button type="button" className="gx-btn" disabled={!anySelected} onClick={downloadSelected} title={anySelected ? undefined : "Coche les pubs à télécharger"}>
                  <Download className="gx-i" />
                  Télécharger (zip)
                </button>
                <button type="button" className="gx-btn gx-pri" disabled={!anySelected} onClick={publishSelected} title={anySelected ? undefined : "Coche les pubs à publier"}>
                  <Send className="gx-i" />
                  Publier sur Meta
                </button>
              </div>
            </>
          );
        })() : null}
      </div>

      <Dialog open={!!fullscreen} onOpenChange={(open) => !open && setFullscreen(null)}>
        <DialogContent className="max-w-[95vw] border-none bg-transparent p-0 shadow-none sm:max-w-[95vw] [&>button]:text-white">
          <DialogTitle className="sr-only">Aperçu</DialogTitle>
          {fullscreen ? (
            <div className="flex flex-col items-center gap-2">
              <img src={fullscreen.url} alt={fullscreen.label ?? ""} className="max-h-[88vh] w-auto max-w-full rounded-md object-contain" />
              {fullscreen.label ? <p className="gx-fs-l">{fullscreen.label}</p> : null}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={declineOpen} onOpenChange={setDeclineOpen}>
        <DialogContent className="console-app-portal max-w-2xl">
          <DialogHeader>
            <DialogTitle>Décliner en formats</DialogTitle>
          </DialogHeader>
          <div className="gx-dlg-b">
            <div className="gx-fld">
              <span className="gx-lbl">Formats</span>
              <div className="gx-row">
                {BATCH_DECLINE_RATIOS.map((ratio) => (
                  <label key={ratio} className="gx-chk">
                    <Checkbox checked={ratios.includes(ratio)} onCheckedChange={() => toggleRatio(ratio)} />
                    {ratio}
                  </label>
                ))}
              </div>
            </div>
            <div className="gx-fld">
              <span className="gx-lbl">Variantes par angle</span>
              {visiblePreviewItems.filter((preview) => keptIds.includes(preview.id)).map((preview) => {
                const angle = plan?.angles?.find((candidate: any) => candidate.key === preview.angle_key);
                return (
                  <div key={preview.id} className="gx-fld">
                    <b>{angle?.label ?? preview.angle_key}</b>
                    {(angle?.visual_variants ?? [{ key: "v1", scene: "Scène principale" }]).map((variant: any) => (
                      <label key={variant.key} className="gx-chk">
                        <Checkbox
                          checked={(selectedVariants[preview.id] ?? []).includes(variant.key)}
                          onCheckedChange={() => setChosenVariants((current) => ({ ...current, [preview.id]: toggleListValue(variant.key, current[preview.id] ?? []) }))}
                        />
                        <span>
                          <b>{variant.key}</b> · {variant.scene}
                          {variant.key === "v1" ? <small> réutilise l’aperçu</small> : null}
                        </span>
                      </label>
                    ))}
                  </div>
                );
              })}
            </div>
            <div className="gx-dlg-sum">
              <b>
                {summary.reusedImages} image{summary.reusedImages === 1 ? "" : "s"} réutilisée{summary.reusedImages === 1 ? "" : "s"} · {summary.newImages} nouvelle{summary.newImages === 1 ? "" : "s"} image{summary.newImages === 1 ? "" : "s"} · {summary.finals} pub{summary.finals === 1 ? "" : "s"} à composer · {summary.credits} crédit{summary.credits === 1 ? "" : "s"}
              </b>
              {summary.finals > 40 ? <p className="gx-err">Maximum 40 pubs par lot.</p> : null}
            </div>
          </div>
          <DialogFooter className="gap-2">
            <button type="button" className="gx-btn" onClick={() => setDeclineOpen(false)}>
              Annuler
            </button>
            <button
              type="button"
              className={busyFinal ? "gx-btn gx-pri gx-spin-i" : "gx-btn gx-pri"}
              onClick={launchDeclines}
              disabled={busyFinal || !ratios.length || summary.finals === 0 || summary.finals > 40}
            >
              {busyFinal ? <Loader2 className="gx-i" /> : null}
              Décliner
              <CreditCost credits={summary.credits} />
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="console-app-portal">
          <DialogHeader>
            <DialogTitle>Modifier le texte</DialogTitle>
          </DialogHeader>
          <div className="gx-dlg-b">
            {editing ? (
              <>
                <div className="gx-fld">
                  <span className="gx-lbl">Gabarit</span>
                  <Select value={editing.layout_key} onValueChange={(value) => setEditing((item: any) => ({ ...item, layout_key: value }))}>
                    <GxSelectTrigger className="gx-w" aria-label="Gabarit">
                      <SelectValue />
                    </GxSelectTrigger>
                    <SelectContent className="console-app-portal">
                      {LAYOUTS.map(([key, label]) => <SelectItem key={key} value={key}>{label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                {["headline", "subline", "benefit_1", "benefit_2", "benefit_3", "price", "cta", "quote", "author", "rating", "question"].map((key) => (
                  <div key={key} className="gx-fld">
                    <label className="gx-lbl" htmlFor={`copy-${key}`}>{key}</label>
                    <input
                      id={`copy-${key}`}
                      className="gx-in"
                      value={editing.copy?.[key] ?? ""}
                      onChange={(e) => setEditing((item: any) => ({ ...item, copy: { ...item.copy, [key]: e.target.value } }))}
                    />
                  </div>
                ))}
              </>
            ) : null}
          </div>
          <DialogFooter className="gap-2">
            <button type="button" className="gx-btn" onClick={() => setEditing(null)}>
              Annuler
            </button>
            <button type="button" className="gx-btn gx-pri" disabled={busyFinal} onClick={saveCopy}>
              Enregistrer et recomposer
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
