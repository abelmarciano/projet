// Captures des écrans réels de Classicall (front Vite + backend de démo simulé).
// Usage : CRM_URL=http://127.0.0.1:8080 node capture.mjs [filtre]
import fs from 'fs';
import { launch, settle, BASE } from './harness.mjs';

const OUT = process.env.OUT || '../screenshots';
fs.mkdirSync(OUT, { recursive: true });
const only = process.argv[2];
const steps = [];
const step = (name, fn) => steps.push({ name, fn });
const shot = async (page, name, opts = {}) => {
  await page.screenshot({ path: `${OUT}/${name}.png`, ...opts });
  console.log('✓', name);
};
const boxOf = async (loc, pad = 0) => {
  const b = await loc.boundingBox();
  return { x: Math.max(0, b.x - pad), y: Math.max(0, b.y - pad), width: b.width + pad * 2, height: b.height + pad * 2 };
};
// Remonte jusqu'à la carte (fond blanc arrondi) qui contient le texte
const cardOf = (page, text) => page.locator('div.rounded-lg, div.rounded-xl', { hasText: text }).filter({ has: page.getByText(text, { exact: true }) }).last();

step('login', async () => {
  const { browser, page } = await launch({ auth: false });
  await page.goto(BASE + '/login'); await settle(page, 1500);
  await shot(page, 'login');
  await page.getByPlaceholder(/mail/i).first().fill('julien.moreau@soleil-habitat.fr').catch(() => {});
  await page.locator('input[type=password]').first().fill('motdepasse').catch(() => {});
  await page.waitForTimeout(300);
  await shot(page, 'login-rempli');
  await browser.close();
});

step('dashboard', async () => {
  const { browser, page } = await launch();
  await page.goto(BASE + '/dashboard'); await settle(page, 3000);
  await shot(page, 'dashboard');
  const cards = page.getByText('Leads totaux', { exact: true }).locator('xpath=ancestor::div[contains(@class,"grid")][1]');
  await shot(page, 'dashboard-cards', { clip: await boxOf(cards, 14) });
  const graph = cardOf(page, 'Évolution des Leads et Installations');
  await shot(page, 'dashboard-graph', { clip: await boxOf(graph, 10) });
  const dep = cardOf(page, 'Performance par Département');
  await shot(page, 'dashboard-departements', { clip: await boxOf(dep, 10) });
  const prod = cardOf(page, 'Produits vendus');
  await shot(page, 'dashboard-produits', { clip: await boxOf(prod, 10) });
  const st = cardOf(page, 'Statuts Leads');
  await shot(page, 'dashboard-statuts', { clip: await boxOf(st, 10) });
  await page.mouse.wheel(0, 700); await page.waitForTimeout(800);
  await shot(page, 'dashboard-bas');
  await page.mouse.wheel(0, -2000); await page.waitForTimeout(500);
  await page.getByText('Performance Télépros', { exact: true }).click(); await settle(page, 2500);
  await shot(page, 'dashboard-stats');
  await page.getByText('Performance Commerciaux', { exact: true }).click(); await settle(page, 2500);
  await shot(page, 'dashboard-commerciaux');
  await browser.close();
});

step('leads', async () => {
  const { browser, page } = await launch();
  await page.goto(BASE + '/leads'); await settle(page, 2500);
  await shot(page, 'leads-table');
  await shot(page, 'leads-table-statuts', { clip: { x: 1000, y: 180, width: 920, height: 520 } });
  // Doublons : zoom sur les lignes concernées
  const dup = page.getByText('DOUBLON', { exact: true }).first();
  await dup.hover(); await page.waitForTimeout(600);
  const row = dup.locator('xpath=ancestor::tr[1]');
  const rb = await row.boundingBox();
  await shot(page, 'leads-doublon', { clip: { x: 0, y: Math.max(180, rb.y - 120), width: 1100, height: 330 } });
  await shot(page, 'leads-doublon-large');
  // Filtres d'en-tête : menu déroulant Statut
  const statusHeader = page.locator('th', { hasText: 'Statut' }).first();
  await statusHeader.locator('svg.lucide-filter, button').first().click().catch(async () => { await statusHeader.click(); });
  await page.waitForTimeout(900);
  await shot(page, 'leads-filtre-statut');
  await page.keyboard.press('Escape'); await page.waitForTimeout(400);
  // Filtres avancés
  await page.getByText('Filtres avancés').click(); await page.waitForTimeout(1000);
  await shot(page, 'leads-filters-dialog');
  const dlg = page.getByRole('dialog');
  await dlg.getByText('Sélectionner des statuts').click(); await page.waitForTimeout(700);
  for (const s of ['Nouveau', 'RDV pris', 'À rappeler']) {
    await page.getByRole('option', { name: s }).first().click().catch(async () => { await page.getByText(s, { exact: true }).last().click(); });
    await page.waitForTimeout(350);
    await shot(page, `leads-filters-${['a', 'b', 'c'][['Nouveau', 'RDV pris', 'À rappeler'].indexOf(s)]}`);
  }
  await shot(page, 'leads-filters');
  await page.keyboard.press('Escape'); await page.waitForTimeout(400);
  await dlg.getByText('Sélectionner des campagnes').click().catch(() => {}); await page.waitForTimeout(700);
  for (const s of ['Facebook Solaire', 'Google Ads PAC']) {
    await page.getByRole('option', { name: s }).first().click().catch(async () => { await page.getByText(s, { exact: true }).last().click(); });
    await page.waitForTimeout(350);
  }
  await shot(page, 'leads-filters-campagnes');
  await page.keyboard.press('Escape'); await page.waitForTimeout(300);
  await dlg.getByText('Appliquer les filtres').click().catch(() => {}); await settle(page, 2000);
  await shot(page, 'leads-filtres-appliques');
  await browser.close();
});

