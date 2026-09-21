import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, X, Check, RotateCcw, SlidersHorizontal, Sparkles } from 'lucide-react';
import { Category } from '../../store/useStore';

export interface FilterState {
  categorySlug?: string;
  sizes: string[];
  colors: string[];
  priceRange: [number, number];
  isBestSeller?: boolean;
  isFeatured?: boolean;
  isNewArrival?: boolean;
  inStockOnly?: boolean;
  tags: string[];
}

interface FilterSidebarProps {
  categories?: Category[];
  selectedCategory?: string;
  onSelectCategory?: (slug: string) => void;
  availableSizes?: string[];
  availableColors?: string[];
  availableTags?: string[];
  minPossiblePrice?: number;
  maxPossiblePrice?: number;
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  onReset: () => void;
  totalProductsCount?: number;
  filteredProductsCount?: number;
  isMobileDrawer?: boolean;
  onCloseMobile?: () => void;
}

const COLOR_SWATCHES: Record<string, string> = {
  black: '#000000',
  white: '#FFFFFF',
  charcoal: '#27272a',
  grey: '#71717a',
  gray: '#71717a',
  cream: '#fef3c7',
  beige: '#f5f5dc',
  brown: '#78350f',
  olive: '#3f6212',
  green: '#15803d',
  navy: '#1e3a8a',
  blue: '#2563eb',
  red: '#dc2626',
  maroon: '#831843',
  purple: '#7e22ce',
  pink: '#ec4899',
  orange: '#ea580c',
};

