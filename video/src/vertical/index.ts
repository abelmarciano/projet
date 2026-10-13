import React from 'react';
import {HeroV} from './Hero';
import {ChatV} from './Chat';
import {ActorsV} from './Actors';
import {FormatsV} from './Formats';
import {SpyV} from './Spy';
import {PublishV} from './Publish';
import {ProblemV} from './Problem';
import {OutroV} from './Outro';

export const VERTICAL: Record<string, React.FC> = {
  Hero: HeroV,
  Chat: ChatV,
  Actors: ActorsV,
  Formats: FormatsV,
  Spy: SpyV,
  Publish: PublishV,
  Problem: ProblemV,
  Outro: OutroV,
};
