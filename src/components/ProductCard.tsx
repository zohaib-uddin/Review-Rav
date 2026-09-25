import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ZoomIn, ShoppingBag, ChevronLeft, ChevronRight } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useCart } from '../context/CartContext';
import QuickViewModal from './collection/QuickViewModal';

interface ProductCardProps {
  product: any;
  index?: number;
  fullWidth?: boolean;
}

export default function ProductCard({ product, index = 0, fullWidth = false }: ProductCardProps) {
  const { addToCart } = useStore();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [showSizeSelector, setShowSizeSelector] = useState(false);
  const [selectedSize, setSelectedSize] = useState('');
  const [showQuickView, setShowQuickView] = useState(false);
  const [quickViewHovered, setQuickViewHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Get all images for the product
  const images = Array.isArray(product.images) && product.images.length > 0 
    ? product.images 
    : [product.image_url || product.image || 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&h=1000&fit=crop'];
  const hasMultipleImages = images.length > 1;

  // Auto-select first size
  useEffect(() => {
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      setSelectedSize(product.sizes[0]);
    }
  }, [product.sizes, selectedSize]);

  // Handle hover enter
  const handleMouseEnter = () => {
    setIsHovered(true);
    if (hasMultipleImages && currentImageIndex === 0) {
      setCurrentImageIndex(1); // Show second image on hover
    }
    setShowSizeSelector(true);
  };

  // Handle hover leave
  const handleMouseLeave = () => {
    setIsHovered(false);
    setCurrentImageIndex(0); // Back to first image
    setShowSizeSelector(false);
    setQuickViewHovered(false);
  };

  // Calculate discount percentage
  const calculateDiscount = () => {
    const rawCompare = product.compare_at_price || product.compare_price || (product as any).comparePrice;
    const actualPrice = product.price || product.base_price;
    if (rawCompare && actualPrice && Number(rawCompare) > Number(actualPrice)) {
      return Math.round(((Number(rawCompare) - Number(actualPrice)) / Number(rawCompare)) * 100);
    }
    return null;
  };

  const discountPercent = calculateDiscount();
  const hasManualBadge = product.badge || product.is_new_arrival || product.is_best_seller;
  const showDiscountBadge = !hasManualBadge && discountPercent !== null && discountPercent > 0;

  // Handle Add to Cart with flying animation - using new CartContext
  const { addToCart: addToCartWithAnimation } = useCart();
  
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const sizeToUse = selectedSize || product.sizes?.[0] || 'M';
    const firstColor = product.colors?.[0];
    const colorName = typeof firstColor === 'string' ? firstColor : firstColor?.name || 'Black';
    
    addToCartWithAnimation(product, sizeToUse, colorName, 1, e.currentTarget as HTMLElement);
  };

  // Handle Quick View
  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowQuickView(true);
  };

  const price = Number(product.price || product.base_price || 0);
  const rawCompare = product.compare_at_price || product.compare_price || (product as any).comparePrice;
  const comparePrice = rawCompare && Number(rawCompare) > price ? Number(rawCompare) : null;

  const isOutOfStock = Boolean(
    (product.stockCount !== undefined && Number(product.stockCount) <= 0) ||
    (product.stock !== undefined && Number(product.stock) <= 0) ||
    product.inStock === false ||
    product.is_in_stock === false
  );

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, scale: 0.94, y: 18 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      viewport={{ once: true, margin: '-20px' }}
      transition={{ duration: 0.45, delay: (index % 8) * 0.05, ease: [0.22, 1, 0.36, 1] }}
      className="group relative flex flex-col justify-between h-full"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div>
        {/* Product Image Container - 9:16 aspect ratio, sharp corners */}
        <Link to={`/products/${product.slug || product.id}`} className="block">
          <div className="relative overflow-hidden aspect-[9/16] bg-gray-100 border-0">
            {/* Product Image */}
            <motion.img
              key={currentImageIndex}
              src={images[currentImageIndex] || images[0]}
              alt={product.name}
              className="w-full h-full object-cover"
              initial={false}
              animate={{
                scale: isHovered ? 1.05 : 1,
              }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />

            {/* Navigation Arrows on Hover (No background, pure white icon with drop shadow) */}
            {hasMultipleImages && (
              <AnimatePresence>
                {isHovered && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="absolute inset-y-0 inset-x-2 flex items-center justify-between pointer-events-none z-20"
                  >
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
                      }}
                      className="pointer-events-auto bg-transparent border-0 p-1 text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)] hover:scale-125 transition-transform cursor-pointer"
                      aria-label="Previous image"
                    >
                      <ChevronLeft size={28} strokeWidth={2.5} />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setCurrentImageIndex((prev) => (prev + 1) % images.length);
                      }}
                      className="pointer-events-auto bg-transparent border-0 p-1 text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)] hover:scale-125 transition-transform cursor-pointer"
                      aria-label="Next image"
                    >
                      <ChevronRight size={28} strokeWidth={2.5} />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            )}

            {/* Discount Badge on Top Right Corner with Zoom In/Out Loop Animation */}
            {discountPercent !== null && discountPercent > 0 && (
              <motion.div
                className="absolute top-3 right-3 z-20 pointer-events-none"
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                <span className="bg-red-600 text-white text-[10px] font-black tracking-wider uppercase px-2.5 py-1 block shadow-md rounded-xs">
                  {discountPercent}% OFF
                </span>
              </motion.div>
            )}

            {/* Quick View Button:
                - ZoomIn (search with plus) icon
                - Default state: No background, no border-radius box, pure black icon with light shadow
                - On hover: White background with black 'Quick View' text
                - Positioned slightly higher (86px when size selector is active) so it never touches or sticks to the size selector!
            */}
            <motion.button
              type="button"
              onClick={handleQuickView}
              onMouseEnter={() => setQuickViewHovered(true)}
              onMouseLeave={() => setQuickViewHovered(false)}
              className={`absolute right-3.5 z-30 transition-all cursor-pointer flex items-center gap-1.5 ${
                quickViewHovered
                  ? 'bg-white text-black px-3 py-1.5 rounded-full shadow-xl border border-black/15'
                  : 'bg-transparent border-0 p-1 text-black'
              }`}
              initial={false}
              animate={{
                bottom: showSizeSelector ? '86px' : '16px',
              }}
              transition={{
                bottom: { type: 'spring', damping: 22, stiffness: 280 },
              }}
              title="Quick View"
              aria-label="Quick View"
            >
              <ZoomIn
                size={quickViewHovered ? 16 : 20}
                strokeWidth={2.4}
                className={quickViewHovered ? 'text-black' : 'text-black drop-shadow-[0_2px_4px_rgba(0,0,0,0.45)] hover:scale-115 transition-transform'}
              />
              <AnimatePresence>
                {quickViewHovered && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.18 }}
                    className="text-[10px] font-black tracking-wider uppercase whitespace-nowrap text-black select-none"
                  >
                    Quick View
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>

            {/* Size Selector - Slides up from bottom */}
            <AnimatePresence>
              {showSizeSelector && product.sizes && product.sizes.length > 0 && (
                <motion.div
                  initial={{ y: '100%', opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: '100%', opacity: 0 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                  className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm p-3 border-t z-20 shadow-md"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                >
                  <p className="text-[11px] font-bold uppercase tracking-wider mb-2 text-center text-gray-700">Select Size</p>
                  <div className="flex gap-1.5 justify-center flex-wrap">
                    {product.sizes.map((size: string) => (
                      <button
                        type="button"
                        key={size}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setSelectedSize(size);
                        }}
                        className={`px-2.5 py-1 text-xs font-semibold border transition-all cursor-pointer ${
                          selectedSize === size
                            ? 'border-black bg-black text-white'
                            : 'border-gray-300 bg-white hover:border-black'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Link>

        {/* Product Info */}
        <div className="mt-3 px-0">
          <Link to={`/products/${product.slug || product.id}`}>
            <h3 className="text-sm font-bold text-neutral-900 line-clamp-1 hover:text-black tracking-tight leading-snug transition-colors">
              {product.name}
            </h3>
          </Link>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-sm font-black text-black">
              Rs. {price.toLocaleString()}
            </span>
            {comparePrice && comparePrice > price && (
              <span className="text-xs text-neutral-400 line-through font-medium">
                Rs. {comparePrice.toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Full-width Add to Cart / Sold button right under the price */}
      <div className="mt-3">
        {isOutOfStock ? (
          <button
            type="button"
            disabled
            className="w-full py-2.5 bg-neutral-200 text-neutral-500 text-[11px] font-bold tracking-[0.2em] uppercase cursor-not-allowed flex items-center justify-center gap-2 border border-neutral-300 shadow-none"
          >
            Sold
          </button>
        ) : (
          <motion.button
            type="button"
            whileTap={{ scale: 0.98 }}
            onClick={handleAddToCart}
            className="w-full py-2.5 bg-black text-white text-[11px] font-bold tracking-[0.2em] uppercase hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer"
          >
            <ShoppingBag size={13} />
            Add to Cart
          </motion.button>
        )}
      </div>

      {/* Upgraded Quick View Modal */}
      {showQuickView && (
        <QuickViewModal
          product={product}
          isOpen={showQuickView}
          onClose={() => setShowQuickView(false)}
        />
      )}
    </motion.div>
  );
}
