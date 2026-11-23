// « Laquelle est une vraie ? » — pub motion 9:16 (Meta Ads + organique), mode clair, zones sûres Reels
// (texte entre x 110–970 et y 230–1440).
// Accroche : deux vidéos UGC côte à côte, « une a été tournée avec un vrai acteur, laquelle ? », compte à rebours
// (incite à commenter), révélation « aucune des deux, créées dans Growthity », puis comment : une phrase, un acteur,
// voix + sous-titres, publiée sur Meta en un clic → « Ta prochaine pub ? Sans tournage. »
// Aucun chiffre de résultat ; deux personnes qui n'apparaissent dans aucun autre short (Léa — isolation,
// homme en pull gris — aspirateur v1).
import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, continueRender, delayRender, interpolate, random, spring, staticFile, useCurrentFrame} from 'remotion';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/inter/800.css';
import '@fontsource/inter/900.css';
import {LogoMark, Wordmark} from '../components/UI';
import {INOUT, prog} from '../components/anim';
import {BRAND_PATHS} from '../components/brands';
import WORDS from './words.json';
import TLJ from './timeline.json';
import ACTORS from '../organic/actors_real.json';

type Word = {w: string; s: number; e: number};
const WD = WORDS as unknown as Record<string, Word[]>;
const TL = TLJ as unknown as {VO: Record<string, number>; S: Record<string, number>};
export const DS2 = TL.S;
const DS = TL.S;
const VO = TL.VO;
const PAGE = '#F4F4F7', SURF = '#FFFFFF', LINE = '#E7E7EE', FG = '#141418', DIM = '#737381';
const ACC = '#5B3FE4', OK = '#137A45', OK_SOFT = '#E6F5EC', RED = '#E11D48';
const GRAD = 'linear-gradient(120deg, #2563EB 0%, #5B3FE4 52%, #9333EA 100%)';
const FONT = 'Inter, system-ui, sans-serif';
const SH = '0 1px 2px rgba(20,20,40,.04), 0 10px 30px rgba(20,20,40,.08)';
const SH_LG = '0 40px 90px -30px rgba(20,20,60,.4)';
const sp = (f: number, d = 14, m = 0.8) => spring({frame: f, fps: 30, config: {damping: d, mass: m, stiffness: 170}});
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const G: React.FC<{children: React.ReactNode}> = ({children}) => <span style={{backgroundImage: GRAD, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent'}}>{children}</span>;
const cue = (k: number, start: string, d = 0) => {
  const w = WD[`dr-${k}`].find((x) => x.w.toLowerCase().startsWith(start));
  return VO[k] + Math.round((w ? w.s : d) * 30);
};
const VA = staticFile('media/duel2/a.mp4');
const VB = staticFile('media/duel2/b.mp4');
const Brand: React.FC<{k: string; s: number; c?: string}> = ({k, s, c}) => <svg width={s} height={s} viewBox="0 0 24 24"><path d={BRAND_PATHS[k]} fill={c ?? ({facebook: '#0866FF', instagram: '#FF0069', meta: '#0866FF'} as Record<string, string>)[k]} /></svg>;

const useFonts = () => {
  const [h] = useState(() => delayRender('fonts'));
  useEffect(() => { Promise.all(['600 20px Inter', '700 20px Inter', '800 20px Inter', '900 20px Inter'].map((s) => document.fonts.load(s))).then(() => continueRender(h)); }, [h]);
};

const Bg: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: PAGE}}>
      <AbsoluteFill style={{background: `radial-gradient(900px 900px at ${50 + Math.sin(f / 40) * 8}% ${40 + Math.cos(f / 50) * 6}%, rgba(91,63,228,0.14), transparent 70%)`}} />
      <AbsoluteFill style={{background: `radial-gradient(700px 700px at ${20 - Math.sin(f / 35) * 6}% 85%, rgba(37,99,235,0.10), transparent 70%)`}} />
      <AbsoluteFill style={{backgroundImage: 'radial-gradient(rgba(20,20,40,0.07) 1.4px, transparent 1.6px)', backgroundSize: '36px 36px', maskImage: 'radial-gradient(ellipse at 50% 45%, black 25%, transparent 75%)', WebkitMaskImage: 'radial-gradient(ellipse at 50% 45%, black 25%, transparent 75%)'}} />
    </AbsoluteFill>
  );
};

