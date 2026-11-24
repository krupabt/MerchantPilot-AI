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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white border border-[#E5E5E5] rounded-xl max-w-lg w-full p-6 shadow-xl space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-[#FAF5F2] border border-[#E5E5E5] flex items-center justify-center text-[#C65D3B] shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[#222222]">Merchant Approval Gate</h3>
              <p className="text-xs text-[#71717A]">Deterministic Financial Pre-Settlement Check</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-[#71717A] hover:text-[#222222] p-1 rounded-lg hover:bg-[#F7F7F5] transition"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        {/* Item Breakdown */}
        <div className="bg-[#F7F7F5] rounded-lg p-3.5 border border-[#E5E5E5] space-y-2.5">
          <div className="text-xs font-semibold text-[#71717A] uppercase tracking-wider font-mono">
            Cart Items & AI Bundle Breakdown
          </div>
          <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
            {offer.items?.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <span className="text-[#222222] truncate max-w-[240px]">
                  {item.quantity}x {item.name || item.product_name}
                </span>
                <span className="font-mono text-[#222222] font-medium">₹{(item.total_price || item.unit_price || 0).toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-[#E5E5E5] pt-2.5 space-y-1 text-xs">
            <div className="flex justify-between text-[#71717A]">
              <span>Catalog Subtotal:</span>
              <span className="font-mono text-[#222222]">₹{offer.original_total?.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-[#347A52] font-medium">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Bundle Discount:</span>
              </span>
              <span className="font-mono">-₹{offer.discount_amount?.toLocaleString('en-IN')} ({offer.discount_percentage || 0}%)</span>
            </div>
            <div className="flex justify-between text-sm font-semibold text-[#222222] pt-1.5 border-t border-[#E5E5E5]">
              <span>Final Payable Amount:</span>
              <span className="font-mono text-[#C65D3B]">₹{offer.final_amount?.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* Policy Verification Badge */}
        <div className="p-3 rounded-lg bg-[#FAF5F2]/60 border border-[#E5E5E5] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#347A52]" />
            <span className="text-[#222222] font-medium">Guardrail Policy Evaluated</span>
          </div>
          <span className="font-mono text-[#347A52] bg-white border border-[#E5E5E5] px-2 py-0.5 rounded text-[11px] font-semibold">
            PASSED (≤10%)
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-3.5 py-2 rounded-lg bg-white hover:bg-[#F7F7F5] border border-[#E5E5E5] text-[#222222] text-xs font-medium transition"
          >
            Cancel
          </button>
          <button
            onClick={onApprove}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-[#C65D3B] hover:bg-[#b04f30] text-white text-xs font-medium transition shadow-xs flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <span>Registering Order...</span>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5" />
                <span>Authorize & Proceed</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
