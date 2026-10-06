// Jeu de données de démo pour les captures Classicall (aucune donnée client réelle).
let seed = 20261006;
const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
const pick = (a) => a[Math.floor(rnd() * a.length)];
const int = (a, b) => a + Math.floor(rnd() * (b - a + 1));
let idn = 1000;
const uuid = (p = 'a') => {
  const n = (idn++).toString(16).padStart(12, '0');
  return `${p.padEnd(8, '0').slice(0, 8)}-0000-4000-8000-${n}`;
};

export const NOW = new Date('2026-10-06T09:30:00.000Z');
const iso = (d) => new Date(d).toISOString();
const daysAgo = (n, h = 10, m = 0) => {
  const d = new Date(NOW); d.setUTCDate(d.getUTCDate() - n); d.setUTCHours(h, m, 0, 0); return d;
};

export const COMPANY_ID = 'c0ffee00-0000-4000-8000-000000000001';
export const ME_ID = 'u0000000-0000-4000-8000-000000000001';

const companies = [{
  id: COMPANY_ID, name: 'Soleil Habitat', subdomain: 'soleil-habitat', domain: null, is_active: true,
  logo_url: null, settings: {}, created_at: iso(daysAgo(400)), created_by: ME_ID, updated_at: iso(daysAgo(10)),
}];

const people = [
  ['Julien', 'Moreau', 'admin'],
  ['Sarah', 'Benali', 'telepro'], ['Kevin', 'Lefèvre', 'telepro'], ['Inès', 'Garcia', 'telepro'], ['Mathis', 'Roux', 'telepro'],
  ['Thomas', 'Girard', 'commercial'], ['Nicolas', 'Fontaine', 'commercial'], ['Camille', 'Mercier', 'commercial'], ['Yanis', 'Chevalier', 'commercial'],
  ['Laura', 'Blanc', 'confirmateur'], ['Hugo', 'Dupuis', 'secu'],
];
const profiles = people.map(([first_name, last_name, role], i) => ({
  id: i === 0 ? ME_ID : uuid('u'), first_name, last_name, role,
  email: `${first_name}.${last_name}`.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '') + '@soleil-habitat.fr',
  is_active: true, disabled: false, last_login: iso(daysAgo(0, 8)), created_at: iso(daysAgo(300)), updated_at: iso(daysAgo(5)),
}));
const byRole = (r) => profiles.filter((p) => p.role === r);
const telepros = byRole('telepro'), sales = byRole('commercial');

const call_centers = [
  { id: uuid('cc'), name: 'Plateau Lyon', description: 'Équipe télépro Lyon', company_id: COMPANY_ID, is_active: true, created_at: iso(daysAgo(200)), updated_at: iso(daysAgo(20)) },
  { id: uuid('cc'), name: 'Plateau Marseille', description: 'Équipe télépro Marseille', company_id: COMPANY_ID, is_active: true, created_at: iso(daysAgo(200)), updated_at: iso(daysAgo(20)) },
];
const user_companies = profiles.map((p, i) => ({
  id: uuid('uc'), user_id: p.id, company_id: COMPANY_ID, role: p.role, is_active: true,
  call_center_id: p.role === 'telepro' ? call_centers[i % 2].id : null, created_at: iso(daysAgo(300 - i)),
}));

const campaigns = [
  ['Facebook Solaire', 'leads_campagne', 45], ['Google Ads PAC', 'leads_campagne', 38],
  ['TikTok Rénovation', 'leads_ia', 32], ['Partenaire Énergie+', 'fiches_call_center', 55],
  ['Salon Habitat Lyon', 'data', 25],
].map(([name, category, lead_price]) => ({ id: uuid('ca'), name, category, lead_price, company_id: COMPANY_ID, created_at: iso(daysAgo(250)), updated_at: iso(daysAgo(30)) }));

