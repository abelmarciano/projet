import React from 'react';
import {interpolate, Sequence, useCurrentFrame} from 'remotion';
import {LightBg, StudioBg} from '../components/Backgrounds';
import {Clip} from '../components/Media';
import {prog, pop, INOUT, mix} from '../components/anim';
import {C, DISPLAY, FONT} from '../theme';
import {SceneProps, wordAt} from './timeline';
import {CheckIcon, EndCard, Phone, Pill, PromptBox, R, SAFE_CX, gradText} from './kit';
import {Sticker, Tick, Title} from './parts';

// Short 5 — restauration / food (artisan pâtes fraîches, grossistes): artisane, plans cuisine & entrepôt

const WARM = 'linear-gradient(100deg,#FFB347,#FF6A3D)';

// « Vous faites des pâtes fraîches. Pas des vidéos. Et c'est normal. »
export const S5Hook: React.FC<SceneProps> = ({lines}) => {
  const f = useCurrentFrame();
  const l = lines[0];
  const pas = wordAt(l, 'pas', 40);
  const norm = wordAt(l, 'normal', 80);
  const cross = prog(f, pas + 8, 10);
  return (
    <StudioBg intensity={0.8}>
      <div style={{position: 'absolute', left: R.x, width: R.w, top: R.y + 20}}>
        <Title text="Vous faites des *pâtes* *fraîches.*" start={2} step={4} size={100} grad={WARM} />
      </div>
      <div style={{position: 'absolute', left: SAFE_CX - 160, top: 640, width: 320, height: 240, opacity: prog(f, pas - 2, 10), transform: `scale(${pop(f, pas - 2, 12)})`}}>
        <svg width="320" height="240" viewBox="0 0 64 48">
          <rect x="4" y="12" width="40" height="28" rx="6" fill="none" stroke="#fff" strokeWidth="3" />
          <path d="M44 22l14-8v20l-14-8z" fill="none" stroke="#fff" strokeWidth="3" strokeLinejoin="round" />
          <circle cx="24" cy="26" r="7" fill="none" stroke="#fff" strokeWidth="3" />
        </svg>
        <div style={{position: 'absolute', left: -20, right: -20, top: '48%', height: 14, borderRadius: 7, backgroundImage: 'linear-gradient(90deg,#FF8A8A,#FF4D6D)', transform: `rotate(-20deg) scaleX(${cross})`, transformOrigin: 'left', boxShadow: '0 0 24px rgba(255,77,109,0.8)'}} />
      </div>
      <div style={{position: 'absolute', left: R.x, width: R.w, top: 960, textAlign: 'center', fontFamily: DISPLAY, fontWeight: 700, fontSize: 66, color: '#fff', opacity: prog(f, norm - 6, 10), transform: `translateY(${(1 - prog(f, norm - 6, 12)) * 30}px)`}}>
        Et c’est <span style={gradText(WARM)}>normal.</span>
      </div>
    </StudioBg>
  );
};

// « Growthity met une artisane face caméra, dans votre atelier. »
export const S5Artisan: React.FC<SceneProps> = ({lines}) => {
  const f = useCurrentFrame();
  const l = lines[0];
  const keys = [wordAt(l, 'artisane', 20), wordAt(l, 'caméra', 40), wordAt(l, 'atelier', 60)];
  const p = prog(f, 0, 18, INOUT);
  return (
    <LightBg>
      <div style={{position: 'absolute', left: R.x + R.w - 500, top: R.y + 10, transform: `translateX(${(1 - p) * 500}px) rotate(${(1 - p) * 10}deg)`}}>
        <Phone src="ugc-pates-fraiches.mp4" w={500}>
          <div style={{position: 'absolute', left: 16, top: 16}}>
            <Pill tone="dark" size={19}>Artisane IA · atelier</Pill>
          </div>
        </Phone>
      </div>
      <div style={{position: 'absolute', left: R.x, top: 500, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 26}}>
        {['Artisane', 'Face caméra', 'Votre atelier'].map((t, i) => (
          <Tick key={t} at={keys[i]} size={28}>
            {t}
          </Tick>
        ))}
      </div>
    </LightBg>
  );
};

