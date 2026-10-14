import { Loader2 } from "@/components/icons";

/**
 * Chargement unique.
 * - page : zone centrée (premier chargement d'une page) ;
 * - block : encart dans une section ;
 * - inline : texte court dans une ligne ou un bouton.
 */
export function ConsoleLoading({
  label = "Chargement…",
  variant = "block",
}: {
  label?: string;
  variant?: "page" | "block" | "inline";
}) {
  if (variant === "inline") {
    return (
      <span className="gx-load gx-load-inline" role="status" aria-live="polite">
        <Loader2 className="gx-i" aria-hidden />
        <span>{label}</span>
      </span>
    );
  }
  return (
    <div className={variant === "page" ? "gx-load gx-load-page" : "gx-load gx-load-block"} role="status" aria-live="polite">
      <Loader2 className="gx-i" aria-hidden />
      <span>{label}</span>
    </div>
  );
}

/** Squelette unique (fond --gx-sunk qui pulse) : lignes, cartes ou tableau. */
export function ConsoleSkeleton({
  rows = 3,
  variant = "list",
}: {
  rows?: number;
  variant?: "list" | "cards" | "table";
}) {
  const n = Math.max(1, rows);
  const items = Array.from({ length: n }, (_, i) => i);
  if (variant === "cards") {
    return (
      <div className="gx-skl gx-skl-cards" aria-busy="true" aria-label="Chargement…">
        {items.map((i) => (
          <div key={i} className="gx-skl-card">
            <div className="gx-skel gx-skel-prev" />
            <div className="gx-skel gx-skel-line" style={{ width: "72%" }} />
            <div className="gx-skel gx-skel-line" style={{ width: "44%" }} />
          </div>
        ))}
      </div>
    );
  }
  if (variant === "table") {
    return (
      <div className="gx-skl gx-skl-table" aria-busy="true" aria-label="Chargement…">
        <div className="gx-skl-tr gx-skl-th">
          <div className="gx-skel" />
          <div className="gx-skel" />
          <div className="gx-skel" />
          <div className="gx-skel" />
        </div>
        {items.map((i) => (
          <div key={i} className="gx-skl-tr">
            <div className="gx-skel" />
            <div className="gx-skel" />
            <div className="gx-skel" />
            <div className="gx-skel" />
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="gx-skl gx-skl-list" aria-busy="true" aria-label="Chargement…">
      {items.map((i) => (
        <div key={i} className="gx-skel-lead">
          <div className="gx-skel gx-skel-av" />
          <div>
            <div className="gx-skel gx-skel-line" style={{ width: i % 2 ? "52%" : "68%" }} />
            <div className="gx-skel gx-skel-line" style={{ width: "34%" }} />
          </div>
        </div>
      ))}
    </div>
  );
}
