import {createRequire} from 'node:module'; const require = createRequire(import.meta.url); const {chromium} = require('playwright');
import fs from 'node:fs';
const T = process.argv[2];
const seed = fs.readFileSync(T + '/seed.json', 'utf8');
const mock = fs.readFileSync(T + '/mock.js', 'utf8');
const b = await chromium.launch();
const errors = [];
async function mk(w, h) {
  const p = await b.newPage({viewport: {width: w, height: h}});
  p.on('pageerror', (e) => errors.push('pageerror ' + e.message));
  p.on('response', (r) => r.status() >= 400 && errors.push(r.status() + ' ' + r.url()));
  await p.addInitScript(`window.__SEED=${seed};` + mock);
  return p;
}
const p = await mk(1440, 960);
const shot = (n) => p.screenshot({path: `${T}/${n}.png`});
await p.goto('http://localhost:8765/index.html'); await p.waitForTimeout(900); await shot('00-home');
await p.keyboard.press('Control+k'); await p.keyboard.type('bijou'); await p.waitForTimeout(200); await shot('00b-cmdk');
await p.keyboard.press('Enter'); await p.waitForTimeout(300); console.log('cmdk enter ->', await p.evaluate(() => location.hash));
await p.goto('http://localhost:8765/index.html#planning'); await p.waitForTimeout(800);
// month on Nov 2026 (today is Nov 9)
await shot('01-planning');
await p.click('[data-mode="week"]'); await p.click('[data-act="cal-next"]'); await p.waitForTimeout(300); await shot('02-week');
await p.click('[data-mode="month"]');
// create a post via Nouveau menu
await p.click('[data-act="newmenu"]'); await p.click('#newmenu [data-type="post"]'); await p.waitForTimeout(300);
await p.fill('#e-title', 'Test post');
await p.click('#picker button >> nth=0');
await p.fill('#e-cap', 'Ma légende de test #growthity');
await p.click('[data-act="net"][data-v="TikTok"]');
await p.click('[data-act="when"][data-d="1"]');
await shot('03-editor-new');
await p.click('[data-act="save"]'); await p.waitForTimeout(300);
console.log('hash after save', await p.evaluate(() => location.hash), await p.textContent('#savedst'));
await shot('04-editor-saved');
// back to posts board
await p.click('.ed-top a.btn'); await p.waitForTimeout(300); await shot('05-posts');
console.log('test post in board', await p.locator('.card:has-text("Test post")').count());
// drag a card to another column
await p.dragAndDrop('.card:has-text("Test post")', '[data-drop-status="live"]'); await p.waitForTimeout(300);
console.log('in live col', await p.locator('[data-drop-status="live"] .card:has-text("Test post")').count());
// open existing post, edit, save
await p.click('.card:has-text("5 accroches")'); await p.waitForTimeout(300);
await p.click('[data-act="pv"][data-v="feed"]');
await p.click('[data-act="pv-slide"][data-d="1"]'); await p.waitForTimeout(200);
await shot('06-editor-existing');
await p.click('[data-act="st"][data-v="sched"]'); await p.click('[data-act="save"]'); await p.waitForTimeout(200);
// duplicate and delete
await p.click('[data-act="dup"]'); await p.waitForTimeout(300);
console.log('dup hash', await p.evaluate(() => location.hash));
await p.click('[data-act="del"]'); await p.click('[data-act="del-yes"]'); await p.waitForTimeout(300);
console.log('after delete', await p.evaluate(() => location.hash));
// ads
await p.goto('http://localhost:8765/index.html#ads'); await p.waitForTimeout(600); await shot('07-ads');
await p.click('tbody tr >> nth=0'); await p.waitForTimeout(300); await p.fill('#a-budget', '25'); await p.selectOption('#a-cta', 'Réserver'); await shot('08-ad-editor');
await p.click('[data-act="save"]'); await p.waitForTimeout(200);
// new ad from planning button
await p.goto('http://localhost:8765/index.html#planning'); await p.waitForTimeout(600);
await p.click('.ph [data-type="ad"]'); await p.waitForTimeout(200); await p.click('[data-act="save"]'); await p.waitForTimeout(200);
console.log('new ad saved hash', await p.evaluate(() => location.hash));
// drag post in planning onto a day
await p.goto('http://localhost:8765/index.html#planning'); await p.waitForTimeout(600);
await p.dragAndDrop('.tray .trow >> nth=0', '[data-drop-day="2026-11-12"]'); await p.waitForTimeout(300);
console.log('planned on 12', await p.locator('[data-drop-day="2026-11-12"] .ev').count());
// medias
await p.goto('http://localhost:8765/index.html#medias'); await p.waitForTimeout(600); await shot('09-medias');
await p.setInputFiles('#file', [T + '/../../../../../home/user/projet/video/out/creas/crea-01.png'].map(() => '/home/user/projet/video/out/creas/crea-01.png'));
await p.waitForTimeout(800);
console.log('upload log', JSON.stringify((await p.evaluate(() => window.__log)).filter((x) => x[0] === 'upload' || x[1] === 'media')));
await p.click('.mc >> nth=1'); await p.waitForTimeout(400); await shot('10-media-detail');
await p.click('[data-act="md-slide"][data-d="1"]').catch(() => {});
await p.click('.ed-top [data-type="post"]'); await p.waitForTimeout(300); await shot('11-post-from-media');
// mobile
const m = await mk(390, 844);
await m.goto('http://localhost:8765/index.html#planning'); await m.waitForTimeout(700); await m.screenshot({path: `${T}/12-mobile-planning.png`});
await m.goto('http://localhost:8765/index.html#post-p-01'); await m.waitForTimeout(700); await m.screenshot({path: `${T}/13-mobile-editor.png`, fullPage: true});
const ow = await m.evaluate(() => document.documentElement.scrollWidth); console.log('mobile scrollWidth', ow);
console.log('log', JSON.stringify((await p.evaluate(() => window.__log)).map((x) => x.join(':'))));
console.log('ERRORS', JSON.stringify(errors));
await b.close();
