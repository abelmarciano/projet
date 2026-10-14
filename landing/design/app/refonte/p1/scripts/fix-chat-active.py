"""Le menu surlignait « Chat » (et l'onglet mobile « Créer ») sur la page /creations,
parce que « /creations » commence par « /create ». On ne garde que /create et ses
sous-pages. Remplacements exacts : arrêt sans rien écrire si un bloc manque.
Usage, depuis la racine du projet : python3 fix-chat-active.py
"""
import sys
from pathlib import Path

EDITS = [
    ("src/components/AppSidebar.tsx",
     'const chatActive = currentPath.startsWith("/create");',
     'const chatActive = currentPath === "/create" || currentPath.startsWith("/create/");'),
    ("src/components/ConsoleBottomNav.tsx",
     'aria-current={pathname.startsWith("/create") ? "page" : undefined}',
     'aria-current={pathname === "/create" || pathname.startsWith("/create/") ? "page" : undefined}'),
]

out = {}
for path, old, new in EDITS:
    s = out.get(path) or Path(path).read_text(encoding="utf-8")
    n = s.count(old)
    if n != 1:
        sys.exit(f"Arrêt : {path} — bloc trouvé {n} fois (attendu : 1). Rien n'a été écrit.")
    out[path] = s.replace(old, new)
for path, s in out.items():
    Path(path).write_text(s, encoding="utf-8")
print("Surlignage du Chat corrigé dans", ", ".join(out))
