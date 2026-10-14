"""Chat v2 : branchement dans src/routes/api/chat.create-ad.ts.
Le mode actuel et le mode Claude actuel ne changent pas : tout est conditionné
par chatV2 (compte interne + mode Claude + interrupteur « Chat v2 »).
Chaque bloc d'origine doit être trouvé exactement une fois, sinon arrêt sans
rien écrire. Usage : python3 apply-route.py [--check] src/routes/api/chat.create-ad.ts
"""
import sys
from pathlib import Path

args = [a for a in sys.argv[1:] if not a.startswith("--")]
check = "--check" in sys.argv
p = Path(args[0])
s = p.read_text(encoding="utf-8")
if "buildV2SystemPrompt" in s:
    sys.exit("Arrêt : le Chat v2 semble déjà branché. Rien n'a été écrit.")

EDITS = []
def edit(label, old, new):
    EDITS.append((label, old, new))

edit("imports",
 'import { CHAT_SYSTEM_PROMPT } from "@/lib/chat/system-prompt";\n',
 'import { CHAT_SYSTEM_PROMPT } from "@/lib/chat/system-prompt";\n'
 'import { buildV2SystemPrompt } from "@/lib/chat/v2/system-prompt";\n'
 'import { selectChatTools } from "@/lib/chat/v2/tools";\n'
 'import { GENERATION_MODEL_KEYS, checkGenerationChoice } from "@/lib/chat/v2/model-catalog";\n')

edit("corps de requête",
 "          aiMode?: string;\n          brandId?: string | null;\n        };",
 "          aiMode?: string;\n          chatV2?: boolean;\n          brandId?: string | null;\n        };")

edit("drapeau chatV2",
 'const aiMode: "current" | "claude" = body.aiMode === "claude" && internalAccount ? "claude" : "current";\n',
 'const aiMode: "current" | "claude" = body.aiMode === "claude" && internalAccount ? "claude" : "current";\n'
 "        // Chat v2 (interne) : prompt court, outils réduits, Claude choisit l'IA de génération.\n"
 "        // Il n'existe qu'en mode Claude, pour un compte interne.\n"
 "        const chatV2 = body.chatV2 === true && aiMode === \"claude\";\n")

edit("consignes système",
 "          : `${SYSTEM_PROMPT}\\n${chatRoleRules}\\n\\nÉTAT ACTUEL DU BRIEF : ${JSON.stringify(lightState).slice(0, 4000)}${workspaceContext}${durationsContext}${nowContext}${languageContext}`;",
 "          : chatV2\n"
 "            ? buildV2SystemPrompt({\n"
 "                brandBlock: workspaceContext,\n"
 "                brandChoiceBlock: currentState.brandingConfirmed === true ? \"\" : choicesContext,\n"
 "                briefState: JSON.stringify(lightState).slice(0, 4000),\n"
 "                memory: memoryContext,\n"
 "                lastPrompt: lastPromptContext,\n"
 "                productMemory: productMemoryContext,\n"
 "                pending: `${getPending(currentState as Record<string, unknown>).length ? `Question ouverte (non répondue) : « ${getPending(currentState as Record<string, unknown>)[0].question} ».` : \"\"}${(currentState as any).offer ? `\\nOffre enregistrée : ${JSON.stringify((currentState as any).offer)}` : \"\"}`,\n"
 "                userFacts: explicitUserFacts(messages),\n"
 "                now: nowContext,\n"
 "                language: languageContext,\n"
 "              })\n"
 "            : `${SYSTEM_PROMPT}\\n${chatRoleRules}\\n\\nÉTAT ACTUEL DU BRIEF : ${JSON.stringify(lightState).slice(0, 4000)}${workspaceContext}${durationsContext}${nowContext}${languageContext}`;")

edit("outil read_brand (v2)",
 "        const turnStartedAt = Date.now();",
 "        // Chat v2 : lecture de la marque à la demande (identité, produits, mémoire).\n"
 "        const v2ExtraTools = chatV2\n"
 "          ? {\n"
 "              read_brand: tool({\n"
 "                description:\n"
 "                  \"Lit la marque active : identité, ton, règles, produits du catalogue (nom, prix, prix barré), mémoire de la marque et ce qui a déjà marché. À appeler au début d'une conversation, ou quand tu as besoin de ces informations.\",\n"
 "                inputSchema: z.object({}),\n"
 "                execute: async () => {\n"
 "                  if (!conversationBrandId || whiteLabel) {\n"
 "                    return { ok: true, brand: null, products: [], note: whiteLabel ? \"Marque blanche : aucune identité de marque à utiliser.\" : \"Aucune marque confirmée pour cette conversation.\" };\n"
 "                  }\n"
 "                  const { data: rows } = await supabase\n"
 "                    .from(\"product_folders\")\n"
 "                    .select(\"id, name, prix, prix_barre, devise, product_url, a_promouvoir\")\n"
 "                    .eq(\"brand_id\", conversationBrandId)\n"
 "                    .is(\"retire_at\", null)\n"
 "                    .order(\"a_promouvoir\", { ascending: false })\n"
 "                    .limit(60);\n"
 "                  return {\n"
 "                    ok: true,\n"
 "                    brand: workspaceContext.trim() || null,\n"
 "                    memory: memoryContext.trim() || null,\n"
 "                    products: ((rows ?? []) as any[]).map((r) => ({ id: r.id, name: r.name, price: r.prix, crossedPrice: r.prix_barre, currency: r.devise ?? \"EUR\", url: r.product_url, highlighted: r.a_promouvoir === true })),\n"
 "                  };\n"
 "                },\n"
 "              }),\n"
 "            }\n"
 "          : {};\n"
 "        const turnStartedAt = Date.now();")

