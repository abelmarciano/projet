import { useEffect, useRef, useState } from "react";
import { sampleLeads } from "@/data";
import { leadIcon } from "@/icons";

type Lead = (typeof sampleLeads)[number] & { id: number; at: number };
const VISIBLE = 5;
const bars = [38, 52, 46, 61, 58, 72, 69, 84, 78, 92, 88, 100];

function ago(ms: number) {
  const s = Math.max(1, Math.round(ms / 1000));
  return s < 60 ? `il y a ${s} s` : `il y a ${Math.round(s / 60)} min`;
}

/** Tableau de bord en verre, incliné en 3D, qui se redresse pendant le scroll. */
export default function Stage() {
  const screen = useRef<HTMLDivElement>(null);
  const [now, setNow] = useState(() => Date.now());
  const [count, setCount] = useState(37);
  const [leads, setLeads] = useState<Lead[]>(() =>
    sampleLeads.slice(0, VISIBLE).map((l, i) => ({ ...l, id: i, at: Date.now() - (i + 1) * 14000 })),
  );

  useEffect(() => {
    const el = screen.current;
    const onScroll = () => {
      if (!el) return;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = Math.min(1, Math.max(0, (vh - r.top) / (vh * 0.75)));
      el.style.setProperty("--tilt", `${24 * (1 - p)}deg`);
      el.style.setProperty("--scale", `${0.9 + 0.1 * p}`);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const tick = setInterval(() => setNow(Date.now()), 1000);
    let next = VISIBLE;
    const push = reduced ? 0 : window.setInterval(() => {
      const lead = { ...sampleLeads[next % sampleLeads.length], id: next, at: Date.now() };
      next += 1;
      setLeads((prev) => [lead, ...prev].slice(0, VISIBLE));
      setCount((c) => c + 1);
    }, 2800);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      clearInterval(tick);
      clearInterval(push);
    };
  }, []);

  return (
    <section className="stage wrap reveal" aria-label="Aperçu du tableau de bord client">
      <div className="screen" ref={screen}>
        <div className="screen-inner">
          <div className="screen-top">
            <i /><i /><i />
            <span>app.leadeurs.fr</span>
            <span className="live"><i />En direct</span>
          </div>
          <div className="screen-body">
            <div className="panel">
              <div className="panel-title"><span>Leads entrants</span><span>Exclusifs · vérifiés</span></div>
              <ul className="feed">
                {leads.map((l, i) => (
                  <li key={l.id} className={`lead${i === 0 && now - l.at < 2400 ? " is-new" : ""}`}>
                    <span className="lead-ico"><img src={leadIcon(l.sector)} alt="" /></span>
                    <div className="lead-main">
                      <strong>{l.sector} · {l.place} ({l.dept})</strong>
                      <span>{l.profile}</span>
                    </div>
                    <div className="lead-meta">
                      <span className="ok">✓ vérifié</span>
                      <span className="ago">{ago(now - l.at)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="screen-side">
              <div className="panel">
                <div className="panel-title"><span>Livrés aujourd'hui</span></div>
                <div className="big-num">{count}<small>leads</small></div>
                <div className="bars" aria-hidden="true">
                  {bars.map((b, i) => <span key={i} style={{ height: `${b}%`, animationDelay: `${i * 60}ms` }} />)}
                </div>
              </div>
              <div className="mini">
                <div className="panel"><strong>100 %</strong><span>exclusifs</span></div>
                <div className="panel"><strong>&lt; 1 s</strong><span>délai de livraison</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <p className="example-note">Aperçu animé avec des données d'exemple.</p>
    </section>
  );
}
