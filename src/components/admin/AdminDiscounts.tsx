import { useState, useEffect } from 'react';
import { 
  Percent, 
  Plus, 
  Trash2, 
  Tag, 
  Check, 
  AlertCircle, 
  RefreshCw, 
  Edit3, 
  Calendar, 
  Users, 
  DollarSign, 
  Clock, 
  X, 
  Copy, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';
import { adminToast } from '../../utils/notifications';

export interface CouponCode {
  id?: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_amount: number | null;
  max_discount: number | null;
  usage_limit: number | null;
  used_count: number;
  starts_at: string | null;
  ends_at: string | null;
  is_active: boolean;
  created_at?: string;
}

export default function AdminDiscounts() {
  const [coupons, setCoupons] = useState<CouponCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<CouponCode | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [formError, setFormError] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    code: '',
    discount_type: 'percentage' as 'percentage' | 'fixed',
    discount_value: 10,
    min_order_amount: '' as string | number,
    max_discount: '' as string | number,
    usage_limit: '' as string | number,
    starts_at: '',
    ends_at: '',
    is_active: true,
  });

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/coupons');
      if (res.ok) {
        const data = await res.json();
        setCoupons(Array.isArray(data) ? data : []);
      } else {
        adminToast.error('Failed to load', 'Could not load coupons list');
      }
    } catch (e: any) {
      console.error('Fetch coupons error:', e);
      adminToast.error('Connection Error', e.message || 'Error loading coupons');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const openCreateModal = () => {
    setEditingCoupon(null);
    setFormError('');
    setFormData({
      code: '',
      discount_type: 'percentage',
      discount_value: 10,
      min_order_amount: '',
      max_discount: '',
      usage_limit: '',
      starts_at: '',
      ends_at: '',
      is_active: true,
    });
    setShowModal(true);
  };

  const openEditModal = (coupon: CouponCode) => {
    setEditingCoupon(coupon);
    setFormError('');
    
    // Format dates to YYYY-MM-DDTHH:mm for datetime-local input
    const formatForInput = (isoDate: string | null) => {
      if (!isoDate) return '';
      try {
        const d = new Date(isoDate);
        if (isNaN(d.getTime())) return '';
        // Format to local ISO slice (YYYY-MM-DDTHH:mm)
        const tzOffset = d.getTimezoneOffset() * 60000;
        const localISOTime = new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
        return localISOTime;
      } catch {
        return '';
      }
    };

    setFormData({
      code: coupon.code,
      discount_type: coupon.discount_type || 'percentage',
      discount_value: coupon.discount_value,
      min_order_amount: coupon.min_order_amount ?? '',
      max_discount: coupon.max_discount ?? '',
      usage_limit: coupon.usage_limit ?? '',
      starts_at: formatForInput(coupon.starts_at),
      ends_at: formatForInput(coupon.ends_at),
      is_active: coupon.is_active !== false,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const cleanCode = formData.code.trim().toUpperCase();
    if (!cleanCode) {
      setFormError('Coupon code is required');
      return;
    }

    if (formData.discount_value <= 0) {
      setFormError('Discount value must be greater than 0');
      return;
    }

    if (formData.discount_type === 'percentage' && formData.discount_value > 100) {
      setFormError('Percentage discount cannot exceed 100%');
      return;
    }

    if (formData.starts_at && formData.ends_at) {
      if (new Date(formData.starts_at) >= new Date(formData.ends_at)) {
        setFormError('Expiry date must be after start date');
        return;
      }
    }

    setSubmitting(true);
    try {
      const payload = {
        code: cleanCode,
        discount_type: formData.discount_type,
        discount_value: Number(formData.discount_value),
        min_order_amount: formData.min_order_amount !== '' ? Number(formData.min_order_amount) : null,
        max_discount: formData.max_discount !== '' ? Number(formData.max_discount) : null,
        usage_limit: formData.usage_limit !== '' ? Number(formData.usage_limit) : null,
        starts_at: formData.starts_at ? new Date(formData.starts_at).toISOString() : null,
        ends_at: formData.ends_at ? new Date(formData.ends_at).toISOString() : null,
        is_active: formData.is_active,
      };

      const url = editingCoupon 
        ? `/api/coupons/${editingCoupon.id || editingCoupon.code}` 
        : '/api/coupons';
      const method = editingCoupon ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        let errMsg = 'Failed to save coupon';
        try {
          const errData = await res.json();
          errMsg = errData.message || errMsg;
        } catch (_) {}
        throw new Error(errMsg);
      }

      adminToast.success(
        editingCoupon ? 'Coupon Updated' : 'Coupon Created',
        `Coupon "${cleanCode}" saved successfully in database.`
      );
      setShowModal(false);
      await fetchCoupons();
    } catch (err: any) {
      console.error('Save coupon error:', err);
      setFormError(err.message || 'Failed to save coupon');
      adminToast.error('Save Error', err.message || 'Failed to save coupon');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (coupon: CouponCode) => {
    try {
      const newStatus = !coupon.is_active;
      const res = await fetch(`/api/coupons/${coupon.id || coupon.code}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: newStatus }),
      });
      if (res.ok) {
        adminToast.success(
          newStatus ? 'Coupon Activated' : 'Coupon Deactivated',
          `"${coupon.code}" is now ${newStatus ? 'active' : 'inactive'}.`
        );
        await fetchCoupons();
      } else {
        adminToast.error('Update Failed', 'Could not toggle coupon status');
      }
    } catch (e: any) {
      console.error('Toggle coupon error:', e);
      adminToast.error('Error', e.message);
    }
  };

  const handleDelete = async (coupon: CouponCode) => {
    if (!confirm(`Are you sure you want to permanently delete coupon "${coupon.code}"?`)) return;
    try {
      const res = await fetch(`/api/coupons/${coupon.id || coupon.code}`, { method: 'DELETE' });
      if (res.ok) {
        adminToast.success('Coupon Deleted', `Coupon "${coupon.code}" was deleted.`);
        await fetchCoupons();
      } else {
        adminToast.error('Delete Failed', 'Could not delete coupon');
      }
    } catch (e: any) {
      console.error('Delete coupon error:', e);
      adminToast.error('Delete Failed', e.message);
    }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
    adminToast.success('Copied', `"${code}" copied to clipboard`);
  };

  // Helper to determine coupon status
  const getCouponStatus = (coupon: CouponCode) => {
    if (!coupon.is_active) {
      return { label: 'INACTIVE', color: 'bg-gray-100 text-gray-700 border-gray-300' };
    }
    const now = new Date();
    if (coupon.starts_at && new Date(coupon.starts_at) > now) {
      return { label: 'UPCOMING', color: 'bg-blue-100 text-blue-800 border-blue-300' };
    }
    if (coupon.ends_at && new Date(coupon.ends_at) < now) {
      return { label: 'EXPIRED', color: 'bg-red-100 text-red-800 border-red-300' };
    }
    if (coupon.usage_limit && (coupon.used_count || 0) >= coupon.usage_limit) {
      return { label: 'LIMIT REACHED', color: 'bg-amber-100 text-amber-900 border-amber-300' };
    }
    return { label: 'ACTIVE', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-gray-900 flex items-center gap-2.5">
            <span>Discount Coupons</span>
            <span className="text-xs bg-neutral-900 text-white px-2.5 py-0.5 rounded-full font-mono font-bold">
              {coupons.length} Total
            </span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Create, edit, and track promotional promo codes. Stored dynamically in <code>coupon_codes</code> and validated live at checkout.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchCoupons}
            className="p-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors cursor-pointer"
            title="Refresh Coupons from Database"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 bg-black hover:bg-zinc-800 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-colors shadow-sm cursor-pointer"
          >
            <Plus size={16} /> Create Discount
          </button>
        </div>
      </div>

      {/* Coupons List / Grid */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs">
        {loading ? (
          <div className="py-16 text-center space-y-3">
            <RefreshCw size={24} className="animate-spin mx-auto text-gray-400" />
            <p className="text-xs text-gray-500 font-medium">Fetching coupons from database...</p>
          </div>
        ) : coupons.length === 0 ? (
          <div className="text-center py-16 space-y-4">
            <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto text-neutral-400">
              <Tag size={28} />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">No discount coupons found</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1">
                Create promotional discount codes with custom limits, start dates, and expiry dates to boost customer checkout conversion.
              </p>
            </div>
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 bg-black text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-zinc-800 transition-colors"
            >
              <Plus size={15} /> Add First Coupon
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {coupons.map((coupon) => {
              const status = getCouponStatus(coupon);
              const used = coupon.used_count || 0;
              const limit = coupon.usage_limit;
              const percentUsed = limit ? Math.min(100, Math.round((used / limit) * 100)) : 0;

              return (
                <div
                  key={coupon.id || coupon.code}
                  className="p-5 border border-gray-200 rounded-2xl hover:border-black/30 transition-all bg-gray-50/40 hover:bg-white flex flex-col justify-between shadow-xs relative group"
                >
                  <div>
                    {/* Header Row: Code & Status */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2.5 bg-black text-white rounded-xl shadow-xs">
                          {coupon.discount_type === 'percentage' ? (
                            <Percent size={18} />
                          ) : (
                            <DollarSign size={18} />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-black text-base tracking-wider text-gray-950">
                              {coupon.code}
                            </span>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(coupon.code)}
                              className="text-gray-400 hover:text-black transition-colors cursor-pointer"
                              title="Copy code"
                            >
                              {copiedCode === coupon.code ? (
                                <Check size={14} className="text-emerald-600" />
                              ) : (
                                <Copy size={14} />
                              )}
                            </button>
                          </div>
                          <p className="text-xs font-extrabold text-neutral-900 mt-0.5">
                            {coupon.discount_type === 'percentage'
                              ? `${coupon.discount_value}% OFF`
                              : `Rs. ${coupon.discount_value.toLocaleString()} FLAT OFF`}
                            {coupon.max_discount && coupon.max_discount > 0 ? (
                              <span className="text-[11px] font-normal text-gray-500 ml-1.5">
                                (Capped at Rs. {coupon.max_discount.toLocaleString()})
                              </span>
                            ) : null}
                          </p>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${status.color}`}>
                        {status.label}
                      </span>
                    </div>

                    {/* Requirements & Order Threshold */}
                    <div className="grid grid-cols-2 gap-2 text-xs py-3 border-y border-gray-200/80 my-3">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">
                          Minimum Spend
                        </span>
                        <span className="font-semibold text-gray-800">
                          {coupon.min_order_amount && coupon.min_order_amount > 0
                            ? `Rs. ${coupon.min_order_amount.toLocaleString()}`
                            : 'No minimum order'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">
                          Usage Limit & Count
                        </span>
                        <span className="font-semibold text-gray-800">
                          {limit ? `${used} / ${limit} used` : `${used} used (Unlimited)`}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar for Usage Limit */}
                    {limit && (
                      <div className="mb-3">
                        <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-1.5 rounded-full transition-all ${
                              percentUsed >= 100 ? 'bg-red-500' : 'bg-black'
                            }`}
                            style={{ width: `${percentUsed}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Dates: Starts and Expiry */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-gray-500 mb-2">
                      {coupon.starts_at && (
                        <div className="flex items-center gap-1">
                          <Calendar size={12} className="text-gray-400" />
                          <span>Starts: {new Date(coupon.starts_at).toLocaleDateString()}</span>
                        </div>
                      )}
                      {coupon.ends_at ? (
                        <div className="flex items-center gap-1 font-medium text-neutral-700">
                          <Clock size={12} className={new Date(coupon.ends_at) < new Date() ? 'text-red-500' : 'text-gray-400'} />
                          <span className={new Date(coupon.ends_at) < new Date() ? 'text-red-600 font-bold' : ''}>
                            Expires: {new Date(coupon.ends_at).toLocaleDateString()}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-gray-400">
                          <Clock size={12} />
                          <span>No expiry date set</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-2">
                    <button
                      type="button"
                      onClick={() => handleToggleActive(coupon)}
                      className={`text-xs font-semibold px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                        coupon.is_active
                          ? 'border-gray-300 text-gray-700 hover:bg-gray-100'
                          : 'border-emerald-300 text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                      }`}
                    >
                      {coupon.is_active ? 'Disable' : 'Enable'}
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => openEditModal(coupon)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                        title="Edit Coupon"
                      >
                        <Edit3 size={13} /> Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(coupon)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete Coupon"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add / Edit Coupon Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-bold font-display text-gray-900">
                  {editingCoupon ? `Edit Coupon: ${editingCoupon.code}` : 'Create Discount Coupon'}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {editingCoupon ? 'Update coupon values, validity dates, or limits.' : 'Configure promotional code details and restrictions.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {formError && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2.5">
                <AlertCircle size={16} className="text-red-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-red-700 font-medium">{formError}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Coupon Code Input */}
              <div>
                <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Coupon Code *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FLASH30, WINTER20"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full px-3.5 py-2.5 border-2 rounded-xl font-mono text-sm uppercase tracking-wider focus:outline-none focus:border-black font-bold"
                />
              </div>

              {/* Type and Value */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Discount Type *
                  </label>
                  <select
                    value={formData.discount_type}
                    onChange={(e) => setFormData({ ...formData, discount_type: e.target.value as any })}
                    className="w-full px-3 py-2.5 border-2 rounded-xl text-xs font-semibold focus:outline-none focus:border-black"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (Rs.)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">
                    {formData.discount_type === 'percentage' ? 'Percentage Value (%) *' : 'Amount (Rs.) *'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={formData.discount_type === 'percentage' ? 100 : undefined}
                    required
                    value={formData.discount_value}
                    onChange={(e) => setFormData({ ...formData, discount_value: Number(e.target.value) })}
                    className="w-full px-3 py-2.5 border-2 rounded-xl text-xs font-semibold focus:outline-none focus:border-black"
                  />
                </div>
              </div>

              {/* Min Order & Max Discount */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Min Order Spend (Rs.)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 2000 (Optional)"
                    value={formData.min_order_amount}
                    onChange={(e) => setFormData({ ...formData, min_order_amount: e.target.value })}
                    className="w-full px-3 py-2.5 border-2 rounded-xl text-xs focus:outline-none focus:border-black"
                  />
                  <p className="text-[10px] text-gray-400 mt-0.5">Leave empty for no minimum</p>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Max Discount Cap (Rs.)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 1000 (Optional)"
                    value={formData.max_discount}
                    onChange={(e) => setFormData({ ...formData, max_discount: e.target.value })}
                    className="w-full px-3 py-2.5 border-2 rounded-xl text-xs focus:outline-none focus:border-black"
                  />
                  <p className="text-[10px] text-gray-400 mt-0.5">Caps maximum savings</p>
                </div>
              </div>

              {/* Usage Limit */}
              <div>
                <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Overall Usage Limit
                </label>
                <input
                  type="number"
                  min="1"
                  placeholder="e.g. 50 (Total times this coupon can be used)"
                  value={formData.usage_limit}
                  onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value })}
                  className="w-full px-3 py-2.5 border-2 rounded-xl text-xs focus:outline-none focus:border-black"
                />
                <p className="text-[10px] text-gray-400 mt-0.5">Leave blank for unlimited usage</p>
              </div>

              {/* Start Date & Expiry Date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Starts At
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.starts_at}
                    onChange={(e) => setFormData({ ...formData, starts_at: e.target.value })}
                    className="w-full px-3 py-2.5 border-2 rounded-xl text-xs focus:outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Ends At (Expiry Date)
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.ends_at}
                    onChange={(e) => setFormData({ ...formData, ends_at: e.target.value })}
                    className="w-full px-3 py-2.5 border-2 rounded-xl text-xs focus:outline-none focus:border-black"
                  />
                </div>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-2.5 pt-2 bg-neutral-50 p-3 rounded-xl border">
                <input
                  type="checkbox"
                  id="couponActiveToggle"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 rounded text-black focus:ring-0 cursor-pointer"
                />
                <label htmlFor="couponActiveToggle" className="font-semibold text-gray-800 cursor-pointer">
                  Activate coupon immediately for checkout validation
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 rounded-xl text-gray-600 hover:bg-gray-100 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-black hover:bg-zinc-800 text-white font-bold cursor-pointer transition-colors shadow-sm disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : editingCoupon ? 'Update Coupon' : 'Create Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
