// « Le brief Meta » #9 (publier régulièrement) et #10 (surveiller ses pubs : alertes WhatsApp).
import React from 'react';
import {AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {DISPLAY, GRAD, INK, MUTED, Check, Spinner, clamp, prog} from '../chatpub/SplitChat';
import {BriefShell, Grad, Headline, Label, Logo, Scene, ease} from './BriefAndromeda';
import {CalGrid, NetRows, RhythmRows, WaBubble, WaButtons, WaNotif, WaPhone, Word, at, sp} from './socialKit';

export type SocCfg = {episode: number; scenes: Scene[]; bed: string; ads: string[]};
const RED = '#DC2626';
const GREEN = '#16A34A';

const Title1: React.FC<{a: string; b: string; sub: string}> = ({a, b, sub}) => {
  const f = useCurrentFrame();
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 410, textAlign: 'center', transform: `scale(${0.85 + sp(f - 2, 14) * 0.15})`}}>
      <div style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 110, letterSpacing: '-0.035em', lineHeight: 1, color: INK}}>{a}<br /><Grad>{b}</Grad></div>
      <div style={{fontSize: 38, fontWeight: 600, color: MUTED, marginTop: 24, opacity: prog(f, 12, 10)}}>{sub}</div>
    </div>
  );
};

// profil Instagram (grille)
const Profile: React.FC<{f: number; x: number; y: number; w: number; empty?: number; start?: number}> = ({f, x, y, w, empty = 0, start = 0}) => {
  const tiles = ['chat/batch/g3.png', 'chat/jwel/nb1.png', 'chat/roast6/burger.png', 'chat/batch/g5.png', 'chat/batch/g6.png', 'chat/jwel/ad-cercle.jpg'];
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, background: '#fff', borderRadius: 30, border: '2px solid #E5E7EB', padding: 22, transform: `scale(${sp(f - start)})`, boxShadow: '0 30px 60px -32px rgba(15,23,42,0.5)'}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16}}>
        <div style={{width: 74, height: 74, borderRadius: 37, padding: 4, backgroundImage: 'linear-gradient(45deg,#F59E0B,#E1306C,#7C3AED)'}}><div style={{width: '100%', height: '100%', borderRadius: 33, background: '#F1F5F9', border: '3px solid #fff'}} /></div>
        <div><b style={{fontSize: 30, color: INK}}>ta_boutique</b><div style={{fontSize: 22, color: MUTED}}>Instagram</div></div>
      </div>
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6}}>
        {tiles.map((t, i) => (
          <div key={i} style={{aspectRatio: '4 / 5', borderRadius: 8, overflow: 'hidden', background: '#F1F5F9'}}>
            {i >= empty && <Img src={staticFile(`media/${t}`)} style={{width: '100%', height: '100%', objectFit: 'cover', filter: empty ? 'grayscale(0.6) brightness(1.05)' : undefined}} />}
          </div>
        ))}
      </div>
    </div>
  );
};

/* ---------------- #9 Publier régulièrement ---------------- */

const R1: React.FC<{words: Word[]}> = ({words}) => {
  const f = useCurrentFrame();
  const vide = at(words, 'vide');
  return (
    <AbsoluteFill>
      <Title1 a="Tes réseaux" b="sociaux" sub="Pourquoi la régularité compte" />
      <div style={{position: 'absolute', inset: 0, transform: 'translateY(30px)'}}>
        <div style={{position: 'absolute', left: 120, top: 800, padding: '12px 22px', borderRadius: 99, background: '#DCFCE7', color: '#15803D', fontSize: 28, fontWeight: 800, opacity: prog(f, 14, 8)}}>● Pub active</div>
        <Profile f={f} x={480} y={760} w={480} empty={3} start={10} />
        {f >= vide && <div style={{position: 'absolute', left: 500, top: 1210, padding: '10px 20px', borderRadius: 99, background: '#FEE2E2', color: '#B91C1C', fontSize: 26, fontWeight: 800, transform: `scale(${sp(f - vide, 9)})`}}>Dernier post : il y a 3 semaines</div>}
      </div>
    </AbsoluteFill>
  );
};

