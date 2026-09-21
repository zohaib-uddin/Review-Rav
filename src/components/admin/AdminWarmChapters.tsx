import { useState, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';

interface WarmChapter {
  id: string;
  title: string;
  subtitle: string | null;
  slug: string;
  image_url: string;
  product_ids: string[];
  display_order: number;
  is_active: boolean;
}

export default function AdminWarmChapters() {
  const { warmChapters, fetchWarmChapters } = useStore();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<WarmChapter>>({
    title: '',
    subtitle: '',
    slug: '',
    image_url: '',
    product_ids: [],
    display_order: 0,
    is_active: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchWarmChapters();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const url = editingId
        ? `/api/warm-chapters/${editingId}`
        : '/api/warm-chapters';
      
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to save warm chapter');
      }

      await fetchWarmChapters();
      resetForm();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (chapter: WarmChapter) => {
    setFormData({
      title: chapter.title,
      subtitle: chapter.subtitle || '',
      slug: chapter.slug,
      image_url: chapter.image_url,
      product_ids: chapter.product_ids || [],
      display_order: chapter.display_order,
      is_active: chapter.is_active,
    });
    setEditingId(chapter.id);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this warm chapter?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/warm-chapters/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete warm chapter');
      }

      await fetchWarmChapters();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleToggleActive = async (chapter: WarmChapter) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/warm-chapters/${chapter.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...chapter,
          is_active: !chapter.is_active,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update warm chapter');
      }

      await fetchWarmChapters();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      subtitle: '',
      slug: '',
      image_url: '',
      product_ids: [],
      display_order: 0,
      is_active: true,
    });
    setEditingId(null);
    setIsFormOpen(false);
    setError('');
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Warm Chapters Management</h1>
        <button
          onClick={() => setIsFormOpen(true)}
          className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800"
        >
          <Plus size={20} />
          Add Chapter
        </button>
      </div>

      {/* Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingId ? 'Edit Warm Chapter' : 'Add Warm Chapter'}
            </h2>
            
            {error && (
              <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Subtitle</label>
                <input
                  type="text"
                  value={formData.subtitle || ''}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Slug *</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Image URL *</label>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Display Order</label>
                <input
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                />
                <label htmlFor="is_active" className="text-sm font-medium">Is Active</label>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : (editingId ? 'Update' : 'Create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Chapters List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Image</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {warmChapters.map((chapter: WarmChapter) => (
              <tr key={chapter.id}>
                <td className="px-6 py-4 whitespace-nowrap">{chapter.display_order}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="font-medium">{chapter.title}</div>
                    {chapter.subtitle && (
                      <div className="text-sm text-gray-500">{chapter.subtitle}</div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <img
                    src={chapter.image_url}
                    alt={chapter.title}
                    className="w-16 h-16 object-cover rounded"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    chapter.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {chapter.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                  <button
                    onClick={() => handleToggleActive(chapter)}
                    className="text-gray-600 hover:text-blue-600"
                    title={chapter.is_active ? 'Deactivate' : 'Activate'}
                  >
                    {chapter.is_active ? <Eye size={18} /> : <EyeOff size={18} />}
                  </button>
                  <button
                    onClick={() => handleEdit(chapter)}
                    className="text-gray-600 hover:text-blue-600"
                    title="Edit"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(chapter.id)}
                    className="text-gray-600 hover:text-red-600"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}