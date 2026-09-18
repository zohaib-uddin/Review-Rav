import { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download, TrendingUp, DollarSign, ShoppingBag, Users } from 'lucide-react';

interface AnalyticsData {
  revenue: number;
  orders: number;
  customers: number;
  avgOrderValue: number;
  revenueData: Array<{ date: string; revenue: number }>;
  ordersData: Array<{ date: string; orders: number }>;
  categoryData: Array<{ name: string; value: number }>;
  topProducts: Array<{ name: string; sales: number; revenue: number }>;
}

export default function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [dateRange, setDateRange] = useState('7days');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      // Simulate API call - replace with actual API
      const mockData: AnalyticsData = {
        revenue: 1250000,
        orders: 342,
        customers: 156,
        avgOrderValue: 3654,
        revenueData: [
          { date: '2024-01-01', revenue: 150000 },
          { date: '2024-01-02', revenue: 180000 },
          { date: '2024-01-03', revenue: 165000 },
          { date: '2024-01-04', revenue: 195000 },
          { date: '2024-01-05', revenue: 210000 },
          { date: '2024-01-06', revenue: 175000 },
          { date: '2024-01-07', revenue: 175000 },
        ],
        ordersData: [
          { date: '2024-01-01', orders: 45 },
          { date: '2024-01-02', orders: 52 },
          { date: '2024-01-03', orders: 48 },
          { date: '2024-01-04', orders: 55 },
          { date: '2024-01-05', orders: 58 },
          { date: '2024-01-06', orders: 42 },
          { date: '2024-01-07', orders: 42 },
        ],
        categoryData: [
          { name: 'Co-Ord Sets', value: 450000 },
          { name: 'Oversize Tees', value: 320000 },
          { name: 'Graphic Trousers', value: 280000 },
          { name: 'Trackpants', value: 120000 },
          { name: 'Others', value: 80000 },
        ],
        topProducts: [
          { name: 'Shadow Realm Co-Ord', sales: 45, revenue: 180000 },
          { name: 'Acid Wash Phantom Tee', sales: 38, revenue: 95000 },
          { name: 'Wide Leg Trouser', sales: 32, revenue: 96000 },
          { name: 'Urban Drift Trackpants', sales: 28, revenue: 70000 },
          { name: 'Neon Pulse Shorts', sales: 25, revenue: 50000 },
        ],
      };
      
      setData(mockData);
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
      [''],
      ['Top Products'],
      ['Product', 'Sales', 'Revenue'],
      ...data.topProducts.map(p => [p.name, p.sales, p.revenue]),
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'analytics-report.csv';
    a.click();
  };

  const COLORS = ['#000000', '#6B7280', '#9CA3AF', '#D1D5DB', '#E5E7EB'];

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
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
        <div className="flex gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 90 Days</option>
          </select>
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
          >
            <Download size={18} />
            Export
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Total Revenue</span>
            <DollarSign className="text-green-600" size={20} />
          </div>
          <p className="text-2xl font-bold">Rs. {data.revenue.toLocaleString()}</p>
          <p className="text-xs text-green-600 mt-1">+12% from last month</p>
        </div>

        <div className="bg-white p-6 rounded-xl border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Total Orders</span>
            <ShoppingBag className="text-blue-600" size={20} />
          </div>
          <p className="text-2xl font-bold">{data.orders}</p>
          <p className="text-xs text-blue-600 mt-1">+8% from last month</p>
        </div>

        <div className="bg-white p-6 rounded-xl border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Total Customers</span>
            <Users className="text-purple-600" size={20} />
          </div>
          <p className="text-2xl font-bold">{data.customers}</p>
          <p className="text-xs text-purple-600 mt-1">+15% from last month</p>
        </div>

        <div className="bg-white p-6 rounded-xl border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Avg Order Value</span>
            <TrendingUp className="text-orange-600" size={20} />
          </div>
          <p className="text-2xl font-bold">Rs. {data.avgOrderValue.toLocaleString()}</p>
          <p className="text-xs text-orange-600 mt-1">+5% from last month</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white p-6 rounded-xl border">
          <h3 className="font-bold mb-4">Revenue Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#000000" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Orders Chart */}
        <div className="bg-white p-6 rounded-xl border">
          <h3 className="font-bold mb-4">Orders Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
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

        {/* Category Distribution */}
        <div className="bg-white p-6 rounded-xl border">
          <h3 className="font-bold mb-4">Sales by Category</h3>
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

        {/* Top Products */}
        <div className="bg-white p-6 rounded-xl border">
          <h3 className="font-bold mb-4">Top Products</h3>
          <div className="space-y-3">
            {data.topProducts.map((product, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium">{product.name}</p>
                  <p className="text-sm text-gray-500">{product.sales} sales</p>
                </div>
                <p className="font-bold">Rs. {product.revenue.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
