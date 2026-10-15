import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getActorMedia, listStockActors } from "@/lib/stock-actors.functions";

/** Carte « Acteur » affichée au-dessus du message envoyé, même gabarit que la carte produit. */
export function ActorCardChip({ id, name }: { id: string; name: string | null }) {
  const listFn = useServerFn(listStockActors);
  const mediaFn = useServerFn(getActorMedia);
  const listQ = useQuery({ queryKey: ["catalog-picker", "stock-actors"], queryFn: () => listFn(), staleTime: 60_000 });
  const actor = ((listQ.data as any[] | undefined) ?? []).find((a) => a?.id === id);
  // Acteur absent de la galerie (avatar perso) : on demande son média directement.
  const mediaQ = useQuery({
    queryKey: ["actor-media", id],
    queryFn: () => mediaFn({ data: { id } }),
    enabled: listQ.isSuccess && !actor,
    staleTime: 5 * 60 * 1000,
  });
  const label = (typeof actor?.name === "string" && actor.name) || name || "Acteur";
  const img = typeof actor?.reference_image_url === "string" ? actor.reference_image_url : ((mediaQ.data as { url?: string } | undefined)?.url ?? null);
  const sub = actor?.gender === "male" ? "Homme · face caméra" : actor?.gender === "female" ? "Femme · face caméra" : "Face caméra";
  return (
    <div className="flex w-72 max-w-full items-center gap-3 rounded-xl border bg-card p-2 pr-3 text-card-foreground shadow-sm">
      {img ? (
        <img src={img} alt={label} referrerPolicy="no-referrer" className="h-16 w-12 flex-none rounded-lg border object-cover object-top bg-muted" />
      ) : (
        <div className="h-16 w-12 flex-none rounded-lg bg-muted" />
      )}
      <div className="min-w-0 flex-1">
        <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Acteur</div>
        <div className="truncate text-sm font-semibold">{label}</div>
        <div className="truncate text-xs text-muted-foreground">{sub}</div>
      </div>
    </div>
  );
}
