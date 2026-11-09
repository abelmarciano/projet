import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Audio, continueRender, delayRender, Sequence, staticFile} from 'remotion';
import '@fontsource/inter/400.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/inter/800.css';
import '@fontsource/space-grotesk/600.css';
import '@fontsource/space-grotesk/700.css';
import {SafeOverlay} from '../vertical/safe';
import {Captions, Punch} from './kit';
import {lines, scenes, SceneProps, ShortId} from './timeline';
import {S1End, S1Hook, S1Make, S1Promo, S1Wall} from './S1';
import {S2End, S2Feed, S2Hook, S2Lucas} from './S2';
import {S3Demos, S3End, S3Grid, S3Hook} from './S3';
import {S4Caroline, S4End, S4Hook, S4Lila, S4Visual} from './S4';
import {S5Artisan, S5End, S5Hook, S5Pro, S5Publish} from './S5';

const SCENES: Record<ShortId, React.FC<SceneProps>[]> = {
  s1: [S1Hook, S1Wall, S1Make, S1Promo, S1End],
  s2: [S2Hook, S2Lucas, S2Feed, S2End],
  s3: [S3Hook, S3Demos, S3Grid, S3End],
  s4: [S4Hook, S4Caroline, S4Lila, S4Visual, S4End],
  s5: [S5Hook, S5Artisan, S5Pro, S5Publish, S5End],
};
const END_SCENES = new Set<React.FC<SceneProps>>([S1End, S2End, S3End, S4End, S5End]);

const useFonts = () => {
  const [handle] = useState(() => delayRender('fonts'));
  useEffect(() => {
    const specs = ['400 20px Inter', '600 20px Inter', '700 20px Inter', '800 20px Inter', '600 20px "Space Grotesk"', '700 20px "Space Grotesk"'];
    Promise.all(specs.map((s) => document.fonts.load(s))).then(() => continueRender(handle));
  }, [handle]);
};

export const Short: React.FC<{id: ShortId; withAudio?: boolean; safeOverlay?: boolean}> = ({id, withAudio = true, safeOverlay = false}) => {
  useFonts();
  const ls = lines(id);
  const sc = scenes(id);
  const comps = SCENES[id];
  const words = ls.flatMap((l) => l.words);
  // no captions over the end card
  const hide: number[][] = sc.filter((_, i) => END_SCENES.has(comps[i])).map((s) => [s.start, s.start + s.dur]);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {sc.map((s, i) => {
        const Comp = comps[i];
        return (
          <Sequence key={i} from={s.start} durationInFrames={s.dur}>
            <Punch strength={i === 0 ? 0 : 1}>
              <Comp dur={s.dur} lines={s.lines} />
            </Punch>
          </Sequence>
        );
      })}
      <Captions words={words} hideFrom={hide} />
      {safeOverlay && <SafeOverlay />}
      {withAudio && <Audio src={staticFile(`shorts/${id}.wav`)} />}
    </AbsoluteFill>
  );
};
