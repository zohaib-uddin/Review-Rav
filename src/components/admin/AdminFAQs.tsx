import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';

export default function AdminFAQs() {
  const [faqs, setFaqs] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingFaq, setEditingFaq] = useState<any>(null);
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: '',
    display_order: 0,
    is_active: true,
  });

  useEffect(() => {
    fetchFaqs();
  }, []);

  const fetchFaqs = async () => {
    try {
      const response = await fetch('/api/faqs');
      const data = await response.json();
      setFaqs(data);
    } catch (error) {
      console.error('Failed to fetch FAQs:', error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting FAQ:', formData);
    setShowForm(false);
    setEditingFaq(null);
    resetForm();
  };

  const resetForm = () => {
    setFormData({ question: '', answer: '', category: '', display_order: 0, is_active: true });
  };

  const handleEdit = (faq: any) => {
    setEditingFaq(faq);
    setFormData({
      question: faq.question,
      answer: faq.answer,
      category: faq.category || '',
      display_order: faq.display_order,
      is_active: faq.is_active,
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this FAQ?')) {
      console.log('Deleting FAQ:', id);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">FAQs Management</h2>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          <Plus size={16} /> Add FAQ
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6">
          <div className="space-y-3">
            {faqs.map(faq => (
              <div key={faq.id} className="flex items-start justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${faq.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {faq.is_active ? 'Active' : 'Inactive'}
                    </span>
                    {faq.category && (
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                        {faq.category}
                      </span>
                    )}
                  </div>
                  <h4 className="font-medium mb-1">{faq.question}</h4>
                  <p className="text-sm text-gray-600">{faq.answer}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(faq)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Edit size={16} className="text-gray-600" />
                  </button>
                  <button
                    onClick={() => handleDelete(faq.id)}
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
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-xl font-bold">{editingFaq ? 'Edit FAQ' : 'Add FAQ'}</h3>
              <button onClick={() => { setShowForm(false); setEditingFaq(null); resetForm(); }} className="p-2 hover:bg-gray-100 rounded-full">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Question *</label>
                <input
                  type="text"
                  required
                  value={formData.question}
                  onChange={e => setFormData({ ...formData, question: e.target.value })}
                  className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:border-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Answer *</label>
                <textarea
                  required
                  value={formData.answer}
                  onChange={e => setFormData({ ...formData, answer: e.target.value })}
                  rows={4}
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
                <span className="text-sm font-medium">Active</span>
              </label>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-2 bg-black text-white py-3 rounded-xl font-bold hover:bg-gray-800 transition-colors"
                >
                  <Save size={18} /> {editingFaq ? 'Update' : 'Create'} FAQ
                </button>
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setEditingFaq(null); resetForm(); }}
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
