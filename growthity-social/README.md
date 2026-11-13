# Module « Réseaux sociaux » pour Growthity (Zernio)

Page `/reseaux` dans la console Growthity, au même style que les autres écrans (classes `gx-*`) :

- **Calendrier** : vue mois, publications par jour, glisser-déposer pour changer la date, colonne « À planifier ».
- **Publications** : tableau Idées / Brouillons / Programmées / Publiées / Échecs.
- **Comptes** : connecter / déconnecter Instagram, Facebook, TikTok, LinkedIn, YouTube, Pinterest (fenêtre officielle de chaque réseau via Zernio).
- **Fenêtre d'édition** : choisir une création Growthity de la marque, légende, réseaux, date → Enregistrer, Programmer ou Publier ; résultat avec lien du post.

Chaque **marque** Growthity a son propre profil Zernio (`externalId = brand_<id>`) : les comptes et publications sont cloisonnés par marque.

## Fichiers

| Fichier | Rôle |
|---|---|
| `supabase/migrations/20261113120000_social_publishing.sql` | Tables `social_profiles`, `social_accounts`, `social_posts` + RLS |
| `src/lib/zernio.server.ts` | Appels à l'API Zernio (serveur uniquement), profil par marque, envoi des médias |
| `src/lib/social.functions.ts` | Fonctions serveur TanStack (`createServerFn` + `requireSupabaseAuth`) |
| `src/routes/_authenticated/reseaux.tsx` | La page |
| `src/components/social/SocialHub.tsx` | Calendrier, tableau, comptes, fenêtre d'édition |
| `src/styles/gx-social.css` | Styles complémentaires (variables `--gx-*`, `gx-console.css` reste intact) |

## Installation

1. **Secrets** (Lovable Cloud → Secrets) :
   - `ZERNIO_API_KEY` : clé créée sur zernio.com → Dashboard → API keys.
   - `APP_URL` : `https://app.growthity.ai` (adresse de retour après connexion d'un réseau).
2. **Copier les fichiers** aux mêmes chemins dans le projet Lovable, puis appliquer la migration SQL.
3. **Menu** : ajouter l'entrée « Réseaux sociaux » (icône `Share2` de lucide-react) vers `/reseaux`, après « Campagnes ».
4. **Marque Growthity sur l'écran de connexion** (une seule fois) :
   ```bash
   curl -X PUT "https://zernio.com/api/v1/connect/welcome-screen" \
     -H "Authorization: Bearer $ZERNIO_API_KEY" -H "Content-Type: application/json" \
     -d '{"showByDefault": true, "brandName": "Growthity", "logoUrl": "https://growthity.ai/favicon.svg", "theme": {"primaryColor": "#5B3FE4", "cornerRadius": 12}}'
   ```

## À vérifier avant la mise en ligne

- **Droits par marque** : la RLS donne accès à tous les membres du workspace. Si un membre ne doit voir que certaines marques (`workspace_member_brands`, `all_brands`), aligner les politiques sur la règle déjà utilisée pour `ads` / `brands`.
- **Médias** : la bibliothèque lit `ads.generated_url`. Si certaines créations ne sont qu'en stockage privé (`playback_path`, `poster_path`), générer une URL signée côté serveur dans `listSocialLibrary`.
- **Déconnexion** : `DELETE /v1/accounts/{id}`. À confirmer dans la doc Zernio (rubrique Accounts) au premier test.
- **TikTok** : publié en public, commentaires/duo/collage autorisés (champs obligatoires de TikTok). Ajouter des options dans la fenêtre si besoin.
- **Statuts** : `refreshSocialPost` (bouton « Actualiser ») relit l'état chez Zernio. Pour une mise à jour automatique, brancher plus tard le webhook Zernio (`post.published`, `post.failed`, `account.disconnected`).

## Prompt à coller dans Lovable

> Ajoute le module « Réseaux sociaux » à partir des fichiers fournis (je les colle ci-dessous) sans modifier `src/styles/gx-console.css`.
> 1. Crée les fichiers aux chemins indiqués et applique la migration SQL.
> 2. Ajoute l'entrée de menu « Réseaux sociaux » (icône Share2) vers `/reseaux`, après « Campagnes », en desktop et dans le tiroir mobile.
> 3. Vérifie que les politiques RLS des tables `social_*` respectent le même cloisonnement par marque que la table `ads` ; adapte-les si nécessaire.
> 4. Les secrets `ZERNIO_API_KEY` et `APP_URL` sont configurés ; ne les expose jamais côté client.
> 5. Ne lance aucune publication réelle pendant tes tests.
