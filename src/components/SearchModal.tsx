import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search as SearchIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStore } from '../store/useStore';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const { products } = useStore();

  useEffect(() => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const results = products.filter(product => 
        product.name.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query) ||
        product.category?.toLowerCase().includes(query)
      ).slice(0, 8);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, products]);

  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
      setSearchResults([]);
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-start justify-center pt-20"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-2xl w-full max-w-3xl mx-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search Input */}
            <div className="flex items-center gap-4 p-6 border-b">
              <SearchIcon size={24} className="text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for products..."
                className="flex-1 text-lg outline-none"
                autoFocus
              />
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Search Results */}
            <div className="max-h-[60vh] overflow-y-auto p-6">
              {searchQuery.trim() === '' ? (
                <div className="text-center py-12">
                  <SearchIcon size={48} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">Start typing to search products...</p>
                </div>
              ) : searchResults.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">No products found for "{searchQuery}"</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {searchResults.map((product) => (
                    <Link
                      key={product.id}
                      to={`/product/${product.id}`}
                      onClick={onClose}
                      className="group"
                    >
                      <div className="aspect-[3/4] rounded-lg overflow-hidden bg-gray-100 mb-2">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <h4 className="text-sm font-medium line-clamp-2 group-hover:text-black transition-colors">
                        {product.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        {product.salePrice ? (
                          <>
                            <span className="text-sm font-bold">
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
                      {product.isNew && (
                        <span className="inline-block mt-1 text-[10px] bg-black text-white px-2 py-0.5 rounded-full">
                          NEW
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {searchResults.length > 0 && (
              <div className="border-t p-4 text-center">
                <Link
                  to={`/shop?search=${searchQuery}`}
                  onClick={onClose}
                  className="text-sm font-bold text-black hover:underline"
                >
                  View all results for "{searchQuery}" →
                </Link>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
