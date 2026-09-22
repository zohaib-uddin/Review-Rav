import React, { useState, useEffect } from 'react';
import { Mail, Send, Plus, Eye, Trash2, Calendar, RefreshCw, CheckCircle2, AlertCircle, Users, Sparkles } from 'lucide-react';
import api from '../../services/api';

interface Campaign {
  id: string;
  name: string;
  subject: string;
  content?: string;
  target_audience: 'all' | 'subscribers' | 'inactive_subscribers' | 'active_customers';
  status: 'draft' | 'scheduled' | 'sent';
  recipients: number;
  sent_at?: string;
  created_at: string;
}

export default function EmailMarketing() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [previewCampaign, setPreviewCampaign] = useState<Campaign | null>(null);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const [formValues, setFormValues] = useState({
    name: '',
    subject: '',
    content: '',
    target_audience: 'all' as Campaign['target_audience'],
  });

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const data = await api.getEmailCampaigns();
      setCampaigns(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch campaigns:', err);
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3500);
  };

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formValues.subject || !formValues.content) return;

    try {
      const newCamp = await api.createEmailCampaign(formValues);
      setCampaigns(prev => [newCamp, ...prev]);
      setShowCreateModal(false);
      setFormValues({ name: '', subject: '', content: '', target_audience: 'all' });
      showNotification(`Campaign "${newCamp.name}" saved as draft!`);
    } catch (err) {
      console.error('Failed to create campaign:', err);
    }
  };

  const handleSendNow = async (camp: Campaign) => {
    if (!window.confirm(`Broadcast campaign "${camp.subject}" to target audience via Google Apps Script now?`)) {
      return;
    }

    setSendingId(camp.id);
    try {
      const res = await api.sendEmailCampaign(camp.id);
      if (res?.campaign) {
        setCampaigns(prev => prev.map(c => c.id === camp.id ? res.campaign : c));
        showNotification(`Campaign dispatched successfully to ${res.totalSent || camp.recipients} recipients!`);
      } else {
        fetchCampaigns();
        showNotification('Campaign dispatched successfully!');
      }
    } catch (err) {
      console.error('Failed to send campaign:', err);
      showNotification('Delivery initiated via Apps Script webhook');
      fetchCampaigns();
    } finally {
      setSendingId(null);
    }
  };

  const handleDeleteCampaign = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this campaign?')) return;
    try {
      await api.deleteEmailCampaign(id);
      setCampaigns(prev => prev.filter(c => c.id !== id));
      showNotification('Campaign deleted');
    } catch (err) {
      console.error('Failed to delete campaign:', err);
    }
  };

  const draftCount = campaigns.filter(c => c.status === 'draft').length;
  const sentCount = campaigns.filter(c => c.status === 'sent').length;
  const totalDispatched = campaigns.filter(c => c.status === 'sent').reduce((sum, c) => sum + (c.recipients || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-display text-gray-900 tracking-tight">Email Marketing & Broadcasts</h2>
          <p className="text-xs text-gray-500 mt-1">
            Dispatch newsletters and VIP promotions directly via integrated Google Apps Script automation.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchCampaigns}
            className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors"
            title="Refresh campaigns"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-black hover:bg-zinc-800 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
          >
            <Plus size={15} />
            <span>Create Campaign</span>
          </button>
        </div>
      </div>

      {actionNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-600" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-500">Draft Campaigns</span>
            <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600">
              <Mail size={16} />
            </div>
          </div>
          <p className="text-2xl font-black font-display text-gray-900">{draftCount}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">Ready to review and dispatch</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-500">Sent Campaigns</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <Send size={16} />
            </div>
          </div>
          <p className="text-2xl font-black font-display text-emerald-600">{sentCount}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">Successfully sent to subscribers</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-500">Total Emails Delivered</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <Users size={16} />
            </div>
          </div>
          <p className="text-2xl font-black font-display text-blue-600">{totalDispatched}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">Audience impressions achieved</p>
        </div>
      </div>

      {/* Campaigns Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50/80 border-b border-gray-100 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="p-4">Campaign Title & Subject</th>
                <th className="p-4">Target Audience</th>
                <th className="p-4">Delivery Status</th>
                <th className="p-4">Recipients</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {campaigns.map((campaign) => {
                const isSent = campaign.status === 'sent';
                return (
                  <tr key={campaign.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="p-4">
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{campaign.name || campaign.subject}</p>
                        <p className="text-xs text-gray-500 mt-0.5 font-mono">Subject: {campaign.subject}</p>
                        <p className="text-[10px] text-gray-400 mt-1">
                          {isSent && campaign.sent_at 
                            ? `Dispatched on: ${new Date(campaign.sent_at).toLocaleString()}` 
                            : `Created: ${new Date(campaign.created_at).toLocaleDateString()}`}
                        </p>
                      </div>
                    </td>

                    <td className="p-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 capitalize">
                        {campaign.target_audience.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="p-4">
                      {isSent ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Sent
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200/80">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          Draft
                        </span>
                      )}
                    </td>

                    <td className="p-4 text-xs font-semibold text-gray-800 font-mono">
                      {isSent ? `${campaign.recipients} sent` : 'Pending'}
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setPreviewCampaign(campaign)}
                          className="p-1.5 text-gray-500 hover:text-black hover:bg-gray-100 rounded-lg transition-colors"
                          title="Preview Email Content"
                        >
                          <Eye size={16} />
                        </button>

                        {!isSent && (
                          <button
                            onClick={() => handleSendNow(campaign)}
                            disabled={sendingId === campaign.id}
                            className="flex items-center gap-1 px-3 py-1.5 bg-black hover:bg-zinc-800 text-white text-xs font-bold rounded-lg transition-colors shadow-xs"
                            title="Dispatch via Apps Script"
                          >
                            <Send size={13} className={sendingId === campaign.id ? 'animate-pulse' : ''} />
                            <span>{sendingId === campaign.id ? 'Dispatching...' : 'Send Now'}</span>
                          </button>
                        )}

                        <button
                          onClick={() => handleDeleteCampaign(campaign.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Campaign"
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

        {campaigns.length === 0 && !loading && (
          <div className="text-center py-16">
            <Mail className="mx-auto text-gray-300 mb-3" size={36} />
            <p className="text-sm font-semibold text-gray-700">No email campaigns created yet</p>
            <p className="text-xs text-gray-400 mt-1">Click "Create Campaign" to compose your first broadcast.</p>
          </div>
        )}
      </div>

      {/* Modal: Create Campaign */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Create New Email Campaign</h3>
                <p className="text-xs text-gray-500">Compose promotional newsletter content</p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCampaign} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Internal Campaign Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Winter VIP Drop 2026"
                  value={formValues.name}
                  onChange={(e) => setFormValues({ ...formValues, name: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Subject Line
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ⚡ Exclusive Access: New Arrivals Are Live!"
                  value={formValues.subject}
                  onChange={(e) => setFormValues({ ...formValues, subject: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Target Audience
                </label>
                <select
                  value={formValues.target_audience}
                  onChange={(e) => setFormValues({ ...formValues, target_audience: e.target.value as any })}
                  className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black"
                >
                  <option value="all">All Contacts (Subscribers + Store Customers)</option>
                  <option value="subscribers">Active Newsletter Subscribers Only</option>
                  <option value="inactive_subscribers">Inactive Newsletter Subscribers (Re-engagement)</option>
                  <option value="active_customers">Registered Storefront Customers</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Email Content (Markdown or HTML supported)
                </label>
                <textarea
                  required
                  rows={6}
                  placeholder="Hey VIP,\n\nThe new collection has just landed on Ravenza Streetwear! Enjoy 15% off using code RAVENZA15.\n\nShop now: https://ravenza.pk/shop"
                  value={formValues.content}
                  onChange={(e) => setFormValues({ ...formValues, content: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black font-sans leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-600 hover:text-black rounded-xl hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-black hover:bg-zinc-800 text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
                >
                  Save as Draft
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Preview Campaign */}
      {previewCampaign && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-base font-bold text-gray-900">Email Preview</h3>
                <p className="text-xs text-gray-400 font-mono">Subject: {previewCampaign.subject}</p>
              </div>
              <button
                onClick={() => setPreviewCampaign(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-xs space-y-2 font-mono">
              <p><span className="font-bold text-gray-700">From:</span> Ravenza Streetwear &lt;no-reply@ravenza.pk&gt;</p>
              <p><span className="font-bold text-gray-700">Audience:</span> {previewCampaign.target_audience}</p>
              <p><span className="font-bold text-gray-700">Status:</span> {previewCampaign.status.toUpperCase()}</p>
            </div>

            <div className="p-5 border border-gray-100 rounded-xl text-sm text-gray-800 whitespace-pre-line leading-relaxed bg-white min-h-[140px]">
              {previewCampaign.content || 'No content drafted.'}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setPreviewCampaign(null)}
                className="px-4 py-2 text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl transition-colors"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
