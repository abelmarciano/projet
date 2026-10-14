#!/usr/bin/env python3
"""Chat v2 : plus de carte « Stratégie créative » à valider.
Claude pose les bonnes questions, annonce en 2 ou 3 lignes ce qu'il va produire et ouvre
directement le studio. La seule validation est celle du studio, où le client voit le prompt et
le coût. Il n'y a plus deux sources (stratégie validée + brief de Claude) qui peuvent se contredire.
- v2/tools.ts : propose_strategy et validate_strategy sortent du Chat v2 (le mode actuel les garde).
- Route : ready_to_generate reçoit « presenter » (acteur face caméra / voix off / personne). Avant,
  cette information venait de la carte stratégie ; elle sert au choix de l'IA (voix) et à l'acteur.
- v2/system-prompt.ts : déroulé réécrit en conséquence.
À appliquer après apply-v22 à v29. Chaque bloc doit être trouvé exactement N fois, sinon rien n'est écrit.
Usage : python3 apply-v30.py [--check]"""
import sys, pathlib

R = "src/routes/api/chat.create-ad.ts"
T = "src/lib/chat/v2/tools.ts"
TT = "src/lib/chat/v2/tools.test.ts"
P = "src/lib/chat/v2/system-prompt.ts"

OLD_STEPS = """2. **Proposer une stratégie** avec propose_strategy (angle, accroches, cible, preuve, présentateur : acteur face caméra, voix off seule ou aucun). Seulement quand tu as ce qu'il faut : jamais dans le même message qu'une question à laquelle le client n'a pas répondu.
3. **Faire valider** : le client valide (validate_strategy) ou fait évoluer la stratégie. Il peut aussi te dire « vas-y, choisis » : alors tu choisis.
4. **Préparer** : update_brief enregistre les décisions au fil de l'eau (format, durée, offre, accroche…).
5. **Lancer** : ready_to_generate ouvre le studio de génération avec un brief complet et la meilleure IA de génération pour ce besoin (voir le catalogue plus bas). Le client voit alors le prompt et le coût en crédits, et valide d'un clic : rien n'est débité sans son accord."""

NEW_STEPS = """2. **Préparer** : update_brief enregistre les décisions au fil de l'eau (format, durée, offre, accroche…).
3. **Annoncer et lancer** : dès que tu as ce qu'il faut, dis en 2 ou 3 lignes ce que tu vas produire (format, accroche, angle, qui parle à l'image : acteur face caméra, voix off seule ou personne, et l'IA choisie avec la raison), puis ouvre le studio dans le même message avec ready_to_generate (renseigne presenter et la meilleure IA de génération pour ce besoin, voir le catalogue plus bas). Jamais dans le même message qu'une question à laquelle le client n'a pas répondu. Il n'y a pas de stratégie à faire valider : le client valide d'un clic dans le studio, où il voit le prompt et le coût en crédits, et rien n'est débité sans son accord. S'il veut changer quelque chose, il te le dit et tu relances avec la correction. S'il te dit « vas-y, choisis », tu choisis."""

EDITS = [
  # --- outils v2
  (T, 1,
   '/** Les 8 outils du déroulé principal (read_brand est ajouté par la route). */',
   '/** Les 6 outils du déroulé principal (read_brand est ajouté par la route). Pas de carte stratégie en v2. */'),
  (T, 1,
   '  "research_competitor_ads",\n  "propose_strategy",\n  "validate_strategy",\n  "update_brief",',
   '  "research_competitor_ads",\n  "update_brief",'),
  (TT, 1,
   'expect(Object.keys(out).length).toBe(15);',
   'expect(Object.keys(out).length).toBe(13);\n    expect(out).not.toHaveProperty("propose_strategy");\n    expect(out).not.toHaveProperty("validate_strategy");'),
  # --- route : presenter dans ready_to_generate (Chat v2)
  (R, 1,
   '                modelReason: z.string().max(240).optional().describe("Pourquoi cette IA, en une phrase simple pour le client."),\n',
   '                modelReason: z.string().max(240).optional().describe("Pourquoi cette IA, en une phrase simple pour le client."),\n'
   '                presenter: z.enum(["actor", "voice_only", "none"]).optional().describe("Chat v2 : qui parle à l\'image (acteur face caméra, voix off seule, personne)."),\n'),
  (R, 1,
   "if (!chatV2 && currentState.brandingConfirmed !== true) return { ok: false, blocked: true, needs: 'brand', message: brandChoiceQuestion(choiceBrands) };",
   "// Chat v2 : sans carte stratégie, le présentateur vient directement de ready_to_generate.\n"
   "                if (chatV2 && input.presenter) (currentState as any).presenter = input.presenter;\n"
   "                if (!chatV2 && currentState.brandingConfirmed !== true) return { ok: false, blocked: true, needs: 'brand', message: brandChoiceQuestion(choiceBrands) };"),
  # --- prompt v2
  (P, 1, OLD_STEPS, NEW_STEPS),
  (P, 1,
   "6. **Après** : propose une suite utile",
   "4. **Après** : propose une suite utile"),
  (P, 1,
   "va droit au but : pas besoin de repasser par la stratégie.",
   "va droit au but."),
  (P, 1,
   "Quand tu affiches la stratégie, l'interface montre une carte avec ses propres boutons (valider, autre angle, autres accroches) ; quand tu ouvres le studio, une carte avec le bouton pour rédiger le prompt puis lancer. Dans ces deux cas, tes suggestions ne servent qu'aux vraies alternatives : jamais « je valide » ni « je lance ».",
   "Quand tu ouvres le studio, l'interface montre une carte avec le bouton pour rédiger le prompt puis lancer : tes suggestions ne servent alors qu'aux vraies alternatives, jamais « je valide » ni « je lance »."),
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
    if "propose_strategy" in files[P] or "validate_strategy" in files[P]:
        sys.exit("ARRÊT : le prompt v2 mentionne encore la stratégie")
    if check:
        print("OK (--check) : tous les blocs trouvés, rien écrit.")
        return
    for path, txt in files.items():
        pathlib.Path(path).write_text(txt, encoding="utf-8")
    print(f"OK : {len(EDITS)} blocs dans {len(files)} fichiers.")


main()
