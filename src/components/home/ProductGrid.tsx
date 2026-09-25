import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useStore } from '../../store/useStore';
import ProductCard from '../ProductCard';

interface ProductGridProps {
  title: string;
  subtitle: string;
  filterFn: (p: any) => boolean;
  link: string;
}

export default function ProductGrid({ title, subtitle, filterFn, link }: ProductGridProps) {
  const { products, isLoading } = useStore();
  // 12 products for 2 complete rows of 6 cards per row
  const filteredProducts = products.filter(filterFn).slice(0, 12);

  // If still loading and no products yet, display matching skeleton loading cards
  if (isLoading || products.length === 0) {
    return (
      <section className="py-10 sm:py-14 w-full px-0 sm:px-1">
        <div className="flex justify-between items-center mb-6 px-3 sm:px-4 animate-pulse">
          <div>
            <div className="h-3 w-28 bg-neutral-200 rounded mb-2"></div>
            <div className="h-8 w-56 bg-neutral-200 rounded"></div>
          </div>
          <div className="h-4 w-20 bg-neutral-200 rounded"></div>
        </div>

        {/* 6 cards per row Skeleton product cards matching Shop All edge-to-edge layout */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-6 gap-[4px]">
          {Array.from({ length: 6 }).map((_, i) => (
            <motion.div
              key={`grid-skeleton-${i}`}
              initial={{ opacity: 0.5, scale: 0.96 }}
              animate={{ 
                opacity: [0.5, 0.85, 0.5],
                scale: [0.97, 1, 0.97]
              }}
              transition={{ 
                duration: 1.6, 
                repeat: Infinity, 
                ease: 'easeInOut',
                delay: (i % 6) * 0.1 
              }}
              className="flex flex-col space-y-2 p-1"
            >
              <div className="aspect-[9/16] bg-neutral-100 rounded-none overflow-hidden relative border border-neutral-200/50">
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-200/70 via-neutral-100/30 to-transparent"></div>
              </div>
              <div className="space-y-1 pt-1">
                <div className="h-3.5 bg-neutral-200 rounded w-3/4"></div>
                <div className="h-3 bg-neutral-200 rounded w-1/3"></div>
              </div>
              <div className="h-9 bg-neutral-200 rounded-none w-full mt-1"></div>
            </motion.div>
          ))}
        </div>
      </section>
    );
  }

  if (filteredProducts.length === 0) return null;

  return (
    <section className="py-10 sm:py-14 w-full px-0 sm:px-1">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        whileInView={{ opacity: 1, scale: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="flex justify-between items-center mb-6 px-3 sm:px-4"
      >
        <div>
          <p className="text-xs tracking-[0.3em] uppercase text-gray-500 mb-1 font-semibold">{subtitle}</p>
          <h2 className="text-2xl sm:text-3xl font-display font-bold uppercase tracking-tight text-black">{title}</h2>
        </div>
        <Link to={link} className="text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center gap-1 hover:gap-2 transition-all hover:text-red-600">
          View All <ArrowRight size={15} />
        </Link>
      </motion.div>

      {/* Start-to-end full width grid with 6 cards per row exactly like Shop All page */}
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ staggerChildren: 0.05 }}
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-6 gap-[4px]"
      >
        {filteredProducts.map((product, i) => (
          <ProductCard key={product.id} product={product} index={i} fullWidth />
        ))}
      </motion.div>
    </section>
  );
}
