import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {LightBg} from '../components/Backgrounds';
import {BrowserFrame, Check, Kicker, LogoMark, Sparkle} from '../components/UI';
import {Creative} from '../components/Creatives';
import {prog, pop, typed, INOUT} from '../components/anim';
import {C, DISPLAY, FONT, GRAD} from '../theme';

const PROMPT =
  'Je vends un sérum vitamine C sur ma boutique, je veux une vidéo et une image qui donnent envie de l’acheter.';
const SEND = 96;

const STEPS = [
  'Analyse du produit et de la cible',
  'Inspiration : pubs gagnantes skincare',
  'Script, hook et prompt rédigés',
  'Génération des créations',
];

// Block whose height grows from 0 so the chat scrolls naturally
const Grow: React.FC<{h: number; p: number; children: React.ReactNode}> = ({h, p, children}) => (
  <div style={{height: h * p, opacity: p, overflow: 'visible', flexShrink: 0}}>
    <div style={{transform: `translateY(${(1 - p) * 30}px)`}}>{children}</div>
  </div>
);

const Avatar: React.FC = () => (
  <div
    style={{
      width: 46,
      height: 46,
      borderRadius: 23,
      backgroundImage: GRAD,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    }}
  >
    <LogoMark size={26} color="#fff" />
  </div>
);

