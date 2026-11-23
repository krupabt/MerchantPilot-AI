import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package, 
  Receipt, 
  CheckCircle2, 
  Clock, 
  Truck, 
  RefreshCw,
  ArrowRight, 
  ShieldCheck, 
  Store
} from 'lucide-react';
import { getCustomerOrders } from '../services/api';
import { useAuth } from '../context/AuthContext';

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
      <div className="max-w-md mx-auto py-20 text-center space-y-4">
        <Package className="w-14 h-14 text-[#64748B] mx-auto" />
        <h2 className="text-xl font-bold text-[#F8FAFC]">Sign In to View Orders</h2>
        <p className="text-xs text-[#94A3B8]">
          You must be logged in to view your past purchases and shipment tracking updates.
        </p>
        <Link
          to="/login"
          className="inline-block px-5 py-2.5 rounded-xl bg-[#F5A524] hover:bg-[#D97706] text-black font-semibold text-xs transition shadow-sm"
        >
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2A3441] pb-4">
        <div>
          <span className="text-[10px] font-mono uppercase bg-[#F5A524]/10 border border-[#F5A524]/30 text-[#F5A524] px-2 py-0.5 rounded">
            Fulfillment Ledger
          </span>
          <h1 className="text-2xl font-bold text-[#F8FAFC] tracking-tight mt-1">My Orders</h1>
          <p className="text-xs text-[#94A3B8]">
            Track delivery progress and review receipts for your past purchases.
          </p>
        </div>

        <button
          onClick={fetchOrders}
          className="px-3.5 py-2 rounded-xl bg-[#1C222B] hover:bg-[#242D38] border border-[#2A3441] text-[#94A3B8] hover:text-[#F8FAFC] text-xs font-medium flex items-center gap-2 self-start sm:self-auto transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {loading ? (
        <div className="p-16 text-center text-xs text-[#94A3B8] rounded-2xl bg-[#1C222B] border border-[#2A3441] animate-pulse">
          Loading your order history...
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 bg-[#151A21] border border-[#2A3441] rounded-2xl p-8 space-y-4">
          <Receipt className="w-14 h-14 text-[#64748B] mx-auto" />
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-[#F8FAFC]">No orders placed yet</h3>
            <p className="text-xs text-[#94A3B8] max-w-sm mx-auto">
              Once you complete a purchase, your full itemized receipt and delivery tracking will appear here.
            </p>
          </div>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#F5A524] hover:bg-[#D97706] text-black font-semibold text-xs transition shadow-sm"
          >
            <Store className="w-3.5 h-3.5" />
            <span>Start Shopping</span>
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
                className="surface-card p-5 space-y-4 transition"
              >
                {/* Order Top Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#2A3441] pb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold text-[#F8FAFC]">
                      #{order.id}
                    </span>
                    <span className="text-[11px] text-[#94A3B8]">
                      {order.created_at ? new Date(order.created_at).toLocaleDateString('en-IN', {
                        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                      }) : ''}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Payment Status Badge */}
                    <span
                      className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                        isPaid
                          ? 'bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20'
                          : 'bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20'
                      }`}
                    >
                      {order.status}
                    </span>

                    {/* Fulfillment Status Badge */}
                    <span
                      className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                        isDelivered
                          ? 'bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20'
                          : isShipped
                          ? 'bg-[#38BDF8]/10 text-[#38BDF8] border border-[#38BDF8]/20'
                          : isProcessing
                          ? 'bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20'
                          : 'bg-[#151A21] text-[#94A3B8] border border-[#2A3441]'
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
                        <span className="text-[#94A3B8] font-mono">{item.quantity}x</span>
                        <span className="text-[#F8FAFC] font-medium">{item.product_name}</span>
                      </div>
                      <span className="text-[#F8FAFC] font-mono">
                        ₹{item.total_price?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Footer Breakdown */}
                <div className="flex items-center justify-between border-t border-[#2A3441] pt-3 text-xs">
                  <div className="text-[11px] text-[#64748B] font-mono">
                    {order.payment?.razorpay_order_id ? (
                      <span>Razorpay: {order.payment.razorpay_order_id}</span>
                    ) : (
                      <span>Settlement Order</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#94A3B8]">Total Amount:</span>
                    <span className="text-base font-bold text-[#F5A524] font-mono">
                      ₹{order.final_amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
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
