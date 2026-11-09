import React from 'react';
import {AbsoluteFill, interpolate, Sequence, useCurrentFrame} from 'remotion';
import {Clip} from '../components/Media';
import {GradButton, LogoMark, Wordmark, Sparkle} from '../components/UI';
import {prog, pop} from '../components/anim';
import {StudioBg} from '../components/Backgrounds';
import {C, DISPLAY, FONT, GRAD, GRAD_PINK} from '../theme';
import {SAFE, SAFE_CX} from '../vertical/safe';

// Visuals live above the caption band; captions sit in the lower part of the safe area
export const R = {x: SAFE.x, y: SAFE.y, w: SAFE.w, h: 930}; // 250 → 1180
export const CAP_Y = 1214;
export {SAFE, SAFE_CX};

export const gradText = (g = GRAD_PINK): React.CSSProperties => ({
  backgroundImage: g,
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  color: 'transparent',
});

// Every scene cuts in with a short punch (scale + blur), social style
export const Punch: React.FC<{children: React.ReactNode; strength?: number}> = ({children, strength = 1}) => {
  const f = useCurrentFrame();
  const p = prog(f, 0, 9);
  return (
    <AbsoluteFill style={{transform: `scale(${1 + (1 - p) * 0.07 * strength})`, filter: `blur(${(1 - p) * 8 * strength}px)`}}>{children}</AbsoluteFill>
  );
};

// TikTok-style captions: groups of up to 3 words, the spoken word lit up
type CapWord = {w: string; f: number; e: number};
export const Captions: React.FC<{words: CapWord[]; hideFrom?: number[][]; dark?: boolean}> = ({words, hideFrom = []}) => {
  const f = useCurrentFrame();
  if (hideFrom.some(([a, b]) => f >= a && f < b)) return null;
  // build groups: break after punctuation or every 3 words
  const groups: CapWord[][] = [];
  let cur: CapWord[] = [];
  words.forEach((w, i) => {
    cur.push(w);
    const next = words[i + 1];
    const brk = /[.,!?:…;]$/.test(w.w) || cur.length >= 3 || !next || next.f - w.e > 12;
    if (brk) {
      groups.push(cur);
      cur = [];
    }
  });
  const g = groups.find((gr, i) => {
    const end = groups[i + 1] ? Math.min(groups[i + 1][0].f, gr[gr.length - 1].e + 18) : gr[gr.length - 1].e + 18;
    return f >= gr[0].f - 2 && f < end;
  });
  if (!g) return null;
  const gin = pop(f, g[0].f - 2, 12);
  return (
    <div
      style={{
        position: 'absolute',
        left: SAFE.x - 10,
        width: SAFE.w + 20,
        top: CAP_Y,
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '6px 14px',
        transform: `scale(${0.85 + 0.15 * gin})`,
        zIndex: 50,
      }}
    >
      {g.map((w, i) => {
        const on = f >= w.f && f < w.e + 4;
        const said = f >= w.f;
        return (
          <span
            key={i}
            style={{
              fontFamily: DISPLAY,
              fontWeight: 700,
              fontSize: 70,
              lineHeight: 1.12,
              color: '#fff',
              padding: '0 12px',
              borderRadius: 16,
              backgroundImage: on ? GRAD : undefined,
              opacity: said ? 1 : 0.55,
              transform: `scale(${on ? 1.06 : 1}) rotate(${on ? -1.5 : 0}deg)`,
              textShadow: on ? 'none' : '0 3px 0 rgba(0,0,0,0.55), 0 0 18px rgba(0,0,0,0.55)',
              WebkitTextStroke: on ? undefined : '2px rgba(11,10,12,0.85)',
              paintOrder: 'stroke fill',
              boxShadow: on ? '0 14px 30px -10px rgba(91,63,228,0.8)' : undefined,
            }}
          >
            {w.w}
          </span>
        );
      })}
    </div>
  );
};

