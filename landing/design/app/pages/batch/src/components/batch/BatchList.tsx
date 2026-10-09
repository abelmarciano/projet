import { useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { ArrowRight, MoreHorizontal, Plus } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  listBatches,
  renameBatch,
  duplicateBatch,
  deleteBatch,
  generatePlan,
  listWorkspaceBrands,
} from "@/lib/batch.functions";
import { CATEGORY_LABELS, MiniStepper, stepFromStatus } from "@/components/batch/batch-shared";

export function domainOf(url?: string | null) {
  if (!url) return null;
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

/** Liste des lots (maquette : .gx-box > .gx-lots > .gx-lotr), éventuellement filtrée sur un dossier de marque. */
export function BatchList({ brandId }: { brandId?: string | null }) {
  const navigate = useNavigate();
  const listFn = useServerFn(listBatches);
  const renameFn = useServerFn(renameBatch);
  const duplicateFn = useServerFn(duplicateBatch);
  const deleteFn = useServerFn(deleteBatch);
  const planFn = useServerFn(generatePlan);
  const listBrandsFn = useServerFn(listWorkspaceBrands);

  const [renaming, setRenaming] = useState<{ id: string; value: string } | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const batches = useQuery({
    queryKey: ["batches", "list", brandId ?? "all"],
    queryFn: () => listFn({ data: { brandId: brandId ?? null } }) as Promise<any[]>,
    staleTime: 10_000,
  });
  // Nom de la marque du lot (même requête et même clé que la page « Nouveau lot »).
  const brands = useQuery({
    queryKey: ["batch", "brands"],
    queryFn: () => listBrandsFn() as Promise<any[]>,
    staleTime: 60_000,
  });
  const brandName = new Map<string, string>(((brands.data ?? []) as any[]).map((b: any) => [b.id, b.name]));

  const rows = (batches.data ?? []) as any[];

  const doRename = async () => {
    if (!renaming) return;
    setBusy(true);
    try {
      await renameFn({ data: { id: renaming.id, title: renaming.value.trim() } });
      setRenaming(null);
      await batches.refetch();
    } catch (e) {
      toast.error(String((e as Error)?.message ?? e));
    } finally {
      setBusy(false);
    }
  };

  const doDuplicate = async (id: string) => {
    setBusy(true);
    toast.info("Duplication en cours…");
    try {
      const res: any = await duplicateFn({ data: { id } });
      await navigate({ to: "/batch/$id", params: { id: res.id } });
    } catch (e) {
      toast.error(String((e as Error)?.message ?? e));
    } finally {
      setBusy(false);
    }
  };

  const doRegeneratePlan = async (b: any) => {
    const previews = Number(b.items_total ?? 0);
    const finals = Number(b.finals_total ?? 0);
    if (previews || finals) {
      const message = `Régénérer le plan supprimera les ${previews} aperçu${previews > 1 ? "s" : ""} et ${finals} pub${finals > 1 ? "s" : ""} de ce lot. Continuer ?`;
      if (!window.confirm(message)) return;
    }
    setBusy(true);
    try {
      const row: any = await planFn({ data: { id: b.id } });
      if (row?.status !== "planned") toast.error(row?.error || "La construction du plan a échoué.");
      else toast.success("Plan régénéré.");
      await navigate({ to: "/batch/$id", params: { id: b.id } });
    } catch (e) {
      toast.error(String((e as Error)?.message ?? e));
    } finally {
      setBusy(false);
    }
  };

  const doDelete = async () => {
    if (!deleting) return;
    setBusy(true);
    try {
      await deleteFn({ data: { id: deleting } });
      setDeleting(null);
      await batches.refetch();
    } catch (e) {
      toast.error(String((e as Error)?.message ?? e));
    } finally {
      setBusy(false);
    }
  };

  if (batches.isLoading) {
    return (
      <div className="gx-box">
        <div className="gx-lots">
          <div className="gx-lotr">
            <div>
              <b>Chargement des lots…</b>
              <small>Un instant</small>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!rows.length) {
    return (
      <div className="gx-empty">
        <b>Aucun lot pour l'instant</b>
        <span>Colle le lien d'une page produit ou d'un site : je prépare une série de publicités testables.</span>
        <Link to="/batch/new" search={{ brandId: brandId ?? undefined }} className="gx-btn gx-pri gx-grad">
          <Plus className="gx-i" />
          Nouveau lot
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="gx-box">
        <div className="gx-lots">
          {rows.map((b) => {
            const step = stepFromStatus(b.status);
            const fallbackDate = new Date(b.created_at ?? Date.now());
            const fallbackTitle = `Lot du ${String(fallbackDate.getDate()).padStart(2, "0")}/${String(fallbackDate.getMonth() + 1).padStart(2, "0")}`;
            const title = b.title || b.pack_title || domainOf(b.source_url) || fallbackTitle;
            const brand = (b.brand_id ? brandName.get(b.brand_id) : null) ?? b.brand_name ?? null;
            const category = b.category ? (CATEGORY_LABELS[b.category] ?? b.category) : null;
            const scope = b.source_scope ? (b.source_scope === "product" ? "Fiche produit" : "Activité") : null;
            const when = formatDistanceToNow(new Date(b.updated_at ?? b.created_at), { addSuffix: true, locale: fr });
            const sub = [brand, category].filter(Boolean).join(" · ") || scope || when;
            return (
              <div key={b.id} className="gx-lotr">
                <Link to="/batch/$id" params={{ id: b.id }} title={[scope, `Modifié ${when}`].filter(Boolean).join(" · ")}>
                  <b>{title}</b>
                  <small>{sub}</small>
                </Link>
                <MiniStepper step={step} failed={b.status === "failed"} error={b.error} complete={b.status === "done"} />
                <span className="gx-lotn">
                  {step >= 4 && b.finals_total ? (
                    <><b className="gx-num">{b.finals_ready}/{b.finals_total}</b> pubs prêtes</>
                  ) : step >= 3 && b.items_total ? (
                    <><b className="gx-num">{b.items_ready}/{b.items_total}</b> aperçus prêts</>
                  ) : (
                    <><b>{b.status === "failed" ? "Échec" : "En préparation"}</b> {when}</>
                  )}
                </span>
                <div className="gx-lota">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button type="button" className="gx-ib gx-sm" aria-label="Actions du lot" disabled={busy}>
                        <MoreHorizontal className="gx-i" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="console-app-portal">
                      <DropdownMenuItem onSelect={() => setRenaming({ id: b.id, value: b.title ?? "" })}>
                        Renommer
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => void doDuplicate(b.id)}>Dupliquer</DropdownMenuItem>
                      {b.status === "failed" && stepFromStatus(b.status) <= 2 ? (
                        <DropdownMenuItem onSelect={() => void doRegeneratePlan(b)}>Régénérer le plan</DropdownMenuItem>
                      ) : null}
                      <DropdownMenuItem className="text-destructive" onSelect={() => setDeleting(b.id)}>
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Link to="/batch/$id" params={{ id: b.id }} className="gx-ib gx-sm" aria-label="Ouvrir le lot">
                    <ArrowRight className="gx-i" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Dialog open={!!renaming} onOpenChange={(o) => (!o ? setRenaming(null) : null)}>
        <DialogContent className="console-app-portal">
          <DialogHeader>
            <DialogTitle>Renommer le lot</DialogTitle>
          </DialogHeader>
          <input
            className="gx-in w-full"
            value={renaming?.value ?? ""}
            placeholder="Laisse vide pour garder le titre détecté"
            aria-label="Nom du lot"
            onChange={(e) => setRenaming((r) => (r ? { ...r, value: e.target.value } : r))}
            onKeyDown={(e) => { if (e.key === "Enter") void doRename(); }}
          />
          <DialogFooter className="gap-2">
            <button type="button" className="gx-btn" onClick={() => setRenaming(null)}>
              Annuler
            </button>
            <button type="button" className="gx-btn gx-pri" onClick={doRename} disabled={busy}>
              Enregistrer
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleting} onOpenChange={(o) => (!o ? setDeleting(null) : null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce lot ?</AlertDialogTitle>
            <AlertDialogDescription>
              Le plan et les aperçus de ce lot seront définitivement supprimés.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={doDelete} disabled={busy}>
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
