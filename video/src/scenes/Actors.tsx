import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {LightBg} from '../components/Backgrounds';
import {Kicker} from '../components/UI';
import {WordsReveal} from '../components/Text';
import {prog, pop} from '../components/anim';
import {C, DISPLAY, FONT, GRAD} from '../theme';

type Actor = {name: string; skin: string; hair: string; bg: string; top: string; long?: boolean};

const ACTORS: Actor[] = [
  {name: 'Camille', skin: '#F2C9A8', hair: '#6B4226', bg: '#FDE7D6', top: '#E8D9C5', long: true},
  {name: 'Antoine', skin: '#E9B98F', hair: '#2E2219', bg: '#DCE7FF', top: '#3B4A6B'},
  {name: 'Aisha', skin: '#8A5A3B', hair: '#1B1310', bg: '#F5DDEB', top: '#C2457E', long: true},
  {name: 'Chen', skin: '#EBC59E', hair: '#141414', bg: '#DDF4EC', top: '#2F7D6A'},
  {name: 'Emma', skin: '#F6D3B8', hair: '#D9A953', bg: '#EDE6FF', top: '#7B61E8', long: true},
  {name: 'Diego', skin: '#C98E64', hair: '#2A1C14', bg: '#FFEBD1', top: '#D9822B'},
  {name: 'Fatou', skin: '#6E4530', hair: '#120C0A', bg: '#E2ECFF', top: '#2563EB', long: true},
  {name: 'Hana', skin: '#F1CDB0', hair: '#231A16', bg: '#FFE3E3', top: '#E35D6A', long: true},
  {name: 'David', skin: '#DDAA82', hair: '#5A3B22', bg: '#E8F1E2', top: '#5E7F3B'},
  {name: 'Elena', skin: '#EFC3A0', hair: '#8C3B1E', bg: '#F1E6DA', top: '#8A6A4A', long: true},
  {name: 'Arjun', skin: '#A86F48', hair: '#17110E', bg: '#E4E1FF', top: '#4B3FB5'},
  {name: 'Chloé', skin: '#F5D0B5', hair: '#3B2617', bg: '#DFF3FA', top: '#2A8FB3', long: true},
];

const Portrait: React.FC<{a: Actor; w: number; h: number; talk?: number}> = ({a, w, h, talk = 0}) => (
  <svg width={w} height={h} viewBox="0 0 200 260">
    <rect width="200" height="260" fill={a.bg} />
    <circle cx="160" cy="40" r="60" fill="rgba(255,255,255,0.45)" />
    {a.long && <path d="M58 108 Q54 40 100 36 Q146 40 142 108 L148 190 L52 190 Z" fill={a.hair} />}
    <path d="M30 260 Q34 196 100 190 Q166 196 170 260 Z" fill={a.top} />
    <rect x="88" y="150" width="24" height="34" rx="10" fill={a.skin} />
    <ellipse cx="100" cy="112" rx="40" ry="48" fill={a.skin} />
    <path
      d={a.long ? 'M60 104 Q62 58 100 56 Q138 58 140 104 Q128 78 100 76 Q74 78 60 104 Z' : 'M60 100 Q60 58 100 58 Q140 58 140 100 Q132 80 100 82 Q70 80 60 100 Z'}
      fill={a.hair}
    />
    <circle cx="86" cy="114" r="4" fill="#2A1C14" />
    <circle cx="114" cy="114" r="4" fill="#2A1C14" />
    <ellipse cx="100" cy={138} rx={9} ry={2.5 + talk * 5} fill="#9B4A3E" />
    <ellipse cx="80" cy="128" rx="7" ry="4" fill="rgba(240,120,120,0.25)" />
    <ellipse cx="120" cy="128" rx="7" ry="4" fill="rgba(240,120,120,0.25)" />
  </svg>
);

