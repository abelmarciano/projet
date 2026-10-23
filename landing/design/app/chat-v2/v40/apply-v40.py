#!/usr/bin/env python3
"""v40 : carte de résultat du Chat. « Aperçu Meta » passe dans la rangée d'actions, juste après « Publier sur Meta »,
au même style que « Ouvrir dans l'éditeur » ; 👍 👎 montent sur la ligne du titre, à droite.
Présentation uniquement : mêmes boutons, mêmes actions. Usage : python3 apply-v40.py [--check]"""
import sys, pathlib
CHECK = "--check" in sys.argv
PREVIEW = '<MetaPlacementPreviewButton video={{ id: ad.id, title: ad.title, url: ad.url, subtitlesConfig: ad.subtitlesConfig, aspectRatio: ad.aspectRatio }} />'
R = [
 ("src/routes/_authenticated/create.tsx", [
  # 1. Le bouton pleine largeur au-dessus des actions disparaît…
  ('        {ad.status === "ready" && ad.kind === "video" && ad.url && ' + PREVIEW + '}\n\n', ''),
  # 2. …et passe dans la rangée d'actions de la carte.
  ('          publishSlot={onSuggest ? <GeneratedAdSuggestions ad={ad} onSuggest={onSuggest} part="publish" /> : null}\n',
   '          publishSlot={onSuggest ? <GeneratedAdSuggestions ad={ad} onSuggest={onSuggest} part="publish" /> : null}\n'
   '          previewSlot={ad.status === "ready" && ad.kind === "video" && ad.url ? ' + PREVIEW + ' : null}\n'),
  ('  publishSlot,\n  onAstraMessage,\n}: {', '  publishSlot,\n  previewSlot,\n  onAstraMessage,\n}: {'),
  ('  publishSlot?: React.ReactNode;\n',
   '  publishSlot?: React.ReactNode;\n  /** Bouton « Aperçu Meta », juste après « Publier sur Meta ». */\n  previewSlot?: React.ReactNode;\n'),
  ('        {publishSlot}\n        {isVideo && ad.url && (\n',
   '        {publishSlot}\n        {previewSlot}\n        {isVideo && ad.url && (\n'),
 ]),
 ("src/components/placement/MetaPlacementPreview.tsx", [
  # Bouton au style des autres actions de la carte (gx-btn gx-sm), plus le bouton shadcn.
  ('import { Button } from "@/components/ui/button";\n', ''),
  ('<Button type="button" variant="secondary" size="sm" className={className} onClick={e => { e.stopPropagation(); setOpen(true); }}><Eye className="h-4 w-4" />Aperçu Meta</Button>',
   '<button type="button" className={className ?? "gx-btn gx-sm"} title="Voir la vidéo dans Facebook et Instagram" onClick={e => { e.stopPropagation(); setOpen(true); }}><Eye className="gx-i" />Aperçu Meta</button>'),
 ]),
]
CSS_FILE = "src/styles/gx-chat-v3.css"
CSS_MARK = "/* v40 : Aperçu Meta dans la rangée d'actions, avis sur la ligne du titre */"
CSS = CSS_MARK + """
.gx-chat3 .gx-kard.gx-result .gx-rr{position:relative}
.gx-chat3 .gx-kard.gx-result .gx-rr>b{padding-right:76px}
.gx-chat3 .gx-kard.gx-result .gx-c3-result-actions{flex-wrap:wrap}
.gx-chat3 .gx-kard.gx-result .gx-c3-result-actions [aria-label="Ton avis sur cette création"]{position:absolute;top:-6px;right:0;margin:0}
"""
root = pathlib.Path(".")
ok = True; out = {}
for f, reps in R:
    s = (root / f).read_text()
    for old, new in reps:
        n = s.count(old)
        if n != 1:
            print(f"ÉCHEC {f}: trouvé {n} fois : {old[:80]!r}"); ok = False; continue
        s = s.replace(old, new)
    out[f] = s
if "Button" in out.get("src/components/placement/MetaPlacementPreview.tsx", "").replace("MetaPlacementPreviewButton", ""):
    print("ÉCHEC : Button encore utilisé dans MetaPlacementPreview.tsx"); ok = False
cp = root / CSS_FILE; cs = cp.read_text()
if CSS_MARK in cs: print("ÉCHEC : CSS v40 déjà présent"); ok = False
if ok and not CHECK:
    for f, s in out.items(): (root / f).write_text(s)
    cp.write_text(cs.rstrip() + "\n" + CSS)
print("OK" if ok else "ÉCHEC", "(vérification seule)" if CHECK else "")
sys.exit(0 if ok else 1)
