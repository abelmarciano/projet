import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Link } from "@tanstack/react-router";
import { Zap } from "lucide-react";
import { getCreditSummary } from "@/lib/billing/billing.functions";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

/**
 * Carte « Crédits » du pied de menu, reprise de la maquette.
 * Même donnée qu'avant (getCreditSummary) : solde disponible + jauge de consommation
 * du mois (identique à « Consommé ce mois » sur la page Facturation).
 */
export function UsageBadge({ collapsed = false }: { collapsed?: boolean }) {
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
  const pct = monthly ? Math.min(100, Math.round((used / monthly) * 100)) : 0;

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link to="/parametres/facturation" className="gx-credq" aria-label={credits ? `${fmt(available)} crédits` : "Crédits"}>
            <Zap className="gx-i" aria-hidden />
          </Link>
        </TooltipTrigger>
        {collapsed && <TooltipContent side="right">{credits ? `${fmt(available)} crédits` : "Crédits"}</TooltipContent>}
      </Tooltip>
      <div className="gx-credits">
        <div className="gx-crow"><span>Crédits</span><b className="gx-num">{credits ? fmt(available) : "—"}</b></div>
        {monthly > 0 && (
          <span className="gx-meter" title={`${fmt(used)} consommés sur ${fmt(monthly)} ce mois`}>
            <i className={available <= 0 ? "gx-low" : undefined} style={{ width: `${pct}%` }} />
          </span>
        )}
        <small>{monthly > 0 ? `${fmt(used)} / ${fmt(monthly)} ce mois · ` : ""}<Link to="/parametres/facturation">Recharger</Link></small>
      </div>
    </>
  );
}
