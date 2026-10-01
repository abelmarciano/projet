import React from 'react';
import {C, DISPLAY, FONT, GRAD, SHADOW_EDITORIAL} from '../theme';

// Lucide "trending-up", the growthity.ai mark
export const LogoMark: React.FC<{size?: number; draw?: number; color?: string}> = ({
  size = 64,
  draw = 1,
  color,
}) => {
  const id = React.useId().replace(/:/g, '');
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <defs>
        <linearGradient id={id} x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor={C.blue} />
          <stop offset="0.52" stopColor={C.indigo} />
          <stop offset="1" stopColor={C.purple} />
        </linearGradient>
      </defs>
      <path
        d="M2 17 L8.5 10.5 L13.5 15.5 L22 7"
        stroke={color ?? `url(#${id})`}
        strokeWidth={2.4}
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={1 - draw}
      />
      <path
        d="M16 7 L22 7 L22 13"
        stroke={color ?? `url(#${id})`}
        strokeWidth={2.4}
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={1 - Math.max(0, draw * 2 - 1)}
      />
    </svg>
  );
};

export const Wordmark: React.FC<{size?: number; dark?: boolean; reveal?: number}> = ({
  size = 56,
  dark = false,
  reveal = 1,
}) => {
  const text = 'growthity';
  const n = Math.round(text.length * reveal);
  return (
    <div
      style={{
        fontFamily: DISPLAY,
        fontWeight: 600,
        fontSize: size,
        letterSpacing: '-0.01em',
        color: dark ? '#FFFFFF' : C.ink,
        display: 'flex',
        alignItems: 'baseline',
      }}
    >
      {text.split('').map((ch, i) => (
        <span
          key={i}
          style={{
            opacity: i < n ? 1 : 0,
            transform: `translateY(${i < n ? 0 : size * 0.3}px)`,
            display: 'inline-block',
          }}
        >
          {ch}
        </span>
      ))}
      <span
        style={{
          backgroundImage: GRAD,
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          color: 'transparent',
          opacity: reveal >= 1 ? 1 : 0,
        }}
      >
        .ai
      </span>
    </div>
  );
};

export const Badge: React.FC<{
  children: React.ReactNode;
  tone?: 'neutral' | 'success' | 'warning' | 'primary' | 'meta';
  style?: React.CSSProperties;
}> = ({children, tone = 'neutral', style}) => {
  const tones = {
    neutral: {bg: C.mist, fg: C.slate},
    success: {bg: C.successBg, fg: '#13824F'},
    warning: {bg: '#FDF3DC', fg: '#8A5A00'},
    primary: {bg: '#EEEBFF', fg: C.primary},
    meta: {bg: '#E6F0FF', fg: C.meta},
  }[tone];
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        height: 34,
        padding: '0 14px',
        borderRadius: 999,
        background: tones.bg,
        color: tones.fg,
        fontFamily: FONT,
        fontSize: 17,
        fontWeight: 600,
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      {children}
    </span>
  );
};

export const GradButton: React.FC<{children: React.ReactNode; scale?: number; style?: React.CSSProperties}> = ({
  children,
  scale = 1,
  style,
}) => (
  <div
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 14,
      padding: '0 34px',
      height: 72,
      borderRadius: 999,
      backgroundImage: GRAD,
      color: '#fff',
      fontFamily: FONT,
      fontWeight: 600,
      fontSize: 26,
      transform: `scale(${scale})`,
      boxShadow: '0 1px 0 0 rgba(255,255,255,0.18) inset, 0 20px 50px -18px rgba(91,63,228,0.75)',
      ...style,
    }}
  >
    {children}
  </div>
);

export const Card: React.FC<{children: React.ReactNode; style?: React.CSSProperties}> = ({children, style}) => (
  <div
    style={{
      background: '#fff',
      border: `1px solid ${C.hairline}`,
      borderRadius: 20,
      boxShadow: SHADOW_EDITORIAL,
      fontFamily: FONT,
      color: C.ink,
      ...style,
    }}
  >
    {children}
  </div>
);

