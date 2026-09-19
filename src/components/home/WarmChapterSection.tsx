import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { useAutoScroll } from '../../hooks/useAutoScroll';

export default function WarmChapterSection() {
  const { warmChapters } = useStore();
  const [isPaused, setIsPaused] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);
  const cardsPerView = 4;
  const totalSlides = Math.max(1, Math.ceil(warmChapters.length / cardsPerView));
  
  // Use custom auto-scroll hook with 4-second interval
  const { currentIndex, goToSlide } = useAutoScroll({
    totalSlides,
    interval: 4000,
    paused: isPaused,
  });

  if (warmChapters.length === 0) return null;

  const currentCards = warmChapters.slice(
    currentIndex * cardsPerView,
    (currentIndex * cardsPerView) + cardsPerView
  );

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header with thin red underline - Pixel Perfect */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-block relative">
            <h2 className="text-4xl md:text-5xl font-black tracking-wide text-gray-900">
              WARM CHAPTER I
            </h2>
            {/* Thin red underline */}
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600 transform translate-y-1"></div>
          </div>
          {/* Sub-text in smaller uppercase font */}
          <p className="text-sm md:text-base text-gray-600 mt-3 font-light tracking-widest uppercase">
            NEW EDIT
          </p>
        </motion.div>

        {/* Carousel Container - No manual navigation buttons */}
        <div 
          ref={carouselRef}
          className="relative overflow-hidden"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Cards Grid with sliding animation */}
          <div className="overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
              >
                {currentCards.map((chapter: any) => (
                  <Link
                    key={chapter.id}
                    to={`/collections/${chapter.slug}`}
                    className="group block"
                  >
                    {/* Card with exact reference image proportions */}
                    <div className="relative aspect-[9/16] overflow-hidden bg-gray-100 shadow-md hover:shadow-xl transition-shadow duration-300">
                      {/* Image container with cinematic top-left zoom effect */}
                      <div 
                        className="w-full h-full overflow-hidden"
                        style={{ transformOrigin: 'top left' }}
                      >
                        <img
                          src={chapter.image_url}
                          alt={chapter.title}
                          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                          style={{ transformOrigin: 'top left' }}
                          loading="lazy"
                        />
                      </div>
                      
                      {/* Text label centered below image - appears on hover */}
                      <div className="absolute inset-0 flex items-end justify-center pb-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                        <div className="text-center px-4">
                          <h3 className="text-lg font-bold tracking-wide text-white uppercase drop-shadow-lg">
                            {chapter.title}
                          </h3>
                          {chapter.subtitle && (
                            <p className="text-sm font-light text-white/90 mt-1 drop-shadow">
                              {chapter.subtitle}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Pagination Dots - Bottom Center with Active State */}
          <div className="flex justify-center gap-3 mt-10">
            {Array.from({ length: totalSlides }).map((index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
                className={`transition-all duration-500 rounded-full ${
                  index === currentIndex
                    ? 'bg-black w-10 h-2.5'
                    : 'bg-gray-300 w-2.5 h-2.5 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
