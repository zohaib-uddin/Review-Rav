import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// Import hero banner images
import heroImage1 from '../../images/banner1.jpg'; 
import heroImage2 from '../../images/banner2.jpg'; 
import heroImage3 from '../../images/banner3.jpg'; 

const slides = [
  {
    id: 1,
    image: heroImage1,
    alt: 'Ravenza Streetwear Collection 1'
  },
  {
    id: 2,
    image: heroImage2,
    alt: 'Ravenza Streetwear Collection 2'
  },
  {
    id: 3,
    image: heroImage3,
    alt: 'Ravenza Streetwear Collection 3'
  },
];

export default function HeroBanner() {
  const [current, setCurrent] = useState(0);

  // Preload all banner images immediately on mount so next slide is instant
  useEffect(() => {
    slides.forEach((s) => {
      const img = new Image();
      img.src = s.image;
    });
  }, []);

  // Auto-advance loop every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative w-full h-[88vh] sm:h-[92vh] md:h-[96vh] min-h-[640px] overflow-hidden bg-neutral-900 select-none">
      {/* 
        Stacked Cross-Fade Carousel:
        All slides stay rendered in the DOM stacked together.
        The current slide transitions to opacity 1 over the previous slide with ZERO unmounting gap,
        completely eliminating any black screen flashes!
      */}
      <div className="absolute inset-0 w-full h-full">
        {slides.map((slide, index) => {
          const isActive = index === current;
          return (
            <motion.div
              key={slide.id}
              initial={false}
              animate={{
                opacity: isActive ? 1 : 0,
                scale: isActive ? 1 : 1.04,
              }}
              transition={{
                opacity: { duration: 0.85, ease: [0.25, 1, 0.5, 1] },
                scale: { duration: 1.2, ease: 'easeOut' },
              }}
              style={{
                zIndex: isActive ? 10 : 0,
                pointerEvents: isActive ? 'auto' : 'none',
              }}
              className="absolute inset-0 w-full h-full"
            >
              <img
                src={slide.image}
                alt={slide.alt}
                className="w-full h-full object-cover object-center"
                loading="eager"
                fetchPriority={index === 0 ? "high" : "auto"}
              />

              {/* Subtle Overlay for Depth */}
              <div className="absolute inset-0 bg-black/10 pointer-events-none" />
            </motion.div>
          );
        })}
      </div>

      {/* Clean Slide Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2.5">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`transition-all duration-300 rounded-full h-1.5 cursor-pointer ${
              i === current ? 'w-8 bg-white shadow-lg' : 'w-2 bg-white/40 hover:bg-white/70'
            }`}
          />
        ))}
      </div>
    </section>
  );
}
