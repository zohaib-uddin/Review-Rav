import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useStore } from '../../store/useStore';

export default function WarmChapterSection() {
  const { warmChapters } = useStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);
  const cardsPerView = 4;
  const totalSlides = Math.max(1, Math.ceil(warmChapters.length / cardsPerView));
  
  // Auto-scroll every 4 seconds
  useEffect(() => {
    if (isHovered) return; // Pause on hover
    
    const timer = setInterval(() => {
      setCurrentIndex((prev) => {
        const nextIndex = prev + 1;
        // Reset to 0 when reaching end for infinite loop
        return nextIndex >= totalSlides ? 0 : nextIndex;
      });
    }, 4000);
    
    return () => clearInterval(timer);
  }, [totalSlides, isHovered]);

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
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-black uppercase">WARM CHAPTER I</h2>
          <div className="w-24 h-1 bg-red-600 mx-auto my-4" />
          <p className="text-lg text-gray-600 uppercase tracking-wider">NEW EDIT</p>
        </motion.div>

        {/* Carousel Container */}
        <div 
          ref={carouselRef}
          className="relative overflow-hidden"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Cards Grid - Smooth Sliding */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {currentCards.map((chapter: any) => (
                <Link
                  key={chapter.id}
                  to={`/collections/${chapter.slug}`}
                  className="group block"
                >
                  <div className="relative aspect-[3/4] rounded-lg overflow-hidden border border-gray-200 shadow-md">
                    {/* Image with left-side pan-zoom effect on hover */}
                    <div className="absolute inset-0 overflow-hidden">
                      <img
                        src={chapter.image_url}
                        alt={chapter.title}
                        className="w-full h-full object-cover origin-left transition-transform duration-700 ease-out group-hover:scale-110 group-hover:translate-x-[-5%]"
                      />
                    </div>
                    {/* Title overlay at bottom */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
                      <h3 className="text-white text-lg font-bold uppercase">{chapter.title}</h3>
                    </div>
                  </div>
                </Link>
              ))}
            </motion.div>
          </AnimatePresence>

          {/* Dots Indicator - Bottom Center */}
          <div className="flex justify-center gap-2 mt-8">
            {Array.from({ length: totalSlides }).map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
                className={`rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? 'bg-black w-8 h-2'
                    : 'bg-gray-300 w-2 h-2 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
