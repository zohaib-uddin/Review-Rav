import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, X } from 'lucide-react';

interface AdvancedFiltersProps {
  onFilterChange: (filters: AdvancedFilterState) => void;
}

export interface AdvancedFilterState {
  material: string[];
  fit: string[];
  occasion: string[];
  minRating: number;
  inStockOnly: boolean;
}

const filterOptions = {
  material: ['Cotton', 'Polyester', 'Denim', 'Fleece', 'Linen', 'Wool', 'Silk', 'Blend'],
  fit: ['Oversized', 'Regular', 'Slim', 'Wide Leg', 'Relaxed', 'Tailored'],
  occasion: ['Casual', 'Formal', 'Streetwear', 'Athletic', 'Party', 'Office', 'Travel'],
};

export default function AdvancedFilters({ onFilterChange }: AdvancedFiltersProps) {
  const [filters, setFilters] = useState<AdvancedFilterState>({
    material: [],
    fit: [],
    occasion: [],
    minRating: 0,
    inStockOnly: false,
  });

  const [expandedSections, setExpandedSections] = useState({
    material: true,
    fit: true,
    occasion: true,
    rating: false,
    stock: false,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleCheckboxChange = (category: 'material' | 'fit' | 'occasion', value: string) => {
    const newFilters = { ...filters };
    if (newFilters[category].includes(value)) {
      newFilters[category] = newFilters[category].filter(v => v !== value);
    } else {
      newFilters[category] = [...newFilters[category], value];
    }
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleRatingChange = (rating: number) => {
    const newFilters = { ...filters, minRating: rating };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleStockChange = (checked: boolean) => {
    const newFilters = { ...filters, inStockOnly: checked };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearAllFilters = () => {
    const clearedFilters: AdvancedFilterState = {
      material: [],
      fit: [],
      occasion: [],
      minRating: 0,
      inStockOnly: false,
    };
    setFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  const hasActiveFilters = filters.material.length > 0 || 
                          filters.fit.length > 0 || 
                          filters.occasion.length > 0 || 
                          filters.minRating > 0 || 
                          filters.inStockOnly;

  return (
    <div className="bg-white rounded-xl p-6 sticky top-24">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold">Advanced Filters</h3>
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="text-sm text-red-600 hover:text-red-700 font-medium"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500 mb-2">Active Filters:</p>
          <div className="flex flex-wrap gap-2">
            {filters.material.map(m => (
              <span key={m} className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full flex items-center gap-1">
                {m}
                <button onClick={() => handleCheckboxChange('material', m)}>
                  <X size={12} />
                </button>
              </span>
            ))}
            {filters.fit.map(f => (
              <span key={f} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full flex items-center gap-1">
                {f}
                <button onClick={() => handleCheckboxChange('fit', f)}>
                  <X size={12} />
                </button>
              </span>
            ))}
            {filters.occasion.map(o => (
              <span key={o} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full flex items-center gap-1">
                {o}
                <button onClick={() => handleCheckboxChange('occasion', o)}>
                  <X size={12} />
                </button>
              </span>
            ))}
            {filters.minRating > 0 && (
              <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                {filters.minRating}+ Stars
              </span>
            )}
            {filters.inStockOnly && (
              <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full">
                In Stock Only
              </span>
            )}
          </div>
        </div>
      )}

      {/* Material Filter */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection('material')}
          className="flex items-center justify-between w-full mb-3"
        >
          <span className="font-medium">Material</span>
          {expandedSections.material ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
        <AnimatePresence>
          {expandedSections.material && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="space-y-2"
            >
              {filterOptions.material.map(material => (
                <label key={material} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.material.includes(material)}
                    onChange={() => handleCheckboxChange('material', material)}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm">{material}</span>
                </label>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Fit Filter */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection('fit')}
          className="flex items-center justify-between w-full mb-3"
        >
          <span className="font-medium">Fit</span>
          {expandedSections.fit ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
        <AnimatePresence>
          {expandedSections.fit && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="space-y-2"
            >
              {filterOptions.fit.map(fit => (
                <label key={fit} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.fit.includes(fit)}
                    onChange={() => handleCheckboxChange('fit', fit)}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm">{fit}</span>
                </label>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Occasion Filter */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection('occasion')}
          className="flex items-center justify-between w-full mb-3"
        >
          <span className="font-medium">Occasion</span>
          {expandedSections.occasion ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
        <AnimatePresence>
          {expandedSections.occasion && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="space-y-2"
            >
              {filterOptions.occasion.map(occasion => (
                <label key={occasion} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.occasion.includes(occasion)}
                    onChange={() => handleCheckboxChange('occasion', occasion)}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm">{occasion}</span>
                </label>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Rating Filter */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection('rating')}
          className="flex items-center justify-between w-full mb-3"
        >
          <span className="font-medium">Minimum Rating</span>
          {expandedSections.rating ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
        <AnimatePresence>
          {expandedSections.rating && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="space-y-2"
            >
              {[4, 3, 2, 1].map(rating => (
                <label key={rating} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="rating"
                    checked={filters.minRating === rating}
                    onChange={() => handleRatingChange(rating)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">{rating}+ Stars</span>
                </label>
              ))}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="rating"
                  checked={filters.minRating === 0}
                  onChange={() => handleRatingChange(0)}
                  className="w-4 h-4"
                />
                <span className="text-sm">All Ratings</span>
              </label>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Stock Filter */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection('stock')}
          className="flex items-center justify-between w-full mb-3"
        >
          <span className="font-medium">Stock Status</span>
          {expandedSections.stock ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
        <AnimatePresence>
          {expandedSections.stock && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
            >
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.inStockOnly}
                  onChange={(e) => handleStockChange(e.target.checked)}
                  className="w-4 h-4 rounded"
                />
                <span className="text-sm">In Stock Only</span>
              </label>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
