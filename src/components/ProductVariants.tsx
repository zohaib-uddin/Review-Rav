import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface Variant {
  id: string;
  color: string;
  colorHex: string;
  images: string[];
  stock: number;
  price?: number;
}

interface ProductVariantsProps {
  variants: Variant[];
  selectedVariant: Variant | null;
  onVariantChange: (variant: Variant) => void;
}

export default function ProductVariants({ variants, selectedVariant, onVariantChange }: ProductVariantsProps) {
  const [hoveredVariant, setHoveredVariant] = useState<string | null>(null);

  if (variants.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-wider">
          Color: <span className="font-normal text-gray-600">{selectedVariant?.color || 'Select a color'}</span>
        </h3>
        {selectedVariant && selectedVariant.stock <= 10 && selectedVariant.stock > 0 && (
          <span className="text-xs text-orange-600 font-medium">
            Only {selectedVariant.stock} left!
          </span>
        )}
      </div>

      <div className="flex gap-3 flex-wrap">
        {variants.map((variant) => {
          const isSelected = selectedVariant?.id === variant.id;
          const isOutOfStock = variant.stock === 0;
          const isHovered = hoveredVariant === variant.id;

          return (
            <motion.button
              key={variant.id}
              onClick={() => !isOutOfStock && onVariantChange(variant)}
              onMouseEnter={() => setHoveredVariant(variant.id)}
              onMouseLeave={() => setHoveredVariant(null)}
              disabled={isOutOfStock}
              className={`relative group ${isOutOfStock ? 'cursor-not-allowed' : 'cursor-pointer'}`}
              whileHover={!isOutOfStock ? { scale: 1.05 } : {}}
              whileTap={!isOutOfStock ? { scale: 0.95 } : {}}
            >
              {/* Color Swatch */}
              <div
                className={`w-16 h-16 rounded-full border-2 transition-all ${
                  isSelected
                    ? 'border-black scale-110'
                    : isOutOfStock
                    ? 'border-gray-300 opacity-50'
                    : 'border-gray-200 hover:border-gray-400'
                }`}
                style={{ backgroundColor: variant.colorHex }}
              >
                {isSelected && (
                  <div className="w-full h-full flex items-center justify-center">
                    <Check
                      size={24}
                      className={variant.colorHex === '#FFFFFF' || variant.colorHex === '#F5F5DC' ? 'text-black' : 'text-white'}
                      strokeWidth={3}
                    />
                  </div>
                )}
              </div>

              {/* Color Name Tooltip */}
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 5 }}
                className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black text-white text-xs px-2 py-1 rounded"
              >
                {variant.color}
                {isOutOfStock && ' (Out of Stock)'}
              </motion.div>

              {/* Image Preview on Hover */}
              {isHovered && !isOutOfStock && variant.images.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute -top-32 left-1/2 -translate-x-1/2 w-24 h-24 rounded-lg overflow-hidden shadow-xl z-10 bg-white border-2 border-gray-200"
                >
                  <img
                    src={variant.images[0]}
                    alt={variant.color}
                    className="w-full h-full object-cover"
                  />
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Price Update */}
      {selectedVariant?.price && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-gray-600"
        >
          Price for {selectedVariant.color}: <span className="font-bold text-black">Rs. {selectedVariant.price.toLocaleString()}</span>
        </motion.p>
      )}
    </div>
  );
}
