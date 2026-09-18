import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Minus, Plus, X, ShoppingBag, ArrowRight, Trash2 } from 'lucide-react';
import { useStore } from '../store/useStore';

export default function Cart() {
  const { cart, removeFromCart, updateCartQuantity } = useStore();
  const subtotal = cart.reduce((sum, item) => sum + (item.product.salePrice || item.product.price || 0) * item.quantity, 0);
  const shipping = subtotal >= 3000 ? 0 : 200;
  const total = subtotal + shipping;

  if (cart.length === 0) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <ShoppingBag className="mx-auto text-gray-300 mb-4" size={64} />
        <h2 className="text-2xl font-bold mb-2">Your bag is empty</h2>
        <p className="text-gray-500 mb-6">Add some products to get started.</p>
        <Link to="/shop" className="inline-flex items-center gap-2 bg-black text-white px-8 py-3 rounded-full font-semibold text-sm">CONTINUE SHOPPING <ArrowRight size={16} /></Link>
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-display font-bold mb-8">Shopping Bag ({cart.length})</h1>
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item, i) => (
              <motion.div key={`${item.product.id}-${item.size}-${item.color}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="flex gap-4 p-4 bg-gray-50 rounded-xl">
                <Link to={`/product/${item.product.id}`} className="w-24 h-28 rounded-lg overflow-hidden flex-shrink-0"><img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" /></Link>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <div><Link to={`/product/${item.product.id}`} className="font-semibold text-sm hover:underline">{item.product.name}</Link><p className="text-xs text-gray-500 mt-1">Size: {item.size} | Color: {item.color}</p></div>
                    <button onClick={() => removeFromCart(item.product.id, item.size)} className="p-1 hover:bg-gray-200 rounded"><X size={16} className="text-gray-400" /></button>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center border rounded-lg">
                      <button onClick={() => updateCartQuantity(item.product.id, item.size, item.quantity - 1)} className="p-2"><Minus size={14} /></button>
                      <span className="px-3 text-sm font-medium">{item.quantity}</span>
                      <button onClick={() => updateCartQuantity(item.product.id, item.size, item.quantity + 1)} className="p-2"><Plus size={14} /></button>
                    </div>
                    <span className="font-bold">Rs.{((item.product.salePrice || item.product.price || 0) * item.quantity).toLocaleString()}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-gray-50 rounded-xl p-6 h-fit sticky top-24">
            <h3 className="font-bold text-lg mb-4">Order Summary</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-gray-600">Subtotal</span><span className="font-medium">Rs.{subtotal.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Shipping</span><span className="font-medium">{shipping === 0 ? 'FREE' : `Rs.${shipping}`}</span></div>
              <hr />
              <div className="flex justify-between text-lg font-bold"><span>Total</span><span>Rs.{total.toLocaleString()}</span></div>
            </div>
            <Link to="/checkout" className="block w-full mt-6 bg-black text-white text-center py-4 rounded-full font-bold text-sm hover:bg-gray-800">PROCEED TO CHECKOUT</Link>
            <Link to="/shop" className="block text-center mt-3 text-sm text-gray-500 hover:text-black">Continue Shopping</Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
