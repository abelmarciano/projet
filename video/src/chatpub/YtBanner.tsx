// Bannière YouTube Growthity — 2560×1440. Texte et logo dans la zone sûre centrale (1546×423, visible partout) ;
// mosaïque d'acteurs réalistes sur les côtés (visible sur ordinateur et TV).
import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {FONT, DISPLAY, useFonts} from './SplitChat';

const L = ['aicha', 'steve', 'kenza', 'adrien'];
const R = ['naomi', 'marion', 'alice', 'kenji'];

const Tile: React.FC<{n: string; x: number; y: number; r: number; s?: number}> = ({n, x, y, r, s = 1}) => (
  <div style={{position: 'absolute', left: x, top: y, width: 250 * s, height: 444 * s, borderRadius: 34, overflow: 'hidden', transform: `rotate(${r}deg)`, border: '6px solid rgba(255,255,255,0.9)', boxShadow: '0 40px 80px -20px rgba(0,0,0,0.6)'}}>
    <Img src={staticFile(`media/chat/banner/${n}.jpg`)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
  </div>
);

export const YtBanner: React.FC = () => {
  useFonts();
  return (
    <AbsoluteFill style={{background: 'radial-gradient(90% 120% at 50% 50%, #3B2BB8 0%, #1E1B4B 48%, #0B0A1F 100%)', fontFamily: FONT, overflow: 'hidden'}}>
      {/* grain de lumière */}
      <AbsoluteFill style={{background: 'radial-gradient(40% 30% at 30% 40%, rgba(37,99,235,0.35), transparent 70%), radial-gradient(40% 30% at 72% 62%, rgba(147,51,234,0.35), transparent 70%)'}} />
      {/* mosaïques latérales */}
      {L.map((n, i) => <Tile key={n} n={n} x={[70, 300, 40, 300][i]} y={[180, 330, 690, 850][i]} r={[-8, 4, 6, -5][i]} s={i % 2 ? 0.95 : 1} />)}
      {R.map((n, i) => <Tile key={n} n={n} x={[2240, 1990, 2270, 2000][i]} y={[200, 340, 700, 860][i]} r={[7, -4, -6, 5][i]} s={i % 2 ? 0.95 : 1} />)}
      {/* zone sûre 1546×423 */}
      <div style={{position: 'absolute', left: 507, top: 508, width: 1546, height: 423, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 56}}>
        <Img src={staticFile('media/chat/banner/logo.svg')} style={{width: 230, height: 230, flexShrink: 0, filter: 'drop-shadow(0 30px 60px rgba(91,63,228,0.8))'}} />
        <div style={{color: '#fff'}}>
          <div style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 150, lineHeight: 0.95, letterSpacing: '-0.03em'}}>Growthity <span style={{backgroundImage: 'linear-gradient(100deg, #8FA6FF 0%, #A78BFF 45%, #E39BFF 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>AI</span></div>
          <div style={{fontSize: 54, fontWeight: 700, marginTop: 18, lineHeight: 1.1}}>
            Une phrase. <span style={{backgroundImage: 'linear-gradient(100deg, #8FA6FF 0%, #A78BFF 45%, #E39BFF 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>Ta pub Meta est prête.</span>
          </div>
          <div style={{display: 'flex', gap: 14, marginTop: 26}}>
            {['Acteurs IA réalistes', 'Voix & sous-titres', 'Publication Meta'].map((t) => (
              <div key={t} style={{padding: '12px 24px', borderRadius: 99, background: 'rgba(255,255,255,0.12)', border: '2px solid rgba(255,255,255,0.25)', fontSize: 30, fontWeight: 600}}>{t}</div>
            ))}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
