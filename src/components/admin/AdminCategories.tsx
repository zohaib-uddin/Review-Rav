import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Save, X, AlertTriangle } from 'lucide-react';
import { useStore } from '../../store/useStore';

export default function AdminCategories() {
  const { categories, fetchCategories, featuredCategories, fetchFeaturedCategories } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    badge: '',
    tag: '',
    cover_image_url: '',
    parent_id: null as string | null,
    sort_order: 0,
    is_featured_in_focus: false,
    display_order_in_focus: 0,
    is_warm_chapter: false,
    display_order_warm_chapter: 0,
  });
  const [featuredCount, setFeaturedCount] = useState(0);
  const [warmCount, setWarmCount] = useState(0);
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    fetchCategories();
    fetchFeaturedCategories();
  }, []);

  useEffect(() => {
    // Count currently featured categories (excluding the one being edited)
    const currentlyFeatured = categories.filter(c => c.is_featured_in_focus && c.id !== editingCategory?.id);
    setFeaturedCount(currentlyFeatured.length);
    const currentlyWarm = categories.filter(c => c.is_warm_chapter && c.id !== editingCategory?.id);
    setWarmCount(currentlyWarm.length);
  }, [categories, editingCategory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    // Validation: Check if trying to enable featured when 4 already exist
    if (formData.is_featured_in_focus && !editingCategory?.is_featured_in_focus) {
      if (featuredCount >= 4) {
        setValidationError('Maximum 4 categories can be featured in Collections in Focus');
        return;
      }
    }

    try {
      const url = editingCategory ? `/api/categories/${editingCategory.id}` : '/api/categories';
      const response = await fetch(url, {
        method: editingCategory ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      const savedCategory = await response.json();
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
        is_warm_chapter: false,
        display_order_warm_chapter: 0,
      });
      await fetchCategories();
      await fetchFeaturedCategories();
      await useStore.getState().fetchWarmChapters();
    } catch (error: any) {
      setValidationError(error.message);
    }
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
      parent_id: category.parent_id,
      sort_order: category.sort_order,
      is_featured_in_focus: category.is_featured_in_focus || false,
      display_order_in_focus: category.display_order_in_focus || 0,
      is_warm_chapter: category.is_warm_chapter || false,
      display_order_warm_chapter: category.display_order_warm_chapter || 0,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this category?')) {
      try {
        const response = await fetch(`/api/categories/${id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          await fetchCategories();
          await fetchFeaturedCategories();
          await useStore.getState().fetchWarmChapters();
        }
      } catch (e) {
        console.error('Delete category error:', e);
      }
    }
  };

  const handleToggleFeatured = async (category: any, newValue: boolean) => {
    setValidationError('');
    
    // Validation: Check if trying to enable when 4 already exist
    if (newValue && featuredCount >= 4) {
      setValidationError('Maximum 4 categories can be featured in Collections in Focus');
      return;
    }

    try {
      const response = await fetch(`/api/categories/${category.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_featured_in_focus: newValue }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      fetchCategories();
      fetchFeaturedCategories();
    } catch (error: any) {
      setValidationError(error.message);
    }
  };

  const handleToggleWarmChapter = async (category: any, newValue: boolean) => {
    setValidationError('');
    try {
      const response = await fetch(`/api/categories/${category.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_warm_chapter: newValue }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      fetchCategories();
      useStore.getState().fetchWarmChapters();
    } catch (error: any) {
      setValidationError(error.message);
    }
  };

  const mainCategories = categories.filter(c => !c.parent_id);
  const subcategories = categories.filter(c => c.parent_id);

  return (
    <div>
      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="text-blue-600 mt-0.5" size={20} />
          <div>
            <h4 className="font-semibold text-blue-900">Collections in Focus - Featured Categories</h4>
            <p className="text-sm text-blue-700 mt-1">
              Currently <strong>{featuredCount}/4</strong> categories are featured on the homepage. 
              You can select up to 4 categories to appear in the "Collections in Focus" section.
            </p>
          </div>
        </div>
      </div>

      {/* Validation Error Message */}
      {validationError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <p className="text-red-700 font-medium">{validationError}</p>
        </div>
      )}

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
                    {category.is_featured_in_focus && (
                      <span className="inline-block mt-1 bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-medium">
                        ✓ Focus (#{category.display_order_in_focus || 0})
                      </span>
                    )}
                    {category.is_warm_chapter && (
                      <span className="inline-block mt-1 ml-1 bg-amber-100 text-amber-800 text-xs px-2 py-0.5 rounded-full font-medium">
                        🔥 Warm Chapter (#{category.display_order_warm_chapter || 0})
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4 flex-wrap justify-end">
                  {/* Featured in Focus Toggle */}
                  <div className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1.5 rounded-lg border">
                    <label className="text-xs text-gray-600 font-medium">Focus:</label>
                    <button
                      onClick={() => handleToggleFeatured(category, !category.is_featured_in_focus)}
                      className={`relative w-9 h-5 rounded-full transition-colors ${
                        category.is_featured_in_focus ? 'bg-green-600' : 'bg-gray-300'
                      }`}
                      title="Toggle Collections in Focus"
                    >
                      <div
                        className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                          category.is_featured_in_focus ? 'left-4.5' : 'left-0.5'
                        }`}
                      />
                    </button>
                    {category.is_featured_in_focus && (
                      <input
                        type="number"
                        value={category.display_order_in_focus || 0}
                        onChange={(e) => {
                          const newOrder = parseInt(e.target.value) || 0;
                          fetch(`/api/categories/${category.id}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ display_order_in_focus: newOrder }),
                          }).then(() => {
                            fetchCategories();
                            fetchFeaturedCategories();
                          });
                        }}
                        className="w-12 px-1.5 py-0.5 border rounded text-xs text-center"
                        min="0"
                        max="3"
                        title="Display Order in Focus (0-3)"
                      />
                    )}
                  </div>

                  {/* Warm Chapter Toggle */}
                  <div className="flex items-center gap-1.5 bg-amber-50/70 px-2.5 py-1.5 rounded-lg border border-amber-200">
                    <label className="text-xs text-amber-900 font-medium">Warm:</label>
                    <button
                      onClick={() => handleToggleWarmChapter(category, !category.is_warm_chapter)}
                      className={`relative w-9 h-5 rounded-full transition-colors ${
                        category.is_warm_chapter ? 'bg-amber-600' : 'bg-gray-300'
                      }`}
                      title="Toggle Warm Chapter (Homepage)"
                    >
                      <div
                        className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                          category.is_warm_chapter ? 'left-4.5' : 'left-0.5'
                        }`}
                      />
                    </button>
                    {category.is_warm_chapter && (
                      <input
                        type="number"
                        value={category.display_order_warm_chapter || 0}
                        onChange={(e) => {
                          const newOrder = parseInt(e.target.value) || 0;
                          fetch(`/api/categories/${category.id}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ display_order_warm_chapter: newOrder }),
                          }).then(() => {
                            fetchCategories();
                            useStore.getState().fetchWarmChapters();
                          });
                        }}
                        className="w-12 px-1.5 py-0.5 border rounded text-xs text-center border-amber-300"
                        min="0"
                        max="9"
                        title="Warm Chapter Display Order"
                      />
                    )}
                  </div>

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
                        {category.is_featured_in_focus && (
                          <span className="inline-block mt-1 bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-medium">
                            ✓ Featured in Focus
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {/* Featured Toggle */}
                      <div className="flex items-center gap-2">
                        <label className="text-sm text-gray-600">Featured:</label>
                        <button
                          onClick={() => handleToggleFeatured(category, !category.is_featured_in_focus)}
                          className={`relative w-12 h-6 rounded-full transition-colors ${
                            category.is_featured_in_focus ? 'bg-green-600' : 'bg-gray-300'
                          }`}
                        >
                          <div
                            className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                              category.is_featured_in_focus ? 'left-7' : 'left-1'
                            }`}
                          />
                        </button>
                      </div>
                      {/* Display Order Input */}
                      <div className="flex items-center gap-2">
                        <label className="text-sm text-gray-600">Order:</label>
                        <input
                          type="number"
                          value={category.display_order_in_focus || 0}
                          onChange={(e) => {
                            const newOrder = parseInt(e.target.value);
                            fetch(`/api/categories/${category.id}`, {
                              method: 'PUT',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ display_order_in_focus: newOrder }),
                            }).then(() => {
                              fetchCategories();
                              fetchFeaturedCategories();
                            });
                          }}
                          className="w-16 px-2 py-1 border rounded-lg text-sm"
                          min="0"
                          max="3"
                        />
                      </div>
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
              {validationError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-700 text-sm font-medium">{validationError}</p>
                </div>
              )}
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
                <h4 className="font-semibold mb-3">Collections in Focus Settings</h4>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                  <p className="text-sm text-blue-700">
                    Current featured count: <strong>{featuredCount}/4</strong>
                  </p>
                </div>
                <div className="flex items-center gap-3 mb-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_featured_in_focus}
                      onChange={e => {
                        const newValue = e.target.checked;
                        if (newValue && featuredCount >= 4 && !editingCategory?.is_featured_in_focus) {
                          setValidationError('Maximum 4 categories can be featured in Collections in Focus');
                          return;
                        }
                        setFormData({ ...formData, is_featured_in_focus: newValue });
                      }}
                      className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                      disabled={featuredCount >= 4 && !formData.is_featured_in_focus}
                    />
                    <span className="text-sm font-medium">Feature in "Collections in Focus" section</span>
                  </label>
                </div>
                {formData.is_featured_in_focus && (
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Display Order (0-3)</label>
                    <input
                      type="number"
                      min="0"
                      max="3"
                      value={formData.display_order_in_focus}
                      onChange={e => setFormData({ ...formData, display_order_in_focus: Number(e.target.value) })}
                      className="w-24 px-3 py-2 border-2 rounded-xl focus:outline-none focus:border-black"
                    />
                    <p className="text-xs text-gray-500 mt-1">Lower numbers appear first in the grid</p>
                  </div>
                )}
              </div>

              {/* Warm Chapters Section */}
              <div className="border-t pt-4 mt-4">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <span>🔥 Warm Chapters Settings (Homepage)</span>
                </h4>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3">
                  <p className="text-sm text-amber-800">
                    Active Warm Chapters: <strong>{warmCount}</strong>. Enabling this shows this category in the dynamic "Warm Chapter" carousel on the homepage.
                  </p>
                </div>
                <div className="flex items-center gap-3 mb-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_warm_chapter}
                      onChange={e => setFormData({ ...formData, is_warm_chapter: e.target.checked })}
                      className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
                    />
                    <span className="text-sm font-medium">Feature in "Warm Chapters" homepage carousel</span>
                  </label>
                </div>
                {formData.is_warm_chapter && (
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Display Order (0-9)</label>
                    <input
                      type="number"
                      min="0"
                      max="9"
                      value={formData.display_order_warm_chapter}
                      onChange={e => setFormData({ ...formData, display_order_warm_chapter: Number(e.target.value) })}
                      className="w-24 px-3 py-2 border-2 rounded-xl focus:outline-none focus:border-black"
                    />
                    <p className="text-xs text-gray-500 mt-1">Lower numbers appear first in the carousel</p>
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
