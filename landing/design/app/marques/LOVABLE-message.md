Trois corrections validées par le propriétaire. Rien ne doit casser : base de données en ajouts seulement (nouvelles colonnes facultatives), aucune donnée existante modifiée, texte en français au tutoiement, ne publie pas le site, aucune génération payante pendant tes tests.

Maquette de référence (marques) : https://claude.ai/artifact/7Arix5sZHGcmMaE7yzmTa6 — source : https://raw.githubusercontent.com/abelmarciano/projet/claude/focused-bell-rnrpk7/landing/design/menu-marques/menu-marques.html

## 1. Marques : un seul sélecteur, liste des conversations par marque, marque blanche

**a) Un seul sélecteur de marque : celui du menu principal** (`WorkspaceBrandCard`, en haut du menu latéral).
- Il propose : les marques du workspace, puis « Marque blanche », « Toutes les marques », puis « Ajouter une marque ».
- Le choix vaut pour tout le SaaS (Chat, Créations, Ma marque…). Réutilise le mécanisme actuel de marque active (`useBrands`, `useSetActiveBrand`) et ajoute les deux valeurs spéciales « toutes » et « marque blanche » sans changer le sens des données existantes (par exemple une préférence d'affichage à côté de la marque active).
- Aucun autre sélecteur de marque ailleurs (pas dans la liste des conversations).

**b) Repère de marque** (un seul composant réutilisé partout) : le logo s'il existe ; sinon un carré aux initiales sur une couleur propre à la marque, avec le nom écrit en entier à côté. Plus jamais « MA » en gris.

**c) Liste des conversations du Chat.**
- Elle suit la marque du menu principal (`ad_conversations.brand_id`). En haut : « Conversations · {marque} », le bouton « Nouvelle conversation », la recherche.
- « Toutes les marques » : les conversations groupées sous un titre par marque (repère + nom, une seule fois par groupe), puis « Marque blanche », puis « Sans marque » pour les anciennes conversations sans marque.
- Les dossiers existants (TINY HOUSE, PV, ITE…) restent, rangés à l'intérieur de chaque marque. Une marque sans dossier affiche ses conversations directement.
- Chaque ligne : icône du type (vidéo, image, discussion) à gauche ; titre sur toute la largeur ; dessous, en petit : « 3 vidéos · 2 images · hier » (ou « Discussion · hier »). On retire le logo de marque et les pastilles de compteurs sur chaque ligne.

**d) Pastille « Marque » au-dessus de la zone de saisie du Chat** (et seulement celle-là : pas de pastille acteur).
- Affiche « Marque : {repère} {nom} ▾ » de la conversation ouverte. Le menu liste les marques puis « Marque blanche ».
- Changer de marque met à jour la conversation et affiche une petite note dans le fil (« Conversation déplacée vers X » / « Conversation passée en marque blanche »).
- Sous la zone de saisie : « Les créations de cette conversation utilisent l'identité de X » ou « Marque blanche : les créations sortent sans aucune signature de marque ».

**e) Marque blanche.**
- Ajoute à `ad_conversations` une colonne facultative `white_label boolean default false`.
- En marque blanche, le Chat et les générations n'utilisent NI nom, NI logo, NI couleurs, NI mémoire de marque (brand brain, produits, ton). Textes et visuels génériques. Les créations produites ne sont rattachées à aucune marque.
- Une nouvelle conversation créée quand le menu est sur « Marque blanche » est en marque blanche ; sur une marque, elle prend cette marque.

**f) Créations** : la page Créations suit aussi la marque du menu principal (`ads.brand_id`), avec les mêmes options « Toutes les marques » et « Marque blanche ».

## 2. Acteur choisi sans que le client le choisisse (bug constaté)

Constat : dans une conversation, le Chat a répondu « Je garde Philippe, déjà choisi dans ton brief » alors que le client n'avait jamais choisi d'acteur. `stockActorId` était déjà dans l'état de la conversation (conversation vide réutilisée, et sélection faite pendant tes tests Galerie → Chat sur le compte réel). Le garde-fou de `ready_to_generate` considère tout `stockActorId` présent comme un choix.

Corrections :
- Un acteur ne compte comme choisi que s'il a été choisi par le client DANS cette conversation (clic Galerie → Chat ou réponse à la question acteur), par exemple avec un marqueur `stockActorChosenAt` posé à ce moment-là. Sinon, le Chat pose la question de l'acteur. S'il y a un acteur hérité, la première suggestion est « Garder {nom} ».
- Quand une conversation vide est réutilisée, vide `stockActorId` / `stockActorName` (et tout reste d'acteur).
- La détection « vidéo avec acteur » doit aussi reconnaître le mot « acteur » / « actrice » (pas seulement « ugc » / « face caméra »).
- Plus jamais de tests (sélection d'acteur, conversations, générations) sur les vraies conversations ou le vrai compte du propriétaire : utilise un compte de test.

## 3. Tâches programmées déclenchables avec la clé publique (sécurité)

`subscription-reminder`, `leads-sync` et `insights-sync` acceptent la clé publique Supabase (header `apikey`), visible dans le navigateur de tout visiteur.
- Ces trois routes n'acceptent plus que `x-cron-secret`, comme `brand-jobs`, avec une comparaison à temps constant (`timingSafeEqual`).
- Mets à jour les jobs `pg_cron` correspondants pour qu'ils envoient `x-cron-secret`, puis vérifie qu'ils tournent toujours (un passage réussi chacun, sans envoyer d'e-mail réel en double).

## Vérifications

- Typecheck et build OK ; Chat, Créations, Ma marque et le menu fonctionnent comme avant pour les conversations existantes.
- Rendu 1440 et 390 px, clair et sombre, sans défilement horizontal.
- Termine par la liste des fichiers modifiés et des migrations ajoutées.
