import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, continueRender, delayRender, interpolate, staticFile, useCurrentFrame} from 'remotion';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/inter/800.css';
import '@fontsource/space-grotesk/600.css';
import '@fontsource/space-grotesk/700.css';
import {LogoMark, Wordmark} from '../components/UI';
import {prog, pop, EXPO, INOUT} from '../components/anim';
import {FONT, GRAD} from '../theme';

// « Du chat à la pub » : the ad is created live in the Growthity chat (prompt, actor, product),
// then the finished video plays in full with its own sound, then it is published on Meta from the chat.
// Faithful to the real chat UI (white, black user bubbles, choice buttons, actor card, purple send button).

export type Person = {name: string; img: string};
export type ChatPubCfg = {
  id: string;
  video: string;
  videoFrames: number;
  prompt: string;
  actor: Person | null;
  product: Person | null;
  gallery: Person[];
  publishPrompt: string;
  objective: string;
  cta: string;
  voice: Record<'a' | 'b1' | 'b2' | 'b3' | 'd1' | 'd2', string>;
  words?: Record<string, {w: string; s: number; e: number}[]>;
};

const INK = '#0B0B0F';
const MUTED = '#71717A';
const LINE = '#E4E4E7';
const SOFT = '#F4F4F5';
const VIOLET = '#6D5AE6';

// ---------- timeline ----------
export const timeline = (c: ChatPubCfg) => {
  const T: Record<string, number> = {};
  T.hookEnd = 78;
  T.typeStart = 92;
  T.send1 = 178;
  T.reply1 = 196;
  T.tapGallery = 230;
  T.sheetIn = 236;
  T.tapActor = 268;
  T.sheetOut = 284;
  T.actorCard = 290;
  T.reply2 = 308;
  T.genDone = 372;
  T.zoom = 382;
  T.videoStart = 400;
  T.videoEnd = T.videoStart + c.videoFrames;
  T.back = T.videoEnd;
  T.type2 = T.back + 14;
  T.send2 = T.type2 + 58;
  T.pubCard = T.send2 + 14;
  T.tapPublish = T.pubCard + 40;
  T.published = T.tapPublish + 6;
  T.end = T.published + 22;
  T.total = T.end + 92;
  return T;
};

const useFonts = () => {
  const [h] = useState(() => delayRender('fonts'));
  useEffect(() => {
    Promise.all(['400 20px Inter', '500 20px Inter', '600 20px Inter', '700 20px Inter', '800 20px Inter', '700 20px "Space Grotesk"', '600 20px "Space Grotesk"'].map((s) => document.fonts.load(s))).then(() => continueRender(h));
  }, [h]);
};

