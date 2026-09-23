import { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  AlertCircle,
  LogIn,
  ChevronRight,
  ShieldCheck,
  Calendar,
  CreditCard,
  ShoppingBag,
} from 'lucide-react';
import { useStore } from '../store/useStore';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function TrackOrder() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, orders, fetchOrders } = useStore();

  const [orderNumber, setOrderNumber] = useState(
    searchParams.get('orderId') || searchParams.get('orderNumber') || ''
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [trackingResult, setTrackingResult] = useState<any | null>(null);

  // Auto-fetch if orderId in URL and user is logged in
  useEffect(() => {
    const qOrder = searchParams.get('orderId') || searchParams.get('orderNumber');
    if (qOrder && user) {
      setOrderNumber(qOrder);
      performTrack(qOrder);
    }
  }, [searchParams, user]);

  const performTrack = async (numToTrack: string) => {
    const cleanNum = numToTrack.trim();
    if (!cleanNum) {
      setError('Please provide a valid Order Number (e.g., RVZ-123456).');
      return;
    }

    if (!user) {
      setError('Authentication required. Please sign in to view your live shipment tracking.');
      return;
    }

    setIsLoading(true);
    setError('');
    setTrackingResult(null);

    try {
      const data = await api.trackOrder(cleanNum, user.id, user.email);
      setTrackingResult(data);
    } catch (err: any) {
      setError(
        err.message ||
          'Order not found under your account. Please verify your order number or check your order history in the dashboard.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performTrack(orderNumber);
  };

  const getTimelineSteps = (order: any) => {
    const status = (order.status || 'pending').toLowerCase();
    const orderDate = new Date(order.date || order.created_at || Date.now()).toLocaleDateString();

    const isPending = status === 'pending';
    const isConfirmed = ['confirmed', 'processing', 'shipped', 'delivered'].includes(status);
    const isProcessing = ['processing', 'shipped', 'delivered'].includes(status);
    const isShipped = ['shipped', 'delivered'].includes(status);
    const isDelivered = status === 'delivered';
    const isCancelled = status === 'cancelled';

    if (isCancelled) {
      return [
        { label: 'Order Placed', time: orderDate, completed: true, active: false },
        { label: 'Order Cancelled', time: 'Voided by customer or store', completed: true, active: true, isError: true },
      ];
    }

    return [
      {
        label: 'Order Placed & Received',
        desc: 'Order logged in RAVENZA fulfillment system',
        time: orderDate,
        completed: true,
        active: isPending,
      },
      {
        label: 'Quality Inspected & Confirmed',
        desc: 'Heavyweight bio-washed garments inspected',
        time: isConfirmed ? 'Confirmed' : 'Pending Verification',
        completed: isConfirmed,
        active: isConfirmed && !isProcessing,
      },
      {
        label: 'Dispatched & Handed to Courier',
        desc: 'Assigned to Trax / TCS Express Logistics',
        time: isShipped ? 'In Transit' : 'Packing in Progress',
        completed: isShipped,
        active: isShipped && !isDelivered,
      },
      {
        label: 'Out for Delivery / Delivered',
        desc: 'Handover & Cash on Delivery payment collection',
        time: isDelivered ? 'Delivered' : 'Est: 3-4 Business Days',
        completed: isDelivered,
        active: isDelivered,
      },
    ];
  };

  return (
    <div className="min-h-[85vh] bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <span className="text-[11px] font-mono uppercase tracking-widest text-gray-400 font-bold">
            Live Shipment Status
          </span>
          <h1 className="text-3xl sm:text-4xl font-black font-display tracking-tight text-gray-900 mt-1">
            Track Your Order
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-2 max-w-md mx-auto">
            Real-time delivery milestone tracking for your RAVENZA heavyweight streetwear order.
          </p>
        </motion.div>

        {/* Login Required Notice */}
        {!user ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-8 border border-gray-200/80 shadow-sm text-center"
          >
            <div className="w-14 h-14 bg-black text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
              <ShieldCheck size={26} />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Account Sign-In Required</h2>
            <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto mb-6">
              To protect customer privacy and secure your delivery address, live order tracking is restricted to the
              verified account owner.
            </p>
            <Link
              to={orderNumber ? `/login?redirect=/track-order?orderId=${encodeURIComponent(orderNumber)}` : '/login?redirect=/track-order'}
              className="inline-flex items-center gap-2 bg-black text-white text-xs font-bold uppercase tracking-widest px-7 py-3 rounded-full hover:bg-neutral-800 transition-colors shadow-sm"
            >
              <LogIn size={15} /> Sign In to Track Order
            </Link>
          </motion.div>
        ) : (
          <div>
            {/* Search Input Card */}
            <form onSubmit={handleTrackSubmit} className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-sm mb-6">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                Order Number or Tracking ID
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Package className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    placeholder="Enter order number (e.g., RVZ-928412)"
                    className="w-full pl-11 pr-4 py-3.5 border border-gray-300 rounded-2xl text-xs sm:text-sm font-mono focus:outline-none focus:border-black transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-8 py-3.5 bg-black text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                >
                  <Search size={16} /> {isLoading ? 'Searching...' : 'Track'}
                </button>
              </div>

              {/* Quick Select from User's Past Orders */}
              {orders.length > 0 && (
                <div className="mt-4 pt-3 border-t border-gray-100 flex flex-wrap items-center gap-2 text-xs">
                  <span className="text-gray-400 font-medium">Your Recent Orders:</span>
                  {orders.slice(0, 4).map((o) => (
                    <button
                      key={o.id}
                      type="button"
                      onClick={() => {
                        setOrderNumber(o.order_number);
                        performTrack(o.order_number);
                      }}
                      className="px-2.5 py-1 bg-gray-100 hover:bg-black hover:text-white rounded-lg text-xs font-mono font-bold text-gray-700 transition-colors"
                    >
                      {o.order_number}
                    </button>
                  ))}
                </div>
              )}
            </form>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-200 text-red-700 text-xs p-4 rounded-2xl mb-6 flex items-start gap-3"
              >
                <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Unable to Locate Order</p>
                  <p className="mt-0.5">{error}</p>
                </div>
              </motion.div>
            )}

            {/* Tracking Result Card */}
            {trackingResult && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-sm space-y-6"
              >
                {/* Header Info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-5">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-gray-400 font-bold">
                      Order Reference
                    </span>
                    <h3 className="text-2xl font-black font-display text-gray-900 mt-0.5 font-mono">
                      {trackingResult.order_number}
                    </h3>
                    <p className="text-xs text-gray-500 font-mono mt-0.5">
                      Placed on {new Date(trackingResult.created_at || trackingResult.date).toLocaleDateString()}
                    </p>
                  </div>

                  <span
                    className={`self-start sm:self-auto text-xs font-bold tracking-widest uppercase px-3.5 py-1.5 rounded-full ${
                      trackingResult.status === 'delivered'
                        ? 'bg-emerald-100 text-emerald-800'
                        : trackingResult.status === 'shipped'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {trackingResult.status}
                  </span>
                </div>

                {/* Logistics Key Specs */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-gray-50 rounded-2xl p-4">
                    <Truck size={18} className="text-blue-600 mb-1" />
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Carrier</p>
                    <p className="text-xs font-bold text-gray-900 mt-0.5">
                      {trackingResult.carrier || 'Trax / TCS Express'}
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-2xl p-4">
                    <MapPin size={18} className="text-emerald-600 mb-1" />
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Tracking Code</p>
                    <p className="text-xs font-mono font-bold text-gray-900 mt-0.5">
                      {trackingResult.tracking_number}
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-2xl p-4">
                    <Clock size={18} className="text-purple-600 mb-1" />
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Estimated Delivery</p>
                    <p className="text-xs font-bold text-gray-900 mt-0.5">
                      {trackingResult.estimated_delivery || '3-4 Business Days'}
                    </p>
                  </div>
                </div>

                {/* Milestone Step Timeline */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-4">Shipment Progress</h4>
                  <div className="space-y-4">
                    {getTimelineSteps(trackingResult).map((step, idx, arr) => (
                      <div key={idx} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                              step.isError
                                ? 'bg-red-500 text-white'
                                : step.completed
                                ? 'bg-black text-white'
                                : 'bg-gray-200 text-gray-400'
                            }`}
                          >
                            {step.completed ? <CheckCircle2 size={15} /> : <Clock size={13} />}
                          </div>
                          {idx < arr.length - 1 && (
                            <div
                              className={`w-0.5 h-10 mt-1 ${step.completed ? 'bg-black' : 'bg-gray-200'}`}
                            />
                          )}
                        </div>

                        <div className="pb-3 flex-1">
                          <div className="flex items-center justify-between">
                            <p
                              className={`text-xs font-bold ${
                                step.completed ? 'text-black' : 'text-gray-400'
                              }`}
                            >
                              {step.label}
                            </p>
                            <span className="text-[11px] font-mono text-gray-400">{step.time}</span>
                          </div>
                          {step.desc && <p className="text-[11px] text-gray-500 mt-0.5">{step.desc}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Shipping Destination */}
                {trackingResult.shipping_address && (
                  <div className="pt-4 border-t border-gray-100">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                      Delivery Destination
                    </h4>
                    <div className="text-xs text-gray-600 bg-gray-50 p-4 rounded-2xl leading-relaxed">
                      <p className="font-bold text-black">
                        {trackingResult.shipping_address.firstName} {trackingResult.shipping_address.lastName}
                      </p>
                      <p>{trackingResult.shipping_address.address}</p>
                      <p>
                        {trackingResult.shipping_address.city}, {trackingResult.shipping_address.region || 'Pakistan'} {trackingResult.shipping_address.postalCode}
                      </p>
                      <p className="mt-1 font-mono text-gray-500">{trackingResult.shipping_address.phone}</p>
                    </div>
                  </div>
                )}

                {/* Items in Parcel */}
                {Array.isArray(trackingResult.items) && trackingResult.items.length > 0 && (
                  <div className="pt-4 border-t border-gray-100">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-3">
                      Parcel Contents ({trackingResult.items.length} items)
                    </h4>
                    <div className="space-y-2">
                      {trackingResult.items.map((item: any, i: number) => {
                        const prod = item.product || item;
                        return (
                          <div key={i} className="flex items-center justify-between text-xs bg-gray-50 p-3 rounded-xl">
                            <div className="flex items-center gap-3">
                              <img
                                src={prod.image || (prod.images && prod.images[0]) || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=200'}
                                alt=""
                                className="w-10 h-12 object-cover rounded-lg bg-gray-200"
                              />
                              <div>
                                <p className="font-bold text-gray-900">{prod.name || item.product_name}</p>
                                <p className="text-gray-500 font-mono">
                                  Size: {item.size || 'M'} • Qty: {item.quantity || 1}
                                </p>
                              </div>
                            </div>
                            <span className="font-mono font-bold text-black">
                              Rs. {((prod.salePrice || prod.price || item.unit_price || 0) * (item.quantity || 1)).toLocaleString()}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="pt-2 flex justify-between items-center text-xs">
                  <Link to="/dashboard" className="text-xs font-bold text-black hover:underline flex items-center gap-1">
                    ← Back to Dashboard
                  </Link>
                  <Link to="/contact" className="text-xs text-gray-500 hover:text-black hover:underline">
                    Need Help With Delivery? Contact Us
                  </Link>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
