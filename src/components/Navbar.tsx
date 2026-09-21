import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { Search, Heart, ShoppingBag, User, Menu, X, Shield, ChevronLeft, ChevronRight } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useCart } from '../context/CartContext';
import MegaMenu from './MegaMenu';
import SearchModal from './SearchModal';

const announcementSlides = [
  "Flat 10% OFF on Online Payments 💳",
  "Up to 50% OFF Sale 🔥",
  "FREE Shipping Above Rs.3,000 🚚",
  "New Drops Every Week ⚡",
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [showAnnouncement, setShowAnnouncement] = useState(true);
  const { scrollY } = useScroll();
  const logoRef = useRef<HTMLDivElement>(null);
  
  // Logo scale based on scroll position
  const logoScale = useTransform(scrollY, [0, 200], [1, 0.85]);
  const logoFontSize = useTransform(scrollY, [0, 200], ['2.5rem', '1.75rem']);
  
  const cart = useStore(state => state.cart);
  const wishlist = useStore(state => state.wishlist);
  const user = useStore(state => state.user);
  const categories = useStore(state => state.categories);
  const fetchCategories = useStore(state => state.fetchCategories);
  const { openSidebar } = useCart();
  const navigate = useNavigate();
  
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 50);
      
      // Hide announcement on scroll down, show on scroll up
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setShowAnnouncement(false);
      } else if (currentScrollY < lastScrollY) {
        setShowAnnouncement(true);
      }
      setLastScrollY(currentScrollY);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Auto-rotate announcement slides
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % announcementSlides.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (categories.length === 0) {
      fetchCategories();
    }
  }, []);

  const mainCategories = categories.filter(cat => !cat.parent_id);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % announcementSlides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + announcementSlides.length) % announcementSlides.length);

  return (
    <>
      {/* Announcement Bar with Pure Black Background, Reduced Height, No Dots */}
      <AnimatePresence>
        {showAnnouncement && (
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="bg-black text-white text-xs py-2 overflow-hidden relative border-b border-white/10"
          >
            <div className="w-full px-4 flex items-center justify-between gap-3">
              <button
                onClick={prevSlide}
                className="p-1 hover:bg-white/10 rounded-full transition-colors z-10 text-gray-300 hover:text-white"
                aria-label="Previous slide"
              >
                <ChevronLeft size={16} strokeWidth={1.5} />
              </button>
              
              <div className="overflow-hidden flex-1 text-center">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={currentSlide}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="font-medium tracking-wider uppercase text-[11px] sm:text-xs text-gray-100"
                  >
                    {announcementSlides[currentSlide]}
                  </motion.p>
                </AnimatePresence>
              </div>
              
              <button
                onClick={nextSlide}
                className="p-1 hover:bg-white/10 rounded-full transition-colors z-10 text-gray-300 hover:text-white"
                aria-label="Next slide"
              >
                <ChevronRight size={16} strokeWidth={1.5} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Navbar */}
      <motion.nav
        className={`sticky top-0 z-50 transition-all duration-300 ${
          isScrolled ? 'bg-white/95 backdrop-blur-lg shadow-lg' : 'bg-white'
        }`}
      >
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className={`flex items-center justify-between transition-all duration-300 ${isScrolled ? 'h-16' : 'h-20'}`}>
            {/* Left Side - Search Icon (Far Left Corner) */}
            <div className="flex items-center gap-2">
              <button
                className="lg:hidden p-2 hover:bg-gray-100 rounded-full transition-colors"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle navigation menu"
              >
                {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-2.5 hover:bg-gray-100 rounded-full transition-colors flex items-center gap-2"
                aria-label="Search"
              >
                <Search size={20} />
                <span className="hidden md:inline text-xs font-semibold uppercase tracking-wider text-gray-400">Search</span>
              </button>
            </div>

            {/* Center - Logo */}
            <div className="flex-1 flex items-center justify-center">
              <Link to="/" className="flex items-center" ref={logoRef}>
                <motion.h1
                  style={{ scale: logoScale, fontSize: logoFontSize }}
                  className="font-black tracking-tighter font-display transition-transform duration-300 origin-center text-center"
                >
                  RAVENZA
                </motion.h1>
              </Link>
            </div>

            {/* Right Side - Tightly Grouped Icons (Far Right Corner) */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Admin Icon - Before Profile */}
              {user?.role === 'admin' && (
                <Link
                  to="/admin"
                  className="p-2.5 hover:bg-gray-100 rounded-full transition-colors"
                  title="Admin Panel"
                >
                  <Shield size={19} className="text-purple-600" />
                </Link>
              )}
              
              {/* Profile Icon */}
              <Link
                to={user ? (user.role === 'admin' ? '/admin' : '/dashboard') : '/login'}
                className="p-2.5 hover:bg-gray-100 rounded-full transition-colors"
                title={user ? user.name || 'Account' : 'Sign In'}
              >
                <User size={19} />
              </Link>

              {/* Wishlist Icon */}
              <Link
                to="/dashboard/wishlist"
                className="p-2.5 hover:bg-gray-100 rounded-full transition-colors relative"
                title="Wishlist"
              >
                <Heart size={19} />
                {wishlist.length > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-1.5 right-1.5 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold"
                  >
                    {wishlist.length}
                  </motion.span>
                )}
              </Link>

              {/* Cart Icon */}
              <button
                type="button"
                data-cart-icon="true"
                onClick={(e) => {
                  e.preventDefault();
                  openSidebar();
                }}
                className="p-2.5 hover:bg-gray-100 rounded-full transition-colors relative cursor-pointer"
                title="View Bag"
              >
                <ShoppingBag size={19} />
                {cartCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-1.5 right-1.5 bg-black text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </button>
            </div>
          </div>

          {/* Category Navigation - Positioned Relative for MegaMenu anchoring */}
          <div className="hidden lg:block border-t border-gray-100 relative">
            <div className="flex items-center justify-center gap-8 py-3">
              {mainCategories.map(category => (
                <div
                  key={category.slug}
                  className="static"
                  onMouseEnter={() => setHoveredCategory(category.slug)}
                  onMouseLeave={() => setHoveredCategory(null)}
                >
                  <Link
                    to={`/collections/${category.slug}`}
                    className="text-xs font-bold uppercase tracking-wider text-gray-800 hover:text-black transition-colors flex items-center gap-1.5 py-1"
                  >
                    {category.name}
                    {category.badge && (
                      <span className="text-[9px] bg-black text-white px-1.5 py-0.2 rounded font-bold uppercase">
                        {category.badge}
                      </span>
                    )}
                  </Link>

                  {/* Mega Menu - Guaranteed to open below category navigation */}
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
