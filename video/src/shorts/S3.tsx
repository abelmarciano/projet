import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {LightBg, StudioBg} from '../components/Backgrounds';
import {Clip} from '../components/Media';
import {MetaLogo} from '../components/UI';
import {prog, pop, INOUT, mix} from '../components/anim';
import {C, DISPLAY, FONT, GRAD} from '../theme';
import {SceneProps, wordAt} from './timeline';
import {CheckIcon, EndCard, Phone, Pill, PromptBox, R, SAFE_CX, gradText} from './kit';

// « Vous payez encore trois mille euros pour une pub ? »
export const S3Hook: React.FC<SceneProps> = () => {
  const f = useCurrentFrame();
  const shake = Math.sin(f * 1.7) * Math.max(0, 6 - f * 0.25);
  return (
    <StudioBg intensity={0.9}>
      {/* the invoice behind */}
      <div style={{position: 'absolute', left: SAFE_CX - 330, top: 640, width: 660, transform: `rotate(-6deg) translateY(${-Math.min(f, 80) * 0.5}px)`, background: '#fff', borderRadius: 24, padding: '30px 34px', fontFamily: FONT, boxShadow: '0 50px 120px -40px rgba(0,0,0,0.9)', opacity: 0.95}}>
        <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 22, color: C.slate}}>
          <b style={{color: C.ink}}>Agence Créa+</b> Facture n° 0247
        </div>
        {[['Brief & concept', '900 €'], ['Tournage (1 jour)', '1 400 €'], ['Montage · 3 versions', '700 €']].map(([k, v]) => (
          <div key={k} style={{display: 'flex', justifyContent: 'space-between', fontSize: 24, color: C.ink, padding: '14px 0', borderBottom: `1px solid ${C.hairline}`}}>
            <span>{k}</span>
            <span>{v}</span>
          </div>
        ))}
        <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 30, fontWeight: 800, color: C.ink, marginTop: 16}}>
          <span>Total TTC</span>
          <span style={{color: '#E5484D'}}>3 000 €</span>
        </div>
      </div>
      <div style={{position: 'absolute', left: R.x, width: R.w, top: 300, textAlign: 'center', transform: `translateX(${shake}px)`}}>
        <div style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 200, lineHeight: 1, whiteSpace: 'nowrap', color: '#fff', textShadow: '0 20px 60px rgba(229,72,77,0.55)'}}>3 000 €</div>
        <div style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 76, color: '#fff', marginTop: 14}}>
          pour <span style={gradText('linear-gradient(100deg,#FF8A8A,#FF4D6D)')}>une</span> pub ?
        </div>
      </div>
    </StudioBg>
  );
};

// « Deux semaines d'attente. Des allers-retours sans fin. »
const MAILS = ['Re: Pub V2 — retours client', 'Re: Re: V3, on change la musique ?', 'Re: Re: Re: V5_final.mp4', 'Re: Re: Re: Re: V7_FINAL_final.mp4'];
export const S3Pain: React.FC<SceneProps> = ({lines}) => {
  const f = useCurrentFrame();
  const mailsAt = wordAt(lines[0], 'allers', 40) - 6;
  const day = Math.min(14, Math.floor(interpolate(f, [4, mailsAt], [1, 14], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})));
  const strike = prog(f, lines[0].frames - 16, 10);
  return (
    <StudioBg intensity={0.7}>
      <div style={{position: 'absolute', left: SAFE_CX - 190, top: R.y + 10, width: 380, borderRadius: 30, overflow: 'hidden', background: '#fff', boxShadow: '0 40px 100px -40px rgba(0,0,0,0.9)', fontFamily: FONT, textAlign: 'center', transform: `scale(${1 - prog(f, mailsAt, 14) * 0.15})`, transformOrigin: 'top center'}}>
        <div style={{background: '#E5484D', color: '#fff', fontWeight: 800, fontSize: 30, padding: '14px 0', letterSpacing: '0.1em'}}>JOUR</div>
        <div style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 190, color: C.ink, lineHeight: 1.1, fontVariantNumeric: 'tabular-nums'}}>{day}</div>
        <div style={{fontSize: 26, color: C.slate, paddingBottom: 20}}>en attente de la V1…</div>
      </div>
      <div style={{position: 'absolute', left: R.x + 20, width: R.w - 40, top: 720}}>
        {MAILS.map((m, i) => {
          const p = pop(f, mailsAt + i * 6, 13);
          return (
            <div key={m} style={{display: 'flex', alignItems: 'center', gap: 16, background: '#fff', borderRadius: 20, padding: '18px 22px', marginTop: i ? 16 : 0, transform: `translateY(${(1 - p) * 80}px) rotate(${(i % 2 ? 1.5 : -1.5)}deg)`, opacity: p, boxShadow: '0 24px 50px -24px rgba(0,0,0,0.8)', fontFamily: FONT, position: 'relative', zIndex: i}}>
              <div style={{width: 46, height: 46, borderRadius: 23, background: '#FDE2E2', color: '#E5484D', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22}}>@</div>
              <div style={{fontSize: 25, fontWeight: 700, color: C.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{m}</div>
            </div>
          );
        })}
      </div>
      <div style={{position: 'absolute', left: R.x - 20, width: R.w + 40, top: 640, height: 16, borderRadius: 8, backgroundImage: 'linear-gradient(90deg,#FF8A8A,#FF4D6D)', transform: `rotate(-12deg) scaleX(${strike})`, transformOrigin: 'left center', boxShadow: '0 0 30px rgba(255,77,109,0.7)'}} />
    </StudioBg>
  );
};

