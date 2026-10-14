# P4 — Nettoyage de `src/styles/gx-console.css`

Base : commit `8d706afcd75acf55a14179f6c6aa0609033f6e7e`.
Fichier d'origine : sha256 `da0ac161afbf516e` (complet : `da0ac161afbf516e0291f821279ac4e420960b8e1b97ca962d53ab5494c02110`), 1 853 lignes, 145 025 octets.
Fichier nettoyé : 1 841 lignes (−12), 143 612 octets (−1 413).

## Résumé
- **52 déclarations mortes supprimées**, **12 règles devenues vides supprimées**, 0 `@keyframes` en double (aucun dans ce fichier).
- Aucune valeur modifiée, aucune règle fusionnée ni déplacée, commentaires conservés.
- Sélecteurs définis plusieurs fois (même liste de sélecteurs, même contexte) : 47 groupes avant, 37 après. Les 37 restants déclarent des propriétés différentes : les réunir demanderait une fusion, exclue par la consigne. (L'audit en compte 77 car il compte chaque sélecteur d'une liste séparément et sans tenir compte du contexte `@media`.)
- **Correction de jeton appliquée : aucune.** Aucun jeton de `gx-console.css` n'est mal orthographié avec un équivalent exact (voir plus bas).
- **Équivalence vérifiée : 0 différence** sur 91 616 éléments × 16 rendus, soit 120 329 888 valeurs calculées comparées (détails plus bas).
- Les définitions noires signalées par l'audit sont parties : `.gx-act.gx-pri` (l.64), `.gx-btn.gx-pri` et son `:hover` (l.207-208), `.gx-act:hover` (l.63), `.gx-vers button[aria-pressed]` (l.112), le fond noir de `.gx-m.gx-you p`, `.gx-av.gx-ai`, `.gx-wsteps .gx-on i` et `.gx-logo`. Elles étaient toutes réécrites plus loin : le rendu ne change pas. `.gx-go` (l.27) est resté, voir « Candidats non appliqués ».

## Critère de suppression (script `scripts/analyze.mjs`, postcss)
Une déclaration A est supprimée seulement si une déclaration B placée plus loin dans le même fichier remplit toutes ces conditions :
1. Même liste de sélecteurs après normalisation des espaces et des combinateurs, ordre de la liste indifférent (`.a, .b` = `.b,.a`).
2. Même contexte exact (même chaîne de `@media` / `@supports`).
3. Même propriété, ou un raccourci qui couvre la propriété longue de A (`padding` couvre `padding-left`, `margin` couvre `margin-bottom`, `flex` couvre `flex-grow`…). La table est prudente. Un raccourci n'est jamais supprimé à cause d'une propriété longue placée après lui.
4. Importance : A normale, ou A et B toutes deux `!important`.
5. Garde-fou « repli » : si la valeur de B utilise une syntaxe qu'un navigateur ancien pourrait rejeter (`clamp()`, `min()`, `dvh`, `color-mix()`, `-webkit-`…) et ne contient pas `var()`, A est gardée comme repli. Une valeur avec `var()` est toujours acceptée à l'analyse, donc A ne sert jamais de repli dans ce cas.

Une règle vidée par ces suppressions est retirée, et une `@media` vidée l'est aussi (aucun cas ici).
Lancer : `cd scripts && npm i && node analyze.mjs <origine.css> <sortie.css> <rapport.json>`. Le détail est dans `rapports/suppressions.json`.

