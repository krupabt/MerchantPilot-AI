import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Search,
  RefreshCw,
  Check,
  Eye,
  MapPin,
  User,
  Phone,
  Mail,
  Package,
  Calendar,
  X
} from 'lucide-react';
import { getMerchantOrders, updateOrderFulfillment } from '../services/api';

function formatINR(val) {
  if (val == null || isNaN(val)) return '₹0';
  const num = Number(val);
  return num % 1 === 0
    ? `₹${num.toLocaleString('en-IN')}`
    : `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const FULFILLMENT_STATES = [
  'CONFIRMED',
  'PROCESSING',
  'PACKED',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED'
];

export default function MerchantOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [fulfillmentFilter, setFulfillmentFilter] = useState('ALL');
  const [updatingId, setUpdatingId] = useState(null);
  const [toast, setToast] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

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
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, fulfillment_status: newStatus } : o))
      );
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev) => ({ ...prev, fulfillment_status: newStatus }));
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
  const confirmedCount = orders.filter((o) => o.fulfillment_status === 'CONFIRMED' || !o.fulfillment_status).length;
  const inProgressCount = orders.filter((o) => o.fulfillment_status === 'PROCESSING' || o.fulfillment_status === 'PACKED').length;
  const deliveredCount = orders.filter((o) => o.fulfillment_status === 'DELIVERED').length;

  const filtered = orders.filter((o) => {
    const matchesSearch =
      searchTerm === '' ||
      (o.id && o.id.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (o.customer_name && o.customer_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (o.customer_email && o.customer_email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (o.razorpay_payment_id && o.razorpay_payment_id.toLowerCase().includes(searchTerm.toLowerCase()));

    const status = o.fulfillment_status || 'CONFIRMED';
    const matchesFilter = fulfillmentFilter === 'ALL' || status === fulfillmentFilter;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans selection:bg-[#252722] selection:text-white">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl bg-[#252722] text-white shadow-xl text-xs flex items-center gap-2 animate-fade-in">
          <Check className="w-4 h-4 text-[#D9D1C2]" />
          <span className="font-medium">{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E5E2DB]">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-medium text-[#20211F] tracking-tight">
            Orders & Customer Delivery
          </h1>
          <p className="text-xs sm:text-sm text-[#777B70] mt-1">
            Review online customer orders, delivery shipping destinations, and dispatch progress.
          </p>
        </div>

        <button
          onClick={loadOrders}
          disabled={loading}
          className="px-3.5 py-2 rounded-xl bg-white hover:bg-[#F5F3EE] border border-[#E5E2DB] text-[#20211F] text-xs font-semibold flex items-center gap-1.5 transition shadow-sm disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#777B70] ${loading ? 'animate-spin' : ''}`} />
          <span>Sync Orders</span>
        </button>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E5E2DB] rounded-2xl p-5 space-y-1.5 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#777B70]">Total Sales Volume</span>
          <p className="font-serif text-2xl font-medium text-[#20211F] tracking-tight tabular-numbers">
            {formatINR(totalVolume)}
          </p>
          <p className="text-[11px] text-[#777B70] tabular-numbers">{orders.length} lifetime orders</p>
        </div>

        <div className="bg-white border border-[#E5E2DB] rounded-2xl p-5 space-y-1.5 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#777B70]">Confirmed Orders</span>
          <p className="font-serif text-2xl font-medium text-[#20211F] tracking-tight tabular-numbers">
            {confirmedCount} orders
          </p>
          <p className="text-[11px] text-[#777B70]">Awaiting processing</p>
        </div>

        <div className="bg-white border border-[#E5E2DB] rounded-2xl p-5 space-y-1.5 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#777B70]">In Packaging / Transit</span>
          <p className="font-serif text-2xl font-medium text-[#20211F] tracking-tight tabular-numbers">
            {inProgressCount} orders
          </p>
          <p className="text-[11px] text-[#777B70]">Processing or Packed</p>
        </div>

        <div className="bg-white border border-[#E5E2DB] rounded-2xl p-5 space-y-1.5 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#777B70]">Delivered Orders</span>
          <p className="font-serif text-2xl font-medium text-emerald-800 tracking-tight tabular-numbers">
            {deliveredCount} orders
          </p>
          <p className="text-[11px] text-[#777B70]">Successfully fulfilled</p>
        </div>
      </div>

      {/* Search and Filters Toolbar */}
      <div className="bg-white border border-[#E5E2DB] rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#777B70]" />
          <input
            type="text"
            placeholder="Search by Order ID, customer, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#F5F3EE]/60 border border-[#E5E2DB] text-[#20211F] text-xs sm:text-sm rounded-xl pl-10 pr-3.5 py-2 focus:outline-none focus:border-[#252722] transition placeholder-[#777B70]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={fulfillmentFilter}
            onChange={(e) => setFulfillmentFilter(e.target.value)}
            className="bg-[#F5F3EE]/60 border border-[#E5E2DB] text-[#20211F] text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-[#252722]"
          >
            <option value="ALL">All fulfillment statuses</option>
            {FULFILLMENT_STATES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-[#E5E2DB] rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F5F3EE] text-[#777B70] font-semibold border-b border-[#E5E2DB]">
              <tr>
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Customer</th>
                <th className="py-3 px-3">Amount</th>
                <th className="py-3 px-3">Payment</th>
                <th className="py-3 px-3">Fulfillment Status</th>
                <th className="py-3 px-4 text-right">Details & Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E2DB]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#777B70]">
                    Loading customer orders...
                  </td>
                </tr>
              ) : filtered.length > 0 ? (
                filtered.map((order) => {
                  const status = order.fulfillment_status || 'CONFIRMED';
                  return (
                    <tr key={order.id} className="hover:bg-[#F5F3EE]/40 transition-colors">
                      <td className="py-3 px-4 font-mono text-[#252722] font-semibold">
                        {order.id?.slice(0, 16)}...
                      </td>
                      <td className="py-3 px-3 text-[#777B70]">
                        {order.created_at ? new Date(order.created_at).toLocaleDateString('en-IN') : 'Recent'}
                      </td>
                      <td className="py-3 px-3 text-[#20211F]">
                        <div className="font-medium">{order.customer_name || 'Store Customer'}</div>
                        {order.customer_email && (
                          <div className="text-[10px] text-[#777B70]">{order.customer_email}</div>
                        )}
                      </td>
                      <td className="py-3 px-3 font-bold text-[#20211F] tabular-numbers font-serif">
                        {formatINR(order.final_amount)}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                            order.status === 'PAID'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <select
                          value={status}
                          disabled={updatingId === order.id}
                          onChange={(e) => handleUpdateFulfillment(order.id, e.target.value)}
                          className={`border text-[11px] font-semibold rounded-lg px-2.5 py-1 focus:outline-none transition ${
                            status === 'DELIVERED'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : status === 'SHIPPED'
                              ? 'bg-blue-50 text-blue-800 border-blue-300'
                              : status === 'CANCELLED'
                              ? 'bg-rose-50 text-rose-800 border-rose-300'
                              : 'bg-[#F5F3EE] text-[#252722] border-[#E5E2DB]'
                          }`}
                        >
                          {FULFILLMENT_STATES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-[#F5F3EE] border border-[#E5E2DB] rounded-lg text-xs font-medium text-[#20211F] transition"
                        >
                          <Eye className="w-3.5 h-3.5 text-[#777B70]" />
                          <span>View Details</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#777B70]">
                    No orders match your filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-[#E5E2DB] rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E5E2DB] pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#777B70] block">
                  Customer Order Breakdown
                </span>
                <h3 className="font-serif text-lg font-medium text-[#20211F]">
                  Order #{selectedOrder.id?.slice(0, 12)}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1 rounded-lg text-[#777B70] hover:text-[#20211F] hover:bg-[#F5F3EE]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Customer & Delivery Address */}
            <div className="bg-[#F5F3EE] border border-[#E5E2DB] rounded-xl p-4 space-y-2 text-xs">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#777B70] mb-1">
                Delivery Details
              </div>
              <div className="flex items-center gap-2 text-[#20211F] font-medium">
                <User className="w-3.5 h-3.5 text-[#777B70]" />
                <span>{selectedOrder.customer_name || 'Customer Name Not Specified'}</span>
              </div>
              {selectedOrder.customer_email && (
                <div className="flex items-center gap-2 text-[#777B70]">
                  <Mail className="w-3.5 h-3.5" />
                  <span>{selectedOrder.customer_email}</span>
                </div>
              )}
              {selectedOrder.shipping_address && (
                <div className="flex items-start gap-2 text-[#20211F] pt-1 border-t border-[#E5E2DB]/60">
                  <MapPin className="w-3.5 h-3.5 text-[#777B70] shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    {typeof selectedOrder.shipping_address === 'string' ? (
                      <span>{selectedOrder.shipping_address}</span>
                    ) : (
                      <>
                        <div className="font-medium">{selectedOrder.shipping_address.street || selectedOrder.shipping_address.address}</div>
                        <div className="text-[#777B70]">
                          {[
                            selectedOrder.shipping_address.city,
                            selectedOrder.shipping_address.state,
                            selectedOrder.shipping_address.postal_code || selectedOrder.shipping_address.pincode
                          ].filter(Boolean).join(', ')}
                        </div>
                        {selectedOrder.shipping_address.phone && (
                          <div className="text-[#777B70]">Phone: {selectedOrder.shipping_address.phone}</div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Ordered Items List */}
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-[#777B70] mb-2">
                Items Ordered
              </div>
              <div className="border border-[#E5E2DB] rounded-xl overflow-hidden divide-y divide-[#E5E2DB] text-xs">
                {(selectedOrder.items || []).length > 0 ? (
                  selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="p-3 flex items-center justify-between bg-white">
                      <div>
                        <div className="font-medium text-[#20211F]">{item.name || item.product_name}</div>
                        <div className="text-[11px] text-[#777B70]">
                          Qty: {item.quantity} × {formatINR(item.price || item.unit_price)}
                        </div>
                      </div>
                      <div className="font-bold text-[#20211F]">
                        {formatINR((item.quantity || 1) * (item.price || item.unit_price || 0))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-3 text-center text-[#777B70]">
                    Order total: {formatINR(selectedOrder.final_amount)}
                  </div>
                )}
              </div>
            </div>

            {/* Status Changer Footer */}
            <div className="pt-2 border-t border-[#E5E2DB] flex items-center justify-between">
              <div>
                <span className="text-[10px] text-[#777B70] uppercase font-semibold block">Update Status</span>
                <select
                  value={selectedOrder.fulfillment_status || 'CONFIRMED'}
                  onChange={(e) => handleUpdateFulfillment(selectedOrder.id, e.target.value)}
                  className="mt-1 bg-[#F5F3EE] border border-[#E5E2DB] text-[#20211F] text-xs font-semibold rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#252722]"
                >
                  {FULFILLMENT_STATES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 bg-[#252722] hover:bg-[#41453C] text-white text-xs font-semibold rounded-xl transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