const R2: React.FC<{words: Word[]; ads: string[]}> = ({words, ads}) => {
  const f = useCurrentFrame();
  const prof = at(words, 'profil'), cold = at(words, 'refroidit');
  return (
    <AbsoluteFill>
      <Label text="LE RÉFLEXE DES CLIENTS" color={RED} />
      <Headline>Avant d’acheter,<br /><span style={{color: RED}}>on va voir ton profil.</span></Headline>
      <div style={{position: 'absolute', left: 110, top: 700, width: 280, height: 470, borderRadius: 24, overflow: 'hidden', transform: `scale(${sp(f - 4)})`, boxShadow: '0 24px 44px -24px rgba(15,23,42,0.6)'}}><Img src={staticFile(`media/${ads[0]}`)} style={{width: '100%', height: '100%', objectFit: 'cover'}} /><div style={{position: 'absolute', left: 14, top: 14, padding: '6px 12px', borderRadius: 99, background: 'rgba(255,255,255,0.9)', fontSize: 20, fontWeight: 800}}>Sponsorisé</div></div>
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}><path d="M410 930 C 470 900, 500 900, 540 930" stroke="#94A3B8" strokeWidth={6} fill="none" strokeDasharray="12 10" opacity={prog(f, prof - 6, 8)} /><path d="M528 914 l16 18 l-22 8" stroke="#94A3B8" strokeWidth={6} fill="none" opacity={prog(f, prof - 6, 8)} /></svg>
      <Profile f={f} x={560} y={700} w={420} empty={4} start={prof} />
      {f >= cold && <div style={{position: 'absolute', left: 0, right: 0, top: 1240, textAlign: 'center'}}><span style={{display: 'inline-block', padding: '12px 26px', borderRadius: 99, background: '#E0F2FE', color: '#0369A1', fontSize: 32, fontWeight: 800, transform: `scale(${sp(f - cold, 9)})`}}>❄️ Un compte à l’abandon refroidit</span></div>}
    </AbsoluteFill>
  );
};

const R3: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Label text="LE SECRET" color={GREEN} />
      <Headline>Pas plus.<br /><Grad>Plus régulier.</Grad></Headline>
      <RhythmRows f={f} start={6} x={110} y={740} w={860} />
    </AbsoluteFill>
  );
};

