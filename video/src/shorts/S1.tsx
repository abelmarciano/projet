import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {LightBg, StudioBg} from '../components/Backgrounds';
import {prog, pop, INOUT, mix} from '../components/anim';
import {C, DISPLAY, FONT, GRAD} from '../theme';
import {SceneProps, wordAt} from './timeline';
import {EndCard, Phone, Pill, R, SAFE_CX, gradText} from './kit';
import {Card, Glints, Sticker, Tick, Title} from './parts';

// Short 1 — e-commerce bijoux (Jwel): Emma & Sarah, bracelets Trèfle / Cercle

// « Vous vendez des bijoux en ligne ? Regardez ça. »
export const S1Hook: React.FC<SceneProps> = ({lines}) => {
  const f = useCurrentFrame();
  const look = wordAt(lines[0], 'regardez', 40);
  const zoom = prog(f, look - 2, 16, INOUT);
  const spin = interpolate(f, [0, 120], [-14, 4], {extrapolateRight: 'clamp'});
  const W = mix(560, 680, zoom);
  return (
    <StudioBg>
      <div style={{position: 'absolute', left: R.x, width: R.w, top: R.y + 20, opacity: 1 - zoom * 0.25}}>
        <Title text="Vous vendez des *bijoux* en ligne ?" start={2} step={4} size={98} />
      </div>
      <div style={{position: 'absolute', left: SAFE_CX - W / 2, top: mix(560, 520, zoom), width: W, height: W, transform: `rotate(${spin * (1 - zoom)}deg) scale(${pop(f, 6, 14)})`}}>
        <Card src="img-bracelet-trefle.jpg" w={W} h={W} radius={36} style={{left: 0, top: 0}} />
      </div>
      <Glints x={SAFE_CX} y={mix(840, 860, zoom)} spread={300} start={look - 4} n={8} />
    </StudioBg>
  );
};

// « Ces vidéos n'ont jamais été tournées. Ces femmes n'existent pas. »
export const S1Wall: React.FC<SceneProps> = ({lines}) => {
  const f = useCurrentFrame();
  const l = lines[0];
  const a = prog(f, 0, 16);
  const b = prog(f, 6, 16);
  const jamais = wordAt(l, 'jamais', 20);
  const exist = wordAt(l, 'existent', 70);
  return (
    <StudioBg intensity={0.8}>
      <div style={{position: 'absolute', left: R.x - 6, top: R.y + 40, transform: `translateX(${(1 - a) * -300}px) rotate(${-4 + (1 - a) * -8}deg)`}}>
        <Phone src="ugc-emma-bracelet-1.mp4" w={410}>
          <div style={{position: 'absolute', left: 16, top: 16}}>
            <Pill tone="dark" size={18}>Emma · bracelet acier</Pill>
          </div>
        </Phone>
      </div>
      <div style={{position: 'absolute', left: R.x + 436, top: R.y + 110, transform: `translateX(${(1 - b) * 300}px) rotate(${4 + (1 - b) * 8}deg)`}}>
        <Phone src="ugc-sarah-bracelet-1.mp4" w={410}>
          <div style={{position: 'absolute', left: 16, top: 16}}>
            <Pill tone="dark" size={18}>Sarah · jonc clou</Pill>
          </div>
        </Phone>
      </div>
      <Sticker at={jamais} rot={-9} size={44} bg="linear-gradient(120deg,#FF5A6E,#E5484D)" style={{left: R.x + 40, top: 560}}>
        0 tournage
      </Sticker>
      <Sticker at={exist} rot={7} size={44} style={{left: R.x + 430, top: 880}}>
        100 % IA
      </Sticker>
    </StudioBg>
  );
};

