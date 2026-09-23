import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Heart, ShoppingBag, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Product } from '../../store/useStore';
import { useCart } from '../../context/CartContext';

interface QuickViewModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

export default function QuickViewModal({ product, isOpen, onClose }: QuickViewModalProps) {
  const { addToCart } = useCart();
  const [currentImage, setCurrentImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');

  if (!isOpen) return null;

  const images = product.images || [product.image || ''];
  const sizes = product.sizes || product.attributes?.sizes || [];
  const colors = product.colors || product.attributes?.colors || [];

  const nextImage = () => setCurrentImage((prev) => (prev + 1) % images.length);
  const prevImage = () => setCurrentImage((prev) => (prev - 1 + images.length) % images.length);

  const handleAddToCart = (e: React.MouseEvent) => {
    const sizeToUse = selectedSize || sizes[0] || 'M';
    const firstCol = colors[0];
    const colorToUse = selectedColor || (typeof firstCol === 'string' ? firstCol : firstCol?.name) || 'Black';
    
    addToCart(product, sizeToUse, colorToUse, 1, e.currentTarget as HTMLElement);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold">Quick View</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-6 p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100">
              <img
                src={images[currentImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white/90 rounded-full shadow-md hover:bg-white transition-colors"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/90 rounded-full shadow-md hover:bg-white transition-colors"
                  >
                    <ChevronRight size={20} />
                  </button>
                </>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentImage(i)}
                    className={`w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${
                      i === currentImage ? 'border-black' : 'border-transparent'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-4">
            <div>
              <h3 className="text-2xl font-bold mb-2">{product.name}</h3>
              <div className="flex items-center gap-3 mb-4">
                {product.salePrice ? (
                  <>
                    <span className="text-2xl font-bold text-red-600">
                      Rs. {product.salePrice.toLocaleString()}
                    </span>
                    <span className="text-lg text-gray-400 line-through">
                      Rs. {product.price?.toLocaleString()}
                    </span>
                  </>
                ) : (
                  <span className="text-2xl font-bold">Rs. {product.price?.toLocaleString()}</span>
                )}
              </div>
              <p className="text-gray-600 text-sm">{product.description}</p>
            </div>

            {/* Size Selection */}
            {sizes.length > 0 && (
              <div>
                <label className="block text-sm font-medium mb-2">Size</label>
                <div className="flex flex-wrap gap-2">
                  {sizes.map(size => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 border rounded-lg text-sm transition-all ${
                        selectedSize === size
                          ? 'bg-black text-white border-black'
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
                <label className="block text-sm font-medium mb-2">Color</label>
                <div className="flex flex-wrap gap-2">
                  {colors.map((color, idx) => {
                    const colorName = typeof color === 'string' ? color : color.name;
                    return (
                      <button
                        key={idx}
                        onClick={() => setSelectedColor(colorName)}
                        className={`px-4 py-2 border rounded-lg text-sm transition-all ${
                        selectedColor === colorName
                          ? 'bg-black text-white border-black'
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
            <div className="flex gap-3 pt-4">
              <button
                onClick={handleAddToCart}
                className="flex-1 flex items-center justify-center gap-2 bg-black text-white py-3 rounded-full font-bold hover:bg-gray-800 transition-colors"
              >
                <ShoppingBag size={18} />
                Add to Cart
              </button>
              <button className="p-3 border-2 rounded-full hover:border-black transition-colors">
                <Heart size={20} />
              </button>
            </div>

            {/* View Full Details Link */}
            <Link
              to={`/product/${product.id}`}
              onClick={onClose}
              className="block text-center text-sm text-gray-600 hover:text-black transition-colors"
            >
              View Full Details →
            </Link>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
