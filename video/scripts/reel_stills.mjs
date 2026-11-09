// node scripts/reel_stills.mjs → out/reels/stills/<id>-<frame>.jpg at a few points per reel
import {bundle} from '@remotion/bundler';
import {getCompositions, renderStill} from '@remotion/renderer';
import fs from 'node:fs';
import path from 'node:path';
const browserExecutable = '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const comps = (await getCompositions(serveUrl, {browserExecutable, inputProps: {withAudio: false}})).filter((c) => c.id.startsWith('Reel') && (process.argv[2] ? c.id === process.argv[2] : true));
fs.mkdirSync('out/reels/stills', {recursive: true});
for (const c of comps) {
  for (const fr of [40, Math.round(c.durationInFrames * 0.3), Math.round(c.durationInFrames * 0.55), Math.round(c.durationInFrames * 0.78), c.durationInFrames - 20]) {
    await renderStill({composition: {...c, props: {...c.props, withAudio: false}}, serveUrl, frame: fr, output: `out/reels/stills/${c.id}-${String(fr).padStart(3, '0')}.jpeg`, imageFormat: 'jpeg', jpegQuality: 70, scale: 0.3, browserExecutable});
  }
  console.log('ok', c.id);
}
