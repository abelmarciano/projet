// Compare les styles calculés (toutes propriétés, + ::before/::after/::placeholder) de chaque élément
// entre old.html (ancienne feuille) et new.html (nouvelle feuille).
// Usage : node run.mjs <dossier contenant old.html/new.html> [nom-fichier-b=new.html]
import { chromium } from "/opt/node22/lib/node_modules/playwright/index.mjs";
import http from "node:http";
import fs from "node:fs";
import path from "node:path";

const DIR = path.resolve(process.argv[2]);
const B = process.argv[3] || "new.html";
const WIDTHS = process.env.WIDTHS ? process.env.WIDTHS.split(",").map(Number) : [1680, 1440, 1100, 850, 700, 600, 390];
const THEMES = ["light", "dark"];
const EXTRA = [{ w: 1440, theme: "light", reduced: true }, { w: 390, theme: "dark", reduced: true }];

const server = http.createServer((req, res) => {
  const f = path.join(DIR, decodeURIComponent(req.url.split("?")[0]));
  if (!f.startsWith(DIR) || !fs.existsSync(f)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { "content-type": f.endsWith(".css") ? "text/css" : "text/html; charset=utf-8" });
  fs.createReadStream(f).pipe(res);
}).listen(0);
const port = server.address().port;

const collect = async (page, detailIdx) => page.evaluate((detailIdx) => {
  const els = [...document.body.querySelectorAll("*")];
  const fnv = (s) => { let h = 0x811c9dc5; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193); } return h >>> 0; };
  const PSE = [null, "::before", "::after", "::placeholder"];
  const snap = (el) => {
    const out = {};
    for (const pe of PSE) {
      if (pe === "::placeholder" && el.tagName !== "INPUT" && el.tagName !== "TEXTAREA") continue;
      const cs = getComputedStyle(el, pe);
      for (let i = 0; i < cs.length; i++) { const p = cs[i]; out[(pe || "") + p] = cs.getPropertyValue(p); }
    }
    return out;
  };
  if (detailIdx) return detailIdx.map((i) => snap(els[i]));
  let props = 0;
  let probeStr = null;
  const hashes = els.map((el, i) => { const o = snap(el); const k = Object.keys(o).sort(); /* ordre d énumération des propriétés personnalisées variable */ props += k.length; const str = k.map((x) => x + ":" + o[x]).join(";"); if (i === 1) probeStr = str; return fnv(str); });
  return { n: els.length, props, hashes, probe: snap(els[1]), probeStr };
}, detailIdx);

const browser = await chromium.launch();
const results = []; let totalDiffEls = 0, totalCompared = 0, totalProps = 0;
const runs = process.env.NOEXTRA ? WIDTHS.flatMap((w) => THEMES.map((theme) => ({ w, theme, reduced: false }))) : [...WIDTHS.flatMap((w) => THEMES.map((theme) => ({ w, theme, reduced: false }))), ...EXTRA];
for (const r of runs) {
  const ctx = await browser.newContext({ viewport: { width: r.w, height: 900 }, reducedMotion: r.reduced ? "reduce" : "no-preference", colorScheme: "light" });
  const pa = await ctx.newPage(), pb = await ctx.newPage();
  for (const [p, f] of [[pa, "old.html"], [pb, B]]) {
    // toutes les animations figées à t=0 (déterminisme), sans toucher aux propriétés comparées
    const cdp = await ctx.newCDPSession(p); await cdp.send("Animation.enable"); await cdp.send("Animation.setPlaybackRate", { playbackRate: 0 });
    await p.goto(`http://127.0.0.1:${port}/${f}`, { waitUntil: "load" });
    if (r.theme === "dark") await p.evaluate(() => document.documentElement.classList.add("dark"));
    await p.evaluate(() => new Promise((res) => requestAnimationFrame(() => requestAnimationFrame(res))));
  }
  const a = await collect(pa), b = await collect(pb);
  if (a.n !== b.n) throw new Error("nombre d'éléments différent");
  if (a.probe && b.probe) { const pd = Object.keys(a.probe).filter((k) => a.probe[k] !== b.probe[k]).map((k) => k + ": " + a.probe[k] + " -> " + b.probe[k]); if (pd.length) console.log("  sonde :", pd.join(" | ").slice(0, 600)); }
  if (a.probeStr !== b.probeStr) { const A = a.probeStr.split(";"), Bs = b.probeStr.split(";"); console.log("  sonde-hash :", A.length, Bs.length, A.filter((x, i) => x !== Bs[i]).slice(0, 5).join(" | ").slice(0, 500), "//", Bs.filter((x, i) => x !== A[i]).slice(0, 5).join(" | ").slice(0, 500)); }
  const diffIdx = a.hashes.map((h, i) => (h !== b.hashes[i] ? i : -1)).filter((i) => i >= 0);
  const details = [];
  if (diffIdx.length) {
    const take = diffIdx.slice(0, 40);
    const da = await collect(pa, take), db = await collect(pb, take);
    take.forEach((idx, k) => {
      const diffs = Object.keys({ ...da[k], ...db[k] }).filter((p) => da[k][p] !== db[k][p]).map((p) => `${p}: ${da[k][p]} -> ${db[k][p]}`);
      details.push({ idx, diffs });
    });
    const htmlOf = await pa.evaluate((ids) => { const els = [...document.body.querySelectorAll("*")]; return ids.map((i) => els[i].outerHTML.slice(0, 200)); }, take);
    details.forEach((d, k) => (d.el = htmlOf[k]));
  }
  totalDiffEls += diffIdx.length; totalCompared += a.n; totalProps += a.props;
  results.push({ width: r.w, theme: r.theme, reducedMotion: r.reduced, elements: a.n, propertiesCompared: a.props, elementsWithDifferences: diffIdx.length, details });
  console.log(`${r.w}px ${r.theme}${r.reduced ? " reduce" : ""}: ${a.n} éléments, ${a.props} valeurs comparées, ${diffIdx.length} éléments différents`);
  await ctx.close();
}
await browser.close(); server.close();
const summary = { compared: B, runs: results.length, elementsCompared: totalCompared, valuesCompared: totalProps, elementsWithDifferences: totalDiffEls };
fs.writeFileSync(path.join(DIR, `result-${path.basename(B, ".html")}.json`), JSON.stringify({ summary, results }, null, 1));
console.log(JSON.stringify(summary));
