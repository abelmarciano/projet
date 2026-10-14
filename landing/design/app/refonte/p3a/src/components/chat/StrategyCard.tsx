import { Target, Users, Flame, Lightbulb, Quote, ShieldCheck, Sparkles, CheckCircle2 } from "@/components/icons";

type StrategyLike = {
  objective?: unknown;
  audience?: unknown;
  pain?: unknown;
  angle?: unknown;
  hooks?: unknown;
  proof?: unknown;
  objection?: unknown;
  promise?: unknown;
  cta?: unknown;
  notes?: unknown;
};

const str = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : null);

function Row({ icon: Icon, label, value }: { icon: typeof Target; label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div className="gx-scard-r">
      <Icon className="gx-i" aria-hidden />
      <div className="gx-scard-v">
        <span className="gx-lbl">{label}</span>
        <p>{value}</p>
      </div>
    </div>
  );
}

/**
 * Carte stratégie : le client voit la décision créative elle-même
 * (angle, accroches, preuve, objection) et peut la valider ou la contester.
 */
export function StrategyCard({
  output,
  validated,
  onSubmit,
}: {
  output?: Record<string, unknown>;
  validated?: boolean;
  onSubmit?: (text: string) => void;
}) {
  const raw = (output?.strategy ?? output) as StrategyLike | undefined;
  if (!raw || typeof raw !== "object") return null;

  const hooks = Array.isArray(raw.hooks)
    ? (raw.hooks as unknown[]).filter((h): h is string => typeof h === "string" && h.trim().length > 0)
    : [];
  const angle = str(raw.angle);
  if (!angle && hooks.length === 0) return null;

  return (
    <div className="gx-kard gx-scard">
      <div className="gx-scard-h">
        <b><Sparkles className="gx-i" aria-hidden />Stratégie créative</b>
        <span className={`gx-st ${validated ? "gx-on" : "gx-q"}`}>
          {validated ? "Validée" : "Proposition"}
        </span>
      </div>

      <div className="gx-scard-b">
        <Row icon={Target} label="Objectif" value={str(raw.objective)} />
        <Row icon={Users} label="Cible" value={str(raw.audience)} />
        <Row icon={Flame} label="Douleur" value={str(raw.pain)} />
        <Row icon={Lightbulb} label="Angle" value={angle} />
        {hooks.length > 0 && (
          <div className="gx-scard-r">
            <Quote className="gx-i" aria-hidden />
            <div className="gx-scard-v">
              <span className="gx-lbl">Accroches</span>
              <ul>
                {hooks.map((h, i) => (
                  <li key={i}>
                    « {h} »
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
        <Row icon={ShieldCheck} label="Preuve" value={str(raw.proof)} />
        <Row icon={ShieldCheck} label="Objection à lever" value={str(raw.objection)} />
        <Row icon={CheckCircle2} label="Promesse" value={str(raw.promise)} />
        <Row icon={CheckCircle2} label="Appel à l'action" value={str(raw.cta)} />
      </div>

      {!validated && onSubmit && (
        <div className="gx-kf">
          <button type="button" className="gx-btn gx-sm gx-pri" onClick={() => onSubmit("Je valide cette stratégie, on passe à la création.")}>
            <CheckCircle2 className="gx-i" />
            Valider la stratégie
          </button>
          <button type="button" className="gx-btn gx-sm" onClick={() => onSubmit("Propose-moi un autre angle.")}>
            Autre angle
          </button>
          <button type="button" className="gx-btn gx-sm" onClick={() => onSubmit("Donne-moi d'autres accroches.")}>
            Autres accroches
          </button>
        </div>
      )}
    </div>
  );
}
