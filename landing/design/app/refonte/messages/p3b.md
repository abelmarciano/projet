# Passage 3b : Onboarding, Souscription, Paiement refusé

Suite de la refonte du design validée par le propriétaire (contrat commun : https://raw.githubusercontent.com/abelmarciano/projet/4fce08d872d7d2e90436fd303d84a612248ea298/landing/design/app/refonte/CONTRAT.md). Applique ce message uniquement après le passage précédent. Ne publie pas le site, aucun test sur le vrai compte ni sur les vraies conversations du propriétaire, aucune génération payante. Reprends le code fourni tel quel, sans rien réécrire à la main.

## Téléchargement (obligatoire avant tout)
Base : https://raw.githubusercontent.com/abelmarciano/projet/4fce08d872d7d2e90436fd303d84a612248ea298/landing/design/app/refonte/p3b/
Télécharge chaque fichier du tableau dans `/tmp/p3b/`, en gardant son chemin relatif. Vérifie les empreintes (16 premiers caractères du sha256). Le `$` dans les chemins s'encode `%24` dans l'URL.

| Fichier | sha256 |
|---|---|
| `scripts/apply.py` | d15da6bf577c8433 |
| `src/routes/_authenticated/onboarding.tsx` | c7bf5ee9956816b2 |
| `src/routes/_authenticated/paiement-refuse.tsx` | ab71fe816ab84e46 |
| `src/routes/_authenticated/souscription.tsx` | 1b5956311ac574e8 |
| `src/styles/gx-solo.css` | e0b844871aafdd03 |

Lance les scripts depuis la racine du projet, avec leur chemin dans `/tmp/p3b/scripts/`.

## Contrôle avant de remplacer un fichier entier (remplace le contrôle d'empreinte d'origine décrit plus bas)
Les empreintes « d'origine » citées plus bas ont été calculées AVANT le passage 1, qui a modifié les lignes d'import des icônes. Pour chaque fichier à remplacer entièrement, lance plutôt :
`git diff 8d706afcd75acf55a14179f6c6aa0609033f6e7e -- <fichier>`
- Si le diff est vide, ou s'il ne montre que des lignes d'import passées de `"lucide-react"` à `"@/components/icons"` (passage 1) ou des changements faits par les passages précédents de cette refonte, remplace le fichier.
- S'il montre autre chose, arrête-toi pour ce fichier et signale-moi le diff.

Les scripts `apply.py` font des remplacements exacts et s'arrêtent d'eux-mêmes sans rien écrire si un bloc ne correspond pas. Dans ce cas, envoie-moi leur sortie telle quelle.

## Message détaillé du passage
# Refonte P3b : Onboarding, Souscription, Paiement refusé

## Contexte
Ces trois écrans sont plein écran, sans menu latéral (rendus dans `ConsoleScope` seul, cf. `src/routes/_authenticated/route.tsx`). C'est la première impression du client. Ils étaient encore à l'ancien style (Card/Input/Button shadcn, `bg-gradient-subtle`, `bg-grad`, `.eyebrow` du marketing, Accordion, vouvoiement, emoji). On les passe dans la charte console : jetons `--gx-*`, classes `gx-*`, boutons `.gx-btn` / `.gx-btn.gx-pri`, composants communs (`@/components/console`), icônes `@/components/icons`, tutoiement, aucun emoji.

**Prérequis** : P1 (icônes, `src/components/icons.tsx`) et P2 (composants `src/components/console/PageHeader.tsx`, `ConsoleLoading.tsx`, `StatTile.tsx`) sont déjà appliqués. S'ils ne le sont pas, arrête-toi et signale-le.

**Aucune logique ne change** : mêmes étapes, champs, validations, appels serveur (`getOnboardingStatus`, `completeOnboarding`, `getCreditSummary`, `usePlansGrid`, `getPaymentIssue`, `createPortalSession`, `CheckoutDialog`), mêmes redirections et liens. Seuls le balisage, les classes et les textes visibles changent.

## Fichiers à copier (remplacement complet)
Vérifie d'abord que chaque fichier d'origine n'a pas changé (16 premiers caractères du sha256) :

| Fichier | sha256 d'origine (base 8d706af) |
|---|---|
| `src/routes/_authenticated/onboarding.tsx` | `96903710ef30ed9c` |
| `src/routes/_authenticated/souscription.tsx` | `2305a61f3df4b6e8` |
| `src/routes/_authenticated/paiement-refuse.tsx` | `3596dea6886be415` |

```bash
sha256sum src/routes/_authenticated/onboarding.tsx src/routes/_authenticated/souscription.tsx src/routes/_authenticated/paiement-refuse.tsx | cut -c1-16
```
Ces empreintes ont été calculées à partir d'une lecture du fichier par l'API ; si l'une diffère, vérifie avec `git log --oneline 8d706afcd75acf55a14179f6c6aa0609033f6e7e..HEAD -- <fichier>` : si le fichier n'a reçu AUCUN commit depuis la base, l'écart vient des espaces de fin et tu peux continuer ; sinon arrête-toi et signale.

Puis copie :
- `src/routes/_authenticated/onboarding.tsx` (remplace)
- `src/routes/_authenticated/souscription.tsx` (remplace)
- `src/routes/_authenticated/paiement-refuse.tsx` (remplace)
- `src/styles/gx-solo.css` (nouveau fichier : styles des écrans plein écran, tout sous `.gx-solo`)

Et ajoute l'import de la feuille dans `src/styles.css` :
```bash
python3 scripts/apply.py src/styles.css
```
(insère `@import "./styles/gx-solo.css";` juste après `@import "./styles/gx-sidebar-fit.css";` ; s'arrête sans rien écrire si l'ancre n'est pas trouvée exactement une fois ; ne fait rien si l'import existe déjà).

Ne touche à rien d'autre (pas au logo, pas à `PhoneInput`, `CheckoutDialog`, `PaymentTestModeBanner`, `BillingIntervalToggle`, pages marketing).

## Ce qui change visuellement
**Commun aux trois écrans** : fond console `--gx-bg`, en-tête fixe blanc 64 px (56 px sur mobile) avec le logo existant à gauche, carte `gx-box` avec ombre console, boutons `.gx-btn` / `.gx-btn.gx-pri` (violet plat, plus de dégradé), icônes Hugeicons, clair et sombre.

**Onboarding (/onboarding)**
- En-tête : logo + « Étape n sur 4 ».
- Barre de progression en 4 segments étiquetés (Espace, Téléphone, Marque, Profil), segment en cours en gras.
- Étape 1 : « Bienvenue sur Growthity » (plus d'emoji), champ natif `gx-in` « Nom de l'espace de travail » ; nom proposé par défaut `Espace de <prénom>` au lieu de `<prénom>'s workspace`.
- Étape 2 : « Ton numéro », `PhoneInput` inchangé mais harmonisé (hauteur 42 px, bordures et fond aux jetons).
- Étape 3 : « Ta première marque » (libellé « Facultatif »), aperçu du logo en carré pointillé, bloc d'erreur rouge doux avec « Réessayer ».
- Étape 4 : « Dernière étape », pastilles `gx-chip` (avec `aria-pressed`), champ « Précise… » si « Autre ».
- Boutons : « Retour » en contour, « Passer » discret, « Continuer » / « Terminer » violet plat à toutes les étapes (fini le `bg-grad` des étapes 3-4). Sur mobile, le bouton principal passe en pleine largeur au-dessus.
- Chargement : `ConsoleLoading` (variant `page`).
- Tutoiement partout, y compris les toasts (« Donne un nom à ton espace de travail », « Nom de l'espace de travail requis »).

**Souscription (/souscription)**
- En-tête : logo + « Se déconnecter » (bouton discret). Bandeau de mode test conservé au-dessus.
- Titre via `PageHeader` (sur-titre « Activation du compte », « Un seul plan. Choisis ton volume. »).
- Deux colonnes (une seule sur mobile) :
  - à gauche, « Volume mensuel de crédits » : bascule Mensuel / Annuel (`gx-seg`, remise lue dans `ANNUAL_DISCOUNT_RATE`) et TOUS les forfaits chargés du serveur en tuiles sélectionnables (crédits / mois + prix / mois, choix unique `role="radio"`), plus la ligne d'exemple (vidéos / images) ; le menu déroulant disparaît ;
  - à droite, récapitulatif collant : prix, ligne de facturation (annuel / économies), volume choisi, bouton « Activer N crédits / mois » (ouvre le même `CheckoutDialog` avec la même cible), bonus de bienvenue, liste « Inclus quel que soit le volume choisi ».
- FAQ en `gx-faq` (details/summary natifs) au tutoiement ; « one-shot » → « unique », « workspaces » → « espaces de travail », « & » → « et ».
- Chiffres inchangés : tous les prix, crédits, remises et bonus viennent des mêmes sources qu'avant (grille `plans`, `pricing.ts`, `FIRST_SUB_BONUS_CREDITS`).

**Paiement refusé (/paiement-refuse)**
- En-tête avec logo, carte centrée.
- Pastille d'état (« Paiement à régulariser » orange ou « Abonnement interrompu » rouge) avec icône.
- Montant dû et date de l'échec en `StatTile`.
- Encart rassurant violet doux, boutons pleine largeur (« Régler la facture maintenant » violet, « Mettre à jour mon moyen de paiement » en contour ou violet s'il n'y a pas de lien de paiement, « Voir ma facturation » discret).
- Pied : « Contacter le support » / « Se déconnecter », mêmes actions qu'avant.

## Vérifications
1. `npx tsc --noEmit` (ou le typecheck du projet) puis `npm run build` : aucune erreur.
2. Rendu à 1440 px et 390 px, en clair ET en sombre, des trois écrans : /onboarding (les 4 étapes), /souscription (mensuel et annuel, sélection d'un autre volume), /paiement-refuse. Aucun défilement horizontal à 390 px.
3. Vérifie que la fenêtre du choix de pays (PhoneInput) et la fenêtre de paiement (CheckoutDialog) s'ouvrent toujours normalement.
4. Ne fais aucun test sur le vrai compte (ne termine pas l'onboarding, ne lance aucun paiement), aucune génération payante, et ne publie pas.


Termine par : fichiers modifiés, sortie des scripts, typecheck et build, et tout ce qui n'a pas pu être appliqué.
