import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { Search, Heart, ShoppingBag, User, Menu, X, Shield, ChevronLeft, ChevronRight } from 'lucide-react';
import { useStore } from '../store/useStore';
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
      {/* Announcement Bar with Carousel */}
      <AnimatePresence>
        {showAnnouncement && (
          <motion.div
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -60, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-gradient-to-r from-purple-900 via-black to-purple-900 text-white text-sm py-3 overflow-hidden relative"
          >
            <div className="max-w-7xl mx-auto px-4 flex items-center justify-center gap-4">
              <button
                onClick={prevSlide}
                className="absolute left-2 p-1 hover:bg-white/10 rounded-full transition-colors z-10"
                aria-label="Previous slide"
              >
                <ChevronLeft size={18} strokeWidth={1.5} />
              </button>
              
              <div className="overflow-hidden flex-1 text-center">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={currentSlide}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="font-medium tracking-wide"
                  >
                    {announcementSlides[currentSlide]}
                  </motion.p>
                </AnimatePresence>
              </div>
              
              <button
                onClick={nextSlide}
                className="absolute right-2 p-1 hover:bg-white/10 rounded-full transition-colors z-10"
                aria-label="Next slide"
              >
                <ChevronRight size={18} strokeWidth={1.5} />
              </button>
            </div>
            
            {/* Slide indicators */}
            <div className="flex justify-center gap-2 mt-2">
              {announcementSlides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    idx === currentSlide ? 'bg-white w-4' : 'bg-white/40'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`flex items-center justify-between transition-all duration-300 ${isScrolled ? 'h-16' : 'h-20'}`}>
            {/* Left Side - Search Icon (Far Left) */}
            <div className="flex items-center gap-2">
              <button
                className="lg:hidden p-2"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Search"
              >
                <Search size={20} />
              </button>
            </div>

            {/* Center - Logo with Dynamic Scale */}
            <Link to="/" className="flex items-center" ref={logoRef}>
              <motion.h1
                style={{ scale: logoScale, fontSize: logoFontSize }}
                className="font-black tracking-tighter font-display transition-transform duration-300 origin-center"
              >
                RAVENZA
              </motion.h1>
            </Link>

            {/* Right Side - Tightly Grouped Icons */}
            <div className="flex items-center gap-0">
              {/* Admin Icon - Before Profile */}
              {user?.role === 'admin' && (
                <Link
                  to="/admin/signin"
                  className="p-2 hover:bg-gray-100 transition-colors"
                  title="Admin Panel"
                >
                  <Shield size={18} className="text-purple-600" />
                </Link>
              )}
              
              {/* Profile Icon */}
              <Link to="/dashboard" className="p-2 hover:bg-gray-100 transition-colors">
                <User size={18} />
              </Link>

              {/* Wishlist Icon */}
              <Link to="/dashboard/wishlist" className="p-2 hover:bg-gray-100 transition-colors relative">
                <Heart size={18} />
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

              {/* Cart Icon */}
              <Link to="/cart" className="p-2 hover:bg-gray-100 transition-colors relative">
                <ShoppingBag size={18} />
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
                        <Link to="/admin/signin" className="block text-lg font-medium py-3 text-purple-600 border-b">
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
