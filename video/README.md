# Growthity — vidéo de présentation motion design

Vidéo 1920×1080, 30 i/s, ~50 s, entièrement codée avec [Remotion](https://remotion.dev) à partir du design system Growthity (couleurs, typos Inter / Space Grotesk, dégradé bleu → indigo → violet, composants de l'app).

Rendu final : `out/growthity-promo.mp4`

## Storyboard (v2, ~50 s)

| # | Scène | Contenu |
|---|-------|---------|
| 1 | Problème | Agence 3 000 € · 2 semaines · Des heures → barrés. « Et si une phrase suffisait ? » |
| 2 | Promesse | « Vos publicités Meta, générées et publiées en 2 minutes. » |
| 3 | 01 · Chat créatif | Le prompt pompe à chaleur se tape, l'IA écrit le script, choisit l'actrice et répond par la **vraie vidéo UGC de Charlotte** (avec sa voix), qui s'agrandit en plein téléphone |
| 4 | 02 · Acteurs UGC | « 500+ acteurs IA » : vraies vidéos d'acteurs Growthity en éventail, sélection automatique |
| 5 | 03 · Formats | Vidéo UGC 9:16, carrousel 1:1 (bougie, sneakers, MacBook), feed 4:5 |
| 6 | 04 · Espion Meta Ads | Bibliothèque Meta, vraies pubs, « Gagnant probable », bouton S'inspirer |
| 7 | 05 · Publication | Campagne → « Publier sur Meta » → En ligne, ciblage par département, +234 % CTR |
| 8 | Outro | « Votre prochaine campagne Meta est à une phrase. » + logo animé + CTA |

Médias réels dans `public/media/` (vidéos UGC et visuels issus du compte Growthity).

## Commandes

```bash
npm install
npm run studio                       # prévisualiser / ajuster dans le navigateur
python3 scripts/soundtrack.py        # régénérer la bande-son (numpy + scipy)
npm run render                       # rendu MP4 → out/growthity-promo.mp4
node scripts/stills.mjs 300 900      # images de contrôle → out/stills/
```

Les durées des scènes sont dans `src/timeline.json` (lu aussi par `scripts/soundtrack.py`).
La bande-son est synthétisée (aucune licence nécessaire) ; pour une musique sous licence, remplacer `public/soundtrack.wav`.
