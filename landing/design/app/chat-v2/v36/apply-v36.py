#!/usr/bin/env python3
"""Chat v36 : une marque choisie dans le Chat déplace vraiment la conversation.
Constat : dans une conversation Jwel, le client répond « Leadeurs » (ou « En marque blanche »).
Le serveur enregistrait le choix dans le brief (state.creativeBrandId) et les créations partaient bien
sous Leadeurs, mais la conversation restait rattachée à Jwel (colonne brand_id) : classée sous Jwel
dans la liste, et le menu restait sur Jwel.
Correction :
- route chat.create-ad : le choix explicite met aussi à jour brand_id et white_label de la conversation
  (comme la pastille Marque) ;
- create.tsx (ConversationBrandBar) : quand la marque de la conversation change depuis le Chat, le
  sélecteur de marque du menu suit (même effet qu'un clic sur la pastille).
Chaque bloc doit être trouvé exactement N fois, sinon rien n'est écrit.
Usage : python3 apply-v36.py [--check]"""
import sys, pathlib

R = 'src/routes/api/chat.create-ad.ts'
C = 'src/routes/_authenticated/create.tsx'

EDITS = [
  (R, 1,
   "          const { error } = await supabase.from('ad_conversations').update({ state: { ...(stored?.state as Record<string, unknown> ?? {}), ...explicitBrandChoice } }).eq('id', conversationId).eq('user_id', userId);",
   "          // Le choix écrit dans le Chat déplace aussi la conversation (liste, pastille, menu), pas seulement le brief.\n          const moveConversation = explicitBrandChoice.brandingMode === 'white_label'\n            ? { brand_id: null, white_label: true }\n            : typeof explicitBrandChoice.creativeBrandId === 'string' ? { brand_id: explicitBrandChoice.creativeBrandId, white_label: false } : {};\n          const { error } = await supabase.from('ad_conversations').update({ ...moveConversation, state: { ...(stored?.state as Record<string, unknown> ?? {}), ...explicitBrandChoice } } as never).eq('id', conversationId).eq('user_id', userId);\n          if (!error && explicitBrandChoice.brandingMode === 'white_label') conversationWhiteLabel = true;"),
  (C, 1,
   '  const { white, brand, brands, loaded } = useConversationBrand(conversationId);\n  const [busy, setBusy] = useState(false);\n',
   '  const { white, brand, brands, loaded } = useConversationBrand(conversationId);\n  const [busy, setBusy] = useState(false);\n  // Marque changée depuis le Chat (« Leadeurs », « En marque blanche ») : le sélecteur du menu suit la conversation.\n  const brandKey = white ? "white" : brand?.id ?? null;\n  const prevBrandRef = useRef<{ conv: string; key: string | null } | null>(null);\n  useEffect(() => {\n    if (!loaded) return;\n    const prev = prevBrandRef.current;\n    prevBrandRef.current = { conv: conversationId, key: brandKey };\n    if (!prev || prev.conv !== conversationId || prev.key === brandKey) return;\n    if (brandKey === "white") setBrandView("white_label");\n    else if (brandKey) { setBrandView("brand"); setScreenBrandId(brandKey, "user"); }\n  }, [brandKey, conversationId, loaded]);\n'),
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
            sys.exit(f"ARRÊT : {path} : bloc trouvé {c} fois au lieu de {n} :\n{old[:200]}")
        files[path] = files[path].replace(old, new)
    if check:
        print("OK (--check) : tous les blocs trouvés, rien écrit.")
        return
    for path, txt in files.items():
        pathlib.Path(path).write_text(txt, encoding="utf-8")
        print("écrit :", path)


if __name__ == "__main__":
    main()
