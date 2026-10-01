import React from 'react';
import {AbsoluteFill, Sequence, interpolate, useCurrentFrame} from 'remotion';
import {LightBg} from '../components/Backgrounds';
import {BrowserFrame, Check, Kicker, LogoMark, Sparkle} from '../components/UI';
import {Clip} from '../components/Media';
import {WordsReveal} from '../components/Text';
import {prog, pop, typed, mix, INOUT} from '../components/anim';
import {C, DISPLAY, FONT, GRAD} from '../theme';

const PROMPT =
  'Je vends des pompes à chaleur financées par les aides. Fais-moi une vidéo UGC face caméra avec une actrice et des sous-titres.';
const SEND = 76;
const CARD = 200; // video card lands in the thread
const PLAY = 206; // UGC video starts (with sound)
const EXPAND = 232; // card flies out into the phone

const STEPS = [
  {t: 'Script & hook rédigés', d: '« Si vous vous chauffez encore au gaz ou au fioul… »'},
  {t: 'Actrice : Charlotte', d: 'voix française naturelle'},
  {t: 'Tournage IA · vidéo 9:16 · 16 s', d: ''},
];

const Grow: React.FC<{h: number; p: number; children?: React.ReactNode}> = ({h, p, children}) => (
  <div style={{height: h * p, opacity: p, flexShrink: 0}}>
    <div style={{transform: `translateY(${(1 - p) * 30}px)`}}>{children}</div>
  </div>
);

