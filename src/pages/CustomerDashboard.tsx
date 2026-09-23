import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Package,
  Heart,
  LogOut,
  ShoppingBag,
  MapPin,
  Settings,
  Truck,
  ExternalLink,
  Info,
  X,
  Check,
  Plus,
  Trash2,
  Edit2,
  Lock,
  Phone,
  ShieldCheck,
  Calendar,
  CreditCard,
} from 'lucide-react';
import { useStore } from '../store/useStore';
import api from '../services/api';
import toast from 'react-hot-toast';
import { frontendToast } from '../utils/notifications';

export default function CustomerDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, orders, wishlist, products, fetchOrders, fetchWishlist, fetchProducts, addToCart } = useStore();

  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'wishlist' | 'addresses' | 'settings'>('overview');

  // Address State
  const [addresses, setAddresses] = useState<any[]>([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any | null>(null);
  const [addressForm, setAddressForm] = useState({
    address_line_1: '',
    address_line_2: '',
    city: 'Karachi',
    region: 'Sindh',
    postal_code: '',
    phone: '',
    is_default: true,
  });

  // Settings State
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profilePhone, setProfilePhone] = useState(user?.phone || '');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/login?redirect=/dashboard');
    } else {
      setProfileName(user.name || '');
      setProfilePhone(user.phone || '');
    }
  }, [user, navigate]);

  // Handle default tab passed via route state
  useEffect(() => {
    if (location.state && (location.state as any).defaultTab) {
      setActiveTab((location.state as any).defaultTab);
    }
  }, [location.state]);

  // Load user data on mount
  useEffect(() => {
    if (user) {
      fetchOrders();
      fetchWishlist();
      fetchProducts();
      loadAddresses();
    }
  }, [user]);

  const loadAddresses = async () => {
    if (!user) return;
    setIsLoadingAddresses(true);
    try {
      const data = await api.getAddresses(user.id);
      if (Array.isArray(data)) {
        setAddresses(data);
      }
    } catch (err) {
      console.warn('Failed to load addresses:', err);
    } finally {
      setIsLoadingAddresses(false);
    }
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!addressForm.address_line_1.trim() || !addressForm.city.trim() || !addressForm.phone.trim()) {
      toast.error('Please fill in required fields: Address, City, and Phone.');
      return;
    }

    try {
      if (editingAddress) {
        await api.updateAddress(editingAddress.id, {
          user_id: user.id,
          ...addressForm,
        });
        toast.success('Address updated successfully!');
      } else {
        await api.createAddress({
          user_id: user.id,
          ...addressForm,
        });
        toast.success('Address added to your account!');
      }
      setIsAddressModalOpen(false);
      setEditingAddress(null);
      setAddressForm({
        address_line_1: '',
        address_line_2: '',
        city: 'Karachi',
        region: 'Sindh',
        postal_code: '',
        phone: user.phone || '',
        is_default: addresses.length === 0,
      });
      loadAddresses();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save address.');
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return;
    try {
      await api.deleteAddress(id);
      toast.success('Address removed.');
      loadAddresses();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete address.');
    }
  };

  const handleSetDefaultAddress = async (addr: any) => {
    if (!user) return;
    try {
      await api.updateAddress(addr.id, {
        user_id: user.id,
        is_default: true,
      });
      toast.success('Set as primary delivery address.');
      loadAddresses();
    } catch (err: any) {
      toast.error(err.message || 'Failed to set default.');
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSavingProfile(true);
    try {
      const res = await api.updateProfile({
        id: user.id,
        name: profileName.trim(),
        phone: profilePhone.trim(),
      });
      if (res.success && res.user) {
        const updated = { ...user, name: res.user.name, phone: res.user.phone };
        localStorage.setItem('ravenza_user', JSON.stringify(updated));
        useStore.setState({ user: updated });
        toast.success('Profile updated successfully!');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update profile.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const wishlistProducts = products.filter((p) => wishlist.includes(p.id));

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'orders', label: 'My Orders', icon: Package, badge: orders.length },
    { id: 'wishlist', label: 'Wishlist', icon: Heart, badge: wishlist.length },
    { id: 'addresses', label: 'Delivery Addresses', icon: MapPin, badge: addresses.length },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-neutral-50 pb-20 pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb & Welcome Bar */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-4">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-widest text-gray-400">Account Dashboard</span>
            <h1 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-black">
              Welcome, {user.name || user.email.split('@')[0]}
            </h1>
          </div>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 self-start bg-black text-white text-xs font-bold tracking-wider uppercase px-4 py-2.5 rounded-full hover:bg-neutral-800 transition-colors shadow-sm"
          >
            <ShoppingBag size={14} /> Continue Shopping
          </Link>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          
          {/* Sidebar Nav */}
          <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-sm sticky top-24">
              
              {/* User Avatar Circle */}
              <div className="text-center mb-6 pb-6 border-b border-gray-100">
                <div className="w-16 h-16 rounded-full bg-black text-white text-2xl font-black font-display uppercase flex items-center justify-center mx-auto mb-3 shadow-md border-2 border-black">
                  {(user.name || user.email || 'U').trim().charAt(0).toUpperCase()}
                </div>
                <h3 className="font-bold text-base text-gray-900 truncate px-2">{user.name || 'Ravenza Customer'}</h3>
                <p className="text-xs text-gray-500 font-mono truncate px-2">{user.email}</p>
                {user.is_verified && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full mt-2">
                    <ShieldCheck size={12} /> Verified Account
                  </span>
                )}
              </div>

              {/* Navigation Items */}
              <nav className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all ${
                        isActive
                          ? 'bg-black text-white shadow-sm'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-black'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon size={16} strokeWidth={isActive ? 2.5 : 2} />
                        <span>{tab.label}</span>
                      </div>
                      {tab.badge !== undefined && tab.badge > 0 && (
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                            isActive ? 'bg-white text-black' : 'bg-gray-200 text-gray-700'
                          }`}
                        >
                          {tab.badge}
                        </span>
                      )}
                    </button>
                  );
                })}

                <div className="pt-3 border-t border-gray-100 mt-2">
                  <button
                    onClick={() => {
                      logout();
                      frontendToast.logout();
                      navigate('/');
                    }}
                    className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut size={16} /> Sign Out
                  </button>
                </div>
              </nav>
            </div>
          </motion.div>

          {/* Main Tab Content */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-3 space-y-6"
          >
            {/* 1. OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
                      <ShoppingBag size={22} />
                    </div>
                    <div>
                      <p className="text-2xl font-black text-black">{orders.length}</p>
                      <p className="text-xs text-gray-500 font-medium">My Orders</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-red-50 text-red-500 flex items-center justify-center flex-shrink-0">
                      <Heart size={22} />
                    </div>
                    <div>
                      <p className="text-2xl font-black text-black">{wishlist.length}</p>
                      <p className="text-xs text-gray-500 font-medium">Wishlist Items</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                      <MapPin size={22} />
                    </div>
                    <div>
                      <p className="text-2xl font-black text-black">{addresses.length}</p>
                      <p className="text-xs text-gray-500 font-medium">Saved Addresses</p>
                    </div>
                  </div>
                </div>

                {/* Recent Orders Overview */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-base text-gray-900">Recent Orders</h3>
                    <button
                      onClick={() => setActiveTab('orders')}
                      className="text-xs font-bold text-black hover:underline"
                    >
                      View All Orders ({orders.length}) →
                    </button>
                  </div>

                  {orders.length > 0 ? (
                    <div className="divide-y divide-gray-100">
                      {orders.slice(0, 3).map((order) => (
                        <div key={order.id} className="py-3.5 flex items-center justify-between gap-4">
                          <div>
                            <span className="font-mono text-sm font-bold text-black">{order.order_number}</span>
                            <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                              <Calendar size={12} />
                              <span>{new Date(order.date || (order as any).created_at).toLocaleDateString()}</span>
                              <span>•</span>
                              <span>Rs. {(order.total || 0).toLocaleString()}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full ${
                                order.status === 'delivered'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : order.status === 'shipped'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {order.status}
                            </span>
                            <button
                              onClick={() => {
                                const userSnippet = (user?.id || 'usr').toString().slice(0, 8);
                                navigate(`/order-details/${userSnippet}/${order.id || order.order_number}`);
                              }}
                              className="px-2.5 py-1 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
                              title="View Order Details"
                            >
                              Order Info
                            </button>
                            <Link
                              to={`/track-order?orderId=${order.order_number}`}
                              className="inline-flex items-center gap-1 text-xs font-bold bg-neutral-100 hover:bg-black hover:text-white px-3 py-1.5 rounded-lg transition-colors"
                            >
                              <Truck size={13} /> Track
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Package size={36} className="mx-auto text-gray-300 mb-2" />
                      <p className="text-sm text-gray-500">No orders placed under your account yet.</p>
                      <Link
                        to="/shop"
                        className="inline-block mt-3 text-xs font-bold bg-black text-white px-4 py-2 rounded-full hover:bg-neutral-800"
                      >
                        Start Shopping
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 2. MY ORDERS TAB */}
            {activeTab === 'orders' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-black font-display text-gray-900">My Orders</h2>
                    <p className="text-xs text-gray-500">
                      Showing orders placed under your verified account ({orders.length} total)
                    </p>
                  </div>
                  <Link
                    to="/track-order"
                    className="inline-flex items-center gap-1.5 text-xs font-bold border border-gray-300 hover:border-black px-3.5 py-2 rounded-full transition-colors"
                  >
                    <Truck size={14} /> Open Live Tracker
                  </Link>
                </div>

                {orders.length > 0 ? (
                  <div className="space-y-4">
                    {orders.map((order) => {
                      const orderItems: any[] = Array.isArray(order.items) ? order.items : [];
                      return (
                        <div
                          key={order.id}
                          className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200/80 shadow-sm"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4 mb-4">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-base font-bold text-black">{order.order_number}</span>
                                <span
                                  className={`text-[10px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full ${
                                    order.status === 'delivered'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : order.status === 'shipped'
                                      ? 'bg-blue-100 text-blue-800'
                                      : 'bg-amber-100 text-amber-800'
                                  }`}
                                >
                                  {order.status}
                                </span>
                              </div>
                              <p className="text-xs text-gray-400 mt-0.5 font-mono">
                                Placed on {new Date(order.date || (order as any).created_at).toLocaleDateString()}
                              </p>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  const userSnippet = (user?.id || 'usr').toString().slice(0, 8);
                                  navigate(`/order-details/${userSnippet}/${order.id || order.order_number}`);
                                }}
                                className="inline-flex items-center text-xs font-bold bg-gray-100 hover:bg-gray-200 px-3.5 py-1.5 rounded-lg text-gray-800 transition-colors cursor-pointer"
                              >
                                Order Info
                              </button>
                              <Link
                                to={`/track-order?orderId=${order.order_number}`}
                                className="inline-flex items-center gap-1.5 text-xs font-bold bg-black text-white hover:bg-neutral-800 px-3.5 py-1.5 rounded-lg transition-colors"
                              >
                                <Truck size={14} /> Track Order
                              </Link>
                            </div>
                          </div>

                          {/* Order Items Preview */}
                          <div className="space-y-3 mb-4">
                            {orderItems.map((item, idx) => {
                              const prod = item.product || item;
                              const img = prod.image || (prod.images && prod.images[0]) || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=300';
                              const name = prod.name || item.product_name || 'Heavyweight Essential';
                              const qty = item.quantity || 1;
                              const price = prod.salePrice || prod.price || item.unit_price || 0;
                              return (
                                <div key={idx} className="flex items-center justify-between gap-4 text-xs">
                                  <div className="flex items-center gap-3">
                                    <img
                                      src={img}
                                      alt={name}
                                      className="w-12 h-14 rounded-lg object-cover bg-gray-100 flex-shrink-0"
                                    />
                                    <div>
                                      <p className="font-bold text-gray-900">{name}</p>
                                      <p className="text-gray-500 font-mono mt-0.5">
                                        Size: {item.size || 'M'} {item.color ? `• Color: ${item.color}` : ''} • Qty: {qty}
                                      </p>
                                    </div>
                                  </div>
                                  <span className="font-bold font-mono text-gray-900">
                                    Rs. {(price * qty).toLocaleString()}
                                  </span>
                                </div>
                              );
                            })}
                          </div>

                          <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-xs font-medium text-gray-600">
                            <span>Payment: <strong className="uppercase">{order.payment_method || 'Cash on Delivery'}</strong></span>
                            <span className="text-sm text-black">
                              Total: <strong className="font-bold font-mono">Rs. {(order.total || 0).toLocaleString()}</strong>
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
                    <Package size={48} className="mx-auto text-gray-300 mb-3" />
                    <h3 className="font-bold text-base text-gray-900">No Orders Yet</h3>
                    <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                      Any orders you place with this account will automatically appear here with live tracking.
                    </p>
                    <Link
                      to="/shop"
                      className="inline-block mt-4 text-xs font-bold uppercase tracking-wider bg-black text-white px-6 py-2.5 rounded-full hover:bg-neutral-800"
                    >
                      Shop Heavyweight Collection
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* 3. WISHLIST TAB */}
            {activeTab === 'wishlist' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-black font-display text-gray-900">Saved Wishlist</h2>
                    <p className="text-xs text-gray-500">
                      Items saved to your account ({wishlistProducts.length} items)
                    </p>
                  </div>
                </div>

                {wishlistProducts.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {wishlistProducts.map((product) => {
                      const img = product.images?.[0] || product.image || product.image_url || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500';
                      const price = product.salePrice || product.price || product.base_price || 0;
                      return (
                        <div
                          key={product.id}
                          className="bg-white rounded-2xl overflow-hidden border border-gray-200/80 shadow-sm flex flex-col group"
                        >
                          <Link to={`/products/${product.slug || product.id}`} className="block aspect-[4/5] overflow-hidden bg-gray-100 relative">
                            <img
                              src={img}
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          </Link>

                          <div className="p-4 flex-1 flex flex-col justify-between">
                            <div>
                              <Link
                                to={`/products/${product.slug || product.id}`}
                                className="font-bold text-xs sm:text-sm text-gray-900 line-clamp-1 hover:underline"
                              >
                                {product.name}
                              </Link>
                              <p className="font-mono font-bold text-xs sm:text-sm text-black mt-1">
                                Rs. {price.toLocaleString()}
                              </p>
                            </div>

                            <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2">
                              <button
                                onClick={() => {
                                  addToCart(product, 'L', 'Black');
                                  frontendToast.addToCart(product.name);
                                }}
                                className="flex-1 bg-black text-white text-[11px] font-bold tracking-wider uppercase py-2 rounded-lg hover:bg-neutral-800 transition-colors flex items-center justify-center gap-1.5"
                              >
                                <ShoppingBag size={12} /> Add to Bag
                              </button>
                              <button
                                onClick={() => useStore.getState().toggleWishlist(product.id)}
                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                title="Remove from wishlist"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
                    <Heart size={48} className="mx-auto text-gray-300 mb-3" />
                    <h3 className="font-bold text-base text-gray-900">Your Wishlist is Empty</h3>
                    <p className="text-xs text-gray-500 mt-1">
                      Tap the heart icon on any product to save it to your personal wishlist.
                    </p>
                    <Link
                      to="/shop"
                      className="inline-block mt-4 text-xs font-bold uppercase tracking-wider bg-black text-white px-6 py-2.5 rounded-full hover:bg-neutral-800"
                    >
                      Browse Products
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* 4. ADDRESSES TAB */}
            {activeTab === 'addresses' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-black font-display text-gray-900">Delivery Addresses</h2>
                    <p className="text-xs text-gray-500">
                      Manage your saved shipping addresses for instant 1-click checkout.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setEditingAddress(null);
                      setAddressForm({
                        address_line_1: '',
                        address_line_2: '',
                        city: 'Karachi',
                        region: 'Sindh',
                        postal_code: '',
                        phone: user.phone || '',
                        is_default: addresses.length === 0,
                      });
                      setIsAddressModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider bg-black text-white px-4 py-2 rounded-full hover:bg-neutral-800 transition-colors"
                  >
                    <Plus size={14} /> Add Address
                  </button>
                </div>

                {isLoadingAddresses ? (
                  <div className="text-center py-12 text-xs text-gray-500 font-mono">Loading saved addresses...</div>
                ) : addresses.length > 0 ? (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {addresses.map((addr) => (
                      <div
                        key={addr.id}
                        className={`bg-white rounded-2xl p-5 border relative ${
                          addr.is_default ? 'border-black ring-1 ring-black shadow-sm' : 'border-gray-200/80'
                        }`}
                      >
                        {addr.is_default && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-white bg-black px-2.5 py-0.5 rounded-full mb-3">
                            <Check size={11} /> Primary Delivery
                          </span>
                        )}

                        <p className="font-bold text-sm text-gray-900">{addr.address_line_1}</p>
                        {addr.address_line_2 && <p className="text-xs text-gray-500">{addr.address_line_2}</p>}
                        <p className="text-xs text-gray-600 mt-1">
                          {addr.city}, {addr.region || 'Sindh'} {addr.postal_code ? `• ${addr.postal_code}` : ''}
                        </p>
                        <p className="text-xs text-gray-500 mt-2 font-mono flex items-center gap-1.5">
                          <Phone size={12} /> {addr.phone}
                        </p>

                        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                          {!addr.is_default ? (
                            <button
                              onClick={() => handleSetDefaultAddress(addr)}
                              className="text-xs font-bold text-gray-700 hover:text-black hover:underline"
                            >
                              Set as Default
                            </button>
                          ) : (
                            <span className="text-[11px] text-gray-400 font-medium">Default selected</span>
                          )}

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                setEditingAddress(addr);
                                setAddressForm({
                                  address_line_1: addr.address_line_1,
                                  address_line_2: addr.address_line_2 || '',
                                  city: addr.city,
                                  region: addr.region || 'Sindh',
                                  postal_code: addr.postal_code || '',
                                  phone: addr.phone || '',
                                  is_default: addr.is_default,
                                });
                                setIsAddressModalOpen(true);
                              }}
                              className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors"
                              title="Edit address"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteAddress(addr.id)}
                              className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg transition-colors"
                              title="Delete address"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
                    <MapPin size={48} className="mx-auto text-gray-300 mb-3" />
                    <h3 className="font-bold text-base text-gray-900">No Saved Addresses</h3>
                    <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                      Save your home, office, or studio address to expedite your orders.
                    </p>
                    <button
                      onClick={() => setIsAddressModalOpen(true)}
                      className="inline-flex items-center gap-1.5 mt-4 text-xs font-bold uppercase tracking-wider bg-black text-white px-6 py-2.5 rounded-full hover:bg-neutral-800"
                    >
                      <Plus size={14} /> Add Address Now
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* 5. SETTINGS TAB */}
            {activeTab === 'settings' && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-black font-display text-gray-900">Account Settings</h2>
                  <p className="text-xs text-gray-500">Manage your profile details and contact information.</p>
                </div>

                <form onSubmit={handleUpdateProfile} className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-sm space-y-5">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      placeholder="e.g. Hamza Tariq"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-black transition-colors"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                        Email Address
                      </label>
                      <span className="text-[11px] font-mono text-gray-400 flex items-center gap-1">
                        <Lock size={11} /> Read-only (Verified login identity)
                      </span>
                    </div>
                    <div className="relative">
                      <input
                        type="email"
                        value={user.email}
                        disabled
                        readOnly
                        className="w-full px-4 py-3 bg-gray-100 border border-gray-200 text-gray-500 rounded-xl text-sm cursor-not-allowed select-none font-mono"
                      />
                      <div className="absolute right-3.5 top-3.5 text-gray-400">
                        <Lock size={16} />
                      </div>
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1">
                      Email address cannot be modified as it is linked to your OTP login credentials.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                      Phone Number (for Courier & Order Updates)
                    </label>
                    <input
                      type="tel"
                      value={profilePhone}
                      onChange={(e) => setProfilePhone(e.target.value)}
                      placeholder="e.g. 0300 1234567"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-black transition-colors"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSavingProfile}
                      className="bg-black text-white px-8 py-3 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-neutral-800 transition-colors shadow-sm disabled:opacity-50"
                    >
                      {isSavingProfile ? 'Saving Changes...' : 'Save Profile Changes'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Address Create / Edit Modal */}
      <AnimatePresence>
        {isAddressModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative"
            >
              <button
                onClick={() => setIsAddressModalOpen(false)}
                className="absolute top-5 right-5 p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
              >
                <X size={18} />
              </button>

              <h3 className="text-xl font-black font-display text-gray-900 mb-1">
                {editingAddress ? 'Edit Address' : 'Add New Address'}
              </h3>
              <p className="text-xs text-gray-500 mb-5">Saved to your account for fast checkout.</p>

              <form onSubmit={handleSaveAddress} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    value={addressForm.address_line_1}
                    onChange={(e) => setAddressForm({ ...addressForm, address_line_1: e.target.value })}
                    placeholder="House / Plot / Building & Street"
                    required
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs focus:outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Apartment / Suite (Optional)
                  </label>
                  <input
                    type="text"
                    value={addressForm.address_line_2}
                    onChange={(e) => setAddressForm({ ...addressForm, address_line_2: e.target.value })}
                    placeholder="Apartment, Floor, Unit"
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs focus:outline-none focus:border-black"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      value={addressForm.city}
                      onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                      required
                      className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs focus:outline-none focus:border-black"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                      Province / Region
                    </label>
                    <select
                      value={addressForm.region}
                      onChange={(e) => setAddressForm({ ...addressForm, region: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs focus:outline-none focus:border-black bg-white"
                    >
                      <option value="Sindh">Sindh</option>
                      <option value="Punjab">Punjab</option>
                      <option value="Khyber Pakhtunkhwa">KPK</option>
                      <option value="Balochistan">Balochistan</option>
                      <option value="Islamabad Capital Territory">Islamabad</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                      Postal Code
                    </label>
                    <input
                      type="text"
                      value={addressForm.postal_code}
                      onChange={(e) => setAddressForm({ ...addressForm, postal_code: e.target.value })}
                      placeholder="e.g. 75500"
                      className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs focus:outline-none focus:border-black"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                      Contact Phone *
                    </label>
                    <input
                      type="tel"
                      value={addressForm.phone}
                      onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                      placeholder="0300 1234567"
                      required
                      className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs focus:outline-none focus:border-black"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={addressForm.is_default}
                    onChange={(e) => setAddressForm({ ...addressForm, is_default: e.target.checked })}
                    className="rounded accent-black"
                  />
                  <span className="text-xs text-gray-700 font-medium">Set as my primary delivery address</span>
                </label>

                <div className="pt-3">
                  <button
                    type="submit"
                    className="w-full bg-black text-white text-xs font-bold uppercase tracking-widest py-3 rounded-full hover:bg-neutral-800 transition-colors shadow-sm"
                  >
                    {editingAddress ? 'Update Address' : 'Save Address'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
