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
  DollarSign
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

export default function Dashboard() {
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
          <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
          <p className="text-sm text-gray-400 font-medium">Aggregating Merchant Intelligence...</p>
        </div>
      </div>
    );
  }

  const rev = stats?.revenue_insights || {};
  const trend = stats?.revenue_trend || [];
  const recentOrders = stats?.recent_orders || [];

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-950/40 via-gray-900 to-emerald-950/30 border border-blue-500/20 rounded-2xl p-6 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/30">
                MERCHANT OVERVIEW & AI METRICS
              </span>
              <span className="text-xs text-gray-400 font-mono">Apex Electronics Store</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              AI Growth & Agentic Commerce Dashboard
            </h2>
            <p className="text-xs text-gray-400 mt-1 max-w-2xl leading-relaxed">
              Real-time monitoring of AI-assisted buyer sessions, revenue intelligence uplift, deterministic policy guardrail checks, and Razorpay settlements.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchStats}
              className="px-3.5 py-2 rounded-xl bg-gray-800/80 hover:bg-gray-800 border border-gray-700 text-gray-300 text-xs font-medium flex items-center gap-2 transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
            <Link
              to="/ai-buyer"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white text-xs font-semibold shadow-lg shadow-blue-500/20 flex items-center gap-1.5 transition"
            >
              <Bot className="w-4 h-4" />
              <span>Launch AI Buyer Demo</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Primary KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="bg-[#111827]/80 border border-gray-800 rounded-2xl p-5 hover:border-gray-700 transition">
          <div className="flex items-center justify-between text-gray-400 text-xs font-medium mb-3">
            <span>Total Gross Revenue</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            ₹{rev.total_revenue?.toLocaleString('en-IN') || '0'}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium mt-2">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{rev.total_orders || 0} Settled Orders</span>
          </div>
          <span className="text-[10px] text-gray-500 block mt-1">Demo Simulated Orders</span>
        </div>

        {/* AI Assisted Revenue */}
        <div className="bg-[#111827]/80 border border-blue-500/30 rounded-2xl p-5 relative overflow-hidden hover:border-blue-500/50 transition">
          <div className="absolute -top-10 -right-10 w-24 h-24 bg-blue-500/10 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between text-blue-300 text-xs font-medium mb-3">
            <span>AI-Assisted Revenue</span>
            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-blue-400 font-mono">
            ₹{rev.ai_assisted_revenue?.toLocaleString('en-IN') || '0'}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-blue-300 font-semibold mt-2">
            <Bot className="w-3.5 h-3.5" />
            <span>{rev.ai_revenue_percentage || 0}% of Total Volume</span>
          </div>
          <span className="text-[10px] text-gray-500 block mt-1">Uplift via Autonomous Agent</span>
        </div>

        {/* Average Order Value (AOV) */}
        <div className="bg-[#111827]/80 border border-gray-800 rounded-2xl p-5 hover:border-gray-700 transition">
          <div className="flex items-center justify-between text-gray-400 text-xs font-medium mb-3">
            <span>Average Order Value</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            ₹{rev.average_order_value?.toLocaleString('en-IN') || '0'}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium mt-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>+24.8% from AI Bundles</span>
          </div>
          <span className="text-[10px] text-gray-500 block mt-1">Cross-Sell Basket Mining</span>
        </div>

        {/* Blocked Actions Guardrail */}
        <div className="bg-[#111827]/80 border border-red-500/20 rounded-2xl p-5 hover:border-red-500/40 transition">
          <div className="flex items-center justify-between text-gray-400 text-xs font-medium mb-3">
            <span>Policy Guardrail Blocks</span>
            <div className="p-2 rounded-xl bg-red-500/10 text-red-400">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-red-400 font-mono">
            {stats?.blocked_actions_count || 0}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-red-400 font-medium mt-2">
            <AlertOctagon className="w-3.5 h-3.5" />
            <span>Excessive Discounts Halted</span>
          </div>
          <span className="text-[10px] text-gray-500 block mt-1">Deterministic Protection</span>
        </div>
      </div>

      {/* Revenue Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Growth Trend */}
        <div className="lg:col-span-2 bg-[#111827]/80 border border-gray-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Revenue Trajectory (Traditional vs AI-Assisted)
              </h3>
              <p className="text-xs text-gray-400">Demonstrating merchant revenue expansion powered by Agentic Commerce</p>
            </div>
            <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-gray-900 text-gray-400 border border-gray-800">
              7-Day Window (Demo Data)
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAi" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3395FF" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#3395FF" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="colorTrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4B5563" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#4B5563" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
                <XAxis dataKey="day" stroke="#6B7280" fontSize={11} tickLine={false} />
                <YAxis stroke="#6B7280" fontSize={11} tickLine={false} tickFormatter={(val) => `₹${val/1000}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '0.75rem', fontSize: '12px' }}
                  formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, '']}
                />
                <Area type="monotone" dataKey="ai_revenue" name="AI-Assisted Revenue" stroke="#3395FF" strokeWidth={2.5} fillOpacity={1} fill="url(#colorAi)" />
                <Area type="monotone" dataKey="traditional_revenue" name="Traditional Storefront" stroke="#6B7280" strokeWidth={1.5} fillOpacity={1} fill="url(#colorTrad)" />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* High Affinity Bundles Card */}
        <div className="bg-[#111827]/80 border border-gray-800 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Mined Bundle Affinities
              </h3>
              <Link to="/revenue" className="text-xs text-blue-400 hover:text-blue-300 font-medium">
                View All Rules →
              </Link>
            </div>
            <p className="text-xs text-gray-400 mb-4">Top automated product bundles derived from market basket co-occurrences:</p>

            <div className="space-y-3">
              {rev.active_bundle_opportunities?.slice(0, 3).map((b, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-gray-900/60 border border-gray-800 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white truncate max-w-[170px]">{b.title}</span>
                    <span className="text-emerald-400 font-mono font-bold">₹{b.bundle_price?.toLocaleString('en-IN')}</span>
                  </div>
                  <p className="text-[11px] text-gray-400 leading-snug line-clamp-2">{b.rationale}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-gray-800 text-[11px] text-gray-500 flex items-center justify-between">
            <span>Association Engine: Apriori / Lift</span>
            <span className="text-emerald-400 font-mono">100% EXPLAINABLE</span>
          </div>
        </div>
      </div>

      {/* Recent Orders Ledger */}
      <div className="bg-[#111827]/80 border border-gray-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Recent Settlement Transactions
            </h3>
            <p className="text-xs text-gray-400">Live order creations and Razorpay payment state transitions</p>
          </div>
          <Link to="/transactions" className="text-xs text-blue-400 hover:text-blue-300 font-medium">
            View Complete Ledger →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400 font-medium pb-2">
                <th className="py-2.5 px-3">Order ID</th>
                <th className="py-2.5 px-3">Items / Bundle</th>
                <th className="py-2.5 px-3">Amount</th>
                <th className="py-2.5 px-3">Channel</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Settlement Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {recentOrders.map((ord) => (
                <tr key={ord.id} className="hover:bg-gray-900/40 transition">
                  <td className="py-3 px-3 font-mono font-medium text-gray-300">{ord.id}</td>
                  <td className="py-3 px-3">
                    <span className="text-white font-medium">
                      {ord.bundle_name || `${ord.items_count} Product Item(s)`}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-white">
                    ₹{ord.amount?.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-3">
                    {ord.is_ai_assisted ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/30">
                        AI AGENT
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-800 text-gray-400">
                        DIRECT
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold font-mono ${
                      ord.status === 'PAID'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                    }`}>
                      {ord.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right text-gray-500 font-mono">
                    {new Date(ord.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
