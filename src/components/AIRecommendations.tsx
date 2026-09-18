import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { useStore, Product } from '../store/useStore';
import { Link } from 'react-router-dom';

interface AIRecommendationsProps {
  currentProduct?: Product;
  limit?: number;
}

export default function AIRecommendations({ currentProduct, limit = 8 }: AIRecommendationsProps) {
  const { products } = useStore();
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [reason, setReason] = useState('');

  useEffect(() => {
    // Get browsing history from localStorage
    const history = JSON.parse(localStorage.getItem('browsingHistory') || '[]') as string[];
    
    if (currentProduct) {
      // Track current product view
      const updatedHistory = [currentProduct.id, ...history.filter(id => id !== currentProduct.id)].slice(0, 20);
      localStorage.setItem('browsingHistory', JSON.stringify(updatedHistory));
      
      // Recommend based on current product
      const similarProducts = products
        .filter(p => {
          // Same category
          const sameCategory = p.category === currentProduct.category;
          // Similar price range (±30%)
          const currentPrice = currentProduct.price || 0;
          const similarPrice = p.price && Math.abs(p.price - currentPrice) <= currentPrice * 0.3;
          // Not the same product
          const notSame = p.id !== currentProduct.id;
          // Not recently viewed
          const notRecentlyViewed = !history.slice(0, 5).includes(p.id);
          
          return sameCategory && similarPrice && notSame && notRecentlyViewed;
        })
        .slice(0, limit);
      
      setRecommendations(similarProducts);
      setReason(`Because you viewed "${currentProduct.name}"`);
    } else {
      // Recommend based on browsing history
      const viewedProducts = products.filter(p => history.includes(p.id));
      
      if (viewedProducts.length > 0) {
        // Get most viewed category
        const categoryCount: Record<string, number> = {};
        viewedProducts.forEach(p => {
          if (p.category) {
            categoryCount[p.category] = (categoryCount[p.category] || 0) + 1;
          }
        });
        
        const topCategory = Object.entries(categoryCount).sort((a, b) => b[1] - a[1])[0]?.[0];
        
        if (topCategory) {
          const recommended = products
            .filter(p => p.category === topCategory && !history.includes(p.id))
            .slice(0, limit);
          
          setRecommendations(recommended);
          setReason('Based on your browsing history');
        }
      } else {
        // Default: trending products
        const trending = products
          .filter(p => p.isBestseller || p.isNew)
          .slice(0, limit);
        
        setRecommendations(trending);
        setReason('Trending now');
      }
    }
  }, [currentProduct, products]);

  if (recommendations.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="text-purple-600" size={24} />
        <div>
          <h3 className="text-xl font-bold">Recommended for You</h3>
          <p className="text-sm text-gray-600">{reason}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {recommendations.map((product, i) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Link to={`/product/${product.id}`} className="group">
              <div className="aspect-[3/4] rounded-xl overflow-hidden bg-gray-200 mb-2">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <h4 className="text-sm font-medium line-clamp-2 group-hover:text-purple-600 transition-colors">
                {product.name}
              </h4>
              <div className="flex items-center gap-2 mt-1">
                {product.salePrice ? (
                  <>
                    <span className="text-sm font-bold text-red-600">
                      Rs. {product.salePrice.toLocaleString()}
                    </span>
                    <span className="text-xs text-gray-400 line-through">
                      Rs. {product.price?.toLocaleString()}
                    </span>
                  </>
                ) : (
                  <span className="text-sm font-bold">
                    Rs. {product.price?.toLocaleString()}
                  </span>
                )}
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
