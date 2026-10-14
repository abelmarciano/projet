// Inventaire des couleurs en dur, hsl() et jetons var() de gx-console.css (lecture seule).
// Usage : node colors.mjs <gx-console.css> <sortie.json>
import fs from "node:fs";
import postcss from "postcss";
const [, , IN, OUT] = process.argv;
const root = postcss.parse(fs.readFileSync(IN, "utf8"));

// jetons clairs / sombres définis dans la feuille (blocs .console-app / .dark .console-app)
const light = {}, dark = {};
root.walkRules((r) => {
  const s = r.selector.replace(/\s+/g, " ");
  const tgt = /^\.dark \.console-app/.test(s) ? dark : /^\.console-app,/.test(s) ? light : null;
  if (!tgt) return;
  r.walkDecls(/^--gx-/, (d) => { tgt[d.prop] = d.value.trim(); });
});
const norm = (c) => {
  c = c.toLowerCase();
  if (/^#[0-9a-f]{3}$/.test(c)) c = "#" + [...c.slice(1)].map((x) => x + x).join("");
  if (c === "white") c = "#ffffff"; if (c === "black") c = "#000000";
  return c;
};
const byLight = {};
for (const [k, v] of Object.entries(light)) { const n = norm(v); (byLight[n] ||= []).push(k); }

const COLOR = /#[0-9a-fA-F]{3,8}\b|rgba?\([^)]*\)|hsla?\([^)]*\)|\b(?:white|black)\b/g;
const items = [];
root.walkDecls((d) => {
  if (d.prop.startsWith("--")) return; // définitions de jetons : hors inventaire
  let p = d.parent; while (p && p.type !== "rule") p = p.parent;
  const inKf = (() => { for (let q = d.parent; q; q = q.parent) if (q.type === "atrule" && /keyframes/.test(q.name)) return true; return false; })();
  const sel = inKf ? "@keyframes" : p ? p.selector.replace(/\s+/g, " ") : "?";
  const m = d.value.match(COLOR); if (!m) return;
  for (const c of m) {
    const n = norm(c);
    let proposal = null, note = "";
    if (/^hsla?\(/i.test(c)) { proposal = "vérifier"; note = "hsl()"; }
    else if (byLight[n]) {
      const toks = byLight[n];
      const same = toks.filter((t) => dark[t] === undefined || norm(dark[t]) === n);
      proposal = toks.map((t) => `var(${t})`).join(" ou ");
      note = same.length ? "même valeur en sombre" : `change le rendu en sombre (${toks.map((t) => t + "=" + dark[t]).join(", ")})`;
    } else if (n === "#ffffff") { proposal = "garder (texte/icône sur fond violet ou média), ou jeton --gx-on-pri à créer"; note = "aucun jeton blanc fixe"; }
    else if (n === "#000000" || /^rgba\((0, ?0, ?0|16, ?18, ?23)/.test(n)) { proposal = "garder (ombre/voile/fond média)"; note = "ombre ou voile"; }
    else if (/^rgba\(255, ?255, ?255/.test(n)) { proposal = "garder (calque blanc translucide sur média)"; note = "translucide"; }
    else if (/^rgba\(91, ?63, ?228/.test(n)) { proposal = "color-mix(in srgb,var(--gx-pri) X%,transparent)"; note = "violet translucide"; }
    else { proposal = "à décider"; note = "aucun jeton de même valeur"; }
    items.push({ line: d.source.start.line, selector: sel.slice(0, 120), prop: d.prop, color: c, proposal, note });
  }
});
const summary = {};
for (const it of items) { const k = norm(it.color); summary[k] = (summary[k] || 0) + 1; }
fs.writeFileSync(OUT, JSON.stringify({ tokensLight: light, tokensDark: dark, count: items.length, byColor: Object.fromEntries(Object.entries(summary).sort((a, b) => b[1] - a[1])), items }, null, 1));
console.log(items.length, JSON.stringify(Object.fromEntries(Object.entries(summary).sort((a, b) => b[1] - a[1]))));
