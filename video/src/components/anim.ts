import {Easing, interpolate, spring} from 'remotion';
import {FPS} from '../theme';

export const EXPO = Easing.bezier(0.16, 1, 0.3, 1);
export const INOUT = Easing.bezier(0.65, 0, 0.35, 1);

// 0 → 1 progress between two frames, eased
export const prog = (frame: number, start: number, dur: number, ease = EXPO) =>
  interpolate(frame, [start, start + dur], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: ease,
  });

export const pop = (frame: number, start: number, damping = 14) =>
  spring({frame: frame - start, fps: FPS, config: {damping, mass: 0.8, stiffness: 140}});

export const mix = (a: number, b: number, t: number) => a + (b - a) * t;

// Typewriter: how many chars visible
export const typed = (text: string, frame: number, start: number, cps = 32) =>
  text.slice(0, Math.max(0, Math.floor(((frame - start) / FPS) * cps)));
