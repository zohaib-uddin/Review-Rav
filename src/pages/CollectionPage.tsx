import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutGrid, Grid3X3, Filter } from 'lucide-react';
import { useStore } from '../store/useStore';
import QuickViewModal from '../components/collection/QuickViewModal';
import ProductCard from '../components/ProductCard';
import MiniProductCard from '../components/MiniProductCard';

export default function CollectionPage() {
  const { categorySlug } = useParams<{ categorySlug?: string }>();
  const navigate = useNavigate();
  const { products, categories, isLoading, fetchProducts, fetchCategories } = useStore();
  const [quickViewProduct, setQuickViewProduct] = useState<any>(null);

  // Layout & Filter states
  const [gridDensity, setGridDensity] = useState<'standard' | 'dense'>('standard');
  const [sortBy, setSortBy] = useState('featured');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  const [maxPriceFilter, setMaxPriceFilter] = useState<number>(50000);
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);

  useEffect(() => {
    if (products.length === 0) fetchProducts();
    if (categories.length === 0) fetchCategories();
  }, []);

  const normalizedSlug = categorySlug ? decodeURIComponent(categorySlug).toLowerCase().trim() : '';

  // Match category by slug, id, or normalized name
  const matchedCategory = categories.find(
    (c) =>
      c.slug?.toLowerCase() === normalizedSlug ||
      c.id?.toLowerCase() === normalizedSlug ||
      c.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-') === normalizedSlug
  );

  const isSubcategory = Boolean(matchedCategory?.parent_id);
  const parentCategory = isSubcategory
    ? categories.find((c) => c.id === matchedCategory?.parent_id)
    : null;

  const category =
    matchedCategory ||
    (categorySlug
      ? {
          id: categorySlug,
          name: categorySlug
            .split('-')
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(' '),
          slug: categorySlug,
          parent_id: null,
          description: `Explore our premium ${categorySlug.replace(/-/g, ' ')} streetwear collection.`,
          cover_image_url:
            'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=1600&h=900&fit=crop',
          is_active: true,
          sort_order: 1,
        }
      : null);

  // Subcategories to display in pills navigation & hero loop
  const subcategories = useMemo(() => {
    if (!category) return [];
    if (isSubcategory && parentCategory) {
      return categories.filter((c) => c.parent_id === parentCategory.id && c.is_active !== false);
    }
    return categories.filter((c) => c.parent_id === matchedCategory?.id && c.is_active !== false);
  }, [category, isSubcategory, parentCategory, matchedCategory, categories]);

  const mainCategorySlug = isSubcategory && parentCategory ? parentCategory.slug : categorySlug;
  const mainCategoryName = isSubcategory && parentCategory ? parentCategory.name : category?.name;

  // Hero images list for 4-second loop
  const heroImages = useMemo(() => {
    const list: string[] = [];
    if (matchedCategory?.cover_image_url) list.push(matchedCategory.cover_image_url);
    if (isSubcategory && parentCategory?.cover_image_url && !list.includes(parentCategory.cover_image_url)) {
      list.push(parentCategory.cover_image_url);
    }
    subcategories.forEach((sub: any) => {
      if (sub.cover_image_url && !list.includes(sub.cover_image_url)) {
        list.push(sub.cover_image_url);
      }
    });
    if (list.length === 0) {
      list.push('');
    }
    return list;
  }, [matchedCategory, isSubcategory, parentCategory, subcategories]);

  // Auto-rotate hero images every 4 seconds with animation
  useEffect(() => {
    if (heroImages.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentHeroIndex((prev) => (prev + 1) % heroImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [heroImages]);

  // Base collection products
  const baseCollectionProducts = useMemo(() => {
    if (!categorySlug || categorySlug === 'all') return products;
    if (products.length === 0) return [];

    if (isSubcategory && matchedCategory) {
      return products.filter((p) => {
        const subId = p.subcategory_id;
        const subSlug = ((p as any).subcategory_slug || '').toLowerCase();
        const pCatSlug = ((p as any).category_slug || p.category || '').toLowerCase();

        return (
          subId === matchedCategory.id ||
          subSlug === normalizedSlug ||
          pCatSlug === normalizedSlug ||
          p.category_id === matchedCategory.id
        );
      });
    }

    const childSubcategoryIds = matchedCategory
      ? categories.filter((c) => c.parent_id === matchedCategory.id).map((c) => c.id)
      : [];
    const childSubcategorySlugs = matchedCategory
      ? categories.filter((c) => c.parent_id === matchedCategory.id).map((c) => (c.slug || '').toLowerCase())
      : [];

    return products.filter((p) => {
      const pCatSlug = ((p as any).category_slug || p.category || '').toLowerCase();
      const pCatId = p.category_id;
      const pSubId = p.subcategory_id;
      const pSubSlug = ((p as any).subcategory_slug || '').toLowerCase();

      const matchesMain =
        pCatSlug === normalizedSlug ||
        (matchedCategory && pCatId === matchedCategory.id);

      const matchesChildSub =
        (pSubId && childSubcategoryIds.includes(pSubId)) ||
        (pSubSlug && childSubcategorySlugs.includes(pSubSlug)) ||
        childSubcategorySlugs.includes(pCatSlug);

      return matchesMain || matchesChildSub;
    });
  }, [categorySlug, products, categories, matchedCategory, normalizedSlug, isSubcategory]);

  const maxPossiblePrice = useMemo(() => {
    if (products.length === 0) return 50000;
    const max = Math.max(...products.map((p) => Number(p.base_price || p.price || 0)));
    return Math.max(max, 10000);
  }, [products]);

  useEffect(() => {
    setMaxPriceFilter(maxPossiblePrice);
  }, [maxPossiblePrice]);

  // Filtered and Sorted products
  const filteredProducts = useMemo(() => {
    let list = [...baseCollectionProducts];

    // Availability Filter
    if (availabilityFilter === 'in_stock') {
      list = list.filter((p) => {
        const isOutOfStock =
          (p.stockCount !== undefined && Number(p.stockCount) <= 0) ||
          (p.stock !== undefined && Number(p.stock) <= 0) ||
          p.inStock === false ||
          (p as any).is_in_stock === false;
        return !isOutOfStock;
      });
    } else if (availabilityFilter === 'out_of_stock') {
      list = list.filter((p) => {
        const isOutOfStock =
          (p.stockCount !== undefined && Number(p.stockCount) <= 0) ||
          (p.stock !== undefined && Number(p.stock) <= 0) ||
          p.inStock === false ||
          (p as any).is_in_stock === false;
        return isOutOfStock;
      });
    }

    // Price Filter (Min to Max)
    list = list.filter((p) => {
      const price = Number(p.base_price || p.price || 0);
      return price <= maxPriceFilter;
    });

    // Sorting
    switch (sortBy) {
      case 'most-relevant':
        list.sort((a, b) => (b.view_count || 0) - (a.view_count || 0));
        break;
      case 'best-selling':
        list.sort((a, b) => ((b.is_best_seller || (b as any).isBestseller) ? 1 : 0) - ((a.is_best_seller || (a as any).isBestseller) ? 1 : 0));
        break;
      case 'alphabetical-az':
        list.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'alphabetical-za':
        list.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'price-low':
        list.sort((a, b) => Number(a.base_price || a.price || 0) - Number(b.base_price || b.price || 0));
        break;
      case 'price-high':
        list.sort((a, b) => Number(b.base_price || b.price || 0) - Number(a.base_price || a.price || 0));
        break;
      case 'date-old-new':
        list.sort((a, b) => new Date(a.created_at || '').getTime() - new Date(b.created_at || '').getTime());
        break;
      case 'date-new-old':
        list.sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime());
        break;
      default: // featured
        list.sort((a, b) => {
          if (a.is_featured && !b.is_featured) return -1;
          if (!a.is_featured && b.is_featured) return 1;
          return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime();
        });
        break;
    }

    return list;
  }, [baseCollectionProducts, availabilityFilter, maxPriceFilter, sortBy]);

  if (categories.length === 0 && products.length === 0 && isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xs font-bold uppercase tracking-widest text-neutral-500">
            Loading Collection...
          </p>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-4">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold uppercase tracking-tight mb-3">
            Category Not Found
          </h2>
          <p className="text-sm text-neutral-500 mb-6">
            The requested collection could not be found.
          </p>
          <Link
            to="/shop"
            className="inline-block px-6 py-3 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-neutral-800 transition-colors"
          >
            Explore All Collections
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section: Larger, original aspect ratio without cropping, zero text overlay */}
      <div className="w-full bg-neutral-950 relative overflow-hidden">
        <div className="w-full relative aspect-[16/9]">
          <AnimatePresence mode="wait">
            <motion.img
loading={currentHeroIndex === 0 ? "eager" : "lazy"}
fetchPriority={currentHeroIndex === 0 ? "high" : "low"}
              key={currentHeroIndex}
              src={heroImages[currentHeroIndex]}
              alt={category.name}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="w-full h-full object-cover object-center bg-neutral-900"
            />
          </AnimatePresence>
        </div>
      </div>

      {/* Title & Subcategory Navigation Bar below Hero */}
      <div className="bg-white border-b border-gray-200 py-6">
        <div className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-neutral-500 mb-2">
            <Link to="/" className="hover:text-black transition-colors">Home</Link>
            <span>/</span>
            <Link to="/shop" className="hover:text-black transition-colors">Collections</Link>
            {isSubcategory && parentCategory && (
              <>
                <span>/</span>
                <Link to={`/collections/${parentCategory.slug}`} className="hover:text-black transition-colors">
                  {parentCategory.name}
                </Link>
              </>
            )}
            <span>/</span>
            <span className="text-black font-semibold">{category.name}</span>
          </nav>

          <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-black">
            {category.name}
          </h1>

          {/* Subcategory Pills */}
          {subcategories.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none mt-4 pt-1">
              <Link
                to={`/collections/${mainCategorySlug}`}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-colors rounded-sm ${
                  !isSubcategory
                    ? 'bg-black text-white shadow-sm'
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 hover:text-black'
                }`}
              >
                All {mainCategoryName}
              </Link>
              {subcategories.map((sub: any) => {
                const isSubActive =
                  normalizedSlug === (sub.slug || '').toLowerCase() ||
                  matchedCategory?.id === sub.id;
                return (
                  <Link
                    key={sub.slug || sub.id}
                    to={`/collections/${sub.slug}`}
                    className={`px-4 py-2 text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-colors rounded-sm ${
                      isSubActive
                        ? 'bg-black text-white shadow-sm'
                        : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 hover:text-black'
                    }`}
                  >
                    {sub.name}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Top Filtering Bar (No left sidebar): Availability & Price Dropdowns on Left, Total items & Sort & Grid Switcher on Right */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-xs">
        <div className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            
            {/* Left Side: Availability & Price Dropdowns */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-neutral-500">
                <Filter size={14} />
                <span>Filters:</span>
              </div>

              {/* Availability Dropdown */}
              <select
                value={availabilityFilter}
                onChange={(e) => setAvailabilityFilter(e.target.value)}
                className="text-xs font-bold uppercase tracking-wider border border-gray-300 px-3 py-2 bg-white hover:border-black cursor-pointer rounded"
              >
                <option value="all">Availability: All</option>
                <option value="in_stock">In Stock</option>
                <option value="out_of_stock">Out of Stock</option>
              </select>

              {/* Price Dropdown / Filter */}
              <select
                value={maxPriceFilter}
                onChange={(e) => setMaxPriceFilter(Number(e.target.value))}
                className="text-xs font-bold uppercase tracking-wider border border-gray-300 px-3 py-2 bg-white hover:border-black cursor-pointer rounded"
              >
                <option value={maxPossiblePrice}>Price: Up to Max (Rs. {maxPossiblePrice.toLocaleString()})</option>
                <option value={5000}>Up to Rs. 5,000</option>
                <option value={10000}>Up to Rs. 10,000</option>
                <option value={20000}>Up to Rs. 20,000</option>
                <option value={35000}>Up to Rs. 35,000</option>
              </select>
            </div>

            {/* Right Side: Total Items Count, Sort Dropdown & Grid View Switcher */}
            <div className="flex items-center gap-3 ml-auto flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                Total Items: <span className="text-black font-black">{filteredProducts.length}</span>
              </span>

              {/* Sort Dropdown with all requested options */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-xs font-bold uppercase tracking-wider border border-gray-300 px-3 py-2 bg-white hover:border-black cursor-pointer rounded"
              >
                <option value="featured">Featured</option>
                <option value="most-relevant">Most Relevant</option>
                <option value="best-selling">Best Selling</option>
                <option value="alphabetical-az">Alphabetically A to Z</option>
                <option value="alphabetical-za">Alphabetically Z to A</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="date-old-new">Date: Old to New</option>
                <option value="date-new-old">Date: New to Old</option>
              </select>

              {/* Grid Density Switcher */}
              <div className="flex items-center border border-gray-300 rounded overflow-hidden p-0.5 bg-neutral-100">
                <button
                  type="button"
                  onClick={() => setGridDensity('standard')}
                  className={`flex items-center gap-1 px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer ${
                    gridDensity === 'standard' ? 'bg-black text-white' : 'text-neutral-600 hover:text-black'
                  }`}
                  title="Standard Grid"
                >
                  <LayoutGrid size={14} />
                  <span className="hidden sm:inline">Grid</span>
                </button>
                <button
                  type="button"
                  onClick={() => setGridDensity('dense')}
                  className={`flex items-center gap-1 px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer ${
                    gridDensity === 'dense' ? 'bg-black text-white' : 'text-neutral-600 hover:text-black'
                  }`}
                  title="Dense Mini Grid"
                >
                  <Grid3X3 size={14} />
                  <span className="hidden sm:inline">Dense</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Products Grid Section (Full width edge-to-edge start to end matching Shop All page) */}
      <div className="w-full px-0 sm:px-1 py-4">
        {(isLoading && products.length === 0) ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-6 gap-[4px]">
            {Array.from({ length: 12 }).map((_, i) => (
              <motion.div
                key={`col-skeleton-${i}`}
                initial={{ opacity: 0.5, scale: 0.96 }}
                animate={{
                  opacity: [0.5, 0.85, 0.5],
                  scale: [0.97, 1, 0.97],
                }}
                transition={{
                  duration: 1.6,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: (i % 6) * 0.1,
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
        ) : filteredProducts.length > 0 ? (
          gridDensity === 'dense' ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-10 xl:grid-cols-12 gap-1.5"
            >
              {filteredProducts.map((product) => (
                <MiniProductCard key={product.id} product={product} />
              ))}
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-6 gap-[4px]"
            >
              {filteredProducts.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} fullWidth />
              ))}
            </motion.div>
          )
        ) : (
          <div className="text-center py-24 bg-neutral-50 border border-dashed border-neutral-200 rounded-xl">
            <p className="text-xs font-bold uppercase tracking-widest text-neutral-600 mb-2">
              No products found
            </p>
            <p className="text-xs text-neutral-400 mb-5">
              Try changing your filter settings or availability selection
            </p>
            <button
              type="button"
              onClick={() => {
                setAvailabilityFilter('all');
                setMaxPriceFilter(maxPossiblePrice);
                setSortBy('featured');
              }}
              className="px-6 py-3 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Quick View Modal */}
      {quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          isOpen={!!quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
        />
      )}
    </div>
  );
}
