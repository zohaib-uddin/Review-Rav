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
  const { products } = useStore();
  const filteredProducts = products.filter(filterFn).slice(0, 8);

  if (filteredProducts.length === 0) return null;

  return (
    <section className="py-16 max-w-7xl mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="flex justify-between items-center mb-10"
      >
        <div>
          <p className="text-xs tracking-[0.3em] text-gray-500 mb-1">{subtitle}</p>
          <h2 className="text-3xl font-display font-bold">{title}</h2>
        </div>
        <Link to={link} className="text-sm font-semibold flex items-center gap-1 hover:gap-2 transition-all">
          View All <ArrowRight size={16} />
        </Link>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredProducts.map((product, i) => (
          <ProductCard key={product.id} product={product} index={i} />
        ))}
      </div>
    </section>
  );
}
