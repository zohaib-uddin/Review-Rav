import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Heart, ShoppingBag, User, Menu, X, Shield } from 'lucide-react';
import { useStore } from '../store/useStore';
import MegaMenu from './MegaMenu';
import SearchModal from './SearchModal';
import LanguageSwitcher from './LanguageSwitcher';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const cart = useStore(state => state.cart);
  const wishlist = useStore(state => state.wishlist);
  const user = useStore(state => state.user);
  const categories = useStore(state => state.categories);
  const fetchCategories = useStore(state => state.fetchCategories);
  const navigate = useNavigate();

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (categories.length === 0) {
      fetchCategories();
    }
  }, []);

  const mainCategories = categories.filter(cat => !cat.parent_id);

  return (
    <>
      {/* Announcement Bar */}
      <div className="bg-black text-white text-xs py-2.5 overflow-hidden">
        <div className="animate-marquee whitespace-nowrap flex">
          <span className="mx-8">🔥 FREE SHIPPING ON ORDERS ABOVE Rs.3,000</span>
          <span className="mx-8">⚡ NEW DROPS EVERY WEEK</span>
          <span className="mx-8">💎 PREMIUM STREETWEAR</span>
          <span className="mx-8">🚚 CASH ON DELIVERY AVAILABLE</span>
          <span className="mx-8">↩️ 7-DAY EASY RETURNS</span>
          <span className="mx-8">🔥 FREE SHIPPING ON ORDERS ABOVE Rs.3,000</span>
          <span className="mx-8">⚡ NEW DROPS EVERY WEEK</span>
          <span className="mx-8">💎 PREMIUM STREETWEAR</span>
        </div>
      </div>

      {/* Main Navbar */}
      <motion.nav
        className={`sticky top-0 z-50 transition-all duration-300 ${
          isScrolled ? 'bg-white/95 backdrop-blur-lg shadow-lg' : 'bg-white'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`flex items-center justify-between transition-all duration-300 ${isScrolled ? 'h-16' : 'h-20'}`}>
            {/* Left Side - Search & Mobile Menu */}
            <div className="flex items-center gap-3">
              <button
                className="lg:hidden p-2"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <Search size={20} />
              </button>
            </div>

            {/* Center - Logo */}
            <Link to="/" className="flex items-center">
              <motion.h1
                animate={{
                  fontSize: isScrolled ? '1.5rem' : '2rem',
                }}
                transition={{ duration: 0.3 }}
                className="font-black tracking-tighter font-display"
              >
                RAVENZA
              </motion.h1>
            </Link>

            {/* Right Side - Icons */}
            <div className="flex items-center gap-3">
              <LanguageSwitcher />
              <Link to="/dashboard" className="p-2 hover:bg-gray-100 rounded-full transition-colors hidden sm:block">
                <User size={20} />
              </Link>

              <Link to="/dashboard" className="p-2 hover:bg-gray-100 rounded-full transition-colors relative">
                <Heart size={20} />
                {wishlist.length > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold"
                  >
                    {wishlist.length}
                  </motion.span>
                )}
              </Link>

              <Link to="/cart" className="p-2 hover:bg-gray-100 rounded-full transition-colors relative">
                <ShoppingBag size={20} />
                {cartCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-0.5 -right-0.5 bg-black text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </Link>

              {/* Admin Link */}
              <Link
                to="/admin"
                className="hidden lg:flex items-center gap-1 text-sm font-medium text-purple-600 hover:text-purple-800 transition-colors"
                title="Admin: admin@ravenza.pk / admin123"
              >
                <Shield size={14} />
                <span className="hidden xl:inline">ADMIN</span>
              </Link>
            </div>
          </div>

          {/* Category Navigation - Only on Desktop */}
          <div className="hidden lg:block border-t">
            <div className="flex items-center justify-center gap-8 py-3">
              {mainCategories.map(category => (
                <div
                  key={category.slug}
                  className="relative"
                  onMouseEnter={() => setHoveredCategory(category.slug)}
                  onMouseLeave={() => setHoveredCategory(null)}
                >
                  <Link
                    to={`/collections/${category.slug}`}
                    className="text-sm font-medium text-gray-700 hover:text-black transition-colors flex items-center gap-1"
                  >
                    {category.name}
                    {category.badge && (
                      <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full">
                        {category.badge}
                      </span>
                    )}
                  </Link>

                  {/* Mega Menu */}
                  <AnimatePresence>
                    {hoveredCategory === category.slug && (
                      <MegaMenu category={category} />
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: -300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -300 }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed inset-0 z-50 lg:hidden"
          >
            <div className="absolute inset-0 bg-black/50" onClick={() => setIsMobileMenuOpen(false)} />
            <div className="absolute left-0 top-0 bottom-0 w-80 bg-white shadow-xl overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-xl font-black font-display">RAVENZA</h2>
                  <button onClick={() => setIsMobileMenuOpen(false)}>
                    <X size={24} />
                  </button>
                </div>

                <nav className="space-y-1">
                  {mainCategories.map(category => (
                    <Link
                      key={category.slug}
                      to={`/collections/${category.slug}`}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block text-lg font-medium py-3 border-b border-gray-100"
                    >
                      {category.name}
                      {category.badge && (
                        <span className="ml-2 text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                          {category.badge}
                        </span>
                      )}
                    </Link>
                  ))}
                  <hr className="my-4" />
                  {user ? (
                    <>
                      <Link to="/dashboard" className="block text-lg font-medium py-3 border-b">My Account</Link>
                      {user.role === 'admin' && (
                        <Link to="/admin" className="block text-lg font-medium py-3 text-purple-600 border-b">
                          <Shield size={16} className="inline mr-2" /> Admin Panel
                        </Link>
                      )}
                    </>
                  ) : (
                    <Link to="/login" className="block text-lg font-medium py-3 border-b">Login / Register</Link>
                  )}
                  <div className="mt-6 p-4 bg-purple-50 rounded-xl">
                    <p className="text-xs font-bold text-purple-700 mb-1">ADMIN ACCESS</p>
                    <p className="text-xs text-purple-600">Email: admin@ravenza.pk</p>
                    <p className="text-xs text-purple-600">Password: admin123</p>
                  </div>
                </nav>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
