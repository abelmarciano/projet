# Passage 3c : Détail campagne, assistant /create/wizard, dossier de marque Batch

Suite de la refonte du design validée par le propriétaire (contrat commun : https://raw.githubusercontent.com/abelmarciano/projet/4fce08d872d7d2e90436fd303d84a612248ea298/landing/design/app/refonte/CONTRAT.md). Applique ce message uniquement après le passage précédent. Ne publie pas le site, aucun test sur le vrai compte ni sur les vraies conversations du propriétaire, aucune génération payante. Reprends le code fourni tel quel, sans rien réécrire à la main.

## Téléchargement (obligatoire avant tout)
Base : https://raw.githubusercontent.com/abelmarciano/projet/4fce08d872d7d2e90436fd303d84a612248ea298/landing/design/app/refonte/p3c/
Télécharge chaque fichier du tableau dans `/tmp/p3c/`, en gardant son chemin relatif. Vérifie les empreintes (16 premiers caractères du sha256). Le `$` dans les chemins s'encode `%24` dans l'URL.

| Fichier | sha256 |
|---|---|
| `scripts/apply.py` | 539e305da4322595 |
| `src/routes/_authenticated/batch/brand.$brandId.tsx` | eb63f53c21eb87df |
| `src/routes/_authenticated/campaigns/$id.tsx` | 4de1f1106de53d2f |

Lance les scripts depuis la racine du projet, avec leur chemin dans `/tmp/p3c/scripts/`.

## Contrôle avant de remplacer un fichier entier (remplace le contrôle d'empreinte d'origine décrit plus bas)
Les empreintes « d'origine » citées plus bas ont été calculées AVANT le passage 1, qui a modifié les lignes d'import des icônes. Pour chaque fichier à remplacer entièrement, lance plutôt :
`git diff 8d706afcd75acf55a14179f6c6aa0609033f6e7e -- <fichier>`
- Si le diff est vide, ou s'il ne montre que des lignes d'import passées de `"lucide-react"` à `"@/components/icons"` (passage 1) ou des changements faits par les passages précédents de cette refonte, remplace le fichier.
- S'il montre autre chose, arrête-toi pour ce fichier et signale-moi le diff.

Les scripts `apply.py` font des remplacements exacts et s'arrêtent d'eux-mêmes sans rien écrire si un bloc ne correspond pas. Dans ce cas, envoie-moi leur sortie telle quelle.

## Message détaillé du passage
# Refonte P3c : Détail campagne, Assistant /create/wizard, Dossier de marque Batch

## Contexte
Passage P3c de la refonte du design (voir le contrat commun). À appliquer **après P1 (icônes) et P2 (composants communs `src/components/console/`)**.
Trois écrans étaient encore à l'ancien style (classes Tailwind par défaut, boutons en dégradé, cartes shadcn). Ils passent dans la charte console `gx-*`, au même niveau que Campagnes (liste) et Batch (nouveau lot).
**Présentation uniquement** : aucune logique, aucun gestionnaire, aucun appel serveur, aucun lien et aucune donnée ne changent.

## Fichiers

Avant de remplacer un fichier, vérifie l'empreinte sha256 (16 premiers caractères) du fichier ACTUEL. Si elle diffère, **arrête-toi et signale-le** sans rien modifier.

| Fichier du projet | sha256 d'origine attendu | Action |
|---|---|---|
| `src/routes/_authenticated/campaigns/$id.tsx` | `a2e9601da39bc2ed` | remplacer entièrement par le fichier livré |
| `src/routes/_authenticated/batch/brand.$brandId.tsx` | `7b3d4945a77bbe78` | remplacer entièrement par le fichier livré |
| `src/routes/_authenticated/create.wizard.tsx` | `3a8953914d211f29` (avant P1) | lancer `scripts/apply.py` (11 remplacements exacts) |

Pour `create.wizard.tsx`, l'empreinte change après P1 (ligne d'import des icônes). Le script ne dépend pas de cette ligne. Il vérifie que chaque bloc d'origine est présent exactement une fois et s'arrête **sans rien écrire** dans le cas contraire.

```bash
sha256sum "src/routes/_authenticated/campaigns/\$id.tsx" "src/routes/_authenticated/batch/brand.\$brandId.tsx" | cut -c1-16
cp <livraison>/src/routes/_authenticated/campaigns/\$id.tsx           "src/routes/_authenticated/campaigns/\$id.tsx"
cp <livraison>/src/routes/_authenticated/batch/brand.\$brandId.tsx    "src/routes/_authenticated/batch/brand.\$brandId.tsx"
python3 <livraison>/scripts/apply.py .      # depuis la racine du projet
```

