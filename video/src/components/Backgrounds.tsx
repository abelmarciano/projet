import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {C} from '../theme';

const Orb: React.FC<{x: number; y: number; size: number; color: string; opacity: number}> = ({
  x,
  y,
  size,
  color,
  opacity,
}) => (
  <div
    style={{
      position: 'absolute',
      left: x - size / 2,
      top: y - size / 2,
      width: size,
      height: size,
      borderRadius: '50%',
      background: `radial-gradient(circle, ${color} 0%, transparent 65%)`,
      opacity,
      filter: 'blur(20px)',
    }}
  />
);

const DotGrid: React.FC<{color: string; opacity: number; drift?: number}> = ({color, opacity, drift = 0}) => (
  <AbsoluteFill
    style={{
      backgroundImage: `radial-gradient(${color} 1.2px, transparent 1.2px)`,
      backgroundSize: '28px 28px',
      backgroundPosition: `${drift}px ${drift * 0.5}px`,
      opacity,
      maskImage: 'radial-gradient(ellipse 70% 60% at 50% 45%, black 20%, transparent 80%)',
      WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 50% 45%, black 20%, transparent 80%)',
    }}
  />
);

export const StudioBg: React.FC<{children?: React.ReactNode; intensity?: number}> = ({
  children,
  intensity = 1,
}) => {
  const f = useCurrentFrame();
  const t = f / 30;
  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(180deg, #0E0B14 0%, ${C.studio} 50%, #0A0810 100%)`,
        overflow: 'hidden',
      }}
    >
      <Orb x={300 + Math.sin(t * 0.5) * 120} y={180 + Math.cos(t * 0.4) * 80} size={1100} color={C.indigo} opacity={0.45 * intensity} />
      <Orb x={1650 + Math.cos(t * 0.45) * 140} y={900 + Math.sin(t * 0.35) * 90} size={1000} color={C.pink} opacity={0.22 * intensity} />
      <Orb x={1100 + Math.sin(t * 0.3) * 200} y={540} size={800} color={C.blue} opacity={0.18 * intensity} />
      <DotGrid color="rgba(255,255,255,0.5)" opacity={0.12} drift={t * 6} />
      {children}
    </AbsoluteFill>
  );
};

export const LightBg: React.FC<{children?: React.ReactNode}> = ({children}) => {
  const f = useCurrentFrame();
  const t = f / 30;
  return (
    <AbsoluteFill style={{background: '#FFFFFF', overflow: 'hidden'}}>
      <AbsoluteFill style={{background: 'linear-gradient(180deg, #FFFFFF 0%, #F4F5FB 100%)'}} />
      <Orb x={960 + Math.sin(t * 0.4) * 60} y={240} size={1300} color="rgba(101,82,232,0.28)" opacity={1} />
      <Orb x={1500 + Math.cos(t * 0.3) * 80} y={850} size={900} color="rgba(224,71,158,0.12)" opacity={1} />
      <DotGrid color="rgba(15,23,42,0.35)" opacity={0.35} drift={t * 4} />
      {children}
    </AbsoluteFill>
  );
};
