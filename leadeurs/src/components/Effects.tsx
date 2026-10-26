import { useEffect, useRef } from "react";

/** Effets globaux : halo qui suit le curseur, reflet et inclinaison des cartes, parallaxe des icônes, apparition au scroll. */
export default function Effects() {
  const glow = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let lastSector: HTMLElement | null = null;

    const onMove = (e: PointerEvent) => {
      glow.current?.style.setProperty("--mx", `${e.clientX}px`);
      glow.current?.style.setProperty("--my", `${e.clientY}px`);
      if (reduced) return;

      const target = e.target as HTMLElement;
      const tile = target.closest?.(".tile") as HTMLElement | null;
      if (tile) {
        const r = tile.getBoundingClientRect();
        tile.style.setProperty("--x", `${e.clientX - r.left}px`);
        tile.style.setProperty("--y", `${e.clientY - r.top}px`);
      }

      const sector = target.closest?.(".sector") as HTMLElement | null;
      if (lastSector && lastSector !== sector) {
        lastSector.style.setProperty("--rx", "0deg");
        lastSector.style.setProperty("--ry", "0deg");
      }
      if (sector) {
        const r = sector.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        sector.style.setProperty("--rx", `${-py * 10}deg`);
        sector.style.setProperty("--ry", `${px * 12}deg`);
      }
      lastSector = sector;

      const fx = e.clientX / window.innerWidth - 0.5;
      const fy = e.clientY / window.innerHeight - 0.5;
      document.querySelectorAll<HTMLElement>(".fl").forEach((el) => {
        el.style.setProperty("--px", `${fx}`);
        el.style.setProperty("--py", `${fy}`);
      });
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    document.documentElement.classList.add("js");
    const io = new IntersectionObserver(
      (entries) => entries.forEach((en) => {
        if (en.isIntersecting) {
          en.target.classList.remove("pending");
          io.unobserve(en.target);
        }
      }),
      { rootMargin: "0px 0px -8% 0px" },
    );
    document.querySelectorAll(".reveal").forEach((el) => {
      if (el.getBoundingClientRect().top > window.innerHeight) {
        el.classList.add("pending");
        io.observe(el);
      }
    });

    return () => {
      window.removeEventListener("pointermove", onMove);
      io.disconnect();
    };
  }, []);

  return <div className="cursor-glow" ref={glow} aria-hidden="true" />;
}
