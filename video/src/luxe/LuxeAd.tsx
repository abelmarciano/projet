// Reel 9:16 « pub d'agence » : Amara à la plage, plans très courts calés sur le beat (125 bpm), étalonnage ciné,
// texte « Pendant que Growthity crée mes vidéos de pub pour ma marque » + notification + fin « Dès 19,99 €/mois ».
// Zones sûres Reels/TikTok : texte entre 300 et 1450 px de haut, marge droite 150 px. Aucun chiffre de résultat.
import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Audio, OffthreadVideo, Sequence, continueRender, delayRender, interpolate, spring, staticFile, useCurrentFrame} from 'remotion';
import '@fontsource/inter/500.css';
import '@fontsource/inter/700.css';
import '@fontsource/inter/800.css';
import '@fontsource/inter/900.css';
import {LogoMark, Wordmark} from '../components/UI';
import E from './edit.json';

type Shot = {src: string; from: number; dur: number; rate?: number; zoom?: [number, number]; x?: number; y?: number; flash?: boolean};
const ED = E as unknown as {shots: Shot[]; notifAt: number; notifDur: number; endDur: number};
const SH = (() => { let at = 0; return ED.shots.map((s) => { const r = {...s, at}; at += s.dur; return r; }); })();
const END = SH[SH.length - 1].at + SH[SH.length - 1].dur;
export const T = {end: END, total: END + ED.endDur};
const FONT = 'Inter, system-ui, sans-serif';
const SERIF = '"Playfair Display", Georgia, "Times New Roman", serif';
const GRAD = 'linear-gradient(120deg, #60A5FA 0%, #A78BFA 55%, #F0ABFC 100%)';
const sp = (f: number, d = 14, m = 0.6) => spring({frame: f, fps: 30, config: {damping: d, mass: m, stiffness: 190}});
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const useFonts = () => {
  const [h] = useState(() => delayRender('fonts'));
  useEffect(() => { Promise.all(['500 20px Inter', '700 20px Inter', '800 20px Inter', '900 20px Inter'].map((s) => document.fonts.load(s))).then(() => continueRender(h)); }, [h]);
};

const Clip: React.FC<{s: Shot}> = ({s}) => {
  const f = useCurrentFrame();
  const [z0, z1] = s.zoom ?? [1.06, 1.14];
  const z = interpolate(f, [0, s.dur], [z0, z1], clamp);
  const punch = interpolate(f, [0, 4], [1.05, 1], clamp);
  return (
    <AbsoluteFill style={{overflow: 'hidden', background: '#000'}}>
      <OffthreadVideo src={staticFile(`media/pov-luxe/${s.src}-raw.mp4`)} startFrom={Math.round(s.from * 30)} playbackRate={s.rate ?? 1} muted
        style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: `${s.x ?? 50}% ${s.y ?? 50}%`, transform: `scale(${z * punch})`, filter: 'contrast(1.08) saturate(1.12) brightness(1.03) sepia(0.08)'}} />
    </AbsoluteFill>
  );
};

// grain + vignette + bandes de lumière façon pellicule
const Look: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 42%, transparent 58%, rgba(10,5,0,0.42))'}} />
      <AbsoluteFill style={{background: `linear-gradient(${110 + Math.sin(f / 20) * 8}deg, rgba(255,190,120,0.10), transparent 40%, transparent 70%, rgba(255,150,90,0.08))`, mixBlendMode: 'screen'}} />
      <AbsoluteFill style={{opacity: 0.07, backgroundImage: `repeating-radial-gradient(circle at ${(f * 37) % 100}% ${(f * 53) % 100}%, #fff 0 1px, transparent 1px 3px)`}} />
    </>
  );
};

