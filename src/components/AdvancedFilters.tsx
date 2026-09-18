import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, X } from 'lucide-react';
import { useStore } from '../store/useStore';

interface AdvancedFiltersProps {
  onFilterChange: (filters: AdvancedFilterState) => void;
}

export interface AdvancedFilterState {
  size: string[];
  color: string[];
  minPrice?: number;
  maxPrice?: number;
  features: string[];
  categories: string[];
}

export default function AdvancedFilters({ onFilterChange }: AdvancedFiltersProps) {
  const { products, categories } = useStore();
  
  const [filters, setFilters] = useState<AdvancedFilterState>({
    size: [],
    color: [],
    minPrice: undefined,
    maxPrice: undefined,
    features: [],
    categories: [],
  });

  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  
  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    size: true,
    color: true,
    price: true,
    features: true,
  });

  // Extract unique sizes and colors from products
  const allSizes = useMemo(() => {
    const sizes = new Set<string>();
    products.forEach(p => {
      if (p.attributes?.sizes) {
        p.attributes.sizes.forEach((s: string) => sizes.add(s));
      }
    });
    return Array.from(sizes).sort();
  }, [products]);

  const allColors = useMemo(() => {
    const colors = new Set<string>();
    products.forEach(p => {
      if (p.attributes?.colors) {
        p.attributes.colors.forEach((c: string) => colors.add(c));
      }
    });
    return Array.from(colors).sort();
  }, [products]);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleCheckboxChange = (category: keyof AdvancedFilterState, value: string) => {
    const newFilters = { ...filters };
    const arr = newFilters[category] as string[];
    if (arr.includes(value)) {
      newFilters[category] = arr.filter(v => v !== value);
    } else {
      newFilters[category] = [...arr, value];
    }
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handlePriceChange = (type: 'min' | 'max', value: number) => {
    const newFilters = { 
      ...filters, 
      [type === 'min' ? 'minPrice' : 'maxPrice']: value 
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearAllFilters = () => {
    const clearedFilters: AdvancedFilterState = {
      size: [],
      color: [],
      minPrice: undefined,
      maxPrice: undefined,
      features: [],
      categories: [],
    };
    setFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  const hasActiveFilters = filters.size.length > 0 || 
                          filters.color.length > 0 || 
                          filters.minPrice !== undefined || 
                          filters.maxPrice !== undefined ||
                          filters.features.length > 0 ||
                          filters.categories.length > 0;

  return (
    <div className="bg-white rounded-none p-6 sticky top-24 border">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold">Filters</h3>
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="text-sm text-red-600 hover:text-red-700 font-medium"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Categories Filter */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection('categories')}
          className="flex items-center justify-between w-full mb-3"
        >
          <span className="font-medium">Categories</span>
          {expandedSections.categories ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
        <AnimatePresence>
          {expandedSections.categories && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="space-y-2"
            >
              {categories.map(cat => (
                <label key={cat.id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.categories.includes(cat.slug)}
                    onChange={() => handleCheckboxChange('categories', cat.slug)}
                    className="w-4 h-4 rounded-none"
                  />
                  <span className="text-sm">{cat.name}</span>
                </label>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Size Filter */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection('size')}
          className="flex items-center justify-between w-full mb-3"
        >
          <span className="font-medium">Size</span>
          {expandedSections.size ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
        <AnimatePresence>
          {expandedSections.size && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="space-y-2"
            >
              {allSizes.map(size => (
                <label key={size} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.size.includes(size)}
                    onChange={() => handleCheckboxChange('size', size)}
                    className="w-4 h-4 rounded-none"
                  />
                  <span className="text-sm">{size}</span>
                </label>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Color Filter */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection('color')}
          className="flex items-center justify-between w-full mb-3"
        >
          <span className="font-medium">Color</span>
          {expandedSections.color ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
        <AnimatePresence>
          {expandedSections.color && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="space-y-2"
            >
              {allColors.map(color => (
                <label key={color} className="flex items-center gap-2 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded-none border border-gray-300"
                      style={{ backgroundColor: color.toLowerCase() }}
                    />
                    <input
                      type="checkbox"
                      checked={filters.color.includes(color)}
                      onChange={() => handleCheckboxChange('color', color)}
                      className="w-4 h-4 rounded-none sr-only"
                    />
                    <span className="text-sm">{color}</span>
                  </div>
                </label>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Price Range Filter */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection('price')}
          className="flex items-center justify-between w-full mb-3"
        >
          <span className="font-medium">Price Range</span>
          {expandedSections.price ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
        <AnimatePresence>
          {expandedSections.price && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.minPrice || ''}
                  onChange={(e) => handlePriceChange('min', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border rounded-none text-sm"
                />
                <span>-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxPrice || ''}
                  onChange={(e) => handlePriceChange('max', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border rounded-none text-sm"
                />
              </div>
              <input
                type="range"
                min="0"
                max="10000"
                step="100"
                value={filters.maxPrice || 10000}
                onChange={(e) => handlePriceChange('max', parseFloat(e.target.value))}
                className="w-full"
              />
              <div className="text-xs text-gray-500">
                Rs.{filters.minPrice || 0} - Rs.{filters.maxPrice || 10000}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Features Filter */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection('features')}
          className="flex items-center justify-between w-full mb-3"
        >
          <span className="font-medium">Features</span>
          {expandedSections.features ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
        <AnimatePresence>
          {expandedSections.features && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="space-y-2"
            >
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.features.includes('new-arrival')}
                  onChange={() => handleCheckboxChange('features', 'new-arrival')}
                  className="w-4 h-4 rounded-none"
                />
                <span className="text-sm">New Arrival</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.features.includes('best-seller')}
                  onChange={() => handleCheckboxChange('features', 'best-seller')}
                  className="w-4 h-4 rounded-none"
                />
                <span className="text-sm">Best Seller</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.features.includes('on-sale')}
                  onChange={() => handleCheckboxChange('features', 'on-sale')}
                  className="w-4 h-4 rounded-none"
                />
                <span className="text-sm">On Sale</span>
              </label>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
