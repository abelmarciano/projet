import { icon3d, sectorArt } from "@/icons";
import { sectors } from "@/data";

export default function Sectors() {
  return (
    <section className="section" id="secteurs" style={{ paddingTop: 0 }}>
      <div className="wrap">
        <div className="head center reveal">
          <span className="label"><img src={icon3d("bullseye")} alt="" />Secteurs</span>
          <h2 className="h2">Huit marchés.<br /><span className="grad-text">Zéro compromis.</span></h2>
          <p className="lede">Chaque secteur a ses propres critères de qualification, définis avec vous et appliqués à chaque prospect avant livraison.</p>
        </div>
        <div className="sectors">
          {sectors.map((s) => {
            const art = sectorArt[s.code];
            return (
              <article key={s.code} className="sector reveal">
                <div className={`sector-art ${art.tint}`}>
                  <img src={icon3d(art.icon)} alt="" />
                </div>
                <h3>{s.name}</h3>
                <p>{s.detail}</p>
                <span className="tag">● Leads exclusifs</span>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
