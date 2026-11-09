import React, {useEffect, useState} from 'react';
import {AbsoluteFill, continueRender, delayRender, Img, staticFile} from 'remotion';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/inter/800.css';
import '@fontsource/space-grotesk/500.css';
import '@fontsource/space-grotesk/600.css';
import '@fontsource/space-grotesk/700.css';
import {LogoMark} from '../components/UI';
import {C, DISPLAY, FONT, GRAD} from '../theme';

// Organic Instagram feed posts (4:5, 1080×1350): carousels, behind-the-scenes, tips.
// Editorial look (warm paper, dark ink), discreet handle instead of a logo + CTA block.
// Rule: one actor appears at most once per post (carousel = one post).

const W = 1080;
const H = 1350;
const M = 80;
const PAPER = '#F4F1EA';
const INK = '#16141A';
const MUTED = '#6E6A73';
const LINE = '#E2DDD2';
const ACCENT = C.indigo;
const ig = (p: string) => staticFile(`media/ig/${p}`);

const useFonts = () => {
  const [h] = useState(() => delayRender('fonts'));
  useEffect(() => {
    const specs = ['400 20px Inter', '500 20px Inter', '600 20px Inter', '700 20px Inter', '800 20px Inter', '500 20px "Space Grotesk"', '600 20px "Space Grotesk"', '700 20px "Space Grotesk"'];
    Promise.all(specs.map((s) => document.fonts.load(s))).then(() => continueRender(h));
  }, [h]);
};

const Grain: React.FC<{o?: number}> = ({o = 0.06}) => (
  <svg width="100%" height="100%" style={{position: 'absolute', inset: 0, opacity: o, mixBlendMode: 'overlay', pointerEvents: 'none'}}>
    <filter id="g">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
      <feColorMatrix type="saturate" values="0" />
    </filter>
    <rect width="100%" height="100%" filter="url(#g)" />
  </svg>
);

// ---------- frame ----------
type SlideProps = {n?: number; of?: number; dark?: boolean; bg?: string; handle?: boolean; swipe?: boolean; children: React.ReactNode};
const Slide: React.FC<SlideProps> = ({n, of, dark = false, bg, handle = false, swipe = false, children}) => {
  useFonts();
  const fg = dark ? 'rgba(255,255,255,0.85)' : MUTED;
  return (
    <AbsoluteFill style={{background: bg ?? (dark ? INK : PAPER), overflow: 'hidden', fontFamily: FONT, color: dark ? '#fff' : INK}}>
      {children}
      {n !== undefined && of !== undefined && (
        <div style={{position: 'absolute', right: M - 8, top: 56, fontFamily: DISPLAY, fontWeight: 600, fontSize: 26, color: fg, padding: '8px 18px', borderRadius: 999, border: `2px solid ${dark ? 'rgba(255,255,255,0.3)' : LINE}`, background: dark ? 'rgba(0,0,0,0.25)' : 'rgba(255,255,255,0.5)'}}>
          {n}/{of}
        </div>
      )}
      {handle && <Handle dark={dark} />}
      {swipe && (
        <div style={{position: 'absolute', right: M, bottom: 62, display: 'flex', alignItems: 'center', gap: 12, fontWeight: 700, fontSize: 28, color: dark ? '#fff' : INK}}>
          Glissez
          <svg width="40" height="24" viewBox="0 0 40 24" fill="none">
            <path d="M2 12h34M26 3l10 9-10 9" stroke={dark ? '#fff' : INK} strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      )}
    </AbsoluteFill>
  );
};

// discreet signature — small mark + handle, no CTA
const Handle: React.FC<{dark?: boolean}> = ({dark}) => (
  <div style={{position: 'absolute', left: M, bottom: 62, display: 'flex', alignItems: 'center', gap: 10, opacity: 0.8}}>
    <LogoMark size={30} color={dark ? '#fff' : undefined} />
    <span style={{fontFamily: DISPLAY, fontWeight: 600, fontSize: 26, color: dark ? '#fff' : INK}}>growthity.ai</span>
  </div>
);

