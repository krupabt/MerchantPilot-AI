import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Calendar,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  PieChart as PieChartIcon,
  Percent,
  Info,
  MessageSquare
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { getDashboardStats, getSalesPeriodComparison } from '../services/api';

const PIE_COLORS = ['#C65D3B', '#347A52', '#F0D5CB', '#71717A', '#4D6B5E', '#A0AF9F'];

export default function RevenueAnalytics() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [periodDays, setPeriodDays] = useState(7);
  const [periodComparison, setPeriodComparison] = useState(null);
  const [loadingComparison, setLoadingComparison] = useState(false);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await getDashboardStats();
      setStats(res.data);
    } catch (err) {
      console.error('Failed to load revenue analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchComparison = async (days) => {
    setLoadingComparison(true);
    try {
      const res = await getSalesPeriodComparison(days);
      setPeriodComparison(res.data);
    } catch (err) {
      console.error('Failed to load period comparison:', err);
    } finally {
      setLoadingComparison(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    fetchComparison(periodDays);
  }, []);

  const handlePeriodChange = (days) => {
    setPeriodDays(days);
    fetchComparison(days);
  };

  const trendData = stats?.revenue_trend || [];
  const topProducts = stats?.top_selling_products || [];
  const revInsights = stats?.revenue_insights || {};
  const categoryData = Object.entries(revInsights.category_breakdown || {}).map(([name, value]) => ({
    name,
    value: Math.round(value)
  }));

  const totalRevenue = stats?.total_revenue ?? revInsights.total_revenue ?? 0;
  const totalOrders = stats?.total_orders ?? revInsights.total_orders ?? 0;
  const aov = stats?.average_order_value ?? (totalOrders > 0 ? totalRevenue / totalOrders : 0);
  const discountsGranted = revInsights.total_discounts || 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E5E5E5]">
        <div>
          <h1 className="text-2xl sm:text-[28px] font-bold text-[#222222] tracking-tight">
            Sales analytics
          </h1>
          <p className="text-sm text-[#71717A] mt-0.5">
            Financial reporting, sequential period deltas, and category distribution.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchAnalytics}
            disabled={loading}
            className="px-3 py-1.5 rounded-md bg-white hover:bg-[#F7F7F5] border border-[#E5E5E5] text-[#222222] text-xs font-medium flex items-center gap-1.5 transition-colors shadow-xs disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#71717A] ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <Link
            to="/merchant/assistant"
            state={{ prefilledQuery: 'Compare our sales performance over the last 7 days' }}
            className="px-3.5 py-1.5 rounded-md bg-[#252525] hover:bg-[#3a3a3a] text-white font-medium text-xs transition-colors shadow-xs flex items-center gap-1.5"
          >
            <MessageSquare className="w-3.5 h-3.5 text-[#B85C40]" />
            <span>Ask Copilot</span>
          </Link>
        </div>
      </div>

      {/* 4 Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="surface-card p-4 space-y-1">
          <span className="text-xs font-medium text-[#71717A]">Total settled revenue</span>
          <p className="text-2xl font-bold text-[#222222] tracking-tight">
            {loading ? '...' : `₹${totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
          </p>
          <p className="text-[12px] text-[#71717A]">
            Verified ledger transactions
          </p>
        </div>

        <div className="surface-card p-4 space-y-1">
          <span className="text-xs font-medium text-[#71717A]">Completed orders</span>
          <p className="text-2xl font-bold text-[#222222] tracking-tight">
            {loading ? '...' : totalOrders}
          </p>
          <p className="text-[12px] text-[#71717A]">
            Store & shopping assistant checkouts
          </p>
        </div>

        <div className="surface-card p-4 space-y-1">
          <span className="text-xs font-medium text-[#71717A]">Average order value</span>
          <p className="text-2xl font-bold text-[#222222] tracking-tight">
            {loading ? '...' : `₹${aov.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
          </p>
          <p className="text-[12px] text-[#71717A]">
            Basket-weighted average
          </p>
        </div>

        <div className="surface-card p-4 space-y-1">
          <span className="text-xs font-medium text-[#71717A]">Promotional discounts</span>
          <p className="text-2xl font-bold text-[#347A52] tracking-tight">
            {loading ? '...' : `₹${discountsGranted.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
          </p>
          <p className="text-[12px] text-[#71717A]">
            Policy compliant (≤ 10% ceiling)
          </p>
        </div>
      </div>

      {/* Period-over-Period Performance Intelligence */}
      <div className="surface-card p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5E5E5] pb-3">
          <div>
            <h2 className="text-base font-semibold text-[#222222]">Period-over-period sales performance</h2>
            <p className="text-xs text-[#71717A]">
              Current {periodDays} days vs previous {periodDays} days. Empirical statistical deltas from database records.
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-[#F7F7F5] p-1 rounded-md border border-[#E5E5E5]">
            <button
              onClick={() => handlePeriodChange(7)}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                periodDays === 7
                  ? 'bg-white text-[#C65D3B] font-semibold shadow-xs'
                  : 'text-[#71717A] hover:text-[#222222]'
              }`}
            >
              7-Day window
            </button>
            <button
              onClick={() => handlePeriodChange(30)}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                periodDays === 30
                  ? 'bg-white text-[#C65D3B] font-semibold shadow-xs'
                  : 'text-[#71717A] hover:text-[#222222]'
              }`}
            >
              30-Day window
            </button>
          </div>
        </div>

        {loadingComparison ? (
          <div className="py-8 text-center text-xs text-[#71717A] flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-[#C65D3B]" />
            <span>Calculating period deltas...</span>
          </div>
        ) : periodComparison ? (
          <div className="space-y-4">
            {/* 3 Comparison Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Revenue Growth */}
              <div className="p-3.5 rounded-lg bg-[#F7F7F5] border border-[#E5E5E5] space-y-1.5">
                <span className="text-xs font-medium text-[#71717A]">Revenue shift</span>
                <div className="flex items-baseline justify-between">
                  <span className="text-xl font-bold text-[#222222]">
                    ₹{periodComparison.current_period?.revenue?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                  <span
                    className={`text-xs font-semibold flex items-center gap-0.5 px-2 py-0.5 rounded ${
                      (periodComparison.growth?.revenue_change_abs ?? 0) >= 0
                        ? 'bg-[#FAF5F2] text-[#347A52]'
                        : 'bg-[#FBEFEF] text-[#B94A48]'
                    }`}
                  >
                    {(periodComparison.growth?.revenue_change_abs ?? 0) >= 0 ? (
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    ) : (
                      <ArrowDownRight className="w-3.5 h-3.5" />
                    )}
                    {periodComparison.growth?.revenue_growth_pct > 0 ? '+' : ''}
                    {periodComparison.growth?.revenue_growth_pct}%
                  </span>
                </div>
                <div className="text-[11px] text-[#71717A] flex justify-between border-t border-[#E5E5E5] pt-1">
                  <span>Prev {periodDays}d: ₹{periodComparison.previous_period?.revenue?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  <span className="font-medium text-[#222222]">
                    {periodComparison.growth?.revenue_change_abs >= 0 ? '+' : ''}
                    ₹{periodComparison.growth?.revenue_change_abs?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Order Volume Shift */}
              <div className="p-3.5 rounded-lg bg-[#F7F7F5] border border-[#E5E5E5] space-y-1.5">
                <span className="text-xs font-medium text-[#71717A]">Order volume</span>
                <div className="flex items-baseline justify-between">
                  <span className="text-xl font-bold text-[#222222]">
                    {periodComparison.current_period?.orders_count} orders
                  </span>
                  <span
                    className={`text-xs font-semibold flex items-center gap-0.5 px-2 py-0.5 rounded ${
                      (periodComparison.growth?.orders_change_abs ?? 0) >= 0
                        ? 'bg-[#FAF5F2] text-[#347A52]'
                        : 'bg-[#FBEFEF] text-[#B94A48]'
                    }`}
                  >
                    {periodComparison.growth?.orders_growth_pct > 0 ? '+' : ''}
                    {periodComparison.growth?.orders_growth_pct}%
                  </span>
                </div>
                <div className="text-[11px] text-[#71717A] flex justify-between border-t border-[#E5E5E5] pt-1">
                  <span>Prev {periodDays}d: {periodComparison.previous_period?.orders_count} orders</span>
                  <span className="font-medium text-[#222222]">
                    {periodComparison.growth?.orders_change_abs >= 0 ? '+' : ''}
                    {periodComparison.growth?.orders_change_abs} orders
                  </span>
                </div>
              </div>

              {/* AOV Trajectory */}
              <div className="p-3.5 rounded-lg bg-[#F7F7F5] border border-[#E5E5E5] space-y-1.5">
                <span className="text-xs font-medium text-[#71717A]">Average order depth</span>
                <div className="flex items-baseline justify-between">
                  <span className="text-xl font-bold text-[#222222]">
                    ₹{periodComparison.current_period?.aov?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                  <span
                    className={`text-xs font-semibold flex items-center gap-0.5 px-2 py-0.5 rounded ${
                      (periodComparison.growth?.aov_change_abs ?? 0) >= 0
                        ? 'bg-[#FAF5F2] text-[#347A52]'
                        : 'bg-[#FBEFEF] text-[#B94A48]'
                    }`}
                  >
                    {periodComparison.growth?.aov_growth_pct > 0 ? '+' : ''}
                    {periodComparison.growth?.aov_growth_pct}%
                  </span>
                </div>
                <div className="text-[11px] text-[#71717A] flex justify-between border-t border-[#E5E5E5] pt-1">
                  <span>Prev {periodDays}d: ₹{periodComparison.previous_period?.aov?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  <span className="font-medium text-[#222222]">
                    {periodComparison.growth?.aov_change_abs >= 0 ? '+' : ''}
                    ₹{periodComparison.growth?.aov_change_abs?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>

            {/* Product Gainers & Decliners Matrix */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              {/* Gainers */}
              <div className="p-3.5 rounded-lg bg-[#F7F7F5] border border-[#E5E5E5] space-y-2">
                <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-1.5">
                  <span className="text-xs font-semibold text-[#347A52] flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5" />
                    Top growth drivers (gainers)
                  </span>
                  <span className="text-[11px] text-[#71717A]">vs previous period</span>
                </div>
                <div className="divide-y divide-[#E5E5E5]">
                  {(periodComparison.top_gainers || []).length > 0 ? (
                    periodComparison.top_gainers.map((g, i) => (
                      <div key={i} className="py-2 flex items-center justify-between text-xs">
                        <div>
                          <p className="font-medium text-[#222222]">{g.name}</p>
                          <p className="text-[11px] text-[#71717A]">+{g.units_change} units change</p>
                        </div>
                        <span className="font-semibold text-[#347A52]">
                          +₹{g.sales_change?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-[#71717A] py-2">No significant gainers in this window.</p>
                  )}
                </div>
              </div>

              {/* Decliners */}
              <div className="p-3.5 rounded-lg bg-[#F7F7F5] border border-[#E5E5E5] space-y-2">
                <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-1.5">
                  <span className="text-xs font-semibold text-[#B94A48] flex items-center gap-1.5">
                    <TrendingDown className="w-3.5 h-3.5" />
                    Top declining products (laggards)
                  </span>
                  <span className="text-[11px] text-[#71717A]">vs previous period</span>
                </div>
                <div className="divide-y divide-[#E5E5E5]">
                  {(periodComparison.top_decliners || []).length > 0 ? (
                    periodComparison.top_decliners.map((d, i) => (
                      <div key={i} className="py-2 flex items-center justify-between text-xs">
                        <div>
                          <p className="font-medium text-[#222222]">{d.name}</p>
                          <p className="text-[11px] text-[#71717A]">{d.units_change} units change</p>
                        </div>
                        <span className="font-semibold text-[#B94A48]">
                          -₹{Math.abs(d.sales_change || 0)?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-[#71717A] py-2">No significant decliners in this window.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Correlation vs Causation Advisory */}
            <div className="p-3 rounded-lg bg-white border border-[#E5E5E5] text-xs flex items-start gap-2.5">
              <Info className="w-4 h-4 text-[#C65D3B] shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-semibold text-[#222222] text-xs block">
                  Methodology & Causality Advisory
                </span>
                <p className="text-[#71717A] text-[12px] leading-relaxed">
                  {periodComparison.causality_note ||
                    'Observed sales deltas represent empirical correlations calculated directly from completed database transactions. External marketing campaigns or inventory stockouts may correlate with these numbers without being the sole proven cause.'}
                </p>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* 7-Day Revenue Velocity Chart */}
      <div className="surface-card p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E5E5E5] pb-3">
          <div>
            <h2 className="text-base font-semibold text-[#222222]">Daily sales trend</h2>
            <p className="text-xs text-[#71717A]">Daily completed order revenue across the trailing 7 days.</p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[#71717A]">
            <Calendar className="w-3.5 h-3.5 text-[#C65D3B]" />
            <span className="font-medium text-[#222222]">Trailing 7 days</span>
          </div>
        </div>

        <div className="h-64 w-full">
          {loading ? (
            <div className="h-full flex items-center justify-center text-xs text-[#71717A]">
              Loading chart data...
            </div>
          ) : trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevMuted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C65D3B" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#C65D3B" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8ECE6" vertical={false} />
                <XAxis dataKey="day" stroke="#71717A" fontSize={11} tickLine={false} axisLine={{ stroke: '#E5E5E5' }} />
                <YAxis
                  stroke="#71717A"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#E5E5E5',
                    borderRadius: '8px',
                    color: '#222222',
                    fontSize: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.06)'
                  }}
                  formatter={(val) => [`₹${val.toLocaleString('en-IN')}`, 'Settled Revenue']}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#C65D3B"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorRevMuted)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-[#71717A]">
              No paid transactions recorded in this period yet.
            </div>
          )}
        </div>
      </div>

      {/* Two Column Grid: Category Breakdown & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Contribution */}
        <div className="surface-card p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-2.5">
            <div>
              <h2 className="text-base font-semibold text-[#222222]">Category distribution</h2>
              <p className="text-xs text-[#71717A]">Revenue distribution across published departments.</p>
            </div>
            <PieChartIcon className="w-4 h-4 text-[#C65D3B]" />
          </div>

          <div className="h-64 w-full">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderColor: '#E5E5E5',
                      borderRadius: '8px',
                      color: '#222222',
                      fontSize: '12px'
                    }}
                    formatter={(val) => [`₹${val.toLocaleString('en-IN')}`, 'Revenue']}
                  />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    formatter={(val) => <span className="text-xs text-[#71717A]">{val}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-[#71717A]">
                Category distribution calculating...
              </div>
            )}
          </div>
        </div>

        {/* Best-Selling SKUs */}
        <div className="surface-card p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-2.5">
            <div>
              <h2 className="text-base font-semibold text-[#222222]">Best-selling products</h2>
              <p className="text-xs text-[#71717A]">Ranked by total units sold across paid transactions.</p>
            </div>
            <TrendingUp className="w-4 h-4 text-[#347A52]" />
          </div>

          <div className="divide-y divide-[#E5E5E5]">
            {topProducts.length > 0 ? (
              topProducts.slice(0, 5).map((p, idx) => (
                <div key={p.product_id || idx} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded bg-[#F7F7F5] text-[#71717A] font-medium text-[11px] flex items-center justify-center border border-[#E5E5E5]">
                      {idx + 1}
                    </span>
                    <div>
                      <p className="font-medium text-[#222222]">{p.name}</p>
                      <p className="text-[11px] text-[#71717A] font-mono">
                        {p.category} • {p.units_sold} units sold
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-[#222222]">₹{p.total_revenue?.toLocaleString('en-IN')}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-[#71717A] py-6 text-center">No product sales recorded yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
