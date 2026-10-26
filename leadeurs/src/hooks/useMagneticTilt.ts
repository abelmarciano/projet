import { useRef, useCallback } from "react";

export const useMagneticTilt = (intensity = 15) => {
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      ref.current.style.transform = `perspective(800px) rotateY(${x * intensity}deg) rotateX(${-y * intensity}deg) scale3d(1.03, 1.03, 1.03)`;
      ref.current.style.transition = "transform 0.1s ease-out";

      // Shine position
      const shine = ref.current.querySelector<HTMLDivElement>("[data-shine]");
      if (shine) {
        shine.style.background = `radial-gradient(circle at ${(x + 0.5) * 100}% ${(y + 0.5) * 100}%, hsl(var(--primary) / 0.12) 0%, transparent 60%)`;
      }
    },
    [intensity]
  );

  const handleMouseLeave = useCallback(() => {
    if (!ref.current) return;
    ref.current.style.transform = "perspective(800px) rotateY(0deg) rotateX(0deg) scale3d(1, 1, 1)";
    ref.current.style.transition = "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)";
    const shine = ref.current.querySelector<HTMLDivElement>("[data-shine]");
    if (shine) shine.style.background = "transparent";
  }, []);

  return { ref, onMouseMove: handleMouseMove, onMouseLeave: handleMouseLeave };
};
