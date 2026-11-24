import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight, 
  ShieldCheck,
  AlertTriangle, 
  PackageOpen,
  Store,
  CreditCard
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { clearCustomerCart } from '../services/api';

export default function Cart() {
  const { isAuthenticated } = useAuth();
  const { cart, loading, refreshCart, updateItemQty, removeItem } = useCart();
  const navigate = useNavigate();

  const [updatingId, setUpdatingId] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    refreshCart();
  }, []);

  const handleQtyChange = async (itemId, currentQty, delta) => {
    const newQty = currentQty + delta;
    if (newQty < 1) {
      handleRemove(itemId);
      return;
    }
    setUpdatingId(itemId);
    setErrorMsg('');
    try {
      await updateItemQty(itemId, newQty);
    } catch (err) {
      setErrorMsg(err.response?.data?.detail || 'Failed to update item quantity.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemove = async (itemId) => {
    setUpdatingId(itemId);
    setErrorMsg('');
    try {
      await removeItem(itemId);
    } catch (err) {
      setErrorMsg(err.response?.data?.detail || 'Failed to remove item.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleClear = async () => {
    if (!window.confirm('Clear all items from your cart?')) return;
    try {
      await clearCustomerCart();
      await refreshCart();
    } catch (err) {
      setErrorMsg('Failed to clear cart.');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-5">
        <div className="w-14 h-14 rounded-xl bg-[#EAEDE7] border border-[#DEE3DC] flex items-center justify-center text-[#234E42] mx-auto shadow-xs">
          <ShoppingCart className="w-6 h-6" />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-lg font-semibold text-[#202923]">Sign In to View Your Cart</h2>
          <p className="text-xs text-[#6B746E] leading-relaxed">
            Your shopping cart is securely synchronized to your account in real-time.
          </p>
        </div>
        <div className="flex justify-center gap-2.5">
          <Link
            to="/login"
            className="px-4 py-2 rounded-lg bg-[#234E42] hover:bg-[#1c3f35] text-white font-medium text-xs transition shadow-xs"
          >
            Sign In
          </Link>
          <Link
            to="/shop"
            className="px-4 py-2 rounded-lg bg-white hover:bg-[#F6F5F1] border border-[#DEE3DC] text-[#202923] font-medium text-xs transition"
          >
            Browse Hardware
          </Link>
        </div>
      </div>
    );
  }

  const items = cart?.items || [];
  const subtotal = cart?.subtotal || items.reduce((sum, item) => sum + (item.total_price || 0), 0);
  const totalItemsCount = cart?.total_items || items.reduce((sum, item) => sum + (item.quantity || 1), 0);

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#DEE3DC]">
        <div>
          <h1 className="text-xl font-semibold text-[#202923] tracking-tight">Shopping Cart</h1>
          <p className="text-xs text-[#6B746E] mt-0.5 font-mono">
            {totalItemsCount} item{totalItemsCount === 1 ? '' : 's'} in your database cart
          </p>
        </div>

        {items.length > 0 && (
          <button
            onClick={handleClear}
            className="text-xs text-[#B94A48] hover:underline flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear Cart
          </button>
        )}
      </div>

      {errorMsg && (
        <div className="p-3 rounded-lg bg-[#FDF4F4] border border-[#DEE3DC] text-xs text-[#B94A48] flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {loading && !cart ? (
        <div className="p-10 text-center text-xs text-[#6B746E] surface-card animate-pulse">
          Loading your cart items...
        </div>
      ) : items.length === 0 ? (
        <div className="py-16 text-center surface-card p-8 space-y-3">
          <PackageOpen className="w-12 h-12 text-[#8C958E] mx-auto" />
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-[#202923]">Your cart is empty</h3>
            <p className="text-xs text-[#6B746E] max-w-sm mx-auto">
              You haven't added any developer hardware yet. Check out our high-performance catalog.
            </p>
          </div>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#234E42] hover:bg-[#1c3f35] text-white font-medium text-xs transition shadow-xs mt-2"
          >
            <Store className="w-3.5 h-3.5" />
            Explore Hardware Catalog
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-2.5">
            {items.map((item) => (
              <div
                key={item.item_id || item.product_id}
                className="surface-card p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-[#F6F5F1] border border-[#DEE3DC] flex items-center justify-center text-xs font-mono font-medium text-[#234E42] shrink-0">
                    {item.product_id}
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-mono text-[#234E42] bg-[#EAEDE7] border border-[#DEE3DC] px-1.5 py-0.5 rounded">
                      {item.category || 'Hardware'}
                    </span>
                    <h3 className="text-xs font-semibold text-[#202923] mt-0.5">
                      {item.name}
                    </h3>
                    <p className="text-[11px] text-[#6B746E]">
                      ₹{item.unit_price.toLocaleString('en-IN', { minimumFractionDigits: 2 })} each
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-5 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-[#DEE3DC]">
                  {/* Quantity Control */}
                  <div className="flex items-center border border-[#DEE3DC] rounded-lg bg-[#F6F5F1]">
                    <button
                      onClick={() => handleQtyChange(item.item_id, item.quantity, -1)}
                      disabled={updatingId === item.item_id}
                      className="p-1 text-[#6B746E] hover:text-[#202923] disabled:opacity-50"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="px-2.5 py-0.5 text-xs font-mono font-semibold text-[#202923]">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => handleQtyChange(item.item_id, item.quantity, 1)}
                      disabled={updatingId === item.item_id || (item.available_stock && item.quantity >= item.available_stock)}
                      className="p-1 text-[#6B746E] hover:text-[#202923] disabled:opacity-50"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Total & Remove */}
                  <div className="text-right">
                    <p className="text-xs font-semibold text-[#202923]">
                      ₹{(item.total_price || (item.unit_price * item.quantity)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </p>
                    <button
                      onClick={() => handleRemove(item.item_id)}
                      disabled={updatingId === item.item_id}
                      className="text-[10px] text-[#B94A48] hover:underline mt-0.5"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary & Checkout Card */}
          <div className="surface-card p-5 space-y-5">
            <h3 className="text-xs font-semibold uppercase font-mono text-[#202923] tracking-wider pb-2 border-b border-[#DEE3DC]">
              Order Summary
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-[#6B746E]">
                <span>Items Subtotal ({totalItemsCount} units)</span>
                <span className="font-mono text-[#202923]">
                  ₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between text-[#6B746E]">
                <span>Estimated Shipping</span>
                <span className="font-mono text-[#347A52]">FREE</span>
              </div>
              <div className="flex justify-between text-[#6B746E]">
                <span>Taxes & Duties</span>
                <span className="font-mono text-[#202923]">Included</span>
              </div>
              <div className="pt-2.5 border-t border-[#DEE3DC] flex justify-between items-baseline">
                <span className="text-xs font-semibold text-[#202923]">Total Amount</span>
                <span className="text-lg font-bold text-[#234E42]">
                  ₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[#EAEDE7]/60 border border-[#DEE3DC] text-[11px] text-[#6B746E] space-y-1">
              <div className="flex items-center gap-1.5 text-[#347A52] font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Deterministic Policy Protected</span>
              </div>
              <p>Cryptographic Razorpay settlement with server-side paise verification.</p>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full py-2.5 rounded-lg bg-[#234E42] hover:bg-[#1c3f35] text-white font-medium text-xs transition shadow-xs flex items-center justify-center gap-2"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <Link
              to="/shop"
              className="block text-center text-xs text-[#6B746E] hover:text-[#234E42] transition"
            >
              ← Continue Shopping
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
