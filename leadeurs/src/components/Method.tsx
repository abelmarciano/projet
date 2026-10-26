import { useEffect, useRef, useState } from "react";
import { steps } from "@/data";

/** Trois étapes : la ligne se remplit et chaque étape s'allume au fil du scroll. */
export default function Method() {
  const box = useRef<HTMLOListElement>(null);
  const [progress, setProgress] = useState(1);

  useEffect(() => {
    const onScroll = () => {
      const el = box.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const mid = window.innerHeight * 0.6;
      setProgress(Math.min(1, Math.max(0, (mid - r.top) / r.height)));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section className="section" id="methode" style={{ paddingTop: 0 }}>
      <div className="wrap">
        <div className="reveal" style={{ display: "grid", gap: 24 }}>
          <span className="label"><i />Méthode</span>
          <h2 className="display h2">Du clic au rendez-vous.</h2>
        </div>
        <ol className="steps" ref={box}>
          <div className="steps-line" aria-hidden="true"><i style={{ height: `${progress * 100}%` }} /></div>
          {steps.map((s, i) => (
            <li key={s.title} className={`step${progress >= i / steps.length + 0.05 ? " on" : ""}`}>
              <span className="step-dot">{String(i + 1).padStart(2, "0")}</span>
              <div className="step-body">
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
