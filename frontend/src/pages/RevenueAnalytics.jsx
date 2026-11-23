import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  BarChart3,
  DollarSign,
  ShoppingCart,
  Calendar,
  Layers,
  RefreshCw,
  ArrowUpRight,
  Sparkles,
  Bot,
  PieChart as PieChartIcon,
  ShieldCheck,
  CheckCircle2,
  Percent
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
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
import { getDashboardStats } from '../services/api';

const PIE_COLORS = ['#F5A524', '#D97706', '#10B981', '#38BDF8', '#A855F7', '#EC4899'];

export default function RevenueAnalytics() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    fetchAnalytics();
  }, []);

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
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2A3441] pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase bg-[#F5A524]/10 border border-[#F5A524]/30 text-[#F5A524] px-2 py-0.5 rounded font-bold">
              Sales Analytics
            </span>
            <span className="text-xs text-[#94A3B8] font-mono">100% Relational Settlement Logs</span>
          </div>
          <h1 className="text-2xl font-bold text-[#F8FAFC] tracking-tight">Financial & Revenue Analytics</h1>
          <p className="text-xs text-[#94A3B8]">
            Analyze 7-day revenue velocity curves, category contribution breakdowns, average order depth, and SKU performance.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={fetchAnalytics}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl bg-[#1C222B] hover:bg-[#242D38] border border-[#2A3441] text-[#94A3B8] hover:text-[#F8FAFC] text-xs font-medium flex items-center gap-1.5 transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <Link
            to="/copilot"
            state={{ prefilledQuery: 'What is our total revenue, completed order count, and average order value?' }}
            className="px-4 py-2 rounded-xl bg-[#F5A524] hover:bg-[#D97706] text-black font-semibold text-xs transition flex items-center gap-1.5 shadow-amber-glow"
          >
            <Bot className="w-4 h-4" />
            <span>Ask Copilot</span>
          </Link>
        </div>
      </div>

      {/* 4 Financial KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="surface-card p-5 space-y-1">
          <div className="flex items-center justify-between text-[#94A3B8] text-xs">
            <span className="uppercase font-mono text-[10px]">Total Settled Revenue</span>
            <DollarSign className="w-4 h-4 text-[#F5A524]" />
          </div>
          <p className="text-2xl font-black text-[#F8FAFC]">
            {loading ? '...' : `₹${totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
          </p>
          <span className="text-[11px] text-[#10B981] flex items-center gap-1 font-mono">
            <TrendingUp className="w-3 h-3" />
            PostgreSQL Paid Ledgers
          </span>
        </div>

        <div className="surface-card p-5 space-y-1">
          <div className="flex items-center justify-between text-[#94A3B8] text-xs">
            <span className="uppercase font-mono text-[10px]">Completed Orders</span>
            <ShoppingCart className="w-4 h-4 text-[#F5A524]" />
          </div>
          <p className="text-2xl font-black text-[#F8FAFC]">
            {loading ? '...' : totalOrders}
          </p>
          <span className="text-[11px] text-[#94A3B8] font-mono">
            Paid & verified transactions
          </span>
        </div>

        <div className="surface-card p-5 space-y-1">
          <div className="flex items-center justify-between text-[#94A3B8] text-xs">
            <span className="uppercase font-mono text-[10px]">Average Order Value (AOV)</span>
            <Sparkles className="w-4 h-4 text-[#F5A524]" />
          </div>
          <p className="text-2xl font-black text-[#F8FAFC]">
            {loading ? '...' : `₹${aov.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
          </p>
          <span className="text-[11px] text-[#94A3B8] font-mono">
            Revenue per transaction
          </span>
        </div>

        <div className="surface-card p-5 space-y-1">
          <div className="flex items-center justify-between text-[#94A3B8] text-xs">
            <span className="uppercase font-mono text-[10px]">Promotional Discounts</span>
            <Percent className="w-4 h-4 text-[#10B981]" />
          </div>
          <p className="text-2xl font-black text-[#10B981]">
            {loading ? '...' : `₹${discountsGranted.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
          </p>
          <span className="text-[11px] text-[#10B981] font-mono">
            Policy Compliant (≤ 10% limit)
          </span>
        </div>
      </div>

      {/* 7-Day Revenue Trend Chart */}
      <div className="surface-card p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-[#F8FAFC]">Daily Revenue Velocity Curve</h3>
            <p className="text-xs text-[#94A3B8]">
              Daily completed order volume and settled rupee amounts over the past 7 days.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#94A3B8]">
            <Calendar className="w-3.5 h-3.5 text-[#F5A524]" />
            <span>7-Day Trailing Window</span>
          </div>
        </div>

        <div className="h-64 w-full">
          {loading ? (
            <div className="h-full flex items-center justify-center text-xs text-[#94A3B8]">
              Loading revenue velocity chart...
            </div>
          ) : trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F5A524" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#F5A524" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A3441" />
                <XAxis dataKey="day" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#94A3B8"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#151A21',
                    borderColor: '#2A3441',
                    borderRadius: '0.75rem',
                    color: '#F8FAFC',
                    fontSize: '12px'
                  }}
                  formatter={(val) => [`₹${val.toLocaleString('en-IN')}`, 'Settled Revenue']}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#F5A524"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorRev)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-[#94A3B8]">
              No paid transactions recorded in this period yet.
            </div>
          )}
        </div>
      </div>

      {/* Two Column Grid: Category Breakdown & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Revenue Distribution */}
        <div className="surface-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#F8FAFC]">Category Contribution</h3>
              <p className="text-xs text-[#94A3B8]">Revenue distribution across published hardware departments.</p>
            </div>
            <PieChartIcon className="w-4 h-4 text-[#F5A524]" />
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
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#151A21',
                      borderColor: '#2A3441',
                      borderRadius: '0.75rem',
                      color: '#F8FAFC',
                      fontSize: '12px'
                    }}
                    formatter={(val) => [`₹${val.toLocaleString('en-IN')}`, 'Revenue']}
                  />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    formatter={(val) => <span className="text-xs text-[#94A3B8]">{val}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-[#94A3B8]">
                Category revenue distribution calculating...
              </div>
            )}
          </div>
        </div>

        {/* Best Selling SKUs */}
        <div className="surface-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#F8FAFC]">Best-Selling Hardware SKUs</h3>
              <p className="text-xs text-[#94A3B8]">Ranked by total units sold across paid transactions.</p>
            </div>
            <TrendingUp className="w-4 h-4 text-[#10B981]" />
          </div>

          <div className="divide-y divide-[#2A3441]">
            {topProducts.length > 0 ? (
              topProducts.slice(0, 5).map((p, idx) => (
                <div key={p.product_id || idx} className="py-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-[#1C222B] border border-[#2A3441] flex items-center justify-center font-mono font-bold text-xs text-[#F5A524]">
                      {idx + 1}
                    </span>
                    <div>
                      <p className="font-semibold text-[#F8FAFC]">{p.name}</p>
                      <p className="text-[10px] text-[#94A3B8] font-mono">
                        Category: {p.category} • SKU: {p.product_id}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[#F8FAFC]">₹{p.total_revenue?.toLocaleString('en-IN')}</p>
                    <p className="text-[10px] text-[#10B981] font-mono">{p.units_sold} units sold</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-[#94A3B8] py-8 text-center">No settled product sales recorded yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