const R4: React.FC<{words: Word[]}> = ({words}) => {
  const f = useCurrentFrame();
  const prep = at(words, 'prépare'), prog2 = at(words, 'programme');
  return (
    <AbsoluteFill>
      <Label text="LA MÉTHODE" color={GREEN} />
      <Headline>Un moment par semaine,<br /><Grad>tout est programmé.</Grad></Headline>
      <div style={{position: 'absolute', left: 110, right: 110, top: 660, padding: '22px 26px', borderRadius: 24, background: '#fff', border: '2px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: 18, transform: `scale(${sp(f - 2)})`}}>
        <div style={{fontSize: 44}}>🗓️</div>
        <div style={{flex: 1}}><b style={{fontSize: 32, color: INK}}>Lundi matin · 1 créneau</b><div style={{fontSize: 24, color: MUTED}}>Préparer et programmer la semaine</div></div>
        <div style={{display: 'flex', gap: 10}}>{[prep, prog2].map((s, i) => <span key={i} style={{display: 'flex', alignItems: 'center', gap: 6, fontSize: 22, fontWeight: 800, color: '#15803D', opacity: prog(f, s, 8)}}><Check s={24} /> {i ? 'Programmé' : 'Préparé'}</span>)}</div>
      </div>
      <CalGrid f={f} start={prog2} x={110} y={820} w={860} step={2} />
    </AbsoluteFill>
  );
};

const R5: React.FC<{words: Word[]; ads: string[]}> = ({words, ads}) => {
  const f = useCurrentFrame();
  const reel = at(words, 'reels'), proof = at(words, 'preuves');
  const p = prog(f, reel, 14);
  return (
    <AbsoluteFill>
      <Label text="L’ASTUCE" color={GREEN} />
      <Headline>Recycle tes meilleures pubs<br /><Grad>en reels.</Grad></Headline>
      <div style={{position: 'absolute', left: 130, top: 700, width: 300, height: 520, borderRadius: 24, overflow: 'hidden', transform: `scale(${sp(f - 2)})`, boxShadow: '0 24px 44px -24px rgba(15,23,42,0.6)'}}>
        <Img src={staticFile(`media/${ads[1]}`)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
        <div style={{position: 'absolute', left: 14, top: 14, padding: '6px 12px', borderRadius: 99, backgroundImage: GRAD, color: '#fff', fontSize: 20, fontWeight: 800}}>🏆 Meilleure pub</div>
      </div>
      <div style={{position: 'absolute', left: 470, top: 930, fontSize: 60, color: '#94A3B8', opacity: p}}>→</div>
      <div style={{position: 'absolute', left: 580, top: 680, width: 330, height: 586, borderRadius: 44, background: '#0B0A0C', padding: 10, transform: `translateX(${(1 - p) * 200}px)`, opacity: p}}>
        <div style={{width: '100%', height: '100%', borderRadius: 36, overflow: 'hidden', position: 'relative'}}>
          <Img src={staticFile(`media/${ads[1]}`)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
          <div style={{position: 'absolute', left: 14, top: 18, padding: '6px 12px', borderRadius: 99, background: 'rgba(0,0,0,0.55)', color: '#fff', fontSize: 20, fontWeight: 800}}>Reel · organique</div>
        </div>
      </div>
      {f >= proof && <div style={{position: 'absolute', left: 0, right: 0, top: 1290, textAlign: 'center'}}><span style={{display: 'inline-block', padding: '10px 24px', borderRadius: 99, background: '#DCFCE7', color: '#15803D', fontSize: 30, fontWeight: 800, transform: `scale(${sp(f - proof, 9)})`}}>✓ Déjà testée par ton public</span></div>}
    </AbsoluteFill>
  );
};

const EndBrand: React.FC<{children: React.ReactNode}> = ({children}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 0, right: 0, top: 350, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 22, transform: `scale(${0.8 + sp(f, 13) * 0.2})`}}>
        <div style={{filter: 'drop-shadow(0 20px 40px rgba(91,63,228,0.35))'}}><Logo s={110} /></div>
        <div style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 90, color: INK, letterSpacing: '-0.03em'}}>Growthity</div>
      </div>
      {children}
      <div style={{position: 'absolute', left: 0, right: 0, top: 1290, display: 'flex', justifyContent: 'center', opacity: prog(f, 56, 10)}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 14, padding: '18px 38px', borderRadius: 99, backgroundImage: GRAD, color: '#fff', fontSize: 36, fontWeight: 800, boxShadow: '0 20px 40px -14px rgba(91,63,228,0.7)'}}><Check s={34} c="#fff" /> Lien en bio pour commencer</div>
      </div>
    </AbsoluteFill>
  );
};

const R6: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <EndBrand>
      <CalGrid f={f} start={8} x={110} y={520} w={860} step={2} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 1170, textAlign: 'center', fontSize: 30, fontWeight: 800, color: '#15803D', opacity: prog(f, 40, 8)}}>✓ Instagram · Facebook · TikTok — publiés tout seuls</div>
    </EndBrand>
  );
};

export const BriefRegularite: React.FC<{cfg: SocCfg}> = ({cfg}) => (
  <BriefShell cfg={cfg} comps={[<R1 key={0} words={cfg.scenes[0].words} />, <R2 key={1} words={cfg.scenes[1].words} ads={cfg.ads} />, <R3 key={2} />, <R4 key={3} words={cfg.scenes[3].words} />, <R5 key={4} words={cfg.scenes[4].words} ads={cfg.ads} />, <R6 key={5} />]} />
);

/* ---------------- #10 Surveiller ses pubs ---------------- */

