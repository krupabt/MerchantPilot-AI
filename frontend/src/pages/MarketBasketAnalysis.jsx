import React, { useState, useEffect } from 'react';
import {
  PieChart as PieIcon,
  Sparkles,
  TrendingUp,
  Layers,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Box,
  Percent
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
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2A3441] pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase bg-[#F5A524]/10 border border-[#F5A524]/30 text-[#F5A524] px-2 py-0.5 rounded">
              Statistical Rule Mining
            </span>
            <span className="text-xs text-[#94A3B8] font-mono">Apriori Lift & Affinity Engine</span>
          </div>
          <h1 className="text-2xl font-bold text-[#F8FAFC] tracking-tight">Market Basket Analysis</h1>
          <p className="text-xs text-[#94A3B8]">
            Mine completed multi-item transactions for statistical support, confidence, and lift to build profitable commercial bundles.
          </p>
        </div>

        <button
          onClick={fetchInsights}
          className="px-3.5 py-2 rounded-xl bg-[#1C222B] hover:bg-[#242D38] border border-[#2A3441] text-[#94A3B8] hover:text-[#F8FAFC] text-xs font-medium flex items-center gap-2 self-start sm:self-auto transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Re-Mine Baskets</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="surface-card p-4">
          <span className="text-[10px] uppercase font-mono text-[#94A3B8]">Mined Transactions</span>
          <p className="text-2xl font-black text-[#F8FAFC] mt-1">{data?.total_orders || 0}</p>
          <span className="text-[11px] text-[#94A3B8] mt-1 block">Completed purchase baskets</span>
        </div>

        <div className="surface-card p-4">
          <span className="text-[10px] uppercase font-mono text-[#F5A524]">Association Rules Found</span>
          <p className="text-2xl font-black text-[#F5A524] mt-1">{rules.length}</p>
          <span className="text-[11px] text-[#94A3B8] mt-1 block">Support &gt; 10%, Confidence &gt; 30%</span>
        </div>

        <div className="surface-card p-4">
          <span className="text-[10px] uppercase font-mono text-[#10B981]">Total Revenue Analyzed</span>
          <p className="text-2xl font-black text-[#10B981] mt-1">
            ₹{((data?.total_revenue || 0) / 100000).toFixed(2)}L
          </p>
          <span className="text-[11px] text-[#94A3B8] mt-1 block">Verified settlements</span>
        </div>

        <div className="surface-card p-4">
          <span className="text-[10px] uppercase font-mono text-[#38BDF8]">Policy Discount Boundary</span>
          <p className="text-2xl font-black text-[#38BDF8] mt-1">≤ 10.0%</p>
          <span className="text-[11px] text-[#94A3B8] mt-1 block">Strict merchant margin cap</span>
        </div>
      </div>

      {loading ? (
        <div className="p-16 text-center text-xs text-[#94A3B8] rounded-2xl bg-[#1C222B] border border-[#2A3441] animate-pulse">
          Mining statistical association rules from database transaction logs...
        </div>
      ) : isInsufficient ? (
        <div className="p-8 rounded-2xl bg-[#151A21] border border-[#2A3441] text-center space-y-3">
          <AlertTriangle className="w-10 h-10 text-[#F59E0B] mx-auto" />
          <h3 className="text-base font-bold text-[#F8FAFC]">Sparse Transaction History</h3>
          <p className="text-xs text-[#94A3B8] max-w-md mx-auto">
            Statistical Apriori basket mining requires multi-item completed orders to compute genuine Lift without synthetic bias. As more customer orders settle, high-confidence association rules will populate automatically.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Association Rules Table */}
          <div className="surface-card overflow-hidden">
            <div className="p-4 border-b border-[#2A3441] flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase font-mono text-[#F8FAFC]">
                  Discovered Product Association Rules
                </h3>
                <span className="text-[11px] text-[#94A3B8]">Mined with minimum support threshold</span>
              </div>
              <span className="text-[10px] font-mono text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded">
                Verified SQL Baskets
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#151A21] border-b border-[#2A3441] text-[#94A3B8] uppercase font-mono text-[10px]">
                  <tr>
                    <th className="p-4">Antecedent (When bought)</th>
                    <th className="p-4">Consequent (Likely to also buy)</th>
                    <th className="p-4">Support</th>
                    <th className="p-4">Confidence</th>
                    <th className="p-4">Lift Metric</th>
                    <th className="p-4">Commercial Strategy</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2A3441]">
                  {rules.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="p-8 text-center text-[#94A3B8]">
                        No cross-category pairings exceeded minimum threshold yet.
                      </td>
                    </tr>
                  ) : (
                    rules.map((rule, idx) => (
                      <tr key={idx} className="hover:bg-[#151A21]/50 transition">
                        <td className="p-4 font-semibold text-[#F8FAFC]">
                          {rule.antecedent_name || rule.antecedent}
                        </td>
                        <td className="p-4 font-semibold text-[#F5A524]">
                          {rule.consequent_name || rule.consequent}
                        </td>
                        <td className="p-4 font-mono text-[#94A3B8]">
                          {(rule.support * 100).toFixed(1)}%
                        </td>
                        <td className="p-4 font-mono text-[#F8FAFC]">
                          {(rule.confidence * 100).toFixed(1)}%
                        </td>
                        <td className="p-4">
                          <span className="px-2 py-0.5 rounded font-mono font-bold text-[#10B981] bg-[#10B981]/10 border border-[#10B981]/30">
                            {rule.lift.toFixed(2)}x Lift
                          </span>
                        </td>
                        <td className="p-4 text-[#94A3B8]">
                          Recommended for automated bundle discount up to 8%
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
            <div className="surface-card p-6 space-y-4">
              <h3 className="text-xs font-bold uppercase font-mono text-[#F8FAFC]">
                Autonomous High-Affinity Bundle Offers
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {bundles.map((bundle, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-[#151A21] border border-[#2A3441] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#F8FAFC]">{bundle.name}</span>
                      <span className="text-[10px] font-mono text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded">
                        {bundle.discount_percent}% OFF
                      </span>
                    </div>
                    <p className="text-xs text-[#94A3B8]">
                      Includes: {bundle.items?.join(' + ')}
                    </p>
                    <div className="flex items-baseline justify-between pt-2 border-t border-[#2A3441]">
                      <span className="text-[11px] text-[#94A3B8] line-through">₹{bundle.original_price}</span>
                      <span className="text-sm font-bold text-[#F5A524]">₹{bundle.bundle_price}</span>
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
