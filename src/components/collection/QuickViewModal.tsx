import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Heart, ShoppingBag, ArrowLeft, ArrowRight, Zap, Check } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Product } from '../../store/useStore';
import { useCart } from '../../context/CartContext';

interface QuickViewModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

export default function QuickViewModal({ product, isOpen, onClose }: QuickViewModalProps) {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [currentImage, setCurrentImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [added, setAdded] = useState(false);

  if (!isOpen) return null;

  const images = product.images || [product.image_url || product.image || ''];
  const sizes = product.sizes || product.attributes?.sizes || ['S', 'M', 'L', 'XL'];
  const colors = product.colors || product.attributes?.colors || [];

  const nextImage = () => setCurrentImage((prev) => (prev + 1) % images.length);
  const prevImage = () => setCurrentImage((prev) => (prev - 1 + images.length) % images.length);

  const effectivePrice = Number(product.sale_price || product.salePrice || product.base_price || product.price || 0);
  const comparePrice = product.compare_at_price ? Number(product.compare_at_price) : null;

  const handleAddToCart = (e: React.MouseEvent) => {
    const sizeToUse = selectedSize || sizes[0] || 'M';
    const firstCol = colors[0];
    const colorToUse = selectedColor || (typeof firstCol === 'string' ? firstCol : firstCol?.name) || 'Black';
    
    addToCart(product, sizeToUse, colorToUse, 1, e.currentTarget as HTMLElement);
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      onClose();
    }, 1500);
  };

  const handleBuyNow = () => {
    const sizeToUse = selectedSize || sizes[0] || 'M';
    const firstCol = colors[0];
    const colorToUse = selectedColor || (typeof firstCol === 'string' ? firstCol : firstCol?.name) || 'Black';
    
    addToCart(product, sizeToUse, colorToUse, 1);
    onClose();
    navigate('/checkout');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-xs font-bold uppercase tracking-widest">Quick View</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer">
            <X size={18} />
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-6 p-6 overflow-y-auto max-h-[calc(90vh-70px)]">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-neutral-50 border border-gray-100">
              <img
                src={images[currentImage]}
                alt={product.name}
                className="w-full h-full object-contain object-center"
              />
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 text-black hover:scale-125 transition-transform p-2 cursor-pointer"
                  >
                    <ArrowLeft size={24} strokeWidth={2.5} />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-black hover:scale-125 transition-transform p-2 cursor-pointer"
                  >
                    <ArrowRight size={24} strokeWidth={2.5} />
                  </button>
                </>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentImage(i)}
                    className={`w-16 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all cursor-pointer ${
                      i === currentImage ? 'border-black shadow-sm' : 'border-transparent opacity-60'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-5">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 block mb-1">
                RAVENZA DROP
              </span>
              <h3 className="text-2xl font-display font-bold text-black mb-3">{product.name}</h3>
              <div className="flex items-center gap-3">
                <span className="text-2xl font-extrabold text-black">
                  Rs. {effectivePrice.toLocaleString()}
                </span>
                {comparePrice && comparePrice > effectivePrice && (
                  <span className="text-sm text-gray-400 line-through font-mono">
                    Rs. {comparePrice.toLocaleString()}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-600 mt-3 leading-relaxed line-clamp-3">
                {product.description}
              </p>
            </div>

            {/* Size Selection */}
            {sizes.length > 0 && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2">Select Size</label>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((size: string) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 border text-xs font-bold transition-all cursor-pointer ${
                        selectedSize === size
                          ? 'bg-black text-white border-black shadow-xs'
                          : 'border-gray-200 hover:border-black'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Color Selection */}
            {colors.length > 0 && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2">Select Color</label>
                <div className="flex flex-wrap gap-2">
                  {colors.map((color: any, idx: number) => {
                    const colorName = typeof color === 'string' ? color : color.name;
                    return (
                      <button
                        key={idx}
                        onClick={() => setSelectedColor(colorName)}
                        className={`px-4 py-2 border text-xs font-bold transition-all cursor-pointer ${
                          selectedColor === colorName
                            ? 'bg-black text-white border-black shadow-xs'
                            : 'border-gray-200 hover:border-black'
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
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                onClick={handleAddToCart}
                className="flex-1 flex items-center justify-center gap-2 bg-black text-white py-3 px-4 text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                {added ? <Check size={16} /> : <ShoppingBag size={16} />}
                {added ? 'Added ✓' : 'Add to Bag'}
              </button>
              <button
                onClick={handleBuyNow}
                className="flex-1 flex items-center justify-center gap-2 bg-neutral-900 text-white py-3 px-4 text-xs font-bold uppercase tracking-wider hover:bg-black transition-colors cursor-pointer"
              >
                <Zap size={16} /> Buy Now
              </button>
            </div>

            {/* View Full Details Link */}
            <div className="pt-2 text-center">
              <Link
                to={`/products/${product.slug || product.id}`}
                onClick={onClose}
                className="inline-block text-xs font-bold uppercase tracking-widest text-black underline hover:text-gray-600 transition-colors"
              >
                View Full Product Details →
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