const productsDef = [
  ['Panneaux solaires 3 kWc', 'photovoltaïque', 9900, 'monophasé'],
  ['Panneaux solaires 6 kWc', 'photovoltaïque', 15900, 'monophasé'],
  ['Panneaux solaires 9 kWc', 'photovoltaïque', 21900, 'triphasé'],
  ['Pompe à chaleur air/eau', 'pompe à chaleur', 13900, 'monophasé'],
  ['Ballon thermodynamique', 'eau chaude', 3990, 'monophasé'],
  ['Isolation des combles', 'isolation', 4500, 'monophasé'],
];
const products = productsDef.map(([name, category, ttc, type]) => ({
  id: uuid('p'), name, category, type, price_ttc: ttc, price_ht: Math.round(ttc / 1.2),
  installer_name: pick(['SolarPose Rhône', 'Éco Install Sud', 'Therm Services']), installer_session_price_ht: Math.round(ttc * 0.18),
  telepro_commission_ht: 150, sales_commission_ht: Math.round(ttc * 0.07), confirmer_commission_ht: 80, secu_commission_ht: 60,
  additional_costs_ht: 250, additional_costs_title: 'Frais de dossier', company_id: COMPANY_ID, created_at: iso(daysAgo(240)), updated_at: iso(daysAgo(40)),
}));

const leadStatuses = [
  ['Nouveau', '#0EA5E9'], ['NRP', '#FFDEE2'], ['À rappeler', '#FEF7CD'], ['RDV pris', '#0FA0CE'],
  ['Pas intéressé', '#EA384C'], ['Faux numéro', '#9B87F5'], ['Signé', '#002F79'],
];
const contractStatuses = [
  ['Dossier complet', '#0FA0CE'], ['Visite technique', '#FEF7CD'], ['Installation', '#F2FCE2'], ['Raccordé', '#002F79'], ['Annulé', '#EA384C'],
];
const statuses = [
  ...leadStatuses.map(([name, color]) => ({ name, color, type: 'lead' })),
  ...contractStatuses.map(([name, color]) => ({ name, color, type: 'contract' })),
].map((s) => ({ id: uuid('s'), company_id: COMPANY_ID, created_at: iso(daysAgo(250)), updated_at: iso(daysAgo(30)), ...s }));

const firstNames = ['Marie', 'Jean', 'Pierre', 'Nathalie', 'Philippe', 'Isabelle', 'Michel', 'Sylvie', 'Alain', 'Catherine', 'Patrick', 'Sandrine', 'Christophe', 'Véronique', 'Frédéric', 'Valérie', 'Stéphane', 'Céline', 'Laurent', 'Aurélie', 'Olivier', 'Émilie', 'David', 'Hélène', 'Éric', 'Julie', 'Pascal', 'Sophie', 'Bernard', 'Chantal', 'Gérard', 'Martine', 'Daniel', 'Brigitte', 'Thierry', 'Corinne', 'Sébastien', 'Delphine', 'Franck', 'Karine'];
const lastNames = ['Martin', 'Bernard', 'Dubois', 'Thomas', 'Robert', 'Richard', 'Petit', 'Durand', 'Leroy', 'Moreau', 'Simon', 'Laurent', 'Lefebvre', 'Michel', 'Garcia', 'David', 'Bertrand', 'Roux', 'Vincent', 'Fournier', 'Morel', 'Girard', 'André', 'Lefèvre', 'Mercier', 'Dupont', 'Lambert', 'Bonnet', 'François', 'Martinez', 'Legrand', 'Garnier', 'Faure', 'Rousseau', 'Blanc', 'Guerin', 'Muller', 'Henry', 'Roussel', 'Nicolas', 'Perrin', 'Morin', 'Mathieu', 'Clément', 'Gauthier', 'Dumont', 'Lopez', 'Fontaine', 'Chevalier', 'Robin'];
const cities = [
  ['Lyon', '69003', '69', 'rue Garibaldi'], ['Villeurbanne', '69100', '69', 'cours Émile Zola'], ['Vénissieux', '69200', '69', 'avenue Jean Jaurès'],
  ['Bron', '69500', '69', 'rue de la Pagère'], ['Saint-Priest', '69800', '69', 'rue Henri Maréchal'], ['Grenoble', '38000', '38', 'cours Berriat'],
  ['Vienne', '38200', '38', 'quai Jean Jaurès'], ['Bourgoin-Jallieu', '38300', '38', 'rue de la République'], ['Saint-Étienne', '42000', '42', 'rue des Martyrs de Vingré'],
  ['Roanne', '42300', '42', 'rue Charles de Gaulle'], ['Valence', '26000', '26', 'avenue Victor Hugo'], ['Montélimar', '26200', '26', 'allée Provençale'],
  ['Annecy', '74000', '74', 'avenue de Genève'], ['Chambéry', '73000', '73', 'rue de Boigne'], ['Bourg-en-Bresse', '01000', '01', 'boulevard de Brou'],
  ['Mâcon', '71000', '71', 'rue Carnot'], ['Clermont-Ferrand', '63000', '63', 'avenue des États-Unis'], ['Marseille', '13008', '13', 'avenue du Prado'],
  ['Aix-en-Provence', '13100', '13', 'cours Mirabeau'], ['Avignon', '84000', '84', 'rue de la République'], ['Nîmes', '30000', '30', 'boulevard Victor Hugo'],
];
const strip = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const phone = () => `0${pick(['6', '7'])} ${int(10, 99)} ${int(10, 99)} ${int(10, 99)} ${int(10, 99)}`;

