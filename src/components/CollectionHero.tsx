import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CollectionHeroProps {
  category: any;
}

export default function CollectionHero({ category }: CollectionHeroProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // Multiple images for carousel - use category images or fallbacks
  const images = category.images?.length > 0 
    ? category.images 
    : [
        category.cover_image_url || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&h=1080&fit=crop',
        'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=1920&h=1080&fit=crop',
        'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1920&h=1080&fit=crop'
      ];

  // Auto-rotate slides
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [images.length]);

  // Preload all collection banner images
  useEffect(() => {
    images.forEach((url: string) => {
      if (url) {
        const img = new Image();
        img.src = url;
      }
    });
  }, [images]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % images.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + images.length) % images.length);

  return (
    <div className="relative h-[80vh] overflow-hidden bg-neutral-900 select-none">
      {/* Background Image Carousel - Stacked cross-fade without black flashes */}
      <div className="absolute inset-0">
        {images.map((imgUrl: string, idx: number) => {
          const isActive = idx === currentSlide;
          return (
            <motion.div
              key={idx}
              initial={false}
              animate={{
                opacity: isActive ? 1 : 0,
                scale: isActive ? 1 : 1.03,
              }}
              transition={{
                opacity: { duration: 0.8, ease: [0.25, 1, 0.5, 1] },
                scale: { duration: 1.2, ease: 'easeOut' },
              }}
              style={{
                zIndex: isActive ? 10 : 0,
                pointerEvents: isActive ? 'auto' : 'none',
              }}
              className="absolute inset-0"
            >
              <img
                src={imgUrl}
                alt={`${category.name} - Slide ${idx + 1}`}
                className="w-full h-full object-cover"
                loading="eager"
              />
            </motion.div>
          );
        })}
      </div>

      {/* Navigation Arrows - Minimalist, No Background */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 hover:bg-white/10 rounded-full transition-colors group"
        aria-label="Previous image"
      >
        <ChevronLeft size={32} strokeWidth={1.5} className="text-white drop-shadow-lg" />
      </button>
      
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 hover:bg-white/10 rounded-full transition-colors group"
        aria-label="Next image"
      >
        <ChevronRight size={32} strokeWidth={1.5} className="text-white drop-shadow-lg" />
      </button>

      {/* Content - Centered, No Overlay */}
      <div className="relative h-full max-w-7xl mx-auto px-4 flex items-center justify-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="max-w-3xl"
        >
          {category.badge && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="inline-block bg-white text-black text-xs font-bold px-4 py-2 rounded-full mb-6"
            >
              {category.badge}
            </motion.span>
          )}
          
          {category.tag && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-white/90 text-sm tracking-[0.3em] mb-3 uppercase"
            >
              {category.tag}
            </motion.p>
          )}

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="text-6xl md:text-8xl font-black text-white font-display leading-tight mb-6"
          >
            {category.name}
          </motion.h1>

          {category.description && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-white/90 text-lg max-w-2xl mx-auto leading-relaxed"
            >
              {category.description}
            </motion.p>
          )}
        </motion.div>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-3">
        {images.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            className={`transition-all duration-300 ${
              idx === currentSlide 
                ? 'w-8 h-1 bg-white' 
                : 'w-1 h-1 bg-white/50 hover:bg-white/80'
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
