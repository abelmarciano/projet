# Captures Classicall

Captures **du vrai front** du CRM Classicall (dépôt `abelmarciano/crmregie1`), lancé en local avec Vite.
Le backend Supabase est simulé dans Playwright (`postgrest.mjs`) avec un jeu de **données de démo** (`data.mjs`) :
noms français fictifs, téléphones 06/07, villes françaises. Aucune donnée client réelle n'est utilisée ni affichée.

```bash
# 1. lancer le CRM
cd ../crmregie1 && npm install && npx vite --host 127.0.0.1 --port 8080
# 2. capturer (1920×1080, deviceScaleFactor 2) → ../screenshots/
npm install && node extract-schema.mjs ../crmregie1/src/integrations/supabase/types.ts
CRM_URL=http://127.0.0.1:8080 node capture.mjs            # tout
CRM_URL=http://127.0.0.1:8080 node capture.mjs planning   # une étape
```

- `harness.mjs` : session de démo, interception Supabase, Nunito servie en local, scrollbars masquées.
- `calculate-distance` est simulé avec des distances routières estimées à partir des vraies coordonnées des villes ;
  le résultat affiché par l'app est enregistré dans `screenshots/planning-optimizer.json` et réutilisé par la vidéo.
