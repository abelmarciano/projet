import type { Client, StatusId } from "./types";
import { COMMERCIAUX, EQUIPES, PAIEMENTS, PRODUITS } from "./constants";

// Données de démonstration fictives — remplacées par la base (Supabase) une fois sur Lovable.
const NOMS = [
  ["Mme", "DELAHAYE", "NATHALIE"], ["M.", "TELES DE ORNELAS", "LUIS ALBERTO"], ["Mme", "BASSLER", "LAURA"],
  ["Mme", "GRISARD", "VIRGINIE"], ["M.", "DEBROUX", "JEAN MICHEL"], ["Mme", "CIAMOUS", "EMMANUELLE"],
  ["M.", "LANGLET", "GABRIEL"], ["M.", "POSE", "JEAN FABRICE"], ["M.", "LUCERO", "GERARD"],
  ["M.", "TROUSSARD", "DIDIER"], ["Mme", "BUISSON", "MARIE"], ["M.", "PEYTOUR", "JEAN-JACQUES"],
  ["Mme", "ARNAULT", "CATHERINE"], ["M.", "PEREIRA VELOSO", "FERNANDO"], ["Mme", "LOPES", "SONIA"],
  ["M.", "FERREIRA", "ANDRE"], ["M.", "LETE", "JEAN-YVES"], ["M.", "CORDONNIER", "PASCAL"],
  ["M.", "EBOULEAU", "MARC"], ["M.", "LEFORT", "LAURENT"], ["M.", "CHASTAGNER", "CYRILLE"],
  ["M.", "TOUTOU", "EVARISTE"], ["M.", "STIMBACH", "HODY"], ["M.", "FURGE", "MATHIEU"],
  ["Mme", "DINAIS", "MELANIE"], ["M.", "GERMANAUD", "ROMAIN"], ["Mme", "JOUVE", "CATHERINE"],
  ["M.", "VAYRES", "PHILIPPE"], ["Mme", "RAZY", "LINDA"], ["M.", "LAGUILLAUMIE", "PATRICK"],
  ["M.", "BEYLY", "JEAN-LUC"], ["M.", "DUPONT", "MARTIN"], ["Mme", "MOREAU", "SOPHIE"],
  ["M.", "GIRARD", "THOMAS"], ["Mme", "FAURE", "CHLOÉ"], ["M.", "ROUSSEL", "ANTOINE"],
] as const;

const VILLES = [
  ["149 AVENUE DE LA LIBÉRATION", "86000", "POITIERS"], ["11 RUE DE CHÂTEAU-GANNE", "86330", "MARTAIZÉ"],
  ["9 RUE DU POMMIER", "16420", "SAULGOND"], ["10 ROUTE DE LA BARAQUE", "63340", "VICHEL"],
  ["2 RUE CLAUDE DEBUSSY", "63670", "ORCET"], ["5 PLACE DE L'ÉGLISE", "63320", "CHADELEUF"],
  ["1 LES REGNAULTS", "03160", "FRANCHESSE"], ["552 RUE DE LA GOMBAUDIÈRE", "41250", "MONT-PRÈS-CHAMBORD"],
  ["1 RUE DE L'HORIZON", "89200", "ANNAY-LA-CÔTE"], ["148 RUE SAINT VERNY", "63730", "LES MARTRES-DE-VEYRE"],
  ["8 ROUTE DE CHAUFFOUR", "16700", "TAIZÉ-AIZIE"], ["4 IMPASSE DU CLOS", "49125", "TIERCÉ"],
  ["16 RUE JOLIOT CURIE", "03260", "SAINT-GERMAIN-DES-FOSSÉS"], ["38 RUE DU GRAND BOIS", "87220", "FEYTIAT"],
  ["12 CHEMIN DE VILLECROZE", "23700", "AUZANCES"], ["12 RUE DES TILLEULS", "85000", "LA ROCHE-SUR-YON"],
  ["7 ALLÉE DES CHÊNES", "78100", "SAINT-GERMAIN-EN-LAYE"], ["21 BOULEVARD VOLTAIRE", "75011", "PARIS"],
  ["3 RUE PASTEUR", "94300", "VINCENNES"],
];

