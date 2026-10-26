# Landing Leadeurs (leadeurs.fr), nouvelle version

Refonte complète de la page d'accueil : React + Vite, CSS sur-mesure (pas de Tailwind), polices Bricolage Grotesque / Geist / Geist Mono.

```bash
npm install
npm run dev      # http://localhost:8080
npm run build    # site statique dans dist/
npx vite build -c vite.artifact.config.ts   # un seul fichier HTML autonome (dist-artifact/)
```

- Tous les textes sont dans `src/data.ts` (secteurs, chiffres, avis, FAQ, contacts).
- Les styles et les couleurs (variables en haut du fichier) sont dans `src/styles.css`.
- Le logo `src/assets/logo.png` a été extrait d'une capture d'écran : remplace-le par l'original en haute définition.
