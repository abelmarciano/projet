// Candidats supplémentaires (NON appliqués) : B plus loin, même contexte, liste de sélecteurs de B ⊇ liste de A (A ≠ B),
// ou B sans condition @media placée plus loin alors que A est sous @media. Lecture seule, sur la feuille déjà nettoyée.
import fs from "node:fs"; import postcss from "postcss";
const css = fs.readFileSync(process.argv[2], "utf8"); const root = postcss.parse(css);
const split = (s) => { const o = []; let d = 0, c = ""; for (const ch of s) { if ("([".includes(ch)) d++; if (")]".includes(ch)) d--; if (ch === "," && !d) { o.push(c); c = ""; } else c += ch; } o.push(c); return o.map((x) => x.replace(/\s+/g, " ").trim().replace(/ ?([>+~]) ?/g, "$1")); };
const ctx = (n) => { const p = []; for (let q = n.parent; q && q.type !== "root"; q = q.parent) p.unshift(q.type === "atrule" ? "@" + q.name + " " + q.params.replace(/\s+/g, "") : "?"); return p; };
const rules = []; root.walkRules((r) => { if (ctx(r).some((c) => c.startsWith("@keyframes"))) return; rules.push({ r, sels: new Set(split(r.selector)), ctx: ctx(r) }); });
const SH = { padding: ["padding-top","padding-right","padding-bottom","padding-left"], margin: ["margin-top","margin-right","margin-bottom","margin-left"], background: ["background-color","background-image"], border: ["border-color","border-width","border-style"], overflow:["overflow-x","overflow-y"], inset:["top","right","bottom","left"], gap:["row-gap","column-gap"] };
const cov = (b, a) => b === a || (SH[b] || []).includes(a);
const out = [];
rules.forEach((A, i) => A.r.each((d) => { if (d.type !== "decl") return;
  for (let j = i + 1; j < rules.length; j++) { const B = rules[j];
    const sameCtx = B.ctx.join("|") === A.ctx.join("|"); const bLooser = B.ctx.length < A.ctx.length && B.ctx.every((c, k) => c === A.ctx[k]);
    if (!sameCtx && !bLooser) continue;
    if (![...A.sels].every((s) => B.sels.has(s))) continue;
    if (sameCtx && A.sels.size === B.sels.size) continue; // déjà traité par analyze.mjs
    const bd = B.r.nodes.find((x) => x.type === "decl" && cov(x.prop, d.prop) && (!d.important || x.important));
    if (bd) { out.push({ line: d.source.start.line, selector: A.r.selector, decl: d.prop + ":" + d.value, by: B.r.selector.slice(0, 80) + " { " + bd.prop + ":" + bd.value + " } l." + bd.source.start.line + (bLooser ? " (B hors @media)" : "") }); break; }
  } }));
fs.writeFileSync(process.argv[3], JSON.stringify(out, null, 1)); console.log(out.length); for (const o of out) console.log(o.line, o.selector.slice(0,60), "|", o.decl.slice(0,60), "=>", o.by.slice(0,140));
