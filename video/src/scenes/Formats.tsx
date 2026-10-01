import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {LightBg} from '../components/Backgrounds';
import {Clip} from '../components/Media';
import {Kicker} from '../components/UI';
import {WordsReveal} from '../components/Text';
import {prog, pop, INOUT} from '../components/anim';
import {C, DISPLAY, FONT, GRAD} from '../theme';

const SHADOW = '0 50px 110px -40px rgba(37,22,120,0.55), 0 20px 40px -25px rgba(15,23,42,0.35)';

const Label: React.FC<{ratio: string; text: string; o: number}> = ({ratio, text, o}) => (
  <div style={{marginTop: 24, textAlign: 'center', opacity: o, fontFamily: FONT}}>
    <span style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 30, color: C.ink}}>{ratio}</span>
    <span style={{fontSize: 22, color: C.slate, marginLeft: 12}}>{text}</span>
  </div>
);

const Sponsored: React.FC<{name: string}> = ({name}) => (
  <div style={{position: 'absolute', top: 18, left: 18, display: 'flex', alignItems: 'center', gap: 10}}>
    <div style={{width: 38, height: 38, borderRadius: 19, backgroundImage: GRAD, border: '2px solid #fff'}} />
    <div style={{fontFamily: FONT, color: '#fff', textShadow: '0 1px 6px rgba(0,0,0,0.5)'}}>
      <div style={{fontSize: 17, fontWeight: 700}}>{name}</div>
      <div style={{fontSize: 13}}>Sponsorisé</div>
    </div>
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
      <div style={{position: 'absolute', bottom: 22, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 8}}>
        {IMAGES.map((_, i) => (
          <div key={i} style={{width: Math.abs(pos - i) < 0.5 ? 26 : 9, height: 9, borderRadius: 5, background: Math.abs(pos - i) < 0.5 ? '#fff' : 'rgba(255,255,255,0.55)'}} />
        ))}
      </div>
    </div>
  );
};

export const Formats: React.FC = () => {
  const f = useCurrentFrame();
  const kick = prog(f, 4, 22);
  const orbit = interpolate(f, [0, 170], [-5, 5]);
  const items = [0, 1, 2].map((i) => pop(f, 10 + i * 7, 15));
  return (
    <LightBg>
      <div style={{position: 'absolute', left: 140, top: 70}}>
        <Kicker n="03" label="Tous les formats Meta" opacity={kick} y={(1 - kick) * 16} />
      </div>
      <div style={{position: 'absolute', top: 120, left: 0, right: 0}}>
        <WordsReveal
          words={[{t: 'Vidéo,'}, {t: 'image,'}, {t: 'carrousel.', grad: 'pink'}]}
          start={4}
          stagger={4}
          style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 92, color: C.ink}}
        />
        <div style={{textAlign: 'center', fontFamily: FONT, fontSize: 28, color: C.slate, marginTop: 8, opacity: prog(f, 18, 20)}}>
          Depuis le même brief.
        </div>
      </div>
      <AbsoluteFill style={{perspective: 2000, alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 50}}>
        <div style={{display: 'flex', alignItems: 'flex-end', gap: 64, transform: `rotateY(${orbit}deg)`}}>
          <div style={{transform: `translateY(${(1 - items[0]) * 300}px) rotateY(12deg)`, opacity: items[0]}}>
            <div style={{position: 'relative', borderRadius: 30, overflow: 'hidden', boxShadow: SHADOW}}>
              <Clip src="ugc-femme.mp4" width={340} height={604} />
              <Sponsored name="Maison Ilara" />
            </div>
            <Label ratio="9:16" text="Reels & Stories" o={items[0]} />
          </div>
          <div style={{transform: `translateY(${(1 - items[1]) * 300}px)`, opacity: items[1]}}>
            <div style={{boxShadow: SHADOW, borderRadius: 26}}>
              <Carousel w={540} />
            </div>
            <Label ratio="1:1" text="Carrousel" o={items[1]} />
          </div>
          <div style={{transform: `translateY(${(1 - items[2]) * 300}px) rotateY(-12deg)`, opacity: items[2]}}>
            <div style={{position: 'relative', borderRadius: 26, overflow: 'hidden', boxShadow: SHADOW}}>
              <Clip src="img-sneakers.webp" width={400} height={500} />
              <Sponsored name="Street Kicks" />
              <div style={{position: 'absolute', bottom: 18, left: 18, right: 18, background: '#fff', borderRadius: 14, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: FONT}}>
                <span style={{fontWeight: 700, fontSize: 18, color: C.ink}}>Nouvelle collection</span>
                <span style={{fontWeight: 700, fontSize: 15, color: '#fff', backgroundImage: GRAD, padding: '8px 14px', borderRadius: 10}}>Acheter</span>
              </div>
            </div>
            <Label ratio="4:5" text="Feed" o={items[2]} />
          </div>
        </div>
      </AbsoluteFill>
    </LightBg>
  );
};
