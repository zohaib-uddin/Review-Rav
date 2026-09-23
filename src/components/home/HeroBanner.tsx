import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const slides = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=1920&h=1080&fit=crop',
    alt: 'Fashion Editorial 1'
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=1920&h=1080&fit=crop',
    alt: 'Fashion Editorial 2'
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=1920&h=1080&fit=crop',
    alt: 'Fashion Editorial 3'
  },
];

export default function HeroBanner() {
  const [current, setCurrent] = useState(0);

  // Auto-advance loop every 2 seconds (2000ms) with smooth transitions
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  const next = () => setCurrent((prev) => (prev + 1) % slides.length);
  const prev = () => setCurrent((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <section className="relative w-full h-[88vh] sm:h-[92vh] md:h-[96vh] min-h-[640px] overflow-hidden bg-neutral-950 select-none">
      {/* Background Image Carousel with smooth sliding / crossfade */}
      <AnimatePresence mode="wait">
        <motion.div
          key={slides[current].id}
          initial={{ opacity: 0, scale: 1.03 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.7, ease: [0.25, 1, 0.5, 1] }}
          className="absolute inset-0 w-full h-full"
        >
          <img
            src={slides[current].image}
            alt={slides[current].alt}
            className="w-full h-full object-cover object-center"
          />
        </motion.div>
      </AnimatePresence>

      {/* Navigation Controls: Clean Minimalist Left / Right Arrows */}
      <button
        onClick={prev}
        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 p-3 bg-black/20 hover:bg-black/50 text-white rounded-full backdrop-blur-sm border border-white/10 transition-all opacity-80 hover:opacity-100 active:scale-95"
        aria-label="Previous Slide"
      >
        <ChevronLeft size={26} strokeWidth={2} />
      </button>

      <button
        onClick={next}
        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 p-3 bg-black/20 hover:bg-black/50 text-white rounded-full backdrop-blur-sm border border-white/10 transition-all opacity-80 hover:opacity-100 active:scale-95"
        aria-label="Next Slide"
      >
        <ChevronRight size={26} strokeWidth={2} />
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2.5">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`transition-all duration-300 rounded-full h-1.5 ${
              i === current ? 'w-8 bg-white shadow-lg' : 'w-2 bg-white/40 hover:bg-white/70'
            }`}
          />
        ))}
      </div>
    </section>
  );
}
