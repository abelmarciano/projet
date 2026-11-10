import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, continueRender, delayRender, interpolate, staticFile, useCurrentFrame} from 'remotion';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/inter/800.css';
import '@fontsource/inter/900.css';
import '@fontsource/space-grotesk/700.css';
import {LogoMark, Wordmark} from '../components/UI';
import {prog, pop, EXPO, INOUT} from '../components/anim';
import {StudioBg, Dust, Phone, Kinetic, IgFeed, MetaMark} from './MotionChatPub';
import {Subs} from './AdEdit';
import L from './launch.json';

// « Growthity est en ligne » — launch reel v2: real Growthity UGC ads with their own voices, fast montage,
// how-it's-made motion (prompt → scan reveal), Meta publish + leads, end card. Female voice-over (Agathe).

type Word = {w: string; s: number; e: number};
type Clip = {src: string; from: number; to: number; label: string | null; words: Word[]};
const clips = L.clips as Clip[];
const VO = L.vo as Record<string, Word[]>;
const D = L.dur as {grid: number; make: number; pub: number; end: number; voC: number; stick: number[]; send: number; press: number; leads: number};
const GRAD = 'linear-gradient(120deg, #2563EB 0%, #5B3FE4 52%, #9333EA 100%)';
const GRAD_TXT = 'linear-gradient(100deg, #8FA6FF 0%, #A78BFF 45%, #E39BFF 100%)';
const DISPLAY = '"Space Grotesk", Inter, sans-serif';
const FONT = 'Inter, system-ui, sans-serif';
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const fr = (s: number) => Math.round(s * 30);

// ---------- timeline ----------
const GRID = ['media/gw/gw-35.mp4', 'media/gw/gw-03.mp4', 'media/gw/gw-49.mp4', 'media/gw/gw-07.mp4', 'media/gw/gw-42.mp4', 'media/gw/gw-39.mp4'];
const hook = clips[0];
const montage = clips.slice(1);
export const LR = (() => {
  const T: Record<string, number> = {};
  T.hookEnd = fr(hook.to - hook.from);
  T.aEnd = T.hookEnd + D.grid;
  let t = T.aEnd;
  T.mStart = t;
  montage.forEach((c) => (t += fr(c.to - c.from)));
  T.mEnd = t;
  T.bEnd = T.mEnd + D.make;
  T.cEnd = T.bEnd + D.pub;
  T.total = T.cEnd + D.end;
  return T;
})();

const useFonts = () => {
  const [h] = useState(() => delayRender('fonts'));
  useEffect(() => {
    Promise.all(['700 20px Inter', '800 20px Inter', '900 20px Inter', '700 20px "Space Grotesk"'].map((s) => document.fonts.load(s))).then(() => continueRender(h));
  }, [h]);
};

// a UGC clip, full screen, with its own sound, punch-in and subtitles
const ClipShot: React.FC<{c: Clip; i: number; subs?: boolean}> = ({c, i, subs = true}) => {
  const f = useCurrentFrame();
  const z = interpolate(f, [0, 7], [1.22, i % 2 ? 1.08 : 1.0], {...clamp, easing: EXPO}) + f * 0.0009;
  const dir = i % 2 ? -1 : 1;
  const wx = i ? interpolate(f, [0, 6], [dir * 260, 0], {...clamp, easing: EXPO}) : 0;
  const blur = i ? interpolate(f, [0, 6], [22, 0], clamp) : 0;
  const shake = f < 10 ? Math.sin(f * 2.3) * (10 - f) * 1.4 : 0;
  return (
    <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
      <AbsoluteFill style={{transform: `translate(${wx + shake}px, ${shake * 0.6}px) scale(${z})`, transformOrigin: '50% 40%', filter: blur ? `blur(${blur}px)` : undefined}}>
        <OffthreadVideo src={staticFile(c.src)} startFrom={fr(c.from)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      </AbsoluteFill>
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0.35) 0%, transparent 22%, transparent 62%, rgba(0,0,0,0.45) 100%)'}} />
      {subs && <Subs words={c.words} y={1300} />}
    </AbsoluteFill>
  );
};

