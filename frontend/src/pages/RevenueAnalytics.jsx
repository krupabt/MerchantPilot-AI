import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  TrendingDown,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  PieChart as PieChartIcon,
  Info,
  MessageSquare,
  Calendar
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

const PIE_COLORS = ['#783F45', '#32734D', '#D8C3A5', '#6B6560', '#B77932', '#603137'];

function formatINR(val) {
  if (val == null || isNaN(val)) return '₹0';
  const num = Number(val);
  return num % 1 === 0
    ? `₹${num.toLocaleString('en-IN')}`
    : `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

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
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E8E2DA]">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[#242424] tracking-tight">
            Sales Reports & Analytics
          </h1>
          <p className="text-xs sm:text-sm text-[#6B6560] mt-1">
            Financial reporting, period-over-period performance deltas, and category share.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchAnalytics}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-[#F8F4EE] border border-[#E8E2DA] text-[#242424] text-xs font-semibold flex items-center gap-1.5 transition shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#6B6560] ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <Link
            to="/merchant/assistant"
            state={{ prefilledQuery: 'Compare our sales performance over the last 7 days' }}
            className="px-4 py-2 rounded-xl bg-[#783F45] hover:bg-[#603137] text-white font-semibold text-xs transition shadow-sm flex items-center gap-1.5"
          >
            <MessageSquare className="w-3.5 h-3.5 text-[#D8C3A5]" />
            <span>Ask Copilot</span>
          </Link>
        </div>
      </div>

      {/* 4 Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E8E2DA] rounded-2xl p-5 space-y-1.5 shadow-sm hover:border-[#D8C3A5] transition">
          <span className="text-xs font-medium text-[#6B6560]">Total Settled Revenue</span>
          <p className="font-heading text-2xl font-bold text-[#242424] tracking-tight tabular-numbers">
            {loading ? '...' : formatINR(totalRevenue)}
          </p>
          <p className="text-[11px] text-[#6B6560]">
            Verified ledger transactions
          </p>
        </div>

        <div className="bg-white border border-[#E8E2DA] rounded-2xl p-5 space-y-1.5 shadow-sm hover:border-[#D8C3A5] transition">
          <span className="text-xs font-medium text-[#6B6560]">Completed Orders</span>
          <p className="font-heading text-2xl font-bold text-[#242424] tracking-tight tabular-numbers">
            {loading ? '...' : totalOrders}
          </p>
          <p className="text-[11px] text-[#6B6560]">
            Store & POS checkouts
          </p>
        </div>

        <div className="bg-white border border-[#E8E2DA] rounded-2xl p-5 space-y-1.5 shadow-sm hover:border-[#D8C3A5] transition">
          <span className="text-xs font-medium text-[#6B6560]">Average Order Value</span>
          <p className="font-heading text-2xl font-bold text-[#242424] tracking-tight tabular-numbers">
            {loading ? '...' : formatINR(aov)}
          </p>
          <p className="text-[11px] text-[#6B6560]">
            Basket-weighted average
          </p>
        </div>

        <div className="bg-white border border-[#E8E2DA] rounded-2xl p-5 space-y-1.5 shadow-sm hover:border-[#D8C3A5] transition">
          <span className="text-xs font-medium text-[#6B6560]">Promotional Discounts</span>
          <p className="font-heading text-2xl font-bold text-[#32734D] tracking-tight tabular-numbers">
            {loading ? '...' : formatINR(discountsGranted)}
          </p>
          <p className="text-[11px] text-[#6B6560]">
            Policy compliant (≤ 10% ceiling)
          </p>
        </div>
      </div>

      {/* Period-over-Period Performance Intelligence */}
      <div className="bg-white border border-[#E8E2DA] rounded-2xl p-6 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E8E2DA] pb-3">
          <div>
            <h2 className="font-heading text-base font-bold text-[#242424]">Period-Over-Period Sales Performance</h2>
            <p className="text-xs text-[#6B6560]">
              Current {periodDays} days vs previous {periodDays} days. Empirical statistical deltas from database records.
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-[#F8F4EE] p-1 rounded-xl border border-[#E8E2DA]">
            <button
              onClick={() => handlePeriodChange(7)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                periodDays === 7
                  ? 'bg-[#783F45] text-white shadow-sm'
                  : 'text-[#6B6560] hover:text-[#242424]'
              }`}
            >
              7-Day window
            </button>
            <button
              onClick={() => handlePeriodChange(30)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                periodDays === 30
                  ? 'bg-[#783F45] text-white shadow-sm'
                  : 'text-[#6B6560] hover:text-[#242424]'
              }`}
            >
              30-Day window
            </button>
          </div>
        </div>

        {loadingComparison ? (
          <div className="py-8 text-center text-xs text-[#6B6560] flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-[#783F45]" />
            <span>Calculating period deltas...</span>
          </div>
        ) : periodComparison ? (
          <div className="space-y-4">
            {/* 3 Comparison Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Revenue Growth */}
              <div className="p-4 rounded-xl bg-[#F8F4EE] border border-[#E8E2DA] space-y-1.5">
                <span className="text-xs font-medium text-[#6B6560]">Revenue Shift</span>
                <div className="flex items-baseline justify-between">
                  <span className="text-xl font-bold text-[#242424] tabular-numbers font-heading">
                    {formatINR(periodComparison.current_period?.revenue)}
                  </span>
                  <span
                    className={`text-xs font-bold flex items-center gap-0.5 px-2 py-0.5 rounded-full ${
                      (periodComparison.growth?.revenue_change_abs ?? 0) >= 0
                        ? 'bg-emerald-50 text-[#32734D] border border-emerald-200'
                        : 'bg-rose-50 text-[#B84040] border border-rose-200'
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
                <div className="text-[11px] text-[#6B6560] flex justify-between border-t border-[#E8E2DA] pt-1.5">
                  <span>Prev {periodDays}d: {formatINR(periodComparison.previous_period?.revenue)}</span>
                  <span className="font-semibold text-[#242424]">
                    {periodComparison.growth?.revenue_change_abs >= 0 ? '+' : ''}
                    {formatINR(periodComparison.growth?.revenue_change_abs)}
                  </span>
                </div>
              </div>

              {/* Order Volume Shift */}
              <div className="p-4 rounded-xl bg-[#F8F4EE] border border-[#E8E2DA] space-y-1.5">
                <span className="text-xs font-medium text-[#6B6560]">Order Volume</span>
                <div className="flex items-baseline justify-between">
                  <span className="text-xl font-bold text-[#242424] tabular-numbers font-heading">
                    {periodComparison.current_period?.orders_count} orders
                  </span>
                  <span
                    className={`text-xs font-bold flex items-center gap-0.5 px-2 py-0.5 rounded-full ${
                      (periodComparison.growth?.orders_change_abs ?? 0) >= 0
                        ? 'bg-emerald-50 text-[#32734D] border border-emerald-200'
                        : 'bg-rose-50 text-[#B84040] border border-rose-200'
                    }`}
                  >
                    {periodComparison.growth?.orders_growth_pct > 0 ? '+' : ''}
                    {periodComparison.growth?.orders_growth_pct}%
                  </span>
                </div>
                <div className="text-[11px] text-[#6B6560] flex justify-between border-t border-[#E8E2DA] pt-1.5">
                  <span>Prev {periodDays}d: {periodComparison.previous_period?.orders_count} orders</span>
                  <span className="font-semibold text-[#242424]">
                    {periodComparison.growth?.orders_change_abs >= 0 ? '+' : ''}
                    {periodComparison.growth?.orders_change_abs} orders
                  </span>
                </div>
              </div>

              {/* AOV Trajectory */}
              <div className="p-4 rounded-xl bg-[#F8F4EE] border border-[#E8E2DA] space-y-1.5">
                <span className="text-xs font-medium text-[#6B6560]">Average Ticket Depth</span>
                <div className="flex items-baseline justify-between">
                  <span className="text-xl font-bold text-[#242424] tabular-numbers font-heading">
                    {formatINR(periodComparison.current_period?.aov)}
                  </span>
                  <span
                    className={`text-xs font-bold flex items-center gap-0.5 px-2 py-0.5 rounded-full ${
                      (periodComparison.growth?.aov_change_abs ?? 0) >= 0
                        ? 'bg-emerald-50 text-[#32734D] border border-emerald-200'
                        : 'bg-rose-50 text-[#B84040] border border-rose-200'
                    }`}
                  >
                    {periodComparison.growth?.aov_growth_pct > 0 ? '+' : ''}
                    {periodComparison.growth?.aov_growth_pct}%
                  </span>
                </div>
                <div className="text-[11px] text-[#6B6560] flex justify-between border-t border-[#E8E2DA] pt-1.5">
                  <span>Prev {periodDays}d: {formatINR(periodComparison.previous_period?.aov)}</span>
                  <span className="font-semibold text-[#242424]">
                    {periodComparison.growth?.aov_change_abs >= 0 ? '+' : ''}
                    {formatINR(periodComparison.growth?.aov_change_abs)}
                  </span>
                </div>
              </div>
            </div>

            {/* Causality Advisory */}
            <div className="p-3.5 rounded-xl bg-white border border-[#E8E2DA] text-xs flex items-start gap-2.5">
              <Info className="w-4 h-4 text-[#783F45] shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-semibold text-[#242424] text-xs block">
                  Methodology & Causality Advisory
                </span>
                <p className="text-[#6B6560] text-[11px] leading-relaxed">
                  {periodComparison.causality_note ||
                    'Observed sales deltas represent empirical correlations calculated directly from completed database transactions.'}
                </p>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* 7-Day Revenue Velocity Chart */}
      <div className="bg-white border border-[#E8E2DA] rounded-2xl p-6 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E8E2DA] pb-3">
          <div>
            <h2 className="font-heading text-base font-bold text-[#242424]">Sales Trajectory</h2>
            <p className="text-xs text-[#6B6560]">Daily completed order revenue across the trailing period.</p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[#6B6560]">
            <Calendar className="w-3.5 h-3.5 text-[#783F45]" />
            <span className="font-medium text-[#242424]">Trailing 7 days</span>
          </div>
        </div>

        <div className="h-64 w-full">
          {loading ? (
            <div className="h-full flex items-center justify-center text-xs text-[#6B6560]">
              Loading chart data...
            </div>
          ) : trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevPlum" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#783F45" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#783F45" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F8F4EE" vertical={false} />
                <XAxis dataKey="day" stroke="#6B6560" fontSize={11} tickLine={false} axisLine={{ stroke: '#E8E2DA' }} />
                <YAxis
                  stroke="#6B6560"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `₹${val}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#E8E2DA',
                    borderRadius: '12px',
                    color: '#242424',
                    fontSize: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.06)'
                  }}
                  formatter={(val) => [formatINR(val), 'Settled Revenue']}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#783F45"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorRevPlum)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-[#6B6560]">
              No paid transactions recorded in this period yet.
            </div>
          )}
        </div>
      </div>

      {/* Two Column Grid: Category Breakdown & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Contribution */}
        <div className="bg-white border border-[#E8E2DA] rounded-2xl p-6 space-y-3.5 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#E8E2DA] pb-3">
            <div>
              <h2 className="font-heading text-base font-bold text-[#242424]">Category Distribution</h2>
              <p className="text-xs text-[#6B6560]">Revenue distribution across departments.</p>
            </div>
            <PieChartIcon className="w-4 h-4 text-[#783F45]" />
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
                      borderColor: '#E8E2DA',
                      borderRadius: '12px',
                      color: '#242424',
                      fontSize: '12px'
                    }}
                    formatter={(val) => [formatINR(val), 'Revenue']}
                  />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    formatter={(val) => <span className="text-xs text-[#6B6560]">{val}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-[#6B6560]">
                Category distribution calculating...
              </div>
            )}
          </div>
        </div>

        {/* Best-Selling SKUs */}
        <div className="bg-white border border-[#E8E2DA] rounded-2xl p-6 space-y-3.5 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#E8E2DA] pb-3">
            <div>
              <h2 className="font-heading text-base font-bold text-[#242424]">Best-Selling Products</h2>
              <p className="text-xs text-[#6B6560]">Ranked by total units sold across paid transactions.</p>
            </div>
            <TrendingUp className="w-4 h-4 text-[#32734D]" />
          </div>

          <div className="divide-y divide-[#E8E2DA]">
            {topProducts.length > 0 ? (
              topProducts.slice(0, 5).map((p, idx) => (
                <div key={p.product_id || idx} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-[#F8F4EE] text-[#783F45] font-bold text-[11px] flex items-center justify-center border border-[#E8E2DA]">
                      {idx + 1}
                    </span>
                    <div>
                      <p className="font-semibold text-[#242424]">{p.name}</p>
                      <p className="text-[11px] text-[#6B6560]">
                        {p.category} • {p.units_sold} units sold
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[#242424] tabular-numbers font-heading">{formatINR(p.total_revenue)}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-[#6B6560] py-6 text-center">No product sales recorded yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
