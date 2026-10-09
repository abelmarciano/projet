import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { parsePhoneNumberFromString, type CountryCode } from "libphonenumber-js";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useAppLanguage } from "@/lib/app-language";
import { supabase } from "@/integrations/supabase/client";
import { getMyProfile, updateMyProfile, deleteMyAccount } from "@/lib/account.functions";
import { updatePhone } from "@/lib/onboarding.functions";

export const Route = createFileRoute("/_authenticated/parametres/profil")({
  component: Page,
});

/** Affiche un numéro E.164 au format international lisible (+33 6 12 34 56 78). */
function formatPhone(e164: string | null | undefined) {
  if (!e164) return "";
  try { return parsePhoneNumberFromString(e164)?.formatInternational() ?? e164; } catch { return e164; }
}

function Page() {
  const router = useRouter();
  const { language, setLanguage } = useAppLanguage();
  const fetchProfile = useServerFn(getMyProfile);
  const saveProfile = useServerFn(updateMyProfile);
  const savePhone = useServerFn(updatePhone);
  const removeAccount = useServerFn(deleteMyAccount);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingPhone, setSavingPhone] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirm, setConfirm] = useState("");
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [savedName, setSavedName] = useState("");
  const [country, setCountry] = useState("FR");
  const [phone, setPhone] = useState("");
  const [savedPhone, setSavedPhone] = useState("");

  useEffect(() => {
    fetchProfile()
      .then(async (p) => {
        if (p) {
          setEmail(p.email ?? "");
          setDisplayName(p.display_name ?? "");
          setSavedName(p.display_name ?? "");
        }
        // Le téléphone est lu directement sur la ligne du profil.
        const { data: user } = await supabase.auth.getUser();
        if (user.user) {
          const { data: full } = await supabase.from("profiles")
            .select("phone_e164, phone_country").eq("id", user.user.id).maybeSingle();
          const f = full as { phone_e164?: string | null; phone_country?: string | null } | null;
          if (f?.phone_country) setCountry(f.phone_country);
          if (f?.phone_e164) {
            const shown = formatPhone(f.phone_e164);
            setPhone(shown); setSavedPhone(shown);
          }
        }
      })
      .catch((e) => toast.error(e instanceof Error ? e.message : "Erreur"))
      .finally(() => setLoading(false));
  }, [fetchProfile]);

  const nameDirty = !loading && displayName.trim() !== savedName.trim();
  const phoneDirty = !loading && phone.trim() !== savedPhone.trim();

  const onSave = async () => {
    setSaving(true);
    try {
      await saveProfile({ data: { display_name: displayName } });
      setSavedName(displayName.trim());
      toast.success("Profil mis à jour");
    } catch (e) { toast.error(e instanceof Error ? e.message : "Erreur"); }
    finally { setSaving(false); }
  };

  const onSavePhone = async () => {
    let parsed: ReturnType<typeof parsePhoneNumberFromString> | undefined;
    try { parsed = parsePhoneNumberFromString(phone.trim(), (country || "FR") as CountryCode); } catch { parsed = undefined; }
    if (!parsed || !parsed.isValid()) { toast.error("Numéro invalide"); return; }
    const nextCountry = parsed.country ?? country;
    setSavingPhone(true);
    try {
      await savePhone({ data: { phoneE164: parsed.number, phoneCountry: nextCountry } });
      const shown = parsed.formatInternational();
      setCountry(nextCountry); setPhone(shown); setSavedPhone(shown);
      toast.success("Numéro enregistré");
    } catch (e) { toast.error(e instanceof Error ? e.message : "Erreur"); }
    finally { setSavingPhone(false); }
  };

  const onDelete = async () => {
    setDeleting(true);
    try {
      await removeAccount();
      await supabase.auth.signOut();
      toast.success("Compte supprimé");
      router.navigate({ to: "/" });
    } catch (e) { toast.error(e instanceof Error ? e.message : "Erreur"); setDeleting(false); }
  };

  return (
    <div className="gx-box gx-form">
      <div className="gx-fr">
        <label htmlFor="pName">Nom affiché</label>
        <input
          className="gx-in" id="pName" value={displayName} disabled={loading}
          placeholder={loading ? "Chargement…" : "Ton nom"}
          title={email ? `Compte : ${email}` : undefined}
          onChange={(e) => setDisplayName(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && nameDirty) void onSave(); }}
        />
        {nameDirty && (
          <button type="button" className="gx-btn gx-sm gx-pri" onClick={() => void onSave()} disabled={saving || !displayName.trim()}>
            {saving ? "Enregistrement…" : "Enregistrer"}
          </button>
        )}
      </div>

      <div className="gx-fr">
        <label htmlFor="pTel">Téléphone</label>
        <input
          className="gx-in" id="pTel" type="tel" inputMode="tel" autoComplete="tel" value={phone} disabled={loading}
          placeholder={loading ? "Chargement…" : "+33 6 12 34 56 78"}
          onChange={(e) => setPhone(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && phoneDirty) void onSavePhone(); }}
        />
        {phoneDirty && (
          <button type="button" className="gx-btn gx-sm gx-pri" onClick={() => void onSavePhone()} disabled={savingPhone || !phone.trim()}>
            {savingPhone ? "Enregistrement…" : "Enregistrer"}
          </button>
        )}
      </div>

      <div className="gx-fr">
        <label id="pLang">Langue de l'interface</label>
        <div className="gx-seg" role="tablist" aria-labelledby="pLang">
          <button type="button" role="tab" aria-selected={language === "fr"} onClick={() => language !== "fr" && setLanguage("fr")}>Français</button>
          <button type="button" role="tab" aria-selected={language === "en"} onClick={() => language !== "en" && setLanguage("en")}>English</button>
        </div>
      </div>

      <div className="gx-fr gx-danger">
        <label>Supprimer mon compte</label>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button type="button" className="gx-btn gx-sm gx-ghost" disabled={loading}>
              <svg className="gx-i" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" /></svg>
              Supprimer…
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent className="console-app-portal">
            <AlertDialogHeader>
              <AlertDialogTitle>Supprimer définitivement ton compte ?</AlertDialogTitle>
              <AlertDialogDescription>
                Cette action est irréversible : toutes tes données seront effacées. Pour confirmer, retape ton adresse e-mail{" "}
                <strong className="text-foreground">{email}</strong>.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <input className="gx-in" autoFocus placeholder={email} value={confirm} onChange={(e) => setConfirm(e.target.value)} aria-label="Ton adresse e-mail" />
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setConfirm("")}>Annuler</AlertDialogCancel>
              <AlertDialogAction
                disabled={confirm.trim().toLowerCase() !== email.trim().toLowerCase() || !email || deleting}
                onClick={(e) => { e.preventDefault(); void onDelete(); }}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {deleting ? "Suppression…" : "Supprimer définitivement"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
