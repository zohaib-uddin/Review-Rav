import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Facebook, Mail, Phone, MapPin, Shield, Twitter } from 'lucide-react';
import { useStore } from '../store/useStore';

export default function Footer() {
  const categories = useStore(state => state.categories);
  const fetchCategories = useStore(state => state.fetchCategories);

  useEffect(() => {
    if (categories.length === 0) {
      fetchCategories();
    }
  }, []);

  return (
    <footer className="bg-white text-gray-900 border-t border-gray-200">
      {/* Newsletter Section */}
      <div className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <h3 className="text-2xl font-display font-bold mb-3">JOIN THE RAVENZA FAMILY</h3>
          <p className="text-gray-500 mb-6">Subscribe for exclusive drops, early access & special offers.</p>
          <div className="flex max-w-md mx-auto">
            <input 
              type="email" 
              placeholder="Enter your email" 
              className="flex-1 px-4 py-3 bg-gray-50 border border-gray-300 rounded-l-lg focus:outline-none focus:border-black text-sm" 
            />
            <button className="px-6 py-3 bg-black text-white font-semibold rounded-r-lg hover:bg-gray-800 text-sm transition-colors">
              SUBSCRIBE
            </button>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Column */}
          <div>
            <h2 className="text-2xl font-black font-display mb-4">RAVENZA</h2>
            <p className="text-gray-500 text-sm leading-relaxed mb-4">
              Pakistan's premium streetwear brand. Crafted for those who dare to stand out.
            </p>
            {/* Social Media with Original Brand Icons */}
            <div className="flex space-x-3">
              <a 
                href="https://facebook.com/ravenza" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                aria-label="Facebook"
              >
                <Facebook size={18} />
              </a>
              <a 
                href="https://instagram.com/ravenza" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2.5 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 text-white rounded-lg hover:opacity-90 transition-opacity"
                aria-label="Instagram"
              >
                <Instagram size={18} />
              </a>
              <a 
                href="https://tiktok.com/@ravenza" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2.5 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                aria-label="TikTok"
              >
                <Twitter size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4 text-sm tracking-wider">QUICK LINKS</h4>
            <ul className="space-y-2">
              <li><Link to="/shop" className="text-gray-500 hover:text-black text-sm transition-colors">Shop All</Link></li>
              {categories.slice(0, 5).map(cat => (
                <li key={cat.slug}>
                  <Link to={`/collections/${cat.slug}`} className="text-gray-500 hover:text-black text-sm transition-colors">
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help Section */}
          <div>
            <h4 className="font-semibold mb-4 text-sm tracking-wider">HELP</h4>
            <ul className="space-y-2">
              <li><Link to="/track-order" className="text-gray-500 hover:text-black text-sm transition-colors">Track Order</Link></li>
              <li><Link to="/faq" className="text-gray-500 hover:text-black text-sm transition-colors">FAQ</Link></li>
              <li><Link to="/size-guide" className="text-gray-500 hover:text-black text-sm transition-colors">Size Guide</Link></li>
              <li><Link to="/contact" className="text-gray-500 hover:text-black text-sm transition-colors">Contact Us</Link></li>
              <li><Link to="/about" className="text-gray-500 hover:text-black text-sm transition-colors">About Us</Link></li>
            </ul>
          </div>

          {/* Contact Section */}
          <div>
            <h4 className="font-semibold mb-4 text-sm tracking-wider">CONTACT</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-gray-500 text-sm">
                <Mail size={16} className="text-gray-400" /> 
                support@ravenza.pk
              </li>
              <li className="flex items-center gap-2 text-gray-500 text-sm">
                <Phone size={16} className="text-gray-400" /> 
                +92 300 1234567
              </li>
              <li className="flex items-start gap-2 text-gray-500 text-sm">
                <MapPin size={16} className="text-gray-400 mt-0.5" /> 
                Lahore, Pakistan
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Admin Info Bar */}
      <div className="border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-purple-600" />
              <span className="text-xs text-gray-500">Admin:</span>
              <span className="text-xs text-gray-700 font-mono">admin@ravenza.pk</span>
              <span className="text-xs text-gray-400">/</span>
              <span className="text-xs text-gray-700 font-mono">admin123</span>
            </div>
            <Link to="/admin/signin" className="text-xs text-purple-600 hover:text-purple-800 font-medium transition-colors">
              Go to Admin Panel →
            </Link>
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-xs">
            © 2024 Ravenza. All rights reserved. Powered by Neon DB.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-gray-400 text-xs">COD Available</span>
            <span className="text-gray-400 text-xs">|</span>
            <span className="text-gray-400 text-xs">JazzCash / EasyPaisa</span>
          </div>
        </div>
      </div>
    </footer>
  );
}