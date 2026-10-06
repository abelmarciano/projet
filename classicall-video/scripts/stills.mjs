// Rend des images de contrôle : node scripts/stills.mjs [frames...] (défaut : 3 par scène)
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import path from 'path';
import fs from 'fs';
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const out = path.join(root, 'out', 'stills');
fs.mkdirSync(out, {recursive: true});
const serveUrl = await bundle({entryPoint: path.join(root, 'src/index.ts'), publicDir: path.join(root, 'public')});
const browserExecutable = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
const comp = await selectComposition({serveUrl, id: 'ClassicallPromo', browserExecutable});
let frames = process.argv.slice(2).map(Number);
if (!frames.length) {
  const {SCENES_STARTS} = JSON.parse(fs.readFileSync(path.join(root, 'out', 'timeline.json'), 'utf8'));
  frames = SCENES_STARTS.flatMap(([s, d]) => [s + 20, s + Math.round(d * 0.55), s + d - 18]);
}
for (const frame of frames) {
  const p = path.join(out, `f${String(frame).padStart(4, '0')}.png`);
  await renderStill({serveUrl, composition: comp, frame, output: p, browserExecutable, chromiumOptions: {gl: 'swangle'}});
  console.log(p);
}