// « Avec Growthity, une phrase suffit. Vidéos UGC, visuels, carrousels. »
export const S3Make: React.FC<SceneProps> = ({lines}) => {
  const f = useCurrentFrame();
  const l = lines[0];
  const send = wordAt(l, 'phrase', 24) + 8;
  const shrink = prog(f, send + 4, 16, INOUT);
  const vid = pop(f, wordAt(l, 'vidéos', 50), 13);
  const vis = pop(f, wordAt(l, 'visuels', 60), 13);
  const car = pop(f, wordAt(l, 'carrousels', 70), 13);
  const carPos = interpolate(f, [wordAt(l, 'carrousels', 70) + 10, wordAt(l, 'carrousels', 70) + 26], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: INOUT});
  return (
    <LightBg>
      <div style={{position: 'absolute', left: R.x, top: mix(560, R.y + 10, shrink), width: R.w, transform: `scale(${1 - shrink * 0.3})`, transformOrigin: 'top center'}}>
        <PromptBox text="Pompes à chaleur financées par les aides de l’État." start={0} cps={60} send={send} size={38} />
      </div>
      <div style={{position: 'absolute', left: R.x, top: 500, transform: `translateY(${(1 - vid) * 200}px) rotate(${(1 - vid) * -6}deg)`, opacity: vid}}>
        <Phone src="ugc-femme.mp4" w={390} from={wordAt(l, 'vidéos', 50)}>
          <div style={{position: 'absolute', bottom: 16, left: 16}}>
            <Pill size={19}>Vidéo UGC · 9:16</Pill>
          </div>
        </Phone>
      </div>
      <div style={{position: 'absolute', left: R.x + 420, top: 500, width: 420, height: 320, borderRadius: 24, overflow: 'hidden', transform: `scale(${vis})`, boxShadow: '0 40px 80px -36px rgba(37,22,120,0.6)'}}>
        <Clip src="img-pac-fioul.webp" width={420} height={320} />
        <div style={{position: 'absolute', bottom: 14, left: 14}}>
          <Pill size={19}>Visuel</Pill>
        </div>
      </div>
      <div style={{position: 'absolute', left: R.x + 420, top: 846, width: 420, height: 320, borderRadius: 24, overflow: 'hidden', transform: `scale(${car})`, boxShadow: '0 40px 80px -36px rgba(37,22,120,0.6)'}}>
        <div style={{display: 'flex', width: 840, transform: `translateX(${-carPos * 420}px)`}}>
          <Clip src="img-pac-rge.webp" width={420} height={320} />
          <Clip src="img-pac-70.webp" width={420} height={320} />
        </div>
        <div style={{position: 'absolute', bottom: 14, left: 14}}>
          <Pill size={19}>Carrousel</Pill>
        </div>
      </div>
    </LightBg>
  );
};

