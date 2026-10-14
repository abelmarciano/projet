#!/usr/bin/env python3
"""Chat v32 :
- Pastille Acteur : la vraie photo de l'acteur en petit (rond), à la place de l'icône femme / homme.
  L'icône ne reste qu'en secours si aucune photo n'est disponible.
- Fenêtres « Choisir un acteur » et « Choisir des produits » : la grille défile de nouveau
  (la zone de défilement prend la hauteur restante de la fenêtre au lieu de s'étendre et d'être coupée).
À appliquer après apply-v31. Chaque bloc doit être trouvé exactement N fois, sinon rien n'est écrit.
Usage : python3 apply-v32.py [--check]"""
import sys, pathlib

C = 'src/routes/_authenticated/create.tsx'
P = 'src/components/chat/ComposerPills.tsx'
S = 'src/styles/gx-composer-v2.css'

EDITS = [
  (P, 1,
   'export type ComposerPillActor = { name: string; gender: "female" | "male" | null };',
   'export type ComposerPillActor = { name: string; gender: "female" | "male" | null; photo?: string | null };'),
  (P, 1,
   '            <span className={`gx-who ${actor.gender === "male" ? "gx-h" : "gx-f"}`} aria-hidden>\n              {actor.gender === "male" ? <MaleIcon /> : <FemaleIcon />}\n            </span>',
   '            {actor.photo ? (\n              <img className="gx-who-ph" src={actor.photo} alt="" />\n            ) : (\n              <span className={`gx-who ${actor.gender === "male" ? "gx-h" : "gx-f"}`} aria-hidden>\n                {actor.gender === "male" ? <MaleIcon /> : <FemaleIcon />}\n              </span>\n            )}'),
  (C, 1,
   '                  actor={pillActorName ? { name: pillActorName, gender } : null}',
   '                  actor={pillActorName ? { name: pillActorName, gender, photo: actorPhoto } : null}'),
  (C, 1,
   '              const gender = stock?.gender === "male" ? "male" : stock?.gender === "female" ? "female" : null;\n',
   '              const gender = stock?.gender === "male" ? "male" : stock?.gender === "female" ? "female" : null;\n              // Photo de l\'acteur : celle choisie, sinon la galerie, sinon le média de l\'acteur retenu (jamais une vidéo).\n              const photoCandidates = [pend?.url, stock?.reference_image_url, pend ? null : selectedActorMedia.data?.url];\n              const actorPhoto = photoCandidates.find((u): u is string => typeof u === "string" && u.length > 0 && !/\\.(mp4|webm|mov)(\\?|$)/i.test(u)) ?? null;\n'),
  (S, 1,
   '.gx-who.gx-h{',
   '.gx-who-ph{display:block;flex:none;width:24px;height:24px;border-radius:50%;object-fit:cover;object-position:50% 20%;background:var(--gx-sunk);box-shadow:0 0 0 1px var(--gx-line)}\n.gx-who.gx-h{'),
  (S, 1,
   '.gx-cat.gx-cat-xl{width:min(1040px,calc(100vw - 32px));max-width:min(1040px,calc(100vw - 32px));max-height:min(86vh,860px);display:flex;flex-direction:column;border-radius:20px}\n.gx-cat-xl .gx-cat-sc{flex:1;min-height:0;max-height:calc(min(86vh,860px) - 230px)}\n',
   '.gx-cat.gx-cat-xl{width:min(1040px,calc(100vw - 32px));max-width:min(1040px,calc(100vw - 32px));max-height:min(86vh,860px);display:flex;flex-direction:column;overflow:hidden;border-radius:20px}\n.gx-cat-xl > *{flex:none}\n.gx-cat-xl > .gx-cat-sc{display:flex;flex-direction:column;flex:1 1 auto;min-height:0;max-height:none}\n.gx-cat-xl > .gx-cat-sc > [data-radix-scroll-area-viewport]{flex:1 1 auto;min-height:0;height:auto;max-height:none}\n'),
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
