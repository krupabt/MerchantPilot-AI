import React, { useState, useEffect } from 'react';
import {
  Boxes,
  RefreshCw,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Percent,
  CheckCircle2,
  Package
} from 'lucide-react';
import { getRevenueInsights } from '../services/api';

function formatINR(val) {
  if (val == null || isNaN(val)) return '₹0';
  const num = Number(val);
  return num % 1 === 0
    ? `₹${num.toLocaleString('en-IN')}`
    : `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function MarketBasketAnalysis() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchInsights = async () => {
    setLoading(true);
    try {
      const res = await getRevenueInsights();
      setData(res.data);
    } catch (err) {
      console.error('Failed to load market basket analysis:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  const rules = data?.rules || [];
  const bundles = data?.recommended_bundles || [];
  const isInsufficient = data?.status === 'INSUFFICIENT_DATA' || (data?.total_orders || 0) < 5;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E8E2DA]">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[#242424] tracking-tight">
            Product Insights
          </h1>
          <p className="text-xs sm:text-sm text-[#6B6560] mt-1">
            Frequently bought together patterns, Apriori association rules, and margin-compliant bundling.
          </p>
        </div>

        <button
          onClick={fetchInsights}
          disabled={loading}
          className="px-3.5 py-2 rounded-xl bg-white hover:bg-[#F8F4EE] border border-[#E8E2DA] text-[#242424] text-xs font-semibold flex items-center gap-1.5 transition shadow-sm disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#6B6560] ${loading ? 'animate-spin' : ''}`} />
          <span>Re-analyze Baskets</span>
        </button>
      </div>

      {/* 4 Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E8E2DA] rounded-2xl p-5 space-y-1.5 shadow-sm hover:border-[#D8C3A5] transition">
          <span className="text-xs font-medium text-[#6B6560]">Analyzed Orders</span>
          <p className="font-heading text-2xl font-bold text-[#242424] tracking-tight tabular-numbers">{data?.total_orders || 0}</p>
          <p className="text-[11px] text-[#6B6560]">Completed checkout baskets</p>
        </div>

        <div className="bg-white border border-[#E8E2DA] rounded-2xl p-5 space-y-1.5 shadow-sm hover:border-[#D8C3A5] transition">
          <span className="text-xs font-medium text-[#6B6560]">Association Rules</span>
          <p className="font-heading text-2xl font-bold text-[#783F45] tracking-tight tabular-numbers">{rules.length}</p>
          <p className="text-[11px] text-[#6B6560]">Support &gt; 10%, Confidence &gt; 30%</p>
        </div>

        <div className="bg-white border border-[#E8E2DA] rounded-2xl p-5 space-y-1.5 shadow-sm hover:border-[#D8C3A5] transition">
          <span className="text-xs font-medium text-[#6B6560]">Analyzed Revenue</span>
          <p className="font-heading text-2xl font-bold text-[#242424] tracking-tight tabular-numbers">
            {formatINR(data?.total_revenue || 0)}
          </p>
          <p className="text-[11px] text-[#6B6560]">Verified purchase records</p>
        </div>

        <div className="bg-white border border-[#E8E2DA] rounded-2xl p-5 space-y-1.5 shadow-sm hover:border-[#D8C3A5] transition">
          <span className="text-xs font-medium text-[#6B6560]">Discount Ceiling</span>
          <p className="font-heading text-2xl font-bold text-[#32734D] tracking-tight tabular-numbers">≤ 10.0%</p>
          <p className="text-[11px] text-[#6B6560]">Commercial margin guardrail</p>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-[#6B6560] bg-white border border-[#E8E2DA] rounded-2xl animate-pulse">
          Analyzing transaction records for frequent itemsets...
        </div>
      ) : isInsufficient ? (
        <div className="p-8 bg-white border border-[#E8E2DA] rounded-2xl text-center space-y-2.5 shadow-sm">
          <AlertTriangle className="w-8 h-8 text-[#B77932] mx-auto opacity-80" />
          <h3 className="font-heading text-base font-bold text-[#242424]">Insufficient Transaction History</h3>
          <p className="text-xs text-[#6B6560] max-w-md mx-auto">
            Market basket analysis requires multi-item completed orders to compute genuine Lift without synthetic bias. As customer orders settle, high-confidence association rules will populate automatically.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Association Rules Table */}
          <div className="bg-white border border-[#E8E2DA] rounded-2xl overflow-hidden shadow-sm">
            <div className="p-5 border-b border-[#E8E2DA] flex items-center justify-between">
              <div>
                <h2 className="font-heading text-sm font-bold text-[#242424]">
                  Frequently Bought Together Rules
                </h2>
                <p className="text-xs text-[#6B6560] mt-0.5">Mined from customer checkout baskets with statistically verified lift.</p>
              </div>
              <span className="text-[11px] font-semibold text-[#32734D] bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                Verified SQL Baskets
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8F4EE] text-[#6B6560] font-semibold border-b border-[#E8E2DA]">
                  <tr>
                    <th className="py-3 px-4">Initial item (Antecedent)</th>
                    <th className="py-3 px-3">Also purchased (Consequent)</th>
                    <th className="py-3 px-3">Support</th>
                    <th className="py-3 px-3">Confidence</th>
                    <th className="py-3 px-3">Lift metric</th>
                    <th className="py-3 px-4">Commercial recommendation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E2DA]">
                  {rules.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-8 text-center text-[#6B6560]">
                        No cross-category pairings exceeded the minimum threshold yet.
                      </td>
                    </tr>
                  ) : (
                    rules.map((rule, idx) => (
                      <tr key={idx} className="hover:bg-[#F8F4EE]/50 transition-colors">
                        <td className="py-3 px-4 font-semibold text-[#242424]">
                          {rule.antecedent_name || rule.antecedent}
                        </td>
                        <td className="py-3 px-3 font-semibold text-[#783F45]">
                          {rule.consequent_name || rule.consequent}
                        </td>
                        <td className="py-3 px-3 tabular-numbers text-[#6B6560]">
                          {(rule.support * 100).toFixed(1)}%
                        </td>
                        <td className="py-3 px-3 tabular-numbers text-[#242424] font-medium">
                          {(rule.confidence * 100).toFixed(1)}%
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-2.5 py-0.5 rounded-full tabular-numbers font-bold text-[11px] text-[#32734D] bg-emerald-50 border border-emerald-200">
                            {rule.lift.toFixed(2)}x Lift
                          </span>
                        </td>
                        <td className="py-3 px-4 text-[#6B6560]">
                          Recommended for bundle discount up to 8%
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recommended Bundles */}
          {bundles.length > 0 && (
            <div className="bg-white border border-[#E8E2DA] rounded-2xl p-6 space-y-4 shadow-sm">
              <div className="border-b border-[#E8E2DA] pb-3">
                <h2 className="font-heading text-base font-bold text-[#242424]">
                  Recommended Bundle Opportunities
                </h2>
                <p className="text-xs text-[#6B6560] mt-0.5">Compliant with commercial margin ceiling (≤ 10% maximum discount).</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {bundles.map((bundle, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-[#F8F4EE] border border-[#E8E2DA] space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-[#242424] font-heading">{bundle.name}</span>
                      <span className="text-[11px] font-semibold text-[#32734D] bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                        {bundle.discount_percent}% OFF
                      </span>
                    </div>
                    <p className="text-xs text-[#6B6560]">
                      Items: {bundle.items?.join(' + ')}
                    </p>
                    <div className="flex items-baseline justify-between pt-2 border-t border-[#E8E2DA]">
                      <span className="text-xs text-[#6B6560] line-through tabular-numbers">{formatINR(bundle.original_price)}</span>
                      <span className="text-base font-bold text-[#783F45] tabular-numbers font-heading">{formatINR(bundle.bundle_price)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
