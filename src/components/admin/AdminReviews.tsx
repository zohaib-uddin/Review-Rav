import React, { useState, useEffect } from 'react';
import { Star, Check, X, Trash2, RefreshCw, MessageSquare, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';

export default function AdminReviews() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/reviews?all=true');
      if (res.ok) {
        const data = await res.json();
        setReviews(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3000);
  };

  const toggleApproval = async (id: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    try {
      setReviews(prev => prev.map(r => r.id === id ? { ...r, is_approved: newStatus } : r));
      await fetch(`/api/reviews/${id}/approval`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_approved: newStatus }),
      });
      showToast(`Review ${newStatus ? 'approved and published' : 'marked as pending'}`);
    } catch (err) {
      console.error('Failed to toggle approval:', err);
      fetchReviews();
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this review?')) return;
    try {
      setReviews(prev => prev.filter(r => r.id !== id));
      await fetch(`/api/reviews/${id}`, { method: 'DELETE' });
      showToast('Review deleted permanently');
    } catch (err) {
      console.error('Failed to delete review:', err);
      fetchReviews();
    }
  };

  const pendingCount = reviews.filter(r => !r.is_approved).length;
  const approvedCount = reviews.filter(r => r.is_approved).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-display text-gray-900 tracking-tight">Product Reviews & Moderation</h2>
          <p className="text-xs text-gray-500 mt-1">
            Approve verified buyer feedback, filter low-quality comments, and manage social proof ratings.
          </p>
        </div>
        <button
          onClick={fetchReviews}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-colors self-start sm:self-auto"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {feedback && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-600" />
          <span>{feedback}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <p className="text-xs font-medium text-gray-500">Total Customer Reviews</p>
          <p className="text-2xl font-black font-display text-gray-900 mt-0.5">{reviews.length}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <p className="text-xs font-medium text-gray-500">Pending Review Moderation</p>
          <p className="text-2xl font-black font-display text-amber-600 mt-0.5">{pendingCount}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <p className="text-xs font-medium text-gray-500">Live Approved Feedback</p>
          <p className="text-2xl font-black font-display text-emerald-600 mt-0.5">{approvedCount}</p>
        </div>
      </div>

      {/* Reviews List */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-6">
        {loading ? (
          <div className="text-center py-12">
            <RefreshCw className="animate-spin text-gray-400 mx-auto mb-2" size={24} />
            <p className="text-xs text-gray-400">Loading reviews...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="text-gray-300 mx-auto mb-2" size={32} />
            <p className="text-xs text-gray-500 font-semibold">No reviews registered yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reviews.map(review => (
              <div 
                key={review.id} 
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-gray-100 rounded-xl hover:bg-gray-50/60 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className="font-bold text-sm text-gray-900">{review.user_name || review.name || 'Verified Buyer'}</span>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          size={13} 
                          className={i < (review.rating || 5) ? 'fill-amber-400 text-amber-400' : 'text-gray-200'} 
                        />
                      ))}
                    </div>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                      review.is_approved 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                        : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}>
                      {review.is_approved ? 'Live / Approved' : 'Pending Approval'}
                    </span>
                    {review.product_slug && (
                      <span className="text-[10px] font-mono text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                        {review.product_slug}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-gray-700 leading-relaxed font-sans">
                    "{review.comment || review.content || 'Great product!'}"
                  </p>

                  <p className="text-[10px] text-gray-400 font-mono mt-1">
                    {review.created_at || review.date ? new Date(review.created_at || review.date).toLocaleDateString() : 'Recent'}
                  </p>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <button
                    onClick={() => toggleApproval(review.id, review.is_approved)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                      review.is_approved
                        ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200'
                        : 'bg-black hover:bg-zinc-800 text-white shadow-xs'
                    }`}
                  >
                    {review.is_approved ? <X size={13} /> : <Check size={13} />}
                    <span>{review.is_approved ? 'Unpublish' : 'Approve'}</span>
                  </button>

                  <button
                    onClick={() => handleDelete(review.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete Review"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
