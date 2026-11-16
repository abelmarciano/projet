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
import multi2Cfg from './chatpub/multi2.json';
import multi3Cfg from './chatpub/multi3.json';
import {YtBanner} from './chatpub/YtBanner';
import {LinkedInBanner} from './chatpub/LinkedInBanner';
import {SplitRoast, RoastCfg} from './chatpub/SplitRoast';
import roast1Cfg from './chatpub/roast1.json';
import roast2Cfg from './chatpub/roast2.json';
import roast3Cfg from './chatpub/roast3.json';
import roast4Cfg from './chatpub/roast4.json';
import roast5Cfg from './chatpub/roast5.json';
import roast6Cfg from './chatpub/roast6.json';
import {AvantApres4, Av4Cfg, avap4Total} from './chatpub/AvantApres4';
import avap4Cfg from './chatpub/avap4.json';
import {BriefAndromeda, BriefCfg, briefTotal} from './brief/BriefAndromeda';
import andromedaCfg from './brief/andromeda.json';
import {BriefLearning, LearnCfg} from './brief/BriefLearning';
import {BriefStructure, StructCfg} from './brief/BriefStructure';
import structureCfg from './brief/structure.json';
import {BriefFatigue, FatigueCfg} from './brief/BriefFatigue';
import fatigueCfg from './brief/fatigue.json';
import {BriefScale, ScaleCfg} from './brief/BriefScale';
import scaleCfg from './brief/scale.json';
import {BriefAdvantage, AdvCfg} from './brief/BriefAdvantage';
import advCfg from './brief/advantage.json';
import {BriefCapi, CapiCfg} from './brief/BriefCapi';
import capiCfg from './brief/capi.json';
import {BriefKpi, KpiCfg} from './brief/BriefKpi';
import kpiCfg from './brief/kpi.json';
import {VraiFaux, VFCfg} from './brief/VraiFaux';
import vf1Cfg from './brief/vf1.json';
import {VraiFaux2} from './brief/VraiFaux2';
import vf2Cfg from './brief/vf2.json';
import {VraiFaux3} from './brief/VraiFaux3';
import vf3Cfg from './brief/vf3.json';
import {BriefRegularite, BriefAlertes, SocCfg} from './brief/BriefSocial';
import regCfg from './brief/regularite.json';
import alertCfg from './brief/alertes.json';
import {VraiFaux4, VraiFaux5} from './brief/VraiFauxSocial';
import vf4Cfg from './brief/vf4.json';
import vf5Cfg from './brief/vf5.json';
import {SplitSocial, SocialCfg} from './chatpub/SplitSocial';
import split8Cfg from './chatpub/split8.json';
import split9Cfg from './chatpub/split9.json';
import reply3Cfg from './chatpub/reply3.json';
import reply4Cfg from './chatpub/reply4.json';
import roast7Cfg from './chatpub/roast7.json';
import roast8Cfg from './chatpub/roast8.json';
import multi4Cfg from './chatpub/multi4.json';
import multi5Cfg from './chatpub/multi5.json';
import adBougie from './chatpub/ad-bougie-solene.json';
import adTrefle from './chatpub/ad-trefle-noor.json';
import cp4 from './chatpub/cp4.json';
import cp5 from './chatpub/cp5.json';
import cp6 from './chatpub/cp6.json';
import cp7 from './chatpub/cp7.json';
import {AllInOne} from './allinone/AllInOne';
import {LightChatPub, lightTimeline, LightCfg} from './chatpub/LightChatPub';
import {SocialStory, StoryCfg, storyTotal} from './chatpub/SocialStory';
import lr4Cfg from './chatpub/lr4.json';
import lr5Cfg from './chatpub/lr5.json';
import av5Cfg from './chatpub/av5.json';
import av6Cfg from './chatpub/av6.json';
import pov1Cfg from './chatpub/pov1.json';
import pov2Cfg from './chatpub/pov2.json';
import pov3Cfg from './chatpub/pov3.json';
import pat3dCfg from './chatpub/pat3d.json';
import cav3dCfg from './chatpub/cav3d.json';
import {VraiFaux6, VraiFaux7} from './brief/VraiFaux67';
import vf6Cfg from './brief/vf6.json';
import vf7Cfg from './brief/vf7.json';
import {VraiFaux8, VraiFaux9} from './brief/VraiFaux89';
import vf8Cfg from './brief/vf8.json';
import vf9Cfg from './brief/vf9.json';
import learningCfg from './brief/learning.json';
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
    <Composition id="MultiDecor-steve" component={MultiDecor} durationInFrames={Math.round((multi2Cfg.videoDur + multi2Cfg.endDur) * 30)} fps={30} width={1080} height={1920} defaultProps={{cfg: multi2Cfg as unknown as MultiCfg}} />
    <Composition id="MultiDecor-alice" component={MultiDecor} durationInFrames={Math.round((multi3Cfg.videoDur + multi3Cfg.endDur) * 30)} fps={30} width={1080} height={1920} defaultProps={{cfg: multi3Cfg as unknown as MultiCfg}} />
    <Still id="YtBanner" component={YtBanner} width={2560} height={1440} />
    <Still id="LinkedInBanner" component={LinkedInBanner} width={2256} height={382} defaultProps={{scale: 2}} />
    <Still id="LinkedInBanner1x" component={LinkedInBanner} width={1128} height={191} defaultProps={{scale: 1}} />
    <Composition id="Roast-corinne-1" component={SplitRoast} durationInFrames={roast1Cfg.total} fps={30} width={1080} height={1920} defaultProps={{cfg: roast1Cfg as unknown as RoastCfg}} />
    <Composition id="Roast-corinne-2" component={SplitRoast} durationInFrames={roast2Cfg.total} fps={30} width={1080} height={1920} defaultProps={{cfg: roast2Cfg as unknown as RoastCfg}} />
    <Composition id="Roast-corinne-3" component={SplitRoast} durationInFrames={roast3Cfg.total} fps={30} width={1080} height={1920} defaultProps={{cfg: roast3Cfg as unknown as RoastCfg}} />
    <Composition id="Roast-corinne-4" component={SplitRoast} durationInFrames={roast4Cfg.total} fps={30} width={1080} height={1920} defaultProps={{cfg: roast4Cfg as unknown as RoastCfg}} />
    <Composition id="Roast-corinne-5" component={SplitRoast} durationInFrames={roast5Cfg.total} fps={30} width={1080} height={1920} defaultProps={{cfg: roast5Cfg as unknown as RoastCfg}} />
    <Composition id="Roast-corinne-6" component={SplitRoast} durationInFrames={roast6Cfg.total} fps={30} width={1080} height={1920} defaultProps={{cfg: roast6Cfg as unknown as RoastCfg}} />
    <Composition id="AvantApres4-sac" component={AvantApres4} durationInFrames={avap4Total(avap4Cfg as unknown as Av4Cfg)} fps={30} width={1080} height={1920} defaultProps={{cfg: avap4Cfg as unknown as Av4Cfg}} />
    <Composition id="Brief-andromeda" component={BriefAndromeda} durationInFrames={briefTotal(andromedaCfg as unknown as BriefCfg)} fps={30} width={1080} height={1920} defaultProps={{cfg: andromedaCfg as unknown as BriefCfg}} />
    <Composition id="Brief-learning" component={BriefLearning} durationInFrames={briefTotal(learningCfg as unknown as LearnCfg)} fps={30} width={1080} height={1920} defaultProps={{cfg: learningCfg as unknown as LearnCfg}} />
    <Composition id="Brief-structure" component={BriefStructure} durationInFrames={briefTotal(structureCfg as unknown as StructCfg)} fps={30} width={1080} height={1920} defaultProps={{cfg: structureCfg as unknown as StructCfg}} />
    <Composition id="Brief-fatigue" component={BriefFatigue} durationInFrames={briefTotal(fatigueCfg as unknown as FatigueCfg)} fps={30} width={1080} height={1920} defaultProps={{cfg: fatigueCfg as unknown as FatigueCfg}} />
    <Composition id="Brief-scale" component={BriefScale} durationInFrames={briefTotal(scaleCfg as unknown as ScaleCfg)} fps={30} width={1080} height={1920} defaultProps={{cfg: scaleCfg as unknown as ScaleCfg}} />
    <Composition id="Brief-advantage" component={BriefAdvantage} durationInFrames={briefTotal(advCfg as unknown as AdvCfg)} fps={30} width={1080} height={1920} defaultProps={{cfg: advCfg as unknown as AdvCfg}} />
    <Composition id="Brief-capi" component={BriefCapi} durationInFrames={briefTotal(capiCfg as unknown as CapiCfg)} fps={30} width={1080} height={1920} defaultProps={{cfg: capiCfg as unknown as CapiCfg}} />
    <Composition id="Brief-kpi" component={BriefKpi} durationInFrames={briefTotal(kpiCfg as unknown as KpiCfg)} fps={30} width={1080} height={1920} defaultProps={{cfg: kpiCfg as unknown as KpiCfg}} />
    <Composition id="VraiFaux-1" component={VraiFaux} durationInFrames={briefTotal(vf1Cfg as unknown as VFCfg)} fps={30} width={1080} height={1920} defaultProps={{cfg: vf1Cfg as unknown as VFCfg}} />
    <Composition id="VraiFaux-2" component={VraiFaux2} durationInFrames={briefTotal(vf2Cfg as unknown as VFCfg)} fps={30} width={1080} height={1920} defaultProps={{cfg: vf2Cfg as unknown as VFCfg}} />
    <Composition id="VraiFaux-3" component={VraiFaux3} durationInFrames={briefTotal(vf3Cfg as unknown as VFCfg)} fps={30} width={1080} height={1920} defaultProps={{cfg: vf3Cfg as unknown as VFCfg}} />
    <Composition id="Brief-regularite" component={BriefRegularite} durationInFrames={briefTotal(regCfg as unknown as SocCfg)} fps={30} width={1080} height={1920} defaultProps={{cfg: regCfg as unknown as SocCfg}} />
    <Composition id="Brief-alertes" component={BriefAlertes} durationInFrames={briefTotal(alertCfg as unknown as SocCfg)} fps={30} width={1080} height={1920} defaultProps={{cfg: alertCfg as unknown as SocCfg}} />
    <Composition id="VraiFaux-4" component={VraiFaux4} durationInFrames={briefTotal(vf4Cfg as unknown as VFCfg)} fps={30} width={1080} height={1920} defaultProps={{cfg: vf4Cfg as unknown as VFCfg}} />
    <Composition id="VraiFaux-5" component={VraiFaux5} durationInFrames={briefTotal(vf5Cfg as unknown as VFCfg)} fps={30} width={1080} height={1920} defaultProps={{cfg: vf5Cfg as unknown as VFCfg}} />
    <Composition id="SplitCal-adrien" component={SplitSocial} durationInFrames={split8Cfg.total} fps={30} width={1080} height={1920} defaultProps={{cfg: split8Cfg as unknown as SocialCfg}} />
    <Composition id="SplitWa-adrien" component={SplitSocial} durationInFrames={split9Cfg.total} fps={30} width={1080} height={1920} defaultProps={{cfg: split9Cfg as unknown as SocialCfg}} />
    <Composition id="Reply3-aicha" component={SplitSocial} durationInFrames={reply3Cfg.total} fps={30} width={1080} height={1920} defaultProps={{cfg: reply3Cfg as unknown as SocialCfg}} />
    <Composition id="Reply4-aicha" component={SplitSocial} durationInFrames={reply4Cfg.total} fps={30} width={1080} height={1920} defaultProps={{cfg: reply4Cfg as unknown as SocialCfg}} />
    <Composition id="Roast-corinne-7" component={SplitRoast} durationInFrames={roast7Cfg.total} fps={30} width={1080} height={1920} defaultProps={{cfg: roast7Cfg as unknown as RoastCfg}} />
    <Composition id="Roast-corinne-8" component={SplitRoast} durationInFrames={roast8Cfg.total} fps={30} width={1080} height={1920} defaultProps={{cfg: roast8Cfg as unknown as RoastCfg}} />
    <Composition id="MultiDecor-amelie" component={MultiDecor} durationInFrames={Math.round((multi4Cfg.videoDur + multi4Cfg.endDur) * 30)} fps={30} width={1080} height={1920} defaultProps={{cfg: multi4Cfg as unknown as MultiCfg}} />
    <Composition id="MultiDecor-raphael" component={MultiDecor} durationInFrames={Math.round((multi5Cfg.videoDur + multi5Cfg.endDur) * 30)} fps={30} width={1080} height={1920} defaultProps={{cfg: multi5Cfg as unknown as MultiCfg}} />
    <Composition id="AdEdit-bougie-solene" component={AdEdit} durationInFrames={adBougie.frames} fps={30} width={1080} height={1920} defaultProps={{cfg: adBougie as unknown as AdCfg}} />
    <Composition id="AdEdit-trefle-noor" component={AdEdit} durationInFrames={adTrefle.frames} fps={30} width={1080} height={1920} defaultProps={{cfg: adTrefle as unknown as AdCfg}} />
    <Composition id="ChatPubMotion-cp4" component={MotionChatPub} durationInFrames={motionTimeline(cp4 as unknown as ChatPubCfg).total} fps={30} width={1080} height={1920} defaultProps={{cfg: cp4 as unknown as ChatPubCfg}} />
    <Composition id="ChatPubMotion-cp5" component={MotionChatPub} durationInFrames={motionTimeline(cp5 as unknown as ChatPubCfg).total} fps={30} width={1080} height={1920} defaultProps={{cfg: cp5 as unknown as ChatPubCfg}} />
    <Composition id="ChatPubLight-cp6" component={LightChatPub} durationInFrames={lightTimeline(cp6 as unknown as LightCfg).total} fps={30} width={1080} height={1920} defaultProps={{cfg: cp6 as unknown as LightCfg}} />
    <Composition id="ChatPubLight-cp7" component={LightChatPub} durationInFrames={lightTimeline(cp7 as unknown as LightCfg).total} fps={30} width={1080} height={1920} defaultProps={{cfg: cp7 as unknown as LightCfg}} />
    <Composition id="AllInOne" component={AllInOne} durationInFrames={1084} fps={30} width={1080} height={1920} />
    <Composition id="Launch-calendrier" component={SocialStory} durationInFrames={storyTotal(lr4Cfg as unknown as StoryCfg)} fps={30} width={1080} height={1920} defaultProps={{cfg: lr4Cfg as unknown as StoryCfg}} />
    <Composition id="Launch-whatsapp" component={SocialStory} durationInFrames={storyTotal(lr5Cfg as unknown as StoryCfg)} fps={30} width={1080} height={1920} defaultProps={{cfg: lr5Cfg as unknown as StoryCfg}} />
    <Composition id="AvantApres-julien" component={SocialStory} durationInFrames={storyTotal(av5Cfg as unknown as StoryCfg)} fps={30} width={1080} height={1920} defaultProps={{cfg: av5Cfg as unknown as StoryCfg}} />
    <Composition id="AvantApres-helene" component={SocialStory} durationInFrames={storyTotal(av6Cfg as unknown as StoryCfg)} fps={30} width={1080} height={1920} defaultProps={{cfg: av6Cfg as unknown as StoryCfg}} />
    <Composition id="POV-premiere-pub" component={SocialStory} durationInFrames={storyTotal(pov1Cfg as unknown as StoryCfg)} fps={30} width={1080} height={1920} defaultProps={{cfg: pov1Cfg as unknown as StoryCfg}} />
    <Composition id="POV-tournage" component={SocialStory} durationInFrames={storyTotal(pov2Cfg as unknown as StoryCfg)} fps={30} width={1080} height={1920} defaultProps={{cfg: pov2Cfg as unknown as StoryCfg}} />
    <Composition id="POV-neveu" component={SocialStory} durationInFrames={storyTotal(pov3Cfg as unknown as StoryCfg)} fps={30} width={1080} height={1920} defaultProps={{cfg: pov3Cfg as unknown as StoryCfg}} />
    <Composition id="Pub3D-patissiere" component={Pub3D} durationInFrames={(pat3dCfg as unknown as P3DCfg).total} fps={30} width={1080} height={1920} defaultProps={{cfg: pat3dCfg as unknown as P3DCfg}} />
    <Composition id="Pub3D-caviste" component={Pub3D} durationInFrames={(cav3dCfg as unknown as P3DCfg).total} fps={30} width={1080} height={1920} defaultProps={{cfg: cav3dCfg as unknown as P3DCfg}} />
    <Composition id="VraiFaux-6" component={VraiFaux6} durationInFrames={briefTotal(vf6Cfg as unknown as VFCfg)} fps={30} width={1080} height={1920} defaultProps={{cfg: vf6Cfg as unknown as VFCfg}} />
    <Composition id="VraiFaux-7" component={VraiFaux7} durationInFrames={briefTotal(vf7Cfg as unknown as VFCfg)} fps={30} width={1080} height={1920} defaultProps={{cfg: vf7Cfg as unknown as VFCfg}} />
    <Composition id="VraiFaux-8" component={VraiFaux8} durationInFrames={briefTotal(vf8Cfg as unknown as VFCfg)} fps={30} width={1080} height={1920} defaultProps={{cfg: vf8Cfg as unknown as VFCfg}} />
    <Composition id="VraiFaux-9" component={VraiFaux9} durationInFrames={briefTotal(vf9Cfg as unknown as VFCfg)} fps={30} width={1080} height={1920} defaultProps={{cfg: vf9Cfg as unknown as VFCfg}} />
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
