import { useState, useEffect } from 'react';
import { Mail, Send, Users, Plus } from 'lucide-react';

interface Campaign {
  id: string;
  subject: string;
  target_audience: string;
  sent_count: number;
  status: string;
  created_at: string;
}

export default function EmailMarketing() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    content: '',
    target_audience: 'all'
  });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const response = await fetch('/api/admin/email-campaigns');
      const data = await response.json();
      setCampaigns(data);
    } catch (error) {
      console.error('Failed to fetch campaigns:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);

    try {
      const response = await fetch('/api/admin/email-campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert('Campaign created! Emails will be sent via Google Apps Script.');
        setShowCreateForm(false);
        setFormData({ subject: '', content: '', target_audience: 'all' });
        fetchCampaigns();
      }
    } catch (error) {
      console.error('Failed to create campaign:', error);
      alert('Failed to create campaign');
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Email Marketing</h2>
          <p className="text-sm text-gray-500 mt-1">Send campaigns to customers and subscribers</p>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800"
        >
          <Plus size={18} />
          Create Campaign
        </button>
      </div>

      {showCreateForm && (
        <div className="bg-white p-6 rounded-xl border mb-6">
          <h3 className="font-bold mb-4">Create New Campaign</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Subject</label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="Enter email subject"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Target Audience</label>
              <select
                value={formData.target_audience}
                onChange={(e) => setFormData({ ...formData, target_audience: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
              >
                <option value="all">All Users (Customers + Subscribers)</option>
                <option value="active_customers">Active Customers Only</option>
                <option value="inactive_customers">Inactive Customers</option>
                <option value="subscribers">Newsletter Subscribers Only</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Email Content</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg h-48"
                placeholder="Write your email content here..."
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Note: Email will be sent via Google Apps Script with proper HTML formatting
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={sending}
                className="flex items-center gap-2 bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 disabled:opacity-50"
              >
                <Send size={18} />
                {sending ? 'Creating...' : 'Create & Send Campaign'}
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-6 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6">
          <h3 className="font-bold mb-4">Recent Campaigns</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-4 text-sm font-medium">Subject</th>
                <th className="text-left p-4 text-sm font-medium">Target Audience</th>
                <th className="text-left p-4 text-sm font-medium">Sent Count</th>
                <th className="text-left p-4 text-sm font-medium">Status</th>
                <th className="text-left p-4 text-sm font-medium">Created</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map(campaign => (
                <tr key={campaign.id} className="border-b hover:bg-gray-50">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <Mail size={16} className="text-gray-400" />
                      <span className="text-sm">{campaign.subject}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-xs px-2 py-1 bg-gray-100 rounded">
                      {campaign.target_audience.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-4 text-sm">{campaign.sent_count}</td>
                  <td className="p-4">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      campaign.status === 'completed' ? 'bg-green-100 text-green-700' :
                      campaign.status === 'sending' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {campaign.status}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-gray-600">
                    {new Date(campaign.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
