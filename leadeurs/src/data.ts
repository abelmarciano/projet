export const WHATSAPP_URL = "https://wa.me/33782170781";
export const PHONE_DISPLAY = "07 82 17 07 81";
export const EMAIL = "contact@leadeurs.fr";

export const stats = [
  { value: "250K+", label: "leads vendus" },
  { value: "2 M€+", label: "investis en publicité" },
  { value: "98 %", label: "de clients satisfaits" },
  { value: "24 h", label: "délai de livraison max." },
];

export const sectors = [
  { name: "Panneaux photovoltaïques", detail: "Propriétaires de maison avec un projet d'installation solaire", code: "PV" },
  { name: "Isolation extérieure (ITE)", detail: "Maisons individuelles éligibles aux aides à la rénovation", code: "ITE" },
  { name: "Pompe à chaleur", detail: "Remplacement de chaudière fioul ou gaz, aides incluses", code: "PAC" },
  { name: "Rénovation d'ampleur", detail: "Projets globaux accompagnés, gros paniers", code: "RGA" },
  { name: "Isolation pro", detail: "Bâtiments tertiaires et locaux professionnels", code: "ISO" },
  { name: "Douches seniors", detail: "Remplacement de baignoire, adaptation du logement", code: "DSE" },
  { name: "LED intérieur", detail: "Relamping pour commerces, bureaux et entrepôts", code: "LDI" },
  { name: "LED extérieur", detail: "Éclairage de parkings, façades et zones d'activité", code: "LDE" },
];

export const steps = [
  {
    title: "On cible vos prospects",
    text: "Campagnes Google et Meta calibrées sur votre zone, votre produit et votre profil client idéal.",
  },
  {
    title: "Le prospect s'inscrit",
    text: "Il remplit un formulaire qualifiant. On vérifie chaque lead : numéro valide, intention, critères.",
  },
  {
    title: "Vous le recevez",
    text: "En temps réel, par email, dans votre CRM, sur Google Sheets ou par API. Il ne reste qu'à closer.",
  },
];

export const guarantees = [
  { title: "Exclusivité", text: "Chaque lead est envoyé à une seule entreprise. Aucune revente, aucun partage." },
  { title: "Qualité vérifiée", text: "Numéro valide, intention confirmée, critères respectés. Les leads non conformes ne sont pas facturés." },
  { title: "Transparence", text: "Tableau de bord en temps réel, statistiques détaillées et reporting de chaque campagne." },
  { title: "Réactivité", text: "Le lead arrive dans votre outil à la seconde où le prospect valide son inscription." },
];

export const crmFeatures = [
  { title: "Pipeline visuel", text: "Adapté à votre cycle de vente, pas l'inverse." },
  { title: "Automatisations", text: "Relances, notifications et workflows sur-mesure." },
  { title: "Emails & SMS", text: "Séquences intégrées pour relancer et convertir." },
  { title: "Analytics", text: "Vos KPIs en temps réel, par commercial et par source." },
  { title: "Intégrations", text: "Calendly, Stripe, Google Sheets, API…" },
  { title: "Mobile", text: "Votre CRM dans la poche de chaque commercial." },
];

export const testimonials = [
  {
    name: "Thomas R.",
    role: "Gérant, société d'installation solaire",
    quote:
      "On reçoit des leads photovoltaïque exclusifs chaque jour. Le taux de conversion est bien au-dessus de ce qu'on avait avec d'autres fournisseurs. Ça a changé notre business.",
  },
  {
    name: "Nadia K.",
    role: "Directrice commerciale, rénovation énergétique",
    quote:
      "Le CRM développé par Leadeurs est exactement ce qu'il nous fallait. Plus besoin de jongler entre cinq outils : tout est centralisé, automatisé et adapté à notre process.",
  },
  {
    name: "Marc D.",
    role: "Fondateur, agence immobilière",
    quote:
      "Des leads qualifiés, un CRM sur-mesure et un accompagnement au top. En trois mois, on a doublé notre nombre de rendez-vous commerciaux.",
  },
];

export const faqs = [
  {
    q: "Comment fonctionne l'achat de leads ?",
    a: "Vous choisissez votre secteur (photovoltaïque, isolation, PAC…), on définit ensemble vos critères de qualification, et vous recevez des leads exclusifs en temps réel. Chaque lead est vérifié et vous ne payez que les leads conformes.",
  },
  {
    q: "Les leads sont-ils vraiment exclusifs ?",
    a: "Oui, à 100 %. Chaque lead est envoyé à un seul client. Pas de revente, pas de partage : vous êtes le seul à contacter le prospect.",
  },
  {
    q: "Quel volume pouvez-vous fournir ?",
    a: "Cela dépend de votre secteur et de votre zone. On génère plus de 50 000 leads par an tous secteurs confondus, et on cale le volume sur votre capacité de traitement et votre budget.",
  },
  {
    q: "Qu'est-ce qu'un CRM sur-mesure ?",
    a: "Un outil de gestion client développé pour votre activité. Contrairement aux CRM génériques, il suit vos process, votre pipeline et votre équipe. Rien de superflu.",
  },
  {
    q: "Combien de temps pour avoir mon CRM ?",
    a: "En moyenne 4 à 8 semaines selon la complexité, en itérations courtes avec des validations régulières. Le support est inclus après la livraison.",
  },
  {
    q: "Comment démarrer ?",
    a: "Écrivez-nous sur WhatsApp ou par email. On échange 30 minutes sur votre besoin et on vous propose une offre adaptée. Réponse sous 24 h.",
  },
];

/** Exemples fictifs qui alimentent l'aperçu animé du flux de leads. */
export const sampleLeads = [
  { sector: "Pompe à chaleur", place: "Lyon", dept: "69", profile: "Propriétaire · maison 120 m²" },
  { sector: "Photovoltaïque", place: "Montpellier", dept: "34", profile: "Propriétaire · toiture sud" },
  { sector: "Isolation ITE", place: "Rennes", dept: "35", profile: "Maison 1978 · chauffage gaz" },
  { sector: "Douche senior", place: "Nice", dept: "06", profile: "72 ans · baignoire à remplacer" },
  { sector: "Photovoltaïque", place: "Toulouse", dept: "31", profile: "Facture 180 €/mois" },
  { sector: "Rénovation d'ampleur", place: "Nantes", dept: "44", profile: "Projet global · DPE F" },
  { sector: "LED extérieur", place: "Lille", dept: "59", profile: "Parking 2 400 m²" },
  { sector: "Pompe à chaleur", place: "Dijon", dept: "21", profile: "Chaudière fioul · 15 ans" },
];
