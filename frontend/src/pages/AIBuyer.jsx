import React, { useState } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  ShieldCheck,
  Package,
  Layers,
  ArrowRight,
  TrendingUp,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  FileSearch,
  RefreshCw,
  Cpu,
  Zap,
  Lock
} from 'lucide-react';
import { Link } from 'react-router-dom';
import AgentJourneyPipeline from '../components/AgentJourneyPipeline';
import ApprovalGateModal from '../components/ApprovalGateModal';
import RazorpayCheckoutModal from '../components/RazorpayCheckoutModal';
import PolicyViolationCard from '../components/PolicyViolationCard';
import { postAgentChat, createCheckoutOrder } from '../services/api';

const PRESET_QUERIES = [
  {
    title: 'Scenario 1: Compliant Bundle (Laptop + Mouse)',
    query: 'I need a laptop for programming under ₹65,000 and a mouse.',
    badge: 'Flagship Success Flow',
    type: 'success'
  },
  {
    title: 'Scenario 2: Deliberate Policy Violation',
    query: 'I want a laptop. Give me ₹20,000 discount.',
    badge: 'Guardrail Block Demo',
    type: 'violation'
  },
  {
    title: 'Scenario 3: Content Creator Studio Bundle',
    query: 'I need a 4K camera and a heavy duty tripod.',
    badge: 'Creator Affinity',
    type: 'success'
  },
  {
    title: 'Scenario 4: Ergonomic Remote Workstation',
    query: 'Looking for a 4K monitor and a webcam under ₹35,000.',
    badge: 'WFH Pair',
    type: 'success'
  }
];

