// Growthity design tokens, mirrored from the app's src/styles.css
export const C = {
  blue: '#2563EB',
  indigo: '#5B3FE4',
  purple: '#9333EA',
  pink: '#E0479E',
  primary: '#6552E8',
  ink: '#0F172A',
  slate: '#475569',
  hairline: '#E7E9EF',
  mist: '#F1F3F9',
  white: '#FFFFFF',
  meta: '#0866FF',
  studio: '#0B0A0C',
  success: '#22C17A',
  successBg: '#E3F8EE',
  warning: '#F5B83D',
};

export const GRAD = `linear-gradient(120deg, ${C.blue} 0%, ${C.indigo} 52%, ${C.purple} 100%)`;
export const GRAD_PINK = `linear-gradient(100deg, ${C.indigo} 0%, ${C.purple} 55%, ${C.pink} 100%)`;

export const FONT = '"Inter", system-ui, sans-serif';
export const DISPLAY = '"Space Grotesk", "Inter", sans-serif';

export const SHADOW_EDITORIAL =
  '0 1px 0 0 rgba(15,23,42,0.04), 0 1px 2px 0 rgba(15,23,42,0.04), 0 30px 60px -30px rgba(15,23,42,0.25)';
export const SHADOW_ELEGANT = '0 40px 120px -40px rgba(37,99,235,0.45)';
export const SHADOW_STUDIO =
  '0 60px 140px -50px rgba(0,0,0,0.9), 0 30px 70px -40px rgba(101,82,232,0.55)';

export const FPS = 30;
