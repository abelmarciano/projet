import { useEffect, useState } from "react";
import { Check, Loader2 } from "lucide-react";

/** Éléments partagés entre l'historique des lots et l'écran d'un lot. */

export const CATEGORY_LABELS: Record<string, string> = {
  ecommerce: "E-commerce",
  local_service: "Service local",
  coaching: "Coaching / formation",
  b2b_saas: "Logiciel B2B",
  real_estate: "Immobilier",
  hospitality: "Restauration & hôtellerie",
  generic: "Autre activité",
};

export const STEP_LABELS = ["Source", "Plan", "Aperçus", "Grille"] as const;

/** Étape atteinte (1 à 4) déduite du statut du lot. */
export function stepFromStatus(status?: string | null): number {
  switch (status) {
    case "planning":
    case "planned":
      return 2;
    case "previewing":
      return 3;
    case "declining":
    case "done":
      return 4;
    default:
      return 1;
  }
}

/** Pastilles d'étapes d'un lot (maquette : .gx-ms). */
export function MiniStepper({
  step,
  failed,
  error,
  complete,
}: {
  step: number;
  failed?: boolean;
  error?: string | null;
  /** false : l'étape en cours n'est pas encore terminée (non cochée). Par défaut, toute étape atteinte est cochée. */
  complete?: boolean;
}) {
  return (
    <div className="gx-ms">
      {STEP_LABELS.map((label, i) => {
        const index = i + 1;
        const isFailedStep = !!failed && index === step;
        const done = !isFailedStep && (index < step || (index === step && complete !== false));
        return (
          <i
            key={label}
            className={isFailedStep ? "gx-fail" : done ? "gx-done" : undefined}
            title={isFailedStep ? (error ?? "Échec à cette étape") : undefined}
          >
            {label}
          </i>
        );
      })}
    </div>
  );
}

// -------------------------------------------------- indicateur de chargement --

function fmtDuration(s: number) {
  const m = Math.floor(s / 60);
  const r = s % 60;
  return m > 0 ? `${m} min ${String(r).padStart(2, "0")}s` : `${r}s`;
}

export function LoadingSteps({ steps, eta }: { steps: string[]; eta: number }) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    setElapsed(0);
    const t = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [steps]);

  const ratio = Math.min(elapsed / eta, 1);
  const step = Math.min(Math.floor(ratio * steps.length), steps.length - 1);
  const remaining = Math.max(eta - elapsed, 0);
  const late = elapsed > eta;

  return (
    <div className="gx-loadst">
      <ol className="gx-lsteps">
        {steps.map((label, i) => (
          <li key={label} className={i < step ? "gx-done" : i === step ? "gx-on" : undefined}>
            {i < step ? <Check className="gx-i" /> : <Loader2 className="gx-i" />}
            {label}
          </li>
        ))}
      </ol>

      <div className="gx-bar">
        <i style={{ width: `${Math.max(4, Math.round((late ? 0.96 : ratio) * 100))}%` }} />
      </div>

      <p className="gx-hint gx-num">
        {late
          ? `${fmtDuration(elapsed)} écoulées — c'est plus long que prévu, ça continue…`
          : `${fmtDuration(elapsed)} écoulées — environ ${fmtDuration(remaining)} restantes`}
      </p>
    </div>
  );
}
