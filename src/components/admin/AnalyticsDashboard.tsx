import React, { useState, useEffect, useMemo } from 'react';
import { 
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Download, TrendingUp, DollarSign, ShoppingBag, Users, 
  RefreshCw, ArrowUpRight, PackageCheck, Layers, Tag,
  Award, Sparkles, CheckCircle2
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import api from '../../services/api';

const PALETTE = [
  '#18181b', // Zinc 900
  '#059669', // Emerald 600
  '#2563eb', // Blue 600
  '#7c3aed', // Violet 600
  '#d97706', // Amber 600
  '#e11d48', // Rose 600
  '#0891b2', // Cyan 600
  '#4f46e5', // Indigo 600
];

export default function AnalyticsDashboard() {
  const { orders, products, categories, fetchOrders, fetchProducts, fetchCategories } = useStore();
  const [dateRange, setDateRange] = useState<'7days' | '30days' | '90days' | 'all'>('30days');
  const [distributionTab, setDistributionTab] = useState<'category' | 'product'>('category');
  const [loading, setLoading] = useState(false);
  const [serverAnalytics, setServerAnalytics] = useState<any | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchOrders(), fetchProducts(), fetchCategories()]);
      const res = await api.getAnalytics(dateRange);
      if (res && typeof res.totalRevenue === 'number') {
        setServerAnalytics(res);
      }
    } catch (err) {
      console.warn('Analytics API notice, using store fallback:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [dateRange]);

  // Compute analytics dynamically from server response, or fallback using store
  const computedData = useMemo(() => {
    const now = new Date();
    const daysLimit = dateRange === '7days' ? 7 : dateRange === '30days' ? 30 : dateRange === '90days' ? 90 : 3650;
    const cutoffDate = new Date(now.getTime() - daysLimit * 24 * 60 * 60 * 1000);

    const filteredOrders = orders.filter(o => {
      const orderDate = new Date(o.date || (o as any).created_at || Date.now());
      return orderDate >= cutoffDate;
    });

    const revenue = filteredOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
    const ordersCount = filteredOrders.length;

    // Active customers with >= 1 order
    const distinctBuyers = new Set<string>();
    filteredOrders.forEach(o => {
      const key = o.user_id || o.shipping_address?.email || o.shipping_address?.full_name || (o as any).email;
      if (key) distinctBuyers.add(String(key).toLowerCase().trim());
    });
    const uniqueCustomers = Math.max(distinctBuyers.size, ordersCount > 0 ? 1 : 0);
    const avgOrderValue = ordersCount > 0 ? Math.round(revenue / ordersCount) : 0;

    // Timeline days map
    const numDaysToDisplay = Math.min(daysLimit, 30);
    const daysMap: Record<string, { revenue: number; orders: number }> = {};
    for (let i = numDaysToDisplay - 1; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const key = d.toISOString().split('T')[0];
      daysMap[key] = { revenue: 0, orders: 0 };
    }

    filteredOrders.forEach(o => {
      const key = new Date(o.date || (o as any).created_at || Date.now()).toISOString().split('T')[0];
      if (daysMap[key]) {
        daysMap[key].revenue += Number(o.total) || 0;
        daysMap[key].orders += 1;
      }
    });

    const revenueData = Object.entries(daysMap).map(([date, val]) => ({
      date: date.slice(5),
      revenue: val.revenue,
    }));

    const ordersData = Object.entries(daysMap).map(([date, val]) => ({
      date: date.slice(5),
      orders: val.orders,
    }));

    // Category and Product breakdown
    const categoryMap: Record<string, { name: string; revenue: number; units: number; orderIds: Set<string> }> = {};
    const productSalesMap: Record<string, { id: string; name: string; sales: number; units: number; revenue: number; image?: string; category: string; orderIds: Set<string> }> = {};

    const catLookup = new Map<string, string>();
    categories.forEach(c => catLookup.set(c.id, c.name));

    filteredOrders.forEach(o => {
      const orderId = String(o.id || o.order_number || Math.random());
      const items = Array.isArray(o.items) ? o.items : [];

      items.forEach((item: any) => {
        const qty = Math.max(1, Number(item.quantity) || 1);
        const prodObj = item.product || {};
        const prod = products.find(p => 
          p.id === (item.product_id || prodObj.id || item.id) || 
          p.slug === (item.slug || prodObj.slug) ||
          p.name === (item.name || prodObj.name || item.product_name)
        );

        const itemPrice = Number(
          item.price || 
          item.unit_price || 
          prodObj.salePrice || 
          prodObj.price || 
          prodObj.base_price || 
          prod?.base_price || 
          (item.total_price ? Number(item.total_price) / qty : 0)
        ) || 0;

        const itemTotal = (item.total_price && Number(item.total_price) > 0)
          ? Number(item.total_price)
          : (itemPrice * qty);

        let cat = 'Streetwear';
        if (prod?.category_name) cat = prod.category_name;
        else if (prod?.category_id && catLookup.has(prod.category_id)) cat = catLookup.get(prod.category_id)!;
        else if (prod?.category) cat = prod.category;
        else if (item.category) cat = item.category;
        else if (prodObj.category) cat = prodObj.category;

        if (!categoryMap[cat]) {
          categoryMap[cat] = { name: cat, revenue: 0, units: 0, orderIds: new Set() };
        }
        categoryMap[cat].revenue += itemTotal;
        categoryMap[cat].units += qty;
        categoryMap[cat].orderIds.add(orderId);

        const prodName = prodObj.name || item.product_name || item.name || prod?.name || 'Streetwear Garment';
        const prodImg = prod?.image || prod?.images?.[0] || prodObj.image || prodObj.images?.[0] || item.image || 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&h=1000&fit=crop';

        if (!productSalesMap[prodName]) {
          productSalesMap[prodName] = { 
            id: prod?.id || item.product_id || prodObj.id || `prod-${Math.random()}`, 
            name: prodName, 
            sales: 0, 
            units: 0,
            revenue: 0, 
            image: prodImg, 
            category: cat,
            orderIds: new Set() 
          };
        }
        productSalesMap[prodName].sales += qty;
        productSalesMap[prodName].units += qty;
        productSalesMap[prodName].revenue += itemTotal;
        productSalesMap[prodName].orderIds.add(orderId);
      });
    });

    const totalCatRevenue = Object.values(categoryMap).reduce((s, v) => s + v.revenue, 0) || revenue || 1;
    const categoryData = Object.values(categoryMap)
      .map(c => ({
        name: c.name,
        value: c.revenue,
        units: c.units,
        orders_count: c.orderIds.size,
        percentage: Math.round((c.revenue / totalCatRevenue) * 100),
      }))
      .sort((a, b) => {
        // Sort by revenue descending, then units descending (highest on top #1)
        if (b.value !== a.value) return b.value - a.value;
        return b.units - a.units;
      });

    const productList = Object.values(productSalesMap).sort((a, b) => {
      // Sort by combined revenue and units (highest revenue & sold on top #1)
      if (b.revenue !== a.revenue) return b.revenue - a.revenue;
      return b.units - a.units;
    });
    const totalProdRev = productList.reduce((s, p) => s + p.revenue, 0) || revenue || 1;

    const productData = productList.map(p => ({
      name: p.name,
      value: p.revenue,
      sales: p.units,
      units: p.units,
      orders_count: p.orderIds.size,
      percentage: Math.round((p.revenue / totalProdRev) * 100),
      image: p.image,
      category: p.category,
    }));

    const finalTopProducts = productList.slice(0, 10).map(p => ({
      name: p.name,
      category: p.category,
      sales: p.units,
      units: p.units,
      revenue: p.revenue,
      orders_count: p.orderIds.size,
      image: p.image,
    }));

    // If server analytics returned data, blend to preserve server totals while guaranteeing units & categories are accurate
    if (serverAnalytics) {
      const srvCat = Array.isArray(serverAnalytics.categoryRevenue) && serverAnalytics.categoryRevenue.length > 0 
        ? serverAnalytics.categoryRevenue.map((sc: any) => {
            const localMatch = categoryData.find(c => c.name.toLowerCase() === sc.name?.toLowerCase());
            return {
              ...sc,
              units: (sc.units && sc.units > 0) ? sc.units : (localMatch?.units || 1),
              value: Number(sc.value ?? sc.revenue ?? localMatch?.value ?? 0),
            };
          }).sort((a: any, b: any) => b.value !== a.value ? b.value - a.value : b.units - a.units)
        : categoryData;

      const srvProd = Array.isArray(serverAnalytics.productRevenue) && serverAnalytics.productRevenue.length > 0
        ? serverAnalytics.productRevenue.map((sp: any) => {
            const localMatch = productData.find(p => p.name.toLowerCase() === sp.name?.toLowerCase());
            return {
              ...sp,
              value: Number(sp.value ?? sp.revenue ?? localMatch?.value ?? 0),
              units: (sp.units && sp.units > 0) ? sp.units : (localMatch?.units || sp.sales || 1),
            };
          }).sort((a: any, b: any) => b.value !== a.value ? b.value - a.value : b.units - a.units)
        : productData;

      const srvTop = Array.isArray(serverAnalytics.topProducts) && serverAnalytics.topProducts.length > 0
        ? serverAnalytics.topProducts.map((tp: any) => {
            const localMatch = finalTopProducts.find(p => p.name.toLowerCase() === tp.name?.toLowerCase());
            return {
              ...tp,
              revenue: Number(tp.revenue ?? tp.value ?? localMatch?.revenue ?? 0),
              units: Number(tp.units ?? tp.sales ?? localMatch?.units ?? 1),
              sales: Number(tp.sales ?? tp.units ?? localMatch?.sales ?? 1),
            };
          }).sort((a: any, b: any) => b.revenue !== a.revenue ? b.revenue - a.revenue : b.units - a.units)
        : finalTopProducts;

      return {
        revenue: serverAnalytics.totalRevenue ?? revenue,
        orders: serverAnalytics.totalOrders ?? ordersCount,
        customers: serverAnalytics.activeCustomers ?? uniqueCustomers,
        avgOrderValue: serverAnalytics.avgOrderValue ?? avgOrderValue,
        revenueData: (serverAnalytics.revenueProgression && serverAnalytics.revenueProgression.length > 0) ? serverAnalytics.revenueProgression : revenueData,
        ordersData: (serverAnalytics.orderVolume && serverAnalytics.orderVolume.length > 0) ? serverAnalytics.orderVolume : ordersData,
        categoryData: srvCat,
        productData: srvProd,
        topProducts: srvTop,
      };
    }

    return {
      revenue,
      orders: ordersCount,
      customers: uniqueCustomers,
      avgOrderValue,
      revenueData,
      ordersData,
      categoryData,
      productData,
      topProducts: finalTopProducts,
    };
  }, [serverAnalytics, orders, products, categories, dateRange]);

  const activeDonutData = distributionTab === 'category' ? computedData.categoryData : computedData.productData;

  const totalUnitsInView = useMemo(() => {
    return activeDonutData.reduce((sum: number, item: any) => sum + (Number(item.units || item.sales) || 0), 0);
  }, [activeDonutData]);

  const totalRevenueInView = useMemo(() => {
    return activeDonutData.reduce((sum: number, item: any) => sum + (Number(item.value) || 0), 0);
  }, [activeDonutData]);

  const exportToCSV = () => {
    const csvRows = [
      ['Ravenza Admin Analytics Report', `Date: ${new Date().toISOString()}`],
      ['Date Range Filter', dateRange],
      [''],
      ['KPI Summary', 'Value'],
      ['Total Order Revenue (PKR)', `Rs. ${computedData.revenue}`],
      ['Total Orders Placed', computedData.orders],
      ['Active Buying Customers', computedData.customers],
      ['Average Order Value (AOV)', `Rs. ${computedData.avgOrderValue}`],
      [''],
      ['Revenue Breakdown by Category'],
      ['Category Name', 'Units Sold', 'Orders Count', 'Revenue (PKR)', 'Contribution %'],
      ...computedData.categoryData.map((c: any) => [
        c.name,
        c.units || c.sales || 0,
        c.orders_count || 1,
        `Rs. ${c.value}`,
        `${c.percentage || 0}%`
      ]),
      [''],
      ['Revenue Breakdown by Products'],
      ['Product Name', 'Category', 'Units Sold', 'Orders Count', 'Total Revenue (PKR)', 'Contribution %'],
      ...computedData.productData.map((p: any) => [
        p.name,
        p.category || 'Streetwear',
        p.units || p.sales || 0,
        p.orders_count || 1,
        `Rs. ${p.value}`,
        `${p.percentage || 0}%`
      ]),
      [''],
      ['Top Performing Products Leaderboard'],
      ['Rank', 'Product Name', 'Category', 'Total Units Sold', 'Total Revenue Earned (PKR)'],
      ...computedData.topProducts.map((p: any, idx: number) => [
        idx + 1,
        p.name,
        p.category || 'Streetwear',
        p.units || p.sales || 0,
        `Rs. ${p.revenue}`
      ]),
    ];

    const csvContent = csvRows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ravenza-analytics-${dateRange}-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Range Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-black font-display text-gray-900 tracking-tight">Analytics & Business Intelligence</h2>
            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[10px] font-bold uppercase tracking-wider">
              Neon DB Live
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Dynamic statistics derived directly from placed customer orders, product SKUs, and category conversions.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadData}
            disabled={loading}
            className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors disabled:opacity-50"
            title="Refresh analytics data"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>

          <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-xl border border-gray-200 text-xs font-semibold">
            {(['7days', '30days', '90days', 'all'] as const).map(rangeKey => (
              <button
                key={rangeKey}
                onClick={() => setDateRange(rangeKey)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  dateRange === rangeKey 
                    ? 'bg-white text-black font-bold shadow-xs' 
                    : 'text-gray-500 hover:text-black'
                }`}
              >
                {rangeKey === '7days' ? '7D' : rangeKey === '30days' ? '30D' : rangeKey === '90days' ? '90D' : 'All Time'}
              </button>
            ))}
          </div>

          <button
            onClick={exportToCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-black hover:bg-zinc-800 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
            title="Download CSV report"
          >
            <Download size={13} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Cards: Revenue, Orders, Active Customers, AOV */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex flex-col justify-between hover:border-gray-300 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Revenue</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <DollarSign size={18} />
            </div>
          </div>
          <div>
            <p className="text-2xl font-black font-display text-gray-900">
              Rs. {computedData.revenue.toLocaleString()}
            </p>
            <p className="text-[11px] font-semibold text-emerald-600 mt-1 flex items-center gap-1">
              <ArrowUpRight size={13} /> Real checkout conversions
            </p>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex flex-col justify-between hover:border-gray-300 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Orders</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <ShoppingBag size={18} />
            </div>
          </div>
          <div>
            <p className="text-2xl font-black font-display text-gray-900">
              {computedData.orders.toLocaleString()}
            </p>
            <p className="text-[11px] font-semibold text-blue-600 mt-1 flex items-center gap-1">
              <PackageCheck size={13} /> In selected date range
            </p>
          </div>
        </div>

        {/* Active Customers */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex flex-col justify-between hover:border-gray-300 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Active Customers</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <Users size={18} />
            </div>
          </div>
          <div>
            <p className="text-2xl font-black font-display text-gray-900">
              {computedData.customers.toLocaleString()}
            </p>
            <p className="text-[11px] font-semibold text-purple-600 mt-1">
              Customers with ≥ 1 placed order
            </p>
          </div>
        </div>

        {/* Average Order Value (AOV) */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex flex-col justify-between hover:border-gray-300 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Avg Order Value (AOV)</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <TrendingUp size={18} />
            </div>
          </div>
          <div>
            <p className="text-2xl font-black font-display text-gray-900">
              Rs. {computedData.avgOrderValue.toLocaleString()}
            </p>
            <p className="text-[11px] font-semibold text-amber-700 mt-1">
              Revenue per checkout transaction
            </p>
          </div>
        </div>
      </div>

      {/* Primary Graphs Grid: Revenue Progression & Order Volume */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Progression Area Chart */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm text-gray-900">Revenue Progression (PKR)</h3>
              <p className="text-[11px] text-gray-400">Total generated sales volume across timeline</p>
            </div>
            <span className="text-xs font-mono font-bold text-gray-800 bg-gray-100 px-2.5 py-1 rounded-lg">
              Rs. {computedData.revenue.toLocaleString()}
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={computedData.revenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#18181b" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#18181b" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" vertical={false} />
                <XAxis dataKey="date" stroke="#a1a1aa" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis 
                  stroke="#a1a1aa" 
                  fontSize={11} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(val) => `Rs.${(val / 1000).toFixed(0)}k`} 
                />
                <Tooltip
                  formatter={(value: any) => [`Rs. ${Number(value).toLocaleString()}`, 'Revenue']}
                  contentStyle={{ 
                    backgroundColor: '#18181b', 
                    borderRadius: '12px', 
                    color: '#ffffff', 
                    border: 'none', 
                    fontSize: '12px',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)'
                  }}
                  itemStyle={{ color: '#ffffff' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#18181b" 
                  strokeWidth={2.5} 
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Order Volume Breakdown Bar Chart */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm text-gray-900">Order Volume Breakdown</h3>
              <p className="text-[11px] text-gray-400">Total number of customer checkouts by date</p>
            </div>
            <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg">
              {computedData.orders} Orders
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={computedData.ordersData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" vertical={false} />
                <XAxis dataKey="date" stroke="#a1a1aa" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#a1a1aa" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip
                  formatter={(value: any) => [`${value} Orders`, 'Order Count']}
                  contentStyle={{ 
                    backgroundColor: '#18181b', 
                    borderRadius: '12px', 
                    color: '#ffffff', 
                    border: 'none', 
                    fontSize: '12px',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)'
                  }}
                  itemStyle={{ color: '#ffffff' }}
                />
                <Bar dataKey="orders" fill="#3f3f46" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Secondary Graphs Grid: Animated Donut (Category vs Products) & Top Performing Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Animated Radial / Donut Distribution Section */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <div>
              <h3 className="font-bold text-sm text-gray-900">
                Revenue Distribution (Circle Radius)
              </h3>
              <p className="text-[11px] text-gray-400">
                {distributionTab === 'category' 
                  ? 'Dynamic category share aggregated from orders & product categories' 
                  : 'Dynamic product sales aggregated from individual order items'}
              </p>
            </div>

            {/* Tab Button Toggle: Revenue by Category vs Revenue by Products */}
            <div className="flex items-center p-1 bg-gray-100 rounded-xl border border-gray-200 text-xs self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setDistributionTab('category')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  distributionTab === 'category'
                    ? 'bg-black text-white shadow-xs'
                    : 'text-gray-500 hover:text-black'
                }`}
              >
                Revenue by Category
              </button>
              <button
                type="button"
                onClick={() => setDistributionTab('product')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  distributionTab === 'product'
                    ? 'bg-black text-white shadow-xs'
                    : 'text-gray-500 hover:text-black'
                }`}
              >
                Revenue by Products
              </button>
            </div>
          </div>

          {/* Clean Radius Circle / Pie Distribution Chart with Center Summary */}
          <div className="h-68 w-full flex items-center justify-center relative my-2">
            {activeDonutData && activeDonutData.length > 0 ? (
              <div className="w-full h-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={activeDonutData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      innerRadius={66}
                      paddingAngle={2.5}
                      dataKey="value"
                      nameKey="name"
                      stroke="#ffffff"
                      strokeWidth={2}
                      isAnimationActive={false}
                    >
                      {activeDonutData.map((_, index) => (
                        <Cell 
                          key={`cell-${distributionTab}-${index}`} 
                          fill={PALETTE[index % PALETTE.length]} 
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          const rev = Number(data.value || data.revenue || 0);
                          const units = data.units || data.sales || 0;
                          const pct = totalRevenueInView > 0 ? Math.round((rev / totalRevenueInView) * 100) : (data.percentage || 0);
                          return (
                            <div className="bg-zinc-950 text-white p-3 rounded-xl shadow-2xl border border-zinc-800 text-xs space-y-1 z-50">
                              <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: payload[0].color }} />
                                <p className="font-bold text-white text-xs">{data.name}</p>
                              </div>
                              {data.category && distributionTab === 'product' && (
                                <p className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">
                                  Category: {data.category}
                                </p>
                              )}
                              <div className="pt-1 border-t border-zinc-800 space-y-0.5 text-[11px]">
                                <p className="text-emerald-400 font-mono font-bold">
                                  Total Revenue: Rs. {rev.toLocaleString()}
                                </p>
                                <p className="text-zinc-300">
                                  Units Sold: <strong className="text-white">{units} {units === 1 ? 'unit' : 'units'}</strong>
                                </p>
                                {data.orders_count !== undefined && (
                                  <p className="text-zinc-400">
                                    Orders: <strong className="text-white">{data.orders_count} orders</strong>
                                  </p>
                                )}
                                <p className="text-zinc-400">
                                  Revenue Share: <strong className="text-emerald-400">{pct}%</strong>
                                </p>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>

                {/* Donut Center Overlay Info */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    {distributionTab === 'category' ? 'Category Units' : 'Product Units'}
                  </span>
                  <span className="text-2xl font-black font-display text-gray-900 leading-tight">
                    {totalUnitsInView.toLocaleString()}
                  </span>
                  <span className="text-[11px] font-bold text-emerald-600 font-mono">
                    Rs. {totalRevenueInView.toLocaleString()}
                  </span>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-gray-400">
                No transactions recorded for this period.
              </div>
            )}
          </div>

          {/* Dynamic Breakdown List / Slices Details */}
          <div className="space-y-2 pt-3 border-t border-gray-100 max-h-52 overflow-y-auto pr-1">
            {activeDonutData.map((item: any, idx: number) => {
              const units = item.units || item.sales || 0;
              const revenue = Number(item.value || item.revenue || 0);
              const percentage = totalRevenueInView > 0 ? Math.round((revenue / totalRevenueInView) * 100) : (item.percentage || 0);
              const color = PALETTE[idx % PALETTE.length];

              return (
                <div key={idx} className="p-2.5 rounded-xl bg-gray-50/80 hover:bg-gray-100/70 transition-colors border border-gray-100">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <span 
                        className="w-3 h-3 rounded-full shrink-0 shadow-xs" 
                        style={{ backgroundColor: color }} 
                      />
                      <span className="font-bold text-gray-900 truncate text-[11px]">{item.name}</span>
                      {item.category && distributionTab === 'product' && (
                        <span className="px-1.5 py-0.2 bg-gray-200/80 text-gray-600 rounded text-[9px] uppercase font-semibold shrink-0">
                          {item.category}
                        </span>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-black font-mono text-gray-900 text-xs">
                        Rs. {revenue.toLocaleString()}
                      </span>
                      <span className="text-[11px] text-gray-500 font-semibold ml-2">
                        ({units} {units === 1 ? 'unit' : 'units'})
                      </span>
                    </div>
                  </div>

                  {/* Contribution Progress Bar */}
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-500" 
                        style={{ width: `${Math.min(100, Math.max(percentage, units > 0 ? 3 : 0))}%`, backgroundColor: color }}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-gray-600 font-mono w-8 text-right">
                      {percentage}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Performing Products Section */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-sm text-gray-900">Top Performing Products</h3>
                <Award size={15} className="text-amber-500" />
              </div>
              <p className="text-[11px] text-gray-400">
                Ranked dynamically by total units sold & order revenue (total units × price)
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
              Sales Leaders
            </span>
          </div>

          <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
            {computedData.topProducts.map((prod: any, index: number) => {
              const prodImg = prod.image || 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&h=1000&fit=crop';
              const topPerformerRevenue = computedData.topProducts[0]?.revenue || 1;
              const relativeBarPercent = Math.min(100, Math.round(((prod.revenue || 0) / topPerformerRevenue) * 100));

              return (
                <div 
                  key={index} 
                  className="flex flex-col p-3 bg-gray-50/70 hover:bg-gray-100/80 rounded-xl transition-all border border-gray-100 text-xs space-y-2"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Rank Badge */}
                      <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-black text-[11px] shrink-0 shadow-xs ${
                        index === 0 
                          ? 'bg-amber-400 text-black ring-2 ring-amber-300/50' 
                          : index === 1 
                          ? 'bg-zinc-300 text-zinc-900' 
                          : index === 2 
                          ? 'bg-amber-700/80 text-white' 
                          : 'bg-gray-200 text-gray-700'
                      }`}>
                        #{index + 1}
                      </span>

                      {/* Thumbnail Image */}
                      <img 
                        src={prodImg} 
                        alt={prod.name} 
                        className="w-10 h-10 object-cover rounded-lg border border-gray-200 shrink-0 bg-white" 
                      />

                      {/* Name & Category */}
                      <div className="min-w-0">
                        <p className="font-bold text-gray-900 truncate text-xs">{prod.name}</p>
                        <p className="text-[11px] text-gray-500 mt-0.5 flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-gray-800">
                            {prod.sales || prod.units || 1} units sold
                          </span>
                          {prod.orders_count !== undefined && (
                            <span className="text-gray-400 text-[10px]">
                              • in {prod.orders_count} {prod.orders_count === 1 ? 'order' : 'orders'}
                            </span>
                          )}
                          {prod.category && (
                            <span className="px-1.5 py-0.2 bg-gray-200/80 rounded text-[9px] text-gray-700 uppercase font-semibold">
                              {prod.category}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Total Price Earned */}
                    <div className="text-right shrink-0">
                      <p className="font-black text-gray-900 text-xs font-mono">
                        Rs. {Number(prod.revenue || 0).toLocaleString()}
                      </p>
                      <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">Total Revenue</p>
                    </div>
                  </div>

                  {/* Relative Volume Progress Bar */}
                  <div className="w-full bg-gray-200/80 h-1 rounded-full overflow-hidden">
                    <div 
                      className="bg-zinc-900 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${Math.max(relativeBarPercent, 4)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
            <span>Aggregated from orders table & items</span>
            <span className="font-mono text-gray-800 font-bold">
              Total Revenue: Rs. {computedData.revenue.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