// ---------- small UI pieces ----------
const AssistantAvatar: React.FC = () => (
  <div style={{width: 64, height: 64, borderRadius: 999, background: '#fff', border: `2px solid ${LINE}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
    <LogoMark size={38} />
  </div>
);

const Assistant: React.FC<{children: React.ReactNode}> = ({children}) => (
  <div style={{display: 'flex', gap: 22, alignItems: 'flex-start', padding: '0 44px'}}>
    <AssistantAvatar />
    <div style={{flex: 1, fontSize: 38, lineHeight: 1.42, color: INK, paddingTop: 6}}>{children}</div>
  </div>
);

const UserBubble: React.FC<{children: React.ReactNode}> = ({children}) => (
  <div style={{display: 'flex', justifyContent: 'flex-end', padding: '0 44px'}}>
    <div style={{maxWidth: 820, background: INK, color: '#fff', borderRadius: 30, padding: '26px 32px', fontSize: 37, lineHeight: 1.4}}>{children}</div>
  </div>
);

// Messages grow in (max-height) so older ones are pushed up like a real chat scroll
const Grow: React.FC<{at: number; children: React.ReactNode; h?: number}> = ({at, children, h = 900}) => {
  const f = useCurrentFrame();
  const p = prog(f, at, 14);
  if (f < at) return null;
  return (
    <div style={{maxHeight: p * h, overflow: 'visible', opacity: prog(f, at + 2, 10), transform: `translateY(${(1 - p) * 30}px)`, marginTop: 44 * p}}>{children}</div>
  );
};

const Ripple: React.FC<{x: number; y: number; at: number}> = ({x, y, at}) => {
  const f = useCurrentFrame();
  if (f < at - 6 || f > at + 18) return null;
  const down = prog(f, at - 6, 6);
  const r = prog(f, at, 16);
  return (
    <>
      <div style={{position: 'absolute', left: x - 34, top: y - 34, width: 68, height: 68, borderRadius: 999, background: 'rgba(15,15,20,0.28)', transform: `scale(${0.6 + down * 0.4 - r * 0.3})`, opacity: 1 - r}} />
      <div style={{position: 'absolute', left: x - 60, top: y - 60, width: 120, height: 120, borderRadius: 999, border: '4px solid rgba(15,15,20,0.25)', transform: `scale(${0.4 + r})`, opacity: (1 - r) * 0.8}} />
    </>
  );
};

const Choice: React.FC<{label: string; icon: 'spark' | 'folder'; active?: number}> = ({label, icon, active = 0}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: 26, padding: '24px 28px', borderRadius: 22, border: `2px solid ${active ? VIOLET : LINE}`, background: active ? '#F1EEFF' : SOFT, boxShadow: '0 2px 0 rgba(0,0,0,0.03)', transform: `scale(${1 - active * 0.02})`}}>
    <div style={{width: 64, height: 64, borderRadius: 16, background: icon === 'folder' ? '#ECE8FF' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      {icon === 'spark' ? (
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke={INK} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8z" /><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z" /></svg>
      ) : (
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke={VIOLET} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" /></svg>
      )}
    </div>
    <div style={{flex: 1, fontSize: 36, fontWeight: 600, color: INK}}>{label}</div>
    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#A1A1AA" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
  </div>
);

const Composer: React.FC<{text: string; focus: boolean; sendPress: number}> = ({text, focus, sendPress}) => {
  const f = useCurrentFrame();
  return (
    <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 250, background: '#fff', borderTop: `2px solid ${LINE}`, display: 'flex', alignItems: 'flex-start', gap: 20, padding: '34px 36px 0'}}>
      <div style={{width: 84, height: 84, borderRadius: 22, border: `2px solid ${LINE}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 8}}>
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#15803D" strokeWidth="2.2" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
      </div>
      <div style={{flex: 1, minHeight: 100, maxHeight: 190, borderRadius: 26, border: `3px solid ${focus ? VIOLET : '#C4B5FD'}`, boxShadow: focus ? '0 0 0 6px rgba(109,90,230,0.12)' : 'none', padding: '24px 26px', fontSize: 34, lineHeight: 1.35, color: text ? INK : '#A1A1AA', overflow: 'hidden', display: 'flex', alignItems: 'flex-end'}}>
        <div>
          {text || 'Demande une modification, une variation, une publication…'}
          {focus && <span style={{color: VIOLET, opacity: Math.floor(f / 8) % 2 ? 1 : 0}}>|</span>}
        </div>
      </div>
      <div style={{width: 84, height: 84, borderRadius: 22, border: `2px solid ${LINE}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 8}}>
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke={MUTED} strokeWidth="2" strokeLinecap="round"><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0014 0M12 18v3" /></svg>
      </div>
      <div style={{width: 96, height: 96, borderRadius: 24, background: text ? VIOLET : '#C4B5FD', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2, transform: `scale(${1 - sendPress * 0.12})`}}>
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
      </div>
    </div>
  );
};

const Header: React.FC = () => (
  <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 190, background: '#fff', borderBottom: `2px solid ${LINE}`, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '0 44px 30px'}}>
    <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
      <LogoMark size={56} />
      <Wordmark size={50} />
    </div>
    <div style={{display: 'flex', alignItems: 'center', gap: 12, padding: '12px 22px', borderRadius: 999, border: `2px solid ${LINE}`, fontSize: 28, fontWeight: 600, color: '#3F3F46'}}>
      <div style={{width: 16, height: 16, borderRadius: 99, background: '#22C55E'}} />
      Meta connecté
    </div>
  </div>
);

// Typewriter helper (chars per frame, with tiny irregularity so it feels human)
const typed = (s: string, f: number, start: number, end: number) => {
  const n = Math.floor(interpolate(f, [start, end], [0, s.length], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));
  return s.slice(0, n);
};

// ---------- gallery sheet ----------
const Gallery: React.FC<{c: ChatPubCfg; T: Record<string, number>}> = ({c, T}) => {
  const f = useCurrentFrame();
  const inP = prog(f, T.sheetIn, 14);
  const outP = prog(f, T.sheetOut, 12, INOUT);
  const y = (1 - inP) * 1500 + outP * 1500;
  const pickIdx = c.gallery.findIndex((g) => c.actor && g.name === c.actor.name);
  const picked = f >= T.tapActor;
  return (
    <>
      <AbsoluteFill style={{background: 'rgba(10,10,15,0.35)', opacity: inP * (1 - outP)}} />
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 1480, background: '#fff', borderRadius: '44px 44px 0 0', transform: `translateY(${y}px)`, padding: '26px 44px 0', boxShadow: '0 -30px 80px -30px rgba(0,0,0,0.35)'}}>
        <div style={{width: 120, height: 10, borderRadius: 99, background: '#D4D4D8', margin: '0 auto 30px'}} />
        <div style={{fontSize: 46, fontWeight: 700, color: INK, marginBottom: 24}}>Galerie d’acteurs</div>
        <div style={{display: 'flex', alignItems: 'center', gap: 16, height: 84, borderRadius: 20, border: `2px solid ${LINE}`, padding: '0 24px', fontSize: 32, color: '#A1A1AA', marginBottom: 30}}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#A1A1AA" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" /></svg>
          Rechercher un acteur…
        </div>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 22}}>
          {c.gallery.map((g, i) => {
            const sel = picked && i === pickIdx;
            return (
              <div key={i} style={{position: 'relative', borderRadius: 24, overflow: 'hidden', height: 360, border: sel ? `6px solid ${VIOLET}` : '6px solid transparent', boxSizing: 'border-box'}}>
                <Img src={staticFile(`media/${g.img}`)} style={{width: '100%', height: '100%', objectFit: 'cover', display: 'block', borderRadius: 18}} />
                <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, padding: '40px 16px 14px', background: 'linear-gradient(transparent, rgba(0,0,0,0.65))', color: '#fff', fontSize: 28, fontWeight: 600}}>{g.name}</div>
                {sel && (
                  <div style={{position: 'absolute', right: 14, top: 14, width: 56, height: 56, borderRadius: 99, background: VIOLET, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${pop(f, T.tapActor, 12)})`}}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      {pickIdx >= 0 && <Ripple x={44 + (pickIdx % 3) * ((1080 - 88 + 22) / 3) + 150} y={1920 - 1480 + 26 + 40 + 70 + 108 + 30 + Math.floor(pickIdx / 3) * 382 + 180 - y} at={T.tapActor} />}
    </>
  );
};

