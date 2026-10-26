import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { icon3d } from "@/icons";

const checks = ["Numéro de téléphone valide", "Propriétaire du logement", "Projet confirmé par le prospect", "Zone géographique respectée"];

function Checklist() {
  const [done, setDone] = useState(checks.length);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setDone((d) => (d >= checks.length + 2 ? 0 : d + 1)), 900);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="checklist">
      {checks.map((c, i) => (
        <div key={c} className={`check${i < done ? " done" : ""}`}>
          <i><Check strokeWidth={3.5} /></i>{c}
        </div>
      ))}
    </div>
  );
}

function Clock() {
  const [ms, setMs] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setMs(420); return; }
    let t = 0;
    const id = setInterval(() => { t = (t + 37) % 990; setMs(t); }, 40);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="clock">
      0,{String(ms).padStart(3, "0")}<span className="grad-text"> s</span>
      <small>entre l'inscription et votre CRM</small>
    </div>
  );
}

function Curve() {
  return (
    <svg className="curve" viewBox="0 0 400 150" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="cv-l" x1="0" x2="1"><stop offset="0" stopColor="#ffab2e" /><stop offset=".5" stopColor="#ff6a00" /><stop offset="1" stopColor="#f0350a" /></linearGradient>
        <linearGradient id="cv-f" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ff6a00" stopOpacity=".18" /><stop offset="1" stopColor="#ff6a00" stopOpacity="0" /></linearGradient>
      </defs>
      {[37.5, 75, 112.5].map((y) => <line key={y} x1="0" x2="400" y1={y} y2={y} stroke="#e6e9f0" />)}
      <path d="M0,130 C40,124 60,110 100,108 S160,96 200,80 S260,70 300,46 S360,22 400,12 L400,150 L0,150 Z" fill="url(#cv-f)" />
      <path className="stroke" d="M0,130 C40,124 60,110 100,108 S160,96 200,80 S260,70 300,46 S360,22 400,12" fill="none" stroke="url(#cv-l)" strokeWidth="3" />
    </svg>
  );
}

export default function Bento() {
  return (
    <section className="section" id="pourquoi">
      <div className="wrap">
        <div className="head center reveal">
          <span className="label"><img src={icon3d("high_voltage")} alt="" />Pourquoi Leadeurs</span>
          <h2 className="h2">Pas des contacts.<br /><span className="grad-text">Des clients en devenir.</span></h2>
          <p className="lede">Chaque lead est généré, contrôlé et livré par notre propre machine d'acquisition. Rien n'est acheté à des tiers, rien n'est revendu.</p>
        </div>

        <div className="bento">
          <article className="tile t-a reveal">
            <span className="tile-icon bg-peach"><img src={icon3d("locked")} alt="" /></span>
            <h3>Un lead. Un seul client. Jamais revendu.</h3>
            <p>Chaque prospect est envoyé à une seule entreprise : la vôtre. Vous êtes le seul à l'appeler.</p>
            <div className="visual">
              <div className="orbit" aria-hidden="true">
                <span /><span />
                <div className="orbit-core"><img src={icon3d("bullseye")} alt="" /></div>
                <div className="orbit-tag" style={{ top: "8%", left: "0%" }}>Concurrents</div>
                <div className="orbit-tag" style={{ bottom: "10%", right: "-2%" }}>Revente</div>
                <div className="orbit-tag" style={{ top: "46%", right: "-6%" }}>Partage</div>
                <div className="orbit-tag" style={{ bottom: "4%", left: "6%" }}>Fichiers recyclés</div>
              </div>
            </div>
          </article>

          <article className="tile t-b reveal">
            <span className="tile-icon bg-mint"><img src={icon3d("check_mark_button")} alt="" /></span>
            <h3>Contrôlé avant livraison.</h3>
            <div className="visual"><Checklist /></div>
          </article>

          <article className="tile t-c reveal">
            <span className="tile-icon bg-lilac"><img src={icon3d("stopwatch")} alt="" /></span>
            <h3>Livré à la seconde.</h3>
            <div className="visual"><Clock /></div>
          </article>

          <article className="tile t-d reveal">
            <span className="tile-icon bg-sky"><img src={icon3d("bar_chart")} alt="" /></span>
            <h3>Vos résultats, en direct.</h3>
            <p>Tableau de bord, statistiques par campagne et reporting détaillé inclus.</p>
            <div className="visual"><Curve /></div>
          </article>

          <article className="tile t-e reveal">
            <span className="tile-icon bg-sun"><img src={icon3d("gear")} alt="" /></span>
            <h3>Branché sur vos outils. Ou sur le CRM qu'on vous construit.</h3>
            <p>Email, Google Sheets, API, ou un CRM développé pour votre process de vente, livré en 4 à 8 semaines.</p>
            <div className="visual">
              <div className="integrations" aria-label="Intégrations possibles">
                <span>Email</span><span>Google Sheets</span><span className="hot">CRM Leadeurs</span><span>API</span><span>Calendly</span><span>Stripe</span><span>SMS</span>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
