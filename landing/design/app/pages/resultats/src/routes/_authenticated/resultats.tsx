import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, type ReactNode } from "react";
import { z } from "zod";
import { listMetaCampaigns } from "@/lib/meta.functions";
import { LeadsView } from "@/components/results/LeadsView";
import { SalesView } from "@/components/results/SalesView";

/*
 * Résultats (mini CRM) : copie de la maquette validée (landing/design/app/views/resultats.html).
 * En-tête + onglets Leads / Ventes ; chaque vue rend son en-tête (ses propres actions) et son panneau.
 */

const Search = z.object({ tab: z.enum(["leads", "ventes"]).optional() });

export const Route = createFileRoute("/_authenticated/resultats")({
  validateSearch: Search,
  head: () => ({
    meta: [
      { title: "Résultats de tes publicités - growthity.ai" },
      { name: "description", content: "Tous les contacts et toutes les ventes générés par tes publicités Meta, au même endroit." },
      { property: "og:title", content: "Résultats de tes publicités - growthity.ai" },
      { property: "og:description", content: "Leads et ventes générés par tes campagnes, avec leur provenance exacte." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ResultsPage,
});

function ResultsPage() {
  const navigate = useNavigate();
  const { tab } = Route.useSearch();
  const fetchCampaigns = useServerFn(listMetaCampaigns);

  const campaigns = useQuery({
    queryKey: ["meta-campaigns-insights"],
    queryFn: () => fetchCampaigns(),
    staleTime: 5 * 60_000,
    gcTime: 30 * 60_000,
    refetchOnWindowFocus: false,
    retry: false,
  });

  // Quels onglets ont du sens sur ce compte ? On se base sur les objectifs réels.
  const { showLeads, showSales } = useMemo(() => {
    const list = campaigns.data ?? [];
    let leads = false;
    let sales = false;
    for (const c of list) {
      const o = String((c as any).objective ?? "").toUpperCase();
      if (o.includes("LEAD")) leads = true;
      if (o.includes("SALES") || o.includes("CONVERSION") || o.includes("PURCHASE") || o.includes("CATALOG")) sales = true;
    }
    if (!leads && !sales) return { showLeads: true, showSales: false };
    return { showLeads: leads, showSales: sales };
  }, [campaigns.data]);

  const active: "leads" | "ventes" =
    tab === "ventes" && showSales ? "ventes" : tab === "leads" && showLeads ? "leads" : showLeads ? "leads" : "ventes";

  const both = showLeads && showSales;

  const subtitle = showSales && !showLeads
    ? "Les ventes générées par tes publicités."
    : showSales
      ? "Ce que tes publicités t'ont réellement rapporté : les contacts reçus et les ventes générées."
      : "Les contacts reçus grâce à tes publicités.";

  const tabs = both ? (
    <div className="gx-tabs">
      <div className="gx-seg" role="tablist" aria-label="Résultats">
        <TabBtn active={active === "leads"} onClick={() => navigate({ to: "/resultats", search: { tab: "leads" } })}>
          Leads
        </TabBtn>
        <TabBtn active={active === "ventes"} onClick={() => navigate({ to: "/resultats", search: { tab: "ventes" } })}>
          Ventes
        </TabBtn>
      </div>
    </div>
  ) : null;

  return (
    <div className="gx-page">
      {active === "leads"
        ? <LeadsView title="Résultats" subtitle={subtitle} tabs={tabs} />
        : <SalesView title="Résultats" subtitle={subtitle} tabs={tabs} />}
    </div>
  );
}

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return <button type="button" role="tab" aria-selected={active} onClick={onClick}>{children}</button>;
}
