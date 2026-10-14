#!/usr/bin/env python3
"""Mode actuel : la question « Quelle offre veux-tu mettre en avant ? » revenait en boucle.
Cause (conversation 586b0879) : le client clique « Prix de gros pour entreprises », une des
réponses proposées par le Chat lui-même. answer_pending_question la refuse, parce que
closeQuestion n'accepte pour l'offre qu'une remise chiffrée (« -20 % », « 15 € ») ou « pas de
remise » (« Réponse d'offre non chiffrée. Repose poliment… »). Le Chat repose donc la même question.
Correctif (pending-questions.ts) : une offre sans chiffre est une vraie réponse. Elle est
enregistrée comme libellé d'offre, sans remise (noDiscount). Les contrôles légaux qui suivent
(« -X % » ou prix barré sans remise réelle) restent actifs.
Exception : « Je précise mon offre » / « Autre — je précise » ne sont pas des réponses. Le client
va écrire, donc la question reste ouverte et le Chat attend sans la reposer.
Chaque bloc doit être trouvé exactement N fois, sinon rien n'est écrit.
Usage : python3 apply-v28.py [--check]"""
import sys, pathlib

P = "src/lib/chat/pending-questions.ts"

EDITS = [
  (P, 1,
   "    const parsed = parseOfferAnswer(last);\n"
   "    if (!parsed) return { ok: false, message: `Réponse d'offre non chiffrée. Repose poliment : « ${q.question} »` };\n"
   "    extra = parsed.kind === \"discount\" ? { offer: parsed.offer } : { noDiscount: true, label: parsed.label };\n",
   "    const parsed = parseOfferAnswer(last);\n"
   "    // « Je précise mon offre » / « Autre — je précise » : le client va écrire, ce n'est pas encore sa réponse.\n"
   "    if (!parsed && /^(je precise|je colle|autre\\b)/.test(norm(last))) return { ok: false, message: \"Le client va préciser son offre par écrit : attends son message, sans reposer la question.\" };\n"
   "    // Une offre sans chiffre (« Prix de gros », « Pack complet »…) est une vraie réponse : libellé d'offre, sans remise.\n"
   "    extra = !parsed ? { noDiscount: true, label: last.slice(0, 80) } : parsed.kind === \"discount\" ? { offer: parsed.offer } : { noDiscount: true, label: parsed.label };\n"),
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
    print(f"OK : {len(EDITS)} bloc(s) dans {len(files)} fichier(s).")


main()
