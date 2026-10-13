import type { ReactNode } from "react";
import { X } from "lucide-react";

/**
 * Puce de pièce jointe au-dessus de la saisie du Chat (image, vidéo, acteur,
 * création, audio, réponse). Même gabarit pour tout : miniature 28 px,
 * type en petit, nom tronqué, croix pour retirer.
 */
export function AttachChip({
  kind,
  name,
  thumb,
  icon,
  onRemove,
  removeLabel,
  wide,
  children,
}: {
  /** Type affiché en petit : « Image », « Vidéo », « Acteur », « Création », « Audio »… */
  kind: string;
  /** Nom affiché en entier si la place le permet, sinon tronqué (titre complet au survol). */
  name: string;
  /** Miniature : image ou vidéo (première image). */
  thumb?: { src: string; video?: boolean; alt?: string };
  /** Icône à la place de la miniature (audio, réponse). */
  icon?: ReactNode;
  onRemove: () => void;
  removeLabel: string;
  /** Prend toute la largeur de la rangée (réponse à un message, audio avec lecteur). */
  wide?: boolean;
  /** Contenu en plus sous le nom (lecteur audio). */
  children?: ReactNode;
}) {
  return (
    <div className={`gx-ac${wide ? " gx-ac-wide" : ""}`} title={name}>
      <span className={`gx-ac-th${thumb ? "" : " gx-ac-ic"}`} aria-hidden={!thumb}>
        {thumb ? (
          thumb.video ? (
            <video src={thumb.src} muted playsInline preload="metadata" />
          ) : (
            <img src={thumb.src} alt={thumb.alt ?? name} />
          )
        ) : (
          icon
        )}
      </span>
      <span className="gx-ac-tx">
        <span className="gx-ac-k">{kind}</span>
        <span className="gx-ac-n">{name}</span>
        {children}
      </span>
      <button type="button" className="gx-ac-x" onClick={onRemove} aria-label={removeLabel} title="Retirer">
        <X className="gx-i" />
      </button>
    </div>
  );
}
