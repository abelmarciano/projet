// Scene order and lengths (frames @30fps) live in timeline.json, shared with scripts/soundtrack.py.
import data from './timeline.json';

export const SCENES = data.scenes;
// TRANSITIONS[i] sits between SCENES[i] and SCENES[i + 1]
export const TRANSITIONS = data.transitions;

export const TOTAL =
  SCENES.reduce((a, s) => a + s.duration, 0) - TRANSITIONS.reduce((a, t) => a + t.duration, 0);

// Absolute start frame of a scene, accounting for transition overlaps
export const sceneStart = (id: string) => {
  let t = 0;
  for (let i = 0; i < SCENES.length; i++) {
    if (SCENES[i].id === id) return t;
    t += SCENES[i].duration - (TRANSITIONS[i]?.duration ?? 0);
  }
  return t;
};
