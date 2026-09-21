import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useStore } from '../store/useStore';

interface MegaMenuProps {
  category: any;
}

export default function MegaMenu({ category }: MegaMenuProps) {
  const { products, categories } = useStore();
  const [activeItem, setActiveItem] = useState<any>(category);

  // Sync activeItem when category changes
  useEffect(() => {
    setActiveItem(category);
  }, [category]);

  // Subcategories for current main category
  const subcategories = categories.filter(cat => cat.parent_id === category.id);

  // Match products for the active (hovered or parent) category
  const activeProducts = products.filter(p => {
    const pCat = (p.category || '').toLowerCase();
    const pSlug = ((p as any).category_slug || '').toLowerCase();
    const pCatId = (p as any).category_id;
    const targetSlug = (activeItem.slug || '').toLowerCase();
    const targetName = (activeItem.name || '').toLowerCase();

    return (
      pCat === targetSlug ||
      pSlug === targetSlug ||
      pCatId === activeItem.id ||
      pCat === targetName ||
      pCat.includes(targetSlug) ||
      (targetSlug && pCat.includes(targetSlug.replace(/-/g, ' ')))
    );
  });

  // Fallback to top products if category products are few
  const displayProducts = activeProducts.length > 0
    ? activeProducts.slice(0, 6)
    : products.slice(0, 6);

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 6 }}
      transition={{ duration: 0.15 }}
      className="absolute top-full left-1/2 -translate-x-1/2 w-[1240px] max-w-[96vw] bg-white shadow-2xl border-t-2 border-black z-50 rounded-b-2xl overflow-hidden pointer-events-auto"
    >
      <div className="grid grid-cols-12 gap-6 p-7">
        {/* Left Side - Subcategories & Navigation */}
        <div className="col-span-3 border-r border-gray-100 pr-6">
          <div
            onMouseEnter={() => setActiveItem(category)}
            className="cursor-pointer mb-4 pb-3 border-b border-gray-100"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold uppercase tracking-wider text-black">
                {category.name}
              </h3>
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                All
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{category.tag || 'Explore all styles'}</p>
          </div>

          <div className="space-y-1">
            {subcategories.length > 0 ? (
              subcategories.map(subcat => {
                const isSelected = activeItem.id === subcat.id;
                const count = products.filter(p =>
                  p.category === subcat.slug || (p as any).category_id === subcat.id
                ).length;

                return (
                  <Link
                    key={subcat.id || subcat.slug}
                    to={`/collections/${subcat.slug}`}
                    onMouseEnter={() => setActiveItem(subcat)}
                    className={`flex justify-between items-center px-3 py-2 rounded-xl transition-all duration-200 group ${
                      isSelected
                        ? 'bg-black text-white shadow-sm font-semibold'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-black font-medium'
                    }`}
                  >
                    <span className="text-sm tracking-tight">{subcat.name}</span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full transition-colors ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : 'bg-gray-100 text-gray-400 group-hover:text-gray-700'
                      }`}
                    >
                      {count > 0 ? count : ''}
                    </span>
                  </Link>
                );
              })
            ) : (
              <div className="py-4">
                <p className="text-xs text-gray-400 uppercase tracking-widest">Full Collection</p>
                <p className="text-xs text-gray-500 mt-1">Browse our complete selection below</p>
              </div>
            )}
          </div>

          <Link
            to={`/collections/${category.slug}`}
            className="mt-6 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-black hover:gap-3 transition-all pt-3 border-t border-gray-100 w-full"
          >
            View All {category.name} <ArrowRight size={14} />
          </Link>
        </div>

        {/* Center - Dynamic Product Cards on Hover */}
        <div className="col-span-6 px-2">
          <div className="flex items-center justify-between mb-3.5">
            <h4 className="text-xs font-bold uppercase tracking-widest text-gray-500 flex items-center gap-1.5">
              <Sparkles size={13} className="text-amber-500" />
              {activeItem.name} — Highlights
            </h4>
            <Link
              to={`/collections/${activeItem.slug}`}
              className="text-xs text-gray-400 hover:text-black transition-colors"
            >
              See all ({activeProducts.length || displayProducts.length})
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {displayProducts.map((product) => {
              const displayImage = product.image_url || product.image || product.images?.[0] || 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&h=1000&fit=crop';
              const price = product.price || 0;
              const comparePrice = product.comparePrice;

              return (
                <Link
                  key={product.id}
                  to={`/products/${product.slug || product.id}`}
                  className="group block"
                >
                  <div className="aspect-[3/4] rounded-xl overflow-hidden bg-gray-100 mb-2 relative shadow-sm">
                    <img
                      src={displayImage}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    {product.badge && (
                      <span className="absolute top-2 left-2 bg-black/80 backdrop-blur-sm text-white text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                        {product.badge}
                      </span>
                    )}
                  </div>
                  <h5 className="text-xs font-medium text-gray-800 line-clamp-1 group-hover:text-black transition-colors">
                    {product.name}
                  </h5>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs font-bold text-black">
                      Rs. {price.toLocaleString()}
                    </span>
                    {comparePrice && comparePrice > price && (
                      <span className="text-[10px] text-gray-400 line-through">
                        Rs. {comparePrice.toLocaleString()}
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Right Side - Category Details on Hover */}
        <div className="col-span-3 border-l border-gray-100 pl-6 flex flex-col justify-between">
          <div>
            <div className="aspect-[4/3] rounded-xl overflow-hidden mb-3 bg-gray-100 shadow-sm relative">
              <img
                src={
                  activeItem.cover_image_url ||
                  category.cover_image_url ||
                  'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=800&h=1000&fit=crop'
                }
                alt={activeItem.name}
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
              />
              {activeItem.badge && (
                <span className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm text-black text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                  {activeItem.badge}
                </span>
              )}
            </div>

            {activeItem.tag && (
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-1">
                {activeItem.tag}
              </p>
            )}
            <h4 className="text-lg font-bold text-black leading-tight mb-2">
              {activeItem.name}
            </h4>
            <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed mb-4">
              {activeItem.description || `Discover the finest ${activeItem.name} crafted with premium heavyweight cotton and signature streetwear tailoring.`}
            </p>
          </div>

          <Link
            to={`/collections/${activeItem.slug}`}
            className="inline-flex items-center justify-center gap-2 bg-black text-white px-5 py-3 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-gray-800 transition-colors w-full text-center shadow-sm"
          >
            Explore {activeItem.name} <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
