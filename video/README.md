# Growthity — vidéo de présentation motion design

Vidéo 1920×1080, 30 i/s, ~54 s, entièrement codée avec [Remotion](https://remotion.dev) à partir du design system Growthity (couleurs, typos Inter / Space Grotesk, dégradé bleu → indigo → violet, composants de l'app).

Rendu final : `out/growthity-promo.mp4`

## Storyboard

| # | Scène | Contenu |
|---|-------|---------|
| 1 | Intro | Le logo se dessine, wordmark `growthity.ai`, badge « Conçu & hébergé en France · IA générative » |
| 2 | Problème | Agence 3 000 € · 2 semaines · Des heures → barrés. « Et si une phrase suffisait ? » |
| 3 | Promesse | « Vos publicités Meta, générées et publiées en 2 minutes. » puis la vraie landing en 3D |
| 4 | 01 · Chat créatif | Le prompt se tape, l'IA analyse, s'inspire des pubs gagnantes, génère vidéo 9:16 + visuels |
| 5 | 02 · Formats | Reels/Stories 9:16, carrousel 1:1 animé, feed 4:5 |
| 6 | 03 · UGC | 60+ acteurs IA, sélection de Camille qui parle |
| 7 | 04 · Espion Meta Ads | Recherche, scan de la bibliothèque Meta, « Gagnant probable », bouton S'inspirer |
| 8 | 05 · Publication | Campagne prête → « Publier sur Meta » → En ligne, ciblage par département, +234 % CTR |
| 9 | Outro | « Votre prochaine campagne Meta est à une phrase. » + logo + CTA « Commencer gratuitement » |

## Commandes

```bash
npm install
npm run studio                       # prévisualiser / ajuster dans le navigateur
python3 scripts/soundtrack.py        # régénérer la bande-son (numpy + scipy)
npm run render                       # rendu MP4 → out/growthity-promo.mp4
node scripts/stills.mjs 300 900      # images de contrôle → out/stills/
```

Les durées des scènes sont dans `src/timeline.ts` (à reporter dans `scripts/soundtrack.py` si on les change).
La bande-son est synthétisée (aucune licence nécessaire) ; pour une musique sous licence, remplacer `public/soundtrack.wav`.