Dépendances (fournies par P1 et P2, à ne pas créer ici) : `@/components/icons` ; `@/components/console/PageHeader` (avec `back` et `eyebrow`), `@/components/console/ConsoleEmpty` et `@/components/console/ConsoleLoading` (`ConsoleSkeleton`). Déjà présents dans le projet : `@/components/ui/gx-controls` (`GxSelectTrigger`, `GxInput`, `GxTextarea`) et `@/components/ui/select`.

## Ce qui change à l'écran

**Détail campagne (/campaigns/$id)**
- `gx-page` et `PageHeader` : lien de retour « Retour » (toujours vers /dashboard), petit libellé « Campagne », nom et description. Le bouton « Importer des images » passe dans l'en-tête en primaire violet plat (`gx-btn gx-pri`), au lieu du dégradé fait main.
- « Images produit » : titre de section `.gx-sh` avec le nombre d'images, vignettes dans une `gx-box`. Le bouton de suppression (`gx-ib`) est **toujours visible** (avant, il n'apparaissait qu'au survol, donc jamais sur mobile).
- « Créations » : grille `gx-cgrid` / `gx-ccard` comme Créations, avec une étiquette Image ou Vidéo et un bouton « Télécharger » `gx-btn gx-sm`.
- Chargement : `ConsoleSkeleton`. États vides et « Campagne introuvable » : `ConsoleEmpty`.
- Textes : « Échec de l'upload » devient « Échec de l'envoi », « trop volumineux (max 10MB) » devient « trop lourd (10 Mo maximum) ».

**Assistant (/create/wizard)**
- `gx-page` et `PageHeader` avec un lien de retour « Mes créations » (/creations). Une seule carte `gx-box` contient la barre d'étapes `.gx-wsteps` (étape faite en vert, étape en cours mise en avant ; sur mobile, la barre défile jusqu'à l'étape en cours), le contenu et un pied `.gx-lot-f` (Retour, « Étape n / 4 », Suivant ou « Générer le prompt IA » en `gx-btn gx-pri`, sans dégradé).
- Cartes de format, de style et de type de visuel : `gx-kard`. La sélection est marquée par une bordure violette et un halo (`--gx-accent`), sans couleur emerald, amber ou fuchsia.
- Champs : `gx-fld` / `gx-lbl`, `GxSelectTrigger`, `GxInput`, `GxTextarea`. Le nombre de slides passe en `gx-seg`. Le produit ou l'avatar verrouillé s'affiche en `gx-chip gx-on`, et l'ajout d'images dans un encadré `gx-drop`.
- Étape 5 : bandeau de format neutre, pastilles `gx-chip` (« Reco IA » avec l'icône Sparkles, sans emoji), inspiration en `gx-note` (sans 🎯), qualité en deux boutons `gx-btn` / `gx-pri` avec l'icône Zap (sans ⚡), séquences, slides et prompt en `gx-box`. « Régénérer le prompt » et « Lancer la génération » passent dans le pied de carte, à côté de « Modifier le brief ».
- Textes : plus d'emoji dans les toasts (✨, 🔒) ; « Donnez un nom à votre création. » devient « Donne un nom à ta création. » et « Nommez… » devient « Nomme… » ; « optionnel » devient « facultatif » ; « CTA » devient « appel à l'action » dans les exemples.

**Dossier de marque Batch (/batch/brand/$brandId)**
- `gx-page` et `PageHeader` : retour « Tous les dossiers » (/batch), petit libellé « Dossier de marque », nom et domaine. Actions : « Supprimer la marque » (bouton existant) et « Nouveau lot pour cette marque » en `gx-btn gx-pri`.
- « Images de la marque » et « Déjà couvert » deviennent des sections `.gx-sh` avec `gx-box`. Les produits et les angles s'affichent en `gx-chip`, et le récapitulatif (lots, produits, angles, scènes) passe à côté du titre.
- La liste des lots (`BatchList`, inchangée) a désormais un titre « Lots de la marque ». Chargement : `ConsoleSkeleton`.

## Vérifications à faire
1. `npm run typecheck` (ou `tsc --noEmit`) puis `npm run build` : aucune erreur.
2. Rendu à 1440 px et à 390 px, en clair et en sombre, sur les trois écrans : /campaigns/<id>, /create/wizard (étapes 1 à 5, avec vidéo, image et carrousel) et /batch/brand/<id>. Aucun défilement horizontal, aucune couleur claire en mode sombre.
3. Contrôle rapide des actions : import et suppression d'une image produit, téléchargement, navigation entre les étapes, sélection d'un produit ou d'un avatar, traduction, modification du prompt et des slides, liens de retour.
4. **Ne teste pas sur le vrai compte** : aucune génération payante (ne clique pas sur « Lancer la génération »), aucune suppression de marque réelle.
5. **Ne publie pas.**


Termine par : fichiers modifiés, sortie des scripts, typecheck et build, et tout ce qui n'a pas pu être appliqué.
