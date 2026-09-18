import { useState, useMemo, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SlidersHorizontal, X, Grid3X3, Grid } from 'lucide-react';
import { useStore } from '../store/useStore';
import ProductCard from '../components/ProductCard';
import AdvancedFilters from '../components/AdvancedFilters';

export default function Shop() {
  const { category } = useParams();
  const [searchParams] = useSearchParams();
  const { products, categories, fetchProducts, fetchCategories } = useStore();
  const [sortBy, setSortBy] = useState('featured');
  const [showFilters, setShowFilters] = useState(false);
  const [gridColumns, setGridColumns] = useState(6); // 6 columns by default
  const [filters, setFilters] = useState<any>({});
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
    
    // Filter by category
    if (category) {
      filtered = filtered.filter(p => 
        p.main_category_id === category || p.sub_category_id === category
      );
    }
    
    // Filter by new arrivals
    if (isNew) {
      filtered = filtered.filter(p => p.is_new_arrival);
    }
    
    // Apply advanced filters
    if (filters.size && filters.size.length > 0) {
      filtered = filtered.filter(p => 
        p.attributes?.sizes?.some((s: string) => filters.size.includes(s))
      );
    }
    
    if (filters.color && filters.color.length > 0) {
      filtered = filtered.filter(p => 
        p.attributes?.colors?.some((c: string) => filters.color.includes(c))
      );
    }
    
    if (filters.minPrice || filters.maxPrice) {
      filtered = filtered.filter(p => {
        const price = parseFloat(p.base_price || '0');
        if (filters.minPrice && price < filters.minPrice) return false;
        if (filters.maxPrice && price > filters.maxPrice) return false;
        return true;
      });
    }
    
    if (filters.features) {
      if (filters.features.includes('new-arrival')) {
        filtered = filtered.filter(p => p.is_new_arrival);
      }
      if (filters.features.includes('best-seller')) {
        filtered = filtered.filter(p => p.is_best_seller);
      }
      if (filters.features.includes('on-sale')) {
        filtered = filtered.filter(p => 
          p.compare_at_price && parseFloat(p.compare_at_price) > parseFloat(p.base_price || '0')
        );
      }
    }
    
    // Sort products
    switch (sortBy) {
      case 'price-low': 
        filtered.sort((a, b) => 
          parseFloat(a.base_price || '0') - parseFloat(b.base_price || '0')
        ); 
        break;
      case 'price-high': 
        filtered.sort((a, b) => 
          parseFloat(b.base_price || '0') - parseFloat(a.base_price || '0')
        ); 
        break;
      case 'name-asc':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        filtered.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      default: // featured
        filtered.sort((a, b) => {
          if (a.is_featured && !b.is_featured) return -1;
          if (!a.is_featured && b.is_featured) return 1;
          return 0;
        });
    }
    
    return filtered;
  }, [products, category, isNew, sortBy, filters]);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-gray-900 to-black py-12 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-xs tracking-[0.3em] text-gray-400 mb-2">COLLECTION</p>
            <h1 className="text-4xl md:text-5xl font-display font-bold">
              {isNew ? 'New Arrivals' : category ? categoryNames[category] || 'Shop' : 'All Products'}
            </h1>
            <p className="text-gray-400 mt-2">{filteredProducts.length} products</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-[1920px] mx-auto px-4 py-8">
        {/* Top Bar with Filters Toggle, Availability, Items Count, Sort, and Grid Toggle */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b sticky top-0 bg-white z-10 pt-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border rounded-none hover:bg-gray-50 transition-colors"
            >
              <SlidersHorizontal size={18} />
              <span className="text-sm font-medium">Filters</span>
            </button>
            <span className="text-sm text-gray-500">{filteredProducts.length} items</span>
          </div>
          
          <div className="flex items-center gap-4">
            <select 
              value={sortBy} 
              onChange={e => setSortBy(e.target.value)} 
              className="px-4 py-2 border rounded-none text-sm font-medium bg-white focus:outline-none focus:border-black"
            >
              <option value="featured">Featured</option>
              <option value="newest">Newest</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name-asc">Name: A to Z</option>
              <option value="name-desc">Name: Z to A</option>
            </select>
            
            <div className="flex items-center gap-2 border-l pl-4">
              <button
                onClick={() => setGridColumns(4)}
                className={`p-2 ${gridColumns === 4 ? 'text-black' : 'text-gray-400'}`}
              >
                <Grid3X3 size={20} />
              </button>
              <button
                onClick={() => setGridColumns(6)}
                className={`p-2 ${gridColumns === 6 ? 'text-black' : 'text-gray-400'}`}
              >
                <Grid size={20} />
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Left Sidebar Filters */}
          {showFilters && (
            <div className="w-64 flex-shrink-0">
              <AdvancedFilters onFilterChange={setFilters} />
            </div>
          )}

          {/* Product Grid - Full width when filters hidden, otherwise offset */}
          <div className={`flex-1 ${showFilters ? '' : ''}`}>
            <div 
              className={`grid gap-4 ${
                gridColumns === 4 
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' 
                  : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6'
              }`}
              style={{ gap: '0' }}
            >
              {filteredProducts.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