const Kicker: React.FC<{children: React.ReactNode; color?: string; style?: React.CSSProperties}> = ({children, color = ACCENT, style}) => (
  <div style={{fontFamily: DISPLAY, fontWeight: 600, fontSize: 28, letterSpacing: '0.08em', textTransform: 'uppercase', color, ...style}}>{children}</div>
);

const Title: React.FC<{children: React.ReactNode; size?: number; style?: React.CSSProperties}> = ({children, size = 96, style}) => (
  <div style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: size, lineHeight: 1.0, letterSpacing: '-0.035em', ...style}}>{children}</div>
);

const Body: React.FC<{children: React.ReactNode; size?: number; style?: React.CSSProperties}> = ({children, size = 36, style}) => (
  <div style={{fontWeight: 500, fontSize: size, lineHeight: 1.38, color: MUTED, ...style}}>{children}</div>
);

const Mark: React.FC<{children: React.ReactNode}> = ({children}) => (
  <span style={{backgroundImage: 'linear-gradient(180deg, transparent 58%, rgba(147,51,234,0.22) 58%)', padding: '0 4px'}}>{children}</span>
);

const Photo: React.FC<{p: string; pos?: string; style?: React.CSSProperties; radius?: number}> = ({p, pos = 'center', style, radius = 36}) => (
  <div style={{position: 'absolute', overflow: 'hidden', borderRadius: radius, ...style}}>
    <Img src={ig(p)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: pos}} />
    <Grain />
  </div>
);

// Growthity prompt field (static)
const Prompt: React.FC<{text: string; style?: React.CSSProperties; size?: number}> = ({text, style, size = 40}) => (
  <div style={{position: 'absolute', background: '#fff', borderRadius: 34, padding: '34px 38px 30px', boxShadow: '0 40px 80px -40px rgba(30,20,80,0.35), 0 0 0 2px #EAE6F7', ...style}}>
    <div style={{display: 'flex', alignItems: 'center', gap: 12, fontSize: 24, fontWeight: 600, color: MUTED}}>
      <LogoMark size={26} /> Décrivez votre pub
    </div>
    <div style={{fontSize: size, fontWeight: 600, lineHeight: 1.32, color: INK, marginTop: 18, letterSpacing: '-0.01em'}}>
      {text.split(' ').slice(0, -1).join(' ')}{' '}
      <span style={{whiteSpace: 'nowrap'}}>
        {text.split(' ').slice(-1)[0]}
        <span style={{display: 'inline-block', width: 4, height: size * 0.95, background: ACCENT, marginLeft: 6, verticalAlign: 'text-bottom'}} />
      </span>
    </div>
    <div style={{display: 'flex', justifyContent: 'flex-end', marginTop: 26}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 10, height: 64, padding: '0 30px', borderRadius: 999, backgroundImage: GRAD, color: '#fff', fontWeight: 700, fontSize: 26}}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M12 2l2.2 6.6L21 11l-6.8 2.4L12 20l-2.2-6.6L3 11l6.8-2.4z" fill="#fff" />
        </svg>
        Générer
      </div>
    </div>
  </div>
);

// phone showing a generated video frame
const Phone: React.FC<{p: string; pos?: string; x: number; y: number; w: number; tag?: string}> = ({p, pos = 'center', x, y, w, tag = 'Vidéo générée'}) => {
  const h = w * (16 / 9);
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w + 24, height: h + 24, borderRadius: 64, background: '#0B0A0C', padding: 12, boxShadow: '0 60px 100px -50px rgba(0,0,0,0.6)'}}>
      <div style={{position: 'relative', width: w, height: h, borderRadius: 52, overflow: 'hidden'}}>
        <Img src={ig(p)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: pos}} />
        <Grain />
        <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 180, background: 'linear-gradient(180deg, rgba(0,0,0,0.45), transparent)'}} />
        <div style={{position: 'absolute', left: 26, top: 30, display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 999, background: 'rgba(255,255,255,0.92)', fontSize: 22, fontWeight: 700, color: INK}}>
          <div style={{width: 10, height: 10, borderRadius: 5, background: C.success}} /> {tag}
        </div>
        <div style={{position: 'absolute', right: 26, bottom: 26, width: 84, height: 84, borderRadius: 42, background: 'rgba(255,255,255,0.28)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <svg width="36" height="36" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" fill="#fff" />
          </svg>
        </div>
      </div>
    </div>
  );
};

