import type { Status, StatusId } from "./types";

export const STATUSES: Status[] = [
  { id: "aucun", label: "Aucun", color: "#64748b", soft: "#f1f5f9", text: "#fff" },
  { id: "attente_cq", label: "En attente CQ Avant instal", color: "#eab308", soft: "#fef9c3", text: "#422006" },
  { id: "cq_ok", label: "CQ Avant instal Ok", color: "#15803d", soft: "#dcfce7", text: "#fff" },
  { id: "envoye_financement", label: "Envoyé financement", color: "#2563eb", soft: "#dbeafe", text: "#fff" },
  { id: "att_complement", label: "En att complément", color: "#c026d3", soft: "#fae8ff", text: "#fff" },
  { id: "refus_financement", label: "Refus financement", color: "#dc2626", soft: "#fee2e2", text: "#fff" },
  { id: "renvoyer_banque", label: "A renvoyer autre banque", color: "#f97316", soft: "#ffedd5", text: "#fff" },
  { id: "retractation", label: "Rétractation client", color: "#be123c", soft: "#ffe4e6", text: "#fff" },
  { id: "financement_accepte", label: "Financement accepté", color: "#059669", soft: "#d1fae5", text: "#fff" },
  { id: "envoye_pose", label: "Envoyé en pose", color: "#0284c7", soft: "#e0f2fe", text: "#fff" },
  { id: "installe", label: "Installé", color: "#16a34a", soft: "#dcfce7", text: "#fff" },
  { id: "paye", label: "Payé", color: "#65a30d", soft: "#ecfccb", text: "#fff" },
  { id: "litige", label: "Litige client", color: "#991b1b", soft: "#fee2e2", text: "#fff" },
];

export const STATUS_MAP = Object.fromEntries(STATUSES.map((s) => [s.id, s])) as Record<StatusId, Status>;

export const PAIEMENTS = ["Sofinco", "Domofinance", "Projexio", "Cetelem", "Comptant"];

export const PRODUITS = [
  "ITE",
  "Pompe à chaleur",
  "Panneaux photovoltaïques",
  "Ballon thermodynamique",
  "Isolation combles",
  "Poêle à granulés",
];

export const EQUIPES = ["SLB CONSEILS", "NOREA ÉNERGIE", "HABITAT PLUS"];

export const COMMERCIAUX = ["SANDRINE", "SACHA", "SADIO", "KARIM", "LÉA"];

export const CURRENT_USER = "SANDRINE";
