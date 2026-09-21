import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Package, Truck, CheckCircle, Clock, MapPin } from 'lucide-react';

export default function TrackOrder() {
  const [orderNumber, setOrderNumber] = useState('');
  const [trackingResult, setTrackingResult] = useState<any>(null);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    // Demo tracking
    setTrackingResult({
      order_number: orderNumber || 'ORD-001',
      status: 'shipped',
      estimated_delivery: '3-5 business days',
      tracking_number: 'TRK123456789',
      carrier: 'TCS / Leopards',
      timeline: [
        { status: 'Order Placed', date: '2024-03-20', completed: true },
        { status: 'Confirmed', date: '2024-03-20', completed: true },
        { status: 'Processing', date: '2024-03-21', completed: true },
        { status: 'Shipped', date: '2024-03-22', completed: true },
        { status: 'Delivered', date: 'Expected: 2024-03-26', completed: false },
      ]
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-display font-bold">Track Your Order</h1>
          <p className="text-gray-500 mt-2">Enter your order number to see real-time status</p>
        </motion.div>

        <form onSubmit={handleTrack} className="bg-white rounded-2xl p-6 shadow-sm mb-8">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Package className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={orderNumber}
                onChange={e => setOrderNumber(e.target.value)}
                placeholder="Enter order number (e.g., ORD-001)"
                className="w-full pl-12 pr-4 py-4 border-2 rounded-xl focus:outline-none focus:border-black transition-colors"
              />
            </div>
            <button type="submit" className="px-8 py-4 bg-black text-white rounded-xl font-bold text-sm hover:bg-gray-800 transition-colors flex items-center gap-2">
              <Search size={18} /> Track
            </button>
          </div>
        </form>

        {trackingResult && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-sm text-gray-500">Order</p>
                <p className="font-bold text-lg">{trackingResult.order_number}</p>
              </div>
              <span className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-bold">
                {trackingResult.status.toUpperCase()}
              </span>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mb-8">
              <div className="p-4 bg-gray-50 rounded-xl">
                <Truck size={20} className="text-blue-500 mb-1" />
                <p className="text-xs text-gray-500">Carrier</p>
                <p className="font-medium text-sm">{trackingResult.carrier}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <MapPin size={20} className="text-green-500 mb-1" />
                <p className="text-xs text-gray-500">Tracking #</p>
                <p className="font-medium text-sm font-mono">{trackingResult.tracking_number}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <Clock size={20} className="text-purple-500 mb-1" />
                <p className="text-xs text-gray-500">Est. Delivery</p>
                <p className="font-medium text-sm">{trackingResult.estimated_delivery}</p>
              </div>
            </div>

            {/* Timeline */}
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
          </motion.div>
        )}
      </div>
    </div>
  );
}
