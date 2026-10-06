import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile} from 'remotion';
import timing from './data/timing.json';
import {Background, SceneFade} from './components/UI';
import {S01Opening, S02Problem, S03Solution} from './scenes/Intro';
import {S04Stats, S05Table, S06Filters, S07Doublon, S08Fiche} from './scenes/Product';
import {S09Planning, S10Optimizer} from './scenes/Planning';
import {S11Compta, S12Api, S13Price, S14Close} from './scenes/Outro';

export const OVERLAP = timing.overlap; // fondu croisé de 0,5 s entre scènes

// Durées en images (30 i/s) : calées sur la voix off (src/data/timing.json, écrit par scripts/voiceover.py)
const D = (id: string) => timing.scenes.find((x) => x.id === id)!.dur;

export const SCENES: {id: string; dur: number; el: (dur: number) => React.ReactNode; slide?: number}[] = [
  {id: '01-ouverture', dur: D('01-ouverture'), el: () => <S01Opening />},
  {id: '02-probleme', dur: D('02-probleme'), el: (d) => <S02Problem dur={d} />},
  {id: '03-solution', dur: D('03-solution'), el: () => <S03Solution />},
  {id: '04-statistiques', dur: D('04-statistiques'), el: (d) => <S04Stats dur={d} />},
  {id: '05-tableau-leads', dur: D('05-tableau-leads'), el: (d) => <S05Table dur={d} />, slide: 60},
  {id: '06-filtres', dur: D('06-filtres'), el: (d) => <S06Filters dur={d} />, slide: 60},
  {id: '07-doublons', dur: D('07-doublons'), el: (d) => <S07Doublon dur={d} />},
  {id: '08-fiche-lead', dur: D('08-fiche-lead'), el: (d) => <S08Fiche dur={d} />, slide: 60},
  {id: '09-planning', dur: D('09-planning'), el: (d) => <S09Planning dur={d} />},
  {id: '10-optimiseur', dur: D('10-optimiseur'), el: (d) => <S10Optimizer dur={d} />, slide: 60},
  {id: '11-comptabilite', dur: D('11-comptabilite'), el: (d) => <S11Compta dur={d} />},
  {id: '12-api-ia', dur: D('12-api-ia'), el: () => <S12Api />},
  {id: '13-prix', dur: D('13-prix'), el: () => <S13Price />},
  {id: '14-cloture', dur: D('14-cloture'), el: (d) => <S14Close dur={d} />},
];

export const starts = SCENES.reduce<number[]>((acc, s, i) => [...acc, i ? acc[i - 1] + SCENES[i - 1].dur - OVERLAP : 0], []);
export const TOTAL = starts[starts.length - 1] + SCENES[SCENES.length - 1].dur;

export const Promo: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: '#fff'}}>
    <Background />
    <Audio src={staticFile('bande-son.wav')} />
    {SCENES.map((s, i) => (
      <Sequence key={s.id} name={s.id} from={starts[i]} durationInFrames={s.dur}>
        <SceneFade dur={s.dur} fadeIn={i ? OVERLAP : 10} fadeOut={i === SCENES.length - 1 ? 0 : OVERLAP} slide={s.slide}>
          {s.el(s.dur)}
        </SceneFade>
      </Sequence>
    ))}
  </AbsoluteFill>
);
