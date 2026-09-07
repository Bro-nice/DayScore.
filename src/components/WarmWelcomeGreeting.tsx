import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface WarmWelcomeGreetingProps {
  displayName?: string | null;
  email?: string | null;
}

export const WarmWelcomeGreeting: React.FC<WarmWelcomeGreetingProps> = ({ displayName }) => {
  const [isVisible, setIsVisible] = useState(() => {
    // Only display once per session to guarantee buttery-smooth startup
    try {
      const alreadyShown = sessionStorage.getItem('reflect_welcome_shown_session');
      if (alreadyShown === 'true') {
        return false;
      }
      sessionStorage.setItem('reflect_welcome_shown_session', 'true');
      return true;
    } catch {
      return true;
    }
  });

  const firstName = useMemo(() => {
    if (!displayName) return null;
    const trimmed = displayName.trim();
    if (!trimmed) return null;
    const first = trimmed.split(' ')[0];
    return first.charAt(0).toUpperCase() + first.slice(1);
  }, [displayName]);

  // Display for 1.8 seconds, then smoothly dissolve away
  useEffect(() => {
    if (!isVisible) return;
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 1800);

    return () => clearTimeout(timer);
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ 
            opacity: 0, 
            scale: 0.98,
            transition: { duration: 0.5, ease: 'easeOut' } 
          }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          onClick={() => setIsVisible(false)}
          className="fixed inset-0 z-50 pointer-events-none flex flex-col items-center justify-center select-none"
          style={{ willChange: 'opacity, transform', transform: 'translateZ(0)' }}
        >
          {/* Lightweight, hardware-accelerated dark overlay with smooth gradient */}
          <div className="absolute inset-0 bg-slate-950/75 pointer-events-none transition-opacity duration-300">
            <div className="absolute inset-0 bg-gradient-to-b from-violet-950/30 via-slate-950/50 to-fuchsia-950/30 pointer-events-none" />
          </div>

          {/* Optimized soft ambient radial glow using pure CSS gradient */}
          <div 
            className="absolute w-[420px] h-[420px] rounded-full bg-gradient-to-tr from-violet-600/30 via-fuchsia-500/25 to-sky-400/20 blur-2xl pointer-events-none transform -translate-y-4" 
            style={{ willChange: 'transform' }}
          />

          <div className="relative flex flex-col items-center justify-center text-center px-4 w-full max-w-2xl">
            {/* Elegant, buttery-smooth Cursive Typography */}
            <div className="relative w-full flex flex-col items-center justify-center">
              <motion.h1
                initial={{ opacity: 0, scale: 0.92, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="font-cursive text-6xl sm:text-7xl md:text-8xl font-normal text-white drop-shadow-[0_0_24px_rgba(192,132,252,0.65)]"
                style={{
                  fontFamily: '"Sacramento", "Great Vibes", "Caveat", cursive',
                  letterSpacing: '0.02em',
                }}
              >
                welcome back
              </motion.h1>

              {/* Sub-greeting badge if student name is available */}
              {firstName && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: 0.25, ease: 'easeOut' }}
                  className="mt-3"
                >
                  <span className="text-xs sm:text-sm font-black tracking-widest text-violet-200 uppercase bg-violet-950/70 border border-violet-400/30 px-4 py-1.5 rounded-full shadow-lg">
                    ✨ {firstName}
                  </span>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
