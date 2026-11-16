import React from 'react';
import {Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {LightBg, StudioBg} from '../components/Backgrounds';
import {prog, pop, INOUT} from '../components/anim';
import {C, DISPLAY, FONT} from '../theme';
import {SceneProps, wordAt} from './timeline';
import {EndCard, Pill, R, SAFE_CX, gradText} from './kit';
import {Sticker, Tick, Title} from './parts';
import {CalGrid, NetRows, WaBubble, WaButtons, WaNotif, WaPhone} from '../brief/socialKit';

// Short 6 — calendrier de publications (réseaux sociaux programmés)
// Short 7 — media buyer sur WhatsApp (alertes + bilan du lundi)

const IgProfile: React.FC<{x: number; y: number; w: number; grey: number}> = ({x, y, w, grey}) => {
  const tiles = ['chat/batch/g3.png', 'chat/jwel/nb1.png', 'chat/roast6/burger.png', 'chat/batch/g5.png', 'chat/batch/g6.png', 'chat/jwel/ad-cercle.jpg'];
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, background: '#fff', borderRadius: 34, padding: 24, fontFamily: FONT, boxShadow: '0 40px 90px -40px rgba(0,0,0,0.8)'}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 16, marginBottom: 18}}>
        <div style={{width: 80, height: 80, borderRadius: 40, padding: 4, backgroundImage: 'linear-gradient(45deg,#F59E0B,#E1306C,#7C3AED)'}}><div style={{width: '100%', height: '100%', borderRadius: 36, background: '#F1F5F9', border: '3px solid #fff'}} /></div>
        <div><b style={{fontSize: 32, color: C.ink}}>ta_boutique</b><div style={{fontSize: 24, color: C.slate}}>Instagram</div></div>
      </div>
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6}}>
        {tiles.map((t, i) => (
          <div key={i} style={{aspectRatio: '4 / 5', borderRadius: 8, overflow: 'hidden', background: '#EEF0F4'}}>
            {i >= 3 && <Img src={staticFile(`media/${t}`)} style={{width: '100%', height: '100%', objectFit: 'cover', filter: `grayscale(${grey})`}} />}
          </div>
        ))}
      </div>
    </div>
  );
};

// « Vous oubliez de poster sur Instagram ? Vous n'êtes pas les seuls. »
export const S6Hook: React.FC<SceneProps> = ({lines}) => {
  const f = useCurrentFrame();
  const seuls = wordAt(lines[0], 'seuls', 60);
  return (
    <StudioBg>
      <div style={{position: 'absolute', left: R.x, width: R.w, top: R.y + 10}}>
        <Title text="Vous oubliez de *poster* ?" start={2} step={4} size={100} />
      </div>
      <div style={{transform: `scale(${pop(f, 8, 14)}) rotate(${-2 + Math.sin(f / 20) * 0.6}deg)`, transformOrigin: '540px 800px', position: 'absolute', inset: 0}}>
        <IgProfile x={SAFE_CX - 300} y={520} w={600} grey={prog(f, 20, 20)} />
      </div>
      <Sticker at={seuls - 4} rot={-6} size={38} bg="linear-gradient(120deg,#FF5A6E,#E5484D)" style={{left: R.x + 70, top: 1060}}>
        Dernier post : il y a 3 semaines
      </Sticker>
    </StudioBg>
  );
};

// « Dans Growthity, vos créations arrivent directement dans un calendrier. »
export const S6Cal: React.FC<SceneProps> = ({lines}) => {
  const f = useCurrentFrame();
  const cal = wordAt(lines[0], 'calendrier', 40);
  return (
    <LightBg>
      <div style={{position: 'absolute', left: R.x, width: R.w, top: R.y + 10}}>
        <Title text="Vos créas, *rangées* dans un calendrier" start={2} step={3} size={74} color={C.ink} />
      </div>
      <div style={{position: 'absolute', inset: 0, transform: `translateY(${(1 - prog(f, 4, 18, INOUT)) * 700}px)`}}>
        <CalGrid f={f} start={Math.min(cal, 40)} x={R.x} y={500} w={R.w} step={3} />
      </div>
    </LightBg>
  );
};