## Déclarations supprimées (numéros de ligne du fichier d'origine)
| Ligne | Sélecteur | Contexte | Déclaration supprimée | Remplacée par (ligne d origine) |
|---|---|---|---|---|
| 9 | `.gx-num` | — | `font-family:var(--gx-mono)` | `font-family:var(--gx-mono)` (l.144) |
| 9 | `.gx-num` | — | `font-variant-numeric:tabular-nums` | `font-variant-numeric:tabular-nums` (l.144) |
| 9 | `.gx-num` | — | `letter-spacing:-.01em` | `letter-spacing:-.01em` (l.144) |
| 34 | `.gx-sh h2` | — | `font-size:13px` | `font-size:15px` (l.247) |
| 63 | `.gx-act:hover` | — | `border-color:var(--gx-fg)` | `border-color:var(--gx-pri)` (l.591) |
| 64 | `.gx-act.gx-pri` | — | `background:var(--gx-fg)` | `background:var(--gx-pri)` (l.590) |
| 64 | `.gx-act.gx-pri` | — | `color:var(--gx-bg)` | `color:#fff` (l.590) |
| 64 | `.gx-act.gx-pri` | — | `border-color:var(--gx-fg)` | `border-color:var(--gx-pri)` (l.590) |
| 112 | `.gx-vers button[aria-pressed="true"]` | — | `background:var(--gx-fg)` | `background:var(--gx-pri)` (l.594) |
| 112 | `.gx-vers button[aria-pressed="true"]` | — | `color:var(--gx-bg)` | `color:#fff` (l.594) |
| 112 | `.gx-vers button[aria-pressed="true"]` | — | `border-color:var(--gx-fg)` | `border-color:var(--gx-pri)` (l.594) |
| 127 | `.gx-st.gx-new` | — | `color:var(--gx-meta)` | `color:var(--gx-new-ink)` (l.742) |
| 141 | `.gx-toast` | — | `right:20px` | `right:auto` (l.731) |
| 141 | `.gx-toast` | — | `bottom:calc(20px + env(safe-area-inset-bottom,0px))` | `bottom:auto` (l.731) |
| 141 | `.gx-toast` | — | `transform:translateY(16px)` | `transform:translate(-50%,-16px)` (l.731) |
| 142 | `.gx-toast.gx-on` | — | `transform:none` | `transform:translate(-50%,0)` (l.732) |
| 152 | `.gx-logo` | — | `background:var(--gx-fg)` | `background:#0E0D14` (l.584) |
| 164 | `.gx-nv em` | — | `background:var(--gx-accent)` | `background:var(--gx-pri)` (l.599) |
| 207 | `.gx-btn.gx-pri` | — | `background:var(--gx-fg)` | `background:var(--gx-pri)` (l.585) |
| 207 | `.gx-btn.gx-pri` | — | `color:var(--gx-bg)` | `color:#fff` (l.585) |
| 207 | `.gx-btn.gx-pri` | — | `border-color:var(--gx-fg)` | `border-color:var(--gx-pri)` (l.585) |
| 208 | `.gx-btn.gx-pri:hover` | — | `background:color-mix(in srgb,var(--gx-fg) 86%,var(--gx-accent))` | `background:var(--gx-pri-h)` (l.586) |
| 236 | `.gx-av.gx-ai` | — | `background:var(--gx-fg)` | `background:var(--gx-grad)` (l.595) |
| 236 | `.gx-av.gx-ai` | — | `color:var(--gx-bg)` | `color:#fff` (l.595) |
| 256 | `.gx-chatv` | — | `grid-template-columns:250px minmax(0,1fr)` | `grid-template-columns:280px minmax(0,1fr)` (l.1776) |
| 258 | `.gx-convs` | — | `padding:12px` | `padding:14px 12px` (l.1777) |
| 260 | `.gx-convs .gx-srch` | — | `min-width:0` | `min-width:0` (l.1778) |
| 260 | `.gx-convs .gx-srch` | — | `height:44px` | `height:40px` (l.1778) |
| 260 | `.gx-convs .gx-srch` | — | `padding:0 14px` | `padding:0 12px` (l.1778) |
| 260 | `.gx-convs .gx-srch` | — | `font-size:14px` | `font-size:13.5px` (l.1778) |
| 260 | `.gx-convs .gx-srch` | — | `margin-bottom:8px` | `margin:2px 0 12px` (l.1778) |
| 261 | `.gx-convs .gx-srch .gx-i` | — | `width:16px` | `width:16px` (l.1781) |
| 261 | `.gx-convs .gx-srch .gx-i` | — | `height:16px` | `height:16px` (l.1781) |
| 272 | `.gx-m.gx-you p` | — | `background:var(--gx-fg)` | `background:var(--gx-pri)` (l.593) |
| 272 | `.gx-m.gx-you p` | — | `color:var(--gx-bg)` | `color:#fff` (l.593) |
| 336 | `.gx-stepper span.gx-on` | — | `background:var(--gx-accent)` | `background:var(--gx-pri)` (l.598) |
| 435 | `.gx-pv` | — | `max-height:62vh` | `max-height:none` (l.1684) |
| 466 | `.gx-lg.gx-meta` | — | `background:var(--gx-meta)` | `background:#0866FF` (l.1666) |
| 466 | `.gx-lg.gx-meta` | — | `font-family:Georgia,serif` | `font-family:inherit` (l.1666) |
| 1666 | `.gx-lg.gx-meta` | — | `font-family:inherit` | `font-family:inherit` (l.1707) |
| 467 | `.gx-lg.gx-shop` | — | `background:#5E8E3E` | `background:#95BF47` (l.1667) |
| 521 | `.gx-note` | — | `color:var(--gx-warn)` | `color:var(--gx-warn-ink)` (l.744) |
| 557 | `.gx-wsteps .gx-on i` | — | `background:var(--gx-fg)` | `background:var(--gx-pri)` (l.597) |
| 557 | `.gx-wsteps .gx-on i` | — | `color:var(--gx-bg)` | `color:#fff` (l.597) |
| 738 | `#ctab td:nth-child(2) small` | — | `white-space:normal` | `white-space:nowrap` (l.1227) |
| 778 | `.gx-chatv` | @media (max-width:899px) | `height:calc(100vh - 57px - 36px - 64px)` | `height:calc(100vh - 57px - 36px)` (l.792) |
| 792 | `.gx-chatv` | @media (max-width:899px) | `grid-template-columns:minmax(0,1fr)` | `grid-template-columns:minmax(0,1fr)` (l.1789) |
| 842 | `.gx-wsbtn .gx-bm` | — | `color:#fff` | `color:var(--gx-fg)` (l.1668) |
| 842 | `.gx-wsbtn .gx-bm` | — | `background:var(--gx-pri)` | `background:var(--gx-sunk)` (l.1668) |
| 1811 | `.gx-editor-header .gx-ed-sub` | — | `flex:1` | `flex:0 1 auto` (l.1849) |
| 1812 | `.gx-editor-header .gx-ed-name` | — | `width:100%` | `width:auto` (l.1850) |
| 1812 | `.gx-editor-header .gx-ed-name` | — | `min-width:70px` | `min-width:0` (l.1850) |

