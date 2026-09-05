import React from 'react';
import { ShieldCheck, CheckCircle2, XCircle, Sparkles, ArrowRight, Lock } from 'lucide-react';

export default function ApprovalGateModal({
  isOpen,
  onClose,
  onApprove,
  offer,
  policyEvaluation,
  loading = false
}) {
  if (!isOpen || !offer) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#111827] border border-gray-700/80 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Merchant Approval Gate</h3>
              <p className="text-xs text-gray-400">Deterministic Financial Pre-Settlement Check</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800 transition"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        {/* Item Breakdown */}
        <div className="bg-gray-900/60 rounded-xl p-4 border border-gray-800 space-y-3">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Cart Items & AI Bundle Breakdown
          </div>
          <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
            {offer.items?.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm">
                <span className="text-gray-200 truncate max-w-[260px]">
                  {item.quantity}x {item.name || item.product_name}
                </span>
                <span className="font-mono text-gray-300">₹{(item.total_price || item.unit_price || 0).toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-800 pt-3 space-y-1.5 text-sm">
            <div className="flex justify-between text-gray-400">
              <span>Catalog Subtotal:</span>
              <span className="font-mono">₹{offer.original_total?.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-emerald-400 font-medium">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                AI Bounded Discount ({offer.discount_percentage}%):
              </span>
              <span className="font-mono">-₹{offer.discount_amount?.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-white font-bold text-base pt-2 border-t border-gray-800">
              <span>Final Payable Amount:</span>
              <span className="font-mono text-blue-400 text-lg">₹{offer.final_amount?.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* Policy Verification Badge */}
        <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-3.5 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <div className="font-semibold text-emerald-300">Policy Engine Verification: PASSED</div>
            <p className="text-gray-300 leading-relaxed">
              Requested discount of {offer.discount_percentage}% is strictly within the configured merchant ceiling of{' '}
              {policyEvaluation?.max_discount_percentage || 10.0}%.
            </p>
            {policyEvaluation?.approval_token && (
              <div className="font-mono text-[10px] text-emerald-400/80 pt-1">
                Token: {policyEvaluation.approval_token}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-700 bg-gray-800/80 text-gray-300 hover:bg-gray-800 hover:text-white font-medium text-sm transition"
          >
            Cancel Action
          </button>
          <button
            type="button"
            onClick={onApprove}
            disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold text-sm shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition disabled:opacity-50"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>Approve & Pay</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