// « Une photo de votre bracelet suffit. L'IA le fait porter, briller, présenter. »
export const S1Make: React.FC<SceneProps> = ({lines}) => {
  const f = useCurrentFrame();
  const l = lines[0];
  const drop = pop(f, 4, 13);
  const ia = wordAt(l, "l'ia", 50);
  const scan = interpolate(f, [ia - 6, ia + 18], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const keys = ['porter', 'briller', 'présenter'].map((k, i) => wordAt(l, k, 70 + i * 12));
  return (
    <LightBg>
      <div style={{position: 'absolute', left: R.x, width: R.w, top: R.y + 6}}>
        <Title text="1 photo produit →" start={0} step={3} size={70} color={C.ink} align="left" />
      </div>
      <div style={{position: 'absolute', left: R.x, top: 380, width: 440, height: 660, borderRadius: 30, border: `3px dashed ${C.primary}`, background: 'rgba(101,82,232,0.06)'}}>
        <div style={{position: 'absolute', left: 20, top: 20, width: 400, height: 620, transform: `translateY(${(1 - drop) * -260}px) rotate(${(1 - drop) * 10}deg)`, opacity: Math.min(1, drop * 2)}}>
          <Card src="img-bracelet-cercle.jpg" w={400} h={620} radius={22} style={{left: 0, top: 0}}>
            <div style={{position: 'absolute', left: 0, right: 0, top: `${scan * 100}%`, height: 6, backgroundImage: GRAD, boxShadow: '0 0 30px 10px rgba(101,82,232,0.6)', opacity: scan > 0 && scan < 1 ? 1 : 0}} />
          </Card>
        </div>
        <div style={{position: 'absolute', left: 0, right: 0, bottom: -64, textAlign: 'center', fontFamily: FONT, fontWeight: 700, fontSize: 24, color: C.slate}}>bracelet-cercle.jpg</div>
      </div>
      <div style={{position: 'absolute', left: R.x + 480, top: 430, display: 'flex', flexDirection: 'column', gap: 34}}>
        <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 24, letterSpacing: '0.14em', color: C.primary, opacity: prog(f, ia - 4, 10)}}>L’IA LE FAIT…</div>
        {['Porter', 'Briller', 'Présenter'].map((t, i) => (
          <Tick key={t} at={keys[i]} size={34}>
            {t}
          </Tick>
        ))}
      </div>
      <Glints x={R.x + 230} y={700} spread={200} start={keys[1] - 4} n={6} />
    </LightBg>
  );
};

// « Et le visuel promo du Black Friday, prêt à publier. »
export const S1Promo: React.FC<SceneProps> = ({lines}) => {
  const f = useCurrentFrame();
  const l = lines[0];
  const bf = wordAt(l, 'black', 20);
  const pub = wordAt(l, 'publier', 60);
  const a = pop(f, 2, 14);
  const b = pop(f, 8, 14);
  return (
    <StudioBg intensity={1.1}>
      <div style={{position: 'absolute', left: R.x, top: 400, transform: `rotate(${-5 * a}deg) scale(${a})`}}>
        <Card src="img-bracelet-trefle.jpg" w={460} h={460} radius={30} style={{left: 0, top: 0}} />
      </div>
      <div style={{position: 'absolute', left: R.x + 480, top: 440, transform: `rotate(${4 * b}deg) scale(${b})`}}>
        <Card src="img-bracelet-cercle.jpg" w={350} h={542} radius={30} style={{left: 0, top: 0}} />
      </div>
      <Sticker at={bf} rot={-5} size={58} bg="linear-gradient(120deg,#111,#2A2433)" style={{left: R.x + 60, top: R.y + 20, border: '3px solid #fff'}}>
        BLACK FRIDAY −30 %
      </Sticker>
      <div style={{position: 'absolute', left: R.x, top: 1060, opacity: prog(f, pub, 10), transform: `translateY(${(1 - prog(f, pub, 12)) * 30}px)`}}>
        <Pill tone="green" size={30}>
          ✓ Prêt à publier
        </Pill>
      </div>
    </StudioBg>
  );
};

export const S1End: React.FC<SceneProps> = ({dur}) => (
  <EndCard
    dur={dur}
    tagline={
      <>
        Votre boutique
        <br />
        <span style={gradText()}>mérite mieux.</span>
      </>
    }
  />
);
