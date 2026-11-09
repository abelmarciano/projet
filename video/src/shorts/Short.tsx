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
import {S1End, S1Phone, S1Wall} from './S1';
import {S2Chat, S2End, S2Hook, S2Result} from './S2';
import {S3End, S3Hook, S3Make, S3Pain, S3Publish} from './S3';
import {S4End, S4Hook, S4Spy} from './S4';
import {S5Describe, S5Finish, S5Hook, S5Make, S5Publish, S5Timer} from './S5';

const SCENES: Record<ShortId, React.FC<SceneProps>[]> = {
  s1: [S1Wall, S1Phone, S1End],
  s2: [S2Hook, S2Chat, S2Result, S2End],
  s3: [S3Hook, S3Pain, S3Make, S3Publish, S3End],
  s4: [S4Hook, S4Spy, S4End],
  s5: [S5Hook, S5Describe, S5Make, S5Publish, S5Finish],
};
const END_SCENES = new Set<React.FC<SceneProps>>([S1End, S2End, S3End, S4End]);

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
  // no captions over the end card, nor while Charlotte speaks for herself (short 2)
  const hide: number[][] = sc.filter((_, i) => END_SCENES.has(comps[i])).map((s) => [s.start, s.start + s.dur]);
  if (id === 's2') {
    const r = sc[2];
    hide.push([ls[3].words[ls[3].words.length - 1].e + 10, r.start + r.dur]);
  }
  if (id === 's5') {
    const g = ls[4].words.find((w) => w.w.toLowerCase().startsWith('growthity'));
    if (g) hide.push([g.f - 6, ls[4].start + ls[4].frames]);
  }
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
      {id === 's5' && <S5Timer lines={ls} />}
      <Captions words={words} hideFrom={hide} />
      {safeOverlay && <SafeOverlay />}
      {withAudio && <Audio src={staticFile(`shorts/${id}.wav`)} />}
    </AbsoluteFill>
  );
};
