import React from 'react';
import {Composition, Still} from 'remotion';
import {Promo} from './Promo';
import {TOTAL} from './timeline';
import {Short} from './shorts/Short';
import {SHORT_IDS, totalFrames} from './shorts/timeline';
import {CREAS} from './creas/Creas';

export const Root: React.FC = () => (
  <>
    <Composition id="GrowthityPromo" component={Promo} durationInFrames={TOTAL} fps={30} width={1920} height={1080} defaultProps={{withAudio: true}} />
    <Composition id="GrowthityPromoVertical" component={Promo} durationInFrames={TOTAL} fps={30} width={1080} height={1920} defaultProps={{withAudio: true, vertical: true}} />
    {SHORT_IDS.map((id, i) => (
      <Composition key={id} id={`Short${i + 1}`} component={Short} durationInFrames={totalFrames(id)} fps={30} width={1080} height={1920} defaultProps={{id, withAudio: true}} />
    ))}
    {CREAS.map((c) => (
      <Still key={c.id} id={c.id} component={c.C} width={c.w} height={c.h} />
    ))}
  </>
);
