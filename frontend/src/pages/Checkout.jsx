import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  CreditCard,
  Lock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  User,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';
import RazorpayCheckoutModal from '../components/RazorpayCheckoutModal';
import { createCheckoutOrder, validatePolicy, getCustomerCart, clearCustomerCart } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

function formatINR(val) {
  if (val == null || isNaN(val)) return '₹0';
  const num = Number(val);
  return num % 1 === 0
    ? `₹${num.toLocaleString('en-IN')}`
    : `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

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
  const [street, setStreet] = useState('100 Commercial Street, MG Road');
  const [city, setCity] = useState('Bengaluru');
  const [state, setState] = useState('Karnataka');
  const [pincode, setPincode] = useState('560001');

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
              { product_id: 'P001', product_name: 'USB Cable', quantity: 1, unit_price: 120.0 }
            ]);
          }
        })
        .catch(() => {
          setItems([
            { product_id: 'P001', product_name: 'USB Cable', quantity: 1, unit_price: 120.0 }
          ]);
        });
    } else {
      setItems([
        { product_id: 'P001', product_name: 'USB Cable', quantity: 1, unit_price: 120.0 }
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
        shipping_address: {
          street,
          city,
          state,
          postal_code: pincode,
          pincode,
          phone: customerPhone
        },
        items: items,
        discount_amount: discountAmount,
        bundle_name: items.length > 1 ? 'Customer Package' : 'Retail Order',
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
      <div className="max-w-xl mx-auto py-12 text-center space-y-6 bg-white border border-[#E8E2DA] rounded-2xl p-8 shadow-sm">
        <div className="w-16 h-16 rounded-full bg-[#F8F4EE] border border-[#E8E2DA] flex items-center justify-center text-[#32734D] mx-auto shadow-sm">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-[11px] font-semibold uppercase text-[#32734D] bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
            Payment Verified & Settled
          </span>
          <h2 className="font-heading text-2xl font-bold text-[#242424]">Thank You for Your Order!</h2>
          <p className="text-xs sm:text-sm text-[#6B6560] leading-relaxed">
            Your payment has been cryptographically confirmed. Our warehouse team is preparing your dispatch.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[#F8F4EE] border border-[#E8E2DA] text-left text-xs space-y-2.5">
          <div className="flex justify-between">
            <span className="text-[#6B6560]">Order ID:</span>
            <span className="text-[#242424] font-bold font-mono">{orderConfirmed.order_id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#6B6560]">Payment ID:</span>
            <span className="text-[#32734D] font-mono">{orderConfirmed.razorpay_payment_id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#6B6560]">Amount Settled:</span>
            <span className="text-[#783F45] font-bold tabular-numbers">{formatINR(orderConfirmed.amount_inr)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#6B6560]">Delivery Destination:</span>
            <span className="text-[#242424]">{city}, {state} - {pincode}</span>
          </div>
        </div>

        <div className="flex justify-center gap-3 pt-2">
          <Link
            to="/shop/orders"
            className="px-5 py-2.5 rounded-xl bg-[#783F45] hover:bg-[#603137] text-white font-semibold text-xs transition shadow-sm"
          >
            View in My Orders
          </Link>
          <Link
            to="/shop"
            className="px-5 py-2.5 rounded-xl bg-white hover:bg-[#F8F4EE] border border-[#E8E2DA] text-[#242424] font-semibold text-xs transition"
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
      <div className="pb-4 border-b border-[#E8E2DA]">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-[10px] font-semibold uppercase bg-[#F8F4EE] border border-[#E8E2DA] text-[#783F45] px-2.5 py-0.5 rounded-full">
            Razorpay Test Mode
          </span>
          <span className="text-xs text-[#6B6560]">HMAC-SHA256 Cryptographic Settlement</span>
        </div>
        <h1 className="font-heading text-2xl font-bold text-[#242424] tracking-tight">Checkout</h1>
        <p className="text-xs text-[#6B6560] mt-1">
          Review your order, enter delivery destination, and complete instant settlement.
        </p>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-[#B84040] flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleInitiateOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: Customer and Shipping Info */}
        <div className="lg:col-span-2 space-y-5">
          {/* Customer Contact */}
          <div className="bg-white border border-[#E8E2DA] rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm">
            <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-[#242424] flex items-center gap-2">
              <User className="w-4 h-4 text-[#783F45]" />
              <span>Contact Information</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-[#6B6560] mb-1 font-medium">Full Name</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Aarav Sharma"
                  className="w-full bg-[#F8F4EE] border border-[#E8E2DA] text-[#242424] rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#783F45] transition"
                />
              </div>

              <div>
                <label className="block text-[#6B6560] mb-1 font-medium">Email Address</label>
                <input
                  type="email"
                  required
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-[#F8F4EE] border border-[#E8E2DA] text-[#242424] rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#783F45] transition"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[#6B6560] mb-1 font-medium">Mobile Phone (for Delivery SMS)</label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="9876543210"
                  className="w-full bg-[#F8F4EE] border border-[#E8E2DA] text-[#242424] rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#783F45] transition"
                />
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white border border-[#E8E2DA] rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm">
            <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-[#242424] flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#783F45]" />
              <span>Delivery Address</span>
            </h3>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-[#6B6560] mb-1 font-medium">Street Address</label>
                <input
                  type="text"
                  required
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="Flat / House No., Building, Street"
                  className="w-full bg-[#F8F4EE] border border-[#E8E2DA] text-[#242424] rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#783F45] transition"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[#6B6560] mb-1 font-medium">City</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-[#F8F4EE] border border-[#E8E2DA] text-[#242424] rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#783F45] transition"
                  />
                </div>
                <div>
                  <label className="block text-[#6B6560] mb-1 font-medium">State</label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full bg-[#F8F4EE] border border-[#E8E2DA] text-[#242424] rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#783F45] transition"
                  />
                </div>
                <div>
                  <label className="block text-[#6B6560] mb-1 font-medium">PIN Code</label>
                  <input
                    type="text"
                    required
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    className="w-full bg-[#F8F4EE] border border-[#E8E2DA] text-[#242424] rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#783F45] transition"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Items Summary in Left Column */}
          <div className="bg-white border border-[#E8E2DA] rounded-2xl p-5 sm:p-6 space-y-3 shadow-sm">
            <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-[#242424]">
              Order Items ({items.length})
            </h3>
            <div className="divide-y divide-[#E8E2DA] text-xs">
              {items.map((it, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-[#242424]">{it.product_name}</span>
                    <span className="text-[#6B6560] block text-[11px] tabular-numbers mt-0.5">
                      Qty: {it.quantity} × {formatINR(it.unit_price)}
                    </span>
                  </div>
                  <span className="font-bold text-[#242424] tabular-numbers font-heading">
                    {formatINR(it.unit_price * it.quantity)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary & Settlement */}
        <div className="bg-white border border-[#E8E2DA] rounded-2xl p-6 space-y-5 shadow-sm">
          <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-[#242424] pb-3 border-b border-[#E8E2DA]">
            Payment Summary
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between text-[#6B6560]">
              <span>Subtotal</span>
              <span className="text-[#242424] font-medium tabular-numbers">
                {formatINR(subtotal)}
              </span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-[#32734D]">
                <span>Promotional Discount</span>
                <span className="font-medium tabular-numbers">-{formatINR(discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-[#6B6560]">
              <span>Standard Delivery</span>
              <span className="text-[#32734D] font-semibold">FREE</span>
            </div>
            <div className="pt-3 border-t border-[#E8E2DA] flex justify-between items-baseline">
              <span className="text-xs font-semibold text-[#242424]">Total Payable</span>
              <span className="text-xl font-bold text-[#783F45] tabular-numbers font-heading">
                {formatINR(finalAmount)}
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#F8F4EE] border border-[#E8E2DA] space-y-1 text-[11px] text-[#6B6560]">
            <div className="flex items-center gap-1.5 text-[#32734D] font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>Razorpay Test Mode Ready</span>
            </div>
            <p>
              Server-side authorization with instant callback verification.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || items.length === 0}
            className="w-full py-3 rounded-xl bg-[#783F45] hover:bg-[#603137] text-white font-semibold text-xs transition shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Lock className="w-4 h-4" />
            <span>{loading ? 'Registering with Razorpay...' : 'Pay with Razorpay'}</span>
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
