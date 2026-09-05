import React, { useState, useEffect } from 'react';
import { Receipt, Search, Filter, CheckCircle2, AlertCircle, RefreshCw, CreditCard, Bot } from 'lucide-react';
import { getTransactions } from '../services/api';

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterChannel, setFilterChannel] = useState('ALL'); // 'ALL' | 'AI' | 'DIRECT'

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

  const filtered = transactions.filter((t) => {
    if (filterChannel === 'AI') return t.is_ai_assisted;
    if (filterChannel === 'DIRECT') return !t.is_ai_assisted;
    return true;
  });

  return (
    <div className="space-y-6 animate-fadeIn max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/30">
              SETTLEMENT LEDGER
            </span>
            <span className="text-xs text-gray-400 font-mono">Razorpay Order & Payment Records</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Order Transactions & Settlements
          </h2>
          <p className="text-xs text-gray-400 mt-1 max-w-2xl leading-relaxed">
            Real-time financial audit records linking AI buyer sessions, server-calculated amounts, Razorpay order IDs, and HMAC-SHA256 signature verifications.
          </p>
        </div>

        <button
          onClick={fetchTransactions}
          className="px-3.5 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 text-xs font-medium flex items-center gap-2 self-start transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Ledger</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 bg-[#111827]/80 border border-gray-800 rounded-2xl p-2 w-fit">
        <button
          onClick={() => setFilterChannel('ALL')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition ${
            filterChannel === 'ALL' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
          }`}
        >
          All Orders ({transactions.length})
        </button>
        <button
          onClick={() => setFilterChannel('AI')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition ${
            filterChannel === 'AI' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
          }`}
        >
          AI-Assisted Only
        </button>
        <button
          onClick={() => setFilterChannel('DIRECT')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition ${
            filterChannel === 'DIRECT' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
          }`}
        >
          Direct Storefront
        </button>
      </div>

      {/* Transactions Table */}
      <div className="bg-[#111827]/80 border border-gray-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-gray-900/80 border-b border-gray-800 text-gray-400 font-medium">
                  <th className="py-3 px-4">Order ID & Date</th>
                  <th className="py-3 px-4">Cart & Items</th>
                  <th className="py-3 px-4">Channel</th>
                  <th className="py-3 px-4">Pricing Breakdown</th>
                  <th className="py-3 px-4">Razorpay Reference</th>
                  <th className="py-3 px-4">Verification</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60 font-mono">
                {filtered.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-900/40 transition">
                    <td className="py-3.5 px-4">
                      <span className="text-white font-bold block">{tx.id}</span>
                      <span className="text-[10px] text-gray-500 font-normal">
                        {new Date(tx.created_at).toLocaleString()}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-sans max-w-[200px]">
                      <span className="text-white font-semibold block truncate">
                        {tx.bundle_name || `${tx.items?.length || 1} Product(s)`}
                      </span>
                      <div className="text-[11px] text-gray-400 truncate">
                        {tx.items?.map((it) => `${it.quantity}x ${it.name}`).join(', ')}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-sans">
                      {tx.is_ai_assisted ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-1 w-fit">
                          <Bot className="w-3 h-3" /> AI Agent
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-800 text-gray-400">
                          Direct
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="text-white font-bold block text-sm">
                        ₹{tx.final_amount?.toLocaleString('en-IN')}
                      </span>
                      {tx.discount > 0 && (
                        <span className="text-[10px] text-emerald-400 block">
                          Discount: -₹{tx.discount?.toLocaleString('en-IN')}
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-xs">
                      {tx.payment ? (
                        <div>
                          <span className="text-gray-300 block truncate max-w-[150px]">
                            {tx.payment.razorpay_order_id}
                          </span>
                          <span className="text-[10px] text-gray-500 block truncate max-w-[150px]">
                            {tx.payment.razorpay_payment_id || 'Pending Settlement'}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-500">N/A</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 font-sans">
                      {tx.payment?.verification_status === 'VERIFIED_HMAC' ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1 w-fit">
                          <CheckCircle2 className="w-3 h-3" /> HMAC VERIFIED
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono text-gray-400 bg-gray-800">
                          UNVERIFIED
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        tx.status === 'PAID'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
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
