import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useStore } from '../store/useStore';

interface MegaMenuProps {
  category: any;
}

export default function MegaMenu({ category }: MegaMenuProps) {
  const { products, categories } = useStore();
  
  // Get subcategories for this category
  const subcategories = categories.filter(cat => cat.parent_id === category.id);
  
  // Get products for this category (limit to 8)
  const categoryProducts = products
    .filter(p => p.category === category.slug)
    .slice(0, 8);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.2 }}
      className="fixed top-[120px] left-1/2 -translate-x-1/2 w-[1200px] bg-white shadow-2xl border-t-2 border-black z-50"
    >
      <div className="grid grid-cols-12 gap-6 p-8">
        {/* Left Side - Subcategories */}
        <div className="col-span-3 border-r border-gray-200 pr-6">
          <h3 className="text-lg font-bold mb-4 text-black">{category.name}</h3>
          {subcategories.length > 0 ? (
            <div className="space-y-3">
              {subcategories.map(subcat => {
                const productCount = products.filter(p => p.category === subcat.slug).length;
                return (
                  <Link
                    key={subcat.slug}
                    to={`/collections/${subcat.slug}`}
                    className="block group"
                  >
                    <div className="flex justify-between items-center hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors">
                      <span className="text-sm text-gray-700 group-hover:text-black font-medium">
                        {subcat.name}
                      </span>
                      <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                        {productCount}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No subcategories</p>
          )}
          
          <Link
            to={`/collections/${category.slug}`}
            className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-black hover:gap-3 transition-all"
          >
            View All <ArrowRight size={16} />
          </Link>
        </div>

        {/* Center - Products */}
        <div className="col-span-6">
          <h3 className="text-lg font-bold mb-4 text-black">Featured Products</h3>
          {categoryProducts.length > 0 ? (
            <div className="grid grid-cols-4 gap-4">
              {categoryProducts.map(product => (
                <Link
                  key={product.id}
                  to={`/product/${product.id}`}
                  className="group"
                >
                  <div className="aspect-[3/4] rounded-lg overflow-hidden bg-gray-100 mb-2">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <h4 className="text-xs font-medium line-clamp-2 group-hover:text-black transition-colors">
                    {product.name}
                  </h4>
                  <p className="text-xs font-bold mt-1">
                    Rs. {(product.salePrice || product.price || 0).toLocaleString()}
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No products in this category</p>
          )}
        </div>

        {/* Right Side - Category Info */}
        <div className="col-span-3 border-l border-gray-200 pl-6">
          {category.cover_image_url && (
            <div className="aspect-square rounded-xl overflow-hidden mb-4">
              <img
                src={category.cover_image_url}
                alt={category.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div>
            {category.badge && (
              <span className="inline-block text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full mb-2">
                {category.badge}
              </span>
            )}
            {category.tag && (
              <p className="text-xs text-gray-500 mb-2">{category.tag}</p>
            )}
            <h3 className="text-xl font-bold mb-2">{category.name}</h3>
            {category.description && (
              <p className="text-sm text-gray-600 mb-4">{category.description}</p>
            )}
            <Link
              to={`/collections/${category.slug}`}
              className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-full text-sm font-bold hover:bg-gray-800 transition-colors"
            >
              Explore Collection <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
