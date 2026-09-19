import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { Suspense, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import SEO from './components/SEO';
import AccessibilityWrapper from './components/AccessibilityWrapper';
import { ErrorBoundary, Loading } from './components/PerformanceOptimization';
import { ScrollToTop, CookieConsent } from './components/FinalPolish';
import { registerServiceWorker, generateManifest } from './pwa';
import { CartProvider } from './context/CartContext';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ShopAllPage from './pages/ShopAllPage';
import CollectionPage from './pages/CollectionPage';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Register from './pages/Register';
import CustomerDashboard from './pages/CustomerDashboard';
import AdminPanel from './pages/admin/AdminPanel';
import About from './pages/About';
import TrackOrder from './pages/TrackOrder';
import Contact from './pages/Contact';
import FAQ from './pages/FAQ';
import SizeGuide from './pages/SizeGuide';
import { useStore } from './store/useStore';

function App() {
  const user = useStore(state => state.user);

  // Initialize PWA
  useEffect(() => {
    generateManifest();
    registerServiceWorker();
  }, []);

  return (
    <Router>
      <ErrorBoundary>
        <SEO />
        <CartProvider>
          <div className="min-h-screen bg-white flex flex-col">
            <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
            <Navbar />
            <AccessibilityWrapper>
              <Suspense fallback={<Loading />}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/shop" element={<Shop />} />
                  <Route path="/shop-all" element={<ShopAllPage />} />
                  {/* New URL structure */}
                  <Route path="/collections/:categorySlug" element={<CollectionPage />} />
                  <Route path="/products/:productSlug" element={<ProductDetail />} />
                  {/* Legacy routes for backward compatibility */}
                  <Route path="/shop/:categorySlug" element={<CollectionPage />} />
                  <Route path="/product/:id" element={<ProductDetail />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/dashboard" element={user ? <CustomerDashboard /> : <Login />} />
                  <Route path="/admin" element={user?.role === 'admin' ? <AdminPanel /> : <Login />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/track-order" element={<TrackOrder />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/faq" element={<FAQ />} />
                  <Route path="/size-guide" element={<SizeGuide />} />
                </Routes>
              </Suspense>
            </AccessibilityWrapper>
            <Footer />
            <ScrollToTop />
            <CookieConsent />
          </div>
        </CartProvider>
      </ErrorBoundary>
    </Router>
  );
}

export default App;
