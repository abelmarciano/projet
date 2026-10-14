# P3a — Chat (/create) : script v2 pour create.tsx

**Contexte.** La première version de `scripts/apply.py` s'est arrêtée sans rien écrire (bloc 11 introuvable) : `create.tsx` a changé depuis (contrôle de l'image après génération, questions bloquantes, produits du catalogue joints). Les 5 composants de P3a et `src/styles/gx-chat-blocks.css` sont **déjà en place** : ne les recopie pas. Il reste seulement `create.tsx` et l'import CSS.

`scripts/apply-v2.py` remplace `apply.py`. Il a été préparé et testé sur `create.tsx` au commit `f5aad08762f7b0663519e12746be32699fa37403`. Il fait uniquement de la présentation : aucune logique, aucun gestionnaire, aucun appel serveur ne change. Toute la logique récente est conservée telle quelle.

## Commandes (depuis la racine du projet)

```bash
python3 scripts/apply-v2.py --check   # vérifie, n'écrit rien
python3 scripts/apply-v2.py           # applique
```

- 131 remplacements exacts dans `src/routes/_authenticated/create.tsx`. Chaque bloc d'origine doit être trouvé exactement une fois, sinon le script s'arrête sans rien écrire. **Dans ce cas, signale-le et ne corrige pas à la main.**
- Le script ajoute `@import "./styles/gx-chat-blocks.css";` dans `src/styles.css`, après la dernière ligne `@import "./styles/…"`, seulement si la ligne manque. Elle manque au commit `f5aad087`.
- Si tu le relances après l'avoir appliqué, il s'arrête sans rien écrire : « déjà converti ».

## Ce qui change par rapport à la v1

- **129 blocs gardés tels quels.**
- **2 blocs réécrits** à partir du code actuel :
  - **Bloc 11**, toast de fin d'image : « Image créée et vérifiée ✨ » devient « Image créée et vérifiée ». Le nouveau contrôle (`qaIssues`, avertissement « Image livrée, mais contrôle incomplet… ») est conservé.
  - **Bloc 126**, pied de la fenêtre « Choisir un visuel ou un acteur » : il passe en `gx-btn` / `gx-pri`, comme en v1. On garde le nouvel argument `products` de `onConfirm`, qui transmet les produits du catalogue joints.
- **Aucun bloc supprimé.**
- **Nouveaux éléments d'interface ajoutés depuis** : aucun n'utilise l'ancien style. Le bouton « Edit », le groupe « Conversations » et la carte produit sont déjà en classes `gx-*`. Les questions bloquantes ne changent que de la logique dans `create.tsx`. Aucun remplacement supplémentaire n'est nécessaire.

Ce qui change à l'écran est décrit dans `LOVABLE.md` (section « Ce qui change à l'écran ») et reste valable.

## Vérifications

1. `npm run typecheck` (ou `tsc --noEmit`) puis `npm run build` : aucune nouvelle erreur.
2. Rendu de /create à 1440 px et à 390 px, en clair ET en sombre : pas de défilement horizontal, contrastes corrects (fil, historique, sélecteur catalogue, veille concurrentielle, tableau des leads).
3. Ne fais AUCUN test sur le vrai compte, ne lance AUCUNE génération payante, ne publie rien.
