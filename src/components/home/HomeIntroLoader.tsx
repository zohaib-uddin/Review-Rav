import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import logoWhite from '../../images/load-logo.svg';
import logoBlack from '../../images/logo.svg';

interface HomeIntroLoaderProps {
  onComplete?: () => void;
}

export default function HomeIntroLoader({ onComplete }: HomeIntroLoaderProps) {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<'loading' | 'ready' | 'flying' | 'docked'>('loading');
  const [isDone, setIsDone] = useState(false);

  // Exact target coordinates and scale measured from the navbar logo
  const [flightTarget, setFlightTarget] = useState({
    x: 0,
    y: -300,
    scale: 0.72,
    targetWidth: 280,
    targetHeight: 58,
  });

  const logoRef = useRef<HTMLDivElement>(null);

  // Measure exact position, width, and height of navbar brand logo in the DOM
  const measureTarget = () => {
    const navLogoEl =
      document.getElementById('navbar-brand-logo-img') ||
      document.getElementById('navbar-brand-logo');
    const flyingEl = logoRef.current;

    if (navLogoEl && flyingEl) {
      const navRect = navLogoEl.getBoundingClientRect();
      const flyingRect = flyingEl.getBoundingClientRect();

      if (navRect.width > 0 && flyingRect.width > 0) {
        const targetCenterX = navRect.left + navRect.width / 2;
        const targetCenterY = navRect.top + navRect.height / 2;

        const currentCenterX = flyingRect.left + flyingRect.width / 2;
        const currentCenterY = flyingRect.top + flyingRect.height / 2;

        const deltaX = targetCenterX - currentCenterX;
        const deltaY = targetCenterY - currentCenterY;

        // Exact scale ratio so flying element matches the navbar logo's width & height down to the exact subpixel!
        const exactScale = navRect.width / flyingRect.width;

        setFlightTarget({
          x: deltaX,
          y: deltaY,
          scale: exactScale,
          targetWidth: navRect.width,
          targetHeight: navRect.height,
        });
        return;
      }
    }

    // Responsive fallback if navbar is still measuring
    const isMobile = window.innerWidth < 640;
    const isTablet = window.innerWidth < 1024;
    const fallbackNavW = isMobile ? 210 : isTablet ? 260 : 310;
    const baseW = isMobile ? 280 : 360;
    const fallbackY = -window.innerHeight / 2 + (isMobile ? 56 : 68);

    setFlightTarget({
      x: 0,
      y: fallbackY,
      scale: fallbackNavW / baseW,
      targetWidth: fallbackNavW,
      targetHeight: fallbackNavW / 4.737,
    });
  };

  useEffect(() => {
    // Initial measurement after DOM mount
    measureTarget();
    const t = setTimeout(measureTarget, 100);
    window.addEventListener('resize', measureTarget);
    return () => {
      clearTimeout(t);
      window.removeEventListener('resize', measureTarget);
    };
  }, []);

  useEffect(() => {
    // Stage 1: Progress counter from 0 to 100% over ~1.4 seconds
    const startTime = Date.now();
    const duration = 1400;

    const updateProgress = () => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.round((elapsed / duration) * 100));
      setProgress(pct);

      if (pct < 100) {
        requestAnimationFrame(updateProgress);
      } else {
        // Stage 2: 100% reached -> measure navbar logo again and zoom away progress bar
        setTimeout(() => {
          measureTarget();
          setPhase('ready');
        }, 100);

        // Stage 3: After brief pause, begin the grand, leisurely, smooth flight!
        setTimeout(() => {
          measureTarget();
          setPhase('flying');
        }, 320);

        // Stage 4: Flying completes smoothly (~1.4s flight duration)
        // Hand off to navbar logo right at arrival
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('intro-logo-docked'));
          setPhase('docked');
        }, 1750); // 320ms + 1430ms

        // Stage 5: Final cleanup and unmount
        setTimeout(() => {
          setIsDone(true);
          onComplete?.();
        }, 1900);
      }
    };

    const animId = requestAnimationFrame(updateProgress);
    return () => cancelAnimationFrame(animId);
  }, [onComplete]);

  if (isDone) return null;

  const isFlyingOrDocked = phase === 'flying' || phase === 'docked';
  const isReadyOrFlying = phase === 'ready' || isFlyingOrDocked;

  return (
    <AnimatePresence>
      {!isDone && (
        <div className="fixed inset-0 z-[9999] pointer-events-none select-none overflow-hidden">
          {/* 
            Backdrop screen:
            Fades out gently once flight begins, revealing the actual website and navbar underneath
          */}
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: isFlyingOrDocked ? 0 : 1 }}
            transition={{ duration: 0.95, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
            className="absolute inset-0 bg-neutral-950 flex flex-col items-center justify-center pointer-events-auto"
          >
            {/* Ambient luxury radial glow */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08)_0%,transparent_70%)] pointer-events-none" />

            {/* Sleek Loading Bar and Runway Subtitle (zooms and fades away smoothly when 100% is reached) */}
            <motion.div
              initial={{ opacity: 1, scale: 1 }}
              animate={{
                opacity: isReadyOrFlying ? 0 : 1,
                scale: isReadyOrFlying ? 0.8 : 1,
                y: isReadyOrFlying ? 25 : 0,
              }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="absolute bottom-24 sm:bottom-28 w-64 sm:w-72 flex flex-col items-center gap-3 z-10 pointer-events-none"
            >
            </motion.div>
          </motion.div>

          {/* 
            THE FLYING LOGO CONTAINER:
            Positioned in the middle of viewport, then flies leisurely, visibly, and smoothly
            upwards into the exact navbar brand logo position!
            Target position, width, and height precisely match the navbar logo!
          */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <motion.div
              ref={logoRef}
              initial={{ x: 0, y: 0, scale: 0.95, opacity: 0 }}
              animate={
                isFlyingOrDocked
                  ? {
                      x: flightTarget.x,
                      y: flightTarget.y,
                      scale: flightTarget.scale,
                      opacity: phase === 'docked' ? 0 : 1, // Seamless handoff to navbar logo
                    }
                  : {
                      x: 0,
                      y: 0,
                      scale: 1,
                      opacity: 1,
                    }
              }
              transition={
                isFlyingOrDocked
                  ? {
                      // Silky smooth luxury flying animation: 1.4s duration for leisurely visible flight
                      x: { duration: 1.4, ease: [0.16, 1, 0.3, 1] },
                      y: { duration: 1.4, ease: [0.16, 1, 0.3, 1] },
                      scale: { duration: 1.4, ease: [0.16, 1, 0.3, 1] },
                      opacity: { duration: 0.25, ease: 'easeOut' },
                    }
                  : {
                      scale: { duration: 0.5, ease: 'easeOut' },
                      opacity: { duration: 0.35 },
                    }
              }
              className="relative w-64 sm:w-80 md:w-96 max-w-[85vw] h-auto flex items-center justify-center z-30"
              style={{
                transformOrigin: 'center center',
              }}
            >
              {/* White Logo (Visible on dark backdrop, fades out as it enters the bright navbar) */}
              <motion.img
                src={logoWhite}
                alt="RAVENZA"
                animate={{
                  opacity: isFlyingOrDocked ? 0 : 1,
                }}
                transition={{
                  duration: isFlyingOrDocked ? 0.75 : 0.2,
                  delay: isFlyingOrDocked ? 0.25 : 0,
                  ease: 'easeInOut',
                }}
                className="w-full h-auto object-contain filter drop-shadow-[0_8px_24px_rgba(255,255,255,0.22)] select-none pointer-events-none"
              />

              {/* Black Brand Logo (Fades in as it approaches the light navbar so it matches navbar perfectly!) */}
              <motion.img
                src={logoBlack}
                alt="RAVENZA"
                initial={{ opacity: 0 }}
                animate={{
                  opacity: isFlyingOrDocked ? 1 : 0,
                }}
                transition={{
                  duration: 0.7,
                  delay: 0.3,
                  ease: 'easeInOut',
                }}
                className="absolute inset-0 w-full h-auto object-contain select-none pointer-events-none"
              />
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
