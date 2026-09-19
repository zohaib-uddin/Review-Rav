import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Eye, ShoppingBag } from 'lucide-react';
import { useStore } from '../store/useStore';

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
  const images = product.images || [product.image];
  const hasMultipleImages = images.length > 1;

  // Auto-select first size on hover
  useEffect(() => {
    if (isHovered && product.sizes && product.sizes.length > 0 && !selectedSize) {
      setSelectedSize(product.sizes[0]);
    }
  }, [isHovered, product.sizes, selectedSize]);

  // Handle hover enter
  const handleMouseEnter = () => {
    setIsHovered(true);
    if (hasMultipleImages) {
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

  // Handle Add to Cart with flying animation
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!selectedSize) {
      alert('Please select a size');
      return;
    }

    const buttonRect = e.currentTarget.getBoundingClientRect();
    const cartIcon = document.querySelector('[data-cart-icon]');
    const cartRect = cartIcon?.getBoundingClientRect();

    if (cartRect) {
      const flyingElement = document.createElement('div');
      flyingElement.style.position = 'fixed';
      flyingElement.style.left = `${buttonRect.left + buttonRect.width / 2}px`;
      flyingElement.style.top = `${buttonRect.top + buttonRect.height / 2}px`;
      flyingElement.style.width = '60px';
      flyingElement.style.height = '60px';
      flyingElement.style.backgroundImage = `url(${images[currentImageIndex]})`;
      flyingElement.style.backgroundSize = 'cover';
      flyingElement.style.backgroundPosition = 'center';
      flyingElement.style.borderRadius = '50%';
      flyingElement.style.zIndex = '9999';
      flyingElement.style.transition = 'all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
      flyingElement.style.boxShadow = '0 4px 20px rgba(0,0,0,0.3)';
      
      document.body.appendChild(flyingElement);

      setTimeout(() => {
        flyingElement.style.left = `${cartRect.left + cartRect.width / 2}px`;
        flyingElement.style.top = `${cartRect.top + cartRect.height / 2}px`;
        flyingElement.style.width = '20px';
        flyingElement.style.height = '20px';
        flyingElement.style.opacity = '0.3';
      }, 10);

      setTimeout(() => {
        flyingElement.remove();
        const firstColor = product.colors?.[0];
        const colorName = typeof firstColor === 'string' ? firstColor : firstColor?.name || 'Black';
        addToCart(product, selectedSize, colorName);
      }, 800);
    } else {
      const firstColor = product.colors?.[0];
      const colorName = typeof firstColor === 'string' ? firstColor : firstColor?.name || 'Black';
      addToCart(product, selectedSize, colorName);
    }
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
      className="group relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Product Image Container - 9:16 aspect ratio, sharp corners */}
      <Link to={`/products/${product.slug}`} className="block">
        <div className="relative overflow-hidden aspect-[9/16] bg-gray-100 border-0">
          {/* Product Image */}
          <motion.img
            src={images[currentImageIndex]}
            alt={product.name}
            className="w-full h-full object-cover"
            initial={false}
            animate={{
              scale: isHovered ? 1.05 : 1,
            }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />

          {/* Badge with priority logic */}
          <div className="absolute top-3 left-3">
            {/* Manual badges take priority */}
            {product.is_new_arrival && (
              <span className="bg-black text-white text-[10px] font-bold px-3 py-1.5 block">
                NEW ARRIVAL
              </span>
            )}
            {product.is_best_seller && !product.is_new_arrival && (
              <span className="bg-black text-white text-[10px] font-bold px-3 py-1.5 block">
                BEST SELLER
              </span>
            )}
            {product.badge && !product.is_new_arrival && !product.is_best_seller && (
              <span className="bg-black text-white text-[10px] font-bold px-3 py-1.5 block">
                {product.badge}
              </span>
            )}
            {/* Auto-calculated discount badge (only if no manual badge) */}
            {showDiscountBadge && (
              <motion.span 
                className="bg-red-600 text-white text-[10px] font-bold px-3 py-1.5 block"
                animate={{
                  boxShadow: ['0 0 0 0 rgba(220, 38, 38, 0.4)', '0 0 0 8px rgba(220, 38, 38, 0)'],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  repeatDelay: 0.5,
                }}
              >
                {discountPercent}% OFF
              </motion.span>
            )}
          </div>

          {/* Quick View Button - Expands to show text */}
          <motion.button
            onClick={handleQuickView}
            className="absolute top-3 right-3 bg-white text-black flex items-center overflow-hidden"
            initial={{ opacity: 0, width: '40px', height: '40px', borderRadius: '50%' }}
            animate={{ 
              opacity: isHovered ? 1 : 0,
              width: quickViewExpanded ? '120px' : '40px',
              height: '40px',
              borderRadius: '50%',
            }}
            transition={{ duration: 0.3 }}
            onMouseEnter={() => setQuickViewExpanded(true)}
            onMouseLeave={() => setQuickViewExpanded(false)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="w-[40px] h-[40px] flex items-center justify-center flex-shrink-0">
              <Eye size={18} />
            </div>
            <motion.span 
              className="text-xs font-bold whitespace-nowrap pr-2"
              initial={{ opacity: 0, width: 0 }}
              animate={{ 
                opacity: quickViewExpanded ? 1 : 0,
                width: quickViewExpanded ? 'auto' : 0,
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
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm p-3 border-t"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              >
                <p className="text-xs font-medium mb-2 text-center">Select Size</p>
                <div className="flex gap-2 justify-center flex-wrap">
                  {product.sizes.map((size: string) => (
                    <button
                      key={size}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setSelectedSize(size);
                      }}
                      className={`px-3 py-1.5 text-xs font-medium border-2 transition-all ${
                        selectedSize === size
                          ? 'border-black bg-black text-white'
                          : 'border-gray-300 hover:border-black'
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
        <Link to={`/products/${product.slug}`}>
          <h3 className="text-sm font-normal text-gray-800 line-clamp-2 hover:text-black transition-colors">
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
