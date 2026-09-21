import { useState, useEffect } from 'react';
import { Eye, Package, Truck, CheckCircle, Clock, X } from 'lucide-react';

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/orders', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId: string, newStatus: string) => {
    setUpdating(orderId);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        // Update local state
        setOrders(prev => prev.map(order => 
          order.id === orderId ? { ...order, status: newStatus } : order
        ));
        alert('Order status updated successfully');
      } else {
        alert('Failed to update order status');
      }
    } catch (error) {
      console.error('Update status error:', error);
      alert('Failed to update order status');
    } finally {
      setUpdating(null);
    }
  };

  const updatePaymentStatus = async (orderId: string, newPaymentStatus: string) => {
    setUpdating(orderId);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/orders/${orderId}/payment-status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ payment_status: newPaymentStatus }),
      });

      if (response.ok) {
        setOrders(prev => prev.map(order => 
          order.id === orderId ? { ...order, payment_status: newPaymentStatus } : order
        ));
        alert('Payment status updated successfully');
      } else {
        alert('Failed to update payment status');
      }
    } catch (error) {
      console.error('Update payment status error:', error);
      alert('Failed to update payment status');
    } finally {
      setUpdating(null);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-700',
      processing: 'bg-blue-100 text-blue-700',
      shipped: 'bg-indigo-100 text-indigo-700',
      delivered: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getPaymentStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      paid: 'bg-green-100 text-green-700',
      unpaid: 'bg-red-100 text-red-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Orders Management</h2>
      
      <div className="grid grid-cols-5 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl border">
          <p className="text-sm text-gray-500">Total Orders</p>
          <p className="text-2xl font-bold">{orders.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border">
          <p className="text-sm text-gray-500">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">
            {orders.filter(o => o.status === 'pending').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border">
          <p className="text-sm text-gray-500">Processing</p>
          <p className="text-2xl font-bold text-blue-600">
            {orders.filter(o => o.status === 'processing').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border">
          <p className="text-sm text-gray-500">Shipped</p>
          <p className="text-2xl font-bold text-indigo-600">
            {orders.filter(o => o.status === 'shipped').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border">
          <p className="text-sm text-gray-500">Delivered</p>
          <p className="text-2xl font-bold text-green-600">
            {orders.filter(o => o.status === 'delivered').length}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <Clock className="mx-auto animate-spin" size={40} />
          <p className="mt-4 text-gray-500">Loading orders...</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left p-4 text-sm font-medium">Order #</th>
                  <th className="text-left p-4 text-sm font-medium">Tracking ID</th>
                  <th className="text-left p-4 text-sm font-medium">Date</th>
                  <th className="text-left p-4 text-sm font-medium">Customer</th>
                  <th className="text-left p-4 text-sm font-medium">Total</th>
                  <th className="text-left p-4 text-sm font-medium">Order Status</th>
                  <th className="text-left p-4 text-sm font-medium">Payment</th>
                  <th className="text-left p-4 text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-mono text-sm">{order.order_number}</td>
                    <td className="p-4 font-mono text-xs text-gray-500">{order.tracking_id}</td>
                    <td className="p-4 text-sm text-gray-600">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-sm">{order.email || 'Guest'}</td>
                    <td className="p-4 font-bold">Rs. {Number(order.total).toLocaleString()}</td>
                    <td className="p-4">
                      <select
                        value={order.status}
                        onChange={(e) => updateStatus(order.id, e.target.value)}
                        disabled={updating === order.id}
                        className={`text-xs px-3 py-1 rounded-full font-medium ${getStatusColor(order.status)} disabled:opacity-50`}
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="p-4">
                      <select
                        value={order.payment_status || 'unpaid'}
                        onChange={(e) => updatePaymentStatus(order.id, e.target.value)}
                        disabled={updating === order.id}
                        className={`text-xs px-3 py-1 rounded-full font-medium ${getPaymentStatusColor(order.payment_status || 'unpaid')} disabled:opacity-50`}
                      >
                        <option value="paid">Paid</option>
                        <option value="unpaid">Unpaid</option>
                      </select>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye size={16} className="text-gray-600" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
              <h3 className="text-xl font-bold">Order Details - {selectedOrder.order_number}</h3>
              <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-gray-100 rounded-full">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Order Info */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Order Date</p>
                  <p className="font-medium">{new Date(selectedOrder.created_at).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Tracking ID</p>
                  <p className="font-mono text-sm">{selectedOrder.tracking_id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Shipping Method</p>
                  <p className="font-medium capitalize">{selectedOrder.shipping_method || 'Standard'}</p>
                </div>
              </div>

              {/* Status Updates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-2">Order Status</p>
                  <select
                    value={selectedOrder.status}
                    onChange={(e) => updateStatus(selectedOrder.id, e.target.value)}
                    className={`w-full p-2 border rounded-lg ${getStatusColor(selectedOrder.status)}`}
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-2">Payment Status</p>
                  <select
                    value={selectedOrder.payment_status || 'unpaid'}
                    onChange={(e) => updatePaymentStatus(selectedOrder.id, e.target.value)}
                    className={`w-full p-2 border rounded-lg ${getPaymentStatusColor(selectedOrder.payment_status || 'unpaid')}`}
                  >
                    <option value="paid">Paid</option>
                    <option value="unpaid">Unpaid</option>
                  </select>
                </div>
              </div>

              {/* Customer Info */}
              <div>
                <p className="text-sm text-gray-500 mb-2">Customer Information</p>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm"><strong>Email:</strong> {selectedOrder.email}</p>
                  {selectedOrder.user_id && <p className="text-sm"><strong>User ID:</strong> {selectedOrder.user_id}</p>}
                </div>
              </div>

              {/* Shipping Address */}
              <div>
                <p className="text-sm text-gray-500 mb-2">Shipping Address</p>
                <div className="p-4 bg-gray-50 rounded-lg text-sm">
                  {selectedOrder.shipping_address ? (
                    <>
                      <p>{selectedOrder.shipping_address.street_address}</p>
                      <p>{selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.province} {selectedOrder.shipping_address.postal_code}</p>
                      <p>Pakistan</p>
                      <p className="mt-2"><strong>Phone:</strong> {selectedOrder.shipping_address.phone}</p>
                    </>
                  ) : (
                    <p className="text-gray-400">No shipping address available</p>
                  )}
                </div>
              </div>

              {/* Order Notes */}
              {selectedOrder.order_notes && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Order Notes</p>
                  <div className="p-4 bg-yellow-50 rounded-lg text-sm">
                    {selectedOrder.order_notes}
                  </div>
                </div>
              )}

              {/* Order Summary */}
              <div>
                <p className="text-sm text-gray-500 mb-2">Order Summary</p>
                <div className="border rounded-lg p-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>Rs. {Number(selectedOrder.subtotal).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping</span>
                      <span>Rs. {Number(selectedOrder.shipping_cost).toLocaleString()}</span>
                    </div>
                    {selectedOrder.tax && Number(selectedOrder.tax) > 0 && (
                      <div className="flex justify-between">
                        <span>Tax</span>
                        <span>Rs. {Number(selectedOrder.tax).toLocaleString()}</span>
                      </div>
                    )}
                    {selectedOrder.discount_amount && Number(selectedOrder.discount_amount) > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount</span>
                        <span>-Rs. {Number(selectedOrder.discount_amount).toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
                      <span>Total</span>
                      <span>Rs. {Number(selectedOrder.total).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(selectedOrder.tracking_id);
                    alert('Tracking ID copied!');
                  }}
                  className="flex-1 py-2 px-4 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
                >
                  Copy Tracking ID
                </button>
                <button
                  onClick={() => window.print()}
                  className="flex-1 py-2 px-4 bg-black text-white hover:bg-gray-800 rounded-lg text-sm font-medium transition-colors"
                >
                  Print Invoice
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}