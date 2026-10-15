#!/usr/bin/env python3
"""Chat v34 : carte « Acteur » dans le message envoyé.
Avant : la bulle affichait seulement « Acteur : Adrien A. » suivi d'un grand vide (lignes des marqueurs cachés).
Après : une carte au-dessus de la bulle, même gabarit que la carte produit (photo de l'acteur, « Acteur », nom,
« Femme / Homme · face caméra »), la ligne « Acteur : … » est retirée du texte et les lignes vides en trop aussi.
Les anciens messages en profitent aussi (le marqueur actor-ids est déjà enregistré).
Nouveau fichier : src/components/chat/ActorCardChip.tsx. Modifie : src/routes/_authenticated/create.tsx (MessageBubble).
Chaque bloc doit être trouvé exactement N fois, sinon rien n'est écrit.
Usage : python3 apply-v34.py [--check]"""
import sys, pathlib

C = 'src/routes/_authenticated/create.tsx'

EDITS = [
  (C, 1,
   "import { ProductCardChip, formatProductPrice, parseProductCards, productCardLine, type ChatProductCard } from '@/components/chat/ProductCardChip';",
   "import { ProductCardChip, formatProductPrice, parseProductCards, productCardLine, type ChatProductCard } from '@/components/chat/ProductCardChip';\nimport { ActorCardChip } from '@/components/chat/ActorCardChip';"),
  (C, 1,
   '  const attachedProducts = parseProductCards(cleanText);\n',
   '  const attachedProducts = parseProductCards(cleanText);\n  // Acteur choisi : carte avec photo au-dessus de la bulle (comme les produits), jamais la ligne « Acteur : … » seule.\n  let attachedActorIds: string[] = [];\n  const actorIdsMatch = isUser ? cleanText.match(/<!--actor-ids:(\\[[^>]*?\\])-->/) : null;\n  if (actorIdsMatch) {\n    try { attachedActorIds = (JSON.parse(actorIdsMatch[1]) as unknown[]).filter((x): x is string => typeof x === "string" && x.length > 0); } catch { /* ignore */ }\n  }\n  const actorNamesMatch = attachedActorIds.length ? cleanText.match(/^\\s*Acteur\\s*:\\s*(.+)$/im) : null;\n  const attachedActorNames = actorNamesMatch ? actorNamesMatch[1].split(",").map((s) => s.trim()).filter(Boolean) : [];\n  if (attachedActorIds.length) cleanText = cleanText.replace(/^\\s*Acteur(?:\\s*:.*| choisi dans la galerie)\\s*$/im, "");\n'),
  (C, 1,
   '  cleanText = stripTechnicalMarkers(cleanText);\n',
   '  cleanText = stripTechnicalMarkers(cleanText).replace(/\\n{3,}/g, "\\n\\n").trim();\n'),
  (C, 1,
   '          {attachedProducts.length > 0 && (\n',
   '          {attachedActorIds.length > 0 && (\n            <div className="gx-att gx-att-end" style={{ flexDirection: "column", alignItems: "flex-end", gap: 8 }}>\n              {attachedActorIds.map((id, i) => <ActorCardChip key={id} id={id} name={attachedActorNames[i] ?? null} />)}\n            </div>\n          )}\n          {attachedProducts.length > 0 && (\n'),
]

NEWFILES = {
  'src/components/chat/ActorCardChip.tsx': 'import { useQuery } from "@tanstack/react-query";\nimport { useServerFn } from "@tanstack/react-start";\nimport { getActorMedia, listStockActors } from "@/lib/stock-actors.functions";\n\n/** Carte « Acteur » affichée au-dessus du message envoyé, même gabarit que la carte produit. */\nexport function ActorCardChip({ id, name }: { id: string; name: string | null }) {\n  const listFn = useServerFn(listStockActors);\n  const mediaFn = useServerFn(getActorMedia);\n  const listQ = useQuery({ queryKey: ["catalog-picker", "stock-actors"], queryFn: () => listFn(), staleTime: 60_000 });\n  const actor = ((listQ.data as any[] | undefined) ?? []).find((a) => a?.id === id);\n  // Acteur absent de la galerie (avatar perso) : on demande son média directement.\n  const mediaQ = useQuery({\n    queryKey: ["actor-media", id],\n    queryFn: () => mediaFn({ data: { id } }),\n    enabled: listQ.isSuccess && !actor,\n    staleTime: 5 * 60 * 1000,\n  });\n  const label = (typeof actor?.name === "string" && actor.name) || name || "Acteur";\n  const img = typeof actor?.reference_image_url === "string" ? actor.reference_image_url : ((mediaQ.data as { url?: string } | undefined)?.url ?? null);\n  const sub = actor?.gender === "male" ? "Homme · face caméra" : actor?.gender === "female" ? "Femme · face caméra" : "Face caméra";\n  return (\n    <div className="flex w-72 max-w-full items-center gap-3 rounded-xl border bg-card p-2 pr-3 text-card-foreground shadow-sm">\n      {img ? (\n        <img src={img} alt={label} referrerPolicy="no-referrer" className="h-16 w-12 flex-none rounded-lg border object-cover object-top bg-muted" />\n      ) : (\n        <div className="h-16 w-12 flex-none rounded-lg bg-muted" />\n      )}\n      <div className="min-w-0 flex-1">\n        <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Acteur</div>\n        <div className="truncate text-sm font-semibold">{label}</div>\n        <div className="truncate text-xs text-muted-foreground">{sub}</div>\n      </div>\n    </div>\n  );\n}\n',
}


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
            sys.exit(f"ARRÊT : {path} : bloc trouvé {c} fois au lieu de {n} :\n{old[:200]}")
        files[path] = files[path].replace(old, new)
    for path, txt in NEWFILES.items():
        p = pathlib.Path(path)
        if p.exists() and p.read_text(encoding="utf-8") != txt:
            sys.exit(f"ARRÊT : {path} existe déjà avec un autre contenu")
    if check:
        print("OK (--check) : tous les blocs trouvés, rien écrit.")
        return
    for path, txt in files.items():
        pathlib.Path(path).write_text(txt, encoding="utf-8")
        print("écrit :", path)
    for path, txt in NEWFILES.items():
        p = pathlib.Path(path)
        p.parent.mkdir(parents=True, exist_ok=True)
        p.write_text(txt, encoding="utf-8")
        print("créé :", path)


if __name__ == "__main__":
    main()
