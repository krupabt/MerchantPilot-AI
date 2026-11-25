import React, { useState, useEffect } from 'react';
import { Receipt, Search, Filter, CheckCircle2, AlertCircle, RefreshCw, CreditCard, Bot, Truck, Check } from 'lucide-react';
import { getTransactions, updateOrderFulfillment } from '../services/api';

function formatINR(val) {
  if (val == null || isNaN(val)) return '₹0';
  const num = Number(val);
  return num % 1 === 0
    ? `₹${num.toLocaleString('en-IN')}`
    : `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterChannel, setFilterChannel] = useState('ALL'); // 'ALL' | 'AI' | 'DIRECT'
  const [updatingId, setUpdatingId] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await getTransactions();
      setTransactions(res.data || []);
    } catch (err) {
      console.error('Failed to load transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleFulfillmentChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      await updateOrderFulfillment(orderId, newStatus);
      setTransactions(prev =>
        prev.map(t => t.id === orderId ? { ...t, fulfillment_status: newStatus } : t)
      );
      setSuccessMsg(`Order ${orderId} updated to ${newStatus}`);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error('Failed to update fulfillment:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = transactions.filter((t) => {
    if (filterChannel === 'AI') return t.is_ai_assisted;
    if (filterChannel === 'DIRECT') return !t.is_ai_assisted;
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E8E2DA] pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#F8F4EE] text-[#783F45] border border-[#E8E2DA]">
              PAYMENT SETTLEMENTS
            </span>
            <span className="text-xs text-[#6B6560]">Razorpay Cryptographic Settlement Ledger</span>
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[#242424] tracking-tight">
            Settlements & Payment Ledger
          </h1>
          <p className="text-xs sm:text-sm text-[#6B6560] mt-1 max-w-2xl leading-relaxed">
            Immutable settlement audit linking customer sessions, paise calculation, Razorpay order IDs, HMAC-SHA256 signature verifications, and delivery states.
          </p>
        </div>

        <button
          onClick={fetchTransactions}
          className="px-3.5 py-2 rounded-xl bg-white hover:bg-[#F8F4EE] border border-[#E8E2DA] text-[#242424] text-xs font-semibold flex items-center gap-1.5 self-start transition shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#6B6560] ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Ledger</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-[#32734D] text-xs flex items-center gap-2">
          <Check className="w-4 h-4 text-[#32734D]" />
          <span className="font-medium">{successMsg}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 bg-[#F8F4EE] border border-[#E8E2DA] rounded-xl p-1 w-fit">
        <button
          onClick={() => setFilterChannel('ALL')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
            filterChannel === 'ALL' ? 'bg-[#783F45] text-white shadow-sm' : 'text-[#6B6560] hover:text-[#242424]'
          }`}
        >
          All Orders ({transactions.length})
        </button>
        <button
          onClick={() => setFilterChannel('AI')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
            filterChannel === 'AI' ? 'bg-[#783F45] text-white shadow-sm' : 'text-[#6B6560] hover:text-[#242424]'
          }`}
        >
          AI-Assisted Only
        </button>
        <button
          onClick={() => setFilterChannel('DIRECT')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
            filterChannel === 'DIRECT' ? 'bg-[#783F45] text-white shadow-sm' : 'text-[#6B6560] hover:text-[#242424]'
          }`}
        >
          Direct Storefront
        </button>
      </div>

      {/* Transactions Table */}
      <div className="bg-white border border-[#E8E2DA] rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-xs text-[#6B6560] animate-pulse">
            Loading settlements...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8F4EE] text-[#6B6560] font-semibold border-b border-[#E8E2DA]">
                <tr>
                  <th className="py-3 px-4">Order ID & Date</th>
                  <th className="py-3 px-4">Items</th>
                  <th className="py-3 px-4">Channel</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Razorpay Reference</th>
                  <th className="py-3 px-4">Verification</th>
                  <th className="py-3 px-4">Fulfillment</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E2DA]">
                {filtered.map((tx) => (
                  <tr key={tx.id} className="hover:bg-[#F8F4EE]/50 transition">
                    <td className="py-3.5 px-4">
                      <span className="text-[#242424] font-bold block font-mono">{tx.id?.slice(0, 16)}...</span>
                      <span className="text-[11px] text-[#6B6560]">
                        {new Date(tx.created_at).toLocaleString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 max-w-[200px]">
                      <span className="text-[#242424] font-semibold block truncate">
                        {tx.bundle_name || `${tx.items?.length || 1} Product(s)`}
                      </span>
                      <div className="text-[11px] text-[#6B6560] truncate">
                        {tx.items?.map((it) => `${it.quantity}x ${it.name}`).join(', ')}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      {tx.is_ai_assisted ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#F8F4EE] text-[#783F45] border border-[#E8E2DA] flex items-center gap-1 w-fit">
                          <Bot className="w-3 h-3 text-[#783F45]" /> AI Agent
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#F8F4EE] text-[#6B6560]">
                          Direct
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="text-[#242424] font-bold block text-sm tabular-numbers font-heading">
                        {formatINR(tx.final_amount)}
                      </span>
                      {tx.discount > 0 && (
                        <span className="text-[10px] text-[#32734D] block tabular-numbers">
                          Discount: -{formatINR(tx.discount)}
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-xs">
                      {tx.payment ? (
                        <div>
                          <span className="text-[#242424] block truncate max-w-[150px] font-mono">
                            {tx.payment.razorpay_order_id}
                          </span>
                          <span className="text-[10px] text-[#6B6560] block truncate max-w-[150px] font-mono">
                            {tx.payment.razorpay_payment_id || 'Pending Settlement'}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[#6B6560]">POS Recorded</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      {tx.payment?.verification_status === 'VERIFIED_HMAC' ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-[#32734D] border border-emerald-200 flex items-center gap-1 w-fit">
                          <CheckCircle2 className="w-3 h-3" /> HMAC VERIFIED
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] text-[#6B6560] bg-[#F8F4EE] border border-[#E8E2DA]">
                          OFFLINE POS
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <select
                        value={tx.fulfillment_status || 'UNFULFILLED'}
                        disabled={updatingId === tx.id}
                        onChange={(e) => handleFulfillmentChange(tx.id, e.target.value)}
                        className={`text-xs px-2.5 py-1 rounded-xl border bg-white font-medium focus:outline-none transition ${
                          tx.fulfillment_status === 'DELIVERED'
                            ? 'text-[#32734D] border-emerald-200'
                            : tx.fulfillment_status === 'SHIPPED'
                            ? 'text-[#783F45] border-[#E8E2DA]'
                            : tx.fulfillment_status === 'PROCESSING'
                            ? 'text-[#B77932] border-amber-200'
                            : 'text-[#6B6560] border-[#E8E2DA]'
                        }`}
                      >
                        <option value="UNFULFILLED">UNFULFILLED</option>
                        <option value="PROCESSING">PROCESSING</option>
                        <option value="SHIPPED">SHIPPED</option>
                        <option value="DELIVERED">DELIVERED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                        tx.status === 'PAID'
                          ? 'bg-emerald-50 text-[#32734D] border border-emerald-200'
                          : 'bg-amber-50 text-[#B77932] border border-amber-200'
                      }`}>
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
