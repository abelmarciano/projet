import React from 'react';
import {interpolate, Sequence, useCurrentFrame} from 'remotion';
import {LightBg, StudioBg} from '../components/Backgrounds';
import {Clip} from '../components/Media';
import {prog, pop, INOUT, mix} from '../components/anim';
import {C, DISPLAY, FONT, GRAD} from '../theme';
import {SceneProps, wordAt} from './timeline';
import {EndCard, Pill, R, SAFE_CX, gradText} from './kit';
import {Card, Sticker, Tick, Title} from './parts';

// Short 2 — habitat / produits chers (Tiny Studio): Lucas, visuels studio de jardin

// « Vous vendez un produit cher ? Un studio de jardin, une cuisine, une piscine ? »
const ITEMS = [
  {k: 'studio', t: 'Studio de jardin', p: '24 900 €'},
  {k: 'cuisine', t: 'Cuisine sur mesure', p: '18 500 €'},
  {k: 'piscine', t: 'Piscine', p: '32 000 €'},
];
export const S2Hook: React.FC<SceneProps> = ({lines}) => {
  const f = useCurrentFrame();
  const l = lines[0];
  const at = ITEMS.map((it, i) => wordAt(l, it.k, 50 + i * 20));
  return (
    <StudioBg>
      <div style={{position: 'absolute', left: R.x, width: R.w, top: R.y + 10}}>
        <Title text="Vous vendez un produit *cher* ?" start={2} step={4} size={100} />
      </div>
      <div style={{position: 'absolute', left: R.x + 40, width: R.w - 80, top: 600}}>
        {ITEMS.map((it, i) => {
          const p = pop(f, at[i] - 2, 13);
          const active = f >= at[i] && (i === 2 || f < at[i + 1]);
          return (
            <div
              key={it.k}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '26px 34px',
                marginTop: i ? 22 : 0,
                borderRadius: 26,
                background: active ? '#fff' : 'rgba(255,255,255,0.12)',
                color: active ? C.ink : '#fff',
                fontFamily: FONT,
                fontWeight: 700,
                fontSize: 38,
                opacity: p,
                transform: `translateX(${(1 - p) * (i % 2 ? 200 : -200)}px) scale(${active ? 1.04 : 0.97})`,
                boxShadow: active ? '0 30px 70px -26px rgba(146,120,255,0.9)' : 'none',
              }}
            >
              <span>{it.t}</span>
              <span style={{fontFamily: DISPLAY, color: active ? C.primary : 'rgba(255,255,255,0.75)'}}>{it.p}</span>
            </div>
          );
        })}
      </div>
    </StudioBg>
  );
};

// « Voici Lucas. Il n'existe pas… mais il vend des studios de jardin. »
// « Il montre le terrain, ouvre la baie vitrée, fait la visite. Sans aucun tournage. »
export const S2Lucas: React.FC<SceneProps> = ({lines}) => {
  const f = useCurrentFrame();
  const [a, b] = lines;
  const intro = prog(f, 0, 18);
  const exist = wordAt(a, 'existe', 30);
  const steps = [wordAt(b, 'terrain', 20), wordAt(b, 'baie', 50), wordAt(b, 'visite', 80)];
  const zero = wordAt(b, 'tournage', 110);
  // one continuous take of Lucas: part 1 then part 2 (same shot, chained)
  const W = 500;
  const H = Math.round((W * 16) / 9);
  const seg2 = 230;
  return (
    <LightBg>
      <div
        style={{
          position: 'absolute',
          left: R.x,
          top: R.y + 10,
          width: W,
          height: H,
          borderRadius: 44,
          overflow: 'hidden',
          boxShadow: '0 60px 120px -40px rgba(37,22,120,0.7)',
          transform: `translateY(${(1 - intro) * 120}px) scale(${0.92 + intro * 0.08})`,
          opacity: intro,
        }}
      >
        <Sequence durationInFrames={seg2} layout="none">
          <Clip src="ugc-lucas-studio-1.mp4" width={W} height={H} />
        </Sequence>
        <Sequence from={seg2} layout="none">
          <Clip src="ugc-lucas-studio-2.mp4" width={W} height={H} style={{position: 'absolute', inset: 0}} />
        </Sequence>
        <div style={{position: 'absolute', left: 18, top: 18}}>
          <Pill tone="dark" size={20}>
            <span style={{width: 10, height: 10, borderRadius: 5, background: '#FF4D5E'}} /> Lucas · acteur IA
          </Pill>
        </div>
      </div>
      <Sticker at={exist} rot={8} size={38} bg="linear-gradient(120deg,#FF5A6E,#E5484D)" style={{left: R.x + 330, top: R.y + 70}}>
        n’existe pas
      </Sticker>
      <div style={{position: 'absolute', left: R.x + 470, top: 520, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 26}}>
        {['Le terrain', 'La baie vitrée', 'La visite'].map((t, i) => (
          <Tick key={t} at={steps[i]} size={28}>
            {t}
          </Tick>
        ))}
      </div>
      <Sticker at={zero} rot={-6} size={46} style={{left: R.x + 470, top: 860}}>
        0 tournage
      </Sticker>
    </LightBg>
  );
};

