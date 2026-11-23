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
      <div className="max-w-md mx-auto py-20 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-[#1C222B] border border-[#2A3441] flex items-center justify-center text-[#F5A524] mx-auto shadow-md">
          <ShoppingCart className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-[#F8FAFC]">Sign In to View Your Cart</h2>
          <p className="text-xs text-[#94A3B8] leading-relaxed">
            Your shopping cart is securely synchronized to your account in real-time.
          </p>
        </div>
        <div className="flex justify-center gap-3">
          <Link
            to="/login"
            className="px-6 py-2.5 rounded-xl bg-[#F5A524] hover:bg-[#D97706] text-black font-semibold text-xs transition shadow-sm"
          >
            Sign In
          </Link>
          <Link
            to="/shop"
            className="px-6 py-2.5 rounded-xl bg-[#1C222B] hover:bg-[#242D38] border border-[#2A3441] text-[#F8FAFC] font-medium text-xs transition"
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
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#2A3441]">
        <div>
          <h1 className="text-2xl font-bold text-[#F8FAFC] tracking-tight">Shopping Cart</h1>
          <p className="text-xs text-[#94A3B8] mt-1 font-mono">
            {totalItemsCount} item{totalItemsCount === 1 ? '' : 's'} in your persistent database cart
          </p>
        </div>

        {items.length > 0 && (
          <button
            onClick={handleClear}
            className="text-xs text-[#EF4444] hover:underline flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear Cart
          </button>
        )}
      </div>

      {errorMsg && (
        <div className="p-3 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/30 text-xs text-[#EF4444] flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {loading && !cart ? (
        <div className="p-12 text-center text-xs text-[#94A3B8] rounded-2xl bg-[#1C222B] border border-[#2A3441] animate-pulse">
          Loading your cart items...
        </div>
      ) : items.length === 0 ? (
        <div className="py-20 text-center rounded-2xl bg-[#151A21] border border-[#2A3441] p-8 space-y-4">
          <PackageOpen className="w-14 h-14 text-[#64748B] mx-auto" />
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-[#F8FAFC]">Your cart is empty</h3>
            <p className="text-xs text-[#94A3B8] max-w-sm mx-auto">
              You haven't added any developer hardware yet. Check out our high-performance catalog.
            </p>
          </div>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#F5A524] hover:bg-[#D97706] text-black font-semibold text-xs transition shadow-sm mt-2"
          >
            <Store className="w-3.5 h-3.5" />
            Explore Hardware Catalog
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-3">
            {items.map((item) => (
              <div
                key={item.item_id || item.product_id}
                className="surface-card p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-[#151A21] border border-[#2A3441] flex items-center justify-center text-xs font-mono font-bold text-[#F5A524] shrink-0">
                    {item.product_id}
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-mono text-[#F5A524] bg-[#F5A524]/10 border border-[#F5A524]/20 px-1.5 py-0.5 rounded">
                      {item.category || 'Hardware'}
                    </span>
                    <h3 className="text-sm font-semibold text-[#F8FAFC] mt-1">
                      {item.name}
                    </h3>
                    <p className="text-xs text-[#94A3B8]">
                      ₹{item.unit_price.toLocaleString('en-IN', { minimumFractionDigits: 2 })} each
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-[#2A3441]">
                  {/* Quantity Control */}
                  <div className="flex items-center border border-[#2A3441] rounded-lg bg-[#151A21]">
                    <button
                      onClick={() => handleQtyChange(item.item_id, item.quantity, -1)}
                      disabled={updatingId === item.item_id}
                      className="p-1.5 text-[#94A3B8] hover:text-[#F8FAFC] disabled:opacity-50"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="px-3 py-1 text-xs font-mono font-bold text-[#F8FAFC]">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => handleQtyChange(item.item_id, item.quantity, 1)}
                      disabled={updatingId === item.item_id || (item.available_stock && item.quantity >= item.available_stock)}
                      className="p-1.5 text-[#94A3B8] hover:text-[#F8FAFC] disabled:opacity-50"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Total & Remove */}
                  <div className="text-right">
                    <p className="text-sm font-bold text-[#F8FAFC]">
                      ₹{(item.total_price || (item.unit_price * item.quantity)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </p>
                    <button
                      onClick={() => handleRemove(item.item_id)}
                      disabled={updatingId === item.item_id}
                      className="text-[11px] text-[#EF4444] hover:underline mt-0.5"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary & Checkout Card */}
          <div className="surface-card p-6 space-y-6">
            <h3 className="text-sm font-bold uppercase font-mono text-[#F8FAFC] tracking-wider pb-3 border-b border-[#2A3441]">
              Order Summary
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between text-[#94A3B8]">
                <span>Items Subtotal ({totalItemsCount} units)</span>
                <span className="font-mono text-[#F8FAFC]">
                  ₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between text-[#94A3B8]">
                <span>Estimated Shipping</span>
                <span className="font-mono text-[#10B981]">FREE (Promotional)</span>
              </div>
              <div className="flex justify-between text-[#94A3B8]">
                <span>Taxes & Duties</span>
                <span className="font-mono text-[#F8FAFC]">Included</span>
              </div>
              <div className="pt-3 border-t border-[#2A3441] flex justify-between items-baseline">
                <span className="text-sm font-bold text-[#F8FAFC]">Total Amount</span>
                <span className="text-xl font-black text-[#F5A524]">
                  ₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#151A21] border border-[#2A3441] text-[11px] text-[#94A3B8] space-y-1">
              <div className="flex items-center gap-1.5 text-[#10B981] font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Deterministic Policy Protected</span>
              </div>
              <p>Cryptographic Razorpay settlement with server-side paise verification.</p>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full py-3 rounded-xl bg-[#F5A524] hover:bg-[#D97706] text-black font-semibold text-xs transition shadow-amber-glow flex items-center justify-center gap-2"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <Link
              to="/shop"
              className="block text-center text-xs text-[#94A3B8] hover:text-[#F5A524] transition"
            >
              ← Continue Shopping
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
