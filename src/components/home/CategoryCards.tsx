import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useStore } from '../../store/useStore';

export default function CategoryCards() {
  const { categories } = useStore();

  const categoryImages: Record<string, string> = {
    'co-ord-sets': 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&h=700&fit=crop',
    'oversize-tees': 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=700&fit=crop',
    'graphic-trousers': 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&h=700&fit=crop',
    'trackpants': 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=600&h=700&fit=crop',
    'graphic-shorts': 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=600&h=700&fit=crop',
    'shirts-jackets': 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&h=700&fit=crop',
  };

  const mainCategories = categories.filter(cat => !cat.parent_id);

  return (
    <section className="py-16 px-4 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-10"
      >
        <p className="text-xs tracking-[0.3em] text-gray-500 mb-2">EXPLORE</p>
        <h2 className="text-3xl md:text-4xl font-display font-bold">SHOP BY CATEGORY</h2>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {mainCategories.map((cat, i) => (
          <motion.div
            key={cat.slug}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
          >
            <Link to={`/collections/${cat.slug}`} className="group block">
              <div className="aspect-[3/4] rounded-2xl overflow-hidden mb-3 relative">
                <img
                  src={cat.cover_image_url || categoryImages[cat.slug] || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=700&fit=crop'}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                {cat.badge && (
                  <div className="absolute top-3 left-3 bg-black text-white text-xs font-bold px-2 py-1 rounded-full">
                    {cat.badge}
                  </div>
                )}
              </div>
              <h3 className="text-sm font-semibold text-center group-hover:text-purple-600 transition-colors">
                {cat.name}
              </h3>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
