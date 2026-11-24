import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ArrowRight,
  Package,
  Layers,
  Clock,
  Check,
  X,
  Sparkles
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
    if (!localStorage.getItem('token')) {
      setActions([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await getMerchantActions();
      setActions(res.data?.actions || res.data || []);
    } catch (err) {
      if (err.response?.status !== 401) {
        console.error('Failed to load merchant actions:', err);
      }
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
      setActions(res.data?.actions || res.data || []);
      setFeedbackMessage({
        type: 'success',
        text: `Generated ${res.data?.count || res.data?.actions?.length || 0} recommended actions based on current inventory and sales.`
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
        text: `Executed action: ${res.data?.message || 'Database records successfully updated.'}`
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
    <div className="surface-card p-5 space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#DEE3DC] pb-3">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <h2 className="text-base font-semibold text-[#202923]">Recommended actions</h2>
            <span className="text-[11px] font-medium text-[#234E42] bg-[#EAF4EE] px-2 py-0.5 rounded border border-[#B8D4C4]">
              {pendingCount} pending review
            </span>
          </div>
          <p className="text-xs text-[#6B746E]">
            Data-backed actions derived from sales velocity and stock runway. Explicit merchant confirmation required.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={fetchActions}
            disabled={loading}
            className="px-3 py-1.5 rounded-md bg-white hover:bg-[#F6F5F1] border border-[#DEE3DC] text-[#202923] text-xs font-medium flex items-center gap-1.5 transition-colors shadow-xs disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#6B746E] ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="px-3.5 py-1.5 rounded-md bg-[#234E42] hover:bg-[#1B3D34] text-white font-medium text-xs transition-colors shadow-xs flex items-center gap-1.5 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${generating ? 'animate-spin' : ''}`} />
            <span>{generating ? 'Analyzing data...' : 'Scan & generate'}</span>
          </button>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedbackMessage && (
        <div
          className={`p-3 rounded-md border text-xs flex items-center justify-between gap-2 transition-all ${
            feedbackMessage.type === 'success'
              ? 'bg-[#EAF4EE] border-[#B8D4C4] text-[#347A52]'
              : feedbackMessage.type === 'error'
              ? 'bg-[#FBEFEF] border-[#B94A48]/30 text-[#B94A48]'
              : 'bg-[#F6F5F1] border-[#DEE3DC] text-[#202923]'
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
            className="text-xs text-[#6B746E] hover:text-[#202923]"
          >
            ✕
          </button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 border-b border-[#DEE3DC] pb-2 text-xs">
        {[
          { key: 'PENDING', label: `Pending review (${pendingCount})` },
          { key: 'EXECUTED', label: `Executed (${executedCount})` },
          { key: 'REJECTED', label: 'Dismissed' },
          { key: 'ALL', label: `All (${actions.length})` }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-3 py-1.5 rounded-md font-medium text-xs transition-colors ${
              filter === tab.key
                ? 'bg-[#234E42] text-white shadow-xs'
                : 'text-[#6B746E] hover:text-[#202923] hover:bg-[#EAEDE7]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Actions List */}
      <div className="divide-y divide-[#DEE3DC]">
        {loading && actions.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#6B746E]">
            <RefreshCw className="w-4 h-4 animate-spin mx-auto mb-2 text-[#234E42]" />
            Loading actions...
          </div>
        ) : filteredActions.length > 0 ? (
          filteredActions.map((action) => {
            const isPending = action.status === 'PENDING';
            const isExecuted = action.status === 'EXECUTED';

            return (
              <div
                key={action.id}
                className="py-3.5 flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-[#F6F5F1] text-[#6B746E] border border-[#DEE3DC]">
                      {action.category} • {action.action_type}
                    </span>
                    <span
                      className={`text-[10px] font-medium px-2 py-0.5 rounded ${
                        isPending
                          ? 'bg-[#FDF4EB] text-[#B77932] border border-[#B77932]/20'
                          : isExecuted
                          ? 'bg-[#EAF4EE] text-[#347A52] border border-[#B8D4C4]'
                          : 'bg-[#F6F5F1] text-[#6B746E]'
                      }`}
                    >
                      {action.status}
                    </span>
                  </div>

                  <h3 className="text-sm font-semibold text-[#202923]">{action.title}</h3>
                  <p className="text-xs text-[#6B746E]">{action.description}</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
                    <div className="p-2 rounded bg-[#F6F5F1] border border-[#DEE3DC] text-[11px]">
                      <span className="font-semibold text-[#202923] block mb-0.5">Reason & Evidence:</span>
                      <p className="text-[#6B746E]">{action.evidence}</p>
                    </div>
                    <div className="p-2 rounded bg-[#F6F5F1] border border-[#DEE3DC] text-[11px]">
                      <span className="font-semibold text-[#347A52] block mb-0.5">Projected Impact:</span>
                      <p className="text-[#6B746E]">{action.expected_impact}</p>
                    </div>
                  </div>
                </div>

                {/* Approve / Reject CTA */}
                <div className="flex items-center gap-2 self-start lg:self-center shrink-0">
                  {isPending ? (
                    <>
                      <button
                        onClick={() => setSelectedAction(action)}
                        className="px-3 py-1.5 rounded-md bg-[#234E42] hover:bg-[#1B3D34] text-white font-medium text-xs flex items-center gap-1.5 transition-colors shadow-xs"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Review & approve</span>
                      </button>
                      <button
                        onClick={() => handleReject(action.id, action.title)}
                        className="px-2.5 py-1.5 rounded-md border border-[#DEE3DC] hover:bg-[#FBEFEF] text-[#6B746E] hover:text-[#B94A48] text-xs font-medium transition-colors"
                      >
                        Dismiss
                      </button>
                    </>
                  ) : isExecuted ? (
                    <span className="flex items-center gap-1 text-[11px] font-medium text-[#347A52] bg-[#EAF4EE] px-2.5 py-1 rounded-md border border-[#B8D4C4]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Applied & logged
                    </span>
                  ) : (
                    <span className="text-xs text-[#6B746E]">Dismissed</span>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-8 text-center text-xs text-[#6B746E]">
            No {filter.toLowerCase()} actions found.
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {selectedAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white border border-[#DEE3DC] rounded-xl max-w-lg w-full p-5 space-y-4 shadow-modal animate-in fade-in">
            <div className="flex items-center justify-between border-b border-[#DEE3DC] pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-[#B77932]" />
                <h3 className="text-base font-semibold text-[#202923]">Confirm database modification</h3>
              </div>
              <button
                onClick={() => setSelectedAction(null)}
                className="text-[#6B746E] hover:text-[#202923] text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-[#6B746E] leading-relaxed">
                Executing this action will modify live database records and create an immutable record in the merchant audit log.
              </p>

              <div className="p-3 rounded-lg bg-[#F6F5F1] border border-[#DEE3DC] space-y-1.5">
                <span className="text-[11px] font-semibold text-[#202923] block">Action:</span>
                <p className="font-medium text-[#202923] text-sm">{selectedAction.title}</p>
                <p className="text-xs text-[#6B746E]">{selectedAction.description}</p>
              </div>

              <div className="p-3 rounded-lg bg-[#EAF4EE] border border-[#B8D4C4] space-y-1">
                <span className="text-[11px] font-semibold text-[#347A52] block">State change to apply:</span>
                {selectedAction.action_type === 'REORDER_STOCK' ? (
                  <p className="text-[#202923]">
                    • Increment product stock by <strong>+{selectedAction.payload?.reorder_quantity || 20} units</strong>
                    <br />
                    • Record execution event in <code className="font-mono text-[11px] text-[#234E42]">audit_logs</code>
                  </p>
                ) : selectedAction.action_type === 'DEPLOY_BUNDLE' ? (
                  <p className="text-[#202923]">
                    • Publish affinity bundle in product catalog within policy margin limit (≤ 10% discount).
                  </p>
                ) : (
                  <p className="text-[#202923]">
                    • Apply operational policy update to tenant database records.
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#DEE3DC]">
              <button
                onClick={() => setSelectedAction(null)}
                disabled={executing}
                className="px-3.5 py-1.5 rounded-md border border-[#DEE3DC] hover:bg-[#F6F5F1] text-xs font-medium text-[#6B746E] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmExecute}
                disabled={executing}
                className="px-4 py-1.5 rounded-md bg-[#234E42] hover:bg-[#1B3D34] text-white text-xs font-semibold transition-colors shadow-xs flex items-center gap-1.5 disabled:opacity-50"
              >
                {executing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Updating records...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Confirm & execute</span>
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
