import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { getMetaCredentials, deleteMetaCredentials } from "@/lib/meta.functions";
import { startMetaOAuth, listMetaAdAccounts, setActiveMetaAdAccounts } from "@/lib/meta-oauth.functions";
import {
  getShopifyCredentials, startShopifyOAuth, deleteShopifyCredentials, listShopifyProducts,
} from "@/lib/shopify.functions";
import { GxSheetContent, GxSheetClose } from "@/components/ui/gx-controls";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/*
 * Connexion : copie de la maquette validée (landing/design/app/views/connexion.html),
 * classes gx- de src/styles/gx-console.css, branchée sur les vraies connexions Meta et Shopify.
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

function Ico({ d }: { d: string }) {
  return (
    <svg className="gx-i" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}
const IC_RELOAD = "M21 12a9 9 0 1 1-3-6.7L21 8M21 3v5h-5";
const IC_BELL = "M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.9 1.9 0 0 0 3.4 0";
const IC_MORE = "M5 12h.01M12 12h.01M19 12h.01";

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

/* ---------- page ---------- */

function ConnexionsPage() {
  const qc = useQueryClient();

  /* Meta */
  const getCreds = useServerFn(getMetaCredentials);
  const delMeta = useServerFn(deleteMetaCredentials);
  const startMeta = useServerFn(startMetaOAuth);
  const listAccounts = useServerFn(listMetaAdAccounts);
  const saveActive = useServerFn(setActiveMetaAdAccounts);

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
      qc.invalidateQueries({ queryKey: ["meta-leadforms"] }),
      qc.invalidateQueries({ queryKey: ["meta-campaigns-insights"] }),
      qc.invalidateQueries({ queryKey: ["meta-performance"] }),
      qc.invalidateQueries({ queryKey: ["meta-top-ads"] }),
      qc.invalidateQueries({ queryKey: ["media-buyer-summary"] }),
    ]);

  const connectMeta = async () => {
    const popup = window.open("", "meta-oauth", "width=680,height=760");
    if (!popup) { toast.error("Popup bloquée - autorise les popups puis réessaie."); return; }
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

  /* Shopify */
  const getShopify = useServerFn(getShopifyCredentials);
  const startShop = useServerFn(startShopifyOAuth);
  const delShop = useServerFn(deleteShopifyCredentials);
  const listProducts = useServerFn(listShopifyProducts);

  const shop = useQuery({ queryKey: ["shopify-credentials"], queryFn: () => getShopify() });
  const shopInfo: any = (shop.data as any)?.connected ? shop.data : null;
  const shopConnected = shopInfo !== null;
  const products = useQuery({
    queryKey: ["shopify-products-count"],
    queryFn: () => listProducts({ data: { limit: 100 } }),
    enabled: shopConnected,
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

  return (
    <div className="gx-page">
      <header className="gx-ph">
        <div>
          <h1>Connexion</h1>
          <p>Les comptes que Growthity utilise pour publier, synchroniser les leads et importer tes produits.</p>
        </div>
        <div className="gx-pa" />
      </header>

      <div className="gx-conn">
        {/* ---------- Meta ---------- */}
        <div className="gx-box gx-cc">
          <div className="gx-cc-h">
            <span className="gx-lg gx-meta" aria-hidden="true">f</span>
            <div>
              <b>Meta Ads</b>
              <small>Facebook &amp; Instagram · publication automatique de tes campagnes</small>
            </div>
            <span className="gx-ccst">
              {creds.isLoading ? (
                <span className="gx-st gx-off">Vérification…</span>
              ) : expired ? (
                <span className="gx-st gx-bad">Session expirée</span>
              ) : connected ? (
                <span className="gx-st gx-on">Connecté</span>
              ) : (
                <span className="gx-st gx-off">Non connecté</span>
              )}
            </span>
          </div>

          {connected && (
            <>
              <div className="gx-cc-lh">
                <div className="gx-lbl">Comptes publicitaires actifs ({activeAccounts.length})</div>
                {saving && <span className="gx-hint">Enregistrement…</span>}
                {allAccounts.length > 0 && (
                  <button type="button" className="gx-cc-lk" onClick={() => setEditAccounts((v) => !v)} aria-expanded={editAccounts}>
                    {editAccounts ? "Terminé" : "Gérer les comptes"}
                  </button>
                )}
              </div>

              {activeAccounts.length === 0 ? (
                <p className="gx-hint">Aucun compte activé pour l'instant.</p>
              ) : activeAccounts.map((a) => {
                const live = allAccounts.find((x) => x.id === a.id);
                const isDefault = a.id === defaultId;
                return (
                  <label key={a.id} className="gx-acc">
                    {editAccounts ? (
                      <input type="checkbox" checked disabled={saving} onChange={() => toggleAccount(a.id, false)} aria-label={`Désactiver ${live?.name ?? a.name}`} />
                    ) : (
                      <input type="radio" name="defacc" checked={isDefault} disabled={saving} onChange={() => setDefault(a.id)} aria-label={`Compte par défaut : ${live?.name ?? a.name}`} />
                    )}
                    <b>{live?.name ?? a.name}</b>
                    <small className="gx-num">{a.id}{live?.currency ? ` · ${live.currency}` : ""}</small>
                    {isDefault && <span className="gx-gb" title="Compte utilisé pour publier depuis le Chat">Par défaut</span>}
                  </label>
                );
              })}

              {editAccounts && (
                accounts.isLoading ? (
                  <p className="gx-hint">Chargement des comptes…</p>
                ) : inactiveAccounts.length > 0 ? (
                  <>
                    <div className="gx-lbl">Autres comptes disponibles ({inactiveAccounts.length})</div>
                    {inactiveAccounts.map((a) => (
                      <label key={a.id} className="gx-acc">
                        <input type="checkbox" checked={false} disabled={saving} onChange={() => toggleAccount(a.id, true)} aria-label={`Activer ${a.name}`} />
                        <b>{a.name}</b>
                        <small className="gx-num">{a.id}{a.currency ? ` · ${a.currency}` : ""}</small>
                      </label>
                    ))}
                  </>
                ) : (
                  <p className="gx-hint">Tous les comptes de ton profil Facebook sont déjà actifs.</p>
                )
              )}

              {(expiry === "expiring_soon" || expired) && (
                <div className="gx-note" role="status">
                  <Ico d={IC_BELL} />{" "}
                  <span>
                    {expired
                      ? "Ta connexion Meta a expiré. Reconnecte-toi pour continuer à publier et synchroniser tes leads."
                      : `Ta connexion Meta expire${expiresOn ? ` le ${expiresOn}` : " bientôt"}. Growthity te prévient 14 jours avant.`}
                  </span>
                </div>
              )}

              <div className="gx-row">
                <button type="button" className={metaBusy ? "gx-btn gx-sm gx-spin-i" : "gx-btn gx-sm"} onClick={() => void connectMeta()} disabled={metaBusy}>
                  <Ico d={IC_RELOAD} />{metaBusy ? "Connexion…" : "Reconnecter"}
                </button>
                <button type="button" className="gx-btn gx-sm gx-ghost" onClick={() => setConfirmMeta(true)}>Déconnecter</button>
              </div>
            </>
          )}

          {!connected && !creds.isLoading && (
            <>
              <p className="gx-hint">
                Aucun compte Meta connecté. La publication de campagnes est indisponible tant que la connexion n'est pas établie.
              </p>
              <div className="gx-row">
                <button type="button" className="gx-btn gx-sm gx-pri" onClick={() => void connectMeta()} disabled={metaBusy}>
                  {metaBusy ? "Connexion…" : "Continuer avec Facebook"}
                </button>
              </div>
            </>
          )}
        </div>

        {/* ---------- Shopify ---------- */}
        <div className="gx-box gx-cc">
          <div className="gx-cc-h">
            <span className="gx-lg gx-shop" aria-hidden="true">S</span>
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
      </div>

      {/* Connexion d'une boutique Shopify */}
      <DialogPrimitive.Root open={shopSheet} onOpenChange={setShopSheet}>
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
              « This store will be right back ».
            </p>
          </form>
          <div className="gx-sheet-f">
            <div className="gx-sp" />
            <DialogPrimitive.Close asChild><button type="button" className="gx-btn">Annuler</button></DialogPrimitive.Close>
            <button type="submit" form="shopForm" className="gx-btn gx-pri" disabled={shopBusy || !shopDomain.trim()}>
              {shopBusy ? "Connexion…" : shopConnected ? "Connecter cette boutique" : "Autoriser Shopify"}
            </button>
          </div>
        </GxSheetContent>
      </DialogPrimitive.Root>

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

      <AlertDialog open={confirmShop} onOpenChange={setConfirmShop}>
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
      </AlertDialog>
    </div>
  );
}
