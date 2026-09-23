import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const HERO_IMAGES = [
  'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1920&h=1080&fit=crop',
  'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=1920&h=1080&fit=crop',
  'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1920&h=1080&fit=crop',
];

export default function ShopAllHero() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % HERO_IMAGES.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + HERO_IMAGES.length) % HERO_IMAGES.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  return (
    <div className="relative w-full h-[65vh] sm:h-[75vh] md:h-[80vh] bg-neutral-950 overflow-hidden select-none">
      {/* Images Carousel */}
      <AnimatePresence initial={false} mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 1.03 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0"
        >
          <img
            src={HERO_IMAGES[currentIndex]}
            alt={`Shop All Editorial ${currentIndex + 1}`}
            className="w-full h-full object-cover object-center"
            loading="eager"
          />
        </motion.div>
      </AnimatePresence>

      {/* Subtle bottom gradient for smooth transition */}
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />

      {/* Minimalist Navigation Arrows: Left / Right (Pure white icons with drop-shadow, no text/badges) */}
      <button
        type="button"
        onClick={prevSlide}
        className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 p-2 text-white/90 hover:text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)] hover:scale-110 active:scale-95 transition-all cursor-pointer bg-black/20 hover:bg-black/40 backdrop-blur-[2px] rounded-full border border-white/10"
        aria-label="Previous Slide"
      >
        <ChevronLeft size={28} strokeWidth={2} />
      </button>

      <button
        type="button"
        onClick={nextSlide}
        className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 p-2 text-white/90 hover:text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)] hover:scale-110 active:scale-95 transition-all cursor-pointer bg-black/20 hover:bg-black/40 backdrop-blur-[2px] rounded-full border border-white/10"
        aria-label="Next Slide"
      >
        <ChevronRight size={28} strokeWidth={2} />
      </button>

      {/* Minimal slide indicators */}
      <div className="absolute bottom-6 inset-x-0 z-20 flex items-center justify-center gap-2">
        {HERO_IMAGES.map((_, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setCurrentIndex(idx)}
            className={`transition-all duration-300 rounded-full cursor-pointer ${
              idx === currentIndex
                ? 'w-8 h-1.5 bg-white'
                : 'w-2 h-1.5 bg-white/50 hover:bg-white/80'
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
