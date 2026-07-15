import { useEffect, useRef, useState } from 'react';
import { usePresence } from 'motion/react';

let uid = 0;

/**
 * Sand / particle dissolve using an SVG filter chain
 * (turbulence → displacement → offset → blur → opacity),
 * driven by a requestAnimationFrame loop and usePresence()
 * so it works inside <AnimatePresence>.
 */
export function SandTransitionImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [isPresent, safeToRemove] = usePresence();
  const filterId = useRef(`sand-${uid++}`).current;
  const [progress, setProgress] = useState(0); // 0 = fully visible, 1 = fully dissolved
  const raf = useRef<number | null>(null);

  useEffect(() => {
    const DURATION = 900;
    const start = performance.now();
    const entering = isPresent;

    const tick = (now: number) => {
      const t = Math.min((now - start) / DURATION, 1);
      // entering: quartic ease-out · exiting: cubic
      const eased = entering ? 1 - Math.pow(1 - t, 4) : Math.pow(t, 3);
      setProgress(entering ? 1 - eased : eased);
      if (t < 1) raf.current = requestAnimationFrame(tick);
      else if (!entering) safeToRemove?.();
    };

    raf.current = requestAnimationFrame(tick);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, [isPresent, safeToRemove]);

  const scale = 150 * progress;
  const dy = (isPresent ? -80 : 120) * progress;
  const dx = (isPresent ? -30 : 30) * progress;
  const blur = 6 * progress;
  const opacity = Math.max(0, 1 - progress * 1.2);

  return (
    <>
      <svg width="0" height="0" aria-hidden style={{ position: 'absolute' }}>
        <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
          <feTurbulence type="fractalNoise" baseFrequency="1.8" numOctaves={4} seed={7} result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale={scale} xChannelSelector="R" yChannelSelector="G" result="disp" />
          <feOffset in="disp" dx={dx} dy={dy} result="off" />
          <feGaussianBlur in="off" stdDeviation={blur} result="blur" />
          <feColorMatrix in="blur" type="matrix" values={`1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 ${opacity} 0`} />
        </filter>
      </svg>
      {/* No crossOrigin: the SVG filter doesn't need CORS, and requiring it can
          blank the image on hosts that don't send CORS headers. Add it back only
          if you later read the image into a <canvas>. */}
      <img
        src={src}
        alt={alt}
        referrerPolicy="no-referrer"
        className={className}
        style={{ filter: `url(#${filterId})`, opacity }}
      />
    </>
  );
}
