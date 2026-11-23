import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  CreditCard,
  Lock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ShoppingCart,
  User,
  Mail,
  Phone,
  MapPin,
  Building,
  Hash
} from 'lucide-react';
import RazorpayCheckoutModal from '../components/RazorpayCheckoutModal';
import { createCheckoutOrder, validatePolicy, getCustomerCart, clearCustomerCart } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Checkout() {
  const { user, isAuthenticated } = useAuth();
  const { refreshCart } = useCart();
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '9999999999');
  
  // Shipping Address
  const [street, setStreet] = useState('100 Tech Park Blvd, Suite 400');
  const [city, setCity] = useState('Bengaluru');
  const [state, setState] = useState('Karnataka');
  const [pincode, setPincode] = useState('560103');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [createdOrder, setCreatedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState(null);

  useEffect(() => {
    if (user) {
      if (user.name) setCustomerName(user.name);
      if (user.email) setCustomerEmail(user.email);
      if (user.phone) setCustomerPhone(user.phone);
    }

    if (isAuthenticated) {
      getCustomerCart()
        .then((res) => {
          const cartItems = res.data?.items || [];
          if (cartItems.length > 0) {
            const mapped = cartItems.map((it) => ({
              product_id: it.product_id,
              product_name: it.name,
              quantity: it.quantity,
              unit_price: it.unit_price
            }));
            setItems(mapped);
          } else {
            // Default sample item if cart was empty
            setItems([
              { product_id: 'P101', product_name: 'Apex ProBook 15 Developer Edition', quantity: 1, unit_price: 60000.0 }
            ]);
          }
        })
        .catch(() => {
          setItems([
            { product_id: 'P101', product_name: 'Apex ProBook 15 Developer Edition', quantity: 1, unit_price: 60000.0 }
          ]);
        });
    } else {
      setItems([
        { product_id: 'P101', product_name: 'Apex ProBook 15 Developer Edition', quantity: 1, unit_price: 60000.0 }
      ]);
    }
  }, [isAuthenticated, user]);

  const subtotal = items.reduce((sum, item) => sum + item.unit_price * item.quantity, 0);
  const finalAmount = Math.max(0, subtotal - discountAmount);

  const handleInitiateOrder = async (e) => {
    e.preventDefault();
    if (!customerName || !customerEmail || !customerPhone) {
      setError('Please provide complete customer name, email, and phone number.');
      return;
    }
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

      // 2. Server-side Order Creation in Paise
      const orderPayload = {
        session_id: `sess_checkout_${Date.now()}`,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        items: items,
        discount_amount: discountAmount,
        bundle_name: items.length > 1 ? 'Multi-Product Hardware Package' : 'Standard Hardware Order',
        is_bundle: items.length > 1,
        approval_token: policyRes.data.approval_token
      };

      const res = await createCheckoutOrder(orderPayload);
      setCreatedOrder(res.data);
      setIsModalOpen(true);
    } catch (err) {
      console.error('Checkout initialization failed:', err);
      setError(err.response?.data?.detail || 'Failed to initialize order with Razorpay.');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async (result) => {
    setOrderConfirmed(result);
    setIsModalOpen(false);
    try {
      await clearCustomerCart();
      await refreshCart();
    } catch (e) {
      console.error('Cart clear error after checkout:', e);
    }
  };

  if (orderConfirmed) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-[#10B981]/10 border border-[#10B981]/30 flex items-center justify-center text-[#10B981] mx-auto shadow-lg">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-[11px] font-mono uppercase text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded">
            Payment Verified & Settled
          </span>
          <h2 className="text-2xl font-bold text-[#F8FAFC]">Thank You for Your Order!</h2>
          <p className="text-xs text-[#94A3B8] leading-relaxed">
            Your transaction has been cryptographically confirmed. Our warehouse team is preparing your hardware shipment.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[#1C222B] border border-[#2A3441] text-left text-xs font-mono space-y-2">
          <div className="flex justify-between">
            <span className="text-[#94A3B8]">Order ID:</span>
            <span className="text-[#F8FAFC] font-bold">{orderConfirmed.order_id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#94A3B8]">Payment ID:</span>
            <span className="text-[#10B981]">{orderConfirmed.razorpay_payment_id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#94A3B8]">Amount Settled:</span>
            <span className="text-[#F5A524]">₹{orderConfirmed.amount_inr?.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#94A3B8]">Delivery Destination:</span>
            <span className="text-[#F8FAFC] font-sans">{city}, {state} - {pincode}</span>
          </div>
        </div>

        <div className="flex justify-center gap-3 pt-2">
          <Link
            to="/orders"
            className="px-6 py-2.5 rounded-xl bg-[#F5A524] hover:bg-[#D97706] text-black font-semibold text-xs transition"
          >
            View in My Orders
          </Link>
          <Link
            to="/shop"
            className="px-6 py-2.5 rounded-xl bg-[#1C222B] hover:bg-[#242D38] border border-[#2A3441] text-[#F8FAFC] font-medium text-xs transition"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="pb-4 border-b border-[#2A3441]">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-mono uppercase bg-[#F5A524]/10 border border-[#F5A524]/30 text-[#F5A524] px-2 py-0.5 rounded">
            Razorpay Test Mode
          </span>
          <span className="text-xs text-[#94A3B8] font-mono">HMAC-SHA256 Cryptographic Settlement</span>
        </div>
        <h1 className="text-2xl font-bold text-[#F8FAFC] tracking-tight">Checkout</h1>
        <p className="text-xs text-[#94A3B8] mt-1">
          Review your items, provide shipping information, and complete payment.
        </p>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/30 text-xs text-[#EF4444] flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleInitiateOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Customer and Shipping Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Contact */}
          <div className="surface-card p-6 space-y-4">
            <h3 className="text-xs font-bold uppercase font-mono text-[#F8FAFC] flex items-center gap-2">
              <User className="w-4 h-4 text-[#F5A524]" />
              <span>Contact Information</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-[#94A3B8] mb-1 font-medium">Full Name</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Aarav Sharma"
                  className="w-full bg-[#151A21] border border-[#2A3441] text-[#F8FAFC] rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#F5A524]"
                />
              </div>

              <div>
                <label className="block text-[#94A3B8] mb-1 font-medium">Email Address</label>
                <input
                  type="email"
                  required
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full bg-[#151A21] border border-[#2A3441] text-[#F8FAFC] rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#F5A524]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[#94A3B8] mb-1 font-medium">Mobile Phone (for Delivery SMS)</label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="9876543210"
                  className="w-full bg-[#151A21] border border-[#2A3441] text-[#F8FAFC] rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#F5A524]"
                />
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="surface-card p-6 space-y-4">
            <h3 className="text-xs font-bold uppercase font-mono text-[#F8FAFC] flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#F5A524]" />
              <span>Shipping Address</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[#94A3B8] mb-1 font-medium">Street Address</label>
                <input
                  type="text"
                  required
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="Street and number"
                  className="w-full bg-[#151A21] border border-[#2A3441] text-[#F8FAFC] rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#F5A524]"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[#94A3B8] mb-1 font-medium">City</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-[#151A21] border border-[#2A3441] text-[#F8FAFC] rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#F5A524]"
                  />
                </div>
                <div>
                  <label className="block text-[#94A3B8] mb-1 font-medium">State</label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full bg-[#151A21] border border-[#2A3441] text-[#F8FAFC] rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#F5A524]"
                  />
                </div>
                <div>
                  <label className="block text-[#94A3B8] mb-1 font-medium">PIN Code</label>
                  <input
                    type="text"
                    required
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    className="w-full bg-[#151A21] border border-[#2A3441] text-[#F8FAFC] rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#F5A524]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Items Summary in Left Column */}
          <div className="surface-card p-6 space-y-3">
            <h3 className="text-xs font-bold uppercase font-mono text-[#F8FAFC]">
              Order Items ({items.length})
            </h3>
            <div className="divide-y divide-[#2A3441] text-xs">
              {items.map((it) => (
                <div key={it.product_id} className="py-2.5 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-[#F8FAFC]">{it.product_name}</span>
                    <span className="text-[#94A3B8] block text-[11px]">Qty: {it.quantity} × ₹{it.unit_price?.toLocaleString('en-IN')}</span>
                  </div>
                  <span className="font-bold text-[#F8FAFC]">
                    ₹{(it.unit_price * it.quantity).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary & Settlement */}
        <div className="surface-card p-6 space-y-6">
          <h3 className="text-xs font-bold uppercase font-mono text-[#F8FAFC] tracking-wider pb-3 border-b border-[#2A3441]">
            Payment Summary
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between text-[#94A3B8]">
              <span>Subtotal</span>
              <span className="font-mono text-[#F8FAFC]">
                ₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-[#10B981]">
                <span>Policy Approved Savings</span>
                <span className="font-mono">-₹{discountAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            )}
            <div className="flex justify-between text-[#94A3B8]">
              <span>Delivery</span>
              <span className="font-mono text-[#10B981]">FREE Express</span>
            </div>
            <div className="pt-3 border-t border-[#2A3441] flex justify-between items-baseline">
              <span className="text-sm font-bold text-[#F8FAFC]">Total Payable</span>
              <span className="text-2xl font-black text-[#F5A524]">
                ₹{finalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#151A21] border border-[#2A3441] space-y-2 text-[11px] text-[#94A3B8]">
            <div className="flex items-center gap-1.5 text-[#10B981] font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Razorpay Test Mode Ready</span>
            </div>
            <p>
              Prices computed server-side in paise. Uses official test cards or instant test authorization.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || items.length === 0}
            className="w-full py-3.5 rounded-xl bg-[#F5A524] hover:bg-[#D97706] text-black font-semibold text-xs transition shadow-amber-glow flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>{loading ? 'Registering with Razorpay...' : 'Pay with Razorpay Test Mode'}</span>
          </button>
        </div>
      </form>

      {/* Modal */}
      {createdOrder && (
        <RazorpayCheckoutModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          orderData={createdOrder}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}
