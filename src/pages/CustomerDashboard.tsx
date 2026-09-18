import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Package, Heart, LogOut, ShoppingBag, MapPin, Settings } from 'lucide-react';
import { useStore } from '../store/useStore';

export default function CustomerDashboard() {
  const { user, logout, orders, wishlist, products, fetchOrders, fetchProducts } = useStore();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Fetch data from API
  useEffect(() => {
    fetchOrders();
    fetchProducts();
  }, []);
  
  const wishlistProducts = products.filter(p => wishlist.includes(p.id));
  const tabs = [{ id: 'overview', label: 'Overview', icon: User }, { id: 'orders', label: 'My Orders', icon: Package }, { id: 'wishlist', label: 'Wishlist', icon: Heart }, { id: 'settings', label: 'Settings', icon: Settings }];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-white rounded-xl p-6 h-fit sticky top-24">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-3"><User size={28} className="text-white" /></div>
              <h3 className="font-bold">{user?.name}</h3>
              <p className="text-sm text-gray-500">{user?.email}</p>
            </div>
            <nav className="space-y-1">
              {tabs.map(tab => (<button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium ${activeTab === tab.id ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100'}`}><tab.icon size={18} />{tab.label}</button>))}
              <button onClick={() => { logout(); window.location.href = '/'; }} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50"><LogOut size={18} />Logout</button>
            </nav>
          </motion.div>
          <motion.div key={activeTab} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-3">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold">Welcome back, {user?.name}!</h2>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-xl p-6 border"><ShoppingBag className="text-purple-500 mb-2" size={24} /><p className="text-2xl font-bold">{orders.length}</p><p className="text-sm text-gray-500">Total Orders</p></div>
                  <div className="bg-white rounded-xl p-6 border"><Heart className="text-red-500 mb-2" size={24} /><p className="text-2xl font-bold">{wishlist.length}</p><p className="text-sm text-gray-500">Wishlist Items</p></div>
                  <div className="bg-white rounded-xl p-6 border"><Package className="text-green-500 mb-2" size={24} /><p className="text-2xl font-bold">{orders.filter(o => o.status === 'delivered').length}</p><p className="text-sm text-gray-500">Delivered</p></div>
                </div>
                <div className="bg-white rounded-xl p-6 border">
                  <h3 className="font-bold mb-4">Recent Activity</h3>
                  {orders.length > 0 ? (<div className="space-y-3">{orders.slice(-3).reverse().map(order => (<div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"><div><p className="font-medium text-sm">{order.order_number}</p><p className="text-xs text-gray-500">{new Date(order.date).toLocaleDateString()}</p></div><span className={`text-xs font-bold px-3 py-1 rounded-full ${order.status === 'delivered' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{order.status.toUpperCase()}</span></div>))}</div>) : (<p className="text-gray-500 text-sm">No orders yet. <Link to="/shop" className="text-black font-medium">Start shopping!</Link></p>)}
                </div>
              </div>
            )}
            {activeTab === 'orders' && (
              <div>
                <h2 className="text-2xl font-bold mb-6">My Orders</h2>
                {orders.length > 0 ? (<div className="space-y-4">{orders.map(order => (<div key={order.id} className="bg-white rounded-xl p-6 border"><div className="flex justify-between items-start mb-4"><div><p className="font-bold">{order.order_number}</p><p className="text-sm text-gray-500">{new Date(order.date).toLocaleDateString()}</p></div><span className={`text-xs font-bold px-3 py-1 rounded-full ${order.status === 'delivered' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{order.status.toUpperCase()}</span></div><div className="space-y-2">{order.items?.map((item, i) => (<div key={i} className="flex items-center gap-3"><img src={item.product.image} alt="" className="w-12 h-14 rounded object-cover" /><div className="flex-1"><p className="text-sm font-medium">{item.product.name}</p><p className="text-xs text-gray-500">{item.size} × {item.quantity}</p></div><span className="text-sm font-bold">Rs.{((item.product.salePrice || item.product.price || 0) * item.quantity).toLocaleString()}</span></div>))}</div><hr className="my-4" /><div className="flex justify-between items-center"><p className="text-sm text-gray-500">Total</p><p className="font-bold">Rs.{order.total.toLocaleString()}</p></div></div>))}</div>) : (<div className="text-center py-12 bg-white rounded-xl border"><Package className="mx-auto text-gray-300 mb-4" size={48} /><h3 className="font-bold mb-2">No orders yet</h3><Link to="/shop" className="inline-flex items-center gap-2 bg-black text-white px-6 py-2 rounded-full text-sm font-medium">Shop Now</Link></div>)}
              </div>
            )}
            {activeTab === 'wishlist' && (
              <div>
                <h2 className="text-2xl font-bold mb-6">My Wishlist</h2>
                {wishlistProducts.length > 0 ? (<div className="grid grid-cols-2 md:grid-cols-3 gap-4">{wishlistProducts.map(product => (<Link key={product.id} to={`/product/${product.id}`} className="bg-white rounded-xl overflow-hidden border hover:shadow-md"><div className="aspect-square"><img src={product.image} alt={product.name} className="w-full h-full object-cover" /></div><div className="p-3"><p className="text-sm font-medium line-clamp-1">{product.name}</p><p className="text-sm font-bold mt-1">Rs.{(product.salePrice || product.price || 0).toLocaleString()}</p></div></Link>))}</div>) : (<div className="text-center py-12 bg-white rounded-xl border"><Heart className="mx-auto text-gray-300 mb-4" size={48} /><h3 className="font-bold mb-2">Wishlist is empty</h3><Link to="/shop" className="inline-flex items-center gap-2 bg-black text-white px-6 py-2 rounded-full text-sm font-medium">Explore Products</Link></div>)}
              </div>
            )}
            {activeTab === 'settings' && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Account Settings</h2>
                <div className="bg-white rounded-xl p-6 border space-y-6">
                  <div><label className="block text-sm font-medium mb-1">Full Name</label><input type="text" defaultValue={user?.name} className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10" /></div>
                  <div><label className="block text-sm font-medium mb-1">Email</label><input type="email" defaultValue={user?.email} className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10" /></div>
                  <div><label className="block text-sm font-medium mb-1">Phone</label><input type="tel" placeholder="+92 300 1234567" className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10" /></div>
                  <button className="bg-black text-white px-8 py-3 rounded-full font-bold text-sm hover:bg-gray-800">SAVE CHANGES</button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
