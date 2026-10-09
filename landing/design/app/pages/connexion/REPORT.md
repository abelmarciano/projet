# Connexion — rapport

## 1. Fichiers
- Remplacé : `src/routes/_authenticated/connexions.tsx` (route `/_authenticated/connexions`, `head` identique).
- `extra.css` (à ajouter en fin de gx-console.css) : `.gx-cc-lh`, `.gx-cc-lk`, case à cocher dans `.gx-acc`, `.gx-cc-more`, `.gx-cc .gx-hint`.
- `MetaConnectDialog.tsx` / `ShopifyConnectDialog.tsx` NON modifiés (toujours utilisés ailleurs, ex. Accueil) ; la page appelle directement les mêmes server functions.

## 2. Fonctions existantes et nouvel emplacement
- Connexion Meta (OAuth popup `startMetaOAuth`) : bouton « Reconnecter » (et « Continuer avec Facebook » si non connecté) directement dans la carte.
- Déconnexion Meta (`deleteMetaCredentials`) : bouton « Déconnecter » + même confirmation (AlertDialog) qu'avant.
- Compte par défaut (publication Chat) : bouton radio de chaque compte actif (`setActiveMetaAdAccounts`).
- Activation / désactivation des comptes publicitaires (avant dans la modale Meta) : lien discret « Gérer les comptes » à droite de l'intitulé → cases à cocher sur les comptes actifs + liste « Autres comptes disponibles ».
- Invalidation des mêmes clés qu'avant (meta-credentials, meta-adaccounts, meta-pages, meta-pixels, meta-leadforms, meta-performance, …).
- Shopify : connexion / reconnexion / changement de boutique (`startShopifyOAuth`) dans un panneau latéral gx-sheet ; ouvert par « Connecter Shopify » (non connecté) ou le menu « ⋯ » de la carte (Reconnecter la boutique / Changer de boutique). Déconnexion (`deleteShopifyCredentials`) via « Déconnecter » (une confirmation a été ajoutée, comme dans la maquette).
- Pages Facebook / Pixel : n'étaient pas affichés sur l'ancienne page Connexion, rien à reprendre.

## 3. Blocs sans vraie donnée
- « Synchroniser les produits » : il n'existe pas de synchronisation serveur ; le bouton relit les produits via `listShopifyProducts` (limit 100, nouvelle clé `["shopify-products-count"]`) et invalide `["catalog-picker","shopify-products"]`. Le nombre de produits affiché en vient (« 100+ » au-delà).
- Alerte orange : affichée seulement si `expiry_status` = `expiring_soon` (date `expires_at`) ou expiré.

## 4. Écarts avec la maquette
- Pastille « Session expirée » (gx-bad) / « Non connecté » / « Vérification… » selon l'état réel.
- Lien « Gérer les comptes » et menu « ⋯ » Shopify ajoutés (règle 2).
- Logo Meta = pastille `.gx-lg.gx-meta` « f » de la maquette (plus l'icône MetaIcon).

## 5. Points à vérifier à la compilation
- Import direct de `@radix-ui/react-dialog` (déjà dépendance de gx-controls).
- `GxSheetContent` reçoit `className="console-app-portal"` (variables gx dans le portail).
- `listMetaAdAccounts` / `getShopifyCredentials` lus en `any` (champ `currency`).
