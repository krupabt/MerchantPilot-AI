import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingCart,
  PlusCircle,
  AlertTriangle,
  RefreshCw,
  ArrowRight,
  TrendingUp,
  Package,
  Calendar,
  MessageSquare,
  Boxes,
  Activity,
  ArrowUpRight,
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
  // Default date filter is 'today' as required by Task 5
  const [dateRange, setDateRange] = useState('today');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
  const transactionsCount = stats?.completed_orders ?? stats?.total_orders ?? 0;
  const aov = stats?.average_order_value ?? (transactionsCount > 0 ? totalRevenue / transactionsCount : 0);
  const lowStockCount = stats?.low_stock_count ?? 0;
  const outOfStockCount = stats?.out_of_stock_count ?? 0;
  const trendData = stats?.revenue_trend || [];
  const topProducts = stats?.top_selling_products || [];
  const lowStockItems = stats?.low_stock_products || [];
  const recentOrders = stats?.recent_orders || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[#E5E5E5]">
        <div>
          <h1 className="text-2xl sm:text-[28px] font-bold text-[#222222] tracking-tight">
            Overview
          </h1>
          <p className="text-xs sm:text-sm text-[#71717A] mt-0.5">
            Store performance, inventory health, and recent sales.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Single Date Filter (TASK 5): Today | Last 7 days | Last 30 days | All time */}
          <div className="flex items-center gap-1 bg-[#F7F7F5] border border-[#E5E5E5] p-1 rounded-lg">
            {[
              { id: 'today', label: 'Today' },
              { id: '7d', label: 'Last 7 days' },
              { id: '30d', label: 'Last 30 days' },
              { id: 'all', label: 'All time' },
            ].map((pill) => (
              <button
                key={pill.id}
                onClick={() => setDateRange(pill.id)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                  dateRange === pill.id
                    ? 'bg-[#C65D3B] text-white shadow-xs font-semibold'
                    : 'text-[#71717A] hover:text-[#222222] hover:bg-white'
                }`}
              >
                {pill.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => fetchStats(dateRange)}
            disabled={loading}
            className="px-3 py-1.5 rounded-lg bg-white hover:bg-[#F7F7F5] border border-[#E5E5E5] text-[#222222] text-xs font-medium flex items-center gap-1.5 transition shadow-xs disabled:opacity-50"
            title="Refresh metrics"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#71717A] ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          {/* New Sale Button (TASK 6) */}
          <Link
            to="/sales"
            className="px-3.5 py-1.5 rounded-lg bg-[#C65D3B] hover:bg-[#b04f30] text-white font-semibold text-xs transition shadow-xs flex items-center gap-1.5"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>New Sale</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-lg bg-[#FDF2F2] border border-[#C24141]/30 text-xs text-[#C24141] flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 5 KPI Cards with Natural Labels (TASK 5) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* 1. Sales */}
        <div className="surface-card p-4 space-y-1">
          <div className="flex items-center justify-between text-[#71717A] text-xs">
            <span className="font-medium">Sales</span>
            <TrendingUp className="w-4 h-4 text-[#C65D3B]" />
          </div>
          <p className="text-2xl font-bold text-[#222222] tracking-tight">
            {loading ? '...' : formatINR(totalRevenue)}
          </p>
          <p className="text-[11px] text-[#71717A]">
            Confirmed sales
          </p>
        </div>

        {/* 2. Gross profit */}
        <div className="surface-card p-4 space-y-1 border-l-4 border-l-[#C65D3B]">
          <div className="flex items-center justify-between text-[#71717A] text-xs">
            <span className="font-medium">Gross profit</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#FAF5F2] text-[#C65D3B] border border-[#F0D5CB]">
              {grossMarginPct}% margin
            </span>
          </div>
          <p className="text-2xl font-bold text-[#C65D3B] tracking-tight">
            {loading ? '...' : formatINR(grossProfit)}
          </p>
          <p className="text-[11px] text-[#71717A]">
            Sales minus COGS ({formatINR(totalCogs)})
          </p>
        </div>

        {/* 3. Transactions */}
        <div className="surface-card p-4 space-y-1">
          <div className="flex items-center justify-between text-[#71717A] text-xs">
            <span className="font-medium">Transactions</span>
            <ShoppingCart className="w-4 h-4 text-[#71717A]" />
          </div>
          <p className="text-2xl font-bold text-[#222222] tracking-tight">
            {loading ? '...' : transactionsCount}
          </p>
          <p className="text-[11px] text-[#71717A]">
            Eligible settled sales
          </p>
        </div>

        {/* 4. Average bill */}
        <div className="surface-card p-4 space-y-1">
          <div className="flex items-center justify-between text-[#71717A] text-xs">
            <span className="font-medium">Average bill</span>
            <Package className="w-4 h-4 text-[#71717A]" />
          </div>
          <p className="text-2xl font-bold text-[#222222] tracking-tight">
            {loading ? '...' : formatINR(aov)}
          </p>
          <p className="text-[11px] text-[#71717A]">
            Revenue per transaction
          </p>
        </div>

        {/* 5. Low stock */}
        <div className="surface-card p-4 space-y-1">
          <div className="flex items-center justify-between text-[#71717A] text-xs">
            <span className="font-medium">Low stock</span>
            <AlertTriangle className={`w-4 h-4 ${lowStockCount > 0 ? 'text-[#B7791F]' : 'text-[#39805A]'}`} />
          </div>
          <p className={`text-2xl font-bold tracking-tight ${lowStockCount > 0 ? 'text-[#B7791F]' : 'text-[#222222]'}`}>
            {loading ? '...' : lowStockCount}
          </p>
          <p className="text-[11px] text-[#71717A]">
            {lowStockCount > 0 ? `${lowStockCount} items need reordering` : 'All items in stock'}
          </p>
        </div>
      </div>

      {/* Main Grid: Revenue Trend Chart + Low Stock Alert Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Revenue Performance Chart */}
        <div className="lg:col-span-2 surface-card p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-3">
            <div>
              <h2 className="text-sm font-semibold text-[#222222]">Sales Trend</h2>
              <p className="text-xs text-[#71717A]">Daily confirmed sales volume across the selected period.</p>
            </div>
            <span className="text-[11px] font-medium text-[#71717A] bg-[#F7F7F5] px-2 py-0.5 rounded border border-[#E5E5E5]">
              {dateRange === 'today' ? 'Today' : dateRange === '7d' ? 'Last 7 days' : dateRange === '30d' ? 'Last 30 days' : 'All time'}
            </span>
          </div>

          <div className="h-64 w-full">
            {loading ? (
              <div className="h-full flex items-center justify-center text-xs text-[#71717A]">
                Loading sales trend...
              </div>
            ) : trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="terracottaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#C65D3B" stopOpacity={0.18} />
                      <stop offset="95%" stopColor="#C65D3B" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EFEFEF" vertical={false} />
                  <XAxis
                    dataKey="day"
                    stroke="#71717A"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#E5E5E5' }}
                  />
                  <YAxis
                    stroke="#71717A"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#E5E5E5' }}
                    tickFormatter={(val) => `₹${val}`}
                  />
                  <Tooltip
                    formatter={(value) => [formatINR(value), 'Sales']}
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderColor: '#E5E5E5',
                      borderRadius: '8px',
                      fontSize: '12px',
                      color: '#222222',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.06)'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#C65D3B"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#terracottaGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-[#71717A]">
                No transaction data available for this range.
              </div>
            )}
          </div>
        </div>

        {/* Low Stock Alerts & Fast Action Panel */}
        <div className="surface-card p-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-3">
              <h2 className="text-sm font-semibold text-[#222222]">Low Stock Attention</h2>
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                lowStockCount > 0 ? 'bg-[#FEF9EE] text-[#B7791F] border border-[#B7791F]/30' : 'bg-[#EEF7F2] text-[#39805A]'
              }`}>
                {lowStockCount} items
              </span>
            </div>

            <div className="divide-y divide-[#E5E5E5] mt-2">
              {lowStockItems.length > 0 ? (
                lowStockItems.map((item) => (
                  <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-semibold text-[#222222]">{item.name}</p>
                      <p className="text-[11px] text-[#71717A]">Category: {item.category}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-[#C24141]">{item.stock} left</span>
                      <p className="text-[10px] text-[#71717A]">Threshold: {item.low_stock_threshold}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-xs text-[#71717A]">
                  <CheckCircle2 className="w-6 h-6 text-[#39805A] mx-auto mb-1.5" />
                  <p className="font-medium text-[#222222]">All stock levels healthy</p>
                  <p className="text-[11px] mt-0.5">No products currently below reorder thresholds.</p>
                </div>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-[#E5E5E5] space-y-2">
            <Link
              to="/inventory"
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-[#222222] bg-[#F7F7F5] hover:bg-[#EFEFEF] border border-[#E5E5E5] transition"
            >
              <span>Manage Inventory</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#71717A]" />
            </Link>
            <Link
              to="/copilot"
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-white bg-[#C65D3B] hover:bg-[#b04f30] transition shadow-xs"
            >
              <div className="flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Ask AI Assistant</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Secondary Row: Top Selling Products & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Top Selling Products */}
        <div className="surface-card p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-3">
            <h2 className="text-sm font-semibold text-[#222222]">Top Selling Products</h2>
            <Link to="/catalog" className="text-xs text-[#C65D3B] hover:underline font-medium">
              View catalog →
            </Link>
          </div>

          <div className="divide-y divide-[#E5E5E5]">
            {topProducts.length > 0 ? (
              topProducts.slice(0, 5).map((prod) => (
                <div key={prod.product_id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-semibold text-[#222222]">{prod.name}</p>
                    <p className="text-[11px] text-[#71717A]">
                      {prod.units_sold} units sold • {prod.category}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[#222222]">{formatINR(prod.total_revenue)}</p>
                    <p className="text-[11px] text-[#71717A]">Stock: {prod.current_stock}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-6 text-center text-xs text-[#71717A]">
                No sales recorded in this period.
              </div>
            )}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="surface-card p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-3">
            <h2 className="text-sm font-semibold text-[#222222]">Recent Transactions</h2>
            <Link to="/orders" className="text-xs text-[#C65D3B] hover:underline font-medium">
              All orders →
            </Link>
          </div>

          <div className="divide-y divide-[#E5E5E5]">
            {recentOrders.length > 0 ? (
              recentOrders.slice(0, 5).map((ord) => (
                <div key={ord.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[#222222]">
                        {ord.customer_name || 'Walk-in Customer'}
                      </span>
                      <span className="text-[10px] bg-[#EEF7F2] text-[#39805A] px-1.5 py-0.2 rounded font-medium">
                        PAID
                      </span>
                    </div>
                    <p className="text-[11px] text-[#71717A] mt-0.5">
                      {ord.id} • {ord.items_count} item{ord.items_count > 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[#222222]">{formatINR(ord.final_amount)}</p>
                    <p className="text-[10px] text-[#71717A]">
                      {new Date(ord.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-6 text-center text-xs text-[#71717A]">
                No transactions recorded yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
