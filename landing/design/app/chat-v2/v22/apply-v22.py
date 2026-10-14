#!/usr/bin/env python3
"""Chat v2.2 : en Chat v2, plus de questions bloquantes côté serveur.
Claude pose ses questions et attend la réponse lui-même ; le serveur ne lui fait plus
reposer une question déjà répondue. Le mode actuel ne change pas.
Chaque bloc doit être trouvé exactement N fois, sinon rien n'est écrit.
Usage : python3 apply-v22.py [--check]"""
import sys, pathlib

R = "src/routes/api/chat.create-ad.ts"
T = "src/lib/chat/v2/tools.ts"
TT = "src/lib/chat/v2/tools.test.ts"
P = "src/lib/chat/v2/system-prompt.ts"

EDITS = [
  # propose_strategy : plus de barrière « question ouverte » en v2
  (R, 1,
   "if (!g.ok) return { ok: false as const, blocked: true as const, needs: g.needs, message: g.message };",
   "if (!chatV2 && !g.ok) return { ok: false as const, blocked: true as const, needs: g.needs, message: g.message };"),
  # validate_strategy et ready_to_generate
  (R, 2,
   "if (!g.ok) return g;",
   "if (!chatV2 && !g.ok) return g;"),
  # contrôle de cohérence qui rouvrait des questions (dont « soldes hors période » pour une pub préparée à l'avance)
  (R, 1,
   """if (!input.sameAsLastPrompt && !input.verbatimPrompt) {
                    const doc = strategyState?.doc ?? null;
                    const issues = checkBriefConsistency({""",
   """if (!chatV2 && !input.sameAsLastPrompt && !input.verbatimPrompt) {
                    const doc = strategyState?.doc ?? null;
                    const issues = checkBriefConsistency({"""),
  # update_brief : l'offre n'est plus effacée parce qu'une question serait « encore ouverte »
  (R, 1,
   'if (getPending(currentState as Record<string, unknown>).some((q) => q.key === "offer")) {',
   'if (!chatV2 && getPending(currentState as Record<string, unknown>).some((q) => q.key === "offer")) {'),
  # prompt v2 : plus de « question ouverte » ni de liste de faits sans les clics ; Claude lit la conversation
  (R, 1,
   'briefState: JSON.stringify(lightState).slice(0, 4000),',
   'briefState: JSON.stringify({ ...lightState, pendingQuestions: undefined }).slice(0, 4000),'),
  (R, 1,
   'pending: `${getPending(currentState as Record<string, unknown>).length ? `Question ouverte (non répondue) : « ${getPending(currentState as Record<string, unknown>)[0].question} ».` : ""}${(currentState as any).offer ? `\\nOffre enregistrée : ${JSON.stringify((currentState as any).offer)}` : ""}`,\n                userFacts: explicitUserFacts(messages),',
   'pending: (currentState as any).offer ? `Offre enregistrée : ${JSON.stringify((currentState as any).offer)}` : "",\n                userFacts: "",'),
  # outils v2 : les deux outils de questions bloquantes sortent
  (T, 1,
   '/** Les 10 outils du déroulé principal (read_brand est ajouté par la route). */',
   '/** Les 8 outils du déroulé principal (read_brand est ajouté par la route). */'),
  (T, 1,
   '  "validate_strategy",\n  "ask_blocking_question",\n  "answer_pending_question",\n  "update_brief",',
   '  "validate_strategy",\n  "update_brief",'),
  (TT, 1,
   'expect(Object.keys(out).length).toBe(17);',
   'expect(Object.keys(out).length).toBe(15);\n    expect(out).not.toHaveProperty("ask_blocking_question");\n    expect(out).not.toHaveProperty("answer_pending_question");'),
  # prompt : la section « Questions bloquantes » disparaît
  (P, 1,
   """## Questions bloquantes
Quand une réponse du client est indispensable (offre, remise, période, produit, cible, format), pose-la avec ask_blocking_question. Tant qu'elle est ouverte, le serveur refuse la stratégie et la génération. Quand le client répond par écrit, enregistre sa réponse avec answer_pending_question en reprenant ses mots exacts. Un clic sur « Je valide » n'est pas une réponse.

""",
   ""),
  (P, 1,
   " * modèle. Les sécurités (crédits, marque, acteur, offre légale, questions\n * bloquantes) restent appliquées par le serveur dans les outils eux-mêmes.",
   " * modèle. Les sécurités (crédits, marque, acteur, photos, durée, IA possible)\n * restent appliquées par le serveur ; les questions, c'est Claude qui les gère."),
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
        if c != n: sys.exit(f"ARRÊT : {path} : bloc trouvé {c} fois au lieu de {n} :\n{old[:160]}")
        files[path] = files[path].replace(old, new)
    if check: print("OK (--check) : tous les blocs trouvés, rien écrit."); return
    for path, txt in files.items(): pathlib.Path(path).write_text(txt, encoding="utf-8")
    print(f"OK : {len(EDITS)} blocs dans {len(files)} fichiers.")

main()
