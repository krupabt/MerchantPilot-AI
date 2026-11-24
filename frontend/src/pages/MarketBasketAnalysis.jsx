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
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#DEE3DC]">
        <div>
          <h1 className="text-2xl sm:text-[28px] font-bold text-[#202923] tracking-tight">
            Product intelligence
          </h1>
          <p className="text-sm text-[#6B746E] mt-0.5">
            Frequently bought together patterns, Apriori association rules, and compliant bundling opportunities.
          </p>
        </div>

        <button
          onClick={fetchInsights}
          disabled={loading}
          className="px-3 py-1.5 rounded-md bg-white hover:bg-[#F6F5F1] border border-[#DEE3DC] text-[#202923] text-xs font-medium flex items-center gap-1.5 transition-colors shadow-xs disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#6B746E] ${loading ? 'animate-spin' : ''}`} />
          <span>Re-analyze baskets</span>
        </button>
      </div>

      {/* 4 Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="surface-card p-4 space-y-1">
          <span className="text-xs font-medium text-[#6B746E]">Analyzed orders</span>
          <p className="text-2xl font-bold text-[#202923] tracking-tight">{data?.total_orders || 0}</p>
          <p className="text-[12px] text-[#6B746E]">Completed checkout baskets</p>
        </div>

        <div className="surface-card p-4 space-y-1">
          <span className="text-xs font-medium text-[#6B746E]">Association rules found</span>
          <p className="text-2xl font-bold text-[#234E42] tracking-tight">{rules.length}</p>
          <p className="text-[12px] text-[#6B746E]">Support &gt; 10%, Confidence &gt; 30%</p>
        </div>

        <div className="surface-card p-4 space-y-1">
          <span className="text-xs font-medium text-[#6B746E]">Analyzed revenue</span>
          <p className="text-2xl font-bold text-[#202923] tracking-tight">
            ₹{((data?.total_revenue || 0) / 100000).toFixed(2)}L
          </p>
          <p className="text-[12px] text-[#6B746E]">Verified purchase records</p>
        </div>

        <div className="surface-card p-4 space-y-1">
          <span className="text-xs font-medium text-[#6B746E]">Discount ceiling</span>
          <p className="text-2xl font-bold text-[#347A52] tracking-tight">≤ 10.0%</p>
          <p className="text-[12px] text-[#6B746E]">Commercial margin guardrail</p>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-[#6B746E] surface-card animate-pulse">
          Analyzing transaction records for frequent itemsets...
        </div>
      ) : isInsufficient ? (
        <div className="p-8 surface-card text-center space-y-2">
          <AlertTriangle className="w-8 h-8 text-[#B77932] mx-auto opacity-80" />
          <h3 className="text-base font-semibold text-[#202923]">Insufficient transaction history</h3>
          <p className="text-xs text-[#6B746E] max-w-md mx-auto">
            Market basket analysis requires multi-item completed orders to compute genuine Lift without synthetic bias. As customer orders settle, high-confidence association rules will populate automatically.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Association Rules Table */}
          <div className="surface-card overflow-hidden">
            <div className="p-4 border-b border-[#DEE3DC] flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-[#202923]">
                  Frequently bought together rules
                </h2>
                <p className="text-xs text-[#6B746E]">Mined from customer checkout baskets with statistically verified lift.</p>
              </div>
              <span className="text-[11px] font-medium text-[#347A52] bg-[#EAF4EE] px-2 py-0.5 rounded border border-[#B8D4C4]">
                Verified SQL Baskets
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F6F5F1] text-[#6B746E] font-medium border-b border-[#DEE3DC]">
                  <tr>
                    <th className="py-2.5 px-3.5">Initial item (Antecedent)</th>
                    <th className="py-2.5 px-3">Also purchased (Consequent)</th>
                    <th className="py-2.5 px-3">Support</th>
                    <th className="py-2.5 px-3">Confidence</th>
                    <th className="py-2.5 px-3">Lift metric</th>
                    <th className="py-2.5 px-3.5">Commercial recommendation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DEE3DC]">
                  {rules.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-6 text-center text-[#6B746E]">
                        No cross-category pairings exceeded the minimum threshold yet.
                      </td>
                    </tr>
                  ) : (
                    rules.map((rule, idx) => (
                      <tr key={idx} className="hover:bg-[#F6F5F1]/60 transition-colors">
                        <td className="py-2.5 px-3.5 font-medium text-[#202923]">
                          {rule.antecedent_name || rule.antecedent}
                        </td>
                        <td className="py-2.5 px-3 font-medium text-[#234E42]">
                          {rule.consequent_name || rule.consequent}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[#6B746E]">
                          {(rule.support * 100).toFixed(1)}%
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[#202923]">
                          {(rule.confidence * 100).toFixed(1)}%
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded font-mono font-semibold text-[11px] text-[#347A52] bg-[#EAF4EE] border border-[#B8D4C4]">
                            {rule.lift.toFixed(2)}x Lift
                          </span>
                        </td>
                        <td className="py-2.5 px-3.5 text-[#6B746E]">
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
            <div className="surface-card p-5 space-y-3">
              <div className="border-b border-[#DEE3DC] pb-2.5">
                <h2 className="text-base font-semibold text-[#202923]">
                  Recommended bundle opportunities
                </h2>
                <p className="text-xs text-[#6B746E]">Compliant with commercial margin ceiling (≤ 10% maximum discount).</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {bundles.map((bundle, idx) => (
                  <div key={idx} className="p-4 rounded-lg bg-[#F6F5F1] border border-[#DEE3DC] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-[#202923]">{bundle.name}</span>
                      <span className="text-[11px] font-semibold text-[#347A52] bg-[#EAF4EE] px-2 py-0.5 rounded border border-[#B8D4C4]">
                        {bundle.discount_percent}% OFF
                      </span>
                    </div>
                    <p className="text-xs text-[#6B746E]">
                      Items: {bundle.items?.join(' + ')}
                    </p>
                    <div className="flex items-baseline justify-between pt-2 border-t border-[#DEE3DC]">
                      <span className="text-xs text-[#6B746E] line-through">₹{bundle.original_price}</span>
                      <span className="text-base font-bold text-[#234E42]">₹{bundle.bundle_price}</span>
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