// montage chrome: niche label + « aucune n'a été tournée » + made with Growthity
const MontageChrome: React.FC<{label: string | null; k: number}> = ({label, k}) => {
  const f = useCurrentFrame();
  const p = pop(f, 2, 12);
  return (
    <>
      <div style={{position: 'absolute', left: 50, top: 150, display: 'flex', alignItems: 'center', gap: 14, transform: `scale(${p})`, transformOrigin: 'left center'}}>
        <div style={{padding: '14px 26px', borderRadius: 999, background: 'rgba(255,255,255,0.94)', fontFamily: FONT, fontWeight: 800, fontSize: 34, color: '#0F172A', boxShadow: '0 14px 34px -14px rgba(0,0,0,0.6)'}}>{label}</div>
        <div style={{fontFamily: '"Geist Mono", ui-monospace, monospace', fontSize: 26, color: '#fff', fontWeight: 700, textShadow: '0 2px 12px rgba(0,0,0,0.7)'}}>0{k + 1}/0{montage.length}</div>
      </div>
      <div style={{position: 'absolute', right: 40, top: 152, display: 'flex', alignItems: 'center', gap: 10, padding: '12px 20px', borderRadius: 999, background: 'rgba(10,10,15,0.55)', backdropFilter: 'blur(10px)', border: '1.5px solid rgba(255,255,255,0.22)', color: '#fff', fontFamily: FONT, fontWeight: 700, fontSize: 24}}>
        <LogoMark size={30} color="#fff" /> Fait avec Growthity
      </div>
    </>
  );
};

// « Aucune de ces pubs n'a été tournée » : grid of the six ads
const GridScene: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <StudioBg intensity={1.2} />
      <div style={{position: 'absolute', left: 40, right: 40, top: 230, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, transform: `scale(${1 + f * 0.0012 + pop(f, D.stick[0], 8) * 0.03 - 0.03})`, transformOrigin: '50% 45%'}}>
        {GRID.map((src, i) => {
          const p = pop(f, 2 + i * 3, 13);
          return (
            <div key={i} style={{height: 560, borderRadius: 28, overflow: 'hidden', transform: `scale(${p}) rotate(${(i % 3 - 1) * 1.5}deg)`, boxShadow: '0 30px 70px -24px rgba(0,0,0,0.85), 0 0 0 2px rgba(255,255,255,0.12)'}}>
              <OffthreadVideo src={staticFile(src)} startFrom={15} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />
            </div>
          );
        })}
      </div>
      <Dust />
      {f >= D.stick[0] && (
        <div style={{position: 'absolute', left: 0, right: 0, top: 1240, display: 'flex', justifyContent: 'center', gap: 18}}>
          {['0 caméra', '0 studio'].map((t, k) => (
            <div key={k} style={{padding: '18px 34px', borderRadius: 999, backgroundImage: GRAD, color: '#fff', fontFamily: FONT, fontWeight: 900, fontSize: 52, transform: `scale(${pop(f, D.stick[k], 10)}) rotate(${k ? 3 : -3}deg)`, boxShadow: '0 20px 50px -14px rgba(91,63,228,0.9)'}}>{t}</div>
          ))}
        </div>
      )}
      <Kinetic words={VO['lr3-a-n']} at={4} y={1520} size={84} />
    </AbsoluteFill>
  );
};