// « Glissez, déposez, choisissez l'heure. Instagram, Facebook, TikTok : tout part tout seul. »
export const S6Drag: React.FC<SceneProps> = ({lines}) => {
  const f = useCurrentFrame();
  const l = lines[0];
  const drop = wordAt(l, 'déposez', 24), heure = wordAt(l, 'heure', 40), insta = wordAt(l, 'instagram', 60), seul = wordAt(l, 'seul', 110);
  const t = prog(f, 4, drop - 2, INOUT);
  return (
    <StudioBg intensity={0.85}>
      <div style={{position: 'absolute', left: R.x, top: R.y + 10, width: R.w, height: 360, borderRadius: 30, background: 'rgba(255,255,255,0.08)', border: '2px dashed rgba(255,255,255,0.35)', display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingLeft: 44, fontFamily: DISPLAY, fontWeight: 700, fontSize: 46, color: 'rgba(255,255,255,0.8)'}}>
        Mardi 18<span style={{fontSize: 80, ...gradText()}}>{f >= heure ? '18:30' : '--:--'}</span>
      </div>
      <div style={{position: 'absolute', left: interpolate(t, [0, 1], [SAFE_CX - 120, R.x + R.w - 270]), top: interpolate(t, [0, 1], [900, R.y + 40]), width: 240, height: 300, borderRadius: 24, overflow: 'hidden', transform: `rotate(${(1 - t) * 8}deg) scale(${1 + Math.sin(t * Math.PI) * 0.08})`, boxShadow: '0 40px 80px -30px rgba(0,0,0,0.9)'}}>
        <Img src={staticFile('media/chat/jwel/nb1.png')} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      </div>
      <div style={{position: 'absolute', left: interpolate(t, [0, 1], [SAFE_CX + 60, R.x + R.w - 60]), top: interpolate(t, [0, 1], [1060, R.y + 300]), fontSize: 64, opacity: 1 - prog(f, drop + 4, 6)}}>👆</div>
      <div style={{opacity: prog(f, insta - 4, 8)}}>
        <NetRows f={f} start={insta - 4} x={R.x} y={680} w={R.w} />
      </div>
      <Sticker at={seul} rot={5} size={42} bg="linear-gradient(120deg,#19A866,#22C17A)" style={{left: R.x + 200, top: 1060}}>
        Tout part tout seul
      </Sticker>
    </StudioBg>
  );
};

// « Tout votre mois de contenu, programmé d'un seul coup. »
export const S6Month: React.FC<SceneProps> = ({lines}) => {
  const f = useCurrentFrame();
  const coup = wordAt(lines[0], 'coup', 50);
  return (
    <LightBg>
      <div style={{position: 'absolute', left: R.x, width: R.w, top: R.y + 10}}>
        <Title text="Tout le mois, *programmé*" start={2} step={4} size={84} color={C.ink} />
      </div>
      <CalGrid f={f} start={4} x={R.x} y={480} w={R.w} step={1} />
      <div style={{position: 'absolute', left: R.x, width: R.w, top: 1110, display: 'flex', justifyContent: 'center', opacity: prog(f, coup - 6, 10)}}>
        <Pill tone="green" size={32}>✓ 12 posts programmés</Pill>
      </div>
    </LightBg>
  );
};

export const S6End: React.FC<SceneProps> = ({dur}) => (
  <EndCard dur={dur} tagline={<>Vos réseaux tournent<br /><span style={gradText()}>sans vous.</span></>} />
);

// ---------------- Short 7 ----------------

// « Et si vos pubs vous prévenaient quand ça dérape ? »
export const S7Hook: React.FC<SceneProps> = ({lines}) => {
  const f = useCurrentFrame();
  const der = wordAt(lines[0], 'dérape', 40);
  return (
    <StudioBg>
      <div style={{position: 'absolute', left: R.x, width: R.w, top: R.y + 10}}>
        <Title text="Et si vos pubs vous *prévenaient* ?" start={2} step={4} size={86} />
      </div>
      <WaNotif f={f} start={Math.min(der, 36)} text="⚠️ Ta pub « Bracelet trèfle » s’essouffle. 3 nouvelles créas sont prêtes." style={{left: R.x - 20, width: R.w + 40, top: 700, boxSizing: 'border-box'}} />
      <div style={{position: 'absolute', left: SAFE_CX - 50, top: 940, fontSize: 100, transform: `scale(${pop(f, der + 6, 9)}) rotate(${Math.sin(f / 2) * 8}deg)`}}>🔔</div>
    </StudioBg>
  );
};

