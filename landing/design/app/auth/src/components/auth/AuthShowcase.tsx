import { useEffect, useState } from "react";

/*
 * Colonne de droite des pages de connexion : ce que fait Growthity, en un coup d'œil.
 * Copie exacte de la maquette validée (landing/design/auth/auth.html).
 * Les créas sont des illustrations d'exemple (marque fictive « Atelier Sauge »), dessinées en SVG statique.
 */

const PROMPT = "Une pub pour mes bougies d'automne, budget 20 € par jour";

type Palette = { jar: string; wax: string; top: string; ink: string };
const AMBER: Palette = { jar: "rgba(255,236,210,.35)", wax: "#F2DEC4", top: "#E9CDAA", ink: "#5B3A26" };
const SAGE: Palette = { jar: "rgba(225,240,228,.35)", wax: "#E4EADF", top: "#D2DCCB", ink: "#2F4A3A" };
const ROSE: Palette = { jar: "rgba(255,228,234,.35)", wax: "#F6E1E4", top: "#EBCBD1", ink: "#7A3B52" };

const candle = (x: number, y: number, k: number, c: Palette) => `<g transform="translate(${x} ${y}) scale(${k})">
  <ellipse cx="0" cy="64" rx="36" ry="6" fill="#000" opacity=".2"/>
  <rect x="-30" y="0" width="60" height="64" rx="10" fill="${c.jar}" stroke="rgba(255,255,255,.55)" stroke-width="1.5"/>
  <rect x="-27" y="5" width="54" height="56" rx="7" fill="${c.wax}"/>
  <ellipse cx="0" cy="6" rx="26" ry="4.5" fill="${c.top}"/>
  <rect x="-21" y="22" width="42" height="24" rx="3" fill="#FFFDF8"/>
  <text x="0" y="32" text-anchor="middle" font-family="Geist,Arial,sans-serif" font-size="5.6" letter-spacing="1.2" fill="${c.ink}">ATELIER</text>
  <text x="0" y="41" text-anchor="middle" font-family="Bricolage Grotesque,Georgia,serif" font-size="8" font-weight="700" fill="${c.ink}">Sauge</text>
  <line x1="0" y1="5" x2="0" y2="-3" stroke="#3A2A1E" stroke-width="1.6" stroke-linecap="round"/>
  <circle cx="0" cy="-12" r="17" fill="url(#gxa-glow)"/>
  <path d="M0 -24 C6 -16 7 -10 0 -2 C-7 -10 -6 -16 0 -24Z" fill="url(#gxa-fl)"/>
</g>`;
const leaf = (x: number, y: number, r: number, col: string) =>
  `<ellipse cx="${x}" cy="${y}" rx="9" ry="3.6" transform="rotate(${r} ${x} ${y})" fill="${col}"/>`;
const scene = (id: string, b1: string, b2: string, table: string, body: string) =>
  `<svg class="gxa-sc" viewBox="0 0 160 200" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
  <defs>
    <radialGradient id="gxa-fl" cx=".5" cy=".7" r=".6"><stop offset="0" stop-color="#FFF8D6"/><stop offset=".55" stop-color="#FFC24A"/><stop offset="1" stop-color="#FF7A1A"/></radialGradient>
    <radialGradient id="gxa-glow"><stop offset="0" stop-color="#FFD27A" stop-opacity=".75"/><stop offset="1" stop-color="#FFD27A" stop-opacity="0"/></radialGradient>
    <linearGradient id="gxa-bg-${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${b1}"/><stop offset="1" stop-color="${b2}"/></linearGradient>
  </defs>
  <rect width="160" height="200" fill="url(#gxa-bg-${id})"/><circle cx="80" cy="96" r="70" fill="#fff" opacity=".12"/>
  <rect y="150" width="160" height="50" fill="${table}"/>${body}</svg>`;