const Title: React.FC<{start: number; end: number; a: React.ReactNode; b?: React.ReactNode; bAt?: number; top?: number; size?: number}> = ({start, end, a, b, bAt, top = 250, size = 96}) => {
  const f = useCurrentFrame();
  if (f < start - 1 || f > end + 1) return null;
  const p1 = sp(f - start, 12), p2 = sp(f - (bAt ?? start + 5), 12), o = prog(f, end - 8, 8, INOUT);
  return (
    <div style={{position: 'absolute', left: 110, right: 110, top, textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: size, lineHeight: 1.0, letterSpacing: '-0.055em', color: FG, opacity: 1 - o, transform: `translateY(${-o * 30}px)`}}>
      <div style={{overflow: 'hidden', paddingBottom: 8}}><div style={{transform: `translateY(${(1 - p1) * 110}%)`}}>{a}</div></div>
      {b && <div style={{overflow: 'hidden', paddingBottom: 10}}><div style={{transform: `translateY(${(1 - p2) * 110}%)`}}><G>{b}</G></div></div>}
    </div>
  );
};

// ---------- 1-3. le duel : deux vidéos, compte à rebours, révélation ----------
const Card: React.FC<{src: string; x: number; label: string; from: number; reveal: number; tilt: number}> = ({src, x, label, from, reveal, tilt}) => {
  const f = useCurrentFrame();
  const inP = sp(f - 2, 13);
  const rv = sp(f - reveal, 10);
  return (
    <div style={{position: 'absolute', left: x, top: 470, width: 400, height: 711, borderRadius: 40, overflow: 'hidden', background: '#000', border: '8px solid #fff', boxShadow: SH_LG, transform: `translateY(${(1 - inP) * 300}px) rotate(${tilt * (1 - rv * 0.6)}deg)`}}>
      <OffthreadVideo muted src={src} startFrom={from} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      <div style={{position: 'absolute', left: 18, top: 18, width: 74, height: 74, borderRadius: 22, background: SURF, display: 'grid', placeItems: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 44, color: FG, boxShadow: SH}}>{label}</div>
      {f >= reveal && (
        <div style={{position: 'absolute', left: 0, right: 0, top: 290, display: 'flex', justifyContent: 'center'}}>
          <div style={{padding: '14px 24px', borderRadius: 18, border: `6px solid ${ACC}`, background: 'rgba(255,255,255,0.94)', color: ACC, fontFamily: FONT, fontWeight: 900, fontSize: 25, whiteSpace: 'nowrap', letterSpacing: '0.02em', transform: `scale(${2.2 - rv * 1.2}) rotate(-8deg)`, opacity: Math.min(1, rv * 2)}}>CRÉÉ AVEC GROWTHITY</div>
        </div>
      )}
    </div>
  );
};
const Duel: React.FC = () => {
  const f = useCurrentFrame();
  if (f > DS.make + 10) return null;
  const out = prog(f, DS.make - 6, 14, INOUT);
  const reveal = cue(3, 'raté', 0.1);
  const nums = [['trois', '3'], ['deux', '2'], ['un', '1']] as const;
  return (
    <AbsoluteFill style={{opacity: 1 - out, transform: `scale(${1 - out * 0.08})`}}>
      <Card src={VA} x={110} label="A" from={0} reveal={reveal} tilt={-3} />
      <Card src={VB} x={570} label="B" from={0} reveal={reveal + 6} tilt={3} />
      {f >= DS.count && f < reveal && (
        <>
          {[['💬 B, trop vrai', 140, 1210, 0], ['💬 A sans hésiter', 560, 1250, 9], ['💬 Les deux ?!', 360, 1320, 18]].map(([t, x, y, d]) => {
            const p = sp(f - DS.count - (d as number), 11);
            return <div key={t as string} style={{position: 'absolute', left: x as number, top: y as number, padding: '14px 22px', borderRadius: 22, background: SURF, boxShadow: SH, fontFamily: FONT, fontWeight: 800, fontSize: 30, color: FG, transform: `scale(${p})`, opacity: p}}>{t}</div>;
          })}
          {nums.map(([w, n]) => {
            const a = cue(2, w, 0), next = a + 22;
            if (f < a || f > next) return null;
            const p = sp(f - a, 9);
            return <div key={n} style={{position: 'absolute', left: 0, right: 0, top: 610, textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 380, color: '#fff', WebkitTextStroke: `10px ${ACC}`, paintOrder: 'stroke fill', textShadow: '0 30px 60px rgba(91,63,228,.5)', transform: `scale(${1.6 - p * 0.6})`, opacity: Math.min(1, p * 2) * (1 - prog(f, next - 6, 6))}}>{n}</div>;
          })}
        </>
      )}
    </AbsoluteFill>
  );
};