// « Pour vos clients pros : des plans cinéma, de la cuisine à l'entrepôt. »
export const S5Pro: React.FC<SceneProps> = ({lines}) => {
  const f = useCurrentFrame();
  const l = lines[0];
  const cine = wordAt(l, 'cinéma', 40);
  const cui = wordAt(l, 'cuisine', 60);
  const ent = wordAt(l, "l'entrepôt", 80);
  const W = 410;
  const H = 730;
  const a = prog(f, 2, 16, INOUT);
  const b = prog(f, cine - 4, 16, INOUT);
  const bars = prog(f, cine - 6, 14);
  return (
    <StudioBg intensity={0.6}>
      {[{src: 'vid-oeufs-cuisine.mp4', t: 'Cuisine', p: a, x: R.x, from: 2, hi: cui}, {src: 'vid-entrepot-vaisselle.mp4', t: 'Entrepôt', p: b, x: R.x + R.w - W, from: cine - 4, hi: ent}].map((c) => (
        <div key={c.src} style={{position: 'absolute', left: c.x, top: 330, width: W, height: H, borderRadius: 26, overflow: 'hidden', opacity: c.p, transform: `translateY(${(1 - c.p) * 300}px) scale(${mix(1.1, 1, c.p) * (f >= c.hi && f < c.hi + 24 ? 1.03 : 1)})`, boxShadow: '0 50px 100px -40px rgba(0,0,0,0.95)'}}>
          <Sequence from={c.from} layout="none">
            <Clip src={c.src} width={W} height={H} />
          </Sequence>
          <div style={{position: 'absolute', left: 14, bottom: 14}}>
            <Pill size={22}>{c.t}</Pill>
          </div>
        </div>
      ))}
      {/* cinema bars */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 240 * bars, background: '#000'}} />
      <div style={{position: 'absolute', left: R.x, width: R.w, top: 258, textAlign: 'center', fontFamily: FONT, fontWeight: 800, fontSize: 26, letterSpacing: '0.3em', color: '#FFD08A', opacity: bars}}>
        PLANS CINÉMA · 9:16
      </div>
    </StudioBg>
  );
};

// « Une phrase, et votre pub tourne sur Instagram et Facebook. »
const PROMPT = 'Pâtes fraîches artisanales, livrées aux restaurants de Lyon.';
export const S5Publish: React.FC<SceneProps> = ({lines}) => {
  const f = useCurrentFrame();
  const l = lines[0];
  const send = wordAt(l, 'et', 20) + 2;
  const insta = wordAt(l, 'instagram', 50);
  const fb = wordAt(l, 'facebook', 70);
  const up = prog(f, send, 16, INOUT);
  return (
    <LightBg>
      <div style={{position: 'absolute', left: R.x, top: mix(520, R.y + 10, up), width: R.w, transform: `scale(${1 - up * 0.12})`, transformOrigin: 'top center'}}>
        <PromptBox text={PROMPT} start={0} cps={Math.max(50, (PROMPT.length * 30) / Math.max(20, send - 4))} send={send} size={36} />
      </div>
      <div style={{position: 'absolute', left: R.x, width: R.w, top: 620, display: 'flex', flexDirection: 'column', gap: 24}}>
        {[
          {n: 'Instagram', at: insta, c: 'linear-gradient(120deg,#F58529,#DD2A7B,#8134AF)'},
          {n: 'Facebook', at: fb, c: 'linear-gradient(120deg,#1877F2,#3B5BDB)'},
        ].map((s) => {
          const p = pop(f, s.at, 12);
          return (
            <div key={s.n} style={{display: 'flex', alignItems: 'center', gap: 22, background: '#fff', borderRadius: 26, padding: '22px 26px', boxShadow: '0 30px 60px -30px rgba(37,22,120,0.5)', opacity: Math.min(1, p * 2), transform: `translateX(${(1 - p) * 200}px)`, fontFamily: FONT}}>
              <div style={{width: 70, height: 70, borderRadius: 20, backgroundImage: s.c, flexShrink: 0}} />
              <div style={{flex: 1}}>
                <div style={{fontSize: 32, fontWeight: 800, color: C.ink}}>{s.n}</div>
                <div style={{fontSize: 22, color: C.slate}}>Reels · Stories · Fil</div>
              </div>
              <div style={{display: 'flex', alignItems: 'center', gap: 10, padding: '10px 18px', borderRadius: 999, background: C.success, color: '#fff', fontWeight: 800, fontSize: 22}}>
                <CheckIcon size={20} /> En ligne
              </div>
            </div>
          );
        })}
        <div style={{textAlign: 'center', fontFamily: DISPLAY, fontWeight: 700, fontSize: 54, color: C.ink, marginTop: 10, opacity: prog(f, insta + 6, 10)}}>
          Diffusée <span style={{fontSize: 40, color: C.slate}}>autour de votre atelier</span>
        </div>
      </div>
      <Sticker at={fb + 12} rot={-6} size={34} bg={WARM} style={{left: R.x + 520, top: 560}}>
        Lyon · 15 km
      </Sticker>
    </LightBg>
  );
};

export const S5End: React.FC<SceneProps> = ({dur}) => (
  <EndCard
    dur={dur}
    tagline={
      <>
        Faites saliver
        <br />
        <span style={gradText(WARM)}>votre ville.</span>
      </>
    }
  />
);