const POSTS = [
  {
    angle: "L'ambiance", fmt: "Reels · 9:16", cta: ["ateliersauge.fr", "Ambre & Cèdre", "Acheter"],
    svg: scene("a", "#C98B5A", "#6B3E2A", "#4A2A1C", leaf(26, 160, -20, "#C8612B") + leaf(132, 166, 25, "#E09A3E") + candle(80, 88, 1, AMBER)),
    kind: "reels" as const,
  },
  {
    angle: "Le fait-main", fmt: "Image · 4:5", cta: ["ateliersauge.fr", "Sauge & Figue", "Acheter"],
    svg: scene("b", "#5E7A66", "#2C3E33", "#22302A", leaf(30, 162, -15, "#8FA57E") + candle(80, 88, 1, SAGE)),
    kind: "image" as const,
  },
  {
    angle: "La collection", fmt: "Carrousel · 1:1", cta: ["ateliersauge.fr", "Coffret trio", "Découvrir"],
    svg: scene("c", "#D99AAA", "#8A4A60", "#6A3448", candle(36, 104, 0.62, AMBER) + candle(124, 104, 0.62, SAGE) + candle(80, 92, 0.82, ROSE)),
    kind: "carousel" as const,
  },
];

/** Étapes d'animation : 0 = rien, 1 = réponse, 2-4 = les trois pubs, 5 = campagne en diffusion. */
const ALL = 5;

