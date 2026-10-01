import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {StudioBg} from '../components/Backgrounds';
import {Creative, CreativeKind} from '../components/Creatives';
import {Badge, Cursor, Kicker, Sparkle} from '../components/UI';
import {WordsReveal} from '../components/Text';
import {prog, pop, typed, INOUT} from '../components/anim';
import {C, DISPLAY, FONT, GRAD} from '../theme';

const ADS: {kind: CreativeKind; brand: string; days: number; win: boolean; headline: string}[] = [
  {kind: 'serum', brand: 'Glow Lab', days: 47, win: true, headline: 'Peau terne ? 7 jours.'},
  {kind: 'perfume', brand: 'Maison Élan', days: 9, win: false, headline: 'Nouvelle fragrance'},
  {kind: 'serum', brand: 'Pure Skin', days: 62, win: true, headline: 'Avant / Après'},
  {kind: 'candle', brand: 'Ambre & Co', days: 4, win: false, headline: 'Offre de rentrée'},
];

// Meta Ads library intelligence
export const Spy: React.FC = () => {
  const f = useCurrentFrame();
  const kick = prog(f, 4, 22);
  const panel = prog(f, 8, 30);
  const q = typed('sérum vitamine C', f, 26, 26);
  const scan = interpolate(f, [56, 100], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: INOUT});
  // cursor path to "S'inspirer"
  const cx = interpolate(f, [104, 136], [1560, 1672], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: INOUT});
  const cy = interpolate(f, [104, 136], [1060, 898], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: INOUT});
  const press = f >= 138 ? prog(f, 138, 16) : 0;
  const sent = prog(f, 146, 18);
  return (
    <StudioBg intensity={0.8}>
      <div style={{position: 'absolute', left: 140, top: 80}}>
        <Kicker n="04" label="Espion Meta Ads" dark opacity={kick} y={(1 - kick) * 16} />
      </div>
      <div style={{position: 'absolute', left: 140, top: 150, width: 640}}>
        <WordsReveal
          words={[{t: 'Inspirez-vous'}, {t: 'des'}, {t: 'pubs', grad: 'pink'}, {t: 'qui', grad: 'pink'}, {t: 'gagnent.', grad: 'pink'}]}
          start={8}
          stagger={3}
          style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 76, lineHeight: 1.04, color: '#fff', justifyContent: 'flex-start'}}
        />
        <div style={{marginTop: 30, fontFamily: FONT, fontSize: 28, lineHeight: 1.5, color: 'rgba(255,255,255,0.65)', opacity: prog(f, 30, 20)}}>
          L’IA analyse en temps réel la bibliothèque publicitaire Meta de votre marché et s’en inspire pour chaque création.
        </div>
      </div>
      <AbsoluteFill style={{perspective: 2200}}>
        <div
          style={{
            position: 'absolute',
            right: 110,
            top: 150,
            width: 1020,
            height: 830,
            borderRadius: 28,
            background: '#fff',
            boxShadow: '0 60px 140px -40px rgba(0,0,0,0.85), 0 30px 80px -40px rgba(101,82,232,0.7)',
            transform: `translateX(${(1 - panel) * 300}px) rotateY(${-10 + panel * 4}deg)`,
            opacity: panel,
            padding: 30,
            fontFamily: FONT,
            overflow: 'hidden',
          }}
        >
          <div style={{display: 'flex', gap: 14, alignItems: 'center'}}>
            <div
              style={{
                flex: 1,
                height: 60,
                borderRadius: 14,
                border: `1.5px solid ${C.primary}`,
                boxShadow: '0 0 0 5px rgba(101,82,232,0.12)',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '0 18px',
                fontSize: 22,
                color: C.ink,
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="7" stroke={C.slate} strokeWidth={2.2} />
                <path d="M20 20l-4-4" stroke={C.slate} strokeWidth={2.2} strokeLinecap="round" />
              </svg>
              {q}
              <span style={{opacity: Math.floor(f / 8) % 2 ? 1 : 0, color: C.primary, marginLeft: -8}}>|</span>
            </div>
            <Badge tone="meta" style={{height: 44, fontSize: 18}}>Bibliothèque Meta · FR</Badge>
          </div>
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 18, marginTop: 26}}>
            {ADS.map((a, i) => {
              const p = pop(f, 46 + i * 5, 15);
              const flagged = a.win && scan > (i + 0.5) / ADS.length;
              return (
                <div
                  key={i}
                  style={{
                    borderRadius: 16,
                    border: `1px solid ${flagged ? C.success : C.hairline}`,
                    boxShadow: flagged ? '0 0 0 4px rgba(34,193,122,0.15)' : 'none',
                    overflow: 'hidden',
                    transform: `translateY(${(1 - p) * 40}px)`,
                    opacity: p * (scan >= 1 && !a.win ? 0.45 : 1),
                    background: '#fff',
                  }}
                >
                  <div style={{padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10}}>
                    <div style={{width: 30, height: 30, borderRadius: 15, background: C.mist}} />
                    <div>
                      <div style={{fontSize: 15, fontWeight: 600, color: C.ink}}>{a.brand}</div>
                      <div style={{fontSize: 12, color: C.slate}}>Sponsorisé</div>
                    </div>
                  </div>
                  <Creative kind={a.kind} width={220} height={300} radius={0} headline={a.headline} />
                  <div style={{padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8}}>
                    <div style={{fontSize: 14, color: C.slate}}>Active depuis {a.days} j</div>
                    <div style={{height: 30}}>
                      {flagged && (
                        <Badge tone="success" style={{height: 30, fontSize: 14, transform: `scale(${pop(f, 60 + i * 10)})`}}>
                          ● Gagnant probable
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {/* scan line */}
          {scan > 0 && scan < 1 && (
            <div
              style={{
                position: 'absolute',
                top: 112,
                bottom: 160,
                left: 30 + scan * 960,
                width: 4,
                borderRadius: 2,
                backgroundImage: `linear-gradient(180deg, transparent, ${C.purple}, transparent)`,
                boxShadow: `0 0 30px 8px rgba(147,51,234,0.45)`,
              }}
            />
          )}
          <div
            style={{
              position: 'absolute',
              left: 30,
              right: 30,
              bottom: 30,
              height: 92,
              borderRadius: 18,
              background: C.mist,
              display: 'flex',
              alignItems: 'center',
              padding: '0 22px',
              gap: 16,
              opacity: prog(f, 96, 16),
            }}
          >
            <div style={{flex: 1}}>
              <div style={{fontSize: 20, fontWeight: 700, color: C.ink}}>2 gagnants probables détectés</div>
              <div style={{fontSize: 16, color: C.slate}}>
                {sent > 0 ? 'Envoyés au chat comme références ✓' : 'Hook avant/après · format 9:16 · preuve sociale'}
              </div>
            </div>
            <div
              style={{
                height: 54,
                padding: '0 24px',
                borderRadius: 14,
                backgroundImage: GRAD,
                color: '#fff',
                fontWeight: 600,
                fontSize: 20,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                transform: `scale(${1 - (press > 0 && press < 0.5 ? 0.06 : 0)})`,
              }}
            >
              <Sparkle size={18} /> S’inspirer
            </div>
          </div>
        </div>
      </AbsoluteFill>
      {f > 100 && <Cursor x={cx} y={cy} press={press} />}
    </StudioBg>
  );
};
