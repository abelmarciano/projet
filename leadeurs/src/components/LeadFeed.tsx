import { useEffect, useState } from "react";
import { sampleLeads } from "@/data";

type Lead = (typeof sampleLeads)[number] & { id: number; at: number };

const VISIBLE = 4;

function ago(ms: number) {
  const s = Math.max(1, Math.round(ms / 1000));
  return s < 60 ? `il y a ${s} s` : `il y a ${Math.round(s / 60)} min`;
}

export default function LeadFeed() {
  const [now, setNow] = useState(() => Date.now());
  const [leads, setLeads] = useState<Lead[]>(() =>
    sampleLeads.slice(0, VISIBLE).map((l, i) => ({ ...l, id: i, at: Date.now() - (i + 1) * 17000 })),
  );
  const [count, setCount] = useState(37);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const tick = setInterval(() => setNow(Date.now()), 1000);
    if (reduced) return () => clearInterval(tick);

    let next = VISIBLE;
    const push = setInterval(() => {
      const lead = { ...sampleLeads[next % sampleLeads.length], id: next, at: Date.now() };
      next += 1;
      setLeads((prev) => [lead, ...prev].slice(0, VISIBLE));
      setCount((c) => c + 1);
    }, 3200);
    return () => {
      clearInterval(tick);
      clearInterval(push);
    };
  }, []);

  return (
    <div className="board" role="img" aria-label="Aperçu animé de leads livrés en temps réel">
      <div className="board-head">
        <div className="board-title">
          Leads livrés
          <small>Tableau de bord client</small>
        </div>
        <span className="live"><i />En direct</span>
      </div>
      <ul className="feed-list">
        {leads.map((l, i) => (
          <li key={l.id} className={`lead${i === 0 && now - l.at < 2500 ? " is-new" : ""}`}>
            <span className="lead-dept">{l.dept}</span>
            <div className="lead-main">
              <strong>{l.sector} · {l.place}</strong>
              <span>{l.profile}</span>
            </div>
            <div className="lead-meta">
              <span className="tag">✓ Vérifié</span>
              <span className="lead-time">{ago(now - l.at)}</span>
            </div>
          </li>
        ))}
      </ul>
      <div className="board-foot">
        <span>Aujourd'hui <b>{count} leads</b></span>
        <span>Taux d'exclusivité <b>100 %</b></span>
      </div>
    </div>
  );
}
