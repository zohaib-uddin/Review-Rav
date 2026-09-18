import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingCart, Star } from 'lucide-react';
import { useComparison } from '../context/ComparisonContext';
import { useStore } from '../store/useStore';

export default function ProductComparison() {
  const { compareList, removeFromCompare, clearCompare } = useComparison();
  const { addToCart } = useStore();

  if (compareList.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={clearCompare}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Compare Products</h2>
              <p className="text-sm text-gray-500 mt-1">Compare up to 4 products side by side</p>
            </div>
            <button
              onClick={clearCompare}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Comparison Grid */}
          <div className="p-6">
            <div className={`grid gap-6 ${
              compareList.length === 1 ? 'grid-cols-1 max-w-md mx-auto' :
              compareList.length === 2 ? 'grid-cols-1 md:grid-cols-2' :
              compareList.length === 3 ? 'grid-cols-1 md:grid-cols-3' :
              'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
            }`}>
              {compareList.map((product) => (
                <div key={product.id} className="border rounded-xl p-4 relative">
                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromCompare(product.id)}
                    className="absolute top-2 right-2 p-1 bg-white rounded-full shadow hover:bg-gray-100 transition-colors"
                  >
                    <X size={16} />
                  </button>

                  {/* Product Image */}
                  <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 mb-4">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Product Name */}
                  <h3 className="font-bold text-lg mb-2 line-clamp-2">{product.name}</h3>

                  {/* Price */}
                  <div className="mb-4">
                    {product.salePrice ? (
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-red-600">
                          Rs. {product.salePrice.toLocaleString()}
                        </span>
                        <span className="text-sm text-gray-400 line-through">
                          Rs. {product.price?.toLocaleString()}
                        </span>
                      </div>
                    ) : (
                      <span className="text-2xl font-bold">
                        Rs. {product.price?.toLocaleString()}
                      </span>
                    )}
                  </div>

                  {/* Comparison Details */}
                  <div className="space-y-3 text-sm">
                    {/* Rating */}
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">Rating:</span>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            className={i < 4 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                          />
                        ))}
                        <span className="text-xs text-gray-500">(4.0)</span>
                      </div>
                    </div>

                    {/* Category */}
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">Category:</span>
                      <span className="font-medium capitalize">{product.category?.replace('-', ' ')}</span>
                    </div>

                    {/* Sizes */}
                    <div>
                      <span className="text-gray-500">Sizes:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {product.sizes?.map((size) => (
                          <span key={size} className="text-xs bg-gray-100 px-2 py-1 rounded">
                            {size}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Colors */}
                    <div>
                      <span className="text-gray-500">Colors:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {product.colors?.map((color: any, idx: number) => {
                          const colorName = typeof color === 'string' ? color : color.name;
                          return (
                            <span key={idx} className="text-xs bg-gray-100 px-2 py-1 rounded">
                              {colorName}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    {/* Material */}
                    {product.material && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">Material:</span>
                        <span className="font-medium">{product.material}</span>
                      </div>
                    )}

                    {/* Fit */}
                    {product.fit && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">Fit:</span>
                        <span className="font-medium">{product.fit}</span>
                      </div>
                    )}

                    {/* Badges */}
                    <div className="flex flex-wrap gap-1">
                      {product.isNew && (
                        <span className="text-xs bg-black text-white px-2 py-1 rounded">NEW</span>
                      )}
                      {product.isBestseller && (
                        <span className="text-xs bg-amber-500 text-white px-2 py-1 rounded">BESTSELLER</span>
                      )}
                      {product.salePrice && (
                        <span className="text-xs bg-red-500 text-white px-2 py-1 rounded">SALE</span>
                      )}
                    </div>
                  </div>

                  {/* Add to Cart Button */}
                  <button
                    onClick={() => {
                      addToCart(product, product.sizes?.[0] || 'M', product.colors?.[0] || 'Black');
                    }}
                    className="w-full mt-4 bg-black text-white py-3 rounded-full font-bold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                  >
                    <ShoppingCart size={18} />
                    Add to Cart
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white border-t p-6 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              {compareList.length} of 4 products selected
            </p>
            <button
              onClick={clearCompare}
              className="px-6 py-2 border-2 border-black rounded-full font-bold hover:bg-black hover:text-white transition-colors"
            >
              Clear All
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
