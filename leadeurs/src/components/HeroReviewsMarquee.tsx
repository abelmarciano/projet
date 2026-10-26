import { useEffect, useRef, useState, type CSSProperties } from "react";

interface HeroReviewsMarqueeProps {
  images: string[];
  pixelsPerSecond?: number;
}

const HeroReviewsMarquee = ({ images, pixelsPerSecond = 42 }: HeroReviewsMarqueeProps) => {
  const firstGroupRef = useRef<HTMLDivElement>(null);
  const [loadedCount, setLoadedCount] = useState(0);
  const [distance, setDistance] = useState(0);

  useEffect(() => {
    const node = firstGroupRef.current;
    if (!node) return;

    const syncLoadedImages = () => {
      const completeImages = Array.from(node.querySelectorAll("img")).filter((img) => img.complete).length;
      setLoadedCount(Math.min(completeImages, images.length));
    };

    const measure = () => {
      requestAnimationFrame(() => {
        const width = firstGroupRef.current?.scrollWidth ?? 0;
        if (width > 0) {
          setDistance(Math.round(width));
        }
      });
    };

    syncLoadedImages();
    measure();

    const resizeObserver = typeof ResizeObserver !== "undefined" ? new ResizeObserver(measure) : null;
    resizeObserver?.observe(node);
    window.addEventListener("resize", measure);

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [images.length]);

  const isReady = loadedCount >= images.length && distance > 0;
  const duration = distance > 0 ? Math.max(distance / pixelsPerSecond, 14) : 20;

  const marqueeStyle = {
    "--hero-marquee-distance": `${distance}px`,
    "--hero-marquee-duration": `${duration}s`,
  } as CSSProperties;

  return (
    <div className="hero-reviews-marquee-viewport">
      <div className="hero-reviews-marquee-track" data-ready={isReady ? "true" : "false"} style={marqueeStyle}>
        {[0, 1].map((groupIndex) => (
          <div
            key={groupIndex}
            ref={groupIndex === 0 ? firstGroupRef : undefined}
            className="hero-reviews-marquee-group"
            aria-hidden={groupIndex === 1}
          >
            {images.map((src, index) => (
              <img
                key={`${groupIndex}-${index}`}
                src={src}
                alt={`Avis client ${index + 1}`}
                className="h-20 sm:h-22 md:h-24 w-auto rounded-lg md:rounded-xl border border-white/10 shadow-lg flex-shrink-0 object-cover"
                loading="eager"
                decoding="async"
                draggable={false}
                onLoad={groupIndex === 0 ? () => setLoadedCount((count) => Math.min(count + 1, images.length)) : undefined}
                onError={groupIndex === 0 ? () => setLoadedCount((count) => Math.min(count + 1, images.length)) : undefined}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default HeroReviewsMarquee;
