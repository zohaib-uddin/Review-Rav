import React, { useState, useEffect, useMemo } from 'react';
import { 
  FileText, Shield, User, Clock, RefreshCw, Search, Filter, 
  ShoppingCart, Heart, Package, Mail, LogIn, CheckCircle2 
} from 'lucide-react';
import api from '../../services/api';

interface AuditLog {
  id: string;
  action: string;
  entity: string;
  user: string;
  details?: string;
  created_at: string;
}

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'auth' | 'cart' | 'order' | 'inventory' | 'marketing'>('all');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await api.getAuditLogs();
      setLogs(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchSearch = 
        log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.entity.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (log.details && log.details.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchSearch) return false;

      if (selectedFilter === 'all') return true;
      if (selectedFilter === 'auth') return log.action.includes('LOGIN') || log.action.includes('REGISTER') || log.entity.toLowerCase().includes('user');
      if (selectedFilter === 'cart') return log.action.includes('CART') || log.action.includes('WISHLIST');
      if (selectedFilter === 'order') return log.action.includes('ORDER');
      if (selectedFilter === 'inventory') return log.action.includes('STOCK') || log.action.includes('INVENTORY') || log.entity.toLowerCase().includes('product');
      if (selectedFilter === 'marketing') return log.action.includes('CAMPAIGN') || log.action.includes('NEWSLETTER');
      return true;
    });
  }, [logs, searchQuery, selectedFilter]);

  const getLogIcon = (action: string) => {
    const act = action.toUpperCase();
    if (act.includes('LOGIN') || act.includes('REGISTER')) return <LogIn size={15} className="text-blue-600" />;
    if (act.includes('CART')) return <ShoppingCart size={15} className="text-emerald-600" />;
    if (act.includes('WISHLIST')) return <Heart size={15} className="text-rose-500" />;
    if (act.includes('ORDER')) return <Package size={15} className="text-purple-600" />;
    if (act.includes('STOCK') || act.includes('INVENTORY')) return <Shield size={15} className="text-amber-600" />;
    if (act.includes('CAMPAIGN') || act.includes('NEWSLETTER')) return <Mail size={15} className="text-cyan-600" />;
    return <FileText size={15} className="text-zinc-600" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-gray-900 tracking-tight">System Audit & Activity Logs</h1>
          <p className="text-xs text-gray-500 mt-1">
            Real-time immutable log of admin operations, customer transactions, logins, cart updates, and marketing dispatches.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchLogs}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-colors"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search by action, user email, entity or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black"
          />
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-gray-100 rounded-xl border border-gray-200 text-xs w-full sm:w-auto overflow-x-auto">
          {[
            { id: 'all', label: 'All' },
            { id: 'auth', label: 'Auth' },
            { id: 'cart', label: 'Cart/Wish' },
            { id: 'order', label: 'Orders' },
            { id: 'inventory', label: 'Stock' },
            { id: 'marketing', label: 'Marketing' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setSelectedFilter(f.id as any)}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all whitespace-nowrap ${
                selectedFilter === f.id ? 'bg-white text-black shadow-xs' : 'text-gray-500 hover:text-black'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Logs Container */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs">
        {loading ? (
          <div className="text-center py-12">
            <RefreshCw className="animate-spin text-gray-400 mx-auto mb-2" size={24} />
            <p className="text-xs text-gray-400">Loading audit history...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="text-gray-300 mx-auto mb-2" size={32} />
            <p className="text-xs text-gray-500 font-semibold">No audit activity matching your filter.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-center gap-3.5 p-3 border border-gray-100 rounded-xl hover:bg-gray-50/80 transition-colors text-xs"
              >
                <div className="w-8 h-8 bg-gray-50 border border-gray-100 rounded-lg flex items-center justify-center shrink-0">
                  {getLogIcon(log.action)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-gray-900 truncate">{log.action}</p>
                    <span className="px-2 py-0.5 rounded-md bg-zinc-100 text-[10px] font-mono text-zinc-600 font-semibold">
                      {log.entity}
                    </span>
                  </div>
                  {log.details && (
                    <p className="text-gray-500 truncate text-[11px] mt-0.5 font-mono">{log.details}</p>
                  )}
                </div>

                <div className="text-right shrink-0">
                  <p className="font-semibold text-gray-800 flex items-center gap-1 justify-end text-[11px]">
                    <User size={12} className="text-gray-400" /> {log.user}
                  </p>
                  <p className="text-gray-400 font-mono text-[10px] flex items-center gap-1 justify-end mt-0.5">
                    <Clock size={11} /> {new Date(log.created_at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