// ---------- the chat scene ----------
const ChatScene: React.FC<{c: ChatPubCfg; T: Record<string, number>; phase: 'make' | 'publish'}> = ({c, T, phase}) => {
  const f = useCurrentFrame();
  const t1 = phase === 'make' ? typed(c.prompt, f, T.typeStart, T.send1 - 8) : '';
  const t2 = phase === 'publish' ? typed(c.publishPrompt, f, T.type2, T.send2 - 6) : '';
  const composerText = phase === 'make' ? (f < T.send1 ? t1 : '') : f < T.send2 ? t2 : '';
  const focus = phase === 'make' ? f >= T.typeStart - 6 && f < T.send1 + 4 : f >= T.type2 - 6 && f < T.send2 + 4;
  const sendAt = phase === 'make' ? T.send1 : T.send2;
  const sendPress = f >= sendAt - 3 && f < sendAt + 3 ? 1 : 0;
  const genP = interpolate(f, [T.reply2 + 12, T.genDone], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: INOUT});
  const done = f >= T.genDone;
  const galleryActive = f >= T.tapGallery - 4 && f < T.sheetIn + 4 ? 1 : 0;
  const published = f >= T.published;
  return (
    <AbsoluteFill style={{background: '#FAFAFA', fontFamily: FONT}}>
      {/* thread */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 190, bottom: 250, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', paddingBottom: 40, overflow: 'hidden'}}>
        <Assistant>
          Prêt à créer ta pub. <b>Dis-moi ce que tu veux promouvoir</b> : le produit, l’offre, et surtout qui est ta cible.
        </Assistant>
        <Grow at={T.send1}>
          <UserBubble>{c.prompt}</UserBubble>
        </Grow>
        <Grow at={T.reply1}>
          <Assistant>
            Top, on part sur une <b>vidéo UGC face caméra en 9:16</b>. Il me manque juste l’acteur pour verrouiller le rendu.
            <div style={{display: 'flex', flexDirection: 'column', gap: 18, marginTop: 26}}>
              <Choice label="Choisir un acteur depuis la galerie" icon="spark" active={galleryActive} />
              <Choice label="Choisir un avatar de mon catalogue" icon="folder" />
              <Choice label="Tu choisis pour moi" icon="spark" />
            </div>
          </Assistant>
        </Grow>
        {c.actor && (
          <Grow at={T.actorCard}>
            <div style={{display: 'flex', justifyContent: 'flex-end', padding: '0 44px'}}>
              <div style={{background: INK, borderRadius: 30, padding: 18, width: 340}}>
                <Img src={staticFile(`media/${c.actor.img}`)} style={{width: '100%', height: 380, objectFit: 'cover', borderRadius: 18, display: 'block'}} />
                <div style={{color: '#fff', fontSize: 32, padding: '18px 6px 6px'}}>Acteur : {c.actor.name}</div>
              </div>
            </div>
          </Grow>
        )}
        <Grow at={T.reply2} h={1100}>
          <Assistant>
            {c.product ? <>Produit : <b>{c.product.name}</b>. </> : <>Pas de produit à importer. </>}
            Je lance la vidéo avec <b>{c.actor?.name}</b>.
            <div style={{marginTop: 24, width: 470, borderRadius: 26, overflow: 'hidden', border: `2px solid ${LINE}`, background: '#fff', position: 'relative'}}>
              <div style={{position: 'relative', width: '100%', height: 836, background: '#18181B'}}>
                {done ? (
                  <OffthreadVideo src={staticFile(`media/${c.video}`)} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                ) : (
                  <div style={{position: 'absolute', inset: 0, background: `linear-gradient(110deg, #27272A 30%, #3F3F46 ${40 + ((f * 3) % 60)}%, #27272A 80%)`}}>
                    {c.actor && <Img src={staticFile(`media/${c.actor.img}`)} style={{width: '100%', height: '100%', objectFit: 'cover', opacity: 0.18 + genP * 0.4, filter: `blur(${(1 - genP) * 24}px)`}} />}
                  </div>
                )}
                {!done && (
                  <div style={{position: 'absolute', left: 28, right: 28, bottom: 30, color: '#fff', fontSize: 28, fontWeight: 600}}>
                    Génération de la vidéo… {Math.round(genP * 100)} %
                    <div style={{marginTop: 14, height: 10, borderRadius: 99, background: 'rgba(255,255,255,0.2)'}}>
                      <div style={{width: `${genP * 100}%`, height: '100%', borderRadius: 99, backgroundImage: GRAD}} />
                    </div>
                  </div>
                )}
              </div>
              <div style={{padding: '18px 22px', fontSize: 28, color: MUTED}}>UGC 9:16 · {c.actor?.name}</div>
            </div>
          </Assistant>
        </Grow>
        {phase === 'publish' && (
          <>
            <Grow at={T.send2}>
              <UserBubble>{c.publishPrompt}</UserBubble>
            </Grow>
            <Grow at={T.pubCard} h={1000}>
              <Assistant>
                C’est prêt. Je publie la vidéo sur ton compte Meta :
                <div style={{marginTop: 24, borderRadius: 26, border: `2px solid ${LINE}`, background: '#fff', padding: '28px 30px', display: 'flex', flexDirection: 'column', gap: 20}}>
                  <div style={{display: 'flex', alignItems: 'center', gap: 14, fontSize: 34, fontWeight: 700}}>
                    <svg width="40" height="40" viewBox="0 0 24 24"><path fill="#0866FF" d="M6.9 7.2c-1.9 0-3.4 2.6-3.4 5.3 0 1.8.8 3 2.2 3 1.2 0 2-.8 3.5-3.3l.9-1.5 .5-.8c-1.2-1.8-2.4-2.7-3.7-2.7zm10.4 0c-1.5 0-2.7 1-4.1 3.1l-.4.6.6 1c1.4 2.4 2.3 3.1 3.4 3.1 1.3 0 2.1-1.2 2.1-3 0-2.7-1.4-4.8-1.6-4.8z" /></svg>
                    Publication Meta
                  </div>
                  {[
                    ['Objectif', c.objective],
                    ['Placements', 'Instagram · Facebook'],
                    ['Bouton', c.cta],
                  ].map(([k, v]) => (
                    <div key={k} style={{display: 'flex', justifyContent: 'space-between', fontSize: 32, color: MUTED, borderTop: `2px solid ${SOFT}`, paddingTop: 16}}>
                      <span>{k}</span>
                      <span style={{color: INK, fontWeight: 600}}>{v}</span>
                    </div>
                  ))}
                  <div style={{marginTop: 8, height: 92, borderRadius: 20, background: published ? '#16A34A' : VIOLET, color: '#fff', fontSize: 36, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, transform: `scale(${f >= T.tapPublish - 3 && f < T.tapPublish + 3 ? 0.96 : 1})`}}>
                    {published ? (
                      <>
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
                        Publiée sur Meta
                      </>
                    ) : (
                      'Publier'
                    )}
                  </div>
                </div>
              </Assistant>
            </Grow>
          </>
        )}
      </div>
      <Header />
      <Composer text={composerText} focus={focus} sendPress={sendPress} />
      {phase === 'make' && f >= T.sheetIn - 2 && f < T.sheetOut + 16 && <Gallery c={c} T={T} />}
      {phase === 'make' && <Ripple x={540} y={1920 - 250 - 40 - 0} at={-100} />}
    </AbsoluteFill>
  );
};

