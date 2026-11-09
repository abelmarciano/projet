import React from 'react';
import {AbsoluteFill, interpolate, Sequence, useCurrentFrame} from 'remotion';
import {LightBg, StudioBg} from '../components/Backgrounds';
import {Clip} from '../components/Media';
import {MetaLogo} from '../components/UI';
import {prog, pop, INOUT, mix} from '../components/anim';
import {C, DISPLAY, FONT, GRAD} from '../theme';
import {Line, SceneProps, wordAt} from './timeline';
import {ACTORS, ActorTile, CheckIcon, EndCard, Phone, Pill, PromptBox, R, SAFE_CX, gradText} from './kit';

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

// Stopwatch over the whole short: big in the hook, small at the top while we work, big again at the finish
export const S5Timer: React.FC<{lines: Line[]}> = ({lines}) => {
  const f = useCurrentFrame();
  const [a, b, c, d, e] = lines;
  const stop = e.words.find((w) => w.w.toLowerCase().startsWith('cinquante'))?.f ?? e.start + 30;
  const secs = interpolate(f, [a.start + a.frames - 6, b.start + b.frames, c.start + c.frames, d.start + d.frames, stop], [0, 22, 96, 114, 118], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const toTop = prog(f, a.start + a.frames - 10, 14, INOUT);
  const back = prog(f, e.start, 14, INOUT);
  const k = Math.max(0, toTop - back);
  const end = e.words.find((w) => w.w.toLowerCase().startsWith('growthity'))?.f ?? e.start + e.frames - 40;
  const gone = prog(f, end - 6, 8);
  const done = f >= stop;
  const tick = done ? pop(f, stop, 10) : 1;
  return (
    <div
      style={{
        position: 'absolute',
        left: SAFE_CX,
        top: mix(640, 262, k),
        transform: `translateX(-50%) scale(${mix(1, 0.4, k) * (done ? 0.9 + tick * 0.1 : 1)})`,
        transformOrigin: 'top center',
        opacity: 1 - gone,
        zIndex: 40,
        display: 'flex',
        alignItems: 'center',
        gap: 26,
        padding: '18px 46px',
        borderRadius: 999,
        background: done ? C.success : 'rgba(11,10,12,0.86)',
        boxShadow: '0 30px 80px -30px rgba(0,0,0,0.8)',
      }}
    >
      <svg width="96" height="96" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="13.5" r="8" stroke="#fff" strokeWidth={2} />
        <path d="M12 13.5V9" stroke="#fff" strokeWidth={2} strokeLinecap="round" transform={`rotate(${secs * 6} 12 13.5)`} />
        <path d="M9.5 2.5h5M12 2.5v3" stroke="#fff" strokeWidth={2} strokeLinecap="round" />
      </svg>
      <div style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 200, lineHeight: 1, color: '#fff', fontVariantNumeric: 'tabular-nums'}}>{fmt(secs)}</div>
    </div>
  );
};

// « Une pub Meta, de zéro à en ligne. Chrono ! »
export const S5Hook: React.FC<SceneProps> = ({lines}) => {
  const f = useCurrentFrame();
  const go = pop(f, wordAt(lines[0], 'chrono', 40), 10);
  return (
    <StudioBg>
      <div style={{position: 'absolute', left: R.x, width: R.w, top: 300, textAlign: 'center', fontFamily: DISPLAY, fontWeight: 700, fontSize: 96, lineHeight: 1.04, color: '#fff'}}>
        Une pub Meta, de <span style={gradText()}>zéro</span> à <span style={gradText()}>en ligne.</span>
      </div>
      <div style={{position: 'absolute', left: R.x, width: R.w, top: 940, display: 'flex', justifyContent: 'center', transform: `scale(${go})`}}>
        <Pill tone="grad" size={44}>Chrono !</Pill>
      </div>
    </StudioBg>
  );
};

// « Je décris mon produit. »
export const S5Describe: React.FC<SceneProps> = ({dur}) => (
  <LightBg>
    <div style={{position: 'absolute', left: R.x, top: 470, width: R.w}}>
      <PromptBox text="Pompes à chaleur financées par les aides. Vidéo UGC, actrice face caméra." start={0} cps={Math.max(45, (74 * 30) / Math.max(20, dur - 14))} send={dur - 6} size={34} />
    </div>
  </LightBg>
);

