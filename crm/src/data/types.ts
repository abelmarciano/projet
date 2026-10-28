export type StatusId =
  | "aucun"
  | "attente_cq"
  | "cq_ok"
  | "envoye_financement"
  | "att_complement"
  | "refus_financement"
  | "renvoyer_banque"
  | "retractation"
  | "financement_accepte"
  | "envoye_pose"
  | "installe"
  | "paye"
  | "litige";

export interface Status {
  id: StatusId;
  label: string;
  /** dot / badge background */
  color: string;
  /** soft background for row accent */
  soft: string;
  text: string;
}

export interface Observation {
  id: string;
  date: string;
  auteur: string;
  texte: string;
}

export interface Client {
  id: number;
  civilite: "M." | "Mme" | "M. et Mme" | "";
  nom: string;
  prenom: string;
  telephones: string[];
  email: string;
  adresse: string;
  codePostal: string;
  ville: string;
  equipe: string;
  commercial: string;
  statut: StatusId;
  paiement: string;
  produits: string[];
  nrp: number;
  observations: Observation[];
  rdv?: string;
  createdAt: string;
}

export interface Filters {
  search: string;
  departements: string;
  excludeDepartements: boolean;
  createdFrom: string;
  createdTo: string;
  rdvFrom: string;
  rdvTo: string;
  statuts: StatusId[];
  paiement: string;
  equipe: string;
  commercial: string;
  produit: string;
  nrpMin: string;
}

export interface Preset {
  id: string;
  name: string;
  filters: Filters;
}

export const emptyFilters: Filters = {
  search: "",
  departements: "",
  excludeDepartements: false,
  createdFrom: "",
  createdTo: "",
  rdvFrom: "",
  rdvTo: "",
  statuts: [],
  paiement: "",
  equipe: "",
  commercial: "",
  produit: "",
  nrpMin: "",
};
