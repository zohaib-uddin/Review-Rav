import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const slides = [
  {
    id: 1,
    subtitle: 'WINTER ESSENTIALS',
    title: 'CO-ORD\nSETS',
    description: 'Premium matching sets for effortless style',
    cta: 'SHOP NOW',
    link: '/shop/co-ord-sets',
    image: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=1920&h=1080&fit=crop',
  },
  {
    id: 2,
    subtitle: 'NEW ARRIVALS',
    title: 'ACID WASH\nTEES',
    description: 'Bold graphic tees with premium acid wash',
    cta: 'EXPLORE',
    link: '/shop/oversize-tees',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=1920&h=1080&fit=crop',
  },
  {
    id: 3,
    subtitle: 'STREETWEAR',
    title: 'GRAPHIC\nTROUSERS',
    description: 'Wide leg trousers with signature prints',
    cta: 'DISCOVER',
    link: '/shop/graphic-trousers',
    image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=1920&h=1080&fit=crop',
  },
];

export default function HeroBanner() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const next = () => setCurrent((prev) => (prev + 1) % slides.length);
  const prev = () => setCurrent((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <section className="relative h-[90vh] overflow-hidden bg-black">
      <AnimatePresence mode="wait">
        <motion.div
          key={slides[current].id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0"
        >
          <img
            src={slides[current].image}
            alt=""
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
        </motion.div>
      </AnimatePresence>

      <div className="relative h-full max-w-7xl mx-auto px-4 flex items-center">
        <motion.div
          key={current}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-2xl"
        >
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="text-white/70 text-sm tracking-[0.3em] mb-4"
          >
            {slides[current].subtitle}
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-6xl md:text-8xl font-black text-white font-display leading-[0.9] whitespace-pre-line"
          >
            {slides[current].title}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-white/70 mt-6 text-lg max-w-md"
          >
            {slides[current].description}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-8 flex gap-4"
          >
            <Link
              to={slides[current].link}
              className="inline-flex items-center gap-2 bg-white text-black px-8 py-4 font-bold text-sm hover:bg-gray-200 transition-colors rounded-full"
            >
              {slides[current].cta} <ArrowRight size={18} />
            </Link>
          </motion.div>
        </motion.div>
      </div>

      <button
        onClick={prev}
        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 p-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white hover:bg-white/20 transition-all"
      >
        <ChevronLeft size={24} />
      </button>
      <button
        onClick={next}
        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 p-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white hover:bg-white/20 transition-all"
      >
        <ChevronRight size={24} />
      </button>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`transition-all duration-300 rounded-full ${
              i === current ? 'w-10 h-2 bg-white' : 'w-2 h-2 bg-white/40'
            }`}
          />
        ))}
      </div>
    </section>
  );
}
