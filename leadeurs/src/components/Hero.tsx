import { useEffect, useState } from "react";
import { ArrowRight, Star } from "lucide-react";
import { icon3d, leadIcon } from "@/icons";
import { WHATSAPP_URL, sampleLeads } from "@/data";

const orbit = ["sun", "house", "thermometer", "light_bulb", "shower", "building_construction"];
const VISIBLE = 5;

type Lead = (typeof sampleLeads)[number] & { id: number };

/** Téléphone où les notifications de nouveaux leads apparaissent les unes après les autres. */
function Phone() {
  const [leads, setLeads] = useState<Lead[]>(() => sampleLeads.slice(0, VISIBLE).map((l, i) => ({ ...l, id: i })));
  const [count, setCount] = useState(38);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let next = VISIBLE;
    const id = setInterval(() => {
      const lead = { ...sampleLeads[next % sampleLeads.length], id: next };
      next += 1;
      setLeads((prev) => [lead, ...prev].slice(0, VISIBLE));
      setCount((c) => c + 1);
    }, 2600);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="phone" role="img" aria-label="Téléphone affichant des notifications de nouveaux leads">
      <div className="phone-notch" />
      <div className="phone-head">
        <span>Aujourd'hui</span>
        <strong>{count} leads</strong>
      </div>
      <ul className="notifs">
        {leads.map((l, i) => (
          <li key={l.id} className={`notif${i === 0 ? " is-new" : ""}`}>
            <span className="notif-ico"><img src={leadIcon(l.sector)} alt="" /></span>
            <div className="notif-main">
              <div className="notif-top"><b>Nouveau lead</b><span>{i === 0 ? "maintenant" : `il y a ${i * 3} min`}</span></div>
              <strong>{l.sector} · {l.place} ({l.dept})</strong>
              <span>{l.profile}</span>
            </div>
          </li>
        ))}
      </ul>
      <div className="phone-cta"><i />Synchronisé avec votre CRM</div>
    </div>
  );
}

export default function Hero() {
  return (
    <section className="hero" id="top">
      <div className="mesh" aria-hidden="true"><i /><i /><i /></div>
      <div className="wrap hero-grid">
        <div className="hero-copy">
          <span className="pill"><b>EN DIRECT</b> Leads B2C exclusifs, livrés à la seconde</span>
          <h1>
            <span className="line"><span>Vos clients</span></span>
            <span className="line"><span className="grad-text">arrivent</span></span>
            <span className="line"><span>tout seuls.</span></span>
          </h1>
          <p className="lede">
            Leadeurs génère, vérifie et livre des prospects prêts à signer, directement dans votre CRM.
            Vous ne payez que les leads conformes.
          </p>
          <div className="ctas">
            <a className="btn btn-primary" href={WHATSAPP_URL} target="_blank" rel="noreferrer">
              Recevoir mes premiers leads <ArrowRight />
            </a>
            <a className="btn btn-white" href="#secteurs">Voir les secteurs</a>
          </div>
          <div className="proof">
            <div className="faces" aria-hidden="true">
              <span style={{ background: "#ffe1c7" }}>TR</span>
              <span style={{ background: "#dbe8ff" }}>NK</span>
              <span style={{ background: "#d9f4e6" }}>MD</span>
              <span style={{ background: "#ece6ff" }}>SL</span>
            </div>
            <div>
              <div className="proof-stars">
                {Array.from({ length: 5 }).map((_, i) => <Star key={i} />)}
                <b>98 % de clients satisfaits</b>
              </div>
              <span>250 000+ leads livrés aux pros de la rénovation</span>
            </div>
          </div>
        </div>

        <div className="hero-visual">
          <div className="rings" aria-hidden="true">
            <span /><span /><span />
          </div>
          <div className="orbit-icons" aria-hidden="true">
            {orbit.map((n, i) => (
              <div key={n} className="oi" style={{ ["--i" as string]: i } as React.CSSProperties}>
                <img src={icon3d(n)} alt="" />
              </div>
            ))}
          </div>
          <Phone />
          <div className="chip-float chip-a">
            <img src={icon3d("locked")} alt="" />
            <div><strong>100 % exclusif</strong><span>Un lead, un seul client</span></div>
          </div>
          <div className="chip-float chip-b">
            <img src={icon3d("check_mark_button")} alt="" />
            <div><strong>Vérifié</strong><span>Téléphone et projet confirmés</span></div>
          </div>
        </div>
      </div>
      <p className="hero-note">Notifications d'exemple, à titre d'illustration.</p>
    </section>
  );
}