// « Et pour le fil d'actualité : trois visuels carrés, déclinés en un clic. »
const SQ = ['img-studio-titre.jpg', 'img-studio-interieur.jpg', 'img-studio-coin.jpg'];
export const S2Feed: React.FC<SceneProps> = ({lines}) => {
  const f = useCurrentFrame();
  const l = lines[0];
  const trois = wordAt(l, 'trois', 40);
  const clic = wordAt(l, 'clic', 90);
  const spread = prog(f, clic, 18, INOUT);
  const S = 400;
  const cx = interpolate(f, [trois, clic - 3], [900, SAFE_CX + 40], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: INOUT});
  const cy = interpolate(f, [trois, clic - 3], [1150, 1000], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: INOUT});
  return (
    <StudioBg>
      <div style={{position: 'absolute', left: R.x, width: R.w, top: R.y + 10}}>
        <Title text="Fil d’actualité · *1:1*" start={0} step={4} size={74} />
      </div>
      {SQ.map((s, i) => {
        const p = pop(f, 4 + i * 6, 13);
        const stackX = SAFE_CX - S / 2 + (i - 1) * 26;
        const stackY = 450 + (i - 1) * -18;
        const gridX = [R.x + 40, R.x + R.w - 400, SAFE_CX - 180][i];
        const gridY = [380, 380, 770][i];
        const sz = mix(S, 360, spread);
        return (
          <div key={s} style={{position: 'absolute', left: mix(stackX, gridX, spread), top: mix(stackY, gridY, spread), transform: `rotate(${mix((i - 1) * 6, 0, spread)}deg) scale(${p})`, zIndex: i}}>
            <Card src={s} w={sz} h={sz} radius={26} style={{left: 0, top: 0}} />
          </div>
        );
      })}
      <div style={{position: 'absolute', left: SAFE_CX - 170, top: 1100 - 20, opacity: prog(f, trois + 10, 10) * (1 - spread), transform: `scale(${f > clic - 3 && f < clic + 3 ? 0.92 : 1})`}}>
        <div style={{width: 340, height: 74, borderRadius: 20, backgroundImage: GRAD, color: '#fff', fontFamily: FONT, fontWeight: 800, fontSize: 28, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>Décliner ×3</div>
      </div>
      {f < clic + 12 && f > trois && (
        <svg width="54" height="54" viewBox="0 0 24 24" style={{position: 'absolute', left: cx, top: cy, zIndex: 30, filter: 'drop-shadow(0 6px 10px rgba(0,0,0,0.5))'}}>
          <path d="M5 3l14 8-6 1.5L10 19z" fill="#fff" stroke="#0F172A" strokeWidth={1.5} strokeLinejoin="round" />
        </svg>
      )}
    </StudioBg>
  );
};

export const S2End: React.FC<SceneProps> = ({dur}) => (
  <EndCard
    dur={dur}
    tagline={
      <>
        Plus de demandes
        <br />
        <span style={gradText()}>de devis.</span>
      </>
    }
  />
);
