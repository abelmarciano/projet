import { useEffect, useRef } from "react";

const CursorGlow = () => {
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let x = 0, y = 0, targetX = 0, targetY = 0;
    let raf: number;

    const onMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
    };

    const animate = () => {
      x += (targetX - x) * 0.08;
      y += (targetY - y) * 0.08;
      if (glowRef.current) {
        glowRef.current.style.transform = `translate(${x - 200}px, ${y - 200}px)`;
      }
      raf = requestAnimationFrame(animate);
    };

    // Only on desktop
    if (window.matchMedia("(min-width: 768px)").matches) {
      window.addEventListener("mousemove", onMove);
      raf = requestAnimationFrame(animate);
    }

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={glowRef}
      aria-hidden="true"
      className="fixed top-0 left-0 w-[400px] h-[400px] pointer-events-none z-[9999] rounded-full hidden md:block"
      style={{
        background: "radial-gradient(circle, hsl(var(--primary) / 0.06) 0%, transparent 70%)",
        filter: "blur(40px)",
        willChange: "transform",
      }}
    />
  );
};

export default CursorGlow;
