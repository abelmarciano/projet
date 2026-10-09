import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Search, Sparkles, Megaphone, Target, UserRound, Users, ShieldCheck, Compass, Mail,
} from "lucide-react";
import { startProductTour } from "@/components/ProductTour";

/* Centre d'aide : copie de la maquette validée (landing/design/app/views/aide.html). */

export const Route = createFileRoute("/_authenticated/aide")({
  head: () => ({ meta: [{ title: "Centre d'aide - growthity.ai" }] }),
  component: HelpPage,
});

type Cat = "pub" | "meta" | "leads" | "act" | "compte" | "data";

const categories: { key: Cat; icon: typeof Sparkles; title: string }[] = [
  { key: "pub", icon: Sparkles, title: "Créer une pub" },
  { key: "meta", icon: Megaphone, title: "Publier sur Meta" },
  { key: "leads", icon: Target, title: "Leads & résultats" },
  { key: "act", icon: UserRound, title: "Acteurs & voix" },
  { key: "compte", icon: Users, title: "Compte & équipe" },
  { key: "data", icon: ShieldCheck, title: "Données & sécurité" },
];

const faq: { c: Cat; q: string; a: string }[] = [
  { c: "pub", q: "Comment créer ma première publicité ?", a: "Clique sur « Chat » dans la barre latérale, ou décris ta pub sur l'Accueil. L'assistant te guide : décris ton produit, choisis un format (UGC, image produit, carrousel) et un acteur si tu veux - la génération prend entre 1 et 4 minutes." },
  { c: "pub", q: "Combien de générations puis-je faire par heure ?", a: "Actuellement 30 générations par heure glissante par utilisateur, tous formats confondus. Ta consommation en temps réel est visible en bas de la barre latérale." },
  { c: "pub", q: "Pourquoi ma génération a échoué ?", a: "La raison exacte est indiquée sur la miniature dans « Créations » (clique dessus pour l'ouvrir). Les causes les plus fréquentes : contenu bloqué par le filtre de sécurité, image source non conforme, ou dépassement de délai côté fournisseur. Un bouton « Réessayer » relance la même génération sans re-remplir le brief." },
  { c: "pub", q: "Comment relancer une génération échouée ?", a: "Dans « Créations », clique sur la carte en échec puis « Réessayer ». Si tu veux modifier le prompt ou l'image source avant, choisis plutôt « Modifier dans le chat »." },
  { c: "pub", q: "Puis-je ajouter des sous-titres ou couper une vidéo ?", a: "Oui, depuis « Créations » chaque vidéo a un menu (⋯) avec Sous-titres et Recadrer, et l'Éditeur vidéo permet de couper, découper et assembler. La vidéo éditée s'ajoute automatiquement au dossier." },
  { c: "pub", q: "Où voir mes publicités générées ?", a: "Toutes tes créations sont dans « Créations ». Tu peux les organiser en dossiers, les télécharger, les éditer ou les publier sur Meta à tout moment." },
  { c: "meta", q: "Puis-je connecter mon compte Meta Ads Manager ?", a: "Oui. Depuis Campagnes → Nouvelle campagne, suis l'assistant de connexion Meta. Une fois connecté, tu peux publier n'importe quelle création en un clic depuis « Créations »." },
  { c: "leads", q: "Comment fonctionnent les notifications ?", a: "La cloche en haut de la sidebar te prévient quand une génération est terminée, quand une génération a échoué, ou quand il y a un souci sur une campagne Meta." },
  { c: "act", q: "Comment ajouter un acteur en favori dans la galerie ?", a: "Dans Galerie, survole une carte d'acteur et clique sur l'étoile. Retrouve ensuite tes favoris avec la puce « ★ Mes favoris »." },
  { c: "compte", q: "Comment fonctionnent les marques ?", a: "Une marque = une entreprise / un client. Chaque marque a son nom, son logo, son site et son ton. Le chat utilise automatiquement la marque active pour personnaliser prompts et copy. Tu peux switcher en un clic dans la barre latérale." },
  { c: "compte", q: "Comment inviter mon équipe ?", a: "Paramètres → Membres, saisis l'e-mail et le rôle (Admin ou Membre). L'invitation arrive par email avec un lien de rejoindre." },
  { c: "compte", q: "Quelle est la différence entre les rôles ?", a: "Le Propriétaire gère le workspace et la facturation. L'Admin peut inviter des membres et gérer les campagnes. Le Membre peut créer et éditer les pubs." },
  { c: "compte", q: "Puis-je annuler mon abonnement à tout moment ?", a: "Oui, sans engagement. Depuis Paramètres → Facturation, tu peux rétrograder ou annuler quand tu veux." },
  { c: "data", q: "Mes données sont-elles sécurisées ?", a: "Absolument. Toutes tes données sont chiffrées, isolées par workspace, et hébergées en Europe. On ne partage jamais tes créations ni tes identifiants Meta." },
];

function HelpPage() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<Cat | null>(null);
  const needle = q.trim().toLowerCase();
  const filtered = faq.filter((f) => (!cat || f.c === cat) && (!needle || (f.q + " " + f.a).toLowerCase().includes(needle)));

  return (
    <div className="gx-page">
      <div className="gx-ph">
        <div><h1>Centre d'aide</h1><p>Réponse du support sous 24 h : support@growthity.ai</p></div>
        <div className="gx-pa">
          <button type="button" className="gx-btn gx-pri" onClick={startProductTour}><Compass className="gx-i" aria-hidden />Visite guidée (1 min)</button>
          <a className="gx-btn" href="mailto:support@growthity.ai"><Mail className="gx-i" aria-hidden />Écrire au support</a>
        </div>
      </div>

      <label className="gx-srch gx-big">
        <Search className="gx-i" aria-hidden />
        <span className="gx-sr">Rechercher dans l'aide… (ex. publier, leads, crédits)</span>
        <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher dans l'aide… (ex. publier, leads, crédits)" autoComplete="off" />
      </label>

      <div className="gx-hcat">
        {categories.map((c) => (
          <button key={c.key} type="button" className="gx-box gx-hc" aria-pressed={cat === c.key}
            onClick={() => setCat((v) => (v === c.key ? null : c.key))}>
            <c.icon className="gx-i" aria-hidden /><b>{c.title}</b>
          </button>
        ))}
      </div>

      {filtered.length > 0 ? (
        <div className="gx-box gx-faq">
          {filtered.map((f, i) => (
            <details key={f.q} open={i === 0 && !needle && !cat}>
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      ) : (
        <div className="gx-empty">
          <b>Pas de réponse trouvée</b>
          <p>Écris-nous, on répond sous 24 h.</p>
          <a className="gx-btn gx-sm" href="mailto:support@growthity.ai">support@growthity.ai</a>
        </div>
      )}
    </div>
  );
}
