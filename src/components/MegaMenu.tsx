import { useState, useEffect, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { useStore } from '../store/useStore';

interface MegaMenuProps {
  category: any;
}

export default function MegaMenu({ category }: MegaMenuProps) {
  const { products, categories } = useStore();
  const [activeItem, setActiveItem] = useState<any>(category);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Sync activeItem when category changes
  useEffect(() => {
    setActiveItem(category);
  }, [category]);

  // Subcategories for current main category
  const subcategories = useMemo(
    () => categories.filter((cat) => cat.parent_id === category.id && cat.is_active !== false),
    [categories, category.id]
  );

  // Check if activeItem is a subcategory
  const isSubcategory = Boolean(activeItem.parent_id);

  // Match products dynamically for the active (hovered subcategory or parent) category
  const activeProducts = useMemo(() => {
    if (isSubcategory) {
      // Strictly subcategory: ONLY products assigned to this subcategory
      return products.filter((p) => {
        const subId = p.subcategory_id;
        const subSlug = ((p as any).subcategory_slug || '').toLowerCase();
        const pCatSlug = ((p as any).category_slug || p.category || '').toLowerCase();
        const targetSlug = (activeItem.slug || '').toLowerCase();

        return (
          subId === activeItem.id ||
          subSlug === targetSlug ||
          p.category_id === activeItem.id ||
          pCatSlug === targetSlug
        );
      });
    }

    // Main Category: products assigned to this category OR any of its subcategories
    const childIds = subcategories.map((s) => s.id);
    const childSlugs = subcategories.map((s) => (s.slug || '').toLowerCase());
    const targetSlug = (activeItem.slug || '').toLowerCase();

    return products.filter((p) => {
      const pCatSlug = ((p as any).category_slug || p.category || '').toLowerCase();
      const pSubSlug = ((p as any).subcategory_slug || '').toLowerCase();
      const matchesMain =
        p.category_id === activeItem.id ||
        pCatSlug === targetSlug;
      const matchesChild =
        (p.subcategory_id && childIds.includes(p.subcategory_id)) ||
        (pSubSlug && childSlugs.includes(pSubSlug)) ||
        childSlugs.includes(pCatSlug);

      return matchesMain || matchesChild;
    });
  }, [products, activeItem, isSubcategory, subcategories]);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -220, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 220, behavior: 'smooth' });
    }
  };

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
            className={`cursor-pointer mb-4 pb-3 border-b border-gray-100 transition-colors p-2 rounded-lg ${
              activeItem.id === category.id ? 'bg-neutral-50' : 'hover:bg-neutral-50/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-black">
                {category.name}
              </h3>
              <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-600 bg-neutral-200 px-2 py-0.5 rounded">
                All
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
              {category.tag || 'Explore all styles in this collection'}
            </p>
          </div>

          <div className="space-y-1">
            {subcategories.length > 0 ? (
              subcategories.map((subcat) => {
                const isSelected = activeItem.id === subcat.id;
                const count = products.filter(
                  (p) =>
                    p.subcategory_id === subcat.id ||
                    ((p as any).subcategory_slug || '').toLowerCase() === (subcat.slug || '').toLowerCase() ||
                    p.category === subcat.slug ||
                    p.category_id === subcat.id
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
                    <span className="text-xs tracking-tight">{subcat.name}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full transition-colors ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : 'bg-gray-100 text-gray-500 group-hover:text-gray-800'
                      }`}
                    >
                      {count}
                    </span>
                  </Link>
                );
              })
            ) : (
              <div className="py-4">
                <p className="text-xs text-gray-400 uppercase tracking-widest">Full Collection</p>
                <p className="text-xs text-gray-500 mt-1">Browse our complete selection</p>
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

        {/* Center - Dynamic Product Cards on Hover with Horizontal Scrolling if > 3 products */}
        <div className="col-span-6 px-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3.5">
              <h4 className="text-xs font-bold uppercase tracking-widest text-gray-500 flex items-center gap-1.5">
                <Sparkles size={13} className="text-amber-500" />
                {activeItem.name} — Products ({activeProducts.length})
              </h4>
              <div className="flex items-center gap-2">
                {activeProducts.length > 3 && (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={scrollLeft}
                      className="p-1 border border-gray-200 rounded-full hover:bg-neutral-100 text-neutral-700 transition-colors"
                      aria-label="Scroll left"
                    >
                      <ChevronLeft size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={scrollRight}
                      className="p-1 border border-gray-200 rounded-full hover:bg-neutral-100 text-neutral-700 transition-colors"
                      aria-label="Scroll right"
                    >
                      <ChevronRight size={14} />
                    </button>
                  </div>
                )}
                <Link
                  to={`/collections/${activeItem.slug}`}
                  className="text-xs font-semibold text-neutral-600 hover:text-black transition-colors"
                >
                  View All
                </Link>
              </div>
            </div>

            {activeProducts.length > 0 ? (
              activeProducts.length > 3 ? (
                /* Horizontal scrolling container if product count > 3 */
                <div
                  ref={scrollRef}
                  className="flex gap-3 overflow-x-auto pb-2 scroll-smooth scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent snap-x"
                >
                  {activeProducts.map((product) => {
                    const displayImage =
                      product.image_url ||
                      product.image ||
                      product.images?.[0] ||
                      'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&h=1000&fit=crop';
                    const price = product.price || product.base_price || 0;
                    const comparePrice = product.comparePrice || product.compare_at_price;
                    const isOutOfStock = Boolean(
                      (product.stockCount !== undefined && Number(product.stockCount) <= 0) ||
                      (product.stock !== undefined && Number(product.stock) <= 0) ||
                      product.inStock === false ||
                      (product as any).is_in_stock === false
                    );

                    return (
                      <Link
                        key={product.id}
                        to={`/products/${product.slug || product.id}`}
                        className="group flex-shrink-0 w-[155px] snap-start block text-left"
                      >
                        <div className="aspect-[3/4] rounded-lg overflow-hidden bg-gray-100 mb-2 relative shadow-sm border border-gray-100">
                          <img
                            src={displayImage}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                          />
                          {isOutOfStock ? (
                            <span className="absolute top-1.5 left-1.5 bg-neutral-900 text-white text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                              SOLD
                            </span>
                          ) : product.badge ? (
                            <span className="absolute top-1.5 left-1.5 bg-black/80 backdrop-blur-sm text-white text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                              {product.badge}
                            </span>
                          ) : null}
                        </div>
                        <h5 className="text-[11px] font-medium text-gray-800 line-clamp-1 group-hover:text-black transition-colors">
                          {product.name}
                        </h5>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[11px] font-bold text-black font-mono">
                            Rs. {price.toLocaleString()}
                          </span>
                          {comparePrice && comparePrice > price && (
                            <span className="text-[9px] text-gray-400 line-through font-mono">
                              Rs. {comparePrice.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                /* Standard 3-column grid if <= 3 products */
                <div className="grid grid-cols-3 gap-3">
                  {activeProducts.map((product) => {
                    const displayImage =
                      product.image_url ||
                      product.image ||
                      product.images?.[0] ||
                      'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&h=1000&fit=crop';
                    const price = product.price || product.base_price || 0;
                    const comparePrice = product.comparePrice || product.compare_at_price;
                    const isOutOfStock = Boolean(
                      (product.stockCount !== undefined && Number(product.stockCount) <= 0) ||
                      (product.stock !== undefined && Number(product.stock) <= 0) ||
                      product.inStock === false ||
                      (product as any).is_in_stock === false
                    );

                    return (
                      <Link
                        key={product.id}
                        to={`/products/${product.slug || product.id}`}
                        className="group block text-left"
                      >
                        <div className="aspect-[3/4] rounded-lg overflow-hidden bg-gray-100 mb-2 relative shadow-sm border border-gray-100">
                          <img
                            src={displayImage}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                          />
                          {isOutOfStock ? (
                            <span className="absolute top-1.5 left-1.5 bg-neutral-900 text-white text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                              SOLD
                            </span>
                          ) : product.badge ? (
                            <span className="absolute top-1.5 left-1.5 bg-black/80 backdrop-blur-sm text-white text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                              {product.badge}
                            </span>
                          ) : null}
                        </div>
                        <h5 className="text-[11px] font-medium text-gray-800 line-clamp-1 group-hover:text-black transition-colors">
                          {product.name}
                        </h5>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[11px] font-bold text-black font-mono">
                            Rs. {price.toLocaleString()}
                          </span>
                          {comparePrice && comparePrice > price && (
                            <span className="text-[9px] text-gray-400 line-through font-mono">
                              Rs. {comparePrice.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )
            ) : (
              <div className="text-center py-12 bg-neutral-50 rounded-xl border border-dashed border-neutral-200">
                <p className="text-xs font-semibold text-neutral-500">
                  No products in {activeItem.name} yet
                </p>
                <Link
                  to={`/collections/${category.slug}`}
                  className="inline-block mt-2 text-[11px] font-bold text-black underline uppercase tracking-wider"
                >
                  View full {category.name} collection
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Right Side - Category Details on Hover with 16:9 Aspect Ratio Banner */}
        <div className="col-span-3 border-l border-gray-100 pl-6 flex flex-col justify-between">
          <div>
            <div className="aspect-[16/9] rounded-xl overflow-hidden mb-3 bg-gray-100 shadow-sm relative">
              <img
                src={
                  activeItem.cover_image_url ||
                  category.cover_image_url ||
                  'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1920&h=1080&fit=crop'
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
              {activeItem.description ||
                `Discover the finest ${activeItem.name} crafted with premium heavyweight cotton and signature streetwear tailoring.`}
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

