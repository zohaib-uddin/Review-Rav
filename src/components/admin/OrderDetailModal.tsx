import { useState } from 'react';
import { X, Mail, MessageCircle, Download, Truck, CreditCard } from 'lucide-react';

interface OrderDetailModalProps {
  order: any;
  onClose: () => void;
}

export default function OrderDetailModal({ order, onClose }: OrderDetailModalProps) {
  const [updating, setUpdating] = useState(false);

  const handleStatusChange = async (newStatus: string) => {
    setUpdating(true);
    try {
      await fetch(`/api/orders/${order.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      alert('Order status updated!');
      onClose();
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setUpdating(false);
    }
  };

  const handleSendInvoice = async () => {
    const email = order.shipping_address?.email || order.billing_address?.email || order.user?.email;
    if (!email) {
      alert('No email found for this order');
      return;
    }
    
    try {
      const response = await fetch('/api/orders/send-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.id, email })
      });
      
      if (response.ok) {
        alert(`Invoice sent to ${email}`);
      } else {
        alert('Failed to send invoice');
      }
    } catch (error) {
      console.error('Failed to send invoice:', error);
      alert('Failed to send invoice');
    }
  };

  const handleWhatsAppMessage = () => {
    const phone = order.shipping_address?.phone || order.billing_address?.phone;
    if (!phone) {
      alert('No phone number found');
      return;
    }
    
    const message = `Hi! Your order #${order.order_number} has been ${order.status}. Total: Rs. ${order.total}. Thank you for shopping with RAVENZA!`;
    const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleDownloadInvoice = () => {
    alert('Invoice PDF download initiated');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Order #{order.order_number}</h2>
            <p className="text-sm text-gray-500">Placed on {new Date(order.created_at).toLocaleString()}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Order Status</label>
              <select
                value={order.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={updating}
                className="w-full px-4 py-2 border rounded-lg"
              >
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Payment Status</label>
              <select className="w-full px-4 py-2 border rounded-lg">
                <option value="unpaid">Unpaid</option>
                <option value="paid">Paid</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-xl">
            <h3 className="font-bold mb-3">Customer Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Email</p>
                <p className="font-medium">{order.user?.email || order.shipping_address?.email}</p>
                {order.user?.is_verified && (
                  <span className="text-xs text-green-600">✓ Verified</span>
                )}
              </div>
              <div>
                <p className="text-gray-500">Phone</p>
                <p className="font-medium">{order.shipping_address?.phone}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-xl">
            <h3 className="font-bold mb-3 flex items-center gap-2">
              <Truck size={18} />
              Shipping Address
            </h3>
            <p className="text-sm">
              {order.shipping_address?.name}<br/>
              {order.shipping_address?.address}<br/>
              {order.shipping_address?.city}, {order.shipping_address?.region} {order.shipping_address?.postal_code}<br/>
              {order.shipping_address?.country}
            </p>
          </div>

          {order.billing_address && (
            <div className="bg-gray-50 p-4 rounded-xl">
              <h3 className="font-bold mb-3 flex items-center gap-2">
                <CreditCard size={18} />
                Billing Address
              </h3>
              <p className="text-sm">
                {order.billing_address?.name}<br/>
                {order.billing_address?.address}<br/>
                {order.billing_address?.city}, {order.billing_address?.region} {order.billing_address?.postal_code}
              </p>
            </div>
          )}

          <div>
            <h3 className="font-bold mb-3">Order Items</h3>
            <div className="space-y-3">
              {JSON.parse(order.items || '[]').map((item: any, idx: number) => (
                <div key={idx} className="flex items-center gap-4 p-3 border rounded-lg">
                  <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded" />
                  <div className="flex-1">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-500">
                      Size: {item.size} | Color: {item.color} | Qty: {item.quantity}
                    </p>
                  </div>
                  <p className="font-bold">Rs. {(item.price * item.quantity).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-xl">
            <h3 className="font-bold mb-2">Payment Method</h3>
            <p className="text-sm capitalize">{order.payment_method === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</p>
          </div>

          <div className="bg-gray-50 p-4 rounded-xl">
            <h3 className="font-bold mb-3">Order Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>Rs. {order.subtotal}</span>
              </div>
              {order.discount_code && (
                <div className="flex justify-between text-green-600">
                  <span>Discount ({order.discount_code})</span>
                  <span>-Rs. {order.discount_amount}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>Rs. {order.shipping_cost}</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <span>Grand Total</span>
                <span>Rs. {order.total}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <button
              onClick={handleSendInvoice}
              className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
            >
              <Mail size={18} />
              Send Invoice to Email
            </button>
            <button
              onClick={handleWhatsAppMessage}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <MessageCircle size={18} />
              Send WhatsApp Message
            </button>
            <button
              onClick={handleDownloadInvoice}
              className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              <Download size={18} />
              Download Invoice PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}