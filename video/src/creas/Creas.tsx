import React, {useEffect, useState} from 'react';
import {AbsoluteFill, continueRender, delayRender, Img, staticFile} from 'remotion';
import '@fontsource/inter/400.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/inter/800.css';
import '@fontsource/space-grotesk/600.css';
import '@fontsource/space-grotesk/700.css';
import {LogoMark, MetaLogo, Wordmark} from '../components/UI';
import {C, DISPLAY, FONT, GRAD, GRAD_PINK} from '../theme';

// 10 social creatives promoting Growthity — every one uses different real media from the account.

const STUDIO = '#0B0A0C';
const g = (grad = GRAD_PINK): React.CSSProperties => ({backgroundImage: grad, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent'});
const src = (p: string) => staticFile(`media/${p}`);

const useFonts = () => {
  const [h] = useState(() => delayRender('fonts'));
  useEffect(() => {
    const specs = ['400 20px Inter', '600 20px Inter', '700 20px Inter', '800 20px Inter', '600 20px "Space Grotesk"', '700 20px "Space Grotesk"'];
    Promise.all(specs.map((s) => document.fonts.load(s))).then(() => continueRender(h));
  }, [h]);
};

const Dark: React.FC<{children: React.ReactNode; glow?: string}> = ({children, glow = 'rgba(91,63,228,0.55)'}) => (
  <AbsoluteFill style={{background: `linear-gradient(180deg,#120E1C 0%,${STUDIO} 55%,#07060A 100%)`, overflow: 'hidden'}}>
    <div style={{position: 'absolute', left: -300, top: -350, width: 1200, height: 1100, borderRadius: '50%', background: `radial-gradient(circle, ${glow} 0%, transparent 62%)`, filter: 'blur(20px)'}} />
    <div style={{position: 'absolute', right: -380, bottom: -300, width: 1100, height: 1000, borderRadius: '50%', background: 'radial-gradient(circle, rgba(224,71,158,0.28) 0%, transparent 62%)', filter: 'blur(20px)'}} />
    <AbsoluteFill style={{backgroundImage: 'radial-gradient(rgba(255,255,255,0.5) 1.2px, transparent 1.2px)', backgroundSize: '30px 30px', opacity: 0.08}} />
    {children}
  </AbsoluteFill>
);

const Light: React.FC<{children: React.ReactNode}> = ({children}) => (
  <AbsoluteFill style={{background: 'linear-gradient(180deg,#FFFFFF 0%,#F2F3FA 100%)', overflow: 'hidden'}}>
    <div style={{position: 'absolute', left: -200, top: -400, width: 1400, height: 1100, borderRadius: '50%', background: 'radial-gradient(circle, rgba(101,82,232,0.22) 0%, transparent 62%)'}} />
    <div style={{position: 'absolute', right: -400, bottom: -300, width: 1000, height: 900, borderRadius: '50%', background: 'radial-gradient(circle, rgba(224,71,158,0.12) 0%, transparent 62%)'}} />
    <AbsoluteFill style={{backgroundImage: 'radial-gradient(rgba(15,23,42,0.35) 1.2px, transparent 1.2px)', backgroundSize: '30px 30px', opacity: 0.25}} />
    {children}
  </AbsoluteFill>
);

const Photo: React.FC<{p: string; w: number; h: number; r?: number; pos?: string; style?: React.CSSProperties; children?: React.ReactNode}> = ({p, w, h, r = 28, pos = 'center', style, children}) => (
  <div style={{position: 'relative', width: w, height: h, borderRadius: r, overflow: 'hidden', flexShrink: 0, boxShadow: '0 40px 90px -40px rgba(10,6,30,0.8)', background: '#111', ...style}}>
    <Img src={src(p)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: pos, display: 'block'}} />
    {children}
  </div>
);

const PhoneF: React.FC<{p: string; w: number; style?: React.CSSProperties; children?: React.ReactNode; pos?: string}> = ({p, w, style, children, pos}) => {
  const h = Math.round(((w - 24) * 16) / 9) + 24;
  return (
    <div style={{width: w, height: h, borderRadius: w * 0.1, padding: 12, background: '#0B0A0C', boxShadow: '0 60px 120px -40px rgba(37,22,120,0.8), 0 0 0 2px rgba(255,255,255,0.1)', flexShrink: 0, ...style}}>
      <Photo p={p} w={w - 24} h={h - 24} r={w * 0.08} pos={pos} style={{boxShadow: 'none'}}>
        {children}
      </Photo>
    </div>
  );
};

const Chip: React.FC<{children: React.ReactNode; tone?: 'light' | 'dark' | 'green' | 'grad' | 'red'; size?: number; style?: React.CSSProperties}> = ({children, tone = 'light', size = 26, style}) => {
  const t = {light: ['#fff', C.ink], dark: ['rgba(11,10,12,0.75)', '#fff'], green: [C.success, '#fff'], grad: [GRAD, '#fff'], red: ['#E5484D', '#fff']}[tone];
  return (
    <div style={{display: 'inline-flex', alignItems: 'center', gap: 10, padding: `${size * 0.42}px ${size * 0.8}px`, borderRadius: 999, background: t[0], color: t[1], fontFamily: FONT, fontWeight: 700, fontSize: size, whiteSpace: 'nowrap', boxShadow: '0 16px 36px -16px rgba(15,23,42,0.55)', ...style}}>
      {children}
    </div>
  );
};

const Check: React.FC<{size?: number; color?: string}> = ({size = 24, color = '#fff'}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M5 12.5l4.5 4.5L19 7.5" stroke={color} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// brand footer: logo left, CTA right
const Footer: React.FC<{dark?: boolean; cta?: string; y?: number; x?: number; w?: number}> = ({dark = true, cta = 'Commencez', y = 1350 - 140, x = 70, w = 940}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
    <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
      <LogoMark size={54} />
      <Wordmark size={50} dark={dark} />
    </div>
    <div style={{display: 'flex', alignItems: 'center', gap: 12, height: 76, padding: '0 34px', borderRadius: 999, backgroundImage: GRAD, color: '#fff', fontFamily: FONT, fontWeight: 700, fontSize: 28, boxShadow: '0 20px 50px -18px rgba(91,63,228,0.8)'}}>
      {cta}
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
        <path d="M5 12h14M13 6l6 6-6 6" stroke="#fff" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  </div>
);

const H: React.FC<{children: React.ReactNode; size?: number; color?: string; style?: React.CSSProperties}> = ({children, size = 88, color = '#fff', style}) => (
  <div style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: size, lineHeight: 1.02, letterSpacing: '-0.02em', color, ...style}}>{children}</div>
);