const Pill: React.FC<{children: React.ReactNode; dark?: boolean; style?: React.CSSProperties}> = ({children, dark, style}) => (
  <span style={{display: 'inline-flex', alignItems: 'center', height: 54, padding: '0 24px', borderRadius: 999, background: dark ? INK : '#fff', color: dark ? '#fff' : INK, fontWeight: 700, fontSize: 26, border: dark ? 'none' : `2px solid ${LINE}`, ...style}}>{children}</span>
);

// =====================================================================
// POST 1 — Carrousel « 5 accroches à copier » (7 slides)
// =====================================================================
const HOOKS = [
  {p: 'sarah.jpg', pos: '50% 28%', hook: '« Personne ne parle de ce détail… »', why: 'La curiosité : on reste pour connaître la suite.'},
  {p: 'lila.jpg', pos: '50% 26%', hook: '« Arrêtez d’éclairer des bureaux vides. »', why: 'L’interpellation : vous nommez un problème que votre client connaît.'},
  {p: 'bougie.jpg', pos: '50% 40%', hook: '« POV : votre salon, un dimanche soir. »', why: 'La projection : on se voit déjà avec le produit.'},
  {p: 'alice.jpg', pos: '50% 34%', hook: '« Je n’avais pas la place pour un bureau. Alors… »', why: 'La mini-histoire : un avant, et l’envie de voir l’après.'},
  {p: 'porte-savon.jpg', pos: '50% 26%', hook: '« Je ne savais pas que j’en avais besoin. »', why: 'La réaction : la surprise se lit sur le visage avant les mots.'},
];
const P1N = 7;
const P1Cover: React.FC = () => (
  <Slide n={1} of={P1N} handle swipe>
    <div style={{position: 'absolute', left: M, right: M, top: 200}}>
      <Kicker>Pubs vidéo · Meta</Kicker>
      <Title size={128} style={{marginTop: 30}}>
        5 accroches
        <br />à copier
        <br />
        <span style={{color: ACCENT}}>dès demain.</span>
      </Title>
      <Body size={40} style={{marginTop: 46, maxWidth: 820}}>
        Sur Reels et Stories, les <b style={{color: INK}}>deux premières secondes</b> décident si l’on regarde votre pub… ou si l’on fait défiler.
      </Body>
    </div>
  </Slide>
);
const P1Hook: React.FC<{i: number}> = ({i}) => {
  const h = HOOKS[i];
  return (
    <Slide n={i + 2} of={P1N}>
      <Photo p={h.p} pos={h.pos} style={{left: M, right: M, top: 140, height: 850}} />
      <div style={{position: 'absolute', left: M + 30, top: 172, fontFamily: DISPLAY, fontWeight: 700, fontSize: 30, color: INK, background: '#fff', borderRadius: 999, padding: '8px 22px'}}>
        Accroche {String(i + 1).padStart(2, '0')}
      </div>
      <div style={{position: 'absolute', left: M, right: M, top: 1030}}>
        <Title size={h.hook.length > 40 ? 58 : 64} style={{lineHeight: 1.06}}>
          {h.hook}
        </Title>
        <Body size={32} style={{marginTop: 22}}>{h.why}</Body>
      </div>
    </Slide>
  );
};
const P1End: React.FC = () => (
  <Slide n={7} of={P1N} dark handle>
    <div style={{position: 'absolute', left: M, right: M, top: 150}}>
      <Kicker color="#B9A8FF">À garder sous la main</Kicker>
      <div style={{marginTop: 40}}>
        {HOOKS.map((h, i) => (
          <div key={i} style={{display: 'flex', gap: 28, padding: '26px 0', borderTop: i ? '2px solid rgba(255,255,255,0.12)' : 'none'}}>
            <span style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 36, color: '#B9A8FF', width: 56}}>{String(i + 1).padStart(2, '0')}</span>
            <span style={{fontWeight: 600, fontSize: 36, lineHeight: 1.3, color: '#fff'}}>{['La curiosité', 'L’interpellation', 'La projection', 'La mini-histoire', 'La réaction'][i]}</span>
          </div>
        ))}
      </div>
      <Title size={60} style={{marginTop: 50, color: '#fff'}}>
        Enregistrez ce post
        <br />
        pour votre prochaine pub.
      </Title>
    </div>
  </Slide>
);

