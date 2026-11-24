import React, { useState, useEffect } from 'react';
import {
  Zap,
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  ArrowRight,
  TrendingUp,
  Package,
  Layers,
  ShieldCheck,
  Clock,
  Check,
  X,
  FileText
} from 'lucide-react';
import {
  getMerchantActions,
  generateMerchantActions,
  approveMerchantAction,
  rejectMerchantAction
} from '../services/api';

export default function MerchantActionCenter({ onActionExecuted }) {
  const [actions, setActions] = useState([]);
  const [filter, setFilter] = useState('PENDING'); // 'PENDING' | 'EXECUTED' | 'REJECTED' | 'ALL'
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedAction, setSelectedAction] = useState(null); // for confirmation modal
  const [executing, setExecuting] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState(null);

  const fetchActions = async () => {
    setLoading(true);
    try {
      const res = await getMerchantActions();
      setActions(res.data?.actions || []);
    } catch (err) {
      console.error('Failed to load merchant actions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActions();
  }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await generateMerchantActions();
      setActions(res.data?.actions || []);
      setFeedbackMessage({
        type: 'success',
        text: `Generated ${res.data?.actions?.length || 0} proactive AI directives grounded in current sales and inventory state.`
      });
      setTimeout(() => setFeedbackMessage(null), 5000);
    } catch (err) {
      console.error('Failed to generate actions:', err);
      setFeedbackMessage({
        type: 'error',
        text: 'Failed to generate actions: ' + (err.response?.data?.detail || err.message)
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleConfirmExecute = async () => {
    if (!selectedAction) return;
    setExecuting(true);
    try {
      const res = await approveMerchantAction(selectedAction.id);
      setFeedbackMessage({
        type: 'success',
        text: `Executed action "${selectedAction.title}": ${res.data?.message || 'Database state successfully updated.'}`
      });
      setSelectedAction(null);
      await fetchActions();
      if (onActionExecuted) onActionExecuted();
      setTimeout(() => setFeedbackMessage(null), 6000);
    } catch (err) {
      console.error('Failed to execute action:', err);
      setFeedbackMessage({
        type: 'error',
        text: 'Action execution failed: ' + (err.response?.data?.detail || err.message)
      });
    } finally {
      setExecuting(false);
    }
  };

  const handleReject = async (actionId, title) => {
    try {
      await rejectMerchantAction(actionId);
      setFeedbackMessage({
        type: 'info',
        text: `Dismissed recommendation: "${title}".`
      });
      await fetchActions();
      setTimeout(() => setFeedbackMessage(null), 4000);
    } catch (err) {
      console.error('Failed to reject action:', err);
    }
  };

  const filteredActions = actions.filter((a) => {
    if (filter === 'ALL') return true;
    return a.status === filter;
  });

  const pendingCount = actions.filter((a) => a.status === 'PENDING').length;
  const executedCount = actions.filter((a) => a.status === 'EXECUTED').length;

  return (
    <div className="surface-card p-6 space-y-5 border border-[#F5A524]/30 shadow-lg">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#2A3441] pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase bg-[#F5A524]/10 border border-[#F5A524]/30 text-[#F5A524] px-2 py-0.5 rounded flex items-center gap-1 font-bold">
              <Zap className="w-3 h-3" />
              Proactive Action Center
            </span>
            <span className="text-xs text-[#94A3B8] font-mono">
              {pendingCount} Pending • Verified SQL Evidence
            </span>
          </div>
          <h3 className="text-lg font-bold text-[#F8FAFC]">AI Business Directives & Action Approvals</h3>
          <p className="text-xs text-[#94A3B8]">
            Proactive recommendations derived from live sales velocity, inventory runway, and market basket rules. Every action requires explicit merchant confirmation before database state changes.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={fetchActions}
            disabled={loading}
            className="px-3 py-1.5 rounded-lg bg-[#1C222B] hover:bg-[#242D38] border border-[#2A3441] text-[#94A3B8] hover:text-[#F8FAFC] text-xs font-medium flex items-center gap-1.5 transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="px-3.5 py-1.5 rounded-lg bg-[#F5A524] hover:bg-[#D97706] text-black font-semibold text-xs transition flex items-center gap-1.5 shadow-amber-glow disabled:opacity-50"
          >
            <Sparkles className={`w-3.5 h-3.5 ${generating ? 'animate-spin' : ''}`} />
            <span>{generating ? 'Analyzing...' : 'Generate New Directives'}</span>
          </button>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedbackMessage && (
        <div
          className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-2 transition-all ${
            feedbackMessage.type === 'success'
              ? 'bg-[#10B981]/10 border-[#10B981]/30 text-[#10B981]'
              : feedbackMessage.type === 'error'
              ? 'bg-[#EF4444]/10 border-[#EF4444]/30 text-[#EF4444]'
              : 'bg-[#3B82F6]/10 border-[#3B82F6]/30 text-[#3B82F6]'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedbackMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0" />
            )}
            <span>{feedbackMessage.text}</span>
          </div>
          <button
            onClick={() => setFeedbackMessage(null)}
            className="text-[10px] opacity-70 hover:opacity-100 font-mono"
          >
            ✕
          </button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-[#2A3441] pb-2 text-xs">
        {[
          { key: 'PENDING', label: `Pending Approval (${pendingCount})` },
          { key: 'EXECUTED', label: `Executed (${executedCount})` },
          { key: 'REJECTED', label: 'Dismissed' },
          { key: 'ALL', label: `All (${actions.length})` }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              filter === tab.key
                ? 'bg-[#F5A524]/10 text-[#F5A524] border border-[#F5A524]/30'
                : 'text-[#94A3B8] hover:text-[#F8FAFC]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Action Cards List */}
      <div className="space-y-3">
        {loading && actions.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#94A3B8]">
            <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#F5A524]" />
            Loading proactive directives...
          </div>
        ) : filteredActions.length > 0 ? (
          filteredActions.map((action) => {
            const isPending = action.status === 'PENDING';
            const isExecuted = action.status === 'EXECUTED';
            const isRejected = action.status === 'REJECTED';

            return (
              <div
                key={action.id}
                className={`p-4 rounded-xl border transition-all ${
                  isPending
                    ? 'bg-[#151A21] border-[#2A3441] hover:border-[#F5A524]/40'
                    : isExecuted
                    ? 'bg-[#10B981]/5 border-[#10B981]/20'
                    : 'bg-[#1C222B]/50 border-[#2A3441] opacity-60'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                          action.category === 'INVENTORY'
                            ? 'bg-[#3B82F6]/10 text-[#3B82F6] border border-[#3B82F6]/30'
                            : action.category === 'MERCHANDISING'
                            ? 'bg-[#8B5CF6]/10 text-[#8B5CF6] border border-[#8B5CF6]/30'
                            : 'bg-[#F5A524]/10 text-[#F5A524] border border-[#F5A524]/30'
                        }`}
                      >
                        {action.category} • {action.action_type}
                      </span>

                      <span
                        className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                          isPending
                            ? 'bg-[#F5A524]/20 text-[#F5A524] border border-[#F5A524]/30'
                            : isExecuted
                            ? 'bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30'
                            : 'bg-[#64748B]/20 text-[#64748B]'
                        }`}
                      >
                        {action.status}
                      </span>

                      <span className="text-[10px] text-[#64748B] font-mono">
                        {action.created_at ? new Date(action.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-[#F8FAFC]">{action.title}</h4>
                    <p className="text-xs text-[#94A3B8]">{action.description}</p>

                    {/* Stated Evidence and Expected Impact */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1 text-xs">
                      <div className="p-2.5 rounded-lg bg-[#1C222B] border border-[#2A3441]">
                        <span className="text-[10px] font-mono text-[#F5A524] uppercase block font-bold mb-0.5">
                          Verifiable Evidence
                        </span>
                        <p className="text-[11px] text-[#CBD5E1]">{action.evidence}</p>
                      </div>
                      <div className="p-2.5 rounded-lg bg-[#1C222B] border border-[#2A3441]">
                        <span className="text-[10px] font-mono text-[#10B981] uppercase block font-bold mb-0.5">
                          Projected Business Impact
                        </span>
                        <p className="text-[11px] text-[#CBD5E1]">{action.expected_impact}</p>
                      </div>
                    </div>
                  </div>

                  {/* Actions Buttons */}
                  <div className="flex items-center gap-2 self-start lg:self-center shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-[#2A3441]">
                    {isPending ? (
                      <>
                        <button
                          onClick={() => setSelectedAction(action)}
                          className="px-3.5 py-2 rounded-xl bg-[#F5A524] hover:bg-[#D97706] text-black font-bold text-xs flex items-center gap-1.5 transition shadow-amber-glow"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Review & Execute</span>
                        </button>
                        <button
                          onClick={() => handleReject(action.id, action.title)}
                          className="px-3 py-2 rounded-xl bg-[#1C222B] hover:bg-[#242D38] border border-[#2A3441] text-[#94A3B8] hover:text-[#EF4444] text-xs font-medium flex items-center gap-1 transition"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Dismiss</span>
                        </button>
                      </>
                    ) : isExecuted ? (
                      <div className="flex items-center gap-1.5 text-xs text-[#10B981] font-mono font-bold bg-[#10B981]/10 px-3 py-1.5 rounded-lg border border-[#10B981]/20">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>State Applied & Audited</span>
                      </div>
                    ) : (
                      <span className="text-xs text-[#64748B] font-mono">Dismissed</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-8 text-center space-y-2 border border-dashed border-[#2A3441] rounded-xl">
            <CheckCircle2 className="w-8 h-8 text-[#10B981] mx-auto opacity-70" />
            <p className="text-xs font-semibold text-[#F8FAFC]">No {filter.toLowerCase()} actions</p>
            <p className="text-[11px] text-[#94A3B8]">
              {filter === 'PENDING'
                ? 'All recommended actions have been processed or none are pending.'
                : 'Click "Generate New Directives" to analyze live database metrics.'}
            </p>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {selectedAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#151A21] border border-[#F5A524]/40 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-[#2A3441] pb-3">
              <div className="flex items-center gap-2 text-[#F5A524]">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="text-base font-bold text-[#F8FAFC]">Database Action Confirmation</h3>
              </div>
              <button
                onClick={() => setSelectedAction(null)}
                className="text-[#94A3B8] hover:text-[#F8FAFC] text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-[#F5A524]/10 border border-[#F5A524]/30 text-[#F5A524] space-y-1">
                <span className="font-mono font-bold uppercase text-[10px] block">
                  ⚠️ Direct Database State Mutation
                </span>
                <p className="text-xs text-[#CBD5E1]">
                  You are about to execute a real state modification on your PostgreSQL database. This action cannot be silently undone and will be permanently recorded in the immutable Merchant Audit Trail.
                </p>
              </div>

              <div>
                <span className="text-[10px] font-mono text-[#94A3B8] uppercase block">Action Title</span>
                <p className="font-bold text-[#F8FAFC] text-sm">{selectedAction.title}</p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-lg bg-[#1C222B] border border-[#2A3441]">
                  <span className="text-[10px] font-mono text-[#94A3B8] uppercase block">Action Type</span>
                  <p className="font-mono font-semibold text-[#F5A524]">{selectedAction.action_type}</p>
                </div>
                <div className="p-2.5 rounded-lg bg-[#1C222B] border border-[#2A3441]">
                  <span className="text-[10px] font-mono text-[#94A3B8] uppercase block">Target Category</span>
                  <p className="font-mono font-semibold text-[#F8FAFC]">{selectedAction.category}</p>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-[#1C222B] border border-[#2A3441] space-y-1">
                <span className="text-[10px] font-mono text-[#10B981] uppercase font-bold block">
                  Exact State Change to be Applied:
                </span>
                {selectedAction.action_type === 'REORDER_STOCK' ? (
                  <p className="font-mono text-[#F8FAFC] text-xs">
                    • Increment Product stock by <strong>+{selectedAction.payload?.reorder_quantity || 20} units</strong>
                    <br />
                    • Write immutable log to table <code className="text-[#F5A524]">audit_logs</code>
                  </p>
                ) : selectedAction.action_type === 'DEPLOY_BUNDLE' ? (
                  <p className="font-mono text-[#F8FAFC] text-xs">
                    • Activate commercial bundle recommendation in catalog
                    <br />
                    • Verify discount complies with ≤ 10% maximum margin limit
                  </p>
                ) : (
                  <p className="font-mono text-[#F8FAFC] text-xs">
                    • Execute operational policy directive and record in audit log.
                  </p>
                )}
              </div>

              <div className="p-2.5 rounded-lg bg-[#1C222B] border border-[#2A3441]">
                <span className="text-[10px] font-mono text-[#94A3B8] uppercase block">Projected Impact</span>
                <p className="text-[#CBD5E1]">{selectedAction.expected_impact}</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#2A3441]">
              <button
                onClick={() => setSelectedAction(null)}
                disabled={executing}
                className="px-4 py-2 rounded-xl bg-[#1C222B] hover:bg-[#242D38] border border-[#2A3441] text-[#94A3B8] hover:text-[#F8FAFC] text-xs font-semibold transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmExecute}
                disabled={executing}
                className="px-5 py-2 rounded-xl bg-[#F5A524] hover:bg-[#D97706] text-black font-bold text-xs transition flex items-center gap-1.5 shadow-amber-glow disabled:opacity-50"
              >
                {executing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Executing Database Write...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Confirm & Execute Action</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
