import React, {useEffect, useState} from 'react';
import {AbsoluteFill, continueRender, delayRender, Img, staticFile} from 'remotion';
import '@fontsource/inter/400.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/inter/800.css';
import '@fontsource/space-grotesk/600.css';
import '@fontsource/space-grotesk/700.css';
import {LogoMark} from '../components/UI';
import {C, DISPLAY, FONT, GRAD} from '../theme';

// 10 Instagram feed posts (4:5, 1080×1350) promoting Growthity.
// Photo-first: full-bleed frames from the most natural-looking ads of the account,
// short native-style text, small brand mark. One actor / one visual per post.

const W = 1080;
const H = 1350;
const M = 72; // margin — keeps text inside the 3:4 profile-grid crop
const ig = (p: string) => staticFile(`media/ig/${p}`);

const useFonts = () => {
  const [h] = useState(() => delayRender('fonts'));
  useEffect(() => {
    const specs = ['400 20px Inter', '600 20px Inter', '700 20px Inter', '800 20px Inter', '600 20px "Space Grotesk"', '700 20px "Space Grotesk"'];
    Promise.all(specs.map((s) => document.fonts.load(s))).then(() => continueRender(h));
  }, [h]);
};

// light film grain so the frames read as photos, not renders
const Grain: React.FC<{o?: number}> = ({o = 0.07}) => (
  <svg width={W} height={H} style={{position: 'absolute', inset: 0, opacity: o, mixBlendMode: 'overlay', pointerEvents: 'none'}}>
    <filter id="grain">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
      <feColorMatrix type="saturate" values="0" />
    </filter>
    <rect width="100%" height="100%" filter="url(#grain)" />
  </svg>
);

const Photo: React.FC<{p: string; pos?: string; style?: React.CSSProperties; scale?: number}> = ({p, pos = 'center', style, scale = 1}) => (
  <Img src={ig(p)} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: pos, transform: `scale(${scale})`, transformOrigin: pos, ...style}} />
);

const Shade: React.FC<{from?: 'top' | 'bottom'; h?: number; o?: number}> = ({from = 'bottom', h = 620, o = 0.78}) => (
  <div style={{position: 'absolute', left: 0, right: 0, [from]: 0, height: h, background: `linear-gradient(${from === 'bottom' ? '0deg' : '180deg'}, rgba(0,0,0,${o}) 0%, rgba(0,0,0,${o * 0.45}) 55%, transparent 100%)`}} />
);

// Instagram "text with background" look: one white rounded block per line
const Sticker: React.FC<{lines: React.ReactNode[]; size?: number; align?: 'left' | 'center'; dark?: boolean; style?: React.CSSProperties}> = ({lines, size = 46, align = 'left', dark = false, style}) => (
  <div style={{position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: align === 'center' ? 'center' : 'flex-start', ...style}}>
    {lines.map((l, i) => (
      <span
        key={i}
        style={{
          fontFamily: FONT,
          fontWeight: 700,
          fontSize: size,
          lineHeight: 1.18,
          color: dark ? '#fff' : '#0B0A0C',
          background: dark ? '#0B0A0C' : '#fff',
          padding: `${size * 0.14}px ${size * 0.34}px`,
          borderRadius: size * 0.28,
          marginTop: i ? -size * 0.12 : 0,
          whiteSpace: 'nowrap',
          letterSpacing: '-0.01em',
        }}
      >
        {l}
      </span>
    ))}
  </div>
);

const Big: React.FC<{children: React.ReactNode; size?: number; style?: React.CSSProperties}> = ({children, size = 104, style}) => (
  <div style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: size, lineHeight: 0.98, letterSpacing: '-0.03em', color: '#fff', textShadow: '0 4px 30px rgba(0,0,0,0.35)', ...style}}>{children}</div>
);

const Sub: React.FC<{children: React.ReactNode; style?: React.CSSProperties; color?: string}> = ({children, style, color = 'rgba(255,255,255,0.92)'}) => (
  <div style={{fontFamily: FONT, fontWeight: 600, fontSize: 36, lineHeight: 1.3, color, ...style}}>{children}</div>
);

const hi: React.CSSProperties = {backgroundImage: 'linear-gradient(100deg,#7AA2FF,#B48CFF 55%,#F07BC0)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent'};