const leads = [];
const appointments = [];
const N = 186;
for (let i = 0; i < N; i++) {
  const first_name = pick(firstNames), last_name = pick(lastNames);
  const [city, postal_code, department, street] = pick(cities);
  // Plus de leads récents : distribution sur ~7 mois.
  const age = Math.floor(Math.pow(rnd(), 1.4) * 200);
  const created = daysAgo(age, int(7, 18), int(0, 59));
  const camp = pick(campaigns);
  const tp = pick(telepros), sl = pick(sales);
  const signed = rnd() < 0.27;
  const st = signed ? 'Signé' : pick(['Nouveau', 'Nouveau', 'NRP', 'À rappeler', 'RDV pris', 'RDV pris', 'Pas intéressé', 'Faux numéro']);
  const prod = signed ? [pick(products.slice(0, 4))] : [];
  if (signed && rnd() < 0.35) prod.push(products[4]);
  const sigDate = signed ? new Date(created.getTime() + int(4, 20) * 86400000) : null;
  const lead = {
    id: uuid('l'), company_id: COMPANY_ID, first_name, last_name, phone_1: phone(), phone_2: rnd() < 0.2 ? phone() : null,
    email: `${strip(first_name)}.${strip(last_name)}${int(1, 99)}@${pick(['gmail.com', 'orange.fr', 'free.fr', 'hotmail.fr', 'sfr.fr'])}`,
    address: `${int(2, 148)} ${street}`, city, postal_code, department,
    status: st, campaign_id: camp.id, campaign: camp.name, assigned_telepro: tp.id, assigned_telepros: [tp.id],
    assigned_sales: ['RDV pris', 'Signé'].includes(st) ? sl.id : null,
    assigned_confirmer: ['RDV pris', 'Signé'].includes(st) ? profiles[9].id : null,
    assigned_secu: signed ? profiles[10].id : null,
    lead_signe: signed ? 'OUI' : 'NON',
    signature_date: sigDate && sigDate < NOW ? iso(sigDate) : null,
    installation_date: signed && rnd() < 0.6 ? iso(new Date(created.getTime() + int(25, 50) * 86400000)) : null,
    installation_paye: signed && rnd() < 0.85 ? 'OUI' : 'NON',
    sold_products: prod.map((p) => ({ name: p.name, price: p.price_ttc, price_ttc: p.price_ttc, price_ht: p.price_ht, type: p.type, installer_name: p.installer_name, installer_session_price_ht: p.installer_session_price_ht, telepro_commission_ht: p.telepro_commission_ht, sales_commission_ht: p.sales_commission_ht, confirmer_commission_ht: p.confirmer_commission_ht, secu_commission_ht: p.secu_commission_ht, additional_costs_ht: p.additional_costs_ht, additional_costs_title: p.additional_costs_title })),
    desired_product: pick(['Panneaux solaires', 'Pompe à chaleur', 'Ballon thermodynamique', 'Isolation']),
    heating_mode: pick(['électrique', 'gaz', 'fioul', 'bois']), is_owner: true, income: int(28, 75) * 1000,
    electricity_details: `Facture ${int(110, 290)} €/mois`, preferred_time_slot: pick(['matin', 'après-midi']),
    professional_activity: pick(['Salarié', 'Retraité', 'Indépendant', 'Fonctionnaire']), children_count: int(0, 3),
    hidden_in_crm: false, history: [], comments: null, notes: null, callback_date: null,
    created_at: iso(created), updated_at: iso(created), import_source: null, objet_demande: null,
  };
  leads.push(lead);
}
// Doublons : quelques numéros réutilisés.
for (const [a, b] of [[3, 41], [7, 88], [12, 120]]) { leads[b].phone_1 = leads[a].phone_1; leads[b].first_name = leads[a].first_name; leads[b].last_name = leads[a].last_name; }
// Leads récents en tête : on s'assure d'avoir de jolis cas visibles.
leads.sort((x, y) => (x.created_at < y.created_at ? 1 : -1));
// Doublon bien visible dans les premières lignes.
leads[4].phone_1 = leads[2].phone_1; leads[4].first_name = leads[2].first_name; leads[4].last_name = leads[2].last_name;
leads[4].created_at = new Date(new Date(leads[2].created_at).getTime() - 3600e3 * 26).toISOString();

