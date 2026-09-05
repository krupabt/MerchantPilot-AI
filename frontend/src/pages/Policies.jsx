import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  Ban,
  CheckCircle2,
  AlertTriangle,
  Save,
  RefreshCw,
  Sliders,
  DollarSign,
  Percent,
  Play
} from 'lucide-react';
import { getPolicies, updatePolicy, validatePolicy } from '../services/api';

export default function Policies() {
  const [policy, setPolicy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Guardrail Simulator State
  const [simOriginal, setSimOriginal] = useState(60000);
  const [simDiscount, setSimDiscount] = useState(501);
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
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
          <p className="text-sm text-gray-400 font-medium">Loading Policy Engine Parameters...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/30">
              FEATURE 7 — POLICY & GUARDRAIL ENGINE
            </span>
            <span className="text-xs text-gray-400 font-mono">Server-Side Deterministic Boundaries</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Commercial Guardrails & Safety Policies
          </h2>
          <p className="text-xs text-gray-400 mt-1 max-w-2xl leading-relaxed">
            Strict non-trust AI boundary ensuring autonomous commerce agents cannot exceed merchant-configured discount limits, transaction ceilings, or execute restricted financial ledger operations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-emerald-400 font-mono font-semibold px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>ENFORCEMENT: ACTIVE</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Merchant Policy Form */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSave} className="bg-[#111827]/80 border border-gray-800 rounded-2xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-gray-800 pb-4">
              <div className="flex items-center gap-2.5">
                <Sliders className="w-5 h-5 text-blue-400" />
                <h3 className="text-base font-bold text-white">Configured Merchant Rules</h3>
              </div>
              {saveSuccess && (
                <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Policy Updated Successfully
                </span>
              )}
            </div>

            {/* Numeric Thresholds */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Max Discount % */}
              <div className="space-y-1.5">
                <label className="text-xs text-gray-400 font-medium flex items-center gap-1">
                  <Percent className="w-3.5 h-3.5 text-blue-400" />
                  Max Discount (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={policy?.max_discount_percentage || 10}
                  onChange={(e) => setPolicy({ ...policy, max_discount_percentage: parseFloat(e.target.value) })}
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono focus:border-blue-500 focus:outline-none"
                />
                <span className="text-[10px] text-gray-500 block">Cap per basket offer</span>
              </div>

              {/* Max Discount Amount */}
              <div className="space-y-1.5">
                <label className="text-xs text-gray-400 font-medium flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                  Max Discount Cap (₹)
                </label>
                <input
                  type="number"
                  value={policy?.max_discount_amount || 6000}
                  onChange={(e) => setPolicy({ ...policy, max_discount_amount: parseFloat(e.target.value) })}
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono focus:border-blue-500 focus:outline-none"
                />
                <span className="text-[10px] text-gray-500 block">Absolute monetary ceiling</span>
              </div>

              {/* Max Transaction Amount */}
              <div className="space-y-1.5">
                <label className="text-xs text-gray-400 font-medium flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-purple-400" />
                  Max Transaction (₹)
                </label>
                <input
                  type="number"
                  value={policy?.max_transaction_amount || 100000}
                  onChange={(e) => setPolicy({ ...policy, max_transaction_amount: parseFloat(e.target.value) })}
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono focus:border-blue-500 focus:outline-none"
                />
                <span className="text-[10px] text-gray-500 block">Per-order settlement limit</span>
              </div>
            </div>

            {/* Allowed AI Actions Whitelist */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-gray-300 uppercase tracking-wider block">
                Allowed AI Agent Capabilities (Whitelist)
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {policy?.allowed_actions?.map((act) => (
                  <div key={act} className="p-2.5 rounded-xl bg-emerald-950/20 border border-emerald-500/20 text-xs text-emerald-300 flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="font-mono text-[11px] truncate">{act}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Restricted Financial Actions Blacklist */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-gray-300 uppercase tracking-wider block">
                Restricted Operations (Strictly Blocked by Policy Engine)
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {policy?.restricted_actions?.map((act) => (
                  <div key={act} className="p-2.5 rounded-xl bg-red-950/20 border border-red-500/20 text-xs text-red-300 flex items-center gap-2">
                    <Ban className="w-3.5 h-3.5 text-red-400 shrink-0" />
                    <span className="font-mono text-[11px] truncate">{act}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Approval Toggle & Save */}
            <div className="border-t border-gray-800 pt-5 flex items-center justify-between">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={policy?.require_human_approval ?? true}
                  onChange={(e) => setPolicy({ ...policy, require_human_approval: e.target.checked })}
                  className="w-4 h-4 rounded text-blue-600 bg-gray-900 border-gray-700"
                />
                <span className="text-xs text-gray-300 font-medium">
                  Enforce Human-in-the-Loop Approval Gate before Checkout
                </span>
              </label>

              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-lg shadow-blue-500/20 flex items-center gap-2 transition disabled:opacity-50"
              >
                {saving ? (
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Policy Configuration</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right Col: Live Guardrail Evaluation Simulator */}
        <div className="space-y-6">
          <div className="bg-[#111827]/80 border border-gray-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Live Guardrail Simulator
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Interactive Test
              </span>
            </div>
            <p className="text-xs text-gray-400">
              Test how the Policy Engine deterministically evaluates any arbitrary transaction amount or proposed discount.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-400 block mb-1">Basket Original Subtotal (₹)</label>
                <input
                  type="number"
                  value={simOriginal}
                  onChange={(e) => setSimOriginal(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="text-xs text-gray-400 block mb-1">Proposed Discount (₹)</label>
                <input
                  type="number"
                  value={simDiscount}
                  onChange={(e) => setSimDiscount(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
                />
              </div>

              <button
                type="button"
                onClick={handleRunSimulation}
                disabled={simTesting}
                className="w-full px-4 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-blue-400 border border-blue-500/30 text-xs font-semibold flex items-center justify-center gap-2 transition"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Evaluate with Policy Engine</span>
              </button>
            </div>

            {simResult && (
              <div className={`p-4 rounded-xl border text-xs space-y-2 mt-3 ${
                simResult.passed
                  ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                  : 'bg-red-950/20 border-red-500/30 text-red-300'
              }`}>
                <div className="flex items-center justify-between font-bold">
                  <span>Decision: {simResult.status}</span>
                  <span className="font-mono">{simResult.passed ? 'PERMITTED' : 'BLOCKED'}</span>
                </div>
                <p className="text-[11px] leading-relaxed opacity-90">{simResult.reason}</p>
                {simResult.approval_token && (
                  <div className="text-[10px] font-mono text-emerald-400/80 pt-1 border-t border-emerald-500/20">
                    Token: {simResult.approval_token}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
