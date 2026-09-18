import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useStore } from '../../store/useStore';

export default function WarmChapterSection() {
  const { warmChapters } = useStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const cardsPerView = 4;
  const totalSlides = Math.ceil(warmChapters.length / cardsPerView);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % totalSlides);
    }, 5000);
    return () => clearInterval(timer);
  }, [totalSlides]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

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
          <h2 className="text-4xl md:text-5xl font-black mb-3">WARM CHAPTER ONE</h2>
          <p className="text-xl text-gray-600">New Edit</p>
        </motion.div>

        {/* Carousel Container */}
        <div className="relative">
          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <ChevronRight size={24} />
          </button>

          {/* Cards Grid */}
          <div className="overflow-hidden">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            >
            {currentCards.map((chapter: any) => (
              <Link
                key={chapter.id}
                to={`/collections/${chapter.slug}`}
                className="group"
              >                  <div className="relative aspect-[16/9] rounded-2xl overflow-hidden border-4 border-gray-200 shadow-xl transition-all duration-300 group-hover:border-black group-hover:shadow-2xl">
                    <div className="absolute inset-0 overflow-hidden">
                      <img
                        src={chapter.image_url}
                        alt={chapter.title}
                        className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110 group-hover:rounded-[30%]"
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <h3 className="text-lg font-bold mb-1">{chapter.title}</h3>
                      {chapter.subtitle && (
                        <p className="text-sm">{chapter.subtitle}</p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </motion.div>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-2 mt-8">
            {Array.from({ length: totalSlides }).map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? 'bg-black w-8'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
