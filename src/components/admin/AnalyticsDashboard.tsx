import { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download, TrendingUp, DollarSign, ShoppingBag, Users, AlertTriangle } from 'lucide-react';

interface AnalyticsData {
  revenue: number;
  orders: number;
  customers: number;
  avgOrderValue: number;
  revenueData: Array<{ date: string; revenue: number }>;
  ordersData: Array<{ date: string; orders: number }>;
  categoryData: Array<{ name: string; value: number }>;
  productData: Array<{ name: string; sales: number; revenue: number }>;
  topProducts: Array<{ name: string; sales: number; revenue: number }>;
  lowStockAlerts: number;
}

export default function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [dateRange, setDateRange] = useState('30days');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/analytics?dateRange=${dateRange}`);
      const analyticsData = await response.json();
      const alertsResponse = await fetch('/api/admin/stock-alerts');
      const alerts = await alertsResponse.json();

      setData({
        ...analyticsData,
        lowStockAlerts: alerts.length
      });
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (!data) return;
    const csv = [
      ['Metric', 'Value'],
      ['Total Revenue', data.revenue],
      ['Total Orders', data.orders],
      ['Total Customers', data.customers],
      ['Average Order Value', data.avgOrderValue],
      ['Low Stock Alerts', data.lowStockAlerts],
      [''],
      ['Revenue Over Time'],
      ['Date', 'Revenue'],
      ...data.revenueData.map(d => [d.date, d.revenue]),
      [''],
      ['Orders Over Time'],
      ['Date', 'Orders'],
      ...data.ordersData.map(d => [d.date, d.orders]),
      [''],
      ['Sales by Category'],
      ['Category', 'Units Sold'],
      ...data.categoryData.map(c => [c.name, c.value]),
      [''],
      ['Top Products'],
      ['Product', 'Sales', 'Revenue'],
      ...data.topProducts.map(p => [p.name, p.sales, p.revenue]),
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-report-${dateRange}.csv`;
    a.click();
  };

  const COLORS = ['#000000', '#6B7280', '#9CA3AF', '#D1D5DB', '#E5E7EB', '#F3F4F6'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Failed to load analytics data</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
          <p className="text-sm text-gray-500 mt-1">Real-time insights from delivered orders only</p>
        </div>
        <div className="flex gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border rounded-lg text-sm"
          >
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 90 Days</option>
          </select>
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 text-sm"
          >
            <Download size={18} />
            Export CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Total Revenue</span>
            <DollarSign className="text-green-600" size={20} />
          </div>
          <p className="text-2xl font-bold">Rs. {data.revenue.toLocaleString()}</p>
          <p className="text-xs text-gray-400 mt-1">From delivered orders only</p>
        </div>

        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Total Orders</span>
            <ShoppingBag className="text-blue-600" size={20} />
          </div>
          <p className="text-2xl font-bold">{data.orders}</p>
          <p className="text-xs text-gray-400 mt-1">Delivered orders count</p>
        </div>

        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Total Customers</span>
            <Users className="text-purple-600" size={20} />
          </div>
          <p className="text-2xl font-bold">{data.customers}</p>
          <p className="text-xs text-gray-400 mt-1">Registered + Subscribers</p>
        </div>

        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Avg Order Value</span>
            <TrendingUp className="text-orange-600" size={20} />
          </div>
          <p className="text-2xl font-bold">Rs. {Math.round(data.avgOrderValue).toLocaleString()}</p>
          <p className="text-xs text-gray-400 mt-1">Per order average</p>
        </div>
      </div>

      {data.lowStockAlerts > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
          <AlertTriangle className="text-amber-600" size={24} />
          <div>
            <p className="font-semibold text-amber-800">{data.lowStockAlerts} Low Stock Alerts</p>
            <p className="text-sm text-amber-600">Products need immediate restocking</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <h3 className="font-bold mb-4 text-lg">Revenue Over Time (Delivered Orders)</h3>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={data.revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value) => `Rs. ${value}`} />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#000000" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <h3 className="font-bold mb-4 text-lg">Orders Over Time (Delivered Only)</h3>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={data.ordersData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="orders" fill="#6B7280" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <h3 className="font-bold mb-4 text-lg">Sales by Category</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {data.categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <h3 className="font-bold mb-4 text-lg">Sales by Products</h3>
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {data.productData?.slice(0, 10).map((product, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{product.name}</p>
                    <p className="text-xs text-gray-500">{product.sales} units sold</p>
                  </div>
                  <p className="font-bold text-sm">Rs. {product.revenue.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <h3 className="font-bold mb-4 text-lg">Top 10 Products by Sales</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.topProducts.slice(0, 10).map((product, index) => (
              <div key={index} className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-6 rounded-full bg-black text-white text-xs font-bold flex items-center justify-center">
                    {index + 1}
                  </span>
                  <p className="font-semibold text-sm truncate flex-1">{product.name}</p>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">{product.sales} sales</span>
                  <span className="font-bold text-sm">Rs. {product.revenue.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
