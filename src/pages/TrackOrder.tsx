import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Package, Truck, CheckCircle, Clock, MapPin, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function TrackOrder() {
  const navigate = useNavigate();
  const [trackingId, setTrackingId] = useState('');
  const [trackingResult, setTrackingResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!trackingId.trim()) {
      setError('Please enter tracking ID');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      // Check if user is logged in (from localStorage or auth context)
      const user = JSON.parse(localStorage.getItem('user') || 'null');
      
      if (!user) {
        // Redirect to login if not authenticated
        navigate('/login', { state: { from: '/track-order' } });
        return;
      }

      const response = await fetch(`http://localhost:3001/api/orders/track/${trackingId}`);
      const data = await response.json();

      if (response.ok && data) {
        // Security check: Only allow user to track their own orders
        if (data.user_id !== user.id && user.role !== 'admin') {
          setError('You can only track your own orders');
          setTrackingResult(null);
          return;
        }

        // Map order status to timeline
        const statusTimeline: Record<string, number> = {
          'pending': 0,
          'processing': 1,
          'shipped': 2,
          'delivered': 3,
          'cancelled': -1
        };

        const currentStatusIndex = statusTimeline[data.status] || 0;

        const timeline = [
          { status: 'Order Placed', date: new Date(data.created_at).toLocaleDateString(), completed: true },
          { status: 'Processing', date: currentStatusIndex >= 1 ? 'In Progress' : 'Pending', completed: currentStatusIndex >= 1 },
          { status: 'Shipped', date: currentStatusIndex >= 2 ? 'On the way' : 'Pending', completed: currentStatusIndex >= 2 },
          { status: 'Delivered', date: currentStatusIndex >= 3 ? 'Completed' : 'Expected in 3-5 days', completed: currentStatusIndex >= 3 },
        ];

        setTrackingResult({
          order_number: data.order_number,
          tracking_id: data.tracking_id,
          status: data.status,
          payment_status: data.payment_status,
          total: data.total,
          created_at: new Date(data.created_at).toLocaleDateString(),
          timeline,
          shipping_method: data.shipping_method,
        });
      } else {
        setError('Order not found. Please check your tracking ID.');
      }
    } catch (err) {
      console.error('Track order error:', err);
      setError('Failed to track order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-display font-bold">Track Your Order</h1>
          <p className="text-gray-500 mt-2 flex items-center justify-center gap-2">
            <Lock size={16} /> Login required to track orders
          </p>
        </motion.div>

        <form onSubmit={handleTrack} className="bg-white rounded-2xl p-6 shadow-sm mb-8">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Package className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={trackingId}
                onChange={e => setTrackingId(e.target.value)}
                placeholder="Enter tracking ID (e.g., TRK-ABC123)"
                className="w-full pl-12 pr-4 py-4 border-2 rounded-xl focus:outline-none focus:border-black transition-colors"
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="px-8 py-4 bg-black text-white rounded-xl font-bold text-sm hover:bg-gray-800 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? <Clock size={18} className="animate-spin" /> : <Search size={18} />} Track
            </button>
          </div>
          {error && (
            <p className="mt-4 text-red-600 text-sm bg-red-50 p-3 rounded-lg">{error}</p>
          )}
        </form>

        {trackingResult && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-sm text-gray-500">Order</p>
                <p className="font-bold text-lg">{trackingResult.order_number}</p>
                <p className="text-xs text-gray-400 font-mono">Tracking: {trackingResult.tracking_id}</p>
              </div>
              <div className="text-right">
                <span className={`inline-block px-4 py-2 rounded-full text-sm font-bold ${
                  trackingResult.status === 'delivered' ? 'bg-green-100 text-green-700' :
                  trackingResult.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  {trackingResult.status.toUpperCase()}
                </span>
                <p className="text-xs text-gray-500 mt-1">Payment: {trackingResult.payment_status}</p>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mb-8">
              <div className="p-4 bg-gray-50 rounded-xl">
                <Truck size={20} className="text-blue-500 mb-1" />
                <p className="text-xs text-gray-500">Shipping Method</p>
                <p className="font-medium text-sm capitalize">{trackingResult.shipping_method || 'Standard'}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <MapPin size={20} className="text-green-500 mb-1" />
                <p className="text-xs text-gray-500">Tracking ID</p>
                <p className="font-medium text-sm font-mono">{trackingResult.tracking_id}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <Clock size={20} className="text-purple-500 mb-1" />
                <p className="text-xs text-gray-500">Order Date</p>
                <p className="font-medium text-sm">{trackingResult.created_at}</p>
              </div>
            </div>

            {/* Timeline */}
            <h3 className="font-bold text-lg mb-4">Order Progress</h3>
            <div className="space-y-0">
              {trackingResult.timeline.map((step: any, i: number) => (
                <div key={i} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step.completed ? 'bg-green-500' : 'bg-gray-200'}`}>
                      {step.completed ? <CheckCircle size={16} className="text-white" /> : <Clock size={16} className="text-gray-400" />}
                    </div>
                    {i < trackingResult.timeline.length - 1 && <div className={`w-0.5 h-12 ${step.completed ? 'bg-green-300' : 'bg-gray-200'}`} />}
                  </div>
                  <div className="pb-8">
                    <p className={`font-medium text-sm ${step.completed ? 'text-black' : 'text-gray-400'}`}>{step.status}</p>
                    <p className="text-xs text-gray-500">{step.date}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-xl">
              <p className="text-sm text-blue-700">
                <strong>Total Amount:</strong> Rs. {parseFloat(trackingResult.total).toLocaleString()}
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}