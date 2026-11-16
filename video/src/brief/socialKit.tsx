// Maquettes partagées : téléphone WhatsApp (alertes Growthity) et calendrier de publications.
import React from 'react';
import {Img, spring, staticFile} from 'remotion';
import {DISPLAY, INK, MUTED} from '../chatpub/SplitChat';
import {Logo} from './BriefAndromeda';

export const WA_DARK = '#075E54';
export const WA_GREEN = '#128C4B';
export const sp = (f: number, d = 12) => spring({frame: f, fps: 30, config: {damping: d}});
export type Word = {w: string; s: number; e: number};
export const at = (words: Word[], k: string, d = 1, n = 0) => { const w = words.filter((x) => x.w.toLowerCase().includes(k))[n]; return Math.round(((w?.s ?? d) - 0.1) * 30); };

export const WaPhone: React.FC<{x: number; y: number; w: number; h: number; children: React.ReactNode; style?: React.CSSProperties}> = ({x, y, w, h, children, style}) => (
  <div style={{fontFamily: '"Inter", system-ui, sans-serif', position: 'absolute', left: x, top: y, width: w, height: h, borderRadius: 56, background: '#0B0A0C', padding: 11, boxShadow: '0 50px 90px -40px rgba(15,23,42,0.6)', ...style}}>
    <div style={{width: '100%', height: '100%', borderRadius: 46, overflow: 'hidden', background: '#ECE5DD', display: 'flex', flexDirection: 'column'}}>
      <div style={{background: WA_DARK, color: '#fff', padding: '28px 24px 18px', display: 'flex', alignItems: 'center', gap: 14}}>
        <div style={{width: 54, height: 54, borderRadius: 27, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Logo s={34} /></div>
        <div><div style={{fontWeight: 800, fontSize: 28}}>Growthity</div><div style={{fontSize: 19, opacity: 0.8}}>Compte professionnel</div></div>
      </div>
      <div style={{flex: 1, padding: 20, display: 'flex', flexDirection: 'column', gap: 14}}>{children}</div>
    </div>
  </div>
);

export const WaBubble: React.FC<{f: number; start: number; time?: string; children: React.ReactNode; img?: string}> = ({f, start, time = '09:02', children, img}) => {
  if (f < start) return null;
  const p = sp(f - start, 13);
  return (
    <div style={{alignSelf: 'flex-start', maxWidth: '92%', background: '#fff', borderRadius: '6px 22px 22px 22px', padding: img ? 8 : '14px 18px 8px', boxShadow: '0 1px 1px rgba(0,0,0,0.12)', fontSize: 27, lineHeight: 1.35, color: '#111', transform: `translateY(${(1 - p) * 30}px) scale(${0.9 + p * 0.1})`, opacity: p, transformOrigin: 'left top'}}>
      {img && <div style={{height: 210, borderRadius: 14, overflow: 'hidden', marginBottom: 8}}><Img src={staticFile(`media/${img}`)} style={{width: '100%', height: '100%', objectFit: 'cover'}} /></div>}
      <div style={{padding: img ? '0 10px' : 0}}>{children}</div>
      <div style={{textAlign: 'right', fontSize: 18, color: '#8A8F94', marginTop: 2, padding: img ? '0 10px 4px' : 0}}>{time} ✓✓</div>
    </div>
  );
};

export const WaButtons: React.FC<{f: number; start: number; labels: string[]}> = ({f, start, labels}) => (
  <div style={{display: 'flex', gap: 10, opacity: sp(f - start)}}>
    {labels.map((b) => <span key={b} style={{flex: 1, textAlign: 'center', background: '#fff', borderRadius: 14, padding: '14px 0', fontWeight: 800, fontSize: 24, color: WA_GREEN}}>{b}</span>)}
  </div>
);

// notification façon écran verrouillé
export const WaNotif: React.FC<{f: number; start: number; title?: string; text: string; style?: React.CSSProperties}> = ({f, start, title = 'Growthity', text, style}) => {
  if (f < start) return null;
  const p = sp(f - start, 11);
  return (
    <div style={{fontFamily: '"Inter", system-ui, sans-serif', position: 'absolute', display: 'flex', gap: 16, alignItems: 'center', padding: '20px 24px', borderRadius: 28, background: 'rgba(255,255,255,0.96)', boxShadow: '0 30px 60px -30px rgba(15,23,42,0.55)', transform: `translateY(${(1 - p) * -60}px)`, opacity: p, ...style}}>
      <div style={{width: 60, height: 60, borderRadius: 16, background: '#25D366', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
        <svg width="36" height="36" viewBox="0 0 24 24"><path fill="#fff" d="M12 2a10 10 0 0 0-8.7 14.9L2 22l5.3-1.3A10 10 0 1 0 12 2zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7-2.8-1.1-4.6-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.9s.7-2 1-2.3c.3-.3.6-.3.8-.3h.6c.2 0 .4 0 .6.5l.9 2.1c.1.2.1.4 0 .6l-.4.6-.4.4c-.1.2-.3.3-.1.6.2.3.7 1.2 1.6 2 1.1 1 2 1.3 2.3 1.4.3.1.5.1.6-.1l.9-1c.2-.3.4-.2.7-.1l2 1c.3.1.5.2.6.3.1.2.1.8-.1 1.4z" /></svg>
      </div>
      <div style={{minWidth: 0}}>
        <div style={{display: 'flex', gap: 10, alignItems: 'baseline'}}><b style={{fontSize: 26, color: INK}}>{title}</b><span style={{fontSize: 20, color: MUTED}}>WhatsApp · maintenant</span></div>
        <div style={{fontSize: 25, color: INK, marginTop: 2, lineHeight: 1.3}}>{text}</div>
      </div>
    </div>
  );
};

// calendrier du mois avec posts qui se posent un par un
const DEF_THUMBS: [number, string][] = [[2, 'chat/batch/g3.png'], [4, 'chat/jwel/nb1.png'], [7, 'chat/roast6/burger.png'], [9, 'chat/batch/g5.png'], [11, 'chat/jwel/ad-cercle.jpg'], [14, 'chat/batch/g6.png'], [16, 'chat/batch/g2.png'], [18, 'chat/jwel/nb1.png'], [21, 'chat/batch/g1.png'], [23, 'chat/roast6/burger.png'], [25, 'chat/batch/g4.png'], [28, 'chat/jwel/ad-cercle.jpg']];
export const CalGrid: React.FC<{f: number; start: number; x: number; y: number; w: number; step?: number; thumbs?: [number, string][]; month?: string}> = ({f, start, x, y, w, step = 4, thumbs = DEF_THUMBS, month = 'Décembre'}) => {
  const cell = (w - 36) / 7;
  const map = new Map(thumbs.map(([d, s], i) => [d, {s, i}]));
  return (
    <div style={{fontFamily: '"Inter", system-ui, sans-serif', position: 'absolute', left: x, top: y, width: w, background: '#fff', borderRadius: 30, padding: 18, border: '2px solid #E5E7EB', boxShadow: '0 30px 60px -32px rgba(15,23,42,0.5)'}}>
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '2px 4px 12px'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 10, fontFamily: DISPLAY, fontWeight: 700, fontSize: 30, color: INK}}><Logo s={30} /> {month}</div>
        <div style={{display: 'flex', gap: 6}}>
          {[['IG', '#E1306C'], ['FB', '#0866FF'], ['TT', '#111']].map(([t, c]) => <span key={t} style={{fontSize: 18, fontWeight: 800, color: '#fff', background: c, borderRadius: 8, padding: '3px 8px'}}>{t}</span>)}
        </div>
      </div>
      <div style={{display: 'grid', gridTemplateColumns: `repeat(7, ${cell}px)`}}>
        {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => <div key={i} style={{textAlign: 'center', fontSize: 18, fontWeight: 700, color: MUTED, paddingBottom: 6}}>{d}</div>)}
        {Array.from({length: 35}).map((_, i) => {
          const n = i + 1; const t = map.get(n);
          const p = t ? sp(f - start - t.i * step, 11) : 0;
          return (
            <div key={i} style={{height: cell * 0.9, borderTop: '1.5px solid #EEF0F4', padding: 4, position: 'relative'}}>
              <div style={{fontSize: 15, fontWeight: 700, color: n > 31 ? '#CBD5E1' : MUTED}}>{n > 31 ? n - 31 : n}</div>
              {t && p > 0.01 && <div style={{position: 'absolute', left: 5, right: 5, top: 24, bottom: 5, borderRadius: 9, overflow: 'hidden', borderLeft: '4px solid #5B3FE4', transform: `scale(${p}) translateY(${(1 - p) * -40}px)`}}><Img src={staticFile(`media/${t.s}`)} style={{width: '100%', height: '100%', objectFit: 'cover'}} /></div>}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// rangées « réseau · heure · Programmé »
export const NetRows: React.FC<{f: number; start: number; x: number; y: number; w: number; rows?: {n: string; c: string; h: string}[]}> = ({f, start, x, y, w, rows = [{n: 'Instagram', c: '#E1306C', h: 'Mar. 18:30'}, {n: 'Facebook', c: '#0866FF', h: 'Mar. 18:30'}, {n: 'TikTok', c: '#111', h: 'Mer. 12:15'}]}) => (
  <div style={{fontFamily: '"Inter", system-ui, sans-serif', position: 'absolute', left: x, top: y, width: w, display: 'flex', flexDirection: 'column', gap: 14}}>
    {rows.map((r, i) => { const p = sp(f - start - i * 5); return (
      <div key={r.n} style={{display: 'flex', alignItems: 'center', gap: 16, background: '#fff', borderRadius: 22, padding: '18px 22px', border: '2px solid #E5E7EB', transform: `translateX(${(1 - p) * 120}px)`, opacity: p}}>
        <div style={{width: 18, height: 18, borderRadius: 9, background: r.c}} />
        <div style={{flex: 1, fontWeight: 800, fontSize: 32, color: INK}}>{r.n}</div>
        <div style={{fontSize: 26, fontWeight: 700, color: MUTED}}>{r.h}</div>
        <span style={{fontSize: 22, fontWeight: 800, color: '#127A4B', background: '#DDF4E7', padding: '6px 14px', borderRadius: 999}}>Programmé</span>
      </div>); })}
  </div>
);

// frise « sprint » vs « régulier » (12 semaines)
export const RhythmRows: React.FC<{f: number; start: number; x: number; y: number; w: number}> = ({f, start, x, y, w}) => {
  const rows = [
    {l: 'Tous les jours… puis plus rien', c: '#DC2626', dots: Array.from({length: 28}, (_, i) => (i < 12 ? 1 : 0))},
    {l: 'Un rythme tenu toute l’année', c: '#16A34A', dots: Array.from({length: 28}, (_, i) => (i % 7 === 0 || i % 7 === 2 || i % 7 === 4 ? 1 : 0))},
  ];
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, display: 'flex', flexDirection: 'column', gap: 46}}>
      {rows.map((r, ri) => (
        <div key={r.l}>
          <div style={{fontWeight: 800, fontSize: 32, color: r.c, marginBottom: 14, opacity: sp(f - start - ri * 20)}}>{r.l}</div>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(14, 1fr)', gap: 8}}>
            {r.dots.map((d, k) => <div key={k} style={{height: 46, borderRadius: 10, background: d ? r.c : '#E5E7EB', transform: `scale(${sp(f - start - ri * 20 - k * 1.2)})`}} />)}
          </div>
        </div>
      ))}
    </div>
  );
};
