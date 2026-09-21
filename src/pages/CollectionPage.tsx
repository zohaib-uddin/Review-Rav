import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SlidersHorizontal, LayoutGrid, Grid3X3 } from 'lucide-react';
import { useStore } from '../store/useStore';
import QuickViewModal from '../components/collection/QuickViewModal';
import CollectionHero from '../components/CollectionHero';
import ProductCard from '../components/ProductCard';
import MiniProductCard from '../components/MiniProductCard';
import FilterSidebar, { FilterState } from '../components/collection/FilterSidebar';

export default function CollectionPage() {
  const { categorySlug } = useParams();
  const { products, categories, isLoading, fetchProducts, fetchCategories } = useStore();
  const [quickViewProduct, setQuickViewProduct] = useState<any>(null);

  // Layout & Filter states
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [gridDensity, setGridDensity] = useState<'standard' | 'dense'>('standard'); // standard = 6 per row, dense = 15 per row
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
    tags: [],
  });

  useEffect(() => {
    if (products.length === 0) fetchProducts();
    if (categories.length === 0) fetchCategories();
  }, []);

  const normalizedSlug = categorySlug ? decodeURIComponent(categorySlug).toLowerCase().trim() : '';

  const matchedCategory = categories.find(
    (c) =>
      c.slug?.toLowerCase() === normalizedSlug ||
      c.id === categorySlug ||
      c.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-') === normalizedSlug
  );

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
          description: `Explore our premium ${categorySlug.replace(/-/g, ' ')} streetwear collection.`,
          cover_image_url:
            'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=1600&h=600&fit=crop',
          is_active: true,
          sort_order: 1,
          is_featured_in_focus: false,
          display_order_in_focus: 0,
        }
      : null);

  // Subcategories
  const subcategories = categories.filter((c) => c.parent_id === matchedCategory?.id);

  // Base collection products before user filters
  const baseCollectionProducts = useMemo(() => {
    if (!categorySlug || products.length === 0) return products;

    const subcategorySlugs = matchedCategory
      ? categories
          .filter((c) => c.parent_id === matchedCategory.id)
          .map((c) => c.slug.toLowerCase())
      : [];

    const matched = products.filter((p) => {
      const pCatSlug = (p.category_slug || p.category || '').toLowerCase();
      const pCatId = p.category_id;
      return (
        pCatSlug === normalizedSlug ||
        (matchedCategory &&
          (pCatId === matchedCategory.id || pCatSlug === matchedCategory.slug?.toLowerCase())) ||
        subcategorySlugs.includes(pCatSlug)
      );
    });

    return matched.length > 0 ? matched : products;
  }, [categorySlug, products, categories, matchedCategory, normalizedSlug]);

  // Extract available sizes, colors, and prices from products
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

  // Set initial price range max
  useEffect(() => {
    setFilterState((prev) => ({
      ...prev,
      categorySlug: categorySlug || '',
      priceRange: [0, maxPossiblePrice],
    }));
  }, [categorySlug, maxPossiblePrice]);

  // Apply detailed dynamic filtering
  const filteredProducts = useMemo(() => {
    let list = [...baseCollectionProducts];

    // Filter by category if explicitly changed in filter sidebar
    if (
      filterState.categorySlug &&
      filterState.categorySlug !== 'all' &&
      filterState.categorySlug !== categorySlug
    ) {
      list = list.filter((p) => {
        const pSlug = (p.category_slug || p.category || '').toLowerCase();
        return pSlug === filterState.categorySlug?.toLowerCase();
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
      list = list.filter((p) => p.is_best_seller || p.isBestseller);
    }

    // Featured
    if (filterState.isFeatured) {
      list = list.filter((p) => p.is_featured || p.isFeatured);
    }

    // New Arrival
    if (filterState.isNewArrival) {
      list = list.filter((p) => p.is_new_arrival || p.isNew);
    }

    // In Stock Only
    if (filterState.inStockOnly) {
      list = list.filter((p) => (p.stockCount ?? 1) > 0 && p.inStock !== false);
    }

    // Tags
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
      case 'newest':
        list.sort(
          (a, b) =>
            new Date(b.created_at || '').getTime() -
            new Date(a.created_at || '').getTime()
        );
        break;
      default:
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
  }, [baseCollectionProducts, filterState, sortBy, categorySlug]);

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
    (filterState.inStockOnly ? 1 : 0) +
    filterState.tags.length;

  if (categories.length === 0 && products.length === 0 && isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-500">
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
          <p className="text-xs font-bold uppercase tracking-widest text-red-600 mb-2">
            Notice
          </p>
          <h2 className="text-2xl font-bold uppercase tracking-tight mb-3">
            Category Not Found
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            The requested collection could not be loaded.
          </p>
          <Link
            to="/"
            className="inline-block px-6 py-3 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <CollectionHero category={category} />

      {/* Subcategory Navigation Bar */}
      {subcategories.length > 0 && (
        <div className="bg-white border-b sticky top-[64px] z-10 shadow-sm">
          <div className="w-full px-4 py-3">
            <div className="flex gap-2 overflow-x-auto">
              <Link
                to={`/collections/${categorySlug}`}
                className="px-4 py-2 bg-black text-white text-xs font-bold uppercase tracking-wider whitespace-nowrap"
              >
                All {category.name}
              </Link>
              {subcategories.map((sub) => {
                const productCount = products.filter((p) => p.category === sub.slug).length;
                return (
                  <Link
                    key={sub.slug}
                    to={`/collections/${sub.slug}`}
                    className="px-4 py-2 border border-gray-200 text-xs font-semibold uppercase tracking-wider whitespace-nowrap hover:border-black transition-colors flex items-center gap-1.5"
                  >
                    <span>{sub.name}</span>
                    <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5">
                      {productCount}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="w-full px-2 sm:px-4 py-4">
        {/* Top Controls Bar: Filter Toggle | Product Count | Grid Density Switcher | Sort */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-gray-200 mb-4">
          <div className="flex items-center gap-3">
            {/* Filter Toggle Button */}
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center gap-2 px-4 py-2 border border-black bg-white text-black hover:bg-black hover:text-white transition-colors text-xs font-bold uppercase tracking-wider"
            >
              <SlidersHorizontal size={14} />
              <span>{isFilterOpen ? 'Hide Filters' : 'Filters'}</span>
              {activeFilterCount > 0 && (
                <span className="w-4 h-4 bg-black text-white text-[10px] rounded-full flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>

            <span className="text-xs text-gray-500 font-medium">
              {filteredProducts.length} items
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

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-xs font-semibold uppercase tracking-wider border border-gray-300 px-3 py-2 bg-white hover:border-black cursor-pointer"
            >
              <option value="featured">Featured</option>
              <option value="newest">Newest</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Content Body: Sidebar Component + Dynamic Grid */}
        <div className="flex items-start gap-4">
          {isFilterOpen && (
            <aside className="w-64 sm:w-72 flex-shrink-0 sticky top-[80px] self-start z-20">
              <FilterSidebar
                categories={categories}
                selectedCategory={filterState.categorySlug || categorySlug}
                onSelectCategory={(slug) =>
                  setFilterState((prev) => ({ ...prev, categorySlug: slug }))
                }
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
          )}

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
                /* Standard Grid: 6 cards per row on 2xl screens */
                <div
                  className={`grid ${
                    isFilterOpen
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
                  No matching items found
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