const NOTES = [
  "DOSSIER ITE", "MANQUE CNI EN ATTENTE", "CONTROLE CHARGES", "appeler client pour qu'il fasse code suite modification contrat",
  "bs mme lisible", "refaire bdc au bonne date", "MANQUE FACADE ; photo à refaire", "domo attend l'appel du client",
  "à voir si mr a repris contact", "num de tel et mail différents", "faire bdc et contrat signés", "BDC PAR MAIL ATTENTE retour",
  "contrôle livraison", "sofinco a annulé le dossier", "EN COURS D'ENVOIE", "bs sept manquant", "MARIE rappelle demain",
  "manque bs aout ou sept", "FAIRE DOMO", "Mairie Demande envoyée OK",
];

const STATUS_WEIGHTS: [StatusId, number][] = [
  ["aucun", 1], ["attente_cq", 3], ["cq_ok", 3], ["envoye_financement", 5], ["att_complement", 8],
  ["refus_financement", 3], ["renvoyer_banque", 2], ["retractation", 3], ["financement_accepte", 3],
  ["envoye_pose", 2], ["installe", 3], ["paye", 4], ["litige", 1],
];

function rng(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
}

export function buildSeed(): Client[] {
  const r = rng(42);
  const pick = <T,>(a: readonly T[]) => a[Math.floor(r() * a.length)];
  const total = STATUS_WEIGHTS.reduce((s, [, w]) => s + w, 0);
  const pickStatus = () => {
    let x = r() * total;
    for (const [id, w] of STATUS_WEIGHTS) if ((x -= w) < 0) return id;
    return "aucun" as StatusId;
  };
  const now = Date.now();
  const day = 86400000;

  return NOMS.map(([civ, nom, prenom], i) => {
    const [adresse, cp, ville] = pick(VILLES);
    const id = 1422 - i * 2 - Math.floor(r() * 2);
    const createdAt = new Date(now - (i * 1.6 + r() * 2) * day).toISOString();
    const commercial = pick(COMMERCIAUX);
    const nbObs = Math.floor(r() * 4);
    const observations = Array.from({ length: nbObs }, (_, k) => {
      const d = new Date(new Date(createdAt).getTime() + (k + 1) * day * (1 + r() * 2));
      d.setHours(9 + Math.floor(r() * 9), Math.floor(r() * 60));
      return { id: `${id}-${k}`, date: d.toISOString(), auteur: commercial, texte: pick(NOTES) };
    });
    const produit = pick(PRODUITS);
    const hasRdv = r() < 0.4;
    let rdv: string | undefined;
    if (hasRdv) {
      const d = new Date(now + Math.floor(r() * 12 - 3) * day);
      d.setHours(8 + Math.floor(r() * 10), r() < 0.5 ? 0 : 30, 0, 0);
      rdv = d.toISOString();
    }
    const phone = () =>
      "0" + pick(["6", "7"]) + " " + Array.from({ length: 4 }, () => String(Math.floor(r() * 100)).padStart(2, "0")).join(" ");
    return {
      id,
      civilite: civ,
      nom,
      prenom,
      telephones: r() < 0.3 ? [phone(), phone()] : [phone()],
      email: `${prenom.split(" ")[0].toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")}.${nom
        .split(" ")[0]
        .toLowerCase()}@${pick(["gmail.com", "orange.fr", "hotmail.com", "wanadoo.fr", "aol.com"])}`,
      adresse,
      codePostal: cp,
      ville,
      equipe: r() < 0.8 ? EQUIPES[0] : pick(EQUIPES),
      commercial,
      statut: pickStatus(),
      paiement: pick(PAIEMENTS),
      produits: produit === "Panneaux photovoltaïques" ? ["3,5 Kwc", produit] : [produit],
      nrp: r() < 0.7 ? 0 : Math.floor(r() * 4),
      observations,
      rdv,
      createdAt,
    } satisfies Client;
  });
}