const Wrap: React.FC<{children: React.ReactNode}> = ({children}) => {
  useFonts();
  return <AbsoluteFill>{children}</AbsoluteFill>;
};

// 01 — avant / après : agence vs une phrase
export const Crea01: React.FC = () => (
  <Wrap>
    <Light>
      <div style={{position: 'absolute', left: 70, top: 70, width: 940}}>
        <H color={C.ink} size={84}>
          3 000 € et 2 semaines ?<br />
          <span style={g()}>Ou une phrase.</span>
        </H>
      </div>
      {/* before */}
      <div style={{position: 'absolute', left: 70, top: 330, width: 420, height: 760, borderRadius: 32, background: '#fff', border: `2px solid ${C.hairline}`, padding: 34, boxSizing: 'border-box', fontFamily: FONT, boxShadow: '0 30px 60px -36px rgba(15,23,42,0.4)'}}>
        <Chip tone="red" size={22}>AVANT · agence</Chip>
        {[
          ['Brief & devis', '3 jours'],
          ['Tournage', '1 jour'],
          ['Montage', '1 semaine'],
          ['Allers-retours', 'V7_final'],
        ].map(([k, v]) => (
          <div key={k} style={{display: 'flex', justifyContent: 'space-between', fontSize: 25, color: C.slate, padding: '20px 0', borderBottom: `1px solid ${C.hairline}`}}>
            <span>{k}</span>
            <b style={{color: C.ink}}>{v}</b>
          </div>
        ))}
        <div style={{marginTop: 34, fontFamily: DISPLAY, fontWeight: 700, fontSize: 92, color: '#E5484D', textDecoration: 'line-through', textDecorationThickness: 8}}>3 000 €</div>
        <div style={{fontSize: 26, color: C.slate, marginTop: 6}}>et 2 semaines d’attente</div>
      </div>
      {/* after */}
      <div style={{position: 'absolute', left: 520, top: 330, width: 490, height: 760, borderRadius: 32, backgroundImage: GRAD, padding: 30, boxSizing: 'border-box', boxShadow: '0 40px 80px -36px rgba(91,63,228,0.8)'}}>
        <Chip size={22}>AVEC GROWTHITY</Chip>
        <div style={{marginTop: 22, background: 'rgba(255,255,255,0.16)', borderRadius: 20, padding: '16px 20px', fontFamily: FONT, fontSize: 24, lineHeight: 1.35, color: '#fff'}}>
          « Mon jonc doré porté par une actrice, face caméra. »
        </div>
        <Photo p="frames/sarah.jpg" w={430} h={500} r={24} pos="50% 30%" style={{marginTop: 22}}>
          <div style={{position: 'absolute', left: 14, bottom: 14}}>
            <Chip tone="green" size={22}>
              <Check size={22} /> Vidéo prête
            </Chip>
          </div>
        </Photo>
      </div>
      <Footer dark={false} />
    </Light>
  </Wrap>
);

