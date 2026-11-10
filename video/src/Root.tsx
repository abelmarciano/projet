import React from 'react';
import {Composition, Still} from 'remotion';
import {Promo} from './Promo';
import {TOTAL} from './timeline';
import {Short} from './shorts/Short';
import {SHORT_IDS, totalFrames} from './shorts/timeline';
import {CREAS} from './creas/Creas';
import {ORGANIC} from './organic/Organic';
import {ReelComp, REEL_LIST} from './reels/Reels';
import {ChatToAd, timeline as cpTimeline, ChatPubCfg} from './chatpub/ChatToAd';
import cp1 from './chatpub/cp1.json';
import cp2 from './chatpub/cp2.json';
import {MotionChatPub, motionTimeline} from './chatpub/MotionChatPub';
import {AdEdit, AdCfg} from './chatpub/AdEdit';
import {LaunchReel, LR} from './chatpub/LaunchReel';
import adTest from './chatpub/ad-test.json';
import adAlice from './chatpub/ad-alice.json';
import adUgc2 from './chatpub/ad-ugc2.json';
import adUgc3 from './chatpub/ad-ugc3.json';
import adVelo from './chatpub/ad-velo.json';
import {ShowIntro, ShowEnd, SHOW_INTRO, SHOW_END} from './reels/Showcase';

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
    {REEL_LIST.map((r) => (
      <Composition key={r.id} id={`Reel${r.id.slice(1)}`} component={ReelComp} durationInFrames={r.frames} fps={30} width={1080} height={1920} defaultProps={{id: r.id, withAudio: true}} />
    ))}
    <Composition id="ChatPub-cp1" component={ChatToAd} durationInFrames={cpTimeline(cp1 as unknown as ChatPubCfg).total} fps={30} width={1080} height={1920} defaultProps={{cfg: cp1 as unknown as ChatPubCfg}} />
    <Composition id="ChatPubMotion-cp1" component={MotionChatPub} durationInFrames={motionTimeline(cp1 as unknown as ChatPubCfg).total} fps={30} width={1080} height={1920} defaultProps={{cfg: cp1 as unknown as ChatPubCfg}} />
    <Composition id="AdEdit-test" component={AdEdit} durationInFrames={adTest.frames} fps={30} width={1080} height={1920} defaultProps={{cfg: adTest as unknown as AdCfg}} />
    <Composition id="AdEdit-alice" component={AdEdit} durationInFrames={adAlice.frames} fps={30} width={1080} height={1920} defaultProps={{cfg: adAlice as unknown as AdCfg}} />
    <Composition id="ChatPubMotion-cp2" component={MotionChatPub} durationInFrames={motionTimeline(cp2 as unknown as ChatPubCfg).total} fps={30} width={1080} height={1920} defaultProps={{cfg: cp2 as unknown as ChatPubCfg}} />
    <Composition id="AdEdit-ugc2" component={AdEdit} durationInFrames={adUgc2.frames} fps={30} width={1080} height={1920} defaultProps={{cfg: adUgc2 as unknown as AdCfg}} />
    <Composition id="AdEdit-velo" component={AdEdit} durationInFrames={adVelo.frames} fps={30} width={1080} height={1920} defaultProps={{cfg: adVelo as unknown as AdCfg}} />
    <Composition id="AdEdit-ugc3" component={AdEdit} durationInFrames={adUgc3.frames} fps={30} width={1080} height={1920} defaultProps={{cfg: adUgc3 as unknown as AdCfg}} />
    <Composition id="LaunchReel-v2" component={LaunchReel} durationInFrames={LR.total} fps={30} width={1080} height={1920} />
    <Composition id="ShowIntro" component={ShowIntro} durationInFrames={SHOW_INTRO} fps={30} width={1080} height={1920} defaultProps={{prompt: '', label: '', n: ''}} />
    <Composition id="ShowEnd" component={ShowEnd} durationInFrames={SHOW_END} fps={30} width={1080} height={1920} />
    {ORGANIC.map((c) => (
      <Still key={c.id} id={c.id} component={c.C} width={c.w} height={c.h} />
    ))}
  </>
);
