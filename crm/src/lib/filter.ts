import type { Client, Filters } from "@/data/types";

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

function inRange(iso: string | undefined, from: string, to: string) {
  if (!from && !to) return true;
  if (!iso) return false;
  const d = iso.slice(0, 10);
  return (!from || d >= from) && (!to || d <= to);
}

export function applyFilters(clients: Client[], f: Filters, opts: { ignoreStatuts?: boolean } = {}) {
  const q = norm(f.search.trim());
  const deps = f.departements
    .split(/[,;\s]+/)
    .map((d) => d.trim())
    .filter(Boolean);

  return clients.filter((c) => {
    if (q) {
      const hay = norm(
        [c.id, c.civilite, c.nom, c.prenom, c.email, c.adresse, c.codePostal, c.ville, c.equipe, c.commercial, ...c.telephones, ...c.telephones.map((t) => t.replace(/\s/g, ""))].join(" "),
      );
      if (!q.split(/\s+/).every((w) => hay.includes(w))) return false;
    }
    if (deps.length) {
      const match = deps.some((d) => c.codePostal.startsWith(d));
      if (f.excludeDepartements ? match : !match) return false;
    }
    if (!inRange(c.createdAt, f.createdFrom, f.createdTo)) return false;
    if (!inRange(c.rdv, f.rdvFrom, f.rdvTo)) return false;
    if (!opts.ignoreStatuts && f.statuts.length && !f.statuts.includes(c.statut)) return false;
    if (f.paiement && c.paiement !== f.paiement) return false;
    if (f.equipe && c.equipe !== f.equipe) return false;
    if (f.commercial && c.commercial !== f.commercial) return false;
    if (f.produit && !c.produits.includes(f.produit)) return false;
    if (f.nrpMin && c.nrp < Number(f.nrpMin)) return false;
    return true;
  });
}

export function activeFilterCount(f: Filters) {
  let n = 0;
  if (f.search) n++;
  if (f.departements) n++;
  if (f.createdFrom || f.createdTo) n++;
  if (f.rdvFrom || f.rdvTo) n++;
  if (f.statuts.length) n++;
  if (f.paiement) n++;
  if (f.equipe) n++;
  if (f.commercial) n++;
  if (f.produit) n++;
  if (f.nrpMin) n++;
  return n;
}
