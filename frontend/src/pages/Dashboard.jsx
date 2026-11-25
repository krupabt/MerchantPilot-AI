import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingCart,
  PlusCircle,
  AlertTriangle,
  RefreshCw,
  ArrowRight,
  TrendingUp,
  Package,
  MessageSquare,
  CheckCircle2
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

function formatINR(val) {
  if (val === null || val === undefined) return '₹0';
  const num = Math.round(Number(val));
  return '₹' + num.toLocaleString('en-IN');
}

export default function Dashboard() {
  // Default date filter set to '7d' so live demo orders are immediately active & visible
  const [dateRange, setDateRange] = useState('7d');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
  const transactionsCount = stats?.completed_orders ?? stats?.total_orders ?? 0;
  const aov = stats?.average_order_value ?? (transactionsCount > 0 ? totalRevenue / transactionsCount : 0);
  const lowStockCount = stats?.low_stock_count ?? 0;
  const trendData = stats?.revenue_trend || [];
  const topProducts = stats?.top_selling_products || [];
  const lowStockItems = stats?.low_stock_products || [];
  const recentOrders = stats?.recent_orders || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-[#E8E2DA]">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[#242424] tracking-tight">
            Overview
          </h1>
          <p className="text-xs sm:text-sm text-[#6B6560] mt-1">
            Here's how your store is performing.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Date Filter: Today | Last 7 days | Last 30 days | All time */}
          <div className="flex items-center gap-1 bg-[#F8F4EE] border border-[#E8E2DA] p-1 rounded-xl">
            {[
              { id: 'today', label: 'Today' },
              { id: '7d', label: 'Last 7 days' },
              { id: '30d', label: 'Last 30 days' },
              { id: 'all', label: 'All time' },
            ].map((pill) => (
              <button
                key={pill.id}
                onClick={() => setDateRange(pill.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  dateRange === pill.id
                    ? 'bg-[#783F45] text-white shadow-sm'
                    : 'text-[#6B6560] hover:text-[#242424] hover:bg-white'
                }`}
              >
                {pill.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => fetchStats(dateRange)}
            disabled={loading}
            className="px-3 py-2 rounded-xl bg-white hover:bg-[#F8F4EE] border border-[#E8E2DA] text-[#242424] text-xs font-semibold flex items-center gap-1.5 transition shadow-sm disabled:opacity-50"
            title="Refresh metrics"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#6B6560] ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          {/* New Sale Button */}
          <Link
            to="/merchant/sales"
            className="px-4 py-2 rounded-xl bg-[#783F45] hover:bg-[#603137] text-white font-semibold text-xs transition shadow-sm flex items-center gap-1.5"
          >
            <PlusCircle className="w-3.5 h-3.5 text-[#D8C3A5]" />
            <span>New Sale</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-[#B84040] flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 5 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* 1. Sales */}
        <div className="bg-white border border-[#E8E2DA] rounded-2xl p-5 space-y-1.5 shadow-sm hover:border-[#D8C3A5] transition">
          <div className="flex items-center justify-between text-[#6B6560] text-xs font-medium">
            <span>Sales</span>
            <TrendingUp className="w-4 h-4 text-[#783F45]" />
          </div>
          <p className="font-heading text-2xl font-bold text-[#242424] tracking-tight tabular-numbers">
            {loading ? '...' : formatINR(totalRevenue)}
          </p>
          <p className="text-[11px] text-[#6B6560]">
            Confirmed store revenue
          </p>
        </div>

        {/* 2. Gross profit */}
        <div className="bg-white border border-[#E8E2DA] rounded-2xl p-5 space-y-1.5 shadow-sm border-l-4 border-l-[#783F45] hover:border-[#D8C3A5] transition">
          <div className="flex items-center justify-between text-[#6B6560] text-xs font-medium">
            <span>Gross profit</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F8F4EE] text-[#783F45] border border-[#E8E2DA]">
              {grossMarginPct}% margin
            </span>
          </div>
          <p className="font-heading text-2xl font-bold text-[#783F45] tracking-tight tabular-numbers">
            {loading ? '...' : formatINR(grossProfit)}
          </p>
          <p className="text-[11px] text-[#6B6560]">
            Revenue minus COGS ({formatINR(totalCogs)})
          </p>
        </div>

        {/* 3. Transactions */}
        <div className="bg-white border border-[#E8E2DA] rounded-2xl p-5 space-y-1.5 shadow-sm hover:border-[#D8C3A5] transition">
          <div className="flex items-center justify-between text-[#6B6560] text-xs font-medium">
            <span>Transactions</span>
            <ShoppingCart className="w-4 h-4 text-[#6B6560]" />
          </div>
          <p className="font-heading text-2xl font-bold text-[#242424] tracking-tight tabular-numbers">
            {loading ? '...' : transactionsCount}
          </p>
          <p className="text-[11px] text-[#6B6560]">
            Completed purchases
          </p>
        </div>

        {/* 4. Average bill */}
        <div className="bg-white border border-[#E8E2DA] rounded-2xl p-5 space-y-1.5 shadow-sm hover:border-[#D8C3A5] transition">
          <div className="flex items-center justify-between text-[#6B6560] text-xs font-medium">
            <span>Average bill</span>
            <Package className="w-4 h-4 text-[#6B6560]" />
          </div>
          <p className="font-heading text-2xl font-bold text-[#242424] tracking-tight tabular-numbers">
            {loading ? '...' : formatINR(aov)}
          </p>
          <p className="text-[11px] text-[#6B6560]">
            Revenue per ticket
          </p>
        </div>

        {/* 5. Low stock */}
        <div className="bg-white border border-[#E8E2DA] rounded-2xl p-5 space-y-1.5 shadow-sm hover:border-[#D8C3A5] transition">
          <div className="flex items-center justify-between text-[#6B6560] text-xs font-medium">
            <span>Low stock</span>
            <AlertTriangle className={`w-4 h-4 ${lowStockCount > 0 ? 'text-[#B77932]' : 'text-[#32734D]'}`} />
          </div>
          <p className={`font-heading text-2xl font-bold tracking-tight tabular-numbers ${lowStockCount > 0 ? 'text-[#B77932]' : 'text-[#242424]'}`}>
            {loading ? '...' : lowStockCount}
          </p>
          <p className="text-[11px] text-[#6B6560]">
            {lowStockCount > 0 ? `${lowStockCount} items need reordering` : 'Healthy inventory'}
          </p>
        </div>
      </div>

      {/* Main Grid: Revenue Trend Chart + Low Stock Alert Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Performance Chart */}
        <div className="lg:col-span-2 bg-white border border-[#E8E2DA] rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#E8E2DA] pb-3">
            <div>
              <h2 className="font-heading text-sm font-bold text-[#242424]">Sales Trend</h2>
              <p className="text-xs text-[#6B6560]">Daily confirmed sales volume across the selected period.</p>
            </div>
            <span className="text-[11px] font-semibold text-[#6B6560] bg-[#F8F4EE] px-2.5 py-1 rounded-full border border-[#E8E2DA]">
              {dateRange === 'today' ? 'Today' : dateRange === '7d' ? 'Last 7 days' : dateRange === '30d' ? 'Last 30 days' : 'All time'}
            </span>
          </div>

          <div className="h-64 w-full">
            {loading ? (
              <div className="h-full flex items-center justify-center text-xs text-[#6B6560] animate-pulse">
                Loading sales trend...
              </div>
            ) : trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="plumGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#783F45" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#783F45" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F8F4EE" vertical={false} />
                  <XAxis
                    dataKey="day"
                    stroke="#6B6560"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#E8E2DA' }}
                  />
                  <YAxis
                    stroke="#6B6560"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#E8E2DA' }}
                    tickFormatter={(val) => `₹${val}`}
                  />
                  <Tooltip
                    formatter={(value) => [formatINR(value), 'Sales']}
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderColor: '#E8E2DA',
                      borderRadius: '12px',
                      fontSize: '12px',
                      color: '#242424',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.06)'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#783F45"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#plumGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-[#6B6560]">
                No transaction data available for this range.
              </div>
            )}
          </div>
        </div>

        {/* Low Stock Alerts & Fast Action Panel */}
        <div className="bg-white border border-[#E8E2DA] rounded-2xl p-6 flex flex-col justify-between space-y-4 shadow-sm">
          <div>
            <div className="flex items-center justify-between border-b border-[#E8E2DA] pb-3">
              <h2 className="font-heading text-sm font-bold text-[#242424]">Stock Attention</h2>
              <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                lowStockCount > 0 ? 'bg-amber-50 text-[#B77932] border border-amber-200' : 'bg-emerald-50 text-[#32734D] border border-emerald-200'
              }`}>
                {lowStockCount} items
              </span>
            </div>

            <div className="divide-y divide-[#E8E2DA] mt-2">
              {lowStockItems.length > 0 ? (
                lowStockItems.map((item) => (
                  <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-semibold text-[#242424]">{item.name}</p>
                      <p className="text-[11px] text-[#6B6560]">{item.category}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-[#B84040] tabular-numbers">{item.stock} left</span>
                      <p className="text-[10px] text-[#6B6560]">Min: {item.low_stock_threshold}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-xs text-[#6B6560]">
                  <CheckCircle2 className="w-6 h-6 text-[#32734D] mx-auto mb-1.5" />
                  <p className="font-semibold text-[#242424]">All stock levels healthy</p>
                  <p className="text-[11px] mt-0.5">No products currently below safety thresholds.</p>
                </div>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-[#E8E2DA] space-y-2">
            <Link
              to="/merchant/inventory"
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#242424] bg-[#F8F4EE] hover:bg-[#E8E2DA] border border-[#E8E2DA] transition"
            >
              <span>Manage Inventory</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#6B6560]" />
            </Link>
            <Link
              to="/merchant/assistant"
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-white bg-[#783F45] hover:bg-[#603137] transition shadow-sm"
            >
              <div className="flex items-center gap-2">
                <MessageSquare className="w-3.5 h-3.5 text-[#D8C3A5]" />
                <span>Ask AI Copilot</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Secondary Row: Top Selling Products & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Selling Products */}
        <div className="bg-white border border-[#E8E2DA] rounded-2xl p-6 space-y-3.5 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#E8E2DA] pb-3">
            <h2 className="font-heading text-sm font-bold text-[#242424]">Top Selling Products</h2>
            <Link to="/merchant/products" className="text-xs text-[#783F45] hover:underline font-semibold">
              View catalog →
            </Link>
          </div>

          <div className="divide-y divide-[#E8E2DA]">
            {topProducts.length > 0 ? (
              topProducts.slice(0, 5).map((prod) => (
                <div key={prod.product_id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-semibold text-[#242424]">{prod.name}</p>
                    <p className="text-[11px] text-[#6B6560] tabular-numbers">
                      {prod.units_sold} units sold • {prod.category}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[#242424] tabular-numbers font-heading">{formatINR(prod.total_revenue)}</p>
                    <p className="text-[11px] text-[#6B6560] tabular-numbers">Stock: {prod.current_stock}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-6 text-center text-xs text-[#6B6560]">
                No sales recorded in this period.
              </div>
            )}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white border border-[#E8E2DA] rounded-2xl p-6 space-y-3.5 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#E8E2DA] pb-3">
            <h2 className="font-heading text-sm font-bold text-[#242424]">Recent Transactions</h2>
            <Link to="/merchant/orders" className="text-xs text-[#783F45] hover:underline font-semibold">
              All orders →
            </Link>
          </div>

          <div className="divide-y divide-[#E8E2DA]">
            {recentOrders.length > 0 ? (
              recentOrders.slice(0, 5).map((ord) => (
                <div key={ord.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[#242424]">
                        {ord.customer_name || 'Walk-in Customer'}
                      </span>
                      <span className="text-[10px] bg-emerald-50 text-[#32734D] border border-emerald-200 px-2 py-0.5 rounded-full font-semibold">
                        PAID
                      </span>
                    </div>
                    <p className="text-[11px] text-[#6B6560] mt-0.5">
                      {ord.id} • {ord.items_count} item{ord.items_count > 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[#242424] tabular-numbers font-heading">{formatINR(ord.final_amount)}</p>
                    <p className="text-[10px] text-[#6B6560]">
                      {new Date(ord.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-6 text-center text-xs text-[#6B6560]">
                No transactions recorded yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