const Avatar: React.FC = () => (
  <div style={{width: 46, height: 46, borderRadius: 23, backgroundImage: GRAD, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
    <LogoMark size={26} color="#fff" />
  </div>
);

// Card rect inside the browser thread → phone rect on the right
const FROM = {x: 240, y: 333, w: 300, h: 534};
const TO = {x: 1190, y: 70, w: 530, h: 942};

export const Chat: React.FC = () => {
  const f = useCurrentFrame();
  const enter = prog(f, 0, 28);
  const kick = prog(f, 6, 24);
  const input = f < SEND ? typed(PROMPT, f, 12, 72) : '';
  const bubble = prog(f, SEND, 18);
  const dots = f > SEND + 10 && f < SEND + 34;
  const answer = prog(f, SEND + 34, 20);
  const card = prog(f, CARD, 22);
  const ex = prog(f, EXPAND, 40, INOUT);
  const pct = Math.round(interpolate(f, [SEND + 80, CARD - 4], [0, 100], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));
  const r = {
    x: mix(FROM.x, TO.x, ex),
    y: mix(FROM.y, TO.y, ex),
    w: mix(FROM.w, TO.w, ex),
    h: mix(FROM.h, TO.h, ex),
  };
  const side = prog(f, EXPAND + 26, 24);
  const chip = pop(f, EXPAND + 60, 14);

  return (
    <LightBg>
      <div style={{position: 'absolute', left: 140, top: 70, opacity: 1 - ex}}>
        <Kicker n="01" label="Décrivez votre pub" opacity={kick} y={(1 - kick) * 16} />
      </div>
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', paddingTop: 70, perspective: 2400}}>
        <div
          style={{
            transform: `translateY(${(1 - enter) * 120}px) rotateX(${(1 - enter) * 10}deg) translateX(${-ex * 260}px) scale(${1 - ex * 0.12})`,
            opacity: enter * (1 - ex),
            filter: `blur(${ex * 6}px)`,
          }}
        >
          <BrowserFrame title="growthity.ai · Chat créatif" width={1640} height={880}>
            <div style={{height: 64, borderBottom: `1px solid ${C.hairline}`, display: 'flex', alignItems: 'center', gap: 10, padding: '0 22px'}}>
              {['Scénario 1 · B2B', 'Scénario 2 · Local', 'Scénario 3 · E-commerce'].map((s, i) => (
                <div
                  key={s}
                  style={{
                    fontFamily: FONT,
                    fontSize: 16,
                    fontWeight: 500,
                    padding: '9px 16px',
                    borderRadius: 999,
                    border: i === 1 ? 'none' : `1px solid ${C.hairline}`,
                    backgroundImage: i === 1 ? GRAD : undefined,
                    color: i === 1 ? '#fff' : C.slate,
                  }}
                >
                  {s}
                </div>
              ))}
            </div>
            <div
              style={{
                position: 'absolute',
                top: 64,
                bottom: 104,
                left: 0,
                right: 0,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                padding: '0 40px 18px',
                gap: 22,
              }}
            >
              <Grow h={96} p={bubble}>
                <div style={{display: 'flex', justifyContent: 'flex-end'}}>
                  <div
                    style={{
                      maxWidth: 1000,
                      backgroundImage: `linear-gradient(120deg, ${C.blue}, ${C.indigo} 55%, ${C.purple})`,
                      color: '#fff',
                      fontFamily: FONT,
                      fontSize: 22,
                      lineHeight: 1.45,
                      padding: '16px 22px',
                      borderRadius: '22px 22px 6px 22px',
                    }}
                  >
                    {PROMPT}
                  </div>
                </div>
              </Grow>
              {dots && (
                <div style={{display: 'flex', gap: 14, alignItems: 'center'}}>
                  <Avatar />
                  <div style={{display: 'flex', gap: 7, padding: '16px 20px', background: C.mist, borderRadius: 18}}>
                    {[0, 1, 2].map((i) => (
                      <div key={i} style={{width: 10, height: 10, borderRadius: 5, background: C.slate, opacity: 0.35 + 0.65 * Math.max(0, Math.sin((f - i * 4) / 4))}} />
                    ))}
                  </div>
                </div>
              )}
              <Grow h={250} p={answer}>
                <div style={{display: 'flex', gap: 14}}>
                  <Avatar />
                  <div style={{fontFamily: FONT, color: C.ink}}>
                    <div style={{fontSize: 22, lineHeight: 1.45, marginTop: 8}}>
                      Parfait ! Script, actrice et tournage : <b>je m’occupe de tout.</b>
                    </div>
                    <div style={{marginTop: 16, display: 'flex', flexDirection: 'column', gap: 12}}>
                      {STEPS.map((s, i) => {
                        const vis = prog(f, SEND + 44 + i * 18, 14);
                        const last = i === STEPS.length - 1;
                        const done = last ? pct >= 100 : f > SEND + 58 + i * 18;
                        return (
                          <div key={s.t} style={{display: 'flex', alignItems: 'center', gap: 12, opacity: vis, fontSize: 19}}>
                            <div
                              style={{
                                width: 28,
                                height: 28,
                                borderRadius: 14,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: done ? C.success : C.mist,
                                border: done ? 'none' : `2px solid ${C.hairline}`,
                              }}
                            >
                              {done && <Check size={16} />}
                            </div>
                            <span style={{color: C.ink, fontWeight: 600}}>{s.t}</span>
                            {s.d && <span style={{color: C.slate, fontStyle: i === 0 ? 'italic' : 'normal'}}>{s.d}</span>}
                            {last && (
                              <div style={{display: 'flex', alignItems: 'center', gap: 10, marginLeft: 8}}>
                                <div style={{width: 240, height: 8, borderRadius: 4, background: C.mist, overflow: 'hidden'}}>
                                  <div style={{width: `${pct}%`, height: '100%', backgroundImage: GRAD}} />
                                </div>
                                <span style={{fontVariantNumeric: 'tabular-nums', fontSize: 17, fontWeight: 600, color: C.primary}}>{pct}%</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </Grow>
              <Grow h={560} p={card} />
            </div>
            <div style={{position: 'absolute', left: 30, right: 30, bottom: 22}}>
              <div
                style={{
                  height: 64,
                  borderRadius: 18,
                  border: `1.5px solid ${f > 10 && f < SEND ? C.primary : C.hairline}`,
                  boxShadow: f > 10 && f < SEND ? '0 0 0 5px rgba(101,82,232,0.12)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0 12px 0 22px',
                  fontFamily: FONT,
                  fontSize: 20,
                  color: input ? C.ink : '#94A3B8',
                  background: '#fff',
                }}
              >
                <div style={{flex: 1, whiteSpace: 'nowrap', overflow: 'hidden'}}>
                  <span>
                    {input ? (input.length > 92 ? '…' + input.slice(-92) : input) : 'Décris ta pub…'}
                    {f > 10 && f < SEND && <span style={{opacity: Math.floor(f / 8) % 2 ? 1 : 0, color: C.primary}}>|</span>}
                  </span>
                </div>
                <div
                  style={{
                    height: 46,
                    padding: '0 20px',
                    marginLeft: 16,
                    borderRadius: 13,
                    backgroundImage: GRAD,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 9,
                    color: '#fff',
                    fontWeight: 600,
                    fontSize: 18,
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

      {/* left copy once the video takes over */}
      <div style={{position: 'absolute', left: 150, top: 250, width: 900, opacity: side}}>
        <Kicker n="01" label="Vidéo UGC générée" opacity={side} />
        <WordsReveal
          words={[{t: 'Une'}, {t: 'vraie'}, {t: 'vidéo'}, {t: 'UGC.', grad: 'pink', br: true}, {t: 'En'}, {t: '2'}, {t: 'minutes.'}]}
          start={EXPAND + 30}
          stagger={3}
          style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 96, lineHeight: 1.04, color: C.ink, justifyContent: 'flex-start', marginTop: 26}}
        />
        <div style={{marginTop: 30, fontFamily: FONT, fontSize: 30, lineHeight: 1.5, color: C.slate, opacity: prog(f, EXPAND + 48, 20)}}>
          Actrice IA ultra-réaliste, voix française naturelle, sous-titres animés. Prête à publier sur Meta.
        </div>
        <div style={{display: 'flex', gap: 14, marginTop: 40, transform: `scale(${chip})`, transformOrigin: 'left center'}}>
          {['9:16 · Reels & Stories', '16 s', 'Sous-titres'].map((t) => (
            <div key={t} style={{fontFamily: FONT, fontWeight: 600, fontSize: 21, color: C.primary, background: '#EEEBFF', padding: '10px 18px', borderRadius: 999}}>
              {t}
            </div>
          ))}
        </div>
      </div>

      {/* the real UGC video: lands in the thread, then becomes the phone */}
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
                fontSize: mix(14, 18, ex),
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
