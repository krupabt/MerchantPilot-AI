import React, { useState } from 'react';
import { CreditCard, CheckCircle2, ShieldCheck, AlertCircle, Sparkles, ExternalLink, Lock, Info, X } from 'lucide-react';
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
      theme: { color: '#234E42' },
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white border border-[#DEE3DC] rounded-xl max-w-lg w-full p-6 shadow-xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#DEE3DC] pb-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-[#EAEDE7] border border-[#DEE3DC] flex items-center justify-center text-[#234E42] shadow-xs">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[#202923]">Razorpay Checkout</h3>
              <p className="text-xs text-[#6B746E] font-mono">Order: {orderData.order_id}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-medium border ${
              keysConfigured
                ? 'bg-[#EAEDE7] text-[#234E42] border-[#DEE3DC]'
                : 'bg-[#FEF8F1] text-[#B77932] border-[#DEE3DC]'
            }`}>
              {keysConfigured ? 'TEST MODE' : 'DEMO MODE'}
            </span>
            <button
              onClick={onClose}
              className="text-[#6B746E] hover:text-[#202923] p-1 rounded-lg hover:bg-[#F6F5F1] transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Success State */}
        {verificationResult ? (
          <div className="space-y-4 py-2 text-center">
            <div className="w-14 h-14 rounded-full bg-[#EAEDE7] border border-[#DEE3DC] text-[#347A52] flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-[#202923]">Payment Verified!</h4>
              <p className="text-xs text-[#6B746E] mt-0.5">
                {keysConfigured ? 'HMAC-SHA256 signature verified server-side.' : 'Demo payment processed successfully.'}
              </p>
            </div>
            <div className="bg-[#F6F5F1] rounded-lg p-3.5 border border-[#DEE3DC] text-left space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-[#6B746E]">Status:</span>
                <span className="text-[#347A52] font-semibold font-mono">PAID ✓</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B746E]">Payment ID:</span>
                <span className="text-[#202923] font-mono">{verificationResult.razorpay_payment_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B746E]">Amount:</span>
                <span className="text-[#234E42] font-semibold font-mono">₹{verificationResult.amount_inr?.toLocaleString('en-IN')}</span>
              </div>
              {verificationResult.audit_event_id && (
                <div className="flex justify-between border-t border-[#DEE3DC] pt-1.5">
                  <span className="text-[#6B746E]">Audit ID:</span>
                  <span className="text-[#202923] font-mono">{verificationResult.audit_event_id}</span>
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              className="w-full px-4 py-2 rounded-lg bg-[#234E42] hover:bg-[#1c3f35] text-white font-medium text-xs transition shadow-xs"
            >
              Done
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Amount Summary */}
            <div className="bg-[#F6F5F1] rounded-lg p-3.5 border border-[#DEE3DC] flex items-center justify-between">
              <div>
                <span className="text-xs text-[#6B746E] block">Total Payable</span>
                <span className="text-xl font-bold text-[#202923] font-mono">
                  ₹{orderData.amount_inr?.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs text-[#347A52] block font-medium">Savings: ₹{orderData.discount_amount?.toLocaleString('en-IN')}</span>
                <span className="text-[11px] text-[#8C958E] font-mono">INR</span>
              </div>
            </div>

            {/* Demo mode notice */}
            {isDemoMode && (
              <div className="bg-[#FEF8F1] border border-[#DEE3DC] rounded-lg p-3 text-xs text-[#B77932] flex items-start gap-2">
                <Info className="w-4 h-4 text-[#B77932] shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block text-[#202923]">Demo Mode — Keys not configured</span>
                  <span className="text-[11px] text-[#6B746E]">
                    Simulate a completed payment below or add live test keys to <code className="text-[#202923] font-mono">backend/.env</code>.
                  </span>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-[#FDF4F4] border border-[#DEE3DC] rounded-lg p-3 text-xs text-[#B94A48] flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-[#B94A48] shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-2.5">
              {/* Real Razorpay popup */}
              {keysConfigured && (
                <button
                  type="button"
                  onClick={launchRazorpayCheckout}
                  disabled={verifying}
                  className="w-full px-4 py-2.5 rounded-lg bg-[#234E42] hover:bg-[#1c3f35] text-white font-medium text-xs shadow-xs flex items-center justify-center gap-2 transition disabled:opacity-50"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Pay with Razorpay</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                </button>
              )}

              {/* Demo simulated payment */}
              <button
                type="button"
                onClick={handleDemoPayment}
                disabled={verifying}
                className={`w-full px-4 py-2.5 rounded-lg font-medium text-xs flex items-center justify-center gap-2 transition disabled:opacity-50 ${
                  isDemoMode
                    ? 'bg-[#234E42] hover:bg-[#1c3f35] text-white shadow-xs'
                    : 'border border-[#DEE3DC] bg-white hover:bg-[#F6F5F1] text-[#234E42]'
                }`}
              >
                {verifying ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{isDemoMode ? 'Simulate Test Payment' : 'Direct Test Mode (Skip Popup)'}</span>
                  </>
                )}
              </button>
            </div>

            <div className="pt-2 flex items-center justify-between text-[11px] text-[#6B746E] border-t border-[#DEE3DC]">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#347A52]" />
                Server-Side Signature Verification
              </span>
              <button onClick={onClose} className="hover:text-[#202923] transition">Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
