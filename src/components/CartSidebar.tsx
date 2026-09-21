import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Trash2, Plus, Minus } from 'lucide-react';
import { useStore } from '../store/useStore';

export default function CartSidebar() {
  const { 
    cart, 
    isCartSidebarOpen, 
    closeCartSidebar, 
    removeFromCart, 
    updateCartQuantity,
    clearCart 
  } = useStore();

  const cartTotal = cart.reduce((sum, item) => {
    const price = parseFloat(item.product.base_price) || 0;
    return sum + price * item.quantity;
  }, 0);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isCartSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCartSidebar}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998]"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {isCartSidebarOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-[9999] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <ShoppingBag size={24} className="text-black" />
                <h2 className="text-xl font-bold text-black">Your Cart</h2>
                <span className="bg-black text-white text-xs font-bold px-2 py-1 rounded-full">
                  {cartCount}
                </span>
              </div>
              <button
                onClick={closeCartSidebar}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <ShoppingBag size={64} className="text-gray-300 mb-4" />
                  <p className="text-gray-500 text-lg font-medium">Your cart is empty</p>
                  <p className="text-gray-400 text-sm mt-2">Start shopping to add items</p>
                  <button
                    onClick={closeCartSidebar}
                    className="mt-6 bg-black text-white px-6 py-3 rounded-none font-medium hover:bg-gray-800 transition-colors"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <AnimatePresence>
                    {cart.map((item, index) => (
                      <CartItem 
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

            {/* Footer with Total and Checkout */}
            {cart.length > 0 && (
              <div className="border-t border-gray-200 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 font-medium">Subtotal</span>
                  <span className="text-xl font-bold text-black">
                    Rs.{cartTotal.toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-gray-500">Shipping and taxes calculated at checkout</p>
                
                <button className="w-full bg-black text-white py-4 rounded-none font-bold text-base hover:bg-gray-800 transition-colors">
                  Checkout
                </button>
                
                <button
                  onClick={clearCart}
                  className="w-full border-2 border-gray-300 text-gray-700 py-3 rounded-none font-medium hover:border-black hover:text-black transition-colors"
                >
                  Clear Cart
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

interface CartItemProps {
  item: any;
  index: number;
  onRemove: () => void;
  onUpdateQuantity: (qty: number) => void;
}

function CartItem({ item, index, onRemove, onUpdateQuantity }: CartItemProps) {
  const { animateQuantity } = item;
  const firstColor = item.product.colors?.[0];
  const colorName = typeof firstColor === 'string' ? firstColor : firstColor?.name || item.color || 'Black';
  const imageUrl = item.product.images?.[0] || item.product.image_url || item.product.image;
  const price = parseFloat(item.product.base_price) || 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50, scale: 0.9 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="flex gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200"
    >
      {/* Image - Slides in first */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
        className="w-24 h-24 flex-shrink-0 bg-gray-200 rounded-md overflow-hidden"
      >
        <img
          src={imageUrl}
          alt={item.product.name}
          className="w-full h-full object-cover"
        />
      </motion.div>

      {/* Details */}
      <div className="flex-1 flex flex-col">
        {/* Title - Fades in second */}
        <motion.h3
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 + index * 0.05 }}
          className="font-medium text-sm text-gray-800 line-clamp-2"
        >
          {item.product.name}
        </motion.h3>

        {/* Size/Color Badges - Pop in third */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2, delay: 0.3 + index * 0.05 }}
          className="flex items-center gap-2 mt-2"
        >
          <span className="text-[10px] bg-gray-200 px-2 py-0.5 rounded font-medium">
            Size: {item.size}
          </span>
          <span className="text-[10px] bg-gray-200 px-2 py-0.5 rounded font-medium">
            Color: {colorName}
          </span>
        </motion.div>

        {/* Quantity and Price - Fade in last */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.4 + index * 0.05 }}
          className="flex items-center justify-between mt-auto pt-3"
        >
          {/* Quantity Controls */}
          <div className="flex items-center border border-gray-300">
            <button
              onClick={() => onUpdateQuantity(item.quantity - 1)}
              className="px-2 py-1 hover:bg-gray-100 transition-colors"
              disabled={item.quantity <= 1}
            >
              <Minus size={14} />
            </button>
            <motion.span
              key={item.quantity}
              initial={{ scale: animateQuantity ? 1.3 : 1 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3, type: 'spring' }}
              className="px-3 py-1 text-sm font-medium min-w-[2rem] text-center"
            >
              {item.quantity}
            </motion.span>
            <button
              onClick={() => onUpdateQuantity(item.quantity + 1)}
              className="px-2 py-1 hover:bg-gray-100 transition-colors"
            >
              <Plus size={14} />
            </button>
          </div>

          {/* Price */}
          <span className="font-bold text-black">
            Rs.{(price * item.quantity).toLocaleString()}
          </span>
        </motion.div>

        {/* Remove Button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.5 + index * 0.05 }}
          onClick={onRemove}
          className="self-end text-xs text-red-500 hover:text-red-700 flex items-center gap-1 mt-2"
        >
          <Trash2 size={12} />
          Remove
        </motion.button>
      </div>
    </motion.div>
  );
}