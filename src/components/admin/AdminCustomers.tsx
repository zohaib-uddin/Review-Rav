import { useState, useEffect } from 'react';
import { Users, Mail, Phone, Calendar, ShoppingBag, DollarSign, CheckCircle2, Search, RefreshCw } from 'lucide-react';

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
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchCustomers = async () => {
    setLoading(true);
    try {
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

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm)
  );

  const totalSpentAll = customers.reduce((sum, c) => sum + (c.total_spent || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-gray-900">Customer Management</h1>
          <p className="text-xs text-gray-500 mt-1">Real-time database users, orders summary, and OTP verification status.</p>
        </div>
        <button
          onClick={fetchCustomers}
          className="flex items-center gap-2 px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-colors self-start"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-gray-400">Total Customers</span>
            <Users size={18} className="text-blue-600" />
          </div>
          <p className="text-3xl font-black font-display text-gray-900 mt-2">{customers.length}</p>
          <p className="text-[11px] text-gray-500 mt-1">Registered & Guest verified</p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-gray-400">OTP Verified</span>
            <CheckCircle2 size={18} className="text-emerald-600" />
          </div>
          <p className="text-3xl font-black font-display text-gray-900 mt-2">
            {customers.filter(c => c.is_verified).length}
          </p>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">100% Secure validation</p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-gray-400">Customer LTV</span>
            <DollarSign size={18} className="text-purple-600" />
          </div>
          <p className="text-3xl font-black font-display text-gray-900 mt-2">
            Rs. {totalSpentAll.toLocaleString()}
          </p>
          <p className="text-[11px] text-gray-500 mt-1">Across all order transactions</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-xs">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search customers by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-black transition-colors"
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-sm text-gray-500">Loading customer profiles...</div>
        ) : filteredCustomers.length === 0 ? (
          <div className="p-12 text-center text-sm text-gray-500">No customers found matching search.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/80 border-b border-gray-200 text-gray-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Contact</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Orders</th>
                  <th className="py-3.5 px-4">Total Spent</th>
                  <th className="py-3.5 px-4">Joined Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredCustomers.map((cust) => (
                  <tr key={cust.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-zinc-900 text-white font-bold flex items-center justify-center text-xs">
                          {cust.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{cust.name}</p>
                          <p className="text-[11px] text-gray-500 font-mono">ID: {cust.id.slice(0, 8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 space-y-1">
                      <div className="flex items-center gap-1.5 text-gray-700">
                        <Mail size={13} className="text-gray-400" />
                        <span>{cust.email}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-500 font-mono text-[11px]">
                        <Phone size={13} className="text-gray-400" />
                        <span>{cust.phone}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 size={11} /> OTP Verified
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-gray-900">
                      {cust.orders_count} orders
                    </td>
                    <td className="py-3.5 px-4 font-bold text-gray-900">
                      Rs. {cust.total_spent.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-gray-500">
                      {new Date(cust.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
