import { forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Minus, Plus, Trash2, Gift, Sparkles, Check, Tag } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { Link } from 'react-router-dom';
import { calculateCartDiscounts } from '../../utils/cartDiscounts';
import { resolveColorHex } from '../../utils/colorUtils';

export default function CartSidebar() {
  const { cart, removeFromCart, updateCartQuantity, isSidebarOpen, closeSidebar } = useCart();
  const discounts = calculateCartDiscounts(cart);
  const {
    subtotal,
    totalQty,
    flatDiscount,
    tierPercent,
    tierDiscount,
    autoDiscount,
    tierStatusMessage,
    progressPercent,
    unlockedTier1,
    unlockedTier2,
    shipping,
    finalTotal,
  } = discounts;

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeSidebar}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl z-[70] flex flex-col font-sans"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-white">
              <h2 className="text-lg font-bold flex items-center gap-2 text-neutral-900 tracking-tight">
                <ShoppingBag size={19} className="stroke-[2.2]" />
                Shopping Bag ({totalQty})
              </h2>
              <button
                type="button"
                onClick={closeSidebar}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer text-gray-500 hover:text-black"
                aria-label="Close cart"
              >
                <X size={18} />
              </button>
            </div>

            {/* Top Promotion Banner & Tiered Progress Bar */}
            <div className="bg-gradient-to-br from-neutral-900 via-neutral-950 to-neutral-900 text-white px-5 py-4 border-b border-neutral-800 shadow-inner">
              {/* Flat 10% Off Header Badge */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 bg-amber-400 text-neutral-950 text-[10px] font-black tracking-widest px-2.5 py-0.5 rounded-full uppercase shadow-xs">
                    <Tag size={10} className="stroke-[2.5]" />
                    FLAT 10% OFF
                  </span>
                  <span className="text-xs font-semibold text-neutral-300">
                    Auto-Applied on Cart
                  </span>
                </div>
                {tierPercent > 0 && (
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-500/40 px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                    <Sparkles size={10} />
                    +{tierPercent}% Extra
                  </span>
                )}
              </div>

              {/* Progress Milestones Header */}
              <div className="flex items-center justify-between text-[11px] font-bold mb-2">
                <div className="flex items-center gap-1.5 text-neutral-300">
                  <Gift size={14} className="text-amber-400 animate-bounce" />
                  <span>Multi-Buy Bundle Bonus:</span>
                </div>
                <span className="text-[10px] text-neutral-400">
                  {totalQty}/5 items added
                </span>
              </div>

              {/* Tier Progress Track */}
              <div className="relative w-full h-2.5 bg-neutral-800 rounded-full overflow-hidden mb-2">
                <motion.div
                  className="h-full bg-gradient-to-r from-amber-400 via-orange-400 to-emerald-400 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
              </div>

              {/* Milestone Indicator Pins */}
              <div className="relative flex justify-between text-[10px] font-bold text-neutral-400 pt-0.5">
                <div className={`flex items-center gap-1 transition-colors ${unlockedTier1 ? 'text-amber-400 font-extrabold' : 'text-neutral-400'}`}>
                  <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] ${unlockedTier1 ? 'bg-amber-400 text-black' : 'bg-neutral-800 text-neutral-400'}`}>
                    {unlockedTier1 ? <Check size={9} strokeWidth={3} /> : '2'}
                  </span>
                  <span>Add 2: +5% OFF</span>
                </div>
                <div className={`flex items-center gap-1 transition-colors ${unlockedTier2 ? 'text-emerald-400 font-extrabold' : 'text-neutral-400'}`}>
                  <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] ${unlockedTier2 ? 'bg-emerald-400 text-black' : 'bg-neutral-800 text-neutral-400'}`}>
                    {unlockedTier2 ? <Check size={9} strokeWidth={3} /> : '5'}
                  </span>
                  <span>Add 5: +10% OFF</span>
                </div>
              </div>

              {/* Dynamic Status message */}
              <div className="mt-2.5 text-[11px] font-medium text-amber-200/90 bg-neutral-800/80 px-2.5 py-1.5 rounded-lg border border-neutral-700/60 flex items-center gap-1.5">
                <Sparkles size={12} className="text-amber-400 flex-shrink-0" />
                <span>{tierStatusMessage}</span>
              </div>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400 mb-4">
                    <ShoppingBag size={28} />
                  </div>
                  <p className="text-base font-bold text-neutral-900 mb-1">Your bag is empty</p>
                  <p className="text-xs text-neutral-500 mb-6 max-w-xs">
                    Explore our latest premium arrivals and take advantage of our flat 10% and bundle discounts!
                  </p>
                  <Link
                    to="/shop"
                    onClick={closeSidebar}
                    className="bg-black text-white px-7 py-3 rounded-full font-bold text-xs tracking-wider uppercase hover:bg-neutral-800 transition-colors shadow-sm cursor-pointer"
                  >
                    CONTINUE SHOPPING
                  </Link>
                </div>
              ) : (
                <div className="space-y-3.5">
                  <AnimatePresence mode="popLayout">
                    {cart.map((item, index) => (
                      <CartItemRow
                        key={`${item.product.id}-${item.size}-${item.color}`}
                        item={item}
                        index={index}
                        onRemove={() => removeFromCart(item.product.id, item.size)}
                        onUpdateQuantity={(qty) => updateCartQuantity(item.product.id, item.size, qty)}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Footer - Order Summary */}
            {cart.length > 0 && (
              <div className="border-t border-gray-200 p-5 space-y-3 bg-gray-50/80">
                <div className="space-y-1.5 text-xs text-gray-600">
                  <div className="flex justify-between">
                    <span>Subtotal ({totalQty} item{totalQty > 1 ? 's' : ''})</span>
                    <span className="font-semibold text-neutral-900">Rs. {subtotal.toLocaleString()}</span>
                  </div>

                  {/* Flat 10% Off line */}
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span className="flex items-center gap-1">
                      <Tag size={12} />
                      Flat 10% Discount
                    </span>
                    <span>-Rs. {flatDiscount.toLocaleString()}</span>
                  </div>

                  {/* Multi-Buy Tier Discount line */}
                  {tierPercent > 0 && (
                    <div className="flex justify-between text-amber-700 font-semibold">
                      <span className="flex items-center gap-1">
                        <Gift size={12} />
                        Multi-Buy Bonus ({tierPercent}% OFF)
                      </span>
                      <span>-Rs. {tierDiscount.toLocaleString()}</span>
                    </div>
                  )}

                  {/* Total Savings Highlight */}
                  <div className="flex justify-between text-neutral-900 font-bold bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                    <span className="text-emerald-800">Total Savings</span>
                    <span className="text-emerald-800 font-extrabold">-Rs. {autoDiscount.toLocaleString()}</span>
                  </div>

                  {/* Shipping */}
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span className="font-semibold text-neutral-900">
                      {shipping === 0 ? (
                        <span className="text-emerald-600 font-bold">FREE</span>
                      ) : (
                        `Rs. ${shipping}`
                      )}
                    </span>
                  </div>

                  <hr className="border-gray-200 my-2" />

                  {/* Final Total */}
                  <div className="flex justify-between text-base font-black text-neutral-950 pt-0.5">
                    <span>Estimated Total</span>
                    <span>Rs. {finalTotal.toLocaleString()}</span>
                  </div>
                </div>

                <div className="pt-2 space-y-2">
                  <Link
                    to="/checkout"
                    onClick={closeSidebar}
                    className="block w-full bg-black text-white text-center py-3.5 rounded-full font-bold text-xs tracking-widest uppercase hover:bg-neutral-800 transition-colors shadow-md cursor-pointer"
                  >
                    PROCEED TO CHECKOUT
                  </Link>
                  <Link
                    to="/cart"
                    onClick={closeSidebar}
                    className="block w-full bg-white text-black border border-gray-300 text-center py-2.5 rounded-full font-bold text-xs tracking-wider uppercase hover:border-black transition-colors cursor-pointer"
                  >
                    VIEW FULL BAG
                  </Link>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// Cart Item Component with Detailed Price, Size & Color Dot with Text
const CartItemRow = forwardRef<HTMLDivElement, { 
  item: any; 
  index: number; 
  onRemove: () => void; 
  onUpdateQuantity: (qty: number) => void;
}>(function CartItemRow({ 
  item, 
  index, 
  onRemove, 
  onUpdateQuantity 
}, ref) {
  const product = item.product;
  const imageSrc = product.image_url || product.images?.[0] || product.image || 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=500&fit=crop';
  
  // Unit actual price & compare price
  const actualPrice = Number(product.salePrice || product.price || product.base_price || 0);
  const comparePrice = Number(product.compare_at_price || product.compare_price || 0);
  const hasComparePrice = comparePrice > actualPrice;

  // Resolve color swatch hex dot
  const colorHex = resolveColorHex(item.color, product.attributes);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.25, delay: index * 0.04 }}
      layout
      className="flex gap-3.5 p-3.5 bg-neutral-50/90 border border-neutral-200/80 rounded-2xl relative group"
    >
      {/* Product Image */}
      <Link
        to={`/products/${product.slug || product.id}`}
        className="w-20 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-neutral-200 border border-neutral-200 shadow-2xs block"
      >
        <img
          src={imageSrc}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </Link>

      {/* Item Details */}
      <div className="flex-1 flex flex-col justify-between min-w-0">
        <div>
          {/* Title & Delete button */}
          <div className="flex items-start justify-between gap-2">
            <Link 
              to={`/products/${product.slug || product.id}`} 
              className="font-bold text-xs text-neutral-900 hover:text-black line-clamp-1 leading-snug cursor-pointer"
            >
              {product.name}
            </Link>
            <button
              type="button"
              onClick={onRemove}
              className="text-gray-400 hover:text-red-600 transition-colors p-1 -mr-1 -mt-1 rounded-full cursor-pointer"
              title="Remove item"
            >
              <Trash2 size={14} />
            </button>
          </div>

          {/* Size & Color Dot with Text */}
          <div className="flex flex-wrap items-center gap-2 mt-1.5">
            {/* Size Badge */}
            <span className="inline-flex items-center text-[10px] font-bold text-neutral-700 bg-white border border-neutral-200 px-2 py-0.5 rounded-md shadow-2xs">
              Size: {item.size}
            </span>

            {/* Color Dot + Color Name Text */}
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-neutral-700 bg-white border border-neutral-200 px-2 py-0.5 rounded-md shadow-2xs">
              <span
                className="w-2.5 h-2.5 rounded-full border border-black/20 flex-shrink-0 shadow-2xs"
                style={{ backgroundColor: colorHex }}
                title={`Color: ${item.color}`}
              />
              <span className="truncate max-w-[90px]">{item.color}</span>
            </span>
          </div>
        </div>

        {/* Pricing & Quantity Controls */}
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-neutral-200/60">
          {/* Quantity Controls */}
          <div className="flex items-center border border-neutral-300 bg-white rounded-lg shadow-2xs overflow-hidden">
            <button
              type="button"
              onClick={() => onUpdateQuantity(Math.max(1, item.quantity - 1))}
              className="px-2 py-1 text-neutral-600 hover:bg-neutral-100 hover:text-black transition-colors cursor-pointer"
              aria-label="Decrease quantity"
            >
              <Minus size={11} strokeWidth={2.5} />
            </button>
            <span className="px-2.5 text-xs font-bold text-neutral-900 min-w-[20px] text-center">
              {item.quantity}
            </span>
            <button
              type="button"
              onClick={() => onUpdateQuantity(item.quantity + 1)}
              className="px-2 py-1 text-neutral-600 hover:bg-neutral-100 hover:text-black transition-colors cursor-pointer"
              aria-label="Increase quantity"
            >
              <Plus size={11} strokeWidth={2.5} />
            </button>
          </div>

          {/* Actual Price & Compare Price */}
          <div className="text-right">
            <div className="flex items-baseline justify-end gap-1.5">
              {hasComparePrice && (
                <span className="text-[11px] text-neutral-400 line-through font-medium">
                  Rs. {(comparePrice * item.quantity).toLocaleString()}
                </span>
              )}
              <span className="text-xs font-black text-neutral-950">
                Rs. {(actualPrice * item.quantity).toLocaleString()}
              </span>
            </div>
            {hasComparePrice && (
              <span className="text-[9px] font-extrabold text-red-600 block">
                {Math.round(((comparePrice - actualPrice) / comparePrice) * 100)}% OFF
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
});
