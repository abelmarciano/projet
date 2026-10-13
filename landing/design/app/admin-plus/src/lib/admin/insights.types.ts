/*
 * Contrat entre les nouvelles pages admin et leurs fonctions serveur.
 * Les fonctions serveur (src/lib/admin/insights.functions.ts) DOIVENT renvoyer exactement ces formes.
 * Montants : centimes d'euro (entiers) sauf mention contraire. Dates : ISO 8601.
 */

/* ---------- 1. Coûts et marge ---------- */
export type CostPeriod = 7 | 30 | 90;
export type AdminCosts = {
  days: CostPeriod;
  since: string;
  /** Première ligne de generation_costs : avant cette date, aucun coût n'est connu. */
  dataSince: string | null;
  totals: {
    /** Encaissé sur la période (stripe_processed_invoices.amount_paid_cents). */
    revenueCents: number;
    /** Coût fournisseurs connu sur la période (generation_costs + llm_outputs, sans double comptage). */
    costCents: number;
    /** Crédits réellement consommés : commits − remboursements. */
    creditsConsumed: number;
    /** Coût réel d'un crédit (costCents / creditsConsumed), null si aucun crédit consommé. */
    realCostPerCreditCents: number | null;
    /** Coût de revient théorique utilisé dans la grille tarifaire (COST_PER_CREDIT_USD converti en €). */
    theoreticalCostPerCreditCents: number;
  };
  /** Qualité des données : appels dont le coût est inconnu (tarif fournisseur manquant). */
  coverage: { pricedCalls: number; unpricedCalls: number; unpricedModels: { modelId: string; provider: string | null; unit: string | null; calls: number }[] };
  series: { date: string; costCents: number; creditsConsumed: number }[];
  byProvider: { provider: string; costCents: number; calls: number }[];
  byAction: { actionCode: string; costCents: number; creditsConsumed: number; calls: number }[];
  topWorkspaces: { workspaceId: string; name: string; plan: string | null; costCents: number; creditsConsumed: number; revenueCents: number }[];
};

/* ---------- 2. Générations (échecs, en attente) ---------- */
export type GenSource = "ad" | "media" | "batch" | "brand_job";
export type GenStatus = "failed" | "pending" | "completed";
export type AdminGenerationRow = {
  id: string;
  source: GenSource;
  workspaceId: string | null;
  workspaceName: string | null;
  title: string | null;
  status: GenStatus;
  /** Statut brut de la table d'origine (ex. "queued", "processing"). */
  rawStatus: string;
  error: string | null;
  model: string | null;
  contentType: "video" | "image" | "audio" | "other";
  createdAt: string;
  updatedAt: string | null;
  /** Une relance admin est possible pour cette ligne. */
  retryable: boolean;
};
export type AdminGenerations = {
  summary: {
    failed24h: number;
    failed7d: number;
    pendingNow: number;
    /** En attente depuis plus d'1 h. */
    stuck: number;
    topErrors: { message: string; count: number }[];
    byModel: { model: string; total: number; failed: number }[];
  };
  rows: AdminGenerationRow[];
  total: number;
};
export type AdminGenerationsInput = {
  status: GenStatus | "all";
  source: GenSource | "all";
  days: 1 | 7 | 30;
  q: string | null;
  limit: number;
  offset: number;
};

/* ---------- 3. Crédits d'un client ---------- */
export type CreditKind = "hold" | "commit" | "refund" | "grant" | "adjustment" | "expire" | "rollover";
export type AdminWorkspaceCredits = {
  balance: number;
  held: number;
  planCode: string | null;
  periodStart: string | null;
  periodEnd: string | null;
  /** Consommés depuis periodStart : commits − remboursements. */
  usedThisPeriod: number;
  /** Ajoutés depuis periodStart : grant + adjustment positifs + rollover. */
  grantedThisPeriod: number;
  rows: {
    id: string;
    kind: CreditKind | string;
    amount: number;
    balanceAfter: number | null;
    actionCode: string | null;
    referenceId: string | null;
    /** Motif saisi par un admin (metadata.reason), sinon null. */
    reason: string | null;
    createdByEmail: string | null;
    createdAt: string;
  }[];
  total: number;
};

/* ---------- 4. Acquisition et activation ---------- */
export type FunnelStepKey = "signup" | "onboarded" | "first_creation" | "meta_connected" | "first_publish" | "paying";
export type AdminFunnel = {
  /** 0 = depuis toujours. */
  days: 30 | 90 | 365 | 0;
  steps: { key: FunnelStepKey; label: string; count: number }[];
  /** Délai médian entre deux étapes consécutives, en heures (null si pas assez de données). */
  medianHours: { from: FunnelStepKey; to: FunnelStepKey; hours: number | null }[];
  bySource: { source: string; signups: number; activated: number; paying: number }[];
  weekly: { weekStart: string; signups: number; paying: number }[];
  /** Clients arrêtés à une étape (dernière étape atteinte), du plus récent au plus ancien. */
  stalled: { workspaceId: string; name: string; ownerEmail: string | null; lastStep: FunnelStepKey; since: string }[];
};

/* ---------- 5. Alertes hors de l'app ---------- */
export type AlertKind = "pending_stuck" | "failure_spike" | "at_risk" | "new_signup" | "plan_change" | "provider_error";
export type AdminAlertSettings = {
  emailEnabled: boolean;
  /** Types envoyés par e-mail. */
  emailKinds: AlertKind[];
  /** Destinataires : e-mails des comptes admin (lecture seule, depuis admin_roles). */
  recipients: string[];
  slackEnabled: boolean;
  /** Indique seulement si une URL Slack est enregistrée (l'URL n'est jamais renvoyée au navigateur). */
  slackConfigured: boolean;
  lastSentAt: string | null;
};