const SCRIPT = [
  ['HOOK', 'Si vous vous chauffez encore au gaz ou au fioul, écoutez bien.'],
  ['PREUVE', 'Jusqu’à 70 % d’économies sur le chauffage.'],
  ['CTA', 'Vérifiez votre éligibilité en 30 secondes.'],
];

// « L'IA écrit le script, choisit l'actrice, tourne la vidéo. »
export const S5Make: React.FC<SceneProps> = ({lines, dur}) => {
  const f = useCurrentFrame();
  const l = lines[0];
  const t1 = wordAt(l, 'script', 6) - 8;
  const t2 = wordAt(l, 'choisit', 30) - 4;
  const t3 = wordAt(l, 'tourne', 60) - 4;
  const panel = f < t2 ? 0 : f < t3 ? 1 : 2;
  const pin = prog(f, [t1, t2, t3][panel], 12);
  const reel = interpolate(f, [t2, t2 + Math.max(16, t3 - t2 - 8)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: INOUT});
  const faces = ACTORS.slice(0, 8);
  const pick = 6; // lands on Charlotte (inserted below)
  const list = [...faces.slice(0, pick), {src: 'ugc-charlotte.mp4', name: 'Charlotte'}, ...faces.slice(pick)];
  const TW = 250;
  return (
    <LightBg>
      <div style={{position: 'absolute', left: R.x, width: R.w, top: 420, textAlign: 'center', fontFamily: FONT, fontWeight: 800, fontSize: 30, letterSpacing: '0.14em', color: C.primary}}>
        {['1 · SCRIPT', '2 · ACTRICE', '3 · TOURNAGE'][panel]}
      </div>
      <div style={{position: 'absolute', left: R.x, width: R.w, top: 480, opacity: pin, transform: `translateX(${(1 - pin) * 120}px)`}}>
        {panel === 0 && (
          <div style={{background: '#fff', borderRadius: 30, padding: 34, boxShadow: '0 40px 90px -40px rgba(37,22,120,0.55)', fontFamily: FONT}}>
            {SCRIPT.map(([k, v], i) => {
              const p = prog(f, t1 + 4 + i * 9, 10);
              return (
                <div key={k} style={{opacity: p, transform: `translateY(${(1 - p) * 20}px)`, marginTop: i ? 26 : 0}}>
                  <div style={{fontSize: 20, fontWeight: 800, letterSpacing: '0.12em', ...gradText(GRAD)}}>{k}</div>
                  <div style={{fontSize: 33, lineHeight: 1.3, color: C.ink, fontWeight: 600, marginTop: 6}}>{v}</div>
                </div>
              );
            })}
          </div>
        )}
        {panel === 1 && (
          <div style={{position: 'relative', height: 640, overflow: 'hidden', marginLeft: -R.x, width: 1080}}>
            <div style={{position: 'absolute', top: 40, left: 540 - TW / 2, display: 'flex', gap: 22, transform: `translateX(${-reel * pick * (TW + 22)}px)`}}>
              {list.map((a, i) => {
                const on = i === pick && reel > 0.98;
                return <ActorTile key={a.name} src={a.src} name={a.name} w={TW} h={444} loop={150} style={{transform: `scale(${on ? 1.1 : 0.94})`, boxShadow: on ? `0 0 0 7px ${C.primary}, 0 40px 80px -30px rgba(101,82,232,0.9)` : undefined, opacity: on || reel < 0.98 ? 1 : 0.45}} />;
              })}
            </div>
          </div>
        )}
        {panel === 2 && (
          <div style={{display: 'flex', justifyContent: 'center'}}>
            <Phone src="ugc-charlotte.mp4" w={390} from={t3}>
              <div style={{position: 'absolute', inset: 0, background: '#0B0A0C', opacity: interpolate(f, [t3, t3 + 16], [0.85, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}), display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, fontWeight: 700, fontSize: 30, color: '#fff'}}>
                Tournage IA…
              </div>
            </Phone>
          </div>
        )}
      </div>
    </LightBg>
  );
};

