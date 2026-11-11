// Split-screen « créateur » : en haut, motion design du chat Growthity qui fabrique une pub ; en bas, l'acteur face caméra.
// Sous-titres façon reel (mots en boîte noire) à la jointure. Les temps viennent de split.json (mots transcrits + repères).
import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, continueRender, delayRender, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing} from 'remotion';

type Word = {w: string; s: number; e: number};
export type SplitCfg = {
  video: string; videoStart?: number; total: number; words: Word[]; audio: string; bed?: string;
  cues: Record<string, number>; prompt: string; adVideo: string;
  actor: {name: string; img: string; style: string}; brand: string; script: string[]; hot?: string[];
  seam: number; steps?: [string, string][]; punches?: string[];
};

export const FONT = 'Inter, system-ui, sans-serif';
export const DISPLAY = '"Space Grotesk", Inter, sans-serif';
export const GRAD = 'linear-gradient(120deg, #2563EB 0%, #5B3FE4 52%, #9333EA 100%)';
export const INK = '#0F172A';
export const MUTED = '#64748B';
export const LINE = '#E6E8EF';
export const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const prog = (f: number, a: number, d: number) => interpolate(f, [a, a + d], [0, 1], {...clamp, easing: Easing.bezier(0.22, 1, 0.36, 1)});

export const useFonts = () => {
  const [h] = useState(() => delayRender('fonts'));
  useEffect(() => {
    Promise.all(['500 20px Inter', '600 20px Inter', '700 20px Inter', '800 20px Inter', '700 20px "Space Grotesk"'].map((s) => document.fonts.load(s))).then(() => continueRender(h));
  }, [h]);
};

export const Check: React.FC<{s?: number; c?: string}> = ({s = 26, c = '#16A34A'}) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
);
export const Spinner: React.FC<{f: number; s?: number}> = ({f, s = 24}) => (
  <div style={{width: s, height: s, borderRadius: 99, border: '3px solid #DDD6FE', borderTopColor: '#6552E8', transform: `rotate(${f * 14}deg)`}} />
);
export const Logo: React.FC<{s: number}> = ({s}) => (
  <div style={{width: s, height: s, borderRadius: s * 0.28, background: GRAD, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: DISPLAY, fontWeight: 700, fontSize: s * 0.56}}>G</div>
);
export const MetaMark: React.FC<{s: number}> = ({s}) => (
  <svg width={s * 1.6} height={s} viewBox="0 0 64 40"><path d="M8 30c0-12 6-22 13-22 6 0 10 7 13 12 3-5 7-12 13-12 7 0 11 10 11 18 0 6-2 10-7 10-6 0-10-8-17-19C27 26 23 38 15 38 10 38 8 35 8 30z" fill="none" stroke="#0866FF" strokeWidth="5.5" strokeLinejoin="round" /></svg>
);
export const Cursor: React.FC<{x: number; y: number; down: number}> = ({x, y, down}) => (
  <div style={{position: 'absolute', left: x, top: y, transform: `scale(${1 - down * 0.18})`, transformOrigin: '6px 4px', filter: 'drop-shadow(0 6px 10px rgba(0,0,0,0.35))', zIndex: 50}}>
    <svg width="52" height="60" viewBox="0 0 26 30"><path d="M3 2l19 14-8.5 1.4L18 27l-4 1.8-4.6-9.8L3 25z" fill="#111" stroke="#fff" strokeWidth="2" strokeLinejoin="round" /></svg>
    {down > 0.01 && <div style={{position: 'absolute', left: -22, top: -24, width: 54, height: 54, borderRadius: 99, border: '4px solid rgba(101,82,232,0.8)', opacity: 1 - down, transform: `scale(${0.5 + down})`}} />}
  </div>
);