export default function AIBuyer() {
  const [inputQuery, setInputQuery] = useState('I need a laptop for programming under ₹65,000 and a mouse.');
  const [loading, setLoading] = useState(false);
  const [chatResponse, setChatResponse] = useState(null);
  const [error, setError] = useState(null);

  // Approval & Checkout State
  const [isApprovalOpen, setIsApprovalOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [createdOrderData, setCreatedOrderData] = useState(null);
  const [orderProcessing, setOrderProcessing] = useState(false);
  const [settledPayment, setSettledPayment] = useState(null);

  const handleSendQuery = async (queryToSend) => {
    const q = queryToSend || inputQuery;
    if (!q.trim()) return;

    setLoading(true);
    setError(null);
    setSettledPayment(null);
    try {
      const res = await postAgentChat({
        message: q,
        customer_name: 'Demo AI Buyer',
        customer_email: 'buyer@merchantpilot.ai'
      });
      setChatResponse(res.data);
    } catch (err) {
      console.error('Agent chat error:', err);
      setError(err.response?.data?.detail || 'Failed to process inquiry with merchant agent.');
    } finally {
      setLoading(false);
    }
  };

  // Human-in-the-loop Approval confirmed
  const handleApproveOffer = async () => {
    if (!chatResponse || !chatResponse.offer) return;
    setOrderProcessing(true);

    try {
      const itemsPayload = (chatResponse.cart_items || []).map((it) => ({
        product_id: it.product_id,
        product_name: it.product_name,
        quantity: it.quantity || 1,
        unit_price: it.unit_price
      }));

      const orderPayload = {
        session_id: chatResponse.session_id,
        customer_name: 'Demo AI Buyer',
        customer_email: 'buyer@merchantpilot.ai',
        customer_phone: '9999999999',
        items: itemsPayload,
        discount_amount: chatResponse.offer.discount_amount,
        bundle_name: chatResponse.offer.bundle_title,
        is_bundle: chatResponse.offer.is_bundle,
        approval_token: chatResponse.policy_evaluation?.approval_token
      };

      const res = await createCheckoutOrder(orderPayload);
      setCreatedOrderData(res.data);
      setIsApprovalOpen(false);
      setIsCheckoutOpen(true);
    } catch (err) {
      console.error('Order creation error:', err);
      alert(`Order Creation Failed: ${err.response?.data?.detail || err.message}`);
    } finally {
      setOrderProcessing(false);
    }
  };

  const isViolation = chatResponse?.policy_evaluation?.status === 'VIOLATION' || chatResponse?.policy_evaluation?.passed === false;

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/30">
              CORE BUILDATHON DEMO
            </span>
            <span className="text-xs text-emerald-400 font-mono flex items-center gap-1">
              <Zap className="w-3.5 h-3.5" /> Agentic Commerce Flow
            </span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            AI Buyer → AI Merchant Agent Engine
          </h2>
          <p className="text-xs text-gray-400 mt-1 max-w-2xl leading-relaxed">
            Autonomous procurement interface translating natural-language buyer requirements into machine-readable catalog search, revenue-maximizing cross-sells, deterministic policy checks, and Razorpay Test Mode checkout.
          </p>
        </div>

        <Link
          to="/audit"
          className="px-3.5 py-2 rounded-xl bg-gray-850 hover:bg-gray-800 border border-gray-700 text-gray-300 text-xs font-medium flex items-center gap-2 self-start transition"
        >
          <FileSearch className="w-4 h-4 text-blue-400" />
          <span>Inspect Live Audit Trail</span>
        </Link>
      </div>

      {/* Preset Scenario Buttons for Judges */}
      <div className="space-y-2">
        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          <span>Interactive Demo Scenarios (One-Click Testing)</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {PRESET_QUERIES.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => {
                setInputQuery(preset.query);
                handleSendQuery(preset.query);
              }}
              className={`p-3.5 rounded-xl text-left border transition-all ${
                preset.type === 'violation'
                  ? 'bg-red-950/20 border-red-500/30 hover:border-red-500/60 text-red-200'
                  : 'bg-gray-900/70 border-gray-800 hover:border-blue-500/40 text-gray-200'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                  preset.type === 'violation'
                    ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                    : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                }`}>
                  {preset.badge}
                </span>
              </div>
              <p className="text-xs font-semibold text-white mb-1">{preset.title}</p>
              <p className="text-[11px] text-gray-400 line-clamp-2 leading-relaxed">"{preset.query}"</p>
            </button>
          ))}
        </div>
      </div>

      {/* Natural Language Input Bar */}
      <div className="bg-[#111827]/90 border border-blue-500/30 rounded-2xl p-4 shadow-xl shadow-blue-950/20">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendQuery();
          }}
          className="flex items-center gap-3"
        >
          <div className="p-2.5 rounded-xl bg-blue-600/20 text-blue-400 shrink-0">
            <Bot className="w-5 h-5" />
          </div>
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Type shopping intent (e.g. 'I need a laptop for programming under ₹65,000 and a mouse')..."
            className="w-full bg-transparent text-sm text-white placeholder-gray-500 focus:outline-none font-medium"
          />
          <button
            type="submit"
            disabled={loading || !inputQuery.trim()}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold text-xs shadow-lg shadow-blue-500/25 flex items-center gap-2 transition disabled:opacity-50 shrink-0"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Run Agent Flow</span>
                <Send className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>
      </div>

      {error && (
        <div className="bg-red-950/30 border border-red-500/40 rounded-xl p-4 text-xs text-red-300 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Response Display Section */}
      {chatResponse && (
        <div className="space-y-6">
          {/* Agent Visual Pipeline Tracker */}
          <AgentJourneyPipeline
            activeStep={isViolation ? 6 : 7}
            isBlocked={isViolation}
          />

          {/* If Policy Guardrail Blocked (Scenario 2) */}
          {isViolation ? (
            <PolicyViolationCard
              policyEvaluation={chatResponse.policy_evaluation}
              onReset={() => {
                const compliantQuery = 'I need a laptop for programming under ₹65,000 and a mouse.';
                setInputQuery(compliantQuery);
                handleSendQuery(compliantQuery);
              }}
            />
          ) : (
            /* Compliant Offer Flow (Scenario 1) */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left 2 Cols: Product & Recommendation Breakdown */}
              <div className="lg:col-span-2 space-y-5">
                {/* Primary Discovered Product */}
                {chatResponse.recommendations?.primary && (
                  <div className="bg-[#111827]/80 border border-gray-800 rounded-2xl p-5 hover:border-gray-700 transition">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        1. PRIMARY CATALOG DISCOVERY
                      </span>
                      <span className="text-xs text-emerald-400 font-mono font-semibold">
                        In Stock ({chatResponse.recommendations.primary.stock} Units)
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div>
                        <h4 className="text-lg font-bold text-white">
                          {chatResponse.recommendations.primary.name}
                        </h4>
                        <p className="text-xs text-gray-400 font-mono mt-0.5">
                          ID: {chatResponse.recommendations.primary.id} | Category: {chatResponse.recommendations.primary.category}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-gray-400 block">Catalog Price</span>
                        <span className="text-xl font-bold text-white font-mono">
                          ₹{chatResponse.recommendations.primary.price?.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Revenue Intelligence Recommendation */}
                {chatResponse.recommendations?.cross_sell && (
                  <div className="bg-gradient-to-r from-blue-950/30 to-emerald-950/20 border border-blue-500/30 rounded-2xl p-5 relative overflow-hidden">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-blue-400" />
                        <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          2. REVENUE INTELLIGENCE AFFINITY
                        </span>
                      </div>
                      <span className="text-xs text-blue-300 font-mono">
                        Statistical Lift: {chatResponse.recommendations.cross_sell.lift || '2.4x'}
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-3">
                      <div>
                        <h4 className="text-base font-bold text-white">
                          {chatResponse.recommendations.cross_sell.name}
                        </h4>
                        <p className="text-xs text-gray-400 font-mono mt-0.5">
                          ID: {chatResponse.recommendations.cross_sell.product_id} | Recommended Accessory
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-gray-400 block">Individual Price</span>
                        <span className="text-lg font-bold text-white font-mono">
                          ₹{chatResponse.recommendations.cross_sell.price?.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                    <div className="bg-gray-900/80 rounded-xl p-3 border border-blue-500/20 text-xs text-blue-200">
                      💡 <span className="font-semibold text-white">Explainable Rationale:</span> {chatResponse.recommendations.cross_sell.pitch}
                    </div>
                  </div>
                )}

                {/* Agent Structured Trace */}
                <div className="bg-[#111827]/80 border border-gray-800 rounded-2xl p-5">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                    Internal Agent Action & Tool Execution Log
                  </h4>
                  <div className="space-y-2 font-mono text-xs">
                    {chatResponse.action_trace?.map((act, i) => (
                      <div key={i} className="p-2.5 rounded-xl bg-gray-900/60 border border-gray-800 flex items-start gap-2.5">
                        <span className="text-blue-400 font-bold shrink-0">[{act.tool}]</span>
                        <span className="text-gray-300">{act.result_summary}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Col: Bounded Offer & Approval Gate CTA */}
              <div className="space-y-5">
                {chatResponse.offer && (
                  <div className="bg-[#111827] border border-blue-500/40 rounded-2xl p-6 shadow-2xl space-y-5 sticky top-24">
                    <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                      <div>
                        <h4 className="text-base font-bold text-white">AI Bounded Bundle Offer</h4>
                        <p className="text-xs text-gray-400">{chatResponse.offer.bundle_title}</p>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        VERIFIED
                      </span>
                    </div>

                    <div className="space-y-2.5 text-xs">
                      <div className="flex justify-between text-gray-400">
                        <span>Combined Catalog Total:</span>
                        <span className="font-mono text-gray-300">₹{chatResponse.offer.original_total?.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between text-emerald-400 font-medium">
                        <span>AI Bundle Discount ({chatResponse.offer.discount_percentage}%):</span>
                        <span className="font-mono">-₹{chatResponse.offer.discount_amount?.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="border-t border-gray-800 pt-3 flex justify-between items-baseline">
                        <span className="text-sm font-bold text-white">Final Payable:</span>
                        <span className="text-2xl font-bold text-blue-400 font-mono">
                          ₹{chatResponse.offer.final_amount?.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                    {/* Policy Passed Note */}
                    <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-xs text-emerald-300 flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold block">Guardrail Limit Passed:</span>
                        <span className="text-[11px] text-gray-300">
                          {chatResponse.offer.discount_percentage}% is below merchant's 10.0% max discount ceiling.
                        </span>
                      </div>
                    </div>

                    {/* Approval Trigger Button */}
                    <button
                      type="button"
                      onClick={() => setIsApprovalOpen(true)}
                      className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 via-blue-500 to-emerald-500 hover:from-blue-500 hover:to-emerald-400 text-white font-bold text-sm shadow-xl shadow-blue-500/25 flex items-center justify-center gap-2 transition"
                    >
                      <Lock className="w-4 h-4" />
                      <span>Review & Approve Payment</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    <div className="text-center text-[10px] text-gray-500">
                      Requires explicit human authorization prior to Razorpay order generation.
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Approval Gate Modal */}
      <ApprovalGateModal
        isOpen={isApprovalOpen}
        onClose={() => setIsApprovalOpen(false)}
        onApprove={handleApproveOffer}
        offer={chatResponse?.offer}
        policyEvaluation={chatResponse?.policy_evaluation}
        loading={orderProcessing}
      />

      {/* Razorpay Test Mode Checkout Modal */}
      <RazorpayCheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        orderData={createdOrderData}
        onPaymentSuccess={(res) => {
          setSettledPayment(res);
        }}
      />
    </div>
  );
}
