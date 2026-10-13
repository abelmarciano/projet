"""Applique les changements du Chat dans src/routes/_authenticated/create.tsx.
Chaque remplacement vérifie que le bloc d'origine existe exactement une fois ;
sinon le script s'arrête sans rien écrire.
Usage : python3 scripts/apply-create.py src/routes/_authenticated/create.tsx
"""
import sys
from pathlib import Path

p = Path(sys.argv[1])
s = p.read_text()

def rep(old: str, new: str, label: str) -> None:
    global s
    n = s.count(old)
    if n != 1:
        sys.exit(f"Arrêt : bloc « {label} » trouvé {n} fois (attendu : 1). Rien n'a été écrit.")
    s = s.replace(old, new)

# 1. Import du libellé de menu (en-tête du menu de la pastille).
rep(
    "  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator,\n",
    "  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator,\n",
    "import dropdown-menu",
)

# 2. Rappel de changement de marque : fonction stable, partagée avec la saisie.
rep(
    "  const handleReplyToAd = useCallback((ad: GeneratedAd) => {\n",
    """  // Changement de marque depuis la pastille de la saisie : met à jour l'état et
  // ajoute une note dans le fil (« Conversation déplacée vers X »).
  const handleBrandSwitched = useCallback((patch: Record<string, unknown>, note: string) => {
    setState((prev) => {
      const next: Record<string, unknown> = { ...prev, ...patch };
      if (patch.brandingMode === "white_label") delete next.creativeBrandId;
      stateRef.current = next;
      return next;
    });
    setMessages((prev) => [...prev, { id: `brand-note-${Date.now()}`, role: "assistant", parts: [{ type: "text", text: `_${note}_` }] } as UIMessage]);
  }, [setMessages]);
  const handleReplyToAd = useCallback((ad: GeneratedAd) => {
""",
    "handleReplyToAd",
)

# 3. La pastille quitte la rangée des pièces jointes (elle va dans la barre de saisie).
rep(
    """          <ConversationBrandBar
            conversationId={conversationId}
            disabled={isLoading}
            onSwitched={(patch, note) => {
              setState((prev) => {
                const next: Record<string, unknown> = { ...prev, ...patch };
                if (patch.brandingMode === "white_label") delete next.creativeBrandId;
                stateRef.current = next;
                return next;
              });
              setMessages((prev) => [...prev, { id: `brand-note-${Date.now()}`, role: "assistant", parts: [{ type: "text", text: `_${note}_` }] } as UIMessage]);
            }}
          />
          {(pendingImages.length > 0 || pendingVideos.length > 0 || pendingAudios.length > 0 || competitorRefs.length > 0 || !!pendingCampaign || pendingActors.length > 0 || pendingCreatives.length > 0 || !!replyingTo) && (
            <span className="gx-ctx-sep" aria-hidden />
          )}
""",
    "",
    "pastille dans .gx-ctx",
)

# 4. La saisie reçoit la conversation et le rappel ; le texte sous la saisie disparaît
#    (il est dans l'infobulle et en tête du menu de la pastille).
rep(
    """            onSend={onSubmit}
            isEmptyChat={isEmptyChat}
          />
          <ConversationBrandHint conversationId={conversationId} />
""",
    """            onSend={onSubmit}
            isEmptyChat={isEmptyChat}
            conversationId={conversationId}
            onBrandSwitched={handleBrandSwitched}
          />
""",
    "ChatComposer + ConversationBrandHint",
)

# 5. ChatComposer : nouvelles propriétés.
rep(
    """      onSend: (text: string) => void;
      isEmptyChat?: boolean;
    }
  >(function ChatComposer({ disabled, isStreaming, onStop, uploadingImage, hasPendingImages, onPickFile, onOpenCreations, onOpenCatalogTab, onOpenCampaigns, onOpenContinueVideo, onSend, isEmptyChat }, ref) {
""",
    """      onSend: (text: string) => void;
      isEmptyChat?: boolean;
      /** Conversation ouverte : affiche la pastille Marque dans la barre de saisie. */
      conversationId?: string | null;
      onBrandSwitched?: (patch: Record<string, unknown>, note: string) => void;
    }
  >(function ChatComposer({ disabled, isStreaming, onStop, uploadingImage, hasPendingImages, onPickFile, onOpenCreations, onOpenCatalogTab, onOpenCampaigns, onOpenContinueVideo, onSend, isEmptyChat, conversationId, onBrandSwitched }, ref) {
""",
    "props ChatComposer",
)

# 6. ChatComposer : pastille au début du champ, avant le texte.
rep(
    """        <div className="gx-cmp-f">
          {lockedPrefix ? (
""",
    """        <div className="gx-cmp-f">
          {conversationId && onBrandSwitched ? (
            <ConversationBrandBar conversationId={conversationId} disabled={disabled} onSwitched={onBrandSwitched} />
          ) : null}
          {lockedPrefix ? (
""",
    "champ de saisie",
)

# 7. Pastille compacte (logo + nom) et suppression du rappel sous la saisie.
start = s.index("function ConversationBrandBar({ conversationId, disabled, onSwitched }: {")
end_marker = "function ConversationBrandHint({ conversationId }: { conversationId: string }) {"
hint = s.index(end_marker, start)
hint_end = s.index("\n}\n", hint) + 3
if s.count(end_marker) != 1:
    sys.exit("Arrêt : ConversationBrandHint introuvable ou en double. Rien n'a été écrit.")
s = s[:start] + Path(__file__).with_name("ConversationBrandBar.tsx.txt").read_text() + s[hint_end:]

if "ConversationBrandHint" in s:
    sys.exit("Arrêt : ConversationBrandHint est encore utilisé ailleurs. Rien n'a été écrit.")

p.write_text(s)
print("create.tsx mis à jour : 7 changements appliqués.")