export const BrowserFrame: React.FC<{
  title: string;
  width: number;
  height: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({title, width, height, children, style}) => (
  <div
    style={{
      width,
      height,
      borderRadius: 26,
      background: '#fff',
      border: `1px solid ${C.hairline}`,
      boxShadow: '0 50px 120px -40px rgba(37,99,235,0.35), 0 20px 40px -25px rgba(15,23,42,0.3)',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      ...style,
    }}
  >
    <div
      style={{
        height: 56,
        borderBottom: `1px solid ${C.hairline}`,
        background: '#FAFBFD',
        display: 'flex',
        alignItems: 'center',
        padding: '0 22px',
        position: 'relative',
        flexShrink: 0,
      }}
    >
      {['#FF5F57', '#FEBC2E', '#28C840'].map((c) => (
        <div key={c} style={{width: 14, height: 14, borderRadius: 7, background: c, marginRight: 9}} />
      ))}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          textAlign: 'center',
          fontFamily: FONT,
          fontSize: 17,
          fontWeight: 500,
          color: C.slate,
        }}
      >
        {title}
      </div>
    </div>
    <div style={{flex: 1, position: 'relative', overflow: 'hidden'}}>{children}</div>
  </div>
);

// Section kicker: "01 · Décrivez votre produit"
export const Kicker: React.FC<{n: string; label: string; dark?: boolean; opacity?: number; y?: number}> = ({
  n,
  label,
  dark,
  opacity = 1,
  y = 0,
}) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      fontFamily: FONT,
      fontWeight: 600,
      fontSize: 20,
      letterSpacing: '0.22em',
      textTransform: 'uppercase',
      color: dark ? 'rgba(255,255,255,0.7)' : C.slate,
      opacity,
      transform: `translateY(${y}px)`,
    }}
  >
    <span
      style={{
        backgroundImage: GRAD,
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        color: 'transparent',
      }}
    >
      {n}
    </span>
    <span style={{width: 40, height: 2, background: dark ? 'rgba(255,255,255,0.3)' : C.hairline}} />
    {label}
  </div>
);

export const Cursor: React.FC<{x: number; y: number; press?: number}> = ({x, y, press = 0}) => (
  <div style={{position: 'absolute', left: x, top: y, transform: `scale(${1 - press * 0.15})`, zIndex: 50}}>
    <svg width="38" height="38" viewBox="0 0 24 24">
      <path
        d="M4 3 L19 11.5 L12.5 13 L9.5 19.5 Z"
        fill={C.ink}
        stroke="#fff"
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
    </svg>
    {press > 0 && (
      <div
        style={{
          position: 'absolute',
          left: -22,
          top: -22,
          width: 50,
          height: 50,
          borderRadius: 25,
          border: `3px solid ${C.primary}`,
          opacity: 1 - press,
          transform: `scale(${0.4 + press * 1.4})`,
        }}
      />
    )}
  </div>
);

export const Check: React.FC<{size?: number; color?: string}> = ({size = 22, color = '#fff'}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M5 12.5 L10 17.5 L19 7" stroke={color} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const Sparkle: React.FC<{size?: number; color?: string}> = ({size = 22, color = '#fff'}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M12 2 L13.8 9.2 L21 11 L13.8 12.8 L12 20 L10.2 12.8 L3 11 L10.2 9.2 Z" />
    <path d="M19 15 L19.7 17.3 L22 18 L19.7 18.7 L19 21 L18.3 18.7 L16 18 L18.3 17.3 Z" />
  </svg>
);

export const MetaLogo: React.FC<{size?: number}> = ({size = 28}) => (
  <svg width={size * 1.6} height={size} viewBox="0 0 48 30" fill="none">
    <path
      d="M6 22 C6 12 10 5 15 5 C20 5 24 13 27 18 C30 23 32 25 35 25 C39 25 42 21 42 15 C42 9 39 5 35 5 C30 5 26 13 23 18 C20 23 18 25 14 25 C9 25 6 22 6 22 Z"
      stroke={C.meta}
      strokeWidth={4}
      strokeLinecap="round"
      fill="none"
    />
  </svg>
);
