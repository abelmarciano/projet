"""Chat v2 : côté navigateur.
- src/lib/ai-mode.ts : interrupteur « Chat v2 » (comptes internes, mode Claude).
- src/routes/_authenticated/create.tsx : envoie chatV2 à la route, et transmet
  l'IA choisie par Claude (generationModel) à la génération vidéo et image.
Sans IA choisie, rien ne change (routage actuel). Chaque bloc doit être trouvé
le nombre de fois attendu, sinon arrêt sans rien écrire.
Usage, depuis la racine du projet : python3 apply-client.py [--check]
"""
import sys
from pathlib import Path

check = "--check" in sys.argv
FILES = {
    "mode": Path("src/lib/ai-mode.ts"),
    "chat": Path("src/routes/_authenticated/create.tsx"),
}
src = {k: p.read_text(encoding="utf-8") for k, p in FILES.items()}
if "getClientChatV2" in src["mode"] or "chatV2: getClientChatV2()" in src["chat"]:
    sys.exit("Arrêt : le Chat v2 semble déjà branché côté navigateur. Rien n'a été écrit.")

EDITS = []
def edit(f, label, old, new, count=1):
    EDITS.append((f, label, old, new, count))

edit("mode", "magasin du Chat v2 (ajout en fin de fichier)",
 "export function subscribeAiMode(l: () => void) {\n  listeners.add(l);\n  return () => listeners.delete(l);\n}\n",
 "export function subscribeAiMode(l: () => void) {\n  listeners.add(l);\n  return () => listeners.delete(l);\n}\n"
 "\n"
 "// Chat v2 (interne, mode Claude uniquement) : prompt court, outils réduits,\n"
 "// Claude choisit l'IA de génération. Désactivé par défaut.\n"
 "const V2_KEY = \"growthity.chatV2\";\n"
 "let chatV2 = false;\n"
 "const v2Listeners = new Set<() => void>();\n"
 "\n"
 "export function getClientChatV2(): boolean {\n"
 "  if (typeof window === \"undefined\") return false;\n"
 "  try {\n"
 "    return window.localStorage.getItem(V2_KEY) === \"1\";\n"
 "  } catch {\n"
 "    return chatV2;\n"
 "  }\n"
 "}\n"
 "\n"
 "export function setClientChatV2(next: boolean) {\n"
 "  chatV2 = next;\n"
 "  try {\n"
 "    window.localStorage.setItem(V2_KEY, next ? \"1\" : \"0\");\n"
 "  } catch { /* stockage indisponible */ }\n"
 "  v2Listeners.forEach((l) => l());\n"
 "}\n"
 "\n"
 "export function subscribeChatV2(l: () => void) {\n"
 "  v2Listeners.add(l);\n"
 "  return () => v2Listeners.delete(l);\n"
 "}\n")

edit("chat", "import",
 'import { getClientAiMode } from "@/lib/ai-mode";\n',
 'import { getClientAiMode, getClientChatV2 } from "@/lib/ai-mode";\n'
 'import { isImageModelKey, isVideoModelKey } from "@/lib/chat/v2/model-catalog";\n')

edit("chat", "envoi du drapeau à la route",
 "            aiMode: getClientAiMode(),\n",
 "            aiMode: getClientAiMode(),\n"
 "            chatV2: getClientAiMode() === \"claude\" && getClientChatV2(),\n")

edit("chat", "type de l'aperçu du prompt",
 '    proDurationSec?: number;\n    videoQuality?: "standard" | "premium";\n  };',
 '    proDurationSec?: number;\n    videoQuality?: "standard" | "premium";\n'
 '    /** IA de génération choisie par Claude (Chat v2). */\n'
 '    generationModel?: string;\n  };')

edit("chat", "aperçus du prompt (2 endroits)",
 '        proMultiScene,\n        proDurationSec,\n        videoQuality: "standard",\n      };',
 '        proMultiScene,\n        proDurationSec,\n        videoQuality: "standard",\n'
 '        generationModel: typeof readyBrief?.generationModel === "string" ? readyBrief.generationModel : undefined,\n      };',
 count=2)

edit("chat", "vidéo : IA choisie",
 "            modelOverride: undefined,\n",
 "            modelOverride: isVideoModelKey(p.generationModel) ? p.generationModel : undefined,\n")

edit("chat", "image : IA choisie",
 "            aspectRatio: imageAspectOf(p.aspectRatio),\n          },\n        });\n        const { baseImagePath, generationAudit } = generated;",
 "            aspectRatio: imageAspectOf(p.aspectRatio),\n"
 "            ...(isImageModelKey(p.generationModel) ? { modelOverride: p.generationModel } : {}),\n"
 "          },\n        });\n        const { baseImagePath, generationAudit } = generated;")

edit("chat", "carrousel : IA choisie",
 "              aspectRatio: imageAspectOf(p.aspectRatio),\n            },\n          });",
 "              aspectRatio: imageAspectOf(p.aspectRatio),\n"
 "              ...(isImageModelKey(p.generationModel) ? { modelOverride: p.generationModel } : {}),\n"
 "            },\n          });")

errors = []
for f, label, old, new, count in EDITS:
    n = src[f].count(old)
    if n != count:
        errors.append(f"  {FILES[f]} — bloc « {label} » trouvé {n} fois (attendu : {count})")
if errors:
    print("ARRÊT, rien n'a été écrit :")
    print("\n".join(errors))
    sys.exit(1)
for f, label, old, new, count in EDITS:
    src[f] = src[f].replace(old, new)
if check:
    print(f"Vérification OK : {len(EDITS)} blocs trouvés. Rien n'a été écrit (--check).")
else:
    for k, p in FILES.items():
        p.write_text(src[k], encoding="utf-8")
    print(f"Chat v2 branché côté navigateur : {len(EDITS)} modifications.")