// Noms courts pour les doublons (badge lisible sans troncature)
{
  const groups = {};
  for (const l of leads) (groups[l.phone_1] ||= []).push(l);
  const short = [['Léa', 'Roy'], ['Luc', 'Roy'], ['Éva', 'Rey'], ['Noé', 'Roy'], ['Léo', 'Rey']];
  let gi = 0;
  for (const g of Object.values(groups)) if (g.length > 1) { const [f, l] = short[gi++ % short.length]; g.forEach((x) => { x.first_name = f; x.last_name = l; x.email = `${strip(f)}.${strip(l)}@gmail.com`; }); }
}
const nameOf = (id) => { const p = profiles.find((x) => x.id === id); return p ? `${p.first_name} ${p.last_name}` : ''; };

// Fiche détaillée de démonstration
const star = leads[1];
Object.assign(star, {
  first_name: 'Christophe', last_name: 'Durand', phone_1: '06 12 48 75 39', email: 'christophe.durand@orange.fr',
  address: '27 rue Garibaldi', city: 'Lyon', postal_code: '69003', department: '69', status: 'Signé', lead_signe: 'OUI',
  assigned_telepro: telepros[0].id, assigned_sales: sales[0].id, assigned_confirmer: profiles[9].id, assigned_secu: profiles[10].id,
  signature_date: iso(daysAgo(1, 15)), heating_mode: 'électrique', electricity_details: 'Facture 210 €/mois', income: 52000,
  sold_products: [products[1], products[4]].map((p) => ({ name: p.name, price: p.price_ttc, price_ttc: p.price_ttc, price_ht: p.price_ht, type: p.type })),
  comments: JSON.stringify([
    { content: 'Client très motivé, toiture plein sud, 32 m² disponibles.', timestamp: iso(daysAgo(5, 10, 12)), user_id: telepros[0].id },
    { content: 'RDV confirmé avec Madame Durand, présence des deux époux.', timestamp: iso(daysAgo(3, 16, 40)), user_id: profiles[9].id },
    { content: 'Signature 6 kWc + ballon. Dossier complet, VT à planifier.', timestamp: iso(daysAgo(1, 15, 5)), user_id: sales[0].id },
  ]),
});
star.history = [
  { action: 'Statut modifié : RDV pris → Signé', timestamp: iso(daysAgo(1, 15, 6)), user_id: sales[0].id, user_name: nameOf(sales[0].id), color: '#002F79' },
  { action: 'Produit ajouté : Panneaux solaires 6 kWc', timestamp: iso(daysAgo(1, 15, 4)), user_id: sales[0].id, user_name: nameOf(sales[0].id) },
  { action: 'Rendez-vous confirmé', timestamp: iso(daysAgo(3, 16, 41)), user_id: profiles[9].id, user_name: nameOf(profiles[9].id), color: '#0FA0CE' },
  { action: 'Rendez-vous planifié pour le 5 octobre 2026 à 14h00', timestamp: iso(daysAgo(5, 10, 15)), user_id: telepros[0].id, user_name: nameOf(telepros[0].id) },
  { action: 'Lead assigné à Sarah Benali', timestamp: iso(daysAgo(5, 9, 2)), user_id: ME_ID, user_name: nameOf(ME_ID) },
  { action: 'Lead créé (Facebook Solaire)', timestamp: iso(daysAgo(5, 9, 0)), user_id: ME_ID, user_name: nameOf(ME_ID) },
];
for (const l of leads) if (!l.history.length) l.history = [
  { action: `Lead créé (${l.campaign})`, timestamp: l.created_at, user_id: ME_ID, user_name: nameOf(ME_ID) },
  { action: `Lead assigné à ${nameOf(l.assigned_telepro)}`, timestamp: l.created_at, user_id: ME_ID, user_name: nameOf(ME_ID) },
].reverse();

