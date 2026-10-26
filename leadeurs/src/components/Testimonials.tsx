import { Star } from "lucide-react";
import { testimonials } from "@/data";

export default function Testimonials() {
  return (
    <section className="section bg-mist" id="avis">
      <div className="wrap">
        <div className="head center">
          <span className="kicker">Avis clients</span>
          <h2 className="h2">Ils nous confient leur prospection.</h2>
          <p className="sub">Installateurs solaires, entreprises de rénovation, agences : ils reçoivent leurs leads chaque jour.</p>
        </div>
        <div className="quotes">
          {testimonials.map((t) => (
            <figure key={t.name} className="quote">
              <div style={{ display: "grid", gap: 16 }}>
                <div className="stars" aria-label="Note : 5 sur 5">
                  {Array.from({ length: 5 }).map((_, i) => <Star key={i} />)}
                </div>
                <blockquote>« {t.quote} »</blockquote>
              </div>
              <figcaption>
                <span className="avatar">{t.name.split(" ").map((p) => p[0]).join("")}</span>
                <div><strong>{t.name}</strong><span>{t.role}</span></div>
              </figcaption>
            </figure>
          ))}
        </div>
        <p className="rating"><strong>98 % de clients satisfaits</strong> sur l'ensemble de nos partenaires</p>
      </div>
    </section>
  );
}
