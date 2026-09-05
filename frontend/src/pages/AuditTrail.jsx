import React, { useState, useEffect } from 'react';
import {
  FileSearch,
  CheckCircle2,
  AlertOctagon,
  Bot,
  ShieldCheck,
  CreditCard,
  RefreshCw,
  Search,
  Filter,
  User,
  ArrowRight
} from 'lucide-react';
import { getAuditLogs } from '../services/api';

export default function AuditTrail() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterResult, setFilterResult] = useState('ALL'); // 'ALL' | 'PASSED' | 'VIOLATION'
  const [searchQuery, setSearchQuery] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterResult !== 'ALL') {
        params.policy_result = filterResult;
      }
      const res = await getAuditLogs(params);
      setLogs(res.data.logs || []);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [filterResult]);

  const filteredLogs = logs.filter((log) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      log.action?.toLowerCase().includes(query) ||
      log.reason?.toLowerCase().includes(query) ||
      log.actor?.toLowerCase().includes(query) ||
      log.session_id?.toLowerCase().includes(query)
    );
  });

  const getActorBadge = (actor) => {
    switch (actor) {
      case 'AI_BUYER':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">AI Buyer</span>;
      case 'AI_MERCHANT_AGENT':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">Merchant Agent</span>;
      case 'POLICY_ENGINE':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">Policy Engine</span>;
      case 'APPROVAL_GATE':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Approval Gate</span>;
      case 'RAZORPAY_SYSTEM':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">Razorpay</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-800 text-gray-300">{actor}</span>;
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/30">
              FEATURE 11 — IMMUTABLE AUDIT TRAIL
            </span>
            <span className="text-xs text-gray-400 font-mono">End-to-End Decision Trace</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Cryptographic & Commercial Audit Trail
          </h2>
          <p className="text-xs text-gray-400 mt-1 max-w-2xl leading-relaxed">
            Full chronological logging of buyer intents, catalog queries, revenue bundling justifications, policy evaluations, and Razorpay HMAC signature validations.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          className="px-3.5 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 text-xs font-medium flex items-center gap-2 self-start transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Logs</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#111827]/80 border border-gray-800 rounded-2xl p-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search actions, reasons, sessions..."
            className="w-full pl-9 pr-4 py-2 bg-gray-900/80 border border-gray-800 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setFilterResult('ALL')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition ${
              filterResult === 'ALL' ? 'bg-blue-600 text-white' : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-800'
            }`}
          >
            All Events ({logs.length})
          </button>
          <button
            onClick={() => setFilterResult('PASSED')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition ${
              filterResult === 'PASSED' ? 'bg-emerald-600 text-white' : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-800'
            }`}
          >
            Passed Events
          </button>
          <button
            onClick={() => setFilterResult('VIOLATION')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition ${
              filterResult === 'VIOLATION' ? 'bg-red-600 text-white' : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-800'
            }`}
          >
            Policy Violations / Blocked
          </button>
        </div>
      </div>

      {/* Logs Table */}
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
                  <th className="py-3 px-4">Timestamp & Event ID</th>
                  <th className="py-3 px-4">Actor</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Reason & Justification</th>
                  <th className="py-3 px-4">Monetary Impact</th>
                  <th className="py-3 px-4">Guardrail Status</th>
                  <th className="py-3 px-4 text-right">Final Outcome</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60 font-mono">
                {filteredLogs.map((log) => {
                  const isViol = log.policy_result === 'VIOLATION' || log.decision === 'BLOCKED' || log.final_result === 'BLOCKED';

                  return (
                    <tr key={log.id} className={`hover:bg-gray-900/40 transition ${isViol ? 'bg-red-950/10' : ''}`}>
                      <td className="py-3 px-4">
                        <span className="text-white font-semibold block">{log.id}</span>
                        <span className="text-[10px] text-gray-500 font-normal">
                          {new Date(log.created_at).toLocaleTimeString()}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-sans">
                        {getActorBadge(log.actor)}
                      </td>

                      <td className="py-3 px-4 font-sans">
                        <span className="text-gray-200 font-semibold block font-mono text-[11px]">
                          {log.action}
                        </span>
                        {log.session_id && (
                          <span className="text-[10px] text-gray-500 block truncate max-w-[120px]">
                            {log.session_id}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 font-sans max-w-[280px]">
                        <p className="text-gray-300 text-xs leading-relaxed line-clamp-2">
                          {log.reason || log.intent || 'System action'}
                        </p>
                        {log.failure_reason && (
                          <p className="text-red-400 text-[11px] font-semibold mt-0.5">
                            Error: {log.failure_reason}
                          </p>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        {log.amount ? (
                          <span className="text-white font-bold text-xs">
                            ₹{log.amount.toLocaleString('en-IN')}
                          </span>
                        ) : (
                          <span className="text-gray-600">-</span>
                        )}
                      </td>

                      <td className="py-3 px-4 font-sans">
                        {log.policy_result === 'PASSED' ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            PASSED
                          </span>
                        ) : log.policy_result === 'VIOLATION' ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-red-500/20 text-red-300 border border-red-500/40">
                            VIOLATION
                          </span>
                        ) : (
                          <span className="text-gray-500 text-[10px] font-mono">N/A</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right font-sans">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold font-mono ${
                          isViol
                            ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        }`}>
                          {log.decision || log.final_result || 'COMPLETED'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