// ---------- voice captions (karaoke, short lines) ----------
const VoCaption: React.FC<{words: {w: string; s: number; e: number}[]; at: number; y: number; dark?: boolean; size?: number}> = ({words, at, y, dark, size = 50}) => {
  const f = useCurrentFrame();
  const t = (f - at) / 30;
  if (t < 0 || !words.length || t > words[words.length - 1].e + 0.4) return null;
  // group into chunks of ~4 words
  const chunks: typeof words[] = [];
  let cur: typeof words = [];
  words.forEach((w) => {
    cur.push(w);
    if (cur.length >= 4 || /[.,?…:]$/.test(w.w)) {
      chunks.push(cur);
      cur = [];
    }
  });
  if (cur.length) chunks.push(cur);
  const chunk = chunks.find((ch) => t <= ch[ch.length - 1].e + 0.05) ?? chunks[chunks.length - 1];
  return (
    <div style={{position: 'absolute', left: 60, right: 60, top: y, display: 'flex', justifyContent: 'center'}}>
      <div style={{fontFamily: FONT, fontWeight: 800, fontSize: size, lineHeight: 1.15, textAlign: 'center', padding: '16px 30px', borderRadius: 24, background: dark ? 'rgba(10,10,15,0.82)' : 'transparent', color: '#fff', textShadow: dark ? 'none' : '0 4px 24px rgba(0,0,0,0.55)'}}>
        {chunk.map((w, i) => (
          <span key={i} style={{color: t >= w.s ? (dark ? '#fff' : '#fff') : 'rgba(255,255,255,0.45)', backgroundImage: t >= w.s && t <= w.e + 0.1 ? GRAD : undefined, WebkitBackgroundClip: t >= w.s && t <= w.e + 0.1 ? 'text' : undefined, WebkitTextFillColor: t >= w.s && t <= w.e + 0.1 ? 'transparent' : undefined}}>
            {w.w}{' '}
          </span>
        ))}
      </div>
    </div>
  );
};

