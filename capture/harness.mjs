// Lance le vrai front Classicall (Vite) avec un backend Supabase simulé.
import { chromium } from 'playwright';
import fs from 'fs';
const FONT_DIR = new URL('./node_modules/@fontsource/nunito/files/', import.meta.url);
import { handleRest } from './postgrest.mjs';
import { db, ME_ID, NOW } from './data.mjs';

export const BASE = process.env.CRM_URL || 'http://localhost:8080';
const SB = 'https://mmamcmfotdgvhedxqsew.supabase.co';

const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');
const exp = Math.floor(new Date('2027-01-01').getTime() / 1000);
const me = db.profiles.find((p) => p.id === ME_ID);
const user = {
  id: ME_ID, aud: 'authenticated', role: 'authenticated', email: me.email, email_confirmed_at: NOW.toISOString(),
  app_metadata: { provider: 'email', providers: ['email'] }, user_metadata: { first_name: me.first_name, last_name: me.last_name },
  created_at: '2025-06-01T08:00:00Z', updated_at: NOW.toISOString(),
};
const access_token = `${b64({ alg: 'HS256', typ: 'JWT' })}.${b64({ sub: ME_ID, role: 'authenticated', aud: 'authenticated', exp, email: me.email, session_id: 'demo' })}.c2lnbmF0dXJl`;
export const session = { access_token, token_type: 'bearer', expires_in: 3600 * 24 * 60, expires_at: exp, refresh_token: 'demo-refresh', user };

export const fnHandlers = {
  'calculate-distance': (body) => {
    // Distance routière estimée : orthodromie x 1,3 ; vitesse moyenne 52 km/h (zones péri-urbaines)
    const C = { Lyon: [45.7640, 4.8357], Villeurbanne: [45.7719, 4.8902], 'Vénissieux': [45.6973, 4.8859], Bron: [45.7386, 4.9135], 'Saint-Priest': [45.6957, 4.9437], Vienne: [45.5255, 4.8749], 'Bourgoin-Jallieu': [45.5866, 5.2736], Grenoble: [45.1885, 5.7245], 'Chambéry': [45.5646, 5.9178], Valence: [44.9334, 4.8924], 'Montélimar': [44.5581, 4.7509], Annecy: [45.8992, 6.1294], 'Saint-Étienne': [45.4397, 4.3872], Roanne: [46.0340, 4.0726], 'Mâcon': [46.3069, 4.8287], 'Bourg-en-Bresse': [46.2052, 5.2255], 'Clermont-Ferrand': [45.7772, 3.0870], Marseille: [43.2965, 5.3698], 'Aix-en-Provence': [43.5297, 5.4474], Avignon: [43.9493, 4.8055], 'Nîmes': [43.8367, 4.3601], 'Caluire-et-Cuire': [45.7953, 4.8466], 'Décines-Charpieu': [45.7686, 4.9589], Oullins: [45.7146, 4.8075], Givors: [45.5906, 4.7689] };
    const wp = body?.waypoints || [];
    const pos = (w) => { const k = Object.keys(C).find((c) => w.includes(c)); return C[k]; };
    const hav = ([a, b], [c, d]) => { const R = 6371, r = Math.PI / 180; const x = Math.sin((c - a) * r / 2) ** 2 + Math.cos(a * r) * Math.cos(c * r) * Math.sin((d - b) * r / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(x)); };
    const legs = []; let km = 0, min = 0;
    for (let i = 0; i < wp.length - 1; i++) {
      const d = Math.max(3.2, hav(pos(wp[i]), pos(wp[i + 1])) * 1.3); const m = Math.round(d / 52 * 60 + 4);
      km += d; min += m;
      legs.push({ start_address: wp[i], end_address: wp[i + 1], distance: `${d.toFixed(1).replace('.', ',')} km`, duration: `${m} min` });
    }
    const res = { distance: `${Math.round(km)} km`, duration: `${min} minutes`, legs };
    try { fs.writeFileSync(new URL('../screenshots/planning-optimizer.json', import.meta.url), JSON.stringify({ waypoints: wp, ...res }, null, 2)); } catch {}
    return res;
  },
};

