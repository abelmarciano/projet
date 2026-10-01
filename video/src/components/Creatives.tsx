import React from 'react';
import {useCurrentFrame} from 'remotion';
import {DISPLAY, FONT} from '../theme';

export type CreativeKind = 'serum' | 'perfume' | 'can' | 'candle';

const BACKDROPS: Record<CreativeKind, string> = {
  serum: 'radial-gradient(circle at 30% 25%, #FFE2B8 0%, #FFB36B 45%, #F07B3F 100%)',
  perfume: 'radial-gradient(circle at 70% 20%, #FCE3F0 0%, #E7A3C7 45%, #9B4F86 100%)',
  can: 'radial-gradient(circle at 40% 20%, #C9FFF0 0%, #3ED2B0 45%, #0B7F7A 100%)',
  candle: 'radial-gradient(circle at 50% 30%, #3B4A7A 0%, #1E2546 55%, #0F1328 100%)',
};

const Serum: React.FC = () => (
  <svg viewBox="0 0 200 300" width="100%" height="100%">
    <defs>
      <linearGradient id="glass" x1="0" x2="1">
        <stop offset="0" stopColor="#B85A12" />
        <stop offset="0.35" stopColor="#F2A24A" />
        <stop offset="0.6" stopColor="#D67420" />
        <stop offset="1" stopColor="#8E3F08" />
      </linearGradient>
      <linearGradient id="cap" x1="0" x2="1">
        <stop offset="0" stopColor="#1A1A1A" />
        <stop offset="0.4" stopColor="#4A4A4A" />
        <stop offset="1" stopColor="#111" />
      </linearGradient>
    </defs>
    {/* orange slices */}
    {[
      [38, 236, 30],
      [168, 250, 24],
    ].map(([x, y, r], i) => (
      <g key={i} opacity={0.95}>
        <circle cx={x} cy={y} r={r} fill="#FFD27A" stroke="#FFF3D6" strokeWidth={3} />
        {[0, 1, 2, 3, 4, 5, 6, 7].map((k) => (
          <line
            key={k}
            x1={x}
            y1={y}
            x2={x + Math.cos((k * Math.PI) / 4) * r * 0.85}
            y2={y + Math.sin((k * Math.PI) / 4) * r * 0.85}
            stroke="#FFF3D6"
            strokeWidth={2}
          />
        ))}
      </g>
    ))}
    <ellipse cx="100" cy="276" rx="52" ry="8" fill="rgba(0,0,0,0.18)" />
    <path d="M86 40 Q86 18 100 18 Q114 18 114 40 L114 62 L86 62 Z" fill="url(#cap)" />
    <rect x="78" y="60" width="44" height="34" rx="6" fill="url(#cap)" />
    <rect x="58" y="92" width="84" height="182" rx="22" fill="url(#glass)" />
    <rect x="66" y="100" width="10" height="160" rx="5" fill="rgba(255,255,255,0.35)" />
    <rect x="68" y="150" width="64" height="76" rx="6" fill="#FFF8EE" />
    <text x="100" y="178" textAnchor="middle" fontFamily="Space Grotesk" fontWeight={700} fontSize="15" fill="#2B1607">
      VITAMIN
    </text>
    <text x="100" y="204" textAnchor="middle" fontFamily="Space Grotesk" fontWeight={700} fontSize="26" fill="#E0731F">
      C 20%
    </text>
    <text x="100" y="218" textAnchor="middle" fontFamily="Inter" fontSize="8" fill="#6B4A2B">
      SÉRUM ÉCLAT
    </text>
  </svg>
);

