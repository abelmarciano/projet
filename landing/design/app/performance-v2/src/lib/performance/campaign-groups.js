"use strict";
// Regroupe les campagnes Meta par produit et choisit la bonne référence de comparaison.
// Un même compte publicitaire sert souvent plusieurs produits (carport, pompe à chaleur…) :
// comparer une campagne à la moyenne de tout le compte n'a pas de sens. On la compare
// à son produit, avec le même objectif ; s'il n'y a pas assez de campagnes dans le produit,
// on revient au même objectif sur le même compte, et on le dit.
// Aucune valeur propre à un client n'est codée ici : tout vient des noms de campagnes et de pubs.
Object.defineProperty(exports, "__esModule", { value: true });
exports.OBJECTIVE_LABELS = void 0;
exports.objectiveKind = objectiveKind;
exports.productTokens = productTokens;
exports.groupCampaigns = groupCampaigns;
exports.groupName = groupName;
exports.efficiency = efficiency;
exports.benchmarkFor = benchmarkFor;
exports.verdictFor = verdictFor;
exports.OBJECTIVE_LABELS = {
    leads: { tab: "Leads", result: "Leads reçus", one: "lead", many: "leads", cost: "Coût par lead" },
    sales: { tab: "Ventes", result: "Achats", one: "achat", many: "achats", cost: "Coût par achat" },
    traffic: { tab: "Trafic", result: "Clics vers le site", one: "clic", many: "clics", cost: "Coût par clic" },
    awareness: { tab: "Notoriété", result: "Personnes touchées", one: "personne", many: "personnes", cost: "Coût pour 1 000 personnes" },
    engagement: { tab: "Messages et interactions", result: "Interactions", one: "interaction", many: "interactions", cost: "Coût par interaction" },
};
/** Objectif Meta (ancien ou nouveau nom) → famille affichée. */
function objectiveKind(objective) {
    const o = String(objective ?? "").toUpperCase();
    if (o.includes("LEAD"))
        return "leads";
    if (/SALES|CONVERSION|CATALOG|PURCHASE|STORE_VISIT|PRODUCT/.test(o))
        return "sales";
    if (/AWARENESS|REACH|BRAND|VIDEO_VIEW|THRUPLAY/.test(o))
        return "awareness";
    if (/ENGAGEMENT|MESSAGE|POST|PAGE_LIKE|EVENT|APP/.test(o))
        return "engagement";
    return "traffic";
}
/** Mots qui décrivent la façon de faire la pub, pas le produit : ignorés pour regrouper. */
const NOISE = new Set([
    "campagne", "campagnes", "campaign", "pub", "pubs", "publicite", "ads", "ad", "annonce",
    "lead", "leads", "vente", "ventes", "sales", "conversion", "conversions", "trafic", "traffic", "notoriete", "awareness",
    "engagement", "messages", "message", "formulaire", "form", "instant", "instantane",
    "test", "tests", "abtest", "copie", "copy", "nouveau", "nouvelle", "new", "v", "version",
    "fr", "france", "be", "ch", "lu", "ca", "national", "local", "region",
    "broad", "large", "lal", "lookalike", "similaire", "retargeting", "relance", "remarketing", "visiteurs", "audience", "audiences",
    "interets", "interet", "chaud", "froid", "cold", "warm", "hot", "tof", "mof", "bof",
    "cbo", "abo", "advantage", "asc", "adv", "plus",
    "hiver", "ete", "printemps", "automne", "noel", "blackfriday", "black", "friday", "soldes", "promo", "promotion", "rentree",
    "janvier", "fevrier", "mars", "avril", "mai", "juin", "juillet", "aout", "septembre", "octobre", "novembre", "decembre",
    "ugc", "video", "videos", "image", "images", "carrousel", "carousel", "story", "stories", "reels", "reel", "feed",
    "meta", "facebook", "instagram", "fb", "ig", "growthity",
    "de", "du", "des", "la", "le", "les", "l", "d", "et", "a", "au", "aux", "pour", "en", "sur", "avec", "sans", "un", "une",
    "the", "and", "for", "of", "with",
]);
function fold(s) {
    return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}
/** Mots significatifs d'un nom, dans l'ordre, avec leur forme d'origine pour l'affichage. */
function productTokens(name) {
    const out = [];
    for (const raw of String(name ?? "").split(/[^\p{L}\p{N}]+/u)) {
        if (!raw)
            continue;
        const key = fold(raw);
        if (key.length < 2 || NOISE.has(key) || /^\d+$/.test(key) || /^v\d+$/.test(key) || /^(19|20)\d\d/.test(key))
            continue;
        // Pluriel simple : « carports » et « carport » sont le même produit.
        out.push({ key: key.length > 4 && key.endsWith("s") ? key.slice(0, -1) : key, label: raw });
    }
    return out;
}
/** Les 2 premiers mots significatifs du nom de la campagne, complétés par le mot le plus fréquent de ses pubs. */
function signature(c) {
    const own = productTokens(c.name).map((t) => t.key);
    const counts = new Map();
    for (const ad of c.adNames ?? [])
        for (const t of new Set(productTokens(ad).map((x) => x.key)))
            counts.set(t, (counts.get(t) ?? 0) + 1);
    const adTop = [...counts.entries()].filter(([, n]) => n >= 2).sort((a, b) => b[1] - a[1]).map(([k]) => k);
    return [...new Set([...own.slice(0, 2), ...adTop.slice(0, 1)])];
}
/**
 * Regroupe les campagnes par produit.
 * - Les groupes créés à la main passent toujours en premier.
 * - Deux campagnes vont ensemble si elles commencent par le même mot de produit
 *   (« Carport · Hiver » et « Carport relance »), ou si la moitié de leurs mots de produit sont communs.
 * - Une campagne dont le nom ne contient aucun mot de produit reste seule, sous son propre nom.
 */