// =====================================================================
// POST 2 — Carrousel coulisses « La phrase → la vidéo » (bijoux, 6 slides)
// =====================================================================
const P2N = 6;
const P2_PROMPT = 'Bracelet trèfle noir et doré, porté au quotidien. Gros plans au poignet, lumière naturelle du matin.';
const P2Cover: React.FC = () => (
  <Slide n={1} of={P2N} handle swipe>
    <div style={{position: 'absolute', left: M, right: M, top: 200}}>
      <Kicker>Coulisses</Kicker>
      <Title size={118} style={{marginTop: 30}}>
        Ce que j’ai tapé.
        <br />
        <span style={{color: ACCENT}}>Ce que j’ai obtenu.</span>
      </Title>
      <Body size={40} style={{marginTop: 46, maxWidth: 840}}>
        Une pub vidéo pour un bracelet, de la phrase à la vidéo finale. Étape par étape.
      </Body>
    </div>
  </Slide>
);
const P2Photo: React.FC = () => (
  <Slide n={2} of={P2N}>
    <div style={{position: 'absolute', left: M, right: M, top: 150}}>
      <Kicker>Étape 1 · Le point de départ</Kicker>
      <Title size={76} style={{marginTop: 24}}>Une simple photo produit.</Title>
    </div>
    <div style={{position: 'absolute', left: M, right: M, top: 380, height: 660, background: '#fff', borderRadius: 36, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 30px 60px -40px rgba(0,0,0,0.3)'}}>
      <Img src={ig('trefle-packshot.jpg')} style={{width: '96%', objectFit: 'contain'}} />
    </div>
    <Body size={36} style={{position: 'absolute', left: M, right: M, top: 1095}}>
      Pas de mannequin, pas de mise en scène. Juste le bijou sur fond blanc.
    </Body>
  </Slide>
);
const P2Prompt: React.FC = () => (
  <Slide n={3} of={P2N}>
    <div style={{position: 'absolute', left: M, right: M, top: 150}}>
      <Kicker>Étape 2 · La phrase</Kicker>
      <Title size={76} style={{marginTop: 24}}>Ce que j’ai écrit dans Growthity :</Title>
    </div>
    <Prompt text={P2_PROMPT} size={54} style={{left: M, right: M, top: 420}} />
    <Body size={38} style={{position: 'absolute', left: M, right: M, top: 1080}}>
      Le produit, la personne, la situation. <b style={{color: INK}}>Rien de plus.</b>
    </Body>
  </Slide>
);
const SCRIPT = [
  {k: 'Accroche', t: '« Le bracelet que tout le monde me demande. »'},
  {k: 'Démonstration', t: 'Gros plan au poignet, en lumière naturelle.'},
  {k: 'Ressenti', t: '« Je le mets le matin, je l’oublie jusqu’au soir. »'},
  {k: 'Appel à l’action', t: '« Le lien est juste en dessous. »'},
];
const P2Script: React.FC = () => (
  <Slide n={4} of={P2N}>
    <div style={{position: 'absolute', left: M, right: M, top: 150}}>
      <Kicker>Étape 3 · Le script</Kicker>
      <Title size={76} style={{marginTop: 24}}>Growthity écrit la structure de la vidéo.</Title>
    </div>
    <div style={{position: 'absolute', left: M, right: M, top: 430, background: '#fff', borderRadius: 34, padding: '20px 40px', boxShadow: '0 30px 60px -40px rgba(0,0,0,0.3)'}}>
      {SCRIPT.map((s, i) => (
        <div key={s.k} style={{display: 'flex', gap: 26, padding: '36px 0', borderTop: i ? `2px solid ${LINE}` : 'none'}}>
          <div style={{width: 16, borderRadius: 8, backgroundImage: GRAD, flexShrink: 0, opacity: 0.4 + i * 0.2}} />
          <div>
            <div style={{fontFamily: DISPLAY, fontWeight: 600, fontSize: 24, letterSpacing: '0.06em', textTransform: 'uppercase', color: ACCENT}}>{s.k}</div>
            <div style={{fontWeight: 600, fontSize: 38, lineHeight: 1.3, marginTop: 8}}>{s.t}</div>
          </div>
        </div>
      ))}
    </div>
  </Slide>
);
const P2Video: React.FC = () => (
  <Slide n={5} of={P2N}>
    <div style={{position: 'absolute', left: M, top: 150, width: 420}}>
      <Kicker>Étape 4 · La vidéo</Kicker>
      <Title size={72} style={{marginTop: 24}}>Le bracelet, porté, en situation.</Title>
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 14, marginTop: 44}}>
        <Pill>9:16 · Reels & Stories</Pill>
        <Pill>Sous-titres inclus</Pill>
        <Pill>Prête à publier</Pill>
      </div>
    </div>
    <Phone p="lou-poignet.jpg" pos="50% 50%" x={540} y={150} w={440} />
  </Slide>
);
const P2End: React.FC = () => (
  <Slide n={6} of={P2N} dark handle>
    <div style={{position: 'absolute', left: M, right: M, top: 250}}>
      <Title size={104} style={{color: '#fff'}}>
        Une phrase.
        <br />
        <span style={{color: 'rgba(255,255,255,0.45)'}}>Pas de shooting.</span>
        <br />
        <span style={{color: 'rgba(255,255,255,0.45)'}}>Pas de tournage.</span>
      </Title>
      <div style={{marginTop: 90, padding: '34px 38px', borderRadius: 30, background: 'rgba(255,255,255,0.08)', border: '2px solid rgba(255,255,255,0.14)'}}>
        <div style={{fontWeight: 600, fontSize: 38, lineHeight: 1.35, color: '#fff'}}>Et vous, quelle phrase taperiez-vous pour votre produit ?</div>
        <div style={{fontWeight: 500, fontSize: 30, color: 'rgba(255,255,255,0.65)', marginTop: 12}}>Dites-le en commentaire.</div>
      </div>
    </div>
  </Slide>
);

