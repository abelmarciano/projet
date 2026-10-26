import { useEffect, useRef } from "react";

/** Effets globaux : grain, halo qui suit le curseur, reflet sur les tuiles, apparition au scroll. */
export default function Effects() {
  const glow = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      glow.current?.style.setProperty("--mx", `${e.clientX}px`);
      glow.current?.style.setProperty("--my", `${e.clientY}px`);
      const tile = (e.target as HTMLElement).closest?.(".tile") as HTMLElement | null;
      if (tile) {
        const r = tile.getBoundingClientRect();
        tile.style.setProperty("--x", `${e.clientX - r.left}px`);
        tile.style.setProperty("--y", `${e.clientY - r.top}px`);
      }
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

  return (
    <>
      <div className="noise" aria-hidden="true" />
      <div className="cursor-glow" ref={glow} aria-hidden="true" />
    </>
  );
}
