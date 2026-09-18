import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock } from 'lucide-react';

interface RecentlyViewedProps {
  limit?: number;
}

interface ViewedProduct {
  id: string;
  name: string;
  image: string;
  price: number;
  slug: string;
}

export default function RecentlyViewed({ limit = 4 }: RecentlyViewedProps) {
  const [viewedProducts, setViewedProducts] = useState<ViewedProduct[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('recentlyViewed');
    if (stored) {
      setViewedProducts(JSON.parse(stored));
    }
  }, []);

  if (viewedProducts.length === 0) {
    return null;
  }

  return (
    <div className="bg-gray-50 rounded-xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <Clock size={20} className="text-gray-600" />
        <h3 className="text-lg font-bold">Recently Viewed</h3>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {viewedProducts.slice(0, limit).map(product => (
          <Link
            key={product.id}
            to={`/product/${product.id}`}
            className="group"
          >
            <div className="aspect-[3/4] rounded-lg overflow-hidden bg-gray-200 mb-2">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <h4 className="text-sm font-medium line-clamp-2 group-hover:text-black transition-colors">
              {product.name}
            </h4>
            <p className="text-sm font-bold mt-1">
              Rs. {product.price.toLocaleString()}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}

// Helper function to add product to recently viewed
export const addToRecentlyViewed = (product: ViewedProduct) => {
  const stored = localStorage.getItem('recentlyViewed');
  let viewed: ViewedProduct[] = stored ? JSON.parse(stored) : [];
  
  // Remove if already exists
  viewed = viewed.filter(p => p.id !== product.id);
  
  // Add to beginning
  viewed.unshift(product);
  
  // Keep only last 10
  viewed = viewed.slice(0, 10);
  
  localStorage.setItem('recentlyViewed', JSON.stringify(viewed));
};
