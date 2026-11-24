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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E5E5E5]">
        <div>
          <h1 className="text-2xl sm:text-[28px] font-bold text-[#222222] tracking-tight">
            Product intelligence
          </h1>
          <p className="text-sm text-[#71717A] mt-0.5">
            Frequently bought together patterns, Apriori association rules, and compliant bundling opportunities.
          </p>
        </div>

        <button
          onClick={fetchInsights}
          disabled={loading}
          className="px-3 py-1.5 rounded-md bg-white hover:bg-[#F7F7F5] border border-[#E5E5E5] text-[#222222] text-xs font-medium flex items-center gap-1.5 transition-colors shadow-xs disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#71717A] ${loading ? 'animate-spin' : ''}`} />
          <span>Re-analyze baskets</span>
        </button>
      </div>

      {/* 4 Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="surface-card p-4 space-y-1">
          <span className="text-xs font-medium text-[#71717A]">Analyzed orders</span>
          <p className="text-2xl font-bold text-[#222222] tracking-tight">{data?.total_orders || 0}</p>
          <p className="text-[12px] text-[#71717A]">Completed checkout baskets</p>
        </div>

        <div className="surface-card p-4 space-y-1">
          <span className="text-xs font-medium text-[#71717A]">Association rules found</span>
          <p className="text-2xl font-bold text-[#C65D3B] tracking-tight">{rules.length}</p>
          <p className="text-[12px] text-[#71717A]">Support &gt; 10%, Confidence &gt; 30%</p>
        </div>

        <div className="surface-card p-4 space-y-1">
          <span className="text-xs font-medium text-[#71717A]">Analyzed revenue</span>
          <p className="text-2xl font-bold text-[#222222] tracking-tight">
            ₹{((data?.total_revenue || 0) / 100000).toFixed(2)}L
          </p>
          <p className="text-[12px] text-[#71717A]">Verified purchase records</p>
        </div>

        <div className="surface-card p-4 space-y-1">
          <span className="text-xs font-medium text-[#71717A]">Discount ceiling</span>
          <p className="text-2xl font-bold text-[#347A52] tracking-tight">≤ 10.0%</p>
          <p className="text-[12px] text-[#71717A]">Commercial margin guardrail</p>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-[#71717A] surface-card animate-pulse">
          Analyzing transaction records for frequent itemsets...
        </div>
      ) : isInsufficient ? (
        <div className="p-8 surface-card text-center space-y-2">
          <AlertTriangle className="w-8 h-8 text-[#B77932] mx-auto opacity-80" />
          <h3 className="text-base font-semibold text-[#222222]">Insufficient transaction history</h3>
          <p className="text-xs text-[#71717A] max-w-md mx-auto">
            Market basket analysis requires multi-item completed orders to compute genuine Lift without synthetic bias. As customer orders settle, high-confidence association rules will populate automatically.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Association Rules Table */}
          <div className="surface-card overflow-hidden">
            <div className="p-4 border-b border-[#E5E5E5] flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-[#222222]">
                  Frequently bought together rules
                </h2>
                <p className="text-xs text-[#71717A]">Mined from customer checkout baskets with statistically verified lift.</p>
              </div>
              <span className="text-[11px] font-medium text-[#347A52] bg-[#FAF5F2] px-2 py-0.5 rounded border border-[#F0D5CB]">
                Verified SQL Baskets
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F7F7F5] text-[#71717A] font-medium border-b border-[#E5E5E5]">
                  <tr>
                    <th className="py-2.5 px-3.5">Initial item (Antecedent)</th>
                    <th className="py-2.5 px-3">Also purchased (Consequent)</th>
                    <th className="py-2.5 px-3">Support</th>
                    <th className="py-2.5 px-3">Confidence</th>
                    <th className="py-2.5 px-3">Lift metric</th>
                    <th className="py-2.5 px-3.5">Commercial recommendation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E5E5]">
                  {rules.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-6 text-center text-[#71717A]">
                        No cross-category pairings exceeded the minimum threshold yet.
                      </td>
                    </tr>
                  ) : (
                    rules.map((rule, idx) => (
                      <tr key={idx} className="hover:bg-[#F7F7F5]/60 transition-colors">
                        <td className="py-2.5 px-3.5 font-medium text-[#222222]">
                          {rule.antecedent_name || rule.antecedent}
                        </td>
                        <td className="py-2.5 px-3 font-medium text-[#C65D3B]">
                          {rule.consequent_name || rule.consequent}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[#71717A]">
                          {(rule.support * 100).toFixed(1)}%
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[#222222]">
                          {(rule.confidence * 100).toFixed(1)}%
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded font-mono font-semibold text-[11px] text-[#347A52] bg-[#FAF5F2] border border-[#F0D5CB]">
                            {rule.lift.toFixed(2)}x Lift
                          </span>
                        </td>
                        <td className="py-2.5 px-3.5 text-[#71717A]">
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
              <div className="border-b border-[#E5E5E5] pb-2.5">
                <h2 className="text-base font-semibold text-[#222222]">
                  Recommended bundle opportunities
                </h2>
                <p className="text-xs text-[#71717A]">Compliant with commercial margin ceiling (≤ 10% maximum discount).</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {bundles.map((bundle, idx) => (
                  <div key={idx} className="p-4 rounded-lg bg-[#F7F7F5] border border-[#E5E5E5] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-[#222222]">{bundle.name}</span>
                      <span className="text-[11px] font-semibold text-[#347A52] bg-[#FAF5F2] px-2 py-0.5 rounded border border-[#F0D5CB]">
                        {bundle.discount_percent}% OFF
                      </span>
                    </div>
                    <p className="text-xs text-[#71717A]">
                      Items: {bundle.items?.join(' + ')}
                    </p>
                    <div className="flex items-baseline justify-between pt-2 border-t border-[#E5E5E5]">
                      <span className="text-xs text-[#71717A] line-through">₹{bundle.original_price}</span>
                      <span className="text-base font-bold text-[#C65D3B]">₹{bundle.bundle_price}</span>
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
