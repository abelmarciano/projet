# P2 : composants communs et une seule famille de boutons

## Contexte

La console mélange aujourd'hui plusieurs styles de bouton : dégradé, noir, violet et shadcn. Elle répète aussi à la main les en-têtes de page, les états vides, les chargements et les confirmations. Ce lot apporte :

- les composants communs prévus par `CONTRAT.md` (`src/components/console/`) ;
- une feuille `gx-unify.css` qui ramène tous les boutons à une seule famille : violet plat, rouge pour la suppression, neutre ;
- l'adoption de ces composants dans les pages qui ne relèvent pas de P3.

On ne touche ni à la logique, ni aux appels serveur, ni aux liens, ni aux données. On ne touche pas non plus aux pages marketing ni au logo.

**Ordre : P1 doit être appliqué avant P2.** P1 apporte `src/components/icons.tsx` et réécrit les imports `lucide-react`. Les pages de P2 sont donc livrées sous forme de remplacements exacts, qui restent valables après P1.

## 1. Fichiers neufs à copier tels quels

| Fichier | Rôle |
|---|---|
| `src/components/console/PageHeader.tsx` | En-tête de page : retour, sur-titre, titre, sous-titre, actions |
| `src/components/console/BackLink.tsx` | Lien de retour commun, en haut à gauche |
| `src/components/console/ConsoleEmpty.tsx` | État vide, avec une variante compacte |
| `src/components/console/ConsoleLoading.tsx` | Chargement (page, bloc, en ligne) et squelettes (liste, cartes, tableau) |
| `src/components/console/ConsoleSkeleton.tsx` | Ré-export de ConsoleSkeleton |
| `src/components/console/ConfirmDialog.tsx` | Confirmation unique : violette, ou rouge si `danger` |
| `src/components/console/StatTile.tsx` | Tuile de chiffre clé |
| `src/components/console/index.ts` | Exports |
| `src/styles/gx-unify.css` | Boutons, composants communs, fenêtres, menus, tuiles, couleur du menu |

## 2. Fichier entièrement remplacé

| Fichier | sha256 d'origine (16 caractères) |
|---|---|
| `src/components/ui/button.tsx` | `30f75820f1fa0549` |

Vérifie l'empreinte avant de remplacer le fichier. Si elle diffère, arrête-toi et signale-le. Le seul changement : le composant pose `data-slot="button"`, `data-variant` et `data-size`, ce qui permet à `gx-unify.css` de l'habiller dans `.console-app`. Les pages marketing gardent leur rendu.

## 3. Remplacements exacts dans les pages

Depuis la racine du projet, après P1 et après avoir copié les fichiers des sections 1 et 2 :

```
python3 scripts/apply.py --check   # vérifie sans rien écrire
python3 scripts/apply.py           # applique
```

Le script vérifie que chaque bloc est trouvé exactement une fois dans chaque fichier. S'il en manque un, il s'arrête sans rien écrire et liste les écarts. Dans ce cas, signale-le au lieu de corriger à la main.

Le script a été testé sur une copie des originaux, avant P1 puis après P1. Il ajoute aussi `@import "./styles/gx-unify.css";` dans `src/styles.css`, juste après la ligne de `gx-menu-chat.css`.

