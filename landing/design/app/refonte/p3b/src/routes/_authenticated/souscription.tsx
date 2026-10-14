import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Check, Sparkles, ShieldCheck, LogOut } from "@/components/icons";
import { Logo } from "@/components/Logo";
import { PageHeader } from "@/components/console/PageHeader";
import { ConsoleLoading } from "@/components/console/ConsoleLoading";
import { supabase } from "@/integrations/supabase/client";
import { getCreditSummary } from "@/lib/billing/billing.functions";
import { usePlansGrid } from "@/lib/billing/use-plans";
import {
  ANNUAL_DISCOUNT_RATE, annualMonthlyEquivalent, annualPrice, annualSavings, type BillingInterval,
} from "@/lib/billing/pricing";
import { CheckoutDialog, type CheckoutTarget } from "@/components/billing/CheckoutDialog";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";

export const Route = createFileRoute("/_authenticated/souscription")({
  head: () => ({
    meta: [
      { title: "Choisir un forfait - growthity.ai" },
      { name: "description", content: "Active ton abonnement Growthity pour générer et publier tes publicités." },
    ],
  }),
  component: SubscribePage,
});

const FIRST_SUB_BONUS_CREDITS = 500;

const fmtEur = (n: number, digits = 2) =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency", currency: "EUR",
    minimumFractionDigits: digits, maximumFractionDigits: digits,
  }).format(n);

const FEATURES = [
  "Assistant créatif conversationnel illimité",
  "Marques, espaces de travail et dossiers illimités",
  "Bibliothèque d'acteurs UGC complète",
  "Sous-titres automatiques et recadrage",
  "Publication directe sur Meta Ads",
  "Accès API et intégration MCP",
  "Membres d'équipe illimités",
  "Support par e-mail et chat",
];

const FAQ = [
  { q: "Que se passe-t-il après avoir cliqué sur « Activer » ?",
    a: "Tu es redirigé vers une page de paiement sécurisée Stripe. Une fois ta carte validée, ton abonnement est actif immédiatement et tes crédits mensuels, plus les 500 crédits de bienvenue, sont ajoutés à ton solde." },
  { q: "Est-ce que je reçois vraiment 500 crédits en bonus ?",
    a: "Oui, lors de ton tout premier abonnement, quel que soit le volume choisi. C'est un bonus unique, visible comme une ligne « Bonus de bienvenue » dans l'historique de ta page Facturation." },
  { q: "Est-ce que mes crédits expirent ?",
    a: "Les crédits non consommés se reportent sur le mois suivant, dans la limite d'un plafond égal à 1× ton volume mensuel." },
  { q: "Puis-je changer de volume plus tard ?",
    a: "Oui, à tout moment depuis la page Facturation. Une hausse de volume est calculée au prorata, une baisse s'applique au prochain renouvellement." },
  { q: "Puis-je annuler à tout moment ?",
    a: "Oui, sans engagement ni frais. Tu gardes l'accès à ton solde jusqu'à la fin de la période déjà payée." },
  { q: "Les rendus ratés me coûtent-ils des crédits ?",
    a: "Non. Si une génération échoue pour une raison technique, les crédits réservés sont automatiquement remboursés." },
];

