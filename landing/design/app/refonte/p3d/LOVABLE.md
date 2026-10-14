# Refonte P3d : outils de montage et 3 pages admin

## Contexte
On passe dans la charte console les derniers écrans à l'ancien style :
- l'éditeur vidéo (panneaux de gauche et fenêtres) ;
- les fenêtres de montage Rogner, Recadrer, Scinder, Assembler et Sous-titres ;
- les pages admin Model Lab, Grille tarifaire et Voice Lab.

Ce passage s'applique **après P1 (icônes) et P2 (composants communs `src/components/console/*`)**. Il s'appuie sur `@/components/icons`, `ConfirmDialog` et `ConsoleEmpty` (P2), ainsi que sur `GxSelectTrigger` (`src/components/ui/gx-controls.tsx`, déjà présent).

Seule la présentation change. Aucune logique de montage (timeline, lecture, rendu, export, sauvegarde), aucun appel serveur, aucune action admin et aucun lien ne sont modifiés.

## 1. Fichiers à remplacer entièrement
Avant de copier chaque fichier, vérifie l'empreinte sha256 de la version actuelle (16 premiers caractères) avec `sha256sum <fichier> | cut -c1-16`. Si une empreinte ne correspond pas, **arrête-toi et signale-le** sans rien copier pour ce fichier.

| Fichier | sha256 d'origine attendu |
|---|---|
| `src/components/TrimVideoDialog.tsx` | `e17aec5e5afd4846` |
| `src/components/CropVideoDialog.tsx` | `fde198b8821d4124` |
| `src/components/SplitVideoDialog.tsx` | `f19b4a82f08e8377` |
| `src/components/ConcatVideosDialog.tsx` | `99a560dfe091b857` |
| `src/components/SubtitlesDialog.tsx` | `0c4bb6f7bc8c046f` |
| `src/routes/admin/model-lab.tsx` | `a2619cfff36ae01a` |
| `src/routes/admin/pricing.tsx` | `1573e49c13202efe` |
| `src/routes/admin/voice-lab.tsx` | `2517f184082e8a85` |

Si P1 a déjà remplacé `from "lucide-react"` par `from "@/components/icons"` dans ces fichiers, l'empreinte aura changé pour cette seule raison. Dans ce cas, compare la version actuelle à celle du commit de base `8d706af` : si la seule différence est cette ligne d'import, tu peux copier le fichier.

## 2. Nouveaux fichiers
- `src/styles/gx-montage.css` : classes `gx-mt-*` pour les panneaux et les fenêtres de montage.
- `src/styles/gx-admin-labs.css` : classes `ad-lab-*`, `ad-pr-*` et `ad-vl-*`, limitées à `.gx-ad`.

## 3. Scripts (à lancer depuis la racine du projet)
```
python3 scripts/apply.py src/components/editor/VideoEditor.tsx
python3 scripts/styles-imports.py src/styles.css
```
- `apply.py` fait 18 remplacements exacts dans `VideoEditor.tsx` (empreinte d'origine : `2730f05f6da9e11b`). Chaque bloc doit être trouvé exactement une fois ; sinon le script s'arrête sans rien écrire. Il ne touche pas la ligne d'import des icônes.
- `styles-imports.py` ajoute les imports des deux nouvelles feuilles de style juste après `@import "./styles/gx-sidebar-fit.css";`. Il ne fait rien si les imports sont déjà présents.

Si un script s'arrête, **ne corrige rien à la main** : signale le message affiché.

## Ce qui change à l'écran
**Éditeur vidéo, panneaux de gauche**
- Les panneaux Mes assets, Banque de médias, Transitions, Sous-titres et Voix off IA, ainsi que les styles animés de l'inspecteur, utilisent maintenant :
  - les champs `gx-in` et les filtres `gx-chip` ;
  - les onglets `gx-seg` (Images / Vidéos / GIF / Stickers) ;
  - les boutons `gx-btn`. Les boutons « Générer » sont en `gx-pri`, et « Arrêter » l'enregistrement est en `gx-danger`.
- Vignettes, cartes d'aperçu et squelettes de chargement sont redessinés avec les jetons. Une carte sélectionnée est cerclée de violet.
- Les fonds sombres en dur des aperçus de texte et de sous-titres sont remplacés par la « scène » `--studio`.
- L'onglet « Stock » devient « Banque ».

**Éditeur vidéo, en-tête et fenêtres**
- En-tête : les boutons Projets, Retour à la discussion, Exporter et Télécharger sont des `gx-btn` natifs, au même rendu.
- « Enregistré ✓ » devient « Enregistré ».
- Les fenêtres « modifications non enregistrables » et « Raccourcis clavier » prennent le style `gx-adlg`.

**Fenêtres de montage (Créations et Chat)**
- Rogner, Recadrer, Scinder, Assembler et Sous-titres ont toutes :
  - une surface `gx-adlg` avec un titre muni d'une icône ;
  - une vidéo sur fond scène ;
  - des boutons `gx-btn` (action principale en `gx-pri`) ;
  - des listes avec un déclencheur `gx-sel` ;
  - un bandeau « Lancement du rendu… » unifié.
- Les toasts n'ont plus d'emoji (✂️ 🖼️ 🎬 ✨).
- Sous-titres :
  - l'état vide utilise `ConsoleEmpty` ;
  - « ▶ voir » devient un bouton « Voir » avec une icône ;
  - la suppression de la configuration passe par `ConfirmDialog` (rouge) au lieu de la boîte `confirm()` du navigateur. Elle fait la même chose.
- Textes au tutoiement, sans anglicisme : « upscale » et « fal.ai » sont retirés.

**Admin**
- Model Lab :
  - mise en page `ad-page` et `ad-card` ;
  - sélecteur Vidéo / Image en `ad-seg`, champs `ad-ta`, `ad-inp` et `ad-sel`, modèles en `ad-chipf` ;
  - statuts en `ad-pill ok/warn/bad`, et pastille Vidéo / Image avec icône à la place des emojis 🎬 / 🖼️ ;
  - « batch » devient « lot » ou « comparatif ».
- Grille tarifaire :
  - l'en-tête de page s'affiche aussi pendant le chargement (`ad-loading`) ;
  - le sous-titre n'est plus répété ;
  - les pastilles Stripe et de ratio de marge sont en `ad-pill` ;
  - les deux grilles deviennent des tableaux `ad-table`, avec défilement horizontal interne et sans défilement de la page à 390 px.
- Voice Lab : cartes `ad-card` par voix, bouton `ad-btn`, chargement `ad-loading` et état vide.

## Vérifications à faire
1. `npx tsc --noEmit` et `npm run build` sans erreur.
2. Rendu à 1440 px et à 390 px, en clair et en sombre, sans défilement horizontal de la page, pour :
   - `/editeur` (ouvre un projet, parcours chaque outil du panneau gauche, l'inspecteur d'un texte et la touche « ? ») ;
   - les fenêtres Rogner, Recadrer, Scinder, Assembler et Sous-titres depuis Créations ;
   - `/admin/model-lab`, `/admin/pricing` et `/admin/voice-lab`.
3. Vérifie que glisser-déposer un asset sur la timeline, choisir une transition ou un style de sous-titre, rogner avec les poignées, et enregistrer un tarif fonctionnent comme avant.

Ne fais aucun test sur le vrai compte, ne lance aucune génération payante (voix, transcription, rendu, comparatif) et ne publie pas.
