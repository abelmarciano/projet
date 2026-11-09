// Preview stills of a short: node scripts/short_stills.mjs <n> <frame> [frame...]  (SAFE=1 draws dead zones)
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import fs from 'node:fs';
import path from 'node:path';
const browserExecutable = '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
const [n, ...frames] = process.argv.slice(2);
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const inputProps = {id: `s${n}`, withAudio: false, safeOverlay: process.env.SAFE === '1'};
const composition = await selectComposition({serveUrl, id: `Short${n}`, inputProps, browserExecutable});
console.log('duration', composition.durationInFrames);
fs.mkdirSync(`out/shorts/stills/s${n}`, {recursive: true});
for (const f of frames.map(Number)) {
  await renderStill({composition, serveUrl, frame: f, output: `out/shorts/stills/s${n}/f${String(f).padStart(4, '0')}.jpg`, imageFormat: 'jpeg', jpegQuality: 80, inputProps, browserExecutable, scale: 0.4});
}
console.log('ok');