| Fichier | Blocs | Ce qui change |
|---|---|---|
| `src/components/insights/AiAnalysisView.tsx` | 2 | Chargement en squelette (fin du texte + style en ligne) ; états vides/erreur via ConsoleEmpty. |
| `src/components/batch/BatchList.tsx` | 6 | Suppression d'un lot : bouton rouge (ConfirmDialog danger) au lieu de violet ; « Régénérer le plan » : ConfirmDialog au lieu de window.confirm ; chargement en squelette ; état vide commun, « Nouveau lot » en violet plat. |
| `src/components/ContinueVideoDialog.tsx` | 4 | Symbole ⚡ des crédits → icône Zap ; fenêtre habillée console (console-app-portal) ; boutons via le <Button> harmonisé. |
| `src/components/CreateActorDialog.tsx` | 2 | Emoji ✨ retiré du toast « Acteur créé » ; fenêtre habillée console (console-app-portal). |
| `src/components/editor/EditorProjectsGallery.tsx` | 8 | En-tête via PageHeader ; chargement des projets en squelette (fini les cartes « Chargement… ») ; corbeille et états vides communs ; suppressions via ConfirmDialog rouge (fin de la chaîne bg-destructive) ; « Nom A → Z » → « Nom (A à Z) ». |
| `src/components/guide-meta/GuideMeta.tsx` | 9 | Pastilles ✓ / ! / i, flèches ← → ↗ et coche des boutons remplacées par des icônes ; « Créer ma première pub » en violet plat (fin de gm-grad). |
| `src/components/guide-meta/GuideMetaCard.tsx` | 2 | Icône livre faite main remplacée par BookText. |
| `src/components/connexion/GuideMetaPanel.tsx` | 5 | Icône livre faite main → BookOpen ; flèches « → » et coches « ✓ » → ArrowRight / Check. |
| `src/components/insights/PerformanceView.tsx` | 13 | Carte Leads coupée (style en ligne retiré, coût sous le chiffre), états vides/chargement communs, icônes faites main et symboles ✓ ↑ ↓ remplacés. |
| `src/components/results/SalesView.tsx` | 8 | En-tête via PageHeader ; chiffres en squelette pendant le chargement ; tableau en squelette ; l'erreur n'est plus confondue avec « aucune donnée » (message d'erreur + Réessayer) ; états vides communs. |
| `src/components/insights/TopAdsView.tsx` | 2 | Chargement en squelette de cartes (au lieu d'un texte) ; états vides et erreur via ConsoleEmpty. |
| `src/routes/_authenticated/aide.tsx` | 21 | En-tête via PageHeader (« Visite guidée » n'est plus un bouton primaire) ; fenêtre « Écrire au support » en champs et boutons gx (fini Label/Input/Textarea/Button shadcn) ; FAQ mise à jour (navigation actuelle : Connexion Meta, cloche de la barre du haut, Galerie → Créer un acteur) et sans anglicismes (workspace, copy, switcher, prompt, sidebar) ; « ✓ » retiré du toast ; × → icône ; état vide commun. |
| `src/routes/auth.tsx` | 5 | Enveloppe faite main → icône Mail ; pastilles ✓ / ! et flèche ← → Check / AlertCircle / ArrowLeft (logo Google conservé). |
| `src/routes/_authenticated/batch/$id.tsx` | 10 | PageHeader : le titre est le nom du lot (plus « Batch Studio »), retour « Mes lots » en haut à gauche, « Nouveau lot » en violet plat ; chargement commun (fini le titre « Chargement du lot… ») ; lot introuvable / analyse échouée via ConsoleEmpty ; deux window.confirm remplacés par ConfirmDialog. |
| `src/routes/_authenticated/batch/index.tsx` | 3 | En-tête via PageHeader ; « Nouveau lot » en violet plat (même style que « Commencer un lot ») ; chargement en squelette ; état vide commun. |
| `src/routes/_authenticated/batch/new.tsx` | 2 | Retour « Mes lots » déplacé en haut à gauche via PageHeader (il était à droite, comme une action). |
| `src/routes/_authenticated/campaigns/index.tsx` | 10 | En-tête via PageHeader, « Nouvelle campagne » en violet plat (fin du dégradé) ; squelette KPI aux jetons (fin du Tailwind animate-pulse bg-muted) ; lignes de chargement et vérification Meta via ConsoleLoading ; états vides et erreurs via ConsoleEmpty ; confirmations via le ConfirmDialog commun ; « Supprimer les brouillons vides » en rouge. |
| `src/routes/_authenticated/campaigns/new.tsx` | 9 | Retour intégré à PageHeader ; pastilles inclusion/exclusion en jetons (lisibles en sombre) ; tutoiement (« Tes publicités », « ton-site.com », « Ta Page ») ; squelette et état vide communs ; boutons d'action en une colonne sur mobile. |
| `src/routes/_authenticated/connexions.tsx` | 8 | En-tête via PageHeader (fin du conteneur d'actions vide) ; icônes faites main Ico / IC_* remplacées (logos Meta et Facebook conservés) ; flèches ↓ ↗ en icônes ; « ✓ » retiré du toast ; déconnexions Meta et Shopify via ConfirmDialog rouge (fin de la chaîne bg-destructive). |
| `src/routes/_authenticated/creations.tsx` | 16 | En-tête via PageHeader (plus de style en ligne sur « Importer ») ; icônes faites main (Svg/Ic*) remplacées ; coches ✓ des menus → Check ; « ← Tous les lots » → bouton retour commun ; chargement en squelette ; états vides/erreur communs ; 4 window.confirm (lot, création, dossier, sélection) → ConfirmDialog rouge. |
| `src/routes/_authenticated/dashboard.tsx` | 21 | Icônes faites main (synchro, plus, micro, flèche, coche) remplacées ; symboles ↗ ✦ ⏸ ✓ → et ⚡ remplacés par des icônes ; chargement des conseils en squelette (fini « Analyse de tes chiffres… ») ; états vides communs ; « Lancer » en violet plat (via gx-unify.css) ; tutoiement de la description de page ; libellé masqué via gx-sr. |
| `src/routes/_authenticated/editeur.tsx` | 4 | Chargement de l'éditeur via PageHeader + ConsoleLoading ; écran « Passe sur ordinateur » via ConsoleEmpty ; description au tutoiement. |
| `src/routes/_authenticated/galerie.tsx` | 16 | En-tête via PageHeader ; icônes faites main (plus, chevron, étoile, loupe, ···) remplacées ; « ★ Mes favoris » → icône Star pleine ; « ⚡ » des crédits → Zap ; suppression d'un acteur : ConfirmDialog rouge au lieu de window.confirm ; tuiles de chargement qui pulsent ; états vides communs. |
| `src/routes/_authenticated/guide-meta.tsx` | 2 | « ← Retour à Connexion » (à droite, flèche en texte) devient le retour commun en haut à gauche (PageHeader back). |
| `src/routes/_authenticated/inspiration.tsx` | 8 | En-tête via PageHeader ; « Mes favoris » devient une puce (gx-chip + aria-pressed) au lieu d'un bouton primaire ; icônes faites main (chevron, étoile, étincelle) et symboles ★ ↗ ▶ remplacés ; chargement en squelette, états vides communs ; vignettes avec reflet de chargement (media-shimmer). |
| `src/routes/_authenticated/ma-marque.tsx` | 10 | Icônes faites main (composant Svg + table IC) remplacées par les icônes communes ; coches ✓ → Check ; chargements via ConsoleLoading (fini l'état vide utilisé comme chargeur) ; états vides gx-mq-emptys → ConsoleEmpty. |
| `src/routes/_authenticated/parametres/facturation.tsx` | 5 | Symbole ⚡ des crédits → icône Zap ; « workspaces » → « espaces de travail » ; un seul bouton primaire (« Acheter des crédits » passe en secondaire, « Changer d'offre » reste violet) ; état vide commun dans l'historique. |
| `src/routes/_authenticated/parametres/marques.tsx` | 4 | Icône « plus » faite main → Plus ; chargement des marques en tuile qui pulse ; suppression d'une marque en rouge via gx-danger. |
| `src/routes/_authenticated/parametres/membres.tsx` | 10 | « Retirer de l'espace de travail » demande maintenant une confirmation (ConfirmDialog rouge) ; icônes faites main (⋯, plus) remplacées ; chargement et état vide communs ; « workspace » → « espace de travail ». |
| `src/routes/_authenticated/parametres/profil.tsx` | 4 | Icône corbeille faite main → Trash2 ; « ✓ » retiré du toast ; bouton « Supprimer définitivement » en rouge via gx-danger. |
| `src/routes/_authenticated/parametres/route.tsx` | 3 | En-tête via PageHeader (fin du conteneur d'actions vide) ; onglet « Workspace » renommé « Espace de travail » (lien inchangé). |
| `src/routes/_authenticated/parametres/securite.tsx` | 4 | Désactivation de la 2FA : ConfirmDialog rouge au lieu de window.confirm. |
| `src/routes/_authenticated/parametres/workspace.tsx` | 15 | Textes « workspace » → « espace de travail » ; icônes faites main (chevron, corbeille) remplacées ; bouton « Supprimer » de la confirmation en rouge via gx-danger (fin de la chaîne bg-destructive). |
| `src/routes/_authenticated/performance.tsx` | 5 | En-tête via PageHeader ; icône calendrier faite main et flèche « → » remplacées par Calendar / ArrowRight. |
| `src/routes/reset-password.tsx` | 2 | Pastille « ! » de l'erreur → icône AlertCircle. |
| `src/routes/_authenticated/resultats.tsx` | 1 | L'onglet Ventes n'est plus titré « Leads » : il est titré « Ventes ». |
| `src/components/ui/skeleton.tsx` | 1 | Le Skeleton shadcn prend la classe gx-skel : dans la console il devient gris (--gx-sunk) au lieu de violet ; ailleurs inchangé. |
| `src/styles.css` | 1 | Import de gx-unify.css juste après gx-menu-chat.css. |

Ne sont pas dans ce lot, car ils relèvent de P3 :

- `create.tsx`, onboarding, souscription, paiement-refusé ;
- le détail d'une campagne, `create.wizard`, le dossier marque de Batch ;
- l'éditeur vidéo et ses panneaux ;
- les dialogues Concat, Crop, Split, Trim et Subtitles (P3d) ;
- l'admin.

Le surlignage « Chat » sur /creations est traité par l'orchestrateur.

## Changements visibles

- **Boutons.** Un seul bouton principal, en violet plat. Le dégradé (`gx-grad`, `gx-go`, `bg-grad`) et le noir utilisés comme bouton principal sont neutralisés. Les suppressions sont en rouge (`gx-danger`). Les boutons discrets (`gx-ghost`) ont un survol neutre. Le `<Button>` shadcn suit la même famille dans la console.
- **Composants communs.** En-têtes de page, retours en haut à gauche, états vides, squelettes de chargement et confirmations sont identiques partout. Les `window.confirm` deviennent des fenêtres de confirmation.
- **Confirmations nouvelles.** « Retirer de l'espace de travail » (membres) et la désactivation de la 2FA demandent maintenant une confirmation. L'action appelée reste la même.
- **Fenêtres et menus.** Dialog, AlertDialog, Sheet et menus déroulants ont la même surface, la même bordure et le même voile. Une confirmation s'affiche au-dessus d'un tiroir.
- **Tuiles de chiffres.** Même taille de chiffre partout. La carte Leads de Performance n'est plus coupée.
- **Icônes.** Les icônes dessinées à la main, les emojis et les symboles (⚡ ★ ▶ ✓ ! flèches) sont remplacés par les icônes de `@/components/icons`. Les logos (Meta, Google, Shopify, Growthity) et les drapeaux de PhoneInput sont conservés. Le trait des icônes passe de 1,5 à 1,75.
- **Menu.** Nouvelle encre `--gx-nav-ink` : #3A3F4B en clair, #C4C8D1 en sombre. Elle s'applique aux entrées au repos, aux titres de groupe (70 %) et aux onglets mobiles. Contraste mesuré : entrées 10,5:1 en clair et 10,9:1 en sombre ; titres de groupe 4,6:1 en clair et 5,7:1 en sombre.
- **Textes.** Tutoiement, « espace de travail » au lieu de « workspace », onglet Ventes titré « Ventes », chips lisibles en sombre dans campaigns/new.

## Vérifications

- Typecheck et build sans erreur.
- Rendu à 1440 px et 390 px, en clair et en sombre, sur ces pages :
  - tableau de bord, créations, galerie, inspiration, ma marque ;
  - performance (carte Leads), résultats ;
  - campagnes (liste et création), Batch (liste, lot, nouveau) ;
  - connexions, guide Meta, aide, éditeur ;
  - paramètres (tous les onglets), auth.
- À vérifier sur ces rendus :
  - pas de défilement horizontal ;
  - un seul bouton violet par zone ;
  - les suppressions sont en rouge ;
  - le menu est lisible.
- Ouvre une confirmation : Annuler doit la fermer sans rien faire.
- **Pas de test sur le vrai compte**, aucune génération payante, aucune suppression réelle, **ne publie pas**.