Règles devenues vides, supprimées : l.9 `.gx-num`, l.63 `.gx-act:hover`, l.64 `.gx-act.gx-pri`, l.112 `.gx-vers button[aria-pressed="true"]`, l.207 `.gx-btn.gx-pri`, l.208 `.gx-btn.gx-pri:hover`, l.260 `.gx-convs .gx-srch`, l.261 `.gx-convs .gx-srch .gx-i`, l.467 `.gx-lg.gx-shop`, l.557 `.gx-wsteps .gx-on i`, l.738 `#ctab td:nth-child(2) small`, l.778 `.gx-chatv` (@media (max-width:899px)).

## Gardées volontairement comme repli (3)
Ces déclarations sont écrasées dans les navigateurs récents. Elles ont été gardées parce que la valeur suivante utilise `clamp()`/`min()` :
- l.435 `.gx-pv{height:440px}`, puis l.1684 `height:clamp(320px,calc(100vh - 300px),860px)`
- l.1501 `.gx-ed-l,.gx-ed-r{max-height:calc(min(440px,62vh) + 130px)}`, puis l.1683 `max-height:calc(clamp(…) + 130px)`
- l.1518 `.gx-ed-stage{height:min(440px,62vh)}`, puis l.1682 `height:clamp(300px,calc(100vh - 560px),820px)`