// A phone playing a clip (muted; sound, if any, comes from the mix)
export const Phone: React.FC<{src: string; w: number; from?: number; children?: React.ReactNode; style?: React.CSSProperties; startFrom?: number}> = ({
  src,
  w,
  from = 0,
  children,
  style,
  startFrom = 0,
}) => {
  const h = Math.round(((w - 24) * 16) / 9) + 24;
  return (
    <div style={{width: w, height: h, borderRadius: w * 0.1, padding: 12, background: '#0B0A0C', boxShadow: '0 50px 120px -40px rgba(37,22,120,0.75), 0 0 0 2px rgba(255,255,255,0.08)', ...style}}>
      <div style={{position: 'relative', width: '100%', height: '100%', borderRadius: w * 0.08, overflow: 'hidden', background: '#111'}}>
        <Sequence from={from} layout="none">
          <Clip src={src} width="100%" height="100%" startFrom={startFrom} style={{position: 'absolute', inset: 0}} />
        </Sequence>
        {children}
      </div>
    </div>
  );
};

export const Pill: React.FC<{children: React.ReactNode; tone?: 'light' | 'dark' | 'green' | 'grad'; size?: number; style?: React.CSSProperties}> = ({children, tone = 'light', size = 24, style}) => {
  const t = {
    light: {bg: '#fff', fg: C.ink},
    dark: {bg: 'rgba(11,10,12,0.72)', fg: '#fff'},
    green: {bg: C.success, fg: '#fff'},
    grad: {bg: undefined, fg: '#fff'},
  }[tone];
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 10,
        padding: `${size * 0.45}px ${size * 0.8}px`,
        borderRadius: 999,
        background: t.bg,
        backgroundImage: tone === 'grad' ? GRAD : undefined,
        color: t.fg,
        fontFamily: FONT,
        fontWeight: 700,
        fontSize: size,
        whiteSpace: 'nowrap',
        boxShadow: '0 16px 36px -14px rgba(15,23,42,0.55)',
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export const CheckIcon: React.FC<{size?: number}> = ({size = 22}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M5 12.5l4.5 4.5L19 7.5" stroke="#fff" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Prompt field with a typewriter and the Générer button
export const PromptBox: React.FC<{text: string; start: number; cps?: number; send?: number; width?: number; size?: number}> = ({text, start, cps = 40, send, width = R.w, size = 30}) => {
  const f = useCurrentFrame();
  const shown = text.slice(0, Math.max(0, Math.floor(((f - start) / 30) * cps)));
  const sent = send !== undefined && f >= send;
  return (
    <div
      style={{
        width,
        borderRadius: 26,
        background: '#fff',
        border: `2px solid ${sent ? C.hairline : C.primary}`,
        boxShadow: sent ? '0 20px 50px -30px rgba(15,23,42,0.5)' : '0 0 0 7px rgba(101,82,232,0.14), 0 30px 60px -30px rgba(37,22,120,0.5)',
        padding: '22px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: 18,
        fontFamily: FONT,
      }}
    >
      <div style={{fontSize: size, lineHeight: 1.35, color: C.ink, minHeight: size * 1.35 * 2}}>
        {shown}
        {!sent && <span style={{opacity: Math.floor(f / 8) % 2 ? 1 : 0, color: C.primary}}>|</span>}
      </div>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 10, color: C.slate, fontSize: 21, fontWeight: 600}}>
          <LogoMark size={28} /> Chat créatif
        </div>
        <div
          style={{
            height: 58,
            padding: '0 24px',
            borderRadius: 16,
            backgroundImage: GRAD,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            color: '#fff',
            fontWeight: 700,
            fontSize: 23,
            transform: `scale(${send !== undefined && f > send - 5 && f < send + 4 ? 0.9 : 1})`,
          }}
        >
          <Sparkle size={20} /> Générer
        </div>
      </div>
    </div>
  );
};

