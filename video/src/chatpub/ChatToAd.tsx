import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, continueRender, delayRender, interpolate, staticFile, useCurrentFrame} from 'remotion';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/inter/800.css';
import '@fontsource/space-grotesk/700.css';
import {LogoMark, Wordmark} from '../components/UI';
import {prog, pop, EXPO, INOUT} from '../components/anim';
import {FONT, GRAD} from '../theme';

// « Du chat à la pub »
// 1. hook: the finished ad (muted) + voice  2. the ad is made in the real Growthity chat (/create):
// actor picked in « Choisir un acteur », optional product from « Catalogue », prompt typed  3. the full ad
// with its own sound  4. « Publier sur Meta » from the result card  5. end card.
// UI copied from the current app (Nov. 2026 screenshots).

type Person = {name: string; img: string; style?: string; desc?: string};
type Product = {name: string; img: string; price?: string};
type Word = {w: string; s: number; e: number};
export type ChatPubCfg = {
  id: string;
  title: string;
  video: string;
  videoFrames: number;
  prompt: string;
  actor: Person | null;
  product: Product | null;
  brand: {name: string; icon?: string} | null;
  gallery: Person[];
  voice: Record<'a' | 'b1' | 'b2' | 'b3' | 'd1' | 'd2', string>;
  words?: Record<string, Word[]>;
};

const INK = '#18181B';
const MUTED = '#71717A';
const LINE = '#E4E4E7';
const SOFT = '#F4F4F5';
const VIOLET = '#5B45E8';
const LAV = '#EEEBFF';
const BLUE = '#3B6EF5';

export const timeline = (c: ChatPubCfg) => {
  const T: Record<string, number> = {};
  T.hookEnd = 78;
  T.tapActorChip = 112;
  T.modalIn = 118;
  T.tapCharlotte = 156;
  T.tapUse = 182;
  T.modalOut = 188;
  T.actorChip = 194;
  T.typeStart = 206;
  T.send = 280;
  T.threadIn = 282;
  T.reply = 298;
  T.genStart = 306;
  T.genDone = 372;
  T.zoom = 386;
  T.videoStart = 404;
  T.videoEnd = T.videoStart + c.videoFrames;
  T.back = T.videoEnd;
  T.tapPublish = T.back + 62;
  T.published = T.tapPublish + 6;
  T.end = T.back + 104;
  T.total = T.end + 100;
  return T;
};

const useFonts = () => {
  const [h] = useState(() => delayRender('fonts'));
  useEffect(() => {
    Promise.all(['400 20px Inter', '500 20px Inter', '600 20px Inter', '700 20px Inter', '800 20px Inter', '700 20px "Space Grotesk"'].map((s) => document.fonts.load(s))).then(() => continueRender(h));
  }, [h]);
};