function SubscribePage() {
  const router = useRouter();
  const { plans } = usePlansGrid();
  const fetchCredits = useServerFn(getCreditSummary);
  const { data: credits } = useQuery({
    queryKey: ["credit-summary"],
    queryFn: () => fetchCredits(),
    staleTime: 15_000,
  });
  const [target, setTarget] = useState<CheckoutTarget | null>(null);
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [interval, setInterval] = useState<BillingInterval>("month");

  // Déjà abonné : on renvoie dans l'app.
  useEffect(() => {
    if (credits?.isActive) router.navigate({ to: "/create" });
  }, [credits?.isActive, router]);

  // Par défaut : le plus petit forfait.
  const sorted = useMemo(
    () => [...plans].sort((a, b) => a.monthlyCredits - b.monthlyCredits),
    [plans],
  );
  const selected = useMemo(
    () => sorted.find((p) => p.code === selectedCode) ?? sorted[0],
    [sorted, selectedCode],
  );

  const qc = useQueryClient();
  const signOut = async () => {
    // On stoppe et vide les requêtes protégées AVANT de couper la session,
    // sinon elles repartent sans jeton et renvoient "Unauthorized".
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    window.location.replace("/auth");
  };

  const discount = Math.round(ANNUAL_DISCOUNT_RATE * 100);

  return (
    <div className="gx-solo">
      <PaymentTestModeBanner />
      <header className="gx-solo-top">
        <Logo variant="full" className="gx-solo-logo" />
        <div className="gx-solo-top-r">
          <button type="button" onClick={signOut} className="gx-btn gx-sm gx-ghost">
            <LogOut className="gx-i" /> Se déconnecter
          </button>
        </div>
      </header>

      <main className="gx-solo-main">
        <div className="gx-solo-wide">
          <div className="gx-solo-hero">
            <PageHeader
              eyebrow="Activation du compte"
              title="Un seul plan. Choisis ton volume."
              subtitle="Toutes les fonctionnalités sont incluses à chaque niveau. Choisis simplement le nombre de crédits dont tu as besoin chaque mois : le prix s'ajuste automatiquement."
            />
          </div>

          {!selected ? (
            <ConsoleLoading variant="block" />
          ) : (
            <div className="gx-solo-plan">
              {/* Choix du volume */}
              <section className="gx-solo-card" aria-labelledby="vol-h">
                <div className="gx-solo-cardh">
                  <h2 id="vol-h">Volume mensuel de crédits</h2>
                  <div className="gx-seg" role="tablist" aria-label="Cycle de facturation">
                    {(["month", "year"] as const).map((opt) => (
                      <button key={opt} type="button" role="tab" aria-selected={interval === opt}
                        onClick={() => setInterval(opt)}>
                        {opt === "month" ? "Mensuel" : <>Annuel <span className="gx-solo-off">-{discount}%</span></>}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="gx-solo-vols" role="radiogroup" aria-labelledby="vol-h">
                  {sorted.map((p) => (
                    <button key={p.code} type="button" role="radio" aria-checked={p.code === selected.code}
                      className="gx-solo-vol" onClick={() => setSelectedCode(p.code)}>
                      <b>{p.monthlyCredits.toLocaleString("fr-FR")}</b>
                      <small>crédits / mois</small>
                      <span>{fmtEur(interval === "year" ? annualMonthlyEquivalent(p.priceUsd) : p.priceUsd)}/mois</span>
                    </button>
                  ))}
                </div>

                <p className="gx-solo-hint gx-solo-ex">
                  Ex&nbsp;: environ <b>{Math.floor(selected.monthlyCredits / 300)}</b> vidéos
                  standards de 8s ou <b>{Math.floor(selected.monthlyCredits / 15)}</b> images
                  publicitaires par mois.
                </p>
              </section>

              {/* Récapitulatif */}
              <aside className="gx-solo-card gx-solo-sum" aria-label="Récapitulatif">
                <span className="gx-solo-eyebrow"><Sparkles className="gx-i" />Plan Growthity</span>

                <div>
                  <div className="gx-solo-price">
                    <b>{fmtEur(interval === "year" ? annualMonthlyEquivalent(selected.priceUsd) : selected.priceUsd)}</b>
                    <span>/mois TTC</span>
                  </div>
                  <p className="gx-solo-bill">
                    {interval === "year" ? (
                      <>
                        Soit <strong>{fmtEur(annualPrice(selected.priceUsd))} facturés une fois par an</strong>
                        {" · "}
                        <em>{fmtEur(annualSavings(selected.priceUsd))} économisés par an</em>
                      </>
                    ) : (
                      <>
                        Facturé chaque mois · passe en annuel pour économiser{" "}
                        <em>{fmtEur(annualSavings(selected.priceUsd))} par an</em>
                      </>
                    )}
                  </p>
                </div>

                <div className="gx-solo-sel">
                  <span>Volume choisi</span>
                  <b>{selected.monthlyCredits.toLocaleString("fr-FR")} crédits / mois</b>
                </div>

                <button
                  type="button"
                  className="gx-btn gx-pri gx-solo-big gx-solo-full"
                  onClick={() =>
                    setTarget({
                      kind: "plan",
                      planCode: selected.code,
                      interval,
                      label:
                        `${selected.name} · ${selected.monthlyCredits.toLocaleString("fr-FR")} crédits / mois · ` +
                        (interval === "year"
                          ? `${fmtEur(annualPrice(selected.priceUsd))} / an`
                          : `${fmtEur(selected.priceUsd)} / mois`),
                    })
                  }
                >
                  Activer {selected.monthlyCredits.toLocaleString("fr-FR")} crédits / mois
                </button>

                <div className="gx-solo-ok">
                  <ShieldCheck className="gx-i" />
                  <p>
                    <b>+ {FIRST_SUB_BONUS_CREDITS} crédits de bienvenue offerts</b>. Redirection vers Stripe pour payer en toute sécurité. Annulable sans frais à tout moment.
                  </p>
                </div>

                <hr className="gx-solo-sep" />

                <div>
                  <p className="gx-lbl">Inclus quel que soit le volume choisi</p>
                  <ul className="gx-solo-feat">
                    {FEATURES.map((f) => (
                      <li key={f}>
                        <i><Check className="gx-i" /></i>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </aside>
            </div>
          )}

          <section className="gx-solo-faq" aria-labelledby="faq-h">
            <h2 id="faq-h">Questions fréquentes</h2>
            <div className="gx-box gx-faq">
              {FAQ.map((f, i) => (
                <details key={i}>
                  <summary>{f.q}</summary>
                  <p>{f.a}</p>
                </details>
              ))}
            </div>
            <p className="gx-solo-more">
              Une autre question ?{" "}
              <a href="mailto:hello@growthity.ai">Écris-nous</a>
              .
            </p>
          </section>
        </div>
      </main>

      <CheckoutDialog target={target} onOpenChange={(open) => !open && setTarget(null)} />
    </div>
  );
}
