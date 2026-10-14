#!/usr/bin/env python3
"""Chat v2.4 : une étape = un seul bloc d'action (Chat v2 uniquement).
- Stratégie à valider : les suggestions de Claude ne s'affichent plus au-dessus de la carte ;
  la carte garde ses boutons (Valider / Autre angle / Autres accroches) et reçoit en plus
  les vraies alternatives de Claude (ex. « Plutôt une image »), sans doublon.
- Studio ouvert (carte « Brief prêt ») : les suggestions du dernier message de Claude ne
  s'affichent plus au-dessus ; ses alternatives passent dans la carte, sous « Rédiger le prompt »,
  sans les doublons du type « C'est parfait, je lance ».
- Prompt v2 : Claude est informé de ces cartes, et de la longueur de texte parlé par durée.
Le mode actuel ne change pas. À appliquer après apply-v21/v22/v23.
Chaque bloc doit être trouvé exactement N fois, sinon rien n'est écrit.
Usage : python3 apply-v24.py [--check]"""
import sys, pathlib

C = "src/routes/_authenticated/create.tsx"
S = "src/components/chat/StrategyCard.tsx"
P = "src/lib/chat/v2/system-prompt.ts"

HELPERS = '''/** Chat v2 : suggestions brutes écrites par Claude dans un message. */
function v2MessageSuggestions(m: UIMessage | undefined): string[] {
  if (!m) return [];
  const match = messageRawText(m).match(SUGGESTIONS_RE);
  if (!match) return [];
  try {
    return (JSON.parse(match[1]) as unknown[]).filter((s): s is string => typeof s === "string");
  } catch {
    return [];
  }
}

/** Chat v2 : ce message affiche une carte stratégie encore à valider (elle porte ses propres boutons). */
function v2StrategyPending(m: UIMessage): boolean {
  const parts = (m.parts ?? []) as Array<{ type?: string; output?: { blocked?: boolean; ok?: boolean } }>;
  if (parts.some((p) => p.type === "tool-validate_strategy" && p.output?.ok !== false)) return false;
  return parts.some((p) => p.type === "tool-propose_strategy" && p.output?.blocked !== true);
}

/** Chat v2 : suggestions qui font doublon avec le bouton principal de la carte. */
const V2_STRATEGY_DUP_RE = /valid|accroche|angle/i;
const V2_LAUNCH_DUP_RE = /\\b(?:je lance|on lance|lance[rz]?|g[ée]n[èée]re[rz]?|c'est parfait|c’est parfait|go)\\b/i;

const MessageBubble = memo(function MessageBubble({'''

