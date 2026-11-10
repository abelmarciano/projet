# Recette voix UGC « vendeuse » — ElevenLabs v4

Méthode validée sur les voix Jwel (bracelet Trèfle) et Bajoah (parfum de lessive), voix Emma.

## Réglages API
- `POST /v1/text-to-speech/{voice_id}/with-timestamps`
- `model_id: "eleven_v4"`, `language_code: "fr"`
- `voice_settings`: `stability 0.2`, `similarity_boost 0.8`, `style 0.8`, `use_speaker_boost true`, `speed 1.08` (1.12 si le texte dépasse 15 s)
- Voix testées : Emma `i5Fydub7F0HPXhynAgDo` (parisienne, casual), Victoria `O31r762Gb3WFygrEOGh0`, Jeanne `txtf1EDouKke753vN8SL`

## Structure du script (≈ 45–55 mots pour 15 s)
| # | Rôle | Balise | Exemple |
|---|------|--------|---------|
| 1 | Accroche hésitante | `[excited]` … `[laughs]` | « Bon, attendez… on me demande TOUT le temps d'où il vient. » |
| 2 | Produit + marque | `[enthusiastic]` | « C'est le {produit} de {marque phonétique}. » |
| 3 | Bénéfice en langage parlé (tiré de la fiche produit, rien d'inventé) | `[warmly]` | « Franchement, il va avec tout… » |
| 4 | Avis perso | `[playful]` | « je l'enlève même plus. » |
| 5 | Prix (de la fiche produit, en toutes lettres) | `[confident, persuasive]` | « Dix-neuf euros quatre-vingt-dix-neuf. » |
| 6 | CTA | `[excited]` | « Le lien est juste en dessous, foncez ! » |

## Règles d'écriture
- Balises en anglais entre crochets : elles jouent l'intonation, elles ne sont pas lues.
- Un seul point d'exclamation, à la fin. Ailleurs : points et « … » pour les respirations.
- UN mot en MAJUSCULES pour l'insistance (« TOUT », « AUSSI »).
- Français parlé : « je peux plus », « franchement », « en vrai ». Pas de vocabulaire de fiche produit.
- Prix et chiffres en toutes lettres ; marques écrites phonétiquement (Growthity → « Grossiti »).
- Vérifier ensuite avec le speech-to-text `scribe_v1` (texte complet, durée ≤ 15 s).