// how it's made: prompt bar → scan reveal
const MakeScene: React.FC = () => {
  const f = useCurrentFrame();
  const text = 'Témoignage face caméra pour mes panneaux solaires : un client au bord du lac. Ton naturel.';
  const n = Math.floor(interpolate(f, [4, D.send - 12], [0, text.length], clamp));
  const send = D.send; // on « boum »
  const barOut = prog(f, send + 2, 12, INOUT);
  const appear = prog(f, send + 6, 16);
  const scan = interpolate(f, [send + 8, send + 48], [0, 1], {...clamp, easing: INOUT});
  const ready = f >= send + 50;
  const spin = f * 6;
  return (
    <AbsoluteFill>
      <StudioBg intensity={1.1} />
      <AbsoluteFill style={{perspective: 1800, alignItems: 'center', justifyContent: 'center'}}>
        <div style={{width: 940, transform: `translateY(-120px) rotateX(${interpolate(f, [0, 30], [16, 6], {...clamp, easing: EXPO})}deg) scale(${(0.9 + prog(f, 0, 16) * 0.1) * (1 - barOut * 0.2)})`, opacity: prog(f, 0, 12) * (1 - barOut), filter: `blur(${barOut * 10}px)`}}>
          <div style={{borderRadius: 44, background: '#fff', padding: '30px 30px 26px', boxShadow: '0 50px 140px -30px rgba(101,82,232,0.85)', fontFamily: FONT}}>
            <div style={{display: 'flex', gap: 12}}>
              <div style={{display: 'flex', alignItems: 'center', gap: 10, height: 72, padding: '0 20px 0 8px', borderRadius: 999, background: '#EEEBFF', border: '2px solid #D6CFFB', fontSize: 27, fontWeight: 600, color: '#0F172A'}}>
                <Img src={staticFile('media/gw/gw-28-face.jpg')} style={{width: 56, height: 56, borderRadius: 99, objectFit: 'cover'}} /> Acteur choisi
              </div>
              <div style={{display: 'flex', alignItems: 'center', height: 72, padding: '0 22px', borderRadius: 999, background: '#F1F3F9', border: '2px solid #E7E9EF', fontSize: 27, fontWeight: 600, color: '#0F172A'}}>Énergie solaire</div>
            </div>
            <div style={{display: 'flex', alignItems: 'flex-end', gap: 18, marginTop: 22}}>
              <div style={{flex: 1, minHeight: 150, fontSize: 40, lineHeight: 1.32, color: '#0F172A', fontWeight: 500}}>
                {text.slice(0, n)}
                <span style={{display: 'inline-block', width: 4, height: 44, marginLeft: 4, verticalAlign: '-6px', backgroundImage: GRAD, opacity: Math.floor(f / 7) % 2 ? 1 : 0.15}} />
              </div>
              <div style={{width: 104, height: 104, borderRadius: 30, background: GRAD, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${f >= send - 3 && f < send + 3 ? 0.86 : 1})`, boxShadow: '0 18px 40px -12px rgba(91,63,228,0.9)'}}>
                <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M6 11l6-6 6 6" /></svg>
              </div>
            </div>
          </div>
        </div>
      </AbsoluteFill>
      {f > send && (
        <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
          <div style={{position: 'relative', width: 560, height: 996, borderRadius: 44, padding: 5, background: `conic-gradient(from ${spin}deg, #2563EB, #5B3FE4, #9333EA, #E39BFF, #2563EB)`, transform: `translateY(-60px) scale(${0.85 + appear * 0.15})`, opacity: appear, boxShadow: '0 0 120px rgba(139,109,255,0.7)'}}>
            <div style={{position: 'relative', width: '100%', height: '100%', borderRadius: 39, overflow: 'hidden', background: '#000'}}>
              <Img src={staticFile('media/gw/gw-28-face.jpg')} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(26px) brightness(0.6)', transform: 'scale(1.15)'}} />
              <div style={{position: 'absolute', inset: 0, clipPath: `inset(0 0 ${(1 - scan) * 100}% 0)`}}>
                <OffthreadVideo src={staticFile('media/gw/gw-28.mp4')} startFrom={0} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />
              </div>
              {scan > 0 && scan < 1 && <div style={{position: 'absolute', left: 0, right: 0, top: `${scan * 100}%`, height: 6, marginTop: -3, background: 'linear-gradient(90deg, transparent, #fff, transparent)', boxShadow: '0 0 40px 14px rgba(167,139,255,0.9)'}} />}
              {!ready && <div style={{position: 'absolute', left: 28, bottom: 28, fontFamily: '"Geist Mono", ui-monospace, monospace', fontSize: 28, color: '#fff'}}>GÉNÉRATION {String(Math.round(scan * 100)).padStart(2, '0')} %</div>}
            </div>
            {ready && (
              <div style={{position: 'absolute', left: '50%', top: -34, transform: `translateX(-50%) scale(${pop(f, send + 50, 10)})`, display: 'flex', alignItems: 'center', gap: 12, padding: '14px 28px', borderRadius: 999, background: '#fff', fontFamily: FONT, fontWeight: 700, fontSize: 30, color: '#15803D'}}>
                <div style={{width: 16, height: 16, borderRadius: 99, background: '#22C55E', boxShadow: '0 0 12px #22C55E'}} /> Prête
              </div>
            )}
          </div>
        </AbsoluteFill>
      )}
      <Dust o={0.6} />
      <Kinetic words={VO['lr3-b-n']} at={4} y={1640} size={66} />
    </AbsoluteFill>
  );
};

