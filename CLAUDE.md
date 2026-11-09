# Growthity — consignes pour Claude

Répondre en français, vouvoiement. Règles de contenu : nom « Growthity », jamais « gratuit » (CTA « Commencer » / « Lien en bio »),
jamais de pompe à chaleur, un acteur une seule fois par contenu et jamais dans deux shorts, aucun chiffre de résultat inventé,
toujours les médias les plus réalistes. Voir aussi `video/HANDOFF.md`.

## Plateforme de contenus « Growthity Studio »

- URL : https://claude.ai/artifact/TL8cUcud2Kfis2A92fFApC (source : `studio/index.html`)
- Rubriques : Planning (calendrier), Posts (tableau par statut), Ads (Meta), Médias (bibliothèque 9:16 / 4:5 / 1:1 / 16:9).
- Données (base de l'artifact) :
  - `media/{id}` : `{title, kind: video|image|carousel, format: '9:16'|'4:5'|'1:1'|'16:9', items: [{asset, ct, poster?}], niche, note, source: 'claude'|'upload', createdAt (ms), createdBy}`
  - `posts/{id}` : `{type: post|ad, title, mediaId, format, networks[], caption, date: 'YYYY-MM-DDTHH:MM' | '', status, ad: {objective, budget, cta, link, audience} | null, createdAt, updatedAt}`
  - statuts post : idea, make, review, sched, live — statuts ad : draft, review, ready, live, pause, done
  - champs en plus : media `category` (Hook, Transitions, Stitch, Short Growthity, Reel Growthity, Carrousel, Post organique, Visuel pub…),
    media `drive: {id, url, file, folder}` (vidéo restée sur Drive, sans `items`), `redo: {note, at, by} | null` sur media et posts,
    post `launch: {week, slot}` pour le plan de lancement ; `config/launch` = date J0, cadence, semaines, note ads.
  - Rubriques : Accueil, Planning, Posts, Ads, Médias, Lancement. Plan et légendes : `studio/data/launch_content.py`.

### Quand l'utilisateur demande de générer une vidéo ou des images

Chaque création doit arriver directement dans la plateforme :
1. Rendre les fichiers (PNG/JPEG pour les images, MP4 « -web » pour les vidéos + une vignette JPEG extraite à ~1 s).
2. Les envoyer avec l'outil Artifact : `url` ci-dessus, `asset: true`, `file_paths` (25 max par appel). Noter les ids.
3. Créer la fiche `media/{id}` (et si demandé un `posts/{id}` en statut « idea » ou « review ») avec ArtifactData (`batch`).
4. Commiter les fichiers sources/rendus dans le dépôt.

Reels organiques : `video/src/reels` (reels.json), audio `python3 video/scripts/reels_audio.py`, rendu `video/scripts/render_reels.sh 6 7 …`.
Drive : vidéos finales rangées dans CREA-POST › Growthity-video › 3_Finales › <catégorie> (Hook, Transitions…), liste dans `studio/data/drive_videos.json`.

Google Drive : le connecteur ne permet d'envoyer des images qu'en base64 dans la conversation (trop lourd au-delà de quelques Ko).
Dossiers créés : CREA-POST › IMAGES › « Carrousel 1…4 », « Posts simples organiques (5-6-7) ».
