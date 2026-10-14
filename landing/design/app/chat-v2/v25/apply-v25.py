#!/usr/bin/env python3
"""Correctif acteur : « Rédiger le prompt » refusait l'actrice affichée comme « Acteur retenu ».
Cause (conversation d1883bc4) : un tour précédent (garde-fou présentateur, mode actuel) a retiré
l'acteur de l'état en base, mais la page l'a gardé. La page affiche donc Isabella, alors que le
serveur, qui relit la base, répond « Choisis un acteur dans la galerie ».
Correctif (tous modes) : avant de rédiger le prompt d'une vidéo, l'acteur affiché, choisi par le
client, est réécrit en base. Ce qu'on voit est ce qu'on utilise.
Chaque bloc doit être trouvé exactement N fois, sinon rien n'est écrit.
Usage : python3 apply-v25.py [--check]"""
import sys, pathlib

C = "src/routes/_authenticated/create.tsx"

EDITS = [
  (C, 1,
   "      handleOpenStockActorsRef.current();\n      return;\n    }\n    // (garde anti double-clic : voir preparingPromptRef)",
   "      handleOpenStockActorsRef.current();\n      return;\n    }\n"
   "    // L'acteur affiché (« Acteur retenu ») est celui qu'on utilise : on le réécrit en base avant\n"
   "    // de rédiger, au cas où un tour précédent l'aurait retiré côté serveur sans que la page le sache.\n"
   "    if (String(state.mediaType ?? readyBrief?.mediaType) === 'video' && conversationId && typeof state.stockActorId === 'string' && state.actorSelectionConfirmed === true) {\n"
   "      try {\n"
   "        await saveSelectedActorFn({ data: { conversationId, actorId: state.stockActorId } });\n"
   "      } catch {\n"
   "        /* le serveur expliquera s'il manque encore quelque chose */\n"
   "      }\n"
   "    }\n"
   "    // (garde anti double-clic : voir preparingPromptRef)"),
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
    if "const saveSelectedActorFn = useServerFn(selectConversationActor);" not in files[C]:
        sys.exit("ARRÊT : saveSelectedActorFn introuvable dans create.tsx")
    if check:
        print("OK (--check) : tous les blocs trouvés, rien écrit.")
        return
    for path, txt in files.items():
        pathlib.Path(path).write_text(txt, encoding="utf-8")
    print(f"OK : {len(EDITS)} bloc(s) dans {len(files)} fichier(s).")


main()
