#!/usr/bin/env python3
"""Chat v2.1 : ne plus réécrire les suggestions de Claude ; « Pas de remise » respecté.
Chaque bloc doit être trouvé exactement le nombre de fois indiqué, sinon rien n'est écrit.
Usage : python3 apply-v21.py [--check]"""
import sys, pathlib

EDITS = [
  ("src/lib/ai-mode.ts", 1,
   """export function subscribeChatV2(l: () => void) {
  v2Listeners.add(l);
  return () => v2Listeners.delete(l);
}
""",
   """export function subscribeChatV2(l: () => void) {
  v2Listeners.add(l);
  return () => v2Listeners.delete(l);
}

/** Chat v2 réellement actif côté client (mode Claude + case cochée). */
export function isClientChatV2Active(): boolean {
  return getClientAiMode() === "claude" && getClientChatV2();
}
"""),
  ("src/routes/_authenticated/create.tsx", 1,
   'import { getClientAiMode, getClientChatV2 } from "@/lib/ai-mode";',
   'import { getClientAiMode, getClientChatV2, isClientChatV2Active } from "@/lib/ai-mode";'),
  # Clic sur une suggestion : en v2, on envoie exactement ce que Claude a proposé.
  ("src/routes/_authenticated/create.tsx", 1,
   "sendMessage({ text: `${safeSuggestion(text)}<!--suggestion-choice-->` });",
   "sendMessage({ text: `${isClientChatV2Active() ? text : safeSuggestion(text)}<!--suggestion-choice-->` });"),
  # Affichage : en v2, les suggestions de Claude s'affichent telles quelles.
  ("src/routes/_authenticated/create.tsx", 1,
   "suggestions = [...new Set(oneQuestionAtATime(JSON.parse(match[1])).map(safeSuggestion))];",
   "const proposed = JSON.parse(match[1]);\n      suggestions = [...new Set(isClientChatV2Active() ? (proposed as unknown[]).filter((s): s is string => typeof s === \"string\") : oneQuestionAtATime(proposed).map(safeSuggestion))];"),
  # « Pas de remise » : les mots « remise / réduction / promo » ne déclenchent plus le blocage
  # (ex. « sans remise ») ; seuls un vrai « -X % » ou un prix barré restent signalés.
  ("src/lib/chat/pending-questions.ts", 1,
   "  if (!realDiscount && /(\\bsoldes?\\b|\\bpromo|-\\s?\\d{1,2}\\s?%|\\breduction\\b|\\bremise\\b|prix barre)/.test(all)) {",
   "  const discountWords = input.offer?.noDiscount ? /(-\\s?\\d{1,2}\\s?%|prix barre)/ : /(\\bsoldes?\\b|\\bpromo|-\\s?\\d{1,2}\\s?%|\\breduction\\b|\\bremise\\b|prix barre)/;\n  if (!realDiscount && discountWords.test(all)) {"),
]

def main():
    check = "--check" in sys.argv
    files = {}
    for path, n, old, new in EDITS:
        p = pathlib.Path(path)
        if path not in files:
            if not p.exists(): sys.exit(f"ARRÊT : {path} introuvable")
            files[path] = p.read_text(encoding="utf-8")
        c = files[path].count(old)
        if c != n: sys.exit(f"ARRÊT : {path} : bloc trouvé {c} fois au lieu de {n} :\n{old[:120]}")
        files[path] = files[path].replace(old, new)
    if check: print("OK (--check) : tous les blocs trouvés, rien écrit."); return
    for path, txt in files.items(): pathlib.Path(path).write_text(txt, encoding="utf-8")
    print(f"OK : {len(EDITS)} remplacements dans {len(files)} fichiers.")

main()
