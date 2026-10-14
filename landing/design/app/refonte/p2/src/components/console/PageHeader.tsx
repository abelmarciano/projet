import type { ReactNode } from "react";
import { BackLink } from "./BackLink";

/**
 * En-tête de page unique de la console (.gx-ph) : retour facultatif, petit libellé,
 * titre, sous-titre et actions à droite (qui passent dessous sur mobile).
 */
export function PageHeader({
  title,
  subtitle,
  actions,
  back,
  eyebrow,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  back?: { to: string; label: string; params?: Record<string, string>; search?: Record<string, unknown> };
  eyebrow?: ReactNode;
}) {
  return (
    <div className={back ? "gx-ph gx-ph-has-back" : "gx-ph"}>
      <div>
        {back && <BackLink to={back.to} label={back.label} params={back.params} search={back.search} />}
        {eyebrow && <span className="gx-ph-eb">{eyebrow}</span>}
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {actions && <div className="gx-pa">{actions}</div>}
    </div>
  );
}
