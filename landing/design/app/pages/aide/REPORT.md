# Aide — rapport

## 1. Fichiers
- Remplacé : `src/routes/_authenticated/aide.tsx` (route et `head` identiques). Pas d'extra.css.

## 2. Fonctions déplacées
- « Rejouer la visite guidée » (bloc supprimé) → bouton d'en-tête « Visite guidée (1 min) » (`startProductTour`).
- Bloc « Contacter le support » → bouton d'en-tête « Écrire au support » (mailto:support@growthity.ai) + bouton dans l'état vide de recherche.
- Recherche : grande barre gx-srch gx-big, filtre questions + réponses (insensible aux accents).
- Anciennes catégories (Démarrage, Facturation, Contact…) supprimées ; 6 nouvelles cartes qui filtrent la FAQ (re-clic = toutes).

## 3. Contenu (aucune réponse inventée)
- Créer une pub : première pub, générations / heure, échec, relancer, sous-titres/couper, où voir mes pubs.
- Publier sur Meta : connexion Meta Ads Manager.
- Leads & résultats : notifications (seule question existante liée au suivi).
- Acteurs & voix : acteur en favori.
- Compte & équipe : marques, inviter, rôles, annuler l'abonnement + 6 questions de l'ancienne FAQ de Paramètres → Facturation (crédits, bonus, volume, dépassement, échecs remboursés, coût d'un message ; le doublon « annuler » n'est pas repris).
- Données & sécurité : sécurité des données.
- Première question ouverte par défaut, comme la maquette.

## 4. Écarts avec la maquette
- Les questions de la maquette (« Où arrivent mes contacts ? »…) ne sont pas reprises car absentes du contenu de l'app ; le texte réel de l'app est utilisé.

## 5. Points à vérifier
- `startProductTour` passé directement en `onClick` (comme l'ancienne page et l'Accueil).
- `<details open onToggle>` contrôlé via un Set d'état.