// small brand row: logo + growthity.ai on the left, "Lien en bio" on the right
const Brand: React.FC<{dark?: boolean; y?: number}> = ({dark = false, y = H - 104}) => {
  const fg = dark ? C.ink : '#fff';
  return (
    <div style={{position: 'absolute', left: M, right: M, top: y, display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
        <LogoMark size={40} color={dark ? undefined : '#fff'} />
        <span style={{fontFamily: DISPLAY, fontWeight: 600, fontSize: 36, color: fg}}>growthity.ai</span>
      </div>
      <div style={{display: 'flex', alignItems: 'center', gap: 10, height: 56, padding: '0 26px', borderRadius: 999, background: dark ? C.ink : '#fff', color: dark ? '#fff' : C.ink, fontFamily: FONT, fontWeight: 700, fontSize: 25}}>
        Lien en bio
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M12 19V5M6 11l6-6 6 6" stroke={dark ? '#fff' : C.ink} strokeWidth={2.8} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
};

const Post: React.FC<{children: React.ReactNode; bg?: string}> = ({children, bg = '#000'}) => {
  useFonts();
  return <AbsoluteFill style={{background: bg, overflow: 'hidden'}}>{children}</AbsoluteFill>;
};

// 01 — Sarah : « Elle n'existe pas. »
export const Crea01: React.FC = () => (
  <Post>
    <Photo p="sarah.jpg" pos="50% 30%" />
    <Grain />
    <Shade h={700} o={0.82} />
    <div style={{position: 'absolute', left: M, right: M, top: 880}}>
      <Big size={112}>Elle n’existe pas.</Big>
      <Sub style={{marginTop: 22}}>
        Sa vidéo pour un bracelet, si. <span style={{fontWeight: 800, color: '#fff'}}>Faite en 2 minutes</span> avec Growthity.
      </Sub>
    </div>
    <Brand />
  </Post>
);

// 02 — Alice : POV studio de jardin
export const Crea02: React.FC = () => (
  <Post>
    <Photo p="alice.jpg" pos="50% 38%" />
    <Grain />
    <Shade from="bottom" h={260} o={0.6} />
    <Sticker lines={['POV : vous vendez', 'des studios de jardin…']} size={50} style={{left: M, top: 96}} />
    <Sticker lines={['…et Alice les présente pour vous.']} size={36} dark style={{left: M, top: 262}} />
    <Sticker lines={['(Alice n’existe pas.)']} size={30} style={{right: M, top: 860, transform: 'rotate(-3deg)'}} />
    <Brand />
  </Post>
);

// 03 — Emma : 0 shooting, 0 influenceuse
export const Crea03: React.FC = () => (
  <Post>
    <Photo p="emma.jpg" pos="50% 40%" />
    <Grain />
    <Shade from="top" h={520} o={0.7} />
    <Shade from="bottom" h={300} o={0.6} />
    <div style={{position: 'absolute', left: M, right: M, top: 84}}>
      <Big size={96}>
        0 shooting.
        <br />0 influenceuse.
      </Big>
      <Sub style={{marginTop: 20}}>
        1 phrase → <b style={{color: '#fff'}}>cette vidéo UGC.</b>
      </Sub>
    </div>
    <Brand />
  </Post>
);

// 04 — avant / après : photo produit → vidéo portée
export const Crea04: React.FC = () => (
  <Post bg="#fff">
    <div style={{position: 'absolute', left: 0, top: 0, width: W, height: 560, background: '#F7F6F3'}}>
      <Img src={ig('trefle-packshot.jpg')} style={{position: 'absolute', left: 150, top: 70, width: 780, objectFit: 'contain'}} />
      <Sticker lines={['Votre photo produit']} size={38} dark style={{left: M, top: 470}} />
    </div>
    <div style={{position: 'absolute', left: 0, top: 560, width: W, height: H - 560, overflow: 'hidden'}}>
      <Photo p="lou-poignet.jpg" pos="50% 55%" />
      <Grain />
      <Shade h={300} o={0.65} />
      <Sticker lines={['Votre pub vidéo']} size={38} style={{left: M, top: 40}} />
    </div>
    <div style={{position: 'absolute', left: W / 2 - 54, top: 560 - 54, width: 108, height: 108, borderRadius: 54, backgroundImage: GRAD, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 16px 40px -10px rgba(91,63,228,0.7)', border: '6px solid #fff'}}>
      <svg width="46" height="46" viewBox="0 0 24 24" fill="none">
        <path d="M12 5v14M6 13l6 6 6-6" stroke="#fff" strokeWidth={2.8} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
    <Brand />
  </Post>
);

// 05 — artisane : des pâtes, pas des vidéos
export const Crea05: React.FC = () => (
  <Post>
    <Photo p="pates.jpg" pos="50% 42%" />
    <Grain />
    <Shade h={720} o={0.85} />
    <div style={{position: 'absolute', left: M, right: M, top: 860}}>
      <Big size={84}>
        Vous faites des pâtes.
        <br />
        <span style={{color: '#FFC27A'}}>Pas des vidéos.</span>
      </Big>
      <Sub style={{marginTop: 20}}>Growthity tourne la pub de votre atelier à votre place.</Sub>
    </div>
    <Brand />
  </Post>
);

// 06 — Caroline : B2B face caméra, sans caméra
export const Crea06: React.FC = () => (
  <Post>
    <Photo p="caroline.jpg" pos="50% 30%" />
    <Grain />
    <Shade from="top" h={480} o={0.8} />
    <Shade h={260} o={0.6} />
    <div style={{position: 'absolute', left: M, right: M, top: 84}}>
      <Big size={74}>
        Votre offre B2B,
        <br />
        présentée face caméra.
      </Big>
      <Sticker lines={['Sans caméra.']} size={56} style={{position: 'relative', marginTop: 22}} />
    </div>
    <Brand />
  </Post>
);

// 07 — bougie : décrivez l'ambiance
export const Crea07: React.FC = () => (
  <Post>
    <Photo p="bougie.jpg" pos="50% 45%" />
    <Grain o={0.09} />
    <Shade from="top" h={480} o={0.75} />
    <Shade h={260} o={0.55} />
    <div style={{position: 'absolute', left: M, right: M, top: 90, textAlign: 'center'}}>
      <Big size={92}>Décrivez l’ambiance.</Big>
      <Sub style={{marginTop: 18}}>On s’occupe de la vidéo qui la vend.</Sub>
    </div>
    <Brand />
  </Post>
);

// 08 — collage : aucune de ces personnes n'existe
const FACES = [
  {p: 'lucas.jpg', pos: '50% 40%'},
  {p: 'lila.jpg', pos: '50% 30%'},
  {p: 'porte-savon.jpg', pos: '50% 30%'},
  {p: 'etudiant.jpg', pos: '50% 30%'},
];
export const Crea08: React.FC = () => {
  const g = 8;
  const cw = (W - g) / 2;
  const ch = (H - g) / 2;
  return (
    <Post bg="#fff">
      {FACES.map((f, i) => (
        <div key={f.p} style={{position: 'absolute', left: (i % 2) * (cw + g), top: Math.floor(i / 2) * (ch + g), width: cw, height: ch, overflow: 'hidden'}}>
          <Photo p={f.p} pos={f.pos} />
        </div>
      ))}
      <Grain />
      <div style={{position: 'absolute', left: 0, right: 0, top: H / 2 - 74, display: 'flex', justifyContent: 'center'}}>
        <Sticker lines={['Aucune de ces personnes', 'n’existe.']} size={56} align="center" style={{position: 'relative'}} />
      </div>
      <Shade h={200} o={0.55} />
      <Brand />
    </Post>
  );
};

// 09 — note iPhone : la to-do d'une pub Meta
const TODO = ['Trouver une actrice', 'Louer un studio', 'Tourner (2 jours)', 'Monter, sous-titrer', 'Payer l’agence 3 000 €'];
export const Crea09: React.FC = () => (
  <Post bg="#FBFAF6">
    <div style={{position: 'absolute', left: M, right: M, top: 70, display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: FONT, color: '#D9A400', fontSize: 34, fontWeight: 600}}>
      <span>‹ Notes</span>
      <span style={{display: 'flex', gap: 34}}>
        <span>⋯</span>
        <span>OK</span>
      </span>
    </div>
    <div style={{position: 'absolute', left: M, right: M, top: 190, fontFamily: FONT}}>
      <div style={{fontSize: 24, color: '#9A968C', fontWeight: 600}}>Aujourd’hui à 09:41</div>
      <div style={{fontSize: 76, fontWeight: 800, color: '#1C1C1E', marginTop: 14, letterSpacing: '-0.02em'}}>Pub Meta — à faire</div>
      <div style={{marginTop: 34}}>
        {TODO.map((t) => (
          <div key={t} style={{display: 'flex', alignItems: 'center', gap: 22, padding: '22px 0'}}>
            <div style={{width: 46, height: 46, borderRadius: 23, background: '#D9A400', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                <path d="M5 12.5l4.5 4.5L19 7.5" stroke="#fff" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span style={{fontSize: 50, color: '#A7A39A', textDecoration: 'line-through', textDecorationThickness: 3}}>{t}</span>
          </div>
        ))}
        <div style={{display: 'flex', alignItems: 'center', gap: 22, padding: '34px 0 0'}}>
          <div style={{width: 46, height: 46, borderRadius: 23, border: '3px solid #C7C3B8', flexShrink: 0}} />
          <span style={{fontSize: 50, color: '#1C1C1E', fontWeight: 800, lineHeight: 1.2}}>
            Ou : écrire une phrase sur <span style={{backgroundImage: GRAD, WebkitBackgroundClip: 'text', color: 'transparent'}}>Growthity</span>
          </span>
        </div>
      </div>
    </div>
    <Brand dark />
  </Post>
);

// 10 — sneakers : votre produit en action
export const Crea10: React.FC = () => (
  <Post>
    <Photo p="sneakers.jpg" pos="50% 70%" />
    <Grain />
    <Shade from="top" h={560} o={0.7} />
    <Shade h={260} o={0.5} />
    <div style={{position: 'absolute', left: M, right: M, top: 84}}>
      <Big size={100}>
        Votre produit
        <br />
        en action.
      </Big>
      <Sub style={{marginTop: 18, fontWeight: 700}}>Sans studio. Sans tournage. Juste une phrase.</Sub>
    </div>
    <Brand />
  </Post>
);

export const CREAS: {id: string; C: React.FC; w: number; h: number}[] = [Crea01, Crea02, Crea03, Crea04, Crea05, Crea06, Crea07, Crea08, Crea09, Crea10].map((c, i) => ({
  id: `Crea${String(i + 1).padStart(2, '0')}`,
  C: c,
  w: W,
  h: H,
}));
