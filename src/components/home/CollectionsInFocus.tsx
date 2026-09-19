import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { useEffect } from 'react';

export default function CollectionsInFocus() {
  const { featuredCategories, fetchFeaturedCategories } = useStore();
  
  useEffect(() => {
    fetchFeaturedCategories();
  }, [fetchFeaturedCategories]);
  
  return (
    <section className="py-16 bg-white">
      <div className="max-w-[1400px] mx-auto px-4">
        {/* Split Layout */}
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Left Side - Static Lifestyle Image & Brand Description */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden"
          >
            <div className="relative aspect-[4/5] rounded-none overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=800&h=1000&fit=crop"
                alt="Our Collections"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="mt-8 lg:pr-8">
              <p className="text-xs tracking-[0.3em] text-gray-500 mb-3">OUR STORY</p>
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Collections in Focus</h2>
              <p className="text-gray-600 leading-relaxed">
                Our most-loved collections, carefully curated to bring you timeless pieces that define your style. 
                Each category represents our commitment to quality, comfort, and contemporary design.
              </p>
            </div>
          </motion.div>

          {/* Right Side - 2x2 Grid of Featured Categories */}
          <div className="grid grid-cols-2 gap-4">
            {featuredCategories.slice(0, 4).map((category, i) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group"
              >
                <Link to={`/collections/${category.slug}`} className="block h-full">
                  <div className="aspect-square rounded-none overflow-hidden bg-gray-100 relative">
                    <img
                      src={category.cover_image_url || 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=400&h=400&fit=crop'}
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                  </div>
                  <div className="mt-3 text-center">
                    <h4 className="text-sm font-medium uppercase tracking-wide">{category.name}</h4>
                    <button className="mt-2 text-xs font-semibold uppercase tracking-wider hover:underline">
                      Shop {category.name}
                    </button>
                  </div>
                </Link>
              </motion.div>
            ))}
            
            {/* Empty state if less than 4 categories */}
            {featuredCategories.length === 0 && (
              <div className="col-span-2 text-center py-12 text-gray-400">
                <p>No featured categories yet. Admin can set up to 4 categories in the admin panel.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
