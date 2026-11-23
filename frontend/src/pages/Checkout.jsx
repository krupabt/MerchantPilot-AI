import React, { useState, useEffect } from 'react';
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
  FileSearch,
  ShoppingCart,
  User,
  Mail,
  Phone
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import RazorpayCheckoutModal from '../components/RazorpayCheckoutModal';
import { createCheckoutOrder, validatePolicy, getCustomerCart, clearCustomerCart } from '../services/api';
import { useAuth } from '../context/AuthContext';

const DEFAULT_SAMPLE_ITEMS = [
  { product_id: 'P101', product_name: 'Apex ProBook 15 Developer Edition', quantity: 1, unit_price: 60000.0 },
  { product_id: 'P102', product_name: 'Apex Precision Wireless Mouse', quantity: 1, unit_price: 1000.0 }
];

export default function Checkout() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState(DEFAULT_SAMPLE_ITEMS);
  const [discountAmount, setDiscountAmount] = useState(501.0);
  const [customerName, setCustomerName] = useState(user?.name || 'Demo Buyer');
  const [customerEmail, setCustomerEmail] = useState(user?.email || 'buyer@merchantpilot.ai');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '9999999999');
  const [cartLoaded, setCartLoaded] = useState(false);

  // Checkout Execution State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [createdOrder, setCreatedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [settledResult, setSettledResult] = useState(null);

  useEffect(() => {
    if (user) {
      if (user.name) setCustomerName(user.name);
      if (user.email) setCustomerEmail(user.email);
      if (user.phone) setCustomerPhone(user.phone);
    }

    if (isAuthenticated) {
      getCustomerCart()
        .then((res) => {
          if (res.data?.items?.length > 0) {
            const mapped = res.data.items.map((it) => ({
              product_id: it.product_id,
              product_name: it.name,
              quantity: it.quantity,
              unit_price: it.unit_price
            }));
            setItems(mapped);
            // Default 5% compliant discount for cart checkout
            const cartSubtotal = res.data.subtotal || 0;
            setDiscountAmount(Math.round(cartSubtotal * 0.05));
            setCartLoaded(true);
          }
        })
        .catch((e) => console.error('Cart load error:', e));
    }
  }, [isAuthenticated, user]);

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
        bundle_name: cartLoaded ? 'Customer Cart Purchase' : 'Developer Starter Kit',
        is_bundle: items.length > 1,
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

  const handlePaymentSuccess = async (result) => {
    setSettledResult(result);
    setIsModalOpen(false);
    if (isAuthenticated && cartLoaded) {
      try {
        await clearCustomerCart();
      } catch (e) {
        console.error('Clear cart error:', e);
      }
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
              RAZORPAY TEST MODE SETTLEMENT
            </span>
            <span className="text-xs text-gray-400 font-mono">HMAC-SHA256 Signature Verification</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Checkout & Cryptographic Settlement
          </h2>
          <p className="text-xs text-gray-400 mt-1 max-w-2xl leading-relaxed">
            Secure server-side order generation, non-trust AI amount verification, and official Razorpay Test Mode checkout with backend signature validation.
          </p>
        </div>

        <Link
          to="/transactions"
          className="px-3.5 py-2 rounded-xl bg-gray-900 hover:bg-gray-800 border border-gray-800 text-gray-300 text-xs font-medium flex items-center gap-2 self-start transition"
        >
          <FileSearch className="w-4 h-4 text-amber-400" />
          <span>Settlement Ledger</span>
        </Link>
      </div>

      {cartLoaded && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-300 flex items-center gap-2">
          <ShoppingCart className="w-4 h-4 text-amber-400 shrink-0" />
          <span>Loaded items from your persistent shopping cart. Ready for Razorpay Test Mode checkout.</span>
        </div>
      )}

      {error && (
        <div className="bg-red-950/30 border border-red-500/40 rounded-xl p-4 text-xs text-red-300 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Customer & Items Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Details Form */}
          <div className="bg-[#111827]/80 border border-gray-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <User className="w-4 h-4 text-amber-400" />
              <span>Customer Checkout Information</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-gray-400 mb-1 font-medium">Customer Name *</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-gray-900 border border-gray-800 rounded-xl text-white focus:outline-none focus:border-amber-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1 font-medium">Customer Email *</label>
                <input
                  type="email"
                  required
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full px-3.5 py-2 bg-gray-900 border border-gray-800 rounded-xl text-white focus:outline-none focus:border-amber-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1 font-medium">Customer Phone</label>
                <input
                  type="text"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-3.5 py-2 bg-gray-900 border border-gray-800 rounded-xl text-white focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1 font-medium">Payment Mode</label>
                <div className="px-3.5 py-2 bg-gray-900/60 border border-gray-800 rounded-xl text-amber-400 font-mono text-xs flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Razorpay Test Mode (INR)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Items in Cart Table */}
          <div className="bg-[#111827]/80 border border-gray-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-amber-400" />
              <span>Verified Line Items ({items.length})</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-800 text-gray-500 text-[10px] uppercase font-mono">
                    <th className="pb-2">SKU</th>
                    <th className="pb-2">Product</th>
                    <th className="pb-2 text-center">Qty</th>
                    <th className="pb-2 text-right">Unit Price</th>
                    <th className="pb-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60 font-mono">
                  {items.map((it, idx) => (
                    <tr key={idx} className="hover:bg-gray-900/40">
                      <td className="py-2.5 font-bold text-gray-400">{it.product_id}</td>
                      <td className="py-2.5 font-sans font-medium text-white max-w-[200px] truncate">
                        {it.product_name}
                      </td>
                      <td className="py-2.5 text-center text-gray-300">{it.quantity}</td>
                      <td className="py-2.5 text-right text-gray-300">
                        ₹{it.unit_price?.toLocaleString('en-IN')}
                      </td>
                      <td className="py-2.5 text-right font-bold text-white">
                        ₹{(it.unit_price * it.quantity)?.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right: Pricing Breakdown & Checkout Trigger */}
        <div className="space-y-5">
          <div className="bg-[#111827] border border-amber-500/30 rounded-3xl p-6 shadow-2xl space-y-5 sticky top-24">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Settlement Summary
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                INR (Paise Exact)
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-gray-400">
                <span>Subtotal (Verified)</span>
                <span className="font-mono text-white">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-emerald-400 font-semibold">
                <span>Promotional Discount</span>
                <span className="font-mono">-₹{discountAmount.toLocaleString('en-IN')} ({discountPct}%)</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Goods & Service Tax</span>
                <span className="font-mono text-emerald-400">Included</span>
              </div>
              <div className="border-t border-gray-800 pt-3 flex justify-between items-center">
                <span className="text-sm font-bold text-white">Amount Due</span>
                <span className="text-2xl font-black text-amber-400 font-mono">
                  ₹{finalAmount.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Policy Check Pill */}
            <div className="p-3 bg-emerald-950/20 border border-emerald-500/30 rounded-xl flex items-center gap-2 text-xs text-emerald-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Compliant with 10% maximum discount guardrail.</span>
            </div>

            {/* Launch Checkout Button */}
            <button
              onClick={handleInitiateOrder}
              disabled={loading || items.length === 0}
              className="w-full py-3.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-lg shadow-amber-600/25 flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <CreditCard className="w-4 h-4" />
                  <span>Open Razorpay Test Checkout</span>
                </>
              )}
            </button>

            <div className="text-[11px] text-gray-500 text-center leading-relaxed">
              Opens the official Razorpay Test Mode checkout popup. Use test UPI, netbanking, or test card (e.g. 4000 0000 0000 1004).
            </div>
          </div>
        </div>
      </div>

      {/* Razorpay Test Mode Checkout Modal */}
      {isModalOpen && createdOrder && (
        <RazorpayCheckoutModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          orderData={createdOrder}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}

      {/* Settled Payment Success Banner */}
      {settledResult && (
        <div className="p-6 rounded-3xl bg-emerald-950/30 border border-emerald-500/40 space-y-3 animate-slideUp">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Payment Verified & Settled in Test Mode!</h3>
              <p className="text-xs text-emerald-300">
                Order #{settledResult.order_id} recorded in database ledger with HMAC-SHA256 verification.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-gray-300 pt-2">
            <span>Payment ID: <strong className="text-white">{settledResult.razorpay_payment_id}</strong></span>
            <span>Settled Amount: <strong className="text-emerald-400">₹{settledResult.amount_inr?.toLocaleString('en-IN')}</strong></span>
            <Link to="/orders" className="text-amber-400 hover:underline">
              View in My Orders →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
