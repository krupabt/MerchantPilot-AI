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
  Store
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { clearCustomerCart } from '../services/api';

function formatINR(val) {
  if (val == null || isNaN(val)) return '₹0';
  const num = Number(val);
  return num % 1 === 0
    ? `₹${num.toLocaleString('en-IN')}`
    : `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

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
      <div className="max-w-md mx-auto py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-white border border-[#E8E2DA] flex items-center justify-center text-[#783F45] mx-auto shadow-sm">
          <ShoppingCart className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="font-heading text-xl font-bold text-[#242424]">Sign In to View Your Cart</h2>
          <p className="text-xs sm:text-sm text-[#6B6560] leading-relaxed">
            Your shopping cart is securely synchronized with live store inventory.
          </p>
        </div>
        <div className="flex justify-center gap-3">
          <Link
            to="/signin"
            className="px-5 py-2.5 rounded-xl bg-[#783F45] hover:bg-[#603137] text-white font-semibold text-xs transition shadow-sm"
          >
            Sign In
          </Link>
          <Link
            to="/shop"
            className="px-5 py-2.5 rounded-xl bg-white hover:bg-[#F8F4EE] border border-[#E8E2DA] text-[#242424] font-semibold text-xs transition"
          >
            Browse Products
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8E2DA]">
        <div>
          <h1 className="font-heading text-2xl font-bold text-[#242424] tracking-tight">Shopping Cart</h1>
          <p className="text-xs text-[#6B6560] mt-1 tabular-numbers">
            {totalItemsCount} item{totalItemsCount === 1 ? '' : 's'} in your order
          </p>
        </div>

        {items.length > 0 && (
          <button
            onClick={handleClear}
            className="text-xs text-[#B84040] hover:underline flex items-center gap-1.5 self-start sm:self-auto font-medium"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear Cart
          </button>
        )}
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-[#B84040] flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {loading && !cart ? (
        <div className="p-12 text-center text-xs text-[#6B6560] bg-white border border-[#E8E2DA] rounded-2xl animate-pulse">
          Loading your cart items...
        </div>
      ) : items.length === 0 ? (
        <div className="py-16 text-center bg-white border border-[#E8E2DA] rounded-2xl p-8 space-y-4 shadow-sm">
          <PackageOpen className="w-12 h-12 text-[#6B6560] mx-auto opacity-50" />
          <div className="space-y-1">
            <h3 className="font-heading text-base font-bold text-[#242424]">Your cart is empty</h3>
            <p className="text-xs text-[#6B6560] max-w-sm mx-auto">
              Explore our curated accessories catalog with guaranteed stock and rapid dispatch.
            </p>
          </div>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#783F45] hover:bg-[#603137] text-white font-semibold text-xs transition shadow-sm mt-2"
          >
            <Store className="w-3.5 h-3.5" />
            Explore Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-3">
            {items.map((item) => (
              <div
                key={item.item_id || item.product_id}
                className="bg-white border border-[#E8E2DA] rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm hover:border-[#D8C3A5] transition"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-14 h-14 rounded-xl bg-[#F8F4EE] border border-[#E8E2DA] flex items-center justify-center p-1.5 shrink-0 overflow-hidden">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        onError={(e) => { e.target.onerror = null; e.target.src = '/images/products/placeholder.webp'; }}
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : (
                      <ShoppingCart className="w-6 h-6 text-[#783F45]" />
                    )}
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-[#6B6560] bg-[#F8F4EE] border border-[#E8E2DA] px-2 py-0.5 rounded-full">
                      {item.category || 'Accessories'}
                    </span>
                    <h3 className="text-xs sm:text-sm font-semibold text-[#242424] mt-1 line-clamp-1">
                      {item.name}
                    </h3>
                    <p className="text-[11px] text-[#6B6560] tabular-numbers font-medium">
                      {formatINR(item.unit_price)} each
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-5 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-[#E8E2DA]">
                  {/* Quantity Control */}
                  <div className="flex items-center border border-[#E8E2DA] rounded-xl bg-[#F8F4EE]">
                    <button
                      onClick={() => handleQtyChange(item.item_id, item.quantity, -1)}
                      disabled={updatingId === item.item_id}
                      className="px-2.5 py-1 text-xs text-[#6B6560] hover:text-[#242424] disabled:opacity-50"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="px-2.5 py-1 text-xs font-semibold text-[#242424] tabular-numbers">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => handleQtyChange(item.item_id, item.quantity, 1)}
                      disabled={updatingId === item.item_id || (item.available_stock && item.quantity >= item.available_stock)}
                      className="px-2.5 py-1 text-xs text-[#6B6560] hover:text-[#242424] disabled:opacity-50"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Total & Remove */}
                  <div className="text-right">
                    <p className="text-xs sm:text-sm font-bold text-[#242424] tabular-numbers font-heading">
                      {formatINR(item.total_price || (item.unit_price * item.quantity))}
                    </p>
                    <button
                      onClick={() => handleRemove(item.item_id)}
                      disabled={updatingId === item.item_id}
                      className="text-[11px] text-[#B84040] hover:underline mt-0.5 font-medium"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary & Checkout Card */}
          <div className="bg-white border border-[#E8E2DA] rounded-2xl p-6 space-y-5 shadow-sm">
            <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-[#242424] pb-3 border-b border-[#E8E2DA]">
              Order Summary
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between text-[#6B6560]">
                <span>Items Subtotal ({totalItemsCount} units)</span>
                <span className="text-[#242424] font-medium tabular-numbers">
                  {formatINR(subtotal)}
                </span>
              </div>
              <div className="flex justify-between text-[#6B6560]">
                <span>Standard Delivery</span>
                <span className="text-[#32734D] font-semibold">FREE</span>
              </div>
              <div className="flex justify-between text-[#6B6560]">
                <span>Taxes & GST</span>
                <span className="text-[#242424] font-medium">Included</span>
              </div>
              <div className="pt-3 border-t border-[#E8E2DA] flex justify-between items-baseline">
                <span className="text-xs font-semibold text-[#242424]">Total Payable</span>
                <span className="text-xl font-bold text-[#783F45] tabular-numbers font-heading">
                  {formatINR(subtotal)}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#F8F4EE] border border-[#E8E2DA] text-[11px] text-[#6B6560] space-y-1">
              <div className="flex items-center gap-1.5 text-[#32734D] font-semibold">
                <ShieldCheck className="w-4 h-4" />
                <span>Verified Checkout</span>
              </div>
              <p>Cryptographic Razorpay settlement with server-side validation.</p>
            </div>

            <button
              onClick={() => navigate('/shop/checkout')}
              className="w-full py-3 rounded-xl bg-[#783F45] hover:bg-[#603137] text-white font-semibold text-xs transition shadow-sm flex items-center justify-center gap-2"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <Link
              to="/shop"
              className="block text-center text-xs text-[#6B6560] hover:text-[#783F45] transition font-medium"
            >
              ← Continue Shopping
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
