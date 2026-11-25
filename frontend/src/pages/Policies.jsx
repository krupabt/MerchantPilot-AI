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
        <p className="text-xs text-[#71717A]">Loading commercial policies...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E5E5E5]">
        <div>
          <h1 className="text-2xl sm:text-[28px] font-bold text-[#222222] tracking-tight">
            Business settings & commercial guardrails
          </h1>
          <p className="text-sm text-[#71717A] mt-0.5">
            Configure discount limits, order settlement caps, and restricted operations.
          </p>
        </div>

        <span className="text-xs text-[#347A52] font-semibold px-2.5 py-1 rounded-md bg-[#FAF5F2] border border-[#F0D5CB] flex items-center gap-1.5 self-start sm:self-auto">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Policies active</span>
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Merchant Policy Form */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSave} className="surface-card p-5 space-y-5">
            <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#C65D3B]" />
                <h2 className="text-sm font-semibold text-[#222222]">Configured commercial boundaries</h2>
              </div>
              {saveSuccess && (
                <span className="text-xs text-[#347A52] font-medium flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Policy updated
                </span>
              )}
            </div>

            {/* Numeric Thresholds */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              {/* Max Discount % */}
              <div className="space-y-1">
                <label className="text-xs text-[#222222] font-medium flex items-center gap-1">
                  <Percent className="w-3.5 h-3.5 text-[#C65D3B]" />
                  Max discount (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={policy?.max_discount_percentage || 10}
                  onChange={(e) => setPolicy({ ...policy, max_discount_percentage: parseFloat(e.target.value) })}
                  className="w-full bg-[#F7F7F5] border border-[#E5E5E5] rounded-md px-3 py-2 text-xs font-mono text-[#222222] focus:border-[#C65D3B] focus:bg-white focus:outline-none"
                />
                <span className="text-[11px] text-[#71717A]">Cap per basket offer</span>
              </div>

              {/* Max Discount Amount */}
              <div className="space-y-1">
                <label className="text-xs text-[#222222] font-medium flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 text-[#C65D3B]" />
                  Max discount cap (₹)
                </label>
                <input
                  type="number"
                  value={policy?.max_discount_amount || 6000}
                  onChange={(e) => setPolicy({ ...policy, max_discount_amount: parseFloat(e.target.value) })}
                  className="w-full bg-[#F7F7F5] border border-[#E5E5E5] rounded-md px-3 py-2 text-xs font-mono text-[#222222] focus:border-[#C65D3B] focus:bg-white focus:outline-none"
                />
                <span className="text-[11px] text-[#71717A]">Monetary ceiling</span>
              </div>

              {/* Max Transaction Amount */}
              <div className="space-y-1">
                <label className="text-xs text-[#222222] font-medium flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-[#C65D3B]" />
                  Max transaction (₹)
                </label>
                <input
                  type="number"
                  value={policy?.max_transaction_amount || 100000}
                  onChange={(e) => setPolicy({ ...policy, max_transaction_amount: parseFloat(e.target.value) })}
                  className="w-full bg-[#F7F7F5] border border-[#E5E5E5] rounded-md px-3 py-2 text-xs font-mono text-[#222222] focus:border-[#C65D3B] focus:bg-white focus:outline-none"
                />
                <span className="text-[11px] text-[#71717A]">Per-order ceiling</span>
              </div>
            </div>

            {/* Allowed Capabilities Whitelist */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-[#222222] uppercase tracking-wider block">
                Allowed capabilities (whitelist)
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {policy?.allowed_actions?.map((act) => (
                  <div key={act} className="p-2 rounded-md bg-[#FAF5F2] border border-[#F0D5CB] text-[11px] text-[#347A52] flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#347A52] shrink-0" />
                    <span className="font-mono truncate">{act}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Restricted Operations Blacklist */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-[#222222] uppercase tracking-wider block">
                Restricted financial operations (blocked)
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {policy?.restricted_actions?.map((act) => (
                  <div key={act} className="p-2 rounded-md bg-[#FBEFEF] border border-[#B94A48]/30 text-[11px] text-[#B94A48] flex items-center gap-2">
                    <Ban className="w-3.5 h-3.5 text-[#B94A48] shrink-0" />
                    <span className="font-mono truncate">{act}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Approval Toggle & Save */}
            <div className="border-t border-[#E5E5E5] pt-4 flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs text-[#222222] cursor-pointer">
                <input
                  type="checkbox"
                  checked={policy?.require_human_approval ?? true}
                  onChange={(e) => setPolicy({ ...policy, require_human_approval: e.target.checked })}
                  className="w-4 h-4 rounded text-[#C65D3B] focus:ring-[#C65D3B]"
                />
                <span>Require human merchant approval on automated catalog changes</span>
              </label>

              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 rounded-md bg-[#C65D3B] hover:bg-[#b04f30] text-white text-xs font-semibold transition-colors shadow-xs disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save settings'}
              </button>
            </div>
          </form>
        </div>

        {/* Right Col: Interactive Policy Guardrail Tester */}
        <div className="surface-card p-5 space-y-4 h-fit">
          <div className="border-b border-[#E5E5E5] pb-3">
            <h2 className="text-sm font-semibold text-[#222222]">Policy rule simulator</h2>
            <p className="text-xs text-[#71717A]">Test whether an order or discount passes guardrails.</p>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-[#71717A] block mb-1">Basket value (₹)</label>
              <input
                type="number"
                value={simOriginal}
                onChange={(e) => setSimOriginal(e.target.value)}
                className="w-full bg-[#F7F7F5] border border-[#E5E5E5] rounded-md px-3 py-1.5 font-mono text-xs text-[#222222]"
              />
            </div>

            <div>
              <label className="text-[#71717A] block mb-1">Proposed discount (₹)</label>
              <input
                type="number"
                value={simDiscount}
                onChange={(e) => setSimDiscount(e.target.value)}
                className="w-full bg-[#F7F7F5] border border-[#E5E5E5] rounded-md px-3 py-1.5 font-mono text-xs text-[#222222]"
              />
            </div>

            <button
              onClick={handleRunSimulation}
              disabled={simTesting}
              className="w-full py-2 rounded-md bg-white hover:bg-[#F7F7F5] border border-[#E5E5E5] text-[#222222] font-medium text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
            >
              <Play className="w-3.5 h-3.5 text-[#C65D3B]" />
              <span>{simTesting ? 'Evaluating...' : 'Run validation test'}</span>
            </button>

            {simResult && (
              <div
                className={`p-3 rounded-md border text-xs space-y-1 ${
                  simResult.passed
                    ? 'bg-[#FAF5F2] border-[#F0D5CB] text-[#347A52]'
                    : 'bg-[#FBEFEF] border-[#B94A48]/30 text-[#B94A48]'
                }`}
              >
                <div className="flex items-center gap-1.5 font-semibold">
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
