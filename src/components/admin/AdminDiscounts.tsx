import { useState, useEffect } from 'react';
import { Percent, Plus, Trash2, Tag, Check, AlertCircle, RefreshCw } from 'lucide-react';

interface Coupon {
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_amount: number;
  is_active: boolean;
}

export default function AdminDiscounts() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // New coupon form state
  const [newCode, setNewCode] = useState('');
  const [newType, setNewType] = useState<'percentage' | 'fixed'>('percentage');
  const [newValue, setNewValue] = useState(10);
  const [newMinOrder, setNewMinOrder] = useState(1000);
  const [newActive, setNewActive] = useState(true);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/coupons');
      if (res.ok) {
        const data = await res.json();
        setCoupons(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: newCode.trim().toUpperCase(),
          discount_type: newType,
          discount_value: newValue,
          min_order_amount: newMinOrder,
          is_active: newActive,
        }),
      });
      if (res.ok) {
        setShowAddModal(false);
        setNewCode('');
        setNewValue(10);
        setNewMinOrder(1000);
        await fetchCoupons();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (code: string) => {
    if (!confirm(`Are you sure you want to delete coupon ${code}?`)) return;
    try {
      const res = await fetch(`/api/coupons/${code}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchCoupons();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-gray-900">Discount Coupons</h1>
          <p className="text-xs text-gray-500 mt-1">Create promotional coupons validated live at checkout.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchCoupons}
            className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors"
            title="Refresh Coupons"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-black hover:bg-zinc-800 text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors shadow-sm"
          >
            <Plus size={15} /> Create Discount
          </button>
        </div>
      </div>

      {/* Coupon List */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs">
        {loading ? (
          <p className="text-center py-8 text-xs text-gray-400">Loading discount codes...</p>
        ) : coupons.length === 0 ? (
          <p className="text-center py-8 text-xs text-gray-400">No active discounts found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {coupons.map((coupon) => (
              <div
                key={coupon.code}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-2xl hover:border-black/30 transition-all bg-gray-50/50"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-black text-white rounded-xl">
                    <Tag size={18} />
                  </div>
                  <div>
                    <span className="font-mono font-black text-sm tracking-wider text-gray-900">
                      {coupon.code}
                    </span>
                    <p className="text-xs text-gray-600 mt-0.5">
                      {coupon.discount_type === 'percentage'
                        ? `${coupon.discount_value}% OFF`
                        : `Rs. ${coupon.discount_value} FLAT OFF`}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-1">
                      Min. spend Rs. {coupon.min_order_amount.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                      coupon.is_active
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {coupon.is_active ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                  <button
                    onClick={() => handleDelete(coupon.code)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete Coupon"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Coupon Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold font-display text-gray-900">Create Discount Coupon</h3>
            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Coupon Code
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SUMMER30"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2.5 border rounded-xl font-mono text-sm focus:outline-none focus:border-black"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Type
                  </label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full px-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:border-black"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed (Rs.)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Value
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newValue}
                    onChange={(e) => setNewValue(Number(e.target.value))}
                    className="w-full px-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:border-black"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Minimum Order Amount (Rs.)
                </label>
                <input
                  type="number"
                  min="0"
                  value={newMinOrder}
                  onChange={(e) => setNewMinOrder(Number(e.target.value))}
                  className="w-full px-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:border-black"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="couponActive"
                  checked={newActive}
                  onChange={(e) => setNewActive(e.target.checked)}
                  className="w-4 h-4 rounded text-black focus:ring-0"
                />
                <label htmlFor="couponActive" className="font-semibold text-gray-700">
                  Enable and activate immediately
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-gray-500 hover:bg-gray-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-black hover:bg-zinc-800 text-white font-bold"
                >
                  {submitting ? 'Saving...' : 'Create Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