// ---------- top: the app window ----------
const AppWindow: React.FC<{cfg: SplitCfg}> = ({cfg}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const C = (k: string) => Math.round((cfg.cues[k] ?? 99) * fps);
  const write = C('write'), send = C('send'), actor = C('actor'), script = C('script'), voice = C('voice'), subs = C('subs'), ready = C('ready'), click = C('click'), meta = C('meta');

  // typing
  const typeEnd = send - 8;
  const nChars = Math.round(interpolate(f, [write, typeEnd], [0, cfg.prompt.length], clamp));
  const typed = cfg.prompt.slice(0, nChars);
  const sent = f >= send;
  const thread = prog(f, send, 14);

  // cursor path
  const W = 1000;
  const pts: [number, number, number][] = [
    [0, 760, 640], [write - 6, 520, 560], [send - 14, 880, 640], [send, 880, 640],
    [ready + 10, 860, 560], [click - 10, 780, 700], [click, 780, 700], [meta + 20, 840, 760],
  ];
  const fr = pts.map((p) => p[0]);
  const cx = interpolate(f, fr, pts.map((p) => p[1]), {...clamp, easing: Easing.inOut(Easing.cubic)});
  const cy = interpolate(f, fr, pts.map((p) => p[2]), {...clamp, easing: Easing.inOut(Easing.cubic)});
  const down = Math.max(interpolate(f, [send - 2, send + 10], [1, 0], clamp) * (f >= send - 2 ? 1 : 0), interpolate(f, [click - 2, click + 10], [1, 0], clamp) * (f >= click - 2 ? 1 : 0));

  const doneAt = (k: number) => f >= k;
  const rows: {k: number; label: string; detail: React.ReactNode}[] = [
    {k: actor, label: 'Acteur', detail: (
      <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
        <Img src={staticFile(`media/${cfg.actor.img}`)} style={{width: 46, height: 46, borderRadius: 12, objectFit: 'cover'}} />
        <div><div style={{fontWeight: 700, fontSize: 24, color: INK}}>{cfg.actor.name}</div><div style={{fontSize: 19, color: MUTED}}>{cfg.actor.style}</div></div>
      </div>)},
    {k: script, label: 'Script', detail: (
      <div style={{fontSize: 20, lineHeight: 1.35, color: '#334155'}}>
        {cfg.script.map((l, i) => <div key={i} style={{opacity: prog(f, script + i * 5, 8), transform: `translateY(${(1 - prog(f, script + i * 5, 8)) * 8}px)`}}>« {l} »</div>)}
      </div>)},
    {k: voice, label: 'Voix', detail: (
      <div style={{display: 'flex', alignItems: 'center', gap: 4, height: 36}}>
        {Array.from({length: 26}).map((_, i) => <div key={i} style={{width: 6, borderRadius: 3, background: '#7C6CF0', height: 8 + Math.abs(Math.sin(i * 1.7 + f * 0.35)) * 26 * prog(f, voice, 10)}} />)}
      </div>)},
    {k: subs, label: 'Sous-titres', detail: (
      <div style={{display: 'flex', gap: 6}}>
        {['MOT', 'PAR', 'MOT'].map((w, i) => <span key={i} style={{background: i === 1 ? '#FACC15' : INK, color: i === 1 ? INK : '#fff', fontFamily: DISPLAY, fontWeight: 700, fontSize: 20, padding: '3px 9px', borderRadius: 6, opacity: prog(f, subs + i * 4, 6)}}>{w}</span>)}
      </div>)},
  ];

  // preview card
  const isReady = f >= ready;
  const cardIn = prog(f, send + 6, 16);
  const launched = prog(f, meta, 14);

  return (
    <div style={{position: 'absolute', left: 40, top: 140, width: W, height: 820, borderRadius: 30, background: '#fff', boxShadow: '0 40px 90px -30px rgba(15,23,42,0.45), 0 0 0 1.5px rgba(15,23,42,0.08)', overflow: 'hidden', fontFamily: FONT}}>
      {/* title bar */}
      <div style={{height: 64, display: 'flex', alignItems: 'center', padding: '0 24px', gap: 10, borderBottom: `1.5px solid ${LINE}`, background: '#FAFAFC'}}>
        {['#FF5F57', '#FEBC2E', '#28C840'].map((c) => <div key={c} style={{width: 16, height: 16, borderRadius: 99, background: c}} />)}
        <div style={{flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10, fontWeight: 700, fontSize: 24, color: INK, marginRight: 70}}>
          <Logo s={30} /> {cfg.brand}
        </div>
      </div>

      {/* home screen */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 64, bottom: 0, opacity: 1 - thread, transform: `translateY(${-thread * 40}px)`}}>
        <div style={{position: 'absolute', left: 0, right: 0, top: 120, textAlign: 'center', fontFamily: DISPLAY, fontWeight: 700, fontSize: 52, color: INK, letterSpacing: '-0.02em'}}>
          Que veux-tu créer <span style={{backgroundImage: GRAD, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>aujourd'hui</span> ?
        </div>
        <div style={{position: 'absolute', left: 70, right: 70, top: 250, borderRadius: 28, border: `2px solid ${f >= write ? '#C4B5FD' : LINE}`, boxShadow: f >= write ? '0 0 0 6px rgba(124,108,240,0.12), 0 24px 50px -24px rgba(91,63,228,0.5)' : '0 10px 30px -18px rgba(15,23,42,0.3)', padding: '26px 28px 22px', background: '#fff'}}>
          <div style={{minHeight: 120, fontSize: 32, lineHeight: 1.35, fontWeight: 500, color: typed ? INK : '#94A3B8'}}>
            {typed || 'Décris la pub que tu veux…'}{f >= write && !sent && <span style={{opacity: Math.floor(f / 8) % 2 ? 1 : 0, color: '#6552E8'}}>|</span>}
          </div>
          <div style={{display: 'flex', alignItems: 'center', gap: 12, marginTop: 10}}>
            {['🏷️ Ma marque', '👤 Ajouter un acteur', '📦 Catalogue'].map((t) => <div key={t} style={{padding: '10px 18px', borderRadius: 99, background: '#F1F3F9', border: `1.5px solid ${LINE}`, fontSize: 21, fontWeight: 600, color: '#334155'}}>{t}</div>)}
            <div style={{flex: 1}} />
            <div style={{width: 70, height: 70, borderRadius: 22, background: typed ? GRAD : '#F1F3F9', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: typed ? '0 14px 30px -10px rgba(91,63,228,0.8)' : 'none'}}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={typed ? '#fff' : '#94A3B8'} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M6 11l6-6 6 6" /></svg>
            </div>
          </div>
        </div>
      </div>

      {/* thread screen */}
      {thread > 0 && (
        <div style={{position: 'absolute', left: 0, right: 0, top: 64, bottom: 0, opacity: thread, transform: `translateY(${(1 - thread) * 50}px)`}}>
          <div style={{position: 'absolute', left: 30, top: 26, width: 560}}>
            <div style={{marginLeft: 60, padding: '16px 22px', borderRadius: '24px 24px 6px 24px', background: '#EEF2FF', border: '1.5px solid #DDE3FF', fontSize: 23, lineHeight: 1.35, color: INK, fontWeight: 500}}>{cfg.prompt}</div>
            <div style={{display: 'flex', alignItems: 'center', gap: 12, margin: '22px 0 12px'}}>
              <Logo s={36} /><div style={{fontWeight: 700, fontSize: 22, color: INK}}>{isReady ? 'Ta pub est prête ✨' : 'Je crée ta pub…'}</div>
            </div>
            {rows.map((r, i) => {
              const vis = prog(f, r.k - 10, 10);
              return (
                <div key={i} style={{display: 'flex', gap: 14, padding: '12px 14px', marginBottom: 8, borderRadius: 18, border: `1.5px solid ${doneAt(r.k) ? '#DCFCE7' : LINE}`, background: doneAt(r.k) ? '#F7FEF9' : '#fff', opacity: 0.35 + vis * 0.65, transform: `translateX(${(1 - vis) * 20}px)`}}>
                  <div style={{width: 30, paddingTop: 2}}>{doneAt(r.k) ? <div style={{transform: `scale(${spring({frame: f - r.k, fps, config: {damping: 10}})})`}}><Check /></div> : <Spinner f={f} />}</div>
                  <div style={{flex: 1}}>
                    <div style={{fontSize: 18, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: MUTED, marginBottom: doneAt(r.k) ? 6 : 0}}>{r.label}</div>
                    {doneAt(r.k) && r.detail}
                  </div>
                </div>
              );
            })}
          </div>

          {/* preview */}
          <div style={{position: 'absolute', right: 40, top: 26, width: 340, opacity: cardIn, transform: `translateY(${(1 - cardIn) * 40}px) scale(${1 - launched * 0.04})`}}>
            <div style={{position: 'relative', width: 340, height: 604, borderRadius: 26, overflow: 'hidden', background: '#0B0A0C', boxShadow: isReady ? '0 0 0 4px #8B6DFF, 0 30px 60px -20px rgba(91,63,228,0.7)' : '0 20px 50px -20px rgba(15,23,42,0.5)'}}>
              {isReady ? (
                <Sequence from={ready} layout="none"><OffthreadVideo src={staticFile(`media/${cfg.adVideo}`)} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} /></Sequence>
              ) : (
                <div style={{position: 'absolute', inset: 0, background: `linear-gradient(${110 + f * 3}deg, #1E1B4B, #4C1D95 40%, #2563EB 70%, #1E1B4B)`, opacity: 0.9}}>
                  <div style={{position: 'absolute', inset: 0, background: `linear-gradient(100deg, transparent ${((f * 2.4) % 160) - 40}%, rgba(255,255,255,0.18) ${((f * 2.4) % 160) - 20}%, transparent ${(f * 2.4) % 160}%)`}} />
                  <div style={{position: 'absolute', left: 0, right: 0, bottom: 30, textAlign: 'center', color: '#fff', fontFamily: '"Geist Mono", ui-monospace, monospace', fontSize: 22, opacity: 0.85}}>
                    Génération · {Math.min(99, Math.round(interpolate(f, [send, ready], [3, 99], clamp)))}%
                  </div>
                </div>
              )}
              {isReady && (
                <div style={{position: 'absolute', top: 14, left: 14, display: 'flex', alignItems: 'center', gap: 8, padding: '7px 14px', borderRadius: 99, background: '#fff', fontWeight: 700, fontSize: 19, color: '#15803D', transform: `scale(${spring({frame: f - ready, fps, config: {damping: 11}})})`}}>
                  <div style={{width: 12, height: 12, borderRadius: 99, background: '#22C55E'}} /> Prête
                </div>
              )}
            </div>
            <div style={{marginTop: 14, height: 66, borderRadius: 18, background: launched > 0 ? '#16A34A' : '#0866FF', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, color: '#fff', fontWeight: 700, fontSize: 24, opacity: prog(f, ready, 10), transform: `scale(${1 - (f >= click - 2 && f < click + 6 ? 0.05 : 0)})`, boxShadow: '0 16px 30px -14px rgba(8,102,255,0.8)'}}>
              {launched > 0 ? <><Check c="#fff" s={28} /> En ligne sur Meta</> : <><svg width="28" height="28" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#fff" /><path d="M13.4 24v-8.4h2.8l.4-3.3h-3.2v-2.1c0-.9.3-1.6 1.6-1.6h1.7V5.7c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2.4H7.2v3.3H10V24z" fill="#0866FF" /></svg> Publier sur Meta</>}
            </div>
          </div>
        </div>
      )}

      {/* launched toast */}
      {launched > 0 && (
        <div style={{position: 'absolute', left: 30, bottom: 26, display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', maxWidth: 560, borderRadius: 22, background: INK, color: '#fff', fontSize: 23, fontWeight: 600, transform: `translateY(${(1 - launched) * 120}px)`, boxShadow: '0 24px 50px -20px rgba(0,0,0,0.6)'}}>
          <div style={{background: '#fff', borderRadius: 12, padding: '6px 8px', display: 'flex'}}><MetaMark s={26} /></div>
          Campagne envoyée sur Facebook et Instagram
        </div>
      )}

      <Cursor x={cx} y={cy} down={down} />

    </div>
  );
};

const StepChip: React.FC<{cfg: SplitCfg}> = ({cfg}) => {
  const f = useCurrentFrame();
  const C = (k: string) => Math.round((cfg.cues[k] ?? 99) * 30);
  const def: [string, string][] = [['Tu écris', 'write'], ['Acteur', 'actor'], ['Script', 'script'], ['Voix', 'voice'], ['Sous-titres', 'subs'], ['Publier', 'click']];
  const steps: [string, number][] = (cfg.steps ?? def).map(([l, k]) => [l, C(k)]);
  let st = 0; let at = 0; steps.forEach((s, i) => { if (f >= s[1]) { st = i + 1; at = s[1]; } });
  if (st === 0) return null;
  const p = prog(f, at, 8);
  return (
    <div style={{position: 'absolute', left: 40, top: 56, display: 'flex', alignItems: 'center', gap: 16, padding: '14px 24px', borderRadius: 22, background: 'rgba(255,255,255,0.92)', boxShadow: '0 14px 30px -16px rgba(15,23,42,0.5), 0 0 0 1.5px rgba(15,23,42,0.07)', fontFamily: FONT, transform: `scale(${0.9 + p * 0.1})`}}>
      <div style={{fontSize: 34, fontWeight: 600, color: '#334155'}}>Étape <span style={{color: '#2563EB', fontWeight: 800}}>{st}</span></div>
      <div style={{display: 'flex', gap: 5}}>{steps.map((_, i) => <div key={i} style={{width: 9, height: 32, borderRadius: 4, background: i < st ? '#2563EB' : '#CBD5E1'}} />)}</div>
      <div style={{fontSize: 30, fontWeight: 700, color: INK, opacity: p}}>{steps[st - 1][0]}</div>
    </div>
  );
};

// ---------- seam subtitles: 3 mots max, boîte noire, mot actif blanc plein ----------
const SeamSubs: React.FC<{cfg: SplitCfg}> = ({cfg}) => {
  const f = useCurrentFrame();
  const t = f / 30;
  const W = cfg.words;
  // group in chunks of max 3 words, breaking on punctuation
  const groups: Word[][] = []; let g: Word[] = [];
  W.forEach((w) => { g.push(w); if (g.length === 3 || /[.,:;!?…]$/.test(w.w)) { groups.push(g); g = []; } });
  if (g.length) groups.push(g);
  const cur = groups.find((gr, i) => t >= gr[0].s - 0.05 && t < (groups[i + 1]?.[0].s ?? gr[gr.length - 1].e + 0.4) - 0.05);
  if (!cur) return null;
  const st = Math.round(cur[0].s * 30);
  const hot = new Set((cfg.hot ?? []).map((h) => h.toLowerCase()));
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: cfg.seam - 62, display: 'flex', justifyContent: 'center', zIndex: 40}}>
      <div style={{display: 'flex', gap: 22, padding: '12px 26px', background: '#0B0B0D', borderRadius: 14, transform: `scale(${0.92 + prog(f, st - 2, 5) * 0.08})`, boxShadow: '0 16px 40px -14px rgba(0,0,0,0.7)'}}>
        {cur.map((w, i) => {
          const on = t >= w.s - 0.03;
          const clean = w.w.replace(/[.,:;!?…«»"]/g, '');
          const isHot = hot.has(clean.toLowerCase());
          return <span key={i} style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 76, lineHeight: 1, textTransform: 'uppercase', letterSpacing: '0.01em', color: on ? (isHot ? '#FACC15' : '#fff') : 'rgba(255,255,255,0.45)'}}>{clean}</span>;
        })}
      </div>
    </div>
  );
};

