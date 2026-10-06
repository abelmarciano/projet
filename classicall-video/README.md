# Classicall — vidéo de présentation motion design

Vidéo 1920×1080, 30 i/s, H.264 (CRF 18), **74,1 s**, avec voix off française et musique (AAC 192 kb/s, −14 LUFS). Composée avec [Remotion](https://remotion.dev)
à partir de **vraies captures** de l'application (`../screenshots/`, voir `../capture/README.md`).

Rendu final : `../video-crm.mp4` · Aperçus : `../apercus/`

## Charte appliquée

- Couleurs de l'app : bleu océan `#0EA5E9`, marine `#002F79`, texte `#17203A`, dégradé `#D3E4FD → #F1F0FB → #FFFFFF`, couleurs de statuts.
- Typo : Nunito 400–800 (fichiers Google Fonts embarqués via `@fontsource/nunito`, le rendu se faisant hors ligne).
- Cartes blanches rayon 12 px, ombres douces ; captures toujours encadrées dans une carte.
- Entrées : fondu + translation Y 16–18 px, 500 ms ; fondus croisés de 0,5 s entre scènes ; zoom lent 1,00 → 1,06.
- Contrôle automatique : une ligne de texte de plus de 6 mots fait échouer le rendu (`Caption`).

> L'interface du CRM utilise la police système (Nunito n'y est appliquée qu'au logo). Les captures montrent donc l'UI telle
> qu'elle est réellement ; tout le texte de mise en scène de la vidéo est en Nunito.

## Son

- **Voix off** : synthèse vocale française hors ligne ([Piper](https://github.com/rhasspy/piper), voix `fr-siwis-medium`),
  une prise par scène (`scripts/voiceover.py` → `public/vo/`). Les durées des scènes sont recalculées pour que la voix
  ne soit jamais coupée (`src/data/timing.json`).
- **Musique** : composition originale synthétisée (`scripts/soundtrack.py`), donc sans problème de droits : nappe,
  basse, arpèges, 110 BPM ; version sombre pendant la scène « problème ». Musique à −18 dB sous la voix quand elle parle,
  −11 dB dans les pauses, fondu d'entrée 1 s et de sortie 2,5 s, plus des transitions sonores.
- Pour utiliser ta propre musique (MP3/WAV) : remplacer la musique dans `scripts/soundtrack.py`
  par le fichier, mêmes règles de niveau.

| # | Texte dit par la voix |
|---|-----------------------|
| 1 | Tu ouvres ta régie ? |
| 2 | Trop de leads, et zéro organisation ? |
| 3 | Classicall. Le meilleur CRM pour ta régie. |
| 4 | Suis tes rendez-vous, tes leads, et tes poses. |
| 5 | Tous tes leads, en un coup d'œil. |
| 6 | Filtre par statut, par département, ou par campagne. |
| 7 | Les doublons ? Détectés automatiquement. |
| 8 | Chaque fiche est complète, et tout l'historique est conservé. |
| 9 | Ton planning commercial est prêt, pour toute l'équipe. |
| 10 | L'optimiseur calcule tes tournées : jamais plus de deux heures de route. |
| 11 | Comptabilité, commissions, rentabilité : tout est suivi. |
| 12 | Tes leads arrivent en instantané, avec les connecteurs Claude et ChatGPT. |
| 13 | Deux cent cinquante euros par mois. Sans engagement, sans frais de mise en service. |
| 14 | Classicall. Appelle le 07 82 17 07 81. |

## Storyboard (durées en images, fondu croisé de 15 images)

| # | Scène | Durée | Visuel |
|---|-------|-------|--------|
| 1 | Ouverture | 4 s | Logo + ondes · « Tu ouvres ta régie ? » |
| 2 | Problème | 5 s | Fond sombre, cartes désorganisées qui s'entrechoquent |
| 3 | Solution | 4,5 s | 4 cartes métriques réelles + compteurs |
| 4 | Statistiques | 5,5 s | Graphique réel, barres qui montent |
| 5 | Tableau leads | 6,5 s | Table déroulée ligne par ligne, badges qui s'allument |
| 6 | Filtres | 5 s | Filtres avancés réels cochés en cascade |
| 7 | Doublons | 5 s | Zoom sur le badge DOUBLON + infobulle « même numéro » |
| 8 | Fiche lead | 6,5 s | Accordéon réel : client, assignation, produits, commentaires, historique |
| 9 | Planning | 7 s | Vue semaine, RDV révélés jour par jour |
| 10 | Optimiseur | 6,5 s | Carte de France → région lyonnaise, itinéraire réel calculé (77 km, 1 h 41) |
| 11 | Comptabilité | 5,5 s | Factures de ventes, montants qui défilent |
| 12 | API & IA | 5,5 s | Réseau de connecteurs, leads qui circulent, Claude & ChatGPT |
| 13 | Prix | 6 s | 250 €/mois · Sans engagement · Sans frais de mise en service |
| 14 | Clôture | 8 s | Logo + 07 82 17 07 81 |

## Commandes

```bash
npm install
pip install piper-tts scipy     # + modèle fr-siwis-medium (github.com/rhasspy/piper, release v0.0.2)
python3 scripts/prepare.py      # variantes « vides » des captures (graphique, planning) + itinéraire
PIPER_MODEL=fr-siwis-medium.onnx python3 scripts/voiceover.py   # voix off + durées des scènes
python3 scripts/soundtrack.py   # musique + mixage → public/bande-son.wav
npm run studio                  # prévisualisation
node scripts/stills.mjs 300 900 # images de contrôle → out/stills/
npm run render                  # → out/video-crm.mp4
```
