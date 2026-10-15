#!/usr/bin/env python3
"""Chat v2 (v33) : la marque active est un contexte, pas une limite.
Constat : demande « vidéo pompe à chaleur » sur la marque Jwel (bijoux) -> Claude a répondu
« je ne peux pas faire cette vidéo sous la marque Jwel » parce que le produit n'est pas au catalogue.
Correction : un produit hors catalogue n'est jamais un blocage ; si le sujet est sans rapport avec la marque,
Claude le signale en une phrase et demande confirmation (cette marque ou marque blanche), puis le fait.
Modifie V2_CORE dans src/lib/chat/v2/system-prompt.ts (un seul ajout, rien n'est retiré).
Chaque bloc doit être trouvé exactement N fois, sinon rien n'est écrit.
Usage : python3 apply-v33.py [--check]"""
import sys, pathlib

P = 'src/lib/chat/v2/system-prompt.ts'

EDITS = [
  (P, 1,
   '- Tu restes honnête : si une demande est impossible, risquée ou illégale (soldes hors période légale, fausse promo, promesse santé…), tu le dis simplement et tu proposes une alternative.\n',
   "- Tu restes honnête : si une demande est impossible, risquée ou illégale (soldes hors période légale, fausse promo, promesse santé…), tu le dis simplement et tu proposes une alternative.\n- La marque active est ton contexte, pas une limite. Un produit ou un service absent du catalogue n'est jamais un blocage : tu travailles avec ce que le client décrit. Si le sujet n'a visiblement rien à voir avec l'univers de la marque (par exemple une pompe à chaleur pour une marque de bijoux), dis-le en une phrase et demande s'il veut vraiment la faire sous cette marque ou plutôt en marque blanche. S'il confirme, tu la fais sous cette marque, sans revenir dessus.\n"),
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
            sys.exit(f"ARRÊT : {path} : bloc trouvé {c} fois au lieu de {n} :\n{old[:200]}")
        files[path] = files[path].replace(old, new)
    if check:
        print("OK (--check) : tous les blocs trouvés, rien écrit.")
        return
    for path, txt in files.items():
        pathlib.Path(path).write_text(txt, encoding="utf-8")
        print("écrit :", path)


if __name__ == "__main__":
    main()
