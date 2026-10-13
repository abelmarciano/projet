import React from 'react';
import {AbsoluteFill, Sequence, interpolate, useCurrentFrame} from 'remotion';
import {LightBg} from '../components/Backgrounds';
import {BrowserFrame, Check, LogoMark, Sparkle} from '../components/UI';
import {Clip} from '../components/Media';
import {WordsReveal} from '../components/Text';
import {prog, pop, typed, mix, INOUT} from '../components/anim';
import {C, DISPLAY, FONT, GRAD} from '../theme';
import {SAFE, SAFE_CX} from './safe';

const PROMPT =
  'Je vends des pompes à chaleur financées par les aides. Fais-moi une vidéo UGC face caméra avec une actrice et des sous-titres.';
const SEND = 76;
const CARD = 200;
const PLAY = 206;
const EXPAND = 232;

const STEPS = [
  {t: 'Script & hook rédigés', d: '« Si vous vous chauffez encore au gaz ou au fioul… »'},
  {t: 'Actrice : Charlotte', d: 'voix française naturelle'},
  {t: 'Tournage IA · 9:16 · 16 s', d: ''},
];

const Grow: React.FC<{h: number; p: number; children?: React.ReactNode}> = ({h, p, children}) => (
  <div style={{height: h * p, opacity: p, flexShrink: 0}}>
    <div style={{transform: `translateY(${(1 - p) * 30}px)`}}>{children}</div>
  </div>
);