## Candidats non appliqués : morts selon une preuve, mais hors du critère strict (23)
Ils sont détectés par `scripts/extra.mjs` (liste complète dans `rapports/candidats-non-appliques.json`). Ce sont des cas où B a une liste de sélecteurs plus large que A, ou bien B est sans `@media` et placée plus loin. Ces déclarations n'ont aucun effet aujourd'hui. Pour certaines, cela révèle un **bug avéré**, à trancher plutôt qu'à supprimer en silence :
- **Bug : largeurs maximales annulées (audit F3).** `.gx-wrap{max-width:980px}` (l.10), `.gx-page{max-width:1260px}` (l.198) et `.gx-page:has(.gx-chatv){max-width:1360px}` (l.257) sont tous écrasés par `.gx-page,.gx-page:has(.gx-chatv),.gx-wrap{max-width:none}` (l.1675, sans `@media`). Il faut décider : garder `none` (rendu actuel) et supprimer les trois valeurs, ou limiter `max-width:none` à `@media (min-width:1600px)`.
- **Bug : aperçu vidéo sur mobile.** `.gx-pv{height:auto}` dans `@media (max-width:560px)` (l.824) est écrasé par `.gx-pv{height:clamp(…)}` (l.1684, sans `@media`, placé plus loin). La règle mobile ne s'applique jamais. Correction proposée : déplacer `height:auto` dans une `@media (max-width:560px)` placée après la l.1684.
- `.gx-go{background:var(--gx-fg);color:var(--gx-bg)}` (l.27) : noir, écrasé par `.gx-btn.gx-pri.gx-grad, .gx-go{…}` (l.587). Ces deux déclarations peuvent être supprimées sans risque (le reste de la règle l.27 doit rester).
- Couleurs d'état écrasées par leurs versions `-ink` (l.739-743) : `color:var(--gx-ok|warn|bad)` de `.gx-up`, `.gx-st.gx-on|warn|bad|rev`, `.gx-reco/.gx-anc .gx-k`, `.gx-sig.gx-ok`, `.gx-ms i.gx-done`, `.gx-stepper span.gx-done`, `.gx-icard .gx-win`, `.gx-k7 em.gx-up`. Suppression sans risque.
- `.gx-meter i{background:var(--gx-accent)}` (l.176), écrasé par `.gx-credits .gx-meter i, .gx-meter i{background:var(--gx-grad)}`.
- `.gx-lg.gx-meta{background:#0866FF}` / `.gx-lg.gx-shop{background:#95BF47}` (l.1666-1667), écrasés par `.gx-lg.gx-meta,.gx-lg.gx-shop{background:color-mix(…var(--lgc)…)}` (l.1702).

## Couleurs, `hsl()` et jetons (liste seule, rien n'est appliqué)
**`hsl()` invalides dans `gx-console.css` : aucun.** Ceux de l'audit (F4) sont dans d'autres feuilles, hors du périmètre de P4 :
- `styles.css` `.leads-scroll` : `hsl(var(--border, …))` et `hsl(var(--muted-foreground, …))` ; `--border` est en hexadécimal, donc la valeur est invalide. Proposition : `var(--border)` / `var(--muted-foreground)`.
- `gx-admin.css` `.ad-pop` / `.ad-sheet` : `hsl(var(--border))`, `hsl(var(--muted-foreground))`, `hsl(var(--muted))`, `hsl(var(--background))`, `hsl(var(--foreground))`, `hsl(var(--muted)/.6)`. Proposition : `var(--gx-line)`, `var(--gx-dim)`, `var(--gx-sunk)`, `var(--gx-surface)`, `var(--gx-fg)`. `gx-admin-fixes.css` en rattrape déjà la plupart.

**Jetons `var(--x)` sans définition.** Toutes les feuilles importées par `styles.css` ont été vérifiées. Dans `gx-console.css`, aucun jeton n'est cassé :
- `--gx-pri-fg` (l.1827, `.gx-edp .gx-tl-tools .gx-play`) n'est défini nulle part. Son repli `var(--primary-foreground)` (#FFFFFF, `styles.css`) s'applique. Proposition : remplacer par `#fff`, ou définir `--gx-pri-fg` avec `--gx-pri`. Non appliqué : pas d'équivalent exact parmi les jetons `--gx-*`.
- `--overlay` (l.544, `.gx-sheet`) : défini dans `styles.css` (`.console-app` et `:root`). Correct.
- `--gx-w` (l.414) et `--editor-offset` (l.1798, avec repli 57px) : posés en style en ligne par les composants. Corrects.
- Hors du périmètre : `gx-ux-fixes.css` `.gx-cv .gx-cv-brand` utilise `--gx-surface-2`, `--gx-text` et `--gx-text-2`, qui n'existent pas. Proposition : `--gx-sunk` / `--gx-fg` / `--gx-muted`.

