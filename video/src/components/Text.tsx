import React from 'react';
import {useCurrentFrame} from 'remotion';
import {GRAD_PINK, GRAD} from '../theme';
import {prog} from './anim';

export type Word = {t: string; grad?: 'pink' | 'brand'; br?: boolean};

// Words rise in one by one, masked, with a short blur
export const WordsReveal: React.FC<{
  words: Word[];
  start: number;
  stagger?: number;
  style?: React.CSSProperties;
  out?: number; // frame at which words leave
}> = ({words, start, stagger = 3, style, out}) => {
  const f = useCurrentFrame();
  return (
    <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', ...style}}>
      {words.map((w, i) => {
        const p = prog(f, start + i * stagger, 22);
        const o = out !== undefined ? prog(f, out + i * 1.5, 14) : 0;
        const gradStyle: React.CSSProperties = w.grad
          ? {
              backgroundImage: w.grad === 'pink' ? GRAD_PINK : GRAD,
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
            }
          : {};
        return (
          <React.Fragment key={i}>
            <span style={{overflow: 'hidden', display: 'inline-block', padding: '0.06em 0 0.12em', marginBottom: '-0.12em'}}>
              <span
                style={{
                  display: 'inline-block',
                  transform: `translateY(${(1 - p) * 105 - o * 105}%)`,
                  opacity: p * (1 - o),
                  filter: `blur(${(1 - p) * 8}px)`,
                  marginRight: '0.26em',
                  ...gradStyle,
                }}
              >
                {w.t}
              </span>
            </span>
            {w.br && <span style={{flexBasis: '100%', height: 0}} />}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export const words = (s: string): Word[] => s.split(' ').map((t) => ({t}));
