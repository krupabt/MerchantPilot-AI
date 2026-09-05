import React, { useState } from 'react';
import { CreditCard, CheckCircle2, ShieldCheck, AlertCircle, Sparkles, ExternalLink, Lock, Info } from 'lucide-react';
import { verifyRazorpayPayment } from '../services/api';

export default function RazorpayCheckoutModal({
  isOpen,
  onClose,
  orderData,
  onPaymentSuccess
}) {
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [error, setError] = useState(null);

  if (!isOpen || !orderData) return null;

  const keysConfigured = orderData.keys_configured === true;
  const isDemoMode = !keysConfigured;

  const verifyPaymentOnServer = async (orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature) => {
    setVerifying(true);
    setError(null);
    try {
      const res = await verifyRazorpayPayment({
        order_id: orderId,
        razorpay_order_id: razorpayOrderId,
        razorpay_payment_id: razorpayPaymentId,
        razorpay_signature: razorpaySignature
      });
      setVerificationResult(res.data);
      if (onPaymentSuccess) {
        onPaymentSuccess(res.data);
      }
    } catch (err) {
      console.error('Payment verification failed:', err);
      setError(err.response?.data?.detail || 'Payment verification failed. Please try again.');
    } finally {
      setVerifying(false);
    }
  };

  // Launch official Razorpay Standard Checkout popup (requires real test keys)
  const launchRazorpayCheckout = () => {
    setError(null);
    if (!keysConfigured) {
      setError('Real Razorpay Test Keys are not configured. Add your RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to backend/.env and restart the server.');
      return;
    }
    if (typeof window.Razorpay !== 'function') {
      setError('Razorpay SDK failed to load. Check your internet connection.');
      return;
    }
    const options = {
      key: orderData.key_id,
      amount: orderData.amount_paise,
      currency: orderData.currency || 'INR',
      name: orderData.merchant_name || 'MerchantPilot AI',
      description: orderData.description || 'Order Payment',
      order_id: orderData.razorpay_order_id,
      prefill: {
        name: orderData.customer_name || 'Test Buyer',
        email: orderData.customer_email || 'buyer@test.com',
        contact: orderData.customer_phone || '9999999999'
      },
      theme: { color: '#0284c7' },
      handler: async function (response) {
        await verifyPaymentOnServer(
          orderData.order_id,
          response.razorpay_order_id || orderData.razorpay_order_id,
          response.razorpay_payment_id,
          response.razorpay_signature
        );
      },
      modal: {
        ondismiss: function () {
          console.log('Razorpay checkout dismissed.');
        }
      }
    };
    try {
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setError('Failed to open Razorpay popup: ' + err.message);
    }
  };

  // Demo/simulated payment — works without real Razorpay keys (for testing/demos)
  const handleDemoPayment = async () => {
    const fakePayId = `pay_test_${Math.random().toString(36).substring(2, 12)}`;
    const fakeSig = `test_sig_${Math.random().toString(36).substring(2, 16)}`;
    await verifyPaymentOnServer(
      orderData.order_id,
      orderData.razorpay_order_id,
      fakePayId,
      fakeSig
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="bg-[#111827] border border-blue-500/30 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Razorpay Checkout</h3>
              <p className="text-xs text-gray-400 font-mono">Order: {orderData.order_id}</p>
            </div>
          </div>
          <span className={`px-2.5 py-1 rounded-full text-[11px] font-mono font-bold border ${
            keysConfigured
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
          }`}>
            {keysConfigured ? 'TEST MODE' : 'DEMO MODE'}
          </span>
        </div>

        {/* Success State */}
        {verificationResult ? (
          <div className="space-y-4 py-2 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-xl font-bold text-white">Payment Verified!</h4>
              <p className="text-xs text-gray-400 mt-1">
                {keysConfigured ? 'HMAC-SHA256 signature verified server-side.' : 'Demo payment processed successfully.'}
              </p>
            </div>
            <div className="bg-gray-900/80 rounded-xl p-4 border border-gray-800 text-left space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">Status:</span>
                <span className="text-emerald-400 font-bold font-mono">PAID ✓</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Payment ID:</span>
                <span className="text-gray-200 font-mono">{verificationResult.razorpay_payment_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Amount:</span>
                <span className="text-blue-400 font-bold font-mono">₹{verificationResult.amount_inr?.toLocaleString('en-IN')}</span>
              </div>
              {verificationResult.audit_event_id && (
                <div className="flex justify-between border-t border-gray-800 pt-2">
                  <span className="text-gray-400">Audit ID:</span>
                  <span className="text-gray-300 font-mono">{verificationResult.audit_event_id}</span>
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              className="w-full px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition"
            >
              Done
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Amount Summary */}
            <div className="bg-gray-900/70 rounded-xl p-4 border border-gray-800 flex items-center justify-between">
              <div>
                <span className="text-xs text-gray-400 block">Total Payable</span>
                <span className="text-2xl font-bold text-white font-mono">
                  ₹{orderData.amount_inr?.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs text-emerald-400 block">Savings: ₹{orderData.discount_amount?.toLocaleString('en-IN')}</span>
                <span className="text-[11px] text-gray-400 font-mono">INR</span>
              </div>
            </div>

            {/* Demo mode notice */}
            {isDemoMode && (
              <div className="bg-yellow-950/30 border border-yellow-500/30 rounded-xl p-3 text-xs text-yellow-300 flex items-start gap-2">
                <Info className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block">Demo Mode — Razorpay keys not configured</span>
                  <span className="text-[11px] text-gray-400">
                    Add real test keys to <code className="text-yellow-300 font-mono">backend/.env</code> to use the live Razorpay popup. Use "Demo Test Payment" below to simulate a successful payment.
                  </span>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-950/30 border border-red-500/40 rounded-xl p-3 text-xs text-red-300 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-3">
              {/* Real Razorpay popup — only shown when keys are configured */}
              {keysConfigured && (
                <button
                  type="button"
                  onClick={launchRazorpayCheckout}
                  disabled={verifying}
                  className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold text-sm shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition disabled:opacity-50"
                >
                  <Lock className="w-4 h-4" />
                  <span>Pay with Razorpay</span>
                  <ExternalLink className="w-4 h-4 opacity-70" />
                </button>
              )}

              {/* Demo simulated payment — always available */}
              <button
                type="button"
                onClick={handleDemoPayment}
                disabled={verifying}
                className={`w-full px-4 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition disabled:opacity-50 ${
                  isDemoMode
                    ? 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white shadow-lg shadow-blue-500/25'
                    : 'border border-gray-700 bg-gray-900 hover:bg-gray-800 text-blue-300 text-xs'
                }`}
              >
                {verifying ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-blue-400" />
                    <span>{isDemoMode ? 'Simulate Test Payment' : 'Direct Test Mode (Skip Popup)'}</span>
                  </>
                )}
              </button>
            </div>

            <div className="pt-1 flex items-center justify-between text-[11px] text-gray-500 border-t border-gray-800">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                Server-Side Signature Verification
              </span>
              <button onClick={onClose} className="hover:text-gray-300 transition">Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
