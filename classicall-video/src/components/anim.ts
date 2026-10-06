import {Easing, interpolate, spring} from 'remotion';

export const easeOut = Easing.bezier(0.22, 1, 0.36, 1);
export const easeInOut = Easing.bezier(0.65, 0, 0.35, 1);

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

export const prog = (frame: number, start: number, dur: number, ease = easeOut) =>
  interpolate(frame, [start, start + dur], [0, 1], {...clamp, easing: ease});

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Entrée standard : fondu + translation Y (16 px, 500 ms) */
export const fadeUp = (frame: number, start: number, dur = 15, dist = 16): React.CSSProperties => {
  const t = prog(frame, start, dur);
  return {opacity: t, transform: `translateY(${(1 - t) * dist}px)`};
};

export const pop = (frame: number, fps: number, delay = 0, damping = 18) =>
  spring({frame: frame - delay, fps, config: {damping, mass: 0.8, stiffness: 120}});

/** Zoom lent 1.0 → 1.06 sur la durée de la scène */
export const slowZoom = (frame: number, dur: number, from = 1, to = 1.06) =>
  interpolate(frame, [0, dur], [from, to], {...clamp, easing: easeInOut});

export const countUp = (frame: number, start: number, dur: number, to: number) =>
  to * prog(frame, start, dur, Easing.bezier(0.16, 1, 0.3, 1));