// =====================================================================
// POST 3 — Carrousel « 3 phrases, 3 pubs » (7 slides)
// =====================================================================
const P3N = 7;
const PAIRS = [
  {niche: 'Studio de jardin', prompt: 'Studios de jardin en bois sur mesure. Un propriétaire présente le sien, devant sa maison.', p: 'lucas.jpg', pos: '50% 38%'},
  {niche: 'Restauration', prompt: 'Pâtes fraîches artisanales, livrées aux restaurants de Lyon. L’artisane montre sa production du jour.', p: 'pates.jpg', pos: '50% 40%'},
  {niche: 'E-commerce', prompt: 'Sneakers grises en maille. Plans rapprochés, portées en ville.', p: 'sneakers.jpg', pos: '50% 62%'},
];
const P3Cover: React.FC = () => (
  <Slide n={1} of={P3N} handle swipe>
    <div style={{position: 'absolute', left: M, right: M, top: 200}}>
      <Kicker>Coulisses</Kicker>
      <Title size={150} style={{marginTop: 30}}>
        3 phrases.
        <br />
        <span style={{color: ACCENT}}>3 pubs.</span>
      </Title>
      <Body size={40} style={{marginTop: 46, maxWidth: 820}}>
        Trois métiers différents. À chaque fois, la phrase tapée dans Growthity… puis la vidéo obtenue.
      </Body>
    </div>
  </Slide>
);
const P3Prompt: React.FC<{i: number}> = ({i}) => {
  const x = PAIRS[i];
  return (
    <Slide n={2 + i * 2} of={P3N} swipe>
      <div style={{position: 'absolute', left: M, right: M, top: 150}}>
        <Kicker>{`${i + 1}/3 · ${x.niche}`}</Kicker>
        <Title size={80} style={{marginTop: 24}}>La phrase :</Title>
      </div>
      <Prompt text={x.prompt} size={56} style={{left: M, right: M, top: 380}} />
      <div style={{position: 'absolute', left: M, right: M, top: 930}}>
        <div style={{fontWeight: 600, fontSize: 30, color: MUTED}}>Growthity s’occupe du reste :</div>
        <div style={{display: 'flex', flexWrap: 'wrap', gap: 14, marginTop: 20}}>
          {['Script', 'Acteur', 'Voix', 'Sous-titres', 'Format 9:16'].map((c) => (
            <Pill key={c}>{c}</Pill>
          ))}
        </div>
      </div>
      <Body size={34} style={{position: 'absolute', left: M, right: 300, bottom: 62}}>
        Le résultat, juste après →
      </Body>
    </Slide>
  );
};
const P3Video: React.FC<{i: number}> = ({i}) => {
  const x = PAIRS[i];
  return (
    <Slide n={3 + i * 2} of={P3N} bg="#000">
      <div style={{position: 'absolute', inset: 0}}>
        <Img src={ig(x.p)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: x.pos}} />
        <Grain />
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 380, background: 'linear-gradient(0deg, rgba(0,0,0,0.75), transparent)'}} />
      <div style={{position: 'absolute', left: M, top: 56, display: 'flex', alignItems: 'center', gap: 10, padding: '10px 20px', borderRadius: 999, background: 'rgba(255,255,255,0.92)', fontSize: 26, fontWeight: 700, color: INK}}>
        <div style={{width: 12, height: 12, borderRadius: 6, background: C.success}} /> La vidéo obtenue
      </div>
      <div style={{position: 'absolute', left: M, right: M, bottom: 90, fontFamily: DISPLAY, fontWeight: 700, fontSize: 56, color: '#fff', letterSpacing: '-0.02em'}}>{x.niche}</div>
    </Slide>
  );
};

