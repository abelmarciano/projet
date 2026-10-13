import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useNewAdConversation } from "@/hooks/useNewAdConversation";
import { SCREENS, STEPS, term } from "./guide-meta-data";

/*
 * Guide pas à pas pour créer son compte publicitaire Meta.
 * Copie exacte de la maquette validée (landing/design/guide-meta/guide-meta.html),
 * styles dans src/styles/gx-guide-meta.css (tout est sous .gx-gm).
 * Une étape = une phrase, 2-3 actions, au plus une alerte, la capture annotée ; le reste est dans « Besoin d'aide ? ».
 */

const KEY = "growthity:guide-meta:v2";
type Progress = { cur: number; done: number[] };
const LAST = STEPS.length - 1;

function loadProgress(): Progress {
  try {
    const s = JSON.parse(localStorage.getItem(KEY) || "null");
    if (s && Array.isArray(s.done) && typeof s.cur === "number") {
      return { cur: Math.max(0, Math.min(LAST, s.cur)), done: s.done.filter((n: unknown) => typeof n === "number") };
    }
  } catch {
    /* stockage indisponible : on repart de zéro */
  }
  return { cur: 0, done: [] };
}

const host = (u: string) => u.replace(/^https:\/\/(www\.)?/, "").replace(/\/$/, "");
const Html = ({ as: Tag = "span", html, className }: { as?: "span" | "p" | "div"; html: string; className?: string }) => (
  <Tag className={className} dangerouslySetInnerHTML={{ __html: html }} />
);

