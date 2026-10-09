import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  fetchAccountDaily,
  fetchAccountDailyMulti,
  fetchAdCreatives,
  fetchAdInsights,
  fetchAdInsightsMulti,
  fetchCampaignDaily,
  fetchCampaignDailyMulti,
  fetchCampaignListMulti,

  loadMetaAccounts,
  fetchCampaignTotals,
  fillDays,
  loadMetaCredsSafe,
  countResults,
  shiftRange,
  sumPoints,
} from "@/lib/meta-insights.server";


const RangeInput = z.object({
  since: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  until: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  /** Isoler un seul compte publicitaire ; par défaut tous les comptes actifs. */
  accountId: z.string().trim().min(3).max(64).nullish(),
});

export const getMetaPerformance = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => RangeInput.parse(input))
  .handler(async ({ data, context }) => {
    const ctx = await loadMetaAccounts(context.supabase, context.userId, data.accountId ?? null);
    if (!ctx) {
      const prevEmpty = shiftRange(data.since, data.until);
      return {
        range: { since: data.since, until: data.until },
        daily: fillDays([], data.since, data.until),
        /** Série jour par jour de la période précédente (même durée). */
        previousDaily: fillDays([], prevEmpty.since, prevEmpty.until),
        totals: sumPoints([]),
        previous: sumPoints([]),
        accounts: [] as Array<{ id: string; name: string }>,
        campaigns: [] as Array<{ id: string; name: string; objective: string; status: string; effectiveStatus: string; accountId: string; accountName: string; totals: ReturnType<typeof sumPoints>; previous: ReturnType<typeof sumPoints>; series: ReturnType<typeof fillDays>; previousSeries: ReturnType<typeof fillDays> }>,
        notConnected: true,
      };
    }
    const prev = shiftRange(data.since, data.until);
    const [daily, campaigns, prevDaily, prevCampaigns, allCampaigns] = await Promise.all([
      fetchAccountDailyMulti(ctx, data.since, data.until),
      fetchCampaignDailyMulti(ctx, data.since, data.until),
      fetchAccountDailyMulti(ctx, prev.since, prev.until).catch(() => []),
      fetchCampaignDailyMulti(ctx, prev.since, prev.until).catch(() => []),
      fetchCampaignListMulti(ctx).catch(() => []),
    ]);

    const prevById = new Map(prevCampaigns.map((c) => [c.id, sumPoints(c.points)]));
    // Points jour par jour de la période précédente, pour le graphique en barres.
    const prevPointsById = new Map(prevCampaigns.map((c) => [c.id, c.points]));
    // Les chiffres (insights) ne portent pas le statut de diffusion : on le
    // récupère depuis la liste des campagnes, sinon le filtre « Actives
    // uniquement » masque toutes les campagnes qui dépensent.
    const metaById = new Map(allCampaigns.map((c) => [c.id, c as any]));

    const rows = campaigns.map((c) => ({
      id: c.id,
      name: c.name,
      objective: c.objective ?? metaById.get(c.id)?.objective ?? "",
      status: (c as any).status ?? metaById.get(c.id)?.status ?? "",
      effectiveStatus:
        (c as any).effectiveStatus ??
        metaById.get(c.id)?.effectiveStatus ??
        metaById.get(c.id)?.status ??
        "",
      accountId: c.accountId,
      accountName: c.accountName,
      totals: sumPoints(c.points),
      previous: prevById.get(c.id) ?? sumPoints([]),
      series: fillDays(c.points, data.since, data.until),
      previousSeries: fillDays(prevPointsById.get(c.id) ?? [], prev.since, prev.until),
    }));

    // Les campagnes sans diffusion sur la période doivent rester visibles (à zéro).
    const seen = new Set(rows.map((r) => r.id));
    for (const c of allCampaigns) {
      if (seen.has(c.id)) continue;
      seen.add(c.id);
      rows.push({
        id: c.id,
        name: c.name,
        objective: c.objective,
        status: (c as any).status ?? "",
        effectiveStatus: (c as any).effectiveStatus ?? "",
        accountId: c.accountId,
        accountName: c.accountName,
        totals: sumPoints([]),
        previous: prevById.get(c.id) ?? sumPoints([]),
        series: fillDays([], data.since, data.until),
        previousSeries: fillDays(prevPointsById.get(c.id) ?? [], prev.since, prev.until),
      });
    }

    return {
      range: { since: data.since, until: data.until },
      daily: fillDays(daily, data.since, data.until),
      /** Série jour par jour de la période précédente (même durée). */
      previousDaily: fillDays(prevDaily, prev.since, prev.until),
      totals: sumPoints(daily),
      previous: sumPoints(prevDaily),
      accounts: ctx.accounts,
      campaigns: rows.sort((a, b) => b.totals.spend - a.totals.spend),
    };
  });



/** Statistiques réelles d'une campagne Meta précise (panneau de détail). */
export const getMetaCampaignStats = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ campaignId: z.string().min(3).max(64) }).parse(input))
  .handler(async ({ data, context }) => {
    const creds = await loadMetaCredsSafe(context.supabase, context.userId);
    if (!creds) return { connected: false as const, totals: null };
    try {
      const totals = await fetchCampaignTotals(creds.access_token, data.campaignId);
      return { connected: true as const, totals };
    } catch (e: any) {
      return { connected: true as const, totals: null, error: String(e?.message ?? "") };
    }
  });

export const getMetaTopAds = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => RangeInput.parse(input))
  .handler(async ({ data, context }) => {
    const ctx = await loadMetaAccounts(context.supabase, context.userId, data.accountId ?? null);
    if (!ctx) return { connected: false as const, ads: [] as TopAd[], accounts: [] as Array<{ id: string; name: string }> };
    const rows = await fetchAdInsightsMulti(ctx, data.since, data.until);
    const ads: TopAd[] = rows
      .map((r: any) => ({
        id: String(r.ad_id ?? ""),
        name: String(r.ad_name ?? ""),
        campaign_name: String(r.campaign_name ?? "—"),
        adset_name: String(r.adset_name ?? "—"),
        spend: Number(r.spend) || 0,
        impressions: Number(r.impressions) || 0,
        clicks: Number(r.clicks) || 0,
        ctr: Number(r.ctr) || 0,
        cpc: Number(r.cpc) || 0,
        results: countResults(r.actions),
        account_id: String(r.__account_id ?? ""),
        account_name: String(r.__account_name ?? ""),
        thumbnail_url: null,
        is_video: false,
      }))
      .filter((a) => a.id && a.impressions > 0)
      .sort((a, b) => b.spend - a.spend)
      .slice(0, 48);

    // Les miniatures ne doivent jamais bloquer l'affichage du classement.
    const creatives = await fetchAdCreatives(ctx.access_token, ads.map((a) => a.id)).catch(
      () => new Map<string, { thumbnail_url: string | null; is_video: boolean }>(),
    );
    return {
      connected: true as const,
      accounts: ctx.accounts,
      ads: ads.map((a) => ({
        ...a,
        thumbnail_url: creatives.get(a.id)?.thumbnail_url ?? null,
        is_video: creatives.get(a.id)?.is_video ?? false,
      })),
    };
  });

export type TopAd = {
  id: string;
  name: string;
  campaign_name: string;
  adset_name: string;
  spend: number;
  impressions: number;
  clicks: number;
  ctr: number;
  account_id?: string;
  account_name?: string;
  cpc: number;
  results: number;
  thumbnail_url: string | null;
  is_video: boolean;
};

