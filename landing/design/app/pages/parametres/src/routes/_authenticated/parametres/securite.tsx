import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect, useMemo } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { GxSheetContent, GxSheetClose } from "@/components/ui/gx-controls";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { getAuthProviders, listMySessions, revokeSession } from "@/lib/workspaces.functions";

export const Route = createFileRoute("/_authenticated/parametres/securite")({
  component: Page,
});

function parseUA(ua: string | null): string {
  if (!ua) return "Appareil inconnu";
  const browser =
    /Firefox\/([\d.]+)/i.test(ua) ? "Firefox" :
    /Edg\/([\d.]+)/i.test(ua) ? "Edge" :
    /Chrome\/([\d.]+)/i.test(ua) ? "Chrome" :
    /Safari\/([\d.]+)/i.test(ua) ? "Safari" : "Navigateur";
  const os =
    /Windows/i.test(ua) ? "Windows" :
    /Mac OS X/i.test(ua) ? "macOS" :
    /Android/i.test(ua) ? "Android" :
    /iPhone|iPad|iOS/i.test(ua) ? "iOS" :
    /Linux/i.test(ua) ? "Linux" : "OS";
  return `${browser} · ${os}`;
}

type Factor = { id: string; friendly_name?: string | null; status: string; created_at: string };
type EnrollState = { factorId: string; qr: string; secret: string };
type Sheet = null | "mfa" | "sessions" | "password";