// 02 — 500+ acteurs IA
const ACT = ['a-antoine', 'a-anya', 'a-camille', 'a-david', 'a-emiko', 'a-freja', 'a-hiro', 'a-marta', 'a-thomas', 'a-zoe', 'a-alice'];
export const Crea02: React.FC = () => (
  <Wrap>
    <Dark>
      <div style={{position: 'absolute', left: 70, top: 64, width: 940}}>
        <H size={96}>
          <span style={g()}>500+</span> acteurs IA.
        </H>
        <div style={{fontFamily: FONT, fontSize: 34, color: 'rgba(255,255,255,0.78)', marginTop: 14}}>Ils jouent votre pub face caméra. Aucun n’existe.</div>
      </div>
      <div style={{position: 'absolute', left: 70, top: 300, width: 940, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14}}>
        {ACT.map((a, i) => (
          <Photo key={a} p={`frames/${a}.jpg`} w={224} h={252} r={20} pos="50% 22%" style={{transform: `translateY(${i % 2 ? 18 : 0}px)`}} />
        ))}
        <div style={{width: 224, height: 252, borderRadius: 20, backgroundImage: GRAD, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: DISPLAY, fontWeight: 700, transform: 'translateY(18px)'}}>
          <div style={{fontSize: 64}}>+500</div>
          <div style={{fontFamily: FONT, fontSize: 22, fontWeight: 600, opacity: 0.9}}>acteurs IA</div>
        </div>
      </div>
      <Footer />
    </Dark>
  </Wrap>
);

// 03 — une vraie pub du compte, « faite en 2 minutes » (story 9:16)
export const Crea03: React.FC = () => (
  <Wrap>
    <Dark>
      <div style={{position: 'absolute', left: 120, top: 250, width: 840, textAlign: 'center'}}>
        <H size={92}>
          Cette pub a été faite en <span style={g()}>2 minutes.</span>
        </H>
      </div>
      <div style={{position: 'absolute', left: 540 - 220, top: 470}}>
        <PhoneF p="frames/emma.jpg" w={440} pos="50% 35%">
          <div style={{position: 'absolute', left: 18, top: 18}}>
            <Chip tone="dark" size={20}>
              <span style={{width: 10, height: 10, borderRadius: 5, background: '#FF4D5E'}} /> Générée par Growthity
            </Chip>
          </div>
          <div style={{position: 'absolute', left: 0, right: 0, bottom: 70, textAlign: 'center'}}>
            <span style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 34, color: '#fff', padding: '4px 14px', borderRadius: 12, backgroundImage: GRAD}}>Black Friday −20 %</span>
          </div>
        </PhoneF>
      </div>
      <div style={{position: 'absolute', left: 120, top: 1250, width: 840, display: 'flex', justifyContent: 'center', gap: 14}}>
        <Chip size={26}>Actrice IA</Chip>
        <Chip size={26}>0 tournage</Chip>
        <Chip size={26}>Bijoux</Chip>
      </div>
      <Footer cta="Lien en bio" y={1340} x={120} w={840} />
    </Dark>
  </Wrap>
);