const Perfume: React.FC = () => (
  <svg viewBox="0 0 200 300" width="100%" height="100%">
    <defs>
      <linearGradient id="pglass" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0" stopColor="rgba(255,255,255,0.85)" />
        <stop offset="0.5" stopColor="rgba(255,214,234,0.55)" />
        <stop offset="1" stopColor="rgba(190,90,150,0.7)" />
      </linearGradient>
      <linearGradient id="gold" x1="0" x2="1">
        <stop offset="0" stopColor="#8C6A2B" />
        <stop offset="0.5" stopColor="#F3D58A" />
        <stop offset="1" stopColor="#9C7630" />
      </linearGradient>
    </defs>
    <ellipse cx="100" cy="270" rx="64" ry="9" fill="rgba(0,0,0,0.2)" />
    <rect x="80" y="54" width="40" height="46" rx="4" fill="url(#gold)" />
    <rect x="90" y="98" width="20" height="14" fill="url(#gold)" />
    <rect x="42" y="110" width="116" height="158" rx="14" fill="url(#pglass)" stroke="rgba(255,255,255,0.8)" strokeWidth={3} />
    <rect x="52" y="140" width="96" height="118" rx="8" fill="rgba(200,90,150,0.35)" />
    <rect x="54" y="118" width="12" height="140" rx="6" fill="rgba(255,255,255,0.6)" />
    <text x="100" y="200" textAnchor="middle" fontFamily="Space Grotesk" fontWeight={600} fontSize="20" letterSpacing="4" fill="#fff">
      ÉLAN
    </text>
    <text x="100" y="218" textAnchor="middle" fontFamily="Inter" fontSize="8" letterSpacing="3" fill="#fff">
      EAU DE PARFUM
    </text>
  </svg>
);

const Can: React.FC = () => (
  <svg viewBox="0 0 200 300" width="100%" height="100%">
    <defs>
      <linearGradient id="can" x1="0" x2="1">
        <stop offset="0" stopColor="#3A1C71" />
        <stop offset="0.3" stopColor="#7B4AE2" />
        <stop offset="0.55" stopColor="#B486FF" />
        <stop offset="1" stopColor="#3A1C71" />
      </linearGradient>
      <linearGradient id="alu" x1="0" x2="1">
        <stop offset="0" stopColor="#8E96A3" />
        <stop offset="0.5" stopColor="#F2F4F7" />
        <stop offset="1" stopColor="#7A818D" />
      </linearGradient>
    </defs>
    {[
      [30, 80, 10],
      [170, 60, 14],
      [160, 200, 8],
      [36, 210, 12],
      [150, 120, 6],
    ].map(([x, y, r], i) => (
      <circle key={i} cx={x} cy={y} r={r} fill="rgba(255,255,255,0.55)" />
    ))}
    <ellipse cx="100" cy="276" rx="50" ry="8" fill="rgba(0,0,0,0.2)" />
    <path d="M58 52 Q58 40 70 38 L130 38 Q142 40 142 52 Z" fill="url(#alu)" />
    <rect x="56" y="50" width="88" height="220" rx="12" fill="url(#can)" />
    <rect x="56" y="256" width="88" height="16" rx="8" fill="url(#alu)" />
    <rect x="68" y="60" width="10" height="190" rx="5" fill="rgba(255,255,255,0.3)" />
    <text x="100" y="150" textAnchor="middle" fontFamily="Space Grotesk" fontWeight={700} fontSize="30" fill="#fff">
      PEPS
    </text>
    <text x="100" y="172" textAnchor="middle" fontFamily="Inter" fontWeight={600} fontSize="10" letterSpacing="2" fill="#E8DDFF">
      YUZU · MENTHE
    </text>
  </svg>
);