export default function FilterSidebar({
  categories = [],
  selectedCategory = '',
  onSelectCategory,
  availableSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  availableColors = ['Black', 'White', 'Charcoal', 'Grey', 'Beige', 'Brown', 'Olive', 'Navy'],
  availableTags = ['Oversized', 'Heavyweight', 'Graphic', 'Streetwear', '100% Cotton', 'Fleece'],
  minPossiblePrice = 0,
  maxPossiblePrice = 10000,
  filters,
  onFilterChange,
  onReset,
  totalProductsCount,
  filteredProductsCount,
  isMobileDrawer = false,
  onCloseMobile,
}: FilterSidebarProps) {
  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    price: true,
    size: true,
    color: true,
    features: true,
    tags: true,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleSizeToggle = (size: string) => {
    const newSizes = filters.sizes.includes(size)
      ? filters.sizes.filter((s) => s !== size)
      : [...filters.sizes, size];
    onFilterChange({ ...filters, sizes: newSizes });
  };

  const handleColorToggle = (color: string) => {
    const newColors = filters.colors.includes(color)
      ? filters.colors.filter((c) => c !== color)
      : [...filters.colors, color];
    onFilterChange({ ...filters, colors: newColors });
  };

  const handlePriceMinChange = (val: number) => {
    const safeMin = Math.max(minPossiblePrice, Math.min(val, filters.priceRange[1]));
    onFilterChange({ ...filters, priceRange: [safeMin, filters.priceRange[1]] });
  };

  const handlePriceMaxChange = (val: number) => {
    const safeMax = Math.min(maxPossiblePrice, Math.max(val, filters.priceRange[0]));
    onFilterChange({ ...filters, priceRange: [filters.priceRange[0], safeMax] });
  };

  const handleTagToggle = (tag: string) => {
    const newTags = filters.tags.includes(tag)
      ? filters.tags.filter((t) => t !== tag)
      : [...filters.tags, tag];
    onFilterChange({ ...filters, tags: newTags });
  };

  const activeFiltersCount =
    (filters.categorySlug && filters.categorySlug !== 'all' ? 1 : 0) +
    filters.sizes.length +
    filters.colors.length +
    (filters.priceRange[0] > minPossiblePrice || filters.priceRange[1] < maxPossiblePrice ? 1 : 0) +
    (filters.isBestSeller ? 1 : 0) +
    (filters.isFeatured ? 1 : 0) +
    (filters.isNewArrival ? 1 : 0) +
    (filters.inStockOnly ? 1 : 0) +
    filters.tags.length;

  return (
    <div className={`bg-white text-black ${isMobileDrawer ? 'p-4' : 'p-5 rounded-xl border border-gray-200 sticky top-24 shadow-sm'}`}>
      {/* Header */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={18} className="text-black" />
          <h3 className="text-base font-bold uppercase tracking-wider">Filters</h3>
          {activeFiltersCount > 0 && (
            <span className="bg-black text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
              {activeFiltersCount}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {activeFiltersCount > 0 && (
            <button
              type="button"
              onClick={onReset}
              className="text-xs font-semibold text-gray-500 hover:text-black flex items-center gap-1 transition-colors"
              title="Reset all filters"
            >
              <RotateCcw size={13} />
              <span>Reset</span>
            </button>
          )}
          {isMobileDrawer && onCloseMobile && (
            <button
              type="button"
              onClick={onCloseMobile}
              className="p-1 hover:bg-gray-100 rounded-lg text-gray-600"
            >
              <X size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Product count indicator */}
      {typeof filteredProductsCount === 'number' && (
        <div className="mb-4 text-xs text-gray-500 font-medium">
          Showing <span className="font-bold text-black">{filteredProductsCount}</span>{' '}
          {typeof totalProductsCount === 'number' && (
            <>of {totalProductsCount} items</>
          )}
        </div>
      )}

      {/* Active Badges */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-1.5 pb-4 mb-4 border-b border-gray-100">
          {filters.categorySlug && filters.categorySlug !== 'all' && (
            <span className="inline-flex items-center gap-1 bg-gray-100 text-xs px-2.5 py-1 rounded-full text-black font-medium">
              Category: {filters.categorySlug}
              <button
                type="button"
                onClick={() => onSelectCategory && onSelectCategory('all')}
                className="hover:text-red-500"
              >
                <X size={12} />
              </button>
            </span>
          )}
          {filters.sizes.map((s) => (
            <span
              key={s}
              className="inline-flex items-center gap-1 bg-gray-100 text-xs px-2.5 py-1 rounded-full text-black font-medium"
            >
              Size {s}
              <button
                type="button"
                onClick={() => handleSizeToggle(s)}
                className="hover:text-red-500"
              >
                <X size={12} />
              </button>
            </span>
          ))}
          {filters.colors.map((c) => (
            <span
              key={c}
              className="inline-flex items-center gap-1 bg-gray-100 text-xs px-2.5 py-1 rounded-full text-black font-medium"
            >
              {c}
              <button
                type="button"
                onClick={() => handleColorToggle(c)}
                className="hover:text-red-500"
              >
                <X size={12} />
              </button>
            </span>
          ))}
          {filters.isBestSeller && (
            <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-900 border border-amber-200 text-xs px-2 py-0.5 rounded-full font-medium">
              Best Seller
              <button
                type="button"
                onClick={() => onFilterChange({ ...filters, isBestSeller: false })}
                className="hover:text-red-500"
              >
                <X size={12} />
              </button>
            </span>
          )}
          {filters.isFeatured && (
            <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-900 border border-purple-200 text-xs px-2 py-0.5 rounded-full font-medium">
              Featured
              <button
                type="button"
                onClick={() => onFilterChange({ ...filters, isFeatured: false })}
                className="hover:text-red-500"
              >
                <X size={12} />
              </button>
            </span>
          )}
          {filters.isNewArrival && (
            <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs px-2 py-0.5 rounded-full font-medium">
              New Drops
              <button
                type="button"
                onClick={() => onFilterChange({ ...filters, isNewArrival: false })}
                className="hover:text-red-500"
              >
                <X size={12} />
              </button>
            </span>
          )}
          {filters.inStockOnly && (
            <span className="inline-flex items-center gap-1 bg-gray-100 text-xs px-2.5 py-1 rounded-full text-black font-medium">
              In Stock Only
              <button
                type="button"
                onClick={() => onFilterChange({ ...filters, inStockOnly: false })}
                className="hover:text-red-500"
              >
                <X size={12} />
              </button>
            </span>
          )}
          {filters.tags.map((t) => (
            <span
              key={t}
              className="inline-flex items-center gap-1 bg-gray-100 text-xs px-2.5 py-1 rounded-full text-black font-medium"
            >
              #{t}
              <button
                type="button"
                onClick={() => handleTagToggle(t)}
                className="hover:text-red-500"
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Accordion Sections */}
      <div className="space-y-4">
        {/* 1. Categories Section */}
        {categories.length > 0 && onSelectCategory && (
          <div className="border-b border-gray-100 pb-4">
            <button
              type="button"
              onClick={() => toggleSection('categories')}
              className="flex items-center justify-between w-full text-xs font-bold uppercase tracking-wider text-gray-800 hover:text-black"
            >
              <span>Categories</span>
              {expandedSections.categories ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            {expandedSections.categories && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                className="mt-3 space-y-1 max-h-48 overflow-y-auto pr-1"
              >
                <button
                  type="button"
                  onClick={() => onSelectCategory('all')}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${
                    selectedCategory === 'all' || !selectedCategory
                      ? 'bg-black text-white font-bold'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span>All Collections</span>
                  {totalProductsCount !== undefined && (
                    <span className="text-[10px] opacity-75">{totalProductsCount}</span>
                  )}
                </button>
                {categories.map((cat) => {
                  const isSelected = selectedCategory === cat.slug;
                  return (
                    <button
                      key={cat.id || cat.slug}
                      type="button"
                      onClick={() => onSelectCategory(cat.slug)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${
                        isSelected
                          ? 'bg-black text-white font-bold'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <span className="truncate">{cat.name}</span>
                      {cat.badge && (
                        <span className="text-[9px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded uppercase font-bold">
                          {cat.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </motion.div>
            )}
          </div>
        )}

        {/* 2. Highlights / Features (Best Seller, Featured, New Arrival, In Stock) */}
        <div className="border-b border-gray-100 pb-4">
          <button
            type="button"
            onClick={() => toggleSection('features')}
            className="flex items-center justify-between w-full text-xs font-bold uppercase tracking-wider text-gray-800 hover:text-black"
          >
            <span>Highlights & Drops</span>
            {expandedSections.features ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          {expandedSections.features && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="mt-3 space-y-2"
            >
              <label className="flex items-center justify-between cursor-pointer group text-xs text-gray-800">
                <span className="flex items-center gap-2 group-hover:text-black font-medium">
                  <Sparkles size={14} className="text-amber-500" />
                  Best Sellers
                </span>
                <input
                  type="checkbox"
                  checked={Boolean(filters.isBestSeller)}
                  onChange={(e) =>
                    onFilterChange({ ...filters, isBestSeller: e.target.checked })
                  }
                  className="rounded border-gray-300 text-black focus:ring-black h-4 w-4"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer group text-xs text-gray-800">
                <span className="flex items-center gap-2 group-hover:text-black font-medium">
                  <span className="w-2 h-2 rounded-full bg-purple-600 inline-block"></span>
                  Featured Drops
                </span>
                <input
                  type="checkbox"
                  checked={Boolean(filters.isFeatured)}
                  onChange={(e) =>
                    onFilterChange({ ...filters, isFeatured: e.target.checked })
                  }
                  className="rounded border-gray-300 text-black focus:ring-black h-4 w-4"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer group text-xs text-gray-800">
                <span className="flex items-center gap-2 group-hover:text-black font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                  New Arrivals
                </span>
                <input
                  type="checkbox"
                  checked={Boolean(filters.isNewArrival)}
                  onChange={(e) =>
                    onFilterChange({ ...filters, isNewArrival: e.target.checked })
                  }
                  className="rounded border-gray-300 text-black focus:ring-black h-4 w-4"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer group text-xs text-gray-800">
                <span className="group-hover:text-black font-medium">In Stock Only</span>
                <input
                  type="checkbox"
                  checked={Boolean(filters.inStockOnly)}
                  onChange={(e) =>
                    onFilterChange({ ...filters, inStockOnly: e.target.checked })
                  }
                  className="rounded border-gray-300 text-black focus:ring-black h-4 w-4"
                />
              </label>
            </motion.div>
          )}
        </div>

        {/* 3. Price Range Filter */}
        <div className="border-b border-gray-100 pb-4">
          <button
            type="button"
            onClick={() => toggleSection('price')}
            className="flex items-center justify-between w-full text-xs font-bold uppercase tracking-wider text-gray-800 hover:text-black"
          >
            <span>Price Range (PKR)</span>
            {expandedSections.price ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          {expandedSections.price && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="mt-3 space-y-3"
            >
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <label className="block text-[10px] text-gray-500 uppercase font-semibold mb-1">
                    Min Price
                  </label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                      Rs.
                    </span>
                    <input
                      type="number"
                      value={filters.priceRange[0]}
                      min={minPossiblePrice}
                      max={filters.priceRange[1]}
                      step={100}
                      onChange={(e) => handlePriceMinChange(Number(e.target.value))}
                      className="w-full pl-8 pr-2 py-1.5 border border-gray-200 rounded-lg text-xs font-mono focus:border-black focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex-1">
                  <label className="block text-[10px] text-gray-500 uppercase font-semibold mb-1">
                    Max Price
                  </label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                      Rs.
                    </span>
                    <input
                      type="number"
                      value={filters.priceRange[1]}
                      min={filters.priceRange[0]}
                      max={maxPossiblePrice}
                      step={100}
                      onChange={(e) => handlePriceMaxChange(Number(e.target.value))}
                      className="w-full pl-8 pr-2 py-1.5 border border-gray-200 rounded-lg text-xs font-mono focus:border-black focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Range Slider */}
              <input
                type="range"
                min={minPossiblePrice}
                max={maxPossiblePrice}
                step={200}
                value={filters.priceRange[1]}
                onChange={(e) => handlePriceMaxChange(Number(e.target.value))}
                className="w-full accent-black cursor-pointer"
              />

              <div className="flex items-center justify-between text-[11px] text-gray-500">
                <span>Rs. {filters.priceRange[0].toLocaleString()}</span>
                <span>Rs. {filters.priceRange[1].toLocaleString()}</span>
              </div>
            </motion.div>
          )}
        </div>

        {/* 4. Sizes */}
        {availableSizes.length > 0 && (
          <div className="border-b border-gray-100 pb-4">
            <button
              type="button"
              onClick={() => toggleSection('size')}
              className="flex items-center justify-between w-full text-xs font-bold uppercase tracking-wider text-gray-800 hover:text-black"
            >
              <span>Size</span>
              {expandedSections.size ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            {expandedSections.size && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                className="mt-3 flex flex-wrap gap-1.5"
              >
                {availableSizes.map((size) => {
                  const isSelected = filters.sizes.includes(size);
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => handleSizeToggle(size)}
                      className={`min-w-[40px] px-2.5 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                        isSelected
                          ? 'bg-black text-white border-black shadow-sm'
                          : 'border-gray-200 text-gray-800 hover:border-black'
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </motion.div>
            )}
          </div>
        )}

        {/* 5. Colors Filter with Swatches */}
        {availableColors.length > 0 && (
          <div className="border-b border-gray-100 pb-4">
            <button
              type="button"
              onClick={() => toggleSection('color')}
              className="flex items-center justify-between w-full text-xs font-bold uppercase tracking-wider text-gray-800 hover:text-black"
            >
              <span>Color</span>
              {expandedSections.color ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            {expandedSections.color && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                className="mt-3 grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto pr-1"
              >
                {availableColors.map((color) => {
                  const isSelected = filters.colors.includes(color);
                  const colorKey = color.toLowerCase();
                  const hex = COLOR_SWATCHES[colorKey] || '#6b7280';
                  const isLight = colorKey === 'white' || colorKey === 'cream' || colorKey === 'beige';

                  return (
                    <button
                      key={color}
                      type="button"
                      onClick={() => handleColorToggle(color)}
                      className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-medium border text-left transition-all ${
                        isSelected
                          ? 'border-black bg-gray-50 font-bold'
                          : 'border-gray-100 hover:border-gray-300'
                      }`}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full flex-shrink-0 border border-black/20 flex items-center justify-center"
                        style={{ backgroundColor: hex }}
                      >
                        {isSelected && (
                          <Check
                            size={10}
                            className={isLight ? 'text-black' : 'text-white'}
                            strokeWidth={3}
                          />
                        )}
                      </span>
                      <span className="truncate">{color}</span>
                    </button>
                  );
                })}
              </motion.div>
            )}
          </div>
        )}

        {/* 6. Streetwear Tags & Fabric Styles */}
        {availableTags.length > 0 && (
          <div>
            <button
              type="button"
              onClick={() => toggleSection('tags')}
              className="flex items-center justify-between w-full text-xs font-bold uppercase tracking-wider text-gray-800 hover:text-black"
            >
              <span>Tags & Fabric</span>
              {expandedSections.tags ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            {expandedSections.tags && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                className="mt-3 flex flex-wrap gap-1.5"
              >
                {availableTags.map((tag) => {
                  const isSelected = filters.tags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleTagToggle(tag)}
                      className={`px-2.5 py-1 text-xs font-medium rounded-full border transition-all ${
                        isSelected
                          ? 'bg-black text-white border-black'
                          : 'border-gray-200 text-gray-700 hover:border-black'
                      }`}
                    >
                      #{tag}
                    </button>
                  );
                })}
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
