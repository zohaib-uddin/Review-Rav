import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ShoppingBag, Truck, Shield, RefreshCw, Star, ChevronRight, Minus, Plus, ChevronDown, ChevronLeft, Check, Package, Ruler, Shirt, Scissors, Zap, ArrowLeft, ArrowRight } from 'lucide-react';
import { useStore } from '../store/useStore';
import SizeGuideModal from '../components/products/SizeGuideModal';
import CareInstructions from '../components/products/CareInstructions';
import FAQAccordion from '../components/products/FAQAccordion';
import StickyAddToCart from '../components/products/StickyAddToCart';
import ProductCard from '../components/ProductCard';

export default function ProductDetail() {
  const { productSlug, id } = useParams();
  const navigate = useNavigate();
  const { products, addToCart, wishlist, toggleWishlist, reviews, fetchProducts } = useStore();
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);
  const [expandedSpec, setExpandedSpec] = useState<string | null>('fabric');
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const specsSectionRef = useRef<HTMLDivElement>(null);
  const [stickyTop, setStickyTop] = useState(96);
  
  useEffect(() => {
    fetchProducts();
  }, []);

  // Calculate sticky top offset based on navbar height
  useEffect(() => {
    const navbar = document.querySelector('nav');
    if (navbar) {
      setStickyTop(navbar.offsetHeight + 24);
    }
  }, []);

  // Find product by slug (new) or by id (legacy)
  const product = products.find(p => 
    productSlug ? p.slug === productSlug : p.id === id
  );
  const productReviews = reviews.filter(r => r.product_id === product?.id);
  const relatedProducts = products.filter(p => p.category === product?.category && p.id !== product?.id).slice(0, 4);

  // Auto-select first size and color when product loads
  useEffect(() => {
    if (product && !selectedSize && product.sizes && product.sizes.length > 0) {
      setSelectedSize(product.sizes[0]);
    }
    if (product && !selectedColor && product.colors && product.colors.length > 0) {
      const firstColor = product.colors[0] as any;
      const colorName = typeof firstColor === 'string' ? firstColor : firstColor?.name || 'Black';
      setSelectedColor(colorName);
    }
  }, [product]);

  if (!product) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Product Not Found</h2>
        <Link to="/shop" className="text-purple-600 hover:underline">Back to Shop</Link>
      </div>
    </div>
  );

  const isWishlisted = wishlist.includes(product.id);
  
  const features = [
    { icon: Truck, text: 'Free Shipping', sub: 'Above Rs.3,000' },
    { icon: Shield, text: 'Secure Pay', sub: '100% Protected' },
    { icon: RefreshCw, text: 'Easy Returns', sub: '7-Day Policy' },
  ];
  
  const handleAddToCart = () => {
    if (!selectedSize) return;
    const firstColor = product.colors?.[0] as any;
    const defaultColor = typeof firstColor === 'string' ? firstColor : firstColor?.name || 'Black';
    for (let i = 0; i < quantity; i++) {
      addToCart(product, selectedSize, selectedColor || defaultColor);
    }
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 3000);
  };

  const handleBuyNow = () => {
    if (!selectedSize) return;
    const firstColor = product.colors?.[0] as any;
    const defaultColor = typeof firstColor === 'string' ? firstColor : firstColor?.name || 'Black';
    for (let i = 0; i < quantity; i++) {
      addToCart(product, selectedSize, selectedColor || defaultColor);
    }
    navigate('/checkout');
  };

  const toggleSpec = (spec: string) => {
    setExpandedSpec(expandedSpec === spec ? null : spec);
  };

  // Check if size guide should be shown
  const showSizeGuideButton = product.size_guide || true; // Always show if no explicit false
  
  // Get rich HTML specs or fallback to default specs
  const richSpecs = product.specs;

  return (
    <div className="min-h-screen">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Link to="/" className="hover:text-black">Home</Link>
          <ChevronRight size={14} />
          <Link to="/shop" className="hover:text-black">Shop</Link>
          <ChevronRight size={14} />
          <Link to={`/collections/${product.category}`} className="hover:text-black capitalize">
            {product.category?.replace('-', ' ')}
          </Link>
          <ChevronRight size={14} />
          <span className="text-black">{product.name}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-16">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16">
          {/* Sticky Image Gallery - Left Column */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }} 
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
            style={{ position: 'sticky', top: stickyTop, height: 'fit-content' }}
          >
            {/* Main Image with Navigation Arrows */}
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-gray-100 group">
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeImage}
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  src={product.images?.[activeImage] || product.image_url || product.image} 
                  alt={product.name} 
                  className="w-full h-full object-cover"
                />
              </AnimatePresence>
              
              {/* Navigation Arrows - Thin, no background */}
              {product.images && product.images.length > 1 && (
                <>
                  <button 
                    onClick={() => setActiveImage((activeImage - 1 + product.images.length) % product.images.length)} 
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-2 opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                  >
                    <ArrowLeft size={28} className="text-white drop-shadow-lg" />
                  </button>
                  <button 
                    onClick={() => setActiveImage((activeImage + 1) % product.images.length)} 
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                  >
                    <ArrowRight size={28} className="text-white drop-shadow-lg" />
                  </button>
                </>
              )}
              
              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.is_new_arrival && (
                  <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', damping: 15 }}
                    className="bg-black text-white text-xs font-bold px-3 py-1.5 rounded-full"
                  >
                    NEW
                  </motion.span>
                )}
                {product.is_best_seller && (
                  <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', damping: 15, delay: 0.1 }}
                    className="bg-amber-500 text-white text-xs font-bold px-3 py-1.5 rounded-full"
                  >
                    BESTSELLER
                  </motion.span>
                )}
                {product.salePrice && (
                  <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', damping: 15, delay: 0.2 }}
                    className="bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full"
                  >
                    {Math.round((1 - product.salePrice / (product.base_price || 1)) * 100)}% OFF
                  </motion.span>
                )}
              </div>
              
              {/* Image Counter */}
              {product.images && product.images.length > 1 && (
                <div className="absolute bottom-20 right-4 bg-black/70 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm">
                  {activeImage + 1} / {product.images.length}
                </div>
              )}
            </div>
            
            {/* Gallery Dots - Clickable Pagination */}
            {product.images && product.images.length > 1 && (
              <div className="flex justify-center gap-2">
                {product.images.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`transition-all duration-300 ${
                      activeImage === i 
                        ? 'w-3 h-3 bg-black rounded-full' 
                        : 'w-2 h-2 bg-gray-300 rounded-full hover:bg-gray-400'
                    }`}
                    aria-label={`View image ${i + 1}`}
                  />
                ))}
              </div>
            )}
            
            {/* Thumbnail Gallery */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {product.images.map((img, i) => (
                  <motion.button 
                    key={i}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveImage(i)} 
                    className={`w-20 h-24 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                      activeImage === i ? 'border-black shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </motion.button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Product Info */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="sticky top-24">
              <h1 className="text-2xl md:text-3xl font-bold">{product.name}</h1>
              
              {/* Rating */}
              <div className="flex items-center gap-3 mt-3">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} className={i < 4 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'} />
                  ))}
                </div>
                <span className="text-sm text-gray-500">({productReviews.length} reviews)</span>
              </div>

              {/* Price */}
              <div className="flex items-center gap-3 mt-4">
                {product.salePrice ? (
                  <>
                    <span className="text-3xl font-bold">Rs.{product.salePrice.toLocaleString()}</span>
                    <span className="text-lg text-gray-400 line-through">Rs.{product.price?.toLocaleString()}</span>
                    <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded">
                      SAVE Rs.{(product.price! - product.salePrice).toLocaleString()}
                    </span>
                  </>
                ) : (
                  <span className="text-3xl font-bold">Rs.{product.price?.toLocaleString()}</span>
                )}
              </div>

              <p className="text-gray-600 mt-4 leading-relaxed">{product.description}</p>

              {/* Color Selection - Circular Swatches */}
              <div className="mt-6">
                <h4 className="font-bold text-sm mb-3">
                  COLOR: <span className="font-normal text-gray-600">
                    {selectedColor || (typeof product.colors?.[0] === 'string' ? product.colors[0] : (product.colors?.[0] as any)?.name)}
                  </span>
                </h4>
                <div className="flex gap-3 flex-wrap">
                  {product.colors?.map((color: any, idx: number) => {
                    const colorName = typeof color === 'string' ? color : color.name;
                    const colorHex = typeof color === 'string' ? undefined : color.hex;
                    const isSelected = selectedColor === colorName;
                    
                    // Map color names to hex codes (fallback if no hex provided)
                    const colorMap: Record<string, string> = {
                      'Black': '#000000',
                      'White': '#FFFFFF',
                      'Red': '#EF4444',
                      'Blue': '#3B82F6',
                      'Green': '#10B981',
                      'Yellow': '#F59E0B',
                      'Purple': '#8B5CF6',
                      'Pink': '#EC4899',
                      'Orange': '#F97316',
                      'Grey': '#6B7280',
                      'Gray': '#6B7280',
                      'Navy': '#1E3A8A',
                      'Brown': '#92400E',
                      'Beige': '#D4C5B9',
                      'Charcoal': '#374151',
                    };
                    const hexColor = colorHex || colorMap[colorName] || '#CCCCCC';
                    
                    return (
                      <button
                        key={idx}
                        onClick={() => setSelectedColor(colorName)}
                        className={`relative w-12 h-12 rounded-full border-2 transition-all hover:scale-110 ${
                          isSelected ? 'border-black scale-110' : 'border-gray-300'
                        }`}
                        style={{ backgroundColor: hexColor }}
                        title={colorName}
                      >
                        {isSelected && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Check 
                              size={20} 
                              className={hexColor === '#FFFFFF' || hexColor === '#F5F5DC' || hexColor === '#F59E0B' ? 'text-black' : 'text-white'}
                              strokeWidth={3}
                            />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Size Selection */}
              <div className="mt-6">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-bold text-sm">SIZE</h4>
                  <button 
                    onClick={() => setShowSizeGuide(true)}
                    className="text-xs text-gray-500 underline hover:text-black"
                  >
                    Size Guide
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes?.map(size => (
                    <button 
                      key={size} 
                      onClick={() => setSelectedSize(size)} 
                      className={`w-12 h-12 border-2 rounded-xl text-sm font-medium transition-all ${
                        selectedSize === size 
                          ? 'border-black bg-black text-white' 
                          : 'border-gray-200 hover:border-black'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
                {!selectedSize && <p className="text-xs text-red-500 mt-2">⚠️ Please select a size</p>}
              </div>

              {/* Quantity */}
              <div className="mt-6">
                <h4 className="font-bold text-sm mb-3">QUANTITY</h4>
                <div className="flex items-center border-2 rounded-xl w-fit">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-3 hover:bg-gray-50 transition-colors">
                    <Minus size={16} />
                  </button>
                  <span className="px-6 font-bold">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="p-3 hover:bg-gray-50 transition-colors">
                    <Plus size={16} />
                  </button>
                </div>
                <p className="text-xs text-green-600 mt-2">✓ In Stock ({product.stockCount || 50} available)</p>
              </div>

              {// Action Buttons - Main ATC Button with ID for sticky bar reference }
              <div id="main-atc-button" className="flex gap-3 mt-8">
                <motion.button 
                  whileTap={{ scale: 0.95 }} 
                  onClick={handleAddToCart} 
                  disabled={!selectedSize} 
                  className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-full font-bold text-sm transition-all ${
                    addedToCart 
                      ? 'bg-green-500 text-white' 
                      : selectedSize 
                        ? 'bg-black text-white hover:bg-gray-800 shadow-lg' 
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {addedToCart ? <><Check size={18} /> ADDED TO BAG ✓</> : <><ShoppingBag size={18} /> ADD TO BAG</>}
                </motion.button>
                <motion.button 
                  whileTap={{ scale: 0.95 }} 
                  onClick={handleBuyNow} 
                  disabled={!selectedSize} 
                  className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-full font-bold text-sm transition-all ${
                    selectedSize 
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 shadow-lg' 
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <Zap size={18} /> BUY NOW
                </motion.button>
                <button 
                  onClick={() => toggleWishlist(product.id)} 
                  className={`p-4 border-2 rounded-full transition-all ${
                    isWishlisted ? 'border-red-500 text-red-500 bg-red-50' : 'border-gray-200 hover:border-black'
                  }`}
                >
                  <Heart size={20} className={isWishlisted ? 'fill-current' : ''} />
                </button>
              </div>

              {/* Features */}
              <div className="mt-6 grid grid-cols-3 gap-3">
                {features.map((f, i) => (
                  <div key={i} className="text-center p-3 bg-gray-50 rounded-xl">
                    <f.icon size={18} className="mx-auto mb-1 text-gray-600" />
                    <span className="text-xs font-medium block">{f.text}</span>
                    <span className="text-[10px] text-gray-400">{f.sub}</span>
                  </div>
                ))}
              </div>

              {/* Care Instructions */}
              <CareInstructions careInstructions={product.care_instructions} />

              {/* FAQ Accordion */}
              <FAQAccordion faqs={product.faq} />
              {/* Specifications Accordions */}
              <div className="mt-8 border-t pt-6 space-y-4">
                <h3 className="font-bold text-lg mb-4">Product Specifications</h3>
                
                {/* Fabric & Composition */}
                <div className="border rounded-xl overflow-hidden">
                  <button
                    onClick={() => toggleSpec('fabric')}
                    className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Shirt size={20} className="text-gray-600" />
                      <span className="font-medium">Fabric & Composition</span>
                    </div>
                    <ChevronDown size={20} className={`transition-transform ${expandedSpec === 'fabric' ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {expandedSpec === 'fabric' && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 space-y-2 text-sm text-gray-600 border-t pt-4">
                          {product.fabric_composition && (
                            <div className="flex justify-between">
                              <span className="text-gray-500">Material:</span>
                              <span className="font-medium">{product.fabric_composition}</span>
                            </div>
                          )}
                          {product.fabric_finish && (
                            <div className="flex justify-between">
                              <span className="text-gray-500">Finish:</span>
                              <span className="font-medium">{product.fabric_finish}</span>
                            </div>
                          )}
                          {product.garment_specs && (
                            <div className="flex justify-between">
                              <span className="text-gray-500">Weight:</span>
                              <span className="font-medium">{product.garment_specs}</span>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Fit & Sizing */}
                <div className="border rounded-xl overflow-hidden">
                  <button
                    onClick={() => toggleSpec('fit')}
                    className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Ruler size={20} className="text-gray-600" />
                      <span className="font-medium">Fit & Sizing</span>
                    </div>
                    <ChevronDown size={20} className={`transition-transform ${expandedSpec === 'fit' ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {expandedSpec === 'fit' && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 space-y-2 text-sm text-gray-600 border-t pt-4">
                          {product.fit && (
                            <div className="flex justify-between">
                              <span className="text-gray-500">Fit Type:</span>
                              <span className="font-medium">{product.fit}</span>
                            </div>
                          )}
                          {product.model_size && (
                            <div className="flex justify-between">
                              <span className="text-gray-500">Model Wears:</span>
                              <span className="font-medium">{product.model_size}</span>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span className="text-gray-500">Available Sizes:</span>
                            <span className="font-medium">{product.sizes?.join(', ')}</span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Garment Care */}
                <div className="border rounded-xl overflow-hidden">
                  <button
                    onClick={() => toggleSpec('care')}
                    className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Scissors size={20} className="text-gray-600" />
                      <span className="font-medium">Garment Care</span>
                    </div>
                    <ChevronDown size={20} className={`transition-transform ${expandedSpec === 'care' ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {expandedSpec === 'care' && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 text-sm text-gray-600 border-t pt-4">
                          {product.garment_care || 'Machine wash cold, tumble dry low'}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Shipping & Delivery */}
                <div className="border rounded-xl overflow-hidden">
                  <button
                    onClick={() => toggleSpec('shipping')}
                    className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Package size={20} className="text-gray-600" />
                      <span className="font-medium">Shipping & Delivery</span>
                    </div>
                    <ChevronDown size={20} className={`transition-transform ${expandedSpec === 'shipping' ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {expandedSpec === 'shipping' && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 text-sm text-gray-600 border-t pt-4">
                          {product.shipping_delivery || '3-5 business days across Pakistan'}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-20 border-t pt-12">
            <h3 className="text-2xl font-display font-bold mb-8">You May Also Like</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {relatedProducts.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="group"
                >
                  <Link to={`/product/${p.id}`} className="block">
                    <div className="aspect-[3/4] rounded-xl overflow-hidden bg-gray-100 mb-3">
                      <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                    <h4 className="text-sm font-medium line-clamp-1 group-hover:text-purple-600 transition-colors">{p.name}</h4>
                    <p className="text-sm font-bold mt-1">Rs.{(p.salePrice || p.price || 0).toLocaleString()}</p>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Size Guide Modal */}
      {showSizeGuideButton && showSizeGuide && (
        <SizeGuideModal
          product={product}
          onClose={() => setShowSizeGuide(false)}
        />
      )}
    </div>
  );
}
