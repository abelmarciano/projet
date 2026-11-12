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
import {Pub3D, P3D_DEFAULT, P3DCfg} from './chatpub/Pub3D';
import f3dCfg from './chatpub/f3d.json';
import g3dCfg from './chatpub/g3d.json';
import c3dCfg from './chatpub/c3d.json';
import i3dCfg from './chatpub/i3d.json';
import r3dCfg from './chatpub/r3d.json';
import {AvantApres, AV_TOTAL} from './chatpub/AvantApres';
import {AvantApres2, AV2} from './chatpub/AvantApres2';
import adAvap2After from './chatpub/ad-avap2-after.json';
import adAvapMei from './chatpub/ad-avap-mei.json';
import {AvantApres3, AV3_TOTAL} from './chatpub/AvantApres3';
import adTest from './chatpub/ad-test.json';
import adAlice from './chatpub/ad-alice.json';
import adUgc2 from './chatpub/ad-ugc2.json';
import adUgc3 from './chatpub/ad-ugc3.json';
import adVelo from './chatpub/ad-velo.json';
import adStudio from './chatpub/ad-studio.json';
import adSkingen from './chatpub/ad-skingen.json';
import adSkingenK from './chatpub/ad-skingen-k.json';
import adLaser from './chatpub/ad-laser.json';
import adStudioL2 from './chatpub/ad-studio-l2.json';
import adStudioS3 from './chatpub/ad-studio-s3.json';
import {SplitChat, SplitCfg} from './chatpub/SplitChat';
import splitCfg from './chatpub/split.json';
import {SplitStats, StatsCfg} from './chatpub/SplitStats';
import split2Cfg from './chatpub/split2.json';
import {SplitSpy, SpyCfg} from './chatpub/SplitSpy';
import split3Cfg from './chatpub/split3.json';
import {SplitBrand, BrandCfg} from './chatpub/SplitBrand';
import split4Cfg from './chatpub/split4.json';
import {SplitBuyer, BuyerCfg} from './chatpub/SplitBuyer';
import split5Cfg from './chatpub/split5.json';
import {SplitBatch, BatchCfg} from './chatpub/SplitBatch';
import split6Cfg from './chatpub/split6.json';
import {SplitEdit, EditCfg} from './chatpub/SplitEdit';
import split7Cfg from './chatpub/split7.json';
import replyCfg from './chatpub/reply.json';
import {SplitCatalog, CatalogCfg} from './chatpub/SplitCatalog';
import reply2Cfg from './chatpub/reply2.json';
import {MultiDecor, MultiCfg} from './chatpub/MultiDecor';
import multiCfg from './chatpub/multi.json';
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
    <Composition id="AdEdit-studio-s3" component={AdEdit} durationInFrames={adStudioS3.frames} fps={30} width={1080} height={1920} defaultProps={{cfg: adStudioS3 as unknown as AdCfg}} />
    <Composition id="AdEdit-studio-l2" component={AdEdit} durationInFrames={adStudioL2.frames} fps={30} width={1080} height={1920} defaultProps={{cfg: adStudioL2 as unknown as AdCfg}} />
    <Composition id="AdEdit-laser" component={AdEdit} durationInFrames={adLaser.frames} fps={30} width={1080} height={1920} defaultProps={{cfg: adLaser as unknown as AdCfg}} />
    <Composition id="AdEdit-skingen-k" component={AdEdit} durationInFrames={adSkingenK.frames} fps={30} width={1080} height={1920} defaultProps={{cfg: adSkingenK as unknown as AdCfg}} />
    <Composition id="AdEdit-skingen" component={AdEdit} durationInFrames={adSkingen.frames} fps={30} width={1080} height={1920} defaultProps={{cfg: adSkingen as unknown as AdCfg}} />
    <Composition id="AdEdit-studio" component={AdEdit} durationInFrames={adStudio.frames} fps={30} width={1080} height={1920} defaultProps={{cfg: adStudio as unknown as AdCfg}} />
    <Composition id="AdEdit-velo" component={AdEdit} durationInFrames={adVelo.frames} fps={30} width={1080} height={1920} defaultProps={{cfg: adVelo as unknown as AdCfg}} />
    <Composition id="AdEdit-ugc3" component={AdEdit} durationInFrames={adUgc3.frames} fps={30} width={1080} height={1920} defaultProps={{cfg: adUgc3 as unknown as AdCfg}} />
    <Composition id="Pub3D-boulanger" component={Pub3D} durationInFrames={P3D_DEFAULT.total} fps={30} width={1080} height={1920} defaultProps={{cfg: P3D_DEFAULT}} />
    <Composition id="SplitChat-adrien" component={SplitChat} durationInFrames={splitCfg.total} fps={30} width={1080} height={1920} defaultProps={{cfg: splitCfg as unknown as SplitCfg}} />
    <Composition id="SplitStats-adrien" component={SplitStats} durationInFrames={split2Cfg.total} fps={30} width={1080} height={1920} defaultProps={{cfg: split2Cfg as unknown as StatsCfg}} />
    <Composition id="SplitSpy-adrien" component={SplitSpy} durationInFrames={split3Cfg.total} fps={30} width={1080} height={1920} defaultProps={{cfg: split3Cfg as unknown as SpyCfg}} />
    <Composition id="SplitBrand-adrien" component={SplitBrand} durationInFrames={split4Cfg.total} fps={30} width={1080} height={1920} defaultProps={{cfg: split4Cfg as unknown as BrandCfg}} />
    <Composition id="SplitBuyer-adrien" component={SplitBuyer} durationInFrames={split5Cfg.total} fps={30} width={1080} height={1920} defaultProps={{cfg: split5Cfg as unknown as BuyerCfg}} />
    <Composition id="SplitBatch-adrien" component={SplitBatch} durationInFrames={split6Cfg.total} fps={30} width={1080} height={1920} defaultProps={{cfg: split6Cfg as unknown as BatchCfg}} />
    <Composition id="SplitEdit-adrien" component={SplitEdit} durationInFrames={split7Cfg.total} fps={30} width={1080} height={1920} defaultProps={{cfg: split7Cfg as unknown as EditCfg}} />
    <Composition id="Reply-aicha" component={SplitChat} durationInFrames={replyCfg.total} fps={30} width={1080} height={1920} defaultProps={{cfg: replyCfg as unknown as SplitCfg}} />
    <Composition id="Reply2-aicha" component={SplitCatalog} durationInFrames={reply2Cfg.total} fps={30} width={1080} height={1920} defaultProps={{cfg: reply2Cfg as unknown as CatalogCfg}} />
    <Composition id="MultiDecor-naomi" component={MultiDecor} durationInFrames={Math.round((multiCfg.videoDur + multiCfg.endDur) * 30)} fps={30} width={1080} height={1920} defaultProps={{cfg: multiCfg as unknown as MultiCfg}} />
    <Composition id="AvantApres3-gel" component={AvantApres3} durationInFrames={AV3_TOTAL} fps={30} width={1080} height={1920} />
    <Composition id="AdEdit-avap-mei" component={AdEdit} durationInFrames={adAvapMei.frames} fps={30} width={1080} height={1920} defaultProps={{cfg: adAvapMei as unknown as AdCfg}} />
    <Composition id="AdEdit-avap2-after" component={AdEdit} durationInFrames={adAvap2After.frames} fps={30} width={1080} height={1920} defaultProps={{cfg: adAvap2After as unknown as AdCfg}} />
    <Composition id="AvantApres2-gel" component={AvantApres2} durationInFrames={AV2.total} fps={30} width={1080} height={1920} />
    <Composition id="AvantApres-gel" component={AvantApres} durationInFrames={AV_TOTAL} fps={30} width={1080} height={1920} />
    <Composition id="Pub3D-resto" component={Pub3D} durationInFrames={(r3dCfg as unknown as P3DCfg).total} fps={30} width={1080} height={1920} defaultProps={{cfg: r3dCfg as unknown as P3DCfg}} />
    <Composition id="Pub3D-immo" component={Pub3D} durationInFrames={(i3dCfg as unknown as P3DCfg).total} fps={30} width={1080} height={1920} defaultProps={{cfg: i3dCfg as unknown as P3DCfg}} />
    <Composition id="Pub3D-coach" component={Pub3D} durationInFrames={(c3dCfg as unknown as P3DCfg).total} fps={30} width={1080} height={1920} defaultProps={{cfg: c3dCfg as unknown as P3DCfg}} />
    <Composition id="Pub3D-garagiste" component={Pub3D} durationInFrames={(g3dCfg as unknown as P3DCfg).total} fps={30} width={1080} height={1920} defaultProps={{cfg: g3dCfg as unknown as P3DCfg}} />
    <Composition id="Pub3D-fleuriste" component={Pub3D} durationInFrames={(f3dCfg as unknown as P3DCfg).total} fps={30} width={1080} height={1920} defaultProps={{cfg: f3dCfg as unknown as P3DCfg}} />
    <Composition id="LaunchReel-v2" component={LaunchReel} durationInFrames={LR.total} fps={30} width={1080} height={1920} />
    <Composition id="ShowIntro" component={ShowIntro} durationInFrames={SHOW_INTRO} fps={30} width={1080} height={1920} defaultProps={{prompt: '', label: '', n: ''}} />
    <Composition id="ShowEnd" component={ShowEnd} durationInFrames={SHOW_END} fps={30} width={1080} height={1920} />
    {ORGANIC.map((c) => (
      <Still key={c.id} id={c.id} component={c.C} width={c.w} height={c.h} />
    ))}
  </>
);
