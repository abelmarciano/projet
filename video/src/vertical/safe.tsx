import React from 'react';
import {AbsoluteFill} from 'remotion';

// 1080×1920 safe area shared by TikTok, Reels, Facebook Reels and YouTube Shorts:
// top bar (tabs / search), right action column (like, comment, share),
// bottom caption + music strip. Everything that matters stays inside this box.
export const SAFE = {x: 80, y: 250, w: 820, h: 1170};
export const SAFE_R = SAFE.x + SAFE.w; // 900
export const SAFE_B = SAFE.y + SAFE.h; // 1420
export const SAFE_CX = SAFE.x + SAFE.w / 2; // 490

// Debug overlay, only drawn on preview stills
export const SafeOverlay: React.FC = () => {
  const zone: React.CSSProperties = {position: 'absolute', background: 'rgba(255,0,60,0.28)'};
  return (
    <AbsoluteFill style={{pointerEvents: 'none', zIndex: 1000}}>
      <div style={{...zone, left: 0, right: 0, top: 0, height: SAFE.y}} />
      <div style={{...zone, left: 0, right: 0, top: SAFE_B, bottom: 0}} />
      <div style={{...zone, left: 0, width: SAFE.x, top: SAFE.y, height: SAFE.h}} />
      <div style={{...zone, left: SAFE_R, right: 0, top: SAFE.y, height: SAFE.h}} />
    </AbsoluteFill>
  );
};