// ---------- icons ----------
const Plus: React.FC<{c?: string; s?: number}> = ({c = VIOLET, s = 30}) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.2" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
);
const Check: React.FC<{s?: number; c?: string}> = ({s = 30, c = '#fff'}) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
);
const House: React.FC = () => (
  <svg width="36" height="36" viewBox="0 0 24 24"><path d="M3 11.5L12 4l9 7.5" fill="none" stroke="#EA580C" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /><path d="M5.5 10v9.5h13V10" fill="#FFEDD5" stroke="#EA580C" strokeWidth="2" strokeLinejoin="round" /><path d="M10 19.5v-5h4v5" fill="none" stroke="#EA580C" strokeWidth="2" /></svg>
);
const Chevron: React.FC<{dir?: 'down' | 'up'; c?: string; s?: number}> = ({dir = 'down', c = MUTED, s = 28}) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{transform: dir === 'up' ? 'rotate(180deg)' : undefined}}><path d="M6 9l6 6 6-6" /></svg>
);
const LogoTile: React.FC<{s: number}> = ({s}) => (
  <div style={{width: s, height: s, borderRadius: s * 0.27, background: '#fff', border: `2px solid ${LINE}`, boxShadow: '0 10px 30px -18px rgba(24,24,27,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
    <LogoMark size={s * 0.46} />
  </div>
);

// tap feedback
const Tap: React.FC<{x: number; y: number; at: number}> = ({x, y, at}) => {
  const f = useCurrentFrame();
  if (f < at - 8 || f > at + 18) return null;
  const down = prog(f, at - 8, 8);
  const r = prog(f, at, 16);
  return (
    <>
      <div style={{position: 'absolute', left: x - 36, top: y - 36, width: 72, height: 72, borderRadius: 999, background: 'rgba(24,24,27,0.22)', border: '3px solid rgba(255,255,255,0.9)', transform: `scale(${0.7 + down * 0.3 - r * 0.25})`, opacity: 1 - r, boxShadow: '0 6px 20px rgba(0,0,0,0.25)'}} />
      <div style={{position: 'absolute', left: x - 70, top: y - 70, width: 140, height: 140, borderRadius: 999, border: '4px solid rgba(91,69,232,0.45)', transform: `scale(${0.3 + r})`, opacity: (1 - r) * 0.9}} />
    </>
  );
};

const typed = (s: string, f: number, a: number, b: number) => s.slice(0, Math.floor(interpolate(f, [a, b], [0, s.length], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})));

// ---------- composer (real layout: chips row + input row) ----------
const Composer: React.FC<{c: ChatPubCfg; T: Record<string, number>; text: string; focus: boolean; actorOn: boolean; pressChip: boolean}> = ({c, T, text, focus, actorOn, pressChip}) => {
  const f = useCurrentFrame();
  const sendHot = text.length > 0;
  const press = f >= T.send - 3 && f < T.send + 3;
  return (
    <div style={{width: 1000, borderRadius: 40, background: '#fff', border: `2px solid ${focus ? '#C9C2F7' : LINE}`, boxShadow: focus ? '0 0 0 8px rgba(91,69,232,0.08), 0 30px 60px -36px rgba(24,24,27,0.35)' : '0 30px 60px -40px rgba(24,24,27,0.3)', padding: '26px 26px 22px'}}>
      <div style={{display: 'flex', gap: 10, alignItems: 'center'}}>
        {c.brand && (
          <div style={{display: 'flex', alignItems: 'center', gap: 12, height: 84, padding: '0 20px 0 18px', borderRadius: 999, background: SOFT, border: `2px solid ${LINE}`, fontSize: 30, whiteSpace: 'nowrap', fontWeight: 500, color: INK}}>
            <House /> {c.brand.name} <Chevron />
          </div>
        )}
        {actorOn && c.actor ? (
          <div style={{display: 'flex', alignItems: 'center', gap: 12, height: 84, padding: '0 22px 0 8px', borderRadius: 999, background: LAV, border: `2px solid #D6CFFB`, fontSize: 30, whiteSpace: 'nowrap', fontWeight: 600, color: INK, transform: `scale(${pop(f, T.actorChip, 12)})`}}>
            <Img src={staticFile(`media/${c.actor.img}`)} style={{width: 66, height: 66, borderRadius: 999, objectFit: 'cover'}} />
            {c.actor.name}
          </div>
        ) : (
          <div style={{display: 'flex', alignItems: 'center', gap: 12, height: 84, padding: '0 20px 0 10px', borderRadius: 999, border: `2px dashed ${pressChip ? VIOLET : '#D4D4D8'}`, background: pressChip ? LAV : '#fff', fontSize: 30, whiteSpace: 'nowrap', fontWeight: 500, color: INK, transform: `scale(${pressChip ? 0.96 : 1})`}}>
            <div style={{width: 52, height: 52, borderRadius: 999, background: LAV, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Plus /></div>
            Ajouter un acteur
          </div>
        )}
        <div style={{display: 'flex', alignItems: 'center', gap: 12, height: 84, padding: '0 20px 0 10px', borderRadius: 999, border: '2px dashed #D4D4D8', fontSize: 30, fontWeight: 500, color: INK, whiteSpace: 'nowrap'}}>
          <div style={{width: 52, height: 52, borderRadius: 999, background: LAV, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Plus /></div>
          Catalogue
        </div>
      </div>
      <div style={{display: 'flex', alignItems: 'flex-end', gap: 18, marginTop: 22}}>
        <div style={{width: 64, height: 88, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Plus c="#52525B" s={36} /></div>
        <div style={{flex: 1, minHeight: 88, fontSize: 36, lineHeight: 1.36, color: text ? INK : '#A1A1AA', display: 'flex', alignItems: 'center', paddingBottom: 4}}>
          <div>
            {text || 'Décris la pub que tu veux créer…'}
            {focus && <span style={{color: VIOLET, fontWeight: 300, opacity: Math.floor(f / 8) % 2 ? 1 : 0}}>|</span>}
          </div>
        </div>
        <div style={{width: 64, height: 88, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#52525B" strokeWidth="2" strokeLinecap="round"><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0014 0M12 18v3" /></svg>
        </div>
        <div style={{width: 96, height: 96, borderRadius: 26, background: sendHot ? VIOLET : SOFT, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${press ? 0.88 : 1})`, boxShadow: sendHot ? '0 14px 30px -12px rgba(91,69,232,0.7)' : 'none'}}>
          <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke={sendHot ? '#fff' : '#A1A1AA'} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M6 11l6-6 6 6" /></svg>
        </div>
      </div>
    </div>
  );
};

// ---------- « Choisir un acteur » ----------
const ActorModal: React.FC<{c: ChatPubCfg; T: Record<string, number>}> = ({c, T}) => {
  const f = useCurrentFrame();
  const inP = prog(f, T.modalIn, 14);
  const outP = prog(f, T.modalOut, 12, INOUT);
  const vis = inP * (1 - outP);
  const pick = c.gallery.findIndex((g) => g.name === c.actor?.name);
  const picked = f >= T.tapCharlotte;
  const usePress = f >= T.tapUse - 3 && f < T.tapUse + 3;
  const tiles: (Person | null)[] = [null, ...c.gallery];
  return (
    <>
      <AbsoluteFill style={{background: 'rgba(24,24,27,0.45)', opacity: vis}} />
      <div style={{position: 'absolute', left: 30, top: 200, width: 1020, borderRadius: 44, background: '#fff', boxShadow: '0 50px 120px -40px rgba(0,0,0,0.5)', opacity: vis, transform: `translateY(${(1 - inP) * 120 + outP * 80}px) scale(${0.96 + inP * 0.04})`, overflow: 'hidden'}}>
        <div style={{padding: '44px 44px 0'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
            <div style={{fontSize: 46, fontWeight: 700, color: INK}}>Choisir un acteur</div>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#71717A" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </div>
          <div style={{fontSize: 30, color: MUTED, marginTop: 12, lineHeight: 1.35}}>La personne qui parle face caméra.</div>
          <div style={{display: 'inline-flex', marginTop: 30, padding: 6, borderRadius: 20, background: SOFT, gap: 4}}>
            <div style={{padding: '16px 24px', borderRadius: 16, fontSize: 30, color: MUTED, fontWeight: 500}}>Catalogue (1)</div>
            <div style={{padding: '16px 24px', borderRadius: 16, fontSize: 30, color: INK, fontWeight: 600, background: '#fff', border: `3px solid ${VIOLET}`}}>Mes acteurs (200)</div>
          </div>
          <div style={{marginTop: 26, height: 84, borderRadius: 20, border: `2px solid ${LINE}`, display: 'flex', alignItems: 'center', gap: 16, padding: '0 24px', fontSize: 30, color: '#A1A1AA'}}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#71717A" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" /></svg>
            Rechercher par nom, style ou tag…
          </div>
          <div style={{display: 'flex', gap: 14, marginTop: 24, whiteSpace: 'nowrap'}}>
            {['Tous', 'Femmes', 'Hommes', 'Âge', 'Teint', 'Univers'].map((t, i) => (
              <div key={t} style={{display: 'flex', alignItems: 'center', gap: 8, padding: '14px 24px', borderRadius: i < 3 ? 999 : 18, border: `2px solid ${i === 0 ? '#BDB2F7' : LINE}`, background: i === 0 ? LAV : '#fff', color: i === 0 ? VIOLET : INK, fontSize: 28, fontWeight: 500}}>
                {t}
                {i >= 3 && <Chevron s={22} c={INK} />}
              </div>
            ))}
          </div>
        </div>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18, padding: '28px 44px 30px'}}>
          {tiles.map((g, i) => {
            if (!g)
              return (
                <div key={i} style={{height: 330, borderRadius: 24, border: '3px dashed #C9C2F7', background: '#FAFAFF', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, textAlign: 'center', padding: 16}}>
                  <div style={{width: 76, height: 76, borderRadius: 999, background: LAV, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Plus s={36} /></div>
                  <div style={{color: VIOLET, fontWeight: 700, fontSize: 28}}>Créer un acteur</div>
                </div>
              );
            const sel = picked && i - 1 === pick;
            return (
              <div key={i} style={{position: 'relative', height: 330, borderRadius: 24, overflow: 'hidden', boxShadow: sel ? `0 0 0 5px ${VIOLET}` : `0 0 0 2px ${LINE}`, transform: `scale(${sel ? 0.97 + 0.03 * pop(f, T.tapCharlotte, 10) : 1})`}}>
                <Img src={staticFile(`media/${g.img}`)} style={{width: '100%', height: '100%', objectFit: 'cover', display: 'block'}} />
                <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, padding: '60px 18px 16px', background: 'linear-gradient(transparent, rgba(0,0,0,0.7))', color: '#fff'}}>
                  <div style={{fontSize: 28, fontWeight: 700}}>{g.name}</div>
                  <div style={{fontSize: 22, opacity: 0.85, marginTop: 2}}>{g.style}</div>
                </div>
                {sel && (
                  <div style={{position: 'absolute', right: 14, top: 14, width: 54, height: 54, borderRadius: 99, background: VIOLET, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${pop(f, T.tapCharlotte, 12)})`, boxShadow: '0 6px 16px rgba(91,69,232,0.5)'}}>
                    <Check s={30} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div style={{borderTop: `2px solid ${LINE}`, padding: '26px 44px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 22}}>
          <div style={{fontSize: 28, color: MUTED}}>{picked ? '1 sélectionné' : '0 sélectionné'}</div>
          <div style={{padding: '22px 30px', borderRadius: 20, border: `2px solid ${LINE}`, fontSize: 30, fontWeight: 600, color: INK}}>Annuler</div>
          <div style={{padding: '22px 34px', borderRadius: 20, background: VIOLET, fontSize: 30, fontWeight: 600, color: '#fff', opacity: picked ? 1 : 0.5, transform: `scale(${usePress ? 0.95 : 1})`, boxShadow: picked ? '0 14px 30px -12px rgba(91,69,232,0.7)' : 'none'}}>Utiliser cet acteur</div>
        </div>
      </div>
    </>
  );
};

// ---------- thread pieces ----------
const AttachCard: React.FC<{kind: string; title: string; sub?: string; img: string; at: number}> = ({kind, title, sub, img, at}) => {
  const f = useCurrentFrame();
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: 26, background: '#fff', border: `2px solid ${LINE}`, borderRadius: 36, padding: '20px 40px 20px 20px', opacity: prog(f, at, 10), transform: `translateY(${(1 - prog(f, at, 14)) * 30}px)`}}>
      <Img src={staticFile(`media/${img}`)} style={{width: 112, height: 136, borderRadius: 18, objectFit: 'cover', border: `2px solid ${LINE}`}} />
      <div>
        <div style={{fontSize: 24, letterSpacing: '0.04em', color: MUTED}}>{kind}</div>
        <div style={{fontSize: 36, fontWeight: 700, color: INK, marginTop: 4}}>{title}</div>
        {sub && <div style={{fontSize: 28, color: MUTED, marginTop: 4}}>{sub}</div>}
      </div>
    </div>
  );
};

const ResultCard: React.FC<{c: ChatPubCfg; T: Record<string, number>}> = ({c, T}) => {
  const f = useCurrentFrame();
  const g = interpolate(f, [T.genStart, T.genDone], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: INOUT});
  const ready = f >= T.genDone;
  const published = f >= T.published;
  const press = f >= T.tapPublish - 3 && f < T.tapPublish + 3;
  const btn = (label: string, icon: React.ReactNode) => (
    <div style={{display: 'flex', alignItems: 'center', gap: 12, padding: '18px 22px', borderRadius: 18, border: `2px solid ${LINE}`, fontSize: 28, fontWeight: 500, color: INK, whiteSpace: 'nowrap'}}>{icon}{label}</div>
  );
  return (
    <div style={{width: 1000, borderRadius: 40, border: `2px solid ${LINE}`, background: '#fff', padding: 26, boxShadow: '0 30px 60px -44px rgba(24,24,27,0.35)'}}>
      <div style={{display: 'flex', gap: 28}}>
        <div style={{position: 'relative', width: 320, height: 568, borderRadius: 26, overflow: 'hidden', background: '#27272A', flexShrink: 0}}>
          {ready ? (
            <OffthreadVideo src={staticFile(`media/${c.video}`)} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />
          ) : (
            <>
              {c.actor && <Img src={staticFile(`media/${c.actor.img}`)} style={{width: '100%', height: '100%', objectFit: 'cover', filter: `blur(${(1 - g) * 22}px) saturate(${0.4 + g * 0.6})`, opacity: 0.25 + g * 0.6}} />}
              <div style={{position: 'absolute', inset: 0, background: `linear-gradient(115deg, transparent 20%, rgba(255,255,255,0.18) ${(f * 4) % 140 - 20}%, transparent ${(f * 4) % 140 + 10}%)`}} />
              <div style={{position: 'absolute', left: 22, right: 22, bottom: 24, color: '#fff', fontSize: 24, fontWeight: 600}}>
                Génération… {Math.round(g * 100)} %
                <div style={{marginTop: 10, height: 8, borderRadius: 99, background: 'rgba(255,255,255,0.25)'}}>
                  <div style={{width: `${g * 100}%`, height: '100%', borderRadius: 99, backgroundImage: GRAD}} />
                </div>
              </div>
            </>
          )}
          <div style={{position: 'absolute', left: 16, top: 16, padding: '8px 16px', borderRadius: 12, background: 'rgba(24,24,27,0.7)', color: '#fff', fontSize: 24, fontWeight: 600}}>Vidéo</div>
        </div>
        <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: 20}}>
          <div style={{fontSize: 34, fontWeight: 700, color: INK, lineHeight: 1.25}}>{c.title}</div>
          <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 10, padding: '8px 18px', borderRadius: 999, background: ready ? '#E8F7EE' : '#FEF3C7', color: ready ? '#15803D' : '#B45309', fontSize: 26, fontWeight: 600}}>
              <div style={{width: 12, height: 12, borderRadius: 99, background: ready ? '#22C55E' : '#F59E0B'}} />
              {ready ? 'Prête' : 'En génération'}
            </div>
            <div style={{fontSize: 26, color: MUTED}}>Vidéo</div>
          </div>
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, height: 84, borderRadius: 18, background: published ? '#16A34A' : BLUE, color: '#fff', fontSize: 31, fontWeight: 600, opacity: ready ? 1 : 0.35, transform: `scale(${press ? 0.95 : 1})`, boxShadow: ready ? '0 14px 30px -14px rgba(59,110,245,0.8)' : 'none'}}>
            {published ? <Check s={32} /> : <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinejoin="round"><path d="M21 3L10 14M21 3l-7 18-4-7-7-4z" /></svg>}
            {published ? 'Publiée sur Meta' : 'Publier sur Meta'}
          </div>
          <div style={{display: 'flex', gap: 12, opacity: ready ? 1 : 0.35}}>
            {btn('Aperçu Meta', <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={INK} strokeWidth="2"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></svg>)}
            {btn('Éditeur', <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={INK} strokeWidth="2"><rect x="3" y="5" width="18" height="15" rx="2" /><path d="M3 9h18M8 5l2 4M14 5l2 4" /></svg>)}
          </div>
          <div style={{fontSize: 22, fontWeight: 700, letterSpacing: '0.08em', color: MUTED, marginTop: 4}}>ET ENSUITE ?</div>
          <div style={{display: 'flex', flexWrap: 'wrap', gap: 12, opacity: ready ? 1 : 0.35}}>
            {['Générer une variation', 'Décliner en 1:1'].map((t) => (
              <div key={t} style={{padding: '14px 22px', borderRadius: 999, border: `2px solid ${LINE}`, fontSize: 26, color: INK}}>{t}</div>
            ))}
          </div>
        </div>
      </div>
      {['Prompt utilisé', 'Détails et voix'].map((t) => (
        <div key={t} style={{display: 'flex', justifyContent: 'space-between', borderTop: `2px solid ${SOFT}`, marginTop: 22, paddingTop: 20, fontSize: 28, color: '#52525B'}}>
          <span>{t}</span>
          <span style={{color: MUTED}}>Afficher</span>
        </div>
      ))}
    </div>
  );
};

