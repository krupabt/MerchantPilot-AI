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
      <div className="max-w-xl mx-auto py-12 text-center space-y-5 surface-card p-8">
        <div className="w-14 h-14 rounded-full bg-[#EAEDE7] border border-[#DEE3DC] flex items-center justify-center text-[#347A52] mx-auto shadow-xs">
          <CheckCircle2 className="w-7 h-7" />
        </div>

        <div className="space-y-1.5">
          <span className="text-[11px] font-mono uppercase text-[#347A52] bg-[#EAEDE7] border border-[#DEE3DC] px-2 py-0.5 rounded">
            Payment Verified & Settled
          </span>
          <h2 className="text-xl font-semibold text-[#202923]">Thank You for Your Order!</h2>
          <p className="text-xs text-[#6B746E] leading-relaxed">
            Your transaction has been cryptographically confirmed. Our warehouse team is preparing your hardware shipment.
          </p>
        </div>

        <div className="p-4 rounded-lg bg-[#F6F5F1] border border-[#DEE3DC] text-left text-xs font-mono space-y-2">
          <div className="flex justify-between">
            <span className="text-[#6B746E]">Order ID:</span>
            <span className="text-[#202923] font-bold">{orderConfirmed.order_id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#6B746E]">Payment ID:</span>
            <span className="text-[#347A52]">{orderConfirmed.razorpay_payment_id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#6B746E]">Amount Settled:</span>
            <span className="text-[#234E42] font-semibold">₹{orderConfirmed.amount_inr?.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#6B746E]">Delivery Destination:</span>
            <span className="text-[#202923] font-sans">{city}, {state} - {pincode}</span>
          </div>
        </div>

        <div className="flex justify-center gap-2.5 pt-2">
          <Link
            to="/orders"
            className="px-4 py-2 rounded-lg bg-[#234E42] hover:bg-[#1c3f35] text-white font-medium text-xs transition shadow-xs"
          >
            View in My Orders
          </Link>
          <Link
            to="/shop"
            className="px-4 py-2 rounded-lg bg-white hover:bg-[#F6F5F1] border border-[#DEE3DC] text-[#202923] font-medium text-xs transition"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div className="pb-3 border-b border-[#DEE3DC]">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-mono uppercase bg-[#EAEDE7] border border-[#DEE3DC] text-[#234E42] px-2 py-0.5 rounded font-medium">
            Razorpay Test Mode
          </span>
          <span className="text-xs text-[#6B746E] font-mono">HMAC-SHA256 Cryptographic Settlement</span>
        </div>
        <h1 className="text-xl font-semibold text-[#202923] tracking-tight">Checkout</h1>
        <p className="text-xs text-[#6B746E] mt-0.5">
          Review your items, provide shipping information, and complete payment.
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-[#FDF4F4] border border-[#DEE3DC] text-xs text-[#B94A48] flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleInitiateOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: Customer and Shipping Info */}
        <div className="lg:col-span-2 space-y-5">
          {/* Customer Contact */}
          <div className="surface-card p-5 space-y-4">
            <h3 className="text-xs font-semibold uppercase font-mono text-[#202923] flex items-center gap-2">
              <User className="w-4 h-4 text-[#234E42]" />
              <span>Contact Information</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
              <div>
                <label className="block text-[#6B746E] mb-1 font-medium">Full Name</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Aarav Sharma"
                  className="w-full bg-[#F6F5F1] border border-[#DEE3DC] text-[#202923] rounded-lg px-3 py-2 focus:outline-none focus:border-[#234E42]"
                />
              </div>

              <div>
                <label className="block text-[#6B746E] mb-1 font-medium">Email Address</label>
                <input
                  type="email"
                  required
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full bg-[#F6F5F1] border border-[#DEE3DC] text-[#202923] rounded-lg px-3 py-2 focus:outline-none focus:border-[#234E42]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[#6B746E] mb-1 font-medium">Mobile Phone (for Delivery SMS)</label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="9876543210"
                  className="w-full bg-[#F6F5F1] border border-[#DEE3DC] text-[#202923] rounded-lg px-3 py-2 focus:outline-none focus:border-[#234E42]"
                />
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="surface-card p-5 space-y-4">
            <h3 className="text-xs font-semibold uppercase font-mono text-[#202923] flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#234E42]" />
              <span>Shipping Address</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[#6B746E] mb-1 font-medium">Street Address</label>
                <input
                  type="text"
                  required
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="Street and number"
                  className="w-full bg-[#F6F5F1] border border-[#DEE3DC] text-[#202923] rounded-lg px-3 py-2 focus:outline-none focus:border-[#234E42]"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[#6B746E] mb-1 font-medium">City</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-[#F6F5F1] border border-[#DEE3DC] text-[#202923] rounded-lg px-3 py-2 focus:outline-none focus:border-[#234E42]"
                  />
                </div>
                <div>
                  <label className="block text-[#6B746E] mb-1 font-medium">State</label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full bg-[#F6F5F1] border border-[#DEE3DC] text-[#202923] rounded-lg px-3 py-2 focus:outline-none focus:border-[#234E42]"
                  />
                </div>
                <div>
                  <label className="block text-[#6B746E] mb-1 font-medium">PIN Code</label>
                  <input
                    type="text"
                    required
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    className="w-full bg-[#F6F5F1] border border-[#DEE3DC] text-[#202923] rounded-lg px-3 py-2 focus:outline-none focus:border-[#234E42]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Items Summary in Left Column */}
          <div className="surface-card p-5 space-y-3">
            <h3 className="text-xs font-semibold uppercase font-mono text-[#202923]">
              Order Items ({items.length})
            </h3>
            <div className="divide-y divide-[#DEE3DC] text-xs">
              {items.map((it) => (
                <div key={it.product_id} className="py-2.5 flex items-center justify-between">
                  <div>
                    <span className="font-medium text-[#202923]">{it.product_name}</span>
                    <span className="text-[#6B746E] block text-[11px]">Qty: {it.quantity} × ₹{it.unit_price?.toLocaleString('en-IN')}</span>
                  </div>
                  <span className="font-semibold text-[#202923]">
                    ₹{(it.unit_price * it.quantity).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary & Settlement */}
        <div className="surface-card p-5 space-y-5">
          <h3 className="text-xs font-semibold uppercase font-mono text-[#202923] tracking-wider pb-2 border-b border-[#DEE3DC]">
            Payment Summary
          </h3>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between text-[#6B746E]">
              <span>Subtotal</span>
              <span className="font-mono text-[#202923]">
                ₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-[#347A52]">
                <span>Policy Approved Savings</span>
                <span className="font-mono">-₹{discountAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            )}
            <div className="flex justify-between text-[#6B746E]">
              <span>Delivery</span>
              <span className="font-mono text-[#347A52]">FREE</span>
            </div>
            <div className="pt-2.5 border-t border-[#DEE3DC] flex justify-between items-baseline">
              <span className="text-xs font-semibold text-[#202923]">Total Payable</span>
              <span className="text-xl font-bold text-[#234E42]">
                ₹{finalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-[#EAEDE7]/60 border border-[#DEE3DC] space-y-1.5 text-[11px] text-[#6B746E]">
            <div className="flex items-center gap-1.5 text-[#347A52] font-semibold">
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
            className="w-full py-2.5 rounded-lg bg-[#234E42] hover:bg-[#1c3f35] text-white font-medium text-xs transition shadow-xs flex items-center justify-center gap-2 disabled:opacity-50"
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
