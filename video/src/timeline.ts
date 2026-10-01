// Scene order and lengths (frames @30fps). Also read by scripts/soundtrack.py via timeline.json.
export const SCENES = [
  {id: 'Intro', duration: 135},
  {id: 'Problem', duration: 125},
  {id: 'Hero', duration: 240},
  {id: 'Chat', duration: 330},
  {id: 'Formats', duration: 185},
  {id: 'Actors', duration: 160},
  {id: 'Spy', duration: 190},
  {id: 'Publish', duration: 200},
  {id: 'Outro', duration: 210},
];

// TRANSITIONS[i] sits between SCENES[i] and SCENES[i + 1]
export const TRANSITIONS = [
  {kind: 'fade', duration: 18},
  {kind: 'fade', duration: 8},
  {kind: 'fade', duration: 16},
  {kind: 'wipe', duration: 20},
  {kind: 'slide-left', duration: 20},
  {kind: 'wipe', duration: 20},
  {kind: 'slide-up', duration: 20},
  {kind: 'fade', duration: 20},
];

export const TOTAL =
  SCENES.reduce((a, s) => a + s.duration, 0) - TRANSITIONS.reduce((a, t) => a + t.duration, 0);
