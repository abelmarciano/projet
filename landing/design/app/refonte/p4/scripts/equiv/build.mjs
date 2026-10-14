// Construit la page de test d'équivalence à partir de TOUS les sélecteurs de l'ancienne feuille.
// Usage : node build.mjs <ancien.css> <nouveau.css> <dossier-sortie>
// - les pseudo-classes d'interaction (:hover, :focus…, :disabled…) sont remplacées À L'IDENTIQUE dans les deux
//   feuilles par des attributs [data-p-…] (même spécificité), pour pouvoir tester ces états de façon statique ;
// - chaque sélecteur produit un fragment DOM qui le satisfait (descendants, enfants, frères, :has, :nth-child…) ;
// - chaque classe gx-* de la feuille produit en plus un élément isolé.
import fs from "node:fs";
import path from "node:path";
import postcss from "postcss";
import selParser from "postcss-selector-parser";

const [, , OLD, NEW, OUTDIR] = process.argv;
fs.mkdirSync(OUTDIR, { recursive: true });
const STATES = ["hover", "focus-visible", "focus-within", "focus", "active", "disabled", "checked", "placeholder-shown", "target", "visited", "link", "any-link"];
const transformSel = (sel) => selParser((rootSel) => {
  rootSel.walkPseudos((p) => {
    const name = p.value.replace(/^:+/, "").toLowerCase();
    if (p.value.startsWith("::")) return;
    if (STATES.includes(name)) p.replaceWith(selParser.attribute({ attribute: "data-p-" + name, raws: {} }));
  });
}).processSync(sel);
function transformCss(css) {
  const root = postcss.parse(css);
  root.walkRules((r) => { let inKf = false; for (let p = r.parent; p; p = p.parent) if (p.type === "atrule" && /keyframes/.test(p.name)) inKf = true; if (!inKf) r.selector = transformSel(r.selector); });
  return root.toString();
}
const oldCss = fs.readFileSync(OLD, "utf8"), newCss = fs.readFileSync(NEW, "utf8");
fs.writeFileSync(path.join(OUTDIR, "old.css"), transformCss(oldCss));
fs.writeFileSync(path.join(OUTDIR, "new.css"), transformCss(newCss));