function Page() {
  const router = useRouter();
  const providersFn = useServerFn(getAuthProviders);
  const sessionsFn = useServerFn(listMySessions);
  const revokeFn = useServerFn(revokeSession);

  const { data: providers } = useQuery({ queryKey: ["auth", "providers"], queryFn: () => providersFn(), staleTime: 60_000 });
  const { data: sessions, refetch: refetchSessions, isLoading: sessionsLoading } = useQuery({
    queryKey: ["auth", "sessions"], queryFn: () => sessionsFn(), staleTime: 30_000,
  });

  const [sheet, setSheet] = useState<Sheet>(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  // La liste des sessions n'est pas toujours lisible côté base : on affiche au
  // minimum l'appareil courant plutôt qu'un « Aucune session active » trompeur.
  const [thisDeviceUA, setThisDeviceUA] = useState<string | null>(null);
  useEffect(() => { setThisDeviceUA(navigator.userAgent); }, []);

  const sessionList = useMemo(() => {
    const list = ((sessions as any[]) ?? []) as Array<{ id: string; user_agent: string | null; ip: string | null; updated_at: string }>;
    if (list.length > 0) return list;
    if (!thisDeviceUA) return [];
    return [{ id: "current-session", user_agent: thisDeviceUA as string | null, ip: null as string | null, updated_at: new Date().toISOString() }];
  }, [sessions, thisDeviceUA]);

  const canChangePassword = (providers as any)?.hasPassword ?? false;
  const isGoogleOnly = !!providers && (providers as any).hasGoogle && !(providers as any).hasPassword;

  const changePassword = async () => {
    if (saving) return;
    if (password.length < 8) { toast.error("Minimum 8 caractères"); return; }
    if (password !== confirm) { toast.error("Les mots de passe ne correspondent pas"); return; }
    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success("Mot de passe mis à jour");
      setPassword(""); setConfirm("");
      setSheet(null);
    } catch (e) { toast.error(e instanceof Error ? e.message : "Erreur"); }
    finally { setSaving(false); }
  };

  const signOutAll = async () => {
    setSigningOut(true);
    try {
      await supabase.auth.signOut({ scope: "global" });
      toast.success("Déconnecté de tous les appareils");
      router.navigate({ to: "/auth" });
    } catch (e) { toast.error(e instanceof Error ? e.message : "Erreur"); setSigningOut(false); }
  };

  const revoke = async (id: string) => {
    try {
      await revokeFn({ data: { sessionId: id } });
      toast.success("Appareil déconnecté");
      refetchSessions();
    } catch (e) { toast.error(e instanceof Error ? e.message : "Erreur"); }
  };

  /* ---------- double authentification (repris de TwoFactorCard) ---------- */

  const [mfaLoading, setMfaLoading] = useState(true);
  const [factors, setFactors] = useState<Factor[]>([]);
  const [enroll, setEnroll] = useState<EnrollState | null>(null);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);

  const refreshFactors = async () => {
    setMfaLoading(true);
    try {
      const { data, error } = await supabase.auth.mfa.listFactors();
      if (error) throw error;
      const totp = (data?.all ?? []).filter((f) => f.factor_type === "totp");
      setFactors(totp.map((f) => ({ id: f.id, friendly_name: f.friendly_name, status: f.status, created_at: f.created_at })));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Impossible de charger les facteurs 2FA");
    } finally {
      setMfaLoading(false);
    }
  };
  useEffect(() => { void refreshFactors(); }, []);

  const verified = factors.filter((f) => f.status === "verified");
  const mfaOn = verified.length > 0;

  const startEnroll = async () => {
    setBusy(true);
    try {
      const pending = factors.find((f) => f.status !== "verified");
      if (pending) await supabase.auth.mfa.unenroll({ factorId: pending.id }).catch(() => {});
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: "totp",
        friendlyName: `Authenticator ${new Date().toLocaleDateString("fr-FR")}`,
      });
      if (error) throw error;
      if (!data) throw new Error("Réponse vide du serveur");
      setEnroll({ factorId: data.id, qr: data.totp.qr_code, secret: data.totp.secret });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erreur lors de l'activation");
    } finally {
      setBusy(false);
    }
  };

  const cancelEnroll = async () => {
    if (!enroll) return;
    setBusy(true);
    try { await supabase.auth.mfa.unenroll({ factorId: enroll.factorId }); } catch { /* ignore */ }
    finally { setEnroll(null); setCode(""); setBusy(false); void refreshFactors(); }
  };

  const verifyEnroll = async () => {
    if (!enroll || busy) return;
    const clean = code.replace(/\s+/g, "");
    if (clean.length !== 6) { toast.error("Entre le code à 6 chiffres"); return; }
    setBusy(true);
    try {
      const chall = await supabase.auth.mfa.challenge({ factorId: enroll.factorId });
      if (chall.error) throw chall.error;
      const { error } = await supabase.auth.mfa.verify({ factorId: enroll.factorId, challengeId: chall.data.id, code: clean });
      if (error) throw error;
      toast.success("2FA activée");
      setEnroll(null); setCode("");
      void refreshFactors();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Code invalide");
    } finally {
      setBusy(false);
    }
  };

  const removeFactor = async (id: string) => {
    if (!confirm_("Désactiver la 2FA pour cet appareil ?")) return;
    setBusy(true);
    try {
      const { error } = await supabase.auth.mfa.unenroll({ factorId: id });
      if (error) throw error;
      toast.success("2FA désactivée");
      void refreshFactors();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erreur");
    } finally {
      setBusy(false);
    }
  };

  const openMfa = () => {
    setSheet("mfa");
    if (!mfaOn && !enroll) void startEnroll();
  };
  const closeSheet = (o: boolean) => {
    if (o) return;
    if (sheet === "mfa" && enroll) void cancelEnroll();
    setSheet(null);
  };

  /* ---------- rendu ---------- */

  const current = sessionList.find((s) => s.id === "current-session") ?? sessionList[0];
  const othersCount = Math.max(0, sessionList.length - 1);

  return (
    <>
      <div className="gx-box gx-form">
        <div className="gx-fr">
          <label id="lblMfa">Authentification à deux facteurs</label>
          <button
            type="button" className={mfaOn ? "gx-tg gx-on" : "gx-tg"} aria-pressed={mfaOn} aria-labelledby="lblMfa"
            disabled={mfaLoading} onClick={openMfa}
            title={mfaOn ? "Gérer la double authentification" : "Activer la double authentification"}
          />
          <span className="gx-hint">{mfaLoading ? "Vérification…" : mfaOn ? `Activée · ${verified.length} appareil${verified.length > 1 ? "s" : ""}` : "Désactivée"}</span>
        </div>

        <div className="gx-fr">
          <label>Appareils connectés</label>
          <span>
            {sessionsLoading
              ? "Chargement…"
              : current
                ? `${parseUA(current.user_agent)}${current.ip ? ` · ${current.ip}` : ""} · actif maintenant${othersCount ? ` · +${othersCount} autre${othersCount > 1 ? "s" : ""}` : ""}`
                : "Aucune session active."}
          </span>
          <button type="button" className="gx-btn gx-sm" onClick={() => setSheet("sessions")}>Gérer</button>
        </div>

        <div className="gx-fr">
          <label>Mot de passe</label>
          {!providers ? (
            <span className="gx-hint">Vérification…</span>
          ) : canChangePassword ? (
            <button type="button" className="gx-btn gx-sm" onClick={() => setSheet("password")}>Changer</button>
          ) : (
            <span>{isGoogleOnly ? "Connexion via Google : le mot de passe se gère sur ton compte Google." : "Aucun mot de passe défini pour ce compte."}</span>
          )}
        </div>
      </div>

      <DialogPrimitive.Root open={sheet !== null} onOpenChange={closeSheet}>
        <GxSheetContent className="console-app-portal" aria-describedby={undefined}>
          {sheet === "mfa" && (
            <>
              <div className="gx-sheet-h">
                <div>
                  <DialogPrimitive.Title asChild><b>Authentification à deux facteurs</b></DialogPrimitive.Title>
                  <small>Un code temporaire (Google Authenticator, 1Password, Authy…) à chaque connexion.</small>
                </div>
                <GxSheetClose />
              </div>
              <div className="gx-ls-b">
                {enroll ? (
                  <>
                    <div className="gx-lbl">1. Scanne ce QR code dans ton app d'authentification</div>
                    <div className="gx-qr" aria-label="QR code 2FA" dangerouslySetInnerHTML={{ __html: enroll.qr }} />
                    <p className="gx-hint">Ou saisis cette clé manuellement :</p>
                    <code className="gx-in gx-num gx-qr-k">{enroll.secret}</code>
                    <label className="gx-lbl" htmlFor="totp-code">2. Entre le code à 6 chiffres généré par l'app</label>
                    <input
                      className="gx-in gx-num" id="totp-code" inputMode="numeric" autoComplete="one-time-code" maxLength={6}
                      placeholder="123456" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                      onKeyDown={(e) => { if (e.key === "Enter") void verifyEnroll(); }}
                    />
                  </>
                ) : mfaLoading || busy ? (
                  <p className="gx-hint">Préparation…</p>
                ) : mfaOn ? (
                  <>
                    {verified.map((f) => (
                      <div key={f.id} className="gx-acc">
                        <b>{f.friendly_name || "Application d'authentification"}</b>
                        <small>Activée le {new Date(f.created_at).toLocaleDateString("fr-FR")}</small>
                        <button type="button" className="gx-btn gx-sm gx-ghost gx-ml" onClick={() => void removeFactor(f.id)} disabled={busy}>Désactiver</button>
                      </div>
                    ))}
                  </>
                ) : (
                  <p className="gx-hint">La 2FA protège ton compte même si ton mot de passe est compromis.</p>
                )}
              </div>
              <div className="gx-sheet-f">
                {enroll ? (
                  <>
                    <button type="button" className="gx-btn" onClick={() => void cancelEnroll()}>Annuler</button>
                    <div className="gx-sp" />
                    <button type="button" className="gx-btn gx-pri" onClick={() => void verifyEnroll()}>{busy ? "Vérification…" : "Activer la 2FA"}</button>
                  </>
                ) : mfaOn ? (
                  <>
                    <div className="gx-sp" />
                    <button type="button" className="gx-btn" onClick={() => void startEnroll()}>Ajouter un autre appareil</button>
                  </>
                ) : (
                  <>
                    <div className="gx-sp" />
                    <button type="button" className="gx-btn gx-pri" onClick={() => void startEnroll()}>Activer la 2FA</button>
                  </>
                )}
              </div>
            </>
          )}

          {sheet === "sessions" && (
            <>
              <div className="gx-sheet-h">
                <div>
                  <DialogPrimitive.Title asChild><b>Appareils connectés</b></DialogPrimitive.Title>
                  <small>Sessions actives sur ton compte.</small>
                </div>
                <GxSheetClose />
              </div>
              <div className="gx-ls-b">
                {sessionsLoading ? (
                  <p className="gx-hint">Chargement…</p>
                ) : sessionList.length === 0 ? (
                  <p className="gx-hint">Aucune session active.</p>
                ) : sessionList.map((s) => (
                  <div key={s.id} className="gx-acc">
                    <b>{parseUA(s.user_agent)}</b>
                    {s.id === "current-session" && <span className="gx-gb">Session en cours</span>}
                    <small>{s.ip ?? "IP inconnue"} · Dernière activité {new Date(s.updated_at).toLocaleString("fr-FR")}</small>
                    {s.id !== "current-session" && (
                      <button type="button" className="gx-btn gx-sm gx-ghost gx-ml" onClick={() => void revoke(s.id)}>Déconnecter</button>
                    )}
                  </div>
                ))}
              </div>
              <div className="gx-sheet-f">
                <div className="gx-sp" />
                <button type="button" className="gx-btn" onClick={() => void signOutAll()}>{signingOut ? "Déconnexion…" : "Tout déconnecter"}</button>
              </div>
            </>
          )}

          {sheet === "password" && (
            <>
              <div className="gx-sheet-h">
                <div>
                  <DialogPrimitive.Title asChild><b>Changer le mot de passe</b></DialogPrimitive.Title>
                  <small>Choisis un mot de passe fort d'au moins 8 caractères.</small>
                </div>
                <GxSheetClose />
              </div>
              <form className="gx-ls-b" id="pwdForm" onSubmit={(e) => { e.preventDefault(); void changePassword(); }}>
                <label className="gx-lbl" htmlFor="pwd">Nouveau mot de passe</label>
                <input className="gx-in" id="pwd" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} autoFocus />
                <label className="gx-lbl" htmlFor="cpwd">Confirmer</label>
                <input className="gx-in" id="cpwd" type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
              </form>
              <div className="gx-sheet-f">
                <div className="gx-sp" />
                <DialogPrimitive.Close asChild><button type="button" className="gx-btn">Annuler</button></DialogPrimitive.Close>
                <button type="submit" form="pwdForm" className="gx-btn gx-pri">{saving ? "Mise à jour…" : "Mettre à jour"}</button>
              </div>
            </>
          )}
        </GxSheetContent>
      </DialogPrimitive.Root>
    </>
  );
}

/** Confirmation native, comme dans l'ancien composant 2FA. */
function confirm_(message: string) {
  return typeof window !== "undefined" ? window.confirm(message) : false;
}
