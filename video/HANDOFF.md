# Passation — shorts & posts Growthity

Branche : `claude/eager-cerf-4d88re` (reprise de `claude/growthity-motion-design-video-g45lbu`) (dépôt `abelmarciano/projet`), dossier `video/`.

## Livré
- **5 shorts 9:16 (~22 s)**, une niche par short, médias réels du compte Growthity, voix Manon (ElevenLabs) :
  1. Bijoux e-commerce — Emma, Sarah, bracelets Trèfle / Cercle
  2. Studio de jardin — Lucas, visuels studio
  3. Produits e-commerce — Lou (smartphone pliant), porte-savon, bougie, sneakers
  4. B2B — Caroline, Lila, visuel « 32 € / lead »
  5. Restauration — artisane pâtes fraîches, plans cuisine / entrepôt
  Sorties : `out/shorts/growthity-short-N-web.mp4` (1 à 5 livrés ; short 5 : compteur « personnes touchées » retiré car chiffre inventé).
- **10 posts 4:5** (1080×1350) photo plein cadre : `out/creas/crea-01.png` … `crea-10.png`
  (source `src/creas/Creas.tsx`, rendu `node scripts/render_creas.mjs`).

- **7 posts organiques 4:5** dans `out/organiques/` (légendes : `out/organiques/LEGENDES.md`), source `src/organic/Organic.tsx`,
  rendu `node scripts/render_organic.mjs [post-0N]` :
  1. Carrousel « 5 accroches à copier » (7) — Sarah, Lila, femme bougie, Alice, porte-savon
  2. Carrousel coulisses bijou « tapé / obtenu » (6) — packshot trèfle → vidéo au poignet (Lou)
  3. Carrousel « 3 phrases, 3 pubs » (7) — Lucas, artisane pâtes, sneakers
  4. Carrousel « 6 conseils pubs vidéo Meta » (7) — Caroline, Lila, étudiant, poignet, bougie, Sarah
  5. Image « Anatomie d'une pub UGC » — Alice
  6. Image citation
  7. Image coulisses « Tapé / Obtenu » — bougie
  Les phrases affichées dans les coulisses sont reconstituées : à remplacer par les prompts exacts du compte si besoin.

## Règles du client
Vouvoiement, nom « Growthity », jamais « gratuit » (CTA « Commencer » / « Lien en bio »), jamais de pompe à chaleur,
un acteur n'apparaît qu'une fois par vidéo et jamais dans deux shorts, aucun chiffre de résultat inventé,
privilégier les médias qui font le moins IA / le plus réalistes.

## En cours / prochaines étapes
- Dépôt Google Drive des posts organiques : connecteur Google Drive non connecté sur ce compte (à faire).
- Connecteur Growthity non disponible sur ce compte : médias déjà présents dans `public/media/` utilisés.

## Pipeline
- Voix : `python3 scripts/shorts_vo.py` → `public/shorts/vo`, `src/shorts/data/sN_vo.json`
- Audio : `python3 scripts/shorts_audio.py` → `public/shorts/sN.wav`
- Aperçus : `SAFE=1 node scripts/short_stills.mjs N frame…`
- Médias : `public/media/` (vidéos du compte), `public/media/ig/` (images des posts).
  Hôtes des médias Growthity à autoriser dans le réseau de l'environnement : `v3b.fal.media`, `jmfezhvbljrravhaujmh.supabase.co`.
