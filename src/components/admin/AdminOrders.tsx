import React, { useState, useEffect, useMemo } from 'react';
import { 
  Eye, Package, Search, Filter, Download, MessageCircle, 
  Printer, CheckCircle2, Clock, Truck, Check, AlertCircle, 
  RefreshCw, MapPin, User, Phone, Mail, FileText, ChevronRight 
} from 'lucide-react';
import { useStore, Order } from '../../store/useStore';
import api from '../../services/api';

export default function AdminOrders() {
  const { orders: storeOrders, fetchOrders, updateOrderStatus: storeUpdateOrderStatus } = useStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    if (storeOrders && storeOrders.length > 0) {
      setOrders(storeOrders);
    }
  }, [storeOrders]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      await fetchOrders();
      const freshOrders = await api.getOrders();
      if (Array.isArray(freshOrders)) {
        setOrders(freshOrders);
      }
    } catch (e) {
      console.warn('Failed to load orders:', e);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg: string) => {
    setFeedbackNotice(msg);
    setTimeout(() => setFeedbackNotice(null), 3000);
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      // Optimistic update
      setOrders(prev => prev.map(o => (o.id === orderId || o.order_number === orderId) ? { ...o, status: newStatus } : o));
      if (selectedOrder && (selectedOrder.id === orderId || selectedOrder.order_number === orderId)) {
        setSelectedOrder((prev: any) => ({ ...prev, status: newStatus }));
      }

      await api.updateOrderStatus(orderId, newStatus);
      if (storeUpdateOrderStatus) {
        storeUpdateOrderStatus(orderId, newStatus as any);
      }
      showToast(`Order status updated to ${newStatus.toUpperCase()}`);
    } catch (err) {
      console.error('Failed to update status:', err);
      loadOrders();
    } finally {
      setUpdatingId(null);
    }
  };

  const handlePaymentStatusChange = async (orderId: string, newPaymentStatus: string) => {
    setUpdatingId(orderId);
    try {
      setOrders(prev => prev.map(o => (o.id === orderId || o.order_number === orderId) ? { ...o, payment_status: newPaymentStatus } : o));
      if (selectedOrder && (selectedOrder.id === orderId || selectedOrder.order_number === orderId)) {
        setSelectedOrder((prev: any) => ({ ...prev, payment_status: newPaymentStatus }));
      }

      await api.updateOrderPaymentStatus(orderId, newPaymentStatus);
      showToast(`Payment status updated to ${newPaymentStatus.toUpperCase()}`);
    } catch (err) {
      console.error('Failed to update payment status:', err);
      loadOrders();
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'shipped':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'processing':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'confirmed':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'cancelled':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-amber-50 text-amber-700 border-amber-200';
    }
  };

  const getPaymentBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return 'bg-emerald-50 text-emerald-800 border-emerald-300';
      case 'refunded':
        return 'bg-purple-50 text-purple-800 border-purple-300';
      case 'unpaid':
      default:
        return 'bg-amber-50 text-amber-800 border-amber-300';
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const orderNum = order.order_number || order.id || '';
      const customerName = order.shipping_address?.full_name || order.shipping_address?.firstName || order.user_name || '';
      const customerPhone = order.shipping_address?.phone || '';
      const customerEmail = order.email || order.shipping_address?.email || '';

      const matchSearch = 
        orderNum.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customerPhone.includes(searchQuery) ||
        customerEmail.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchSearch) return false;

      if (statusFilter === 'all') return true;
      if (statusFilter === 'pending') return order.status === 'pending_verification' || order.status === 'pending';
      return order.status === statusFilter;
    });
  }, [orders, searchQuery, statusFilter]);

  const handleExportCSV = () => {
    const headers = ['Order Number', 'Date', 'Customer Name', 'Phone', 'City', 'Status', 'Payment Method', 'Total'];
    const rows = filteredOrders.map(o => [
      o.order_number || o.id,
      new Date(o.date || o.created_at).toLocaleDateString(),
      o.shipping_address?.full_name || o.shipping_address?.firstName || 'Guest',
      o.shipping_address?.phone || '',
      o.shipping_address?.city || '',
      o.status,
      o.payment_method || 'COD',
      o.total,
    ]);

    const csvContent = [headers, ...rows].map(e => e.map(val => `"${val}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `orders-export-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const openWhatsApp = (order: any) => {
    const rawPhone = order.shipping_address?.phone || '';
    if (!rawPhone) {
      alert('No phone number recorded for this customer.');
      return;
    }
    // Clean phone number: if starts with 0, convert to 92 for Pakistan
    let cleaned = rawPhone.replace(/\D/g, '');
    if (cleaned.startsWith('0')) {
      cleaned = '92' + cleaned.substring(1);
    } else if (!cleaned.startsWith('92') && cleaned.length === 10) {
      cleaned = '92' + cleaned;
    }

    const message = encodeURIComponent(
      `Hello ${order.shipping_address?.full_name || order.shipping_address?.firstName || 'Customer'}, thank you for shopping with Ravenza Streetwear! Regarding your order #${order.order_number}: your order is currently ${order.status.toUpperCase()}. Let us know if you have any questions!`
    );
    window.open(`https://wa.me/${cleaned}?text=${message}`, '_blank');
  };

  const printInvoice = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Title & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-display text-gray-900 tracking-tight">Order Fulfillment & Management</h2>
          <p className="text-xs text-gray-500 mt-1">
            Track customer orders, manage statuses, print invoices, and initiate WhatsApp customer support.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={loadOrders}
            className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors"
            title="Refresh Orders"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-black hover:bg-zinc-800 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {feedbackNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2 animate-fade-in">
          <CheckCircle2 size={16} className="text-emerald-600" />
          <span>{feedbackNotice}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <p className="text-xs font-medium text-gray-500">Total Orders</p>
          <p className="text-2xl font-black font-display text-gray-900 mt-0.5">{orders.length}</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <p className="text-xs font-medium text-gray-500">Pending Verification</p>
          <p className="text-2xl font-black font-display text-amber-600 mt-0.5">
            {orders.filter(o => o.status === 'pending_verification' || o.status === 'pending').length}
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <p className="text-xs font-medium text-gray-500">In Transit / Shipped</p>
          <p className="text-2xl font-black font-display text-indigo-600 mt-0.5">
            {orders.filter(o => o.status === 'shipped').length}
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <p className="text-xs font-medium text-gray-500">Successfully Delivered</p>
          <p className="text-2xl font-black font-display text-emerald-600 mt-0.5">
            {orders.filter(o => o.status === 'delivered').length}
          </p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search by order #, customer name, phone, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black"
          />
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-gray-100 rounded-xl border border-gray-200 text-xs w-full sm:w-auto overflow-x-auto">
          {[
            { id: 'all', label: 'All' },
            { id: 'pending', label: 'Pending' },
            { id: 'confirmed', label: 'Confirmed' },
            { id: 'processing', label: 'Processing' },
            { id: 'shipped', label: 'Shipped' },
            { id: 'delivered', label: 'Delivered' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setStatusFilter(f.id)}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all whitespace-nowrap ${
                statusFilter === f.id ? 'bg-white text-black shadow-xs' : 'text-gray-500 hover:text-black'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50/80 border-b border-gray-100 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="p-4">Order Number</th>
                <th className="p-4">Date</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Total Amount</th>
                <th className="p-4">Order Status</th>
                <th className="p-4">Payment Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOrders.map(order => {
                const orderNum = order.order_number || order.id;
                const orderDate = new Date(order.date || order.created_at || Date.now()).toLocaleDateString();
                const customerName = order.shipping_address?.full_name || order.shipping_address?.firstName || order.user_name || 'Guest Customer';
                const totalAmount = Number(order.total || 0).toLocaleString();

                return (
                  <tr key={order.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="p-4 font-mono font-bold text-gray-900 text-xs">
                      #{orderNum}
                    </td>

                    <td className="p-4 text-xs text-gray-500">
                      {orderDate}
                    </td>

                    <td className="p-4 text-xs">
                      <p className="font-semibold text-gray-900">{customerName}</p>
                      <p className="text-[11px] text-gray-400">{order.shipping_address?.phone || order.email || 'No phone'}</p>
                    </td>

                    <td className="p-4 text-xs font-bold text-gray-900">
                      Rs. {totalAmount}
                    </td>

                    <td className="p-4">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        disabled={updatingId === order.id}
                        className={`text-xs px-2.5 py-1 rounded-full font-bold border transition-colors cursor-pointer focus:outline-none ${getStatusBadge(order.status)}`}
                      >
                        <option value="pending">Pending</option>
                        <option value="pending_verification">Pending Verification</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>

                    <td className="p-4">
                      <select
                        value={order.payment_status || 'unpaid'}
                        onChange={(e) => handlePaymentStatusChange(order.id, e.target.value)}
                        disabled={updatingId === order.id}
                        className={`text-xs px-2.5 py-1 rounded-full font-bold border transition-colors cursor-pointer focus:outline-none uppercase ${getPaymentBadge(order.payment_status || 'unpaid')}`}
                      >
                        <option value="unpaid">Unpaid</option>
                        <option value="paid">Paid</option>
                        <option value="refunded">Refunded</option>
                      </select>
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="flex items-center gap-1 px-2.5 py-1.5 bg-gray-100 hover:bg-black hover:text-white rounded-lg text-xs font-bold text-gray-700 transition-colors"
                          title="View complete order model"
                        >
                          <Eye size={14} />
                          <span>Details</span>
                        </button>

                        <button
                          onClick={() => openWhatsApp(order)}
                          className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Open WhatsApp chat with customer"
                        >
                          <MessageCircle size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredOrders.length === 0 && !loading && (
          <div className="text-center py-16">
            <Package className="mx-auto text-gray-300 mb-2" size={36} />
            <p className="text-sm font-semibold text-gray-700">No matching orders found</p>
            <p className="text-xs text-gray-400 mt-1">Try selecting a different filter or search term.</p>
          </div>
        )}
      </div>

      {/* =========================================================================
          DETAILED ORDER MODAL
          ========================================================================= */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[92vh] overflow-y-auto shadow-2xl space-y-6 p-6">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b pb-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <h3 className="text-xl font-bold font-display text-gray-900">
                    Order #{selectedOrder.order_number || selectedOrder.id}
                  </h3>
                  <span className={`text-[11px] font-bold px-3 py-1 rounded-full border ${getStatusBadge(selectedOrder.status)}`}>
                    {selectedOrder.status?.toUpperCase()}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1 font-mono">
                  Placed on {new Date(selectedOrder.date || selectedOrder.created_at || Date.now()).toLocaleString()}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => openWhatsApp(selectedOrder)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
                  title="Contact via WhatsApp"
                >
                  <MessageCircle size={14} />
                  <span>WhatsApp</span>
                </button>

                <button
                  onClick={printInvoice}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold transition-colors"
                  title="Print Invoice"
                >
                  <Printer size={14} />
                  <span>Invoice</span>
                </button>

                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-1.5 text-gray-400 hover:text-black hover:bg-gray-100 rounded-xl transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Tracking Timeline */}
            <div className="bg-gray-50/80 p-5 rounded-2xl border border-gray-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-3 flex items-center gap-2">
                <Truck size={15} /> Shipment Tracking & Milestone Timeline
              </h4>

              {selectedOrder.tracking_number && (
                <div className="mb-4 text-xs font-mono text-gray-600 bg-white p-2.5 rounded-xl border border-gray-200 inline-block">
                  Tracking Code: <span className="font-bold text-black">{selectedOrder.tracking_number}</span>
                </div>
              )}

              {/* Milestones */}
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                {[
                  { step: 'Placed', active: true, icon: CheckCircle2 },
                  { step: 'Confirmed', active: ['confirmed', 'processing', 'shipped', 'delivered'].includes(selectedOrder.status), icon: Check },
                  { step: 'Shipped', active: ['shipped', 'delivered'].includes(selectedOrder.status), icon: Truck },
                  { step: 'Delivered', active: selectedOrder.status === 'delivered', icon: Package },
                ].map((m, idx) => (
                  <div key={idx} className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1.5 ${
                      m.active ? 'bg-black text-white' : 'bg-gray-200 text-gray-400'
                    }`}>
                      <m.icon size={14} />
                    </div>
                    <span className={`text-[11px] font-bold ${m.active ? 'text-gray-900' : 'text-gray-400'}`}>
                      {m.step}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Customer & Address Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Customer Info */}
              <div className="p-4 bg-white rounded-2xl border border-gray-200 text-xs space-y-2">
                <h4 className="font-bold text-gray-900 uppercase tracking-wider text-[11px] flex items-center gap-2 border-b pb-2 mb-2">
                  <User size={14} /> Customer Profile
                </h4>
                <p><span className="text-gray-500">Name:</span> <strong className="text-gray-800">{selectedOrder.shipping_address?.full_name || selectedOrder.shipping_address?.firstName || 'Guest'}</strong></p>
                <p><span className="text-gray-500">Phone:</span> <strong className="text-gray-800">{selectedOrder.shipping_address?.phone || 'Not provided'}</strong></p>
                <p><span className="text-gray-500">Email:</span> <strong className="text-gray-800">{selectedOrder.email || selectedOrder.shipping_address?.email || 'Not provided'}</strong></p>
                <p><span className="text-gray-500">Payment Method:</span> <strong className="text-gray-800 uppercase">{selectedOrder.payment_method || 'COD (Cash on Delivery)'}</strong></p>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-gray-500">Payment Status:</span>
                  <span className={`px-2.5 py-0.5 rounded-full font-bold uppercase text-[10px] border ${getPaymentBadge(selectedOrder.payment_status || 'unpaid')}`}>
                    {selectedOrder.payment_status || 'unpaid'}
                  </span>
                </div>
              </div>

              {/* Delivery Address */}
              <div className="p-4 bg-white rounded-2xl border border-gray-200 text-xs space-y-2">
                <h4 className="font-bold text-gray-900 uppercase tracking-wider text-[11px] flex items-center gap-2 border-b pb-2 mb-2">
                  <MapPin size={14} /> Shipping Destination
                </h4>
                <p className="text-gray-800 leading-relaxed">
                  {selectedOrder.shipping_address?.address || selectedOrder.shipping_address?.street || 'No street address specified'}
                </p>
                <p className="text-gray-600">
                  {selectedOrder.shipping_address?.city || ''}{selectedOrder.shipping_address?.postalCode ? `, ${selectedOrder.shipping_address?.postalCode}` : ''}
                </p>
                {selectedOrder.notes && (
                  <p className="text-[11px] text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-100 mt-2">
                    <strong>Delivery Notes:</strong> {selectedOrder.notes}
                  </p>
                )}
              </div>
            </div>

            {/* Order Items */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-2">
                <Package size={15} /> Purchased Garments & Variants
              </h4>
              <div className="border border-gray-200 rounded-2xl overflow-hidden divide-y divide-gray-100">
                {Array.isArray(selectedOrder.items) && selectedOrder.items.length > 0 ? (
                  selectedOrder.items.map((item: any, idx: number) => {
                    const itemName = item.product?.name || item.name || 'Streetwear Item';
                    const itemImg = item.product?.images?.[0] || item.image || 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400';
                    const itemPrice = Number(item.price || item.unit_price || 0);
                    const itemQty = Number(item.quantity || 1);

                    return (
                      <div key={idx} className="p-3.5 flex items-center justify-between text-xs hover:bg-gray-50/50">
                        <div className="flex items-center gap-3">
                          <img
                            src={itemImg}
                            alt={itemName}
                            className="w-12 h-12 object-cover rounded-xl border border-gray-100"
                          />
                          <div>
                            <p className="font-semibold text-gray-900">{itemName}</p>
                            <p className="text-[11px] text-gray-400 mt-0.5">
                              {item.size ? `Size: ${item.size}` : ''} {item.color ? `• Color: ${item.color}` : ''}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900">Rs. {(itemPrice * itemQty).toLocaleString()}</p>
                          <p className="text-[11px] text-gray-400">Qty: {itemQty} × Rs.{itemPrice.toLocaleString()}</p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="p-4 text-xs text-gray-500 text-center">No individual garment breakdown recorded.</p>
                )}
              </div>
            </div>

            {/* Financial Summary */}
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 text-xs space-y-2">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>Rs. {Number(selectedOrder.subtotal || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery & Handling</span>
                <span>Rs. {Number(selectedOrder.shipping_cost || 0).toLocaleString()}</span>
              </div>
              {Number(selectedOrder.discount_amount || 0) > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Discount Applied {selectedOrder.discount_code ? `(${selectedOrder.discount_code})` : ''}</span>
                  <span>-Rs. {Number(selectedOrder.discount_amount).toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold text-gray-900 border-t pt-2 mt-2">
                <span>Grand Total (PKR)</span>
                <span>Rs. {Number(selectedOrder.total || 0).toLocaleString()}</span>
              </div>
            </div>

            {/* Quick Status Update Footer */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-700">Order Status:</span>
                  <select
                    value={selectedOrder.status}
                    onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value)}
                    className="px-3 py-1.5 text-xs font-bold border border-gray-300 rounded-xl focus:outline-none focus:border-black"
                  >
                    <option value="pending">Pending</option>
                    <option value="pending_verification">Pending Verification</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-700">Payment Status:</span>
                  <select
                    value={selectedOrder.payment_status || 'unpaid'}
                    onChange={(e) => handlePaymentStatusChange(selectedOrder.id, e.target.value)}
                    className="px-3 py-1.5 text-xs font-bold border border-gray-300 rounded-xl focus:outline-none focus:border-black uppercase"
                  >
                    <option value="unpaid">Unpaid</option>
                    <option value="paid">Paid</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </div>
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-2 bg-black text-white text-xs font-bold rounded-xl hover:bg-zinc-800 transition-colors"
              >
                Close Order Modal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
