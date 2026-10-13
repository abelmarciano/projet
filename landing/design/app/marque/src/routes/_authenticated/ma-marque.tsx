import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { useBrands, useCurrentBrand, useSetActiveBrand } from "@/hooks/useBrands";
import { createBrand, uploadBrandLogo } from "@/lib/brands.functions";
import { setScreenBrandId } from "@/lib/screen-brand";
import {
  getBrandSpace, updateBrandFields, resolveBrandProposition, startBrandJob, tickBrandJob, setPrestashopKey,
  listBrandProducts, setProductPromote, deleteBrandProduct, addProductByUrl,
} from "@/lib/brand-space.functions";

/*
 * Ma marque : copie exacte de la maquette validée (landing/design/marque/marque.html),
 * styles dans src/styles/gx-marque.css (tout est sous .gx-mq).
 * En-tête = carte d'identité (logo, nom, changement de marque, site web, complétude, analyse) ;
 * onglets Fiche / Produits / Concurrents. Mêmes données et fonctions serveur qu'avant (brand-space.functions).
 */

const tabs = ["fiche", "vendre", "concurrents"] as const;
type Tab = (typeof tabs)[number];

export const Route = createFileRoute("/_authenticated/ma-marque")({
  validateSearch: z.object({ tab: z.enum(tabs).optional() }),
  head: () => ({
    meta: [
      { title: "Ma marque — Growthity" },
      { name: "description", content: "La fiche complète de ta marque : identité, ton, clients, produits et concurrents." },
      { property: "og:title", content: "Ma marque — Growthity" },
      { property: "og:description", content: "La fiche complète de ta marque : identité, ton, clients, produits et concurrents." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

/* ---------- libellés et formats ---------- */

const LABELS: Record<string, string> = {
  name: "Nom", website: "Site web", couleur_principale: "Couleur principale", couleur_secondaire: "Couleur secondaire",
  couleur_texte: "Couleur du texte", couleur_fond: "Couleur de fond", police_titres: "Police des titres", police_texte: "Police du texte",
  presentation: "Présentation", promesse: "Promesse", valeurs: "Valeurs", ton_3_mots: "Ton (3 mots)", client_type: "Client type",
  problemes_client: "Problèmes du client", preuves: "Preuves (avis, labels, chiffres)", zone_chalandise: "Zone d'intervention",
  mots_interdits: "Mots interdits", promesses_interdites: "Promesses interdites", secteur: "Secteur", pays_vente: "Pays de vente",
  meta_page_id: "Page Facebook (ID)", default_cta_url: "Lien de destination par défaut", style_visuel: "Style visuel",
  a_ne_jamais_montrer: "À ne jamais montrer", titres_a_eviter: "Titres à éviter", type_activite: "Type d'activité",
  logo_url: "Logo", langue_principale: "Langue principale",
};
const LIST_FIELDS = new Set(["ton_3_mots", "problemes_client", "mots_interdits", "promesses_interdites", "pays_vente", "titres_a_eviter"]);
const BAD_LISTS = new Set(["mots_interdits", "promesses_interdites", "titres_a_eviter"]);
const COLORS = ["couleur_principale", "couleur_secondaire", "couleur_texte", "couleur_fond"];
const ACTIVITIES: [string, string][] = [["", "Non renseigné"], ["ecommerce", "E-commerce"], ["service_local", "Service local"], ["autre", "Autre"]];
const HEX = /^#[0-9a-f]{6}$/i;

function toText(key: string, v: unknown): string {
  if (v == null) return "";
  if (LIST_FIELDS.has(key)) return Array.isArray(v) ? v.join(", ") : String(v);
  if (key === "zone_chalandise") { const zc = v as any; return [zc?.ville, zc?.rayon_km ? `${zc.rayon_km} km` : null].filter(Boolean).join(" · "); }
  if (key === "preuves") return toList("preuves", v).join("\n");
  return String(v);
}
function fromText(key: string, t: string): unknown {
  const s = t.trim();
  if (!s) return null;
  if (LIST_FIELDS.has(key)) return s.split(/[,\n]/).map((x) => x.trim()).filter(Boolean);
  if (key === "zone_chalandise") { const km = s.match(/(\d+)\s*km/i); return { ville: s.replace(/·?\s*\d+\s*km/i, "").trim() || undefined, rayon_km: km ? Number(km[1]) : undefined }; }
  if (key === "preuves") return s.split("\n").map((x) => x.trim()).filter(Boolean);
  return s;
}
function toList(key: string, v: unknown): string[] {
  if (v == null) return [];
  if (key === "preuves") {
    if (Array.isArray(v)) return v.map((x) => (typeof x === "string" ? x : x?.texte ?? x?.text ?? "")).filter(Boolean);
    if (typeof v === "object") return Object.values(v as Record<string, unknown>).flat().filter((x): x is string => typeof x === "string");
    return typeof v === "string" ? v.split("\n").filter(Boolean) : [];
  }
  if (Array.isArray(v)) return v.map(String).filter(Boolean);
  return String(v).split(/[,\n]/).map((x) => x.trim()).filter(Boolean);
}
/** Le serveur nomme encore ce manque « zone de chalandise » : on affiche le nouveau libellé. */
const missingLabel = (m: string) => (m === "zone de chalandise" ? "zone d'intervention" : m);
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
/** Section de la fiche où se complète chaque information manquante. */
function missingTarget(m: string): string {
  if (m === "site web") return "mq-site";
  if (/logo|couleur|police|style/.test(m)) return "mq-s-identite";
  if (/présentation|promesse|ton/.test(m)) return "mq-s-positionnement";
  if (/client/.test(m)) return "mq-s-clients";
  if (/lien/.test(m)) return "mq-s-pub";
  return "mq-s-marche";
}

const countryName = (c: string) => { try { return new Intl.DisplayNames(["fr"], { type: "region" }).of(c) ?? c; } catch { return c; } };
const langName = (c: string) => { try { return new Intl.DisplayNames(["fr"], { type: "language" }).of(c) ?? c; } catch { return c; } };
const frDate = (d?: string | null) => (d ? new Date(d).toLocaleString("fr-FR", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" }) : null);
const frDay = (d?: string | null) => (d ? new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "long" }) : null);
const initials = (n?: string | null) => (n ?? "?").trim().split(/\s+/).slice(0, 2).map((w) => w.charAt(0).toUpperCase()).join("") || "?";
const PLATFORM: Record<string, string> = { shopify: "Shopify", woocommerce: "WooCommerce", prestashop: "PrestaShop", wix: "Wix", autre: "Autre" };
function money(v: number | null, d: string | null) {
  if (v == null) return null;
  try { return new Intl.NumberFormat("fr-FR", { style: "currency", currency: d || "EUR" }).format(v); } catch { return `${v} ${d ?? ""}`; }
}
const err = (e: unknown) => toast.error(e instanceof Error && e.message ? e.message : "Une erreur est survenue. Réessaie.");

function Svg({ d, className = "gx-mq-ic" }: { d: string; className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}
const IC = {
  reload: "M21 12a9 9 0 1 1-3-6.7L21 8M21 3v5h-5",
  globe: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18",
  down: "m6 9 6 6 6-6",
  link: "M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1",
  search: "M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM21 21l-4.6-4.6",
  star: "m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z",
  out: "M7 17 17 7M9 7h8v8",
  bag: "M3 7h18l-2 13H5zM8 7a4 4 0 0 1 8 0",
};

/* ---------- données partagées ---------- */

function useBrandSpace(brandId: string) {
  const fn = useServerFn(getBrandSpace);
  const tick = useServerFn(tickBrandJob);
  const q = useQuery({ queryKey: ["brand-space", brandId], queryFn: () => fn({ data: { brandId } }), staleTime: 5_000 });
  const job = (q.data as any)?.job;
  const active = job && (job.status === "queued" || job.status === "running");
  const qc = useQueryClient();
  useEffect(() => {
    if (!active) return;
    let stop = false;
    const loop = async () => {
      while (!stop) {
        try { await tick({ data: { jobId: job.id } }); } catch { /* le cron prend le relais */ }
        if (stop) break;
        await qc.invalidateQueries({ queryKey: ["brand-space", brandId] });
        await qc.invalidateQueries({ queryKey: ["brand-products", brandId] });
        await new Promise((r) => setTimeout(r, 2500));
      }
    };
    void loop();
    return () => { stop = true; };
  }, [active, job?.id, brandId, tick, qc]);
  return q;
}

/** Petit « ✓ Enregistré » après chaque enregistrement. */
function useSavedFlash() {
  const [on, setOn] = useState(false);
  const t = useRef<number | undefined>(undefined);
  const flash = () => { setOn(true); window.clearTimeout(t.current); t.current = window.setTimeout(() => setOn(false), 1400); };
  useEffect(() => () => window.clearTimeout(t.current), []);
  return { on, flash };
}

/* ---------- page ---------- */

function Page() {
  const { tab = "fiche" } = Route.useSearch();
  const { data: brand } = useCurrentBrand();
  const brandId = (brand as { id?: string } | undefined)?.id ?? null;
  const saved = useSavedFlash();

  return (
    <div className="gx-page gx-mq">
      {!brandId ? (
        <div className="gx-box gx-empty"><b>Chargement de ta marque…</b></div>
      ) : (
        <Brand key={brandId} brandId={brandId} tab={tab} saved={saved} />
      )}
    </div>
  );
}

function Brand({ brandId, tab, saved }: { brandId: string; tab: Tab; saved: ReturnType<typeof useSavedFlash> }) {
  const qc = useQueryClient();
  const space = useBrandSpace(brandId);
  const save = useServerFn(updateBrandFields);
  const start = useServerFn(startBrandJob);
  const [busy, setBusy] = useState(false);

  const data = space.data as any;
  const b = data?.brand;
  const job = data?.job;
  const running = Boolean(job && (job.status === "queued" || job.status === "running"));
  const refresh = () => qc.invalidateQueries({ queryKey: ["brand-space", brandId] });

  const commit = async (key: string, value: unknown) => {
    try { await save({ data: { brandId, patch: { [key]: value } } }); await refresh(); saved.flash(); }
    catch (e) { err(e); }
  };
  const run = async (kind: "analyse" | "catalogue", ok: string) => {
    if (busy) return; setBusy(true);
    try { await start({ data: { brandId, kind } }); await refresh(); toast.success(ok); }
    catch (e) { err(e); } finally { setBusy(false); }
  };

  if (space.isLoading || !b) return <div className="gx-box gx-empty"><b>Chargement de la fiche…</b></div>;

  const count = data?.status?.catalogue?.count ?? 0;

  return (
    <>
      <Hero brandId={brandId} data={data} running={running} busy={busy} commit={commit}
        onAnalyse={() => void run("analyse", "Analyse lancée")} onRetry={(k) => void run(k, "Relancé")} />
      {running && <JobProgress job={job} />}

      <div className="gx-mq-tabs">
        <nav className="gx-seg" role="tablist" aria-label="Sections de la marque">
          <Link to="/ma-marque" search={{ tab: "fiche" }} role="tab" aria-selected={tab === "fiche"}>Fiche</Link>
          <Link to="/ma-marque" search={{ tab: "vendre" }} role="tab" aria-selected={tab === "vendre"}>Produits <em className="gx-mq-n">{count}</em></Link>
          <Link to="/ma-marque" search={{ tab: "concurrents" }} role="tab" aria-selected={tab === "concurrents"}>Concurrents <span className="gx-mq-soon">Bientôt</span></Link>
        </nav>
        <span className={saved.on ? "gx-mq-saved gx-mq-on" : "gx-mq-saved"} role="status">✓ Enregistré</span>
      </div>

      {tab === "fiche" ? <Fiche brandId={brandId} data={data} commit={commit} saved={saved} />
        : tab === "vendre" ? <Produits brandId={brandId} running={running} onCatalogue={() => void run("catalogue", "Lecture du catalogue lancée")} />
        : <Concurrents />}
    </>
  );
}

/* ---------- en-tête : carte d'identité ---------- */

function Hero({ brandId, data, running, busy, commit, onAnalyse, onRetry }: {
  brandId: string; data: any; running: boolean; busy: boolean;
  commit: (k: string, v: unknown) => Promise<void>; onAnalyse: () => void; onRetry: (k: "analyse" | "catalogue") => void;
}) {
  const b = data.brand;
  const [site, setSite] = useState<string>(b.website ?? "");
  const st = data.status ?? {};
  const c = st.catalogue ?? {}, a = st.analyse ?? {};
  const cRun = c.job && (c.job.status === "queued" || c.job.status === "running");
  const aRun = a.job && (a.job.status === "queued" || a.job.status === "running");
  const cFailed = c.job?.status === "failed" && !cRun, aFailed = a.job?.status === "failed" && !aRun;
  const pct = Math.max(0, Math.min(100, Number(data.completude) || 0));
  const meta = [
    b.plateforme ? PLATFORM[b.plateforme] ?? cap(String(b.plateforme)) : null,
    b.langue_principale ? cap(langName(String(b.langue_principale))) : null,
    toList("pays_vente", b.pays_vente).length ? `vend en ${toList("pays_vente", b.pays_vente).map((p) => (p.length === 2 ? countryName(p.toUpperCase()) : p)).join(", ")}` : null,
  ].filter(Boolean).join(" · ");
  const noSite = !site.trim();

  return (
    <>
      <section className="gx-mq-hero" aria-label="Identité de la marque">
        <span className="gx-mq-hlogo">
          {b.logo_display ? <img src={b.logo_display} alt="" referrerPolicy="no-referrer" /> : <span>{initials(b.name)}</span>}
        </span>
        <div className="gx-mq-hid">
          <div className="gx-mq-hname">
            <h1>{b.name}</h1>
            <BrandSwitch currentId={brandId} />
          </div>
          <div className="gx-mq-hsite">
            <label className={noSite ? "gx-mq-sitein gx-mq-need" : "gx-mq-sitein"} title="Site web de la marque : sert à l'analyse et à la lecture du catalogue">
              <Svg d={IC.globe} />
              <input id="mq-site" value={site} onChange={(e) => setSite(e.target.value)}
                onBlur={() => { if (site.trim() !== (b.website ?? "")) void commit("website", site.trim() || null); }}
                onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
                aria-label="Site web de la marque" placeholder="Ajoute le site de ta marque" />
            </label>
            <span>{noSite ? "Ajoute le site : Growthity lira ta marque et tes produits." : meta}</span>
          </div>
          <div className="gx-mq-hstat">
            <span><i className={cRun ? "gx-mq-run" : cFailed ? "gx-mq-bad" : c.syncedAt ? "" : "gx-mq-off"} />
              Catalogue : {c.count ? `${c.count} produit${c.count > 1 ? "s" : ""}` : c.syncedAt ? "0 produit" : "pas encore lu"}
              {cRun ? " · lecture en cours…" : cFailed ? " · dernière lecture interrompue" : c.syncedAt ? `, à jour le ${frDate(c.syncedAt)}` : ""}
            </span>
            <span><i className={aRun ? "gx-mq-run" : aFailed ? "gx-mq-bad" : a.at ? "" : "gx-mq-off"} />
              Analyse de la fiche : {aRun ? "en cours…" : aFailed ? "interrompue" : a.at ? `faite le ${frDay(a.at)}` : "pas encore faite"}
            </span>
          </div>
        </div>
        <div className="gx-mq-hright">
          <div className="gx-mq-ring" style={{ ["--p" as string]: pct }} aria-label={`Marque complète à ${pct} %`}><b>{pct} %</b></div>
          <div className="gx-mq-hcta">
            <button type="button" className="gx-btn gx-pri" onClick={onAnalyse} disabled={busy || running || noSite}>
              <Svg d={IC.reload} />
              {running && data.job?.kind === "analyse" ? "Analyse en cours…" : b.derniere_analyse_at ? "Réanalyser mon site" : "Analyser mon site"}
            </button>
            <small>{noSite ? "Ajoute d'abord le site web de ta marque." : "Tes modifications ne sont jamais écrasées."}</small>
          </div>
        </div>
      </section>

      {(cFailed || aFailed) && (
        <div className="gx-mq-alert" role="status">
          {cFailed && (
            <div><p><b>La lecture du catalogue s'est arrêtée.</b> {c.job?.error ?? ""}</p>
              <button type="button" className="gx-btn gx-sm" onClick={() => onRetry("catalogue")}>Relancer</button></div>
          )}
          {aFailed && (
            <div><p><b>L'analyse de la fiche s'est arrêtée.</b> {a.job?.error || ""} Le catalogue n'est pas concerné.</p>
              <button type="button" className="gx-btn gx-sm" onClick={() => onRetry("analyse")}>Relancer</button></div>
          )}
        </div>
      )}
    </>
  );
}

/** Changer de marque, en créer une, ou aller les gérer, sans quitter la page. */
function BrandSwitch({ currentId }: { currentId: string }) {
  const brands = useBrands();
  const setActive = useSetActiveBrand();
  const create = useServerFn(createBrand);
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [site, setSite] = useState("");
  const [saving, setSaving] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) { setOpen(false); setCreating(false); } };
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") { setOpen(false); setCreating(false); } };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("mousedown", close); document.removeEventListener("keydown", esc); };
  }, [open]);

  const doCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || saving) return;
    setSaving(true);
    try {
      const nb: any = await create({ data: { name: name.trim(), website: site.trim() || null } });
      setScreenBrandId(nb.id, "user");
      await qc.invalidateQueries();
      toast.success(nb.created ? "Marque créée" : "Cette marque existe déjà : je l'ouvre.");
      setOpen(false); setCreating(false); setName(""); setSite("");
    } catch (er) { err(er); } finally { setSaving(false); }
  };

  const list = (brands.data ?? []) as any[];
  return (
    <div className="gx-mq-switch" ref={ref}>
      <button type="button" className="gx-mq-swbtn" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
        Changer de marque<Svg d={IC.down} />
      </button>
      {open && (
        <div className="gx-mq-menu" role="menu">
          {!creating ? (
            <>
              <div className="gx-mq-mh">Marques de ce workspace</div>
              {list.map((x) => (
                <button key={x.id} type="button" role="menuitem" onClick={() => { setOpen(false); if (x.id !== currentId) void setActive(x.id); }}>
                  <span className="gx-mq-bi">{x.logo_url ? <img src={x.logo_url} alt="" /> : initials(x.name)}</span>
                  <span className="gx-mq-bn">{x.name}</span>
                  {x.id === currentId && <span className="gx-mq-ck" aria-label="Marque active">✓</span>}
                </button>
              ))}
              <hr />
              <button type="button" role="menuitem" onClick={() => setCreating(true)}>＋ Nouvelle marque</button>
              <Link to="/parametres/marques" role="menuitem" onClick={() => setOpen(false)}>Gérer les marques</Link>
            </>
          ) : (
            <form className="gx-mq-new" onSubmit={doCreate}>
              <b>Nouvelle marque</b>
              <small>Une marque représente une entreprise/client dans ce workspace.</small>
              <label htmlFor="mq-bname">Nom de la marque</label>
              <input id="mq-bname" className="gx-in" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ma Marque" autoFocus maxLength={80} />
              <label htmlFor="mq-bsite">Site web (optionnel)</label>
              <input id="mq-bsite" className="gx-in" value={site} onChange={(e) => setSite(e.target.value)} placeholder="exemple.fr" maxLength={300} />
              <div className="gx-row">
                <button type="button" className="gx-btn gx-sm gx-ghost" onClick={() => setCreating(false)}>Annuler</button>
                <span className="gx-sp" />
                <button type="submit" className="gx-btn gx-sm gx-pri" disabled={!name.trim() || saving}>{saving ? "Création…" : "Créer"}</button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}

/** Progression réelle de l'analyse ou de la lecture du catalogue (étapes du job). */
function JobProgress({ job: j }: { job: any }) {
  const steps: { label: string; status: string; detail?: string }[] = (Array.isArray(j.steps) ? j.steps : [])
    .map((s: any) => (typeof s === "string" ? { label: s, status: "done" } : { label: s?.label ?? s?.key ?? "", status: String(s?.status ?? ""), detail: s?.detail }))
    .filter((s: { label: string }) => s.label);
  const isDone = (s: string) => ["done", "ok", "success", "skipped", "completed"].includes(s);
  const curIdx = steps.findIndex((s) => !isDone(s.status));
  const prod = j.progress?.produits;
  const frac = prod && prod.total ? Math.min(1, prod.done / prod.total) : 0;
  const doneCount = steps.filter((s) => isDone(s.status)).length;
  const pct = steps.length ? Math.max(6, Math.round(((doneCount + (curIdx >= 0 ? frac : 0)) / steps.length) * 100)) : 12;
  return (
    <section className="gx-mq-job" role="status" aria-live="polite">
      <div className="gx-mq-jobh">
        <b>{j.kind === "analyse" ? "Analyse de ta marque en cours…" : "Lecture du catalogue en cours…"}</b>
        <small>Tu peux continuer à créer pendant ce temps.</small>
      </div>
      <div className="gx-mq-bar"><i style={{ width: `${Math.min(100, pct)}%` }} /></div>
      {steps.length > 0 ? (
        <div className="gx-mq-steps">
          {steps.map((s, k) => {
            const done = isDone(s.status), cur = k === curIdx;
            return (
              <span key={`${s.label}-${k}`} className={done ? "gx-mq-done" : cur ? "gx-mq-cur" : undefined}>
                <i aria-hidden="true">{done ? "✓" : k + 1}</i>{s.label}{s.detail ? <em>{s.detail}</em> : null}
              </span>
            );
          })}
        </div>
      ) : j.step ? <p className="gx-hint">{String(j.step)}</p> : null}
    </section>
  );
}

/* ---------- Fiche ---------- */

function Fiche({ brandId, data, commit, saved }: { brandId: string; data: any; commit: (k: string, v: unknown) => Promise<void>; saved: ReturnType<typeof useSavedFlash> }) {
  const qc = useQueryClient();
  const resolve = useServerFn(resolveBrandProposition);
  const psKey = useServerFn(setPrestashopKey);
  const upload = useServerFn(uploadBrandLogo);
  const [psInput, setPsInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const refresh = () => qc.invalidateQueries({ queryKey: ["brand-space", brandId] });

  const { brand: b, missing, hasPrestashopKey } = data;
  const rawProps: Record<string, any> = b.propositions ?? {};
  const iaKeys: string[] = Array.isArray(rawProps.__ia) ? rawProps.__ia : [];
  const deduced: string[] = Array.isArray(rawProps.__couleurs_deduites) ? rawProps.__couleurs_deduites : [];
  const props = Object.entries(rawProps).filter(([k, v]) => !k.startsWith("__") && v !== undefined && v !== null);
  const candidates: { url: string; source?: string }[] = (Array.isArray(b.logo_candidats) ? b.logo_candidats : [])
    .map((c: unknown) => (typeof c === "string" ? { url: c } : (c as { url: string; source?: string })))
    .filter((c: { url?: string }) => !!c?.url)
    .slice(0, 5);
  const miss: string[] = Array.isArray(missing) ? missing.map(missingLabel) : [];

  const decide = async (key: string, accept: boolean) => {
    try { await resolve({ data: { brandId, key, accept } }); await refresh(); toast.success(accept ? "Proposition acceptée" : "On garde ta version"); }
    catch (e) { err(e); }
  };
  const acceptAll = async () => {
    try { for (const [k] of props) await resolve({ data: { brandId, key: k, accept: true } }); await refresh(); toast.success("Propositions acceptées"); }
    catch (e) { err(e); }
  };
  const onLogoFile = async (f?: File | null) => {
    if (!f) return;
    if (!f.type.startsWith("image/")) { toast.error("Choisis une image (PNG, JPG, SVG ou WebP)."); return; }
    if (f.size > 2 * 1024 * 1024) { toast.error("Image trop lourde : 2 Mo maximum."); return; }
    setUploading(true);
    try {
      const base64 = await new Promise<string>((res, rej) => {
        const r = new FileReader();
        r.onload = () => res(String(r.result).split(",")[1] ?? "");
        r.onerror = () => rej(new Error("Lecture du fichier impossible."));
        r.readAsDataURL(f);
      });
      await upload({ data: { brandId, fileName: f.name.slice(0, 120), contentType: f.type, base64 } });
      await refresh(); saved.flash(); toast.success("Logo mis à jour");
    } catch (e) { err(e); } finally { setUploading(false); if (fileRef.current) fileRef.current.value = ""; }
  };

  const F = (key: string, opts: { area?: number; full?: boolean; ph?: string; hint?: string } = {}) => (
    <Field key={`${key}:${JSON.stringify(b[key] ?? null)}`} k={key} value={b[key]} byAi={iaKeys.includes(key)} {...opts} onSave={(v) => commit(key, v)} />
  );
  const L = (key: string) => (
    <ChipField key={`${key}:${JSON.stringify(b[key] ?? null)}`} k={key} value={b[key]} onSave={(v) => commit(key, v)} />
  );

  const brandColor = HEX.test(b.couleur_principale ?? "") ? b.couleur_principale : null;
  const brandColor2 = HEX.test(b.couleur_secondaire ?? "") ? b.couleur_secondaire : null;

  return (
    <div className="gx-mq-fiche">
      <div className="gx-mq-col">
        {props.length > 0 && (
          <section className="gx-mq-sec gx-mq-todo">
            <div className="gx-mq-sech">
              <h2>À valider</h2>
              <small>{props.length} proposition{props.length > 1 ? "s" : ""} de la dernière analyse</small>
              <button type="button" className="gx-btn gx-sm gx-mq-r" onClick={() => void acceptAll()}>Tout accepter</button>
            </div>
            <div className="gx-mq-props">
              {props.map(([k, v]) => (
                <div key={k} className="gx-mq-prop">
                  <div>
                    <div className="gx-mq-pk">{LABELS[k] ?? k}{iaKeys.includes(k) ? <span className="gx-mq-ia">Proposé par l'IA</span> : <span className="gx-mq-ia gx-mq-ia2">Trouvé sur le site</span>}</div>
                    <div className="gx-mq-pv">
                      {COLORS.includes(k) && HEX.test(String(v)) && <span className="gx-mq-dot" style={{ background: String(v) }} />}
                      {k === "logo_url" ? <img src={String(v)} alt="" referrerPolicy="no-referrer" className="gx-mq-plogo" /> : toText(k, v) || "—"}
                    </div>
                  </div>
                  <div className="gx-mq-pacts">
                    <button type="button" className="gx-btn gx-sm gx-pri" onClick={() => void decide(k, true)}>Accepter</button>
                    <button type="button" className="gx-btn gx-sm gx-ghost" onClick={() => void decide(k, false)}>Garder le mien</button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="gx-mq-sec" id="mq-s-identite">
          <div className="gx-mq-sech"><h2>Identité visuelle</h2><small>Logo, couleurs et polices utilisés dans tes créations</small></div>
          <div className="gx-mq-f">
            <span className="gx-mq-lbl">Logo</span>
            <div className="gx-mq-logos">
              {b.logo_display && !candidates.some((c) => c.url === b.logo_url) && (
                <span className="gx-mq-lg" aria-pressed="true"><img src={b.logo_display} alt="Logo actuel" referrerPolicy="no-referrer" /></span>
              )}
              {candidates.map((c) => (
                <button key={c.url} type="button" className="gx-mq-lg" aria-pressed={b.logo_url === c.url} onClick={() => void commit("logo_url", c.url)} aria-label={`Choisir ce logo${c.source ? ` (${c.source})` : ""}`}>
                  <img src={c.url} alt="" referrerPolicy="no-referrer" />
                </button>
              ))}
              <button type="button" className="gx-mq-lgup" onClick={() => fileRef.current?.click()} disabled={uploading}>
                {uploading ? "Envoi…" : <>Importer<br />un logo</>}
              </button>
              <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => void onLogoFile(e.target.files?.[0])} />
            </div>
            <small className="gx-mq-hint">
              {candidates.length ? "Trouvés sur ton site : choisis en un clic." : b.logo_display ? "Image de 2 Mo maximum." : "Aucun logo choisi. Importe-le, ou lance l'analyse : on te proposera ceux trouvés sur ton site."}
            </small>
          </div>
          <div className="gx-mq-f">
            <span className="gx-mq-lbl">Couleurs</span>
            <div className="gx-mq-colors">
              {COLORS.map((k) => <ColorSwatch key={`${k}:${b[k] ?? ""}`} k={k} value={b[k]} deduced={deduced.includes(k)} onSave={(v) => commit(k, v)} />)}
            </div>
          </div>
          <div className="gx-mq-f">
            <span className="gx-mq-lbl">Polices</span>
            <div className="gx-mq-fonts">
              {(["police_titres", "police_texte"] as const).map((k) => (
                <FontField key={`${k}:${b[k] ?? ""}`} k={k} value={b[k]} onSave={(v) => commit(k, v)} />
              ))}
            </div>
          </div>
        </section>

        <section className="gx-mq-sec" id="mq-s-positionnement">
          <div className="gx-mq-sech"><h2>Positionnement</h2><small>Ce que tu vends et comment tu le dis</small></div>
          <div className="gx-mq-grid">
            {F("presentation", { area: 2, full: true })}
            {F("promesse", { area: 2, full: true })}
            {L("ton_3_mots")}
            {F("valeurs", { area: 2, full: true })}
          </div>
        </section>

        <section className="gx-mq-sec" id="mq-s-clients">
          <div className="gx-mq-sech"><h2>Clients</h2><small>À qui parlent tes pubs</small></div>
          <div className="gx-mq-grid">
            {F("client_type", { area: 2, full: true })}
            {L("problemes_client")}
            <Proofs key={`preuves:${JSON.stringify(b.preuves ?? null)}`} value={b.preuves} onSave={(v) => commit("preuves", v)} />
          </div>
        </section>

        <section className="gx-mq-sec" id="mq-s-marche">
          <div className="gx-mq-sech"><h2>Marché et activité</h2></div>
          <div className="gx-mq-grid">
            <div className="gx-mq-f gx-mq-full">
              <span className="gx-mq-lbl" id="mq-act">Type d'activité</span>
              <div className="gx-mq-segf" role="group" aria-labelledby="mq-act">
                {ACTIVITIES.map(([v, l]) => (
                  <button key={v || "none"} type="button" aria-pressed={(b.type_activite ?? "") === v} onClick={() => { if ((b.type_activite ?? "") !== v) void commit("type_activite", v || null); }}>{l}</button>
                ))}
              </div>
            </div>
            {F("secteur")}
            {F("zone_chalandise", { ph: "ex. Bordeaux · 20 km", hint: "Ville et rayon autour desquels tu travailles (seulement pour un service local)." })}
            {L("pays_vente")}
          </div>
        </section>

        <section className="gx-mq-sec" id="mq-s-pub">
          <div className="gx-mq-sech"><h2>Publicité</h2><small>Utilisé par défaut quand tu publies</small></div>
          <div className="gx-mq-grid">
            {F("meta_page_id", { ph: "Identifiant de ta Page" })}
            {F("default_cta_url", { ph: "https://… page où envoyer les clics" })}
          </div>
        </section>

        <section className="gx-mq-sec" id="mq-s-garde">
          <div className="gx-mq-sech"><h2>Garde-fous</h2><small>Ce que Growthity ne doit jamais écrire ni montrer</small></div>
          <div className="gx-mq-grid">
            {L("mots_interdits")}
            {L("promesses_interdites")}
          </div>
        </section>

        <details className="gx-mq-sec gx-mq-adv">
          <summary><div className="gx-mq-sech"><h2>Avancé</h2><small>Style visuel, à ne jamais montrer, titres à éviter{b.plateforme === "prestashop" ? ", clé PrestaShop" : ""}</small></div></summary>
          <div className="gx-mq-grid">
            {F("style_visuel", { area: 2, full: true })}
            {F("a_ne_jamais_montrer", { area: 2, full: true })}
            {L("titres_a_eviter")}
            {b.plateforme === "prestashop" && (
              <div className="gx-mq-f gx-mq-full">
                <label className="gx-mq-lbl" htmlFor="mq-psk">Clé PrestaShop {hasPrestashopKey ? "(enregistrée)" : ""}</label>
                <div className="gx-mq-key">
                  <input className="gx-in" id="mq-psk" type="password" autoComplete="off" value={psInput} onChange={(e) => setPsInput(e.target.value)} placeholder={hasPrestashopKey ? "••••••••" : "Colle la clé du webservice"} />
                  <button type="button" className="gx-btn" onClick={async () => {
                    try { await psKey({ data: { brandId, key: psInput || null } }); const had = Boolean(psInput); setPsInput(""); await refresh(); toast.success(had ? "Clé enregistrée" : "Clé retirée"); }
                    catch (e) { err(e); }
                  }} disabled={!psInput && !hasPrestashopKey}>{psInput ? "Enregistrer" : "Retirer"}</button>
                </div>
                <small className="gx-mq-hint">Stockée chiffrée, jamais réaffichée. Elle permet une mise à jour automatique chaque jour.</small>
              </div>
            )}
          </div>
        </details>
      </div>

      <aside className="gx-mq-aside">
        <div className="gx-mq-card">
          <div className="gx-mq-cardtop" style={{ background: brandColor ? `linear-gradient(120deg, ${brandColor}, ${brandColor2 ?? brandColor})` : undefined }}>
            <span className="gx-mq-cardlogo">{b.logo_display ? <img src={b.logo_display} alt="" referrerPolicy="no-referrer" /> : initials(b.name)}</span>
          </div>
          <div className="gx-mq-cardb">
            <h3 style={{ fontFamily: b.police_titres ? `"${b.police_titres}", var(--gx-display)` : undefined, color: HEX.test(b.couleur_texte ?? "") ? b.couleur_texte : undefined }}>{b.name}</h3>
            {b.promesse ? (
              <q style={{ fontFamily: b.police_texte ? `"${b.police_texte}", var(--gx-ui)` : undefined }}>{b.promesse}</q>
            ) : <small>Ton aperçu de marque se remplira après l'analyse.</small>}
            {COLORS.some((k) => HEX.test(b[k] ?? "")) && (
              <div className="gx-mq-dots">{COLORS.filter((k) => HEX.test(b[k] ?? "")).map((k) => <i key={k} style={{ background: b[k] }} title={LABELS[k]} />)}</div>
            )}
            {toList("ton_3_mots", b.ton_3_mots).length > 0 && (
              <div className="gx-mq-tone">{toList("ton_3_mots", b.ton_3_mots).map((t) => <span key={t}>{t}</span>)}</div>
            )}
            <small>Ce que Growthity utilise dans chaque création.</small>
          </div>
        </div>
        <div className="gx-mq-miss">
          <h4>{miss.length ? `Il manque ${miss.length} information${miss.length > 1 ? "s" : ""}` : "Fiche complète"}</h4>
          {miss.length > 0 && (
            <ul>
              {miss.map((m) => (
                <li key={m}>
                  <a href={`#${missingTarget(m)}`} onClick={(e) => {
                    const el = document.getElementById(missingTarget(m));
                    if (!el) return;
                    e.preventDefault();
                    el.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "center" });
                    if (el instanceof HTMLInputElement) el.focus();
                  }}><i aria-hidden="true" />{cap(m)}<span>Compléter</span></a>
                </li>
              ))}
            </ul>
          )}
          <p>Rien n'est bloquant : tu peux déjà créer.</p>
        </div>
      </aside>
    </div>
  );
}

function Field({ k, value, byAi, area, full, ph, hint, onSave }: {
  k: string; value: unknown; byAi?: boolean; area?: number; full?: boolean; ph?: string; hint?: string; onSave: (v: unknown) => void;
}) {
  const initial = toText(k, value);
  const [t, setT] = useState(initial);
  const id = `f-${k}`;
  const blur = () => { if (t !== initial) onSave(fromText(k, t)); };
  const cls = t.trim() ? "gx-mq-in" : "gx-mq-in gx-mq-empty";
  return (
    <div className={full ? "gx-mq-f gx-mq-full" : "gx-mq-f"}>
      <label className="gx-mq-lbl" htmlFor={id}>{LABELS[k] ?? k}{byAi && <span className="gx-mq-ia">Proposé par l'IA</span>}</label>
      {area ? (
        <textarea id={id} className={cls} rows={area} value={t} onChange={(e) => setT(e.target.value)} onBlur={blur} placeholder={ph ?? "Non trouvé sur le site"} />
      ) : (
        <input id={id} className={cls} value={t} onChange={(e) => setT(e.target.value)} onBlur={blur}
          onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }} placeholder={ph ?? "Non trouvé sur le site"} />
      )}
      {hint && <small className="gx-mq-hint">{hint}</small>}
    </div>
  );
}

/** Liste en étiquettes : Entrée ou virgule pour ajouter, × pour retirer ; enregistré aussitôt. */
function ChipField({ k, value, onSave }: { k: string; value: unknown; onSave: (v: unknown) => void }) {
  const [items, setItems] = useState<string[]>(toList(k, value));
  const [draft, setDraft] = useState("");
  const id = `f-${k}`;
  const bad = BAD_LISTS.has(k);
  const push = (next: string[]) => { setItems(next); onSave(next.length ? next : null); };
  const add = () => {
    const parts = draft.split(",").map((x) => x.trim()).filter(Boolean).filter((x) => !items.includes(x));
    setDraft("");
    if (parts.length) push([...items, ...parts]);
  };
  return (
    <div className="gx-mq-f gx-mq-full">
      <label className="gx-mq-lbl" htmlFor={id}>{LABELS[k] ?? k}</label>
      <div className="gx-mq-chips">
        {items.map((x) => (
          <span key={x} className={bad ? "gx-mq-chip gx-mq-no" : "gx-mq-chip"}>
            {k === "pays_vente" && x.length === 2 ? countryName(x.toUpperCase()) : x}
            <button type="button" aria-label={`Retirer ${x}`} onClick={() => push(items.filter((y) => y !== x))}>×</button>
          </span>
        ))}
        <input id={id} value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={k === "pays_vente" ? "Ajouter un pays (ex. FR)…" : "Ajouter…"}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") { e.preventDefault(); add(); }
            else if (e.key === "Backspace" && !draft && items.length) push(items.slice(0, -1));
          }}
          onBlur={add} />
      </div>
    </div>
  );
}

/** Preuves : une par ligne, modifiables, avec « Ajouter une preuve ». */
function Proofs({ value, onSave }: { value: unknown; onSave: (v: unknown) => void }) {
  const initial = toList("preuves", value);
  const [items, setItems] = useState<string[]>(initial.length ? initial : []);
  const commit = (next: string[]) => {
    const clean = next.map((x) => x.trim()).filter(Boolean);
    if (JSON.stringify(clean) !== JSON.stringify(initial)) onSave(clean.length ? clean : null);
  };
  return (
    <div className="gx-mq-f gx-mq-full">
      <span className="gx-mq-lbl">{LABELS.preuves}</span>
      {items.length > 0 ? (
        <ul className="gx-mq-proofs">
          {items.map((x, i) => (
            <li key={i}>
              <input value={x} aria-label={`Preuve ${i + 1}`} onChange={(e) => setItems(items.map((y, j) => (j === i ? e.target.value : y)))} onBlur={() => commit(items)} placeholder="Un avis client, un label, un chiffre…" />
              <button type="button" aria-label="Retirer cette preuve" onClick={() => { const next = items.filter((_, j) => j !== i); setItems(next); commit(next); }}>×</button>
            </li>
          ))}
        </ul>
      ) : <small className="gx-mq-hint">Aucune preuve pour l'instant : un avis client, un label ou un chiffre rendent tes pubs plus crédibles.</small>}
      <button type="button" className="gx-btn gx-sm gx-ghost gx-mq-add" onClick={() => setItems([...items, ""])}>＋ Ajouter une preuve</button>
    </div>
  );
}

function ColorSwatch({ k, value, deduced, onSave }: { k: string; value: unknown; deduced: boolean; onSave: (v: string) => void }) {
  const valid = HEX.test(String(value ?? ""));
  const [c, setC] = useState<string>(valid ? String(value) : "");
  const t = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(t.current), []);
  const change = (v: string) => {
    setC(v);
    window.clearTimeout(t.current);
    t.current = window.setTimeout(() => onSave(v), 500); // pas un enregistrement par mouvement du curseur
  };
  return (
    <div className="gx-mq-sw">
      <div className={c ? "gx-mq-c" : "gx-mq-c gx-mq-cnone"} style={c ? { background: c } : undefined}>
        <input type="color" value={c || "#888888"} onChange={(e) => change(e.target.value)} aria-label={`${LABELS[k]}${c ? "" : " (à choisir)"}`} />
      </div>
      <div className="gx-mq-swt">
        <b>{LABELS[k]}</b>
        <small>{c ? c.toUpperCase() : "non trouvée"}</small>
        {c && deduced && <span>déduite</span>}
      </div>
    </div>
  );
}

function FontField({ k, value, onSave }: { k: "police_titres" | "police_texte"; value: unknown; onSave: (v: unknown) => void }) {
  const initial = value ? String(value) : "";
  const [t, setT] = useState(initial);
  return (
    <div className="gx-mq-fo">
      <span className="gx-mq-aa" style={{ fontFamily: t ? `"${t}", ${k === "police_titres" ? "Georgia, serif" : "sans-serif"}` : undefined }} aria-hidden="true">Aa</span>
      <div>
        <label htmlFor={`f-${k}`}>{LABELS[k]}</label>
        <input id={`f-${k}`} value={t} onChange={(e) => setT(e.target.value)} placeholder="Non trouvée"
          onBlur={() => { if (t.trim() !== initial) onSave(t.trim() || null); }}
          onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }} />
      </div>
    </div>
  );
}

/* ---------- Produits ---------- */

type Filter = "all" | "promo" | "ret";

function Produits({ brandId, running, onCatalogue }: { brandId: string; running: boolean; onCatalogue: () => void }) {
  const qc = useQueryClient();
  const listFn = useServerFn(listBrandProducts);
  const promote = useServerFn(setProductPromote);
  const del = useServerFn(deleteBrandProduct);
  const add = useServerFn(addProductByUrl);
  const navigate = useNavigate();
  const q = useQuery({ queryKey: ["brand-products", brandId], queryFn: () => listFn({ data: { brandId } }), staleTime: 10_000 });
  const [url, setUrl] = useState("");
  const [adding, setAdding] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const all = ((q.data ?? []) as any[]);
  const shown = useMemo(() => all.filter((p) =>
    (filter === "all" || (filter === "promo" && p.a_promouvoir) || (filter === "ret" && p.retire_at))
    && (!search || p.name?.toLowerCase().includes(search.toLowerCase()))), [all, filter, search]);
  const refresh = () => qc.invalidateQueries({ queryKey: ["brand-products", brandId] });

  const doAdd = async () => {
    if (!url.trim() || adding) return; setAdding(true);
    try {
      const r: any = await add({ data: { brandId, url: /^https?:\/\//i.test(url.trim()) ? url.trim() : `https://${url.trim()}` } });
      if (r.status === "unreadable") toast.error("Je n'arrive pas à lire cette page produit.");
      else toast.success(r.status === "known" ? "Ce produit est déjà enregistré." : "Produit ajouté");
      setUrl(""); await refresh();
      await qc.invalidateQueries({ queryKey: ["brand-space", brandId] });
    } catch (e) { err(e); } finally { setAdding(false); }
  };
  const toggle = async (p: any) => {
    try { await promote({ data: { productId: p.id, value: !p.a_promouvoir } }); await refresh(); toast.success(!p.a_promouvoir ? "Produit à promouvoir" : "Retiré des produits à promouvoir"); }
    catch (e) { err(e); }
  };
  const remove = async (p: any) => {
    try { await del({ data: { productId: p.id } }); setConfirmId(null); await refresh(); await qc.invalidateQueries({ queryKey: ["brand-space", brandId] }); toast.success("Produit supprimé"); }
    catch (e) { err(e); }
  };

  const addBar = (
    <div className="gx-mq-addrow">
      <label className="gx-mq-addin">
        <Svg d={IC.link} />
        <input value={url} onChange={(e) => setUrl(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") void doAdd(); }} placeholder="Ajouter un produit par son lien…" aria-label="Lien du produit" />
      </label>
      <button type="button" className="gx-btn gx-pri gx-mq-h40" onClick={() => void doAdd()} disabled={adding || !url.trim()}>{adding ? "Lecture…" : "Ajouter"}</button>
    </div>
  );

  if (q.isLoading) return <div className="gx-box gx-empty"><b>Chargement des produits…</b></div>;

  if (!all.length) {
    return (
      <div className="gx-mq-emptys">
        <span className="gx-mq-ei"><Svg d={IC.bag} /></span>
        <h3>Aucun produit pour l'instant</h3>
        <p>Lance <button type="button" className="gx-mq-inl" onClick={() => void navigate({ to: "/ma-marque", search: { tab: "fiche" } })}>« Analyser mon site »</button> : Growthity lit tout ton catalogue. Ou colle ci-dessous le lien d'un produit.</p>
        <div className="gx-mq-emptyadd">{addBar}</div>
      </div>
    );
  }

  const nPromo = all.filter((p) => p.a_promouvoir).length;
  const nRet = all.filter((p) => p.retire_at).length;

  return (
    <div className="gx-mq-col">
      <div className="gx-mq-ptool">
        <div className="gx-mq-addrow">
          {addBar}
          <button type="button" className="gx-btn gx-mq-h40" disabled={running} onClick={onCatalogue}>
            <Svg d={IC.reload} />{running ? "Lecture en cours…" : "Relire tout le catalogue"}
          </button>
        </div>
        <div className="gx-mq-prow">
          <div className="gx-mq-segf" role="group" aria-label="Filtrer les produits">
            {([["all", `Tous (${all.length})`], ["promo", `À promouvoir (${nPromo})`], ["ret", `Retirés du site (${nRet})`]] as [Filter, string][]).map(([k, l]) => (
              <button key={k} type="button" aria-pressed={filter === k} onClick={() => setFilter(k)}>{l}</button>
            ))}
          </div>
          <span className="gx-sp" />
          <label className="gx-mq-srch">
            <Svg d={IC.search} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher un produit" aria-label="Rechercher un produit" />
          </label>
        </div>
      </div>

      {!shown.length ? (
        <div className="gx-mq-emptys"><h3>Aucun produit ne correspond</h3><p>Change le filtre ou la recherche.</p></div>
      ) : (
        <div className="gx-mq-pgrid">
          {shown.map((p) => {
            const off = p.prix_barre && p.prix && p.prix_barre > p.prix ? Math.round((1 - p.prix / p.prix_barre) * 100) : 0;
            const n = p.images?.length ?? 0;
            const locs: any[] = Array.isArray(p.locales) ? p.locales : [];
            return (
              <article key={p.id} className={p.retire_at ? "gx-mq-pc gx-mq-ret" : "gx-mq-pc"}>
                <div className="gx-mq-pimg">
                  {p.images?.[0] ? <img src={p.images[0]} alt="" referrerPolicy="no-referrer" loading="lazy" /> : <span className="gx-mq-noimg"><Svg d={IC.bag} /></span>}
                  <div className="gx-mq-ptags">
                    {off > 0 && <span className="gx-mq-promo">−{off} %</span>}
                    {p.retire_at && <span className="gx-mq-retb">Retiré du site</span>}
                  </div>
                  <button type="button" className="gx-mq-star" aria-pressed={!!p.a_promouvoir} onClick={() => void toggle(p)}
                    title={p.a_promouvoir ? "Ne plus promouvoir" : "À promouvoir"} aria-label={`À promouvoir : ${p.name}`}>
                    <Svg d={IC.star} />
                  </button>
                  {n > 0 && <span className="gx-mq-nph">{n} photo{n > 1 ? "s" : ""}</span>}
                </div>
                <div className="gx-mq-pb">
                  <b title={p.name}>{p.name}</b>
                  <div className="gx-mq-price">
                    {p.prix != null ? <><strong>{money(p.prix, p.devise)}</strong>{off > 0 && <s>{money(p.prix_barre, p.devise)}</s>}</> : <span className="gx-mq-none">Prix non trouvé</span>}
                  </div>
                  <div className="gx-mq-pmeta">
                    <span className="gx-mq-cp" title={`Fiche produit complète à ${p.completude ?? 0} %`}><i><b style={{ width: `${p.completude ?? 0}%` }} /></i>{p.completude ?? 0} %</span>
                    {locs.length > 0 && <span>· {locs.length} version{locs.length > 1 ? "s" : ""} pays</span>}
                  </div>
                  {locs.length > 0 && (
                    <div className="gx-mq-flags" title={locs.map((l) => `${l.langue}-${l.pays} ${money(l.prix, l.devise) ?? ""}`).join("\n")}>
                      {locs.map((l) => `${countryName(String(l.pays).toUpperCase())} (${String(l.langue).toUpperCase()})`).join(" · ")}
                    </div>
                  )}
                </div>
                <div className="gx-mq-pf">
                  {confirmId === p.id ? (
                    <>
                      <span className="gx-mq-ask">Supprimer de ta marque ?</span>
                      <span className="gx-sp" />
                      <button type="button" className="gx-btn gx-sm gx-ghost" onClick={() => setConfirmId(null)}>Annuler</button>
                      <button type="button" className="gx-btn gx-sm gx-mq-del" onClick={() => void remove(p)}>Supprimer</button>
                    </>
                  ) : (
                    <>
                      {p.product_url ? <a href={p.product_url} target="_blank" rel="noopener noreferrer"><Svg d={IC.out} />Voir sur le site</a> : <span className="gx-mq-ask">Pas de lien produit</span>}
                      <span className="gx-sp" />
                      <button type="button" className="gx-mq-dellnk" onClick={() => setConfirmId(p.id)} aria-label={`Supprimer ${p.name}`}>Supprimer</button>
                    </>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ---------- Concurrents ---------- */

function Concurrents() {
  return (
    <div className="gx-mq-soonc">
      <div>
        <span className="gx-mq-ia">Bientôt</span>
        <h3>Growthity te proposera tes vrais concurrents</h3>
        <p>Ceux qui diffusent des pubs sur ton marché, pour t'inspirer de ce qui marche.</p>
      </div>
      <div className="gx-mq-ghosts" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <div key={i} className="gx-mq-ghost"><i /><div><span /><span /></div><em>pubs actives</em></div>
        ))}
      </div>
    </div>
  );
}

