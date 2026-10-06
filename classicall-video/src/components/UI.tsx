import React from 'react';
import {AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {Phone} from 'lucide-react';
import {C, FONT, GRADIENT, RADIUS, SHADOW} from '../theme';
import {fadeUp, prog} from './anim';

/* ---------- Fond : dégradé de l'app + halos très doux ---------- */
export const Background: React.FC = () => {
  const f = useCurrentFrame();
  const blobs = [
    {x: 260, y: 180, r: 520, c: 'rgba(14,165,233,0.10)', sx: 0.011, sy: 0.007},
    {x: 1650, y: 900, r: 620, c: 'rgba(211,228,253,0.85)', sx: 0.008, sy: 0.012},
    {x: 1500, y: 160, r: 380, c: 'rgba(14,165,233,0.06)', sx: 0.013, sy: 0.009},
  ];
  return (
    <AbsoluteFill style={{background: GRADIENT}}>
      {blobs.map((b, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: b.x + Math.sin(f * b.sx + i) * 60 - b.r,
            top: b.y + Math.cos(f * b.sy + i * 2) * 50 - b.r,
            width: b.r * 2,
            height: b.r * 2,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${b.c} 0%, rgba(255,255,255,0) 70%)`,
          }}
        />
      ))}
    </AbsoluteFill>
  );
};

/* ---------- Fondu d'entrée / sortie de scène ---------- */
export const SceneFade: React.FC<{dur: number; fadeIn?: number; fadeOut?: number; slide?: number; children: React.ReactNode}> = ({
  dur,
  fadeIn = 15,
  fadeOut = 15,
  slide = 0,
  children,
}) => {
  const f = useCurrentFrame();
  const a = fadeIn ? prog(f, 0, fadeIn) : 1;
  const b = fadeOut ? 1 - prog(f, dur - fadeOut, fadeOut) : 1;
  return (
    <AbsoluteFill style={{opacity: Math.min(a, b), transform: slide ? `translateX(${(1 - a) * slide}px)` : undefined}}>
      {children}
    </AbsoluteFill>
  );
};

/* ---------- Texte à l'écran (max 6 mots / ligne). **mot** = accent bleu océan ---------- */
const renderLine = (line: string, accent: string) =>
  line.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith('**') ? (
      <span key={i} style={{color: accent}}>
        {part.slice(2, -2)}
      </span>
    ) : (
      <span key={i}>{part}</span>
    ),
  );

export const Caption: React.FC<{
  lines: string[];
  start?: number;
  size?: number;
  align?: 'left' | 'center';
  color?: string;
  accent?: string;
  style?: React.CSSProperties;
  stagger?: number;
}> = ({lines, start = 0, size = 68, align = 'center', color = C.navy, accent = C.ocean, style, stagger = 5}) => {
  const f = useCurrentFrame();
  for (const l of lines) {
    const n = l.replace(/\*\*/g, '').trim().split(/\s+/).length;
    if (n > 6) throw new Error(`Plus de 6 mots sur une ligne : « ${l} »`);
  }
  return (
    <div style={{fontFamily: FONT, fontWeight: 700, fontSize: size, lineHeight: 1.12, color, textAlign: align, letterSpacing: -0.5, ...style}}>
      {lines.map((l, i) => (
        <div key={i} style={fadeUp(f, start + i * stagger, 15, 18)}>
          {renderLine(l, accent)}
        </div>
      ))}
    </div>
  );
};

/* ---------- Découpe d'une capture (coordonnées CSS 1920×1080, image @2x) ---------- */
export type Rect = {x: number; y: number; w: number; h: number};
export const Shot: React.FC<{src: string; crop: Rect; width: number; style?: React.CSSProperties; imgStyle?: React.CSSProperties}> = ({
  src,
  crop,
  width,
  style,
  imgStyle,
}) => {
  const s = width / crop.w;
  return (
    <div style={{position: 'relative', width, height: crop.h * s, overflow: 'hidden', ...style}}>
      <Img
        src={staticFile(`screenshots/${src}`)}
        style={{position: 'absolute', left: -crop.x * s, top: -crop.y * s, width: 1920 * s, height: 1080 * s, maxWidth: 'none', ...imgStyle}}
      />
    </div>
  );
};

export const Derived: React.FC<{src: string; crop: Rect; width: number; style?: React.CSSProperties}> = ({src, crop, width, style}) => {
  const s = width / crop.w;
  return (
    <div style={{position: 'relative', width, height: crop.h * s, overflow: 'hidden', ...style}}>
      <Img src={staticFile(`derived/${src}`)} style={{position: 'absolute', left: -crop.x * s, top: -crop.y * s, width: 1920 * s, height: 1080 * s, maxWidth: 'none'}} />
    </div>
  );
};

/* ---------- Carte blanche qui encadre une capture ---------- */
export const ScreenCard: React.FC<{style?: React.CSSProperties; pad?: number; zoom?: number; origin?: string; children: React.ReactNode}> = ({
  style,
  pad = 10,
  zoom = 1,
  origin = '50% 50%',
  children,
}) => (
  <div
    style={{
      position: 'absolute',
      background: '#fff',
      borderRadius: RADIUS,
      padding: pad,
      boxShadow: SHADOW,
      ...style,
      transform: `${style?.transform ?? ''} scale(${zoom})`,
      transformOrigin: origin,
    }}
  >
    <div style={{borderRadius: RADIUS - 4, overflow: 'hidden', position: 'relative'}}>{children}</div>
  </div>
);

/* ---------- Logo Classicall ---------- */
export const Logo: React.FC<{size?: number; style?: React.CSSProperties}> = ({size = 110, style}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: size * 0.28, ...style}}>
    <div
      style={{
        width: size * 1.12,
        height: size * 1.12,
        borderRadius: RADIUS * (size / 60),
        background: C.ocean,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 14px 36px rgba(14,165,233,0.35)',
      }}
    >
      <Phone color="#fff" size={size * 0.58} strokeWidth={2.2} />
    </div>
    <div style={{fontFamily: FONT, fontWeight: 700, fontSize: size, color: C.navy, letterSpacing: -1.5, lineHeight: 1}}>Classicall</div>
  </div>
);

/* ---------- Petit badge / pastille dans le style de l'app ---------- */
export const Chip: React.FC<{active: number; label: string; icon?: React.ReactNode}> = ({active, label, icon}) => {
  const bg = `rgba(14,165,233,${interpolate(active, [0, 1], [0, 1])})`;
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 10,
        padding: '10px 20px',
        borderRadius: RADIUS,
        background: active > 0.01 ? bg : '#fff',
        color: active > 0.5 ? '#fff' : C.ink,
        fontFamily: FONT,
        fontWeight: 600,
        fontSize: 28,
        boxShadow: '0 4px 14px rgba(0,47,121,0.08)',
        border: `1.5px solid ${active > 0.5 ? C.ocean : 'rgba(14,165,233,0.25)'}`,
      }}
    >
      {icon}
      {label}
    </div>
  );
};
