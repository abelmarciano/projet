#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
P3a — Chat (/create) : remise dans la charte console de create.tsx.

Usage (depuis la racine du projet) :
    python3 scripts/apply.py            # applique
    python3 scripts/apply.py --check    # vérifie seulement, n'écrit rien

Ce script :
  1. remplace, dans src/routes/_authenticated/create.tsx, 131 blocs de texte exacts.
     Chaque bloc d'origine doit être trouvé EXACTEMENT une fois, sinon le script
     s'arrête sans rien écrire. Aucun bloc ne s'appuie sur la ligne d'import
     « lucide-react » (modifiée par le passage P1) ;
  2. ajoute dans src/styles.css la ligne
       @import "./styles/gx-chat-blocks.css";
     juste après la dernière ligne @import "./styles/…" (une seule fois).
Le fichier src/styles/gx-chat-blocks.css doit avoir été copié avant.
Testé sur create.tsx au commit 8d706afcd75acf55a14179f6c6aa0609033f6e7e.
"""
import os, re, sys

ROOT = os.getcwd()
TARGET = os.path.join(ROOT, "src", "routes", "_authenticated", "create.tsx")
STYLES = os.path.join(ROOT, "src", "styles.css")
CSS = os.path.join(ROOT, "src", "styles", "gx-chat-blocks.css")
IMPORT_LINE = '@import "./styles/gx-chat-blocks.css";'

BLOCKS = [
# --- bloc 1 ---
(r'''import { AttachChip } from "@/components/chat/AttachChip";
import { MediaViewer, type ViewerMedia } from '@/components/chat/MediaViewer';''',
 r'''import { AttachChip } from "@/components/chat/AttachChip";
import { ConsoleEmpty } from "@/components/console/ConsoleEmpty";
import { ConsoleLoading, ConsoleSkeleton } from "@/components/console/ConsoleLoading";
import { ConfirmDialog } from "@/components/console/ConfirmDialog";
import { AlertTriangle } from "@/components/icons";
import { MediaViewer, type ViewerMedia } from '@/components/chat/MediaViewer';'''),
# --- bloc 2 ---
(r'''            <Skeleton className="ml-auto h-10 w-2/3 max-w-sm rounded-2xl" />
            <div className="flex items-start gap-3">
              <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
              <Skeleton className="h-16 w-3/4 max-w-md rounded-2xl" />
            </div>
            <Skeleton className="ml-auto h-8 w-1/2 max-w-xs rounded-2xl" />''',
 r'''            <ConsoleSkeleton rows={3} variant="list" />'''),
# --- bloc 3 ---
(r'''          <div className="space-y-2">
            <Label htmlFor="folder-name" className="text-xs">Nom du dossier</Label>
            <Input
              id="folder-name"''',
 r'''          <div className="gx-cb-field">
            <label htmlFor="folder-name" className="gx-lbl">Nom du dossier</label>
            <input
              id="folder-name"
              className="gx-in"'''),
# --- bloc 4 ---
(r'''          <DialogFooter>
            <Button variant="ghost" onClick={() => setFolderDialog(null)} disabled={folderBusy}>Annuler</Button>
            <Button onClick={submitFolderDialog} disabled={folderBusy || !folderName.trim()}>
              {folderBusy ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : null}
              {folderDialog?.mode === "rename" ? "Renommer" : "Créer"}
            </Button>''',
 r'''          <DialogFooter className="gx-cb-dlgf">
            <button type="button" className="gx-btn gx-ghost" onClick={() => setFolderDialog(null)} disabled={folderBusy}>Annuler</button>
            <button type="button" className="gx-btn gx-pri" onClick={submitFolderDialog} disabled={folderBusy || !folderName.trim()}>
              {folderBusy ? <Loader2 className="gx-i animate-spin" /> : null}
              {folderDialog?.mode === "rename" ? "Renommer" : "Créer"}
            </button>'''),
# --- bloc 5 ---
(r'''          <div className="space-y-2">
            <Label htmlFor="conv-name" className="text-xs">Nom</Label>
            <Input
              id="conv-name"''',
 r'''          <div className="gx-cb-field">
            <label htmlFor="conv-name" className="gx-lbl">Nom</label>
            <input
              id="conv-name"
              className="gx-in"'''),
# --- bloc 6 ---
(r'''          <DialogFooter>
            <Button variant="ghost" onClick={() => setRenameConv(null)} disabled={renameBusy}>Annuler</Button>
            <Button onClick={submitRenameConv} disabled={renameBusy || !renameConv?.name.trim()}>
              {renameBusy ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : null}
              Renommer
            </Button>''',
 r'''          <DialogFooter className="gx-cb-dlgf">
            <button type="button" className="gx-btn gx-ghost" onClick={() => setRenameConv(null)} disabled={renameBusy}>Annuler</button>
            <button type="button" className="gx-btn gx-pri" onClick={submitRenameConv} disabled={renameBusy || !renameConv?.name.trim()}>
              {renameBusy ? <Loader2 className="gx-i animate-spin" /> : null}
              Renommer
            </button>'''),
# --- bloc 7 ---
(r'''      toast.success("Nouvelle version prête ✨ (l'originale est conservée)", { id: loadingToast });''',
 r'''      toast.success("Nouvelle version prête (l'originale est conservée)", { id: loadingToast });'''),
# --- bloc 8 ---
(r'''      toast.success("Ton prompt est prêt tel quel - clique sur *Valider* pour générer ✨");''',
 r'''      toast.success("Ton prompt est prêt tel quel - clique sur Valider pour générer");'''),
# --- bloc 9 ---
(r'''      toast.success("Prompt prêt - relis-le puis valide pour lancer la génération ✨", { id: loadingToast });''',
 r'''      toast.success("Prompt prêt - relis-le puis valide pour lancer la génération", { id: loadingToast });'''),
# --- bloc 10 ---
(r'''          toast.success(`Vidéo de ${chainCount * 8} s lancée en ${chainCount} segments (⚡${total} max, seuls les segments réussis sont débités).`, { id: loadingToast });''',
 r'''          toast.success(`Vidéo de ${chainCount * 8} s lancée en ${chainCount} segments (${total} crédits max, seuls les segments réussis sont débités).`, { id: loadingToast });'''),
# --- bloc 11 ---
(r'''        toast.success("Image créée ✨", { id: loadingToast });''',
 r'''        toast.success("Image créée", { id: loadingToast });'''),
# --- bloc 12 ---
(r'''        toast.success("Carrousel créé ✨", { id: loadingToast });''',
 r'''        toast.success("Carrousel créé", { id: loadingToast });'''),
# --- bloc 13 ---
(r'''      toast.error("Upload impossible pour l'instant. Réessaie dans quelques secondes.");''',
 r'''      toast.error("Envoi impossible pour l'instant. Réessaie dans quelques secondes.");'''),
# --- bloc 14 ---
(r'''                <Button variant="outline" size="sm" className="gx-btn gx-sm" disabled={generating || chainActive || savingActorReplacement} onClick={() => {''',
 r'''                <button type="button" className="gx-btn gx-sm" disabled={generating || chainActive || savingActorReplacement} onClick={() => {'''),
# --- bloc 15 ---
(r'''                  Changer
                </Button>
              </div>''',
 r'''                  Changer
                </button>
              </div>'''),
# --- bloc 16 ---
(r'''        className={`hidden shrink-0 overflow-hidden transition-[width] duration-300 ease-in-out md:block ${
          historyOpen ? "w-80" : "w-0"
        }`}''',
 r'''        className={`gx-hist-w${historyOpen ? " gx-open" : ""}`}'''),
# --- bloc 17 ---
(r'''  el.classList.add("ring-2", "ring-primary/60", "rounded-2xl");
  window.setTimeout(() => {
    el.classList.remove("ring-2", "ring-primary/60", "rounded-2xl");''',
 r'''  el.classList.add("gx-cb-flash");
  window.setTimeout(() => {
    el.classList.remove("gx-cb-flash");'''),
# --- bloc 18 ---
(r'''    .replace(/!\[[^\]]*\]\([^)]+\)/g, "🖼️")''',
 r'''    .replace(/!\[[^\]]*\]\([^)]+\)/g, "[image]")'''),
# --- bloc 19 ---
(r'''          label: role === "user" ? `Vous · #${userCount}` : `Assistant · #${assistantCount}`,''',
 r'''          label: role === "user" ? `Toi · #${userCount}` : `Assistant · #${assistantCount}`,'''),
# --- bloc 20 ---
(r'''    { id: "user", label: "Vous", count: counts.user },''',
 r'''    { id: "user", label: "Toi", count: counts.user },'''),
# --- bloc 21 ---
(r'''    <aside className="hidden h-full w-80 shrink-0 flex-col border-l border-border/60 bg-muted/20 md:flex">
      <div className="flex items-center gap-1 border-b border-border/60 px-3 pt-2 pb-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => switchFilter(t.id)}
            aria-pressed={filter === t.id}
            className={`inline-flex flex-1 items-center justify-center gap-1 rounded-full px-2 py-1 text-[11px] font-medium transition ${
              filter === t.id
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-background hover:text-foreground"
            }`}
          >
            <span>{t.label}</span>
            <span className={`rounded-full px-1.5 text-[10px] ${filter === t.id ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"}`}>
              {t.count}
            </span>
          </button>
        ))}
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border/60 bg-background text-muted-foreground transition hover:bg-accent hover:text-foreground"
          aria-label="Fermer l'historique"
          title="Fermer l'historique"
        >
          <PanelRightClose className="h-4 w-4" />
        </button>
      </div>

      <div className="px-3 pb-2">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher dans le chat…"
            className="h-8 rounded-lg border-border/60 bg-background pl-8 text-xs dark:bg-muted/40"
          />
        </div>
      </div>


      <div ref={listRef} className="flex-1 overflow-y-auto px-2 pb-4">
        {filtered.length === 0 ? (
          <div className="px-2 py-6 text-center text-xs text-muted-foreground">
            {emptyLabel}
          </div>
        ) : (
          <ol key={filter} className="relative space-y-1.5 pl-4">
            <span className="pointer-events-none absolute left-1.5 top-1 bottom-1 w-px bg-border/60" />''',
 r'''    <aside className="gx-hist" aria-label="Historique de la discussion">
      <div className="gx-hist-h">
        <div className="gx-seg gx-hist-tabs" role="tablist" aria-label="Filtrer l'historique">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              onClick={() => switchFilter(t.id)}
              aria-selected={filter === t.id}
              aria-pressed={filter === t.id}
            >
              <span>{t.label}</span>
              <span className="gx-hist-n">{t.count}</span>
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="gx-ib gx-sm"
          aria-label="Fermer l'historique"
          title="Fermer l'historique"
        >
          <PanelRightClose className="gx-i" />
        </button>
      </div>

      <div className="gx-hist-s">
        <label className="gx-in gx-cb-search">
          <Search className="gx-i" aria-hidden />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher dans le chat…"
            aria-label="Rechercher dans le chat"
          />
        </label>
      </div>


      <div ref={listRef} className="gx-hist-l">
        {filtered.length === 0 ? (
          <ConsoleEmpty compact icon={History} title={emptyLabel} />
        ) : (
          <ol key={filter} className="gx-hist-tl">'''),
# --- bloc 22 ---
(r'''              const dotClass = isCreation
                ? "bg-fuchsia-500"
                : isUser
                  ? "bg-primary"
                  : "bg-emerald-500";''',
 r'''              const tone = isCreation ? "gx-h-crea" : isUser ? "gx-h-user" : "gx-h-ai";'''),
# --- bloc 23 ---
(r'''                <li key={`${filter}-${e.kind}-${e.id}-${entryIndex}`} className="relative">
                  <span className={`absolute -left-[9px] top-3 h-2 w-2 rounded-full ring-2 ring-background ${dotClass}`} />
                  <button
                    type="button"
                    onClick={() => scrollToAnchor(e.anchorId)}
                    className="group flex w-full items-start gap-2 rounded-lg border border-transparent px-2 py-1.5 text-left transition hover:border-border/70 hover:bg-background"''',
 r'''                <li key={`${filter}-${e.kind}-${e.id}-${entryIndex}`} className={`gx-hist-it ${tone}`}>
                  <span className="gx-hist-dot" aria-hidden />
                  <button
                    type="button"
                    onClick={() => scrollToAnchor(e.anchorId)}
                    className="gx-hist-b"'''),
# --- bloc 24 ---
(r'''                        className="mt-0.5 h-9 w-9 shrink-0 rounded-md object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${
                        isCreation
                          ? "bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-300"
                          : isUser
                            ? "bg-primary/10 text-primary"
                            : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300"
                      }`}>
                        <KindIcon className="h-3.5 w-3.5" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        <span className="truncate">{e.label}</span>
                        {e.kind === "message" && e.hasAttachment && (
                          <Paperclip className="h-2.5 w-2.5 text-muted-foreground/70" />
                        )}
                        <span className="ml-auto shrink-0 font-normal normal-case tracking-normal text-[10px] text-muted-foreground/80 tabular-nums">
                          {formatHistoryTime(e.createdAt)}
                        </span>
                      </div>
                      <div className="mt-0.5 line-clamp-2 text-xs text-foreground/90 group-hover:text-foreground">
                        {e.snippet}
                      </div>
                    </div>''',
 r'''                        className="gx-hist-th"
                        loading="lazy"
                      />
                    ) : (
                      <span className="gx-hist-ic" aria-hidden>
                        <KindIcon className="gx-i" />
                      </span>
                    )}
                    <span className="gx-hist-tx">
                      <span className="gx-hist-k">
                        <span className="gx-hist-lb">{e.label}</span>
                        {e.kind === "message" && e.hasAttachment && (
                          <Paperclip className="gx-i" aria-label="Pièce jointe" />
                        )}
                        <span className="gx-hist-t gx-num">
                          {formatHistoryTime(e.createdAt)}
                        </span>
                      </span>
                      <span className="gx-hist-sn">
                        {e.snippet}
                      </span>
                    </span>'''),
# --- bloc 25 ---
(r'''  const fmtCredits = (n: number) => n.toLocaleString("fr-FR");
  const meta = [''',
 r'''  const fmtCredits = (n: number) => n.toLocaleString("fr-FR");
  const [confirmRegenerate, setConfirmRegenerate] = useState(false);
  const meta = ['''),
# --- bloc 26 ---
(r'''            <small>⚡{fmtCredits(300)}{preview.recommendedDuration ? ` · ${preview.recommendedDuration} s` : ""}</small>
          </button>
          <button type="button" disabled={generating} onClick={() => onQualityChange("premium")} role="radio" aria-checked={quality === "premium"} aria-pressed={quality === "premium"}>
            <b>Cinématique premium</b>
            <small>⚡{fmtCredits(1334)}</small>''',
 r'''            <small className="gx-cb-cr"><Zap className="gx-i" aria-hidden />{fmtCredits(300)} crédits{preview.recommendedDuration ? ` · ${preview.recommendedDuration} s` : ""}</small>
          </button>
          <button type="button" disabled={generating} onClick={() => onQualityChange("premium")} role="radio" aria-checked={quality === "premium"} aria-pressed={quality === "premium"}>
            <b>Cinématique premium</b>
            <small className="gx-cb-cr"><Zap className="gx-i" aria-hidden />{fmtCredits(1334)} crédits</small>'''),
# --- bloc 27 ---
(r'''                ✎ Tu as modifié le prompt - clique sur « Valider mes corrections » pour l'utiliser tel quel.''',
 r'''                <Pencil className="gx-i" aria-hidden />
                Tu as modifié le prompt - clique sur « Valider mes corrections » pour l'utiliser tel quel.'''),
# --- bloc 28 ---
(r'''                  <span aria-label={`${costCredits} crédit${costCredits > 1 ? "s" : ""}`}>· ⚡{fmtCredits(costCredits)}</span>''',
 r'''                  <span className="gx-cb-cr" aria-label={`${costCredits} crédit${costCredits > 1 ? "s" : ""}`}>· <Zap className="gx-i" aria-hidden />{fmtCredits(costCredits)}</span>'''),
# --- bloc 29 ---
(r'''                  if (hasEdits && !window.confirm("Reformuler écrasera tes modifications. Continuer ?")) return;
                  onRegenerate();
                }}
                disabled={generating || regenerating}
                title={hasEdits ? "⚠️ Écrasera tes modifications" : "Laisse l'IA réécrire le prompt à partir du brief"}
              >
                {regenerating ? <Loader2 className="gx-i animate-spin" /> : null}
                Reformuler avec l'IA · ⚡1''',
 r'''                  if (hasEdits) { setConfirmRegenerate(true); return; }
                  onRegenerate();
                }}
                disabled={generating || regenerating}
                title={hasEdits ? "Attention : écrasera tes modifications" : "Laisse l'IA réécrire le prompt à partir du brief"}
              >
                {regenerating ? <Loader2 className="gx-i animate-spin" /> : null}
                Reformuler avec l'IA · <span className="gx-cb-cr" aria-label="1 crédit"><Zap className="gx-i" aria-hidden />1</span>'''),
# --- bloc 30 ---
(r'''              </button>
            </div>
          </>
        );''',
 r'''              </button>
            </div>
            <ConfirmDialog
              open={confirmRegenerate}
              onOpenChange={setConfirmRegenerate}
              title="Reformuler avec l'IA ?"
              description="Reformuler écrasera tes modifications du prompt."
              confirmLabel="Reformuler"
              onConfirm={() => { setConfirmRegenerate(false); onRegenerate(); }}
            />
          </>
        );'''),
# --- bloc 31 ---
(r'''    chips.push({ label: "Image produit", value: `${productImages.length} 📎` });''',
 r'''    chips.push({ label: productImages.length > 1 ? "Images produit" : "Image produit", value: String(productImages.length) });'''),
# --- bloc 32 ---
(r'''    <div className="border-b border-border/40 bg-muted/30 px-4 py-2">
      <div className="mx-auto flex max-w-3xl flex-wrap gap-1.5">
        {chips.map((c) => (
          <span
            key={c.label}
            className="inline-flex items-center gap-1 rounded-full bg-background px-2.5 py-1 text-[11px] shadow-sm"
          >
            <span className="text-muted-foreground">{c.label} :</span>
            <span className="font-medium">{c.value}</span>''',
 r'''    <div className="gx-cb-brief">
      <div className="gx-chips">
        {chips.map((c) => (
          <span key={c.label} className="gx-chip gx-cb-bchip">
            <span className="gx-cb-dim">{c.label} :</span>
            <b>{c.value}</b>'''),
# --- bloc 33 ---
(r'''const QUICK_ACTIONS: Array<QuickAction & { iconClass: string }> = [
  { id: "create", label: "Créer une pub", hint: "Décris ton idée, je trouve le format et l'angle", icon: Sparkles, iconClass: "bg-primary/10 text-primary group-hover:bg-primary/15", prompt: "Je veux créer une publicité pour mon produit." },
  { id: "url", label: "Depuis une URL", hint: "Colle un lien produit, je génère tout le créatif", icon: Link2, iconClass: "bg-primary/10 text-primary group-hover:bg-primary/15", prompt: "Voici l'URL de mon produit, crée une pub complète à partir de cette page : " },
  { id: "analyze", label: "Analyser mes pubs", hint: "Voir ce qui performe et ce qui mérite d'être testé", icon: TrendingUp, iconClass: "bg-amber-500/10 text-amber-600 group-hover:bg-amber-500/15 dark:bg-amber-400/15 dark:text-amber-300", prompt: "Analyse mes pubs et dis-moi ce qui performe le mieux, ce qui fatigue et quoi tester ensuite." },
  { id: "launch-retargeting", label: "Retargeting visiteurs", hint: "Relancer ceux qui ont visité sans acheter", icon: Target, iconClass: "bg-fuchsia-500/10 text-fuchsia-600 group-hover:bg-fuchsia-500/15 dark:bg-fuchsia-400/15 dark:text-fuchsia-300", prompt: "Je veux lancer une campagne de retargeting pour les visiteurs qui n'ont pas acheté." },''',
 r'''const QUICK_ACTIONS: QuickAction[] = [
  { id: "create", label: "Créer une pub", hint: "Décris ton idée, je trouve le format et l'angle", icon: Sparkles, prompt: "Je veux créer une publicité pour mon produit." },
  { id: "url", label: "Depuis une URL", hint: "Colle un lien produit, je génère tout le créatif", icon: Link2, prompt: "Voici l'URL de mon produit, crée une pub complète à partir de cette page : " },
  { id: "analyze", label: "Analyser mes pubs", hint: "Voir ce qui performe et ce qui mérite d'être testé", icon: TrendingUp, prompt: "Analyse mes pubs et dis-moi ce qui performe le mieux, ce qui fatigue et quoi tester ensuite." },
  { id: "launch-retargeting", label: "Relancer les visiteurs", hint: "Relancer ceux qui ont visité sans acheter", icon: Target, prompt: "Je veux lancer une campagne de retargeting pour les visiteurs qui n'ont pas acheté." },'''),
# --- bloc 34 ---
(r'''  const base = "h-10 w-10 shrink-0 rounded-lg overflow-hidden ring-1 ring-black/5 dark:ring-white/10";
  switch (variant) {
    case "studio":
      return (
        <div className={`${base} bg-gradient-to-b from-neutral-100 to-neutral-300 dark:from-neutral-700 dark:to-neutral-900 relative`}>
          <div className="absolute inset-x-2 bottom-1.5 h-4 rounded-sm bg-neutral-800/80 dark:bg-neutral-200/80" />
        </div>
      );
    case "lifestyle":
      return (
        <div className={`${base} relative bg-gradient-to-br from-warning/50 via-destructive/30 to-primary/60`}>
          <div className="absolute inset-x-1 bottom-1 h-3 rounded-sm bg-black/25" />
          <div className="absolute left-2 top-1.5 h-2 w-2 rounded-full bg-yellow-200/90" />
        </div>
      );
    case "before-after":
      return (
        <div className={`${base} relative flex`}>
          <div className="w-1/2 bg-neutral-400 dark:bg-neutral-600" />
          <div className="w-1/2 bg-gradient-to-br from-primary to-fuchsia-500" />
          <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-white/70" />
        </div>
      );
    case "packshot":
      return (
        <div className={`${base} relative bg-white dark:bg-neutral-100 flex items-center justify-center`}>
          <div className="h-6 w-4 rounded-sm bg-gradient-to-b from-primary to-fuchsia-500 shadow" />
        </div>
      );
    case "flatlay":
      return (
        <div className={`${base} relative bg-amber-50 dark:bg-amber-100/90 grid grid-cols-3 grid-rows-3 gap-0.5 p-1`}>
          <div className="rounded-sm bg-rose-400/80" />
          <div className="rounded-sm bg-emerald-400/80" />
          <div className="rounded-sm bg-primary/80" />
          <div className="rounded-sm bg-amber-400/80" />
          <div className="rounded-sm bg-neutral-800/70" />
          <div className="rounded-sm bg-fuchsia-400/80" />
          <div className="rounded-sm bg-sky-400/80" />
          <div className="rounded-sm bg-orange-400/80" />
          <div className="rounded-sm bg-teal-400/80" />
        </div>
      );
    case "ugc":
      // Mini "selfie face caméra" : buste + tête + petit micro / point rouge REC
      return (
        <div className={`${base} relative bg-gradient-to-br from-rose-200 via-orange-200 to-amber-200 dark:from-rose-500/30 dark:via-orange-500/25 dark:to-amber-500/25`}>
          <div className="absolute left-1/2 top-1.5 h-3 w-3 -translate-x-1/2 rounded-full bg-neutral-800/85 dark:bg-neutral-100/90" />
          <div className="absolute inset-x-1.5 bottom-1 h-3 rounded-t-full bg-neutral-800/85 dark:bg-neutral-100/90" />
          <div className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-red-500 shadow-[0_0_4px_rgba(239,68,68,0.7)]" />
        </div>
      );
    case "motion":
      // Formes géométriques animées façon motion design
      return (
        <div className={`${base} relative bg-neutral-900 dark:bg-neutral-950`}>
          <div className="absolute left-1 top-1 h-3 w-3 rounded-sm bg-fuchsia-500 rotate-12" />
          <div className="absolute right-1 top-2 h-2.5 w-2.5 rounded-full bg-cyan-400" />
          <div className="absolute bottom-1 left-1/2 h-0 w-0 -translate-x-1/2 border-b-[8px] border-l-[6px] border-r-[6px] border-b-yellow-400 border-l-transparent border-r-transparent" />
          <div className="absolute bottom-1.5 right-1 h-2 w-4 rounded-full bg-primary/80" />
        </div>
      );
    case "cinematic":
      // Bandes noires cinéma + halo lumineux "grade" cinéma
      return (
        <div className={`${base} relative bg-gradient-to-br from-primary/80 via-studio-panel to-studio`}>
          <div className="absolute inset-x-0 top-0 h-1.5 bg-black" />
          <div className="absolute inset-x-0 bottom-0 h-1.5 bg-black" />
          <div className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-300/50 blur-[3px]" />
          <div className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-100" />
        </div>
      );
    default:
      return (
        <div className={`${base} flex items-center justify-center bg-gradient-to-br from-primary/20 to-fuchsia-500/20`}>
          <Sparkles className="h-4 w-4 text-primary/70" />
        </div>''',
 r'''  // Vignettes dessinées en CSS (gx-chat-blocks.css), couleurs = jetons --gx-*.
  switch (variant) {
    case "studio":
      return <span className="gx-sthumb gx-v-studio" aria-hidden><i /></span>;
    case "lifestyle":
      return <span className="gx-sthumb gx-v-lifestyle" aria-hidden><i /><i /></span>;
    case "before-after":
      return <span className="gx-sthumb gx-v-ba" aria-hidden><i /><i /><i /></span>;
    case "packshot":
      return <span className="gx-sthumb gx-v-packshot" aria-hidden><i /></span>;
    case "flatlay":
      return <span className="gx-sthumb gx-v-flatlay" aria-hidden><i /><i /><i /><i /><i /><i /><i /><i /><i /></span>;
    case "ugc":
      // Mini "selfie face caméra" : buste + tête + point rouge REC
      return <span className="gx-sthumb gx-v-ugc" aria-hidden><i /><i /><i /></span>;
    case "motion":
      // Formes géométriques façon motion design
      return <span className="gx-sthumb gx-v-motion" aria-hidden><i /><i /><i /><i /></span>;
    case "cinematic":
      // Bandes noires cinéma + halo lumineux
      return <span className="gx-sthumb gx-v-cine" aria-hidden><i /><i /><i /></span>;
    default:
      return (
        <span className="gx-sthumb gx-v-generic" aria-hidden>
          <Sparkles className="gx-i" />
        </span>'''),
# --- bloc 35 ---
(r'''    wrapperClass: `flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${tint}`,''',
 r'''    wrapperClass: `gx-cb-ic ${tint}`,'''),
# --- bloc 36 ---
(r'''    return iconWrap("bg-primary/10 text-primary", <RectangleVertical className="h-4 w-4" />);
  if (/\b1\s*[:x]\s*1\b|\bcarr[eé]\b|square|feed/.test(t))
    return iconWrap("bg-primary/10 text-primary", <Square className="h-4 w-4" />);
  if (/\b16\s*[:x]\s*9\b|horizontal|paysage|youtube/.test(t))
    return iconWrap("bg-primary/10 text-primary", <RectangleHorizontal className="h-4 w-4" />);
  if (/\b4\s*[:x]\s*5\b/.test(t))
    return iconWrap("bg-primary/10 text-primary", <RectangleVertical className="h-4 w-4" />);

  // Langues - drapeaux emoji
  const flag = (emoji: string): SuggestionVisual => ({
    node: <span className="text-2xl leading-none">{emoji}</span>,
    wrapperClass: "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted/60",
  });
  if (/fran[cç]ais|french/.test(t)) return flag("🇫🇷");
  if (/anglais|english/.test(t)) return flag("🇬🇧");
  if (/espagnol|spanish/.test(t)) return flag("🇪🇸");
  if (/allemand|german/.test(t)) return flag("🇩🇪");
  if (/italien|italian/.test(t)) return flag("🇮🇹");
  if (/portugais|portuguese|br[eé]silien/.test(t)) return flag("🇵🇹");
  if (/n[eé]erlandais|dutch/.test(t)) return flag("🇳🇱");
  if (/chinois|chinese|mandarin/.test(t)) return flag("🇨🇳");
  if (/japonais|japanese/.test(t)) return flag("🇯🇵");
  if (/cor[eé]en|korean/.test(t)) return flag("🇰🇷");

  // Types de contenu
  if (/carrousel|carousel|slides?/.test(t))
    return iconWrap("bg-fuchsia-500/10 text-fuchsia-600 dark:bg-fuchsia-400/15 dark:text-fuchsia-300", <Layers className="h-4 w-4" />);
  if (/\bvid[eé]o\b|clip/.test(t))
    return iconWrap("bg-rose-500/10 text-rose-600 dark:bg-rose-400/15 dark:text-rose-300", <Video className="h-4 w-4" />);
  if (/\bimage\b|visuel|photo/.test(t))
    return iconWrap("bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/15 dark:text-emerald-300", <ImageIcon className="h-4 w-4" />);

  // Durée
  if (/^\s*\d{1,3}\s*(s|sec|secondes?)\b|dur[eé]e/.test(t))
    return iconWrap("bg-teal-500/10 text-teal-600 dark:bg-teal-400/15 dark:text-teal-300", <Clock className="h-4 w-4" />);

  // Voix / audio
  if (/voix|voice.?over|sous.?titre/.test(t))
    return iconWrap("bg-primary/10 text-primary", <Captions className="h-4 w-4" />);''',
 r'''    return iconWrap("gx-t-acc", <RectangleVertical className="gx-i" />);
  if (/\b1\s*[:x]\s*1\b|\bcarr[eé]\b|square|feed/.test(t))
    return iconWrap("gx-t-acc", <Square className="gx-i" />);
  if (/\b16\s*[:x]\s*9\b|horizontal|paysage|youtube/.test(t))
    return iconWrap("gx-t-acc", <RectangleHorizontal className="gx-i" />);
  if (/\b4\s*[:x]\s*5\b/.test(t))
    return iconWrap("gx-t-acc", <RectangleVertical className="gx-i" />);

  // Langues - code langue (pas d'emoji drapeau)
  const flag = (code: string): SuggestionVisual => ({
    node: <span className="gx-cb-lang">{code}</span>,
    wrapperClass: "gx-cb-ic gx-t-mut",
  });
  if (/fran[cç]ais|french/.test(t)) return flag("FR");
  if (/anglais|english/.test(t)) return flag("EN");
  if (/espagnol|spanish/.test(t)) return flag("ES");
  if (/allemand|german/.test(t)) return flag("DE");
  if (/italien|italian/.test(t)) return flag("IT");
  if (/portugais|portuguese|br[eé]silien/.test(t)) return flag("PT");
  if (/n[eé]erlandais|dutch/.test(t)) return flag("NL");
  if (/chinois|chinese|mandarin/.test(t)) return flag("ZH");
  if (/japonais|japanese/.test(t)) return flag("JA");
  if (/cor[eé]en|korean/.test(t)) return flag("KO");

  // Types de contenu
  if (/carrousel|carousel|slides?/.test(t))
    return iconWrap("gx-t-acc", <Layers className="gx-i" />);
  if (/\bvid[eé]o\b|clip/.test(t))
    return iconWrap("gx-t-bad", <Video className="gx-i" />);
  if (/\bimage\b|visuel|photo/.test(t))
    return iconWrap("gx-t-ok", <ImageIcon className="gx-i" />);

  // Durée
  if (/^\s*\d{1,3}\s*(s|sec|secondes?)\b|dur[eé]e/.test(t))
    return iconWrap("gx-t-ok", <Clock className="gx-i" />);

  // Voix / audio
  if (/voix|voice.?over|sous.?titre/.test(t))
    return iconWrap("gx-t-acc", <Captions className="gx-i" />);'''),
# --- bloc 37 ---
(r'''    return iconWrap("bg-muted text-muted-foreground", <ArrowRight className="h-4 w-4" />);
  if (/d[ée]crire ou uploader|importer des photos/.test(t))
    return iconWrap("bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/15 dark:text-emerald-300", <Upload className="h-4 w-4" />);
  if (/lien de la fiche|coller le lien/.test(t))
    return iconWrap("bg-sky-500/10 text-sky-600 dark:bg-sky-400/15 dark:text-sky-300", <Link2 className="h-4 w-4" />);
  if (/catalogue/.test(t))
    return iconWrap("bg-primary/10 text-primary", <FolderOpen className="h-4 w-4" />);
  if (/e[- ]?commerce|boutique en ligne|vente en ligne|\bproduits?\b/.test(t))
    return iconWrap("bg-orange-500/10 text-orange-600 dark:bg-orange-400/15 dark:text-orange-300", <ShoppingCart className="h-4 w-4" />);
  // Cible / audience
  if (/\b(jeune|senior|adulte|ado|teen|18\s*[--]|25\s*[--]|35\s*[--]|hommes?|femmes?|parents?|[eé]tudiants?|pro(fessionnel)?s?|entrepreneurs?|sportif|d[eé]butants?|expert)/.test(t))
    return iconWrap("bg-sky-500/10 text-sky-600 dark:bg-sky-400/15 dark:text-sky-300", <Users className="h-4 w-4" />);
  if (/\b(produit|service|marque|app(li(cation)?)?|site|boutique|e[- ]?commerce|saas|abonnement|formation|coaching|[eé]v[eé]nement|promotion|offre|soldes?)\b/.test(t))
    return iconWrap("bg-orange-500/10 text-orange-600 dark:bg-orange-400/15 dark:text-orange-300", <Megaphone className="h-4 w-4" />);

  // Promesse / bénéfices
  if (/\b(gagn|[eé]conomis|rapide|facile|simple|meilleur|garanti|r[eé]sultats?|transform|boost|augment|r[eé]duire|prot[eé]g|efficac|puissant)/.test(t))
    return iconWrap("bg-yellow-500/10 text-yellow-600 dark:bg-yellow-400/15 dark:text-yellow-300", <Zap className="h-4 w-4" />);
  if (/\b(prix|pas\s*cher|abordable|remise|discount|-?\d+\s*%|solde)/.test(t))
    return iconWrap("bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/15 dark:text-emerald-300", <Gift className="h-4 w-4" />);
  if (/\b(luxe|exclusif|haut de gamme|prestige|elite)/.test(t))
    return iconWrap("bg-amber-500/10 text-amber-600 dark:bg-amber-400/15 dark:text-amber-300", <Crown className="h-4 w-4" />);''',
 r'''    return iconWrap("gx-t-mut", <ArrowRight className="gx-i" />);
  if (/d[ée]crire ou uploader|importer des photos/.test(t))
    return iconWrap("gx-t-ok", <Upload className="gx-i" />);
  if (/lien de la fiche|coller le lien/.test(t))
    return iconWrap("gx-t-meta", <Link2 className="gx-i" />);
  if (/catalogue/.test(t))
    return iconWrap("gx-t-acc", <FolderOpen className="gx-i" />);
  if (/e[- ]?commerce|boutique en ligne|vente en ligne|\bproduits?\b/.test(t))
    return iconWrap("gx-t-warn", <ShoppingCart className="gx-i" />);
  // Cible / audience
  if (/\b(jeune|senior|adulte|ado|teen|18\s*[--]|25\s*[--]|35\s*[--]|hommes?|femmes?|parents?|[eé]tudiants?|pro(fessionnel)?s?|entrepreneurs?|sportif|d[eé]butants?|expert)/.test(t))
    return iconWrap("gx-t-meta", <Users className="gx-i" />);
  if (/\b(produit|service|marque|app(li(cation)?)?|site|boutique|e[- ]?commerce|saas|abonnement|formation|coaching|[eé]v[eé]nement|promotion|offre|soldes?)\b/.test(t))
    return iconWrap("gx-t-warn", <Megaphone className="gx-i" />);

  // Promesse / bénéfices
  if (/\b(gagn|[eé]conomis|rapide|facile|simple|meilleur|garanti|r[eé]sultats?|transform|boost|augment|r[eé]duire|prot[eé]g|efficac|puissant)/.test(t))
    return iconWrap("gx-t-warn", <Zap className="gx-i" />);
  if (/\b(prix|pas\s*cher|abordable|remise|discount|-?\d+\s*%|solde)/.test(t))
    return iconWrap("gx-t-ok", <Gift className="gx-i" />);
  if (/\b(luxe|exclusif|haut de gamme|prestige|elite)/.test(t))
    return iconWrap("gx-t-warn", <Crown className="gx-i" />);'''),
# --- bloc 38 ---
(r'''    "bg-muted/60 text-muted-foreground",
    <Sparkles className="h-4 w-4" />,''',
 r'''    "gx-t-mut",
    <Sparkles className="gx-i" />,'''),
# --- bloc 39 ---
(r'''        title={locked ? "Réponse déjà donnée - répondez à la nouvelle question ci-dessous." : undefined}''',
 r'''        title={locked ? "Réponse déjà donnée - réponds à la nouvelle question ci-dessous." : undefined}'''),
# --- bloc 40 ---
(r'''          el.classList.add("ring-2", "ring-primary/50", "bg-primary/10");
          window.setTimeout(() => onSuggestion(s), 120);
        }}
        className={
          locked
            ? "group flex w-full items-center justify-between gap-3 rounded-xl border border-dashed border-border/60 bg-muted/40 px-3.5 py-3 text-left opacity-55 cursor-not-allowed pointer-events-none select-none"
            : isMetaConfirm
              ? "group flex w-full items-center justify-between gap-3 rounded-xl border border-meta bg-meta px-3.5 py-3 text-left text-primary-foreground shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-meta/90 hover:shadow-md active:scale-[0.99]"
              : "group flex w-full items-center justify-between gap-3 rounded-xl border border-border bg-background px-3.5 py-3 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/60 hover:bg-primary/[0.06] hover:shadow-md active:scale-[0.99]"
        }''',
 r'''          el.classList.add("gx-picked");
          window.setTimeout(() => onSuggestion(s), 120);
        }}
        className={`gx-sug-opt${locked ? " gx-locked" : isMetaConfirm ? " gx-meta-c" : ""}`}'''),
# --- bloc 41 ---
(r'''          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-foreground/15">
            <MetaIcon className="h-5 w-5" />
          </div>''',
 r'''          <span className="gx-cb-ic gx-t-on">
            <MetaIcon className="gx-i" />
          </span>'''),
# --- bloc 42 ---
(r'''            className="h-9 w-9 shrink-0 rounded-full border border-border/60 object-cover"''',
 r'''            className="gx-sug-logo"'''),
# --- bloc 43 ---
(r'''        <div className="min-w-0 flex-1">
          <div className={`break-words text-sm font-medium leading-snug ${locked ? "text-muted-foreground line-through decoration-muted-foreground/40" : isMetaConfirm ? "text-primary-foreground" : "text-foreground"}`}>
            {visual || logoUrl || isMetaConfirm ? stripLeadingEmoji(s) : s}
          </div>
        </div>
        {locked ? (
          <Lock className="h-4 w-4 shrink-0 text-muted-foreground/60" />
        ) : (
          <ArrowRight className={`h-4 w-4 shrink-0 transition group-hover:translate-x-0.5 ${isMetaConfirm ? "text-primary-foreground/80" : "text-primary/50 group-hover:text-primary"}`} />''',
 r'''        <span className="gx-sug-t">
          {visual || logoUrl || isMetaConfirm ? stripLeadingEmoji(s) : s}
        </span>
        {locked ? (
          <Lock className="gx-i gx-sug-end" />
        ) : (
          <ArrowRight className="gx-i gx-sug-end" />'''),
# --- bloc 44 ---
(r'''      className={`mt-3 min-w-0 max-w-full flex flex-col gap-2 ${
        suggestions.length >= 4
          ? "rounded-xl border border-border/60 bg-muted/20 p-2"
          : ""
      }`}
      aria-disabled={locked || undefined}
    >
      {searchable && !locked && (
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher…"
            className="h-9 bg-background pl-8 text-sm"
          />
        </div>
      )}

      {scheduling && !locked && (
        <div className="rounded-xl border border-primary/40 bg-primary/[0.04] p-3">
          <div className="mb-2 text-sm font-medium">Date et heure de lancement (fuseau du compte Meta)</div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              type="datetime-local"
              value={when}
              onChange={(e) => setWhen(e.target.value)}
              className="h-10 bg-background text-sm"
            />
            <div className="flex gap-2">
              <Button size="sm" className="h-10" disabled={!when} onClick={confirmSchedule}>
                Confirmer
              </Button>
              <Button size="sm" variant="ghost" className="h-10" onClick={() => setScheduling(false)}>
                Annuler
              </Button>''',
 r'''      className={`gx-sug-list${suggestions.length >= 4 ? " gx-boxed" : ""}`}
      aria-disabled={locked || undefined}
    >
      {searchable && !locked && (
        <label className="gx-in gx-cb-search">
          <Search className="gx-i" aria-hidden />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher…"
            aria-label="Rechercher une réponse"
          />
        </label>
      )}

      {scheduling && !locked && (
        <div className="gx-sug-form">
          <b>Date et heure de lancement (fuseau du compte Meta)</b>
          <div className="gx-sug-form-r">
            <input
              type="datetime-local"
              className="gx-in"
              value={when}
              onChange={(e) => setWhen(e.target.value)}
            />
            <div className="gx-row">
              <button type="button" className="gx-btn gx-sm gx-pri" disabled={!when} onClick={confirmSchedule}>
                Confirmer
              </button>
              <button type="button" className="gx-btn gx-sm gx-ghost" onClick={() => setScheduling(false)}>
                Annuler
              </button>'''),
# --- bloc 45 ---
(r'''        <div className="rounded-xl border border-primary/40 bg-primary/[0.04] p-3">
          <div className="mb-2 text-sm font-medium">Précisez votre réponse</div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              autoFocus''',
 r'''        <div className="gx-sug-form">
          <b>Précise ta réponse</b>
          <div className="gx-sug-form-r">
            <input
              autoFocus
              className="gx-in"'''),
# --- bloc 46 ---
(r'''              placeholder="Écrivez votre précision…"
              className="h-10 bg-background text-sm"
            />
            <div className="flex gap-2">
              <Button size="sm" className="h-10" disabled={!freeTextValue.trim()} onClick={confirmFreeText}>
                Envoyer
              </Button>
              <Button size="sm" variant="ghost" className="h-10" onClick={() => { setFreeText(null); setFreeTextValue(""); }}>
                Annuler
              </Button>''',
 r'''              placeholder="Écris ta précision…"
            />
            <div className="gx-row">
              <button type="button" className="gx-btn gx-sm gx-pri" disabled={!freeTextValue.trim()} onClick={confirmFreeText}>
                Envoyer
              </button>
              <button type="button" className="gx-btn gx-sm gx-ghost" onClick={() => { setFreeText(null); setFreeTextValue(""); }}>
                Annuler
              </button>'''),
# --- bloc 47 ---
(r'''      <div className={suggestions.length >= 4 ? "flex min-w-0 flex-col gap-2 overflow-x-hidden px-1.5 py-1.5" : "flex min-w-0 flex-col gap-2 px-0.5 py-0.5"}>
        {items.length === 0 && (
          <div className="px-2 py-3 text-center text-xs text-muted-foreground">Aucun résultat</div>''',
 r'''      <div className="gx-sug-items">
        {items.length === 0 && (
          <p className="gx-hint gx-cb-center">Aucun résultat</p>'''),
# --- bloc 48 ---
(r'''        <div className="flex min-w-0 flex-col gap-2 px-0.5 py-0.5">''',
 r'''        <div className="gx-sug-items">'''),
# --- bloc 49 ---
(r'''      toast.success(next === "up" ? "Merci, ton retour améliore l'assistant 👍" : "Noté, on va faire mieux 🙏");''',
 r'''      toast.success(next === "up" ? "Merci, ton retour améliore l'assistant" : "Noté, on va faire mieux");'''),
# --- bloc 50 ---
(r'''    <div className="relative flex aspect-[9/16] max-h-64 w-full flex-col items-center justify-center gap-4 overflow-hidden rounded-xl bg-muted/40 px-6">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
      <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-background shadow-sm ring-1 ring-border">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="absolute h-12 w-12 animate-ping rounded-full border border-primary/20" />
      </div>
      <div className="w-full max-w-[260px] space-y-2">
        <div className="h-2 w-full overflow-hidden rounded-full bg-background ring-1 ring-border/60">
          <div className="relative h-full overflow-hidden rounded-full bg-primary transition-all duration-1000 ease-out" style={{ width: `${progress}%` }}>
            <div className="absolute inset-0 -translate-x-full animate-[slide-in-right_1.4s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-primary-foreground/40 to-transparent" />
          </div>
        </div>
        <div className="flex items-center justify-between gap-3 text-[11px] text-muted-foreground">
          <span className="truncate font-medium text-foreground/80">{label}</span>
          <span className="inline-flex shrink-0 items-center gap-1"><Clock className="h-3 w-3" />{timeLabel}</span>
        </div>
        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
          <span>{detailLabel}</span>
          <span>{progress}%</span>
        </div>
        {adId && (
          <Button
            size="sm"
            variant="outline"
            disabled={cancelling}
            onClick={() => void handleCancel()}
            className="h-7 w-full gap-1.5 text-[11px]"
          >
            {cancelling ? <Loader2 className="h-3 w-3 animate-spin" /> : <Square className="h-3 w-3" />}
            Arrêter
          </Button>''',
 r'''    <div className="gx-pend" role="status" aria-live="polite">
      <span className="gx-pend-ic" aria-hidden>
        <Loader2 className="gx-i animate-spin" />
      </span>
      <div className="gx-pend-b">
        <span className="gx-bar gx-pend-bar" aria-hidden>
          <i style={{ width: `${progress}%` }} />
        </span>
        <div className="gx-pend-r">
          <b>{label}</b>
          <span className="gx-num"><Clock className="gx-i" aria-hidden />{timeLabel}</span>
        </div>
        <div className="gx-pend-r gx-pend-s">
          <span>{detailLabel}</span>
          <span className="gx-num">{progress}%</span>
        </div>
        {adId && (
          <button
            type="button"
            className="gx-btn gx-sm gx-pend-x"
            disabled={cancelling}
            onClick={() => void handleCancel()}
          >
            {cancelling ? <Loader2 className="gx-i animate-spin" /> : <Square className="gx-i" />}
            Arrêter
          </button>'''),
# --- bloc 51 ---
(r'''        {ad.status === "ready" && onOpenMedia && <Button className="gx-expand-media" variant="secondary" size="icon" aria-label="Agrandir le média" onClick={() => onOpenMedia(ad)}><Maximize2 /></Button>}''',
 r'''        {ad.status === "ready" && onOpenMedia && <button type="button" className="gx-ib gx-sm gx-expand-media" aria-label="Agrandir le média" title="Agrandir" onClick={() => onOpenMedia(ad)}><Maximize2 className="gx-i" /></button>}'''),
# --- bloc 52 ---
(r'''          {folders.isLoading && <div className="px-2 py-1.5 text-xs text-muted-foreground">Chargement…</div>}
          {!folders.isLoading && (folders.data ?? []).length === 0 && (
            <div className="px-2 py-1.5 text-xs text-muted-foreground">Aucun dossier</div>''',
 r'''          {folders.isLoading && <div className="gx-cb-mi"><ConsoleLoading variant="inline" /></div>}
          {!folders.isLoading && (folders.data ?? []).length === 0 && (
            <p className="gx-cb-mi gx-hint">Aucun dossier</p>'''),
# --- bloc 53 ---
(r'''          <Input
            autoFocus''',
 r'''          <input
            autoFocus
            className="gx-in gx-cb-full"
            aria-label="Nom du dossier"'''),
# --- bloc 54 ---
(r'''          <DialogFooter>
            <Button variant="outline" onClick={() => setNewOpen(false)}>Annuler</Button>
            <Button onClick={() => void createAndMove()} disabled={busy || !name.trim()}>Créer et ranger</Button>''',
 r'''          <DialogFooter className="gx-cb-dlgf">
            <button type="button" className="gx-btn" onClick={() => setNewOpen(false)}>Annuler</button>
            <button type="button" className="gx-btn gx-pri" onClick={() => void createAndMove()} disabled={busy || !name.trim()}>
              {busy ? <Loader2 className="gx-i animate-spin" /> : null}
              Créer et ranger
            </button>'''),
# --- bloc 55 ---
(r'''        <video src={videoUrl} controls className="w-full rounded-lg bg-black max-h-64" />
        <div className="space-y-3">
          <div>
            <Label className="text-xs">Nouveau texte à dire</Label>
            <Textarea''',
 r'''        <video src={videoUrl} controls className="gx-cb-dmed" />
        <div className="gx-dlg-b">
          <div className="gx-cb-field">
            <label className="gx-lbl" htmlFor="dub-text">Nouveau texte à dire</label>
            <textarea
              id="dub-text"
              className="gx-in"'''),
# --- bloc 56 ---
(r'''            <p className={`mt-1 text-right text-[11px] ${text.length > 195 ? "text-destructive" : "text-muted-foreground"}`}>
              {text.length}/200 caractères (limite du modèle de doublage)
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Langue</Label>
              <Input value={language} onChange={(e) => setLanguage(e.target.value)} placeholder="fr / en / es…" />
            </div>
            <div>
              <Label className="text-xs">Voix</Label>''',
 r'''            <p className={`gx-cb-count gx-num${text.length > 195 ? " gx-err" : ""}`}>
              {text.length}/200 caractères (limite du modèle de doublage)
            </p>
          </div>
          <div className="gx-cb-2col">
            <div className="gx-cb-field">
              <label className="gx-lbl" htmlFor="dub-lang">Langue</label>
              <input id="dub-lang" className="gx-in" value={language} onChange={(e) => setLanguage(e.target.value)} placeholder="fr / en / es…" />
            </div>
            <div className="gx-cb-field">
              <span className="gx-lbl">Voix</span>'''),
# --- bloc 57 ---
(r'''                      {v.label} <span className="text-xs text-muted-foreground">— {v.mood}</span>''',
 r'''                      {v.label} <span className="gx-cb-dim">— {v.mood}</span>'''),
# --- bloc 58 ---
(r'''        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
          <Button
            disabled={!text.trim() || busy}''',
 r'''        </div>
        <DialogFooter className="gx-cb-dlgf">
          <button type="button" className="gx-btn" onClick={() => onOpenChange(false)}>Annuler</button>
          <button
            type="button"
            className="gx-btn gx-pri"
            disabled={!text.trim() || busy}'''),
# --- bloc 59 ---
(r'''            {busy ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : <Languages className="mr-2 h-3.5 w-3.5" />}
            Doubler
          </Button>''',
 r'''            {busy ? <Loader2 className="gx-i animate-spin" /> : <Languages className="gx-i" />}
            Doubler
          </button>'''),
# --- bloc 60 ---
(r'''        <img src={imageUrl} alt="source" className="max-h-64 w-full rounded-lg object-contain" />
        <Textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} placeholder="Ex : remplace le fond par une plage au coucher du soleil" />
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
          <Button''',
 r'''        <img src={imageUrl} alt="Image d'origine" className="gx-cb-dmed gx-cb-contain" />
        <textarea className="gx-in" aria-label="Modification souhaitée" value={text} onChange={(e) => setText(e.target.value)} rows={3} placeholder="Ex : remplace le fond par une plage au coucher du soleil" />
        <DialogFooter className="gx-cb-dlgf">
          <button type="button" className="gx-btn" onClick={() => onOpenChange(false)}>Annuler</button>
          <button
            type="button"
            className="gx-btn gx-pri"'''),
# --- bloc 61 ---
(r'''            {busy ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : <Palette className="mr-2 h-3.5 w-3.5" />}
            Retoucher
          </Button>''',
 r'''            {busy ? <Loader2 className="gx-i animate-spin" /> : <Palette className="gx-i" />}
            Retoucher
          </button>'''),
# --- bloc 62 ---
(r'''              `   • **Leads** - Récoltez des contacts qualifiés (email, téléphone) via un formulaire instantané\n` +
              `   • **Trafic** - Amenez des visiteurs sur votre site ou page de destination\n` +
              `   • **Ventes** - Convertissez votre audience en achats directs sur votre boutique\n\n` +''',
 r'''              `   • **Leads** - Récolte des contacts qualifiés (email, téléphone) via un formulaire instantané\n` +
              `   • **Trafic** - Amène des visiteurs sur ton site ou ta page de destination\n` +
              `   • **Ventes** - Convertis ton audience en achats directs sur ta boutique\n\n` +'''),
# --- bloc 63 ---
(r'''    <div className="pl-11 space-y-3">
      {pending.map((p, i) => (
        <div key={`${message.id}-pending-${p.toolCallId ?? i}`} className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1.5 text-xs text-muted-foreground">''',
 r'''    <div className="gx-tools">
      {pending.map((p, i) => (
        <div key={`${message.id}-pending-${p.toolCallId ?? i}`} className="gx-tool-wait" role="status">'''),
# --- bloc 64 ---
(r'''      <div className="rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-2 text-xs text-destructive">{err}</div>''',
 r'''      <div className="gx-kard gx-err gx-cb-errk"><AlertTriangle className="gx-i" aria-hidden />{err}</div>'''),
# --- bloc 65 ---
(r'''    <div className="rounded-2xl border border-primary/40 bg-gradient-to-br from-primary/5 via-background to-background p-4 shadow-elegant">
      <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
        <Wand2 className="h-4 w-4 text-primary" />
        Brief de la suite {typeof output?.parentTitle === "string" && output.parentTitle ? `— ${output.parentTitle}` : ""}
      </div>
      <p className="mb-2 text-xs text-muted-foreground">
        Modifie directement le texte si besoin, puis génère : le brief est utilisé <em>mot pour mot</em>. Durée fixe : 7 secondes.
      </p>
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={busy || launched}
        className="min-h-[170px] resize-y rounded-xl border-border/70 bg-background text-sm leading-relaxed"
      />
      {launched ? (
        <p className="mt-3 text-xs text-primary">✅ Suite lancée — elle apparaît juste en dessous.</p>
      ) : (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Button
            className="bg-grad rounded-full text-white shadow-elegant hover:opacity-90"
            onClick={generate}
            disabled={busy || text.trim().length < 10}
          >
            {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
            {busy ? "Génération…" : edited ? "Valider mes corrections & générer" : "Générer tel quel"}
            {!busy ? <CreditCost credits={creditCost("fal-ai/veo3.1/extend-video", { seconds: 7 })} /> : null}
          </Button>
          {edited && (
            <Button variant="ghost" size="sm" className="rounded-full" onClick={() => setText(initialBrief)} disabled={busy}>
              Rétablir le brief IA
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full text-muted-foreground hover:text-foreground"
            onClick={() => setDismissed(true)}
            disabled={busy}
          >
            <X className="mr-1 h-4 w-4" />
            Annuler
          </Button>''',
 r'''    <div className="gx-kard gx-prompt">
      <div className="gx-kh">
        <b className="gx-cb-kt"><Wand2 className="gx-i gx-cb-acc" aria-hidden />Brief de la suite {typeof output?.parentTitle === "string" && output.parentTitle ? `— ${output.parentTitle}` : ""}</b>
        <small>Modifie directement le texte si besoin, puis génère : le brief est utilisé <em>mot pour mot</em>. Durée fixe : 7 secondes.</small>
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={busy || launched}
        className="gx-pp gx-cb-tall"
        aria-label="Brief de la suite"
      />
      {launched ? (
        <p className="gx-note gx-note-on"><Check className="gx-i" aria-hidden />Suite lancée — elle apparaît juste en dessous.</p>
      ) : (
        <div className="gx-kf">
          <button
            type="button"
            className="gx-btn gx-sm gx-pri"
            onClick={generate}
            disabled={busy || text.trim().length < 10}
          >
            {busy ? <Loader2 className="gx-i animate-spin" /> : <Check className="gx-i" />}
            {busy ? "Génération…" : edited ? "Valider mes corrections & générer" : "Générer tel quel"}
            {!busy ? <CreditCost credits={creditCost("fal-ai/veo3.1/extend-video", { seconds: 7 })} /> : null}
          </button>
          {edited && (
            <button type="button" className="gx-btn gx-sm" onClick={() => setText(initialBrief)} disabled={busy}>
              Rétablir le brief IA
            </button>
          )}
          <button
            type="button"
            className="gx-btn gx-sm gx-ghost"
            onClick={() => setDismissed(true)}
            disabled={busy}
          >
            <X className="gx-i" />
            Annuler
          </button>'''),
# --- bloc 66 ---
(r'''      <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-xs text-muted-foreground">
        <span className="h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        Je regarde tes chiffres…''',
 r'''      <div className="gx-tool-wait" role="status">
        <ConsoleLoading variant="inline" label="Je regarde tes chiffres…" />'''),
# --- bloc 67 ---
(r'''    <div className="space-y-2">
      {periodLabel && (
        <p className="text-xs font-medium text-muted-foreground">{periodLabel}</p>
      )}
      {hidden.length > 0 && (
        <label className="flex items-center gap-2 text-xs text-muted-foreground">''',
 r'''    <div className="gx-cb-stack">
      {periodLabel && (
        <p className="gx-hint">{periodLabel}</p>
      )}
      {hidden.length > 0 && (
        <label className="gx-cb-sw gx-hint">'''),
# --- bloc 68 ---
(r'''    <div className="hidden h-full w-[360px] shrink-0 border-l border-border/60 bg-background/60 xl:block">
      <div className="sticky top-0 space-y-3 p-4">
        <div>
          <div className="text-sm font-semibold">Aperçu en direct</div>
          <div className="text-[11px] text-muted-foreground">
            Le mockup se met à jour à chaque réponse.
          </div>
        </div>
        <MetaAdPreview
          items={metaPreviewItems(data)}
          pageName={data.pageName ?? "Votre Page"}''',
 r'''    <aside className="gx-mlp" aria-label="Aperçu en direct">
      <div className="gx-mlp-in">
        <div className="gx-sh gx-cb-shc">
          <h2>Aperçu en direct</h2>
          <small>L'aperçu se met à jour à chaque réponse.</small>
        </div>
        <MetaAdPreview
          items={metaPreviewItems(data)}
          pageName={data.pageName ?? "Ta Page"}'''),
# --- bloc 69 ---
(r'''        />
      </div>
    </div>
  );
}''',
 r'''        />
      </div>
    </aside>
  );
}'''),
# --- bloc 70 ---
(r'''      <div className="rounded-xl border border-border bg-card p-3 text-xs text-muted-foreground">''',
 r'''      <div className="gx-kard gx-cb-mut">'''),
# --- bloc 71 ---
(r'''    <div className="rounded-2xl border border-border bg-card p-4 space-y-3 xl:hidden">
      <div className="text-sm font-semibold">Aperçu de votre publicité</div>
      <MetaAdPreview
        items={metaPreviewItems(data)}
        pageName={data.pageName ?? "Votre Page"}''',
 r'''    <div className="gx-kard gx-mlp-inline">
      <div className="gx-sh"><h2>Aperçu de ta publicité</h2></div>
      <MetaAdPreview
        items={metaPreviewItems(data)}
        pageName={data.pageName ?? "Ta Page"}'''),
# --- bloc 72 ---
(r'''      />
      <p className="text-[11px] text-muted-foreground">
        Rendu approximatif des placements Meta (Fil, Story, Reels).''',
 r'''      />
      <p className="gx-hint">
        Rendu approximatif des placements Meta (Fil, Story, Reels).'''),
# --- bloc 73 ---
(r'''        <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">''',
 r'''        <div className="gx-kard gx-err gx-cb-errk" role="alert">
          <AlertTriangle className="gx-i" aria-hidden />'''),
# --- bloc 74 ---
(r'''      <div className="flex items-center gap-2 rounded-xl border bg-card p-4 text-sm text-muted-foreground">
        <div className="h-3 w-3 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        Lancement de la génération…''',
 r'''      <div className="gx-kard gx-cb-mut" role="status">
        <ConsoleLoading variant="inline" label="Lancement de la génération…" />'''),
# --- bloc 75 ---
(r'''    return (
      <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
        Échec : {userMessage ?? errorMsg ?? "impossible de lancer la génération."}''',
 r'''    return (
      <div className="gx-kard gx-err gx-cb-errk" role="alert">
        <AlertTriangle className="gx-i" aria-hidden />
        Échec : {userMessage ?? errorMsg ?? "impossible de lancer la génération."}'''),
# --- bloc 76 ---
(r'''    <div className="rounded-xl border bg-card p-4 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm font-medium truncate">{title ?? "Média en cours"}</div>
        <div className="text-xs text-muted-foreground uppercase tracking-wide">{kind ?? "media"}</div>''',
 r'''    <div className="gx-kard gx-mab">
      <div className="gx-mab-h">
        <b>{title ?? "Média en cours"}</b>
        <span className="gx-lbl">{kind ?? "media"}</span>'''),
# --- bloc 77 ---
(r'''          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2 text-sm">
              <span className="flex items-center gap-2 text-muted-foreground">
                <div className="h-3 w-3 rounded-full border-2 border-primary border-t-transparent animate-spin" />''',
 r'''          <div className="gx-pend-b gx-mab-p" role="status">
            <div className="gx-pend-r">
              <span className="gx-mab-st">
                <Loader2 className="gx-i animate-spin" aria-hidden />'''),
# --- bloc 78 ---
(r'''              <span className="text-xs font-medium tabular-nums text-muted-foreground">''',
 r'''              <span className="gx-num">'''),
# --- bloc 79 ---
(r'''            <div className="h-2 w-full overflow-hidden rounded-full bg-muted ring-1 ring-border/60">
              <div
                className="relative h-full overflow-hidden rounded-full bg-primary transition-all duration-1000 ease-out"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute inset-0 -translate-x-full animate-[slide-in-right_1.4s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-primary-foreground/40 to-transparent" />
              </div>
            </div>
            <div className="text-[11px] text-muted-foreground/80">
              Temps estimé — la vidéo apparaîtra ici automatiquement.
            </div>''',
 r'''            <span className="gx-bar gx-pend-bar" aria-hidden>
              <i style={{ width: `${progress}%` }} />
            </span>
            <p className="gx-hint">
              Temps estimé — la vidéo apparaîtra ici automatiquement.
            </p>'''),
# --- bloc 80 ---
(r'''        <div className="text-sm text-destructive">Échec : {err ?? "erreur inconnue"}</div>
      )}
      {status === "completed" && url && kind === "audio" && (
        <audio controls src={url} className="w-full" />
      )}
      {status === "completed" && url && kind === "video" && (
        <video controls src={url} className="w-full rounded-lg max-h-[500px]" />
      )}
      {status === "completed" && url && kind === "image" && (
        <img src={url} alt={title ?? "média"} className="w-full rounded-lg max-h-[500px] object-contain" />''',
 r'''        <p className="gx-err">Échec : {err ?? "erreur inconnue"}</p>
      )}
      {status === "completed" && url && kind === "audio" && (
        <audio controls src={url} className="gx-cb-full" />
      )}
      {status === "completed" && url && kind === "video" && (
        <video controls src={url} className="gx-mab-m" />
      )}
      {status === "completed" && url && kind === "image" && (
        <img src={url} alt={title ?? "média"} className="gx-mab-m gx-cb-contain" />'''),
# --- bloc 81 ---
(r'''        <a href={url} target="_blank" rel="noreferrer" className="text-sm text-primary underline">Télécharger le média</a>
      )}
      {status === "completed" && url && adId && (kind === "video" || kind === "image") && (
        <div className="-mx-4 -mb-4">''',
 r'''        <a href={url} target="_blank" rel="noreferrer" className="gx-btn gx-sm"><Download className="gx-i" />Télécharger le média</a>
      )}
      {status === "completed" && url && adId && (kind === "video" || kind === "image") && (
        <div className="gx-mab-a">'''),
# --- bloc 82 ---
(r'''  return (
    <div className="space-y-2">
      {/* @ts-expect-error web component */}''',
 r'''  return (
    <div className="gx-cb-stack">
      {/* @ts-expect-error web component */}'''),
# --- bloc 83 ---
(r'''        style={{ width: "100%", height: "400px", background: "#0a0a0a", borderRadius: "0.5rem" }}
      />
      <a href={url} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline">Télécharger le modèle .glb</a>''',
 r'''        style={{ width: "100%", height: "400px", background: "var(--gx-sunk)", borderRadius: "10px" }}
      />
      <a href={url} target="_blank" rel="noreferrer" className="gx-btn gx-sm gx-cb-self"><Download className="gx-i" />Télécharger le modèle .glb</a>'''),
# --- bloc 84 ---
(r'''      <div className="rounded-xl border border-dashed border-border/70 bg-muted/30 p-4 text-sm text-muted-foreground">
        Aucune création prête pour l'instant. <Link to="/create" search={{}} className="text-primary underline">Créer ma première pub</Link>.
      </div>''',
 r'''      <ConsoleEmpty
        compact
        icon={ImageIcon}
        title="Aucune création prête pour l'instant."
        action={<Link to="/create" search={{}} className="gx-btn gx-sm"><Plus className="gx-i" />Créer ma première pub</Link>}
      />'''),
# --- bloc 85 ---
(r'''    <div className="rounded-2xl border border-border/70 bg-background/50 p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {multi ? `Sélectionne tes créations (${selected.size}/${allItems.length})` : "Choisis une création"}
        </div>

        {!submitted && (
          <Button size="sm" onClick={confirm} disabled={selected.size === 0}>
            {multi ? "Utiliser la sélection" : "Utiliser"} <ArrowRight className="ml-1 h-3.5 w-3.5" />
          </Button>
        )}
      </div>
      {items.length > 4 && !submitted && (
        <div className="relative mb-3">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher une création…"
            className="h-8 pl-8 text-xs"
          />
        </div>
      )}
      {visible.length === 0 && batches.length === 0 && (
        <div className="py-4 text-center text-xs text-muted-foreground">Aucune création ne correspond à « {search} ».</div>
      )}
      {batches.length > 0 && (
        <div className="mb-3 space-y-2">''',
 r'''    <div className="gx-kard gx-cpk">
      <div className="gx-cpk-h">
        <span className="gx-lbl">
          {multi ? `Sélectionne tes créations (${selected.size}/${allItems.length})` : "Choisis une création"}
        </span>

        {!submitted && (
          <button type="button" className="gx-btn gx-sm gx-pri" onClick={confirm} disabled={selected.size === 0}>
            {multi ? "Utiliser la sélection" : "Utiliser"} <ArrowRight className="gx-i" />
          </button>
        )}
      </div>
      {items.length > 4 && !submitted && (
        <label className="gx-in gx-cb-search">
          <Search className="gx-i" aria-hidden />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher une création…"
            aria-label="Rechercher une création"
          />
        </label>
      )}
      {visible.length === 0 && batches.length === 0 && (
        <p className="gx-hint gx-cb-center">Aucune création ne correspond à « {search} ».</p>
      )}
      {batches.length > 0 && (
        <div className="gx-cb-stack">'''),
# --- bloc 86 ---
(r'''              <div key={b.batchId} className={`rounded-xl border p-2 ${allIn ? "border-primary ring-2 ring-primary/30" : "border-border"}`}>
                <div className="flex items-center gap-3">''',
 r'''              <div key={b.batchId} className={`gx-cpk-lot${allIn ? " gx-on" : ""}`}>
                <div className="gx-cpk-lot-r">'''),
# --- bloc 87 ---
(r'''                    className="grid h-14 w-14 shrink-0 grid-cols-2 grid-rows-2 gap-px overflow-hidden rounded-lg bg-muted"
                    aria-label={`Sélectionner le lot ${b.title}`}
                  >
                    {(b.thumbnails ?? []).slice(0, 4).map((src, i) => (
                      <img key={i} src={src} alt="" className="h-full w-full object-cover" loading="lazy" />
                    ))}
                  </button>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold">{b.title}</p>
                    <p className="text-[11px] text-muted-foreground">Lot · {b.count} pub{b.count > 1 ? "s" : ""}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2 text-[11px]"''',
 r'''                    className="gx-cpk-mos"
                    aria-label={`Sélectionner le lot ${b.title}`}
                    aria-pressed={allIn}
                  >
                    {(b.thumbnails ?? []).slice(0, 4).map((src, i) => (
                      <img key={i} src={src} alt="" loading="lazy" />
                    ))}
                  </button>
                  <div className="gx-cpk-lot-t">
                    <b>{b.title}</b>
                    <small>Lot · {b.count} pub{b.count > 1 ? "s" : ""}</small>
                  </div>
                  <button
                    type="button"
                    className="gx-btn gx-sm gx-ghost gx-cb-gh"
                    aria-expanded={open}'''),
# --- bloc 88 ---
(r'''                    {open ? "Replier" : "Déplier"}
                  </Button>
                </div>
                {open && (
                  <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-5">''',
 r'''                    {open ? <ChevronUp className="gx-i" /> : <ChevronDown className="gx-i" />}
                    {open ? "Replier" : "Déplier"}
                  </button>
                </div>
                {open && (
                  <div className="gx-cpk-g gx-cpk-g5">'''),
# --- bloc 89 ---
(r'''                          className={`relative overflow-hidden rounded-md border ${isSel ? "border-primary ring-2 ring-primary/40" : "border-border"}`}
                        >
                          <div className="aspect-square w-full bg-muted">
                            {it.thumbUrl && <img src={it.thumbUrl} alt={it.title} className="h-full w-full object-cover" loading="lazy" />}
                          </div>
                          {isSel && (
                            <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground">
                              <Check className="h-2.5 w-2.5" />''',
 r'''                          aria-pressed={isSel}
                          className={`gx-cpk-t${isSel ? " gx-on" : ""}`}
                        >
                          <span className="gx-cpk-m">
                            {it.thumbUrl && <img src={it.thumbUrl} alt={it.title} loading="lazy" />}
                          </span>
                          {isSel && (
                            <span className="gx-cpk-ck" aria-hidden>
                              <Check className="gx-i" />'''),
# --- bloc 90 ---
(r'''      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">''',
 r'''      <div className="gx-cpk-g">'''),
# --- bloc 91 ---
(r'''              className={`group relative overflow-hidden rounded-lg border text-left transition ${
                isSel ? "border-primary ring-2 ring-primary/40" : "border-border hover:border-primary/50"
              } ${submitted ? "opacity-70" : ""}`}
            >
              <div className="relative aspect-square w-full bg-muted">
                {it.thumbUrl ? (
                  it.contentType === "video" ? (
                    <video src={it.thumbUrl} className="h-full w-full object-cover" muted playsInline preload="metadata" />
                  ) : (
                    <img src={it.thumbUrl} alt={it.title} className="h-full w-full object-cover" loading="lazy" />
                  )
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                    <Icon className="h-6 w-6" />
                  </div>
                )}
                {isSel && (
                  <div className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground shadow">
                    <Check className="h-3 w-3" />
                  </div>
                )}
                <div className="absolute left-1 top-1 rounded-full bg-background/80 p-1 backdrop-blur">
                  <Icon className="h-3 w-3 text-primary" />
                </div>
              </div>
              <div className="truncate p-1.5 text-[11px] font-medium">{it.title}</div>''',
 r'''              aria-pressed={isSel}
              className={`gx-cpk-t${isSel ? " gx-on" : ""}`}
            >
              <span className="gx-cpk-m">
                {it.thumbUrl ? (
                  it.contentType === "video" ? (
                    <video src={it.thumbUrl} muted playsInline preload="metadata" />
                  ) : (
                    <img src={it.thumbUrl} alt={it.title} loading="lazy" />
                  )
                ) : (
                  <span className="gx-cpk-ph"><Icon className="gx-i" /></span>
                )}
                {isSel && (
                  <span className="gx-cpk-ck" aria-hidden>
                    <Check className="gx-i" />
                  </span>
                )}
                <span className="gx-cpk-k" aria-hidden>
                  <Icon className="gx-i" />
                </span>
              </span>
              <span className="gx-cpk-n">{it.title}</span>'''),
# --- bloc 92 ---
(r'''        <div className="mt-3 text-xs text-muted-foreground">Sélection envoyée ✅</div>''',
 r'''        <p className="gx-note gx-note-on"><Check className="gx-i" aria-hidden />Sélection envoyée</p>'''),
# --- bloc 93 ---
(r'''    return (
      <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-xs text-muted-foreground">
        <ThinkingLogo size={18} /> Je récupère tes leads…''',
 r'''    return (
      <div className="gx-tool-wait" role="status">
        <ThinkingLogo size={18} /> Je récupère tes leads…'''),
# --- bloc 94 ---
(r'''    return <div className="rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-2 text-xs text-destructive">{String(output.error ?? "Leads indisponibles.")}</div>;''',
 r'''    return <div className="gx-kard gx-err gx-cb-errk" role="alert"><AlertTriangle className="gx-i" aria-hidden />{String(output.error ?? "Leads indisponibles.")}</div>;'''),
# --- bloc 95 ---
(r'''  if (issue) return <span className="rounded bg-destructive/10 px-1.5 py-0.5 text-[10px] font-medium text-destructive" title="La réponse reçue n'a pas la forme attendue : voir les réponses du formulaire.">Champ non identifié</span>;''',
 r'''  if (issue) return <span className="gx-st gx-bad" title="La réponse reçue n'a pas la forme attendue : voir les réponses du formulaire.">Champ non identifié</span>;'''),
# --- bloc 96 ---
(r'''    <div className="rounded-xl border border-border bg-card p-3 shadow-sm">
      {consistency && !consistency.ok && (
        <div className="mb-2 rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-2 text-xs text-destructive">{consistency.message}</div>
      )}
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <div className="text-sm font-semibold">
          {total} lead{total > 1 ? "s" : ""} · {per.length} campagne{per.length > 1 ? "s" : ""}
          {total > leads.length && <span className="ml-2 text-xs font-normal text-muted-foreground">({leads.length} plus récents listés)</span>}
        </div>
        <div className="flex items-center gap-3">
          {leads.length > 0 && (
            <Button size="sm" variant="outline" className="h-7 gap-1.5 text-xs" onClick={downloadCsv}>
              <Download className="h-3.5 w-3.5" /> Télécharger (CSV)
            </Button>
          )}
          <Link to="/leads" className="text-xs font-medium text-primary hover:underline">Voir tous les leads →</Link>
        </div>
      </div>
      <div className="mb-2 flex flex-wrap gap-1.5">
        {per.map((c) => (
          <Badge key={c.campaignId} variant="neutral">{c.campaignName} · {c.count}</Badge>
        ))}
      </div>
      {formOptions.length > 1 && (
        <div className="mb-2 flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-muted-foreground">Formulaire :</span>
          {["all", ...formOptions].map((f) => (
            <button key={f} type="button" onClick={() => setFormFilter(f)}
              className={`rounded-full border px-2.5 py-0.5 transition ${formFilter === f ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:bg-muted"}`}>''',
 r'''    <div className="gx-kard gx-lres">
      {consistency && !consistency.ok && (
        <div className="gx-note gx-cb-bad" role="alert"><AlertTriangle className="gx-i" aria-hidden />{consistency.message}</div>
      )}
      <div className="gx-lres-h">
        <b>
          {total} lead{total > 1 ? "s" : ""} · {per.length} campagne{per.length > 1 ? "s" : ""}
          {total > leads.length && <small className="gx-cb-dim"> ({leads.length} plus récents listés)</small>}
        </b>
        <div className="gx-row">
          {leads.length > 0 && (
            <button type="button" className="gx-btn gx-sm" onClick={downloadCsv}>
              <Download className="gx-i" /> Télécharger (CSV)
            </button>
          )}
          <Link to="/leads" className="gx-btn gx-sm gx-ghost gx-cb-gh">Voir tous les leads <ArrowRight className="gx-i" /></Link>
        </div>
      </div>
      <div className="gx-chips">
        {per.map((c) => (
          <span key={c.campaignId} className="gx-chip">{c.campaignName} · <b className="gx-num">{c.count}</b></span>
        ))}
      </div>
      {formOptions.length > 1 && (
        <div className="gx-chips" role="group" aria-label="Filtrer par formulaire">
          <span className="gx-hint">Formulaire :</span>
          {["all", ...formOptions].map((f) => (
            <button key={f} type="button" onClick={() => setFormFilter(f)} aria-pressed={formFilter === f}
              className={`gx-chip${formFilter === f ? " gx-on" : ""}`}>'''),
# --- bloc 97 ---
(r'''        <div className="py-3 text-center text-xs text-muted-foreground">Aucun lead sur cette période.</div>
      ) : (
        <div className="relative">''',
 r'''        <ConsoleEmpty compact icon={Users} title="Aucun lead sur cette période." />
      ) : (
        <div className="gx-lres-w">'''),
# --- bloc 98 ---
(r'''              className="absolute left-0 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card/95 text-foreground shadow-md hover:bg-accent"
            >
              <ChevronLeft className="h-4 w-4" />''',
 r'''              className="gx-ib gx-sm gx-lres-nav gx-lres-l"
            >
              <ChevronLeft className="gx-i" />'''),
# --- bloc 99 ---
(r'''              className="absolute right-0 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card/95 text-foreground shadow-md hover:bg-accent"
            >
              <ChevronRight className="h-4 w-4" />''',
 r'''              className="gx-ib gx-sm gx-lres-nav gx-lres-r"
            >
              <ChevronRight className="gx-i" />'''),
# --- bloc 100 ---
(r'''            className="leads-scroll max-h-[420px] overflow-auto"
          >
            <table className="w-max min-w-full text-left text-xs">
              <thead className="sticky top-0 z-[1] bg-card text-muted-foreground">
                <tr>
                  <th className="whitespace-nowrap py-1.5 pr-3 font-medium">Date et heure</th>
                  <th className="whitespace-nowrap pr-3 font-medium">Nom</th>
                  <th className="whitespace-nowrap pr-3 font-medium">E-mail</th>
                  <th className="whitespace-nowrap pr-3 font-medium">Téléphone</th>
                  {fieldKeys.map((k) => <th key={k} className="min-w-[140px] max-w-[220px] pr-3 font-medium">{label(k)}</th>)}
                  {per.length > 1 && <th className="pr-3 font-medium">Campagne</th>}
                  <th className="whitespace-nowrap pr-3 font-medium">Formulaire</th>''',
 r'''            className="gx-tbl gx-ltbl leads-scroll"
          >
            <table>
              <thead>
                <tr>
                  <th>Date et heure</th>
                  <th>Nom</th>
                  <th>E-mail</th>
                  <th>Téléphone</th>
                  {fieldKeys.map((k) => <th key={k} className="gx-ltbl-x">{label(k)}</th>)}
                  {per.length > 1 && <th>Campagne</th>}
                  <th>Formulaire</th>'''),
# --- bloc 101 ---
(r'''                  <tr key={l.id} className="border-t border-border align-top">
                    <td className="whitespace-nowrap py-1.5 pr-3">{l.date ? new Date(l.date).toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—"}</td>
                    <td className="whitespace-nowrap pr-3"><LeadCell value={l.name} issue={l.fieldIssues?.includes("full_name")} /></td>
                    <td className="whitespace-nowrap pr-3"><LeadCell value={l.email} issue={l.fieldIssues?.includes("email")} /></td>
                    <td className="whitespace-nowrap pr-3"><LeadCell value={l.phone} issue={l.fieldIssues?.includes("phone")} /></td>
                    {fieldKeys.map((k) => <td key={k} className="min-w-[140px] max-w-[220px] break-words pr-3">{pretty(l.fields?.[k]) || "—"}</td>)}
                    {per.length > 1 && <td className="max-w-[160px] truncate whitespace-nowrap pr-3">{l.campaignName}</td>}
                    <td className="max-w-[200px] truncate whitespace-nowrap pr-3" title={l.form ?? undefined}>{l.form ?? "—"}</td>''',
 r'''                  <tr key={l.id}>
                    <td className="gx-num">{l.date ? new Date(l.date).toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—"}</td>
                    <td><LeadCell value={l.name} issue={l.fieldIssues?.includes("full_name")} /></td>
                    <td><LeadCell value={l.email} issue={l.fieldIssues?.includes("email")} /></td>
                    <td><LeadCell value={l.phone} issue={l.fieldIssues?.includes("phone")} /></td>
                    {fieldKeys.map((k) => <td key={k} className="gx-ltbl-x">{pretty(l.fields?.[k]) || "—"}</td>)}
                    {per.length > 1 && <td className="gx-ltbl-c">{l.campaignName}</td>}
                    <td className="gx-ltbl-c" title={l.form ?? undefined}>{l.form ?? "—"}</td>'''),
# --- bloc 102 ---
(r'''      <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">''',
 r'''      <div className="gx-kard gx-err gx-cb-errk" role="alert">
        <AlertTriangle className="gx-i" aria-hidden />'''),
# --- bloc 103 ---
(r'''    <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/[0.06] p-4 shadow-sm">
      <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700 dark:text-emerald-400">
        <Check className="h-4 w-4" /> Campagne dupliquée
      </div>
      <div className="mt-1 text-sm">
        <span className="font-medium">« {newName} »</span> créée avec {adSets} ad set{adSets > 1 ? "s" : ""} et {ads} annonce{ads > 1 ? "s" : ""}.
      </div>
      <div className="mt-3">
        <Link
          to="/campaigns/$id"
          params={{ id: newId } as never}
          className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white shadow hover:bg-emerald-700"
        >
          Ouvrir la nouvelle campagne <ArrowRight className="h-3 w-3" />''',
 r'''    <div className="gx-kard gx-cb-ok">
      <span className="gx-k"><Check className="gx-i" aria-hidden /> Campagne dupliquée</span>
      <p>
        <b>« {newName} »</b> créée avec {adSets} ensemble{adSets > 1 ? "s" : ""} de publicités et {ads} annonce{ads > 1 ? "s" : ""}.
      </p>
      <div className="gx-kf">
        <Link
          to="/campaigns/$id"
          params={{ id: newId } as never}
          className="gx-btn gx-sm gx-pri"
        >
          Ouvrir la nouvelle campagne <ArrowRight className="gx-i" />'''),
# --- bloc 104 ---
(r'''      <div className="rounded-xl border border-dashed border-border/70 bg-muted/30 p-3 text-xs text-muted-foreground">
        Aucun résultat pour « {String(output?.query ?? "")} ».
      </div>
    );
  }
  return (
    <div className="rounded-2xl border border-border/70 bg-background/50 p-3 shadow-sm space-y-3">
      {creations.length > 0 && (
        <div>
          <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Créations ({creations.length})</div>
          <div className="space-y-1">
            {creations.map((c) => {
              const Icon = c.contentType === "video" ? Video : c.contentType === "carousel" ? Layers : ImageIcon;
              return (
                <button
                  key={c.id}
                  onClick={() => onSubmit(`Je veux modifier « ${c.title} »\n<!--selected-creatives:${JSON.stringify([c.id])}-->`)}
                  className="flex w-full items-center gap-2 rounded-lg border border-border/60 px-3 py-2 text-left text-xs hover:border-primary/60 hover:bg-primary/[0.04]"
                >
                  <Icon className="h-3.5 w-3.5 text-primary" />
                  <span className="flex-1 truncate">{c.title}</span>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              );
            })}
          </div>
        </div>
      )}
      {campaigns.length > 0 && (
        <div>
          <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Campagnes ({campaigns.length})</div>
          <div className="space-y-1">
            {campaigns.map((c) => (
              <Link
                key={c.id}
                to="/campaigns/$id"
                params={{ id: c.id } as never}
                className="flex items-center gap-2 rounded-lg border border-border/60 px-3 py-2 text-xs hover:border-primary/60 hover:bg-primary/[0.04]"
              >
                <Megaphone className="h-3.5 w-3.5 text-primary" />
                <span className="flex-1 truncate">{c.name}</span>
                <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">{c.status}</span>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
              </Link>
            ))}
          </div>''',
 r'''      <ConsoleEmpty compact icon={Search} title={`Aucun résultat pour « ${String(output?.query ?? "")} ».`} />
    );
  }
  return (
    <div className="gx-kard gx-srs">
      {creations.length > 0 && (
        <div className="gx-srs-g">
          <span className="gx-lbl">Créations ({creations.length})</span>
          {creations.map((c) => {
            const Icon = c.contentType === "video" ? Video : c.contentType === "carousel" ? Layers : ImageIcon;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => onSubmit(`Je veux modifier « ${c.title} »\n<!--selected-creatives:${JSON.stringify([c.id])}-->`)}
                className="gx-srs-r"
              >
                <Icon className="gx-i gx-cb-acc" />
                <span className="gx-srs-t">{c.title}</span>
                <ArrowRight className="gx-i gx-cb-dim" />
              </button>
            );
          })}
        </div>
      )}
      {campaigns.length > 0 && (
        <div className="gx-srs-g">
          <span className="gx-lbl">Campagnes ({campaigns.length})</span>
          {campaigns.map((c) => (
            <Link
              key={c.id}
              to="/campaigns/$id"
              params={{ id: c.id } as never}
              className="gx-srs-r"
            >
              <Megaphone className="gx-i gx-cb-acc" />
              <span className="gx-srs-t">{c.name}</span>
              <span className="gx-st gx-off">{c.status}</span>
              <ArrowRight className="gx-i gx-cb-dim" />
            </Link>
          ))}'''),
# --- bloc 105 ---
(r'''      <div className="rounded-xl border border-dashed border-border/70 bg-muted/30 p-3 text-xs text-muted-foreground">
        Création introuvable.
      </div>''',
 r'''      <ConsoleEmpty compact icon={ImageIcon} title="Création introuvable." />'''),
# --- bloc 106 ---
(r'''    <div className="rounded-2xl border border-border/70 bg-background/50 p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
          {ad.thumbUrl ? (
            ad.contentType === "video" ? (
              <video src={ad.thumbUrl} className="h-full w-full object-cover" muted playsInline preload="metadata" />
            ) : (
              <img src={ad.thumbUrl} alt={ad.title} className="h-full w-full object-cover" />
            )
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
              <Icon className="h-6 w-6" />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Que veux-tu faire avec cette création ?</div>
          <div className="mt-0.5 truncate text-sm font-semibold">{ad.title}</div>
          <div className="mt-0.5 text-xs text-muted-foreground capitalize">
            {ad.contentType}
            {actor && <span> · Acteur : <span className="font-medium text-foreground">{actor.name}</span>{actor.style ? ` (${actor.style})` : ""}</span>}
          </div>''',
 r'''    <div className="gx-kard gx-cam">
      <div className="gx-cam-h">
        <span className="gx-cam-th">
          {ad.thumbUrl ? (
            ad.contentType === "video" ? (
              <video src={ad.thumbUrl} muted playsInline preload="metadata" />
            ) : (
              <img src={ad.thumbUrl} alt={ad.title} />
            )
          ) : (
            <Icon className="gx-i" />
          )}
        </span>
        <div className="gx-cam-tx">
          <span className="gx-lbl">Que veux-tu faire avec cette création ?</span>
          <b>{ad.title}</b>
          <small>
            {ad.contentType === "video" ? "Vidéo" : ad.contentType === "carousel" ? "Carrousel" : "Image"}
            {actor && <span> · Acteur : <b>{actor.name}</b>{actor.style ? ` (${actor.style})` : ""}</span>}
          </small>'''),
# --- bloc 107 ---
(r'''        <div className="mt-3 rounded-xl border border-primary/40 bg-primary/[0.06] p-3">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-primary">Acteur identifié</div>
          <div className="mt-1 text-sm">
            Cette création utilise <span className="font-semibold">{actor.name}</span>. Tu peux relancer une nouvelle pub avec cet acteur.
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => send(`Je veux créer une NOUVELLE pub UGC avec l'acteur "${actor.name}" (le même que sur cette création). Garde cet acteur pour la suite du chat et demande-moi le nouveau brief (produit, angle, texte parlé).`)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90"
            >
              <Wand2 className="h-3.5 w-3.5" /> Nouvelle pub avec {actor.name}''',
 r'''        <div className="gx-cam-act">
          <span className="gx-lbl gx-cb-acc">Acteur identifié</span>
          <p>
            Cette création utilise <b>{actor.name}</b>. Tu peux relancer une nouvelle pub avec cet acteur.
          </p>
          <div className="gx-row">
            <button
              type="button"
              onClick={() => send(`Je veux créer une NOUVELLE pub UGC avec l'acteur "${actor.name}" (le même que sur cette création). Garde cet acteur pour la suite du chat et demande-moi le nouveau brief (produit, angle, texte parlé).`)}
              className="gx-btn gx-sm gx-pri"
            >
              <Wand2 className="gx-i" /> Nouvelle pub avec {actor.name}'''),
# --- bloc 108 ---
(r'''              className="inline-flex items-center gap-1.5 rounded-lg border border-primary/40 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/10"
            >
              <Copy className="h-3.5 w-3.5" /> Variation même acteur''',
 r'''              className="gx-btn gx-sm"
            >
              <Copy className="gx-i" /> Variation même acteur'''),
# --- bloc 109 ---
(r'''      <div className="mt-4 grid grid-cols-2 gap-1.5 sm:grid-cols-3">''',
 r'''      <div className="gx-cam-g">'''),
# --- bloc 110 ---
(r'''            className={`flex items-center gap-2 rounded-lg border px-2.5 py-2 text-left text-xs transition ${
              a.danger
                ? "border-destructive/40 text-destructive hover:bg-destructive/10"
                : "border-border/60 hover:border-primary/60 hover:bg-primary/[0.04]"
            }`}
          >
            <a.icon className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{a.label}</span>''',
 r'''            className={`gx-btn gx-sm gx-cam-b${a.danger ? " gx-cam-danger" : ""}`}
          >
            <a.icon className="gx-i" />
            <span>{a.label}</span>'''),
# --- bloc 111 ---
(r'''    return (
      <div className="rounded-xl border border-destructive/40 bg-destructive/5 px-3 py-2 text-xs text-destructive">
        {String(output?.error ?? "L'action a échoué.")}''',
 r'''    return (
      <div className="gx-kard gx-err gx-cb-errk" role="alert">
        <AlertTriangle className="gx-i" aria-hidden />
        {String(output?.error ?? "L'action a échoué.")}'''),
# --- bloc 112 ---
(r'''    <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
      <Icon className="h-3.5 w-3.5" />''',
 r'''    <div className="gx-k gx-cb-okk">
      <Icon className="gx-i" />'''),
# --- bloc 113 ---
(r'''    return (
      <div className="rounded-xl border border-destructive/40 bg-destructive/5 px-3 py-2 text-xs text-destructive">
        {String(output?.error ?? "Téléchargement indisponible.")}''',
 r'''    return (
      <div className="gx-kard gx-err gx-cb-errk" role="alert">
        <AlertTriangle className="gx-i" aria-hidden />
        {String(output?.error ?? "Téléchargement indisponible.")}'''),
# --- bloc 114 ---
(r'''      className="inline-flex items-center gap-2 rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground shadow hover:opacity-90"
    >
      <Download className="h-3.5 w-3.5" /> Télécharger « {title} »''',
 r'''      className="gx-btn gx-sm gx-pri gx-cb-self"
    >
      <Download className="gx-i" /> Télécharger « {title} »'''),
# --- bloc 115 ---
(r'''      <DialogContent className="max-w-3xl">''',
 r'''      <DialogContent className="max-w-3xl gx-cat">'''),
# --- bloc 116 ---
(r'''        {!replaceActor && <div className="flex gap-1 rounded-lg bg-muted p-1 w-fit">
          <button
            type="button"
            onClick={() => setTab("products")}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${tab === "products" ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
          >
            <ShoppingCart className="inline h-3.5 w-3.5 mr-1.5 -mt-0.5" />''',
 r'''        {!replaceActor && <div className="gx-seg gx-cat-tabs" role="tablist" aria-label="Type de visuel">
          <button
            type="button"
            role="tab"
            aria-selected={tab === "products"}
            onClick={() => setTab("products")}
          >
            <ShoppingCart className="gx-i" />'''),
# --- bloc 117 ---
(r'''            onClick={() => setTab("actors")}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${tab === "actors" ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
          >
            <Users className="inline h-3.5 w-3.5 mr-1.5 -mt-0.5" />''',
 r'''            role="tab"
            aria-selected={tab === "actors"}
            onClick={() => setTab("actors")}
          >
            <Users className="gx-i" />'''),
# --- bloc 118 ---
(r'''            onClick={() => setTab("shopify")}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${tab === "shopify" ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
          >
            <ShoppingBag className="inline h-3.5 w-3.5 mr-1.5 -mt-0.5" />''',
 r'''            role="tab"
            aria-selected={tab === "shopify"}
            onClick={() => setTab("shopify")}
          >
            <ShoppingBag className="gx-i" />'''),
# --- bloc 119 ---
(r'''          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={actorQuery}
              onChange={(e) => setActorQuery(e.target.value)}
              placeholder="Rechercher par nom, style ou tag…"
              className="pl-9"
            />
          </div>
        )}

        <ScrollArea className="max-h-[55vh] pr-2">
          {tab === "actors" && avatars.length > 0 && (
            <div className="space-y-4">
              <div className="text-sm font-semibold">Mes acteurs</div>
              {avatarsQ.isLoading ? (
                <div className="flex items-center justify-center py-10 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" /> Chargement…
                </div>
              ) : avatars.length === 0 ? (
                <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                  Aucun avatar dans ton catalogue.{" "}
                  <Link to="/galerie" className="text-primary underline">Créer un acteur</Link>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">''',
 r'''          <label className="gx-in gx-cb-search">
            <Search className="gx-i" aria-hidden />
            <input
              value={actorQuery}
              onChange={(e) => setActorQuery(e.target.value)}
              placeholder="Rechercher par nom, style ou tag…"
              aria-label="Rechercher un acteur"
            />
          </label>
        )}

        <ScrollArea className="gx-cat-sc">
          {tab === "actors" && avatars.length > 0 && (
            <div className="gx-cat-sec">
              <div className="gx-sh"><h2>Mes acteurs</h2></div>
              {avatarsQ.isLoading ? (
                <ConsoleLoading variant="block" />
              ) : avatars.length === 0 ? (
                <ConsoleEmpty
                  compact
                  icon={UserCircle}
                  title="Aucun avatar dans ton catalogue."
                  action={<Link to="/galerie" className="gx-btn gx-sm"><Plus className="gx-i" />Créer un acteur</Link>}
                />
              ) : (
                <div className="gx-cat-g">'''),
# --- bloc 120 ---
(r'''                          className={`group relative aspect-[3/4] overflow-hidden rounded-lg border transition ${isSel ? "border-primary ring-2 ring-primary" : "border-border hover:border-primary/50"}`}
                        >
                          <img src={img.url} alt={av.name} className="h-full w-full object-cover" />
                          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-1.5 text-left">
                            <div className="text-[10px] font-semibold text-white truncate">{av.name}</div>
                            {img.label && <div className="text-[9px] text-white/70">{img.label}</div>}
                          </div>
                          {isSel && (
                            <div className="absolute top-1.5 right-1.5 h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                              <Check className="h-3 w-3" />
                            </div>''',
 r'''                          aria-pressed={isSel}
                          className={`gx-cat-t gx-r34${isSel ? " gx-on" : ""}`}
                        >
                          <img src={img.url} alt={av.name} />
                          <span className="gx-cat-cap">
                            <b>{av.name}</b>
                            {img.label && <small>{img.label}</small>}
                          </span>
                          {isSel && (
                            <span className="gx-cat-ck" aria-hidden><Check className="gx-i" /></span>'''),
# --- bloc 121 ---
(r'''            <div className="space-y-6">
              {foldersQ.isLoading ? (
                <div className="flex items-center justify-center py-10 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" /> Chargement…
                </div>
              ) : folders.length === 0 ? (
                <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                  Aucun produit dans ton catalogue.{" "}
                  <Link to="/catalogue/produits" className="text-primary underline">Ajouter un produit</Link>
                </div>
              ) : (
                folders.map((f: any) => (
                  <div key={f.id}>
                    <div className="mb-2 text-sm font-semibold">{f.name}</div>
                    {(f.images?.length ?? 0) === 0 ? (
                      <div className="text-xs text-muted-foreground italic">Aucune image dans ce dossier.</div>
                    ) : (
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">''',
 r'''            <div className="gx-cat-sec">
              {foldersQ.isLoading ? (
                <ConsoleLoading variant="block" />
              ) : folders.length === 0 ? (
                <ConsoleEmpty
                  compact
                  icon={Package}
                  title="Aucun produit dans ton catalogue."
                  action={<Link to="/catalogue/produits" className="gx-btn gx-sm"><Plus className="gx-i" />Ajouter un produit</Link>}
                />
              ) : (
                folders.map((f: any) => (
                  <div key={f.id} className="gx-cat-grp">
                    <div className="gx-sh"><h2>{f.name}</h2></div>
                    {(f.images?.length ?? 0) === 0 ? (
                      <p className="gx-hint">Aucune image dans ce dossier.</p>
                    ) : (
                      <div className="gx-cat-g">'''),
# --- bloc 122 ---
(r'''                              className={`group relative aspect-square overflow-hidden rounded-lg border transition ${isSel ? "border-primary ring-2 ring-primary" : "border-border hover:border-primary/50"}`}
                            >
                              <img src={img.url} alt={f.name} className="h-full w-full object-cover" />
                              {isSel && (
                                <div className="absolute top-1.5 right-1.5 h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                                  <Check className="h-3 w-3" />
                                </div>''',
 r'''                              aria-pressed={isSel}
                              className={`gx-cat-t${isSel ? " gx-on" : ""}`}
                            >
                              <img src={img.url} alt={f.name} />
                              {isSel && (
                                <span className="gx-cat-ck" aria-hidden><Check className="gx-i" /></span>'''),
# --- bloc 123 ---
(r'''            <div className="space-y-4">
              {avatars.length > 0 && <div className="text-sm font-semibold">Galerie d'acteurs UGC</div>}
              {actorsQ.isLoading ? (
                <div className="flex items-center justify-center py-10 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" /> Chargement…
                </div>
              ) : filteredActors.length === 0 ? (
                <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                  Aucun acteur ne correspond à cette recherche.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">''',
 r'''            <div className="gx-cat-sec">
              {avatars.length > 0 && <div className="gx-sh"><h2>Galerie d'acteurs UGC</h2></div>}
              {actorsQ.isLoading ? (
                <ConsoleLoading variant="block" />
              ) : filteredActors.length === 0 ? (
                <ConsoleEmpty compact icon={Search} title="Aucun acteur ne correspond à cette recherche." />
              ) : (
                <div className="gx-cat-g gx-cat-g4">'''),
# --- bloc 124 ---
(r'''            <div className="space-y-4">
              {shopifyQ.isLoading ? (
                <div className="flex items-center justify-center py-10 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" /> Chargement…
                </div>
              ) : !shopifyConnected ? (
                <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                  Aucune boutique Shopify connectée.{" "}
                  <Link to="/connexions" className="text-primary underline">Connecter ma boutique</Link>
                </div>
              ) : shopifyProducts.length === 0 ? (
                <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                  Aucun produit trouvé dans la boutique connectée.
                </div>
              ) : (
                shopifyProducts.map((p: any) => (
                  <div key={p.id}>
                    <div className="mb-2 flex items-baseline gap-2">
                      <span className="text-sm font-semibold">{p.title}</span>
                      {p.price && (
                        <span className="text-xs text-muted-foreground">
                          {p.price} {p.currency ?? ""}
                        </span>
                      )}
                    </div>
                    {(p.images?.length ?? 0) === 0 ? (
                      <div className="text-xs text-muted-foreground italic">Aucune image pour ce produit.</div>
                    ) : (
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">''',
 r'''            <div className="gx-cat-sec">
              {shopifyQ.isLoading ? (
                <ConsoleLoading variant="block" />
              ) : !shopifyConnected ? (
                <ConsoleEmpty
                  compact
                  icon={ShoppingBag}
                  title="Aucune boutique Shopify connectée."
                  action={<Link to="/connexions" className="gx-btn gx-sm">Connecter ma boutique</Link>}
                />
              ) : shopifyProducts.length === 0 ? (
                <ConsoleEmpty compact icon={ShoppingBag} title="Aucun produit trouvé dans la boutique connectée." />
              ) : (
                shopifyProducts.map((p: any) => (
                  <div key={p.id} className="gx-cat-grp">
                    <div className="gx-sh">
                      <h2>{p.title}</h2>
                      {p.price && (
                        <small className="gx-num">
                          {p.price} {p.currency ?? ""}
                        </small>
                      )}
                    </div>
                    {(p.images?.length ?? 0) === 0 ? (
                      <p className="gx-hint">Aucune image pour ce produit.</p>
                    ) : (
                      <div className="gx-cat-g">'''),
# --- bloc 125 ---
(r'''                              className={`group relative aspect-square overflow-hidden rounded-lg border transition ${isSel ? "border-primary ring-2 ring-primary" : "border-border hover:border-primary/50"}`}
                            >
                              <img src={url} alt={p.title} className="h-full w-full object-cover" />
                              {isSel && (
                                <div className="absolute top-1.5 right-1.5 h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                                  <Check className="h-3 w-3" />
                                </div>''',
 r'''                              aria-pressed={isSel}
                              className={`gx-cat-t${isSel ? " gx-on" : ""}`}
                            >
                              <img src={url} alt={p.title} />
                              {isSel && (
                                <span className="gx-cat-ck" aria-hidden><Check className="gx-i" /></span>'''),
# --- bloc 126 ---
(r'''        <DialogFooter className="items-center justify-between sm:justify-between">
          <div className="text-xs text-muted-foreground">
            {selectedList.length} sélectionné{selectedList.length > 1 ? "s" : ""}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" disabled={saving} onClick={() => onOpenChange(false)}>Annuler</Button>
            <Button
              disabled={selectedList.length === 0 || saving || (replaceActor && tab !== "actors")}
              onClick={() => onConfirm(selectedList.map((i) => i.url), tab, selectedList.map((i) => i.label), selectedList.map((i) => i.id ?? ""))}
            >
              {saving ? "Remplacement…" : replaceActor ? "Remplacer l’acteur" : tab === "actors" ? "Utiliser cet acteur" : "Joindre"}
            </Button>''',
 r'''        <DialogFooter className="gx-cb-dlgf gx-cat-f">
          <span className="gx-hint gx-num">
            {selectedList.length} sélectionné{selectedList.length > 1 ? "s" : ""}
          </span>
          <div className="gx-row">
            <button type="button" className="gx-btn" disabled={saving} onClick={() => onOpenChange(false)}>Annuler</button>
            <button
              type="button"
              className="gx-btn gx-pri"
              disabled={selectedList.length === 0 || saving || (replaceActor && tab !== "actors")}
              onClick={() => onConfirm(selectedList.map((i) => i.url), tab, selectedList.map((i) => i.label), selectedList.map((i) => i.id ?? ""))}
            >
              {saving ? <Loader2 className="gx-i animate-spin" /> : null}
              {saving ? "Remplacement…" : replaceActor ? "Remplacer l’acteur" : tab === "actors" ? "Utiliser cet acteur" : "Joindre"}
            </button>'''),
# --- bloc 127 ---
(r'''      className={`group relative aspect-[3/4] overflow-hidden rounded-lg border transition ${selected ? "border-primary ring-2 ring-primary" : "border-border hover:border-primary/50"}`}''',
 r'''      aria-pressed={selected}
      className={`gx-cat-t gx-r34${selected ? " gx-on" : ""}${playing ? " gx-playing" : ""}`}'''),
# --- bloc 128 ---
(r'''        className={`h-full w-full object-cover transition-opacity duration-300 ${playing ? "opacity-0" : "opacity-100"}`}''',
 r'''        className="gx-cat-still"'''),
# --- bloc 129 ---
(r'''          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${playing ? "opacity-100" : "opacity-0"}`}
        />
      )}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-2 text-left">
        <div className="text-[11px] font-semibold text-white truncate">{actor.name}</div>
        {actor.style && <div className="text-[10px] text-white/80 truncate">{actor.style}</div>}
      </div>
      {selected && (
        <div className="absolute top-1.5 right-1.5 h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
          <Check className="h-3 w-3" />
        </div>''',
 r'''          className="gx-cat-vid"
        />
      )}
      <span className="gx-cat-cap">
        <b>{actor.name}</b>
        {actor.style && <small>{actor.style}</small>}
      </span>
      {selected && (
        <span className="gx-cat-ck" aria-hidden><Check className="gx-i" /></span>'''),
# --- bloc 130 ---
(r'''    <div className="flex max-w-[14rem] items-center gap-2 rounded-lg border border-border bg-muted/60 py-1 pl-1 pr-1.5 text-xs">
      <div className="h-8 w-8 shrink-0 overflow-hidden rounded-md bg-background">
        {ref_.mediaUrl && ref_.mediaType === "image" ? (
          <img src={ref_.mediaUrl} alt="" className="h-full w-full object-cover" />
        ) : ref_.mediaUrl && ref_.mediaType === "video" ? (
          <video src={ref_.mediaUrl} className="h-full w-full object-cover" muted preload="metadata" />
        ) : null}
      </div>
      <span className="min-w-0 truncate font-medium">{ref_.pageName ?? "Annonce"}</span>''',
 r'''    <div className="gx-ac">
      <span className="gx-ac-th">
        {ref_.mediaUrl && ref_.mediaType === "image" ? (
          <img src={ref_.mediaUrl} alt="" />
        ) : ref_.mediaUrl && ref_.mediaType === "video" ? (
          <video src={ref_.mediaUrl} muted preload="metadata" />
        ) : null}
      </span>
      <span className="gx-ac-tx">
        <span className="gx-ac-k">Pub concurrente</span>
        <span className="gx-ac-n">{ref_.pageName ?? "Annonce"}</span>
      </span>'''),
# --- bloc 131 ---
(r'''          className="shrink-0 rounded-md p-0.5 text-muted-foreground hover:bg-background hover:text-foreground"
          aria-label={`Retirer la référence ${ref_.pageName ?? ""}`.trim()}
        >
          <X className="h-3.5 w-3.5" />''',
 r'''          className="gx-ac-x"
          aria-label={`Retirer la référence ${ref_.pageName ?? ""}`.trim()}
        >
          <X className="gx-i" />'''),
]


def fail(msg):
    print("ARRÊT : " + msg)
    print("Aucun fichier n'a été modifié.")
    sys.exit(1)


def main():
    check = "--check" in sys.argv
    if not os.path.isfile(TARGET):
        fail("fichier introuvable : " + TARGET)
    if not os.path.isfile(CSS):
        fail("copie d'abord src/styles/gx-chat-blocks.css")
    if not os.path.isfile(STYLES):
        fail("fichier introuvable : " + STYLES)
    with open(TARGET, encoding="utf-8") as f:
        src = f.read()
    if True:
        problems = []
        for i, (old, _new) in enumerate(BLOCKS, 1):
            n = src.count(old)
            if n != 1:
                problems.append("bloc %d trouvé %d fois (attendu : 1) — début : %r" % (i, n, old[:90]))
        if problems:
            fail("create.tsx a changé depuis la ref de base.\n  " + "\n  ".join(problems))
        out = src
        for i, (old, new) in enumerate(BLOCKS, 1):
            if out.count(old) != 1:
                fail("bloc %d introuvable après les remplacements précédents" % i)
            out = out.replace(old, new, 1)
        print("create.tsx : %d blocs remplacés." % len(BLOCKS))

    with open(STYLES, encoding="utf-8") as f:
        styles = f.read()
    if IMPORT_LINE in styles:
        new_styles = styles
        print("styles.css : import déjà présent.")
    else:
        imports = list(re.finditer(r'^@import "\./styles/[^"]+";[ \t]*$', styles, flags=re.M))
        if not imports:
            fail("aucune ligne @import \"./styles/…\" dans src/styles.css")
        last = imports[-1]
        new_styles = styles[: last.end()] + "\n" + IMPORT_LINE + styles[last.end():]
        print("styles.css : import ajouté après « %s »." % last.group(0).strip())

    if check:
        print("Vérification OK (mode --check : rien n'a été écrit).")
        return
    with open(TARGET, "w", encoding="utf-8") as f:
        f.write(out)
    with open(STYLES, "w", encoding="utf-8") as f:
        f.write(new_styles)
    print("Terminé.")


if __name__ == "__main__":
    main()
