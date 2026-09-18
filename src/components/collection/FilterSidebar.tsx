import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface FilterSidebarProps {
  onFilterChange: (filters: any) => void;
  availableSizes: string[];
  availableColors: string[];
  priceRange: { min: number; max: number };
}

export default function FilterSidebar({ 
  onFilterChange, 
  availableSizes, 
  availableColors, 
  priceRange 
}: FilterSidebarProps) {
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [priceRangeValue, setPriceRangeValue] = useState([priceRange.min, priceRange.max]);
  const [expandedSections, setExpandedSections] = useState({
    size: true,
    color: true,
    price: true,
    features: true,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const toggleSize = (size: string) => {
    const newSizes = selectedSizes.includes(size)
      ? selectedSizes.filter(s => s !== size)
      : [...selectedSizes, size];
    setSelectedSizes(newSizes);
    onFilterChange({ sizes: newSizes, colors: selectedColors, priceRange: priceRangeValue });
  };

  const toggleColor = (color: string) => {
    const newColors = selectedColors.includes(color)
      ? selectedColors.filter(c => c !== color)
      : [...selectedColors, color];
    setSelectedColors(newColors);
    onFilterChange({ sizes: selectedSizes, colors: newColors, priceRange: priceRangeValue });
  };

  const handlePriceChange = (index: number, value: number) => {
    const newRange = [...priceRangeValue];
    newRange[index] = value;
    setPriceRangeValue(newRange);
    onFilterChange({ sizes: selectedSizes, colors: selectedColors, priceRange: newRange });
  };

  const clearFilters = () => {
    setSelectedSizes([]);
    setSelectedColors([]);
    setPriceRangeValue([priceRange.min, priceRange.max]);
    onFilterChange({ sizes: [], colors: [], priceRange: [priceRange.min, priceRange.max] });
  };

  return (
    <div className="bg-white rounded-xl p-6 sticky top-24">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold">Filters</h3>
        <button
          onClick={clearFilters}
          className="text-sm text-gray-500 hover:text-black transition-colors"
        >
          Clear All
        </button>
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
        {expandedSections.size && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="flex flex-wrap gap-2"
          >
            {availableSizes.map(size => (
              <button
                key={size}
                onClick={() => toggleSize(size)}
                className={`px-4 py-2 border rounded-lg text-sm transition-all ${
                  selectedSizes.includes(size)
                    ? 'bg-black text-white border-black'
                    : 'border-gray-200 hover:border-black'
                }`}
              >
                {size}
              </button>
            ))}
          </motion.div>
        )}
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
        {expandedSections.color && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="flex flex-wrap gap-2"
          >
            {availableColors.map(color => (
              <button
                key={color}
                onClick={() => toggleColor(color)}
                className={`px-4 py-2 border rounded-lg text-sm transition-all ${
                  selectedColors.includes(color)
                    ? 'bg-black text-white border-black'
                    : 'border-gray-200 hover:border-black'
                }`}
              >
                {color}
              </button>
            ))}
          </motion.div>
        )}
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
        {expandedSections.price && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="space-y-3"
          >
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <label className="text-xs text-gray-500">Min</label>
                <input
                  type="number"
                  value={priceRangeValue[0]}
                  onChange={(e) => handlePriceChange(0, Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  min={priceRange.min}
                  max={priceRangeValue[1]}
                />
              </div>
              <span className="text-gray-400 mt-5">-</span>
              <div className="flex-1">
                <label className="text-xs text-gray-500">Max</label>
                <input
                  type="number"
                  value={priceRangeValue[1]}
                  onChange={(e) => handlePriceChange(1, Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  min={priceRangeValue[0]}
                  max={priceRange.max}
                />
              </div>
            </div>
            <input
              type="range"
              min={priceRange.min}
              max={priceRange.max}
              value={priceRangeValue[1]}
              onChange={(e) => handlePriceChange(1, Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Rs. {priceRangeValue[0].toLocaleString()}</span>
              <span>Rs. {priceRangeValue[1].toLocaleString()}</span>
            </div>
          </motion.div>
        )}
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
        {expandedSections.features && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="space-y-2"
          >
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 rounded" />
              <span className="text-sm">New Arrivals</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 rounded" />
              <span className="text-sm">Best Sellers</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 rounded" />
              <span className="text-sm">On Sale</span>
            </label>
          </motion.div>
        )}
      </div>
    </div>
  );
}
