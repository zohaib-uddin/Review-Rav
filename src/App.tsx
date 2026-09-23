import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
import CartSidebar from './components/cart/CartSidebar';
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
import AdminLogin from './pages/admin/AdminLogin';
import About from './pages/About';
import TrackOrder from './pages/TrackOrder';
import Contact from './pages/Contact';
import FAQ from './pages/FAQ';
import SizeGuide from './pages/SizeGuide';
import OrderDetail from './pages/OrderDetail';
import { useStore } from './store/useStore';

/**
 * Storefront Layout:
 * Wraps customer-facing storefront pages with the main customer Navbar, CartSidebar,
 * AccessibilityWrapper, Storefront Footer, ScrollToTop, and CookieConsent.
 * Admin pages are completely excluded from this layout.
 */
function StorefrontLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <Navbar />
      <CartSidebar />
      <AccessibilityWrapper>
        <Suspense fallback={<Loading />}>
          {children}
        </Suspense>
      </AccessibilityWrapper>
      <Footer />
      <ScrollToTop />
      <CookieConsent />
    </div>
  );
}

function App() {
  const user = useStore(state => state.user);

  // Initialize PWA
  useEffect(() => {
    generateManifest();
    registerServiceWorker();
  }, []);

  // When a user logs in or is restored from localStorage, sync their persistent cart, wishlist, and orders
  useEffect(() => {
    if (user && user.id) {
      useStore.getState().fetchCart();
      useStore.getState().fetchWishlist();
      useStore.getState().fetchOrders();
    }
  }, [user?.id]);

  return (
    <Router>
      <ErrorBoundary>
        <SEO />
        <CartProvider>
          <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
          <Routes>
            {/* =================================================================
                ADMIN PORTAL ROUTES
                Completely isolated from frontend Navbar, Footer, and CartSidebar.
                Admin has its own dedicated Admin Navbar, responsive toggleable 
                Sidebar, and Admin Footer.
                ================================================================= */}
            <Route 
              path="/admin" 
              element={user?.role === 'admin' ? <AdminPanel /> : <Navigate to="/admin/login" replace />} 
            />
            <Route 
              path="/admin/:section" 
              element={user?.role === 'admin' ? <AdminPanel /> : <Navigate to="/admin/login" replace />} 
            />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/signin" element={<Navigate to="/admin/login" replace />} />

            {/* =================================================================
                CUSTOMER STOREFRONT ROUTES
                Wrapped in StorefrontLayout with customer Navbar and Footer.
                ================================================================= */}
            <Route path="/" element={<StorefrontLayout><Home /></StorefrontLayout>} />
            <Route path="/shop" element={<StorefrontLayout><Shop /></StorefrontLayout>} />
            <Route path="/shop-all" element={<StorefrontLayout><ShopAllPage /></StorefrontLayout>} />
            
            {/* Category and Product Collections */}
            <Route path="/collections/:categorySlug" element={<StorefrontLayout><CollectionPage /></StorefrontLayout>} />
            <Route path="/products/:productSlug" element={<StorefrontLayout><ProductDetail /></StorefrontLayout>} />
            
            {/* Legacy URL fallbacks for backwards compatibility */}
            <Route path="/shop/:categorySlug" element={<StorefrontLayout><CollectionPage /></StorefrontLayout>} />
            <Route path="/product/:id" element={<StorefrontLayout><ProductDetail /></StorefrontLayout>} />
            
            {/* Cart, Checkout & Customer Portal */}
            <Route path="/cart" element={<StorefrontLayout><Cart /></StorefrontLayout>} />
            <Route path="/checkout" element={<StorefrontLayout><Checkout /></StorefrontLayout>} />
            <Route path="/login" element={<StorefrontLayout><Login /></StorefrontLayout>} />
            <Route path="/register" element={<StorefrontLayout><Register /></StorefrontLayout>} />
            <Route 
              path="/dashboard" 
              element={
                <StorefrontLayout>
                  {user ? <CustomerDashboard /> : <Login />}
                </StorefrontLayout>
              } 
            />
            
            {/* Dedicated Order Detail Pages (with user snippet, order ID, and tokenized email access) */}
            <Route path="/order-details/:userSnippet/:orderId" element={<StorefrontLayout><OrderDetail /></StorefrontLayout>} />
            <Route path="/orders/:userSnippet/:orderId" element={<StorefrontLayout><OrderDetail /></StorefrontLayout>} />
            <Route path="/order/:orderId" element={<StorefrontLayout><OrderDetail /></StorefrontLayout>} />
            
            {/* Informational Customer Pages */}
            <Route path="/about" element={<StorefrontLayout><About /></StorefrontLayout>} />
            <Route path="/track-order" element={<StorefrontLayout><TrackOrder /></StorefrontLayout>} />
            <Route path="/contact" element={<StorefrontLayout><Contact /></StorefrontLayout>} />
            <Route path="/faq" element={<StorefrontLayout><FAQ /></StorefrontLayout>} />
            <Route path="/size-guide" element={<StorefrontLayout><SizeGuide /></StorefrontLayout>} />
          </Routes>
        </CartProvider>
      </ErrorBoundary>
    </Router>
  );
}

export default App;
