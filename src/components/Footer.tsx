import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Facebook, Mail, Phone, MapPin, Shield } from 'lucide-react';
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
    <footer className="bg-black text-white">
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <h3 className="text-2xl font-display font-bold mb-3">JOIN THE RAVENZA FAMILY</h3>
          <p className="text-gray-400 mb-6">Subscribe for exclusive drops, early access & special offers.</p>
          <div className="flex max-w-md mx-auto">
            <input type="email" placeholder="Enter your email" className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-l-lg focus:outline-none text-sm" />
            <button className="px-6 py-3 bg-white text-black font-semibold rounded-r-lg hover:bg-gray-200 text-sm">SUBSCRIBE</button>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <h2 className="text-2xl font-black font-display mb-4">RAVENZA</h2>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">Pakistan's premium streetwear brand. Crafted for those who dare to stand out.</p>
            <div className="flex space-x-4">
              <a href="#" className="p-2 bg-white/10 rounded-full hover:bg-white/20"><Instagram size={18} /></a>
              <a href="#" className="p-2 bg-white/10 rounded-full hover:bg-white/20"><Facebook size={18} /></a>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-sm tracking-wider">QUICK LINKS</h4>
            <ul className="space-y-2">
              <li><Link to="/shop" className="text-gray-400 hover:text-white text-sm">Shop All</Link></li>
              {categories.slice(0, 5).map(cat => (
                <li key={cat.slug}>
                  <Link to={`/collections/${cat.slug}`} className="text-gray-400 hover:text-white text-sm">{cat.name}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-sm tracking-wider">HELP</h4>
            <ul className="space-y-2">
              <li><Link to="/track-order" className="text-gray-400 hover:text-white text-sm">Track Order</Link></li>
              <li><Link to="/faq" className="text-gray-400 hover:text-white text-sm">FAQ</Link></li>
              <li><Link to="/size-guide" className="text-gray-400 hover:text-white text-sm">Size Guide</Link></li>
              <li><Link to="/contact" className="text-gray-400 hover:text-white text-sm">Contact Us</Link></li>
              <li><Link to="/about" className="text-gray-400 hover:text-white text-sm">About Us</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-sm tracking-wider">CONTACT</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-gray-400 text-sm"><Mail size={16} /> support@ravenza.pk</li>
              <li className="flex items-center gap-2 text-gray-400 text-sm"><Phone size={16} /> +92 300 1234567</li>
              <li className="flex items-start gap-2 text-gray-400 text-sm"><MapPin size={16} className="mt-0.5" /> Lahore, Pakistan</li>
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-white/5 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-purple-400" />
              <span className="text-xs text-gray-400">Admin:</span>
              <span className="text-xs text-white font-mono">admin@ravenza.pk</span>
              <span className="text-xs text-gray-500">/</span>
              <span className="text-xs text-white font-mono">admin123</span>
            </div>
            <Link to="/admin" className="text-xs text-purple-400 hover:text-purple-300 font-medium">Go to Admin Panel →</Link>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-xs">© 2024 Ravenza. All rights reserved. Powered by Neon DB.</p>
          <div className="flex items-center gap-4">
            <span className="text-gray-500 text-xs">COD Available</span>
            <span className="text-gray-500 text-xs">|</span>
            <span className="text-gray-500 text-xs">JazzCash / EasyPaisa</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
