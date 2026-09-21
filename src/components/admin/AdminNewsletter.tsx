import { useState, useEffect } from 'react';
import { Mail, Trash2, Download } from 'lucide-react';

export default function AdminNewsletter() {
  const [subscribers, setSubscribers] = useState<any[]>([]);

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const fetchSubscribers = async () => {
    try {
      const response = await fetch('/api/newsletter');
      if (response.ok) {
        const data = await response.json();
        setSubscribers(Array.isArray(data) ? data : []);
      } else {
        console.warn('Newsletter API returned non-OK status:', response.status);
      }
    } catch (error) {
      console.error('Failed to fetch subscribers:', error);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this subscriber?')) {
      console.log('Deleting subscriber:', id);
    }
  };

  const exportToCSV = () => {
    const csv = [
      ['Email', 'Subscribed Date', 'Status'],
      ...subscribers.map(s => [
        s.email,
        new Date(s.subscribed_at).toLocaleDateString(),
        s.is_active ? 'Active' : 'Inactive'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'newsletter-subscribers.csv';
    a.click();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Newsletter Subscribers</h2>
        <button
          onClick={exportToCSV}
          className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          <Download size={16} /> Export CSV
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl border">
          <div className="flex items-center gap-3">
            <Mail className="text-blue-600" size={24} />
            <div>
              <p className="text-sm text-gray-500">Total Subscribers</p>
              <p className="text-2xl font-bold">{subscribers.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border">
          <p className="text-sm text-gray-500">Active</p>
          <p className="text-2xl font-bold text-green-600">
            {subscribers.filter(s => s.is_active).length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border">
          <p className="text-sm text-gray-500">Inactive</p>
          <p className="text-2xl font-bold text-gray-400">
            {subscribers.filter(s => !s.is_active).length}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-4 text-sm font-medium">Email</th>
                <th className="text-left p-4 text-sm font-medium">Subscribed Date</th>
                <th className="text-left p-4 text-sm font-medium">Status</th>
                <th className="text-left p-4 text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {subscribers.map(subscriber => (
                <tr key={subscriber.id} className="border-b hover:bg-gray-50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <Mail size={14} className="text-purple-600" />
                      </div>
                      <span className="text-sm">{subscriber.email}</span>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-gray-600">
                    {new Date(subscriber.subscribed_at).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                      subscriber.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {subscriber.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => handleDelete(subscriber.id)}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} className="text-red-600" />
                    </button>
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
