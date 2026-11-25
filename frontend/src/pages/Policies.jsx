import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Lock,
  Ban,
  CheckCircle2,
  AlertTriangle,
  Sliders,
  DollarSign,
  Percent,
  Play,
  Check
} from 'lucide-react';
import { getPolicies, updatePolicy, validatePolicy } from '../services/api';

export default function Policies() {
  const [policy, setPolicy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Guardrail Simulator State
  const [simOriginal, setSimOriginal] = useState(1000);
  const [simDiscount, setSimDiscount] = useState(100);
  const [simResult, setSimResult] = useState(null);
  const [simTesting, setSimTesting] = useState(false);

  const fetchPolicies = async () => {
    setLoading(true);
    try {
      const res = await getPolicies();
      setPolicy(res.data);
    } catch (err) {
      console.error('Failed to load policies:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    try {
      const res = await updatePolicy(policy);
      setPolicy(res.data);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save policy updates:', err);
      alert('Error updating policies');
    } finally {
      setSaving(false);
    }
  };

  const handleRunSimulation = async () => {
    setSimTesting(true);
    try {
      const res = await validatePolicy({
        original_amount: parseFloat(simOriginal) || 0,
        proposed_discount: parseFloat(simDiscount) || 0,
        action: 'create_offer'
      });
      setSimResult(res.data);
    } catch (err) {
      console.error('Validation test error:', err);
    } finally {
      setSimTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-xs text-[#6B6560]">Loading commercial policies...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E8E2DA]">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[#242424] tracking-tight">
            Discount Rules & Margin Limits
          </h1>
          <p className="text-xs sm:text-sm text-[#6B6560] mt-1">
            Configure commercial margin guardrails, max discount thresholds, and restricted transaction rules.
          </p>
        </div>

        <span className="text-xs text-[#32734D] font-semibold px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 flex items-center gap-1.5 self-start sm:self-auto">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Policies Active</span>
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Merchant Policy Form */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSave} className="bg-white border border-[#E8E2DA] rounded-2xl p-6 space-y-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-[#E8E2DA] pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#783F45]" />
                <h2 className="font-heading text-sm font-bold text-[#242424]">Configured Commercial Boundaries</h2>
              </div>
              {saveSuccess && (
                <span className="text-xs text-[#32734D] font-semibold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Policy updated
                </span>
              )}
            </div>

            {/* Numeric Thresholds */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              {/* Max Discount % */}
              <div className="space-y-1.5">
                <label className="text-xs text-[#242424] font-medium flex items-center gap-1">
                  <Percent className="w-3.5 h-3.5 text-[#783F45]" />
                  Max discount (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={policy?.max_discount_percentage || 10}
                  onChange={(e) => setPolicy({ ...policy, max_discount_percentage: parseFloat(e.target.value) })}
                  className="w-full bg-[#F8F4EE] border border-[#E8E2DA] rounded-xl px-3 py-2 text-xs font-mono text-[#242424] focus:border-[#783F45] focus:outline-none"
                />
                <span className="text-[11px] text-[#6B6560]">Cap per basket offer</span>
              </div>

              {/* Max Discount Amount */}
              <div className="space-y-1.5">
                <label className="text-xs text-[#242424] font-medium flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 text-[#783F45]" />
                  Max discount cap (₹)
                </label>
                <input
                  type="number"
                  value={policy?.max_discount_amount || 6000}
                  onChange={(e) => setPolicy({ ...policy, max_discount_amount: parseFloat(e.target.value) })}
                  className="w-full bg-[#F8F4EE] border border-[#E8E2DA] rounded-xl px-3 py-2 text-xs font-mono text-[#242424] focus:border-[#783F45] focus:outline-none"
                />
                <span className="text-[11px] text-[#6B6560]">Monetary ceiling</span>
              </div>

              {/* Max Transaction Amount */}
              <div className="space-y-1.5">
                <label className="text-xs text-[#242424] font-medium flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-[#783F45]" />
                  Max transaction (₹)
                </label>
                <input
                  type="number"
                  value={policy?.max_transaction_amount || 100000}
                  onChange={(e) => setPolicy({ ...policy, max_transaction_amount: parseFloat(e.target.value) })}
                  className="w-full bg-[#F8F4EE] border border-[#E8E2DA] rounded-xl px-3 py-2 text-xs font-mono text-[#242424] focus:border-[#783F45] focus:outline-none"
                />
                <span className="text-[11px] text-[#6B6560]">Per-order ceiling</span>
              </div>
            </div>

            {/* Allowed Capabilities Whitelist */}
            <div className="space-y-2.5">
              <span className="text-xs font-bold text-[#242424] uppercase tracking-wider block font-heading">
                Allowed Capabilities (Whitelist)
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {policy?.allowed_actions?.map((act) => (
                  <div key={act} className="p-2.5 rounded-xl bg-[#F8F4EE] border border-[#E8E2DA] text-[11px] text-[#32734D] flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#32734D] shrink-0" />
                    <span className="font-mono truncate">{act}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Restricted Operations Blacklist */}
            <div className="space-y-2.5">
              <span className="text-xs font-bold text-[#242424] uppercase tracking-wider block font-heading">
                Restricted Operations (Blocked)
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {policy?.restricted_actions?.map((act) => (
                  <div key={act} className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-[11px] text-[#B84040] flex items-center gap-2">
                    <Ban className="w-3.5 h-3.5 text-[#B84040] shrink-0" />
                    <span className="font-mono truncate">{act}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Approval Toggle & Save */}
            <div className="border-t border-[#E8E2DA] pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <label className="flex items-center gap-2.5 text-xs text-[#242424] cursor-pointer">
                <input
                  type="checkbox"
                  checked={policy?.require_human_approval ?? true}
                  onChange={(e) => setPolicy({ ...policy, require_human_approval: e.target.checked })}
                  className="w-4 h-4 rounded text-[#783F45] focus:ring-[#783F45]"
                />
                <span>Require human approval on automated catalog modifications</span>
              </label>

              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 rounded-xl bg-[#783F45] hover:bg-[#603137] text-white text-xs font-semibold transition shadow-sm disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </form>
        </div>

        {/* Right Col: Interactive Policy Guardrail Tester */}
        <div className="bg-white border border-[#E8E2DA] rounded-2xl p-6 space-y-4 h-fit shadow-sm">
          <div className="border-b border-[#E8E2DA] pb-3">
            <h2 className="font-heading text-sm font-bold text-[#242424]">Policy Rule Simulator</h2>
            <p className="text-xs text-[#6B6560]">Test whether an order or discount passes guardrails.</p>
          </div>

          <div className="space-y-3.5 text-xs">
            <div>
              <label className="text-[#6B6560] block mb-1 font-medium">Basket Value (₹)</label>
              <input
                type="number"
                value={simOriginal}
                onChange={(e) => setSimOriginal(e.target.value)}
                className="w-full bg-[#F8F4EE] border border-[#E8E2DA] rounded-xl px-3 py-2 text-xs text-[#242424]"
              />
            </div>

            <div>
              <label className="text-[#6B6560] block mb-1 font-medium">Proposed Discount (₹)</label>
              <input
                type="number"
                value={simDiscount}
                onChange={(e) => setSimDiscount(e.target.value)}
                className="w-full bg-[#F8F4EE] border border-[#E8E2DA] rounded-xl px-3 py-2 text-xs text-[#242424]"
              />
            </div>

            <button
              onClick={handleRunSimulation}
              disabled={simTesting}
              className="w-full py-2.5 rounded-xl bg-white hover:bg-[#F8F4EE] border border-[#E8E2DA] text-[#242424] font-semibold text-xs flex items-center justify-center gap-2 transition shadow-sm"
            >
              <Play className="w-3.5 h-3.5 text-[#783F45]" />
              <span>{simTesting ? 'Evaluating...' : 'Run validation test'}</span>
            </button>

            {simResult && (
              <div
                className={`p-3.5 rounded-xl border text-xs space-y-1 ${
                  simResult.passed
                    ? 'bg-emerald-50 border-emerald-200 text-[#32734D]'
                    : 'bg-rose-50 border-rose-200 text-[#B84040]'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold">
                  {simResult.passed ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                  <span>{simResult.passed ? 'Compliant with policies' : 'Violation intercepted'}</span>
                </div>
                <p className="text-[11px] leading-relaxed">{simResult.reason}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
