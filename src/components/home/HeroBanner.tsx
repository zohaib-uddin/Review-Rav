import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ✅ Import your hero images here
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

  // ✅ Auto-advance loop every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // ✅ Continuous Left-to-Right Slide Variants
  // Old slide always exits to LEFT (-100%)
  // New slide always enters from RIGHT (100%)
  const slideVariants = {
    initial: { x: '100%', opacity: 1 },
    animate: { x: 0, opacity: 1 },
    exit: { x: '-100%', opacity: 1 },
  };

  return (
    <section className="relative w-full h-[88vh] sm:h-[92vh] md:h-[96vh] min-h-[640px] overflow-hidden bg-neutral-950 select-none">
      
      {/* ✅ Seamless Carousel with Continuous Flow */}
      <AnimatePresence mode="wait">
        <motion.div
          key={slides[current].id}
          variants={slideVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.7, ease: [0.25, 1, 0.5, 1] }}
          className="absolute inset-0 w-full h-full"
        >
          <img
            src={slides[current].image}
            alt={slides[current].alt}
            className="w-full h-full object-cover object-center"
            loading={current === 0 ? "eager" : "lazy"}
            fetchPriority={current === 0 ? "high" : "low"}
          />
          
          {/* Subtle Overlay for Depth */}
          <div className="absolute inset-0 bg-black/10 pointer-events-none" />
        </motion.div>
      </AnimatePresence>

      {/* ✅ Clean Slide Indicators Only (No Arrows) */}
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