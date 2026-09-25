import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, ChevronLeft, ChevronRight, Zap, Check, Eye } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Product } from '../../store/useStore';
import { useCart } from '../../context/CartContext';
import { resolveColorHex } from '../../utils/colorUtils';

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

  // Extract all available images
  const images: string[] = (
    Array.isArray(product.images) && product.images.length > 0
      ? product.images
      : [product.image_url || product.image || 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&h=1000&fit=crop']
  ).filter(Boolean);

  const sizes = product.sizes || product.attributes?.sizes || ['S', 'M', 'L', 'XL'];
  const colors = product.colors || product.attributes?.colors || ['Black'];

  const nextImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentImage((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentImage((prev) => (prev - 1 + images.length) % images.length);
  };

  // Price calculations
  const actualPrice = Number(product.base_price || product.price || 0);
  const rawCompare =
    product.compare_at_price ??
    (product as any).compare_price ??
    (product as any).comparePrice ??
    ((product.salePrice && product.salePrice > actualPrice) ? product.salePrice : null);
  
  const comparePrice = rawCompare && Number(rawCompare) > actualPrice ? Number(rawCompare) : null;
  const hasSavings = comparePrice !== null && comparePrice > actualPrice;
  const savingsAmount = hasSavings ? comparePrice - actualPrice : 0;
  const savingsPercent = hasSavings ? Math.round((savingsAmount / comparePrice) * 100) : 0;

  const currentActiveColor =
    selectedColor ||
    (typeof colors[0] === 'string' ? colors[0] : (colors[0] as any)?.name) ||
    'Black';

  const handleAddToCart = (e: React.MouseEvent) => {
    const sizeToUse = selectedSize || sizes[0] || 'M';
    addToCart(product, sizeToUse, currentActiveColor, 1, e.currentTarget as HTMLElement);
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      onClose();
    }, 1200);
  };

  const handleBuyNow = () => {
    const sizeToUse = selectedSize || sizes[0] || 'M';
    const buyNowItem = {
      product: { ...product, price: actualPrice },
      quantity: 1,
      size: sizeToUse,
      color: currentActiveColor,
    };
    try {
      sessionStorage.setItem('ravenza_buy_now_item', JSON.stringify(buyNowItem));
    } catch {}
    onClose();
    navigate('/checkout', { state: { buyNowItem } });
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.94, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.94, opacity: 0, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-white rounded-2xl max-w-5xl w-full max-h-[92vh] overflow-hidden shadow-2xl flex flex-col my-auto border border-neutral-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Bar Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-neutral-50/50">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
              <span className="text-[11px] font-black uppercase tracking-[0.2em] text-neutral-800">
                QUICK VIEW DROP
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-neutral-500 hover:text-black hover:bg-neutral-200/60 rounded-full transition-all cursor-pointer"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          </div>

          {/* Modal Body - 2 Columns (Image Gallery + Details) */}
          <div className="grid md:grid-cols-12 gap-6 p-6 sm:p-8 overflow-y-auto max-h-[calc(92vh-75px)]">
            
            {/* Left Column: Main Image & Gallery Previews (7 cols on desktop for generous view) */}
            <div className="md:col-span-7 flex flex-col space-y-4">
              {/* Main Image Frame - Natural Aspect Ratio Fit */}
              <div className="relative w-full aspect-[3/4] sm:aspect-[4/5] bg-neutral-100 rounded-2xl overflow-hidden border border-neutral-200/80 flex items-center justify-center group/img">
                <img
                  src={images[currentImage] || images[0]}
                  alt={product.name}
                  className="w-full h-full object-contain object-center transition-all duration-300"
                />

                {/* Left & Right Navigation Arrows (No background, pure icons with light subtle shadow) */}
                {images.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={prevImage}
                      aria-label="Previous image"
                      className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-transparent border-0 text-black hover:text-neutral-700 transition-all hover:scale-125 cursor-pointer z-10 drop-shadow-[0_2px_8px_rgba(0,0,0,0.45)]"
                    >
                      <ChevronLeft size={36} strokeWidth={2.6} />
                    </button>
                    <button
                      type="button"
                      onClick={nextImage}
                      aria-label="Next image"
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-transparent border-0 text-black hover:text-neutral-700 transition-all hover:scale-125 cursor-pointer z-10 drop-shadow-[0_2px_8px_rgba(0,0,0,0.45)]"
                    >
                      <ChevronRight size={36} strokeWidth={2.6} />
                    </button>
                  </>
                )}

                {/* Savings Pill Tag on Top Left of Image */}
                {hasSavings && (
                  <div className="absolute top-3 left-3 z-10">
                    <span className="bg-red-600 text-white text-[10px] font-black uppercase px-2.5 py-1 tracking-wider shadow-md rounded-xs">
                      SAVE {savingsPercent}%
                    </span>
                  </div>
                )}
              </div>

              {/* Gallery Thumbnails Strip Preview with Main Image */}
              {images.length > 1 && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                      Product Gallery ({images.length} views)
                    </span>
                    <span className="text-[10px] font-mono text-neutral-400">
                      {currentImage + 1} / {images.length}
                    </span>
                  </div>
                  <div className="flex gap-2.5 overflow-x-auto pb-2 pt-0.5 scrollbar-thin">
                    {images.map((img, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setCurrentImage(i)}
                        className={`relative w-16 h-20 sm:w-20 sm:h-24 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all cursor-pointer bg-neutral-50 ${
                          i === currentImage
                            ? 'border-black ring-2 ring-black/20 shadow-md scale-102'
                            : 'border-transparent opacity-60 hover:opacity-100 hover:border-neutral-300'
                        }`}
                      >
                        <img
                          src={img}
                          alt={`${product.name} view ${i + 1}`}
                          className="w-full h-full object-contain p-1"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Product Details & Controls (5 cols on desktop) */}
            <div className="md:col-span-5 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                {/* Brand & Badge */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-[0.25em] text-neutral-400">
                    {product.brand || 'RAVENZA STREETWEAR'}
                  </span>
                  {product.sku && (
                    <span className="text-[10px] font-mono text-neutral-400 tracking-wider">
                      SKU: {product.sku}
                    </span>
                  )}
                </div>

                {/* Product Title */}
                <h3 className="text-xl sm:text-2xl font-display font-black text-black tracking-tight leading-tight">
                  {product.name}
                </h3>

                {/* Pricing & Accurate Savings Tag */}
                <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-100 space-y-1.5">
                  <div className="flex items-baseline gap-3 flex-wrap">
                    <span className="text-2xl sm:text-3xl font-extrabold text-black font-sans">
                      Rs. {actualPrice.toLocaleString()}
                    </span>
                    {hasSavings && (
                      <span className="text-base text-neutral-400 line-through font-mono">
                        Rs. {comparePrice.toLocaleString()}
                      </span>
                    )}
                  </div>
                  {hasSavings && (
                    <div className="flex items-center gap-2 pt-1">
                      <span className="inline-block bg-red-600 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-xs tracking-wider shadow-xs">
                        SAVE Rs. {savingsAmount.toLocaleString()} ({savingsPercent}% OFF)
                      </span>
                      <span className="text-[11px] font-medium text-emerald-600">
                        Special discounted price applied
                      </span>
                    </div>
                  )}
                </div>

                {/* Description */}
                {product.description && (
                  <p className="text-xs text-neutral-600 leading-relaxed line-clamp-3">
                    {product.description}
                  </p>
                )}

                {/* Color Selection - Round Swatch Circle with Color + Admin Color Name */}
                {colors.length > 0 && (
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold uppercase tracking-wider text-black">
                        Color:{' '}
                        <span className="font-black text-red-600 uppercase">
                          {currentActiveColor}
                        </span>
                      </label>
                      <span className="text-[10px] text-neutral-400 uppercase">
                        {colors.length} {colors.length === 1 ? 'option' : 'options'}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2.5">
                      {colors.map((colorItem: any, idx: number) => {
                        const colorName =
                          typeof colorItem === 'string' ? colorItem : colorItem?.name || 'Color';
                        const hexCode = resolveColorHex(colorName, product.attributes);
                        const isSelected = currentActiveColor.toLowerCase() === colorName.toLowerCase();

                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setSelectedColor(colorName)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-black text-white border-black shadow-md ring-2 ring-black/20'
                                : 'bg-white text-neutral-800 border-neutral-200 hover:border-black'
                            }`}
                          >
                            {/* Color Circle Swatch */}
                            <span
                              className="w-4 h-4 rounded-full border border-neutral-300 shadow-xs flex-shrink-0"
                              style={{ backgroundColor: hexCode }}
                            />
                            <span>{colorName}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Size Selection */}
                {sizes.length > 0 && (
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold uppercase tracking-wider text-black">
                        Select Size:{' '}
                        <span className="font-black text-black">
                          {selectedSize || sizes[0] || 'M'}
                        </span>
                      </label>
                      <Link
                        to={`/products/${product.slug || product.id}`}
                        onClick={onClose}
                        className="text-[11px] text-neutral-500 hover:text-black underline uppercase tracking-wider font-semibold"
                      >
                        Size Guide
                      </Link>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {sizes.map((size: string) => {
                        const isSelected = (selectedSize || sizes[0] || 'M') === size;
                        return (
                          <button
                            key={size}
                            type="button"
                            onClick={() => setSelectedSize(size)}
                            className={`min-w-[44px] px-3.5 py-2 border text-xs font-bold rounded-lg transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-black text-white border-black shadow-sm'
                                : 'bg-white text-neutral-800 border-neutral-200 hover:border-black'
                            }`}
                          >
                            {size}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons & Link */}
              <div className="pt-4 space-y-3 border-t border-neutral-100">
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    className="flex-1 flex items-center justify-center gap-2 bg-black text-white py-3.5 px-5 rounded-xl text-xs font-bold uppercase tracking-[0.15em] hover:bg-neutral-800 transition-all shadow-md hover:shadow-lg cursor-pointer active:scale-98"
                  >
                    {added ? <Check size={16} /> : <ShoppingBag size={16} />}
                    {added ? 'Added to Bag ✓' : 'Add to Bag'}
                  </button>

                  <button
                    type="button"
                    onClick={handleBuyNow}
                    className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white py-3.5 px-5 rounded-xl text-xs font-bold uppercase tracking-[0.15em] hover:bg-red-700 transition-all shadow-md hover:shadow-lg cursor-pointer active:scale-98"
                  >
                    <Zap size={16} /> Instant Checkout
                  </button>
                </div>

                {/* View Full Product Details */}
                <div className="text-center pt-1">
                  <Link
                    to={`/products/${product.slug || product.id}`}
                    onClick={onClose}
                    className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-neutral-800 hover:text-black underline underline-offset-4 transition-colors"
                  >
                    <span>View Full Product Specifications & Sizing</span>
                    <span>→</span>
                  </Link>
                </div>
              </div>

            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