edit("routages forcés désactivés en v2",
 "          prepareStep: ((isOffTopicRequest || forceStandaloneMediaTool || wantsMetaCreationPicker)",
 "          prepareStep: ((!chatV2 && (isOffTopicRequest || forceStandaloneMediaTool || wantsMetaCreationPicker))")

edit("jeu d'outils (ouverture)",
 "          tools: isMetaPublishMode ? metaPublishTools : {\n",
 "          tools: isMetaPublishMode ? metaPublishTools : selectChatTools(chatV2, v2ExtraTools, {\n")

edit("jeu d'outils (fermeture)",
 "            }),\n\n          },\n\n\n\n        });",
 "            }),\n\n          }),\n\n\n\n        });")

edit("ready_to_generate : choix de l'IA",
 '                sameAsLastPrompt: z.boolean().optional().describe("true = relancer la génération précédente avec EXACTEMENT le même prompt, sans validation ni reformulation."),\n              }),',
 '                sameAsLastPrompt: z.boolean().optional().describe("true = relancer la génération précédente avec EXACTEMENT le même prompt, sans validation ni reformulation."),\n'
 '                generationModel: z.enum(GENERATION_MODEL_KEYS).optional().describe("IA de génération choisie dans le catalogue (Chat v2)."),\n'
 '                modelReason: z.string().max(240).optional().describe("Pourquoi cette IA, en une phrase simple pour le client."),\n'
 '              }),')

edit("ready_to_generate : contrôle de l'IA choisie",
 "                return { ok: true, brief: input };\n              },\n            }),\n\n\n            analyze_video: tool({",
 "                // Chat v2 : l'IA choisie par Claude n'est refusée que si c'est techniquement impossible.\n"
 "                if (chatV2 && input.generationModel) {\n"
 "                  const st: any = currentState ?? {};\n"
 "                  const imgCount = Array.isArray(st.productImages) ? st.productImages.length : Number(st.productImages) || 0;\n"
 "                  const choice = checkGenerationChoice({\n"
 "                    mediaType: input.mediaType,\n"
 "                    generationModel: input.generationModel,\n"
 "                    hasVoice: presenter === \"actor\" || presenter === \"voice_only\" || st.styleOverride === \"ugc\",\n"
 "                    durationSec: input.videoDurationSec ?? (typeof st.videoDurationSec === \"number\" ? st.videoDurationSec : null),\n"
 "                    proMultiScene: input.proMultiScene === true,\n"
 "                    hasSourceImage: imgCount > 0 || typeof st.productId === \"string\" || typeof st.stockActorId === \"string\",\n"
 "                  });\n"
 "                  if (!choice.ok) return { ok: false, blocked: true, needs: \"model\", message: choice.message };\n"
 "                }\n"
 "                return { ok: true, brief: input };\n              },\n            }),\n\n\n            analyze_video: tool({")

edit("journal des tours v2",
 '              output: `${toolNames.length ? `[outils: ${toolNames.join(", ")}]\\n` : ""}${ev?.text ?? ""}`,',
 '              output: `${chatV2 ? "[chat-v2] " : ""}${toolNames.length ? `[outils: ${toolNames.join(", ")}]\\n` : ""}${ev?.text ?? ""}`,')

errors = []
for label, old, new in EDITS:
    n = s.count(old)
    if n != 1:
        errors.append(f"  bloc « {label} » trouvé {n} fois (attendu : 1)")
if errors:
    print("ARRÊT, rien n'a été écrit :")
    print("\n".join(errors))
    sys.exit(1)
for label, old, new in EDITS:
    s = s.replace(old, new)
if check:
    print(f"Vérification OK : {len(EDITS)} blocs trouvés. Rien n'a été écrit (--check).")
else:
    p.write_text(s, encoding="utf-8")
    print(f"Chat v2 branché : {len(EDITS)} modifications dans {p}.")
