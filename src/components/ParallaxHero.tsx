import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface ParallaxHeroProps {
  image: string;
  title: string;
  subtitle?: string;
  height?: string;
  overlay?: boolean;
  children?: React.ReactNode;
}

export default function ParallaxHero({
  image,
  title,
  subtitle,
  height = '80vh',
  overlay = true,
  children,
}: ParallaxHeroProps) {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const parallaxOffset = scrollY * 0.5;

  return (
    <div className="relative overflow-hidden" style={{ height }}>
      {/* Parallax Background */}
      <motion.div
        className="absolute inset-0 w-full h-[120%]"
        style={{
          y: parallaxOffset,
        }}
      >
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover"
        />
      </motion.div>

      {/* Overlay */}
      {overlay && (
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />
      )}

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-white"
        >
          {subtitle && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-sm md:text-base uppercase tracking-widest mb-4 text-white/80"
            >
              {subtitle}
            </motion.p>
          )}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 leading-tight"
          >
            {title}
          </motion.h1>
          {children && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              {children}
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-6 h-10 border-2 border-white/50 rounded-full flex items-start justify-center p-2"
        >
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-1 h-2 bg-white/70 rounded-full"
          />
        </motion.div>
      </motion.div>
    </div>
  );
}