const A1: React.FC<{words: Word[]}> = ({words}) => {
  const f = useCurrentFrame();
  const late = at(words, 'tard');
  const pts = Array.from({length: 50}, (_, i) => { const x = i / 49; const y = x < 0.6 ? 0.75 + Math.sin(i * 0.8) * 0.02 : 0.75 - Math.pow((x - 0.6) / 0.4, 1.5) * 0.6; return [150 + x * 780, 1180 - y * 330]; });
  const p = interpolate(f, [16, 70], [0, 1], ease);
  const n = Math.max(2, Math.ceil(pts.length * p));
  const d = pts.slice(0, n).map((q, i) => `${i ? 'L' : 'M'}${q[0]},${q[1]}`).join(' ');
  return (
    <AbsoluteFill>
      <Title1 a="Surveiller" b="ses pubs" sub="Sans y passer ses journées" />
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        <line x1={150} y1={1190} x2={930} y2={1190} stroke="#E2E8F0" strokeWidth={3} />
        <path d={d} fill="none" stroke={p > 0.62 ? RED : '#5B3FE4'} strokeWidth={8} strokeLinecap="round" />
      </svg>
      <div style={{position: 'absolute', left: 620, top: 860, padding: '6px 16px', borderRadius: 99, background: INK, color: '#fff', fontSize: 22, fontWeight: 800, opacity: prog(f, 54, 6)}}>quelques jours</div>
      {f >= late && <div style={{position: 'absolute', right: 140, top: 1210, padding: '8px 18px', borderRadius: 99, background: '#FEE2E2', color: '#B91C1C', fontSize: 26, fontWeight: 800, transform: `scale(${sp(f - late, 9)})`}}>😬 vu trop tard</div>}
    </AbsoluteFill>
  );
};

