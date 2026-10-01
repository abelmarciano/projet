import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Audio, continueRender, delayRender, staticFile} from 'remotion';
import {TransitionSeries, linearTiming, springTiming} from '@remotion/transitions';
import {fade} from '@remotion/transitions/fade';
import {slide} from '@remotion/transitions/slide';
import {wipe} from '@remotion/transitions/wipe';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/space-grotesk/500.css';
import '@fontsource/space-grotesk/600.css';
import '@fontsource/space-grotesk/700.css';
import {Problem} from './scenes/Problem';
import {Hero} from './scenes/Hero';
import {Chat} from './scenes/Chat';
import {Formats} from './scenes/Formats';
import {Actors} from './scenes/Actors';
import {Spy} from './scenes/Spy';
import {Publish} from './scenes/Publish';
import {Outro} from './scenes/Outro';
import {SCENES, TRANSITIONS} from './timeline';

const COMPONENTS: Record<string, React.FC> = {Problem, Hero, Chat, Formats, Actors, Spy, Publish, Outro};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const presentation = (kind: string): any => {
  switch (kind) {
    case 'slide-up':
      return slide({direction: 'from-bottom'});
    case 'slide-left':
      return slide({direction: 'from-right'});
    case 'wipe':
      return wipe({direction: 'from-left'});
    default:
      return fade();
  }
};

const useFonts = () => {
  const [handle] = useState(() => delayRender('fonts'));
  useEffect(() => {
    const specs = ['400 20px Inter', '500 20px Inter', '600 20px Inter', '700 20px Inter', '500 20px "Space Grotesk"', '600 20px "Space Grotesk"', '700 20px "Space Grotesk"'];
    Promise.all(specs.map((s) => document.fonts.load(s))).then(() => continueRender(handle));
  }, [handle]);
};

export const Promo: React.FC<{withAudio?: boolean}> = ({withAudio = true}) => {
  useFonts();
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <TransitionSeries>
        {SCENES.flatMap((s, i) => {
          const Comp = COMPONENTS[s.id];
          const items = [
            <TransitionSeries.Sequence key={s.id} durationInFrames={s.duration}>
              <Comp />
            </TransitionSeries.Sequence>,
          ];
          const t = TRANSITIONS[i];
          if (t) {
            items.push(
              <TransitionSeries.Transition
                key={`${s.id}-t`}
                presentation={presentation(t.kind)}
                timing={t.kind === 'fade' ? linearTiming({durationInFrames: t.duration}) : springTiming({config: {damping: 200}, durationInFrames: t.duration})}
              />,
            );
          }
          return items;
        })}
      </TransitionSeries>
      {withAudio && <Audio src={staticFile('soundtrack.wav')} />}
    </AbsoluteFill>
  );
};
