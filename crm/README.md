# NoreaCRM

CRM de suivi des dossiers clients (rénovation énergétique / financement), en **React + TypeScript + Vite + Tailwind CSS + lucide-react** — la même stack que Lovable.

## Fonctionnalités

- **Dossiers clients** : tableau avec ID, nom, téléphones/email (cliquables), adresse (lien Google Maps), équipe + commercial, statut (badge coloré modifiable), type de paiement, produits, compteur **NRP** (+/−), **observations** datées (survol = date, heure et auteur) avec ajout rapide, RDV.
- **Filtres** : recherche plein texte, départements (`75,78,94`, bouton 🌐 pour inclure/exclure), période de création, période de RDV, statut, type de paiement ; « + filtres » ajoute équipe, commercial, produit, NRP minimum.
- **Panneau Statuts** : 13 statuts avec compteurs, multi-sélection.
- **Présélections** : enregistrer / rappeler des combinaisons de filtres.
- **Menu** : export CSV, tout sélectionner, impression. Actions groupées sur la sélection (changer le statut, exporter, supprimer).
- **Fiche client** (panneau latéral) : historique des observations, édition complète, suppression.
- **Nouveau client** (modale) et **Planning** (semaine, filtre commercial, prochains RDV, planification d'un RDV en cliquant sur un créneau).
- Notifications, colonnes masquables, tri, pagination, responsive.

Les données sont stockées dans le navigateur (`localStorage`) avec des dossiers de démonstration fictifs. Toute la logique de données est dans `src/lib/store.tsx` : c'est le seul fichier à brancher sur Supabase une fois sur Lovable.

## Lancer en local

```bash
npm install
npm run dev
```

## Mettre sur Lovable

1. Pousser ce dossier dans un dépôt GitHub (ou l'utiliser tel quel).
2. Dans Lovable : créer un projet, le connecter au dépôt GitHub, puis demander par exemple :
   « Branche le store `src/lib/store.tsx` sur Supabase (tables clients, observations, presets) et ajoute l'authentification. »
