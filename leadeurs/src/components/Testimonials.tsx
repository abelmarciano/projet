import { Star } from "lucide-react";
import { testimonials } from "@/data";

function Quote({ t, big = false }: { t: (typeof testimonials)[number]; big?: boolean }) {
  const initials = t.name.split(" ").map((p) => p[0]).join("");
  return (
    <figure className={`quote${big ? " big" : ""}`} style={{ margin: 0 }}>
      <div style={{ display: "grid", gap: 18 }}>
        <div className="stars" aria-label="5 étoiles sur 5">
          {Array.from({ length: 5 }).map((_, i) => <Star key={i} />)}
        </div>
        <blockquote>« {t.quote} »</blockquote>
      </div>
      <figcaption>
        <span className="avatar">{initials}</span>
        <div>
          <strong>{t.name}</strong>
          <span>{t.role}</span>
        </div>
      </figcaption>
    </figure>
  );
}

export default function Testimonials() {
  const [first, ...rest] = testimonials;
  return (
    <section className="section" id="avis">
      <div className="wrap">
        <div style={{ display: "grid", gap: 20 }}>
          <span className="eyebrow">Avis clients</span>
          <h2 className="h2">Ils ont arrêté de chercher<br />des clients. Ils les reçoivent.</h2>
        </div>
        <div className="quotes">
          <Quote t={first} big />
          <div className="quotes-side">
            {rest.map((t) => <Quote key={t.name} t={t} />)}
          </div>
        </div>
      </div>
    </section>
  );
}
