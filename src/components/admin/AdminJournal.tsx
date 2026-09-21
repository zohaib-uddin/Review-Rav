import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';

export default function AdminJournal() {
  const [entries, setEntries] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    content: '',
    featured_image: '',
    category: '',
    author: '',
    published_date: new Date().toISOString().split('T')[0],
    display_order: 0,
    is_active: true,
  });

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const response = await fetch('/api/journal');
      const data = await response.json();
      setEntries(data);
    } catch (error) {
      console.error('Failed to fetch journal entries:', error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting journal entry:', formData);
    setShowForm(false);
    setEditingEntry(null);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      title: '',
      subtitle: '',
      content: '',
      featured_image: '',
      category: '',
      author: '',
      published_date: new Date().toISOString().split('T')[0],
      display_order: 0,
      is_active: true,
    });
  };

  const handleEdit = (entry: any) => {
    setEditingEntry(entry);
    setFormData({
      title: entry.title,
      subtitle: entry.subtitle || '',
      content: entry.content,
      featured_image: entry.featured_image || '',
      category: entry.category || '',
      author: entry.author || '',
      published_date: entry.published_date?.split('T')[0] || new Date().toISOString().split('T')[0],
      display_order: entry.display_order,
      is_active: entry.is_active,
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this journal entry?')) {
      console.log('Deleting journal entry:', id);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Journal Management</h2>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          <Plus size={16} /> Add Entry
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6">
          <div className="space-y-3">
            {entries.map(entry => (
              <div key={entry.id} className="flex items-start justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-4 flex-1">
                  {entry.featured_image && (
                    <img src={entry.featured_image} alt={entry.title} className="w-20 h-20 rounded-lg object-cover" />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${entry.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {entry.is_active ? 'Published' : 'Draft'}
                      </span>
                      {entry.category && (
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                          {entry.category}
                        </span>
                      )}
                    </div>
                    <h4 className="font-medium mb-1">{entry.title}</h4>
                    {entry.subtitle && <p className="text-sm text-gray-500 mb-1">{entry.subtitle}</p>}
                    <p className="text-xs text-gray-400">By {entry.author} • {new Date(entry.published_date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(entry)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Edit size={16} className="text-gray-600" />
                  </button>
                  <button
                    onClick={() => handleDelete(entry.id)}
                    className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} className="text-red-600" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-xl font-bold">{editingEntry ? 'Edit Entry' : 'Add Entry'}</h3>
              <button onClick={() => { setShowForm(false); setEditingEntry(null); resetForm(); }} className="p-2 hover:bg-gray-100 rounded-full">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:border-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Subtitle</label>
                <input
                  type="text"
                  value={formData.subtitle}
                  onChange={e => setFormData({ ...formData, subtitle: e.target.value })}
                  className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:border-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Content *</label>
                <textarea
                  required
                  value={formData.content}
                  onChange={e => setFormData({ ...formData, content: e.target.value })}
                  rows={8}
                  className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:border-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Featured Image URL</label>
                <input
                  type="url"
                  value={formData.featured_image}
                  onChange={e => setFormData({ ...formData, featured_image: e.target.value })}
                  className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:border-black"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Category</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Author</label>
                  <input
                    type="text"
                    value={formData.author}
                    onChange={e => setFormData({ ...formData, author: e.target.value })}
                    className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:border-black"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Published Date</label>
                  <input
                    type="date"
                    value={formData.published_date}
                    onChange={e => setFormData({ ...formData, published_date: e.target.value })}
                    className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Display Order</label>
                  <input
                    type="number"
                    value={formData.display_order}
                    onChange={e => setFormData({ ...formData, display_order: Number(e.target.value) })}
                    className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:border-black"
                  />
                </div>
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 rounded"
                />
                <span className="text-sm font-medium">Published</span>
              </label>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-2 bg-black text-white py-3 rounded-xl font-bold hover:bg-gray-800 transition-colors"
                >
                  <Save size={18} /> {editingEntry ? 'Update' : 'Create'} Entry
                </button>
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setEditingEntry(null); resetForm(); }}
                  className="px-6 py-3 border-2 rounded-xl font-bold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
