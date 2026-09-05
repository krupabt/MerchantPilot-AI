import React, { useState } from 'react';
import {
  CreditCard,
  Lock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  RefreshCw,
  ShoppingBag,
  FileSearch
} from 'lucide-react';
import { Link } from 'react-router-dom';
import RazorpayCheckoutModal from '../components/RazorpayCheckoutModal';
import { createCheckoutOrder, validatePolicy } from '../services/api';

const DEFAULT_SAMPLE_ITEMS = [
  { product_id: 'P101', product_name: 'Apex ProBook 15 Developer Edition', quantity: 1, unit_price: 60000.0 },
  { product_id: 'P102', product_name: 'Apex Precision Wireless Mouse', quantity: 1, unit_price: 1000.0 }
];

export default function Checkout() {
  const [items, setItems] = useState(DEFAULT_SAMPLE_ITEMS);
  const [discountAmount, setDiscountAmount] = useState(501.0);
  const [customerName, setCustomerName] = useState('Demo AI Buyer');
  const [customerEmail, setCustomerEmail] = useState('buyer@merchantpilot.ai');
  const [customerPhone, setCustomerPhone] = useState('9999999999');

  // Checkout Execution State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [createdOrder, setCreatedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [settledResult, setSettledResult] = useState(null);

  const subtotal = items.reduce((sum, item) => sum + item.unit_price * item.quantity, 0);
  const finalAmount = Math.max(0, subtotal - discountAmount);
  const discountPct = subtotal > 0 ? ((discountAmount / subtotal) * 100).toFixed(2) : 0;

  const handleInitiateOrder = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. Validate with Policy Engine
      const policyRes = await validatePolicy({
        original_amount: subtotal,
        proposed_discount: discountAmount,
        action: 'create_offer'
      });

      if (!policyRes.data.passed) {
        setError(`Policy Engine Block: ${policyRes.data.reason}`);
        setLoading(false);
        return;
      }

      // 2. Server-side Order Creation
      const orderPayload = {
        session_id: `sess_direct_${Date.now()}`,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        items: items,
        discount_amount: discountAmount,
        bundle_name: 'Developer Starter Kit',
        is_bundle: true,
        approval_token: policyRes.data.approval_token
      };

      const res = await createCheckoutOrder(orderPayload);
      setCreatedOrder(res.data);
      setIsModalOpen(true);
    } catch (err) {
      console.error('Checkout initialization failed:', err);
      setError(err.response?.data?.detail || 'Failed to register order with Razorpay.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/30">
              FEATURE 9 — RAZORPAY SETTLEMENT
            </span>
            <span className="text-xs text-gray-400 font-mono">Official Test Mode APIs</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Checkout & Cryptographic Settlement
          </h2>
          <p className="text-xs text-gray-400 mt-1 max-w-2xl leading-relaxed">
            Secure server-side order generation, non-trust AI amount verification, and official Razorpay Test Mode checkout with backend HMAC-SHA256 signature validation.
          </p>
        </div>

        <Link
          to="/audit"
          className="px-3.5 py-2 rounded-xl bg-gray-850 hover:bg-gray-800 border border-gray-700 text-gray-300 text-xs font-medium flex items-center gap-2 self-start transition"
        >
          <FileSearch className="w-4 h-4 text-blue-400" />
          <span>Audit Log Viewer</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Cart & Buyer Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Cart Breakdown Card */}
          <div className="bg-[#111827]/80 border border-gray-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Basket Items for Settlement
                </h3>
              </div>
              <span className="text-xs font-mono text-emerald-400">2 Items Bundled</span>
            </div>

            <div className="space-y-3">
              {items.map((item, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-gray-900/60 border border-gray-800 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-white">{item.product_name}</h4>
                    <p className="text-[11px] text-gray-400 font-mono">
                      Product ID: {item.product_id} | Qty: {item.quantity}
                    </p>
                  </div>
                  <span className="font-mono text-sm font-bold text-white">
                    ₹{(item.unit_price * item.quantity).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Buyer Information Form */}
          <form onSubmit={handleInitiateOrder} className="bg-[#111827]/80 border border-gray-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-800 pb-3">
              <Lock className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Buyer Contact Details
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="text-gray-400 block mb-1">Customer Full Name</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2.5 text-white font-medium focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-gray-400 block mb-1">Email Address</label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2.5 text-white font-medium focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-gray-400 block mb-1">Contact Phone Number</label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2.5 text-white font-medium focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-950/30 border border-red-500/40 rounded-xl p-3.5 text-xs text-red-300 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold text-sm shadow-xl shadow-blue-500/25 flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <CreditCard className="w-4 h-4" />
                  <span>Initiate Razorpay Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Col: Order Summary & Policy Checks */}
        <div className="space-y-6">
          <div className="bg-[#111827] border border-blue-500/30 rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                Order Financial Summary
              </h4>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20">
                INR
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-gray-400">
                <span>Subtotal (2 Items):</span>
                <span className="font-mono text-gray-200">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-emerald-400 font-medium">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> Bundle Discount ({discountPct}%):
                </span>
                <span className="font-mono">-₹{discountAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="border-t border-gray-800 pt-3 flex justify-between items-baseline">
                <span className="text-sm font-bold text-white">Net Payable:</span>
                <span className="text-2xl font-bold text-blue-400 font-mono">
                  ₹{finalAmount.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Policy Check Badge */}
            <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-xs text-emerald-300 flex items-start gap-2.5">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Deterministic Policy Checked</span>
                <span className="text-[11px] text-gray-300">
                  ₹{discountAmount} ({discountPct}%) is compliant with the 10.0% merchant discount limit.
                </span>
              </div>
            </div>

            {/* Security Guarantee Note */}
            <div className="p-3 rounded-xl bg-gray-900/60 border border-gray-800 text-[11px] text-gray-400 leading-relaxed space-y-1">
              <span className="font-semibold text-gray-300 block">🔒 Security Architecture</span>
              <p>
                Amounts are strictly verified on the backend. Razorpay API secret keys are never exposed to client-side code.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Razorpay Modal */}
      <RazorpayCheckoutModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        orderData={createdOrder}
        onPaymentSuccess={(res) => setSettledResult(res)}
      />
    </div>
  );
}
