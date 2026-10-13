import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {LightBg} from '../components/Backgrounds';
import {Clip} from '../components/Media';
import {Badge, Card, Check, Cursor, MetaLogo} from '../components/UI';
import {WordsReveal} from '../components/Text';
import {prog, pop, INOUT} from '../components/anim';
import {C, DISPLAY, FONT, GRAD} from '../theme';
import {SAFE, SAFE_CX} from './safe';

const CLICK = 92;
const CARD_TOP = 545;

const Row: React.FC<{label: string; children: React.ReactNode; o: number}> = ({label, children, o}) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '18px 0',
      borderTop: `1px solid ${C.hairline}`,
      opacity: o,
      transform: `translateY(${(1 - o) * 14}px)`,
    }}
  >
    <div style={{fontSize: 21, color: C.slate}}>{label}</div>
    <div style={{display: 'flex', gap: 8, alignItems: 'center'}}>{children}</div>
  </div>
);

export const PublishV: React.FC = () => {
  const f = useCurrentFrame();
  const card = prog(f, 10, 28);
  const live = f >= CLICK + 6;
  const cx = interpolate(f, [52, 86], [1020, 600], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: INOUT});
  const cy = interpolate(f, [52, 86], [1600, 1062], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: INOUT});
  const press = f >= CLICK ? prog(f, CLICK, 16) : 0;
  const burst = prog(f, CLICK + 4, 26);
  const stats = pop(f, CLICK + 26, 14);
  const ctr = Math.round(interpolate(f, [CLICK + 26, CLICK + 70], [0, 234], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: INOUT}));
  const line = prog(f, CLICK + 26, 50, INOUT);

  return (
    <LightBg>
      <div style={{position: 'absolute', left: SAFE.x, top: SAFE.y + 10, width: SAFE.w, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <WordsReveal
          words={[{t: 'En'}, {t: 'ligne'}, {t: 'sur'}, {t: 'Meta', grad: 'brand', br: true}, {t: 'en'}, {t: 'un'}, {t: 'clic.'}]}
          start={8}
          stagger={3}
          style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 80, lineHeight: 1.04, color: C.ink}}
        />
        <div style={{display: 'flex', gap: 14, marginTop: 22, opacity: prog(f, 30, 20)}}>
          {['Facebook', 'Instagram'].map((p) => (
            <Badge key={p} tone="meta" style={{height: 44, fontSize: 20, padding: '0 18px'}}>
              {p}
            </Badge>
          ))}
        </div>
      </div>

      <AbsoluteFill style={{perspective: 2200}}>
        <div style={{position: 'absolute', left: SAFE.x, top: CARD_TOP, transform: `translateY(${(1 - card) * 120}px) rotateX(${(1 - card) * 8}deg)`, opacity: card}}>
          <Card style={{width: SAFE.w, padding: 30, borderRadius: 28}}>
            <div style={{display: 'flex', gap: 20, alignItems: 'center', marginBottom: 18}}>
              <div style={{borderRadius: 14, overflow: 'hidden', flexShrink: 0}}>
                <Clip src="ugc-charlotte.mp4" width={104} height={136} startFrom={60} />
              </div>
              <div style={{flex: 1}}>
                <div style={{fontSize: 15, color: C.slate, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 600}}>Campagne</div>
                <div style={{fontFamily: DISPLAY, fontSize: 36, fontWeight: 700, marginTop: 4}}>Pompes à chaleur</div>
                <div style={{fontSize: 18, color: C.slate, marginTop: 4}}>Vidéo UGC + 2 visuels · Leads</div>
              </div>
              <div style={{transform: live ? `scale(${pop(f, CLICK + 6, 10)})` : undefined}}>
                {live ? (
                  <Badge tone="success" style={{height: 40, fontSize: 19}}>● En ligne</Badge>
                ) : (
                  <Badge tone="warning" style={{height: 40, fontSize: 19}}>Prête</Badge>
                )}
              </div>
            </div>
            <Row label="Compte" o={prog(f, 22, 16)}>
              <MetaLogo size={22} />
              <span style={{fontSize: 20, fontWeight: 600}}>Meta Business connecté</span>
              <span style={{width: 26, height: 26, borderRadius: 13, background: C.success, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <Check size={15} />
              </span>
            </Row>
            <Row label="Ciblage" o={prog(f, 28, 16)}>
              {['Paris (75)', 'Hauts-de-Seine (92)', 'Rhône (69)'].map((d) => (
                <Badge key={d} tone="primary" style={{height: 36, fontSize: 16}}>
                  {d}
                </Badge>
              ))}
            </Row>
            <Row label="Budget" o={prog(f, 34, 16)}>
              <span style={{fontFamily: DISPLAY, fontSize: 28, fontWeight: 700}}>20 € / jour</span>
            </Row>
            <Row label="Placements" o={prog(f, 40, 16)}>
              <span style={{fontSize: 20, fontWeight: 600}}>Feed · Reels · Stories</span>
            </Row>
            <div style={{marginTop: 16, position: 'relative'}}>
              <div
                style={{
                  height: 80,
                  borderRadius: 18,
                  backgroundImage: live ? 'linear-gradient(120deg, #19A866, #22C17A)' : GRAD,
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: 26,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 12,
                  transform: `scale(${press > 0 && press < 0.5 ? 0.97 : 1})`,
                  boxShadow: '0 20px 40px -20px rgba(91,63,228,0.7)',
                }}
              >
                {live ? (
                  <>
                    <Check size={24} /> Campagne publiée sur Meta
                  </>
                ) : (
                  'Publier sur Meta'
                )}
              </div>
              {burst > 0 && burst < 1 &&
                Array.from({length: 14}).map((_, i) => {
                  const a = (i / 14) * Math.PI * 2;
                  const d = 60 + burst * 200;
                  return (
                    <div
                      key={i}
                      style={{
                        position: 'absolute',
                        left: '50%',
                        top: '50%',
                        width: 12,
                        height: 12,
                        borderRadius: 6,
                        background: [C.blue, C.indigo, C.purple, C.pink, C.success][i % 5],
                        transform: `translate(${Math.cos(a) * d * 1.5}px, ${Math.sin(a) * d * 0.6}px) scale(${1 - burst})`,
                      }}
                    />
                  );
                })}
            </div>
          </Card>
        </div>
        <div
          style={{
            position: 'absolute',
            left: SAFE_CX,
            top: 1190,
            transform: `translateX(-50%) scale(${stats}) rotate(${(1 - stats) * -6}deg)`,
            opacity: Math.min(1, stats * 1.5),
          }}
        >
          <Card style={{padding: '20px 30px', borderRadius: 24, display: 'flex', alignItems: 'center', gap: 24, boxShadow: '0 40px 80px -30px rgba(91,63,228,0.55)'}}>
            <svg width="170" height="70" viewBox="0 0 170 70">
              <defs>
                <linearGradient id="kpiv" x1="0" x2="1">
                  <stop offset="0" stopColor={C.blue} />
                  <stop offset="1" stopColor={C.purple} />
                </linearGradient>
              </defs>
              <path
                d="M4 62 C30 58 40 50 62 46 C84 42 92 30 112 26 C132 22 146 12 166 6"
                fill="none"
                stroke="url(#kpiv)"
                strokeWidth={5}
                strokeLinecap="round"
                pathLength={1}
                strokeDasharray={1}
                strokeDashoffset={1 - line}
              />
            </svg>
            <div>
              <div style={{fontFamily: DISPLAY, fontSize: 56, fontWeight: 700, fontVariantNumeric: 'tabular-nums', backgroundImage: GRAD, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent'}}>
                +{ctr}%
              </div>
              <div style={{fontSize: 18, color: C.slate, fontWeight: 600, marginTop: -4}}>CTR</div>
            </div>
          </Card>
        </div>
      </AbsoluteFill>
      {f > 48 && f < CLICK + 40 && <Cursor x={cx} y={cy} press={press} />}
    </LightBg>
  );
};
