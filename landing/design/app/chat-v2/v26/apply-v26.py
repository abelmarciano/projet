#!/usr/bin/env python3
"""Marque blanche = une marque à part entière, dans la route du Chat (tous modes).
Cause : une conversation en marque blanche a brand_id = null. Au premier message, la route lui
faisait adopter la marque de l'onglet (« une conversation encore sans marque adopte celle de
l'onglet »). Le catalogue, l'historique, les liens, la mémoire de stratégie et l'identité de
publication Meta de cette marque entraient alors dans une conversation en marque blanche.
Correctif : la colonne ad_conversations.white_label fait foi. Si elle vaut true :
- la conversation n'adopte jamais la marque de l'onglet ;
- conversationBrandId reste null, ce qui coupe d'un coup catalogue, déjà-fait, liens, mémoire et Meta ;
- l'état est forcé en marque blanche confirmée (le navigateur ne peut pas le repasser en « brand »).
Changer de marque reste possible avec la pastille de marque (setConversationBrand, qui met à jour la colonne).
Chaque bloc doit être trouvé exactement N fois, sinon rien n'est écrit.
Usage : python3 apply-v26.py [--check]"""
import sys, pathlib

R = "src/routes/api/chat.create-ad.ts"

EDITS = [
  (R, 1,
   "        let conversationBrandId: string | null = null;\n",
   "        let conversationBrandId: string | null = null;\n"
   "        // Marque blanche décidée par la colonne de la conversation (jamais par l'onglet ni le navigateur).\n"
   "        let conversationWhiteLabel = false;\n"),
  (R, 1,
   '.select("state, summary, brand_id")',
   '.select("state, summary, brand_id, white_label")'),
  (R, 1,
   '          conversationBrandId = typeof convRow?.brand_id === "string" ? convRow.brand_id : null;\n',
   '          conversationBrandId = typeof convRow?.brand_id === "string" ? convRow.brand_id : null;\n'
   "          // Marque blanche = une marque à part entière : aucune autre marque n'y entre.\n"
   "          if ((convRow as { white_label?: boolean | null } | null)?.white_label === true) {\n"
   "            conversationWhiteLabel = true;\n"
   "            conversationBrandId = null;\n"
   "            (currentState as any).brandingMode = \"white_label\";\n"
   "            (currentState as any).brandingConfirmed = true;\n"
   "            delete (currentState as any).creativeBrandId;\n"
   "          }\n"),
  (R, 1,
   "          if (!conversationBrandId) {\n            conversationBrandId = screenBrand.id;",
   "          if (!conversationBrandId && !conversationWhiteLabel) {\n            conversationBrandId = screenBrand.id;"),
  (R, 1,
   "        const whiteLabel = currentState.brandingMode === 'white_label' && currentState.brandingConfirmed === true;\n",
   "        const whiteLabel = conversationWhiteLabel || (currentState.brandingMode === 'white_label' && currentState.brandingConfirmed === true);\n"
   "        // En marque blanche, aucune marque : catalogue, déjà-fait, liens, mémoire et Meta restent vides.\n"
   "        if (whiteLabel) conversationBrandId = null;\n"),
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
