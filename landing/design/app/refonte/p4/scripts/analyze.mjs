// P4 — analyse et nettoyage sûr de gx-console.css
// Usage : node analyze.mjs <entrée.css> <sortie.css> <rapport.json>
// Ne supprime QUE :
//  1. une déclaration A morte : une règle B placée plus loin (ou une déclaration plus loin dans la même règle),
//     même liste de sélecteurs (normalisée, ordre indifférent), même contexte @media/@supports exact,
//     déclare la même propriété (ou un raccourci qui couvre la propriété longue de A, table SHORTHANDS),
//     et B l'emporte en importance (A normal ; ou A et B !important) ;
//     garde-fou « repli » : si la valeur de B utilise une syntaxe récente (dvh, color-mix, clamp…) qu'un
//     navigateur ancien pourrait rejeter, A est conservée (repli volontaire) et listée à part ;
//  2. les règles devenues vides ;
//  3. les @keyframes de même nom redéfinis plus loin dans le même contexte.
// Aucune fusion, aucun réordonnancement, aucun changement de valeur.
import fs from "node:fs";
import postcss from "postcss";

const [, , IN, OUT, REPORT] = process.argv;
const src = fs.readFileSync(IN, "utf8");
const root = postcss.parse(src, { from: IN });

// ---------- normalisation ----------
function splitTopLevel(s, sep) {
  const out = []; let depth = 0, q = null, cur = "";
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (q) { cur += c; if (c === "\\") { cur += s[++i] ?? ""; continue; } if (c === q) q = null; continue; }
    if (c === '"' || c === "'") { q = c; cur += c; continue; }
    if (c === "(" || c === "[") depth++;
    if (c === ")" || c === "]") depth--;
    if (c === sep && depth === 0) { out.push(cur); cur = ""; continue; }
    cur += c;
  }
  out.push(cur);
  return out;
}
function normSel(sel) {
  // espaces : compactés ; espaces autour de > + ~ supprimés (hors chaînes)
  let out = "", q = null;
  for (let i = 0; i < sel.length; i++) {
    const c = sel[i];
    if (q) { out += c; if (c === q) q = null; continue; }
    if (c === '"' || c === "'") { q = c; out += c; continue; }
    if (/\s/.test(c)) { if (!out.endsWith(" ")) out += " "; continue; }
    out += c;
  }
  out = out.trim().replace(/ ?([>+~,]) ?/g, "$1").replace(/\( /g, "(").replace(/ \)/g, ")");
  return out;
}
function selKey(selector) {
  return splitTopLevel(selector, ",").map(normSel).sort().join(" , ");
}
function ctxOf(node) {
  const parts = [];
  for (let p = node.parent; p && p.type !== "root"; p = p.parent) {
    if (p.type === "atrule") parts.unshift("@" + p.name + " " + p.params.replace(/\s+/g, " ").replace(/\s*([:(),])\s*/g, "$1").trim());
    else if (p.type === "rule") parts.unshift("rule:" + selKey(p.selector)); // CSS imbriqué (aucun ici)
  }
  return parts.join(" | ");
}
const inKeyframes = (n) => { for (let p = n.parent; p; p = p.parent) if (p.type === "atrule" && /keyframes$/i.test(p.name)) return true; return false; };

