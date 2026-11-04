// Regroupe les campagnes Meta par produit et choisit la bonne référence de comparaison.
// Un même compte publicitaire sert souvent plusieurs produits (carport, pompe à chaleur…) :
// comparer une campagne à la moyenne de tout le compte n'a pas de sens. On la compare
// à son produit, avec le même objectif ; s'il n'y a pas assez de campagnes dans le produit,
// on revient au même objectif sur le même compte, et on le dit.
// Aucune valeur propre à un client n'est codée ici : tout vient des noms de campagnes et de pubs.
//
// Règles de regroupement (v45, plus strictes) :
// - jamais deux comptes publicitaires dans le même groupe ;
// - le produit, c'est le premier mot de produit du NOM DE LA CAMPAGNE ;
// - le nom des pubs ne sert que si la campagne n'a aucun mot de produit, et ne relie jamais deux groupes ;
// - on ignore les dates collées (26OCT, 1JUIN…) et les préfixes de marque (un mot présent dans la plupart des campagnes
//   d'un compte ET toujours suivi d'un autre mot de produit, ex. « Ecolity Carport », « Ecolity PAC ») ;
// - v46 : quand le nom contient plusieurs mots de produit, on garde celui qui revient le plus dans le compte
//   (« JOSH PAC V1 » → PAC, « TEST-PV-15JUIN-NEWCREA » → PV).

export type ObjectiveKind = "leads" | "sales" | "traffic" | "awareness" | "engagement";

export const OBJECTIVE_LABELS: Record<ObjectiveKind, { tab: string; result: string; one: string; many: string; cost: string }> = {
  leads: { tab: "Leads", result: "Leads reçus", one: "lead", many: "leads", cost: "Coût par lead" },
  sales: { tab: "Ventes", result: "Achats", one: "achat", many: "achats", cost: "Coût par achat" },
  traffic: { tab: "Trafic", result: "Clics vers le site", one: "clic", many: "clics", cost: "Coût par clic" },
  awareness: { tab: "Notoriété", result: "Personnes touchées", one: "personne", many: "personnes", cost: "Coût pour 1 000 personnes" },
  engagement: { tab: "Messages et interactions", result: "Interactions", one: "interaction", many: "interactions", cost: "Coût par interaction" },
};

/** Objectif Meta (ancien ou nouveau nom) → famille affichée. */
export function objectiveKind(objective?: string | null): ObjectiveKind {
  const o = String(objective ?? "").toUpperCase();
  if (o.includes("LEAD")) return "leads";
  if (/SALES|CONVERSION|CATALOG|PURCHASE|STORE_VISIT|PRODUCT/.test(o)) return "sales";
  if (/AWARENESS|REACH|BRAND|VIDEO_VIEW|THRUPLAY/.test(o)) return "awareness";
  if (/ENGAGEMENT|MESSAGE|POST|PAGE_LIKE|EVENT|APP/.test(o)) return "engagement";
  return "traffic";
}

/** Mots qui décrivent la façon de faire la pub, pas le produit : ignorés pour regrouper. */
const NOISE = new Set([
  "campagne", "campagnes", "campaign", "pub", "pubs", "publicite", "ads", "ad", "annonce",
  "lead", "leads", "vente", "ventes", "sales", "conversion", "conversions", "trafic", "traffic", "notoriete", "awareness",
  "engagement", "messages", "message", "formulaire", "form", "instant", "instantane",
  "test", "tests", "abtest", "copie", "copy", "nouveau", "nouvelle", "new", "v", "version",
  "fr", "france", "be", "ch", "lu", "ca", "national", "local", "region", "global", "globale", "general", "generale",
  "broad", "large", "lal", "lookalike", "similaire", "retargeting", "relance", "remarketing", "visiteurs", "audience", "audiences",
  "interets", "interet", "chaud", "froid", "cold", "warm", "hot", "tof", "mof", "bof",
  "cbo", "abo", "advantage", "asc", "adv", "plus",
  "hiver", "ete", "printemps", "automne", "noel", "blackfriday", "black", "friday", "soldes", "promo", "promotion", "rentree",
  "janvier", "fevrier", "mars", "avril", "mai", "juin", "juillet", "aout", "septembre", "octobre", "novembre", "decembre",
  "janv", "fevr", "fev", "avr", "juil", "sept", "oct", "nov", "dec",
  "ugc", "video", "videos", "image", "images", "carrousel", "carousel", "story", "stories", "reels", "reel", "feed",
  "meta", "facebook", "instagram", "fb", "ig", "growthity", "marque", "blanche",
  "de", "du", "des", "la", "le", "les", "l", "d", "et", "a", "au", "aux", "pour", "en", "sur", "avec", "sans", "un", "une",
  "the", "and", "for", "of", "with",
]);

const MONTH = "(?:janv?|fevr?|fev|mars?|avr|mai|juin|juil|aout|aou|sept?|oct|nov|dec)[a-z]*";
/** Dates collées : 26oct, 1juin, oct26, 2026, 26/10 découpé en nombres… */
const DATE_RE = new RegExp(`^(?:\\d{1,2}${MONTH}(?:\\d{2,4})?|${MONTH}\\d{1,4})$`);