// =====================================================================
// POST 4 — Carrousel « 6 conseils pour vos pubs vidéo Meta » (7 slides)
// =====================================================================
const TIPS = [
  {t: 'Accrochez dès la première seconde.', d: 'Une phrase qui interpelle, un visage, un geste. Pas de logo en ouverture.', p: 'caroline.jpg', pos: '50% 26%'},
  {t: 'Sous-titrez tout.', d: 'Une grande partie des vidéos est regardée sans le son. Le message doit passer quand même.', p: 'lila.jpg', pos: '50% 26%'},
  {t: 'Tournez en vertical (9:16).', d: 'Reels et Stories occupent tout l’écran : votre pub aussi.', p: 'etudiant.jpg', pos: '50% 30%'},
  {t: 'Montrez le produit porté, utilisé, en main.', d: 'Un produit en situation se comprend en un coup d’œil.', p: 'lou-poignet.jpg', pos: '50% 55%'},
  {t: 'Un seul message par vidéo.', d: 'Un bénéfice, une émotion, une action. Le reste attendra la pub suivante.', p: 'bougie.jpg', pos: '50% 42%'},
  {t: 'Testez plusieurs accroches.', d: 'Même vidéo, trois débuts différents : laissez Meta trouver celle qui retient le plus.', p: 'sarah.jpg', pos: '50% 28%'},
];
const P4N = 7;
const P4Cover: React.FC = () => (
  <Slide n={1} of={P4N} handle swipe>
    <div style={{position: 'absolute', left: M, right: M, top: 200}}>
      <Kicker>Pubs Meta · Les bases</Kicker>
      <Title size={124} style={{marginTop: 30}}>
        6 conseils pour des pubs vidéo
        <br />
        <span style={{color: ACCENT}}>qu’on regarde.</span>
      </Title>
      <Body size={40} style={{marginTop: 46, maxWidth: 820}}>
        Ce qu’on applique à chaque vidéo générée sur Growthity.
      </Body>
    </div>
  </Slide>
);
const P4Tip: React.FC<{i: number}> = ({i}) => {
  const t = TIPS[i];
  return (
    <Slide n={i + 2} of={P4N}>
      <div style={{position: 'absolute', left: M, right: M, top: 140, display: 'flex', alignItems: 'flex-start', gap: 30}}>
        <div style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 150, lineHeight: 0.8, letterSpacing: '-0.05em', backgroundImage: GRAD, WebkitBackgroundClip: 'text', color: 'transparent'}}>{i + 1}</div>
      </div>
      <div style={{position: 'absolute', left: M, right: M, top: 290}}>
        <Title size={t.t.length > 30 ? 64 : 72} style={{lineHeight: 1.04}}>{t.t}</Title>
        <Body size={33} style={{marginTop: 20}}>{t.d}</Body>
      </div>
      {i === 5 ? (
        <div style={{position: 'absolute', left: M, right: M, top: 640, height: 630, display: 'flex', gap: 16}}>
          {['A', 'B', 'C'].map((k, j) => (
            <div key={k} style={{position: 'relative', flex: 1, borderRadius: 30, overflow: 'hidden'}}>
              <Img src={ig(t.p)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: t.pos}} />
              <Grain />
              <div style={{position: 'absolute', left: 14, right: 14, top: 18, background: '#fff', borderRadius: 16, padding: '12px 14px', fontSize: 25, fontWeight: 700, lineHeight: 1.25, color: INK}}>
                <span style={{color: ACCENT}}>{k} · </span>
                {['« Personne n’en parle… »', '« On me le demande tout le temps. »', '« POV : vous l’offrez. »'][j]}
              </div>
            </div>
          ))}
        </div>
      ) : i === 2 ? (
        <Phone p={t.p} pos={t.pos} x={(W - 330 - 24) / 2} y={640} w={330} tag="9:16" />
      ) : (
        <Photo p={t.p} pos={t.pos} style={{left: M, right: M, top: 640, height: 630}} />
      )}
    </Slide>
  );
};

