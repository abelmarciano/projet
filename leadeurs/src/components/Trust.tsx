import { ArrowRight, BadgeCheck, LineChart, ShieldCheck, Zap } from "lucide-react";
import { WHATSAPP_URL, guarantees } from "@/data";

const icons = [ShieldCheck, BadgeCheck, LineChart, Zap];

export default function Trust() {
  return (
    <section className="section trust">
      <div className="wrap trust-grid">
        <div className="head">
          <span className="kicker">Nos engagements</span>
          <h2 className="h2">Fini les leads recyclés et revendus.</h2>
          <p className="sub">
            Chaque prospect est contrôlé avant de vous être envoyé. Un lead non conforme ne vous est pas facturé.
          </p>
          <div>
            <a className="btn btn-primary" href={WHATSAPP_URL} target="_blank" rel="noreferrer">
              Tester nos leads <ArrowRight />
            </a>
          </div>
        </div>
        <div className="guarantees">
          {guarantees.map((g, i) => {
            const Icon = icons[i];
            return (
              <div key={g.title} className="guarantee">
                <Icon />
                <h3>{g.title}</h3>
                <p>{g.text}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