export const Chat: React.FC = () => {
  const f = useCurrentFrame();
  const enter = prog(f, 0, 30);
  const input = f < SEND ? typed(PROMPT, f, 14, 62) : '';
  const bubble = prog(f, SEND, 18);
  const dots = f > SEND + 12 && f < SEND + 40;
  const answer = prog(f, SEND + 40, 20);
  const cards = prog(f, 222, 26);
  const reveal = (i: number) => prog(f, 250 + i * 10, 18);
  const camZoom = interpolate(f, [220, 330], [1, 1.07], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: INOUT});
  const kick = prog(f, 6, 24);

  return (
    <LightBg>
      <div style={{position: 'absolute', left: 140, top: 70}}>
        <Kicker n="01" label="Décrivez votre produit" opacity={kick} y={(1 - kick) * 16} />
      </div>
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', paddingTop: 70, perspective: 2400}}>
        <div
          style={{
            transform: `translateY(${(1 - enter) * 120}px) scale(${camZoom}) rotateX(${(1 - enter) * 10}deg)`,
            opacity: enter,
            transformOrigin: '50% 80%',
          }}
        >
          <BrowserFrame title="growthity.ai · Chat créatif" width={1640} height={880}>
            {/* scenario pills */}
            <div style={{height: 64, borderBottom: `1px solid ${C.hairline}`, display: 'flex', alignItems: 'center', gap: 10, padding: '0 22px'}}>
              {['Scénario 1 · B2B', 'Scénario 2 · E-commerce', 'Scénario 3 · Local'].map((s, i) => (
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
            {/* thread */}
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
                      maxWidth: 960,
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
                      <div
                        key={i}
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: 5,
                          background: C.slate,
                          opacity: 0.35 + 0.65 * Math.max(0, Math.sin((f - i * 4) / 4)),
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
              <Grow h={258} p={answer}>
                <div style={{display: 'flex', gap: 14}}>
                  <Avatar />
                  <div style={{fontFamily: FONT, color: C.ink}}>
                    <div style={{fontSize: 22, lineHeight: 1.45, marginTop: 8}}>
                      Parfait ! Je prépare <b>une vidéo UGC 9:16</b> et <b>un visuel 1:1</b> pour votre sérum.
                    </div>
                    <div style={{marginTop: 16, display: 'flex', flexDirection: 'column', gap: 11}}>
                      {STEPS.map((s, i) => {
                        const done = f > SEND + 64 + i * 22;
                        const vis = prog(f, SEND + 48 + i * 22, 14);
                        const last = i === STEPS.length - 1;
                        const pct = Math.round(interpolate(f, [SEND + 112, 220], [0, 100], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));
                        return (
                          <div key={s} style={{display: 'flex', alignItems: 'center', gap: 12, opacity: vis, fontSize: 19, color: C.slate}}>
                            <div
                              style={{
                                width: 28,
                                height: 28,
                                borderRadius: 14,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: done && !(last && pct < 100) ? C.success : C.mist,
                                border: done ? 'none' : `2px solid ${C.hairline}`,
                              }}
                            >
                              {done && !(last && pct < 100) && <Check size={16} />}
                            </div>
                            <span style={{color: C.ink, fontWeight: 500}}>{s}</span>
                            {last && vis > 0 && (
                              <div style={{display: 'flex', alignItems: 'center', gap: 10, marginLeft: 8}}>
                                <div style={{width: 220, height: 8, borderRadius: 4, background: C.mist, overflow: 'hidden'}}>
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
              <Grow h={420} p={cards}>
                <div style={{display: 'flex', gap: 22, paddingLeft: 60}}>
                  {[
                    {w: 236, h: 420, kind: 'serum' as const, play: true, label: 'Vidéo UGC · 9:16', headline: 'Mon teint a changé en 2 semaines'},
                    {w: 420, h: 420, kind: 'serum' as const, label: 'Image · 1:1', headline: 'L’éclat, dès la 1ʳᵉ goutte.', cta: '-20% aujourd’hui'},
                    {w: 336, h: 420, kind: 'serum' as const, label: 'Image · 4:5', cta: 'Acheter maintenant'},
                  ].map((c, i) => {
                    const r = reveal(i);
                    return (
                      <div key={i} style={{position: 'relative', width: c.w, height: c.h, borderRadius: 18, overflow: 'hidden', background: C.mist}}>
                        <div
                          style={{
                            position: 'absolute',
                            inset: 0,
                            opacity: 1 - r,
                            backgroundImage: 'linear-gradient(90deg, #EEF0F6 0%, #DCDFF0 50%, #EEF0F6 100%)',
                            backgroundSize: '200% 100%',
                            backgroundPosition: `${200 - ((f * 4) % 400)}% 0`,
                          }}
                        />
                        <div style={{position: 'absolute', inset: 0, opacity: r, transform: `scale(${1.08 - r * 0.08})`, filter: `blur(${(1 - r) * 14}px)`}}>
                          <Creative kind={c.kind} width={c.w} height={c.h} radius={0} play={c.play} headline={c.headline} cta={c.cta} />
                        </div>
                        <div
                          style={{
                            position: 'absolute',
                            left: 12,
                            top: 12,
                            fontFamily: FONT,
                            fontSize: 14,
                            fontWeight: 600,
                            color: '#fff',
                            background: 'rgba(15,23,42,0.55)',
                            padding: '6px 11px',
                            borderRadius: 999,
                            opacity: r,
                          }}
                        >
                          {c.label}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Grow>
            </div>
            {/* input */}
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
                <div style={{flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'clip', direction: 'rtl', textAlign: 'left'}}>
                  <span style={{direction: 'ltr', unicodeBidi: 'bidi-override'}}>
                    {input || 'Décris ta pub…'}
                    {f > 10 && f < SEND && <span style={{opacity: Math.floor(f / 8) % 2 ? 1 : 0, color: C.primary}}>|</span>}
                  </span>
                </div>
                <div
                  style={{
                    height: 46,
                    padding: '0 20px',
                    borderRadius: 13,
                    backgroundImage: GRAD,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 9,
                    color: '#fff',
                    fontWeight: 600,
                    fontSize: 18,
                    transform: `scale(${f > SEND - 6 && f < SEND + 4 ? 0.92 : 1})`,
                  }}
                >
                  <Sparkle size={18} />
                  Générer mes créations
                </div>
              </div>
            </div>
          </BrowserFrame>
        </div>
      </AbsoluteFill>
      {/* result callout */}
      <div
        style={{
          position: 'absolute',
          right: 120,
          top: 60,
          opacity: prog(f, 285, 20),
          transform: `translateY(${(1 - pop(f, 285)) * 30}px)`,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          fontFamily: DISPLAY,
          fontWeight: 700,
          fontSize: 34,
          color: C.ink,
          background: '#fff',
          padding: '14px 26px',
          borderRadius: 999,
          boxShadow: '0 20px 50px -20px rgba(91,63,228,0.5)',
          border: `1px solid ${C.hairline}`,
        }}
      >
        <span style={{width: 14, height: 14, borderRadius: 7, background: C.success}} />
        Prêt en 2 minutes
      </div>
    </LightBg>
  );
};
