import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Select, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { GxSelectTrigger, GxSheetContent, GxSheetClose } from "@/components/ui/gx-controls";
import { toast } from "sonner";
import { getWorkspaceBilling, getCreditSummary } from "@/lib/billing/billing.functions";
import { ACTION_COSTS, type Plan } from "@/lib/billing/pricing";
import { usePlansGrid } from "@/lib/billing/use-plans";
import { upgradeDialogStore } from "@/stores/upgrade-dialog-store";
import { CheckoutDialog, type CheckoutTarget } from "@/components/billing/CheckoutDialog";
import {
  annualMonthlyEquivalent, annualPrice, annualSavings, type BillingInterval,
} from "@/lib/billing/pricing";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";
import { isPaymentsAvailable, getStripeEnvironment } from "@/lib/stripe";
import { createPortalSession, getBillingOverview, type BillingOverview } from "@/lib/billing/payments.functions";

/*
 * Facturation : formulaire « libellé | valeur » de la maquette (views/parametres.html, onglet Facturation).
 * Les blocs détaillés de l'ancienne page (forfaits, packs, factures, historique, fonctionnement)
 * restent accessibles via des panneaux latéraux ouverts depuis les lignes du formulaire.
 */

/** Bonus one-shot lors du tout premier abonnement. */
const FIRST_SUB_BONUS_CREDITS = 500;

const fmtEur = (n: number, fraction = 2) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", minimumFractionDigits: fraction, maximumFractionDigits: fraction }).format(n);
const frInt = (n: number) => n.toLocaleString("fr-FR");

/** Coût d'un crédit dans un plan donné (€ / crédit). */
function creditPrice(plan: Plan | undefined) {
  if (!plan || !plan.monthlyCredits) return 0;
  return plan.priceUsd / plan.monthlyCredits;
}

export const Route = createFileRoute("/_authenticated/parametres/facturation")({
  head: () => ({ meta: [{ title: "Facturation & crédits - growthity.ai" }] }),
  validateSearch: (search: Record<string, unknown>): { checkout?: string; session_id?: string; upgrade?: string } => ({
    checkout: typeof search["checkout"] === "string" ? (search["checkout"] as string) : undefined,
    session_id: typeof search["session_id"] === "string" ? (search["session_id"] as string) : undefined,
    upgrade: typeof search["upgrade"] === "string" ? (search["upgrade"] as string) : undefined,
  }),
  component: Page,
});

type Sheet = null | "topup" | "plan" | "invoices" | "history" | "how";

function useBillingOverview() {
  const fn = useServerFn(getBillingOverview);
  return useQuery({
    queryKey: ["billing-overview"],
    enabled: isPaymentsAvailable(),
    staleTime: 60_000,
    queryFn: async () => {
      const res = await fn({ data: { environment: getStripeEnvironment() } });
      if ("error" in res) throw new Error(res.error);
      return res;
    },
  });
}

const CARD_BRAND: Record<string, string> = {
  visa: "Visa", mastercard: "Mastercard", amex: "American Express",
  discover: "Discover", jcb: "JCB", diners: "Diners Club", unionpay: "UnionPay",
};

