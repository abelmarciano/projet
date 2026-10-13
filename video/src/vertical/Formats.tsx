import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {LightBg} from '../components/Backgrounds';
import {Clip} from '../components/Media';
import {WordsReveal} from '../components/Text';
import {prog, pop, INOUT} from '../components/anim';
import {C, DISPLAY, FONT, GRAD} from '../theme';
import {SAFE} from './safe';

const SHADOW = '0 50px 110px -40px rgba(37,22,120,0.55), 0 20px 40px -25px rgba(15,23,42,0.35)';

const Sponsored: React.FC<{name: string}> = ({name}) => (
  <div style={{position: 'absolute', top: 16, left: 16, display: 'flex', alignItems: 'center', gap: 10}}>
    <div style={{width: 36, height: 36, borderRadius: 18, backgroundImage: GRAD, border: '2px solid #fff'}} />
    <div style={{fontFamily: FONT, color: '#fff', textShadow: '0 1px 6px rgba(0,0,0,0.5)'}}>
      <div style={{fontSize: 17, fontWeight: 700}}>{name}</div>
      <div style={{fontSize: 13}}>Sponsorisé</div>
    </div>
  </div>
);

const Ratio: React.FC<{ratio: string; text: string; bottom?: number}> = ({ratio, text, bottom = 16}) => (
  <div
    style={{
      position: 'absolute',
      left: 16,
      bottom,
      display: 'flex',
      alignItems: 'baseline',
      gap: 8,
      padding: '8px 14px',
      borderRadius: 999,
      background: 'rgba(255,255,255,0.94)',
      fontFamily: FONT,
      boxShadow: '0 8px 20px -10px rgba(15,23,42,0.5)',
    }}
  >
    <span style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 22, color: C.ink}}>{ratio}</span>
    <span style={{fontSize: 17, color: C.slate}}>{text}</span>
  </div>
);

const IMAGES = ['img-bougie.webp', 'img-sneakers.webp', 'img-macbook.webp'];

const Carousel: React.FC<{w: number}> = ({w}) => {
  const f = useCurrentFrame();
  const pos = interpolate(f, [56, 76, 106, 126], [0, 1, 1, 2], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: INOUT});
  return (
    <div style={{width: w, height: w, borderRadius: 26, overflow: 'hidden', position: 'relative'}}>
      <div style={{display: 'flex', width: w * IMAGES.length, transform: `translateX(${-pos * w}px)`}}>
        {IMAGES.map((src) => (
          <Clip key={src} src={src} width={w} height={w} />
        ))}
      </div>
      <Sponsored name="Maison Ambre" />
      <div style={{position: 'absolute', bottom: 28, right: 18, display: 'flex', gap: 7}}>
        {IMAGES.map((_, i) => (
          <div key={i} style={{width: Math.abs(pos - i) < 0.5 ? 22 : 8, height: 8, borderRadius: 4, background: Math.abs(pos - i) < 0.5 ? '#fff' : 'rgba(255,255,255,0.55)'}} />
        ))}
      </div>
      <Ratio ratio="1:1" text="Carrousel" />
    </div>
  );
};

// 9:16 big on the left, 1:1 and 4:5 stacked on the right, all inside the safe area
const TOP = 570;
const VW = 450;
const VH = 800;
const COL = SAFE.w - VW - 20; // 350

export const FormatsV: React.FC = () => {
  const f = useCurrentFrame();
  const items = [0, 1, 2].map((i) => pop(f, 10 + i * 7, 15));
  const drift = interpolate(f, [0, 180], [8, -8]);
  return (
    <LightBg>
      <div style={{position: 'absolute', top: SAFE.y + 10, left: SAFE.x, width: SAFE.w}}>
        <WordsReveal
          words={[{t: 'Vidéo,'}, {t: 'image,', br: true}, {t: 'carrousel.', grad: 'pink'}]}
          start={4}
          stagger={4}
          style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 100, lineHeight: 1.02, color: C.ink}}
        />
        <div style={{textAlign: 'center', fontFamily: FONT, fontSize: 32, color: C.slate, marginTop: 12, opacity: prog(f, 18, 20)}}>
          Depuis le même brief.
        </div>
      </div>
      <div style={{position: 'absolute', left: SAFE.x, top: TOP + drift, width: VW, transform: `translateY(${(1 - items[0]) * 300}px)`, opacity: items[0]}}>
        <div style={{position: 'relative', borderRadius: 30, overflow: 'hidden', boxShadow: SHADOW}}>
          <Clip src="ugc-femme.mp4" width={VW} height={VH} />
          <Sponsored name="Maison Ilara" />
          <Ratio ratio="9:16" text="Reels & Stories" bottom={20} />
        </div>
      </div>
      <div style={{position: 'absolute', left: SAFE.x + VW + 20, top: TOP - drift, width: COL, transform: `translateY(${(1 - items[1]) * 300}px)`, opacity: items[1]}}>
        <div style={{boxShadow: SHADOW, borderRadius: 26}}>
          <Carousel w={COL} />
        </div>
      </div>
      <div style={{position: 'absolute', left: SAFE.x + VW + 20, top: TOP + COL + 20 - drift, width: COL, transform: `translateY(${(1 - items[2]) * 300}px)`, opacity: items[2]}}>
        <div style={{position: 'relative', borderRadius: 26, overflow: 'hidden', boxShadow: SHADOW}}>
          <Clip src="img-sneakers.webp" width={COL} height={VH - COL - 20} />
          <Sponsored name="Street Kicks" />
          <Ratio ratio="4:5" text="Feed" bottom={86} />
          <div style={{position: 'absolute', bottom: 16, left: 16, right: 16, background: '#fff', borderRadius: 14, padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: FONT}}>
            <span style={{fontWeight: 700, fontSize: 17, color: C.ink}}>Nouvelle collection</span>
            <span style={{fontWeight: 700, fontSize: 15, color: '#fff', backgroundImage: GRAD, padding: '8px 12px', borderRadius: 10}}>Acheter</span>
          </div>
        </div>
      </div>
    </LightBg>
  );
};
