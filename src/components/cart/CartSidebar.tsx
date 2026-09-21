import { forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Minus, Plus, Trash2 } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { Link } from 'react-router-dom';

export default function CartSidebar() {
  const { cart, removeFromCart, updateCartQuantity, isSidebarOpen, closeSidebar } = useCart();
  const subtotal = cart.reduce((sum, item) => sum + (item.product.salePrice || item.product.price || 0) * item.quantity, 0);
  const shipping = subtotal >= 3000 ? 0 : 200;
  const total = subtotal + shipping;

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
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl z-[70] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <ShoppingBag size={20} />
                Shopping Bag ({cart.length})
              </h2>
              <button
                onClick={closeSidebar}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <ShoppingBag className="text-gray-300 mb-4" size={64} />
                  <p className="text-lg font-medium mb-2">Your bag is empty</p>
                  <p className="text-gray-500 mb-6">Add some products to get started.</p>
                  <Link
                    to="/shop"
                    onClick={closeSidebar}
                    className="bg-black text-white px-6 py-3 rounded-full font-semibold text-sm"
                  >
                    CONTINUE SHOPPING
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  <AnimatePresence mode="popLayout">
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

            {/* Footer - Order Summary */}
            {cart.length > 0 && (
              <div className="border-t p-6 space-y-4 bg-gray-50">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">Rs.{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">{shipping === 0 ? 'FREE' : `Rs.${shipping}`}</span>
                  </div>
                  <hr />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>Rs.{total.toLocaleString()}</span>
                  </div>
                </div>
                <Link
                  to="/checkout"
                  onClick={closeSidebar}
                  className="block w-full bg-black text-white text-center py-4 rounded-full font-bold text-sm hover:bg-gray-800 transition-colors"
                >
                  PROCEED TO CHECKOUT
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// Cart Item Component with Sequential Assembly Animation
const CartItem = forwardRef<HTMLDivElement, { 
  item: any; 
  index: number; 
  onRemove: () => void; 
  onUpdateQuantity: (qty: number) => void;
}>(function CartItem({ 
  item, 
  index, 
  onRemove, 
  onUpdateQuantity 
}, ref) {
  const product = item.product;
  const imageSrc = product.image_url || product.images?.[0] || product.image;
  const price = product.salePrice || product.price || 0;

  // Container animation - slides in from right
  const containerVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { 
        duration: 0.4,
        delay: index * 0.1, // Stagger based on index
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    },
    exit: { 
      opacity: 0, 
      x: 50,
      transition: { duration: 0.3 }
    }
  };

  // Image snap animation
  const imageVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: { 
        duration: 0.3,
        delay: index * 0.1 + 0.1,
        type: 'spring',
        stiffness: 300
      }
    }
  };

  // Title slide animation
  const titleVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { 
        duration: 0.3,
        delay: index * 0.1 + 0.2
      }
    }
  };

  // Badges pop animation
  const badgesVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: { 
        duration: 0.2,
        delay: index * 0.1 + 0.3,
        type: 'spring',
        stiffness: 400
      }
    }
  };

  // Quantity fade animation
  const quantityVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        duration: 0.3,
        delay: index * 0.1 + 0.4
      }
    }
  };

  return (
    <motion.div
      ref={ref}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      layout
      className="flex gap-4 p-4 bg-gray-50 rounded-xl"
    >
      {/* Image - snaps into place */}
      <motion.div
        variants={imageVariants}
        className="w-24 h-28 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100"
      >
        <img
          src={imageSrc}
          alt={product.name}
          className="w-full h-full object-cover"
        />
      </motion.div>

      {/* Details */}
      <div className="flex-1 flex flex-col">
        {/* Title - slides in */}
        <motion.div variants={titleVariants}>
          <Link 
            to={`/products/${product.slug}`} 
            className="font-semibold text-sm hover:underline line-clamp-2"
          >
            {product.name}
          </Link>
          
          {/* Size & Color badges - pop in */}
          <motion.div 
            variants={badgesVariants}
            className="flex gap-2 mt-1.5"
          >
            <span className="text-xs bg-gray-200 px-2 py-0.5 rounded font-medium">
              Size: {item.size}
            </span>
            <span className="text-xs bg-gray-200 px-2 py-0.5 rounded font-medium">
              Color: {item.color}
            </span>
          </motion.div>
        </motion.div>

        {/* Price & Actions */}
        <div className="flex items-center justify-between mt-auto pt-3">
          {/* Quantity selector - fades in */}
          <motion.div 
            variants={quantityVariants}
            className="flex items-center border rounded-lg overflow-hidden"
          >
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => onUpdateQuantity(item.quantity - 1)}
              className="p-2 hover:bg-gray-200 transition-colors"
            >
              <Minus size={14} />
            </motion.button>
            <motion.span 
              key={item.quantity}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              className="px-3 text-sm font-medium"
            >
              {item.quantity}
            </motion.span>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => onUpdateQuantity(item.quantity + 1)}
              className="p-2 hover:bg-gray-200 transition-colors"
            >
              <Plus size={14} />
            </motion.button>
          </motion.div>

          {/* Total price & Remove */}
          <div className="flex items-center gap-3">
            <span className="font-bold text-sm">
              Rs.{(price * item.quantity).toLocaleString()}
            </span>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onRemove}
              className="p-1.5 hover:bg-red-100 rounded-full transition-colors"
            >
              <Trash2 size={16} className="text-red-500" />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
});
