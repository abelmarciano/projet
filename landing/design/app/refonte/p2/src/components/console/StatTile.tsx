import type { ReactNode } from "react";
import type { IconComponent } from "@/components/icons";

/**
 * Tuile de chiffre unique. À poser dans une grille `.gx-stats`
 * (ou dans les grilles existantes .gx-kp4 / .gx-k7).
 */
export function StatTile({
  label,
  value,
  sub,
  tone = "default",
  icon: Icon,
}: {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  tone?: "default" | "ok" | "warn" | "danger";
  icon?: IconComponent;
}) {
  return (
    <div className={tone === "default" ? "gx-stat" : `gx-stat gx-stat-${tone}`}>
      <small>
        {Icon && <Icon className="gx-i" aria-hidden />}
        <span>{label}</span>
      </small>
      <b className="gx-num">{value}</b>
      {sub && <em>{sub}</em>}
    </div>
  );
}
