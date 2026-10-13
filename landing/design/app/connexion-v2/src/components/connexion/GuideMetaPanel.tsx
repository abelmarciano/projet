import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";

/*
 * Panneau « guide » de la page Connexion : le second chemin, pour qui n'a pas encore de compte publicitaire.
 * Copie exacte de la maquette validée (landing/design/connexion/connexion.html).
 * Lit la progression du guide gardée sur l'appareil (même clé que src/components/guide-meta/GuideMeta.tsx).
 */

const KEY = "growthity:guide-meta:v2";
const TOTAL = 9;
/** Étapes du guide qui créent chaque élément (index dans le guide). */
const MILESTONES = [
  { label: "Portefeuille", step: 2 },
  { label: "Page Facebook", step: 3 },
  { label: "Compte pub", step: 5 },
  { label: "Paiement", step: 6 },
];

type Progress = { cur: number; done: number[] };

function readProgress(): Progress | null {
  try {
    const s = JSON.parse(localStorage.getItem(KEY) || "null");
    if (s && Array.isArray(s.done) && typeof s.cur === "number") return { cur: s.cur, done: s.done };
  } catch {
    /* stockage indisponible : on affiche le panneau de départ */
  }
  return null;
}

export function GuideMetaPanel({ reason }: { reason: "not-connected" | "no-ad-account" }) {
  const [p, setP] = useState<Progress | null>(null);
  useEffect(() => setP(readProgress()), []);

  const started = Boolean(p && (p.done.length > 0 || p.cur > 0));
  const current = started && p ? Math.min(TOTAL, p.cur + 1) : 0;
  const firstTodo = MILESTONES.findIndex((m) => !p?.done.includes(m.step));
  const pct = started && p ? Math.round((p.done.length / TOTAL) * 100) : 0;

  const title = started
    ? `Ton guide est en cours : étape ${current} sur ${TOTAL}`
    : reason === "no-ad-account"
      ? "Aucun compte publicitaire sur ton profil Facebook"
      : "Pas encore de compte publicitaire Meta ?";
  const text = started
    ? "Reprends là où tu t'es arrêté, puis reviens ici pour connecter Meta."
    : reason === "no-ad-account"
      ? "Crée-le avec le guide, écran par écran, puis reviens ici et clique sur Reconnecter."
      : "On le crée ensemble, écran par écran, même si tu n'as jamais fait de pub.";

  return (
    <div className="gx-cx-guide" id="sans-compte">
      <div className="gx-cx-gtxt">
        <div className="gx-cx-gh">
          <span className="gx-cx-gi" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z" />
              <path d="M4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5" />
            </svg>
          </span>
          <div>
            <b>{title}</b>
            <span>{text}</span>
          </div>
        </div>
        <ol className="gx-cx-path" aria-label="Ce que le guide te fait créer">
          {MILESTONES.map((m, k) => {
            const done = Boolean(p?.done.includes(m.step));
            const cur = started && !done && k === firstTodo;
            return (
              <li key={m.label} className={done ? "gx-done" : cur ? "gx-cur" : undefined}>
                {k > 0 && <span className="gx-cx-arr" aria-hidden="true">→</span>}
                <span className="gx-cx-chip">
                  <i aria-hidden="true">{done ? "✓" : k + 1}</i>
                  {m.label}
                </span>
              </li>
            );
          })}
        </ol>
      </div>
      <div className="gx-cx-gcta">
        {started && (
          <span className="gx-cx-meter" aria-hidden="true"><i style={{ width: `${Math.max(pct, 6)}%` }} /></span>
        )}
        <Link to="/guide-meta" className="gx-btn gx-pri gx-cx-big">
          {started ? "Reprendre le guide →" : "Créer mon compte avec le guide →"}
        </Link>
        <small>9 étapes · environ 25 minutes · gratuit chez Meta</small>
      </div>
    </div>
  );
}
