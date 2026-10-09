import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Link } from "@tanstack/react-router";
import { getCreditSummary } from "@/lib/billing/billing.functions";

/**
 * Carte « Crédits » du pied de menu, reprise de la maquette.
 * Même donnée qu'avant (getCreditSummary) : solde disponible + jauge de consommation
 * du mois (identique à « Consommé ce mois » sur la page Facturation).
 */
export function UsageBadge(_props: { collapsed?: boolean }) {
  const creditsFn = useServerFn(getCreditSummary);
  const { data: credits } = useQuery({
    queryKey: ["credit-summary"],
    queryFn: () => creditsFn(),
    refetchInterval: 30_000,
    staleTime: 10_000,
  });

  const fmt = (n: number) => n.toLocaleString("fr-FR");
  const available = credits ? Math.max(0, credits.balance - credits.held) : 0;
  const monthly = credits?.monthlyCredits ?? 0;
  const used = credits?.usedThisPeriod ?? 0;
  // Jauge de la maquette : part des crédits du mois encore disponibles.
  const pct = monthly ? Math.min(100, Math.round((available / monthly) * 100)) : 0;
  const renew = credits?.periodEnd
    ? new Date(credits.periodEnd).toLocaleDateString("fr-FR", { day: "numeric", month: "short" }).replace(/^1 /, "1er ")
    : null;

  return (
      <Link to="/parametres/facturation" className="gx-credits" title="Voir ma facturation et recharger">
        <div className="gx-crow"><span>Crédits</span><b className="gx-num">{credits ? fmt(available) : "—"}</b></div>
        {monthly > 0 && (
          <span className="gx-meter" title={`${fmt(used)} consommés sur ${fmt(monthly)} ce mois`}>
            <i className={available <= 0 ? "gx-low" : undefined} style={{ width: `${pct}%` }} />
          </span>
        )}
        <small>{monthly > 0 ? `sur ${fmt(monthly)}${renew ? ` · renouvelés le ${renew}` : ""}` : "Recharger mes crédits"}</small>
      </Link>
  );
}
