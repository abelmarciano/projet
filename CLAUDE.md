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

### Catégorie « Du chat à la pub » (demande type : « fais-moi un Du chat à la pub avec <vidéo>, acteur X, produit Y »)
1. Mettre la vidéo dans `video/public/media/chat/`, copier `video/src/chatpub/cp1.json` en `cpN.json` (prompt, acteur, produit ou null,
   marque fictive liée au sujet ou `brand: null` pour marque blanche, galerie d'acteurs réalistes, `videoFrames`).
2. Voix off ElevenLabs (clé injectée par le proxy) : textes dans `video/src/voice/voices.json`, `python3 video/scripts/voice_tts.py …`,
   normaliser (`loudnorm=I=-13`) en `*-n.mp3`, recopier les mots dans `cpN.json` (`words`).
3. `python3 video/scripts/chatpub_audio.py cpN` puis enregistrer la composition `ChatPub-cpN` dans `Root.tsx` et rendre.
4. Transcrire la vidéo source avec ElevenLabs speech-to-text (`scribe_v1`) pour vérifier ce que dit l'acteur.
UI du chat reproduite : écran « Que veux-tu créer aujourd'hui ? », puces marque / « Ajouter un acteur » / « Catalogue »,
fenêtre « Choisir un acteur », cartes ACTEUR/PRODUIT au-dessus du message, carte résultat « Prête » + « Publier sur Meta ».
Acteurs : seulement les réalistes (`studio/data/actors_growthity.json`, `realiste: true`).

Version retenue : motion design (`video/src/chatpub/MotionChatPub.tsx`, composition `ChatPubMotion-cpN`, son `scripts/chatpub_motion_audio.py cpN`,
timing `src/chatpub/motion_timeline.json`). Quand Abel envoie une pub brute à monter puis à intégrer :
1. `python3 video/scripts/ad_prepare.py <video> <id>` (transcription ElevenLabs, coupe des blancs, mots recalés) → `src/chatpub/ad-<id>.json`.
2. Composition `AdEdit-<id>` (`src/chatpub/AdEdit.tsx` : coupes, zooms, flashs, sous-titres animés mot par mot) → rendre en
   `public/media/chat/<id>-edit.mp4`, puis mettre ce fichier comme `video` (+ `videoFrames`) et adapter `prompt`/`promptShort` dans `cpN.json`.

Voix off : écrire « Grossiti » dans le texte envoyé à ElevenLabs pour une prononciation française de « Growthity », puis remettre « Growthity » dans les mots (sous-titres). Voix retenue : « Hugo – Punchy French Creator » (3Tp5mYhT9wrfnry9pzvV). Pas de « Lien en bio » à la fin des « Du chat à la pub ».

### Publication réseaux (Zernio)
Connecteur claude.ai « Zernio » (comptes : Instagram growthity.ai, Facebook Growthity AI). Dans Studio, éditeur d'un post enregistré →
bloc « Publier avec Zernio » : média envoyé via `media_get_media_presigned_url` (PUT direct, CORS ouvert), puis `posts_create`
par compte (publish_now ou schedule_minutes jusqu'à la date du post). Résultat stocké dans `posts/{id}.zernio = {at, by, mode, when, results[]}`
et statut passé à « live » ou « sched ». Capability page : `mcp: {servers: [{server: 'Zernio', tools: [accounts_list, posts_create, call_tool]}]}`.
