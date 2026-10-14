import type { ReactNode } from "react";
import type { IconComponent } from "@/components/icons";

/** État vide unique : icône dans une pastille, titre, texte court, action facultative. */
export function ConsoleEmpty({
  icon: Icon,
  title,
  text,
  action,
  compact,
}: {
  icon?: IconComponent;
  title: string;
  text?: ReactNode;
  action?: ReactNode;
  compact?: boolean;
}) {
  return (
    <div className={compact ? "gx-empty gx-empty-c" : "gx-empty"}>
      {Icon && (
        <span className="gx-empty-ic" aria-hidden>
          <Icon className="gx-i" />
        </span>
      )}
      <b>{title}</b>
      {text && <p>{text}</p>}
      {action && <div className="gx-empty-a">{action}</div>}
    </div>
  );
}
