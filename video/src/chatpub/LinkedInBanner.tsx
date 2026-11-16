// Bannière LinkedIn (page entreprise) Growthity — 1128×191 (rendue en ×2 : 2256×382).
// Le logo de la page recouvre le coin bas-gauche sur ordinateur : rien d'important dans les 300 premiers px.
// Sur mobile, les côtés sont rognés : le message reste au centre.
import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {FONT, DISPLAY, useFonts} from './SplitChat';

const GRAD_TXT = 'linear-gradient(100deg, #8FA6FF 0%, #A78BFF 45%, #E39BFF 100%)';
const FACES = ['aicha', 'adrien', 'naomi', 'alice'];

export const LinkedInBanner: React.FC<{scale?: number}> = ({scale = 2}) => {
  useFonts();
  return (
    <AbsoluteFill style={{background: '#0B0A1F', overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: 0, top: 0, width: 1128, height: 191, transform: `scale(${scale})`, transformOrigin: '0 0', fontFamily: FONT, background: 'radial-gradient(70% 140% at 55% 50%, #3B2BB8 0%, #1E1B4B 50%, #0B0A1F 100%)', overflow: 'hidden'}}>
        <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(30% 60% at 35% 40%, rgba(37,99,235,0.35), transparent 70%), radial-gradient(30% 60% at 78% 60%, rgba(147,51,234,0.35), transparent 70%)'}} />
        {/* grille légère */}
        <div style={{position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)', backgroundSize: '24px 24px'}} />

        {/* message central */}
        <div style={{position: 'absolute', left: 270, top: 0, height: 191, display: 'flex', alignItems: 'center', gap: 16}}>
          <Img src={staticFile('media/chat/banner/logo.svg')} style={{width: 66, height: 66, flexShrink: 0, filter: 'drop-shadow(0 10px 20px rgba(91,63,228,0.8))'}} />
          <div style={{color: '#fff'}}>
            <div style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 40, lineHeight: 1, letterSpacing: '-0.03em'}}>Growthity <span style={{backgroundImage: GRAD_TXT, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>AI</span></div>
            <div style={{fontSize: 15.5, fontWeight: 700, marginTop: 7, lineHeight: 1.15, whiteSpace: 'nowrap'}}>
              Vos pubs Meta <span style={{backgroundImage: GRAD_TXT, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>créées, publiées et pilotées par l’IA.</span>
            </div>
            <div style={{display: 'flex', gap: 6, marginTop: 10}}>
              {['🎬 Acteurs réalistes', '📈 Media buyer IA', '📅 Réseaux programmés'].map((t) => (
                <div key={t} style={{padding: '4px 9px', borderRadius: 99, background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.25)', fontSize: 10.5, fontWeight: 600, whiteSpace: 'nowrap'}}>{t}</div>
              ))}
            </div>
          </div>
        </div>

        {/* acteurs à droite */}
        <div style={{position: 'absolute', right: 24, top: -6, height: 191, display: 'flex', alignItems: 'center', gap: 8}}>
          {FACES.map((n, i) => (
            <div key={n} style={{width: 56, height: 100, borderRadius: 11, overflow: 'hidden', border: '2px solid rgba(255,255,255,0.85)', transform: `rotate(${[-6, 4, -3, 5][i]}deg) translateY(${[4, -8, 4, -6][i]}px)`, boxShadow: '0 14px 26px -10px rgba(0,0,0,0.7)'}}>
              <Img src={staticFile(`media/chat/banner/${n}.jpg`)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
            </div>
          ))}
        </div>
        <div style={{position: 'absolute', right: 30, bottom: 10, fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.6)'}}>growthity.ai · Conçu et hébergé en France</div>
      </div>
    </AbsoluteFill>
  );
};