export const Actors: React.FC = () => {
  const f = useCurrentFrame();
  const kick = prog(f, 4, 22);
  const sel = prog(f, 70, 22);
  const rows = [ACTORS.slice(0, 6), ACTORS.slice(6, 12)];
  const W = 230;
  const H = 300;
  const talk = f > 90 ? Math.abs(Math.sin(f / 2.6)) * (0.6 + 0.4 * Math.sin(f / 7)) : 0;
  return (
    <LightBg>
      <div style={{position: 'absolute', left: 140, top: 80}}>
        <Kicker n="03" label="Vidéos UGC" opacity={kick} y={(1 - kick) * 16} />
      </div>
      <div style={{position: 'absolute', top: 140, left: 0, right: 0}}>
        <WordsReveal
          words={[{t: '60+'}, {t: 'acteurs', grad: 'pink'}, {t: 'IA,'}, {t: 'prêts'}, {t: 'à'}, {t: 'tourner.'}]}
          start={6}
          stagger={3}
          style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 84, color: C.ink}}
        />
      </div>
      <AbsoluteFill style={{justifyContent: 'center', paddingTop: 230, gap: 26}}>
        {rows.map((row, r) => {
          const drift = interpolate(f, [0, 160], r === 0 ? [40, -80] : [-120, 0]);
          return (
            <div key={r} style={{display: 'flex', gap: 26, justifyContent: 'center', transform: `translateX(${drift}px)`}}>
              {row.map((a, i) => {
                const idx = r * 6 + i;
                const p = pop(f, 8 + idx * 2.2, 15);
                const isSel = idx === 0;
                const dim = isSel ? 1 : 1 - sel * 0.55;
                return (
                  <div
                    key={a.name}
                    style={{
                      width: W,
                      height: H,
                      borderRadius: 22,
                      overflow: 'hidden',
                      position: 'relative',
                      transform: `scale(${(0.7 + p * 0.3) * (isSel ? 1 + sel * 0.1 : 1)})`,
                      opacity: Math.min(1, p * 1.5) * dim,
                      boxShadow: isSel && sel > 0 ? `0 0 0 ${5 * sel}px ${C.primary}, 0 30px 60px -20px rgba(91,63,228,0.6)` : '0 14px 30px -18px rgba(15,23,42,0.35)',
                      zIndex: isSel ? 5 : 1,
                    }}
                  >
                    <Portrait a={a} w={W} h={H} talk={isSel ? talk : 0} />
                    <div
                      style={{
                        position: 'absolute',
                        left: 12,
                        bottom: 12,
                        fontFamily: FONT,
                        fontWeight: 600,
                        fontSize: 18,
                        color: C.ink,
                        background: 'rgba(255,255,255,0.85)',
                        padding: '6px 12px',
                        borderRadius: 999,
                      }}
                    >
                      {a.name}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </AbsoluteFill>
      {/* selection chip */}
      <div
        style={{
          position: 'absolute',
          right: 150,
          bottom: 80,
          opacity: sel,
          transform: `translateY(${(1 - sel) * 30}px)`,
          display: 'flex',
          alignItems: 'center',
          gap: 18,
          background: '#fff',
          padding: '18px 24px',
          borderRadius: 22,
          border: `1px solid ${C.hairline}`,
          boxShadow: '0 30px 60px -25px rgba(15,23,42,0.35)',
          fontFamily: FONT,
        }}
      >
        <div style={{display: 'flex', alignItems: 'center', gap: 4, height: 40}}>
          {Array.from({length: 18}).map((_, i) => (
            <div
              key={i}
              style={{
                width: 5,
                borderRadius: 3,
                backgroundImage: GRAD,
                height: 8 + Math.abs(Math.sin(f / 3 + i * 0.9)) * 30 * (f > 90 ? 1 : 0.2),
              }}
            />
          ))}
        </div>
        <div>
          <div style={{fontSize: 18, color: C.slate}}>Acteur</div>
          <div style={{fontSize: 24, fontWeight: 700, color: C.ink}}>Camille · voix FR naturelle</div>
        </div>
      </div>
    </LightBg>
  );
};
