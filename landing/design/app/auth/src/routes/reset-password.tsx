import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AuthShell, PasswordInput, passwordStrength, STRENGTH_HINT } from "@/components/auth/AuthShell";

/* Nouveau mot de passe : même cadre que la connexion (src/components/auth/AuthShell.tsx). */

export const Route = createFileRoute("/reset-password")({
  ssr: false,
  head: () => ({
    meta: [
      { name: "robots", content: "noindex, nofollow" },
      { title: "Nouveau mot de passe - growthity.ai" },
      { name: "description", content: "Choisis un nouveau mot de passe pour ton compte growthity.ai." },
      { property: "og:title", content: "Nouveau mot de passe - growthity.ai" },
      { property: "og:description", content: "Choisis un nouveau mot de passe pour ton compte growthity.ai." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const [checking, setChecking] = useState(true);
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      // Le lien de récupération peut arriver directement ici avec les jetons dans l'adresse.
      for (let i = 0; i < 20 && active; i++) {
        const { data } = await supabase.auth.getSession();
        if (data.session) break;
        await new Promise((r) => setTimeout(r, 100));
      }
      const { data } = await supabase.auth.getSession();
      if (!active) return;
      setReady(!!data.session);
      setChecking(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    if (password !== confirm) {
      setError("Les deux mots de passe ne sont pas identiques.");
      return;
    }
    setLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      toast.success("Mot de passe mis à jour.");
      window.location.href = "/create";
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      setError(
        /should be different|same_password/i.test(msg)
          ? "Choisis un mot de passe différent de l'ancien."
          : /weak|at least/i.test(msg)
            ? "Mot de passe trop faible, choisis-en un plus long."
            : "Impossible de mettre à jour le mot de passe. Le lien a peut-être expiré : redemandes-en un.",
      );
    } finally {
      setLoading(false);
    }
  };

  const strength = passwordStrength(password);

  return (
    <AuthShell>
      <h1>Nouveau mot de passe</h1>

      {checking ? (
        <div className="gxa-checking"><Loader2 className="gxa-spin" aria-label="Vérification du lien" /></div>
      ) : !ready ? (
        <>
          <p className="gxa-sub">
            Ce lien n'est plus valide : il expire après une heure ou après une première utilisation.
            Demandes-en un nouveau depuis la page de connexion.
          </p>
          <a className="gxa-btn gxa-pri" href="/auth?mode=forgot">Demander un nouveau lien</a>
        </>
      ) : (
        <>
          <p className="gxa-sub">Choisis un mot de passe d'au moins 8 caractères.</p>
          {error && (
            <div className="gxa-msg gxa-bad" role="alert"><i aria-hidden="true">!</i><p><b>{error}</b></p></div>
          )}
          <form onSubmit={submit} className="gxa-fields">
            <div className="gxa-f">
              <label htmlFor="new-password">Nouveau mot de passe</label>
              <PasswordInput id="new-password" value={password} onChange={setPassword} minLength={8} autoComplete="new-password" placeholder="8 caractères minimum" />
              <div className="gxa-meter" data-s={strength} aria-hidden="true"><i /><i /><i /></div>
              <span className="gxa-hint" aria-live="polite">{STRENGTH_HINT[strength]}</span>
            </div>
            <div className="gxa-f">
              <label htmlFor="confirm-password">Confirme le mot de passe</label>
              <PasswordInput
                id="confirm-password" value={confirm} onChange={setConfirm} minLength={8} autoComplete="new-password"
                invalid={confirm.length > 0 && confirm !== password}
              />
            </div>
            <button type="submit" className="gxa-btn gxa-pri" disabled={loading}>
              {loading && <Loader2 className="gxa-spin" aria-hidden="true" />}
              Enregistrer le nouveau mot de passe
            </button>
          </form>
        </>
      )}
    </AuthShell>
  );
}