function Page() {
  const fn = useServerFn(getWorkspaceBilling);
  const { data, isPending: billingPending } = useQuery({
    queryKey: ["workspace-billing"],
    queryFn: () => fn(),
    staleTime: 30_000,
  });
  const creditsFn = useServerFn(getCreditSummary);
  const { data: creditSummary } = useQuery({
    queryKey: ["credit-summary"],
    queryFn: () => creditsFn(),
    staleTime: 10_000,
  });
  const overviewQ = useBillingOverview();
  const overview = overviewQ.data as BillingOverview | undefined;

  const { plans, getPlan, topups } = usePlansGrid();
  const ws: any = (data as any)?.workspace ?? null;
  const currentPlan = getPlan(ws?.plan_code);
  const hasEverSubscribed = !!ws?.plan_code;

  const [sheet, setSheet] = useState<Sheet>(null);
  const [checkoutTarget, setCheckoutTarget] = useState<CheckoutTarget | null>(null);
  const { checkout, upgrade } = Route.useSearch();
  const qc = useQueryClient();

  useEffect(() => {
    if (checkout === "success") {
      toast.success("Paiement confirmé", {
        description: "Tes crédits sont crédités dès la validation par notre système de paiement.",
      });
      qc.invalidateQueries({ queryKey: ["workspace-billing"] });
      qc.invalidateQueries({ queryKey: ["workspace-sidebar"] });
    }
  }, [checkout, qc]);

  // Ouverture auto de la popup « Changer de forfait » (crédits insuffisants, etc.)
  useEffect(() => {
    if (upgrade) upgradeDialogStore.open({ reason: "insufficient_credits" });
  }, [upgrade]);

  useEffect(() => {
    const onOpen = () => upgradeDialogStore.open({ reason: "insufficient_credits" });
    window.addEventListener("growthity:open-upgrade", onOpen);
    return () => window.removeEventListener("growthity:open-upgrade", onOpen);
  }, []);

  /* ---------- chiffres ---------- */

  const balance: number = ws?.credit_balance ?? 0;
  const held: number = ws?.credit_held ?? 0;
  const monthly = currentPlan?.monthlyCredits ?? 0;
  const used: number = (creditSummary as any)?.usedThisPeriod ?? 0;
  const pctLeft = monthly ? Math.max(0, Math.min(100, Math.round((balance / monthly) * 100))) : 0;
  const costOf = (code: string) => ACTION_COSTS.find((a) => a.code === code)?.credits ?? 0;
  const videoCost = costOf("video_standard_8s");
  const imageCost = costOf("image_generation");
  const nextAmount = overview && "upcoming" in overview ? (overview as any).upcoming?.amount ?? null : null;
  const stripeRenew = ws?.renews_at ?? ws?.period_end;
  const renewDate = stripeRenew
    ? new Date(stripeRenew).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })
    : (overview as any)?.upcoming?.date
      ? new Date((overview as any).upcoming.date).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })
      : null;
  const payments = isPaymentsAvailable();
  const pm: any = (overview as any)?.paymentMethod ?? null;
  const invoices: BillingOverview["invoices"] = ((overview as any)?.invoices ?? []) as BillingOverview["invoices"];
  const subscribed = !!ws?.plan_code || !!(overview as any)?.hasSubscription;

  const openPlans = () => setSheet("plan");

  return (
    <>
      <PaymentTestModeBanner />

      <div className="gx-box gx-form">
        <div className="gx-fr">
          <label>Crédits restants</label>
          {billingPending ? (
            <span className="gx-hint">Chargement…</span>
          ) : (
            <>
              {monthly > 0 && <span className="gx-meter" title={`${used ? `${frInt(used)} crédits consommés ce cycle` : ""}`}><i style={{ width: `${pctLeft}%` }} /></span>}
              <b className="gx-num">{frInt(balance)}{monthly > 0 ? ` / ${frInt(monthly)}` : " crédits"}</b>
              {held > 0 && <span className="gx-hint">{frInt(held)} réservés (générations en cours)</span>}
            </>
          )}
        </div>

        <div className="gx-fr">
          <label>Équivalent</label>
          <span>
            {billingPending
              ? "…"
              : videoCost && imageCost
                ? `≈ ${frInt(Math.floor(balance / videoCost))} vidéos de 8 s ou ${frInt(Math.floor(balance / imageCost))} images`
                : `${frInt(balance)} crédits disponibles`}
          </span>
          <button type="button" className="gx-btn gx-sm gx-ghost gx-ml" onClick={() => setSheet("how")}>Comment ça marche</button>
        </div>

        <div className="gx-fr">
          <label>Renouvellement</label>
          <span>
            {billingPending
              ? "…"
              : currentPlan
                ? `${renewDate ?? "Date à venir"} · Plan ${currentPlan.name}${renewDate ? ` · ${fmtEur(nextAmount ?? currentPlan.priceUsd ?? 0)}` : ""}`
                : "Sans abonnement"}
          </span>
        </div>

        <div className="gx-fr">
          <label>Besoin de plus ?</label>
          <button type="button" className="gx-btn gx-sm gx-pri" onClick={() => setSheet("topup")} disabled={!topups.length}>Acheter des crédits</button>
          <button type="button" className="gx-btn gx-sm" onClick={openPlans}>Changer d'offre</button>
        </div>

        {payments && (
          <div className="gx-fr">
            <label>Moyen de paiement</label>
            <span>
              {overviewQ.isLoading
                ? "Chargement…"
                : pm
                  ? `${CARD_BRAND[String(pm.brand).toLowerCase()] ?? pm.brand} •••• ${pm.last4} · expire ${String(pm.expMonth).padStart(2, "0")}/${String(pm.expYear).slice(-2)}${pm.wallet ? ` · ${pm.wallet}` : ""}`
                  : subscribed ? "Carte conservée par notre prestataire de paiement" : "Aucune carte enregistrée"}
            </span>
            <PortalButton label={pm ? "Modifier" : subscribed ? "Gérer ma carte" : "Ajouter une carte"} />
            {subscribed && <PortalButton label="Gérer mon abonnement" ghost />}
          </div>
        )}

        {payments && (
          <div className="gx-fr">
            <label>Factures</label>
            <span>
              {overviewQ.isLoading
                ? "Chargement…"
                : invoices.length
                  ? `${invoices.length} facture${invoices.length > 1 ? "s" : ""} · dernière le ${invoices[0]?.date ? new Date(invoices[0].date).toLocaleDateString("fr-FR") : "—"}`
                  : subscribed ? "Ta première facture est en cours d'émission" : "Aucune facture pour l'instant"}
            </span>
            {invoices.length > 0 ? (
              <button type="button" className="gx-btn gx-sm" onClick={() => setSheet("invoices")}>Voir</button>
            ) : subscribed ? (
              <PortalButton label="Voir mes factures" />
            ) : null}
          </div>
        )}

        <div className="gx-fr">
          <label>Historique des crédits</label>
          <span>{billingPending ? "…" : `${frInt(((data as any)?.ledger ?? []).length)} derniers mouvements`}</span>
          <button type="button" className="gx-btn gx-sm" onClick={() => setSheet("history")} disabled={billingPending}>Voir</button>
        </div>
      </div>

      <DialogPrimitive.Root open={sheet !== null} onOpenChange={(o) => { if (!o) setSheet(null); }}>
        <GxSheetContent className="console-app-portal" aria-describedby={undefined}>
          {sheet === "topup" && (
            <TopupSheet packs={topups} onBuy={(t) => { setSheet(null); setCheckoutTarget(t); }} />
          )}
          {sheet === "plan" && (
            <PlanSheet
              plans={plans}
              currentCode={ws?.plan_code ?? null}
              eligibleBonus={!hasEverSubscribed}
              onCheckout={(t) => {
                setSheet(null);
                // Abonnement déjà actif → popup de changement de forfait (prorata Stripe).
                if (t.kind === "plan" && ws?.plan_code) {
                  upgradeDialogStore.open({ reason: "manual", suggestedPlanCode: (t as any).planCode });
                  return;
                }
                setCheckoutTarget(t);
              }}
              onManualUpgrade={(code) => { setSheet(null); upgradeDialogStore.open({ reason: "manual", suggestedPlanCode: code }); }}
            />
          )}
          {sheet === "invoices" && <InvoicesSheet invoices={invoices} />}
          {sheet === "history" && <HistorySheet ledger={((data as any)?.ledger ?? []) as LedgerRow[]} />}
          {sheet === "how" && <HowSheet plan={currentPlan} />}
        </GxSheetContent>
      </DialogPrimitive.Root>

      <CheckoutDialog target={checkoutTarget} onOpenChange={(v) => !v && setCheckoutTarget(null)} />
    </>
  );
}

