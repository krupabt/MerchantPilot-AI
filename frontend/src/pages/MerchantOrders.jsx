import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Search,
  RefreshCw,
  Check
} from 'lucide-react';
import { getMerchantOrders, updateOrderFulfillment } from '../services/api';

function formatINR(val) {
  if (val == null || isNaN(val)) return '₹0';
  const num = Number(val);
  return num % 1 === 0
    ? `₹${num.toLocaleString('en-IN')}`
    : `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const FULFILLMENT_STATES = ['UNFULFILLED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

export default function MerchantOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [fulfillmentFilter, setFulfillmentFilter] = useState('ALL');
  const [updatingId, setUpdatingId] = useState(null);
  const [toast, setToast] = useState('');

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await getMerchantOrders();
      setOrders(res.data || []);
    } catch (err) {
      console.error('Failed to load merchant orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleUpdateFulfillment = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      await updateOrderFulfillment(orderId, newStatus);
      setOrders(orders.map(o => o.id === orderId ? { ...o, fulfillment_status: newStatus } : o));
      setToast(`Order updated to ${newStatus}`);
      setTimeout(() => setToast(''), 3000);
    } catch (err) {
      setToast('Failed to update status: ' + (err.response?.data?.detail || err.message));
      setTimeout(() => setToast(''), 4000);
    } finally {
      setUpdatingId(null);
    }
  };

  const totalVolume = orders.reduce((sum, o) => sum + (o.final_amount || 0), 0);
  const unfulfilledCount = orders.filter(o => !o.fulfillment_status || o.fulfillment_status === 'UNFULFILLED').length;
  const processingCount = orders.filter(o => o.fulfillment_status === 'PROCESSING').length;
  const deliveredCount = orders.filter(o => o.fulfillment_status === 'DELIVERED').length;

  const filtered = orders.filter(o => {
    const matchesSearch = searchTerm === '' ||
      (o.id && o.id.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (o.customer_name && o.customer_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (o.razorpay_payment_id && o.razorpay_payment_id.toLowerCase().includes(searchTerm.toLowerCase()));

    const status = o.fulfillment_status || 'UNFULFILLED';
    const matchesFilter = fulfillmentFilter === 'ALL' || status === fulfillmentFilter;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl bg-white border border-[#E8E2DA] text-[#242424] shadow-lg text-xs flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-[#32734D]" />
          <span className="font-medium">{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E8E2DA]">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[#242424] tracking-tight">
            Orders & Fulfillment
          </h1>
          <p className="text-xs sm:text-sm text-[#6B6560] mt-1">
            Track customer transactions, delivery logistics, and settlement statuses.
          </p>
        </div>

        <button
          onClick={loadOrders}
          disabled={loading}
          className="px-3.5 py-2 rounded-xl bg-white hover:bg-[#F8F4EE] border border-[#E8E2DA] text-[#242424] text-xs font-semibold flex items-center gap-1.5 transition shadow-sm disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#6B6560] ${loading ? 'animate-spin' : ''}`} />
          <span>Sync Orders</span>
        </button>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E8E2DA] rounded-2xl p-5 space-y-1.5 shadow-sm hover:border-[#D8C3A5] transition">
          <span className="text-xs font-medium text-[#6B6560]">Total Order Volume</span>
          <p className="font-heading text-2xl font-bold text-[#242424] tracking-tight tabular-numbers">
            {formatINR(totalVolume)}
          </p>
          <p className="text-[11px] text-[#6B6560] tabular-numbers">{orders.length} total orders</p>
        </div>

        <div className="bg-white border border-[#E8E2DA] rounded-2xl p-5 space-y-1.5 shadow-sm hover:border-[#D8C3A5] transition">
          <span className="text-xs font-medium text-[#6B6560]">Pending Dispatch</span>
          <p className={`font-heading text-2xl font-bold tracking-tight tabular-numbers ${unfulfilledCount > 0 ? 'text-[#B77932]' : 'text-[#242424]'}`}>
            {unfulfilledCount} orders
          </p>
          <p className="text-[11px] text-[#6B6560]">Requires packing / handover</p>
        </div>

        <div className="bg-white border border-[#E8E2DA] rounded-2xl p-5 space-y-1.5 shadow-sm hover:border-[#D8C3A5] transition">
          <span className="text-xs font-medium text-[#6B6560]">Processing</span>
          <p className="font-heading text-2xl font-bold text-[#242424] tracking-tight tabular-numbers">{processingCount} orders</p>
          <p className="text-[11px] text-[#6B6560]">In packaging queue</p>
        </div>

        <div className="bg-white border border-[#E8E2DA] rounded-2xl p-5 space-y-1.5 shadow-sm hover:border-[#D8C3A5] transition">
          <span className="text-xs font-medium text-[#6B6560]">Delivered</span>
          <p className="font-heading text-2xl font-bold text-[#32734D] tracking-tight tabular-numbers">{deliveredCount} orders</p>
          <p className="text-[11px] text-[#6B6560]">Completed shipments</p>
        </div>
      </div>

      {/* Search and Filters Toolbar */}
      <div className="bg-white border border-[#E8E2DA] rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B6560]" />
          <input
            type="text"
            placeholder="Search by Order ID, customer, payment ref..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#F8F4EE] border border-[#E8E2DA] text-[#242424] text-xs sm:text-sm rounded-xl pl-10 pr-3.5 py-2 focus:outline-none focus:border-[#783F45] transition placeholder-[#6B6560]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={fulfillmentFilter}
            onChange={(e) => setFulfillmentFilter(e.target.value)}
            className="bg-[#F8F4EE] border border-[#E8E2DA] text-[#242424] text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-[#783F45]"
          >
            <option value="ALL">All fulfillment statuses</option>
            {FULFILLMENT_STATES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-[#E8E2DA] rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8F4EE] text-[#6B6560] font-semibold border-b border-[#E8E2DA]">
              <tr>
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Customer</th>
                <th className="py-3 px-3">Amount</th>
                <th className="py-3 px-3">Payment</th>
                <th className="py-3 px-3">Fulfillment</th>
                <th className="py-3 px-4 text-right">Update Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E2DA]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-[#6B6560] animate-pulse">
                    Loading orders...
                  </td>
                </tr>
              ) : filtered.length > 0 ? (
                filtered.map((order) => {
                  const status = order.fulfillment_status || 'UNFULFILLED';
                  return (
                    <tr key={order.id} className="hover:bg-[#F8F4EE]/50 transition-colors">
                      <td className="py-3 px-4 font-mono text-[#783F45] font-semibold">
                        {order.id?.slice(0, 16)}...
                      </td>
                      <td className="py-3 px-3 text-[#6B6560]">
                        {order.created_at ? new Date(order.created_at).toLocaleDateString('en-IN') : 'Recent'}
                      </td>
                      <td className="py-3 px-3 text-[#242424] font-medium">
                        {order.customer_name || 'Store Customer'}
                      </td>
                      <td className="py-3 px-3 font-bold text-[#242424] tabular-numbers font-heading">
                        {formatINR(order.final_amount)}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                          order.status === 'PAID'
                            ? 'bg-emerald-50 text-[#32734D] border border-emerald-200'
                            : 'bg-amber-50 text-[#B77932] border border-amber-200'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                          status === 'DELIVERED'
                            ? 'bg-emerald-50 text-[#32734D] border border-emerald-200'
                            : status === 'SHIPPED'
                            ? 'bg-[#F8F4EE] text-[#783F45] border border-[#E8E2DA]'
                            : status === 'PROCESSING'
                            ? 'bg-amber-50 text-[#B77932] border border-amber-200'
                            : 'bg-rose-50 text-[#B84040] border border-rose-200'
                        }`}>
                          {status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <select
                          value={status}
                          disabled={updatingId === order.id}
                          onChange={(e) => handleUpdateFulfillment(order.id, e.target.value)}
                          className="bg-white border border-[#E8E2DA] text-[#242424] text-xs rounded-xl px-2.5 py-1 focus:outline-none focus:border-[#783F45]"
                        >
                          {FULFILLMENT_STATES.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-[#6B6560]">
                    No orders match your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
