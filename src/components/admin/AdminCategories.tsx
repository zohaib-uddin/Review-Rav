import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { useStore } from '../../store/useStore';

export default function AdminCategories() {
  const { categories, fetchCategories } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    badge: '',
    tag: '',
    cover_image_url: '',
    banner_image: '',
    parent_id: null as string | null,
    sort_order: 0,
    is_featured_in_focus: false,
    display_order_in_focus: 0,
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // API call to create/update category
    console.log('Submitting category:', formData);
    setShowForm(false);
    setEditingCategory(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      badge: '',
      tag: '',
      cover_image_url: '',
      parent_id: null,
      sort_order: 0,
      is_featured_in_focus: false,
      display_order_in_focus: 0,
    });
  };

  const handleEdit = (category: any) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      badge: category.badge || '',
      tag: category.tag || '',
      cover_image_url: category.cover_image_url || '',
      banner_image: category.banner_image || '',
      parent_id: category.parent_id,
      sort_order: category.sort_order,
      is_featured_in_focus: category.is_featured_in_focus || false,
      display_order_in_focus: category.display_order_in_focus || 0,
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this category?')) {
      // API call to delete category
      console.log('Deleting category:', id);
    }
  };

  const mainCategories = categories.filter(c => !c.parent_id);
  const subcategories = categories.filter(c => c.parent_id);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Categories Management</h2>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          <Plus size={16} /> Add Category
        </button>
      </div>

      {/* Categories List */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6">
          <h3 className="font-bold mb-4">Main Categories ({mainCategories.length})</h3>
          <div className="space-y-3">
            {mainCategories.map(category => (
              <div key={category.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  {category.cover_image_url && (
                    <img src={category.cover_image_url} alt={category.name} className="w-12 h-12 rounded-lg object-cover" />
                  )}
                  <div>
                    <h4 className="font-medium">{category.name}</h4>
                    <p className="text-sm text-gray-500">{category.slug}</p>
                    {category.badge && (
                      <span className="inline-block mt-1 bg-purple-100 text-purple-700 text-xs px-2 py-0.5 rounded-full">
                        {category.badge}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(category)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Edit size={16} className="text-gray-600" />
                  </button>
                  <button
                    onClick={() => handleDelete(category.id)}
                    className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} className="text-red-600" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {subcategories.length > 0 && (
            <>
              <h3 className="font-bold mb-4 mt-8">Subcategories ({subcategories.length})</h3>
              <div className="space-y-3">
                {subcategories.map(category => (
                  <div key={category.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        <span className="text-xs text-gray-500">SUB</span>
                      </div>
                      <div>
                        <h4 className="font-medium">{category.name}</h4>
                        <p className="text-sm text-gray-500">Parent: {categories.find(c => c.id === category.parent_id)?.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(category)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Edit size={16} className="text-gray-600" />
                      </button>
                      <button
                        onClick={() => handleDelete(category.id)}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} className="text-red-600" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
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
              <h3 className="text-xl font-bold">{editingCategory ? 'Edit Category' : 'Add Category'}</h3>
              <button onClick={() => { setShowForm(false); setEditingCategory(null); }} className="p-2 hover:bg-gray-100 rounded-full">
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Badge</label>
                  <input
                    type="text"
                    value={formData.badge}
                    onChange={e => setFormData({ ...formData, badge: e.target.value })}
                    placeholder="e.g., TRENDING"
                    className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Tag</label>
                  <input
                    type="text"
                    value={formData.tag}
                    onChange={e => setFormData({ ...formData, tag: e.target.value })}
                    placeholder="e.g., WINTER"
                    className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:border-black"
                  />
                </div>
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
              <div>
                <label className="block text-sm font-medium mb-1.5">Banner Image (for Mega Menu)</label>
                <input
                  type="url"
                  value={formData.banner_image || ''}
                  onChange={e => setFormData({ ...formData, banner_image: e.target.value })}
                  placeholder="https://example.com/banner.jpg"
                  className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:border-black"
                />
                <p className="text-xs text-gray-500 mt-1">This image will appear in the right column of the mega menu</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Parent Category</label>
                <select
                  value={formData.parent_id || ''}
                  onChange={e => setFormData({ ...formData, parent_id: e.target.value || null })}
                  className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:border-black"
                >
                  <option value="">None (Main Category)</option>
                  {mainCategories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
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
              
              {/* Collections in Focus Section */}
              <div className="border-t pt-4 mt-4">
                <h4 className="font-bold mb-3">Collections in Focus Settings</h4>
                <div className="flex items-center gap-3 mb-4">
                  <input
                    type="checkbox"
                    id="is_featured_in_focus"
                    checked={formData.is_featured_in_focus}
                    onChange={e => setFormData({ ...formData, is_featured_in_focus: e.target.checked })}
                    className="w-5 h-5 rounded border-gray-300 text-black focus:ring-black"
                  />
                  <label htmlFor="is_featured_in_focus" className="text-sm font-medium">
                    Feature in "Collections in Focus" section
                  </label>
                </div>
                {formData.is_featured_in_focus && (
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Display Order in Focus</label>
                    <input
                      type="number"
                      value={formData.display_order_in_focus}
                      onChange={e => setFormData({ ...formData, display_order_in_focus: Number(e.target.value) })}
                      className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:border-black"
                      placeholder="0"
                    />
                    <p className="text-xs text-gray-500 mt-1">Lower numbers appear first. Maximum 4 categories allowed in this section.</p>
                  </div>
                )}
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-2 bg-black text-white py-3 rounded-xl font-bold hover:bg-gray-800 transition-colors"
                >
                  <Save size={18} /> {editingCategory ? 'Update' : 'Create'} Category
                </button>
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setEditingCategory(null); }}
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
