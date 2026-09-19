import { useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';

interface StickyAddToCartProps {
  product: {
    id: string;
    name: string;
    image_url?: string | null;
    base_price: string;
    compare_at_price?: string | null;
  };
  onAddToCart: () => void;
}

export default function StickyAddToCart({ product, onAddToCart }: StickyAddToCartProps) {
  const [selectedSize, setSelectedSize] = useState<string>('M');
  const { scrollY } = useScroll();
  
  // Show sticky bar when scrolled past main image gallery (around 600px)
  const opacity = useTransform(scrollY, [500, 600], [0, 1]);
  const y = useTransform(scrollY, [500, 600], [100, 0]);

  const sizes = ['S', 'M', 'L', 'XL'];
  
  // Calculate prices
  const basePrice = parseFloat(product.base_price);
  const comparePrice = product.compare_at_price ? parseFloat(product.compare_at_price) : null;
  const discount = comparePrice ? Math.round(((comparePrice - basePrice) / comparePrice) * 100) : 0;

  return (
    <motion.div
      style={{ opacity, y }}
      className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-lg"
    >
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center gap-4">
          {/* Product Thumbnail */}
          <div className="w-16 h-16 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
            <img
              src={product.image_url || '/placeholder.jpg'}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Product Info */}
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold truncate">{product.name}</h4>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-base font-bold text-purple-600">
                Rs. {basePrice.toLocaleString()}
              </span>
              {comparePrice && comparePrice > basePrice && (
                <>
                  <span className="text-xs text-gray-400 line-through">
                    Rs. {comparePrice.toLocaleString()}
                  </span>
                  <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-medium">
                    -{discount}%
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Size Selector */}
          <div className="hidden sm:flex items-center gap-2">
            {sizes.map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${
                  selectedSize === size
                    ? 'bg-black text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {size}
              </button>
            ))}
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={onAddToCart}
            className="flex items-center gap-2 px-5 py-2.5 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium text-sm whitespace-nowrap"
          >
            <ShoppingBag size={18} />
            <span className="hidden sm:inline">Add to Cart</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