const Signal: React.FC<{f: number; start: number; y: number; label: string; up: boolean}> = ({f, start, y, label, up}) => {
  const p = sp(f - start);
  return (
    <div style={{position: 'absolute', left: 110, right: 110, top: y, height: 140, borderRadius: 28, background: '#fff', border: '2px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: 24, padding: '0 32px', transform: `translateX(${(1 - p) * 120}px)`, opacity: p}}>
      <div style={{width: 74, height: 74, borderRadius: 22, background: '#FEE2E2', color: RED, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48, fontWeight: 900}}>{up ? '↑' : '↓'}</div>
      <div style={{flex: 1, fontSize: 40, fontWeight: 800, color: INK}}>{label}</div>
    </div>
  );
};
const A2: React.FC<{words: Word[]}> = ({words}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Label text="LES SIGNAUX" color={RED} />
      <Headline>3 signaux<br /><span style={{color: RED}}>à surveiller.</span></Headline>
      <Signal f={f} start={at(words, 'fréquence')} y={720} label="Fréquence" up />
      <Signal f={f} start={at(words, 'clic')} y={890} label="Taux de clic" up={false} />
      <Signal f={f} start={at(words, 'coût')} y={1060} label="Coût par résultat" up />
    </AbsoluteFill>
  );
};

const A3: React.FC<{words: Word[]}> = ({words}) => {
  const f = useCurrentFrame();
  const mod = at(words, 'modifier');
  const hour = 9 + Math.floor(interpolate(f, [0, mod], [0, 8], clamp));
  const edits = ['Budget modifié', 'Ciblage modifié', 'Créa changée'];
  return (
    <AbsoluteFill>
      <Label text="LE PIÈGE" color={RED} />
      <Headline>Tout regarder,<br /><span style={{color: RED}}>tout toucher.</span></Headline>
      <div style={{position: 'absolute', left: 0, right: 0, top: 680, textAlign: 'center'}}>
        <span style={{display: 'inline-block', padding: '14px 34px', borderRadius: 24, background: INK, color: '#fff', fontFamily: DISPLAY, fontWeight: 700, fontSize: 72}}>🕘 {String(hour).padStart(2, '0')}:00</span>
      </div>
      {edits.map((e, i) => { const s = mod + i * 7; return f >= s && <div key={e} style={{position: 'absolute', left: 150 + i * 40, top: 860 + i * 100, padding: '14px 24px', borderRadius: 18, background: '#FFFBEB', border: '3px solid #FCD34D', color: '#92400E', fontSize: 30, fontWeight: 800, transform: `scale(${sp(f - s, 10)}) rotate(${i % 2 ? 2 : -2}deg)`}}>✏️ {e}</div>; })}
      {f >= mod + 24 && <div style={{position: 'absolute', left: 0, right: 0, top: 1210, textAlign: 'center'}}><span style={{display: 'inline-flex', alignItems: 'center', gap: 10, padding: '10px 22px', borderRadius: 99, background: '#FEF3C7', color: '#B45309', fontSize: 30, fontWeight: 800, transform: `scale(${sp(f - mod - 24, 10)})`}}><Spinner f={f} s={26} /> Retour en apprentissage</span></div>}
    </AbsoluteFill>
  );
};

const A4: React.FC<{words: Word[]}> = ({words}) => {
  const f = useCurrentFrame();
  const sig = Math.min(at(words, 'alerte'), 24);
  return (
    <AbsoluteFill>
      <Label text="LA BONNE MÉTHODE" color={GREEN} />
      <Headline>Une alerte,<br /><Grad>seulement quand il faut.</Grad></Headline>
      <WaPhone x={170} y={650} w={740} h={640}>
        <WaBubble f={f} start={sig} time="09:02">⚠️ Ta pub <b>« Bracelet trèfle »</b> s’essouffle : fréquence en hausse, clics en baisse.</WaBubble>
        <WaBubble f={f} start={sig + 14} time="09:02">✨ 3 nouvelles créas sont prêtes à prendre le relais.</WaBubble>
        <WaButtons f={f} start={sig + 24} labels={['Voir les créas', 'Remplacer']} />
      </WaPhone>
    </AbsoluteFill>
  );
};

const A5: React.FC<{words: Word[]}> = ({words}) => {
  const f = useCurrentFrame();
  const s0 = Math.min(at(words, 'bilan'), 20);
  const rows = ['💶 Dépenses de la semaine', '🎯 Résultats obtenus', '🏆 Meilleure pub : « Bougie ambre »', '💡 Conseil : laisse tourner, ne touche à rien'];
  return (
    <AbsoluteFill>
      <Label text="CHAQUE SEMAINE" color={GREEN} />
      <Headline>Un bilan,<br /><Grad>à tête reposée.</Grad></Headline>
      <WaPhone x={170} y={650} w={740} h={640}>
        <WaBubble f={f} start={s0} time="Lun. 08:30">
          <b>👋 Ton bilan de la semaine</b>
          {rows.map((r, i) => <div key={r} style={{fontSize: 25, marginTop: 6, opacity: prog(f, s0 + 8 + i * 6, 6)}}>{r}</div>)}
        </WaBubble>
      </WaPhone>
    </AbsoluteFill>
  );
};

const A6: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <EndBrand>
      <WaNotif f={f} start={10} text="⚠️ Ta pub « Soldes hiver » s’essouffle. 3 nouvelles créas sont prêtes." style={{left: 110, right: 110, top: 560}} />
      <WaNotif f={f} start={26} text="👋 Ton bilan de la semaine est prêt." style={{left: 110, right: 110, top: 740}} />
      <WaNotif f={f} start={40} text="✅ « Collection trèfle » est stable : tu peux augmenter le budget." style={{left: 110, right: 110, top: 890}} />
    </EndBrand>
  );
};

export const BriefAlertes: React.FC<{cfg: SocCfg}> = ({cfg}) => (
  <BriefShell cfg={cfg} comps={[<A1 key={0} words={cfg.scenes[0].words} />, <A2 key={1} words={cfg.scenes[1].words} />, <A3 key={2} words={cfg.scenes[2].words} />, <A4 key={3} words={cfg.scenes[3].words} />, <A5 key={4} words={cfg.scenes[4].words} />, <A6 key={5} />]} />
);

export {R3 as RhythmScene, A3 as TouchScene, A4 as AlertScene, A5 as ReportScene};