// 04 — un mur de vraies créas, par secteur
const WALL = [
  {p: 'img-studio-coin.jpg', t: 'Immobilier', w: 460, h: 420},
  {p: 'img-bracelet-cercle.jpg', t: 'Bijoux', w: 460, h: 420, pos: '50% 60%'},
  {p: 'img-b2b-leads-32eur.jpg', t: 'B2B', w: 300, h: 400, pos: 'left top'},
  {p: 'frames/oeufs.jpg', t: 'Alimentaire', w: 300, h: 400},
  {p: 'frames/entrepot.jpg', t: 'Logistique', w: 300, h: 400},
];
export const Crea04: React.FC = () => (
  <Wrap>
    <Light>
      <div style={{position: 'absolute', left: 70, top: 70, width: 940}}>
        <H color={C.ink} size={90}>
          Un outil.
          <br />
          <span style={g()}>Tous les secteurs.</span>
        </H>
      </div>
      <div style={{position: 'absolute', left: 70, top: 330, width: 940, display: 'flex', flexWrap: 'wrap', gap: 20}}>
        {WALL.map((x) => (
          <Photo key={x.p} p={x.p} w={x.w} h={x.h} r={24} pos={x.pos ?? 'center top'}>
            <div style={{position: 'absolute', left: 14, bottom: 14}}>
              <Chip tone="dark" size={22}>{x.t}</Chip>
            </div>
          </Photo>
        ))}
      </div>
      <Footer dark={false} />
    </Light>
  </Wrap>
);