const Candle: React.FC<{t: number}> = ({t}) => {
  const flick = 1 + Math.sin(t * 9) * 0.06 + Math.sin(t * 23) * 0.03;
  return (
    <svg viewBox="0 0 200 300" width="100%" height="100%">
      <defs>
        <radialGradient id="glow">
          <stop offset="0" stopColor="rgba(255,190,90,0.75)" />
          <stop offset="1" stopColor="rgba(255,190,90,0)" />
        </radialGradient>
        <linearGradient id="jar" x1="0" x2="1">
          <stop offset="0" stopColor="#D9CDB8" />
          <stop offset="0.45" stopColor="#FFF8EA" />
          <stop offset="1" stopColor="#BFAF94" />
        </linearGradient>
      </defs>
      <circle cx="100" cy="120" r={95 * flick} fill="url(#glow)" />
      <rect x="20" y="236" width="160" height="40" rx="6" fill="#5A3B26" />
      <ellipse cx="100" cy="236" rx="80" ry="6" fill="#7A5236" />
      <rect x="54" y="140" width="92" height="96" rx="10" fill="url(#jar)" />
      <ellipse cx="100" cy="142" rx="46" ry="8" fill="#F3E6CC" />
      <line x1="100" y1="142" x2="100" y2="126" stroke="#2B2B2B" strokeWidth={2.5} />
      <path
        d={`M100 ${92 - 6 * flick} Q${110} 112 100 126 Q${90} 112 100 ${92 - 6 * flick} Z`}
        fill="#FFC75A"
      />
      <path d="M100 106 Q104 116 100 124 Q96 116 100 106 Z" fill="#FFF3C4" />
      <text x="100" y="196" textAnchor="middle" fontFamily="Space Grotesk" fontWeight={600} fontSize="12" letterSpacing="3" fill="#6B5A44">
        AMBRE
      </text>
    </svg>
  );
};

export const Creative: React.FC<{
  kind: CreativeKind;
  width: number;
  height: number;
  radius?: number;
  headline?: string;
  cta?: string;
  play?: boolean;
  style?: React.CSSProperties;
}> = ({kind, width, height, radius = 22, headline, cta, play, style}) => {
  const f = useCurrentFrame();
  const t = f / 30;
  const float = Math.sin(t * 1.4 + kind.length) * 6;
  const sweep = ((t * 0.35 + kind.length * 0.1) % 1.6) - 0.3;
  const productH = Math.min(height * 0.72, width * 1.2);
  return (
    <div
      style={{
        width,
        height,
        borderRadius: radius,
        background: BACKDROPS[kind],
        flexShrink: 0,
        position: 'relative',
        overflow: 'hidden',
        ...style,
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: headline ? '56%' : '52%',
          width: productH * 0.66,
          height: productH,
          transform: `translate(-50%, -50%) translateY(${float}px)`,
        }}
      >
        {kind === 'serum' && <Serum />}
        {kind === 'perfume' && <Perfume />}
        {kind === 'can' && <Can />}
        {kind === 'candle' && <Candle t={t} />}
      </div>
      {/* light sweep */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(105deg, transparent ${sweep * 100 - 15}%, rgba(255,255,255,0.28) ${sweep * 100}%, transparent ${sweep * 100 + 15}%)`,
        }}
      />
      {headline && (
        <div
          style={{
            position: 'absolute',
            top: height * 0.07,
            left: 0,
            right: 0,
            textAlign: 'center',
            fontFamily: DISPLAY,
            fontWeight: 700,
            fontSize: Math.max(16, width * 0.085),
            lineHeight: 1.05,
            color: '#fff',
            padding: '0 8%',
            textShadow: '0 4px 20px rgba(0,0,0,0.25)',
          }}
        >
          {headline}
        </div>
      )}
      {cta && (
        <div
          style={{
            position: 'absolute',
            bottom: height * 0.05,
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#fff',
            color: '#111',
            fontFamily: FONT,
            fontWeight: 700,
            fontSize: Math.max(12, width * 0.05),
            padding: `${width * 0.025}px ${width * 0.07}px`,
            borderRadius: 999,
            whiteSpace: 'nowrap',
          }}
        >
          {cta}
        </div>
      )}
      {play && (
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: width * 0.2,
            height: width * 0.2,
            transform: 'translate(-50%,-50%)',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.25)',
            backdropFilter: 'blur(6px)',
            border: '2px solid rgba(255,255,255,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg width="40%" height="40%" viewBox="0 0 24 24">
            <path d="M7 4 L20 12 L7 20 Z" fill="#fff" />
          </svg>
        </div>
      )}
    </div>
  );
};
