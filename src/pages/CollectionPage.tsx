import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal, LayoutGrid, Grid3X3, X } from 'lucide-react';
import { useStore } from '../store/useStore';
import QuickViewModal from '../components/collection/QuickViewModal';
import ProductCard from '../components/ProductCard';
import MiniProductCard from '../components/MiniProductCard';
import FilterSidebar, { FilterState } from '../components/collection/FilterSidebar';

export default function CollectionPage() {
  const { categorySlug } = useParams<{ categorySlug?: string }>();
  const navigate = useNavigate();
  const { products, categories, isLoading, fetchProducts, fetchCategories } = useStore();
  const [quickViewProduct, setQuickViewProduct] = useState<any>(null);

  // Layout & Filter states
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [gridDensity, setGridDensity] = useState<'standard' | 'dense'>('standard');
  const [sortBy, setSortBy] = useState('featured');

  // Unified Filter state
  const [filterState, setFilterState] = useState<FilterState>({
    categorySlug: categorySlug || '',
    sizes: [],
    colors: [],
    priceRange: [0, 50000],
    isBestSeller: false,
    isFeatured: false,
    isNewArrival: false,
    inStockOnly: false,
    availability: 'all',
    tags: [],
  });

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
            'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=1600&h=600&fit=crop',
          is_active: true,
          sort_order: 1,
          is_featured_in_focus: false,
          display_order_in_focus: 0,
        }
      : null);

  // Subcategories to display in pills navigation
  const subcategories = useMemo(() => {
    if (!category) return [];
    if (isSubcategory && parentCategory) {
      // Sibling subcategories of the same parent
      return categories.filter((c) => c.parent_id === parentCategory.id && c.is_active !== false);
    }
    // Direct child subcategories of this main category
    return categories.filter((c) => c.parent_id === matchedCategory?.id && c.is_active !== false);
  }, [category, isSubcategory, parentCategory, matchedCategory, categories]);

  // Main category for the "All" pill button
  const mainCategorySlug = isSubcategory && parentCategory ? parentCategory.slug : categorySlug;
  const mainCategoryName = isSubcategory && parentCategory ? parentCategory.name : category?.name;

  // 16:9 Aspect Ratio Hero Image Resolution:
  // If current category has a cover_image_url, use it.
  // Else if it is a subcategory without an image, fallback to parent category's cover_image_url!
  const heroImageUrl = useMemo(() => {
    if (matchedCategory?.cover_image_url) {
      return matchedCategory.cover_image_url;
    }
    if (isSubcategory && parentCategory?.cover_image_url) {
      return parentCategory.cover_image_url;
    }
    if (category?.cover_image_url) {
      return category.cover_image_url;
    }
    return 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=1920&h=1080&fit=crop';
  }, [matchedCategory, isSubcategory, parentCategory, category]);

  // Base collection products before sidebar filters
  const baseCollectionProducts = useMemo(() => {
    if (!categorySlug || categorySlug === 'all') return products;
    if (products.length === 0) return [];

    if (isSubcategory && matchedCategory) {
      // Subcategory page: ONLY include products strictly assigned to this subcategory
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

    // Main Category: include products in this main category + all products in its child subcategories
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

  // Extract available sizes and colors from this collection
  const availableSizes = useMemo(() => {
    const s = new Set<string>();
    baseCollectionProducts.forEach((p) => p.sizes?.forEach((sz: string) => s.add(sz)));
    return Array.from(s).sort();
  }, [baseCollectionProducts]);

  const availableColors = useMemo(() => {
    const cSet = new Set<string>();
    baseCollectionProducts.forEach((p) =>
      p.colors?.forEach((c: any) => {
        const cName = typeof c === 'string' ? c : c?.name;
        if (cName) cSet.add(cName);
      })
    );
    return Array.from(cSet).sort();
  }, [baseCollectionProducts]);

  const maxPossiblePrice = useMemo(() => {
    if (products.length === 0) return 50000;
    const max = Math.max(...products.map((p) => Number(p.base_price || p.price || 0)));
    return Math.max(max, 5000);
  }, [products]);

  // Sync categorySlug & maxPossiblePrice with filterState
  useEffect(() => {
    setFilterState((prev) => ({
      ...prev,
      categorySlug: categorySlug || '',
      priceRange: [0, maxPossiblePrice],
    }));
  }, [categorySlug, maxPossiblePrice]);

  // Apply detailed sidebar dynamic filtering
  const filteredProducts = useMemo(() => {
    let list = [...baseCollectionProducts];

    // Availability Filter (All, In Stock, Out of Stock/Sold)
    if (filterState.availability === 'in_stock' || filterState.inStockOnly) {
      list = list.filter((p) => {
        const isOutOfStock =
          (p.stockCount !== undefined && Number(p.stockCount) <= 0) ||
          (p.stock !== undefined && Number(p.stock) <= 0) ||
          p.inStock === false ||
          (p as any).is_in_stock === false;
        return !isOutOfStock;
      });
    } else if (filterState.availability === 'out_of_stock') {
      list = list.filter((p) => {
        const isOutOfStock =
          (p.stockCount !== undefined && Number(p.stockCount) <= 0) ||
          (p.stock !== undefined && Number(p.stock) <= 0) ||
          p.inStock === false ||
          (p as any).is_in_stock === false;
        return isOutOfStock;
      });
    }

    // Sizes
    if (filterState.sizes.length > 0) {
      list = list.filter((p) =>
        p.sizes?.some((s: string) => filterState.sizes.includes(s))
      );
    }

    // Colors
    if (filterState.colors.length > 0) {
      list = list.filter((p) =>
        p.colors?.some((c: any) => {
          const cName = typeof c === 'string' ? c : c?.name;
          return filterState.colors.includes(cName);
        })
      );
    }

    // Price range
    list = list.filter((p) => {
      const price = Number(p.base_price || p.price || 0);
      return price >= filterState.priceRange[0] && price <= filterState.priceRange[1];
    });

    // Best Seller
    if (filterState.isBestSeller) {
      list = list.filter((p) => p.is_best_seller || (p as any).isBestseller);
    }

    // Featured
    if (filterState.isFeatured) {
      list = list.filter((p) => p.is_featured || (p as any).isFeatured);
    }

    // New Arrival
    if (filterState.isNewArrival) {
      list = list.filter((p) => p.is_new_arrival || (p as any).isNew);
    }

    // Tags / Material / Fit
    if (filterState.tags.length > 0) {
      list = list.filter((p) => {
        const textToSearch = `${p.name} ${p.description || ''} ${p.fabric || ''} ${p.fabric_composition || ''} ${p.fit || ''}`.toLowerCase();
        return filterState.tags.some((tag) => textToSearch.includes(tag.toLowerCase()));
      });
    }

    // Sorting
    switch (sortBy) {
      case 'price-low':
        list.sort(
          (a, b) =>
            Number(a.base_price || a.price || 0) - Number(b.base_price || b.price || 0)
        );
        break;
      case 'price-high':
        list.sort(
          (a, b) =>
            Number(b.base_price || b.price || 0) - Number(a.base_price || a.price || 0)
        );
        break;
      case 'best-seller':
        list.sort(
          (a, b) =>
            (b.is_best_seller ? 1 : 0) - (a.is_best_seller ? 1 : 0)
        );
        break;
      case 'newest':
        list.sort(
          (a, b) =>
            new Date(b.created_at || '').getTime() -
            new Date(a.created_at || '').getTime()
        );
        break;
      default: // featured
        list.sort((a, b) => {
          if (a.is_featured && !b.is_featured) return -1;
          if (!a.is_featured && b.is_featured) return 1;
          return (
            new Date(b.created_at || '').getTime() -
            new Date(a.created_at || '').getTime()
          );
        });
        break;
    }

    return list;
  }, [baseCollectionProducts, filterState, sortBy]);

  const handleResetFilters = () => {
    setFilterState({
      categorySlug: categorySlug || '',
      sizes: [],
      colors: [],
      priceRange: [0, maxPossiblePrice],
      isBestSeller: false,
      isFeatured: false,
      isNewArrival: false,
      inStockOnly: false,
      availability: 'all',
      tags: [],
    });
  };

  const activeFilterCount =
    filterState.sizes.length +
    filterState.colors.length +
    (filterState.priceRange[0] > 0 || filterState.priceRange[1] < maxPossiblePrice ? 1 : 0) +
    (filterState.isBestSeller ? 1 : 0) +
    (filterState.isFeatured ? 1 : 0) +
    (filterState.isNewArrival ? 1 : 0) +
    (filterState.availability && filterState.availability !== 'all' ? 1 : 0) +
    filterState.tags.length;

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
          <p className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-2">
            Notice
          </p>
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
      {/* 16:9 Aspect Ratio Hero Section */}
      <div className="w-full bg-neutral-950">
        <div className="w-full relative aspect-[16/9] max-h-[580px] overflow-hidden select-none">
          <img
            src={heroImageUrl}
            alt={category.name}
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/25" />

          <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-10 md:p-14 text-white">
            <nav className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-white/70 mb-2.5">
              <Link to="/" className="hover:text-white transition-colors">
                Home
              </Link>
              <span>/</span>
              <Link to="/shop" className="hover:text-white transition-colors">
                Collections
              </Link>
              {isSubcategory && parentCategory && (
                <>
                  <span>/</span>
                  <Link
                    to={`/collections/${parentCategory.slug}`}
                    className="hover:text-white transition-colors"
                  >
                    {parentCategory.name}
                  </Link>
                </>
              )}
              <span>/</span>
              <span className="text-white font-semibold">{category.name}</span>
            </nav>

            {category.tag && (
              <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-amber-400 mb-1 font-bold">
                {category.tag}
              </span>
            )}

            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight text-white leading-none">
              {category.name}
            </h1>

            {category.description && (
              <p className="text-xs sm:text-sm text-white/80 mt-2.5 max-w-2xl leading-relaxed line-clamp-2">
                {category.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Subcategory Navigation Pills Bar (if category has subcategories or sibling subcategories) */}
      {subcategories.length > 0 && (
        <div className="bg-white border-b border-gray-200">
          <div className="w-full px-4 sm:px-6 py-2.5">
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-0.5">
              <Link
                to={`/collections/${mainCategorySlug}`}
                className={`px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wider whitespace-nowrap transition-colors rounded-sm ${
                  !isSubcategory
                    ? 'bg-black text-white shadow-sm'
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 hover:text-black'
                }`}
              >
                All {mainCategoryName}
              </Link>
              {subcategories.map((sub) => {
                const isSubActive =
                  normalizedSlug === (sub.slug || '').toLowerCase() ||
                  matchedCategory?.id === sub.id;
                const subProductCount = products.filter(
                  (p) =>
                    p.subcategory_id === sub.id ||
                    ((p as any).subcategory_slug || '').toLowerCase() === (sub.slug || '').toLowerCase() ||
                    p.category === sub.slug ||
                    p.category_id === sub.id
                ).length;

                return (
                  <Link
                    key={sub.slug || sub.id}
                    to={`/collections/${sub.slug}`}
                    className={`px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wider whitespace-nowrap transition-colors flex items-center gap-1.5 rounded-sm ${
                      isSubActive
                        ? 'bg-black text-white shadow-sm'
                        : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 hover:text-black'
                    }`}
                  >
                    <span>{sub.name}</span>
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded-full font-mono ${
                        isSubActive
                          ? 'bg-white/20 text-white'
                          : 'bg-neutral-200 text-neutral-600'
                      }`}
                    >
                      {subProductCount}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Sticky Top Controls Bar: Mobile Filters Toggle | Item Count | Grid Density | Sort */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-200">
        <div className="w-full px-3 sm:px-6 py-2.5">
          <div className="flex items-center justify-between gap-3">
            {/* Left Side: Mobile Filter button + item count */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(true)}
                className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 border border-black bg-white text-black hover:bg-black hover:text-white transition-colors text-[11px] font-bold uppercase tracking-wider cursor-pointer"
              >
                <SlidersHorizontal size={13} />
                <span>Filters</span>
                {activeFilterCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-black text-white text-[9px] flex items-center justify-center font-bold">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              <span className="text-[11px] font-semibold tracking-wider uppercase text-neutral-500">
                {filteredProducts.length} {filteredProducts.length === 1 ? 'item' : 'items'}
              </span>
            </div>

            {/* Right Side: Grid Density Switcher + Sort Dropdown */}
            <div className="flex items-center gap-2.5 sm:gap-3 ml-auto">
              {/* Grid Density Toggle: 6 / row vs 15 / row */}
              <div className="flex items-center border border-gray-300 rounded overflow-hidden p-0.5 bg-neutral-100">
                <button
                  type="button"
                  onClick={() => setGridDensity('standard')}
                  className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold transition-colors cursor-pointer ${
                    gridDensity === 'standard'
                      ? 'bg-black text-white shadow-xs'
                      : 'text-neutral-600 hover:text-black'
                  }`}
                  title="Standard Grid (6 products per row)"
                >
                  <LayoutGrid size={13} />
                  <span className="hidden sm:inline">6 / row</span>
                </button>

                <button
                  type="button"
                  onClick={() => setGridDensity('dense')}
                  className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold transition-colors cursor-pointer ${
                    gridDensity === 'dense'
                      ? 'bg-black text-white shadow-xs'
                      : 'text-neutral-600 hover:text-black'
                  }`}
                  title="Dense Mini Grid (15 products per row)"
                >
                  <Grid3X3 size={13} />
                  <span className="hidden sm:inline">15 / row</span>
                </button>
              </div>

              {/* Sort Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-[11px] font-bold uppercase tracking-wider border border-gray-300 px-2.5 py-1.5 bg-white hover:border-black cursor-pointer focus:outline-none"
              >
                <option value="featured">Featured</option>
                <option value="best-seller">Best Selling</option>
                <option value="newest">Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area: Left Permanent Sidebar (Desktop) + Right Products Grid */}
      <div className="w-full px-2 sm:px-6 py-6">
        <div className="flex items-start gap-6">
          {/* Permanent Left-Hand Sidebar (Desktop) */}
          <aside className="hidden lg:block w-60 sm:w-64 flex-shrink-0 sticky top-[60px] self-start z-10 pr-2">
            <FilterSidebar
              categories={categories}
              selectedCategory={filterState.categorySlug || categorySlug}
              onSelectCategory={(slug) => {
                navigate(`/collections/${slug}`);
              }}
              availableSizes={availableSizes}
              availableColors={availableColors}
              minPossiblePrice={0}
              maxPossiblePrice={maxPossiblePrice}
              filters={filterState}
              onFilterChange={setFilterState}
              onReset={handleResetFilters}
              totalProductsCount={baseCollectionProducts.length}
              filteredProductsCount={filteredProducts.length}
            />
          </aside>

          {/* Products Grid */}
          <div className="flex-1 min-w-0">
            {filteredProducts.length > 0 ? (
              gridDensity === 'dense' ? (
                /* Dense Mini Grid: ~15 cards per row on large desktop */
                <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-10 xl:grid-cols-12 2xl:grid-cols-[repeat(15,minmax(0,1fr))] gap-1.5">
                  {filteredProducts.map((product) => (
                    <MiniProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                /* Standard Grid: up to 6 cards per row on wide screens */
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-[4px]">
                  {filteredProducts.map((product, i) => (
                    <ProductCard key={product.id} product={product} index={i} fullWidth />
                  ))}
                </div>
              )
            ) : (
              <div className="text-center py-24 bg-neutral-50 border border-dashed border-neutral-200 rounded-lg">
                <p className="text-xs font-bold uppercase tracking-widest text-neutral-600 mb-2">
                  No matching products found
                </p>
                <p className="text-xs text-neutral-400 mb-5">
                  Try adjusting your filters or availability settings
                </p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="px-5 py-2.5 bg-black text-white text-[11px] font-bold uppercase tracking-widest hover:bg-neutral-800 transition-colors cursor-pointer"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Drawer Modal for Filters */}
      <AnimatePresence>
        {isMobileFilterOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileFilterOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            />

            {/* Slide-over Panel */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="relative mr-auto w-full max-w-xs sm:max-w-sm bg-white h-full shadow-2xl flex flex-col z-50 overflow-hidden"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal size={14} />
                  <span className="text-xs font-extrabold uppercase tracking-wider text-black">
                    Filter Products
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="p-1 text-neutral-500 hover:text-black cursor-pointer"
                  aria-label="Close filters"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto p-4">
                <FilterSidebar
                  categories={categories}
                  selectedCategory={filterState.categorySlug || categorySlug}
                  onSelectCategory={(slug) => {
                    navigate(`/collections/${slug}`);
                    setIsMobileFilterOpen(false);
                  }}
                  availableSizes={availableSizes}
                  availableColors={availableColors}
                  minPossiblePrice={0}
                  maxPossiblePrice={maxPossiblePrice}
                  filters={filterState}
                  onFilterChange={setFilterState}
                  onReset={handleResetFilters}
                  totalProductsCount={baseCollectionProducts.length}
                  filteredProductsCount={filteredProducts.length}
                  isMobileDrawer={true}
                  onCloseMobile={() => setIsMobileFilterOpen(false)}
                />
              </div>

              {/* Drawer Bottom Actions */}
              <div className="p-3 border-t border-gray-200 bg-neutral-50 flex gap-2">
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="flex-1 py-2 text-xs font-bold uppercase tracking-wider border border-gray-300 bg-white hover:bg-neutral-100 text-neutral-800"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="flex-1 py-2 text-xs font-bold uppercase tracking-wider bg-black text-white hover:bg-neutral-800"
                >
                  Apply ({filteredProducts.length})
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