// ---------- main ----------
export const ChatToAd: React.FC<{cfg: ChatPubCfg}> = ({cfg: c}) => {
  useFonts();
  const f = useCurrentFrame();
  const T = timeline(c);
  const W = c.words ?? {};
  const V = c.voice;
  // camera on the chat scene: gentle push toward where the action is
  const camMake = interpolate(f, [T.hookEnd, T.typeStart, T.send1, T.reply1 + 10, T.sheetOut, T.reply2, T.genDone, T.zoom, T.videoStart], [1.0, 1.06, 1.06, 1.0, 1.0, 1.02, 1.04, 1.04, 2.3], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EXPO});
  const camY = interpolate(f, [T.hookEnd, T.typeStart, T.send1, T.reply1 + 10, T.genDone, T.zoom, T.videoStart], [0, -60, -60, 0, 0, 0, 240], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EXPO});
  const camPub = interpolate(f, [T.back, T.back + 14, T.pubCard, T.published + 10], [1.08, 1.04, 1.0, 1.05], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EXPO});
  const zoomFade = prog(f, T.videoStart - 8, 8);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {/* 1. Hook: the finished ad, muted, with the voice */}
      <Sequence durationInFrames={T.hookEnd + 6}>
        <AbsoluteFill style={{transform: `scale(${1.04 + f * 0.0012})`}}>
          <OffthreadVideo src={staticFile(`media/${c.video}`)} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />
        </AbsoluteFill>
        <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0.35) 0%, transparent 30%, transparent 60%, rgba(0,0,0,0.55) 100%)'}} />
        <VoCaption words={W[V.a] ?? []} at={6} y={1380} size={66} />
        <AbsoluteFill style={{background: '#fff', opacity: prog(f, T.hookEnd - 2, 6)}} />
      </Sequence>
      {/* 2. Making it in the chat */}
      <Sequence from={T.hookEnd} durationInFrames={T.videoStart - T.hookEnd}>
        <AbsoluteFill style={{transform: `translateY(${camY}px) scale(${camMake})`, transformOrigin: '50% 62%'}}>
          <ChatSceneAbs c={c} T={T} phase="make" offset={T.hookEnd} />
        </AbsoluteFill>
        <VoCaption words={W[V.b1] ?? []} at={T.typeStart - 12 - T.hookEnd} y={232} dark size={42} />
        <VoCaption words={W[V.b2] ?? []} at={T.tapGallery - 4 - T.hookEnd} y={232} dark size={42} />
        <VoCaption words={W[V.b3] ?? []} at={T.reply2 + 4 - T.hookEnd} y={232} dark size={42} />
        <AbsoluteFill style={{background: '#000', opacity: zoomFade}} />
      </Sequence>
      {/* 3. The full ad, with its own sound */}
      <Sequence from={T.videoStart} durationInFrames={c.videoFrames}>
        <OffthreadVideo src={staticFile(`media/${c.video}`)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
        <div style={{position: 'absolute', left: 40, top: 70, display: 'flex', alignItems: 'center', gap: 12, padding: '12px 22px', borderRadius: 999, background: 'rgba(255,255,255,0.85)', fontFamily: FONT, fontWeight: 700, fontSize: 28, color: INK, opacity: interpolate(f, [T.videoStart, T.videoStart + 10, T.videoStart + 80, T.videoStart + 95], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}}>
          <LogoMark size={34} /> Créée avec Growthity
        </div>
      </Sequence>
      {/* 4. Publish on Meta from the chat */}
      <Sequence from={T.back} durationInFrames={T.end - T.back + 10}>
        <AbsoluteFill style={{transform: `scale(${camPub})`, transformOrigin: '50% 70%'}}>
          <ChatSceneAbs c={c} T={T} phase="publish" offset={T.back} />
        </AbsoluteFill>
        <VoCaption words={W[V.d1] ?? []} at={4} y={232} dark size={42} />
        <AbsoluteFill style={{background: '#fff', opacity: 1 - prog(f, T.back, 8)}} />
      </Sequence>
      {/* 5. End card */}
      <Sequence from={T.end} durationInFrames={T.total - T.end}>
        <EndScene words={W[V.d2] ?? []} at={T.published + 4 - T.end} />
      </Sequence>
      {/* voices */}
      <Sequence from={6}><Audio src={staticFile(`voice/${V.a}.mp3`)} /></Sequence>
      <Sequence from={T.typeStart - 12}><Audio src={staticFile(`voice/${V.b1}.mp3`)} /></Sequence>
      <Sequence from={T.tapGallery - 4}><Audio src={staticFile(`voice/${V.b2}.mp3`)} /></Sequence>
      <Sequence from={T.reply2 + 4}><Audio src={staticFile(`voice/${V.b3}.mp3`)} /></Sequence>
      <Sequence from={T.back + 4}><Audio src={staticFile(`voice/${V.d1}.mp3`)} /></Sequence>
      <Sequence from={T.published + 4}><Audio src={staticFile(`voice/${V.d2}.mp3`)} /></Sequence>
      <Audio src={staticFile(`chatpub/${c.id}-bed.wav`)} />
    </AbsoluteFill>
  );
};

