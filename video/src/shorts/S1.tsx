import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {StudioBg, LightBg} from '../components/Backgrounds';
import {prog, pop, INOUT} from '../components/anim';
import {C, DISPLAY, FONT, GRAD} from '../theme';
import {SceneProps, wordAt} from './timeline';
import {ACTORS, ActorTile, CheckIcon, EndCard, Phone, Pill, PromptBox, R, SAFE_CX, gradText} from './kit';

// « Aucune de ces personnes n'existe. » — full-bleed wall of AI actors
const COLS = [ACTORS.slice(0, 5), ACTORS.slice(5, 10), ACTORS.slice(10, 15)];
const TW = 330;
const TH = 586;

const Wall: React.FC<{tag: number}> = ({tag}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{transform: `scale(${1.12 - f * 0.0006}) rotate(-4deg)`}}>
      {COLS.map((col, c) => {
        const dir = c % 2 ? 1 : -1;
        const y0 = c % 2 ? -900 : -260;
        return (
          <div key={c} style={{position: 'absolute', left: -60 + c * (TW + 24), top: 0, display: 'flex', flexDirection: 'column', gap: 24, transform: `translateY(${y0 + dir * f * 1.6}px)`}}>
            {col.map((a, i) => {
              const p = pop(f, tag + (c * 5 + i) * 2.2, 13);
              return (
                <ActorTile key={a.name} src={a.src} w={TW} h={TH} loop={150}>
                  {tag > 0 && (
                    <div style={{position: 'absolute', top: 16, right: 16, transform: `scale(${p})`}}>
                      <Pill tone="grad" size={22}>IA</Pill>
                    </div>
                  )}
                </ActorTile>
              );
            })}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

export const S1Wall: React.FC<SceneProps> = ({lines}) => {
  const f = useCurrentFrame();
  const l2 = lines[1].start;
  const hookOut = prog(f, l2 - 6, 12, INOUT);
  const countIn = prog(f, l2, 16);
  const count = Math.round(interpolate(f, [wordAt(lines[1], 'cinq', 40) - 6, wordAt(lines[1], 'cinq', 40) + 14], [0, 500], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));
  return (
    <StudioBg>
      <Wall tag={wordAt(lines[1], 'acteurs', 10)} />
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(11,10,12,0.25) 0%, rgba(11,10,12,0.72) 30%, rgba(11,10,12,0.72) 52%, rgba(11,10,12,0.15) 72%, rgba(11,10,12,0.85) 100%)'}} />
      {/* hook: fully visible on frame 0 for the thumbnail */}
      <div style={{position: 'absolute', left: R.x, width: R.w, top: 430, textAlign: 'center', opacity: 1 - hookOut, transform: `translateY(${-hookOut * 60}px) scale(${1 + Math.min(f, 40) * 0.0012})`}}>
        <div style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 112, lineHeight: 1.02, color: '#fff', textShadow: '0 10px 40px rgba(0,0,0,0.6)'}}>
          Aucune de ces personnes <span style={gradText()}>n’existe.</span>
        </div>
      </div>
      <div style={{position: 'absolute', left: R.x, width: R.w, top: 400, textAlign: 'center', opacity: countIn, transform: `translateY(${(1 - countIn) * 40}px)`}}>
        <div style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 230, lineHeight: 1, ...gradText('linear-gradient(100deg, #9DB4FF, #C9A8FF 55%, #FF9ED2)'), fontVariantNumeric: 'tabular-nums'}}>{count}+</div>
        <div style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 70, color: '#fff', marginTop: 6}}>acteurs IA</div>
      </div>
    </StudioBg>
  );
};

// « Vous écrivez une phrase… » → the actress plays it
export const S1Phone: React.FC<SceneProps> = ({lines}) => {
  const f = useCurrentFrame();
  const send = Math.max(30, wordAt(lines[0], 'ils', 30) - 4);
  const phone = prog(f, send, 22);
  const ready = pop(f, lines[1].start + 2, 12);
  const PW = 420;
  return (
    <LightBg>
      <div style={{position: 'absolute', left: R.x, top: R.y + 10, transform: `scale(${1 - phone * 0.22}) translateY(${-phone * 40}px)`, transformOrigin: 'top center', opacity: 1 - phone * 0.15}}>
        <PromptBox text="Une actrice face caméra pour mes pompes à chaleur, avec sous-titres." start={2} cps={46} send={send} size={32} />
      </div>
      <div style={{position: 'absolute', left: SAFE_CX - PW / 2, top: 450, opacity: phone, transform: `translateY(${(1 - phone) * 240}px) scale(${0.9 + phone * 0.1 + ready * 0.04})`}}>
        <Phone src="ugc-charlotte.mp4" w={PW} from={send}>
          <div style={{position: 'absolute', top: 14, left: 14}}>
            <Pill tone="dark" size={17}>
              <span style={{width: 9, height: 9, borderRadius: 5, background: '#FF4D5E'}} /> Charlotte · IA
            </Pill>
          </div>
        </Phone>
      </div>
      <div style={{position: 'absolute', left: R.x, width: R.w, top: 1090, display: 'flex', justifyContent: 'center', transform: `scale(${ready})`}}>
        <Pill tone="green" size={30}>
          <CheckIcon size={28} /> Prête en 2 min
        </Pill>
      </div>
    </LightBg>
  );
};

export const S1End: React.FC<SceneProps> = ({dur}) => <EndCard dur={dur} />;
