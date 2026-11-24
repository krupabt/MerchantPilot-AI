import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  DollarSign,
  ShoppingCart,
  Layers,
  AlertTriangle,
  RefreshCw,
  ArrowRight,
  CheckCircle2,
  Calendar,
  MessageSquare,
  Package,
  TrendingUp,
  Clock,
  ArrowUpRight
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { getDashboardStats } from '../services/api';
import MerchantActionCenter from '../components/MerchantActionCenter';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState('all');
  const navigate = useNavigate();

  const fetchStats = async (range = dateRange) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getDashboardStats({ date_range: range });
      setStats(res.data);
    } catch (err) {
      console.error('Failed to load dashboard metrics:', err);
      setError('Unable to fetch live merchant metrics from database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats(dateRange);
  }, [dateRange]);

  const totalRevenue = stats?.total_revenue ?? 0;
  const totalCogs = stats?.total_cogs ?? 0;
  const grossProfit = stats?.gross_profit ?? 0;
  const grossMarginPct = stats?.gross_profit_margin_pct ?? 0;
  const totalOrders = stats?.total_orders ?? 0;
  const aov = stats?.average_order_value ?? (totalOrders > 0 ? totalRevenue / totalOrders : 0);
  const activeProducts = stats?.active_products ?? 0;
  const lowStockCount = stats?.low_stock_count ?? 0;
  const outOfStockCount = stats?.out_of_stock_count ?? 0;
  const attentionCount = lowStockCount + outOfStockCount;
  const trendData = stats?.revenue_trend || [];
  const topProducts = stats?.top_selling_products || [];
  const lowStockItems = stats?.low_stock_products || [];
  const recentOrders = stats?.recent_orders || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[#DEE3DC]">
        <div>
          <h1 className="text-2xl sm:text-[28px] font-bold text-[#202923] tracking-tight">
            Business overview
          </h1>
          <p className="text-sm text-[#6B746E] mt-0.5">
            Real database analytics, inventory health, and AI copilot actions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Date Range Selector Pills */}
          <div className="flex items-center gap-1 bg-[#EAEDE7] p-1 rounded-lg">
            {[
              { id: 'today', label: 'Today' },
              { id: '7d', label: '7 Days' },
              { id: '30d', label: '30 Days' },
              { id: 'all', label: 'All Time' },
            ].map((pill) => (
              <button
                key={pill.id}
                onClick={() => setDateRange(pill.id)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                  dateRange === pill.id
                    ? 'bg-[#234E42] text-white shadow-xs'
                    : 'text-[#202923] hover:bg-[#DEE3DC]'
                }`}
              >
                {pill.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => fetchStats(dateRange)}
            disabled={loading}
            className="px-3 py-1.5 rounded-md bg-white hover:bg-[#F6F5F1] border border-[#DEE3DC] text-[#202923] text-xs font-medium flex items-center gap-1.5 transition-colors shadow-xs disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#6B746E] ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <Link
            to="/sales"
            className="px-3 py-1.5 rounded-md bg-white hover:bg-[#F6F5F1] border border-[#DEE3DC] text-[#202923] font-medium text-xs transition-colors shadow-xs flex items-center gap-1.5"
          >
            <ShoppingCart className="w-3.5 h-3.5 text-[#234E42]" />
            <span>New Sale</span>
          </Link>

          <Link
            to="/copilot"
            className="px-3.5 py-1.5 rounded-md bg-[#234E42] hover:bg-[#1B3D34] text-white font-medium text-xs transition-colors shadow-xs flex items-center gap-1.5"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Business Copilot</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-lg bg-[#FBEFEF] border border-[#B94A48]/30 text-xs text-[#B94A48] flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 5 Compact KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Revenue */}
        <div className="surface-card p-4 space-y-1">
          <div className="flex items-center justify-between text-[#6B746E] text-xs">
            <span className="font-medium">Total Revenue</span>
            <DollarSign className="w-4 h-4 text-[#234E42]" />
          </div>
          <p className="text-2xl font-bold text-[#202923] tracking-tight">
            {loading ? '...' : `₹${totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
          </p>
          <p className="text-[12px] text-[#6B746E]">
            Settled customer orders
          </p>
        </div>

        {/* Gross Profit */}
        <div className="surface-card p-4 space-y-1 border-l-4 border-l-[#234E42]">
          <div className="flex items-center justify-between text-[#6B746E] text-xs">
            <span className="font-medium">Gross Profit</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#E4ECE7] text-[#234E42]">
              {grossMarginPct}% margin
            </span>
          </div>
          <p className="text-2xl font-bold text-[#234E42] tracking-tight">
            {loading ? '...' : `₹${grossProfit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
          </p>
          <p className="text-[12px] text-[#6B746E]">
            Revenue minus COGS (₹{totalCogs.toLocaleString('en-IN')})
          </p>
        </div>

        {/* Orders */}
        <div className="surface-card p-4 space-y-1">
          <div className="flex items-center justify-between text-[#6B746E] text-xs">
            <span className="font-medium">Orders</span>
            <ShoppingCart className="w-4 h-4 text-[#234E42]" />
          </div>
          <p className="text-2xl font-bold text-[#202923] tracking-tight">
            {loading ? '...' : totalOrders}
          </p>
          <p className="text-[12px] text-[#6B746E]">
            Completed transactions
          </p>
        </div>

        {/* Average Order Value */}
        <div className="surface-card p-4 space-y-1">
          <div className="flex items-center justify-between text-[#6B746E] text-xs">
            <span className="font-medium">Average order value</span>
            <TrendingUp className="w-4 h-4 text-[#234E42]" />
          </div>
          <p className="text-2xl font-bold text-[#202923] tracking-tight">
            {loading ? '...' : `₹${aov.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
          </p>
          <p className="text-[12px] text-[#6B746E]">
            Revenue per order
          </p>
        </div>

        {/* Products Requiring Attention */}
        <div className="surface-card p-4 space-y-1">
          <div className="flex items-center justify-between text-[#6B746E] text-xs">
            <span className="font-medium">Stock attention</span>
            <AlertTriangle className={`w-4 h-4 ${attentionCount > 0 ? 'text-[#B77932]' : 'text-[#347A52]'}`} />
          </div>
          <p className={`text-2xl font-bold tracking-tight ${attentionCount > 0 ? 'text-[#B77932]' : 'text-[#202923]'}`}>
            {loading ? '...' : attentionCount}
          </p>
          <p className="text-[12px] text-[#6B746E]">
            {outOfStockCount > 0 ? `${outOfStockCount} out of stock, ${lowStockCount} low` : 'All inventory healthy'}
          </p>
        </div>
      </div>

      {/* Zero Orders Guidance Banner */}
      {totalOrders === 0 && !loading && (
        <div className="p-4 rounded-xl bg-[#EBF2EE] border border-[#B8D4C4] text-[#202923] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-[#234E42] mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-[#202923]">Ready to record your first transactions</p>
              <p className="text-xs text-[#6B746E] mt-0.5">
                Your store currently has 0 recorded orders. Record an in-store counter sale, import past sales via CSV, or test online checkout to populate live analytics and gross profit.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link
              to="/sales"
              className="px-3 py-1.5 rounded-md bg-[#234E42] text-white text-xs font-medium hover:bg-[#1B3D34] transition-colors"
            >
              Record In-Store Sale
            </Link>
            <Link
              to="/import"
              className="px-3 py-1.5 rounded-md bg-white border border-[#DEE3DC] text-[#202923] text-xs font-medium hover:bg-[#F6F5F1] transition-colors"
            >
              Import CSV
            </Link>
          </div>
        </div>
      )}

      {/* Revenue Performance Chart */}
      <div className="surface-card p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#DEE3DC] pb-3">
          <div>
            <h2 className="text-base font-semibold text-[#202923]">Revenue performance</h2>
            <p className="text-xs text-[#6B746E]">Daily settled order revenue across the last 7 days.</p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[#6B746E]">
            <Calendar className="w-3.5 h-3.5 text-[#234E42]" />
            <span className="font-medium text-[#202923]">Trailing 7 days</span>
          </div>
        </div>

        <div className="h-64 w-full">
          {loading ? (
            <div className="h-full flex items-center justify-center text-xs text-[#6B746E]">
              Loading chart data...
            </div>
          ) : trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="forestGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#234E42" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#234E42" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8ECE6" vertical={false} />
                <XAxis
                  dataKey="day"
                  stroke="#6B746E"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#DEE3DC' }}
                />
                <YAxis
                  stroke="#6B746E"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#DEE3DC',
                    borderRadius: '8px',
                    color: '#202923',
                    fontSize: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.06)'
                  }}
                  formatter={(val) => [`₹${val.toLocaleString('en-IN')}`, 'Revenue']}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#234E42"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#forestGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-[#6B746E]">
              No paid orders in this window yet.
            </div>
          )}
        </div>
      </div>

      {/* Recommended Actions (Action Center Module) */}
      <MerchantActionCenter onActionExecuted={fetchStats} />

      {/* Two Column Grid: Products Requiring Attention & Best-Selling Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Products Requiring Attention */}
        <div className="surface-card p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-[#DEE3DC] pb-2.5">
            <div>
              <h2 className="text-base font-semibold text-[#202923]">Products requiring attention</h2>
              <p className="text-xs text-[#6B746E]">Items at or below safety reorder thresholds.</p>
            </div>
            <Link
              to="/inventory"
              className="text-xs font-medium text-[#234E42] hover:underline flex items-center gap-1"
            >
              <span>Manage inventory</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="divide-y divide-[#DEE3DC]">
            {lowStockItems.length > 0 ? (
              lowStockItems.slice(0, 5).map((item) => (
                <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-medium text-[#202923]">{item.name}</p>
                    <p className="text-[11px] text-[#6B746E] font-mono">
                      Category: {item.category} • Threshold: {item.low_stock_threshold}
                    </p>
                  </div>
                  <div className="text-right flex items-center gap-2.5">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                      item.stock <= 0
                        ? 'bg-[#FBEFEF] text-[#B94A48] border border-[#B94A48]/20'
                        : 'bg-[#FDF4EB] text-[#B77932] border border-[#B77932]/20'
                    }`}>
                      {item.stock <= 0 ? 'Out of stock' : `${item.stock} left`}
                    </span>
                    <Link
                      to="/inventory"
                      className="text-xs font-medium text-[#234E42] hover:underline"
                    >
                      Restock
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-6 text-center space-y-1">
                <CheckCircle2 className="w-6 h-6 text-[#347A52] mx-auto opacity-80" />
                <p className="text-xs font-medium text-[#202923]">Inventory is healthy</p>
                <p className="text-[11px] text-[#6B746E]">All active products exceed safety thresholds.</p>
              </div>
            )}
          </div>
        </div>

        {/* Best-Selling Products */}
        <div className="surface-card p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-[#DEE3DC] pb-2.5">
            <div>
              <h2 className="text-base font-semibold text-[#202923]">Best-selling products</h2>
              <p className="text-xs text-[#6B746E]">Top performers by units sold and revenue.</p>
            </div>
            <Link
              to="/analytics"
              className="text-xs font-medium text-[#234E42] hover:underline flex items-center gap-1"
            >
              <span>View analytics</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="divide-y divide-[#DEE3DC]">
            {topProducts.length > 0 ? (
              topProducts.slice(0, 5).map((p, idx) => (
                <div key={p.product_id || idx} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded bg-[#F6F5F1] text-[#6B746E] font-medium text-[11px] flex items-center justify-center border border-[#DEE3DC]">
                      {idx + 1}
                    </span>
                    <div>
                      <p className="font-medium text-[#202923]">{p.name}</p>
                      <p className="text-[11px] text-[#6B746E] font-mono">{p.units_sold} units sold</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-semibold text-[#202923]">
                      ₹{p.total_revenue?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-[#6B746E] py-6 text-center">No product sales recorded yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="surface-card p-5 space-y-3">
        <div className="flex items-center justify-between border-b border-[#DEE3DC] pb-2.5">
          <div>
            <h2 className="text-base font-semibold text-[#202923]">Recent orders</h2>
            <p className="text-xs text-[#6B746E]">Latest completed customer orders and payments.</p>
          </div>
          <Link
            to="/orders"
            className="text-xs font-medium text-[#234E42] hover:underline flex items-center gap-1"
          >
            <span>All orders</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F6F5F1] text-[#6B746E] font-medium border-b border-[#DEE3DC]">
              <tr>
                <th className="py-2.5 px-3">Order ID</th>
                <th className="py-2.5 px-3">Customer</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Amount</th>
                <th className="py-2.5 px-3">Payment</th>
                <th className="py-2.5 px-3">Fulfillment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DEE3DC]">
              {recentOrders.length > 0 ? (
                recentOrders.slice(0, 5).map((order) => (
                  <tr key={order.id} className="hover:bg-[#F6F5F1]/60 transition-colors">
                    <td className="py-2.5 px-3 font-mono text-[#234E42] font-medium">
                      {order.id?.slice(0, 16)}...
                    </td>
                    <td className="py-2.5 px-3 text-[#202923]">
                      {order.customer_name || 'Store Customer'}
                    </td>
                    <td className="py-2.5 px-3 text-[#6B746E]">
                      {order.created_at ? new Date(order.created_at).toLocaleDateString('en-IN') : 'Recent'}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-[#202923]">
                      ₹{(order.amount ?? order.final_amount ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                        order.status === 'PAID'
                          ? 'bg-[#EAF4EE] text-[#347A52] border border-[#B8D4C4]'
                          : 'bg-[#FDF4EB] text-[#B77932]'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-[#6B746E]">
                      {order.fulfillment_status || 'UNFULFILLED'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-[#6B746E]">
                    No recent orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
