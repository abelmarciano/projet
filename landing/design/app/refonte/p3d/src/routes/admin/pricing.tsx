import { frError } from "@/lib/error-fr";
import { AdminTopBar } from "@/components/admin/AdminTopBar";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { annualPrice, annualMonthlyEquivalent } from "@/lib/billing/pricing";
import { Loader2, Save, CheckCircle2, AlertTriangle, RefreshCw } from "@/components/icons";
import {
  getAdminPricing,
  updateAdminPlan,
  updateAdminTopupPack,
  syncAllPricingToStripe,
} from "@/lib/billing/admin-pricing.functions";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/admin/pricing")({
  head: () => ({ meta: [{"title": "Grille tarifaire — Admin Growthity"}, {"name": "description", "content": "Espace interne Growthity : Grille tarifaire."}, {"property": "og:title", "content": "Grille tarifaire — Admin Growthity"}, {"property": "og:description", "content": "Espace interne Growthity : Grille tarifaire."}, {"property": "og:type", "content": "website"}, {"name": "twitter:card", "content": "summary"}] }),
  component: PricingAdminPage,
});

type PlanRow = {
  code: string;
  name: string;
  price_usd_cents: number;
  monthly_credits: number;
  is_active: boolean;
  is_featured: boolean;
  description: string | null;
  stripe_price_id: string | null;
};

type PackRow = {
  id: string;
  credits: number;
  price_usd_cents: number;
  is_active: boolean;
};

