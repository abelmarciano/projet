import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {StudioBg} from '../components/Backgrounds';
import {Clip} from '../components/Media';
import {Sparkle} from '../components/UI';
import {prog, pop, INOUT, mix} from '../components/anim';
import {C, DISPLAY, FONT, GRAD} from '../theme';
import {SceneProps, wordAt} from './timeline';
import {EndCard, Phone, Pill, R, SAFE_CX, gradText} from './kit';

const ADS = [
  {src: 'img-pac-fioul.webp', brand: 'Éco Habitat', days: 47, win: true},
  {src: 'ugc-homme.mp4', brand: 'ThermoConfort', days: 62, win: true},
  {src: 'img-pac-rge.webp', brand: 'RénoPro', days: 9, win: false},
  {src: 'ugc-pac-hugo.mp4', brand: 'Maison Éco', days: 33, win: true},
];
const CW = 400;
const CH = 360;
const GX = 40;
const cardPos = (i: number) => ({x: R.x + (i % 2) * (CW + GX), y: 430 + Math.floor(i / 2) * (CH + 26)});

const AdCard: React.FC<{a: (typeof ADS)[number]; blur?: number; flag?: number; dim?: number}> = ({a, blur = 0, flag = 0, dim = 0}) => (
  <div style={{width: CW, height: CH, borderRadius: 22, overflow: 'hidden', background: '#fff', fontFamily: FONT, position: 'relative', boxShadow: flag > 0 ? `0 0 0 ${6 * flag}px ${C.success}, 0 30px 70px -30px rgba(34,193,122,0.8)` : '0 30px 70px -30px rgba(0,0,0,0.9)', opacity: 1 - dim * 0.6}}>
    <div style={{display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px'}}>
      <div style={{width: 34, height: 34, borderRadius: 17, background: C.mist}} />
      <div>
        <div style={{fontSize: 19, fontWeight: 700, color: C.ink}}>{a.brand}</div>
        <div style={{fontSize: 14, color: C.slate}}>Sponsorisé</div>
      </div>
    </div>
    <div style={{filter: `blur(${blur}px)`}}>
      <Clip src={a.src} width={CW} height={CH - 58} />
    </div>
    {flag > 0 && (
      <div style={{position: 'absolute', left: 14, bottom: 14, transform: `scale(${flag})`, transformOrigin: 'left bottom'}}>
        <Pill tone="green" size={21}>● Gagnante · {a.days} j</Pill>
      </div>
    )}
  </div>
);

// « Vos concurrents ont déjà trouvé la pub qui marche. »
export const S4Hook: React.FC<SceneProps> = () => {
  const f = useCurrentFrame();
  return (
    <StudioBg intensity={0.9}>
      {ADS.map((a, i) => {
        const p = cardPos(i);
        return (
          <div key={i} style={{position: 'absolute', left: p.x, top: p.y + 110, transform: `rotate(${(i % 2 ? 2 : -2)}deg) translateY(${Math.sin(f / 18 + i) * 8}px)`}}>
            <AdCard a={a} blur={18} />
            <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: DISPLAY, fontWeight: 700, fontSize: 160, color: '#fff', textShadow: '0 10px 40px rgba(0,0,0,0.6)'}}>?</div>
          </div>
        );
      })}
      <div style={{position: 'absolute', left: R.x, width: R.w, top: R.y + 6, textAlign: 'center', fontFamily: DISPLAY, fontWeight: 700, fontSize: 82, lineHeight: 1.04, color: '#fff', textShadow: '0 10px 40px rgba(0,0,0,0.7)'}}>
        Vos concurrents ont déjà trouvé <span style={gradText()}>la pub qui marche.</span>
      </div>
    </StudioBg>
  );
};