// ---------- 4. comment : une phrase, un acteur, voix + sous-titres ----------
const PROMPT = 'Une pub pour mes pergolas solaires, avec une cliente sur sa terrasse.';
const Make: React.FC = () => {
  const f = useCurrentFrame();
  if (f < DS.make - 2 || f > DS.pub + 12) return null;
  const inP = sp(f - DS.make - 2, 14);
  const out = prog(f, DS.pub - 4, 14, INOUT);
  const typed = PROMPT.slice(0, Math.max(0, Math.floor((f - DS.make - 4) * 2.2)));
  const actorAt = cue(4, 'tu', 1.4) + 30; // « tu choisis ton acteur »
  const choose = cue(4, 'choisis', 1.6);
  const voixAt = cue(4, 'voix', 3.0), subAt = cue(4, 'sous-titres', 3.6);
  const NAMES = ['Didier A.', 'Inès A.', 'Sandrine', 'Kai', 'Thomas', 'Anaïs'];
  const faces = NAMES.map((n) => (ACTORS as {name: string; img: string}[]).find((a) => a.name === n)!).filter(Boolean);
  const pick = 2;
  return (
    <AbsoluteFill style={{opacity: 1 - out}}>
      <div style={{position: 'absolute', left: 120, right: 120, top: 470, padding: '22px 24px', borderRadius: 28, background: SURF, border: `2px solid ${ACC}`, boxShadow: SH_LG, display: 'flex', alignItems: 'center', gap: 14, opacity: Math.min(1, inP * 1.5), transform: `translateY(${(1 - inP) * 40}px)`}}>
        <span style={{flex: 1, fontFamily: FONT, fontWeight: 600, fontSize: 31, lineHeight: 1.3, color: FG, minHeight: 82}}>{typed}<span style={{color: ACC, opacity: Math.floor(f / 8) % 2 ? 0 : 1}}>|</span></span>
        <span style={{width: 64, height: 64, borderRadius: 32, background: typed.length === PROMPT.length ? ACC : '#D7D7E1', color: '#fff', display: 'grid', placeItems: 'center', fontSize: 30, fontWeight: 900, flex: 'none'}}>↑</span>
      </div>
      {f >= choose - 6 && (
        <div style={{position: 'absolute', left: 120, right: 120, top: 680, padding: '22px 22px', borderRadius: 28, background: SURF, border: `1px solid ${LINE}`, boxShadow: SH, opacity: sp(f - choose + 6, 12)}}>
          <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 26, color: DIM, marginBottom: 14}}>🎭 Choisis ton acteur</div>
          <div style={{display: 'flex', gap: 12}}>
            {faces.map((a, i) => {
              const on = i === pick && f >= choose + 6;
              return <div key={a.img} style={{position: 'relative', flex: 1, height: 150, borderRadius: 18, overflow: 'hidden', boxShadow: on ? `0 0 0 5px ${ACC}` : 'none', transform: on ? 'scale(1.06)' : 'none'}}>
                <Img src={staticFile(`media/${a.img}`)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 30%'}} />
              </div>;
            })}
          </div>
        </div>
      )}
      <div style={{position: 'absolute', left: 110, right: 110, top: 960, display: 'flex', justifyContent: 'center', gap: 14}}>
        {[['🎙️', 'Voix ajoutée', voixAt], ['💬', 'Sous-titres ajoutés', subAt]].map(([ic, t, at]) => {
          const p = sp(f - (at as number), 10);
          return f >= (at as number) ? <span key={t as string} style={{display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 22px', borderRadius: 999, background: OK_SOFT, color: OK, fontFamily: FONT, fontWeight: 800, fontSize: 28, transform: `scale(${0.5 + 0.5 * p})`, opacity: p}}>{ic} {t} ✓</span> : null;
        })}
      </div>
      {f >= subAt + 4 && (
        <div style={{position: 'absolute', left: 540 - 125, top: 1060, width: 250, height: 380, borderRadius: 30, overflow: 'hidden', border: '6px solid #fff', boxShadow: SH_LG, transform: `scale(${sp(f - subAt - 4, 12)})`}}>
          <Img src={staticFile(`media/${faces[pick].img}`)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 30%'}} />
          <div style={{position: 'absolute', left: 0, right: 0, bottom: 40, textAlign: 'center'}}><span style={{background: ACC, color: '#fff', fontFamily: FONT, fontWeight: 900, fontSize: 24, padding: '4px 10px', borderRadius: 8}}>FRANCHEMENT</span></div>
          <div style={{position: 'absolute', right: 10, top: 10, padding: '4px 10px', borderRadius: 999, background: OK, color: '#fff', fontFamily: FONT, fontWeight: 800, fontSize: 16}}>Prête</div>
        </div>
      )}
      {f > DS.make && f < DS.make + 3 && null}
    </AbsoluteFill>
  );
};

// ---------- 5. en un clic, sur Facebook et Instagram ----------
const Publish: React.FC = () => {
  const f = useCurrentFrame();
  if (f < DS.pub - 2 || f > DS.end + 10) return null;
  const out = prog(f, DS.end - 4, 12, INOUT);
  const press = cue(5, 'clic', 0.4);
  const fb = cue(5, 'facebook', 1.8), ig = cue(5, 'instagram', 2.3);
  const down = f >= press && f < press + 6;
  const icon = (at: number, x: number, k: string) => {
    const p = sp(f - at, 10);
    return f >= at - 1 ? <div key={k} style={{position: 'absolute', left: x, top: 1040, width: 170, height: 170, borderRadius: 46, background: SURF, border: `1px solid ${LINE}`, display: 'grid', placeItems: 'center', boxShadow: SH_LG, transform: `scale(${p}) rotate(${(1 - p) * -20}deg)`}}><Brand k={k} s={100} /><span style={{position: 'absolute', right: -10, top: -10, width: 54, height: 54, borderRadius: 27, background: OK, border: '5px solid #fff', color: '#fff', fontFamily: FONT, fontWeight: 900, fontSize: 26, display: 'grid', placeItems: 'center', opacity: prog(f, at + 8, 6)}}>✓</span></div> : null;
  };
  return (
    <AbsoluteFill style={{opacity: 1 - out}}>
      <div style={{position: 'absolute', left: 540 - 300, top: 640, width: 600, height: 170, borderRadius: 85, background: '#0866FF', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18, color: '#fff', fontFamily: FONT, fontWeight: 900, fontSize: 52, boxShadow: '0 30px 60px -20px rgba(8,102,255,.7)', transform: `scale(${sp(f - DS.pub, 12) * (down ? 0.92 : 1)})`}}>
        <Brand k="meta" s={70} c="#fff" />Publier sur Meta
      </div>
      {f >= press && f < press + 18 && <div style={{position: 'absolute', left: 540 - 300, top: 640, width: 600, height: 170, borderRadius: 85, border: '6px solid #0866FF', transform: `scale(${1 + (f - press) / 18 * 0.4})`, opacity: 1 - (f - press) / 18}} />}
      {icon(fb, 250, 'facebook')}
      {icon(ig, 660, 'instagram')}
    </AbsoluteFill>
  );
};

// ---------- 6. fin ----------
const End: React.FC = () => {
  const f = useCurrentFrame(); // local
  const L = (k: string, d: number) => cue(6, k, d) - DS.end;
  const logo = sp(f - 2, 12), a = sp(f - L('une', 0.05) + 2, 12), b = sp(f - L('et', 1.0) + 2, 12);
  const btnAt = L('tourné', 1.9) + 10;
  const bp = sp(f - btnAt, 11);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 0, right: 0, top: 300, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 18, transform: `scale(${logo})`}}>
        <div style={{width: 100, height: 100, borderRadius: 30, background: SURF, border: `1px solid ${LINE}`, boxShadow: SH, display: 'grid', placeItems: 'center'}}><LogoMark size={64} draw={prog(f, 2, 18)} /></div>
        <Wordmark size={66} />
      </div>
      <div style={{position: 'absolute', left: 90, right: 90, top: 520, textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 124, lineHeight: 1.02, letterSpacing: '-0.06em', color: FG}}>
        <div style={{opacity: a, transform: `translateY(${(1 - a) * 40}px)`}}>Une vraie pub.</div>
        <div style={{opacity: b, transform: `translateY(${(1 - b) * 40}px)`}}><G>Rien tourné.</G></div>
      </div>
      <div style={{position: 'absolute', left: 540 - 270, top: 1010, width: 540, height: 150, borderRadius: 75, background: GRAD, display: 'grid', placeItems: 'center', color: '#fff', fontFamily: FONT, fontWeight: 900, fontSize: 52, boxShadow: '0 30px 60px -20px rgba(91,63,228,.7)', transform: `scale(${bp})`, opacity: Math.min(1, bp * 1.5)}}>Commencer →</div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1200, textAlign: 'center', fontFamily: FONT, fontWeight: 700, fontSize: 34, color: DIM, opacity: prog(f, btnAt + 6, 10)}}>growthity.ai</div>
    </AbsoluteFill>
  );
};