// « Je choisis mon ciblage… et je publie. »
export const S5Publish: React.FC<SceneProps> = ({lines}) => {
  const f = useCurrentFrame();
  const l = lines[0];
  const click = wordAt(l, 'publie', 40);
  const live = f >= click;
  const chips = ['Paris (75)', 'Lyon (69)', 'Bordeaux (33)', '25-65 ans', 'Propriétaires'];
  const cx = interpolate(f, [click - 22, click - 3], [960, 520], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: INOUT});
  const cy = interpolate(f, [click - 22, click - 3], [1450, 1012], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: INOUT});
  return (
    <LightBg>
      <div style={{position: 'absolute', left: R.x, width: R.w, top: 430, background: '#fff', borderRadius: 32, padding: 34, boxShadow: '0 50px 120px -50px rgba(37,22,120,0.6)', fontFamily: FONT}}>
        <div style={{fontSize: 22, fontWeight: 800, letterSpacing: '0.14em', color: C.slate}}>CIBLAGE</div>
        <div style={{display: 'flex', flexWrap: 'wrap', gap: 14, marginTop: 20}}>
          {chips.map((c, i) => {
            const p = pop(f, 4 + i * 5, 12);
            return (
              <div key={c} style={{transform: `scale(${p})`, padding: '14px 22px', borderRadius: 999, background: '#EEEBFF', color: C.primary, fontWeight: 700, fontSize: 27}}>
                ✓ {c}
              </div>
            );
          })}
        </div>
        <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 28, marginTop: 30, paddingTop: 24, borderTop: `1px solid ${C.hairline}`}}>
          <span style={{color: C.slate}}>Budget</span>
          <b style={{color: C.ink}}>20 € / jour</b>
        </div>
        <div style={{marginTop: 30, height: 100, borderRadius: 24, backgroundImage: live ? 'linear-gradient(120deg,#19A866,#22C17A)' : GRAD, color: '#fff', fontWeight: 800, fontSize: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, transform: `scale(${f > click - 3 && f < click + 3 ? 0.95 : 1})`}}>
          {live ? (
            <>
              <CheckIcon size={34} /> Publiée
            </>
          ) : (
            <>
              <MetaLogo size={36} /> Publier sur Meta
            </>
          )}
        </div>
      </div>
      {f < click + 16 && (
        <svg width="56" height="56" viewBox="0 0 24 24" style={{position: 'absolute', left: cx, top: cy, filter: 'drop-shadow(0 6px 10px rgba(0,0,0,0.35))', transform: `scale(${f > click - 3 && f < click + 4 ? 0.85 : 1})`}}>
          <path d="M5 3l14 8-6 1.5L10 19z" fill="#0F172A" stroke="#fff" strokeWidth={1.5} strokeLinejoin="round" />
        </svg>
      )}
    </LightBg>
  );
};

// « En ligne. Une minute cinquante-huit. Growthity ! »
export const S5Finish: React.FC<SceneProps> = ({lines, dur}) => {
  const f = useCurrentFrame();
  const l = lines[0];
  const end = wordAt(l, 'growthity', dur - 40) - 6;
  const ok = pop(f, 2, 11);
  return (
    <>
      <StudioBg>
        <div style={{position: 'absolute', left: R.x, width: R.w, top: 300, textAlign: 'center', transform: `scale(${ok})`}}>
          <div style={{width: 150, height: 150, borderRadius: 75, background: C.success, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 0 18px rgba(34,193,122,0.2)'}}>
            <CheckIcon size={92} />
          </div>
          <div style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 110, color: '#fff', marginTop: 30}}>En ligne.</div>
        </div>
        <div style={{position: 'absolute', left: R.x, width: R.w, top: 1010, display: 'flex', justifyContent: 'center', gap: 14, opacity: prog(f, 10, 12)}}>
          <Pill size={26}>
            <MetaLogo size={28} /> Facebook · Instagram
          </Pill>
        </div>
      </StudioBg>
      <Sequence from={end} layout="none">
        <AbsoluteFill>
          <EndCard dur={dur - end} />
        </AbsoluteFill>
      </Sequence>
    </>
  );
};
