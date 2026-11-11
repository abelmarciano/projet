import React from 'react';
import {AbsoluteFill, Audio, OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import '@fontsource/inter/600.css';
import '@fontsource/inter/800.css';
import '@fontsource/inter/900.css';
import {pop, prog, EXPO, INOUT} from '../components/anim';
import {AdEdit, AdCfg} from './AdEdit';
import {EndCard} from './Pub3D';
import {StudioBg, Dust, Phone, IgFeed, MetaMark, Kinetic} from './MotionChatPub';
import J from './avap2.json';

// Avant / après v2 : « faire sa pub seule » (tournage au trépied, montage tard le soir, gestionnaire de pubs, stats) vs Growthity
// en motion design (une phrase → génération → checklist → la pub montée → publiée sur Meta).
type Word = {w: string; s: number; e: number};
const VO = J.vo as Record<string, Word[]>;
const AFTER = J.after as unknown as AdCfg;
const GRAD = 'linear-gradient(120deg, #2563EB 0%, #5B3FE4 52%, #9333EA 100%)';
const FONT = 'Inter, system-ui, sans-serif';
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const RATE = 0.96;
export const AV2 = (() => {
  const T: Record<string, number> = {};
  T.before = 468; T.tr = T.before; T.prompt = T.tr + 34; T.ad = T.prompt + 196; T.pub = T.ad + AFTER.frames; T.end = T.pub + 104; T.total = T.end + 105;
  return T;
})();
const STAGE_T = ['Tournage', 'Montage', 'Publicité Meta', 'Statistiques'];

const Clock: React.FC<{s: number}> = ({s}) => {
  const f = useCurrentFrame();
  return (
    <svg width={s} height={s} viewBox="0 0 40 40"><circle cx="20" cy="20" r="17" fill="#fff" stroke="#17161D" strokeWidth="3" />
      <line x1="20" y1="20" x2="20" y2="9" stroke="#17161D" strokeWidth="3" strokeLinecap="round" transform={`rotate(${f * 30} 20 20)`} />
      <line x1="20" y1="20" x2="28" y2="20" stroke="#E5432F" strokeWidth="3" strokeLinecap="round" transform={`rotate(${f * 2.5} 20 20)`} /></svg>
  );
};

export const Before: React.FC<{len?: number}> = ({len = 468}) => {
  const f = useCurrentFrame();
  const STAGES = STAGE_T.map((t, i) => ({t, at: Math.round((i * 4 * 30 * len) / 450)}));
  const st = [...STAGES].reverse().find((x) => f >= x.at)!;
  const idx = STAGES.indexOf(st);
  const timeBar = interpolate(f, [0, len], [0.04, 1], clamp);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <AbsoluteFill style={{filter: 'saturate(.8) contrast(.95)'}}>
        <OffthreadVideo src={staticFile('media/fal/avap/galere-raw.mp4')} muted playbackRate={450 / len} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      </AbsoluteFill>
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,.45), transparent 26%, transparent 70%, rgba(0,0,0,.55))'}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 210, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18}}>
        <div style={{padding: '12px 24px', borderRadius: 999, background: '#E5432F', color: '#fff', fontFamily: FONT, fontWeight: 900, fontSize: 36, letterSpacing: '.03em'}}>AVANT · faire sa pub seule</div>
        <div key={idx} style={{display: 'flex', alignItems: 'center', gap: 16, padding: '14px 26px 14px 16px', borderRadius: 22, background: '#fff', fontFamily: FONT, fontWeight: 800, fontSize: 46, color: '#17161D', transform: `scale(${pop(f, st.at, 12)})`, boxShadow: '0 18px 44px -14px rgba(0,0,0,.6)'}}>
          <Clock s={54} /><span style={{color: '#9A9DAA'}}>{idx + 1}/4</span>{st.t}
        </div>
      </div>
      {f > 40 && f < 118 && <div style={{position: 'absolute', right: 70, top: 560, padding: '10px 18px', borderRadius: 12, background: '#17161D', color: '#fff', fontFamily: FONT, fontWeight: 800, fontSize: 34, transform: `rotate(6deg) scale(${pop(f, 40, 12)})`}}>Prise n°7 🎬</div>}
      <div style={{position: 'absolute', left: 90, right: 90, top: 1420, display: 'grid', gap: 10}}>
        <div style={{display: 'flex', justifyContent: 'space-between', color: '#fff', fontFamily: FONT, fontWeight: 700, fontSize: 28, textShadow: '0 2px 10px rgba(0,0,0,.6)'}}><span>Temps passé</span><span>⏳</span></div>
        <div style={{height: 14, borderRadius: 8, background: 'rgba(255,255,255,.25)', overflow: 'hidden'}}><div style={{height: '100%', width: `${timeBar * 100}%`, background: '#E5432F', borderRadius: 8}} /></div>
      </div>
    </AbsoluteFill>
  );
};

