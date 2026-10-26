import { ArrowRight, BarChart3, Mail, Plug, Smartphone, Users, Workflow } from "lucide-react";
import { WHATSAPP_URL, crmFeatures } from "@/data";

const icons = [Users, Workflow, Mail, BarChart3, Plug, Smartphone];

const pipeline = [
  { initials: "SL", name: "Sophie L.", info: "Pompe à chaleur · Lyon (69)", status: "Nouveau", cls: "s-new" },
  { initials: "MD", name: "Marc D.", info: "Isolation ITE · Rennes (35)", status: "RDV jeudi", cls: "s-rdv" },
  { initials: "JM", name: "Julie M.", info: "Photovoltaïque · Toulouse (31)", status: "Signé", cls: "s-won" },
];

// Conversions par semaine sur 8 semaines (données d'illustration)
const series = [12, 15, 14, 19, 22, 21, 27, 31];

function Chart() {
  const w = 300;
  const h = 100;
  const max = 34;
  const pts = series.map((v, i) => [(i / (series.length - 1)) * w, h - (v / max) * (h - 8)]);
  const line = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="crm-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ff7a00" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#ff7a00" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map((f) => (
        <line key={f} x1="0" x2={w} y1={h * f} y2={h * f} stroke="#e2e7ef" strokeWidth="1" vectorEffect="non-scaling-stroke" />
      ))}
      <path d={`${line} L${w},${h} L0,${h} Z`} fill="url(#crm-fill)" />
      <path d={line} fill="none" stroke="#ff7a00" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

export default function Crm() {
  return (
    <section className="section" id="crm">
      <div className="wrap crm">
        <div className="head" style={{ maxWidth: "none" }}>
          <span className="kicker">CRM sur-mesure</span>
          <h2 className="h2">Pour convertir vos leads, il vous faut le bon CRM.</h2>
          <p className="sub">
            Fini les tableurs et les outils génériques. On développe votre CRM autour de votre façon de vendre :
            vos leads y arrivent automatiquement et chaque commercial sait qui rappeler.
          </p>
          <div className="crm-features">
            {crmFeatures.map((f, i) => {
              const Icon = icons[i];
              return (
                <div key={f.title}>
                  <Icon />
                  <strong>{f.title}</strong>
                  <span>{f.text}</span>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: 12 }}>
            <a className="btn btn-outline" href={WHATSAPP_URL} target="_blank" rel="noreferrer">
              Demander une démo <ArrowRight />
            </a>
          </div>
        </div>

        <div className="app" role="img" aria-label="Exemple d'interface de CRM : indicateurs, courbe de conversions et pipeline">
          <div className="app-bar">
            <i /><i /><i />
            <span>crm.votre-entreprise.fr</span>
          </div>
          <div className="app-body">
            <div className="kpis">
              <div className="kpi"><span>Nouveaux</span><strong>24</strong></div>
              <div className="kpi"><span>En cours</span><strong>18</strong></div>
              <div className="kpi hot"><span>Convertis</span><strong>42</strong></div>
            </div>
            <div className="chart">
              <div className="chart-top"><span>Conversions sur 8 semaines</span><b>+158 %</b></div>
              <Chart />
            </div>
            <div className="rows">
              {pipeline.map((p) => (
                <div key={p.name} className="row">
                  <span className="avatar">{p.initials}</span>
                  <div><strong>{p.name}</strong><span>{p.info}</span></div>
                  <span className={`status ${p.cls}`}>{p.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
