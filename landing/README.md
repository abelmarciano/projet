# Growthity — landing page

Page statique (HTML/CSS/JS, aucune dépendance) : `index.html` + `media/`.

- Style clair inspiré d'arcads.ai, aux couleurs Growthity (dégradé bleu → indigo → violet, Space Grotesk / Inter), avec deux touches sombres (Espion Meta Ads, CTA final).
- Contenu aligné sur l'app Growthity (Lovable) : 60+ acteurs, Studio en lot, 35+ templates vidéo, tarifs réels (Starter, Growth+, Pro), FAQ.
- Médias réels issus de `video/public/media`, recompressés pour le web (~4 Mo au total, avec images d'aperçu `*.poster.webp`).

Aperçu local : `python3 -m http.server -d landing 8080` puis http://localhost:8080
Déploiement : déposer le dossier `landing/` tel quel sur n'importe quel hébergeur statique (Netlify, Vercel, Cloudflare Pages, OVH…).