const fmtUsd = (n: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

function PricingAdminPage() {
  const fetchPricing = useServerFn(getAdminPricing);
  const syncAll = useServerFn(syncAllPricingToStripe);
  const qcRoot = useQueryClient();
  const syncMutation = useMutation({
    mutationFn: () => syncAll(),
    onSuccess: (res: any) => {
      if (res?.reason === "not_configured") {
        toast.error("Stripe n'est pas encore connecté.");
        return;
      }
      if (res?.errors?.length) {
        toast.warning(`Synchronisation partielle : ${res.plans} paliers, ${res.packs} packs.`, {
          description: res.errors.slice(0, 3).map((error: unknown) => frError(error)).join(" · "),
        });
      } else {
        toast.success(`Stripe synchronisé : ${res.plans} paliers et ${res.packs} packs.`);
      }
      qcRoot.invalidateQueries({ queryKey: ["admin-pricing"] });
    },
    onError: (e: unknown) => toast.error(frError(e, "Synchronisation impossible.")),
  });
  const { data, isLoading } = useQuery({
    queryKey: ["admin-pricing"],
    queryFn: () => fetchPricing(),
    staleTime: 10_000,
  });

  const subtitle =
    "Toute modification est immédiatement effective sur la page Facturation client, le calcul de proration et le renouvellement mensuel des crédits.";

  if (isLoading || !data) {
    return (
      <>
        <AdminTopBar title="Grille tarifaire" subtitle={subtitle} />
        <div className="ad-page">
          <section className="ad-card">
            <div className="ad-loading"><Loader2 className="ad-i ad-spin" aria-label="Chargement" /></div>
          </section>
        </div>
      </>
    );
  }

  return (
    <>
      <AdminTopBar title="Grille tarifaire" subtitle={subtitle} actions={<>{data.stripeConnected ? (
            <span className="ad-pill ok">
              <CheckCircle2 aria-hidden /> Stripe connecté
            </span>
          ) : (
            <span className="ad-pill warn">
              <AlertTriangle aria-hidden /> Stripe non connecté
            </span>
          )}
          <button
            type="button"
            className="ad-btn sm"
            disabled={!data.stripeConnected || syncMutation.isPending}
            onClick={() => syncMutation.mutate()}
          >
            {syncMutation.isPending ? (
              <Loader2 className="ad-i ad-spin" aria-hidden />
            ) : (
              <RefreshCw className="ad-i" aria-hidden />
            )}
            Synchroniser vers Stripe
          </button></>} />
      <div className="ad-page">
        <div className="ad-pr-info">
          <p>
            {data.stripeConnected
              ? "Les produits et prix Stripe sont mis à jour automatiquement."
              : "Dès que Payments sera activé, les produits et prix Stripe seront créés automatiquement à la prochaine sauvegarde."}
          </p>
          <p>
            Coût de revient interne : <b className="ad-num">{new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", minimumFractionDigits: 4, maximumFractionDigits: 4 }).format(data.costPerCreditUsd)}</b> / crédit (montants en euros TTC). Le ratio affiché correspond à la
            marge brute du palier.
          </p>
        </div>

        <section className="ad-card">
          <div className="ad-ch">
            <div>
              <h2>Abonnements mensuels</h2>
              <small>Montants en euros TTC</small>
            </div>
          </div>
          <div className="ad-cb ad-pr-cb">
            <div className="ad-tw">
              <table className="ad-table ad-pr-table">
                <thead>
                  <tr>
                    <th>Palier</th>
                    <th>Prix / mois</th>
                    <th className="ad-num">Annuel -20 %</th>
                    <th>Crédits / mois</th>
                    <th>Ratio marge</th>
                    <th>Actif</th>
                    <th>Mis en avant</th>
                    <th aria-label="Enregistrer" />
                  </tr>
                </thead>
                <tbody>
                  {(data.plans as PlanRow[]).map((p) => (
                    <PlanEditor key={p.code} plan={p} costPerCredit={data.costPerCreditUsd} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="ad-card">
          <div className="ad-ch">
            <div>
              <h2>Packs de crédits à la carte</h2>
              <small>Montants en euros TTC</small>
            </div>
          </div>
          <div className="ad-cb ad-pr-cb">
            <div className="ad-tw">
              <table className="ad-table ad-pr-table ad-pr-packs">
                <thead>
                  <tr>
                    <th>Crédits</th>
                    <th>Prix</th>
                    <th className="ad-num">€ / 1000 crédits</th>
                    <th>Actif</th>
                    <th aria-label="Enregistrer" />
                  </tr>
                </thead>
                <tbody>
                  {(data.packs as PackRow[]).map((p) => (
                    <PackEditor key={p.id} pack={p} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

function PlanEditor({ plan, costPerCredit }: { plan: PlanRow; costPerCredit: number }) {
  const qc = useQueryClient();
  const save = useServerFn(updateAdminPlan);
  const [price, setPrice] = useState(String(plan.price_usd_cents / 100));
  const [credits, setCredits] = useState(String(plan.monthly_credits));
  const [name, setName] = useState(plan.name);

  useEffect(() => {
    setPrice(String(plan.price_usd_cents / 100));
    setCredits(String(plan.monthly_credits));
    setName(plan.name);
  }, [plan.price_usd_cents, plan.monthly_credits, plan.name]);

  const mutation = useMutation({
    mutationFn: (vars: { code: string; name?: string; priceUsdCents?: number; monthlyCredits?: number; isActive?: boolean; isFeatured?: boolean }) => save({ data: vars } as any),
    onSuccess: (res: any) => {
      toast.success("Tarif mis à jour, visible immédiatement côté client.", {
        description: res?.stripe?.synced ? "Produit et prix Stripe synchronisés." : undefined,
      });
      qc.invalidateQueries({ queryKey: ["admin-pricing"] });
      qc.invalidateQueries({ queryKey: ["pricing-grid"] });
    },
    onError: (e: Error) => toast.error(frError(e, "Enregistrement impossible.")),
  });

  const priceNum = Number(price.replace(",", "."));
  const creditsNum = Number(credits);
  const ratio = creditsNum > 0 && costPerCredit > 0 ? priceNum / (creditsNum * costPerCredit) : 0;
  const dirty =
    priceNum !== plan.price_usd_cents / 100 || creditsNum !== plan.monthly_credits || name !== plan.name;

  return (
    <tr>
      <td>
        <input className="ad-pr-in" aria-label="Nom du palier" value={name} onChange={(e) => setName(e.target.value)} />
      </td>
      <td>
        <input
          className="ad-pr-in ad-num"
          aria-label="Prix mensuel (€ TTC)"
          type="number"
          step="0.01"
          min="0"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
      </td>
      <td className="ad-num">
        <b className="ad-pr-annual">
          {Number.isFinite(priceNum) ? annualPrice(priceNum).toFixed(2) : "-"} € / an
        </b>
        <small className="ad-muted">
          soit {Number.isFinite(priceNum) ? annualMonthlyEquivalent(priceNum).toFixed(2) : "-"} € / mois
        </small>
      </td>
      <td>
        <input
          className="ad-pr-in ad-num"
          aria-label="Crédits par mois"
          type="number"
          step="100"
          min="0"
          value={credits}
          onChange={(e) => setCredits(e.target.value)}
        />
      </td>
      <td>
        <span className={`ad-pill ad-num ${ratio < 5 ? "bad" : ratio < 6 ? "warn" : "ok"}`}>
          ×{ratio.toFixed(1)}
        </span>
      </td>
      <td>
        <Switch
          aria-label="Palier actif"
          checked={plan.is_active}
          onCheckedChange={(v) => mutation.mutate({ code: plan.code, isActive: v })}
        />
      </td>
      <td>
        <Switch
          aria-label="Palier mis en avant"
          checked={plan.is_featured}
          onCheckedChange={(v) => mutation.mutate({ code: plan.code, isFeatured: v })}
        />
      </td>
      <td>
        <button
          type="button"
          className={dirty ? "ad-btn sm pri" : "ad-btn sm ghost"}
          aria-label="Enregistrer le palier"
          title="Enregistrer"
          disabled={!dirty || mutation.isPending || !Number.isFinite(priceNum) || !Number.isFinite(creditsNum)}
          onClick={() =>
            mutation.mutate({
              code: plan.code,
              name,
              priceUsdCents: Math.round(priceNum * 100),
              monthlyCredits: Math.round(creditsNum),
            })
          }
        >
          {mutation.isPending ? <Loader2 className="ad-i ad-spin" aria-hidden /> : <Save className="ad-i" aria-hidden />}
        </button>
      </td>
    </tr>
  );
}

function PackEditor({ pack }: { pack: PackRow }) {
  const qc = useQueryClient();
  const save = useServerFn(updateAdminTopupPack);
  const [price, setPrice] = useState(String(pack.price_usd_cents / 100));
  const [credits, setCredits] = useState(String(pack.credits));

  useEffect(() => {
    setPrice(String(pack.price_usd_cents / 100));
    setCredits(String(pack.credits));
  }, [pack.price_usd_cents, pack.credits]);

  const mutation = useMutation({
    mutationFn: (vars: { id: string; credits?: number; priceUsdCents?: number; isActive?: boolean }) => save({ data: vars } as any),
    onSuccess: () => {
      toast.success("Pack mis à jour.");
      qc.invalidateQueries({ queryKey: ["admin-pricing"] });
      qc.invalidateQueries({ queryKey: ["pricing-grid"] });
    },
    onError: (e: Error) => toast.error(frError(e, "Enregistrement impossible.")),
  });

  const priceNum = Number(price.replace(",", "."));
  const creditsNum = Number(credits);
  const per1k = creditsNum > 0 ? (priceNum / creditsNum) * 1000 : 0;
  const dirty = priceNum !== pack.price_usd_cents / 100 || creditsNum !== pack.credits;

  return (
    <tr>
      <td>
        <input
          className="ad-pr-in ad-num"
          aria-label="Nombre de crédits"
          type="number"
          step="100"
          value={credits}
          onChange={(e) => setCredits(e.target.value)}
        />
      </td>
      <td>
        <input
          className="ad-pr-in ad-num"
          aria-label="Prix du pack (€ TTC)"
          type="number"
          step="0.01"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
      </td>
      <td className="ad-num ad-muted">{fmtUsd(per1k)}</td>
      <td>
        <Switch aria-label="Pack actif" checked={pack.is_active} onCheckedChange={(v) => mutation.mutate({ id: pack.id, isActive: v })} />
      </td>
      <td>
        <button
          type="button"
          className={dirty ? "ad-btn sm pri" : "ad-btn sm ghost"}
          aria-label="Enregistrer le pack"
          title="Enregistrer"
          disabled={!dirty || mutation.isPending}
          onClick={() =>
            mutation.mutate({
              id: pack.id,
              credits: Math.round(creditsNum),
              priceUsdCents: Math.round(priceNum * 100),
            })
          }
        >
          {mutation.isPending ? <Loader2 className="ad-i ad-spin" aria-hidden /> : <Save className="ad-i" aria-hidden />}
        </button>
      </td>
    </tr>
  );
}
