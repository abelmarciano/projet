import React from 'react';
import {useCurrentFrame} from 'remotion';
import {Clip} from '../components/Media';
import {prog, pop} from '../components/anim';
import {C, DISPLAY, FONT, GRAD, GRAD_PINK} from '../theme';
import {CheckIcon} from './kit';

// Headline whose words fly in one after another. Words wrapped in *stars* get the gradient.
export const Title: React.FC<{text: string; start?: number; step?: number; size?: number; color?: string; grad?: string; style?: React.CSSProperties; align?: 'center' | 'left'}> = ({
  text,
  start = 0,
  step = 3,
  size = 96,
  color = '#fff',
  grad = GRAD_PINK,
  style,
  align = 'center',
}) => {
  const f = useCurrentFrame();
  const words = text.split(' ');
  return (
    <div style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: size, lineHeight: 1.04, color, textAlign: align, paddingLeft: align === 'left' ? 8 : 0, letterSpacing: '-0.01em', ...style}}>
      {words.map((w, i) => {
        const p = prog(f, start + i * step, 12);
        const hi = w.startsWith('*');
        const clean = w.replace(/\*/g, '');
        return (
          <span key={i} style={{display: 'inline-block', marginRight: '0.24em', opacity: p, transform: `translateY(${(1 - p) * 40}px) scale(${0.9 + 0.1 * p})`, filter: `blur(${(1 - p) * 6}px)`}}>
            <span style={hi ? {backgroundImage: grad, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent'} : undefined}>{clean}</span>
          </span>
        );
      })}
    </div>
  );
};

// Rounded media card (image or video) with a soft lift
export const Card: React.FC<{src: string; w: number; h: number; radius?: number; startFrom?: number; loop?: number; style?: React.CSSProperties; children?: React.ReactNode}> = ({src, w, h, radius = 28, startFrom, loop, style, children}) => (
  <div style={{position: 'absolute', width: w, height: h, borderRadius: radius, overflow: 'hidden', boxShadow: '0 40px 90px -36px rgba(15,10,40,0.75), 0 0 0 2px rgba(255,255,255,0.10)', background: '#111', ...style}}>
    <Clip src={src} width={w} height={h} startFrom={startFrom} loopFrames={loop} />
    {children}
  </div>
);

// Pill with a tick that pops on a given frame
export const Tick: React.FC<{at: number; children: React.ReactNode; size?: number; dark?: boolean; style?: React.CSSProperties}> = ({at, children, size = 28, dark = false, style}) => {
  const f = useCurrentFrame();
  const p = pop(f, at, 12);
  const done = f >= at + 4;
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 12,
        padding: `${size * 0.42}px ${size * 0.75}px ${size * 0.42}px ${size * 0.42}px`,
        borderRadius: 999,
        background: dark ? 'rgba(11,10,12,0.78)' : '#fff',
        color: dark ? '#fff' : C.ink,
        fontFamily: FONT,
        fontWeight: 700,
        fontSize: size,
        whiteSpace: 'nowrap',
        boxShadow: '0 18px 40px -16px rgba(15,23,42,0.55)',
        opacity: Math.min(1, p * 1.4),
        transform: `scale(${0.6 + 0.4 * p}) translateY(${(1 - p) * 20}px)`,
        ...style,
      }}
    >
      <span style={{width: size * 1.3, height: size * 1.3, borderRadius: size, background: done ? C.success : 'rgba(148,163,184,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        {done && <CheckIcon size={size * 0.85} />}
      </span>
      {children}
    </div>
  );
};

// Rotated sticker that slaps in
export const Sticker: React.FC<{at: number; children: React.ReactNode; rot?: number; bg?: string; size?: number; style?: React.CSSProperties}> = ({at, children, rot = -8, bg = GRAD, size = 40, style}) => {
  const f = useCurrentFrame();
  const p = pop(f, at, 10);
  if (f < at) return null;
  return (
    <div
      style={{
        position: 'absolute',
        padding: `${size * 0.35}px ${size * 0.6}px`,
        borderRadius: size * 0.45,
        background: bg,
        color: '#fff',
        fontFamily: DISPLAY,
        fontWeight: 700,
        fontSize: size,
        whiteSpace: 'nowrap',
        boxShadow: '0 20px 50px -18px rgba(0,0,0,0.7)',
        transform: `rotate(${rot}deg) scale(${2.2 - 1.2 * p})`,
        opacity: Math.min(1, p * 2),
        zIndex: 20,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// Little four-point glints twinkling around a point
export const Glints: React.FC<{x: number; y: number; spread?: number; n?: number; start?: number}> = ({x, y, spread = 220, n = 7, start = 0}) => {
  const f = useCurrentFrame();
  return (
    <>
      {Array.from({length: n}).map((_, i) => {
        const a = i * 2.4;
        const r = spread * (0.45 + ((i * 37) % 10) / 18);
        const t = (f - start - i * 5) / 22;
        const s = Math.max(0, Math.sin(t * Math.PI)) * (f > start ? 1 : 0);
        const size = 26 + (i % 3) * 12;
        return (
          <svg key={i} width={size} height={size} viewBox="0 0 24 24" style={{position: 'absolute', left: x + Math.cos(a) * r - size / 2, top: y + Math.sin(a) * r * 0.8 - size / 2, transform: `scale(${s}) rotate(${f * 2}deg)`, opacity: s, zIndex: 15}}>
            <path d="M12 0C13 8 16 11 24 12C16 13 13 16 12 24C11 16 8 13 0 12C8 11 11 8 12 0Z" fill="#FFF4D6" />
          </svg>
        );
      })}
    </>
  );
};