// publish on Meta + leads coming in
const PubScene: React.FC = () => {
  const f = useCurrentFrame();
  const press = D.voC + D.press; // on « clic »
  const done = f >= press + 4;
  const fake = {video: 'gw/gw-27.mp4', brand: {name: 'Atelier Coton'}, caption: 'Le t-shirt qu’on ne quitte plus. Coton bio, coupe droite.'};
  const leads = [
    {n: 'Sophie M.', c: 'Lyon', col: '#F59E0B'},
    {n: 'Karim B.', c: 'Toulouse', col: '#10B981'},
    {n: 'Julie R.', c: 'Nantes', col: '#EC4899'},
  ];
  return (
    <AbsoluteFill>
      <StudioBg />
      <AbsoluteFill style={{perspective: 2000, alignItems: 'center'}}>
        <div style={{marginTop: 90, transform: `translateY(${(1 - prog(f, 0, 16)) * -200}px) rotateY(${interpolate(f, [0, 110], [12, 5], clamp)}deg) scale(${0.92 - prog(f, 60, 30, INOUT) * 0.12})`, opacity: prog(f, 0, 12)}}>
          <Phone w={540} glow={0.8}>
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <IgFeed c={fake as any} ctaHot={done ? 1 : 0} />
          </Phone>
        </div>
      </AbsoluteFill>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1290, display: 'flex', justifyContent: 'center'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 18, padding: '26px 48px', borderRadius: 999, background: done ? '#fff' : '#0866FF', color: done ? '#0F172A' : '#fff', fontFamily: FONT, fontWeight: 700, fontSize: 42, transform: `scale(${pop(f, 8, 13) * (f >= press - 3 && f < press + 3 ? 0.92 : 1)})`, boxShadow: `0 30px 70px -20px ${done ? 'rgba(255,255,255,0.35)' : 'rgba(8,102,255,0.9)'}`}}>
          {done ? (
            <>
              <div style={{width: 52, height: 52, borderRadius: 99, background: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
              </div>
              Publiée sur <MetaMark s={54} /> Meta
            </>
          ) : (
            <>
              <MetaMark s={58} mono="#fff" /> Publier sur Meta
            </>
          )}
        </div>
      </div>
      {leads.map((l, i) => {
        const at = D.voC + D.leads + i * 11; // « Et là… les leads tombent »
        if (f < at) return null;
        const p = prog(f, at, 14);
        const shift = [0, 1, 2].filter((j) => j > i).reduce((a, j) => a + prog(f, D.voC + D.leads + j * 11, 14) * 132, 0);
        return (
          <div key={i} style={{position: 'absolute', left: 70, right: 70, top: 120 + shift, display: 'flex', alignItems: 'center', gap: 20, padding: '20px 24px', borderRadius: 32, background: 'rgba(255,255,255,0.94)', boxShadow: '0 30px 60px -20px rgba(0,0,0,0.6)', fontFamily: FONT, transform: `translateY(${(1 - p) * -140}px)`, opacity: p, zIndex: 10 + i}}>
            <div style={{width: 64, height: 64, borderRadius: 16, background: '#fff', border: '2px solid #E7E9EF', display: 'flex', alignItems: 'center', justifyContent: 'center'}}><LogoMark size={40} /></div>
            <div style={{flex: 1}}>
              <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 22, color: '#64748B', fontWeight: 600}}><span>GROWTHITY</span><span>à l’instant</span></div>
              <div style={{fontSize: 29, fontWeight: 700, color: '#0F172A', marginTop: 2}}>Nouveau lead · {l.n}</div>
              <div style={{fontSize: 24, color: '#334155'}}>Formulaire Meta · {l.c}</div>
            </div>
          </div>
        );
      })}
      <Kinetic words={VO['lr3-c-n']} at={D.voC} y={1690} size={68} />
    </AbsoluteFill>
  );
};

