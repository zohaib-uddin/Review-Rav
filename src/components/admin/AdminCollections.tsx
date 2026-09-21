import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Save, X, ToggleLeft, ToggleRight } from 'lucide-react';
import { useStore } from '../../store/useStore';

export default function AdminCollections() {
  const [collections, setCollections] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingCollection, setEditingCollection] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    cover_image_url: '',
    show_in_focus: false,
    show_explore_banner: false,
    show_on_home_chapter: false,
    chapter_title: '',
    edition_name: '',
    sort_order: 0,
    is_active: true,
  });

  useEffect(() => {
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    try {
      const response = await fetch('/api/collections');
      const data = await response.json();
      setCollections(data);
    } catch (error) {
      console.error('Failed to fetch collections:', error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting collection:', formData);
    setShowForm(false);
    setEditingCollection(null);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      cover_image_url: '',
      show_in_focus: false,
      show_explore_banner: false,
      show_on_home_chapter: false,
      chapter_title: '',
      edition_name: '',
      sort_order: 0,
      is_active: true,
    });
  };

  const handleEdit = (collection: any) => {
    setEditingCollection(collection);
    setFormData({
      name: collection.name || '',
      slug: collection.slug || '',
      description: collection.description || '',
      cover_image_url: collection.cover_image_url || '',
      show_in_focus: Boolean(collection.show_in_focus),
      show_explore_banner: Boolean(collection.show_explore_banner),
      show_on_home_chapter: Boolean(collection.show_on_home_chapter),
      chapter_title: collection.chapter_title || '',
      edition_name: collection.edition_name || '',
      sort_order: Number(collection.sort_order) || 0,
      is_active: collection.is_active !== undefined ? Boolean(collection.is_active) : true,
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this collection?')) {
      console.log('Deleting collection:', id);
    }
  };

  const toggleActive = (id: string, currentStatus: boolean) => {
    console.log('Toggling collection:', id, 'to', !currentStatus);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Collections Management</h2>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          <Plus size={16} /> Add Collection
        </button>
      </div>

      {/* Collections List */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6">
          <div className="space-y-3">
            {collections.map(collection => (
              <div key={collection.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  {collection.cover_image_url && (
                    <img src={collection.cover_image_url} alt={collection.name} className="w-16 h-16 rounded-lg object-cover" />
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{collection.name}</h4>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${collection.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {collection.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">{collection.slug}</p>
                    <div className="flex gap-2 mt-1">
                      {collection.show_in_focus && (
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">In Focus</span>
                      )}
                      {collection.show_explore_banner && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Explore Banner</span>
                      )}
                      {collection.show_on_home_chapter && (
                        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Home Chapter</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleActive(collection.id, collection.is_active)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title={collection.is_active ? 'Deactivate' : 'Activate'}
                  >
                    {collection.is_active ? (
                      <ToggleRight size={20} className="text-green-600" />
                    ) : (
                      <ToggleLeft size={20} className="text-gray-400" />
                    )}
                  </button>
                  <button
                    onClick={() => handleEdit(collection)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Edit size={16} className="text-gray-600" />
                  </button>
                  <button
                    onClick={() => handleDelete(collection.id)}
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

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-xl font-bold">{editingCollection ? 'Edit Collection' : 'Add Collection'}</h3>
              <button onClick={() => { setShowForm(false); setEditingCollection(null); resetForm(); }} className="p-2 hover:bg-gray-100 rounded-full">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:border-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Slug *</label>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={e => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:border-black font-mono text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Description</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:border-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Cover Image URL</label>
                <input
                  type="url"
                  value={formData.cover_image_url}
                  onChange={e => setFormData({ ...formData, cover_image_url: e.target.value })}
                  className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:border-black"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Chapter Title</label>
                  <input
                    type="text"
                    value={formData.chapter_title}
                    onChange={e => setFormData({ ...formData, chapter_title: e.target.value })}
                    placeholder="e.g., WARM CHAPTER I"
                    className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Edition Name</label>
                  <input
                    type="text"
                    value={formData.edition_name}
                    onChange={e => setFormData({ ...formData, edition_name: e.target.value })}
                    placeholder="e.g., MAIN EDITION"
                    className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:border-black"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Sort Order</label>
                <input
                  type="number"
                  value={formData.sort_order}
                  onChange={e => setFormData({ ...formData, sort_order: Number(e.target.value) })}
                  className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:border-black"
                />
              </div>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.show_in_focus}
                    onChange={e => setFormData({ ...formData, show_in_focus: e.target.checked })}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm font-medium">Show in Focus Section</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.show_explore_banner}
                    onChange={e => setFormData({ ...formData, show_explore_banner: e.target.checked })}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm font-medium">Show Explore Banner</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.show_on_home_chapter}
                    onChange={e => setFormData({ ...formData, show_on_home_chapter: e.target.checked })}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm font-medium">Show on Home Chapter</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm font-medium">Active</span>
                </label>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-2 bg-black text-white py-3 rounded-xl font-bold hover:bg-gray-800 transition-colors"
                >
                  <Save size={18} /> {editingCollection ? 'Update' : 'Create'} Collection
                </button>
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setEditingCollection(null); resetForm(); }}
                  className="px-6 py-3 border-2 rounded-xl font-bold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
