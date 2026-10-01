import React from 'react';
import {Img, Loop, OffthreadVideo, staticFile} from 'remotion';

// Real Growthity footage / visuals from public/media
export const Clip: React.FC<{
  src: string;
  width: number | string;
  height: number | string;
  muted?: boolean;
  volume?: number | ((f: number) => number);
  startFrom?: number;
  loopFrames?: number;
  playbackRate?: number; // loop clips shorter than their on-screen time
  radius?: number;
  style?: React.CSSProperties;
}> = ({src, width, height, muted = true, volume, startFrom = 0, loopFrames, playbackRate = 1, radius = 0, style}) => {
  const isImg = /\.(webp|png|jpe?g)$/.test(src);
  const common: React.CSSProperties = {width: '100%', height: '100%', objectFit: 'cover', display: 'block'};
  return (
    <div style={{width, height, borderRadius: radius, overflow: 'hidden', position: 'relative', background: '#111', flexShrink: 0, ...style}}>
      {isImg ? (
        <Img src={staticFile(`media/${src}`)} style={common} />
      ) : (
        (() => {
          const v = <OffthreadVideo src={staticFile(`media/${src}`)} muted={muted} volume={volume} startFrom={startFrom} playbackRate={playbackRate} style={common} />;
          return loopFrames ? <Loop durationInFrames={loopFrames}>{v}</Loop> : v;
        })()
      )}
    </div>
  );
};
