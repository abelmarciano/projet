import React from 'react';
import {Composition, continueRender, delayRender} from 'remotion';
import '@fontsource/nunito/400.css';
import '@fontsource/nunito/500.css';
import '@fontsource/nunito/600.css';
import '@fontsource/nunito/700.css';
import '@fontsource/nunito/800.css';
import {Promo, TOTAL} from './Promo';
import {FPS, H, W} from './theme';

// Attendre que Nunito soit chargée avant de rendre la moindre image
const handle = delayRender('Chargement de Nunito');
Promise.all(
  [400, 500, 600, 700, 800].map((w) => document.fonts.load(`${w} 40px Nunito`, 'Classicall éèàçœ€')),
)
  .then(() => continueRender(handle))
  .catch(() => continueRender(handle));

export const Root: React.FC = () => (
  <Composition id="ClassicallPromo" component={Promo} durationInFrames={TOTAL} fps={FPS} width={W} height={H} />
);
