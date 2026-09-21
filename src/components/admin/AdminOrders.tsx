import { useState, useEffect } from 'react';
import { Eye, Package } from 'lucide-react';

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders');
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    }
  };

  const updateStatus = async (orderId: string, newStatus: string) => {
    console.log('Updating order status:', orderId, 'to', newStatus);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending_verification: 'bg-yellow-100 text-yellow-700',
      confirmed: 'bg-blue-100 text-blue-700',
      processing: 'bg-purple-100 text-purple-700',
      shipped: 'bg-indigo-100 text-indigo-700',
      delivered: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Orders Management</h2>
      
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl border">
          <p className="text-sm text-gray-500">Total Orders</p>
          <p className="text-2xl font-bold">{orders.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border">
          <p className="text-sm text-gray-500">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">
            {orders.filter(o => o.status === 'pending_verification').length}
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

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-4 text-sm font-medium">Order #</th>
                <th className="text-left p-4 text-sm font-medium">Date</th>
                <th className="text-left p-4 text-sm font-medium">Customer</th>
                <th className="text-left p-4 text-sm font-medium">Total</th>
                <th className="text-left p-4 text-sm font-medium">Status</th>
                <th className="text-left p-4 text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id} className="border-b hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-mono text-sm">{order.order_number}</td>
                  <td className="p-4 text-sm text-gray-600">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-sm">{order.user_name || 'Guest'}</td>
                  <td className="p-4 font-bold">Rs. {Number(order.total).toLocaleString()}</td>
                  <td className="p-4">
                    <select
                      value={order.status}
                      onChange={(e) => updateStatus(order.id, e.target.value)}
                      className={`text-xs px-3 py-1 rounded-full font-medium ${getStatusColor(order.status)}`}
                    >
                      <option value="pending_verification">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
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

      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-xl font-bold">Order Details - {selectedOrder.order_number}</h3>
              <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-gray-100 rounded-full">
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Order Date</p>
                  <p className="font-medium">{new Date(selectedOrder.created_at).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className={`inline-block text-xs px-3 py-1 rounded-full font-medium ${getStatusColor(selectedOrder.status)}`}>
                    {selectedOrder.status}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-2">Shipping Address</p>
                <div className="p-4 bg-gray-50 rounded-lg text-sm">
                  <p>{selectedOrder.shipping_address?.firstName} {selectedOrder.shipping_address?.lastName}</p>
                  <p>{selectedOrder.shipping_address?.address}</p>
                  <p>{selectedOrder.shipping_address?.city}, {selectedOrder.shipping_address?.postalCode}</p>
                  <p>{selectedOrder.shipping_address?.phone}</p>
                </div>
              </div>
              {selectedOrder.tracking_number && (
                <div>
                  <p className="text-sm text-gray-500">Tracking Number</p>
                  <p className="font-mono">{selectedOrder.tracking_number}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500 mb-2">Order Summary</p>
                <div className="border rounded-lg p-4">
                  <div className="flex justify-between mb-2">
                    <span>Subtotal</span>
                    <span>Rs. {Number(selectedOrder.subtotal).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span>Shipping</span>
                    <span>Rs. {Number(selectedOrder.shipping_cost).toLocaleString()}</span>
                  </div>
                  {selectedOrder.discount_amount > 0 && (
                    <div className="flex justify-between mb-2 text-green-600">
                      <span>Discount</span>
                      <span>-Rs. {Number(selectedOrder.discount_amount).toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total</span>
                    <span>Rs. {Number(selectedOrder.total).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
