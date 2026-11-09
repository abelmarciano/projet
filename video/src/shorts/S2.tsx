import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {LightBg, StudioBg} from '../components/Backgrounds';
import {LogoMark} from '../components/UI';
import {prog, pop, INOUT} from '../components/anim';
import {C, DISPLAY, FONT, GRAD} from '../theme';
import {SceneProps, wordAt} from './timeline';
import {CheckIcon, EndCard, Phone, Pill, PromptBox, R, SAFE_CX, gradText} from './kit';

const PROMPT = 'Je vends des pompes à chaleur financées par les aides. Fais-moi une vidéo UGC avec une actrice face caméra.';

// « J'ai demandé à une IA de faire ma pub Meta. »
export const S2Hook: React.FC<SceneProps> = () => {
  const f = useCurrentFrame();
  return (
    <LightBg>
      <div style={{position: 'absolute', left: R.x, width: R.w, top: 360, textAlign: 'center'}}>
        <Pill tone="dark" size={30} style={{transform: `rotate(-3deg) scale(${1 + Math.sin(f / 6) * 0.02})`}}>POV</Pill>
        <div style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 104, lineHeight: 1.04, color: C.ink, marginTop: 40}}>
          J’ai demandé à une <span style={gradText()}>IA</span> de faire ma pub Meta.
        </div>
      </div>
      <div style={{position: 'absolute', left: R.x + 40, top: 900, transform: `translateY(${-Math.min(f, 60) * 0.6}px)`, opacity: 0.9}}>
        <PromptBox text="Je vends des pompes à chaleur…" start={0} cps={60} width={R.w - 80} size={28} />
      </div>
    </LightBg>
  );
};

const STEPS = [
  {t: 'Script & hook rédigés', d: '« Si vous vous chauffez encore au gaz ou au fioul… »', key: 'script'},
  {t: 'Actrice : Charlotte', d: 'voix française naturelle', key: 'choisi'},
  {t: 'Tournage IA · 9:16 · 16 s', d: 'sous-titres animés', key: 'tourné'},
];

// the prompt, then the AI does the work (ticks land on the spoken words)
export const S2Chat: React.FC<SceneProps> = ({lines}) => {
  const f = useCurrentFrame();
  const send = lines[1].start - 2;
  const bubble = prog(f, send, 14);
  const ticks = STEPS.map((s) => wordAt(lines[1], s.key, 20));
  const pct = Math.round(interpolate(f, [ticks[1], ticks[2] + 8], [0, 100], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));
  return (
    <LightBg>
      <div style={{position: 'absolute', left: R.x, top: 520, width: R.w, opacity: 1 - bubble, transform: `translateY(${-bubble * 200}px)`}}>
        <PromptBox text={PROMPT} start={2} cps={Math.max(40, (PROMPT.length * 30) / Math.max(30, send - 6))} send={send} size={38} />
      </div>
      <div style={{position: 'absolute', left: R.x, top: R.y + 10, width: R.w, opacity: bubble, transform: `translateY(${(1 - bubble) * 60}px)`}}>
        <div style={{display: 'flex', justifyContent: 'flex-end'}}>
          <div style={{maxWidth: 700, backgroundImage: GRAD, color: '#fff', fontFamily: FONT, fontSize: 28, lineHeight: 1.4, padding: '20px 26px', borderRadius: '28px 28px 8px 28px'}}>{PROMPT}</div>
        </div>
        <div style={{display: 'flex', gap: 16, marginTop: 36}}>
          <div style={{width: 60, height: 60, borderRadius: 30, backgroundImage: GRAD, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
            <LogoMark size={34} color="#fff" />
          </div>
          <div style={{flex: 1, background: '#fff', borderRadius: 26, padding: '22px 26px', boxShadow: '0 30px 60px -30px rgba(37,22,120,0.45)', fontFamily: FONT}}>
            <div style={{fontSize: 28, color: C.ink, lineHeight: 1.35}}>
              Parfait ! <b>Je m’occupe de tout.</b>
            </div>
            <div style={{display: 'flex', flexDirection: 'column', gap: 22, marginTop: 22}}>
              {STEPS.map((s, i) => {
                const vis = prog(f, ticks[i] - 14, 10);
                const done = f >= ticks[i] + (i === 2 ? 10 : 0);
                const d = pop(f, ticks[i] + (i === 2 ? 10 : 0), 11);
                return (
                  <div key={s.t} style={{display: 'flex', gap: 16, opacity: vis, transform: `translateX(${(1 - vis) * 30}px)`}}>
                    <div style={{width: 42, height: 42, borderRadius: 21, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: done ? C.success : C.mist, border: done ? 'none' : `2px solid ${C.hairline}`, transform: `scale(${done ? 0.8 + d * 0.2 : 1})`}}>
                      {done && <CheckIcon size={24} />}
                    </div>
                    <div style={{flex: 1}}>
                      <div style={{fontSize: 28, fontWeight: 700, color: C.ink, lineHeight: '42px'}}>{s.t}</div>
                      <div style={{fontSize: 22, color: C.slate, fontStyle: i === 0 ? 'italic' : 'normal'}}>{s.d}</div>
                      {i === 2 && f >= ticks[1] && (
                        <div style={{display: 'flex', alignItems: 'center', gap: 12, marginTop: 10}}>
                          <div style={{flex: 1, height: 12, borderRadius: 6, background: C.mist, overflow: 'hidden'}}>
                            <div style={{width: `${pct}%`, height: '100%', backgroundImage: GRAD}} />
                          </div>
                          <span style={{fontWeight: 700, fontSize: 22, color: C.primary, fontVariantNumeric: 'tabular-nums'}}>{pct}%</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </LightBg>
  );
};

// « Et voilà le résultat. » → Charlotte plays with her own voice
export const S2Result: React.FC<SceneProps> = ({lines, dur}) => {
  const f = useCurrentFrame();
  const play = lines[0].start + Math.round(lines[0].frames * 0) + 30; // matches config charlotteAt (1.0 s)
  const grow = prog(f, 0, 18);
  const big = prog(f, play - 10, 20, INOUT);
  const PW = interpolate(big, [0, 1], [440, 600]);
  const top = interpolate(big, [0, 1], [430, 280]);
  return (
    <StudioBg>
      <div style={{position: 'absolute', left: R.x, width: R.w, top: R.y + 20, textAlign: 'center', opacity: 1 - big, fontFamily: DISPLAY, fontWeight: 700, fontSize: 88, color: '#fff'}}>
        Le <span style={gradText()}>résultat.</span>
      </div>
      <div style={{position: 'absolute', left: SAFE_CX - PW / 2, top, transform: `scale(${0.85 + grow * 0.15})`, opacity: grow}}>
        <Phone src="ugc-charlotte.mp4" w={PW} from={play}>
          <div style={{position: 'absolute', top: 16, left: 16, opacity: interpolate(f, [dur - 20, dur - 8], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}}>
            <Pill tone="dark" size={18}>
              <span style={{width: 9, height: 9, borderRadius: 5, background: '#FF4D5E'}} /> Générée par Growthity
            </Pill>
          </div>
        </Phone>
      </div>
    </StudioBg>
  );
};

export const S2End: React.FC<SceneProps> = ({dur}) => (
  <EndCard
    dur={dur}
    tagline={
      <>
        2 minutes.
        <br />
        <span style={gradText()}>Zéro tournage.</span>
      </>
    }
  />
);
