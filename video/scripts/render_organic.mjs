// Render the organic feed posts: node scripts/render_organic.mjs [filter] → out/organiques/<post>/slide-N.png
import {bundle} from '@remotion/bundler';
import {getCompositions, renderStill} from '@remotion/renderer';
import fs from 'node:fs';
import path from 'node:path';
const browserExecutable = '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
const filter = process.argv[2] ?? '';
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const comps = (await getCompositions(serveUrl, {browserExecutable})).filter((c) => c.id.startsWith('Org') && c.id.includes(filter));
for (const composition of comps) {
  const m = composition.id.match(/^Org(.+)S(\d+)$/);
  const post = m[1];
  const n = Number(m[2]);
  const single = comps.filter((c) => c.id.startsWith(`Org${post}S`)).length === 1 && !comps.some((c) => c.id === `Org${post}S2`);
  const out = single ? `out/organiques/${post}.png` : `out/organiques/${post}/slide-${n}.png`;
  fs.mkdirSync(path.dirname(out), {recursive: true});
  await renderStill({composition, serveUrl, frame: 0, output: out, imageFormat: 'png', browserExecutable});
  console.log('ok', out);
}
