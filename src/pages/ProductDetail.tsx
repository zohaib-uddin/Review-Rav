import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { frontendToast } from '../utils/notifications';
import {
  Heart,
  ShoppingBag,
  Truck,
  Shield,
  RefreshCw,
  Star,
  Minus,
  Plus,
  ChevronDown,
  Check,
  Package,
  Ruler,
  Shirt,
  Zap,
  ArrowLeft,
  ArrowRight,
  Tag,
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { useCart } from '../context/CartContext';
import SizeGuideModal from '../components/products/SizeGuideModal';
import CareInstructions from '../components/products/CareInstructions';
import FAQAccordion from '../components/products/FAQAccordion';
import StickyAddToCart from '../components/products/StickyAddToCart';
import ProductCard from '../components/ProductCard';

export default function ProductDetail() {
  const { productSlug, id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { products, wishlist, toggleWishlist, reviews, fetchProducts, user } = useStore();
  const { addToCart: addToCartWithAnimation } = useCart();
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);
  const [expandedSpec, setExpandedSpec] = useState<string | null>('fabric');
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [singleProduct, setSingleProduct] = useState<any>(null);
  const [isFetchingSingle, setIsFetchingSingle] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  // Fetch individual product if not in list yet
  const targetIdentifier = productSlug || id;
  useEffect(() => {
    if (!targetIdentifier) return;
    const existing = products.find(
      (p) =>
        p.slug === targetIdentifier ||
        p.id === targetIdentifier ||
        p.slug?.toLowerCase() === targetIdentifier.toLowerCase()
    );
    if (existing) {
      setSingleProduct(existing);
      return;
    }

    setIsFetchingSingle(true);
    fetch(`/api/products/${encodeURIComponent(targetIdentifier)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setSingleProduct(data);
      })
      .catch((err) => console.error('Error fetching product:', err))
      .finally(() => setIsFetchingSingle(false));
  }, [targetIdentifier, products]);

  // Find product by slug or id, or from singleProduct
  const product =
    singleProduct ||
    products.find((p) =>
      productSlug
        ? p.slug === productSlug ||
          p.id === productSlug ||
          p.slug?.toLowerCase() === productSlug.toLowerCase()
        : p.id === id
    );

  const productReviews = reviews.filter(
    (r) => r.product_id === product?.id || r.product_slug === product?.slug
  );
  const relatedProducts = products
    .filter((p) => p.category === product?.category && p.id !== product?.id)
    .slice(0, 4);

  // Auto-select first size and color when product loads
  useEffect(() => {
    if (product && !selectedSize && product.sizes && product.sizes.length > 0) {
      setSelectedSize(product.sizes[0]);
    }
    if (product && !selectedColor && product.colors && product.colors.length > 0) {
      const firstColor = product.colors[0] as any;
      const colorName =
        typeof firstColor === 'string' ? firstColor : firstColor?.name || 'Black';
      setSelectedColor(colorName);
    }
  }, [product]);

  if (isFetchingSingle && !product) {
    return (
      <div className="min-h-screen max-w-[1700px] mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-8 animate-pulse">
          <div className="aspect-[3/4] bg-gray-200 rounded-xl" />
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4" />
            <div className="h-6 bg-gray-200 rounded w-1/3" />
            <div className="h-24 bg-gray-200 rounded w-full" />
            <div className="h-12 bg-gray-200 rounded w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center px-4">
          <h2 className="text-2xl font-black tracking-tight mb-2">Product Not Found</h2>
          <p className="text-gray-500 mb-6 text-sm">
            The drop you are looking for might be out of stock or relocated.
          </p>
          <Link
            to="/shop"
            className="inline-block bg-black text-white px-8 py-3 rounded-full text-xs uppercase tracking-widest font-bold hover:bg-zinc-800 transition-colors"
          >
            Explore All Drops
          </Link>
        </div>
      </div>
    );
  }

  // Synchronize price with size selection from variants_matrix or size_prices
  const getEffectivePrice = () => {
    if (!product) return 0;
    const matrix = product.variants_matrix || product.variants;
    if (Array.isArray(matrix)) {
      const matchedVariant = matrix.find(
        (v: any) =>
          v.size === selectedSize &&
          (!selectedColor || !v.color || v.color.toLowerCase() === selectedColor.toLowerCase())
      );
      if (matchedVariant && matchedVariant.price && Number(matchedVariant.price) > 0) {
        return Number(matchedVariant.price);
      }
      const matchedSizeOnly = matrix.find((v: any) => v.size === selectedSize);
      if (matchedSizeOnly && matchedSizeOnly.price && Number(matchedSizeOnly.price) > 0) {
        return Number(matchedSizeOnly.price);
      }
    }
    if (product.size_prices && selectedSize && product.size_prices[selectedSize]) {
      return Number(product.size_prices[selectedSize]);
    }
    return Number(product.base_price || product.price || 0);
  };

  const effectivePrice = getEffectivePrice();
  const comparePrice = product.compare_at_price ? Number(product.compare_at_price) : null;
  const isWishlisted = wishlist.includes(product.id);

  const features = [
    { icon: Truck, text: 'Free Shipping', sub: 'Above Rs.3,000' },
    { icon: Shield, text: 'Secure Pay', sub: '100% Protected' },
    { icon: RefreshCw, text: 'Easy Returns', sub: '7-Day Policy' },
  ];

  const handleAddToCart = (e?: React.MouseEvent) => {
    if (!selectedSize) return;
    const firstColor = product.colors?.[0] as any;
    const defaultColor =
      typeof firstColor === 'string' ? firstColor : firstColor?.name || 'Black';
    const triggerBtn =
      (e?.currentTarget as HTMLElement) ||
      (document.getElementById('main-atc-button') as HTMLElement);
    addToCartWithAnimation(
      { ...product, price: effectivePrice },
      selectedSize,
      selectedColor || defaultColor,
      quantity,
      triggerBtn
    );
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 3000);
  };

  const handleBuyNow = () => {
    if (!selectedSize) return;
    const firstColor = product.colors?.[0] as any;
    const defaultColor =
      typeof firstColor === 'string' ? firstColor : firstColor?.name || 'Black';
    addToCartWithAnimation(
      { ...product, price: effectivePrice },
      selectedSize,
      selectedColor || defaultColor,
      quantity
    );
    navigate('/checkout');
  };

  const toggleSpec = (spec: string) => {
    setExpandedSpec(expandedSpec === spec ? null : spec);
  };

  // Check if size guide is enabled (Only show if explicitly enabled by admin)
  const showSizeGuideButton = Boolean(
    product.size_guide_enabled === true ||
    (product.size_guide && product.size_guide.enabled === true)
  );

  const productImages =
    Array.isArray(product.images) && product.images.length > 0
      ? product.images
      : [product.image_url || product.image || 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=1000&fit=crop'];

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2 text-xs font-medium tracking-wide uppercase text-gray-500">
          <Link to="/" className="hover:text-black">
            Home
          </Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-black">
            Drops
          </Link>
          {product.category && (
            <>
              <span>/</span>
              <Link
                to={`/collections/${product.category_slug || product.category}`}
                className="hover:text-black"
              >
                {product.category}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="text-black font-semibold truncate max-w-[200px]">
            {product.name}
          </span>
        </div>
      </div>

      {/* Main Product Stage: Large Wide Container with Expanded Image Gallery */}
      <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Main Product Gallery - Expanded Width (7 cols on lg, 8 cols on xl) */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-7 xl:col-span-8 space-y-4"
          >
            {/* Big Main Image Container */}
            <div className="aspect-[3/4] sm:aspect-[4/5] lg:aspect-[3/4] w-full max-h-[820px] bg-neutral-100 relative group overflow-hidden border border-gray-200">
              <img
                src={productImages[activeImage]}
                alt={product.name}
                className="w-full h-full object-cover object-center"
              />

              {/* Navigation Arrows */}
              {productImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      setActiveImage(
                        (activeImage - 1 + productImages.length) % productImages.length
                      )
                    }
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-3 opacity-0 group-hover:opacity-100 transition-all hover:scale-110 bg-black/60 hover:bg-black text-white rounded-full cursor-pointer z-10"
                    aria-label="Previous image"
                  >
                    <ArrowLeft size={22} strokeWidth={2.5} />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setActiveImage((activeImage + 1) % productImages.length)
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-3 opacity-0 group-hover:opacity-100 transition-all hover:scale-110 bg-black/60 hover:bg-black text-white rounded-full cursor-pointer z-10"
                    aria-label="Next image"
                  >
                    <ArrowRight size={22} strokeWidth={2.5} />
                  </button>
                </>
              )}

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                {product.is_new_arrival && (
                  <span className="bg-black text-white text-[10px] font-bold tracking-wider uppercase px-3 py-1 block shadow-sm">
                    NEW ARRIVAL
                  </span>
                )}
                {product.is_best_seller && (
                  <span className="bg-black text-white text-[10px] font-bold tracking-wider uppercase px-3 py-1 block shadow-sm">
                    BEST SELLER
                  </span>
                )}
                {comparePrice && comparePrice > effectivePrice && (
                  <span className="bg-red-600 text-white text-[10px] font-bold tracking-wider uppercase px-3 py-1 block shadow-sm">
                    {Math.round(((comparePrice - effectivePrice) / comparePrice) * 100)}%
                    OFF
                  </span>
                )}
              </div>

              {/* Image Counter */}
              {productImages.length > 1 && (
                <div className="absolute bottom-4 right-4 bg-black/75 text-white text-[11px] font-semibold px-2.5 py-1 backdrop-blur-sm z-10">
                  {activeImage + 1} / {productImages.length}
                </div>
              )}
            </div>

            {/* Gallery Dots */}
            {productImages.length > 1 && (
              <div className="flex justify-center gap-2 pt-1">
                {productImages.map((_: any, i: number) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`transition-all duration-300 ${
                      activeImage === i
                        ? 'w-8 h-2 bg-black rounded-full'
                        : 'w-2 h-2 bg-gray-300 rounded-full hover:bg-gray-400'
                    }`}
                    aria-label={`View image ${i + 1}`}
                  />
                ))}
              </div>
            )}

            {/* Thumbnail Gallery */}
            {productImages.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 pt-1">
                {productImages.map((img: string, i: number) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActiveImage(i)}
                    className={`w-20 h-24 sm:w-24 sm:h-28 overflow-hidden border-2 transition-all flex-shrink-0 ${
                      activeImage === i
                        ? 'border-black shadow-md'
                        : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Product Info - Right Column (5 cols on lg, 4 cols on xl) */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-5 xl:col-span-4"
          >
            <div>
              <span className="text-xs font-bold tracking-[0.25em] uppercase text-gray-400 block mb-1">
                RAVENZA
              </span>
              <h1 className="text-2xl md:text-3xl font-display font-bold tracking-tight text-black">
                {product.name}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-3 mt-3">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={15}
                      className={
                        i < 4 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                      }
                    />
                  ))}
                </div>
                <span className="text-xs text-gray-500 font-medium">
                  ({productReviews.length || 12} reviews)
                </span>
              </div>

              {/* Dynamic Price Display with Continuous Loop Zoom-In / Zoom-Out Animation */}
              <div className="flex items-baseline gap-3 mt-4">
                <motion.span
                  animate={{ scale: [1, 1.07, 1] }}
                  transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
                  className="inline-block text-3xl sm:text-4xl font-extrabold text-black tracking-tight"
                >
                  Rs. {effectivePrice.toLocaleString()}
                </motion.span>
                {comparePrice && comparePrice > effectivePrice && (
                  <>
                    <span className="text-lg text-gray-400 line-through font-mono">
                      Rs. {comparePrice.toLocaleString()}
                    </span>
                    <span className="bg-red-50 text-red-600 text-xs font-bold px-2 py-0.5 border border-red-200">
                      SAVE Rs. {(comparePrice - effectivePrice).toLocaleString()}
                    </span>
                  </>
                )}
              </div>

              <p className="text-sm text-gray-600 mt-4 leading-relaxed">
                {product.description}
              </p>

              {/* Color Selection */}
              {product.colors && product.colors.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-black mb-3">
                    COLOR:{' '}
                    <span className="font-normal text-gray-600">
                      {selectedColor ||
                        (typeof product.colors?.[0] === 'string'
                          ? product.colors[0]
                          : (product.colors?.[0] as any)?.name)}
                    </span>
                  </h4>
                  <div className="flex gap-2.5 flex-wrap">
                    {product.colors.map((color: any, idx: number) => {
                      const colorName = typeof color === 'string' ? color : color.name;
                      const colorHex = typeof color === 'string' ? undefined : color.hex;
                      const isSelected = selectedColor === colorName;

                      const colorMap: Record<string, string> = {
                        Black: '#000000',
                        White: '#FFFFFF',
                        Red: '#EF4444',
                        Blue: '#3B82F6',
                        Green: '#10B981',
                        Yellow: '#F59E0B',
                        Grey: '#6B7280',
                        Charcoal: '#374151',
                      };
                      const hexColor = colorHex || colorMap[colorName] || '#000000';

                      return (
                        <button
                          type="button"
                          key={idx}
                          onClick={() => setSelectedColor(colorName)}
                          className={`relative w-9 h-9 rounded-full border-2 transition-all ${
                            isSelected
                              ? 'border-black ring-2 ring-black/20'
                              : 'border-gray-300'
                          }`}
                          style={{ backgroundColor: hexColor }}
                          title={colorName}
                        >
                          {isSelected && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Check
                                size={14}
                                className={
                                  hexColor === '#FFFFFF' ? 'text-black' : 'text-white'
                                }
                                strokeWidth={3}
                              />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Size Selection with Dynamic Price Sync */}
              <div className="mt-6">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-black">
                    SELECT SIZE
                  </h4>
                  {showSizeGuideButton && (
                    <button
                      type="button"
                      onClick={() => setShowSizeGuide(true)}
                      className="text-xs font-semibold text-black underline hover:text-gray-600 flex items-center gap-1 cursor-pointer"
                    >
                      <Ruler size={13} />
                      <span>Size Guide</span>
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes?.map((size: string) => (
                    <button
                      type="button"
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-12 h-11 px-3 border-2 text-xs font-bold tracking-wider transition-all ${
                        selectedSize === size
                          ? 'border-black bg-black text-white shadow-sm'
                          : 'border-gray-200 bg-white text-black hover:border-black'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
                {!selectedSize && (
                  <p className="text-xs text-red-500 mt-2 font-medium">
                    ⚠️ Please select a size
                  </p>
                )}
              </div>

              {/* Quantity Selector */}
              <div className="mt-6">
                <h4 className="font-bold text-xs uppercase tracking-wider text-black mb-3">
                  QUANTITY
                </h4>
                <div className="flex items-center border border-gray-300 w-fit">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 hover:bg-gray-100 transition-colors"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="px-5 font-bold text-sm">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-3 hover:bg-gray-100 transition-colors"
                  >
                    <Plus size={14} />
                  </button>
                </div>
                <p className="text-xs text-green-700 mt-2 font-medium">
                  ✓ In Stock ready for immediate dispatch
                </p>
              </div>

              {/* Action Buttons: Add to Bag & Buy Now (Pure Solid Black Buttons, NO Gradients) */}
              <div id="main-atc-button" className="flex flex-col sm:flex-row gap-3 mt-8">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAddToCart}
                  disabled={!selectedSize}
                  className={`flex-1 flex items-center justify-center gap-2 py-3.5 font-bold text-xs uppercase tracking-[0.15em] transition-all ${
                    addedToCart
                      ? 'bg-green-600 text-white'
                      : selectedSize
                      ? 'bg-black text-white hover:bg-neutral-800 shadow-sm'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {addedToCart ? (
                    <>
                      <Check size={16} /> ADDED TO BAG ✓
                    </>
                  ) : (
                    <>
                      <ShoppingBag size={16} /> ADD TO BAG
                    </>
                  )}
                </motion.button>

                {/* BUY NOW: Directly navigates to checkout */}
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handleBuyNow}
                  disabled={!selectedSize}
                  className={`flex-1 flex items-center justify-center gap-2 py-3.5 font-bold text-xs uppercase tracking-[0.15em] transition-all ${
                    selectedSize
                      ? 'bg-black text-white border border-black hover:bg-neutral-900 shadow-sm'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <Zap size={16} /> BUY NOW
                </motion.button>

                <button
                  type="button"
                  onClick={() => {
                    if (!user) {
                      toast.error('Please sign in to add items to your wishlist.');
                      navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`);
                      return;
                    }
                    toggleWishlist(product.id);
                    if (!isWishlisted) {
                      frontendToast.addToWishlist(product.name);
                    } else {
                      frontendToast.removeFromWishlist(product.name);
                    }
                  }}
                  className={`p-3.5 border transition-all flex items-center justify-center ${
                    isWishlisted
                      ? 'border-red-500 text-red-500 bg-red-50'
                      : 'border-gray-200 text-black hover:border-black'
                  }`}
                  aria-label="Wishlist"
                >
                  <Heart size={18} className={isWishlisted ? 'fill-current' : ''} />
                </button>
              </div>

              {/* Trust Badges: Free Shipping, Secure Pay, Easy Returns */}
              <div className="mt-8 grid grid-cols-3 gap-2 border-y border-gray-100 py-4">
                {features.map((f, i) => (
                  <div key={i} className="text-center p-2">
                    <f.icon size={16} className="mx-auto mb-1 text-black" />
                    <span className="text-[11px] font-bold text-black block">{f.text}</span>
                    <span className="text-[10px] text-gray-400">{f.sub}</span>
                  </div>
                ))}
              </div>

              {/* REORDERED: Customer Reviews section RIGHT AFTER Trust Badges and BEFORE Specifications */}
              <div className="mt-6 border-b border-gray-200 pb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-sm uppercase tracking-wider text-black">
                    Customer Reviews ({productReviews.length || 0})
                  </h3>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        className="fill-yellow-400 text-yellow-400"
                      />
                    ))}
                    <span className="text-xs font-bold text-black ml-1.5">5.0</span>
                  </div>
                </div>

                <div className="space-y-3">
                  {productReviews.length > 0 ? (
                    productReviews.slice(0, 3).map((rev) => (
                      <div
                        key={rev.id}
                        className="p-3.5 bg-gray-50 border border-gray-100 text-xs rounded-sm"
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-bold text-black">{rev.user_name}</span>
                          <span className="text-gray-400 text-[10px]">
                            {rev.created_at?.slice(0, 10)}
                          </span>
                        </div>
                        <p className="text-gray-600 leading-relaxed">{rev.comment}</p>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 bg-gray-50 text-xs text-gray-500 text-center rounded-sm">
                      Verified customer reviews for this drop are being processed.
                    </div>
                  )}
                </div>
              </div>

              {/* Detailed Product Specifications from Admin Panel */}
              <div className="mt-6 space-y-4">
                <h3 className="font-bold text-sm uppercase tracking-wider text-black">
                  Product Specifications & Details
                </h3>

                {/* Fabric & Composition */}
                <div className="border border-gray-200 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => toggleSpec('fabric')}
                    className="w-full flex items-center justify-between p-3.5 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <Shirt size={16} className="text-black" />
                      <span className="text-xs font-bold uppercase tracking-wider text-black">
                        Fabric & Composition
                      </span>
                    </div>
                    <ChevronDown
                      size={16}
                      className={`transition-transform text-black ${
                        expandedSpec === 'fabric' ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  <AnimatePresence>
                    {expandedSpec === 'fabric' && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 space-y-2 text-xs text-gray-600 border-t border-gray-100 pt-3">
                          <div className="flex justify-between">
                            <span className="text-gray-500">Material:</span>
                            <span className="font-semibold text-black">
                              {product.fabric_composition ||
                                product.fabric ||
                                '100% Super-combed Heavyweight Cotton'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">GSM / Weight:</span>
                            <span className="font-semibold text-black">
                              {product.garment_specs ||
                                product.gsm ||
                                '240 GSM Pre-shrunk French Terry'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Finish:</span>
                            <span className="font-semibold text-black">
                              {product.fabric_finish || 'Silicon washed bio-polish'}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Fit & Sizing Details */}
                <div className="border border-gray-200 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => toggleSpec('fit')}
                    className="w-full flex items-center justify-between p-3.5 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <Ruler size={16} className="text-black" />
                      <span className="text-xs font-bold uppercase tracking-wider text-black">
                        Fit & Silhouette
                      </span>
                    </div>
                    <ChevronDown
                      size={16}
                      className={`transition-transform text-black ${
                        expandedSpec === 'fit' ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  <AnimatePresence>
                    {expandedSpec === 'fit' && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 space-y-2 text-xs text-gray-600 border-t border-gray-100 pt-3">
                          <div className="flex justify-between">
                            <span className="text-gray-500">Silhouette:</span>
                            <span className="font-semibold text-black">
                              {product.fit || 'Drop-shoulder relaxed streetwear cut'}
                            </span>
                          </div>
                          {product.model_size && (
                            <div className="flex justify-between">
                              <span className="text-gray-500">Model Wearing:</span>
                              <span className="font-semibold text-black">
                                {product.model_size}
                              </span>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span className="text-gray-500">Available Sizes:</span>
                            <span className="font-semibold text-black">
                              {product.sizes?.join(', ') || 'S, M, L, XL'}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Tags & Badges */}
                {((Array.isArray(product.tags) && product.tags.length > 0) ||
                  product.tag) && (
                  <div className="border border-gray-200 overflow-hidden">
                    <button
                      type="button"
                      onClick={() => toggleSpec('tags')}
                      className="w-full flex items-center justify-between p-3.5 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <Tag size={16} className="text-black" />
                        <span className="text-xs font-bold uppercase tracking-wider text-black">
                          Tags & Drop Categories
                        </span>
                      </div>
                      <ChevronDown
                        size={16}
                        className={`transition-transform text-black ${
                          expandedSpec === 'tags' ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    <AnimatePresence>
                      {expandedSpec === 'tags' && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-4 flex flex-wrap gap-2 border-t border-gray-100 pt-3">
                            {Array.isArray(product.tags) ? (
                              product.tags.map((t: string, idx: number) => (
                                <span
                                  key={idx}
                                  className="px-2.5 py-1 bg-gray-100 text-black text-[11px] font-bold uppercase tracking-wider border border-gray-200"
                                >
                                  #{t}
                                </span>
                              ))
                            ) : (
                              <span className="px-2.5 py-1 bg-gray-100 text-black text-[11px] font-bold uppercase tracking-wider border border-gray-200">
                                #{product.tag}
                              </span>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* Shipping & Delivery */}
                <div className="border border-gray-200 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => toggleSpec('shipping')}
                    className="w-full flex items-center justify-between p-3.5 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <Package size={16} className="text-black" />
                      <span className="text-xs font-bold uppercase tracking-wider text-black">
                        Shipping & Returns
                      </span>
                    </div>
                    <ChevronDown
                      size={16}
                      className={`transition-transform text-black ${
                        expandedSpec === 'shipping' ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  <AnimatePresence>
                    {expandedSpec === 'shipping' && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 text-xs text-gray-600 border-t border-gray-100 pt-3 space-y-1">
                          <p>
                            {product.shipping_delivery ||
                              'Dispatch within 24 hours. Delivery in 3-5 business days across Pakistan via express courier.'}
                          </p>
                          <p className="text-gray-500">
                            7-day hassle-free exchange on unworn garments with tags attached.
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Care Instructions */}
                <div className="border-t border-gray-200 pt-4">
                  <CareInstructions
                    careInstructions={
                      product.care_instructions ||
                      'Machine wash cold with like colors. Do not bleach. Tumble dry low. Iron inside out.'
                    }
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* You May Also Like Section */}
        {relatedProducts.length > 0 && (
          <div className="mt-20 border-t border-gray-200 pt-16">
            <div className="text-center mb-10">
              <p className="text-xs font-bold tracking-[0.25em] uppercase text-gray-400 mb-2">
                COMPLETE YOUR LOOK
              </p>
              <h3 className="text-2xl md:text-3xl font-display font-bold uppercase tracking-tight text-black">
                You May Also Like
              </h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {relatedProducts.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </div>
        )}

        {/* Frequently Asked Questions: Moved to the very end of the page, centered, and wide as requested */}
        <div className="mt-20 max-w-4xl mx-auto border-t border-gray-200 pt-16 pb-12">
          <div className="text-center mb-8">
            <p className="text-xs font-bold tracking-[0.25em] uppercase text-gray-400 mb-2">
              FREQUENTLY ASKED QUESTIONS
            </p>
            <h3 className="text-2xl md:text-3xl font-display font-bold uppercase tracking-tight text-black">
              Questions About This Drop?
            </h3>
          </div>
          <FAQAccordion faqs={product.faq} />
        </div>
      </div>

      {/* Sticky Add to Cart Bar (Only Add to Cart button shown) */}
      <StickyAddToCart
        product={{
          id: product.id,
          name: product.name,
          image_url: productImages[0],
          base_price: effectivePrice,
          compare_at_price: comparePrice,
        }}
        selectedSize={selectedSize}
        onSelectSize={setSelectedSize}
        availableSizes={
          product.sizes && product.sizes.length > 0
            ? product.sizes
            : ['S', 'M', 'L', 'XL']
        }
        currentPrice={effectivePrice}
        comparePrice={comparePrice}
        onAddToCart={() => handleAddToCart()}
        onBuyNow={() => handleBuyNow()}
      />

      {/* Size Guide Modal with dynamic sizing and measurements */}
      {showSizeGuideButton && (
        <SizeGuideModal
          isOpen={showSizeGuide}
          onClose={() => setShowSizeGuide(false)}
          product={product}
        />
      )}
    </div>
  );
}
