import { frError } from "@/lib/error-fr";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { Loader2, ArrowRight, ArrowLeft, Upload, X, AlertCircle, ImagePlus } from "@/components/icons";
import { toast } from "sonner";
import { PhoneInput, toE164, parseE164 } from "@/components/PhoneInput";
import { getOnboardingStatus, completeOnboarding } from "@/lib/onboarding.functions";
import { Logo } from "@/components/Logo";
import { ConsoleLoading } from "@/components/console/ConsoleLoading";

export const Route = createFileRoute("/_authenticated/onboarding")({
  head: () => ({ meta: [{ title: "Bienvenue - growthity.ai" }] }),
  component: OnboardingPage,
});

const TOTAL_STEPS = 4;
const STEP_LABELS = ["Espace", "Téléphone", "Marque", "Profil"] as const;

const SIGNUP_SOURCES = [
  "Google / recherche", "Instagram", "TikTok", "Facebook", "YouTube",
  "LinkedIn", "Bouche-à-oreille", "Influenceur / créateur", "Publicité", "Autre",
];
const COMPANY_TYPES = ["E-commerce", "Agence", "Freelance / créateur", "Business local", "SaaS / app", "Autre"];
const TEAM_SIZES = ["Je suis seul(e)", "2-5", "6-20", "21-50", "50+"];
const BUDGET_RANGES = ["Moins de 500 €", "500 - 2 000 €", "2 000 - 10 000 €", "10 000 - 50 000 €", "Plus de 50 000 €"];
const MAIN_GOALS = ["Générer des leads", "Vendre plus (e-commerce)", "Créer des vidéos publicitaires", "Gérer les campagnes de mes clients", "Faire connaître ma marque"];

