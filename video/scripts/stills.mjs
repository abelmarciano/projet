// Render preview stills: node scripts/stills.mjs <frame> [frame...]
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import path from 'node:path';
const browserExecutable = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const inputProps = {withAudio: false};
const composition = await selectComposition({serveUrl, id: 'GrowthityPromo', inputProps, browserExecutable});
for (const f of process.argv.slice(2).map(Number)) {
  await renderStill({composition, serveUrl, frame: f, output: `out/stills/f${String(f).padStart(4, '0')}.jpg`, imageFormat: 'jpeg', jpegQuality: 80, inputProps, browserExecutable, scale: 0.5});
  console.log('ok', f);
}
