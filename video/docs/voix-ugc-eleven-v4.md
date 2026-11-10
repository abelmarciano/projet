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
| 1 | Accroche (type tiré au sort, voir banque) | `[excited]`, `[laughs]`, `[curious]`, `[whispers]`… | « Bon, attendez… on me demande TOUT le temps d'où il vient. » |
| 2 | Produit + marque | `[enthusiastic]` | « C'est le {produit} de {marque phonétique}. » |
| 3 | Bénéfice en langage parlé (tiré de la fiche produit, rien d'inventé) | `[warmly]` | « Franchement, il va avec tout… » |
| 4 | Avis perso | `[playful]` | « je l'enlève même plus. » |
| 5 | Prix (de la fiche produit, en toutes lettres) | `[confident, persuasive]` | « Dix-neuf euros quatre-vingt-dix-neuf. » |
| 6 | CTA (adapté au CTA Meta de la pub) | `[excited]`, `[warmly]`… | « Le lien est juste en dessous, foncez ! » |

## Règles d'écriture
- Balises en anglais entre crochets : elles jouent l'intonation, elles ne sont pas lues.
- Un seul point d'exclamation, à la fin. Ailleurs : points et « … » pour les respirations.
- UN mot en MAJUSCULES pour l'insistance (« TOUT », « AUSSI »).
- Français parlé : « je peux plus », « franchement », « en vrai ». Pas de vocabulaire de fiche produit.
- Prix et chiffres en toutes lettres ; marques écrites phonétiquement (Growthity → « Grossiti »).
- Vérifier ensuite avec le speech-to-text `scribe_v1` (texte complet, durée ≤ 15 s).

## Variété : ne jamais reproduire les exemples
Les phrases ci-dessus sont des **exemples de ton**, pas un texte à recopier. Le script est écrit à chaque fois par l'IA
à partir de la fiche produit, de la niche et de la cible, en choisissant :

**Type d'accroche** (un par pub, jamais le même deux fois de suite pour un même utilisateur) :
- question à la caméra (« Vous aussi, votre linge sent le renfermé au bout de deux jours ? »)
- réponse à un commentaire (« On m'a demandé en commentaire… »)
- aveu / anecdote (« J'ai longtemps cru que… »)
- objection retournée (« Non, ce n'est pas trop cher, et je vous explique pourquoi. »)
- découverte (« Il faut que je vous montre un truc. »)
- avant / après, chuchoté, POV, liste (« Trois raisons pour lesquelles… »)

**Fin / CTA** : déduit du bouton Meta de la pub et du canal (« Commander », « En savoir plus », « Réserver »,
formulaire de leads, magasin physique…) et formulé différemment à chaque fois ; un CTA sans « foncez » ni lien est possible.

**Balises** : choisies selon l'émotion de chaque phrase (`[curious]`, `[surprised]`, `[whispers]`, `[sighs]`, `[laughs]`,
`[excited]`, `[warmly]`, `[confident]`, `[serious]`…), pas une séquence fixe.

**Garde-fous** : comparer avec les 10 derniers scripts de l'utilisateur et régénérer si l'accroche ou la fin se ressemblent ;
aucun chiffre ni bénéfice absent de la fiche produit ; ton adapté à la marque (luxe ≠ fitness ≠ B2B).
