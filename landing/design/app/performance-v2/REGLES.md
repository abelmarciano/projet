# Performance v2 : règles à respecter dans le code envoyé à Lovable

Maquette : `maquette.html` (artifact https://claude.ai/artifact/2yRCQnnosVbmXbV5hx4wsG, version épurée).

## Mise en page épurée (validée par l'utilisateur)
- La page doit rester simple : pas de multiplication de cartes et de blocs.
- **En-tête** : un seul bouton « Toutes mes campagnes » qui ouvre le choix du compte, de la page et du produit, puis la période.
- **Onglets d'objectif** : ils n'apparaissent que si les campagnes choisies ont plusieurs objectifs. Il n'y a pas de vue « Tous » qui mélange les objectifs.
- **Bloc principal** :
  - un grand chiffre et le coût par résultat, avec l'évolution ;
  - une phrase simple ;
  - une courbe, avec la période précédente en pointillés ;
  - 4 chiffres secondaires en bas du bloc.
- **« À faire »** : une ligne par conseil, avec un seul bouton.
- **« Par produit »** : une ligne par produit, qui se déplie pour montrer ses campagnes (comparées au produit) et ses 2 meilleures pubs.
- Le tableau détaillé complet reste disponible derrière un lien.

## Filtres
- Compte publicitaire, page Facebook et groupe de campagnes, en haut de la page.
- Tous les chiffres de la page suivent ces filtres : verdict, chiffres du haut, graphique, conseils, pubs et tableau.

## Objectif détecté sur chaque campagne
- Pas que des leads. Les objectifs à gérer : leads, ventes, trafic, notoriété.
- Si les campagnes filtrées ont plusieurs objectifs : vue « Tous », plus un sélecteur d'objectif.
- Ne jamais additionner des leads et des achats dans un même « résultat ».
- Chiffres du haut, 6 visibles, selon l'objectif :
  - **Leads** : leads, coût par lead, dépense, taux de clic, clics, personnes touchées.
  - **Ventes** : achats, chiffre d'affaires, retour sur dépense, coût par achat, dépense, panier moyen.
  - **Trafic** : clics vers le site, coût par clic, dépense, taux de clic, personnes touchées, affichages.
  - **Notoriété** : personnes touchées, coût pour 1 000 personnes, dépense, affichages, répétition, clics.
  - **Tous** : dépense totale plus un chiffre par objectif présent.
  - Le reste va dans « Plus de chiffres ».

## Groupes de campagnes cohérents (un compte Meta peut servir plusieurs produits)
- Regrouper automatiquement les campagnes par produit, à partir du nom des campagnes et des pubs. Exemple : « Carport · Hiver » et « Carport · Relance » vont dans le groupe Carport.
- Le client peut renommer, fusionner ou créer des groupes. Le sélecteur de groupes manuel existe déjà : CampaignGroupPicker.
- **Toutes les comparaisons se font dans le groupe, jamais sur le compte entier.** Concerne le coût par lead moyen, le point vert/rouge du tableau et les conseils « À booster / À couper ».
- Un groupe d'une seule campagne se compare au même objectif sur le même compte, et le conseil le dit.
- Le tableau des campagnes est regroupé par groupe, avec une ligne de total par groupe.
