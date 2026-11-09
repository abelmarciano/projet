import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {LightBg, StudioBg} from '../components/Backgrounds';
import {prog, pop, INOUT} from '../components/anim';
import {C, DISPLAY, FONT, GRAD} from '../theme';
import {SceneProps, wordAt} from './timeline';
import {EndCard, Phone, Pill, R, SAFE_CX, gradText} from './kit';
import {Card, Sticker, Tick, Title} from './parts';

// Short 4 — B2B / services aux entreprises (Leadeurs): Caroline, Lila, visuel 32 € / lead

// « Vous vendez aux entreprises ? Votre pub ne doit pas ressembler à une pub. »
export const S4Hook: React.FC<SceneProps> = ({lines}) => {
  const f = useCurrentFrame();
  const l = lines[0];
  const res = wordAt(l, 'ressembler', 60);
  const strike = prog(f, res, 10);
  const shake = f > res && f < res + 10 ? Math.sin(f * 2.4) * 6 : 0;
  const card = pop(f, 10, 14);
  return (
    <StudioBg>
      <div style={{position: 'absolute', left: R.x, width: R.w, top: R.y + 10}}>
        <Title text="Vous vendez aux *entreprises* ?" start={2} step={4} size={96} />
      </div>
      {/* the stock-photo B2B banner everybody scrolls past */}
      <div style={{position: 'absolute', left: SAFE_CX - 360, top: 600, width: 720, transform: `scale(${card}) rotate(${-3 + shake * 0.3}deg) translateX(${shake}px)`, background: '#E9EDF3', borderRadius: 26, overflow: 'hidden', fontFamily: FONT, boxShadow: '0 40px 90px -40px rgba(0,0,0,0.9)', filter: `grayscale(${strike})`}}>
        <div style={{height: 200, background: 'linear-gradient(135deg,#B8C4D6,#8FA0B8)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 30}}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{width: 80, height: 120, borderRadius: '40px 40px 10px 10px', background: 'rgba(255,255,255,0.55)'}} />
          ))}
        </div>
        <div style={{padding: '26px 32px'}}>
          <div style={{fontSize: 34, fontWeight: 800, color: '#3B4658'}}>Des solutions innovantes pour votre entreprise</div>
          <div style={{fontSize: 24, color: '#6B778A', marginTop: 10}}>Leader de la transformation digitale depuis 2009.</div>
          <div style={{marginTop: 20, display: 'inline-block', padding: '12px 26px', borderRadius: 10, background: '#8FA0B8', color: '#fff', fontWeight: 700, fontSize: 24}}>En savoir plus</div>
        </div>
        <div style={{position: 'absolute', left: -20, right: -20, top: '50%', height: 14, borderRadius: 7, backgroundImage: 'linear-gradient(90deg,#FF8A8A,#FF4D6D)', transform: `rotate(-14deg) scaleX(${strike})`, transformOrigin: 'left', boxShadow: '0 0 30px rgba(255,77,109,0.8)'}} />
      </div>
      <Sticker at={res + 6} rot={6} size={42} bg="linear-gradient(120deg,#FF5A6E,#E5484D)" style={{left: R.x + 230, top: 1000}}>
        Personne ne s’arrête
      </Sticker>
    </StudioBg>
  );
};

// « Une conseillère face caméra, en blazer, dans un vrai bureau. »
export const S4Caroline: React.FC<SceneProps> = ({lines}) => {
  const f = useCurrentFrame();
  const l = lines[0];
  const keys = [wordAt(l, 'face', 20), wordAt(l, 'blazer', 40), wordAt(l, 'bureau', 60)];
  const p = prog(f, 0, 18, INOUT);
  return (
    <LightBg>
      <div style={{position: 'absolute', left: R.x, top: R.y + 10, transform: `translateX(${(1 - p) * -500}px) rotate(${(1 - p) * -10}deg)`}}>
        <Phone src="ugc-caroline-b2b-1.mp4" w={500}>
          <div style={{position: 'absolute', left: 16, top: 16}}>
            <Pill tone="dark" size={19}>Caroline · conseillère IA</Pill>
          </div>
        </Phone>
      </div>
      <div style={{position: 'absolute', left: R.x + 470, top: 520, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 26}}>
        {['Face caméra', 'En blazer', 'Vrai bureau'].map((t, i) => (
          <Tick key={t} at={keys[i]} size={28}>
            {t}
          </Tick>
        ))}
      </div>
    </LightBg>
  );
};

