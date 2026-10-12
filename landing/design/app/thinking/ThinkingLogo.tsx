import { cn } from "@/lib/utils";

/**
 * Logo Growthity animé « l'IA réfléchit » : la courbe se trace, les points apparaissent,
 * la flèche monte puis l'étincelle scintille, en boucle. Styles dans gx-console.css (.gx-think).
 * Avec still, logo fixe (avatar de l'IA au repos). Respecte « réduire les animations » (logo fixe avec une étincelle qui pulse doucement).
 */
export function ThinkingLogo({ size = 28, label = "Growthity réfléchit…", still = false, className }: { size?: number; label?: string; still?: boolean; className?: string }) {
  // still : logo fixe (avatar de l'IA quand elle ne réfléchit pas).
  return (
    <span
      className={cn("gx-think", still && "gx-think-still", className)}
      role={still ? undefined : "status"}
      aria-label={still ? undefined : label}
      aria-hidden={still ? true : undefined}
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <defs>
          <linearGradient id="gxThinkG" x1="18" y1="96" x2="102" y2="24" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#2563EB" />
            <stop offset="0.52" stopColor="#5B3FE4" />
            <stop offset="1" stopColor="#9333EA" />
          </linearGradient>
        </defs>
        <path className="gx-think-ghost" d="M22 90 L48 62 L74 71 L99 33" pathLength={100} />
        <path className="gx-think-line" d="M22 90 L48 62 L74 71 L99 33" pathLength={100} stroke="url(#gxThinkG)" />
        <path className="gx-think-head" d="M82 39 L99 33 L99.5 51" pathLength={100} stroke="url(#gxThinkG)" />
        <circle className="gx-think-dot gx-d1" cx="22" cy="90" r="6.5" stroke="url(#gxThinkG)" />
        <circle className="gx-think-dot gx-d2" cx="48" cy="62" r="6.5" stroke="url(#gxThinkG)" />
        <circle className="gx-think-dot gx-d3" cx="74" cy="71" r="6.5" stroke="url(#gxThinkG)" />
        <path className="gx-think-spark" d="M104 16 C104.6 20.2 106.3 21.9 110.5 22.5 C106.3 23.1 104.6 24.8 104 29 C103.4 24.8 101.7 23.1 97.5 22.5 C101.7 21.9 103.4 20.2 104 16 Z" fill="url(#gxThinkG)" />
      </svg>
    </span>
  );
}