const EndScene: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <StudioBg intensity={1.3} />
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', fontFamily: FONT}}>
        <div style={{width: 180, height: 180, borderRadius: 50, background: 'rgba(255,255,255,0.06)', border: '2px solid rgba(255,255,255,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${pop(f, 2, 12)})`, boxShadow: '0 40px 120px -30px rgba(101,82,232,0.9)'}}>
          <LogoMark size={100} draw={prog(f, 2, 18)} />
        </div>
        <div style={{marginTop: 44}}><Wordmark size={92} dark reveal={prog(f, 8, 16)} /></div>
        <div style={{marginTop: 56, fontFamily: DISPLAY, fontWeight: 700, fontSize: 104, lineHeight: 1.0, color: '#fff', textAlign: 'center', letterSpacing: '-0.02em', opacity: prog(f, 12, 12), transform: `translateY(${(1 - prog(f, 12, 16)) * 30}px)`}}>
          est <span style={{backgroundImage: GRAD_TXT, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>en ligne.</span>
        </div>
        <div style={{marginTop: 64, display: 'flex', alignItems: 'center', gap: 16, padding: '26px 50px', borderRadius: 999, backgroundImage: GRAD, color: '#fff', fontSize: 42, fontWeight: 700, transform: `scale(${pop(f, 26, 12)})`, boxShadow: '0 24px 60px -16px rgba(91,63,228,0.9)'}}>
          <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round"><path d="M12 19V5M6 11l6-6 6 6" /></svg>
          Lien en bio
        </div>
      </AbsoluteFill>
      <Dust />
      <AbsoluteFill style={{background: '#000', opacity: interpolate(f, [D.end - 10, D.end], [0, 1], clamp)}} />
    </AbsoluteFill>
  );
};

export const LaunchReel: React.FC = () => {
  useFonts();
  const f = useCurrentFrame();
  const T = LR;
  const cuts = [T.hookEnd, T.aEnd, ...montage.map((_, i) => T.mStart + montage.slice(0, i).reduce((a, c) => a + fr(c.to - c.from), 0)).slice(1), T.mEnd, T.bEnd, T.cEnd];
  const flash = Math.max(0, ...cuts.map((c) => 1 - Math.abs(f - c) / 4));
  let acc = T.mStart;
  return (
    <AbsoluteFill style={{background: '#0B0A0C'}}>
      <Sequence durationInFrames={T.hookEnd}>
        <ClipShot c={hook} i={0} />
        <div style={{position: 'absolute', left: 0, right: 0, top: 170, display: 'flex', justifyContent: 'center'}}>
          <div style={{padding: '12px 24px', borderRadius: 999, background: 'rgba(10,10,15,0.55)', backdropFilter: 'blur(10px)', color: '#fff', fontFamily: FONT, fontWeight: 700, fontSize: 26, opacity: interpolate(f, [30, 40], [0, 1], clamp)}}>Créée avec Growthity · zéro tournage</div>
        </div>
      </Sequence>
      <Sequence from={T.hookEnd} durationInFrames={T.aEnd - T.hookEnd}>
        <GridScene />
      </Sequence>
      {montage.map((c, k) => {
        const len = fr(c.to - c.from);
        const from = acc;
        acc += len;
        return (
          <Sequence key={k} from={from} durationInFrames={len}>
            <ClipShot c={c} i={k + 1} />
            <MontageChrome label={c.label} k={k} />
          </Sequence>
        );
      })}
      <Sequence from={T.mEnd} durationInFrames={T.bEnd - T.mEnd}>
        <MakeScene />
      </Sequence>
      <Sequence from={T.bEnd} durationInFrames={T.cEnd - T.bEnd}>
        <PubScene />
      </Sequence>
      <Sequence from={T.cEnd} durationInFrames={T.total - T.cEnd}>
        <EndScene />
      </Sequence>
      <AbsoluteFill style={{background: '#fff', opacity: flash * 0.4, pointerEvents: 'none'}} />
      <Sequence from={T.hookEnd + 4}><Audio src={staticFile('voice/lr3-a-n.mp3')} /></Sequence>
      <Sequence from={T.mEnd + 4}><Audio src={staticFile('voice/lr3-b-n.mp3')} /></Sequence>
      <Sequence from={T.bEnd + D.voC}><Audio src={staticFile('voice/lr3-c-n.mp3')} /></Sequence>
      <Sequence from={T.cEnd + 4}><Audio src={staticFile('voice/lr3-d-n.mp3')} /></Sequence>
      <Audio src={staticFile('chatpub/launch-bed.wav')} />
    </AbsoluteFill>
  );
};
