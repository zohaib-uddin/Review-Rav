import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, Plus, Search, Edit2, Trash2, ExternalLink, 
  Flame, Sparkles, Star, Tag, Check, AlertCircle, RefreshCw, Eye
} from 'lucide-react';
import { useStore, Product } from '../../store/useStore';
import api from '../../services/api';
import { adminToast } from '../../utils/notifications';

interface AdminProductsProps {
  onEditProduct: (product: Product) => void;
  onAddProduct: () => void;
}

export default function AdminProducts({ onEditProduct, onAddProduct }: AdminProductsProps) {
  const { products, categories, deleteProduct, updateProduct, fetchProducts } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'bestsellers' | 'new_arrivals' | 'featured' | 'low_stock' | 'drafts'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'price_asc' | 'price_desc' | 'name'>('newest');
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchProducts();
      adminToast.info('Catalog Refreshed', 'Synced latest products.');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleToggleFlag = async (product: Product, flag: 'is_best_seller' | 'is_new_arrival' | 'is_featured') => {
    setTogglingId(`${product.id}-${flag}`);
    const newValue = !product[flag];
    const updateData: Partial<Product> = { [flag]: newValue };
    
    if (flag === 'is_best_seller') {
      updateData.isBestseller = newValue;
      (updateData as any).is_bestseller = newValue;
    } else if (flag === 'is_new_arrival') {
      updateData.isNew = newValue;
    } else if (flag === 'is_featured') {
      updateData.isFeatured = newValue;
    }

    try {
      updateProduct(product.id, updateData);
      await api.updateProduct(product.id, updateData);
      const label = flag === 'is_best_seller' ? 'Best Seller' : flag === 'is_new_arrival' ? 'New Arrival' : 'Featured';
      adminToast.success('Product Flag Updated', `"${product.name}" marked as ${newValue ? label : 'standard'}.`);
    } catch (err: any) {
      console.error('Failed to toggle flag:', err);
      adminToast.error('Flag Update Failed', err.message);
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    const prod = products.find(p => p.id === id);
    try {
      deleteProduct(id);
      await api.deleteProduct(id);
      setDeleteConfirmId(null);
      adminToast.success('Product Deleted', `"${prod?.name || 'Product'}" was deleted.`);
    } catch (err: any) {
      console.error('Failed to delete product:', err);
      adminToast.error('Delete Failed', err.message);
    }
  };

  // Category mapping
  const categoryMap = useMemo(() => {
    const map = new Map<string, string>();
    categories.forEach(c => {
      map.set(c.id, c.name);
      map.set(c.slug, c.name);
    });
    return map;
  }, [categories]);

  // Filtered and sorted products
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search filter
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q) ||
        (p.sku && p.sku.toLowerCase().includes(q))
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      result = result.filter(p => 
        p.category_id === selectedCategory ||
        p.category_slug === selectedCategory ||
        p.category === selectedCategory
      );
    }

    // Flag filter
    if (selectedFilter === 'bestsellers') {
      result = result.filter(p => p.is_best_seller || p.isBestseller || (p as any).is_bestseller);
    } else if (selectedFilter === 'new_arrivals') {
      result = result.filter(p => p.is_new_arrival || p.isNew);
    } else if (selectedFilter === 'featured') {
      result = result.filter(p => p.is_featured || p.isFeatured);
    } else if (selectedFilter === 'low_stock') {
      result = result.filter(p => {
        const stock = p.stockCount ?? (p as any).stock ?? 0;
        const thresh = Number(p.low_stock_threshold ?? 4);
        return stock <= thresh;
      });
    } else if (selectedFilter === 'drafts') {
      result = result.filter(p => p.is_draft || p.status === 'draft');
    }

    // Sorting
    switch (sortBy) {
      case 'price_asc':
        result.sort((a, b) => ((a.salePrice || a.price || a.base_price || 0) - (b.salePrice || b.price || b.base_price || 0)));
        break;
      case 'price_desc':
        result.sort((a, b) => ((b.salePrice || b.price || b.base_price || 0) - (a.salePrice || a.price || a.base_price || 0)));
        break;
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'newest':
      default:
        result.sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime());
        break;
    }

    return result;
  }, [products, searchTerm, selectedCategory, selectedFilter, sortBy]);

  // Statistics
  const stats = useMemo(() => {
    const total = products.length;
    const bestsellers = products.filter(p => p.is_best_seller || p.isBestseller || (p as any).is_bestseller).length;
    const newArrivals = products.filter(p => p.is_new_arrival || p.isNew).length;
    const featured = products.filter(p => p.is_featured || p.isFeatured).length;
    const lowStock = products.filter(p => {
      const stock = p.stockCount ?? (p as any).stock ?? 0;
      const thresh = Number(p.low_stock_threshold ?? 4);
      return stock <= thresh;
    }).length;
    return { total, bestsellers, newArrivals, featured, lowStock };
  }, [products]);

  return (
    <div className="space-y-6">
      {/* Header with Stats & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold font-display tracking-tight text-gray-900">Products Catalog</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-black text-white">
              {products.length} Products
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Manage, edit, and organize your products. Synced in real-time with Neon DB.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-xs font-semibold text-gray-700 transition-colors disabled:opacity-50"
            title="Refresh from Neon DB"
          >
            <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
            Sync DB
          </button>
          <button
            onClick={onAddProduct}
            className="flex items-center gap-2 px-5 py-2.5 bg-black hover:bg-gray-800 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95"
          >
            <Plus size={16} />
            Add New Product
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <button
          onClick={() => setSelectedFilter('all')}
          className={`p-4 rounded-xl border text-left transition-all ${
            selectedFilter === 'all' ? 'border-black bg-black text-white shadow-sm' : 'bg-white border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium opacity-80">All Products</span>
            <Package size={16} />
          </div>
          <p className="text-2xl font-bold mt-2">{stats.total}</p>
        </button>

        <button
          onClick={() => setSelectedFilter('bestsellers')}
          className={`p-4 rounded-xl border text-left transition-all ${
            selectedFilter === 'bestsellers' ? 'border-amber-500 bg-amber-500 text-white shadow-sm' : 'bg-white border-gray-200 hover:border-amber-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium opacity-80">Best Sellers</span>
            <Flame size={16} className={selectedFilter === 'bestsellers' ? 'text-white' : 'text-amber-500'} />
          </div>
          <p className="text-2xl font-bold mt-2">{stats.bestsellers}</p>
        </button>

        <button
          onClick={() => setSelectedFilter('new_arrivals')}
          className={`p-4 rounded-xl border text-left transition-all ${
            selectedFilter === 'new_arrivals' ? 'border-emerald-600 bg-emerald-600 text-white shadow-sm' : 'bg-white border-gray-200 hover:border-emerald-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium opacity-80">New Arrivals</span>
            <Sparkles size={16} className={selectedFilter === 'new_arrivals' ? 'text-white' : 'text-emerald-500'} />
          </div>
          <p className="text-2xl font-bold mt-2">{stats.newArrivals}</p>
        </button>

        <button
          onClick={() => setSelectedFilter('featured')}
          className={`p-4 rounded-xl border text-left transition-all ${
            selectedFilter === 'featured' ? 'border-purple-600 bg-purple-600 text-white shadow-sm' : 'bg-white border-gray-200 hover:border-purple-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium opacity-80">Featured</span>
            <Star size={16} className={selectedFilter === 'featured' ? 'text-white' : 'text-purple-500'} />
          </div>
          <p className="text-2xl font-bold mt-2">{stats.featured}</p>
        </button>

        <button
          onClick={() => setSelectedFilter('low_stock')}
          className={`p-4 rounded-xl border text-left col-span-2 sm:col-span-1 transition-all ${
            selectedFilter === 'low_stock' ? 'border-rose-500 bg-rose-500 text-white shadow-sm' : 'bg-white border-gray-200 hover:border-rose-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium opacity-80">Low Stock</span>
            <AlertCircle size={16} className={selectedFilter === 'low_stock' ? 'text-white' : 'text-rose-500'} />
          </div>
          <p className="text-2xl font-bold mt-2">{stats.lowStock}</p>
        </button>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-3 justify-between items-stretch md:items-center">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search products by title, slug, SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-black transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:border-black"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug || c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:border-black"
          >
            <option value="newest">Newest First</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="name">Name A-Z</option>
          </select>
        </div>
      </div>

      {/* Products List Table / Cards */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {filteredProducts.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <Package size={48} className="mx-auto mb-3 opacity-40 text-gray-400" />
            <p className="text-base font-medium text-gray-600">No products found</p>
            <p className="text-xs text-gray-400 mt-1">Try adjusting your filters or search query</p>
            <button
              onClick={onAddProduct}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-black text-white text-xs font-bold rounded-xl"
            >
              <Plus size={14} /> Add First Product
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50/80 border-b border-gray-200 text-gray-500 uppercase text-[11px] font-bold tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Product Details</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Price</th>
                  <th className="py-3.5 px-4">Catalog Tags (Click to Toggle)</th>
                  <th className="py-3.5 px-4">Inventory</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProducts.map((product) => {
                  const isBest = product.is_best_seller || product.isBestseller || (product as any).is_bestseller;
                  const isNew = product.is_new_arrival || product.isNew;
                  const isFeat = product.is_featured || product.isFeatured;
                  const mainImage = product.image_url || product.image || (product.images && product.images[0]) || 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=300&h=300&fit=crop';
                  const basePrice = product.base_price || product.price || 0;
                  const comparePrice = product.compare_at_price || product.salePrice;
                  const catName = categoryMap.get(product.category_id || '') || categoryMap.get(product.category_slug || '') || product.category_name || product.category || 'Uncategorized';
                  const stock = product.stockCount ?? 50;

                  return (
                    <tr key={product.id} className="hover:bg-gray-50/60 transition-colors group">
                      {/* Product Info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={mainImage}
                            alt={product.name}
                            className="w-12 h-14 object-cover rounded-lg border border-gray-200 shrink-0 bg-gray-100"
                            loading="lazy"
                          />
                          <div className="min-w-0">
                            <p className="font-bold text-gray-900 text-sm truncate group-hover:text-black">
                              {product.name}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-400">
                              <span className="font-mono">{product.sku || 'NO-SKU'}</span>
                              <span>•</span>
                              <span className="font-mono text-[11px] truncate max-w-[140px] text-gray-400">/{product.slug}</span>
                            </div>
                            {product.badge && (
                              <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-700">
                                {product.badge}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-700">
                          <Tag size={12} className="text-gray-400" />
                          {catName}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-gray-900">
                          Rs. {basePrice.toLocaleString()}
                        </div>
                        {comparePrice && comparePrice > basePrice && (
                          <div className="text-xs text-gray-400 line-through">
                            Rs. {comparePrice.toLocaleString()}
                          </div>
                        )}
                      </td>

                      {/* Flag Toggles */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {/* Bestseller Toggle */}
                          <button
                            onClick={() => handleToggleFlag(product, 'is_best_seller')}
                            disabled={togglingId === `${product.id}-is_best_seller`}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all border ${
                              isBest
                                ? 'bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200'
                                : 'bg-gray-50 text-gray-400 border-gray-200 hover:bg-gray-100 hover:text-gray-700'
                            }`}
                            title="Click to toggle Best Seller status in Neon DB"
                          >
                            <Flame size={12} className={isBest ? 'text-amber-600' : 'text-gray-300'} />
                            Best Seller
                          </button>

                          {/* New Arrival Toggle */}
                          <button
                            onClick={() => handleToggleFlag(product, 'is_new_arrival')}
                            disabled={togglingId === `${product.id}-is_new_arrival`}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all border ${
                              isNew
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200'
                                : 'bg-gray-50 text-gray-400 border-gray-200 hover:bg-gray-100 hover:text-gray-700'
                            }`}
                            title="Click to toggle New Arrival status in Neon DB"
                          >
                            <Sparkles size={12} className={isNew ? 'text-emerald-600' : 'text-gray-300'} />
                            New
                          </button>

                          {/* Featured Toggle */}
                          <button
                            onClick={() => handleToggleFlag(product, 'is_featured')}
                            disabled={togglingId === `${product.id}-is_featured`}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all border ${
                              isFeat
                                ? 'bg-purple-100 text-purple-800 border-purple-300 hover:bg-purple-200'
                                : 'bg-gray-50 text-gray-400 border-gray-200 hover:bg-gray-100 hover:text-gray-700'
                            }`}
                            title="Click to toggle Featured status in Neon DB"
                          >
                            <Star size={12} className={isFeat ? 'text-purple-600' : 'text-gray-300'} />
                            Featured
                          </button>
                        </div>
                      </td>

                      {/* Inventory */}
                      <td className="py-3.5 px-4">
                        {(() => {
                          const units = product.stockCount ?? (product as any).stock ?? 0;
                          const threshold = Number(product.low_stock_threshold ?? 4);
                          const isOut = units === 0;
                          const isLow = units <= threshold && !isOut;

                          return (
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`w-2 h-2 rounded-full ${
                                    isOut ? 'bg-red-500' : isLow ? 'bg-amber-500 animate-pulse' : 'bg-green-500'
                                  }`}
                                />
                                <span className={`text-xs font-bold ${isOut ? 'text-red-700' : isLow ? 'text-amber-800' : 'text-gray-800'}`}>
                                  {units} units
                                </span>
                              </div>
                              {isOut ? (
                                <span className="inline-block text-[10px] font-semibold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
                                  Out of Stock
                                </span>
                              ) : isLow ? (
                                <span className="inline-block text-[10px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                                  Low Stock (Alert: ≤{threshold})
                                </span>
                              ) : (
                                <span className="text-[10px] text-gray-400">
                                  Threshold: {threshold}
                                </span>
                              )}
                            </div>
                          );
                        })()}
                      </td>

                      {/* Action Buttons */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View on PDP */}
                          <a
                            href={`/product/${product.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-black transition-colors"
                            title="View Product Page"
                          >
                            <ExternalLink size={15} />
                          </a>

                          {/* Edit / Update Product */}
                          <button
                            onClick={() => onEditProduct(product)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-black hover:bg-gray-800 text-white rounded-lg text-xs font-bold transition-colors shadow-sm"
                            title="Edit / Update Product"
                          >
                            <Edit2 size={13} />
                            Edit
                          </button>

                          {/* Delete */}
                          {deleteConfirmId === product.id ? (
                            <div className="flex items-center gap-1 bg-red-50 p-1 rounded-lg border border-red-200">
                              <button
                                onClick={() => handleDelete(product.id)}
                                className="px-2 py-1 bg-red-600 text-white rounded text-[11px] font-bold hover:bg-red-700"
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => setDeleteConfirmId(null)}
                                className="px-1.5 py-1 text-gray-600 hover:text-black text-[11px]"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirmId(product.id)}
                              className="p-2 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-600 transition-colors"
                              title="Delete Product"
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
