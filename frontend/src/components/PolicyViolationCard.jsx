import React from 'react';
import { AlertOctagon, ShieldAlert, XCircle, ArrowRight, FileSearch } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PolicyViolationCard({ policyEvaluation, onReset }) {
  if (!policyEvaluation) return null;

  return (
    <div className="bg-[#FDF4F4] border border-[#E5E5E5] rounded-xl p-5 space-y-3.5">
      {/* Violation Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-white border border-[#E5E5E5] flex items-center justify-center text-[#B94A48] shadow-xs">
            <AlertOctagon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold font-mono bg-white text-[#B94A48] border border-[#E5E5E5]">
                ACTION BLOCKED
              </span>
              <span className="text-[11px] text-[#B94A48] font-mono font-medium">GUARDRAIL VIOLATION</span>
            </div>
            <h3 className="text-sm font-semibold text-[#222222] mt-1">Merchant Commercial Policy Violation</h3>
          </div>
        </div>
      </div>

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-white rounded-lg p-3.5 border border-[#E5E5E5] text-xs">
        <div>
          <span className="text-[#71717A] block mb-1">Requested Discount</span>
          <span className="text-base font-bold text-[#B94A48] font-mono">
            ₹{policyEvaluation.requested_discount?.toLocaleString('en-IN')}
          </span>
          <span className="text-[11px] text-[#71717A] block mt-0.5">
            ({policyEvaluation.requested_discount_percentage}% of total)
          </span>
        </div>

        <div>
          <span className="text-[#71717A] block mb-1">Merchant Ceiling</span>
          <span className="text-base font-bold text-[#347A52] font-mono">
            ₹{policyEvaluation.max_allowed_discount?.toLocaleString('en-IN')}
          </span>
          <span className="text-[11px] text-[#71717A] block mt-0.5">
            (Max {policyEvaluation.max_discount_percentage}% limit)
          </span>
        </div>

        <div>
          <span className="text-[#71717A] block mb-1">Payment Status</span>
          <span className="text-sm font-semibold text-[#222222] font-mono flex items-center gap-1 mt-0.5">
            <XCircle className="w-3.5 h-3.5 text-[#B94A48]" />
            NOT EXECUTED
          </span>
          <span className="text-[11px] text-[#71717A] block mt-0.5">
            No Razorpay order created
          </span>
        </div>
      </div>

      <div className="p-3 bg-white rounded-lg border border-[#E5E5E5] text-xs text-[#71717A] leading-relaxed">
        <strong className="text-[#222222] font-medium block mb-1">Violation Reason:</strong>
        {policyEvaluation.reason || 'The requested discount exceeds the maximum authorized merchant discount ceiling.'}
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
        <Link
          to="/policies"
          className="text-xs text-[#C65D3B] hover:underline flex items-center gap-1 font-medium"
        >
          <FileSearch className="w-3.5 h-3.5" />
          <span>Inspect Merchant Policy Rules</span>
        </Link>

        {onReset && (
          <button
            onClick={onReset}
            className="px-3.5 py-1.5 rounded-lg bg-[#C65D3B] hover:bg-[#b04f30] text-white text-xs font-medium transition shadow-xs"
          >
            Reset Query
          </button>
        )}
      </div>
    </div>
  );
}