/* ─── Portail de facturation Stripe ───────────────────────────────── */

function PortalButton({ label, ghost }: { label: string; ghost?: boolean }) {
  const portalFn = useServerFn(createPortalSession);
  const [loading, setLoading] = useState(false);
  if (!isPaymentsAvailable()) return null;
  return (
    <button
      type="button"
      className={ghost ? "gx-btn gx-sm gx-ghost" : "gx-btn gx-sm"}
      disabled={loading}
      onClick={async () => {
        setLoading(true);
        try {
          const res = await portalFn({ data: { returnUrl: window.location.href, environment: getStripeEnvironment() } });
          if ("error" in res) throw new Error(res.error);
          window.open(res.url, "_blank", "noopener");
        } catch (e) {
          toast.error((e as Error).message ?? "Portail indisponible.");
        } finally {
          setLoading(false);
        }
      }}
    >
      {loading ? "Ouverture…" : label}
    </button>
  );
}

function SheetHead({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="gx-sheet-h">
      <div>
        <DialogPrimitive.Title asChild><b>{title}</b></DialogPrimitive.Title>
        {sub && <small>{sub}</small>}
      </div>
      <GxSheetClose />
    </div>
  );
}

/* ─── Packs de crédits à la carte ─────────────────────────────────── */

function TopupSheet({ packs, onBuy }: { packs: { id?: string; credits: number; priceUsd: number }[]; onBuy: (t: CheckoutTarget) => void }) {
  const paymentsOn = isPaymentsAvailable();
  const best = packs.reduce((b, p, i) => (p.priceUsd / p.credits < packs[b].priceUsd / packs[b].credits ? i : b), 0);
  return (
    <>
      <SheetHead title="Acheter des crédits" sub="Packs à la carte, sans engagement. Les crédits achetés n'expirent pas tant que ton abonnement est actif." />
      <div className="gx-ls-b">
        {packs.length === 0 ? (
          <p className="gx-hint">Aucun pack disponible pour le moment.</p>
        ) : packs.map((pack, i) => (
          <div key={pack.credits} className="gx-acc">
            <b className="gx-num">{frInt(pack.credits)} crédits</b>
            <small>{fmtEur(pack.priceUsd)} · soit {fmtEur(pack.priceUsd / pack.credits, 3)} / crédit</small>
            {i === best && <span className="gx-gb">Meilleur prix</span>}
            <button
              type="button" className="gx-btn gx-sm gx-pri gx-ml" disabled={!paymentsOn}
              onClick={() => onBuy({ kind: "topup", credits: pack.credits, label: `${frInt(pack.credits)} crédits · ${fmtEur(pack.priceUsd)}` } as CheckoutTarget)}
            >
              Acheter
            </button>
          </div>
        ))}
      </div>
    </>
  );
}

