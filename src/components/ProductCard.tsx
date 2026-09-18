import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Eye, ShoppingBag } from 'lucide-react';
import { useStore } from '../store/useStore';

interface ProductCardProps {
  product: any;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { addToCart } = useStore();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [showSizeSelector, setShowSizeSelector] = useState(false);
  const [selectedSize, setSelectedSize] = useState('');
  const [showQuickView, setShowQuickView] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Get all images for the product
  const images = product.images || [product.image];
  const hasMultipleImages = images.length > 1;

  // Handle hover enter
  const handleMouseEnter = () => {
    setIsHovered(true);
    if (hasMultipleImages) {
      setCurrentImageIndex(1); // Show second image on hover
    }
    setShowSizeSelector(true);
    
    // Auto-select first size if available
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      setSelectedSize(product.sizes[0]);
    }
  };

  // Handle hover leave
  const handleMouseLeave = () => {
    setIsHovered(false);
    setCurrentImageIndex(0); // Back to first image
    setShowSizeSelector(false);
  };

  // Navigate to next image
  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  // Navigate to previous image
  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  // Handle Add to Cart with flying animation
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!selectedSize) {
      alert('Please select a size');
      return;
    }

    // Get button position
    const buttonRect = e.currentTarget.getBoundingClientRect();
    
    // Get cart icon position
    const cartIcon = document.querySelector('[data-cart-icon]');
    const cartRect = cartIcon?.getBoundingClientRect();

    if (cartRect) {
      // Create flying element
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

      // Animate to cart
      setTimeout(() => {
        flyingElement.style.left = `${cartRect.left + cartRect.width / 2}px`;
        flyingElement.style.top = `${cartRect.top + cartRect.height / 2}px`;
        flyingElement.style.width = '20px';
        flyingElement.style.height = '20px';
        flyingElement.style.opacity = '0.3';
      }, 10);

      // Remove after animation and add to cart
      setTimeout(() => {
        flyingElement.remove();
        const firstColor = product.colors?.[0];
        const colorName = typeof firstColor === 'string' ? firstColor : firstColor?.name || 'Black';
        addToCart(product, selectedSize, colorName);
      }, 800);
    } else {
      // Fallback if cart icon not found
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
      {/* Product Image Container - 16:9 ratio */}
      <Link to={`/products/${product.slug}`} className="block">
        <div className="relative overflow-hidden rounded-xl aspect-[16/9] bg-gray-100 border-2 border-gray-200 group-hover:border-black transition-all duration-300">
          {/* Product Image */}
          <motion.img
            src={images[currentImageIndex]}
            alt={product.name}
            className="w-full h-full object-cover"
            initial={false}
            animate={{
              scale: isHovered ? 1.1 : 1,
              borderRadius: isHovered ? '30% 30% 30% 30% / 30% 30% 30% 30%' : '0%',
            }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />

          {/* Badge with zoom effect */}
          {(product.isNew || product.salePrice || product.badge) && (
            <motion.div
              className="absolute top-3 left-3"
              animate={{
                scale: isHovered ? [1, 1.2, 1] : 1,
              }}
              transition={{
                duration: 0.6,
                repeat: isHovered ? Infinity : 0,
                repeatDelay: 0.5,
              }}
            >
              {product.isNew && (
                <span className="bg-black text-white text-[10px] font-bold px-3 py-1.5 rounded-full">
                  NEW
                </span>
              )}
              {product.salePrice && !product.isNew && (
                <span className="bg-red-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-full">
                  SALE
                </span>
              )}
              {product.badge && !product.isNew && !product.salePrice && (
                <span className="bg-purple-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-full">
                  {product.badge}
                </span>
              )}
            </motion.div>
          )}

          {/* Quick View Icon - Top Right */}
          <motion.button
            onClick={handleQuickView}
            className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-lg hover:bg-black hover:text-white transition-colors"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ 
              opacity: isHovered ? 1 : 0,
              scale: isHovered ? 1 : 0.8,
            }}
            transition={{ duration: 0.3 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Eye size={18} />
          </motion.button>

          {/* Image Navigation Arrows */}
          {hasMultipleImages && isHovered && (
            <>
              <motion.button
                onClick={prevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white/90 rounded-full shadow-lg hover:bg-white transition-colors"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <ChevronLeft size={20} />
              </motion.button>
              <motion.button
                onClick={nextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/90 rounded-full shadow-lg hover:bg-white transition-colors"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <ChevronRight size={20} />
              </motion.button>
            </>
          )}

          {/* Image Indicator Dots */}
          {hasMultipleImages && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
              {images.map((_img: string, idx: number) => (
                <div
                  key={idx}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    idx === currentImageIndex ? 'bg-white w-4' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Size Selector - Slides up from bottom */}
          <AnimatePresence>
            {showSizeSelector && product.sizes && product.sizes.length > 0 && (
              <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm p-3 border-t"
                onClick={(e) => e.preventDefault()}
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
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg border-2 transition-all ${
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

          {/* Add to Cart Button - Appears on hover */}
          <AnimatePresence>
            {isHovered && selectedSize && (
              <motion.button
                onClick={handleAddToCart}
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="absolute bottom-3 left-3 right-3 bg-black text-white py-2.5 rounded-lg font-medium text-sm flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors shadow-lg"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <ShoppingBag size={16} />
                Add to Cart
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </Link>

      {/* Product Info */}
      <div className="mt-3 px-1">
        <Link to={`/products/${product.slug}`}>
          <h3 className="text-sm font-normal text-gray-800 line-clamp-2 hover:text-black transition-colors">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center gap-2 mt-1.5">
          {product.salePrice ? (
            <>
              <span className="text-sm font-bold text-black">
                Rs.{product.salePrice.toLocaleString()}
              </span>
              <span className="text-xs text-gray-400 line-through">
                Rs.{product.price?.toLocaleString()}
              </span>
            </>
          ) : (
            <span className="text-sm font-bold text-black">
              Rs.{product.price?.toLocaleString()}
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
