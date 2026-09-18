import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useStore } from '../store/useStore';

interface MegaMenuProps {
  category: any;
}

export default function MegaMenu({ category }: MegaMenuProps) {
  const { products, categories } = useStore();
  const navigate = useNavigate();
  
  // Get subcategories for this main category
  const subcategories = categories.filter(cat => cat.parent_id === category.id);
  
  // Get featured products for this main category (is_featured = true)
  const featuredProducts = products
    .filter(p => p.main_category_id === category.id && p.is_featured)
    .slice(0, 8);

  // Handle navigation to collection
  const handleNavigate = (slug: string) => {
    navigate(`/collections/${slug}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.2 }}
      className="fixed top-[72px] left-0 w-full bg-white shadow-2xl border-t border-gray-200 z-40"
      style={{ maxHeight: 'calc(100vh - 72px)', overflowY: 'auto' }}
    >
      <div className="max-w-[1400px] mx-auto grid grid-cols-12 gap-0 p-6">
        {/* Left Column - Subcategories (3/12) */}
        <div className="col-span-3 border-r border-gray-200 pr-6">
          <h3 className="text-lg font-bold mb-4 text-black uppercase tracking-wide">{category.name}</h3>
          {subcategories.length > 0 ? (
            <div className="space-y-2">
              {subcategories.map(subcat => {
                const productCount = products.filter(p => p.sub_category_id === subcat.id).length;
                return (
                  <button
                    key={subcat.id}
                    onClick={() => handleNavigate(subcat.slug)}
                    className="w-full flex justify-between items-center hover:bg-gray-50 px-3 py-3 rounded-lg transition-all group text-left"
                  >
                    <span className="text-sm text-gray-700 group-hover:text-black font-medium">
                      {subcat.name}
                    </span>
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                      {productCount}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic">No subcategories available</p>
          )}
          
          <button
            onClick={() => handleNavigate(category.slug)}
            className="mt-6 w-full flex items-center justify-center gap-2 bg-black text-white py-3 rounded-lg text-sm font-bold hover:bg-gray-800 transition-all"
          >
            View All <ArrowRight size={16} />
          </button>
        </div>

        {/* Middle Column - Featured Products (6/12) */}
        <div className="col-span-6 px-6">
          <h3 className="text-lg font-bold mb-4 text-black uppercase tracking-wide">Featured Products</h3>
          {featuredProducts.length > 0 ? (
            <div className="grid grid-cols-4 gap-4">
              {featuredProducts.map(product => (
                <button
                  key={product.id}
                  onClick={() => navigate(`/product/${product.id}`)}
                  className="group text-left"
                >
                  <div className="aspect-[3/4] rounded-lg overflow-hidden bg-gray-100 mb-2 relative">
                    <img
                      src={product.image_url || product.image || product.images?.[0]}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {product.badge && (
                      <span className="absolute top-2 left-2 text-xs bg-black text-white px-2 py-1 rounded-full font-bold">
                        {product.badge}
                      </span>
                    )}
                  </div>
                  <h4 className="text-xs font-medium line-clamp-2 group-hover:text-black transition-colors leading-tight">
                    {product.name}
                  </h4>
                  <p className="text-xs font-bold mt-1 text-gray-900">
                    Rs. {(product.base_price || product.price || 0).toLocaleString()}
                  </p>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500 text-center">
                No featured products in this category.<br/>
                <span className="text-xs">Add products with "is_featured" enabled in admin panel.</span>
              </p>
            </div>
          )}
        </div>

        {/* Right Column - Banner Image (3/12) */}
        <div className="col-span-3 border-l border-gray-200 pl-6">
          {category.banner_image || category.cover_image_url ? (
            <div className="relative aspect-[3/4] rounded-xl overflow-hidden mb-4 group">
              <img
                src={category.banner_image || category.cover_image_url}
                alt={category.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              {/* Text Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent flex flex-col justify-end p-4">
                {category.badge && (
                  <span className="inline-block text-xs bg-white/90 text-black px-2 py-1 rounded-full mb-2 font-bold self-start">
                    {category.badge}
                  </span>
                )}
                <h3 className="text-xl font-bold text-white mb-1">{category.name}</h3>
                {category.description && (
                  <p className="text-sm text-white/90 line-clamp-3 mb-3">{category.description}</p>
                )}
                <button
                  onClick={() => handleNavigate(category.slug)}
                  className="inline-flex items-center gap-2 bg-white text-black px-4 py-2 rounded-full text-sm font-bold hover:bg-gray-100 transition-colors self-start"
                >
                  Explore <ArrowRight size={14} />
                </button>
              </div>
            </div>
          ) : (
            <div className="aspect-[3/4] rounded-xl bg-gray-100 flex items-center justify-center mb-4">
              <div className="text-center p-4">
                <p className="text-sm text-gray-400 mb-2">No banner image</p>
                <p className="text-xs text-gray-300">Add banner_image in admin</p>
              </div>
            </div>
          )}
          
          {category.tag && (
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Trending</p>
              <p className="text-sm font-bold text-black">{category.tag}</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
