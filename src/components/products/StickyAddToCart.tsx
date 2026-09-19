'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, X } from 'lucide-react';
import { Product } from '../../store/useStore';

interface StickyAddToCartProps {
  product: Product;
  selectedSize: string;
  selectedColor: string;
  onAddToCart: () => void;
  onBuyNow: () => void;
}

export default function StickyAddToCart({
  product,
  selectedSize,
  selectedColor,
  onAddToCart,
  onBuyNow,
}: StickyAddToCartProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [scrolledPast, setScrolledPast] = useState(false);

  useEffect(() => {
    const mainButton = document.getElementById('main-atc-button');
    const pageBottom = document.documentElement.scrollHeight - window.innerHeight;

    const handleScroll = () => {
      if (!mainButton) return;

      const mainButtonRect = mainButton.getBoundingClientRect();
      const scrollY = window.scrollY;

      // Show sticky bar when main button scrolls out of view
      if (mainButtonRect.bottom < 0 && !scrolledPast) {
        setScrolledPast(true);
      }

      // Hide when near page bottom
      const distanceFromBottom = pageBottom - scrollY;
      const shouldShow = scrolledPast && distanceFromBottom > 150;

      setIsVisible(shouldShow);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrolledPast]);

  const price = product.salePrice || product.price || 0;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t shadow-2xl safe-area-pb"
        >
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between gap-4">
              {/* Product Info */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                  <img
                    src={product.image_url || product.images?.[0] || product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-sm truncate">{product.name}</h4>
                  <p className="text-xs text-gray-500">
                    {selectedSize} / {selectedColor}
                  </p>
                </div>
              </div>

              {/* Price */}
              <div className="flex-shrink-0">
                {product.salePrice ? (
                  <div className="text-right">
                    <span className="block text-lg font-bold">Rs.{product.salePrice.toLocaleString()}</span>
                    <span className="block text-xs text-gray-400 line-through">Rs.{product.base_price?.toLocaleString()}</span>
                  </div>
                ) : (
                  <span className="block text-lg font-bold">Rs.{price.toLocaleString()}</span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={onAddToCart}
                  disabled={!selectedSize}
                  className={`px-6 py-3 rounded-full font-bold text-sm transition-all ${
                    selectedSize
                      ? 'bg-black text-white hover:bg-gray-800'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Add to Bag
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={onBuyNow}
                  disabled={!selectedSize}
                  className={`px-6 py-3 rounded-full font-bold text-sm transition-all ${
                    selectedSize
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Buy Now
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