const Tr: React.FC = () => {
  const f = useCurrentFrame();
  const p = prog(f, 0, 12);
  return (
    <AbsoluteFill style={{background: GRAD, alignItems: 'center', justifyContent: 'center'}}>
      <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 110, color: '#fff', letterSpacing: '-.04em', textAlign: 'center', lineHeight: 1, transform: `scale(${0.7 + p * 0.3})`, opacity: p}}>Et avec<br />Growthity ?</div>
    </AbsoluteFill>
  );
};

const CHECK = [{t: 'Actrice', w: 'Actrice,'}, {t: 'Voix', w: 'voix,'}, {t: 'Sous-titres', w: 'sous-titres,'}, {t: 'Montage', w: 'montage…'}];
const Prompt: React.FC = () => {
  const f = useCurrentFrame();
  const text = 'Une pub UGC pour mon gel corps, actrice naturelle, ton enthousiaste.';
  const n = Math.floor(interpolate(f, [4, 52], [0, text.length], clamp));
  const send = 56;
  const barUp = prog(f, send + 2, 14, INOUT);
  const appear = prog(f, send + 6, 16);
  const scan = interpolate(f, [send + 10, send + 50], [0, 1], {...clamp, easing: INOUT});
  const vb2 = 66; // b2 voice starts here
  const b2 = VO['av2-b2'];
  const tickAt = (w: string) => vb2 + Math.round((b2.find((x) => x.w === w)?.s ?? 0) * 30);
  const ready = f >= vb2 + Math.round((b2[b2.length - 1].s) * 30);
  return (
    <AbsoluteFill>
      <StudioBg intensity={1.2} />
      <AbsoluteFill style={{alignItems: 'center'}}>
        <div style={{marginTop: interpolate(barUp, [0, 1], [760, 190]), width: 940, transform: `scale(${1 - barUp * 0.14})`}}>
          <div style={{borderRadius: 40, background: '#fff', padding: '26px 28px', boxShadow: '0 40px 120px -30px rgba(101,82,232,.85)', fontFamily: FONT, display: 'flex', alignItems: 'flex-end', gap: 18}}>
            <div style={{flex: 1, minHeight: 104, fontSize: 38, lineHeight: 1.32, color: '#0F172A', fontWeight: 500}}>{text.slice(0, n)}<span style={{display: 'inline-block', width: 4, height: 42, marginLeft: 4, verticalAlign: '-6px', background: '#5B3FE4', opacity: Math.floor(f / 7) % 2 ? 1 : 0.15}} /></div>
            <div style={{width: 96, height: 96, borderRadius: 28, background: GRAD, display: 'grid', placeItems: 'center', transform: `scale(${f >= send - 3 && f < send + 3 ? 0.86 : 1})`}}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M6 11l6-6 6 6" /></svg>
            </div>
          </div>
        </div>
      </AbsoluteFill>
      {f > send && (
        <div style={{position: 'absolute', left: 70, top: 470, width: 470, height: 836, borderRadius: 40, padding: 5, background: `conic-gradient(from ${f * 6}deg, #2563EB, #5B3FE4, #9333EA, #E39BFF, #2563EB)`, transform: `scale(${0.85 + appear * 0.15})`, opacity: appear, boxShadow: '0 0 110px rgba(139,109,255,.65)'}}>
          <div style={{position: 'relative', width: '100%', height: '100%', borderRadius: 35, overflow: 'hidden', background: '#111'}}>
            <div style={{position: 'absolute', inset: 0, clipPath: `inset(0 0 ${(1 - scan) * 100}% 0)`}}>
              <OffthreadVideo src={staticFile('media/fal/avap/apres-raw.mp4')} muted startFrom={20} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
            </div>
            {scan > 0 && scan < 1 && <div style={{position: 'absolute', left: 0, right: 0, top: `${scan * 100}%`, height: 6, marginTop: -3, background: 'linear-gradient(90deg, transparent, #fff, transparent)', boxShadow: '0 0 40px 14px rgba(167,139,255,.9)'}} />}
          </div>
        </div>
      )}
      <div style={{position: 'absolute', left: 590, right: 60, top: 560, display: 'grid', gap: 22}}>
        {CHECK.map((c, i) => { const a = tickAt(c.w); const on = f >= a; const p = pop(f, a, 12);
          return (
            <div key={i} style={{display: 'flex', alignItems: 'center', gap: 18, padding: '18px 22px', borderRadius: 22, background: on ? 'rgba(255,255,255,.96)' : 'rgba(255,255,255,.08)', border: '1.5px solid rgba(255,255,255,.18)', fontFamily: FONT, fontWeight: 800, fontSize: 40, color: on ? '#17161D' : 'rgba(255,255,255,.45)', transform: `scale(${on ? 0.92 + p * 0.08 : 0.92})`, opacity: f > send + 10 ? 1 : 0}}>
              <div style={{width: 46, height: 46, borderRadius: 99, display: 'grid', placeItems: 'center', background: on ? '#16A35B' : 'rgba(255,255,255,.15)', flex: 'none'}}>
                {on && <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>}
              </div>{c.t}
            </div>
          ); })}
        {ready && <div style={{marginTop: 8, justifySelf: 'start', padding: '16px 30px', borderRadius: 999, background: GRAD, color: '#fff', fontFamily: FONT, fontWeight: 900, fontSize: 44, transform: `scale(${pop(f, vb2 + Math.round(b2[b2.length - 1].s * 30), 12)})`, boxShadow: '0 20px 50px -14px rgba(91,63,228,.9)'}}>Prête ✨</div>}
      </div>
      <Dust o={0.6} />
    </AbsoluteFill>
  );
};

