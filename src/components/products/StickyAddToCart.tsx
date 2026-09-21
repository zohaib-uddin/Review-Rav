import { motion, useScroll, useTransform } from 'framer-motion';
import { ShoppingBag, Zap } from 'lucide-react';

interface StickyAddToCartProps {
  product: {
    id: string;
    name: string;
    image_url?: string | null;
    base_price: string | number;
    compare_at_price?: string | number | null;
  };
  selectedSize: string;
  onSelectSize: (size: string) => void;
  availableSizes?: string[];
  currentPrice: number;
  comparePrice?: number | null;
  onAddToCart: () => void;
  onBuyNow?: () => void;
}

export default function StickyAddToCart({
  product,
  selectedSize,
  onSelectSize,
  availableSizes = ['S', 'M', 'L', 'XL'],
  currentPrice,
  comparePrice,
  onAddToCart,
  onBuyNow,
}: StickyAddToCartProps) {
  const { scrollY } = useScroll();
  
  // Show sticky bar when scrolled past main hero section (around 450px)
  const opacity = useTransform(scrollY, [450, 550], [0, 1]);
  const y = useTransform(scrollY, [450, 550], [100, 0]);

  const discount = comparePrice && comparePrice > currentPrice
    ? Math.round(((comparePrice - currentPrice) / comparePrice) * 100)
    : 0;

  return (
    <motion.div
      style={{ opacity, y }}
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-xl"
    >
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-3 sm:gap-6">
          {/* Product Thumbnail & Title */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-14 sm:w-14 sm:h-16 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden border border-gray-100">
              <img
                src={product.image_url || 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&h=1000&fit=crop'}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs sm:text-sm font-semibold truncate text-black">{product.name}</h4>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-sm sm:text-base font-bold text-black">
                  Rs. {currentPrice.toLocaleString()}
                </span>
                {comparePrice && comparePrice > currentPrice && (
                  <>
                    <span className="text-xs text-gray-400 line-through">
                      Rs. {comparePrice.toLocaleString()}
                    </span>
                    <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-bold">
                      -{discount}%
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Size Selector - Perfectly Synced with Main Page */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-gray-500 font-medium hidden md:inline">Size:</span>
            {availableSizes.map((size) => (
              <button
                type="button"
                key={size}
                onClick={() => onSelectSize(size)}
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg text-xs font-semibold transition-all ${
                  selectedSize === size
                    ? 'bg-black text-white shadow-sm'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                {size}
              </button>
            ))}
          </div>

          {/* CTA Buttons - Only Add to Cart as requested */}
          <div className="flex items-center">
            <button
              type="button"
              onClick={onAddToCart}
              className="flex items-center gap-1.5 px-4 sm:px-6 py-2.5 bg-black text-white rounded-lg hover:bg-neutral-800 transition-colors font-bold text-xs uppercase tracking-wider whitespace-nowrap shadow-sm"
            >
              <ShoppingBag size={15} />
              <span>Add to Cart</span>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