// « Un autre secteur ? Une autre conseillère, avec votre offre et votre prix. »
export const S4Lila: React.FC<SceneProps> = ({lines}) => {
  const f = useCurrentFrame();
  const l = lines[0];
  const autre = wordAt(l, 'conseillère', 30);
  const offre = wordAt(l, 'offre', 70);
  const prix = wordAt(l, 'prix', 90);
  const p = prog(f, 4, 20, INOUT);
  const sector = Math.floor(interpolate(f, [0, autre - 8], [0, 5.99], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));
  const SECT = ['Logiciel', 'Transport', 'Formation', 'Énergie', 'Sécurité', 'Éclairage public'];
  return (
    <StudioBg>
      <div style={{position: 'absolute', left: R.x, width: R.w, top: R.y + 10, textAlign: 'center', fontFamily: DISPLAY, fontWeight: 700, fontSize: 56, color: '#fff'}}>
        Secteur :{' '}
        <span style={{display: 'inline-block', padding: '0 20px', borderRadius: 18, backgroundImage: GRAD}}>{SECT[sector]}</span>
      </div>
      <div style={{position: 'absolute', left: SAFE_CX - 230, top: 380, transform: `translateY(${(1 - p) * 900}px)`}}>
        <Phone src="ugc-lila-eclairage.mp4" w={460} from={4}>
          <div style={{position: 'absolute', left: 16, top: 16}}>
            <Pill tone="dark" size={18}>Lila · conseillère IA</Pill>
          </div>
        </Phone>
      </div>
      <Sticker at={offre} rot={-7} size={38} style={{left: R.x - 10, top: 620}}>
        Votre offre
      </Sticker>
      <Sticker at={prix} rot={6} size={50} bg="linear-gradient(120deg,#19A866,#22C17A)" style={{left: R.x + 560, top: 860}}>
        Votre prix
      </Sticker>
    </StudioBg>
  );
};

// « Et un visuel chiffré pour relancer vos prospects. Prêt en quelques minutes. »
export const S4Visual: React.FC<SceneProps> = ({lines}) => {
  const f = useCurrentFrame();
  const l = lines[0];
  const pret = wordAt(l, 'prêt', 60);
  const p = pop(f, 2, 14);
  const mins = Math.round(interpolate(f, [pret - 4, pret + 18], [0, 4], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));
  return (
    <LightBg>
      <div style={{position: 'absolute', left: SAFE_CX - 340, top: R.y + 10, transform: `scale(${p}) rotate(${(1 - p) * 8}deg)`}}>
        <Card src="img-b2b-leads-32eur.jpg" w={680} h={680 * (1987 / 1920)} radius={30} style={{left: 0, top: 0}} />
      </div>
      <div style={{position: 'absolute', left: R.x, width: R.w, top: 1000, display: 'flex', justifyContent: 'center', gap: 18, opacity: prog(f, pret - 4, 10)}}>
        <Pill tone="grad" size={30}>
          ⏱ {mins} min
        </Pill>
        <Pill tone="green" size={30}>
          ✓ Prêt
        </Pill>
      </div>
      <div style={{position: 'absolute', left: R.x, width: R.w, top: 1095, textAlign: 'center', fontFamily: FONT, fontSize: 26, color: C.slate, opacity: prog(f, pret + 10, 12)}}>
        Format 4:5 · retargeting Meta
      </div>
    </LightBg>
  );
};

export const S4End: React.FC<SceneProps> = ({dur}) => (
  <EndCard
    dur={dur}
    tagline={
      <>
        Le B2B mérite
        <br />
        <span style={gradText()}>de bonnes pubs.</span>
      </>
    }
  />
);
