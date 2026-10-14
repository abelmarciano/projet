#!/usr/bin/env python3
"""Chat v2.3 : en Chat v2, plus aucune protection de comportement autour de Claude.
Restent seulement les limites physiques : l'IA de génération doit savoir faire ce qu'on
lui demande (son, durée, image source), une adresse web dangereuse n'est pas lue, et rien
n'est débité sans le clic du client. Le mode actuel ne change pas.
À appliquer APRÈS apply-v21.py et apply-v22.py.
Chaque bloc doit être trouvé exactement N fois, sinon rien n'est écrit.
Usage : python3 apply-v23.py [--check]"""
import sys, pathlib

R = "src/routes/api/chat.create-ad.ts"
C = "src/routes/_authenticated/create.tsx"

EDITS = [
  # propose_strategy : marque non confirmée → Claude a le bloc de choix de marque dans son prompt et gère
  (R, 1,
   "if (currentState.brandingConfirmed !== true) return { ok: false, blocked: true, message: brandChoiceQuestion(choiceBrands) };",
   "if (!chatV2 && currentState.brandingConfirmed !== true) return { ok: false, blocked: true, message: brandChoiceQuestion(choiceBrands) };"),
  # propose_strategy : plus de refus « tu as seulement demandé une veille »
  (R, 1,
   "if (competitorResearchThisTurn && !lastUserAsksStrategy()) {",
   "if (!chatV2 && competitorResearchThisTurn && !lastUserAsksStrategy()) {"),
  # ready_to_generate : marque
  (R, 1,
   "if (currentState.brandingConfirmed !== true) return { ok: false, blocked: true, needs: 'brand', message: brandChoiceQuestion(choiceBrands) };",
   "if (!chatV2 && currentState.brandingConfirmed !== true) return { ok: false, blocked: true, needs: 'brand', message: brandChoiceQuestion(choiceBrands) };"),
  # ready_to_generate : garde-fou présentateur (effaçait l'acteur choisi)
  (R, 1,
   "if (!guard.ok) {",
   "if (!chatV2 && !guard.ok) {"),
  # ready_to_generate : « demande d'abord la durée, puis l'acteur »
  (R, 1,
   "if (!input.sameAsLastPrompt && !input.verbatimPrompt) {\n                  const userSaidEarly",
   "if (!chatV2 && !input.sameAsLastPrompt && !input.verbatimPrompt) {\n                  const userSaidEarly"),
  # ready_to_generate : « demande d'abord les photos »
  (R, 1,
   "if (!input.sameAsLastPrompt && !input.verbatimPrompt) {\n                  const conv = conversationText();",
   "if (!chatV2 && !input.sameAsLastPrompt && !input.verbatimPrompt) {\n                  const conv = conversationText();"),
  # update_brief et ready_to_generate : le format choisi par Claude n'est plus réécrit
  (R, 2,
   'resolveVideoAspectRatio(input.aspectRatio, "video", userOwnTexts())',
   '(chatV2 && input.aspectRatio ? input.aspectRatio : resolveVideoAspectRatio(input.aspectRatio, "video", userOwnTexts()))'),
  # update_brief : la remise enregistrée par Claude n'est plus effacée
  (R, 1,
   "} else if (input.offer.discountPercent && !new RegExp(",
   "} else if (!chatV2 && input.offer.discountPercent && !new RegExp("),
  # fetch_url : un lien d'un autre site est lu normalement (l'outil start_new_brand n'existe pas en v2)
  (R, 1,
   "if (link.kind === 'other_site' && !forCurrentBrand) {",
   "if (!chatV2 && link.kind === 'other_site' && !forCurrentBrand) {"),
  # page : le studio s'ouvre dès que Claude a lancé, même si ses suggestions parlent de photo/acteur/durée
  (C, 1,
   "if (/photo|catalogue|acteur|avatar|dur[ée]e/i.test(pending)) return null;",
   "if (!isClientChatV2Active() && /photo|catalogue|acteur|avatar|dur[ée]e/i.test(pending)) return null;"),
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
    if "isClientChatV2Active }" not in files[C]:
        sys.exit("ARRÊT : create.tsx n'importe pas isClientChatV2Active (appliquer apply-v21.py d'abord)")
    if "if (!chatV2 && !g.ok) return g;" not in files[R]:
        sys.exit("ARRÊT : la route n'a pas le correctif v2.2 (appliquer apply-v22.py d'abord)")
    if check:
        print("OK (--check) : tous les blocs trouvés, rien écrit.")
        return
    for path, txt in files.items():
        pathlib.Path(path).write_text(txt, encoding="utf-8")
    print(f"OK : {len(EDITS)} blocs dans {len(files)} fichiers.")


main()