// texte : mots qui montent un par un, typo mixte sans + serif italique
const Line: React.FC<{at: number; children: React.ReactNode; size: number; serif?: boolean; delay?: number}> = ({at, children, size, serif, delay = 0}) => {
  const f = useCurrentFrame();
  const a = sp(f - at - delay, 16);
  return (
    <div style={{overflow: 'hidden', paddingBottom: 6}}>
      <div style={{transform: `translateY(${(1 - a) * 110}%)`, opacity: a, fontFamily: serif ? SERIF : FONT, fontStyle: serif ? 'italic' : 'normal', fontWeight: serif ? 500 : 900, fontSize: size, lineHeight: 1.02, letterSpacing: serif ? '-0.01em' : '-0.045em', color: '#fff', textShadow: '0 6px 30px rgba(0,0,0,.45), 0 2px 6px rgba(0,0,0,.35)'}}>{children}</div>
    </div>
  );
};
const Headline: React.FC = () => {
  const f = useCurrentFrame();
  const out = interpolate(f, [ED.notifAt - 10, ED.notifAt - 2], [1, 0], clamp);
  if (out <= 0) return null;
  return (
    <div style={{position: 'absolute', left: 80, right: 150, top: 990, opacity: out}}>
      <Line at={2} size={56} serif>Pendant que</Line>
      <Line at={2} delay={5} size={124}><span style={{backgroundImage: GRAD, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', textShadow: 'none', filter: 'drop-shadow(0 6px 24px rgba(0,0,0,.4))'}}>Growthity</span></Line>
      <Line at={2} delay={10} size={68}>crée mes vidéos de pub</Line>
      <Line at={2} delay={14} size={60} serif>pour ma marque…</Line>
    </div>
  );
};
const Second: React.FC = () => {
  const f = useCurrentFrame();
  const at = ED.notifAt + ED.notifDur + 4;
  if (f < at || f > END) return null;
  const out = interpolate(f, [END - 6, END], [1, 0], clamp);
  return (
    <div style={{position: 'absolute', left: 80, right: 150, top: 1120, opacity: out}}>
      <Line at={at} size={84} serif>…moi, je profite.</Line>
    </div>
  );
};

// notification iOS sur le plan du téléphone
const Notif: React.FC = () => {
  const f = useCurrentFrame();
  const at = ED.notifAt, d = ED.notifDur;
  if (f < at || f > at + d) return null;
  const a = sp(f - at, 13), out = interpolate(f, [at + d - 6, at + d], [1, 0], clamp);
  return (
    <div style={{position: 'absolute', left: 60, right: 150, top: 330, transform: `translateY(${(1 - a) * -160}px)`, opacity: out, fontFamily: FONT}}>
      <div style={{display: 'flex', gap: 22, alignItems: 'center', background: 'rgba(245,245,247,0.82)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', borderRadius: 40, padding: '24px 28px', boxShadow: '0 30px 70px -20px rgba(0,0,0,.55)'}}>
        <div style={{width: 84, height: 84, borderRadius: 20, background: '#fff', display: 'grid', placeItems: 'center', flex: 'none'}}><LogoMark size={56} /></div>
        <div style={{flex: 1, minWidth: 0}}>
          <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 28, fontWeight: 700, color: '#1C1C1E'}}><span>Growthity</span><span style={{color: '#8E8E93', fontWeight: 500}}>maintenant</span></div>
          <div style={{fontSize: 30, fontWeight: 700, color: '#1C1C1E', marginTop: 4}}>Ta nouvelle pub vidéo est prête ✨</div>
          <div style={{fontSize: 27, fontWeight: 500, color: '#3A3A3C', marginTop: 2}}>Acteur, voix, montage : tout est fait.</div>
        </div>
      </div>
    </div>
  );
};

// fin : verre dépoli sur le dernier plan
const End: React.FC = () => {
  const f = useCurrentFrame();
  const a = sp(f - 2, 15), b = sp(f - 10, 14), c = sp(f - 18, 13), d = sp(f - 28, 12);
  return (
    <AbsoluteFill style={{fontFamily: FONT, alignItems: 'center', justifyContent: 'center'}}>
      <AbsoluteFill style={{backdropFilter: `blur(${a * 18}px)`, WebkitBackdropFilter: `blur(${a * 18}px)`, background: `rgba(15,10,30,${a * 0.35})`}} />
      <div style={{position: 'relative', width: 820, marginTop: -60, textAlign: 'center', color: '#fff'}}>
        <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, opacity: a, transform: `scale(${0.85 + 0.15 * a})`}}><LogoMark size={72} color="#fff" /><Wordmark size={66} dark /></div>
        <div style={{marginTop: 46, fontFamily: SERIF, fontStyle: 'italic', fontSize: 62, lineHeight: 1.1, opacity: b, transform: `translateY(${(1 - b) * 30}px)`}}>Tes vidéos de pub,<br />créées par l'IA.</div>
        <div style={{marginTop: 44, opacity: c, transform: `scale(${0.8 + 0.2 * c})`}}>
          <div style={{fontSize: 34, fontWeight: 700, letterSpacing: '0.18em', color: 'rgba(255,255,255,.8)'}}>DÈS</div>
          <div style={{fontSize: 150, fontWeight: 900, letterSpacing: '-0.05em', lineHeight: 1}}><span style={{backgroundImage: GRAD, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent'}}>19,99 €</span><span style={{fontSize: 52, fontWeight: 800, color: 'rgba(255,255,255,.9)'}}> /mois</span></div>
        </div>
        <div style={{marginTop: 46, display: 'inline-block', background: '#fff', color: '#16141A', borderRadius: 999, padding: '24px 54px', fontWeight: 900, fontSize: 44, transform: `scale(${d})`, boxShadow: '0 24px 60px -20px rgba(0,0,0,.6)'}}>Lien en bio 👆</div>
      </div>
    </AbsoluteFill>
  );
};

export const LuxeAd: React.FC = () => {
  useFonts();
  const f = useCurrentFrame();
  const flash = SH.reduce((m, s) => (s.flash ? Math.max(m, interpolate(f, [s.at - 1, s.at, s.at + 3], [0, 0.55, 0], clamp)) : m), 0) + interpolate(f, [0, 4], [0.6, 0], clamp);
  const last = SH[SH.length - 1];
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {SH.map((s, i) => <Sequence key={i} from={s.at} durationInFrames={s.dur}><Clip s={s} /></Sequence>)}
      <Sequence from={END}><Clip s={{...last, from: last.from + (last.dur * (last.rate ?? 1)) / 30, dur: ED.endDur, zoom: [1.14, 1.2]}} /></Sequence>
      <Look />
      <Headline />
      <Notif />
      <Second />
      <Sequence from={END}><End /></Sequence>
      <AbsoluteFill style={{background: '#fff', opacity: flash, pointerEvents: 'none'}} />
      <Audio src={staticFile('media/pov-luxe/bed.wav')} />
    </AbsoluteFill>
  );
};
