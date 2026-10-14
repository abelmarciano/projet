#!/usr/bin/env python3
"""Marque blanche : « Rédiger le prompt » (et la génération) échouaient.
Cause : requireCreativeBrandId exige une marque. En marque blanche, la conversation n'en a pas
(brand_id null) : soit l'appel échoue (« Choisis une marque… »), soit il prend la marque de
l'onglet, puis resolveProductGenerationSources refuse (« Conversation indisponible pour cette
marque. »), parce que la conversation n'a pas cette marque.
Correctif :
1. brand-scope.server.ts / requireCreativeBrandId : en marque blanche, la marque par défaut de
   l'espace sert d'ancre technique, jamais celle de l'onglet. Elle est neutralisée ensuite :
   writerContext retire nom, logo, charte, leçons et concurrents, et la création n'est rattachée
   à aucune marque (brandIdForInsert).
2. product-generation-sources.server.ts : une conversation en marque blanche n'est plus refusée
   pour « mauvaise marque ».
Chaque bloc doit être trouvé exactement N fois, sinon rien n'est écrit.
Usage : python3 apply-v29.py [--check]"""
import sys, pathlib

B = "src/lib/brand-scope.server.ts"
S = "src/lib/product-generation-sources.server.ts"

EDITS = [
  (B, 1,
   "    const { data: c } = await db.from('ad_conversations').select('brand_id, state').eq('id', input.conversationId).eq('user_id', userId).maybeSingle();\n"
   "    if (c?.brand_id) id = c.brand_id;\n"
   "    const choice = c?.state as Record<string, unknown> | undefined;\n"
   "    if (choice?.brandingConfirmed !== true) throw new Error('Choisis la marque ou « Marque blanche — sans marque » dans le Chat avant de créer.');\n",
   "    const { data: c } = await db.from('ad_conversations').select('brand_id, white_label, state').eq('id', input.conversationId).eq('user_id', userId).maybeSingle();\n"
   "    if (c?.brand_id) id = c.brand_id;\n"
   "    const choice = c?.state as Record<string, unknown> | undefined;\n"
   "    // Marque blanche : aucune marque utilisée. La marque par défaut de l'espace sert seulement d'ancre\n"
   "    // technique, neutralisée ensuite (writerContext, sources produit, création rattachée à aucune marque).\n"
   "    if (c?.white_label === true || (choice?.brandingConfirmed === true && choice?.brandingMode === 'white_label')) {\n"
   "      const anchor = (await workspaceDefaultBrandId(db, userId)) ?? id;\n"
   "      if (!anchor) throw new Error('Aucune marque dans cet espace de travail.');\n"
   "      return (await assertBrandAccess(db, userId, anchor)).id;\n"
   "    }\n"
   "    if (choice?.brandingConfirmed !== true) throw new Error('Choisis la marque ou « Marque blanche — sans marque » dans le Chat avant de créer.');\n"),
  (S, 1,
   "    const { data, error } = await db.from('ad_conversations').select('state, brand_id').eq('id', input.conversationId).eq('user_id', userId).maybeSingle();\n"
   "    const selectedBrand = data?.state?.brandingConfirmed === true && data?.state?.brandingMode === 'brand' ? data.state.creativeBrandId : data?.brand_id;\n"
   "    if (error || !data || selectedBrand !== brandId) throw new Error('Conversation indisponible pour cette marque.');\n",
   "    const { data, error } = await db.from('ad_conversations').select('state, brand_id, white_label').eq('id', input.conversationId).eq('user_id', userId).maybeSingle();\n"
   "    const selectedBrand = data?.state?.brandingConfirmed === true && data?.state?.brandingMode === 'brand' ? data.state.creativeBrandId : data?.brand_id;\n"
   "    // Marque blanche : pas de marque à comparer (l'ancre technique n'est pas celle de la conversation).\n"
   "    const whiteLabel = data?.white_label === true || (data?.state?.brandingConfirmed === true && data?.state?.brandingMode === 'white_label');\n"
   "    if (error || !data || (!whiteLabel && selectedBrand !== brandId)) throw new Error('Conversation indisponible pour cette marque.');\n"),
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
    print(f"OK : {len(EDITS)} blocs dans {len(files)} fichiers.")


main()
