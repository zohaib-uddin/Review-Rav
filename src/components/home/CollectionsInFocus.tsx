import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { useEffect } from 'react';

// Animation Variants for Premium Feel
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { staggerChildren: 0.15, delayChildren: 0.2 }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1, 
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] }
  }
};

const imageVariants = {
  hidden: { scale: 1.15, opacity: 0 },
  visible: { 
    scale: 1, 
    opacity: 1, 
    transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1] }
  }
};

const textVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.6, delay: 0.3, ease: "easeOut" }
  }
};

export default function CollectionsInFocus() {
  const { featuredCategories, categories, fetchFeaturedCategories, fetchCategories } = useStore();
  
  useEffect(() => {
    fetchFeaturedCategories();
    fetchCategories();
  }, [fetchFeaturedCategories, fetchCategories]);

  // Dynamic Logic: Featured -> Store Active -> Fallback Defaults
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

  const fromFeatured = (featuredCategories || [])
    .filter((c) => c.is_active !== false && c.is_featured_in_focus !== false)
    .sort((a, b) => (a.display_order_in_focus || 0) - (b.display_order_in_focus || 0));

  const fromStoreCats = (categories || [])
    .filter((c) => c.is_active !== false && c.is_featured_in_focus !== false)
    .sort((a, b) => (a.display_order_in_focus || 0) - (b.display_order_in_focus || 0));

  const activeCandidates = fromFeatured.length > 0 
    ? fromFeatured 
    : (fromStoreCats.length > 0 ? fromStoreCats : curatedDefaults);

  const finalCards = activeCandidates.slice(0, 4).map((c, i) => ({
    ...c,
    focus_image_url: c.focus_image_url || c.cover_image_url || curatedDefaults[i % curatedDefaults.length].cover_image_url,
    cover_image_url: c.focus_image_url || c.cover_image_url || curatedDefaults[i % curatedDefaults.length].cover_image_url,
    description: c.description || curatedDefaults[i % curatedDefaults.length].description,
    badge: c.badge || curatedDefaults[i % curatedDefaults.length].badge,
  }));

  // Check if we are still loading dynamic data
  const isLoading = !featuredCategories || featuredCategories.length === 0;
  
  return (
    <section className="py-20 bg-white border-t border-gray-100 overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Animated Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-12 text-center md:text-left"
        >
          <p className="text-xs font-bold tracking-[0.3em] uppercase text-gray-400 mb-2">CURATED SELECTION</p>
          <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight text-black">Collections in Focus</h2>
        </motion.div>

        {/* Split Layout Grid */}
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          
          {/* Left Side - Large Showcase Card OR Skeleton */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-5 flex flex-col"
          >
            {isLoading ? (
              <div className="w-full aspect-[3/4] bg-gray-100 rounded-sm animate-pulse shadow-inner" />
            ) : (
              <div className="w-full aspect-[3/4] overflow-hidden bg-gray-100 relative group shadow-xl rounded-sm">
                <motion.img
                  variants={imageVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1000&h=1333&fit=crop"
                  alt="Ravenza Collections"
                  className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-110"
                />
              </div>
            )}

            {/* Text Content with Slide-Up Animation OR Skeleton */}
            <motion.div 
              variants={textVariants} 
              initial="hidden" 
              whileInView="visible" 
              viewport={{ once: true }} 
              className="mt-6 space-y-3"
            >
              {isLoading ? (
                <>
                  <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
                  <div className="h-8 w-3/4 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse mt-2" />
                  <div className="h-3 w-32 bg-gray-200 rounded animate-pulse mt-4" />
                </>
              ) : (
                <>
                  <span className="text-xs font-bold tracking-[0.25em] uppercase text-gray-400 block">
                    RAVENZA
                  </span>
                  <h3 className="text-xl md:text-2xl font-bold uppercase tracking-wide text-black">
                    Signature Editions
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed max-w-md">
                    Carefully crafted statement silhouettes engineered from heavyweight textiles, designed for effortless daily layering.
                  </p>
                  <div className="pt-3">
                    <Link
                      to="/shop"
                      className="inline-flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-black border-b-2 border-black pb-1 hover:text-neutral-600 hover:border-neutral-600 transition-all duration-300 group/link"
                    >
                      EXPLORE ALL
                      <span className="transform translate-x-0 group-hover/link:translate-x-1 transition-transform">→</span>
                    </Link>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>

          {/* Right Side - 4 Elevated Cards in 2x2 Grid OR Skeletons */}
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div 
                key="skeleton-grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8"
              >
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex flex-col h-full">
                    <div className="w-full aspect-[3/4] bg-gray-100 rounded-sm animate-pulse shadow-inner" />
                    <div className="mt-4 space-y-3">
                      <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
                      <div className="h-5 w-3/4 bg-gray-200 rounded animate-pulse" />
                      <div className="h-3 w-full bg-gray-200 rounded animate-pulse" />
                      <div className="h-3 w-1/2 bg-gray-200 rounded animate-pulse" />
                      <div className="h-3 w-24 bg-gray-200 rounded animate-pulse mt-4" />
                    </div>
                  </div>
                ))}
              </motion.div>
            ) : (
              <motion.div 
                key="real-cards"
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8"
              >
                {finalCards.map((category, i) => (
                  <motion.div
                    key={category.id || i}
                    variants={cardVariants}
                    className="group flex flex-col h-full cursor-pointer"
                  >
                    <Link to={`/collections/${category.slug}`} className="flex flex-col h-full">
                      
                      {/* Image Container with Zoom Reveal */}
                      <div className="w-full aspect-[3/4] overflow-hidden bg-gray-100 relative shadow-lg rounded-sm">
                        <motion.img
                          variants={imageVariants}
                          initial="hidden"
                          whileInView="visible"
                          viewport={{ once: true }}
                          src={category.focus_image_url || category.cover_image_url || 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=800&h=1000&fit=crop'}
                          alt={category.name}
                          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                        />
                        
                        {/* Badge Overlay */}
                        {category.badge && (
                          <motion.span 
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.4 + (i * 0.1) }}
                            className="absolute top-3 left-3 bg-black/90 backdrop-blur-sm text-white text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 shadow-md"
                          >
                            {category.badge}
                          </motion.span>
                        )}
                      </div>

                      {/* Text Content with Hover Lift Effect */}
                      <div className="mt-4 flex-1 flex flex-col justify-between transition-transform duration-300 group-hover:-translate-y-1">
                        <div>
                          <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-gray-400 block mb-1.5">
                            RAVENZA
                          </span>
                          <h4 className="text-base font-bold uppercase tracking-wide text-black group-hover:text-neutral-800 transition-colors">
                            {category.name}
                          </h4>
                          {category.description && (
                            <p className="text-xs text-gray-500 mt-1.5 line-clamp-2 leading-relaxed">
                              {category.description}
                            </p>
                          )}
                        </div>
                        <div className="mt-4 pt-2 border-t border-gray-100">
                          <span className="text-xs font-semibold uppercase tracking-wider text-black group-hover:underline decoration-2 underline-offset-4 transition-all">
                            Shop {category.name} →
                          </span>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}