import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package, Receipt, CheckCircle2, Clock, Truck, RefreshCw,
  AlertCircle, ArrowRight, ShieldCheck, ChevronRight
} from 'lucide-react';
import { getCustomerOrders } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function CustomerOrders() {
  const { user, isAuthenticated } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

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
      <div className="max-w-md mx-auto py-20 text-center space-y-4 animate-fadeIn">
        <Package className="w-16 h-16 text-gray-600 mx-auto" />
        <h2 className="text-xl font-bold text-white">Sign In to View Orders</h2>
        <p className="text-xs text-gray-400">
          You must be logged in to view your past purchases and delivery tracking.
        </p>
        <Link
          to="/login"
          className="inline-block px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs transition"
        >
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
              PURCHASE HISTORY
            </span>
            <span className="text-xs text-gray-400 font-mono">Real-Time Fulfillment Ledger</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">My Orders</h2>
        </div>

        <button
          onClick={fetchOrders}
          className="px-3.5 py-2 rounded-xl bg-gray-900 hover:bg-gray-800 border border-gray-800 text-gray-300 text-xs font-medium flex items-center gap-2 self-start transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 bg-[#111827]/60 border border-gray-800 rounded-3xl space-y-4">
          <Receipt className="w-16 h-16 text-gray-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">No orders placed yet</h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            Once you complete a purchase via Razorpay Test Mode checkout, your full receipt and delivery updates will appear here.
          </p>
          <Link
            to="/store"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs transition"
          >
            <span>Start Shopping</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const isDelivered = order.fulfillment_status === 'DELIVERED';
            const isShipped = order.fulfillment_status === 'SHIPPED';
            const isProcessing = order.fulfillment_status === 'PROCESSING';

            return (
              <div
                key={order.id}
                className="bg-[#111827]/80 border border-gray-800 rounded-2xl p-5 space-y-4 hover:border-amber-500/30 transition shadow-lg"
              >
                {/* Order Top Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-800/80 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold text-white">
                      Order #{order.id}
                    </span>
                    <span className="text-[11px] text-gray-400">
                      {order.created_at ? new Date(order.created_at).toLocaleDateString('en-IN', {
                        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                      }) : ''}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Payment Status Badge */}
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        order.status === 'PAID'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}
                    >
                      {order.status}
                    </span>

                    {/* Fulfillment Status Badge */}
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        isDelivered
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : isShipped
                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          : isProcessing
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-gray-800 text-gray-400'
                      }`}
                    >
                      {order.fulfillment_status || 'UNFULFILLED'}
                    </span>
                  </div>
                </div>

                {/* Items in Order */}
                <div className="space-y-2">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400 font-mono">{item.quantity}x</span>
                        <span className="text-white font-medium">{item.product_name}</span>
                      </div>
                      <span className="text-gray-300 font-mono">
                        ₹{item.total_price?.toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Footer Breakdown */}
                <div className="flex items-center justify-between border-t border-gray-800/80 pt-3 text-xs">
                  <div className="text-[11px] text-gray-500 font-mono">
                    {order.payment?.razorpay_order_id ? (
                      <span>Razorpay: {order.payment.razorpay_order_id}</span>
                    ) : (
                      <span>Direct Settlement</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">Total Paid:</span>
                    <span className="text-base font-bold text-amber-400 font-mono">
                      ₹{order.final_amount?.toLocaleString('en-IN')}
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
