import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Package, 
  Truck, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ArrowLeft, 
  Printer, 
  ShoppingBag, 
  Mail, 
  Phone, 
  MapPin, 
  CreditCard, 
  Tag, 
  ExternalLink,
  ShieldCheck,
  LogIn
} from 'lucide-react';
import { useStore } from '../store/useStore';
import api from '../services/api';

export default function OrderDetail() {
  const { userSnippet, orderId } = useParams<{ userSnippet?: string; orderId: string }>();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();

  const user = useStore(state => state.user);
  const [order, setOrder] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchOrderDetail() {
      if (!orderId) {
        setError('No order identifier provided in the URL.');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // First try the public/tokenized endpoint which works both for authenticated users and token holders
        const data = await api.getPublicOrderDetails(orderId, token);
        if (isMounted) {
          if (data && (data.id || data.order_number)) {
            setOrder(data);
          } else {
            setError('Order details could not be found.');
          }
        }
      } catch (err: any) {
        console.warn('Public order details fetch failed, checking local store:', err);

        // Fallback: If user is logged in, check user's loaded orders store
        const storeOrders = useStore.getState().orders;
        const matchingOrder = storeOrders.find(
          o => o.id === orderId || o.order_number === orderId || (o as any).tracking_number === orderId
        );

        if (isMounted) {
          if (matchingOrder) {
            setOrder(matchingOrder);
          } else {
            setError(
              err.message || 
              'This order is private. Please sign in to your account or access it using the secure link provided in your order confirmation email.'
            );
          }
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchOrderDetail();

    return () => {
      isMounted = false;
    };
  }, [orderId, token, user?.id]);

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-gray-50/50 px-4 py-16">
        <div className="w-12 h-12 border-3 border-black border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-bold text-gray-700 uppercase tracking-widest">Loading Order Details...</p>
        <p className="text-xs text-gray-400 mt-1">Retrieving official receipt and shipment status</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4 py-16 bg-gray-50/40">
        <motion.div 
          initial={{ opacity: 0, y: 15 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="max-w-md w-full bg-white rounded-3xl p-8 border border-gray-200 shadow-sm text-center"
        >
          <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={32} />
          </div>
          <h2 className="text-xl font-black font-display text-gray-900 mb-2">Order Access Notice</h2>
          <p className="text-xs text-gray-600 mb-6 leading-relaxed">
            {error || 'We could not retrieve details for this order.'}
          </p>

          <div className="space-y-2.5">
            {!user ? (
              <Link
                to={`/login?redirect=/order-details/${userSnippet || 'usr'}/${orderId}${token ? `?token=${encodeURIComponent(token)}` : ''}`}
                className="w-full inline-flex items-center justify-center gap-2 bg-black text-white text-xs font-bold uppercase tracking-wider py-3.5 rounded-full hover:bg-neutral-800 transition-colors shadow-sm"
              >
                <LogIn size={15} /> Sign In to View Order
              </Link>
            ) : null}

            <Link
              to="/shop-all"
              className="w-full inline-flex items-center justify-center gap-2 bg-gray-100 text-gray-800 text-xs font-bold uppercase tracking-wider py-3.5 rounded-full hover:bg-gray-200 transition-colors"
            >
              <ShoppingBag size={15} /> Return to Store
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // Formatting helpers
  const rawDate = order.created_at || order.date || Date.now();
  const formattedDate = new Date(rawDate).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  const shipping = order.shipping_address || {};
  const billing = order.billing_address || shipping;
  const items: any[] = Array.isArray(order.items) ? order.items : [];
  const status = (order.status || 'confirmed').toLowerCase();
  const paymentMethod = order.payment_method || 'Cash on Delivery';
  const paymentStatus = order.payment_status || (paymentMethod.toLowerCase().includes('cod') ? 'Unpaid (COD)' : 'Paid');
  const trackingNumber = order.tracking_number || order.tracking_id || `TRK${order.order_number?.replace(/\D/g, '') || ''}`;
  const contactEmail = order.email || shipping.email || user?.email || 'Registered customer';

  const subtotal = Number(order.subtotal || 0) || items.reduce((sum, item) => {
    const prod = item.product || item;
    const price = Number(prod.salePrice || prod.price || item.unit_price || 0);
    return sum + (price * Number(item.quantity || 1));
  }, 0);
  const shippingCost = Number(order.shipping_cost || 0);
  const discountAmount = Number(order.discount_amount || 0);
  const discountCode = order.discount_code || order.coupon_code || '';
  const total = Number(order.total || (subtotal + shippingCost - discountAmount));

  return (
    <div className="min-h-screen bg-gray-50/50 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Navigation Bar / Status Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 print:hidden">
          <div className="flex items-center gap-2">
            {user ? (
              <button
                onClick={() => navigate('/dashboard')}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-black transition-colors bg-white px-3 py-1.5 rounded-full border border-gray-200 shadow-2xs"
              >
                <ArrowLeft size={14} /> Back to Dashboard
              </button>
            ) : (
              <Link
                to="/shop-all"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-black transition-colors bg-white px-3 py-1.5 rounded-full border border-gray-200 shadow-2xs"
              >
                <ArrowLeft size={14} /> Back to Store
              </Link>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-700 bg-white hover:bg-gray-100 border border-gray-200 px-3.5 py-1.5 rounded-full transition-colors shadow-2xs"
              title="Print official receipt"
            >
              <Printer size={13} /> Print Receipt
            </button>

            {!user && (
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-xs font-bold bg-black text-white px-4 py-1.5 rounded-full hover:bg-neutral-800 transition-colors shadow-sm"
              >
                <LogIn size={13} /> Sign In
              </Link>
            )}
          </div>
        </div>

        {/* Main Order Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden"
        >
          {/* Top Banner: Brand & Order Identity */}
          <div className="bg-black text-white p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2.5 mb-2">
                  <span className="font-mono text-xl sm:text-2xl font-black tracking-wider text-white">
                    #{order.order_number}
                  </span>
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    <CheckCircle2 size={12} /> Confirmed
                  </span>
                </div>
                <p className="text-xs text-gray-300">
                  Placed on <strong className="text-white font-medium">{formattedDate}</strong>
                </p>
              </div>

              <div className="sm:text-right">
                <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400 block mb-1">
                  Customer Email
                </span>
                <span className="font-mono text-xs text-gray-200 bg-white/10 px-3 py-1.5 rounded-lg border border-white/10 inline-block">
                  {contactEmail}
                </span>
              </div>
            </div>
          </div>

          {/* Status Message Box */}
          <div className="p-6 sm:p-8 border-b border-gray-100 bg-gray-50/70">
            <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-2xs">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Package size={20} />
                </div>
                <div className="flex-1">
                  <h3 className="font-display font-black text-base text-gray-900 mb-1">
                    Thank you for your order!
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                    We are getting your order ready to be shipped. We will notify you when it has been sent.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 mt-5 pt-4 border-t border-gray-100 print:hidden">
                <Link
                  to="/shop-all"
                  className="inline-flex items-center gap-2 bg-black hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-full transition-colors shadow-sm"
                >
                  <ShoppingBag size={14} /> Visit Our Store
                </Link>

                <Link
                  to={`/track-order?orderId=${encodeURIComponent(order.order_number)}`}
                  className="inline-flex items-center gap-2 bg-white hover:bg-gray-100 text-gray-800 text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-full border border-gray-300 transition-colors"
                >
                  <Truck size={14} /> Track Shipment ({trackingNumber})
                </Link>
              </div>
            </div>
          </div>

          {/* Order Summary & Customer Info */}
          <div className="p-6 sm:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Left Column: Items Breakdown & Customer Details */}
              <div className="lg:col-span-7 space-y-8">
                
                {/* Items in Order */}
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-gray-900 mb-4 flex items-center gap-2">
                    <Package size={15} /> Order Items ({items.length})
                  </h4>

                  <div className="space-y-3">
                    {items.map((item, idx) => {
                      const prod = item.product || item;
                      const img = prod.image || (prod.images && prod.images[0]) || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=200';
                      const name = prod.name || item.name || item.product_name || 'Ravenza Heavyweight Garment';
                      const size = item.size || (prod.attributes && prod.attributes.Size) || 'M';
                      const color = item.color || item.selectedColor || (prod.attributes && prod.attributes.Color) || 'Black';
                      const qty = Number(item.quantity || 1);
                      const unitPrice = Number(prod.salePrice || prod.price || item.unit_price || item.price || 0);

                      return (
                        <div 
                          key={idx} 
                          className="flex items-center justify-between gap-4 p-3.5 bg-gray-50/80 rounded-2xl border border-gray-100"
                        >
                          <div className="flex items-center gap-3.5">
                            <img
                              src={img}
                              alt={name}
                              className="w-14 h-16 rounded-xl object-cover bg-gray-200 border border-gray-200/80 flex-shrink-0"
                            />
                            <div>
                              <p className="font-bold text-xs sm:text-sm text-gray-900 leading-snug">{name}</p>
                              <div className="flex items-center gap-2 text-[11px] text-gray-500 font-mono mt-1">
                                <span>Size: <strong className="text-gray-900">{size}</strong></span>
                                <span>•</span>
                                <span>Color: <strong className="text-gray-900">{color}</strong></span>
                              </div>
                              <p className="text-[11px] text-gray-500 mt-0.5">
                                Qty: <strong className="text-gray-900">{qty}</strong> &times; Rs. {unitPrice.toLocaleString()}
                              </p>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="font-mono font-black text-sm text-gray-900">
                              Rs. {(unitPrice * qty).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Customer Information Cards */}
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-gray-900 mb-4 flex items-center gap-2">
                    <ShieldCheck size={15} /> Customer Information
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Shipping Address */}
                    <div className="bg-gray-50/80 rounded-2xl p-4 border border-gray-100 text-xs">
                      <p className="font-bold uppercase tracking-wider text-[10px] text-gray-500 mb-2 flex items-center gap-1.5">
                        <MapPin size={12} /> Shipping Address
                      </p>
                      <p className="font-bold text-gray-900 text-sm">
                        {shipping.firstName || shipping.name ? `${shipping.firstName || ''} ${shipping.lastName || ''}`.trim() || shipping.name : 'Customer'}
                      </p>
                      <p className="text-gray-600 mt-1 leading-relaxed">
                        {shipping.address || 'Address provided at checkout'}
                        {shipping.apartment && <span className="block">{shipping.apartment}</span>}
                        <span className="block font-medium">
                          {shipping.city || 'Karachi'}, {shipping.region || shipping.province || 'Sindh'} {shipping.postalCode || shipping.postal_code || ''}
                        </span>
                        <span className="block text-gray-500">Pakistan</span>
                      </p>
                      {shipping.phone && (
                        <p className="font-mono text-gray-900 font-bold mt-2 flex items-center gap-1">
                          <Phone size={11} className="text-gray-400" /> {shipping.phone}
                        </p>
                      )}
                    </div>

                    {/* Billing Address & Payment Method */}
                    <div className="bg-gray-50/80 rounded-2xl p-4 border border-gray-100 text-xs flex flex-col justify-between">
                      <div>
                        <p className="font-bold uppercase tracking-wider text-[10px] text-gray-500 mb-2 flex items-center gap-1.5">
                          <CreditCard size={12} /> Payment Method
                        </p>
                        <p className="font-bold text-gray-900 text-sm uppercase">
                          {paymentMethod}
                        </p>
                        <div className="mt-1.5">
                          <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            paymentStatus.toLowerCase().includes('paid') && !paymentStatus.toLowerCase().includes('unpaid')
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            Status: {paymentStatus}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-gray-200/60">
                        <p className="font-bold uppercase tracking-wider text-[10px] text-gray-500 mb-1">
                          Billing Address
                        </p>
                        <p className="text-gray-600">
                          {order.billing_same_as_shipping !== false ? 'Same as shipping address' : (billing.address || 'Same as shipping address')}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Delivery Instructions / Order Notes if any */}
                  {(order.order_notes || order.notes) && (
                    <div className="mt-3 bg-amber-50/70 border border-amber-200/80 rounded-2xl p-3.5 text-xs text-amber-900">
                      <strong>Delivery Instructions:</strong> {order.order_notes || order.notes}
                    </div>
                  )}
                </div>

              </div>

              {/* Right Column: Financial Summary & Actions */}
              <div className="lg:col-span-5">
                <div className="bg-gray-50 rounded-2xl p-5 sm:p-6 border border-gray-200/80 sticky top-24">
                  <h4 className="text-xs font-black uppercase tracking-wider text-gray-900 mb-4 pb-3 border-b border-gray-200">
                    Payment Breakdown
                  </h4>

                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between items-center text-gray-600">
                      <span>Subtotal</span>
                      <span className="font-mono font-bold text-gray-900">
                        Rs. {subtotal.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-gray-600">
                      <span>Shipping Fee</span>
                      <span className="font-mono font-bold text-gray-900">
                        {shippingCost === 0 ? (
                          <span className="text-emerald-700 font-bold uppercase">Free Shipping</span>
                        ) : (
                          `Rs. ${shippingCost.toLocaleString()}`
                        )}
                      </span>
                    </div>

                    {discountAmount > 0 && (
                      <div className="flex justify-between items-center text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200">
                        <span className="flex items-center gap-1">
                          <Tag size={12} /> Discount {discountCode ? `(${discountCode})` : ''}
                        </span>
                        <span className="font-mono">
                          -Rs. {discountAmount.toLocaleString()}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between items-center text-gray-500 text-[11px]">
                      <span>Taxes & Duties</span>
                      <span className="font-mono font-medium text-gray-700">Included</span>
                    </div>

                    <div className="pt-3 border-t border-gray-200 flex justify-between items-baseline">
                      <div>
                        <span className="text-xs font-black uppercase tracking-wider text-gray-900 block">
                          Total Paid Today:
                        </span>
                        <span className="text-[10px] text-gray-500">
                          {paymentMethod.toLowerCase().includes('cod') ? 'Payable upon delivery at your doorstep' : 'Processed via secure payment'}
                        </span>
                      </div>
                      <span className="text-xl font-mono font-black text-black">
                        Rs. {total.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Shipment Tracking Card */}
                  <div className="mt-6 pt-5 border-t border-gray-200">
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="font-bold text-gray-700 flex items-center gap-1.5">
                        <Truck size={13} /> Carrier Details
                      </span>
                      <span className="font-mono text-gray-500">Trax / TCS Express</span>
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-gray-200/80 text-xs">
                      <p className="text-gray-500 text-[11px]">Tracking ID</p>
                      <p className="font-mono font-bold text-black text-sm select-all">{trackingNumber}</p>
                      <p className="text-[11px] text-gray-400 mt-1">Estimated Delivery: 3-4 Business Days</p>
                    </div>

                    <Link
                      to={`/track-order?orderId=${encodeURIComponent(order.order_number)}`}
                      className="mt-3 w-full inline-flex items-center justify-center gap-2 bg-neutral-900 hover:bg-black text-white text-xs font-bold uppercase tracking-wider py-3 rounded-xl transition-colors shadow-2xs"
                    >
                      <Truck size={13} /> Open Live Shipment Tracker
                    </Link>
                  </div>

                  {/* Customer Care Note */}
                  <div className="mt-6 text-center text-[11px] text-gray-400 leading-relaxed">
                    Need help with your order? Reach our Karachi concierge at{' '}
                    <a href="mailto:support@ravenza.pk" className="text-black font-bold underline">
                      support@ravenza.pk
                    </a>
                  </div>

                </div>
              </div>

            </div>
          </div>

        </motion.div>

      </div>
    </div>
  );
}
