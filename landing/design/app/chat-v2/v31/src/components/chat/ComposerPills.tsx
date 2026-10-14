import { Plus, X } from "@/components/icons";

export type ComposerPillActor = { name: string; gender: "female" | "male" | null };
export type ComposerPillProduct = { id: string; name: string; price?: string | null; image?: string | null };

/** Silhouette femme (cheveux longs) : même tracé que la maquette validée. */
function FemaleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 21c.5-3.5 3-5.5 6-5.5s5.5 2 6 5.5" />
      <path d="M7.5 11c-1 2.5-.5 4.5.5 5M16.5 11c1 2.5.5 4.5-.5 5" />
      <circle cx="12" cy="9" r="3.5" />
      <path d="M7.5 11c0-5 2-7 4.5-7s4.5 2 4.5 7" />
    </svg>
  );
}

/** Silhouette homme (cheveux courts). */
function MaleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 21c.8-3.8 3.6-5.5 7-5.5s6.2 1.7 7 5.5" />
      <circle cx="12" cy="9" r="3.8" />
      <path d="M8.2 8.2c.6-2.4 2-3.4 3.8-3.4s3.4 1 3.8 3.4" />
    </svg>
  );
}

function AddPill({ label, disabled, onClick }: { label: string; disabled?: boolean; onClick: () => void }) {
  return (
    <button type="button" className="gx-cadd" disabled={disabled} onClick={onClick}>
      <span className="gx-cadd-pl" aria-hidden><Plus className="gx-i" /></span>
      {label}
    </button>
  );
}

/**
 * Pastilles Acteur et Produits de la barre de saisie du Chat.
 * - Acteur choisi : icône femme (rose) ou homme (bleu) + prénom ; sinon « Ajouter un acteur ».
 * - Un produit : vignette + nom + prix. Plusieurs : vignettes empilées + « N produits »,
 *   pour que la barre reste lisible même avec 10 produits. Aucun : « Ajouter un produit ».
 * Un clic sur une pastille rouvre la grande fenêtre de choix ; la croix retire.
 */
export function ComposerPills({
  actor,
  products,
  disabled,
  onOpenActor,
  onClearActor,
  onOpenProducts,
  onClearProducts,
}: {
  actor: ComposerPillActor | null;
  products: ComposerPillProduct[];
  disabled?: boolean;
  onOpenActor: () => void;
  onClearActor?: () => void;
  onOpenProducts: () => void;
  onClearProducts?: () => void;
}) {
  const one = products.length === 1 ? products[0] : null;
  return (
    <>
      {actor ? (
        <span className="gx-cpill">
          <button type="button" className="gx-cpill-b" disabled={disabled} onClick={onOpenActor} title="Changer d'acteur">
            <span className={`gx-who ${actor.gender === "male" ? "gx-h" : "gx-f"}`} aria-hidden>
              {actor.gender === "male" ? <MaleIcon /> : <FemaleIcon />}
            </span>
            <span className="gx-cpill-n">{actor.name}</span>
          </button>
          {onClearActor && (
            <button type="button" className="gx-cpill-x" disabled={disabled} onClick={onClearActor} aria-label={`Retirer l'acteur ${actor.name}`}>
              <X className="gx-i" />
            </button>
          )}
        </span>
      ) : (
        <AddPill label="Ajouter un acteur" disabled={disabled} onClick={onOpenActor} />
      )}

      {products.length > 0 ? (
        <span className="gx-cpill">
          <button
            type="button"
            className="gx-cpill-b"
            disabled={disabled}
            onClick={onOpenProducts}
            title={one ? "Ajouter ou changer de produit" : products.map((p) => p.name).join(", ")}
          >
            {one ? (
              one.image ? <img className="gx-pth" src={one.image} alt="" /> : <span className="gx-pth" aria-hidden />
            ) : (
              <span className="gx-pstack" aria-hidden>
                {products.slice(0, 3).map((p) =>
                  p.image ? <img key={p.id} className="gx-pth" src={p.image} alt="" /> : <span key={p.id} className="gx-pth" />,
                )}
              </span>
            )}
            <span className="gx-cpill-n">{one ? one.name : `${products.length} produits`}</span>
            {one?.price ? <span className="gx-cpill-pr">{one.price}</span> : null}
          </button>
          {onClearProducts && (
            <button type="button" className="gx-cpill-x" disabled={disabled} onClick={onClearProducts} aria-label={one ? `Retirer ${one.name}` : "Retirer les produits"}>
              <X className="gx-i" />
            </button>
          )}
        </span>
      ) : (
        <AddPill label="Ajouter un produit" disabled={disabled} onClick={onOpenProducts} />
      )}
    </>
  );
}
