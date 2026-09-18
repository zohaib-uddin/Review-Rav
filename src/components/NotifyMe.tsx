import { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Check } from 'lucide-react';

interface NotifyMeProps {
  productId: string;
  productName: string;
}

export default function NotifyMe({ productId, productName }: NotifyMeProps) {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    if (!email) return;
    
    setLoading(true);
    try {
      // In production, this would call your API
      // await fetch('/api/notify-me', {
      //   method: 'POST',
      //   body: JSON.stringify({ productId, email, productName }),
      // });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Store in localStorage for demo
      const notifications = JSON.parse(localStorage.getItem('backInStockNotifications') || '[]');
      notifications.push({ productId, email, productName, date: new Date().toISOString() });
      localStorage.setItem('backInStockNotifications', JSON.stringify(notifications));
      
      setSubscribed(true);
    } catch (error) {
      console.error('Failed to subscribe:', error);
    } finally {
      setLoading(false);
    }
  };

  if (subscribed) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3"
      >
        <div className="p-2 bg-green-100 rounded-full">
          <Check className="text-green-600" size={20} />
        </div>
        <div>
          <p className="font-medium text-green-900">You're on the list!</p>
          <p className="text-sm text-green-700">We'll notify you at {email} when this product is back in stock.</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-orange-50 border border-orange-200 rounded-xl p-4"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 bg-orange-100 rounded-full">
          <Bell className="text-orange-600" size={20} />
        </div>
        <div>
          <p className="font-medium text-orange-900">Out of Stock</p>
          <p className="text-sm text-orange-700">Get notified when it's back!</p>
        </div>
      </div>
      
      <div className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          className="flex-1 px-4 py-2 border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
        />
        <button
          onClick={handleSubscribe}
          disabled={!email || loading}
          className="px-6 py-2 bg-orange-600 text-white rounded-lg font-bold text-sm hover:bg-orange-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {loading ? 'Subscribing...' : 'Notify Me'}
        </button>
      </div>
    </motion.div>
  );
}
