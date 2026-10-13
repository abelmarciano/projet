import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useServerFn } from "@tanstack/react-start";
import {
  signUpWithEmail,
  requestPasswordReset,
  resendConfirmationEmail,
  reportSignIn,
} from "@/lib/auth-email.functions";
import { AuthShell, GoogleG, PasswordInput, passwordStrength, STRENGTH_HINT } from "@/components/auth/AuthShell";

/*
 * Connexion, inscription et mot de passe oublié : copie exacte de la maquette validée
 * (landing/design/auth/auth.html), styles dans src/styles/gx-auth.css.
 * La logique (Google, inscription avec e-mail Growthity, renvoi de confirmation, alerte de connexion,
 * redirection `next`, lancement Google depuis la landing) est celle de la version précédente.
 */

type Mode = "signin" | "signup" | "forgot";

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>): {
    next?: string;
    pack?: string;
    authError?: string;
    authErrorDesc?: string;
    confirmed?: string;
    google?: string;
    mode?: Mode;
  } => ({
    ...(typeof s.next === "string" ? { next: s.next } : {}),
    ...(typeof s.pack === "string" ? { pack: s.pack } : {}),
    ...(typeof s.authError === "string" ? { authError: s.authError } : {}),
    ...(typeof s.authErrorDesc === "string" ? { authErrorDesc: s.authErrorDesc } : {}),
    ...(typeof s.confirmed === "string" ? { confirmed: s.confirmed } : {}),
    ...(typeof s.google === "string" ? { google: s.google } : {}),
    ...(s.mode === "signin" || s.mode === "signup" || s.mode === "forgot" ? { mode: s.mode } : {}),
  }),

  head: () => ({
    meta: [
      { name: "robots", content: "noindex, nofollow" },
      { title: "Connexion - growthity.ai" },
      { name: "description", content: "Connecte-toi à growthity.ai pour créer et publier tes publicités Meta avec l'IA." },
    ],
  }),
  component: AuthPage,
});

// Seuls les chemins relatifs du même site sont acceptés comme destination après connexion.
function safeNext(next: string | undefined): string {
  if (!next || typeof next !== "string") return "/create";
  if (!next.startsWith("/") || next.startsWith("//")) return "/create";
  return next;
}

type AuthErr = { message: string; needsConfirm?: boolean; badCredentials?: boolean };

/** Traduit les erreurs d'authentification en messages clairs, au tutoiement. */
function authMessage(raw: string): AuthErr {
  const m = raw.toLowerCase();
  if (m.includes("email not confirmed") || m.includes("email_not_confirmed")) {
    return {
      message: "Ton adresse e-mail n'est pas encore confirmée. Clique sur le lien reçu par e-mail, ou demande-en un nouveau.",
      needsConfirm: true,
    };
  }
  if (m.includes("invalid login credentials")) {
    return { message: "E-mail ou mot de passe incorrect.", badCredentials: true };
  }
  if (m.includes("user already registered") || m.includes("already been registered")) {
    return { message: "Un compte existe déjà avec cet e-mail. Connecte-toi, ou choisis un nouveau mot de passe." };
  }
  if (m.includes("password should be at least") || m.includes("weak password")) {
    return { message: "Mot de passe trop court : 8 caractères minimum." };
  }
  if (m.includes("pwned") || m.includes("compromised")) {
    return { message: "Ce mot de passe apparaît dans des fuites de données connues. Choisis-en un autre." };
  }
  if (m.includes("already confirmed") || m.includes("already been confirmed")) {
    return { message: "Cet e-mail est déjà confirmé : connecte-toi avec ton mot de passe." };
  }
  if (m.includes("rate limit") || m.includes("too many") || m.includes("429")) {
    return { message: "Trop de tentatives. Patiente quelques minutes avant de réessayer." };
  }
  if (m.includes("otp_expired") || m.includes("expired")) {
    return { message: "Ce lien a expiré. Demande un nouvel e-mail de confirmation ou de réinitialisation.", needsConfirm: true };
  }
  if (m.includes("access_denied")) {
    return { message: "Ce lien n'est plus valide. Demandes-en un nouveau ci-dessous.", needsConfirm: true };
  }
  if (m.includes("recovery_session_missing")) {
    return { message: "Le lien de réinitialisation a expiré. Demandes-en un nouveau ci-dessous." };
  }
  if (m.includes("failed to fetch") || m.includes("network")) {
    return { message: "Connexion au serveur impossible. Vérifie ton réseau et réessaie." };
  }
  return { message: "Une erreur est survenue. Réessaie dans un instant." };
}

const RESEND_DELAY = 30;

