import React, { useState, useEffect } from 'react';
import { Package, AlertTriangle, Edit, Save, X, Search, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useStore, Product } from '../../store/useStore';
import api from '../../services/api';

export default function InventoryManager() {
  const { products, fetchProducts, updateProduct } = useStore();
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStock, setEditStock] = useState<number>(0);
  const [editThreshold, setEditThreshold] = useState<number>(4);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'low' | 'out' | 'in'>('all');
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const computeUnits = (p: Product): number => {
    const matrix = Array.isArray(p.variants_matrix)
      ? p.variants_matrix
      : (typeof p.variants_matrix === 'string' ? (() => { try { return JSON.parse(p.variants_matrix as any); } catch { return []; } })() : []);
    if (matrix && matrix.length > 0) {
      return matrix.reduce((sum: number, v: any) => sum + (Number(v.stock) || 0), 0);
    }
    if (typeof (p as any).stockCount === 'number') return (p as any).stockCount;
    if (typeof p.stockCount === 'number') return p.stockCount;
    if (typeof (p as any).stock === 'number') return (p as any).stock;
    return 0;
  };

  const getThreshold = (p: Product): number => {
    return Number(p.low_stock_threshold ?? 4);
  };

  const handleEdit = (p: Product) => {
    setEditingId(p.id);
    setEditStock(computeUnits(p));
    setEditThreshold(getThreshold(p));
  };

  const handleSave = async (p: Product) => {
    try {
      setLoading(true);
      // If product has variants, update variants evenly or first variant
      let updatedMatrix = p.variants_matrix;
      if (Array.isArray(updatedMatrix) && updatedMatrix.length > 0) {
        const perVariant = Math.floor(editStock / updatedMatrix.length);
        const remainder = editStock % updatedMatrix.length;
        updatedMatrix = updatedMatrix.map((v, i) => ({
          ...v,
          stock: perVariant + (i === 0 ? remainder : 0)
        }));
      }

      const payload: any = {
        stockCount: editStock,
        stock: editStock,
        low_stock_threshold: editThreshold,
        variants_matrix: updatedMatrix,
        is_in_stock: editStock > 0,
      };

      await api.updateProduct(p.id, payload);
      updateProduct(p.id, payload);
      setEditingId(null);
      setSaveSuccess(p.id);
      setTimeout(() => setSaveSuccess(null), 3000);
      api.logAudit('Inventory Stock Adjusted', p.name, 'Admin', `Stock: ${editStock}, Threshold: ${editThreshold}`);
    } catch (err) {
      console.error('Failed to update inventory:', err);
      // Fallback local update
      updateProduct(p.id, {
        stockCount: editStock,
        low_stock_threshold: editThreshold,
        inStock: editStock > 0,
      } as any);
      setEditingId(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
  };

  const filteredProducts = products.filter(p => {
    const nameMatch = (p.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const skuMatch = (p.sku || '').toLowerCase().includes(searchTerm.toLowerCase());
    const catMatch = (p.category_name || p.category || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSearch = nameMatch || skuMatch || catMatch;

    const units = computeUnits(p);
    const threshold = getThreshold(p);

    if (filter === 'low') {
      return matchesSearch && units <= threshold && units > 0;
    } else if (filter === 'out') {
      return matchesSearch && units === 0;
    } else if (filter === 'in') {
      return matchesSearch && units > threshold;
    }
    return matchesSearch;
  });

  const lowStockCount = products.filter(p => {
    const units = computeUnits(p);
    const thresh = getThreshold(p);
    return units <= thresh && units > 0;
  }).length;

  const outOfStockCount = products.filter(p => computeUnits(p) === 0).length;
  const inStockCount = products.filter(p => computeUnits(p) > getThreshold(p)).length;

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Products & Inventory</h2>
          <p className="text-sm text-gray-500 mt-1">
            Real-time stock monitoring with custom dynamic threshold alerts
          </p>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200/80 rounded-lg shadow-xs">
            <AlertTriangle size={16} className="text-amber-600" />
            <span className="text-xs font-semibold text-amber-700">{lowStockCount} Low Stock</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 border border-red-200/80 rounded-lg shadow-xs">
            <Package size={16} className="text-red-600" />
            <span className="text-xs font-semibold text-red-700">{outOfStockCount} Out of Stock</span>
          </div>
          <button
            onClick={() => fetchProducts()}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-medium transition-colors"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
          <input
            type="text"
            placeholder="Search by product name, SKU, or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all shadow-xs"
          />
        </div>
        <div className="flex gap-1.5 p-1 bg-gray-100 rounded-xl">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              filter === 'all' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            All ({products.length})
          </button>
          <button
            onClick={() => setFilter('low')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              filter === 'low' ? 'bg-amber-500 text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Low Stock ({lowStockCount})
          </button>
          <button
            onClick={() => setFilter('out')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              filter === 'out' ? 'bg-red-500 text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Out of Stock ({outOfStockCount})
          </button>
          <button
            onClick={() => setFilter('in')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              filter === 'in' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            In Stock ({inStockCount})
          </button>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                <th className="py-3 px-4">Product</th>
                <th className="py-3 px-4">SKU</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Units in Stock</th>
                <th className="py-3 px-4">Low Stock Threshold</th>
                <th className="py-3 px-4">Dynamic Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {filteredProducts.map((p) => {
                const units = computeUnits(p);
                const threshold = getThreshold(p);
                const isEditing = editingId === p.id;
                const isOutOfStock = units === 0;
                const isLowStock = units <= threshold && !isOutOfStock;

                return (
                  <tr key={p.id} className="hover:bg-gray-50/60 transition-colors">
                    {/* Product Name & Image */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.image || p.images?.[0] || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=100'}
                          alt={p.name}
                          className="w-10 h-10 rounded-lg object-cover bg-gray-100 border border-gray-100 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 truncate max-w-xs">{p.name}</p>
                          <p className="text-xs text-gray-400">ID: {p.id.slice(0, 8)}</p>
                        </div>
                      </div>
                    </td>

                    {/* SKU */}
                    <td className="py-3 px-4 text-xs font-mono text-gray-600">
                      {p.sku || `RVZ-${p.id.slice(0, 6).toUpperCase()}`}
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4 text-xs text-gray-600">
                      {p.category_name || p.category || 'Streetwear'}
                    </td>

                    {/* Price */}
                    <td className="py-3 px-4 text-xs font-semibold text-gray-900">
                      Rs. {(p.base_price || p.price || 0).toLocaleString()}
                    </td>

                    {/* Total Units in Stock */}
                    <td className="py-3 px-4">
                      {isEditing ? (
                        <input
                          type="number"
                          min="0"
                          value={editStock}
                          onChange={(e) => setEditStock(Math.max(0, parseInt(e.target.value) || 0))}
                          className="w-20 px-2 py-1 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                        />
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${
                            isOutOfStock ? 'bg-red-500' : isLowStock ? 'bg-amber-500 animate-pulse' : 'bg-green-500'
                          }`} />
                          <span className="font-bold text-gray-900 text-xs">
                            {units} units
                          </span>
                        </div>
                      )}
                    </td>

                    {/* Low Stock Threshold */}
                    <td className="py-3 px-4">
                      {isEditing ? (
                        <input
                          type="number"
                          min="1"
                          value={editThreshold}
                          onChange={(e) => setEditThreshold(Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-20 px-2 py-1 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                        />
                      ) : (
                        <span className="text-xs font-medium text-gray-600">
                          {threshold} units
                        </span>
                      )}
                    </td>

                    {/* Dynamic Status */}
                    <td className="py-3 px-4">
                      {isOutOfStock ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-100 text-red-700 border border-red-200/60">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                          Out of Stock (0)
                        </span>
                      ) : isLowStock ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200/60">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-ping" />
                          Low Stock ({units}/{threshold})
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          In Stock ({units})
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      {isEditing ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleSave(p)}
                            disabled={loading}
                            className="p-1.5 bg-black hover:bg-gray-800 text-white rounded-lg transition-colors shadow-xs"
                            title="Save Changes"
                          >
                            <Save size={15} />
                          </button>
                          <button
                            onClick={handleCancel}
                            className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-colors"
                            title="Cancel"
                          >
                            <X size={15} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-2">
                          {saveSuccess === p.id && (
                            <span className="flex items-center gap-1 text-[11px] font-medium text-green-600">
                              <CheckCircle2 size={13} />
                              Saved
                            </span>
                          )}
                          <button
                            onClick={() => handleEdit(p)}
                            className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                            title="Edit Stock or Threshold"
                          >
                            <Edit size={13} />
                            Adjust
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-16">
            <Package className="mx-auto text-gray-300 mb-3" size={40} />
            <p className="text-sm font-semibold text-gray-700">No products match your criteria</p>
            <p className="text-xs text-gray-400 mt-1">Try clearing filters or adjusting your search term.</p>
          </div>
        )}
      </div>
    </div>
  );
}