function groupCampaigns(campaigns, manual = []) {
    const taken = new Set();
    const groups = [];
    for (const g of manual) {
        const ids = g.campaignIds.filter((id) => campaigns.some((c) => c.id === id) && !taken.has(id));
        ids.forEach((id) => taken.add(id));
        if (ids.length)
            groups.push({ id: `manuel:${g.id}`, name: g.name, source: "manuel", campaignIds: ids });
    }
    const rest = campaigns.filter((c) => !taken.has(c.id));
    const sig = new Map(rest.map((c) => [c.id, signature(c)]));
    const parent = new Map(rest.map((c) => [c.id, c.id]));
    const find = (x) => (parent.get(x) === x ? x : find(parent.get(x)));
    const join = (a, b) => { const ra = find(a), rb = find(b); if (ra !== rb)
        parent.set(rb, ra); };
    for (let i = 0; i < rest.length; i++) {
        for (let j = i + 1; j < rest.length; j++) {
            const a = sig.get(rest[i].id), b = sig.get(rest[j].id);
            if (!a.length || !b.length)
                continue;
            const common = a.filter((t) => b.includes(t)).length;
            if (a[0] === b[0] || common / Math.min(a.length, b.length) >= 0.5)
                join(rest[i].id, rest[j].id);
        }
    }
    const byRoot = new Map();
    for (const c of rest)
        byRoot.set(find(c.id), [...(byRoot.get(find(c.id)) ?? []), c]);
    for (const [root, list] of byRoot) {
        groups.push({ id: `auto:${root}`, name: groupName(list), source: "auto", campaignIds: list.map((c) => c.id) });
    }
    return groups;
}
/** Nom du groupe : les mots de produit communs à toutes ses campagnes, tels qu'écrits par le client. */
function groupName(list) {
    const toks = list.map((c) => productTokens(c.name));
    const first = toks[0] ?? [];
    const common = first.filter((t) => toks.every((ts) => ts.some((x) => x.key === t.key)));
    const words = (common.length ? common : first.slice(0, 1)).slice(0, 3).map((t) => t.label);
    const name = words.join(" ");
    if (!name)
        return list[0]?.name?.trim() || "Sans nom";
    return name.charAt(0).toUpperCase() + name.slice(1);
}
/** Coût par résultat ; pour les ventes, ventes rapportées pour 1 € dépensé (plus haut = mieux). */
function efficiency(kind, spend, results, revenue = 0) {
    if (kind === "sales")
        return spend > 0 && revenue > 0 ? revenue / spend : null;
    if (results <= 0)
        return null;
    return kind === "awareness" ? (spend / results) * 1000 : spend / results;
}
/**
 * Référence d'une campagne : son produit (même objectif) s'il a au moins 2 campagnes avec des résultats,
 * sinon le même objectif sur le même compte publicitaire. Jamais tout le compte, tous objectifs mélangés.
 */
function benchmarkFor(c, groups, all) {
    const kind = objectiveKind(c.objective);
    const sum = (list) => efficiency(kind, list.reduce((s, x) => s + x.spend, 0), list.reduce((s, x) => s + x.results, 0), list.reduce((s, x) => s + (x.revenue ?? 0), 0));
    const g = groups.find((x) => x.campaignIds.includes(c.id));
    const peers = all.filter((x) => g?.campaignIds.includes(x.id) && objectiveKind(x.objective) === kind && (x.results > 0 || (x.revenue ?? 0) > 0));
    if (g && peers.length >= 2) {
        const v = sum(peers);
        if (v != null)
            return { value: v, basis: "produit", label: `tes campagnes ${g.name}` };
    }
    const acct = all.filter((x) => (x.accountId ?? null) === (c.accountId ?? null) && objectiveKind(x.objective) === kind && (x.results > 0 || (x.revenue ?? 0) > 0));
    if (acct.length >= 2) {
        const v = sum(acct);
        if (v != null)
            return { value: v, basis: "compte", label: "tes autres campagnes du même objectif sur ce compte" };
    }
    return null;
}
/**
 * Jugement d'une campagne par rapport à sa référence.
 * « trop_tot » tant qu'il n'y a pas assez de données : moins de 3 résultats et moins de 2 fois le coût de référence dépensé.
 */
function verdictFor(c, bench) {
    const kind = objectiveKind(c.objective);
    const v = efficiency(kind, c.spend, c.results, c.revenue ?? 0);
    if (!bench)
        return "trop_tot";
    const enough = c.results >= 3 || (kind !== "sales" && c.spend >= bench.value * 2) || (kind === "sales" && c.spend >= 50);
    if (!enough || v == null)
        return "trop_tot";
    const ratio = kind === "sales" ? bench.value / v : v / bench.value; // < 1 = mieux
    if (ratio <= 0.95)
        return "meilleure";
    if (ratio >= 1.25)
        return "plus_chere";
    return "normale";
}