/** Groupe de pastilles à choix unique (étape 4). */
function ChipGroup({ label, options, value, onChange }: {
  label: string; options: string[]; value: string; onChange: (v: string) => void;
}) {
  return (
    <div className="gx-solo-f" role="group" aria-label={label}>
      <span className="gx-solo-fl">{label}</span>
      <div className="gx-solo-chips">
        {options.map((s) => (
          <button key={s} type="button" onClick={() => onChange(s)} aria-pressed={value === s}
            className={`gx-chip ${value === s ? "gx-on" : ""}`}>
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

function OnboardingPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const fetchStatus = useServerFn(getOnboardingStatus);
  const submit = useServerFn(completeOnboarding);
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Step 1 - workspace
  const [workspaceName, setWorkspaceName] = useState("");

  // Step 2 - phone
  const [country, setCountry] = useState("FR");
  const [national, setNational] = useState("");

  // Step 3 - brand (optional)
  const [brandName, setBrandName] = useState("");
  const [brandWebsite, setBrandWebsite] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Step 4 - profil (infos SaaS classiques, visibles côté admin)
  const [skipBrand, setSkipBrand] = useState(false);
  const [signupSource, setSignupSource] = useState("");
  const [signupSourceDetail, setSignupSourceDetail] = useState("");
  const [companyType, setCompanyType] = useState("");
  const [teamSize, setTeamSize] = useState("");
  const [adBudgetRange, setAdBudgetRange] = useState("");
  const [mainGoal, setMainGoal] = useState("");

  useEffect(() => {
    fetchStatus().then((s) => {
      if (s.onboarded) { router.navigate({ to: "/create" }); return; }
      if (s.phoneE164) {
        const parsed = parseE164(s.phoneE164, s.phoneCountry);
        setCountry(parsed.country); setNational(parsed.national);
      } else {
        setCountry(s.phoneCountry || "FR");
      }
      const base = s.displayName || s.email.split("@")[0];
      setWorkspaceName(`Espace de ${base}`);
    }).finally(() => setLoading(false));
  }, [fetchStatus, router]);

  const pickLogo = (f: File | null) => {
    setLogoFile(f);
    if (!f) { setLogoPreview(null); return; }
    if (f.size > 3 * 1024 * 1024) { toast.error("Logo trop lourd (max 3 Mo)"); return; }
    const url = URL.createObjectURL(f);
    setLogoPreview(url);
  };

  const nextFromStep1 = () => {
    if (!workspaceName.trim()) { toast.error("Donne un nom à ton espace de travail"); return; }
    setStep(2);
  };

  const nextFromStep2 = () => {
    const e164 = toE164(country, national);
    if (!e164) { toast.error("Numéro de téléphone invalide"); return; }
    setStep(3);
  };

  const goToStep4 = (skip: boolean) => {
    setSkipBrand(skip);
    setStep(4);
  };

  const finish = async () => {
    const e164 = toE164(country, national);
    if (!e164) { toast.error("Numéro invalide"); setStep(2); return; }
    if (!workspaceName.trim()) { toast.error("Nom de l'espace de travail requis"); setStep(1); return; }

    setSaving(true);
    setSubmitError(null);
    try {
      let brandPayload: {
        name: string; website: string | null;
        logo: { base64: string; contentType: string; fileName: string } | null;
      } | null = null;

      if (!skipBrand && brandName.trim()) {
        let logoData: { base64: string; contentType: string; fileName: string } | null = null;
        if (logoFile) {
          const buf = await logoFile.arrayBuffer();
          const bytes = new Uint8Array(buf);
          let bin = ""; for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
          logoData = { base64: btoa(bin), contentType: logoFile.type || "image/png", fileName: logoFile.name };
        }
        brandPayload = {
          name: brandName.trim(),
          website: brandWebsite.trim() || null,
          logo: logoData,
        };
      }

      await submit({ data: {
        phoneE164: e164, phoneCountry: country,
        workspaceName: workspaceName.trim(),
        brand: brandPayload,
        profile: {
          signupSource: signupSource || null,
          signupSourceDetail: signupSourceDetail.trim() || null,
          companyType: companyType || null,
          teamSize: teamSize || null,
          adBudgetRange: adBudgetRange || null,
          mainGoal: mainGoal || null,
        },
      } });
      // Invalidate cached onboarding-status so the layout doesn't bounce us back here.
      await qc.invalidateQueries({ queryKey: ["onboarding-status"] });
      qc.setQueryData(["onboarding-status"], (prev: unknown) => {
        const p = (prev as Record<string, unknown> | undefined) ?? {};
        return { ...p, onboarded: true };
      });
      toast.success("Tout est prêt !");
      router.navigate({ to: "/souscription" });
    } catch (e) {
      const msg = frError(e);
      setSubmitError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="gx-solo gx-solo-center">
      <ConsoleLoading variant="page" />
    </div>
  );

  return (
    <div className="gx-solo">
      <header className="gx-solo-top">
        <Logo variant="full" className="gx-solo-logo" />
        <div className="gx-solo-top-r">
          <span className="gx-solo-count">Étape {step} sur {TOTAL_STEPS}</span>
        </div>
      </header>

      <main className="gx-solo-main">
        <div className="gx-solo-narrow">
          <div className="gx-solo-card">
            {/* Progression */}
            <ol className="gx-solo-steps" aria-label={`Étape ${step} sur ${TOTAL_STEPS} : ${STEP_LABELS[step - 1]}`}>
              {STEP_LABELS.map((l, i) => {
                const n = i + 1;
                return (
                  <li key={l} className={n === step ? "gx-on" : n < step ? "gx-done" : undefined} aria-current={n === step ? "step" : undefined}>
                    <i />
                    <span>{l}</span>
                  </li>
                );
              })}
            </ol>

            {step === 1 && (
              <>
                <h1 className="gx-solo-h1">Bienvenue sur Growthity</h1>
                <p className="gx-solo-lead">
                  Crée ton espace de travail : c'est là que tu regroupes tes marques, tes campagnes et les membres de ton équipe.
                </p>
                <div className="gx-solo-fields">
                  <div className="gx-solo-f">
                    <label htmlFor="ws">Nom de l'espace de travail</label>
                    <input id="ws" className="gx-in" autoFocus value={workspaceName} onChange={(e) => setWorkspaceName(e.target.value)}
                      placeholder="Ex : Mon agence, Studio Marciano…" />
                    <p className="gx-solo-hint">Tu pourras en créer d'autres plus tard.</p>
                  </div>
                </div>
                <div className="gx-solo-actions">
                  <button type="button" onClick={nextFromStep1} className="gx-btn gx-pri gx-solo-push">
                    Continuer <ArrowRight className="gx-i" />
                  </button>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <h1 className="gx-solo-h1">Ton numéro</h1>
                <p className="gx-solo-lead">
                  Pour sécuriser ton compte et débloquer les intégrations (Meta Ads, WhatsApp…).
                </p>
                <div className="gx-solo-fields">
                  <div className="gx-solo-f">
                    <span className="gx-solo-fl">Numéro de téléphone</span>
                    <div className="gx-solo-phone">
                      <PhoneInput
                        country={country} onCountryChange={setCountry}
                        nationalNumber={national} onNationalNumberChange={setNational}
                      />
                    </div>
                    <p className="gx-solo-hint">Nous ne partageons jamais ton numéro.</p>
                  </div>
                </div>
                <div className="gx-solo-actions">
                  <button type="button" onClick={() => setStep(1)} className="gx-btn">
                    <ArrowLeft className="gx-i" /> Retour
                  </button>
                  <button type="button" onClick={nextFromStep2} className="gx-btn gx-pri gx-solo-push">
                    Continuer <ArrowRight className="gx-i" />
                  </button>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <span className="gx-solo-eyebrow">Facultatif</span>
                <h1 className="gx-solo-h1">Ta première marque</h1>
                <p className="gx-solo-lead">
                  Une marque, c'est un client ou une entreprise pour laquelle tu crées des pubs. Le chat s'en servira comme contexte.
                </p>

                <div className="gx-solo-fields">
                  <div className="gx-solo-f">
                    <label htmlFor="ob-brand">Nom de la marque</label>
                    <input id="ob-brand" className="gx-in" value={brandName} onChange={(e) => setBrandName(e.target.value)}
                      placeholder="Ex : Leadeurs, Nike, Ma boutique…" />
                  </div>
                  <div className="gx-solo-f">
                    <label htmlFor="ob-site">Site web <small>facultatif</small></label>
                    <input id="ob-site" className="gx-in" value={brandWebsite} onChange={(e) => setBrandWebsite(e.target.value)}
                      placeholder="exemple.fr" />
                  </div>
                  <div className="gx-solo-f">
                    <span className="gx-solo-fl">Logo <small>facultatif</small></span>
                    <div className="gx-solo-logo-pick">
                      <div className="gx-solo-logo-box">
                        {logoPreview
                          ? <img src={logoPreview} alt="" />
                          : <ImagePlus className="gx-i" />}
                      </div>
                      <button type="button" className="gx-btn gx-sm" onClick={() => fileRef.current?.click()}>
                        <Upload className="gx-i" /> Choisir
                      </button>
                      {logoFile && (
                        <button type="button" className="gx-btn gx-sm gx-ghost" onClick={() => pickLogo(null)} aria-label="Retirer le logo">
                          <X className="gx-i" />
                        </button>
                      )}
                      <input ref={fileRef} type="file" accept="image/*" hidden
                        onChange={(e) => { const f = e.target.files?.[0] ?? null; pickLogo(f); e.target.value = ""; }} />
                    </div>
                  </div>
                </div>

                {submitError && (
                  <div className="gx-solo-err" role="alert">
                    <AlertCircle className="gx-i" />
                    <div>
                      <b>La création a échoué</b>
                      <small>{submitError}</small>
                    </div>
                    <button type="button" className="gx-btn gx-sm" onClick={() => finish()} disabled={saving}>
                      Réessayer
                    </button>
                  </div>
                )}

                <div className="gx-solo-actions">
                  <button type="button" onClick={() => setStep(2)} disabled={saving} className="gx-btn">
                    <ArrowLeft className="gx-i" /> Retour
                  </button>
                  <button type="button" onClick={() => goToStep4(true)} disabled={saving} className="gx-btn gx-ghost">
                    Passer
                  </button>
                  <button type="button" onClick={() => goToStep4(false)} disabled={saving || !brandName.trim()}
                    className="gx-btn gx-pri gx-solo-push">
                    Continuer <ArrowRight className="gx-i" />
                  </button>
                </div>
              </>
            )}

            {step === 4 && (
              <>
                <h1 className="gx-solo-h1">Dernière étape</h1>
                <p className="gx-solo-lead">
                  Quelques infos pour adapter Growthity à ton activité. Ça prend 20 secondes.
                </p>

                <div className="gx-solo-fields">
                  <div className="gx-solo-f">
                    <ChipGroup label="Comment nous as-tu connus ?" options={SIGNUP_SOURCES} value={signupSource} onChange={setSignupSource} />
                    {signupSource === "Autre" && (
                      <input className="gx-in" value={signupSourceDetail} onChange={(e) => setSignupSourceDetail(e.target.value)}
                        placeholder="Précise…" aria-label="Précise comment tu nous as connus" />
                    )}
                  </div>
                  <ChipGroup label="Ton activité" options={COMPANY_TYPES} value={companyType} onChange={setCompanyType} />
                  <ChipGroup label="Taille de l'équipe" options={TEAM_SIZES} value={teamSize} onChange={setTeamSize} />
                  <ChipGroup label="Budget publicitaire mensuel" options={BUDGET_RANGES} value={adBudgetRange} onChange={setAdBudgetRange} />
                  <ChipGroup label="Ton objectif principal" options={MAIN_GOALS} value={mainGoal} onChange={setMainGoal} />
                </div>

                {submitError && (
                  <div className="gx-solo-err" role="alert">
                    <AlertCircle className="gx-i" />
                    <div>
                      <b>La création a échoué</b>
                      <small>{submitError}</small>
                    </div>
                  </div>
                )}

                <div className="gx-solo-actions">
                  <button type="button" onClick={() => setStep(3)} disabled={saving} className="gx-btn">
                    <ArrowLeft className="gx-i" /> Retour
                  </button>
                  <button type="button" onClick={() => finish()} disabled={saving}
                    className="gx-btn gx-pri gx-solo-push">
                    {saving ? <Loader2 className="gx-i animate-spin" /> : null}
                    Terminer
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
