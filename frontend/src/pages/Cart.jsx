import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingCart, Trash2, Plus, Minus, ArrowRight, ShieldCheck,
  CreditCard, Sparkles, AlertTriangle, PackageOpen
} from 'lucide-react';
import {
  getCustomerCart, updateCustomerCartItem, removeCustomerCartItem, clearCustomerCart
} from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Cart() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchCart = async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await getCustomerCart();
      setCart(res.data);
    } catch (err) {
      console.error('Failed to load cart:', err);
      setErrorMsg('Failed to fetch your cart. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [isAuthenticated]);

  const handleUpdateQty = async (itemId, currentQty, delta) => {
    const newQty = currentQty + delta;
    setUpdatingId(itemId);
    setErrorMsg('');
    try {
      const res = await updateCustomerCartItem(itemId, newQty);
      setCart(res.data);
    } catch (err) {
      setErrorMsg(err.response?.data?.detail || 'Failed to update quantity');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemoveItem = async (itemId) => {
    setUpdatingId(itemId);
    try {
      const res = await removeCustomerCartItem(itemId);
      setCart(res.data);
    } catch (err) {
      setErrorMsg('Failed to remove item');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleClearCart = async () => {
    if (!window.confirm('Are you sure you want to clear your cart?')) return;
    try {
      const res = await clearCustomerCart();
      setCart(res.data);
    } catch (err) {
      setErrorMsg('Failed to clear cart');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-5 animate-fadeIn">
        <ShoppingCart className="w-16 h-16 text-gray-600 mx-auto" />
        <h2 className="text-2xl font-bold text-white">Your Cart is Waiting</h2>
        <p className="text-sm text-gray-400">
          Sign in to access your persistent shopping cart, saved items, and automated policy discounts.
        </p>
        <div className="flex justify-center gap-3">
          <Link
            to="/login"
            className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs shadow-lg shadow-amber-600/20 transition"
          >
            Sign In to Account
          </Link>
          <Link
            to="/store"
            className="px-6 py-2.5 rounded-xl bg-gray-900 hover:bg-gray-800 border border-gray-800 text-gray-300 font-medium text-xs transition"
          >
            Browse Storefront
          </Link>
        </div>
      </div>
    );
  }

  const items = cart?.items || [];
  const subtotal = cart?.subtotal || 0;

  return (
    <div className="space-y-6 animate-fadeIn max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
              CUSTOMER SHOPPING CART
            </span>
            <span className="text-xs text-gray-400 font-mono">Persistent Database Session</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Shopping Cart</h2>
        </div>

        {items.length > 0 && (
          <button
            onClick={handleClearCart}
            className="px-3 py-1.5 rounded-xl bg-gray-900 hover:bg-red-950/30 border border-gray-800 hover:border-red-500/30 text-gray-400 hover:text-red-400 text-xs font-medium flex items-center gap-1.5 transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Cart</span>
          </button>
        )}
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-950/40 border border-red-500/40 rounded-xl text-red-300 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 bg-[#111827]/60 border border-gray-800 rounded-3xl space-y-4">
          <PackageOpen className="w-16 h-16 text-gray-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">Your cart is empty</h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            Explore our developer laptops, monitors, and AI-native accessories to add them to your cart.
          </p>
          <Link
            to="/store"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs shadow-lg shadow-amber-600/20 transition"
          >
            <span>Explore Hardware Store</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div
                key={item.item_id}
                className="bg-[#111827]/80 border border-gray-800 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-gray-900 text-gray-400 border border-gray-800">
                      {item.product_id}
                    </span>
                    <span className="text-xs text-amber-400 font-semibold">{item.category}</span>
                  </div>
                  <h4 className="text-sm font-bold text-white">{item.name}</h4>
                  <span className="text-xs text-gray-400 font-mono">
                    ₹{item.unit_price?.toLocaleString('en-IN')} each
                  </span>
                </div>

                <div className="flex items-center justify-between w-full sm:w-auto gap-4 self-end sm:self-center">
                  {/* Quantity Controls */}
                  <div className="flex items-center gap-2 bg-gray-900 border border-gray-800 rounded-xl p-1">
                    <button
                      disabled={updatingId === item.item_id}
                      onClick={() => handleUpdateQty(item.item_id, item.quantity, -1)}
                      className="p-1 rounded text-gray-400 hover:text-white hover:bg-gray-800 transition disabled:opacity-30"
                      title="Decrease"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center text-xs font-mono font-bold text-white">
                      {item.quantity}
                    </span>
                    <button
                      disabled={updatingId === item.item_id || item.quantity >= item.available_stock}
                      onClick={() => handleUpdateQty(item.item_id, item.quantity, 1)}
                      className="p-1 rounded text-gray-400 hover:text-white hover:bg-gray-800 transition disabled:opacity-30"
                      title="Increase"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Line Total */}
                  <div className="text-right min-w-[90px]">
                    <span className="text-sm font-bold text-white font-mono block">
                      ₹{item.total_price?.toLocaleString('en-IN')}
                    </span>
                    <button
                      onClick={() => handleRemoveItem(item.item_id)}
                      className="text-[11px] text-gray-500 hover:text-red-400 transition"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary & Checkout Card */}
          <div className="bg-[#111827]/80 border border-gray-800 rounded-3xl p-6 space-y-5 h-fit shadow-xl">
            <h3 className="text-base font-bold text-white tracking-tight border-b border-gray-800 pb-3">
              Order Summary
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-gray-400">
                <span>Total Items</span>
                <span className="text-white font-mono">{cart.total_items} units</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Subtotal</span>
                <span className="text-white font-mono">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>GST (Estimated)</span>
                <span className="text-emerald-400 font-mono">Included</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Delivery</span>
                <span className="text-emerald-400 font-mono">FREE (Express)</span>
              </div>
            </div>

            <div className="border-t border-gray-800 pt-4 flex justify-between items-center">
              <div>
                <span className="text-xs text-gray-400 block">Total Due</span>
                <span className="text-2xl font-black text-amber-400 font-mono">
                  ₹{subtotal.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Checkout Button */}
            <Link
              to="/checkout"
              className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-600/25 transition"
            >
              <CreditCard className="w-4 h-4" />
              <span>Proceed to Razorpay Checkout</span>
            </Link>

            <div className="p-3 bg-gray-900/60 rounded-xl border border-gray-800/80 space-y-1 text-[11px] text-gray-400">
              <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Razorpay Test Mode Verified</span>
              </div>
              <p>Supports test cards, UPI, and mock netbanking without live debits.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
