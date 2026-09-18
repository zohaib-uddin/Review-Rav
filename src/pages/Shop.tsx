import { useState, useMemo, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SlidersHorizontal, X } from 'lucide-react';
import { useStore } from '../store/useStore';
import ProductCard from '../components/ProductCard';

export default function Shop() {
  const { category } = useParams();
  const [searchParams] = useSearchParams();
  const { products, categories, fetchProducts, fetchCategories } = useStore();
  const [sortBy, setSortBy] = useState('featured');
  const isNew = searchParams.get('new') === 'true';
  
  // Fetch products and categories from API
  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);
  
  // Dynamic category names from store (fetched from NeonDB)
  const categoryNames: Record<string, string> = categories.reduce((acc, cat) => {
    acc[cat.slug] = cat.name;
    return acc;
  }, {} as Record<string, string>);

  const filteredProducts = useMemo(() => {
    let filtered = [...products];
    if (category) filtered = filtered.filter(p => p.category === category);
    if (isNew) filtered = filtered.filter(p => p.isNew);
    switch (sortBy) {
      case 'price-low': filtered.sort((a, b) => ((a.salePrice || a.price || 0)) - ((b.salePrice || b.price || 0))); break;
      case 'price-high': filtered.sort((a, b) => ((b.salePrice || b.price || 0)) - ((a.salePrice || a.price || 0))); break;
      default: break;
    }
    return filtered;
  }, [products, category, isNew, sortBy]);

  return (
    <div className="min-h-screen">
      <div className="bg-gradient-to-br from-gray-900 to-black py-12 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-xs tracking-[0.3em] text-gray-400 mb-2">COLLECTION</p>
            <h1 className="text-4xl md:text-5xl font-display font-bold">{isNew ? 'New Arrivals' : category ? categoryNames[category] || 'Shop' : 'All Products'}</h1>
            <p className="text-gray-400 mt-2">{filteredProducts.length} products</p>
          </motion.div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8 pb-4 border-b">
          <span className="text-sm text-gray-500">{filteredProducts.length} products</span>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="px-4 py-2.5 border rounded-full text-sm font-medium bg-white">
            <option value="featured">Featured</option>
            <option value="newest">Newest</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
