import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package, 
  Receipt, 
  RefreshCw,
  Store
} from 'lucide-react';
import { getCustomerOrders } from '../services/api';
import { useAuth } from '../context/AuthContext';

function formatINR(val) {
  if (val == null || isNaN(val)) return '₹0';
  const num = Number(val);
  return num % 1 === 0
    ? `₹${num.toLocaleString('en-IN')}`
    : `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function CustomerOrders() {
  const { isAuthenticated } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await getCustomerOrders();
      setOrders(res.data || []);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-5 bg-white border border-[#E8E2DA] rounded-2xl p-8 shadow-sm">
        <Package className="w-12 h-12 text-[#6B6560] mx-auto opacity-50" />
        <h2 className="font-heading text-xl font-bold text-[#242424]">Sign In to View Orders</h2>
        <p className="text-xs sm:text-sm text-[#6B6560] leading-relaxed">
          Please sign in to view your past purchases, invoices, and delivery tracking.
        </p>
        <Link
          to="/signin"
          className="inline-block px-5 py-2.5 rounded-xl bg-[#783F45] hover:bg-[#603137] text-white font-semibold text-xs transition shadow-sm"
        >
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8E2DA] pb-4">
        <div>
          <span className="text-[10px] font-semibold uppercase bg-[#F8F4EE] border border-[#E8E2DA] text-[#783F45] px-2.5 py-0.5 rounded-full">
            Order History
          </span>
          <h1 className="font-heading text-2xl font-bold text-[#242424] tracking-tight mt-1">My Orders</h1>
          <p className="text-xs text-[#6B6560] mt-0.5">
            Track fulfillment progress and review receipts for your past purchases.
          </p>
        </div>

        <button
          onClick={fetchOrders}
          className="px-3.5 py-2 rounded-xl bg-white hover:bg-[#F8F4EE] border border-[#E8E2DA] text-[#242424] text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto transition shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#6B6560]" />
          <span>Refresh</span>
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-[#6B6560] bg-white border border-[#E8E2DA] rounded-2xl animate-pulse">
          Loading your order history...
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 bg-white border border-[#E8E2DA] rounded-2xl p-8 space-y-4 shadow-sm">
          <Receipt className="w-12 h-12 text-[#6B6560] mx-auto opacity-50" />
          <div className="space-y-1">
            <h3 className="font-heading text-base font-bold text-[#242424]">No orders placed yet</h3>
            <p className="text-xs text-[#6B6560] max-w-sm mx-auto">
              Once you complete an order, your full itemized receipt and delivery tracking will appear here.
            </p>
          </div>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#783F45] hover:bg-[#603137] text-white font-semibold text-xs transition shadow-sm mt-2"
          >
            <Store className="w-3.5 h-3.5" />
            <span>Explore Products</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const isPaid = order.status === 'PAID';
            const isDelivered = order.fulfillment_status === 'DELIVERED';
            const isShipped = order.fulfillment_status === 'SHIPPED';
            const isProcessing = order.fulfillment_status === 'PROCESSING';

            return (
              <div
                key={order.id}
                className="bg-white border border-[#E8E2DA] rounded-2xl p-5 space-y-3.5 shadow-sm hover:border-[#D8C3A5] transition"
              >
                {/* Order Top Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E8E2DA] pb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold text-[#242424]">
                      #{order.id}
                    </span>
                    <span className="text-xs text-[#6B6560]">
                      {order.created_at ? new Date(order.created_at).toLocaleDateString('en-IN', {
                        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                      }) : ''}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Payment Status Badge */}
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                        isPaid
                          ? 'bg-emerald-50 text-[#32734D] border border-emerald-200'
                          : 'bg-amber-50 text-[#B77932] border border-amber-200'
                      }`}
                    >
                      {order.status}
                    </span>

                    {/* Fulfillment Status Badge */}
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                        isDelivered
                          ? 'bg-emerald-50 text-[#32734D] border border-emerald-200'
                          : isShipped
                          ? 'bg-[#F8F4EE] text-[#783F45] border border-[#E8E2DA]'
                          : isProcessing
                          ? 'bg-amber-50 text-[#B77932] border border-amber-200'
                          : 'bg-[#F8F4EE] text-[#6B6560] border border-[#E8E2DA]'
                      }`}
                    >
                      {order.fulfillment_status || 'UNFULFILLED'}
                    </span>
                  </div>
                </div>

                {/* Items in Order */}
                <div className="space-y-2">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs sm:text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-[#6B6560] font-medium tabular-numbers">{item.quantity}x</span>
                        <span className="text-[#242424] font-medium">{item.product_name}</span>
                      </div>
                      <span className="text-[#242424] font-bold tabular-numbers font-heading">
                        {formatINR(item.total_price)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Footer Breakdown */}
                <div className="flex items-center justify-between border-t border-[#E8E2DA] pt-3 text-xs">
                  <div className="text-[11px] text-[#6B6560]">
                    {order.payment?.razorpay_order_id ? (
                      <span className="font-mono">Razorpay: {order.payment.razorpay_order_id}</span>
                    ) : (
                      <span>Settlement Order</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#6B6560]">Total Amount:</span>
                    <span className="text-base font-bold text-[#783F45] tabular-numbers font-heading">
                      {formatINR(order.final_amount)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
