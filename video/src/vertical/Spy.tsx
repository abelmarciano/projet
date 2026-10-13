import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {StudioBg} from '../components/Backgrounds';
import {Clip} from '../components/Media';
import {Badge, Cursor, Sparkle} from '../components/UI';
import {WordsReveal} from '../components/Text';
import {prog, pop, typed, INOUT} from '../components/anim';
import {C, DISPLAY, FONT, GRAD} from '../theme';
import {SAFE} from './safe';

const ADS: {src: string; brand: string; days: number; win: boolean; loop?: number}[] = [
  {src: 'img-pac-fioul.webp', brand: 'Éco Habitat', days: 47, win: true},
  {src: 'ugc-pac-awa.mp4', brand: 'Chaleur+', days: 12, win: false},
  {src: 'ugc-homme.mp4', brand: 'ThermoConfort', days: 62, win: true},
  {src: 'img-pac-rge.webp', brand: 'RénoPro', days: 9, win: false},
  {src: 'ugc-pac-hugo.mp4', brand: 'Maison Éco', days: 33, win: true},
  {src: 'img-pac-70.webp', brand: 'Énergie Plus', days: 4, win: false},
];
const FLAG_AT = [62, 0, 90, 0, 120, 0];
const CW = 236;
const CARD = CW + 18;
const PANEL_TOP = 500;
const PANEL_H = 900;

export const SpyV: React.FC = () => {
  const f = useCurrentFrame();
  const panel = prog(f, 8, 30);
  const q = typed('pompe à chaleur', f, 26, 26);
  const scan = interpolate(f, [56, 100], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: INOUT});
  // the "S'inspirer" button sits bottom-right of the panel
  const cx = interpolate(f, [104, 136], [1000, 850], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: INOUT});
  const cy = interpolate(f, [104, 136], [1560, 1320], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: INOUT});
  const press = f >= 138 ? prog(f, 138, 16) : 0;
  const sent = prog(f, 146, 18);
  return (
    <StudioBg intensity={0.8}>
      <div style={{position: 'absolute', left: SAFE.x, top: SAFE.y + 10, width: SAFE.w, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <WordsReveal
          words={[{t: 'Inspirez-vous'}, {t: 'des', br: true}, {t: 'pubs'}, {t: 'qui'}, {t: 'gagnent.'}]}
          start={8}
          stagger={3}
          style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 78, lineHeight: 1.08, color: '#fff'}}
        />
        <div
          style={{
            height: 8,
            width: 320,
            marginTop: 8,
            marginLeft: 330,
            borderRadius: 7,
            backgroundImage: GRAD,
            transform: `scaleX(${prog(f, 26, 20)})`,
            transformOrigin: 'left center',
            boxShadow: '0 0 30px rgba(146,120,255,0.6)',
          }}
        />
      </div>
      <AbsoluteFill style={{perspective: 2200}}>
        <div
          style={{
            position: 'absolute',
            left: SAFE.x,
            top: PANEL_TOP,
            width: SAFE.w,
            height: PANEL_H,
            borderRadius: 28,
            background: '#fff',
            boxShadow: '0 60px 140px -40px rgba(0,0,0,0.85), 0 30px 80px -40px rgba(101,82,232,0.7)',
            transform: `translateY(${(1 - panel) * 200}px) rotateX(${(1 - panel) * 8}deg)`,
            opacity: panel,
            padding: 28,
            fontFamily: FONT,
            overflow: 'hidden',
          }}
        >
          <div style={{display: 'flex', gap: 12, alignItems: 'center'}}>
            <div
              style={{
                flex: 1,
                height: 62,
                borderRadius: 14,
                border: `1.5px solid ${C.primary}`,
                boxShadow: '0 0 0 5px rgba(101,82,232,0.12)',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '0 18px',
                fontSize: 24,
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
            <Badge tone="meta" style={{height: 46, fontSize: 18}}>Bibliothèque Meta</Badge>
          </div>
          <div style={{overflow: 'hidden', marginTop: 24, marginRight: -28}}>
            <div style={{display: 'flex', gap: 18, transform: `translateX(${-interpolate(f, [70, 165], [0, 3 * CARD], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: INOUT})}px)`}}>
              {ADS.map((a, i) => {
                const p = pop(f, 46 + i * 5, 15);
                const flagged = a.win && f >= FLAG_AT[i];
                return (
                  <div
                    key={i}
                    style={{
                      borderRadius: 16,
                      border: `1px solid ${flagged ? C.success : C.hairline}`,
                      boxShadow: flagged ? '0 0 0 4px rgba(34,193,122,0.15)' : 'none',
                      overflow: 'hidden',
                      transform: `translateY(${(1 - p) * 40}px)`,
                      opacity: p * (f > 110 && !a.win ? 0.45 : 1),
                      width: CW,
                      flexShrink: 0,
                      background: '#fff',
                    }}
                  >
                    <div style={{padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10}}>
                      <div style={{width: 30, height: 30, borderRadius: 15, background: C.mist}} />
                      <div>
                        <div style={{fontSize: 16, fontWeight: 600, color: C.ink}}>{a.brand}</div>
                        <div style={{fontSize: 12, color: C.slate}}>Sponsorisé</div>
                      </div>
                    </div>
                    <Clip src={a.src} width={CW} height={420} loopFrames={a.loop} />
                    <div style={{padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8}}>
                      <div style={{fontSize: 15, color: C.slate}}>Active depuis {a.days} j</div>
                      <div style={{height: 32}}>
                        {flagged && (
                          <Badge tone="success" style={{height: 32, fontSize: 15, transform: `scale(${pop(f, FLAG_AT[i])})`}}>
                            ● Gagnant probable
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          {scan > 0 && scan < 1 && (
            <div
              style={{
                position: 'absolute',
                top: 112,
                bottom: 170,
                left: 28 + scan * 760,
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
              left: 28,
              right: 28,
              bottom: 28,
              height: 110,
              borderRadius: 18,
              background: C.mist,
              display: 'flex',
              alignItems: 'center',
              padding: '0 20px',
              gap: 14,
              opacity: prog(f, 96, 16),
            }}
          >
            <div style={{flex: 1}}>
              <div style={{fontSize: 23, fontWeight: 700, color: C.ink}}>3 gagnants détectés</div>
              <div style={{fontSize: 17, color: C.slate, marginTop: 2}}>{sent > 0 ? 'Envoyés au chat comme références ✓' : 'Hook facture · UGC · aides de l’État'}</div>
            </div>
            <div
              style={{
                height: 60,
                padding: '0 22px',
                borderRadius: 14,
                backgroundImage: GRAD,
                color: '#fff',
                fontWeight: 600,
                fontSize: 21,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                flexShrink: 0,
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
