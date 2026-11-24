import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Search,
  Filter,
  ShieldCheck,
  History
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
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E5E5E5]">
        <div>
          <h1 className="text-2xl sm:text-[28px] font-bold text-[#222222] tracking-tight">
            Activity log
          </h1>
          <p className="text-sm text-[#71717A] mt-0.5">
            Immutable audit record of merchant actions, agent interactions, and policy enforcement decisions.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          disabled={loading}
          className="px-3 py-1.5 rounded-md bg-white hover:bg-[#F7F7F5] border border-[#E5E5E5] text-[#222222] text-xs font-medium flex items-center gap-1.5 transition-colors shadow-xs disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#71717A] ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh log</span>
        </button>
      </div>

      {/* Toolbar */}
      <div className="surface-card p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#71717A]" />
          <input
            type="text"
            placeholder="Search by action, reason, actor, or session..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#F7F7F5] border border-[#E5E5E5] text-[#222222] text-xs rounded-md pl-9 pr-3.5 py-2 focus:outline-none focus:border-[#C65D3B] focus:bg-white transition-colors"
          />
        </div>

        <div className="flex items-center gap-1.5">
          {['ALL', 'PASSED', 'VIOLATION'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterResult(status)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                filterResult === status
                  ? 'bg-[#C65D3B] text-white shadow-xs'
                  : 'text-[#71717A] hover:text-[#222222] hover:bg-[#FAF5F2]'
              }`}
            >
              {status === 'ALL' ? 'All records' : status === 'PASSED' ? 'Passed' : 'Violations'}
            </button>
          ))}
        </div>
      </div>

      {/* Logs Table */}
      <div className="surface-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F7F7F5] text-[#71717A] font-medium border-b border-[#E5E5E5]">
              <tr>
                <th className="py-2.5 px-3.5">Timestamp</th>
                <th className="py-2.5 px-3">Actor</th>
                <th className="py-2.5 px-3">Action</th>
                <th className="py-2.5 px-3">Policy decision</th>
                <th className="py-2.5 px-3.5">Reason & details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5E5]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-[#71717A]">
                    Loading activity records...
                  </td>
                </tr>
              ) : filteredLogs.length > 0 ? (
                filteredLogs.map((log) => {
                  const isPassed = log.policy_result === 'PASSED';
                  return (
                    <tr key={log.id} className="hover:bg-[#F7F7F5]/60 transition-colors">
                      <td className="py-2.5 px-3.5 text-[#71717A] font-mono whitespace-nowrap">
                        {log.created_at ? new Date(log.created_at).toLocaleString('en-IN') : 'Recent'}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="font-mono text-[11px] text-[#222222] bg-[#F7F7F5] px-1.5 py-0.5 rounded border border-[#E5E5E5]">
                          {log.actor}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-medium text-[#222222]">
                        {log.action}
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                            isPassed
                              ? 'bg-[#FAF5F2] text-[#347A52] border border-[#F0D5CB]'
                              : 'bg-[#FBEFEF] text-[#B94A48] border border-[#B94A48]/20'
                          }`}
                        >
                          {log.policy_result}
                        </span>
                      </td>
                      <td className="py-2.5 px-3.5 text-[#71717A] max-w-md">
                        {log.reason}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-[#71717A]">
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
