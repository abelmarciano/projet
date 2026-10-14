#!/usr/bin/env python3
"""P2 - remplacements exacts dans les pages de la console.

A lancer depuis la racine du projet, APRES P1 et apres avoir copie les
fichiers neufs de P2 (src/components/console/*, src/styles/gx-unify.css,
src/components/ui/button.tsx).

Chaque bloc doit etre trouve exactement le nombre de fois attendu (1 par
defaut). Tout est verifie en memoire d'abord : a la moindre difference,
le script s'arrete sans rien ecrire.

Usage : python3 scripts/apply.py [--check] [racine]
"""
import os, sys

SPECS = [('src/components/insights/AiAnalysisView.tsx',
  'Chargement en squelette (fin du texte + style en ligne) ; états vides/erreur via ConsoleEmpty.',
  [('import { ThinkingLogo } from "@/components/ThinkingLogo";\n',
    'import { ConsoleEmpty, ConsoleSkeleton } from "@/components/console";\n'
    'import { AlertTriangle, Lightbulb, Plug } from "@/components/icons";\n'),
   ('        <p className="gx-hint" style={{ display: "flex", alignItems: "center", gap: 8 }}><ThinkingLogo size={18} '
    '/>Analyse de tes chiffres…</p>\n'
    '      ) : q.isError ? (\n'
    '        <div className="gx-empty">\n'
    "          <b>L'analyse n'a pas pu aboutir</b>\n"
    '          <span>Réessaie dans un instant.</span>\n'
    '          <button type="button" className="gx-btn gx-sm" onClick={() => void q.refetch()}>Réessayer</button>\n'
    '        </div>\n'
    '      ) : (q.data as any)?.connected === false ? (\n'
    '        <div className="gx-empty">\n'
    '          <b>Connecte ton compte Meta</b>\n'
    '          <span>Je regarde tes pubs et je te dis lesquelles booster, tester ou couper.</span>\n'
    '          <MetaConnectButton />\n'
    '        </div>\n'
    '      ) : !(q.data as any)?.hasData || ordered.length === 0 ? (\n'
    '        <div className="gx-empty">\n'
    '          <b>Pas encore de données à analyser</b>\n'
    "          <span>Élargis la période en haut à droite, ou publie une pub : l'analyse démarre dès les premiers "
    'affichages.</span>\n'
    '          <div className="gx-row">\n'
    '            <Link to="/create" className="gx-btn gx-sm gx-pri">Créer ma première pub</Link>\n'
    '            <Link to="/campaigns" className="gx-btn gx-sm">Voir mes campagnes</Link>\n'
    '          </div>\n'
    '        </div>\n'
    '      ) : (',
    '        <ConsoleSkeleton rows={3} />\n'
    '      ) : q.isError ? (\n'
    '        <ConsoleEmpty icon={AlertTriangle} title="L\'analyse n\'a pas pu aboutir" text="Réessaie dans un '
    'instant."\n'
    '          action={<button type="button" className="gx-btn gx-sm" onClick={() => void '
    'q.refetch()}>Réessayer</button>} />\n'
    '      ) : (q.data as any)?.connected === false ? (\n'
    '        <ConsoleEmpty icon={Plug} title="Connecte ton compte Meta"\n'
    '          text="Je regarde tes pubs et je te dis lesquelles booster, tester ou couper."\n'
    '          action={<MetaConnectButton />} />\n'
    '      ) : !(q.data as any)?.hasData || ordered.length === 0 ? (\n'
    '        <ConsoleEmpty icon={Lightbulb} title="Pas encore de données à analyser"\n'
    '          text="Élargis la période en haut à droite, ou publie une pub : l\'analyse démarre dès les premiers '
    'affichages."\n'
    '          action={<>\n'
    '            <Link to="/create" className="gx-btn gx-sm gx-pri">Créer ma première pub</Link>\n'
    '            <Link to="/campaigns" className="gx-btn gx-sm">Voir mes campagnes</Link>\n'
    '          </>} />\n'
    '      ) : (')]),
 ('src/components/batch/BatchList.tsx',
  "Suppression d'un lot : bouton rouge (ConfirmDialog danger) au lieu de violet ; « Régénérer le plan » : "
  'ConfirmDialog au lieu de window.confirm ; chargement en squelette ; état vide commun, « Nouveau lot » en violet '
  'plat.',
  [('import { CATEGORY_LABELS, MiniStepper, stepFromStatus } from "@/components/batch/batch-shared";\n',
    'import { CATEGORY_LABELS, MiniStepper, stepFromStatus } from "@/components/batch/batch-shared";\n'
    'import { ConfirmDialog, ConsoleEmpty, ConsoleSkeleton } from "@/components/console";\n'
    'import { Layers } from "@/components/icons";\n'),
   ('  const [deleting, setDeleting] = useState<string | null>(null);\n  const [busy, setBusy] = useState(false);\n',
    '  const [deleting, setDeleting] = useState<string | null>(null);\n'
    '  const [busy, setBusy] = useState(false);\n'
    '  // Lot dont le plan va être régénéré, en attente de confirmation (remplace window.confirm).\n'
    '  const [planConfirm, setPlanConfirm] = useState<{ b: any; message: string } | null>(null);\n'),
   ('  const doRegeneratePlan = async (b: any) => {\n'
    '    const previews = Number(b.items_total ?? 0);\n'
    '    const finals = Number(b.finals_total ?? 0);\n'
    '    if (previews || finals) {\n'
    '      const message = `Régénérer le plan supprimera les ${previews} aperçu${previews > 1 ? "s" : ""} et ${finals} '
    'pub${finals > 1 ? "s" : ""} de ce lot. Continuer ?`;\n'
    '      if (!window.confirm(message)) return;\n'
    '    }\n'
    '    setBusy(true);',
    '  const doRegeneratePlan = async (b: any) => {\n'
    '    const previews = Number(b.items_total ?? 0);\n'
    '    const finals = Number(b.finals_total ?? 0);\n'
    '    if (previews || finals) {\n'
    '      const message = `Régénérer le plan supprimera les ${previews} aperçu${previews > 1 ? "s" : ""} et ${finals} '
    'pub${finals > 1 ? "s" : ""} de ce lot.`;\n'
    '      setPlanConfirm({ b, message });\n'
    '      return;\n'
    '    }\n'
    '    await runRegeneratePlan(b);\n'
    '  };\n'
    '\n'
    '  const runRegeneratePlan = async (b: any) => {\n'
    '    setBusy(true);'),
   ('      <div className="gx-box">\n'
    '        <div className="gx-lots">\n'
    '          <div className="gx-lotr">\n'
    '            <div>\n'
    '              <b>Chargement des lots…</b>\n'
    '              <small>Un instant</small>\n'
    '            </div>\n'
    '          </div>\n'
    '        </div>\n'
    '      </div>',
    '      <div className="gx-box">\n        <ConsoleSkeleton rows={3} />\n      </div>'),
   ('      <div className="gx-empty">\n'
    "        <b>Aucun lot pour l'instant</b>\n"
    "        <span>Colle le lien d'une page produit ou d'un site : je prépare une série de publicités "
    'testables.</span>\n'
    '        <Link to="/batch/new" search={{ brandId: brandId ?? undefined }} className="gx-btn gx-pri gx-grad">\n'
    '          <Plus className="gx-i" />\n'
    '          Nouveau lot\n'
    '        </Link>\n'
    '      </div>',
    '      <ConsoleEmpty\n'
    '        icon={Layers}\n'
    '        title="Aucun lot pour l\'instant"\n'
    '        text="Colle le lien d\'une page produit ou d\'un site : je prépare une série de publicités testables."\n'
    '        action={\n'
    '          <Link to="/batch/new" search={{ brandId: brandId ?? undefined }} className="gx-btn gx-pri">\n'
    '            <Plus className="gx-i" />\n'
    '            Nouveau lot\n'
    '          </Link>\n'
    '        }\n'
    '      />'),
   ('      <AlertDialog open={!!deleting} onOpenChange={(o) => (!o ? setDeleting(null) : null)}>\n'
    '        <AlertDialogContent>\n'
    '          <AlertDialogHeader>\n'
    '            <AlertDialogTitle>Supprimer ce lot ?</AlertDialogTitle>\n'
    '            <AlertDialogDescription>\n'
    '              Le plan et les aperçus de ce lot seront définitivement supprimés.\n'
    '            </AlertDialogDescription>\n'
    '          </AlertDialogHeader>\n'
    '          <AlertDialogFooter>\n'
    '            <AlertDialogCancel>Annuler</AlertDialogCancel>\n'
    '            <AlertDialogAction onClick={doDelete} disabled={busy}>\n'
    '              Supprimer\n'
    '            </AlertDialogAction>\n'
    '          </AlertDialogFooter>\n'
    '        </AlertDialogContent>\n'
    '      </AlertDialog>',
    '      <ConfirmDialog\n'
    '        open={!!deleting}\n'
    '        onOpenChange={(o) => (!o ? setDeleting(null) : null)}\n'
    '        title="Supprimer ce lot ?"\n'
    '        description="Le plan et les aperçus de ce lot seront définitivement supprimés."\n'
    '        confirmLabel="Supprimer"\n'
    '        danger\n'
    '        busy={busy}\n'
    '        onConfirm={doDelete}\n'
    '      />\n'
    '\n'
    '      <ConfirmDialog\n'
    '        open={!!planConfirm}\n'
    '        onOpenChange={(o) => (!o ? setPlanConfirm(null) : null)}\n'
    '        title="Régénérer le plan ?"\n'
    '        description={planConfirm?.message}\n'
    '        confirmLabel="Régénérer le plan"\n'
    '        danger\n'
    '        onConfirm={() => {\n'
    '          const b = planConfirm?.b;\n'
    '          setPlanConfirm(null);\n'
    '          if (b) void runRegeneratePlan(b);\n'
    '        }}\n'
    '      />')]),
 ('src/components/ContinueVideoDialog.tsx',
  'Symbole ⚡ des crédits → icône Zap ; fenêtre habillée console (console-app-portal) ; boutons via le <Button> '
  'harmonisé.',
  [('import { continueVideoWithChain } from "@/lib/video-chain.functions";\n',
    'import { continueVideoWithChain } from "@/lib/video-chain.functions";\n'
    'import { Zap } from "@/components/icons";\n'),
   ('      <DialogContent className="sm:max-w-lg">',
    '      <DialogContent className="console-app-portal sm:max-w-lg">'),
   ('<div className="text-muted-foreground">⚡{CONTINUE_STANDARD_COST} par segment</div>',
    '<div className="text-muted-foreground"><Zap className="gx-ii" aria-label="crédits" />{CONTINUE_STANDARD_COST} par '
    'segment</div>'),
   ('{quality === "standard" ? `Générer la suite · ⚡${CONTINUE_STANDARD_COST}` : "Générer la suite premium"}',
    '{quality === "standard" ? <>Générer la suite · <Zap className="gx-ii" aria-label="crédits" '
    '/>{CONTINUE_STANDARD_COST}</> : "Générer la suite premium"}')]),
 ('src/components/CreateActorDialog.tsx',
  'Emoji ✨ retiré du toast « Acteur créé » ; fenêtre habillée console (console-app-portal).',
  [('      toast.success("Acteur créé ✨");', '      toast.success("Acteur créé");'),
   ('      <DialogContent className="max-w-2xl">', '      <DialogContent className="console-app-portal max-w-2xl">')]),
 ('src/components/editor/EditorProjectsGallery.tsx',
  'En-tête via PageHeader ; chargement des projets en squelette (fini les cartes « Chargement… ») ; corbeille et états '
  'vides communs ; suppressions via ConfirmDialog rouge (fin de la chaîne bg-destructive) ; « Nom A → Z » → « Nom (A à '
  'Z) ».',
  [('import { VideoPoster } from "@/components/VideoPoster";\n',
    'import { VideoPoster } from "@/components/VideoPoster";\n'
    'import { ConfirmDialog, ConsoleEmpty, ConsoleLoading, ConsoleSkeleton, PageHeader } from "@/components/console";\n'
    'import { AlertTriangle, Clapperboard } from "@/components/icons";\n'),
   ('const SORT_LABEL = { recent: "Modifié récemment", name: "Nom A → Z" } as const;',
    'const SORT_LABEL = { recent: "Modifié récemment", name: "Nom (A à Z)" } as const;'),
   ('      <header className="gx-ph">\n'
    '        <div>\n'
    '          <h1>Éditeur vidéo</h1>\n'
    '          <p>Reprends un projet existant ou démarre un nouveau montage.</p>\n'
    '        </div>\n'
    '        <div className="gx-pa">\n'
    '          <button',
    '      <PageHeader\n'
    '        title="Éditeur vidéo"\n'
    '        subtitle="Reprends un projet existant ou démarre un nouveau montage."\n'
    '        actions={<>\n'
    '          <button'),
   ('            Nouveau projet\n          </button>\n        </div>\n      </header>',
    '            Nouveau projet\n          </button>\n        </>}\n      />'),
   ('<DropdownMenuItem onSelect={() => setSort("name")}>Nom A → Z</DropdownMenuItem>',
    '<DropdownMenuItem onSelect={() => setSort("name")}>Nom (A à Z)</DropdownMenuItem>'),
   ('          <p className="gx-hint">Chargement de la corbeille…</p>\n'
    '        ) : trashRows.length === 0 ? (\n'
    '          <div className="gx-empty">\n'
    '            <b>La corbeille est vide</b>\n'
    '            <span>Les projets supprimés y restent 30 jours.</span>\n'
    '          </div>\n'
    '        ) : (',
    '          <ConsoleLoading label="Chargement de la corbeille…" />\n'
    '        ) : trashRows.length === 0 ? (\n'
    '          <ConsoleEmpty icon={Trash2} title="La corbeille est vide" text="Les projets supprimés y restent 30 '
    'jours." />\n'
    '        ) : ('),
   ('        <div className="gx-cgrid" aria-busy="true" aria-label="Chargement des projets">\n'
    '          {Array.from({ length: 8 }).map((_, i) => (\n'
    '            <div key={i} className="gx-ccard">\n'
    '              <span className="gx-pth" />\n'
    '              <div>\n'
    '                <b>Chargement…</b>\n'
    '              </div>\n'
    '            </div>\n'
    '          ))}\n'
    '        </div>\n'
    '      ) : projects.isError ? (\n'
    '        <div className="gx-empty">\n'
    '          <b>Impossible de charger tes projets</b>\n'
    '          <button type="button" className="gx-btn" onClick={() => void projects.refetch()}>\n'
    '            Réessayer\n'
    '          </button>\n'
    '        </div>\n'
    '      ) : rows.length === 0 ? (\n'
    '        <div className="gx-empty">\n'
    '          <b>{query ? "Aucun projet ne correspond à cette recherche" : "Aucun projet pour le moment"}</b>\n'
    '          {!query ? (\n'
    '            <>\n'
    '              <span>Crée ton premier montage : timeline multipiste, sous-titres IA, voix off et export.</span>\n'
    '              <button\n'
    '                type="button"\n'
    '                className="gx-btn gx-pri"\n'
    '                onClick={() => createMutation.mutate()}\n'
    '                disabled={createMutation.isPending}\n'
    '              >\n'
    '                <Plus className="gx-i" />\n'
    '                Créer un projet\n'
    '              </button>\n'
    '            </>\n'
    '          ) : null}\n'
    '        </div>\n'
    '      ) : (',
    '        <ConsoleSkeleton variant="cards" rows={8} />\n'
    '      ) : projects.isError ? (\n'
    '        <ConsoleEmpty\n'
    '          icon={AlertTriangle}\n'
    '          title="Impossible de charger tes projets"\n'
    '          action={<button type="button" className="gx-btn gx-sm" onClick={() => void '
    'projects.refetch()}>Réessayer</button>}\n'
    '        />\n'
    '      ) : rows.length === 0 ? (\n'
    '        <ConsoleEmpty\n'
    '          icon={query ? Search : Clapperboard}\n'
    '          title={query ? "Aucun projet ne correspond à cette recherche" : "Aucun projet pour le moment"}\n'
    '          text={query ? undefined : "Crée ton premier montage : timeline multipiste, sous-titres IA, voix off et '
    'export."}\n'
    '          action={query ? undefined : (\n'
    '            <button\n'
    '              type="button"\n'
    '              className="gx-btn gx-pri gx-sm"\n'
    '              onClick={() => createMutation.mutate()}\n'
    '              disabled={createMutation.isPending}\n'
    '            >\n'
    '              <Plus className="gx-i" />\n'
    '              Créer un projet\n'
    '            </button>\n'
    '          )}\n'
    '        />\n'
    '      ) : ('),
   ('      <AlertDialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>\n'
    '        <AlertDialogContent className="console-app-portal">\n'
    '          <AlertDialogHeader>\n'
    '            <AlertDialogTitle>Supprimer « {confirmDelete?.name} » ?</AlertDialogTitle>\n'
    '            <AlertDialogDescription>Il sera conservé 30 jours dans la corbeille.</AlertDialogDescription>\n'
    '          </AlertDialogHeader>\n'
    '          <AlertDialogFooter>\n'
    '            <AlertDialogCancel autoFocus>Annuler</AlertDialogCancel>\n'
    '            <AlertDialogAction\n'
    '              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"\n'
    '              onClick={() => confirmDelete && deleteMutation.mutate(confirmDelete.id)}\n'
    '            >\n'
    '              Supprimer\n'
    '            </AlertDialogAction>\n'
    '          </AlertDialogFooter>\n'
    '        </AlertDialogContent>\n'
    '      </AlertDialog>\n'
    '\n'
    '      <AlertDialog open={!!confirmPurge} onOpenChange={(o) => !o && setConfirmPurge(null)}>\n'
    '        <AlertDialogContent className="console-app-portal">\n'
    '          <AlertDialogHeader>\n'
    '            <AlertDialogTitle>Supprimer définitivement « {confirmPurge?.name} » ?</AlertDialogTitle>\n'
    '            <AlertDialogDescription>\n'
    '              Cette suppression est définitive et irréversible : le projet ne pourra plus être restauré.\n'
    '            </AlertDialogDescription>\n'
    '          </AlertDialogHeader>\n'
    '          <AlertDialogFooter>\n'
    '            <AlertDialogCancel autoFocus>Annuler</AlertDialogCancel>\n'
    '            <AlertDialogAction\n'
    '              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"\n'
    '              onClick={() => confirmPurge && purgeMutation.mutate(confirmPurge.id)}\n'
    '            >\n'
    '              Supprimer définitivement\n'
    '            </AlertDialogAction>\n'
    '          </AlertDialogFooter>\n'
    '        </AlertDialogContent>\n'
    '      </AlertDialog>',
    '      <ConfirmDialog\n'
    '        open={!!confirmDelete}\n'
    '        onOpenChange={(o) => { if (!o) setConfirmDelete(null); }}\n'
    '        title={`Supprimer « ${confirmDelete?.name ?? ""} » ?`}\n'
    '        description="Il sera conservé 30 jours dans la corbeille."\n'
    '        confirmLabel="Supprimer"\n'
    '        danger\n'
    '        onConfirm={() => { if (confirmDelete) deleteMutation.mutate(confirmDelete.id); }}\n'
    '      />\n'
    '\n'
    '      <ConfirmDialog\n'
    '        open={!!confirmPurge}\n'
    '        onOpenChange={(o) => { if (!o) setConfirmPurge(null); }}\n'
    '        title={`Supprimer définitivement « ${confirmPurge?.name ?? ""} » ?`}\n'
    '        description="Cette suppression est définitive et irréversible : le projet ne pourra plus être restauré."\n'
    '        confirmLabel="Supprimer définitivement"\n'
    '        danger\n'
    '        onConfirm={() => { if (confirmPurge) purgeMutation.mutate(confirmPurge.id); }}\n'
    '      />')]),
 ('src/components/guide-meta/GuideMeta.tsx',
  'Pastilles ✓ / ! / i, flèches ← → ↗ et coche des boutons remplacées par des icônes ; « Créer ma première pub » en '
  'violet plat (fin de gm-grad).',
  [('import { useNewAdConversation } from "@/hooks/useNewAdConversation";\n',
    'import { useNewAdConversation } from "@/hooks/useNewAdConversation";\n'
    'import { AlertTriangle, ArrowRight, Check, ChevronLeft, ExternalLink, Info } from "@/components/icons";\n'),
   ('<span className="gm-n">{d ? "✓" : k + 1}</span>',
    '<span className="gm-n">{d ? <Check className="gx-ii" aria-label="Fait" /> : k + 1}</span>'),
   ('<i aria-hidden>{s.alert[0] === "warn" ? "!" : "i"}</i>',
    '<i aria-hidden>{s.alert[0] === "warn" ? <AlertTriangle className="gx-ii" /> : <Info className="gx-ii" />}</i>'),
   ('              <i aria-hidden>!</i>\n              <p>\n                Il te manque encore{" "}',
    '              <i aria-hidden><AlertTriangle className="gx-ii" /></i>\n'
    '              <p>\n'
    '                Il te manque encore{" "}'),
   ('<span className="gm-li" aria-hidden>↗</span>',
    '<span className="gm-li" aria-hidden><ExternalLink className="gx-ii" /></span>'),
   ('disabled={i === 0} onClick={() => go(i - 1)}>← Précédent</button>',
    'disabled={i === 0} onClick={() => go(i - 1)}><ChevronLeft className="gx-i" aria-hidden />Précédent</button>'),
   ('<button type="button" className="gx-btn gx-pri gm-grad" onClick={() => void startNewChat()}>Créer ma première pub '
    '→</button>',
    '<button type="button" className="gx-btn gx-pri" onClick={() => void startNewChat()}>Créer ma première '
    'pub<ArrowRight className="gx-i" aria-hidden /></button>'),
   ("onClick={() => markDone(i)}>C'est fait ✓</button>",
    'onClick={() => markDone(i)}><Check className="gx-i" aria-hidden />C\'est fait</button>'),
   ('              {isDone ? "Étape suivante →" : "C\'est fait, étape suivante →"}',
    '              {isDone ? "Étape suivante" : "C\'est fait, étape suivante"}<ArrowRight className="gx-i" aria-hidden '
    '/>')]),
 ('src/components/guide-meta/GuideMetaCard.tsx',
  'Icône livre faite main remplacée par BookText.',
  [('import { Link } from "@tanstack/react-router";\n',
    'import { Link } from "@tanstack/react-router";\nimport { BookText } from "@/components/icons";\n'),
   ('        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" '
    'strokeLinejoin="round">\n'
    '          <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z" />\n'
    '          <path d="M4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5" />\n'
    '          <path d="M9 8h7M9 11.5h5" />\n'
    '        </svg>',
    '        <BookText aria-hidden />')]),
 ('src/components/connexion/GuideMetaPanel.tsx',
  'Icône livre faite main → BookOpen ; flèches « → » et coches « ✓ » → ArrowRight / Check.',
  [('import { Link } from "@tanstack/react-router";\n',
    'import { Link } from "@tanstack/react-router";\n'
    'import { ArrowRight, BookOpen, Check } from "@/components/icons";\n'),
   ('            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" '
    'strokeLinejoin="round">\n'
    '              <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z" />\n'
    '              <path d="M4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5" />\n'
    '            </svg>',
    '            <BookOpen aria-hidden />'),
   ('{k > 0 && <span className="gx-cx-arr" aria-hidden="true">→</span>}',
    '{k > 0 && <span className="gx-cx-arr" aria-hidden="true"><ArrowRight className="gx-ii" /></span>}'),
   ('<i aria-hidden="true">{done ? "✓" : k + 1}</i>',
    '<i aria-hidden="true">{done ? <Check className="gx-ii" /> : k + 1}</i>'),
   ('          {started ? "Reprendre le guide →" : "Créer mon compte avec le guide →"}',
    '          {started ? "Reprendre le guide" : "Créer mon compte avec le guide"}<ArrowRight className="gx-i" '
    'aria-hidden />')]),
 ('src/components/insights/PerformanceView.tsx',
  'Carte Leads coupée (style en ligne retiré, coût sous le chiffre), états vides/chargement communs, icônes faites '
  'main et symboles ✓ ↑ ↓ remplacés.',
  [('import { MetaConnectButton } from "@/components/MetaConnectDialog";\n',
    'import { MetaConnectButton } from "@/components/MetaConnectDialog";\n'
    'import { ConsoleEmpty, ConsoleLoading } from "@/components/console";\n'
    'import { AlertTriangle, ArrowDown, ArrowUp, BarChart3, Check, Clock, MoreHorizontal, Plug, Search } from '
    '"@/components/icons";\n'),
   ('        // Une seule ligne : le nombre en grand, le coût unitaire en plus petit à côté.\n'
    '        return <>{frNumber(n)}<span style={{ fontSize: "0.58em", fontWeight: 500, marginLeft: 6, color: '
    '"var(--gx-muted)" }}>· {frMoney(totals.spend / n)}</span></>;',
    '        // Le nombre en grand, le coût unitaire en petit juste dessous (ne déborde jamais de la carte).\n'
    '        return <>{frNumber(n)}<em className="gx-cpl-sub">{frMoney(totals.spend / n)} par {leadsObjective ? "lead" '
    ': "résultat"}</em></>;'),
   ('            <b className="gx-num" style={{ whiteSpace: "nowrap" }}>{state === "loading" ? "…" : hasNumbers ? '
    'k.value : "—"}</b>',
    '            <b className="gx-num">{state === "loading" ? <span className="gx-skel gx-skel-num" aria-hidden /> : '
    'hasNumbers ? k.value : "—"}</b>'),
   ('  const emptyBlock = q.trim() ? (\n'
    '    <div className="gx-empty">\n'
    '      <b>Aucune campagne ne correspond à ta recherche</b>\n'
    '      <button type="button" className="gx-btn gx-sm" onClick={() => setQ("")}>Effacer la recherche</button>\n'
    '    </div>\n'
    '  ) : activeOnly ? (\n'
    '    <div className="gx-empty">\n'
    '      <b>Aucune campagne active sur la période</b>\n'
    '      <button type="button" className="gx-btn gx-sm" onClick={() => setActiveOnly(false)}>Voir toutes les '
    'campagnes</button>\n'
    '    </div>\n'
    '  ) : (\n'
    '    <div className="gx-empty"><b>Aucune campagne sur la période</b></div>\n'
    '  );',
    '  const emptyBlock = q.trim() ? (\n'
    '    <ConsoleEmpty compact icon={Search} title="Aucune campagne ne correspond à ta recherche"\n'
    '      action={<button type="button" className="gx-btn gx-sm" onClick={() => setQ("")}>Effacer la '
    'recherche</button>} />\n'
    '  ) : activeOnly ? (\n'
    '    <ConsoleEmpty compact icon={BarChart3} title="Aucune campagne active sur la période"\n'
    '      action={<button type="button" className="gx-btn gx-sm" onClick={() => setActiveOnly(false)}>Voir toutes les '
    'campagnes</button>} />\n'
    '  ) : (\n'
    '    <ConsoleEmpty compact icon={BarChart3} title="Aucune campagne sur la période" />\n'
    '  );'),
   ('  const sortLabel = (k: SortKey) => (sort === k ? (asc ? " ↑" : " ↓") : "");',
    '  const sortLabel = (k: SortKey): ReactNode => (sort === k ? (asc ? <ArrowUp className="gx-ii gx-sort-i" '
    'aria-hidden /> : <ArrowDown className="gx-ii gx-sort-i" aria-hidden />) : null);'),
   ('                <button type="button" className={metric === "impressions" || metric === "cpc" || compare !== '
    '"none" ? "gx-ib gx-sm gx-set" : "gx-ib gx-sm"} aria-label="Autres mesures et comparaison" title="Autres mesures '
    'et comparaison">\n'
    '                  <svg className="gx-i" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="5" '
    'cy="12" r="1.8" /><circle cx="12" cy="12" r="1.8" /><circle cx="19" cy="12" r="1.8" /></svg>',
    '                <button type="button" className={metric === "impressions" || metric === "cpc" || compare !== '
    '"none" ? "gx-ib gx-sm gx-set" : "gx-ib gx-sm"} aria-label="Autres mesures et comparaison" title="Autres mesures '
    'et comparaison">\n'
    '                  <MoreHorizontal className="gx-i" aria-hidden />'),
   ('<DropdownMenuItem key={m.key} onSelect={() => setMetric(m.key)}>{m.label}{metric === m.key ? " ✓" : '
    '""}</DropdownMenuItem>',
    '<DropdownMenuItem key={m.key} onSelect={() => setMetric(m.key)}>{m.label}{metric === m.key && <Check '
    'className="gx-i gx-mcheck" aria-label="choisi" />}</DropdownMenuItem>'),
   ('<DropdownMenuItem onSelect={() => setCompare("none")}>Aucun{compare === "none" ? " ✓" : ""}</DropdownMenuItem>',
    '<DropdownMenuItem onSelect={() => setCompare("none")}>Aucun{compare === "none" && <Check className="gx-i '
    'gx-mcheck" aria-label="choisi" />}</DropdownMenuItem>'),
   ('<DropdownMenuItem key={k} onSelect={() => setCompare(k)}>{labelOf(k)}{compare === k ? " ✓" : '
    '""}</DropdownMenuItem>',
    '<DropdownMenuItem key={k} onSelect={() => setCompare(k)}>{labelOf(k)}{compare === k && <Check className="gx-i '
    'gx-mcheck" aria-label="choisi" />}</DropdownMenuItem>'),
   ('          <div className="gx-chart gx-chart-wait"><span className="gx-hint">Chargement des '
    'chiffres…</span></div>\n'
    '        ) : state === "slow" ? (\n'
    '          <div className="gx-empty">\n'
    '            <b>Meta met plus de temps que prévu à répondre</b>\n'
    '            <span>Tes chiffres arrivent dans un instant. Tu peux aussi relancer la demande.</span>\n'
    '            <button type="button" className="gx-btn gx-sm" onClick={() => void q1.refetch()}>Réessayer</button>\n'
    '          </div>\n'
    '        ) : state === "error" ? (\n'
    '          <div className="gx-empty">\n'
    '            <b>Impossible de récupérer tes performances</b>\n'
    '            <span>Vérifie que ton compte Meta est bien connecté, puis réessaie.</span>\n'
    '            <button type="button" className="gx-btn gx-sm" onClick={() => void q1.refetch()}>Réessayer</button>\n'
    '          </div>\n'
    '        ) : state === "off" ? (\n'
    '          <div className="gx-empty">\n'
    '            <b>Connecte ton compte Meta</b>\n'
    "            <span>Tes dépenses, tes clics et tes leads s'afficheront ici jour par jour.</span>\n"
    '            <MetaConnectButton />\n'
    '          </div>\n'
    '        ) : state === "empty" ? (\n'
    '          <div className="gx-empty">\n'
    '            <b>Aucune donnée sur cette période</b>\n'
    '            <span>Change la période en haut à droite, ou publie une campagne pour commencer à collecter des '
    'chiffres.</span>\n'
    '            <Link to="/campaigns" className="gx-btn gx-sm">Voir mes campagnes</Link>\n'
    '          </div>\n'
    '        ) : (',
    '          <div className="gx-chart gx-chart-wait"><ConsoleLoading variant="inline" label="Chargement des '
    'chiffres…" /></div>\n'
    '        ) : state === "slow" ? (\n'
    '          <ConsoleEmpty icon={Clock} title="Meta met plus de temps que prévu à répondre"\n'
    '            text="Tes chiffres arrivent dans un instant. Tu peux aussi relancer la demande."\n'
    '            action={<button type="button" className="gx-btn gx-sm" onClick={() => void '
    'q1.refetch()}>Réessayer</button>} />\n'
    '        ) : state === "error" ? (\n'
    '          <ConsoleEmpty icon={AlertTriangle} title="Impossible de récupérer tes performances"\n'
    '            text="Vérifie que ton compte Meta est bien connecté, puis réessaie."\n'
    '            action={<button type="button" className="gx-btn gx-sm" onClick={() => void '
    'q1.refetch()}>Réessayer</button>} />\n'
    '        ) : state === "off" ? (\n'
    '          <ConsoleEmpty icon={Plug} title="Connecte ton compte Meta"\n'
    '            text="Tes dépenses, tes clics et tes leads s\'afficheront ici jour par jour."\n'
    '            action={<MetaConnectButton />} />\n'
    '        ) : state === "empty" ? (\n'
    '          <ConsoleEmpty icon={BarChart3} title="Aucune donnée sur cette période"\n'
    '            text="Change la période en haut à droite, ou publie une campagne pour commencer à collecter des '
    'chiffres."\n'
    '            action={<Link to="/campaigns" className="gx-btn gx-sm">Voir mes campagnes</Link>} />\n'
    '        ) : ('),
   ('              <svg className="gx-i" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" '
    'strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>\n'
    '              <input type="search" placeholder="Rechercher une campagne"',
    '              <Search className="gx-i" aria-hidden />\n'
    '              <input type="search" placeholder="Rechercher une campagne"'),
   ('                <button type="button" className="gx-ib" aria-label="Plus d\'options" title="Plus d\'options">\n'
    '                  <svg className="gx-i" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="5" '
    'cy="12" r="1.8" /><circle cx="12" cy="12" r="1.8" /><circle cx="19" cy="12" r="1.8" /></svg>',
    '                <button type="button" className="gx-ib" aria-label="Plus d\'options" title="Plus d\'options">\n'
    '                  <MoreHorizontal className="gx-i" aria-hidden />'),
   ('<DropdownMenuItem key={n} onSelect={() => { setPageSize(n); setPage(1); }}>{n} lignes{pageSize === n ? " ✓" : '
    '""}</DropdownMenuItem>',
    '<DropdownMenuItem key={n} onSelect={() => { setPageSize(n); setPage(1); }}>{n} lignes{pageSize === n && <Check '
    'className="gx-i gx-mcheck" aria-label="choisi" />}</DropdownMenuItem>')]),
 ('src/components/results/SalesView.tsx',
  "En-tête via PageHeader ; chiffres en squelette pendant le chargement ; tableau en squelette ; l'erreur n'est plus "
  "confondue avec « aucune donnée » (message d'erreur + Réessayer) ; états vides communs.",
  [('import { frDecimal, frEuro, frNumber, frPercent } from "@/lib/format";\n',
    'import { frDecimal, frEuro, frNumber, frPercent } from "@/lib/format";\n'
    'import { ConsoleEmpty, ConsoleSkeleton, PageHeader } from "@/components/console";\n'
    'import { AlertTriangle, ShoppingCart } from "@/components/icons";\n'),
   ('      <header className="gx-ph">\n'
    '        <div>\n'
    '          <h1>{title}</h1>\n'
    '          {subtitle && <p>{subtitle}</p>}\n'
    '        </div>\n'
    '        <div className="gx-pa">\n'
    '          <button',
    '      <PageHeader\n        title={title}\n        subtitle={subtitle}\n        actions={<>\n          <button'),
   ('            <Download className="gx-i" />Exporter CSV\n          </button>\n        </div>\n      </header>',
    '            <Download className="gx-i" />Exporter CSV\n          </button>\n        </>}\n      />'),
   ('<div><small>Ventes</small><b className="gx-num">{salesQ.isLoading ? "…" : frNumber(totals.orders)}</b></div>',
    '<div><small>Ventes</small><b className="gx-num">{salesQ.isLoading ? <span className="gx-skel gx-skel-num" '
    'aria-hidden /> : frNumber(totals.orders)}</b></div>'),
   ('<div><small>Revenu généré</small><b className="gx-num">{salesQ.isLoading ? "…" : '
    'frEuro(totals.revenue)}</b></div>',
    '<div><small>Revenu généré</small><b className="gx-num">{salesQ.isLoading ? <span className="gx-skel gx-skel-num" '
    'aria-hidden /> : frEuro(totals.revenue)}</b></div>'),
   ('<b className="gx-num">{salesQ.isLoading ? "…" : totals.roas ? `${frDecimal(totals.roas)} €` : "—"}</b>',
    '<b className="gx-num">{salesQ.isLoading ? <span className="gx-skel gx-skel-num" aria-hidden /> : totals.roas ? '
    '`${frDecimal(totals.roas)} €` : "—"}</b>'),
   ('<b className="gx-num">{salesQ.isLoading ? "…" : totals.cvr ? frPercent(totals.cvr, 1) : "—"}</b>',
    '<b className="gx-num">{salesQ.isLoading ? <span className="gx-skel gx-skel-num" aria-hidden /> : totals.cvr ? '
    'frPercent(totals.cvr, 1) : "—"}</b>'),
   ('          <p className="gx-hint" role="status">Chargement des ventes…</p>\n'
    '        ) : salesQ.isError ? (\n'
    '          <div className="gx-empty">\n'
    '            <b>Aucune donnée de vente synchronisée</b>\n'
    '            <p>Connecte ton compte Meta Ads pour remonter automatiquement les commandes et le revenu de tes '
    'campagnes à objectif conversion.</p>\n'
    '            <Link to="/connexions" className="gx-btn gx-sm">Connecter Meta</Link>\n'
    '          </div>\n'
    '        ) : filtered.length === 0 ? (\n'
    '          <div className="gx-empty">\n'
    '            <b>{rows.length ? "Aucune campagne pour ces filtres" : "Aucune vente pour le moment"}</b>\n'
    '            <p>\n'
    '              {rows.length\n'
    '                ? "Modifie la recherche ou les filtres."\n'
    '                : "Les commandes remontent ici dès qu\'une campagne Meta à objectif « ventes / conversions » '
    'enregistre des achats (via ton pixel)." + (SHOW_SHOPIFY ? " Une intégration e-commerce (Shopify) viendra '
    'compléter ces données." : "")}\n'
    '            </p>\n'
    '            {rows.length\n'
    '              ? <button type="button" className="gx-btn gx-sm" onClick={() => { setQ(""); '
    'setCampaignFilter("all"); setStatusFilter("all"); }}>Tout afficher</button>\n'
    '              : <Link to="/campaigns" className="gx-btn gx-sm">Voir mes campagnes</Link>}\n'
    '          </div>\n'
    '        ) : (',
    '          <ConsoleSkeleton variant="table" rows={4} />\n'
    '        ) : salesQ.isError ? (\n'
    '          <ConsoleEmpty\n'
    '            icon={AlertTriangle}\n'
    '            title="Impossible de récupérer tes ventes"\n'
    '            text="La synchronisation avec Meta a échoué. Réessaie, ou vérifie que ton compte Meta Ads est bien '
    'connecté."\n'
    '            action={<>\n'
    '              <button type="button" className="gx-btn gx-sm" onClick={() => { void salesQ.refetch(); '
    '}}>Réessayer</button>\n'
    '              <Link to="/connexions" className="gx-btn gx-sm">Connecter Meta</Link>\n'
    '            </>}\n'
    '          />\n'
    '        ) : filtered.length === 0 ? (\n'
    '          <ConsoleEmpty\n'
    '            icon={ShoppingCart}\n'
    '            title={rows.length ? "Aucune campagne pour ces filtres" : "Aucune vente pour le moment"}\n'
    '            text={rows.length\n'
    '              ? "Modifie la recherche ou les filtres."\n'
    '              : "Les commandes remontent ici dès qu\'une campagne Meta à objectif « ventes / conversions » '
    'enregistre des achats (via ton pixel)." + (SHOW_SHOPIFY ? " Une intégration e-commerce (Shopify) viendra '
    'compléter ces données." : "")}\n'
    '            action={rows.length\n'
    '              ? <button type="button" className="gx-btn gx-sm" onClick={() => { setQ(""); '
    'setCampaignFilter("all"); setStatusFilter("all"); }}>Tout afficher</button>\n'
    '              : <Link to="/campaigns" className="gx-btn gx-sm">Voir mes campagnes</Link>}\n'
    '          />\n'
    '        ) : (')]),
 ('src/components/insights/TopAdsView.tsx',
  "Chargement en squelette de cartes (au lieu d'un texte) ; états vides et erreur via ConsoleEmpty.",
  [('import { frMoney, frNumber, frPercent } from "@/lib/format";\n',
    'import { frMoney, frNumber, frPercent } from "@/lib/format";\n'
    'import { ConsoleEmpty, ConsoleSkeleton } from "@/components/console";\n'
    'import { AlertTriangle, Crown, Plug } from "@/components/icons";\n'),
   ('        <p className="gx-hint">Chargement de tes meilleures pubs…</p>\n'
    '      ) : q.isError ? (\n'
    '        <div className="gx-empty">\n'
    '          <b>Impossible de récupérer tes meilleures pubs</b>\n'
    "          <span>Meta n'a pas répondu correctement pour cette période. Réessaie dans un instant.</span>\n"
    '          <button type="button" className="gx-btn gx-sm" onClick={() => void q.refetch()}>Réessayer</button>\n'
    '        </div>\n'
    '      ) : !metaConnected ? (\n'
    '        <div className="gx-empty">\n'
    '          <b>Connecte ton compte Meta pour voir tes meilleures pubs</b>\n'
    '          <span>Ton classement se remplit automatiquement dès que Meta est connecté et que tes pubs accumulent '
    'des affichages.</span>\n'
    '          <MetaConnectButton />\n'
    '        </div>\n'
    '      ) : ads.length === 0 ? (\n'
    '        <div className="gx-empty">\n'
    '          <b>Pas encore assez de données pour désigner tes meilleures pubs</b>\n'
    "          <span>Élargis la période en haut à droite, ou publie une pub : dès qu'elle accumule des affichages, "
    'elle apparaît ici classée.</span>\n'
    '          <div className="gx-row">\n'
    '            <Link to="/create" className="gx-btn gx-sm gx-pri">Créer une pub</Link>\n'
    '            <Link to="/creations" className="gx-btn gx-sm">Voir mes créations</Link>\n'
    '          </div>\n'
    '        </div>\n'
    '      ) : (',
    '        <ConsoleSkeleton variant="cards" rows={6} />\n'
    '      ) : q.isError ? (\n'
    '        <ConsoleEmpty icon={AlertTriangle} title="Impossible de récupérer tes meilleures pubs"\n'
    '          text="Meta n\'a pas répondu correctement pour cette période. Réessaie dans un instant."\n'
    '          action={<button type="button" className="gx-btn gx-sm" onClick={() => void '
    'q.refetch()}>Réessayer</button>} />\n'
    '      ) : !metaConnected ? (\n'
    '        <ConsoleEmpty icon={Plug} title="Connecte ton compte Meta pour voir tes meilleures pubs"\n'
    '          text="Ton classement se remplit automatiquement dès que Meta est connecté et que tes pubs accumulent '
    'des affichages."\n'
    '          action={<MetaConnectButton />} />\n'
    '      ) : ads.length === 0 ? (\n'
    '        <ConsoleEmpty icon={Crown} title="Pas encore assez de données pour désigner tes meilleures pubs"\n'
    '          text="Élargis la période en haut à droite, ou publie une pub : dès qu\'elle accumule des affichages, '
    'elle apparaît ici classée."\n'
    '          action={<>\n'
    '            <Link to="/create" className="gx-btn gx-sm gx-pri">Créer une pub</Link>\n'
    '            <Link to="/creations" className="gx-btn gx-sm">Voir mes créations</Link>\n'
    '          </>} />\n'
    '      ) : (')]),
 ('src/routes/_authenticated/aide.tsx',
  "En-tête via PageHeader (« Visite guidée » n'est plus un bouton primaire) ; fenêtre « Écrire au support » en champs "
  'et boutons gx (fini Label/Input/Textarea/Button shadcn) ; FAQ mise à jour (navigation actuelle : Connexion Meta, '
  'cloche de la barre du haut, Galerie → Créer un acteur) et sans anglicismes (workspace, copy, switcher, prompt, '
  'sidebar) ; « ✓ » retiré du toast ; × → icône ; état vide commun.',
  [('import { sendSupportMessage } from "@/lib/support.functions";\n',
    'import { sendSupportMessage } from "@/lib/support.functions";\n'
    'import { ConsoleEmpty, PageHeader } from "@/components/console";\n'
    'import { X } from "@/components/icons";\n'),
   ("Si tu veux modifier le prompt ou l'image source avant, choisis plutôt « Modifier dans le chat ».",
    "Si tu veux modifier la consigne ou l'image source avant, choisis plutôt « Modifier dans le chat »."),
   ('a: "Oui. Depuis Campagnes → Nouvelle campagne, suis l\'assistant de connexion Meta. Une fois connecté, tu peux '
    'publier n\'importe quelle création en un clic depuis « Créations »." },',
    'a: "Oui. Ouvre « Connexion Meta » dans la barre latérale et clique sur « Continuer avec Facebook ». Une fois '
    'connecté, tu peux publier n\'importe quelle création en un clic depuis « Créations »." },'),
   ('Si le souci persiste, déconnecte puis reconnecte le compte depuis Paramètres → Intégrations." },',
    'Si le souci persiste, déconnecte puis reconnecte le compte depuis la page « Connexion Meta »." },'),
   ('a: "Oui, si plusieurs comptes publicitaires sont connectés au workspace, le flux de publication',
    'a: "Oui, si plusieurs comptes publicitaires sont connectés à ton espace de travail, le flux de publication'),
   ('a: "Paramètres → Intégrations → Meta, bouton « Déconnecter ».',
    'a: "Page « Connexion Meta », bouton « Déconnecter ».'),
   ('Depuis « Leads », clique sur « Exporter » en haut de la liste',
    'Depuis « Leads », clique sur « Exporter CSV » en haut de la liste'),
   ('En cas de doute, le bouton « Synchroniser maintenant » dans Leads force une actualisation immédiate.',
    'En cas de doute, le bouton « Synchroniser » dans Leads force une actualisation immédiate.'),
   ('Tu reçois alors une alerte (cloche dans la sidebar, et email si activé)',
    'Tu reçois alors une alerte (cloche dans la barre du haut, et email si activé)'),
   ('a: "La cloche en haut de la sidebar te prévient', 'a: "La cloche dans la barre du haut te prévient'),
   ('Retrouve ensuite tes favoris avec la puce « ★ Mes favoris »." },',
    'Retrouve ensuite tes favoris avec la puce « Mes favoris »." },'),
   ('importer un acteur personnalisé depuis Galerie → Ajouter.',
    'créer un acteur personnalisé depuis Galerie → Créer un acteur.'),
   ('Le chat utilise automatiquement la marque active pour personnaliser prompts et copy. Tu peux switcher en un clic '
    'dans la barre latérale." },',
    'Le chat utilise automatiquement la marque active pour personnaliser les consignes et les textes de tes pubs. Tu '
    'peux en changer en un clic dans la barre latérale." },'),
   ('a: "Le Propriétaire gère le workspace et la facturation.',
    'a: "Le Propriétaire gère l\'espace de travail et la facturation.'),
   ('Toutes tes données sont chiffrées, isolées par workspace, et hébergées en Europe.',
    'Toutes tes données sont chiffrées, isolées par espace de travail, et hébergées en Europe.'),
   ('a: "Seuls les membres de ton workspace, selon leur rôle. Les créations et les leads ne sont jamais visibles par '
    'un autre workspace, même sur la même marque de nom." },',
    'a: "Seuls les membres de ton espace de travail, selon leur rôle. Les créations et les leads ne sont jamais '
    'visibles par un autre espace de travail, même avec un nom de marque identique." },'),
   ('      toast.success("Message envoyé ✓");', '      toast.success("Message envoyé");'),
   ('      <div className="gx-ph">\n'
    "        <div><h1>Centre d'aide</h1><p>Réponse du support sous 24 h : support@growthity.ai</p></div>\n"
    '        <div className="gx-pa">\n'
    '          <button type="button" className="gx-btn gx-pri" onClick={startProductTour}><Compass className="gx-i" '
    'aria-hidden />Visite guidée (1 min)</button>\n'
    '          <button type="button" className="gx-btn" onClick={() => setSupportOpen(true)}><Mail className="gx-i" '
    'aria-hidden />Écrire au support</button>\n'
    '        </div>\n'
    '      </div>',
    '      <PageHeader\n'
    '        title="Centre d\'aide"\n'
    '        subtitle="Réponse du support sous 24 h : support@growthity.ai"\n'
    '        actions={<>\n'
    '          <button type="button" className="gx-btn" onClick={startProductTour}><Compass className="gx-i" '
    'aria-hidden />Visite guidée (1 min)</button>\n'
    '          <button type="button" className="gx-btn" onClick={() => setSupportOpen(true)}><Mail className="gx-i" '
    'aria-hidden />Écrire au support</button>\n'
    '        </>}\n'
    '      />'),
   ('        <DialogContent>\n'
    '          <DialogHeader>\n'
    '            <DialogTitle>Écrire au support</DialogTitle>\n'
    "            <DialogDescription>Réponse sous 24 h à l'adresse de ton compte.</DialogDescription>\n"
    '          </DialogHeader>\n'
    '          <div className="grid gap-3">\n'
    '            <div className="grid gap-1.5">\n'
    '              <Label htmlFor="support-subject">Sujet</Label>\n'
    '              <Input id="support-subject" value={subject} onChange={(e) => setSubject(e.target.value)} '
    'maxLength={200} placeholder="Ex. Export CSV incomplet" />\n'
    '            </div>\n'
    '            <div className="grid gap-1.5">\n'
    '              <Label htmlFor="support-message">Message</Label>\n'
    '              <Textarea id="support-message" value={message} onChange={(e) => setMessage(e.target.value)} '
    'maxLength={4000} rows={6} placeholder="Décris ton souci ou ta question…" />\n'
    '            </div>\n'
    '          </div>\n'
    '          <DialogFooter>\n'
    '            <Button type="button" variant="outline" onClick={() => setSupportOpen(false)} '
    'disabled={sending}>Annuler</Button>\n'
    '            <Button type="button" onClick={submitSupport} disabled={sending}>{sending ? "Envoi…" : '
    '"Envoyer"}</Button>\n'
    '          </DialogFooter>\n'
    '        </DialogContent>',
    '        <DialogContent className="console-app-portal">\n'
    '          <DialogHeader>\n'
    '            <DialogTitle>Écrire au support</DialogTitle>\n'
    "            <DialogDescription>Réponse sous 24 h à l'adresse de ton compte.</DialogDescription>\n"
    '          </DialogHeader>\n'
    '          <div className="grid gap-3">\n'
    '            <div className="grid gap-1.5">\n'
    '              <label className="gx-lbl" htmlFor="support-subject">Sujet</label>\n'
    '              <input id="support-subject" className="gx-in" value={subject} onChange={(e) => '
    'setSubject(e.target.value)} maxLength={200} placeholder="Ex. Export CSV incomplet" />\n'
    '            </div>\n'
    '            <div className="grid gap-1.5">\n'
    '              <label className="gx-lbl" htmlFor="support-message">Message</label>\n'
    '              <textarea id="support-message" className="gx-in" value={message} onChange={(e) => '
    'setMessage(e.target.value)} maxLength={4000} rows={6} placeholder="Décris ton souci ou ta question…" />\n'
    '            </div>\n'
    '          </div>\n'
    '          <DialogFooter className="gap-2">\n'
    '            <button type="button" className="gx-btn" onClick={() => setSupportOpen(false)} '
    'disabled={sending}>Annuler</button>\n'
    '            <button type="button" className="gx-btn gx-pri" onClick={submitSupport} disabled={sending}>{sending ? '
    '"Envoi…" : "Envoyer"}</button>\n'
    '          </DialogFooter>\n'
    '        </DialogContent>'),
   ('            <button type="button" aria-label="Retirer le filtre de catégorie" onClick={() => '
    'setCat(null)}>×</button>',
    '            <button type="button" aria-label="Retirer le filtre de catégorie" onClick={() => setCat(null)}><X '
    'className="gx-ii" aria-hidden /></button>'),
   ('        <div className="gx-empty">\n'
    '          <b>Pas de réponse trouvée</b>\n'
    '          <p>Écris-nous, on répond sous 24 h.</p>\n'
    '          <a className="gx-btn gx-sm" href="mailto:support@growthity.ai">support@growthity.ai</a>\n'
    '        </div>',
    '        <ConsoleEmpty\n'
    '          icon={Search}\n'
    '          title="Pas de réponse trouvée"\n'
    '          text="Écris-nous, on répond sous 24 h."\n'
    '          action={<a className="gx-btn gx-sm" href="mailto:support@growthity.ai">support@growthity.ai</a>}\n'
    '        />')]),
 ('src/routes/auth.tsx',
  'Enveloppe faite main → icône Mail ; pastilles ✓ / ! et flèche ← → Check / AlertCircle / ArrowLeft (logo Google '
  'conservé).',
  [('import { AuthShell, GoogleG, PasswordInput, passwordStrength, STRENGTH_HINT } from '
    '"@/components/auth/AuthShell";\n',
    'import { AuthShell, GoogleG, PasswordInput, passwordStrength, STRENGTH_HINT } from '
    '"@/components/auth/AuthShell";\n'
    'import { AlertCircle, ArrowLeft, Check, Mail } from "@/components/icons";\n'),
   ('            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" '
    'strokeLinejoin="round">\n'
    '              <rect x="3" y="5" width="18" height="14" rx="2.5" /><path d="m4 7 8 6 8-6" />\n'
    '            </svg>',
    '            <Mail />'),
   ('          ← Retour à la connexion', '          <ArrowLeft className="gxa-ic" aria-hidden />Retour à la connexion'),
   ('          <i aria-hidden="true">✓</i>', '          <i aria-hidden="true"><Check className="gxa-ic" /></i>'),
   ('<i aria-hidden="true">!</i>', '<i aria-hidden="true"><AlertCircle className="gxa-ic" /></i>', 2)]),
 ('src/routes/_authenticated/batch/$id.tsx',
  'PageHeader : le titre est le nom du lot (plus « Batch Studio »), retour « Mes lots » en haut à gauche, « Nouveau '
  'lot » en violet plat ; chargement commun (fini le titre « Chargement du lot… ») ; lot introuvable / analyse échouée '
  'via ConsoleEmpty ; deux window.confirm remplacés par ConfirmDialog.',
  [('import { LoadingSteps, stepFromStatus } from "@/components/batch/batch-shared";\n',
    'import { LoadingSteps, stepFromStatus } from "@/components/batch/batch-shared";\n'
    'import { ConfirmDialog, ConsoleEmpty, ConsoleLoading, PageHeader } from "@/components/console";\n'
    'import { AlertTriangle } from "@/components/icons";\n'),
   ('  const [reanalyzing, setReanalyzing] = useState(false);\n',
    '  const [reanalyzing, setReanalyzing] = useState(false);\n'
    '  // Confirmation en attente (remplace window.confirm) : texte + action à lancer.\n'
    '  const [ask, setAsk] = useState<{ title: string; description: string; label: string; run: () => void } | '
    'null>(null);\n'),
   ('  const runReanalyze = async () => {\n'
    '    if (!window.confirm("Ré-analyser la source ? Le plan et les visuels de ce lot seront supprimés.")) return;\n'
    '    setReanalyzing(true);',
    '  const runReanalyze = async () => {\n'
    '    setAsk({\n'
    '      title: "Ré-analyser la source ?",\n'
    '      description: "Le plan et les visuels de ce lot seront supprimés.",\n'
    '      label: "Ré-analyser",\n'
    '      run: () => void doReanalyze(),\n'
    '    });\n'
    '  };\n'
    '\n'
    '  const doReanalyze = async () => {\n'
    '    setReanalyzing(true);'),
   ('      const message = `Régénérer le plan supprimera les ${previewCount} aperçu${previewCount > 1 ? "s" : ""} et '
    '${finalCount} pub${finalCount > 1 ? "s" : ""} de ce lot. Continuer ?`;\n'
    '      if (!window.confirm(message)) return;\n'
    '    }\n'
    '    setPlanning(true);',
    '      const message = `Régénérer le plan supprimera les ${previewCount} aperçu${previewCount > 1 ? "s" : ""} et '
    '${finalCount} pub${finalCount > 1 ? "s" : ""} de ce lot.`;\n'
    '      setAsk({ title: "Régénérer le plan ?", description: message, label: "Régénérer le plan", run: () => void '
    'doPlan() });\n'
    '      return;\n'
    '    }\n'
    '    await doPlan();\n'
    '  };\n'
    '\n'
    '  const doPlan = async () => {\n'
    '    setPlanning(true);'),
   ('  const pageHeader = (\n'
    '    <header className="gx-ph">\n'
    '      <div>\n'
    '        <h1>Batch Studio</h1>\n'
    "        <p>Colle un lien, je te prépare jusqu'à 40 pubs testables.</p>\n"
    '      </div>\n'
    '      <div className="gx-pa">\n'
    '        <Link to="/batch" className="gx-btn">\n'
    '          <ArrowLeft className="gx-i" />\n'
    '          Mes lots\n'
    '        </Link>\n'
    '        <Link to="/batch/new" search={{ brandId: batch?.brand_id ?? undefined }} className="gx-btn gx-pri '
    'gx-grad">\n'
    '          <Plus className="gx-i" />\n'
    '          Nouveau lot\n'
    '        </Link>\n'
    '      </div>\n'
    '    </header>\n'
    '  );',
    '  const pageHeader = (\n'
    '    <PageHeader\n'
    '      back={{ to: "/batch", label: "Mes lots" }}\n'
    '      eyebrow="Batch Studio"\n'
    '      title={batch ? heading : "Lot"}\n'
    '      subtitle={batch ? (headingStats || undefined) : "Colle un lien, je te prépare jusqu\'à 40 pubs '
    'testables."}\n'
    '      actions={\n'
    '        <Link to="/batch/new" search={{ brandId: batch?.brand_id ?? undefined }} className="gx-btn gx-pri">\n'
    '          <Plus className="gx-i" />\n'
    '          Nouveau lot\n'
    '        </Link>\n'
    '      }\n'
    '    />\n'
    '  );'),
   ('        <div className="gx-sh"><h2>Chargement du lot…</h2></div>\n'
    '        <div className="gx-box gx-lot">\n'
    '          <Stepper current={0} reached={-1} onSelect={() => {}} />\n'
    '          <div className="gx-lot-s"><p className="gx-hint">Un instant, je récupère ton lot.</p></div>\n'
    '        </div>',
    '        <div className="gx-box gx-lot">\n'
    '          <Stepper current={0} reached={-1} onSelect={() => {}} />\n'
    '          <div className="gx-lot-s"><ConsoleLoading label="Chargement du lot…" /></div>\n'
    '        </div>'),
   ('        <div className="gx-empty">\n'
    '          <b>Ce lot est introuvable.</b>\n'
    '          <span>Il a peut-être été supprimé ou appartient à un autre espace.</span>\n'
    '          <Link to="/batch" className="gx-btn">Retour à mes lots</Link>\n'
    '        </div>',
    '        <ConsoleEmpty\n'
    '          icon={AlertTriangle}\n'
    '          title="Ce lot est introuvable"\n'
    '          text="Il a peut-être été supprimé ou appartient à un autre espace."\n'
    '          action={<Link to="/batch" className="gx-btn gx-sm">Retour à mes lots</Link>}\n'
    '        />'),
   ('      {pageHeader}\n'
    '\n'
    '      <div className="gx-sh">\n'
    '        <h2>{heading}</h2>\n'
    '        {headingStats ? <small>{headingStats}</small> : null}\n'
    '      </div>\n',
    '      {pageHeader}\n'),
   ('            <div className="gx-empty">\n'
    "              <b>L'analyse de ce lot n'a pas abouti</b>\n"
    '              <p>{frError(batch.error || "L\'analyse a échoué.")} Relance l\'analyse de la source ou démarre un '
    'nouveau lot.</p>\n'
    '              <div className="flex flex-wrap justify-center gap-2">\n'
    '                <button type="button" className="gx-btn gx-sm gx-pri" onClick={() => void runReanalyze()} '
    "disabled={reanalyzing}>Relancer l'analyse</button>\n"
    '                <Link to="/batch/new" search={{ brandId: batch?.brand_id ?? undefined }} className="gx-btn '
    'gx-sm">Nouveau lot</Link>\n'
    '              </div>\n'
    '            </div>',
    '            <ConsoleEmpty\n'
    '              icon={AlertTriangle}\n'
    '              title="L\'analyse de ce lot n\'a pas abouti"\n'
    '              text={<>{frError(batch.error || "L\'analyse a échoué.")} Relance l\'analyse de la source ou démarre '
    'un nouveau lot.</>}\n'
    '              action={<>\n'
    '                <button type="button" className="gx-btn gx-sm gx-pri" onClick={() => void runReanalyze()} '
    "disabled={reanalyzing}>Relancer l'analyse</button>\n"
    '                <Link to="/batch/new" search={{ brandId: batch?.brand_id ?? undefined }} className="gx-btn '
    'gx-sm">Nouveau lot</Link>\n'
    '              </>}\n'
    '            />'),
   ('              Enregistrer et recomposer\n'
    '            </button>\n'
    '          </DialogFooter>\n'
    '        </DialogContent>\n'
    '      </Dialog>\n'
    '    </div>\n'
    '  );\n'
    '}',
    '              Enregistrer et recomposer\n'
    '            </button>\n'
    '          </DialogFooter>\n'
    '        </DialogContent>\n'
    '      </Dialog>\n'
    '\n'
    '      <ConfirmDialog\n'
    '        open={!!ask}\n'
    '        onOpenChange={(o) => { if (!o) setAsk(null); }}\n'
    '        title={ask?.title ?? ""}\n'
    '        description={ask?.description}\n'
    '        confirmLabel={ask?.label ?? "Confirmer"}\n'
    '        danger\n'
    '        onConfirm={() => {\n'
    '          const run = ask?.run;\n'
    '          setAsk(null);\n'
    '          run?.();\n'
    '        }}\n'
    '      />\n'
    '    </div>\n'
    '  );\n'
    '}')]),
 ('src/routes/_authenticated/batch/index.tsx',
  'En-tête via PageHeader ; « Nouveau lot » en violet plat (même style que « Commencer un lot ») ; chargement en '
  'squelette ; état vide commun.',
  [('import { useCurrentBrand } from "@/hooks/useBrands";\n',
    'import { useCurrentBrand } from "@/hooks/useBrands";\n'
    'import { ConsoleEmpty, ConsoleSkeleton, PageHeader } from "@/components/console";\n'
    'import { Layers } from "@/components/icons";\n'),
   ('      <header className="gx-ph">\n'
    '        <div>\n'
    '          <h1>Batch Studio</h1>\n'
    "          <p>Colle un lien, je te prépare jusqu'à 40 pubs testables.</p>\n"
    '        </div>\n'
    '        <div className="gx-pa">\n'
    '          <Link to="/batch/new" search={{ brandId: undefined }} className="gx-btn gx-pri gx-grad">\n'
    '            <Plus className="gx-i" />\n'
    '            Nouveau lot\n'
    '          </Link>\n'
    '        </div>\n'
    '      </header>',
    '      <PageHeader\n'
    '        title="Batch Studio"\n'
    '        subtitle="Colle un lien, je te prépare jusqu\'à 40 pubs testables."\n'
    '        actions={\n'
    '          <Link to="/batch/new" search={{ brandId: undefined }} className="gx-btn gx-pri">\n'
    '            <Plus className="gx-i" />\n'
    '            Nouveau lot\n'
    '          </Link>\n'
    '        }\n'
    '      />'),
   ('        <p className="gx-hint">Chargement des lots…</p>\n'
    '      ) : empty ? (\n'
    '        <div className="gx-empty">\n'
    "          <b>Aucun lot pour l'instant</b>\n"
    "          <span>Colle le lien d'une page produit ou d'un site : je prépare une série de publicités "
    'testables.</span>\n'
    '          <Link to="/batch/new" search={{ brandId: undefined }} className="gx-btn gx-pri gx-grad">\n'
    '            <Plus className="gx-i" />\n'
    '            Nouveau lot\n'
    '          </Link>\n'
    '        </div>\n'
    '      ) : (',
    '        <ConsoleSkeleton variant="cards" rows={4} />\n'
    '      ) : empty ? (\n'
    '        <ConsoleEmpty\n'
    '          icon={Layers}\n'
    '          title="Aucun lot pour l\'instant"\n'
    '          text="Colle le lien d\'une page produit ou d\'un site : je prépare une série de publicités testables."\n'
    '          action={\n'
    '            <Link to="/batch/new" search={{ brandId: undefined }} className="gx-btn gx-pri">\n'
    '              <Plus className="gx-i" />\n'
    '              Nouveau lot\n'
    '            </Link>\n'
    '          }\n'
    '        />\n'
    '      ) : (')]),
 ('src/routes/_authenticated/batch/new.tsx',
  'Retour « Mes lots » déplacé en haut à gauche via PageHeader (il était à droite, comme une action).',
  [('import { LoadingSteps } from "@/components/batch/batch-shared";\n',
    'import { LoadingSteps } from "@/components/batch/batch-shared";\n'
    'import { PageHeader } from "@/components/console";\n'),
   ('      <header className="gx-ph">\n'
    '        <div>\n'
    '          <h1>Nouveau lot</h1>\n'
    '          <p>Colle un lien : je lis la page et je prépare tes pubs.</p>\n'
    '        </div>\n'
    '        <div className="gx-pa">\n'
    '          <Link to="/batch" className="gx-btn">\n'
    '            <ArrowLeft className="gx-i" />\n'
    '            Mes lots\n'
    '          </Link>\n'
    '        </div>\n'
    '      </header>',
    '      <PageHeader\n'
    '        back={{ to: "/batch", label: "Mes lots" }}\n'
    '        title="Nouveau lot"\n'
    '        subtitle="Colle un lien : je lis la page et je prépare tes pubs."\n'
    '      />')]),
 ('src/routes/_authenticated/campaigns/index.tsx',
  'En-tête via PageHeader, « Nouvelle campagne » en violet plat (fin du dégradé) ; squelette KPI aux jetons (fin du '
  'Tailwind animate-pulse bg-muted) ; lignes de chargement et vérification Meta via ConsoleLoading ; états vides et '
  'erreurs via ConsoleEmpty ; confirmations via le ConfirmDialog commun ; « Supprimer les brouillons vides » en rouge.',
  [('import { CampaignDetailDrawer } from "@/components/campaigns/CampaignDetailDrawer";\n',
    'import { CampaignDetailDrawer } from "@/components/campaigns/CampaignDetailDrawer";\n'
    'import { ConfirmDialog as GxConfirmDialog, ConsoleEmpty, ConsoleLoading, PageHeader } from '
    '"@/components/console";\n'
    'import { AlertTriangle, Megaphone, Plug } from "@/components/icons";\n'),
   ('      <div className="gx-ph">\n'
    '        <div><h1>Mes publicités</h1><p>Pilote tes brouillons et tes pubs en ligne sur Meta, sans '
    'jargon.</p></div>\n'
    '        <div className="gx-pa">\n'
    '          <button type="button" className={cn("gx-btn", refreshing && "gx-spin-i")} onClick={refreshPage} '
    'disabled={refreshing}\n'
    '            title={refreshing ? "Actualisation en cours…" : "Actualiser les données depuis Meta (campagnes, '
    'ensembles, publicités et statistiques)"}>\n'
    '            <RefreshCw className="gx-i" />Actualiser\n'
    '          </button>\n'
    '          <Link to="/campaigns/new" className="gx-btn gx-pri gx-grad"><Plus className="gx-i" />Nouvelle '
    'campagne</Link>\n'
    '        </div>\n'
    '      </div>',
    '      <PageHeader\n'
    '        title="Mes publicités"\n'
    '        subtitle="Pilote tes brouillons et tes pubs en ligne sur Meta, sans jargon."\n'
    '        actions={<>\n'
    '          <button type="button" className={cn("gx-btn", refreshing && "gx-spin-i")} onClick={refreshPage} '
    'disabled={refreshing}\n'
    '            title={refreshing ? "Actualisation en cours…" : "Actualiser les données depuis Meta (campagnes, '
    'ensembles, publicités et statistiques)"}>\n'
    '            <RefreshCw className="gx-i" />Actualiser\n'
    '          </button>\n'
    '          <Link to="/campaigns/new" className="gx-btn gx-pri"><Plus className="gx-i" />Nouvelle campagne</Link>\n'
    '        </>}\n'
    '      />'),
   ('<b className="gx-num"><span className="inline-block h-5 w-10 animate-pulse rounded bg-muted align-middle" '
    'aria-label="Chargement" /></b>',
    '<b className="gx-num"><span className="gx-skel gx-skel-num" aria-label="Chargement" /></b>'),
   ('  const kpiValue = (loading: boolean, v: ReactNode) => (!connected ? DASH : loading ? "…" : v);',
    '  const kpiValue = (loading: boolean, v: ReactNode) => (!connected ? DASH : loading ? <span className="gx-skel '
    'gx-skel-num" aria-label="Chargement" /> : v);'),
   ('<AlertDialogAction disabled={deletingEmpty} onClick={(e) => { e.preventDefault(); void deleteEmptyDrafts(); }}>',
    '<AlertDialogAction className="gx-danger" disabled={deletingEmpty} onClick={(e) => { e.preventDefault(); void '
    'deleteEmptyDrafts(); }}>'),
   ('          ? <div className="gx-empty"><span>Vérification de ta connexion Meta…</span></div>',
    '          ? <ConsoleLoading label="Vérification de ta connexion Meta…" />'),
   ('function LoadingRow({ cols, text }: { cols: number; text: string }) {\n'
    '  return <tr><td colSpan={cols} className="gx-hint">{text}</td></tr>;\n'
    '}\n'
    '\n'
    'function EmptyCampaigns() {\n'
    '  return (\n'
    '    <div className="gx-empty">\n'
    '      <b>Aucune campagne ici</b>\n'
    "      <p>Lance ta première campagne en 5 étapes, je t'accompagne.</p>\n"
    '      <Link to="/campaigns/new" className="gx-btn gx-sm gx-pri"><Plus className="gx-i" />Nouvelle '
    'campagne</Link>\n'
    '    </div>\n'
    '  );\n'
    '}\n'
    '\n'
    'function EmptyFiltered({ onReset }: { onReset: () => void }) {\n'
    '  return (\n'
    '    <div className="gx-empty">\n'
    '      <b>Aucun résultat</b>\n'
    '      <p>Rien ne correspond à ta recherche ou à ces filtres.</p>\n'
    '      <button type="button" className="gx-btn gx-sm" onClick={onReset}>Effacer les filtres</button>\n'
    '    </div>\n'
    '  );\n'
    '}\n'
    '\n'
    'function EmptyText({ title, text, onRefresh }: { title: string; text: string; onRefresh?: () => void }) {\n'
    '  return (\n'
    '    <div className="gx-empty">\n'
    '      <b>{title}</b>\n'
    '      <p>{text}</p>\n'
    '      {onRefresh && <button type="button" className="gx-btn gx-sm" onClick={onRefresh}><RefreshCw '
    'className="gx-i" />Actualiser</button>}\n'
    '    </div>\n'
    '  );\n'
    '}',
    'function LoadingRow({ cols, text }: { cols: number; text: string }) {\n'
    '  return <tr><td colSpan={cols}><ConsoleLoading variant="inline" label={text} /></td></tr>;\n'
    '}\n'
    '\n'
    'function EmptyCampaigns() {\n'
    '  return (\n'
    '    <ConsoleEmpty icon={Megaphone} title="Aucune campagne ici"\n'
    '      text="Lance ta première campagne en 5 étapes, je t\'accompagne."\n'
    '      action={<Link to="/campaigns/new" className="gx-btn gx-sm gx-pri"><Plus className="gx-i" />Nouvelle '
    'campagne</Link>} />\n'
    '  );\n'
    '}\n'
    '\n'
    'function EmptyFiltered({ onReset }: { onReset: () => void }) {\n'
    '  return (\n'
    '    <ConsoleEmpty icon={Search} title="Aucun résultat"\n'
    '      text="Rien ne correspond à ta recherche ou à ces filtres."\n'
    '      action={<button type="button" className="gx-btn gx-sm" onClick={onReset}>Effacer les filtres</button>} />\n'
    '  );\n'
    '}\n'
    '\n'
    'function EmptyText({ title, text, onRefresh }: { title: string; text: string; onRefresh?: () => void }) {\n'
    '  return (\n'
    '    <ConsoleEmpty icon={Megaphone} title={title} text={text}\n'
    '      action={onRefresh ? <button type="button" className="gx-btn gx-sm" onClick={onRefresh}><RefreshCw '
    'className="gx-i" />Actualiser</button> : undefined} />\n'
    '  );\n'
    '}'),
   ('    <div className="gx-empty">\n'
    '      <b>{expired ? "Connexion Meta expirée" : "Impossible de récupérer tes données Meta"}</b>\n'
    '      <p>\n'
    '        {expired\n'
    '          ? "Ton accès Meta n\'est plus valide. Reconnecte ton compte pour retrouver tes campagnes réelles."\n'
    '          : "La synchronisation avec ton compte publicitaire Meta a échoué. Aucune donnée n\'est affichée pour '
    'éviter d\'afficher des informations inexactes."}\n'
    '      </p>\n'
    '      {!expired && raw && <p className="gx-hint">{raw}</p>}\n'
    '      {expired ? <MetaConnectButton /> : (\n'
    '        <button type="button" className="gx-btn gx-sm" onClick={onRetry}><RefreshCw className="gx-i" '
    '/>Réessayer</button>\n'
    '      )}\n'
    '    </div>',
    '    <ConsoleEmpty\n'
    '      icon={AlertTriangle}\n'
    '      title={expired ? "Connexion Meta expirée" : "Impossible de récupérer tes données Meta"}\n'
    '      text={<>\n'
    '        {expired\n'
    '          ? "Ton accès Meta n\'est plus valide. Reconnecte ton compte pour retrouver tes campagnes réelles."\n'
    '          : "La synchronisation avec ton compte publicitaire Meta a échoué. Aucune donnée n\'est affichée pour '
    'éviter d\'afficher des informations inexactes."}\n'
    '        {!expired && raw && <span className="gx-hint gx-empty-raw">{raw}</span>}\n'
    '      </>}\n'
    '      action={expired ? <MetaConnectButton /> : (\n'
    '        <button type="button" className="gx-btn gx-sm" onClick={onRetry}><RefreshCw className="gx-i" '
    '/>Réessayer</button>\n'
    '      )}\n'
    '    />'),
   ('    <div className="gx-empty">\n'
    '      <b>{expired ? "Connexion Meta expirée" : "Connecte ton compte Meta"}</b>\n'
    '      <p>{expired\n'
    '        ? "Ton jeton d\'accès a expiré, reconnecte ton compte Meta pour récupérer tes campagnes."\n'
    '        : "Connecte ton compte Meta pour voir tes campagnes en ligne."}</p>\n'
    '      <MetaConnectButton />\n'
    '    </div>',
    '    <ConsoleEmpty\n'
    '      icon={Plug}\n'
    '      title={expired ? "Connexion Meta expirée" : "Connecte ton compte Meta"}\n'
    '      text={expired\n'
    '        ? "Ton jeton d\'accès a expiré, reconnecte ton compte Meta pour récupérer tes campagnes."\n'
    '        : "Connecte ton compte Meta pour voir tes campagnes en ligne."}\n'
    '      action={<MetaConnectButton />}\n'
    '    />'),
   ('function ConfirmDialog({ state, onOpenChange }: { state: ConfirmState; onOpenChange: (open: boolean) => void }) '
    '{\n'
    '  return (\n'
    '    <DialogPrimitive.Root open={!!state} onOpenChange={onOpenChange}>\n'
    '      <DialogPrimitive.Portal>\n'
    '        <DialogPrimitive.Overlay className="gx-sheet console-app-portal">\n'
    '          <DialogPrimitive.Content className="gx-sheet-b gx-narrow">\n'
    '            <div className="gx-sheet-h">\n'
    '              <div><DialogPrimitive.Title asChild><b>{state?.title ?? '
    '"Confirmer"}</b></DialogPrimitive.Title></div>\n'
    '              <DialogPrimitive.Close className="gx-ib gx-sm" aria-label="Fermer"><X className="gx-i" '
    '/></DialogPrimitive.Close>\n'
    '            </div>\n'
    '            <div '
    'className="gx-ls-b"><DialogPrimitive.Description>{state?.description}</DialogPrimitive.Description></div>\n'
    '            <div className="gx-sheet-f">\n'
    '              <div className="gx-sp" />\n'
    '              <DialogPrimitive.Close className="gx-btn">Annuler</DialogPrimitive.Close>\n'
    '              <button type="button" className={cn("gx-btn", state?.destructive ? "gx-danger" : "gx-pri")} '
    'onClick={() => state?.onConfirm()}>\n'
    '                {state?.confirmLabel ?? "Confirmer"}\n'
    '              </button>\n'
    '            </div>\n'
    '          </DialogPrimitive.Content>\n'
    '        </DialogPrimitive.Overlay>\n'
    '      </DialogPrimitive.Portal>\n'
    '    </DialogPrimitive.Root>\n'
    '  );\n'
    '}',
    'function ConfirmDialog({ state, onOpenChange }: { state: ConfirmState; onOpenChange: (open: boolean) => void }) '
    '{\n'
    '  // Confirmation commune de la console (même fenêtre que partout ailleurs).\n'
    '  return (\n'
    '    <GxConfirmDialog\n'
    '      open={!!state}\n'
    '      onOpenChange={onOpenChange}\n'
    '      title={state?.title ?? "Confirmer"}\n'
    '      description={state?.description}\n'
    '      confirmLabel={state?.confirmLabel ?? "Confirmer"}\n'
    '      danger={!!state?.destructive}\n'
    '      onConfirm={() => state?.onConfirm()}\n'
    '    />\n'
    '  );\n'
    '}')]),
 ('src/routes/_authenticated/campaigns/new.tsx',
  'Retour intégré à PageHeader ; pastilles inclusion/exclusion en jetons (lisibles en sombre) ; tutoiement (« Tes '
  "publicités », « ton-site.com », « Ta Page ») ; squelette et état vide communs ; boutons d'action en une colonne sur "
  'mobile.',
  [('import { PageHeader } from "@/components/PageHeader";\n',
    'import { ConsoleEmpty, PageHeader } from "@/components/console";\n'
    'import { ArrowRight } from "@/components/icons";\n'),
   ('        <Button asChild variant="ghost" size="sm" className="mb-4">\n'
    '          <Link to="/campaigns"><ArrowLeft className="gx-i mr-2 h-4 w-4" />Retour</Link>\n'
    '        </Button>\n'
    '\n'
    '        <PageHeader\n',
    '        <PageHeader\n          back={{ to: "/campaigns", label: "Mes campagnes" }}\n'),
   ('            <div className="gx-wcr grid grid-cols-2 gap-3 md:grid-cols-3">\n'
    '              {[1, 2, 3].map((i) => <div key={i} className="aspect-square animate-pulse rounded-xl bg-muted" '
    '/>)}\n'
    '            </div>\n'
    '          ) : filtered.length === 0 ? (\n'
    '            <div className="gx-empty p-8">\n'
    '              {creations.length === 0 ? (\n'
    '                <>Aucune création disponible. <Link to="/create" className="gx-link">Importer une création '
    '→</Link></>\n'
    '              ) : (\n'
    '                <>Aucun résultat pour ces filtres.</>\n'
    '              )}\n'
    '            </div>',
    '            <div className="gx-wcr grid grid-cols-2 gap-3 md:grid-cols-3" aria-busy="true">\n'
    '              {[1, 2, 3].map((i) => <div key={i} className="gx-skel aspect-square rounded-xl" />)}\n'
    '            </div>\n'
    '          ) : filtered.length === 0 ? (\n'
    '            creations.length === 0 ? (\n'
    '              <ConsoleEmpty compact icon={Inbox} title="Aucune création disponible"\n'
    '                action={<Link to="/create" className="gx-btn gx-sm">Importer une création<ArrowRight '
    'className="gx-i" aria-hidden /></Link>} />\n'
    '            ) : (\n'
    '              <ConsoleEmpty compact icon={Search} title="Aucun résultat pour ces filtres" />\n'
    '            )'),
   ('        <h2>Vos publicités</h2>', '        <h2>Tes publicités</h2>'),
   (': "L\'IA a généré titre, description et bouton pour chaque création. Modifiez si besoin."}',
    ': "L\'IA a généré titre, description et bouton pour chaque création. Modifie si besoin."}'),
   ('placeholder="https://votre-site.com/produit"', 'placeholder="https://ton-site.com/produit"'),
   ('                <div className="grid grid-cols-2 gap-2">\n'
    '                  <div>\n'
    '                    <Label className="gx-lbl">Bouton d\'action</Label>',
    '                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">\n'
    '                  <div>\n'
    '                    <Label className="gx-lbl">Bouton d\'action</Label>'),
   ('pageName={props.previewPageName || "Votre Page"}', 'pageName={props.previewPageName || "Ta Page"}'),
   ('  const toneCls = tone === "include"\n'
    '    ? "border-emerald-200 bg-emerald-50 text-emerald-800"\n'
    '    : "border-rose-200 bg-rose-50 text-rose-800";\n'
    '  const dotCls = tone === "include" ? "bg-emerald-500" : "bg-rose-500";',
    '  // Jetons --gx-ok / --gx-bad : lisibles en clair comme en sombre.\n'
    '  const toneCls = tone === "include" ? "gx-inc" : "gx-exc";\n'
    '  const dotCls = tone === "include" ? "gx-dot-ok" : "gx-dot-bad";')]),
 ('src/routes/_authenticated/connexions.tsx',
  "En-tête via PageHeader (fin du conteneur d'actions vide) ; icônes faites main Ico / IC_* remplacées (logos Meta et "
  'Facebook conservés) ; flèches ↓ ↗ en icônes ; « ✓ » retiré du toast ; déconnexions Meta et Shopify via '
  'ConfirmDialog rouge (fin de la chaîne bg-destructive).',
  [('import { GxSheetContent, GxSheetClose } from "@/components/ui/gx-controls";\n',
    'import { GxSheetContent, GxSheetClose } from "@/components/ui/gx-controls";\n'
    'import { ConfirmDialog, ConsoleLoading, PageHeader } from "@/components/console";\n'
    'import { AlertCircle, ArrowDown, BarChart3, Bell, Check, ExternalLink, Lock, Minus, MoreHorizontal, RefreshCw, '
    'Send, Users, type IconComponent } from "@/components/icons";\n'),
   ('function Ico({ d, className = "gx-i" }: { d: string; className?: string }) {\n'
    '  return (\n'
    '    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" '
    'strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">\n'
    '      <path d={d} />\n'
    '    </svg>\n'
    '  );\n'
    '}\n'
    'const IC_RELOAD = "M21 12a9 9 0 1 1-3-6.7L21 8M21 3v5h-5";\n'
    'const IC_BELL = "M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.9 1.9 0 0 0 3.4 0";\n'
    'const IC_MORE = "M5 12h.01M12 12h.01M19 12h.01";\n'
    'const IC_SEND = "M22 2 11 13M22 2l-7 20-4-9-9-4z";\n'
    'const IC_CHART = "M3 3v18h18M7 15l4-4 3 3 5-6";\n'
    'const IC_USERS = "M9 4.5a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 '
    '7M18 14.5a6.5 6.5 0 0 1 3.5 5.5";\n'
    'const IC_CHECK = "m5 12 5 5 9-10";\n'
    'const IC_LOCK = "M6 11h12a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2zM8 11V7a4 4 0 0 1 8 '
    '0v4";\n'
    'const IC_DASH = "M5 12h14";\n'
    'const IC_ALERT = "M12 8v5M12 16.5h.01";',
    '/** Icône de la page (mêmes icônes que le reste de la console). */\n'
    'function Ico({ d: Icon, className = "gx-i" }: { d: IconComponent; className?: string }) {\n'
    '  return <Icon className={className} aria-hidden />;\n'
    '}\n'
    'const IC_RELOAD = RefreshCw;\n'
    'const IC_BELL = Bell;\n'
    'const IC_MORE = MoreHorizontal;\n'
    'const IC_SEND = Send;\n'
    'const IC_CHART = BarChart3;\n'
    'const IC_USERS = Users;\n'
    'const IC_CHECK = Check;\n'
    'const IC_LOCK = Lock;\n'
    'const IC_DASH = Minus;\n'
    'const IC_ALERT = AlertCircle;'),
   ('      toast.success("Compte Meta connecté ✓");', '      toast.success("Compte Meta connecté");'),
   ('      <header className="gx-ph">\n'
    '        <div>\n'
    '          <h1>Connexion Meta</h1>\n'
    '          <p>Relie ton compte Meta : Growthity pourra publier tes pubs et suivre leurs résultats.</p>\n'
    '        </div>\n'
    '        <div className="gx-pa" />\n'
    '      </header>',
    '      <PageHeader\n'
    '        title="Connexion Meta"\n'
    '        subtitle="Relie ton compte Meta : Growthity pourra publier tes pubs et suivre leurs résultats."\n'
    '      />'),
   ('            {creds.isLoading ? (\n'
    '              <p className="gx-hint">Vérification de ta connexion Meta…</p>\n'
    '            ) : !connected || expired ? (',
    '            {creds.isLoading ? (\n'
    '              <ConsoleLoading variant="inline" label="Vérification de ta connexion Meta…" />\n'
    '            ) : !connected || expired ? ('),
   ('<a href="#sans-compte">Commence par le guide ↓</a>',
    '<a href="#sans-compte">Commence par le guide <ArrowDown className="gx-ii" aria-hidden /></a>'),
   ('<a href={billingUrl} target="_blank" rel="noopener noreferrer">l\'ajouter chez Meta ↗</a>',
    '<a href={billingUrl} target="_blank" rel="noopener noreferrer">l\'ajouter chez Meta <ExternalLink '
    'className="gx-ii" aria-hidden /></a>'),
   ('      <AlertDialog open={confirmMeta} onOpenChange={setConfirmMeta}>\n'
    '        <AlertDialogContent>\n'
    '          <AlertDialogHeader>\n'
    '            <AlertDialogTitle>Déconnecter ton compte Meta ?</AlertDialogTitle>\n'
    '            <AlertDialogDescription>\n'
    "              Growthity n'aura plus accès à tes comptes publicitaires, Pages et Pixels tant que tu ne te "
    'reconnectes pas.\n'
    '            </AlertDialogDescription>\n'
    '          </AlertDialogHeader>\n'
    '          <AlertDialogFooter>\n'
    '            <AlertDialogCancel>Annuler</AlertDialogCancel>\n'
    '            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" '
    'onClick={() => void disconnectMeta()}>\n'
    '              Déconnecter\n'
    '            </AlertDialogAction>\n'
    '          </AlertDialogFooter>\n'
    '        </AlertDialogContent>\n'
    '      </AlertDialog>\n'
    '\n'
    '      {SHOW_SHOPIFY && (<AlertDialog open={confirmShop} onOpenChange={setConfirmShop}>\n'
    '        <AlertDialogContent>\n'
    '          <AlertDialogHeader>\n'
    '            <AlertDialogTitle>Déconnecter ta boutique Shopify ?</AlertDialogTitle>\n'
    '            <AlertDialogDescription>\n'
    '              Tes produits Shopify ne seront plus proposés dans le chat tant que tu ne reconnectes pas la '
    'boutique.\n'
    '            </AlertDialogDescription>\n'
    '          </AlertDialogHeader>\n'
    '          <AlertDialogFooter>\n'
    '            <AlertDialogCancel>Annuler</AlertDialogCancel>\n'
    '            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" '
    'onClick={() => void disconnectShop()}>\n'
    '              Déconnecter\n'
    '            </AlertDialogAction>\n'
    '          </AlertDialogFooter>\n'
    '        </AlertDialogContent>\n'
    '      </AlertDialog>)}',
    '      <ConfirmDialog\n'
    '        open={confirmMeta}\n'
    '        onOpenChange={setConfirmMeta}\n'
    '        title="Déconnecter ton compte Meta ?"\n'
    '        description="Growthity n\'aura plus accès à tes comptes publicitaires, Pages et Pixels tant que tu ne te '
    'reconnectes pas."\n'
    '        confirmLabel="Déconnecter"\n'
    '        danger\n'
    '        onConfirm={() => disconnectMeta()}\n'
    '      />\n'
    '\n'
    '      {SHOW_SHOPIFY && (\n'
    '        <ConfirmDialog\n'
    '          open={confirmShop}\n'
    '          onOpenChange={setConfirmShop}\n'
    '          title="Déconnecter ta boutique Shopify ?"\n'
    '          description="Tes produits Shopify ne seront plus proposés dans le chat tant que tu ne reconnectes pas '
    'la boutique."\n'
    '          confirmLabel="Déconnecter"\n'
    '          danger\n'
    '          onConfirm={() => disconnectShop()}\n'
    '        />\n'
    '      )}')]),
 ('src/routes/_authenticated/creations.tsx',
  'En-tête via PageHeader (plus de style en ligne sur « Importer ») ; icônes faites main (Svg/Ic*) remplacées ; coches '
  '✓ des menus → Check ; « ← Tous les lots » → bouton retour commun ; chargement en squelette ; états vides/erreur '
  'communs ; 4 window.confirm (lot, création, dossier, sélection) → ConfirmDialog rouge.',
  [('import { OpenConversationButton } from "@/components/OpenConversationButton";\n',
    'import { OpenConversationButton } from "@/components/OpenConversationButton";\n'
    'import { ConfirmDialog, ConsoleEmpty, ConsoleSkeleton, PageHeader } from "@/components/console";\n'
    'import { AlertTriangle, Check, ChevronDown, ChevronLeft, Images, MoreHorizontal, Search, Upload, X } from '
    '"@/components/icons";\n'),
   ('function Svg({ d, children }: { d?: string; children?: ReactNode }) {\n'
    '  return (\n'
    '    <svg className="gx-i" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" '
    'strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">\n'
    '      {d ? <path d={d} /> : children}\n'
    '    </svg>\n'
    '  );\n'
    '}\n'
    'const IcUpload = () => <Svg d="M12 21V9m0 0-4 4m4-4 4 4M4 3h16" />;\n'
    'const IcPlus = () => <Svg d="M12 5v14M5 12h14" />;\n'
    'const IcSearch = () => <Svg><circle cx="11" cy="11" r="7" /><path d="m21 21-4.6-4.6" /></Svg>;\n'
    'const IcChevron = () => <Svg d="m6 9 6 6 6-6" />;\n'
    'const IcFolder = () => <Svg d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />;\n'
    'const IcX = () => <Svg d="M6 6l12 12M18 6 6 18" />;\n'
    'const IcMore = () => <Svg><circle cx="5" cy="12" r="1.2" /><circle cx="12" cy="12" r="1.2" /><circle cx="19" '
    'cy="12" r="1.2" /></Svg>;',
    'const IcUpload = () => <Upload className="gx-i" aria-hidden />;\n'
    'const IcPlus = () => <Plus className="gx-i" aria-hidden />;\n'
    'const IcSearch = () => <Search className="gx-i" aria-hidden />;\n'
    'const IcChevron = () => <ChevronDown className="gx-i" aria-hidden />;\n'
    'const IcFolder = () => <Folder className="gx-i" aria-hidden />;\n'
    'const IcX = () => <X className="gx-i" aria-hidden />;\n'
    'const IcMore = () => <MoreHorizontal className="gx-i" aria-hidden />;\n'
    '/** Coche du choix courant dans un menu. */\n'
    'const IcCheck = () => <Check className="gx-i gx-mcheck" aria-hidden />;'),
   ('  const [errorDialogAd, setErrorDialogAd] = useState<any | null>(null);\n',
    '  const [errorDialogAd, setErrorDialogAd] = useState<any | null>(null);\n'
    '  // Confirmation en attente (remplace window.confirm) : texte + action à relancer une fois confirmée.\n'
    '  const [ask, setAsk] = useState<{ title: string; description?: string; label: string; run: () => void } | '
    'null>(null);\n'),
   ('  const handleDeleteBatch = async (batchId: string, title: string) => {\n'
    '    if (!window.confirm(`Supprimer le lot « ${title} » et toutes ses pubs ?`)) return;',
    '  const handleDeleteBatch = async (batchId: string, title: string, confirmed?: boolean) => {\n'
    '    if (confirmed !== true) {\n'
    '      setAsk({ title: `Supprimer le lot « ${title} » ?`, description: "Toutes ses pubs seront supprimées.", '
    'label: "Supprimer le lot", run: () => void handleDeleteBatch(batchId, title, true) });\n'
    '      return;\n'
    '    }'),
   ('  const onDelete = async (id: string) => {\n    if (!confirm("Supprimer cette création ?")) return;',
    '  const onDelete = async (id: string, confirmed?: boolean) => {\n'
    '    if (confirmed !== true) {\n'
    '      setAsk({ title: "Supprimer cette création ?", label: "Supprimer", run: () => void onDelete(id, true) });\n'
    '      return;\n'
    '    }'),
   ('  const handleDeleteFolder = async (id: string, name: string) => {\n'
    "    if (!confirm(`Supprimer le dossier « ${name} » ? Les créations qu'il contient ne seront pas supprimées.`)) "
    'return;',
    '  const handleDeleteFolder = async (id: string, name: string, confirmed?: boolean) => {\n'
    '    if (confirmed !== true) {\n'
    '      setAsk({ title: `Supprimer le dossier « ${name} » ?`, description: "Les créations qu\'il contient ne seront '
    'pas supprimées.", label: "Supprimer le dossier", run: () => void handleDeleteFolder(id, name, true) });\n'
    '      return;\n'
    '    }'),
   ('  const handleBulkDelete = async () => {\n'
    '    if (selectedIds.size === 0) return;\n'
    '    if (!confirm(`Supprimer ${selectedIds.size} création(s) ?`)) return;',
    '  const handleBulkDelete = async (confirmed?: unknown) => {\n'
    '    if (selectedIds.size === 0) return;\n'
    '    if (confirmed !== true) {\n'
    '      setAsk({ title: `Supprimer ${selectedIds.size} création(s) ?`, label: "Supprimer", run: () => void '
    'handleBulkDelete(true) });\n'
    '      return;\n'
    '    }'),
   ('      <div className="gx-ph">\n'
    '        <div>\n'
    '          <h1>Mes créations</h1>\n'
    '          <p>Retrouve, organise et publie tes publicités.</p>\n'
    '        </div>\n'
    '        <div className="gx-pa">\n'
    '          <label className="gx-btn" aria-busy={importing || undefined} style={importing ? { opacity: 0.6, '
    'pointerEvents: "none" } : undefined}>',
    '      <PageHeader\n'
    '        title="Mes créations"\n'
    '        subtitle="Retrouve, organise et publie tes publicités."\n'
    '        actions={<>\n'
    '          <label className="gx-btn" aria-busy={importing || undefined}>'),
   ('          <Link to="/create" className="gx-btn gx-pri"><IcPlus />Nouvelle publicité</Link>\n'
    '        </div>\n'
    '      </div>\n',
    '          <Link to="/create" className="gx-btn gx-pri"><IcPlus />Nouvelle publicité</Link>\n'
    '        </>}\n'
    '      />\n'),
   ('{SOURCE_LABEL[k]}{sourceFilter === k && <span className="ml-auto" aria-hidden>✓</span>}',
    '{SOURCE_LABEL[k]}{sourceFilter === k && <IcCheck />}'),
   ('Regroupés par lot{!showBatchAds && <span className="ml-auto" aria-hidden>✓</span>}',
    'Regroupés par lot{!showBatchAds && <IcCheck />}'),
   ('Une carte par pub{showBatchAds && <span className="ml-auto" aria-hidden>✓</span>}',
    'Une carte par pub{showBatchAds && <IcCheck />}'),
   ('{SORT_LABEL[k]}{sortMode === k && <span className="ml-auto" aria-hidden>✓</span>}',
    '{SORT_LABEL[k]}{sortMode === k && <IcCheck />}'),
   ('            <div className="gx-cgrid" aria-busy="true" aria-label="Chargement des créations">\n'
    '              {[0, 1, 2, 3].map((i) => (\n'
    '                <div key={i} className="gx-ccard gx-cskel">\n'
    '                  <span className="gx-cm" />\n'
    '                  <div><b>Chargement…</b></div>\n'
    '                </div>\n'
    '              ))}\n'
    '            </div>\n'
    '          ) : ads.isError ? (\n'
    '            <div className="gx-empty">\n'
    '              <b>Impossible de charger tes créations</b>\n'
    '              <p>Elles sont toujours là, la connexion a échoué. Réessaie dans un instant.</p>\n'
    '              <button type="button" className="gx-btn gx-sm gx-pri" onClick={() => void '
    'ads.refetch()}>Réessayer</button>\n'
    '            </div>\n'
    '          ) : adRows.length === 0 ? (\n'
    '            <div className="gx-empty">\n'
    "              <b>Rien ici pour l'instant</b>\n"
    '              <p>Crée ta première pub dans le chat, elle apparaîtra ici.</p>\n'
    '              <Link to="/create" className="gx-btn gx-sm gx-pri">Créer une pub</Link>\n'
    '            </div>\n'
    '          ) : visibleAds.length === 0 && brandCards.length === 0 ? (\n'
    '            <div className="gx-empty">\n'
    '              <b>Aucune création ne correspond à ces filtres</b>\n'
    '              <p>Change de dossier, de type ou de source pour retrouver tes pubs.</p>\n'
    '              <button type="button" className="gx-btn gx-sm" onClick={() => { setActiveFolder("all"); '
    'setTypeFilter("all"); setSourceFilter("all"); }}>Réinitialiser les filtres</button>\n'
    '            </div>\n'
    '          ) : (',
    '            <ConsoleSkeleton variant="cards" rows={8} />\n'
    '          ) : ads.isError ? (\n'
    '            <ConsoleEmpty icon={AlertTriangle} title="Impossible de charger tes créations"\n'
    '              text="Elles sont toujours là, la connexion a échoué. Réessaie dans un instant."\n'
    '              action={<button type="button" className="gx-btn gx-sm gx-pri" onClick={() => void '
    'ads.refetch()}>Réessayer</button>} />\n'
    '          ) : adRows.length === 0 ? (\n'
    '            <ConsoleEmpty icon={Images} title="Rien ici pour l\'instant"\n'
    '              text="Crée ta première pub dans le chat, elle apparaîtra ici."\n'
    '              action={<Link to="/create" className="gx-btn gx-sm gx-pri">Créer une pub</Link>} />\n'
    '          ) : visibleAds.length === 0 && brandCards.length === 0 ? (\n'
    '            <ConsoleEmpty icon={Search} title="Aucune création ne correspond à ces filtres"\n'
    '              text="Change de dossier, de type ou de source pour retrouver tes pubs."\n'
    '              action={<button type="button" className="gx-btn gx-sm" onClick={() => { setActiveFolder("all"); '
    'setTypeFilter("all"); setSourceFilter("all"); }}>Réinitialiser les filtres</button>} />\n'
    '          ) : ('),
   ('<button type="button" className="gx-btn gx-sm" onClick={() => setOpenBrandId(null)}>← Tous les lots · '
    '{openBrand.name}</button>',
    '<button type="button" className="gx-btn gx-ghost gx-sm gx-back" onClick={() => setOpenBrandId(null)}><ChevronLeft '
    'className="gx-i" aria-hidden />Tous les lots · {openBrand.name}</button>'),
   ('      <AlertDialog open={!!errorDialogAd} onOpenChange={(o) => !o && setErrorDialogAd(null)}>',
    '      <ConfirmDialog\n'
    '        open={!!ask}\n'
    '        onOpenChange={(o) => { if (!o) setAsk(null); }}\n'
    '        title={ask?.title ?? ""}\n'
    '        description={ask?.description}\n'
    '        confirmLabel={ask?.label ?? "Supprimer"}\n'
    '        danger\n'
    '        onConfirm={() => {\n'
    '          const run = ask?.run;\n'
    '          setAsk(null);\n'
    '          run?.();\n'
    '        }}\n'
    '      />\n'
    '\n'
    '      <AlertDialog open={!!errorDialogAd} onOpenChange={(o) => !o && setErrorDialogAd(null)}>')]),
 ('src/routes/_authenticated/dashboard.tsx',
  'Icônes faites main (synchro, plus, micro, flèche, coche) remplacées ; symboles ↗ ✦ ⏸ ✓ → et ⚡ remplacés par des '
  'icônes ; chargement des conseils en squelette (fini « Analyse de tes chiffres… ») ; états vides communs ; « Lancer '
  '» en violet plat (via gx-unify.css) ; tutoiement de la description de page ; libellé masqué via gx-sr.',
  [('import { VideoPoster } from "@/components/VideoPoster";\n',
    'import { VideoPoster } from "@/components/VideoPoster";\n'
    'import { ConsoleEmpty } from "@/components/console";\n'
    'import { ArrowRight, BarChart3, Check, FlaskConical, Images, Mic, PauseCircle, Plug, Plus, RefreshCw, Sparkles, '
    'TrendingUp, Zap } from "@/components/icons";\n'),
   ('ce qu\'il faut faire maintenant, vos créations et vos derniers leads." },',
    'ce qu\'il faut faire maintenant, tes créations et tes derniers leads." },'),
   ('{ property: "og:description", content: "Vos pubs Meta, vos créations et vos leads au même endroit." },',
    '{ property: "og:description", content: "Tes pubs Meta, tes créations et tes leads au même endroit." },'),
   ('return <span className="gx-tn flex items-center justify-center bg-muted"><Film className="h-4 w-4 '
    'text-muted-foreground" aria-hidden /></span>;',
    'return <span className="gx-tn gx-tn-ic"><Film className="gx-i" aria-hidden /></span>;'),
   ('      thumb: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" '
    'strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-3-6.7L21 8M21 3v5h-5" /></svg>,',
    '      thumb: <RefreshCw aria-hidden />,'),
   ('                  <i>{s.done ? "✓" : i + 1}</i>',
    '                  <i>{s.done ? <Check className="gx-ii" aria-label="Fait" /> : i + 1}</i>'),
   ('<label htmlFor="home-ask" style={{ position: "absolute", left: -9999 }}>Décrire la pub</label>',
    '<label htmlFor="home-ask" className="gx-sr">Décrire la pub</label>'),
   ('                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" '
    'strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>Produit, acteur, campagne',
    '                    <Plus aria-hidden />Produit, acteur, campagne'),
   ('                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" '
    'strokeLinejoin="round"><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" '
    '/></svg>{listening ? "J\'écoute…" : "Dicter"}',
    '                <Mic aria-hidden />{listening ? "J\'écoute…" : "Dicter"}'),
   ('<span className="gx-cost gx-num" title="Une vidéo de 8 s coûte à partir de 300 crédits">≈ ⚡300</span>',
    '<span className="gx-cost gx-num" title="Une vidéo de 8 s coûte à partir de 300 crédits">≈ <Zap className="gx-ii" '
    'aria-label="crédits" />300</span>'),
   ('                Lancer<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" '
    'strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>',
    '                Lancer<ArrowRight aria-hidden />'),
   ('                <div className="gx-th"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" '
    'strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg></div>',
    '                <div className="gx-th"><Check aria-hidden /></div>'),
   ('            <div className="gx-empty">\n'
    '              <b>Connecte ton compte Meta</b>\n'
    '              <span>Je regarde tes pubs chaque jour et je te dis lesquelles booster, tester ou couper.</span>\n'
    '              <MetaConnectButton />\n'
    '            </div>\n'
    '          ) : mb.isLoading ? (\n'
    '            <div className="gx-recos">\n'
    '              {[0, 1, 2].map((i) => <article key={i} className="gx-reco"><p>Analyse de tes '
    'chiffres…</p></article>)}\n'
    '            </div>\n'
    '          ) : suggestions.length === 0 ? (\n'
    '            <div className="gx-empty">\n'
    "              <b>Rien d'urgent pour l'instant</b>\n"
    '              <span>{(mb.data as any)?.lowData\n'
    '                ? "Il faut encore quelques jours de diffusion pour que mes conseils soient fiables."\n'
    '                : "Tes campagnes tournent sans problème sur les 7 derniers jours."}</span>\n'
    '            </div>\n'
    '          ) : (',
    '            <ConsoleEmpty icon={Plug} title="Connecte ton compte Meta"\n'
    '              text="Je regarde tes pubs chaque jour et je te dis lesquelles booster, tester ou couper."\n'
    '              action={<MetaConnectButton />} />\n'
    '          ) : mb.isLoading ? (\n'
    '            <div className="gx-recos" aria-busy="true" aria-label="Analyse de tes chiffres…">\n'
    '              {[0, 1, 2].map((i) => (\n'
    '                <article key={i} className="gx-reco">\n'
    '                  <span className="gx-skel gx-skel-line gx-skel-w40" />\n'
    '                  <span className="gx-skel gx-skel-line" />\n'
    '                  <span className="gx-skel gx-skel-line gx-skel-w70" />\n'
    '                </article>\n'
    '              ))}\n'
    '            </div>\n'
    '          ) : suggestions.length === 0 ? (\n'
    '            <ConsoleEmpty compact icon={Check} title="Rien d\'urgent pour l\'instant"\n'
    '              text={(mb.data as any)?.lowData\n'
    '                ? "Il faut encore quelques jours de diffusion pour que mes conseils soient fiables."\n'
    '                : "Tes campagnes tournent sans problème sur les 7 derniers jours."} />\n'
    '          ) : ('),
   ('                  <span className="gx-k">{s.kind === "boost" ? "↗ À booster" : s.kind === "test" ? "✦ À tester" : '
    '"⏸ À couper"}</span>',
    '                  <span className="gx-k">{s.kind === "boost" ? <><TrendingUp className="gx-ii" aria-hidden /> À '
    'booster</> : s.kind === "test" ? <><FlaskConical className="gx-ii" aria-hidden /> À tester</> : <><PauseCircle '
    'className="gx-ii" aria-hidden /> À couper</>}</span>'),
   ('<small>Du brouillon à la pub en ligne</small><Link className="gx-link" to="/creations">Tout voir →</Link></div>',
    '<small>Du brouillon à la pub en ligne</small><Link className="gx-link" to="/creations">Tout voir <ArrowRight '
    'className="gx-ii" aria-hidden /></Link></div>'),
   ('            <div className="gx-empty">\n'
    '              <b>Aucune pub en préparation</b>\n'
    "              <p>Le pipeline suit tes pubs du brouillon jusqu'à la mise en ligne.</p>\n"
    '              <Link to="/create" className="gx-btn gx-sm gx-pri">Créer ma première pub</Link>\n'
    '            </div>',
    '            <ConsoleEmpty icon={Sparkles} title="Aucune pub en préparation"\n'
    '              text="Le pipeline suit tes pubs du brouillon jusqu\'à la mise en ligne."\n'
    '              action={<Link to="/create" className="gx-btn gx-sm gx-pri">Créer ma première pub</Link>} />'),
   ('<small>7 derniers jours</small><Link className="gx-link" to="/campaigns">Voir tout →</Link></div>',
    '<small>7 derniers jours</small><Link className="gx-link" to="/campaigns">Voir tout <ArrowRight className="gx-ii" '
    'aria-hidden /></Link></div>'),
   ('            <div className="gx-empty">\n'
    '              <b>{metaConnected ? "Aucune campagne active sur les 7 derniers jours" : "Aucune campagne Meta '
    'connectée"}</b>\n'
    '              <span>{metaConnected ? "Lance une campagne pour suivre ici sa dépense, ses leads et son coût par '
    'lead." : "Connecte Meta pour voir tes campagnes ici."}</span>\n'
    '              {metaConnected && <Link to="/campaigns/new" className="gx-btn gx-sm">Nouvelle campagne</Link>}\n'
    '            </div>',
    '            <ConsoleEmpty compact icon={BarChart3}\n'
    '              title={metaConnected ? "Aucune campagne active sur les 7 derniers jours" : "Aucune campagne Meta '
    'connectée"}\n'
    '              text={metaConnected ? "Lance une campagne pour suivre ici sa dépense, ses leads et son coût par '
    'lead." : "Connecte Meta pour voir tes campagnes ici."}\n'
    '              action={metaConnected ? <Link to="/campaigns/new" className="gx-btn gx-sm">Nouvelle campagne</Link> '
    ': undefined} />'),
   ('            <div className="gx-empty">\n'
    '              <b>Aucune création pour le moment</b>\n'
    '              <span>Décris ta pub dans la zone de saisie : la création apparaîtra ici.</span>\n'
    '              <button type="button" className="gx-btn gx-pri gx-sm" onClick={() => void startChat()} '
    'disabled={chatBusy}>Créer ma première pub</button>\n'
    '            </div>',
    '            <ConsoleEmpty compact icon={Images} title="Aucune création pour le moment"\n'
    '              text="Décris ta pub dans la zone de saisie : la création apparaîtra ici."\n'
    '              action={<button type="button" className="gx-btn gx-pri gx-sm" onClick={() => void startChat()} '
    'disabled={chatBusy}>Créer ma première pub</button>} />'),
   ('<div className="gx-lh">Derniers leads <Link to="/resultats"><small>Tout le mini CRM →</small></Link></div>',
    '<div className="gx-lh">Derniers leads <Link to="/resultats"><small>Tout le mini CRM <ArrowRight className="gx-ii" '
    'aria-hidden /></small></Link></div>'),
   ('background: `color-mix(in srgb, ${st?.color ?? "#888"} 14%, transparent)`',
    'background: `color-mix(in srgb, ${st?.color ?? "var(--gx-dim)"} 14%, transparent)`')]),
 ('src/routes/_authenticated/editeur.tsx',
  "Chargement de l'éditeur via PageHeader + ConsoleLoading ; écran « Passe sur ordinateur » via ConsoleEmpty ; "
  'description au tutoiement.',
  [('import { EditorProjectsGallery } from "@/components/editor/EditorProjectsGallery";\n',
    'import { EditorProjectsGallery } from "@/components/editor/EditorProjectsGallery";\n'
    'import { ConsoleEmpty, ConsoleLoading, PageHeader } from "@/components/console";\n'),
   ('"Montez vos publicités : timeline multipiste, filtres, effets, transitions, sous-titres IA et voix off.",',
    '"Monte tes publicités : timeline multipiste, filtres, effets, transitions, sous-titres IA et voix off.",'),
   ('const spinner = (\n'
    '  <div className="gx-page">\n'
    '    <header className="gx-ph">\n'
    '      <div>\n'
    '        <h1>Éditeur vidéo</h1>\n'
    "        <p>Chargement de l'éditeur…</p>\n"
    '      </div>\n'
    '    </header>\n'
    '  </div>\n'
    ');',
    'const spinner = (\n'
    '  <div className="gx-page">\n'
    '    <PageHeader title="Éditeur vidéo" />\n'
    '    <ConsoleLoading variant="page" label="Chargement de l\'éditeur…" />\n'
    '  </div>\n'
    ');'),
   ('    <div className="gx-page">\n'
    '      <header className="gx-ph">\n'
    '        <div>\n'
    '          <h1>Éditeur vidéo</h1>\n'
    '        </div>\n'
    '      </header>\n'
    '      <div className="gx-empty">\n'
    '        <Monitor className="gx-i" />\n'
    '        <b>Passe sur ordinateur</b>\n'
    '        <span>\n'
    "          L'éditeur vidéo nécessite un grand écran pour déplacer les séquences et régler la timeline avec "
    'précision.\n'
    '        </span>\n'
    '        <button type="button" className="gx-btn" onClick={onBack}>\n'
    '          <ChevronLeft className="gx-i" />\n'
    '          Retour aux projets\n'
    '        </button>\n'
    '      </div>\n'
    '    </div>',
    '    <div className="gx-page">\n'
    '      <PageHeader title="Éditeur vidéo" />\n'
    '      <ConsoleEmpty\n'
    '        icon={Monitor}\n'
    '        title="Passe sur ordinateur"\n'
    '        text="L\'éditeur vidéo nécessite un grand écran pour déplacer les séquences et régler la timeline avec '
    'précision."\n'
    '        action={\n'
    '          <button type="button" className="gx-btn" onClick={onBack}>\n'
    '            <ChevronLeft className="gx-i" />\n'
    '            Retour aux projets\n'
    '          </button>\n'
    '        }\n'
    '      />\n'
    '    </div>')]),
 ('src/routes/_authenticated/galerie.tsx',
  'En-tête via PageHeader ; icônes faites main (plus, chevron, étoile, loupe, ···) remplacées ; « ★ Mes favoris » → '
  "icône Star pleine ; « ⚡ » des crédits → Zap ; suppression d'un acteur : ConfirmDialog rouge au lieu de "
  'window.confirm ; tuiles de chargement qui pulsent ; états vides communs.',
  [('import { CreateActorDialog } from "@/components/CreateActorDialog";\n',
    'import { CreateActorDialog } from "@/components/CreateActorDialog";\n'
    'import { ConfirmDialog, ConsoleEmpty, PageHeader } from "@/components/console";\n'
    'import { ChevronDown, MoreHorizontal, Plus, Search, Star, Users, Zap } from "@/components/icons";\n'),
   ('import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";\n',
    'import { useEffect, useMemo, useRef, useState } from "react";\n'),
   ('/* --------------------------------- icônes -------------------------------- */\n'
    '\n'
    'function Icon({ d, children }: { d?: string; children?: ReactNode }) {\n'
    '  return (\n'
    '    <svg className="gx-i" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" '
    'strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">\n'
    '      {d ? <path d={d} /> : children}\n'
    '    </svg>\n'
    '  );\n'
    '}\n'
    'const PLUS = "M12 5v14M5 12h14";\n'
    'const CHEVRON = "m6 9 6 6 6-6";\n'
    'const STAR = "m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9Z";\n'
    '\n',
    ''),
   ('  const [favs, setFavs] = useState<Set<string>>(new Set());\n',
    '  const [favs, setFavs] = useState<Set<string>>(new Set());\n'
    '  // Acteur à supprimer, en attente de confirmation (remplace window.confirm).\n'
    '  const [removing, setRemoving] = useState<UnifiedActor | null>(null);\n'),
   ('  const removeMine = async (a: UnifiedActor) => {\n'
    "    if (!confirm(`Supprimer l'acteur « ${a.name} » ?`)) return;\n"
    '    try {',
    '  const removeMine = async (a: UnifiedActor) => {\n'
    '    setRemoving(a);\n'
    '  };\n'
    '\n'
    '  const doRemoveMine = async (a: UnifiedActor) => {\n'
    '    try {'),
   ('      <div className="gx-ph">\n'
    '        <div>\n'
    "          <h1>Galerie d'acteurs</h1>\n"
    '          <p>\n'
    '            {loading\n'
    '              ? "Chargement des acteurs…"\n'
    '              : origin === "mine"\n'
    '                ? `${frNumber(mineCount)} acteur${mineCount > 1 ? "s" : ""} créé${mineCount > 1 ? "s" : ""} par '
    'toi.`\n'
    '                : origin === "growthity"\n'
    '                  ? `${frNumber(stockCount)} acteurs Growthity. Choisis un visage, il parle de ton produit.`\n'
    '                  : `${frNumber(actors.length)} acteurs · acteurs Growthity + les tiens. Choisis un visage, il '
    'parle de ton produit.`}\n'
    '          </p>\n'
    '        </div>\n'
    '        <div className="gx-pa">\n'
    '          <button type="button" className="gx-btn gx-pri" onClick={() => setCreateOpen(true)}>\n'
    '            <Icon d={PLUS} />Créer un acteur\n'
    '          </button>\n'
    '        </div>\n'
    '      </div>',
    '      <PageHeader\n'
    '        title="Galerie d\'acteurs"\n'
    '        subtitle={\n'
    '          loading\n'
    '            ? "Chargement des acteurs…"\n'
    '            : origin === "mine"\n'
    '              ? `${frNumber(mineCount)} acteur${mineCount > 1 ? "s" : ""} créé${mineCount > 1 ? "s" : ""} par '
    'toi.`\n'
    '              : origin === "growthity"\n'
    '                ? `${frNumber(stockCount)} acteurs Growthity. Choisis un visage, il parle de ton produit.`\n'
    '                : `${frNumber(actors.length)} acteurs · acteurs Growthity + les tiens. Choisis un visage, il '
    'parle de ton produit.`\n'
    '        }\n'
    '        actions={\n'
    '          <button type="button" className="gx-btn gx-pri" onClick={() => setCreateOpen(true)}>\n'
    '            <Plus className="gx-i" aria-hidden />Créer un acteur\n'
    '          </button>\n'
    '        }\n'
    '      />'),
   ('          <Icon><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></Icon>\n',
    '          <Search className="gx-i" aria-hidden />\n'),
   ('onClick={() => setOnlyFavs((v) => !v)}>★ Mes favoris</button>',
    'onClick={() => setOnlyFavs((v) => !v)}><Star className="gx-ii fill-current" aria-hidden /> Mes favoris</button>'),
   ('          <span><Icon d={PLUS} /></span>\n'
    '          <b>Créer un acteur</b>\n'
    '          <small>Depuis une photo ou une description · ⚡{frNumber(ACTOR_COST)}</small>',
    '          <span><Plus className="gx-i" aria-hidden /></span>\n'
    '          <b>Créer un acteur</b>\n'
    '          <small>Depuis une photo ou une description · <Zap className="gx-ii" aria-label="crédits" '
    '/>{frNumber(ACTOR_COST)}</small>'),
   ('? Array.from({ length: 7 }).map((_, i) => <div key={i} className="gx-atile" aria-hidden />)',
    '? Array.from({ length: 7 }).map((_, i) => <div key={i} className="gx-atile gx-skel" aria-hidden />)'),
   ('        <div className="gx-empty">\n'
    '          <b>Aucun acteur ne correspond</b>\n'
    '          <p>Retire un filtre ou crée ton propre acteur.</p>\n'
    '          <button type="button" className="gx-btn gx-sm" onClick={resetFilters}>Réinitialiser les '
    'filtres</button>\n'
    '        </div>',
    '        <ConsoleEmpty\n'
    '          icon={Search}\n'
    '          title="Aucun acteur ne correspond"\n'
    '          text="Retire un filtre ou crée ton propre acteur."\n'
    '          action={<button type="button" className="gx-btn gx-sm" onClick={resetFilters}>Réinitialiser les '
    'filtres</button>}\n'
    '        />'),
   ('        <div className="gx-empty">\n'
    "          <b>Tu n'as pas encore d'acteur</b>\n"
    "          <p>Crée ton premier acteur à partir d'une description ou d'une photo.</p>\n"
    '          <button type="button" className="gx-btn gx-pri gx-sm" onClick={() => setCreateOpen(true)}>\n'
    '            <Icon d={PLUS} />Créer un acteur\n'
    '          </button>\n'
    '        </div>',
    '        <ConsoleEmpty\n'
    '          icon={Users}\n'
    '          title="Tu n\'as pas encore d\'acteur"\n'
    '          text="Crée ton premier acteur à partir d\'une description ou d\'une photo."\n'
    '          action={\n'
    '            <button type="button" className="gx-btn gx-pri gx-sm" onClick={() => setCreateOpen(true)}>\n'
    '              <Plus className="gx-i" aria-hidden />Créer un acteur\n'
    '            </button>\n'
    '          }\n'
    '        />'),
   ('      <CreateActorDialog open={createOpen} onOpenChange={setCreateOpen} />\n    </div>',
    '      <CreateActorDialog open={createOpen} onOpenChange={setCreateOpen} />\n'
    '      <ConfirmDialog\n'
    '        open={!!removing}\n'
    '        onOpenChange={(o) => { if (!o) setRemoving(null); }}\n'
    '        title={`Supprimer l\'acteur « ${removing?.name ?? ""} » ?`}\n'
    '        description="Il disparaîtra de ta galerie. Cette action est définitive."\n'
    '        confirmLabel="Supprimer"\n'
    '        danger\n'
    '        onConfirm={() => {\n'
    '          const a = removing;\n'
    '          setRemoving(null);\n'
    '          if (a) void doRemoveMine(a);\n'
    '        }}\n'
    '      />\n'
    '    </div>'),
   ('<span>{text}</span><Icon d={CHEVRON} />', '<span>{text}</span><ChevronDown className="gx-i" aria-hidden />'),
   ('        <Icon d={STAR} />\n',
    '        <Star className={isFavorite ? "gx-i fill-current" : "gx-i"} aria-hidden />\n'),
   ('              <Icon><circle cx="5" cy="12" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" '
    '/></Icon>\n',
    '              <MoreHorizontal className="gx-i" aria-hidden />\n')]),
 ('src/routes/_authenticated/guide-meta.tsx',
  '« ← Retour à Connexion » (à droite, flèche en texte) devient le retour commun en haut à gauche (PageHeader back).',
  [('import { GuideMeta } from "@/components/guide-meta/GuideMeta";\n',
    'import { GuideMeta } from "@/components/guide-meta/GuideMeta";\n'
    'import { PageHeader } from "@/components/console";\n'),
   ('      <header className="gx-ph">\n'
    '        <div>\n'
    '          <h1>Créer ton compte publicitaire Meta</h1>\n'
    '          <p>9 étapes, environ 25 minutes. Sur chaque écran, les pastilles violettes montrent où cliquer.</p>\n'
    '        </div>\n'
    '        <div className="gx-pa">\n'
    '          <Link to="/connexions" className="gx-btn">← Retour à Connexion</Link>\n'
    '        </div>\n'
    '      </header>',
    '      <PageHeader\n'
    '        back={{ to: "/connexions", label: "Connexion Meta" }}\n'
    '        title="Créer ton compte publicitaire Meta"\n'
    '        subtitle="9 étapes, environ 25 minutes. Sur chaque écran, les pastilles violettes montrent où cliquer."\n'
    '      />')]),
 ('src/routes/_authenticated/inspiration.tsx',
  "En-tête via PageHeader ; « Mes favoris » devient une puce (gx-chip + aria-pressed) au lieu d'un bouton primaire ; "
  'icônes faites main (chevron, étoile, étincelle) et symboles ★ ↗ ▶ remplacés ; chargement en squelette, états vides '
  'communs ; vignettes avec reflet de chargement (media-shimmer).',
  [('import { VideoPoster } from "@/components/VideoPoster";\n',
    'import { VideoPoster } from "@/components/VideoPoster";\n'
    'import { ConsoleEmpty, ConsoleSkeleton, PageHeader } from "@/components/console";\n'
    'import { AlertTriangle, ChevronDown, ExternalLink, Images, MousePointerClick, Play, Search, Sparkles, Star } from '
    '"@/components/icons";\n'),
   ('const IcoChevron = () => (\n'
    '  <svg className="gx-i" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" '
    'strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>\n'
    ');\n'
    'const IcoStar = ({ filled }: { filled?: boolean }) => (\n'
    '  <svg className="gx-i" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" '
    'strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m12 3 2.7 5.6 6.1.9-4.4 '
    '4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9Z" /></svg>\n'
    ');\n'
    'const IcoSpark = () => (\n'
    '  <svg className="gx-i" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" '
    'strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 '
    '2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6" /></svg>\n'
    ');',
    'const IcoChevron = () => <ChevronDown className="gx-i" aria-hidden />;\n'
    'const IcoStar = ({ filled }: { filled?: boolean }) => <Star className={filled ? "gx-i fill-current" : "gx-i"} '
    'aria-hidden />;\n'
    'const IcoSpark = () => <Sparkles className="gx-i" aria-hidden />;'),
   ('      <header className="gx-ph">\n'
    '        <div>\n'
    "          <h1>Galerie d'inspiration</h1>\n"
    '          <p>Des pubs qui performent. Choisis-en une, on la recrée pour ton produit.</p>\n'
    '        </div>\n'
    '        <div className="gx-pa">\n'
    '          <button type="button" className={favOnly ? "gx-btn gx-pri" : "gx-btn"} aria-pressed={favOnly}\n'
    '            onClick={() => { setFavOnly((v) => !v); setSelectedId(null); }}>★ Mes favoris</button>\n'
    '        </div>\n'
    '      </header>',
    '      <PageHeader\n'
    '        title="Galerie d\'inspiration"\n'
    '        subtitle="Des pubs qui performent. Choisis-en une, on la recrée pour ton produit."\n'
    '        actions={\n'
    '          <button type="button" className={favOnly ? "gx-chip gx-on" : "gx-chip"} aria-pressed={favOnly}\n'
    '            onClick={() => { setFavOnly((v) => !v); setSelectedId(null); }}><Star className="gx-ii fill-current" '
    'aria-hidden /> Mes favoris</button>\n'
    '        }\n'
    '      />'),
   ('            <div className="gx-empty"><b>Chargement des pubs…</b></div>\n'
    '          ) : query.isError ? (\n'
    '            <div className="gx-empty">\n'
    '              <b>Impossible de charger la galerie</b>\n'
    '              <p>{frError(query.error)}</p>\n'
    '              <button type="button" className="gx-btn gx-sm" onClick={() => void '
    'query.refetch()}>Réessayer</button>\n'
    '            </div>\n'
    '          ) : items.length === 0 ? (\n'
    '            <div className="gx-empty">\n'
    '              <b>{favOnly ? "Aucun favori pour l\'instant" : "Aucune pub pour ce filtre"}</b>\n'
    '              <p>{favOnly ? "Clique « Sauvegarder » sur une pub pour la retrouver ici." : "Essaie un autre '
    'concept ou secteur."}</p>\n'
    '              {favOnly ? (\n'
    '                <button type="button" className="gx-btn gx-sm" onClick={() => setFavOnly(false)}>Voir toutes les '
    'pubs</button>\n'
    '              ) : (\n'
    '                <button type="button" className="gx-btn gx-sm" onClick={() => { setConcepts([]); '
    'setSegment(null); setSector(""); setStyle(""); setObjective(""); setRatio(""); }}>Réinitialiser les '
    'filtres</button>\n'
    '              )}\n'
    '            </div>\n'
    '          ) : (',
    '            <ConsoleSkeleton variant="cards" rows={8} />\n'
    '          ) : query.isError ? (\n'
    '            <ConsoleEmpty icon={AlertTriangle} title="Impossible de charger la galerie" '
    'text={frError(query.error)}\n'
    '              action={<button type="button" className="gx-btn gx-sm" onClick={() => void '
    'query.refetch()}>Réessayer</button>} />\n'
    '          ) : items.length === 0 ? (\n'
    '            <ConsoleEmpty\n'
    '              icon={favOnly ? Star : Search}\n'
    '              title={favOnly ? "Aucun favori pour l\'instant" : "Aucune pub pour ce filtre"}\n'
    '              text={favOnly ? "Clique « Sauvegarder » sur une pub pour la retrouver ici." : "Essaie un autre '
    'concept ou secteur."}\n'
    '              action={favOnly ? (\n'
    '                <button type="button" className="gx-btn gx-sm" onClick={() => setFavOnly(false)}>Voir toutes les '
    'pubs</button>\n'
    '              ) : (\n'
    '                <button type="button" className="gx-btn gx-sm" onClick={() => { setConcepts([]); '
    'setSegment(null); setSector(""); setStyle(""); setObjective(""); setRatio(""); }}>Réinitialiser les '
    'filtres</button>\n'
    '              )}\n'
    '            />\n'
    '          ) : ('),
   ('            <div className="gx-empty">\n'
    '              <b>{query.isLoading ? "Chargement…" : "Aucune pub sélectionnée"}</b>\n'
    '              <p>Choisis une pub dans la galerie pour voir son détail.</p>\n'
    '            </div>',
    '            <ConsoleEmpty compact icon={query.isLoading ? Images : MousePointerClick}\n'
    '              title={query.isLoading ? "Chargement…" : "Aucune pub sélectionnée"}\n'
    '              text="Choisis une pub dans la galerie pour voir son détail." />'),
   ('target="_blank" rel="noopener noreferrer">Voir sur la Meta Ads Library ↗</a>',
    'target="_blank" rel="noopener noreferrer">Voir sur la Meta Ads Library <ExternalLink className="gx-ii" '
    'aria-hidden /></a>'),
   ('      <span className="gx-imed">\n', '      <span className="gx-imed media-shimmer">\n'),
   ('{isVideo && !playing && <span className="gx-vbadge" aria-label="Vidéo">▶</span>}',
    '{isVideo && !playing && <span className="gx-vbadge" aria-label="Vidéo"><Play className="gx-ii fill-current" '
    'aria-hidden /></span>}')]),
 ('src/routes/_authenticated/ma-marque.tsx',
  'Icônes faites main (composant Svg + table IC) remplacées par les icônes communes ; coches ✓ → Check ; chargements '
  "via ConsoleLoading (fini l'état vide utilisé comme chargeur) ; états vides gx-mq-emptys → ConsoleEmpty.",
  [('import { BrandProductImport } from "@/components/BrandProductImport";\n',
    'import { BrandProductImport } from "@/components/BrandProductImport";\n'
    'import { ConsoleEmpty, ConsoleLoading } from "@/components/console";\n'
    'import { ArrowUpRight, Check, ChevronDown, Globe, Link2, RefreshCw, Search, ShoppingBag, Star, type IconComponent '
    '} from "@/components/icons";\n'),
   ('function Svg({ d, className = "gx-mq-ic" }: { d: string; className?: string }) {\n'
    '  return (\n'
    '    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" '
    'strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">\n'
    '      <path d={d} />\n'
    '    </svg>\n'
    '  );\n'
    '}\n'
    'const IC = {\n'
    '  reload: "M21 12a9 9 0 1 1-3-6.7L21 8M21 3v5h-5",\n'
    '  globe: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18",\n'
    '  down: "m6 9 6 6 6-6",\n'
    '  link: "M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1",\n'
    '  search: "M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM21 21l-4.6-4.6",\n'
    '  star: "m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z",\n'
    '  out: "M7 17 17 7M9 7h8v8",\n'
    '  bag: "M3 7h18l-2 13H5zM8 7a4 4 0 0 1 8 0",\n'
    '};',
    '/** Icône de la page (mêmes icônes que le reste de la console). */\n'
    'function Svg({ d: Icon, className = "gx-mq-ic" }: { d: IconComponent; className?: string }) {\n'
    '  return <Icon className={className} aria-hidden />;\n'
    '}\n'
    'const IC = {\n'
    '  reload: RefreshCw,\n'
    '  globe: Globe,\n'
    '  down: ChevronDown,\n'
    '  link: Link2,\n'
    '  search: Search,\n'
    '  star: Star,\n'
    '  out: ArrowUpRight,\n'
    '  bag: ShoppingBag,\n'
    '};'),
   ('        <div className="gx-box gx-empty"><b>Chargement de ta marque…</b></div>',
    '        <ConsoleLoading variant="page" label="Chargement de ta marque…" />'),
   ('  if (space.isLoading || !b) return <div className="gx-box gx-empty"><b>Chargement de la fiche…</b></div>;',
    '  if (space.isLoading || !b) return <ConsoleLoading label="Chargement de la fiche…" />;'),
   ('<span className={saved.on ? "gx-mq-saved gx-mq-on" : "gx-mq-saved"} role="status">✓ Enregistré</span>',
    '<span className={saved.on ? "gx-mq-saved gx-mq-on" : "gx-mq-saved"} role="status"><Check className="gx-ii" '
    'aria-hidden /> Enregistré</span>'),
   ('{x.id === currentId && <span className="gx-mq-ck" aria-label="Marque active">✓</span>}',
    '{x.id === currentId && <span className="gx-mq-ck" aria-label="Marque active"><Check className="gx-ii" aria-hidden '
    '/></span>}'),
   ('<i aria-hidden="true">{done ? "✓" : k + 1}</i>{s.label}',
    '<i aria-hidden="true">{done ? <Check className="gx-ii" /> : k + 1}</i>{s.label}'),
   ('  if (q.isLoading) return <div className="gx-box gx-empty"><b>Chargement des produits…</b></div>;',
    '  if (q.isLoading) return <ConsoleLoading label="Chargement des produits…" />;'),
   ('      <div className="gx-mq-emptys">\n'
    '        <span className="gx-mq-ei"><Svg d={IC.bag} /></span>\n'
    "        <h3>Aucun produit pour l'instant</h3>\n"
    '        <p>Lance <button type="button" className="gx-mq-inl" onClick={() => void navigate({ to: "/ma-marque", '
    'search: { tab: "fiche" } })}>« Analyser mon site »</button> : Growthity lit tout ton catalogue. Ou colle '
    "ci-dessous le lien d'un produit.</p>\n"
    '        <div className="gx-mq-emptyadd">{addBar}</div>\n'
    '      </div>',
    '      <ConsoleEmpty\n'
    '        icon={ShoppingBag}\n'
    '        title="Aucun produit pour l\'instant"\n'
    '        text={<>Lance <button type="button" className="gx-mq-inl" onClick={() => void navigate({ to: '
    '"/ma-marque", search: { tab: "fiche" } })}>« Analyser mon site »</button> : Growthity lit tout ton catalogue. Ou '
    "colle ci-dessous le lien d'un produit.</>}\n"
    '        action={<div className="gx-mq-emptyadd">{addBar}</div>}\n'
    '      />'),
   ('        <div className="gx-mq-emptys"><h3>Aucun produit ne correspond</h3><p>Change le filtre ou la '
    'recherche.</p></div>',
    '        <ConsoleEmpty compact icon={Search} title="Aucun produit ne correspond" text="Change le filtre ou la '
    'recherche." />')]),
 ('src/routes/_authenticated/parametres/facturation.tsx',
  'Symbole ⚡ des crédits → icône Zap ; « workspaces » → « espaces de travail » ; un seul bouton primaire (« Acheter '
  "des crédits » passe en secondaire, « Changer d'offre » reste violet) ; état vide commun dans l'historique.",
  [('import { createPortalSession, getBillingOverview, type BillingOverview } from '
    '"@/lib/billing/payments.functions";\n',
    'import { createPortalSession, getBillingOverview, type BillingOverview } from '
    '"@/lib/billing/payments.functions";\n'
    'import { ConsoleEmpty } from "@/components/console";\n'
    'import { History, Zap } from "@/components/icons";\n'),
   ('<button type="button" className="gx-btn gx-sm gx-pri" onClick={() => setSheet("topup")} '
    'disabled={!topups.length}>Acheter des crédits</button>',
    '<button type="button" className="gx-btn gx-sm" onClick={() => setSheet("topup")} '
    'disabled={!topups.length}>Acheter des crédits</button>'),
   ('          <div className="gx-empty"><b>Aucun mouvement pour le moment</b></div>',
    '          <ConsoleEmpty compact icon={History} title="Aucun mouvement pour le moment" />'),
   ('                        <b className={positive ? "gx-up" : undefined}>{positive ? "+" : ""}{frInt(tx.amount)} '
    '⚡</b>\n'
    '                        <small>solde : {frInt(tx.balance_after)} ⚡ (lecture seule)</small>',
    '                        <b className={positive ? "gx-up" : undefined}>{positive ? "+" : ""}{frInt(tx.amount)} '
    '<Zap className="gx-ii" aria-label="crédits" /></b>\n'
    '                        <small>solde : {frInt(tx.balance_after)} <Zap className="gx-ii" aria-label="crédits" /> '
    '(lecture seule)</small>'),
   ('    body: "Membres, marques, workspaces, dossiers, historique, chat, sauvegardes - tout est illimité, quel que '
    'soit le volume choisi." },',
    '    body: "Membres, marques, espaces de travail, dossiers, historique, chat, sauvegardes - tout est illimité, '
    'quel que soit le volume choisi." },')]),
 ('src/routes/_authenticated/parametres/marques.tsx',
  "Icône « plus » faite main → Plus ; chargement des marques en tuile qui pulse ; suppression d'une marque en rouge "
  'via gx-danger.',
  [('import { createBrand, updateBrand, deleteBrand, uploadBrandLogo } from "@/lib/brands.functions";\n',
    'import { createBrand, updateBrand, deleteBrand, uploadBrandLogo } from "@/lib/brands.functions";\n'
    'import { Plus } from "@/components/icons";\n'),
   ('<div className="gx-box gx-mc"><span className="gx-bm gx-bm-img" aria-hidden="true" /><b>Chargement…</b><small>Tes '
    'marques arrivent</small></div>',
    '<div className="gx-box gx-mc" aria-busy="true"><span className="gx-bm gx-bm-img gx-skel" aria-hidden="true" '
    '/><b>Chargement…</b><small>Tes marques arrivent</small></div>'),
   ('          <svg className="gx-i" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" '
    'strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>\n'
    '          <b>Ajouter une marque</b>',
    '          <Plus className="gx-i" aria-hidden />\n          <b>Ajouter une marque</b>'),
   ('<AlertDialogAction onClick={onDelete} className="bg-destructive text-destructive-foreground '
    'hover:bg-destructive/90">Supprimer</AlertDialogAction>',
    '<AlertDialogAction onClick={onDelete} className="gx-danger">Supprimer</AlertDialogAction>')]),
 ('src/routes/_authenticated/parametres/membres.tsx',
  "« Retirer de l'espace de travail » demande maintenant une confirmation (ConfirmDialog rouge) ; icônes faites main "
  '(⋯, plus) remplacées ; chargement et état vide communs ; « workspace » → « espace de travail ».',
  [('import { listWorkspaceMembers, inviteMember, removeMember, cancelInvitation, resendInvitation, '
    'updateInvitationRole, setMemberProjectPermission } from "@/lib/workspaces.functions";\n',
    'import { listWorkspaceMembers, inviteMember, removeMember, cancelInvitation, resendInvitation, '
    'updateInvitationRole, setMemberProjectPermission } from "@/lib/workspaces.functions";\n'
    'import { ConfirmDialog, ConsoleEmpty, ConsoleLoading } from "@/components/console";\n'
    'import { MoreHorizontal, Plus, Users } from "@/components/icons";\n'),
   ('      <svg className="gx-i" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" '
    'strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={IC_MORE} /></svg>\n',
    '      <MoreHorizontal className="gx-i" aria-hidden />\n'),
   ('const IC_MORE = "M5 12h.01M12 12h.01M19 12h.01";\n\n', ''),
   ('  const [busyPermission, setBusyPermission] = useState<string | null>(null);\n',
    '  const [busyPermission, setBusyPermission] = useState<string | null>(null);\n'
    '  // Membre à retirer, en attente de confirmation.\n'
    '  const [removing, setRemoving] = useState<{ id: string; name: string } | null>(null);\n'),
   ("              <tr><td colSpan={3}><small>Chargement de l'équipe…</small></td></tr>",
    '              <tr><td colSpan={3}><ConsoleLoading variant="inline" label="Chargement de l\'équipe…" /></td></tr>'),
   ('              <tr><td colSpan={3}><div className="gx-empty"><b>Tu es seul dans ce workspace</b><p>Invite ton '
    'équipe pour créer et publier des pubs à plusieurs, avec le bouton « Inviter un membre » '
    'ci-dessous.</p></div></td></tr>',
    '              <tr><td colSpan={3}><ConsoleEmpty compact icon={Users} title="Tu es seul dans cet espace de '
    'travail" text="Invite ton équipe pour créer et publier des pubs à plusieurs, avec le bouton « Inviter un membre » '
    'ci-dessous." /></td></tr>'),
   ('<DropdownMenuItem onSelect={() => void remove(m.id)}>Retirer du workspace</DropdownMenuItem>',
    '<DropdownMenuItem className="text-destructive" onSelect={() => setRemoving({ id: m.id, name: p?.display_name ?? '
    'p?.email ?? "ce membre" })}>Retirer de l\'espace de travail</DropdownMenuItem>'),
   ('          <svg className="gx-i" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" '
    'strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>\n'
    '          Inviter un membre',
    '          <Plus className="gx-i" aria-hidden />\n          Inviter un membre'),
   ('<b>{inviteLink.email}</b>. Il rejoindra le workspace après connexion.',
    "<b>{inviteLink.email}</b>. Il rejoindra l'espace de travail après connexion."),
   ('        </GxSheetContent>\n      </DialogPrimitive.Root>\n    </>\n  );\n}',
    '        </GxSheetContent>\n'
    '      </DialogPrimitive.Root>\n'
    '\n'
    '      <ConfirmDialog\n'
    '        open={!!removing}\n'
    '        onOpenChange={(o) => { if (!o) setRemoving(null); }}\n'
    '        title={`Retirer ${removing?.name ?? "ce membre"} de l\'espace de travail ?`}\n'
    '        description="Il perdra l\'accès aux créations, campagnes et leads de cet espace. Tu pourras l\'inviter de '
    'nouveau."\n'
    '        confirmLabel="Retirer"\n'
    '        danger\n'
    '        onConfirm={() => (removing ? remove(removing.id) : undefined)}\n'
    '      />\n'
    '    </>\n'
    '  );\n'
    '}')]),
 ('src/routes/_authenticated/parametres/profil.tsx',
  'Icône corbeille faite main → Trash2 ; « ✓ » retiré du toast ; bouton « Supprimer définitivement » en rouge via '
  'gx-danger.',
  [('import { updatePhone } from "@/lib/onboarding.functions";\n',
    'import { updatePhone } from "@/lib/onboarding.functions";\nimport { Trash2 } from "@/components/icons";\n'),
   ('      toast.success("Enregistré ✓");', '      toast.success("Enregistré");'),
   ('              <svg className="gx-i" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" '
    'strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 '
    '13h10l1-13M9 7V4h6v3" /></svg>\n',
    '              <Trash2 className="gx-i" aria-hidden />\n'),
   ('                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"\n',
    '                className="gx-danger"\n')]),
 ('src/routes/_authenticated/parametres/route.tsx',
  "En-tête via PageHeader (fin du conteneur d'actions vide) ; onglet « Workspace » renommé « Espace de travail » (lien "
  'inchangé).',
  [('import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";\n',
    'import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";\n'
    'import { PageHeader } from "@/components/console";\n'),
   ('  { to: "/parametres/workspace", label: "Workspace" },',
    '  { to: "/parametres/workspace", label: "Espace de travail" },'),
   ('      <header className="gx-ph">\n'
    '        <div>\n'
    '          <h1>Paramètres</h1>\n'
    '          <p>Profil, espace de travail, marques, équipe et sécurité.</p>\n'
    '        </div>\n'
    '        <div className="gx-pa" />\n'
    '      </header>',
    '      <PageHeader title="Paramètres" subtitle="Profil, espace de travail, marques, équipe et sécurité." />')]),
 ('src/routes/_authenticated/parametres/securite.tsx',
  'Désactivation de la 2FA : ConfirmDialog rouge au lieu de window.confirm.',
  [('import { getAuthProviders, listMySessions, revokeSession } from "@/lib/workspaces.functions";\n',
    'import { getAuthProviders, listMySessions, revokeSession } from "@/lib/workspaces.functions";\n'
    'import { ConfirmDialog } from "@/components/console";\n'),
   ('  const [busy, setBusy] = useState(false);\n',
    '  const [busy, setBusy] = useState(false);\n'
    '  // Facteur 2FA à désactiver, en attente de confirmation (remplace window.confirm).\n'
    '  const [unenrollId, setUnenrollId] = useState<string | null>(null);\n'),
   ('  const removeFactor = async (id: string) => {\n'
    '    if (!confirm_("Désactiver la 2FA pour cet appareil ?")) return;\n'
    '    setBusy(true);',
    '  const removeFactor = async (id: string, confirmed?: boolean) => {\n'
    '    if (confirmed !== true) { setUnenrollId(id); return; }\n'
    '    setBusy(true);'),
   ('        </GxSheetContent>\n      </DialogPrimitive.Root>\n    </>\n  );\n}',
    '        </GxSheetContent>\n'
    '      </DialogPrimitive.Root>\n'
    '\n'
    '      <ConfirmDialog\n'
    '        open={!!unenrollId}\n'
    '        onOpenChange={(o) => { if (!o) setUnenrollId(null); }}\n'
    '        title="Désactiver la 2FA pour cet appareil ?"\n'
    '        description="Ton compte ne sera plus protégé par un code temporaire sur cet appareil."\n'
    '        confirmLabel="Désactiver"\n'
    '        danger\n'
    '        onConfirm={() => {\n'
    '          const id = unenrollId;\n'
    '          setUnenrollId(null);\n'
    '          if (id) void removeFactor(id, true);\n'
    '        }}\n'
    '      />\n'
    '    </>\n'
    '  );\n'
    '}')]),
 ('src/routes/_authenticated/parametres/workspace.tsx',
  'Textes « workspace » → « espace de travail » ; icônes faites main (chevron, corbeille) remplacées ; bouton « '
  'Supprimer » de la confirmation en rouge via gx-danger (fin de la chaîne bg-destructive).',
  [('import { getMetaCredentials } from "@/lib/meta.functions";\n',
    'import { getMetaCredentials } from "@/lib/meta.functions";\n'
    'import { ChevronDown, Trash2 } from "@/components/icons";\n'),
   ('      toast.success("Workspace supprimé");', '      toast.success("Espace de travail supprimé");'),
   ('    if (!newName.trim()) { toast.error("Indique un nom de workspace."); return; }',
    '    if (!newName.trim()) { toast.error("Indique un nom d\'espace de travail."); return; }'),
   ('      toast.success("Workspace créé");', '      toast.success("Espace de travail créé");'),
   ('          <label htmlFor="wName">Nom du workspace</label>',
    '          <label htmlFor="wName">Nom de l\'espace de travail</label>'),
   ('            placeholder={isLoading ? "Chargement…" : "Nom du workspace"}',
    '            placeholder={isLoading ? "Chargement…" : "Nom de l\'espace de travail"}'),
   ('            <span>Rattachée à ce workspace</span>', '            <span>Rattachée à cet espace de travail</span>'),
   ('          <label>Autres workspaces</label>', '          <label>Autres espaces de travail</label>'),
   ('                <svg className="gx-i" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" '
    'strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>\n',
    '                <ChevronDown className="gx-i" aria-hidden />\n'),
   ('<DropdownMenuItem onSelect={() => setCreateOpen(true)}>Créer un workspace</DropdownMenuItem>',
    '<DropdownMenuItem onSelect={() => setCreateOpen(true)}>Créer un espace de travail</DropdownMenuItem>'),
   ('            <label>Supprimer ce workspace</label>', '            <label>Supprimer cet espace de travail</label>'),
   ('                  <svg className="gx-i" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" '
    'strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 '
    '13h10l1-13M9 7V4h6v3" /></svg>\n',
    '                  <Trash2 className="gx-i" aria-hidden />\n'),
   ('                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90">',
    '                    className="gx-danger">'),
   ('              <DialogPrimitive.Title asChild><b>Créer un workspace</b></DialogPrimitive.Title>',
    '              <DialogPrimitive.Title asChild><b>Créer un espace de travail</b></DialogPrimitive.Title>'),
   ('            <label className="gx-lbl" htmlFor="newWs">Nom du workspace</label>',
    '            <label className="gx-lbl" htmlFor="newWs">Nom de l\'espace de travail</label>')]),
 ('src/routes/_authenticated/performance.tsx',
  'En-tête via PageHeader ; icône calendrier faite main et flèche « → » remplacées par Calendar / ArrowRight.',
  [('import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";\n',
    'import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";\n'
    'import { PageHeader } from "@/components/console";\n'
    'import { ArrowRight, Calendar } from "@/components/icons";\n'),
   ('      <div className="gx-ph">\n'
    '        <div>\n'
    '          <h1>Performance</h1>\n'
    "          <p>Ce que tes publicités coûtent, ce qu'elles rapportent, et quoi faire ensuite.</p>\n"
    '        </div>\n'
    '        <div className="gx-pa">\n'
    '          <div className="gx-seg" role="tablist" aria-label="Période">',
    '      <PageHeader\n'
    '        title="Performance"\n'
    '        subtitle="Ce que tes publicités coûtent, ce qu\'elles rapportent, et quoi faire ensuite."\n'
    '        actions={<>\n'
    '          <div className="gx-seg" role="tablist" aria-label="Période">'),
   ('            </PopoverContent>\n          </Popover>\n        </div>\n      </div>\n',
    '            </PopoverContent>\n          </Popover>\n        </>}\n      />\n'),
   ('<span>{frShortDate(range.since)} → {frShortDate(range.until)}</span>',
    '<span className="gx-range-l">{frShortDate(range.since)}<ArrowRight className="gx-ii" aria-label="au" '
    '/>{frShortDate(range.until)}</span>'),
   ('function CalendarIcon() {\n'
    '  return (\n'
    '    <svg className="gx-i" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" '
    'strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">\n'
    '      <rect x="3" y="5" width="18" height="16" rx="3" /><path d="M3 10h18M8 3v4M16 3v4" />\n'
    '    </svg>\n'
    '  );\n'
    '}',
    'function CalendarIcon() {\n  return <Calendar className="gx-i" aria-hidden />;\n}')]),
 ('src/routes/reset-password.tsx',
  "Pastille « ! » de l'erreur → icône AlertCircle.",
  [('import { AuthShell, PasswordInput, passwordStrength, STRENGTH_HINT } from "@/components/auth/AuthShell";\n',
    'import { AuthShell, PasswordInput, passwordStrength, STRENGTH_HINT } from "@/components/auth/AuthShell";\n'
    'import { AlertCircle } from "@/components/icons";\n'),
   ('<div className="gxa-msg gxa-bad" role="alert"><i aria-hidden="true">!</i><p><b>{error}</b></p></div>',
    '<div className="gxa-msg gxa-bad" role="alert"><i aria-hidden="true"><AlertCircle className="gxa-ic" '
    '/></i><p><b>{error}</b></p></div>')]),
 ('src/routes/_authenticated/resultats.tsx',
  "L'onglet Ventes n'est plus titré « Leads » : il est titré « Ventes ».",
  [('        : <SalesView title="Leads" subtitle={subtitle} tabs={tabs} />}',
    '        : <SalesView title="Ventes" subtitle={subtitle} tabs={tabs} />}')]),
 ('src/components/ui/skeleton.tsx',
  'Le Skeleton shadcn prend la classe gx-skel : dans la console il devient gris (--gx-sunk) au lieu de violet ; '
  'ailleurs inchangé.',
  [('return <div className={cn("animate-pulse rounded-md bg-primary/10", className)} {...props} />;',
    'return <div className={cn("gx-skel animate-pulse rounded-md bg-primary/10", className)} {...props} />;')]),
 ('src/styles.css',
  'Import de gx-unify.css juste après gx-menu-chat.css.',
  [('@import "./styles/gx-menu-chat.css";\n',
    '@import "./styles/gx-menu-chat.css";\n@import "./styles/gx-unify.css";\n')])]

def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    check = "--check" in sys.argv
    root = args[0] if args else "."
    errors, results = [], []
    for path, note, edits in SPECS:
        fp = os.path.join(root, path)
        if not os.path.isfile(fp):
            errors.append(f"{path} : fichier introuvable"); continue
        src = open(fp, encoding="utf-8").read()
        s = src
        for i, e in enumerate(edits):
            old, new = e[0], e[1]
            want = e[2] if len(e) > 2 else 1
            n = s.count(old)
            if n != want:
                errors.append(f"{path} : bloc {i} trouve {n} fois (attendu {want}) : {old[:70]!r}")
                break
            s = s.replace(old, new)
        else:
            results.append((fp, s, path, note, len(edits)))
    if errors:
        print("ARRET : aucun fichier modifie.")
        for e in errors: print(" - " + e)
        sys.exit(1)
    for fp, s, path, note, n in results:
        if not check:
            open(fp, "w", encoding="utf-8").write(s)
        print(f"{'OK (verif)' if check else 'OK'} {path} ({n} blocs) - {note}")
    print(f"{len(results)} fichiers {'verifies' if check else 'modifies'}.")

if __name__ == "__main__":
    main()
