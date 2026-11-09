import cfg from './config.json';
import s1 from './data/s1_vo.json';
import s2 from './data/s2_vo.json';
import s3 from './data/s3_vo.json';
import s4 from './data/s4_vo.json';
import s5 from './data/s5_vo.json';

export type Word = {w: string; s: number; e: number};
export type VOBeat = {text: string; audio: string | null; dur: number; words: Word[]};
export type ShortId = 's1' | 's2' | 's3' | 's4' | 's5';
const VO: Record<ShortId, {beats: VOBeat[]}> = {s1, s2, s3, s4, s5} as never;

export const GAP = cfg.gap;
export const LEAD = cfg.lead;

// A line = one voice take. Its length = speech + gap + per-line extra hold.
export type Line = {start: number; frames: number; speech: number; words: {w: string; f: number; e: number}[]; text: string};

export const lines = (id: ShortId): Line[] => {
  const conf = cfg.shorts[id];
  const beats = VO[id].beats;
  let t = 0;
  return beats.map((b, i) => {
    const speech = Math.ceil(b.dur * 30);
    let frames = LEAD + speech + GAP + (conf.extra[i] ?? 0);
    if (i === beats.length - 1) frames = Math.max(frames, cfg.endMin);
    const line = {
      start: t,
      frames,
      speech: t + LEAD,
      text: b.text,
      words: b.words.map((w) => ({w: w.w, f: t + LEAD + Math.round(w.s * 30), e: t + LEAD + Math.round(w.e * 30)})),
    };
    t += frames;
    return line;
  });
};

export const totalFrames = (id: ShortId) => lines(id).reduce((a, l) => a + l.frames, 0);

// Scenes group consecutive lines; scene components get frames relative to their own start
export type SceneLine = {start: number; frames: number; words: {w: string; f: number; e: number}[]};
export type SceneProps = {dur: number; lines: SceneLine[]};

export const scenes = (id: ShortId) => {
  const ls = lines(id);
  return cfg.shorts[id].scenes.map((idx) => {
    const s0 = ls[idx[0]].start;
    const dur = idx.reduce((a, i) => a + ls[i].frames, 0);
    const sl = idx.map((i) => ({
      start: ls[i].start - s0,
      frames: ls[i].frames,
      words: ls[i].words.map((w) => ({...w, f: w.f - s0, e: w.e - s0})),
    }));
    return {start: s0, dur, lines: sl, idx};
  });
};

export const SHORT_IDS: ShortId[] = ['s1', 's2', 's3', 's4', 's5'];
export const shortConf = (id: ShortId) => cfg.shorts[id];
export const voBeats = (id: ShortId) => VO[id].beats;

// frame at which a word (case/punctuation-insensitive prefix) is spoken in a scene line
export const wordAt = (l: SceneLine, needle: string, fallback = 0) => {
  const n = needle.toLowerCase();
  const hit = l.words.find((w) => w.w.toLowerCase().replace(/[^\p{L}\p{N}'’]/gu, '').startsWith(n));
  return hit ? hit.f : l.start + fallback;
};
