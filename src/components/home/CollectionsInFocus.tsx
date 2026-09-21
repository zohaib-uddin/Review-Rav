import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { useEffect } from 'react';

export default function CollectionsInFocus() {
  const { featuredCategories, categories, fetchFeaturedCategories, fetchCategories } = useStore();
  
  useEffect(() => {
    fetchFeaturedCategories();
    fetchCategories();
  }, [fetchFeaturedCategories, fetchCategories]);

  const curatedDefaults = [
    {
      id: 'cat-coord',
      name: 'Graphic Co-Ord Sets',
      slug: 'co-ord-sets',
      badge: 'TRENDING',
      description: 'Effortlessly synchronized luxury matching sets crafted for modern streetwear styling.',
      cover_image_url: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&h=1000&fit=crop',
    },
    {
      id: 'cat-oversize',
      name: 'Oversize Tees',
      slug: 'oversize-tees',
      badge: 'BESTSELLER',
      description: 'Heavyweight drop-shoulder graphic tees crafted from 280 GSM combed cotton.',
      cover_image_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=1000&fit=crop',
    },
    {
      id: 'cat-acid',
      name: 'Acid Wash Tees',
      slug: 'acid-wash-tees',
      badge: 'NEW EDIT',
      description: 'Vintage mineral wash textures engineered with distressed artisan hems.',
      cover_image_url: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&h=1000&fit=crop',
    },
    {
      id: 'cat-trousers',
      name: 'Graphic Trousers',
      slug: 'graphic-trousers',
      badge: 'ESSENTIAL',
      description: 'Relaxed tailored cargo trousers and utility silhouettes for versatile layering.',
      cover_image_url: 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=800&h=1000&fit=crop',
    },
  ];

  // 1. From featuredCategories
  const fromFeatured = (featuredCategories || []).filter(
    (c) => c.is_active !== false && c.is_featured_in_focus !== false
  );

  // 2. From general categories marked as featured in focus
  const fromStoreCats = (categories || []).filter(
    (c) => c.is_active !== false && c.is_featured_in_focus !== false
  );

  // 3. Fallback candidate list
  const activeCandidates = fromFeatured.length > 0 
    ? fromFeatured 
    : (fromStoreCats.length > 0 ? fromStoreCats : curatedDefaults);

  const finalCards = activeCandidates.slice(0, 4).map((c, i) => ({
    ...c,
    cover_image_url: c.cover_image_url || curatedDefaults[i % curatedDefaults.length].cover_image_url,
    description: c.description || curatedDefaults[i % curatedDefaults.length].description,
    badge: c.badge || curatedDefaults[i % curatedDefaults.length].badge,
  }));
  
  return (
    <section className="py-20 bg-white border-t border-gray-100">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-12 text-center md:text-left">
          <p className="text-xs font-bold tracking-[0.3em] uppercase text-gray-400 mb-2">CURATED SELECTION</p>
          <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight text-black">Collections in Focus</h2>
        </div>

        {/* Split Layout: 1 Large Left Card + 4 Right Cards (2x2 Grid) */}
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* Left Side - Large Showcase Card with text strictly BELOW the image */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-5 flex flex-col"
          >
            <div className="w-full aspect-[3/4] overflow-hidden bg-gray-100 relative group">
              <img
                src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1000&h=1333&fit=crop"
                alt="Ravenza Collections"
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
            </div>

            {/* Hierarchy: Shop Name -> Category/Collection Name -> Description (strictly below image) */}
            <div className="mt-5 space-y-2">
              <span className="text-xs font-bold tracking-[0.25em] uppercase text-gray-400 block">
                RAVENZA
              </span>
              <h3 className="text-xl md:text-2xl font-bold uppercase tracking-wide text-black">
                Signature Editions
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed max-w-md">
                Carefully crafted statement silhouettes engineered from heavyweight textiles, designed for effortless daily layering.
              </p>
              <div className="pt-2">
                <Link
                  to="/shop"
                  className="inline-block text-xs font-bold tracking-widest uppercase text-black border-b-2 border-black pb-1 hover:text-gray-600 hover:border-gray-600 transition-colors"
                >
                  EXPLORE ALL
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Right Side - 4 Elevated Cards in 2x2 Grid with generous gap and increased height */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8">
            {finalCards.map((category, i) => (
              <motion.div
                key={category.id || i}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="group flex flex-col h-full"
              >
                <Link to={`/collections/${category.slug}`} className="flex flex-col h-full">
                  {/* Taller Card Image Container with overflow hidden to prevent overlapping */}
                  <div className="w-full aspect-[3/4] overflow-hidden bg-gray-100 relative">
                    <img
                      src={category.cover_image_url || 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=800&h=1000&fit=crop'}
                      alt={category.name}
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                    {category.badge && (
                      <span className="absolute top-3 left-3 bg-black text-white text-[10px] font-bold tracking-wider uppercase px-2.5 py-1">
                        {category.badge}
                      </span>
                    )}
                  </div>

                  {/* Hierarchy: Shop Name -> Category Name -> Description (No third title, placed neatly below image) */}
                  <div className="mt-4 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-gray-400 block mb-1">
                        RAVENZA
                      </span>
                      <h4 className="text-base font-bold uppercase tracking-wide text-black group-hover:text-neutral-700 transition-colors">
                        {category.name}
                      </h4>
                      {category.description && (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                          {category.description}
                        </p>
                      )}
                    </div>
                    <div className="mt-3">
                      <span className="text-xs font-semibold uppercase tracking-wider text-black group-hover:underline">
                        Shop {category.name} →
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
            
            {/* Fallback placeholder if categories are empty */}
            {finalCards.length === 0 && (
              <div className="col-span-full py-16 text-center border-2 border-dashed border-gray-200 rounded-xl text-gray-400">
                <p className="text-sm">No featured categories yet. Set them in the Admin Panel.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
