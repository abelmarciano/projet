#!/usr/bin/env python3
"""v37 : suggestions « Ou modifier » en petites puces, étapes et « Et ensuite ? » au design de la maquette Chat v3.
Présentation uniquement. Usage : python3 apply-v37.py [--check]"""
import sys, pathlib
CHECK = "--check" in sys.argv
R = [
 ("src/routes/_authenticated/create.tsx", [
  ("  const searchable = suggestions.length >= 4;",
   "  // Suggestions qui modifient un brief ou un résultat : petites puces « Ou modifier : », sans recherche ni « Ou écris ».\n  const modMode = suggestions.some((suggestion) => /(?:chang[eé]|modifi|reformul|importer|accroche|version|plut[oô]t|galerie|variation|d[ée]cline)/i.test(suggestion));\n  const searchable = suggestions.length > 8 && !modMode;"),
  ('      className={`gx-sug-list${suggestions.length >= 4 ? " gx-boxed" : ""}`}',
   '      className={`gx-sug-list${suggestions.length >= 4 ? " gx-boxed" : ""}${modMode ? " gx-c3-mod" : ""}`}'),
  ('      {suggestions.some((suggestion) => /(?:chang[eé]|modifi|reformul|importer des photos|accroche)/i.test(suggestion)) && <small className="gx-c3-mods-label">Ou modifier :</small>}',
   '      {modMode && <small className="gx-c3-mods-label">Ou modifier :</small>}'),
  ('      <label className="gx-c3-write" htmlFor="gx-chat3-input"><Pencil className="gx-i" aria-hidden />Ou écris ta réponse</label>',
   '      {!modMode && !locked && <label className="gx-c3-write" htmlFor="gx-chat3-input"><Pencil className="gx-i" aria-hidden />Ou écris ta réponse</label>}'),
  ('      <div className="gx-chips gx-c3-next"><small className="gx-c3-mods-label">Ou modifier :</small>',
   '      <div className="gx-chips gx-c3-next">'),
  ("              <span>Détails & voix</span>", "              <span>Détails et voix</span>"),
  (': completedSteps.length > 0 ? <details className="gx-c3-steps">',
   ': completedSteps.length > 0 && toolParts.length === 0 ? <details className="gx-c3-steps">'),
 ]),
]
CSS_FILE = "src/styles/gx-chat-v3.css"
CSS_MARK = "/* v37 : Ou modifier en petites puces */"
CSS = CSS_MARK + """
.gx-chat3 .gx-sug-list.gx-c3-mod{display:flex;flex-direction:row;flex-wrap:wrap;align-items:center;gap:6px}
.gx-chat3 .gx-sug-list.gx-c3-mod .gx-sug-items{display:contents}
.gx-chat3 .gx-sug-list .gx-c3-mods-label{display:inline-flex;align-items:center;height:30px;margin:0 2px 0 0;font-size:12.5px;font-weight:400;color:var(--gx-c3-dim);text-align:left;align-self:center}
.gx-chat3 .gx-sug-list.gx-c3-mod .gx-sug-opt{min-height:30px;height:30px;padding:0 11px;gap:6px;border:1px solid var(--gx-c3-line);border-radius:999px;background:var(--gx-c3-surface);color:var(--gx-c3-muted);font-weight:500}
.gx-chat3 .gx-sug-list.gx-c3-mod .gx-sug-opt .gx-sug-t{font-size:13px;white-space:nowrap}
.gx-chat3 .gx-sug-list.gx-c3-mod .gx-sug-opt:hover{background:var(--gx-c3-raised);border-color:var(--gx-c3-line2);color:var(--gx-c3-fg)}
.gx-chat3 .gx-sug-list.gx-c3-mod .gx-sug-opt>svg,.gx-chat3 .gx-sug-list.gx-c3-mod .gx-sug-opt .gx-cb-ic,.gx-chat3 .gx-sug-list.gx-c3-mod .gx-sug-opt .gx-cb-ic svg{width:14px;height:14px;color:var(--gx-c3-dim)}
.gx-chat3 .gx-sug-list.gx-c3-mod .gx-sug-opt .gx-cb-ic{display:inline-grid;place-items:center;background:none;padding:0}
.gx-chat3 .gx-c3-next-label{font-size:11.5px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:var(--gx-c3-dim);margin:2px 0 0}
.gx-chat3 .gx-c3-next{display:flex;flex-wrap:wrap;gap:6px}
.gx-chat3 .gx-c3-steps{margin:0 0 4px;font-size:13px;color:var(--gx-c3-dim)}
.gx-chat3 .gx-c3-steps summary{display:inline-flex;align-items:center;gap:8px}
"""
root = pathlib.Path(".")
ok = True
for f, reps in R:
    p = root / f; s = p.read_text()
    for old, new in reps:
        n = s.count(old)
        if n != 1:
            print(f"ÉCHEC {f}: trouvé {n} fois : {old[:70]!r}"); ok = False; continue
        s = s.replace(old, new)
    if ok and not CHECK: p.write_text(s)
cp = root / CSS_FILE; cs = cp.read_text()
if CSS_MARK in cs: print("CSS v37 déjà présent")
elif not CHECK and ok: cp.write_text(cs.rstrip() + "\n" + CSS)
print("OK" if ok else "ÉCHEC", "(vérification seule)" if CHECK else "")
sys.exit(0 if ok else 1)