/* ─── Changer d'offre (ancien bloc Tarification) ──────────────────── */

function PlanSheet({
  plans, currentCode, eligibleBonus, onCheckout, onManualUpgrade,
}: {
  plans: Plan[];
  currentCode: string | null;
  eligibleBonus: boolean;
  onCheckout: (t: CheckoutTarget) => void;
  onManualUpgrade: (code: string) => void;
}) {
  const [code, setCode] = useState<string>(currentCode ?? "growth_plus");
  const [interval, setInterval] = useState<BillingInterval>("month");
  const selected = useMemo(() => plans.find((p) => p.code === code) ?? plans[3] ?? plans[0], [code, plans]);
  if (!selected) {
    return (
      <>
        <SheetHead title="Changer d'offre" />
        <div className="gx-ls-b"><p className="gx-hint">Chargement des offres…</p></div>
      </>
    );
  }
  const isCurrent = selected.code === currentCode;
  const perCredit = creditPrice(selected);
  const monthlyShown = interval === "year" ? annualMonthlyEquivalent(selected.priceUsd) : selected.priceUsd;

  const go = () => {
    if (isCurrent && interval === "month") return;
    if (interval === "year") {
      onCheckout({
        kind: "plan",
        planCode: selected.code,
        interval: "year",
        label: `${selected.name} · ${frInt(selected.monthlyCredits)} crédits / mois · ${fmtEur(annualPrice(selected.priceUsd))} / an`,
      } as CheckoutTarget);
      return;
    }
    // Montée comme descente de gamme : la popup gère les deux cas.
    onManualUpgrade(selected.code);
  };

  return (
    <>
      <SheetHead title="Changer d'offre" sub="Toutes les fonctionnalités sont incluses à chaque niveau : choisis seulement ton volume de crédits." />
      <div className="gx-ls-b">
        <div className="gx-seg" role="tablist" aria-label="Facturation">
          <button type="button" role="tab" aria-selected={interval === "month"} onClick={() => setInterval("month")}>Mensuel</button>
          <button type="button" role="tab" aria-selected={interval === "year"} onClick={() => setInterval("year")}>Annuel</button>
        </div>
        <label className="gx-lbl" htmlFor="planSel">Volume mensuel de crédits</label>
        <Select value={selected.code} onValueChange={setCode}>
          <GxSelectTrigger id="planSel"><SelectValue /></GxSelectTrigger>
          <SelectContent className="console-app-portal">
            {plans.map((p) => (
              <SelectItem key={p.code} value={p.code}>
                {frInt(p.monthlyCredits)} crédits / mois · {fmtEur(interval === "year" ? annualMonthlyEquivalent(p.priceUsd) : p.priceUsd)}/mois
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="gx-acc">
          <b className="gx-num">{fmtEur(monthlyShown)} / mois TTC</b>
          <small>
            {interval === "year"
              ? `Soit ${fmtEur(annualPrice(selected.priceUsd))} facturés une fois par an · ${fmtEur(annualSavings(selected.priceUsd))} économisés par an`
              : `Facturé chaque mois · en annuel : ${fmtEur(annualMonthlyEquivalent(selected.priceUsd))}/mois (${fmtEur(annualPrice(selected.priceUsd))}/an)`}
          </small>
        </div>
        <p className="gx-hint">
          1 crédit = {fmtEur(perCredit, 3)} · 100 crédits = {fmtEur(perCredit * 100)} · 1 000 crédits = {fmtEur(perCredit * 1000)}.
          Environ {frInt(Math.floor(selected.monthlyCredits / 300))} vidéos standards de 8 s ou {frInt(Math.floor(selected.monthlyCredits / 15))} images par mois.
        </p>
        {eligibleBonus && (
          <p className="gx-hint"><b>+ {FIRST_SUB_BONUS_CREDITS} crédits offerts</b> pour ton premier abonnement, quel que soit le volume choisi.</p>
        )}
        <p className="gx-hint">
          {interval === "year"
            ? "Engagement 12 mois payé en une fois · Crédits versés chaque mois · Report d'un mois sur l'autre (plafond 1×)."
            : "Sans engagement · Annule à tout moment · Crédits reportés d'un mois sur l'autre (plafond 1×)."}
          {" "}Besoin de plus de 82 000 crédits par mois ? <a href="mailto:hello@growthity.ai">Contacte-nous</a>.
        </p>
      </div>
      <div className="gx-sheet-f">
        <div className="gx-sp" />
        <DialogPrimitive.Close asChild><button type="button" className="gx-btn">Annuler</button></DialogPrimitive.Close>
        {isCurrent && interval === "month" ? (
          <span className="gx-gb gx-out">Ton plan actuel</span>
        ) : (
          <button type="button" className="gx-btn gx-pri" onClick={go}>
            {interval === "year" ? `Passer à l'annuel · ${fmtEur(annualPrice(selected.priceUsd))} / an` : `Choisir ${frInt(selected.monthlyCredits)} crédits / mois`}
          </button>
        )}
      </div>
    </>
  );
}

/* ─── Factures ─────────────────────────────────────────────────────── */

function InvoicesSheet({ invoices }: { invoices: BillingOverview["invoices"] }) {
  const label = (s: string) => (s === "paid" ? { t: "Payée", c: "gx-on" } : s === "open" ? { t: "En attente", c: "gx-warn" } : { t: "Échouée", c: "gx-bad" });
  return (
    <>
      <SheetHead title="Factures" sub="Historique de tes paiements, téléchargeables en PDF." />
      <div className="gx-ls-b">
        <div className="gx-tbl">
          <table>
            <thead><tr><th>Date</th><th>Montant</th><th>Statut</th><th>PDF</th></tr></thead>
            <tbody>
              {invoices.map((inv) => {
                const st = label(String(inv.status));
                const href = inv.pdfUrl ?? inv.hostedUrl;
                return (
                  <tr key={inv.id}>
                    <td>
                      <b>{inv.date ? new Date(inv.date).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" }) : "Date inconnue"}</b>
                      <small>{inv.number ? `Facture ${inv.number}` : "Facture"}</small>
                    </td>
                    <td className="gx-num">{inv.amount === 0 ? "Essai gratuit" : fmtEur(inv.amount)}</td>
                    <td><span className={`gx-st ${st.c}`}>{st.t}</span></td>
                    <td>{href ? <a href={href} target="_blank" rel="noreferrer">Télécharger</a> : "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <div className="gx-sheet-f">
        <div className="gx-sp" />
        <PortalButton label="Voir toutes mes factures" />
      </div>
    </>
  );
}

/* ─── Historique des mouvements ───────────────────────────────────── */

type LedgerRow = {
  id: string;
  kind: string;
  amount: number;
  balance_after: number;
  action_code: string | null;
  reference_id?: string | null;
  created_at: string;
};

const ACTION_LABEL: Record<string, string> = {
  video_generation: "Vidéo standard (8-12s)",
  video_continue: "Suite de vidéo",
  sequence_merge: "Assemblage de séquence",
  video_concat: "Montage & assemblage",
  video_edit: "Montage & recadrage",
  video_trim: "Rogner / couper une vidéo",
  subtitles_add: "Ajout de sous-titres",
  image_generation: "Génération d'image",
  image_edit: "Retouche d'image",
  actor_from_photo: "Création d'acteur UGC",
  video_ugc_actor: "Vidéo avec acteur UGC",
  voice_regeneration: "Voix off régénérée",
  chat_message: "Message dans le chat",
  ai_assist: "Assistance IA",
  meta_publish: "Publication sur Meta Ads",
  welcome_bonus: "Bonus de bienvenue",
  stripe_plan_grant: "Crédits du forfait",
  monthly_grant: "Attribution mensuelle",
  monthly_rollover: "Report du mois précédent",
  refund_unrequested_premium: "Remboursement — style premium non demandé",
  rollover_cap: "Plafond de report atteint",
  plan_upgrade_prorated: "Changement de forfait (prorata)",
};
const KIND_LABEL: Record<string, string> = {
  grant: "Attribution mensuelle",
  rollover: "Report du mois précédent",
  topup: "Achat de crédits",
  refund: "Remboursement",
  expire: "Expiration de crédits",
  adjustment: "Ajustement",
  hold: "Réservation en cours",
  commit: "Consommation",
};

function describe(tx: LedgerRow) {
  if (tx.action_code && ACTION_LABEL[tx.action_code]) return ACTION_LABEL[tx.action_code];
  const catalog = tx.action_code ? ACTION_COSTS.find((a) => a.code === tx.action_code) : undefined;
  if (catalog) return catalog.label;
  return KIND_LABEL[tx.kind] ?? tx.action_code ?? tx.kind;
}

/** Réservation + confirmation du même montant : on ne garde que la ligne définitive. */
function dedupeLedger(ledger: LedgerRow[]) {
  const committed = new Set(
    ledger
      .filter((t) => t.kind === "commit" || t.kind === "refund")
      .map((t) => `${t.reference_id ?? ""}|${t.action_code ?? ""}|${Math.abs(t.amount)}`),
  );
  return ledger.filter(
    (t) => t.kind !== "hold" || !committed.has(`${t.reference_id ?? ""}|${t.action_code ?? ""}|${Math.abs(t.amount)}`),
  );
}

const MONTH_FMT = new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric" });

function HistorySheet({ ledger }: { ledger: LedgerRow[] }) {
  const [filter, setFilter] = useState<string>("all");
  const rows = useMemo(() => dedupeLedger(ledger), [ledger]);
  const options = useMemo(() => {
    const seen = new Map<string, string>();
    for (const tx of rows) {
      const k = tx.action_code ?? tx.kind;
      if (!seen.has(k)) seen.set(k, describe(tx));
    }
    return [...seen.entries()].sort((a, b) => a[1].localeCompare(b[1], "fr"));
  }, [rows]);
  const visible = useMemo(() => (filter === "all" ? rows : rows.filter((t) => (t.action_code ?? t.kind) === filter)), [rows, filter]);
  const groups = useMemo(() => {
    const map = new Map<string, { label: string; items: LedgerRow[]; spent: number }>();
    for (const tx of visible) {
      const d = new Date(tx.created_at);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      let g = map.get(key);
      if (!g) { g = { label: MONTH_FMT.format(d), items: [], spent: 0 }; map.set(key, g); }
      g.items.push(tx);
      if (tx.amount < 0 && tx.kind !== "hold") g.spent += Math.abs(tx.amount);
    }
    return [...map.entries()].sort((a, b) => b[0].localeCompare(a[0])).map(([, v]) => v);
  }, [visible]);

  return (
    <>
      <SheetHead title="Historique des crédits" sub="Les 50 derniers mouvements sur ton solde, regroupés par mois." />
      <div className="gx-ls-b">
        {options.length > 1 && (
          <Select value={filter} onValueChange={setFilter}>
            <GxSelectTrigger aria-label="Type d'action"><SelectValue placeholder="Tous les types" /></GxSelectTrigger>
            <SelectContent className="console-app-portal">
              <SelectItem value="all">Tous les types d'action</SelectItem>
              {options.map(([code, label]) => <SelectItem key={code} value={code}>{label}</SelectItem>)}
            </SelectContent>
          </Select>
        )}
        {groups.length === 0 ? (
          <div className="gx-empty"><b>Aucun mouvement pour le moment</b></div>
        ) : groups.map((g) => (
          <div key={g.label} className="gx-tbl">
            <table>
              <thead><tr><th className="gx-cap">{g.label}</th><th>{frInt(g.spent)} crédits consommés</th></tr></thead>
              <tbody>
                {g.items.map((tx) => {
                  const positive = tx.amount > 0;
                  const pending = tx.kind === "hold";
                  return (
                    <tr key={tx.id}>
                      <td>
                        <b>{describe(tx)}</b>{pending && <> <span className="gx-gb gx-out">En attente</span></>}
                        <small>{new Date(tx.created_at).toLocaleString("fr-FR")}</small>
                      </td>
                      <td className="gx-num">
                        <b className={positive ? "gx-up" : undefined}>{positive ? "+" : ""}{frInt(tx.amount)}</b>
                        <small>solde : {frInt(tx.balance_after)}</small>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </>
  );
}

/* ─── Fonctionnement des crédits ──────────────────────────────────── */

const ACTION_CARDS = [
  { code: "image_generation", label: "Génération d'image" },
  { code: "video_short_4s", label: "Vidéo courte (4s)" },
  { code: "video_standard_8s", label: "Vidéo standard (8-12s)" },
  { code: "video_premium_8s", label: "Vidéo cinématique premium (8s)" },
  { code: "video_long_16s", label: "Vidéo longue (16-20s)" },
  { code: "video_ugc_actor", label: "Vidéo avec acteur UGC" },
  { code: "subtitles_add", label: "Ajout de sous-titres" },
  { code: "video_trim", label: "Montage & recadrage" },
  { code: "chat_message", label: "Message de brief au chat", freeLabel: "Quasi gratuit" },
];

const BENEFITS = [
  { title: "Tu ne payes que le travail IA que tu utilises",
    body: "Pas d'abonnement gonflé de fonctionnalités que tu n'utiliseras jamais. Tes crédits sont dépensés uniquement quand tu génères vraiment quelque chose." },
  { title: "Aucune surprise",
    body: "Le coût exact en crédits est toujours affiché AVANT de lancer une action payante. Tu valides, puis on débite." },
  { title: "Tout le reste est illimité",
    body: "Membres, marques, workspaces, dossiers, historique, chat, sauvegardes - tout est illimité, quel que soit le volume choisi." },
  { title: "Des crédits qui te respectent",
    body: "Les crédits non consommés se reportent sur une fenêtre glissante (plafond 1× ton plan). Les crédits les plus proches d'expirer sont utilisés en premier." },
];

function HowSheet({ plan }: { plan: Plan | undefined }) {
  const perCredit = creditPrice(plan);
  return (
    <>
      <SheetHead title="Comment fonctionnent les crédits" sub={plan ? `Coûts en euros calculés selon ${plan.name}.` : "Chaque action a un coût fixe et transparent."} />
      <div className="gx-ls-b">
        {BENEFITS.map((b) => (
          <div key={b.title}><b>{b.title}</b><p className="gx-hint">{b.body}</p></div>
        ))}
        <div className="gx-lbl">Ce que tes crédits permettent de faire</div>
        <div className="gx-tbl">
          <table>
            <thead><tr><th>Action</th><th>Crédits</th>{perCredit > 0 && <th>≈ €</th>}</tr></thead>
            <tbody>
              {ACTION_CARDS.map((a) => {
                const cost = ACTION_COSTS.find((c) => c.code === a.code);
                return (
                  <tr key={a.code}>
                    <td><b>{a.label}</b>{cost?.description && <small>{cost.description}</small>}</td>
                    <td className="gx-num">{a.freeLabel ?? (cost ? frInt(cost.credits) : "—")}</td>
                    {perCredit > 0 && <td className="gx-num">{a.freeLabel || !cost ? "—" : fmtEur(cost.credits * perCredit)}</td>}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="gx-hint">Les rendus qui échouent sont automatiquement remboursés en crédits. Questions fréquentes sur la facturation : Centre d'aide, rubrique « Compte &amp; équipe ».</p>
      </div>
    </>
  );
}
