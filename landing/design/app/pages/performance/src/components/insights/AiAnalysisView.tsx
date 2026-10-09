import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { getMediaBuyerSummary, type MediaBuyerVerdict } from "@/lib/media-buyer.functions";
import { frSetName } from "@/lib/meta-labels";
import { frMoney, frNumber, frPercent } from "@/lib/format";
import { openMetaAdInChat } from "@/lib/meta-chat-handoff";
import { BudgetIncreaseDialog } from "@/components/results/BudgetIncreaseDialog";
import { MetaConnectButton } from "@/components/MetaConnectDialog";

/*
 * Onglet « Quoi faire ? » : cartes .gx-ang / .gx-anc de la maquette Performance.
 * Même résumé « média buyer » que l'Accueil : aucun second moteur d'analyse.
 */

const KIND: Record<MediaBuyerVerdict["kind"], { label: string; cls: string }> = {
  boost: { label: "À booster", cls: "gx-boost" },
  test: { label: "À tester", cls: "gx-test" },
  cut: { label: "À couper", cls: "gx-cut" },
  steady: { label: "À laisser tourner", cls: "gx-keep" },
} as any;

const ORDER: MediaBuyerVerdict["kind"][] = ["boost", "test", "cut", "steady"];

export function AiAnalysisView({ range, periodLabel }: { range: { since: string; until: string }; periodLabel?: string }) {
  const fetchSummary = useServerFn(getMediaBuyerSummary);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const queryKey = ["media-buyer-summary", range.since, range.until];
  const [budgetTarget, setBudgetTarget] = useState<{ id: string; name: string } | null>(null);

  const q = useQuery({
    queryKey,
    queryFn: () => fetchSummary({ data: range }),
    staleTime: 5 * 60_000,
    gcTime: 30 * 60_000,
    refetchOnWindowFocus: false,
    retry: false,
  });

  const refresh = () => {
    // Un seul rafraîchissement met à jour le résumé de l'Accueil ET cette vue.
    void queryClient.invalidateQueries({ queryKey: ["media-buyer-summary"] });
  };

  const verdicts: MediaBuyerVerdict[] = ((q.data as any)?.verdicts as MediaBuyerVerdict[]) ?? [];
  const ordered = ORDER.flatMap((k) => verdicts.filter((v) => v.kind === k));
  const plural = String((q.data as any)?.resultWordPlural ?? "résultats");
  const singular = String((q.data as any)?.resultWord ?? "résultat");

  return (
    <div className="gx-pane gx-on">
      <div className="gx-bar-f">
        <p className="gx-hint">Calculé sur tes chiffres Meta {periodLabel ?? "de la période choisie"}. Un clic suffit pour appliquer.</p>
        <span className="gx-sp" />
        <button type="button" className="gx-btn gx-sm" onClick={refresh} disabled={q.isFetching}>
          {q.isFetching ? "Analyse en cours…" : "Actualiser l'analyse"}
        </button>
      </div>

      {q.isPending ? (
        <p className="gx-hint">Analyse de tes chiffres…</p>
      ) : q.isError ? (
        <div className="gx-empty">
          <b>L'analyse n'a pas pu aboutir</b>
          <span>Réessaie dans un instant.</span>
          <button type="button" className="gx-btn gx-sm" onClick={() => void q.refetch()}>Réessayer</button>
        </div>
      ) : (q.data as any)?.connected === false ? (
        <div className="gx-empty">
          <b>Connecte ton compte Meta</b>
          <span>Je regarde tes pubs et je te dis lesquelles booster, tester ou couper.</span>
          <MetaConnectButton />
        </div>
      ) : !(q.data as any)?.hasData || ordered.length === 0 ? (
        <div className="gx-empty">
          <b>Pas encore de données à analyser</b>
          <span>Élargis la période en haut à droite, ou publie une pub : l'analyse démarre dès les premiers affichages.</span>
          <div className="gx-row">
            <Link to="/create" className="gx-btn gx-sm gx-pri">Créer ma première pub</Link>
            <Link to="/campaigns" className="gx-btn gx-sm">Voir mes campagnes</Link>
          </div>
        </div>
      ) : (
        <div className="gx-ang">
          {ordered.map((v) => {
            const k = KIND[v.kind] ?? KIND.steady;
            const name = frSetName(v.name);
            const stats = [
              `${frMoney(v.spend)} dépensés`,
              `${frNumber(v.clicks)} clics`,
              `taux de clic ${frPercent(v.ctr, 1)}`,
              v.results > 0
                ? `${frNumber(v.results)} ${v.results > 1 ? plural : singular} à ${frMoney(v.costPerResult)}`
                : `aucun ${singular}`,
            ].join(" · ");
            return (
              <div key={`${v.kind}-${v.id}`} className={`gx-anc ${k.cls}`}>
                <span className="gx-k">{k.label}</span>
                <b>
                  <Link to="/campaigns" search={{ metaId: v.id } as never} title="Ouvrir cette campagne">{name}</Link>
                </b>
                <p>{v.reason}</p>
                <p className="gx-hint">{stats}</p>
                {v.kind === "boost" && (
                  <button type="button" className="gx-btn gx-sm gx-pri" onClick={() => setBudgetTarget({ id: v.id, name: v.name })}>Augmenter le budget</button>
                )}
                {v.kind === "test" && (
                  <button
                    type="button"
                    className="gx-btn gx-sm"
                    onClick={() => {
                      openMetaAdInChat({ campaignId: v.id, campaignName: v.name ?? undefined });
                      void navigate({ to: "/create", search: {} as never });
                    }}
                  >
                    Créer une nouvelle pub
                  </button>
                )}
                {v.kind === "cut" && (
                  <Link to="/campaigns" search={{ metaId: v.id } as never} className="gx-btn gx-sm">Mettre en pause</Link>
                )}
              </div>
            );
          })}
        </div>
      )}

      <BudgetIncreaseDialog
        campaignId={budgetTarget?.id ?? null}
        campaignName={budgetTarget?.name ?? null}
        open={!!budgetTarget}
        onOpenChange={(o) => { if (!o) setBudgetTarget(null); }}
      />
    </div>
  );
}
