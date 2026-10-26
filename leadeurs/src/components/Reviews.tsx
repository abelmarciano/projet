import { Star } from "lucide-react";
import { testimonials } from "@/data";

// Captures d'avis clients : remplacer les fichiers src/assets/avis/avis1..8.png par les vraies images.
const images = Object.values(
  import.meta.glob("@/assets/avis/*.png", { eager: true, import: "default" }),
) as string[];

function Row({ list, reverse }: { list: string[]; reverse?: boolean }) {
  const group = (hidden: boolean) => (
    <div aria-hidden={hidden || undefined}>
      {list.map((src, i) => (
        <figure key={src + i} className="review-img" style={{ margin: 0 }}>
          <img src={src} alt={hidden ? "" : `Avis client ${i + 1}`} loading="lazy" />
        </figure>
      ))}
    </div>
  );
  return (
    <div className="reviews-row">
      <div className={`reviews-track${reverse ? " rev" : ""}`}>{group(false)}{group(true)}</div>
    </div>
  );
}

export default function Reviews() {
  const half = Math.ceil(images.length / 2);
  return (
    <section className="section" id="avis" style={{ paddingTop: 0 }}>
      <div className="wrap reveal" style={{ display: "grid", gap: 24, justifyItems: "center", textAlign: "center" }}>
        <span className="label"><i />Avis clients</span>
        <h2 className="display h2">Ils ne cherchent plus.<br /><span className="flame-text">Ils reçoivent.</span></h2>
        <p className="lede center">98 % de nos clients sont satisfaits. Voici ce qu'ils en disent.</p>
      </div>
      <div className="reviews">
        <div className="reviews-3d">
          <Row list={images.slice(0, half)} />
          <Row list={images.slice(half)} reverse />
        </div>
      </div>
      <div className="wrap">
        <div className="quotes">
          {testimonials.map((t) => (
            <figure key={t.name} className="quote reveal">
              <div style={{ display: "grid", gap: 14 }}>
                <div className="stars" aria-label="Note : 5 sur 5">{Array.from({ length: 5 }).map((_, i) => <Star key={i} />)}</div>
                <blockquote>« {t.quote} »</blockquote>
              </div>
              <figcaption>
                <span className="avatar">{t.name.split(" ").map((p) => p[0]).join("")}</span>
                <div><strong>{t.name}</strong><span>{t.role}</span></div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
