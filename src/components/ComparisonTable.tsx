import { motion } from 'framer-motion';
import { X, ShoppingCart, Star, Check } from 'lucide-react';
import { useStore, Product } from '../store/useStore';

interface ComparisonTableProps {
  products: Product[];
  onClose: () => void;
}

export default function ComparisonTable({ products, onClose }: ComparisonTableProps) {
  const { addToCart } = useStore();

  const handleAddToCart = (product: Product) => {
    addToCart(product, product.sizes?.[0] || 'M', product.colors?.[0] || 'Black');
  };

  const renderComparisonRow = (label: string, getValue: (p: Product) => React.ReactNode) => (
    <tr className="border-b border-gray-100">
      <td className="py-4 px-6 font-medium text-gray-700 bg-gray-50">{label}</td>
      {products.map(product => (
        <td key={product.id} className="py-4 px-6 text-center">
          {getValue(product)}
        </td>
      ))}
    </tr>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between z-10">
          <div>
            <h2 className="text-2xl font-bold">Product Comparison</h2>
            <p className="text-sm text-gray-500 mt-1">Compare {products.length} products side by side</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Comparison Table */}
        <div className="overflow-auto max-h-[calc(90vh-100px)]">
          <table className="w-full">
            <thead className="sticky top-0 bg-white">
              <tr>
                <th className="py-6 px-6 text-left font-medium text-gray-700 bg-gray-50 w-48">Feature</th>
                {products.map(product => (
                  <th key={product.id} className="py-6 px-6 text-center min-w-[200px]">
                    <div className="space-y-3">
                      <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 mx-auto max-w-[150px]">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <h3 className="font-bold text-sm line-clamp-2">{product.name}</h3>
                      <div className="flex items-center justify-center gap-2">
                        {product.salePrice ? (
                          <>
                            <span className="text-lg font-bold text-red-600">
                              Rs. {product.salePrice.toLocaleString()}
                            </span>
                            <span className="text-sm text-gray-400 line-through">
                              Rs. {(product.base_price || 0).toLocaleString()}
                            </span>
                          </>
                        ) : (
                          <span className="text-lg font-bold">
                            Rs. {(product.base_price || 0).toLocaleString()}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => handleAddToCart(product)}
                        className="w-full bg-black text-white py-2 rounded-full text-sm font-bold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                      >
                        <ShoppingCart size={16} />
                        Add to Cart
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Category */}
              {renderComparisonRow('Category', (product) => (
                <span className="text-sm capitalize">{(product.category_slug || product.category || '').replace('-', ' ')}</span>
              ))}

              {/* Sizes */}
              {renderComparisonRow('Available Sizes', (product) => (
                <div className="flex flex-wrap gap-1 justify-center">
                  {(product.sizes || product.attributes?.sizes || []).map(size => (
                    <span key={size} className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {size}
                    </span>
                  ))}
                </div>
              ))}

              {/* Colors */}
              {renderComparisonRow('Available Colors', (product) => (
                <div className="flex flex-wrap gap-1 justify-center">
                  {(product.colors || product.attributes?.colors || []).map((color, idx) => {
                    const colorName = typeof color === 'string' ? color : color.name;
                    return (
                      <span key={idx} className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {colorName}
                      </span>
                    );
                  })}
                </div>
              ))}

              {/* Material */}
              {renderComparisonRow('Material', (product) => (
                <span className="text-sm">{product.material || 'Premium Cotton'}</span>
              ))}

              {/* Fit */}
              {renderComparisonRow('Fit', (product) => (
                <span className="text-sm">{product.fit || 'Regular'}</span>
              ))}

              {/* Badges */}
              {renderComparisonRow('Special Features', (product) => (
                <div className="flex flex-wrap gap-1 justify-center">
                  {product.isNew && (
                    <span className="text-xs bg-black text-white px-2 py-1 rounded">NEW</span>
                  )}
                  {product.isBestseller && (
                    <span className="text-xs bg-amber-500 text-white px-2 py-1 rounded">BESTSELLER</span>
                  )}
                  {product.salePrice && (
                    <span className="text-xs bg-red-500 text-white px-2 py-1 rounded">SALE</span>
                  )}
                  {!product.isNew && !product.isBestseller && !product.salePrice && (
                    <span className="text-sm text-gray-400">-</span>
                  )}
                </div>
              ))}

              {/* In Stock */}
              {renderComparisonRow('Availability', (product) => (
                <div className="flex items-center justify-center gap-2">
                  <Check size={16} className="text-green-600" />
                  <span className="text-sm text-green-600 font-medium">In Stock</span>
                </div>
              ))}

              {/* Free Shipping */}
              {renderComparisonRow('Shipping', (product) => (
                <div className="flex items-center justify-center gap-2">
                  <Check size={16} className="text-green-600" />
                  <span className="text-sm text-green-600 font-medium">Free Shipping</span>
                </div>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}
