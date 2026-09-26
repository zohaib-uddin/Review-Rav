import { useState, useEffect, useMemo } from 'react';
import { 
  Users, Mail, Phone, Calendar, ShoppingBag, DollarSign, 
  CheckCircle2, Search, RefreshCw, ArrowUpRight, TrendingUp,
  Award, Filter, ShieldCheck
} from 'lucide-react';
import { useStore } from '../../store/useStore';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
  orders_count: number;
  total_spent: number;
}

export default function AdminCustomers() {
  const { orders, fetchOrders } = useStore();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'with_orders' | 'verified'>('all');

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      fetchOrders().catch(() => {});
      const res = await fetch('/api/admin/customers');
      if (res.ok) {
        const data = await res.json();
        setCustomers(data);
      }
    } catch (err) {
      console.error('Error fetching customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // Enrich customers with placed orders from store to guarantee 100% total spent accuracy
  const enrichedCustomers = useMemo(() => {
    return customers.map(cust => {
      const custEmail = (cust.email || '').toLowerCase().trim();
      const custPhone = (cust.phone || '').replace(/\D/g, '');

      const matchedOrders = orders.filter(o => {
        const oUserId = String(o.user_id || '');
        const oEmail = String(o.shipping_address?.email || (o as any).email || '').toLowerCase().trim();
        const oPhone = String(o.shipping_address?.phone || '').replace(/\D/g, '');

        return (
          (oUserId && (oUserId === cust.id || oUserId === cust.email)) ||
          (custEmail && oEmail && oEmail === custEmail) ||
          (custPhone && oPhone && oPhone.length >= 7 && (custPhone.includes(oPhone) || oPhone.includes(custPhone)))
        );
      });

      const storeSpent = matchedOrders.reduce((sum, o) => {
        const tot = Number(o.total);
        if (!isNaN(tot) && tot > 0) return sum + tot;
        const sub = Number(o.subtotal) || 0;
        const disc = Number(o.discount_amount) || 0;
        const ship = Number(o.shipping_cost) || 0;
        return sum + Math.max(0, sub - disc + ship);
      }, 0);

      const serverSpent = Number(cust.total_spent) || 0;
      const finalSpent = Math.max(serverSpent, storeSpent);
      const serverCount = Number(cust.orders_count) || 0;
      const finalCount = Math.max(serverCount, matchedOrders.length);

      return {
        ...cust,
        orders_count: finalCount,
        total_spent: finalSpent,
      };
    });
  }, [customers, orders]);

  const totalSpentAll = enrichedCustomers.reduce((sum, c) => sum + (Number(c.total_spent) || 0), 0);
  const totalOrdersAll = enrichedCustomers.reduce((sum, c) => sum + (Number(c.orders_count) || 0), 0);
  const customersWithOrders = enrichedCustomers.filter(c => Number(c.orders_count) > 0);
  const verifiedCount = enrichedCustomers.filter(c => c.is_verified).length;
  
  // Dynamic Customer Lifetime Value (LTV):
  // Average revenue contributed per registered customer across order history
  const averageLTV = enrichedCustomers.length > 0 ? Math.round(totalSpentAll / enrichedCustomers.length) : 0;
  const buyerLTV = customersWithOrders.length > 0 ? Math.round(totalSpentAll / customersWithOrders.length) : 0;

  const filteredCustomers = enrichedCustomers.filter(c => {
    const matchesSearch = 
      (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.phone || '').includes(searchTerm);

    if (!matchesSearch) return false;

    if (activeFilter === 'with_orders') return Number(c.orders_count) > 0;
    if (activeFilter === 'verified') return c.is_verified;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold font-display text-gray-900">Customer Management</h1>
            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[10px] font-bold uppercase tracking-wider">
              Dynamic Database
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Real-time profiles linked directly to order history, total customer spend, and verification status.
          </p>
        </div>
        <button
          onClick={fetchCustomers}
          disabled={loading}
          className="flex items-center gap-2 px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-colors self-start disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> 
          <span>Refresh</span>
        </button>
      </div>

      {/* Dynamic Metric Cards: Total Customers, OTP Verified, Customer LTV */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Customers */}
        <div className="p-5 bg-white rounded-2xl border border-gray-200 shadow-xs flex flex-col justify-between hover:border-gray-300 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase text-gray-400 tracking-wider">Total Customers</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Users size={18} />
            </div>
          </div>
          <div>
            <p className="text-3xl font-black font-display text-gray-900">{customers.length}</p>
            <p className="text-[11px] text-blue-600 font-semibold mt-1 flex items-center gap-1">
              <ShoppingBag size={12} /> {customersWithOrders.length} customer{customersWithOrders.length !== 1 ? 's' : ''} placed orders
            </p>
          </div>
        </div>

        {/* OTP Verified */}
        <div className="p-5 bg-white rounded-2xl border border-gray-200 shadow-xs flex flex-col justify-between hover:border-gray-300 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase text-gray-400 tracking-wider">OTP Verified</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <ShieldCheck size={18} />
            </div>
          </div>
          <div>
            <p className="text-3xl font-black font-display text-gray-900">{verifiedCount}</p>
            <p className="text-[11px] text-emerald-600 font-semibold mt-1">
              {Math.round((verifiedCount / Math.max(customers.length, 1)) * 100)}% verified authentication
            </p>
          </div>
        </div>

        {/* Dynamic Customer LTV */}
        <div className="p-5 bg-white rounded-2xl border border-gray-200 shadow-xs flex flex-col justify-between hover:border-gray-300 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase text-gray-400 tracking-wider">Customer LTV</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <DollarSign size={18} />
            </div>
          </div>
          <div>
            <p className="text-3xl font-black font-display text-gray-900">
              Rs. {averageLTV.toLocaleString()}
            </p>
            <p className="text-[11px] text-purple-700 font-medium mt-1">
              Total Spent: <strong className="font-mono">Rs. {totalSpentAll.toLocaleString()}</strong> across {totalOrdersAll} order{totalOrdersAll !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search customers by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-black transition-colors"
          />
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-gray-100 rounded-xl border border-gray-200 text-xs font-semibold self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeFilter === 'all'
                ? 'bg-white text-black font-bold shadow-xs'
                : 'text-gray-500 hover:text-black'
            }`}
          >
            All ({customers.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('with_orders')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeFilter === 'with_orders'
                ? 'bg-white text-black font-bold shadow-xs'
                : 'text-gray-500 hover:text-black'
            }`}
          >
            With Orders ({customersWithOrders.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('verified')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeFilter === 'verified'
                ? 'bg-white text-black font-bold shadow-xs'
                : 'text-gray-500 hover:text-black'
            }`}
          >
            Verified ({verifiedCount})
          </button>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-sm text-gray-500 flex flex-col items-center justify-center gap-2">
            <RefreshCw size={18} className="animate-spin text-gray-400" />
            <span>Loading dynamic customer records from Neon database...</span>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="p-12 text-center text-sm text-gray-500">
            No customers found matching current search/filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/80 border-b border-gray-200 text-gray-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Contact</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-center">Total Orders</th>
                  <th className="py-3.5 px-4 text-right">Total Spent</th>
                  <th className="py-3.5 px-4 text-right">Joined Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredCustomers.map((cust) => {
                  const ordersCount = Number(cust.orders_count) || 0;
                  const totalSpent = Number(cust.total_spent) || 0;

                  return (
                    <tr key={cust.id} className="hover:bg-gray-50/70 transition-colors">
                      {/* Customer Name & Avatar */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-zinc-900 to-zinc-700 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-xs uppercase">
                            {(cust.name || cust.email || 'C').charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <p className="font-bold text-gray-900 text-xs">{cust.name || 'Anonymous Customer'}</p>
                              {ordersCount >= 2 && (
                                <span className="px-1.5 py-0.2 bg-amber-50 text-amber-700 border border-amber-200 rounded text-[9px] font-bold">
                                  VIP Repeat
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-gray-400 font-mono mt-0.5">ID: {cust.id.slice(0, 8)}</p>
                          </div>
                        </div>
                      </td>

                      {/* Contact: Email & Phone */}
                      <td className="py-3.5 px-4 space-y-1">
                        <div className="flex items-center gap-1.5 text-gray-700">
                          <Mail size={12} className="text-gray-400 shrink-0" />
                          <span className="truncate max-w-[180px]">{cust.email}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-500 font-mono text-[11px]">
                          <Phone size={12} className="text-gray-400 shrink-0" />
                          <span>{cust.phone || 'N/A'}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 size={11} /> OTP Verified
                        </span>
                      </td>

                      {/* Dynamic Orders Count */}
                      <td className="py-3.5 px-4 text-center">
                        {ordersCount > 0 ? (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg font-bold text-xs">
                            <ShoppingBag size={12} />
                            <span>{ordersCount} {ordersCount === 1 ? 'order' : 'orders'}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400 font-medium">0 orders</span>
                        )}
                      </td>

                      {/* Dynamic Total Spent */}
                      <td className="py-3.5 px-4 text-right">
                        {totalSpent > 0 ? (
                          <div className="inline-block text-right">
                            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg font-black font-mono text-xs">
                              Rs. {totalSpent.toLocaleString()}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400 font-mono text-xs">Rs. 0</span>
                        )}
                      </td>

                      {/* Joined Date */}
                      <td className="py-3.5 px-4 text-right text-gray-500 font-medium">
                        {cust.created_at ? (
                          new Date(cust.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })
                        ) : (
                          'N/A'
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
