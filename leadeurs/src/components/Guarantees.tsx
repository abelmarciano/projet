import { ShieldCheck, BadgeCheck, LineChart, Zap } from "lucide-react";
import { guarantees } from "@/data";

const icons = [ShieldCheck, BadgeCheck, LineChart, Zap];

export default function Guarantees() {
  return (
    <section className="section" style={{ paddingTop: 0 }}>
      <div className="wrap">
        <div style={{ display: "grid", gap: 20 }}>
          <span className="eyebrow">Nos engagements</span>
          <h2 className="h2">Fini les leads <span className="fire-text">recyclés.</span></h2>
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