export const Duel2Video: React.FC = () => {
  useFonts();
  const f = useCurrentFrame();
  const flash = (at: number) => interpolate(f, [at - 1, at, at + 5], [0, 0.5, 0], clamp);
  const reveal = cue(3, 'raté', 0.1);
  return (
    <AbsoluteFill style={{background: PAGE, fontFamily: FONT}}>
      <Bg />
      <Title start={2} end={DS.count} a="Un vrai client." b="Lequel ?" bAt={cue(1, 'lequel', 4.2)} top={240} size={92} />
      <Title start={DS.count + 2} end={reveal - 2} a="Réponds en" b="commentaire 👇" size={86} top={240} />
      <Title start={reveal} end={DS.make} a="Raté : aucun des deux." b="Créés dans Growthity." size={76} top={240} />
      <Duel />
      <Title start={DS.make + 2} end={DS.pub} a="Une phrase." b="Un acteur réaliste." size={90} />
      <Make />
      <Title start={DS.pub + 2} end={DS.end} a="Un clic," b="elle tourne sur Meta." size={90} />
      <Publish />
      <Sequence from={DS.end}><End /></Sequence>
      <AbsoluteFill style={{background: '#fff', opacity: Math.max(flash(reveal), flash(DS.end)), pointerEvents: 'none'}} />
      <Audio src={staticFile('duel2/bed.wav')} />
      {[1, 2, 3, 4, 5, 6].map((k) => <Sequence key={k} from={VO[k]}><Audio src={staticFile(`voice/dr-${k}-n.mp3`)} /></Sequence>)}
    </AbsoluteFill>
  );
};
