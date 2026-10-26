import { ArrowRight } from "lucide-react";
import { WHATSAPP_URL, crmFeatures } from "@/data";

const pipeline = [
  { initials: "SL", name: "Sophie L.", info: "PAC · Lyon (69)", status: "Nouveau", cls: "s-new" },
  { initials: "MD", name: "Marc D.", info: "ITE · Rennes (35)", status: "RDV jeudi", cls: "s-rdv" },
  { initials: "JM", name: "Julie M.", info: "PV · Toulouse (31)", status: "Signé", cls: "s-won" },
];

// Conversions par semaine, 8 semaines (données d'illustration)
const series = [12, 15, 14, 19, 22, 21, 27, 31];

function Sparkline() {
  const w = 300;
  const h = 110;
  const max = 34;
  const pts = series.map((v, i) => [(i / (series.length - 1)) * w, h - (v / max) * (h - 10)]);
  const line = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = `${line} L${w},${h} L0,${h} Z`;
  const [lx, ly] = pts[pts.length - 1];
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="crm-area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ff8b00" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#ff8b00" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="crm-line" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#fdbc00" />
          <stop offset="100%" stopColor="#ec2700" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map((f) => (
        <line key={f} x1="0" x2={w} y1={h * f} y2={h * f} stroke="#2f2823" strokeWidth="1" />
      ))}
      <path d={area} fill="url(#crm-area)" />
      <path d={line} fill="none" stroke="url(#crm-line)" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
      <circle cx={lx - 4} cy={ly} r="4.5" fill="#ec2700" stroke="#13100e" strokeWidth="2" />
    </svg>
  );
}

export default function Crm() {
  return (
    <section className="section" id="crm" style={{ paddingTop: 0 }}>
      <div className="wrap crm">
        <div className="crm-copy">
          <span className="eyebrow">CRM sur-mesure</span>
          <h2 className="h2">Un bon lead mérite un bon <span className="fire-text">CRM.</span></h2>
          <p className="lede">
            On développe votre outil autour de votre façon de vendre. Vos leads y arrivent
            automatiquement, vos commerciaux savent qui rappeler, et vous voyez ce qui convertit.
          </p>
          <div className="crm-features">
            {crmFeatures.map((f) => (
              <div key={f.title}>
                <strong>{f.title}</strong>
                <span>{f.text}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 8 }}>
            <a className="btn btn-ghost" href={WHATSAPP_URL} target="_blank" rel="noreferrer">
              Parler de mon CRM <ArrowRight />
            </a>
          </div>
        </div>

        <div className="app" role="img" aria-label="Aperçu d'un CRM Leadeurs : indicateurs, courbe de conversions et pipeline">
          <div className="app-bar">
            <i /><i /><i />
            <span>crm.votre-entreprise.fr</span>
          </div>
          <div className="app-body">
            <div className="kpis">
              <div className="kpi"><span>Nouveaux</span><strong>24</strong></div>
              <div className="kpi"><span>En cours</span><strong>18</strong></div>
              <div className="kpi"><span>Convertis</span><strong>42</strong></div>
            </div>
            <div className="chart">
              <div className="chart-top">
                <span>Conversions · 8 semaines</span>
                <b>+158 %</b>
              </div>
              <Sparkline />
            </div>
            <div className="rows">
              {pipeline.map((p) => (
                <div key={p.name} className="row">
                  <span className="avatar">{p.initials}</span>
                  <div>
                    <strong>{p.name}</strong>
                    <span>{p.info}</span>
                  </div>
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