step('fiche', async () => {
  const { browser, page } = await launch();
  await page.goto(BASE + '/leads'); await settle(page, 2000);
  await page.getByText(/^Contrats/).click(); await settle(page, 2000);
  await page.getByText('Christophe Durand').first().click(); await settle(page, 1500);
  const panel = page.locator('div', { has: page.getByText('Informations client', { exact: true }) }).filter({ has: page.getByText('Historique', { exact: true }) }).last();
  await shot(page, 'lead-fiche-1');
  let i = 2;
  for (const s of ['Assignation', 'Produit', 'Commentaires', 'Historique']) {
    await page.getByText(s, { exact: true }).last().click(); await page.waitForTimeout(900);
    await shot(page, `lead-fiche-${i++}`);
  }
  // Mode plein écran de la fiche
  await page.getByText('Informations client', { exact: true }).last().click(); await page.waitForTimeout(600);
  await shot(page, 'lead-fiche');
  const pb = await panel.boundingBox().catch(() => null);
  if (pb) await shot(page, 'lead-fiche-panneau', { clip: { x: pb.x, y: pb.y, width: pb.width, height: Math.min(pb.height, 1080 - pb.y) } });
  await browser.close();
});

step('planning', async () => {
  const { browser, page } = await launch();
  await page.goto(BASE + '/planning'); await settle(page, 3000);
  await shot(page, 'planning-semaine');
  await page.mouse.wheel(0, 500); await page.waitForTimeout(700);
  await shot(page, 'planning-semaine-apres-midi');
  await page.mouse.wheel(0, -2000); await page.waitForTimeout(500);
  // Fiche rendez-vous
  const card = page.getByText('Céline Garcia').first();
  await card.click(); await page.waitForTimeout(1200);
  await shot(page, 'planning-fiche-rdv');
  // Optimiseur : sélection de 4 RDV du mercredi puis calcul
  const pickDistance = async (name) => {
    await page.keyboard.press('Escape').catch(() => {});
    await page.getByText(name).first().click(); await page.waitForTimeout(900);
    await page.getByRole('button', { name: 'Distance' }).first().click(); await page.waitForTimeout(700);
  };
  await page.getByText('Céline Garcia').first().click(); await page.waitForTimeout(300);
  for (const n of ['Brigitte Mathieu', 'Céline Garcia', 'Christophe Richard', 'Martine Simon']) await pickDistance(n).catch((e) => console.log('pick', n, e.message));
  await shot(page, 'planning-optimizer-selection');
  await page.getByRole('button', { name: /calculer/i }).first().click().catch((e) => console.log('calc', e.message));
  await page.waitForTimeout(1500);
  await shot(page, 'planning-optimizer');
  await browser.close();
});

step('parametres', async () => {
  const { browser, page } = await launch();
  await page.goto(BASE + '/settings/accounting'); await settle(page, 2500);
  await shot(page, 'parametres-factures');
  for (const [tab, name] of [['Leads & Campagnes', 'parametres'], ['Commissions', 'parametres-commissions'], ['Produits', 'parametres-produits'], ['Encaissements', 'parametres-encaissements'], ['Factures de ventes', 'parametres-ventes']]) {
    await page.getByRole('tab', { name: tab }).click().catch(async () => { await page.getByText(tab, { exact: true }).last().click(); });
    await settle(page, 2000);
    await shot(page, name);
  }
  for (const r of ['campaigns', 'statuses', 'products', 'users']) {
    await page.goto(BASE + '/settings/' + r); await settle(page, 2000);
    await shot(page, 'parametres-' + r);
  }
  await browser.close();
});

for (const s of steps) {
  if (only && !only.split(',').includes(s.name)) continue;
  try { await s.fn(); } catch (e) { console.error('✗', s.name, e.message.split('\n')[0]); }
}
