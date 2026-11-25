import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Search,
  ShieldCheck
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

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E8E2DA]">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[#242424] tracking-tight">
            Audit Trail
          </h1>
          <p className="text-xs sm:text-sm text-[#6B6560] mt-1">
            Immutable audit record of merchant actions, agent interactions, and policy enforcement decisions.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          disabled={loading}
          className="px-3.5 py-2 rounded-xl bg-white hover:bg-[#F8F4EE] border border-[#E8E2DA] text-[#242424] text-xs font-semibold flex items-center gap-1.5 transition shadow-sm disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#6B6560] ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Log</span>
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-white border border-[#E8E2DA] rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B6560]" />
          <input
            type="text"
            placeholder="Search by action, reason, actor, or session..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#F8F4EE] border border-[#E8E2DA] text-[#242424] text-xs sm:text-sm rounded-xl pl-10 pr-3.5 py-2 focus:outline-none focus:border-[#783F45] transition placeholder-[#6B6560]"
          />
        </div>

        <div className="flex items-center gap-2">
          {['ALL', 'PASSED', 'VIOLATION'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterResult(status)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${
                filterResult === status
                  ? 'bg-[#783F45] text-white shadow-sm'
                  : 'bg-[#F8F4EE] text-[#6B6560] hover:text-[#242424] border border-[#E8E2DA]'
              }`}
            >
              {status === 'ALL' ? 'All records' : status === 'PASSED' ? 'Passed' : 'Violations'}
            </button>
          ))}
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white border border-[#E8E2DA] rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8F4EE] text-[#6B6560] font-semibold border-b border-[#E8E2DA]">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-3">Actor</th>
                <th className="py-3 px-3">Action</th>
                <th className="py-3 px-3">Policy decision</th>
                <th className="py-3 px-4">Reason & details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E2DA]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-[#6B6560] animate-pulse">
                    Loading activity records...
                  </td>
                </tr>
              ) : filteredLogs.length > 0 ? (
                filteredLogs.map((log) => {
                  const isPassed = log.policy_result === 'PASSED';
                  return (
                    <tr key={log.id} className="hover:bg-[#F8F4EE]/50 transition-colors">
                      <td className="py-3 px-4 text-[#6B6560] font-mono whitespace-nowrap">
                        {log.created_at ? new Date(log.created_at).toLocaleString('en-IN') : 'Recent'}
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-mono text-[11px] text-[#242424] bg-[#F8F4EE] px-2 py-0.5 rounded-full border border-[#E8E2DA]">
                          {log.actor}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-semibold text-[#242424]">
                        {log.action}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                            isPassed
                              ? 'bg-emerald-50 text-[#32734D] border border-emerald-200'
                              : 'bg-rose-50 text-[#B84040] border border-rose-200'
                          }`}
                        >
                          {log.policy_result}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[#6B6560] max-w-md">
                        {log.reason}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-[#6B6560]">
                    No activity logs match your filter.
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