**Couleurs en dur hors jetons dans `gx-console.css` : 139 occurrences** (`rapports/couleurs.json` donne la ligne, le sélecteur, la propriété et la proposition) :
- `#fff` (49) : texte ou icône sur fond violet, dégradé ou média. Aucun jeton blanc fixe n'existe (`--gx-surface` passe à #131519 en sombre). Proposition : créer `--gx-on-pri:#fff` si on veut tout passer en jetons.
- Noirs translucides `rgba(0,0,0,…)`, `rgba(16,18,23,…)`, `#000` (≈ 45) : ombres, voiles et fonds de média. À garder.
- Blancs translucides `rgba(255,255,255,…)` (6) : calques sur média. À garder.
- `rgba(91,63,228,.8)` (3 ombres : `.gx-go`, `.gx-tab.gx-mid span.gx-ic`, `.gx-newad`). Proposition : `color-mix(in srgb,var(--gx-pri) 80%,transparent)`, même rendu.
- Styles de sous-titres (`.gx-tt span:nth-child(n)`, `.gx-pv .gx-cap[data-s]`, `#17181C`, `#FFD84D`, `#7CF7FF`, `#34E1F2`, `#E2382B`, `#2A2333`, `#FFB45E`, `#F29A2E`) : c'est du contenu, les valeurs restent.
- Couleurs de marque (`#0866FF` Meta, `#95BF47` / `#5E8E3E` Shopify) : à garder.
- Avatars et puces de marque `#E2832B` (`.gx-ws .gx-bm`, `.gx-wsi`, `.gx-fbh .gx-bm`), `.gx-logo{background:#0E0D14}` : décision de charte.
- Proposition qui **change le rendu sombre** : `.gx-atile .gx-fav{color:#5A606D}` → `var(--gx-muted)`, `.gx-atile .gx-use{color:#101217}` → `var(--gx-fg)`, `.gx-think .gx-think-ghost{stroke:#D3D6DD}` → `var(--gx-line-2)`. Elles corrigent probablement des défauts du mode sombre, mais restent à valider à l'œil. `.gx-atile .gx-fav[aria-pressed]{color:#E9A23B}` vaut `--gx-warn` du mode sombre : proposition `var(--gx-warn)`.

## Vérification d'équivalence (`scripts/equiv/`)
- `build.mjs` produit un fragment DOM qui satisfait **chacun des 1 704 sélecteurs** de l'ancienne feuille : descendants, enfants, frères, `:has()`, `:nth-child()`, `:is()`, attributs. S'y ajoute un élément isolé par classe (582 classes, dont 578 `gx-*`), soit 2 286 fragments et 5 726 éléments. Les fragments sont placés dans `.console-app`, ou au niveau de `body` pour les portails.
- Les états d'interaction (`:hover`, `:focus`, `:focus-visible`, `:focus-within`, `:active`, `:disabled`…) sont remplacés **de la même façon dans les deux feuilles** par des attributs `[data-p-…]`, qui ont la même spécificité. Ces états sont donc testés eux aussi.
- `run.mjs` (Playwright, Chromium) charge l'ancienne puis la nouvelle feuille. Il compare `getComputedStyle` de chaque élément, toutes propriétés comprises (propriétés personnalisées incluses), ainsi que `::before`, `::after` et `::placeholder`. Les animations sont figées à t=0.
  - Largeurs : 1680, 1440, 1100, 850, 700, 600 et 390 px, en clair et en sombre (`html.dark` + `.console-app`).
  - Plus `prefers-reduced-motion: reduce` à 1440 px en clair et 390 px en sombre.
- **Résultat : 16 rendus, 91 616 éléments comparés, 120 329 888 valeurs calculées, 0 élément différent** (`rapports/equivalence.json`).
- Contrôle de sensibilité : une copie volontairement abîmée (4 déclarations vivantes retirées ou modifiées) donne 8 éléments différents à 1440 px et 157 à 390 px. Le test détecte donc bien un vrai changement.
- Le test charge `gx-console.css` seul. Cela suffit : une déclaration supprimée perd toujours face à une déclaration du même fichier, donc aucune feuille chargée après ne peut faire réapparaître son effet.

## Non couvert / risques
- Les commentaires « Correction .gx-ph » orphelins (audit F2) sont conservés : ils n'ont aucun effet sur le rendu, et la consigne demandait de ne rien toucher d'autre.
- Le test d'équivalence porte sur Chromium. Les navigateurs anciens sont protégés par le garde-fou « repli » (point 5).
