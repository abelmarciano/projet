#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""P3d : ajoute les imports de gx-montage.css et gx-admin-labs.css dans src/styles.css.

Remplacement exact : la ligne d'ancrage doit exister exactement une fois, sinon arrêt sans rien écrire.
Idempotent : si les deux imports sont déjà présents, ne fait rien.
Usage : python3 scripts/styles-imports.py [chemin/vers/src/styles.css]
"""
import sys, pathlib

PATH = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else "src/styles.css")
ANCHOR = '@import "./styles/gx-sidebar-fit.css";\n'
ADD = '@import "./styles/gx-montage.css";\n@import "./styles/gx-admin-labs.css";\n'

text = PATH.read_text(encoding="utf-8")
if 'gx-montage.css' in text and 'gx-admin-labs.css' in text:
    print("Déjà présent, rien à faire."); sys.exit(0)
n = text.count(ANCHOR)
if n != 1:
    print(f"ARRÊT, rien n'a été écrit : ligne d'ancrage trouvée {n} fois (attendu : 1)"); sys.exit(1)
PATH.write_text(text.replace(ANCHOR, ANCHOR + ADD, 1), encoding="utf-8")
print(f"OK : imports ajoutés dans {PATH}")
