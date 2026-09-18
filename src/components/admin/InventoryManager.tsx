import { useState, useEffect } from 'react';
import { Package, AlertTriangle, Edit, Save, X, Search } from 'lucide-react';

interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  currentStock: number;
  reorderPoint: number;
  category: string;
  price: number;
}

export default function InventoryManager() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editValues, setEditValues] = useState({ stock: 0, reorderPoint: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'low' | 'out'>('all');

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      // Simulate API call - replace with actual API
      const mockInventory: InventoryItem[] = [
        { id: '1', name: 'Shadow Realm Co-Ord Set', sku: 'RVZ-CO-001', currentStock: 45, reorderPoint: 10, category: 'Co-Ord Sets', price: 4500 },
        { id: '2', name: 'Acid Wash Phantom Tee', sku: 'RVZ-TS-001', currentStock: 8, reorderPoint: 15, category: 'Oversize Tees', price: 2800 },
        { id: '3', name: 'Wide Leg Graphic Trouser', sku: 'RVZ-TR-001', currentStock: 0, reorderPoint: 10, category: 'Graphic Trousers', price: 3200 },
        { id: '4', name: 'Urban Drift Trackpants', sku: 'RVZ-TP-001', currentStock: 120, reorderPoint: 20, category: 'Trackpants', price: 2900 },
        { id: '5', name: 'Neon Pulse Graphic Shorts', sku: 'RVZ-SH-001', currentStock: 5, reorderPoint: 10, category: 'Graphic Shorts', price: 2200 },
        { id: '6', name: 'Reaper X Graphic Co-Ord', sku: 'RVZ-CO-003', currentStock: 25, reorderPoint: 10, category: 'Co-Ord Sets', price: 4800 },
        { id: '7', name: 'Denim Jacket - Raven Black', sku: 'RVZ-JK-001', currentStock: 3, reorderPoint: 8, category: 'Shirts & Jackets', price: 3990 },
        { id: '8', name: 'Classic Pullover Hoodie', sku: 'RVZ-HD-001', currentStock: 60, reorderPoint: 15, category: 'Oversize Tees', price: 2500 },
      ];
      
      setInventory(mockInventory);
    } catch (error) {
      console.error('Failed to fetch inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: InventoryItem) => {
    setEditingItem(item.id);
    setEditValues({ stock: item.currentStock, reorderPoint: item.reorderPoint });
  };

  const handleSave = async (id: string) => {
    try {
      // Simulate API call - replace with actual API
      setInventory(inventory.map(item => 
        item.id === id 
          ? { ...item, currentStock: editValues.stock, reorderPoint: editValues.reorderPoint }
          : item
      ));
      setEditingItem(null);
      alert('Inventory updated successfully!');
    } catch (error) {
      console.error('Failed to update inventory:', error);
      alert('Failed to update inventory');
    }
  };

  const handleCancel = () => {
    setEditingItem(null);
  };

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.sku.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === 'low') {
      return matchesSearch && item.currentStock <= item.reorderPoint && item.currentStock > 0;
    } else if (filter === 'out') {
      return matchesSearch && item.currentStock === 0;
    }
    
    return matchesSearch;
  });

  const lowStockCount = inventory.filter(item => item.currentStock <= item.reorderPoint && item.currentStock > 0).length;
  const outOfStockCount = inventory.filter(item => item.currentStock === 0).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Inventory Management</h2>
        <div className="flex gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertTriangle size={18} className="text-yellow-600" />
            <span className="text-sm font-medium text-yellow-600">{lowStockCount} Low Stock</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 rounded-lg">
            <Package size={18} className="text-red-600" />
            <span className="text-sm font-medium text-red-600">{outOfStockCount} Out of Stock</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by name or SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as any)}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="all">All Products</option>
          <option value="low">Low Stock</option>
          <option value="out">Out of Stock</option>
        </select>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left p-4 text-sm font-medium">Product</th>
              <th className="text-left p-4 text-sm font-medium">SKU</th>
              <th className="text-left p-4 text-sm font-medium">Category</th>
              <th className="text-left p-4 text-sm font-medium">Price</th>
              <th className="text-left p-4 text-sm font-medium">Current Stock</th>
              <th className="text-left p-4 text-sm font-medium">Reorder Point</th>
              <th className="text-left p-4 text-sm font-medium">Status</th>
              <th className="text-left p-4 text-sm font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredInventory.map((item) => (
              <tr key={item.id} className="border-b hover:bg-gray-50">
                <td className="p-4">
                  <p className="font-medium">{item.name}</p>
                </td>
                <td className="p-4 text-sm text-gray-600">{item.sku}</td>
                <td className="p-4 text-sm text-gray-600">{item.category}</td>
                <td className="p-4 text-sm font-medium">Rs. {item.price.toLocaleString()}</td>
                <td className="p-4">
                  {editingItem === item.id ? (
                    <input
                      type="number"
                      value={editValues.stock}
                      onChange={(e) => setEditValues({ ...editValues, stock: parseInt(e.target.value) || 0 })}
                      className="w-20 px-2 py-1 border rounded"
                    />
                  ) : (
                    <span className="font-medium">{item.currentStock}</span>
                  )}
                </td>
                <td className="p-4">
                  {editingItem === item.id ? (
                    <input
                      type="number"
                      value={editValues.reorderPoint}
                      onChange={(e) => setEditValues({ ...editValues, reorderPoint: parseInt(e.target.value) || 0 })}
                      className="w-20 px-2 py-1 border rounded"
                    />
                  ) : (
                    <span className="text-sm text-gray-600">{item.reorderPoint}</span>
                  )}
                </td>
                <td className="p-4">
                  {item.currentStock === 0 ? (
                    <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full font-medium">
                      Out of Stock
                    </span>
                  ) : item.currentStock <= item.reorderPoint ? (
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full font-medium">
                      Low Stock
                    </span>
                  ) : (
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                      In Stock
                    </span>
                  )}
                </td>
                <td className="p-4">
                  {editingItem === item.id ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSave(item.id)}
                        className="p-2 bg-green-500 text-white rounded hover:bg-green-600"
                      >
                        <Save size={16} />
                      </button>
                      <button
                        onClick={handleCancel}
                        className="p-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleEdit(item)}
                      className="p-2 hover:bg-gray-100 rounded"
                    >
                      <Edit size={16} className="text-gray-600" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredInventory.length === 0 && (
        <div className="text-center py-12">
          <Package className="mx-auto text-gray-300 mb-4" size={48} />
          <p className="text-gray-500">No products found</p>
        </div>
      )}
    </div>
  );
}