// Closing card: logo, CTA, "lien en bio"
export const EndCard: React.FC<{dur: number; tagline?: React.ReactNode}> = ({dur, tagline}) => {
  const f = useCurrentFrame();
  const mark = pop(f, 4, 12);
  const btn = pop(f, 18, 13);
  const bio = prog(f, 26, 16);
  return (
    <StudioBg>
      <AbsoluteFill style={{alignItems: 'center'}}>
        <div style={{position: 'absolute', top: 640, left: SAFE_CX - 450, width: 900, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(146,120,255,0.45) 0%, transparent 62%)', filter: 'blur(30px)'}} />
        <div style={{position: 'absolute', top: R.y, left: R.x, width: R.w, height: 1170, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
          {tagline && (
            <div style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 84, lineHeight: 1.05, color: '#fff', textAlign: 'center', marginBottom: 70, opacity: prog(f, 0, 12), transform: `translateY(${(1 - prog(f, 0, 14)) * 30}px)`}}>
              {tagline}
            </div>
          )}
          <div style={{display: 'flex', alignItems: 'center', gap: 16, transform: `scale(${mark})`}}>
            <LogoMark size={104} draw={prog(f, 2, 22)} />
            <Wordmark size={104} dark reveal={prog(f, 8, 18)} />
          </div>
          <div style={{marginTop: 56, transform: `scale(${btn})`}}>
            <GradButton style={{height: 100, fontSize: 38, padding: '0 58px'}}>
              Commencer
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
                <path d="M5 12h14M13 6l6 6-6 6" stroke="#fff" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </GradButton>
          </div>
          <div style={{marginTop: 46, display: 'flex', alignItems: 'center', gap: 14, fontFamily: FONT, fontWeight: 700, fontSize: 34, color: '#fff', opacity: bio, transform: `translateY(${(1 - bio) * 16}px)`}}>
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" style={{transform: `translateY(${Math.sin(f / 5) * 4}px)`}}>
              <path d="M12 19V5M6 11l6-6 6 6" stroke="#C9A8FF" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Lien en bio
          </div>
          <div style={{marginTop: 18, fontFamily: FONT, fontSize: 25, color: 'rgba(255,255,255,0.6)', opacity: bio}}>Conçu &amp; hébergé en France</div>
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{background: '#000', opacity: interpolate(f, [dur - 8, dur], [0, 0.85], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}} />
    </StudioBg>
  );
};

// Actor tile used by several shorts
export const ActorTile: React.FC<{src: string; name?: string; w: number; h: number; loop?: number; children?: React.ReactNode; style?: React.CSSProperties}> = ({src, name, w, h, loop, children, style}) => (
  <div style={{width: w, height: h, borderRadius: 22, overflow: 'hidden', position: 'relative', flexShrink: 0, border: '1px solid rgba(255,255,255,0.12)', ...style}}>
    <Clip src={src} width={w} height={h} loopFrames={loop} />
    {name && (
      <div style={{position: 'absolute', left: 10, bottom: 10, padding: '6px 12px', borderRadius: 12, background: 'rgba(11,10,12,0.6)', fontFamily: FONT, fontWeight: 700, fontSize: 18, color: '#fff'}}>{name}</div>
    )}
    {children}
  </div>
);

export const ACTORS = [
  {src: 'actor-antoine.mp4', name: 'Antoine'},
  {src: 'actor-emiko.mp4', name: 'Emiko'},
  {src: 'actor-freja.mp4', name: 'Freja'},
  {src: 'actor-thomas.mp4', name: 'Thomas'},
  {src: 'actor-camille.mp4', name: 'Camille'},
  {src: 'actor-hiro.mp4', name: 'Hiro'},
  {src: 'actor-claire.mp4', name: 'Claire'},
  {src: 'actor-lucas.mp4', name: 'Lucas'},
  {src: 'actor-anya.mp4', name: 'Anya'},
  {src: 'actor-david.mp4', name: 'David'},
  {src: 'actor-zoe.mp4', name: 'Zoé'},
  {src: 'actor-model-01.mp4', name: 'Alice'},
  {src: 'actor-marta.mp4', name: 'Marta'},
  {src: 'actor-emma.mp4', name: 'Emma'},
  {src: 'ugc-femme.mp4', name: 'Inès'},
];