const TopBar: React.FC = () => (
  <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 170, background: 'rgba(255,255,255,0.92)', borderBottom: `2px solid ${LINE}`, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '0 40px 26px'}}>
    <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
      <LogoMark size={52} />
      <Wordmark size={46} />
    </div>
    <div style={{display: 'flex', alignItems: 'center', gap: 12, padding: '12px 22px', borderRadius: 999, border: `2px solid ${LINE}`, background: '#fff', fontSize: 26, fontWeight: 600, color: '#3F3F46'}}>
      <div style={{width: 14, height: 14, borderRadius: 99, background: '#22C55E'}} />
      Meta connecté
    </div>
  </div>
);

// ---------- the chat scene (frames are absolute timeline frames) ----------
const ChatScene: React.FC<{c: ChatPubCfg; T: Record<string, number>; phase: 'make' | 'publish'}> = ({c, T, phase}) => {
  const f = useCurrentFrame();
  const thread = phase === 'publish' ? 1 : prog(f, T.threadIn, 18, INOUT);
  const text = phase === 'make' && f < T.send ? typed(c.prompt, f, T.typeStart, T.send - 8) : '';
  const focus = phase === 'make' && f >= T.typeStart - 8 && f < T.send + 2;
  const actorOn = phase === 'publish' || f >= T.actorChip;
  const pressChip = f >= T.tapActorChip - 3 && f < T.tapActorChip + 4;
  const composerTop = interpolate(thread, [0, 1], [860, 1622]);
  const toast = phase === 'publish' ? prog(f, T.published + 2, 12) * (1 - prog(f, T.end - 8, 8)) : 0;
  return (
    <AbsoluteFill style={{background: '#FCFCFD', fontFamily: FONT}}>
      <AbsoluteFill style={{background: 'radial-gradient(1200px 700px at 50% 0%, rgba(124,108,255,0.10), transparent 70%)'}} />
      {/* empty state */}
      {thread < 1 && (
        <div style={{position: 'absolute', left: 0, right: 0, top: 360, display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: 1 - thread, transform: `translateY(${-thread * 120}px)`}}>
          <div style={{transform: `scale(${pop(f, T.hookEnd + 2, 14)})`}}><LogoTile s={150} /></div>
          <div style={{marginTop: 54, fontSize: 66, fontWeight: 800, color: '#09090B', letterSpacing: '-0.025em', opacity: prog(f, T.hookEnd + 6, 12)}}>Que veux-tu créer aujourd’hui ?</div>
          <div style={{marginTop: 22, fontSize: 36, color: MUTED, opacity: prog(f, T.hookEnd + 10, 12)}}>Décris ta pub avec tes mots, ou pars d’un exemple.</div>
        </div>
      )}
      {/* thread */}
      {thread > 0 && (
        <div style={{position: 'absolute', left: 40, right: 40, top: 200, opacity: thread}}>
          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 18}}>
            {c.actor && <AttachCard kind="ACTEUR" title={c.actor.name} sub={c.actor.desc} img={c.actor.img} at={phase === 'publish' ? -99 : T.send} />}
            {c.product && <AttachCard kind="PRODUIT" title={c.product.name} sub={c.product.price} img={c.product.img} at={phase === 'publish' ? -99 : T.send + 4} />}
            <div style={{maxWidth: 880, background: INK, color: '#fff', borderRadius: 40, padding: '28px 36px', fontSize: 34, lineHeight: 1.42, opacity: phase === 'publish' ? 1 : prog(f, T.send + 6, 10), transform: `translateY(${phase === 'publish' ? 0 : (1 - prog(f, T.send + 6, 14)) * 30}px)`}}>{c.prompt}</div>
          </div>
          <div style={{display: 'flex', alignItems: 'center', gap: 20, marginTop: 34, opacity: phase === 'publish' ? 1 : prog(f, T.reply, 10)}}>
            <LogoTile s={64} />
            <div style={{fontSize: 34, color: INK}}>
              {c.product ? '' : 'Pas de produit à importer. '}Je lance la vidéo avec <b>{c.actor?.name.replace(/\.$/, '')}</b>.
            </div>
          </div>
          <div style={{marginTop: 26, opacity: phase === 'publish' ? 1 : prog(f, T.genStart - 4, 10), transform: `translateY(${phase === 'publish' ? 0 : (1 - prog(f, T.genStart - 4, 16)) * 40}px)`}}>
            <ResultCard c={c} T={T} />
          </div>
        </div>
      )}
      <TopBar />
      <div style={{position: 'absolute', left: 40, top: composerTop}}>
        <Composer c={c} T={T} text={text} focus={focus} actorOn={actorOn} pressChip={pressChip} />
      </div>
      {phase === 'make' && f < T.modalOut + 16 && f >= T.modalIn - 2 && <ActorModal c={c} T={T} />}
      {/* taps */}
      {phase === 'make' && <Tap x={430} y={860 + 26 + 42} at={T.tapActorChip} />}
      {phase === 'make' && (() => {
        const i = c.gallery.findIndex((g) => g.name === c.actor?.name) + 1;
        const colW = (1020 - 88 - 36) / 3;
        return <Tap x={30 + 44 + (i % 3) * (colW + 18) + colW / 2} y={200 + 452 + 28 + Math.floor(i / 3) * 348 + 165} at={T.tapCharlotte} />;
      })()}
      {phase === 'make' && <Tap x={880} y={200 + 452 + 28 + 3 * 348 + 30 + 50} at={T.tapUse} />}
      {phase === 'publish' && <Tap x={40 + 26 + 320 + 28 + 300} y={200 + 0} at={-999} />}
      {/* publish toast */}
      {phase === 'publish' && (
        <div style={{position: 'absolute', left: 90, right: 90, top: 196, display: 'flex', justifyContent: 'center', opacity: toast, transform: `translateY(${(1 - toast) * -30}px)`}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 16, padding: '22px 34px', borderRadius: 999, background: INK, color: '#fff', fontSize: 32, fontWeight: 600, boxShadow: '0 20px 50px -20px rgba(0,0,0,0.6)'}}>
            <div style={{width: 46, height: 46, borderRadius: 99, background: '#22C55E', display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Check s={28} /></div>
            Pub en ligne · Facebook & Instagram
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};

// voice captions: short karaoke chunks
const VoCaption: React.FC<{words: Word[]; at: number; y: number; dark?: boolean; size?: number}> = ({words, at, y, dark, size = 50}) => {
  const f = useCurrentFrame();
  const t = (f - at) / 30;
  if (t < 0 || !words.length || t > words[words.length - 1].e + 0.35) return null;
  const chunks: Word[][] = [];
  let cur: Word[] = [];
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
    <div style={{position: 'absolute', left: 50, right: 50, top: y, display: 'flex', justifyContent: 'center'}}>
      <div style={{fontFamily: FONT, fontWeight: 800, fontSize: size, lineHeight: 1.15, textAlign: 'center', padding: dark ? '16px 30px' : 0, borderRadius: 22, background: dark ? 'rgba(24,24,27,0.88)' : 'transparent', color: '#fff', textShadow: dark ? 'none' : '0 4px 26px rgba(0,0,0,0.6)', boxShadow: dark ? '0 18px 40px -18px rgba(0,0,0,0.6)' : 'none'}}>
        {chunk.map((w, i) => {
          const on = t >= w.s - 0.02;
          const hot = on && t <= w.e + 0.08;
          return (
            <span key={i} style={{color: on ? '#fff' : 'rgba(255,255,255,0.4)', ...(hot ? {backgroundImage: 'linear-gradient(100deg,#A5B4FC,#C4B5FD,#F0ABFC)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'} : {})}}>
              {w.w}{' '}
            </span>
          );
        })}
      </div>
    </div>
  );
};

const EndScene: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: '#FCFCFD', alignItems: 'center', justifyContent: 'center', fontFamily: FONT}}>
      <AbsoluteFill style={{background: 'radial-gradient(900px 900px at 50% 45%, rgba(124,108,255,0.16), transparent 70%)'}} />
      <div style={{transform: `scale(${pop(f, 2, 13)})`}}><LogoTile s={170} /></div>
      <div style={{marginTop: 40, opacity: prog(f, 6, 12)}}><Wordmark size={84} reveal={prog(f, 6, 16)} /></div>
      <div style={{marginTop: 50, fontFamily: '"Space Grotesk", Inter, sans-serif', fontWeight: 700, fontSize: 74, color: '#09090B', letterSpacing: '-0.025em', textAlign: 'center', lineHeight: 1.08, opacity: prog(f, 14, 12), transform: `translateY(${(1 - prog(f, 14, 14)) * 24}px)`}}>
        Une phrase dans le chat.
        <br />
        <span style={{backgroundImage: GRAD, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>Votre pub en ligne.</span>
      </div>
      <div style={{marginTop: 64, display: 'flex', alignItems: 'center', gap: 14, padding: '24px 42px', borderRadius: 999, background: INK, color: '#fff', fontSize: 40, fontWeight: 700, transform: `scale(${pop(f, 24, 13)})`}}>
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#C4B5FD" strokeWidth="2.6" strokeLinecap="round"><path d="M12 19V5M6 11l6-6 6 6" /></svg>
        Lien en bio
      </div>
      <AbsoluteFill style={{background: '#000', opacity: interpolate(f, [88, 100], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}} />
    </AbsoluteFill>
  );
};

// shift absolute timings into a Sequence's local frames
const local = (T: Record<string, number>, off: number) => Object.fromEntries(Object.entries(T).map(([k, v]) => [k, v - off]));

export const ChatToAd: React.FC<{cfg: ChatPubCfg}> = ({cfg: c}) => {
  useFonts();
  const f = useCurrentFrame();
  const T = timeline(c);
  const W = c.words ?? {};
  const V = c.voice;
  // camera
  const cam = interpolate(f, [T.hookEnd, T.tapActorChip - 6, T.modalIn, T.modalOut + 10, T.typeStart, T.send, T.threadIn + 18, T.genStart + 10, T.genDone, T.zoom, T.videoStart], [1.0, 1.05, 1.0, 1.0, 1.05, 1.05, 1.0, 1.0, 1.03, 1.03, 3.0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EXPO});
  const origin = f < T.threadIn ? '50% 52%' : f < T.genDone ? '50% 60%' : '21% 54%';
  const camPub = interpolate(f, [T.back, T.back + 20, T.tapPublish - 10, T.published + 10], [1.12, 1.0, 1.0, 1.04], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EXPO});
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {/* 1. hook */}
      <Sequence durationInFrames={T.hookEnd + 4}>
        <AbsoluteFill style={{transform: `scale(${1.06 - f * 0.0006})`}}>
          <OffthreadVideo src={staticFile(`media/${c.video}`)} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />
        </AbsoluteFill>
        <AbsoluteFill style={{background: 'linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.6) 100%)'}} />
        <VoCaption words={W[V.a] ?? []} at={6} y={1400} size={74} />
        <AbsoluteFill style={{background: '#FCFCFD', opacity: prog(f, T.hookEnd - 4, 8)}} />
      </Sequence>
      {/* 2. made in the chat */}
      <Sequence from={T.hookEnd} durationInFrames={T.videoStart - T.hookEnd}>
        <AbsoluteFill style={{transform: `scale(${cam})`, transformOrigin: origin}}>
          <ChatScene c={c} T={local(T, T.hookEnd)} phase="make" />
        </AbsoluteFill>
        <VoCaption words={W[V.b1] ?? []} at={T.tapActorChip - 4 - T.hookEnd} y={92} dark size={44} />
        <VoCaption words={W[V.b2] ?? []} at={T.typeStart + 4 - T.hookEnd} y={1460} dark size={44} />
        <VoCaption words={W[V.b3] ?? []} at={T.genStart - T.hookEnd} y={1480} dark size={44} />
        <AbsoluteFill style={{background: '#000', opacity: prog(f, T.videoStart - 10, 10)}} />
      </Sequence>
      {/* 3. the full ad with its sound */}
      <Sequence from={T.videoStart} durationInFrames={c.videoFrames}>
        <OffthreadVideo src={staticFile(`media/${c.video}`)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
        <AbsoluteFill style={{background: '#000', opacity: 1 - prog(f, T.videoStart, 8)}} />
      </Sequence>
      {/* 4. publish */}
      <Sequence from={T.back} durationInFrames={T.end - T.back + 6}>
        <AbsoluteFill style={{transform: `scale(${camPub})`, transformOrigin: '50% 45%'}}>
          <ChatScene c={c} T={local(T, T.back)} phase="publish" />
          <PublishTap T={local(T, T.back)} />
        </AbsoluteFill>
        <VoCaption words={W[V.d1] ?? []} at={4} y={1460} dark size={44} />
        <AbsoluteFill style={{background: '#fff', opacity: 1 - prog(f, T.back, 10)}} />
      </Sequence>
      {/* 5. end */}
      <Sequence from={T.end} durationInFrames={T.total - T.end}>
        <EndScene />
      </Sequence>
      {/* audio */}
      <Sequence from={6}><Audio src={staticFile(`voice/${V.a}.mp3`)} /></Sequence>
      <Sequence from={T.tapActorChip - 4}><Audio src={staticFile(`voice/${V.b1}.mp3`)} /></Sequence>
      <Sequence from={T.typeStart + 4}><Audio src={staticFile(`voice/${V.b2}.mp3`)} /></Sequence>
      <Sequence from={T.genStart}><Audio src={staticFile(`voice/${V.b3}.mp3`)} /></Sequence>
      <Sequence from={T.back + 4}><Audio src={staticFile(`voice/${V.d1}.mp3`)} /></Sequence>
      <Sequence from={T.published + 8}><Audio src={staticFile(`voice/${V.d2}.mp3`)} /></Sequence>
      <Audio src={staticFile(`chatpub/${c.id}-bed.wav`)} />
    </AbsoluteFill>
  );
};

// tap on « Publier sur Meta » (button position inside the result card)
const PublishTap: React.FC<{T: Record<string, number>}> = ({T}) => {
  // result card top = 200 + user stack + reply; measured: button centre ≈ (40+26+320+28+300, 1052)
  return <Tap x={714} y={T.btnY ?? 985} at={T.tapPublish} />;
};
