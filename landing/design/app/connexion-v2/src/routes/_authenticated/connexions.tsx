import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { getMetaCredentials, deleteMetaCredentials, listMetaPages, listMetaPixels, getMetaReadiness } from "@/lib/meta.functions";
import { startMetaOAuth, listMetaAdAccounts, setActiveMetaAdAccounts } from "@/lib/meta-oauth.functions";
import {
  getShopifyCredentials, startShopifyOAuth, deleteShopifyCredentials, listShopifyProducts,
} from "@/lib/shopify.functions";
import { ShopifyIcon } from "@/components/BrandIcons";
import { GuideMetaPanel } from "@/components/connexion/GuideMetaPanel";
import { SHOW_SHOPIFY } from "@/lib/features";
import { GxSheetContent, GxSheetClose } from "@/components/ui/gx-controls";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/*
 * Connexion : copie exacte de la maquette validée (landing/design/connexion/connexion.html),
 * styles dans src/styles/gx-connexion.css (tout est sous .gx-cx).
 * Une carte Meta maîtresse : à gauche l'action, à droite ce que Growthity pourra faire (ou « Prêt à publier »
 * une fois connecté) ; le guide est le second chemin, bien visible pour qui n'a pas encore de compte.
 * La logique Meta (popup OAuth, comptes actifs, compte par défaut, déconnexion) et Shopify est celle d'avant.
 */

export const Route = createFileRoute("/_authenticated/connexions")({
  head: () => ({
    meta: [
      { title: "Connexions publicitaires - growthity.ai" },
      {
        name: "description",
        content:
          "Connecte ton compte Meta Ads à Growthity pour publier tes créations en publicités.",
      },
      { property: "og:title", content: "Connexions publicitaires - growthity.ai" },
      {
        property: "og:description",
        content: "Gère la connexion de ton compte Meta Ads depuis Growthity.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ConnexionsPage,
});

/* ---------- petites aides ---------- */

function Ico({ d, className = "gx-i" }: { d: string; className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}
const IC_RELOAD = "M21 12a9 9 0 1 1-3-6.7L21 8M21 3v5h-5";
const IC_BELL = "M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.9 1.9 0 0 0 3.4 0";
const IC_MORE = "M5 12h.01M12 12h.01M19 12h.01";
const IC_SEND = "M22 2 11 13M22 2l-7 20-4-9-9-4z";
const IC_CHART = "M3 3v18h18M7 15l4-4 3 3 5-6";
const IC_USERS = "M9 4.5a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M18 14.5a6.5 6.5 0 0 1 3.5 5.5";
const IC_CHECK = "m5 12 5 5 9-10";
const IC_LOCK = "M6 11h12a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2zM8 11V7a4 4 0 0 1 8 0v4";
const IC_DASH = "M5 12h14";
const IC_ALERT = "M12 8v5M12 16.5h.01";

/** Logo Meta officiel (même tracé que MetaIcon), avec son dégradé bleu. */
function MetaLogo() {
  return (
    <svg viewBox="0 0 24 24" role="img" aria-label="Meta">
      <defs>
        <linearGradient id="gx-cx-meta" x1="0" y1="12" x2="24" y2="12" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#0064E1" /><stop offset=".55" stopColor="#0073EE" /><stop offset="1" stopColor="#0082FB" />
        </linearGradient>
      </defs>
      <path fill="url(#gx-cx-meta)" d="M6.915 4.03c-1.968 0-3.683 1.28-4.871 3.113C.704 9.208 0 11.883 0 14.449c0 .706.07 1.369.21 1.973a6.624 6.624 0 0 0 .265.86 5.297 5.297 0 0 0 .371.761c.696 1.159 1.818 1.927 3.593 1.927 1.497 0 2.633-.671 3.965-2.444.76-1.012 1.144-1.626 2.663-4.32l.756-1.339.186-.325c.061.1.121.196.183.3l2.152 3.595c.724 1.21 1.665 2.556 2.47 3.314 1.046.987 1.992 1.22 3.06 1.22 1.075 0 1.876-.355 2.455-.843a3.743 3.743 0 0 0 .81-.973c.542-.939.861-2.127.861-3.745 0-2.72-.681-5.357-2.084-7.45-1.282-1.912-2.957-2.93-4.716-2.93-1.047 0-2.088.467-3.053 1.308-.652.57-1.257 1.29-1.82 2.05-.69-.875-1.335-1.547-1.958-2.056-1.182-.966-2.315-1.303-3.454-1.303zm10.16 2.053c1.147 0 2.188.758 2.992 1.999 1.132 1.748 1.647 4.195 1.647 6.4 0 1.548-.368 2.9-1.839 2.9-.58 0-1.027-.23-1.664-1.004-.496-.601-1.343-1.878-2.832-4.358l-.617-1.028a44.908 44.908 0 0 0-1.255-1.98c.07-.109.141-.224.211-.327 1.12-1.667 2.118-2.602 3.358-2.602zm-10.201.553c1.265 0 2.058.791 2.675 1.446.307.327.737.871 1.234 1.579l-1.02 1.566c-.757 1.163-1.882 3.017-2.837 4.338-1.191 1.649-1.81 1.817-2.486 1.817-.524 0-1.038-.237-1.383-.794-.263-.426-.464-1.13-.464-2.046 0-2.221.63-4.535 1.66-6.088.454-.687.964-1.226 1.533-1.533a2.264 2.264 0 0 1 1.088-.285z" />
    </svg>
  );
}

/** « f » blanc de Facebook pour le bouton de connexion. */
function FacebookF() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="12" fill="#fff" />
      <path fill="#1877F2" d="M13.4 21.9v-7h2.4l.4-2.8h-2.8v-1.8c0-.8.2-1.4 1.4-1.4h1.5V6.4a20 20 0 0 0-2.2-.1c-2.2 0-3.7 1.3-3.7 3.8v2.1H8v2.8h2.4v7z" />
    </svg>
  );
}

function waitForOAuth(popup: Window, ok: string, ko: string, refused: string) {
  return new Promise<void>((resolve, reject) => {
    let poll: number | undefined;
    const cleanup = () => {
      window.removeEventListener("message", onMessage);
      if (poll !== undefined) window.clearInterval(poll);
    };
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      const type = event.data?.type;
      if (type !== ok && type !== ko) return;
      cleanup();
      if (type === ok) resolve();
      else reject(new Error(event.data?.error || refused));
    };
    window.addEventListener("message", onMessage);
    poll = window.setInterval(() => {
      if (!popup.closed) return;
      cleanup();
      reject(new Error("Fenêtre fermée avant la fin de la connexion."));
    }, 500);
  });
}

function frDate(iso?: string | null) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(+d)) return null;
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "long" });
}