// =====================================================================
// POST 5 — Anatomie d'une pub UGC (image unique)
// =====================================================================
const ANAT = [
  {k: '0–2 s', t: 'L’accroche', d: 'Un regard caméra, une phrase qui interpelle.'},
  {k: 'Milieu', t: 'La démonstration', d: 'Le produit en situation, ici le studio derrière elle.'},
  {k: 'Le ton', t: 'Le ressenti', d: 'Un détail concret et sincère, comme le dirait une cliente.'},
  {k: 'Fin', t: 'Une seule action', d: 'Découvrir, réserver, commander : une seule.'},
];
const P5: React.FC = () => (
  <Slide handle>
    <div style={{position: 'absolute', left: M, right: M, top: 90}}>
      <Kicker>Décryptage</Kicker>
      <Title size={76} style={{marginTop: 18}}>Anatomie d’une pub UGC</Title>
    </div>
    <Phone p="alice.jpg" pos="50% 34%" x={M - 6} y={300} w={430} tag="Pub UGC" />
    <div style={{position: 'absolute', left: 580, right: M, top: 300, display: 'flex', flexDirection: 'column', gap: 22}}>
      {ANAT.map((a, i) => (
        <div key={i} style={{background: '#fff', borderRadius: 26, padding: '22px 26px', boxShadow: '0 20px 40px -30px rgba(0,0,0,0.35)'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
            <span style={{width: 40, height: 40, borderRadius: 20, backgroundImage: GRAD, color: '#fff', fontFamily: DISPLAY, fontWeight: 700, fontSize: 22, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{i + 1}</span>
            <span style={{fontFamily: DISPLAY, fontWeight: 600, fontSize: 20, letterSpacing: '0.06em', textTransform: 'uppercase', color: ACCENT}}>{a.k}</span>
          </div>
          <div style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 34, marginTop: 10, letterSpacing: '-0.02em'}}>{a.t}</div>
          <div style={{fontWeight: 500, fontSize: 24, lineHeight: 1.35, color: MUTED, marginTop: 4}}>{a.d}</div>
        </div>
      ))}
    </div>
  </Slide>
);

// =====================================================================
// POST 6 — Citation / note (image unique, texte)
// =====================================================================
const P6: React.FC = () => (
  <Slide bg="#EDE8FF">
    <div style={{position: 'absolute', left: M, right: M, top: 150, display: 'flex', alignItems: 'center', gap: 20}}>
      <div style={{width: 84, height: 84, borderRadius: 42, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <LogoMark size={48} />
      </div>
      <div>
        <div style={{fontWeight: 800, fontSize: 32}}>Growthity</div>
        <div style={{fontWeight: 500, fontSize: 26, color: MUTED}}>@growthity.ai</div>
      </div>
    </div>
    <div style={{position: 'absolute', left: M, right: M, top: 350}}>
      <Title size={90} style={{lineHeight: 1.08, letterSpacing: '-0.03em'}}>
        Une bonne pub Meta ne commence pas par un tournage.
      </Title>
      <Title size={90} style={{lineHeight: 1.08, marginTop: 40, color: ACCENT}}>
        Elle commence par une bonne phrase.
      </Title>
    </div>
    <div style={{position: 'absolute', left: M, right: M, bottom: 110, fontWeight: 500, fontSize: 30, color: MUTED}}>
      Le produit · la personne · la situation. Le reste suit.
    </div>
  </Slide>
);

// =====================================================================
// POST 7 — Coulisses en une image : tapé / obtenu (bougie)
// =====================================================================
const P7: React.FC = () => (
  <Slide handle>
    <div style={{position: 'absolute', left: M, top: 90}}>
      <Kicker>Tapé dans Growthity</Kicker>
    </div>
    <Prompt text="Bougie parfumée au bois de santal. Une femme l’allume un soir d’hiver, ambiance cosy." size={38} style={{left: M, right: M, top: 150}} />
    <div style={{position: 'absolute', left: M, top: 560}}>
      <Kicker>Obtenu</Kicker>
    </div>
    <Photo p="bougie.jpg" pos="50% 44%" style={{left: M, right: M, top: 620, height: 600}} />
    <div style={{position: 'absolute', left: M + 26, top: 646, display: 'flex', alignItems: 'center', gap: 10, padding: '8px 18px', borderRadius: 999, background: 'rgba(255,255,255,0.92)', fontSize: 24, fontWeight: 700}}>
      <div style={{width: 10, height: 10, borderRadius: 5, background: C.success}} /> Vidéo générée
    </div>
  </Slide>
);

// ---------- registry ----------
export const ORGANIC: {id: string; C: React.FC; w: number; h: number; file: string}[] = [];
const add = (post: string, slides: React.FC[]) =>
  slides.forEach((S, i) => ORGANIC.push({id: `Org${post}S${i + 1}`, C: S, w: W, h: H, file: slides.length > 1 ? `${post}/slide-${i + 1}` : `${post}`}));

const bind = <P,>(Comp: React.FC<P>, props: P): React.FC => () => <Comp {...(props as P & React.JSX.IntrinsicAttributes)} />;

add('post-01-accroches', [P1Cover, ...HOOKS.map((_, i) => bind(P1Hook, {i})), P1End]);
add('post-02-coulisses-bijou', [P2Cover, P2Photo, P2Prompt, P2Script, P2Video, P2End]);
add('post-03-3-phrases-3-pubs', [P3Cover, bind(P3Prompt, {i: 0}), bind(P3Video, {i: 0}), bind(P3Prompt, {i: 1}), bind(P3Video, {i: 1}), bind(P3Prompt, {i: 2}), bind(P3Video, {i: 2})]);
add('post-04-6-conseils', [P4Cover, ...TIPS.map((_, i) => bind(P4Tip, {i}))]);
add('post-05-anatomie-ugc', [P5]);
add('post-06-citation', [P6]);
add('post-07-tape-obtenu', [P7]);
