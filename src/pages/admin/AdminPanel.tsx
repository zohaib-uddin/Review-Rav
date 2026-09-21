import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { 
  LayoutDashboard, Package, ShoppingBag, 
  Search, Edit, Trash2, Plus, Eye, Globe, LogOut,
  DollarSign, Box, AlertTriangle, Shield, Users, 
  BarChart3, TrendingUp, ChevronDown, FileText,
  Percent, MessageSquare, Star, BookOpen, Mail,
  Menu, X, ExternalLink, Layers, CheckCircle2,
  RefreshCw, SlidersHorizontal, Bell, Check
} from 'lucide-react';
import { useStore, Product, Order } from '../../store/useStore';
import { api } from '../../services/api';
import ProductForm from '../../components/admin/ProductForm';
import {
  AdminProducts,
  AdminCategories,
  AdminCollections,
  AdminReviews,
  AdminJournal,
  AdminOrders,
  AdminNewsletter,
  AnalyticsDashboard,
  InventoryManager,
  StockAlerts,
  EmailMarketing,
  AdminCustomers,
  AdminDiscounts,
  AdminAuditLogs,
} from '../../components/admin';

export default function AdminPanel() {
  const navigate = useNavigate();
  const { 
    user, 
    products, 
    orders, 
    categories, 
    reviews, 
    logout, 
    fetchProducts, 
    fetchOrders, 
    fetchCategories 
  } = useStore();

  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [inventorySubTab, setInventorySubTab] = useState<'catalog' | 'stock'>('catalog');

  // Dynamic Admin notifications state
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  // Enforce Administrator role
  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/admin/login', { replace: true });
    }
  }, [user, navigate]);

  // Fetch all data from API on component mount
  useEffect(() => {
    fetchProducts();
    fetchOrders();
    fetchCategories();
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const data = await api.getNotifications();
      if (Array.isArray(data)) {
        setNotifications(data);
      }
    } catch (e) {
      console.warn('Failed to fetch notifications:', e);
    }
  };

  const markNotificationRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      setNotifications(prev => prev.map(n => id === 'all' || n.id === id ? { ...n, is_read: true } : n));
    } catch (e) {
      console.error(e);
    }
  };

  const unreadNotifCount = notifications.filter(n => !n.is_read).length;

  const handleLogout = () => {
    logout();
    navigate('/admin/login', { replace: true });
  };

  const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const lowStockProducts = products.filter(p => (p.stockCount !== undefined ? p.stockCount : 50) < 20);

  // Sections with Product Add/Update merged into Inventory, and Import/FAQ/General removed
  const sections = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'inventory', label: 'Products & Inventory', icon: Package, badge: `${products.length}` },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'stock-alerts', label: 'Stock Alerts', icon: AlertTriangle, badge: lowStockProducts.length > 0 ? `${lowStockProducts.length}` : undefined },
    { id: 'orders', label: 'Orders', icon: ShoppingBag, badge: `${orders.length}` },
    { id: 'categories', label: 'Categories', icon: Box },
    { id: 'collections', label: 'Collections', icon: Layers },
    { id: 'reviews', label: 'Reviews', icon: Star },
    { id: 'journal', label: 'Journal', icon: BookOpen },
    { id: 'newsletter', label: 'Newsletter', icon: Mail },
    { id: 'email-marketing', label: 'Email Marketing', icon: Mail },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'discounts', label: 'Discounts', icon: Percent },
    { id: 'seo', label: 'SEO Settings', icon: Globe },
    { id: 'audit', label: 'Audit Logs', icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900 selection:bg-black selection:text-white">
      {/* =========================================================================
          CUSTOM ADMIN NAVBAR / HEADER (Completely separate from storefront navbar)
          ========================================================================= */}
      <header className="sticky top-0 z-40 bg-zinc-950 text-white border-b border-zinc-800/80 shadow-md">
        <div className="px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Left: Hamburger & Admin Logo */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              id="admin-sidebar-toggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors focus:outline-none"
              title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
              aria-label="Toggle navigation menu"
            >
              <Menu size={20} />
            </button>

            <Link to="/admin" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white text-black flex items-center justify-center font-black text-sm tracking-wider shadow-sm">
                R
              </div>
              <div className="flex flex-col">
                <span className="font-black text-sm uppercase tracking-widest leading-none font-display">Ravenza</span>
                <span className="text-[10px] text-zinc-400 font-mono tracking-wider uppercase mt-0.5">Admin Console</span>
              </div>
            </Link>

            {/* Neon DB Connection Pill */}
            <div className="hidden md:flex items-center gap-2 ml-4 px-3 py-1 bg-zinc-900/90 border border-zinc-800 rounded-full text-xs text-zinc-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-mono text-[11px]">Neon DB Connected</span>
            </div>
          </div>

          {/* Right: Storefront Link, Notification Bell, Admin User Pill, Logout */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Notification Bell Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                className="relative p-2 rounded-xl text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 transition-colors"
                title="System Notifications & Alerts"
              >
                <Bell size={16} />
                {unreadNotifCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm">
                    {unreadNotifCount}
                  </span>
                )}
              </button>

              {showNotifDropdown && (
                <div className="absolute right-0 mt-2 w-80 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-4 z-50 text-xs">
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-zinc-100">Notifications</span>
                      {unreadNotifCount > 0 && (
                        <span className="px-1.5 py-0.5 bg-red-500/20 text-red-400 rounded-md font-mono text-[10px] font-semibold">
                          {unreadNotifCount} unread
                        </span>
                      )}
                    </div>
                    {unreadNotifCount > 0 && (
                      <button
                        onClick={() => markNotificationRead('all')}
                        className="text-[11px] text-zinc-400 hover:text-emerald-400 font-medium transition-colors"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="mt-2 max-h-72 overflow-y-auto space-y-2">
                    {notifications.length === 0 ? (
                      <p className="text-zinc-500 text-center py-4">No notifications</p>
                    ) : (
                      notifications.map(n => (
                        <div
                          key={n.id}
                          onClick={() => {
                            markNotificationRead(n.id);
                            if (n.link) setActiveSection(n.link);
                            setShowNotifDropdown(false);
                          }}
                          className={`p-2.5 rounded-xl border cursor-pointer transition-colors ${
                            n.is_read
                              ? 'bg-zinc-900/50 border-zinc-800/60 text-zinc-400'
                              : 'bg-zinc-800/80 border-zinc-700 text-zinc-200'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className={`font-semibold ${n.type === 'stock' ? 'text-amber-400' : 'text-zinc-200'}`}>
                              {n.title}
                            </span>
                            <span className="text-[10px] text-zinc-500">
                              {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-[11px] mt-1 line-clamp-2 text-zinc-300">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* View Live Storefront */}
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 transition-colors shadow-sm"
              title="Open storefront in new tab"
            >
              <ExternalLink size={13} />
              <span className="hidden sm:inline">View Store</span>
            </a>

            {/* Admin User Chip */}
            <div className="flex items-center gap-2.5 pl-3 border-l border-zinc-800">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-700 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow-inner">
                A
              </div>
              <div className="hidden lg:block text-left leading-tight">
                <div className="text-xs font-bold text-zinc-200">admin@ravenza.pk</div>
                <div className="text-[10px] text-zinc-400">Super Administrator</div>
              </div>
            </div>

            {/* Logout Button */}
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-red-400 hover:text-white hover:bg-red-600/90 transition-all border border-red-900/40"
              title="Sign out of admin console"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* =========================================================================
          MAIN BODY: RESPONSIVE SIDEBAR + CONTENT
          ========================================================================= */}
      <div className="flex-1 flex relative">
        {/* Mobile Backdrop Overlay */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-xs z-30 lg:hidden"
            />
          )}
        </AnimatePresence>

        {/* Sidebar */}
        <aside
          className={`
            fixed lg:sticky top-16 z-30 h-[calc(100vh-4rem)] bg-zinc-950 text-white border-r border-zinc-800/80 
            transition-all duration-300 ease-in-out flex flex-col justify-between overflow-y-auto
            ${sidebarOpen ? 'w-64 translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-20'}
          `}
        >
          <div className="p-4 space-y-1">
            <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500 font-mono">
              {sidebarOpen ? 'Administration' : 'Menu'}
            </div>

            <nav className="space-y-1">
              {sections.map(section => {
                const isActive = activeSection === section.id;
                return (
                  <button
                    key={section.id}
                    onClick={() => {
                      setActiveSection(section.id);
                      if (window.innerWidth < 1024) setSidebarOpen(false);
                    }}
                    title={!sidebarOpen ? section.label : undefined}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                      isActive 
                        ? 'bg-white text-black shadow-sm font-bold' 
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <section.icon size={17} className={`shrink-0 ${isActive ? 'text-black' : 'text-zinc-400 group-hover:text-white'}`} />
                      {sidebarOpen && <span className="truncate">{section.label}</span>}
                    </div>
                    {sidebarOpen && section.badge && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                        isActive ? 'bg-black text-white' : 'bg-zinc-800 text-zinc-300'
                      }`}>
                        {section.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Bottom Sidebar info */}
          {sidebarOpen && (
            <div className="p-4 border-t border-zinc-800/80 m-2 rounded-xl bg-zinc-900/60">
              <div className="text-[11px] font-semibold text-zinc-300">System Status</div>
              <div className="text-[10px] text-zinc-400 mt-0.5 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Neon PostgreSQL Active</span>
              </div>
            </div>
          )}
        </aside>

        {/* Content Area */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full min-w-0 flex flex-col justify-between">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="flex-1"
          >
            {/* =================================================================
                1. DASHBOARD OVERVIEW
                ================================================================= */}
            {activeSection === 'dashboard' && (
              <div className="space-y-8">
                <div>
                  <h1 className="text-2xl font-bold font-display text-gray-900">Dashboard Overview</h1>
                  <p className="text-xs text-gray-500 mt-1">Real-time revenue, orders, inventory status, and quick storefront actions.</p>
                </div>

                {/* Key Metric Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Total Revenue', value: `Rs.${totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100' },
                    { label: 'Total Orders', value: orders.length.toString(), icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-100' },
                    { label: 'Live Products', value: products.length.toString(), icon: Box, color: 'text-purple-600', bg: 'bg-purple-50 border-purple-100' },
                    { label: 'Low Stock Alerts', value: lowStockProducts.length.toString(), icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-100' },
                  ].map((stat, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={`${stat.bg} border rounded-2xl p-5 shadow-xs flex flex-col justify-between`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-gray-600">{stat.label}</span>
                        <stat.icon className={stat.color} size={20} />
                      </div>
                      <p className="text-2xl font-black font-display text-gray-900">{stat.value}</p>
                    </motion.div>
                  ))}
                </div>

                {/* Quick Actions Bar */}
                <div className="grid md:grid-cols-3 gap-4">
                  <button
                    onClick={() => {
                      setEditingProduct(null);
                      setShowProductForm(true);
                    }}
                    className="p-5 bg-white rounded-2xl border-2 border-dashed border-gray-300 hover:border-black transition-all text-left shadow-xs group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                      <Plus size={20} />
                    </div>
                    <p className="font-bold text-sm text-gray-900">+ Add New Product</p>
                    <p className="text-xs text-gray-500 mt-0.5">Launch product wizard with sizes, matrix & size guide</p>
                  </button>

                  <button
                    onClick={() => setActiveSection('inventory')}
                    className="p-5 bg-white rounded-2xl border border-gray-200 hover:border-black transition-all text-left shadow-xs"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gray-100 text-black flex items-center justify-center mb-3">
                      <Package size={20} />
                    </div>
                    <p className="font-bold text-sm text-gray-900">Manage Catalog & Stock</p>
                    <p className="text-xs text-gray-500 mt-0.5">Quickly adjust prices, edit items, or manage inventory</p>
                  </button>

                  <button
                    onClick={() => setActiveSection('orders')}
                    className="p-5 bg-white rounded-2xl border border-gray-200 hover:border-black transition-all text-left shadow-xs"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gray-100 text-black flex items-center justify-center mb-3">
                      <ShoppingBag size={20} />
                    </div>
                    <p className="font-bold text-sm text-gray-900">Fulfill Orders ({orders.length})</p>
                    <p className="text-xs text-gray-500 mt-0.5">Update shipment status & view tracking details</p>
                  </button>
                </div>

                {/* Recent Orders List */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-sm uppercase tracking-wider text-gray-800">Recent Customer Orders</h3>
                    <button
                      onClick={() => setActiveSection('orders')}
                      className="text-xs font-semibold text-black hover:underline"
                    >
                      View All Orders →
                    </button>
                  </div>
                  {orders.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b text-gray-500 uppercase tracking-wider text-[11px]">
                            <th className="text-left py-3 px-3">Order Number</th>
                            <th className="text-left py-3 px-3">Date</th>
                            <th className="text-left py-3 px-3">Customer</th>
                            <th className="text-left py-3 px-3">Total</th>
                            <th className="text-left py-3 px-3">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {orders.slice(-5).reverse().map(order => (
                            <tr key={order.id} className="hover:bg-gray-50/60 transition-colors">
                              <td className="py-3 px-3 font-mono font-bold text-gray-900">{order.order_number}</td>
                              <td className="py-3 px-3 text-gray-500">{new Date(order.date).toLocaleDateString()}</td>
                              <td className="py-3 px-3 text-gray-700">{order.shipping_address?.full_name || order.email || 'Customer'}</td>
                              <td className="py-3 px-3 font-bold text-gray-900">Rs.{order.total.toLocaleString()}</td>
                              <td className="py-3 px-3">
                                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                                  order.status === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                                  order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                                  'bg-amber-100 text-amber-800'
                                }`}>
                                  {order.status.toUpperCase()}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-xs py-4 text-center">No orders registered yet.</p>
                  )}
                </div>

                {/* Low Stock Alerts */}
                {lowStockProducts.length > 0 && (
                  <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-5">
                    <h3 className="font-bold text-xs uppercase tracking-wider text-amber-900 mb-3 flex items-center gap-2">
                      <AlertTriangle size={16} /> Urgent Stock Replenishment Required ({lowStockProducts.length})
                    </h3>
                    <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {lowStockProducts.slice(0, 6).map(p => (
                        <div key={p.id} className="flex justify-between items-center text-xs bg-white p-3 rounded-xl border border-amber-200/80 shadow-2xs">
                          <span className="font-semibold truncate mr-2">{p.name}</span>
                          <span className="font-mono font-bold text-amber-700 shrink-0 bg-amber-100 px-2 py-0.5 rounded">
                            {p.stockCount || 0} left
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* =================================================================
                2. MERGED: PRODUCTS & INVENTORY
                ================================================================= */}
            {activeSection === 'inventory' && (
              <div className="space-y-6">
                {/* Header with Sub-tab Switcher & Add Product Action */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
                  <div>
                    <h1 className="text-2xl font-bold font-display text-gray-900">Products & Inventory</h1>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Merged product catalog management, variant pricing, and stock monitoring.
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Switcher */}
                    <div className="flex bg-gray-100 p-1 rounded-xl border border-gray-200">
                      <button
                        onClick={() => setInventorySubTab('catalog')}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          inventorySubTab === 'catalog'
                            ? 'bg-white text-black shadow-xs'
                            : 'text-gray-500 hover:text-black'
                        }`}
                      >
                        All Products ({products.length})
                      </button>
                      <button
                        onClick={() => setInventorySubTab('stock')}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          inventorySubTab === 'stock'
                            ? 'bg-white text-black shadow-xs'
                            : 'text-gray-500 hover:text-black'
                        }`}
                      >
                        Stock & Inventory
                      </button>
                    </div>

                    {/* Quick Add Product Button */}
                    <button
                      onClick={() => {
                        setEditingProduct(null);
                        setShowProductForm(true);
                      }}
                      className="px-4 py-2 bg-black hover:bg-zinc-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
                    >
                      <Plus size={15} />
                      <span>Add Product</span>
                    </button>
                  </div>
                </div>

                {/* Sub-tab 1: All Products (Catalog, Edit, Delete, Flags) */}
                {inventorySubTab === 'catalog' && (
                  <AdminProducts
                    onEditProduct={(product) => {
                      setEditingProduct(product);
                      setShowProductForm(true);
                    }}
                    onAddProduct={() => {
                      setEditingProduct(null);
                      setShowProductForm(true);
                    }}
                  />
                )}

                {/* Sub-tab 2: Stock & Inventory Management */}
                {inventorySubTab === 'stock' && (
                  <InventoryManager />
                )}
              </div>
            )}

            {/* =================================================================
                3. OTHER SECTIONS (ANALYTICS, ORDERS, CATEGORIES, ETC.)
                ================================================================= */}
            {activeSection === 'analytics' && <AnalyticsDashboard />}
            {activeSection === 'stock-alerts' && <StockAlerts />}
            {activeSection === 'orders' && <AdminOrders />}
            {activeSection === 'categories' && <AdminCategories />}
            {activeSection === 'collections' && <AdminCollections />}
            {activeSection === 'reviews' && <AdminReviews />}
            {activeSection === 'journal' && <AdminJournal />}
            {activeSection === 'newsletter' && <AdminNewsletter />}
            {activeSection === 'email-marketing' && <EmailMarketing />}
            {activeSection === 'customers' && <AdminCustomers />}
            {activeSection === 'discounts' && <AdminDiscounts />}
            {activeSection === 'audit' && <AdminAuditLogs />}

            {/* SEO */}
            {activeSection === 'seo' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-bold font-display text-gray-900">Search Engine Optimization</h1>
                  <p className="text-xs text-gray-500 mt-1">Configure global meta tags and OpenGraph previews.</p>
                </div>
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs space-y-5">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">Site Title</label>
                    <input type="text" defaultValue="Ravenza - Premium Streetwear" className="w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:border-black" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">Meta Description</label>
                    <textarea defaultValue="Pakistan's premium streetwear brand." className="w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:border-black h-24" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">Keywords</label>
                    <input type="text" defaultValue="streetwear, clothing, fashion, pakistan, ravenza" className="w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:border-black" />
                  </div>
                  <div className="border rounded-xl p-4 bg-gray-50">
                    <p className="text-[11px] text-gray-500 mb-2 font-bold uppercase tracking-wider">Search Snippet Preview:</p>
                    <p className="text-blue-700 text-base font-medium">Ravenza - Premium Streetwear</p>
                    <p className="text-emerald-700 text-xs font-mono">https://ravenza.pk</p>
                    <p className="text-gray-600 text-xs mt-1">Pakistan's premium streetwear brand. Discover co-ord sets, graphic tees, and more.</p>
                  </div>
                  <button className="bg-black text-white px-6 py-2.5 rounded-xl font-bold text-xs hover:bg-zinc-800 transition-colors">
                    Save SEO Settings
                  </button>
                </div>
              </div>
            )}
          </motion.div>

          {/* ===================================================================
              CUSTOM ADMIN FOOTER (Completely separate from storefront footer)
              =================================================================== */}
          <footer className="mt-12 pt-6 border-t border-gray-200 text-xs text-gray-500 flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="font-bold text-gray-800 uppercase tracking-wider">RAVENZA Admin Console</span>
              <span className="text-gray-300">•</span>
              <span className="text-emerald-700 font-medium flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Connected to Neon PostgreSQL
              </span>
              <span className="text-gray-300">•</span>
              <span>v2.4 Enterprise</span>
            </div>

            <div className="flex items-center gap-4 text-[11px] text-gray-400">
              <a href="/" target="_blank" rel="noopener noreferrer" className="hover:text-black transition-colors font-medium">
                Storefront ↗
              </a>
              <span>•</span>
              <button onClick={() => setActiveSection('audit')} className="hover:text-black transition-colors">
                Audit Trail
              </button>
              <span>•</span>
              <span>Strict RBAC Active</span>
            </div>
          </footer>
        </main>
      </div>

      {/* Product Form Modal (With Subcategory Dropdowns & Size Guide Support) */}
      {showProductForm && (
        <ProductForm 
          product={editingProduct} 
          onClose={() => { 
            setShowProductForm(false); 
            setEditingProduct(null); 
            fetchProducts();
          }} 
        />
      )}
    </div>
  );
}
