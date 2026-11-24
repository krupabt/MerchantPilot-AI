import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Search,
  CheckCircle2,
  Clock,
  Truck,
  RefreshCw,
  AlertCircle,
  Check,
  ChevronDown,
  Filter,
  Eye,
  X
} from 'lucide-react';
import { getMerchantOrders, updateOrderFulfillment } from '../services/api';

const FULFILLMENT_STATES = ['UNFULFILLED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

export default function MerchantOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [fulfillmentFilter, setFulfillmentFilter] = useState('ALL');
  const [updatingId, setUpdatingId] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
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
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, fulfillment_status: newStatus });
      }
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
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-lg bg-white border border-[#E5E5E5] text-[#222222] shadow-modal text-xs flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-[#347A52]" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E5E5E5]">
        <div>
          <h1 className="text-2xl sm:text-[28px] font-bold text-[#222222] tracking-tight">
            Orders & payments
          </h1>
          <p className="text-sm text-[#71717A] mt-0.5">
            Manage customer purchases, fulfillment status, and payment settlements.
          </p>
        </div>

        <button
          onClick={loadOrders}
          disabled={loading}
          className="px-3 py-1.5 rounded-md bg-white hover:bg-[#F7F7F5] border border-[#E5E5E5] text-[#222222] text-xs font-medium flex items-center gap-1.5 transition-colors shadow-xs disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#71717A] ${loading ? 'animate-spin' : ''}`} />
          <span>Sync orders</span>
        </button>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="surface-card p-4 space-y-1">
          <span className="text-xs font-medium text-[#71717A]">Total order volume</span>
          <p className="text-2xl font-bold text-[#222222] tracking-tight">
            ₹{totalVolume.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-[12px] text-[#71717A]">{orders.length} total orders</p>
        </div>

        <div className="surface-card p-4 space-y-1">
          <span className="text-xs font-medium text-[#71717A]">Pending fulfillment</span>
          <p className={`text-2xl font-bold tracking-tight ${unfulfilledCount > 0 ? 'text-[#B77932]' : 'text-[#222222]'}`}>
            {unfulfilledCount} orders
          </p>
          <p className="text-[12px] text-[#71717A]">Requires packaging / dispatch</p>
        </div>

        <div className="surface-card p-4 space-y-1">
          <span className="text-xs font-medium text-[#71717A]">Processing</span>
          <p className="text-2xl font-bold text-[#222222] tracking-tight">{processingCount} orders</p>
          <p className="text-[12px] text-[#71717A]">In warehouse queue</p>
        </div>

        <div className="surface-card p-4 space-y-1">
          <span className="text-xs font-medium text-[#71717A]">Delivered</span>
          <p className="text-2xl font-bold text-[#347A52] tracking-tight">{deliveredCount} orders</p>
          <p className="text-[12px] text-[#71717A]">Completed delivery</p>
        </div>
      </div>

      {/* Search and Filters Toolbar */}
      <div className="surface-card p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#71717A]" />
          <input
            type="text"
            placeholder="Search by Order ID, customer, payment ref..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#F7F7F5] border border-[#E5E5E5] text-[#222222] text-xs rounded-md pl-9 pr-3.5 py-2 focus:outline-none focus:border-[#C65D3B] focus:bg-white transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={fulfillmentFilter}
            onChange={(e) => setFulfillmentFilter(e.target.value)}
            className="bg-[#F7F7F5] border border-[#E5E5E5] text-[#222222] text-xs rounded-md px-2.5 py-1.5 focus:outline-none focus:border-[#C65D3B]"
          >
            <option value="ALL">All fulfillment statuses</option>
            {FULFILLMENT_STATES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="surface-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F7F7F5] text-[#71717A] font-medium border-b border-[#E5E5E5]">
              <tr>
                <th className="py-2.5 px-3.5">Order ID</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Customer</th>
                <th className="py-2.5 px-3">Amount</th>
                <th className="py-2.5 px-3">Payment</th>
                <th className="py-2.5 px-3">Fulfillment</th>
                <th className="py-2.5 px-3.5 text-right">Update status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5E5]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[#71717A]">
                    Loading orders...
                  </td>
                </tr>
              ) : filtered.length > 0 ? (
                filtered.map((order) => {
                  const status = order.fulfillment_status || 'UNFULFILLED';
                  return (
                    <tr key={order.id} className="hover:bg-[#F7F7F5]/60 transition-colors">
                      <td className="py-2.5 px-3.5 font-mono text-[#C65D3B] font-medium">
                        {order.id?.slice(0, 16)}...
                      </td>
                      <td className="py-2.5 px-3 text-[#71717A]">
                        {order.created_at ? new Date(order.created_at).toLocaleDateString('en-IN') : 'Recent'}
                      </td>
                      <td className="py-2.5 px-3 text-[#222222] font-medium">
                        {order.customer_name || 'Store Customer'}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-[#222222]">
                        ₹{order.final_amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                          order.status === 'PAID'
                            ? 'bg-[#FAF5F2] text-[#347A52] border border-[#F0D5CB]'
                            : 'bg-[#FDF4EB] text-[#B77932]'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                          status === 'DELIVERED'
                            ? 'bg-[#FAF5F2] text-[#347A52]'
                            : status === 'SHIPPED'
                            ? 'bg-[#F7F7F5] text-[#C65D3B] border border-[#E5E5E5]'
                            : status === 'PROCESSING'
                            ? 'bg-[#FDF4EB] text-[#B77932]'
                            : 'bg-[#FBEFEF] text-[#B94A48]'
                        }`}>
                          {status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3.5 text-right">
                        <select
                          value={status}
                          disabled={updatingId === order.id}
                          onChange={(e) => handleUpdateFulfillment(order.id, e.target.value)}
                          className="bg-white border border-[#E5E5E5] text-[#222222] text-xs rounded px-2 py-1 focus:outline-none focus:border-[#C65D3B]"
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
                  <td colSpan={7} className="py-8 text-center text-[#71717A]">
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
