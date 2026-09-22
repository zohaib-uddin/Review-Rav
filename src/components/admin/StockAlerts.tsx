import { useState, useEffect } from 'react';
import { Bell, AlertTriangle, Package, CheckCircle } from 'lucide-react';

interface StockAlert {
  id: string;
  productId: string;
  productName: string;
  currentStock: number;
  reorderPoint: number;
  type: 'low' | 'out';
  createdAt: string;
  notified: boolean;
}

export default function StockAlerts() {
  const [alerts, setAlerts] = useState<StockAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'low' | 'out'>('all');

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/stock-alerts');
      const data = await response.json();
      setAlerts(data);
    } catch (error) {
      console.error('Failed to fetch stock alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'all') return true;
    if (filter === 'low') return alert.type === 'low';
    if (filter === 'out') return alert.type === 'out';
    return true;
  });

  const lowStockCount = alerts.filter(a => a.type === 'low').length;
  const outOfStockCount = alerts.filter(a => a.type === 'out').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Stock Alerts</h2>
          <p className="text-sm text-gray-500 mt-1">Products with low or out of stock levels based on individual thresholds</p>
        </div>
        <div className="flex gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertTriangle size={18} className="text-yellow-600" />
            <span className="text-sm font-medium text-yellow-600">{lowStockCount} Low Stock</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 rounded-lg">
            <Package size={18} className="text-red-600" />
            <span className="text-sm font-medium text-red-600">{outOfStockCount} Out of Stock</span>
          </div>
        </div>
      </div>

      <div className="flex gap-3 mb-4">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium ${
            filter === 'all' ? 'bg-black text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All Alerts
        </button>
        <button
          onClick={() => setFilter('low')}
          className={`px-4 py-2 rounded-lg font-medium ${
            filter === 'low' ? 'bg-yellow-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Low Stock
        </button>
        <button
          onClick={() => setFilter('out')}
          className={`px-4 py-2 rounded-lg font-medium ${
            filter === 'out' ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Out of Stock
        </button>
      </div>

      <div className="space-y-3">
        {filteredAlerts.map((alert) => (
          <div
            key={alert.id}
            className={`bg-white p-4 rounded-xl border ${
              alert.type === 'out' ? 'border-red-200' : 'border-yellow-200'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${
                  alert.type === 'out' ? 'bg-red-100' : 'bg-yellow-100'
                }`}>
                  {alert.type === 'out' ? (
                    <Package className="text-red-600" size={20} />
                  ) : (
                    <AlertTriangle className="text-yellow-600" size={20} />
                  )}
                </div>
                <div>
                  <h3 className="font-medium">{alert.productName}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Current Stock: <span className="font-bold">{alert.currentStock}</span> | 
                    Threshold: <span className="font-bold">{alert.reorderPoint}</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Alert created: {new Date(alert.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 text-xs rounded-full font-medium ${
                  alert.type === 'out'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {alert.type === 'out' ? 'OUT OF STOCK' : 'LOW STOCK'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredAlerts.length === 0 && (
        <div className="text-center py-12">
          <CheckCircle className="mx-auto text-green-300 mb-4" size={48} />
          <p className="text-gray-500">All products are well stocked!</p>
        </div>
      )}
    </div>
  );
}
