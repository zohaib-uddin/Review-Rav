import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Minus, Plus, X, ShoppingBag, ArrowRight, Gift, Tag, Sparkles, Check, Trash2 } from 'lucide-react';
import { useStore } from '../store/useStore';
import { calculateCartDiscounts } from '../utils/cartDiscounts';
import { resolveColorHex } from '../utils/colorUtils';

export default function Cart() {
  const { cart, removeFromCart, updateCartQuantity } = useStore();
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

  if (cart.length === 0) return (
    <div className="min-h-[60vh] flex items-center justify-center font-sans">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <div className="w-20 h-20 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400 mx-auto mb-4">
          <ShoppingBag size={36} />
        </div>
        <h2 className="text-2xl font-bold mb-2 text-neutral-900">Your bag is empty</h2>
        <p className="text-gray-500 mb-6 text-sm max-w-sm mx-auto">
          Explore our latest collection and take advantage of our flat 10% and volume bundle savings.
        </p>
        <Link 
          to="/shop" 
          className="inline-flex items-center gap-2 bg-black text-white px-8 py-3.5 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-neutral-800 transition-colors shadow-sm cursor-pointer"
        >
          CONTINUE SHOPPING <ArrowRight size={14} />
        </Link>
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen bg-neutral-50/50 py-10 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-8 border-b border-gray-200">
          <div>
            <h1 className="text-3xl font-display font-black text-neutral-950 tracking-tight">Shopping Bag</h1>
            <p className="text-sm text-neutral-500 mt-1">Review your selections and unlocked discounts</p>
          </div>
          <span className="text-sm font-semibold text-neutral-600 mt-2 sm:mt-0">
            {totalQty} {totalQty === 1 ? 'item' : 'items'} in your cart
          </span>
        </div>

        {/* Top Tier Discount Progress Banner */}
        <div className="bg-neutral-950 text-white rounded-2xl p-5 mb-8 border border-neutral-800 shadow-md">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2.5">
              <span className="flex items-center gap-1.5 bg-amber-400 text-black text-xs font-black tracking-wider px-3 py-1 rounded-full uppercase">
                <Tag size={12} strokeWidth={2.5} />
                FLAT 10% OFF
              </span>
              <span className="text-sm font-medium text-neutral-200">
                Applied automatically to your entire bag!
              </span>
            </div>
            {tierPercent > 0 && (
              <span className="text-xs font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-500/40 px-3 py-1 rounded-full flex items-center gap-1.5 w-fit">
                <Sparkles size={12} />
                +{tierPercent}% Multi-Buy Tier Bonus Active
              </span>
            )}
          </div>

          {/* Progress bar container */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold text-neutral-300">
              <span className="flex items-center gap-1.5">
                <Gift size={15} className="text-amber-400 animate-bounce" />
                Multi-Buy Progress ({totalQty}/5 items):
              </span>
              <span className="text-amber-300 font-bold">{tierStatusMessage}</span>
            </div>

            <div className="relative w-full h-3 bg-neutral-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-amber-400 via-orange-400 to-emerald-400 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              />
            </div>

            {/* Pins */}
            <div className="flex justify-between text-xs font-bold pt-1 text-neutral-400">
              <span className={unlockedTier1 ? 'text-amber-400 font-extrabold flex items-center gap-1' : 'flex items-center gap-1'}>
                {unlockedTier1 && <Check size={12} strokeWidth={3} />}
                Add 2 Items: +5% Extra OFF
              </span>
              <span className={unlockedTier2 ? 'text-emerald-400 font-extrabold flex items-center gap-1' : 'flex items-center gap-1'}>
                {unlockedTier2 && <Check size={12} strokeWidth={3} />}
                Add 5 Items: +10% Extra OFF
              </span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item, i) => {
              const p = item.product;
              const actualPrice = Number(p.salePrice || p.price || p.base_price || 0);
              const comparePrice = Number(p.compare_at_price || p.compare_price || 0);
              const hasComparePrice = comparePrice > actualPrice;
              const colorHex = resolveColorHex(item.color, p.attributes);

              return (
                <motion.div 
                  key={`${item.product.id}-${item.size}-${item.color}`} 
                  initial={{ opacity: 0, y: 15 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ delay: i * 0.05 }} 
                  className="flex flex-col sm:flex-row gap-4 p-5 bg-white rounded-2xl border border-gray-200/80 shadow-xs relative"
                >
                  <Link 
                    to={`/products/${item.product.slug || item.product.id}`} 
                    className="w-24 h-28 sm:w-28 sm:h-36 rounded-xl overflow-hidden flex-shrink-0 bg-neutral-100 border border-neutral-200 block"
                  >
                    <img 
                      src={item.product.image_url || item.product.images?.[0] || item.product.image || 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=500&fit=crop'} 
                      alt={item.product.name} 
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" 
                    />
                  </Link>

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-3">
                        <Link 
                          to={`/products/${item.product.slug || item.product.id}`} 
                          className="font-bold text-sm sm:text-base text-neutral-900 hover:text-black leading-snug cursor-pointer"
                        >
                          {item.product.name}
                        </Link>
                        <button 
                          onClick={() => removeFromCart(item.product.id, item.size)} 
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Remove item"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      {/* Size badge & Color Dot with Text */}
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <span className="inline-flex items-center text-xs font-bold text-neutral-800 bg-neutral-100 border border-neutral-200 px-2.5 py-1 rounded-md">
                          Size: {item.size}
                        </span>

                        <span className="inline-flex items-center gap-2 text-xs font-bold text-neutral-800 bg-neutral-100 border border-neutral-200 px-2.5 py-1 rounded-md">
                          <span 
                            className="w-3 h-3 rounded-full border border-black/20 flex-shrink-0 shadow-2xs" 
                            style={{ backgroundColor: colorHex }}
                          />
                          <span>Color: {item.color}</span>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                      {/* Quantity Selector */}
                      <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white shadow-2xs">
                        <button 
                          onClick={() => updateCartQuantity(item.product.id, item.size, Math.max(1, item.quantity - 1))} 
                          className="p-2 hover:bg-gray-100 text-gray-700 transition-colors cursor-pointer"
                        >
                          <Minus size={13} strokeWidth={2.5} />
                        </button>
                        <span className="px-3 text-xs font-bold text-neutral-900 min-w-[24px] text-center">
                          {item.quantity}
                        </span>
                        <button 
                          onClick={() => updateCartQuantity(item.product.id, item.size, item.quantity + 1)} 
                          className="p-2 hover:bg-gray-100 text-gray-700 transition-colors cursor-pointer"
                        >
                          <Plus size={13} strokeWidth={2.5} />
                        </button>
                      </div>

                      {/* Pricing */}
                      <div className="text-right">
                        <div className="flex items-baseline justify-end gap-2">
                          {hasComparePrice && (
                            <span className="text-xs text-neutral-400 line-through font-medium">
                              Rs. {(comparePrice * item.quantity).toLocaleString()}
                            </span>
                          )}
                          <span className="text-base font-black text-neutral-950">
                            Rs. {(actualPrice * item.quantity).toLocaleString()}
                          </span>
                        </div>
                        {hasComparePrice && (
                          <span className="text-[10px] font-extrabold text-red-600 block">
                            {Math.round(((comparePrice - actualPrice) / comparePrice) * 100)}% OFF
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Order Summary Sidebar */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white rounded-2xl border border-gray-200 p-6 h-fit sticky top-24 shadow-xs">
            <h3 className="font-bold text-lg text-neutral-950 mb-4 pb-3 border-b border-gray-100">Order Summary</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal ({totalQty} item{totalQty > 1 ? 's' : ''})</span>
                <span className="font-semibold text-neutral-900">Rs. {subtotal.toLocaleString()}</span>
              </div>

              {/* Flat 10% Off */}
              <div className="flex justify-between text-emerald-700 font-medium">
                <span className="flex items-center gap-1">
                  <Tag size={13} />
                  Flat 10% Discount
                </span>
                <span>-Rs. {flatDiscount.toLocaleString()}</span>
              </div>

              {/* Tier Multi-buy discount */}
              {tierPercent > 0 && (
                <div className="flex justify-between text-amber-700 font-semibold">
                  <span className="flex items-center gap-1">
                    <Gift size={13} />
                    Multi-Buy Bonus ({tierPercent}% OFF)
                  </span>
                  <span>-Rs. {tierDiscount.toLocaleString()}</span>
                </div>
              )}

              {/* Total Savings */}
              <div className="flex justify-between text-emerald-900 font-bold bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                <span>Total Savings</span>
                <span className="font-extrabold">-Rs. {autoDiscount.toLocaleString()}</span>
              </div>

              {/* Shipping */}
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span className="font-semibold text-neutral-900">
                  {shipping === 0 ? <span className="text-emerald-600 font-bold">FREE</span> : `Rs. ${shipping}`}
                </span>
              </div>

              <hr className="border-gray-200 my-2" />

              <div className="flex justify-between text-lg font-black text-neutral-950">
                <span>Estimated Total</span>
                <span>Rs. {finalTotal.toLocaleString()}</span>
              </div>
            </div>

            <Link 
              to="/checkout" 
              className="block w-full mt-6 bg-black text-white text-center py-4 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-neutral-800 transition-colors shadow-md cursor-pointer"
            >
              PROCEED TO CHECKOUT
            </Link>
            <Link 
              to="/shop" 
              className="block text-center mt-3 text-xs font-semibold text-gray-500 hover:text-black uppercase tracking-wider cursor-pointer"
            >
              Continue Shopping
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
