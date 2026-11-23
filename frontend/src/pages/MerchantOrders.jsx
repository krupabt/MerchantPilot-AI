import React, { useState, useEffect } from 'react';
import {
  ShoppingCart,
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
      setToast(`Order ${orderId} marked as ${newStatus}`);
      setTimeout(() => setToast(''), 3000);
    } catch (err) {
      setToast('Failed to update status: ' + (err.response?.data?.detail || err.message));
      setTimeout(() => setToast(''), 4000);
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = orders.filter(o => {
    const matchesSearch = searchTerm === '' ||
      o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (o.customer_name && o.customer_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (o.customer_email && o.customer_email.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesFulfillment = fulfillmentFilter === 'ALL' || o.fulfillment_status === fulfillmentFilter;
    return matchesSearch && matchesFulfillment;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl bg-[#1C222B] border border-[#F5A524] text-[#F8FAFC] shadow-xl text-xs flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-[#10B981]" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2A3441] pb-4">
        <div>
          <span className="text-[10px] font-mono uppercase bg-[#F5A524]/10 border border-[#F5A524]/30 text-[#F5A524] px-2 py-0.5 rounded">
            Settlement & Logistics
          </span>
          <h1 className="text-2xl font-bold text-[#F8FAFC] tracking-tight mt-1">Merchant Orders & Fulfillment</h1>
          <p className="text-xs text-[#94A3B8]">
            Manage incoming orders, review payment verifications, and dispatch customer shipments.
          </p>
        </div>

        <button
          onClick={loadOrders}
          className="px-3.5 py-2 rounded-xl bg-[#1C222B] hover:bg-[#242D38] border border-[#2A3441] text-[#94A3B8] hover:text-[#F8FAFC] text-xs font-medium flex items-center gap-2 self-start sm:self-auto transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-[#151A21] border border-[#2A3441] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Order ID, customer name, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#1C222B] border border-[#2A3441] text-[#F8FAFC] text-xs rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-[#F5A524]"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0 overflow-x-auto pb-1 sm:pb-0">
          <select
            value={fulfillmentFilter}
            onChange={(e) => setFulfillmentFilter(e.target.value)}
            className="bg-[#1C222B] border border-[#2A3441] text-[#F8FAFC] text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#F5A524]"
          >
            <option value="ALL">All Fulfillments ({orders.length})</option>
            {FULFILLMENT_STATES.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="surface-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#151A21] border-b border-[#2A3441] text-[#94A3B8] uppercase font-mono text-[10px]">
              <tr>
                <th className="p-4">Order ID</th>
                <th className="p-4">Customer Details</th>
                <th className="p-4">Items</th>
                <th className="p-4">Total Amount</th>
                <th className="p-4">Payment</th>
                <th className="p-4">Fulfillment Status</th>
                <th className="p-4 text-right">Update Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A3441]">
              {loading ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-[#94A3B8]">
                    Loading verified merchant orders...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-[#94A3B8]">
                    No orders matched the selected filter.
                  </td>
                </tr>
              ) : (
                filtered.map((order) => {
                  const isPaid = order.status === 'PAID';
                  const isDelivered = order.fulfillment_status === 'DELIVERED';
                  const isShipped = order.fulfillment_status === 'SHIPPED';
                  const isProcessing = order.fulfillment_status === 'PROCESSING';

                  return (
                    <tr key={order.id} className="hover:bg-[#151A21]/50 transition">
                      <td className="p-4 font-mono font-bold text-[#F8FAFC]">
                        #{order.id}
                        <span className="block text-[10px] text-[#64748B] font-normal">
                          {order.created_at ? new Date(order.created_at).toLocaleDateString('en-IN', {
                            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                          }) : ''}
                        </span>
                      </td>

                      <td className="p-4">
                        <span className="font-semibold text-[#F8FAFC] block">{order.customer_name || 'Store Customer'}</span>
                        <span className="text-[11px] text-[#94A3B8] font-mono">{order.customer_email || '—'}</span>
                      </td>

                      <td className="p-4 text-[#94A3B8] font-mono">
                        {order.items_count || order.items?.length || 1} item(s)
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="ml-2 text-[#F5A524] hover:underline text-[10px]"
                        >
                          View
                        </button>
                      </td>

                      <td className="p-4 font-mono font-bold text-[#F8FAFC]">
                        ₹{(order.final_amount || order.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>

                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold ${
                          isPaid
                            ? 'bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20'
                            : 'bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20'
                        }`}>
                          {order.status}
                        </span>
                      </td>

                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold ${
                          isDelivered
                            ? 'bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20'
                            : isShipped
                            ? 'bg-[#38BDF8]/10 text-[#38BDF8] border border-[#38BDF8]/20'
                            : isProcessing
                            ? 'bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20'
                            : 'bg-[#151A21] text-[#94A3B8] border border-[#2A3441]'
                        }`}>
                          {order.fulfillment_status || 'UNFULFILLED'}
                        </span>
                      </td>

                      <td className="p-4 text-right">
                        <select
                          value={order.fulfillment_status || 'UNFULFILLED'}
                          disabled={updatingId === order.id}
                          onChange={(e) => handleUpdateFulfillment(order.id, e.target.value)}
                          className="bg-[#1C222B] border border-[#2A3441] text-[#F8FAFC] text-[11px] rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#F5A524] transition font-mono"
                        >
                          {FULFILLMENT_STATES.map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#1C222B] border border-[#2A3441] rounded-2xl max-w-lg w-full shadow-2xl p-6 relative space-y-4">
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-4 right-4 p-1.5 text-[#94A3B8] hover:text-[#F8FAFC] bg-[#151A21] rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="pb-3 border-b border-[#2A3441]">
              <span className="text-[10px] font-mono text-[#F5A524] uppercase">Order Details</span>
              <h3 className="text-base font-bold text-[#F8FAFC]">#{selectedOrder.id}</h3>
              <p className="text-xs text-[#94A3B8]">
                Customer: {selectedOrder.customer_name} ({selectedOrder.customer_email})
              </p>
            </div>

            <div className="space-y-2 text-xs">
              <span className="text-[11px] font-mono uppercase text-[#94A3B8] block">Purchased Products</span>
              {selectedOrder.items && selectedOrder.items.length > 0 ? (
                <div className="divide-y divide-[#2A3441] bg-[#151A21] rounded-xl p-3 border border-[#2A3441]">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="py-2 flex justify-between items-center">
                      <div>
                        <span className="text-[#F8FAFC] font-medium">{item.product_name}</span>
                        <span className="text-[#94A3B8] block text-[11px]">Qty: {item.quantity}</span>
                      </div>
                      <span className="font-mono text-[#F8FAFC]">
                        ₹{item.total_price?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 bg-[#151A21] rounded-xl text-[#94A3B8]">
                  {selectedOrder.items_count || 1} hardware product(s) in this order package.
                </div>
              )}
            </div>

            <div className="p-3 bg-[#151A21] rounded-xl border border-[#2A3441] text-xs space-y-1.5">
              <div className="flex justify-between text-[#94A3B8]">
                <span>Payment Settlement:</span>
                <span className="text-[#10B981] font-mono font-bold">{selectedOrder.status}</span>
              </div>
              <div className="flex justify-between text-[#94A3B8]">
                <span>Fulfillment State:</span>
                <span className="text-[#F5A524] font-mono font-bold">{selectedOrder.fulfillment_status || 'UNFULFILLED'}</span>
              </div>
              <div className="flex justify-between text-[#94A3B8] pt-1.5 border-t border-[#2A3441]">
                <span className="font-bold text-[#F8FAFC]">Total Amount:</span>
                <span className="text-[#F5A524] font-bold font-mono text-sm">
                  ₹{(selectedOrder.final_amount || selectedOrder.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <button
              onClick={() => setSelectedOrder(null)}
              className="w-full py-2.5 bg-[#151A21] hover:bg-[#242D38] border border-[#2A3441] text-xs font-semibold text-[#F8FAFC] rounded-xl transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
