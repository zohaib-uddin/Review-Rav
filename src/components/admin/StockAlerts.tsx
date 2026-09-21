import { useState, useEffect } from 'react';
import { Bell, AlertTriangle, Package, CheckCircle, RefreshCw } from 'lucide-react';
import { useStore } from '../../store/useStore';

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
  const { products, fetchProducts } = useStore();
  const [alerts, setAlerts] = useState<StockAlert[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'low' | 'out'>('all');
  const [notifiedIds, setNotifiedIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    // Generate dynamic alerts from real products (threshold: 5)
    const generated: StockAlert[] = [];
    products.forEach((p) => {
      const stock = (p as any).stockCount ?? p.stock ?? 50;
      if (stock <= 5) {
        generated.push({
          id: `alert-${p.id}`,
          productId: p.id,
          productName: p.name,
          currentStock: stock,
          reorderPoint: 5,
          type: stock === 0 ? 'out' : 'low',
          createdAt: p.created_at || new Date().toISOString(),
          notified: Boolean(notifiedIds[`alert-${p.id}`]),
        });
      }
    });
    setAlerts(generated);
  }, [products, notifiedIds]);

  const markAsNotified = (id: string) => {
    setNotifiedIds(prev => ({ ...prev, [id]: true }));
    setAlerts(alerts.map(alert => 
      alert.id === id ? { ...alert, notified: true } : alert
    ));
  };

  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'low') return alert.type === 'low';
    if (filter === 'out') return alert.type === 'out';
    return true;
  });

  const lowStockCount = alerts.filter(a => a.type === 'low').length;
  const outOfStockCount = alerts.filter(a => a.type === 'out').length;
  const unnotifiedCount = alerts.filter(a => !a.notified).length;

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
        <h2 className="text-2xl font-bold">Stock Alerts</h2>
        <div className="flex gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertTriangle size={18} className="text-yellow-600" />
            <span className="text-sm font-medium text-yellow-600">{lowStockCount} Low Stock</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 rounded-lg">
            <Package size={18} className="text-red-600" />
            <span className="text-sm font-medium text-red-600">{outOfStockCount} Out of Stock</span>
          </div>
          {unnotifiedCount > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
              <Bell size={18} className="text-blue-600" />
              <span className="text-sm font-medium text-blue-600">{unnotifiedCount} Unnotified</span>
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
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

      {/* Alerts List */}
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
                    Reorder Point: <span className="font-bold">{alert.reorderPoint}</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Alert created: {new Date(alert.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {alert.notified ? (
                  <span className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                    <CheckCircle size={14} />
                    Notified
                  </span>
                ) : (
                  <button
                    onClick={() => markAsNotified(alert.id)}
                    className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium hover:bg-blue-200"
                  >
                    <Bell size={14} />
                    Mark as Notified
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredAlerts.length === 0 && (
        <div className="text-center py-12">
          <Bell className="mx-auto text-gray-300 mb-4" size={48} />
          <p className="text-gray-500">No alerts found</p>
        </div>
      )}
    </div>
  );
}
