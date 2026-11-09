// Render the 10 social creatives: node scripts/render_creas.mjs [01 02 ...] → out/creas/crea-NN.png
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import fs from 'node:fs';
import path from 'node:path';
const browserExecutable = '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
const ids = process.argv.slice(2).length ? process.argv.slice(2) : ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10'];
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
fs.mkdirSync('out/creas', {recursive: true});
for (const n of ids) {
  const composition = await selectComposition({serveUrl, id: `Crea${n}`, browserExecutable});
  await renderStill({composition, serveUrl, frame: 0, output: `out/creas/crea-${n}.png`, imageFormat: 'png', browserExecutable});
  console.log('ok', n);
}
