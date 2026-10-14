import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AlertCircle, CreditCard, LifeBuoy, LogOut, ShieldCheck } from "@/components/icons";
import { Logo } from "@/components/Logo";
import { StatTile } from "@/components/console/StatTile";
import { supabase } from "@/integrations/supabase/client";
import { getPaymentIssue, createPortalSession } from "@/lib/billing/payments.functions";
import { getStripeEnvironment } from "@/lib/stripe";

export const Route = createFileRoute("/_authenticated/paiement-refuse")({
  head: () => ({
    meta: [
      { title: "Paiement à régulariser - Growthity" },
      { name: "description", content: "Mets à jour ton moyen de paiement pour retrouver l'accès à Growthity." },
      { property: "og:title", content: "Paiement à régulariser - Growthity" },
      { property: "og:description", content: "Régularise ton paiement pour retrouver l'accès." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PaymentRefusedPage,
});

function PaymentRefusedPage() {
  const fetchIssue = useServerFn(getPaymentIssue);
  const portal = useServerFn(createPortalSession);
  const [opening, setOpening] = useState(false);
  const { data } = useQuery({
    queryKey: ["payment-issue"],
    queryFn: async () => {
      const r = await fetchIssue({ data: { environment: getStripeEnvironment() } });
      if ("error" in r) throw new Error(r.error);
      return r;
    },
    refetchInterval: 8_000,
    refetchOnWindowFocus: true,
  });
  const qc = useQueryClient();
  // Dès que Stripe confirme le paiement (webhook → billing_status active),
  // on rafraîchit le solde : le garde de l'espace renvoie alors vers le chat.
  useEffect(() => {
    if (data && data.billingStatus !== "past_due" && data.billingStatus !== "canceled") {
      void qc.invalidateQueries({ queryKey: ["credit-summary"] });
      void qc.invalidateQueries({ queryKey: ["workspace-billing"] });
      void qc.invalidateQueries({ queryKey: ["workspace-sidebar"] });
    }
  }, [data, qc]);

  const canceled = data?.billingStatus === "canceled";
  const amount =
    data?.amountDueCents != null
      ? new Intl.NumberFormat("fr-FR", { style: "currency", currency: (data.currency || "eur").toUpperCase() }).format(data.amountDueCents / 100)
      : null;
  const failedAt = data?.failedAt ? new Date(data.failedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) : null;

  const openPortal = async () => {
    setOpening(true);
    try {
      const r = await portal({ data: { environment: getStripeEnvironment(), returnUrl: `${window.location.origin}/create` } });
      if ("error" in r) throw new Error(r.error);
      window.location.href = r.url;
    } catch (e) {
      toast.error((e as Error).message);
      setOpening(false);
    }
  };

  return (
    <div className="gx-solo">
      <header className="gx-solo-top">
        <Logo variant="full" className="gx-solo-logo" />
      </header>

      <main className="gx-solo-main gx-solo-center">
        <div className="gx-solo-narrow">
          <div className="gx-solo-card">
            <div className="gx-solo-status">
              <span className={`gx-solo-badge ${canceled ? "gx-solo-danger" : ""}`}>
                {canceled ? <AlertCircle className="gx-i" /> : <CreditCard className="gx-i" />}
              </span>
              <span className={`gx-st ${canceled ? "gx-bad" : "gx-warn"}`}>
                {canceled ? "Abonnement interrompu" : "Paiement à régulariser"}
              </span>
            </div>
            <h1 className="gx-solo-h1">
              {canceled ? "Ton abonnement est interrompu" : "Ton dernier paiement n'a pas abouti"}
            </h1>
            <p className="gx-solo-lead">
              {canceled
                ? "L'accès à l'application est suspendu. Relance ton abonnement pour retrouver ton espace tel que tu l'as laissé."
                : "Ça arrive souvent : carte expirée, plafond atteint ou validation bancaire manquée. L'accès à l'application est suspendu le temps de régulariser."}
            </p>

            {!canceled && (amount || failedAt) && (
              <div className="gx-solo-kv">
                {amount && <StatTile label="Montant dû" value={amount} tone="warn" />}
                {failedAt && <StatTile label="Tentative échouée le" value={failedAt} />}
              </div>
            )}

            <div className="gx-solo-ok gx-solo-mt">
              <ShieldCheck className="gx-i" />
              <p>Tes données sont intactes. Tes prospects Meta continuent d'arriver et sont conservés. Dès que le paiement passe, l'accès revient automatiquement.</p>
            </div>

            <div className="gx-solo-stack gx-solo-mt">
              {canceled ? (
                <Link to="/souscription" className="gx-btn gx-pri gx-solo-big gx-solo-full">Relancer mon abonnement</Link>
              ) : (
                <>
                  {data?.payUrl && (
                    <a href={data.payUrl} target="_blank" rel="noopener noreferrer" className="gx-btn gx-pri gx-solo-big gx-solo-full">
                      <CreditCard className="gx-i" />Régler la facture maintenant
                    </a>
                  )}
                  <button type="button" onClick={openPortal} disabled={opening}
                    className={`gx-btn gx-solo-big gx-solo-full ${data?.payUrl ? "" : "gx-pri"}`}>
                    <CreditCard className="gx-i" />{opening ? "Ouverture…" : "Mettre à jour mon moyen de paiement"}
                  </button>
                </>
              )}
              <Link to="/parametres/facturation" className="gx-btn gx-ghost gx-solo-full">Voir ma facturation</Link>
            </div>

            <div className="gx-solo-foot">
              <Link to="/aide"><LifeBuoy className="gx-i" />Contacter le support</Link>
              <button type="button"
                onClick={async () => { await supabase.auth.signOut(); window.location.href = "/auth"; }}>
                <LogOut className="gx-i" />Se déconnecter
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