// « Et c'est publié sur Meta, en un clic. »
export const S3Publish: React.FC<SceneProps> = ({lines}) => {
  const f = useCurrentFrame();
  const click = wordAt(lines[0], 'clic', 50);
  const live = f >= click;
  const burst = prog(f, click, 24);
  const cx = interpolate(f, [8, click - 4], [980, 520], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: INOUT});
  const cy = interpolate(f, [8, click - 4], [1500, 790], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: INOUT});
  return (
    <LightBg>
      <div style={{position: 'absolute', left: R.x, width: R.w, top: R.y + 30, background: '#fff', borderRadius: 32, padding: 34, boxShadow: '0 50px 120px -50px rgba(37,22,120,0.6)', fontFamily: FONT}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 22}}>
          <div style={{borderRadius: 18, overflow: 'hidden'}}>
            <Clip src="ugc-femme.mp4" width={130} height={170} startFrom={40} />
          </div>
          <div style={{flex: 1}}>
            <div style={{fontSize: 19, letterSpacing: '0.14em', color: C.slate, fontWeight: 700}}>CAMPAGNE</div>
            <div style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 44, color: C.ink}}>Pompes à chaleur</div>
            <div style={{fontSize: 22, color: C.slate}}>3 créations · Objectif leads</div>
          </div>
        </div>
        {[['Ciblage', 'Paris · Lyon · Bordeaux'], ['Budget', '20 € / jour'], ['Placements', 'Feed · Reels · Stories']].map(([k, v]) => (
          <div key={k} style={{display: 'flex', justifyContent: 'space-between', fontSize: 26, padding: '22px 0', borderTop: `1px solid ${C.hairline}`, marginTop: k === 'Ciblage' ? 24 : 0}}>
            <span style={{color: C.slate}}>{k}</span>
            <b style={{color: C.ink}}>{v}</b>
          </div>
        ))}
        <div style={{position: 'relative', marginTop: 18}}>
          <div style={{height: 96, borderRadius: 22, backgroundImage: live ? 'linear-gradient(120deg,#19A866,#22C17A)' : GRAD, color: '#fff', fontWeight: 800, fontSize: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, transform: `scale(${f > click - 3 && f < click + 3 ? 0.95 : 1})`}}>
            {live ? (
              <>
                <CheckIcon size={32} /> En ligne sur Meta
              </>
            ) : (
              <>
                <MetaLogo size={34} /> Publier sur Meta
              </>
            )}
          </div>
          {burst > 0 && burst < 1 &&
            Array.from({length: 18}).map((_, i) => {
              const a = (i / 18) * Math.PI * 2;
              const d = 40 + burst * 300;
              return <div key={i} style={{position: 'absolute', left: '50%', top: '50%', width: 16, height: 16, borderRadius: 8, background: [C.blue, C.indigo, C.purple, C.pink, C.success][i % 5], transform: `translate(${Math.cos(a) * d * 1.3}px, ${Math.sin(a) * d * 0.7}px) scale(${1 - burst})`}} />;
            })}
        </div>
      </div>
      <div style={{position: 'absolute', left: R.x, width: R.w, top: 1010, display: 'flex', justifyContent: 'center', gap: 16, opacity: prog(f, click + 6, 12), transform: `translateY(${(1 - prog(f, click + 6, 12)) * 20}px)`}}>
        <Pill size={24}>Facebook</Pill>
        <Pill size={24}>Instagram</Pill>
        <Pill size={24} tone="green">● Live</Pill>
      </div>
      {f < click + 20 && (
        <svg width="54" height="54" viewBox="0 0 24 24" style={{position: 'absolute', left: cx, top: cy, filter: 'drop-shadow(0 6px 10px rgba(0,0,0,0.35))', transform: `scale(${f > click - 3 && f < click + 4 ? 0.85 : 1})`}}>
          <path d="M5 3l14 8-6 1.5L10 19z" fill="#0F172A" stroke="#fff" strokeWidth={1.5} strokeLinejoin="round" />
        </svg>
      )}
    </LightBg>
  );
};

export const S3End: React.FC<SceneProps> = ({dur}) => (
  <EndCard
    dur={dur}
    tagline={
      <>
        Une phrase.
        <br />
        <span style={gradText()}>Pas 3 000 €.</span>
      </>
    }
  />
);
