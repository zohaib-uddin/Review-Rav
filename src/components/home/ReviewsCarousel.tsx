import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

interface Review {
  id: string;
  user_name: string;
  rating: number;
  comment: string;
  date: string;
}

interface ReviewsCarouselProps {
  reviews: Review[];
}

export default function ReviewsCarousel({ reviews }: ReviewsCarouselProps) {
  if (reviews.length === 0) return null;

  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <p className="text-xs tracking-[0.3em] text-gray-500 mb-2">TESTIMONIALS</p>
          <h2 className="text-3xl font-display font-bold">TRUSTED BY THOUSANDS</h2>
          <div className="flex items-center justify-center gap-1 mt-3">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={20} className="fill-yellow-400 text-yellow-400" />
            ))}
            <span className="text-sm text-gray-500 ml-2">4.9/5 from 2,000+ reviews</span>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.slice(0, 6).map((review, i) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-6 rounded-2xl border hover:shadow-lg transition-shadow"
            >
              <Quote className="text-purple-200 mb-3" size={24} />
              <div className="flex items-center gap-1 mb-3">
                {[...Array(review.rating)].map((_, j) => (
                  <Star key={j} size={14} className="fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-600 text-sm mb-4 leading-relaxed">"{review.comment}"</p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {review.user_name[0]}
                </div>
                <div>
                  <p className="text-xs font-semibold">{review.user_name}</p>
                  <p className="text-[10px] text-gray-400">Verified Buyer</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
