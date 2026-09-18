import { useState, useEffect } from 'react';
import { Star, Check, X } from 'lucide-react';

export default function AdminReviews() {
  const [reviews, setReviews] = useState<any[]>([]);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/reviews');
      const data = await response.json();
      setReviews(data);
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    }
  };

  const toggleApproval = async (id: string, currentStatus: boolean) => {
    console.log('Toggling review approval:', id, 'to', !currentStatus);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Reviews Management</h2>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6">
          <div className="space-y-3">
            {reviews.map(review => (
              <div key={review.id} className="flex items-start justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium">{review.user_name}</span>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={14} className={i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'} />
                      ))}
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${review.is_approved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {review.is_approved ? 'Approved' : 'Pending'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">"{review.comment}"</p>
                  <p className="text-xs text-gray-400">{new Date(review.date).toLocaleDateString()}</p>
                </div>
                <button
                  onClick={() => toggleApproval(review.id, review.is_approved)}
                  className={`p-2 rounded-lg transition-colors ${
                    review.is_approved ? 'hover:bg-red-50 text-red-600' : 'hover:bg-green-50 text-green-600'
                  }`}
                >
                  {review.is_approved ? <X size={18} /> : <Check size={18} />}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