const Pub: React.FC = () => {
  const f = useCurrentFrame();
  const press = 34; const done = f >= press + 4;
  const c = {video: 'fal/avap/mei-raw.mp4', brand: {name: 'Lili Margo'}, caption: 'La texture est hyper fraîche, et l’odeur, j’adore.'};
  return (
    <AbsoluteFill>
      <StudioBg />
      <AbsoluteFill style={{alignItems: 'center'}}>
        <div style={{marginTop: 120, transform: `translateY(${(1 - prog(f, 0, 16)) * -160}px)`, opacity: prog(f, 0, 12)}}>
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <Phone w={520} glow={0.8}><IgFeed c={c as any} ctaHot={done ? 1 : 0} /></Phone>
        </div>
      </AbsoluteFill>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1300, display: 'flex', justifyContent: 'center'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 18, padding: '26px 48px', borderRadius: 999, background: done ? '#fff' : '#0866FF', color: done ? '#0F172A' : '#fff', fontFamily: FONT, fontWeight: 700, fontSize: 44, transform: `scale(${pop(f, 8, 13) * (f >= press - 3 && f < press + 3 ? 0.92 : 1)})`, boxShadow: '0 30px 70px -20px rgba(8,102,255,.8)'}}>
          {done ? <>✅ Publiée sur <MetaMark s={54} /> Meta</> : <><MetaMark s={58} mono="#fff" /> Publier sur Meta</>}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const AvantApres2: React.FC = () => {
  const f = useCurrentFrame();
  const T = AV2;
  const cuts = [T.tr, T.prompt, T.ad, T.pub, T.end];
  const flash = Math.max(0, ...cuts.map((c) => 1 - Math.abs(f - c) / 4));
  const vo = (k: string, at: number) => <Sequence key={k} from={at}><Audio src={staticFile(`voice/${k}-n.mp3`)} /></Sequence>;
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Sequence durationInFrames={T.before}><Before /></Sequence>
      <Sequence from={T.tr} durationInFrames={T.prompt - T.tr}><Tr /></Sequence>
      <Sequence from={T.prompt} durationInFrames={T.ad - T.prompt}><Prompt /></Sequence>
      <Sequence from={T.ad} durationInFrames={AFTER.frames}>
        <AdEdit cfg={AFTER} />
        <div style={{position: 'absolute', left: 0, right: 0, top: 230, display: 'flex', justifyContent: 'center'}}><div style={{padding: '12px 24px', borderRadius: 999, background: GRAD, color: '#fff', fontFamily: FONT, fontWeight: 900, fontSize: 36}}>APRÈS · fait avec Growthity ✨</div></div>
      </Sequence>
      <Sequence from={T.pub} durationInFrames={T.end - T.pub}><Pub /></Sequence>
      <Sequence from={T.end}><EndCard d={T.total - T.end} /></Sequence>
      {/* voice-over captions (narrator) */}
      <Kinetic words={VO['av2-a1']} at={6} y={1180} size={64} />
      <Kinetic words={VO['av2-a2']} at={165} y={1180} size={64} />
      <Kinetic words={VO['av2-a3']} at={255} y={1180} size={64} />
      <Kinetic words={VO['av2-a4']} at={342} y={1180} size={64} />
      <Kinetic words={VO['av2-b3']} at={T.pub + 6} y={1560} size={64} />
      <AbsoluteFill style={{background: '#fff', opacity: flash * 0.5, pointerEvents: 'none'}} />
      {[vo('av2-a1', 6), vo('av2-a2', 165), vo('av2-a3', 255), vo('av2-a4', 342), vo('av2-b1', T.tr + 2), vo('av2-b2', T.prompt + 66), vo('av2-b3', T.pub + 6), vo('av2-b4', T.end + 4)]}
      <Audio src={staticFile('media/fal/avap/galere-raw.mp4')} volume={0.25} playbackRate={RATE} />
      <Audio src={staticFile('chatpub/avap2-bed.wav')} />
    </AbsoluteFill>
  );
};