// The chat scene uses absolute timeline frames: shift the local frame back
const ChatSceneAbs: React.FC<{c: ChatPubCfg; T: Record<string, number>; phase: 'make' | 'publish'; offset: number}> = ({c, T, phase, offset}) => {
  // Remotion gives local frames inside a Sequence; convert timings to local by subtracting offset
  const L: Record<string, number> = {};
  Object.entries(T).forEach(([k, v]) => (L[k] = v - offset));
  return (
    <>
      <ChatScene c={c} T={L} phase={phase} />
      {phase === 'make' && <Ripple x={44 + 64 + 22 + 440} y={0} at={-999} />}
      <TapLayer T={L} phase={phase} />
    </>
  );
};

// Taps on the choice button and the publish button (positions match the layout above)
const TapLayer: React.FC<{T: Record<string, number>; phase: 'make' | 'publish'}> = ({T, phase}) => {
  if (phase === 'make') return <Ripple x={560} y={1060} at={T.tapGallery} />;
  return <Ripple x={600} y={1560} at={T.tapPublish} />;
};

const EndScene: React.FC<{words: {w: string; s: number; e: number}[]; at: number}> = ({words, at}) => {
  const f = useCurrentFrame();
  const m = pop(f, 2, 13);
  return (
    <AbsoluteFill style={{background: '#fff', alignItems: 'center', justifyContent: 'center', fontFamily: FONT}}>
      <div style={{position: 'absolute', width: 1000, height: 1000, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,108,255,0.22) 0%, transparent 65%)'}} />
      <div style={{display: 'flex', alignItems: 'center', gap: 18, transform: `scale(${m})`}}>
        <LogoMark size={110} draw={prog(f, 2, 20)} />
        <Wordmark size={104} reveal={prog(f, 6, 16)} />
      </div>
      <div style={{marginTop: 50, fontFamily: '"Space Grotesk", Inter, sans-serif', fontWeight: 700, fontSize: 76, color: INK, letterSpacing: '-0.02em', textAlign: 'center', lineHeight: 1.08, opacity: prog(f, 12, 12), transform: `translateY(${(1 - prog(f, 12, 14)) * 24}px)`}}>
        Une phrase dans le chat.
        <br />
        <span style={{backgroundImage: GRAD, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>Votre pub en ligne.</span>
      </div>
      <div style={{marginTop: 60, display: 'flex', alignItems: 'center', gap: 14, padding: '22px 40px', borderRadius: 999, background: INK, color: '#fff', fontSize: 40, fontWeight: 700, transform: `scale(${pop(f, 22, 13)})`}}>
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#C4B5FD" strokeWidth="2.6" strokeLinecap="round"><path d="M12 19V5M6 11l6-6 6 6" /></svg>
        Lien en bio
      </div>
      <AbsoluteFill style={{background: '#000', opacity: interpolate(f, [80, 92], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}} />
    </AbsoluteFill>
  );
};