// « Growthity surveille vos campagnes, jour et nuit. »
export const S7Watch: React.FC<SceneProps> = ({lines}) => {
  const f = useCurrentFrame();
  const nuit = wordAt(lines[0], 'nuit', 50);
  const night = prog(f, nuit - 8, 14);
  const sig = ['Fréquence', 'Taux de clic', 'Coût par résultat'];
  return (
    <LightBg>
      <div style={{position: 'absolute', left: R.x, width: R.w, top: R.y + 10}}>
        <Title text="Vos campagnes, *surveillées*" start={2} step={4} size={86} color={C.ink} />
      </div>
      <div style={{position: 'absolute', left: SAFE_CX - 110, top: 520, width: 220, height: 220, borderRadius: 110, background: night > 0.5 ? '#1E1B4B' : '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 120, transform: `rotate(${night * 360}deg)`}}>{night > 0.5 ? '🌙' : '☀️'}</div>
      <div style={{position: 'absolute', left: R.x + 40, width: R.w - 80, top: 800, display: 'flex', flexDirection: 'column', gap: 22}}>
        {sig.map((s, i) => (
          <Tick key={s} at={8 + i * 8} size={34} dark>{s} · surveillé</Tick>
        ))}
      </div>
    </LightBg>
  );
};

// « Une pub s'essouffle ? L'alerte arrive sur WhatsApp, avec les nouvelles créas prêtes. »
export const S7Alert: React.FC<SceneProps> = ({lines}) => {
  const f = useCurrentFrame();
  const l = lines[0];
  const wa = wordAt(l, 'whatsapp', 40), cr = wordAt(l, 'créas', 80);
  return (
    <StudioBg intensity={0.85}>
      <div style={{position: 'absolute', inset: 0, transform: `translateY(${(1 - prog(f, 2, 18, INOUT)) * 900}px)`}}>
        <WaPhone x={SAFE_CX - 330} y={R.y + 10} w={660} h={920}>
          <WaBubble f={f} start={Math.min(wa - 6, 30)} time="09:02">⚠️ Ta pub <b>« Bracelet trèfle »</b> s’essouffle : fréquence en hausse, clics en baisse.</WaBubble>
          <WaBubble f={f} start={cr - 4} time="09:02" img="chat/jwel/nb2.png">✨ 3 nouvelles créas sont prêtes.</WaBubble>
          <WaButtons f={f} start={cr + 8} labels={['Voir les créas', 'Remplacer']} />
        </WaPhone>
      </div>
      <Sticker at={wa} rot={-7} size={40} bg="linear-gradient(120deg,#19A866,#25D366)" style={{left: R.x - 10, top: 1080}}>
        Sur WhatsApp
      </Sticker>
    </StudioBg>
  );
};

// « Et chaque lundi, votre bilan de la semaine, en un seul message. »
export const S7Report: React.FC<SceneProps> = ({lines}) => {
  const f = useCurrentFrame();
  const bil = wordAt(lines[0], 'bilan', 30);
  const rows = ['💶 Dépenses de la semaine', '🎯 Résultats obtenus', '🏆 Meilleure pub', '💡 Le conseil de la semaine'];
  return (
    <LightBg>
      <div style={{position: 'absolute', left: R.x, width: R.w, top: R.y + 10}}>
        <Title text="Chaque *lundi*, votre bilan" start={2} step={4} size={86} color={C.ink} />
      </div>
      <WaPhone x={SAFE_CX - 330} y={480} w={660} h={640}>
        <WaBubble f={f} start={Math.min(bil, 24)} time="Lun. 08:30">
          <b>👋 Ton bilan de la semaine</b>
          {rows.map((r, i) => <div key={r} style={{fontSize: 27, marginTop: 8, opacity: prog(f, Math.min(bil, 24) + 8 + i * 6, 8)}}>{r}</div>)}
        </WaBubble>
      </WaPhone>
    </LightBg>
  );
};

export const S7End: React.FC<SceneProps> = ({dur}) => (
  <EndCard dur={dur} tagline={<>Votre media buyer,<br /><span style={gradText()}>sur WhatsApp.</span></>} />
);
