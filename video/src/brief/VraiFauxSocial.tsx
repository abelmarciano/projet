// « Vrai ou faux ? » #4 (poster tous les jours) et #5 (surveiller ses pubs toute la journée).
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {DISPLAY, INK, prog} from '../chatpub/SplitChat';
import {BriefShell, Grad} from './BriefAndromeda';
import {VFCfg, VFS1, VFS2, VFS3, VFS6} from './VraiFaux';
import {CalGrid, NetRows, RhythmRows, WaBubble, WaButtons, WaPhone, Word, at, sp} from './socialKit';
import {TouchScene} from './BriefSocial';

const Title: React.FC<{tag: string; color: string; children: React.ReactNode}> = ({tag, color, children}) => (
  <div style={{position: 'absolute', left: 80, right: 80, top: 360}}>
    <div style={{fontSize: 26, fontWeight: 800, letterSpacing: '0.14em', color}}>● {tag}</div>
    <div style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 70, lineHeight: 1.05, letterSpacing: '-0.03em', color: INK, marginTop: 14}}>{children}</div>
  </div>
);

const V4S4: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Title tag="POURQUOI" color="#5B3FE4">Le sprint s’essouffle.<br /><Grad>Le rythme reste.</Grad></Title>
      <RhythmRows f={f} start={6} x={110} y={720} w={860} />
    </AbsoluteFill>
  );
};
const V4S5: React.FC<{words: Word[]}> = ({words}) => {
  const f = useCurrentFrame();
  const pr = at(words, 'programme');
  return (
    <AbsoluteFill>
      <Title tag="LE BON RÉFLEXE" color="#16A34A">Un rythme tenable,<br /><Grad>programmé d’avance.</Grad></Title>
      <CalGrid f={f} start={Math.min(pr, 40)} x={110} y={640} w={860} step={2} />
    </AbsoluteFill>
  );
};
export const VraiFaux4: React.FC<{cfg: VFCfg}> = ({cfg}) => (
  <BriefShell cfg={cfg} comps={[<VFS1 key={0} cfg={cfg} />, <VFS2 key={1} cfg={cfg} />, <VFS3 key={2} cfg={cfg} />, <V4S4 key={3} />, <V4S5 key={4} words={cfg.scenes[4].words} />, <VFS6 key={5} ads={cfg.ads} />]} />
);

const V5S5: React.FC<{words: Word[]}> = ({words}) => {
  const f = useCurrentFrame();
  const al = Math.min(at(words, 'alerte'), 30), bi = at(words, 'bilan');
  return (
    <AbsoluteFill>
      <Title tag="LE BON RÉFLEXE" color="#16A34A">Une alerte au bon moment,<br /><Grad>un bilan par semaine.</Grad></Title>
      <WaPhone x={170} y={640} w={740} h={660}>
        <WaBubble f={f} start={al} time="Mar. 11:15">⚠️ Le coût par résultat de <b>« Soldes hiver »</b> monte depuis 3 jours. On t’explique pourquoi.</WaBubble>
        <WaButtons f={f} start={al + 10} labels={['Voir le détail', 'Plus tard']} />
        <WaBubble f={f} start={bi} time="Lun. 08:30"><b>👋 Ton bilan de la semaine est prêt</b><div style={{fontSize: 25, marginTop: 4, opacity: prog(f, bi + 8, 6)}}>Dépenses, résultats, meilleure pub et notre conseil.</div></WaBubble>
      </WaPhone>
    </AbsoluteFill>
  );
};
export const VraiFaux5: React.FC<{cfg: VFCfg}> = ({cfg}) => (
  <BriefShell cfg={cfg} comps={[<VFS1 key={0} cfg={cfg} />, <VFS2 key={1} cfg={cfg} />, <VFS3 key={2} cfg={cfg} />, <TouchScene key={3} words={cfg.scenes[3].words} />, <V5S5 key={4} words={cfg.scenes[4].words} />, <VFS6 key={5} ads={cfg.ads} />]} />
);
