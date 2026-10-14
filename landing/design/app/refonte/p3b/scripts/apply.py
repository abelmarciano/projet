#!/usr/bin/env python3
"""P3b : ajoute l'import de src/styles/gx-solo.css dans src/styles.css (juste après gx-sidebar-fit.css).
Remplacement exact : l'ancre doit être trouvée exactement une fois, sinon arrêt sans rien écrire.
Idempotent : ne fait rien si l'import est déjà présent.  Usage : python3 scripts/apply.py [chemin/vers/src/styles.css]"""
import sys
path = sys.argv[1] if len(sys.argv) > 1 else "src/styles.css"
s = open(path, encoding="utf-8").read()
line = '@import "./styles/gx-solo.css";'
if line in s:
    print("déjà présent, rien à faire"); sys.exit(0)
anchor = '@import "./styles/gx-sidebar-fit.css";\n'
n = s.count(anchor)
if n != 1:
    sys.exit(f"ARRÊT : ancre trouvée {n} fois (attendu 1), aucun fichier modifié")
open(path, "w", encoding="utf-8").write(s.replace(anchor, anchor + line + "\n"))
print("ok : import gx-solo.css ajouté")