// scan → winners → inspire → your own ad
export const S4Spy: React.FC<SceneProps> = ({lines}) => {
  const f = useCurrentFrame();
  const [l1, l2, l3] = lines;
  const query = 'pompe à chaleur';
  const q = query.slice(0, Math.max(0, Math.floor((f - 4) / 1.6)));
  const scan = interpolate(f, [wordAt(l1, 'bibliothèque', 20), l1.start + l1.frames - 4], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: INOUT});
  const winAt = [wordAt(l2, 'gagnent', 10), wordAt(l2, 'tournent', 30), wordAt(l2, 'semaines', 50)];
  const order = [1, 3, 0];
  const flagOf = (i: number) => {
    const k = order.indexOf(i);
    return k < 0 ? 0 : pop(f, winAt[k], 12);
  };
  const dim = prog(f, winAt[0] + 6, 14);
  const inspire = wordAt(l3, 'inspire', 12);
  const fly = prog(f, inspire, 26, INOUT);
  const out = pop(f, inspire + 22, 14);
  const press = f >= inspire - 4 && f < inspire + 3;
  return (
    <StudioBg intensity={0.8}>
      <div style={{position: 'absolute', left: R.x, width: R.w, top: R.y + 10, height: 120, borderRadius: 26, background: '#fff', display: 'flex', alignItems: 'center', gap: 16, padding: '0 24px', fontFamily: FONT, boxShadow: '0 30px 70px -30px rgba(0,0,0,0.8)', opacity: 1 - fly * 0.9}}>
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
          <circle cx="11" cy="11" r="7" stroke={C.slate} strokeWidth={2.4} />
          <path d="M20 20l-4-4" stroke={C.slate} strokeWidth={2.4} strokeLinecap="round" />
        </svg>
        <div style={{flex: 1, fontSize: 34, color: C.ink}}>
          {q}
          <span style={{opacity: Math.floor(f / 8) % 2 ? 1 : 0, color: C.primary}}>|</span>
        </div>
        <Pill size={20} style={{background: '#E6F0FF', color: C.meta, boxShadow: 'none'}}>Bibliothèque Meta</Pill>
      </div>
      {ADS.map((a, i) => {
        const p = cardPos(i);
        const win = a.win;
        const k = order.indexOf(i);
        // winners shrink toward the centre when Growthity takes inspiration
        const tx = win ? mix(p.x, SAFE_CX - CW / 2 + (k - 1) * 120, fly) : p.x;
        const ty = win ? mix(p.y, 520, fly) : p.y;
        const s = win ? mix(1, 0.32, fly) : 1;
        const appear = pop(f, 2 + i * 3, 14);
        return (
          <div key={i} style={{position: 'absolute', left: tx, top: ty, transform: `scale(${s * appear})`, transformOrigin: 'center', opacity: win ? 1 - fly * fly : 1 - fly, zIndex: win ? 3 : 1}}>
            <AdCard a={a} flag={flagOf(i)} dim={win ? 0 : dim} />
          </div>
        );
      })}
      {scan > 0 && scan < 1 && <div style={{position: 'absolute', left: R.x - 10, width: R.w + 20, top: 430 + scan * 750, height: 6, borderRadius: 3, backgroundImage: `linear-gradient(90deg, transparent, ${C.purple}, transparent)`, boxShadow: '0 0 40px 12px rgba(147,51,234,0.5)'}} />}
      {/* inspire button */}
      <div style={{position: 'absolute', left: R.x, width: R.w, top: 766, zIndex: 5, display: 'flex', justifyContent: 'center', opacity: prog(f, winAt[2] + 6, 10) * (1 - fly)}}>
        <div style={{height: 76, padding: '0 34px', borderRadius: 20, backgroundImage: GRAD, display: 'flex', alignItems: 'center', gap: 12, color: '#fff', fontFamily: FONT, fontWeight: 800, fontSize: 30, transform: `scale(${press ? 0.92 : 1})`, boxShadow: '0 20px 50px -20px rgba(91,63,228,0.9)'}}>
          <Sparkle size={26} /> S’inspirer des gagnantes
        </div>
      </div>
      {/* the result: your own ad */}
      {f >= inspire + 16 && (
        <div style={{position: 'absolute', left: SAFE_CX - 220, top: 300, transform: `scale(${out})`}}>
          <Phone src="ugc-charlotte.mp4" w={440} from={inspire + 16}>
            <div style={{position: 'absolute', top: 16, left: 16}}>
              <Pill tone="grad" size={19}>
                <Sparkle size={16} /> Votre pub
              </Pill>
            </div>
          </Phone>
        </div>
      )}
    </StudioBg>
  );
};

export const S4End: React.FC<SceneProps> = ({dur}) => (
  <EndCard
    dur={dur}
    tagline={
      <>
        Ne partez plus
        <br />
        <span style={gradText()}>de zéro.</span>
      </>
    }
  />
);