export function AuthShowcase() {
  const [typed, setTyped] = useState(PROMPT.length);
  const [step, setStep] = useState(ALL);

  // L'aperçu s'affiche complet, puis rejoue la scène en boucle (sauf si l'utilisateur limite les animations).
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timers: number[] = [];
    let typing: number | undefined;
    const run = () => {
      setStep(0);
      setTyped(0);
      let i = 0;
      typing = window.setInterval(() => {
        i += 1;
        setTyped(i);
        if (i >= PROMPT.length) {
          window.clearInterval(typing);
          for (let s = 1; s <= ALL; s += 1) timers.push(window.setTimeout(() => setStep(s), 400 + (s - 1) * 450));
          timers.push(window.setTimeout(run, 10000));
        }
      }, 36);
    };
    timers.push(window.setTimeout(run, 3500));
    return () => {
      timers.forEach((t) => window.clearTimeout(t));
      if (typing !== undefined) window.clearInterval(typing);
    };
  }, []);

  const on = (s: number) => (step >= s ? " gxa-on" : "");

  return (
    <aside className="gxa-right" aria-label="Aperçu de Growthity">
      <div className="gxa-pitch">
        <div className="gxa-eyebrow">Publicité Meta, sans agence</div>
        <h2>Tu décris ta pub. Growthity la crée et la publie.</h2>
      </div>

      <div className="gxa-mock" aria-hidden="true">
        <div className="gxa-ask">
          <div className="gxa-bubble">
            {PROMPT.slice(0, typed)}
            {typed < PROMPT.length && <span className="gxa-caret" />}
          </div>
          <span className="gxa-me">AS</span>
        </div>

        <div className={`gxa-reply${on(1)}`}>
          <span className="gxa-gav">
            <svg viewBox="0 0 24 24" fill="none">
              <defs>
                <linearGradient id="gxa-lg" x1="0" y1="1" x2="1" y2="0">
                  <stop offset="0" stopColor="#2563EB" /><stop offset=".52" stopColor="#7B61FF" /><stop offset="1" stopColor="#B05CF5" />
                </linearGradient>
              </defs>
              <path d="M2.5 17 8.5 11l5 5L21.5 8M16 8h5.5v5.5" stroke="url(#gxa-lg)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <p><b>3 pubs prêtes</b>, une par angle : l'ambiance, le fait-main, la collection.</p>
        </div>

        <div className="gxa-ads">
          {POSTS.map((p, k) => (
            <div key={p.angle} className={`gxa-post${on(2 + k)}`}>
              <div className="gxa-ph">
                <span className="gxa-pa">AS</span>
                <div><b>Atelier Sauge</b><small>Sponsorisé</small></div>
                <i>···</i>
              </div>
              <div className="gxa-vis">
                <div className="gxa-svg" dangerouslySetInnerHTML={{ __html: p.svg }} />
                <div className="gxa-ov">
                  {p.kind === "reels" && (
                    <>
                      <span className="gxa-tag">
                        <svg viewBox="0 0 10 10"><path d="M2 1l7 4-7 4z" fill="#fff" /></svg>Reels
                      </span>
                      <span className="gxa-subcap">Ton salon sent l'automne</span>
                      <span className="gxa-prog"><i /></span>
                    </>
                  )}
                  {p.kind === "image" && (
                    <>
                      <span className="gxa-hook">Coulée à la main à Bordeaux</span>
                      <span className="gxa-price">24 €</span>
                    </>
                  )}
                  {p.kind === "carousel" && (
                    <>
                      <span className="gxa-hook gxa-hook-n">3 parfums d'automne</span>
                      <span className="gxa-dots"><i /><i /><i /></span>
                      <span className="gxa-n13">1/3</span>
                    </>
                  )}
                </div>
              </div>
              <div className="gxa-pf">
                <div><small>{p.cta[0]}</small><b>{p.cta[1]}</b></div>
                <span>{p.cta[2]}</span>
              </div>
              <div className="gxa-angle"><b>{p.angle}</b>{p.fmt}</div>
            </div>
          ))}
        </div>

        <div className={`gxa-pub${on(5)}`}>
          <span className="gxa-metalg">
            {/* Logo Meta officiel (même tracé que MetaIcon), avec son dégradé bleu */}
            <svg viewBox="0 0 24 24" role="img" aria-label="Meta">
              <defs>
                <linearGradient id="gxa-meta" x1="0" y1="12" x2="24" y2="12" gradientUnits="userSpaceOnUse">
                  <stop offset="0" stopColor="#0064E1" /><stop offset=".55" stopColor="#0073EE" /><stop offset="1" stopColor="#0082FB" />
                </linearGradient>
              </defs>
              <path fill="url(#gxa-meta)" d="M6.915 4.03c-1.968 0-3.683 1.28-4.871 3.113C.704 9.208 0 11.883 0 14.449c0 .706.07 1.369.21 1.973a6.624 6.624 0 0 0 .265.86 5.297 5.297 0 0 0 .371.761c.696 1.159 1.818 1.927 3.593 1.927 1.497 0 2.633-.671 3.965-2.444.76-1.012 1.144-1.626 2.663-4.32l.756-1.339.186-.325c.061.1.121.196.183.3l2.152 3.595c.724 1.21 1.665 2.556 2.47 3.314 1.046.987 1.992 1.22 3.06 1.22 1.075 0 1.876-.355 2.455-.843a3.743 3.743 0 0 0 .81-.973c.542-.939.861-2.127.861-3.745 0-2.72-.681-5.357-2.084-7.45-1.282-1.912-2.957-2.93-4.716-2.93-1.047 0-2.088.467-3.053 1.308-.652.57-1.257 1.29-1.82 2.05-.69-.875-1.335-1.547-1.958-2.056-1.182-.966-2.315-1.303-3.454-1.303zm10.16 2.053c1.147 0 2.188.758 2.992 1.999 1.132 1.748 1.647 4.195 1.647 6.4 0 1.548-.368 2.9-1.839 2.9-.58 0-1.027-.23-1.664-1.004-.496-.601-1.343-1.878-2.832-4.358l-.617-1.028a44.908 44.908 0 0 0-1.255-1.98c.07-.109.141-.224.211-.327 1.12-1.667 2.118-2.602 3.358-2.602zm-10.201.553c1.265 0 2.058.791 2.675 1.446.307.327.737.871 1.234 1.579l-1.02 1.566c-.757 1.163-1.882 3.017-2.837 4.338-1.191 1.649-1.81 1.817-2.486 1.817-.524 0-1.038-.237-1.383-.794-.263-.426-.464-1.13-.464-2.046 0-2.221.63-4.535 1.66-6.088.454-.687.964-1.226 1.533-1.533a2.264 2.264 0 0 1 1.088-.285z" />
            </svg>
          </span>
          <div><b>Campagne « Bougies d'automne »</b><small>Facebook et Instagram · 20 € par jour</small></div>
          <span className="gxa-st">En diffusion</span>
        </div>
      </div>

      <ul className="gxa-trio">
        <li><span className="gxa-n">01</span><b>Décris</b>ton produit, ton offre, ton budget</li>
        <li><span className="gxa-n">02</span><b>Choisis</b>parmi les pubs proposées</li>
        <li><span className="gxa-n">03</span><b>Publie</b>sur Facebook et Instagram</li>
      </ul>
    </aside>
  );
}
