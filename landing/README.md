# Growthity — landing page

Site statique (HTML/CSS/JS, aucune dépendance) : 29 pages `*.html`, `site.css`, `site.js` et `media/`.

Les pages sont générées : ne modifiez pas les `*.html` à la main, modifiez les sources puis lancez `python3 landing/src/build.py`.

- `src/sitemap.py` : plan du site (menu Produit / Solutions / Ressources, footer, cartes « À découvrir aussi »).
- `src/pages.py` : contenu de l'accueil, des 9 pages produit, de 4 pages solutions et des 5 ressources.
- `src/solutions.py` : les 10 pages solutions par secteur et par objectif (scénario de chat, accroches, avant / après, FAQ propres à chaque page).
- `src/blocks/` : les démos animées et sections partagées, réutilisées sur l'accueil et les pages internes.
- `src/build.py` : en-tête avec méga-menu et menu mobile, footer, composants (hero, étapes, fonctionnalités, FAQ…).

- Style clair inspiré d'arcads.ai, aux couleurs Growthity (dégradé bleu → indigo → violet, Space Grotesk / Inter), avec deux touches sombres (Espion Meta Ads, CTA final).
- Contenu aligné sur l'app Growthity (Lovable), tous secteurs. Une démo animée par fonctionnalité : chat créatif (3 scénarios), formats, éditeur, Espion Meta Ads, Studio en lot, publication Meta, performances, et 6 mini-démos. Les démos se lancent à l'écran et se mettent en pause hors écran.
- Médias réels issus de `video/public/media`, recompressés pour le web (~4 Mo au total, avec images d'aperçu `*.poster.webp`).

Aperçu local : `python3 -m http.server -d landing 8080` puis http://localhost:8080
Déploiement : déposer le dossier `landing/` tel quel sur n'importe quel hébergeur statique (Netlify, Vercel, Cloudflare Pages, OVH…).
