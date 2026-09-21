import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { SlidersHorizontal, LayoutGrid, Grid3X3 } from 'lucide-react';
import { useStore } from '../store/useStore';
import ProductCard from '../components/ProductCard';
import MiniProductCard from '../components/MiniProductCard';
import FilterSidebar, { FilterState } from '../components/collection/FilterSidebar';

export default function ShopAllPage() {
  const { products, categories, fetchProducts, fetchCategories } = useStore();
  const [sortBy, setSortBy] = useState('featured');
  const [gridDensity, setGridDensity] = useState<'standard' | 'dense'>('standard');
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Unified dynamic filter state
  const [filterState, setFilterState] = useState<FilterState>({
    categorySlug: 'all',
    sizes: [],
    colors: [],
    priceRange: [0, 50000],
    isBestSeller: false,
    isFeatured: false,
    isNewArrival: false,
    inStockOnly: false,
    tags: [],
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const availableSizes = useMemo(() => {
    const sizes = new Set<string>();
    products.forEach((p) => p.sizes?.forEach((s) => sizes.add(s)));
    return Array.from(sizes).sort();
  }, [products]);

  const availableColors = useMemo(() => {
    const colors = new Set<string>();
    products.forEach((p) =>
      p.colors?.forEach((c: any) => {
        const colorName = typeof c === 'string' ? c : c?.name;
        if (colorName) colors.add(colorName);
      })
    );
    return Array.from(colors).sort();
  }, [products]);

  const maxPrice = useMemo(
    () => Math.max(...products.map((p) => Number(p.base_price || p.price || 0)), 50000),
    [products]
  );

  useEffect(() => {
    setFilterState((prev) => ({ ...prev, priceRange: [0, maxPrice] }));
  }, [maxPrice]);

  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Category filter
    if (filterState.categorySlug && filterState.categorySlug !== 'all') {
      filtered = filtered.filter(
        (p) =>
          p.category === filterState.categorySlug ||
          p.category_slug === filterState.categorySlug ||
          p.category_id === filterState.categorySlug
      );
    }

    // Sizes
    if (filterState.sizes.length > 0) {
      filtered = filtered.filter((p) =>
        p.sizes?.some((s) => filterState.sizes.includes(s))
      );
    }

    // Colors
    if (filterState.colors.length > 0) {
      filtered = filtered.filter((p) =>
        p.colors?.some((c: any) =>
          filterState.colors.includes(typeof c === 'string' ? c : c?.name)
        )
      );
    }

    // Price range
    filtered = filtered.filter((p) => {
      const price = Number(p.base_price || p.price || 0);
      return price >= filterState.priceRange[0] && price <= filterState.priceRange[1];
    });

    // Best Seller
    if (filterState.isBestSeller) {
      filtered = filtered.filter((p) => p.is_best_seller || p.isBestseller);
    }

    // Featured
    if (filterState.isFeatured) {
      filtered = filtered.filter((p) => p.is_featured || p.isFeatured);
    }

    // New Arrival
    if (filterState.isNewArrival) {
      filtered = filtered.filter((p) => p.is_new_arrival || p.isNew);
    }

    // In Stock Only
    if (filterState.inStockOnly) {
      filtered = filtered.filter((p) => (p.stockCount ?? 1) > 0 && p.inStock !== false);
    }

    // Tags
    if (filterState.tags.length > 0) {
      filtered = filtered.filter((p) => {
        const text = `${p.name} ${p.description || ''} ${p.fabric || ''} ${p.fabric_composition || ''} ${p.fit || ''}`.toLowerCase();
        return filterState.tags.some((tag) => text.includes(tag.toLowerCase()));
      });
    }

    // Sorting
    switch (sortBy) {
      case 'price-low':
        filtered.sort(
          (a, b) =>
            Number(a.base_price || a.price || 0) - Number(b.base_price || b.price || 0)
        );
        break;
      case 'price-high':
        filtered.sort(
          (a, b) =>
            Number(b.base_price || b.price || 0) - Number(a.base_price || a.price || 0)
        );
        break;
      case 'newest':
        filtered.sort(
          (a, b) =>
            new Date(b.created_at || '').getTime() -
            new Date(a.created_at || '').getTime()
        );
        break;
      default:
        filtered.sort((a, b) => {
          if (a.is_featured && !b.is_featured) return -1;
          if (!a.is_featured && b.is_featured) return 1;
          return (
            new Date(b.created_at || '').getTime() -
            new Date(a.created_at || '').getTime()
          );
        });
        break;
    }

    return filtered;
  }, [products, filterState, sortBy]);

  const handleResetFilters = () => {
    setFilterState({
      categorySlug: 'all',
      sizes: [],
      colors: [],
      priceRange: [0, maxPrice],
      isBestSeller: false,
      isFeatured: false,
      isNewArrival: false,
      inStockOnly: false,
      tags: [],
    });
  };

  const activeFilterCount =
    (filterState.categorySlug && filterState.categorySlug !== 'all' ? 1 : 0) +
    filterState.sizes.length +
    filterState.colors.length +
    (filterState.priceRange[0] > 0 || filterState.priceRange[1] < maxPrice ? 1 : 0) +
    (filterState.isBestSeller ? 1 : 0) +
    (filterState.isFeatured ? 1 : 0) +
    (filterState.isNewArrival ? 1 : 0) +
    (filterState.inStockOnly ? 1 : 0) +
    filterState.tags.length;

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-black text-white py-14">
        <div className="w-full px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-xs font-bold tracking-[0.3em] uppercase text-gray-400 mb-2">
              COMPLETE DROP CATALOG
            </p>
            <h1 className="text-3xl md:text-5xl font-extrabold uppercase tracking-tight">
              Shop All
            </h1>
            <p className="text-gray-400 text-xs tracking-wider uppercase mt-2">
              {filteredProducts.length} items available
            </p>
          </motion.div>
        </div>
      </div>

      {/* Top Bar with Filters Toggle on Left Edge, Grid Density Switcher, and Sorting */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-200">
        <div className="w-full px-2 sm:px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Left corner filter toggle button */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setFiltersOpen(!filtersOpen)}
                className="flex items-center gap-2 px-4 py-2 border border-black bg-white text-black hover:bg-black hover:text-white transition-colors text-xs font-bold uppercase tracking-wider"
              >
                <SlidersHorizontal size={14} />
                <span>{filtersOpen ? 'Hide Filters' : 'Filters'}</span>
                {activeFilterCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-black text-white text-[10px] flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              <span className="text-xs text-gray-500 font-medium hidden sm:block">
                {filteredProducts.length} products
              </span>
            </div>

            <div className="flex items-center gap-3 ml-auto">
              {/* Grid Density Switcher: Default 6-per-row vs 15-per-row Dense Mini Grid */}
              <div className="flex items-center border border-gray-300 rounded overflow-hidden p-0.5 bg-gray-50">
                <button
                  type="button"
                  onClick={() => setGridDensity('standard')}
                  className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold transition-colors ${
                    gridDensity === 'standard'
                      ? 'bg-black text-white'
                      : 'text-gray-600 hover:text-black'
                  }`}
                  title="Default Grid (6 products per row)"
                >
                  <LayoutGrid size={15} />
                  <span className="hidden md:inline">6 / row</span>
                </button>

                <button
                  type="button"
                  onClick={() => setGridDensity('dense')}
                  className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold transition-colors ${
                    gridDensity === 'dense'
                      ? 'bg-black text-white'
                      : 'text-gray-600 hover:text-black'
                  }`}
                  title="Dense Mini Grid (~15 products per row)"
                >
                  <Grid3X3 size={15} />
                  <span className="hidden md:inline">15 / row</span>
                </button>
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 text-xs font-semibold uppercase tracking-wider bg-white hover:border-black transition-colors cursor-pointer"
              >
                <option value="featured">Featured</option>
                <option value="newest">Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area: FilterSidebar Component + Dynamic Product Grid */}
      <div className="w-full px-2 sm:px-4 py-4">
        <div className="flex items-start gap-4">
          {filtersOpen && (
            <aside className="w-64 sm:w-72 flex-shrink-0 sticky top-[80px] self-start z-20">
              <FilterSidebar
                categories={categories}
                selectedCategory={filterState.categorySlug}
                onSelectCategory={(slug) =>
                  setFilterState((prev) => ({ ...prev, categorySlug: slug }))
                }
                availableSizes={availableSizes}
                availableColors={availableColors}
                minPossiblePrice={0}
                maxPossiblePrice={maxPrice}
                filters={filterState}
                onFilterChange={setFilterState}
                onReset={handleResetFilters}
                totalProductsCount={products.length}
                filteredProductsCount={filteredProducts.length}
              />
            </aside>
          )}

          {/* Dynamic Grid Layout */}
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
                /* Standard Grid: 6 cards per row on 2xl screens */
                <div
                  className={`grid ${
                    filtersOpen
                      ? 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
                      : 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6'
                  } gap-[4px]`}
                >
                  {filteredProducts.map((product, i) => (
                    <ProductCard key={product.id} product={product} index={i} fullWidth />
                  ))}
                </div>
              )
            ) : (
              <div className="text-center py-20 bg-gray-50 border border-dashed border-gray-200">
                <p className="text-sm font-bold uppercase tracking-wider text-gray-600 mb-2">
                  No matching drops found
                </p>
                <button
                  onClick={handleResetFilters}
                  className="text-xs font-bold uppercase tracking-widest text-black underline hover:text-gray-600"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