// Planning de la semaine du 5 au 11 octobre 2026
const weekStatuses = ['confirme', 'positif', 'r2', 'negatif', 'decale', 'installation', 'pas_confirme'];
const slots = [9, 11, 14, 16, 18];
const pool = leads.filter((l) => l !== star);
let k = 0;
for (let d = 0; d < 6; d++) {
  const daySlots = d === 5 ? [9, 11] : slots;
  for (const h of daySlots) {
    const perSlot = d < 5 ? int(1, 2) : 1;
    for (let s = 0; s < perSlot; s++) {
      const lead = pool[(k * 7) % pool.length]; k++;
      const at = new Date(Date.UTC(2026, 9, 5 + d, h, s ? 30 : 0));
      let status = d < 1 ? pick(['positif', 'negatif', 'r2', 'positif', 'decale']) : d < 2 ? pick(['confirme', 'positif', 'r2', 'installation']) : pick(['confirme', 'confirme', 'pas_confirme', 'decale', 'installation', 'r2']);
      lead.assigned_sales = lead.assigned_sales || pick(sales).id;
      appointments.push({
        id: uuid('ap'), lead_id: lead.id, company_id: COMPANY_ID, scheduled_at: iso(at), status,
        attendance_status: d < 1 ? 'present' : null, type: rnd() < 0.85 ? 'presentiel' : 'visio',
        etiquette: pick(['normal', 'bon_rdv', 'pepite', 'normal']), priority: rnd() < 0.15, color: null,
        email_sent: rnd() < 0.6, sms_sent: rnd() < 0.7, sms_sent_at: null, notes: null, created_by: lead.assigned_telepro,
        created_at: iso(daysAgo(int(3, 9))), updated_at: iso(daysAgo(1)),
      });
    }
  }
}
// Mercredi : tournée régionale autour de Lyon (itinéraire réaliste)
{
  const near = [['Villeurbanne', '69100', '69', '12 cours Émile Zola'], ['Bron', '69500', '69', '45 avenue Franklin Roosevelt'], ['Saint-Priest', '69800', '69', '8 rue Henri Maréchal'], ['Vénissieux', '69200', '69', '31 avenue Jean Jaurès'], ['Vienne', '38200', '38', '114 quai Jean Jaurès'], ['Lyon', '69003', '69', '52 rue Garibaldi'], ['Caluire-et-Cuire', '69300', '69', '9 montée des Soldats'], ['Décines-Charpieu', '69150', '69', '17 rue Émile Zola'], ['Oullins', '69600', '69', '40 Grande Rue'], ['Givors', '69700', '69', '3 rue Roger Salengro']];
  const wed = appointments.filter((a) => a.scheduled_at.startsWith('2026-10-07')).sort((a, b) => (a.scheduled_at < b.scheduled_at ? -1 : 1));
  wed.forEach((a, i) => { const l = leads.find((x) => x.id === a.lead_id); const [city, postal_code, department, address] = near[i % near.length]; Object.assign(l, { city, postal_code, department, address }); });
}
// RDV du client vedette (lundi 14h)
appointments.push({ id: uuid('ap'), lead_id: star.id, company_id: COMPANY_ID, scheduled_at: iso(Date.UTC(2026, 9, 5, 14, 0)), status: 'positif', attendance_status: 'present', type: 'presentiel', etiquette: 'pepite', priority: true, color: null, email_sent: true, sms_sent: true, sms_sent_at: null, notes: null, created_by: telepros[0].id, created_at: iso(daysAgo(5)), updated_at: iso(daysAgo(1)) });
// Historique de RDV passés pour les graphiques
for (const l of leads) {
  if (['RDV pris', 'Signé'].includes(l.status) && !appointments.some((a) => a.lead_id === l.id)) {
    const at = new Date(new Date(l.created_at).getTime() + int(2, 6) * 86400000);
    appointments.push({ id: uuid('ap'), lead_id: l.id, company_id: COMPANY_ID, scheduled_at: iso(at), status: l.status === 'Signé' ? 'positif' : pick(['confirme', 'r2', 'negatif']), attendance_status: at < NOW ? 'present' : null, type: 'presentiel', etiquette: 'normal', priority: false, color: null, email_sent: true, sms_sent: true, sms_sent_at: null, notes: null, created_by: l.assigned_telepro, created_at: l.created_at, updated_at: l.created_at });
  }
}

