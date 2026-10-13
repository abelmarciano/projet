import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Mail, Send } from "lucide-react";
import { getAdminAlertSettings, updateAdminAlertSettings, sendTestAdminAlert } from "@/lib/admin/insights.functions";
import type { AlertKind } from "@/lib/admin/insights.types";
import { fmtDateTime } from "@/components/admin/adminFormat";

const KINDS: { key: AlertKind; label: string; hint: string }[] = [
  { key: "pending_stuck", label: "Génération bloquée", hint: "En attente depuis plus d'1 h" },
  { key: "failure_spike", label: "Pic d'échecs", hint: "Au moins 5 échecs en 24 h, deux fois plus que la veille" },
  { key: "provider_error", label: "Fournisseur en panne", hint: "Solde fal.ai épuisé ou fournisseur indisponible" },
  { key: "new_signup", label: "Nouveau client", hint: "À chaque inscription" },
  { key: "plan_change", label: "Changement de plan", hint: "Montée, baisse ou résiliation" },
  { key: "at_risk", label: "Client en risque", hint: "Résumé une fois par jour" },
];

/** Réglages des alertes envoyées hors de l'app (e-mail, Slack). Réservé aux super-admins pour la modification. */
export function AlertSettingsCard({ isSuper }: { isSuper: boolean }) {
  const qc = useQueryClient();
  const fetchSettings = useServerFn(getAdminAlertSettings);
  const update = useServerFn(updateAdminAlertSettings);
  const sendTest = useServerFn(sendTestAdminAlert);
  const { data, isLoading } = useQuery({ queryKey: ["admin-alert-settings"], queryFn: () => fetchSettings(), staleTime: 60_000 });

  const [emailEnabled, setEmailEnabled] = useState(false);
  const [kinds, setKinds] = useState<AlertKind[]>([]);
  const [slackEnabled, setSlackEnabled] = useState(false);
  const [slackUrl, setSlackUrl] = useState("");
  const [busy, setBusy] = useState<"save" | "email" | "slack" | null>(null);

  useEffect(() => {
    if (!data) return;
    setEmailEnabled(data.emailEnabled);
    setKinds(data.emailKinds);
    setSlackEnabled(data.slackEnabled);
  }, [data]);

  if (isLoading || !data) return <section className="ad-card"><div className="ad-loading"><Loader2 className="ad-i ad-spin" aria-label="Chargement" /></div></section>;

  const dirty = emailEnabled !== data.emailEnabled || slackEnabled !== data.slackEnabled || slackUrl.trim() !== ""
    || kinds.length !== data.emailKinds.length || kinds.some((k) => !data.emailKinds.includes(k));
  const slackUrlOk = !slackUrl.trim() || /^https:\/\/hooks\.slack\.com\/services\//.test(slackUrl.trim());

  const save = async () => {
    if (!slackUrlOk) { toast.error("L'adresse Slack doit commencer par https://hooks.slack.com/services/"); return; }
    setBusy("save");
    try {
      await update({ data: { emailEnabled, emailKinds: kinds, slackEnabled, slackWebhookUrl: slackUrl.trim() || null } });
      setSlackUrl("");
      toast.success("Réglages des alertes enregistrés");
      await qc.invalidateQueries({ queryKey: ["admin-alert-settings"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Enregistrement impossible");
    } finally { setBusy(null); }
  };
  const test = async (channel: "email" | "slack") => {
    setBusy(channel);
    try {
      await sendTest({ data: { channel } });
      toast.success(channel === "email" ? "E-mail de test envoyé aux admins" : "Message de test envoyé sur Slack");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Envoi impossible");
    } finally { setBusy(null); }
  };
  const toggleKind = (k: AlertKind) => setKinds((s) => (s.includes(k) ? s.filter((x) => x !== k) : [...s, k]));

  return (
    <section className="ad-card">
      <div className="ad-ch">
        <div>
          <h2>Être prévenu hors de l'app</h2>
          <small>Les alertes importantes arrivent aussi par e-mail (et sur Slack si tu l'utilises), même quand personne n'est connecté. Une même alerte n'est envoyée qu'une fois.</small>
        </div>
      </div>
      <div className="ad-cb" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <label className="ad-switchrow">
          <input type="checkbox" checked={emailEnabled} disabled={!isSuper} onChange={(e) => setEmailEnabled(e.target.checked)} />
          <span><b>Par e-mail</b><small>{data.recipients.length ? `Envoyé à : ${data.recipients.join(", ")}` : "Aucun compte admin avec une adresse e-mail"}</small></span>
        </label>

        <fieldset className="ad-kinds" disabled={!isSuper || !emailEnabled}>
          <legend>Alertes envoyées</legend>
          {KINDS.map((k) => (
            <label key={k.key} className="ad-kind">
              <input type="checkbox" checked={kinds.includes(k.key)} onChange={() => toggleKind(k.key)} />
              <span><b>{k.label}</b><small>{k.hint}</small></span>
            </label>
          ))}
        </fieldset>

        <label className="ad-switchrow">
          <input type="checkbox" checked={slackEnabled} disabled={!isSuper} onChange={(e) => setSlackEnabled(e.target.checked)} />
          <span><b>Sur Slack</b><small>{data.slackConfigured ? "Une adresse Slack est enregistrée." : "Facultatif. Colle l'adresse d'un webhook entrant Slack."}</small></span>
        </label>
        {slackEnabled && isSuper && (
          <label className="ad-inp" style={{ maxWidth: 560 }}>
            <input value={slackUrl} onChange={(e) => setSlackUrl(e.target.value)} placeholder={data.slackConfigured ? "Laisser vide pour garder l'adresse actuelle" : "https://hooks.slack.com/services/…"} aria-label="Adresse du webhook Slack" aria-invalid={!slackUrlOk} />
          </label>
        )}

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          {isSuper && (
            <button type="button" className="ad-btn pri" disabled={!dirty || busy !== null} onClick={save}>
              {busy === "save" && <Loader2 className="ad-i ad-spin" aria-hidden />}Enregistrer
            </button>
          )}
          <button type="button" className="ad-btn" disabled={!data.emailEnabled || busy !== null} onClick={() => test("email")}>
            {busy === "email" ? <Loader2 className="ad-i ad-spin" aria-hidden /> : <Mail className="ad-i" aria-hidden />}Tester l'e-mail
          </button>
          {data.slackConfigured && (
            <button type="button" className="ad-btn" disabled={!data.slackEnabled || busy !== null} onClick={() => test("slack")}>
              {busy === "slack" ? <Loader2 className="ad-i ad-spin" aria-hidden /> : <Send className="ad-i" aria-hidden />}Tester Slack
            </button>
          )}
          <span className="ad-muted" style={{ fontSize: 12.5 }}>{data.lastSentAt ? `Dernier envoi : ${fmtDateTime(data.lastSentAt)}` : "Aucun envoi pour l'instant"}</span>
        </div>
        {!isSuper && <span className="ad-muted" style={{ fontSize: 12.5 }}>Seul un super-admin peut modifier ces réglages.</span>}
      </div>
    </section>
  );
}
