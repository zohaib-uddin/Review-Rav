import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useStore } from '../../store/useStore';

export default function CollectionsInFocus() {
  const { products } = useStore();

  const featuredProducts = products.filter(p => p.is_featured).slice(0, 4);

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <p className="text-xs tracking-[0.3em] text-gray-500 mb-2">CURATED FOR YOU</p>
          <h2 className="text-3xl md:text-4xl font-display font-bold">Collections in Focus</h2>
          <p className="text-gray-500 mt-3 max-w-2xl mx-auto">
            Our most-loved collections, all in one place
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-2xl aspect-[4/5] group"
          >
            <img
              src="https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&h=1000&fit=crop"
              alt="Winter Essentials"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-8">
              <p className="text-white/70 text-sm tracking-widest mb-2">WINTER ESSENTIALS</p>
              <h3 className="text-3xl font-bold text-white mb-3">Co-Ord Sets</h3>
              <p className="text-white/80 text-sm mb-4">
                Premium matching sets for effortless style
              </p>
              <Link
                to="/shop/co-ord-sets"
                className="inline-flex items-center gap-2 text-white font-medium hover:gap-3 transition-all"
              >
                Shop Now <ArrowRight size={16} />
              </Link>
            </div>
          </motion.div>

          <div className="grid grid-cols-2 gap-4">
            {featuredProducts.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Link to={`/product/${product.id}`} className="group block">
                  <div className="aspect-square rounded-xl overflow-hidden bg-gray-200">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="mt-3">
                    <h4 className="text-sm font-medium line-clamp-1 group-hover:text-purple-600 transition-colors">
                      {product.name}
                    </h4>
                    <p className="text-sm font-bold mt-1">
                      Rs.{(product.salePrice || product.price || 0).toLocaleString()}
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
