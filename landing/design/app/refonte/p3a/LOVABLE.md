# P3a — Chat (/create) : remise dans la charte console

**Contexte.** Passage P3a de la refonte. Il s'applique APRÈS P1 (icônes `@/components/icons`) et P2 (composants communs `src/components/console/` : `ConsoleEmpty`, `ConsoleLoading`/`ConsoleSkeleton`, `ConfirmDialog`, `StatTile`). Uniquement de la présentation : aucune logique, aucun gestionnaire, aucun appel serveur, aucun lien et aucune donnée ne changent. Les éléments refaits récemment ne sont pas touchés : rangée `.gx-ctx` / `AttachChip`, pastille `ConversationBrandBar`, en-tête et groupes de la liste des conversations, `ConversationRow`, `ChatComposer`.

## Fichiers à copier (remplacement complet)
Avant de copier, vérifie l'empreinte sha256 (16 premiers caractères) du fichier ACTUEL. Si elle ne correspond pas, **arrête-toi et signale-le** (le fichier a changé depuis la base `8d706afc`).

| Fichier livré → destination | sha256 d'origine attendu |
|---|---|
| `src/components/chat/StrategyCard.tsx` | `171fed0f1bf8cdbe` |
| `src/components/chat/SelectionPicker.tsx` | `e55f3b431a6fd32b` |
| `src/components/chat/VideoChainProgress.tsx` | `256073686eb6e7c5` |
| `src/components/chat/CompetitorAdsCard.tsx` | `0a98452b2b71ad27` |
| `src/components/insights/ChatPerformanceTable.tsx` | `2c9958ade313d00b` |

Remarque : si P1 a déjà remplacé `from "lucide-react"` par `from "@/components/icons"` dans ces 5 fichiers, l'empreinte actuelle diffère pour cette seule raison. Dans ce cas, compare après avoir remis temporairement la ligne d'import lucide d'origine ; si c'est la seule différence, copie le fichier livré.

Fichier neuf : `src/styles/gx-chat-blocks.css` (styles des sous-blocs du Chat, jetons `--gx-*` uniquement).

## Script pour create.tsx (9 812 lignes)
Depuis la racine du projet, après avoir copié `src/styles/gx-chat-blocks.css` :

```bash
python3 scripts/apply.py --check   # vérifie, n'écrit rien
python3 scripts/apply.py           # applique
```

- 131 remplacements exacts dans `src/routes/_authenticated/create.tsx` ; chaque bloc d'origine doit être trouvé exactement une fois, sinon le script s'arrête sans rien écrire (signale-le alors). Aucun bloc ne dépend de la ligne d'import `lucide-react`.
- Le script ajoute aussi `@import "./styles/gx-chat-blocks.css";` après la dernière ligne `@import "./styles/…"` de `src/styles.css`.
- Nouveaux imports ajoutés en tête de `create.tsx` : `ConsoleEmpty`, `ConsoleLoading`, `ConsoleSkeleton`, `ConfirmDialog` (depuis `@/components/console/<Nom>`) et `AlertTriangle` (depuis `@/components/icons`). Si P2 n'a pas créé ces fichiers, arrête-toi et signale-le.

## Ce qui change à l'écran
- Plus aucun `<Button>` shadcn dans le Chat : `.gx-btn` / `.gx-pri` / `.gx-ghost`, `.gx-ib` pour les boutons icônes.
- Historique de la discussion : panneau console (`gx-seg` pour les filtres, frise aux jetons, état vide `ConsoleEmpty`). « Vous » devient « Toi ».
- Choix proposés par l'IA : options plates en bordure fine (plus de cartes grises avec ombre), champs « Précise ta réponse » et date de lancement en `gx-in`.
- Plus de couleurs Tailwind par défaut (fuchsia, emerald, amber, sky…) : pastilles et vignettes de style dessinées avec les jetons ; drapeaux emoji remplacés par les codes langue (FR, EN…).
- Crédits : `⚡` remplacé par l'icône `Zap` ; `⚠️`, `✎`, `✅`, `✨`, `👍`, `🙏`, `📎`, `🖼️` retirés (icônes ou texte seul). « Upload impossible » devient « Envoi impossible ». Tutoiement : « Ta Page », « Aperçu de ta publicité », objectifs Meta au tutoiement.
- Chargements unifiés (`ConsoleLoading`, `ConsoleSkeleton`, pastille `gx-tool-wait`) ; états vides unifiés (`ConsoleEmpty`).
- « Reformuler avec l'IA » après modification : `ConfirmDialog` au lieu de `window.confirm` (même comportement).
- Tableaux leads et performances en `gx-tbl` ; chiffres en `StatTile`.

## Vérifications
1. `npm run typecheck` (ou `tsc --noEmit`) puis `npm run build` : aucune nouvelle erreur.
2. Rendu de /create à 1440 px et 390 px, en clair ET en sombre : pas de défilement horizontal, contrastes corrects (fil, historique, sélecteur catalogue, veille concurrentielle, tableau leads).
3. Ne fais AUCUN test sur le vrai compte, ne lance AUCUNE génération payante, ne publie rien.
