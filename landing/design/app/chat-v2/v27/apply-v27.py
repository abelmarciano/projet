#!/usr/bin/env python3
"""Passer en « Marque blanche » dans le menu ne passait pas le Chat en marque blanche.
Cause : en changeant de vue, la page ferme bien la conversation ouverte. Mais pendant le
chargement de la nouvelle liste, elle réaffiche l'ANCIENNE liste (placeholderData), où la
conversation ouverte est placée en tête (activeId). L'ouverture automatique « la plus récente »
rouvrait donc la conversation de l'ancienne marque (ici un brouillon vide Leadeurs).
Correctif (create.tsx) :
1. l'ouverture automatique attend la vraie liste de la vue, jamais la liste précédente ;
2. filet : en vue marque blanche, une conversation qui n'est pas en marque blanche n'est jamais
   gardée ouverte (on revient à la liste marque blanche, avec son bouton de nouvelle conversation).
Chaque bloc doit être trouvé exactement N fois, sinon rien n'est écrit.
Usage : python3 apply-v27.py [--check]"""
import sys, pathlib

C = "src/routes/_authenticated/create.tsx"

EDITS = [
  (C, 1,
   "    if (convId || hasPendingActor || debouncedSearch || !conversations.isSuccess) return;\n",
   "    // Jamais sur la liste précédente affichée pendant le chargement (autre vue / autre marque).\n"
   "    if (convId || hasPendingActor || debouncedSearch || !conversations.isSuccess || conversationsQuery.isPlaceholderData) return;\n"),
  (C, 1,
   "    if (brandView !== \"brand\" && convId) navigate({ to: \"/create\", search: {}, replace: true });\n  }, [brandView, convId, navigate]);\n",
   "    if (brandView !== \"brand\" && convId) navigate({ to: \"/create\", search: {}, replace: true });\n  }, [brandView, convId, navigate]);\n"
   "  // Marque blanche = une marque à part entière : en vue marque blanche, une conversation\n"
   "  // d'une marque n'est jamais gardée ouverte, quel que soit le chemin qui l'a rouverte.\n"
   "  useEffect(() => {\n"
   "    if (brandView !== \"white_label\" || !convId) return;\n"
   "    const row = current.data as { id?: string; white_label?: boolean | null } | null | undefined;\n"
   "    if (!row || row.id !== convId) return;\n"
   "    if (row.white_label !== true) navigate({ to: \"/create\", search: {}, replace: true });\n"
   "  }, [brandView, convId, current.data, navigate]);\n"),
]


def main():
    check = "--check" in sys.argv
    files = {}
    for path, n, old, new in EDITS:
        p = pathlib.Path(path)
        if path not in files:
            if not p.exists():
                sys.exit(f"ARRÊT : {path} introuvable")
            files[path] = p.read_text(encoding="utf-8")
        c = files[path].count(old)
        if c != n:
            sys.exit(f"ARRÊT : {path} : bloc trouvé {c} fois au lieu de {n} :\n{old[:160]}")
        files[path] = files[path].replace(old, new)
    if check:
        print("OK (--check) : tous les blocs trouvés, rien écrit.")
        return
    for path, txt in files.items():
        pathlib.Path(path).write_text(txt, encoding="utf-8")
    print(f"OK : {len(EDITS)} blocs dans {len(files)} fichier(s).")


main()