// ---------- raccourcis -> propriétés longues couvertes (liste volontairement prudente) ----------
const SIDES = ["top", "right", "bottom", "left"];
const SHORTHANDS = {
  margin: SIDES.map((s) => "margin-" + s),
  padding: SIDES.map((s) => "padding-" + s),
  inset: SIDES,
  gap: ["row-gap", "column-gap"],
  "grid-gap": ["row-gap", "column-gap", "grid-row-gap", "grid-column-gap"],
  overflow: ["overflow-x", "overflow-y"],
  "border-radius": ["border-top-left-radius", "border-top-right-radius", "border-bottom-right-radius", "border-bottom-left-radius"],
  "place-items": ["align-items", "justify-items"],
  "place-content": ["align-content", "justify-content"],
  "place-self": ["align-self", "justify-self"],
  flex: ["flex-grow", "flex-shrink", "flex-basis"],
  "flex-flow": ["flex-direction", "flex-wrap"],
  "border-width": SIDES.map((s) => `border-${s}-width`),
  "border-style": SIDES.map((s) => `border-${s}-style`),
  "border-color": SIDES.map((s) => `border-${s}-color`),
  ...Object.fromEntries(SIDES.map((s) => [`border-${s}`, [`border-${s}-width`, `border-${s}-style`, `border-${s}-color`]])),
  border: ["border-width", "border-style", "border-color", ...SIDES.flatMap((s) => [`border-${s}`, `border-${s}-width`, `border-${s}-style`, `border-${s}-color`])],
  outline: ["outline-width", "outline-style", "outline-color"],
  background: ["background-color", "background-image", "background-position", "background-size", "background-repeat", "background-attachment", "background-origin", "background-clip"],
  font: ["font-style", "font-weight", "font-size", "line-height", "font-family"],
  "text-decoration": ["text-decoration-line", "text-decoration-color", "text-decoration-style"],
  transition: ["transition-property", "transition-duration", "transition-timing-function", "transition-delay"],
  animation: ["animation-name", "animation-duration", "animation-timing-function", "animation-delay", "animation-iteration-count", "animation-direction", "animation-fill-mode", "animation-play-state"],
  "list-style": ["list-style-type", "list-style-position", "list-style-image"],
  "grid-template": ["grid-template-rows", "grid-template-columns", "grid-template-areas"],
  "grid-area": ["grid-row-start", "grid-column-start", "grid-row-end", "grid-column-end"],
  "grid-row": ["grid-row-start", "grid-row-end"],
  "grid-column": ["grid-column-start", "grid-column-end"],
};
const propName = (d) => (d.prop.startsWith("--") ? d.prop : d.prop.toLowerCase());
// B (prop pB) couvre-t-elle A (prop pA) ?
function covers(pB, pA) {
  if (pB === pA) return true;
  return (SHORTHANDS[pB] || []).includes(pA);
}
// valeurs qu'un navigateur ancien pourrait rejeter : on garde alors la déclaration précédente comme repli
const RISKY = /\b(dvh|svh|lvh|dvw|svw|lvw|dvb|dvi|cq[whib]|cqmin|cqmax)\b|color-mix\(|oklch\(|oklab\(|\blab\(|\blch\(|clamp\(|\bmin\(|\bmax\(|light-dark\(|\bround\(|anchor|-webkit-|-moz-|fit-content|\bcontent\b|stretch|subgrid|text-wrap|balance|pretty|\bclip\b|overlay|field-sizing|\bstart\b|\bend\b|\binline-size\b|env\(|\bhas\(/i;
// une valeur contenant var() est toujours acceptée à l'analyse (invalide seulement au calcul -> unset) : jamais de repli
function risky(d) { if (/var\(/i.test(d.value)) return false; return RISKY.test(d.value) || propName(d).startsWith("-webkit-") || propName(d) !== d.prop && !d.prop.startsWith("--"); }

// ---------- collecte ----------
const rules = [];
root.walkRules((r) => { if (inKeyframes(r)) return; rules.push(r); });
const removedDecls = [], keptFallbacks = [];
const groups = new Map();
rules.forEach((r, i) => { const k = ctxOf(r) + " || " + selKey(r.selector); if (!groups.has(k)) groups.set(k, []); groups.get(k).push(r); });

for (const [key, list] of groups) {
  // séquence ordonnée de toutes les déclarations du groupe (ordre du document)
  const decls = [];
  for (const r of list) r.each((n) => { if (n.type === "decl") decls.push(n); });
  for (let i = 0; i < decls.length; i++) {
    const A = decls[i]; const pA = propName(A);
    let killer = null, fallback = null;
    for (let j = i + 1; j < decls.length; j++) {
      const B = decls[j]; const pB = propName(B);
      if (!covers(pB, pA)) continue;
      if (A.important && !B.important) continue; // A !important l'emporte sur B normale
      if (risky(B) && !(pB === pA && B.value.trim() === A.value.trim())) { fallback = fallback || B; continue; }
      killer = B; break;
    }
    if (killer) removedDecls.push({ A, B: killer });
    else if (fallback) keptFallbacks.push({ A, B: fallback });
  }
}

// ---------- @keyframes redéfinis ----------
const kfs = new Map(), removedKf = [];
root.walkAtRules(/keyframes$/i, (a) => { const k = ctxOf(a) + " || " + a.name + " " + a.params.trim(); if (kfs.has(k)) removedKf.push({ A: kfs.get(k), B: a }); kfs.set(k, a); });

// ---------- application ----------
const lineOf = (n) => n.source.start.line;
const report = { input: IN, removedDeclarations: [], removedRules: [], removedKeyframes: [], keptFallbacks: [], emptiedRules: 0 };
for (const { A, B } of removedDecls) {
  report.removedDeclarations.push({ line: lineOf(A), selector: normSel(A.parent.selector), context: ctxOf(A.parent) || null, decl: `${A.prop}:${A.value}${A.important ? "!important" : ""}`, overriddenAtLine: lineOf(B), by: `${B.prop}:${B.value}${B.important ? "!important" : ""}`, sameRule: A.parent === B.parent });
}
for (const { A, B } of keptFallbacks) report.keptFallbacks.push({ line: lineOf(A), selector: normSel(A.parent.selector), decl: `${A.prop}:${A.value}`, laterLine: lineOf(B), later: `${B.prop}:${B.value}` });
for (const { A, B } of removedKf) report.removedKeyframes.push({ line: lineOf(A), name: A.params, redefinedAtLine: lineOf(B) });

const touchedRules = new Set();
for (const { A } of removedDecls) { touchedRules.add(A.parent); A.remove(); }
for (const { A } of removedKf) A.remove();
for (const r of touchedRules) {
  if (!r.nodes.some((n) => n.type === "decl" || n.type === "rule" || n.type === "atrule")) {
    report.removedRules.push({ line: lineOf(r), selector: normSel(r.selector), context: ctxOf(r) || null, hadComments: r.nodes.length > 0 });
    const parent = r.parent; r.remove();
    // une @media vidée est supprimée aussi
    let p = parent;
    while (p && p.type === "atrule" && p.nodes && p.nodes.filter((n) => n.type !== "comment").length === 0) { const pp = p.parent; report.removedRules.push({ line: lineOf(p), selector: "@" + p.name + " " + p.params, context: null }); p.remove(); p = pp; }
  }
}
report.emptiedRules = report.removedRules.length;

// ---------- sortie : on garde la mise en forme d'origine ----------
let out = root.toString();
// une règle supprimée en fin de ligne peut laisser une ligne vide : on ne compacte QUE les lignes devenues vides
// (les lignes vides d'origine sont conservées)
fs.writeFileSync(OUT, out);
const lines = (s) => s.split("\n").length - (s.endsWith("\n") ? 1 : 0);
report.linesBefore = lines(src); report.linesAfter = lines(out);
report.bytesBefore = Buffer.byteLength(src); report.bytesAfter = Buffer.byteLength(out);
report.counts = { removedDeclarations: report.removedDeclarations.length, removedRules: report.removedRules.length, removedKeyframes: report.removedKeyframes.length, keptFallbacks: report.keptFallbacks.length };
// sélecteurs (même contexte) définis plusieurs fois, avant / après
const dupCount = (rt) => { const m = new Map(); rt.walkRules((r) => { if (inKeyframes(r)) return; const k = ctxOf(r) + " || " + selKey(r.selector); m.set(k, (m.get(k) || 0) + 1); }); return [...m.values()].filter((v) => v > 1).length; };
report.duplicateSelectorsBefore = dupCount(postcss.parse(src)); report.duplicateSelectorsAfter = dupCount(postcss.parse(out));
fs.writeFileSync(REPORT, JSON.stringify(report, null, 1));
console.log(JSON.stringify({ ...report.counts, linesBefore: report.linesBefore, linesAfter: report.linesAfter, bytesBefore: report.bytesBefore, bytesAfter: report.bytesAfter, dupBefore: report.duplicateSelectorsBefore, dupAfter: report.duplicateSelectorsAfter }));
