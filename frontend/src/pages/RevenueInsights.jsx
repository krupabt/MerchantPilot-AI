import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Sparkles,
  Layers,
  ArrowRight,
  PieChart as PieIcon,
  ShoppingBag,
  Zap,
  Info,
  CheckCircle2
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend
} from 'recharts';
import { getRevenueInsights } from '../services/api';

const COLORS = ['#3395FF', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#6366F1'];

export default function RevenueInsights() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await getRevenueInsights();
        setData(res.data);
      } catch (err) {
        console.error('Failed to load revenue insights:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
          <p className="text-sm text-gray-400 font-medium">Mining Basket Co-Occurrences & Rules...</p>
        </div>
      </div>
    );
  }

  const categoryData = Object.entries(data?.category_breakdown || {}).map(([name, value]) => ({
    name,
    value: Math.round(value)
  }));

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              FEATURE 4 — REVENUE INTELLIGENCE
            </span>
            <span className="text-xs text-gray-400 font-mono">Market Basket Analysis & Lift Mining</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Revenue Intelligence & Association Rules
          </h2>
          <p className="text-xs text-gray-400 mt-1 max-w-2xl leading-relaxed">
            Discover statistical product affinity pairings, high-converting bundle discount opportunities, and autonomous upselling pathways derived from real transaction baskets.
          </p>
        </div>

        <div className="p-2.5 rounded-xl bg-gray-900 border border-gray-800 text-xs text-gray-400 font-mono">
          Model: <span className="text-emerald-400 font-bold">Apriori / Lift Affinity</span>
        </div>
      </div>

      {/* Primary KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#111827]/80 border border-gray-800 rounded-2xl p-5">
          <span className="text-xs text-gray-400 font-medium block mb-2">Total Gross Volume</span>
          <div className="text-2xl font-bold text-white font-mono">
            ₹{data?.total_revenue?.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-gray-500 block mt-1">{data?.total_orders} Settled Orders</span>
        </div>

        <div className="bg-[#111827]/80 border border-blue-500/30 rounded-2xl p-5">
          <span className="text-xs text-blue-300 font-medium block mb-2">AI-Assisted Revenue</span>
          <div className="text-2xl font-bold text-blue-400 font-mono">
            ₹{data?.ai_assisted_revenue?.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-blue-400/80 block mt-1">{data?.ai_revenue_percentage}% Contribution</span>
        </div>

        <div className="bg-[#111827]/80 border border-gray-800 rounded-2xl p-5">
          <span className="text-xs text-gray-400 font-medium block mb-2">Cross-Sell Bundle Volume</span>
          <div className="text-2xl font-bold text-emerald-400 font-mono">
            ₹{data?.cross_sell_revenue?.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-emerald-500 block mt-1">Multi-item Affinity Checkout</span>
        </div>

        <div className="bg-[#111827]/80 border border-gray-800 rounded-2xl p-5">
          <span className="text-xs text-gray-400 font-medium block mb-2">Upsell Tier Expansion</span>
          <div className="text-2xl font-bold text-purple-400 font-mono">
            ₹{data?.upsell_revenue?.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-purple-400/80 block mt-1">Spec-driven Upgrades</span>
        </div>
      </div>

      {/* Active High-Conversion Bundle Opportunities */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span>Autonomous Bundle Opportunities (Mined from Transactions)</span>
          </h3>
          <span className="text-[11px] text-gray-500 font-mono">Merchant Policy Compliant</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {data?.active_bundle_opportunities?.map((b) => (
            <div
              key={b.bundle_id}
              className="bg-[#111827]/80 border border-gray-800 hover:border-blue-500/40 rounded-2xl p-5 flex flex-col justify-between transition group"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    {b.bundle_id}
                  </span>
                  <span className="text-[11px] font-mono font-semibold text-emerald-400">
                    {b.historical_conversion_rate}% Conv.
                  </span>
                </div>

                <h4 className="text-base font-bold text-white group-hover:text-blue-400 transition mb-2">
                  {b.title}
                </h4>

                <div className="bg-gray-900/60 rounded-xl p-3 border border-gray-800 space-y-1 mb-3 text-xs">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                    Products Included:
                  </span>
                  {b.product_names.map((name, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 text-gray-300 truncate">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                      <span>{name}</span>
                    </div>
                  ))}
                </div>

                <p className="text-xs text-gray-400 leading-relaxed mb-4">
                  💡 <span className="font-semibold text-gray-300">Rationale:</span> {b.rationale}
                </p>
              </div>

              <div className="border-t border-gray-800 pt-3 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-gray-500 line-through block">
                    ₹{b.individual_total?.toLocaleString('en-IN')}
                  </span>
                  <span className="text-lg font-bold text-white font-mono">
                    ₹{b.bundle_price?.toLocaleString('en-IN')}
                  </span>
                </div>
                <span className="px-2.5 py-1 rounded-xl bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20">
                  Save ₹{b.discount_amount} ({b.discount_pct}%)
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mined Association Rules Table & Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Association Rules Table */}
        <div className="lg:col-span-2 bg-[#111827]/80 border border-gray-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Mined Product Affinity Matrix
              </h3>
              <p className="text-xs text-gray-400">Statistical rules discovered from order baskets (Support, Confidence, Lift)</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-800 text-gray-400 font-medium">
                  <th className="py-2.5 px-3">Antecedent (If Bought)</th>
                  <th className="py-2.5 px-3">Consequent (Recommend)</th>
                  <th className="py-2.5 px-2 text-center">Confidence</th>
                  <th className="py-2.5 px-2 text-center">Lift</th>
                  <th className="py-2.5 px-3">Explainable Pitch</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {data?.top_associations?.map((rule, idx) => (
                  <tr key={idx} className="hover:bg-gray-900/40 transition">
                    <td className="py-3 px-3 font-medium text-white max-w-[140px] truncate">
                      {rule.antecedent_name}
                    </td>
                    <td className="py-3 px-3 font-medium text-blue-400 max-w-[140px] truncate">
                      {rule.consequent_name}
                    </td>
                    <td className="py-3 px-2 text-center font-mono text-emerald-400 font-bold">
                      {Math.round(rule.confidence * 100)}%
                    </td>
                    <td className="py-3 px-2 text-center font-mono text-purple-400 font-bold">
                      {rule.lift}x
                    </td>
                    <td className="py-3 px-3 text-gray-400 leading-snug max-w-[200px]">
                      {rule.recommendation_pitch}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Category Breakdown Pie */}
        <div className="bg-[#111827]/80 border border-gray-800 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-1">
              Category Revenue Share
            </h3>
            <p className="text-xs text-gray-400 mb-4">Gross sales distribution across categories</p>

            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '0.75rem', fontSize: '11px' }}
                    formatter={(val) => `₹${val.toLocaleString('en-IN')}`}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="text-[11px] text-gray-500 pt-3 border-t border-gray-800 text-center">
            Mined from 60+ historical customer baskets
          </div>
        </div>
      </div>
    </div>
  );
}
