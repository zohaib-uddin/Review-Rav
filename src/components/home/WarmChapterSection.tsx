import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { useStore } from '../../store/useStore';

// Animation Variants for Reusability & Performance
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { staggerChildren: 0.15, delayChildren: 0.2 }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 60, scale: 0.9 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1, 
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] }
  }
};

const imageVariants = {
  hidden: { scale: 1.1, opacity: 0 },
  visible: { 
    scale: 1, 
    opacity: 1, 
    transition: { duration: 1.2, ease: "easeOut" }
  }
};

const textOverlayVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1, 
    transition: { duration: 0.6, delay: 0.4, ease: "easeOut" }
  }
};

export default function WarmChapterSection() {
  const { warmChapters, categories, fetchWarmChapters, fetchCategories } = useStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [visibleCount, setVisibleCount] = useState(4);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  // Initial data fetch
  useEffect(() => {
    fetchWarmChapters();
    fetchCategories();
  }, [fetchWarmChapters, fetchCategories]);

  // Responsive items per view detection
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setVisibleCount(1);
      } else if (window.innerWidth < 1024) {
        setVisibleCount(2);
      } else {
        setVisibleCount(4);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Compute dynamic cards prioritizing active warm chapters or active categories
  const displayCards = useMemo(() => {
    if (categories && categories.length > 0) {
      const warmCats = categories.filter((c) => c.is_warm_chapter && c.is_active !== false);
      if (warmCats.length > 0) {
        return warmCats.map((c) => ({
          id: c.id,
          title: c.name,
          subtitle: c.tag || c.badge || 'WINTER DROP',
          slug: c.slug,
          image_url: c.cover_image_url || 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&h=1000&fit=crop',
        }));
      }
    }

    if (warmChapters && warmChapters.length > 0) {
      const activeChapters = warmChapters.filter((wc: any) => wc.is_active !== false);
      if (activeChapters.length > 0) {
        return activeChapters.map((wc) => ({
          id: wc.id,
          title: wc.title,
          subtitle: wc.subtitle || 'NEW EDIT',
          slug: wc.slug,
          image_url: wc.image_url || 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&h=1000&fit=crop',
        }));
      }
    }

    if (categories && categories.length > 0) {
      const activeCats = categories.filter((c) => c.is_active !== false);
      if (activeCats.length > 0) {
        return activeCats.slice(0, 8).map((c) => ({
          id: c.id,
          title: c.name,
          subtitle: c.tag || c.badge || 'WINTER DROP',
          slug: c.slug,
          image_url: c.cover_image_url || 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&h=1000&fit=crop',
        }));
      }
    }

    return [];
  }, [categories, warmChapters]);

  const maxIndex = Math.max(0, displayCards.length - visibleCount);

  // Next & Prev actions
  const handleNext = () => {
    if (maxIndex <= 0) return;
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  const handlePrev = () => {
    if (maxIndex <= 0) return;
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  };

  // Auto-scroll interval with pause on hover
  useEffect(() => {
    if (isPaused || maxIndex <= 0 || displayCards.length === 0) {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
      return;
    }

    autoPlayRef.current = setInterval(() => {
      handleNext();
    }, 4000);

    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [isPaused, maxIndex, displayCards.length]);

  if (displayCards.length === 0) {
    return null;
  }

  return (
    <section 
      id="warm-chapter-1-section" 
      className="py-16 md:py-20 bg-white border-b border-gray-100 relative overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Animated Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-12"
        >
          <div className="inline-block relative">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-wide text-gray-900 uppercase">
              WARM CHAPTER I
            </h2>
            <motion.div 
              initial={{ width: 0 }}
              whileInView={{ width: "100%" }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600 transform translate-y-1"
            ></motion.div>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-3 font-light tracking-[0.25em] uppercase">
            NEW EDIT • EXCLUSIVE CATEGORIES
          </p>
        </motion.div>

        {/* Carousel Container */}
        <div className="relative group/carousel">
          
          {/* Animated Navigation Buttons */}
          {maxIndex > 0 && (
            <>
              <motion.button
                type="button"
                onClick={handlePrev}
                aria-label="Previous Category"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                whileHover={{ scale: 1.1, backgroundColor: "#000" }}
                viewport={{ once: true }}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 sm:-translate-x-4 z-20 w-10 h-10 sm:w-12 sm:h-12 bg-black/80 text-white flex items-center justify-center shadow-lg transition-all border border-white/20 backdrop-blur-sm"
              >
                <ChevronLeft size={22} />
              </motion.button>
              <motion.button
                type="button"
                onClick={handleNext}
                aria-label="Next Category"
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                whileHover={{ scale: 1.1, backgroundColor: "#000" }}
                viewport={{ once: true }}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 sm:translate-x-4 z-20 w-10 h-10 sm:w-12 sm:h-12 bg-black/80 text-white flex items-center justify-center shadow-lg transition-all border border-white/20 backdrop-blur-sm"
              >
                <ChevronRight size={22} />
              </motion.button>
            </>
          )}

          {/* Cards Track with smooth slide */}
          <div className="overflow-hidden">
            <motion.div
              animate={{ x: `-${currentIndex * (100 / visibleCount)}%` }}
              transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="flex gap-4 sm:gap-6"
            >
              {displayCards.map((chapter, idx) => (
                <motion.div
                  key={`${chapter.id}-${idx}`}
                  variants={cardVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "0px" }}
                  style={{
                    flex: `0 0 calc(${100 / visibleCount}% - ${((visibleCount - 1) * (visibleCount === 1 ? 0 : 24)) / visibleCount}px)`,
                  }}
                  className="min-w-0"
                >
                  <Link to={`/collections/${chapter.slug}`} className="group block h-full select-none">
                    <div className="relative aspect-[9/16] overflow-hidden bg-zinc-900 shadow-md group-hover:shadow-2xl transition-all duration-500 rounded-xl">
                      
                      {/* Zoom-Reveal Image */}
                      <motion.img
                        src={chapter.image_url}
                        alt={chapter.title}
                        variants={imageVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />

                      {/* Bottom Gradient Overlay with Slide-Up Text */}
                      <motion.div 
                        variants={textOverlayVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent flex flex-col justify-end p-5 sm:p-6"
                      >
                        {chapter.subtitle && (
                          <span className="text-[10px] sm:text-[11px] font-bold tracking-[0.25em] uppercase text-red-500 mb-1.5 drop-shadow">
                            {chapter.subtitle}
                          </span>
                        )}
                        <h3 className="text-lg sm:text-xl md:text-2xl font-display font-black tracking-wide text-white uppercase drop-shadow-md group-hover:text-red-300 transition-colors line-clamp-1">
                          {chapter.title}
                        </h3>
                        <div className="mt-3 flex items-center gap-2 text-xs font-bold text-white/90 tracking-wider uppercase group-hover:translate-x-1.5 transition-transform duration-300">
                          <span>View Collection</span>
                          <ArrowRight size={14} className="text-red-500 transition-transform group-hover:translate-x-1" />
                        </div>
                      </motion.div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Pagination Indicators */}
          {maxIndex > 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.8 }}
              className="flex justify-center items-center gap-2 mt-8"
            >
              {Array.from({ length: maxIndex + 1 }).map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setCurrentIndex(index)}
                  aria-label={`Go to slide ${index + 1}`}
                  className={`h-1.5 transition-all duration-300 rounded-full ${
                    index === currentIndex ? 'w-8 bg-black' : 'w-2 bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}