const Avatar: React.FC = () => (
  <div style={{width: 50, height: 50, borderRadius: 25, backgroundImage: GRAD, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
    <LogoMark size={28} color="#fff" />
  </div>
);

// chat app fills the safe area
const APP = {x: SAFE.x, y: SAFE.y + 10, w: SAFE.w, h: 1150};
const CHROME = 56;
const TABS = 70;
const INPUT = 112;
const PAD = 32;
const CARD_H = 420;
const CARD_W = Math.round((CARD_H * 9) / 16);
// card rect in the thread (bottom of the scroll area, after the avatar)
const FROM = {x: APP.x + PAD + 64, y: APP.y + APP.h - INPUT - 20 - CARD_H, w: CARD_W, h: CARD_H};
// phone once the video takes over
const PH_H = 860;
const PH_W = Math.round((PH_H * 9) / 16) + 24;
const TO = {x: SAFE_CX - PH_W / 2, y: 470, w: PH_W, h: PH_H + 24};

export const ChatV: React.FC = () => {
  const f = useCurrentFrame();
  const enter = prog(f, 0, 28);
  const input = f < SEND ? typed(PROMPT, f, 12, 72) : '';
  const bubble = prog(f, SEND, 18);
  const dots = f > SEND + 10 && f < SEND + 34;
  const answer = prog(f, SEND + 34, 20);
  const card = prog(f, CARD, 22);
  const ex = prog(f, EXPAND, 40, INOUT);
  const pct = Math.round(interpolate(f, [SEND + 80, CARD - 4], [0, 100], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));
  const r = {x: mix(FROM.x, TO.x, ex), y: mix(FROM.y, TO.y, ex), w: mix(FROM.w, TO.w, ex), h: mix(FROM.h, TO.h, ex)};
  const side = prog(f, EXPAND + 26, 24);
  const chip = pop(f, EXPAND + 60, 14);
  const lines = input.length > 0 ? input : '';

  return (
    <LightBg>
      <AbsoluteFill style={{perspective: 2400}}>
        <div
          style={{
            position: 'absolute',
            left: APP.x,
            top: APP.y,
            transform: `translateY(${(1 - enter) * 120}px) rotateX(${(1 - enter) * 10}deg) scale(${1 - ex * 0.1})`,
            opacity: enter * (1 - ex),
            filter: `blur(${ex * 6}px)`,
          }}
        >
          <BrowserFrame title="growthity.ai · Chat créatif" width={APP.w} height={APP.h}>
            <div style={{height: TABS, borderBottom: `1px solid ${C.hairline}`, display: 'flex', alignItems: 'center', gap: 10, padding: '0 24px'}}>
              {['Scénario · Local', 'B2B', 'E-commerce'].map((s, i) => (
                <div
                  key={s}
                  style={{
                    fontFamily: FONT,
                    fontSize: 19,
                    fontWeight: 500,
                    padding: '10px 18px',
                    borderRadius: 999,
                    border: i === 0 ? 'none' : `1px solid ${C.hairline}`,
                    backgroundImage: i === 0 ? GRAD : undefined,
                    color: i === 0 ? '#fff' : C.slate,
                  }}
                >
                  {s}
                </div>
              ))}
            </div>
            <div
              style={{
                position: 'absolute',
                top: TABS,
                bottom: INPUT,
                left: 0,
                right: 0,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                padding: `0 ${PAD}px 20px`,
                gap: 24,
              }}
            >
              <Grow h={214} p={bubble}>
                <div style={{display: 'flex', justifyContent: 'flex-end'}}>
                  <div
                    style={{
                      maxWidth: 640,
                      backgroundImage: `linear-gradient(120deg, ${C.blue}, ${C.indigo} 55%, ${C.purple})`,
                      color: '#fff',
                      fontFamily: FONT,
                      fontSize: 27,
                      lineHeight: 1.42,
                      padding: '18px 24px',
                      borderRadius: '24px 24px 6px 24px',
                    }}
                  >
                    {PROMPT}
                  </div>
                </div>
              </Grow>
              {dots && (
                <div style={{display: 'flex', gap: 14, alignItems: 'center'}}>
                  <Avatar />
                  <div style={{display: 'flex', gap: 8, padding: '18px 22px', background: C.mist, borderRadius: 18}}>
                    {[0, 1, 2].map((i) => (
                      <div key={i} style={{width: 11, height: 11, borderRadius: 6, background: C.slate, opacity: 0.35 + 0.65 * Math.max(0, Math.sin((f - i * 4) / 4))}} />
                    ))}
                  </div>
                </div>
              )}
              <Grow h={380} p={answer}>
                <div style={{display: 'flex', gap: 14}}>
                  <Avatar />
                  <div style={{fontFamily: FONT, color: C.ink, flex: 1}}>
                    <div style={{fontSize: 26, lineHeight: 1.4, marginTop: 8}}>
                      Parfait ! Script, actrice et tournage : <b>je m’occupe de tout.</b>
                    </div>
                    <div style={{marginTop: 18, display: 'flex', flexDirection: 'column', gap: 16}}>
                      {STEPS.map((s, i) => {
                        const vis = prog(f, SEND + 44 + i * 18, 14);
                        const last = i === STEPS.length - 1;
                        const done = last ? pct >= 100 : f > SEND + 58 + i * 18;
                        return (
                          <div key={s.t} style={{display: 'flex', gap: 14, opacity: vis, fontSize: 22}}>
                            <div
                              style={{
                                width: 32,
                                height: 32,
                                borderRadius: 16,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                                background: done ? C.success : C.mist,
                                border: done ? 'none' : `2px solid ${C.hairline}`,
                              }}
                            >
                              {done && <Check size={18} />}
                            </div>
                            <div style={{flex: 1}}>
                              <div style={{color: C.ink, fontWeight: 600, lineHeight: '32px'}}>{s.t}</div>
                              {s.d && <div style={{color: C.slate, fontSize: 19, fontStyle: i === 0 ? 'italic' : 'normal', marginTop: 2}}>{s.d}</div>}
                              {last && (
                                <div style={{display: 'flex', alignItems: 'center', gap: 12, marginTop: 8}}>
                                  <div style={{width: 360, height: 10, borderRadius: 5, background: C.mist, overflow: 'hidden'}}>
                                    <div style={{width: `${pct}%`, height: '100%', backgroundImage: GRAD}} />
                                  </div>
                                  <span style={{fontVariantNumeric: 'tabular-nums', fontSize: 20, fontWeight: 600, color: C.primary}}>{pct}%</span>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </Grow>
              <Grow h={CARD_H} p={card} />
            </div>
            <div style={{position: 'absolute', left: 24, right: 24, bottom: 24}}>
              <div
                style={{
                  minHeight: 64,
                  borderRadius: 18,
                  border: `1.5px solid ${f > 10 && f < SEND ? C.primary : C.hairline}`,
                  boxShadow: f > 10 && f < SEND ? '0 0 0 5px rgba(101,82,232,0.12)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0 10px 0 20px',
                  fontFamily: FONT,
                  fontSize: 23,
                  color: lines ? C.ink : '#94A3B8',
                  background: '#fff',
                }}
              >
                <div style={{flex: 1, whiteSpace: 'nowrap', overflow: 'hidden'}}>
                  <span>
                    {lines ? (lines.length > 38 ? '…' + lines.slice(-38) : lines) : 'Décris ta pub…'}
                    {f > 10 && f < SEND && <span style={{opacity: Math.floor(f / 8) % 2 ? 1 : 0, color: C.primary}}>|</span>}
                  </span>
                </div>
                <div
                  style={{
                    height: 50,
                    padding: '0 20px',
                    marginLeft: 12,
                    borderRadius: 13,
                    backgroundImage: GRAD,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 9,
                    color: '#fff',
                    fontWeight: 600,
                    fontSize: 20,
                    flexShrink: 0,
                    transform: `scale(${f > SEND - 6 && f < SEND + 4 ? 0.92 : 1})`,
                  }}
                >
                  <Sparkle size={18} />
                  Générer
                </div>
              </div>
            </div>
          </BrowserFrame>
        </div>
      </AbsoluteFill>

      {/* headline above the phone once the video takes over */}
      <div style={{position: 'absolute', left: SAFE.x, top: SAFE.y + 10, width: SAFE.w, opacity: side}}>
        <WordsReveal
          words={[{t: 'Une'}, {t: 'vraie'}, {t: 'vidéo'}, {t: 'UGC.', grad: 'pink', br: true}, {t: 'En'}, {t: '2'}, {t: 'minutes.'}]}
          start={EXPAND + 30}
          stagger={3}
          style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 72, lineHeight: 1.04, color: C.ink}}
        />
      </div>
      <div style={{position: 'absolute', left: SAFE.x, width: SAFE.w, top: TO.y + TO.h + 22, display: 'flex', justifyContent: 'center', gap: 12, transform: `scale(${chip})`}}>
        {['9:16 · Reels & Stories', '16 s', 'Sous-titres'].map((t) => (
          <div key={t} style={{fontFamily: FONT, fontWeight: 600, fontSize: 23, color: C.primary, background: '#EEEBFF', padding: '10px 18px', borderRadius: 999}}>
            {t}
          </div>
        ))}
      </div>

      {f >= CARD && (
        <div
          style={{
            position: 'absolute',
            left: r.x,
            top: r.y + (1 - card) * 30,
            width: r.w,
            height: r.h,
            opacity: card,
            borderRadius: mix(18, 54, ex),
            padding: mix(0, 12, ex),
            background: ex > 0 ? '#0B0A0C' : 'transparent',
            boxShadow: `0 ${mix(10, 60, ex)}px ${mix(30, 120, ex)}px -30px rgba(37,22,120,${mix(0.25, 0.7, ex)})`,
          }}
        >
          <div style={{position: 'relative', width: '100%', height: '100%', borderRadius: mix(18, 44, ex), overflow: 'hidden'}}>
            {f >= PLAY ? (
              <Sequence from={PLAY} layout="none">
                <Clip src="ugc-charlotte.mp4" width="100%" height="100%" style={{position: 'absolute', inset: 0}} />
              </Sequence>
            ) : (
              <div style={{position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(90deg, #EEF0F6 0%, #DCDFF0 50%, #EEF0F6 100%)', backgroundSize: '200% 100%', backgroundPosition: `${200 - ((f * 4) % 400)}% 0`}} />
            )}
            <div
              style={{
                position: 'absolute',
                left: 14,
                top: 14,
                fontFamily: FONT,
                fontSize: mix(15, 20, ex),
                fontWeight: 600,
                color: '#fff',
                background: 'rgba(15,23,42,0.55)',
                padding: '6px 12px',
                borderRadius: 999,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <span style={{width: 8, height: 8, borderRadius: 4, background: '#FF4D5E'}} />
              Vidéo UGC · 9:16
            </div>
          </div>
        </div>
      )}
    </LightBg>
  );
};
