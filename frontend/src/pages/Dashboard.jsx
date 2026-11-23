import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Bot,
  ShieldAlert,
  CreditCard,
  ShoppingBag,
  ArrowUpRight,
  Sparkles,
  CheckCircle2,
  AlertOctagon,
  RefreshCw,
  DollarSign,
  Package,
  AlertTriangle,
  Clock,
  Layers,
  ArrowRight
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { Link } from 'react-router-dom';
import { getDashboardStats } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getDashboardStats();
      setStats(res.data);
    } catch (err) {
      console.error('Failed to load dashboard statistics:', err);
      setError('Unable to fetch live merchant metrics from backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
          <p className="text-sm text-gray-400 font-medium">Aggregating Verified Merchant Metrics...</p>
        </div>
      </div>
    );
  }

  const rev = stats?.revenue_insights || {};
  const trend = stats?.revenue_trend || [];
  const recentOrders = stats?.recent_orders || [];
  const topProducts = stats?.top_selling_products || [];
  const lowStockProducts = stats?.low_stock_products || [];

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#181B26] via-[#151720] to-[#1C1815] border border-amber-500/20 rounded-2xl p-6 relative overflow-hidden shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                MERCHANT PORTAL 2.0
              </span>
              <span className="text-xs text-gray-400 font-mono">
                {user?.name ? `${user.name}'s Store` : 'Apex Electronics Store'}
              </span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Commercial Intelligence & Merchant Operations
            </h2>
            <p className="text-xs text-gray-400 mt-1 max-w-2xl leading-relaxed">
              Real-time monitoring of verified Razorpay transactions, deterministic policy guardrails, inventory tracking, and Apriori revenue intelligence.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchStats}
              className="px-3.5 py-2 rounded-xl bg-gray-900/90 hover:bg-gray-800 border border-gray-700 text-gray-300 text-xs font-medium flex items-center gap-2 transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Metrics</span>
            </button>
            <Link
              to="/catalog"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-copper-500 hover:from-amber-500 hover:to-amber-400 text-white text-xs font-semibold shadow-lg shadow-amber-500/20 flex items-center gap-1.5 transition"
            >
              <Package className="w-4 h-4" />
              <span>Manage Products</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Primary KPI Metric Cards (Real Database Derived) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Verified Revenue */}
        <div className="bg-[#141721] border border-gray-800/80 rounded-2xl p-5 hover:border-amber-500/30 transition">
          <div className="flex items-center justify-between text-gray-400 text-xs font-medium mb-3">
            <span>Verified Paid Revenue</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            ₹{stats?.total_revenue?.toLocaleString('en-IN') || '0'}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium mt-2">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{stats?.completed_orders || 0} Settled Orders</span>
          </div>
          <span className="text-[10px] text-gray-500 block mt-1">Verified via HMAC-SHA256</span>
        </div>

        {/* Total Orders & Status Breakdown */}
        <div className="bg-[#141721] border border-gray-800/80 rounded-2xl p-5 hover:border-gray-700 transition">
          <div className="flex items-center justify-between text-gray-400 text-xs font-medium mb-3">
            <span>Order Pipeline</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            {stats?.total_orders || 0}
          </div>
          <div className="flex items-center gap-2 text-xs font-medium mt-2">
            <span className="text-amber-400">{stats?.pending_orders || 0} Pending</span>
            <span className="text-gray-600">•</span>
            <span className="text-emerald-400">{stats?.completed_orders || 0} Paid</span>
          </div>
          <span className="text-[10px] text-gray-500 block mt-1">Order State Tracking</span>
        </div>

        {/* Average Order Value (AOV) */}
        <div className="bg-[#141721] border border-gray-800/80 rounded-2xl p-5 hover:border-gray-700 transition">
          <div className="flex items-center justify-between text-gray-400 text-xs font-medium mb-3">
            <span>Average Order Value</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            ₹{stats?.average_order_value?.toLocaleString('en-IN') || '0'}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium mt-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Basket Bundling Active</span>
          </div>
          <span className="text-[10px] text-gray-500 block mt-1">Mined Co-occurrence Lift</span>
        </div>

        {/* Inventory Status (Low-Stock & Out-of-Stock) */}
        <div className="bg-[#141721] border border-gray-800/80 rounded-2xl p-5 hover:border-red-500/30 transition">
          <div className="flex items-center justify-between text-gray-400 text-xs font-medium mb-3">
            <span>Inventory Health</span>
            <div className="p-2 rounded-xl bg-red-500/10 text-red-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white font-mono flex items-center gap-2">
            <span className={stats?.low_stock_count > 0 ? 'text-amber-400' : 'text-gray-300'}>
              {stats?.low_stock_count || 0}
            </span>
            <span className="text-xs text-gray-500 font-normal">low stock</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-red-400 font-medium mt-2">
            <AlertOctagon className="w-3.5 h-3.5" />
            <span>{stats?.out_of_stock_count || 0} Out-of-Stock Items</span>
          </div>
          <span className="text-[10px] text-gray-500 block mt-1">Real-time Catalog Thresholds</span>
        </div>
      </div>

      {/* Main Charts & Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Real 7-Day Revenue Trend (2 Columns) */}
        <div className="lg:col-span-2 bg-[#141721] border border-gray-800/80 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-white tracking-tight">
                7-Day Revenue Velocity (Database-Derived)
              </h3>
              <p className="text-xs text-gray-400">Daily settlement totals from verified customer orders</p>
            </div>
            <span className="text-[11px] font-mono text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
              Live SQL Aggregation
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="amberRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2430" vertical={false} />
                <XAxis dataKey="day" stroke="#64748B" tick={{ fontSize: 11 }} />
                <YAxis
                  stroke="#64748B"
                  tick={{ fontSize: 11 }}
                  tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F1117',
                    borderColor: '#374151',
                    borderRadius: '0.75rem',
                    fontSize: '11px',
                    color: '#fff'
                  }}
                  formatter={(val) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Revenue']}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#F59E0B"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#amberRev)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Low Stock Alerts / Fast Action Panel */}
        <div className="bg-[#141721] border border-gray-800/80 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Inventory Alerts</span>
              </h3>
              <span className="text-[10px] font-mono text-gray-400">
                {lowStockProducts.length} items flagged
              </span>
            </div>

            {lowStockProducts.length === 0 ? (
              <div className="text-center py-10 space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <p className="text-xs text-gray-300 font-medium">All products adequately stocked</p>
                <p className="text-[11px] text-gray-500">No items below threshold levels.</p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                {lowStockProducts.map((p) => (
                  <div
                    key={p.id}
                    className="p-3 rounded-xl bg-gray-900/80 border border-gray-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="text-white font-medium block truncate max-w-[160px]">{p.name}</span>
                      <span className="text-[10px] text-gray-500">{p.category}</span>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        p.stock === 0 ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}>
                        {p.stock === 0 ? 'OUT OF STOCK' : `${p.stock} left`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-gray-800/80 mt-4">
            <Link
              to="/catalog"
              className="w-full py-2 rounded-xl bg-gray-900 hover:bg-gray-800 border border-gray-700 text-gray-200 text-xs font-medium flex items-center justify-center gap-1.5 transition"
            >
              <span>Restock in Product Matrix</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Top-Selling Products & Recent Orders Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top-Selling Products */}
        <div className="bg-[#141721] border border-gray-800/80 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>Top-Selling Products (Real Order Baskets)</span>
            </h3>
            <span className="text-[11px] text-gray-400 font-mono">By Units Sold</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-800 text-gray-500 uppercase tracking-wider text-[10px]">
                  <th className="pb-2.5">Product</th>
                  <th className="pb-2.5">Price</th>
                  <th className="pb-2.5">Units Sold</th>
                  <th className="pb-2.5 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {topProducts.map((p) => (
                  <tr key={p.product_id} className="hover:bg-gray-900/40 transition">
                    <td className="py-2.5 font-medium text-white max-w-[180px] truncate">
                      {p.name}
                      <span className="block text-[10px] text-gray-500 font-normal">{p.category}</span>
                    </td>
                    <td className="py-2.5 text-gray-300 font-mono">₹{p.price.toLocaleString('en-IN')}</td>
                    <td className="py-2.5 text-amber-400 font-semibold font-mono">{p.units_sold}</td>
                    <td className="py-2.5 text-right text-emerald-400 font-mono font-bold">
                      ₹{p.total_revenue.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Orders Ledger with Fulfillment Status */}
        <div className="bg-[#141721] border border-gray-800/80 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-blue-400" />
              <span>Recent Customer Orders</span>
            </h3>
            <Link to="/transactions" className="text-xs text-amber-400 hover:text-amber-300 font-medium">
              View All &rarr;
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-800 text-gray-500 uppercase tracking-wider text-[10px]">
                  <th className="pb-2.5">Order ID</th>
                  <th className="pb-2.5">Customer</th>
                  <th className="pb-2.5">Amount</th>
                  <th className="pb-2.5">Status</th>
                  <th className="pb-2.5 text-right">Fulfillment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {recentOrders.slice(0, 6).map((o) => (
                  <tr key={o.id} className="hover:bg-gray-900/40 transition">
                    <td className="py-2.5 font-mono text-gray-300 text-[11px]">{o.id}</td>
                    <td className="py-2.5 text-gray-300 max-w-[120px] truncate">{o.customer_name}</td>
                    <td className="py-2.5 text-white font-mono font-semibold">
                      ₹{o.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-2.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        o.status === 'PAID' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="py-2.5 text-right">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-gray-800 text-gray-300 border border-gray-700">
                        {o.fulfillment_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