function AuthPage() {
  const { next, authError, authErrorDesc, confirmed, google: googleParam, mode: modeParam } = Route.useSearch();
  const dest = safeNext(next);
  const [mode, setMode] = useState<Mode>(modeParam ?? "signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AuthErr | null>(null);
  const [pendingConfirm, setPendingConfirm] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) window.location.href = dest;
    });
  }, [dest]);

  useEffect(() => {
    if (confirmed) toast.success("E-mail confirmé, tu peux te connecter.");
    if (authError) setError(authMessage(authErrorDesc || authError));
  }, [authError, authErrorDesc, confirmed]);

  // Compte à rebours avant de pouvoir renvoyer l'e-mail de confirmation.
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = window.setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => window.clearTimeout(t);
  }, [cooldown]);

  const fail = (err: unknown) => {
    const raw = err instanceof Error ? err.message : String(err ?? "");
    setError(authMessage(raw));
  };

  const signUpFn = useServerFn(signUpWithEmail);
  const resetFn = useServerFn(requestPasswordReset);
  const resendFn = useServerFn(resendConfirmationEmail);
  const reportSignInFn = useServerFn(reportSignIn);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === "signup") {
        if (password.length < 8) throw new Error("Password should be at least 8 characters");
        // Inscription via notre fonction serveur : elle crée le compte et envoie l'e-mail
        // de confirmation Growthity (modèle Resend) au lieu du modèle par défaut.
        await signUpFn({
          data: {
            email: email.trim(),
            password,
            redirectTo: `${window.location.origin}/auth?confirmed=1`,
          },
        });
        setPendingConfirm(email.trim());
        setCooldown(RESEND_DELAY);
      } else if (mode === "forgot") {
        await resetFn({
          data: {
            email: email.trim(),
            redirectTo: `${window.location.origin}/reset-password`,
          },
        });
        setResetSent(true);
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (signInError) throw signInError;
        // Alerte de connexion suspecte (nouvel appareil / localisation).
        try {
          await reportSignInFn({});
        } catch {
          /* non bloquant */
        }
        toast.success("Bon retour !");
        window.location.href = dest;
      }
    } catch (err) {
      fail(err);
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    const target = (pendingConfirm ?? email).trim();
    if (!target) {
      setError({ message: "Indique ton e-mail pour recevoir un nouveau lien de confirmation." });
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await resendFn({
        data: {
          email: target,
          redirectTo: `${window.location.origin}/auth?confirmed=1`,
        },
      });
      setPendingConfirm(target);
      setCooldown(RESEND_DELAY);
      toast.success("Nouvel e-mail de confirmation envoyé.");
    } catch (err) {
      fail(err);
    } finally {
      setLoading(false);
    }
  };

  const google = async () => {
    setLoading(true);
    // L'URL de retour Google doit être publique et sur le même site : on repasse par /auth avec `next`
    // pour récupérer la session avant d'aller sur une page protégée (ou la page de consentement OAuth).
    const redirect_uri = `${window.location.origin}/auth?next=${encodeURIComponent(dest)}`;
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri,
      // Force le choix du compte Google au lieu de reprendre la dernière session du navigateur.
      extraParams: { prompt: "select_account" },
    });
    if (result.error) {
      setError({ message: "La connexion avec Google n'a pas abouti. Réessaie, ou utilise ton e-mail." });
      setLoading(false);
      return;
    }
    if (result.redirected) return;
    window.location.href = dest;
  };

  // Arrivée depuis la landing avec ?google=1 : lance directement Google.
  const googleLaunched = useRef(false);
  useEffect(() => {
    if (googleParam && !googleLaunched.current) {
      googleLaunched.current = true;
      void google();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [googleParam]);

  const switchMode = (m: Mode) => {
    setMode(m);
    setError(null);
    setResetSent(false);
    setPendingConfirm(null);
  };

  /* ---------- Écran « Vérifie ta boîte mail » ---------- */
  if (pendingConfirm) {
    return (
      <AuthShell>
        <div className="gxa-mail">
          <span className="gxa-env" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="5" width="18" height="14" rx="2.5" /><path d="m4 7 8 6 8-6" />
            </svg>
          </span>
          <div>
            <h1>Vérifie ta boîte mail</h1>
            <p className="gxa-sub gxa-sub-tight">
              On a envoyé un lien de confirmation à <b>{pendingConfirm}</b>.
            </p>
          </div>
          {error && <ErrorBox error={error} />}
          <ol className="gxa-steps">
            <li><span>1</span>Ouvre l'e-mail de growthity.ai (regarde aussi dans les indésirables).</li>
            <li><span>2</span>Clique sur « Confirmer mon adresse ». Le lien est valable une heure.</li>
          </ol>
          <div className="gxa-apps">
            <a className="gxa-btn" href="https://mail.google.com" target="_blank" rel="noopener noreferrer">Ouvrir Gmail</a>
            <a className="gxa-btn" href="https://outlook.live.com" target="_blank" rel="noopener noreferrer">Ouvrir Outlook</a>
          </div>
          <p className="gxa-swap gxa-left-al">
            Rien reçu ?{" "}
            <button type="button" className="gxa-lnk" onClick={() => void resend()} disabled={loading || cooldown > 0}>
              {loading ? "Envoi…" : cooldown > 0 ? `Renvoyer dans ${cooldown} s` : "Renvoyer l'e-mail"}
            </button>{" "}
            ·{" "}
            <button type="button" className="gxa-lnk" onClick={() => { setEmail(pendingConfirm); switchMode("signup"); }}>
              Changer d'adresse
            </button>
          </p>
        </div>
      </AuthShell>
    );
  }

  const strength = passwordStrength(password);
  const title = mode === "signin" ? "Bon retour" : mode === "signup" ? "Crée ton compte" : "Mot de passe oublié";
  const subtitle =
    mode === "signin"
      ? "Connecte-toi pour retrouver tes pubs et tes résultats."
      : mode === "signup"
        ? "Ta première pub prête en quelques minutes."
        : "Indique ton adresse e-mail : on t'envoie un lien pour en choisir un nouveau.";

  return (
    <AuthShell>
      {mode === "forgot" ? (
        <button type="button" className="gxa-lnk gxa-backlnk" onClick={() => switchMode("signin")}>
          ← Retour à la connexion
        </button>
      ) : (
        <div className="gxa-seg" role="tablist" aria-label="Connexion ou inscription">
          <button type="button" role="tab" aria-selected={mode === "signin"} onClick={() => switchMode("signin")}>
            Se connecter
          </button>
          <button type="button" role="tab" aria-selected={mode === "signup"} onClick={() => switchMode("signup")}>
            Créer un compte
          </button>
        </div>
      )}

      <h1>{title}</h1>
      <p className="gxa-sub">{subtitle}</p>

      {error && <ErrorBox error={error} onForgot={() => switchMode("forgot")} onResend={() => void resend()} loading={loading} />}

      {resetSent && (
        <div className="gxa-msg gxa-ok" role="status">
          <i aria-hidden="true">✓</i>
          <p>Si un compte existe pour <b>{email}</b>, le lien vient de partir. Il est valable une heure.</p>
        </div>
      )}

      {mode !== "forgot" && (
        <>
          <button type="button" className="gxa-btn" onClick={() => void google()} disabled={loading}>
            <GoogleG />
            Continuer avec Google
          </button>
          <div className="gxa-or">ou avec ton e-mail</div>
        </>
      )}

      <form onSubmit={submit} className="gxa-fields">
        <div className="gxa-f">
          <label htmlFor="email">Adresse e-mail</label>
          <div className={error?.badCredentials ? "gxa-in gxa-err" : "gxa-in"}>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              placeholder="toi@entreprise.fr"
              value={email}
              aria-invalid={error?.badCredentials || undefined}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        {mode !== "forgot" && (
          <div className="gxa-f">
            <div className="gxa-fh">
              <label htmlFor="password">Mot de passe</label>
              {mode === "signin" && (
                <button type="button" className="gxa-lnk" onClick={() => switchMode("forgot")}>
                  Mot de passe oublié ?
                </button>
              )}
            </div>
            <PasswordInput
              id="password"
              value={password}
              onChange={setPassword}
              minLength={mode === "signup" ? 8 : 6}
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              placeholder={mode === "signup" ? "8 caractères minimum" : undefined}
              invalid={error?.badCredentials}
            />
            {mode === "signup" && (
              <>
                <div className="gxa-meter" data-s={strength} aria-hidden="true"><i /><i /><i /></div>
                <span className="gxa-hint" aria-live="polite">{STRENGTH_HINT[strength]}</span>
              </>
            )}
          </div>
        )}

        <button type="submit" className="gxa-btn gxa-pri" disabled={loading}>
          {loading && <Loader2 className="gxa-spin" aria-hidden="true" />}
          {mode === "signin" ? "Se connecter" : mode === "signup" ? "Créer mon compte" : "Envoyer le lien"}
        </button>
      </form>

      {mode === "signup" && (
        <p className="gxa-legal">
          En créant ton compte, tu acceptes les <a href="/cgv">conditions générales</a> et la{" "}
          <a href="/politique-de-confidentialite">politique de confidentialité</a>.
        </p>
      )}
      {mode === "forgot" && <p className="gxa-hint">Le lien est valable une heure.</p>}
    </AuthShell>
  );
}

/** Message d'erreur en haut du formulaire, avec l'action utile selon le cas. */
function ErrorBox({
  error, onForgot, onResend, loading,
}: {
  error: AuthErr;
  onForgot?: () => void;
  onResend?: () => void;
  loading?: boolean;
}) {
  if (error.needsConfirm && onResend) {
    return (
      <div className="gxa-msg gxa-warn" role="alert">
        <i aria-hidden="true">!</i>
        <div>
          <p><b>E-mail non confirmé.</b> {error.message}</p>
          <button type="button" className="gxa-btn gxa-sm" onClick={onResend} disabled={loading}>
            {loading && <Loader2 className="gxa-spin" aria-hidden="true" />}
            Renvoyer l'e-mail de confirmation
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="gxa-msg gxa-bad" role="alert">
      <i aria-hidden="true">!</i>
      <p>
        <b>{error.message}</b>
        {error.badCredentials && onForgot && (
          <>
            {" "}Vérifie ta saisie, ou{" "}
            <button type="button" className="gxa-lnk gxa-inline" onClick={onForgot}>choisis un nouveau mot de passe</button>.
          </>
        )}
      </p>
    </div>
  );
}
