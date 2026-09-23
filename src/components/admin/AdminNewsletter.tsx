import React, { useState, useEffect } from 'react';
import { Mail, Trash2, Download, Check, X, Plus, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';
import { adminToast } from '../../utils/notifications';

interface Subscriber {
  id: string;
  email: string;
  date?: string;
  subscribed_at?: string;
  is_active: boolean;
}

export default function AdminNewsletter() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [newEmail, setNewEmail] = useState('');
  const [adding, setAdding] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [sendingThanksEmail, setSendingThanksEmail] = useState<string | null>(null);

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const handleSendThanks = async (email: string) => {
    try {
      setSendingThanksEmail(email);
      await api.request('/newsletter/send-thanks', {
        method: 'POST',
        body: JSON.stringify({ email })
      });
      adminToast.success('Email Sent', `Thank you email successfully dispatched to ${email}`);
    } catch (err: any) {
      adminToast.error('Send Failed', err.message || 'Failed to send email');
    } finally {
      setSendingThanksEmail(null);
    }
  };

  const fetchSubscribers = async () => {
    setLoading(true);
    try {
      const data = await api.getNewsletterSubscribers();
      setSubscribers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch subscribers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (sub: Subscriber) => {
    const updatedStatus = !sub.is_active;
    try {
      // Optimistic update
      setSubscribers(prev => prev.map(s => (s.id === sub.id || s.email === sub.email) ? { ...s, is_active: updatedStatus } : s));
      await api.updateNewsletterSubscriber(sub.id || sub.email, updatedStatus);
      showNotice(`Subscriber status set to ${updatedStatus ? 'Active' : 'Inactive'}`);
    } catch (err) {
      console.error('Failed to toggle status:', err);
      fetchSubscribers();
    }
  };

  const handleDelete = async (sub: Subscriber) => {
    if (!window.confirm(`Are you sure you want to remove ${sub.email} from subscribers?`)) return;
    try {
      setSubscribers(prev => prev.filter(s => s.id !== sub.id && s.email !== sub.email));
      await api.deleteNewsletterSubscriber(sub.id || sub.email);
      showNotice(`Removed ${sub.email}`);
    } catch (err) {
      console.error('Failed to delete subscriber:', err);
      fetchSubscribers();
    }
  };

  const handleAddSubscriber = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newEmail.includes('@')) return;
    setAdding(true);
    try {
      const res = await api.request<any>('/newsletter', {
        method: 'POST',
        body: JSON.stringify({ email: newEmail.trim() })
      });
      if (res?.subscriber) {
        setSubscribers(prev => [res.subscriber, ...prev.filter(s => s.email !== res.subscriber.email)]);
      }
      setNewEmail('');
      showNotice('Subscriber added successfully');
    } catch (err) {
      console.error('Failed to add subscriber:', err);
    } finally {
      setAdding(false);
    }
  };

  const showNotice = (msg: string) => {
    setActionMessage(msg);
    setTimeout(() => setActionMessage(null), 3000);
  };

  const exportToCSV = () => {
    const csv = [
      ['Email', 'Subscription Date', 'Status'],
      ...subscribers.map(s => [
        s.email,
        s.date || s.subscribed_at || new Date().toISOString().split('T')[0],
        s.is_active ? 'Active' : 'Inactive'
      ])
    ].map(row => row.map(c => `"${c}"`).join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `newsletter-subscribers-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const activeCount = subscribers.filter(s => s.is_active).length;
  const inactiveCount = subscribers.filter(s => !s.is_active).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-display text-gray-900 tracking-tight">Newsletter Subscribers</h2>
          <p className="text-xs text-gray-500 mt-1">
            Audience subscribed to VIP launches, flash deals, and email campaigns.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchSubscribers}
            className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors"
            title="Refresh list"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-zinc-800 transition-colors shadow-xs"
          >
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      {actionMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2 animate-fade-in">
          <CheckCircle2 size={16} className="text-emerald-600" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Mail size={20} />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">Total Subscribers</p>
              <p className="text-2xl font-black font-display text-gray-900">{subscribers.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <p className="text-xs font-medium text-gray-500">Active Subscribers</p>
          <p className="text-2xl font-black font-display text-emerald-600">{activeCount}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">Receiving promotional broadcasts</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <p className="text-xs font-medium text-gray-500">Inactive Subscribers</p>
          <p className="text-2xl font-black font-display text-gray-400">{inactiveCount}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">Paused or unsubscribed</p>
        </div>
      </div>

      {/* Add New Subscriber Form */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
        <form onSubmit={handleAddSubscriber} className="flex flex-col sm:flex-row gap-3 items-center">
          <div className="relative flex-1 w-full">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="email"
              required
              placeholder="Add subscriber email address..."
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black"
            />
          </div>
          <button
            type="submit"
            disabled={adding}
            className="w-full sm:w-auto px-5 py-2 bg-black hover:bg-zinc-800 text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 shrink-0"
          >
            <Plus size={15} />
            <span>Add Subscriber</span>
          </button>
        </form>
      </div>

      {/* Subscribers Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50/80 border-b border-gray-100 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="p-4">Subscriber Email</th>
                <th className="p-4">Joined Date</th>
                <th className="p-4">Delivery Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {subscribers.map((subscriber) => {
                const subDate = subscriber.date || subscriber.subscribed_at || new Date().toISOString();
                const displayDate = subDate.includes('T') ? new Date(subDate).toLocaleDateString() : subDate;

                return (
                  <tr key={subscriber.id || subscriber.email} className="hover:bg-gray-50/60 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-zinc-100 rounded-full flex items-center justify-center shrink-0">
                          <Mail size={14} className="text-zinc-600" />
                        </div>
                        <span className="font-semibold text-gray-900 text-xs font-mono">{subscriber.email}</span>
                      </div>
                    </td>
                    <td className="p-4 text-xs text-gray-500">
                      {displayDate}
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => handleToggleActive(subscriber)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all border ${
                          subscriber.is_active 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80 hover:bg-emerald-100' 
                            : 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200'
                        }`}
                        title="Click to toggle active/inactive"
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${subscriber.is_active ? 'bg-emerald-600' : 'bg-gray-400'}`} />
                        {subscriber.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleSendThanks(subscriber.email)}
                          disabled={sendingThanksEmail === subscriber.email}
                          className="px-2.5 py-1 text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors flex items-center gap-1"
                          title="Send thanks for subscribing email"
                        >
                          <Mail size={13} />
                          <span>{sendingThanksEmail === subscriber.email ? 'Sending...' : 'Send Thanks'}</span>
                        </button>
                        <button
                          onClick={() => handleToggleActive(subscriber)}
                          className="px-2.5 py-1 text-[11px] font-semibold text-gray-600 hover:text-black bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                          {subscriber.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => handleDelete(subscriber)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete subscriber"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {subscribers.length === 0 && !loading && (
          <div className="text-center py-16">
            <Mail className="mx-auto text-gray-300 mb-3" size={36} />
            <p className="text-sm font-semibold text-gray-700">No subscribers registered yet</p>
            <p className="text-xs text-gray-400 mt-1">New newsletter signups from the footer will appear here automatically.</p>
          </div>
        )}
      </div>
    </div>
  );
}
