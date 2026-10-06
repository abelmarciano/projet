import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import {Background, SceneFade} from './components/UI';
import {S01Opening, S02Problem, S03Solution} from './scenes/Intro';
import {S04Stats, S05Table, S06Filters, S07Doublon, S08Fiche} from './scenes/Product';
import {S09Planning, S10Optimizer} from './scenes/Planning';
import {S11Compta, S12Api, S13Price, S14Close} from './scenes/Outro';

export const OVERLAP = 15; // fondu croisé de 0,5 s entre scènes

// Durées en images (30 i/s), dans l'ordre du storyboard
export const SCENES: {id: string; dur: number; el: (dur: number) => React.ReactNode; slide?: number}[] = [
  {id: '01-ouverture', dur: 120, el: () => <S01Opening />},
  {id: '02-probleme', dur: 150, el: (d) => <S02Problem dur={d} />},
  {id: '03-solution', dur: 135, el: () => <S03Solution />},
  {id: '04-statistiques', dur: 165, el: (d) => <S04Stats dur={d} />},
  {id: '05-tableau-leads', dur: 195, el: (d) => <S05Table dur={d} />, slide: 60},
  {id: '06-filtres', dur: 150, el: (d) => <S06Filters dur={d} />, slide: 60},
  {id: '07-doublons', dur: 150, el: (d) => <S07Doublon dur={d} />},
  {id: '08-fiche-lead', dur: 195, el: (d) => <S08Fiche dur={d} />, slide: 60},
  {id: '09-planning', dur: 210, el: (d) => <S09Planning dur={d} />},
  {id: '10-optimiseur', dur: 195, el: (d) => <S10Optimizer dur={d} />, slide: 60},
  {id: '11-comptabilite', dur: 165, el: (d) => <S11Compta dur={d} />},
  {id: '12-api-ia', dur: 165, el: () => <S12Api />},
  {id: '13-prix', dur: 180, el: () => <S13Price />},
  {id: '14-cloture', dur: 165, el: (d) => <S14Close dur={d} />},
];

export const starts = SCENES.reduce<number[]>((acc, s, i) => [...acc, i ? acc[i - 1] + SCENES[i - 1].dur - OVERLAP : 0], []);
export const TOTAL = starts[starts.length - 1] + SCENES[SCENES.length - 1].dur;

export const Promo: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: '#fff'}}>
    <Background />
    {SCENES.map((s, i) => (
      <Sequence key={s.id} name={s.id} from={starts[i]} durationInFrames={s.dur}>
        <SceneFade dur={s.dur} fadeIn={i ? OVERLAP : 10} fadeOut={i === SCENES.length - 1 ? 0 : OVERLAP} slide={s.slide}>
          {s.el(s.dur)}
        </SceneFade>
      </Sequence>
    ))}
  </AbsoluteFill>
);