EDITS = [
  # --- create.tsx : fonctions utilitaires
  (C, 1, "const MessageBubble = memo(function MessageBubble({", HELPERS),
  # --- MessageBubble : nouvelle propriété hideSuggestions
  (C, 1,
   "  suggestionsLocked = false,\n  pageLogos,\n}: {",
   "  suggestionsLocked = false,\n  hideSuggestions = false,\n  pageLogos,\n}: {"),
  (C, 1,
   "  suggestionsLocked?: boolean;\n  pageLogos?: Map<string, string>;\n}) {",
   "  suggestionsLocked?: boolean;\n  hideSuggestions?: boolean;\n  pageLogos?: Map<string, string>;\n}) {"),
  (C, 1,
   "{!isUser && !isRevealing && suggestions.length > 0 && (",
   "{!isUser && !isRevealing && !hideSuggestions && suggestions.length > 0 && ("),
  (C, 1,
   "  prev.suggestionsLocked === next.suggestionsLocked,\n);",
   "  prev.suggestionsLocked === next.suggestionsLocked &&\n  prev.hideSuggestions === next.hideSuggestions,\n);"),
  # --- liste des messages : on cache les suggestions qui feraient doublon avec une carte
  (C, 1,
   "            return (\n              <>\n                {messages.map((m, messageIndex) => {",
   "            // Chat v2 : une étape = un seul bloc d'action (la carte), pas de boutons en double.\n"
   "            const v2Active = isClientChatV2Active();\n"
   "            const v2BriefCardVisible = v2Active && !!readyBrief && readyBrief.sameAsLastPrompt !== true && canPreparePrompt && !promptPreview && !chainActive && !generating;\n"
   "            return (\n              <>\n                {messages.map((m, messageIndex) => {"),
  (C, 1,
   "                      suggestionsLocked={suggestionsLocked}\n                      pageLogos={metaPageLogos}",
   "                      suggestionsLocked={suggestionsLocked}\n"
   "                      hideSuggestions={v2Active && m.role === \"assistant\" && ((v2BriefCardVisible && isLastMessage) || v2StrategyPending(m))}\n"
   "                      pageLogos={metaPageLogos}"),
  # --- carte stratégie : alternatives de Claude dans la carte
  (C, 1,
   "              validated={validated || !!briefSuperseded}\n              onSubmit={onSuggestion}",
   "              validated={validated || !!briefSuperseded}\n              onSubmit={onSuggestion}\n"
   "              extra={isClientChatV2Active() ? v2MessageSuggestions(message).filter((s) => !V2_STRATEGY_DUP_RE.test(s)) : undefined}"),
  # --- carte « Brief prêt » : alternatives du dernier message de Claude sous le bouton
  (C, 1,
   "                    Rédiger le prompt\n                    <ArrowRight className=\"gx-i\" />\n                  </button>\n                )}\n              </div>",
   "                    Rédiger le prompt\n                    <ArrowRight className=\"gx-i\" />\n                  </button>\n                )}\n"
   "                {!briefPreparing && isClientChatV2Active() &&\n"
   "                  v2MessageSuggestions([...messages].reverse().find((x) => x.role === \"assistant\"))\n"
   "                    .filter((s) => !V2_LAUNCH_DUP_RE.test(s))\n"
   "                    .map((s) => (\n"
   "                      <button key={s} type=\"button\" className=\"gx-btn gx-sm\" onClick={() => handleSuggestion(s)} disabled={generating}>\n"
   "                        {s}\n"
   "                      </button>\n"
   "                    ))}\n"
   "              </div>"),
  # --- StrategyCard : propriété extra
  (S, 1,
   "  validated,\n  onSubmit,\n}: {\n  output?: Record<string, unknown>;\n  validated?: boolean;\n  onSubmit?: (text: string) => void;\n}) {",
   "  validated,\n  onSubmit,\n  extra,\n}: {\n  output?: Record<string, unknown>;\n  validated?: boolean;\n  onSubmit?: (text: string) => void;\n  /** Chat v2 : alternatives proposées par Claude, affichées avec les boutons de la carte. */\n  extra?: string[];\n}) {"),
  (S, 1,
   "            Autres accroches\n          </button>\n",
   "            Autres accroches\n          </button>\n"
   "          {extra?.map((s) => (\n"
   "            <button key={s} type=\"button\" className=\"gx-btn gx-sm\" onClick={() => onSubmit(s)}>\n"
   "              {s}\n"
   "            </button>\n"
   "          ))}\n"),
  # --- prompt v2 : informations sur l'interface et sur le texte parlé
  (P, 1,
   "Termine chaque message par des suggestions de réponses cliquables, pertinentes pour CE que tu viens de dire (si tu poses une question, ce sont des réponses à cette question).",
   "Termine chaque message par des suggestions de réponses cliquables, pertinentes pour CE que tu viens de dire (si tu poses une question, ce sont des réponses à cette question). "
   "Quand tu affiches la stratégie, l'interface montre une carte avec ses propres boutons (valider, autre angle, autres accroches) ; quand tu ouvres le studio, une carte avec le bouton pour rédiger le prompt puis lancer. "
   "Dans ces deux cas, tes suggestions ne servent qu'aux vraies alternatives : jamais « je valide » ni « je lance »."),
  (P, 1,
   "Le client voit alors le prompt et le coût en crédits, et valide d'un clic : rien n'est débité sans son accord.",
   "Le client voit alors le prompt et le coût en crédits, et valide d'un clic : rien n'est débité sans son accord. "
   "Pour un texte parlé, on dit environ 2,5 mots par seconde : environ 20 mots pour 8 s, 40 pour 16 s, 60 pour 24 s. Au-delà, la phrase est coupée ou dite trop vite."),
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
    if check:
        print("OK (--check) : tous les blocs trouvés, rien écrit.")
        return
    for path, txt in files.items():
        pathlib.Path(path).write_text(txt, encoding="utf-8")
    print(f"OK : {len(EDITS)} blocs dans {len(files)} fichiers.")


main()
