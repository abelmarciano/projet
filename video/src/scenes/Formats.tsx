import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {StudioBg} from '../components/Backgrounds';
import {Creative, CreativeKind} from '../components/Creatives';
import {Kicker} from '../components/UI';
import {WordsReveal} from '../components/Text';
import {prog, pop, INOUT} from '../components/anim';
import {DISPLAY, FONT, GRAD, SHADOW_STUDIO} from '../theme';

const Label: React.FC<{ratio: string; text: string; o: number}> = ({ratio, text, o}) => (
  <div style={{marginTop: 26, textAlign: 'center', opacity: o, fontFamily: FONT}}>
    <span style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 30, color: '#fff'}}>{ratio}</span>
    <span style={{fontSize: 22, color: 'rgba(255,255,255,0.6)', marginLeft: 12}}>{text}</span>
  </div>
);

const Carousel: React.FC<{w: number; h: number}> = ({w, h}) => {
  const f = useCurrentFrame();
  const kinds: CreativeKind[] = ['perfume', 'candle', 'can'];
  const pos = interpolate(f, [60, 80, 110, 130], [0, 1, 1, 2], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: INOUT});
  return (
    <div style={{width: w, height: h, borderRadius: 26, overflow: 'hidden', position: 'relative'}}>
      <div style={{display: 'flex', width: w * kinds.length, transform: `translateX(${-pos * w}px)`}}>
        {kinds.map((k, i) => (
          <Creative
            key={k}
            kind={k}
            width={w}
            height={h}
            radius={0}
            headline={['Une signature, pour elle.', 'Le soir a son parfum.', 'Le peps sans sucre.'][i]}
            cta="Découvrir"
          />
        ))}
      </div>
      <div style={{position: 'absolute', bottom: 70, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 8}}>
        {kinds.map((_, i) => (
          <div
            key={i}
            style={{
              width: Math.abs(pos - i) < 0.5 ? 26 : 9,
              height: 9,
              borderRadius: 5,
              background: Math.abs(pos - i) < 0.5 ? '#fff' : 'rgba(255,255,255,0.5)',
            }}
          />
        ))}
      </div>
    </div>
  );
};

// Formats: 9:16 video, 1:1 carousel, 4:5 feed
export const Formats: React.FC = () => {
  const f = useCurrentFrame();
  const kick = prog(f, 4, 22);
  const orbit = interpolate(f, [0, 180], [-6, 6]);
  const items = [0, 1, 2].map((i) => pop(f, 14 + i * 8, 15));
  const vidProg = interpolate(f, [30, 180], [0.1, 0.85], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const caption = f < 95 ? 'Mon teint a changé' : 'en 2 semaines ✨';
  return (
    <StudioBg>
      <div style={{position: 'absolute', left: 140, top: 80}}>
        <Kicker n="02" label="Tous les formats Meta" dark opacity={kick} y={(1 - kick) * 16} />
      </div>
      <div style={{position: 'absolute', top: 140, left: 0, right: 0}}>
        <WordsReveal
          words={[{t: 'Image,'}, {t: 'vidéo,'}, {t: 'carrousel.', grad: 'pink'}]}
          start={6}
          stagger={4}
          style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 92, color: '#fff'}}
        />
        <div style={{textAlign: 'center', fontFamily: FONT, fontSize: 28, color: 'rgba(255,255,255,0.6)', marginTop: 10, opacity: prog(f, 22, 20)}}>
          Depuis le même brief.
        </div>
      </div>
      <AbsoluteFill style={{perspective: 2000, alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 60}}>
        <div style={{display: 'flex', alignItems: 'flex-end', gap: 64, transform: `rotateY(${orbit}deg)`}}>
          {/* 9:16 */}
          <div style={{transform: `translateY(${(1 - items[0]) * 300}px) translateZ(${(1 - items[0]) * -400}px) rotateY(14deg)`, opacity: items[0]}}>
            <div style={{position: 'relative', borderRadius: 30, overflow: 'hidden', boxShadow: SHADOW_STUDIO, border: '1px solid rgba(255,255,255,0.15)'}}>
              <Creative kind="serum" width={340} height={604} radius={0} />
              <div style={{position: 'absolute', left: 0, right: 0, top: 96, textAlign: 'center'}}>
                <span style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 34, color: '#fff', background: 'rgba(0,0,0,0.35)', padding: '6px 14px', borderRadius: 10}}>
                  {caption}
                </span>
              </div>
              <div style={{position: 'absolute', left: 20, right: 20, bottom: 26, height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.3)'}}>
                <div style={{width: `${vidProg * 100}%`, height: '100%', borderRadius: 3, background: '#fff'}} />
              </div>
              <div style={{position: 'absolute', top: 22, left: 22, display: 'flex', alignItems: 'center', gap: 10}}>
                <div style={{width: 40, height: 40, borderRadius: 20, backgroundImage: GRAD}} />
                <div style={{fontFamily: FONT, fontSize: 18, color: '#fff', fontWeight: 600}}>Sponsorisé</div>
              </div>
            </div>
            <Label ratio="9:16" text="Reels & Stories" o={items[0]} />
          </div>
          {/* 1:1 carousel */}
          <div style={{transform: `translateY(${(1 - items[1]) * 300}px) translateZ(${(1 - items[1]) * -400 + 60}px)`, opacity: items[1]}}>
            <div style={{boxShadow: SHADOW_STUDIO, borderRadius: 26, border: '1px solid rgba(255,255,255,0.15)'}}>
              <Carousel w={540} h={540} />
            </div>
            <Label ratio="1:1" text="Carrousel" o={items[1]} />
          </div>
          {/* 4:5 */}
          <div style={{transform: `translateY(${(1 - items[2]) * 300}px) translateZ(${(1 - items[2]) * -400}px) rotateY(-14deg)`, opacity: items[2]}}>
            <div style={{borderRadius: 26, overflow: 'hidden', boxShadow: SHADOW_STUDIO, border: '1px solid rgba(255,255,255,0.15)'}}>
              <Creative kind="can" width={400} height={500} radius={0} headline="Zéro sucre. 100% peps." cta="Commander" />
            </div>
            <Label ratio="4:5" text="Feed" o={items[2]} />
          </div>
        </div>
      </AbsoluteFill>
    </StudioBg>
  );
};