// ---------- synthèse DOM ----------
const VOID = new Set(["img", "input", "br", "hr", "source", "meta", "link", "col", "area", "wbr"]);
const SVGT = new Set(["svg", "path", "circle", "rect", "line", "polyline", "g", "text"]);
let pseudoEls = 0;
class N { constructor() { this.tag = "div"; this.cls = new Set(); this.attrs = {}; this.id = null; this.children = []; this.before = 0; this.pseudo = new Set(); } }
function applyCompound(node, nodes) {
  // nodes : liste de nœuds du sélecteur (un composé, sans combinateur)
  for (const t of nodes) {
    if (t.type === "tag") { if (t.value !== "*") node.tag = t.value.toLowerCase(); }
    else if (t.type === "class") node.cls.add(t.value);
    else if (t.type === "id") node.id = t.value;
    else if (t.type === "universal") {}
    else if (t.type === "attribute") {
      const a = t.attribute; const v = t.value != null ? t.value.replace(/^["']|["']$/g, "") : "";
      if (a === "class") { node.cls.add(t.operator === "*=" || t.operator === "^=" ? v + "zz" : v || "x"); }
      else node.attrs[a] = t.operator === "*=" ? "zz" + v + "zz" : t.operator === "$=" ? "zz" + v : t.operator === "^=" ? v + "zz" : v;
    } else if (t.type === "pseudo") {
      const name = t.value.toLowerCase();
      if (name.startsWith("::") || ["::before", "::after", ":before", ":after"].includes(name)) { node.pseudo.add(name.replace(/^:+/, "")); continue; }
      if (STATES.includes(name.replace(/^:+/, ""))) { node.attrs["data-p-" + name.replace(/^:+/, "")] = ""; continue; }
      if (name === ":is" || name === ":where" || name === ":matches") {
        const first = t.nodes[0];
        if (first && !first.nodes.some((x) => x.type === "combinator")) applyCompound(node, first.nodes);
      } else if (name === ":has") {
        const inner = t.nodes[0]; if (inner) { const chain = buildChain(inner.nodes, true); if (chain) node.children.push(...chain); }
      } else if (name === ":nth-child" || name === ":nth-of-type") {
        const arg = String(t.nodes[0] ?? "").trim(); let k = 1;
        const m1 = arg.match(/^(\d+)$/); const m2 = arg.match(/^n\s*\+\s*(\d+)$/); const m3 = arg === "even" ? 2 : arg === "odd" ? 1 : null;
        if (m1) k = +m1[1]; else if (m2) k = +m2[1]; else if (m3) k = m3; else if (/^-n\s*\+\s*(\d+)$/.test(arg)) k = 1;
        node.before = Math.max(node.before, k - 1); node.nthType = name === ":nth-of-type";
      } else if (name === ":last-child" || name === ":only-child" || name === ":first-child" || name === ":empty" || name === ":not" || name === ":root") {}
    }
  }
}
// construit une chaîne de nœuds ; renvoie la liste des nœuds de plus haut niveau (frères possibles)
function buildChain(nodes, relative = false) {
  const comps = [[]]; const combs = [];
  for (const t of nodes) { if (t.type === "combinator") { if (comps[comps.length - 1].length === 0 && relative) { combs.push(t.value.trim() || " "); continue; } combs.push(t.value.trim() || " "); comps.push([]); } else comps[comps.length - 1].push(t); }
  if (relative && comps[0].length === 0) comps.shift();
  const top = []; let cur = null; let parentList = top;
  comps.forEach((c, i) => {
    const n = new N(); applyCompound(n, c);
    if (i === 0) { top.push(n); cur = n; parentList = top; return; }
    const comb = combs[relative && combs.length === comps.length ? i : i - 1];
    if (comb === "+" || comb === "~") { parentList.push(n); cur = n; }
    else { cur.children.push(n); parentList = cur.children; cur = n; }
  });
  return top;
}
function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;"); }
function render(n) {
  let fill = "";
  for (let i = 0; i < n.before; i++) fill += n.nthType ? `<${n.tag}></${n.tag}>` : `<span></span>`;
  const attrs = [];
  if (n.cls.size) attrs.push(`class="${esc([...n.cls].join(" "))}"`);
  if (n.id) attrs.push(`id="${esc(n.id)}"`);
  for (const [k, v] of Object.entries(n.attrs)) attrs.push(`${k}="${esc(v)}"`);
  if (n.tag === "input" && !n.attrs.placeholder) attrs.push(`placeholder="x"`);
  if (n.pseudo.size) attrs.push(`data-pe="${[...n.pseudo].join(" ")}"`);
  const open = `<${n.tag}${attrs.length ? " " + attrs.join(" ") : ""}>`;
  if (VOID.has(n.tag)) return fill + open;
  return fill + open + n.children.map(render).join("") + `</${n.tag}>`;
}

const root = postcss.parse(oldCss);
const fragments = []; const classes = new Set(); let nSel = 0, nFail = 0;
root.walkRules((r) => {
  for (let p = r.parent; p; p = p.parent) if (p.type === "atrule" && /keyframes/.test(p.name)) return;
  let ast; try { ast = selParser().astSync(r.selector); } catch { nFail++; return; }
  ast.walkClasses((c) => classes.add(c.value));
  for (const s of ast.nodes) {
    nSel++;
    let nodes = s.nodes.filter((x) => x.type !== "comment");
    // « .dark » seul en tête : porté par <html class="dark"> en passe sombre
    const firstComb = nodes.findIndex((x) => x.type === "combinator");
    const firstComp = firstComb < 0 ? nodes : nodes.slice(0, firstComb);
    if (firstComb > 0 && firstComp.length === 1 && firstComp[0].type === "class" && firstComp[0].value === "dark") nodes = nodes.slice(firstComb + 1);
    let top;
    try { top = buildChain(nodes); } catch { nFail++; continue; }
    const portal = top[0] && (top[0].cls.has("console-app") || top[0].cls.has("console-app-portal") || top[0].tag === "html" || top[0].tag === "body");
    fragments.push({ portal, html: top.map(render).join(""), sel: s.toString().trim() });
  }
});
for (const c of [...classes].sort()) fragments.push({ portal: false, html: `<div class="${esc(c)}"></div>`, sel: "." + c });
// mise en page : un bloc par fragment, dans .console-app (ou au niveau body pour les portails)
const inApp = fragments.filter((f) => !f.portal).map((f, i) => `<section data-f="${i}">${f.html}</section>`).join("\n");
const portals = fragments.filter((f) => f.portal).map((f) => `<section data-f="p">${f.html}</section>`).join("\n");
const page = (css) => `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="${css}"></head><body><div class="console-app">\n${inApp}\n</div>\n${portals}\n</body></html>`;
fs.writeFileSync(path.join(OUTDIR, "old.html"), page("old.css"));
fs.writeFileSync(path.join(OUTDIR, "new.html"), page("new.css"));
fs.writeFileSync(path.join(OUTDIR, "fragments.json"), JSON.stringify(fragments.map((f) => f.sel)));
console.log(JSON.stringify({ selectors: nSel, parseFailures: nFail, classes: classes.size, gxClasses: [...classes].filter((c) => c.startsWith("gx-")).length, fragments: fragments.length, portals: fragments.filter((f) => f.portal).length }));
