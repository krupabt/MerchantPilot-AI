import React from 'react';
import { AlertOctagon, ShieldAlert, XCircle, ArrowRight, FileSearch } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PolicyViolationCard({ policyEvaluation, onReset }) {
  if (!policyEvaluation) return null;

  return (
    <div className="bg-red-950/30 border border-red-500/50 rounded-2xl p-6 shadow-2xl space-y-4 animate-fadeIn">
      {/* Violation Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400">
            <AlertOctagon className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold font-mono bg-red-500/20 text-red-300 border border-red-500/40">
                ❌ ACTION BLOCKED
              </span>
              <span className="text-xs text-red-400 font-mono font-semibold">GUARDRAIL VIOLATION</span>
            </div>
            <h3 className="text-lg font-bold text-white mt-1">Merchant Commercial Policy Violation</h3>
          </div>
        </div>
      </div>

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-gray-950/60 rounded-xl p-4 border border-red-500/20 text-xs">
        <div>
          <span className="text-gray-400 block mb-1">Requested Discount</span>
          <span className="text-lg font-bold text-red-400 font-mono">
            ₹{policyEvaluation.requested_discount?.toLocaleString('en-IN')}
          </span>
          <span className="text-[11px] text-gray-400 block mt-0.5">
            ({policyEvaluation.requested_discount_percentage}% of total)
          </span>
        </div>

        <div>
          <span className="text-gray-400 block mb-1">Merchant Ceiling</span>
          <span className="text-lg font-bold text-emerald-400 font-mono">
            ₹{policyEvaluation.max_allowed_discount?.toLocaleString('en-IN')}
          </span>
          <span className="text-[11px] text-gray-400 block mt-0.5">
            (Max {policyEvaluation.max_discount_percentage}% limit)
          </span>
        </div>

        <div>
          <span className="text-gray-400 block mb-1">Payment Status</span>
          <span className="text-lg font-bold text-gray-300 font-mono flex items-center gap-1.5">
            <XCircle className="w-4 h-4 text-red-400" />
            NOT EXECUTED
          </span>
          <span className="text-[11px] text-gray-500 block mt-0.5">
            No Razorpay order created
          </span>
        </div>
      </div>

      {/* Explanation Text */}
      <div className="bg-red-950/20 border border-red-500/30 rounded-xl p-3.5 text-xs text-red-200 leading-relaxed">
        <p className="font-semibold text-red-300 mb-1">Reason for Guardrail Rejection:</p>
        <p>{policyEvaluation.reason}</p>
      </div>

      {/* Bottom Actions */}
      <div className="flex items-center justify-between pt-2 border-t border-red-500/20">
        <Link
          to="/audit"
          className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium transition"
        >
          <FileSearch className="w-3.5 h-3.5" />
          <span>View Recorded Violation in Audit Trail</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>

        {onReset && (
          <button
            onClick={onReset}
            className="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-medium transition"
          >
            Try Compliant Request
          </button>
        )}
      </div>
    </div>
  );
}
