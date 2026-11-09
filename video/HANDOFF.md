# Passation — shorts & posts Growthity

Branche : `claude/growthity-motion-design-video-g45lbu` (dépôt `abelmarciano/projet`), dossier `video/`.

## Livré
- **5 shorts 9:16 (~22 s)**, une niche par short, médias réels du compte Growthity, voix Manon (ElevenLabs) :
  1. Bijoux e-commerce — Emma, Sarah, bracelets Trèfle / Cercle
  2. Studio de jardin — Lucas, visuels studio
  3. Produits e-commerce — Lou (smartphone pliant), porte-savon, bougie, sneakers
  4. B2B — Caroline, Lila, visuel « 32 € / lead »
  5. Restauration — artisane pâtes fraîches, plans cuisine / entrepôt
  Sorties : `out/shorts/growthity-short-N-web.mp4` (1 et 2 livrés ; 3, 4, 5 : voir ci-dessous).
- **10 posts 4:5** (1080×1350) photo plein cadre : `out/creas/crea-01.png` … `crea-10.png`
  (source `src/creas/Creas.tsx`, rendu `node scripts/render_creas.mjs`).

## Règles du client
Vouvoiement, nom « Growthity », jamais « gratuit » (CTA « Commencer » / « Lien en bio »), jamais de pompe à chaleur,
un acteur n'apparaît qu'une fois par vidéo et jamais dans deux shorts, aucun chiffre de résultat inventé,
privilégier les médias qui font le moins IA / le plus réalistes.

## En cours / prochaines étapes
- Si `out/shorts/growthity-short-3/4/5-web.mp4` manquent : `scripts/render_shorts.sh 3 4` puis `scripts/render_shorts.sh 5`
  (~20 min chacun ; `npm install` et `pip install --break-system-packages numpy scipy pillow` d'abord).
- Question ouverte au client : les 10 posts actuels sont des **posts pub** (CTA + logo).
  Option 1 : les garder pour Meta Ads et ajouter 6–8 posts **organiques** (carrousels, coulisses, conseils).
  Option 2 : les remplacer par des posts organiques.

## Pipeline
- Voix : `python3 scripts/shorts_vo.py` → `public/shorts/vo`, `src/shorts/data/sN_vo.json`
- Audio : `python3 scripts/shorts_audio.py` → `public/shorts/sN.wav`
- Aperçus : `SAFE=1 node scripts/short_stills.mjs N frame…`
- Médias : `public/media/` (vidéos du compte), `public/media/ig/` (images des posts).
  Hôtes des médias Growthity à autoriser dans le réseau de l'environnement : `v3b.fal.media`, `jmfezhvbljrravhaujmh.supabase.co`.
