import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Maximize2, ShoppingBag, ChevronLeft, ChevronRight } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useCart } from '../context/CartContext';

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
  const [quickViewExpanded, setQuickViewExpanded] = useState(false);
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
    setQuickViewExpanded(false);
  };

  // Calculate discount percentage
  const calculateDiscount = () => {
    const comparePrice = product.compare_at_price || product.compare_price;
    const actualPrice = product.price || product.base_price;
    if (comparePrice && actualPrice && comparePrice > actualPrice) {
      return Math.round(((comparePrice - actualPrice) / comparePrice) * 100);
    }
    return null;
  };

  const discountPercent = calculateDiscount();
  const hasManualBadge = product.badge || product.is_new_arrival || product.is_best_seller;
  const showDiscountBadge = !hasManualBadge && discountPercent !== null;

  // Handle Add to Cart with flying animation - using new CartContext
  const { addToCart: addToCartWithAnimation } = useCart();
  
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const sizeToUse = selectedSize || product.sizes?.[0] || 'M';
    const firstColor = product.colors?.[0];
    const colorName = typeof firstColor === 'string' ? firstColor : firstColor?.name || 'Black';
    
    // Use the new CartContext addToCart which triggers flying animation
    addToCartWithAnimation(product, sizeToUse, colorName, 1, e.currentTarget as HTMLElement);
  };

  // Handle Quick View
  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowQuickView(true);
  };

  const price = product.price || product.base_price || 0;
  const comparePrice = product.compare_at_price || product.compare_price;
  const salePrice = product.salePrice || (comparePrice && comparePrice > price ? comparePrice : null);

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
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

            {/* Badges with continuous Zoom In / Zoom Out Loop Animation */}
            <motion.div
              className="absolute top-3 left-3 z-20 pointer-events-none flex flex-col gap-1.5"
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              {product.is_new_arrival && (
                <span className="bg-black text-white text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 block shadow-sm">
                  NEW ARRIVAL
                </span>
              )}
              {product.is_best_seller && !product.is_new_arrival && (
                <span className="bg-black text-white text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 block shadow-sm">
                  BEST SELLER
                </span>
              )}
              {product.badge && !product.is_new_arrival && !product.is_best_seller && (
                <span className="bg-black text-white text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 block shadow-sm">
                  {product.badge}
                </span>
              )}
              {showDiscountBadge && (
                <span className="bg-red-600 text-white text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 block shadow-sm">
                  {discountPercent}% OFF
                </span>
              )}
            </motion.div>

            {/* Quick View Button - Clean Rectangle Badge format (no circular/oracle distortion) */}
            <motion.button
              type="button"
              onClick={handleQuickView}
              className="absolute top-3 right-3 bg-white text-black flex items-center justify-center overflow-hidden shadow-md z-20 border border-gray-100"
              initial={{ opacity: 0, width: '32px', height: '32px' }}
              animate={{ 
                opacity: isHovered ? 1 : 0,
                width: quickViewExpanded ? '112px' : '32px',
                height: '32px',
              }}
              transition={{ duration: 0.25 }}
              onMouseEnter={() => setQuickViewExpanded(true)}
              onMouseLeave={() => setQuickViewExpanded(false)}
              whileTap={{ scale: 0.95 }}
              title="Quick View"
            >
              <div className="w-[32px] h-[32px] flex items-center justify-center flex-shrink-0">
                <Maximize2 size={14} />
              </div>
              <motion.span 
                className="text-[10px] font-bold tracking-wider uppercase whitespace-nowrap pr-2.5"
                initial={{ opacity: 0 }}
                animate={{ 
                  opacity: quickViewExpanded ? 1 : 0,
                }}
                transition={{ duration: 0.2 }}
              >
                Quick View
              </motion.span>
            </motion.button>

            {/* Size Selector - Slides up from bottom */}
            <AnimatePresence>
              {showSizeSelector && product.sizes && product.sizes.length > 0 && (
                <motion.div
                  initial={{ y: '100%', opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: '100%', opacity: 0 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                  className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm p-3 border-t z-20"
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
                        className={`px-2.5 py-1 text-xs font-semibold border transition-all ${
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
            <h3 className="text-sm font-normal text-gray-800 line-clamp-1 hover:text-black transition-colors">
              {product.name}
            </h3>
          </Link>
          <div className="flex items-center gap-2 mt-1.5">
            {salePrice && salePrice > price ? (
              <>
                <span className="text-sm font-bold text-black">
                  Rs.{price.toLocaleString()}
                </span>
                <span className="text-xs text-gray-400 line-through">
                  Rs.{salePrice.toLocaleString()}
                </span>
              </>
            ) : (
              <span className="text-sm font-bold text-black">
                Rs.{price.toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Full-width Add to Cart button right under the price */}
      <div className="mt-3">
        <motion.button
          type="button"
          whileTap={{ scale: 0.98 }}
          onClick={handleAddToCart}
          className="w-full py-2.5 bg-black text-white text-[11px] font-bold tracking-[0.2em] uppercase hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2 shadow-sm"
        >
          <ShoppingBag size={13} />
          Add to Cart
        </motion.button>
      </div>

      {/* Quick View Modal */}
      <AnimatePresence>
        {showQuickView && (
          <QuickViewModal
            product={product}
            onClose={() => setShowQuickView(false)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Quick View Modal Component
function QuickViewModal({ product, onClose }: { product: any; onClose: () => void }) {
  const { addToCart } = useStore();
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || '');
  const firstColor = product.colors?.[0];
  const initialColor = typeof firstColor === 'string' ? firstColor : firstColor?.name || 'Black';
  const [selectedColor, setSelectedColor] = useState(initialColor);

  const handleAddToCart = () => {
    if (!selectedSize) {
      alert('Please select a size');
      return;
    }
    addToCart(product, selectedSize, selectedColor);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="grid md:grid-cols-2 gap-6 p-6">
          {/* Product Image */}
          <div className="aspect-square rounded-xl overflow-hidden bg-gray-100">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Product Details */}
          <div className="flex flex-col">
            <h2 className="text-2xl font-bold mb-2">{product.name}</h2>
            
            {/* Price */}
            <div className="flex items-center gap-3 mb-4">
              {product.salePrice ? (
                <>
                  <span className="text-2xl font-bold text-black">
                    Rs.{product.salePrice.toLocaleString()}
                  </span>
                  <span className="text-lg text-gray-400 line-through">
                    Rs.{product.price?.toLocaleString()}
                  </span>
                </>
              ) : (
                <span className="text-2xl font-bold text-black">
                  Rs.{product.price?.toLocaleString()}
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-gray-600 mb-6">{product.description}</p>

            {/* Size Selection */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-medium mb-2">Size</p>
                <div className="flex gap-2 flex-wrap">
                  {product.sizes.map((size: string) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 text-sm font-medium rounded-lg border-2 transition-all ${
                        selectedSize === size
                          ? 'border-black bg-black text-white'
                          : 'border-gray-300 hover:border-black'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Color Selection */}
            {product.colors && product.colors.length > 0 && (
              <div className="mb-6">
                <p className="text-sm font-medium mb-2">Color</p>
                <div className="flex gap-2 flex-wrap">
                  {product.colors.map((color: any, idx: number) => {
                    const colorName = typeof color === 'string' ? color : color.name;
                    return (
                      <button
                        key={idx}
                        onClick={() => setSelectedColor(colorName)}
                        className={`px-4 py-2 text-sm font-medium rounded-lg border-2 transition-all ${
                        selectedColor === colorName
                          ? 'border-black bg-black text-white'
                          : 'border-gray-300 hover:border-black'
                      }`}
                    >
                      {colorName}
                    </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 mt-auto">
              <button
                onClick={handleAddToCart}
                className="flex-1 bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
              >
                <ShoppingBag size={18} />
                Add to Cart
              </button>
              <Link
                to={`/products/${product.slug}`}
                onClick={onClose}
                className="flex-1 border-2 border-black text-black py-3 rounded-lg font-medium hover:bg-black hover:text-white transition-colors text-center"
              >
                View Full Details
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
