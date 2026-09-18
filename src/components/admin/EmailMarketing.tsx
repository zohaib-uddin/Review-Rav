import { useState } from 'react';
import { Mail, Send, Plus, Eye, Edit, Trash2, Calendar } from 'lucide-react';

interface Campaign {
  id: string;
  name: string;
  subject: string;
  status: 'draft' | 'scheduled' | 'sent';
  recipients: number;
  sentAt?: string;
  scheduledAt?: string;
  openRate?: number;
  clickRate?: number;
}

export default function EmailMarketing() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([
    {
      id: '1',
      name: 'Winter Collection Launch',
      subject: 'New Winter Collection is Here! 🎉',
      status: 'sent',
      recipients: 1250,
      sentAt: '2024-01-10T10:00:00Z',
      openRate: 45,
      clickRate: 12,
    },
    {
      id: '2',
      name: 'Flash Sale Announcement',
      subject: 'Flash Sale: 30% Off Everything! ⚡',
      status: 'scheduled',
      recipients: 1500,
      scheduledAt: '2024-01-20T14:00:00Z',
    },
    {
      id: '3',
      name: 'New Year Special',
      subject: 'Start 2024 in Style 🎊',
      status: 'draft',
      recipients: 0,
    },
  ]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    subject: '',
    content: '',
    recipients: 'all',
  });

  const handleCreateCampaign = () => {
    const campaign: Campaign = {
      id: Date.now().toString(),
      name: newCampaign.name,
      subject: newCampaign.subject,
      status: 'draft',
      recipients: 0,
    };
    setCampaigns([...campaigns, campaign]);
    setShowCreateModal(false);
    setNewCampaign({ name: '', subject: '', content: '', recipients: 'all' });
  };

  const handleDeleteCampaign = (id: string) => {
    if (confirm('Are you sure you want to delete this campaign?')) {
      setCampaigns(campaigns.filter(c => c.id !== id));
    }
  };

  const handleSendCampaign = (id: string) => {
    if (confirm('Are you sure you want to send this campaign now?')) {
      setCampaigns(campaigns.map(c => 
        c.id === id 
          ? { ...c, status: 'sent' as const, sentAt: new Date().toISOString(), recipients: 1500 }
          : c
      ));
      alert('Campaign sent successfully!');
    }
  };

  const draftCount = campaigns.filter(c => c.status === 'draft').length;
  const scheduledCount = campaigns.filter(c => c.status === 'scheduled').length;
  const sentCount = campaigns.filter(c => c.status === 'sent').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Email Marketing</h2>
          <p className="text-sm text-gray-500 mt-1">Create and manage email campaigns</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
        >
          <Plus size={18} />
          Create Campaign
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Draft Campaigns</span>
            <Edit className="text-gray-400" size={20} />
          </div>
          <p className="text-2xl font-bold">{draftCount}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Scheduled</span>
            <Calendar className="text-blue-600" size={20} />
          </div>
          <p className="text-2xl font-bold">{scheduledCount}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Sent</span>
            <Send className="text-green-600" size={20} />
          </div>
          <p className="text-2xl font-bold">{sentCount}</p>
        </div>
      </div>

      {/* Campaigns List */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left p-4 text-sm font-medium">Campaign Name</th>
              <th className="text-left p-4 text-sm font-medium">Subject</th>
              <th className="text-left p-4 text-sm font-medium">Status</th>
              <th className="text-left p-4 text-sm font-medium">Recipients</th>
              <th className="text-left p-4 text-sm font-medium">Performance</th>
              <th className="text-left p-4 text-sm font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map((campaign) => (
              <tr key={campaign.id} className="border-b hover:bg-gray-50">
                <td className="p-4">
                  <p className="font-medium">{campaign.name}</p>
                  {campaign.sentAt && (
                    <p className="text-xs text-gray-500 mt-1">
                      Sent: {new Date(campaign.sentAt).toLocaleDateString()}
                    </p>
                  )}
                  {campaign.scheduledAt && (
                    <p className="text-xs text-gray-500 mt-1">
                      Scheduled: {new Date(campaign.scheduledAt).toLocaleDateString()}
                    </p>
                  )}
                </td>
                <td className="p-4 text-sm text-gray-600">{campaign.subject}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                    campaign.status === 'sent' ? 'bg-green-100 text-green-700' :
                    campaign.status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                  </span>
                </td>
                <td className="p-4 text-sm">{campaign.recipients.toLocaleString()}</td>
                <td className="p-4">
                  {campaign.openRate !== undefined ? (
                    <div className="text-sm">
                      <p>Open: <span className="font-medium">{campaign.openRate}%</span></p>
                      <p>Click: <span className="font-medium">{campaign.clickRate}%</span></p>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400">-</span>
                  )}
                </td>
                <td className="p-4">
                  <div className="flex gap-2">
                    {campaign.status === 'draft' && (
                      <button
                        onClick={() => handleSendCampaign(campaign.id)}
                        className="p-2 bg-green-500 text-white rounded hover:bg-green-600"
                        title="Send Now"
                      >
                        <Send size={16} />
                      </button>
                    )}
                    <button
                      className="p-2 hover:bg-gray-100 rounded"
                      title="Preview"
                    >
                      <Eye size={16} className="text-gray-600" />
                    </button>
                    <button
                      onClick={() => handleDeleteCampaign(campaign.id)}
                      className="p-2 hover:bg-red-50 rounded"
                      title="Delete"
                    >
                      <Trash2 size={16} className="text-red-600" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create Campaign Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl">
            <h3 className="text-xl font-bold mb-4">Create New Campaign</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Campaign Name</label>
                <input
                  type="text"
                  value={newCampaign.name}
                  onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="e.g., Summer Collection Launch"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Subject Line</label>
                <input
                  type="text"
                  value={newCampaign.subject}
                  onChange={(e) => setNewCampaign({ ...newCampaign, subject: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="e.g., New Summer Collection is Here!"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email Content</label>
                <textarea
                  value={newCampaign.content}
                  onChange={(e) => setNewCampaign({ ...newCampaign, content: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg h-40"
                  placeholder="Write your email content here..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Recipients</label>
                <select
                  value={newCampaign.recipients}
                  onChange={(e) => setNewCampaign({ ...newCampaign, recipients: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  <option value="all">All Subscribers (1,500)</option>
                  <option value="active">Active Customers (800)</option>
                  <option value="inactive">Inactive Customers (700)</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCreateCampaign}
                className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
              >
                Create Campaign
              </button>
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 border border-black rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
