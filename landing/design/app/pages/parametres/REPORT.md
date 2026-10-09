# Paramètres — rapport

## 1. Fichiers remplacés (chemins app)
- `src/routes/_authenticated/parametres/route.tsx` (layout : en-tête + segment d'onglets = `Link` vers les sous-routes, URLs inchangées)
- `src/routes/_authenticated/parametres/profil.tsx`
- `src/routes/_authenticated/parametres/workspace.tsx`
- `src/routes/_authenticated/parametres/marques.tsx`
- `src/routes/_authenticated/parametres/membres.tsx`
- `src/routes/_authenticated/parametres/securite.tsx`
- `src/routes/_authenticated/parametres/facturation.tsx` (`validateSearch` identique)
- `index.tsx` inchangé (redirection vers /parametres/profil). `TwoFactorCard.tsx` non modifié (sa logique est reprise dans securite.tsx ; le composant n'est plus importé par cette page).
- `extra.css` : style des onglets en `<a>` dans `.gx-seg`, `.gx-ml`, images dans `.gx-wsi`/`.gx-bm-img`, `.gx-mb-acc`, QR 2FA, `.gx-cap`.

## 2. Fonctions déplacées
- Profil : une seule carte gx-form (Nom affiché, Téléphone, Langue en segment, Supprimer mon compte en rouge avec bouton discret). Les boutons « Enregistrer » n'apparaissent que si le champ est modifié (ou touche Entrée). Le téléphone est un seul champ international (libphonenumber) au lieu du sélecteur pays + numéro ; même appel `updatePhone`. L'e-mail du compte n'est plus une ligne : visible en infobulle du nom et dans la confirmation de suppression (inchangée : retaper l'e-mail).
- Workspace : formulaire du workspace COURANT (nom, icône Changer/Retirer, connexion Meta). Basculer vers un autre workspace et « Créer un workspace » : menu « Autres workspaces ». Suppression : ligne rouge « Supprimer ce workspace » (propriétaire, si >1 workspace). Slug/plan/rôle : infobulle du champ nom. Renommer / changer l'icône / supprimer un autre workspace = d'abord basculer dessus.
- Marques : grille gx-mgrid ; clic sur une carte → panneau latéral (nom, site, description, logo, Activer, Supprimer avec confirmation). « Ajouter une marque » → panneau (nom + site, `createBrand`).
- Membres : tableau gx-tbl Membre | Rôle | Accès. Retirer un membre et « Peut modifier les projets vidéo » (propriétaire) → menu « ⋯ » de la ligne. Invitations dans le même tableau : rôle modifiable (gx-sel), « Renvoyer », « ⋯ » (copier le lien, annuler). « Inviter un membre » → panneau latéral ; le lien d'invitation s'affiche ensuite dans ce panneau (remplace l'ancienne modale).
- Sécurité : interrupteur 2FA (ouvre un panneau : activation par QR, liste des appareils, désactiver, ajouter un appareil) ; « Appareils connectés » → « Gérer » (sessions, déconnecter un appareil, Tout déconnecter) ; « Mot de passe » → « Changer » (panneau) ou texte Google.
- Facturation : lignes Crédits restants / Équivalent / Renouvellement / Besoin de plus ? (Acheter des crédits = panneau packs → CheckoutDialog ; Changer d'offre = panneau de l'ancien bloc Tarification, même logique upgradeDialogStore / checkout annuel). Lignes ajoutées : Moyen de paiement (portail Stripe), Factures (panneau tableau + PDF), Historique des crédits (panneau, filtre par type). « Comment ça marche » (ligne Équivalent) = ancien onglet Fonctionnement. La FAQ facturation est déplacée dans le Centre d'aide (rubrique « Compte & équipe »). PaymentTestModeBanner conservée en tête.

## 3. Blocs sans vraie donnée
- Équivalent : calculé sur le solde avec ACTION_COSTS (vidéo standard 8 s / image).
- Rôle d'un membre existant : texte seul (aucune fonction serveur pour changer le rôle d'un membre ; seules les invitations ont un sélecteur).
- Carte « Ajouter une marque » : sous-titre « Nom et site de ta marque, utilisés par le chat » (la récupération auto logo/couleurs de la maquette n'existe pas).

## 4. Écarts avec la maquette
- Lignes et menus supplémentaires listés au §2 (règle 2). Barre de progression : solde / crédits du forfait.
- Les panneaux latéraux `.gx-sheet-f` : boutons de validation jamais `disabled` (la règle maquette `.gx-sheet-f .gx-btn:disabled{visibility:hidden}` les cacherait) ; la validation se fait dans les handlers.

## 5. Points à vérifier à la compilation
- `libphonenumber-js` importé directement dans profil.tsx (`parsePhoneNumberFromString`, `CountryCode`) — déjà dépendance via PhoneInput.
- `@radix-ui/react-dialog` importé directement (Root/Title/Close).
- `supabase.from("profiles").select("phone_e164, phone_country")` casté.
- Nombreux casts `any` sur les retours (`listWorkspaceMembers`, `listMySessions`, `getWorkspaceBilling`, `getBillingOverview`).
- `MoreButton` (membres) est un `forwardRef` pour `DropdownMenuTrigger asChild`.