export const SplitChat: React.FC<{cfg: SplitCfg; Window?: React.FC<{cfg: SplitCfg}>}> = ({cfg, Window = AppWindow}) => {
  useFonts();
  const f = useCurrentFrame();
  const seam = cfg.seam;
  const punch = (k: string) => { const a = Math.round((cfg.cues[k] ?? 99) * 30); return interpolate(f, [a, a + 4, a + 14], [0, 1, 0], clamp); };
  const zoom = 1 + punch('look') * 0.035 + (cfg.punches ?? ['ready']).reduce((a, k) => a + punch(k) * 0.03, 0);
  return (
    <AbsoluteFill style={{background: '#F4F1EA'}}>
      {/* top: grid paper + window */}
      <div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: seam, overflow: 'hidden', backgroundColor: '#F4F1EA', backgroundImage: 'linear-gradient(rgba(15,23,42,0.06) 1.5px, transparent 1.5px), linear-gradient(90deg, rgba(15,23,42,0.06) 1.5px, transparent 1.5px)', backgroundSize: '54px 54px'}}>
        <div style={{position: 'absolute', inset: 0, transform: `translateY(${(1 - spring({frame: f, fps: 30, config: {damping: 14}})) * 700}px) scale(${zoom})`, transformOrigin: '50% 60%'}}>
          <Window cfg={cfg} />
        </div>
        <StepChip cfg={cfg} />
      </div>
      <div style={{position: 'absolute', left: 0, top: seam - 4, width: 1080, height: 8, background: '#fff', boxShadow: '0 0 20px rgba(0,0,0,0.25)', zIndex: 5}} />
      {/* bottom: actor */}
      <div style={{position: 'absolute', left: 0, top: seam, width: 1080, height: 1920 - seam, overflow: 'hidden', background: '#000'}}>
        <OffthreadVideo src={staticFile(`media/${cfg.video}`)} startFrom={Math.round((cfg.videoStart ?? 0) * 30)} muted style={{position: 'absolute', left: 0, top: -(cfg.cues.cropTop ?? 380), width: 1080, height: 1920, objectFit: 'cover'}} />
      </div>
      <SeamSubs cfg={cfg} />
      <Audio src={staticFile(cfg.audio)} />
      {cfg.bed && <Audio src={staticFile(cfg.bed)} />}
    </AbsoluteFill>
  );
};