export function GuideMeta() {
  const [p, setP] = useState<Progress>({ cur: 0, done: [] });
  const loaded = useRef(false);
  const stepperRef = useRef<HTMLElement>(null);
  const { start: startNewChat } = useNewAdConversation();

  // La progression est gardée sur l'appareil (lecture après le rendu serveur).
  useEffect(() => {
    setP(loadProgress());
    loaded.current = true;
  }, []);
  useEffect(() => {
    if (!loaded.current) return;
    try { localStorage.setItem(KEY, JSON.stringify(p)); } catch { /* ignoré */ }
  }, [p]);

  const go = (i: number) => {
    setP((s) => ({ ...s, cur: Math.max(0, Math.min(LAST, i)) }));
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    stepperRef.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "nearest" });
  };
  const markDone = (i: number) => setP((s) => ({ ...s, done: s.done.includes(i) ? s.done : [...s.done, i] }));

  // Flèches gauche / droite pour changer d'étape.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t?.closest("input,textarea,select,summary,[contenteditable=true]") || e.altKey || e.ctrlKey || e.metaKey) return;
      if (e.key === "ArrowRight") go(p.cur + 1);
      else if (e.key === "ArrowLeft") go(p.cur - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [p.cur]);

  // Garde l'étape en cours visible dans la barre d'étapes (mobile).
  useEffect(() => {
    stepperRef.current?.querySelector('[aria-current="step"]')?.scrollIntoView({ block: "nearest", inline: "center" });
  }, [p.cur]);

  const i = p.cur;
  const s = STEPS[i];
  const isDone = p.done.includes(i);
  const missing = STEPS.map((_, k) => k).filter((k) => k !== LAST && !STEPS[k].opt && !p.done.includes(k));
  const hasHelp = Boolean(s.more || s.faq || s.links);

  return (
    <div className="gx-gm">
      <nav className="gm-stepper" ref={stepperRef} aria-label="Étapes du guide">
        {STEPS.map((x, k) => {
          const d = p.done.includes(k);
          return (
            <div key={x.t} className="gm-sp">
              {k > 0 && <span className={p.done.includes(k - 1) ? "gm-sp-l gm-on" : "gm-sp-l"} aria-hidden />}
              <button
                type="button"
                className={d ? "gm-sp-i gm-done" : "gm-sp-i"}
                aria-current={k === i ? "step" : undefined}
                title={x.t}
                onClick={() => go(k)}
              >
                <span className="gm-n">{d ? "✓" : k + 1}</span>
                <span className="gm-lb">{x.k}</span>
              </button>
            </div>
          );
        })}
      </nav>

      <section className="gx-box gm-main" aria-live="polite">
        <div className="gm-txt">
          <div className="gm-hd">
            <span className="gm-num">Étape {i + 1}</span>
            <span>{s.time}{s.opt ? " · facultatif" : ""}</span>
          </div>
          <h2>{s.t}</h2>
          <Html as="p" className="gm-why" html={term(s.why)} />
          {s.need && (
            <p className="gm-have"><b>À avoir sous la main :</b> {s.need.join(" · ")}</p>
          )}
          <ol className="gm-do">
            {s.do.map(([a, b], k) => (
              <li key={k}>
                <span className="gm-k">{k + 1}</span>
                <div>
                  <Html as="p" html={a} />
                  {b && <Html as="span" className="gm-small" html={b} />}
                </div>
              </li>
            ))}
          </ol>

          {s.alert && (
            <div className={`gm-note gm-${s.alert[0]}`}>
              <i aria-hidden>{s.alert[0] === "warn" ? "!" : "i"}</i>
              <Html as="p" html={s.alert[1]} />
            </div>
          )}

          {s.final && isDone && (missing.length > 0 ? (
            <div className="gm-note gm-warn">
              <i aria-hidden>!</i>
              <p>
                Il te manque encore{" "}
                {missing.map((k, n) => (
                  <span key={k}>
                    {n > 0 && ", "}
                    <button type="button" className="gm-jump" onClick={() => go(k)}>l'étape {k + 1}</button>
                  </span>
                ))}{" "}
                avant de publier.
              </p>
            </div>
          ) : (
            <div className="gm-done-b">
              <h3>C'est prêt.</h3>
              <p>Ton compte Meta est en place. Décris ta première pub dans le Chat : Growthity la crée et la publie pour toi.</p>
            </div>
          ))}

          {hasHelp && (
            <details className="gm-aid" key={i}>
              <summary>Besoin d'aide ?</summary>
              {s.more && (
                <div className="gm-hb">
                  <p className="gm-sec-t">Bon à savoir</p>
                  {s.more.map((x) => <Html key={x} as="p" html={x} />)}
                </div>
              )}
              {s.faq && (
                <div className="gm-hb">
                  <p className="gm-sec-t">Problèmes fréquents</p>
                  {s.faq.map(([q, a]) => (
                    <div key={q} className="gm-qa"><b>{q}</b><Html as="p" html={a} /></div>
                  ))}
                </div>
              )}
              {s.links && (
                <div className="gm-hb">
                  <p className="gm-sec-t">Liens utiles</p>
                  <div className="gm-links">
                    {s.links.map(([l, u]) => (
                      <a key={u} className="gm-lrow" href={u} target="_blank" rel="noopener noreferrer">
                        <span className="gm-li" aria-hidden>↗</span>
                        <span><b>{l}</b><small>{host(u)}</small></span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
              <div className="gm-hb">
                <p className="gm-hint">
                  Toujours bloqué ? <Link to="/aide">Écris-nous depuis Aide</Link> avec une capture d'écran. On répond sous 24 h.
                </p>
              </div>
            </details>
          )}
        </div>

        <div className="gm-shotw">
          <div className="gm-shot" aria-label="Capture d'écran annotée">
            <div className="gm-chrome">
              <i /><i /><i />
              {s.final ? (
                <span>{s.url}</span>
              ) : (
                <a href={`https://${s.url}`} target="_blank" rel="noopener noreferrer" title="Ouvrir cette page chez Meta">{s.url}</a>
              )}
            </div>
            <Html as="div" html={SCREENS[s.scr]()} />
          </div>
        </div>

        <div className="gm-foot">
          <button type="button" className="gx-btn gx-ghost gm-prev" disabled={i === 0} onClick={() => go(i - 1)}>← Précédent</button>
          <span className="gx-sp" />
          {s.opt && !isDone && (
            <button type="button" className="gx-btn" onClick={() => go(i + 1)}>Passer cette étape</button>
          )}
          {s.final && isDone && missing.length === 0 ? (
            <button type="button" className="gx-btn gx-pri gm-grad" onClick={() => void startNewChat()}>Créer ma première pub →</button>
          ) : s.final ? (
            <>
              <Link to="/connexions" className="gx-btn">Aller à Connexion</Link>
              <button type="button" className="gx-btn gx-pri" onClick={() => markDone(i)}>C'est fait ✓</button>
            </>
          ) : (
            <button type="button" className="gx-btn gx-pri" onClick={() => { markDone(i); go(i + 1); }}>
              {isDone ? "Étape suivante →" : "C'est fait, étape suivante →"}
            </button>
          )}
        </div>
      </section>

      <p className="gm-cap">
        Écrans reproduits pour le guide : l'interface Meta peut légèrement changer. Clique sur l'adresse d'un écran pour ouvrir la vraie page.
      </p>
    </div>
  );
}
