# Refonte du design : contrat commun des 4 passages

Base de code Lovable : commit `8d706afcd75acf55a14179f6c6aa0609033f6e7e` (projet `2205fc8d-0cd7-42c2-8b91-987f7fc3600b`).
Audit de référence : `scratchpad/audit/design-audit.md` ; inventaire des icônes : `scratchpad/audit/icon-map.json`, `scratchpad/audit/icons-by-file.json`.

## Ordre d'application chez Lovable
1. **P1 — Icônes** : `src/components/icons.tsx` exporte les MÊMES noms que lucide-react (Plus, X, Loader2, Trash2, ChevronDown…) mais dessinés avec Hugeicons. Un script remplace `from "lucide-react"` par `from "@/components/icons"` dans tous les fichiers sauf les pages marketing (`src/components/Landing*`, `src/marketing/**`, pages publiques). Le JSX ne change pas.
   - Type exporté : `IconComponent` (et alias `LucideIcon`, `LucideProps`).
   - Les icônes ajoutent toujours `lucide lucide-<nom-kebab>` à la classe, comme lucide.
2. **P2 — Composants communs** dans `src/components/console/` + `src/styles/gx-unify.css`, et leur adoption dans les pages qui ne sont PAS dans P3.
3. **P3 — Écrans à l'ancien style** (P3a Chat, P3b Onboarding/Souscription/Paiement refusé, P3c Détail campagne/Assistant /create/wizard/Dossier de marque Batch, P3d Éditeur vidéo + 3 pages admin) : ils utilisent les composants de P2.
4. **P4 — Nettoyage de `src/styles/gx-console.css`** : suppression sûre des doublons et déclarations mortes, rendu identique.

Chaque passage est appliqué APRÈS les précédents. Donc :
- importe les icônes depuis `@/components/icons` avec les noms lucide (jamais `lucide-react`, jamais `@hugeicons/*` directement dans les pages) ;
- les scripts de remplacement ne doivent JAMAIS s'appuyer sur une ligne `import … from "lucide-react"` (P1 la modifie) ;
- un fichier entièrement remplacé doit être livré avec l'empreinte sha256 du fichier d'origine au commit de base (Lovable vérifie qu'il n'a pas changé, sinon il s'arrête et signale).

## API des composants communs (P2 les écrit, P3 les utilise)
Tous dans `src/components/console/` ; export nommé ; textes en français au tutoiement.

```ts
// PageHeader.tsx : en-tête de page unique (classe .gx-ph existante, harmonisée)
export function PageHeader(p: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;          // boutons à droite (passent dessous sur mobile)
  back?: { to: string; label: string; params?: Record<string, string>; search?: Record<string, unknown> };
  eyebrow?: React.ReactNode;          // petit libellé au-dessus du titre (facultatif)
}): JSX.Element;

// BackLink.tsx : lien « ← Retour » unique
export function BackLink(p: { to: string; label: string; params?: Record<string, string>; search?: Record<string, unknown> }): JSX.Element;

// ConsoleEmpty.tsx : état vide unique
export function ConsoleEmpty(p: { icon?: IconComponent; title: string; text?: React.ReactNode; action?: React.ReactNode; compact?: boolean }): JSX.Element;

// ConsoleLoading.tsx : chargement unique
export function ConsoleLoading(p: { label?: string; variant?: "page" | "block" | "inline" }): JSX.Element;   // « Chargement… » par défaut
export function ConsoleSkeleton(p: { rows?: number; variant?: "list" | "cards" | "table" }): JSX.Element;

// ConfirmDialog.tsx : confirmation unique (AlertDialog shadcn habillé console)
export function ConfirmDialog(p: {
  open: boolean; onOpenChange: (o: boolean) => void;
  title: string; description?: React.ReactNode;
  confirmLabel: string; cancelLabel?: string;   // « Annuler » par défaut
  danger?: boolean; busy?: boolean;
  onConfirm: () => void | Promise<void>;
}): JSX.Element;

// StatTile.tsx : tuile de chiffre unique
export function StatTile(p: { label: string; value: React.ReactNode; sub?: React.ReactNode; tone?: "default" | "ok" | "warn" | "danger"; icon?: IconComponent }): JSX.Element;
```

## Boutons (une seule famille)
- `.gx-btn` secondaire (contour), `.gx-btn.gx-pri` **primaire violet plat** (le seul primaire), `.gx-btn.gx-danger` destructif rouge, `.gx-btn.gx-ghost` discret, taille `.gx-sm`.
- Le dégradé (`gx-grad`, `gx-go`, `bg-grad`) et le noir ne sont plus des boutons primaires.
- Le composant shadcn `<Button>` est habillé par P2 pour donner exactement le même rendu dans `.console-app` (default → pri, destructive → danger, outline/secondary → btn, ghost → ghost), sans toucher aux pages marketing.

## Règles
- Ne retirer aucune fonctionnalité, ne changer aucune logique, aucun gestionnaire, aucun lien.
- Ne pas toucher aux pages marketing ni au logo.
- Textes visibles en français, au tutoiement ; pas d'emoji comme icône dans l'interface.
- Jetons `--gx-*` uniquement (pas de couleurs Tailwind par défaut, pas d'hexadécimal en dur), clair ET sombre, 390 px sans défilement horizontal.