function fold(s: string) {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

/** Mots significatifs d'un nom, dans l'ordre, avec leur forme d'origine pour l'affichage. */
export function productTokens(name: string): Array<{ key: string; label: string }> {
  const out: Array<{ key: string; label: string }> = [];
  for (const raw of String(name ?? "").split(/[^\p{L}\p{N}]+/u)) {
    if (!raw) continue;
    const key = fold(raw);
    if (key.length < 2 || NOISE.has(key) || /^\d+$/.test(key) || /^v\d+$/.test(key) || /^(19|20)\d\d/.test(key) || DATE_RE.test(key)) continue;
    // Pluriel simple : « carports » et « carport » sont le même produit.
    out.push({ key: key.length > 4 && key.endsWith("s") ? key.slice(0, -1) : key, label: raw });
  }
  return out;
}

export type CampaignInput = {
  id: string;
  name: string;
  objective?: string | null;
  accountId?: string | null;
  /** Noms des pubs de la campagne, s'ils sont connus : ils servent seulement si le nom de la campagne ne dit pas le produit. */
  adNames?: string[];
  spend: number;
  results: number;
  revenue?: number;
};

export type ManualGroup = { id: string; name: string; campaignIds: string[] };

export type ProductGroup = {
  id: string;
  name: string;
  /** "manuel" : groupe créé par le client ; "auto" : reconnu d'après les noms. */
  source: "manuel" | "auto";
  campaignIds: string[];
};

/** Nombre de campagnes du compte dont le nom contient chaque mot de produit. */
function tokenCounts(list: CampaignInput[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const c of list) for (const k of new Set(productTokens(c.name).map((t) => t.key))) counts.set(k, (counts.get(k) ?? 0) + 1);
  return counts;
}

/**
 * Préfixes de marque d'un compte : mot présent dans au moins 60 % des campagnes (4 campagnes minimum)
 * ET placé en tête du nom, suivi d'un autre mot de produit, dans au moins 80 % d'entre elles.
 * « PV » seul dans « TEST-PV-22JUIN » ou « PAC » dans « JOSH PAC V1 » ne sont donc pas des préfixes.
 */
function accountCommonTokens(list: CampaignInput[], counts: Map<string, number>): Set<string> {
  const common = new Set<string>();
  if (list.length < 4) return common;
  for (const [k, n] of counts) {
    if (n / list.length < 0.6) continue;
    // Un préfixe est placé EN TÊTE du nom et suivi d'un autre mot de produit (« Ecolity Carport »).
    const asPrefix = list.filter((c) => { const t = productTokens(c.name).map((x) => x.key); return t[0] === k && t.length > 1; }).length;
    if (asPrefix / n >= 0.8) common.add(k);
  }
  return common;
}

/**
 * Le produit d'une campagne : parmi les mots de produit de son nom, celui qui revient dans le plus de campagnes du compte
 * (à égalité, le premier) ; sinon le mot le plus fréquent de ses pubs (au moins 2 pubs).
 */
function productKey(c: CampaignInput, ignore: Set<string>, counts: Map<string, number>): { key: string; label: string } | null {
  const own = productTokens(c.name);
  const usable = own.filter((t) => !ignore.has(t.key));
  if (usable.length) return usable.reduce((best, t) => ((counts.get(t.key) ?? 0) > (counts.get(best.key) ?? 0) ? t : best), usable[0]);
  if (own.length) return own[0]; // tous les mots sont « communs » : on garde quand même le premier
  const adCounts = new Map<string, { n: number; label: string }>();
  for (const ad of c.adNames ?? []) {
    for (const t of productTokens(ad)) {
      if (ignore.has(t.key)) continue;
      const cur = adCounts.get(t.key);
      adCounts.set(t.key, { n: (cur?.n ?? 0) + 1, label: cur?.label ?? t.label });
    }
  }
  const top = [...adCounts.entries()].filter(([, v]) => v.n >= 2).sort((a, b) => b[1].n - a[1].n)[0];
  return top ? { key: top[0], label: top[1].label } : null;
}

function prettyName(label: string) {
  const s = label.trim();
  if (!s) return "Sans nom";
  // Sigles courts (PV, PPV, PAC) toujours en majuscules ; « CARPORT » → « Carport ».
  if (s.length <= 4 && /^[\p{L}]+$/u.test(s)) return s.toUpperCase();
  if (s === s.toUpperCase() && s.length > 4) return s.charAt(0) + s.slice(1).toLowerCase();
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * Regroupe les campagnes par produit, compte publicitaire par compte publicitaire.
 * - Les groupes créés à la main passent toujours en premier.
 * - Deux campagnes vont ensemble seulement si elles sont sur le même compte ET ont le même mot de produit.
 * - Une campagne sans aucun mot de produit reste seule, sous son propre nom.
 */
export function groupCampaigns(campaigns: CampaignInput[], manual: ManualGroup[] = []): ProductGroup[] {
  const taken = new Set<string>();
  const groups: ProductGroup[] = [];
  for (const g of manual) {
    const ids = g.campaignIds.filter((id) => campaigns.some((c) => c.id === id) && !taken.has(id));
    ids.forEach((id) => taken.add(id));
    if (ids.length) groups.push({ id: `manuel:${g.id}`, name: g.name, source: "manuel", campaignIds: ids });
  }
  const rest = campaigns.filter((c) => !taken.has(c.id));
  const byAccount = new Map<string, CampaignInput[]>();
  for (const c of rest) {
    const a = c.accountId ?? "";
    byAccount.set(a, [...(byAccount.get(a) ?? []), c]);
  }
  for (const [account, list] of byAccount) {
    const counts = tokenCounts(list);
    const ignore = accountCommonTokens(list, counts);
    const buckets = new Map<string, { label: string; ids: string[] }>();
    for (const c of list) {
      const k = productKey(c, ignore, counts);
      const bucket = k ? `p:${k.key}` : `seul:${c.id}`;
      const cur = buckets.get(bucket);
      if (cur) cur.ids.push(c.id);
      else buckets.set(bucket, { label: k ? prettyName(k.label) : (c.name.trim() || "Sans nom"), ids: [c.id] });
    }
    for (const [bucket, b] of buckets) {
      groups.push({ id: `auto:${account}:${bucket}`, name: b.label, source: "auto", campaignIds: b.ids });
    }
  }
  return groups;
}

/** Nom lisible d'une liste de campagnes : le premier mot de produit commun, tel qu'écrit par le client. */
export function groupName(list: CampaignInput[]): string {
  const toks = list.map((c) => productTokens(c.name));
  const first = toks[0] ?? [];
  const common = first.filter((t) => toks.every((ts) => ts.some((x) => x.key === t.key)));
  const pick = common[0] ?? first[0];
  return pick ? prettyName(pick.label) : (list[0]?.name?.trim() || "Sans nom");
}

/** Coût par résultat ; pour les ventes, ventes rapportées pour 1 € dépensé (plus haut = mieux). */
export function efficiency(kind: ObjectiveKind, spend: number, results: number, revenue = 0): number | null {
  if (kind === "sales") return spend > 0 && revenue > 0 ? revenue / spend : null;
  if (results <= 0) return null;
  return kind === "awareness" ? (spend / results) * 1000 : spend / results;
}

export type Benchmark = { value: number; basis: "produit" | "compte"; label: string } | null;

/**
 * Référence d'une campagne : son produit (même objectif) s'il a au moins 2 campagnes avec des résultats,
 * sinon le même objectif sur le même compte publicitaire. Jamais tout le compte, tous objectifs mélangés.
 */
export function benchmarkFor(c: CampaignInput, groups: ProductGroup[], all: CampaignInput[]): Benchmark {
  const kind = objectiveKind(c.objective);
  const sum = (list: CampaignInput[]) => efficiency(kind, list.reduce((s, x) => s + x.spend, 0), list.reduce((s, x) => s + x.results, 0), list.reduce((s, x) => s + (x.revenue ?? 0), 0));
  const g = groups.find((x) => x.campaignIds.includes(c.id));
  const peers = all.filter((x) => g?.campaignIds.includes(x.id) && objectiveKind(x.objective) === kind && (x.results > 0 || (x.revenue ?? 0) > 0));
  if (g && peers.length >= 2) { const v = sum(peers); if (v != null) return { value: v, basis: "produit", label: `tes campagnes ${g.name}` }; }
  const acct = all.filter((x) => (x.accountId ?? null) === (c.accountId ?? null) && objectiveKind(x.objective) === kind && (x.results > 0 || (x.revenue ?? 0) > 0));
  if (acct.length >= 2) { const v = sum(acct); if (v != null) return { value: v, basis: "compte", label: "tes autres campagnes du même objectif sur ce compte" }; }
  return null;
}

export type Verdict = "meilleure" | "normale" | "plus_chere" | "trop_tot";

/**
 * Jugement d'une campagne par rapport à sa référence.
 * - « trop_tot » tant qu'il n'y a pas assez de données : moins de 3 résultats et moins de 2 fois le coût de référence dépensé.
 * - Une campagne qui a dépensé au moins 3 fois le coût de référence sans AUCUN résultat est « plus_chere »
 *   (pour les ventes : au moins 100 € dépensés sans aucune vente).
 */
export function verdictFor(c: CampaignInput, bench: Benchmark): Verdict {
  const kind = objectiveKind(c.objective);
  if (!bench) return "trop_tot";
  if (kind === "sales" ? (c.revenue ?? 0) <= 0 && c.spend >= 100 : c.results <= 0 && c.spend >= bench.value * 3) return "plus_chere";
  const v = efficiency(kind, c.spend, c.results, c.revenue ?? 0);
  const enough = c.results >= 3 || (kind !== "sales" && c.spend >= bench.value * 2) || (kind === "sales" && c.spend >= 50);
  if (!enough || v == null) return "trop_tot";
  const ratio = kind === "sales" ? bench.value / v : v / bench.value; // < 1 = mieux
  if (ratio <= 0.95) return "meilleure";
  if (ratio >= 1.25) return "plus_chere";
  return "normale";
}
