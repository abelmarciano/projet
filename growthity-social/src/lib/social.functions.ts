// Réseaux sociaux : connexion des comptes, calendrier et publication via Zernio.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { ensureZernioProfile, loadActiveBrand, uploadToZernio, zernio } from "@/lib/zernio.server";

export const SOCIAL_PLATFORMS = ["instagram", "facebook", "tiktok", "linkedin", "youtube", "pinterest"] as const;
const Platform = z.enum(SOCIAL_PLATFORMS);
const Status = z.enum(["idea", "draft", "scheduled", "publishing", "published", "partial", "failed"]);

/* ---------- Comptes ---------- */

export const getSocialOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const brand = await loadActiveBrand(context.supabase, context.userId);
    const { data: accounts } = await context.supabase
      .from("social_accounts")
      .select("id, zernio_account_id, platform, username, display_name, avatar_url, status")
      .eq("brand_id", brand.id)
      .eq("status", "connected")
      .order("platform");
    return { brand: { id: brand.id, name: brand.name, logo_url: brand.logo_url }, accounts: accounts ?? [] };
  });

export const getSocialConnectUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ platform: Platform, origin: z.string().url() }))
  .handler(async ({ context, data }) => {
    const appUrl = process.env.APP_URL; // ex. https://app.growthity.ai — empêche une redirection vers un autre site
    const origin = appUrl && !data.origin.startsWith(appUrl) ? appUrl : data.origin;
    const brand = await loadActiveBrand(context.supabase, context.userId);
    const profileId = await ensureZernioProfile(context.supabase, brand);
    const redirect = `${origin}/reseaux?tab=comptes&connected=${data.platform}`;
    const qs = new URLSearchParams({ profileId, redirect_url: redirect, welcome: "true" });
    const { data: res } = await zernio<{ authUrl: string }>(`/connect/${data.platform}?${qs}`);
    return { authUrl: res.authUrl };
  });

/** Relit les comptes du profil Zernio et met à jour la base (appelé au retour de connexion). */
export const syncSocialAccounts = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const brand = await loadActiveBrand(context.supabase, context.userId);
    const profileId = await ensureZernioProfile(context.supabase, brand);
    const { data } = await zernio<{ accounts?: any[] }>(`/accounts?profileId=${profileId}`);
    const live = (data.accounts ?? []).filter((a) => a.isActive !== false);
    const now = new Date().toISOString();
    if (live.length) {
      await context.supabase.from("social_accounts").upsert(
        live.map((a) => ({
          brand_id: brand.id,
          workspace_id: brand.workspace_id,
          zernio_account_id: a._id,
          platform: a.platform,
          username: a.username ?? null,
          display_name: a.displayName ?? a.name ?? null,
          avatar_url: a.profilePicture ?? a.avatarUrl ?? null,
          status: "connected",
          updated_at: now,
        })),
        { onConflict: "zernio_account_id" },
      );
    }
    const ids = live.map((a) => a._id);
    let stale = context.supabase.from("social_accounts").update({ status: "disconnected", updated_at: now }).eq("brand_id", brand.id);
    if (ids.length) stale = stale.not("zernio_account_id", "in", `(${ids.map((i) => `"${i}"`).join(",")})`);
    await stale;
    return { count: live.length };
  });

export const disconnectSocialAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ zernioAccountId: z.string().min(1) }))
  .handler(async ({ context, data }) => {
    const brand = await loadActiveBrand(context.supabase, context.userId);
    const { data: acc } = await context.supabase
      .from("social_accounts").select("id").eq("brand_id", brand.id).eq("zernio_account_id", data.zernioAccountId).maybeSingle();
    if (!acc) throw new Error("Compte introuvable pour cette marque.");
    await zernio(`/accounts/${data.zernioAccountId}`, { method: "DELETE" });
    await context.supabase.from("social_accounts").update({ status: "disconnected", updated_at: new Date().toISOString() }).eq("id", acc.id);
    return { ok: true };
  });

/* ---------- Bibliothèque : créations Growthity prêtes ---------- */

export const listSocialLibrary = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const brand = await loadActiveBrand(context.supabase, context.userId);
    const { data } = await context.supabase
      .from("ads")
      .select("id, title, content_type, aspect_ratio, generated_url, created_at")
      .eq("brand_id", brand.id)
      .not("generated_url", "is", null)
      .order("created_at", { ascending: false })
      .limit(80);
    return (data ?? []).map((a: any) => ({
      id: a.id as string,
      title: (a.title as string) || "Création",
      url: a.generated_url as string,
      kind: /video/i.test(a.content_type ?? "") || /\.mp4($|\?)/i.test(a.generated_url) ? ("video" as const) : ("image" as const),
      ratio: (a.aspect_ratio as string) || "",
    }));
  });

/* ---------- Publications ---------- */

const PostInput = z.object({
  id: z.string().uuid().optional(),
  ad_id: z.string().uuid().nullable().optional(),
  media_url: z.string().url().nullable().optional(),
  media_kind: z.enum(["video", "image"]).nullable().optional(),
  caption: z.string().max(2200).default(""),
  account_ids: z.array(z.string()).default([]),
  scheduled_at: z.string().datetime().nullable().optional(),
  timezone: z.string().default("Europe/Paris"),
  status: z.enum(["idea", "draft"]).default("draft"),
});

export const listSocialPosts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const brand = await loadActiveBrand(context.supabase, context.userId);
    const { data } = await context.supabase
      .from("social_posts")
      .select("*")
      .eq("brand_id", brand.id)
      .order("scheduled_at", { ascending: true, nullsFirst: false })
      .limit(500);
    return data ?? [];
  });

