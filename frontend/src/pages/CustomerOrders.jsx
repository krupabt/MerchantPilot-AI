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
      <div className="max-w-md mx-auto py-16 text-center space-y-4 surface-card p-6">
        <Package className="w-12 h-12 text-[#71717A] mx-auto" />
        <h2 className="text-lg font-semibold text-[#222222]">Sign In to View Orders</h2>
        <p className="text-xs text-[#71717A]">
          You must be logged in to view your past purchases and shipment tracking updates.
        </p>
        <Link
          to="/login"
          className="inline-block px-4 py-2 rounded-lg bg-[#252525] hover:bg-[#3a3a3a] text-white font-medium text-xs transition shadow-xs"
        >
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E5E5] pb-3">
        <div>
          <span className="text-[10px] font-mono uppercase bg-[#FAF5F2] border border-[#E5E5E5] text-[#C65D3B] px-2 py-0.5 rounded font-medium">
            Fulfillment Ledger
          </span>
          <h1 className="text-xl font-semibold text-[#222222] tracking-tight mt-1">My Orders</h1>
          <p className="text-xs text-[#71717A]">
            Track delivery progress and review receipts for your past purchases.
          </p>
        </div>

        <button
          onClick={fetchOrders}
          className="px-3 py-1.5 rounded-lg bg-white hover:bg-[#F7F7F5] border border-[#E5E5E5] text-[#222222] text-xs font-medium flex items-center gap-1.5 self-start sm:self-auto transition"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#71717A]" />
          <span>Refresh</span>
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-[#71717A] surface-card animate-pulse">
          Loading your order history...
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 surface-card p-8 space-y-3">
          <Receipt className="w-12 h-12 text-[#71717A] mx-auto" />
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-[#222222]">No orders placed yet</h3>
            <p className="text-xs text-[#71717A] max-w-sm mx-auto">
              Once you complete a purchase, your full itemized receipt and delivery tracking will appear here.
            </p>
          </div>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#252525] hover:bg-[#3a3a3a] text-white font-medium text-xs transition shadow-xs"
          >
            <Store className="w-3.5 h-3.5" />
            <span>Explore Products</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-3.5">
          {orders.map((order) => {
            const isPaid = order.status === 'PAID';
            const isDelivered = order.fulfillment_status === 'DELIVERED';
            const isShipped = order.fulfillment_status === 'SHIPPED';
            const isProcessing = order.fulfillment_status === 'PROCESSING';

            return (
              <div
                key={order.id}
                className="surface-card p-4 space-y-3 transition"
              >
                {/* Order Top Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E5E5E5] pb-2.5">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-semibold text-[#222222]">
                      #{order.id}
                    </span>
                    <span className="text-[11px] text-[#71717A]">
                      {order.created_at ? new Date(order.created_at).toLocaleDateString('en-IN', {
                        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                      }) : ''}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Payment Status Badge */}
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase ${
                        isPaid
                          ? 'bg-[#FAF5F2] text-[#C65D3B] border border-[#E5E5E5]'
                          : 'bg-[#FEF8F1] text-[#B77932] border border-[#E5E5E5]'
                      }`}
                    >
                      {order.status}
                    </span>

                    {/* Fulfillment Status Badge */}
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium uppercase ${
                        isDelivered
                          ? 'bg-[#FAF5F2] text-[#347A52] border border-[#E5E5E5]'
                          : isShipped
                          ? 'bg-[#FAF5F2] text-[#C65D3B] border border-[#E5E5E5]'
                          : isProcessing
                          ? 'bg-[#FEF8F1] text-[#B77932] border border-[#E5E5E5]'
                          : 'bg-[#F7F7F5] text-[#71717A] border border-[#E5E5E5]'
                      }`}
                    >
                      {order.fulfillment_status || 'UNFULFILLED'}
                    </span>
                  </div>
                </div>

                {/* Items in Order */}
                <div className="space-y-1.5">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-[#71717A] font-mono">{item.quantity}x</span>
                        <span className="text-[#222222] font-medium">{item.product_name}</span>
                      </div>
                      <span className="text-[#222222] font-mono">
                        ₹{item.total_price?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Footer Breakdown */}
                <div className="flex items-center justify-between border-t border-[#E5E5E5] pt-2.5 text-xs">
                  <div className="text-[11px] text-[#71717A] font-mono">
                    {order.payment?.razorpay_order_id ? (
                      <span>Razorpay: {order.payment.razorpay_order_id}</span>
                    ) : (
                      <span>Settlement Order</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#71717A]">Total Amount:</span>
                    <span className="text-sm font-bold text-[#C65D3B] font-mono">
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