const lead_invoices = campaigns.flatMap((c, i) => [0, 1, 2].map((m) => ({
  id: uuid('li'), campaign_id: c.id, company_id: COMPANY_ID, amount_ht: c.lead_price * int(20, 60), amount_ttc: 0, invoice_date: iso(daysAgo(30 * m + 3)),
  payment_date: m ? iso(daysAgo(30 * m - 5)) : null, payment_status: m ? 'paye' : (i % 2 ? 'paye' : 'en_attente'), supplier: c.name, title: `Leads ${c.name}`, company: 'Soleil Habitat', notes: null, document_path: null, created_at: iso(daysAgo(30 * m + 3)), updated_at: iso(daysAgo(30 * m)),
}))).map((x) => ({ ...x, amount_ttc: Math.round(x.amount_ht * 1.2) }));
const sales_invoices = leads.filter((l) => l.lead_signe === 'OUI').slice(0, 30).map((l, i) => ({
  id: uuid('si'), lead_id: l.id, product_id: products[i % 4].id, company_id: COMPANY_ID, amount_ttc: l.sold_products[0]?.price || 9900,
  amount_ht: Math.round((l.sold_products[0]?.price || 9900) / 1.2), invoice_number: `F-2026-${String(140 + i).padStart(4, '0')}`,
  invoice_date: l.signature_date || l.created_at, payment_date: i % 3 ? l.signature_date : null, payment_status: i % 3 ? 'paye' : 'en_attente',
  title: `Installation ${l.last_name}`, notes: null, document_path: null, created_at: l.created_at, updated_at: l.created_at,
}));

export const db = {
  companies, profiles, user_companies, call_centers, campaigns, products, statuses, leads, appointments,
  lead_invoices, sales_invoices, invoices: [], waiting_list: [], bulk_lead_action_jobs: [], audit_log: [], access_permissions: [], role_permissions: [], login_attempts: [],
};
export const STAR_ID = star.id;