// 05 — la bibliothèque publicitaire Meta de vos concurrents
export const Crea05: React.FC = () => (
  <Wrap>
    <Dark>
      <div style={{position: 'absolute', left: 70, top: 64, width: 940}}>
        <H size={74}>
          Vos concurrents ont déjà trouvé <span style={g()}>la pub qui marche.</span>
        </H>
      </div>
      <div style={{position: 'absolute', left: 70, top: 345, width: 940, height: 790, borderRadius: 32, background: '#fff', padding: 30, boxSizing: 'border-box', fontFamily: FONT}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
          <MetaLogo size={30} />
          <div style={{fontSize: 26, fontWeight: 800, color: C.ink}}>Bibliothèque publicitaire</div>
          <div style={{marginLeft: 'auto', fontSize: 20, color: C.slate, background: C.mist, padding: '10px 18px', borderRadius: 12}}>🔍 votre marché</div>
        </div>
        <div style={{display: 'flex', gap: 22, marginTop: 24}}>
          {[
            {p: 'frames/lila.jpg', n: 'Concurrent A', b: 'Gagnant probable'},
            {p: 'frames/porte-savon.jpg', n: 'Concurrent B', b: 'Active depuis des semaines'},
          ].map((c) => (
            <div key={c.p} style={{flex: 1, border: `1px solid ${C.hairline}`, borderRadius: 22, padding: 16}}>
              <div style={{display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12}}>
                <div style={{width: 36, height: 36, borderRadius: 18, background: C.mist}} />
                <b style={{fontSize: 22, color: C.ink}}>{c.n}</b>
                <span style={{fontSize: 16, color: C.slate}}>· Sponsorisé</span>
              </div>
              <Photo p={c.p} w={400} h={500} r={16} pos="50% 30%" style={{boxShadow: 'none'}}>
                <div style={{position: 'absolute', left: 12, top: 12}}>
                  <Chip tone="green" size={18}>★ {c.b}</Chip>
                </div>
              </Photo>
              <div style={{marginTop: 14, height: 60, borderRadius: 14, backgroundImage: GRAD, color: '#fff', fontWeight: 700, fontSize: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10}}>✦ S’inspirer</div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </Dark>
  </Wrap>
);

// 06 — de l'idée à la pub en ligne (story 9:16)
export const Crea06: React.FC = () => {
  const step = (n: string, t: string) => (
    <div style={{display: 'flex', alignItems: 'center', gap: 16, fontFamily: FONT, fontWeight: 800, fontSize: 34, color: C.ink}}>
      <div style={{width: 52, height: 52, borderRadius: 26, backgroundImage: GRAD, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26}}>{n}</div>
      {t}
    </div>
  );
  return (
    <Wrap>
      <Light>
        <div style={{position: 'absolute', left: 120, top: 250, width: 840}}>
          <H color={C.ink} size={88}>
            De l’idée à la pub <span style={g()}>en ligne.</span>
          </H>
        </div>
        <div style={{position: 'absolute', left: 120, top: 480, width: 840}}>
          {step('1', 'Vous décrivez')}
          <div style={{marginTop: 16, background: '#fff', border: `2px solid ${C.primary}`, borderRadius: 24, padding: '20px 24px', fontFamily: FONT, fontSize: 32, color: C.ink, boxShadow: '0 0 0 7px rgba(101,82,232,0.12)'}}>
            Studio de jardin 20 m², sans permis. Un acteur le fait visiter.
          </div>
        </div>
        <div style={{position: 'absolute', left: 120, top: 720, width: 840, display: 'flex', gap: 30, alignItems: 'flex-start'}}>
          <div>
            {step('2', 'L’IA tourne')}
            <PhoneF p="frames/lucas.jpg" w={300} style={{marginTop: 18}} pos="50% 40%">
              <div style={{position: 'absolute', left: 12, top: 12}}>
                <Chip tone="dark" size={16}>Lucas · acteur IA</Chip>
              </div>
            </PhoneF>
          </div>
          <div style={{flex: 1}}>
            {step('3', 'C’est en ligne')}
            <div style={{marginTop: 18, background: '#fff', borderRadius: 26, padding: 24, boxShadow: '0 30px 60px -30px rgba(37,22,120,0.45)', fontFamily: FONT}}>
              {[['Ciblage', 'Rayon 50 km'], ['Placements', 'Reels · Feed'], ['Objectif', 'Demandes de devis']].map(([k, v]) => (
                <div key={k} style={{padding: '18px 0', borderBottom: `1px solid ${C.hairline}`}}>
                  <div style={{fontSize: 22, color: C.slate}}>{k}</div>
                  <b style={{fontSize: 30, color: C.ink}}>{v}</b>
                </div>
              ))}
              <div style={{marginTop: 20, height: 84, borderRadius: 18, background: C.success, color: '#fff', fontWeight: 800, fontSize: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10}}>
                <Check size={26} /> En ligne sur Meta
              </div>
            </div>
          </div>
        </div>
        <Footer dark={false} cta="Lien en bio" y={1340} x={120} w={840} />
      </Light>
    </Wrap>
  );
};

// 07 — trois formats
export const Crea07: React.FC = () => (
  <Wrap>
    <Dark>
      <div style={{position: 'absolute', left: 70, top: 64, width: 940}}>
        <H size={84}>
          Vidéo. Image. <span style={g()}>Carrousel.</span>
        </H>
        <div style={{fontFamily: FONT, fontSize: 32, color: 'rgba(255,255,255,0.78)', marginTop: 12}}>Tous les formats Meta, depuis la même phrase.</div>
      </div>
      <div style={{position: 'absolute', left: 70, top: 350}}>
        <PhoneF p="frames/lou.jpg" w={360} pos="50% 45%">
          <div style={{position: 'absolute', left: 12, bottom: 12}}>
            <Chip size={18}>Vidéo UGC · 9:16</Chip>
          </div>
        </PhoneF>
      </div>
      <div style={{position: 'absolute', left: 460, top: 350}}>
        <Photo p="img-studio-interieur.jpg" w={550} h={400} r={26} pos="center top">
          <div style={{position: 'absolute', left: 12, bottom: 12}}>
            <Chip size={18}>Visuel · fil</Chip>
          </div>
        </Photo>
      </div>
      <div style={{position: 'absolute', left: 460, top: 770, width: 550, height: 360, borderRadius: 26, overflow: 'hidden', display: 'flex', gap: 8, background: '#1A1622', padding: 8, boxSizing: 'border-box'}}>
        <Photo p="img-bracelet-trefle.jpg" w={340} h={344} r={20} style={{boxShadow: 'none'}} />
        <Photo p="frames/sneakers.jpg" w={186} h={344} r={20} pos="30% 50%" style={{boxShadow: 'none'}} />
        <div style={{position: 'absolute', left: 20, bottom: 20}}>
          <Chip size={18}>Carrousel · 1:1</Chip>
        </div>
        <div style={{position: 'absolute', right: 20, bottom: 26, display: 'flex', gap: 8}}>
          {[1, 0, 0].map((a, i) => (
            <div key={i} style={{width: 12, height: 12, borderRadius: 6, background: a ? '#fff' : 'rgba(255,255,255,0.4)'}} />
          ))}
        </div>
      </div>
      <Footer />
    </Dark>
  </Wrap>
);

// 08 — ciblage + publication Meta en un clic
export const Crea08: React.FC = () => (
  <Wrap>
    <Light>
      <div style={{position: 'absolute', left: 70, top: 70, width: 940}}>
        <H color={C.ink} size={90}>
          Ciblez. Publiez.
          <br />
          <span style={g()}>En un clic.</span>
        </H>
      </div>
      <div style={{position: 'absolute', left: 70, top: 340, width: 940, background: '#fff', borderRadius: 34, padding: 34, boxSizing: 'border-box', boxShadow: '0 50px 110px -50px rgba(37,22,120,0.6)', fontFamily: FONT}}>
        <div style={{display: 'flex', gap: 26, alignItems: 'center'}}>
          <Photo p="frames/caroline.jpg" w={170} h={230} r={20} pos="50% 30%" />
          <div>
            <div style={{fontSize: 20, letterSpacing: '0.14em', color: C.slate, fontWeight: 700}}>CAMPAGNE</div>
            <div style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 48, color: C.ink}}>Offre B2B · Leads</div>
            <div style={{fontSize: 24, color: C.slate, marginTop: 6}}>Vidéo UGC + visuel · Objectif prospects</div>
          </div>
        </div>
        {[['Ciblage', 'Dirigeants · Île-de-France'], ['Budget', '30 € / jour'], ['Placements', 'Feed · Reels · Stories']].map(([k, v], i) => (
          <div key={k} style={{display: 'flex', justifyContent: 'space-between', fontSize: 28, padding: '24px 0', borderTop: `1px solid ${C.hairline}`, marginTop: i ? 0 : 26}}>
            <span style={{color: C.slate}}>{k}</span>
            <b style={{color: C.ink}}>{v}</b>
          </div>
        ))}
        <div style={{position: 'relative', marginTop: 12, height: 100, borderRadius: 24, backgroundImage: GRAD, color: '#fff', fontWeight: 800, fontSize: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16}}>
          <div style={{background: '#fff', borderRadius: 10, padding: '4px 6px', display: 'flex'}}>
            <MetaLogo size={26} />
          </div>
          Publier sur Meta
          <svg width="64" height="64" viewBox="0 0 24 24" style={{position: 'absolute', right: 150, top: 50, filter: 'drop-shadow(0 6px 10px rgba(0,0,0,0.4))'}}>
            <path d="M5 3l14 8-6 1.5L10 19z" fill="#0F172A" stroke="#fff" strokeWidth={1.5} strokeLinejoin="round" />
          </svg>
        </div>
      </div>
      <div style={{position: 'absolute', left: 70, top: 1075, width: 940, display: 'flex', justifyContent: 'center', gap: 16}}>
        <Chip size={26}>Facebook</Chip>
        <Chip size={26}>Instagram</Chip>
        <Chip tone="green" size={26}>● En ligne</Chip>
      </div>
      <Footer dark={false} />
    </Light>
  </Wrap>
);

// 09 — une phrase, une pub
export const Crea09: React.FC = () => {
  const WARM = 'linear-gradient(100deg,#FFB347,#FF6A3D)';
  return (
    <Wrap>
      <Dark glow="rgba(255,140,60,0.35)">
        <div style={{position: 'absolute', left: 70, top: 64, width: 940}}>
          <H size={92} style={{whiteSpace: 'nowrap'}}>
            Une phrase. <span style={g(WARM)}>Une pub.</span>
          </H>
        </div>
        <div style={{position: 'absolute', left: 70, top: 250, width: 500, background: '#fff', borderRadius: 28, padding: '30px 32px', boxSizing: 'border-box', fontFamily: FONT, boxShadow: '0 40px 90px -40px rgba(0,0,0,0.9)'}}>
          <div style={{fontSize: 20, fontWeight: 700, color: C.slate, display: 'flex', alignItems: 'center', gap: 8}}>
            <LogoMark size={26} /> Chat créatif
          </div>
          <div style={{fontSize: 38, lineHeight: 1.3, color: C.ink, marginTop: 16, fontWeight: 600}}>« Pâtes fraîches artisanales, livrées aux restaurants de Lyon. »</div>
          <div style={{marginTop: 22, display: 'inline-flex', alignItems: 'center', gap: 10, height: 64, padding: '0 26px', borderRadius: 16, backgroundImage: GRAD, color: '#fff', fontWeight: 700, fontSize: 26}}>✦ Générer</div>
        </div>
        <div style={{position: 'absolute', left: 70, top: 700, width: 500, display: 'flex', flexDirection: 'column', gap: 16}}>
          {['Script rédigé', 'Artisane choisie', 'Vidéo tournée'].map((t) => (
            <Chip key={t} size={26} style={{alignSelf: 'flex-start'}}>
              <span style={{width: 34, height: 34, borderRadius: 17, background: C.success, display: 'inline-flex', alignItems: 'center', justifyContent: 'center'}}>
                <Check size={22} />
              </span>
              {t}
            </Chip>
          ))}
        </div>
        <svg width="160" height="120" viewBox="0 0 160 120" style={{position: 'absolute', left: 420, top: 960}}>
          <path d="M10 20 C 70 20, 110 40, 140 100" stroke="#FFB347" strokeWidth="6" fill="none" strokeLinecap="round" strokeDasharray="2 14" />
          <path d="M120 92 L142 104 L146 80" stroke="#FFB347" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <div style={{position: 'absolute', left: 600, top: 250}}>
          <PhoneF p="frames/pates.jpg" w={410} pos="50% 40%">
            <div style={{position: 'absolute', left: 12, top: 12}}>
              <Chip tone="dark" size={17}>Artisane IA · votre atelier</Chip>
            </div>
          </PhoneF>
        </div>
        <Footer />
      </Dark>
    </Wrap>
  );
};

// 10 — CTA marque (story 9:16)
export const Crea10: React.FC = () => (
  <Wrap>
    <AbsoluteFill style={{backgroundImage: 'linear-gradient(160deg,#2563EB 0%,#5B3FE4 48%,#9333EA 100%)', overflow: 'hidden'}}>
      <div style={{position: 'absolute', right: -300, top: 900, width: 1000, height: 1000, borderRadius: '50%', background: 'radial-gradient(circle, rgba(224,71,158,0.6) 0%, transparent 60%)'}} />
      <AbsoluteFill style={{backgroundImage: 'radial-gradient(rgba(255,255,255,0.6) 1.2px, transparent 1.2px)', backgroundSize: '30px 30px', opacity: 0.12}} />
      <div style={{position: 'absolute', left: 120, top: 250, width: 840}}>
        <H size={104}>Votre prochaine pub est à une phrase.</H>
      </div>
      <div style={{position: 'absolute', left: 120, top: 700, transform: 'rotate(-4deg)'}}>
        <Photo p="frames/bougie.jpg" w={460} h={600} r={36} pos="50% 40%" style={{border: '8px solid #fff'}}>
          <div style={{position: 'absolute', left: 14, bottom: 14}}>
            <Chip tone="dark" size={20}>Pub vidéo · déco</Chip>
          </div>
        </Photo>
      </div>
      <div style={{position: 'absolute', left: 620, top: 760, width: 340, display: 'flex', flexDirection: 'column', gap: 18}}>
        {['Vidéos UGC', 'Visuels', 'Carrousels', 'Publication Meta'].map((t) => (
          <div key={t} style={{display: 'flex', alignItems: 'center', gap: 12, fontFamily: FONT, fontWeight: 700, fontSize: 30, color: '#fff'}}>
            <div style={{width: 40, height: 40, borderRadius: 20, background: 'rgba(255,255,255,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <Check size={24} />
            </div>
            {t}
          </div>
        ))}
      </div>
      <div style={{position: 'absolute', left: 120, top: 1360, width: 840, display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
          <LogoMark size={58} color="#fff" />
          <div style={{fontFamily: DISPLAY, fontWeight: 600, fontSize: 54, color: '#fff'}}>growthity.ai</div>
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: 12, height: 80, padding: '0 36px', borderRadius: 999, background: '#fff', color: C.indigo, fontFamily: FONT, fontWeight: 800, fontSize: 30}}>Lien en bio ↑</div>
      </div>
    </AbsoluteFill>
  </Wrap>
);

export const CREAS: {id: string; C: React.FC; w: number; h: number}[] = [
  {id: 'Crea01', C: Crea01, w: 1080, h: 1350},
  {id: 'Crea02', C: Crea02, w: 1080, h: 1350},
  {id: 'Crea03', C: Crea03, w: 1080, h: 1920},
  {id: 'Crea04', C: Crea04, w: 1080, h: 1350},
  {id: 'Crea05', C: Crea05, w: 1080, h: 1350},
  {id: 'Crea06', C: Crea06, w: 1080, h: 1920},
  {id: 'Crea07', C: Crea07, w: 1080, h: 1350},
  {id: 'Crea08', C: Crea08, w: 1080, h: 1350},
  {id: 'Crea09', C: Crea09, w: 1080, h: 1350},
  {id: 'Crea10', C: Crea10, w: 1080, h: 1920},
];