/** Réponse de getMetaReadiness (compte publicitaire par défaut). */
type Readiness = {
  business: { id: string; name: string } | null;
  payment: { ok: boolean; label: string | null };
} | null;

type RowState = "ok" | "todo" | "opt" | "wait";
function ReadyRow({ state, title, children }: { state: RowState; title: string; children: ReactNode }) {
  const icon = state === "ok" ? IC_CHECK : state === "todo" ? IC_ALERT : IC_DASH;
  return (
    <li className={`gx-cx-r gx-cx-r-${state}`}>
      <i aria-hidden="true">{state === "wait" ? <span className="gx-cx-dot" /> : <Ico d={icon} className="gx-cx-ic" />}</i>
      <div><b>{title}</b><small>{children}</small></div>
    </li>
  );
}

/* ---------- page ---------- */

function ConnexionsPage() {
  const qc = useQueryClient();

  /* Meta */
  const getCreds = useServerFn(getMetaCredentials);
  const delMeta = useServerFn(deleteMetaCredentials);
  const startMeta = useServerFn(startMetaOAuth);
  const listAccounts = useServerFn(listMetaAdAccounts);
  const saveActive = useServerFn(setActiveMetaAdAccounts);
  const fetchPages = useServerFn(listMetaPages);
  const fetchPixels = useServerFn(listMetaPixels);
  const fetchReadiness = useServerFn(getMetaReadiness);

  const creds = useQuery({ queryKey: ["meta-credentials"], queryFn: () => getCreds() });
  const cd: any = creds.data;
  const connected = cd?.connected === true;
  const expiry: string = connected ? String(cd?.expiry_status ?? (cd?.expired ? "expired" : "connected")) : "none";
  const expired = connected && (cd?.expired === true || expiry === "expired");

  const accounts = useQuery({
    queryKey: ["meta-adaccounts"],
    queryFn: () => listAccounts(),
    enabled: connected,
  });
  const allAccounts: any[] = (accounts.data as any[]) ?? [];
  const activeAccounts = (connected ? (cd?.active_accounts ?? []) : []) as Array<{ id: string; name: string }>;
  const activeIds = activeAccounts.map((a) => a.id);
  const defaultId: string | null = connected ? (cd?.default_ad_account_id ?? null) : null;

  // « Prêt à publier » : uniquement des données réelles, chargées une fois connecté (et session valide).
  const live = connected && !expired;
  const pages = useQuery({ queryKey: ["meta-pages"], queryFn: () => fetchPages(), enabled: live, staleTime: 5 * 60_000 });
  const pixels = useQuery({ queryKey: ["meta-pixels"], queryFn: () => fetchPixels(), enabled: live && Boolean(defaultId), staleTime: 5 * 60_000 });
  const readiness = useQuery({
    queryKey: ["meta-readiness", defaultId],
    queryFn: () => fetchReadiness(),
    enabled: live && Boolean(defaultId),
    staleTime: 5 * 60_000,
    retry: false,
  });

  const [metaBusy, setMetaBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editAccounts, setEditAccounts] = useState(false);
  const [confirmMeta, setConfirmMeta] = useState(false);

  const refreshMeta = () =>
    Promise.all([
      qc.invalidateQueries({ queryKey: ["meta-credentials"] }),
      qc.invalidateQueries({ queryKey: ["meta-adaccounts"] }),
      qc.invalidateQueries({ queryKey: ["meta-pages"] }),
      qc.invalidateQueries({ queryKey: ["meta-pixels"] }),
      qc.invalidateQueries({ queryKey: ["meta-readiness"] }),
      qc.invalidateQueries({ queryKey: ["meta-leadforms"] }),
      qc.invalidateQueries({ queryKey: ["meta-campaigns-insights"] }),
      qc.invalidateQueries({ queryKey: ["meta-performance"] }),
      qc.invalidateQueries({ queryKey: ["meta-top-ads"] }),
      qc.invalidateQueries({ queryKey: ["media-buyer-summary"] }),
    ]);

  const connectMeta = async () => {
    const popup = window.open("", "meta-oauth", "width=680,height=760");
    if (!popup) { toast.error("Fenêtre bloquée : autorise les fenêtres pop-up puis réessaie."); return; }
    setMetaBusy(true);
    try {
      const { authorizationUrl } = await startMeta();
      const completion = waitForOAuth(popup, "metaOAuthComplete", "metaOAuthFailed", "Connexion Meta refusée.");
      popup.location.href = authorizationUrl;
      await completion;
      await refreshMeta();
      toast.success("Compte Meta connecté ✓");
    } catch (e) {
      popup.close();
      toast.error(e instanceof Error ? e.message : "Échec de la connexion Meta");
    } finally {
      setMetaBusy(false);
    }
  };

  /** Enregistre la sélection de comptes actifs (+ compte par défaut). */
  const persist = async (ids: string[], nextDefault: string | null) => {
    if (!ids.length) { toast.error("Garde au moins un compte publicitaire actif."); return; }
    setSaving(true);
    try {
      await saveActive({
        data: {
          accounts: ids.map((id) => ({
            id,
            name: allAccounts.find((a) => a.id === id)?.name ?? activeAccounts.find((a) => a.id === id)?.name ?? id,
          })),
          default_ad_account_id: (nextDefault && ids.includes(nextDefault) ? nextDefault : ids[0]) ?? undefined,
        },
      });
      await refreshMeta();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Échec de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };
  const toggleAccount = (id: string, on: boolean) => {
    const next = on ? [...new Set([...activeIds, id])] : activeIds.filter((x) => x !== id);
    if (!next.length) { toast.error("Au moins un compte doit rester actif."); return; }
    void persist(next, defaultId);
  };
  const setDefault = (id: string) => {
    if (id === defaultId) return;
    const next = activeIds.includes(id) ? activeIds : [...activeIds, id];
    void persist(next, id);
  };
  const disconnectMeta = async () => {
    try {
      await delMeta();
      await refreshMeta();
      setConfirmMeta(false);
      setEditAccounts(false);
      toast.success("Compte Meta déconnecté");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Échec de la déconnexion");
    }
  };

  /* Shopify (masqué tant que SHOW_SHOPIFY vaut false) */
  const getShopify = useServerFn(getShopifyCredentials);
  const startShop = useServerFn(startShopifyOAuth);
  const delShop = useServerFn(deleteShopifyCredentials);
  const listProducts = useServerFn(listShopifyProducts);

  const shop = useQuery({ queryKey: ["shopify-credentials"], queryFn: () => getShopify(), enabled: SHOW_SHOPIFY });
  const shopInfo: any = (shop.data as any)?.connected ? shop.data : null;
  const shopConnected = shopInfo !== null;
  const products = useQuery({
    queryKey: ["shopify-products-count"],
    queryFn: () => listProducts({ data: { limit: 100 } }),
    enabled: SHOW_SHOPIFY && shopConnected,
    staleTime: 5 * 60_000,
    refetchOnWindowFocus: false,
  });
  const productCount = ((products.data as any)?.products as any[] | undefined)?.length;

  const [shopSheet, setShopSheet] = useState(false);
  const [shopDomain, setShopDomain] = useState("");
  const [shopBusy, setShopBusy] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [confirmShop, setConfirmShop] = useState(false);

  const openShopSheet = (prefill = "") => { setShopDomain(prefill); setShopSheet(true); };

  const connectShop = async () => {
    if (shopBusy) return;
    if (!shopDomain.trim()) { toast.error("Indique le domaine de ta boutique."); return; }
    setShopBusy(true);
    const popup = window.open("about:blank", "shopify-oauth", "width=620,height=760");
    try {
      const { authorizationUrl } = await startShop({ data: { shop: shopDomain } });
      if (!popup) throw new Error("Autorise les fenêtres pop-up pour connecter Shopify.");
      popup.location.href = authorizationUrl;
      await waitForOAuth(popup, "shopifyOAuthComplete", "shopifyOAuthFailed", "Connexion Shopify refusée.");
      await qc.invalidateQueries({ queryKey: ["shopify-credentials"] });
      await qc.invalidateQueries({ queryKey: ["catalog-picker", "shopify-products"] });
      await qc.invalidateQueries({ queryKey: ["shopify-products-count"] });
      toast.success("Boutique Shopify connectée.");
      setShopSheet(false);
    } catch (e) {
      popup?.close();
      toast.error(e instanceof Error ? e.message : "Échec de la connexion Shopify.");
    } finally {
      setShopBusy(false);
    }
  };

  const syncShop = async () => {
    setSyncing(true);
    try {
      await qc.invalidateQueries({ queryKey: ["catalog-picker", "shopify-products"] });
      const res: any = await products.refetch();
      const err = res?.data?.error as string | undefined;
      if (err) throw new Error(err);
      const n = (res?.data?.products as any[] | undefined)?.length ?? 0;
      toast.success(`${n >= 100 ? "100+" : n} produit${n > 1 ? "s" : ""} synchronisé${n > 1 ? "s" : ""}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Impossible de charger les produits Shopify.");
    } finally {
      setSyncing(false);
    }
  };

  const disconnectShop = async () => {
    try {
      await delShop();
      await qc.invalidateQueries({ queryKey: ["shopify-credentials"] });
      await qc.invalidateQueries({ queryKey: ["catalog-picker", "shopify-products"] });
      qc.removeQueries({ queryKey: ["shopify-products-count"] });
      setConfirmShop(false);
      toast.success("Boutique déconnectée.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Échec de la déconnexion.");
    }
  };

  /* ---------- rendu ---------- */

  const expiresOn = frDate(cd?.expires_at);
  const inactiveAccounts = allAccounts.filter((a) => !activeIds.includes(a.id));
  const noAdAccount = connected && !expired && accounts.isSuccess && allAccounts.length === 0;
  const defaultAccount = activeAccounts.find((a) => a.id === defaultId) ?? activeAccounts[0];
  const defaultLive = allAccounts.find((a) => a.id === defaultAccount?.id);
  const rd = readiness.data as Readiness | undefined;
  const pageList = (pages.data as Array<{ id: string; name: string }> | undefined) ?? [];
  const pixelList = (pixels.data as Array<{ id: string; name: string }> | undefined) ?? [];
  const billingUrl = defaultAccount
    ? `https://business.facebook.com/billing_hub/payment_settings/?asset_id=${defaultAccount.id.replace(/^act_/, "")}`
    : "https://business.facebook.com/billing_hub/payment_settings";

  const status = creds.isLoading ? (
    <span className="gx-cx-st">Vérification…</span>
  ) : expired ? (
    <span className="gx-cx-st gx-bad">Session expirée</span>
  ) : connected ? (
    <span className="gx-cx-st gx-on">Connecté</span>
  ) : (
    <span className="gx-cx-st">Non connecté</span>
  );

  return (
    <div className="gx-page gx-cx">
      <header className="gx-ph">
        <div>
          <h1>Connexion</h1>
          <p>Relie ton compte Meta : Growthity pourra publier tes pubs et suivre leurs résultats.</p>
        </div>
        <div className="gx-pa" />
      </header>

      <section className="gx-cx-card" aria-live="polite">
        <div className="gx-cx-main">
          <div className="gx-cx-act">
            <div className="gx-cx-brand">
              <span className="gx-cx-mlogo"><MetaLogo /></span>
              <div><b>Meta Ads</b><small>Facebook et Instagram</small></div>
              {status}
            </div>

            {creds.isLoading ? (
              <p className="gx-hint">Vérification de ta connexion Meta…</p>
            ) : !connected || expired ? (
              <>
                <h2>{expired ? "Ta connexion Meta a expiré. Reconnecte-la." : "Tu as déjà un compte publicitaire ? Connecte-le."}</h2>
                <p className="gx-cx-lead">
                  {expired
                    ? "Tant que tu ne te reconnectes pas, Growthity ne peut plus publier ni synchroniser tes leads."
                    : "Une seule connexion, et Growthity publie tes pubs sur Facebook et Instagram."}
                </p>
                <button type="button" className="gx-cx-fb" onClick={() => void connectMeta()} disabled={metaBusy}>
                  <FacebookF />
                  {metaBusy ? "Connexion…" : "Continuer avec Facebook"}
                </button>
                {!expired && (
                  <p className="gx-cx-or">Pas encore de compte publicitaire ? <a href="#sans-compte">Commence par le guide ↓</a></p>
                )}
                <div className="gx-cx-trust">
                  <span><Ico d={IC_LOCK} className="gx-cx-ic" />Connexion sécurisée par Meta</span>
                  <span><Ico d={IC_CHECK} className="gx-cx-ic" />Tu choisis les comptes à relier</span>
                  <span><Ico d={IC_CHECK} className="gx-cx-ic" />Accès retirable à tout moment</span>
                </div>
                {expired && (
                  <div className="gx-row">
                    <span className="gx-sp" />
                    <button type="button" className="gx-btn gx-sm gx-ghost" onClick={() => setConfirmMeta(true)}>Déconnecter</button>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="gx-cx-lh">
                  <p className="gx-lbl">Comptes publicitaires actifs ({activeAccounts.length})</p>
                  {saving && <span className="gx-hint">Enregistrement…</span>}
                </div>

                {activeAccounts.length === 0 ? (
                  <p className="gx-hint">Aucun compte activé pour l'instant.</p>
                ) : (
                  <div className="gx-cx-accs">
                    {activeAccounts.map((a) => {
                      const acc = allAccounts.find((x) => x.id === a.id);
                      const isDefault = a.id === defaultId;
                      return (
                        <label key={a.id} className="gx-cx-acc">
                          {editAccounts ? (
                            <input type="checkbox" checked disabled={saving} onChange={() => toggleAccount(a.id, false)} aria-label={`Désactiver ${acc?.name ?? a.name}`} />
                          ) : (
                            <input type="radio" name="defacc" checked={isDefault} disabled={saving} onChange={() => setDefault(a.id)} aria-label={`Compte par défaut : ${acc?.name ?? a.name}`} />
                          )}
                          <div><b>{acc?.name ?? a.name}</b><small>{a.id}{acc?.currency ? ` · ${acc.currency}` : ""}</small></div>
                          {isDefault ? <span className="gx-cx-def" title="Compte utilisé pour publier depuis le Chat">Par défaut</span> : <span />}
                        </label>
                      );
                    })}
                  </div>
                )}

                {editAccounts && (
                  accounts.isLoading ? (
                    <p className="gx-hint">Chargement des comptes…</p>
                  ) : inactiveAccounts.length > 0 ? (
                    <>
                      <p className="gx-lbl">Autres comptes disponibles ({inactiveAccounts.length})</p>
                      <div className="gx-cx-accs">
                        {inactiveAccounts.map((a) => (
                          <label key={a.id} className="gx-cx-acc">
                            <input type="checkbox" checked={false} disabled={saving} onChange={() => toggleAccount(a.id, true)} aria-label={`Activer ${a.name}`} />
                            <div><b>{a.name}</b><small>{a.id}{a.currency ? ` · ${a.currency}` : ""}</small></div>
                            <span />
                          </label>
                        ))}
                      </div>
                    </>
                  ) : (
                    <p className="gx-hint">Tous les comptes de ton profil Facebook sont déjà actifs.</p>
                  )
                )}

                {expiry === "expiring_soon" ? (
                  <div className="gx-cx-note" role="status">
                    <Ico d={IC_BELL} className="gx-cx-ic" />
                    <span>Ta connexion Meta expire{expiresOn ? ` le ${expiresOn}` : " bientôt"}. Reconnecte-la pour ne pas interrompre tes pubs.</span>
                  </div>
                ) : (
                  <p className="gx-hint gx-cx-m0">
                    Le compte par défaut est celui qu'utilise le Chat pour publier.
                    {expiresOn ? ` Connexion valable jusqu'au ${expiresOn} : on te prévient 14 jours avant.` : ""}
                  </p>
                )}

                <div className="gx-row">
                  {allAccounts.length > 0 && (
                    <button type="button" className="gx-btn gx-sm" onClick={() => setEditAccounts((v) => !v)} aria-expanded={editAccounts}>
                      {editAccounts ? "Terminé" : "Gérer les comptes"}
                    </button>
                  )}
                  <button type="button" className={metaBusy ? "gx-btn gx-sm gx-spin-i" : "gx-btn gx-sm"} onClick={() => void connectMeta()} disabled={metaBusy}>
                    <Ico d={IC_RELOAD} />{metaBusy ? "Connexion…" : "Reconnecter"}
                  </button>
                  <span className="gx-sp" />
                  <button type="button" className="gx-btn gx-sm gx-ghost" onClick={() => setConfirmMeta(true)}>Déconnecter</button>
                </div>
              </>
            )}
          </div>

          {live && !noAdAccount ? (
            <div className="gx-cx-side">
              <p className="gx-lbl">Prêt à publier</p>
              <ul className="gx-cx-list">
                {readiness.isLoading ? (
                  <ReadyRow state="wait" title="Portefeuille business">Vérification…</ReadyRow>
                ) : rd?.business ? (
                  <ReadyRow state="ok" title="Portefeuille business">{rd.business.name}</ReadyRow>
                ) : readiness.isSuccess ? (
                  <ReadyRow state="opt" title="Portefeuille business">
                    Compte publicitaire personnel · <Link to="/guide-meta">en créer un avec le guide</Link>
                  </ReadyRow>
                ) : null}

                {pages.isLoading ? (
                  <ReadyRow state="wait" title="Page Facebook">Vérification…</ReadyRow>
                ) : pageList.length > 0 ? (
                  <ReadyRow state="ok" title={pageList.length > 1 ? `Pages Facebook (${pageList.length})` : "Page Facebook"}>
                    {pageList.slice(0, 2).map((p) => p.name).join(" · ")}{pageList.length > 2 ? "…" : ""}
                  </ReadyRow>
                ) : pages.isSuccess ? (
                  <ReadyRow state="todo" title="Page Facebook">
                    Aucune Page : obligatoire pour publier · <Link to="/guide-meta">la créer avec le guide</Link>
                  </ReadyRow>
                ) : null}

                {defaultAccount && (
                  <ReadyRow state="ok" title="Compte publicitaire">
                    {defaultLive?.name ?? defaultAccount.name}{defaultLive?.currency ? ` · ${defaultLive.currency}` : ""}
                  </ReadyRow>
                )}

                {readiness.isLoading ? (
                  <ReadyRow state="wait" title="Moyen de paiement">Vérification…</ReadyRow>
                ) : rd?.payment?.ok ? (
                  <ReadyRow state="ok" title="Moyen de paiement">{rd.payment.label ?? "Ajouté"}</ReadyRow>
                ) : readiness.isSuccess && rd ? (
                  <ReadyRow state="todo" title="Moyen de paiement">
                    À ajouter pour diffuser tes pubs · <a href={billingUrl} target="_blank" rel="noopener noreferrer">l'ajouter chez Meta ↗</a>
                  </ReadyRow>
                ) : null}

                {pixels.isLoading ? (
                  <ReadyRow state="wait" title="Pixel">Vérification…</ReadyRow>
                ) : pixelList.length > 0 ? (
                  <ReadyRow state="ok" title="Pixel">{pixelList[0].name}</ReadyRow>
                ) : pixels.isSuccess ? (
                  <ReadyRow state="opt" title="Pixel">
                    Facultatif · <Link to="/guide-meta">l'installer avec le guide</Link>
                  </ReadyRow>
                ) : null}
              </ul>
            </div>
          ) : (
            <div className="gx-cx-side">
              <p className="gx-lbl">Avec ton accord, Growthity pourra</p>
              <ul className="gx-cx-list gx-cx-can">
                <li><i aria-hidden="true"><Ico d={IC_SEND} className="gx-cx-ic" /></i><div><b>Publier tes campagnes</b><small>Sur le compte publicitaire que tu choisis, avec le budget que tu fixes.</small></div></li>
                <li><i aria-hidden="true"><Ico d={IC_CHART} className="gx-cx-ic" /></i><div><b>Lire tes résultats</b><small>Dépenses, clics, ventes : tout remonte dans Résultats et Performance.</small></div></li>
                <li><i aria-hidden="true"><Ico d={IC_USERS} className="gx-cx-ic" /></i><div><b>Récupérer tes leads</b><small>Les contacts de tes formulaires Meta arrivent directement dans Growthity.</small></div></li>
              </ul>
            </div>
          )}
        </div>

        {!creds.isLoading && !connected && <GuideMetaPanel reason="not-connected" />}
        {noAdAccount && <GuideMetaPanel reason="no-ad-account" />}
      </section>

      {/* ---------- Shopify ---------- */}
      {SHOW_SHOPIFY && (<div className="gx-conn">
        <div className="gx-box gx-cc">
          <div className="gx-cc-h">
            <span className="gx-lg gx-shop" aria-hidden="true">
              <ShopifyIcon width={26} height={26} aria-hidden="true" />
            </span>
            <div>
              <b>Shopify</b>
              <small>Importe tes produits pour les utiliser directement dans le chat</small>
            </div>
            {shop.isLoading ? (
              <span className="gx-st gx-off">Vérification…</span>
            ) : shopConnected ? (
              <span className="gx-st gx-on">Connecté</span>
            ) : (
              <span className="gx-st gx-off">Non connecté</span>
            )}
          </div>

          {shopConnected && (
            <>
              <div className="gx-acc">
                <b>{shopInfo?.shop_name ?? shopInfo?.shop_domain}</b>
                <small>
                  {[
                    shopInfo?.shop_domain,
                    shopInfo?.currency,
                    products.isLoading ? "produits…" : productCount != null ? `${productCount >= 100 ? "100+" : productCount} produit${productCount > 1 ? "s" : ""}` : null,
                  ].filter(Boolean).join(" · ")}
                </small>
              </div>
              <div className="gx-row">
                <button type="button" className={syncing ? "gx-btn gx-sm gx-spin-i" : "gx-btn gx-sm"} onClick={() => void syncShop()} disabled={syncing}>
                  <Ico d={IC_RELOAD} />{syncing ? "Synchronisation…" : "Synchroniser les produits"}
                </button>
                <button type="button" className="gx-btn gx-sm gx-ghost" onClick={() => setConfirmShop(true)}>Déconnecter</button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button type="button" className="gx-ib gx-sm gx-cc-more" aria-label="Plus d'options Shopify"><Ico d={IC_MORE} /></button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="console-app-portal">
                    <DropdownMenuItem onSelect={() => openShopSheet(shopInfo?.shop_domain ?? "")}>Reconnecter la boutique</DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => openShopSheet("")}>Changer de boutique</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </>
          )}

          {!shopConnected && !shop.isLoading && (
            <>
              <p className="gx-hint">
                Aucune boutique Shopify connectée. Connecte-la pour choisir tes produits existants lors de la création d'une publicité.
              </p>
              <div className="gx-row">
                <button type="button" className="gx-btn gx-sm gx-pri" onClick={() => openShopSheet("")}>Connecter Shopify</button>
              </div>
            </>
          )}
        </div>
      </div>)}

      {/* Connexion d'une boutique Shopify */}
      {SHOW_SHOPIFY && (<DialogPrimitive.Root open={shopSheet} onOpenChange={setShopSheet}>
        <GxSheetContent className="console-app-portal" aria-describedby={undefined}>
          <div className="gx-sheet-h">
            <div>
              <DialogPrimitive.Title asChild><b>Boutique Shopify</b></DialogPrimitive.Title>
              <small>Connecte ta boutique pour utiliser tes produits directement dans le chat Growthity.</small>
            </div>
            <GxSheetClose />
          </div>
          <form className="gx-ls-b" id="shopForm" onSubmit={(e) => { e.preventDefault(); void connectShop(); }}>
            <label className="gx-lbl" htmlFor="shopDomain">Domaine de la boutique</label>
            <input
              className="gx-in" id="shopDomain" value={shopDomain} autoFocus
              onChange={(e) => setShopDomain(e.target.value)} placeholder="ma-boutique.myshopify.com"
            />
            <p className="gx-hint">
              Utilise le domaine .myshopify.com (Paramètres → Domaines → « Domaine myshopify.com »), ou colle l'URL
              admin.shopify.com/store/…. La boutique doit avoir un plan actif : une boutique en pause affiche
              « Cette boutique sera bientôt de retour ».
            </p>
          </form>
          <div className="gx-sheet-f">
            <div className="gx-sp" />
            <DialogPrimitive.Close asChild><button type="button" className="gx-btn">Annuler</button></DialogPrimitive.Close>
            <button type="submit" form="shopForm" className="gx-btn gx-pri">
              {shopBusy ? "Connexion…" : shopConnected ? "Connecter cette boutique" : "Autoriser Shopify"}
            </button>
          </div>
        </GxSheetContent>
      </DialogPrimitive.Root>)}

      <AlertDialog open={confirmMeta} onOpenChange={setConfirmMeta}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Déconnecter ton compte Meta ?</AlertDialogTitle>
            <AlertDialogDescription>
              Growthity n'aura plus accès à tes comptes publicitaires, Pages et Pixels tant que tu ne te reconnectes pas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => void disconnectMeta()}>
              Déconnecter
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {SHOW_SHOPIFY && (<AlertDialog open={confirmShop} onOpenChange={setConfirmShop}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Déconnecter ta boutique Shopify ?</AlertDialogTitle>
            <AlertDialogDescription>
              Tes produits Shopify ne seront plus proposés dans le chat tant que tu ne reconnectes pas la boutique.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => void disconnectShop()}>
              Déconnecter
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>)}
    </div>
  );
}