export async function launch({ auth = true, scale = 2 } = {}) {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--font-render-hinting=none'] });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }, deviceScaleFactor: scale, locale: 'fr-FR', timezoneId: 'Europe/Paris',
  });
  await context.routeWebSocket(/supabase\.co/, () => {});
  await context.route('https://fonts.googleapis.com/**', (route) => {
    const css = [400, 500, 600, 700, 800].map((w) => `@font-face{font-family:'Nunito';font-style:normal;font-weight:${w};font-display:block;src:url(https://fonts.gstatic.com/local/nunito-latin-${Math.min(w,700)}-normal.woff2) format('woff2');unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD}
@font-face{font-family:'Nunito';font-style:normal;font-weight:${w};font-display:block;src:url(https://fonts.gstatic.com/local/nunito-latin-ext-${Math.min(w,700)}-normal.woff2) format('woff2');unicode-range:U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF}`).join('\n');
    return route.fulfill({ status: 200, headers: { 'content-type': 'text/css', 'access-control-allow-origin': '*' }, body: css });
  });
  await context.route('https://fonts.gstatic.com/local/**', (route) => {
    const f = route.request().url().split('/local/')[1];
    return route.fulfill({ status: 200, headers: { 'content-type': 'font/woff2', 'access-control-allow-origin': '*' }, body: fs.readFileSync(new URL(f, FONT_DIR)) });
  });
  await context.route(/^https:\/\/(?!mmamcmfotdgvhedxqsew)/, (route) => route.abort());
  await context.route(`${SB}/**`, async (route) => {
    const req = route.request();
    const url = req.url(), method = req.method();
    const cors = { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': '*', 'access-control-expose-headers': 'content-range' };
    if (method === 'OPTIONS') return route.fulfill({ status: 200, headers: cors });
    const json = (status, body, headers = {}) => route.fulfill({ status, headers: { ...cors, 'content-type': 'application/json', ...headers }, body: body == null ? '' : JSON.stringify(body) });
    try {
      if (url.includes('/auth/v1/')) {
        if (url.includes('/auth/v1/user')) return json(200, user);
        if (url.includes('/auth/v1/token')) return json(200, session);
        if (url.includes('/auth/v1/logout')) return json(204, null);
        return json(200, {});
      }
      if (url.includes('/functions/v1/')) {
        const name = new URL(url).pathname.split('/functions/v1/')[1];
        const h = fnHandlers[name];
        let body = null; try { body = JSON.parse(req.postData() || 'null'); } catch {}
        return json(h ? 200 : 200, h ? h(body) : { success: true });
      }
      if (url.includes('/rest/v1/')) {
        const r = handleRest(db, method, url, req.headers(), req.postData());
        return json(r.status, r.body, r.headers);
      }
      if (url.includes('/storage/v1/')) return json(200, []);
      return json(404, { message: 'not mocked' });
    } catch (e) {
      console.error('MOCK ERROR', method, url, e);
      return json(500, { message: String(e) });
    }
  });
  if (auth) {
    await context.addInitScript(([s]) => {
      if (!localStorage.getItem('supabase.auth.token')) localStorage.setItem('supabase.auth.token', s); localStorage.setItem('accounting_access', 'true');
    }, [JSON.stringify(session)]);
  }
  // Pas de scrollbars, pas de bannière dev, pas de curseur clignotant.
  await context.addInitScript(() => {
    const css = `::-webkit-scrollbar{width:0!important;height:0!important;display:none}*{scrollbar-width:none!important}
      [data-sonner-toaster]{display:none!important} *{caret-color:transparent!important}`;
    const add = () => { const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st); };
    if (document.head) add(); else document.addEventListener('DOMContentLoaded', add);
  });
  const page = await context.newPage();
  await page.clock.setFixedTime(new Date('2026-10-06T08:30:00.000Z'));
  page.on('pageerror', (e) => console.error('PAGEERROR', e.message));
  return { browser, context, page };
}

export async function settle(page, ms = 1200) {
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(ms);
}
