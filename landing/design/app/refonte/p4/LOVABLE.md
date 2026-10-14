# P4 : nettoyage sûr de `src/styles/gx-console.css` (rendu identique)

## Contexte
C'est le dernier passage de la refonte, à appliquer après P1, P2 et P3. Les passages précédents ajoutent des feuilles nouvelles mais ne modifient pas `gx-console.css`.

Ce passage retire uniquement ce qui est prouvé sans effet :
- 52 déclarations écrasées plus loin par le même sélecteur, dans le même contexte ;
- les 12 règles que ces retraits laissent vides.

Rien d'autre ne change : aucune valeur, aucun ordre, aucune fusion. Le fichier passe de 1 853 à 1 841 lignes.

## Fichier
- `src/styles/gx-console.css` : **remplacement complet**. Empreinte sha256 de l'ORIGINE attendue : `da0ac161afbf516e`.

## Comment appliquer (une des deux façons)
1. **Avec le script (recommandé)** : `python3 scripts/apply.py src/styles/gx-console.css`
   - Le script vérifie l'empreinte d'origine, puis applique 25 remplacements exacts.
   - Chaque bloc doit être trouvé une seule fois. Sinon le script s'arrête sans rien écrire et l'indique.
2. **Copie directe** : copie `src/styles/gx-console.css` de ce dossier, seulement si l'empreinte du fichier actuel est bien `da0ac161afbf516e`. Si elle diffère, arrête-toi et signale-le.

## Ce qui change visuellement
**Rien.** C'est un nettoyage sans effet sur le rendu.

## Vérifications à faire
- Typecheck et build : `tsc --noEmit` puis le build habituel. La CSS doit compiler sans avertissement nouveau.
- Rendu à 1440 et 390 px, en clair et en sombre (`.dark .console-app`), à comparer avec avant. Pages à regarder :
  - Accueil ;
  - Chat ;
  - Créations ;
  - Campagnes (tableau `#ctab`) ;
  - Éditeur vidéo (en-tête, aperçu) ;
  - Paramètres ;
  - un toast.
- Points à regarder de près :
  - les boutons violets `.gx-btn.gx-pri` et leur survol ;
  - les bulles « toi » du Chat ;
  - l'avatar IA ;
  - le badge du menu ;
  - le champ de recherche des conversations ;
  - les pastilles Meta/Shopify (`.gx-lg`) ;
  - l'en-tête de l'éditeur.
- Ne fais aucun test sur le vrai compte, ne lance aucune génération payante, ne publie pas.

## À ne pas faire dans ce passage
- Ne corrige pas les points listés comme « non appliqués » dans `RAPPORT.md` (largeurs maximales annulées, `height:auto` mobile de `.gx-pv` jamais appliqué, couleurs en dur, `hsl()` d'autres feuilles). Ils changent le rendu et demandent une décision à part.