export const saveSocialPost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(PostInput)
  .handler(async ({ context, data }) => {
    const brand = await loadActiveBrand(context.supabase, context.userId);
    if (data.id) {
      const { data: cur } = await context.supabase.from("social_posts").select("status").eq("id", data.id).eq("brand_id", brand.id).maybeSingle();
      if (!cur) throw new Error("Publication introuvable.");
      if (!["idea", "draft", "failed"].includes(cur.status)) throw new Error("Cette publication est déjà envoyée : annule-la avant de la modifier.");
    }
    const row = {
      ...data,
      brand_id: brand.id,
      workspace_id: brand.workspace_id,
      created_by: data.id ? undefined : context.userId,
      updated_at: new Date().toISOString(),
    };
    const { data: saved, error } = await context.supabase.from("social_posts").upsert(row).select("*").single();
    if (error) throw new Error(error.message);
    return saved;
  });

export const deleteSocialPost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ id: z.string().uuid() }))
  .handler(async ({ context, data }) => {
    const brand = await loadActiveBrand(context.supabase, context.userId);
    const { data: post } = await context.supabase.from("social_posts").select("status, zernio_post_id").eq("id", data.id).eq("brand_id", brand.id).maybeSingle();
    if (!post) return { ok: true };
    // Une publication programmée chez Zernio est annulée là-bas d'abord.
    if (post.zernio_post_id && post.status === "scheduled") await zernio(`/posts/${post.zernio_post_id}`, { method: "DELETE" });
    await context.supabase.from("social_posts").delete().eq("id", data.id);
    return { ok: true };
  });

function mapResults(post: any) {
  return (post?.platforms ?? []).map((p: any) => ({
    platform: p.platform,
    status: p.status,
    url: p.platformPostUrl ?? null,
    error: p.errorMessage ?? null,
  }));
}

export const publishSocialPost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ id: z.string().uuid(), mode: z.enum(["now", "schedule"]) }))
  .handler(async ({ context, data }) => {
    const brand = await loadActiveBrand(context.supabase, context.userId);
    const { data: post } = await context.supabase.from("social_posts").select("*").eq("id", data.id).eq("brand_id", brand.id).maybeSingle();
    if (!post) throw new Error("Publication introuvable.");
    if (!post.media_url) throw new Error("Ajoute une vidéo ou une image.");
    if (!post.account_ids?.length) throw new Error("Choisis au moins un réseau.");
    if (data.mode === "schedule" && (!post.scheduled_at || new Date(post.scheduled_at).getTime() < Date.now() + 60_000))
      throw new Error("Choisis une date dans le futur pour programmer.");

    const { data: accounts } = await context.supabase
      .from("social_accounts").select("zernio_account_id, platform")
      .eq("brand_id", brand.id).eq("status", "connected").in("zernio_account_id", post.account_ids);
    if (!accounts?.length) throw new Error("Les réseaux choisis ne sont plus connectés.");

    await context.supabase.from("social_posts").update({ status: "publishing", error: null }).eq("id", post.id);
    try {
      const media = await uploadToZernio(post.media_url, `growthity-${post.id}.${post.media_kind === "image" ? "jpg" : "mp4"}`);
      const caption = post.caption ?? "";
      const platforms = accounts.map((a: any) => {
        const entry: any = { platform: a.platform, accountId: a.zernio_account_id };
        if (a.platform === "facebook" && media.kind === "video") entry.platformSpecificData = { contentType: "reel" };
        if (a.platform === "youtube") entry.platformSpecificData = { title: (caption.split("\n")[0] || brand.name).slice(0, 95), visibility: "public" };
        return entry;
      });
      const body: any = { content: caption, mediaItems: [{ type: media.kind, url: media.url }], platforms };
      if (accounts.some((a: any) => a.platform === "tiktok")) {
        body.tiktokSettings = { privacy_level: "PUBLIC_TO_EVERYONE", allow_comment: true, allow_duet: true, allow_stitch: true, content_preview_confirmed: true, express_consent_given: true };
      }
      if (data.mode === "now") body.publishNow = true;
      else { body.scheduledFor = new Date(post.scheduled_at).toISOString(); body.timezone = post.timezone; }

      const { data: res } = await zernio<{ post: any }>("/posts", {
        method: "POST",
        body,
        headers: { "Idempotency-Key": `${post.id}:${data.mode}:${post.scheduled_at ?? "now"}` },
      });
      const z = res.post;
      const status = ["published", "partial", "failed", "scheduled"].includes(z.status) ? z.status : "publishing";
      const { data: saved } = await context.supabase.from("social_posts").update({
        status,
        zernio_post_id: z._id,
        results: mapResults(z),
        scheduled_at: post.scheduled_at ?? new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }).eq("id", post.id).select("*").single();
      return saved;
    } catch (e: any) {
      await context.supabase.from("social_posts").update({ status: "failed", error: String(e?.message ?? e) }).eq("id", post.id);
      throw e;
    }
  });

/** Met à jour le statut d'une publication programmée ou en cours depuis Zernio. */
export const refreshSocialPost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ id: z.string().uuid() }))
  .handler(async ({ context, data }) => {
    const brand = await loadActiveBrand(context.supabase, context.userId);
    const { data: post } = await context.supabase.from("social_posts").select("zernio_post_id").eq("id", data.id).eq("brand_id", brand.id).maybeSingle();
    if (!post?.zernio_post_id) return null;
    const { data: res } = await zernio<{ post: any }>(`/posts/${post.zernio_post_id}`);
    const z = res.post;
    const status = Status.safeParse(z.status).success ? z.status : "publishing";
    const { data: saved } = await context.supabase.from("social_posts")
      .update({ status, results: mapResults(z), updated_at: new Date().toISOString() })
      .eq("id", data.id).select("*").single();
    return saved;
  });
