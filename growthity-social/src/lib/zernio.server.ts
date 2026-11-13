// Client Zernio côté serveur uniquement. La clé ZERNIO_API_KEY vit dans les secrets, jamais dans le navigateur.
import type { SupabaseClient } from "@supabase/supabase-js";

const ZERNIO = "https://zernio.com/api/v1";

export class ZernioError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ZernioError";
    this.status = status;
  }
}

export async function zernio<T = any>(
  path: string,
  init: { method?: string; body?: unknown; headers?: Record<string, string> } = {},
): Promise<{ status: number; data: T }> {
  const key = process.env.ZERNIO_API_KEY;
  if (!key) throw new ZernioError("La clé ZERNIO_API_KEY n'est pas configurée.", 500);
  const res = await fetch(ZERNIO + path, {
    method: init.method ?? "GET",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json", ...init.headers },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
  });
  const text = await res.text();
  let data: any = {};
  try { data = text ? JSON.parse(text) : {}; } catch { data = { raw: text }; }
  if (!res.ok) throw new ZernioError(data?.error || data?.message || `Zernio a répondu ${res.status}`, res.status);
  return { status: res.status, data };
}

/** Marque active de l'utilisateur (profil Growthity) avec son workspace. */
export async function loadActiveBrand(supabase: SupabaseClient<any>, userId: string) {
  const { data: profile } = await supabase.from("profiles").select("current_brand_id").eq("id", userId).maybeSingle();
  let q = supabase.from("brands").select("id, name, logo_url, workspace_id");
  q = profile?.current_brand_id ? q.eq("id", profile.current_brand_id) : q.eq("is_default", true);
  const { data: brand } = await q.limit(1).maybeSingle();
  if (!brand) throw new ZernioError("Aucune marque active. Choisis une marque dans le menu.", 400);
  return brand as { id: string; name: string; logo_url: string | null; workspace_id: string };
}

/** Un profil Zernio par marque Growthity (externalId = brand_<id>), créé à la première utilisation. */
export async function ensureZernioProfile(supabase: SupabaseClient<any>, brand: { id: string; name: string; workspace_id: string }) {
  const { data: row } = await supabase.from("social_profiles").select("zernio_profile_id").eq("brand_id", brand.id).maybeSingle();
  if (row?.zernio_profile_id) return row.zernio_profile_id as string;

  const externalId = `brand_${brand.id}`;
  let profileId: string | undefined;
  const found = await zernio<{ profiles?: { _id: string }[] }>(`/profiles?externalId=${encodeURIComponent(externalId)}`);
  profileId = found.data.profiles?.[0]?._id;
  if (!profileId) {
    const created = await zernio<{ profile: { _id: string } }>("/profiles", {
      method: "POST",
      body: { name: `${brand.name} · ${brand.id.slice(0, 6)}`, externalId },
    });
    profileId = created.data.profile._id;
  }
  await supabase.from("social_profiles").upsert({ brand_id: brand.id, workspace_id: brand.workspace_id, zernio_profile_id: profileId });
  return profileId;
}

/** Copie un fichier (vidéo/image Growthity) dans le stockage Zernio et renvoie son URL publique. */
export async function uploadToZernio(sourceUrl: string, filename: string) {
  const src = await fetch(sourceUrl);
  if (!src.ok) throw new ZernioError("Impossible de récupérer le fichier à publier.", 400);
  const contentType = src.headers.get("content-type") || (/\.mp4($|\?)/i.test(sourceUrl) ? "video/mp4" : "image/jpeg");
  const body = await src.arrayBuffer(); // taille connue : obligatoire pour l'envoi signé
  const { data: presigned } = await zernio<{ uploadUrl: string; publicUrl: string }>("/media/presign", {
    method: "POST",
    body: { filename, contentType, size: body.byteLength },
  });
  const put = await fetch(presigned.uploadUrl, { method: "PUT", headers: { "Content-Type": contentType }, body });
  if (!put.ok) throw new ZernioError("L'envoi du fichier vers Zernio a échoué.", put.status);
  return { url: presigned.publicUrl, kind: contentType.startsWith("video") ? ("video" as const) : ("image" as const) };
}
