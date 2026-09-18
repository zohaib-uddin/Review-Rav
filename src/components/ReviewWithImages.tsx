import { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Upload, X, Image as ImageIcon } from 'lucide-react';
import { useStore } from '../store/useStore';

interface ReviewWithImagesProps {
  productId: string;
}

export default function ReviewWithImages({ productId }: ReviewWithImagesProps) {
  const { reviews, addReview } = useStore();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const productReviews = reviews.filter(r => r.product_id === productId && r.is_approved);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + images.length > 5) {
      alert('Maximum 5 images allowed');
      return;
    }

    setImages([...images, ...files]);

    // Create previews
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      alert('Please select a rating');
      return;
    }
    if (!comment.trim()) {
      alert('Please write a comment');
      return;
    }

    setIsSubmitting(true);

    try {
      // In production, upload images to Cloudinary first
      // const uploadedUrls = await Promise.all(
      //   images.map(async (image) => {
      //     const formData = new FormData();
      //     formData.append('file', image);
      //     const response = await fetch('/api/upload', { method: 'POST', body: formData });
      //     const data = await response.json();
      //     return data.url;
      //   })
      // );

      // For demo, use placeholder URLs
      const uploadedUrls = imagePreviews;

      addReview({
        id: Date.now().toString(),
        product_id: productId,
        user_id: 'demo-user',
        user_name: 'You',
        rating,
        comment,
        images: uploadedUrls,
        date: new Date().toISOString(),
        is_approved: false, // Requires admin approval
      });

      // Reset form
      setRating(0);
      setComment('');
      setImages([]);
      setImagePreviews([]);
      setShowForm(false);
      alert('Review submitted! It will appear after admin approval.');
    } catch (error) {
      console.error('Failed to submit review:', error);
      alert('Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6">
      {/* Reviews Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold">Customer Reviews</h3>
          <p className="text-sm text-gray-500">{productReviews.length} reviews</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-6 py-2 bg-black text-white rounded-full font-bold text-sm hover:bg-gray-800 transition-colors"
        >
          {showForm ? 'Cancel' : 'Write a Review'}
        </button>
      </div>

      {/* Review Form */}
      {showForm && (
        <motion.form
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          onSubmit={handleSubmit}
          className="mb-8 p-6 bg-gray-50 rounded-xl"
        >
          <h4 className="font-bold mb-4">Write Your Review</h4>

          {/* Rating */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Rating *</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    size={32}
                    className={(hoverRating || rating) >= star ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Comment */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Your Review *</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              placeholder="Share your experience with this product..."
              className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:border-black resize-none"
              required
            />
          </div>

          {/* Image Upload */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Add Images (Optional, max 5)
            </label>
            <div className="flex gap-2 flex-wrap">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative w-20 h-20 rounded-lg overflow-hidden">
                  <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 p-1 bg-black/70 text-white rounded-full hover:bg-black"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
              {images.length < 5 && (
                <label className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-black transition-colors">
                  <Upload size={20} className="text-gray-400" />
                  <span className="text-xs text-gray-400 mt-1">Upload</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-black text-white py-3 rounded-full font-bold hover:bg-gray-800 transition-colors disabled:bg-gray-400"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </motion.form>
      )}

      {/* Reviews List */}
      <div className="space-y-6">
        {productReviews.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No reviews yet. Be the first to review!</p>
        ) : (
          productReviews.map((review) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="border-b pb-6 last:border-b-0"
            >
              {/* Review Header */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={16}
                          className={i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="font-bold">{review.user_name}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(review.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>

              {/* Review Comment */}
              <p className="text-gray-700 mb-3">{review.comment}</p>

              {/* Review Images */}
              {review.images && review.images.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {review.images.map((img, i) => (
                    <div key={i} className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100">
                      <img src={img} alt={`Review image ${i + 1}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
