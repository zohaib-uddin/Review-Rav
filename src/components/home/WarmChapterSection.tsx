import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useStore } from '../../store/useStore';

export default function WarmChapterSection() {
  const { warmChapters } = useStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);
  const cardsPerView = 4;
  const totalSlides = Math.max(1, Math.ceil(warmChapters.length / cardsPerView));
  
  // Auto-scroll every 4 seconds - infinite loop to the right
  useEffect(() => {
    if (isPaused) return;
    
    const timer = setInterval(() => {
      setCurrentIndex((prev) => {
        const nextIndex = prev + 1;
        // Infinite scroll: when we reach the end, go back to start
        if (nextIndex >= totalSlides) {
          return 0;
        }
        return nextIndex;
      });
    }, 4000);
    
    return () => clearInterval(timer);
  }, [totalSlides, isPaused]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  if (warmChapters.length === 0) return null;

  const currentCards = warmChapters.slice(
    currentIndex * cardsPerView,
    (currentIndex * cardsPerView) + cardsPerView
  );

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header with thin red underline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-block relative">
            <h2 className="text-4xl md:text-5xl font-black tracking-wide">WARM CHAPTER I</h2>
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600 transform translate-y-1"></div>
          </div>
          <p className="text-xl text-gray-600 mt-3 font-light tracking-widest">NEW EDIT</p>
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
                  {/* Card with cinematic top-left zoom effect on hover */}
                  <div className="relative aspect-[9/16] overflow-hidden bg-gray-100 shadow-lg">
                    <div 
                      className="w-full h-full overflow-hidden"
                      style={{ transformOrigin: 'top left' }}
                    >
                      <img
                        src={chapter.image_url}
                        alt={chapter.title}
                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                        style={{ transformOrigin: 'top left' }}
                      />
                    </div>
                    
                    {/* Overlay gradient - appears on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    {/* Text content - appears on hover */}
                    <div className="absolute bottom-0 left-0 right-0 p-5 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                      <h3 className="text-lg font-bold mb-1 tracking-wide">{chapter.title}</h3>
                      {chapter.subtitle && (
                        <p className="text-sm font-light opacity-90">{chapter.subtitle}</p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </motion.div>
          </div>

          {/* Pagination Dots - Bottom Center with Active State */}
          <div className="flex justify-center gap-3 mt-10">
            {Array.from({ length: totalSlides }).map((_, index) => (
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
