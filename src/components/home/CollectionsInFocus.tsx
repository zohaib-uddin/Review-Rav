import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useStore } from '../../store/useStore';

export default function CollectionsInFocus() {
  const { categories } = useStore();
  
  // Get categories featured in "Collections in Focus", sorted by display_order_in_focus, max 4
  const featuredCategories = categories
    .filter((c: any) => c.is_featured_in_focus && c.is_active)
    .sort((a: any, b: any) => (a.display_order_in_focus || 0) - (b.display_order_in_focus || 0))
    .slice(0, 4);

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
          {/* Left Side - Static Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-2xl aspect-[4/5] group"
          >
            <img
              src="https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&h=1000&fit=crop"
              alt="Featured Collection"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-8">
              <p className="text-white/70 text-sm tracking-widest mb-2">FEATURED COLLECTION</p>
              <h3 className="text-3xl font-bold text-white mb-3">Premium Styles</h3>
              <p className="text-white/80 text-sm mb-4">
                Discover our handpicked selection of premium fashion pieces designed for the modern individual.
              </p>
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 text-white font-medium hover:gap-3 transition-all"
              >
                Shop Now <ArrowRight size={16} />
              </Link>
            </div>
          </motion.div>

          {/* Right Side - Dynamic Category Cards (2x2 Grid) */}
          <div className="grid grid-cols-2 gap-4">
            {featuredCategories.length > 0 ? (
              featuredCategories.map((category: any, i: number) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link to={`/collections/${category.slug}`} className="group block h-full">
                    <div className="aspect-square rounded-xl overflow-hidden bg-gray-200 h-full flex flex-col">
                      {category.cover_image_url ? (
                        <img
                          src={category.cover_image_url}
                          alt={category.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                          <span className="text-gray-400 text-xs">No Image</span>
                        </div>
                      )}
                    </div>
                    <div className="mt-3 flex flex-col h-[calc(100%-theme(spacing.3))]">
                      <h4 className="text-sm font-medium line-clamp-2 group-hover:text-purple-600 transition-colors">
                        {category.name}
                      </h4>
                      {category.description && (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                          {category.description}
                        </p>
                      )}
                      <button className="mt-2 text-xs font-semibold text-black uppercase tracking-wide group-hover:text-purple-600 transition-colors text-left">
                        Shop {category.name}
                      </button>
                    </div>
                  </Link>
                </motion.div>
              ))
            ) : (
              // Placeholder cards when no categories are featured
              Array.from({ length: 4 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="aspect-square rounded-xl bg-gray-200 animate-pulse"
                />
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
